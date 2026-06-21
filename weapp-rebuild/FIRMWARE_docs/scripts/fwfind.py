# 全镜像定位指定CAN ID的分发比较节点 addi a4,zero,ID
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
miss=[0x129,0x20c,0x238,0x25d,0x273,0x2e5,0x312,0x33a,0x3c2,0x3d2,0x3e9,0x4e3,0x678]
hits={m:[] for m in miss}
o=0;a=BASE
while o<len(DATA)-1:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g:o+=2;a+=2;continue
    i=g[0];s=i.op_str.replace(' ','')
    if i.mnemonic in('addi','c.li','li') and s.split(',')[0]=='a4':
        try:
            v=int(s.split(',')[-1],0)
            if v in hits: hits[v].append(i.address)
        except:pass
    o+=i.size;a+=i.size
for m in miss:
    print(f"0x{m:03x}: "+(' '.join('0x%08x'%x for x in hits[m]) or '未找到(可能用lui/其它形式)'))
