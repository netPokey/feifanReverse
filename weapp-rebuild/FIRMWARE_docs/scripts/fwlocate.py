#!/usr/bin/env python3
"""自动定位任意 CH32V208 feifan 固件的关键锚点（不依赖硬编码地址）。

支持三版本（base/8/9）分析复用。定位：复位向量目标、CAN 分发表区、
signal_state helper、0xB0 打包器、BLE 命令分发提示。

用法: python3 fwlocate.py <fw.bin> [--json]
"""
import sys, json
from collections import Counter
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC

BASE = 0x08000000
md = Cs(CS_ARCH_RISCV, CS_MODE_RISCV32 | CS_MODE_RISCVC)


def disasm(fw):
    """线性反汇编 → [(addr, mnemonic, op_str_nospace)]"""
    out = []; a = 0; o = 0; n = len(fw)
    while o < n - 1:
        g = list(md.disasm(fw[o:o + 4], BASE + a, count=1))
        if not g:
            a += 2; o += 2; continue
        i = g[0]
        out.append((i.address, i.mnemonic, i.op_str.replace(' ', '')))
        a += i.size; o += i.size
    return out


def densest(addrs, gap=40):
    """找地址列表中最密集的连续区 → (start, end, count)"""
    if not addrs:
        return None
    s = e = cs = addrs[0]; c = bc = 1
    for k in range(1, len(addrs)):
        if addrs[k] - addrs[k - 1] < gap:
            c += 1
        else:
            if c > bc:
                bc, s, e = c, cs, addrs[k - 1]
            cs = addrs[k]; c = 1
    if c > bc:
        bc, s, e = c, cs, addrs[-1]
    return s, e, bc


def locate(fw):
    ins = disasm(fw)
    A = {}
    # 1. 复位向量目标
    g = list(md.disasm(fw[0:4], BASE, count=1))[0]
    A['reset_target'] = (g.address + int(g.op_str.split(',')[-1], 0)
                         if g.mnemonic in ('j', 'c.j', 'jal') else None)
    # 2. CAN 分发表：beq/bne a5,a4 密集区
    A['can_dispatch'] = densest([a for a, m, s in ins if m in ('beq', 'bne') and 'a5,a4' in s])
    # 3. signal_state helper：'c.li a1,idx; c.li a0,cmd; jal TARGET' 中最高频 TARGET
    st = Counter()
    for k in range(2, len(ins)):
        a, m, s = ins[k]
        if m in ('jal', 'c.jal'):
            p1, p2 = ins[k - 1], ins[k - 2]
            if (p1[1] in ('c.li', 'li', 'addi') and p1[2].split(',')[0] == 'a0'
                    and p2[1] in ('c.li', 'li', 'addi') and p2[2].split(',')[0] == 'a1'):
                try:
                    st[a + int(s.split(',')[-1], 0)] += 1
                except Exception:
                    pass
    A['state_helper'] = list(st.most_common(1)[0]) if st else None
    # 4. 0xB0 打包器：addi/c.li a1,0xb0
    A['packer_b0'] = None
    for a, m, s in ins:
        if m in ('addi', 'c.li') and s.split(',')[0] == 'a1' and s.split(',')[-1] in ('0xb0', '176'):
            A['packer_b0'] = a; break
    # 5. BLE 命令分发提示：命令常量 160/167/187/192/240 比较的密集区
    cmds = [a for a, m, s in ins if m in ('addi', 'c.li')
            and s.split(',')[0] in ('a4', 'a5')
            and s.split(',')[-1] in ('160', '167', '187', '192', '240', '0xa0', '0xa7', '0xbb', '0xc0', '0xf0')]
    A['ble_dispatch'] = densest(cmds, gap=200)
    return A


if __name__ == '__main__':
    fw = open(sys.argv[1], 'rb').read()
    A = locate(fw)
    if '--json' in sys.argv:
        print(json.dumps(A)); sys.exit(0)
    print(f"固件: {sys.argv[1]} ({len(fw)} B / {len(fw):#x})")
    print(f"  reset_target : " + (f"0x{A['reset_target']:08x}" if A['reset_target'] else "?"))
    d = A['can_dispatch']
    print(f"  can_dispatch : 0x{d[0]:08x}-0x{d[1]:08x} ({d[2]} ID 密集)" if d else "  can_dispatch : ?")
    sh = A['state_helper']
    print(f"  state_helper : 0x{sh[0]:08x} (被 {sh[1]} 处 signal_state 调用)" if sh else "  state_helper : ?")
    print(f"  packer_b0    : " + (f"0x{A['packer_b0']:08x}" if A['packer_b0'] else "?"))
    b = A['ble_dispatch']
    print(f"  ble_dispatch : 0x{b[0]:08x}-0x{b[1]:08x} ({b[2]} 命令常量)" if b else "  ble_dispatch : ?")
