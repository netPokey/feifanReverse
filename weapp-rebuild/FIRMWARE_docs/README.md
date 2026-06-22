# 特斯拉 CAN 固件逆向 — 文档总索引（README）

> 对象：`c6eec2f9-firmware.bin`（CH32V208，沁恒 RISC-V，62 464 B，裸机无符号）——
> "feifan" 第三方改装件：**蓝牙 ↔ CAN 桥接控制器**，手机小程序经 BLE 下发命令，固件改写注入特斯拉 CAN 总线。
>
> 本目录用 capstone(RISC-V) 逐条反汇编固件 + 联合小程序 `services/` + 多源 DBC 交叉，
> 还原**读链路**（CAN→状态→BLE 上报）与**控链路**（命令→改写注入 CAN）的完整位级定义，目标是**可据以重写固件**。

## 📂 文档体系与阅读顺序

### A. 重写主线（校验后，命名以此为准）
| # | 文档 | 作用 |
|---|------|------|
| 1 | **`FIRMWARE_REWRITE_SPEC.md`** | ★总纲：6 模块重写规格 + 速查 + 实施顺序（**从这读起**） |
| 2 | `TESLA_CAN_DECODE_PERID.md` | 读链路：53 监控 ID 逐位解析 + 电池包逐字节（§5） |
| 3 | `TESLA_CAN_PROTOCOL_FIRMWARE.md` | 控链路：主分发器 + 控制注入三路径 + 32 发送点改写映射 |
| 4 | `TESLA_CAN_OFFICIAL_NAMES.md` | ★命名校验：固件 2026.2 × 多 DBC × 小程序交叉，**置信度分级**（命名争议以此为准） |
| 5 | `TESLA_CAN_TSL_REFERENCE.md` | TSL 模块 / 0xB0 仪表包 / BLE notify 字段参考 |

### B. BLE 协议与固件结构
| # | 文档 | 作用 | 注意 |
|---|------|------|------|
| 6 | **`FIRMWARE_CH32V208_BLE_PROTOCOL_DEEP_ANALYSIS.md`** | ★BLE 命令字典 `160–240` + 三级鉴权 + 上行通知（独特，不可替代） | 现行 |
| 7 | `FIRMWARE_CH32V208_DEEP_ANALYSIS.md` | 固件整体结构 / 解码·发送例程详解 | ⚠ 部分 CAN ID 命名为**校验前旧版**，以 #4 为准 |
| 8 | `FIRMWARE_CH32V208_CAN_ID_ANALYSIS.md` | 早期 CAN ID 清单（已被 #2/#4 取代） | ⚠ 命名旧版，以 #4 为准 |

## 🏷 证据等级图例（全目录通用）
- **✔FW**：固件反汇编实证（第一手，最高）
- **✔APP / ✔双证**：小程序 `services/` 佐证（feifan 同版本，优先级高于外部 DBC）
- **✔✔**：≥2 独立来源（2026.2 / commaai / joshwardell DBC）命名一致
- **◎ref / ◎常见**：单一外部来源（社区 DBC / 2026.2），版本敏感
- **⚠**：多源分歧或存疑，**不可武断采信**（详见 #4 §0）

## ✅ 完整度总览
- **读链路**：53 监控 ID 全逐位读取（16 个位级精确公式）；电池包逐字节（固件×小程序双证）；
  0xB0 仪表打包器位布局；BLE notify 全字段。**可据以重写。**
- **控链路**：主分发器结构（`0x08009e2e–0x0800a720`）；三注入路径（解析区 re-sign 改 12 监控 ID /
  分发流水线改 8 控制帧 ID / BLE 透传）；32 发送点的触发状态+改写位；CRC/Counter↔re-sign 闭环。**机制完整。**
- **命名**：41/47 ID 经多源交叉命中，置信度分级；关键修正（0x339=VCSEC 前备箱/尾门等）。

## ⬜ 剩余缺口（诚实清单，均不阻塞重写）
1. **静态分析边界**（固件架构决定，静态不可达）：~3 个 gp 触发点（`0x08006dd2/f42/7466`，纯间接 `jalr`）
   的确切 ID、`idx13`（动态 idx）依运行时上下文。
2. **存疑命名**（已标注，待更多证据）：`0x293`（三源三名）、`0x266/0x2e5`（DIR/DIF_power vs DI_vehicleEstimates）。
3. **可选增强**：2026.2 的 40484 信号仅逐帧补全了改写相关帧，其余监控 ID 的逐信号字段可按需扩充。

## 🛠 复现脚本（`scripts/`，capstone 5.0.7 RISC-V，无外部依赖）
`fwdis`(反汇编) · `fwall`/`fwbits`(分发器+逐ID读位) · `fwleaf`/`fwfind`(子树节点) · `fwpack`(打包器) ·
`fwdecode`(单ID解码) · `fwtx`/`fwresign`/`fwsend`/`fwsend2`/`fwsend3`(发送点/重签名/改写映射) ·
`fwcallers`(反向调用图) · `fwpipe`(主分发器ID分发) · `fwidx`/`fwstate`(signal_state idx) ·
`fwb0`(0xB0打包器) · `symexec`(167跳转表符号执行)
