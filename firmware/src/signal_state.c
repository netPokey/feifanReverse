#include "signal_state.h"
#include <string.h>
uint8_t g_ss_gp[SS_GP_SIZE];
uint8_t g_ss_idx[SS_IDX_COUNT][SS_IDX_SIZE];
void ss_set16(uint16_t off, uint16_t v){ g_ss_gp[off]=(uint8_t)v; g_ss_gp[off+1]=(uint8_t)(v>>8); }
uint16_t ss_get16(uint16_t off){ return (uint16_t)(g_ss_gp[off] | (g_ss_gp[off+1]<<8)); }
void ss_store_frame(uint8_t idx, const uint8_t *d){ if(idx<SS_IDX_COUNT) memcpy(g_ss_idx[idx], d, 8); }

/* ---- 具名信号表 ---- */
#include "sig.h"
static int32_t g_sig[SIG_COUNT];
void    sig_set(sig_t s, int32_t v){ if((unsigned)s<SIG_COUNT) g_sig[s]=v; }
int32_t sig_get(sig_t s){ return (unsigned)s<SIG_COUNT ? g_sig[s] : 0; }
void    sig_reset(void){ for(int i=0;i<SIG_COUNT;i++) g_sig[i]=0; }
