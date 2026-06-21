# 逐ID解码器精析：完整反汇编一个解码器，标注 读帧字节/位运算/写状态变量/定标
import sys
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC); md.detail=True
def O(a): return a-BASE
HELP={0x08000272:'STATE表',0x080001a6:'SCALE×10/16',0x080001d4:'门禁',0x08008062:'tx_wrapper'}
def ann(a,n=80):
    fp={'s0','a0'}   # 帧指针寄存器集合
    out=[];o=O(a);addr=a;cnt=0
    while cnt<n and o<len(DATA):
        g=list(md.disasm(DATA[o:o+4],addr,count=1))
        if not g: addr+=2;o+=2;cnt+=1;continue
        i=g[0]; s=i.op_str.replace(' ',''); tag=''
        if i.mnemonic in('c.mv','mv'):
            p=s.split(',')
            if len(p)==2 and p[1] in fp: fp.add(p[0])
        if i.mnemonic in('lbu','lhu','lw','lb','lh'):
            try:
                mem=s.split(',',1)[1];off=mem[:mem.index('(')];base=mem[mem.index('(')+1:-1]
                ov=int(off,0) if off else 0
                if base in fp and 0<=ov<=11: tag=f'  ◀读帧 D{ov-3}' if ov>=3 else f'  ◀读@{ov}'
            except:pass
        if i.mnemonic in('sb','sh','sw'):
            if '(gp)' in s:
                off=s[s.index(',')+1:s.index('(')]
                tag=f'  ▶写状态 gp{off}'
            elif any(f'({r})' in s for r in fp):
                tag='  ▶写帧'
            else: tag='  ▶写RAM'
        if i.mnemonic in('jal','c.jalr','jalr','j','c.j'):
            try:
                t=addr+int(s.split(',')[-1],0)
                if t in HELP: tag=f'  ⇒{HELP[t]}'
                elif i.mnemonic in('j','c.j'): tag=f'  ⇒尾跳 0x{t:08x}'
            except:pass
        out.append(f"0x{addr:08x}: {i.mnemonic:9}{i.op_str:22}{tag}")
        if i.mnemonic in('c.jr','ret') and 'ra' in s: out.append('   └ret');break
        if i.mnemonic in('j','c.j') and tag.startswith('  ⇒尾跳'): break
        addr+=i.size;o+=i.size;cnt+=1
    return out
for a in sys.argv[1:]:
    print(f"\n===== 解码器 {a} =====")
    for l in ann(int(a,16)): print(l)
