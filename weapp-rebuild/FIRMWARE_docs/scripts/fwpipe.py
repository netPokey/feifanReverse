# re-sign分发器: addi a4,zero,ID; beq/bne a5,a4; j→改写函数. 提取 ID→改写函数
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
START=0x0800a146; END=0x0800a720
ins=list(md.disasm(DATA[O(START):O(END)],START))
a4=None; lastbne=None; routes=[]; falls=[]
for i in ins:
    m=i.mnemonic;s=i.op_str.replace(' ','')
    if m in('addi','c.li') and s.split(',')[0]=='a4':
        try:a4=int(s.split(',')[-1],0)
        except:a4=None
    elif m=='beq' and 'a5,a4' in s:
        try:routes.append((a4,i.address+int(s.split(',')[-1],0)))
        except:pass
    elif m=='bne' and 'a5,a4' in s:
        lastbne=a4
    elif m in('j','c.j'):
        try:
            t=i.address+int(s.split(',')[-1],0)
            if 0x08006000<=t<0x08008800 and lastbne is not None:
                falls.append((lastbne,t)); lastbne=None
        except:pass
print("=== re-sign分发: ID → 改写函数 (fall-through bne模式) ===")
seen=set()
for cid,t in falls:
    if cid is None or (cid,t) in seen:continue
    seen.add((cid,t))
    print(f"  ID 0x{cid:03x} ({cid:>4}) → 改写函数 0x{t:08x}")
print(f"\n=== beq路由(ID→另一epilogue块) ===")
for cid,t in routes[:12]:
    if cid:print(f"  ID 0x{cid:03x} → 0x{t:08x}")
ids=sorted(set(c for c,_ in falls if c))
print(f"\n被re-sign改写的控制ID集合: {' '.join('0x%03x'%c for c in ids)}")
