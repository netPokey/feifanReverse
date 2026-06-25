#!/usr/bin/env python3
"""为任意版本固件生成 TESLA_CAN_DECODE_PERID 数据表（完整 CAN ID + 命名 + 类型 + 逐位读取）。

复用 fwanalyze.analyze(FULL 全扫) + 内置命名字典（版本无关，源自 base 多源校验 + 2026.2）。
用法: python3 gen_perid.py <fw.bin> <版本名>
"""
import sys, os
os.environ['FULL'] = '1'  # 全扫含子分发表/inline
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fwanalyze

# ID → (命名, 置信度标记)。详见 OFFICIAL_NAMES.md §0。⚠=分歧 ◎=单源 ✔✔=双源 (新)=该版本新增
NAMES = {
    0x080: '?', 0x082: 'UI_tripPlanning', 0xa9: '(车身控制簇)', 0xf4: '? (8/9新增)', 0xff: '?',
    0x101: '?', 0x102: 'VCLEFT_doorStatus', 0x103: 'VCRIGHT_doorStatus', 0x118: 'DI_systemStatus ✔✔',
    0x129: 'SCCM_steeringAngleSensor', 0x132: 'BMS_hvBusStatus', 0x145: 'ESP_status (8/9新增)',
    0x189: '(控制簇)', 0x1f9: '?', 0x20c: 'VCRIGHT_hvacRequest', 0x21c: '(控制簇)',
    0x229: 'SCCM_rightStalk', 0x238: 'UI_driverAssistMapData', 0x243: 'VCRIGHT_hvacStatus',
    0x249: 'SCCM_leftStalk', 0x257: 'DI_speed', 0x25a: 'VCSEC_TPMSDisplay', 0x25d: 'APP_trafficControl',
    0x266: 'DIR_power ⚠', 0x273: 'UI_vehicleControl', 0x292: 'BMS_socStatus', 0x293: 'UI? ⚠分歧',
    0x2b4: 'PCS_dcdcRailStatus (8/9新增)', 0x2b6: '?', 0x2e1: 'VCFRONT_status', 0x2e5: 'DIF_power ◎',
    0x2f3: 'UI_hvacRequest ✔✔', 0x312: 'BMS_thermalStatus', 0x31f: 'PARK_status ◎', 0x321: 'VCFRONT_sensors',
    0x332: 'BMS_bmbMinMax', 0x333: 'UI_chargeRequest', 0x334: 'UI_powertrainControl',
    0x339: 'VCSEC_authentication', 0x33a: 'UI_range', 0x352: 'BMS_energyStatus(mux)',
    0x370: 'SCS_alertMatrix2 (8/9新增)', 0x399: 'DAS_status (8/9新增)', 0x39b: '? (8/9新增)',
    0x39d: 'IBST_status', 0x3a1: 'VCFRONT_vehicleStatus', 0x3b3: 'STATE?', 0x3b6: 'DI_odometerStatus',
    0x3c2: 'VCLEFT_switchStatus', 0x3c3: '?', 0x3d2: 'BMS_kwhCounter', 0x3d8: 'UI_elevationStatus',
    0x3df: 'STATE?', 0x3e2: 'VCLEFT_lightStatus', 0x3e3: 'VCRIGHT_lightStatus', 0x3e9: 'DAS_bodyControls',
    0x3ea: '? (8/9新增)', 0x3f5: 'VCFRONT_lighting', 0x3fd: 'UI_autopilotControl', 0x3fe: 'brake温?',
    0x3ff: '?', 0x400: '?', 0x401: 'BMS_brickMeasurements', 0x405: '?', 0x498: '? (8/9新增)',
    0x4e2: 'VCLEFT_seatStatus', 0x4e3: 'VCRIGHT_seatStatus', 0x4f3: '?', 0x678: 'GTW_gearControl?',
    0x679: '?', 0x68c: '(控制簇)', 0x7ff: '?(广播/特殊)',
}


def main():
    fw = open(sys.argv[1], 'rb').read()
    ver = sys.argv[2] if len(sys.argv) > 2 else '?'
    R = fwanalyze.analyze(fw)
    A = R['anchors']
    ids = R['can_ids']
    tc = {}
    for r in ids:
        tc[r['type']] = tc.get(r['type'], 0) + 1
    print(f"# {ver} — CAN ID 逐位解析（TESLA_CAN_DECODE_PERID）\n")
    print(f"> 固件 `{ver}`（{len(fw)} B / {len(fw):#x}）。**自动生成**：`FULL=1 scripts/gen_perid.py`。")
    print(f"> 锚点：分发表 `0x{A['can_dispatch'][0]:08x}` · signal_state `0x{A['state_helper'][0]:08x}` · "
          f"0xB0打包器 `0x{A['packer_b0']:08x}` · 复位 `0x{A['reset_target']:08x}`。")
    print(f"> 命名与置信度（✔✔双源/◎单源/⚠分歧）详见同目录 `TESLA_CAN_OFFICIAL_NAMES.md`；"
          f"**位布局为固件反汇编实证（✔FW）**。\n")
    print(f"**{len(ids)} 个 CAN ID**　类型分布：`{tc}`\n")
    print("| CAN ID | 命名（◎ref/多源） | 类型 | 读取位（Dn=数据字节，✔FW） |")
    print("|--------|------------------|------|----------------------------|")
    for r in sorted(ids, key=lambda x: x['id']):
        nm = NAMES.get(r['id'], '?')
        print(f"| 0x{r['id']:03x} | {nm} | {r['type']} | {' '.join(r['reads']) or '·'} |")
    print(f"\n> 关键字符串：{R['strings']}")


if __name__ == '__main__':
    main()
