> ⚠ **版本适配（9/TSL9）**：本文为**通用 CAN 语义/机制**（版本无关，源自 base 逆向），对版本 9 同样适用。
> 本版完整 72 CAN ID 逐位解析见 [`./TESLA_CAN_DECODE_PERID.md`](./TESLA_CAN_DECODE_PERID.md)，锚点/差异见 [`./README.md`](./README.md)。
> **含具体地址处为 base 基线**，版本 9 按锚点偏移（见 [`../COMPARE_8_vs_base.md`](../COMPARE_8_vs_base.md)）。

---

# CH32V208 特斯拉 CAN 控制器 — 固件重写规格书（总纲）

> 本文是**据固件逆向重写整套固件**的总入口：给出架构全景、6 大模块的实现规格与完成度、
> 关键速查表（地址/命令字/CAN ID/算法），并指向各详细文档。读这一份即可掌握全貌，细节按链接深入。
>
> 对象固件：`firmware.bin`（62 464 B），WCH **CH32V208**（青稞 V4 RV32IMAC）+ `CH32V20x_BLE_LIB_V1.3` + bxCAN。
> 产品：「TSL 电子模块」——蓝牙控制的**特斯拉车辆 CAN 收发/分析/注入器**。证据级别：**✔FW**=反汇编实证，**✔APP**=小程序佐证。

---

## 0. 架构全景（两条数据链路）

```
┌─────────────────────────── 接收链路（读状态）───────────────────────────┐
 特斯拉 CAN 总线
   └ bxCAN 硬件过滤(全通/白名单/蓝牙下发) → CAN_RX_ISR(0x0800825e) → rx_store(0x08008218)
       帧结构 12B: [ID:u16@0][DLC@2][D0@3..D7@10][pad@11]
       └ decode_dispatch(0x08009e2e) 按 ID 二分 → 解码器(4型) → 信号状态表(0x08000272,12B/条,gp区)
           ├ STATE: 整帧 memcpy 入表    ├ custom: 逐位拆 D0..D7 写 gp+off
           └ SCALE: ×10/16 换算         └ TXINJECT: 改写回注(见发送链路)
       └ 手机发 tx(0xB0/0xD0/0xD1/0xD2) → 打包器读状态表 → 位压缩成 33B/29B 包 → ble_notify(0x08000c02)
           → 手机小程序 gaugeParser/batteryParser 定标 → 展示页
┌─────────────────────────── 发送链路（控功能）───────────────────────────┐
 手机小程序 tx(type, payload)  ── 0x55 0x7F <type> <lenHi> <lenLo> <payload> <校验> ──>
   └ GATT 写回调 → 命令分发(0x0800957e) 按命令码(160..240)分支
       ├ 167(0xA7): 跳转表(0x0800b33a→0x0800ef38) 动作码→内部号→处理函数→(异步)合成CAN
       ├ 187(0xBB)/162(0xA2): 共用执行器(0x0800954e) 置内部动作号
       ├ TXINJECT: 收到帧改数据位+滚动计数器(D6)+CRC(D7)+原ID回注 → tx_wrapper(0x08008062)
       └ BLE→CAN 透传(0x08009a80): frame=payload[0..1]为ID+payload[2..]为数据 → 发任意帧
           全部发送先过门禁 CAN_TX(0x080001d4, 默认 LISTEN_ONLY)
```

---

## 1. 六大重写模块（规格 + 完成度 + 详档）

