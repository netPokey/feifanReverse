# 9boot / fw8 / fw9 大包合成与 BLE Lib 版本补丁记录

本文记录将小包 APP 固件（`fw8.bin` / `fw9.bin`）嵌入一个已知可启动、可广播蓝牙的大包 `/Volumes/csk/other/aaaa_fix2.BIN` 的步骤。

目标：保留大包中的高地址 WCH BLE Lib / 运行库区，只替换偏移 `0x8000` 的 APP 区，并修正 APP 头文件声明的 BLE Lib 版本字符串，使其与大包库区匹配。

---

## 1. 背景结论

### 1.1 9boot 的 APP 写入布局

前面逆向 `9boot.bin` 后确认，bootloader 的 `W` 命令写入地址公式为：

```c
dst = 0x08008000 + page * 0x400;
```

即：

```text
page 0 -> 0x08008000
page 1 -> 0x08008400
page 2 -> 0x08008800
...
```

每个 `W` 命令 payload 长度必须为：

```text
0x402 = 2 字节页号 + 1024 字节数据
```

### 1.2 `aaaa_fix2.BIN` 的用途

`/Volumes/csk/other/aaaa_fix2.BIN` 是一个已实测可以搜到蓝牙的大包，并且首条指令已经是：

```asm
0x00000000: j 0x00008000
```

也就是说它复位后跳过 boot，直接进入偏移 `0x8000` 的 APP 区。

该大包大小：

```text
0x6ed20
```

它包含 APP 之外的高地址 BLE Lib / 厂商库区。单独把 `fw8.bin` / `fw9.bin` 烧到低地址 APP 区，如果没有配套库区，会在启动阶段跳到 `0x00040000` 或更高地址库入口后失败。

### 1.3 BLE Lib 版本检查

APP 启动阶段存在类似逻辑：

```c
if (!tmos_memcmp(VER_LIB, VER_FILE, strlen(VER_FILE)))
{
    PRINT("head file error...\n");
    while (1);
}
```

调试 `aaaa_fix2_replace_0x8000_with_fw9.BIN` 时，PC 卡死在：

```text
0x00019ad0: j 0
```

当时寄存器：

```text
a0 = 0x00000000     // 版本检查返回失败
a1 = 0x0001abe4     // 指向 APP 内版本字符串
a2 = 0x00000015     // 字符串比较长度 21
```

字符串对比结果：

```text
原始可蓝牙大包:
  0x2de8  CH32V20x_BLE_LIB_V1.4
  0x1a0b0 CH32V20x_BLE_LIB_V1.4
  0x6e890 CH32V20x_BLE_LIB_V1.40

替换 fw9 后:
  0x2de8  CH32V20x_BLE_LIB_V1.4
  0x1abe4 CH32V20x_BLE_LIB_V1.3   <-- fw9 APP 侧
  0x6e890 CH32V20x_BLE_LIB_V1.40
```

因此需要把 APP 侧版本字符串从：

```text
CH32V20x_BLE_LIB_V1.3
```

patch 为：

```text
CH32V20x_BLE_LIB_V1.4
```

---

## 2. fw9 改造步骤

输入：

```text
基础大包: /Volumes/csk/other/aaaa_fix2.BIN
APP 固件: /Volumes/csk/other/tetete.wxapkg_dir/weapp-rebuild/FIRMWARE9_docs/fw9.bin
```

输出：

```text
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw9_blelib_v14.BIN
```

### 2.1 替换 APP 区

`fw9.bin` 大小：

```text
0x13000
```

替换范围：

```text
0x8000 - 0x1afff
```

Python：

```python
from pathlib import Path

big = Path('/Volumes/csk/other/aaaa_fix2.BIN')
app = Path('/Volumes/csk/other/tetete.wxapkg_dir/weapp-rebuild/FIRMWARE9_docs/fw9.bin')
out = Path('/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw9.BIN')

b = bytearray(big.read_bytes())
a = app.read_bytes()
off = 0x8000

assert off + len(a) <= len(b)
b[off:off + len(a)] = a
out.write_bytes(b)
```

