/* ble_proto.h — BLE 透传帧封/拆 (固件实证 §2.5a)
 * 帧: 0x55 0x7F <type> <lenHi> <lenLo> <payload...> <checksum>
 * checksum = (Σ from type to last payload byte) & 0xFF
 */
#ifndef BLE_PROTO_H
#define BLE_PROTO_H
#include <stdint.h>
#define BLE_SOF0 0x55
#define BLE_SOF1 0x7F
#define BLE_MAX_PAYLOAD 256

typedef struct { uint8_t type; uint16_t len; uint8_t payload[BLE_MAX_PAYLOAD]; } ble_msg_t;

/* 拆包: 校验 SOF + checksum, 解出 type/len/payload。成功返回1。*/
int  ble_unpack(const uint8_t *buf, int n, ble_msg_t *out);
/* 封包: 写入 0x55 0x7F type lenHi lenLo payload checksum, 返回总字节数(<0=缓冲不足)。*/
int  ble_pack(uint8_t type, const uint8_t *payload, uint16_t len, uint8_t *out, int cap);
uint8_t ble_checksum(uint8_t type, const uint8_t *payload, uint16_t len);
#endif
