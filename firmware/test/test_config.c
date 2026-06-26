/* test_config.c — Phase E: 设置位图 + 256B 块 + OTA 页 */
#include "config_store.h"
#include <stdio.h>
#include <string.h>
static int g_pass,g_fail;
#define CHECK(c,m) do{ if(c)g_pass++; else{g_fail++; printf("  FAIL: %s\n",m);} }while(0)
static uint32_t g_ota_page; static uint16_t g_ota_len;
static int fake_flash(uint32_t page,const uint8_t*d,uint16_t n){ (void)d; g_ota_page=page; g_ota_len=n; return 1; }

int main(void){
    config_store_init();
    uint8_t buf[76]; memset(buf,0,sizeof buf);
    buf[28]=0x08; buf[29]=0x02; buf[26]=200;     /* 模块开关bit3 / ModeMDR=2 / 音量 */
    config_write(buf,76);
    CHECK(config_get_bits(28,3,1)==1,"读 28.3 模块总开关");
    CHECK(config_get_bits(29,0,3)==2,"读 29.0 ModeMDR=2");
    CHECK(config_get_bits(26,0,0xFF)==200,"读 26.0 音量 8bit");
    CHECK(config_buf()[29]==0x02,"config_buf 暴露原缓冲");

    /* 写位算法: 清位→写位, 不影响其它位 */
    config_set_bits(29,0,3,1);                    /* ModeMDR 2->1 */
    CHECK(config_get_bits(29,0,3)==1,"写 29.0 ModeMDR=1");
    config_set_bits(28,3,1,0);                    /* 关模块开关 */
    CHECK(config_get_bits(28,3,1)==0 && config_buf()[28]==0,"写 28.3 清位且不串其它位");

    /* 256B 块 */
    uint8_t blk[256]; for(int i=0;i<256;i++) blk[i]=(uint8_t)i;
    config_block_write(BLK_RGB,1,blk);
    const uint8_t *rb=config_block(BLK_RGB,1);
    CHECK(rb && rb[0]==0 && rb[255]==255,"185 RGB 块写读");
    CHECK(config_block(BLK_SHORTCUT,0)[0]==0,"171 块独立");

    /* OTA 页 */
    ota_set_flash_writer(fake_flash);
    uint8_t page[1024]; memset(page,0xAA,sizeof page);
    CHECK(ota_on_page(5,page,1024)==1 && g_ota_page==5 && g_ota_len==1024,"OTA 页写转端口 flash");
    ota_set_flash_writer(0);
    CHECK(ota_on_page(6,page,1024)==0,"无 flash writer 时拒绝");

    printf("\n  config tests: %d passed, %d failed\n", g_pass,g_fail);
    return g_fail?1:0;
}
