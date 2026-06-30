# FIRMWARE9 文档索引

本目录保存 `tsl9.txt` 对应固件的还原与差异分析产物。

## 文件

- `tsl9.txt` — 小程序升级包原始 JSON 文本，分页固件数据位于 `hex` 数组。
- `fw9.bin` — 从 `tsl9.txt` 剥离每页前 2 字节页号后合并得到的裸固件。
- [`FW8_FW9_CAN_DIFF_RISK.md`](./FW8_FW9_CAN_DIFF_RISK.md) — FW9 相比 FW8 的 CAN/队列分发差异与风险落点，重点记录 `0xADB8-0xADDE` 新增第 3 路分支。

## 还原方式

每页 `1026` 字节：

```text
[2 字节页号][1024 字节固件数据]
```

还原 `fw9.bin` 时去掉页号，仅合并后 1024 字节固件数据。