import struct
from capstone import Cs, CS_ARCH_RISCV, CS_MODE_RISCV32, CS_MODE_RISCVC
DATA=open("firmware.bin","rb").read(); BASE=0x08000000
md=Cs(CS_ARCH_RISCV, CS_MODE_RISCV32|CS_MODE_RISCVC); md.detail=True
def off(a): return a-BASE
def disasm(a, count=40):
    o=off(a); out=[]
    for i in md.disasm(DATA[o:o+count*4], a, count=count):
        out.append((i.address,i.size,i.mnemonic,i.op_str))
    return out
def show(a,count=40,stop=None):
    addr=a; o=off(a); n=0
    while n<count and o<len(DATA):
        ins=list(md.disasm(DATA[o:o+4], addr, count=1))
        if not ins: 
            print(f"0x{addr:08x}: .2byte 0x{DATA[o]|DATA[o+1]<<8:04x}"); addr+=2; o+=2; n+=1; continue
        i=ins[0]
        print(f"0x{i.address:08x}: {i.mnemonic:8} {i.op_str}")
        if stop and stop in i.mnemonic: break
        addr+=i.size; o+=i.size; n+=1
import sys
if __name__=="__main__":
    a=int(sys.argv[1],16); c=int(sys.argv[2]) if len(sys.argv)>2 else 40
    show(a,c)
