/* control.h — 控制注入 (固件 §4): 167跳转表/187执行器 → re-sign 改写 / BLE→CAN 透传 */
#ifndef CONTROL_H
#define CONTROL_H
#include <stdint.h>
#include "tesla_frame.h"
void control_init(void);
/* ble_app 把 0xA7/0xBB/0xA2 转到这里 (强符号覆盖 ble_app 的弱默认)。*/
void control_on_cmd(uint8_t type, const uint8_t *payload, uint16_t len);
/* BLE→CAN 透传: payload=[idHi,idLo,dlc,data...] → 发任意帧 (固件 0x08009a80)。*/
int  control_passthrough(const uint8_t *payload, uint16_t len);
/* re-sign 并发送: D6 计数器 + crc(CRC8/加法) + 过 CAN_TX 门禁。*/
void control_resign_send(tesla_frame_t *f, int use_crc8);
/* 当前待执行动作码 (0=无); 供调试/集成。*/
uint8_t control_pending_action(void);
/* 0xA2 模拟滚轮(1上2右3下4左5确认6长按) 转交 — 弱默认空, 集成接 modemdr。*/
void control_scroll(uint8_t dir);
/* 控制帧 re-sign 激活标志(BLE 动作置位; 对应固件 RAM flag 0x1fffb+0x5xx)。*/
void    control_set_flag(int idx, uint8_t v);
uint8_t control_get_flag(int idx);
enum { CFLAG_189=0, CFLAG_68C, CFLAG_3A1, CFLAG_N };
/* 控制帧逐帧 re-sign 处理器(收到该 ID 帧时, 若标志置位则改写注入)。*/
void control_on_can_0x189(const tesla_frame_t *f);  /* D0=2 */
void control_on_can_0x68c(const tesla_frame_t *f);  /* D3=8 */
void control_on_can_0x3a1(const tesla_frame_t *f);  /* 计数器(D1+1)%15 + D2=0x30 */
#endif
