/* test_control.c — Phase D: BLE→CAN 透传 / re-sign / 动作分发 */
#include "control.h"
#include "can_tx.h"
#include "tesla_frame.h"
#include <stdio.h>
#include <string.h>

static tesla_frame_t g_sent[8]; static int g_sent_n;
void mdr_hal_can1_send(const tesla_frame_t *f){ if(g_sent_n<8) g_sent[g_sent_n++]=*f; }
static struct{uint8_t t;uint8_t p[8];uint16_t n;} g_ntf[8]; static int g_ntf_n;
void ble_hal_notify(uint8_t t,const uint8_t*p,uint16_t n){ if(g_ntf_n<8){g_ntf[g_ntf_n].t=t;g_ntf[g_ntf_n].n=n;if(n>8)n=8;memcpy(g_ntf[g_ntf_n].p,p,n);g_ntf_n++;} }
static uint8_t g_scroll; void control_scroll(uint8_t d){ g_scroll=d; }

static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
static void clr(void){ g_sent_n=0; g_ntf_n=0; g_scroll=0; }

int main(void){
    control_init();

    /* 1. BLE→CAN 透传: [idHi,idLo,dlc,data...] (门禁 LISTEN_ONLY 拦截) */
    clr(); can_tx_set_mode(CAN_TX_LISTEN_ONLY);
    uint8_t pt[]={0x02,0x29,8, 0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88};
    CHECK(control_passthrough(pt,sizeof pt)==0 && g_sent_n==0,"透传 LISTEN_ONLY 拦截");
    can_tx_set_mode(CAN_TX_NORMAL);
    CHECK(control_passthrough(pt,sizeof pt)==1 && g_sent_n==1,"透传放行");
    CHECK(g_sent[0].id==0x229 && g_sent[0].dlc==8 && g_sent[0].data[0]==0x11 && g_sent[0].data[7]==0x88,"透传帧 ID/DLC/数据");
    CHECK(control_passthrough(pt,3)==0,"透传 len 不足拒绝");

    /* 2. Tesla CRC8 确定性 + 数据敏感 */
    tesla_frame_t a={0}; a.id=0x229; a.dlc=8; a.data[0]=0x01;
    tesla_frame_t b=a; b.data[0]=0x02;
    CHECK(tesla_crc8(&a)==tesla_crc8(&a),"crc8 确定");
    CHECK(tesla_crc8(&a)!=tesla_crc8(&b),"crc8 对数据敏感");

    /* 3. re-sign: D6 计数器 +0x10, D7=crc8 */
    clr(); tesla_frame_t r={0}; r.id=0x229; r.dlc=8; r.data[6]=0x20;
    control_resign_send(&r, 1);
    CHECK(g_sent_n==1 && g_sent[0].data[6]==0x21,"re-sign D6 计数器 低nibble+1 (9.bin)");
    CHECK(g_sent[0].data[7]==tesla_crc8(&g_sent[0]),"re-sign D7=crc8 自洽");
    /* 加法校验形式 */
    clr(); tesla_frame_t r2={0}; r2.id=0x370; r2.dlc=8; control_resign_send(&r2,0);
    CHECK(g_sent_n==1 && tesla_checksum_ok(&g_sent[0]),"re-sign 加法校验自洽");

    /* 4. 动作分发 */
    clr(); uint8_t a7[1]={0x00}; control_on_cmd(0xA7,a7,1);   /* 开左前门 */
    CHECK(control_pending_action()==0x00,"167 动作记录");
    CHECK(g_ntf_n==1 && g_ntf[0].t==0xA7 && g_ntf[0].p[1]==1,"167 回执 [code,1]");
    clr(); uint8_t bb[1]={0x3C}; control_on_cmd(0xBB,bb,1);   /* 解锁=60 */
    CHECK(control_pending_action()==0x3C && g_ntf[0].t==0xBB,"187 动作记录+回执");
    clr(); uint8_t a2[1]={1}; control_on_cmd(0xA2,a2,1);
    CHECK(g_scroll==1,"162 模拟滚轮转交");

    printf("\n  control tests: %d passed, %d failed\n", g_pass,g_fail);
    return g_fail?1:0;
}
