# FW8 / FW9 差异完整分析

> 分析对象：
> - `weapp-rebuild/FIRMWARE8_docs/tsl8.txt` → `fw8.bin`
> - `weapp-rebuild/FIRMWARE9_docs/tsl9.txt` → `fw9.bin`
>
> 地址说明：裸 bin 偏移（Flash 运行地址 = offset + `0x08000000`）。

---

## 1. 差异核心：AP 免打扰"无感模式"

FW9 相比 FW8 新增了 `ModeMDR=1/2` 的"无感免打扰"能力。

### 1.1 JS 侧设置字段

```js
// services/settingsOptions.js
{
  id: "ModeMDR",
  group: "AP辅助参数设置",
  name: "AP免打扰方式",
  options: [
    { val: 0, name: "滚轮免打扰(默认)" },  // FW8 / FW9 均支持
    { val: 1, name: "无感免打扰" },          // FW9 新增
    { val: 2, name: "滚轮+无感" }            // FW9 新增
  ],
  hw_ver: [19],
  bit: { offset: 29, shift: 0, mask: 3 }
}
```

写入路径：`changeSetting → writeConfig → tx(163, payload)` → 固件 cmd=163 handler → 存入 `device_struct + 0x65`。

---

## 2. 触发 CAN 帧：`0x399`

固件在 `0x2E6E`（fw9）/ `0x2E7E`（fw8）处的 AP 抑制函数中，硬编码检查接收到的 CAN ID：

```asm
; fw9 @ 0x2EEC / fw8 @ 0x2EF6
addi a5, zero, 0x399
bne  a4, a5, (skip)   ; CAN ID 不是 0x399 则跳过
```

**触发条件**：从 CAN1 总线接收到 `StdId=0x399`（Tesla ISA 手扶提醒静音帧），且 `entry[11]` 满足匹配。

---

## 3. FW8 vs FW9 分叉点

分叉在 `0x2F0C`（fw9），FW8 对应位置没有这段代码：

```asm
; fw9 @ 0x2F0C — 读 ModeMDR
auipc  s2, 0x20001
lbu    s2, -0x2b(s2)    ; s2 = ModeMDR 值 (0 / 1 / 2)
beqz   s2, 0xc0          ; ModeMDR==0 → 跳过无感逻辑，走旧 pin4 路径
```

### FW8 路径（仅 pin4 = 滚轮）

| 位置 | 操作 |
|------|------|
| `0xEFCE` | 检查 mode=1，调用 `0x1AF6`（AP 注入） |
| GPIOA pin4 | 激活滚轮模拟信号 |

### FW9 路径（pin4 滚轮 + pin0 无感）

| 位置 | 操作 |
|------|------|
| `0xEFC8` | 检查 mode=1（与 FW8 相同）|
| `0xF054-0xF062` | **新增**：检查 mode=2，调用 `0x1AF0`（AP 注入 v2），再初始化 channel 2 |
| GPIOA pin4 | mode bit0 → 激活滚轮路径 |
| GPIOA **pin0** | mode bit1 → 激活无感路径 (**FW9 独有**) |

---

## 4. pin0 路径 USART1 帧序列

当 ModeMDR=1 或 2 且接收到 `0x399` 帧，FW9 通过 USART1 + GPIOA pin0（半双工方向控制）发送以下序列：

```
[GPIO pin0 LOW  → GPIOA_BCR = 0x01]

字节帧格式: [channel=2, cmd, value]

[0x02, 0x2A, 0x00]   -- 字段 0x2A = 0x00
[0x02, 0x29, 0x90]   -- 字段 0x29 = 0x90 (10010000b)
[0x02, 0x28, 0x82]   -- 字段 0x28 = 0x82 (10000010b)
[0x02, 0x2C, 0x00]   -- 字段 0x2C = 0x00
[0x02, 0x2B, 0x03]   -- 字段 0x2B = 0x03

[0x02, 0x20, 0xFF, 0xE0, 0x00, 0x00]   -- 帧头 / CAN ID 设置
[0x02, 0x24, 0xFF, 0xE0, 0x00, 0x00]   -- 触发发送

[GPIO pin0 HIGH → GPIOA_BSHR = 0x11]
```

USART1 外设寄存器基址：`0x40013000`（`USART1->DR = +0x0C`）。  
GPIO 操作：`lui a5, 0x40011` → `0x40010810/0x40010814`（GPIOA BSHR/BCR）。

---

## 5. 相关固件地址一览

| 地址 | 描述 |
|------|------|
| `0x2E6E` | AP 抑制主函数（fw9），检查 CAN ID 0x399 并读 ModeMDR |
| `0x2E7E` | AP 抑制主函数（fw8），仅有旧 pin4 路径 |
| `0x2F0C` | **fw9 新增**：读 ModeMDR、选择 pin0 路径的分支点 |
| `0xEF50` | AP 模式处理器（fw9），同时处理 mode=1/2 |
| `0xEECA` | AP 模式处理器（fw8），仅 mode=1 |
| `0xF054-0xF062` | **fw9 新增**：mode=2 检查 + `0x1AF0` 调用 |
| `0xEFC6-0xEFD4` | fw8：只有 mode=1，调用 `0x1AF6` |
| `0x1AF0` | AP 注入函数 fw9（gp flag 在 `gp+0xa8`） |
| `0x1AF6` | AP 注入函数 fw8（gp flag 在 `gp+0xcc`） |
| `0xEAF8` | USART1 发送 helper，含 GPIO pin0/pin4 方向控制 |
| `0xEC18` | 构造帧头 `[0xFF,0xE0,0x00,0x00]` 并调用块发送 |
| `0xE95E` | 单字节写 USART1->DR |
| `0xE9A6` | 块写 USART1（GPIO 方向控制 + 多字节发送） |

