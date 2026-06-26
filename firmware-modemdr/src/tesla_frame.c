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
