/* test_framework.c — Phase A 骨架 host 测试: BLE 编解码 / 分发 / router / re-sign / CAN_TX 门禁 / 状态表 */
#include "ble_proto.h"
#include "ble_router.h"
#include "can_dispatch.h"
#include "can_tx.h"
#include "signal_state.h"
#include "tesla_frame.h"
#include <stdio.h>
#include <string.h>

/* fake HAL: can_tx 用 */
static tesla_frame_t g_sent[16]; static int g_sent_n;
void mdr_hal_can1_send(const tesla_frame_t *f){ if(g_sent_n<16) g_sent[g_sent_n++]=*f; }

static int g_pass, g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else {g_fail++; printf("  FAIL: %s\n", m);} }while(0)

/* dispatch/router 命中记录 */
static uint16_t g_can_hit; static void can_h0x370(const tesla_frame_t*f){ g_can_hit=f->id; }
static uint16_t g_can_hit2;static void can_h0x229(const tesla_frame_t*f){ g_can_hit2=f->id; }
static uint8_t  g_ble_hit; static void ble_hA3(const ble_msg_t*m){ g_ble_hit=m->type; }
static uint8_t  s_crc(const tesla_frame_t*f){ (void)f; return 0xAB; }

int main(void){
    /* 1. BLE 编解码往返 */
    uint8_t pl[4]={0x12,0x34,0x56,0x78}, buf[32]; ble_msg_t m;
    int n=ble_pack(0xA3, pl, 4, buf, sizeof buf);
    CHECK(n==5+4+1,"ble_pack 长度");
    CHECK(buf[0]==0x55&&buf[1]==0x7F&&buf[2]==0xA3,"ble 帧头/type");
    CHECK(ble_unpack(buf,n,&m)==1 && m.type==0xA3 && m.len==4 && m.payload[0]==0x12,"ble 往返");
    buf[n-1]^=0xFF; CHECK(ble_unpack(buf,n,&m)==0,"ble 校验错被拒"); buf[n-1]^=0xFF;
    buf[0]=0; CHECK(ble_unpack(buf,n,&m)==0,"ble SOF 错被拒");
    CHECK(ble_checksum(0xA3,pl,4)==(uint8_t)(0xA3+0+4+0x12+0x34+0x56+0x78),"ble checksum 公式");

    /* 2. CAN 分发路由 */
    can_dispatch_reset(); g_can_hit=g_can_hit2=0;
    can_dispatch_register(0x370, can_h0x370);
    can_dispatch_register(0x229, can_h0x229);
    tesla_frame_t f={0}; f.id=0x370; f.dlc=8; can_dispatch(&f);
    CHECK(g_can_hit==0x370 && g_can_hit2==0,"dispatch 0x370");
    f.id=0x229; can_dispatch(&f); CHECK(g_can_hit2==0x229,"dispatch 0x229");
    f.id=0x111; g_can_hit=0; can_dispatch(&f); CHECK(g_can_hit==0,"未注册 ID 丢弃");

    /* 3. BLE router */
    ble_router_reset(); g_ble_hit=0;
    ble_router_register(0xA3, ble_hA3);
    m.type=0xA3; ble_router_dispatch(&m); CHECK(g_ble_hit==0xA3,"router 0xA3");
    m.type=0xB0; g_ble_hit=0; ble_router_dispatch(&m); CHECK(g_ble_hit==0,"router 未注册丢弃");

    /* 4. 通用 re-sign: D6 高nibble+0x10, D7=crc */
    tesla_frame_t r={0}; r.id=0x229; r.dlc=8; r.data[6]=0x20; r.data[7]=0x00;
    tesla_resign(&r, s_crc);
    CHECK(r.data[6]==0x30,"re-sign D6 计数器 +0x10");
    CHECK(r.data[7]==0xAB,"re-sign D7 = crc 回调");

    /* 5. CAN_TX 门禁 */
    g_sent_n=0; can_tx_set_mode(CAN_TX_LISTEN_ONLY);
    CHECK(can_tx_send(&r)==0 && g_sent_n==0,"LISTEN_ONLY 拦截发送");
    can_tx_set_mode(CAN_TX_NORMAL);
    CHECK(can_tx_send(&r)==1 && g_sent_n==1,"NORMAL 放行发送");

    /* 6. 状态表 */
    ss_set16(0xF4, 0x1234); CHECK(ss_get16(0xF4)==0x1234,"ss 16bit 读写");
    uint8_t d8[8]={1,2,3,4,5,6,7,8}; ss_store_frame(3,d8);
    CHECK(g_ss_idx[3][0]==1 && g_ss_idx[3][7]==8,"ss STATE 整帧存储");

    printf("\n  framework tests: %d passed, %d failed\n", g_pass, g_fail);
    return g_fail?1:0;
}
