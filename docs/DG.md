---
name: DG800 Pro / DG900 Pro SCPI 命令参考
sections:
  '1. :ABORt': 23
  '2. :COUNter 命令子系统': 37
  '3. :DISPlay 命令子系统': 192
  '4. :HCOPy 命令子系统': 311
  '5. IEEE488.2 通用命令': 335
  '6. :INITiate 命令子系统': 503
  '7. :LXI 命令子系统': 563
  '8. :MEMory 命令子系统': 608
  '9. :MMEMory 命令子系统': 678
  '10. :OUTPut 命令子系统': 882
  '11. :SOURce 命令子系统': 1004
  '12. :SYSTem 命令子系统': 2634
  '13. :TRIGger 命令子系统': 2910
通用说明:
- 符号约定：{} 参数可省略、| 多选一、[] 可省略、<> 必填
- 参数类型：Bool(ON/OFF)、Discrete(列举)、Integer、Real、ASCII 字符串
- 单位：mV=毫伏、ms=毫秒、MHz=兆赫兹（不区分大小写）
---

# 1. :ABORt

强制停止触发的操作，使仪器返回空闲状态。

## :ABORt

**语法**: `:ABORt`
**描述**: 强制停止任何已触发的操作。
**参数**: 无
**返回格式**: 无
**举例**: `:ABORt` — 停止任何已触发的操作

---

# 2. :COUNter 命令子系统

用于打开/关闭频率计功能以及设置频率计的相关信息。

## :COUNter:AVERage:ALL?

**语法**: `:COUNter:AVERage:ALL?`
**描述**: 查询频率计测量的统计结果。
**参数**: 无
**返回格式**: 返回一个逗号分隔的字符串（6 部分）：当前值、最大值、最小值、平均值、标准差和测量次数。例如 `+1.000004E+06,+1.000005E+06,+1.000003E+06,+1.000004E+06,+0.000000E+00,35`。关闭统计功能时返回 `0,0,0,0,0,0`。
**说明**: 频率计可针对当前测量参数提供统计功能。请使用 `:DISPlay:COUNter` 设置/查询当前测量参数。
**举例**: `:COUNter:AVERage:ALL?` — 查询统计结果

## :COUNter:AVERage:CLEar

**语法**: `:COUNter:AVERage:CLEar`
**描述**: 清除频率计的统计结果。
**参数**: 无
**返回格式**: 无
**说明**:
- 仅当打开频率计统计功能（`:COUNter:AVERage[:STATe]`）时有效。
- 关闭统计功能时自动清除。
**举例**: `:COUNter:AVERage:CLEar` — 清除统计结果

## :COUNter:AVERage[:STATe]

**语法**: `:COUNter:AVERage[:STATe] <state>` / `:COUNter:AVERage[:STATe]?`
**描述**: 设置或查询频率计统计功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<state>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**举例**: `:COUNter:AVERage:STATe ON` / `:COUNter:AVERage:STATe?`

## :COUNter:COUPling

**语法**: `:COUNter:COUPling <coupling>` / `:COUNter:COUPling?`
**描述**: 设置或查询频率计输入信号的耦合方式。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<coupling>` | 离散型 | {AC\|DC} | AC |
**返回格式**: 查询返回 AC 或 DC。
**说明**:
- AC：交流耦合。仅当输入阻抗为 1 MΩ 时可设为 AC。
- DC：直流耦合。
**举例**: `:COUNter:COUPling DC` / `:COUNter:COUPling?`

## :COUNter[:FREQuency]:RANGe

**语法**: `:COUNter[:FREQuency]:RANGe <range>` / `:COUNter[:FREQuency]:RANGe?`
**描述**: 设置或查询频率计测量信号的频率范围。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<range>` | 离散型 | {250\|500\|1000} | 250 |
**返回格式**: 查询返回 250、500 或 1000。
**说明**:
- 250：0 ~ 250 MHz
- 500：250 MHz ~ 500 MHz
- 1000：500 MHz ~ 1 GHz（仅 DG900 Pro）
- 输入阻抗为 1 MΩ 时，频率范围固定为 0 Hz ~ 250 MHz。
**举例**: `:COUNter:FREQuency:RANGe 500` / `:COUNter:FREQuency:RANGe?`

## :COUNter:GATetime

**语法**: `:COUNter:GATetime {<time>|<lim>}` / `:COUNter:GATetime?`
**描述**: 设置或查询频率计测量的闸门时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<time>` | 实型 | 1 ms 至 10,000 s | 1 ms |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回闸门时间，如 `+1.00000000000000E-02`。
**说明**: 指定闸门时间时将关闭自动闸门时间（`:COUNter:GATetime:AUTO[:STATe]`）。
**举例**: `:COUNter:GATetime 0.01` / `:COUNter:GATetime?`

## :COUNter:GATetime:AUTO[:STATe]

**语法**: `:COUNter:GATetime:AUTO[:STATe] <bool>` / `:COUNter:GATetime:AUTO[:STATe]?`
**描述**: 设置或查询频率计自动闸门时间的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 开启后仪器根据被测信号特征自动选择合适的闸门时间。
**举例**: `:COUNter:GATetime:AUTO:STATe ON` / `:COUNter:GATetime:AUTO:STATe?`

## :COUNter:HF

**语法**: `:COUNter:HF <bool>` / `:COUNter:HF?`
**描述**: 设置或查询频率计高频抑制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**:
- 测量低频信号时可打开高频抑制以滤除高频噪声，提高测量精度。
- 输入阻抗为 50 Ω 时不支持开启高频抑制。
**举例**: `:COUNter:HF ON` / `:COUNter:HF?`

## :COUNter:IMPedance

**语法**: `:COUNter:IMPedance <impedance>` / `:COUNter:IMPedance?`
**描述**: 设置或查询频率计的输入阻抗。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<impedance>` | 离散型 | {OMEG\|FIFTy} | FIFTy |
**返回格式**: 查询返回 FIFT 或 OMEG。
**说明**:
- FIFTy：输入阻抗为 50 Ω。
- OMEG：输入阻抗为高阻 1 MΩ。
**举例**: `:COUNter:IMPedance OMEG` / `:COUNter:IMPedance?`

## :COUNter:MEASure?

**语法**: `:COUNter:MEASure?`
**描述**: 查询频率计的测量结果。
**参数**: 无
**返回格式**: 返回逗号分隔的字符串（5 部分）：频率、周期、占空比、正脉宽、负脉宽。例如 `+1.000000000000000E+03,+1.0000000000000001E-03,+5.760000000000000E+01,...`。关闭频率计时返回 `0,0,0,0,0`。
**说明**: 频率计处于"RUN"或"SINGLE"状态时查询测量值；处于"STOP"状态时查询最后一次测量值。
**举例**: `:COUNter:MEASure?`

## :COUNter:RUN:STATe

**语法**: `:COUNter:RUN:STATe <state>` / `:COUNter:RUN:STATe?`
**描述**: 设置或查询频率计的运行状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<state>` | 离散型 | {RUN\|STOP} | RUN |
**返回格式**: 查询返回 RUN 或 STOP。
**说明**:
- RUN：连续测量。
- STOP：停止测量。
**举例**: `:COUNter:RUN:STATe RUN` / `:COUNter:RUN:STATe?`

## :COUNter:SINGle

**语法**: `:COUNter:SINGle`
**描述**: 设置频率计为单次运行（执行一次测量后进入"停止"状态）。
**参数**: 无
**返回格式**: 无
**说明**: 仅在频率计打开（`:COUNter[:STATe]`）时有效。
**举例**: `:COUNter:SINGle`

## :COUNter[:STATe]

**语法**: `:COUNter[:STATe] <bool>` / `:COUNter[:STATe]?`
**描述**: 设置或查询频率计的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 0/OFF 关闭频率计；1/ON 打开频率计。
**举例**: `:COUNter:STATe ON` / `:COUNter:STATe?`

---

# 3. :DISPlay 命令子系统

用于设置或查询当前通道和显示屏状态，选择设置电压范围、扫频范围、脉冲持续时间的方法等。

## :DISPlay:BRIGhtness

**语法**: `:DISPlay:BRIGhtness {<brightness>|<lim>}` / `:DISPlay:BRIGhtness? [<lim>]`
**描述**: 设置或查询屏幕亮度。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<brightness>` | 整型 | 1% 至 100% | 50% |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 查询返回整数，如 `80`（表示 80%）。
**举例**: `:DISPlay:BRIGhtness 80` / `:DISPlay:BRIGhtness?`

## :DISPlay:COUNter

**语法**: `:DISPlay:COUNter <type>` / `:DISPlay:COUNter?`
**描述**: 设置或查询频率计当前显示的测量参数。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {FREQuency\|PERiod\|DUTY\|PWIDth\|NWIDth} | FREQuency |
**返回格式**: 查询返回 FREQ、PER、DUTY、PWID 或 NWID。
**说明**: 可测量：频率、周期、占空比、正脉宽、负脉宽。
**举例**: `:DISPlay:COUNter PERiod` / `:DISPlay:COUNter?`

## :DISPlay:FOCus

**语法**: `:DISPlay:FOCus <chan>` / `:DISPlay:FOCus?`
**描述**: 设置或查询当前通道。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<chan>` | 离散型 | {CH1\|CH2} | CH1 |
**返回格式**: 查询返回当前通道。
**说明**: DG821 Pro 为单通道型号，默认仅支持 CH1，除非安装双通道升级选件。
**举例**: `:DISPlay:FOCus CH1` / `:DISPlay:FOCus?`

## :DISPlay[:STATe]

**语法**: `:DISPlay[:STATe] <bool>` / `:DISPlay[:STATe]?`
**描述**: 启用或禁用前面板显示屏。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 1\|ON |
**返回格式**: 查询返回 1 或 0。
**说明**: 禁用时前面板显示屏变为黑色，但不关闭 UI 进程。按前面板按键返回本地操作时自动启用。
**举例**: `:DISPlay:STATe OFF` / `:DISPlay:STATe?`

## :DISPlay:TEXT

**语法**: `:DISPlay:TEXT <string>` / `:DISPlay:TEXT?`
**描述**: 设置或查询在前面板显示的文本消息。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<string>` | ASCII 字符串 | 最多 40 个标准键盘字符的带双引号字符串 | - |
**返回格式**: 查询返回字符串，如 `"Test in progress"`。
**说明**: 设置文本消息后仪器进入通知器模式，按前面板按键或执行 `:DISPlay:TEXT:CLEar` 恢复正常显示。
**举例**: `:DISPlay:TEXT "Test in progress"` / `:DISPlay:TEXT?`

## :DISPlay:TEXT:CLEar

**语法**: `:DISPlay:TEXT:CLEar`
**描述**: 清除前面板显示的文本消息。
**参数**: 无
**返回格式**: 无
**举例**: `:DISPlay:TEXT:CLEar`

## :DISPlay:UNIT:PULSe

**语法**: `:DISPlay:UNIT:PULSe <type>` / `:DISPlay:UNIT:PULSe?`
**描述**: 设置或查询指定脉冲宽度的方法。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {WIDTh\|DUTY} | WIDTh |
**返回格式**: 查询返回 WIDT 或 DUTY。
**说明**:
- WIDTh：脉宽，以秒（s）指定。
- DUTY：占空比，以百分比（%）指定。
**举例**: `:DISPlay:UNIT:PULSe DUTY` / `:DISPlay:UNIT:PULSe?`

## :DISPlay:UNIT:RATE

**语法**: `:DISPlay:UNIT:RATE <unit>` / `:DISPlay:UNIT:RATE?`
**描述**: 设置或查询正弦波、方波、锯齿波、脉冲、任意波和谐波的速率单位。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<unit>` | 离散型 | {FREQuency\|PERiod} | FREQuency |
**返回格式**: 查询返回 FREQ 或 PER。
**说明**: FREQuency 单位 Hz；PERiod 单位秒（s）。
**举例**: `:DISPlay:UNIT:RATE PERiod` / `:DISPlay:UNIT:RATE?`

## :DISPlay:UNIT:SWEep

**语法**: `:DISPlay:UNIT:SWEep <type>` / `:DISPlay:UNIT:SWEep?`
**描述**: 设置或查询指定频率扫描范围的方法。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {STARtstop\|CENTerspan} | STARtstop |
**返回格式**: 查询返回 STAR 或 CENT。
**说明**:
- STARtstop：用开始值和结束值指定扫频范围。
- CENTerspan：用中间值和跨度指定扫频范围。
**举例**: `:DISPlay:UNIT:SWEep CENTerspan` / `:DISPlay:UNIT:SWEep?`

## :DISPlay:UNIT:VOLTage

**语法**: `:DISPlay:UNIT:VOLTage <type>` / `:DISPlay:UNIT:VOLTage?`
**描述**: 设置或查询指定电压范围的方法。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {AMPLitudeoff\|HIGHlow} | AMPLitudeoff |
**返回格式**: 查询返回 AMPL 或 HIGH。
**说明**:
- AMPLitudeoff：使用幅值和偏移指定电压范围。
- HIGHlow：使用高电平和低电平指定电压范围。
**举例**: `:DISPlay:UNIT:VOLTage HIGHlow` / `:DISPlay:UNIT:VOLTage?`

---

# 4. :HCOPy 命令子系统

用于设置或查询图像格式、获取屏幕截图。

## :HCOPy:SDUMp:DATA?

**语法**: `:HCOPy:SDUMp:DATA?`
**描述**: 获取当前屏幕截图。
**参数**: 无
**返回格式**: 查询返回屏幕截图的数据流。
**说明**: 使用 `:HCOPy:SDUMp:DATA:FORMat` 设置/查询返回的图像格式（BMP/PNG）。

## :HCOPy:SDUMp:DATA:FORMat

**语法**: `:HCOPy:SDUMp:DATA:FORMat <type>` / `:HCOPy:SDUMp:DATA:FORMat?`
**描述**: 设置或查询截图返回图像的格式。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {BMP\|PNG} | - |
**返回格式**: 查询返回 BMP 或 PNG。
**举例**: `:HCOPy:SDUMp:DATA:FORMat PNG` / `:HCOPy:SDUMp:DATA:FORMat?`

---

# 5. IEEE488.2 通用命令

IEEE488.2 通用命令用于查询仪器基本信息或执行常用基本操作。这些命令以 `*` 开头，命令关键字长度为 3 个字符，与状态寄存器相关。

## 标准事件状态寄存器 (SESR) 位定义

| 位编号 | 位名称 | 十进制值 | 定义 |
|--------|--------|----------|------|
| 0 | 操作完成 | 1 | 之前的所有命令都已经执行 |
| 1 | 未使用 | 2 | - |
| 2 | 查询错误 | 4 | 仪器试图读取空的输出缓冲区等 |
| 3 | 特定于设备的错误 | 8 | 自检错误、校准错误等 |
| 4 | 执行错误 | 16 | 发生执行错误 |
| 5 | 命令 | 32 | 发生命令语法错误 |
| 6 | 未使用 | 64 | - |
| 7 | 通电 | 128 | 已关闭再打开电源 |

## 状态字节寄存器 (SBR) 位定义

| 位编号 | 位名称 | 十进制值 | 定义 |
|--------|--------|----------|------|
| 0 | 未使用 | 1 | - |
| 1 | 未使用 | 2 | - |
| 2 | 错误队列 | 4 | 错误队列中的一个或多个错误 |
| 3 | 可疑数据摘要 | 8 | 可疑数据寄存器中设置一个或多个位 |
| 4 | 消息可用 | 16 | 输出缓冲区中的可用数据 |
| 5 | 标准事件摘要 | 32 | 标准事件寄存器中设置一个或多个位 |
| 6 | 主累加 | 64 | 可生成服务请求（必须启用位） |
| 7 | 操作寄存器 | 128 | 操作状态寄存器中设置一个或多个位 |

## \*CLS

**语法**: `*CLS`
**描述**: 将所有事件寄存器的值清零，同时清除错误队列。
**参数**: 无
**返回格式**: 无

## \*ESE

**语法**: `*ESE <maskargument>` / `*ESE?`
**描述**: 设置或查询标准事件状态寄存器组的使能寄存器位。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<maskargument>` | 整型 | 0 至 255 | 0 |
**返回格式**: 查询返回一个整数，等于该状态寄存器中所有已设置位的十进制值之和。
**说明**: `<maskargument>` 为启用标准事件状态寄存器位的十进制值的总和。例如启用位 2（值为 4）、位 3（值为 8）和位 7（值为 128），则设置为 140。
**举例**: `*ESE 16` / `*ESE?`

## \*ESR?

**语法**: `*ESR?`
**描述**: 查询并清除标准事件状态寄存器组的事件寄存器值。
**参数**: 无
**返回格式**: 查询返回一个整数，等于该寄存器中所有位的权值之和。
**说明**: 位 1 和位 6 未使用，始终视为 0。

## \*IDN?

**语法**: `*IDN?`
**描述**: 查询仪器的 ID 字符串。
**参数**: 无
**返回格式**: 返回 `RIGOL TECHNOLOGIES,<model>,<serial number>,<software version>`。
- `<model>`：仪器型号
- `<serial number>`：序列号
- `<software version>`：软件版本

## \*OPC

**语法**: `*OPC` / `*OPC?`
**描述**: 执行完之前所有已发送命令后，将标准事件寄存器中 OPC（0 位）置 1。查询所有命令是否已执行完毕。
**参数**: 无
**返回格式**: 若之前的所有命令已被执行，返回 1。
**说明**: 将 `*OPC` 作为命令串最后一条命令可确定命令队列已全部执行；发送 `*OPC?` 并读取结果可确保同步。

## \*OPT?

**语法**: `*OPT?`
**描述**: 查询所安装选件的信息。
**参数**: 无
**返回格式**: 返回安装选件的信息，不同选件之间以逗号隔开。已安装返回选件名称；未安装返回 NONE。
**举例**: `*OPT?` — 查询选件的安装状态，返回 NONE

## \*PSC

**语法**: `*PSC <bool>` / `*PSC?`
**描述**: 启用或禁用上电时清除状态字节和标准事件寄存器的使能寄存器。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1} | 0 |
**返回格式**: 查询返回 0 或 1。
**说明**:
- `*PSC 1`：上电时清除使能寄存器；`*PSC 0`：上电时不受影响。
- 也可分别发送 `*SRE 0` 或 `*ESE 0` 清除。
**举例**: `*PSC 1` / `*PSC?`

## \*RCL

