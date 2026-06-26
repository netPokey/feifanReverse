#include "signal_state.h"
#include <string.h>
uint8_t g_ss_gp[SS_GP_SIZE];
uint8_t g_ss_idx[SS_IDX_COUNT][SS_IDX_SIZE];
void ss_set16(uint16_t off, uint16_t v){ g_ss_gp[off]=(uint8_t)v; g_ss_gp[off+1]=(uint8_t)(v>>8); }
uint16_t ss_get16(uint16_t off){ return (uint16_t)(g_ss_gp[off] | (g_ss_gp[off+1]<<8)); }
void ss_store_frame(uint8_t idx, const uint8_t *d){ if(idx<SS_IDX_COUNT) memcpy(g_ss_idx[idx], d, 8); }