---

## 6. CAN ID 与信号索引

### 6.1 监控 ID 表（fw8 = fw9，无差异）

两版固件硬编码同一张 46 ID 监控表（位于 fw8: `0x11CD0`，fw9: `0x11D70`）：

```
0x082 0x102 0x103 0x118 0x129 0x132 0x1F9 0x20C 0x229 0x238
0x243 0x249 0x257 0x25A 0x25D 0x266 0x273 0x292 0x293 0x2B6
0x2E1 0x2E5 0x2F3 0x31F 0x321 0x332 0x333 0x334 0x339 0x33A
0x352 0x39D 0x3B3 0x3B6 0x3C2 0x3C3 0x3D8 0x3DF 0x3E2 0x3E3
0x3E9 0x3F5 0x3FD 0x3FE 0x401 0x405 0x4E2 0x4E3 0x4F3 0x678 0x679
```

### 6.2 AP 相关 CAN ID

| CAN ID | 含义 | fw9 用途 |
|--------|------|---------|
| `0x399` | ISA 手扶提醒静音帧 | **触发帧**：无感注入的输入源 |
| `0x3E9` | AP 手扶提醒状态 | 在分发表检测，触发抑制逻辑 |
| `0x3FD` | AP/DAS 控制（含手扶字段）| 在分发表检测 |

### 6.3 无感路径发送的帧字段

USART1 slave 接收这组命令后，在第二路 CAN 总线上构造并发送帧：

| cmd | value | 说明 |
|-----|-------|------|
| `0x28` | `0x82` (10000010b) | 信号字段 0 |
| `0x29` | `0x90` (10010000b) | 信号字段 1 |
| `0x2A` | `0x00` | 信号字段 2 |
| `0x2B` | `0x03` | 信号字段 3 |
| `0x2C` | `0x00` | 信号字段 4 |

帧头/发送：`[0xFF, 0xE0, 0x00, 0x00]`（具体 CAN ID 由 USART1 slave 解析，无法从本固件静态确定）。

---

## 7. 条件检查逻辑

AP 手扶提醒激活检测（`0xEED4`）：

```c
// 从 USART1 读取当前 AP 状态字节
uint8_t status = usart1_read_byte();   // via 0xE95E
if ((status & 0xE0) == 0x80) {
    // AP 手扶提醒激活 (bits[7:5] == 100)
    trigger_suppression();
}
```

---

## 8. 整体流程图

```
CAN1 收到 0x399 帧
        │
        ▼
固件 @ 0x2E6E 处理
    检查 ModeMDR (gp+0x65, 来自 cmd=163 byte[29])
        │
        ├── ModeMDR == 0 → pin4 路径（FW8 / FW9）
        │       GPIOA pin4 → 滚轮模拟信号 → 物理方向盘接口
        │
        └── ModeMDR == 1 or 2 → pin0 路径（FW9 独有）
                GPIOA pin0 LOW（RS485 发送使能）
                USART1 发送: [2,0x2A,0x00] [2,0x29,0x90] [2,0x28,0x82]
                             [2,0x2B,0x03] [2,0x2C,0x00]
                             [2,0x20,0xFF,0xE0,0x00,0x00] (frame)
                             [2,0x24,0xFF,0xE0,0x00,0x00] (tx trigger)
                GPIOA pin0 HIGH（RS485 接收模式）
                        │
                        ▼
                外部 CAN 接口（USART1 slave）
                在第二路 CAN 总线上输出抑制帧
```

---

## 9. 已确认 vs 未确认

### 已确认

- FW9 新增"无感免打扰"的触发 CAN ID 是 `0x399`
- 分叉点在固件 `0x2F0C`，读取 ModeMDR 值并决定路径
- pin0 路径使用 USART1 + GPIOA（RS485 半双工）发送给外部 CAN 接口
- GPIOA pin4 = 旧滚轮路径（FW8/FW9 共有），pin0 = 新无感路径（FW9 独有）
- USART1 帧序列已完整提取

### 未确认（需动态抓包或外设规格书）

- USART1 slave 设备将 `[0xFF, 0xE0, 0x00, 0x00]` 解析成的具体 CAN ID
- pin0 路径在第二路 CAN 总线上最终发出的 StdId

---

## 10. 附：前期错误分析说明

以下结论已纠正，请以本文为准：

1. **错误**：FW9 新增 CAN2/CAN3 硬件控制器  
   **正确**：固件只用 CAN1（`0x40006400`），"第3路"是 USART1 pin0 软件路径

2. **错误**：`entry[0..1]==1` 等同 CAN ID 0x001  
   **正确**：触发帧是 CAN ID `0x399`，`entry[0..1]` 是队列内部类型字段

3. **错误**：228 条 ID 表有 0x0E 系统性偏移  
   **正确**：那些是误判的二进制数据结构，两版固件监控 ID 表完全一致

4. **错误**：channel 2 处理 UBX/GPS 数据  
   **正确**：channel 2 是 AP 无感免打扰的第二路 CAN 总线输出
