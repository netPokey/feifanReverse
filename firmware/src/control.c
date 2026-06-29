/* control.c — 控制注入框架 (据 TESLA_CAN_PROTOCOL_FIRMWARE §4 / TSL_REFERENCE §2.2-2.4)
 * 完整机制: 动作分发 + re-sign + BLE→CAN 透传。
 * 注: 逐动作码→确切 CAN 帧字节 的全表在固件内部 switch (源文档已注明), 此处为机制 + 动作记录,
 *     精确每动作改写位见 ACTIONS 表的 TODO, 按需逐项补固件反汇编。*/
#include "control.h"
#include "can_tx.h"
#include "ble_hal.h"
#include "actions.h"
#include <string.h>

static uint8_t s_pending;
static uint8_t s_active;   /* 共享控制注入标志 (固件 0x28003fb8) */
void    control_set_active(uint8_t v){ s_active = v; }
uint8_t control_get_active(void){ return s_active; }

/* ---- 整车动作命令缓冲 (镜像固件 RAM 命令槽 @f38/@f91/@f80; CONTROL_INJECTION.md L2) ---- */
static struct { uint8_t gear, lock, door; } s_cmd;
void    control_cmd_set_gear(uint8_t g){ s_cmd.gear = g; }
void    control_cmd_set_lock(uint8_t v){ s_cmd.lock = v; }
void    control_cmd_set_door(uint8_t v){ s_cmd.door = v; }
uint8_t control_cmd_get_gear(void){ return s_cmd.gear; }
uint8_t control_cmd_get_lock(void){ return s_cmd.lock; }
uint8_t control_cmd_get_door(void){ return s_cmd.door; }

/* 控制帧 re-sign (固件实证 0x08008a5c/0x08008a98/0x08008aae):
 * 收到目标帧→若激活标志置位→改写指定字节→原 ID 回注 CAN1(过门禁)。
 * ★ 步①发现: 激活标志 0x28003fb8 由 *AP/免打扰 调度器* 脉冲置位(setter 0x080088ae,
 *   唯一调用者 0x0800236e=免打扰 dispatcher 出口; ~1000ms 后回调 0x080086b4 清零)。
 *   故 0x189/0x68c/0x3a1 属 *AP 控制* re-sign(随 AP 状态注入), 非 BLE 整车动作触发。
 *   整车动作(187 gear/lock/lights)路径另在: 187→查表 0x0800d668→0x0800c1b2→执行 0x0800bffe(含4字节鉴权key)。*/
void control_on_can_0x189(const tesla_frame_t *f){       /* 0x08008a5c */
    if (!s_active) return;
    tesla_frame_t t = *f; t.data[0] = 2; can_tx_send(&t);
}
void control_on_can_0x68c(const tesla_frame_t *f){       /* 0x08008a98 */
    if (!s_active) return;
    tesla_frame_t t = *f; t.data[3] = 8; can_tx_send(&t);
}
void control_on_can_0x3a1(const tesla_frame_t *f){       /* 0x08008aae */
    if (!s_active) return;
    tesla_frame_t t = *f;
    t.data[1] = (uint8_t)((t.data[1] + 1) % 15);         /* 计数器 mod 15 */
    t.data[2] = 0x30;
    /* t.data[?] = vcfront_table[idx];  // TODO 导出 0x080125e0 */
    can_tx_send(&t);
}

/* 挡位 re-sign — 拦截 0x229(SCCM_rightStalk), 构建器 0x08004f74 (CONTROL_INJECTION.md 控制映射表)。
 * 固件: D1 清 bits[6:4] + 计数器低 nibble; D2[1:0]=01(有效); D0=表[gear*16+cnt](表 0x08012140 待导出)。
 * gear 槽非 0 即注入(模拟拨杆保持位); 由新挡位命令或外部清。*/
/* 挡位 stalk 量表 0x08012140 (已导出): data[0]=表[gearcode*16+counter], gearcode P=5/R=2/D=4 → 行 0x50/0x20/0x40。
 * 固件另有 mod-3 帧子计数 @f3a((@f3a+1)%3): 每 3 帧发 1 active 挡位帧(其余 filler 用 row0); 此处直发 active。*/
