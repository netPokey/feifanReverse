# 固件重写规格：AP 免打扰 ModeMDR（滚轮 / 无感 / 两者）

> 目标：在自研 CH32V208 固件上复刻 feifan 的 **AP 免打扰方式（ModeMDR）**，支持
> **val=0 滚轮 / val=1 无感 / val=2 滚轮+无感**（8 只支持 val=0，9 支持全部）。
> 本文 = 业务流程 + 固件实现链（逆向实证，9.bin 地址）+ 重写关键代码 + 常量表 + 验证。
> 证据等级：✔FW=固件反汇编实证 / ✔APP=小程序佐证 / ◎=推断。所有地址为 9.bin（`0x08000000` 基址）。

---

## 0. 一句话结论
免打扰 = **拦截特斯拉某些 CAN 帧 → re-sign 改写（改数据位 + 计数器++ + 校验重算）→ 原 ID 在 CAN1 回注**，
制造“驾驶员在操作方向盘”的假象消除 Autopilot 的 hands-on 唠叨。
- **滚轮 val=0**：改写 **SCCM 方向盘控制帧（主 `0x229`）** 注入滚轮/拨杆事件（有感，物理可察觉）。
- **无感 val=1**：改写 **EPAS 转向帧 `0x370`** 摆动扭矩信号（无感，无物理动作）。
- **两者 val=2**：两路同时。
- **8 vs 9 唯一差异**：ModeMDR getter — 8 桩为常量 1（无感不可达），9 读 `config[29]`。

---

## 1. 端到端业务流程（App → BLE → 固件）

```
[小程序 settings 页]
 changeSetting({id:"ModeMDR", value:0|1|2})            ✔APP
   └─ updateState(settingsState,"ModeMDR",val)          // 仅 UI
   └─ writeConfig(state):
        payload = writeBytes(rawConfig,{ModeMDR:val})    // §2：写 rawConfig[29] bit[1:0]
        setCheckData(163,payload)                        // 记待回读校验
        tx(163,payload):
           validate(163,{route,adminLevel,connected,…}) // 客户端安全门（固件不复刻）
           → BLE 写特征值：命令字 163(0xA3)=写配置
                          │  BLE GATT write
                          ▼
[固件 BLE 栈] on_cmd(0xA3, payload[76B])                 ✔FW @0x0800c330
   └─ 校验长度=0x4c、字段合法 → memcpy 设置区进配置缓冲（§3）
   └─ 配置缓冲 config_buf[5] = rawConfig[29] = ModeMDR

[固件 周期任务] mdr_dispatch()                            ✔FW @0x080022ee
   └─ m = (config_buf[5] & 3) + 1                         // §4 getter
   └─ m&1 → 滚轮路径（§6，改写 0x229…）
   └─ m&2 → 无感路径（§7，改写 0x370）
```

> `validate` 是**客户端**防误触/越权门（连接态/路由/管理员级别），**固件侧无需复刻**——固件只需正确处理收到的 0xA3 写配置，并按 `config[29]` 执行。

---

## 2. 配置编码：ModeMDR → rawConfig[29]      ✔APP
ModeMDR 位定义 `{offset:29, shift:0, mask:3, hw_ver:[19]}`，`writeBytes` 等价：
```js
rawConfig[29] = (rawConfig[29] & ~(0x3<<0)) | ((val & 0x3) << 0);  // 仅动 bit[1:0]，保留其它位
```
| App val | rawConfig[29]&3 | getter 返回 | bit1(无感) | bit0(滚轮) | 行为 |
|--------|------|------|------|------|------|
| 0 | 0b00 | 1 (0b01) | 0 | 1 | 仅滚轮 |
| 1 | 0b01 | 2 (0b10) | 1 | 0 | 仅无感 |
| 2 | 0b10 | 3 (0b11) | 1 | 1 | 滚轮+无感 |

> 注：`offset29` 字节按位复用：bit[1:0]=ModeMDR，其它位另作他用（如“长拉Ns”）。改 ModeMDR 必须按位写，勿整字节覆盖。

---

## 3. BLE 0xA3 写配置协议 + 配置缓冲布局      ✔FW @0x0800c330

```
命令字 163 (0xA3) = 写配置，payload 固定 76(0x4c) 字节        // 0x0800c330: bne s2,0x4c → 拒绝
 ├─ malloc(0x4c) + memcpy(tmp, payload, 0x4c)               // 0x0800c338..0x0800c356
 ├─ 字段合法性校验（tmp[0x24..0x28] 须可打印 ASCII 等）       // 0x0800c372 循环
 ├─ s1 = &config_ptr (gp+0x54)；cfg = *s1                    // 0x0800c394
 ├─ 变更钩子：若 payload[0x1b](=rawConfig[27]=config[3]) bit4 变化 → 0x08001b02
 │           若 payload[0x18](=rawConfig[24]=config[0]) low3 变化 → 0x08007ad4
 ├─ memcpy(cfg,       payload+0x18, 0x10)  // ★ 设置区：cfg[0..15] = rawConfig[24..39]
 └─ memcpy(cfg+0x60,  payload+0x3b, 0x10)  // 扩展区：cfg[0x60..] = rawConfig[59..74]
```