**语法**: `*RCL <value>`
**描述**: 调用存储在指定非易失性存储器位置的仪器状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<value>` | 离散型 | {0\|1\|2\|3\|4\|5} | 0 |
**返回格式**: 无
**举例**: `*RCL 1` — 调用寄存器 1 中的仪器状态

## \*RST

**语法**: `*RST`
**描述**: 将仪器恢复至出厂默认状态。
**参数**: 无
**返回格式**: 无

## \*SAV

**语法**: `*SAV <value>`
**描述**: 保存当前仪器状态到非易失性存储器的指定位置。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<value>` | 离散型 | {0\|1\|2\|3\|4\|5} | 0 |
**返回格式**: 无
**说明**: 如果指定位置存储有数据，执行此命令会不提示直接覆盖。
**举例**: `*SAV 1` — 保存当前仪器状态到位置 1

## \*SRE

**语法**: `*SRE <maskargument>` / `*SRE?`
**描述**: 设置或查询状态字节寄存器组的使能寄存器值。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<maskargument>` | 整型 | 0 至 255 | 0 |
**返回格式**: 查询返回一个整数，等于该寄存器中所有已设置位的十进制值之和。
**说明**: `<maskargument>` 为启用状态字节寄存器位的十进制值总和。
**举例**: `*SRE 16` / `*SRE?`

## \*STB?

**语法**: `*STB?`
**描述**: 查询状态字节寄存器的事件寄存器值。执行后状态字节寄存器的值清零。
**参数**: 无
**返回格式**: 查询返回一个整数，等于该寄存器中所有位的十进制值之和。
**说明**: 位 0 和位 1 未使用，始终视为 0。

## \*TRG

**语法**: `*TRG`
**描述**: 产生一次触发动作。
**参数**: 无
**返回格式**: 无
**说明**: 只有当前扫描或猝发功能已打开且触发源设为手动时有效。也可发送 `:TRIGger<n>[:IMMediate]` 触发。
**举例**: `*TRG` — 产生一次触发动作

## \*TST?

**语法**: `*TST?`
**描述**: 执行一次自检并返回自检结果。
**参数**: 无
**返回格式**: 查询返回十进制整数。自检通过返回 0。

## \*WAI

**语法**: `*WAI`
**描述**: 等待操作完成。保证下一条命令下发之前前一条命令已完成。
**参数**: 无
**返回格式**: 无
**说明**: 在两个命令之间插入 `*WAI` 可确保前一条命令完成后再启动下一条。

---

# 6. :INITiate 命令子系统

用于设置或查询仪器的"等待触发"状态。

**触发系统状态说明**:
- **等待触发**：检测触发事件，发生后进入"正在操作"状态。
- **正在操作**：通道触发后离开"等待触发"进入"正在操作"（如猝发或扫描输出）。输出结束后返回"空闲"或"等待触发"（由 `:INITiate[<n>]:CONTinuous` 设置）。
- **空闲**：忽略触发信号。发送 `:INITiate<n>[:IMMediate]` 可由"空闲"转为"等待触发"。

## :INITiate[<n>]:CONTinuous

**语法**: `:INITiate[<n>]:CONTinuous <bool>` / `:INITiate[<n>]:CONTinuous?`
**描述**: 设置或查询指定通道是否自动转入"等待触发"状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {1\|2} | - |
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 1\|ON |
**返回格式**: 查询返回 0 或 1。
**说明**:
- 1|ON：返回"等待触发"状态；0|OFF：返回"空闲"状态并忽略触发。
- 设置为 1|ON 时，触发计数（`:TRIGger<n>:COUNt`）设置失效。
- 省略 `[<n>]` 时默认 CH1。
**举例**: `:INITiate1:CONTinuous ON` / `:INITiate1:CONTinuous?`

## :INITiate[<n>]:CONTinuous:ALL

**语法**: `:INITiate[<n>]:CONTinuous:ALL <bool>`
**描述**: 设置所有通道是否自动转入"等待触发"状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {1\|2} | 1 |
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 1\|ON |
**返回格式**: 无
**说明**: 1|ON 返回"等待触发"；0|OFF 返回"空闲"。设置为 ON 时触发计数失效。

## :INITiate[<n>][:IMMediate]

**语法**: `:INITiate[<n>][:IMMediate]`
**描述**: 将指定通道的触发系统状态由"空闲"更改为"等待触发"。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {1\|2} | 1 |
**返回格式**: 无
**说明**:
- 使用 `:ABORt` 可使仪器返回空闲状态。
- 若 `:INITiate<n>:CONTinuous` 已设为 ON，则此命令不起作用。
- 省略 `[<n>]` 时默认 CH1。

## :INITiate[<n>][:IMMediate]:ALL

**语法**: `:INITiate[<n>][:IMMediate]:ALL`
**描述**: 将所有通道的触发系统状态由"空闲"更改为"等待触发"。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {1\|2} | 1 |
**返回格式**: 无
**说明**: 使用 `:ABORt` 返回空闲状态。若 `:INITiate<n>:CONTinuous` 已设为 ON 则不起作用。

---

# 7. :LXI 命令子系统

用于设置多播域名系统的开关状态、重启 LAN、将网络状态恢复为默认值。

## :LXI:MDNS:STATe

**语法**: `:LXI:MDNS:STATe <bool>` / `:LXI:MDNS:STATe?`
**描述**: 设置或查询多播域名系统（mDNS）的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 开启 mDNS 可在没有 DNS 服务器的小型网络中为仪器提供 DNS 功能。
**举例**: `:LXI:MDNS:STATe ON` / `:LXI:MDNS:STATe?`

## :LXI:MDNS:SNAMe:DESired

**语法**: `:LXI:MDNS:SNAMe:DESired <name>` / `:LXI:MDNS:SNAMe:DESired?`
**描述**: 设置或查询 mDNS 服务名。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<name>` | ASCII 字符串 | 长度不超过 99 个字符，可为英文字符、数字和中划线 | - |
**返回格式**: 查询返回 ASCII 字符串。
**举例**: `:LXI:MDNS:SNAMe:DESired RIGOL` / `:LXI:MDNS:SNAMe:DESired?`

## :LXI:RESet

**语法**: `:LXI:RESet`
**描述**: 将网络恢复为默认设置。
**参数**: 无
**返回格式**: 无
**说明**: 发送后可能需要几秒钟才能重新启动 LAN 接口。
**举例**: `:LXI:RESet`

## :LXI:RESTart

**语法**: `:LXI:RESTart`
**描述**: 重新启动 LAN。
**参数**: 无
**返回格式**: 无
**说明**: 发送后可能需要几秒钟才能重新启动 LAN 接口。
**举例**: `:LXI:RESTart`

---

# 8. :MEMory 命令子系统

用于设置和查询存储在仪器内部非易失性存储器中的状态文件。

## :MEMory:NSTates?

**语法**: `:MEMory:NSTates?`
**描述**: 查询可用于状态存储的存储器位置总数。
**参数**: 无
**返回格式**: 查询返回 6。
**举例**: `:MEMory:NSTates?` — 返回 6

## :MEMory:STATe:CATalog?

**语法**: `:MEMory:STATe:CATalog?`
**描述**: 查询仪器内部非易失性存储器中的状态文件名称。
**参数**: 无
**返回格式**: 返回逗号分隔的字符串，顺序表示位置 0 至 5 名称。如 `"AUTO_RECALL","STATE_1","STATE_2","STATE_3","STATE_4","STATE_5"`。
**说明**: 仪器内部非易失性存储器提供 6 个状态文件存储位置。
**举例**: `:MEMory:STATe:CATalog?`

## :MEMory:STATe:DELete

**语法**: `:MEMory:STATe:DELete <n>`
**描述**: 删除指定存储位置的已存状态文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {0\|1\|2\|3\|4\|5} | - |
**返回格式**: 无
**说明**: 仅当指定存储位置已存有状态文件时有效。
**举例**: `:MEMory:STATe:DELete 1` — 删除位置 1 的状态文件

## :MEMory:STATe:NAME

**语法**: `:MEMory:STATe:NAME <n>[,<name>]` / `:MEMory:STATe:NAME? <n>`
**描述**: 设置或查询指定存储位置的状态文件名。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {0\|1\|2\|3\|4\|5} | - |
| `<name>` | ASCII 字符串 | 最长 12 个字符，首字符必须为字母 | - |
**返回格式**: 查询返回带双引号的字符串，如 `"state"`。
**说明**: `<name>` 首字符必须是字母 (a~z、A~Z)，其他字符可以是字母、数字或下划线。省略名称将使用出厂默认名称。
**举例**: `:MEMory:STATe:NAME 2,state` / `:MEMory:STATe:NAME? 2`

## :MEMory:STATe:RECall:AUTO

**语法**: `:MEMory:STATe:RECall:AUTO <bool>` / `:MEMory:STATe:RECall:AUTO?`
**描述**: 设置或查询开机时是否自动加载上次值。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | - |
**返回格式**: 查询返回 0 或 1。
**说明**:
- ON 或 1：上电时自动调用存储位置 0 中的仪器状态（上次值）。
- OFF 或 0：上电时使用出厂默认值（某些不受恢复出厂值影响的参数除外）。
**举例**: `:MEMory:STATe:RECall:AUTO ON` / `:MEMory:STATe:RECall:AUTO?`

## :MEMory:STATe:VALid?

**语法**: `:MEMory:STATe:VALid? <state>`
**描述**: 查询指定存储位置是否已存有状态文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<state>` | 离散型 | {0\|1\|2\|3\|4\|5} | - |
**返回格式**: 查询返回 1 或 0。1 表示已存有状态文件，0 表示没有。
**说明**: 使用 `*SAV` 命令前用此命令查询以避免意外覆盖文件。
**举例**: `:MEMory:STATe:VALid? 2`

---

# 9. :MMEMory 命令子系统

用于查询和设置与仪器内部和外部存储器相关的信息。内部文件系统（`INT:\`）一直存在，外部存储器（`USB:\`）仅在 USB HOST 接口检测到 U 盘时可用。

**文件路径规则**:
- 绝对路径以 "/" 或 "\" 开头，从驱动器标识符（INT 或 USB）开始。
- 文件夹和文件名不能包含 `\ / : * ? " < > |` 字符，且不能以 "." 开始。
- 相对路径以 `.\` 或 `./` 开始。
- 回退上级路径以 `../` 或 `..\` 开始。
- 文件夹和文件名组合不超过 200 个字符。

## :MMEMory:CATalog[:ALL]?

**语法**: `:MMEMory:CATalog[:ALL]? [<folder>]`
**描述**: 查询指定路径下的所有文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<folder>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 返回字符串，格式：已用空间,剩余空间,"文件名称,文件属性,文件大小",......。文件属性为 STAT/ASC/FOLD/SEQ/ARB/TXT/GEL 或空字符。单位字节。无文件时仅返回已用和剩余空间。
**说明**: 省略 `<folder>` 时查询 `:MMEMory:CDIRectory` 选定的路径。
**举例**: `:MMEMory:CATalog:ALL? USB:\Mydata`

## :MMEMory:CATalog:DATA:ARBitrary?

**语法**: `:MMEMory:CATalog:DATA:ARBitrary? [<folder>]`
**描述**: 查询指定路径下的所有任意波（*.arb/*.txt/*.csv）和序列（*.seq）文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<folder>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 返回字符串，文件属性为 SEQ/ARB/ASC/TXT。
**说明**: 省略 `<folder>` 时查询 `:MMEMory:CDIRectory` 选定的路径。
**举例**: `:MMEMory:CATalog:DATA:ARBitrary? INT:\folder`

## :MMEMory:CATalog:STATe?

**语法**: `:MMEMory:CATalog:STATe? [<folder>]`
**描述**: 查询指定路径下的状态文件（*.sta）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<folder>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 返回字符串，文件属性为 STAT。
**说明**: 省略 `<folder>` 时查询当前路径。
**举例**: `:MMEMory:CATalog:STATe?`

## :MMEMory:CDIRectory

**语法**: `:MMEMory:CDIRectory <directory_name>` / `:MMEMory:CDIRectory?`
**描述**: 设置或查询用于 :MMEMory 命令子系统的默认路径。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<directory_name>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 查询返回字符串，如 `INT:/folder`。
**举例**: `:MMEMory:CDIRectory INT:\folder` / `:MMEMory:CDIRectory?`

## :MMEMory:COPY

**语法**: `:MMEMory:COPY <file_name>,<directory_name>`
**描述**: 将指定文件复制到指定路径（非当前路径）下。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<file_name>` | ASCII 字符串 | 有效文件名 | - |
| `<directory_name>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 无
**说明**: 目标路径存在同名文件会直接覆盖。
**举例**: `:MMEMory:COPY INT:\Arb.raf,INT:\TextFolder`

## :MMEMory:COPY:SEQuence

**语法**: `:MMEMory:COPY:SEQuence <sequence>,<directoryname>`
**描述**: 将指定序列文件（.seq）复制到指定路径下。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<sequence>` | ASCII 字符串 | 有效的序列文件名（含扩展名） | - |
| `<directoryname>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 无
**说明**: 目标路径存在同名文件会直接覆盖。
**举例**: `:MMEMory:COPY:SEQuence INT:\Rigol\MySequence.seq,USB:\rigol`

## :MMEMory:DELete

**语法**: `:MMEMory:DELete <file_name>`
**描述**: 删除指定路径下的文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<file_name>` | ASCII 字符串 | 有效文件名 | - |
**返回格式**: 无
**说明**: 要删除文件夹请使用 `:MMEMory:RDIRectory`。
**举例**: `:MMEMory:DELete INT:\screenshot.png`

## :MMEMory:LOAD:DATA

**语法**: `:MMEMory:LOAD:DATA <n>,<file_name>[,<separator>,<datatype>]`
**描述**: 将内部或外部存储器中的序列文件或任意波形文件加载到指定通道的易失性存储器中。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {1\|2} | 1 |
| `<file_name>` | ASCII 字符串 | 有效文件名 | - |
| `<separator>` | 离散型 | {ENTer\|COMMa\|SEMicolon} | - |
| `<datatype>` | 离散型 | {NORM\|VOL} | - |
**返回格式**: 无
**说明**:
- 支持 *.seq、*.arb、*.csv、*.txt。
- *.txt 文件必须指定 `<separator>`（ENTer/COMMa/SEMicolon）和 `<datatype>`（NORM 波点整型 / VOL 电压浮点型）。
- DG800 Pro 任意波长度：32 pts~2 Mpts（选配 8 Mpts/CH）；DG900 Pro：32 pts~16 Mpts（选配 32 Mpts/CH）。
**举例**: `:MMEMory:LOAD:DATA 1,INT:\SEQ.seq`

## :MMEMory:LOAD:STATe

**语法**: `:MMEMory:LOAD:STATe <file_name>`
**描述**: 加载指定的状态文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<file_name>` | ASCII 字符串 | 有效的状态文件名 | - |
**返回格式**: 无
**举例**: `:MMEMory:LOAD:STATe INT:\Mystate.sta`

## :MMEMory:MDIRectory

**语法**: `:MMEMory:MDIRectory <dir_name>`
**描述**: 在大容量存储介质中以指定名称创建空文件夹。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<dir_name>` | ASCII 字符串 | 见说明 | - |
**返回格式**: 无
**说明**: 不允许创建同名文件夹。
**举例**: `:MMEMory:MDIRectory TestFolder`

## :MMEMory:MOVE

**语法**: `:MMEMory:MOVE <file1>,<file2>`
**描述**: 将文件 1 移动到指定路径，或将文件 1 重命名为文件 2。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<file1>` | ASCII 字符串 | 有效文件名 | - |
| `<file2>` | ASCII 字符串 | 有效路径或文件名 | - |
**返回格式**: 无
**说明**: 重命名时需指定同一文件夹；移动时为 `<file2>` 指定其他有效路径。
**举例**: `:MMEMory:MOVE INT:\Rigol.sta,USB:\Rigol\` / `:MMEMory:MOVE USB:\Rigol1.sta,USB:\Rigol2.sta`

## :MMEMory:RDIRectory

**语法**: `:MMEMory:RDIRectory <folder>`
**描述**: 删除大容量存储介质上的指定目录（空文件夹）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<folder>` | ASCII 字符串 | 空文件夹名 | - |
**返回格式**: 无
**说明**: 只能删除空文件夹，否则仪器将生成错误提示。
**举例**: `:MMEMory:RDIRectory folder`

## :MMEMory:STORe:DATA

**语法**: `:MMEMory:STORe:DATA <n>,<file_name>`
**描述**: 将指定通道易失性存储器中的序列文件存储到指定路径中。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {1\|2} | 1 |
| `<file_name>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 无
**举例**: `:MMEMory:STORe:DATA 1,INT:\Seq_1.seq`

## :MMEMory:STORe:STATe

**语法**: `:MMEMory:STORe:STATe <file_name>`
**描述**: 以指定名称将当前仪器状态存储到指定路径中。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<file_name>` | ASCII 字符串 | 有效路径 | - |
**返回格式**: 无
**举例**: `:MMEMory:STORe:STATe INT:\state.sta`

## :MMEMory[:TRACe]:ARB:DATA

**语法**: `:MMEMory[:TRACe]:ARB:DATA <arb_name>,<flag>,<data>`
**描述**: 发送 -1.0 至 1.0 之间的浮点数据到指定任意波文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb_name>` | ASCII 字符串 | 有效文件名（以 .arb 结尾） | - |
| `<flag>` | 离散型 | {HEADer\|CONTinue\|END} | - |
| `<data>` | ASCII 字符串 | 见说明 | - |
**返回格式**: 无
**说明**:
- HEADer 丢弃之前数据作为开始；CONTinue 表示还有数据；END 表示最后一段。
- 同名文件会被新数据覆盖。
- DG800 Pro：32 pts~2 Mpts（选配 8 Mpts/CH）；DG900 Pro：32 pts~16 Mpts（选配 32 Mpts/CH）。建议每次发送 20 KB 以内。
**举例**: `:MMEMory:TRACe:ARB:DATA INT:\ARB.arb,END,-0.001,-0.002,...`

## :MMEMory[:TRACe]:ARB:DATA:DAC

**语法**: `:MMEMory[:TRACe]:ARB:DATA:DAC <arb_name>,<flag>,<data>`
**描述**: 发送 -32768 至 +32767 之间的整型数据或数据流到指定任意波文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb_name>` | ASCII 字符串 | 有效文件名（以 .arb 结尾） | - |
| `<flag>` | 离散型 | {HEADer\|CONTinue\|END} | - |
| `<data>` | ASCII 字符串或 IEEE 488.2 block | 见说明 | - |
**返回格式**: 无
**说明**:
- 整型数据间以逗号分隔。数据流格式为 TMC 头 + 二进制波形数据（如 `#9000001024`）。
- DG800 Pro：32 pts~2 Mpts（选配 8 Mpts/CH）；DG900 Pro：32 pts~16 Mpts（选配 32 Mpts/CH）。建议每次发送 20 KB 以内。
**举例**: `:MMEMory:TRACe:ARB:DATA:DAC INT:\ARB.arb,END,10,20,30,...`

