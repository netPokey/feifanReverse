# 扫描所有 tx_wrapper(0x08008062) 与注入入口的调用点，并反推 CAN ID
import struct
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC); md.detail=True
def O(a): return a-BASE
TXW=0x08008062
def jtarget(i):
    s=i.op_str.replace(' ','')
    try: return i.address+int(s.split(',')[-1],0)
    except: return None
# 全镜像线性扫描，找所有 jal/c.j/j 目标==TXW
calls=[]
o=0;a=BASE
while o<len(DATA)-1:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g: o+=2;a+=2;continue
    i=g[0]
    if i.mnemonic in('jal','c.j','j','c.jal'):
        t=jtarget(i)
        if t==TXW: calls.append(i.address)
    o+=i.size;a+=i.size
print(f"tx_wrapper(0x08008062) 调用点：{len(calls)} 处")
for c in calls: print(f"  0x{c:08x}")
# 反推每个调用点的 frame[0](=CAN ID)：回溯找 'sb val,0(framereg)' 或 li 到 frame[0]
def back_id(call,win=60):
    start=call-win*2
    ins=list(md.disasm(DATA[O(start):O(call)+2], start, count=win+4))
    # 找最近的把立即数写到帧偏移0的：lui/li 常量；或 sh/sb 到 (reg) 偏移0
    regs={}
    cand=None
    for i in ins:
        s=i.op_str.replace(' ','')
        if i.mnemonic in('c.li','li','addi') and ','in s:
            p=s.split(',')
            if len(p)>=2 and p[0] in ('a0','a1','a2','a3','a4','a5'):
                try: regs[p[0]]=int(p[-1],0)
                except: pass
        if i.mnemonic in('sh','sb') :
            # store to offset 0 → 可能是 CAN ID
            if '0(' in s or ',0(' in s:
                r=s.split(',')[0]
                if r in regs: cand=regs[r]
    return cand
print("\n反推 frame[0]=CAN ID（立即数可见者）：")
for c in calls:
    cid=back_id(c)
    print(f"  0x{c:08x} → ID={'0x%03x'%cid if cid and cid<0x800 else cid}")
