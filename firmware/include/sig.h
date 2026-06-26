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
    SIG_AMBIENT_C10, /* 环境温 ×10 ℃ (0x321 D5*5-400) */
    SIG_STEER_RAW,   /* 转角拼 (0x129) gp+0x1d8 */
    SIG_DOOR_FL, SIG_DOOR_FR, SIG_DOOR_RL, SIG_DOOR_RR, /* 0x102/0x103 */
    SIG_HVAC_BLOWER, /* 11bit (0x20c) */
    SIG_PACK_V_C100, /* 电压 ×100 V (0x132 D0|D1<<8) */
    SIG_PACK_I_D10,  /* 电流 ×10 A 有符号 (0x132 D2|D3<<8 ×-0.1) */
    SIG_KWH_DISCHG,  /* 放电 ×1000 kWh (0x3d2 D0..D3) */
    SIG_KWH_CHG,     /* 充电 ×1000 kWh (0x3d2 D4..D7) */
    SIG_BRAKE_T0, SIG_BRAKE_T1, SIG_BRAKE_T2, SIG_BRAKE_T3, /* 0x3fe 4×10bit */
    SIG_ODOMETER,    /* 0x3b6 */
    SIG_COUNT
} sig_t;
void    sig_set(sig_t s, int32_t v);
int32_t sig_get(sig_t s);
void    sig_reset(void);
#endif
