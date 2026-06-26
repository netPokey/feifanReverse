/* config_store.h — 配置存储 (163 设置位图[24..34] + 171/185/186 256B 块 + OTA 接口)
 * 据 TSL_REFERENCE §2.6/§2.7 + BLE_PROTOCOL §7/§9-11。*/
#ifndef CONFIG_STORE_H
#define CONFIG_STORE_H
#include <stdint.h>
#define CFG_LEN 76
#define CFG_BLOCK_LEN 256
typedef enum { BLK_SHORTCUT=0/*171*/, BLK_RGB/*185*/, BLK_BTN/*186*/, BLK_KINDS } cfg_block_kind_t;
#define CFG_GROUPS 4

void     config_store_init(void);
void     config_write(const uint8_t *payload, uint16_t len);   /* 163: 写设备配置块 */
const uint8_t *config_buf(void);                               /* 76B 设备配置 (设备信息回读) */
/* 设置位读写 (settingsOptions: buf[off] 的 (mask<<shift)), off 为 rawConfig 绝对偏移[24..34] */
uint8_t  config_get_bits(uint8_t off, uint8_t shift, uint8_t mask);
void     config_set_bits(uint8_t off, uint8_t shift, uint8_t mask, uint8_t val);
/* 256B 配置块 (171/185/186), group 0..3 */
const uint8_t *config_block(cfg_block_kind_t kind, uint8_t group);
void     config_block_write(cfg_block_kind_t kind, uint8_t group, const uint8_t *data256);

/* --- OTA 接口 (85/83/87/69; 实际 flash 擦写由端口实现; 这里管协议状态) --- */
typedef int (*ota_flash_write_fn)(uint32_t page, const uint8_t *data, uint16_t len);
void     ota_set_flash_writer(ota_flash_write_fn fn);
int      ota_on_page(uint16_t page_no, const uint8_t *data, uint16_t len);  /* 0x57 页写 */
#endif
