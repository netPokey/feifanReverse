/* tesla_frame.h — feifan 内部 CAN 帧结构 + Tesla 加法校验
 * 实证: 内部帧为 12 字节 {u16 id, u8 dlc, u8 data[8], u8 flag}（见 FIRMWARE_REWRITE_ModeMDR.md §3/§8）。
 */
#ifndef TESLA_FRAME_H
#define TESLA_FRAME_H
#include <stdint.h>

typedef struct {
    uint16_t id;        /* [0:2] 标准 CAN ID */
    uint8_t  dlc;       /* [2]   数据长度 (通常 8) */
    uint8_t  data[8];   /* [3:11] 8 字节负载 */
    uint8_t  flag;      /* [11]  发送路由标志 (0=CAN1; 非0=备用路径) */
} tesla_frame_t;

/* 加法校验: (id_hi + id_lo + Σ data[i], i∈[0,dlc) 且 i≠skip) & 0xFF
 * 固件 @0x08006d98。skip 通常为 7 (校验字节自身 = data[7])。*/
uint8_t  tesla_addsum(const tesla_frame_t *f, int skip);
/* 校验帧 data[7] 是否自洽 (接收过滤门 @0x08008736)。*/
int      tesla_checksum_ok(const tesla_frame_t *f);

/* 通用 re-sign (9.bin 实测): D6 滚动计数器(低nibble +1, mask 0xf) + D7 重算校验(加法)。
 * 校验形式按帧族不同(SCCM 等用 CRC8 表; EPAS 0x370 用加法校验, 见 modemdr)。
 * crc 回调返回 D7 值; 传 0 则保留原 D7。*/
typedef uint8_t (*tesla_crc_fn)(const tesla_frame_t *f);
void tesla_resign(tesla_frame_t *f, tesla_crc_fn crc);

/* Tesla CRC8 (poly 0x2F) over data[0..dlc-2] (跳过 D7 校验字节); 多数 SCCM/控制帧用之。*/
uint8_t tesla_crc8(const tesla_frame_t *f);
/* 加法校验回调形式(给 tesla_resign): (IDhi+IDlo+Σdata[0..6])&0xFF */
uint8_t tesla_addsum_d7(const tesla_frame_t *f);

#endif
