/* ble_app.h — BLE 命令字典(160–240) 应用层: 注册 handler + 鉴权门 + 轮询 */
#ifndef BLE_APP_H
#define BLE_APP_H
#include "ble_proto.h"
void ble_app_init(void);                 /* 注册所有命令 handler */
void ble_app_on_msg(const ble_msg_t *m); /* 端口拆帧后入口(含鉴权门) */
void ble_app_poll_tick(void);            /* 周期: 若开启则推送仪表/电池/电芯/DCDC */
void ble_app_set_cell(const uint8_t *d8); /* 0x401 电芯 mux 帧 → 供 0xD1 轮询 */
void ble_app_set_dcdc(const uint8_t *d8); /* DCDC 帧 → 供 0xD2 轮询 */
int  ble_app_debug_on(void);              /* 0xC0 调试监听开关 */
/* 控制类命令(167/187/162)转交控制模块(Phase D); 默认弱实现为空。*/
void control_on_cmd(uint8_t type, const uint8_t *payload, uint16_t len);
#endif
