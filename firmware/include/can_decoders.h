/* can_decoders.h — 72 ID 逐位解码 (据 v9 PERID; 12 精确公式 + 其余通用捕获) */
#ifndef CAN_DECODERS_H
#define CAN_DECODERS_H
#include "tesla_frame.h"
/* 把所有 72 个 ID 的解码器注册进 can_dispatch。*/
void decoders_register_all(void);
/* 通用捕获: 未精确解析的 ID 把 8 字节原样存入 per-ID 槽 (调试/透传可读)。*/
const uint8_t *decoder_raw_slot(uint16_t id);   /* 返回该 ID 最近一帧 8 字节, 无则 0 */
#endif
