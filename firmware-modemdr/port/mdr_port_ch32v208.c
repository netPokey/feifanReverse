/* mdr_port_ch32v208.c — WCH CH32V20x SDK 端口实现
 *
 * 依赖(你本地的 SDK/BLE 库):
 *   ch32v20x.h, ch32v20x_can.h, ch32v20x_gpio.h, ch32v20x_rcc.h, ch32v20x_misc.h  (StdPeriphDriver)
 *   CONFIG.h / HAL.h 提供 TMOS: TMOS_ProcessEventRegister / tmos_start_task / MS1_TO_SYSTEM_TIME
 *
 * 实现核心要求的两个 HAL hook (mdr_hal.h) + CAN1 收发 + 周期分发 + BLE 0xA3 接入。
 * 标 [BOARD] 处按你的硬件改 (CAN 引脚/波特率/时钟)。
 */
#include "mdr_port.h"
#include "modemdr.h"
#include "mdr_hal.h"

#include "ch32v20x.h"
#include "ch32v20x_can.h"
#include "ch32v20x_gpio.h"
#include "ch32v20x_rcc.h"
#include "ch32v20x_misc.h"

/* TMOS (来自 CH32V20x_BLE_LIB). 若头文件名不同, 按你的 SDK 调整。*/
#include "CONFIG.h"     /* 通常含 tmos 类型与 MS1_TO_SYSTEM_TIME */
#include "HAL.h"

/* WCH RISC-V 中断属性; host 语法检查时可 -DMDR_ISR_ATTR= 置空 */
#ifndef MDR_ISR_ATTR
#define MDR_ISR_ATTR __attribute__((interrupt("WCH-Interrupt-fast")))
#endif

/* ===== 配置常量 [BOARD] ===== */
#define MDR_CAN              CAN1
#define MDR_CAN_BAUD_500K    1          /* 特斯拉底盘/动力 CAN 多为 500kbps */
#define MDR_DISPATCH_MS      200        /* 周期分发间隔(ms) */

/* ===== TMOS 任务/事件 ===== */
static tmosTaskID mdr_taskID = INVALID_TASK_ID;
#define MDR_EVT_DISPATCH     (1 << 0)   /* 周期分发 */
#define MDR_EVT_CLEAR        (1 << 1)   /* 无感时窗到期清零 */

static mdr_task_cb s_sched_cb = 0;      /* mdr_hal_schedule 暂存的一次性回调 */
static uint8_t     s_time_s   = 5;      /* 免打扰时窗秒数; 见 MDR_SetTimeParam */

/* ============================================================
 *  HAL hook 1: 在 CAN1 发送(回注)一帧  —— 对应固件 0x0800aaa0 -> CAN_Transmit
 * ============================================================ */
void mdr_hal_can1_send(const tesla_frame_t *f)
{
    CanTxMsg tx;
    tx.StdId = f->id;
    tx.ExtId = 0;
    tx.IDE   = CAN_Id_Standard;
    tx.RTR   = CAN_RTR_Data;
    tx.DLC   = f->dlc;
    for (int i = 0; i < 8; i++) tx.Data[i] = f->data[i];

    /* f->flag==0 走 CAN1(常态); 非0为固件备用路径(队列/BLE), 这里按需扩展 */
    uint8_t mbox = CAN_Transmit(MDR_CAN, &tx);
    (void)mbox;   /* 可选: 轮询 CAN_TransmitStatus 等待完成/超时重试 */
}

/* ============================================================
 *  HAL hook 2: delay_ms 后触发一次性回调 —— 对应固件 0x08001124 软件定时器
 * ============================================================ */
void mdr_hal_schedule(mdr_task_cb cb, uint32_t delay_ms)
{
    s_sched_cb = cb;
    if (mdr_taskID != INVALID_TASK_ID)
        tmos_start_task(mdr_taskID, MDR_EVT_CLEAR, MS1_TO_SYSTEM_TIME(delay_ms));
}

/* ============================================================
 *  TMOS 任务处理: 周期分发 + 时窗清零
 * ============================================================ */
static tmosEvents MDR_ProcessEvent(tmosTaskID task_id, tmosEvents events)
{
    if (events & MDR_EVT_DISPATCH) {
        modemdr_dispatch((int)s_time_s);                 /* 固件 0x080022ee */
        tmos_start_task(task_id, MDR_EVT_DISPATCH, MS1_TO_SYSTEM_TIME(MDR_DISPATCH_MS));
        return events ^ MDR_EVT_DISPATCH;
    }
    if (events & MDR_EVT_CLEAR) {
        if (s_sched_cb) { s_sched_cb(); s_sched_cb = 0; } /* notouch_clear: gp+0xaf=0 */
        return events ^ MDR_EVT_CLEAR;
    }
    return 0;
}

/* ============================================================
 *  CAN1 初始化 (GPIO + 时钟 + 滤波 + RX0 中断)  [BOARD: 改引脚/波特率]
 * ============================================================ */
