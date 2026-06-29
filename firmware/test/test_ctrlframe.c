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

    /* ---- 整车动作 re-sign: 锁 0x273 / 挡位 0x229 (统一命令缓冲模型) ---- */
    { tesla_frame_t d={0}; d.id=0x273; d.dlc=8; d.data[2]=0xf1;
      g_tx_n=0; control_on_can_0x273(&d); CHECK(g_tx_n==0,"0x273 无锁命令不注入");
      control_cmd_set_lock(1); g_tx_n=0; control_on_can_0x273(&d);
      CHECK(g_tx_n==1 && ((g_tx[0].data[2]>>1)&7)==1 && (g_tx[0].data[2]&0xf1)==0xf1,"0x273 锁→data[2]bits[3:1]=1 他位不变");
      CHECK(control_cmd_get_lock()==0,"0x273 消费锁槽");
      control_cmd_set_lock(2); g_tx_n=0; control_on_can_0x273(&d);
      CHECK(g_tx_n==1 && ((g_tx[0].data[2]>>1)&7)==2,"0x273 解锁→bits[3:1]=2"); }
    { tesla_frame_t s={0}; s.id=0x229; s.dlc=8; s.data[1]=0x75; s.data[2]=0x00;
      g_tx_n=0; control_on_can_0x229_gear(&s); CHECK(g_tx_n==0,"0x229 无挡位命令不注入");
      control_cmd_set_gear(4); g_tx_n=0; control_on_can_0x229_gear(&s);   /* D, d1=0x05→cnt=6, D0=GEAR_D0_D[6]=0x2c */
      CHECK(g_tx_n==1 && (g_tx[0].data[1]&0x70)==0 && (g_tx[0].data[1]&0xf)==6 && (g_tx[0].data[2]&3)==1
            && g_tx[0].data[0]==0x2c,"0x229 挡位D D1清[6:4]+计数器/D2[1:0]=01/D0=表[D][6]=0x2c");
      tesla_frame_t s2={0}; s2.id=0x229; s2.dlc=8; s2.data[1]=0x00;          /* P, cnt=1, D0=GEAR_D0_P[1]=0xad */
      control_cmd_set_gear(1); g_tx_n=0; control_on_can_0x229_gear(&s2);
      CHECK(g_tx_n==1 && g_tx[0].data[0]==0xad && (g_tx[0].data[1]&0xf)==1,"0x229 挡位P D0=表[P][1]=0xad"); }
    /* 端到端: BLE 187(0xBB) 经 action_map 路由到命令槽 */
    { uint8_t p=102; control_on_cmd(0xBB,&p,1); CHECK(control_cmd_get_gear()==1,"0xBB 102挂P→gear槽=1");
      uint8_t q=62;  control_on_cmd(0xBB,&q,1); CHECK(control_cmd_get_lock()==2,"0xBB 62解锁→lock槽=2"); }

    /* ---- 门 0x1f9 re-sign (跳转表常量字段案) ---- */
    { tesla_frame_t v={0}; v.id=0x1f9; v.dlc=8;
      g_tx_n=0; control_on_can_0x1f9(&v); CHECK(g_tx_n==0,"0x1f9 无门命令不注入");
      v.data[0]=0x1f; v.data[1]=0x00; control_cmd_set_door(13); g_tx_n=0; control_on_can_0x1f9(&v);
      CHECK(g_tx_n==1 && g_tx[0].data[0]==0xdf && g_tx[0].data[1]==0xb6 && (g_tx[0].data[2]&0xf)==0x0d,"0x1f9 门cmd13 三字段常量");
      CHECK(control_cmd_get_door()==0,"0x1f9 消费门槽");
      v.data[0]=0x03; v.data[1]=0x00; control_cmd_set_door(14); g_tx_n=0; control_on_can_0x1f9(&v);
      CHECK(g_tx_n==1 && g_tx[0].data[0]==0x63 && g_tx[0].data[1]==0xdb,"0x1f9 门cmd14 data0|0x60/data1=0xdb");
      v.data[1]=0x3f; control_cmd_set_door(11); g_tx_n=0; control_on_can_0x1f9(&v);
      CHECK(g_tx_n==1 && (g_tx[0].data[1]&0x80)==0x80,"0x1f9 门cmd11 data1 bit7=1");
      control_cmd_set_door(7); g_tx_n=0; control_on_can_0x1f9(&v);
      CHECK(g_tx_n==0 && control_cmd_get_door()==0,"0x1f9 未建模门cmd 不注入并消费"); }
    /* 端到端: BLE 187 全门关(133→door cmd13) */
    { uint8_t r=133; control_on_cmd(0xBB,&r,1); CHECK(control_cmd_get_door()==13,"0xBB 133全门关→door槽=13"); }

    printf("\n  ctrlframe tests: %d passed, %d failed\n",g_pass,g_fail);
    return g_fail?1:0;
}
