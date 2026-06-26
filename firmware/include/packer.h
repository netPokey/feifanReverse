/* packer.h — 状态表 → BLE notify 包 (固件打包器; app gaugeParser/batteryParser 反解)
 * 约定: app 读 m(buf,off)=小端32位, 再 >>shift & mask → 故按绝对位(off*8+shift)打包。*/
#ifndef PACKER_H
#define PACKER_H
#include <stdint.h>
#define PACK_GAUGE_LEN   33   /* 0xB0 仪表 */
#define PACK_BATTERY_LEN 29   /* 0xD0 电池 */
void pack_gauge(uint8_t *out33);     /* 读具名信号 → 33B 仪表包 */
void pack_battery(uint8_t *out29);   /* 读具名信号 → 29B 电池包 */
#endif
