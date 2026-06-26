/* modemdr.c — AP 免打扰 ModeMDR 业务逻辑 (可移植 C, 与 SDK 解耦)
 * 规格/实证地址: weapp-rebuild/FIRMWARE_docs/versions/v9/FIRMWARE_REWRITE_ModeMDR.md
 */
#include "modemdr.h"
#include "mdr_hal.h"
#include <string.h>

uint8_t g_config[MDR_CFG_LEN];
uint8_t g_notouch_active;     /* gp+0xaf */
uint8_t g_notouch_counter;    /* gp+0xb0 (0-3) */

/* 滚轮指令缓冲 (固件 RAM @≈0x28003f38) */
static struct { uint8_t pending, type, amount, param; } s_scroll;

/* 无感振荡表 (固件 @0x08012c10): {+150,+180,-150,-180}, 中心 2050 */
static const int16_t MDR_OSC[4] = { +150, +180, -150, -180 };
#define MDR_CENTER 2050

/* ---- 弱默认“门/态”实现; CH32V208 平台用强符号覆盖 ----
 * (在 host 测试里由 test 提供强符号以可控注入条件) */
__attribute__((weak)) int     mdr_entry_gate(void)       { return 1; }
__attribute__((weak)) int     mdr_notouch_enabled(void)  { return 1; }
__attribute__((weak)) uint8_t mdr_submode(void)          { return 0; }
__attribute__((weak)) int     mdr_scroll_enabled(void)   { return 1; }

/* ---- BLE 0xA3 写配置 (固件 @0x0800c330) ----
 * payload 76B; 设置区 payload[0x18..0x28] -> config[0..15]; ModeMDR=config[5]. */
void modemdr_on_ble_a3(const uint8_t *payload, int len) {
    if (len != MDR_BLE_PAYLOAD_LEN) return;
    memcpy(g_config, payload + MDR_CFG_SETTINGS_OFFSET, MDR_CFG_LEN);
}

/* ---- ModeMDR getter (9 式 @0x080001de; 8 恒返回 1) ---- */
uint8_t modemdr_mode(void) {
    return (uint8_t)((g_config[5] & 0x3) + 1);   /* 1=滚轮 / 2=无感 / 3=两者 */
}

static void notouch_clear(void) { g_notouch_active = 0; }  /* 定时回调 0x08001f74 */

/* ---- 周期分发 (固件 @0x080022ee); s=免打扰时间参数(秒) ---- */
void modemdr_dispatch(int s) {
    if (mdr_entry_gate() != 1) return;
    uint8_t m = modemdr_mode();

    if (m & 0x1) {                                /* 滚轮分支 0x08002204 */
        if (mdr_scroll_enabled()) {
            s_scroll.pending = 1; s_scroll.type = 3;
            s_scroll.amount  = 0; s_scroll.param = 1;
        }
    }
    if (m & 0x2) {                                /* 无感分支 0x0800231c */
        if (!mdr_notouch_enabled() || s == 0) return;
        if ((g_config[3] & 0xf) == 0xf) return;   /* 时间禁用哨兵 */
        g_notouch_counter = (uint8_t)((g_notouch_counter + 1) & 3);
        g_notouch_active  = 1;                     /* gp+0xaf */
        mdr_hal_schedule(notouch_clear, (uint32_t)s * 1000u);  /* 激活时窗 */
    }
}

/* ---- 无感注入: 每帧 0x370 re-sign on CAN1 (函数A @0x08002054) ---- */
void modemdr_on_can_0x370(const tesla_frame_t *f) {
    if (!tesla_checksum_ok(f)) return;            /* 门 @0x08008736 */
    if (!g_notouch_active)     return;            /* gp+0xaf 激活窗 @0x080021e2 */

    tesla_frame_t t = *f;
    uint16_t v = (uint16_t)(((t.data[2] & 0xf) << 8) | t.data[3]);  /* 当前 12 位转向值 */
    if ((uint16_t)(v - 0x7a9) > 0xb2) return;     /* 仅近中位才伪造 */

    uint16_t nv;
    switch (mdr_submode()) {
        case 1:  nv = 0x7a8; break;               /* 恒低 */
        case 2:  nv = 0x85c; break;               /* 恒高 */
        default: nv = (uint16_t)(MDR_OSC[g_notouch_counter & 3] + MDR_CENTER); /* 摆动 */
    }
    t.data[3] = (uint8_t)(nv & 0xff);
    t.data[2] = (uint8_t)((t.data[2] & 0xf0) | ((nv >> 8) & 0xf));
    t.data[4] = (uint8_t)((t.data[4] & 0x3f) | 0x40);                  /* 有效位=01 */
    t.data[6] = (uint8_t)((t.data[6] & 0xf0) | ((t.data[6] + 1) & 0xf)); /* 计数器++ */
    t.data[7] = tesla_addsum(&t, 7);              /* 加法校验 */
    mdr_hal_can1_send(&t);                        /* CAN1 回注, 原 ID 0x370 */
}

/* ---- 滚轮注入: SCCM_rightStalk 0x229 re-sign (结构骨架, @0x08004f58) ----
 * 精确编码见 §6; data[0] 取自滚轮量表 @0x08012140 (待导出)。
 * 注: SCCM 帧校验形式需确认 (可能是 Tesla CRC8 而非加法校验) — 见 README TODO。*/
void modemdr_on_can_0x229(const tesla_frame_t *f) {
    if (!s_scroll.pending) return;
    tesla_frame_t t = *f;
    t.data[2] = (uint8_t)((t.data[2] & 0xfc) | 0x1);                   /* 滚轮字段置位 */
    t.data[1] = (uint8_t)((t.data[1] & 0xf0) | ((t.data[1] + 1) & 0xf)); /* 计数器++ */
    /* t.data[0] = scroll_roll_table[idx];   // TODO: 导出 0x08012140 */
    t.data[7] = tesla_addsum(&t, 7);              /* 占位; 待确认校验形式 */
    mdr_hal_can1_send(&t);
    s_scroll.pending = 0;
}
