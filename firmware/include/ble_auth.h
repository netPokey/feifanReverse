/* ble_auth.h — 设备蓝牙密码鉴权 (命令 168, 默认 "1234"; 固件按密码门控所有指令) */
#ifndef BLE_AUTH_H
#define BLE_AUTH_H
#include <stdint.h>
void ble_auth_init(void);
int  ble_auth_is_authed(void);
/* 校验 4 字节密码; 返回 1=对 0=错 254=锁定(失败超限)。*/
int  ble_auth_check(const uint8_t pwd[4]);
void ble_auth_set_password(const uint8_t pwd[4]);
void ble_auth_reset_window(void);   /* 端口每小时调一次, 清失败计数 */
#endif
