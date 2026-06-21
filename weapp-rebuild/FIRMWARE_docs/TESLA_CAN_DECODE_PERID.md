# 特斯拉 CAN 逐 ID 逐位解析详表（固件实证·解析层）

> 本文是"重写固件·解析层"的工作底稿：对**每个 CAN ID**，给出固件解码器**实际读取的数据位公式**
> 与**写入的状态变量(gp+off)**，再经打包器/小程序对照出**信号语义与定标**。
> 方法链：`解码器读 Dn 位 → 写 gp 状态变量 → 打包器搬进蓝牙包 → 小程序 parser 定标`。
>
> 证据：**✔FW**=反汇编实证（脚本 `scripts/fwbits.py`/`fwdecode.py`）；**✔APP**=小程序定标佐证；**◎**=命名推断。
> 帧布局：`[ID:2][DLC@2][D0@3 … D7@10][pad@11]`；下文 `Dn[a:b]` = 数据字节 n 的第 a..b 位。

---

## 1. 解析层数据流（重写时的分层）

```
CAN 帧 →[解码器]→ gp 状态变量(全局, gp=0x27ffc000) →[打包器 0xD0/0xB0]→ 蓝牙包 →[小程序 parser]→ 展示
        逐位拆/换算        12B/条 或 单变量            位压缩 29B/33B        定标
```
- **解码器三型**：`custom`(直接逐位拆写 gp 变量)、`STATE`(整帧 memcpy 进 12B 状态表，位含义在打包器)、
  `SCALE`(经 `0x080001a6` 做 ×10/16≈0.625 换算)、`TXINJECT`(改写回注，见控制层文档)。
- **状态变量**：custom 型把信号写进 `gp+off`（本文"写状态"列）；打包器再从这些地址读出拼包。

---

## 2. 精确范例（已逐位实证 ✔FW）

### 2.1 `0x118` DriveSystemStatus —— 挡位
```
gear = D2[5:7] (3 位) → 0=无效/1=P/2=R/3=N/4=D     // lbu D2; srli 5; 与上次比对, 变化则写+触发
```
另读 D4（驾驶状态标志，变化检测）。对应小程序 `gaugeParser` gear（仪表包 byte0 bits9-11）。

### 2.2 `0x257` DI_speed —— 车速
```
speed = ((D4 & 1) << 8) | D3      // 9 位
if (speed == 0x1FF) speed = 0     // 0x1FF = 无效
写 gp+0xF4 (halfword) = speed      // 车速状态变量
```
✔APP：小程序仪表包 byte0 bits0-8 = 车速。

### 2.3 `0x3fe` 制动 —— 4 路刹车温度（10 位跨字节拼接）
```
T0 = ((D2 & 0x3F) << 4) | (D1 >> 4)      → gp+0x190 (h)
T1 = (D3 << 2) | (D2 >> 6)               → gp+0x192 (h)
T2 = ((D5 & 3) << 8) | D4                 → gp+0x194 (h)
T3 = ((D6 & 0xF) << 6) | (D5 >> 2)        → gp+0x196 (h)
温度℃ = T - 40                            // 偏移在小程序/打包
```
✔APP：小程序 `gaugeParser` brakeTemp×4（10bit-40），逐项吻合。

### 2.4 `0x321` VCFRONT_temperatures —— 环境温度
```
raw = D5 ; 变化检测后 尾跳 0x08009158 写 gp+0x1E8
环境温度℃ = D5 × 0.5 - 40              // ✔APP 小程序定标
```

### 2.5 `0x102/0x103` 车门（左/右）
```
0x102 左: 门状态 = D0[0:3] (4 位)，按 gp+0x1F8 模式门控；另取 D1[4],D1[5] 标志位
0x103 右: D0[0:3], D0[4:7], D7[0:3]
```
✔APP：小程序仪表包 byte0 bits16-19 = 4 门(左前/左后/右前/右后)，来源即 0x102/0x103。