**关键映射（固件 config[N] ↔ App rawConfig）**：
```
cfg = *(uint8_t**)(gp+0x54)          // 设备配置缓冲指针
config[N]  ≡  cfg[N]  ≡  rawConfig[24 + N]
            └ 即固件 config[0] 对应 App rawConfig[24]
ModeMDR   =  config[5] = cfg[5] = rawConfig[29]      // ★ getter 读这里
```

| 固件 config[N] | =rawConfig[] | settingsOptions 含义 |
|----|----|----|
| config[0] | [24] | 能量回收制动 |
| config[1] | [25] | AP 关闭自动雨刮 |
| config[3] | [27] | LED/滚轮策略（含免打扰时间 `&0xf`） |
| config[4] | [28] | 模块总开关 / AP 恢复方式（bit3=`&8` 无感门） |
| **config[5]** | **[29]** | **ModeMDR 免打扰方式 bit[1:0]** ★ |

---

## 4. ModeMDR 取值（getter，8/9 唯一差异）      ✔FW @0x080001de

```
8.bin @0x080001de:          9.bin @0x080001de:
  li  a0, 1                   addi a5,gp,0x54     ; 配置指针
  ret                         lw   a5,0(a5)       ; cfg
  ; 恒 1 → 仅滚轮              lbu  a0,5(a5)       ; cfg[5]=rawConfig[29]=ModeMDR
                              andi a0,3
                              addi a0,1           ; (cfg[5]&3)+1 → 1/2/3
                              ret
```
→ 重写要支持 val=1/2，**必须实现 9 式 getter**（读 config[5]）。

---

## 5. 分发器 + 三个门      ✔FW @0x080022ee

```
mdr_dispatch(s):                      // s=免打扰时间参数(秒)，周期调用
  if entry_gate()!=1: return          // 门1 @0x0800029e：免打扰前置条件(总开关&AP在用)
  m = mdr_getter()                    // (config[5]&3)+1
  if m & 1: scroll_branch(s)          // 滚轮 @0x08002204
  if m & 2:                           // 无感 @0x0800231c
     if !notouch_enabled(): return    // 门2 @0x0800021e：config[4]&8(bit3) + 运行态
     if s==0 || (config[3]&0xf)==0xf: return   // 时间禁用
     notouch_counter = (notouch_counter+1)&3
     notouch_active  = 1                        // gp+0xaf（8:gp+0xd3）
     schedule(notouch_clear, s*1000)            // 定时器 @0x08001124，到期清零→激活时窗
```
- **门1 entry_gate**（`0x0800029e`，读 RAM 状态字节）：≈“免打扰总开关开 且 AP 在用”，返回 1 才继续。
- **门2 notouch_enabled**（`0x0800021e`）：`config[4] & 8`（AP 恢复方式 bit3）+ 运行态，决定是否放行无感。
- **submode**（`0x080001ee`，无感注入用，见 §7）：选扭矩注入风格（摆动/恒低/恒高）。

> 8 的分发器结构等价（getter 恒 1 → 永远只走滚轮；无感分支为死代码）。状态变量 gp 偏移：9 `gp+0xac/0xaf/0xb0/0xb3` = 8 `gp+0xd0/0xd3/0xd4/0xd7`（整体平移 +0x24）。

---

## 6. 滚轮路径 val=0（SCCM 帧 re-sign）      ✔FW

```
scroll_branch 0x08002204:
  读 gp+0xac(滚轮使能)、config[4]>>6(策略)；写 gp+0xb3(滚轮状态)
  → 0x080050f4 写 4 字节滚轮指令缓冲(RAM @≈0x28003f38)：{pending=1,type,amount,param}

每收到 SCCM 帧（分发表）→ 对应逐帧处理器读指令缓冲，把滚轮事件烘焙进帧并发送：
  受影响 CAN ID（最终处理器在滚轮引擎 0x08004740..0x08005600）：
    0x229 SCCM_rightStalk(主, @0x08004f58) / 0x249 SCCM_leftStalk / 0x082 / 0x25a / 0x333 / 0x33a
  以 0x229 为例(0x08004f74)：pending && buf[2]==5 →
    data[2]=(data[2]&0xfc)|1（滚轮字段置位）; data[1] 低半字节=计数器++;
    data[0]=滚轮量表 0x08012140[idx]；→ 发送 0x0800aaa0
```
- **口=CAN1**（经 0x0800aaa0 → CAN_Transmit(0x40006400)）。
- 语义：注入方向盘滚轮/拨杆事件 → AP 认为驾驶员在操作 → 消唠叨（有感，可能伴随音量等副作用）。
- 注：SCCM 帧 re-sign 引擎同时服务 feifan 的拨杆控制（换挡/灯光/雨刮）；滚轮免打扰只是其中由指令缓冲驱动的一路。