| # | 模块 | 关键实现点 | 完成度 | 详细文档 |
|---|------|-----------|--------|----------|
| 1 | **外设初始化** | bxCAN(CAN1=0x40006400) FilterInit/Transmit/Receive；BLE Lib(FFF0/FFF1)；复位 0x0800d034, gp=0x27ffc000 | ✅ 地址级 | `FIRMWARE_CH32V208_DEEP_ANALYSIS.md` §1-2 |
| 2 | **CAN 接收解析** | 53 监控 ID + 8 扩展 ID 全分类；分发器 BST；每 ID 解码器地址+读位+写状态变量 | ✅ 全分类；🔶 12/53 逐位精确 | `TESLA_CAN_DECODE_PERID.md`（主） |
| 3 | **状态打包** | 0xD0 电池包(29B)/0xB0 仪表包(33B) 从状态表位压缩；idx→CAN ID 映射 | ✅ 电池包逐字节(0x132/0x3d2直传) | `TESLA_CAN_DECODE_PERID.md` §5 |
| 4 | **BLE 协议** | 帧格式(0x55 0x7F+校验)；命令字 160-240；4 字节密码鉴权(168)；三级权限 | ✅ 完整 | `FIRMWARE_CH32V208_BLE_PROTOCOL_DEEP_ANALYSIS.md` |
| 5 | **控制注入** | 命令分发；167 跳转表(72码)；re-sign 重签名；BLE→CAN 透传；32 发送点 | ✅ 机制完整；⬜ 逐动作CAN帧 | `TESLA_CAN_PROTOCOL_FIRMWARE.md` §4 |
| 6 | **配置/OTA/桥接** | 163 设置位图[24..34]；171/185/186 256B 块；OTA(云端+BLE 85/83/87/69)；240 蓝牙主机 | ✅ 协议级 | `FIRMWARE_CH32V208_BLE_PROTOCOL_DEEP_ANALYSIS.md` §7,9-11 |

---

## 2. 关键速查表

### 2.1 核心函数地址 ✔FW
| 地址 | 函数 | 地址 | 函数 |
|------|------|------|------|
| 0x0800d034 | Reset/_start | 0x08008062 | tx_wrapper(发送封装) |
| 0x0800d526 | CAN_FilterInit | 0x08008116 | filter_load(白名单) |
| 0x0800d628 | CAN_Transmit | 0x080080ce | filter_acceptall(全通) |
| 0x0800d6fc | CAN_Receive | 0x0800825e | CAN_RX_ISR |
| 0x08009e2e | decode_dispatch | 0x08008218 | rx_store |
| 0x08000272 | signal_state(状态表) | 0x08000c02 | ble_notify |
| 0x080001a6 | scale_helper(×10/16) | 0x080001d4 | CAN_TX 门禁 |
| 0x0800957e | 命令分发器 | 0x0800b33a | 167 动作执行器 |
| 0x0800ef38 | 167 跳转表(72项) | 0x080097cc | 0xD0 电池打包器 |
| 0x08008f44 | 0xB0 仪表打包器 | ~0x0800eb00 | CRC 表 |
| 0x0800f188 | 监控 ID 表(53) | 0x0800f17a | 注入/事件短表(6) |

### 2.2 BLE 命令字 160-240（type=帧第3字节）✔FW/✔APP
| type | 功能 | type | 功能 | type | 功能 |
|------|------|------|------|------|------|
| 0xA0(160) | 读设备信息 | 0xA8(168) | 蓝牙密码校验(默认1234) | 0xBB(187) | 执行动作(fun表~200) |
| 0xA2(162) | 模拟滚轮(1-6) | 0xA9(169) | 改密 | 0xC0(192) | 调试监听(需工厂) |
| 0xA3(163) | 写经典设置 | 0xAB(171) | 快捷指令配置 | 0xC1(193) | 车型查询 |
| 0xA5(165) | 重启(14B UID) | 0xB0(176) | 仪表轮询(33B) | 0xD0(208) | 电池概览(29B) |
| 0xA7(167) | 车辆控制(72码跳转表) | 0xB9(185) | RGB | 0xD1/D2(209/210) | 电芯/DCDC |
| — | — | 0xBA(186) | 蓝牙按钮 | 0xF0(240) | 蓝牙主机配对 |

