#include "ble_auth.h"
#include <string.h>
static uint8_t s_pwd[4] = {'1','2','3','4'};   /* 默认 1234 */
static int s_authed, s_fails;
#define MAX_FAILS 3
void ble_auth_init(void){ s_authed=0; s_fails=0; }
int  ble_auth_is_authed(void){ return s_authed; }
void ble_auth_set_password(const uint8_t p[4]){ memcpy(s_pwd,p,4); }
void ble_auth_reset_window(void){ s_fails=0; }
int  ble_auth_check(const uint8_t p[4]){
    if (s_fails >= MAX_FAILS) return 254;              /* 锁定 */
    if (memcmp(p, s_pwd, 4)==0){ s_authed=1; s_fails=0; return 1; }
    s_fails++; return 0;
}