---

## 7. 无感路径 val=1（EPAS `0x370` re-sign）★      ✔FW

分发臂 `0x0800cfb0`（`li a4,0x370; beq → 0x0800d368`）→ 逐帧处理函数A `0x08002054`：

```
函数A(frame f):                                  // 收到每帧 0x370
  if !add_checksum_ok(f): return                 // 门 @0x08008736
  if !notouch_active:     return                 // gp+0xaf 激活窗 @0x080021e2
  t = *f                                          // 工作副本(12B 内部结构: id,dlc,data[8],flag)
  v = ((t.data[2]&0xf)<<8) | t.data[3]            // 当前 12 位转向信号
  if (uint16)(v-0x7a9) > 0xb2: return             // 仅近中位才伪造(没真打方向)
  switch submode():                               // @0x080001ee
     1: nv = 0x7a8           // 恒低
     2: nv = 0x85c           // 恒高
     default: nv = MDR_OSC[notouch_counter] + 2050  // 摆动 {2200,2230,1900,1870}
  t.data[3] = nv & 0xff
  t.data[2] = (t.data[2]&0xf0) | ((nv>>8)&0xf)
  t.data[4] = (t.data[4]&0x3f) | 0x40             // 有效位=01
  t.data[6] = (t.data[6]&0xf0) | ((t.data[6]+1)&0xf)  // 报文计数器++
  t.data[7] = add_checksum(&t)                    // 加法校验 @0x08006d98
  send(&t)                                        // 0x0800aaa0 → CAN_Transmit(CAN1)
```
- **CAN ID = `0x370`，口=CAN1（`0x40006400`），原 ID 回注。**
- 12 位转向信号位置：`data[2]`低半字节 : `data[3]`，中心 `0x802`(2050)。
- 振荡表 `MDR_OSC` @`0x08012c10` = `{+150,+180,-150,-180}`（字节 `96 00 b4 00 6a ff 4c ff`）。
- 语义：摆动 EPAS 扭矩 → AP 判定“手在方向盘主动施力” → 消唠叨（无物理动作）。
- ⚠ `0x370` 旧标 `SCS_alertMatrix2` 与此“转向/hands-on”行为不符，命名待按 DBC 复核。

---

## 8. 加法校验（re-sign 用）      ✔FW @0x08006d98
```c
/* sum = (ID_hi + ID_lo + Σ data[i], i∈[0,dlc) 且 i≠7) & 0xFF，写入 data[7] */
uint8_t add_checksum(const frame_t *f){
    uint8_t s = (uint8_t)((f->id>>8) + (f->id & 0xff));
    for (int i=0;i<f->dlc;i++) if (i!=7) s += f->data[i];
    return s;
}
```
两路 re-sign 都用它；接收侧用同式校验门过滤伪帧。

---

## 9. 重写关键代码（C 骨架）

