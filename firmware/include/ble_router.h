/* ble_router.h — BLE 命令字(type 160..240)路由 (固件命令分发器 0x0800957e 的可插拔等价) */
#ifndef BLE_ROUTER_H
#define BLE_ROUTER_H
#include "ble_proto.h"
typedef void (*ble_handler_fn)(const ble_msg_t *m);
void ble_router_reset(void);
int  ble_router_register(uint8_t type, ble_handler_fn h);
void ble_router_dispatch(const ble_msg_t *m);
#endif
