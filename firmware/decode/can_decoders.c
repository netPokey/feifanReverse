/* can_decoders.c — 据 versions/v9/TESLA_CAN_DECODE_PERID.md 实现解码层。
 * 精确公式来源: FIRMWARE_REWRITE_SPEC.md §2.4 (✔FW)。其余 ID 通用捕获原始 8 字节。*/
#include "can_decoders.h"
#include "can_dispatch.h"
#include "signal_state.h"
#include "sig.h"
#include <string.h>

/* 通用捕获槽 (最近一帧) */
#define RAW_MAX 80
static struct { uint16_t id; uint8_t d[8]; } s_raw[RAW_MAX]; static int s_raw_n;
static void raw_capture(const tesla_frame_t *f){
    for(int i=0;i<s_raw_n;i++) if(s_raw[i].id==f->id){ memcpy(s_raw[i].d,f->data,8); return; }
    if(s_raw_n<RAW_MAX){ s_raw[s_raw_n].id=f->id; memcpy(s_raw[s_raw_n].d,f->data,8); s_raw_n++; }
}
const uint8_t *decoder_raw_slot(uint16_t id){
    for(int i=0;i<s_raw_n;i++) if(s_raw[i].id==id) return s_raw[i].d;
    return 0;
}
#define D(f,n) ((uint32_t)(f)->data[n])

/* ===== 精确解码器 (✔FW §2.4) ===== */
static void dec_0x118(const tesla_frame_t *f){ sig_set(SIG_GEAR,(D(f,2)>>5)&7); }          /* 挡位 */
static void dec_0x257(const tesla_frame_t *f){ uint32_t v=((D(f,4)&1)<<8)|D(f,3);
    sig_set(SIG_SPEED, v==0x1FF?0:(int32_t)v); }                                            /* 车速 9bit */
static void dec_0x33a(const tesla_frame_t *f){
    sig_set(SIG_SOC,  ((D(f,3)&7)<<4)|(D(f,2)>>4));                                         /* SOC 7bit */
    if(D(f,5)!=0xFF) sig_set(SIG_RANGE, ((D(f,1)&3)<<8)|D(f,0)); }                          /* 续航 10bit */
static void dec_0x321(const tesla_frame_t *f){ sig_set(SIG_AMBIENT_C10,(int32_t)D(f,5)*5-400); } /* 环境温×10 */
static void dec_0x129(const tesla_frame_t *f){ sig_set(SIG_STEER_RAW,((D(f,2)&0x3f)<<6)|(D(f,3)&0x3f)); } /* 转角 */
static void dec_0x102(const tesla_frame_t *f){ sig_set(SIG_DOOR_FL,D(f,0)&1); sig_set(SIG_DOOR_RL,(D(f,0)>>1)&1); }
static void dec_0x103(const tesla_frame_t *f){ sig_set(SIG_DOOR_FR,D(f,0)&1); sig_set(SIG_DOOR_RR,(D(f,0)>>1)&1); }
static void dec_0x20c(const tesla_frame_t *f){ sig_set(SIG_HVAC_BLOWER,((D(f,1)&7)<<8)|D(f,0)); } /* 鼓风 11bit */
static void dec_0x3b6(const tesla_frame_t *f){ sig_set(SIG_ODOMETER, D(f,0)|(D(f,1)<<8)|(D(f,2)<<16)|(D(f,3)<<24)); }
static void dec_0x3fe(const tesla_frame_t *f){                                              /* 刹车温 4×10bit */
    sig_set(SIG_BRAKE_T0, ((D(f,2)&0x3f)<<4)|(D(f,1)>>4));
    sig_set(SIG_BRAKE_T1, ((D(f,4)&3)<<8)|D(f,3));
    sig_set(SIG_BRAKE_T2, ((D(f,5)&0x3f)<<4)|(D(f,4)>>6));
    sig_set(SIG_BRAKE_T3, ((D(f,7)&3)<<8)|D(f,6)); }
/* STATE 型: 整帧入表 + 关键信号 (0x132 电压电流 / 0x3d2 kwh, ✔FW §2.4) */
static void dec_0x132(const tesla_frame_t *f){ ss_store_frame(1,f->data);
    sig_set(SIG_PACK_V_C100, D(f,0)|(D(f,1)<<8));
    int32_t i=(int32_t)(int16_t)(D(f,2)|(D(f,3)<<8)); sig_set(SIG_PACK_I_D10, -i); }
static void dec_0x3d2(const tesla_frame_t *f){
    sig_set(SIG_KWH_DISCHG, D(f,0)|(D(f,1)<<8)|(D(f,2)<<16)|(D(f,3)<<24));
    sig_set(SIG_KWH_CHG,    D(f,4)|(D(f,5)<<8)|(D(f,6)<<16)|(D(f,7)<<24)); }
/* STATE 整帧入表 (打包器位含义) */
static void dec_state(uint8_t idx, const tesla_frame_t *f){ ss_store_frame(idx,f->data); }
static void dec_0x273(const tesla_frame_t *f){ dec_state(2,f); }
static void dec_0x332(const tesla_frame_t *f){ dec_state(5,f); }
static void dec_0x3b3(const tesla_frame_t *f){ dec_state(7,f); }
static void dec_0x3e9(const tesla_frame_t *f){ dec_state(12,f); }
/* 通用 */
static void dec_generic(const tesla_frame_t *f){ raw_capture(f); }

/* ===== 全 72 ID 注册 (v9 PERID) ===== */
static const uint16_t ALL_IDS[] = {
 0x080,0x082,0x0a9,0x0f4,0x0ff,0x101,0x102,0x103,0x118,0x129,0x132,0x145,0x189,0x1f9,
 0x20c,0x21c,0x229,0x238,0x243,0x249,0x257,0x25a,0x25d,0x266,0x273,0x292,0x293,0x2b4,
 0x2b6,0x2e1,0x2e5,0x2f3,0x31f,0x321,0x332,0x333,0x334,0x339,0x33a,0x352,0x370,0x37a,
 0x399,0x39b,0x39d,0x3a1,0x3b3,0x3b6,0x3c2,0x3c3,0x3d2,0x3d8,0x3df,0x3e2,0x3e3,0x3e9,
 0x3ea,0x3f5,0x3fd,0x3fe,0x3ff,0x400,0x401,0x405,0x498,0x4e2,0x4e3,0x4f3,0x678,0x679,
 0x68c,0x7ff };
#define N_IDS ((int)(sizeof(ALL_IDS)/sizeof(ALL_IDS[0])))

void decoders_register_all(void){
    /* 先全部登记通用捕获, 再用精确解码器覆盖 */
    for(int i=0;i<N_IDS;i++) can_dispatch_register(ALL_IDS[i], dec_generic);
    can_dispatch_register(0x118,dec_0x118); can_dispatch_register(0x257,dec_0x257);
    can_dispatch_register(0x33a,dec_0x33a); can_dispatch_register(0x321,dec_0x321);
    can_dispatch_register(0x129,dec_0x129); can_dispatch_register(0x102,dec_0x102);
    can_dispatch_register(0x103,dec_0x103); can_dispatch_register(0x20c,dec_0x20c);
    can_dispatch_register(0x3b6,dec_0x3b6); can_dispatch_register(0x3fe,dec_0x3fe);
    can_dispatch_register(0x132,dec_0x132); can_dispatch_register(0x3d2,dec_0x3d2);
    can_dispatch_register(0x273,dec_0x273); can_dispatch_register(0x332,dec_0x332);
    can_dispatch_register(0x3b3,dec_0x3b3); can_dispatch_register(0x3e9,dec_0x3e9);
}
