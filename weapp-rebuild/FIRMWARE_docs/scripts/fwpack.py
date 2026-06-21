from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC)
def O(a): return a-BASE
def walk(a,n): return list(md.disasm(DATA[O(a):O(a)+n*2], a, count=n))
# find calls to state accessor 0x08000272 within a region, capture preceding a1(idx) and a0(dir)
def state_calls(start,end):
    res=[]; a1=None;a0=None
    for i in walk(start,(end-start)//2):
        if i.address>=end:break
        s=i.op_str.replace(' ','')
        if i.mnemonic=='c.li' and s.split(',')[0]=='a1':
            try:a1=int(s.split(',')[1],0)
            except:pass
        if i.mnemonic=='c.li' and s.split(',')[0]=='a0':
            try:a0=int(s.split(',')[1],0)
            except:pass
        if i.mnemonic in('jal','c.jalr','jalr'):
            try:
                t=i.address+int(s.split(',')[-1],0)
                if t==0x08000272: res.append((i.address,a0,a1))
            except:pass
    return res
print("=== 0xD0 battery packer state reads (idx → CAN ID) 0x080097cc..0x080099ba ===")
IDX2ID={0:0x102,1:0x132,3:0x292,4:0x332,6:0x352,7:0x3b3,9:0x001,11:0x3df,14:0x3f5,15:0x4e2,17:0x679}
for addr,a0,a1 in state_calls(0x080097cc,0x080099ba):
    print(f"  @0x{addr:08x} dir={a0} idx={a1}  -> CANID {('0x%03x'%IDX2ID[a1]) if a1 in IDX2ID else '?'}")
print()
# locate command dispatcher: scan whole image for 'addi/li aX,zero,0xa7' near 'beq'
print("=== command-code immediates (0xA7=167 ctrl, 0xBB=187 exec, 0xA2=162, 0xB0=176, 0xD0=208) ===")
targets={0xa7:'167ctrl',0xbb:'187exec',0xa2:'162wheel',0xb0:'176gauge',0xd0:'208batt',0xa8:'168auth',0xa3:'163set',0xf0:'240host'}
o=0;a=BASE
hits={}
while o<len(DATA)-2:
    g=list(md.disasm(DATA[o:o+4],a,count=1))
    if not g:o+=2;a+=2;continue
    i=g[0];s=i.op_str.replace(' ','')
    if i.mnemonic in('addi','c.li') and ',zero,' in (','+s) :
        for v,nm in targets.items():
            if s.endswith(',%d'%v) or s.endswith(hex(v)):
                hits.setdefault(v,[]).append(i.address)
    o+=i.size;a+=i.size
for v,nm in targets.items():
    hs=hits.get(v,[])
    print(f"  0x{v:02x} {nm:9}: {len(hs)} sites "+(' '.join('0x%08x'%x for x in hs[:6])))
