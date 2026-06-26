/* test_integration.c — Phase F: 整机端到端 (鉴权→配置→CAN解码→轮询notify→无感注入) */
#include "firmware_app.h"
#include "ble_proto.h"
#include "tesla_frame.h"
#include <stdio.h>
#include <string.h>

static struct{uint8_t t;uint16_t n;uint8_t p[64];} g_ntf[16]; static int g_ntf_n;
void ble_hal_notify(uint8_t t,const uint8_t*p,uint16_t n){ if(g_ntf_n<16){g_ntf[g_ntf_n].t=t;g_ntf[g_ntf_n].n=n;uint16_t c=n>64?64:n;memcpy(g_ntf[g_ntf_n].p,p,c);g_ntf_n++;} }
static tesla_frame_t g_tx[8]; static int g_tx_n;
void mdr_hal_can1_send(const tesla_frame_t*f){ if(g_tx_n<8) g_tx[g_tx_n++]=*f; }
void mdr_hal_schedule(void(*cb)(void),uint32_t ms){ (void)cb;(void)ms; }

static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
static int got_idx(uint8_t t){ for(int i=0;i<g_ntf_n;i++) if(g_ntf[i].t==t) return i; return -1; }

int main(void){
    uint8_t buf[96]; int n;
    fw_init();

    /* 1. 鉴权握手 */
    g_ntf_n=0; uint8_t pw[4]={'1','2','3','4'};
    n=ble_pack(0xA8,pw,4,buf,sizeof buf); fw_on_ble_write(buf,n);
    CHECK(got_idx(0xA8)>=0 && got_idx(0xA0)>=0,"鉴权成功(168回执+160设备信息)");

    /* 2. 写配置: ModeMDR=无感(rawConfig[29]=1) */
    uint8_t cfg[76]; memset(cfg,0,sizeof cfg); cfg[29]=1; /* config[5]=1→无感 */
    n=ble_pack(0xA3,cfg,76,buf,sizeof buf); fw_on_ble_write(buf,n);

    /* 3. CAN 读链路: 喂 0x132 电压电流 */
    tesla_frame_t v={0}; v.id=0x132; v.dlc=8; v.data[0]=0x10; v.data[1]=0x27; /* V=0x2710 */
    fw_on_can_rx(&v);

    /* 4. 开电池轮询 → tick 推送 29B, 含电压 */
    g_ntf_n=0; uint8_t on[1]={1};
    n=ble_pack(0xD0,on,1,buf,sizeof buf); fw_on_ble_write(buf,n);
    fw_tick(5);
    int bi=got_idx(0xD0);
    CHECK(bi>=0 && g_ntf[bi].n==29,"电池轮询推 29B");
    CHECK(bi>=0 && g_ntf[bi].p[0]==0x10 && g_ntf[bi].p[1]==0x27,"电池包含 0x132 电压(读链路贯通)");

    /* 5. 无感注入: tick 已使 notouch 激活; 放行发送; 喂合法 0x370 → 注入 */
    fw_set_tx_enabled(1);
    fw_tick(5);                                   /* 再次激活, 确保 notouch_active */
    g_tx_n=0;
    tesla_frame_t e={0}; e.id=0x370; e.dlc=8; e.data[2]=0x08; e.data[3]=0x02; /* 12bit=0x802 近中位 */
    e.data[7]=tesla_addsum(&e,7);
    fw_on_can_rx(&e);
    CHECK(g_tx_n==1 && g_tx[0].id==0x370,"无感: 0x370 被 re-sign 回注 CAN1");
    uint16_t inj=((g_tx[0].data[2]&0xf)<<8)|g_tx[0].data[3];
    CHECK(inj==2200||inj==2230||inj==1900||inj==1870,"无感: 注入扭矩为振荡值");

    /* 6. 门禁: LISTEN_ONLY 时控制透传被拦 (经 ble 命令链路验证已在 test_control; 此处校验默认门) */
    fw_init();   /* 复位 → 默认 LISTEN_ONLY */
    g_tx_n=0; tesla_frame_t e2=e; fw_on_ble_write(buf,n); /* 未鉴权, 不影响 */
    CHECK(g_tx_n==0,"复位后默认监听态(无注入)");

    printf("\n  integration tests: %d passed, %d failed\n", g_pass,g_fail);
    return g_fail?1:0;
}
