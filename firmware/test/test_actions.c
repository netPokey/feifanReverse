#include "actions.h"
#include <stdio.h>
#include <string.h>
static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
int main(void){
    CHECK(action_count()>=60,"动作表 >=60 条");
    const action_t *a=action_lookup(0xBB,102); CHECK(a && strstr(a->name,"挂P"),"187/102=挂P");
    a=action_lookup(0xBB,62); CHECK(a && strstr(a->name,"解锁"),"187/62=解锁");
    a=action_lookup(0xA7,0); CHECK(a && strstr(a->name,"左前门"),"167/0=左前门");
    a=action_lookup(0xBB,253); CHECK(a && strstr(a->name,"重启"),"187/253=模块重启");
    CHECK(action_lookup(0xBB,77)==0,"未定义码返回0");
    printf("\n  actions tests: %d passed, %d failed\n",g_pass,g_fail);
    return g_fail?1:0;
}
