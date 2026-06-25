> ⚠ **版本适配（8/TSL8）**：本文为**通用 CAN 语义/机制**（版本无关，源自 base 逆向），对版本 8 同样适用。
> 本版完整 72 CAN ID 逐位解析见 [`./TESLA_CAN_DECODE_PERID.md`](./TESLA_CAN_DECODE_PERID.md)，锚点/差异见 [`./README.md`](./README.md)。
> **含具体地址处为 base 基线**，版本 8 按锚点偏移（见 [`../COMPARE_8_vs_base.md`](../COMPARE_8_vs_base.md)）。

---

# 特斯拉 CAN 官方命名交叉验证（固件 2026.2 提取数据）

> 数据来源：[adamtash/tesla-can-explorer](https://github.com/adamtash/tesla-can-explorer)
> `data/can_frames_decoded_all_values_mcu3.json`（Model 3，固件 **2026.2** MCU3/AMD，**577 帧 / 40484 信号 / 62007 枚举行**，
> 由 Tesla 固件 VAPI 库提取，权威性高于社区 DBC）。
>
> 用途：交叉验证本仓库固件逆向得到的 53 监控 ID 命名（标 `◎ref`）。**语义以本 feifan 固件解析逻辑为准**，
> 此表用于**修正/补全命名**。两者命名差异多因 feifan 固件版本较旧或读取**车辆 CAN 总线**而非 MCU 内部 ETH。

## 0. 校验方法与证据优先级（重要）

> ⚠ **本文（2026.2 数据）与社区 DBC 均为参考，非 100% 正确**；feifan 固件版本较旧
> （固件证 `0x352`=BMS_energyStatus，而 2026.2 已迁为 `0x2B2`，**证明 ID 体系存在版本漂移**）。
> 命名校验**以固件反汇编为第一手**，按下列优先级：
>
> **固件 `firmware.bin` 反汇编（第一手）> 小程序 `services/`（feifan 同版本）> 多个社区 DBC 交叉 > 单一来源**
>
> 置信度图例：
> - **✔✔ 双源+**：≥2 独立来源（2026.2 / commaai / joshwardell）命名一致 → 高置信
> - **✔FW功能**：固件改写行为与命名功能吻合（0x339→前备箱、0x229→换挡）→ 高置信
> - **◎单源**：仅 2026.2 一家，社区 DBC 缺 → 中置信，版本敏感，待佐证
> - **⚠分歧**：多源命名不一致 → **低置信，不可武断命名**，以固件行为为准

### 0.1 多源交叉实查结果（3 个 DBC + 固件）
| ID | 2026.2(MCU3) | commaai party | joshwardell | 固件行为 | 判定 |
|----|-------------|--------------|-------------|---------|------|
| 0x118 | DI_systemStatus | DI_systemStatus | — | D2>>5=挡位 | **✔✔ 高置信** |
| 0x249 | SCCM_leftStalk | SCCM_leftStalk | — | 改写→灯光/雨刮 | **✔✔ 高置信** |
| 0x2f3 | UI_hvacRequest | — | UI_hvacRequest | custom 多位 | **✔✔ 高置信** |
| 0x3fd | UI_autopilotControl | — | UI_autopilotControl | inline D0&7 | **✔✔ 高置信** |
| 0x339 | VCSEC_authentication | — | — | 改写→前备箱/尾门 | ◎+**✔FW功能** |
| 0x229 | SCCM_rightStalk | — | — | 改写→换挡/驻车 | ◎+**✔FW功能** |
| **0x293** | UI_chassisControl | **DAS_settings** | — | 仅 TXINJECT 注入 | **⚠⚠ 三源三名,存疑** |
| **0x266** | DIR_power | — | **DI_vehicleEstimates** | SCALE 数值 idx1 | **⚠ 分歧** |
| **0x2e5** | DIF_power | — | — | SCALE 数值 idx0 | ◎(对称 0x266) |
| 0x31f | PARK_status | — | — | 读 4 字节 | ◎ 单源(原"温度?"臆测已废) |

> **结论**：上一版（命名修正）对 **0x293** 武断采用 UI_chassisControl 属过度采信——三源给出三个名
> （UI_chassisControl / DAS_settings / UI_powertrain），**固件只能证实它是 TXINJECT 注入帧**，
> 语义不可定。下表 §1 已按此置信度回标。

### 0.2 小程序佐证（feifan 同版本，优先级高于外部 DBC）
`services/batteryParser.js` 解析固件经 BLE 下发的电池聚合包，其**字节偏移与定标与固件电池打包器逐字节一致**，
独立验证了 PERID §5 与 BMS 命名（feifan 同版本，最可信）：

| 聚合包字节 | 来源 ID | batteryParser 定标 | 与固件逆向 |
|-----------|--------|-------------------|-----------|
| [0..3] | 0x132 BMS_hvBusStatus | 总电压 ×0.01V / 总电流 ×-0.1A | ✔✔ 一致 |
| [4..11] | 0x3d2 BMS_kwhCounter | 充/放电量 ×0.001kWh | ✔✔ 一致 |
| [12..17] | 0x352(能量帧) | 当前容量/剩余电量 ×0.02kWh、保留 ×0.01 | ✔✔ 一致 |
| [18..20] | 0x332 BMS_bmbMinMax | 单体 max/min ×0.002V | ✔✔ 一致 |
| [21..23] | 0x352(能量帧) | 出厂容量 ×0.1、剩余里程 ×1.61km、电池温度 ×0.25−25 | ✔✔ 一致 |
| [24..25] | 0x292 BMS_socStatus | 车机 SOC | ✔✔ 一致 |

> 这把电池部分从"固件单证"升级到**固件×小程序双证**；同时 `0x352=能量/容量帧`（idx5/6）由 feifan 自家
> 小程序确认，**不依赖 2026.2**（2026.2 反而因版本把它迁到 0x2B2）——印证"以固件+同版本小程序为准"的优先级。

## 1. 监控/扩展 ID 官方命名对照（41/47 命中，已按 §0 置信度回标）

| CAN ID | 官方命名(✔固件2026.2) | 信号数 | 代表信号 | 原标注修正 |
|--------|----------------------|--------|---------|-----------|
| 0x082 | UI_tripPlanning | 10 | UI_ambientTempAtDestination | |
| 0x102 | VCLEFT_doorStatus | 25 | VCLEFT_doorClosureStatusFront | |
| 0x103 | VCRIGHT_doorStatus | 25 | VCRIGHT_doorClosureStatusFront | |
| 0x118 | **DI_systemStatus** | 21 | DI_accelPedalPos | ⚠原 DriveSystemStatus |
| 0x129 | SCCM_steeringAngleSensor | 10 | SCCM_steeringAngle | |
| 0x132 | BMS_hvBusStatus | 3 | BMS_currentUnfiltered | |
| 0x20c | VCRIGHT_hvacRequest | 15 | VCRIGHT_conditioningRequest | |
| 0x229 | **SCCM_rightStalk** | 6 | SCCM_parkButtonStatus | ⚠原 SCCM_steerLever（右拨杆=挡位/驻车） |
| 0x238 | UI_driverAssistMapData | 30 | UI_acceptBottsDots | 补全 |
| 0x243 | VCRIGHT_hvacStatus | 66 | VCRIGHT_hvacStatusIndex | 补全 |
| 0x249 | **SCCM_leftStalk** | 6 | SCCM_highBeamStalkStatus | 补全（左拨杆=灯光/雨刮） |
| 0x257 | DI_speed | 11 | DI_accelPedalPressed | |
| 0x25a | VCSEC_TPMSDisplay | 13 | VCSEC_TPMSDisplay...FL | 补全（胎压） |
| 0x25d | APP_trafficControl | 14 | APP_tcConfirmationType | 补全 |
| 0x266 | DIR_power **⚠** | 6 | DIR_drivePowerMax | 与 joshwardell `DI_vehicleEstimates` 分歧；固件=驱动单元(后)数值 |
| 0x273 | UI_vehicleControl | 39 | UI_alarmEnabled | 补全 |
| 0x292 | BMS_socStatus | 6 | BMS_enoughEnergyForConvenienceFeatures | |
| 0x293 | UI_chassisControl? **⚠⚠** | 28 | UI_accOvertakeEnable | **三源三名(2026.2 chassisControl/commaai DAS_settings/旧 powertrain)，存疑；固件仅证 TXINJECT 注入帧** |
| 0x2e1 | VCFRONT_status | 84 | VCFRONT_statusIndex | |
| 0x2e5 | DIF_power ◎ | 6 | DIF_drivePowerMax | 单源(对称 0x266)；固件=驱动单元(前)数值 |
| 0x2f3 | **UI_hvacRequest** | 26 | UI_enableCustomerTHSAlerts | ⚠原 UI_status（空调请求！） |
| 0x312 | BMS_thermalStatus | 18 | BMS_thermalStatusMultiplexer | |
| 0x31f | PARK_status ◎ | 8 | PARK_majorVersion | 单源 2026.2；原"温度?"为臆测，已废 |
| 0x321 | VCFRONT_sensors | 11 | VCFRONT_battSensorIrrational | ⚠原 VCFRONT_temps |
| 0x332 | BMS_bmbMinMax | 10 | BMS_bmbMinMaxMultiplexer | |
| 0x333 | UI_chargeRequest | 16 | UI_acChargeCurrentLimit | |
| 0x334 | UI_powertrainControl | 18 | UI_DIAppSliderDebug | 补全（扩展 ID） |
| 0x339 | **VCSEC_authentication** | 30 | VCSEC_3rdPartyFrunkPLGRequest | ⚠原 ?（**车辆安全/第三方控制！见 §3**） |
| 0x33a | UI_range | 6 | UI_ratedRange | |
| 0x39d | **IBST_status** | 7 | IBST_LVPowerModeState | 补全（iBooster 刹车助力） |
| 0x3b6 | **DI_odometerStatus** | 4 | DI_obdDriveCycleStatus | 补全（里程） |
| 0x3c2 | VCLEFT_switchStatus | 75 | VCLEFT_switchStatusIndex | 补全 |
| 0x3d2 | BMS_kwhCounter | 2 | BMS_kwhChargeTotal | |
| 0x3d8 | UI_elevationStatus | 2 | UI_elevation | 补全（海拔） |
| 0x3e2 | VCLEFT_lightStatus | 25 | VCLEFT_FLMapLightStatus | 补全 |
| 0x3e3 | VCRIGHT_lightStatus | 13 | VCRIGHT_CHMSLLightStatus | 补全 |
| 0x3e9 | DAS_bodyControls | 27 | DAS_adaptiveHighBeamIsFaulted | 补全（扩展 ID） |
| 0x3f5 | VCFRONT_lighting | 20 | VCFRONT_ambientLightingBrightness | 补全 |
| 0x3fd | **UI_autopilotControl** | 74 | UI_autopilotControlIndex | ⚠原 AP/DAS_ctrl |
| 0x401 | BMS_brickMeasurements | 218 | BMS_brickVoltageCounter | （原 BMS_brickVoltages） |

## 2. 6 个未在 2026.2 ETH 总线命中的 ID

`0x352`(疑 BMS_energyStatus，2026.2 已移至 `0x2B2`) · `0x3fe`(刹车温?) · `0x405`(?) ·
`0x189` · `0x21c` · `0x3b0`（后三者为路径2 控制簇 ID）。

> 推断：feifan 固件读取的是**车辆 CAN 总线**（chassis/powertrain），而 2026.2 数据集是 **MCU 内部 ETH**
> （CAN-over-Ethernet）。两者交集（车身/驾驶广播帧）命中，仅在车辆总线的（部分 BMS/底盘控制）未命中；
> 加之 feifan 固件版本较旧（0x352→0x2B2 印证 ID 迁移）。

## 3. 对 feifan 改装件的关键语义发现

- **0x339 = VCSEC_authentication**，代表信号 `VCSEC_3rdPartyFrunkPLGRequest`（第三方**前备箱/电动尾门**请求）
  —— VCSEC=车辆安全控制器。这正是 feifan 改装件的核心功能（控制前备箱/尾门/门锁），解释了固件为何
  监控并改写 0x339（§4.9 路径1 改写点 0x0800686a）。
- **0x293 ⚠⚠ 命名存疑**：三源三名（2026.2=UI_chassisControl / commaai party=DAS_settings / 旧标=UI_powertrain），
  固件仅证实为 TXINJECT 注入帧（D6/gp+0x166），**勿据单源命名**——这是版本/总线漂移的典型例子。
- **0x39d = IBST_status**（iBooster 电子刹车助力）：与刹车控制相关。
- **0x229 SCCM_rightStalk / 0x249 SCCM_leftStalk**：方向盘左右拨杆——挡位、驻车、灯光、雨刮，
  是改装件模拟驾驶操作的关键注入目标（路径1 改写 0x229）。
- **0x266 / 0x2e5 ⚠ 分歧**：2026.2=DIR_power/DIF_power（前后驱逆变器，成对），joshwardell 0x266=DI_vehicleEstimates；
  固件为 SCALE 数值型（idx1/idx0），稳妥取"驱动单元(后/前)输出量"语义，具体功率/扭矩待固件 SCALE 单位确认。

> 这些官方命名使本仓库的"读哪个 ID→什么语义"从位级精确升级到**信号级语义**，重写时可直接对照
> 2026.2 信号表（40484 信号）补全字段名。

## 4. 改写帧的信号级语义 —— feifan 控制注入的**确切车辆功能**

把路径1（§4.9）的改写帧与 2026.2 信号表对照，**控制注入的目标功能完全明确**：

| 改写帧 | 关键信号（功能） | feifan 注入的控制 |
|--------|----------------|------------------|
| **0x339 VCSEC_authentication** | `VCSEC_3rdPartyFrunkPLGRequest`(第三方前备箱)、`VCSEC_3rdPartyPLGRequest`(电动尾门)、`VCSEC_frunkLockStatus`、`VCSEC_chargePortLockStatus`(充电口锁)、`VCSEC_immobilizerState`(防盗) | **前备箱/电动尾门/充电口/门锁开闭** |
| **0x229 SCCM_rightStalk** | `SCCM_rightStalkStatus`(挡位 D/R/N)、`SCCM_parkButtonStatus`(驻车) | **远程换挡 / 驻车（P）** |
| **0x249 SCCM_leftStalk** | `SCCM_turnIndicatorStalkStatus`(转向灯)、`SCCM_highBeamStalkStatus`(远光)、`SCCM_washWipeButtonStatus`(雨刮) | **转向灯 / 远光 / 雨刮** |

### 闭环验证：CRC/Counter ↔ re-sign 机制
这三个帧的信号表都含 **`*Counter` + `*Crc`**（如 `SCCM_rightStalkCounter`/`SCCM_rightStalkCrc`、
`VCSEC_...` 帧的计数器/校验）。这**精确印证**了固件的 re-sign 改写位（§4.7/§4.9）：
> 改写控制信号位后 → **重算 D6 滚动计数器 + D7 CRC**（`0x08007c72` 等 re-sign 点的 `D6 计数器/D7 CRC`），
> 否则特斯拉 ECU 会因 Counter/CRC 校验失败丢弃。这就是固件**必须 re-sign 而非构造新帧**的根本原因。

> 结论：feifan 改装件 = **拦截 SCCM 拨杆帧（挡位/灯光/雨刮）与 VCSEC 帧（前备箱/尾门/锁），
> 按 App 命令改写对应控制信号位 + 重算 Counter/CRC + 原 ID 回注**。读链路监控这些帧的当前状态，
> 控链路改写注入——与本仓库固件逆向（§2–§5）完全吻合。
