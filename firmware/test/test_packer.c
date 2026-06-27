/* test_packer.c — 打包器: pack → 按 app 约定反解 → 还原 */
#include "packer.h"
#include "sig.h"
#include <stdio.h>
#include <stdint.h>
static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
static uint32_t le32(const uint8_t*b,int n,int off){ uint32_t v=0; for(int i=0;i<4;i++) if(off+i<n) v|=(uint32_t)b[off+i]<<(8*i); return v; }
static uint32_t fld(const uint8_t*b,int n,int off,int sh,int w){ return (le32(b,n,off)>>sh)&((w>=32)?0xFFFFFFFFu:((1u<<w)-1)); }

int main(void){
    sig_reset();
    sig_set(SIG_SPEED,288); sig_set(SIG_GEAR,4); sig_set(SIG_SOC,77);
    sig_set(SIG_DOOR_FL,1); sig_set(SIG_DOOR_RR,1); sig_set(SIG_RANGE,321);
    sig_set(SIG_BRAKE_T0,0x123); sig_set(SIG_BRAKE_T3,0x2AB); sig_set(SIG_AMBIENT_RAW,150);
    sig_set(SIG_REAR_POWER,-256); sig_set(SIG_ALTITUDE,392); sig_set(SIG_FRONT_POWER,320);
    uint8_t g[PACK_GAUGE_LEN]; pack_gauge(g);
    CHECK(fld(g,33,0,0,9)==288,"gauge speed");
    CHECK(fld(g,33,0,9,3)==4,"gauge gear");
    CHECK(fld(g,33,0,16,1)==1 && fld(g,33,0,17,1)==0,"gauge door FL");
    CHECK(fld(g,33,0,19,1)==1,"gauge door RR");
    CHECK(fld(g,33,0,24,7)==77,"gauge SOC");
    CHECK(fld(g,33,28,12,10)==321,"gauge range");
    CHECK(fld(g,33,18,0,10)==0x123,"gauge brakeT0");
    CHECK(fld(g,33,21,6,10)==0x2AB,"gauge brakeT3(跨字节)");
    CHECK(g[27]==150,"gauge ambient byte");
    CHECK((int)(fld(g,33,12,8,11))==(-256 & 0x7ff),"gauge 后电机功率(11bit)");
    CHECK(fld(g,33,15,6,14)==392,"gauge 海拔(14bit)");
    CHECK(fld(g,33,12,19,11)==320,"gauge 前电机功率(11bit)");

    sig_set(SIG_PACK_V_RAW,0x2710); sig_set(SIG_PACK_I_RAW,0x64);
    sig_set(SIG_KWH_DISCHG,0x11223344); sig_set(SIG_KWH_CHG,0x55667788);
    uint8_t b[PACK_BATTERY_LEN]; pack_battery(b);
    CHECK(fld(b,29,0,0,16)==0x2710,"batt voltage");
    CHECK(fld(b,29,2,0,16)==0x64,"batt current");
    CHECK(le32(b,29,4)==0x11223344,"batt discharge");
    CHECK(le32(b,29,8)==0x55667788,"batt charge");
    CHECK(fld(b,29,24,7,7)==77,"batt SOC");
    printf("\n  packer tests: %d passed, %d failed\n", g_pass,g_fail);
    return g_fail?1:0;
}
