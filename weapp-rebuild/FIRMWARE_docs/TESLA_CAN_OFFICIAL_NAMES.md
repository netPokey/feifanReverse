# 特斯拉 CAN 官方命名交叉验证（固件 2026.2 提取数据）

> 数据来源：[adamtash/tesla-can-explorer](https://github.com/adamtash/tesla-can-explorer)
> `data/can_frames_decoded_all_values_mcu3.json`（Model 3，固件 **2026.2** MCU3/AMD，**577 帧 / 40484 信号 / 62007 枚举行**，
> 由 Tesla 固件 VAPI 库提取，权威性高于社区 DBC）。
>
> 用途：交叉验证本仓库固件逆向得到的 53 监控 ID 命名（标 `◎ref`）。**语义以本 feifan 固件解析逻辑为准**，
> 此表用于**修正/补全命名**。两者命名差异多因 feifan 固件版本较旧或读取**车辆 CAN 总线**而非 MCU 内部 ETH。

## 1. 监控/扩展 ID 官方命名对照（41/47 命中）

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
| 0x266 | **DIR_power** | 6 | DIR_drivePowerMax | ⚠原 RearTorque（后电机功率） |
| 0x273 | UI_vehicleControl | 39 | UI_alarmEnabled | 补全 |
| 0x292 | BMS_socStatus | 6 | BMS_enoughEnergyForConvenienceFeatures | |
| 0x293 | **UI_chassisControl** | 28 | UI_accOvertakeEnable | ⚠原 UI_powertrain（底盘控制！） |
| 0x2e1 | VCFRONT_status | 84 | VCFRONT_statusIndex | |
| 0x2e5 | **DIF_power** | 6 | DIF_drivePowerMax | ⚠原 FrontTorque（前电机功率） |
| 0x2f3 | **UI_hvacRequest** | 26 | UI_enableCustomerTHSAlerts | ⚠原 UI_status（空调请求！） |
| 0x312 | BMS_thermalStatus | 18 | BMS_thermalStatusMultiplexer | |
| 0x31f | **PARK_status** | 8 | PARK_majorVersion | ⚠原 ?（泊车控制器） |
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
- **0x293 = UI_chassisControl**（含 `accOvertakeEnable` 等）：底盘/驾驶辅助控制，非动力总成。
- **0x39d = IBST_status**（iBooster 电子刹车助力）：与刹车控制相关。
- **0x229 SCCM_rightStalk / 0x249 SCCM_leftStalk**：方向盘左右拨杆——挡位、驻车、灯光、雨刮，
  是改装件模拟驾驶操作的关键注入目标（路径1 改写 0x229）。
- **0x266 DIR_power / 0x2e5 DIF_power**：后/前驱逆变器功率（非扭矩），驱动系统功率上报。

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