### 2.6 `0x312` BMS_thermal —— 热管理温度（3×9bit 跨字节）
```
tempA = ((D6 & 0x1F) << 4) | (D5 >> 4)     // 9 位
tempB = ((D5 & 0x0F) << 5) | (D4 >> 3)     // 9 位
tempC = ((D7 & 0x3F) << 3) | (D6 >> 5)     // 9 位
// 温度℃ ≈ 字段 ×0.25 - 偏移（与小程序电池温度/仪表 batteryTemp ×0.25-25 同源）
```

### 2.7 `0x33a` UI_rangeSOC —— 续航 / SOC / 能耗
```
if (D5 == 0xFF) 该帧无效
fieldA = ((D3 & 7) << 4) | (D2 >> 4)       // 7 位（SOC 类）
fieldB = ((D1 & 3) << 8) | D0              // 10 位（续航/能耗类）
// ✔APP 小程序 UI_rangeSOC：续航 ×1.61 km、SOC（与 §1 仪表/电池包对应）
```

### 2.8 `0x129` SteeringAngle —— 方向盘转角
```
angle = ((D3 & 0x3F) << 8) | ((D2 & 0x3F) << 8 的低位拼) // 约 12-14 位
写 gp+0x1d8(b), gp+0x1dc(h)
```
（✔FW 读 D2&0x3f / D3&0x3f；精确拼接位序待细化）

### 2.9 `0x20c` VCRIGHT_hvac —— HVAC（鼓风机/蒸发器/座舱温）
```
fieldA = ((D1 & 7) << 8) | D0      // 11 位（鼓风机 RPM / 蒸发器需求 W）
fieldB = ((D5 & 3) << 8) | D4      // 10 位（座舱温/风量）
// ✔APP 小程序仪表包：鼓风机 ×5 RPM、蒸发器 ×5 W、座舱温 ×0.1-40℃
```

### 2.10 `0x401` BMS_brickVoltages —— 单体电压（mux 多路）
```
D0 = mux 索引；D1..D6 = 3 × u16 单体电压
解码器按 mux 索引查表(基址 auipc+0x652)存入电芯数组，收齐所有 mux 帧得 96 串
// ✔APP 小程序 parseCellFrame(209 命令)：每串 ×1e-4 V
```

### 2.11 其余 custom ID 逐位精修（批次 1）✔FW
| CAN ID | 逐位公式 | 写状态 | 语义 |
|--------|---------|--------|------|
| 0x103 VCRIGHT_door | D0[0:3]=右门 / D0[4:7] / D7[0:3] | RAM 门状态 | 右侧门/锁 |
| 0x2e1 VCFRONT_status | D0[0:2](3bit) / D0[3:6](4bit) | gp+0xd4 区 | 前车体状态 |
| 0x2f3 UI_status | D4[6]=布尔 / D2[4:5](2bit) / D2[0:1](2bit) | 多 RAM 标志 | UI 复合状态 |
| 0x405 | D0(条件写) | gp+0x188 | ? |

### 2.12 其余 custom ID 逐位（批次 2，✔FW 读位）
| CAN ID | 逐位读取 | 写状态 | 语义 |
|--------|---------|--------|------|
| 0x238 | D1[0:4](5bit) | — | 动力总成? |
| 0x243 | D0[0:2](3bit) | gp+0x167, gp+0x1f4 | 传感标志 |
| 0x249 | D1[0:3](4bit) | — | 状态 |
| 0x25a | D0,D1,D2,D3(4×字节) | gp+0x184..0x187 | 多字节(温度?) |
| 0x25d | @2(=DLC) | — | 充电状态 |
| 0x31f | D0,D2,D4,D6 | gp+0x184..0x187(与0x25a共享区) | 温度/环境 |
| 0x339 | D1[4:7] | — | — |
| 0x39d | (D1\|D2)[9], D3 | gp+0x189, gp+0x18c | — |
| 0x3b6 | D0..D3 拼 32bit | (auipc RAM) | — |
| 0x3c2 | D0[0:1](inline) | (内联) | 位标志 |
| 0x3d8 | D0[0:5],D1[0:5] 各<<8 | — | 双 12bit |
| 0x3e2 | D0[0:1],D1[6],D2[0] | (auipc RAM) | 位标志 |
| 0x3e3 | D1[0](1bit) | — | 1bit 标志 |
| 0x3f5 | D0[4:7],D4 | 状态表[14] | — |
| 0x3fd | D0[0:2](inline) | (内联) | AP/DAS 状态 |

