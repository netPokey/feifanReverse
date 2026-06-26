/* signal_state.h — 信号状态表 (固件 0x08000272: idx×12B 条目)
 * CAN 解码写入, 打包器/BLE 读出。这里用平面 gp 变量区 + idx 条目两种视图。*/
#ifndef SIGNAL_STATE_H
#define SIGNAL_STATE_H
#include <stdint.h>
#define SS_GP_SIZE   0x400   /* gp 变量区 (逐位解码写 gp+off) */
#define SS_IDX_COUNT 18      /* STATE 型条目数 (idx 0..17) */
#define SS_IDX_SIZE  12

extern uint8_t g_ss_gp[SS_GP_SIZE];          /* 平面状态区, 按 gp 偏移读写 */
extern uint8_t g_ss_idx[SS_IDX_COUNT][SS_IDX_SIZE]; /* STATE 整帧条目 */

/* gp 区按偏移读写 (小工具) */
static inline void  ss_set8 (uint16_t off, uint8_t v){ g_ss_gp[off]=v; }
static inline uint8_t ss_get8(uint16_t off){ return g_ss_gp[off]; }
void     ss_set16(uint16_t off, uint16_t v);
uint16_t ss_get16(uint16_t off);
/* STATE 型: 整帧 8 字节存入 idx 条目 (data[0..7] -> 条目[0..7]) */
void     ss_store_frame(uint8_t idx, const uint8_t *data8);
#endif
