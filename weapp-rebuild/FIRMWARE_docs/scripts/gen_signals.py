#!/usr/bin/env python3
# 生成 TESLA_CAN_SIGNALS.md：从 tesla-can-explorer 的固件 2026.2 数据提取监控 ID 的逐信号清单
# 数据源(19.8MB,不入库,需自行下载)：
#   curl -L -o /tmp/mcu3.json \
#     https://raw.githubusercontent.com/adamtash/tesla-can-explorer/main/data/can_frames_decoded_all_values_mcu3.json
# 用法：python3 gen_signals.py > ../TESLA_CAN_SIGNALS.md
import json, sys, os

SRC = os.environ.get("MCU3", "/tmp/mcu3.json")
d = json.load(open(SRC))
frames = {f['address_dec']: f for f in d['frames']}

# 本仓库监控+扩展 ID（与 PERID/PROTOCOL 一致）
ids_hex = ("082 102 103 118 129 132 1f9 20c 229 238 243 249 257 25a 25d 266 273 292 293 2b6 "
           "2e1 2e5 2f3 312 31f 321 332 333 334 339 33a 352 39d 3b3 3b6 3c2 3c3 3d2 3d8 3df "
           "3e2 3e3 3e9 3f5 3fd 3fe 401 405 4e2 4e3 678 679").split()
ids = [int(h, 16) for h in ids_hex]

# 命名置信度注记（详见 TESLA_CAN_OFFICIAL_NAMES.md §0）
WARN = {0x293: "⚠⚠ 三源三名,命名存疑", 0x266: "⚠ 分歧(josh=DI_vehicleEstimates)",
        0x2e5: "◎ 单源", 0x31f: "◎ 单源", 0x118: "✔✔ 双源", 0x249: "✔✔ 双源",
        0x2f3: "✔✔ 双源", 0x3fd: "✔✔ 双源", 0x339: "◎+✔FW功能(改写吻合)"}
SKIP_ENUM = ("Counter", "Crc", "Checksum", "Index", "Multiplexer", "Reserved")

def enum_line(s):
    if any(k in s['signal_name'] for k in SKIP_ENUM): return None
    labels = [p['label'] for p in s.get('possible_values', []) if p.get('label')]
    if not (2 <= len(labels) <= 10): return None
    txt = "/".join(labels)
    return None if len(txt) > 90 else txt

print("# 特斯拉 CAN 监控 ID 逐信号清单（固件 2026.2 数据）\n")
print("> 数据源：[adamtash/tesla-can-explorer](https://github.com/adamtash/tesla-can-explorer) "
      "`can_frames_decoded_all_values_mcu3.json`（Model 3 固件 2026.2 MCU3）。")
print("> 生成：`scripts/gen_signals.py`。**本文仅补信号语义/枚举值**；"
      "**位布局以固件逆向（`TESLA_CAN_DECODE_PERID.md`）为准**，命名置信度见 `TESLA_CAN_OFFICIAL_NAMES.md §0`。")
print(">")
print("> ⚠ 局限：该数据集不含位起止（`limitations`：bitfield 未完全解码），且为 2026.2 版——"
      "与 feifan 固件存在版本漂移，**信号名/枚举作语义参考，不作位级依据**。\n")

hit = [i for i in ids if i in frames]
miss = [i for i in ids if i not in frames]
print(f"覆盖：{len(hit)}/{len(ids)} ID 命中，共 {sum(len(frames[i]['signals']) for i in hit)} 信号。"
      f"未命中（feifan 特有/异版本，见固件逆向）：{' '.join('0x%03x'%m for m in miss)}。\n")

for i in sorted(hit):
    f = frames[i]
    note = f"  〔{WARN[i]}〕" if i in WARN else ""
    print(f"## 0x{i:03x} {f['frame_name']} ({len(f['signals'])} 信号){note}\n")
    names = ", ".join(s['signal_name'] for s in f['signals'])
    print(f"**信号**：{names}\n")
    enums = []
    for s in f['signals']:
        el = enum_line(s)
        if el: enums.append(f"- `{s['signal_name']}`: {el}")
    if enums:
        print("**关键枚举**：")
        print("\n".join(enums[:18]))
        if len(enums) > 18: print(f"- …(另 {len(enums)-18} 个枚举信号，见数据源)")
        print()