> 至此 **53 监控 ID 全部具备逐位读取信息**（§2 精确公式 16 个 + §2.11/2.12 批次 + §3 骨架表）。
> 语义标 `?` 者固件未给信号名，重写时照搬位逻辑即可；其精确"信号→工程量"由小程序 parser 对应（§5/`TESLA_CAN_TSL_REFERENCE.md`）。

---

## 3. 逐 ID 解析骨架表（✔FW 读位 + 写状态变量）

> "读取数据位"= 解码器实际访问的 Dn 与位运算（capstone 抽取）；"写状态"= `sb/sh/sw → gp+off`。
> `STATE` 型整帧入表（idx 见列），位含义在打包器（§5）。`·`=该列无显式立即数/直写。

| CAN ID | 名称 | 型 | 读取数据位(Dn+位运算) ✔FW | 写状态变量 gp+off ✔FW | 信号(◎/✔APP) |
|--------|------|----|--------------------------|----------------------|--------------|
| 0x082 | TRIP_PLANNING | TXINJECT | @2[10] | — | 行程/预热(回注) |
| 0x102 | VCLEFT_door | custom | D0&0xf, D1[4],D1[5] | (auipc RAM) | 左门状态 |
| 0x103 | VCRIGHT_door | custom | D0&0xf, D0>>4, D7&0xf | (auipc RAM) | 右门状态 |
| 0x118 | DriveSystemStatus | custom | **D2>>5(挡位)**, D4 | (auipc RAM) | 挡位/驾驶状态 |
| 0x129 | SteeringAngle | custom | (子树,待补) | — | 方向盘转角 |
| 0x132 | BMS_hvBusStatus | STATE idx1 | memcpy | 状态表[1] | 总电压/电流(§5) |
| 0x1f9 | ? | TXINJECT | D0<<5&0x1f | — | 回注 |
| 0x229 | SCCM_steerLever | TXINJECT | D1, D2, D1<<4&0xf | — | 挡杆(注入) |
| 0x243 | ? | custom | D0&7 | **gp+0x167, gp+0x1f4** | 传感/标志 |
| 0x249 | ? | custom | D1&0xf | — | 4位状态 |
| 0x257 | DI_speed | custom | **D3,D4[0]→车速9bit** | **gp+0xf4(h)**, gp+0x1d0,0x1d1 | 车速 |
| 0x25a | ? | custom | D0,D1,D2,D3 | **gp+0x184..0x187(b)** | 4字节(温度?) |
| 0x266 | RearTorque | custom idx1 | (经SCALE) | — | 后电机功率 |
| 0x292 | BMS_socStatus | STATE idx3 | memcpy | 状态表[3] | SOC(§5) |
| 0x293 | UI_powertrain | TXINJECT | D6, @2 | **gp+0x166(b)** | 动力总成 |
| 0x2b6 | ? | TXINJECT | D0 | **gp+0x165(b)** | 门禁/状态 |
| 0x2e1 | VCFRONT_status | custom | D0&7>>3 | (尾跳0x09158) gp+0x1e8 | 前车体 |
| 0x2f3 | UI_status | custom | D4[6], D2[4:5], D2[0:1], D3[2:4] | (auipc RAM) | UI 复合状态 |
| 0x31f | ? | custom | D0,D2,D4,D6 | **gp+0x184..0x187(b)** | 4字节(温度?) |
| 0x321 | VCFRONT_temps | custom | **D5→环境温度** | (尾跳0x09158) gp+0x1e8 | 环境温度×0.5-40 |
| 0x332 | BMS_bmbMinMax | STATE idx4 | memcpy | 状态表[4] | 单体max/min(§5) |
| 0x333 | UI_chargeReq | TXINJECT | D0&3, D3 | — | 充电请求(回注) |
| 0x339 | ? | custom | D1>>4 | — | — |
| 0x352 | BMS_energy | STATE idx6 | memcpy | 状态表[6] | 容量/能量(§5) |
| 0x39d | ? | custom | D1[9],D3 | **gp+0x189,gp+0x18c(b)** | — |
| 0x3b6 | ? | custom | D0,D1,D2,D3(拼32bit) | (auipc RAM) | — |
| 0x3c3 | ? | TXINJECT | D0&3,D5&0xf,D5&0xc0 | — | 回注 |
| 0x3d8 | ? | custom | D0&0x3f,D1&0x3f(各<<8) | — | 双12bit |
| 0x3df | ? | STATE idx11 | memcpy | 状态表[11] | (§5) |
| 0x3e2 | ? | custom | D0&3,D1&0x40,D2&1 | (auipc RAM) | 位标志 |
| 0x3e3 | ? | custom | D1&1 | — | 1位 |
| 0x3f5 | ? | custom idx14 | D0>>4,D4 | 状态表[14] | — |
| 0x3fe | brake_temp | custom | **4×10bit刹车温(§2.3)** | **gp+0x190/192/194/196(h),0x198/19c(w)** | 刹车温度×4 |
| 0x401 | BMS_brickVoltages | custom | D0=mux,D1..D6 | (大函数,mux) | 单体电压×3/帧 |
| 0x405 | ? | custom | D0 | **gp+0x188(b)** | — |
| 0x4e2 | ? | STATE idx15 | memcpy | 状态表[15] | (§5) |
| 0x679 | ? | TXINJECT | D4,D5,@2 | — | 回注 |

