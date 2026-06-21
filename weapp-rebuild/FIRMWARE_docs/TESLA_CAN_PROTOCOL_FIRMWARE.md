# 特斯拉 CAN 协议逆向（固件实证）— ID/Payload 含义 · 解析算法 · 控制注入

> 目标：**以固件 `firmware.bin` 为主**，逐一还原特斯拉 CAN ID 的 payload 含义、固件**怎么解析**收到的
> CAN 帧、以及“某个控制状态**怎么发出** CAN 帧”。小程序仅用于**佐证定标/语义**。
>
> 全部结论可复现：用 capstone(RISC-V) 反汇编（脚本见 §7）。标注：
> **✔FW**=固件反汇编实证；**✔APP**=小程序解析器佐证；**◎DBC**=特斯拉 Model3/Y 社区 DBC 交叉命名（未必逐位精确）；**?**=待确认。

---

## 1. 解析总架构（数据怎么从 CAN 流到状态）✔FW

```
CAN_RX_ISR(0x0800825e) → rx_store(0x08008218)  // 把收到的帧存成 12 字节结构
        帧结构(12B): [ID:u16 @0][DLC @2][D0..D7 @3..10][pad @11]      ← §1.1 实证
        │
        ▼
decode_dispatch(0x08009e2e)  // lhu id,0(frame); 对 ID 做二分查找(BST)
        │  命中 → thunk(0x0800a1xx)  // 设 a0=帧指针, a1=状态表索引, a2=源指针
        ▼
解码器三类：
   (A) STATE  j 0x08000272   // 把 12 字节整帧 memcpy 进“信号状态表”，按 idx×12 定位
   (B) custom 大函数          // 直接逐位拆 D0..D7，写多个状态变量
   (C) TXINJECT j 0x08008062 // 收到→改写→重算计数器/CRC→用原 ID 回注(见 §4)
        │
        ▼
信号状态表 @RAM(≈0x20002xxx, 12B/条)  // signal_state(dir,idx,buf): a0≠0 读 / a0=0 写
        │
        ▼
打包器：手机发 tx(0xB0/0xD0…) → 读状态表多条 → 位压缩成 33B/29B 包 → ble_notify(0x08000c02)
        │
        ▼
小程序 gaugeParser/batteryParser 逐位解码+定标 → 展示页
```

### 1.1 帧结构实证（D0 = 帧偏移 3）✔FW
`decode_dispatch` 用 `lhu a5,0(s0)` 取 ID（偏移 0，2 字节）。0xD0 电池打包器读 `state[1]`（=0x132）的
**偏移 3、4** 两字节拼成总电压，而小程序 `batteryParser` 把电池包 `[0..1]×0.01` 解释为总电压——
两端对齐 ⇒ **D0(数据字节0)=帧偏移 3**。故 12 字节帧 = `[IDlo,IDhi, DLC, D0,D1,D2,D3,D4,D5,D6,D7, pad]`。

### 1.2 状态表访问器 `signal_state(0x08000272)` ✔FW
```
idx*0xC 定位；memcpy 指针取自 0x4004c；
a0≠0 → 读(state→buf)；a0=0 → 写(buf→state)；每条固定 12 字节。
```

---

## 2. 逐 ID 解析表（固件实证 + 定标佐证）★

> “数据字节读取”列是**固件解码器实际访问的字节与位运算**（✔FW，capstone 抽取）。
> `Dn` = 数据字节 n（帧偏移 n+3）。`>>` 右移、`<<` 左移、`&` 掩码。
> STATE 型自身只 memcpy，位提取在打包器（见 §3）；定标见小程序列（✔APP）。