```c
/* ===== 配置（BLE 0xA3 写入；config[N]=rawConfig[24+N]）===== */
static uint8_t  config[16];           /* config[5]=ModeMDR=rawConfig[29] */
static uint8_t  notouch_active, notouch_counter, scroll_enable, scroll_state;

void on_ble_cmd_A3(const uint8_t *payload, int len){   /* @0x0800c330 */
    if (len != 0x4c) return;
    /* …字段校验… */
    memcpy(config, payload + 0x18, 0x10);              /* 设置区 rawConfig[24..39] */
    /* 变更钩子按需触发 */
}

/* ===== ModeMDR getter（9 式）===== */
static inline uint8_t mdr_mode(void){ return (config[5] & 0x3) + 1; }

/* ===== 周期分发 ===== */
void mdr_dispatch(int s){                               /* @0x080022ee */
    if (entry_gate() != 1) return;
    uint8_t m = mdr_mode();
    if (m & 1) scroll_branch(s);                        /* 滚轮 */
    if (m & 2){                                         /* 无感 */
        if (!notouch_enabled() || s==0 || (config[3]&0xf)==0xf) return;
        notouch_counter = (notouch_counter+1) & 3;
        notouch_active  = 1;
        schedule_task(notouch_clear, s*1000);
    }
}
static void notouch_clear(void){ notouch_active = 0; }

/* ===== 无感注入：每帧 0x370 re-sign on CAN1 ===== */
static const int16_t MDR_OSC[4] = { +150,+180,-150,-180 };   /* @0x08012c10 */
void on_can_0x370(frame_t *f){                          /* 分发: id==0x370 */
    if (!add_checksum_ok(f) || !notouch_active) return;
    frame_t t = *f;
    uint16_t v = ((t.data[2]&0xf)<<8) | t.data[3];
    if ((uint16_t)(v-0x7a9) > 0xb2) return;
    uint16_t nv;
    switch (mdr_submode()){
      case 1:  nv = 0x7a8; break;
      case 2:  nv = 0x85c; break;
      default: nv = (uint16_t)(MDR_OSC[notouch_counter] + 2050);
    }
    t.data[3] =  nv & 0xff;
    t.data[2] = (t.data[2]&0xf0) | ((nv>>8)&0xf);
    t.data[4] = (t.data[4]&0x3f) | 0x40;
    t.data[6] = (t.data[6]&0xf0) | ((t.data[6]+1)&0xf);
    t.data[7] =  add_checksum(&t);
    can1_transmit(&t);                                  /* CAN_Transmit(0x40006400) */
}

/* ===== 滚轮注入：调度 + SCCM 0x229 re-sign（要点）===== */
struct { uint8_t pending,type,amount,param; } scroll_cmd;   /* RAM @≈0x28003f38 */
void scroll_branch(int s){                              /* @0x08002204 */
    if (!scroll_enable) return;
    scroll_cmd = (typeof(scroll_cmd)){ .pending=1, .type=3, .amount=0, .param=1 };
}
void on_can_0x229(frame_t *f){                          /* SCCM_rightStalk @0x08004f58 */
    if (!scroll_cmd.pending) return;
    /* 把滚轮事件烘焙进 data[0..2]+计数器，量取自表 0x08012140，再 add_checksum + send */
    can1_transmit(f);
}
```

---

## 10. 关键常量 / 数据表速查
| 项 | 值 / 地址 |
|----|----|
| BLE 写配置命令字 | **163 (0xA3)**，payload 76(0x4c)B |
| 配置映射 | `config[N]=rawConfig[24+N]`；ModeMDR=`config[5]`=`rawConfig[29]` bit[1:0] |
| 配置指针 | `gp+0x54`（8: `gp+0x74`） |
| ModeMDR getter | `0x080001de`：`(config[5]&3)+1` |
| 分发器 / 滚轮 / 无感分支 | `0x080022ee` / `0x08002204` / `0x0800231c` |
| 无感目标帧 / 口 | CAN ID **`0x370`** / **CAN1 `0x40006400`** |
| 12 位转向信号位置 | `data[2]`低半字节 : `data[3]`，中心 2050 |
| 无感振荡表 | `0x08012c10` = `{+150,+180,-150,-180}` |
| 滚轮目标帧 | `0x229`(主) + `0x249/0x082/0x25a/0x333/0x33a`，CAN1 |
| 滚轮量表 / 指令缓冲 | `0x08012140` / RAM `≈0x28003f38` |
| 加法校验 | `0x08006d98`：`(IDhi+IDlo+Σdata[0..6])&0xFF`→data[7] |
| CAN 发送封装 / 底层 | `0x0800aaa0` → `CAN_Transmit 0x08010d6c` |
| 无感激活标志/计数器 | `gp+0xaf` / `gp+0xb0`（8: `gp+0xd3` / `gp+0xd4`） |

---

## 11. 8→9 重写要点（核心一处）
整套框架两版同构（仅 gp 偏移平移）。**要从“只支持 val=0”升级到“支持 val=0/1/2”，唯一必改 = getter**：
```c
uint8_t mdr_mode(void){ return (config[5] & 3) + 1; }   /* 9 式；勿写死 return 1 */
```
配合分发器按 bit0(滚轮)/bit1(无感) 独立门控（§5），val=1/2 即生效。

## 12. 验证
- **配置闭环**：app 设 ModeMDR=1 → BLE 0xA3 payload[29] bit[1:0]=01 → config[5]&3=1 → getter=2 → 走无感。
- **无感注入**：CAN1 上出现 `0x370`，`data[2:3]` 12 位值在 {2200,2230,1900,1870} 循环、data[6] 计数器递增、data[7] 校验自洽。
- **滚轮注入**：CAN1 上 `0x229` data 字段随滚轮指令变化、计数器递增、校验自洽。
- **回归**：val=0 仅滚轮、val=2 两路并发；未连接/未满足门时不注入。
