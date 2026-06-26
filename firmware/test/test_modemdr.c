/* test_modemdr.c — host 单元测试 (gcc, 无 MCU 依赖)
 * 验证 getter / 0xA3 配置映射 / 无感 0x370 注入 / 计数器 / 校验 / 分发门控。 */
#include "modemdr.h"
#include "mdr_hal.h"
#include <stdio.h>
#include <string.h>

/* ---- fake HAL: 记录发送与调度 ---- */
static tesla_frame_t g_sent[64]; static int g_sent_n;
static mdr_task_cb   g_sched_cb; static uint32_t g_sched_ms; static int g_sched_n;
void mdr_hal_can1_send(const tesla_frame_t *f){ if(g_sent_n<64) g_sent[g_sent_n++]=*f; }
void mdr_hal_schedule(mdr_task_cb cb, uint32_t ms){ g_sched_cb=cb; g_sched_ms=ms; g_sched_n++; }

/* ---- 测试可控的门 (强符号覆盖 modemdr.c 的弱默认) ---- */
static int t_entry=1, t_notouch_en=1, t_scroll_en=1; static uint8_t t_submode=0;
int     mdr_entry_gate(void)      { return t_entry; }
int     mdr_notouch_enabled(void) { return t_notouch_en; }
int     mdr_scroll_enabled(void)  { return t_scroll_en; }
uint8_t mdr_submode(void)         { return t_submode; }

static int g_pass=0, g_fail=0;
#define CHECK(c,msg) do{ if(c){g_pass++;} else {g_fail++; printf("  FAIL: %s\n", msg);} }while(0)

static void reset(void){ g_sent_n=0; g_sched_n=0; g_notouch_active=0; g_notouch_counter=0;
                         memset(g_config,0,sizeof g_config); }

/* 构造一帧合法 0x370 (12bit 值=val, 自洽校验) */
static tesla_frame_t mk370(uint16_t val){
    tesla_frame_t f; memset(&f,0,sizeof f);
    f.id=0x370; f.dlc=8;
    f.data[2]=(uint8_t)((val>>8)&0xf); f.data[3]=(uint8_t)(val&0xff);
    f.data[7]=tesla_addsum(&f,7);
    return f;
}
static uint16_t v12(const tesla_frame_t*f){ return (uint16_t)(((f->data[2]&0xf)<<8)|f->data[3]); }

