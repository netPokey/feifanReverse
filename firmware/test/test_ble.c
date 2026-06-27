/* test_ble.c — Phase C: 鉴权 + 命令字典 + 轮询 */
#include "ble_app.h"
#include "ble_auth.h"
#include "ble_proto.h"
#include "tesla_frame.h"
#include <stdio.h>
#include <string.h>

/* fakes */
static struct { uint8_t type; uint16_t len; uint8_t p[64]; } g_ntf[16]; static int g_ntf_n;
void ble_hal_notify(uint8_t t, const uint8_t *p, uint16_t n){
    if(g_ntf_n<16){ g_ntf[g_ntf_n].type=t; g_ntf[g_ntf_n].len=n; if(n>64)n=64; memcpy(g_ntf[g_ntf_n].p,p,n); g_ntf_n++; } }
void mdr_hal_can1_send(const tesla_frame_t *f){ (void)f; }
void mdr_hal_schedule(void(*cb)(void),uint32_t ms){ (void)cb;(void)ms; }
static int g_reboot; void ble_hal_reboot(void){ g_reboot=1; }
static uint8_t g_ctrl_type; static void clear(void){ g_ntf_n=0; g_ctrl_type=0; }
void control_on_cmd(uint8_t t,const uint8_t*p,uint16_t n){ (void)p;(void)n; g_ctrl_type=t; }

static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
static ble_msg_t msg(uint8_t t,const uint8_t*p,uint16_t n){ ble_msg_t m; m.type=t; m.len=n; if(p)memcpy(m.payload,p,n); return m; }
static int got(uint8_t t){ for(int i=0;i<g_ntf_n;i++) if(g_ntf[i].type==t) return 1; return 0; }
static int got_len(uint8_t t){ for(int i=0;i<g_ntf_n;i++) if(g_ntf[i].type==t) return g_ntf[i].len; return -1; }

int main(void){
    /* 1. 鉴权 */
    ble_auth_init();
    uint8_t bad[4]={'0','0','0','0'}, good[4]={'1','2','3','4'};
    CHECK(ble_auth_check(bad)==0 && !ble_auth_is_authed(),"错密码");
    CHECK(ble_auth_check(good)==1 && ble_auth_is_authed(),"对密码 1234");
    ble_auth_init();
    CHECK(ble_auth_check(bad)==0 && ble_auth_check(bad)==0 && ble_auth_check(bad)==0,"3 次失败");
    CHECK(ble_auth_check(bad)==254,"失败超限锁定");
    ble_auth_reset_window(); CHECK(ble_auth_check(good)==1,"窗口重置后可用");

    /* 2. 鉴权门: 未鉴权命令被拒 */
    ble_app_init(); clear();
    uint8_t on[1]={1};
    ble_app_on_msg(&(ble_msg_t){.type=0xB0,.len=1,.payload={1}});  /* 未鉴权 */
    ble_app_poll_tick(); CHECK(!got(0xB0),"未鉴权 0xB0 轮询被拒");

    /* 3. 鉴权握手 */
    { ble_msg_t m=msg(0xA8,good,4); ble_app_on_msg(&m); }
    CHECK(got(0xA8),"168 回执"); CHECK(got(0xA0),"鉴权成功补发 160 设备信息");
    CHECK(g_ntf[0].type==0xA8 && g_ntf[0].p[0]==1,"168,[1]=正确");

    /* 4. 鉴权后命令生效 */
    clear(); { ble_msg_t m=msg(0xA0,0,0); ble_app_on_msg(&m); } CHECK(got(0xA0),"0xA0 设备信息");
    clear(); { uint8_t cfg[0x4c]; memset(cfg,0,sizeof cfg); cfg[29]=1; ble_msg_t m=msg(0xA3,cfg,0x4c);
        ble_app_on_msg(&m); } CHECK(got(0xA0),"0xA3 写配置回读 160");

    /* 5. 轮询开关 */
    clear(); { ble_msg_t m=msg(0xB0,on,1); ble_app_on_msg(&m); } ble_app_poll_tick();
    CHECK(got(0xB0),"0xB0 开仪表轮询 -> 推 33B");
    CHECK(g_ntf[0].len==33,"仪表包 33B");
    clear(); { ble_msg_t m=msg(0xD0,on,1); ble_app_on_msg(&m); } ble_app_poll_tick();
    CHECK(got_len(0xD0)==29,"0xD0 电池轮询 -> 29B");
    clear(); { uint8_t off[1]={0}; ble_msg_t m=msg(0xB0,off,1); ble_app_on_msg(&m); } ble_app_poll_tick();
    CHECK(!got(0xB0),"0xB0,[0] 关轮询");

    /* 6. 控制命令转交 */
    clear(); { uint8_t a[1]={5}; ble_msg_t m=msg(0xA7,a,1); ble_app_on_msg(&m); }
    CHECK(g_ctrl_type==0xA7,"0xA7 转交控制模块");
    clear(); { uint8_t a[1]={3}; ble_msg_t m=msg(0xBB,a,1); ble_app_on_msg(&m); }
    CHECK(g_ctrl_type==0xBB,"0xBB 转交控制模块");

    /* 7. 新增命令 */
    clear(); g_reboot=0; { uint8_t u[14]={0}; ble_msg_t m=msg(0xA5,u,14); ble_app_on_msg(&m); }
    CHECK(g_reboot==1,"165 重启");
    clear(); { uint8_t np[4]={'8','8','8','8'}; ble_msg_t m=msg(0xA9,np,4); ble_app_on_msg(&m); }
    CHECK(got(0xA9),"169 改密回执");
    { uint8_t np[4]={'8','8','8','8'}; CHECK(ble_auth_check(np)==1,"169 新密码生效"); }
    clear(); { uint8_t on1[1]={1}; ble_msg_t m=msg(0xC0,on1,1); ble_app_on_msg(&m); }
    CHECK(ble_app_debug_on()==1,"192 调试监听开");
    clear(); { ble_msg_t m=msg(0xC1,0,0); ble_app_on_msg(&m); } CHECK(got(0xC1),"193 车型查询回");
    clear(); { uint8_t cell[8]={1,2,3,4,5,6,7,8}; ble_app_set_cell(cell); uint8_t on1[1]={1}; ble_msg_t m=msg(0xD1,on1,1); ble_app_on_msg(&m); }
    ble_app_poll_tick(); CHECK(got_len(0xD1)==8,"209 电芯轮询 8B");

    printf("\n  ble tests: %d passed, %d failed\n", g_pass,g_fail);
    return g_fail?1:0;
}
