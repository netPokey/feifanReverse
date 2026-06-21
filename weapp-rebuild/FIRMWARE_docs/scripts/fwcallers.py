# 反向调用图: 扫全固件 jal/c.jal 直接调用, 找指定入口的调用者
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000; N=len(DATA)
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
entries={0x080062e6:'0x0800631a',0x08006cee:'0x08006dd2',0x08006e2c:'0x08006f42',
0x08007020:'0x0800718e',0x08007424:'0x08007466',0x08007c16:'0x08007c72(re-sign)',
0x08007c7c:'0x08007cfa',0x08007d04:'0x08007d3e/d58',0x08007e40:'0x08007ef4',
0x08006202:'0x08006294',0x080032b8:'0x080032fe',0x08007b68:'0x08007dc0',
0x0800826c:'0x08008372',0x08009828:'0x08009a80',0x0800c434:'0x0800c68c'}
callers={e:[] for e in entries}
# 线性扫描(对齐2字节), 收集jal/c.jal目标
a=BASE;o=0
while o<N-1:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g:a+=2;o+=2;continue
    i=g[0];m=i.mnemonic;s=i.op_str.replace(' ','')
    if m in('jal','c.jal'):
        try:
            t=i.address+int(s.split(',')[-1],0)
            if t in callers:callers[t].append(i.address)
        except:pass
    a+=i.size;o+=i.size
for e in entries:
    cs=callers[e]
    cstr=' '.join('0x%08x'%c for c in cs[:6]) if cs else '(无直接jal→间接调用/跳转表)'
    print(f"入口0x{e:08x} ({entries[e]}):\n   调用者: {cstr}")
