from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC); md.detail=True
def O(a): return a-BASE
def walk(a,n=60):
    return list(md.disasm(DATA[O(a):O(a)+n*2], a, count=n))
HELP={0x08000272:'STATE',0x080001a6:'SCALE',0x080001d4:'GATE',0x08008062:'TXINJECT'}
# full linear scan of dispatcher range, collect (id->handler)
disp={}; cur=None
o=O(0x08009e2e); a=0x08009e2e; END=0x0800a146
while a<END:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g: a+=2;o+=2;continue
    i=g[0]; s=i.op_str.replace(' ','')
    if i.mnemonic in ('addi','c.li') and s.split(',')[0]=='a4':
        try:cur=int(s.split(',')[-1],0)
        except:cur=None
    if i.mnemonic in ('beq','bne') and 'a5' in s and 'a4' in s and cur is not None:
        try: disp.setdefault(cur, i.address+int(s.split(',')[-1],0)) if i.mnemonic=='beq' else None
        except:pass
    a+=i.size; o+=i.size
def thunk_dec(t):
    a1=None
    for i in walk(t,12):
        s=i.op_str.replace(' ','')
        if i.mnemonic=='c.li' and s.split(',')[0]=='a1':
            try:a1=int(s.split(',')[1],0)
            except:pass
        if i.mnemonic in ('j','c.j'):
            try:return a1,i.address+int(s.split(',')[-1],0)
            except:return a1,None
        if i.mnemonic in ('c.jr','ret'):return a1,None
    return a1,None
def analyze(dec):
    fp={'s0','a0'};loads=[];tail=None;calls=[];ins=walk(dec,160)
    for k,i in enumerate(ins):
        m=i.mnemonic;s=i.op_str.replace(' ','')
        if m in('c.mv','mv'):
            p=s.split(',')
            if len(p)==2 and p[1] in fp: fp.add(p[0])
        if m in('lbu','lhu','lw','lb','lh'):
            try:
                mem=s.split(',',1)[1];off=mem[:mem.index('(')];base=mem[mem.index('(')+1:-1]
                ov=int(off,0) if off else 0
            except:continue
            if base in fp and 0<=ov<=11:
                b=[]
                for j in range(k+1,min(k+5,len(ins))):
                    mj=ins[j].mnemonic;sj=ins[j].op_str.replace(' ','')
                    if mj in('c.srli','srli'):b.append('>>'+sj.split(',')[-1])
                    elif mj in('c.slli','slli'):b.append('<<'+sj.split(',')[-1])
                    elif mj in('andi','c.andi'):b.append('&'+sj.split(',')[-1])
                loads.append((ov,''.join(b[:2])))
        if m in('jal','c.jalr','jalr'):
            try:
                t=i.address+int(s.split(',')[-1],0)
                if t in HELP:calls.append(HELP[t])
            except:pass
        if m in('j','c.j'):
            try:tail=i.address+int(s.split(',')[-1],0)
            except:pass
            break
        if m in('c.jr','ret') and 'ra' in s:break
    return loads,tail,calls
NAMES={0x082:'TRIP_PLANNING',0x102:'VCLEFT_door',0x103:'VCRIGHT_door',0x118:'DriveSystemStatus',0x129:'SteeringAngle',
0x132:'BMS_hvBusStatus',0x20c:'VCRIGHT_hvac',0x229:'SCCM_steerLever',0x257:'DI_speed',0x266:'RearTorque',
0x292:'BMS_socStatus',0x293:'UI_powertrain',0x2e1:'VCFRONT_status',0x2e5:'FrontTorque',0x2f3:'UI_status',
0x312:'BMS_thermal',0x321:'VCFRONT_temps',0x332:'BMS_bmbMinMax',0x333:'UI_chargeRequest',0x33a:'UI_rangeSOC',
0x352:'BMS_energy',0x3d2:'BMS_kwhCounter',0x3fd:'AP/DAS_ctrl',0x3fe:'brake?',0x401:'BMS_brickV',0x405:'?'}
rows=[];tc={'STATE':0,'SCALE':0,'TXINJECT':0,'custom':0}
for cid in sorted(disp):
    a1,dec=thunk_dec(disp[cid])
    if dec is None:rows.append((cid,a1,None,'?','')) ;continue
    loads,tail,calls=analyze(dec)
    typ=HELP.get(dec) or (HELP.get(tail) if tail else None)
    if not typ: typ='SCALE' if 'SCALE' in calls else ('STATE' if 'STATE' in calls else('TXINJECT' if 'TXINJECT' in calls else 'custom'))
    tc[typ]=tc.get(typ,0)+1
    lr=' '.join(f"D{o-3}{b}" if o>=3 else f"@{o}{b}" for o,b in loads[:6]) or '·'
    rows.append((cid,a1,dec,typ,lr))
print(f"dispatched IDs: {len(rows)}   types: {tc}\n")
print(f"{'ID':5}{'i':>3} {'decoder':>10} {'type':8} reads(D=data byte)                      name")
for cid,a1,dec,typ,lr in rows:
    print(f"0x{cid:03x}{('·'if a1 is None else a1):>3} {('0x%08x'%dec) if dec else '-':>10} {typ:8} {lr:40} {NAMES.get(cid,'')}")
