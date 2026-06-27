/* ble_hal.h — BLE 通知出口 (固件 ble_notify 0x08000c02; 端口用 BLE 库实现, host 测试 fake) */
#ifndef BLE_HAL_H
#define BLE_HAL_H
#include <stdint.h>
void ble_hal_notify(uint8_t type, const uint8_t *payload, uint16_t len);
void ble_hal_reboot(void);   /* 165 重启: 端口 NVIC_SystemReset; host 测试 fake */
#endif