---

# 10. :OUTPut 命令子系统

用于设置和查询与通道输出相关的信息。`:OUTPut[<n>]` 中 `<n>` 为通道号 {1|2}，默认 1。DG821 Pro 为单通道型号，仅支持 CH1（除非安装双通道升级选件）。

## :OUTPut[<n>]:IDLE

**语法**: `:OUTPut[<n>]:IDLE {<idle>|<position>}` / `:OUTPut[<n>]:IDLE?`
**描述**: 设置或查询指定通道猝发模式中空闲电平的位置。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<idle>` | 整型 | 0 至 65,535 | - |
| `<position>` | 离散型 | {FPT\|TOP\|CENTer\|BOTTom} | FPT |
**返回格式**: 查询返回 FPT、TOP、CENT、BOTT，或以整数形式返回空闲电平位置。
**说明**: `<idle>` 自定义位置；`<position>` 可设为第一个点 (FPT)、波形顶部 (TOP)、中间 (CENTer)、底部 (BOTTom)。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut1:IDLE TOP` / `:OUTPut1:IDLE?`

## :OUTPut[<n>]:LOAD

**语法**: `:OUTPut[<n>]:LOAD {<ohms>|<lim_set>}` / `:OUTPut[<n>]:LOAD? [<lim_query>]`
**描述**: 设置或查询指定通道的输出阻抗。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<ohms>` | 整型 | 1 Ω 至 10 kΩ | 50 Ω |
| `<lim_set>` | 离散型 | {INFinity\|MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回输出阻抗，如 `+1.000000000000000E+02`（100 Ω）；高阻 (INFinity) 返回 `9.9E+37`。
**说明**: 输出阻抗设置影响输出振幅和 DC 偏移。实际负载与设定值不同时电压电平不匹配。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut1:LOAD INFinity` / `:OUTPut1:LOAD?`

## :OUTPut[<n>]:POLarity

**语法**: `:OUTPut[<n>]:POLarity <polarity>` / `:OUTPut[<n>]:POLarity?`
**描述**: 设置或查询指定通道的输出极性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<polarity>` | 离散型 | {NORMal\|INVerted} | NORMal |
**返回格式**: 查询返回 NORM 或 INV。
**说明**: NORMal 常规输出；INVerted 反相输出。波形反相相对于偏移电压进行，偏移电压不变，同步信号不反相。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut1:POLarity NORMal` / `:OUTPut1:POLarity?`

## :OUTPut[<n>][:STATe]

**语法**: `:OUTPut[<n>][:STATe] <state>` / `:OUTPut[<n>][:STATe]?`
**描述**: 设置或查询指定通道的输出开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<state>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 0/OFF 关闭输出，1/ON 打开输出。省略 `[<n>]` 默认通道 1。
**举例**: `:OUTPut1:STATe 1` / `:OUTPut1:STATe?`

## :OUTPut[<n>]:SYNC

**语法**: `:OUTPut[<n>]:SYNC <state>` / `:OUTPut[<n>]:SYNC?`
**描述**: 设置或查询同步信号的输出状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<state>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 正弦波、方波、锯齿波、脉冲波、任意波形（非 DC）、扫频、猝发、已调制波形都有关联的同步信号。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut1:SYNC ON` / `:OUTPut1:SYNC?`

## :OUTPut[<n>]:SYNC:MODE

**语法**: `:OUTPut[<n>]:SYNC:MODE <mode>` / `:OUTPut[<n>]:SYNC:MODE?`
**描述**: 设置或查询指定通道的频率标记功能是否开启。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<mode>` | 离散型 | {NORMal\|MARKer} | NORMal |
**返回格式**: 查询返回 NORM 或 MARK。
**说明**: NORMal 关闭频率标记；MARKer 启用频率标记。仅在扫频功能打开时可启用。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut1:SYNC:MODE MARKer` / `:OUTPut1:SYNC:MODE?`

## :OUTPut[<n>]:SYNC:POLarity

**语法**: `:OUTPut[<n>]:SYNC:POLarity <polarity>` / `:OUTPut[<n>]:SYNC:POLarity?`
**描述**: 设置或查询指定通道同步信号的极性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<polarity>` | 离散型 | {NORMal\|INVerted} | NORMal |
**返回格式**: 查询返回 NORM 或 INV。
**说明**: 设置输出正常 (NORMal) 或反相 (INVerted) 的同步信号。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut1:SYNC:POLarity NORMal` / `:OUTPut1:SYNC:POLarity?`

## :OUTPut[<n>]:SYNC:SOURce

**语法**: `:OUTPut[<n>]:SYNC:SOURce <port>` / `:OUTPut[<n>]:SYNC:SOURce?`
**描述**: 设置或查询指定通道同步信号的输出端口。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<port>` | 离散型 | {BACK\|FRONt} | BACK |
**返回格式**: 查询返回 FRON 或 BACK。
**说明**:
- FRONt：前端口。CH1 同步从 [CH2] 输出，CH2 同步从 [CH1] 输出。此时前端口不允许配置。
- BACK：后端口。同步信号从后面板 [AUX IN/OUT] 输出。
- DG821 Pro 仅支持后端口输出同步信号（除非安装双通道升级选件）。
**举例**: `:OUTPut1:SYNC:SOURce FRONt` / `:OUTPut1:SYNC:SOURce?`

## :OUTPut[<n>]:TRIGger

**语法**: `:OUTPut[<n>]:TRIGger <bool>` / `:OUTPut[<n>]:TRIGger?`
**描述**: 设置或查询是否启用扫频或猝发模式的触发输出。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 启用后在猝发或扫描开始时从后面板 [AUX IN/OUT] 输出指定边沿的脉冲。猝发触发源为外部或门控时触发输出禁用。扫频触发源为外部时触发输出禁用。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut:TRIGger ON` / `:OUTPut:TRIGger?`

## :OUTPut[<n>]:TRIGger:SLOPe

**语法**: `:OUTPut[<n>]:TRIGger:SLOPe <type>` / `:OUTPut[<n>]:TRIGger:SLOPe?`
**描述**: 设置或查询指定通道触发输出信号的输出极性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {POSitive\|NEGative} | POSitive |
**返回格式**: 查询返回 POS 或 NEG。
**说明**: POSitive 输出上升沿脉冲；NEGative 输出下降沿脉冲。省略 `[<n>]` 默认 CH1。
**举例**: `:OUTPut1:TRIGger:SLOPe NEGative` / `:OUTPut1:TRIGger:SLOPe?`

---

# 11. :SOURce 命令子系统

用于设置和查询通道和波形参数，包括基础波形、序列、谐波、调制、扫频、猝发相关参数，以及耦合、通道跟踪等。

`[:SOURce[<n>]]` 中 `<n>` 为通道号 {1|2}，默认 1；`[<n>]` 可省略（默认 CH1）。

## 连续波形频率设置范围

| 波形 | DG821/822 Pro | DG852 Pro | DG902 Pro | DG912 Pro | DG922 Pro |
|------|---------------|-----------|-----------|-----------|-----------|
| 正弦波 | 1 μHz~25 MHz | 1 μHz~50 MHz | 1 μHz~70 MHz | 1 μHz~150 MHz | 1 μHz~200 MHz |
| 方波 | 1 μHz~20 MHz | 1 μHz~40 MHz | 1 μHz~60 MHz | 1 μHz~60 MHz | 1 μHz~60 MHz |
| 锯齿波 | 1 μHz~1 MHz | 1 μHz~1 MHz | 1 μHz~3 MHz | 1 μHz~5 MHz | 1 μHz~5 MHz |
| 脉冲波 | 1 μHz~10 MHz | 1 μHz~25 MHz | 1 μHz~50 MHz | 1 μHz~50 MHz | 1 μHz~50 MHz |
| 任意波 | 1 μHz~10 MHz | 1 μHz~15 MHz | 1 μHz~30 MHz | 1 μHz~50 MHz | 1 μHz~50 MHz |
| 谐波 | 1 mHz~10 MHz | 1 mHz~25 MHz | 1 mHz~35 MHz | 1 mHz~75 MHz | 1 mHz~100 MHz |

## 幅度设置范围

| 频率 | 高阻 | 负载（50 Ω）|
|------|------|------------|
| [1 μHz,50 MHz] | 2 mVpp~20 Vpp | 1 mVpp~10 Vpp |
| (50 MHz,100 MHz] | 2 mVpp~10 Vpp | 1 mVpp~5 Vpp |
| (100 MHz,200 MHz] | 2 mVpp~4 Vpp | 1 mVpp~2 Vpp |

噪声幅度仅与阻抗有关：高阻 2 mVpp~4 Vpp；负载 1 mVpp~2 Vpp。

---

## AM 调制命令

[:SOURce\<n\>]:AM 系列命令用于设置/查询 AM 调制波形参数。

## [:SOURce\<n\>]:AM:DEPTh

**语法**: `[:SOURce[<n>]]:AM[:DEPTh] {<percent>|<lim>}` / `[:SOURce[<n>]]:AM[:DEPTh]? [<lim>]`
**描述**: 设置或查询 AM 调制深度。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<percent>` | 实型 | 0% 至 120% | 100% |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+01`（50%）。
**说明**: 0% 时输出幅度为载波幅度的二分之一；100% 时等于载波幅度；>100% 时上限受设备最大输出峰值限制。
**举例**: `:SOURce1:AM:DEPTh 50` / `:SOURce1:AM:DEPTh?`

## [:SOURce\<n\>]:AM:DSSC

**语法**: `[:SOURce[<n>]]:AM:DSSC <state>` / `[:SOURce[<n>]]:AM:DSSC?`
**描述**: 设置或查询 AM 载波抑制功能开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<state>` | 离散型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**举例**: `:SOURce1:AM:DSSC ON` / `:SOURce1:AM:DSSC?`

## [:SOURce\<n\>]:AM:INTernal:FREQuency

**语法**: `[:SOURce[<n>]]:AM:INTernal:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:AM:INTernal:FREQuency? [<lim_query>]`
**描述**: 设置或查询 AM 调制波的频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+02`（150 Hz）。
**说明**: 仅适用于内部调制源。
**举例**: `:SOURce1:AM:INTernal:FREQuency 150` / `:SOURce1:AM:INTernal:FREQuency?`

## [:SOURce\<n\>]:AM:INTernal:FUNCtion

**语法**: `[:SOURce[<n>]]:AM:INTernal:FUNCtion <function>` / `[:SOURce[<n>]]:AM:INTernal:FUNCtion?`
**描述**: 设置或查询 AM 调制波形。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<function>` | 离散型 | {SINusoid\|SQUare\|TRIangle\|RAMP\|NRAMp\|NOISe\|ARB} | SINusoid |
**返回格式**: 查询返回 SIN、SQU、TRI、RAMP、NRAM、NOIS 或 ARB。
**说明**:
- SINusoid 正弦波；SQUare 50% 占空比方波；TRIangle 50% 对称三角波；RAMP 100% 对称上锯齿波；NRAMp 0% 对称下锯齿波；NOISe 高斯白噪声；ARB 任意波。
- 仅适用于内部调制源。
**举例**: `:SOURce1:AM:INTernal:FUNCtion SQUare` / `:SOURce1:AM:INTernal:FUNCtion?`

## [:SOURce\<n\>]:AM:INTernal:FUNCtion:ARBitrary

**语法**: `[:SOURce[<n>]]:AM:INTernal:FUNCtion:ARBitrary <arb>` / `[:SOURce[<n>]]:AM:INTernal:FUNCtion:ARBitrary?`
**描述**: 设置或查询 AM 调制波类型（任意波）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb>` | 离散型 | 内置任意波类型清单（见下方说明） | SINC |
**返回格式**: 查询返回任意波类型，如 SINC。
**说明**: 当调制波形选择任意波时有效。内置任意波类型包括：ABSSINE, ABSSINEHALF, AMPALT, ATTALT, GAUSSPULSE, NEGRAMP, NPULSE, PPULSE, SINETRA, SINEVER, STAIRDN, STAIRUD, STAIRUP, TRAPEZIA, BANDLIMITED, BLASEIWAV, BUTTERWORTH, CHEBYSHEV1, CHEBYSHEV2, COMBIN, CPULSE, CWPULSE, DAMPEDOSC, DUALTONE, GAMMA, GATEVIBR, LFMPULSE, MCNOISE, NIMHDISCHARGE, PAHCUR, QUAKE, RADAR, RIPPLE, ROUNDHALF, STEPRESP, SWINGOSC, TV, VOICE, THREEAM, THREEFM, THREEPFM, THREEPM, THREEPWM, CARDIAC, EOG, EEG, EMG, PULSILOGRAM, RESSPEED, LFPULSE, TENS1, TENS2, TENS3, IGNITION, ISO167502SP, ISO167502VR, ISO76372TP1, ISO76372TP2A, ISO76372TP3A, ISO76372TP2B, ISO76372TP3B, ISO76372TP4, ISO76372TP5A, ISO76372TP5B, SCR, SURGE, AIRY, BESSELJ, BESSELY, CAUCHY, CUBIC, DIRICHLET, ERF, ERFC, ERFCINV, ERFINV, EXPFALL, EXPRISE, GAUSS, HAVERSINE, LAGUERRE, LAPLACE, LEGEND, LOG, LOGNORMAL, LORENTZ, MAXWELL, RAYLEIGH, VERSIERA, WEIBULL, X2DATA, COSH, COSINT, COT, COTHCON, COTHPRO, CSCCON, CSCPRO, CSCHCON, CSCHPRO, RECIPCON, RECIPPRO, SECCON, SECPRO, SECH, SINC, SINH, SININT, SQRT, TAN, TANH, ACOS, ACOSH, ACOTCON, ACOTPRO, ACOTHCON, ACOTHPRO, ACSCCON, ACSCPRO, ACSCHCON, ACSCHPRO, ASECCON, ASECPRO, ASECH, ASIN, ASINH, ATAN, ATANH, BARLETT, BARTHANN, BLACKMAN, BLACKMANH, BOHMANWIN, BOXCAR, CHEBWIN, FLATTOPWIN, HAMMING, HANNING, KAISER, NUTTALLWIN, PARZENWIN, TAYLORWIN, TRIANG, TUKEYWIN, ROUNDPM, ECG1~ECG15, MODBESSELI0, SPHBESSELJ1, SPHBESSELJ2, ARCHAV, ARCHCV, ACOT, NEGHALFSINE, POSHWRSINE, NEGHWRSINE, POSFWRSINE, NEGFWRSINE, 2NDOSR01~07, 2NDOIR01~07, DAMPEDSINE1/3/5, ISO167502VIT, ISO167502VRT, THREETONE, FOURTONE, FIVETONE, SIXTONE, SEVENTONE, EIGHTTONE, ISO167502LD1, ISO167502LD2, X3, POSRAMP, LOWERSEMICIRCLE, DISTORTION, GAUSSDERIV, GAUSSHERMITE1~4, GABOR1, GABOR3, LEGENDRE3~10, LAGUERRE2~9, CHEBYSHEV3~10, WEIERSTRASS, AIRYAI, AIRYBI, MATHIEU1/3/5, GAMMAINV, COSHC, SINHC, TANHC, TICK, CLAUSEN, PRBS9, PRBS11, PRBS15, PRBS16, PRBS20, PRBS21, PRBS23 等。
**举例**: `:SOURce1:AM:INTernal:FUNCtion:ARBitrary SINC` / `:SOURce1:AM:INTernal:FUNCtion:ARBitrary?`

## [:SOURce\<n\>]:AM:SOURce

**语法**: `[:SOURce[<n>]]:AM:SOURce <source>` / `[:SOURce[<n>]]:AM:SOURce?`
**描述**: 设置或查询 AM 调制信号源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal\|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 内部调制源（可用 AM:INTernal:FUNCtion 选波形）；EXTernal 外部调制源（从后面板 [AUX IN/OUT] 输入）。
**举例**: `:SOURce1:AM:SOURce INTernal` / `:SOURce1:AM:SOURce?`

## [:SOURce\<n\>]:AM:STATe

**语法**: `[:SOURce[<n>]]:AM:STATe <bool>` / `[:SOURce[<n>]]:AM:STATe?`
**描述**: 设置或查询 AM 调制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开调制功能时扫频、猝发或序列功能将自动关闭。AM 不能调制谐波、噪声、直流和脉冲。
**举例**: `:SOURce1:AM:STATe ON` / `:SOURce1:AM:STATe?`

---

## APPLy 命令

[:SOURce\<n\>]:APPLy 系列命令输出指定参数的标准波形。执行 APPLy 系列命令会自动将通道输出模式切换为连续波模式。

## [:SOURce\<n\>]:APPLy?

**语法**: `[:SOURce[<n>]]:APPLy?`
**描述**: 查询指定通道的波形参数。
**返回格式**: 返回带双引号的字符串（5 部分）："波形名称,频率,幅度,偏移,相位"（科学计数形式，单位 Hz/Vpp/Vdc/°；无的项用 DEF 代替）。例如 `"SIN,+5.000000000000000E+03,+3.0000000000000E+00,-3.0000000000000E+00,+4.0000000000000E+00"`。
**波形与返回名称对照**: 正弦波 SIN、方波 SQU、锯齿波 RAMP、脉冲 PULS、噪声 NOIS、直流 DC、谐波 HARM、任意波 ARB、序列 SEQ。
**举例**: `:SOURce1:APPLy?`

## [:SOURce\<n\>]:APPLy:ARBitrary

**语法**: `[:SOURce[<n>]]:APPLy:ARBitrary [{<frequency>|<lim_set>}[,{<amplitude>|<lim_set>}[,{<offset>|<lim_set>}[,{<phase>|<lim_set>}]]]]`
**描述**: 输出具有指定频率、幅度、偏移和相位的任意波。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围表 | 1 kHz |
| `<amplitude>` | 实型 | 见幅度范围表 | 5 Vpp |
| `<offset>` | 实型 | 受当前幅度限制 | 0 Vdc |
| `<phase>` | 实型 | -360° 至 360° | 0° |
| `<lim_set>` | 离散型 | {DEFault\|MINimum\|MAXimum} | - |
**返回格式**: 无
**举例**: `:SOURce1:APPLy:ARBitrary 100,1,2,1`

## [:SOURce\<n\>]:APPLy:DC

**语法**: `[:SOURce[<n>]]:APPLy:DC [{<frequency>|<lim_set>}[,{<amplitude>|<lim_set>}[,{<offset>|<lim_set>}[,{<phase>|<lim_set>}]]]]`
**描述**: 输出具有指定偏移的直流。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<offset>` | 实型 | 受阻抗设置限制 | 0 Vdc |
**返回格式**: 无
**说明**: 频率、相位和幅度不适用于 DC，但必须指定为占位符。
**举例**: `:SOURce1:APPLy:DC 100,5,1,90`（输出偏移 1Vdc 的直流）

