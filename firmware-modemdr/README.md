# firmware-modemdr — AP 免打扰 ModeMDR 可移植实现 (CH32V208)

复刻 feifan 固件的 **AP 免打扰方式 (ModeMDR)**：`val=0 滚轮 / val=1 无感 / val=2 滚轮+无感`。
逆向规格见 [`../weapp-rebuild/FIRMWARE_docs/versions/v9/FIRMWARE_REWRITE_ModeMDR.md`](../weapp-rebuild/FIRMWARE_docs/versions/v9/FIRMWARE_REWRITE_ModeMDR.md)。

> 本目录是 **SDK 无关的业务核心 + host 测试**。硬件相关只通过 `mdr_hal.h` 两个 hook 接出，
> 任意 SDK (WCH CH32V20x / PlatformIO / 裸 GCC) 实现这两个 hook 即可上板。

## 结构
```
include/
  tesla_frame.h   内部 12B 帧 {id,dlc,data[8],flag} + 加法校验
  mdr_hal.h       平台抽象: can1_send / schedule (★ 上板需实现)
  modemdr.h       公共 API + 门/态弱符号
src/
  tesla_frame.c   加法校验 (固件 @0x08006d98)
  modemdr.c       getter + 分发器 + 无感(0x370) + 滚轮(0x229) + 0xA3 配置
test/
  test_modemdr.c  host 单元测试 (36 用例, 含 fake HAL)
Makefile          `make test` 本机编译+跑测
```

## 已验证 (make test, 36/36 通过)
- getter: `config[5]&3+1` → val 0/1/2 = 模式 1/2/3 (9 式; 8 恒 1)
- BLE 0xA3: `payload[29]=rawConfig[29]` → `config[5]` (映射 `config[N]=rawConfig[24+N]`)
- 无感 0x370 注入序列 `{2200,2230,1900,1870}` + 计数器 + 加法校验 + 有效位
- 门控: 未激活/远离中位/校验错/entry_gate/时间哨兵/s=0 → 不注入
- 子模式恒低 0x7a8 / 恒高 0x85c; 分发 val=0/1/2; 时窗回调清零

## CH32V208 端口层 (WCH CH32V20x SDK + CH32V20x_BLE_LIB)
`port/mdr_port_ch32v208.c` 已实现 (拓扑实证: 收/发同在 **CAN1 0x40006400**):
- `mdr_hal_can1_send()` → `CAN_Transmit(CAN1,…)`
- `mdr_hal_schedule()`  → TMOS `tmos_start_task` 一次性事件 (无感时窗清零)
- `MDR_CAN1_Init()`     → CAN1 GPIO/时钟/滤波(收全部)/RX0 中断
- `USB_LP_CAN1_RX0_IRQHandler` → `CAN_Receive` → 按 ID 分发 (0x370/0x229)
- `MDR_OnBleWrite(cmd,payload,len)` → cmd==0xA3 存配置
- 门/态强符号 `mdr_entry_gate/notouch_enabled/submode/scroll_enabled` (按真实条件细化)

**集成三步** (见 `port/example_integration.c`):
1. 初始化里 `MDR_Init();`(+`MDR_SetTimeParam`)。
2. BLE 写回调里 `MDR_OnBleWrite(cmd,payload,len);`。
3. CAN1 RX 已自动喂核心; 自有 RX 分发则改用 `MDR_FeedRxFrame()`。

> `[BOARD]` 标记处按你的板子改: CAN 引脚(示例 PB8/PB9 重映射)、波特率(示例 500kbps@APB1=36MHz)、时钟。
> 语法自检: `make syntax-check-port` (用 `test/wch_syntax_stubs` 假头; 真实编译用你的 SDK)。
> ISR 用 `__attribute__((interrupt("WCH-Interrupt-fast")))` (WCH riscv 工具链)。

## 已知 TODO (不影响无感主路径)
- 滚轮 `0x229` re-sign 的 `data[0]` 量值表 (`0x08012140`) 需从固件导出。
- SCCM 帧校验形式待确认 (可能 Tesla CRC8 而非加法校验)；无感 `0x370` 用加法校验已实证。
- 三个“门”的精确 RAM 来源 (entry_gate/submode) 在固件深处, 现以弱符号默认 + 平台覆盖。
