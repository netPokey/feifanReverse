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
/* 控制注入激活标志(单一共享, 实证 0x189/0x68c/0x3a1 同读 0x28003fb8; BLE动作置位→脉冲注入)。*/
void    control_set_active(uint8_t v);
uint8_t control_get_active(void);
/* 控制帧逐帧 re-sign 处理器(收到该 ID 帧时, 若标志置位则改写注入)。*/
void control_on_can_0x189(const tesla_frame_t *f);  /* D0=2 */
void control_on_can_0x68c(const tesla_frame_t *f);  /* D3=8 */
void control_on_can_0x3a1(const tesla_frame_t *f);  /* 计数器(D1+1)%15 + D2=0x30 */

/* ---- 整车动作命令缓冲 (镜像固件 RAM 命令槽; 见 CONTROL_INJECTION.md L2) ----
 * 统一 re-sign 模型: 执行器只写槽, 真正改帧在对应被拦截帧的 re-sign handler。
 * BLE 187(0xBB) 动作经 action_map_lookup 路由到对应 setter。*/
void control_cmd_set_gear(uint8_t g);   /* @f38: 1=P 2=R 4=D (固件 a0) */
void control_cmd_set_lock(uint8_t v);   /* @f91: 1=锁 2=解锁 */
void control_cmd_set_door(uint8_t v);   /* @f80: 1..19 门/行李厢/窗子命令 */
uint8_t control_cmd_get_gear(void);
uint8_t control_cmd_get_lock(void);
uint8_t control_cmd_get_door(void);

/* 挡位 re-sign: 拦截 0x229(SCCM_rightStalk) → D1 清 bits[6:4]+计数器低nibble, D2[1:0]=01,
 * D0=表[gear*16+cnt](表 0x08012140 待导出)。构建器 0x08004f74。*/
void control_on_can_0x229_gear(const tesla_frame_t *f);
/* 锁/车身 re-sign: 拦截 0x273(UI_vehicleControl) → 锁→data[2] bits[3:1]=(cmd&7)。
 * 构建器 0x0800725a; 后视镜/窗/前后备厢=@f92..@fa7 其余槽(TODO 逐位)。*/
void control_on_can_0x273(const tesla_frame_t *f);
/* 门/行李厢/窗 re-sign: 拦截 0x1f9 → 据门命令(@f6e)写对应车身字段。构建器 0x08005c64,
 * 跳转表 0x080121a4(24 子命令)。已落常量字段案(11/13/14); 其余取内部子状态槽(@f6f..@f72)逐位待补。*/
void control_on_can_0x1f9(const tesla_frame_t *f);
#endif