### 2.3 CAN ID 分类（53 监控，按型）✔FW
- **STATE(整帧入表,位含义在打包器)**：0x102(idx0) 0x132(1) 0x273(2) 0x292(3) 0x332(4) 0x352(6) 0x3b3(7) 0x3d2(10) 0x3df(11) 0x3e9(12) 0x3f5(14) 0x4e2(15) 0x4e3(16) 0x679(17)
- **custom(逐位拆写gp变量)**：0x103 0x118 0x129 0x20c 0x238 0x243 0x249 0x257 0x25a 0x25d 0x2e1 0x2e5 0x2f3 0x312 0x31f 0x321 0x339 0x33a 0x39d 0x3b6 0x3c2(inline) 0x3d8 0x3e2 0x3e3 0x3fd(inline) 0x401(mux) 0x405
- **TXINJECT(改写回注)**：0x082 0x1f9 0x229 0x293 0x2b6 0x333 0x3c3 0x678 + 扩展 0xa9 0x21c 0x37a 0x3a1 0x3b0 0x4a8 0x189 0x68c

### 2.4 已逐位精确的 12 个 ID（重写解析层可直接用）✔FW
```
0x118 挡位   = D2[5:7] (0/P/R/N/D)
0x257 车速   = ((D4&1)<<8)|D3, 9bit, 0x1FF无效→0, 存gp+0xF4
0x3fe 刹车温 = 4路×10bit: ((D2&0x3f)<<4)|(D1>>4) 等, 存gp+0x190/192/194/196
0x321 环境温 = D5×0.5-40
0x102/0x103 车门 = D0&0xf 等门位
0x312 热管理 = ((D6&0x1f)<<4)|(D5>>4) 等 3×9bit 温度
0x33a 续航SOC= ((D3&7)<<4)|(D2>>4)=7bit, ((D1&3)<<8)|D0=10bit, D5=0xFF无效
0x129 转角   = D2&0x3f / D3&0x3f 拼, 存gp+0x1d8/0x1dc
0x20c HVAC   = ((D1&7)<<8)|D0=11bit鼓风机, ((D5&3)<<8)|D4=10bit
0x401 单体V  = D0=mux索引, D1..D6=3×u16×1e-4V, 查表存96串
0x132 电压   = D0|D1<<8 ×0.01V; 电流 D2|D3<<8 ×-0.1A   (STATE,经打包器直传)
0x3d2 充放电 = D0..D3放电 / D4..D7充电 ×0.001kWh        (STATE,经打包器直传)
```

### 2.5 核心算法 ✔FW
```c
// (a) BLE 帧封/拆: 0x55 0x7F type lenHi lenLo payload[] checksum
checksum = (Σ from type to payload) & 0xFF
// (b) 解码定标: 有符号n位 x>=2^(n-1)?x-2^n:x; 温度×0.25-25 或×0.5-40; 功率11bit有符号/2
// (c) re-sign 注入(写回前必做):
frame[9]  += 0x10;                    // D6 滚动计数器(高nibble+1)
frame[10]  = CRC_table[frame[9]>>4];  // D7 重算CRC(查表~0x0800eb00)
// (d) BLE→CAN 透传: frame[0..1]=payload[0..1](大端ID); frame[2]=len; data=payload[2..]
```

---

## 3. 重写实施顺序（建议）

1. **骨架**：外设初始化(模块1) + BLE 帧收发(模块4 §2.5a) + 命令分发空壳。
2. **读链路**：实现 53 ID 解码器(模块2，按 `TESLA_CAN_DECODE_PERID.md` 逐 ID 读位写 gp 变量) →
   状态表 → 打包器(模块3) → notify。先做已精确的 12 个 ID，其余照读位骨架。
3. **控链路**：命令分发各 type → 167 跳转表/187 执行器/re-sign/透传(模块5)。
   逐动作 CAN 帧未尽部分，可先用 **BLE→CAN 透传**让 App 端发具体帧，或按 re-sign 机制改写。
4. **配置/OTA/桥接**(模块6) + 鉴权(模块4) + 安全门禁(CAN_TX)。

---

## 4. 文档地图