static void MDR_CAN1_Init(void)
{
    GPIO_InitTypeDef g = {0};
    CAN_InitTypeDef  c = {0};
    CAN_FilterInitTypeDef fl = {0};

    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO, ENABLE);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_CAN1, ENABLE);

    /* [BOARD] 示例: CAN1 重映射到 PB8(RX)/PB9(TX); 按你的板子改 */
    GPIO_PinRemapConfig(GPIO_Remap1_CAN1, ENABLE);
    g.GPIO_Pin = GPIO_Pin_8; g.GPIO_Mode = GPIO_Mode_IPU;          /* RX */
    GPIO_Init(GPIOB, &g);
    g.GPIO_Pin = GPIO_Pin_9; g.GPIO_Mode = GPIO_Mode_AF_PP; g.GPIO_Speed = GPIO_Speed_50MHz; /* TX */
    GPIO_Init(GPIOB, &g);

    c.CAN_TTCM = DISABLE; c.CAN_ABOM = ENABLE; c.CAN_AWUM = DISABLE;
    c.CAN_NART = DISABLE; c.CAN_RFLM = DISABLE; c.CAN_TXFP = DISABLE;
    c.CAN_Mode = CAN_Mode_Normal;
    /* [BOARD] 500kbps @ APB1=36MHz: SJW=1,BS1=8,BS2=7,Prescaler=6 -> 36M/6/(1+8+7)=500k */
    c.CAN_SJW = CAN_SJW_1tq; c.CAN_BS1 = CAN_BS1_8tq; c.CAN_BS2 = CAN_BS2_7tq; c.CAN_Prescaler = 6;
    CAN_Init(MDR_CAN, &c);

    /* 收全部 ID (软件再按 ID 分发); 也可精确只放行 0x370/0x229 等 */
    fl.CAN_FilterNumber = 0; fl.CAN_FilterMode = CAN_FilterMode_IdMask;
    fl.CAN_FilterScale = CAN_FilterScale_32bit;
    fl.CAN_FilterIdHigh = 0; fl.CAN_FilterIdLow = 0;
    fl.CAN_FilterMaskIdHigh = 0; fl.CAN_FilterMaskIdLow = 0;
    fl.CAN_FilterFIFOAssignment = CAN_Filter_FIFO0; fl.CAN_FilterActivation = ENABLE;
    CAN_FilterInit(&fl);

    CAN_ITConfig(MDR_CAN, CAN_IT_FMP0, ENABLE);
    NVIC_EnableIRQ(USB_LP_CAN1_RX0_IRQn);
}

/* CAN1 RX0 中断: 取帧 -> 转内部结构 -> 喂核心 */
void USB_LP_CAN1_RX0_IRQHandler(void) MDR_ISR_ATTR;
void USB_LP_CAN1_RX0_IRQHandler(void)
{
    if (CAN_GetITStatus(MDR_CAN, CAN_IT_FMP0) != RESET) {
        CanRxMsg rx;
        CAN_Receive(MDR_CAN, CAN_FIFO0, &rx);
        if (rx.IDE == CAN_Id_Standard && rx.RTR == CAN_RTR_Data) {
            tesla_frame_t f = {0};
            f.id = (uint16_t)rx.StdId; f.dlc = rx.DLC; f.flag = 0;
            for (int i = 0; i < 8; i++) f.data[i] = rx.Data[i];
            MDR_FeedRxFrame(&f);
        }
        CAN_ClearITPendingBit(MDR_CAN, CAN_IT_FMP0);
    }
}

/* 按 ID 把收到的帧分发到核心 (ModeMDR 关心 0x370/0x229; 其余可接你的桥接逻辑) */
void MDR_FeedRxFrame(const tesla_frame_t *f)
{
    switch (f->id) {
        case 0x370: modemdr_on_can_0x370(f); break;   /* 无感: EPAS 转向 re-sign */
        case 0x229: modemdr_on_can_0x229(f); break;   /* 滚轮: SCCM_rightStalk re-sign */
        default: /* MDR_OnOtherFrame(f); 其它 71 个 ID 接整桥逻辑 */ break;
    }
}

/* ============================================================
 *  BLE 0xA3 写配置接入: 在你的 GATT 写回调里调 MDR_OnBleWrite(cmd,payload,len)
 * ============================================================ */
void MDR_OnBleWrite(uint8_t cmd, const uint8_t *payload, uint16_t len)
{
    if (cmd == MDR_BLE_CMD_WRITE_CONFIG)              /* 0xA3 */
        modemdr_on_ble_a3(payload, (int)len);          /* 固件 0x0800c330 */
}

void MDR_SetTimeParam(uint8_t seconds) { s_time_s = seconds; }

/* ============================================================
 *  对外初始化
 * ============================================================ */
void MDR_Init(void)
{
    MDR_CAN1_Init();
    mdr_taskID = TMOS_ProcessEventRegister(MDR_ProcessEvent);
    tmos_start_task(mdr_taskID, MDR_EVT_DISPATCH, MS1_TO_SYSTEM_TIME(MDR_DISPATCH_MS));
}

/* ============================================================
 *  门/态 强符号覆盖 (核心里是弱默认). 按真实条件细化:
 * ============================================================ */
int mdr_entry_gate(void)       { return 1; }   /* TODO: 免打扰总开关 && AP 在用 */
int mdr_notouch_enabled(void)  { return (g_config[4] & 0x08) ? 0 : 1; } /* config[4] bit3 + 运行态 */
uint8_t mdr_submode(void)      { return 0; }   /* 0=摆动(默认) 1=恒低 2=恒高 */
int mdr_scroll_enabled(void)   { return 1; }   /* TODO: 滚轮使能(gp+0xac 对应配置) */
