# 轻量寄存器跟踪 + 跳转表/CAN帧构造提取（RISC-V RV32IMAC）
import struct
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC); md.detail=True
def O(a): return a-BASE
def raw32(a): return struct.unpack_from('<I',DATA,O(a))[0]
def decode_upper(a):
    # 手动解码 lui/auipc 的 imm（capstone 立即数不可靠）
    w=raw32(a); imm=w & 0xFFFFF000
    rd=(w>>7)&0x1f; op=w&0x7f
    return op,rd,imm
# 解 167 跳转表：基址 = auipc(0x0800b352)+addi(-0x41a)
op,rd,imm=decode_upper(0x0800b352)
a3 = (0x0800b352 + imm) & 0xFFFFFFFF
a3 = (a3 - 0x41a) & 0xFFFFFFFF
print(f"auipc imm={imm:#x} → a3(基址)=0x{a3:08x}  (opcode={op:#x} 应=0x17 auipc)")
TBL=a3
print(f"\n=== 167 跳转表 @0x{TBL:08x}, 72 项 (动作码0..71 → case 地址) ===")
cases={}
for k in range(72):
    ent=struct.unpack_from('<i',DATA,O(TBL)+4*k)[0]
    tgt=(TBL+ent)&0xFFFFFFFF
    cases[k]=tgt
for k in range(0,72,6):
    print('  '+'  '.join(f"{j:2}:0x{cases[j]:08x}" for j in range(k,min(k+6,72))))

# 提取每个 case 的内部动作号 a0 + 汇聚目标
print("\n=== 167 动作码 → 内部动作号(a0) ===")
def case_a0(tgt):
    a0=None; dest=None
    for i in md.disasm(DATA[O(tgt):O(tgt)+24], tgt, count=8):
        s=i.op_str.replace(' ','')
        if i.mnemonic in('c.li','addi','li') and s.split(',')[0]=='a0':
            try:a0=int(s.split(',')[-1],0)
            except:pass
        if i.mnemonic in('jal','c.j','j'):
            try:dest=i.address+int(s.split(',')[-1],0)
            except:pass
            break
    return a0,dest
import struct as _s
TBL=0x0800ef38
amap={}
for k in range(72):
    ent=_s.unpack_from('<i',DATA,O(TBL)+4*k)[0]; tgt=(TBL+ent)&0xFFFFFFFF
    a0,dest=case_a0(tgt); amap[k]=(a0,dest)
for k in range(0,72,6):
    print('  '+'  '.join(f"{j:2}→a0={amap[j][0]}" for j in range(k,min(k+6,72))))
dests=set(d for _,d in amap.values() if d)
print("汇聚目标:", ' '.join(f"0x{d:08x}" for d in sorted(dests)))
