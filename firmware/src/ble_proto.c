#include "ble_proto.h"
uint8_t ble_checksum(uint8_t type, const uint8_t *payload, uint16_t len){
    uint8_t s = type;
    s = (uint8_t)(s + (uint8_t)(len >> 8) + (uint8_t)(len & 0xff)); /* 校验覆盖 type 起算 */
    for (uint16_t i = 0; i < len; i++) s = (uint8_t)(s + payload[i]);
    return s;
}
int ble_pack(uint8_t type, const uint8_t *payload, uint16_t len, uint8_t *out, int cap){
    if (len > BLE_MAX_PAYLOAD) return -1;
    int n = 5 + (int)len + 1;
    if (cap < n) return -1;
    out[0]=BLE_SOF0; out[1]=BLE_SOF1; out[2]=type;
    out[3]=(uint8_t)(len>>8); out[4]=(uint8_t)(len&0xff);
    for (uint16_t i=0;i<len;i++) out[5+i]=payload[i];
    out[5+len]=ble_checksum(type,payload,len);
    return n;
}
int ble_unpack(const uint8_t *buf, int n, ble_msg_t *out){
    if (n < 6 || buf[0]!=BLE_SOF0 || buf[1]!=BLE_SOF1) return 0;
    uint16_t len = (uint16_t)((buf[3]<<8) | buf[4]);
    if (len > BLE_MAX_PAYLOAD || n < 5 + (int)len + 1) return 0;
    if (buf[5+len] != ble_checksum(buf[2], buf+5, len)) return 0;
    out->type = buf[2]; out->len = len;
    for (uint16_t i=0;i<len;i++) out->payload[i]=buf[5+i];
    return 1;
}
