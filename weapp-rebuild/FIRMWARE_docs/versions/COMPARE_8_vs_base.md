# 版本对比：8（TSL8） vs base（c6eec2f9，已分析版）

> 方法：语义对齐（CAN ID 集合、逐位解析、锚点、字符串），脚本 `../scripts/{fwlocate,fwanalyze,gen_perid}.py`。
> base=62464 B（0xF400）、8=77824 B（0x13000）。**8 是 base 的功能演进版**（+15 KB，净 +5 个 CAN ID）。

## 结论（先说要点）

8 相比 base 是一次**真实的功能升级**（区别于 8↔9 的同源重构）：
1. **新增 5 类车辆系统监控**（ESP 车身稳定 / DAS 驾驶辅助 / PCS 电源 等），删除电池热帧。
2. 解析层主体不变（共有 64 ID 中 52 个逐位完全相同）。
3. 固件增大 15 KB、新增设备标识 `BLE-M3`。

## 1. CAN ID 集合差异

| | 数量 | ID |
|---|------|----|
| base | 67 | — |
| 8 | 72 | — |
| **8 新增** | +8 | `0x145 ESP_status`、`0x399 DAS_status`、`0x2b4 PCS_dcdcRailStatus`、`0x370 SCS_alertMatrix2`、`0xf4`、`0x39b`、`0x3ea`、`0x498`（后四者不在公开 DBC，疑车身控制簇/私有） |
| **8 删除** | −3 | `0x312 BMS_thermalStatus`、`0x3b0`、`0x4a8` |

**新增监控的语义**（◎ref 固件 2026.2 / 社区 DBC）：
- **0x145 ESP_status** — ESP 车身稳定系统状态（新增底盘动态监控）。
- **0x399 DAS_status** — 驾驶辅助系统（Autopilot/DAS）状态。
- **0x2b4 PCS_dcdcRailStatus** — 电源转换系统 DC-DC 轨道状态（低压供电监控）。
- **0x370** — ⚠ 固件按**转向/EPAS（hands-on）**语义改写（无感免打扰：摆动 12 位转向信号注入 CAN1，见 `COMPARE_8_vs_9.md` §6.4）；旧标 `SCS_alertMatrix2` 与此行为不符，命名待按 DBC 核实。

> 即 8 把监控面从「车身/电池/UI」扩展到「**底盘稳定 + 驾驶辅助 + 电源系统**」，删除了独立的电池热帧
> （`0x312`，可能并入 `0x352 BMS_energyStatus(mux)` 或 `0x332`）。

## 2. 解析层差异（共有 64 ID）

- **52 个逐位解析完全相同**（接收→状态链路主体未变）。
- **12 个读位有变化**：`0x102 0x118 0x20c 0x266 0x293 0x2b6 0x2e5 0x2f3 0x39d 0x3a1 0x3f5 0x4f3`。
  其中部分是**真实解析微调**（如 `0x266 DIR_power` base 无独立读位 → 8 读 `D0/D1`），
  部分可能是**编译布局导致的提取差异**（如 `0x118` base `D2>>5挡位` → 8 `D2`，疑移位被编译到后续，需个案确认）。
  → 重写时对这 12 个应以 8 自身反汇编为准（`gen_perid.py versions/v8/8.bin`）。

## 3. 锚点 / 布局

| 锚点 | base | 8 | 说明 |
|------|------|---|------|
| reset_target | 0x0d034 | 0x106d4 | 8 启动入口后移（固件变大） |
| can_dispatch | 0x09e36 | 0x0cd62 | 分发表更大（base 32 → 8 59 ID 密集） |
| state_helper | 0x00272 | 0x0029c | signal_state（idx×12B 状态表项，同构） |
| packer_b0 | 0x08f44 | 0x0bb28 | 0xB0 仪表打包器 |

`signal_state` 结构两版一致（`a1×12` 索引 12 字节状态表项），状态表机制未变。

## 4. 字符串 / 设备标识
- 8 新增 `BLE-M3` 设备标识（base 无）→ 面向 Model 3 的蓝牙形态标识。
- BLE 库一致：两版均 `CH32V20x_BLE_LIB_V1.3`。

## 对重写的意义
base→8 是**监控能力扩展**：在保留原 CAN 解析框架（state_helper/打包器/分发器机制不变）的前提下，
新增 ESP/DAS/PCS/SCS 监控 ID 并调整少数解析。重写时以 base 框架为基，按本文 §1/§2 增补新增 ID 与调整项即可。