### 2.2 patch APP 侧 BLE Lib 版本字符串

`fw9.bin` 中原字符串位置：

```text
fw9.bin offset: 0x12be4
大包中位置:   0x8000 + 0x12be4 = 0x1abe4
```

patch：

```python
from pathlib import Path

src = Path('/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw9.BIN')
out = Path('/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw9_blelib_v14.BIN')

b = bytearray(src.read_bytes())
old = b'CH32V20x_BLE_LIB_V1.3'
new = b'CH32V20x_BLE_LIB_V1.4'

i = b.find(old, 0x8000, 0x1b000)
assert i == 0x1abe4
b[i:i + len(old)] = new
out.write_bytes(b)
```

校验结果应为：

```text
CH32V20x_BLE_LIB_V1.3 []
CH32V20x_BLE_LIB_V1.4 ['0x2de8', '0x1abe4', '0x6e890']
CH32V20x_BLE_LIB_V1.40 ['0x6e890']
```

注意：`0x6e890` 的字符串为 `CH32V20x_BLE_LIB_V1.40`，搜索 `V1.4` 时会被前缀命中，这是正常现象。

---

## 3. fw8 改造步骤

输入：

```text
基础大包: /Volumes/csk/other/aaaa_fix2.BIN
APP 固件: /Volumes/csk/other/tetete.wxapkg_dir/weapp-rebuild/FIRMWARE8_docs/fw8.bin
```

输出：

```text
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw8_blelib_v14.BIN
```

### 3.1 替换 APP 区

`fw8.bin` 大小：

```text
0x13000
```

替换范围同样是：

```text
0x8000 - 0x1afff
```

生成命令同 fw9，只需把 APP 输入换成 `fw8.bin`。

### 3.2 patch APP 侧 BLE Lib 版本字符串

`fw8.bin` 中原字符串位置：

```text
fw8.bin offset: 0x12b44
大包中位置:   0x8000 + 0x12b44 = 0x1ab44
```

patch 后校验：

```text
patched image:
  0x2de8  CH32V20x_BLE_LIB_V1.4
  0x1ab44 CH32V20x_BLE_LIB_V1.4
  0x6e890 CH32V20x_BLE_LIB_V1.40
```

已生成文件：

```text
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw8.BIN
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw8_blelib_v14.BIN
```

---

## 4. 已生成产物

### fw9

```text
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw9.BIN
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw9_blelib_v14.BIN
```

### fw8

```text
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw8.BIN
/Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw8_blelib_v14.BIN
```

---

## 5. ISP 刷入命令

按前面约定，刷写使用 USB ISP / `wchisp`：

```bash
/Volumes/csk/other/download/wchisp-macos-arm64/wchisp flash \
  /Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw9_blelib_v14.BIN
```

或刷 fw8 版本：

```bash
/Volumes/csk/other/download/wchisp-macos-arm64/wchisp flash \
  /Volumes/csk/other/aaaa_fix2_replace_0x8000_with_fw8_blelib_v14.BIN
```

刷入前确认 ISP 设备：

```bash
/Volumes/csk/other/download/wchisp-macos-arm64/wchisp probe
```

---

## 6. 注意事项

1. 当前大包大小 `0x6ed20`，虽然 ISP 工具显示芯片为 `CH32V208GBU6 (Code Flash: 128KiB)`，但实测 `wchisp` 可以写入并 Verify OK 到完整大包范围。OpenOCD 对 flash bank 的识别不完整，因此约定刷写使用 ISP。
2. 不要只烧 `fw8.bin` / `fw9.bin`；它们依赖高地址 BLE Lib / 厂商库区。
3. 不要只跳过版本检查而不保留大包库区；APP 会继续调用 `0x40000+` / 高地址库函数。
4. 如果替换 APP 后卡死在 `0x19ad0`，优先检查 APP 侧 `CH32V20x_BLE_LIB_V1.x` 字符串是否与大包库区匹配。
