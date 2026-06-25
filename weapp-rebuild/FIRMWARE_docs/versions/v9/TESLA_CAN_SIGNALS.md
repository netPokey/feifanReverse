> ⚠ **版本适配（9/TSL9）**：本文为**通用 CAN 语义/机制**（版本无关，源自 base 逆向），对版本 9 同样适用。
> 本版完整 72 CAN ID 逐位解析见 [`./TESLA_CAN_DECODE_PERID.md`](./TESLA_CAN_DECODE_PERID.md)，锚点/差异见 [`./README.md`](./README.md)。
> **含具体地址处为 base 基线**，版本 9 按锚点偏移（见 [`../COMPARE_8_vs_base.md`](../COMPARE_8_vs_base.md)）。

---

# 特斯拉 CAN 监控 ID 逐信号清单（固件 2026.2 数据）

> 数据源：[adamtash/tesla-can-explorer](https://github.com/adamtash/tesla-can-explorer) `can_frames_decoded_all_values_mcu3.json`（Model 3 固件 2026.2 MCU3）。
> 生成：`../../scripts/gen_signals.py`。**本文仅补信号语义/枚举值**；**位布局以固件逆向（`TESLA_CAN_DECODE_PERID.md`）为准**，命名置信度见 `TESLA_CAN_OFFICIAL_NAMES.md §0`。
>
> ⚠ 局限：该数据集不含位起止（`limitations`：bitfield 未完全解码），且为 2026.2 版——与 feifan 固件存在版本漂移，**信号名/枚举作语义参考，不作位级依据**。

覆盖：49/52 ID 命中，共 1311 信号。未命中（feifan 特有/异版本，见固件逆向）：0x352 0x3fe 0x405。

## 0x082 UI_tripPlanning (10 信号)

**信号**：UI_ambientTempAtDestination, UI_battPreconditionOnNavPowerReq, UI_battPreconditionOnNavState, UI_battPreconditionOnNavTargetT, UI_energyAtDestination, UI_navFastchargerType, UI_navToSupercharger, UI_requestActiveBatteryHeating, UI_tripPlanChargingTargetPercent, UI_tripPlanningActive

**关键枚举**：
- `UI_battPreconditionOnNavPowerReq`: MAX/SNA/MIN
- `UI_battPreconditionOnNavState`: PASSIVE_HEAT/ACTIVE_HEAT/PASSIVE_COOL/ACTIVE_COOL
- `UI_battPreconditionOnNavTargetT`: MIN/MAX/SNA
- `UI_energyAtDestination`: SNA/TRIP_TOO_LONG
- `UI_navFastchargerType`: NONE/LOW_POWER/V2/V3/V4

## 0x102 VCLEFT_doorStatus (25 信号)

**信号**：VCLEFT_doorClosureStatusFront, VCLEFT_doorClosureStatusRear, VCLEFT_frontHandlePulled, VCLEFT_frontHandlePulledPersist, VCLEFT_frontIntSwitchFaulted, VCLEFT_frontIntSwitchPressed, VCLEFT_frontLatchStatus, VCLEFT_frontLatchSwitch, VCLEFT_frontRelActuatorSwitch, VCLEFT_lastDoorReqSourceFront, VCLEFT_lastDoorReqSourceRear, VCLEFT_mirrorDipped, VCLEFT_mirrorFoldState, VCLEFT_mirrorHeatState, VCLEFT_mirrorRecallState, VCLEFT_mirrorState, VCLEFT_mirrorTiltXPosition, VCLEFT_mirrorTiltYPosition, VCLEFT_rearHandlePulled, VCLEFT_rearHandlePulledPersist, VCLEFT_rearIntSwitchFaulted, VCLEFT_rearIntSwitchPressed, VCLEFT_rearLatchStatus, VCLEFT_rearLatchSwitch, VCLEFT_rearRelActuatorSwitch

**关键枚举**：
- `VCLEFT_doorClosureStatusFront`: SNA/OPEN/CLOSED/FAULT
- `VCLEFT_doorClosureStatusRear`: SNA/OPEN/CLOSED/FAULT
- `VCLEFT_frontLatchStatus`: SNA/OPENED/CLOSED/CLOSING/OPENING/AJAR/TIMEOUT/DEFAULT/FAULT
- `VCLEFT_lastDoorReqSourceFront`: UNKNOWN/INTERIOR_BUTTON/EXTERIOR_HANDLE/VCSEC/ECU
- `VCLEFT_lastDoorReqSourceRear`: UNKNOWN/INTERIOR_BUTTON/EXTERIOR_HANDLE/VCSEC/ECU
- `VCLEFT_mirrorFoldState`: UNKNOWN/FOLDED/UNFOLDED/FOLDING/UNFOLDING
- `VCLEFT_mirrorHeatState`: SNA/ON/OFF/OFF_UNAVAILABLE/FAULT
- `VCLEFT_mirrorState`: IDLE/TILT_X/TILT_Y/FOLD_UNFOLD/RECALL/CALIBRATION
- `VCLEFT_rearLatchStatus`: SNA/OPENED/CLOSED/CLOSING/OPENING/AJAR/TIMEOUT/DEFAULT/FAULT

## 0x103 VCRIGHT_doorStatus (25 信号)

**信号**：VCRIGHT_doorClosureStatusFront, VCRIGHT_doorClosureStatusRear, VCRIGHT_frontHandlePulled, VCRIGHT_frontHandlePulledPersist, VCRIGHT_frontIntSwitchFaulted, VCRIGHT_frontIntSwitchPressed, VCRIGHT_frontLatchStatus, VCRIGHT_frontLatchSwitch, VCRIGHT_frontRelActuatorSwitch, VCRIGHT_lastDoorReqSourceFront, VCRIGHT_lastDoorReqSourceRear, VCRIGHT_mirrorDipped, VCRIGHT_mirrorFoldState, VCRIGHT_mirrorRecallState, VCRIGHT_mirrorState, VCRIGHT_mirrorTiltXPosition, VCRIGHT_mirrorTiltYPosition, VCRIGHT_rearHandlePulled, VCRIGHT_rearHandlePulledPersist, VCRIGHT_rearIntSwitchFaulted, VCRIGHT_rearIntSwitchPressed, VCRIGHT_rearLatchStatus, VCRIGHT_rearLatchSwitch, VCRIGHT_rearRelActuatorSwitch, VCRIGHT_trunkLatchStatus

**关键枚举**：
- `VCRIGHT_doorClosureStatusFront`: SNA/OPEN/CLOSED/FAULT
- `VCRIGHT_doorClosureStatusRear`: SNA/OPEN/CLOSED/FAULT
- `VCRIGHT_frontLatchStatus`: SNA/OPENED/CLOSED/CLOSING/OPENING/AJAR/TIMEOUT/DEFAULT/FAULT
- `VCRIGHT_lastDoorReqSourceFront`: UNKNOWN/INTERIOR_BUTTON/EXTERIOR_HANDLE/VCSEC/ECU
- `VCRIGHT_lastDoorReqSourceRear`: UNKNOWN/INTERIOR_BUTTON/EXTERIOR_HANDLE/VCSEC/ECU
- `VCRIGHT_mirrorFoldState`: UNKNOWN/FOLDED/UNFOLDED/FOLDING/UNFOLDING
- `VCRIGHT_mirrorState`: IDLE/TILT_X/TILT_Y/FOLD_UNFOLD/RECALL/CALIBRATION
- `VCRIGHT_rearLatchStatus`: SNA/OPENED/CLOSED/CLOSING/OPENING/AJAR/TIMEOUT/DEFAULT/FAULT
- `VCRIGHT_trunkLatchStatus`: SNA/OPENED/CLOSED/CLOSING/OPENING/AJAR/TIMEOUT/DEFAULT/FAULT

## 0x118 DI_systemStatus (21 信号)  〔✔✔ 双源〕

**信号**：DI_accelPedalPos, DI_brakePedalState, DI_driveBlocked, DI_driveModeState, DI_dynoModeAvailable, DI_eepDeliveryBitStatus, DI_epbRequest, DI_gear, DI_hvilSystemStatus, DI_immobilizerState, DI_keepDrivePowerStateRequest, DI_manualDrivingProhibited, DI_regenLight, DI_secondaryGearControlStatus, DI_shiftRequestType, DI_systemState, DI_systemStatusChecksum, DI_systemStatusCounter, DI_trackModeState, DI_tractionControlMode, DI_vehicleAcceleration

**关键枚举**：
- `DI_brakePedalState`: OFF/ON/INVALID
- `DI_driveBlocked`: NONE/FRUNK/PROX/FALCON/TRUNK
- `DI_driveModeState`: NONDRIVE/DRIVE
- `DI_epbRequest`: NO_REQUEST/PARK/UNPARK
- `DI_gear`: INVALID/P/R/N/D/SNA
- `DI_hvilSystemStatus`: DISABLED/OPEN/CLOSED/SNA
- `DI_immobilizerState`: INIT_SNA/REQUEST/AUTHENTICATING/DISARMED/IDLE/RESET/FAULT
- `DI_keepDrivePowerStateRequest`: NO_REQUEST/KEEP_ALIVE
- `DI_secondaryGearControlStatus`: NOT_ACTIVE/ACTIVE
- `DI_shiftRequestType`: NONE/GTW_SHIFT/CCCM_SHIFT/SMART_SHIFT
- `DI_systemState`: UNAVAILABLE/IDLE/STANDBY/FAULT/ABORT/ENABLE
- `DI_trackModeState`: UNAVAILABLE/AVAILABLE/ON

## 0x129 SCCM_steeringAngleSensor (10 信号)

**信号**：SCCM_steeringAngle, SCCM_steeringAngleCounter, SCCM_steeringAngleCrc, SCCM_steeringAngleSensorReservd1, SCCM_steeringAngleSensorReservd2, SCCM_steeringAngleSensorReservd3, SCCM_steeringAngleSensorStatus, SCCM_steeringAngleSpeed, SCCM_steeringAngleValidity, SCCM_supplierID

**关键枚举**：
- `SCCM_steeringAngleSensorStatus`: OK/INIT/ERROR/ERROR_INIT
- `SCCM_steeringAngleValidity`: INVALID/VALID/INIT/SNA

## 0x132 BMS_hvBusStatus (3 信号)

**信号**：BMS_currentUnfiltered, BMS_dcLinkVoltage, BMS_packCurrent

## 0x1f9 VCSEC_requests (19 信号)

**信号**：VCSEC_chargePortRequest, VCSEC_chargeportRequestReason, VCSEC_closeAllStatus, VCSEC_driveAttemptedWithoutAuth, VCSEC_frontLeftClosureRequest, VCSEC_frontLeftRequestReason, VCSEC_frontRightClosureRequest, VCSEC_frontRightRequestReason, VCSEC_frontTrunkClosureRequest, VCSEC_frontTrunkRequestReason, VCSEC_presentHandles, VCSEC_rdMapDumpRequested, VCSEC_rearLeftClosureRequest, VCSEC_rearLeftRequestReason, VCSEC_rearRightClosureRequest, VCSEC_rearRightRequestReason, VCSEC_rearTrunkClosureRequest, VCSEC_rearTrunkRequestReason, VCSEC_snapshotRequested

**关键枚举**：
- `VCSEC_chargePortRequest`: NONE/OPEN/CLOSE/SNA
- `VCSEC_chargeportRequestReason`: NONE/RKE/UHF/BLE_CHARGE_HANDLE/LONG_PULL_DOOR_HANDLE
- `VCSEC_closeAllStatus`: NOT_AVAILABLE/AVAILABLE/CANCELABLE
- `VCSEC_frontLeftClosureRequest`: NONE/MOVE/STOP/OPEN/QUICK_OPEN/OPEN_REDUCED/CLOSE
- `VCSEC_frontRightClosureRequest`: NONE/MOVE/STOP/OPEN/QUICK_OPEN/OPEN_REDUCED/CLOSE
- `VCSEC_frontTrunkClosureRequest`: NONE/MOVE/STOP/OPEN/QUICK_OPEN/OPEN_REDUCED/CLOSE
- `VCSEC_rearLeftClosureRequest`: NONE/MOVE/STOP/OPEN/QUICK_OPEN/OPEN_REDUCED/CLOSE
- `VCSEC_rearRightClosureRequest`: NONE/MOVE/STOP/OPEN/QUICK_OPEN/OPEN_REDUCED/CLOSE
- `VCSEC_rearTrunkClosureRequest`: NONE/MOVE/STOP/OPEN/QUICK_OPEN/OPEN_REDUCED/CLOSE

## 0x20c VCRIGHT_hvacRequest (15 信号)

**信号**：VCRIGHT_conditioningRequest, VCRIGHT_evapPerformanceLow, VCRIGHT_hvacBlowerRPMActualAP, VCRIGHT_hvacBlowerSpeedRPMReq, VCRIGHT_hvacEvapEnabled, VCRIGHT_hvacEvapEnabledInColdAmbient, VCRIGHT_hvacHeatingEnabledLeft, VCRIGHT_hvacHeatingEnabledRight, VCRIGHT_hvacPerfTestRunning, VCRIGHT_hvacPerfTestState, VCRIGHT_hvacUnavailable, VCRIGHT_tempAmbientRaw, VCRIGHT_tempEvaporator, VCRIGHT_tempEvaporatorTarget, VCRIGHT_wattsDemandEvap

**关键枚举**：
- `VCRIGHT_hvacPerfTestState`: STOPPED/WAITING/BLOWING

## 0x229 SCCM_rightStalk (6 信号)

**信号**：SCCM_parkButtonStatus, SCCM_rightStalkCounter, SCCM_rightStalkCrc, SCCM_rightStalkReserved1, SCCM_rightStalkReserved2, SCCM_rightStalkStatus

**关键枚举**：
- `SCCM_parkButtonStatus`: NOT_PRESSED/PRESSED/INIT/SNA
- `SCCM_rightStalkStatus`: IDLE/UP_1/UP_2/DOWN_1/DOWN_2/INIT/SNA

## 0x238 UI_driverAssistMapData (30 信号)

**信号**：UI_acceptBottsDots, UI_autosteerRestricted, UI_controlledAccess, UI_countryCode, UI_gpsRoadMatch, UI_inSuperchargerGeofence, UI_mapDataChecksum, UI_mapDataCounter, UI_mapSpeedLimit, UI_mapSpeedLimitDependency, UI_mapSpeedLimitType, UI_mapSpeedUnits, UI_navRouteActive, UI_nextBranchDist, UI_nextBranchLeftOffRamp, UI_nextBranchRightOffRamp, UI_parallelAutoparkEnabled, UI_perpendicularAutoparkEnabled, UI_pmmEnabled, UI_rejectAutosteer, UI_rejectHPP, UI_rejectHandsOn, UI_rejectLeftFreeSpace, UI_rejectLeftLane, UI_rejectNav, UI_rejectRightFreeSpace, UI_rejectRightLane, UI_roadClass, UI_scaEnabled, UI_streetCount

**关键枚举**：
- `UI_countryCode`: UNKNOWN/SNA
- `UI_mapSpeedLimitDependency`: NONE/SCHOOL/RAIN/SNOW/TIME/SEASON/LANE/SNA
- `UI_mapSpeedLimitType`: REGULAR/ADVISORY/DEPENDENT/BUMPS/UNKNOWN_SNA
- `UI_mapSpeedUnits`: MPH/KPH
- `UI_roadClass`: UNKNOWN_INVALID_SNA/CLASS_1_MAJOR/CLASS_2/CLASS_3/CLASS_4/CLASS_5/CLASS_6_MINOR

## 0x243 VCRIGHT_hvacStatus (66 信号)

**信号**：VCRIGHT_hvacStatusIndex, VCRIGHT_warmingUpStatus, VCRIGHT_coolingDownStatus, VCRIGHT_childModeHVACState, VCRIGHT_dogModeState, VCRIGHT_hvacCabinTempEstValid, VCRIGHT_COPNotRunningReasonFiltered, VCRIGHT_hvacCabinTempEst, VCRIGHT_hvacAirDistributionMode, VCRIGHT_hvacBlowerSegment, VCRIGHT_hvacRecirc, VCRIGHT_hvacACRunning, VCRIGHT_hvacPowerState, VCRIGHT_hvacVentStatus, VCRIGHT_hvacSecondRowState, VCRIGHT_hvacSystemNominal, VCRIGHT_hvacModelInitStatus, VCRIGHT_hvacMassflowRefrigSysRight, VCRIGHT_hvacRecircDoorPercent, VCRIGHT_tempDuctLeft, VCRIGHT_hvacMassflowRefrigSystem, VCRIGHT_tempDuctRight, VCRIGHT_hvacMassflowRefrigSysLeft, VCRIGHT_hvacDuctTargetLeft, VCRIGHT_hvacDuctTargetRight, VCRIGHT_enableTripleCameraFanPowerInSleep, VCRIGHT_tempDuctRightUpper, VCRIGHT_hpSplitTempsEnabled, VCRIGHT_hvacEvapInletTempEstimate, VCRIGHT_tempMonitorNotNominal, VCRIGHT_hvacCabinAtTempTarget, VCRIGHT_hvacReqSecondRow, VCRIGHT_hvacAirflowReason, VCRIGHT_autoHvacBlowerShouldLimit, VCRIGHT_hvacReqThirdRow, VCRIGHT_solarLoadOnVehicle, VCRIGHT_refrigDistCommanded, VCRIGHT_hvacFrontRightSeatFanStatus, VCRIGHT_hvacFrontLeftSeatFanStatus, VCRIGHT_hvacRefHighPowerRequest, VCRIGHT_hvacFrontRightSeatHeatStatus, VCRIGHT_hvacSeatFrontLeftTempTarget, VCRIGHT_hvacManualToAutoNotify, VCRIGHT_hvacRequestsFullAuto, VCRIGHT_passengerPresentHvacCycle, VCRIGHT_hvacRequestsAutoIntake, VCRIGHT_steeringWheelHeatStatus, VCRIGHT_autoDefogStatus, VCRIGHT_solarElevation, VCRIGHT_minsToSunrise, VCRIGHT_minsToSunset, VCRIGHT_hvacLimitedReasonRight, VCRIGHT_hvacLimitedReasonLeft, VCRIGHT_hvacOverheatProtActive, VCRIGHT_autoSwingAvailable, VCRIGHT_tempDuctLeftUpper, VCRIGHT_hvacFrontLeftSeatHeatStatus, VCRIGHT_hvacQdotLeft, VCRIGHT_hvacQdotRight, VCRIGHT_tempDuctLeftLower, VCRIGHT_tempDuctRightLower, VCRIGHT_foggingControllerResetReason, VCRIGHT_modeledCabinPressure, VCRIGHT_blowerTorqueIndex, VCRIGHT_autoSwingLeftPosX, VCRIGHT_autoSwingRightPositionX

**关键枚举**：
- `VCRIGHT_childModeHVACState`: IDLE/ACTIVE/ACTIVE_COMPROMISED
- `VCRIGHT_hvacAirDistributionMode`: NONE/FLOOR/PANEL/PANEL_FLOOR/DEFROST/DEFROST_FLOOR/DEFROST_PANEL/DEFROST_PANEL_FLOOR
- `VCRIGHT_hvacRecirc`: AUTO/RECIRC/FRESH
- `VCRIGHT_hvacACRunning`: OFF/ON
- `VCRIGHT_hvacPowerState`: OFF/ON/PRECONDITION/OVERHEAT_PROTECT_FANONLY/OVERHEAT_PROTECT
- `VCRIGHT_hvacVentStatus`: BOTH/LEFT/RIGHT/OFF
- `VCRIGHT_hvacSecondRowState`: AUTO/OFF/LOW/MED/HIGH
- `VCRIGHT_hvacFrontRightSeatFanStatus`: OFF/LEVEL1/LEVEL2/LEVEL3
- `VCRIGHT_hvacFrontLeftSeatFanStatus`: OFF/LEVEL1/LEVEL2/LEVEL3
- `VCRIGHT_hvacFrontRightSeatHeatStatus`: OFF/LEVEL1/LEVEL2/LEVEL3
- `VCRIGHT_hvacManualToAutoNotify`: OFF/COMFORT/FOGGING/FOGGING_COMFORT/COMFORT_FORWARD_LOOK/MISC2/MISC3
- `VCRIGHT_steeringWheelHeatStatus`: OFF/LEVEL1/LEVEL2/LEVEL3
- `VCRIGHT_autoDefogStatus`: NONE/DEFOG/INTERMEDIATE_DEFOG
- `VCRIGHT_hvacFrontLeftSeatHeatStatus`: OFF/LEVEL1/LEVEL2/LEVEL3

## 0x249 SCCM_leftStalk (6 信号)  〔✔✔ 双源〕

**信号**：SCCM_highBeamStalkStatus, SCCM_leftStalkCounter, SCCM_leftStalkCrc, SCCM_turnIndicatorStalkAngle, SCCM_turnIndicatorStalkStatus, SCCM_washWipeButtonStatus

**关键枚举**：
- `SCCM_highBeamStalkStatus`: IDLE/PULL/PUSH/SNA
- `SCCM_turnIndicatorStalkStatus`: IDLE/UP_0_5/UP_1/UP_1_5/UP_2/DOWN_0_5/DOWN_1/DOWN_1_5/DOWN_2/SNA
- `SCCM_washWipeButtonStatus`: NOT_PRESSED/1ST_DETENT/2ND_DETENT/SNA

## 0x257 DI_speed (11 信号)

**信号**：DI_accelPedalPressed, DI_autoEnableHazards, DI_longControlCommandActive, DI_opdVehicleModelSpeedRef, DI_sideslipEstimate, DI_speedChecksum, DI_speedCounter, DI_uiSpeed, DI_uiSpeedUnits, DI_vehicleSpeed, DI_velocityEstimatorState

**关键枚举**：
- `DI_uiSpeedUnits`: MPH/KPH
- `DI_velocityEstimatorState`: NOT_INITIALIZED/WHEELS_NORMAL/WHEELS_REDUCED/BACKUP_WHEELS_A/BACKUP_WHEELS_B/BACKUP_MOTOR

## 0x25a VCSEC_TPMSDisplay (13 信号)

**信号**：VCSEC_TPMSDisplayHardWarningIndicationFL, VCSEC_TPMSDisplayHardWarningIndicationFR, VCSEC_TPMSDisplayHardWarningIndicationRL, VCSEC_TPMSDisplayHardWarningIndicationRR, VCSEC_TPMSDisplayPressureFL, VCSEC_TPMSDisplayPressureFR, VCSEC_TPMSDisplayPressureRL, VCSEC_TPMSDisplayPressureRR, VCSEC_TPMSDisplaySoftWarningIndicationFL, VCSEC_TPMSDisplaySoftWarningIndicationFR, VCSEC_TPMSDisplaySoftWarningIndicationRL, VCSEC_TPMSDisplaySoftWarningIndicationRR, VCSEC_TPMSTellTale

**关键枚举**：
- `VCSEC_TPMSDisplayHardWarningIndicationFL`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSDisplayHardWarningIndicationFR`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSDisplayHardWarningIndicationRL`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSDisplayHardWarningIndicationRR`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSDisplayPressureFL`: OVER_RANGE/SNA
- `VCSEC_TPMSDisplayPressureFR`: OVER_RANGE/SNA
- `VCSEC_TPMSDisplayPressureRL`: OVER_RANGE/SNA
- `VCSEC_TPMSDisplayPressureRR`: OVER_RANGE/SNA
- `VCSEC_TPMSDisplaySoftWarningIndicationFL`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSDisplaySoftWarningIndicationFR`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSDisplaySoftWarningIndicationRL`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSDisplaySoftWarningIndicationRR`: NOT_INDICATED/INDICATED
- `VCSEC_TPMSTellTale`: OFF/SOLID/FLASHING

## 0x25d APP_trafficControl (14 信号)

**信号**：APP_tcConfirmationType, APP_tcContinuationReason, APP_tcControlDistance, APP_tcControlLightState, APP_tcControlSource, APP_tcControlType, APP_tcFeatureState, APP_tcStateMachine, APP_tcUnavailableReason, APP_tcVisionLight, APP_tcVisionLine, APP_tcVisionRoadMarking, APP_tcVisionSign, APP_tcWarningSuppressionReason

**关键枚举**：
- `APP_tcConfirmationType`: NONE/STALK/PEDAL
- `APP_tcControlSource`: NONE/MAP/VISION/MAP_AND_VISION
- `APP_tcFeatureState`: DISABLED/UNAVAILABLE/AVAILABLE/ACTIVE
- `APP_tcStateMachine`: DISABLED/STANDBY/AWARE/WARNING/STOPPING/STOPPED/CONTINUING

## 0x266 DIR_power (6 信号)  〔⚠ 分歧(josh=DI_vehicleEstimates)〕

**信号**：DIR_drivePowerMax, DIR_elecPower, DIR_excessHeatCommand, DIR_heatPowerActual, DIR_heatPowerMax, DIR_heatPowerOptimal

## 0x273 UI_vehicleControl (39 信号)

**信号**：UI_alarmEnabled, UI_ambientLightingEnabled, UI_autoFoldMirrorsOn, UI_autoHighBeamEnabled, UI_childDoorLockOnLeft, UI_childDoorLockOnRight, UI_displayBrightnessLevel, UI_domeLightSwitch, UI_driveStateRequest, UI_frontFogSwitch, UI_frontLeftSeatHeatReq, UI_frontRightSeatHeatReq, UI_frunkRequest, UI_globalUnlockOn, UI_honkHorn, UI_intrusionSensorOn, UI_lockRequest, UI_mirrorDipOnReverse, UI_mirrorFoldRequest, UI_mirrorHeatRequest, UI_powerOff, UI_powerStateRequest, UI_rearCenterSeatHeatReq, UI_rearFogSwitch, UI_rearLeftSeatHeatReq, UI_rearRightSeatHeatReq, UI_rearWindowLockout, UI_remoteClosureRequest, UI_remoteStartRequest, UI_seeYouHomeLightingOn, UI_steeringBacklightEnabled, UI_steeringButtonMode, UI_stop12vSupport, UI_summonActive, UI_unlockOnPark, UI_walkAwayLock, UI_walkUpUnlock, UI_wiperMode, UI_wiperRequest

**关键枚举**：
- `UI_domeLightSwitch`: OFF/ON/AUTO
- `UI_driveStateRequest`: IDLE/START
- `UI_frontLeftSeatHeatReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_frontRightSeatHeatReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_lockRequest`: IDLE/LOCK/UNLOCK/REMOTE_UNLOCK/REMOTE_LOCK/SNA
- `UI_mirrorFoldRequest`: IDLE/RETRACT/PRESENT/SNA
- `UI_powerStateRequest`: IDLE/ACCESSORY/ACCESSORY_PLUS/DRIVE_SUMMON
- `UI_rearCenterSeatHeatReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_rearLeftSeatHeatReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_rearRightSeatHeatReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_remoteClosureRequest`: IDLE/REAR_TRUNK_MOVE/FRONT_TRUNK_MOVE/SNA
- `UI_remoteStartRequest`: IDLE/START/SNA
- `UI_steeringBacklightEnabled`: DISABLED/ENABLED
- `UI_wiperMode`: SNA/SERVICE/NORMAL/PARK
- `UI_wiperRequest`: SNA/OFF/AUTO/SLOW_INTERMITTENT/FAST_INTERMITTENT/SLOW_CONTINUOUS/FAST_CONTINUOUS

## 0x292 BMS_socStatus (6 信号)

**信号**：BMS_enoughEnergyForConvenienceFeatures, BMS_instantChargePowerCapability, BMS_socAvg, BMS_socMax, BMS_socMin, BMS_socUI

## 0x293 UI_chassisControl (28 信号)  〔⚠⚠ 三源三名,命名存疑〕

**信号**：UI_accOvertakeEnable, UI_aebEnable, UI_aesEnable, UI_ahlbEnable, UI_autoLaneChangeEnable, UI_autoParkRequest, UI_bsdEnable, UI_chassisControlChecksum, UI_chassisControlCounter, UI_dasDebugEnable, UI_distanceUnits, UI_fcwEnable, UI_fcwSensitivity, UI_latControlEnable, UI_ldwEnable, UI_narrowGarages, UI_parkBrakeRequest, UI_pedalMap_epas, UI_pedalSafetyEnable, UI_rebootAutopilot, UI_redLightStopSignEnable, UI_selfParkTune, UI_steeringTuneRequest, UI_tractionControlMode, UI_trailerMode, UI_winchModeRequest, UI_winchProxUserOverride, UI_zeroSpeedConfirmed

**关键枚举**：
- `UI_accOvertakeEnable`: ACC_OVERTAKE_OFF/ACC_OVERTAKE_ON/SNA
- `UI_aebEnable`: AEB_OFF/AEB_ON/SNA
- `UI_aesEnable`: AES_OFF/AES_ON/SNA
- `UI_ahlbEnable`: AHLB_OFF/AHLB_ON/SNA
- `UI_autoLaneChangeEnable`: OFF/ON/SNA
- `UI_bsdEnable`: BSD_OFF/BSD_ON/SNA
- `UI_distanceUnits`: KM/MILES
- `UI_fcwEnable`: FCW_OFF/FCW_ON/SNA
- `UI_fcwSensitivity`: AEB_SENSITIVITY_EARLY/AEB_SENSITIVITY_AVERAGE/AEB_SENSITIVITY_LATE/SNA
- `UI_latControlEnable`: OFF/ON/UNAVAILABLE/SNA
- `UI_ldwEnable`: NO_HAPTIC/LDW_TRIGGERS_HAPTIC/SNA
- `UI_parkBrakeRequest`: IDLE/PRESSED/SNA
- `UI_pedalMap_epas`: CHILL/SPORT/PERFORMANCE
- `UI_pedalSafetyEnable`: PEDAL_SAFETY_OFF/PEDAL_SAFETY_ON/SNA
- `UI_redLightStopSignEnable`: RLSSW_OFF/RLSSW_ON/SNA
- `UI_steeringTuneRequest`: COMFORT/STANDARD/SPORT
- `UI_trailerMode`: OFF/ON
- `UI_winchModeRequest`: IDLE/ENTER/EXIT/DIALOGUE_OPEN
- …(另 1 个枚举信号，见数据源)

## 0x2b6 DI_chassisControlStatus (14 信号)

**信号**：DI_btcStateUI, DI_greenABSTelltaleOn, DI_opdFeedbackReset, DI_opdFeedbackResetPositiveSpeeds, DI_ptcStateGlobalUI, DI_slipperySurfaceOnUI, DI_stabilityModeState, DI_tcTelltaleFlash, DI_tcTelltaleOn, DI_tractionControlModeUI, DI_vdcTelltaleFlash, DI_vdcTelltaleOn, DI_vehicleHoldTelltaleOn, DI_yellowBrakeTelltaleOn

**关键枚举**：
- `DI_btcStateUI`: OFF/ON
- `DI_greenABSTelltaleOn`: OFF/ON
- `DI_ptcStateGlobalUI`: FAULTED/BACKUP/ON/SNA
- `DI_slipperySurfaceOnUI`: OFF/ON
- `DI_stabilityModeState`: UNAVAILABLE/NORMAL/REDUCED
- `DI_tcTelltaleFlash`: OFF/ON
- `DI_tcTelltaleOn`: OFF/ON
- `DI_vdcTelltaleFlash`: OFF/ON
- `DI_vdcTelltaleOn`: OFF/ON
- `DI_vehicleHoldTelltaleOn`: OFF/ON
- `DI_yellowBrakeTelltaleOn`: OFF/ON

## 0x2e1 VCFRONT_status (84 信号)

**信号**：VCFRONT_statusIndex, VCFRONT_frunkLatchStatus, VCFRONT_wiperSpeed, VCFRONT_wiperPosition, VCFRONT_wiperBlocked, VCFRONT_wiperState, VCFRONT_crashDetectedType, VCFRONT_crashState, VCFRONT_crashUnlockOverrideSet, VCFRONT_washPumpState, VCFRONT_turnIndicatorControlType, VCFRONT_wiperHealth, VCFRONT_wiperLINHealth, VCFRONT_frunkLatchCurrent, VCFRONT_frunkInteriorRelSwitch, VCFRONT_anyClosureOpen, VCFRONT_anyDoorOpen, VCFRONT_hornOn, VCFRONT_radarHeaterState, VCFRONT_trunkExteriorWakeSwitch, VCFRONT_passengerBuckleStatus, VCFRONT_frunkLatchType, VCFRONT_headlampLeftFanStatus, VCFRONT_headlampRightFanStatus, VCFRONT_frunkAccessPost, VCFRONT_isActiveHeatingBattery, VCFRONT_iBoosterWakeLine, VCFRONT_epasWakeLine, VCFRONT_iBoosterStateDBG, VCFRONT_vehicleStatusDBG, VCFRONT_timeSpentSleeping, VCFRONT_sleepCurrent, VCFRONT_hibernationState, VCFRONT_wiperECUType, VCFRONT_wiperHeaterState, VCFRONT_occupantCount, VCFRONT_closureEasterEggState, VCFRONT_espWakeLine, VCFRONT_allowEvapInLowAmbient, VCFRONT_potentialRadiatorSteam, VCFRONT_potentialRadiatorSteamUI, VCFRONT_hvacReqOffForFasterCharge, VCFRONT_limitedSplitTempDeltaEnforced, VCFRONT_maxEvapHeatRejection, VCFRONT_minEvapHeatRejection, VCFRONT_freezeEvapITerm, VCFRONT_isEvapOperationAllowed, VCFRONT_chillerDemandActive, VCFRONT_compPerfRecoveryLimited, VCFRONT_hvacModeNotAttainable, VCFRONT_hasLowRefrigerant, VCFRONT_isColdStartRunning, VCFRONT_isHeatPumpOilPurgeActive, VCFRONT_pressureRefrigSuction, VCFRONT_pressureRefrigDischarge, VCFRONT_hvacPerfTestCommand, VCFRONT_coolantFillRoutineStatus, VCFRONT_refrigFillRoutineStatus, VCFRONT_isCOP1Running, VCFRONT_closeValvesRoutineStatus, VCFRONT_thermalPerfTestRunning, VCFRONT_5VARailStable, VCFRONT_5VBRailStable, VCFRONT_12VARailStable, VCFRONT_12VBRailStable, VCFRONT_railAState, VCFRONT_railBState, VCFRONT_ChargePumpVoltageStable, VCFRONT_PEResetLineState, VCFRONT_HSDInitCompleteU13, VCFRONT_HSDInitCompleteU16, VCFRONT_vbatMonitorVoltage, VCFRONT_AS8510Voltage, VCFRONT_vbatProt, VCFRONT_logVerbosity, VCFRONT_cabinCoolingCapacityLimited, VCFRONT_cabinHeatingCapacityLimited, VCFRONT_compPowerSupportingHvac, VCFRONT_compPowerSupportingPT, VCFRONT_maxHeatingPowerLeftCC, VCFRONT_maxHeatingPowerRightCC, VCFRONT_activeLouverOpenPos, VCFRONT_activeLouverState, VCFRONT_windshieldCameraHeaterPower

**关键枚举**：
- `VCFRONT_frunkLatchStatus`: SNA/OPENED/CLOSED/CLOSING/OPENING/AJAR/TIMEOUT/DEFAULT/FAULT
- `VCFRONT_wiperSpeed`: SNA/OFF/1/2/3/4/5/LOW/HIGH/NARROW
- `VCFRONT_wiperPosition`: SNA/SERVICE/DEPRESSED_PARK/DELAYED_REST/WIPING
- `VCFRONT_crashDetectedType`: NONE/MINOR_1/MINOR_2/SEVERE
- `VCFRONT_crashState`: IDLE/MINOR_1/MINOR_2/SEVERE
- `VCFRONT_washPumpState`: OFF/DRIVING_PRIMARY/DRIVING_SECONDARY/SNA
- `VCFRONT_turnIndicatorControlType`: UNKNOWN/SINGLE_DETENT_STALK/SWS_BUTTON
- `VCFRONT_wiperHealth`: OFF/WAIT/OK/TIMEOUT/UPDATING/RESERVED
- `VCFRONT_wiperLINHealth`: OFF/WAIT/OK/TIMEOUT/UPDATING/RESERVED
- `VCFRONT_radarHeaterState`: SNA/ON/OFF/OFF_UNAVAILABLE/FAULT
- `VCFRONT_passengerBuckleStatus`: UNBUCKLED/BUCKLED
- `VCFRONT_frunkLatchType`: UNKNOWN/DOUBLE_ACTUATOR/DOUBLE_PULL
- `VCFRONT_iBoosterStateDBG`: OFF/ON/GOING_DOWN/WRITING_DATA_SHUTDOWN/FORCE_OFF
- `VCFRONT_hibernationState`: INIT/NOT_ACTIVE/ACTIVE/RECOVERY/EXIT/PREP
- `VCFRONT_wiperECUType`: UNKNOWN/BOSCH/SHB/VALEO
- `VCFRONT_wiperHeaterState`: SNA/ON/OFF/OFF_UNAVAILABLE/FAULT
- `VCFRONT_hvacPerfTestCommand`: NOT_STARTED/INIT/BLOW/BLOW_BILEVEL/STOP/PRECONDITION
- `VCFRONT_coolantFillRoutineStatus`: NOT_READY/MOVING_TO_FILL_POSITION/READY_TO_FILL/FAULTED
- …(另 2 个枚举信号，见数据源)

## 0x2e5 DIF_power (6 信号)  〔◎ 单源〕

**信号**：DIF_drivePowerMax, DIF_elecPower, DIF_excessHeatCommand, DIF_heatPowerActual, DIF_heatPowerMax, DIF_heatPowerOptimal

## 0x2f3 UI_hvacRequest (26 信号)  〔✔✔ 双源〕

**信号**：UI_enableCustomerTHSAlerts, UI_enableHvacAPFoggingMonitor, UI_enableHvacControlsFeatures1, UI_enableHvacControlsFeatures2, UI_enableHvacLimpMode, UI_enableHvacNotifications, UI_enableHvacVOCPurgeRoutine, UI_enableHvacWeatherDataBasedHumidityControls, UI_evapDryingSelectiveEnable, UI_hvacClimateNudgeStatus, UI_hvacDefogState, UI_hvacLatchPassengerPresent, UI_hvacPhoneCallAirFlowAdjustEnabled, UI_hvacReqACDisable, UI_hvacReqAirDistributionMode, UI_hvacReqAutoBlowerLevel, UI_hvacReqBioWeaponDefMode, UI_hvacReqBlowerSegment, UI_hvacReqKeepClimateOn, UI_hvacReqRecirc, UI_hvacReqSecondRowState, UI_hvacReqTempSetpointCOP, UI_hvacReqTempSetpointLeft, UI_hvacReqTempSetpointRight, UI_hvacReqUserPowerState, UI_hvacUseModeledDuctTemp

**关键枚举**：
- `UI_hvacClimateNudgeStatus`: CLOSED_NO_NUDGE/CLOSED_WITH_NUDGE/OPEN_NO_NUDGE/OPEN_WITH_NUDGE/CLOSED_WITH_EXTERIOR_NUDGE
- `UI_hvacDefogState`: NONE/DEFOG/DEFROST/AUTO_DEFOG
- `UI_hvacReqACDisable`: AUTO/OFF/ON
- `UI_hvacReqAutoBlowerLevel`: VERY_LOW/LOW/MEDIUM/HIGH/VERY_HIGH
- `UI_hvacReqKeepClimateOn`: OFF/ON/DOG/PARTY
- `UI_hvacReqRecirc`: AUTO/RECIRC/FRESH
- `UI_hvacReqSecondRowState`: AUTO/OFF/LOW/MED/HIGH
- `UI_hvacReqTempSetpointCOP`: LOW/MEDIUM/HIGH
- `UI_hvacReqTempSetpointLeft`: LO/HI
- `UI_hvacReqTempSetpointRight`: LO/HI
- `UI_hvacReqUserPowerState`: OFF/ON/PRECONDITION/OVERHEAT_PROTECT_FANONLY/OVERHEAT_PROTECT

## 0x312 BMS_thermalStatus (18 信号)

**信号**：BMS_thermalStatusMultiplexer, BMS_inletActiveCoolTargetT, BMS_inletPassiveTargetT, BMS_inletActiveHeatTargetT, BMS_requestDischarge, BMS_activeHeatingWorthwhile, BMS_pcsNoFlowRequest, BMS_minPackTemperature, BMS_noFlowRequest, BMS_maxPackTemperature, BMS_flowRequest, BMS_coldStagnationLimit, BMS_hotStagnationLimit, BMS_hotCellTempLimit, BMS_i2tDeratingEnabled, BMS_activeCoolCellReferenceT, BMS_activeHeatCellTargetT, BMS_powerDissipation

## 0x31f PARK_status (8 信号)  〔◎ 单源〕

**信号**：PARK_majorVersion, PARK_minorVersion, PARK_serviceRequest, PARK_status, PARK_statusChecksum, PARK_statusCounter, PARK_subMinorVersion, PARK_systemDtcPresent

**关键枚举**：
- `PARK_serviceRequest`: NO_FAILURE/FAILURE/UNUSED/SNA
- `PARK_status`: DISABLED/ENABLED/TEMPORARY_FAILURE/SNA
- `PARK_systemDtcPresent`: FALSE/TRUE/UNUSED/SNA

## 0x321 VCFRONT_sensors (11 信号)

**信号**：VCFRONT_battSensorIrrational, VCFRONT_brakeFluidLevel, VCFRONT_coolantLevel, VCFRONT_ptSensorIrrational, VCFRONT_sensorsChecksum, VCFRONT_sensorsCounter, VCFRONT_tempAmbient, VCFRONT_tempAmbientFiltered, VCFRONT_tempCoolantBatInlet, VCFRONT_tempCoolantPTInlet, VCFRONT_washerFluidLevel

**关键枚举**：
- `VCFRONT_brakeFluidLevel`: SNA/LOW/NORMAL
- `VCFRONT_coolantLevel`: NOT_OK/FILLED
- `VCFRONT_washerFluidLevel`: SNA/LOW/NORMAL

## 0x332 BMS_bmbMinMax (10 信号)

**信号**：BMS_bmbMinMaxMultiplexer, BMS_thermistorNumTMin, BMS_thermistorNumTMax, BMS_thermistorTMax, BMS_thermistorTMin, BMS_thermistorTAvg, BMS_brickVoltageMax, BMS_brickVoltageMin, BMS_brickNumVoltageMax, BMS_brickNumVoltageMin

## 0x333 UI_chargeRequest (16 信号)

**信号**：UI_acChargeCurrentLimit, UI_brickBalancingDisabled, UI_brickVLoggingRequest, UI_chargeEnableRequest, UI_chargeFeature1, UI_chargeFeature2, UI_chargeFeature3, UI_chargePortLatchRequest, UI_chargePowerSampleRequest, UI_chargeTerminationPct, UI_closeChargePortDoorRequest, UI_cpInletHeaterRequest, UI_enableIso15118, UI_openChargePortDoorRequest, UI_scheduledDepartureEnabled, UI_socSnapshotExpirationTime

**关键枚举**：
- `UI_brickBalancingDisabled`: FALSE/TRUE
- `UI_brickVLoggingRequest`: FALSE/TRUE
- `UI_chargePortLatchRequest`: NONE/ENGAGE/DISENGAGE
- `UI_cpInletHeaterRequest`: OFF/AUTO/MANUAL_OVERRIDE

## 0x334 UI_powertrainControl (18 信号)

**信号**：UI_DIAppSliderDebug, UI_closureConfirmed, UI_enableRegenBackfill, UI_enableSmartShift, UI_factoryCustomerDrivingModeRequest, UI_limitMode, UI_motorOnMode, UI_navVehParallelToRdCanContinue, UI_pedalMap, UI_powertrainControlChecksum, UI_powertrainControlCounter, UI_regenTorqueMax, UI_speedLimit, UI_stoppingMode, UI_systemPowerLimit, UI_systemTorqueLimit, UI_wasteMode, UI_wasteModeRegenLimit

**关键枚举**：
- `UI_closureConfirmed`: NONE/FRUNK/PROX/TRUNK
- `UI_enableSmartShift`: OFF/ENABLED_P/ENABLED_P_R_D
- `UI_limitMode`: NORMAL/VALET/FACTORY/SERVICE
- `UI_motorOnMode`: NORMAL/FRONT_ONLY/REAR_ONLY
- `UI_navVehParallelToRdCanContinue`: SNA/FALSE/TRUE
- `UI_pedalMap`: CHILL/SPORT/PERFORMANCE
- `UI_stoppingMode`: STANDARD/CREEP/HOLD
- `UI_wasteMode`: NONE/PARTIAL/FULL/BURN_IN
- `UI_wasteModeRegenLimit`: MAX/30A/10A/0A

## 0x339 VCSEC_authentication (30 信号)  〔◎+✔FW功能(改写吻合)〕

**信号**：VCSEC_3rdPartyFrunkPLGRequest, VCSEC_3rdPartyPLGRequest, VCSEC_BLEConnectionCounter, VCSEC_IDRequested, VCSEC_MCUCommandType, VCSEC_alarmStatus, VCSEC_authRejectionReason, VCSEC_authRequested, VCSEC_authenticationStatus, VCSEC_chargePortLockStatus, VCSEC_frunkLockStatus, VCSEC_immobilizerState, VCSEC_isBLEDeviceWithinSummonRange, VCSEC_isKeyWithinSummonRange, VCSEC_keyChannelIndexed, VCSEC_keyPairDesired, VCSEC_leftFrontLockStatus, VCSEC_leftRearLockStatus, VCSEC_lockIndicationRequest, VCSEC_lockRequestType, VCSEC_operationMode, VCSEC_remoteStartActive, VCSEC_rightFrontLockStatus, VCSEC_rightRearLockStatus, VCSEC_serviceDiagnosticRequest, VCSEC_simpleLockStatus, VCSEC_summonRequest, VCSEC_trunkLockStatus, VCSEC_usingModifiedMACAddress, VCSEC_vehicleLockStatus

**关键枚举**：
- `VCSEC_3rdPartyFrunkPLGRequest`: NONE/MOVE/STOP/SNA
- `VCSEC_3rdPartyPLGRequest`: NONE/MOVE/STOP/SNA
- `VCSEC_MCUCommandType`: NONE/REMOTE_UNLOCK/REMOTE_START/COMMAND3/COMMAND4/COMMAND5
- `VCSEC_authenticationStatus`: NONE/AUTHENTICATED_FOR_UNLOCK/AUTHENTICATED_FOR_DRIVE
- `VCSEC_chargePortLockStatus`: UNLOCKED/LOCKED
- `VCSEC_frunkLockStatus`: UNLOCKED/LOCKED
- `VCSEC_immobilizerState`: IDLE/PREPARE/ENCRYPT_BEGIN/ENCRYPT/SEND_AUTH_RESPONSE/SEND_NO_GO_AUTH_RESPONSE
- `VCSEC_leftFrontLockStatus`: UNLOCKED/LOCKED
- `VCSEC_leftRearLockStatus`: UNLOCKED/LOCKED
- `VCSEC_lockIndicationRequest`: NONE_SNA/SINGLE/DOUBLE/TRIPLE/HOLD
- `VCSEC_operationMode`: UNKNOWN/OWNER/FLEET
- `VCSEC_remoteStartActive`: NONE/LEGACY/SIGNED_COMMAND/SIGNED_COMMAND_PIN_REQUIRED
- `VCSEC_rightFrontLockStatus`: UNLOCKED/LOCKED
- `VCSEC_rightRearLockStatus`: UNLOCKED/LOCKED
- `VCSEC_simpleLockStatus`: SNA/UNLOCKED/LOCKED
- `VCSEC_summonRequest`: IDLE/PRIME/FORWARD/BACKWARD/STOP/SNA
- `VCSEC_trunkLockStatus`: UNLOCKED/LOCKED

## 0x33a UI_range (6 信号)

**信号**：UI_ratedRange, UI_soe, UI_softPackLimitPct, UI_targetFullPackEnergy, UI_uSoe, UI_whpm

## 0x39d IBST_status (7 信号)

**信号**：IBST_LVPowerModeState, IBST_driverBrakeApply, IBST_iBoosterStatus, IBST_internalState, IBST_sInputRodDriver, IBST_statusChecksum, IBST_statusCounter

**关键枚举**：
- `IBST_LVPowerModeState`: NOT_SUPPORTED/AVAILABLE/ACTIVE_MAX600W_NOMINAL350W/RESERVED
- `IBST_driverBrakeApply`: NOT_INIT_OR_OFF/BRAKES_NOT_APPLIED/DRIVER_APPLYING_BRAKES/FAULT
- `IBST_iBoosterStatus`: OFF/INIT/FAILURE/DIAGNOSTIC/ACTIVE_GOOD_CHECK/READY/ACTUATION

## 0x3b3 UI_vehicleControl2 (43 信号)

**信号**：UI_3RLeftSeatHeatReq, UI_3RRightSeatHeatReq, UI_BLEPushNotificationRequest, UI_PINToDriveEnabled, UI_PINToDrivePassed, UI_UMCUpdateInhibit, UI_VCLEFTFeature1, UI_VCSECFeature1, UI_WC3UpdateInhibit, UI_WCUpdateInhibit, UI_alarmTriggerRequest, UI_autoRollWindowsOnLockEnable, UI_autopilotPowerStateRequest, UI_batteryPreconditioningRequest, UI_coastDownMode, UI_conditionalLoggingEnabledVCSEC, UI_dcr12VThreshold, UI_disableHorn, UI_disableMirrorAutoDim, UI_displayOnForUser, UI_freeRollModeRequest, UI_frontLeftSeatAutoClimateReq, UI_frontLeftSeatFanReq, UI_frontRightSeatAutoClimateReq, UI_frontRightSeatFanReq, UI_gloveboxRequest, UI_keepAutopilotAwake, UI_lightSwitch, UI_locksPanelActive, UI_pairKeyQRCodeDisplaying, UI_readyToAddKey, UI_saveTireConfigReq, UI_shorted12VCellTestMode, UI_silentAlarm, UI_sleepFeature1, UI_sleepFeature2, UI_soundHornOnLock, UI_steeringWheelHeatReq, UI_summonState, UI_tireSeason, UI_trunkRequest, UI_virtualPitchSensorOverrideOKForAim, UI_wiperHeaterReq

**关键枚举**：
- `UI_3RLeftSeatHeatReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_3RRightSeatHeatReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_autopilotPowerStateRequest`: NOMINAL/SENTRY/SUSPEND
- `UI_frontLeftSeatFanReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_frontRightSeatFanReq`: OFF/LEVEL1/LEVEL2/LEVEL3
- `UI_lightSwitch`: AUTO/ON/PARKING/OFF/SNA
- `UI_saveTireConfigReq`: FALSE/TRUE
- `UI_shorted12VCellTestMode`: DISABLED/SHADOW/ACTIVE
- `UI_summonState`: SNA/IDLE/PRE_PRIMED/ACTIVE
- `UI_tireSeason`: NON_WINTER/WINTER

## 0x3b6 DI_odometerStatus (4 信号)

**信号**：DI_obdDriveCycleStatus, DI_odometer, DI_odometerStatusChecksum, DI_odometerStatusCounter

## 0x3c2 VCLEFT_switchStatus (75 信号)

**信号**：VCLEFT_switchStatusIndex, VCLEFT_hornSwitchPressed, VCLEFT_hazardButtonPressed, VCLEFT_brakeSwitchPressed, VCLEFT_rightMirrorTilt, VCLEFT_frontSeatTrackBack, VCLEFT_frontSeatTrackForward, VCLEFT_frontSeatTiltDown, VCLEFT_frontSeatTiltUp, VCLEFT_frontSeatLiftDown, VCLEFT_frontSeatLiftUp, VCLEFT_frontSeatBackrestBack, VCLEFT_frontSeatBackrestForward, VCLEFT_frontSeatLumbarDown, VCLEFT_frontSeatLumbarUp, VCLEFT_frontSeatLumbarIn, VCLEFT_frontSeatLumbarOut, VCLEFT_btnWindowSwPackUpLF, VCLEFT_btnWindowSwPackAutoUpLF, VCLEFT_btnWindowSwPackDownLF, VCLEFT_btnWindowSwPackAutoDownLF, VCLEFT_btnWindowSwPackUpLR, VCLEFT_btnWindowSwPackAutoUpLR, VCLEFT_btnWindowSwPackDownLR, VCLEFT_btnWindowSwPackAutoDownLR, VCLEFT_btnWindowSwPackUpRF, VCLEFT_btnWindowSwPackAutoUpRF, VCLEFT_btnWindowSwPackDownRF, VCLEFT_btnWindowSwPackAutoDownRF, VCLEFT_btnWindowSwPackUpRR, VCLEFT_btnWindowSwPackAutoUpRR, VCLEFT_btnWindowSwPackDownRR, VCLEFT_btnWindowSwPackAutoDownRR, VCLEFT_frontBuckleSwitch, VCLEFT_frontOccupancySwitch, VCLEFT_rearLeftBuckleSwitch, VCLEFT_rearCenterOccupancySwitch, VCLEFT_rearLeftOccupancySwitch, VCLEFT_rearRightOccupancySwitch, VCLEFT_brakePressed, VCLEFT_rearHVACButtonPressed, VCLEFT_rearCenterBuckleSwitch, VCLEFT_isAlcoholInterlockSet, VCLEFT_swcLeftTiltRight, VCLEFT_swcLeftPressed, VCLEFT_swcRightTiltLeft, VCLEFT_swcRightTiltRight, VCLEFT_swcRightPressed, VCLEFT_swcLeftTiltLeft, VCLEFT_swcLeftScrollTicks, VCLEFT_swcWiperButtonState, VCLEFT_swcRightScrollTicks, VCLEFT_swcTurnSignalLeftButtonState, VCLEFT_btnWindowUpLR, VCLEFT_btnWindowAutoUpLR, VCLEFT_btnWindowDownLR, VCLEFT_btnWindowAutoDownLR, VCLEFT_2RowSeatReclineSwitch, VCLEFT_2RowSeatCenterSwitch, VCLEFT_2RowSeatLeftFoldFlatSwitch, VCLEFT_2RowSeatRightFoldFlatSwitch, VCLEFT_2RowSeatBothFoldFlatSwitch, VCLEFT_swcLeftDoublePress, VCLEFT_swcRightDoublePress, VCLEFT_2RowSeatBackrestFoldSwitch, VCLEFT_swcTurnSignalRightButtonState, VCLEFT_swcHighBeamButtonState, VCLEFT_swcVoiceControlPress, VCLEFT_swcCameraButtonState, VCLEFT_swcRightPressedQF, VCLEFT_2RowSeatReclineSwitchpackState, VCLEFT_3RowLeftBuckleSwitch, VCLEFT_frontSeatThighSupportExtendSwitch, VCLEFT_frontSeatThighSupportRetractSwitch, VCLEFT_frontSeatResistiveOccupancy

**关键枚举**：
- `VCLEFT_rightMirrorTilt`: STOP/DOWN/UP/RIGHT/LEFT
- `VCLEFT_frontSeatTrackBack`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatTrackForward`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatTiltDown`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatTiltUp`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatLiftDown`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatLiftUp`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatBackrestBack`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatBackrestForward`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatLumbarDown`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatLumbarUp`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatLumbarIn`: SNA/OFF/ON/FAULT
- `VCLEFT_frontSeatLumbarOut`: SNA/OFF/ON/FAULT
- `VCLEFT_frontBuckleSwitch`: SNA/OFF/ON/FAULT
- `VCLEFT_frontOccupancySwitch`: SNA/OFF/ON/FAULT
- `VCLEFT_rearLeftBuckleSwitch`: SNA/OFF/ON/FAULT
- `VCLEFT_rearCenterOccupancySwitch`: SNA/OFF/ON/FAULT
- `VCLEFT_rearLeftOccupancySwitch`: SNA/OFF/ON/FAULT
- …(另 20 个枚举信号，见数据源)

## 0x3c3 VCRIGHT_switchStatus (26 信号)

**信号**：VCRIGHT_switchStatusIndex, VCRIGHT_trunkExtReleasePressedPersist, VCRIGHT_frontSeatTrackBack, VCRIGHT_frontSeatTrackForward, VCRIGHT_frontSeatTiltDown, VCRIGHT_frontSeatTiltUp, VCRIGHT_frontSeatLiftDown, VCRIGHT_frontSeatLiftUp, VCRIGHT_frontSeatBackrestBack, VCRIGHT_frontSeatBackrestForward, VCRIGHT_frontSeatLumbarDown, VCRIGHT_frontSeatLumbarUp, VCRIGHT_frontSeatLumbarIn, VCRIGHT_frontSeatLumbarOut, VCRIGHT_2RowSeatReclineSwitch, VCRIGHT_2RowSeatBackrestFoldSwitch, VCRIGHT_frontSeatThighSupportExtendSwitch, VCRIGHT_frontHandlePWM, VCRIGHT_hvacHeatingAllowedLeft, VCRIGHT_rearHandlePWM, VCRIGHT_gloveboxLightCurrent, VCRIGHT_frontSeatALR, VCRIGHT_frontSeatResistiveOccupancy, VCRIGHT_2RowSeatReclineSwitchpackState, VCRIGHT_hvacHeatingAllowedRight, VCRIGHT_frontSeatThighSupportRetractSwitch

**关键枚举**：
- `VCRIGHT_frontSeatTrackBack`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatTrackForward`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatTiltDown`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatTiltUp`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatLiftDown`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatLiftUp`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatBackrestBack`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatBackrestForward`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatLumbarDown`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatLumbarUp`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatLumbarIn`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatLumbarOut`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatThighSupportExtendSwitch`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatALR`: SNA/OFF/ON/FAULT
- `VCRIGHT_frontSeatResistiveOccupancy`: SNA/OFF/ON/FAULT
- `VCRIGHT_2RowSeatReclineSwitchpackState`: DISCONNECTED/INACTIVE/FORWARD_SLOW/FORWARD_FAST/REARWARD_SLOW/REARWARD_FAST/FAULT
- `VCRIGHT_frontSeatThighSupportRetractSwitch`: SNA/OFF/ON/FAULT

## 0x3d2 BMS_kwhCounter (2 信号)

**信号**：BMS_kwhChargeTotal, BMS_kwhDischargeTotal

## 0x3d8 UI_elevationStatus (2 信号)

**信号**：UI_elevation, UI_navElevation

## 0x3df UI_status2 (25 信号)

**信号**：UI_activeTouchPoints, UI_autopilotSentryRequest, UI_autoshiftDRState, UI_connectivityStandbyActive, UI_displayInDarkMode, UI_linkState, UI_locatedAtFavorite, UI_locatedAtHome, UI_locatedAtWork, UI_mobileAppConnected, UI_mobileAppStepCount, UI_phoneLeftInCabin, UI_sapActive, UI_sapClients, UI_selfParkState, UI_sentryModeCameraDetection, UI_sentryModeState, UI_sohHealthStatus, UI_summonDeviceIndex, UI_touchDetected, UI_userActivity, UI_userRequestSnapshot, UI_validDeviceForEUSummon, UI_wakeOnIPActive, UI_wifiBtModuleType

**关键枚举**：
- `UI_linkState`: NONE/CELL/WIFI
- `UI_mobileAppConnected`: NOT_CONNECTED/CONNECTED
- `UI_sentryModeState`: OFF/IDLE/ARMED/AWARE/PANIC/QUIET/SNA
- `UI_sohHealthStatus`: UNKNOWN/NO_INTERNET/REDUCED/OK
- `UI_userActivity`: IDLE/ACTIVE
- `UI_wifiBtModuleType`: UNKNOWN/QCA6595/BCM4359/TCU4G/ELEKTRA

## 0x3e2 VCLEFT_lightStatus (25 信号)

**信号**：VCLEFT_FLMapLightStatus, VCLEFT_FLMapLightSwitchPressed, VCLEFT_FRMapLightStatus, VCLEFT_FRMapLightSwitchPressed, VCLEFT_RLMapLightStatus, VCLEFT_RLMapLightSwitchPressed, VCLEFT_RRMapLightStatus, VCLEFT_RRMapLightSwitchPressed, VCLEFT_brakeLightStatus, VCLEFT_brakeTrailerLightStatus, VCLEFT_fogTrailerLightStatus, VCLEFT_frontRideHeight, VCLEFT_leftDashRGBPowerRequest, VCLEFT_leftTurnTrailerLightStatus, VCLEFT_rearRideHeight, VCLEFT_reverseLightStatus, VCLEFT_reverseTrailerLightStatus, VCLEFT_rideHeightSensorFault, VCLEFT_rightDashRGBPowerRequest, VCLEFT_rightTrnTrailerLightStatus, VCLEFT_tailLightOutageStatus, VCLEFT_tailLightStatus, VCLEFT_tailTrailerLightStatus, VCLEFT_trailerDetected, VCLEFT_turnSignalStatus

**关键枚举**：
- `VCLEFT_FLMapLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_FRMapLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_RLMapLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_RRMapLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_brakeLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_brakeTrailerLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_fogTrailerLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_leftTurnTrailerLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_reverseLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_reverseTrailerLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_rightTrnTrailerLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_tailLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_tailTrailerLightStatus`: OFF/ON/FAULT/SNA
- `VCLEFT_trailerDetected`: SNA/FAULT/DETECTED/NOT_DETECTED
- `VCLEFT_turnSignalStatus`: OFF/ON/FAULT/SNA

## 0x3e3 VCRIGHT_lightStatus (13 信号)

**信号**：VCRIGHT_CHMSLLightStatus, VCRIGHT_audioCurrentSpikeDetected, VCRIGHT_brakeLightStatus, VCRIGHT_fasciaLeftTurnSignalStatus, VCRIGHT_fasciaRearFogStatus, VCRIGHT_fasciaReverseLightStatus, VCRIGHT_fasciaRightTurnSignalStatus, VCRIGHT_fasciaTailLightStatus, VCRIGHT_leftInteriorTrunkLightReq, VCRIGHT_rearFogLightStatus, VCRIGHT_reverseLightStatus, VCRIGHT_tailLightStatus, VCRIGHT_turnSignalStatus

**关键枚举**：
- `VCRIGHT_CHMSLLightStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_brakeLightStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_fasciaLeftTurnSignalStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_fasciaRearFogStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_fasciaReverseLightStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_fasciaRightTurnSignalStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_fasciaTailLightStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_rearFogLightStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_reverseLightStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_tailLightStatus`: OFF/ON/FAULT/SNA
- `VCRIGHT_turnSignalStatus`: OFF/ON/FAULT/SNA

## 0x3e9 DAS_bodyControls (27 信号)

**信号**：DAS_adaptiveHighBeamIsFaulted, DAS_ahlbOverride, DAS_autoWiperState, DAS_bodyControlsChecksum, DAS_bodyControlsCounter, DAS_drivePowerStateRequest, DAS_driverDomeLightRequest, DAS_dynamicBrakeLightRequest, DAS_enableIcrDataCollection, DAS_forwardCamHeaterDutyCycle, DAS_forwardRadarPowerRequest, DAS_hazardLightRequest, DAS_headlightRequest, DAS_heaterRequest, DAS_highLowBeamDecision, DAS_highLowBeamOffReason, DAS_mirrorFoldRequest, DAS_overrideWiperSetting, DAS_rPillarCamHeaterDutyCycle, DAS_radarHeaterRequest, DAS_restrictDoorReleaseLeft, DAS_restrictDoorReleaseRight, DAS_turnIndicatorRequest, DAS_turnIndicatorRequestReason, DAS_ulcConfirmationRequestActive, DAS_wiperSpeed, DAS_wiperWashRequest

**关键枚举**：
- `DAS_autoWiperState`: OFF/SLOW_INTERMITTENT/FAST_INTERMITTENT/SLOW_CONTINUOUS/FAST_CONTINUOUS/SNA
- `DAS_hazardLightRequest`: OFF/ON/ON_FAST/SNA
- `DAS_headlightRequest`: OFF/ON/TAIL_LIGHTS_ONLY/INVALID
- `DAS_heaterRequest`: SNA/OFF/ON
- `DAS_highLowBeamDecision`: UNDECIDED/OFF/ON/SNA
- `DAS_mirrorFoldRequest`: NONE/FOLD/UNFOLD/SNA
- `DAS_restrictDoorReleaseLeft`: INACTIVE/ACTIVE
- `DAS_restrictDoorReleaseRight`: INACTIVE/ACTIVE
- `DAS_turnIndicatorRequest`: NONE/LEFT/RIGHT/CANCEL/DEFER

## 0x3f5 VCFRONT_lighting (20 信号)

**信号**：VCFRONT_ambientLightingBrightnes, VCFRONT_courtesyLightingRequest, VCFRONT_dynamicBrakeLightState, VCFRONT_frontFogFunctionState, VCFRONT_hazardLightRequest, VCFRONT_hazardSwitchBacklight, VCFRONT_headlightsReadyOrTimedOut, VCFRONT_highBeamControlState, VCFRONT_highBeamLatchingState, VCFRONT_indicatorLeftInternal, VCFRONT_indicatorLeftRequest, VCFRONT_indicatorRightInternal, VCFRONT_indicatorRightRequest, VCFRONT_intHighBeamsFunctionState, VCFRONT_latchedHighBeamsFunctionState, VCFRONT_lightingCoreState, VCFRONT_lightingCustomState, VCFRONT_switchLightingBrightness, VCFRONT_turnIndicatorStalk, VC_fastFlashHazardsActive

**关键枚举**：
- `VCFRONT_dynamicBrakeLightState`: OFF/ACTIVE_LOW/ACTIVE_HIGH
- `VCFRONT_hazardLightRequest`: NONE/BUTTON/LOCK/UNLOCK/MISLOCK/CRASH/CAR_ALARM/DAS/UDS
- `VCFRONT_highBeamControlState`: IDLE/INTERMITTENT/LATCHED/DAS_AUTO
- `VCFRONT_highBeamLatchingState`: SNA/UNLATCHED/LATCHING/LATCHED
- `VCFRONT_indicatorLeftInternal`: OFF/ACTIVE_LOW/ACTIVE_HIGH
- `VCFRONT_indicatorLeftRequest`: OFF/ACTIVE_LOW/ACTIVE_HIGH
- `VCFRONT_indicatorRightInternal`: OFF/ACTIVE_LOW/ACTIVE_HIGH
- `VCFRONT_indicatorRightRequest`: OFF/ACTIVE_LOW/ACTIVE_HIGH
- `VCFRONT_lightingCoreState`: OFF/POS_PARK/DRL/DRL_PLUS_REAR_POS_PARK/LOW_BEAMS/CUSTOM/SNA
- `VCFRONT_turnIndicatorStalk`: IDLE/LEFT/RIGHT/SNA

## 0x3fd UI_autopilotControl (74 信号)  〔✔✔ 双源〕

**信号**：UI_autopilotControlIndex, UI_hovEnabled, UI_donDisableAutoWiperDuration, UI_donDisableOnAutoWiperSpeed, UI_blindspotMinSpeed, UI_blindspotDistance, UI_blindspotTTC, UI_donStopEndOfRampBuffer, UI_donDisableCutin, UI_smartSetSpeedOffset, UI_smartSetSpeedOffsetType, UI_autopilotMonarchBackup, UI_fsdVisualizationEnabled, UI_fsdStopsControlEnabled, UI_fsdContinueOnGreenWithCIPV, UI_smartSetSpeed, UI_automaticSetSpeedOffset, UI_apply2021_1958_ISA, UI_apply2021_646_ELKS, UI_apply2021_1341_DDAW, UI_homelinkNearby, UI_enableFullSelfDriving, UI_hasFullSelfDriving, UI_autosteerActivation, UI_autopilotDrivingProfile, UI_fsdBetaRequest, UI_fullSelfDrivingSuspended, UI_disableOptionalLaneChanges, UI_applyR152_AEBS, UI_autopilotControlMux0Valid, UI_selectableCameraRequest, UI_overrideSleepWithSuspend, UI_driverMonitorConfirmation, UI_parkAssistUseVision, UI_applyEceR79, UI_enableMapStops, UI_disableMain, UI_disableNarrow, UI_disableFisheye, UI_disableLeftPillar, UI_disableRightPillar, UI_disableLeftRepeater, UI_disableRightRepeater, UI_disableBackup, UI_disableRadar, UI_noStalkConfirmAlertHaptic, UI_regulatoryLKA, UI_regulatoryLaneAssistLevel, UI_ulcSnooze, UI_noStalkConfirmAlertChime, UI_factorySummonEnable, UI_apmv3Branch, UI_enableCabinCamera, UI_enableAutopilotStopWarning, UI_showLaneGraph, UI_showTrackLabels, UI_hardCoreSummon, UI_enableCabinCameraTelemetry, UI_enableVisionSpeedControl, UI_autopilotTelemetryInChina, UI_enableTeslaAutopark, UI_autoTurnSignalMode, UI_enableCautionLightControl, UI_applyEceR79SmartSummonOnly, UI_autopilotMonarchEnabled, UI_autopilotEphemerisEnabled, UI_enableCabinAudioRecording, UI_autopilotControlMux1Valid, UI_enableApproachingEmergencyVehicleDetection, UI_enableStartFsdFromParkBrakeConfirmation, UI_enableStartFsdFromPark, UI_fsdMaxSpeedOffsetPercentage, UI_coldStartMonarchInFactory, UI_autopilotControlMux2Valid

**关键枚举**：
- `UI_hovEnabled`: OFF/ON
- `UI_donDisableAutoWiperDuration`: DEFAULT/5_S/15_S/30_S/60_S/120_S/OFF
- `UI_blindspotDistance`: DEFAULT/0P5_M/1_M/2_M/4_M/OFF
- `UI_blindspotTTC`: DEFAULT/0P5_S/1_S/2_S/4_S/3_S/5_S/OFF
- `UI_donStopEndOfRampBuffer`: DEFAULT/15_M/30_M/45_M/OFF
- `UI_donDisableCutin`: OFF/ON
- `UI_smartSetSpeedOffsetType`: FIXED_OFFSET/PERCENTAGE_OFFSET
- `UI_homelinkNearby`: NOT_NEARBY/NEARBY
- `UI_autosteerActivation`: SINGLE_CLICK/DOUBLE_CLICK
- `UI_autopilotDrivingProfile`: CHILL/NORMAL/ASSERTIVE
- `UI_fsdBetaRequest`: NOT_ACTIVE/ACTIVE
- `UI_overrideSleepWithSuspend`: DISABLED/ENABLED
- `UI_regulatoryLaneAssistLevel`: WARNING/ASSIST
- `UI_apmv3Branch`: LIVE/STAGE/DEV/STAGE2/EAP/DEMO
- `UI_autoTurnSignalMode`: OFF/AUTO_CANCEL

## 0x401 BMS_brickMeasurements (218 信号)

**信号**：BMS_brickVoltageCounter, BMS_brickVoltageMultiplexer, BMS_brickVoltageStatus1, BMS_brickVoltageStatus2, BMS_brickVoltageStatus3, BMS_brickVoltage1, BMS_brickVoltage2, BMS_brickVoltage3, BMS_brickVoltageStatus4, BMS_brickVoltageStatus5, BMS_brickVoltageStatus6, BMS_brickVoltage4, BMS_brickVoltage5, BMS_brickVoltage6, BMS_brickVoltageStatus7, BMS_brickVoltageStatus8, BMS_brickVoltageStatus9, BMS_brickVoltage7, BMS_brickVoltage8, BMS_brickVoltage9, BMS_brickVoltageStatus10, BMS_brickVoltageStatus11, BMS_brickVoltageStatus12, BMS_brickVoltage10, BMS_brickVoltage11, BMS_brickVoltage12, BMS_brickVoltageStatus13, BMS_brickVoltageStatus14, BMS_brickVoltageStatus15, BMS_brickVoltage13, BMS_brickVoltage14, BMS_brickVoltage15, BMS_brickVoltageStatus16, BMS_brickVoltageStatus17, BMS_brickVoltageStatus18, BMS_brickVoltage16, BMS_brickVoltage17, BMS_brickVoltage18, BMS_brickVoltageStatus19, BMS_brickVoltageStatus20, BMS_brickVoltageStatus21, BMS_brickVoltage19, BMS_brickVoltage20, BMS_brickVoltage21, BMS_brickVoltageStatus22, BMS_brickVoltageStatus23, BMS_brickVoltageStatus24, BMS_brickVoltage22, BMS_brickVoltage23, BMS_brickVoltage24, BMS_brickVoltageStatus25, BMS_brickVoltageStatus26, BMS_brickVoltageStatus27, BMS_brickVoltage25, BMS_brickVoltage26, BMS_brickVoltage27, BMS_brickVoltageStatus28, BMS_brickVoltageStatus29, BMS_brickVoltageStatus30, BMS_brickVoltage28, BMS_brickVoltage29, BMS_brickVoltage30, BMS_brickVoltageStatus31, BMS_brickVoltageStatus32, BMS_brickVoltageStatus33, BMS_brickVoltage31, BMS_brickVoltage32, BMS_brickVoltage33, BMS_brickVoltageStatus34, BMS_brickVoltageStatus35, BMS_brickVoltageStatus36, BMS_brickVoltage34, BMS_brickVoltage35, BMS_brickVoltage36, BMS_brickVoltageStatus37, BMS_brickVoltageStatus38, BMS_brickVoltageStatus39, BMS_brickVoltage37, BMS_brickVoltage38, BMS_brickVoltage39, BMS_brickVoltageStatus40, BMS_brickVoltageStatus41, BMS_brickVoltageStatus42, BMS_brickVoltage40, BMS_brickVoltage41, BMS_brickVoltage42, BMS_brickVoltageStatus43, BMS_brickVoltageStatus44, BMS_brickVoltageStatus45, BMS_brickVoltage43, BMS_brickVoltage44, BMS_brickVoltage45, BMS_brickVoltageStatus46, BMS_brickVoltageStatus47, BMS_brickVoltageStatus48, BMS_brickVoltage46, BMS_brickVoltage47, BMS_brickVoltage48, BMS_brickVoltageStatus49, BMS_brickVoltageStatus50, BMS_brickVoltageStatus51, BMS_brickVoltage49, BMS_brickVoltage50, BMS_brickVoltage51, BMS_brickVoltageStatus52, BMS_brickVoltageStatus53, BMS_brickVoltageStatus54, BMS_brickVoltage52, BMS_brickVoltage53, BMS_brickVoltage54, BMS_brickVoltageStatus55, BMS_brickVoltageStatus56, BMS_brickVoltageStatus57, BMS_brickVoltage55, BMS_brickVoltage56, BMS_brickVoltage57, BMS_brickVoltageStatus58, BMS_brickVoltageStatus59, BMS_brickVoltageStatus60, BMS_brickVoltage58, BMS_brickVoltage59, BMS_brickVoltage60, BMS_brickVoltageStatus61, BMS_brickVoltageStatus62, BMS_brickVoltageStatus63, BMS_brickVoltage61, BMS_brickVoltage62, BMS_brickVoltage63, BMS_brickVoltageStatus64, BMS_brickVoltageStatus65, BMS_brickVoltageStatus66, BMS_brickVoltage64, BMS_brickVoltage65, BMS_brickVoltage66, BMS_brickVoltageStatus67, BMS_brickVoltageStatus68, BMS_brickVoltageStatus69, BMS_brickVoltage67, BMS_brickVoltage68, BMS_brickVoltage69, BMS_brickVoltageStatus70, BMS_brickVoltageStatus71, BMS_brickVoltageStatus72, BMS_brickVoltage70, BMS_brickVoltage71, BMS_brickVoltage72, BMS_brickVoltageStatus73, BMS_brickVoltageStatus74, BMS_brickVoltageStatus75, BMS_brickVoltage73, BMS_brickVoltage74, BMS_brickVoltage75, BMS_brickVoltageStatus76, BMS_brickVoltageStatus77, BMS_brickVoltageStatus78, BMS_brickVoltage76, BMS_brickVoltage77, BMS_brickVoltage78, BMS_brickVoltageStatus79, BMS_brickVoltageStatus80, BMS_brickVoltageStatus81, BMS_brickVoltage79, BMS_brickVoltage80, BMS_brickVoltage81, BMS_brickVoltageStatus82, BMS_brickVoltageStatus83, BMS_brickVoltageStatus84, BMS_brickVoltage82, BMS_brickVoltage83, BMS_brickVoltage84, BMS_brickVoltageStatus85, BMS_brickVoltageStatus86, BMS_brickVoltageStatus87, BMS_brickVoltage85, BMS_brickVoltage86, BMS_brickVoltage87, BMS_brickVoltageStatus88, BMS_brickVoltageStatus89, BMS_brickVoltageStatus90, BMS_brickVoltage88, BMS_brickVoltage89, BMS_brickVoltage90, BMS_brickVoltageStatus91, BMS_brickVoltageStatus92, BMS_brickVoltageStatus93, BMS_brickVoltage91, BMS_brickVoltage92, BMS_brickVoltage93, BMS_brickVoltageStatus94, BMS_brickVoltageStatus95, BMS_brickVoltageStatus96, BMS_brickVoltage94, BMS_brickVoltage95, BMS_brickVoltage96, BMS_brickVoltageStatus97, BMS_brickVoltageStatus98, BMS_brickVoltageStatus99, BMS_brickVoltage97, BMS_brickVoltage98, BMS_brickVoltage99, BMS_brickVoltageStatus100, BMS_brickVoltageStatus101, BMS_brickVoltageStatus102, BMS_brickVoltage100, BMS_brickVoltage101, BMS_brickVoltage102, BMS_brickVoltageStatus103, BMS_brickVoltageStatus104, BMS_brickVoltageStatus105, BMS_brickVoltage103, BMS_brickVoltage104, BMS_brickVoltage105, BMS_brickVoltageStatus106, BMS_brickVoltageStatus107, BMS_brickVoltageStatus108, BMS_brickVoltage106, BMS_brickVoltage107, BMS_brickVoltage108

**关键枚举**：
- `BMS_brickVoltageStatus1`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus2`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus3`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus4`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus5`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus6`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus7`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus8`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus9`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus10`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus11`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus12`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus13`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus14`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus15`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus16`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus17`: MISSING/BAD/NOMINAL/BYPASSED
- `BMS_brickVoltageStatus18`: MISSING/BAD/NOMINAL/BYPASSED
- …(另 90 个枚举信号，见数据源)

## 0x4e2 VCLEFT_seatStatus (60 信号)

**信号**：VCLEFT_seatStatusIndex, VC_AH_1RowLeftSeatMovementHealth, VCLEFT_frontSeatTrackPos, VCLEFT_frontSeatTrackCurrent, VCLEFT_frontSeatTrackDuty, VCLEFT_frontSeatTrackState, VCLEFT_frontSeatTrackCalibrated, VCLEFT_frontSeatTrackLog, VCLEFT_frontSeatTrackBridgeSt, VCLEFT_frontSeatTrackPercentage, VCLEFT_frontSeatBackPos, VCLEFT_frontSeatBackCurrent, VCLEFT_frontSeatBackDuty, VCLEFT_frontSeatBackState, VCLEFT_frontSeatBackCalibrated, VCLEFT_frontSeatBackLog, VCLEFT_frontSeatBackBridgeSt, VCLEFT_frontSeatBackPercentage, VCLEFT_frontSeatLiftPos, VCLEFT_frontSeatLiftCurrent, VCLEFT_frontSeatLiftDuty, VCLEFT_frontSeatLiftState, VCLEFT_frontSeatLiftCalibrated, VCLEFT_frontSeatLiftLog, VCLEFT_frontSeatLiftBridgeSt, VCLEFT_frontSeatLiftPercentage, VCLEFT_frontSeatTiltPos, VCLEFT_frontSeatTiltCurrent, VCLEFT_frontSeatTiltDuty, VCLEFT_frontSeatTiltState, VCLEFT_frontSeatTiltCalibrated, VCLEFT_frontSeatTiltLog, VCLEFT_frontSeatTiltBridgeSt, VCLEFT_frontSeatTiltPercentage, VCLEFT_lumbarAState, VCLEFT_lumbarBState, VCLEFT_lumbarAPressureHpa, VCLEFT_lumbarAPressureHpaFilt, VCLEFT_lumbarBPressureHpa, VCLEFT_lumbarBPressureHpaFilt, VCLEFT_lumbarActiveTooLongErr, VCLEFT_lumbarMaxPErr, VCLEFT_lumbarOvercurrentErr, VCLEFT_lumbarMaxOperatingPErr, VCLEFT_lumbarMinPErr, VCLEFT_lumbarGeneralErr, VCLEFT_lumbarDevMaxPumpPressA, VCLEFT_lumbarDevMaxPumpPressB, VCLEFT_frontSeatTrackPosReal, VCLEFT_frontSeatBackPosReal, VCLEFT_frontSeatLiftPosReal, VCLEFT_frontSeatTiltPosReal, VCLEFT_frontSeatThighSupportPosReal, VCLEFT_frontSeatTrackPosOffset, VCLEFT_frontSeatBackPosOffset, VCLEFT_frontSeatLiftPosOffset, VCLEFT_frontSeatTiltPosOffset, VCLEFT_frontSeatThighSupportPosOffset, VCLEFT_lumbarAPressurePercentage, VCLEFT_lumbarBPressurePercentage

**关键枚举**：
- `VCLEFT_frontSeatTrackState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCLEFT_frontSeatTrackBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCLEFT_frontSeatBackState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCLEFT_frontSeatBackBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCLEFT_frontSeatLiftState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCLEFT_frontSeatLiftBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCLEFT_frontSeatTiltState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCLEFT_frontSeatTiltBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCLEFT_lumbarAState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCLEFT_lumbarBState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED

## 0x4e3 VCRIGHT_seatStatus (60 信号)

**信号**：VCRIGHT_seatStatusIndex, VC_AH_1RowRightSeatMovementHealth, VCRIGHT_frontSeatTrackPos, VCRIGHT_frontSeatTrackCurrent, VCRIGHT_frontSeatTrackDuty, VCRIGHT_frontSeatTrackState, VCRIGHT_frontSeatTrackCalibrated, VCRIGHT_frontSeatTrackLog, VCRIGHT_frontSeatTrackBridgeSt, VCRIGHT_frontSeatTrackPercentage, VCRIGHT_frontSeatBackPos, VCRIGHT_frontSeatBackCurrent, VCRIGHT_frontSeatBackDuty, VCRIGHT_frontSeatBackState, VCRIGHT_frontSeatBackCalibrated, VCRIGHT_frontSeatBackLog, VCRIGHT_frontSeatBackBridgeSt, VCRIGHT_frontSeatBackPercentage, VCRIGHT_frontSeatLiftPos, VCRIGHT_frontSeatLiftCurrent, VCRIGHT_frontSeatLiftDuty, VCRIGHT_frontSeatLiftState, VCRIGHT_frontSeatLiftCalibrated, VCRIGHT_frontSeatLiftLog, VCRIGHT_frontSeatLiftBridgeSt, VCRIGHT_frontSeatLiftPercentage, VCRIGHT_frontSeatTiltPos, VCRIGHT_frontSeatTiltCurrent, VCRIGHT_frontSeatTiltDuty, VCRIGHT_frontSeatTiltState, VCRIGHT_frontSeatTiltCalibrated, VCRIGHT_frontSeatTiltLog, VCRIGHT_frontSeatTiltBridgeSt, VCRIGHT_frontSeatTiltPercentage, VCRIGHT_lumbarAState, VCRIGHT_lumbarBState, VCRIGHT_lumbarAPressureHpa, VCRIGHT_lumbarAPressureHpaFilt, VCRIGHT_lumbarBPressureHpa, VCRIGHT_lumbarBPressureHpaFilt, VCRIGHT_lumbarActiveTooLongErr, VCRIGHT_lumbarMaxPErr, VCRIGHT_lumbarOvercurrentErr, VCRIGHT_lumbarMaxOperatingPErr, VCRIGHT_lumbarMinPErr, VCRIGHT_lumbarGeneralErr, VCRIGHT_lumbarDevMaxPumpPressA, VCRIGHT_lumbarDevMaxPumpPressB, VCRIGHT_frontSeatTrackPosReal, VCRIGHT_frontSeatBackPosReal, VCRIGHT_frontSeatLiftPosReal, VCRIGHT_frontSeatTiltPosReal, VCRIGHT_frontSeatThighSupportPosReal, VCRIGHT_frontSeatTrackPosOffset, VCRIGHT_frontSeatBackPosOffset, VCRIGHT_frontSeatLiftPosOffset, VCRIGHT_frontSeatTiltPosOffset, VCRIGHT_frontSeatThighSupportPosOffset, VCRIGHT_lumbarAPressurePercentage, VCRIGHT_lumbarBPressurePercentage

**关键枚举**：
- `VCRIGHT_frontSeatTrackState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCRIGHT_frontSeatTrackBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCRIGHT_frontSeatBackState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCRIGHT_frontSeatBackBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCRIGHT_frontSeatLiftState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCRIGHT_frontSeatLiftBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCRIGHT_frontSeatTiltState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCRIGHT_frontSeatTiltBridgeSt`: DISABLED/ENABLED/BRAKE/COAST
- `VCRIGHT_lumbarAState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED
- `VCRIGHT_lumbarBState`: STOPPED/MOVING_UP/MOVING_DOWN/RECALLING/CALIBRATING/UNDEFINED

## 0x678 GTW_gearControl (16 信号)

**信号**：GTW_autoParkRequest, GTW_gearControlChecksum, GTW_gearControlCounter, GTW_gearShiftRequest, GTW_gearStripChangeReason, GTW_gearStripEnable, GTW_osdActive, GTW_primaryGearControlStatus, GTW_processingRDgestures, GTW_processingTapPgestures, GTW_screenPCBTemperature, GTW_showAutoParkButton, GTW_showNeutralButton, GTW_smartShiftStatus, GTW_steamOff, GTW_touchActive

**关键枚举**：
- `GTW_autoParkRequest`: IDLE/ACTIVE
- `GTW_gearShiftRequest`: IDLE_SNA/PARK/REVERSE/NEUTRAL/DRIVE

## 0x679 UI_ambientLightingCtrls (14 信号)

**信号**：UI_ambientLightPowerOverride, UI_audioVisualizerState, UI_rgbBrightnessLevel, UI_rgbEffectType, UI_rgbEnableState, UI_rgbLightingColorHexBlue, UI_rgbLightingColorHexGreen, UI_rgbLightingColorHexRed, UI_rgbTargetDOORFL, UI_rgbTargetDOORFR, UI_rgbTargetDOORRL, UI_rgbTargetDOORRR, UI_rgbTargetIPFL, UI_rgbTargetIPFR

**关键枚举**：
- `UI_rgbEnableState`: OFF/ON/AUTO