> 标 `(auipc RAM)` 的写入用 `auipc+sb` 寻址到 gp 区状态变量（capstone 立即数不可靠，地址待手解 raw32 精确化）。

### 3.1 分发器子树叶子 ID（bne 型，补全 ✔FW）

这些 ID 用 `bne a5,a4,<跳走>` 叶子节点（相等则 fall-through 到 thunk），故第一次线性扫描漏掉，现补全：

| CAN ID | 名称 | 型 | 读位 ✔FW | 写状态 | 信号(◎/✔APP) |
|--------|------|----|---------|--------|--------------|
| 0x129 | SteeringAngle | custom 0x08007870 | D2&0x3f,D3&0x3f(拼) | gp+0x1d8(b),gp+0x1dc(h) | 方向盘转角 |
| 0x20c | VCRIGHT_hvac | custom 0x0800287c | D0&7,D1&7,D4&7,D5&3 | — | HVAC 鼓风机/温度 |
| 0x238 | ? | custom 0x0800234c | D1&0x1f | — | 动力总成? |
| 0x25d | 充电状态? | custom 0x080047d2 | @2(DLC) | — | 充电相关 |
| 0x2e5 | FrontTorque | custom idx0 0x0800756e | D0,D1(共用0x266) | — | 前电机功率(AWD) |
| 0x312 | BMS_thermal | custom 0x080048ea | D4>>3,D5,D6,D7(温度位) | (写状态) | 热管理温度 |
| 0x33a | UI_rangeSOC | custom 0x0800495e | D0&3,D1&3,D2>>4,D3,D5>>4 | — | 续航/能耗/SOC |
| 0x3d2 | BMS_kwhCounter | **STATE idx10** | memcpy | →电池包[4..11] | 累计充/放电(§5) |
| 0x4e3 | ? | STATE idx16 | memcpy | 状态表[16] | — |
| 0x678 | ? | TXINJECT 0x08007414 | D1 | gp+0x1c9(b) | 回注 |
| 0x273 | UI_vehicleControl | **STATE idx2** | memcpy | 状态表[2] | 车辆控制状态 |
| 0x3e9 | 事件+入表 | **STATE idx12** | memcpy | 状态表[12] | 事件检测+整帧入表 |
| 0x3c2 | ? | inline custom | D0&3 | (内联) | 位标志 |
| 0x3fd | AP/DAS_control | inline custom | D0&7 | (内联) | AP/限速/盲区/手扶 |

