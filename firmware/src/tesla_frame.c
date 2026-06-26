#include "tesla_frame.h"

uint8_t tesla_addsum(const tesla_frame_t *f, int skip) {
    uint8_t s = (uint8_t)((f->id >> 8) + (f->id & 0xff));
    for (int i = 0; i < f->dlc; i++)
        if (i != skip) s = (uint8_t)(s + f->data[i]);
    return s;
}

int tesla_checksum_ok(const tesla_frame_t *f) {
    return f->data[7] == tesla_addsum(f, 7);
}

void tesla_resign(tesla_frame_t *f, tesla_crc_fn crc){
    f->data[6] = (uint8_t)((f->data[6] & 0xf0) | ((f->data[6]+1) & 0xf)); /* D6 计数器低nibble+1 (9.bin) */
    if (crc) f->data[7] = crc(f);                /* D7 加法校验(9.bin 实测; 个别帧不重算) */
}

uint8_t tesla_crc8(const tesla_frame_t *f){
    uint8_t crc = 0xFF;                 /* Tesla CRC8: poly 0x2F, init 0xFF */
    int n = f->dlc>0 ? f->dlc-1 : 0;    /* 覆盖 D0..D(dlc-2), D7 为校验位 */
    for (int i=0;i<n;i++){
        crc ^= f->data[i];
        for (int b=0;b<8;b++) crc = (uint8_t)((crc & 0x80) ? (crc<<1)^0x2F : (crc<<1));
    }
    return crc;
}

uint8_t tesla_addsum_d7(const tesla_frame_t *f){ return tesla_addsum(f, 7); }
