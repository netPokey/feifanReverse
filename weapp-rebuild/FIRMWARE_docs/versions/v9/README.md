# 固件 9（TSL9）— 综合分析

> `9.bin`（77824 B / 0x13000，CH32V208 RISC-V，由 `tsl9.txt` 经 `../../scripts/tsl2bin.py` 转换）。

## ⚠ 关键：9 与 8 的 CAN 功能完全相同

`COMPARE_8_vs_9.md` 已证实：**9 是与 8 同源码的两次构建**——72 个 CAN ID 集合相同、逐位解析 `diff` 无差异、
解析函数逻辑一致。差异仅为版本标识 `TSL9`（8 为 `TSL8`）与地址布局微调（累积偏移）。

**因此 8 的全部逆向结论（`../v8/`）整体适用于 9。** 本目录仅记录 9 的锚点差异。

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
