/* firmware_app.h — 整机集成: 把各模块接成完整数据链路 (端口调这些入口)。*/
#ifndef FIRMWARE_APP_H
#define FIRMWARE_APP_H
#include <stdint.h>
#include "tesla_frame.h"
void fw_init(void);                                 /* 初始化全部模块 + 注册解码/注入 */
void fw_on_ble_write(const uint8_t *buf, int n);    /* GATT 写 → 拆帧 → 命令分发(含鉴权) */
void fw_on_can_rx(const tesla_frame_t *f);          /* CAN RX → 解码/re-sign 分发 */
void fw_tick(int notouch_seconds);                  /* 周期: 免打扰分发 + 仪表/电池轮询推送 */
void fw_set_tx_enabled(int en);                     /* CAN_TX 门禁: 1=NORMAL 0=LISTEN_ONLY */
#endif
