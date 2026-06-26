#include "ble_router.h"
#define BLE_ROUTER_MAX 48
static struct { uint8_t type; ble_handler_fn h; } s_tab[BLE_ROUTER_MAX];
static int s_n;
void ble_router_reset(void){ s_n = 0; }
int ble_router_register(uint8_t type, ble_handler_fn h){
    if (s_n >= BLE_ROUTER_MAX) return 0;
    s_tab[s_n].type=type; s_tab[s_n].h=h; s_n++; return 1;
}
void ble_router_dispatch(const ble_msg_t *m){
    for (int i=0;i<s_n;i++) if (s_tab[i].type==m->type){ if(s_tab[i].h) s_tab[i].h(m); return; }
}
