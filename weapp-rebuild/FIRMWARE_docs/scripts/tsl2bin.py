#!/usr/bin/env python3
"""把 feifan OTA JSON 升级包转成固件 bin。

格式：JSON `{success, PageCount, PackSize:1026, BytesCount, CheckCode[], hex[]}`，
每个 hex[i] = 页号(2字节大端) + 1024字节数据（共 1026 B）。
转换 = 去页号、按页号排序拼接 → 固件镜像（PageCount × 1024 B）。
与小程序升级逻辑一致：`pageData[0]<<8|pageData[1] == pageNumber`，`txSend(0x57, pageData)`。

用法: python3 tsl2bin.py <input.json> <output.bin>
"""
import json, sys


def convert(infn, outfn):
    d = json.load(open(infn))
    pages = {}
    for h in d['hex']:
        raw = bytes.fromhex(h)
        pno = (raw[0] << 8) | raw[1]
        pages[pno] = raw[2:]
    pc = d.get('PageCount', len(pages))
    assert len(pages) == pc, f"页数不符: {len(pages)} != {pc}"
    assert sorted(pages) == list(range(pc)), "页号不连续"
    fw = b''.join(pages[i] for i in range(pc))
    with open(outfn, 'wb') as f:
        f.write(fw)
    print(f"{infn} -> {outfn}: {len(fw)} 字节 ({len(fw):#x}), {pc} 页 × 1024 B")
    return fw


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("用法: python3 tsl2bin.py <input.json> <output.bin>")
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
