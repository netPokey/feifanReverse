# 整机固件重写 — 最终总览 (CH32V208 特斯拉蓝牙↔CAN 控制器)

据 `9.bin` 逆向重写的模块化 C 工程。**147 host 测试全过**;端口语法自检通过。

## 1. 整机结构
```
                     ┌──────────────── 读链路 ────────────────┐
 特斯拉 CAN ─RX ISR─→ fw_on_can_rx → can_dispatch(72 ID)
                          ├─ 解码器(decode/) → 具名信号(sig)/状态表 ─→ packer ─→ ble_notify(0xB0仪表/0xD0电池/0xD1电芯/0xD2)
                          └─ 0x370/0x229 → modemdr re-sign ─┐
                     ┌──────────────── 控链路 ────────────────┤
 手机 BLE ─GATT写─→ fw_on_ble_write → ble_proto拆帧 → 鉴权门(168) → ble_router(160-240)
                          ├─ 0xA3配置/0xAB·B9·BA块/0xA5重启/0xA9改密/0xC0调试/0xC1/0xD1/0xD2
                          ├─ 0xA7·0xBB·0xA2 → control(动作表+re-sign+透传)
                          └─ 0xB0/0xD0 开轮询
 周期 ─fw_tick─→ modemdr_dispatch(免打扰) + ble_app_poll_tick(推包)
                          └────────── 全部发送 ─→ can_tx 门禁(默认LISTEN_ONLY) ─→ CAN1(0x40006400)
```
**端口入口**:`fw_init / fw_on_can_rx / fw_on_ble_write / fw_tick / fw_set_tx_enabled`(`port/mdr_port_ch32v208.c` 已接 CAN1 ISR / GATT / TMOS)。

## 2. 覆盖度(诚实)
| 区 | 状态 | 说明 |
|----|------|------|
| BLE 帧/校验/鉴权 | ✅ 完整 | 0x55 7F+校验、168 密码(实证9.bin有) |
| BLE 命令字典 | ✅ 18+码 | 含读/配置/轮询/重启/改密/调试/查询/电芯/DCDC;0xF0主机留桩 |
| CAN 接收解码 | ◑ 18/72 精确 | 车速/挡位/门/SOC/续航/温/电压电流/kwh/电机×2/海拔/HVAC/胎压×4 逐位实证;余 54 通用捕获 |
| 0xB0/0xD0 打包 | ◑ 主字段 | 已填上述;STATE 派生(turn/AP/handsOn/单体V)待反 0xB0 getter |
| 免打扰 ModeMDR | ✅ 逐位 | 0x370 无感(振荡/计数器/加法校验) + 0x229 滚轮,与9.bin逐位对齐 |
| re-sign 注入 | ✅ 机制(已校正) | D6低nibble计数器+加法校验(本会话对照9.bin修正3处) |
| 控制注入 167/187 | ◑ 表+机制 | ~70 动作码枚举表+分发;执行器定位(167@0x0800e474/187@0x0800c1b2),逐动作帧字节在其内,续查入口已给 |
| BLE→CAN 透传 | ✅ | 任意帧,过门禁 |
| 配置/块/OTA | ✅ 接口 | 163位图/171·185·186块/OTA页(flash端口接) |
| CAN_TX 门禁 | ✅ | 默认 LISTEN_ONLY |

> 详细逐点对照见 `VERIFICATION.md`。**核心两链路 + 免打扰逐位对齐**;长尾(54 控制簇解码 + 200 动作帧字节)为机制已通、数据待逐项补,入口/方法均已定位。

## 3. 上板清单 (WCH CH32V20x SDK + CH32V20x_BLE_LIB)
1. `make test` 本机过(纯逻辑,无需硬件)。
2. 把 `include/ src/ decode/` 全部 `.c` 加入你的 WCH 工程编译;`port/mdr_port_ch32v208.c` 作 HAL。
3. **[BOARD]** 改 `port/`:CAN1 引脚(示例 PB8/9)、波特率(示例 500k@APB1=36M)、时钟。
4. **BLE**:GATT 写回调→`MDR_OnGattWrite(buf,n)`;`MDR_BleSend` 接 BLE 库分片 notify FFF1;`MDR_Init()`(已含 `fw_init`)放初始化后。
5. **CAN**:`USB_LP_CAN1_RX0_IRQHandler` 已接 `fw_on_can_rx`;TMOS 周期已接 `fw_tick`。
6. **OTA**:`ota_set_flash_writer()` 注入你的 flash 擦写。
7. 默认 LISTEN_ONLY;放行注入调 `fw_set_tx_enabled(1)`。
8. ISR 用 `__attribute__((interrupt("WCH-Interrupt-fast")))`(WCH riscv 工具链)。

## 4. 续查长尾的方法(入口已定位)
- **解码逐位化**:`scripts/` capstone 反汇编各 ID handler(分发表 `0x0800cdfe` BST 找臂→handler),按读位填 `decode/can_decoders.c` + `sig`。
- **STATE 仪表字段**:反 0xB0 打包器 getter(状态表→包位)。
- **逐动作帧**:反 167 执行器 `0x0800e474` / 187 执行器 `0x0800c1b2`,每动作码→构造的 CAN 帧字节,填回 `control.c`(用已校正的 D6 低nibble+加法校验 re-sign)。

## 5. 测试
`make test` → **147**(modemdr 36 / framework 17 / decode 18 / packer 18 / ble 23 / control 13 / config 10 / integration 6 / actions 6)。
