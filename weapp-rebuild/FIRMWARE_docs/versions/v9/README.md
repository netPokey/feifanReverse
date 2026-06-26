> ⚠ **结论修正（见 [`../COMPARE_8_vs_9.md`](../COMPARE_8_vs_9.md) v3）**：8/9 **CAN 解析层 + 免打扰注入框架均相同**（含 `0x370` 无感注入器，仅 gp 偏移平移）。
> **唯一真实差异 = ModeMDR getter `0x080001de`**：9 读 `config[29]&3 +1`（支持 val=0 滚轮/1 无感/2 两者），8 桩为常量 1（无感为死代码、忽略 config[29]）。
> v2 “gp+0x54 层 / getter 9 独有” 为 gp 偏移错位伪差（8 同一指针在 `gp+0x74`）。本文下方“CAN 功能完全相同”为初版表述，**以 v3 为准**。

---

# 固件 9（TSL9）— 综合分析

> `9.bin`（77824 B / 0x13000，CH32V208 RISC-V，由 `tsl9.txt` 经 `../../scripts/tsl2bin.py` 转换）。

## ⚠ 关键：9 与 8 的 CAN 功能完全相同

`COMPARE_8_vs_9.md` v3 证实：**9 是与 8 同源码的两次构建**——72 个 CAN ID、逐位解析、免打扰注入框架（`0x370`/CAN1）均相同。
**唯一功能差异 = ModeMDR getter `0x080001de`**：9 读 `config[29]&3 +1` 启用无感免打扰；8 桩为常量 1（无感分支为死代码）。

**因此 8 的解析层/注入器逆向整体适用于 9，仅 ModeMDR 免打扰方式选择为 9 独有。** 本目录另记录 9 的锚点差异。

## 锚点（`../../scripts/fwlocate.py`，对比 8）

| 锚点 | 9 | 8 | 9−8 |
|------|---|---|-----|
| reset_target | `0x08010772` | 0x106d4 | +0x9e |
| can_dispatch | `0x0800cdfe` | 0xcd62 | +0x9c |
| state_helper | `0x080002a8` | 0x029c | +0x0c |
| packer_b0 | `0x0800bbc4` | 0xbb28 | +0x9c |

偏移不一致（state +0x0c vs dispatch/packer +0x9c）→ 9 在多处有极微小代码增量（累积），但不改变任何 CAN 语义。

## 文档
- `TESLA_CAN_DECODE_PERID.md` — 72 ID 逐位解析（与 v8 逐行相同，已生成）。
- 综合分析、控制注入、通用语义：见 **`../v8/README.md`** 与 **`../v_base/`**（对 9 完全适用）。
- 与 8 的对比：`../COMPARE_8_vs_9.md`；版本演进（base→8/9）：`../COMPARE_8_vs_base.md`。
