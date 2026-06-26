# firmware — 整机固件重写 (CH32V208 特斯拉蓝牙↔CAN 控制器)

据逆向蓝图把**整个固件**重写为模块化、可编译、可测试的 C 工程。
蓝图: [`../weapp-rebuild/FIRMWARE_docs/versions/v_base/FIRMWARE_REWRITE_SPEC.md`](../weapp-rebuild/FIRMWARE_docs/versions/v_base/FIRMWARE_REWRITE_SPEC.md)（6 大模块）
+ PERID（72 ID 逐位）+ BLE 协议 + 控制注入 + 免打扰规格（`versions/v9/FIRMWARE_REWRITE_ModeMDR.md`）。

> 硬件无关核心可 `make test` 本机验证; 真机编译/烧录用你本地的 **WCH CH32V20x SDK + CH32V20x_BLE_LIB**。

## 结构
```
include/  tesla_frame ble_proto signal_state can_dispatch ble_router can_tx
          modemdr mdr_hal                     # + 后续 packer/control/config 头
src/      tesla_frame.c   # 12B 帧 + 加法校验 + 通用 re-sign(D6计数器+D7校验)
          ble_proto.c     # 0x55 0x7F 帧封/拆 + checksum=(Σtype..payload)&0xFF
          ble_router.c    # 命令字 160–240 路由(可插拔注册表)
          can_dispatch.c  # 收帧按 ID 路由到解码/注入处理器
          signal_state.c  # 信号状态表(gp 变量区 + STATE 整帧条目)
          can_tx.c        # 发送门禁(默认 LISTEN_ONLY, 单一出口)
          modemdr.c       # 免打扰(getter/分发/0x370 无感/0x229 滚轮)
decode/   (Phase B) 72 ID 逐位解码器
port/     mdr_port_ch32v208.c  # WCH SDK: bxCAN1 收发 + TMOS + BLE 0xA3 + RX 分发
          example_integration.c
test/     test_framework.c(17) + test_modemdr.c(36) + wch_syntax_stubs/
Makefile  make test / make syntax-check-port
```

## 分阶段进度
| 阶段 | 内容 | 状态 |
|------|------|------|
| **A 骨架** | 帧/re-sign · BLE 编解码 · 状态表 · 分发/router · CAN_TX 门禁 · 免打扰 | ✅ 编译+测试(53) |
| B 读链路 | 72 ID 解码器 + 0xB0/0xD0 打包器 | ⬜ |
| C BLE 协议 | 命令字 160–240 全 handler + 鉴权 | ⬜ |
| D 控制注入 | 167 跳转表 / 187 执行器 / re-sign / BLE→CAN 透传 | ⬜ |
| E 配置/OTA/桥接 | 163 位图 / 171·185·186 块 / OTA / 240 主机 | ⬜ |
| F 整合 | port 中断接 router/dispatch + main 跑通 | ⬜ |

## 设计要点
- **可插拔注册表**: `can_dispatch_register(id,fn)` / `ble_router_register(type,fn)` —— 各模块自注册, 便于分阶段填充与单测。
- **单一发送出口** `can_tx_send()` 过门禁(LISTEN_ONLY 默认拦截), 对应固件 0x080001d4。
- **re-sign 两族**: 通用 SCCM 等 = D6 高 nibble 计数器 + CRC8(Phase D 导出表); EPAS 0x370 = 低 nibble + 加法校验(modemdr)。

## 验证
- `make test` → 当前 **53/53**(modemdr 36 + framework 17)。
- `make syntax-check-port` → 端口对 WCH API 桩语法自检。
- 真机: 用本地 SDK 接 `port/` 的 `MDR_Init`/BLE 回调/CAN 中断, `[BOARD]` 改引脚/波特率/时钟。
