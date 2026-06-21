# 对每个0x08006xxx发送点函数, 找 signal_state(cmd,idx) 调用 (jal STATE@0x08000272)
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
STATE=0x08000272
def walk(a,n):return list(md.disasm(DATA[O(a):O(a)+n*2],a,count=n))
funcs={0x08006202:'0x08006294(gp1f6)',0x080062e6:'0x0800631a(gp1a5)',
0x08006cee:'0x08006dd2(gp1b4)',0x08006e2c:'0x08006f42(gp1ba)',
0x08007020:'0x0800718e(gp1bc)',0x08007424:'0x08007466(gp1c8)',0x080032b8:'0x080032fe'}
for entry,sp in funcs.items():
    ins=walk(entry,110);imm={};hits=[]
    for i in ins:
        m=i.mnemonic;s=i.op_str.replace(' ','')
        if m in('c.li','li','addi') and ',' in s:
            r=s.split(',')[0]
            try:imm[r]=int(s.split(',')[-1],0)
            except:imm.pop(r,None)
        if m in('jal','c.jal'):
            try:t=i.address+int(s.split(',')[-1],0)
            except:t=0
            if t==STATE:
                hits.append((imm.get('a0'),imm.get('a1'),i.address))
    hs=' '.join(f"state(cmd={c},idx={x})@0x{ad:x}" for c,x,ad in hits) if hits else '(无STATE调用)'
    print(f"{sp:22} 入口0x{entry:08x}: {hs}")
