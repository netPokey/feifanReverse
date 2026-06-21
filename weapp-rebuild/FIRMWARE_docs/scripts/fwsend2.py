# 把32发送点按地址归属到perid解析函数 → 确定改写的CAN ID
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a):return a-BASE
def walk(a,n=60):return list(md.disasm(DATA[O(a):O(a)+n*2],a,count=n))
# 1) 重建分发表 disp{cid:handler}
disp={};cur=None;a=0x08009e2e;o=O(a);END=0x0800a146
while a<END:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g:a+=2;o+=2;continue
    i=g[0];s=i.op_str.replace(' ','')
    if i.mnemonic in('addi','c.li') and s.split(',')[0]=='a4':
        try:cur=int(s.split(',')[-1],0)
        except:cur=None
    if i.mnemonic=='beq' and 'a5' in s and 'a4' in s and cur is not None:
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
            try:return i.address+int(s.split(',')[-1],0)
            except:return None
        if i.mnemonic in('c.jr','ret'):return None
    return None
NAMES={0x082:'TRIP_PLAN',0x102:'VCLEFT_door',0x103:'VCRIGHT_door',0x118:'DriveSys',0x129:'Steering',
0x132:'BMS_hv',0x20c:'VCRIGHT_hvac',0x229:'SCCM_lever',0x257:'DI_speed',0x266:'RearTorq',0x292:'BMS_soc',
0x293:'UI_pwrtrain',0x2e1:'VCFRONT_st',0x2e5:'FrontTorq',0x2f3:'UI_status',0x312:'BMS_thermal',0x321:'VCFRONT_t',
0x332:'BMS_minmax',0x333:'UI_chgReq',0x33a:'UI_range',0x352:'BMS_energy',0x3d2:'BMS_kwh',0x3fd:'AP/DAS',0x405:'?'}
# 2) cid->dec 入口, 排序
d2c={}
for cid,h in disp.items():
    dec=thunk_dec(h)
    if dec:d2c[dec]=cid
decs=sorted(d2c)
def owner(addr):
    best=None
    for d in decs:
        if d<=addr:best=d
        else:break
    if best is not None and addr-best<0x320:return d2c[best],best
    return None,None
points=[0x0800267c,0x08002712,0x08002a82,0x08002ba8,0x080032fe,0x08003b72,0x08003c50,0x08003cdc,
0x08003e6a,0x080043f6,0x08004778,0x08004852,0x0800485e,0x08004cc0,0x08004cc6,0x080050e4,
0x08006294,0x0800631a,0x0800686a,0x08006dd2,0x08006f42,0x0800718e,0x08007466,0x08007c72,
0x08007cfa,0x08007d3e,0x08007d58,0x08007dc0,0x08007ef4,0x08008372,0x08009a80,0x0800c68c]
print(f"perid解析函数(dec)区间: 0x{decs[0]:08x}..0x{decs[-1]:08x}  共{len(decs)}个\n")
print(f"{'发送点':>12}  归属ID(改写的CAN ID)")
for pt in points:
    cid,dec=owner(pt)
    if cid is not None:
        print(f"0x{pt:08x}  改写 0x{cid:03x} {NAMES.get(cid,''):12} (解析函数@0x{dec:08x}+0x{pt-dec:x})")
    else:
        print(f"0x{pt:08x}  [解析区外:控制子系统/独立函数]")