| 文档 | 用途 |
|------|------|
| **本文** `FIRMWARE_REWRITE_SPEC.md` | 总纲/索引/速查（重写入口） |
| `TESLA_CAN_DECODE_PERID.md` | 解析层：逐 ID 逐位 + 状态变量地图 + 电池包逐字节 |
| `TESLA_CAN_PROTOCOL_FIRMWARE.md` | 固件实证：解析架构 + 控制注入 + 发送点 |
| `TESLA_CAN_TSL_REFERENCE.md` | 实战手册：读状态/控功能/全算法（含动作码语义全表） |
| `FIRMWARE_CH32V208_BLE_PROTOCOL_DEEP_ANALYSIS.md` | BLE 协议：命令字典/鉴权/OTA/桥接 |
| `FIRMWARE_CH32V208_DEEP_ANALYSIS.md` / `..._CAN_ID_ANALYSIS.md` | 原始固件反汇编（外设/地址/ID 表） |

## 5. 复现脚本（`FIRMWARE_docs/scripts/`，capstone 5.0.7 RISC-V，无外部依赖）
`fwdis.py`(反汇编) · `fwall.py`/`fwbits.py`(分发器+逐ID读位) · `fwleaf.py`/`fwfind.py`(子树节点) ·
`fwpack.py`(打包器) · `fwtx.py`/`fwresign.py`(发送点/重签名) · `symexec.py`(167跳转表) ·
`fwsend.py`/`fwsend2.py`/`fwsend3.py`(32发送点改写位/地址归属/frame[0]来源) ·
`fwcallers.py`(反向调用图) · `fwpipe.py`(主分发器ID→改写函数) ·
`fwidx.py`/`fwstate.py`(signal_state idx定位) · `fwb0.py`(0xB0打包器位布局)

## 6. 完成度与剩余
- ✅ 已实证：架构、帧布局、**53+8 ID 全逐位覆盖**(16 精确公式)、电池包逐字节、命令字典、鉴权、
  167跳转表、re-sign、透传、**32 发送点改写映射**(每点触发 gp 状态 + 改写数据位)。
- ✅ **控制注入三路径全解**（非构造任意新帧，全是"改写帧位+重签名"）：
  ①解析区 re-sign 改 **12 监控 ID**(§4.9)；②分发流水线 re-sign 改 **8 控制帧 ID**
  (0xa9/0x189/0x21c/0x37a/0x3a1/0x3b0/0x4a8/0x68c，§4.10)；③BLE 透传(0x08009a80)发任意帧。
- ✅ **主分发器结构** `0x08009e2e–0x0800a720`(perid 解析分发 + re-sign 改写分发) 全解。
- ✅ **电池包 idx5/6/7/8/9 来源已解决**：`0x352` BMS_energyStatus 多路复用(mux=D0&3)，
  解析时按 mux 拆存——**idx5(容量帧)=mux=0 子帧**(此前缺失项)；idx8 由 0x08006294/631a 转发。
- ✅ **0xB0 仪表打包器位布局已解出**（8 个 getter→包字节位拼接，§5/`fwb0.py`）。
- ✅ **官方命名交叉验证**（固件 2026.2，`tesla-can-explorer`，577帧/40484信号）：41/47 监控 ID 命中权威命名，
  修正 8 处+补全多处；关键 **0x339=VCSEC_authentication**(第三方前备箱/尾门请求=改装核心功能)、
  0x2f3=UI_hvacRequest(双源确认)、0x39d=IBST_status(刹车助力)；**0x293 三源分歧存疑、0x266/0x2e5 分歧**。
  详见 `TESLA_CAN_OFFICIAL_NAMES.md`（含置信度分级与多源交叉）。
- ✅ **控制簇 ID 命名**：0x3a1=VCFRONT_vehicleStatus；余 7 个不在公开 DBC/2026.2 ETH，判为车辆总线控制簇命令帧。
- ⬜ **静态分析边界**（非遗漏，不影响重写）：~3 个 gp 触发点(0x08006dd2/f42/7466，纯间接 jalr)确切 ID、
  idx13(动态 idx) 依运行时；7 个控制簇 ID 精确信号名需 chassis/私有 DBC。

> 一句话：**读链路可据此重写（全 53 ID 逐位 + 打包器 + notify，16 位级精确）；
> 控链路三路径全解（主分发器结构 + 路径1 改 12 监控 ID + 路径2 改 8 控制帧 ID + 路径3 透传），
> 控制注入机制与目标 ID 已可据此重写。**
