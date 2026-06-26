/* ble_app.c — 命令字典 160–240 (据 BLE_PROTOCOL_DEEP_ANALYSIS §4/§5) */
#include "ble_app.h"
#include "ble_router.h"
#include "ble_auth.h"
#include "ble_hal.h"
#include "packer.h"
#include "modemdr.h"
#include <string.h>

static uint8_t s_devinfo[18];      /* 设备信息帧(≥18B); [0]=hw_ver 等, 由 0xA3/查询填 */
static uint8_t s_gauge_poll, s_batt_poll;

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
    modemdr_on_ble_a3(m->payload, m->len);       /* 免打扰配置切片 */
    ble_hal_notify(0xA0, s_devinfo, sizeof s_devinfo);  /* 回读 */
}
static void h_b0(const ble_msg_t *m){ s_gauge_poll = (m->len && m->payload[0]); }
static void h_d0(const ble_msg_t *m){ s_batt_poll  = (m->len && m->payload[0]); }
static void h_ctrl(const ble_msg_t *m){ control_on_cmd(m->type, m->payload, m->len); }

void ble_app_init(void){
    ble_auth_init(); ble_router_reset();
    ble_router_register(0xA8, h_a8);
    ble_router_register(0xA0, h_a0);
    ble_router_register(0xA3, h_a3);
    ble_router_register(0xB0, h_b0);
    ble_router_register(0xD0, h_d0);
    ble_router_register(0xA7, h_ctrl);   /* 车辆控制 -> Phase D */
    ble_router_register(0xBB, h_ctrl);   /* 执行动作 */
    ble_router_register(0xA2, h_ctrl);   /* 模拟滚轮 */
}
void ble_app_on_msg(const ble_msg_t *m){
    /* 鉴权门: 除 168 外, 未鉴权一律拒绝 (固件按密码门控所有指令, §5) */
    if (m->type != 0xA8 && !ble_auth_is_authed()) return;
    ble_router_dispatch(m);
}
void ble_app_poll_tick(void){
    if (s_gauge_poll){ uint8_t g[PACK_GAUGE_LEN]; pack_gauge(g); ble_hal_notify(0xB0, g, sizeof g); }
    if (s_batt_poll){  uint8_t b[PACK_BATTERY_LEN]; pack_battery(b); ble_hal_notify(0xD0, b, sizeof b); }
}
