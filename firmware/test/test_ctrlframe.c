/* test_ctrlframe.c — 控制帧 re-sign (0x189/0x68c/0x3a1) */
#include "control.h"
#include "can_tx.h"
#include "tesla_frame.h"
#include <stdio.h>
#include <string.h>
static tesla_frame_t g_tx[8]; static int g_tx_n;
void mdr_hal_can1_send(const tesla_frame_t*f){ if(g_tx_n<8) g_tx[g_tx_n++]=*f; }
void ble_hal_notify(uint8_t t,const uint8_t*p,uint16_t n){(void)t;(void)p;(void)n;}
static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
int main(void){
    control_init(); can_tx_set_mode(CAN_TX_NORMAL);
    tesla_frame_t f={0}; f.id=0x189; f.dlc=8;
    /* 标志未置位: 不注入 */
    g_tx_n=0; control_on_can_0x189(&f); CHECK(g_tx_n==0,"标志关不注入");
    /* 置位: D0=2 注入 */
    control_set_active(1); g_tx_n=0; control_on_can_0x189(&f);
    CHECK(g_tx_n==1 && g_tx[0].id==0x189 && g_tx[0].data[0]==2,"0x189 D0=2 注入");
    f.id=0x68c;  g_tx_n=0; control_on_can_0x68c(&f);
    CHECK(g_tx_n==1 && g_tx[0].data[3]==8,"0x68c D3=8 注入");
    f.id=0x3a1; f.data[1]=14;  g_tx_n=0; control_on_can_0x3a1(&f);
    CHECK(g_tx_n==1 && g_tx[0].data[1]==0 && g_tx[0].data[2]==0x30,"0x3a1 计数器mod15回绕+D2=0x30");
    printf("\n  ctrlframe tests: %d passed, %d failed\n",g_pass,g_fail);
    return g_fail?1:0;
}
