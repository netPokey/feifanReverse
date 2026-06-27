/* ble_app.c — 命令字典 160–240 (据 BLE_PROTOCOL_DEEP_ANALYSIS §4/§5) */
#include "ble_app.h"
#include "ble_router.h"
#include "ble_auth.h"
#include "ble_hal.h"
#include "packer.h"
#include "modemdr.h"
#include "config_store.h"
#include <string.h>

static uint8_t s_devinfo[18];      /* 设备信息帧(≥18B); [0]=hw_ver 等, 由 0xA3/查询填 */
static uint8_t s_gauge_poll, s_batt_poll, s_cell_poll, s_dcdc_poll, s_debug;
static uint8_t s_cell[8], s_dcdc[8];
void ble_app_set_cell(const uint8_t *d8){ for(int i=0;i<8;i++) s_cell[i]=d8[i]; }
void ble_app_set_dcdc(const uint8_t *d8){ for(int i=0;i<8;i++) s_dcdc[i]=d8[i]; }
int  ble_app_debug_on(void){ return s_debug; }

__attribute__((weak)) void control_on_cmd(uint8_t t, const uint8_t *p, uint16_t n){ (void)t;(void)p;(void)n; }

static void h_a8(const ble_msg_t *m){            /* 鉴权 */
    uint8_t r = 255;
    if (m->len>=4){ int v=ble_auth_check(m->payload); r=(uint8_t)(v==1?1:v==254?254:0); }
    ble_hal_notify(0xA8, &r, 1);
    if (r==1) ble_hal_notify(0xA0, s_devinfo, sizeof s_devinfo);  /* 成功补发设备信息 */
}
static void h_a0(const ble_msg_t *m){ (void)m; ble_hal_notify(0xA0, s_devinfo, sizeof s_devinfo); }
static void h_a3(const ble_msg_t *m){            /* 写经典设置 */
    if (m->len) { uint16_t n=m->len>sizeof s_devinfo?sizeof s_devinfo:m->len; memcpy(s_devinfo,m->payload,n); }
    config_write(m->payload, m->len);            /* 全量设备配置 */
    modemdr_on_ble_a3(m->payload, m->len);       /* 免打扰配置切片 */
    ble_hal_notify(0xA0, s_devinfo, sizeof s_devinfo);  /* 回读 */
}
static void h_b0(const ble_msg_t *m){ s_gauge_poll = (m->len && m->payload[0]); }
static void h_d0(const ble_msg_t *m){ s_batt_poll  = (m->len && m->payload[0]); }
static void h_ctrl(const ble_msg_t *m){ control_on_cmd(m->type, m->payload, m->len); }
/* 256B 块配置: payload[0]=2 读组 / 否则 [0]=1,[1]=组,[2..] 256B 写 */
static void h_block(const ble_msg_t *m){
    cfg_block_kind_t k = m->type==0xAB?BLK_SHORTCUT : m->type==0xB9?BLK_RGB : BLK_BTN;
    if (m->len>=1 && m->payload[0]==2){
        uint8_t g = m->len>=2?m->payload[1]:0; const uint8_t *b=config_block(k,g);
        if (b) ble_hal_notify(m->type, b, CFG_BLOCK_LEN);
    } else if (m->len>=2+CFG_BLOCK_LEN && m->payload[0]==1){
        config_block_write(k, m->payload[1], m->payload+2);
    }
}

static void h_a5(const ble_msg_t *m){ (void)m; ble_hal_reboot(); }             /* 165 重启(14B UID) */
static void h_a9(const ble_msg_t *m){                                          /* 169 改密(需鉴权) */
    uint8_t r=0; if (m->len>=4){ ble_auth_set_password(m->payload); r=1; } ble_hal_notify(0xA9,&r,1); }
static void h_c0(const ble_msg_t *m){ s_debug = (m->len && m->payload[0]); }   /* 192 调试监听 raw 流 */
static void h_c1(const ble_msg_t *m){ (void)m; ble_hal_notify(0xC1, s_devinfo, sizeof s_devinfo); } /* 193 车型查询 */
static void h_d1(const ble_msg_t *m){ s_cell_poll = (m->len && m->payload[0]); } /* 209 电芯 */
static void h_d2(const ble_msg_t *m){ s_dcdc_poll = (m->len && m->payload[0]); } /* 210 DCDC */

void ble_app_init(void){
    ble_auth_init(); config_store_init(); ble_router_reset();
    ble_router_register(0xA8, h_a8);
    ble_router_register(0xA0, h_a0);
    ble_router_register(0xA3, h_a3);
    ble_router_register(0xB0, h_b0);
    ble_router_register(0xD0, h_d0);
    ble_router_register(0xA7, h_ctrl);   /* 车辆控制 -> Phase D */
    ble_router_register(0xBB, h_ctrl);   /* 执行动作 */
    ble_router_register(0xA2, h_ctrl);   /* 模拟滚轮 */
    ble_router_register(0xAB, h_block);  /* 171 快捷指令 256B */
    ble_router_register(0xB9, h_block);  /* 185 RGB 256B */
    ble_router_register(0xBA, h_block);  /* 186 蓝牙按钮 256B */
    ble_router_register(0xA5, h_a5);     /* 165 重启 */
    ble_router_register(0xA9, h_a9);     /* 169 改密 */
    ble_router_register(0xC0, h_c0);     /* 192 调试监听 */
    ble_router_register(0xC1, h_c1);     /* 193 车型查询 */
    ble_router_register(0xD1, h_d1);     /* 209 电芯电压 */
    ble_router_register(0xD2, h_d2);     /* 210 DCDC */
    /* 0xF0 蓝牙主机配对: BLE 中心角色, 端口接 BLE 库(留桩) */
}
void ble_app_on_msg(const ble_msg_t *m){
    /* 鉴权门: 除 168 外, 未鉴权一律拒绝 (固件按密码门控所有指令, §5) */
    if (m->type != 0xA8 && !ble_auth_is_authed()) return;
    ble_router_dispatch(m);
}
void ble_app_poll_tick(void){
    if (s_gauge_poll){ uint8_t g[PACK_GAUGE_LEN]; pack_gauge(g); ble_hal_notify(0xB0, g, sizeof g); }
    if (s_batt_poll){  uint8_t b[PACK_BATTERY_LEN]; pack_battery(b); ble_hal_notify(0xD0, b, sizeof b); }
    if (s_cell_poll){  ble_hal_notify(0xD1, s_cell, 8); }   /* 电芯 mux 8B */
    if (s_dcdc_poll){  ble_hal_notify(0xD2, s_dcdc, 8); }   /* DCDC 8B */
}
