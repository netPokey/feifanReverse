/* control.c — 控制注入框架 (据 TESLA_CAN_PROTOCOL_FIRMWARE §4 / TSL_REFERENCE §2.2-2.4)
 * 完整机制: 动作分发 + re-sign + BLE→CAN 透传。
 * 注: 逐动作码→确切 CAN 帧字节 的全表在固件内部 switch (源文档已注明), 此处为机制 + 动作记录,
 *     精确每动作改写位见 ACTIONS 表的 TODO, 按需逐项补固件反汇编。*/
#include "control.h"
#include "can_tx.h"
#include "ble_hal.h"
#include "actions.h"

static uint8_t s_pending;

__attribute__((weak)) void control_scroll(uint8_t dir){ (void)dir; }  /* 集成接 modemdr 滚轮 */

void control_init(void){ s_pending = 0; }
uint8_t control_pending_action(void){ return s_pending; }

void control_resign_send(tesla_frame_t *f, int use_crc8){
    /* 9.bin 实测: re-sign 用加法校验(use_crc8=0)。CRC8 为通用 Tesla 方案备选, 9.bin 未观测到。*/
    tesla_resign(f, use_crc8 ? tesla_crc8 : tesla_addsum_d7);  /* D6 计数器 + D7 校验 */
    can_tx_send(f);                                            /* 过门禁 */
}

int control_passthrough(const uint8_t *payload, uint16_t len){
    if (len < 3) return 0;
    tesla_frame_t f = {0};
    f.id  = (uint16_t)((payload[0]<<8) | payload[1]);   /* 大端 ID */
    f.dlc = payload[2];
    if (f.dlc > 8 || len < (uint16_t)(3 + f.dlc)) return 0;
    for (int i=0;i<f.dlc;i++) f.data[i] = payload[3+i];
    f.flag = 0;
    return can_tx_send(&f);                             /* 任意帧, 过门禁 */
}

void control_on_cmd(uint8_t type, const uint8_t *payload, uint16_t len){
    switch (type) {
        case 0xA7:                                       /* 167 车辆控制; 执行器 @0x0800e474 */
            if (len) { s_pending = payload[0]; (void)action_lookup(0xA7,payload[0]);
                       uint8_t r[2]={payload[0],1}; ble_hal_notify(0xA7,r,2); }
            break;
        case 0xBB:                                       /* 187 执行动作; 执行器 @0x0800c1b2(查表0x0800d668) */
            if (len) { s_pending = payload[0]; (void)action_lookup(0xBB,payload[0]);
                       ble_hal_notify(0xBB,payload,1); }
            break;
        case 0xA2:                                       /* 162 模拟滚轮 1-6 */
            if (len) control_scroll(payload[0]);
            break;
        default: break;
    }
}
