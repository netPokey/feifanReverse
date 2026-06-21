# 0xB0仪表打包器位布局: 每个包字节 ← getter()位运算
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
def walk(a,n):return list(md.disasm(DATA[O(a):O(a)+n*2],a,count=n))
ins=walk(0x08008df0,160)
last_getter=None;ops=[];rows=[];base_off=None
for i in ins:
    if i.address>=0x08008f44:break
    m=i.mnemonic;s=i.op_str.replace(' ','')
    if m in('jal','c.jal'):
        try:last_getter=i.address+int(s.split(',')[-1],0)
        except:last_getter=None
        ops=[]
    elif m in('srli','c.srli'):ops.append('>>'+s.split(',')[-1])
    elif m in('slli','c.slli'):ops.append('<<'+s.split(',')[-1])
    elif m in('andi','c.andi'):
        v=s.split(',')[-1]
        if not v.startswith('-'):ops.append('&'+v)
    elif m=='sb' and '(sp)' in s:
        off=s[s.index(',')+1:s.index('(')]
        try:ov=int(off,0)
        except:ov=-1
        # 只记从getter来的字段(有位运算或紧跟getter)
        if last_getter and ops:
            rows.append((ov,last_getter,''.join(ops[:3])))
            ops=[]
# 推断包基址(最小off)
offs=[r[0] for r in rows if r[0]>=0]
b0=min(offs) if offs else 0x27
print(f"0xB0 打包器 0x08008f64(数据构造) → 包字节(基址 sp+0x{b0:x} = D0):")
print(f"{'包字节':>7} {'getter(状态源)':>18}  位提取")
seen=set()
for ov,g,op in rows:
    if ov<0:continue
    d=ov-b0
    print(f"   D{d:<4} 0x{g:08x}  {op}")
gs=sorted(set(g for _,g,_ in rows))
print(f"\n不同 getter(状态变量源) {len(gs)} 个: "+' '.join('0x%08x'%g for g in gs))
