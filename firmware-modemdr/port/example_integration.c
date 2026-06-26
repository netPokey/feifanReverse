/* example_integration.c — 参考: 如何把 ModeMDR 接进你的 CH32V208 + BLE 工程
 * 这是示例/注释, 不参与库编译; 把这三处接进你现有的 main/BLE 回调即可。
 */
#if 0   /* 参考代码; 用你的真实工程上下文替换后再启用 */

#include "mdr_port.h"
#include "modemdr.h"

/* (1) 系统初始化里调一次 (时钟/BLE 栈起来之后) */
int main(void)
{
    /* SystemInit(); ... 时钟、BLE 协议栈、TMOS 初始化 ... */
    MDR_Init();                 /* 配 CAN1 + 注册 TMOS 周期分发 */
    MDR_SetTimeParam(5);        /* 免打扰时窗秒数(可由配置/业务设定) */
    /* Main_Circulation();  TMOS 主循环 */
}

/* (2) BLE GATT 写特征值回调里, 把命令转给 ModeMDR
 *     (你的协议: 首字节或独立字段是命令字; 0xA3=写配置, payload 76B) */
void App_OnGattWrite(const uint8_t *data, uint16_t len)
{
    uint8_t  cmd     = data[0];          /* [BOARD] 按你的帧格式取命令字 */
    const uint8_t *payload = data + 1;   /* 与 setCheckData(163,i)/tx(163,i) 对应 */
    uint16_t plen    = len - 1;
    MDR_OnBleWrite(cmd, payload, plen);  /* cmd==0xA3 时存入 config */
}

/* (3) CAN1 RX 已由 USB_LP_CAN1_RX0_IRQHandler 自动喂核心;
 *     若你用轮询或已有自己的 RX 分发, 改成手动喂:
 *        tesla_frame_t f = { .id=id, .dlc=dlc, .data={...}, .flag=0 };
 *        MDR_FeedRxFrame(&f);
 */

#endif
