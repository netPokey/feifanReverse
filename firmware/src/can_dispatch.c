#include "can_dispatch.h"
#define CAN_DISPATCH_MAX 96
static struct { uint16_t id; can_handler_fn h; } s_tab[CAN_DISPATCH_MAX];
static int s_n;
void can_dispatch_reset(void){ s_n = 0; }
int can_dispatch_register(uint16_t id, can_handler_fn h){
    if (s_n >= CAN_DISPATCH_MAX) return 0;
    s_tab[s_n].id = id; s_tab[s_n].h = h; s_n++; return 1;
}
void can_dispatch(const tesla_frame_t *f){
    for (int i=0;i<s_n;i++) if (s_tab[i].id==f->id){ if(s_tab[i].h) s_tab[i].h(f); return; }
}
