# 提取 re-sign 改写回注系列：每个函数改写了哪些数据字节 + 计数器/CRC
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a): return a-BASE
# re-sign 尾跳 tx_wrapper 的点（c.j 0x08008062）
points=[0x08007c72,0x08007cfa,0x08007d3e,0x08007d58,0x08007dc0,0x08007ef4,0x08008372]
def scan_func(endpt, back=70):
    start=endpt-back*2
    ins=list(md.disasm(DATA[O(start):O(endpt)+2], start, count=back+4))
    # 找函数起点(最近的 c.addi sp,-X)，再收集 sb imm/reg, off(s0)
    fnstart=start
    for i in ins:
        if i.mnemonic in('c.addi','addi') and 'sp,' in i.op_str.replace(' ','') and '-' in i.op_str:
            fnstart=i.address
    writes=[]; regimm={}
    for i in ins:
        if i.address<fnstart: continue
        s=i.op_str.replace(' ','')
        if i.mnemonic in('c.li','li','addi') and s.split(',')[0] in('a3','a4','a5','a2'):
            try:regimm[s.split(',')[0]]=int(s.split(',')[-1],0)
            except:pass
        if i.mnemonic=='sb' and '(s0)' in s:
            r=s.split(',')[0]; off=s[s.index(',')+1:s.index('(')]
            try:offv=int(off,0)
            except:offv=None
            val=regimm.get(r,'reg') if r not in('s0',) else 'reg'
            writes.append((offv,val))
    return fnstart,writes
print("re-sign 改写回注系列（D=数据字节, off-3=Dn）：")
for p in points:
    fs,ws=scan_func(p)
    data_w=[(o-3,v) for o,v in ws if o is not None and 3<=o<=10]
    desc=', '.join(f"D{o}={'0x%x'%v if isinstance(v,int) else v}" for o,v in data_w)
    print(f"  fn~0x{fs:08x} → tx@0x{p:08x}: {desc}")
