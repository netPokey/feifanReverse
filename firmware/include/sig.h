/* sig.h — 具名信号 (解码器写 / 打包器读)。固件用 gp 偏移; 这里用具名枚举更可维护,
 * 语义与固件一致, gp 偏移在解码器注释里标注。值用 int32 统一(温度×10/电压×100 等定标见注释)。*/
#ifndef SIG_H
#define SIG_H
#include <stdint.h>
typedef enum {
    SIG_GEAR=0,      /* 0=INVALID 1=P 2=R 3=N 4=D   (0x118 D2[5:7]) */
    SIG_SPEED,       /* 9bit raw (0x257); 0x1FF 无效→0; gp+0xF4 */
    SIG_SOC,         /* 7bit % (0x33a) */
    SIG_RANGE,       /* 10bit (0x33a) */
    SIG_AMBIENT_RAW, /* 环境温原值 D5 (0x321; app ×0.5-40) */
    SIG_STEER_RAW,   /* 转角拼 (0x129) gp+0x1d8 */
    SIG_DOOR_FL, SIG_DOOR_FR, SIG_DOOR_RL, SIG_DOOR_RR, /* 0x102/0x103 */
    SIG_HVAC_BLOWER, /* 11bit (0x20c) */
    SIG_PACK_V_RAW,  /* 电压原值 D0|D1<<8 (0x132; app ×0.01V) */
    SIG_PACK_I_RAW,  /* 电流原值 D2|D3<<8 (0x132; app ×-0.1A) */
    SIG_KWH_DISCHG,  /* 放电 ×1000 kWh (0x3d2 D0..D3) */
    SIG_KWH_CHG,     /* 充电 ×1000 kWh (0x3d2 D4..D7) */
    SIG_BRAKE_T0, SIG_BRAKE_T1, SIG_BRAKE_T2, SIG_BRAKE_T3, /* 0x3fe 4×10bit */
    SIG_ODOMETER,    /* 0x3b6 */
    SIG_REAR_POWER,  /* 后电机功率 sign11 (0x266; app /2 kW) */
    SIG_ALTITUDE,    /* 海拔 sign14 (0x3d8) */
    SIG_FRONT_POWER, /* 前电机功率 sign11 (0x2e5, 与0x266同 handler 0x08008198) */
    SIG_HVAC_F2,     /* 0x20c 第二 HVAC 字段 ((D5&3)<<8)|D4 10bit (◎ watts/cabin 待 0xB0 getter 定槽) */
    SIG_TPMS_FL, SIG_TPMS_FR, SIG_TPMS_RL, SIG_TPMS_RR, /* 胎压原值 (0x25a D0-D3; app ×0.025 bar) */
    SIG_ESP,         /* 0x145 ESP 状态位 (D3>>6&1) */
    SIG_VCSEC_AUTH,  /* 0x339 VCSEC 鉴权(前备箱/尾门请求) D1>>4 */
    SIG_IBST,        /* 0x39d 刹车助力位 ((D1|D2<<8)>>9&1) */
    SIG_MAPDATA,     /* 0x238 驾辅地图 D1&0x1f */
    SIG_HVAC_STATUS, /* 0x243 VCRIGHT_hvac 状态 D0&7 */
    SIG_VCLEFT_SW,   /* 0x3c2 VCLEFT 开关 D0&3 */
    SIG_VCFRONT_ST,  /* 0x2e1 VCFRONT 状态 D0 */
    SIG_COUNT
} sig_t;
void    sig_set(sig_t s, int32_t v);
int32_t sig_get(sig_t s);
void    sig_reset(void);
#endif
