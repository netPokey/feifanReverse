# 对每个发送点: 找函数入口→扫函数体, 报 frame[0] ID来源(常量构造/动态/原ID回注)
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
def entry_of(pt,maxback=300):
    # 从pt往上找最近prologue (addi sp,-X / c.addi sp,-X)
    start=pt-maxback*2
    ins=list(md.disasm(DATA[O(start):O(pt)+2],start,count=maxback+4))
    e=start
    for i in ins:
        if i.address>pt:break
        s=i.op_str.replace(' ','')
        if i.mnemonic in('addi','c.addi') and s.startswith('sp,-'):e=i.address
    return e
def scan(pt):
    e=entry_of(pt)
    ins=list(md.disasm(DATA[O(e):O(pt)+2],e,count=400))
    imm={};f0=None;f0reg=None;gp=[];fw=[]
    for i in ins:
        if i.address>pt:break
        m=i.mnemonic;s=i.op_str.replace(' ','')
        if m in('c.li','li','addi','lui') and ',' in s:
            r=s.split(',')[0]
            try:imm[r]=int(s.split(',')[-1],0)
            except:imm.pop(r,None)
        if m=='lbu' and '(gp)' in s:gp.append('gp'+s[s.index(',')+1:s.index('(')])
        if m in('sb','sh') and ('(s0)' in s or '(a0)' in s):
            off=s[s.index(',')+1:s.index('(')]
            try:ov=int(off,0)
            except:ov=-1
            r=s.split(',')[0]
            if ov==0:f0reg=r;f0=imm.get(r,'动态')
            elif 3<=ov<=10:fw.append(f"D{ov-3}")
    return e,f0,gp[-2:],fw[:5]
points=[0x080032fe,0x08006294,0x0800631a,0x08006dd2,0x08006f42,0x0800718e,0x08007466,
0x08007c72,0x08007cfa,0x08007d3e,0x08007d58,0x08007dc0,0x08007ef4,0x08008372,0x08009a80,0x0800c68c]
print(f"{'发送点':>12} {'函数入口':>12} {'frame[0]来源':14} {'触发gp':14} 改写位")
for pt in points:
    e,f0,gp,fw=scan(pt)
    f0s=('0x%03x'%f0 if isinstance(f0,int) and f0<0x800 else (str(f0) if f0 is not None else '原ID回注'))
    print(f"0x{pt:08x} 0x{e:08x} {f0s:14} {' '.join(gp) or '-':14} {' '.join(fw) or '-'}")
