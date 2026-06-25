# 固件 8（TSL8）— 综合分析

> `8.bin`（77824 B / 0x13000，CH32V208 RISC-V，由 `tsl8.txt` OTA 包经 `../../scripts/tsl2bin.py` 转换）。
> feifan 蓝牙↔CAN 桥接控制器。本目录为版本 8 的逆向；通用 CAN 语义复用 `../v_base/`，版本差异见 `../COMPARE_*.md`。

## 1. 锚点（`../../scripts/fwlocate.py` 自动定位）

| 锚点 | 地址 | 说明 |
|------|------|------|
| reset_target | `0x080106d4` | 复位向量跳转目标 |
| can_dispatch | `0x0800cd62` | CAN 分发表（59 ID 密集区） |
| state_helper | `0x0800029c` | `signal_state(cmd,idx)`，idx×12B 状态表项 |
| packer_b0 | `0x0800bb28` | 0xB0 仪表打包器 |

## 2. CAN ID（72 个，详见 `TESLA_CAN_DECODE_PERID.md`）

`../../scripts/fwanalyze.py`（FULL 全扫）提取，类型分布 `{custom:67, STATE:5}`。
完整 72 ID 的命名/类型/逐位读取见同目录 **`TESLA_CAN_DECODE_PERID.md`**（`gen_perid.py` 自动生成）。

**8 特有（相对 base 新增）**：`0x145 ESP_status`（车身稳定）、`0x399 DAS_status`（驾驶辅助）、
`0x2b4 PCS_dcdcRailStatus`（电源 DC-DC）、`0x370 SCS_alertMatrix2`、`0xf4 0x39b 0x3ea 0x498`（私有/控制簇）。

## 3. 控制注入（机制同 base，地址按锚点偏移）

8 的控制注入框架与 base 一致（`COMPARE_8_vs_base.md` 证实 state_helper/打包器/分发器机制不变）：
- **主分发器** `0x0800cd62` 起：按 CAN ID 路由（perid 解析 + re-sign 改写分发）。
- **三注入路径**：解析区 re-sign 改写监控帧 / 分发流水线 re-sign 改控制帧 / BLE 透传。
- 机制原理详见 `../v_base/TESLA_CAN_PROTOCOL_FIRMWARE.md`（版本无关）；8 的发送点地址相对 base 整体偏移
  （reset +0x3000、dispatch +0x2f00 量级）。

## 4. 设备标识 / 库
- 设备标识 **`BLE-M3`**（base 无此字符串；面向 Model 3 的蓝牙形态）。
- BLE 协议栈 `CH32V20x_BLE_LIB_V1.3`（与 base 同）。BLE 命令字典 160–240 机制见 `../v_base/FIRMWARE_CH32V208_BLE_PROTOCOL_DEEP_ANALYSIS.md`。

## 5. 版本关系
- **8 vs 9**：同源码两次构建，**CAN 功能完全相同**（仅 TSL8/TSL9 + 布局微调）→ `../COMPARE_8_vs_9.md`。
- **8 vs base**：功能演进，新增 ESP/DAS/PCS/SCS 监控、删除 BMS_thermal、+15KB → `../COMPARE_8_vs_base.md`。

## 6. 本目录文档
- `TESLA_CAN_DECODE_PERID.md` — 72 ID 逐位解析（版本特定，已生成）。
- **通用语义复用 `../v_base/`**：官方命名校验（`TESLA_CAN_OFFICIAL_NAMES.md`）、信号枚举（`TESLA_CAN_SIGNALS.md`）、
  控制注入原理（`TESLA_CAN_PROTOCOL_FIRMWARE.md`）、BLE 命令字典、重写规格——这些**版本无关**，
  对 8 同样适用（仅 ID 集合按本版 72 个、地址按 §1 锚点调整）。