| CAN ID | 名称(◎DBC) | 解码器 | 类型 | 固件读取的数据字节/位(✔FW) | 信号 & 定标(✔APP/◎) |
|--------|-----------|--------|------|---------------------------|---------------------|
| 0x082 | TRIP_PLANNING | 0x08004722 | TXINJECT | D-1 bit10 | 行程/预热（改写回注） |
| 0x102 | VCLEFT_doorStatus | 0x08005398 | custom | D0;D1>>4&1;D0&0xf0;D1>>5&1 | 左侧门/锁位 |
| 0x103 | VCRIGHT_doorStatus | 0x08004f7a | custom | D0&0xf;D7&0xf | 右侧门/锁位 |
| 0x118 | DriveSystemStatus | 0x0800442a | custom | **D2>>5**(3bit);D4 | 挡位(P/R/N/D)=D2[5:7]；车速/状态 |
| 0x129 | SteeringAngle | (BST 子树) | custom | — | 方向盘转角 |
| 0x132 | BMS_hvBusStatus | STATE idx1 | STATE | (整帧存) | D0..1=总电压×0.01V；D2..3=总电流×-0.1A |
| 0x1f9 | ?(充电/HVAC) | 0x0800507e | TXINJECT | D0<<5&0x1f | 改写回注 |
| 0x20c | VCRIGHT_hvacStatus | (子树) | custom | — | 鼓风机/蒸发器/座舱温 |
| 0x229 | SCCM_steerLever | 0x08004370 | TXINJECT | D1;D2;D1<<4&0xf | 挡杆/拨杆（注入） |
| 0x243 | ? | 0x080027ea | custom | D0&7 | 3bit 状态 |
| 0x249 | ? | 0x08003e1e | TXINJECT | D1&0xf | 注入 |
| 0x257 | DI_speed | 0x080076ec | custom | **D3,D4** 拼 9bit | 车速 |
| 0x25a | ? | 0x080045a2 | custom | D0;D1;D2;D3 | 多字节 |
| 0x266 | RearTorque/Power | 0x08009f6a | custom(idx1) | (经换算) | 后电机功率(11bit 有符号/2) |
| 0x292 | BMS_socStatus | STATE idx3 | STATE | (整帧存) | SOC 7/10bit |
| 0x293 | UI_powertrain | 0x080026be | TXINJECT | D6;D-1 | 注入 |
| 0x2b6 | ? | 0x08002662 | TXINJECT | D0&0xb7 | 门禁/注入 |
| 0x2e1 | VCFRONT_status | 0x08004f26 | custom | D0&7>>3 | 前车体状态 |
| 0x2f3 | UI_status | 0x08002946 | custom | D4>>6;D2>>4&3;D2&3<<4;D3&0x1c | UI 复合状态 |
| 0x31f | ? | 0x080045e8 | custom | D0;D2;D4;D6 | 温度/环境 |
| 0x321 | VCFRONT_temperatures | 0x0800285e | custom | **D5** | 环境温度 ×0.5-40℃ |
| 0x332 | BMS_bmbMinMax | STATE idx4 | STATE | (整帧存) | 单体 max/min 12bit×0.002V |
| 0x333 | UI_chargeRequest | 0x08004816 | TXINJECT | D0&3;D3 | **充电请求（改写回注）** |
| 0x339 | ? | 0x08006564 | custom | D1>>4 | — |
| 0x33a | UI_rangeSOC | (SCALE) | custom | (×0.625 类) | 续航/能耗/SOC |
| 0x352 | BMS_energyStatus | STATE idx6 | STATE | (整帧存) | 出厂/当前容量、剩余 kWh |
| 0x39d | ? | 0x08004a5a | custom | D1>>9&1;D3 | — |
| 0x3b3 | ? | STATE idx7 | STATE | (整帧存) | — |
| 0x3b6 | ? | 0x080074b2 | custom | D0..D3 拼 32bit | — |
| 0x3c3 | ? | 0x08003b0e | TXINJECT | D0&3;D5&0xf;D5&0xc0 | 注入 |
| 0x3d2 | BMS_kwhCounter | (子树) | STATE/custom | — | 累计充/放电 kWh ×0.001 |
| 0x3d8 | ? | 0x08007504 | custom | D0&0x3f;D1&0x3f | — |
| 0x3df | ? | STATE idx11 | STATE | (整帧存) | — |
| 0x3e2 | ? | 0x080038d4 | custom | D0&3;D1&0x40;D2&3 | 位标志 |
| 0x3e3 | ? | 0x08007544 | custom | D1&1 | 1bit |
| 0x3f5 | ? | 0x08001f2e | custom(idx14) | D0>>4;D4 | — |
| 0x3fd | AP/DAS_control | (子树) | custom | — | AP/限速/盲区/手扶 |
| 0x3fe | (制动) | 0x08004b5e | custom | **D1>>6;D2>>6;D5>>6;D3;D4;D6** | 4×刹车温度(10bit-40) |
| 0x401 | BMS_brickVoltages | 0x080090dc | custom(mux) | D0=mux;D1..D6 | 单体电压(每帧3×u16×1e-4V) |
| 0x405 | ? | 0x08004650 | custom | D0 | — |
| 0x4e2 | ? | STATE idx15 | STATE | (整帧存) | — |
| 0x4f3 | ? | 0x0800cf90 | custom | — | （改写回注，见 §4） |
| 0x679 | ? | 0x08003ba8 | TXINJECT | D4>>8;D5;D-1 | 注入 |

