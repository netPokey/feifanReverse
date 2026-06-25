# 9 (v9) — CAN ID 逐位解析（TESLA_CAN_DECODE_PERID）

> 固件 `9 (v9)`（77824 B / 0x13000）。**自动生成**：`FULL=1 scripts/gen_perid.py`。
> 锚点：分发表 `0x0800cdfe` · signal_state `0x080002a8` · 0xB0打包器 `0x0800bbc4` · 复位 `0x08010772`。
> 命名与置信度（✔✔双源/◎单源/⚠分歧）详见同目录 `TESLA_CAN_OFFICIAL_NAMES.md`；**位布局为固件反汇编实证（✔FW）**。

**72 个 CAN ID**　类型分布：`{'custom': 67, 'STATE': 5}`

| CAN ID | 命名（◎ref/多源） | 类型 | 读取位（Dn=数据字节，✔FW） |
|--------|------------------|------|----------------------------|
| 0x080 | ? | custom | · |
| 0x082 | UI_tripPlanning | custom | @2 |
| 0x0a9 | (车身控制簇) | custom | D0 D1&1 |
| 0x0f4 | ? (8/9新增) | custom | · |
| 0x0ff | ? | custom | · |
| 0x101 | ? | custom | · |
| 0x102 | VCLEFT_doorStatus | custom | D0 D1>>4&1 D0&0xff D1>>5&1 |
| 0x103 | VCRIGHT_doorStatus | custom | D0&0xf D0 D0 D0 D7 |
| 0x118 | DI_systemStatus ✔✔ | custom | D2 D4 D4 |
| 0x129 | SCCM_steeringAngleSensor | custom | D3&0x3f D2&0x3f @0 |
| 0x132 | BMS_hvBusStatus | STATE | · |
| 0x145 | ESP_status (8/9新增) | custom | D5>>6 D3>>6 |
| 0x189 | (控制簇) | custom | · |
| 0x1f9 | ? | custom | · |
| 0x20c | VCRIGHT_hvacRequest | custom | D1&7 D0&7 D4&7 D5&3 |
| 0x21c | (控制簇) | custom | D6 |
| 0x229 | SCCM_rightStalk | custom | D1 D2&-0x71&-4 D1&0xf |
| 0x238 | UI_driverAssistMapData | custom | D1&0x1f |
| 0x243 | VCRIGHT_hvacStatus | custom | D0 |
| 0x249 | SCCM_leftStalk | custom | D1&0xf |
| 0x257 | DI_speed | custom | D4&1 D3&1 |
| 0x25a | VCSEC_TPMSDisplay | custom | D0 D1 D2 D3 |
| 0x25d | APP_trafficControl | custom | @2 |
| 0x266 | DIR_power ⚠ | custom | D1&7 D0&7 |
| 0x273 | UI_vehicleControl | STATE | · |
| 0x292 | BMS_socStatus | custom | · |
| 0x293 | UI? ⚠分歧 | custom | D6 |
| 0x2b4 | PCS_dcdcRailStatus (8/9新增) | custom | · |
| 0x2b6 | ? | custom | D0&-0x79 D1 |
| 0x2e1 | VCFRONT_status | custom | D0&7>>3 |
| 0x2e5 | DIF_power ◎ | custom | · |
| 0x2f3 | UI_hvacRequest ✔✔ | custom | D3 D3&0x1f D2>>4 |
| 0x31f | PARK_status ◎ | custom | D0 D2 D4 D6 |
| 0x321 | VCFRONT_sensors | custom | D5 |
| 0x332 | BMS_bmbMinMax | STATE | D0&3 |
| 0x333 | UI_chargeRequest | custom | D0&3&-4 D3 |
| 0x334 | UI_powertrainControl | custom | · |
| 0x339 | VCSEC_authentication | custom | D1>>4 |
| 0x33a | UI_range | custom | D5 D2>>4&7 D3&7 D1&3 D0&3 |
| 0x352 | BMS_energyStatus(mux) | custom | · |
| 0x370 | SCS_alertMatrix2 (8/9新增) | custom | D6&0xe0 D8 |
| 0x37a | ? | custom | D0&0x40 D1&0x20 |
| 0x399 | DAS_status (8/9新增) | custom | · |
| 0x39b | ? (8/9新增) | custom | · |
| 0x39d | IBST_status | custom | D3>>9 D1>>9 |
| 0x3a1 | VCFRONT_vehicleStatus | custom | D1 |
| 0x3b3 | STATE? | STATE | · |
| 0x3b6 | DI_odometerStatus | custom | D1 D2 D0 D3 |
| 0x3c2 | VCLEFT_switchStatus | custom | D0&3 |
| 0x3c3 | ? | custom | D0&3 D5&0xf D5&0xc0 |
| 0x3d2 | BMS_kwhCounter | custom | · |
| 0x3d8 | UI_elevationStatus | custom | D1&0x3f D0&0x3f |
| 0x3df | STATE? | custom | · |
| 0x3e2 | VCLEFT_lightStatus | custom | D1 D2&1 D0&3 |
| 0x3e3 | VCRIGHT_lightStatus | custom | D1&1 |
| 0x3e9 | DAS_bodyControls | STATE | · |
| 0x3ea | ? (8/9新增) | custom | D1&0x40 D2&1 |
| 0x3f5 | VCFRONT_lighting | custom | D4 D0>>4 D0>>4>>2 D4 |
| 0x3fd | UI_autopilotControl | custom | · |
| 0x3fe | brake温? | custom | D2>>6 D1>>6&0x3f D5>>6&0x3f D3>>4 D4&3 D6&0xf |
| 0x3ff | ? | custom | · |
| 0x400 | ? | custom | · |
| 0x401 | BMS_brickMeasurements | custom | · |
| 0x405 | ? | custom | D0 |
| 0x498 | ? (8/9新增) | custom | · |
| 0x4e2 | VCLEFT_seatStatus | custom | · |
| 0x4e3 | VCRIGHT_seatStatus | custom | · |
| 0x4f3 | ? | custom | @2 |
| 0x678 | GTW_gearControl? | custom | D1 |
| 0x679 | ? | custom | D4>>8&0x1f D4&0x7f&-0x80 @2 D5 |
| 0x68c | (控制簇) | custom | · |
| 0x7ff | ?(广播/特殊) | custom | D0 D5&7 D1>>3&1 |

> 关键字符串：['BLE-M3', 'CH32V20x_BLE_LIB_V1.3']
