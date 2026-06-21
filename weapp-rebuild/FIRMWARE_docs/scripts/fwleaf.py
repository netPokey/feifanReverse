# 提取分发器叶子节点(bne型)的 idx+decoder, 并分析读位/写状态
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a): return a-BASE
def walk(a,n=80): return list(md.disasm(DATA[O(a):O(a)+n*2],a,count=n))
HELP={0x08000272:'STATE',0x080001a6:'SCALE',0x080001d4:'GATE',0x08008062:'TXINJECT'}
nodes={0x129:0x08009e82,0x20c:0x08009eaa,0x238:0x08009ece,0x25d:0x08009f02,0x273:0x08009f26,
0x2e5:0x08009f60,0x312:0x08009f86,0x33a:0x0800a000,0x3c2:0x0800a028,0x3d2:0x0800a062,
0x3e9:0x0800a090,0x4e3:0x0800a102,0x678:0x0800a12c}
def leaf_dec(addr):
    idx=None;dec=None
    for i in walk(addr,14):
        s=i.op_str.replace(' ','')
        if i.mnemonic=='c.li' and s.split(',')[0]=='a1':
            try:idx=int(s.split(',')[1],0)
            except:pass
        if i.mnemonic in('j','c.j'):
            try:dec=i.address+int(s.split(',')[-1],0)
            except:pass
            break
    return idx,dec
def analyze(dec,depth=0):
    fp={'s0','a0'};reads=[];gpw=[];tail=None;helpers=[];ins=walk(dec,160)
    for k,i in enumerate(ins):
        m=i.mnemonic;s=i.op_str.replace(' ','')
        if m in('c.mv','mv'):
            p=s.split(',')
            if len(p)==2 and p[1]in fp:fp.add(p[0])
        if m in('lbu','lhu','lw','lb','lh'):
            try:
                mem=s.split(',',1)[1];off=mem[:mem.index('(')];base=mem[mem.index('(')+1:-1]
                ov=int(off,0) if off else 0
            except:continue
            if base in fp and 0<=ov<=11:
                b=[]
                for j in range(k+1,min(k+6,len(ins))):
                    mj=ins[j].mnemonic;sj=ins[j].op_str.replace(' ','')
                    if mj in('c.srli','srli'):b.append('>>'+sj.split(',')[-1])
                    elif mj in('c.slli','slli'):b.append('<<'+sj.split(',')[-1])
                    elif mj in('andi','c.andi'):b.append('&'+sj.split(',')[-1])
                reads.append(f"D{ov-3}"+''.join(b[:2]) if ov>=3 else f"@{ov}")
        if m in('sb','sh','sw') and '(gp)' in s:
            gpw.append('gp'+s[s.index(',')+1:s.index('(')]+'.'+{'sb':'b','sh':'h','sw':'w'}[m])
        if m in('jal','c.jalr','jalr'):
            try:
                t=i.address+int(s.split(',')[-1],0)
                if t in HELP:helpers.append(HELP[t])
            except:pass
        if m in('j','c.j'):
            try:tail=i.address+int(s.split(',')[-1],0)
            except:pass
            break
        if m in('c.jr','ret')and'ra'in s:break
    # 跟随共用thunk一层
    if not reads and not gpw and tail and depth<2 and tail not in HELP:
        return analyze(tail,depth+1)
    typ=HELP.get(dec) or (HELP.get(tail) if tail else None) or ('SCALE' if 'SCALE' in helpers else 'custom')
    return reads,gpw,typ,tail
NAME={0x129:'SteeringAngle',0x20c:'VCRIGHT_hvac',0x238:'?',0x25d:'充电状态?',0x273:'UI_vehicleControl',0x2e5:'FrontTorque',0x312:'BMS_thermal',0x33a:'UI_rangeSOC',0x3c2:'?',0x3d2:'BMS_kwhCounter',0x3e9:'事件',0x4e3:'?',0x678:'?'}
print(f"{'ID':5}{'idx':>4} {'decoder':>10} {'type':8} 读位                          写状态/名称")
for cid in sorted(nodes):
    idx,dec=leaf_dec(nodes[cid])
    if dec is None:print(f"0x{cid:03x} 无");continue
    reads,gpw,typ,tail=analyze(dec)
    r=' '.join(reads[:5]) or ('memcpy' if typ=='STATE' else '·')
    w=' '.join(sorted(set(gpw))[:4]) or '·'
    print(f"0x{cid:03x}{(idx if idx is not None else '·'):>4} 0x{dec:08x} {typ:8} {r:28} {w}  {NAME.get(cid,'')}")
