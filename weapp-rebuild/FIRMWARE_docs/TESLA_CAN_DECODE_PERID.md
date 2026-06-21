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
| [12..15] | idx5 → (容量帧) | D4,D5 / D2,D3 | 剩余电量/当前容量 ×0.02 kWh |
| [16..17] | idx5 重组 | (位重组) | 保留电量 ×0.01 kWh |
| [18..20] | idx4 → **0x332** BMS_bmbMinMax | (位重组) | 单体 max/min 12bit ×0.002 V |
| [21..23] | idx6 → **0x352** BMS_energyStatus | (位重组) | 容量/续航/电池温度 |
| [24..25] | idx3 → **0x292** BMS_socStatus | (位重组) | 车机 SOC 7/10bit |

> ✔FW 实证：**0x132 与 0x3d2 是直传**（D 字节小端搬入包），逐字节确证；其余（容量/单体/SOC）打包器做了
> 位重组，原始位需结合小程序包布局反推（重写固件时可直接照搬此表 + `batteryParser` 定标）。
> idx→CAN ID：1=0x132 / 3=0x292 / 4=0x332 / 6=0x352 / 10=0x3d2；idx5(容量帧)的 CAN ID 待子树补全。

仪表包 0xB0（打包器 `0x08008f44`）同理，逐字段位布局见 `TESLA_CAN_TSL_REFERENCE.md` §1.3（✔APP），
其"源 CAN ID"由本固件解码器证实（0x118 挡位 / 0x257 车速 / 0x3fe 刹车温 / 0x321 环境温等，见 §2）。

---

## 6. 进度与续作方法

**本文已实证**：40 个 dispatched ID 的"读位+写状态变量"骨架；6 个核心 ID 逐位精确公式
（0x118/0x257/0x3fe/0x321/0x102/0x103）；状态变量地图首批；电池包 4 段来源。

**待续（逐 ID 齐全）**：
1. **custom 型逐位精修**：`python3 scripts/fwdecode.py <decoder>` 读出 `lbu/sh off(gp)`+位运算，
   写成 `Dn[a:b]=信号`。剩余约 20 个 custom ID。
2. **STATE 型补位**：反汇编两个打包器（§5），把 0x132/0x292/0x332/0x352/0x3d2/0x312 等的原始位补全。
3. **子树未达的 13 个 ID**：0x129/0x20c/0x238/0x25d/0x273/0x2e5/0x312/0x33a/0x3c2/0x3d2/0x3fd/0x4e3/0x678
   —— 分发器 BST 深层，递归补全 thunk→decoder 后同样处理。
4. **gp 地址精确化**：对 `auipc+sb` 写入手解 raw32，补全状态变量地图绝对偏移。

> 每一步都用本仓库 `scripts/` 复现，无外部依赖。完成后即得可直接据以重写解析层的完整位定义。