> 监控总表（53 个，bin 实扫 @`0x0800f188`）见 §6；上表为分发器命中并能定位解码器的 40 个。
> 凡 **STATE 型**（0x132/0x292/0x332/0x352/0x3b3/0x3df/0x4e2…）整帧入表，**位含义由打包器决定（§3）**。

---

## 3. 状态包装配（哪个 CAN ID 进哪个字段）✔FW

### 3.1 电池包 0xD0（29B，打包器 0x080097cc–0x080099ba）✔FW
打包器按序 `signal_state(读, idx)` 取这些状态条，再位压缩：

| 读取 idx | 来源 CAN ID | 进入电池包字段（×定标见小程序） |
|----------|-------------|-------------------------------|
| idx1 | 0x132 BMS_hvBusStatus | `[0..1]`总电压×0.01V、`[2..3]`总电流×-0.1A |
| idx10 | (0x3d2/0x312 系) | 充/放电 kWh、温度 |
| idx4 | 0x332 BMS_bmbMinMax | `[18..20]`单体 max/min×0.002V |
| idx5 | (能量/容量系) | 容量/保留电量 |
| idx6 | 0x352 BMS_energyStatus | 出厂/当前容量、剩余 kWh |
| idx3 | 0x292 BMS_socStatus | `[24..25]`SOC |

> 结论：**电池包 = 把 0x132/0x292/0x332/0x352/0x3d2/0x312 等 BMS 帧的原始字节重新位压缩**。
> 因此“读 0x132 的 D0..D1 即总电压×0.01”这类**原始 CAN 解析法**与小程序 `batteryParser` 完全一致。

### 3.2 仪表包 0xB0（33B，打包器 0x08008f44 / 0x08007978）
同理由 0x118(挡位/车速)、0x102/0x103(车门)、0x257(车速)、0x266/0x2e5(电机功率)、0x3fd(AP/限速/盲区)、
0x3fe(刹车温度)、0x20c(HVAC)、0x312/0x33a(电池温/续航) 等状态条位压缩而成；逐字段位布局见
`TESLA_CAN_TSL_REFERENCE.md` §1.3（✔APP）。**那张表的“源 CAN ID”列在此被固件证实**。

---

## 4. 控制：某个状态怎么发出 CAN 帧 ✔FW

### 4.1 命令分发器（手机→设备）✔FW
命令分发在 `0x0800958a` 起，对命令码二分（0xA1/0xA3/0xA7/0xC0/0xC1…）。
`167(0xA7)` 与 `187(0xBB)` 的处理（`0x08009ac0` 起）：
```
lbu a2, 0(s1)        // 从 BLE payload 取“动作码” = s1[0]
a1 = 0xA7 / 0xBB     // 命令类型
a0 = s0              // 连接上下文
jal <动作执行器>      // 共用：把(动作码)翻译成具体 CAN 帧并注入
```
即 **167/187 都只带 1 字节动作码**，由固件内部“动作执行器”查表合成 CAN 帧。`162(0xA2)` 同理（滚轮码）。

### 4.2 注入封装 `tx_wrapper(0x08008062)` ✔FW
```
jal 0x080001d4          // CAN_TX 门禁(LISTEN_ONLY)：为 0 直接 return，不发
StdId = frame[0](u16)   // 发送 ID 由帧结构体决定
DLC   = frame[2]
memcpy(TxMsg.Data, frame+3, DLC)
CAN_Transmit(CAN1=0x40006400)
```

### 4.3 “收到→改写→原 ID 回注”(re-sign) 的 9 个 ID ✔FW
分发器里解码 thunk 直接尾跳 `tx_wrapper` 的 ID（TXINJECT 型）：
**`0x082 0x1f9 0x229 0x249 0x293 0x2b6 0x333 0x3c3 0x679`**（+事件短表 `0x189 0x21c 0x334 0x3a1 0x3b0 0x3e9`）。
重签名算法（写回前必做，否则被特斯拉总线丢弃）：
```
frame[9]  = frame[9] + 0x10            // 4-bit 滚动计数器(counter)高 nibble +1
frame[10] = CRC_table[counter >> 4]    // 查表(~0x0800eadc)重算 CRC 字节
→ tx_wrapper(原 ID 回注)
```
> 例：`0x333 UI_chargeRequest` 收到后改 D0 低 2 位（充电请求位）+ 重签名 + 原 ID 发回，
> 实现“蓝牙点一下→车辆响应充电口”。这就是“某状态怎么发 CAN”的真实路径。

