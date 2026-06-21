# 批量提取每个解码器：读的Dn(带位运算链) + 写的gp状态变量偏移 + helper/idx
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a): return a-BASE
def walk(a,n=60): return list(md.disasm(DATA[O(a):O(a)+n*2],a,count=n))
HELP={0x08000272:'STATE',0x080001a6:'SCALE',0x080001d4:'GATE',0x08008062:'TXINJECT'}
# 复用分发器线性扫描
disp={};cur=None;o=O(0x08009e2e);a=0x08009e2e
while a<0x0800a146:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g:a+=2;o+=2;continue
    i=g[0];s=i.op_str.replace(' ','')
    if i.mnemonic in('addi','c.li') and s.split(',')[0]=='a4':
        try:cur=int(s.split(',')[-1],0)
        except:cur=None
    if i.mnemonic=='beq' and 'a5'in s and 'a4'in s and cur is not None:
        try:disp.setdefault(cur,i.address+int(s.split(',')[-1],0))
        except:pass
    a+=i.size;o+=i.size
def thunk_dec(t):
    a1=None
    for i in walk(t,12):
        s=i.op_str.replace(' ','')
        if i.mnemonic=='c.li' and s.split(',')[0]=='a1':
            try:a1=int(s.split(',')[1],0)
            except:pass
        if i.mnemonic in('j','c.j'):
            try:return a1,i.address+int(s.split(',')[-1],0)
            except:return a1,None
        if i.mnemonic in('c.jr','ret'):return a1,None
    return a1,None
def analyze(dec):
    fp={'s0','a0'};reads=[];gpw=[];tail=None;helpers=[];ins=walk(dec,180)
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
                    elif mj=='c.or':b.append('|')
                tag=f"D{ov-3}" if ov>=3 else f"@{ov}"
                reads.append(tag+''.join(b[:3]))
        if m in('sb','sh','sw') and '(gp)' in s:
            off=s[s.index(',')+1:s.index('(')]
            w={'sb':'b','sh':'h','sw':'w'}[m]
            gpw.append(f"gp{off}.{w}")
        if m in('jal','c.jalr','jalr'):
            try:
                t=i.address+int(s.split(',')[-1],0)
                if t in HELP:helpers.append(HELP[t])
            except:pass
        if m in('j','c.j'):
            try:tail=i.address+int(s.split(',')[-1],0)
            except:pass
            break
        if m in('c.jr','ret') and 'ra'in s:break
    return reads,gpw,helpers,tail
NAME={0x082:'TRIP_PLANNING',0x102:'VCLEFT_door',0x103:'VCRIGHT_door',0x118:'DriveSystemStatus',0x129:'SteeringAngle',0x132:'BMS_hvBusStatus',0x1f9:'?',0x20c:'VCRIGHT_hvac',0x229:'SCCM_steerLever',0x257:'DI_speed',0x266:'RearTorque',0x292:'BMS_socStatus',0x293:'UI_powertrain',0x2b6:'?',0x2e1:'VCFRONT_status',0x2e5:'FrontTorque',0x2f3:'UI_status',0x312:'BMS_thermal',0x321:'VCFRONT_temps',0x332:'BMS_bmbMinMax',0x333:'UI_chargeReq',0x339:'?',0x33a:'UI_rangeSOC',0x352:'BMS_energy',0x39d:'?',0x3b3:'?',0x3b6:'?',0x3c3:'?',0x3d2:'BMS_kwhCounter',0x3d8:'?',0x3df:'?',0x3e2:'?',0x3e3:'?',0x3f5:'?',0x3fd:'AP/DAS',0x3fe:'brake_temp',0x401:'BMS_brickV',0x405:'?',0x4e2:'?',0x4f3:'?',0x679:'?'}
print(f"{'ID':5}{'idx':>3} {'type':8} {'读取数据位(Dn+位运算)':38} 写状态变量gp+off")
for cid in sorted(disp):
    a1,dec=thunk_dec(disp[cid])
    if dec is None:continue
    reads,gpw,helpers,tail=analyze(dec)
    typ=HELP.get(dec) or (HELP.get(tail) if tail else None) or ('SCALE' if 'SCALE' in helpers else 'custom')
    r=' '.join(reads[:6]) or '·'
    w=' '.join(sorted(set(gpw))[:6]) or ('memcpy' if typ=='STATE' else '·')
    print(f"0x{cid:03x}{(a1 if a1 is not None else '·'):>3} {typ:8} {r:38} {w}   {NAME.get(cid,'')}")
