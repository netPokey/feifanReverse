#include "config_store.h"
#include <string.h>
static uint8_t s_cfg[CFG_LEN];
static uint8_t s_blocks[BLK_KINDS][CFG_GROUPS][CFG_BLOCK_LEN];
static ota_flash_write_fn s_ota_writer;

void config_store_init(void){ memset(s_cfg,0,sizeof s_cfg); memset(s_blocks,0,sizeof s_blocks); s_ota_writer=0; }
void config_write(const uint8_t *p, uint16_t len){ if(len>CFG_LEN) len=CFG_LEN; memcpy(s_cfg,p,len); }
const uint8_t *config_buf(void){ return s_cfg; }

uint8_t config_get_bits(uint8_t off, uint8_t shift, uint8_t mask){
    if (off>=CFG_LEN) return 0; return (uint8_t)((s_cfg[off]>>shift)&mask);
}
void config_set_bits(uint8_t off, uint8_t shift, uint8_t mask, uint8_t val){
    if (off>=CFG_LEN) return;
    s_cfg[off] = (uint8_t)((s_cfg[off] & ~(mask<<shift)) | ((val&mask)<<shift));  /* 清位→写位 */
}
const uint8_t *config_block(cfg_block_kind_t k, uint8_t g){
    if (k>=BLK_KINDS||g>=CFG_GROUPS) return 0; return s_blocks[k][g];
}
void config_block_write(cfg_block_kind_t k, uint8_t g, const uint8_t *d){
    if (k>=BLK_KINDS||g>=CFG_GROUPS) return; memcpy(s_blocks[k][g], d, CFG_BLOCK_LEN);
}
void ota_set_flash_writer(ota_flash_write_fn fn){ s_ota_writer = fn; }
int  ota_on_page(uint16_t page_no, const uint8_t *data, uint16_t len){
    if (!s_ota_writer) return 0;
    return s_ota_writer(page_no, data, len);   /* 端口擦写 flash; 返回 1=ok */
}
