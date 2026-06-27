/* packer.c — 据 TESLA_CAN_TSL_REFERENCE §1.3/§1.4 字节.位布局打包。
 * 已映射有信号的字段; 其余留 0 (TODO: 补信号/按 fwb0 精确位)。*/
#include "packer.h"
#include "sig.h"
#include <string.h>

/* LSB-first 绝对位写入 (app 的 LE32>>shift&mask 的逆) */
static void put(uint8_t *buf, int len, int bitpos, int width, uint32_t v){
    for (int i=0;i<width;i++){
        int b = bitpos+i; if ((b>>3) >= len) break;
        if ((v>>i)&1) buf[b>>3] |= (uint8_t)(1<<(b&7));
        else          buf[b>>3] &= (uint8_t)~(1<<(b&7));
    }
}
#define F(off,shift,w,val) put(out, len, (off)*8+(shift), (w), (uint32_t)(val))

void pack_gauge(uint8_t *out){
    const int len = PACK_GAUGE_LEN; memset(out,0,len);
    F(0,0,9,  sig_get(SIG_SPEED));        /* speedRaw [0]b0-8 */
    F(0,9,3,  sig_get(SIG_GEAR));         /* gear     [0]b9-11 */
    F(0,16,1, sig_get(SIG_DOOR_FL));      /* door 左前 [0]b16 */
    F(0,17,1, sig_get(SIG_DOOR_RL));      /*      左后 b17 */
    F(0,18,1, sig_get(SIG_DOOR_FR));      /*      右前 b18 */
    F(0,19,1, sig_get(SIG_DOOR_RR));      /*      右后 b19 */
    F(0,24,7, sig_get(SIG_SOC));          /* batteryPercent [0]b24-30 */
    F(4,6,26, sig_get(SIG_ODOMETER));     /* odometer [4]b6-31 (/10) */
    F(18,0,10, sig_get(SIG_BRAKE_T0));    /* brakeTemp×4 [18..22] 各10bit */
    F(18,10,10,sig_get(SIG_BRAKE_T1));
    F(18,20,10,sig_get(SIG_BRAKE_T2));
    F(18,30,10,sig_get(SIG_BRAKE_T3));
    F(23,0,10, sig_get(SIG_HVAC_BLOWER)); /* hvacBlowerRPM [23..26]b0-9 */
    F(23,10,11,sig_get(SIG_HVAC_F2));     /* ◎ wattsDemandEvap [23..26]b10-20 (槽待 0xB0 getter 确认) */
    F(8,0,8,  sig_get(SIG_TPMS_FL)); F(9,0,8, sig_get(SIG_TPMS_FR)); /* pressure×4 [8..11] ×0.025bar */
    F(10,0,8, sig_get(SIG_TPMS_RL)); F(11,0,8,sig_get(SIG_TPMS_RR));
    F(27,0,8,  sig_get(SIG_AMBIENT_RAW)); /* tempAmbient [27] */
    F(28,12,10,sig_get(SIG_RANGE));       /* remainRange [28..31]b12-21 */
    F(12,8,11, sig_get(SIG_REAR_POWER));  /* rearInverterPower [12]b8-18 (11bit signed) */
    F(12,19,11,sig_get(SIG_FRONT_POWER)); /* frontInverterPower [12]b19-29 (11bit signed) */
    F(15,6,14, sig_get(SIG_ALTITUDE));    /* altitude [15..17]b6-19 (14bit signed) */
    /* TODO: turn/AP/frunk/trunk/altitude/cellVoltage/batteryTemp/power 等需补信号或按 fwb0 精确位 */
}
void pack_battery(uint8_t *out){
    const int len = PACK_BATTERY_LEN; memset(out,0,len);
    F(0,0,16,  sig_get(SIG_PACK_V_RAW));  /* 总电压 [0..1] ×0.01 */
    F(2,0,16,  sig_get(SIG_PACK_I_RAW));  /* 总电流 [2..3] ×-0.1 */
    F(4,0,32,  sig_get(SIG_KWH_DISCHG));  /* 总放电 [4..7] ×0.001 */
    F(8,0,32,  sig_get(SIG_KWH_CHG));     /* 总充电 [8..11] ×0.001 */
    F(24,7,7,  sig_get(SIG_SOC));         /* 车机SOC [24..25]b7-13 */
    /* TODO: 单体min/max[18..20] / 剩余·容量·续航·温度 win[21] / 里程[25..28] 需补信号 */
}