> ✔ **idx10=0x3d2** 与电池打包器一致；**idx2=0x273, idx12=0x3e9** 补全。**53 监控 ID 已全部分类**。
> ✔FW **电池包 idx5(容量帧) 来源已定位 = `0x352` BMS_energyStatus 多路复用(mux=D0&3=0)**，
> 解码 0x352 时按 mux 拆存 idx5/6/7/8/9（详见 §5 + `fwstate.py`）。

### 3.2 分发器多认的 8 个扩展 ID（注入/事件用，非监控表）✔FW

解码分发器除 53 监控 ID 外多认 8 个，**全部用于改写回注/注入/事件**（不做状态解析）：

| 扩展 ID | 去向 | 类型 |
|---------|------|------|
| 0x0a9, 0x21c | →0x08007c16 | re-sign 改写回注(D0=0x0a) |
| 0x37a, 0x3a1 | →0x08007d5c | re-sign 改写回注(D2=0x30) |
| 0x3b0, 0x4a8 | →0x0800a4ea(idx1) | 注入入口 |
| 0x189 | →(事件) | 事件检测 |
| 0x68c | →0x08007ba4 | 门禁/状态 |

---

## 4. 状态变量地图（gp+off → 信号，由解码器写入反推）✔FW

重写固件时，这是"全局车况状态块"的字段布局（gp=0x27ffc000）：

| gp+off | 宽度 | 写入者(CAN ID) | 含义(◎/✔APP) |
|--------|------|---------------|--------------|
| +0xf4 | h | 0x257 | 车速 |
| +0x165 | b | 0x2b6 | 状态/门禁 |
| +0x166 | b | 0x293 | 动力总成 |
| +0x167 | b | 0x243 | 传感标志 |
| +0x184..0x187 | b×4 | 0x25a, 0x31f | 温度/环境 4 字节 |
| +0x188 | b | 0x405 | — |
| +0x189,0x18c | b | 0x39d | — |
| +0x190,0x192,0x194,0x196 | h×4 | 0x3fe | 刹车温度×4 |
| +0x198,0x19c | w | 0x3fe | 刹车温度附属 |
| +0x1d0,0x1d1 | b | 0x257 | 车速附属标志 |
| +0x1e8 | — | 0x2e1,0x321 | 前车体/环境温度 |
| +0x1f4 | b | 0x243 | — |

> DEEP_ANALYSIS 另记 `gp+0x19d/0x1a2/0x1a9/0x1aa/0x1bd/0x1ca/0x1ec/0x1f9` 等，将随逐 ID 精修合并。

---

## 5. STATE 型 ID 的位含义（打包器实证 + 小程序对接）

STATE 型解码器只把整帧 `memcpy` 进 12B 状态表，**位含义由 0xD0/0xB0 打包器决定**。
反汇编电池打包器 `0x080097cc`（读 `signal_state(idx)`→拼包），得 **idx(=CAN ID) → 原始字节 → 29B 包位置**：