### 4.4 动作码字典（行为语义，✔APP 佐证）
167/187 的动作码 1..255 含义见小程序 `functionOptions.js`（座椅/车门/灯光/AP/喇叭/模块…约 200 项）
与 `vehicleControl.js`（167：门 0-3、备箱 8/9、电池加热 4/5、座椅 12-29、记忆 52-71）。
> ⚠️ **动作码 → 确切目标 CAN ID + 8 字节数据** 的全表在固件“动作执行器”大 switch 里，本文给出
> **机制 + 9 个回注 ID + 重签名算法**；逐码 8 字节展开需继续反汇编该执行器（可按需逐码追）。

---

## 5. 原始 CAN 解析算法速查（不经 TSL 模块，直接读总线）

把上面 ✔FW 的字节访问 + ✔APP 的定标合并，即“直接从特斯拉总线解析”的配方：

```
0x132 BMS_hvBusStatus:  电压 = (D0|D1<<8)×0.01 V ;  电流 = (D2|D3<<8)×-0.1 A
0x292 BMS_socStatus:    SOC  = (取 7/10bit 字段)
0x332 BMS_bmbMinMax:    单体max/min = 12bit×0.002 V
0x352 BMS_energyStatus: 出厂/当前容量 ×0.1 / ×0.02 kWh
0x3d2 BMS_kwhCounter:   累计充/放电 = u32×0.001 kWh
0x401 BMS_brickVoltages: D0=mux索引; 每帧 3×u16×0.0001 V (收齐 mux 拼 96 串)
0x118 DriveSystemStatus: 挡位 = D2[5:7]→0/P/R/N/D
0x257 DI_speed:         车速 = D3..D4 拼 9bit
0x102/0x103 门状态:     D0/D1 位 → 左前/左后/右前/右后/前后备箱
0x3fe 制动:            4×刹车温度 = D1/D2/D5 的 >>6 等 10bit 字段 -40 ℃
0x321 VCFRONT_temp:    环境温度 = D5×0.5 - 40 ℃
0x3fd AP/DAS:          AP状态/道路限速(×5)/盲区/手扶 位字段
```
通用换算：有符号 n 位 `x≥2^(n-1)?x-2^n:x`；温度多为 `×0.25-25` 或 `×0.5-40`；功率 11bit 有符号 `/2` kW。

---

## 6. 附录：监控 ID 全表（bin 实扫）✔FW
```
@0x0800f188 (53 个有效 + 0x7ff 哨兵)：
0x082 0x102 0x103 0x118 0x129 0x132 0x1f9 0x20c 0x229 0x238 0x243 0x249 0x257 0x25a
0x25d 0x266 0x273 0x292 0x293 0x2b6 0x2e1 0x2e5 0x2f3 0x312 0x31f 0x321 0x332 0x333
0x334 0x339 0x33a 0x352 0x39d 0x3b3 0x3b6 0x3c2 0x3c3 0x3d2 0x3d8 0x3df 0x3e2 0x3e3
0x3e9 0x3f5 0x3fd 0x3fe 0x401 0x405 0x4e2 0x4e3 0x4f3 0x678 0x679
@0x0800f17a 注入/事件短表(6)：0x334 0x3e9 0x21c 0x189 0x3a1 0x3b0
```

## 7. 复现脚本（capstone 5.0.7，RISC-V）
- `/tmp/fwall.py` — 扫描分发器(`0x08009e2e`)→thunk→decoder，并抽取每个解码器对 D0..D7 的字节/位访问。
- `/tmp/fwpack.py` — 抽取 0xD0 打包器读取的状态 idx（→源 CAN ID），定位命令分发器各命令码站点。
- `/tmp/fwdis.py <addr> [n]` — 任意地址反汇编。
- 关键地址：dispatch `0x08009e2e`、state `0x08000272`、电池打包 `0x080097cc`、仪表打包 `0x08008f44`、
  命令分发 `0x0800958a`、tx_wrapper `0x08008062`、门禁 `0x080001d4`、CRC 表 `~0x0800eadc`。

---

## 8. 关键结论
1. **解析法**：`decode_dispatch(0x08009e2e)` 按 ID 二分→解码器把 D0..D7 拆位或整帧入状态表→打包器位压缩成
   29B/33B 包。**原始 CAN 字节→信号的定标，与小程序解析器逐项吻合**（§5）。
2. **控制法**：167/187/162 只带 1 字节动作码，固件“动作执行器”合成 CAN 帧；对 **9 个 ID 做改写+滚动计数器
   +CRC 重签名+原 ID 回注**（§4）。
3. **覆盖**：已实证 40 个解析 ID 的解码器与字节访问、电池包 6 段来源、注入机制与回注 ID。
   未尽：每个解码器/打包器的**逐位精确公式**、动作执行器的**逐码 CAN 帧**——均可用 §7 脚本逐项续掘。
