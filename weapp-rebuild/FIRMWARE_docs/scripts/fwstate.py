# 全固件扫 signal_state(cmd,idx) 调用, 定位 idx=8/5/13 的读写点
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000; N=len(DATA)
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
STATE=0x08000272
a=BASE;o=0;win=[]
hits=[]
while o<N-1:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g:a+=2;o+=2;continue
    i=g[0];m=i.mnemonic;s=i.op_str.replace(' ','')
    win.append((m,s));win=win[-9:]
    if m in('jal','c.jal'):
        try:t=i.address+int(s.split(',')[-1],0)
        except:t=0
        if t==STATE:
            a0=a1=None
            for mm,ss in reversed(win[:-1]):
                if mm in('c.li','li','addi') and ',' in ss:
                    r=ss.split(',')[0]
                    if r=='a1' and a1 is None:
                        try:a1=int(ss.split(',')[-1],0)
                        except:pass
                    if r=='a0' and a0 is None:
                        try:a0=int(ss.split(',')[-1],0)
                        except:pass
            hits.append((a0,a1,i.address))
    a+=i.size;o+=i.size
print(f"全固件 signal_state 调用 {len(hits)} 处")
for idx in (5,8,13):
    sel=[(c,ad) for c,x,ad in hits if x==idx]
    print(f"\n--- idx={idx} ({len(sel)}处) ---")
    for c,ad in sel[:10]:
        print(f"  cmd={c} @0x{ad:08x}")
