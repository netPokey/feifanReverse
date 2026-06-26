/* modemdr.h — AP 免打扰 ModeMDR 公共 API
 * 规格: weapp-rebuild/FIRMWARE_docs/versions/v9/FIRMWARE_REWRITE_ModeMDR.md
 * 目标: 支持 val=0 滚轮 / val=1 无感 / val=2 滚轮+无感 (8 仅 0; 差异=getter)。
 */
#ifndef MODEMDR_H
#define MODEMDR_H
#include <stdint.h>
#include "tesla_frame.h"

/* ---- 配置 (BLE 0xA3 写入) ----
 * 映射: config[N] = rawConfig[24+N]; ModeMDR = config[5] = rawConfig[29] bit[1:0]。
 * 见 §3 (固件 0xA3 handler @0x0800c330)。*/
#define MDR_BLE_CMD_WRITE_CONFIG  0xA3
#define MDR_BLE_PAYLOAD_LEN       0x4c   /* 76 字节 */
#define MDR_CFG_SETTINGS_OFFSET   0x18   /* payload[0x18]=rawConfig[24] -> config[0] */
#define MDR_CFG_LEN               16

void    modemdr_on_ble_a3(const uint8_t *payload, int len);  /* 写配置 */
uint8_t modemdr_mode(void);    /* getter: (config[5]&3)+1 -> 1/2/3 (9 式; 8 恒 1) */

/* ---- 周期分发 (固件 @0x080022ee) ----
 * s = 免打扰时间参数(秒)。按 ModeMDR bit0(滚轮)/bit1(无感) 独立门控。*/
void    modemdr_dispatch(int s);

/* ---- 逐帧入口 (从 CAN RX 分发器调用) ---- */
void    modemdr_on_can_0x370(const tesla_frame_t *f);  /* 无感: EPAS 转向 re-sign */
void    modemdr_on_can_0x229(const tesla_frame_t *f);  /* 滚轮: SCCM_rightStalk re-sign */

/* ---- 平台需提供的“门/态”读取 (弱符号, 默认实现见 modemdr.c) ---- */
int     mdr_entry_gate(void);     /* 门1 @0x0800029e: 免打扰前置(总开关&AP在用) */
int     mdr_notouch_enabled(void);/* 门2 @0x0800021e: config[4]&8 + 运行态 */
uint8_t mdr_submode(void);        /* 无感子模式 @0x080001ee: 0=摆动 1=恒低 2=恒高 */
int     mdr_scroll_enabled(void); /* 滚轮使能 (gp+0xac) */

/* 测试/调试可见的内部状态 */
extern uint8_t  g_config[MDR_CFG_LEN];
extern uint8_t  g_notouch_active;     /* gp+0xaf */
extern uint8_t  g_notouch_counter;    /* gp+0xb0 (0-3) */

#endif