static const uint8_t GEAR_D0_R[16]={0xa9,0xab,0xbd,0x82,0xac,0xae,0x32,0x16,0xa3,0x4a,0x19,0x63,0xa6,0xc0,0xde,0xd4};
static const uint8_t GEAR_D0_D[16]={0xb7,0xb5,0xa3,0x9c,0xb2,0xb0,0x2c,0x08,0xbd,0x54,0x07,0x7d,0xb8,0xde,0xc0,0xca};
static const uint8_t GEAR_D0_P[16]={0xaf,0xad,0xbb,0x84,0xaa,0xa8,0x34,0x10,0xa5,0x4c,0x1f,0x65,0xa0,0xc6,0xd8,0xd2};
void control_on_can_0x229_gear(const tesla_frame_t *f){
    const uint8_t *d0;
    switch (s_cmd.gear) {                                                 /* 命令值 1=P 2=R 4=D → 行 */
        case 2:  d0 = GEAR_D0_R; break;
        case 4:  d0 = GEAR_D0_D; break;
        case 1:  d0 = GEAR_D0_P; break;
        default: return;
    }
    tesla_frame_t t = *f;
    uint8_t d1  = (uint8_t)(t.data[1] & 0x8f);                            /* 清 bits[6:4] */
    uint8_t cnt = (uint8_t)((d1 + 1) & 0xf);                              /* 计数器(低 nibble) */
    t.data[1] = (uint8_t)((d1 & 0xf0) | cnt);
    t.data[2] = (uint8_t)((t.data[2] & 0xfc) | 0x1);                      /* D2[1:0]=01 有效 */
    t.data[0] = d0[cnt];                                                  /* 表 0x08012140 → D0(已填) */
    can_tx_send(&t);                                                      /* 原 ID 0x229 回注 */
}

/* 锁/车身 re-sign — 拦截 0x273(UI_vehicleControl), 构建器 0x0800725a。
 * 固件: 锁命令(@f91) → data[2] bits[3:1]=(cmd&7); 解锁(2)另触发蜂鸣。
 * 后视镜/窗/前后备厢 = @f92..@fa7 其余槽, 逐位映射见 CONTROL_INJECTION.md (TODO)。*/
void control_on_can_0x273(const tesla_frame_t *f){
    if (!s_cmd.lock) return;                                   /* 暂只接锁槽(车身其余槽 TODO) */
    tesla_frame_t t = *f;
    uint8_t field = (uint8_t)(s_cmd.lock & 7);
    t.data[2] = (uint8_t)((t.data[2] & ~0x0e) | (field << 1)); /* data[2] bits[3:1] */
    can_tx_send(&t);                                           /* 原 ID 0x273 回注; 计数器/校验待确认 */
    s_cmd.lock = 0;                                            /* 固件 sb zero,@f91 消费 */
}

/* 门/行李厢/窗 re-sign — 拦截 0x1f9, 构建器 0x08005c64 + 跳转表 0x080121a4(door cmd-1 索引)。
 * 每门子命令把一个字段写进 0x1f9 data[0..2] 后 send(0x08005cca), 无 counter/校验重算(faithful)。
 * 已落 *常量字段* 案(逆向确证); 取内部子状态槽(@f6f..@f72)的案(1/2/4/5/7/8/10/16-24)字段结构见
 * CONTROL_INJECTION.md, 值需建模内部子状态 → 标 TODO。data[N] 在帧偏移 3+N。*/
void control_on_can_0x1f9(const tesla_frame_t *f){
    if (!s_cmd.door) return;
    tesla_frame_t t = *f;
    switch (s_cmd.door) {
        case 11: case 12:                                     /* 后视镜? data[1] bit7=1 */
            t.data[1] = (uint8_t)((t.data[1] & 0x3f) | 0x80);
            break;
        case 13:                                              /* 全门关(action 133): 三字段常量 */
            t.data[0] = (uint8_t)((t.data[0] & 0x1f) | 0xc0);
            t.data[1] = 0xb6;
            t.data[2] = (uint8_t)((t.data[2] & 0xf0) | 0x0d);
            break;
        case 14:                                              /* action 134: data[0]|0x60, data[1]=0xdb */
            t.data[0] = (uint8_t)((t.data[0] & 0x1f) | 0x60);
            t.data[1] = 0xdb;
            break;
        default:                                              /* 其余子命令字段值取内部子状态(TODO) */
            s_cmd.door = 0;
            return;                                           /* 未建模 → 不注入 */
    }
    can_tx_send(&t);                                          /* 原 ID 0x1f9 回注 */
    s_cmd.door = 0;                                           /* 固件 sb zero,@f6e 消费 */
}

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
        case 0xBB: {                                     /* 187 执行动作; 执行器 @0x0800c1b2(查表0x0800d668) */
            if (len) { s_pending = payload[0];
                       const action_map_t *am = action_map_lookup(payload[0]);  /* 跳转表 0x080127bc */
                       if (am) {                                                 /* 路由到命令槽 (L2) */
                           if      (!strcmp(am->subsys,"gear")) control_cmd_set_gear((uint8_t)am->cmd);
                           else if (!strcmp(am->subsys,"lock")) control_cmd_set_lock((uint8_t)am->cmd);
                           else if (!strcmp(am->subsys,"door")) control_cmd_set_door((uint8_t)am->cmd);
                       }
                       (void)action_lookup(0xBB,payload[0]);
                       ble_hal_notify(0xBB,payload,1); }
            break; }
        case 0xA2:                                       /* 162 模拟滚轮 1-6 */
            if (len) control_scroll(payload[0]);
            break;
        default: break;
    }
}