int main(void){
    /* 1. getter 映射 */
    reset(); g_config[5]=0; CHECK(modemdr_mode()==1,"val0->mode1(滚轮)");
    g_config[5]=1; CHECK(modemdr_mode()==2,"val1->mode2(无感)");
    g_config[5]=2; CHECK(modemdr_mode()==3,"val2->mode3(两者)");
    g_config[5]=0xFD; CHECK(modemdr_mode()==2,"高位不影响:0xFD&3=1->mode2");

    /* 2. BLE 0xA3 配置映射: payload[29]=rawConfig[29]=ModeMDR -> config[5] */
    reset(); { uint8_t p[0x4c]; memset(p,0,sizeof p); p[29]=0x01; /* val=1 无感 */
        modemdr_on_ble_a3(p,0x4c);
        CHECK(g_config[5]==0x01,"payload[29]->config[5]");
        CHECK(modemdr_mode()==2,"0xA3 val=1 -> 无感模式");
        modemdr_on_ble_a3(p,0x4b); /* 错误长度应被拒 */
        CHECK(g_config[5]==0x01,"长度!=76 被拒"); }

    /* 3. 无感注入序列: counter 0..3 -> {2200,2230,1900,1870} */
    reset(); g_notouch_active=1;
    const uint16_t exp[4]={2200,2230,1900,1870};
    for(int c=0;c<4;c++){
        g_sent_n=0; g_notouch_counter=(uint8_t)c;
        tesla_frame_t in=mk370(0x802); /* 2050 近中位 */
        modemdr_on_can_0x370(&in);
        char m[64]; snprintf(m,sizeof m,"counter=%d 注入值=%d",c,exp[c]);
        CHECK(g_sent_n==1 && g_sent[0].id==0x370 && v12(&g_sent[0])==exp[c], m);
        CHECK(g_sent_n==1 && tesla_checksum_ok(&g_sent[0]),"注入帧校验自洽");
        CHECK(g_sent_n==1 && (g_sent[0].data[4]&0xc0)==0x40,"data[4]有效位=01");
    }
    /* 计数器在 data[6] 低半字节递增 */
    reset(); g_notouch_active=1; g_notouch_counter=0;
    { tesla_frame_t in=mk370(0x802); in.data[6]=0x35; in.data[7]=tesla_addsum(&in,7);
      modemdr_on_can_0x370(&in);
      CHECK(g_sent_n==1 && (g_sent[0].data[6]&0xf)==0x6,"data[6]计数器 5->6"); }

    /* 4. 未激活/远离中位 不注入 */
    reset(); g_notouch_active=0; { tesla_frame_t in=mk370(0x802);
        modemdr_on_can_0x370(&in); CHECK(g_sent_n==0,"未激活不注入"); }
    reset(); g_notouch_active=1; { tesla_frame_t in=mk370(0x500); /* 远离中位 */
        modemdr_on_can_0x370(&in); CHECK(g_sent_n==0,"远离中位不注入"); }
    reset(); g_notouch_active=1; { tesla_frame_t in=mk370(0x802); in.data[7]^=0xff;
        modemdr_on_can_0x370(&in); CHECK(g_sent_n==0,"校验错不注入"); }

    /* 5. 子模式 恒低/恒高 */
    reset(); g_notouch_active=1; t_submode=1; { tesla_frame_t in=mk370(0x802);
        modemdr_on_can_0x370(&in); CHECK(g_sent_n==1 && v12(&g_sent[0])==0x7a8,"submode1 恒低 0x7a8"); }
    reset(); g_notouch_active=1; t_submode=2; { tesla_frame_t in=mk370(0x802);
        modemdr_on_can_0x370(&in); CHECK(g_sent_n==1 && v12(&g_sent[0])==0x85c,"submode2 恒高 0x85c"); }
    t_submode=0;

    /* 6. 分发门控 */
    reset(); g_config[5]=0; modemdr_dispatch(5);
        CHECK(g_notouch_active==0,"val0 滚轮: 不激活无感");
    reset(); g_config[5]=1; uint8_t c0=g_notouch_counter; modemdr_dispatch(5);
        CHECK(g_notouch_active==1 && g_sched_n==1,"val1 无感: 激活+调度时窗");
        CHECK(g_notouch_counter==((c0+1)&3),"无感: 计数器递增");
        CHECK(g_sched_ms==5000,"时窗=s*1000ms");
    reset(); g_config[5]=2; modemdr_dispatch(5);
        CHECK(g_notouch_active==1,"val2 两者: 无感也激活");
    reset(); g_config[5]=1; t_entry=0; modemdr_dispatch(5);
        CHECK(g_notouch_active==0,"entry_gate=0: 不动作"); t_entry=1;
    reset(); g_config[5]=1; modemdr_dispatch(0);
        CHECK(g_notouch_active==0,"s=0: 不激活无感");
    reset(); g_config[3]=0x0f; g_config[5]=1; modemdr_dispatch(5);
        CHECK(g_notouch_active==0,"时间哨兵0xf: 不激活");

    /* 7. 定时回调清零激活标志 */
    reset(); g_config[5]=1; modemdr_dispatch(5);
        CHECK(g_notouch_active==1 && g_sched_cb!=0,"激活+回调已注册");
        if(g_sched_cb) g_sched_cb();
        CHECK(g_notouch_active==0,"定时回调清激活标志");

    /* 8. 加法校验已知向量 */
    { tesla_frame_t f; memset(&f,0,sizeof f); f.id=0x370; f.dlc=8;
      f.data[0]=0x11; f.data[1]=0x22; f.data[6]=0x33;
      uint8_t s=(0x03+0x70+0x11+0x22+0x33)&0xff;
      CHECK(tesla_addsum(&f,7)==s,"加法校验向量"); }

    printf("\n  ModeMDR host tests: %d passed, %d failed\n", g_pass, g_fail);
    return g_fail?1:0;
}
