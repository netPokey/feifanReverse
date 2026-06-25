#!/usr/bin/env python3
"""综合分析任意 feifan 固件（用 fwlocate 自动锚点），输出 CAN ID 表/类型/读位/字符串。

整合 fwall（分发表→ID→handler→type）+ fwbits（逐 ID 读位）逻辑，参数化支持三版本（base/8/9）。
用法: python3 fwanalyze.py <fw.bin> [--json]
"""
import sys, json, re
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
import fwlocate

BASE = 0x08000000
md = Cs(CS_ARCH_RISCV, CS_MODE_RISCV32 | CS_MODE_RISCVC)


def walk(fw, addr, n=80):
    o = addr - BASE
    return list(md.disasm(fw[o:o + n * 2], addr, count=n))


def analyze(fw):
    A = fwlocate.locate(fw)
    ds = A['can_dispatch'][0]
    state = A['state_helper'][0] if A['state_helper'] else None
    # 扫 ID->handler（逐字节自对齐）。环境变量 FULL=1 → 全固件扫(含子分发表/inline)，否则仅主分发表区
    import os
    disp = {}; cur = None
    if os.environ.get('FULL'):
        a = BASE; o = 0; end = BASE + len(fw)
    else:
        a = ds - 0x100; o = a - BASE; end = ds + 0x500
    while a < end:
        g = list(md.disasm(fw[o:o + 4], a, count=1))
        if not g:
            a += 2; o += 2; continue
        i = g[0]; s = i.op_str.replace(' ', '')
        if i.mnemonic in ('addi', 'c.li') and s.split(',')[0] == 'a4':
            try: cur = int(s.split(',')[-1], 0)
            except Exception: cur = None
        if i.mnemonic in ('beq', 'bne') and 'a5,a4' in s and cur is not None and 0x80 <= cur < 0x800:
            if i.mnemonic == 'beq':
                try: disp.setdefault(cur, i.address + int(s.split(',')[-1], 0))
                except Exception: pass
            else:
                disp.setdefault(cur, i.address + i.size)  # bne: handler 为 fall-through
        a += i.size; o += i.size

    def thunk_dec(t):
        for i in walk(fw, t, 12):
            s = i.op_str.replace(' ', '')
            if i.mnemonic in ('j', 'c.j'):
                try: return i.address + int(s.split(',')[-1], 0)
                except Exception: return t
            if i.mnemonic in ('c.jr', 'ret'):
                return t
        return t

    def handler_info(dec):
        typ = 'custom'; reads = []; fp = {'s0', 'a0'}
        ins = walk(fw, dec, 80)
        for k, i in enumerate(ins):
            m = i.mnemonic; s = i.op_str.replace(' ', '')
            if m in ('c.mv', 'mv'):
                p = s.split(',')
                if len(p) == 2 and p[1] in fp: fp.add(p[0])
            if m in ('jal', 'c.jal'):
                try:
                    if i.address + int(s.split(',')[-1], 0) == state: typ = 'STATE'
                except Exception: pass
            if m in ('lbu', 'lhu') and '(' in s:
                try:
                    mem = s.split(',', 1)[1]; off = mem[:mem.index('(')]; base = mem[mem.index('(') + 1:-1]
                    ov = int(off, 0) if off else 0
                    if base in fp and 0 <= ov <= 11:
                        b = []
                        for j in range(k + 1, min(k + 4, len(ins))):
                            mj = ins[j].mnemonic; sj = ins[j].op_str.replace(' ', '')
                            if mj in ('c.srli', 'srli'): b.append('>>' + sj.split(',')[-1])
                            elif mj in ('andi', 'c.andi'): b.append('&' + sj.split(',')[-1])
                        reads.append(f"D{ov-3}{''.join(b[:2])}" if ov >= 3 else f"@{ov}")
                except Exception: pass
            if m in ('j', 'c.j', 'c.jr', 'ret'):
                break
        return typ, reads[:6]

    rows = []
    for cid in sorted(disp):
        dec = thunk_dec(disp[cid])
        typ, reads = handler_info(dec)
        if state and dec == state:  # thunk 直接跳 signal_state = STATE 型整帧入表
            typ = 'STATE'
        rows.append({'id': cid, 'handler': disp[cid], 'dec': dec, 'type': typ, 'reads': reads})
    strs = [s.decode() for s in re.findall(rb'[\x20-\x7e]{5,}', fw)]
    keystrs = [s for s in strs if re.search(r'BLE|CAN|FF|M3|V\d|\d\.\d|20\d\d|feifan|FEIFAN|TSL|Tesla', s)][:12]
    return {'anchors': A, 'count': len(rows), 'can_ids': rows, 'strings': keystrs}


if __name__ == '__main__':
    R = analyze(open(sys.argv[1], 'rb').read())
    if '--json' in sys.argv:
        print(json.dumps(R)); sys.exit(0)
    tc = {}
    for r in R['can_ids']:
        tc[r['type']] = tc.get(r['type'], 0) + 1
    print(f"CAN ID: {R['count']} 个   类型分布: {tc}")
    for r in R['can_ids']:
        print(f"  0x{r['id']:03x} {r['type']:7} dec@0x{r['dec']:08x} reads={' '.join(r['reads']) or '·'}")
    print(f"\n关键字符串: {R['strings']}")