## [:SOURce\<n\>]:APPLy:NOISe

**语法**: `[:SOURce[<n>]]:APPLy:NOISe [{<frequency>|<lim_set>}[,{<amplitude>|<lim_set>}[,{<offset>|<lim_set>}[,{<phase>|<lim_set>}]]]]`
**描述**: 输出具有指定幅度和偏移的噪声。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<amplitude>` | 实型 | 见幅度范围 | 5 Vpp |
| `<offset>` | 实型 | 受当前幅度限制 | 0 Vdc |
**返回格式**: 无
**说明**: 频率和相位不适用于噪声，但必须指定为占位符。
**举例**: `:SOURce1:APPLy:NOISe 100,2,1,90`

## [:SOURce\<n\>]:APPLy:PULSe

**语法**: `[:SOURce[<n>]]:APPLy:PULSe [{<frequency>|<lim_set>}[,{<amplitude>|<lim_set>}[,{<offset>|<lim_set>}[,{<phase>|<lim_set>}]]]]`
**描述**: 输出具有指定频率、幅度、偏移和相位的脉冲。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围 | 1 kHz |
| `<amplitude>` | 实型 | 见幅度范围 | 5 Vpp |
| `<offset>` | 实型 | 受当前幅度限制 | 0 Vdc |
| `<phase>` | 实型 | -360° 至 360° | 0° |
**返回格式**: 无
**举例**: `:SOURce1:APPLy:PULSe 100,3,2,1`

## [:SOURce\<n\>]:APPLy:RAMP

**语法**: `[:SOURce[<n>]]:APPLy:RAMP [{<frequency>|<lim_set>}[,{<amplitude>|<lim_set>}[,{<offset>|<lim_set>}[,{<phase>|<lim_set>}]]]]`
**描述**: 输出具有指定频率、幅度、偏移和相位的锯齿波（50% 对称性）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围 | 1 kHz |
| `<amplitude>` | 实型 | 见幅度范围 | 5 Vpp |
| `<offset>` | 实型 | 受当前幅度限制 | 0 Vdc |
| `<phase>` | 实型 | -360° 至 360° | 0° |
**返回格式**: 无
**说明**: 执行该命令会覆盖当前对称性设置，设为 50%。
**举例**: `:SOURce1:APPLy:RAMP 100,1,2,3`

## [:SOURce\<n\>]:APPLy:SINusoid

**语法**: `[:SOURce[<n>]]:APPLy:SINusoid [{<frequency>|<lim_set>}[,{<amplitude>|<lim_set>}[,{<offset>|<lim_set>}[,{<phase>|<lim_set>}]]]]`
**描述**: 输出具有指定频率、幅度、偏移和相位的正弦波。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围 | 1 kHz |
| `<amplitude>` | 实型 | 见幅度范围 | 5 Vpp |
| `<offset>` | 实型 | 受当前幅度限制 | 0 Vdc |
| `<phase>` | 实型 | -360° 至 360° | 0° |
**返回格式**: 无
**举例**: `:SOURce1:APPLy:SINusoid 100,3,2,1`

## [:SOURce\<n\>]:APPLy:SQUare

**语法**: `[:SOURce[<n>]]:APPLy:SQUare [{<frequency>|<lim_set>}[,{<amplitude>|<lim_set>}[,{<offset>|<lim_set>}[,{<phase>|<lim_set>}]]]]`
**描述**: 输出具有指定频率、幅度、偏移和相位的方波（50% 占空比）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围 | 1 kHz |
| `<amplitude>` | 实型 | 见幅度范围 | 5 Vpp |
| `<offset>` | 实型 | 受当前幅度限制 | 0 Vdc |
| `<phase>` | 实型 | -360° 至 360° | 0° |
**返回格式**: 无
**说明**: 执行该命令会覆盖当前占空比设置，设为 50%（实际占空比受频率限制）。
**举例**: `:SOURce1:APPLy:SQUare 100,5,0.5,3`

---

## ASK 调制命令

[:SOURce\<n\>]:ASKey 系列命令用于设置/查询 ASK 调制参数。

## [:SOURce\<n\>]:ASKey:AMPLitude

**语法**: `[:SOURce[<n>]]:ASKey:AMPLitude {<amplitude>|<lim_set>}` / `[:SOURce[<n>]]:ASKey:AMPLitude? [<lim_query>]`
**描述**: 设置或查询 ASK 调制幅度。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<amplitude>` | 实型 | 与当前基础波形幅度范围一致 | 2 Vpp |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+00`（1 Vpp）。
**说明**: ASK 调制时信号在载波幅度和调制幅度间移动输出幅度。
**举例**: `:SOURce1:ASKey:AMPLitude 1` / `:SOURce1:ASKey:AMPLitude?`

## [:SOURce\<n\>]:ASKey:INTernal:RATE

**语法**: `[:SOURce[<n>]]:ASKey:INTernal:RATE {<rate>|<lim>}` / `[:SOURce[<n>]]:ASKey:INTernal:RATE? [<lim>]`
**描述**: 设置或查询 ASK 调制速率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<rate>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+02`（150 Hz）。
**说明**: 仅适用于内部调制源。ASK 调制速率指输出幅度在载波幅度和调制幅度间"移动"的频率。
**举例**: `:SOURce1:ASKey:INTernal:RATE 150` / `:SOURce1:ASKey:INTernal:RATE?`

## [:SOURce\<n\>]:ASKey:POLarity

**语法**: `[:SOURce[<n>]]:ASKey:POLarity <polarity>` / `[:SOURce[<n>]]:ASKey:POLarity?`
**描述**: 设置或查询 ASK 调制极性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<polarity>` | 离散型 | {POSitive\|NEGative} | POSitive |
**返回格式**: 查询返回 POS 或 NEG。
**举例**: `:SOURce1:ASKey:POLarity NEGative` / `:SOURce1:ASKey:POLarity?`

## [:SOURce\<n\>]:ASKey:SOURce

**语法**: `[:SOURce[<n>]]:ASKey:SOURce <source>` / `[:SOURce[<n>]]:ASKey:SOURce?`
**描述**: 设置或查询 ASK 调制信号源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal\|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 选择内部调制源（占空比 50% 方波）；EXTernal 选择外部调制源（从后面板 [AUX IN/OUT] 输入）。
**举例**: `:SOURce1:ASKey:SOURce INTernal` / `:SOURce1:ASKey:SOURce?`

## [:SOURce\<n\>]:ASKey:STATe

**语法**: `[:SOURce[<n>]]:ASKey:STATe <bool>` / `[:SOURce[<n>]]:ASKey:STATe?`
**描述**: 设置或查询 ASK 调制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开调制功能时扫频、猝发或序列功能将自动关闭。ASK 不能调制谐波、噪声、直流和脉冲。
**举例**: `:SOURce1:ASKey:STATe ON` / `:SOURce1:ASKey:STATe?`

---

## BURSt 命令

[:SOURce\<n\>]:BURSt 系列命令用于设置猝发参数。

## [:SOURce\<n\>]:BURSt:GATE:POLarity

**语法**: `[:SOURce[<n>]]:BURSt:GATE:POLarity <polarity>` / `[:SOURce[<n>]]:BURSt:GATE:POLarity?`
**描述**: 设置或查询猝发波形的门控极性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<polarity>` | 离散型 | {NORMal\|INVerted} | NORMal |
**返回格式**: 查询返回 NORM 或 INV。
**说明**: 仅适用于门控猝发模式。NORMal 外部信号高 (低) 电平时门控为真 (假)；INVerted 相反。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:BURSt:GATE:POLarity NORMal` / `:SOURce1:BURSt:GATE:POLarity?`

## [:SOURce\<n\>]:BURSt:INTernal:PERiod

**语法**: `[:SOURce[<n>]]:BURSt:INTernal:PERiod {<seconds>|<lim>}` / `[:SOURce[<n>]]:BURSt:INTernal:PERiod? [<lim>]`
**描述**: 设置或查询内部触发 N 循环猝发的周期。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<seconds>` | 实型 | 4 μs 至 8000 s | 10 ms |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-01`（0.1 s）。
**说明**: 仅适用于内部触发的 N 循环猝发。猝发周期 ≥ ⌈(循环数×波形周期)÷6.4 ns⌉×6.4 ns + 4 μs。设置过小会自动增加。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:BURSt:INTernal:PERiod 0.1` / `:SOURce1:BURSt:INTernal:PERiod?`

## [:SOURce\<n\>]:BURSt:MODE

**语法**: `[:SOURce[<n>]]:BURSt:MODE <mode>` / `[:SOURce[<n>]]:BURSt:MODE?`
**描述**: 设置或查询猝发类型。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<mode>` | 离散型 | {TRIGgered\|GATed} | TRIGgered |
**返回格式**: 查询返回 TRIG 或 GAT。
**说明**: TRIGgered N 循环猝发；GATed 门控猝发。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:BURSt:MODE GATed` / `:SOURce1:BURSt:MODE?`

## [:SOURce\<n\>]:BURSt:NCYCles

**语法**: `[:SOURce[<n>]]:BURSt:NCYCles {<cycles>|<lim_set>}` / `[:SOURce[<n>]]:BURSt:NCYCles? [<lim_query>]`
**描述**: 设置或查询 N 循环猝发的循环次数。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<cycles>` | 整型 | 1 至 1,000,000 | 1 |
| `<lim_set>` | 离散型 | {INFinity\|MINimum\|MAXimum} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+02`（500）。
**说明**: N 循环模式下输出 1 至 1,000,000 次或无限循环 (INFinity) 的波形。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:BURSt:NCYCles 500` / `:SOURce1:BURSt:NCYCles?`

## [:SOURce\<n\>]:BURSt:PHASe

**语法**: `[:SOURce[<n>]]:BURSt:PHASe {<phase>|<lim>}` / `[:SOURce[<n>]]:BURSt:PHASe? [<lim>]`
**描述**: 设置或查询猝发波形的起始相位。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<phase>` | 实型 | -360° 至 360° | 0° |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+01`（10°）。
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:BURSt:PHASe 10` / `:SOURce1:BURSt:PHASe?`

## [:SOURce\<n\>]:BURSt:STATe

**语法**: `[:SOURce[<n>]]:BURSt:STATe <bool>` / `[:SOURce[<n>]]:BURSt:STATe?`
**描述**: 设置或查询猝发功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开猝发时调制、高级或扫频功能自动关闭。基础波频率 ≤ 125 μHz 时不允许开启猝发。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:BURSt:STATe ON` / `:SOURce1:BURSt:STATe?`

---

## FM 调制命令

[:SOURce\<n\>]:FM 系列命令用于设置/查询 FM 调制参数。

## [:SOURce\<n\>]:FM[:DEViation]

**语法**: `[:SOURce[<n>]]:FM[:DEViation] {<deviation>|<lim_set>}` / `[:SOURce[<n>]]:FM[:DEViation]? [<lim_query>]`
**描述**: 设置或查询 FM 频率偏移。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<deviation>` | 实型 | 见说明 | 100 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+02`（100 Hz）。
**说明**: 频率偏移指调制波形频率相对于载波频率的偏差。最小值 0 Hz；最大值受载波频率设置值和载波频率上限限制（频率偏移 ≤ 当前载波频率 - 1 μHz；频率偏移 ≤ 载波上限 - 载波频率设置值）。选择外部调制源时受后面板信号电平控制。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FM:DEViation 100` / `:SOURce1:FM:DEViation?`

## [:SOURce\<n\>]:FM:INTernal:FREQuency

**语法**: `[:SOURce[<n>]]:FM:INTernal:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:FM:INTernal:FREQuency? [<lim_query>]`
**描述**: 设置或查询 FM 调制频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+02`（150 Hz）。
**说明**: 仅适用于内部调制源。
**举例**: `:SOURce1:FM:INTernal:FREQuency 150` / `:SOURce1:FM:INTernal:FREQuency?`

## [:SOURce\<n\>]:FM:INTernal:FUNCtion

**语法**: `[:SOURce[<n>]]:FM:INTernal:FUNCtion <function>` / `[:SOURce[<n>]]:FM:INTernal:FUNCtion?`
**描述**: 设置或查询 FM 调制波形。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<function>` | 离散型 | {SINusoid\|SQUare\|TRIangle\|RAMP\|NRAMp\|NOISe\|ARB} | SINusoid |
**返回格式**: 查询返回 SIN、SQU、TRI、RAMP、NRAM、NOIS 或 ARB。
**说明**: FM 支持正弦波、50% 占空比方波、50% 对称三角波、100% 对称上锯齿波、0% 对称下锯齿波、高斯白噪声、任意波。仅适用于内部调制源。
**举例**: `:SOURce1:FM:INTernal:FUNCtion SQUare` / `:SOURce1:FM:INTernal:FUNCtion?`

## [:SOURce\<n\>]:FM:INTernal:FUNCtion:ARBitrary

