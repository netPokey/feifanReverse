/* firmware_app.c — 整机集成层 (固件两条链路的总装)
 * 读链路: CAN RX → can_dispatch → 72ID 解码 → 状态表 → 打包器 → BLE notify
 * 控链路: BLE 命令 → 鉴权 → router → 控制注入 / 配置 / 免打扰 → CAN_TX(门禁)
 */
#include "firmware_app.h"
#include "ble_app.h"
#include "ble_proto.h"
#include "control.h"
#include "config_store.h"
#include "can_dispatch.h"
#include "can_decoders.h"
#include "can_tx.h"
#include "modemdr.h"
#include "ble_hal.h"

/* 0x229: 既是读链路(SCCM) 又是滚轮注入目标 → 复合处理 */
static void h_can_0x229(const tesla_frame_t *f){ modemdr_on_can_0x229(f); control_on_can_0x229_gear(f); }
static void h_can_0x401(const tesla_frame_t *f){ ble_app_set_cell(f->data); } /* 电芯 mux → 0xD1 */
static void h_can_0x2b4(const tesla_frame_t *f){ ble_app_set_dcdc(f->data); } /* PCS DCDC → 0xD2 */
/* 0xA2 模拟滚轮 → modemdr 滚轮注入 (强符号覆盖 control.c 弱默认) */
void control_scroll(uint8_t dir){ modemdr_scroll_trigger(dir); }

void fw_init(void){
    config_store_init();
    ble_app_init();                         /* 命令字典 + 鉴权 */
    control_init();
    can_dispatch_reset();
    decoders_register_all();                /* 72 ID 解码 */
    can_dispatch_register(0x370, modemdr_on_can_0x370);  /* 无感 EPAS re-sign (覆盖) */
    can_dispatch_register(0x229, h_can_0x229);           /* 滚轮 SCCM re-sign (覆盖) */
    can_dispatch_register(0x401, h_can_0x401);           /* 电芯电压 mux */
    can_dispatch_register(0x2b4, h_can_0x2b4);           /* DCDC */
    can_dispatch_register(0x189, control_on_can_0x189);  /* 控制 re-sign */
    can_dispatch_register(0x68c, control_on_can_0x68c);
    can_dispatch_register(0x3a1, control_on_can_0x3a1);
    can_dispatch_register(0x273, control_on_can_0x273);  /* 锁/车身 re-sign */
    can_dispatch_register(0x1f9, control_on_can_0x1f9);  /* 门/行李厢/窗 re-sign */
    can_tx_set_mode(CAN_TX_LISTEN_ONLY);    /* 默认监听(安全门禁) */
}
void fw_on_ble_write(const uint8_t *buf, int n){
    ble_msg_t m; if (ble_unpack(buf, n, &m)) ble_app_on_msg(&m);
}
void fw_on_can_rx(const tesla_frame_t *f){
    if (ble_app_debug_on()){                  /* 0xC0 调试: 原始帧流上报 */
        uint8_t raw[11]; raw[0]=(uint8_t)(f->id>>8); raw[1]=(uint8_t)f->id; raw[2]=f->dlc;
        for(int i=0;i<8;i++) raw[3+i]=f->data[i];
        ble_hal_notify(0xC0, raw, 11);
    }
    can_dispatch(f);
}
void fw_tick(int s){ modemdr_dispatch(s); ble_app_poll_tick(); }
void fw_set_tx_enabled(int en){ can_tx_set_mode(en ? CAN_TX_NORMAL : CAN_TX_LISTEN_ONLY); }
