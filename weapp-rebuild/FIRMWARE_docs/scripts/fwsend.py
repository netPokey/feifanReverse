# 批量分析32个发送点: 触发gp状态 / 改写的数据位 / ID来源(原ID回注 or 新ID)
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
points=[0x0800267c,0x08002712,0x08002a82,0x08002ba8,0x080032fe,0x08003b72,0x08003c50,0x08003cdc,
0x08003e6a,0x080043f6,0x08004778,0x08004852,0x0800485e,0x08004cc0,0x08004cc6,0x080050e4,
0x08006294,0x0800631a,0x0800686a,0x08006dd2,0x08006f42,0x0800718e,0x08007466,0x08007c72,
0x08007cfa,0x08007d3e,0x08007d58,0x08007dc0,0x08007ef4,0x08008372,0x08009a80,0x0800c68c]
def analyze(pt,back=44):
    start=pt-back*2
    ins=list(md.disasm(DATA[O(start):O(pt)+2],start,count=back+4))
    gpread=[];fw=[];newid=False;setid=None;imm={}
    for k,i in enumerate(ins):
        if i.address>pt:break
        s=i.op_str.replace(' ','');m=i.mnemonic
        if m in('c.li','li','addi') and len(s.split(','))>=2:
            r=s.split(',')[0]
            try:imm[r]=int(s.split(',')[-1],0)
            except:pass
        if m=='lbu' and '(gp)' in s:
            gpread.append('gp'+s[s.index(',')+1:s.index('(')])
        if m in('sb','sh') and ('(s0)' in s or '(a0)' in s):
            off=s[s.index(',')+1:s.index('(')]
            try:ov=int(off,0)
            except:ov=-1
            r=s.split(',')[0]
            if ov==0: newid=True; setid=imm.get(r)
            elif 3<=ov<=10:
                v=imm.get(r)
                fw.append(f"D{ov-3}{'=0x%x'%v if isinstance(v,int) else ''}")
    return gpread[-2:],fw[:4],newid,setid
print(f"{'发送点':>12} {'触发gp':16} {'改写数据位':22} ID来源")
for pt in points:
    gp,fw,newid,sid=analyze(pt)
    src=('新ID=0x%03x'%sid if isinstance(sid,int) and sid<0x800 else '新ID(动态)') if newid else '原ID回注'
    print(f"0x{pt:08x} {' '.join(gp) or '-':16} {' '.join(fw) or '-':22} {src}")