**语法**: `[:SOURce[<n>]]:FM:INTernal:FUNCtion:ARBitrary <arb>` / `[:SOURce[<n>]]:FM:INTernal:FUNCtion:ARBitrary?`
**描述**: 设置或查询 FM 调制波类型（任意波）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb>` | 离散型 | 内置任意波类型清单（同 AM 的 ARBitrary 命令） | SINC |
**返回格式**: 查询返回任意波类型，如 SINC。
**说明**: 当调制波形选择任意波时有效。
**举例**: `:SOURce1:FM:INTernal:FUNCtion:ARBitrary SINC` / `:SOURce1:FM:INTernal:FUNCtion:ARBitrary?`

## [:SOURce\<n\>]:FM:SOURce

**语法**: `[:SOURce[<n>]]:FM:SOURce <source>` / `[:SOURce[<n>]]:FM:SOURce?`
**描述**: 设置或查询 FM 调制信号源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal\|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 内部调制源（可用 FM:INTernal:FUNCtion 选波形）；EXTernal 外部调制源（从后面板 [AUX IN/OUT] 输入）。
**举例**: `:SOURce1:FM:SOURce INTernal` / `:SOURce1:FM:SOURce?`

## [:SOURce\<n\>]:FM:STATe

**语法**: `[:SOURce[<n>]]:FM:STATe <bool>` / `[:SOURce[<n>]]:FM:STATe?`
**描述**: 设置或查询 FM 调制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 1 或 0。
**说明**: 打开调制功能时扫频、猝发或序列功能自动关闭。FM 不能调制谐波、噪声、直流和脉冲。
**举例**: `:SOURce1:FM:STATe ON` / `:SOURce1:FM:STATe?`

---

## FREQuency 命令

[:SOURce\<n\>]:FREQuency 系列命令用于设置输出频率和通道耦合模式。

## [:SOURce\<n\>]:FREQuency

**语法**: `[:SOURce[<n>]]:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:FREQuency? [<lim_query>]`
**描述**: 设置或查询连续波频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围表 | 1 kHz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+06`（1 MHz）。
**说明**: 不同波形的可设频率范围不同。波形类型改变时若频率在新波形下无效，仪器自动将频率设为新的波形类型频率上限值。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency 1000000` / `:SOURce1:FREQuency?`

## [:SOURce\<n\>]:FREQuency:CENTer

**语法**: `[:SOURce[<n>]]:FREQuency:CENTer {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:FREQuency:CENTer? [<lim_query>]`
**描述**: 设置或查询扫频功能的中心频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围 | 550 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+03`（5 kHz）。
**说明**: 通过中心频率和频率跨度设定扫频边界。中心频率 = (开始频率 + 结束频率)/2；频率跨度 = 结束频率 - 开始频率。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:CENTer 5000` / `:SOURce1:FREQuency:CENTer?`

## [:SOURce\<n\>]:FREQuency:COUPle:MODE

**语法**: `[:SOURce[<n>]]:FREQuency:COUPle:MODE <mode>` / `[:SOURce[<n>]]:FREQuency:COUPle:MODE?`
**描述**: 设置或查询频率耦合模式。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<mode>` | 离散型 | {OFFSet\|RATio} | RATio |
**返回格式**: 查询返回 OFFS 或 RAT。
**说明**: OFFSet 频率差值模式（用 FREQuency:COUPle:OFFSet 设差值）；RATio 频率比例模式（用 FREQuency:COUPle:RATio 设比例）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:COUPle:MODE OFFSet` / `:SOURce1:FREQuency:COUPle:MODE?`

## [:SOURce\<n\>]:FREQuency:COUPle:OFFSet

**语法**: `[:SOURce[<n>]]:FREQuency:COUPle:OFFSet <offset>` / `[:SOURce[<n>]]:FREQuency:COUPle:OFFSet?`
**描述**: 设置或查询频率耦合中的频率差值。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<offset>` | 实型 | 受基础波形类型和产品型号限制 | 0 |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-02`（10 mHz）。
**说明**: 修改耦合差值时若超出限制，信号发生器自动调整耦合差值以避免超限。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:COUPle:OFFSet 0.01` / `:SOURce1:FREQuency:COUPle:OFFSet?`

## [:SOURce\<n\>]:FREQuency:COUPle:RATio

**语法**: `[:SOURce[<n>]]:FREQuency:COUPle:RATio <ratio>` / `[:SOURce[<n>]]:FREQuency:COUPle:RATio?`
**描述**: 设置或查询频率耦合中的耦合比例。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<ratio>` | 实型 | 0.001 至 1000 | 1 |
**返回格式**: 以科学计数形式返回，如 `2.000000000000000E+00`（2）。
**说明**: 修改耦合比例时若超出限制，信号发生器自动调整波形频率以避免超限。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:COUPle:RATio 2` / `:SOURce1:FREQuency:COUPle:RATio?`

## [:SOURce\<n\>]:FREQuency:COUPle[:STATe]

**语法**: `[:SOURce[<n>]]:FREQuency:COUPle[:STATe] <bool>` / `[:SOURce[<n>]]:FREQuency:COUPle[:STATe]?`
**描述**: 设置或查询频率耦合功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: DG821 Pro 不支持频率耦合（除非安装双通道升级选件）。仅当两个通道均为连续波输出且波形为正弦波、方波或锯齿波时可开启频率耦合。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:COUPle:STATe ON` / `:SOURce1:FREQuency:COUPle:STATe?`

## [:SOURce\<n\>]:FREQuency:SPAN

**语法**: `[:SOURce[<n>]]:FREQuency:SPAN {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:FREQuency:SPAN? [<lim_query>]`
**描述**: 设置或查询扫频功能的频率跨度。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 受中心频率影响 | 900 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+8.000000000000000E+02`（800 Hz）。
**说明**: 通过中心频率和频率跨度设定扫频边界。中心频率 = (开始+结束)/2；频率跨度 = 结束-开始。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:SPAN 800` / `:SOURce1:FREQuency:SPAN?`

## [:SOURce\<n\>]:FREQuency:STARt

**语法**: `[:SOURce[<n>]]:FREQuency:STARt {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:FREQuency:STARt? [<lim_query>]`
**描述**: 设置或查询扫频功能的开始频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围 | 100 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+02`（100 Hz）。
**说明**: 开始频率和结束频率是频率扫描的上下限。仪器总是从开始频率扫到结束频率再返回。开始 < 结束：低频向高频扫描；开始 > 结束：高频向低频扫描；开始 = 结束：固定频率输出。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:STARt 100` / `:SOURce1:FREQuency:STARt?`

## [:SOURce\<n\>]:FREQuency:STOP

**语法**: `[:SOURce[<n>]]:FREQuency:STOP {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:FREQuency:STOP? [<lim_query>]`
**描述**: 设置或查询扫频功能的结束频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 见频率范围 | 1 kHz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+9.000000000000000E+02`（900 Hz）。
**说明**: 开始频率和结束频率是频率扫描的上下限。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FREQuency:STOP 900` / `:SOURce1:FREQuency:STOP?`

---

## FSK 调制命令

[:SOURce\<n\>]:FSKey 系列命令用于设置/查询 FSK 调制参数。

## [:SOURce\<n\>]:FSKey:FREQuency

**语法**: `[:SOURce[<n>]]:FSKey:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:FSKey:FREQuency? [<lim_query>]`
**描述**: 设置或查询 FSK 跳跃频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 当前所选载波波形频率范围 | 10 kHz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+03`（5 kHz）。
**说明**: FSK 调制时信号在载波频率和跳跃频率间"移动"输出频率。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FSKey:FREQuency 5000` / `:SOURce1:FSKey:FREQuency?`

## [:SOURce\<n\>]:FSKey:INTernal:RATE

**语法**: `[:SOURce[<n>]]:FSKey:INTernal:RATE {<rate>|<lim>}` / `[:SOURce[<n>]]:FSKey:INTernal:RATE? [<lim>]`
**描述**: 设置或查询 FSK 调制速率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<rate>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+02`（150 Hz）。
**说明**: 仅适用于内部调制源。FSK 调制速率指输出频率在载波频率和跳跃频率间"移动"的频率。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FSKey:INTernal:RATE 150` / `:SOURce1:FSKey:INTernal:RATE?`

## [:SOURce\<n\>]:FSKey:POLarity

**语法**: `[:SOURce[<n>]]:FSKey:POLarity <polarity>` / `[:SOURce[<n>]]:FSKey:POLarity?`
**描述**: 设置或查询 FSK 调制极性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<polarity>` | 离散型 | {POSitive\|NEGative} | POSitive |
**返回格式**: 查询返回 POS 或 NEG。
**说明**: POSitive 正极性；NEGative 负极性。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FSKey:POLarity NEGative` / `:SOURce1:FSKey:POLarity?`

## [:SOURce\<n\>]:FSKey:SOURce

**语法**: `[:SOURce[<n>]]:FSKey:SOURce <source>` / `[:SOURce[<n>]]:FSKey:SOURce?`
**描述**: 设置或查询 FSK 调制信号源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal\|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 内部调制源（占空比 50% 方波）；EXTernal 外部调制源（从后面板 [AUX IN/OUT] 输入）。
**举例**: `:SOURce1:FSKey:SOURce INTernal` / `:SOURce1:FSKey:SOURce?`

## [:SOURce\<n\>]:FSKey:STATe

**语法**: `[:SOURce[<n>]]:FSKey:STATe <bool>` / `[:SOURce[<n>]]:FSKey:STATe?`
**描述**: 设置或查询 FSK 调制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开调制功能时扫频、猝发或序列功能自动关闭。FSK 不能调制谐波、噪声、直流和脉冲。
**举例**: `:SOURce1:FSKey:STATe ON` / `:SOURce1:FSKey:STATe?`

---

## FUNCtion 命令

[:SOURce\<n\>]:FUNCtion 系列命令用于设置/查询任意波、脉冲波形、锯齿波、方波和序列波形的部分参数。

## [:SOURce\<n\>]:FUNCtion

**语法**: `[:SOURce[<n>]]:FUNCtion <shape>` / `[:SOURce[<n>]]:FUNCtion?`
**描述**: 设置或查询指定通道的连续波类型。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<shape>` | 离散型 | {SINusoid\|SQUare\|RAMP\|PULSe\|NOISe\|ARB\|HARMonic} | - |
**返回格式**: 查询返回波形名称，如 SQU。
**说明**: 参数可为正弦波、方波、锯齿波、脉冲、噪声、谐波和任意波。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion SQUare` / `:SOURce1:FUNCtion?`

## [:SOURce\<n\>]:FUNCtion:ARBitrary

**语法**: `[:SOURce[<n>]]:FUNCtion:ARBitrary <arb>` / `[:SOURce[<n>]]:FUNCtion:ARBitrary?`
**描述**: 设置或查询指定通道的任意波形类型（内置任意波）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb>` | 离散型 | 内置任意波类型清单 | - |
**返回格式**: 内置任意波返回波形名称；加载任意波文件时返回文件名。
**说明**: 该命令仅支持设置内置任意波类型，如需加载存储波形请使用 `:MMEMory:LOAD:DATA`。内置任意波类型除 AM 清单外还包括 DC。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:ARBitrary ABSSINE` / `:SOURce1:FUNCtion:ARBitrary?`

## [:SOURce\<n\>]:FUNCtion:PULSe:DCYCle

**语法**: `[:SOURce[<n>]]:FUNCtion:PULSe:DCYCle {<percent>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:PULSe:DCYCle? [<lim_query>]`
**描述**: 设置或查询脉冲波形的占空比。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<percent>` | 实型 | 0.01% 至 99.99% | 50% |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+4.500000000000000E+01`（45%）。
**说明**: 脉冲占空比定义为脉宽占脉冲周期的百分比。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:PULSe:DCYCle 45` / `:SOURce1:FUNCtion:PULSe:DCYCle?`

## [:SOURce\<n\>]:FUNCtion:PULSe:PERiod

**语法**: `[:SOURce[<n>]]:FUNCtion:PULSe:PERiod {<seconds>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:PULSe:PERiod? [<lim_query>]`
**描述**: 设置或查询脉冲波形的周期。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<seconds>` | 实型 | 见周期范围表 | 1 ms |
| `<lim_set>` | 离散型 | {MAXimum\|MINimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MAXimum\|MINimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-01`（0.1 s）。
**说明**: 周期和频率指定同一参数，最近执行的命令覆盖另一个。波形类型改变时若周期无效，仪器自动将周期设为新的波形类型周期下限值。仪器根据周期自动调整边沿时间和脉宽。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:PULSe:PERiod 0.1` / `:SOURce1:FUNCtion:PULSe:PERiod?`

## [:SOURce\<n\>]:FUNCtion:PULSe:TRANsition:LEADing

**语法**: `[:SOURce[<n>]]:FUNCtion:PULSe:TRANsition:LEADing {<seconds>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:PULSe:TRANsition:LEADing? [<lim_query>]`
**描述**: 设置或查询脉冲上升沿时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<seconds>` | 实型 | 3 ns 至 1 s | 3 ns |
| `<lim_set>` | 离散型 | {MAXimum\|MINimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MAXimum\|MINimum} | - |
**返回格式**: 以科学计数形式返回，如 `+3.500000000000000E-08`（35 ns）。
**说明**: 上升沿时间定义为脉冲电平从 10% 上升至 90% 所持续的时间。可设范围受当前波形频率和脉宽限制。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:PULSe:TRANsition:LEADing 0.000000035` / `:SOURce1:FUNCtion:PULSe:TRANsition:LEADing?`

## [:SOURce\<n\>]:FUNCtion:PULSe:TRANsition:TRAiling

**语法**: `[:SOURce[<n>]]:FUNCtion:PULSe:TRANsition:TRAiling {<seconds>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:PULSe:TRANsition:TRAiling? [<lim_query>]`
**描述**: 设置或查询脉冲下降沿时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<seconds>` | 实型 | 3 ns 至 1 s | 3 ns |
| `<lim_set>` | 离散型 | {MAXimum\|MINimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MAXimum\|MINimum} | - |
**返回格式**: 以科学计数形式返回，如 `+3.500000000000000E-08`（35 ns）。
**说明**: 下降沿时间定义为脉冲电平从 90% 下降至 10% 所持续的时间。可设范围受当前波形频率、脉宽和上升沿时间限制。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:PULSe:TRANsition:TRAiling 0.000000035` / `:SOURce1:FUNCtion:PULSe:TRANsition:TRAiling?`

## [:SOURce\<n\>]:FUNCtion:PULSe:WIDTh

**语法**: `[:SOURce[<n>]]:FUNCtion:PULSe:WIDTh {<seconds>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:PULSe:WIDTh? [<lim_query>]`
**描述**: 设置或查询脉冲脉宽。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<seconds>` | 实型 | 9 ns 至 999.9 ks | 500 μs |
| `<lim_set>` | 离散型 | {MAXimum\|MINimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MAXimum\|MINimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-02`（10 ms）。
**说明**: 脉宽定义为从脉冲上升沿 50% 处到下一个下降沿 50% 处的时间间隔。实际范围受脉冲周期限制：0.01%*T ≤ TW ≤ 99.99%*T。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:PULSe:WIDTh 0.01` / `:SOURce1:FUNCtion:PULSe:WIDTh?`

## [:SOURce\<n\>]:FUNCtion:RAMP:SYMMetry

**语法**: `[:SOURce[<n>]]:FUNCtion:RAMP:SYMMetry {<symmetry>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:RAMP:SYMMetry? [<lim_query>]`
**描述**: 设置或查询锯齿波对称性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<symmetry>` | 实型（此处原文参数名为 `<seconds>`） | 0.1% 至 99.9% | 50% |
| `<lim_set>` | 离散型 | {MAXimum\|MINimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MAXimum\|MINimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.500000000000000E+01`（55%）。
**说明**: 对称性定义为锯齿波波形处于上升期的时间所占周期的百分比。使用 APPLy:RAMP 输出锯齿波时覆盖当前对称性设为 50%。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:RAMP:SYMMetry 55` / `:SOURce1:FUNCtion:RAMP:SYMMetry?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:ARB:FILTer

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:ARB:FILTer <filter>` / `[:SOURce[<n>]]:FUNCtion:SEQuence:ARB:FILTer?`
**描述**: 设置或查询高级任意波形的滤波器模式。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<filter>` | 离散型 | {NORMal\|STEP\|INSert} | NORMal |
**返回格式**: 查询返回 NORM、STEP 或 INS。
**说明**: 普通模式 (NORMal)、步进模式 (STEP)、插值模式 (INSert)。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:ARB:FILTer STEP` / `:SOURce1:FUNCtion:SEQuence:ARB:FILTer?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:ARB:LOAD

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:ARB:LOAD <file_name>[,<separator>,<datatype>]`
**描述**: 在高级任意波输出模式下加载任意波文件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<file_name>` | ASCII 字符串 | 有效路径 | - |
| `<separator>` | 离散型 | {ENTer\|COMMa\|SEMicolon} | - |
| `<datatype>` | 离散型 | {NORM\|VOL} | - |
**返回格式**: 无
**说明**: 支持 *.arb、*.csv、*.txt。*.txt 必须指定分隔符和数据类型。DG800 Pro: 32 pts~2 Mpts（选配 8 Mpts/CH）；DG900 Pro: 32 pts~16 Mpts（选配 32 Mpts/CH）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:ARB:LOAD INT:\sinc.arb`

## [:SOURce\<n\>]:FUNCtion:SEQuence:ARB:SRATe

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:ARB:SRATe <sample_rate>` / `[:SOURce[<n>]]:FUNCtion:SEQuence:ARB:SRATe?`
**描述**: 设置或查询高级任意波的采样率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<sample_rate>` | 实型 | 1 μSa/s 至 312.5 MSa/s | 1 MSa/s |
**返回格式**: 以科学计数形式返回，如 `3.000000E+03`（3 kSa/s）。
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:ARB:SRATe 3000` / `:SOURce1:FUNCtion:SEQuence:ARB:SRATe?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:ARB:STATe

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:ARB:STATe <bool>` / `[:SOURce[<n>]]:FUNCtion:SEQuence:ARB:STATe?`
**描述**: 设置或查询高级模式下任意波开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开/关闭高级任意波时输出模式自动进入/退出高级输出模式。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:ARB:STATe 1` / `:SOURce1:FUNCtion:SEQuence:ARB:STATe?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:APPLy

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:APPLy` / `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:APPLy?`
**描述**: 应用指定通道序列的所有波形和循环次数设置；查询修改是否已应用。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| （无参数设置）；查询无参数 | | | |
**返回格式**: 查询返回 0 或 1。
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:APPLy` / `:SOURce1:FUNCtion:SEQuence:LIST:APPLy?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:CLEar

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:CLEar`
**描述**: 清除指定通道序列的所有波形和循环数数据。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| （无参数） | | | |
**返回格式**: 无
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:CLEar`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:FILTer

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:FILTer <filter>` / `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:FILTer?`
**描述**: 设置或查询序列波形的滤波器模式。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<filter>` | 离散型 | {INSert\|STEP\|NORMal} | NORMal |
**返回格式**: 查询返回 NORM、STEP 或 INS。
**说明**: 普通模式、步进模式、插值模式。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:FILTer STEP` / `:SOURce1:FUNCtion:SEQuence:LIST:FILTer?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:LENGth

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:LENGth <num>,{<value>|<lim>}` / `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:LENGth? {<num>|<all>}`
**描述**: 设置或查询序列波形指定条目的长度。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<num>` | 整型 | 1 至 64 | - |
| `<value>` | 整型 | 见说明 | - |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
| `<all>` | 离散型 | {ALL} | - |
**返回格式**: 查询指定条目返回整数；查询全部返回 64 个整数（逗号分隔）。
**说明**: 条目为存储波形时不支持设置长度。内建波形时可设：DG800 Pro 32 pts~2 Mpts（选配 8 Mpts/CH）；DG900 Pro 32 pts~16 Mpts（选配 32 Mpts/CH）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:LENGth 1,100` / `:SOURce1:FUNCtion:SEQuence:LIST:LENGth? 1`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:PERiod

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:PERiod <num>,{<value>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:PERiod? {<num>|<lim_query>}`
**描述**: 设置或查询序列波形中指定条目的循环次数。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<num>` | 整型 | 1 至 64 | - |
| `<value>` | 整型 | 0 至 256 | 1 |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum} | - |
| `<lim_query>` | 离散型 | {ALL} | - |
**返回格式**: 查询指定条目返回整数；查询全部 (ALL) 返回 64 个整数（逗号分隔）。
**说明**: MINimum/Maxium 表示循环次数最小/最大值；ALL 表示查询全部条目。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:PERiod 1,10` / `:SOURce1:FUNCtion:SEQuence:LIST:PERiod? 1`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:SRATe

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:SRATe {<sample_rate>|<lim>}` / `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:SRATe? [<lim>]`
**描述**: 设置或查询序列波形的采样率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<sample_rate>` | 实型 | 1 μSa/s 至 312.5 MSa/s | 1 MSa/s |
| `<lim>` | 离散型 | {MAXimum\|MINimum} | - |
**返回格式**: 以科学计数形式返回，如 `3.00000000000000E+03`（3 kSa/s）。
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:SRATe 3000` / `:SOURce1:FUNCtion:SEQuence:LIST:SRATe?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:STATe

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:STATe <bool>` / `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:STATe?`
**描述**: 设置或查询高级输出模式下序列开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {ON\|1\|OFF\|0} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开/关闭高级任意波、序列功能时输出模式自动进入/退出高级输出模式。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:STATe ON` / `:SOURce1:FUNCtion:SEQuence:LIST:STATe?`

## [:SOURce\<n\>]:FUNCtion:SEQuence:LIST:WAVE

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:WAVE <num>,{<wavename>|<file_path>}[,<separator>,<datatype>]` / `[:SOURce[<n>]]:FUNCtion:SEQuence:LIST:WAVE? {<num>|<lim>}`
**描述**: 设置或查询序列波形中指定条目的波形（内建波形或存储波形）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<num>` | 整型 | 1 至 64 | - |
| `<wavename>` | 离散型 | 内建波形清单（含 SIN/SQU/RAMP/NOISe + 内置任意波） | - |
| `<file_path>` | ASCII 字符串 | 有效文件名 | - |
| `<separator>` | 离散型 | {ENTer\|COMMa\|SEMicolon} | - |
| `<datatype>` | 离散型 | {NORM\|VOL} | - |
| `<lim>` | 离散型 | {ALL} | - |
**返回格式**: 查询指定条目返回内建波形类型或存储波形文件名；查询全部 (ALL) 返回 64 个条目波形类型。
**说明**: 支持 *.arb、*.csv、*.txt。*.txt 必须指定分隔符和数据类型。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SEQuence:LIST:WAVE 1,SQU` / `:SOURce1:FUNCtion:SEQuence:LIST:WAVE? 1`

## [:SOURce\<n\>]:FUNCtion:SEQuence[:STATe]

**语法**: `[:SOURce[<n>]]:FUNCtion:SEQuence[:STATe] <bool>` / `[:SOURce[<n>]]:FUNCtion:SEQuence[:STATe]?`
**描述**: 设置或查询高级模式开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 离散型 | {ON\|1\|OFF\|0} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开/关闭任意一个通道的高级模式时，另一通道的高级模式也同步打开/关闭。
**举例**: `:SOURce1:FUNCtion:SEQuence:STATe ON` / `:SOURce1:FUNCtion:SEQuence:STATe?`

## [:SOURce\<n\>]:FUNCtion:SQUare:DCYCle

**语法**: `[:SOURce[<n>]]:FUNCtion:SQUare:DCYCle {<percent>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:SQUare:DCYCle? [<lim_query>]`
**描述**: 设置或查询方波占空比。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<percent>` | 实型 | 0.01% 至 99.99% | 50% |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+4.500000000000000E+01`（45%）。
**说明**: 占空比方波高电平持续时间占周期的百分比。使用 APPLy:SQUare 输出方波时覆盖当前占空比设为 50%。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SQUare:DCYCle 45` / `:SOURce1:FUNCtion:SQUare:DCYCle?`

## [:SOURce\<n\>]:FUNCtion:SQUare:PERiod

**语法**: `[:SOURce[<n>]]:FUNCtion:SQUare:PERiod {<seconds>|<lim_set>}` / `[:SOURce[<n>]]:FUNCtion:SQUare:PERiod? [<lim_query>]`
**描述**: 设置或查询方波周期。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<seconds>` | 实型 | 见周期范围表 | 1 ms |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+00`（1 s）。
**说明**: 波形类型改变时若周期无效，仪器自动将周期设为新的波形类型周期下限值。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:FUNCtion:SQUare:PERiod 1` / `:SOURce1:FUNCtion:SQUare:PERiod?`

---

## HARMonic 命令

[:SOURce\<n\>]:HARMonic 系列命令用于设置/查询谐波参数。

## [:SOURce\<n\>]:HARMonic:COMBine

**语法**: `[:SOURce[<n>]]:HARMonic:COMBine <user>` / `[:SOURce[<n>]]:HARMonic:COMBine?`
**描述**: 设置或查询谐波组合。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<user>` | ASCII 字符串 | X0000000000000000000 至 X1111111111111111111 | X0000000000000000000 |
**返回格式**: 查询返回 X0000000000000000000 至 X1111111111111111111 之间的字符串。
**说明**: 20 位二进制数据分别代表 20 次谐波输出状态。最左侧位表示基波（固定为 X），后面 19 位从左到右为 2~20 次谐波。1 打开相应次谐波，0 关闭。仅谐波类型为混合 (COMBine) 时有效。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:HARMonic:COMBine X0010001000000000000` / `:SOURce1:HARMonic:COMBine?`

## [:SOURce\<n\>]:HARMonic:COMBine:AMPLitude

**语法**: `[:SOURce[<n>]]:HARMonic:COMBine:AMPLitude <sn>,{<amplitude>|<lim_set>}` / `[:SOURce[<n>]]:HARMonic:COMBine:AMPLitude? {<sn>|<all>}[,<lim_query>]`
**描述**: 设置或查询混合谐波功能中指定谐波分量的幅度。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<sn>` | 整型 | 2 至 20 | - |
| `<amplitude>` | 实型 | 受阻抗和频率限制 | 5 Vpp |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<all>` | 离散型 | {ALL} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 查询指定谐波以科学计数形式返回；查询全部 (ALL) 返回全部谐波幅度（逗号分隔）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:HARMonic:COMBine:AMPLitude 5,1` / `:SOURce1:HARMonic:COMBine:AMPLitude? 5`

## [:SOURce\<n\>]:HARMonic:COMBine:PHASe

**语法**: `[:SOURce[<n>]]:HARMonic:COMBine:PHASe <sn>,{<phase>|<lim_set>}` / `[:SOURce[<n>]]:HARMonic:COMBine:PHASe? {<sn>|<all>}[,<lim_query>]`
**描述**: 设置或查询混合谐波功能中指定谐波分量的相位。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<sn>` | 整型 | 2 至 20 | - |
| `<phase>` | 实型 | 0° 至 360° | 0° |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<all>` | 离散型 | {ALL} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 查询指定谐波返回相位（如 10.000000）；查询全部返回全部谐波相位（逗号分隔）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:HARMonic:COMBine:PHASe 5,10` / `:SOURce1:HARMonic:COMBine:PHASe? 5`

## [:SOURce\<n\>]:HARMonic:ORDer

**语法**: `[:SOURce[<n>]]:HARMonic:ORDer {<value>|<lim_set>}` / `[:SOURce[<n>]]:HARMonic:ORDer? [<lim_query>]`
**描述**: 设置或查询次序谐波功能的谐波次数。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<value>` | 整型 | 2 至 20 | 2 |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 查询返回整数，如 10。
**说明**: 基波频率最大值 Ffund = (2×Fmax÷N)。仅谐波类型为次序谐波 (ORDer) 时有效。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:HARMonic:ORDer 10` / `:SOURce1:HARMonic:ORDer?`

## [:SOURce\<n\>]:HARMonic:ORDer:AMPLitude

**语法**: `[:SOURce[<n>]]:HARMonic:ORDer:AMPLitude {<amplitude>|<lim_set>}` / `[:SOURce[<n>]]:HARMonic:ORDer:AMPLitude? [<lim_query>]`
**描述**: 设置或查询次序谐波功能中谐波分量的幅度。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<amplitude>` | 实型 | 受阻抗和频率限制 | 5 Vpp |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `1.000000E+00`（1 Vpp）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:HARMonic:ORDer:AMPLitude 1` / `:SOURce1:HARMonic:ORDer:AMPLitude?`

## [:SOURce\<n\>]:HARMonic:ORDer:PHASe

**语法**: `[:SOURce[<n>]]:HARMonic:ORDer:PHASe {<phase>|<lim_set>}` / `[:SOURce[<n>]]:HARMonic:ORDer:PHASe? [<lim_query>]`
**描述**: 设置或查询次序谐波功能中谐波分量的相位。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<phase>` | 实型 | 0° 至 360° | 0° |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 查询返回实数，如 10.000000（10°）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:HARMonic:ORDer:PHASe 10` / `:SOURce1:HARMonic:ORDer:PHASe?`

## [:SOURce\<n\>]:HARMonic[:TYPE]

**语法**: `[:SOURce[<n>]]:HARMonic[:TYPE] <type>` / `[:SOURce[<n>]]:HARMonic[:TYPE]?`
**描述**: 设置或查询谐波类型。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {ORDer\|COMBine} | ORDer |
**返回格式**: 查询返回 ORD 或 COMB。
**说明**: ORDer 次序谐波（只输出基波和单次谐波）；COMBine 混合谐波（可输出包含多次谐波，最高 20 次）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:HARMonic:TYPE ORDer` / `:SOURce1:HARMonic:TYPE?`

---

## [:SOURce\<n\>]:MARKer:FREQuency

**语法**: `[:SOURce[<n>]]:MARKer:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:MARKer:FREQuency? [<lim_query>]`
**描述**: 设置或查询标记频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 在起始频率和终止频率之间 | 550 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+02`（500 Hz）。
**说明**: 标记频率必须在起始频率和终止频率之间。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:MARKer:FREQuency 500` / `:SOURce1:MARKer:FREQuency?`

---

## [:SOURce\<n\>]:PARameter:COPY

**语法**: `[:SOURce[<n>]]:PARameter:COPY <ch>`
**描述**: 复制指定通道（源通道）的状态信息至目标通道，或交换两个通道的状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<ch>` | 离散型 | {CH1\|CH2\|SWAP} | - |
**返回格式**: 无
**说明**: CH1/CH2 设置目标通道（`<n>` 为源通道，二者不能相同）；SWAP 交换通道 1 和通道 2 的状态。DG821 Pro 不支持通道复制（除非安装双通道升级选件）。可复制的状态不包括通道输出开关状态。通道跟踪开启时不支持。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PARameter:COPY SWAP`

---

## PHASe 命令

[:SOURce\<n\>]:PHASe 系列命令用于设置/查询波形起始相位，执行同相位操作，设置相位耦合。

## [:SOURce\<n\>]:PHASe

**语法**: `[:SOURce[<n>]]:PHASe {<phase>|<lim_set>}` / `[:SOURce[<n>]]:PHASe? [<lim_query>]`
**描述**: 设置或查询波形（基础波形和任意波）的起始相位。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<phase>` | 实型 | -360° 至 360° | 0° |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+01`（50°）。
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PHASe 50` / `:SOURce1:PHASe?`

## [:SOURce\<n\>]:PHASe:COUPle:MODE

**语法**: `[:SOURce[<n>]]:PHASe:COUPle:MODE <mode>` / `[:SOURce[<n>]]:PHASe:COUPle:MODE?`
**描述**: 设置或查询相位耦合模式。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<mode>` | 离散型 | {OFFSet\|RATio} | RATio |
**返回格式**: 查询返回 OFFS 或 RAT。
**说明**: OFFSet 相位差值模式（用 PHASe:COUPle:OFFSet 设差值）；RATio 相位比例模式（用 PHASe:COUPle:RATio 设比例）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PHASe:COUPle:MODE OFFSet` / `:SOURce1:PHASe:COUPle:MODE?`

## [:SOURce\<n\>]:PHASe:COUPle:OFFSet

**语法**: `[:SOURce[<n>]]:PHASe:COUPle:OFFSet <offset>` / `[:SOURce[<n>]]:PHASe:COUPle:OFFSet?`
**描述**: 设置或查询相位耦合中的相位差值。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<offset>` | 实型 | -360° 至 360° | 0° |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+02`（100°）。
**说明**: 修改耦合差值超出限制时仪器自动调整耦合差值。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PHASe:COUPle:OFFSet 100` / `:SOURce1:PHASe:COUPle:OFFSet?`

## [:SOURce\<n\>]:PHASe:COUPle:RATio

**语法**: `[:SOURce[<n>]]:PHASe:COUPle:RATio <ratio>` / `[:SOURce[<n>]]:PHASe:COUPle:RATio?`
**描述**: 设置或查询相位耦合中的耦合比例。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<ratio>` | 实型 | 0.01 至 100 | 1 |
**返回格式**: 以科学计数形式返回，如 `+2.000000000000000E+00`（2）。
**说明**: 修改耦合比例超出限制时仪器自动调整波形相位。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PHASe:COUPle:RATio 2` / `:SOURce1:PHASe:COUPle:RATio?`

## [:SOURce\<n\>]:PHASe:COUPle[:STATe]

**语法**: `[:SOURce[<n>]]:PHASe:COUPle[:STATe] <bool>` / `[:SOURce[<n>]]:PHASe:COUPle[:STATe]?`
**描述**: 设置或查询相位耦合功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: DG821 Pro 不支持相位耦合（除非安装双通道升级选件）。仅当两个通道均为连续波输出且波形为正弦波、方波或锯齿波时可开启相位耦合。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PHASe:COUPle:STATe ON` / `:SOURce1:PHASe:COUPle:STATe?`

## [:SOURce\<n\>]:PHASe:SYNChronize

**语法**: `[:SOURce[<n>]]:PHASe:SYNChronize`
**描述**: 执行一次同相位操作。
**参数**: 无（`<n>` 默认 1）
**返回格式**: 无
**说明**: 同相位操作只针对连续波模式以及内部触发源的猝发和扫频输出模式。DG821 Pro 不支持同相位操作（除非安装双通道升级选件）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PHASe:SYNChronize`

---

## PM 调制命令

[:SOURce\<n\>]:PM 系列命令用于设置/查询 PM 调制参数。

## [:SOURce\<n\>]:PM:DEViation

**语法**: `[:SOURce[<n>]]:PM:DEViation {<deviation>|<lim_set>}` / `[:SOURce[<n>]]:PM:DEViation? [<lim_query>]`
**描述**: 设置或查询 PM 相位偏差。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<deviation>` | 实型 | 0° 至 360° | 90° |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+01`（50°）。
**说明**: 相位偏差指调制波形相位相对于载波相位的变化。选择外部调制源时受后面板信号电平控制。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PM:DEViation 50` / `:SOURce1:PM:DEViation?`

## [:SOURce\<n\>]:PM:INTernal:FREQuency

**语法**: `[:SOURce[<n>]]:PM:INTernal:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:PM:INTernal:FREQuency? [<lim_query>]`
**描述**: 设置或查询 PM 调制频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+02`（150 Hz）。
**说明**: 仅适用于内部调制源。
**举例**: `:SOURce1:PM:INTernal:FREQuency 150` / `:SOURce1:PM:INTernal:FREQuency?`

## [:SOURce\<n\>]:PM:INTernal:FUNCtion

**语法**: `[:SOURce[<n>]]:PM:INTernal:FUNCtion <function>` / `[:SOURce[<n>]]:PM:INTernal:FUNCtion?`
**描述**: 设置或查询 PM 调制波形。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<function>` | 离散型 | {SINusoid\|SQUare\|TRIangle\|RAMP\|NRAMp\|NOISe\|ARB} | SINusoid |
**返回格式**: 查询返回 SIN、SQU、TRI、RAMP、NRAM、NOIS 或 ARB。
**说明**: PM 支持正弦波、50% 占空比方波、50% 对称三角波、100% 对称上锯齿波、0% 对称下锯齿波、高斯白噪声、任意波。仅适用于内部调制源。
**举例**: `:SOURce1:PM:INTernal:FUNCtion SQUare` / `:SOURce1:PM:INTernal:FUNCtion?`

## [:SOURce\<n\>]:PM:INTernal:FUNCtion:ARBitrary

**语法**: `[:SOURce[<n>]]:PM:INTernal:FUNCtion:ARBitrary <arb>` / `[:SOURce[<n>]]:PM:INTernal:FUNCtion:ARBitrary?`
**描述**: 设置或查询 PM 调制波类型（任意波）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb>` | 离散型 | 内置任意波类型清单（同 AM 的 ARBitrary 命令） | SINC |
**返回格式**: 查询返回任意波类型，如 SINC。
**说明**: 当调制波形选择任意波时有效。
**举例**: `:SOURce1:PM:INTernal:FUNCtion:ARBitrary SINC` / `:SOURce1:PM:INTernal:FUNCtion:ARBitrary?`

## [:SOURce\<n\>]:PM:SOURce

**语法**: `[:SOURce[<n>]]:PM:SOURce <source>` / `[:SOURce[<n>]]:PM:SOURce?`
**描述**: 设置或查询 PM 调制信号源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal\|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 内部调制源（可用 PM:INTernal:FUNCtion 选波形）；EXTernal 外部调制源（从后面板 [AUX IN/OUT] 输入）。
**举例**: `:SOURce1:PM:SOURce INTernal` / `:SOURce1:PM:SOURce?`

## [:SOURce\<n\>]:PM:STATe

**语法**: `[:SOURce[<n>]]:PM:STATe <bool>` / `[:SOURce[<n>]]:PM:STATe?`
**描述**: 设置或查询 PM 调制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开调制功能时扫频、猝发或序列功能自动关闭。PM 不能调制谐波、噪声、直流和脉冲。
**举例**: `:SOURce1:PM:STATe ON` / `:SOURce1:PM:STATe?`

---

## PSK 调制命令

[:SOURce\<n\>]:PSKey 系列命令用于设置/查询 PSK 调制参数。

## [:SOURce\<n\>]:PSKey:INTernal:RATE

**语法**: `[:SOURce[<n>]]:PSKey:INTernal:RATE {<rate>|<lim>}` / `[:SOURce[<n>]]:PSKey:INTernal:RATE? [<lim>]`
**描述**: 设置或查询 PSK 调制速率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<rate>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+02`（150 Hz）。
**说明**: 仅适用于内部调制源。PSK 调制速率指输出相位在载波相位和调制相位间"移动"的频率。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PSKey:INTernal:RATE 150` / `:SOURce1:PSKey:INTernal:RATE?`

## [:SOURce\<n\>]:PSKey:PHASe

**语法**: `[:SOURce[<n>]]:PSKey:PHASe {<phase>|<lim_set>}` / `[:SOURce[<n>]]:PSKey:PHASe? [<lim_query>]`
**描述**: 设置或查询 PSK 调制相位。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<phase>` | 实型 | 0° 至 360° | 180° |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+9.000000000000000E+01`（90°）。
**说明**: PSK 调制时信号在载波相位和调制相位两个预设相位间"移动"输出相位。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PSKey:PHASe 90` / `:SOURce1:PSKey:PHASe?`

## [:SOURce\<n\>]:PSKey:POLarity

**语法**: `[:SOURce[<n>]]:PSKey:POLarity <polarity>` / `[:SOURce[<n>]]:PSKey:POLarity?`
**描述**: 设置或查询 PSK 调制极性。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<polarity>` | 离散型 | {POSitive\|NEGative} | POSitive |
**返回格式**: 查询返回 POS 或 NEG。
**说明**: POSitive 正极性；NEGative 负极性。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PSKey:POLarity NEGative` / `:SOURce1:PSKey:POLarity?`

## [:SOURce\<n\>]:PSKey:SOURce

**语法**: `[:SOURce[<n>]]:PSKey:SOURce <source>` / `[:SOURce[<n>]]:PSKey:SOURce?`
**描述**: 设置或查询 PSK 调制信号源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal\|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 内部调制源（占空比 50% 方波）；EXTernal 外部调制源（从后面板 [AUX IN/OUT] 输入）。
**举例**: `:SOURce1:PSKey:SOURce INTernal` / `:SOURce1:PSKey:SOURce?`

## [:SOURce\<n\>]:PSKey:STATe

**语法**: `[:SOURce[<n>]]:PSKey:STATe <bool>` / `[:SOURce[<n>]]:PSKey:STATe?`
**描述**: 设置或查询 PSK 调制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开调制功能时扫频、猝发或序列功能自动关闭。PSK 不能调制谐波、噪声、直流和脉冲。
**举例**: `:SOURce1:PSKey:STATe ON` / `:SOURce1:PSKey:STATe?`

---

## PWM 调制命令

[:SOURce\<n\>]:PWM 系列命令用于设置/查询 PWM 调制参数。

## [:SOURce\<n\>]:PWM:DEViation

**语法**: `[:SOURce[<n>]]:PWM:DEViation {<deviation>|<lim_set>}` / `[:SOURce[<n>]]:PWM:DEViation? [<lim_query>]`
**描述**: 设置或查询 PWM 调制宽度偏差。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<deviation>` | 实型 | 受脉冲宽度、最小脉冲宽度和边沿时间限制 | 10 μs |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-04`（100 μs）。
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PWM:DEViation 0.0001` / `:SOURce1:PWM:DEViation?`

## [:SOURce\<n\>]:PWM:DEViation:DCYCle

**语法**: `[:SOURce[<n>]]:PWM:DEViation:DCYCle {<percent>|<lim_set>}` / `[:SOURce[<n>]]:PWM:DEViation:DCYCle? [<lim_query>]`
**描述**: 设置或查询 PWM 调制占空比偏差。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<percent>` | 实型 | 受占空比、最小占空比和边沿时间限制 | 1% |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+01`（15%）。
**说明**: 省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PWM:DEViation:DCYCle 15` / `:SOURce1:PWM:DEViation:DCYCle?`

## [:SOURce\<n\>]:PWM:INTernal:FREQuency

**语法**: `[:SOURce[<n>]]:PWM:INTernal:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:PWM:INTernal:FREQuency? [<lim_query>]`
**描述**: 设置或查询 PWM 调制波的频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.500000000000000E+05`（150 kHz）。
**说明**: 仅适用于内部调制源。
**举例**: `:SOURce1:PWM:INTernal:FREQuency 150000` / `:SOURce1:PWM:INTernal:FREQuency?`

## [:SOURce\<n\>]:PWM:INTernal:FUNCtion

**语法**: `[:SOURce[<n>]]:PWM:INTernal:FUNCtion <function>` / `[:SOURce[<n>]]:PWM:INTernal:FUNCtion?`
**描述**: 设置或查询 PWM 调制波形。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<function>` | 离散型 | {SINusoid\|SQUare\|TRIangle\|RAMP\|NRAMp\|NOISe\|ARB} | SINusoid |
**返回格式**: 查询返回 SIN、SQU、RAMP、NRAM、TRI、NOIS 或 ARB。
**说明**: PWM 支持正弦波、50% 占空比方波、50% 对称三角波、100% 对称上锯齿波、0% 对称下锯齿波、高斯白噪声、任意波。仅适用于内部调制源。
**举例**: `:SOURce1:PWM:INTernal:FUNCtion SQUare` / `:SOURce1:PWM:INTernal:FUNCtion?`

## [:SOURce\<n\>]:PWM:INTernal:FUNCtion:ARBitrary

**语法**: `[:SOURce[<n>]]:PWM:INTernal:FUNCtion:ARBitrary <arb>` / `[:SOURce[<n>]]:PWM:INTernal:FUNCtion:ARBitrary?`
**描述**: 设置或查询 PWM 调制波类型（任意波）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb>` | 离散型 | 内置任意波类型清单（同 AM 的 ARBitrary 命令） | SINC |
**返回格式**: 查询返回任意波类型，如 SINC。
**说明**: 当调制波形选择任意波时有效。
**举例**: `:SOURce1:PWM:INTernal:FUNCtion:ARBitrary SINC` / `:SOURce1:PWM:INTernal:FUNCtion:ARBitrary?`

## [:SOURce\<n\>]:PWM:SOURce

**语法**: `[:SOURce[<n>]]:PWM:SOURce <source>` / `[:SOURce[<n>]]:PWM:SOURce?`
**描述**: 设置或查询 PWM 调制信号源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal\|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 内部调制源（可用 PWM:INTernal:FUNCtion 选波形）；EXTernal 外部调制源（从后面板 [AUX IN/OUT] 输入）。
**举例**: `:SOURce1:PWM:SOURce EXTernal` / `:SOURce1:PWM:SOURce?`

## [:SOURce\<n\>]:PWM:STATe

**语法**: `[:SOURce[<n>]]:PWM:STATe <bool>` / `[:SOURce[<n>]]:PWM:STATe?`
**描述**: 设置或查询 PWM 调制功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: PWM 的载波波形只能是脉冲波（指定通道当前波形为脉冲波时才可打开 PWM）。打开调制功能时扫频、猝发或序列功能自动关闭。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:PWM:STATe ON` / `:SOURce1:PWM:STATe?`

---

## SUM 命令（波形叠加）

[:SOURce\<n\>]:SUM 系列命令用于设置/查询波形叠加相关参数。

## [:SOURce\<n\>]:SUM:AMPLitude

**语法**: `[:SOURce[<n>]]:SUM:AMPLitude {<amplitude>|<lim_set>}` / `[:SOURce[<n>]]:SUM:AMPLitude? [<lim_query>]`
**描述**: 设置或查询波形叠加功能的叠加比例。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<amplitude>` | 实型 | 0% 至 100% | 50% |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+01`（50%）。
**说明**: 叠加比例指叠加在基本波上的波形与基本波幅度的百分比，受当前载波幅度和最大幅度限制。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SUM:AMPLitude 50` / `:SOURce1:SUM:AMPLitude?`

## [:SOURce\<n\>]:SUM:INTernal:FREQuency

**语法**: `[:SOURce[<n>]]:SUM:INTernal:FREQuency {<frequency>|<lim_set>}` / `[:SOURce[<n>]]:SUM:INTernal:FREQuency? [<lim_query>]`
**描述**: 设置或查询波形叠加功能的叠加频率。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<frequency>` | 实型 | 2 mHz 至 1 MHz | 100 Hz |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E+02`（100 Hz）。
**说明**: 叠加频率指叠加到基本波上的波形的频率。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SUM:INTernal:FREQuency 100` / `:SOURce1:SUM:INTernal:FREQuency?`

## [:SOURce\<n\>]:SUM:INTernal:FUNCtion

**语法**: `[:SOURce[<n>]]:SUM:INTernal:FUNCtion <function>` / `[:SOURce[<n>]]:SUM:INTernal:FUNCtion?`
**描述**: 设置或查询波形叠加功能的叠加波形。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<function>` | 离散型 | {SINusoid\|SQUare\|TRIangle\|RAMP\|NRAMp\|NOISe\|ARB} | SINusoid |
**返回格式**: 查询返回 SIN、SQU、RAMP、NRAM、TRI、NOIS 或 ARB。
**说明**: SUM 支持正弦波、50% 占空比方波、50% 对称三角波、100% 对称上锯齿波、0% 对称下锯齿波、高斯白噪声、任意波。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SUM:INTernal:FUNCtion SQUare` / `:SOURce1:SUM:INTernal:FUNCtion?`

## [:SOURce\<n\>]:SUM:INTernal:FUNCtion:ARBitrary

**语法**: `[:SOURce[<n>]]:SUM:INTernal:FUNCtion:ARBitrary <arb>` / `[:SOURce[<n>]]:SUM:INTernal:FUNCtion:ARBitrary?`
**描述**: 设置或查询叠加波形（任意波）。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<arb>` | 离散型 | 内置任意波类型清单（同 AM 的 ARBitrary 命令） | SINC |
**返回格式**: 查询返回任意波类型，如 SINC。
**说明**: 当叠加波形选择任意波时有效。
**举例**: `:SOURce1:SUM:INTernal:FUNCtion:ARBitrary SINC` / `:SOURce1:SUM:INTernal:FUNCtion:ARBitrary?`

## [:SOURce\<n\>]:SUM:STATe

**语法**: `[:SOURce[<n>]]:SUM:STATe <bool>` / `[:SOURce[<n>]]:SUM:STATe?`
**描述**: 设置或查询波形叠加功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 波形叠加是指在基本波（正弦波、方波、锯齿波、任意波（除 DC））上叠加指定波形后再输出。打开波形叠加功能时扫频、猝发或序列功能自动关闭。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SUM:STATe ON` / `:SOURce1:SUM:STATe?`

---

## SWEep 命令

[:SOURce\<n\>]:SWEep 系列命令用于设置/查询扫频输出相关参数。

## [:SOURce\<n\>]:SWEep:HTIMe:STARt

**语法**: `[:SOURce[<n>]]:SWEep:HTIMe:STARt {<time>|<lim_set>}` / `[:SOURce[<n>]]:SWEep:HTIMe:STARt? [<lim_query>]`
**描述**: 设置或查询扫频功能的起始保持时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<time>` | 实型 | 0 s 至 3600 s | 0 s |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-03`（1 ms）。
**说明**: 实际可设最大值受扫频类型、触发源、返回时间、扫描时间和终止保持时间的限制。记 TP = 扫描时间+起始保持时间+返回时间+终止保持时间：线性扫频内部触发源 TP+1 ms ≤ 8,000 s，手动/外部触发源 TP ≤ 250,000 s；对数/步进扫频 TP ≤ 500 s。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SWEep:HTIMe:STARt 0.001` / `:SOURce1:SWEep:HTIMe:STARt?`

## [:SOURce\<n\>]:SWEep:HTIMe[:STOP]

**语法**: `[:SOURce[<n>]]:SWEep:HTIMe[:STOP] {<time>|<lim_set>}` / `[:SOURce[<n>]]:SWEep:HTIMe[:STOP]? [<lim_query>]`
**描述**: 设置或查询扫频功能的终止保持时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<time>` | 实型 | 0 s 至 3600 s | 0 s |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-03`（1 ms）。
**说明**: 实际可设最大值限制同起始保持时间。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SWEep:HTIMe:STOP 0.001` / `:SOURce1:SWEep:HTIMe:STOP?`

## [:SOURce\<n\>]:SWEep:RTIMe

**语法**: `[:SOURce[<n>]]:SWEep:RTIMe {<time>|<lim_set>}` / `[:SOURce[<n>]]:SWEep:RTIMe? [<lim_query>]`
**描述**: 设置或查询扫频功能的返回时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<time>` | 实型 | 0 s 至 3600 s | 0 s |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.000000000000000E-03`（1 ms）。
**说明**: 实际可设最大值限制同起始保持时间。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SWEep:RTIMe 0.001` / `:SOURce1:SWEep:RTIMe?`

## [:SOURce\<n\>]:SWEep:SPACing

**语法**: `[:SOURce[<n>]]:SWEep:SPACing <type>` / `[:SOURce[<n>]]:SWEep:SPACing?`
**描述**: 设置或查询扫频类型。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {LINear\|LOGarithmic\|STEP} | LINear |
**返回格式**: 查询返回 LIN、LOG 或 STEP。
**说明**: LINear 线性扫频；LOGarithmic 对数扫频；STEP 步进扫频。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SWEep:SPACing LINear` / `:SOURce1:SWEep:SPACing?`

## [:SOURce\<n\>]:SWEep:STATe

**语法**: `[:SOURce[<n>]]:SWEep:STATe <bool>` / `[:SOURce[<n>]]:SWEep:STATe?`
**描述**: 设置或查询扫频功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 打开扫频功能时调制、序列或猝发功能自动关闭。基础波形为谐波、噪声、直流或脉冲时不能打开扫频功能。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SWEep:STATe ON` / `:SOURce1:SWEep:STATe?`

## [:SOURce\<n\>]:SWEep:STEP

**语法**: `[:SOURce[<n>]]:SWEep:STEP {<step>|<lim>}` / `[:SOURce[<n>]]:SWEep:STEP? [<lim>]`
**描述**: 设置或查询扫频步进数。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<step>` | 整型 | 2 至 1024 | 2 |
| `<lim>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+02`（500）。
**说明**: 步进数指完成从开始频率变化至结束频率扫描所需的步数，仅适用于步进扫频。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SWEep:STEP 500` / `:SOURce1:SWEep:STEP?`

## [:SOURce\<n\>]:SWEep:TIME

**语法**: `[:SOURce[<n>]]:SWEep:TIME {<time>|<lim_set>}` / `[:SOURce[<n>]]:SWEep:TIME? [<lim_query>]`
**描述**: 设置或查询扫频时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<time>` | 实型 | 1 ms 至 250,000 s | 1 s |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+00`（5 s）。
**说明**: 实际可设最大值受扫频类型、起始/终止保持时间、触发源和返回时间的限制。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:SWEep:TIME 5` / `:SOURce1:SWEep:TIME?`

---

## [:SOURce\<n\>][:TRACe]:DATA:DAC16

**语法**: `[:SOURce[<n>]][:TRACe]:DATA:DAC16 <type>,<flag>,<data>`
**描述**: 将任意波数据下载到指定通道的易失性存储器中。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<type>` | 离散型 | {CODE\|VOLTage\|BIN} | - |
| `<flag>` | 离散型 | {HEADer\|CONTinue\|END} | - |
| `<data>` | ASCII 字符串或 IEEE 488.2 block | 见说明 | - |
**返回格式**: 无
**说明**:
- `<type>`：CODE 波点数据（整型 -32768~+32767）；VOLTage 电压数据（浮点型，归一化）；BIN 二进制码值。
- `<flag>`：HEADer 开始；CONTinue 继续；END 结束。
- 建议每次发送 20 KB 以内。DG800 Pro 最大 2 Mpts（选配 8 Mpts/CH）；DG900 Pro 最大 16 Mpts（选配 32 Mpts/CH）。
- 波表数据设置在指定通道序列的第一个条目下。建议用 `*OPC?` 查询确保下载完成。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:TRACe:DATA:DAC16 CODE,END,10,20,30,...`

---

## [:SOURce\<n\>]:TRACk

**语法**: `[:SOURce[<n>]]:TRACk <track>` / `[:SOURce[<n>]]:TRACk?`
**描述**: 设置或查询通道跟踪功能的状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<track>` | 离散型 | {ON\|OFF\|INVerted} | OFF |
**返回格式**: 查询返回 ON、OFF 或 INV。
**说明**:
- ON：开启跟踪（自动将通道参数/状态复制到另一通道，双通道输出相同信号）。
- OFF：关闭跟踪。
- INVerted：跟踪开启但目标通道输出极性与基准通道相反。
- DG821 Pro 不支持通道跟踪（除非安装双通道升级选件）。序列模式、频率计或前端子同步输出功能开启时跟踪被禁用。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:TRACk ON` / `:SOURce1:TRACk?`

---

## VOLTage 命令

[:SOURce\<n\>]:VOLTage 系列命令用于设置/查询幅度耦合、波形幅度、高/低电平、偏移电压以及幅度单位。

## [:SOURce\<n\>]:VOLTage

**语法**: `[:SOURce[<n>]]:VOLTage {<amplitude>|<lim_set>}` / `[:SOURce[<n>]]:VOLTage? [<lim_query>]`
**描述**: 设置或查询输出振幅。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<amplitude>` | 实型 | 见幅度范围表 | 5 Vpp |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+2.500000000000000E+00`（2.5 Vpp）。
**说明**: 幅度最大值受阻抗和频率设置值限制，输出幅度最大值 ≤ (Vppmax - 2*|Voffset|)。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage 2.5` / `:SOURce1:VOLTage?`

## [:SOURce\<n\>]:VOLTage:COUPle:MODE

**语法**: `[:SOURce[<n>]]:VOLTage:COUPle:MODE <mode>` / `[:SOURce[<n>]]:VOLTage:COUPle:MODE?`
**描述**: 设置或查询幅度耦合模式。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<mode>` | 离散型 | {OFFSet\|RATio} | RATio |
**返回格式**: 查询返回 OFFS 或 RAT。
**说明**: OFFSet 幅度差值模式（用 VOLTage:COUPle:OFFSet 设差值）；RATio 幅度比例模式（用 VOLTage:COUPle:RATio 设比例）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:COUPle:MODE OFFSet` / `:SOURce1:VOLTage:COUPle:MODE?`

## [:SOURce\<n\>]:VOLTage:COUPle:OFFSet

**语法**: `[:SOURce[<n>]]:VOLTage:COUPle:OFFSet <voltage>` / `[:SOURce[<n>]]:VOLTage:COUPle:OFFSet?`
**描述**: 设置或查询幅度耦合中的幅度差值。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<voltage>` | 实型 | -20 Vpp 至 +20 Vpp | 0 Vpp |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E+00`（5 Vpp）。
**说明**: 修改耦合差值超出限制时仪器自动调整耦合差值。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:COUPle:OFFSet 5` / `:SOURce1:VOLTage:COUPle:OFFSet?`

## [:SOURce\<n\>]:VOLTage:COUPle:RATio

**语法**: `[:SOURce[<n>]]:VOLTage:COUPle:RATio <ratio>` / `[:SOURce[<n>]]:VOLTage:COUPle:RATio?`
**描述**: 设置或查询幅度耦合中的耦合比例。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<ratio>` | 实型 | 0.001 至 1000 | 1 |
**返回格式**: 以科学计数形式返回，如 `+2.000000000000000E+00`（2）。
**说明**: 修改耦合比例超出限制时仪器自动调整波形幅度。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:COUPle:RATio 2` / `:SOURce1:VOLTage:COUPle:RATio?`

## [:SOURce\<n\>]:VOLTage:COUPle[:STATe]

**语法**: `[:SOURce[<n>]]:VOLTage:COUPle[:STATe] <bool>` / `[:SOURce[<n>]]:VOLTage:COUPle[:STATe]?`
**描述**: 设置或查询幅度耦合功能的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0\|1\|OFF\|ON} | 0\|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: DG821 Pro 不支持幅度耦合（除非安装双通道升级选件）。仅当两个通道均为连续波输出且波形为正弦波、方波、锯齿波、噪声或任意波（除 DC）时可开启幅度耦合。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:COUPle:STATe ON` / `:SOURce1:VOLTage:COUPle:STATe?`

## [:SOURce\<n\>]:VOLTage:HIGH

**语法**: `[:SOURce[<n>]]:VOLTage:HIGH {<voltage>|<lim_set>}` / `[:SOURce[<n>]]:VOLTage:HIGH? [<lim_query>]`
**描述**: 设置或查询高电平。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<voltage>` | 实型 | 见说明 | 2.5 V |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+2.000000000000000E+00`（2 V）。
**说明**: |高电平| ≤ Vppmax/2，且 Vppmin ≤ (高电平-低电平) ≤ Vppmax。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:HIGH 2` / `:SOURce1:VOLTage:HIGH?`

## [:SOURce\<n\>]:VOLTage:LOW

**语法**: `[:SOURce[<n>]]:VOLTage:LOW {<voltage>|<lim_set>}` / `[:SOURce[<n>]]:VOLTage:LOW? [<lim_query>]`
**描述**: 设置或查询低电平。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<voltage>` | 实型 | 见说明 | -2.5 V |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `-1.000000000000000E+00`（-1 V）。
**说明**: |低电平| ≤ Vppmax/2，且 Vppmin ≤ (高电平-低电平) ≤ Vppmax。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:LOW -1` / `:SOURce1:VOLTage:LOW?`

## [:SOURce\<n\>]:VOLTage:OFFSet

**语法**: `[:SOURce[<n>]]:VOLTage:OFFSet {<voltage>|<lim_set>}` / `[:SOURce[<n>]]:VOLTage:OFFSet? [<lim_query>]`
**描述**: 设置或查询偏移电压。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<voltage>` | 实型 | 受幅度设置值影响 | 0 Vdc |
| `<lim_set>` | 离散型 | {MINimum\|MAXimum\|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum\|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+5.000000000000000E-01`（0.5 Vdc）。
**说明**: |偏移值|*2 与当前幅度设置值之和不能超出幅度上限。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:OFFSet 0.5` / `:SOURce1:VOLTage:OFFSet?`

## [:SOURce\<n\>]:VOLTage:UNIT

**语法**: `[:SOURce[<n>]]:VOLTage:UNIT <unit>` / `[:SOURce[<n>]]:VOLTage:UNIT?`
**描述**: 设置或查询幅度单位。
| `<unit>` | 离散型 | {VPP|VRMS|DBM} | VPP |
**返回格式**: 查询返回 VPP、VRMS 或 DBM。
**说明**: VPP 峰峰值；VRMS 有效值；DBM 功率绝对值（输出阻抗为高阻时不能使用 dBm）。省略 `[<n>]` 默认 CH1。
**举例**: `:SOURce1:VOLTage:UNIT VPP` / `:SOURce1:VOLTage:UNIT?`

---

# 12. :SYSTem 命令子系统

用于设置或查询系统参数。

## :SYSTem:BEEPer[:IMMediate]

**语法**: `:SYSTem:BEEPer[:IMMediate]`
**描述**: 蜂鸣器立即蜂鸣一次。
**参数**: 无
**返回格式**: 无
**说明**: 不考虑蜂鸣器当前开关状态。即使已关闭蜂鸣器，发送该命令蜂鸣器也将立即蜂鸣一次。
**举例**: `:SYSTem:BEEPer:IMMediate`

## :SYSTem:BEEPer:STATe

**语法**: `:SYSTem:BEEPer:STATe <state>` / `:SYSTem:BEEPer:STATe?`
**描述**: 设置或查询蜂鸣器的开关状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<state>` | 布尔型 | {0|1|OFF|ON} | 1|ON |
**返回格式**: 查询返回 1 或 0。
**举例**: `:SYSTem:BEEPer:STATe 1` / `:SYSTem:BEEPer:STATe?`

## :SYSTem:DATE

**语法**: `:SYSTem:DATE <yyyy>,<mm>,<dd>` / `:SYSTem:DATE?`
**描述**: 设置或查询系统日期。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<yyyy>` | 整型 | 1970 至 2037 | - |
| `<mm>` | 整型 | 01 至 12 | - |
| `<dd>` | 整型 | 01 至 31 | - |
**返回格式**: 查询以字符串形式返回（年月日以 "-" 隔开），如 `2022-05-01`。
**举例**: `:SYSTem:DATE 2022,05,01` / `:SYSTem:DATE?`

## :SYSTem:COMMunicate:LAN:CONTrol?

**语法**: `:SYSTem:COMMunicate:LAN:CONTrol?`
**描述**: 读取用于套接字通信的初始控制连接端口号。
**参数**: 无
**返回格式**: 查询返回端口号，若接口不支持套接字则返回 0。
**举例**: `:SYSTem:COMMunicate:LAN:CONTrol?` — 返回 5000

## :SYSTem:COMMunicate:LAN:DHCP[:STATe]

**语法**: `:SYSTem:COMMunicate:LAN:DHCP[:STATe] <bool>` / `:SYSTem:COMMunicate:LAN:DHCP[:STATe]?`
**描述**: 设置或查询 DHCP 模式是否开启。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0|1|OFF|ON} | 1|ON |
**返回格式**: 查询返回 0 或 1。
**说明**: DHCP 模式下由网络中 DHCP 服务器分配 IP 等网络参数。三种 IP 配置模式均设为"打开"时优先级从高到低为动态配置、自动设置、手动设置。三种模式不能同时设为"关闭"。发送该命令后必须执行 `:SYSTem:COMMunicate:LAN:UPDate` 应用设置。
**举例**: `:SYSTem:COMMunicate:LAN:DHCP:STATe ON` / `:SYSTem:COMMunicate:LAN:DHCP:STATe?`

## :SYSTem:COMMunicate:LAN:DNS

**语法**: `:SYSTem:COMMunicate:LAN:DNS <dns>` / `:SYSTem:COMMunicate:LAN:DNS?`
**描述**: 设置或查询 DNS 地址。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<dns>` | ASCII 字符串 | nnn.nnn.nnn.nnn 格式 | - |
**返回格式**: 返回 DNS 地址，如 `172.16.3.2`。
**说明**: 当 IP 配置模式为静态 IP 且 DHCP 和自动 IP 处于关闭状态时才会使用设置的 DNS 地址。发送后必须执行 LAN:UPDate。
**举例**: `:SYSTem:COMMunicate:LAN:DNS 172.16.3.2` / `:SYSTem:COMMunicate:LAN:DNS?`

## :SYSTem:COMMunicate:LAN:DOMain?

**语法**: `:SYSTem:COMMunicate:LAN:DOMain?`
**描述**: 查询域名。
**参数**: 无
**返回格式**: 查询返回一个字符串。
**举例**: `:SYSTem:COMMunicate:LAN:DOMain?`

## :SYSTem:COMMunicate:LAN:GATeway

**语法**: `:SYSTem:COMMunicate:LAN:GATeway <gateway>` / `:SYSTem:COMMunicate:LAN:GATeway?`
**描述**: 设置或查询默认网关。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<gateway>` | ASCII 字符串 | nnn.nnn.nnn.nnn 格式 | - |
**返回格式**: 查询返回一个字符串，如 `172.16.3.1`。
**说明**: 当 IP 配置模式为静态 IP 且 DHCP 和自动 IP 处于关闭状态时才会使用设置的默认网关。发送后必须执行 LAN:UPDate。
**举例**: `:SYSTem:COMMunicate:LAN:GATeway 172.16.3.1` / `:SYSTem:COMMunicate:LAN:GATeway?`

## :SYSTem:COMMunicate:LAN:HOSTname

**语法**: `:SYSTem:COMMunicate:LAN:HOSTname <name>` / `:SYSTem:COMMunicate:LAN:HOSTname?`
**描述**: 设置或查询主机名。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<name>` | ASCII 字符串 | 最多 15 个字符，必须以字母开头 | - |
**返回格式**: 查询返回一个字符串。
**举例**: `:SYSTem:COMMunicate:LAN:HOSTname RIGOL123` / `:SYSTem:COMMunicate:LAN:HOSTname?`

## :SYSTem:COMMunicate:LAN:IPADdress

**语法**: `:SYSTem:COMMunicate:LAN:IPADdress <ip>` / `:SYSTem:COMMunicate:LAN:IPADdress?`
**描述**: 设置或查询 IP 地址。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<ip>` | ASCII 字符串 | nnn.nnn.nnn.nnn 格式 | - |
**返回格式**: 返回 IP 地址，如 `172.16.3.128`。
**说明**: 当 IP 配置模式为静态 IP 且 DHCP 和自动 IP 处于关闭状态时才会使用设置的 IP 地址。发送后必须执行 LAN:UPDate。
**举例**: `:SYSTem:COMMunicate:LAN:IPADdress 172.16.3.128` / `:SYSTem:COMMunicate:LAN:IPADdress?`

## :SYSTem:COMMunicate:LAN:MAC?

**语法**: `:SYSTem:COMMunicate:LAN:MAC?`
**描述**: 查询 MAC 地址。
**参数**: 无
**返回格式**: 返回 MAC 地址，如 `00:2A:A0:AA:E0:56`。
**举例**: `:SYSTem:COMMunicate:LAN:MAC?`

## :SYSTem:COMMunicate:LAN:SMASk

**语法**: `:SYSTem:COMMunicate:LAN:SMASk <submask>` / `:SYSTem:COMMunicate:LAN:SMASk?`
**描述**: 设置或查询子网掩码。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<submask>` | ASCII 字符串 | nnn.nnn.nnn.nnn 格式 | - |
**返回格式**: 返回子网掩码，如 `255.255.255.0`。
**说明**: 当 IP 配置模式为静态 IP 且 DHCP 和自动 IP 处于关闭状态时才会使用设置的子网掩码。发送后必须执行 LAN:UPDate。
**举例**: `:SYSTem:COMMunicate:LAN:SMASk 255.255.255.0` / `:SYSTem:COMMunicate:LAN:SMASk?`

## :SYSTem:COMMunicate:LAN:UPDate

**语法**: `:SYSTem:COMMunicate:LAN:UPDate`
**描述**: 将对 LAN 设置所做的所有更改存储到非易失性存储器中，并用已更新的设置重新启动 LAN 驱动程序。
**参数**: 无
**返回格式**: 无
**说明**: 更改 DHCP、DNS、网关、IP 地址和子网掩码的设置后必须发送该命令。请在发送前完成对 LAN 设置的所有更改。
**举例**: `:SYSTem:COMMunicate:LAN:UPDate`

## :SYSTem:COMMunicate:USB:INFormation?

**语法**: `:SYSTem:COMMunicate:USB:INFormation?`
**描述**: 查询仪器的 USB-TMC 信息。
**参数**: 无
**返回格式**: 查询返回一个字符串，如 `USB0::0x1AB1::0x052::DG80000000001::INSTR`。
**举例**: `:SYSTem:COMMunicate:USB:INFormation?`

## :SYSTem:ERRor?

**语法**: `:SYSTem:ERRor?`
**描述**: 查询并清除错误队列中的一条错误消息。
**参数**: 无
**返回格式**: 查询返回一个字符串，由错误消息编号和内容两部分组成（逗号隔号），内容部分为带双引号的字符串。如 `-109,"Missing parameter"`。
**说明**: 读取错误队列时错误会被清除。也可用 `*CLS` 或开关仪器清除错误队列。
**举例**: `:SYSTem:ERRor?`

## :SYSTem:KLOCk

**语法**: `:SYSTem:KLOCk <bool>` / `:SYSTem:KLOCk?`
**描述**: 设置或查询前面板全部按键的锁定状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0|1|OFF|ON} | 0|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: ON|1 锁定全部按键；OFF|0 解除全部按键锁定。
**举例**: `:SYSTem:KLOCk ON` / `:SYSTem:KLOCk?`

## :SYSTem:LANGuage

**语法**: `:SYSTem:LANGuage <language>` / `:SYSTem:LANGuage?`
**描述**: 设置或查询系统语言。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<language>` | 离散型 | {SCHinese|TCHinese|ENGLish} | - |
**返回格式**: 查询返回 SCH、TCH 或 ENGL。
**说明**: 支持简体中文 (SCHinese)、繁体中文 (TCHinese) 和英文 (ENGLish)。语言设置不受 `*RST` 影响。
**举例**: `:SYSTem:LANGuage ENGLish` / `:SYSTem:LANGuage?`

## :SYSTem:LICense:CATalog?

**语法**: `:SYSTem:LICense:CATalog?`
**描述**: 查询当前已激活的选件。
**参数**: 无
**返回格式**: 查询返回已激活的选件，如 `"CHD,MEM"`。
**举例**: `:SYSTem:LICense:CATalog?`

## :SYSTem:LICense:DELete

**语法**: `:SYSTem:LICense:DELete <name>`
**描述**: 删除已安装的选件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<name>` | 离散型 | {CHD|MEM} | - |
**返回格式**: 无
**说明**: CHD 双通道升级选件（仅 DG821 Pro）；MEM 存储深度升级选件（DG800 Pro 默认 2 Mpts/CH 可升至 8 Mpts/CH；DG900 Pro 默认 16 Mpts/CH 可升至 32 Mpts/CH）。
**举例**: `:SYSTem:LICense:DELete MEM`

## :SYSTem:LICense:DELete:ALL

**语法**: `:SYSTem:LICense:DELete:ALL`
**描述**: 删除所有已安装的选件。
**参数**: 无
**返回格式**: 无
**举例**: `:SYSTem:LICense:DELete:ALL`

## :SYSTem:LICense:INSTall

**语法**: `:SYSTem:LICense:INSTall "<license>"`
**描述**: 通过选件授权码安装选件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<license>` | ASCII 字符串 | 有效授权码 | - |
**返回格式**: 无
**说明**: 需先订购选件获取密匙，登录 RIGOL 官网获取选件授权码。授权码为一段长度固定的文本。

## :SYSTem:LICense:INSTall:UDISk

**语法**: `:SYSTem:LICense:INSTall:UDISk "<path>"`
**描述**: 通过选件授权文件安装选件。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<path>` | ASCII 字符串 | 有效路径（含 .lic 扩展名） | - |
**返回格式**: 无
**说明**: 需先订购选件获取密匙，登录 RIGOL 官网获取选件授权文件并下载至 U 盘。路径如 `"USB:/rigol/license.lic"`。
**举例**: `:SYSTem:LICense:INSTall:UDISk "USB:/rigol/license.lic"`

## :SYSTem:PSTatus

**语法**: `:SYSTem:PSTatus <power>` / `:SYSTem:PSTatus?`
**描述**: 设置或查询仪器的电源状态。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<power>` | 离散型 | {DEFault|OPEN} | OPEN |
**返回格式**: 查询返回 DEF 或 OPEN。
**说明**: DEFault 通电后需按前面板电源键开机；OPEN 通电后直接开机。
**举例**: `:SYSTem:PSTatus DEFault` / `:SYSTem:PSTatus?`

## :SYSTem:TIME

**语法**: `:SYSTem:TIME <hour>,<minute>,<second>` / `:SYSTem:TIME?`
**描述**: 设置或查询系统时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<hour>` | 整型 | 0 至 23 | - |
| `<minute>` | 整型 | 0 至 59 | - |
| `<second>` | 整型 | 0 至 59 | - |
**返回格式**: 查询以字符串形式返回系统时间，如 `16:10:17`。
**说明**: 由于命令响应时间等因素，返回值相对当前值可能有一定延时。
**举例**: `:SYSTem:TIME 16,10,17` / `:SYSTem:TIME?`

## :SYSTem:TOUCh

**语法**: `:SYSTem:TOUCh <bool>` / `:SYSTem:TOUCh?`
**描述**: 设置或查询触摸屏是否使能。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<bool>` | 布尔型 | {0|1|OFF|ON} | 0|OFF |
**返回格式**: 查询返回 0 或 1。
**说明**: 1/ON 使能触摸屏；0/OFF 禁用触摸屏。
**举例**: `:SYSTem:TOUCh OFF` / `:SYSTem:TOUCh?`

## :SYSTem:VERSion?

**语法**: `:SYSTem:VERSion?`
**描述**: 查询系统的 SCPI 版本号。
**参数**: 无
**返回格式**: 返回字符串（格式 YYYY.V），如 `1994.0`。
**举例**: `:SYSTem:VERSion?`

## :SYSTem:ROSCillator:SOURce

**语法**: `:SYSTem:ROSCillator:SOURce <source>` / `:SYSTem:ROSCillator:SOURce?`
**描述**: 设置或查询系统时钟源。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {INTernal|EXTernal} | INTernal |
**返回格式**: 查询返回 INT 或 EXT。
**说明**: INTernal 内部时钟源；EXTernal 外部时钟源（从后面板 [10MHz In/Out] 输入）。选择外部源时系统检测是否有有效外部时钟信号输入，未检测到则切换成内部。
**举例**: `:SYSTem:ROSCillator:SOURce INTernal` / `:SYSTem:ROSCillator:SOURce?`

---

# 13. :TRIGger 命令子系统

用于设置或查询触发方式、触发延迟、触发周期、触发边沿、触发计数等。`:TRIGger<n>` 中 `<n>` 为通道号 {1|2}，默认 1。

## :TRIGger<n>:COUNt

**语法**: `:TRIGger<n>:COUNt {<count>|<lim_set>}` / `:TRIGger<n>:COUNt? [<lim_query>]`
**描述**: 设置或查询触发计数。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<count>` | 整数 | 1 至 1,000,000 | 1 |
| `<lim_set>` | 离散型 | {MINimum|MAXimum|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum|MAXimum} | - |
**返回格式**: 查询返回整数。
**说明**: 触发计数设置每次触发事件后有效输出的信号周期数，完成后触发系统进入"空闲状态"。仅远程模式下可设置。仅当 `:INITiate[<n>]:CONTinuous` 设置为 0|OFF 时有效。
**举例**: `:TRIGger1:COUNt 100` / `:TRIGger1:COUNt?`

## :TRIGger<n>:DELay

**语法**: `:TRIGger<n>:DELay {<seconds>|<lim_set>}` / `:TRIGger<n>:DELay? [<lim_query>]`
**描述**: 设置或查询触发延迟。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<seconds>` | 实型 | 见说明 | 0 s |
| `<lim_set>` | 离散型 | {MINimum|MAXimum|DEFault} | - |
| `<lim_query>` | 离散型 | {MINimum|MAXimum} | - |
**返回格式**: 以科学计数形式返回，如 `+1.050000000000000E-01`（105 ms）。
**说明**: 触发延时仅适用于 N 循环猝发模式。手动/外部触发源：0 s 至 20 s。内部触发源：0 s 至 (Tburst - ⌈Twave×Ncycle÷6.4 ns⌉×6.4 ns - 4 μs)，且不大于 20 s。
**举例**: `:TRIGger1:DELay 0.105` / `:TRIGger1:DELay?`

## :TRIGger<n>[:IMMediate]

**语法**: `:TRIGger<n>[:IMMediate]`
**描述**: 在指定通道产生一次触发。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<n>` | 离散型 | {1|2} | 1 |
**返回格式**: 无
**说明**: 仅适用于手动触发（`:TRIGger<n>:SOURce`）的猝发模式和扫频模式。如果对应通道输出没有打开，触发将被忽略。
**举例**: `:TRIGger1:IMMediate`

## :TRIGger<n>:SLOPe

**语法**: `:TRIGger<n>:SLOPe <slope>` / `:TRIGger<n>:SLOPe?`
**描述**: 设置或查询外部触发信号边沿类型。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<slope>` | 离散型 | {POSitive|NEGative} | POSitive |
**返回格式**: 查询返回 POS 或 NEG。
**说明**: 仅适用于选择外部触发的猝发或扫频输出。POSitive 上升沿；NEGative 下降沿。
**举例**: `:TRIGger1:SLOPe NEGative` / `:TRIGger1:SLOPe?`

## :TRIGger<n>:SOURce

**语法**: `:TRIGger<n>:SOURce <source>` / `:TRIGger<n>:SOURce?`
**描述**: 设置或查询触发类型。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<source>` | 离散型 | {IMMediate|EXTernal|BUS|TIMer} | IMMediate |
**返回格式**: 查询返回 IMM、EXT、TIM 或 BUS。
**说明**: 仅适用于猝发或扫频模式。IMMediate 立即触发；EXTernal 外部触发（接收 TTL 脉冲，可指定边沿）；BUS 手动/命令总线触发（发 `*TRG` 或 `:TRIGger<n>[:IMMediate]`）；TIMer 定时器触发（仅远程模式）。
**举例**: `:TRIGger2:SOURce EXTernal` / `:TRIGger2:SOURce?`

## :TRIGger<n>:TIMer

**语法**: `:TRIGger<n>:TIMer {<timer>|<lim>}` / `:TRIGger<n>:TIMer? [<lim>]`
**描述**: 设置或查询定时器触发的定时时间。
| 参数 | 类型 | 范围 | 默认值 |
|------|------|------|--------|
| `<timer>` | 实型 | 1 μs 至 8000 s | - |
| `<lim>` | 离散型 | {MINimum|MAXimum} | - |
**返回格式**: 查询以科学计数形式返回，如 `1.000000E+00`（1 s）。
**说明**: 只有触发方式设置为定时器触发时此命令有效。定时器只有处于"触发等待状态"才计时，计时完成后触发。
**举例**: `:TRIGger1:TIMer 1` / `:TRIGger1:TIMer?`

---

*文档结束。本参考涵盖 DG800 Pro/DG900 Pro 编程手册第 3 章全部 13 个 SCPI 命令子系统。*