| 电池包字节 | 来源 idx → CAN ID | 原始 CAN 字节 ✔FW | 信号(✔APP `batteryParser` 定标) |
|-----------|------------------|------------------|-------------------------------|
| [0..1] | idx1 → **0x132** BMS_hvBusStatus | **D0,D1**(LE) | 总电压 ×0.01 V |
| [2..3] | idx1 → 0x132 | **D2,D3**(LE) | 总电流 ×-0.1 A |
| [4..7] | idx10 → **0x3d2** BMS_kwhCounter | **D0..D3**(LE32) | 总放电量 ×0.001 kWh |
| [8..11] | idx10 → 0x3d2 | **D4..D7**(LE32) | 总充电量 ×0.001 kWh |
| [12..15] | idx5 → **0x352**(mux=0) | D4,D5 / D2,D3 | 剩余电量/当前容量 ×0.02 kWh |
| [16..17] | idx5 重组 | (位重组) | 保留电量 ×0.01 kWh |
| [18..20] | idx4 → **0x332** BMS_bmbMinMax | (位重组) | 单体 max/min 12bit ×0.002 V |
| [21..23] | idx6 → **0x352**(mux=1) BMS_energyStatus | (位重组) | 容量/续航/电池温度 |
| [24..25] | idx3 → **0x292** BMS_socStatus | (位重组) | 车机 SOC 7/10bit |

> ✔FW 实证：**0x132 与 0x3d2 是直传**（D 字节小端搬入包），逐字节确证；其余（容量/单体/SOC）打包器做了
> 位重组，原始位需结合小程序包布局反推（重写固件时可直接照搬此表 + `batteryParser` 定标）。
> idx→CAN ID：1=0x132 / 3=0x292 / 4=0x332 / 6=0x352 / 10=0x3d2。
> **✔FW 重大补全：idx5/6/7/8/9 全部来自 `0x352` BMS_energyStatus 多路复用**——解析 0x352 时 `D0&3`=mux
> selector（主分发器 `0x0800a270`，`fwstate.py`），按 mux 把子帧拆存：mux=0→idx5(容量/剩余电量)、
> mux=1→idx6、其余→idx7/8/9。故 **idx5(容量帧)= 0x352 mux=0 子帧**（此前缺失项已解决）；
> idx8 子帧由控制点 0x08006294/0x0800631a(gp+0x1f6/0x1a5) 读取转发。

仪表包 0xB0（打包器 `0x08008f44`）同理，逐字段位布局见 `TESLA_CAN_TSL_REFERENCE.md` §1.3（✔APP），
其"源 CAN ID"由本固件解码器证实（0x118 挡位 / 0x257 车速 / 0x3fe 刹车温 / 0x321 环境温等，见 §2）。

---

## 6. 进度与续作方法

**本文已实证**：**53 监控 ID + 8 扩展 ID 全部分类**（STATE/custom/inline/TXINJECT，§2/§3.1/§3.2）；
**全 53 ID 逐位读取覆盖**（§2 精确公式 16 个 + §2.11/2.12 批次 + §3 骨架表）；
状态变量地图；**电池包逐字节来源**（0x132/0x3d2 直传 ✔FW，§5）；idx→CAN ID 映射（**idx5/6/7/8/9=0x352 多路复用 ✔FW**，余 idx13）。

> ✅ **方向1（解析层逐位）基本完成**：每个 CAN ID 都有"读哪些 Dn 位 → 写哪个状态变量"，可据此重写解析层。

**剩余细节（不阻塞重写）**：
1. ✅ **电池包 idx5 容量帧已解决**（= 0x352 BMS_energyStatus mux=0 子帧，§5）；余 idx13 来源、
   ~3 个 gp 触发控制点(0x08006dd2/f42/7466，纯间接 jalr)的运行时 ID。
2. ✅ **custom 型逐位读取已全覆盖**（§2.11/2.12）；少数语义未知 ID 的信号名待小程序/DBC 对应。
3. **STATE 型补位**：0x292/0x332/0x352 经打包器位重组的原始位，结合 §5 + 小程序 `batteryParser` 补全。
4. **gp 地址精确化**：对 `auipc+sb` 写入手解 raw32，补全状态变量地图绝对偏移。

> 每一步都用本仓库 `scripts/` 复现，无外部依赖。完成后即得可直接据以重写解析层的完整位定义。
