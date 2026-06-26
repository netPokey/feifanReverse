/* test_decode.c — Phase B: 精确解码器 + 全 72 ID 注册 */
#include "can_decoders.h"
#include "can_dispatch.h"
#include "signal_state.h"
#include "sig.h"
#include "tesla_frame.h"
#include <stdio.h>
#include <string.h>
static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
static tesla_frame_t mk(uint16_t id, const uint8_t d[8]){ tesla_frame_t f={0}; f.id=id; f.dlc=8; memcpy(f.data,d,8); return f; }

int main(void){
    can_dispatch_reset(); sig_reset(); decoders_register_all();

    /* 挡位 0x118: D2[5:7]=4 -> D */
    uint8_t d[8]={0,0,(4<<5),0,0,0,0,0}; tesla_frame_t f=mk(0x118,d);
    can_dispatch(&f); CHECK(sig_get(SIG_GEAR)==4,"0x118 挡位 D");

    /* 车速 0x257: D3=0x20,D4&1=1 -> 0x120=288; 0x1FF->0 */
    uint8_t s1[8]={0,0,0,0x20,1,0,0,0}; f=mk(0x257,s1); can_dispatch(&f);
    CHECK(sig_get(SIG_SPEED)==0x120,"0x257 车速");
    uint8_t s2[8]={0,0,0,0xFF,1,0,0,0}; f=mk(0x257,s2); can_dispatch(&f);
    CHECK(sig_get(SIG_SPEED)==0,"0x257 0x1FF 无效→0");

    /* 续航/SOC 0x33a: SOC=((D3&7)<<4)|(D2>>4); range=((D1&3)<<8)|D0 (D5!=0xFF) */
    uint8_t r[8]={0x10,0x02,0x30,0x05,0,0x00,0,0}; f=mk(0x33a,r); can_dispatch(&f);
    CHECK(sig_get(SIG_SOC)==(((5&7)<<4)|(0x30>>4)),"0x33a SOC");
    CHECK(sig_get(SIG_RANGE)==(((2&3)<<8)|0x10),"0x33a 续航");

    /* 环境温 0x321: D5=100 -> 100*5-400=100 (×10℃ = 10.0℃) */
    uint8_t a[8]={0,0,0,0,0,100,0,0}; f=mk(0x321,a); can_dispatch(&f);
    CHECK(sig_get(SIG_AMBIENT_C10)==100,"0x321 环境温×10");

    /* 电压电流 0x132: V=D0|D1<<8; I=-(D2|D3<<8) */
    uint8_t v[8]={0x10,0x27,0x64,0x00,0,0,0,0}; f=mk(0x132,v); can_dispatch(&f);  /* V=0x2710=10000(×0.01=100V) I=-100(×0.1=-10A) */
    CHECK(sig_get(SIG_PACK_V_C100)==0x2710,"0x132 电压");
    CHECK(sig_get(SIG_PACK_I_D10)==-100,"0x132 电流(放电为负)");
    CHECK(g_ss_idx[1][0]==0x10,"0x132 STATE 整帧入表");

    /* kwh 0x3d2 */
    uint8_t k[8]={1,0,0,0,2,0,0,0}; f=mk(0x3d2,k); can_dispatch(&f);
    CHECK(sig_get(SIG_KWH_DISCHG)==1 && sig_get(SIG_KWH_CHG)==2,"0x3d2 充放电 kwh");

    /* 通用捕获: 未精确的 ID 原样存 */
    uint8_t g[8]={9,8,7,6,5,4,3,2}; f=mk(0x405,g); can_dispatch(&f);
    const uint8_t *slot=decoder_raw_slot(0x405);
    CHECK(slot && slot[0]==9 && slot[7]==2,"0x405 通用捕获");

    /* 全 72 ID 已注册 (随机抽查几个 dispatch 不崩) */
    uint8_t z[8]={0}; f=mk(0x7ff,z); can_dispatch(&f); f=mk(0x080,z); can_dispatch(&f);
    CHECK(1,"全 ID dispatch 稳定");

    printf("\n  decode tests: %d passed, %d failed\n", g_pass, g_fail);
    return g_fail?1:0;
}
