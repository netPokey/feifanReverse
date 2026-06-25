# feifan 蓝牙↔CAN 固件逆向 — 多版本索引

> 对象：feifan 第三方改装件的 **CH32V208**（沁恒 RISC-V）蓝牙↔特斯拉 CAN 桥接控制器固件。
> 手机小程序经 BLE 下发命令，固件改写注入特斯拉 CAN 总线。本目录用 capstone(RISC-V) 逐条反汇编 +
> 联合小程序 `../services/` + 多源 DBC 交叉，还原读链路（CAN→状态→BLE）与控链路（命令→改写注入 CAN）。

## 📦 版本（均归档于 `versions/`）

| 版本 | 目录 | 大小 | 状态 / 说明 |
|------|------|------|-------------|
| **base** (c6eec2f9) | `versions/v_base/` | 62464 B (0xF400) | ★完整逆向：10 文档（PERID/PROTOCOL/OFFICIAL_NAMES/SIGNALS/TSL/SPEC/3×CH32V208 等） |
| **8** (TSL8) | `versions/v8/` | 77824 B (0x13000) | 功能演进版：新增 ESP/DAS/PCS/SCS 监控；含 PERID（72 ID）+ 综合 README |
| **9** (TSL9) | `versions/v9/` | 77824 B (0x13000) | 与 8 **同源同功能**（仅版本号+布局微调）；PERID + 锚点差异 README |

## 🔀 版本对比

- **`versions/COMPARE_8_vs_9.md`** — 8/9 同源码两次构建，**CAN 功能完全相同**（72 ID + 逐位解析全同，仅 TSL8/TSL9 + 地址微调）。
- **`versions/COMPARE_8_vs_base.md`** — 8 是 base 的**功能演进**：净 +5 个 CAN ID（新增 `0x145 ESP_status`、
  `0x399 DAS_status`、`0x2b4 PCS_dcdcRailStatus`、`0x370 SCS_alertMatrix2` 等，删除 `0x312 BMS_thermalStatus`），+15 KB，新增 `BLE-M3` 标识。

## 🛠 共享脚本（`scripts/`，capstone 5.0.7 RISC-V，无外部依赖）

**多版本通用**（自动定位锚点，支持任意固件）：
- `tsl2bin.py` — OTA JSON 包（去页号拼接）→ bin
- `fwlocate.py` — 自动定位锚点（复位/分发表/state_helper/打包器/BLE 区）
- `fwanalyze.py` — 综合分析（分发表→ID→handler→type→读位+字符串；`FULL=1` 全扫含子树）
- `gen_perid.py` — 生成版本 PERID 表（72 ID + 命名 + 逐位）
- `gen_signals.py` — 生成信号清单（需 2026.2 数据）

**base 专用**（硬编码 base 地址，复现 base 分析）：
`fwall fwbits fwdecode fwleaf fwfind fwpack fwtx fwresign fwsend fwsend2 fwsend3 fwcallers fwpipe fwidx fwstate fwb0 symexec fwdis`

## 🧭 阅读指引

- **分析某版本**：从 `versions/v<N>/README.md` 入手（锚点 + CAN ID + 差异 + 复用指引）。
- **通用 CAN 语义**（命名/信号/控制注入原理/BLE 命令字典）：在 `versions/v_base/`，**版本无关**，三版通用。
- **版本演进**：先读两份 `COMPARE_*.md`。
- **证据等级**：✔FW 固件实证 / ✔APP 小程序佐证 / ✔✔ 多源一致 / ◎ 单源 / ⚠ 分歧（详见 `v_base/TESLA_CAN_OFFICIAL_NAMES.md §0`）。

## ✅ 关键结论速览
- **8/9 = 同一逻辑固件**（同源构建），对 8 的逆向全部适用于 9。
- **base→8 = 监控扩展**（底盘稳定 ESP / 驾驶辅助 DAS / 电源 PCS），解析框架（state_helper/打包器/分发器）不变。
- 三版均为 CH32V208 + `CH32V20x_BLE_LIB_V1.3`，控制注入机制一致（re-sign 改写 + 原 ID 回注 + BLE 透传）。
