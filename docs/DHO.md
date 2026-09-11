---
name: DHO800/DHO900 SCPI 命令参考
sections:
  '1 根命令系统': 41
  '2 波形自动设置命令子系统': 100
  '3 采样命令子系统': 206
  '4 总线命令子系统': 316
  '5 伯德图命令子系统': 1066
  '6 通道命令子系统': 1230
  '7 频率计命令子系统': 1480
  '8 光标命令子系统': 1591
  '9 显示命令子系统': 1870
  '10 电压表命令子系统': 2037
  '11 直方图命令子系统': 2094
  '12 IEEE488.2 通用命令': 2275
  '13 数字通道命令子系统': 2455
  '14 局域网命令子系统': 2625
  '15 通过/失败测试命令子系统': 2857
  '16 数学运算命令子系统': 3035
  '17 测量命令子系统': 3831
  '18 快捷操作命令子系统': 4464
  '19 波形录制命令子系统': 4489
  '20 参考波形命令子系统': 4832
  '21 存储功能命令子系统': 5003
  '22 搜索命令子系统': 5292
  '23 导航命令子系统': 5515
  '24 辅助命令子系统': 5803
  '25 函数/任意波形发生器命令子系统': 6008
  '26 时基命令子系统': 6334
  '27 触发命令子系统': 6639
  '28 波形读取命令子系统': 8412
通用说明:
- 符号约定：{} 参数可省略、| 多选一、[] 可省略、<> 必填
- 参数类型：Bool(ON/OFF)、Discrete(列举)、Integer、Real、ASCII 字符串
- 单位：mV=毫伏、ms=毫秒、MHz=兆赫兹（不区分大小写）
---




# 1 根命令系统
根命令没有下一级关键字，执行仪器常用的基本操作。
## 1.1:CLEar

**语法**: `:CLEar`
**描述**: 清除屏幕上所有的波形。该命令功能等同于按前面板按键。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 1.2:RUN

**语法**: `:RUN`
**描述**: :RUN 命令使示波器开始运行。该命令功能等同于点击屏幕上方右侧的图标或按前面板按钮。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 1.3:STOP

**语法**: `:STOP`
**描述**: :STOP 命令使示波器停止运行。该命令功能等同于点击屏幕上方右侧的图标，或按前面板按键。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 1.4:SINGle

**语法**: `:SINGle`
**描述**: 单次触发操作。将示波器设置为单次触发方式。该命令功能等同于发送:TRIGger:SWEep SINGle 命令。该命令功能还等同于按前面板按键。
**参数**: 无。
**说明**: • 单次触发方式下，示波器将在符合触发条件时触发一次，然后停止。
• 波形录制功能打开时或回放录制的波形时，该命令无效。
• 单次触发时，您可以使用:TFORce 命令强制进行一次触发。
**返回格式**: 无。
**举例**: 无。

---

## 1.5:TFORce

**语法**: `:TFORce`
**描述**: 强制产生一个触发信号。适用于普通和单次触发方式，请参考:TRIGger:SWEep 命令。该命令功能等同于按前面板触发控制区按键。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

# 2 波形自动设置命令子系统
波形自动设置命令用于执行波形自动设置相关功能和操作。
## 2.1:AUToset

**语法**: `:AUToset`
**描述**: 启用波形自动设置功能。示波器将根据输入信号自动调整垂直档位、水平时基以及触发方式，使波形显示达到最佳状态。该命令功能等同于按前面板按键。
**参数**: 无。
**说明**: • AUTO 功能被禁用时，该命令无效，详见:SYSTem:AUToscale命令。
• 通过/失败功能当前状态为允许测试时，AUTO 功能正常运行，但通过/失败功能被强制关闭。
• 波形录制功能打开时，AUTO 功能正常运行；录制或播放时，AUTO 功能无效。
**返回格式**: 无。
**举例**: 无。

---

## 2.2:AUToset:PEAK

**语法**: `:AUToset:PEAK <bool>
:AUToset:PEAK?`

**描述**: 设置或查询峰峰优先是否打开。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: 此功能主要针对偏移信号，若偏移较大，打开此功能，可优先看到信号波形。
**返回格式**: 查询返回 0 或 1。
**举例**: :AUToset:PEAK OFF /* 设置关闭峰峰优先*/
:AUToset:PEAK? /* 查询返回 0*/

---

## 2.3:AUToset:OPENch

**语法**: `:AUToset:OPENch <bool>
:AUToset:OPENch?`

**描述**: 设置或查询执行 AUTO 操作时，是否只检测已打开的通道。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: • 若选择“0|OFF”，执行波形自动设置操作会依次检测 4 个模拟通道 CH1-CH4，若检测到通道无信号，则关闭该通道；若检测到通道有信号，则调节到最优档位进行显示。
• 若选择“1|ON”，执行波形自动设置操作只检测已打开的通道。
**返回格式**: 查询返回 0 或 1。
**举例**: :AUToset:OPENch ON /* 设置 AUTO 操作只检测已打开的通道*/
:AUToset:OPENch? /* 查询返回 1*/

---

## 2.4:AUToset:OVERlap

**语法**: `:AUToset:OVERlap <bool>
:AUToset:OVERlap?`

**描述**: 设置或查询是否打开波形重叠显示功能。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: • 1|ON： 打开波形重叠显示功能，不同通道的波形会显示在屏幕的相同位置。
• 0|OFF： 关闭波形重叠显示功能，不同通道的波形在屏幕上从上到下依次排列显示。
**返回格式**: 查询返回 0 或 1。
**举例**: :AUToset:OVERlap OFF /* 设置波形重叠显示关闭*/
:AUToset:OVERlap? /* 查询返回 0*/

---

## 2.5:AUToset:KEEPcoup

**语法**: `:AUToset:KEEPcoup <bool>
:AUToset:KEEPcoup?`

**描述**: 设置或查询是否打开耦合保持。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: • 1|ON： 打开通道耦合保持功能，执行自动设置操作，通道耦合的设置保持不变。
• 0|OFF： 关闭通道耦合保持功能，则通道耦合默认为直流耦合。
**返回格式**: 查询返回 0 或 1。
**举例**: :AUToset:KEEPcoup ON /* 设置耦合保持打开*/
:AUToset:KEEPcoup? /* 查询返回 1*/

---

## 2.6:AUToset:LOCK

**语法**: `:AUToset:LOCK <bool>
:AUToset:LOCK?`

**描述**: 设置或查询 AUTO 功能锁状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: • 1|ON： 打开 AUTO 功能锁，禁用 AUTO 功能。
• 0|OFF 关闭 AUTO 功能锁，启用 AUTO 功能。您也可以使用:AUToset:ENAble 命令来启用或禁用 AUTO 功能。
**返回格式**: 查询返回 0 或 1。
**举例**: :AUToset:LOCK ON /* 打开 AUTO 功能锁，禁用 AUTO 功能。*/
:AUToset:LOCK? /* 查询返回 1*/

---

## 2.7:AUToset:ENAble

**语法**: `:AUToset:ENAble <bool>
:AUToset:ENAble?`

---

# 3 采样命令子系统
采样命令用于设置和查询示波器的存储深度、采样的获取方式和平均次数以及查询当前的采样
率。
## 3.1:ACQuire:AVERages

**语法**: `:ACQuire:AVERages <count>
:ACQuire:AVERages?`

**描述**: 设置或查询平均获取方式下的平均次数。
**参数**: 名称 类型 范围 默认值
<count> 整型 2n（n 为整数，范围为 1 至 16） 2

**说明**: • 可发送:ACQuire:TYPE 命令设置获取方式。
• 平均获取方式下，平均次数越高，采集到的波形噪声越小并且垂直分辨率越高，但显示的波形对波形变化的响应也越慢。
• 平均次数必须是 2n。当输入数值不为 2n 时，平均次数会自动设置为小于输入数值且最近的 2n。
**返回格式**: 查询返回 2 至 65536 之间的一个整数。
**举例**: :ACQuire:AVERages 128    /* 将平均次数设置为 128*/
:ACQuire:AVERages?       /* 查询返回 128*/

---

## 3.2:ACQuire:MDEPth

**语法**: `:ACQuire:MDEPth <mdep>
:ACQuire:MDEPth?`

**描述**: 设置或查询示波器的存储深度（即在一次触发采集中所能存储的波形点数），默认单位为 pts
（点）。

**参数**: 名称 类型 范围 默认值
<mdep> 离散型
{AUTO|1k|10k|100k|1M|5M|10M|25M|50M|1000|10000|100000|1000000|5000000|10000000|25000000|50000000|1e3|1e4|1e5|1e6|5e6|1e7|2.5e7|5e7}10k

**说明**: 选择 AUTO 时，示波器根据当前的采样率自动选择存储深度。
• 只开启任意一个通道的情况下可选的存储深度有：AUTO、1k、10k、100k、1M、
5M、10M、25M、50M（仅 DHO900/DHO824）。

• 开启任意两个通道的情况下可选的存储深度有：AUTO、1k、10k、100k、1M、5M、
10M、25M（仅 DHO900/DHO824）。
• 开启三个通道或四个通道全部开启的情况下（仅适用于四通道型号）可选的存储深度有：AUTO、1k、10k、100k、1M、5M、10M（仅 DHO900/DHO824）。修改存储深度会导致采样率变化，可通过:ACQuire:SRATe? 命令查询当前的采样率。
**返回格式**: 查询以科学计数形式返回存储深度。
**举例**: :ACQuire:MDEPth 1M           /* 设置存储深度为 1M*/
:ACQuire:MDEPth?            /* 查询返回 1.000E+6*/

---

## 3.3:ACQuire:TYPE

**语法**: `:ACQuire:TYPE <type>
:ACQuire:TYPE?`

**描述**: 设置或查询示波器采样的获取方式。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {NORMal|PEAK|AVERages|
ULTRa} NORMal

**说明**: • NORMal（普通）： 该模式下，示波器按相等的时间间隔对信号采样以重建波形。对于大多数波形来说，使用该模式均可以产生最佳的显示效果。
• AVERages（平均）： 该模式下，示波器对多次采样的波形进行平均，以减少输入信号上的随机噪声并提高垂直分辨率。平均次数越高，噪声越小并且垂直分辨率越高，但显示的波形对波形变化的响应也越慢。
• PEAK（峰值检测）： 该模式下，示波器采集采样间隔信号的最大值和最小值，以获取信号的包络或可能丢失的窄脉冲。使用该模式可以避免信号的混叠，但显示的噪声比较大。
• ULTRa（凝时模式）： 将示波器内存分成若干等份，每个等份里只存储触发到的单次波形。这种模式下刷新率极大提高，可以最小化触发事件之间的死区时间。
**返回格式**: 查询返回 NORM、PEAK、AVER 或 ULTR。
**举例**: :ACQuire:TYPE AVERages     /* 设置获取方式为平均*/
:ACQuire:TYPE?             /* 查询返回 AVER*/

---

## 3.4:ACQuire:SRATe?

**语法**: `:ACQuire:SRATe?`
**描述**: 查询当前的采样率，默认单位为 Sa/s。
**参数**: 无。
**说明**: • 采样率指示波器对信号采样的频率，即每秒采样的波形点数。
• 采样率和存储深度会随着水平时基的变化而变化。
**返回格式**: 查询以科学计数形式返回采样率。
**举例**: :ACQuire:SRATe?   /* 查询返回 1.00000E+6*/

---

## 3.5:ACQuire:ULTRa:MODE

**语法**: `:ACQuire:ULTRa:MODE <mode>
:ACQuire:ULTRa:MODE?`

**描述**: 设置或查询凝时获取的显示模式。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {ADJacent|OVERlay|WATerfall|
PERSpective|MOSaic} -

**说明**: • ADJacent： 相邻模式，将捕获的帧按时间顺序排列显示。此模式下一屏最多显示 100帧波形。
• OVERlay： 重叠模式，将捕获到的帧重叠排列显示。此模式下一屏最多显示 100 帧波形。
• WATerfall： 瀑布模式，带有垂直偏置的排列显示。此模式下一屏最多显示 100 帧波形。
• PERSpective： 透视模式，带有垂直偏置和水平偏置的排列显示。此模式下一屏最多显示 100 帧波形。
• MOSaic： 马赛克模式，将整个波形视图区域分成若干块，将存储帧按顺序显示在每一个块中。此模式下一屏最多显示 80 帧波形。
**返回格式**: 查询返回 ADJ、OVER、WAT、PERS 或 MOS。
**举例**: :ACQuire:ULTRa:MODE ADJacent /* 设置凝时获取的显示模式为相邻模式*/
:ACQuire:ULTRa:MODE? /* 查询返回 ADJ*/

---

## 3.6:ACQuire:ULTRa:TIMeout

**语法**: `:ACQuire:ULTRa:TIMeout <tmo>
:ACQuire:ULTRa:TIMeout?`

**描述**: 设置或查询凝时获取的超时时间。
**参数**: 名称 类型 范围 默认值
<tmo> 实型 1 us 至 1 s 1.00 ms

---

# 4 总线命令子系统
## 3.7:ACQuire:ULTRa:MAXFrame

**语法**: `:ACQuire:ULTRa:MAXFrame <frame>
:ACQuire:ULTRa:MAXFrame?`

**描述**: 设置或查询凝时获取的最大帧数。
**参数**: 名称 类型 范围 默认值
<frame> 整型 1 至当前的最大帧数 -

**说明**: 无。
**返回格式**: 查询以整数形式返回凝时获取的最大帧数。
**举例**: :ACQuire:ULTRa:MAXFrame 100 /* 设置凝时获取的最大帧数为 100*/
:ACQuire:ULTRa:MAXFrame? /* 查询返回 100*/
3.4 总线命令子系统
总线命令用于执行解码相关的设置和操作。

---

## 4.1:BUS<n>:MODE

**语法**: `:BUS<n>:MODE <mode>
:BUS<n>:MODE?`

**描述**: 设置或查询指定解码总线的解码类型。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<mode> 离散型 {PARallel|RS232|SPI|IIC|LIN|CAN} PARallel

**说明**: 仅 DHO900 系列支持 LIN 解码类型。
**返回格式**: 查询返回 PAR、RS232、SPI、IIC、LIN 或 CAN。
**举例**: :BUS1:MODE SPI    /* 设置解码总线的类型为 SPI*/
:BUS1:MODE?       /* 查询返回 SPI*/

---

## 4.2:BUS<n>:DISPlay

**语法**: `:BUS<n>:DISPlay <bool>
:BUS<n>:DISPlay?`

**描述**: 打开或关闭指定解码总线开关，或查询指定解码总线的开/关状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :BUS1:DISPlay ON    /* 打开解码总线开关*/
:BUS1:DISPlay?      /* 查询返回 1*/

---

## 4.3:BUS<n>:FORMat

**语法**: `:BUS<n>:FORMat <format>
:BUS<n>:FORMat?`

**描述**: 设置或查询指定解码总线解码数据的格式。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<format> 离散型 {HEX|ASCii|DEC|BIN} HEX

**说明**: • HEX： 十六进制
• ASCii： ASCII 码型
• DEC： 十进制
• BIN： 二进制
**返回格式**: 查询返回 HEX、ASC、DEC 或 BIN。
**举例**: :BUS1:FORMat HEX    /* 设置总线显示格式为十六进制*/
:BUS1:FORMat?       /* 查询返回 HEX*/

---

## 4.4:BUS<n>:EVENt

**语法**: `:BUS<n>:EVENt <bool>
:BUS<n>:EVENt?`

**描述**: 打开或关闭指定解码总线的事件表，或查询指定解码总线事件表的开/关状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 使用该命令前，请打开指定解码总线开关。
**返回格式**: 查询返回 1 或 0。
**举例**: :BUS1:EVENt ON    /* 打开指定解码总线的事件表*/
:BUS1:EVENt?      /* 查询返回 1*/

---

## 4.5:BUS<n>:LABel

**语法**: `:BUS<n>:LABel <bool>
:BUS<n>:LABel?`

**描述**: 打开或关闭指定解码总线的标签，或查询指定解码总线标签的开/关状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: 使用该命令前，请打开指定解码总线开关。
**返回格式**: 查询返回 1 或 0。
**举例**: :BUS1:LABel ON      /* 打开指定解码总线的标签*/
:BUS1:LABel?        /* 查询返回 1*/

---

## 4.6:BUS<n>:DATA?

**语法**: `:BUS<n>:DATA?`
**描述**: 读取指定解码总线的事件表数据。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -

**说明**: 无。
**返回格式**: 以如下格式返回解码事件表中的数据。
#9000000086PARALLEL
Time,Data,
-2.47us,0,
-2.444us,1,
-1.448us,0,
-446ns,1,
551.6ns,0,
1.554us,1,
其中，#9000000086 为 TMC 数据块头，紧跟其后的为事件表中的数据。数据块头中#9 后面
的数字表示后面的有效数据的字节数，PARALLEL 表示解码类型（还可能为设备支持的其他解
码类型，如：RS232、I2C、SPI、LIN 等）。数据以逗号分开，会根据解码列表的行自动换
行，数据值与设定的进制显示有关。
注意
您可以将除 TMC 数据块头和解码类型（如#9000000086PARALLEL）之外的数据保存为*.csv 格式的
文件，以列表形式查看数据。

**举例**: 无。

---

## 4.7:BUS<n>:EEXPort

**语法**: `:BUS<n>:EEXPort <path>`
**描述**: 将指定解码总线事件表中的解码信息以 CSV 格式导出。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<path> ASCII 字符串 请参考说明 -

**说明**: • 参数<path>中包含文件存储路径和带后缀的文件名。若指定的路径已存有相同名称的文件，则覆盖原文件。
• 当仪器的运行状态为 STOP（可通过 :STOP 命令设置）时，可导出当前事件表中时间和相应的解码数据。
• 打开事件表时，此命令有效。可以通过命令 :BUS<n>:EVENt 打开事件表。
• 已存储的“*.csv”格式文件可通过 Excel 打开并编辑。
**返回格式**: 无。
**举例**: :BUS1:EEXPort C:/123.csv    /* 将总线事件表中的解码信息存储至本地存储器C 盘中，文件名为 123.csv */

---

## 4.8:BUS<n>:POSition

**语法**: `:BUS<n>:POSition <pos>
:BUS<n>:POSition?`

**描述**: 设置或查询指定解码总线在屏幕中的垂直位置。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<pos> 整型 -250 至 250 0

**说明**: 无。
**返回格式**: 查询返回-250 至 250 之间的整数。
**举例**: :BUS1:POSition 200    /* 设置总线的垂直位置为 200*/
:BUS1:POSition?       /* 查询返回 200*/

---

## 4.9:BUS<n>:THReshold

**语法**: `:BUS<n>:THReshold <value>,<type>
:BUS<n>:THReshold? <type>`

**描述**: 设置或查询指定解码总线的指定解码源的阈值。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<value> 实型 (-5×VerticalScale–OFFSet)至(5×
VerticalScale–OFFSet) 0
<type> 离散型
{PAL|TX|RX|SCL|SDA|CS|CLK|
MISO|MOSI|LIN|CAN|PALCLK|
CH1|CH2|CH3|CH4}
-

**说明**: 对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
• PAL： 并行解码的总线源。
• PALCLK： 并行解码的时钟源，只有信源打开阈值才能被设置。
• TX： RS232 解码时的 TX 通道源。
• RX： RS232 解码时的 RX 通道源，只有信源打开阈值才能被设置。
• SCL： I2C 解码的时钟源。
• SDA： I2C 解码的数据源。
• CS： SPI 解码片选线的通道源。
• CLK： SPI 解码的时钟源。
• MISO： SPI 解码的 MISO 数据源。
• MOSI： SPI 解码的 MOSI 数据源。
• LIN： LIN 解码的总线源。
• CAN： CAN 解码的通道源。
• CH1|CH2|CH3|CH4： CH1~CH4 通道源，适用于所有解码类型。仅 DHO900 系列支持 LIN 解码类型。在 DHO800 系列中，仅四通道型号支持设置 SPI 解码模式为 CS。
**返回格式**: 查询以科学计数形式返回指定解码源的阈值。
**举例**: :BUS1:THReshold 2.4,PAL     /* 设置 PAL 解码源的阈值为 2.4V*/
:BUS1:THReshold? PAL         /* 查询返回 2.400000E0*/

---

## 4.10:BUS<n>:PARallel

**语法**: `:BUS<n>:PARallel:BUS <source>
:BUS<n>:PARallel:BUS?

:BUS<n>:PARallel:CLK <source>
:BUS<n>:PARallel:CLK?
:BUS<n>:PARallel:SLOPe <slope>
:BUS<n>:PARallel:SLOPe?
:BUS<n>:PARallel:WIDTh <wid>
:BUS<n>:PARallel:WIDTh?
:BUS<n>:PARallel:BITX <bit>
:BUS<n>:PARallel:BITX?
:BUS<n>:PARallel:SOURce <src>
:BUS<n>:PARallel:SOURce?
:BUS <n>:PARallel:ENDian <endian>

:BUS <n>:PARallel:ENDian?
:BUS<n>:PARallel:POLarity <pol>
:BUS<n>:PARallel:POLarity?`

**描述**: 设置或查询指定解码总线为并行解码时数据总线的通道源。设置或查询指定解码总线为并行解码时的时钟源。设置或查询并行解码对数据通道进行采样时时钟通道的边沿类型。设置或查询指定解码总线为并行解码时数据宽度，即每帧数据的位数。设置或查询指定解码总线为并行解码时需要设定通道源的数据位。设置或查询指定解码总线为并行解码时当前选中数据位的通道源。设置或查询指定解码总线的并行解码的位序。设置或查询指定解码总线为并行解码时的数据极性。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D7D0|D15D8|D15D0|D0D7|
D8D15|D0D15|CHANnel1|
CHANnel2|CHANnel3|CHANnel4|
USER}
CHANnel1
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|D9|D10|D11|D12|D13|D14|D15|CHANnel1|CHANnel2|CHANnel3|CHANnel4|OFF}
OFF
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<slope> 离散型 {POSitive|NEGative|BOTH} POSitive
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<wid> 整型 1 至 4 1
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bit> 整型 0 至（数据位宽-1） 0
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<src> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|D9|D10|D11|D12|D13|D14|D15|CHANnel1|CHANnel2|CHANnel3|CHANnel4}
与所选的位相关
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<endian> 离散型 {MSB|LSB} MSB
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<pol> 离散型 {NEGative|POSitive} POSitive

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。无。参数 D0~D15 数字通道仅 DHO900 系列支持。如果没有选择时钟通道，解码时将在通道数据发生跳变时采样。
• 只有数据线通道源设置为自定义(BUS<n>:PARallel:BUS USER)时，此命令才有效。
• 使用该命令设置并行总线的数据宽度后，执行:BUS<n>:PARallel:BITX 命令和:BUS<n>:PARallel:SOURce命令选中数据位并为该位设置通道源。
• 只有数据线通道源设置为自定义(BUS<n>:PARallel:BUS USER)时，此命令才有效。
• 数据位宽由:BUS<n>:PARallel:WIDTh命令设置。
• 指定数据位后，发送:BUS<n>:PARallel:SOURce命令可设置该位的通道源。
• 只有数据线通道源设置为自定义(BUS<n>:PARallel:BUS USER)时，此命令才有效。
• 发送该命令之前，请先发送:BUS<n>:PARallel:BITX 命令选择所需的数据位。
• 参数 D0~D15 数字通道仅 DHO900 系列支持。
• MSB： 位序为 MSB(Most Significant Bit)最高有效位。
• LSB： 位序为 LSB(Least Significant Bit)最低有效位。
• NEGative： 负极性。
• POSitive： 正极性。
查询返回 D7D0、D15D8、D15D0、D0D7、D8D15、D0D15、CHAN1、CHAN2、 CHAN3、CHAN4 或 USER。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 OFF。
查询返回 POS、NEG 或 BOTH。
查询返回 1 至 4 之间的整数。
查询以整数形式返回当前数据位数。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 MSB 或 LSB。
查询返回 NEG 或 POS。

**举例**: :BUS1:PARallel:BUS CHANnel1   /* 设置并行解码数据总线的通道源为 CHANnel1*/
:BUS1:PARallel:BUS?          /* 查询返回 CHAN1*/
## 4.10.2:BUS<n>:PARallel:CLK
:BUS1:PARallel:CLK CHANnel2    /* 设置并行解码的时钟源为 CHANnel2*/
:BUS1:PARallel:CLK?           /* 查询返回 CHAN2*/
## 4.10.3:BUS<n>:PARallel:SLOPe
:BUS1:PARallel:SLOPe BOTH    /* 设置并行解码在时钟通道的任意沿处采样*/
:BUS1:PARallel:SLOPe?         /* 查询返回 BOTH*/
## 4.10.4:BUS<n>:PARallel:WIDTh
:BUS1:PARallel:WIDTh 4    /* 设置并行解码的数据宽度为 4*/
:BUS1:PARallel:WIDTh?      /* 查询返回 4*/
## 4.10.5:BUS<n>:PARallel:BITX
:BUS1:PARallel:BITX 2    /* 设置当前数据位为 2*/
:BUS1:PARallel:BITX?     /* 查询返回 2*/
## 4.10.6:BUS<n>:PARallel:SOURce
:BUS1:PARallel:SOURce CHANnel2    /* 设置当前位的通道源为 CHANnel2*/
:BUS1:PARallel:SOURce?             /* 查询返回 CHAN2*/
## 4.10.7:BUS<n>:PARallel:ENDian
:BUS1:PARallel:ENDian LSB /* 设置并行解码的位序为 LSB*/
:BUS1:PARallel:ENDian? /* 查询返回 LSB*/
## 4.10.8:BUS<n>:PARallel:POLarity
:BUS1:PARallel:POLarity NEGative    /* 设置并行解码的数据极性为负极性*/
:BUS1:PARallel:POLarity?            /* 查询返回 NEG*/

---

## 4.11:BUS<n>:RS232

**语法**: `:BUS<n>:RS232:TX <source>
:BUS<n>:RS232:TX?

:BUS<n>:RS232:RX <source>
:BUS<n>:RS232:RX?
:BUS<n>:RS232:POLarity <pol>
:BUS<n>:RS232:POLarity?
:BUS<n>:RS232:PARity <parity>

:BUS<n>:RS232:PARity?
:BUS<n>:RS232:ENDian <endian>
:BUS<n>:RS232:ENDian?
:BUS<n>:RS232:BAUD <baud>
:BUS<n>:RS232:BAUD?
:BUS<n>:RS232:DBITs <bits>
:BUS<n>:RS232:DBITs?

:BUS<n>:RS232:SBITs <stop bits>
:BUS<n>:RS232:SBITs?`

**描述**: 设置或查询指定解码总线为 RS232 解码时的 TX 通道源。设置或查询指定解码总线为 RS232 解码时的 RX 通道源。设置或查询指定解码总线为 RS232 解码时的极性。设置或查询指定解码总线为 RS232 解码时数据传输的奇偶校验方式。设置或查询指定解码总线为 RS232 解码时数据传输的位序。设置或查询指定解码总线为 RS232 解码时数据传输的波特率，默认单位为 bps。设置或查询指定解码总线为 RS232 解码时的数据位宽。设置或查询指定解码总线为 RS232 解码时每帧数据后的停止位数。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4|OFF}
CHANnel1
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4|OFF}
OFF

名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<pol> 离散型 {POSitive|NEGative} NEGative
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<parity> 离散型 {NONE|ODD|EVEN} NONE
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<endian> 离散型 {MSB|LSB} LSB

名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<baud> 整型 1bps 至 20Mbps 9600bps
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bits> 离散型 {5|6|7|8|9} 8
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<stop bits> 离散型 {1|1.5|2} 1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。
TX 和 RX 信源不能同时设为 OFF。RX 信源可通过 :BUS<n>:RS232:RX 命令设置。
TX 和 RX 信源不能同时设为 OFF。TX 信源可通过 :BUS<n>:RS232:TX 命令设置。
• POSitive： 正极性。高电平为逻辑“1”，低电平为逻辑“0”。
• NEGative： 负极性。高电平为逻辑“0”，低电平为逻辑“1”。
• NONE： 在传输过程中将没有校验位。
• ODD： 奇校验，数据位和校验位中“1”的总个数为奇数。例如：发送 0x55
（01010101），则需要在校验位填充 1。
• EVEN： 偶校验，数据位和校验位中“1”的总个数为偶数。例如：发送 0x55
（01010101），则需要在校验位中填 0。
• LSB： Least Significant Bit（最低有效位），即数据低位先传输。
• MSB： Most Significant Bit（最高有效位），即数据高位先传输。若波特率设置为带兆“M”的数值，则需在数值后加上 A，如发送 5M，需发送 5MA。无。无。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 OFF。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 OFF。
查询返回 POS 或 NEG。
查询返回 NONE、ODD 或 EVEN。
查询返回 LSB 或 MSB。
查询返回 1 至 20M 之间的一个整数。
查询返回 5、6、7、8 或 9。
查询返回 1、1.5 或 2。

**举例**: :BUS1:RS232:TX CHANnel2   /* 设置 RS232 解码时的 TX 通道源为 CHANnel2*/
:BUS1:RS232:TX?      /* 查询返回 CHAN2*/
## 4.11.2:BUS<n>:RS232:RX
:BUS1:RS232:RX CHANnel2    /* 设置 RS232 解码时的 RX 通道源为 CHANnel2*/
:BUS1:RS232:RX?      /* 查询返回 CHAN2*/
## 4.11.3:BUS<n>:RS232:POLarity
:BUS1:RS232:POLarity POSitive     /* 设置 RS232解码时的极性为 POSitive*/
:BUS1:RS232:POLarity?            /* 查询返回 POS*/
## 4.11.4:BUS<n>:RS232:PARity
:BUS1:RS232:PARity ODD /* 设置 RS232 解码时数据传输的奇偶校验方式为奇校验*/
:BUS1:RS232:PARity?     /* 查询返回 ODD*/
## 4.11.5:BUS<n>:RS232:ENDian
:BUS1:RS232:ENDian MSB        /* 设置 RS232 解码时数据高位先传输*/
:BUS1:RS232:ENDian?            /* 查询返回 MSB*/
## 4.11.6:BUS<n>:RS232:BAUD
:BUS1:RS232:BAUD 4800    /* 设置 RS232 解码时数据传输的波特率为 4800bps*/
:BUS1:RS232:BAUD?        /* 查询返回 4800*/
## 4.11.7:BUS<n>:RS232:DBITs
:BUS1:RS232:DBITs 7      /* 设置 RS232 解码时的数据位宽为 7*/
:BUS1:RS232:DBITs?      /* 查询返回 7*/
## 4.11.8:BUS<n>:RS232:SBITs
:BUS1:RS232:SBITs 2      /* 设置 RS232 解码时的停止位数为 2*/
:BUS1:RS232:SBITs?      /* 查询返回 2*/

---

## 4.12:BUS<n>:IIC

**语法**: `:BUS<n>:IIC:SCLK:SOURce <source>
:BUS<n>:IIC:SCLK:SOURce?
:BUS<n>:IIC:SDA:SOURce <source>
:BUS<n>:IIC:SDA:SOURce?
:BUS<n>:IIC:EXCHange <bool>
:BUS<n>:IIC:EXCHange?
:BUS<n>:IIC:ADDRess <addr>
:BUS<n>:IIC:ADDRess?`

**描述**: 设置或查询指定解码总线为 I2C 解码时的时钟源。设置或查询指定解码总线为 I2C 解码时的数据源。设置指定解码总线的 I2C 解码时钟源和数据源进行交换，查询指定解码总线的 I2C 解码时钟源和数据源是否进行了交换。设置或查询指定解码总线为 I2C 解码时的地址模式。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -

名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<addr> 离散型 {NORMal|RW} NORMal

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。参数 D0~D15 数字通道仅 DHO900 系列支持。无。
• NORMal： 地址位宽不包括 R/W 位。
• RW： 地址位宽包括 R/W 位。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 0 或 1。
查询返回 NORM 或 RW。

**举例**: :BUS1:IIC:SCLK:SOURce CHANnel2    /* 设置 I2C解码的时钟源为 CHANnel2*/
:BUS1:IIC:SCLK:SOURce?      /* 查询返回 CHAN2*/

## 4.12.2:BUS<n>:IIC:SDA:SOURce
:BUS1:IIC:SDA:SOURce CHANnel2    /* 设置 I2C 解码的数据源为 CHANnel2*/
:BUS1:IIC:SDA:SOURce?            /* 查询返回 CHAN2*/
## 4.12.3:BUS<n>:IIC:EXCHange
:BUS1:IIC:EXCHange ON /* 设置时钟源和数据源进行交换*/
:BUS1:IIC:EXCHange? /* 查询返回 1*/
## 4.12.4:BUS<n>:IIC:ADDRess
:BUS1:IIC:ADDRess RW    /* 设置 I2C 解码的地址包含 R/W 位*/
:BUS1:IIC:ADDRess?       /* 查询返回 RW*/

---

## 4.13:BUS<n>:SPI

**语法**: `:BUS<n>:SPI:SCLK:SOURce <source>
:BUS<n>:SPI:SCLK:SOURce?
:BUS<n>:SPI:SCLK:SLOPe <slope>
:BUS<n>:SPI:SCLK:SLOPe?
:BUS<n>:SPI:MISO:SOURce <source>
:BUS<n>:SPI:MISO:SOURce?
:BUS<n>:SPI:MOSI:SOURce <source>
:BUS<n>:SPI:MOSI:SOURce?
:BUS<n>:SPI:POLarity <polarity>
:BUS<n>:SPI:POLarity?
:BUS<n>:SPI:MISO:POLarity <polarity>
:BUS<n>:SPI:MISO:POLarity?
:BUS<n>:SPI:MOSI:POLarity <polarity>
:BUS<n>:SPI:MOSI:POLarity?
:BUS<n>:SPI:DBITs <width>
:BUS<n>:SPI:DBITs?
:BUS<n>:SPI:ENDian <endian>
:BUS<n>:SPI:ENDian?
:BUS<n>:SPI:MODE <mode>
:BUS<n>:SPI:MODE?
:BUS<n>:SPI:TIMeout:TIME <time>
:BUS<n>:SPI:TIMeout:TIME?

:BUS<n>:SPI:SS:SOURce <source>
:BUS<n>:SPI:SS:SOURce?
:BUS<n>:SPI:SS:POLarity <polarity>
:BUS<n>:SPI:SS:POLarity?`

**描述**: 设置或查询指定解码总线为 SPI 解码时的时钟源。设置或查询指定解码总线为 SPI 解码时的时钟边沿类型。设置或查询指定解码总线为 SPI 解码时的 MISO 数据源。设置或查询指定解码总线为 SPI 解码时的 MOSI 数据源。设置或查询指定解码总线为 SPI 数据解码时的极性。设置或查询 SPI 解码时 MISO 数据线的极性。设置或查询 SPI 解码时 MOSI 数据线的极性。设置或查询指定解码总线为 SPI 解码时的数据位宽。设置或查询指定解码总线为 SPI 解码时数据传输的位序。设置或查询指定解码总线为 SPI 解码时的解码模式。设置或查询指定解码总线为 SPI 解码时的超时时间，单位为 s。设置或查询指定解码总线为 SPI 解码时片选线的通道源。设置或查询指定解码总线为 SPI 解码时片选线的极性。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<slope> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4|OFF}
CHANnel2

名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4|OFF}
OFF
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<polarity> 离散型 {HIGH|LOW} HIGH
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<polarity> 离散型 {HIGH|LOW} HIGH

名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<polarity> 离散型 {HIGH|LOW} HIGH
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<width> 整型 4 至 32 8
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<endian> 离散型 {MSB|LSB} MSB
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<mode> 离散型 {CS|TIMeout} TIMeout
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<time> 实型 8ns 至 10s 1μs
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel3

名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<polarity> 离散型 {HIGH|LOW} LOW

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。无。参数 D0~D15 数字通道仅 DHO900 系列支持。本命令与 :BUS<n>:SPI:MOSI:SOURce 命令不能同时设置为 OFF。参数 D0~D15 数字通道仅 DHO900 系列支持。本命令与 :BUS<n>:SPI:MISO:SOURce 命令不能同时设置为 OFF。
• HIGH： 正极性。高电平为 1，低电平为 0。
• LOW： 负极性。低电平为 1，高电平为 0。
• HIGH： 高电平为 1，低电平为 0。
• LOW： 低电平为 1，高电平为 0。此命令为向后兼容命令，请使用 :BUS<n>:SPI:POLarity 命令。
• HIGH： 高电平为 1，低电平为 0。
• LOW： 低电平为 1，高电平为 0。无。
• MSB： Most Significant Bit（最高有效位），即数据高位先传输。
• LSB： Least Significant Bit（最低有效位），即数据低位先传输。
• CS： 片选。含有片选线 CS，依据 CS 进行帧同步。
• TIMeout： 超时。根据超时时间进行帧同步。在 DHO800 系列中，仅四通道型号支持设置 SPI 解码模式为 CS。
• 仅在超时模式下，该设置命令有效。可通过命令 :BUS<n>:SPI:MODE 查询或设置 SPI解码模式。
• 超时时间需大于时钟最大脉宽，小于帧间的空闲时间。仅在片选模式下，该设置命令有效。可通过 :BUS<n>:SPI:MODE 命令设置或查询 SPI 的解码模式。参数 D0~D15 数字通道仅 DHO900 系列支持。在 DHO800 系列中，仅四通道型号支持本命令。
• HIGH： 设置示波器在片选信号为“高电平”时在时钟信号的指定沿对数据线信源通道的数据进行采样。
• LOW： 设置示波器在片选信号为“低电平”时在时钟信号的指定沿对数据线信源通道的数据进行采样。仅在片选模式下，该设置命令有效。可通过:BUS<n>:SPI:MODE 命令设置或查询 SPI 的解码模式。在 DHO800 系列中，仅四通道型号支持本命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 POS 或 NEG。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 OFF。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 OFF。
查询返回 HIGH 或 LOW。
查询返回 HIGH 或 LOW。
查询返回 HIGH 或 LOW。
查询返回 4 至 32 之间的一个整数。
查询返回 MSB 或 LSB。
查询返回 CS 或 TIM。
查询以科学计数形式返回超时时间。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 HIGH 或 LOW。

**举例**: :BUS1:SPI:SCLK:SOURce CHANnel2    /* 设置 SPI解码的时钟源为 CHANnel2*/
:BUS1:SPI:SCLK:SOURce?       /* 查询返回 CHAN2*/

## 4.13.2:BUS<n>:SPI:SCLK:SLOPe
:BUS1:SPI:SCLK:SLOPe NEGative    /* 设置 SPI 解码的时钟边沿类型为下降沿*/
:BUS1:SPI:SCLK:SLOPe?             /* 查询返回 NEG*/
## 4.13.3:BUS<n>:SPI:MISO:SOURce
:BUS1:SPI:MISO:SOURce CHANnel2    /* 设置 SPI 解码的 MISO 数据源为
CHANnel2*/
:BUS1:SPI:MISO:SOURce?      /* 查询返回 CHAN2*/
## 4.13.4:BUS<n>:SPI:MOSI:SOURce
:BUS1:SPI:MOSI:SOURce CHANnel2     /* 设置 SPI 解码的 MOSI 数据源为
CHANnel2*/
:BUS1:SPI:MOSI:SOURce?       /* 查询返回 CHAN2*/

## 4.13.5:BUS<n>:SPI:POLarity
:BUS1:SPI:POLarity HIGH    /* 设置 SPI 数据解码时的极性为 HIGH*/
:BUS1:SPI:POLarity?        /* 查询返回 HIGH*/
## 4.13.6:BUS<n>:SPI:MISO:POLarity
:BUS1:SPI:MISO:POLarity HIGH      /* 设置 MISO 数据线的极性为 HIGH*/
:BUS1:SPI:MISO:POLarity?          /* 查询返回 HIGH*/
## 4.13.7:BUS<n>:SPI:MOSI:POLarity
:BUS1:SPI:MOSI:POLarity HIGH       /* 设置 MOSI 数据线的极性为 HIGH*/
:BUS1:SPI:MOSI:POLarity?            /* 查询返回 HIGH*/

## 4.13.8:BUS<n>:SPI:DBITs
:BUS1:SPI:DBITs 10         /* 设置解码总线 SPI 解码的数据位宽为 10*/
:BUS1:SPI:DBITs?           /* 查询返回 10*/
## 4.13.9:BUS<n>:SPI:ENDian
:BUS1:SPI:ENDian LSB       /* 设置 SPI 解码数据传输的位序为低位先传输*/
:BUS1:SPI:ENDian?          /* 查询返回 LSB*/
## 4.13.10:BUS<n>:SPI:MODE
:BUS1:SPI:MODE CS      /* 设置 SPI 的解码模式为 CS*/
:BUS1:SPI:MODE?        /* 查询返回 CS*/
## 4.13.11:BUS<n>:SPI:TIMeout:TIME
:BUS1:SPI:TIMeout:TIME 0.000005    /* 设置超时时间为 5μs*/
:BUS1:SPI:TIMeout:TIME?            /* 查询返回 5.000000E-6*/
## 4.13.12:BUS<n>:SPI:SS:SOURce
:BUS1:SPI:SS:SOURce CHANnel2 /* 设置 SPI 解码片选线的通道源为 CHANnel2*/
:BUS1:SPI:SS:SOURce?   /* 查询返回 CHAN2*/
## 4.13.13:BUS<n>:SPI:SS:POLarity
:BUS1:SPI:SS:POLarity HIGH    /* 设置 SPI 解码片选线的极性为 HIGH*/
:BUS1:SPI:SS:POLarity?        /* 查询返回 HIGH*/

---

## 4.14:BUS<n>:CAN

**语法**: `:BUS<n>:CAN:SOURce <source>
:BUS<n>:CAN:SOURce?
:BUS<n>:CAN:STYPe <stype>
:BUS<n>:CAN:STYPe?
:BUS<n>:CAN:BAUD <baud>
:BUS<n>:CAN:BAUD?
:BUS<n>:CAN:SPOint <spoint>
:BUS<n>:CAN:SPOint?`

**描述**: 设置或查询指定解码总线为 CAN 解码时的通道源。设置或查询指定解码总线为 CAN 解码时的信号类型。设置或查询指定解码总线为 CAN 解码时的信号速率，单位为 bps。设置或查询指定解码总线为 CAN 解码时的采样点位置（以百分比形式表示）。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1

名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<stype> 离散型 {TX|RX|CANH|CANL|DIFFerential} CANL
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<baud> 整型 10kbps 至 5Mbps 1Mbps
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<spoint> 整型 10 至 90 50

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。
• TX： 来自 CAN 信号线上的发送信号。
• RX： 来自 CAN 信号线上的接收信号。
• CANH： 实际的 CAN_H 总线信号。
• CANL： 实际的 CAN_L 总线信号。
• DIFFerential： 使用差分探头连接到模拟通道的 CAN 差分总线信号。差分探头的正极连接 CAN_H 总线信号，差分探头的负极连接 CAN_L 总线信号。若信号速率设置为带兆“M”的数值，则需在数值后加上 A，如发送 5M，需发送 5MA。具体采样位置内容请参考 采样位置 。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 TX、RX、CANH、CANL 或 DIFF。
查询返回 10k 至 5M 之间的一个整数。
查询返回 10 至 90 之间的一个整数。

**举例**: :BUS1:CAN:SOURce CHANnel2      /* 设置 CAN 解码时的通道源为 CHANnel2*/
:BUS1:CAN:SOURce?           /* 查询返回 CHAN2*/
## 4.14.2:BUS<n>:CAN:STYPe
:BUS1:CAN:STYPe TX        /* 设置 CAN 解码时的信号类型为 TX*/
:BUS1:CAN:STYPe?          /* 查询返回 TX*/

## 4.14.3:BUS<n>:CAN:BAUD
:BUS1:CAN:BAUD 120000        /* 设置 CAN 解码的信号速率为 120000bps*/
:BUS1:CAN:BAUD?              /* 查询返回 120000*/
## 4.14.4:BUS<n>:CAN:SPOint
:BUS1:CAN:SPOint 70        /* 设置 CAN 解码的采样点位置为 70%*/
:BUS1:CAN:SPOint?          /* 查询返回 70*/

---

## 4.15:BUS<n>:LIN

**语法**: `:BUS<n>:LIN:PARity <bool>
:BUS<n>:LIN:PARity?
:BUS<n>:LIN:SOURce <source>
:BUS<n>:LIN:SOURce?
:BUS<n>:LIN:STANdard <value>
:BUS<n>:LIN:STANdard?`

**描述**: 设置或查询指定解码总线的 LIN 解码是否包含校验位。设置或查询指定解码总线为 LIN 解码时的信号源。设置或查询指定解码总线为 LIN 解码时的版本。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -

**说明**: 仅 DHO900 系列支持:BUS<n>:LIN 命令。
## 4.15.1:BUS<n>:LIN:PARity
• 1|ON： 包含校验位。
• 0|OFF： 不包含校验位。参数 D0~D15 数字通道仅 DHO900 系列支持。
查询返回 0 或 1。查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。

**举例**: :BUS1:LIN:PARity ON            /* 设置 LIN 解码包含校验位*/
:BUS1:LIN:PARity?                /* 查询返回 1*/

## 4.15.2:BUS<n>:LIN:SOURce
:BUS1:LIN:SOURce CHANnel2      /* 设置 LIN 信号源为 CHANnel2*/
:BUS1:LIN:SOURce?            /* 查询返回 CHAN2*/
## 4.15.3:BUS<n>:LIN:STANdard

---

# 5 伯德图命令子系统
:BODeplot 命令系统用于伯德图功能的相关设置。
伯德图是系统频率响应的一种图示方法。通过伯德图可以分析出系统的增益裕度和相位裕度，
以判定系统的稳定性。
数字示波器通过内置的信号发生模块，产生指定频率范围内的扫频信号，输出到被测的开关电
源电路的注入点，示波器测试注入端和输出端在不同频率下的相位差变化的曲线和增益变化的
曲线绘制出伯德图。
仅 DHO914S 和 DHO924S 型号支持此命令。
## 5.1:BODeplot:ENABle

**语法**: `:BODeplot:ENABle <bool>
:BODeplot:ENABle?`

**描述**: 设置或查询伯德图功能的使能状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :BODeplot:ENABle ON    /* 打开伯德图使能开关*/
:BODeplot:ENABle?    /* 查询返回 1*/

---

## 5.2:BODeplot:RUNStop

**语法**: `:BODeplot:RUNStop <bool>
:BODeplot:RUNStop?`

**描述**: 设置或查询伯德图运行状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :BODeplot:RUNStop ON /* 运行伯德图*/
:BODeplot:RUNStop? /* 查询返回 1*/

---

## 5.3:BODeplot:SWEeptype

**语法**: `:BODeplot:SWEeptype <type>
:BODeplot:SWEeptype?`

**描述**: 设置或查询伯德图的扫频类型。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {LOG|LINE} LOG

**说明**: • LOG： 对数，扫频正弦波的频率按对数规律变化。
• LINE： 线性，扫频正弦波的频率随时间线性变化。
**返回格式**: 查询返回 LOG 或 LINE。
**举例**: :BODeplot:SWEeptype LINE    /* 设置伯德图的扫频类型*/
:BODeplot:SWEeptype?      /* 查询返回 LINE*/

---

## 5.4:BODeplot:REF:IN

**语法**: `:BODeplot:REF:IN <source>
:BODeplot:REF:IN?`

**描述**: 设置或查询伯德图输入源。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 无。
**返回格式**: 查询返回 CHANnel1、CHANnel2、CHANnel3 或 CHANnel4。
**举例**: :BODeplot:REF:IN CHANnel1    /* 设置伯德图输入源*/
:BODeplot:REF:IN?      /* 查询返回 CHANnel1*/

---

## 5.5:BODeplot:REF:OUT

**语法**: `:BODeplot:REF:OUT <source>
:BODeplot:REF:OUT?`

**描述**: 设置或查询伯德图输出源。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 无。
**返回格式**: 查询返回 CHANnel1、CHANnel2、CHANnel3 或 CHANnel4。
**举例**: :BODeplot:REF:OUT CHANnel1    /* 设置伯德图输出源*/
:BODeplot:REF:OUT?      /* 查询返回 CHANnel1*/

---

## 5.6:BODeplot:STARt

**语法**: `:BODeplot:STARt <freq>
:BODeplot:STARt?`

**描述**: 设置或查询伯德图功能扫频信号的起始频率，默认单位为 Hz。
**参数**: 名称 类型 范围 默认值
<freq> 实型 10 Hz 至 24.99 MHz 100 Hz

**说明**: 设置的“起始频率”值应小于“终止频率”值。可通过:BODeplot:STOP 命令设置或查询扫频信号的终止频率。
**返回格式**: 以科学计数形式返回起始频率值，单位为 Hz。
**举例**: :BODeplot:STARt 100    /* 设置起始频率为 100Hz*/
:BODeplot:STARt?      /* 查询返回 1.000000E+2*/

---

## 5.7:BODeplot:STOP

**语法**: `:BODeplot:STOP <freq>
:BODeplot:STOP?`

**描述**: 设置或查询伯德图功能扫频信号的终止频率，默认单位为 Hz。
**参数**: 名称 类型 范围 默认值
<freq> 实型 100 Hz 至 25 MHz 1 MHz

**说明**: 设置的“终止频率”值应大于“起始频率”值。可通过:BODeplot:STARt 命令设置或查询扫频信号的起始频率。
**返回格式**: 以科学计数形式返回终止频率值，单位为 Hz。
**举例**: :BODeplot:STOP 500    /* 设置终止频率为 500Hz*/
:BODeplot:STOP?      /* 查询返回 5.000000E+2*/

---

## 5.8:BODeplot:POINts

**语法**: `:BODeplot:POINts <num>
:BODeplot:POINts?`

**描述**: 设置或查询十倍频点数。
**参数**: 名称 类型 范围 默认值
<num> 整型 10 至 300 10

**说明**: 无。
**返回格式**: 以整型形式返回十倍频点数。
**举例**: :BODeplot:POINts 20    /* 设置十倍频点数为 20*/
:BODeplot:POINts?      /* 查询返回 20*/

---

## 5.9:BODeplot:VOLTage

**语法**: `:BODeplot:VOLTage <range>,<amp>
:BODeplot:VOLTage? <range>`

**描述**: 设置或查询伯德图功能指定频率范围的扫频信号的电压幅值，电压默认单位为 V，频率默认单位为 Hz。
**参数**: 名称 类型 范围 默认值
<amp> 实型 请参考说明 200 mV
<range> 离散型
{ALL|10|100|1K|10K|100K|1M|
10M|25M|1000|10000|100000|
1000000|10000000|25000000|
1e1|1e2|1e3|1e4|1e5|1e6|1e7|
2.5e7}
-

**说明**: <amp>的取值范围为： 20 mV 至 5 V。
• 当<range>为 ALL 时：为所有频率范围的扫频信号设置统一的电压幅值，扫频信号的电压幅值不可变。
• 当<range>为其他时：扫频信号的电压幅值可变，可为频率大于所选值的扫频信号设置电压幅值。
**返回格式**: 查询以实数形式返回输出的指定频率范围内扫频信号的电压幅值，单位为 V。
**举例**: :BODeplot:VOLTage 100,0.3   /* 设置大于 100Hz 频段幅度输出为 300mV*/
:BODeplot:VOLTage? 100    /* 查询返回 0.300000*/

---

# 6 通道命令子系统
通道命令用于设置或查询模拟通道的带宽限制、耦合、垂直档位以及垂直偏移等垂直系统参
数。
• 设置带宽限制可以减少显示波形中的噪声。例如：被测信号是一个含有高频振荡的脉冲信号，当关闭带宽限制时，被测信号含有的高频分量可以通过；当打开带宽限制时，被测信号中含有的大于带宽限制的高频分量被衰减。
• 设置耦合方式可以滤除不需要的信号。例如：被测信号是一个含有直流偏置的方波信号，设置耦合方式为交流可以阻隔直流分量。
• 使用示波器进行实际测量时，因为器件的温漂特性或者外界环境干扰造成通道的零点电压出现小幅度偏移，影响垂直参数的测量结果。本系列示波器支持用户设定一个消零电压（偏置）以校正对应通道的零点，从而提高测量结果的准确性。
• 打开微调，将在较小范围内进一步调整垂直档位，以改善垂直分辨率，利于观察信号细节。
## 6.1:CHANnel<n>:BWLimit

**语法**: `:CHANnel<n>:BWLimit <val>
:CHANnel<n>:BWLimit?`

**描述**: 设置或查询指定通道的带宽限制参数。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<val> 离散型 请参考说明 OFF

**说明**: 本系列示波器支持 20 MHz 带宽限制。设置参数为 OFF，则关闭带宽限制功能。
**返回格式**: 查询返回 20M 或 OFF。
**举例**: :CHANnel1:BWLimit 20M /* 打开 20MHz 带宽限制*/
:CHANnel1:BWLimit? /* 查询返回 20M*/

---

## 6.2:CHANnel<n>:COUPling

**语法**: `:CHANnel<n>:COUPling <coupling>
:CHANnel<n>:COUPling?`

**描述**: 设置或查询指定通道的耦合方式。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<coupling> 离散型 {AC|DC|GND} DC

**说明**: • AC： 被测信号含有的直流分量被阻隔。
• DC： 被测信号含有的直流分量和交流分量都可以通过。
• GND： 被测信号含有的直流分量和交流分量均被阻隔。
**返回格式**: 查询返回 AC、DC 或 GND。
**举例**: :CHANnel1:COUPling AC /* 选择 AC 耦合方式*/
:CHANnel1:COUPling? /* 查询返回 AC*/

---

## 6.3:CHANnel<n>:DISPlay

**语法**: `:CHANnel<n>:DISPlay <bool>
:CHANnel<n>:DISPlay?`

**描述**: 打开或关闭指定通道，或查询指定通道的开关状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :CHANnel1:DISPlay ON /* 打开 CHANnel1*/
:CHANnel1:DISPlay? /* 查询返回 1*/

---

## 6.4:CHANnel<n>:INVert

**语法**: `:CHANnel<n>:INVert <bool>
:CHANnel<n>:INVert?`

**描述**: 打开或关闭指定通道的波形反相，或查询指定通道波形反相的开关状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 关闭波形反相时，波形正常显示；打开波形反相时，波形电压值被反相。
**返回格式**: 查询返回 1 或 0。
**举例**: :CHANnel1:INVert ON /* 打开 CH1 的波形反相*/
:CHANnel1:INVert? /* 查询返回 1*/

---

## 6.5:CHANnel<n>:OFFSet

**语法**: `:CHANnel<n>:OFFSet <offset>
:CHANnel<n>:OFFSet?`

**描述**: 设置或查询指定通道的垂直偏移，默认单位为 V。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<offset> 实型 请参考说明 0V

**说明**: 通道垂直偏移的取值范围与当前的垂直档位有关。
• ± 0.5 V ( <500 μV/div )
• ± 1 V ( ≥500 μV/div，≤65 mV/div )
• ± 8 V ( ≥65.01 mV/div，≤260 mV/div )
• ± 20 V ( ≥260.01 mV/div，≤2.65 V/div )
• ± 100 V ( ≥2.6501 V/div，≤10 V/div )可通过:CHANnel<n>:SCALe 命令，设置或查询指定通道的垂直档位。
**返回格式**: 查询以科学计数形式返回垂直偏移值。
**举例**: :CHANnel1:OFFSet 0.01 /* 设置 CH1 的垂直偏移为 10mV*/
:CHANnel1:OFFSet? /* 查询返回 1.000000E-02*/

---

## 6.6:CHANnel<n>:TCALibrate

**语法**: `:CHANnel<n>:TCALibrate <val>
:CHANnel<n>:TCALibrate?`

**描述**: 设置或查询指定通道的延时校正时间，用于校正对应通道的零点偏移，单位为 s。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<val> 实型 -100ns 至 100ns 0s

**说明**: 当水平时基大于 10 us 时不可设置。
**返回格式**: 查询以科学计数形式返回延时校正时间值。
**举例**: :CHANnel1:TCALibrate 0.00000002 /* 将延时校正时间设置为 20ns*/
:CHANnel1:TCALibrate?           /* 查询返回 2.000000E-8*/

---

## 6.7:CHANnel<n>:SCALe

**语法**: `:CHANnel<n>:SCALe <scale>
:CHANnel<n>:SCALe?`

**描述**: 设置或查询指定通道的垂直档位，单位默认为 V/div。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<scale> 实型 请参考说明 50mV

**说明**: 通道的垂直档位的取值范围与探头比有关。
• DHO800 系列：500 μV/div 至 10 V/div（探头比为 1X）。
• DHO900 系列：200 μV/div 至 10 V/div（探头比为 1X）。可通过:CHANnel<n>:PROBe 命令，设置或查询指定通道的探头比。
**返回格式**: 查询以科学计数形式返回垂直档位值，单位为 V/div。
**举例**: :CHANnel1:SCALe 0.1 /* 设置 CH1 的垂直档位为 0.1V/div*/
:CHANnel1:SCALe? /* 查询返回 1.000000E-01*/

---

## 6.8:CHANnel<n>:PROBe

**语法**: `:CHANnel<n>:PROBe <atten>
:CHANnel<n>:PROBe?`

**描述**: 设置或查询指定通道的探头比。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<atten> 离散型
{0.001|0.002|0.005|0.01|0.02|
0.05|0.1|0.2|0.5|1|2|5|10|20|50|
100|200|500|1000|2000|5000|
10000|20000|50000}

**说明**: • 被测信号的显示幅度 = 被测信号的实际幅度 × 探头比（探头比并不影响信号实际幅值）。
• 设置探头比影响当前垂直档位的值和可设置范围。可通过:CHANnel<n>:SCALe 命令查询垂直档位。
查询返回 0.001、0.002、0.005、0.01、0.02、0.05、0.1、0.2、0.5、1、2、5、10、20、 50、100、200、500、1000、2000、5000、10000、20000 或 50000。

**举例**: :CHANnel1:PROBe 10 /* 设置 CH1 的衰减比为 10X*/
:CHANnel1:PROBe? /* 查询返回 10*/

---

## 6.9:CHANnel<n>:LABel:SHOW

**语法**: `:CHANnel<n>:LABel:SHOW <bool>
:CHANnel<n>:LABel:SHOW?`

**描述**: 设置或查询指定通道标签的显示状态。
**参数**: 名称 类型 范围 默认值
<n> 离散 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} -

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :CHANnel1:LABel:SHOW ON /* 打开通道标签显示*/
:CHANnel1:LABel:SHOW? /* 查询返回 1*/

---

## 6.10:CHANnel<n>:LABel:CONTent

**语法**: `:CHANnel<n>:LABel:CONTent <str>
:CHANnel<n>:LABel:CONTent?`

**描述**: 设置或查询指定通道的标签。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<str> ASCII 字符串 包含英文字母和数字，也可包含部
分符号 -

**说明**: 无。
**返回格式**: 以字符串形式返回指定通道的标签。
**举例**: :CHANnel1:LABel:CONTent ch1 /* 设置通道 1 的标签为 ch1*/
:CHANnel1:LABel:CONTent? /* 查询返回 ch1*/

---

## 6.11:CHANnel<n>:UNITs

**语法**: `:CHANnel<n>:UNITs <units>
:CHANnel<n>:UNITs?`

**描述**: 设置或查询指定通道的幅度显示单位。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<units> 离散型 {WATT|AMPere|VOLTage|
UNKNown} VOLTage

**说明**: 无。
**返回格式**: 查询返回 VOLT、WATT、AMP 或 UNKN。
**举例**: :CHANnel1:UNITs VOLTage /* 将 CH1 的幅度显示单位设置为 V*/
:CHANnel1:UNITs? /* 查询返回 VOLT*/

---

## 6.12:CHANnel<n>:VERNier

**语法**: `:CHANnel<n>:VERNier <bool>
:CHANnel<n>:VERNier?`

**描述**: 打开或关闭指定通道垂直档位的微调功能，或查询指定通道垂直档位的微调功能状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -

名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :CHANnel1:VERNier ON /* 打开 CH1 垂直档位的微调功能*/
:CHANnel1:VERNier? /* 查询返回 1*/

---

## 6.13:CHANnel<n>:POSition

**语法**: `:CHANnel<n>:POSition <offset>
:CHANnel<n>:POSition?`

**描述**: 设置或查询指定通道的偏置电压，单位默认为 V。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<offset> 实型 请参考说明 0

**说明**: 通道的偏置电压的取值范围与垂直档位有关。
• ± 0.5 V ( <500 μV/div )
• ± 1 V ( ≥500 μV/div，≤65 mV/div )
• ± 8 V ( ≥65.01 mV/div，≤260 mV/div )
• ± 20 V ( ≥260.01 mV/div，≤2.65 V/div )
• ± 100 V ( ≥2.6501 V/div，≤10 V/div )可通过:CHANnel<n>:SCALe 命令，设置或查询指定通道的垂直档位。
**返回格式**: 查询以科学计数形式返回通道偏置电压，单位为 V。

---

# 7 频率计命令子系统
频率计命令用于设置或查询频率计测量、统计等参数。
频率计分析功能可在任何模拟通道上提供频率、周期或边沿事件的计数测量。
## 7.1:COUNter:CURRent?

**语法**: `:COUNter:CURRent?`
**描述**: 查询频率计测量值。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以科学计数形式返回当前频率计的测量值。
**举例**: 无。

---

## 7.2:COUNter:ENABle

**语法**: `:COUNter:ENABle <bool>
:COUNter:ENABle?`

**描述**: 打开或关闭频率计，或查询频率计开关的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :COUNter:ENABle ON    /* 打开频率计*/
:COUNter:ENABle?      /* 查询返回 1*/

---

## 7.3:COUNter:SOURce

**语法**: `:COUNter:SOURce <source>
:COUNter:SOURce?`

**描述**: 设置或查询频率计信源。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|EXT}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。参数“EXT”仅 DHO812 和 DHO802 型号支持。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 EXT。

**举例**: :COUNter:SOURce CHANnel2     /* 设置频率计信源为 CHANnel2*/
:COUNter:SOURce?             /* 查询返回 CHAN2*/

---

## 7.4:COUNter:MODE

**语法**: `:COUNter:MODE <mode>
:COUNter:MODE?`

**描述**: 设置或查询频率计模式。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {FREQuency|PERiod|TOTalize} FREQuency

**说明**: • FREQuency： 频率测量
• PERiod： 周期测量
• TOTalize： 累加测量
**返回格式**: 查询返回 FREQ、PER 或 TOT。
**举例**: :COUNter:MODE PERiod       /* 设置频率计模式为 PERiod*/
:COUNter:MODE?             /* 查询返回 PER*/

---

## 7.5:COUNter:NDIGits

**语法**: `:COUNter:NDIGits <val>
:COUNter:NDIGits?`

**描述**: 设置或查询频率计分辨率。
**参数**: 名称 类型 范围 默认值
<val> 整型 3 至 6 4

**说明**: 当频率计测量模式为周期或频率时需要设置分辨率，累加值测量无此功能。可通过命令 :COUNter:MODE 查询或设置频率计测量模式。
**返回格式**: 查询返回 3 至 6 之间的一个整数。
**举例**: :COUNter:NDIGits 4             /* 设置频率计分辨率为 4*/
:COUNter:NDIGits?              /* 查询返回 4*/

---

## 7.6:COUNter:TOTalize:ENABle

**语法**: `:COUNter:TOTalize:ENABle <bool>
:COUNter:TOTalize:ENABle?`

**描述**: 打开或关闭频率计统计功能，或查询频率计统计功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 当频率计测量模式为周期或频率时支持此功能，累加值测量不支持。可通过命令 :COUNter:MODE 查询或设置频率计测量模式。
**返回格式**: 查询返回 1 或 0。
**举例**: :COUNter:TOTalize:ENABle ON    /* 打开频率计统计功能*/
:COUNter:TOTalize:ENABle?      /* 查询返回 1*/

---

## 7.7:COUNter:TOTalize:CLEar

**语法**: `:COUNter:TOTalize:CLEar`
**描述**: 清除总计数。
**参数**: 无。
**说明**: 测量为累加、频率和周期项时可使用此命令。

---

# 8 光标命令子系统
光标命令用于测量屏幕波形的 X 轴值（如时间）和 Y 轴值（如电压）。
使用光标测量前，请将信号连接至示波器并获得稳定的显示。光标测量功能提供如下两种光
标。
X光标（光标A） X光标（光标B）
Y光标
（光标B）
Y光标
（光标A）
• X 光标
X 光标是用于水平调整的垂直实/虚线，可以用于测量时间（s）和频率（Hz）。
- 光标 A 是垂直实线，光标 B 是垂直虚线。
- 在 XY 光标模式中，X 光标用于测量 CH1 的波形幅度。
• Y 光标
Y 光标是用于垂直调整的水平实/虚线，可以用于测量幅度（与信源通道幅度单位一
致）。
- 光标 A 是水平实线，光标 B 是水平虚线。
- 在 XY 光标模式中，Y 光标用于测量 CH2 的波形幅度。
光标测量结果
• AX：光标 A 处的 X 值。
• AY：光标 A 处的 Y 值。
• BX：光标 B 处的 X 值。
• BY：光标 B 处的 Y 值。
• ∆X：光标 A 和 B 的水平间距。
• ∆Y：光标 A 和 B 的垂直间距。
• 1/∆X：光标 A 和 B 的水平间距的倒数。光标测量模式
• 手动光标在手动光标模式下，可以通过手动调整光标，测量指定信源波形在当前光标处的值。若光标类型、测量信源等参数的设置不同，使用光标测量得到的结果也不同。
• 追踪光标在追踪光标模式下，可以调节两个光标（光标 A 和光标 B）分别测量两个不同信源的 X值和 Y 值。水平/垂直移动光标时，该标记会自动在波形上定位，水平/垂直扩展或压缩波形时，该标记会跟踪最后一次调节光标时所标记的点。
• XY 光标
XY 光标模式在默认情况下不可选，仅在 XY 水平时基模式下可选。
## 8.1:CURSor:MODE

**语法**: `:CURSor:MODE <mode>
:CURSor:MODE?`

**描述**: 设置或查询光标测量的模式。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {OFF|MANual|TRACk|XY} OFF

**说明**: • OFF： 关闭光标测量功能。
• MANual： 手动光标模式。
• TRACk： 光标追踪模式。
• XY： XY 光标模式，仅当 XY 模式（可通过命令 :TIMebase:MODE 查询或设置）下有效。不同光标测量模式的功能请参考 光标测量模式 。
**返回格式**: 查询返回 OFF、MAN、TRAC 或 XY。
**举例**: :CURSor:MODE MANual /* 选择手动光标测量模式*/
:CURSor:MODE? /* 查询返回 MAN*/

---

## 8.2:CURSor:MEASure:INDicator

**语法**: `:CURSor:MEASure:INDicator <bool>
:CURSor:MEASure:INDicator?`

**描述**: 设置或查询测量功能的光标指示的状态为打开或关闭。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 0 或 1。
**举例**: :CURSor:MEASure:INDicator ON /* 设置测量功能的光标指示的状态为打开*/
:CURSor:MEASure:INDicator? /* 查询返回 1*/

---

## 8.3:CURSor:MANual

**语法**: `:CURSor:MANual:TYPE <type>
:CURSor:MANual:TYPE?

:CURSor:MANual:SOURce <source>
:CURSor:MANual:SOURce?
:CURSor:MANual:CAX <ax>
:CURSor:MANual:CAX?
:CURSor:MANual:CAY <ay>
:CURSor:MANual:CAY?
:CURSor:MANual:CBX <bx>
:CURSor:MANual:CBX?
:CURSor:MANual:CBY <by>
:CURSor:MANual:CBY?
:CURSor:MANual:AXValue?
:CURSor:MANual:AYValue?
:CURSor:MANual:BXValue?
:CURSor:MANual:BYValue?
:CURSor:MANual:XDELta?
:CURSor:MANual:IXDelta?
:CURSor:MANual:YDELta?`

**描述**: 设置或查询手动光标的光标类型。设置或查询手动光标的通道源。设置或查询手动光标测量时，光标 A 的水平位置。设置或查询手动光标测量时，光标 A 的垂直位置。设置或查询手动光标测量时，光标 B 的水平位置。设置或查询手动光标测量时，光标 B 的垂直位置。查询手动光标测量时，光标 A 处的 X 值。单位由当前对应通道选择的水平单位决定。查询手动光标测量时，光标 A 处的 Y 值。单位由当前选择的垂直单位决定。查询手动光标测量时，光标 B 处的 X 值。单位由当前选择的水平单位决定。查询手动光标测量时，光标 B 处的 Y 值。单位由当前选择的垂直单位决定。查询手动光标测量时，光标 A 处和光标 B 处的 X 值之间的差值∆X。单位由当前选择的水平单位决定。查询手动光标测量时，光标 A 处和光标 B 处的 X 值之差的绝对值的倒数 1/∆X。单位由当前选择的水平单位决定。查询手动光标测量时，光标 A 处和光标 B 处的 Y 值之间的差值∆Y。单位由当前选择的垂直单位决定。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {TIME|AMPLitude} TIME
名称 类型 范围 默认值
<source> 离散型
{CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4|NONE}
CHANnel1
名称 类型 范围 默认值
<ax> 实型 请参考说明 -
名称 类型 范围 默认值
<ay> 实型 请参考说明 -
名称 类型 范围 默认值
<bx> 实型 请参考说明 -
名称 类型 范围 默认值
<by> 实型 请参考说明 -




**说明**: • TIME： X 光标，常用于测量时间参数。
• AMPLitude： Y 光标，常用于测量电压参数。通道源选择 NONE，则关闭手动光标。光标 A 的水平位置取值范围取决于当前的水平时基和水平位移。光标 A 的垂直位置的取值范围取决于当前的垂直档位和垂直偏移。光标 B 的水平位置取值范围取决于当前的水平时基和水平位移。光标 B 的垂直位置的取值范围取决于当前的垂直档位和垂直偏移。无。
• 返回值与 cursor 界面测量值相同，因此单位与垂直单位相关，当 cursor 垂直单位设置为信源时，返回值单位与通道垂直档位的单位相同。
• 当 cursor 测量值无效时不返回。无。
• 返回值与 cursor 界面测量值相同，因此单位与垂直单位相关，当 cursor 垂直单位设置为信源时，返回值单位与通道垂直档位的单位相同。
• 当 cursor 测量值无效时不返回。无。无。无。
**返回格式**: 查询返回 TIME 或 AMPL。查询返回 CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3、MATH4或 NONE。查询以科学计数形式返回光标 A 的水平位置，单位为 s。查询以科学计数形式返回光标 A 的垂直位置，单位为 V。查询以科学计数形式返回光标 B 的水平位置，单位为 s。查询以科学计数形式返回光标 B 的垂直位置，单位为 V。查询以科学计数形式返回当前光标 A 处的 X 值。查询以科学计数形式返回当前光标 A 处的 Y 值。查询以科学计数形式返回当前光标 B 处的 X 值。查询以科学计数形式返回当前光标 B 处的 Y 值。查询以科学计数形式返回当前差值。查询以科学计数形式返回 1/∆X。查询以科学计数形式返回当前差值。
**举例**: :CURSor:MANual:TYPE AMPLitude /* 设置光标类型为 AMPLitude*/
:CURSor:MANual:TYPE? /* 查询返回 AMPL*/
## 8.3.2:CURSor:MANual:SOURce
:CURSor:MANual:SOURce CHANnel2 /* 设置通道源为 CHANnel2*/
:CURSor:MANual:SOURce? /* 查询返回 CHAN2*/
## 8.3.3:CURSor:MANual:CAX
:CURSor:MANual:CAX 0.00000001 /* 设置光标 A 的水平位置为 10ns*/
:CURSor:MANual:CAX?            /* 查询返回 1.000000E-8*/
## 8.3.4:CURSor:MANual:CAY
:CURSor:MANual:CAY 0.1  /* 设置光标 A 的垂直位置为 0.1V*/
:CURSor:MANual:CAY?     /* 查询返回 1.000000E-1*/
## 8.3.5:CURSor:MANual:CBX
:CURSor:MANual:CBX 0.00000001 /* 设置光标 B 的水平位置为 10ns*/
:CURSor:MANual:CBX?            /* 查询返回 1.000000E-8*/
## 8.3.6:CURSor:MANual:CBY
:CURSor:MANual:CBY 0.1  /* 设置光标 B 的垂直位置为 0.1V*/
:CURSor:MANual:CBY?  /* 查询返回 1.000000E-1*/
## 8.3.7:CURSor:MANual:AXValue?
## 8.3.8:CURSor:MANual:AYValue?
## 8.3.9:CURSor:MANual:BXValue?
## 8.3.10:CURSor:MANual:BYValue?
## 8.3.11:CURSor:MANual:XDELta?
## 8.3.12:CURSor:MANual:IXDelta?
## 8.3.13:CURSor:MANual:YDELta?

---

## 8.4:CURSor:TRACk

**语法**: `:CURSor:TRACk:SOURce1 <source>
:CURSor:TRACk:SOURce1?
:CURSor:TRACk:SOURce2 <source>
:CURSor:TRACk:SOURce2?
:CURSor:TRACk:CAX <ax>
:CURSor:TRACk:CAX?
:CURSor:TRACk:CBX <bx>
:CURSor:TRACk:CBX?
:CURSor:TRACk:CAY <ay>
:CURSor:TRACk:CAY?
:CURSor:TRACk:CBY <by>
:CURSor:TRACk:CBY?
:CURSor:TRACk:AXValue?
:CURSor:TRACk:AYValue?
:CURSor:TRACk:BXValue?
:CURSor:TRACk:BYValue?
:CURSor:TRACk:XDELta?
:CURSor:TRACk:YDELta?
:CURSor:TRACk:IXDelta?
:CURSor:TRACk:MODE <mode>
:CURSor:TRACk:MODE?`

**描述**: 设置或查询光标追踪测量时，光标 A 测量的通道源。设置或查询光标追踪测量时，光标 B 测量的通道源。设置或查询光标追踪测量时，光标 A 的水平位置。设置或查询光标追踪测量时，光标 B 的水平位置。设置或查询光标追踪测量时，光标 A 的垂直位置。设置或查询光标追踪测量时，光标 B 的垂直位置。查询光标追踪测量时，光标 A 处的 X 值。单位由当前对应通道选择的幅度单位决定。查询光标追踪测量时，光标 A 处的 Y 值。单位与当前通道选择的单位相同。查询光标追踪测量时，光标 B 处的 X 值。单位由当前对应通道选择的幅度单位决定。查询光标追踪测量时，光标 B 处的 Y 值。单位与当前通道选择的单位相同。查询光标追踪测量时，光标 A 处和光标 B 处的 X 值之间的差值∆X。查询光标追踪测量时，光标 A 处和光标 B 处的 Y 值之间的差值∆Y。单位与当前通道选择的单位相同。查询光标追踪测量时，光标 A 处和光标 B 处的 X 值之差的绝对值的倒数 1/∆X。默认单位为
Hz。
设置或查询光标追踪测量时的坐标轴。

**参数**: 名称 类型 范围 默认值
<source> 离散型
{CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4|NONE}
CHANnel1
名称 类型 范围 默认值
<source> 离散型
{CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4|NONE}
CHANnel1
名称 类型 范围 默认值
<ax> 实型 请参考说明 -
名称 类型 范围 默认值
<bx> 实型 请参考说明 -
名称 类型 范围 默认值
<ay> 实型 请参考说明 -
名称 类型 范围 默认值
<by> 实型 请参考说明 -
名称 类型 范围 默认值
<mode> 离散型 {Y|X} -

**说明**: 当选择通道未打开时，发送命令会自动打开相应通道。当选择通道未打开时，发送命令会自动打开相应通道。光标 A 的水平位置取值范围取决于当前的水平时基和水平位移。光标 B 的水平位置取值范围取决于当前的水平时基和水平位移。光标 A 的垂直位置的取值范围取决于当前的垂直档位和垂直偏移。光标 B 的垂直位置的取值范围取决于当前的垂直档位和垂直偏移。无。无。无。无。无。无。无。无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3、MATH4或 NONE。查询返回 CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3、MATH4或 NONE。查询以科学计数形式返回光标 A 的水平位置，单位为 s。查询以科学计数形式返回光标 B 的水平位置，单位为 s。查询以科学计数形式返回光标 A 的垂直位置，单位为 V。查询以科学计数形式返回光标 B 的垂直位置，单位为 V。查询以科学计数形式返回当前光标 A 处的 X 值。查询以科学计数形式返回当前光标 A 处的 Y 值。查询以科学计数形式返回当前光标 B 处的 X 值。查询以科学计数形式返回当前光标 B 处的 Y 值。查询以科学计数形式返回当前差值。查询以科学计数形式返回当前差值。查询以科学计数形式返回 1/∆X。查询返回 Y 或 X。
**举例**: :CURSor:TRACk:SOURce1 CHANnel2 /* 设置通道源为 CHANnel2*/
:CURSor:TRACk:SOURce1? /* 查询返回 CHAN2*/
## 8.4.2:CURSor:TRACk:SOURce2
:CURSor:TRACk:SOURce2 CHANnel2 /* 设置通道源为 CHANnel2*/
:CURSor:TRACk:SOURce2? /* 查询返回 CHAN2*/

## 8.4.3:CURSor:TRACk:CAX
:CURSor:TRACk:CAX 1.000000E-8 /* 设置光标 A 的水平位置为 10ns*/
:CURSor:TRACk:CAX? /* 查询返回 1.000000E-8*/
## 8.4.4:CURSor:TRACk:CBX
:CURSor:TRACk:CBX 1.000000E-8 /* 设置光标 B 的水平位置为 10ns*/
:CURSor:TRACk:CBX? /* 查询返回 1.000000E-8*/
## 8.4.5:CURSor:TRACk:CAY
:CURSor:TRACk:CAY 0.1  /* 设置光标 A 的垂直位置为 0.1V*/
:CURSor:TRACk:CAY?  /* 查询返回 1.000000E-1*/
## 8.4.6:CURSor:TRACk:CBY
:CURSor:TRACk:CBY 0.1 /* 设置光标 B 的垂直位置为 0.1V*/
:CURSor:TRACk:CBY? /* 查询返回 1.000000E-1*/
## 8.4.7:CURSor:TRACk:AXValue?
## 8.4.8:CURSor:TRACk:AYValue?
## 8.4.9:CURSor:TRACk:BXValue?
## 8.4.10:CURSor:TRACk:BYValue?

## 8.4.11:CURSor:TRACk:XDELta?
## 8.4.12:CURSor:TRACk:YDELta?

## 8.4.13:CURSor:TRACk:IXDelta?
## 8.4.14:CURSor:TRACk:MODE
:CURSor:TRACk:MODE X /* 设置光标追踪测量时的坐标轴为 X 轴*/
:CURSor:TRACk:MODE? /* 查询返回 X*/

---

## 8.5:CURSor:XY

**语法**: `:CURSor:XY:AX <x>
:CURSor:XY:AX?
:CURSor:XY:BX <x>
:CURSor:XY:BX?
:CURSor:XY:AY <y>
:CURSor:XY:AY?
:CURSor:XY:BY <y>
:CURSor:XY:BY?
:CURSor:XY:AXValue?
:CURSor:XY:AYValue?
:CURSor:XY:BXValue?
:CURSor:XY:BYValue?
:CURSor:XY:XDELta?
:CURSor:XY:YDELta?`

**描述**: 设置或查询 XY 光标测量时，光标 A 的水平位置。设置或查询 XY 光标测量时，光标 B 的水平位置。设置或查询 XY 光标测量时，光标 A 的垂直位置。设置或查询 XY 光标测量时，光标 B 的垂直位置。查询 XY 光标测量时，光标 A 处的 X 值。查询 XY 光标测量时，光标 A 处的 Y 值。查询 XY 光标测量时，手动光标模式，光标 B 处的 X 值。查询 XY 光标测量时，手动光标模式，光标 B 处的 Y 值。查询 XY 光标测量时，光标 A 处与光标 B 处的 X 值之间的差值∆X。查询 XY 光标测量时，光标 A 处与光标 B 处的 Y 值之间的差值∆Y。单位与当前通道选择的单位相同。
**参数**: 名称 类型 范围 默认值
<x> 实型 请参考说明 -
名称 类型 范围 默认值
<x> 实型 请参考说明 -
名称 类型 范围 默认值
<y> 实型 请参考说明 -
名称 类型 范围 默认值
<y> 实型 请参考说明 -


**说明**: 与当前的垂直档位和偏移有关。与当前的垂直档位和偏移有关。与当前的垂直档位和偏移有关。与当前的垂直档位和偏移有关。无。无。无。无。无。无。
**返回格式**: 查询以科学计数形式返回光标 A 的水平位置，单位为 V。查询以科学计数形式返回光标 B 的水平位置。查询以科学计数形式返回光标 A 的垂直位置。查询以科学计数形式返回光标 B 的垂直位置。查询以科学计数形式返回当前光标 A 处的 X 值。查询以科学计数形式返回当前光标 A 处的 Y 值。查询以科学计数形式返回当前光标 B 处的 X 值。查询以科学计数形式返回当前光标 B 处的 Y 值。查询以科学计数形式返回当前差值。查询以科学计数形式返回当前差值。
**举例**: :CURSor:XY:AX 0.1 /* 设置光标 A 的水平位置为 100 mV*/
:CURSor:XY:AX? /* 查询返回 1.000000E-1*/
## 8.5.2:CURSor:XY:BX
:CURSor:XY:BX 0.1 /* 设置光标 B 的水平位置为 100mV*/
:CURSor:XY:BX?    /* 查询返回 1.000000E-1*/
## 8.5.3:CURSor:XY:AY
:CURSor:XY:AY 0.1 /* 设置光标 A 的垂直位置为 100 mV*/
:CURSor:XY:AY?    /* 查询返回 1.000000E-1*/
## 8.5.4:CURSor:XY:BY
:CURSor:XY:BY 0.1 /* 设置光标 B 的垂直位置为 100 mV*/
:CURSor:XY:BY?    /* 查询返回 1.000000E-1*/
## 8.5.5:CURSor:XY:AXValue?
## 8.5.6:CURSor:XY:AYValue?
## 8.5.7:CURSor:XY:BXValue?
## 8.5.8:CURSor:XY:BYValue?
## 8.5.9:CURSor:XY:XDELta?
## 8.5.10:CURSor:XY:YDELta?

---

# 9 显示命令子系统
显示命令可以设置波形显示的类型、余辉时间、波形亮度、屏幕显示的网格类型以及网格亮度
等。
## 9.1:DISPlay:CLEar

**语法**: `:DISPlay:CLEar`
**描述**: 清除屏幕上的所有波形。
**参数**: 无。
**说明**: • 如果示波器处于 RUN 状态，则清除后继续显示新波形。
• 您也可以使用命令 :CLEar 清除屏幕上的所有波形。
• 该命令功能等同于按前面板 
  按键。

**返回格式**: 无。
**举例**: 无。

---

## 9.2:DISPlay:TYPE

**语法**: `:DISPlay:TYPE <type>
:DISPlay:TYPE?`

**描述**: 设置或查询屏幕中波形的显示方式。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {VECTors} VECTors

**说明**: VECTors：采样点之间通过连线的方式显示。该模式在大多情况下提供最逼真的波形。可方便查看波形（例如方波）的陡边沿。
**返回格式**: 查询返回 VECT。
**举例**: :DISPlay:TYPE VECTors /* 设置显示方式为线连接*/
:DISPlay:TYPE? /* 查询返回 VECT*/

---

## 9.3:DISPlay:GRADing:TIME

**语法**: `:DISPlay:GRADing:TIME <time>
:DISPlay:GRADing:TIME?`

**描述**: 设置或查询余辉时间，默认单位为 s。
**参数**: 名称 类型 范围 默认值
<time> 离散型 {MIN|0.1|0.2|0.5|1|2|5|10|
INFinite} MIN

**说明**: • MIN： 将余辉时间设为最小值，可观察以高刷新率变化的波形。
• 指定值： 将余辉时间设定为上述指定值的某一项，可观察变化较慢或者出现概率较低的毛刺。
• INFinite： 选择无限余辉时，示波器显示新波形时，不会清除之前采集的波形。可测量噪声和抖动，捕获偶发事件。
**返回格式**: 查询返回 MIN、0.1、0.2、0.5、1、2、5、10 或 INF。
**举例**: :DISPlay:GRADing:TIME 0.1 /* 设置余辉时间为 0.1s*/
:DISPlay:GRADing:TIME? /* 查询返回 0.1*/

---

## 9.4:DISPlay:WBRightness

**语法**: `:DISPlay:WBRightness <brightness>
:DISPlay:WBRightness?`

**描述**: 设置或查询屏幕中波形显示的亮度，以百分数表示。
**参数**: 名称 类型 范围 默认值
<brightness> 整型 1 至 100 50

**说明**: 无。
**返回格式**: 查询返回 1 至 100 之间的一个整数。
**举例**: :DISPlay:WBRightness 50 /* 设置波形亮度为 50%*/
:DISPlay:WBRightness? /* 查询返回 50*/

---

## 9.5:DISPlay:GRID

**语法**: `:DISPlay:GRID <grid>
:DISPlay:GRID?`

**描述**: 设置或查询屏幕显示的网格类型。
**参数**: 名称 类型 范围 默认值
<grid> 离散型 {FULL|HALF|NONE} FULL

**说明**: • FULL： 打开背景网格及坐标。
• HALF ：关闭背景网格，仅打开坐标。
• NONE ：关闭背景网格及坐标。
**返回格式**: 查询返回 FULL、HALF 或 NONE。
**举例**: :DISPlay:GRID NONE /* 关闭背景网格及坐标*/
:DISPlay:GRID? /* 查询返回 NONE*/

---

## 9.6:DISPlay:GBRightness

**语法**: `:DISPlay:GBRightness <brightness>
:DISPlay:GBRightness?`

**描述**: 设置或查询屏幕网格的亮度，以百分数表示。
**参数**: 名称 类型 范围 默认值
<brightness> 整型 0 至 100 50

**说明**: 无。
**返回格式**: 查询返回 0 至 100 之间的一个整数。
**举例**: :DISPlay:GBRightness 60 /* 设置屏幕网格亮度为 60%*/
:DISPlay:GBRightness? /* 查询返回 60*/

---

## 9.7:DISPlay:DATA?

**语法**: `:DISPlay:DATA?[<type>]`
**描述**: 查询当前显示图像的位图数据流。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {BMP|PNG|JPG} BMP

**说明**: 读取的数据格式为 TMC 头+屏幕截图的二进制数据流+结束符。 TMC 头为 #NXXXXXX 的形式， #为 TMC 规定的头标志符， N 表示后面含有 N 个字节，以 ASCII 字符的形式描述屏幕截图二进制数据流的长度，结束符用于表示通讯的终止。例如，一次读取的数据为：
#9000387356 表示 9 个字节描述数据的长度， 000387356 表示二进制数据流的长度，即
387356 字节。

**返回格式**: 查询返回指定格式的屏幕截图的二进制数据流。
**举例**: 无。

---

## 9.8:DISPlay:RULers

**语法**: `:DISPlay:RULers <bool>
:DISPlay:RULers?`

**描述**: 打开或关闭标尺显示，或查询标尺的开关状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :DISPlay:RULers ON  /* 打开标尺显示*/
:DISPlay:RULers? /* 查询返回 1*/

---

## 9.9:DISPlay:COLor

**语法**: `:DISPlay:COLor <bool>
:DISPlay:COLor?`

**描述**: 打开或关闭色温显示，或查询色温的开关状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 打开色温显示时，屏幕上显示的不同颜色表示数据采集的次数或概率。
**返回格式**: 查询返回 1 或 0。
**举例**: :DISPlay:COLor ON /* 打开色温显示*/
:DISPlay:COLor? /* 查询返回 1*/

---

## 9.10:DISPlay:WHOLd

**语法**: `:DISPlay:WHOLd <bool>
:DISPlay:WHOLd?`

**描述**: 设置或查询波形保持是否打开。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :DISPlay:WHOLd ON  /* 打开波形保持*/
:DISPlay:WHOLd? /* 查询返回 1*/

---

# 10 电压表命令子系统
电压表命令用于设置或查询电压表测量参数。
本系列示波器内置的数字电压表（DVM）可以在任意模拟通道上测量 4 位有效数字的电压。
DVM 测量与示波器的采集系统异步，且始终进行采集。
## 10.1:DVM:CURRent?

**语法**: `:DVM:CURRent?`
**描述**: 查询当前所测电压值。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 10.2:DVM:ENABle

**语法**: `:DVM:ENABle <bool>
:DVM:ENABle?`

**描述**: 打开或关闭数字电压表，或查询数字电压表开关的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :DVM:ENABle ON /* 打开数字电压表*/
:DVM:ENABle? /* 查询返回 1*/

---

## 10.3:DVM:SOURce

**语法**: `:DVM:SOURce <source>
:DVM:SOURce?`

**描述**: 设置或查询数字电压表信源。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。
**举例**: :DVM:SOURce CHANnel1 /* 设置信源为 CHANnel1*/
:DVM:SOURce? /* 查询返回 CHAN1*/

---

## 10.4:DVM:MODE

**语法**: `:DVM:MODE <mode>
:DVM:MODE?`

**描述**: 设置或查询数字电压表模式。

---

# 11 直方图命令子系统
直方图分析功能可以为波形或测量结果提供统计视图，方便用户进行趋势判断，从而帮助用户
快速发现信号中潜在的异常。
仅 DHO900 系列示波器支持直方图分析功能。
直方图分析结果
直方图分析功能的数据统计结果包括如下项目：
• Sum：所有数据统计的次数。
• Peaks：数据统计最多的次数。
• Max：所有统计结果中的最大值。
• Min：所有统计结果中的最小值。
• Pk_Pk：所有统计结果中的最大值与最小值的差值（Max-Min）。
• Mean：直方图对应的平均值。
• Median：直方图对应的中数值。
• Mode：直方图对应的众数值。
• Bin width：直方图对应的宽度。
• Sigma：直方图对应的标准方差。
• XScale：直方图的水平档位，Bin width 的 100 倍。
## 11.1:HISTogram:ENABle

**语法**: `:HISTogram:ENABle <bool>
:HISTogram:ENABle?`

**描述**: 打开或关闭直方图，或查询直方图的开关状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :HISTogram:ENABle ON /* 打开直方图功能*/
:HISTogram:ENABle? /* 查询返回 1*/

---

## 11.2:HISTogram:TYPE

**语法**: `:HISTogram:TYPE <type>
:HISTogram:TYPE?`

**描述**: 设置或查询直方图类型。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {HORizontal|VERTical} VERTical

**说明**: • HORizontal： 水平直方图。
• VERTical： 垂直直方图。
**返回格式**: 查询返回 HOR 或 VERT。
**举例**: :HISTogram:TYPE VERTical    /* 设置直方图类型为垂直直方图*/
:HISTogram:TYPE?      /* 查询返回 VERT*/

---

## 11.3:HISTogram:SOURce

**语法**: `:HISTogram:SOURce <source>
:HISTogram:SOURce?`

**描述**: 设置或查询直方图信源。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3、CHAN4。
**举例**: :HISTogram:SOURce CHANnel2    /* 设置直方图信源为 CH2*/
:HISTogram:SOURce?      /* 查询返回 CHAN2*/

---

## 11.4:HISTogram:HEIGht

**语法**: `:HISTogram:HEIGht <height>
:HISTogram:HEIGht?`

**描述**: 设置或查询直方图高度。
**参数**: 名称 类型 范围 默认值
<height> 整型 1div 至 4div 2div

**说明**: 无。
**返回格式**: 查询返回 1 至 4 之间的一个整数。
**举例**: :HISTogram:HEIGht 2    /* 设置直方图高度为 2*/
:HISTogram:HEIGht?      /* 查询返回 2*/

---

## 11.5:HISTogram:RANGe:LEFT

**语法**: `:HISTogram:RANGe:LEFT <number>
:HISTogram:RANGe:LEFT?`

**描述**: 设置或查询直方图的左边界。
**参数**: 名称 类型 范围 默认值
<number> 实型
(-5×Horizontal Time Base
+Horizontal Offset)至(5×
Horizontal Time Base
+Horizontal Offset)
-

**说明**: • 直方图的左边界值应小于右边界，可通过:HISTogram:RANGe:RIGHt 命令设置或查询直方图的右边界。
• 可通过:TIMebase[:MAIN]:SCALe 命令设置或查询 Horizontal Time Base（水平时基）。
• 可通过:TIMebase[:MAIN][:OFFSet] 命令设置或查询 Horizontal Offset（主时基偏移）。
**返回格式**: 查询以科学计数形式返回直方图的左边界。
**举例**: :HISTogram:RANGe:LEFT -2    /* 直方图的左边界为-2s*/
:HISTogram:RANGe:LEFT?      /* 查询返回-2.000000E0*/

---

## 11.6:HISTogram:RANGe:RIGHt

**语法**: `:HISTogram:RANGe:RIGHt <number>
:HISTogram:RANGe:RIGHt?`

**描述**: 设置或查询直方图的右边界。
**参数**: 名称 类型 范围 默认值
<number> 实型
(-5×Horizontal Time Base
+Horizontal Offset)至(5×
Horizontal Time Base
+Horizontal Offset)
-

**说明**: • 直方图的右边界值应大于左边界，可通过:HISTogram:RANGe:LEFT 命令设置或查询直方图的左边界。
• 可通过:TIMebase[:MAIN]:SCALe 命令设置或查询 Horizontal Time Base（水平时基）。
• 可通过:TIMebase[:MAIN][:OFFSet] 命令设置或查询 Horizontal Offset（主时基偏移）。
**返回格式**: 查询以科学计数形式返回直方图的右边界。
**举例**: :HISTogram:RANGe:RIGHt 2    /* 直方图的右边界为 2s*/
:HISTogram:RANGe:RIGHt?      /* 查询返回 2.000000E0*/

---

## 11.7:HISTogram:RANGe:TOP

**语法**: `:HISTogram:RANGe:TOP <number>
:HISTogram:RANGe:TOP?`

**描述**: 设置或查询直方图的上边界。
**参数**: 名称 类型 范围 默认值
<number> 实型 (-4×VerticalScale-OFFSet)至(4×
VerticalScale-OFFSet) -

**说明**: • 直方图的上边界值应大于下边界，可通过:HISTogram:RANGe:BOTTom 命令设置或查询直方图的下边界。
• 可通过:CHANnel<n>:SCALe 命令设置或查询指定通道的 VerticalScale（垂直档位）。
• 可通过:CHANnel<n>:OFFSet 命令设置或查询指定通道的 OFFSet（垂直偏移）。
**返回格式**: 查询以科学计数形式返回直方图的上边界。
**举例**: :HISTogram:RANGe:TOP -2    /* 直方图的上边界为-2V*/
:HISTogram:RANGe:TOP?      /* 查询返回-2.000000E0*/

---

## 11.8:HISTogram:RANGe:BOTTom

**语法**: `:HISTogram:RANGe:BOTTom <number>
:HISTogram:RANGe:BOTTom?`

**描述**: 设置或查询直方图的下边界。
**参数**: 名称 类型 范围 默认值
<number> 实型 (-4×VerticalScale-OFFSet)至(4×
VerticalScale-OFFSet) -

**说明**: • 直方图的下边界值应小于上边界，可通过:HISTogram:RANGe:TOP 命令设置或查询直方图的上边界。
• 可通过:CHANnel<n>:SCALe 命令设置或查询指定通道的 VerticalScale（垂直档位）。
• 可通过:CHANnel<n>:OFFSet 命令设置或查询指定通道的 OFFSet（垂直偏移）。
**返回格式**: 查询以科学计数形式返回直方图的下边界。
**举例**: :HISTogram:RANGe:BOTTom -2    /* 直方图的下边界为-2V*/
:HISTogram:RANGe:BOTTom?      /* 查询返回-2.000000E0*/

---

## 11.9:HISTogram:STATistics:RESult?

**语法**: `:HISTogram:STATistics:RESult?`
**描述**: 查询直方图统计结果。
**参数**: 无。
**说明**: 无。
**返回格式**: 以如下字符串形式返回直方图统计结果。
[Sum:5.6khits,Peaks:14hits,Max:3.9us,Min:-4us,Pk_Pk:7.98us,Mean:-20n
s,Median:-20ns,Mode:-4us,Bin width:20ns,Siqma:2.303us]
返回结果详细信息请参考 直方图分析结果。

**举例**: 无。

---

# 12 IEEE488.2 通用命令
IEEE488.2 通用命令用于查询仪器基本信息或执行常用基本操作。这些命令通常以“*”开
头，命令关键字的长度为 3 个字符，并与状态寄存器相关。
标准事件状态寄存器(SESR)和状态字节寄存器(SBR)记录了在仪器使用过程中可能发生的某类
型的事件，IEEE488.2 定义了状态寄存器中的每个位记录一种特定类型的事件。
表 3.128 标准事件状态寄存器位定义表
位编号 位名称 十进制值 定义
0 操作完成 1 之前的所有命令都已经执行
1 未使用 2 -
2 查询错误 4
仪器试图读取输出缓冲区，但它是空的；或在
读取上一次查询之前接收到一个新的命令行；
或输入和输出缓冲区都已满
3 特定于设备的
错误 8 特定于设备的错误，包括自检错误、校准错误
或发生的其他特定于设备的错误
4 执行错误 16 发生执行错误
5 命令 32 发生命令语法错误
6 未使用 64 -
7 通电 128 自上次读取或清除事件寄存器后，已关闭再打
开电源
表 3.129 状态字节寄存器位定义表
位编号 位名称 十进制值 定义
0 未使用 1 -
1 未使用 2 -
2 错误队列 4 错误队列中的一个或多个错误
3 可疑数据摘要 8 在可疑数据寄存器中设置一个或多个位（必须
启用位）
4 消息可用 16 仪器输出缓冲区中的可用数据

位编号 位名称 十进制值 定义
5 标准事件摘要 32 在标准事件寄存器中设置一个或多个位（必须
启用位）
6 主累加 64 在状态字节寄存器中设置一个或多个位，并且
可以生成服务请求（必须启用位）
7 操作寄存器 128 在操作状态寄存器中设置一个或多个位（必须
启用位）
## 12.1:*IDN?

**语法**: `*IDN?`
**描述**: 查询仪器的 ID 字符串。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回 RIGOL TECHNOLOGIES,<model>,<serial number>,<software version>。
• <model>： 仪器型号。
• <serial number>： 仪器序列号。
• <software version>： 仪器软件版本。
**举例**: 无。

---

## 12.2:*RST

**语法**: `*RST`
**描述**: 将仪器恢复至出厂默认状态。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 12.3:*CLS

**语法**: `*CLS`
**描述**: 将所有事件寄存器的值清零，同时清除错误队列。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 12.4:*ESE

**语法**: `*ESE <maskargument>
*ESE?`

**描述**: 设置或查询标准事件状态寄存器组的使能寄存器位。
**参数**: 名称 类型 范围 默认值
<maskargument> 整型 0 至 255 0

**说明**: 标准事件状态寄存器位定义表见 表 3.128: 标准事件状态寄存器位定义表 ，参数
<maskargument>为启用标准事件状态寄存器位的十进制值的总和。例如，要启用寄存器的
位 2（值为 4）、位 3（值为 8）和位 7（值为 128），<maskargument>将设置为 140
（4+8+128）。

**返回格式**: 查询返回一个整数，该数等于该状态寄存器中所有已设置位的十进制值之和。
*ESE 16    /* 将标准事件状态寄存器的位 4（十进制为 16）使能*/ *ESE?     /* 查询返回标准事件状态寄存器的使能值 16*/

---

## 12.5:*ESR?

**语法**: `*ESR?`
**描述**: 查询并清除标准事件状态寄存器组的事件寄存器值。
**参数**: 无。
**说明**: 标准事件状态寄存器（位定义表见 表 3.128: 标准事件状态寄存器位定义表 ）的位 1 和位 6 未使用，始终视为 0，因此返回值的取值范围为二进制数 X0XXXX0X（X 为 1 或 0）对应的十进制数。
**返回格式**: 查询返回一个整数，该数等于该寄存器中所有位的权值之和。
**举例**: 无。

---

## 12.6:*OPC

**语法**: `*OPC
*OPC?`

**描述**: *OPC 命令用于在当前操作完成后，将标准事件状态寄存器的 Operation Complete 位（位
0）置 1。
*OPC?命令用于查询当前操作是否完成。

**参数**: 无。
**说明**: 标准事件状态寄存器位定义表见 表 3.128: 标准事件状态寄存器位定义表 。
**返回格式**: 当前操作完成则返回 1，否则返回 0。
**举例**: 无。

---

## 12.7:*RCL

**语法**: `*RCL`
**描述**: 从指定单元中恢复 *SAV 命令保存的设定值。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 12.8:*SAV

**语法**: `*SAV <value>`
**描述**: 保存当前仪器状态到所选寄存器。
**参数**: 名称 类型 范围 默认值
<value> 整型 0 至 49 0

**说明**: 无。
**返回格式**: 无。
**举例**: *SAV 1 /* 保存当前仪器状态到寄存器 1*/

---

## 12.9:*SRE

**语法**: `*SRE <maskargument>
*SRE?`

**描述**: 设置或查询状态字节寄存器组的使能寄存器值。
**参数**: 名称 类型 范围 默认值
<maskargument> 整型 0 至 255 0

**说明**: 状态字节寄存器位定义表见 表 3.129: 状态字节寄存器位定义表 ，参数<maskargument>为启用状态字节寄存器位的十进制值的总和。例如，要启用寄存器的位 2（值为 4）、位 3（值为 8）和位 7（值为 128），<maskargument>将设置为 140（4+8+128）。
**返回格式**: 查询返回一个整数，该数等于该寄存器中所有已设置位的十进制值之和。
*SRE 16    /* 将状态字节寄存器的位 4（十进制为 16）使能*/ *SRE?      /* 查询返回状态字节寄存器的使能值 16*/

---

## 12.10:*STB?

**语法**: `*STB?`
**描述**: 查询状态字节寄存器的事件寄存器值。在该命令被执行完后，状态字节寄存器的值清零。
**参数**: 无。
**说明**: 状态字节寄存器（位定义表见 表 3.129: 状态字节寄存器位定义表 ）的位 0 和位 1 未使用，始终视为 0，因此返回值的取值范围为二进制数 XXXXXX00（X 为 1 或 0）对应的十进制数。
**返回格式**: 查询返回一个整数，该数等于该寄存器中所有位的十进制值之和。
**举例**: 无。

---

## 12.11:*WAI

**语法**: `*WAI`
**描述**: 等待操作完成。
**参数**: 无。
**说明**: 当前操作命令是为了兼容其他机器，在示波器上没有任何功能。
**返回格式**: 无。
**举例**: 无。

---

# 13 数字通道命令子系统
## 12.12:*TST?

**语法**: `*TST?`
**描述**: 执行一次自检并返回自检结果。
**参数**: 无。
**说明**: 这条命令会执行一次仪器自检，如果测试失败将显示一条或多条错误消息，提供更多信息。可使用命令 :SYSTem:ERRor[:NEXT]? 读取错误队列。仅 DHO900 系列示波器支持此命令。
**返回格式**: 查询返回 0 或 1。
• 0： 通过。
• 1： 一个或多个测试失败。
**举例**: 无。
3.13 数字通道命令子系统
:LA（逻辑分析仪功能）命令用于对数字通道进行相关操作。
示波器将每次采样所得的电压与预设的逻辑阈值相比较。若采样点的电压大于阈值，则被存储
为逻辑“1”，否则被存储为逻辑“0”。示波器将波形点的逻辑电平值（“1”和“0”）以
图形的方式直观地表现出来，便于用户检测和分析电路设计（硬件设计和软件设计）中的错
误。

---

## 13.1:LA:ENABle

**语法**: `:LA:ENABle <bool>
:LA:ENABle?`

**描述**: 设置或查询 LA 的使能状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :LA:ENABle ON /* 打开 LA 功能*/
:LA:ENABle? /* 查询返回 1*/

---

## 13.2:LA:ACTive

**语法**: `:LA:ACTive <digital>
:LA:ACTive?`

**描述**: 设置或查询当前的激活通道。
**参数**: 名称 类型 范围 默认值
<digital> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
NONE}
D0

**说明**: • 参数<digital>用于选择 D0 至 D15 中的任一通道，选中的通道对应的通道标签和波形显示为红色。
• 发送参数 NONE 时，不选中任何通道。
• 仅当前已打开的数字通道才可选，请参考:LA:DIGital:ENABle 命令打开所需的通道。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15 或 NONE。

**举例**: :LA:ACTive D3    /* 设置当前的激活通道为 D3*/
:LA:ACTive?      /* 查询返回 D3*/

---

## 13.3:LA:AUTosort

**语法**: `:LA:AUTosort <val>
:LA:AUTosort?`

**描述**: 设置或查询 LA 的自动排序方式。
**参数**: 名称 类型 范围 默认值
<val> 离散型 {D0D15|D15D0} D15D0

**说明**: • D0D15： 屏幕中的波形从上至下依次为 D0 至 D15。
• D15D0： 屏幕中的波形从上至下依次为 D15 至 D0。
**返回格式**: 查询返回 D0D15 或 D15D0。
**举例**: :LA:AUTosort D0D15 /* 设置 LA 的自动排序方式为 D0D15*/
:LA:AUTosort? /* 查询返回 D0D15*/

---

## 13.4:LA:DELete

**语法**: `:LA:DELete <group>`
**描述**: 取消 GROup1-GROup4 中任一通道组的通道设置。
**参数**: 名称 类型 范围 默认值
<group> 离散型 {GROup1|GROup2|GROup3|
GROup4} -

**说明**: 该命令仅可对已进行分组设置的数字通道或自定义通道组执行取消分组设置操作。
**返回格式**: 无。
**举例**: 无。

---

## 13.5:LA:DIGital:ENABle

**语法**: `:LA:DIGital:ENABle <digital>,<bool>
:LA:DIGital:ENABle? <digital>`

**描述**: 打开或关闭指定的数字通道，或查询指定数字通道的状态。
**参数**: 名称 类型 范围 默认值
<digital> 离散型 {D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 当前已打开的通道，可使用 :LA:ACTive 命令选择为活动通道。
**返回格式**: 查询返回 1 或 0。
**举例**: :LA:DIGital:ENABle D3,ON    /* 打开 D3*/
:LA:DIGital:ENABle? D3      /* 查询返回 1*/

---

## 13.6:LA:DIGital:LABel

**语法**: `:LA:DIGital:LABel <digital>,<label>
:LA:DIGital:LABel? <digital>`

**描述**: 设置或查询指定数字通道的标签。
**参数**: 名称 类型 范围 默认值
<digital> 离散型 {D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15} -
<label> ASCII 字符串 包含英文字母和数字，也可包含部
分符号 -

**说明**: 无。
**返回格式**: 查询以 ASCII 字符串形式返回指定数字通道的标签。
**举例**: :LA:DIGital:LABel D0,ACK    /* 设置 D0 的标签为 ACK*/
:LA:DIGital:LABel? D0      /* 查询返回 ACK*/

---

## 13.7:LA:POD<n>:DISPlay

**语法**: `:LA:POD<n>:DISPlay <bool>
:LA:POD<n>:DISPlay?`

**描述**: 打开或关闭指定的默认通道组，或查询指定默认通道组的状态。
**参数**: 名称 类型 范围 默认值
<n> 整型 1 至 2 -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 2 个默认通道组：POD1（D0 至 D7）和 POD2（D8 至 D15）。
**返回格式**: 查询返回 1 或 0。
**举例**: :LA:POD1:DISPlay ON /* 打开 POD1*/
:LA:POD1:DISPlay? /* 查询返回 1*/

---

## 13.8:LA:POD<n>:THReshold

**语法**: `:LA:POD<n>:THReshold <thre>
:LA:POD<n>:THReshold?`

**描述**: 设置或查询指定默认通道组的阈值，默认单位为 V。
**参数**: 名称 类型 范围 默认值
<n> 整型 1 至 2 -
<thre> 实型 -20.0V 至+20.0V 1.40V

**说明**: 2 个默认通道组：POD1（D0 至 D7）和 POD2（D8 至 D15）。
**返回格式**: 查询以科学计数形式返回指定通道组当前的阈值。
**举例**: :LA:POD1:THReshold 3.3 /* 设置 POD1 的阈值为 3.3V*/
:LA:POD1:THReshold? /* 查询返回 3.3E+00*/

---

## 13.9:LA:SIZE

**语法**: `:LA:SIZE <size>
:LA:SIZE?`

**描述**: 设置或查询已打开通道的波形在屏幕中显示的大小。

---

# 14 局域网命令子系统
局域网命令用于设置和查询局域网相关的参数。
其他:LAN 命令设置完，需要发送 :LAN:APPLy 命令使配置生效。
## 14.1:LAN:DHCP

**语法**: `:LAN:DHCP <bool>
:LAN:DHCP?`

**描述**: 打开或关闭 DHCP 配置模式，或查询当前 DHCP 配置模式的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: • 三种配置类型（DHCP、自动 IP 和静态 IP）均打开时，参数配置的优先级从高到低依次为“DHCP”、“自动 IP”、“静态 IP”。三种配置类型不能同时关闭。
• DHCP 配置模式有效时，将由当前网络中的 DHCP 服务器向示波器分配 IP 地址等网络参数。
• 执行:LAN:APPLy 命令后，配置类型才会即时生效。
**返回格式**: 查询返回 1 或 0。
**举例**: :LAN:DHCP OFF /* 关闭 DHCP 配置*/
:LAN:DHCP? /* 查询返回 0*/

---

## 14.2:LAN:AUToip

**语法**: `:LAN:AUToip <bool>
:LAN:AUToip?`

**描述**: 打开或关闭自动 IP 配置模式，或查询当前自动 IP 配置模式的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: 自动 IP 配置模式有效时，手动关闭 DHCP，用户可以自定义示波器的网关和 DNS 服务器地址。
**返回格式**: 查询返回 1 或 0。
**举例**: :LAN:AUToip OFF /* 关闭自动 IP 配置*/
:LAN:AUToip? /* 查询返回 0*/

---

## 14.3:LAN:GATeway

**语法**: `:LAN:GATeway <string>
:LAN:GATeway?`

**描述**: 设置或查询默认网关。
**参数**: 名称 类型 范围 默认值
<string> ASCII 字符串 请参考说明 -

**说明**: • <string>的格式为 nnn.nnn.nnn.nnn，第一个 nnn 的范围为 0 至 223（127 除外），其它三个 nnn 的范围为 0 至 255。
• 使用该命令时，IP 配置模式应为自动 IP 或静态 IP 模式。
**返回格式**: 查询以字符串形式返回当前的网关。
**举例**: :LAN:GATeway 192.168.1.1 /* 设置默认网关为 192.168.1.1*/
:LAN:GATeway? /* 查询返回 192.168.1.1*/

---

## 14.4:LAN:DNS

**语法**: `:LAN:DNS <string>
:LAN:DNS?`

**描述**: 设置或查询域名服务器地址。
**参数**: 名称 类型 范围 默认值
<string> ASCII 字符串 请参考说明 -

**说明**: • <string>的格式为 nnn.nnn.nnn.nnn，第一个 nnn 的范围为 0 至 223（127 除外），其它三个 nnn 的范围为 0 至 255。
• 使用该命令时，IP 配置模式应为自动 IP 或静态 IP 模式。
**返回格式**: 查询以字符串形式返回当前的域名服务器地址。
**举例**: :LAN:DNS 192.168.1.1 /* 设置域名服务器地址为 192.168.1.1*/
:LAN:DNS? /* 查询返回 192.168.1.1*/

---

## 14.5:LAN:MAC?

**语法**: `:LAN:MAC?`
**描述**: 查询仪器 MAC 地址。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以字符串形式返回 MAC 地址值，如 00:19:AF:00:11:22。
**举例**: 无。

---

## 14.6:LAN:DSERver?

**语法**: `:LAN:DSERver?`
**描述**: 查询 DHCP 服务器地址。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以字符串形式返回 DHCP 服务器地址。
**举例**: 无。

---

## 14.7:LAN:MANual

**语法**: `:LAN:MANual <bool>
:LAN:MANual?`

**描述**: 打开或关闭静态 IP 配置模式，或查询当前静态 IP 配置模式的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 静态 IP 配置模式有效时，手动关闭 DHCP 和自动 IP，用户可以自定义示波器的 IP 地址、子网掩码、网关和 DNS 等网络参数。关于 IP 地址的设置，请参考:LAN:IPADdress 命令。关于子网掩码的设置，请参考:LAN:SMASk 命令。关于网关的设置，请参考:LAN:GATeway命令。关于 DNS 的设置，请参考:LAN:DNS 命令。
**返回格式**: 查询返回 1 或 0。
**举例**: :LAN:MANual ON /* 打开静态 IP 配置*/
:LAN:MANual? /* 查询返回 1*/

---

## 14.8:LAN:IPADdress

**语法**: `:LAN:IPADdress <string>
:LAN:IPADdress?`

**描述**: 设置或查询仪器的 IP 地址。
**参数**: 名称 类型 范围 默认值
<string> ASCII 字符串 请参考说明 -

**说明**: • <string>的格式为 nnn.nnn.nnn.nnn，第一个 nnn 的范围为 0 至 223（127 除外），其它三个 nnn 的范围为 0 至 255。
• 使用该命令时，IP 配置模式应为静态 IP 模式且 DHCP 和自动 IP 处于关闭状态。
**返回格式**: 查询以字符串形式返回当前的 IP 地址。
**举例**: :LAN:IPADdress 192.168.1.10 /* 设置 IP 地址为 192.168.1.10*/
:LAN:IPADdress? /* 查询返回 192.168.1.10*/

---

## 14.9:LAN:SMASk

**语法**: `:LAN:SMASk <string>
:LAN:SMASk?`

**描述**: 设置或查询子网掩码。
**参数**: 名称 类型 范围 默认值
<string> ASCII 字符串 请参考说明 -

**说明**: • <string>的格式为 nnn.nnn.nnn.nnn，每个 nnn 的范围为 0 至 255。
• 使用该命令时，IP 配置模式应为静态 IP 模式且 DHCP 和自动 IP 处于关闭状态。
**返回格式**: 查询以字符串形式返回当前的子网掩码。
**举例**: :LAN:SMASk 255.255.255.0 /* 设置子网掩码为 255.255.255.0*/
:LAN:SMASK? /* 查询返回 255.255.255.0*/

---

## 14.10:LAN:STATus?

**语法**: `:LAN:STATus?`
**描述**: 查询当前的网络配置状态。
**参数**: 无。
**说明**: • UNLINK： 无连接!
• CONNECTED： 连接成功！
• INIT： 正在获取 IP
• IPCONFLICT： IP 冲突！
• BUSY： 请等待
• CONFIGURED： 网络配置成功！
• DHCPFAILED： DHCP 配置失败
• INVALIDIP： 无效 IP
• IPLOSE： IP 丢失
查询返回 UNLINK、CONNECTED、INIT、IPCONFLICT、BUSY、CONFIGURED、 DHCPFAILED、INVALIDIP 或 IPLOSE。

**举例**: 无。

---

## 14.11:LAN:VISA?

**语法**: `:LAN:VISA? [<type>]`
**描述**: 查询仪器 VISA 地址。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {USB|LXI|SOCKet} -

**说明**: 此命令包含一个可选参数 type 来设置查询的地址类型，默认返回网络 LXI 地址。
**返回格式**: 查询以字符串形式返回 VISA 地址。
**举例**: 无。

---

## 14.12:LAN:MDNS

**语法**: `:LAN:MDNS <bool>
:LAN:MDNS?`

**描述**: 打开或关闭 mDNS，或查询 mDNS 的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :LAN:MDNS ON /* 打开 mDNS*/
:LAN:MDNS? /* 查询返回 1*/

---

## 14.13:LAN:HOST:NAME

**语法**: `:LAN:HOST:NAME <name>
:LAN:HOST:NAME?`

**描述**: 设置或查询主机名。
**参数**: 名称 类型 范围 默认值
<name> ASCII 字符串 包含英文字母和数字，也可包含部
分符号 -

**说明**: 无。
**返回格式**: 查询以 ASCII 字符串形式返回的主机名。
**举例**: 无

---

## 14.14:LAN:DESCription

**语法**: `:LAN:DESCription <name>
:LAN:DESCription?`

**描述**: 设置或查询描述。
**参数**: 名称 类型 范围 默认值
<name> ASCII 字符串 包含英文字母和数字，也可包含部
分符号 -

**说明**: 无。
**返回格式**: 查询以 ASCII 字符串形式返回描述。
**举例**: 无。

---

## 14.15:LAN:APPLy

**语法**: `:LAN:APPLy`
**描述**: 应用网络配置。
**参数**: 无。

---

# 15 通过/失败测试命令子系统
通过/失败测试命令用于设置和查询通过/失败测试中的相关参数。
在产品的设计和生产过程中，经常需要监测信号的变化情况，或者判定产品是否合格。本系列
示波器标配的通过/失败测试功能可以很好地完成此任务。使用此功能，用户可根据已知标准
波形设定测试规则，生成波形蒙版，将被测信号和蒙版进行比较，显示测试结果的统计信息。
## 15.1:MASK:ENABle

**语法**: `:MASK:ENABle <bool>
:MASK:ENABle?`

**描述**: 打开或关闭通过/失败测试功能，或查询通过/失败测试功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 以下情况，通过/失败测试功能无效：
• 水平时基模式为 ROLL 模式，可通过命令 :TIMebase:MODE 查询或设置水平时基模式。
• 启用延迟扫描模式(Zoom)时，可通过命令 :TIMebase:DELay:ENABle 查询或设置延迟扫描的状态。
• 在进行波形录制或播放操作时。
**返回格式**: 查询返回 1 或 0。
**举例**: :MASK:ENABle ON /* 打开通过/失败测试功能*/
:MASK:ENABle? /* 查询返回 1*/

---

## 15.2:MASK:SOURce

**语法**: `:MASK:SOURce <source>
:MASK:SOURce?`

**描述**: 设置或查询通过/失败测试的信源。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 该命令设置未打开通道时，会自动打开对应通道。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。
**举例**: :MASK:SOURce CHANnel2 /* 设置通过/失败测试的信源为 CHANnel2*/
:MASK:SOURce?     /* 查询返回 CHAN2*/

---

## 15.3:MASK:OPERate

**语法**: `:MASK:OPERate <oper>
:MASK:OPERate?`

**描述**: 启动或停止通过/失败测试功能，或查询通过/失败测试功能的运行状态。
**参数**: 名称 类型 范围 默认值
<oper> 离散型 {RUN|STOP} STOP

**说明**: 执行此命令前，需发送:MASK:ENABle 命令打开通过/失败测试功能。
**返回格式**: 查询返回 RUN 或 STOP。
**举例**: :MASK:OPERate RUN /* 启动通过/失败测试功能*/
:MASK:OPERate? /* 查询返回 RUN*/

---

## 15.4:MASK:X

**语法**: `:MASK:X <x>
:MASK:X?`

**描述**: 设置或查询通过/失败测试规则中的水平调整参数，默认单位为 div。
**参数**: 名称 类型 范围 默认值
<x> 实型 0.01div 至 2div 0.24div

**说明**: 无。
**返回格式**: 查询以科学计数形式返回当前的水平调整参数。
**举例**: :MASK:X 0.28 /* 设置水平调整参数为 0.28div*/
:MASK:X? /* 查询返回 2.800000E-1*/

---

## 15.5:MASK:Y

**语法**: `:MASK:Y <y>
:MASK:Y?`

**描述**: 设置或查询通过/失败测试规则中的垂直调整参数，默认单位为 div。
**参数**: 名称 类型 范围 默认值
<y> 实型 0.04div 至 2div 0.48div

**说明**: 无。
**返回格式**: 查询以科学计数形式返回当前的垂直调整参数。
**举例**: :MASK:Y 0.36 /* 设置垂直调整参数为 0.36div*/
:MASK:Y? /* 查询返回 3.600000E-1*/

---

## 15.6:MASK:CREate

**语法**: `:MASK:CREate`
**描述**: 以当前设置的水平调整参数和垂直调整参数创建通过/失败测试的规则。
**参数**: 无。
**说明**: • 仅当通过/失败测试功能已打开且未处于运行状态时，该命令有效。可通过命令:MASK:ENABle 查询或设置通过/失败测试功能状态。可通过命令 :MASK:OPERate 查询或设置运行状态。
• 水平调整参数和垂直调整参数可通过命令 :MASK:X 和 :MASK:Y 查询或设置。
**返回格式**: 无。
**举例**: 无。

---

## 15.7:MASK:RESet

**语法**: `:MASK:RESet`
**描述**: 复位通过/失败测试中通过的帧数、失败的帧数和总帧数。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 15.8:MASK:FAILed?

**语法**: `:MASK:FAILed?`
**描述**: 查询通过/失败测试时失败的帧数。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回一个整数。
**举例**: 无。

---

## 15.9:MASK:PASSed?

**语法**: `:MASK:PASSed?`
**描述**: 查询通过/失败测试时通过的帧数。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回一个整数。
**举例**: 无。

---

## 15.10:MASK:TOTal?

**语法**: `:MASK:TOTal?`
**描述**: 查询通过/失败测试的总帧数。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回一个整数。
**举例**: 无。

---

## 15.11:MASK:OUTPut:ENABle

**语法**: `:MASK:OUTPut:ENABle <bool>
:MASK:OUTPut:ENABle?`

**描述**: 设置或查询设备后面板 AUX OUT 接口的输出状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: • 若设置为打开（1|ON），则在“辅助”的“基本设置”界面中，“AUX 输出”选项自动设置为“通过失败”。当检测到测试通过或失败事件时，将从后面板 [AUX OUT] 连接器输出一个脉冲。
• 若设置为关闭（0|OFF），则在“辅助”的“基本设置”界面中，“AUX 输出”选项自动设置为“触发输出”，后面板 [AUX OUT] 连接器输出与通过/失败测试无关。
**返回格式**: 查询返回 0 或 1。
**举例**: :MASK:OUTPut:ENABle ON /* 设置 AUX 输出功能打开*/
:MASK:OUTPut:ENABle? /* 查询返回 1*/

---

## 15.12:MASK:OUTPut:EVENt

**语法**: `:MASK:OUTPut:EVENt <item>
:MASK:OUTPut:EVENt?`

**描述**: 设置或查询输出事件。
**参数**: 名称 类型 范围 默认值
<item> 离散型 {FAIL|PASS} FAIL

**说明**: 无。
**返回格式**: 查询返回 FAIL 或 PASS。
**举例**: :MASK:OUTPut:EVENt PASS /* 设置输出事件为 PASS*/
:MASK:OUTPut:EVENt? /* 查询返回 PASS*/

---

# 16 数学运算命令子系统
## 15.13:MASK:OUTPut:TIME

**语法**: `:MASK:OUTPut:TIME <time>
:MASK:OUTPut:TIME?`

**描述**: 设置或查询输出脉宽时间。
**参数**: 名称 类型 范围 默认值
<time> 实型 100 ns 至 10 ms 1 μs

**说明**: 无。
**返回格式**: 查询以科学计数的形式返回脉宽时间。
**举例**: :MASK:OUTPut:TIME 0.000003 /* 设置脉宽时间为 3μs*/
:MASK:OUTPut:TIME? /* 查询返回 3.000000E-6*/
3.16 数学运算命令子系统
数学运算命令用于设置通道间波形的多种运算功能。
本系列示波器可实现通道间波形的多种数学运算，包括：代数运算、函数运算、FFT 运算、逻
辑运算和数字滤波。
操作运算符
代数运算
支持的包括：A+B、A-B、A×B、A÷B。
• A+B： 将信源 A 与信源 B 的波形值逐点相加并显示结果。
• A-B： 将信源 A 与信源 B 的波形值逐点相减并显示结果。
• A×B： 将信源 A 与信源 B 的波形逐点相乘并显示结果。
• A÷B： 将信源 A 与信源 B 的波形逐点相除并显示结果。可用于分析两个通道波形的倍数关系。当信源 B 的电压值为零时，相除结果按 0 处理。函数运算支持的函数运算包括：Intg（积分）、Diff（微分）、Sqrt（平方根）、Lg（以 10 为底的对数）、Ln（自然对数）、Exp（指数）、Abs（绝对值）、AX+B（一次函数）。
• 积分： 计算指定信源的积分。例如，可以使用积分计算脉冲的能量或测量波形下的面积。
• 微分： 计算指定信源的离散时间导数。例如，可以使用微分计算波形的瞬间斜率。
• 平方根： 逐点计算指定信源波形的平方根并显示结果。
• 以 10 为底的对数： 逐点计算指定信源波形的以 10 为底的对数并显示结果。
• 自然对数： 逐点计算指定信源波形的自然对数并显示结果。
• 指数： 逐点计算指定信源波形的指数并显示结果。
• 绝对值： 将指定信源的波形取绝对值并显示结果。
• 一次函数： 逐点计算指定信源波形的一次函数并显示结果。
FFT 运算
使用 FFT（快速傅立叶变换）数学运算可将时域信号转换为频域分量（频谱）。本系列示波器
提供 FFT 运算功能，可实现在观测信号时域波形的同时观测信号的频谱图。使用 FFT 运算可
以方便的进行以下工作：
• 测量系统中的谐波分量和失真。
• 表现直流电源中的噪声特性。
• 分析振动。表 3.161 窗函数窗函数 特点 适合测量的波形矩形最好的频率分辨率最差的幅度分辨率与不加窗的状况基本类似暂态或短脉冲，信号电平在此前后大致相等频率非常接近的等幅正弦波具有变化较缓慢波谱的宽带随机噪声布莱克曼最好的幅度分辨率最差的频率分辨率主要用于单频信号，寻找更高次谐波汉宁 与矩形窗比，具有较好的频率分辨率，较差的幅度分辨率 正弦、周期和窄带随机噪声汉明 稍好于汉宁窗的频率分辨率 暂态或短脉冲，信号电平在此前后相差很大平顶 精确地测量信号 无精确参照物且要求精确测量的信号窗函数 特点 适合测量的波形三角 较好的频率分辨率 窄带信号，且有较强的干扰噪声使用窗函数可以有效减小频谱泄漏效应。本系列示波器提供下表所示的 6 种 FFT 窗函数，每种窗函数的特点及适合测量的波形不同。需根据所测量的波形及其特点进行选择。逻辑运算支持的逻辑运算包括：A&&B（与）、A||B（或）、A^B（异或）、!A（非）。一个二进制位的逻辑运算结果为：表 3.162 逻辑运算结果
A B A&&B A||B A^B !A
0 0 0 0 0 1
0 1 0 1 1 1
1 0 0 1 1 0
1 1 1 1 0 0
数字滤波
支持的数字滤波包括：低通、高通、带通、带阻。
• 低通： 仅允许其频率低于当前频率上限的信号通过。
• 高通： 仅允许其频率高于当前频率下限的信号通过。
• 带通： 仅允许频率高于当前频率下限且低于当前频率上限的信号通过。
• 带阻： 仅允许频率低于当前频率下限的信号或高于当前频率上限的信号通过。
---

## 16.1:MATH<n>:DISPlay

**语法**: `:MATH<n>:DISPlay <bool>
:MATH<n>:DISPlay?`

**描述**: 打开或关闭数学运算功能，或查询数学运算功能的状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :MATH1:DISPlay ON /* 打开数学运算 1 的运算功能*/
:MATH1:DISPlay? /* 查询返回 1*/

---

## 16.2:MATH<n>:OPERator

**语法**: `:MATH<n>:OPERator <opt>
:MATH<n>:OPERator?`

**描述**: 设置或查询数学运算的运算符。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<opt> 离散型
{ADD|SUBTract|MULTiply|
DIVision|AND|OR|XOR|NOT|FFT|
INTG|DIFF|SQRT|LG|LN|EXP|ABS|
LPASs|HPASs|BPASs|BSTop|AXB}
ADD

**说明**: 支持的运算符为 A+B（ADD）、A-B（SUBTract）、A×B（MULTiply）、A÷B
（DIVision）、与（AND）、或（OR）、异或（XOR）、非（NOT）、FFT、积分
（INTG）、微分（DIFF）、平方根（SQRT）、以 10 为底的对数（LG）、自然对数
（LN）、指数（EXP）、绝对值（ABS）、低通（LPASs）、高通（HPASs）、带通
（BPASs）、带阻（BSTop）、一次函数（AXB）。具体信息请参考 操作运算符 。

查询返回 ADD、SUBT、MULT、DIV、AND、OR、XOR、NOT、FFT、INTG、DIFF、 SQRT、LG、LN、EXP、ABS、LPAS、HPAS、BPAS、BST 或 AXB。

**举例**: :MATH1:OPERator INTG /* 设置数学运算 1 的运算符为积分运算*/
:MATH1:OPERator? /* 查询返回 INTG*/

---

## 16.3:MATH<n>:SOURce1

**语法**: `:MATH<n>:SOURce1 <source>
:MATH<n>:SOURce1?`

**描述**: 设置或查询代数运算、函数运算和滤波运算的信源或信源 A。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{CHANnel1|CHANnel2|
CHANnel3|CHANnel4|REF1|
REF2|REF3|REF4|REF5|REF6|REF7|
REF8|REF9|REF10|MATH1|
MATH2|MATH3}
CHANnel1

**说明**: • 当 n=1 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10}
• 当 n=2 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10|MATH1}
• 当 n=3 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10|MATH1|MATH2}
• 当 n=4 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10|MATH1|MATH2|MATH3}
• 对于代数运算，该命令用于设置信源 A。
• 对于函数运算和滤波运算，仅使用该命令设置信源。
• 具体的运算类型请参考操作运算符。
查询返回 MATH1、MATH2、MATH3、CHAN1、CHAN2、CHAN3、CHAN4、REF1、 REF2、REF3、REF4、REF5、REF6、REF7、REF8、REF9 或 REF10。

**举例**: :MATH1:SOURce1 CHANnel3 /* 设置代数运算的信源 A 为 CHANnel3*/
:MATH1:SOURce1? /* 查询返回 CHAN3*/

---

## 16.4:MATH<n>:SOURce2

**语法**: `:MATH<n>:SOURce2 <source>
:MATH<n>:SOURce2?`

**描述**: 设置或查询代数运算的信源 B。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{CHANnel1|CHANnel2|
CHANnel3|CHANnel4|REF1|
REF2|REF3|REF4|REF5|REF6|REF7|
REF8|REF9|REF10|MATH1|
MATH2|MATH3}
CHANnel1

**说明**: 该命令仅适用于代数运算（含有两个信源）。具体的运算类型请参考 操作运算符 。
• 当 n=1 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10}
• 当 n=2 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10|MATH1}
• 当 n=3 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10|MATH1|MATH2}
• 当 n=4 时，参数范围为{CHANnel1|CHANnel2|CHANnel3|CHANnel4|REF1|REF2|
REF3|REF4|REF5|REF6|REF7|REF8|REF9|REF10|MATH1|MATH2|MATH3}

查询返回 MATH1、MATH2、MATH3、CHAN1、CHAN2、CHAN3、CHAN4、REF1、 REF2、REF3、REF4、REF5、REF6、REF7、REF8、REF9 或 REF10。

**举例**: :MATH1:SOURce2 CHANnel3 /* 设置代数运算的信源 B 为 CHANnel3*/
:MATH1:SOURce2? /* 查询返回 CHAN3*/

---

## 16.5:MATH<n>:LSOurce1

**语法**: `:MATH<n>:LSOurce1 <source>
:MATH<n>:LSOurce1?`

**描述**: 设置或查询逻辑运算的信源 A。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4}
CHANnel1

**说明**: 逻辑运算包括 A&&B、A||B、A^B 和!A。参数 D0~D15 数字通道仅 DHO900 系列支持。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。

**举例**: :MATH1:LSOurce1 CHANnel3 /* 设置逻辑运算的信源 A 为 CHANnel3*/
:MATH1:LSOurce1? /* 查询返回 CHAN3*/

---

## 16.6:MATH<n>:LSOurce2

**语法**: `:MATH<n>:LSOurce2 <source>
:MATH<n>:LSOurce2?`

**描述**: 设置或查询逻辑运算的信源 B。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4}
CHANnel1

**说明**: • 逻辑运算包括 A&&B、A||B、A^B 和!A。
• 该命令仅适用于含有两个信源的逻辑运算，用于设置信源 B。
• 参数 D0~D15 数字通道仅 DHO900 系列支持。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。

**举例**: :MATH1:LSOurce2 CHANnel4 /* 设置逻辑运算的信源 B 为 CHANnel4*/
:MATH1:LSOurce2? /* 查询返回 CHAN4*/

---

## 16.7:MATH<n>:SCALe

**语法**: `:MATH<n>:SCALe <scale>
:MATH<n>:SCALe?`

**描述**: 设置或查询运算结果的垂直档位，单位与当前所选的运算符以及信源所选的单位有关。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<scale> 实型 请参考说明 -

**说明**: • 垂直档位的可设置范围与当前所选的运算符以及信源通道的档位有关。对于积分和微分运算，还与当前的水平时基有关。
• 该命令对逻辑运算和 FFT 运算无效。
**返回格式**: 查询以科学计数形式返回当前运算结果的垂直档位。
**举例**: :MATH1:SCALe 0.2 /* 设置垂直档位为 200mV*/
:MATH1:SCALe? /* 查询返回 2.000000E-1*/

---

## 16.8:MATH<n>:OFFSet

**语法**: `:MATH<n>:OFFSet <offset>
:MATH<n>:OFFSet?`

**描述**: 设置或查询运算结果的垂直偏移，单位与当前所选的运算符以及信源所选的单位有关。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<offset> 实型 -1GV 至+1GV 0.00V

**说明**: 该命令对逻辑运算和 FFT 运算无效。
**返回格式**: 查询以科学计数形式返回当前运算结果的垂直偏移。
**举例**: :MATH1:OFFSet 8 /* 设置垂直偏移为 8V*/
:MATH1:OFFSet? /* 查询返回 8.000000E0*/

---

## 16.9:MATH<n>:INVert

**语法**: `:MATH<n>:INVert <bool>
:MATH<n>:INVert?`

**描述**: 打开或关闭运算结果的反相显示，或查询运算结果反相显示的状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 该命令对 FFT 运算和逻辑运算无效。
**返回格式**: 查询返回 1 或 0。
**举例**: :MATH1:INVert ON /* 打开反相显示*/
:MATH1:INVert? /* 查询返回 1*/

---

## 16.10:MATH<n>:RESet

**语法**: `:MATH<n>:RESet`
**描述**: 发送该命令，仪器根据当前所选的运算符、信源的水平时基将运算结果的垂直档位调节至最佳值。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 16.11:MATH<n>:GRID

**语法**: `:MATH<n>:GRID <grid>
:MATH<n>:GRID?`

**描述**: 设置或查询数学运算屏幕显示的网格类型。
**参数**: 名称 类型 范围 默认值
<grid> 离散型 {FULL|HALF|NONE} -

**说明**: • FULL： 打开背景网格及坐标。
• HALF ：关闭背景网格，仅打开坐标。
• NONE ：关闭背景网格及坐标。
**返回格式**: 查询返回 FULL、HALF 或 NONE。
**举例**: :MATH1:GRID NONE /* 关闭背景网格及坐标*/
:MATH1:GRID? /* 查询返回 NONE*/

---

## 16.12:MATH<n>:EXPand

**语法**: `:MATH<n>:EXPand <exp>
:MATH<n>:EXPand?`

**描述**: 设置或查询数学运算的垂直扩展类型。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<exp> 离散型 {GND|CENTer} GND

**说明**: • CENTer： 屏幕中心，改变垂直档位时，波形将围绕屏幕中心扩展或压缩。
• GND： 通道零点，改变垂直档位时，波形将围绕通道信号零点位置扩展或压缩。
**返回格式**: 查询返回 GND 或 CENTer。
**举例**: :MATH1:EXPand CENTer /* 设置通道 1 数学运算的垂直扩展为屏幕中心*/
:MATH1:EXPand? /* 查询返回 CENTer*/

---

## 16.13:MATH<n>:WAVetype

**语法**: `:MATH<n>:WAVetype <type>
:MATH<n>:WAVetype?`

**描述**: 设置或查询数学运算的波形类型。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<type> 离散型 {MAIN|ZOOM} MAIN

**说明**: • MAIN： 主时基区域。
• ZOOM： 扩展时基区域。只有当前 Zoom 延迟扫描功能开启的情况下，设置数学运算的波形类型为 ZOOM 才生效，FFT 数学运算类型不支持 Zoom。
**返回格式**: 查询返回 MAIN 或 ZOOM。
**举例**: :MATH1:WAVetype ZOOM  /* 设置数学运算的波形类型为 ZOOM*/ 
:MATH1:WAVetype?  /* 查询返回 ZOOM*/

---

## 16.14:MATH<n>:FFT:SOURce

**语法**: `:MATH<n>:FFT:SOURce <source>
:MATH<n>:FFT:SOURce?`

**描述**: 设置或查询 FFT 运算的信源。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。
**举例**: :MATH1:FFT:SOURce CHANnel3 /* 设置 FFT 运算的信源为 CHANnel3*/
:MATH1:FFT:SOURce?         /* 查询返回 CHAN3*/

---

## 16.15:MATH<n>:FFT:WINDow

**语法**: `:MATH<n>:FFT:WINDow <window>
:MATH<n>:FFT:WINDow?`

**描述**: 设置或查询 FFT 运算的窗函数。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<window> 离散型
{RECTangle|BLACkman|
HANNing|HAMMing|FLATtop|
TRIangle}
HANNing

**说明**: • 使用窗函数可以有效减小频谱泄漏效应。
• 每种窗函数适合测量的波形不同，需根据所测量的波形及其特点进行选择。窗函数的特点及适用波形请参考 表 3.161: 窗函数 。
**返回格式**: 查询返回 RECT、BLAC、HANN、HAMM、FLAT 或 TRI。
**举例**: :MATH1:FFT:WINDow BLACkman /* 设置 FFT 运算的窗函数为布莱克曼*/
:MATH1:FFT:WINDow? /* 查询返回 BLAC*/

---

## 16.16:MATH<n>:FFT:UNIT

**语法**: `:MATH<n>:FFT:UNIT <unit>
:MATH<n>:FFT:UNIT?`

**描述**: 设置或查询 FFT 运算结果的垂直单位。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<unit> 离散型 {VRMS|DB} DB

**说明**: 无。
**返回格式**: 查询返回 VRMS 或 DB。
**举例**: :MATH1:FFT:UNIT VRMS /* 设置 FFT 运算结果的垂直单位为 Vrms*/
:MATH1:FFT:UNIT? /* 查询返回 VRMS*/

---

## 16.17:MATH<n>:FFT:SCALe

**语法**: `:MATH<n>:FFT:SCALe <scale>
:MATH<n>:FFT:SCALe?`

**描述**: 设置或查询 FFT 运算结果的垂直档位。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<scale> 实型 请参考说明 -

**说明**: • 当单位为 dBm/dBV 时，取值范围为 1.0E-9dB 至 5.00GdB。默认值为 2.0dB。
• 当单位为 Vrms 时，取值范围为 1.00nVrms 至 5.00GVrms。默认值为 500.00μVrms。通过 :MATH<n>:FFT:UNIT 命令可配置或查询当前的单位。
**返回格式**: 查询以科学计数形式返回当前的垂直档位。
**举例**: :MATH1:FFT:SCALe 0.3 /* 设置 FFT 运算结果的垂直档位为 300mdB*/
:MATH1:FFT:SCALe?   /* 查询返回 3.000000E-1*/

---

## 16.18:MATH<n>:FFT:OFFSet

**语法**: `:MATH<n>:FFT:OFFSet <offset>
:MATH<n>:FFT:OFFSet?`

**描述**: 设置或查询 FFT 运算结果的垂直偏移。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<offset> 实型 请参考说明 0dBV

**说明**: • 当单位为 dBm/dBV 时，取值范围为-1.00GdBV 至 1.00GdBV，默认值为 0.0dBV。
• 当单位为 Vrms 时，取值范围为-1.00GVrms 至 1.00GVrms，默认值为 0.00Vrms。通过 :MATH<n>:FFT:UNIT 命令可配置或查询当前的单位。
**返回格式**: 查询以科学计数形式返回当前的垂直偏移。
**举例**: :MATH1:FFT:OFFSet 0.3 /* 设置 FFT 运算结果的垂直偏移为 300mdB*/
:MATH1:FFT:OFFSet? /* 查询返回 3.000000E-1*/

---

## 16.19:MATH<n>:FFT:HSCale

**语法**: `:MATH<n>:FFT:HSCale <hsc>
:MATH<n>:FFT:HSCale?`

**描述**: 设置或查询 FFT 运算结果的频率范围，默认单位为 Hz。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<hsc> 实型 10Hz 至 1GHz 1 MHz

**说明**: 可以通过减小频率范围观察频谱的细节信息。修改 FFT 运算结果的频率范围，会影响中心频率的取值，可通过命令:MATH<n>:FFT:HCENter 查询或修改中心频率。
**返回格式**: 查询以科学计数形式返回当前的频率范围。
**举例**: :MATH1:FFT:HSCale 500000 /* 设置 FFT 运算结果的频率范围为 500kHz*/
:MATH1:FFT:HSCale? /* 查询返回 5.000000E+5*/

---

## 16.20:MATH<n>:FFT:HCENter

**语法**: `:MATH<n>:FFT:HCENter <cent>
:MATH<n>:FFT:HCENter?`

**描述**: 设置或查询 FFT 运算结果的中心频率，即屏幕水平中心对应的频率。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<cent> 实型 5Hz 至 1GHz 1 MHz

**说明**: 修改 FFT 运算结果的中心频率，会影响频率范围的取值，可通过命令:MATH<n>:FFT:HSCale查询或修改频率范围。
**返回格式**: 查询以科学计数形式返回当前的中心频率，单位为 Hz。
**举例**: :MATH1:FFT:HCENter 10000000 /* 设置 FFT 运算结果的中心频率为 10MHz*/
:MATH1:FFT:HCENter?         /* 查询返回 1.000000E+7*/

---

## 16.21:MATH<n>:FFT:FREQuency:STARt

**语法**: `:MATH<n>:FFT:FREQuency:STARt <value>
:MATH<n>:FFT:FREQuency:STARt?`

**描述**: 设置或查询 FFT 运算结果的起始频率。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<value> 实型 0Hz 至（终止频率-10Hz） 1 Hz

**说明**: FFT 运算结果的起始频率的取值范围与终止频率有关。可通过命令:MATH<n>:FFT:FREQuency:END 查询或配置终止频率。
**返回格式**: 查询以科学计数形式返回运算结果的起始频率，单位为 Hz。
:MATH1:FFT:FREQuency:STARt 10000000 /* 设置 FFT运算结果的起始频率为10MHz*/
:MATH1:FFT:FREQuency:STARt? /* 查询返回 1.000000E+7*/

---

## 16.22:MATH<n>:FFT:FREQuency:END

**语法**: `:MATH<n>:FFT:FREQuency:END <value>
:MATH<n>:FFT:FREQuency:END?`

**描述**: 设置或查询 FFT 运算结果的终止频率。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<value> 实型 （起始频率+10Hz）至 1GHz 10MHz

**说明**: FFT 运算结果的终止频率的取值范围与起始频率有关。可通过命令:MATH<n>:FFT:FREQuency:STARt查询或配置起始频率。
**返回格式**: 查询以科学计数形式返回运算结果的终止频率，单位为 Hz。
**举例**: :MATH1:FFT:FREQuency:END 10000000 /* 设置 FFT 运算结果的终止频率为 10MHz*/
:MATH1:FFT:FREQuency:END? /* 查询返回 1.000000E+7*/

---

## 16.23:MATH<n>:FFT:SEARch:ENABle

**语法**: `:MATH<n>:FFT:SEARch:ENABle <bool>
:MATH<n>:FFT:SEARch:ENABle?`

**描述**: 打开或关闭 FFT 峰值搜索，或查询 FFT 峰值搜索功能的状态。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :MATH1:FFT:SEARch:ENABle ON /* 打开 FFT 峰值搜索*/
:MATH1:FFT:SEARch:ENABle? /* 查询返回 1*/

---

## 16.24:MATH<n>:FFT:SEARch:NUM

**语法**: `:MATH<n>:FFT:SEARch:NUM <num>
:MATH<n>:FFT:SEARch:NUM?`

**描述**: 设置或查询 FFT 峰值搜索的最大数目。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<num> 整型 1 至 15 5

**说明**: 无。
**返回格式**: 查询返回 1 至 15 之间的一个整数。
**举例**: :MATH1:FFT:SEARch:NUM 10 /* 设置 FFT 峰值搜索的最大数目为 10*/
:MATH1:FFT:SEARch:NUM? /* 查询返回 10*/

---

## 16.25:MATH<n>:FFT:SEARch:THReshold

**语法**: `:MATH<n>:FFT:SEARch:THReshold <thres>
:MATH<n>:FFT:SEARch:THReshold?`

**描述**: 设置或查询 FFT 峰值搜索的阈值。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<thres> 实型 与 FFT 运算的垂直档位和垂直偏移
有关 -

**说明**: 无。
**返回格式**: 查询以科学计数形式返回阈值。
**举例**: :MATH1:FFT:SEARch:THReshold 0.5 /* 设置 FFT 峰值搜索的阈值为 500mdB*/
:MATH1:FFT:SEARch:THReshold? /* 查询返回 5.000000E-1*/

---

## 16.26:MATH<n>:FFT:SEARch:EXCursion

**语法**: `:MATH<n>:FFT:SEARch:EXCursion <excur>
:MATH<n>:FFT:SEARch:EXCursion?`

**描述**: 设置或查询 FFT 峰值搜索的偏移阈值。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<excur> 实型 0 至 (8×VerticalScale) 1.8dB

**说明**: VerticalScale 指 FFT 对应的垂直档位。
**返回格式**: 查询以科学计数形式返回偏移阈值。
**举例**: :MATH1:FFT:SEARch:EXCursion 0.5 /* 设置 FFT 峰值搜索的阈值为 500mdB*/
:MATH1:FFT:SEARch:EXCursion? /* 查询返回 5.000000E-1*/

---

## 16.27:MATH<n>:FFT:SEARch:ORDer

**语法**: `:MATH<n>:FFT:SEARch:ORDer <order>
:MATH<n>:FFT:SEARch:ORDer?`

**描述**: 设置或查询 FFT 峰值搜索结果的排序方式。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<order> 离散型 {AMPorder|FREQorder} AMPorder

**说明**: 无。
**返回格式**: 查询返回 AMP 或 FREQ。
:MATH1:FFT:SEARch:ORDer AMPorder /* 设置 FFT 峰值搜索结果的排序方式为AMPorder*/
:MATH1:FFT:SEARch:ORDer? /* 查询返回 AMP*/

---

## 16.28:MATH<n>:FFT:SEARch:RES?

**语法**: `:MATH<n>:FFT:SEARch:RES?`
**描述**: 查询 FFT 峰值搜索结果表。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -

**说明**: 无。
**返回格式**: 查询以字符串形式返回峰值搜索结果表。
:MATH1:FFT:SEARch:RES?   /* 查询返回如下格式的峰值搜索结果表*/ 1,2.50000MHz,-24.98dBV
2,3.50000MHz,-27.84dBV
3,4.50000MHz,-30.04dBV
4,5.50125MHz,-31.5dBV
5,6.50125MHz,-32.34dBV

---

## 16.29:MATH<n>:FILTer:TYPE

**语法**: `:MATH<n>:FILTer:TYPE <type>
:MATH<n>:FILTer:TYPE?`

**描述**: 设置或查询滤波器类型。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<type> 离散型 {LPASs|HPASs|BPASs|BSTop} LPASs

**说明**: 本示波器提供 4 种实用的滤波器（低通滤波器、高通滤波器、带通滤波器和带阻滤波器），通过设定带宽可以滤除信号中的特定频率。您可以使用:MATH<n>:FFT:SOURce命令设置或查询滤波器的信源。
• LPASs： 低通，仅允许频率低于当前截止频率的信号通过。
• HPASs： 高通，仅允许频率高于当前截止频率的信号通过。
• BPASs： 带通，仅允许频率高于当前截止频率 1 且低于当前截止频率 2 的信号通过。注意：截止频率 1 须低于截止频率 2。
• BSTop： 带阻，仅允许频率低于当前截止频率 1 的信号或高于当前截止频率 2 的信号通过。注意：截止频率 1 须低于截止频率 2。
**返回格式**: 查询返回 LPAS、HPAS、BPAS 或 BST。
**举例**: :MATH1:FILTer:TYPE LPASs /* 设置滤波器类型为低通*/
:MATH1:FILTer:TYPE? /* 查询返回 LPAS*/

---

## 16.30:MATH<n>:FILTer:W1

**语法**: `:MATH<n>:FILTer:W1 <freq1>
:MATH<n>:FILTer:W1?`

**描述**: 设置或查询低通/高通滤波器的截止频率或带通/带阻滤波器的截止频率 1，默认单位为 Hz。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<freq1> 实型 请参考说明 请参考说明

**说明**: • 滤波器类型设为 LPASs（低通）或 HPASs（高通）时，需设置 1 个截止频率。此时，<freq1>的范围为(0.005×屏幕采样率)至(0.1×屏幕采样率)，步进为 0.005×屏幕采样率。其中，屏幕采样率=100/水平时基。
• 滤波器类型设为 BPASs（带通）或 BSTop（带阻）时，需设置 2 个截止频率。截止频率
1 须低于截止频率 2。使用该命令设置截止频率 1，使用:MATH<n>:FILTer:W2命令设
置截止频率 2。
此时，<freq1>的范围为(0.005×屏幕采样率)至(0.095×屏幕采样率)，步进为 0.005×屏
幕采样率。其中，屏幕采样率=100/水平时基。
• 参数<freq1>的默认值与滤波器类型有关。
- 滤波器类型设为 LPASs（低通）或 BPASs（带通）或 BSTop（带阻）时，默认值为
0.005× 屏幕采样率。
- 波器类型设为 HPASs（高通）时，默认值为 0.1×屏幕采样率。
• 可通过命令 :MATH<n>:FILTer:TYPE 设置或查询滤波器类型。
**返回格式**: 查询以科学计数形式返回当前的截止频率或截止频率 1。
**举例**: :MATH1:FILTer:W1 1000000 /* 设置低通滤波器的截止频率为 1MHz*/
:MATH1:FILTer:W1? /* 查询返回 1.000000E+6*/

---

## 16.31:MATH<n>:FILTer:W2

**语法**: `:MATH<n>:FILTer:W2 <freq2>
:MATH<n>:FILTer:W2?`

**描述**: 设置或查询带通/带阻滤波器的截止频率 2，默认单位为 Hz。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<freq2> 实型 请参考说明 0.1×屏幕采样率

**说明**: 滤波器类型设为 BPASs（带通）或 BSTop（带阻）时，需设置 2 个截止频率。截止频率 2 须高于截止频率 1。使用:MATH<n>:FILTer:W1命令设置截止频率 1，使用该命令设置截止频率
2。
此时，<freq2>的范围为(0.01×屏幕采样率)至(0.1×屏幕采样率)，步进为 0.005×屏幕采样
率。其中，屏幕采样率=100/水平时基。

**返回格式**: 查询以科学计数形式返回当前的截止频率 2。
**举例**: :MATH1:FILTer:W2 1500000 /* 设置带通滤波器的截止频率 2 为 1.5MHz*/
:MATH1:FILTer:W2? /* 查询返回 1.500000E+6*/

---

## 16.32:MATH<n>:SENSitivity

**语法**: `:MATH<n>:SENSitivity <sens>
:MATH<n>:SENSitivity?`

**描述**: 设置或查询逻辑运算的灵敏度，默认单位为 div。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -

名称 类型 范围 默认值
<sens> 实型 100mdiv 至 1div 300mdiv

**说明**: 无。
**返回格式**: 查询以科学计数形式返回逻辑运算的灵敏度。
**举例**: :MATH1:SENSitivity 0.2 /* 设置逻辑运算的灵敏度为 0.2div*/
:MATH1:SENSitivity? /* 查询返回 2.000000E-1*/

---

## 16.33:MATH<n>:DISTance

**语法**: `:MATH<n>:DISTance <dist>
:MATH<n>:DISTance?`

**描述**: 设置或查询微分运算的平滑窗口宽度。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<dist> 整型 1 至 1000 -

**说明**: 无。
**返回格式**: 查询返回 1 至 1000 之间的一个整数。
**举例**: :MATH1:DISTance 20 /* 设置微分运算的平滑窗口宽度为 20*/
:MATH1:DISTance? /* 查询返回 20*/

---

## 16.34:MATH<n>:THReshold1

**语法**: `:MATH<n>:THReshold1 <thre>
:MATH<n>:THReshold1?`

**描述**: 设置或查询逻辑运算模拟通道 1 的门限电平，默认单位为 V。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<thre> 实型
(-4×VerticalScale-VerticalOffset)
至
(4×VerticalScale-VerticalOffset)
0V

**说明**: • 该命令仅适用于逻辑运算 A&&B、A||B、A^B 和!A。
• VerticalScale 指模拟通道 1 的垂直档位，VeticalOffset 指模拟通道 1 的垂直偏移，步进值为 VerticalScale/10。
**返回格式**: 查询以科学计数形式返回模拟通道 1 的门限电平值。
**举例**: :MATH1:THReshold1 0.8 /* 设置逻辑运算模拟通道 1 的门限电平为 800mV*/
:MATH1:THReshold1? /* 查询返回 8.000000E-1*/

---

## 16.35:MATH<n>:THReshold2

**语法**: `:MATH<n>:THReshold2 <thre>
:MATH<n>:THReshold2?`

**描述**: 设置或查询逻辑运算模拟通道 2 的门限电平，默认单位为 V。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<thre> 实型
(-4×VerticalScale-VerticalOffset)
至
(4×VerticalScale-VerticalOffset)
0V

**说明**: • 该命令仅适用于逻辑运算 A&&B、A||B、A^B 和!A。
• VerticalScale 指模拟通道 2 的垂直档位，VeticalOffset 指模拟通道 2 的垂直偏移，步进值为 VerticalScale/10。
**返回格式**: 查询以科学计数形式返回模拟通道 2 的门限电平值。
**举例**: :MATH1:THReshold2 0.8 /* 设置逻辑运算模拟通道 2 的门限电平为 800mV*/
:MATH1:THReshold2? /* 查询返回 8.000000E-1*/

---

## 16.36:MATH<n>:THReshold3

**语法**: `:MATH<n>:THReshold3 <thre>
:MATH<n>:THReshold3?`

**描述**: 设置或查询逻辑运算模拟通道 3 的门限电平，默认单位为 V。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<thre> 实型
(-4×VerticalScale-VerticalOffset)
至
(4×VerticalScale-VerticalOffset)
0V

**说明**: • 该命令仅适用于逻辑运算 A&&B、A||B、A^B 和!A。
• VerticalScale 指模拟通道 3 的垂直档位，VeticalOffset 指模拟通道 3 的垂直偏移，步进值为 VerticalScale/10。
**返回格式**: 查询以科学计数形式返回模拟通道 3 的门限电平值。
**举例**: :MATH1:THReshold3 0.8 /* 设置逻辑运算模拟通道 3 的门限电平为 800mV*/
:MATH1:THReshold3? /* 查询返回 8.000000E-1*/

---

## 16.37:MATH<n>:THReshold4

**语法**: `:MATH<n>:THReshold4 <thre>
:MATH<n>:THReshold4?`

**描述**: 设置或查询逻辑运算模拟通道 4 的门限电平，默认单位为 V。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -
<thre> 实型
(-4×VerticalScale-VerticalOffset)
至
(4×VerticalScale-VerticalOffset)
0V

**说明**: • 该命令仅适用于逻辑运算 A&&B、A||B、A^B 和!A。
• VerticalScale 指模拟通道 4 的垂直档位，VeticalOffset 指模拟通道 4 的垂直偏移，步进值为 VerticalScale/10。
**返回格式**: 查询以科学计数形式返回模拟通道 4 的门限电平值。
**举例**: :MATH1:THReshold4 0.8 /* 设置逻辑运算模拟通道 4 的门限电平为 800mV*/
:MATH1:THReshold4? /* 查询返回 8.000000E-1*/

---

## 16.38:MATH<n>:WINDow:TITLe?

**语法**: `:MATH<n>:WINDow:TITLe?`
**描述**: 查询指定数学运算窗口的标题。
**参数**: 名称 类型 范围 默认值
<n> 离散型 {1|2|3|4} -

---

# 17 测量命令子系统
## 16.39:MATH<n>:LABel:SHOW

**语法**: `:MATH<n>:LABel:SHOW <bool>
:MATH<n>:LABel:SHOW?`

**描述**: 设置或查询指定运算波形标签的显示状态。
**参数**: 名称 类型 范围 默认值
<n> 离散 {1|2|3|4} -
<bool> 布尔型 {{1|ON}|{0|OFF}} -

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :MATH1:LABel:SHOW ON /* 打开运算波形标签显示*/
:MATH1:LABel:SHOW? /* 查询返回 1*/
3.17 测量命令子系统
测量命令用于设置和查询测量相关的参数。
本示波器支持设置测量信源、全部测量和统计功能等，可快速测量多种波形参数。

测量参数
提示
若当前测量源没有信号输入，或测量结果不在有效范围内（过大或过小），则测量结果无效。
水平参数
门限下限
门限中间值
门限上限
正脉宽 负脉宽
上升时间 下降时间
周期
• 周期（PERiod）： 定义为两个连续、同极性边沿的中阈值交叉点之间的时间。
• 频率（FREQuency）： 定义为周期的倒数。
• 上升时间（RTIMe）： 信号幅度从门限值下限上升至门限值上限所经历的时间。
• 下降时间（FTIMe）： 信号幅度从门限值上限下降至门限值下限所经历的时间。
• 正脉宽（PWIDth）： 从脉冲上升沿的门限中间值处到紧接着的一个下降沿的门限中间值处之间的时间差。
• 负脉宽（NWIDth）： 从脉冲下降沿的门限中间值处到紧接着的一个上升沿的门限中间值处之间的时间差。
• 正占空比（PDUTy）： 正脉宽与周期的比值。
• 负占空比（NDUTy）： 负脉宽与周期的比值。
• 最大值时刻（TVMAX）： 波形最大值（Vmax）对应的时间值。
• 最小值时刻（TVMIN）： 波形最小值（Vmin）对应的时间值。延迟和相位参数
Source A
Source B
周期
延迟
• 延迟（r-r）（RRDelay）： 源 A 上升沿与源 B 上升沿在门限中间值处的时间差。负延迟表示源 A 的上升沿出现在源 B 的上升沿之后。
• 延迟（f-f）（FFDelay）： 源 A 下降沿与源 B 下降沿在门限中间值处的时间差。负延迟表示源 A 的下降沿出现在源 B 的下降沿之后。
• 延迟（r-f）（RFDelay）： 源 A 上升沿与源 B 下降沿在门限中间值处的时间差。负延迟表示源 A 的上升沿出现在源 B 的下降沿之后。
• 延迟（f-r）（FRDelay）： 源 A 下降沿与源 B 上升沿在门限中间值处的时间差。负延迟表示源 A 的下降沿出现在源 B 的上升沿之后。
• 相位（r-r）（RRPHase）： 源 A 上升沿与源 B 上升沿在门限中间值处的相位差，以度表示。
• 相位（f-f）（FFPHase）： 源 A 下降沿与源 B 下降沿在门限中间值处的相位差，以度表示。
• 相位（r-f）（RFPHase）： 源 A 上升沿与源 B 下降沿在门限中间值处的相位差，以度表示。
• 相位（f-r）（FRPHase）： 源 A 下降沿与源 B 上升沿在门限中间值处的相位差，以度表示。计数值
• 正脉冲数（PPULses）： 从门限下限之下升至门限上限之上的正脉冲的个数。
1 n2
正脉冲数 =n
门限上限
门限下限
• 负脉冲数（NPULses）： 从门限上限之上降至门限下限之下的负脉冲的个数。负脉冲数 =n门限上限门限下限
1 n2
• 上升沿数（PEDGes）： 从门限下限之下升至门限上限之上的上升沿的个数。上升沿数 =n门限上限门限下限
1 n2
• 下降沿数（NEDGes）： 从门限上限之上降至门限下限之下的下降沿的个数。下降沿数=n门限上限门限下限
1 n2
电压参数
峰峰值
顶端值
底端值
过冲
最大值
最小值
高值
中值
低值
预冲
幅度值
• 最大值（VMAX）： 波形最高点至 GND（地）的电压值。
• 最小值（VMIN）： 波形最低点至 GND（地）的电压值。
• 峰峰值（VPP）： 波形最高点至最低点的电压值。
• 顶端值（VTOP）： 波形平顶至 GND（地）的电压值。
• 底端值（VBASe）： 波形平底至 GND（地）的电压值。
• 幅度值（VAMP）： 波形顶端至底端的电压值。
• 高值（VUPPer）： 测量门限最大值所对应的实际电压值。
• 中值（VMID）： 测量门限中间值所对应的实际电压值。
• 低值（VLOWer）： 测量门限最小值所对应的实际电压值。
• 平均值（VAVG）： 整个波形或选通区域上的算术平均值。
• 有效值（VRMS）： 整个波形或选通区域上的均方根值。
• 周期有效值（PVRMs）： 一个周期内的均方根值。
• 过冲（OVERshoot）： 波形最大值与顶端值之差与幅值的比值。
• 预冲（PREShoot）： 波形最小值与底端值之差与幅值的比值。
• 交流有效值（ACRMs）： 移除 DC 分量的波形的均方根值。其他参数
• 正斜率（PSLewrate）： 在上升沿上，高值与低值之差除以与其对应的时间。
• 负斜率（NSLewrate）： 在下降沿上，低值与高值之差除以与其对应的时间。
• 面积（MARea）： 屏幕内整个波形的面积，单位是 V*s。零基准（即垂直偏移）以上波形的面积为正，零基准以下波形的面积为负，测得的面积为屏幕内整个波形面积的代数和。
• 单周期面积（MPARea）： 屏幕波形的第一个周期的面积，单位是 V*s。零基准（即垂直偏移）以上波形的面积为正，零基准以下波形的面积为负，测得的面积为整个周期面积的代数和。测量结果统计功能统计并显示测量结果。
• MAXimum： 最大值。
• MINimum： 最小值。
• CURRent： 当前值。
• AVERages： 平均值。
• DEViation： 标准差。
• CNT： 计数。
---

## 17.1:MEASure:SOURce

**语法**: `:MEASure:SOURce <source>
:MEASure:SOURce?`

**描述**: 设置或查询当前测量参数的信源。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。此命令功能同:MEASure:SETup:DSA 和:MEASure:SETup:PSA 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或
MATH4。

**举例**: :MEASure:SOURce CHANnel2 /* 设置参数测量信源为 CHANnel2*/
:MEASure:SOURce?    /* 查询返回 CHAN2*/

---

## 17.2:MEASure:ITEM

**语法**: `:MEASure:ITEM <item>[,<src>[,<src>]]
:MEASure:ITEM? <item>[,<src>[,<src>]]`

**描述**: 测量指定信源的任意波形参数，或查询指定信源的任意波形参数的测量结果。
**参数**: 名称 类型 范围 默认值
<item> 离散型
{VMAX|VMIN|VPP|VTOP|VBASe|
VAMP|VAVG|VRMS|OVERshoot|
PREShoot|MARea|MPARea|
PERiod|FREQuency|RTIMe|
FTIMe|PWIDth|NWIDth|PDUTy|
NDUTy|TVMAX|TVMIN|
PSLewrate|NSLewrate|VUPPer|
VMID|VLOWer|VARiance|PVRMs|
PPULses|NPULses|PEDGes|
NEDGes|RRDelay|RFDelay|
-

名称 类型 范围 默认值
FRDelay|FFDelay|RRPHase|
RFPHase|FRPHase|FFPHase|
ACRMs}
<src> 离散型 {D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
-

**说明**: • <item>具体测量项请参考 测量参数 。
• 参数[,<src>[,<src>]]用于设置被测参数的信源。
- 参数 D0~D15 数字通道仅 DHO900 系列支持。
- 当<item>取值为 PERiod、FREQuency、PWIDth、NWIDth、PDUTy、
NDUTy、RRDelay、RFDelay、FRDelay、FFDelay、RRPHase、RFPHase、
FRPHase、FFPHase，<src>的取值范围为：{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|CHANnel1|CHANnel2|CHANnel3|CHANnel4|
MATH1|MATH2|MATH3|MATH4}。
否则<src>的取值范围为：{CHANnel1|CHANnel2|CHANnel3|CHANnel4|
MATH1|MATH2|MATH3|MATH4}。
- 如果测量参数为单信源，则只需设置一个信源。若省略该参数，则默认
为:MEASure:SOURce、:MEASure:SETup:PSA 或:MEASure:SETup:DSA命令中最
后一个执行时命令选择的信源。
- 如果测量参数为双信源，若省略参数，则第一个信源默认
为:MEASure:SOURce、:MEASure:SETup:PSA 或:MEASure:SETup:DSA命令中最
后一个执行时选择的信源，第二个信源默认为:MEASure:SETup:PSB
或:MEASure:SETup:DSB 命令中最后一个执行时选择的信源。

**返回格式**: 查询以科学计数形式返回当前测量值。
**举例**: :MEASure:ITEM OVERshoot,CHANnel2 /* 打开通道 2 的过冲测量*/
:MEASure:ITEM? OVERshoot,CHANnel2 /* 查询返回 8.888889E-3*/

---

## 17.3:MEASure:CLEar

**语法**: `:MEASure:CLEar`
**描述**: 清除所有已打开的测量项。
**参数**: 无
**说明**: 无。
**返回格式**: 无。
**举例**: 无

---

## 17.4:MEASure:AMSource

**语法**: `:MEASure:AMSource <chan>
:MEASure:AMSource?`

**描述**: 设置信源并显示所设信源的全部测量值，查询全部测量的信源。
**参数**: 名称 类型 范围 默认值
<chan> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4|OFF} OFF

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3、CHAN4 或 OFF。
**举例**: :MEASure:AMSource CHANnel1 /* 设置信源为 CHANnel1*/
:MEASure:AMSource? /* 查询返回 CHAN1*/

---

## 17.5:MEASure:STATistic:COUNt

**语法**: `:MEASure:STATistic:COUNt <val>
:MEASure:STATistic:COUNt?`

**描述**: 设置或查询测量统计次数。
**参数**: 名称 类型 范围 默认值
<val> 整型 2 至 100000 1000

**说明**: 无。
**返回格式**: 查询返回 2 至 100000 之间的任意一个整数。
**举例**: :MEASure:STATistic:COUNt 1000  /* 设置统计测量次数为 1000*/
:MEASure:STATistic:COUNt? /* 查询返回 1000*/

---

## 17.6:MEASure:STATistic:DISPlay

**语法**: `:MEASure:STATistic:DISPlay <bool>
:MEASure:STATistic:DISPlay?`

**描述**: 打开或关闭统计功能，或查询统计功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 打开统计功能时，示波器统计并显示最后打开的测量参数的统计结果。
**返回格式**: 查询返回 1 或 0。
**举例**: :MEASure:STATistic:DISPlay ON /* 打开统计功能*/
:MEASure:STATistic:DISPlay? /* 查询返回 1*/

---

## 17.7:MEASure:STATistic:RESet

**语法**: `:MEASure:STATistic:RESet`
**描述**: 清除历史统计数据并重新统计。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 17.8:MEASure:STATistic:ITEM

**语法**: `:MEASure:STATistic:ITEM <item>[,<src>[,<src>]]
:MEASure:STATistic:ITEM?<type>,<item>[,<src>[,<src>]]`

**描述**: 打开指定信源的任意波形参数的统计功能，或查询指定信源的任意波形参数的统计结果。
**参数**: 名称 类型 范围 默认值
<item> 离散型
{VMAX|VMIN|VPP|VTOP|VBASe|
VAMP|VAVG|VRMS|OVERshoot|
PREShoot|MARea|MPARea|
PERiod|FREQuency|RTIMe|
FTIMe|PWIDth|NWIDth|PDUTy|
NDUTy|TVMAX|TVMIN|
PSLewrate|NSLewrate|VUPPer|
VMID|VLOWer|VARiance|PVRMs|
-

名称 类型 范围 默认值
PPULses|NPULses|PEDGes|
NEDGes|RRDelay|RFDelay|
FRDelay|FFDelay|RRPHase|
RFPHase|FRPHase|FFPHase|
ACRMs}
<src> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
-
<type> 离散型 {MAXimum|MINimum|CURRent|
AVERages|DEViation|CNT} -

**说明**: • <item>具体测量项请参考 测量参数 。
• 参数[,<src>[,<src>]]用于设置被测参数的信源。
- 参数 D0~D15 数字通道仅 DHO900 系列支持。
- 当<item>取值为 PERiod、FREQuency、PWIDth、NWIDth、PDUTy、
NDUTy、RRDelay、RFDelay、FRDelay、FFDelay、RRPHase、RFPHase、
FRPHase、FFPHase，<src>的取值范围为：{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|CHANnel1|CHANnel2|CHANnel3|CHANnel4|
MATH1|MATH2|MATH3|MATH4}。
否则<src>的取值范围为：{CHANnel1|CHANnel2|CHANnel3|CHANnel4|
MATH1|MATH2|MATH3|MATH4}。
- 如果测量参数为单信源，则只需设置一个信源。若省略该参数，则默认
为:MEASure:SOURce、:MEASure:SETup:PSA 或:MEASure:SETup:DSA命令中最
后一个执行时命令选择的信源。
- 如果测量参数为双信源，若省略参数，则第一个信源默认
为:MEASure:SOURce、:MEASure:SETup:PSA 或:MEASure:SETup:DSA命令中最
后一个执行时选择的信源，第二个信源默认为:MEASure:SETup:PSB
或:MEASure:SETup:DSB 命令中最后一个执行时选择的信源。
• <type>统计结果参数请参考 测量结果 。
**返回格式**: 查询以科学计数形式返回统计结果。
**举例**: :MEASure:STATistic:ITEM VPP,CHANnel2 /* 打开 CH2 的峰峰值的统计功能*/
:MEASure:STATistic:ITEM? MAXimum,VPP /* 查询最大值，返回 9.120000E-1*/

---

## 17.9:MEASure:SETup:MAX

**语法**: `:MEASure:SETup:MAX <value>
:MEASure:SETup:MAX?`

**描述**: 设置或查询模拟通道自动测量时门限电平的上限值。
**参数**: 名称 类型 范围 默认值
<value> 整型 请参考说明 -

**说明**: 门限电平上限值的取值范围与当前门限中值有关，可通过:MEASure:SETup:MID命令设置或查询当前模拟通道自动测量时门限电平的中值。
• 当门限值类型为百分比时，范围为（门限中值+1%）至 100%。
• 当门限值类型为绝对值时，范围随着探头比变动，最大范围为-100MV 至 100MV，最小范围为-20V 至 20V。
• 当设置的上限值小于当前门限中值时，并不会自动改变门限中值。
**返回格式**: 查询返回一个整数，且当门限类型为绝对值时，默认单位为 V。
**举例**: :MEASure:SETup:MAX 95 /* 设置门限电平上限值为 95%*/
:MEASure:SETup:MAX? /* 查询返回 95*/

---

## 17.10:MEASure:SETup:MID

**语法**: `:MEASure:SETup:MID <value>
:MEASure:SETup:MID?`

**描述**: 设置或查询模拟通道自动测量时门限电平的中间值。
**参数**: 名称 类型 范围 默认值
<value> 整型 请参考说明 -

**说明**: 设置模拟通道自动测量时门限电平的中间值必须小于当前设置的上限值且大于当前设置的下限值。可通过:MEASure:SETup:MAX 和:MEASure:SETup:MIN 命令设置或查询当前模拟通道自动测量时门限电平的上限值和下限值。
**返回格式**: 查询返回一个整数，且当门限类型为绝对值时，默认单位为 V。
**举例**: :MEASure:SETup:MID 89 /* 设置门限电平的中间值为 89%*/
:MEASure:SETup:MID?    /* 查询返回 89*/

---

## 17.11:MEASure:SETup:MIN

**语法**: `:MEASure:SETup:MIN <value>
:MEASure:SETup:MIN?`

**描述**: 设置或查询模拟通道自动测量时门限电平的下限值。
**参数**: 名称 类型 范围 默认值
<value> 整型 请参考说明 -

**说明**: 门限电平下限值的取值范围与当前门限中值有关，可通过:MEASure:SETup:MID命令设置或查询当前模拟通道自动测量时门限电平的中值。
• 当门限值类型为百分比时，范围为 0%至（门限中值-1%）。
• 当门限值类型为绝对值时，范围随着探头比变动，最大范围为-100MV 至 100MV，最小范围为-20V 至 20V。
• 当设置的下限值大于当前门限中值时，并不会自动改变门限中值。
**返回格式**: 查询返回一个整数，且当门限类型为绝对值时，默认单位为 V。
**举例**: :MEASure:SETup:MIN 53 /* 设置门限电平的下限值为 53%*/
:MEASure:SETup:MIN?   /* 查询返回 53*/

---

## 17.12:MEASure:SETup:PSA

**语法**: `:MEASure:SETup:PSA <source>
:MEASure:SETup:PSA?`

**描述**: 设置或查询相位或延迟时间测量中的信源 A。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。此命令功能同:MEASure:SOURce 和:MEASure:SETup:DSA 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或
MATH4。

**举例**: :MEASure:SETup:PSA CHANnel1 /* 设置相位测量的信源 A 为 CHANnel1*/
:MEASure:SETup:PSA? /* 查询返回 CHAN1*/

---

## 17.13:MEASure:SETup:PSB

**语法**: `:MEASure:SETup:PSB <source>
:MEASure:SETup:PSB?`

**描述**: 设置或查询相位或延迟时间测量中的信源 B。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。此命令功能同:MEASure:SETup:DSB 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或
MATH4。

**举例**: :MEASure:SETup:PSB CHANnel2 /* 设置相位测量的信源 B 为 CHANnel2*/
:MEASure:SETup:PSB? /* 查询返回 CHAN2*/

---

## 17.14:MEASure:SETup:DSA

**语法**: `:MEASure:SETup:DSA <source>
:MEASure:SETup:DSA?`

**描述**: 设置或查询相位或延迟时间测量中的信源 A。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。此命令功能同:MEASure:SOURce 和:MEASure:SETup:PSA 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或
MATH4。

**举例**: :MEASure:SETup:DSA CHANnel1 /* 设置延迟测量的信源 A 为 CHANnel1*/
:MEASure:SETup:DSA? /* 查询返回 CHAN1*/

---

## 17.15:MEASure:SETup:DSB

**语法**: `:MEASure:SETup:DSB <source>
:MEASure:SETup:DSB`

**描述**: 设置或查询相位或延迟时间测量中的信源 B。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。此命令功能同:MEASure:SETup:PSB 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或
MATH4。

**举例**: :MEASure:SETup:DSB CHANnel2 /* 设置延迟测量的信源 B 为 CHANnel2*/
:MEASure:SETup:DSB? /* 查询返回 CHAN2*/

---

## 17.16:MEASure:THReshold:SOURce

**语法**: `:MEASure:THReshold:SOURce <source>
:MEASure:THReshold:SOURce?`

**描述**: 设置或查询门限源。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 修改门限值将影响时间、延迟和相位参数的测量结果。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或 MATH4。
**举例**: :MEASure:THReshold:SOURce CHANnel2 /* 设置门限源为 CHANnel2*/
:MEASure:THReshold:SOURce? /* 查询返回 CHAN2*/

---

## 17.17:MEASure:THReshold:TYPE

**语法**: `:MEASure:THReshold:TYPE <type>
:MEASure:THReshold:TYPE?`

**描述**: 设置或查询测量门限类型。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {PERCent|ABSolute} PERCent

**说明**: 无。
**返回格式**: 查询返回 PERC 或 ABS。
**举例**: :MEASure:THReshold:TYPE ABSolute /* 设置门限类型为 ABSolute 绝对值*/
:MEASure:THReshold:TYPE? /* 查询返回门限类型为 ABS*/

---

## 17.18:MEASure:THReshold:DEFault

**语法**: `:MEASure:THReshold:DEFault`
**描述**: 设置模拟通道自动测量时门限电平为默认值。
**参数**: 无。
**说明**: 门限默认值在绝对值情况下，上下限分别是±当前通道的垂直档位*3
**返回格式**: 无。
**举例**: 无。

---

## 17.19:MEASure:AREA

**语法**: `:MEASure:AREA <area>
:MEASure:AREA?`

**描述**: 设置或查询测量范围的类型。
**参数**: 名称 类型 范围 默认值
<area> 离散型 {MAIN|ZOOM} MAIN

**说明**: • MAIN： 测量范围在主时基区域。
• ZOOM： 测量范围在扩展时基区域。注意，此测量范围需首先打开延迟扫描功能。
**返回格式**: 查询返回 MAIN、ZOOM。
**举例**: :MEASure:AREA ZOOM /* 设置测量范围的类型为 ZOOM*/
:MEASure:AREA? /* 查询返回 ZOOM*/

---

## 17.20:MEASure:INDicator

**语法**: `:MEASure:INDicator <bool>
:MEASure:INDicator?`

**描述**: 设置或查询测量功能光标指示的使能状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :MEASure:INDicator ON   /* 设置测量自动光标开启*/
:MEASure:INDicator?     /* 查询返回 1*/

---

## 17.21:MEASure:COUNter:ENABle

**语法**: `:MEASure:COUNter:ENABle <bool>
:MEASure:COUNter:ENABle?`

**描述**: 设置或查询频率计的使能状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :MEASure:COUNter:ENABle ON  /* 设置频率计使能*/
:MEASure:COUNter:ENABle?    /* 查询返回 1*/

---

## 17.22:MEASure:COUNter:SOURce

**语法**: `:MEASure:COUNter:SOURce <source>
:MEASure:COUNter:SOURce?`

**描述**: 设置或查询频率计的测量源。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|EXT}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。参数“EXT”仅 DHO812 和 DHO802 型号支持。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 EXT。

**举例**: :MEASure:COUNter:SOURce CHANnel4  /* 设置频率计的测量源为 CHANnel4*/
:MEASure:COUNter:SOURce? /* 查询返回 CHAN4*/

---

## 17.23:MEASure:COUNter:VALue?

**语法**: `:MEASure:COUNter:VALue?`
**描述**: 查询频率计的测量结果。
**参数**: 无
**说明**: 无。
**返回格式**: 查询以科学计数形式返回频率计的测量结果。
**举例**: :MEASure:COUNter:VALue?   /* 返回 9.999996E-04*/

---

## 17.24:MEASure:AMP:TYPE

**语法**: `:MEASure:AMP:TYPE <val>
:MEASure:AMP:TYPE?`

**描述**: 设置或查询幅值计算方式。
**参数**: 名称 类型 范围 默认值
<val> 离散型 {AUTO|MANual} MANual

**说明**: • AUTO： 自动测量。
• MANual： 手动测量。
**返回格式**: 查询返回 AUTO 或 MAN。
**举例**: :MEASure:AMP:TYPE MANual  /* 设置幅值计算方式为手动测量*/
:MEASure:AMP:TYPE?  /* 查询返回 MAN*/

---

## 17.25:MEASure:AMP:MANual:TOP

**语法**: `:MEASure:AMP:MANual:TOP <val>
:MEASure:AMP:MANual:TOP?`

**描述**: 设置或查询幅度顶端值手动测量方式。
**参数**: 名称 类型 范围 默认值
<val> 离散型 {HISTogram|MAXMin} HISTogram

**说明**: • HISTogram： 直方图测量法。
• MAXMin： 最大最小值测量法。
**返回格式**: 查询返回 HIST 或 MAXM。
**举例**: :MEASure:AMP:MANual:TOP MAXMin /* 设置幅度顶端值手动测量方式为 MAXMin*/
:MEASure:AMP:MANual:TOP? /* 查询通返回 MAXM*/

---

## 17.26:MEASure:AMP:MANual:BASE

**语法**: `:MEASure:AMP:MANual:BASE <val>
:MEASure:AMP:MANual:BASE?`

**描述**: 设置或查询幅度底端值手动测量方式。
**参数**: 名称 类型 范围 默认值
<val> 离散型 {HISTogram|MAXMin} HISTogram

---

# 18 快捷操作命令子系统
## 17.27:MEASure:CATegory

**语法**: `:MEASure:CATegory <val>
:MEASure:CATegory?`

**描述**: 设置或查询测量的类型。
**参数**: 名称 类型 范围 默认值
<val> 整型 0 至 2 0

**说明**: 0：水平；1：垂直；2：其他。
**返回格式**: 查询返回 0 至 2 之间的一个整数。
**举例**: :MEASure:CATegory 1 /* 设置垂直测量*/
:MEASure:CATegory? /* 查询返回 1*/
3.18 快捷操作命令子系统
快捷操作命令用于设置和查询与快捷键相关的参数。

---

## 18.1:QUICk:OPERation

**语法**: `:QUICk:OPERation <type>`

---

# 19 波形录制命令子系统
波形录制命令用于设置和查询波形录制模式、帧相关的参数。
波形录制与播放功能可以将录制的波形进行播放，从而方便用户对波形进行分析。
## 19.1:RECord:WRECord:ENABle

**语法**: `:RECord:WRECord:ENABle <bool>
:RECord:WRECord:ENABle?`

**描述**: 打开或关闭波形录制功能，或查询波形录制功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 0 或 1。
**举例**: :RECord:WRECord:ENABle ON/* 打开波形录制功能*/
:RECord:WRECord:ENABle? /* 查询返回 1*/

---

## 19.2:RECord:ENABle

**语法**: `:RECord:ENABle <bool>
:RECord:ENABle?`

**描述**: 打开或关闭波形录制功能，或查询波形录制功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 此命令为向后兼容命令，请使用 :RECord:WRECord:ENABle 命令。
**返回格式**: 查询返回 0 或 1。
**举例**: :RECord:ENABle ON /* 打开波形录制功能*/
:RECord:ENABle? /* 查询返回 1*/

---

## 19.3:RECord:WRECord:OPERate

**语法**: `:RECord:WRECord:OPERate <operate>
:RECord:WRECord:OPERate?`

**描述**: 设置或查询波形录制开始或停止。
**参数**: 名称 类型 范围 默认值
<operate> 离散型 {RUN|STOP} STOP

**说明**: 无。
**返回格式**: 查询返回 RUN 或 STOP。
**举例**: :RECord:WRECord:OPERate RUN /* 设置开始录制波形*/
:RECord:WRECord:OPERate? /* 查询返回 RUN*/

---

## 19.4:RECord:STARt

**语法**: `:RECord:STARt <bool>
:RECord:STARt?`

**描述**: 设置或查询波形录制开始或停止。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 此命令为向后兼容命令，请使用 :RECord:WRECord:OPERate 命令。
**返回格式**: 查询返回 1 或 0。
**举例**: :RECord:STARt ON /* 设置开始录制波形*/
:RECord:STARt? /* 查询返回 1*/

---

## 19.5:RECord:WRECord:FRAMes

**语法**: `:RECord:WRECord:FRAMes <value>
:RECord:WRECord:FRAMes?`

**描述**: 设置或查询波形录制帧数。
**参数**: 名称 类型 范围 默认值
<value> 整型 1 至当前可录制的最大帧数 1000

**说明**: 无。
**返回格式**: 查询返回 1 至当前可录制的最大帧数之间的一个整数。
**举例**: :RECord:WRECord:FRAMes 300 /* 设置录制帧数为 300*/
:RECord:WRECord:FRAMes? /* 查询返回 300*/

---

## 19.6:RECord:FRAMes

**语法**: `:RECord:FRAMes <value>
:RECord:FRAMes?`

**描述**: 设置或查询波形录制帧数。
**参数**: 名称 类型 范围 默认值
<value> 整型 1 至当前可录制的最大帧数 1000

**说明**: 此命令为向后兼容命令，请使用 :RECord:WRECord:FRAMes 命令。
**返回格式**: 查询返回 1 至当前可录制的最大帧数之间的一个整数。
**举例**: :RECord:FRAMes 300 /* 设置录制帧数为 300*/
:RECord:FRAMes? /* 查询返回 300*/

---

## 19.7:RECord:WRECord:FRAMes:MAX

**语法**: `:RECord:WRECord:FRAMes:MAX`
**描述**: 设置波形录制录制帧数为最大帧数。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: :RECord:WRECord:FRAMes:MAX  /* 设置波形录制录制帧数为最大帧数*/

---

## 19.8:RECord:WRECord:FMAX?

**语法**: `:RECord:WRECord:FMAX?`
**描述**: 查询当前可录制的最大帧数。
**参数**: 无。
**说明**: 当前可录制的最大帧数由当前的存储深度决定。
**返回格式**: 查询返回一个整数。
**举例**: 无。

---

## 19.9:RECord:WRECord:FINTerval

**语法**: `:RECord:WRECord:FINTerval <interval>
:RECord:WRECord:FINTerval?`

**描述**: 设置或查询波形录制时帧与帧之间的时间间隔。
**参数**: 名称 类型 范围 默认值
<interval> 实型 10ns 至 1s 10ns

**说明**: 无。
**返回格式**: 查询以科学计数形式返回时间间隔，单位为秒。
**举例**: :RECord:WRECord:FINTerval 1 /* 设置波形录制时帧与帧之间的时间间隔为 1s*/
:RECord:WRECord:FINTerval?    /* 返回 1.000000E0*/

---

## 19.10:RECord:WRECord:PROMpt

**语法**: `:RECord:WRECord:PROMpt <bool>
:RECord:WRECord:PROMpt?`

**描述**: 设置或查询录制结束时的声音提示的开启状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: 无。
**返回格式**: 查询返回 0 或 1。
**举例**: :RECord:WRECord:PROMpt ON   /* 设置录制结束时的声音提示开启*/
:RECord:WRECord:PROMpt? /* 查询返回 1*/

---

## 19.11:RECord:WREPlay:FCURrent

**语法**: `:RECord:WREPlay:FCURrent <value>
:RECord:WREPlay:FCURrent?`

**描述**: 设置或查询波形播放的当前帧。
**参数**: 名称 类型 范围 默认值
<value> 整型 1 至已录制的最大帧数 已录制的最大帧
数

**说明**: 无。
**返回格式**: 查询返回一个整数。
**举例**: :RECord:WREPlay:FCURrent 300 /* 设置波形播放的当前帧为 300*/
:RECord:WREPlay:FCURrent? /* 查询返回 300*/

---

## 19.12:RECord:CURRent

**语法**: `:RECord:CURRent <value>
:RECord:CURRent?`

**描述**: 设置或查询波形播放的当前帧。
**参数**: 名称 类型 范围 默认值
<value> 整型 1 至已录制的最大帧数 已录制的最大帧
数

**说明**: 此命令为向后兼容命令，请使用 :RECord:WREPlay:FCURrent 命令。
**返回格式**: 查询返回一个整数。
**举例**: :RECord:CURRent 300 /* 设置波形播放的当前帧为 300*/
:RECord:CURRent? /* 查询返回 300*/

---

## 19.13:RECord:WREPlay:FCURrent:TIME?

**语法**: `:RECord:WREPlay:FCURrent:TIME?`
**描述**: 查询波形播放时当前帧的时间戳。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以字符串形式返回波形播放时当前帧的时间戳。
**举例**: 无。

---

## 19.14:RECord:WREPlay:FSTart

**语法**: `:RECord:WREPlay:FSTart <start>
:RECord:WREPlay:FSTart?`

**描述**: 设置或查询波形播放的起始帧。
**参数**: 名称 类型 范围 默认值
<start> 整型 1 至当前可播放的最大帧数 -

**说明**: 无。
**返回格式**: 查询以整型形式返回波形播放的起始帧。
**举例**: :RECord:WREPlay:FSTart 10    /* 设置波形播放的起始帧为 10*/
:RECord:WREPlay:FSTart? /* 查询返回 10*/

---

## 19.15:RECord:WREPlay:FEND

**语法**: `:RECord:WREPlay:FEND <end>
:RECord:WREPlay:FEND?`

**描述**: 设置或查询波形播放的终止帧。
**参数**: 名称 类型 范围 默认值
<end> 整型 1 至已录制的最大帧数 -

**说明**: 无。
**返回格式**: 查询以整数形式返回波形播放的终止帧。
**举例**: :RECord:WREPlay:FEND 346  /* 设置波形播放的终止帧数为 346*/
:RECord:WREPlay:FEND? /* 查询返回 346*/

---

## 19.16:RECord:WREPlay:FMAX?

**语法**: `:RECord:WREPlay:FMAX?`
**描述**: 查询当前最大可播放的帧数。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回 0 至当前录制帧数之间的整数。
**举例**: 无。

---

## 19.17:RECord:WREPlay:FINTerval

**语法**: `:RECord:WREPlay:FINTerval <interval>
:RECord:WREPlay:FINTerval?`

**描述**: 设置或查询波形播放时帧与帧之间的时间间隔。
**参数**: 名称 类型 范围 默认值
<interval> 实型 1ms 至 1s -

**说明**: 无。
**返回格式**: 查询以科学计数形式返回时间间隔，单位为秒。
**举例**: :RECord:WREPlay:FINTerval 1  /* 设置波形播放时帧与帧之间的时间间隔 1s*/
:RECord:WREPlay:FINTerval?         /* 查询返回 1.000000E0*/

---

## 19.18:RECord:WREPlay:MODE

**语法**: `:RECord:WREPlay:MODE <mode>
:RECord:WREPlay:MODE?`

**描述**: 设置或查询波形播放的模式为循环或单次。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {REPeat|SINGle} SINGle

**说明**: 无。
**返回格式**: 查询返回 REP 或 SING。
**举例**: :RECord:WREPlay:MODE REP  /* 波形播放的模式为 REPeat*/
:RECord:WREPlay:MODE?  /* 查询返回 REP*/

---

## 19.19:RECord:WREPlay:DIRection

**语法**: `:RECord:WREPlay:DIRection <direction>
:RECord:WREPlay:DIRection?`

**描述**: 设置或查询波形播放的方向为正向或反向。
**参数**: 名称 类型 范围 默认值
<direction> 离散型 {FORWard|BACKward} FORWard

**说明**: 无。
**返回格式**: 查询返回 FORW 或 BACK。
**举例**: :RECord:WREPlay:DIRection BACK  /* 波形播放的方向为反向*/  
:RECord:WREPlay:DIRection?  /* 查询返回 BACK*/

---

## 19.20:RECord:WREPlay:OPERate

**语法**: `:RECord:WREPlay:OPERate <operate>
:RECord:WREPlay:OPERate?`

**描述**: 打开或关闭波形播放功能，或查询波形播放功能的状态。
**参数**: 名称 类型 范围 默认值
<operate> 离散型 {RUN|STOP} STOP

**说明**: 无。
**返回格式**: 查询返回 RUN 或 STOP。
**举例**: :RECord:WREPlay:OPERate RUN /* 设置开始播放波形*/
:RECord:WREPlay:OPERate? /* 查询返回 RUN*/

---

## 19.21:RECord:PLAY

**语法**: `:RECord:PLAY <bool>
:RECord:PLAY?`

**描述**: 打开或关闭波形播放功能，或查询波形播放功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 此命令为向后兼容命令，请使用 :RECord:WREPlay:OPERate 命令。
**返回格式**: 查询返回 1 或 0。
**举例**: :RECord:PLAY ON /* 设置开始播放波形*/
:RECord:PLAY? /* 查询返回 1*/

---

## 19.22:RECord:WREPlay:BACK

**语法**: `:RECord:WREPlay:BACK`
**描述**: 手动播放上一帧波形。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: :RECord:WREPlay:BACK  /* 手动播放上一帧波形。*/

---

## 19.23:RECord:WREPlay:NEXT

**语法**: `:RECord:WREPlay:NEXT`
**描述**: 手动播放下一帧波形。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: :RECord:WREPlay:NEXT  /* 手动播放下一帧波形。*/

---

# 20 参考波形命令子系统
## 19.24:RECord:WREPlay:PLAY

**语法**: `:RECord:WREPlay:PLAY <val>`
**描述**: 设置手动播放到起始帧或者结束帧。
**参数**: 名称 类型 范围 默认值
<val> 离散型 {FFIRst|FEND} FFIRst

**说明**: • FFIRst： 起始帧。
• FEND： 结束帧。
**返回格式**: 无。
:RECord:WREPlay:PLAY FEND  /* 设置手动播放到结束帧*/ 3.20 参考波形命令子系统
参考波形命令用于设置参考波形相关的参数。
本系列示波器提供 10 个参考波形位置（即 Ref1~Ref10）。在实际测试过程中，用户可以将
信号波形与参考波形进行比较，从而判断故障原因。

---

## 20.1:REFerence:SOURce

**语法**: `:REFerence:SOURce <ref>,<chan>
:REFerence:SOURce? <ref>`

**描述**: 设置或查询指定参考通道的信源。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} -

名称 类型 范围 默认值
<chan> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。只有当前已打开的通道可作为指定参考通道的信源。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或
MATH4。

**举例**: :REFerence:SOURce 1,CHANnel1 /* 设置参考通道 1 的信源为 CHANnel1*/
:REFerence:SOURce? 1         /* 查询返回 CHAN1*/

---

## 20.2:REFerence:VSCale

**语法**: `:REFerence:VSCale <ref>,<scale>
:REFerence:VSCale? <ref>`

**描述**: 设置或查询指定参考通道的垂直档位。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} -
<scale> 实型 请参考说明 50mV

**说明**: 参数的取值范围与探头比设置有关。探头比为 1X：100μV 至 10V；探头比为 10X：1mV 至 100V该命令仅当指定的参考通道已保存参考波形时可用。
**返回格式**: 查询以科学计数形式返回垂直档位。
**举例**: :REFerence:VSCale 1,2 /* 设置参考通道 1 的垂直档位为 2V*/
:REFerence:VSCale? 1 /* 查询返回 2.000000E0*/

---

## 20.3:REFerence:VOFFset

**语法**: `:REFerence:VOFFset <ref>,<offset>
:REFerence:VOFFset? <ref>`

**描述**: 设置或查询指定参考通道的垂直偏移。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} -
<offset> 实型 (-10× RefVerticalScale)至(10×
RefVerticalScale) 0V

**说明**: RefVerticalScale 指当前设置的参考通道的垂直档位。
**返回格式**: 查询以科学计数形式返回垂直偏移。
**举例**: :REFerence:VOFFset 1,0.5 /* 设置参考通道 1 的垂直位移为 500mV*/
:REFerence:VOFFset? 1 /* 查询返回 5.000000E-1*/

---

## 20.4:REFerence:RESet

**语法**: `:REFerence:RESet <ref>`
**描述**: 复位指定参考通道。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} -

**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 20.5:REFerence:CURRent

**语法**: `:REFerence:CURRent <ref>`
**描述**: 设置当前参考通道。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} 1

**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 20.6:REFerence:SAVE

**语法**: `:REFerence:SAVE <ref>`
**描述**: 将指定参考通道的波形保存到内存，作为参考波形。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} -

**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 20.7:REFerence:COLor

**语法**: `:REFerence:COLor <ref>, <color>
:REFerence:COLor? <ref>`

**描述**: 设置或查询指定参考通道的颜色。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} -
<color> 离散型 {GRAY|GREen|BLUE|RED|
ORANge} -

**说明**: 无。
**返回格式**: 查询返回 GRAY、 GRE、 BLUE、 RED 或 ORAN。
**举例**: :REFerence:COLor 1,GREen /* 设置参考通道 1 的显示颜色为绿色*/
:REFerence:COLor? 1 /* 查询返回 GRE*/

---

## 20.8:REFerence:LABel:ENABle

**语法**: `:REFerence:LABel:ENABle <bool>
:REFerence:LABel:ENABle?`

**描述**: 打开或关闭所有参考通道标签的显示，或查询所有参考通道标签的显示状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :REFerence:LABel:ENABle ON /* 打开所有参考通道标签的显示*/
:REFerence:LABel:ENABle? /* 查询返回 1*/

---

## 20.9:REFerence:LABel:CONTent

**语法**: `:REFerence:LABel:CONTent <ref>,<str>
:REFerence:LABel:CONTent? <ref>`

**描述**: 设置或查询指定参考通道的标签。
**参数**: 名称 类型 范围 默认值
<ref> 离散型 {1|2|3|4|5|6|7|8|9|10} -
<str> ASCII 字符串 包含英文字母和数字，也可包含部
分符号 -

**说明**: 无。
**返回格式**: 以字符串形式返回指定参考通道的标签。
**举例**: :REFerence:LABel:CONTent 1,REF1 /* 设置参考通道 1 的标签为 REF1*/
:REFerence:LABel:CONTent? 1 /* 查询返回 REF1*/

---

# 21 存储功能命令子系统
用户可将当前示波器的设置、波形、屏幕图像和参数等以多种格式保存到内部存储器或外部
USB 存储设备（如 U 盘）中，并可以在需要时重新加载已保存的文件。
## 21.1:SAVE:IMAGe:INVert

**语法**: `:SAVE:IMAGe:INVert <bool>
:SAVE:IMAGe:INVert?`

**描述**: 打开或关闭图像存储时的反色功能，或查询反色功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :SAVE:IMAGe:INVert ON /* 打开图像存储时的反色功能*/
:SAVE:IMAGe:INVert? /* 查询返回 1*/

---

## 21.2:SAVE:IMAGe:COLor

**语法**: `:SAVE:IMAGe:COLor <color>
:SAVE:IMAGe:COLor?`

**描述**: 设置图像存储时的图像颜色为彩色或灰度，或查询图像存储时的图像颜色。
**参数**: 名称 类型 范围 默认值
<color> 离散型 {COLor|GRAY} COLor

**说明**: 无。
**返回格式**: 查询返回 COL 或 GRAY。
**举例**: :SAVE:IMAGe:COLor GRAY /* 设置图像存储时的图像颜色为灰色*/
:SAVE:IMAGe:COLor?    /* 查询返回 GRAY*/

---

## 21.3:SAVE:IMAGe:FORMat

**语法**: `:SAVE:IMAGe:FORMat <format>
:SAVE:IMAGe:FORMat?`

**描述**: 设置或查询图像存储的格式。
**参数**: 名称 类型 范围 默认值
<format> 离散型 {PNG|BMP|JPG} -

**说明**: 无。
**返回格式**: 查询返回 PNG、BMP 或 JPG。
**举例**: :SAVE:IMAGe:FORMat PNG /* 设置图像存储的格式为 PNG*/
:SAVE:IMAGe:FORMat? /* 查询返回 PNG*/

---

## 21.4:SAVE:IMAGe:HEADer

**语法**: `:SAVE:IMAGe:HEADer <bool>
:SAVE:IMAGe:HEADer?`

**描述**: 设置或查询图像页眉显示状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} -

**说明**: • 1|ON： 打开页眉显示。保存图像文件时，图像页眉处显示仪器型号和图像构建日期。
• 0|OFF： 关闭页眉显示。
**返回格式**: 查询返回 1 或 0。
**举例**: :SAVE:IMAGe:HEADer ON /* 打开页眉显示*/
:SAVE:IMAGe:HEADer? /* 查询返回 1*/

---

## 21.5:SAVE:IMAGe:DATA?

**语法**: `:SAVE:IMAGe:DATA?`
**描述**: 查询返回当前显示图像的位图数据流。
**参数**: 无。
**说明**: 读取的数据格式为 TMC 头+屏幕截图的二进制数据流+结束符。 TMC 头为 #NXXXXXX 的形式， #为 TMC 规定的头标志符， N 表示后面含有 N 个字节，以 ASCII 字符的形式描述屏幕截图二进制数据流的长度，结束符用于表示通讯的终止。例如，一次读取的数据为：
#9000387356 表示 9 个字节描述数据的长度， 000387356 表示二进制数据流的长度，即
387356 字节。

**返回格式**: 查询返回二进制数据流。
**举例**: :SAVE:IMAGe:DATA? /* 查询返回二进制数据流*/

---

## 21.6:SAVE:IMAGe

**语法**: `:SAVE:IMAGe <path>`
**描述**: 将示波器截图以文件形式存储到 path 指定的位置。
**参数**: 名称 类型 范围 默认值
<path> ASCII 字符串 请参考说明 -

**说明**: 参数<path>中包含文件存储路径和带后缀的文件名。
• 本地存储（Local Disk）路径为 C:/ ；外部存储器路径可为 D:/ 或 E:/。
• 支持文件名的后缀为.bmp、.png 或.jpg。
• 参考 :SAVE:OVERlap 命令，当:SAVE:OVERlap 为 ON 时，若指定的路径已存有相同名称的文件，则覆盖原文件。
• 文件名可设置为字母、数字等非中文字符，建议不超过 16 个字符。
**返回格式**: 无。
:SAVE:IMAGe D:/123.png    /* 将示波器截图存储至外部存储器 D 盘中，文件名为123.png*/

---

## 21.7:SAVE:SETup

**语法**: `:SAVE:SETup <path>`
**描述**: 将示波器当前设置以文件形式存储到 path 指定的位置。
**参数**: 名称 类型 范围 默认值
<path> ASCII 字符串 请参考说明 -

**说明**: 参数<path>中包含文件存储路径和带后缀的文件名。
• 本地存储（Local Disk）路径为 C:/ ；外部存储器路径可为 D:/ 或 E:/。
• 文件名的后缀为.stp。
• 参考 :SAVE:OVERlap 命令，当:SAVE:OVERlap 为 ON 时，若指定的路径已存有相同名称的文件，则覆盖原文件。
• 文件名可设置为字母、数字等非中文字符，建议不超过 16 个字符。
**返回格式**: 无。
**举例**: :SAVE:SETup D:/123.stp /* 将当前示波器的设置参数存储至外部存储器 D 盘中，文件名为 123.stp*/

---

## 21.8:SAVE:WAVeform

**语法**: `:SAVE:WAVeform <path>`
**描述**: 将示波器屏幕波形数据以文件形式存储到 path 指定的位置。
**参数**: 名称 类型 范围 默认值
<path> ASCII 字符串 请参考说明 -

**说明**: 参数<path>中包含文件存储路径和带后缀的文件名。
• 本地存储（Local Disk）路径为 C:/ ；外部存储器路径可为 D:/ 或 E:/ 。
• 文件名的后缀为.bin 或.csv。
• 参考 :SAVE:OVERlap 命令，当:SAVE:OVERlap 为 ON 时，若指定的路径已存有相同名称的文件，则覆盖原文件。
• 文件名可设置为字母、数字等非中文字符，建议不超过 16 个字符。
**返回格式**: 无。
:SAVE:WAVeform D:/123.csv  /* 将屏幕波形文件存储至外部存储器 D 盘中，文件名为123.csv*/

---

## 21.9:SAVE:MEMory:WAVeform

**语法**: `:SAVE:MEMory:WAVeform <path>`
**描述**: 将示波器内存波形数据以文件形式存储到 path 指定的位置。
**参数**: 名称 类型 范围 默认值
<path> ASCII 字符串 请参考说明 -

**说明**: 参数<path>中包含文件存储路径和带后缀的文件名。
• 本地存储（Local Disk）路径为 C:/ ；外部存储器路径可为 D:/ 或 E:/ 。
• 文件名的后缀为.bin、.csv 或.wfm。
• 参考 :SAVE:OVERlap 命令，当:SAVE:OVERlap 为 ON 时，若指定的路径已存有相同名称的文件，则覆盖原文件。
• 文件名可设置为字母、数字等非中文字符，建议不超过 16 个字符。
**返回格式**: 无。
**举例**: :SAVE:MEMory:WAVeform D:/123.bin /* 将示波器内存波形数据存储到 D 盘中，文件名为 123.bin*/

---

## 21.10:SAVE:STATus?

**语法**: `:SAVE:STATus?`
**描述**: 查询存储状态。
**参数**: 无。
**说明**: 无。
**返回格式**: 返回 0 或 1(保存完成)。
**举例**: 无。

---

## 21.11:SAVE:OVERlap

**语法**: `:SAVE:OVERlap <bool>
:SAVE:OVERlap?`

**描述**: 设置或查询文件覆盖功能是否打开。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} -

**说明**: • 1|ON： 打开文件覆盖功能。存储的文件会覆盖指定存储路径下已存在的同名文件。
• 0|OFF： 关闭文件覆盖功能。
**返回格式**: 查询返回 1 或 0。
**举例**: :SAVE:OVERlap ON /* 打开文件覆盖功能*/
:SAVE:OVERlap? /* 查询返回 1*/

---

## 21.12:SAVE:PREFix

**语法**: `:SAVE:PREFix <name>
:SAVE:PREFix?`

**描述**: 设置或查询文件名前缀。
**参数**: 名称 类型 范围 默认值
<name> ASCII 字符串 说明 -

**说明**: 文件名由文件主名（前缀名）和文件扩展名（后缀名）组成。本命令中的文件名前缀是指不带文件格式后缀的文件主名。可设置为字母、数字等非中文字符，建议不超过 16 个字符。
**返回格式**: 查询以字符串形式返回文件名前缀。
**举例**: :SAVE:PREFix Rigol /* 设置文件名前缀为 Rigol*/
:SAVE:PREFix? /* 查询返回 Rigol*/

---

## 21.13:SAVe:SMB:SERVerpath

**语法**: `:SAVe:SMB:SERVerpath <path>
:SAVe:SMB:SERVerpath?`

**描述**: 设置或查询 SMB 文件共享的服务器路径。
**参数**: 名称 类型 范围 默认值
<path> ASCII 字符串 - -

**说明**: 服务器路径格式为\\xxx.xxx.xxx.xxx\name，其中 xxx.xxx.xxx.xxx 为计算机 IP 地址，name为共享文件夹名称（只能包含英文字符）。
**返回格式**: 以字符串形式返回 SMB 文件共享的服务器路径。
**举例**: :SAVe:SMB:SERVerpath \\172.16.25.77\Share    /* 设置 SMB 文件共享的服务器路径为\\172.16.25.77\Share*/
:SAVe:SMB:SERVerpath?  /* 查询返回\\172.16.25.77\Share*/

---

## 21.14:SAVe:SMB:USERname

**语法**: `:SAVe:SMB:USERname <name>
:SAVe:SMB:USERname?`

**描述**: 设置或查询 SMB 文件共享的用户名。
**参数**: 名称 类型 范围 默认值
<name> ASCII 字符串 - -

**说明**: 用户名不能包含中文字符。
**返回格式**: 以字符串形式返回 SMB 文件共享的用户名。
**举例**: :SAVe:SMB:USERname Rigol  /* 设置 SMB 文件共享的用户名为 Rigol */
:SAVe:SMB:USERname?      /* 查询返回 Rigol */

---

## 21.15:SAVe:SMB:PASSword

**语法**: `:SAVe:SMB:PASSword <password>
:SAVe:SMB:PASSword?`

**描述**: 设置或查询 SMB 文件共享的密码。
**参数**: 名称 类型 范围 默认值
<password> ASCII 字符串 - -

**说明**: 密码不能包含中文字符。
**返回格式**: 查询返回 SMB 文件共享的密码。
**举例**: :SAVe:SMB:PASSword Rigol   /* 设置 SMB 文件共享的密码为 Rigol */
:SAVe:SMB:PASSword?      /* 查询返回 Rigol*/

---

## 21.16:SAVe:SMB:AUToconnect

**语法**: `:SAVe:SMB:AUToconnect <bool>
:SAVe:SMB:AUToconnect?`

**描述**: 设置或查询 SMB 文件共享自动连接状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} OFF

**说明**: 无。
**返回格式**: 查询返回 0 或 1。
**举例**: :SAVe:SMB:AUToconnect ON /* 设置 SMB 文件共享自动连接*/
:SAVe:SMB:AUToconnect? /* 查询返回 1*/

---

## 21.17:SAVe:SMB:CONNect

**语法**: `:SAVe:SMB:CONNect`
**描述**: 配置 SMB 文件共享连接。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 21.18:SAVe:SMB:DISConnect

**语法**: `:SAVe:SMB:DISConnect`
**描述**: 配置 SMB 文件共享断开。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 21.19:SAVe:SMB:CONState?

**语法**: `:SAVe:SMB:CONState?`
**描述**: 查询 SMB 文件共享连接状态。
**参数**: 无。
**说明**: 查询返回 1 表示 SMB 文件共享连接成功。

---

# 22 搜索命令子系统
## 21.20:LOAD:SETup

**语法**: `:LOAD:SETup <path>`
**描述**: 从 path 指定的位置加载示波器的设置文件。
**参数**: 名称 类型 范围 默认值
<path> ASCII 字符串 请参考说明 -

**说明**: 参数<path>中包含文件存储路径和带后缀的文件名。
• 本地存储（Local Disk）路径为 C:/ ；外部存储器路径可为 D:/ 或 E:/。
• 可加载的文件名后缀为.stp。
**返回格式**: 无。
:LOAD:SETup D:/123.stp /* 从外部存储器 D 盘中加载文件名为 123.stp 的设置文件*/ 3.22 搜索命令子系统

---

## 22.1:SEARch:COUNt?

**语法**: `:SEARch:COUNt?`
**描述**: 查询搜索事件总数。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以整数形式返回搜索结果总个数。
**举例**: 无。

---

## 22.2:SEARch:STATe

**语法**: `:SEARch:STATe <bool>
:SEARch:STATe?`

**描述**: 打开或关闭搜索功能，或查询搜索功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**返回格式**: 查询返回 1 或 0。
**举例**: :SEARch:STATe ON /* 打开搜索功能*/
:SEARch:STATe? /* 查询返回 1*/

---

## 22.3:SEARch:MODE

**语法**: `:SEARch:MODE <value>
:SEARch:MODE?`

**描述**: 设置搜索类型。
**参数**: 名称 类型 范围 默认值
<value> 离散型 {EDGE|PULSe} EDGE

**说明**: • EDGE： 选择搜索类型为“边沿”。
• PULSe： 选择搜索类型为“脉宽”。
**返回格式**: 查询返回 EDGE 或 PULS。
**举例**: :SEARch:MODE PULSe    /* 选择搜索类型为“脉宽”*/
:SEARch:MODE?      /* 查询返回 PULS*/

---

## 22.4:SEARch:EVENt

**语法**: `:SEARch:EVENt <value>
:SEARch:EVENt?`

**描述**: 设置导航到一个搜索事件。
**参数**: 名称 类型 范围 默认值
<value> 整型 取值为 0 到搜索到的事件数 0

**说明**: 如果在当前搜索事件表中没有该搜索事件，则查询返回 0。如果<value>值为 0，则导航到当前搜索事件表中索引为 1 的事件。
**返回格式**: 查询返回一个整数。
**举例**: :SEARch:EVENt 1    /* 设置导航到搜索事件 1*/
:SEARch:EVENt?      /* 查询返回 1*/

---

## 22.5:SEARch:VALue?

**语法**: `:SEARch:VALue? <x>`
**描述**: 查询标记号为 x 处的时间位置。
**参数**: 名称 类型 范围 默认值
<x> 整型 - -

**说明**: 参数<x>表示标记表的行号。
**返回格式**: 查询返回一个时间。
**举例**: 无。

---

## 22.6:SEARch:EDGE:SLOPe

**语法**: `:SEARch:EDGE:SLOPe <slope>
:SEARch:EDGE:SLOPe?`

**描述**: 设置或查询搜索类型为边沿时的边沿类型。
**参数**: 名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative|EITHer} POSitive

**说明**: • POSitive： 上升沿
• NEGative： 下降沿
• EITHer： 任意沿
**返回格式**: 查询返回 POS、NEG 或 EITH。
**举例**: :SEARch:EDGE:SLOPe NEGative    /* 设置边沿类型为下降沿*/
:SEARch:EDGE:SLOPe?      /* 查询返回 NEG*/

---

## 22.7:SEARch:EDGE:SOURce

**语法**: `:SEARch:EDGE:SOURce <source>
:SEARch:EDGE:SOURce?`

**描述**: 设置或查询搜索类型为边沿时的信源。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。
**举例**: :SEARch:EDGE:SOURce CHANnel1    /* 设置信源为 CHANnel1*/
:SEARch:EDGE:SOURce?      /* 查询返回 CHAN1*/

---

## 22.8:SEARch:EDGE:THReshold

**语法**: `:SEARch:EDGE:THReshold <thre>
:SEARch:EDGE:THReshold?`

**描述**: 设置或查询搜索类型为边沿时的阈值。
**参数**: 名称 类型 范围 默认值
<thre> 实型 (-4.5×VerticalScale-OFFSet)至
(4.5×VerticalScale-OFFSet) 0.000V

**说明**: 无。
**返回格式**: 查询以科学计数形式返回搜索类型为边沿时的阈值。
**举例**: :SEARch:EDGE:THReshold 0.01    /* 设置阈值为 0.01V*/
:SEARch:EDGE:THReshold?      /* 查询返回 1.000000E-2*/

---

## 22.9:SEARch:PULSe:POLarity

**语法**: `:SEARch:PULSe:POLarity <polarity>
:SEARch:PULSe:POLarity?`

**描述**: 选择或查询搜索类型为脉宽时的极性。
**参数**: 名称 类型 范围 默认值
<polarity> 离散型 {POSitive|NEGative} POSitive

**说明**: 无。
**返回格式**: 查询返回 POS 或 NEG。
**举例**: :SEARch:PULSe:POLarity POSitive  /* 将搜索类型为脉宽时的极性设置为正极性*/
:SEARch:PULSe:POLarity?    /* 查询返回 POS*/

---

## 22.10:SEARch:PULSe:QUALifier

**语法**: `:SEARch:PULSe:QUALifier <qualifier>
:SEARch:PULSe:QUALifier?`

**描述**: 选择或查询搜索类型为脉宽时的搜索条件。
**参数**: 名称 类型 范围 默认值
<qualifier> 离散型 {GREater|LESS|GLESs} GREater

**说明**: • GREater： 输入信号的正脉宽/负脉宽大于指定的脉宽设置。
• LESS： 输入信号的正脉宽/负脉宽小于指定的脉宽设置。
• GLESs： 输入信号的正脉宽/负脉宽大于指定的脉宽下限且小于指定的脉宽上限。
**返回格式**: 查询返回 GRE、LESS 或 GLES。
**举例**: :SEARch:PULSe:QUALifier LESS    /* 设置搜索类型为脉宽时的搜索条件为 LESS*/
:SEARch:PULSe:QUALifier?      /* 查询返回 LESS*/

---

## 22.11:SEARch:PULSe:SOURce

**语法**: `:SEARch:PULSe:SOURce <source>
:SEARch:PULSe:SOURce?`

**描述**: 设置或查询搜索类型为脉宽时的信源。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。
**举例**: :SEARch:PULSe:SOURce CHANnel1    /* 将信源设置为 CHANnel1*/
:SEARch:PULSe:SOURce?      /* 查询返回 CHAN1*/

---

## 22.12:SEARch:PULSe:UWIDth

**语法**: `:SEARch:PULSe:UWIDth <width>
:SEARch:PULSe:UWIDth?`

**描述**: 设置或查询搜索类型为脉宽时的脉宽上限值。
**参数**: 名称 类型 范围 默认值
<width> 实型 800ps 至 10s 2us

**说明**: 无。
**返回格式**: 查询以科学计数形式返回脉宽上限值。
**举例**: :SEARch:PULSe:UWIDth 1    /* 设置脉宽上限值为 1s*/
:SEARch:PULSe:UWIDth?      /* 查询返回 1.000000E0*/

---

## 22.13:SEARch:PULSe:LWIDth

**语法**: `:SEARch:PULSe:LWIDth <width>
:SEARch:PULSe:LWIDth?`

**描述**: 设置或查询搜索类型为脉宽时的脉宽下限值。
**参数**: 名称 类型 范围 默认值
<width> 实型 800ps 至 10s 1us

**说明**: 无。
**返回格式**: 查询以科学计数形式返回脉宽下限值。
**举例**: :SEARch:PULSe:LWIDth 0.2    /* 设置脉宽下限值为 200ms*/
:SEARch:PULSe:LWIDth?      /* 查询返回 2.000000E-1*/

---

# 23 导航命令子系统
## 22.14:SEARch:PULSe:THReshold

**语法**: `:SEARch:PULSe:THReshold <thre>
:SEARch:PULSe:THReshold?`

**描述**: 设置或查询搜索类型为脉宽时的阈值。
**参数**: 名称 类型 范围 默认值
<thre> 实型 (-5×VerticalScale-OFFSet)至(5×
VerticalScale-OFFSet) 0.000V

**说明**: 无。
**返回格式**: 查询以科学计数形式返回搜索类型为脉宽时的阈值。
**举例**: :SEARch:PULSe:THReshold 0.01    /* 设置阈值为 10mV*/
:SEARch:PULSe:THReshold?      /* 查询返回 1.000000E-2*/
3.23 导航命令子系统

---

## 23.1:NAVigate:ENABle

**语法**: `:NAVigate:ENABle <bool>
:NAVigate:ENABle?`

**描述**: 设置或查询导航功能开关状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :NAVigate:ENABle ON /* 打开导航功能*/
:NAVigate:ENABle? /* 查询返回 1*/

---

## 23.2:NAVigate:MODE

**语法**: `:NAVigate:MODE <mode>
:NAVigate:MODE?`

**描述**: 设置或查询导航模式。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {TIME|SEARch|FRAMe} TIME

**说明**: • TIME： 时间导航。时间导航模式仅在“YT”时基模式下可用。
• SEARch： 搜索事件导航。使用搜索功能完成事件搜索后，可以使用搜索事件导航快速查看标记事件。
• FRAMe： 帧段导航。帧段导航仅在凝时获取模式下有效，且凝时采样之后导航模式选项默认为“帧段”，不可设为其他模式。导航功能仅在运行状态为 STOP（采集停止）时可用。可发送 :STOP 命令设置 STOP 状态。
**返回格式**: 查询返回 TIME、FRAMe 或 SEARch。
**举例**: :NAVigate:MODE TIME /* 设置导航模式为时间导航*/
:NAVigate:MODE? /* 查询返回 TIME*/

---

## 23.3:NAVigate:TIME:SPEed

**语法**: `:NAVigate:TIME:SPEed <speed>
:NAVigate:TIME:SPEed?`

**描述**: 设置或查询时间导航模式的波形播放速度。
**参数**: 名称 类型 范围 默认值
<speed> 离散型 {HIGH|NORMal|LOW} NORMal

**说明**: • HIGH： 高。
• NORMal： 中。
• LOW： 低。
**返回格式**: 查询返回 HIGH、NORMal 或 LOW。
**举例**: :NAVigate:TIME:SPEed LOW /* 设置时间导航模式的波形播放速度为低速*/
:NAVigate:TIME:SPEed? /* 查询返回 LOW*/

---

## 23.4:NAVigate:TIME:PLAY

**语法**: `:NAVigate:TIME:PLAY <bool>
:NAVigate:TIME:PLAY?`

**描述**: 设置或查询时间导航是否开始播放波形。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: • 1|ON： 开始播放波形。
• 0|OFF： 停止播放波形。
**返回格式**: 查询返回 0 或 1。
**举例**: :NAVigate:TIME:PLAY ON /* 开始播放时间导航模式的波形*/
:NAVigate:TIME:PLAY? /* 查询返回 1*/

---

## 23.5:NAVigate:TIME:END

**语法**: `:NAVigate:TIME:END`
**描述**: 设置时间导航模式波形播放到最右端（末尾）。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.6:NAVigate:TIME:STARt

**语法**: `:NAVigate:TIME:STARt`
**描述**: 设置时间导航模式波形播放到最左端（起始）。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.7:NAVigate:TIME:NEXT

**语法**: `:NAVigate:TIME:NEXT`
**描述**: 设置时间导航模式波形向右偏移。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.8:NAVigate:TIME:BACK

**语法**: `:NAVigate:TIME:BACK`
**描述**: 设置时间导航模式波形向左偏移。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.9:NAVigate:SEARch:END

**语法**: `:NAVigate:SEARch:END`
**描述**: 设置事件导航指向最后一个事件。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.10:NAVigate:SEARch:STARt

**语法**: `:NAVigate:SEARch:STARt`
**描述**: 设置事件导航指向第一个事件。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.11:NAVigate:SEARch:NEXT

**语法**: `:NAVigate:SEARch:NEXT`
**描述**: 设置事件导航指向下一个事件。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.12:NAVigate:SEARch:BACK

**语法**: `:NAVigate:SEARch:BACK`
**描述**: 设置事件导航指向上一个事件。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.13:NAVigate:FRAMe:DISPlay:MODE

**语法**: `:NAVigate:FRAMe:DISPlay:MODE <mode>
:NAVigate:FRAMe:DISPlay:MODE?`

**描述**: 设置或查询帧段导航的显示模式。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {ADJacent|OVERlay|WATerfall|
PERSpective|MOSaic} -

**说明**: • ADJacent： 相邻模式，将捕获的帧按时间顺序排列显示。此模式下一屏最多显示 100帧波形。
• OVERlay： 重叠模式，将捕获到的帧重叠排列显示。此模式下一屏最多显示 100 帧波形。
• WATerfall： 瀑布模式，带有垂直偏置的排列显示。此模式下一屏最多显示 100 帧波形。
• PERSpective： 透视模式，带有垂直偏置和水平偏置的排列显示。此模式下一屏最多显示 100 帧波形。
• MOSaic： 马赛克模式，将整个波形视图区域分成若干块，将存储帧按顺序显示在每一个块中。此模式下一屏最多显示 80 帧波形。
**返回格式**: 查询返回 ADJ、OVER、WAT、PERS 或 MOS。
**举例**: :NAVigate:FRAMe:DISPlay:MODE ADJacent /* 设置帧段导航显示模式为相邻模式*/
:NAVigate:FRAMe:DISPlay:MODE? /* 查询返回 ADJ*/

---

## 23.14:NAVigate:FRAMe:END:FRAMe

**语法**: `:NAVigate:FRAMe:END:FRAMe <frame>
:NAVigate:FRAMe:END:FRAMe?`

**描述**: 设置或查询帧段导航的结束帧数。
**参数**: 名称 类型 范围 默认值
<frame> 整型 - -

**说明**: 结束帧数设置范围为起始帧数到凝时获取到的最大帧数之间。可通过 :ACQuire:ULTRa:MAXFrame 命令查询凝时获取的最大帧数。当点击播放键时，将从“起始帧数”开始播放，每页显示的帧段数为：结束帧数-起始帧数
+1。例如设置起始帧数为 3，结束帧数为 9，点击播放键时将从第 3 帧开始播放，每页显示 7
帧波形。

**返回格式**: 查询返回一个整数。
**举例**: :NAVigate:FRAMe:END:FRAMe 8 /* 设置帧段导航的结束帧数为 8*/
:NAVigate:FRAMe:END:FRAMe? /* 查询返回 8*/

---

## 23.15:NAVigate:FRAMe:STARt:FRAMe

**语法**: `:NAVigate:FRAMe:STARt:FRAMe <frame>
:NAVigate:FRAMe:STARt:FRAMe?`

**描述**: 设置或查询帧段导航的开始帧数。
**参数**: 名称 类型 范围 默认值
<frame> 整型 - -

**说明**: 当点击播放键时，将从“起始帧数”开始播放，每页显示的帧段数为：结束帧数-起始帧数
+1。例如设置起始帧数为 3，结束帧数为 9，点击播放键时将从第 3 帧开始播放，每页显示 7
帧波形。

**返回格式**: 查询返回一个整数。
**举例**: :NAVigate:FRAMe:STARt:FRAMe 3 /* 设置帧段导航的开始帧数为 3*/
:NAVigate:FRAMe:STARt:FRAMe? /* 查询返回 3*/

---

## 23.16:NAVigate:FRAMe:END

**语法**: `:NAVigate:FRAMe:END`
**描述**: 设置帧段导航播放到最后一页。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.17:NAVigate:FRAMe:STARt

**语法**: `:NAVigate:FRAMe:STARt`
**描述**: 设置帧段导航播放到第一页。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.18:NAVigate:FRAMe:NEXT

**语法**: `:NAVigate:FRAMe:NEXT`
**描述**: 设置帧段导航播放到下一页。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.19:NAVigate:FRAMe:BACK

**语法**: `:NAVigate:FRAMe:BACK`
**描述**: 设置帧段导航播放到上一页。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 23.20:NAVigate:FRAMe:PLAY

**语法**: `:NAVigate:FRAMe:PLAY <bool>
:NAVigate:FRAMe:PLAY?`

**描述**: 设置或查询帧段导航是否开始播放波形。

---

# 24 辅助命令子系统
辅助命令用于设置声音、语言等系统相关的功能。
## 24.1:SYSTem:AOUTput

**语法**: `:SYSTem:AOUTput <auxoutput>
:SYSTem:AOUTput?`

**描述**: 设置或查询后面板 [AUX OUT] 连接器输出的信号类型。
**参数**: 名称 类型 范围 默认值
<auxoutput> 离散型 {TOUT|PFAil} TOUT

**说明**: • TOUT： 选择该类型后，示波器产生一次触发时，连接器输出一个可反映示波器当前捕获率的信号。
• PFAil： 选择该类型后，当示波器测试到成功或失败的事件时，连接器输出一个脉冲信号。
**返回格式**: 查询返回 TOUT 或 PFA。
**举例**: :SYSTem:AOUTput PFAil /* 设置信号类型为 PFAil*/
:SYSTem:AOUTput? /* 查询返回 PFA*/

---

## 24.2:SYSTem:BEEPer

**语法**: `:SYSTem:BEEPer <bool>
:SYSTem:BEEPer?`

**描述**: 启用或禁用蜂鸣器，或查询当前蜂鸣器的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :SYSTem:BEEPer ON /* 启用蜂鸣器*/
:SYSTem:BEEPer? /* 查询返回 1*/

---

## 24.3:SYSTem:ERRor[:NEXT]?

**语法**: `:SYSTem:ERRor[:NEXT]?`
**描述**: 查询并删除系统的错误队列消息。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以“<消息编号>,<消息内容>”格式返回错误消息，其中，<消息编号>是一个整数，<消息内容>是一个带双引号的 ASCII 字符串。如-113,"Undefined header; command cannot be found"。
**举例**: 无。

---

## 24.4:SYSTem:PON

**语法**: `:SYSTem:PON <power_on>
:SYSTem:PON?`

**描述**: 设置或查询示波器重新上电时所调用的配置类型。
**参数**: 名称 类型 范围 默认值
<power_on> 离散型 {LATest|DEFault} DEFault

**说明**: 无。
**返回格式**: 查询返回 LAT 或 DEF。
**举例**: :SYSTem:PON LATest /* 设置示波器重新上电时调用上次值*/
:SYSTem:PON? /* 查询返回 LAT*/

---

## 24.5:SYSTem:PSTatus

**语法**: `:SYSTem:PSTatus <sat>
:SYSTem:PSTatus?`

**描述**: 设置或查询示波器的电源状态。
**参数**: 名称 类型 范围 默认值
<sat> 离散型 {DEFault|OPEN} OPEN

**说明**: • DEFault：  示波器通电后，需按下前面板的电源键后开机。
• OPEN：  示波器通电后直接开机，无需按下电源键。
**返回格式**: 查询返回 DEF 或 OPEN。
**举例**: :SYSTem:PSTatus DEFault /* 设置电源状态为 DEFault*/
:SYSTem:PSTatus? /* 查询返回 DEF*/

---

## 24.6:SYSTem:RAMount?

**语法**: `:SYSTem:RAMount?`
**描述**: 查询当前仪器的模拟通道数。
**参数**: 无。
**说明**: 无。
**返回格式**: 以整数的形式返回当前仪器的模拟通道数。
**举例**: 无。

---

## 24.7:SYSTem:RESet

**语法**: `:SYSTem:RESet`
**描述**: 使系统重新上电。
**参数**: 无。
**说明**: 无。
**返回格式**: 无。
**举例**: 无。

---

## 24.8:SYSTem:SETup

**语法**: `:SYSTem:SETup <setup_data>
:SYSTem:SETup?`

**描述**: 发送或读取系统设置文件数据流。
**参数**: 名称 类型 范围 默认值
<setup_data> 二进制 请参考说明 -

**说明**: • <setup_data>是一个二进制数据块， 由 TMC 数据块头和 setup 数据组成。
- TMC 数据块头的格式为#NX…X。其中， #为数据流起始标志符， N≤9， 表示其
后跟随的 N 个数据用于描述数据流的长度信息（字节数）。
例如#9000002506
其中， N 为 9，其后的 000002506 表示数据流中包含 2506 bytes 的有效数据。
- setup 数据以 ASCII 形式表示。
• 发送时，直接在命令字符串后跟数据流，一次性完成发送。 读取时， 请确保有足够的缓存接收数据流，否则在读取时程序可能异常。
**返回格式**: 无。
**举例**: 无。

---

## 24.9:SYSTem:LOCKed

**语法**: `:SYSTem:LOCKed <bool>
:SYSTem:LOCKed?`

**描述**: 打开或关闭屏幕和键盘锁定功能，或者查询屏幕和键盘锁定功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :SYSTem:LOCKed ON /* 打开屏幕和键盘锁定功能*/
:SYSTem:LOCKed? /* 查询返回 1*/

---

## 24.10:SYSTem:MODules?

**语法**: `:SYSTem:MODules?`
**描述**: 查询硬件模块。
**参数**: 无。
**说明**: 无。
**返回格式**: 返回值如 1,0,0,0,0，第一位表示 LA，第二位表示 DG，其他暂时未定义， 1 代表有， 0 代表无。
**举例**: 无。

---

## 24.11:SYSTem:AUToscale

**语法**: `:SYSTem:AUToscale <bool>
:SYSTem:AUToscale?`

**描述**: 禁用或恢复 AUTO 功能，或查询 AUTO 功能状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 1|ON

**说明**: • 用户可通过发送该命令或通过菜单键禁用 AUTO 按键功能。
• AUTO 按键功能被禁用后，用户无法执行 Auto Scale 操作。
**返回格式**: 查询返回 1 或 0。
**举例**: :SYSTem:AUToscale ON /* 启用 AUTO 按键功能*/
:SYSTem:AUToscale? /* 查询返回 1*/

---

## 24.12:SYSTem:GAMount?

**语法**: `:SYSTem:GAMount?`
**描述**: 查询仪器屏幕水平方向的网格数。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以整数的形式返回。对于本示波器，返回值固定为 10。
**举例**: 无。

---

## 24.13:SYSTem:VERSion?

**语法**: `:SYSTem:VERSion?`
**描述**: 查询系统使用的 SCPI 版本号。
**参数**: 无。
**说明**: 无。
**返回格式**: 字符串形式返回 SCPI 版本号。
**举例**: :SYSTem:VERSion?    /* 查询返回 3.0*/

---

## 24.14:SYSTem:DGSTatus?

**语法**: `:SYSTem:DGSTatus?`
**描述**: 查询是否有 DG 模块。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :SYSTem:DGSTatus? /* 查询返回 0*/

---

## 24.15:SYSTem:KEYBOARDCheck?

**语法**: `:SYSTem:KEYBOARDCheck?`

---

# 25 函数/任意波形发生器命令子系统
:SOURce 命令系统用于 AFG 功能的相关设置。
示波器标配内置 25 MHz 的函数/任意波形发生器（AFG），将函数/任意波形发生器与示波器
合二为一。
仅 DHO914S 和 DHO924S 型号支持此命令。
## 25.1:SOURce:OUTPut:STATe

**语法**: `:SOURce:OUTPut:STATe <bool>
:SOURce:OUTPut:STATe?`

**描述**: 打开或关闭通道的输出，或查询通道的输出状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 0 或 1。
**举例**: :SOURce:OUTPut:STATe ON /* 打开函数/任意波形发生器通道的输出*/
:SOURce:OUTPut:STATe? /* 查询返回 1*/

---

## 25.2:SOURce:FUNCtion

**语法**: `:SOURce:FUNCtion <wave>
:SOURce:FUNCtion?`

**描述**: 设置或查询基本波波形。
**参数**: 名称 类型 范围 默认值
<wave> 离散型 {SINusoid|SQUare|RAMP|DC|
NOISe|ARB} SINusoid

**说明**: 本示波器内置的函数/任意波形发生器可输出多种基本波形，包括正弦波（SINusoid）、方波
（SQUare）、锯齿波（RAMP）、直流（DC）、噪声（NOISe）和任意波（ARB）。

**返回格式**: 查询返回 SIN、SQU、RAMP、DC、NOIS 或 ARB。
**举例**: :SOURce:FUNCtion SQUare /* 将输出波形设置为方波*/
:SOURce:FUNCtion? /* 查询返回 SQU*/

---

## 25.3:SOURce:FREQuency

**语法**: `:SOURce:FREQuency <freq>
:SOURce:FREQuency?`

**描述**: 设置或查询基本波的频率。
**参数**: 名称 类型 范围 默认值
<freq> 实型 参考 说明 1kHz

**说明**: • 正弦波：2 mHz 至 25 MHz
• 方波：2 mHz 至 15 MHz
• 锯齿波：2 mHz 至 150 kHz
• 任意波：2 mHz 至 10 MHz
• 直流与噪声：无频率参数基本波类型可通过 :SOURce:FUNCtion 命令配置或查询。
**返回格式**: 查询以科学计数形式返回频率值，如 2.000000E+5。
**举例**: :SOURce:FREQuency 1000 /* 将基本波的频率设置为 1kHz*/
:SOURce:FREQuency? /* 查询返回 1.000000E+3*/

---

## 25.4:SOURce:PHASe

**语法**: `:SOURce:PHASe <phase>
:SOURce:PHASe?`

**描述**: 设置或查询基本波的起始相位。
**参数**: 名称 类型 范围 默认值
<phase> 实型 0°至 360° 0°

**说明**: 无。
**返回格式**: 以科学计数形式返回波形起始相位，如 1.0000000000E+01，表示波形起始相位为 10°。
**举例**: :SOURce:PHASe 10 /* 设置基本波的起始相位为 10°*/
:SOURce:PHASe? /* 查询返回 1.0000000000E+01*/

---

## 25.5:SOURce:FUNCtion:RAMP:SYMMetry

**语法**: `:SOURce:FUNCtion:RAMP:SYMMetry <symm>
:SOURce:FUNCtion:RAMP:SYMMetry?`

**描述**: 设置或查询锯齿波的对称性。
**参数**: 名称 类型 范围 默认值
<symm> 实型 0%至 100% 50%

**说明**: 本命令仅在波形类型（:SOURce:FUNCtion）为“锯齿波”时有效。对称性定义为锯齿波波形处于上升期间所占周期的百分比。
T
t 对称性=t/T*100%

**返回格式**: 以科学计数形式返回对称性，如 5.5000000000E+01，表示锯齿波对称性为 55%。
**举例**: :SOURce:FUNCtion:RAMP:SYMMetry 55 /* 设置锯齿波的对称性为 55%*/
:SOURce:FUNCtion:RAMP:SYMMetry? /* 查询返回 5.5000000000E+01*/

---

## 25.6:SOURce:FUNCtion:SQUare:DUTY

**语法**: `:SOURce:FUNCtion:SQUare:DUTY <percent>
:SOURce:FUNCtion:SQUare:DUTY?`

**描述**: 设置或查询 AFG 功能产生方波的占空比。
**参数**: 名称 类型 范围 默认值
<percent> 实型 0 至 100 50

**说明**: 本命令仅在波形类型为“方波”时有效，可通过:SOURce:FUNCtion 命令设置或查询产生基本波的波形。占空比定义为高电平持续时间占方波周期的百分比。
**返回格式**: 以科学计数形式返回方波的占空比。
**举例**: :SOURce:FUNCtion:SQUare:DUTY 55 /* 设置方波的占空比为 55%*/
:SOURce:FUNCtion:SQUare:DUTY? /* 查询返回 5.5000000000E+01*/

---

## 25.7:SOURce:VOLTage:AMPLitude

**语法**: `:SOURce:VOLTage:AMPLitude <amp>
:SOURce:VOLTage:AMPLitude`

**描述**: 设置或查询基本波的幅度值，单位默认为 V。
**参数**: 名称 类型 范围 默认值
<amp> 实型 请参考说明 6 V

**说明**: 基本波幅度的取值范围与基本波的频率有关：
• 2 mV 至 10 V（基本波频率≤10MHz）
• 2 mV 至 5 V（基本波频率>10MHz）可通过:SOURce:FREQuency 命令设置或查询基本波的频率。
**返回格式**: 以科学计数形式返回波形幅度，单位为 V。
**举例**: :SOURce:VOLTage:AMPLitude 1 /* 设置基本波幅度为 1V*/
:SOURce:VOLTage:AMPLitude? /* 查询返回 1.0000000000E+00*/

---

## 25.8:SOURce:VOLTage:OFFSet

**语法**: `:SOURce:VOLTage:OFFSet <offset>
:SOURce:VOLTage:OFFSet?`

**描述**: 设置或查询基本波的幅度偏移，单位默认为 V。
**参数**: 名称 类型 范围 默认值
<offset> 实型 请参考说明 0 V

**说明**: 基本波的幅度偏移取值范围与基本波的幅度值有关：偏移范围 = ±（当前幅度可设置的最大值 - 当前设置的幅度值）/2例如：
• 当前基本波的频率为 5MHz，幅度值最大可设置为 10V，设置幅度值为 6V偏移可设置范围为 ±（10V - 6V）/2 = ±2V
• 当前基本波的频率为 15MHz，幅度值最大可设置为 5V，设置幅度值为 3V偏移可设置范围为 ±（5V - 3V）/2 = ±1V可通过:SOURce:VOLTage:AMPLitude 命令设置或查询基本波的幅度值。
**返回格式**: 以科学计数形式返回波形偏移电压值，单位为 V。
**举例**: :SOURce:VOLTage:OFFSet 0.2 /* 设置幅度偏移为 200mV*/
:SOURce:VOLTage:OFFSet? /* 查询返回 2.0000000000E-01*/

---

## 25.9:SOURce:MOD:STATe

**语法**: `:SOURce:MOD:STATe <bool>
:SOURce:MOD:STATe?`

**描述**: 打开或关闭调制输出，或查询调制输出状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :SOURce:MOD:STATe /* 打开通道的调制输出*/
:SOURce:MOD:STATe? /* 查询通道返回 1*/

---

## 25.10:SOURce:MOD:TYPe

**语法**: `:SOURce:MOD:TYPe <type>
:SOURce:MOD:TYPe?`

**描述**: 设置或查询通道的调制类型。
**参数**: 名称 类型 范围 默认值
<type> 离散型 {AM|FM|PM} AM

**说明**: • AM： 幅度调制，即载波的幅度随着调制波的变化而变化。
• FM： 频率调制，即载波的频率随着调制波的变化而变化。
• PM： 相位调制，即载波的相位随着调制波的变化而变化。
**返回格式**: 查询返回 AM、FM 或 PM。
**举例**: :SOURce:MOD:TYPe AM /* 设置调制类型为 AM*/
:SOURce:MOD:TYPe? /* 查询返回 AM*/

---

## 25.11:SOURce:MOD:AM:DEPTh

**语法**: `:SOURce:MOD:AM:DEPTh <depth>
:SOURce:MOD:AM:DEPTh?`

**描述**: 设置或查询 AM 的调制深度。
**参数**: 名称 类型 范围 默认值
<depth> 实型 0%至 120% 100%

**说明**: 调制深度表示幅度变化的程度，以百分比表示。
• 在 0%调制时，输出幅度为载波幅度的一半。
• 在 100%调制时，输出幅度等于载波幅度。
• 在大于 100%调制时，将产生包络失真，实际电路中必须避免，此时，仪器的输出不会超过 2.5 Vpp（负载为 50 Ω）。
**返回格式**: 以科学计数形式返回 AM 调制深度，如 5.0000000000E+01，表示 AM 调制深度为 50%。
**举例**: :SOURce:MOD:AM:DEPTh 50 /* 设置 AM 的调制深度为 50%*/
:SOURce:MOD:AM:DEPTh? /* 查询返回 5.0000000000E+01*/

---

## 25.12:SOURce:MOD:AM:INTernal:FREQuency

**语法**: `:SOURce:MOD:AM:INTernal:FREQuency <freq>
:SOURce:MOD:AM:INTernal:FREQuency?`

**描述**: 设置或查询 AM 的调制频率。
**参数**: 名称 类型 范围 默认值
<freq> 实型 2 mHz 至 1 MHz 100 Hz

**说明**: 无。
以科学计数形式返回 AM 调制波的频率，如 1.5000000000E+02，表示 AM 的调制频率为150 Hz。

**举例**: :SOURce:MOD:AM:INTernal:FREQuency 150 /* 设置 AM 的调制频率为 150 Hz*/
:SOURce:MOD:AM:INTernal:FREQuency? /* 查询返回 1.5000000000E+02*/

---

## 25.13:SOURce:MOD:AM:INTernal:FUNCtion

**语法**: `:SOURce:MOD:AM:INTernal:FUNCtion <function>
:SOURce:MOD:AM:INTernal:FUNCtion?`

**描述**: 设置或查询 AM 的调制波形。
**参数**: 名称 类型 范围 默认值
<function> 离散型 {SINusoid|SQUare|TRIangle|
UPRamp|DNRamp|NOISe} SINusoid

**说明**: • SINusoid： 正弦波。
• SQUare： 50%占空比的方波。
• TRIangle： 50%对称性的三角波。
• UPRamp： 100%对称性的上锯齿波。
• DNRamp： 0%对称性的下锯齿波。
• NOISe： 高斯白噪声。
**返回格式**: 查询返回 SIN、SQU、TRI、UPR、DNR 或 NOIS。
**举例**: :SOURce:MOD:AM:INTernal:FUNCtion SQUare /* 设置 AM 调制波形为方波*/
:SOURce:MOD:AM:INTernal:FUNCtion? /* 查询返回 SQU*/

---

## 25.14:SOURce:MOD:FM:DEViation

**语法**: `:SOURce:MOD:FM:DEViation <deviation>
:SOURce:MOD:FM:DEViation?`

**描述**: 设置或查询 FM 的频率偏移。
**参数**: 名称 类型 范围 默认值
<deviation> 实型 2 mHz 至当前载波的频率 1 kHz

**说明**: • 频率偏移表示已调制波形频率相对于载波频率的最大变化值。
• 频率偏移与载波频率之和必须小于或等于当前载波频率上限与 1 kHz 之和。
• 在调制模式下不同载波频率（:SOURce:FREQuency ）取值范围不同。
**返回格式**: 以科学计数形式返回频率偏移，如 1.0000000000E+02，表示频率偏移为 100 Hz。
**举例**: :SOURce:MOD:FM:DEViation 100 /* 设置 FM 的频率偏移为 100 Hz*/
:SOURce:MOD:FM:DEViation? /* 查询返回 1.0000000000E+02*/

---

## 25.15:SOURce:MOD:FM:INTernal:FREQuency

**语法**: `:SOURce:MOD:FM:INTernal:FREQuency <freq>
:SOURce:MOD:FM:INTernal:FREQuency?`

**描述**: 设置或查询 FM 的调制频率。
**参数**: 名称 类型 范围 默认值
<freq> 实型 2 mHz 至 1 MHz 100 Hz

**说明**: 无。
以科学计数形式返回 FM 调制波的频率，如 1.5000000000E+02，表示 FM 的调制频率为150 Hz。

**举例**: :SOURce:MOD:FM:INTernal:FREQuency 150 /* 设置 FM 的调制频率为 150 Hz*/
:SOURce:MOD:FM:INTernal:FREQuency? /* 查询 1.5000000000E+02*/

---

## 25.16:SOURce:MOD:FM:INTernal:FUNCtion

**语法**: `:SOURce:MOD:FM:INTernal:FUNCtion <function>
:SOURce:MOD:FM:INTernal:FUNCtion?`

**描述**: 设置或查询 FM 的调制波形。
**参数**: 名称 类型 范围 默认值
<function> 离散型 {SINusoid|SQUare|TRIangle|
UPRamp|DNRamp|NOISe} SINusoid

**说明**: • SINusoid： 正弦波。
• SQUare： 50%占空比的方波。
• TRIangle： 50%对称性的三角波。
• UPRamp： 100%对称性的上锯齿波。
• DNRamp： 0%对称性的下锯齿波。
• NOISe： 高斯白噪声。
**返回格式**: 查询返回 SIN、SQU、TRI、UPR、DNR 或 NOIS。
**举例**: :SOURce:MOD:FM:INTernal:FUNCtion SQUare /* 设置 FM 的调制波形为方波*/
:SOURce:MOD:FM:INTernal:FUNCtion? /* 查询返回 SQU*/

---

## 25.17:SOURce:MOD:PM:DEViation

**语法**: `:SOURce:MOD:PM:DEViation <deviation>
:SOURce:MOD:PM:DEViation?`

**描述**: 设置或查询 PM 的相位偏差。
**参数**: 名称 类型 范围 默认值
<deviation> 实型 0°至 360° 90°

**说明**: 相位偏差指调制波形的相位相对于载波相位的变化。
**返回格式**: 以科学计数形式返回 PM 相位偏差，如 5.0000000000E+01，表示 PM 相位偏差为 50°。
**举例**: :SOURce:MOD:PM:DEViation 50 /* 设置 PM 的相位偏差为 50°*/
:SOURce:MOD:PM:DEViation? /* 查询返回 5.0000000000E+01*/

---

## 25.18:SOURce:MOD:PM:INTernal:FREQuency

**语法**: `:SOURce:MOD:PM:INTernal:FREQuency <freq>
:SOURce:MOD:PM:INTernal:FREQuency?`

**描述**: 设置或查询 PM 的调制频率。
**参数**: 名称 类型 范围 默认值
<freq> 实型 2 mHz 至 1 MHz 100 Hz

**说明**: 无。
以科学计数形式返回 PM 调制波的频率，如 1.5000000000E+02，表示 PM 调制波的频率为150 Hz。

---

# 26 时基命令子系统
## 25.19:SOURce:MOD:PM:INTernal:FUNCtion

**语法**: `:SOURce:MOD:PM:INTernal:FUNCtion <function>
:SOURce:MOD:PM:INTernal:FUNCtion?`

**描述**: 设置或查询 PM 的调制波形。
**参数**: 名称 类型 范围 默认值
<function> 离散型 {SINusoid|SQUare|TRIangle|
UPRamp|DNRamp|NOISe} SINusoid

**说明**: • SINusoid： 正弦波。
• SQUare： 50%占空比的方波。
• TRIangle： 50%对称性的三角波。
• UPRamp： 100%对称性的上锯齿波。
• DNRamp： 0%对称性的下锯齿波。
• NOISe： 高斯白噪声。
**返回格式**: 查询返回 SIN、SQU、TRI、UPR、DNR 或 NOIS。
**举例**: :SOURce:MOD:PM:INTernal:FUNCtion SQUare /* 设置 PM 的调制波形为方波*/
:SOURce:MOD:PM:INTernal:FUNCtion? /* 查询返回 SQU*/
3.26 时基命令子系统
时基命令用于设置水平系统，例如打开延迟扫描，设置水平时基模式等。

水平时基模式
• YT 模式： 默认情况下，本系列示波器的波形显示窗口采用的是 YT 模式。该模式下，Y轴表示电压量，X 轴表示时间量。
• XY 模式： 在 XY 模式的波形显示窗口中，X 轴和 Y 轴均表示电压量。示波器将两个输入通道从“电压-时间”显示转化为“电压-电压”显示。XY 模式可用于测试信号经过一个电路网络产生的相位变化。
• Roll 模式：波形自右向左滚动刷新显示，不必等到采集完整的波形即可查看采集的数据点。当水平时基设置为 50 ms/div 或更慢，仪器自动启用滚动模式。提示
- 若当前延迟扫描已打开，则启用滚动模式时，延迟扫描将自动关闭。
- 以下功能在启用滚动模式下不可用：调整水平位移（示波器运行状态为 STOP 时此功能可
用）、延迟扫描、触发示波器、协议解码、通过/失败测试、波形录制与播放、余辉时间、
XY 模式、平均（Avg）。

---

## 26.1:TIMebase:DELay:ENABle

**语法**: `:TIMebase:DELay:ENABle <bool>
:TIMebase:DELay:ENABle?`

**描述**: 打开或关闭延迟扫描，或查询延迟扫描的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 延迟扫描可用来水平放大一段波形，以便查看波形细节。
**返回格式**: 查询返回 1 或 0。
**举例**: :TIMebase:DELay:ENABle ON /* 打开延迟扫描*/
:TIMebase:DELay:ENABle? /* 查询返回 1*/

---

## 26.2:TIMebase:DELay:OFFSet

**语法**: `:TIMebase:DELay:OFFSet <offset>
:TIMebase:DELay:OFFSet?`

**描述**: 设置延迟扫描偏移，或查询延迟时基偏移。
**参数**: 名称 类型 范围 默认值
<offset> 实型 -(LeftTime-DelayRange/2)至
(RightTime-DelayRange/2) 0

**说明**: LeftTime=5× MainScale-MainOffset RightTime=5× MainScale+MainOffset DelayRange=10× DelayScale其中， MainScale 为示波器当前的主时基档位， MainOffset 为示波器当前的主时基偏移，
DelayScale 为示波器当前的延迟时基档位。

**返回格式**: 查询以科学计数形式返回延迟时基偏移。
**举例**: :TIMebase:DELay:OFFSet 0.000002 /* 设置延迟时基偏移为 2μs*/
:TIMebase:DELay:OFFSet? /* 查询返回 2.000000E-6*/

---

## 26.3:TIMebase:DELay:SCALe

**语法**: `:TIMebase:DELay:SCALe <scale>
:TIMebase:DELay:SCALe?`

**描述**: 设置或查询延迟时基档位。 默认单位为 s/div。
**参数**: 名称 类型 范围 默认值
<scale> 实型 请参考说明 -

**说明**: • 参数<scale>的最大值为当前的主时基档位值。
• 延迟时基档位仅能取最大值以及由最大值以 1-2-5 为步进递减所得的值。若按上述表达式计算所得的最小值不是可设置值，则向上取可设置值。
• 延迟时基档位的默认值由主时基模式下的档位决定，取值为主时基的下一个档位。
**返回格式**: 查询以科学计数形式返回延迟时基档位。
**举例**: :TIMebase:DELay:SCALe 0.00000005 /* 设置延迟时基档位为 50ns/div*/
:TIMebase:DELay:SCALe? /* 查询返回 5.000000E-8*/

---

## 26.4:TIMebase[:MAIN][:OFFSet]

**语法**: `:TIMebase[:MAIN][:OFFSet] <offset>
:TIMebase[:MAIN][:OFFSet]?`

**描述**: 设置或查询主时基偏移。 默认单位为 s。
**参数**: 名称 类型 范围 默认值
<offset> 实型 请参考 说明 0

**说明**: • 机器运行状态下，主时基偏移的范围为：
MainLeftTime = -5 × MainScale
当 MainScale ≤ 10ms 时，MainRightTime = 1s
当 10ms < MainScale < 10s 时， MainRightTime = 100 × MainScale
当 MainScale < 200s && MainScale ≥ 10s 时，MainRightTime = 1ks
当 MainScale ≥ 200s 时，MainRightTime = 5 × MainScale
MainRightTime 为主时基偏移的最大值，MainLeftTime 为主时基偏移的最小值，
MainScale 为示波器当前的主时基档位。
• 机器停止运行状态下，主时基偏移的范围为内存采样的范围。
**返回格式**: 查询以科学计数形式返回主时基偏移。
**举例**: :TIMebase:MAIN:OFFSet 0.0002 /* 设置主时基偏移为 200μs*/
:TIMebase:MAIN:OFFSet? /* 查询返回 2.000000E-4*/

---

## 26.5:TIMebase[:MAIN]:SCALe

**语法**: `:TIMebase[:MAIN]:SCALe <scale>
:TIMebase[:MAIN]:SCALe?`

**描述**: 设置或查询主时基的档位。
**参数**: 名称 类型 范围 默认值
<scale> 实型 请参考说明 5ns/div

**说明**: <scale>的范围与示波器带宽和水平时基模式有关。
**返回格式**: 查询以科学计数形式返回主时基档位。
**举例**: :TIMebase:MAIN:SCALe 0.0002 /* 设置主时基档位为 200μs/div*/
:TIMebase:MAIN:SCALe? /* 查询返回 2.000000E-4*/

---

## 26.6:TIMebase:MODE

**语法**: `:TIMebase:MODE <mode>
:TIMebase:MODE?`

**描述**: 设置或查询水平时基模式。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {MAIN|XY|ROLL} MAIN

**说明**: • MAIN： 当前时基模式，执行:TIMebase:MODE MAIN 命令可将时基配置为 YT 模式。
• XY： XY 模式。执行:TIMebase:MODE XY 命令配置 XY 模式后，通过:TIMebase:MODE?命令查询，也返回 MAIN。
• ROLL： 滚动模式。不同时基模式具体内容请参考 水平时基模式 。
**返回格式**: 查询返回 MAIN 或 ROLL。
**举例**: :TIMebase:MODE ROLL /* 设置水平时基模式为 ROLL 模式*/
:TIMebase:MODE? /* 查询返回 ROLL*/

---

## 26.7:TIMebase:HREFerence:MODE

**语法**: `:TIMebase:HREFerence:MODE <href>
:TIMebase:HREFerence:MODE?`

**描述**: 设置或查询水平参考模式。
**参数**: 名称 类型 范围 默认值
<href> 离散型 {CENTer|LB|RB|TRIG|USER} CENTer

**说明**: • CENTer：  改变水平时基时，示波器将围绕屏幕中心水平扩展或压缩波形。
• LB：  改变水平时基时，示波器将围绕屏幕左侧扩展或压缩波形。
• RB：  改变水平时基时，示波器将围绕屏幕右侧扩展或压缩波形。
• TRIG：  改变水平时基时，示波器将围绕触发位置水平扩展或压缩波形。
• USER：  改变水平时基时，示波器将围绕用户自定义的参考位置水平扩展或压缩波形。
**返回格式**: 查询返回 CENT、 LB、 RB、 TRIG 或 USER。
**举例**: :TIMebase:HREFerence:MODE TRIG /* 设置水平参考模式为触发位置*/
:TIMebase:HREFerence:MODE? /* 查询返回 TRIG*/

---

## 26.8:TIMebase:HREFerence:POSition

**语法**: `:TIMebase:HREFerence:POSition <pos>
:TIMebase:HREFerence:POSition?`

**描述**: 设置或查询波形水平扩展或压缩时用户自定义的参考位置。
**参数**: 名称 类型 范围 默认值
<pos> 整型 -500 至 500 0

**说明**: 参数为-500 时对应仪器屏幕最左侧；参数为 500 时对应仪器屏幕最右侧。
**返回格式**: 查询返回-500 至 500 之间的一个整数。
**举例**: :TIMebase:HREFerence:POSition 60 /* 设置自定义的参考位置为 60*/
:TIMebase:HREFerence:POSition? /* 查询返回 60*/

---

## 26.9:TIMebase:VERNier

**语法**: `:TIMebase:VERNier <bool>
:TIMebase:VERNier?`

**描述**: 打开或关闭水平档位微调功能， 或查询水平档位的微调功能的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 1 或 0。
**举例**: :TIMebase:VERNier ON /* 设置水平档位微调功能为打开*/
:TIMebase:VERNier? /* 查询返回 1*/

---

## 26.10:TIMebase:HOTKeys

**语法**: `:TIMebase:HOTKeys <action>`
**描述**: 设置运行状态。
**参数**: 名称 类型 范围 默认值
<action> 离散型 {STOP|RUN|SINGle} -

**说明**: • STOP： 停止测量。
• RUN： 运行测量。
• SINGle： 单次触发测量。
**返回格式**: 无。
**举例**: :TIMebase:HOTKeys RUN  /* 设置状态为运行*/

---

## 26.11:TIMebase:ROLL

**语法**: `:TIMebase:ROLL <value>
:TIMebase:ROLL?`

**描述**: 设置或查询 ROLL 时基模式的状态。
**参数**: 名称 类型 范围 默认值
<value> 整型 {0|1} 1

**说明**: • 0： 关闭自动 ROLL 模式。
• 1： 打开自动 ROLL 模式，时基大于等于 50ms 时自动进入 ROLL。
**返回格式**: 查询返回 0 或 1。
**举例**: :TIMebase:ROLL 0  /* 设置 ROLL 模式关闭*/
:TIMebase:ROLL?   /* 查询返回 0*/

---

## 26.12:TIMebase:XY:ENABle

**语法**: `:TIMebase:XY:ENABle <bool>
:TIMebase:XY:ENABle?`

**描述**: 打开或关闭 XY 时基模式，或查询 XY 时基模式的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: 无。
**返回格式**: 查询返回 0 或 1。
**举例**: :TIMebase:XY:ENABle OFF   /* 设置 XY 时基模式关闭*/
:TIMebase:XY:ENABle?  /* 查询返回 0*/

---

## 26.13:TIMebase:XY:X

**语法**: `:TIMebase:XY:X <s>
:TIMebase:XY:X?`

**描述**: 设置或查询水平时基为 XY 模式下，X 坐标对应的通道源。
**参数**: 名称 类型 范围 默认值
<s> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。
**举例**: :TIMebase:XY:X CHANnel3  /* 设置 XY 模式下，X 坐标对应的通道源为 CHANnel3*/
:TIMebase:XY:X? /* 查询返回 CHAN3*/

---

## 26.14:TIMebase:XY:Y

**语法**: `:TIMebase:XY:Y <s>
:TIMebase:XY:Y?`

**描述**: 设置或查询水平时基为 XY 模式下，Y 坐标对应的通道源。
**参数**: 名称 类型 范围 默认值
<s> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel2

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。
**举例**: :TIMebase:XY:Y CHANnel3  /* 设置 XY 模式下，Y 坐标对应的通道源为 CHANnel3*/
:TIMebase:XY:Y? /* 查询返回 CHAN3*/

---

## 26.15:TIMebase:XY:Z

**语法**: `:TIMebase:XY:Z <s>
:TIMebase:XY:Z?`

**描述**: 设置或查询 XY 模式下的消隐信源。
**参数**: 名称 类型 范围 默认值
<s> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4|NONE} -

**说明**: 无。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3、CHAN4 或 NONE。
**举例**: :TIMebase:XY:Z CHANnel3  /* 设置 XY 模式下的消隐信源为 CHANnel3*/
:TIMebase:XY:Z? /* 查询返回 CHAN3*/

---

## 26.16:TIMebase:XY:GRID

**语法**: `:TIMebase:XY:GRID <grid>
:TIMebase:XY:GRID?`

**描述**: 设置或查询 XY 显示的网格类型。

---

# 27 触发命令子系统
触发命令用于设置触发源类型、触发输入边沿类型和触发延时以及产生一次触发事件。
## 27.1:TRIGger:MODE

**语法**: `:TRIGger:MODE <mode>
:TRIGger:MODE?`

**描述**: 设置或查询触发类型。
**参数**: 名称 类型 范围 默认值
<mode> 离散型
{EDGE|PULSe|SLOPe|VIDeo|
PATTern|DURation|TIMeout|
RUNT|WINDow|DELay|SETup|
NEDGe|RS232|IIC|SPI|CAN|LIN}
EDGE

**说明**: 仅 DHO900 系列示波器支持 LIN 触发类型。
查询返回 EDGE、PULS、SLOP、VID、PATT、DUR、TIM、RUNT、WIND、DEL、SET、 NEDG、RS232、IIC、SPI、CAN、LIN。

**举例**: :TRIGger:MODE SLOPe /* 选择斜率触发*/
:TRIGger:MODE? /* 查询返回 SLOP*/

---

## 27.2:TRIGger:COUPling

**语法**: `:TRIGger:COUPling <couple>
:TRIGger:COUPling?`

**描述**: 选择或查询触发耦合类型。
**参数**: 名称 类型 范围 默认值
<couple> 离散型 {AC|DC|LFReject|HFReject} DC

**说明**: 该命令仅适用于信源选择模拟通道的边沿触发。
• AC： 阻挡任何直流成分通过触发路径。
• DC： 允许直流和交流成分通过触发路径。
• LFReject： 阻挡直流成分并抑制低频成分通过触发路径。
• HFReject： 抑制高频成分通过触发路径。
**返回格式**: 查询返回 AC、DC、LFR 或 HFR。
**举例**: :TRIGger:COUPling LFReject /* 设置触发耦合类型为低频抑制*/
:TRIGger:COUPling? /* 查询返回 LFR*/

---

## 27.3:TRIGger:STATus?

**语法**: `:TRIGger:STATus?`
**描述**: 查询当前的触发状态。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回 TD、WAIT、RUN、AUTO 或 STOP。
**举例**: 无。

---

## 27.4:TRIGger:SWEep

**语法**: `:TRIGger:SWEep <sweep>
:TRIGger:SWEep?`

**描述**: 设置或查询触发方式。
**参数**: 名称 类型 范围 默认值
<sweep> 离散型 {AUTO|NORMal|SINGle} AUTO

**说明**: • AUTO： 自动触发，不论是否满足触发条件都有波形显示。
• NORMal： 普通触发，在满足触发条件时显示波形，不满足触发条件时保持原有波形显示，并等待下一次触发。
• SINGle： 单次触发，示波器等待触发，在满足触发条件时显示波形，然后停止。
**返回格式**: 查询返回 AUTO、NORM 或 SING。
**举例**: :TRIGger:SWEep NORMal /* 选择普通触发方式*/
:TRIGger:SWEep? /* 查询返回 NORM*/

---

## 27.5:TRIGger:HOLDoff

**语法**: `:TRIGger:HOLDoff <value>
:TRIGger:HOLDoff?`

**描述**: 设置或查询触发释抑时间，默认单位为 s。
**参数**: 名称 类型 范围 默认值
<value> 实型 8ns 至 10s 8ns

**说明**: • 触发释抑可稳定触发复杂波形（如脉冲系列）。释抑时间是指示波器重新启用触发电路所等待的时间，示波器在释抑时间结束前不会触发。
• 触发方式为视频触发、超时触发、建立保持、第 N 边沿、RS232、I2C、SPI、CAN、
LIN 时，无此项设置。
• 仅 DHO900 系列支持 LIN 触发类型。
**返回格式**: 查询以科学计数形式返回触发释抑时间。
**举例**: :TRIGger:HOLDoff 0.0000002 /* 设置触发释抑时间为 200ns*/
:TRIGger:HOLDoff? /* 查询返回 2.000000E-7*/

---

## 27.6:TRIGger:NREJect

**语法**: `:TRIGger:NREJect <bool>
:TRIGger:NREJect?`

**描述**: 打开或关闭噪声抑制，或查询噪声抑制的状态。
**参数**: 名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF

**说明**: • 噪声抑制降低噪声触发的可能性。
• 该命令仅适用于信源选择模拟通道和外触发。
**返回格式**: 查询返回 1 或 0。
**举例**: :TRIGger:NREJect ON /* 打开噪声抑制*/
:TRIGger:NREJect? /* 查询返回 1*/

---

## 27.7:TRIGger:POSition?

**语法**: `:TRIGger:POSition?`
**描述**: 查询波形触发位置在内存中的对应位置。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询以科学计数形式返回波形触发位置在内存中的对应位置。
**举例**: :TRIGger:POSition? /* 查询返回 0.000E+00 */

---

## 27.8:TRIGger:EDGE

**语法**: `:TRIGger:EDGE:SOURce <source>
:TRIGger:EDGE:SOURce?
:TRIGger:EDGE:SLOPe <slope>
:TRIGger:EDGE:SLOPe?
:TRIGger:EDGE:LEVel <level>
:TRIGger:EDGE:LEVel?`

**描述**: 设置或查询边沿触发的触发源。设置或查询边沿触发的边沿类型。设置或查询边沿触发时的触发电平，单位与所选信源当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4|EXT}
CHANnel1
名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative|RFALl} POSitive
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。参数“EXT”仅 DHO812 和 DHO802 型号支持。
• POSitive： 上升沿。
• NEGative： 下降沿。
• RFALl： 上升沿或下降沿。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。仅当所选信源为模拟通道、数字通道或外触发，该设置命令有效。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4 或 EXT。
查询返回 POS、NEG 或 RFAL。

查询以科学计数形式返回触发电平值。

**举例**: :TRIGger:EDGE:SOURce CHANnel1 /* 设置触发源为 CHANnel1*/
:TRIGger:EDGE:SOURce? /* 查询返回 CHAN1*/
## 27.8.2:TRIGger:EDGE:SLOPe
:TRIGger:EDGE:SLOPe NEGative /* 设置边沿类型为下降沿*/
:TRIGger:EDGE:SLOPe? /* 查询返回 NEG*/
## 27.8.3:TRIGger:EDGE:LEVel
:TRIGger:EDGE:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:EDGE:LEVel? /* 查询返回 1.600000E-1*/

---

## 27.9:TRIGger:PULSe

**语法**: `:TRIGger:PULSe:SOURce <source>
:TRIGger:PULSe:SOURce?
:TRIGger:PULSe:POLarity <polarity>
:TRIGger:PULSe:POLarity?

:TRIGger:PULSe:WHEN <when>
:TRIGger:PULSe:WHEN?
:TRIGger:PULSe:UWIDth <width>
:TRIGger:PULSe:UWIDth?
:TRIGger:PULSe:LWIDth <width>
:TRIGger:PULSe:LWIDth?
:TRIGger:PULSe:LEVel <level>
:TRIGger:PULSe:LEVel?`

**描述**: 设置或查询脉宽触发的触发源。设置或查询脉宽触发的极性。设置或查询脉宽触发的触发条件。设置或查询脉宽触发的脉宽上限值，默认单位为 s。设置或查询脉宽触发的脉宽下限值，默认单位为 s。设置或查询脉宽触发时的触发电平，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<polarity> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<when> 离散型 {GREater|LESS|GLESs} GREater
名称 类型 范围 默认值
<width> 实型 脉宽下限值至 10s 2μs
名称 类型 范围 默认值
<width> 实型 1ns 至上限值 1 µs

名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。无。
• GREater： 示波器将在输入信号的正脉宽/负脉宽大于指定的脉宽设置时触发。
• LESS： 示波器将在输入信号的正脉宽/负脉宽小于指定的脉宽设置时触发。
• GLESs： 示波器将在输入信号的正脉宽/负脉宽大于指定的脉宽下限且小于指定的脉宽上限时触发。本命令仅适用于触发条件为 LESS 或 GLESs 的情况，通过:TRIGger:PULSe:WHEN 命令可设置或查询脉宽触发的触发条件。当触发条件为 GLESs 时，如果设置的脉宽上限值小于当前下限值，会自动改变下限值。通过:TRIGger:PULSe:LWIDth 命令可设置或查询脉宽触发的脉宽下限值。本命令仅适用于触发条件为 GREater 或 GLESs 的情况，通过:TRIGger:PULSe:WHEN 命令可设置或查询脉宽触发的触发条件。当触发条件为 GLESs 时，如果设置的脉宽下限值大于当前上限值，会自动改变上限值。通过:TRIGger:PULSe:UWIDth 命令可设置或查询脉宽触发的脉宽上限值。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 POS 或 NEG。
查询返回 GRE、LESS 或 GLES。

查询以科学计数形式返回脉宽上限值。
查询以科学计数形式返回脉宽下限值。
查询以科学计数形式返回触发电平值。

**举例**: :TRIGger:PULSe:SOURce CHANnel1 /* 将触发源设置为 CHANnel1*/
:TRIGger:PULSe:SOURce? /* 查询返回 CHAN1*/
## 27.9.2:TRIGger:PULSe:POLarity
:TRIGger:PULSe:POLarity NEGative /* 设置脉宽触发的极性为 NEGative*/
:TRIGger:PULSe:POLarity? /* 查询返回 NEG*/
## 27.9.3:TRIGger:PULSe:WHEN
:TRIGger:PULSe:WHEN LESS /* 设置触发条件为 LESS*/
:TRIGger:PULSe:WHEN? /* 查询返回 LESS*/
## 27.9.4:TRIGger:PULSe:UWIDth
:TRIGger:PULSe:UWIDth 0.000003 /* 设置脉宽上限值为 3μs*/
:TRIGger:PULSe:UWIDth? /* 查询返回 3.000000E-6*/
## 27.9.5:TRIGger:PULSe:LWIDth
:TRIGger:PULSe:LWIDth 0.000003 /* 设置脉宽下限值为 3μs*/
:TRIGger:PULSe:LWIDth? /* 查询返回 3.000000E-6*/
## 27.9.6:TRIGger:PULSe:LEVel
:TRIGger:PULSe:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:PULSe:LEVel? /* 查询返回 1.600000E-1*/

---

## 27.10:TRIGger:SLOPe

**语法**: `:TRIGger:SLOPe:SOURce <channel>
:TRIGger:SLOPe:SOURce?
:TRIGger:SLOPe:POLarity <polarity>
:TRIGger:SLOPe:POLarity?
:TRIGger:SLOPe:WHEN <when>
:TRIGger:SLOPe:WHEN?
:TRIGger:SLOPe:TUPPer <time>
:TRIGger:SLOPe:TUPPer?
:TRIGger:SLOPe:TLOWer <time>
:TRIGger:SLOPe:TLOWer?
:TRIGger:SLOPe:WINDow <window>
:TRIGger:SLOPe:WINDow?
:TRIGger:SLOPe:ALEVel <level>
:TRIGger:SLOPe:ALEVel?
:TRIGger:SLOPe:BLEVel <level>
:TRIGger:SLOPe:BLEVel?`

**描述**: 设置或查询斜率触发的触发源。设置或查询斜率触发的边沿类型。设置或查询斜率触发的触发条件。设置或查询斜率触发的时间上限值，默认单位为 s。设置或查询斜率触发的时间下限值，默认单位为 s。设置或查询斜率触发的垂直窗类型。设置或查询斜率触发时的触发电平上限，单位与当前幅度单位一致。设置或查询斜率触发时的触发电平下限，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<channel > 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1
名称 类型 范围 默认值
<polarity> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<when> 离散型 {GREater|LESS|GLESs} GREater
名称 类型 范围 默认值
<time> 实型 下限值至 10s 2μs
名称 类型 范围 默认值
<time> 实型 1ns 至上限值 1μs

名称 类型 范围 默认值
<window> 离散型 {TA|TB|TAB} TA
名称 类型 范围 默认值
<level> 实型 触发电平下限至(4.5×
VerticalScale-OFFSet) 0V
名称 类型 范围 默认值
<level> 实型 (-4.5×VerticalScale-OFFSet)至触
发电平上限 0V

**说明**: 无。
• POSitive： 上升沿触发。
• NEGative： 下降沿触发。
• GREater： 输入信号的正斜率时间大于设置的时间。
• LESS： 输入信号的正斜率时间小于设置的时间。
• GLESs： 输入信号的正斜率时间大于设置的时间下限且小于设置的时间上限。本命令仅适用于触发条件为 LESS 或 GLESs 的情况，通过:TRIGger:SLOPe:WHEN 命令可设置或查询斜率触发的触发条件。当触发条件为 GLESs 时，如果设置的时间上限值小于下限值，会自动改变下限值。通过:TRIGger:SLOPe:TLOWer 命令可设置或查询斜率触发的时间下限值。本命令仅适用于触发条件为 GREater 或 GLESs 的情况，通过:TRIGger:SLOPe:WHEN 命令可设置或查询斜率触发的触发条件。当触发条件为 GLESs 时，如果设置的时间下限值大于上限值，会自动改变上限值。通过:TRIGger:SLOPe:TUPPer 命令可设置或查询斜率触发的时间上限值。
• TA： 只调节触发电平上限。
• TB： 只调节触发电平下限。
• TAB： 同时调节触发电平上限和下限。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。查询返回 POS 或 NEG。查询返回 GRE、LESS 或 GLES。查询以科学计数形式返回时间上限值。查询以科学计数形式返回时间下限值。查询返回 TA、TB 或 TAB。查询以科学计数形式返回触发电平上限。查询以科学计数形式返回触发电平下限。
**举例**: :TRIGger:SLOPe:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:SLOPe:SOURce? /* 查询返回 CHAN2*/
## 27.10.2:TRIGger:SLOPe:POLarity
:TRIGger:SLOPe:POLarity POSitive   /* 设置斜率触发的极性为 POSitive*/
:TRIGger:SLOPe:POLarity?  /* 查询返回 POS*/
## 27.10.3:TRIGger:SLOPe:WHEN
:TRIGger:SLOPe:WHEN LESS /* 将触发条件设置为 LESS*/
:TRIGger:SLOPe:WHEN?  /* 查询返回 LESS*/

## 27.10.4:TRIGger:SLOPe:TUPPer
:TRIGger:SLOPe:TUPPer 0.000003  /* 设置时间上限值为 3μs*/
:TRIGger:SLOPe:TUPPer?  /* 查询返回 3.000000E-6*/
## 27.10.5:TRIGger:SLOPe:TLOWer
:TRIGger:SLOPe:TLOWer 0.000000020 /* 设置时间下限值为 20ns*/
:TRIGger:SLOPe:TLOWer?  /* 查询返回 2.000000E-8*/
## 27.10.6:TRIGger:SLOPe:WINDow
:TRIGger:SLOPe:WINDow TB /* 将垂直窗类型设置为 TB*/
:TRIGger:SLOPe:WINDow? /* 查询返回 TB*/

## 27.10.7:TRIGger:SLOPe:ALEVel
:TRIGger:SLOPe:ALEVel 0.16  /* 设置触发电平上限为 160mV*/
:TRIGger:SLOPe:ALEVel?  /* 查询返回 1.600000E-1*/
## 27.10.8:TRIGger:SLOPe:BLEVel
:TRIGger:SLOPe:BLEVel 0.16 /* 设置触发电平下限为 160mV*/
:TRIGger:SLOPe:BLEVel?  /* 查询返回 1.600000E-1*/

---

## 27.11:TRIGger:VIDeo

**语法**: `:TRIGger:VIDeo:SOURce <source>
:TRIGger:VIDeo:SOURce?
:TRIGger:VIDeo:POLarity <polarity>
:TRIGger:VIDeo:POLarity?

:TRIGger:VIDeo:MODE <mode>
:TRIGger:VIDeo:MODE?
:TRIGger:VIDeo:LINE <line>
:TRIGger:VIDeo:LINE?
:TRIGger:VIDeo:STANdard <standard>
:TRIGger:VIDeo:STANdard?
:TRIGger:VIDeo:LEVel <level>
:TRIGger:VIDeo:LEVel?`

**描述**: 设置或查询视频触发的触发源。选择或查询视频触发时的视频极性。设置或查询视频触发时的同步类型。设置或查询视频触发时同步类型为指定行时的行号。设置或查询视频触发的视频标准。设置或查询视频触发时的触发电平，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1
名称 类型 范围 默认值
<polarity> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<mode> 离散型 {ODDField|EVENfield|LINE|
ALINes} ALINes
名称 类型 范围 默认值
<line> 整型 请参考说明 1
名称 类型 范围 默认值
<standard> 离散型
{PALSecam|NTSC|480P|576P|
720P60|720P50|720P30|720P25|
720P24|1080P60|1080P50|
1080P30|1080P25|1080P24|
1080I60|1080I50}
NTSC
名称 类型 范围 默认值
<level> 实型 (-4.5×VerticalScale-OFFSet)至
(4.5×VerticalScale-OFFSet) 0V

**说明**: 无。无。
• ODDField： 在奇数场的第一个锯齿波上升沿处触发。视频标准为 NTSC、PAL/
SECAM 或 1080i 时可选。
• EVENfield： 在偶数场的第一个锯齿波上升沿处触发。视频标准为 NTSC、PAL/
SECAM 或 1080i 时可选。
• LINE： 对于 NTSC 和 PAL/SECAM 的视频标准，在奇数场或偶数场的指定行上触发。对于 480P、576P、720p、1080p 和 1080i 的视频标准，在指定的行上触发。
• ALINes： 在所有水平同步脉冲上触发。
• PAL/SECAM： 1 至 625
• NTSC： 1 至 525
• 480P： 1 至 525
• 576P： 1 至 625
• 720P60： 1 至 750
• 720P50： 1 至 750
• 720P30： 1 至 750
• 720P25： 1 至 750
• 720P24： 1 至 750
• 1080P60： 1 至 1125
• 1080P50： 1 至 1125
• 1080P30： 1 至 1125
• 1080P25： 1 至 1125
• 1080P24： 1 至 1125
• 1080I60： 1 至 1125
• 1080I50： 1 至 1125视频标准 帧频（帧） 扫描类型 电视扫描线（行）
PALSecam 25 隔行扫描 625
NTSC 30 隔行扫描 525
480P 60 逐行扫描 525
576P 50 逐行扫描 625
720P60 60 逐行扫描 750
720P50 50 逐行扫描 750
720P30 30 逐行扫描 750
720P25 25 逐行扫描 750
720P24 24 逐行扫描 750
1080P60 60 逐行扫描 1125

视频标准 帧频（帧） 扫描类型 电视扫描线（行）
1080P50 50 逐行扫描 1125
1080P30 30 逐行扫描 1125
1080P25 25 逐行扫描 1125
1080P24 24 逐行扫描 1125
1080I60 60 隔行扫描 1125
1080I50 50 隔行扫描 1125
对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参
考:CHANnel<n>:OFFSet 命令。

查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。查询返回 POS 或 NEG。查询返回 ODDF、EVEN、LINE 或 ALIN。查询返回一个整数。查询返回 PALS、NTSC、480P、576P、720P60、720P50、720P30、720P25、720P24、 1080P60、1080P50、1080P30、1080P25、1080P24、1080I60 或 1080I50。
查询以科学计数形式返回触发电平。

**举例**: :TRIGger:VIDeo:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:VIDeo:SOURce? /* 查询返回 CHAN2*/
## 27.11.2:TRIGger:VIDeo:POLarity
:TRIGger:VIDeo:POLarity NEGative /* 将视频极性设置为负极性*/
:TRIGger:VIDeo:POLarity? /* 查询返回 NEG*/
## 27.11.3:TRIGger:VIDeo:MODE
:TRIGger:VIDeo:MODE ODDField /* 将同步类型设置为奇数场*/
:TRIGger:VIDeo:MODE? /* 查询返回 ODDF*/
## 27.11.4:TRIGger:VIDeo:LINE
:TRIGger:VIDeo:LINE 100 /* 将行号设置为 100*/
:TRIGger:VIDeo:LINE? /* 查询返回 100*/
## 27.11.5:TRIGger:VIDeo:STANdard
:TRIGger:VIDeo:STANdard NTSC /* 设置 NTSC 视频标准*/
:TRIGger:VIDeo:STANdard? /* 查询返回 NTSC*/
## 27.11.6:TRIGger:VIDeo:LEVel
:TRIGger:VIDeo:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:VIDeo:LEVel? /* 查询返回 1.600000E-1*/

---

## 27.12:TRIGger:PATTern

**语法**: `:TRIGger:PATTern:PATTern <pch1>[,<pch2>[,<pch3>[,<pch4>]]]
:TRIGger:PATTern:PATTern?
:TRIGger:PATTern:SOURce <source>
:TRIGger:PATTern:SOURce?
:TRIGger:PATTern:LEVel <source>,<level>

:TRIGger:PATTern:LEVel? <source>`

**描述**: 设置或查询码型触发时每个通道的码型。设置或查询码型触发的触发源。设置或查询码型触发时指定通道的触发电平，单位与当前的幅度单位一致。
**参数**: 名称 类型 范围 默认值
<pch1> 离散型 {H|L|X|R|F} X
<pch2> 离散型 {H|L|X|R|F} X
<pch3> 离散型 {H|L|X|R|F} X
<pch4> 离散型 {H|L|X|R|F} X
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V

**说明**: • 参数<pch1>至<pch4>设置模拟通道 CHANnel1 至 CHANnel4 的码型。
• 在参数的取值范围中，H 表示高电平（高于该通道的门限电平）、L 表示低电平（低于该通道的门限电平）、X 表示忽略该通道（该通道不作为码型的一部分，全部通道设置为 X 时，示波器将不会触发）、R 表示上升沿、F 表示下降沿。
• 码型中，仅允许指定一个边沿（上升沿或下降沿）。如果当前已定义了一个边沿项，然后在码型中的另一个通道再定义一个边沿项，则屏幕会弹出“输入无效！”提示，那么后定义的边沿项则用 X 替代。参数 D0~D15 数字通道仅 DHO900 系列支持。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
查询返回所有通道当前设置的码型，多个通道之间以逗号分开。查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询以科学计数形式返回触发电平。

:TRIGger:PATTern:PATTern H,R,L,X /* 设置 CHANnel1 至 CHANnel4 的码型为H,R,L,X*/
:TRIGger:PATTern:PATTern? /* 查询返回 H,R,L,X*/
## 27.12.2:TRIGger:PATTern:SOURce
:TRIGger:PATTern:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:PATTern:SOURce?  /* 查询返回 CHAN2*/
## 27.12.3:TRIGger:PATTern:LEVel
:TRIGger:PATTern:LEVel CHANnel2,0.16 /* 将 CHANnel2 的触发电平设置为
160mV*/
:TRIGger:PATTern:LEVel? CHANnel2 /* 查询返回 1.600000E-1*/

---

## 27.13:TRIGger:DURation

**语法**: `:TRIGger:DURation:SOURce <source>
:TRIGger:DURation:SOURce?
:TRIGger:DURation:TYPE <pch1>[,<pch2>[,<pch3>[,<pch4>]]]
:TRIGger:DURation:TYPE?
:TRIGger:DURation:WHEN <when>
:TRIGger:DURation:WHEN?
:TRIGger:DURation:TUPPer <time>
:TRIGger:DURation:TUPPer?
:TRIGger:DURation:TLOWer <time>
:TRIGger:DURation:TLOWer?
:TRIGger:DURation:LEVel <source>,<level>
:TRIGger:DURation:LEVel?<source>`

**描述**: 设置或查询持续时间触发的触发源。设置或查询持续时间触发时每个通道的码型。设置或查询持续时间触发的触发条件。设置或查询持续时间触发的持续时间上限值，默认单位为 s。设置或查询持续时间触发的持续时间下限值，默认单位为 s。设置或查询持续时间触发时指定通道的触发电平，单位与当前的幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<pch1> 离散型 {H|L|X} X
<pch2> 离散型 {H|L|X} X
<pch3> 离散型 {H|L|X} X
<pch4> 离散型 {H|L|X} X
名称 类型 范围 默认值
<when> 离散型 {GREater|LESS|GLESs|UNGLess} GREater
名称 类型 范围 默认值
<time> 实型 1.01ns 至 10s 1μs
名称 类型 范围 默认值
<time> 实型 1ns 至 9.9s 1μs
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。
• 参数<pch1>至<pch4>设置模拟通道 CHANnel1 至 CHANnel4 的码型。
• 在参数的取值范围中，H 表示高电平（高于该通道的门限电平）、L 表示低电平（低于该通道的门限电平）、X 表示忽略该通道（该通道不作为码型的一部分，全部通道设置为 X 时，示波器将不会触发）。
• GREater： 当设置码型的持续时间大于预设的时间时触发。
• LESS： 当设置码型的持续时间小于预设的时间时触发。
• GLESs： 当设置码型的持续时间小于预设的时间上限且大于预设的时间下限时触发。
• UNGLess： 当设置码型的持续时间大于预设的时间上限或小于预设的时间下限时触发。本命令仅适用于触发条件为 LESS、GLESs 或 UNGLess 的情况，通过:TRIGger:DURation:WHEN 命令可设置或查询持续时间触发的触发条件。当触发条件为 GLESs 或 UNGLess 时，如果设置的持续时间上限值小于下限值，会自动改变下限值。通过:TRIGger:DURation:TLOWer 命令可设置或查询持续时间触发的持续时间下限值。本命令仅适用于触发条件为 GREater、GLESs 或 UNGLess 的情况，通过:TRIGger:DURation:WHEN 命令可设置或查询持续时间触发的触发条件。当触发条件为 GLESs 或 UNGLess 时，如果设置的持续时间下限值大于上限值，会自动改变上限值。通过:TRIGger:DURation:TUPPer 命令可设置或查询持续时间触发的持续时间上限值。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。参数 D0~D15 数字通道仅 DHO900 系列支持。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回所有通道当前设置的码型，多个通道之间以逗号分开。
查询返回 GRE、LESS、GLES 或 UNGL。
查询以科学计数形式返回持续时间上限值。
查询以科学计数形式返回持续时间下限值。
查询以科学计数形式返回触发电平。

**举例**: :TRIGger:DURation:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:DURation:SOURce? /* 查询返回 CHAN2*/

## 27.13.2:TRIGger:DURation:TYPE
:TRIGger:DURation:TYPE L,X,H,L /* 设置 CHANnel1 至 CHANnel4 的码型为
L,X,H,L*/
:TRIGger:DURation:TYPE? /* 查询返回 L,X,H,L*/
## 27.13.3:TRIGger:DURation:WHEN
:TRIGger:DURation:WHEN LESS /* 将触发条件设置为 LESS*/
:TRIGger:DURation:WHEN? /* 查询返回 LESS*/
## 27.13.4:TRIGger:DURation:TUPPer
:TRIGger:DURation:TUPPer 0.000003 /* 设置持续时间上限值为 3μs*/
:TRIGger:DURation:TUPPer? /* 查询返回 3.000000E-6*/
## 27.13.5:TRIGger:DURation:TLOWer
:TRIGger:DURation:TLOWer 0.000003 /* 设置持续时间下限值为 3μs*/
:TRIGger:DURation:TLOWer?  /* 查询返回 3.000000E-6*/
## 27.13.6:TRIGger:DURation:LEVel
:TRIGger:DURation:LEVel CHANnel2,0.16 /* 将 CHANnel2 的触发电平设置为
160mV*/
:TRIGger:DURation:LEVel? CHANnel2 /* 查询返回 1.600000E-1*/

---

## 27.14:TRIGger:TIMeout

**语法**: `:TRIGger:TIMeout:SOURce <source>
:TRIGger:TIMeout:SOURce?
:TRIGger:TIMeout:SLOPe <slope>
:TRIGger:TIMeout:SLOPe?
:TRIGger:TIMeout:TIME <time>
:TRIGger:TIMeout:TIME?
:TRIGger:TIMeout:LEVel <level>
:TRIGger:TIMeout:LEVel?`

**描述**: 设置或查询超时触发的触发源。设置或查询超时触发的边沿类型。设置或查询超时触发的超时时间，默认单位为 s。设置或查询超时触发时的触发电平，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative|RFALl} POSitive
名称 类型 范围 默认值
<time> 实型 1ns 至 10s 1μs
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。
• POSitive： 在输入信号的上升沿通过触发电平开始计时。
• NEGative： 在输入信号的下降沿通过触发电平开始计时。
• RFALl： 在输入信号的任意沿通过触发电平开始计时。无。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 POS、NEG 或 RFAL。
查询以科学计数形式返回超时时间值。
查询以科学计数形式返回触发电平值。

**举例**: :TRIGger:TIMeout:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:TIMeout:SOURce? /* 查询返回 CHAN2*/
## 27.14.2:TRIGger:TIMeout:SLOPe
:TRIGger:TIMeout:SLOPe NEGative /* 将边沿类型设置为下降沿*/
:TRIGger:TIMeout:SLOPe? /* 查询返回 NEG*/
## 27.14.3:TRIGger:TIMeout:TIME
:TRIGger:TIMeout:TIME 0.002 /* 设置超时时间为 2ms*/
:TRIGger:TIMeout:TIME? /* 查询返回 2.000000E-3*/
## 27.14.4:TRIGger:TIMeout:LEVel
:TRIGger:TIMeout:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:TIMeout:LEVel? /* 查询返回 1.600000E-1*/

---

## 27.15:TRIGger:RUNT

**语法**: `:TRIGger:RUNT:SOURce <source>
:TRIGger:RUNT:SOURce?
:TRIGger:RUNT:POLarity <polarity>
:TRIGger:RUNT:POLarity?
:TRIGger:RUNT:WHEN <when>
:TRIGger:RUNT:WHEN?
:TRIGger:RUNT:WUPPer <width>
:TRIGger:RUNT:WUPPer?
:TRIGger:RUNT:WLOWer <width>
:TRIGger:RUNT:WLOWer?
:TRIGger:RUNT:ALEVel <level>

:TRIGger:RUNT:ALEVel?
:TRIGger:RUNT:BLEVel <level>
:TRIGger:RUNT:BLEVel?`

**描述**: 设置或查询欠幅脉冲触发的触发源。设置或查询欠幅脉冲触发的脉冲极性。设置或查询欠幅脉冲触发的触发脉宽条件。设置或查询欠幅脉冲触发的脉宽上限值，默认单位为 s。设置或查询欠幅脉冲触发的脉宽下限值，默认单位为 s。设置或查询欠幅脉冲触发时的触发电平上限，单位与当前幅度单位一致。设置或查询欠幅脉冲触发时的触发电平下限，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1
名称 类型 范围 默认值
<polarity> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<when> 离散型 {NONE|GREater|LESS|GLESs} NONE
名称 类型 范围 默认值
<width> 实型 1.01ns 至 10s 2μs

名称 类型 范围 默认值
<width> 实型 1ns 至 9.9s 1 μs
名称 类型 范围 默认值
<level> 实型 下限值至(4.5×VerticalScale-
OFFSet) 0V
名称 类型 范围 默认值
<level> 实型 (-4.5×VerticalScale-OFFSet)至上
限值 0V

**说明**: 无。
• POSitive： 在正向欠幅脉冲上触发。
• NEGative： 在负向欠幅脉冲上触发。
• NONE： 不设置欠幅脉冲触发的触发条件。
• GREater： 欠幅脉冲宽度大于设置的脉宽下限时触发。
• LESS： 欠幅脉冲宽度小于设置的脉宽上限时触发。
• GLESs： 欠幅脉冲宽度大于设置的脉宽下限且小于设置的脉宽上限时触发。脉宽下限必须小于脉宽上限。本命令仅适用于触发条件为 LESS 或 GLESs 的情况，通过:TRIGger:RUNT:WHEN 命令可设置或查询欠幅脉冲触发的触发条件。当触发条件为 GLESs 时，如果设置的脉宽上限值小于下限值，会自动改变下限值，通过:TRIGger:RUNT:WLOWer 命令可设置或查询欠幅脉冲触发的脉宽下限值。本命令仅适用于触发条件为 GREater 或 GLESs 的情况，通过:TRIGger:RUNT:WHEN 命令可设置或查询欠幅脉冲触发的触发条件。当触发条件为 GLESs 时，如果设置的脉宽下限值大于上限值，会自动改变上限值，通过:TRIGger:RUNT:WUPPer 命令可设置或查询欠幅脉冲触发的脉宽上限值。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。查询返回 POS 或 NEG。查询返回 NONE、GRE、LESS 或 GLES。查询以科学计数形式返回脉宽上限值。查询以科学计数形式返回脉宽下限值。查询以科学计数形式返回触发电平上限。查询以科学计数形式返回触发电平下限。
**举例**: :TRIGger:RUNT:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:RUNT:SOURce? /* 查询返回 CHAN2*/
## 27.15.2:TRIGger:RUNT:POLarity
:TRIGger:RUNT:POLarity NEGative /* 将脉冲极性设置为负极性*/
:TRIGger:RUNT:POLarity? /* 查询返回 NEG*/

## 27.15.3:TRIGger:RUNT:WHEN
:TRIGger:RUNT:WHEN LESS   /* 设置触发脉宽条件为 LESS*/
:TRIGger:RUNT:WHEN?       /* 查询返回 LESS*/
## 27.15.4:TRIGger:RUNT:WUPPer
:TRIGger:RUNT:WUPPer 0.02 /* 设置脉宽上限值为 20ms*/
:TRIGger:RUNT:WUPPer? /* 查询返回 2.000000E-2*/
## 27.15.5:TRIGger:RUNT:WLOWer
:TRIGger:RUNT:WLOWer 0.01 /* 设置脉宽下限值为 10ms*/
:TRIGger:RUNT:WLOWer? /* 查询返回 1.000000E-2*/
## 27.15.6:TRIGger:RUNT:ALEVel
:TRIGger:RUNT:ALEVel 0.16 /* 设置触发电平上限为 160mV*/
:TRIGger:RUNT:ALEVel? /* 查询返回 1.600000E-1*/
## 27.15.7:TRIGger:RUNT:BLEVel
:TRIGger:RUNT:BLEVel 0.16 /* 设置触发电平下限为 160mV*/
:TRIGger:RUNT:BLEVel? /* 查询返回 1.600000E-1*/

---

## 27.16:TRIGger:WINDows

**语法**: `:TRIGger:WINDows:SOURce <source>
:TRIGger:WINDows:SOURce?
:TRIGger:WINDows:SLOPe <type>
:TRIGger:WINDows:SLOPe?
:TRIGger:WINDows:POSition <pos>
:TRIGger:WINDows:POSition?
:TRIGger:WINDows:TIME <time>
:TRIGger:WINDows:TIME?
:TRIGger:WINDows:ALEVel <level>
:TRIGger:WINDows:ALEVel?
:TRIGger:WINDows:BLEVel <level>
:TRIGger:WINDows:BLEVel?`

**描述**: 设置或查询超幅触发的触发源。设置或查询超幅触发的边沿类型。设置或查询超幅触发的触发位置。设置或查询超幅触发的超幅时间。设置或查询超幅触发时的触发电平上限，单位与当前幅度单位一致。设置或查询超幅触发时的触发电平下限，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型 {CHANnel1|CHANnel2|
CHANnel3|CHANnel4} CHANnel1
名称 类型 范围 默认值
<type> 离散型 {POSitive|NEGative|RFALI} POSitive
名称 类型 范围 默认值
<type> 离散型 {EXIT|ENTer|TIME} ENTer
名称 类型 范围 默认值
<time> 实型 1ns 至 10s 1μs
名称 类型 范围 默认值
<level> 实型 下限值至(4.5×VerticalScale-
OFFSet) 0V

名称 类型 范围 默认值
<level> 实型 (-4.5×VerticalScale-OFFSet)至上
限值 0V

**说明**: 无。
• POSitive： 在输入信号的上升沿处且电压电平高于设定的高触发电平时触发。
• NEGative： 在输入信号的下降沿处且电压电平低于设定的低触发电平时触发。
• RFALl： 在输入信号的任意沿处且电压电平满足设定的触发电平时触发。
• EXIT： 当输入信号退出指定的触发电平范围内时触发。
• ENTer： 当输入信号进入指定的触发电平范围内时触发。
• TIME： 用于限制超幅进入后的保持时间，超幅进入后的累计保持时间等于超幅时间时触发。无。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
**返回格式**: 查询返回 CHAN1、CHAN2、CHAN3 或 CHAN4。查询返回 POS、NEG 或 RFAL。查询返回 EXIT、ENT 或 TIME。查询以科学计数形式返回超幅时间。查询以科学计数形式返回触发电平上限。查询以科学计数形式返回触发电平下限。
**举例**: :TRIGger:WINDows:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:WINDows:SOURce? /* 查询返回 CHAN2*/
## 27.16.2:TRIGger:WINDows:SLOPe
:TRIGger:WINDows:SLOPe NEGative /* 设置超幅触发的边沿类型为 NEGative*/
:TRIGger:WINDows:SLOPe? /* 查询返回 NEG*/
## 27.16.3:TRIGger:WINDows:POSition
:TRIGger:WINDows:POSition ENT /* 将触发位置设置为超幅进入*/
:TRIGger:WINDows:POSition? /* 查询返回 ENT*/
## 27.16.4:TRIGger:WINDows:TIME
:TRIGger:WINDows:TIME 0.002 /* 设置超幅时间为 2ms*/
:TRIGger:WINDows:TIME? /* 查询返回 2.000000E-3*/
## 27.16.5:TRIGger:WINDows:ALEVel
:TRIGger:WINDows:ALEVel 0.16 /* 设置触发电平上限为 160mV*/
:TRIGger:WINDows:ALEVel? /* 查询返回 1.600000E-1*/
## 27.16.6:TRIGger:WINDows:BLEVel
:TRIGger:WINDows:BLEVel 0.05 /* 设置触发电平下限为 50mV*/
:TRIGger:WINDows:BLEVel? /* 查询返回 5.000000E-2*/

---

## 27.17:TRIGger:DELay

**语法**: `:TRIGger:DELay:SA <source>
:TRIGger:DELay:SA?
:TRIGger:DELay:ASLop <slope>
:TRIGger:DELay:ASLop?

:TRIGger:DELay:SB <source>
:TRIGger:DELay:SB?
:TRIGger:DELay:BSLop <slope>
:TRIGger:DELay:BSLop?
:TRIGger:DELay:TYPE <type>
:TRIGger:DELay:TYPE?
:TRIGger:DELay:TUPPer <time>
:TRIGger:DELay:TUPPer?
:TRIGger:DELay:TLOWer <time>
:TRIGger:DELay:TLOWer?
:TRIGger:DELay:ALEVel <level>
:TRIGger:DELay:ALEVel?
:TRIGger:DELay:BLEVel <level>
:TRIGger:DELay:BLEVel?`

**描述**: 设置或查询延迟触发时信源 A 的触发信源。设置或查询延迟触发时边沿 A 的边沿类型。设置或查询延迟触发时信源 B 的触发信源。设置或查询延迟触发时边沿 B 的边沿类型。设置或查询延迟触发时的触发条件。设置或查询延迟触发时的延迟时间上限值，默认单位为 s。设置或查询延迟触发时的延迟时间下限值，默认单位为 s。设置或查询延迟触发时信源 A 的阈值电平，单位与当前幅度单位一致。设置或查询延迟触发时信源 B 的阈值电平，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel2
名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<type> 离散型 {GREater|LESS|GLESs|GOUT} GREater

名称 类型 范围 默认值
<time> 实型 1.01ns 至 10s 2μs
名称 类型 范围 默认值
<time> 实型 1ns 至 9.9s 1μs
名称 类型 范围 默认值
<level> 实型 (-4.5×VerticalScale-OFFSet)至
(4.5×VerticalScale-OFFSet) 0V
名称 类型 范围 默认值
<level> 实型 (-4.5×VerticalScale-OFFSet)至
(4.5×VerticalScale-OFFSet) 0V

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。无。参数 D0~D15 数字通道仅 DHO900 系列支持。无。
• GREater： 信源 A 所设定的边沿与信源 B 所设定的边沿之间的时间差（ΔT）大于预设的时间限制时触发。
• LESS： 信源 A 所设定的边沿与信源 B 所设定的边沿之间的时间差（ΔT）小于预设的时间限制时触发。
• GLESs： 信源 A 所设定的边沿与信源 B 所设定的边沿之间的时间差（ΔT）大于预设的时间下限且小于预设的时间上限时触发。
• GOUT： 信源 A 所设定的边沿与信源 B 所设定的边沿之间的时间差（ΔT）小于预设的时间下限或大于预设的时间上限时触发。本命令仅适用于触发条件为 LESS、GLESs 或 GOUT 的情况，通过:TRIGger:DELay:TYPE 命令可设置或查询延迟触发的触发条件。当触发条件为 GLESs 或 GOUT 时，如果设置的延迟时间上限值小于下限值，会自动改变下限值，通过:TRIGger:DELay:TLOWer 命令可设置或查询延迟触发时的延迟时间下限值。本命令仅适用于触发条件为 GREater、GLESs 或 GOUT 的情况，通过:TRIGger:DELay:TYPE命令可设置或查询延迟触发的触发条件。当触发条件为 GLESs 或 GOUT 时，如果设置的延迟时间下限值大于上限值，会自动改变上限值，通过:TRIGger:DELay:TUPPer 命令可设置或查询延迟触发时的延迟时间上限值。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 POS 或 NEG。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。

查询返回 POS 或 NEG。
查询返回 GRE、LESS、GLES 或 GOUT。
查询以科学计数形式返回延迟时间上限值。

查询以科学计数形式返回延迟时间下限值。
查询以科学计数形式返回信源 A 的阈值电平。
查询以科学计数形式返回信源 B 的阈值电平。

**举例**: :TRIGger:DELay:SA CHANnel2 /* 将触发信源 A 设置为 CHANnel2*/
:TRIGger:DELay:SA?       /* 查询返回 CHAN2*/
## 27.17.2:TRIGger:DELay:ASLop
:TRIGger:DELay:ASLop NEGative /* 将边沿 A 的类型设置为下降沿*/
:TRIGger:DELay:ASLop? /* 查询返回 NEG*/
## 27.17.3:TRIGger:DELay:SB
:TRIGger:DELay:SB CHANnel4 /* 将触发信源 B 设置为 CHANnel4*/
:TRIGger:DELay:SB? /* 查询返回 CHAN4*/
## 27.17.4:TRIGger:DELay:BSLop
:TRIGger:DELay:BSLop NEGative /* 将边沿 B 的类型设置为下降沿*/
:TRIGger:DELay:BSLop? /* 查询返回 NEG*/
## 27.17.5:TRIGger:DELay:TYPE
:TRIGger:DELay:TYPE GOUT /* 将触发条件设置为><*/
:TRIGger:DELay:TYPE? /* 查询返回 GOUT*/
## 27.17.6:TRIGger:DELay:TUPPer
:TRIGger:DELay:TUPPer 0.002 /* 设置延迟时间上限为 2ms*/
:TRIGger:DELay:TUPPer?  /* 查询返回 2.000000E-3*/
## 27.17.7:TRIGger:DELay:TLOWer
:TRIGger:DELay:TLOWer 0.002 /* 设置延迟时间下限为 2ms*/
:TRIGger:DELay:TLOWer? /* 查询返回 2.000000E-3*/
## 27.17.8:TRIGger:DELay:ALEVel
:TRIGger:DELay:ALEVel 0.16 /* 设置信源 A 的阈值电平为 160mV*/
:TRIGger:DELay:ALEVel? /* 查询返回 1.600000E-1*/
## 27.17.9:TRIGger:DELay:BLEVel
:TRIGger:DELay:BLEVel 0.05 /* 设置信源 B 的阈值电平为 50mV*/
:TRIGger:DELay:BLEVel? /* 查询返回 5.000000E-2*/

---

## 27.18:TRIGger:SHOLd

**语法**: `:TRIGger:SHOLd:DSRC <source>
:TRIGger:SHOLd:DSRC?
:TRIGger:SHOLd:CSRC <source>
:TRIGger:SHOLd:CSRC?
:TRIGger:SHOLd:SLOPe <slope>
:TRIGger:SHOLd:SLOPe?
:TRIGger:SHOLd:PATTern <pattern>
:TRIGger:SHOLd:PATTern?
:TRIGger:SHOLd:TYPE <type>

:TRIGger:SHOLd:TYPE?
:TRIGger:SHOLd:STIMe <time>
:TRIGger:SHOLd:STIMe?
:TRIGger:SHOLd:HTIMe <time>
:TRIGger:SHOLd:HTIMe?
:TRIGger:SHOLd:DLEVel <level>
:TRIGger:SHOLd:DLEVel?
:TRIGger:SHOLd:CLEVel<level>
:TRIGger:SHOLd:CLEVel?`

**描述**: 设置或查询建立保持触发的数据源。设置或查询建立保持触发的时钟源。设置或查询建立保持触发的边沿类型。设置或查询建立保持触发的数据类型。设置或查询建立保持触发的触发条件。设置或查询建立保持触发的建立时间，默认单位为 s。设置或查询建立保持触发的保持时间，默认单位为 s。设置或查询数据源的触发电平，单位与当前幅度单位一致。设置或查询时钟源的触发电平，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel2
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<pattern> 离散型 {H|L} H
名称 类型 范围 默认值
<type> 离散型 {SETup|HOLD|SETHold} SETup
名称 类型 范围 默认值
<time> 实型 1ns 至 10s 2μs
名称 类型 范围 默认值
<time> 实型 1ns 至 10s 1μs
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。参数 D0~D15 数字通道仅 DHO900 系列支持。无。
• H： 高电平。
• L： 低电平。
• SETup： 建立，当建立时间小于设定值时，示波器触发。
• HOLD： 保持，当保持时间小于设定值时，示波器触发。
• SETHold： 建立保持，当建立时间或保持时间小于相应的设定值时，示波器触发。
• 建立时间是指在触发器的时钟信号指定边沿到来之前，数据保持稳定且不变的时间。
• 该命令仅适用于保持类型为 SETup 或 SETHold。
• 保持时间是指在触发器的时钟信号指定边沿到来之后，数据保持稳定且不变的时间。
• 该命令适用于保持类型为 HOLD 或 SETHold。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。

查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 POS 或 NEG。
查询返回 H 或 L。
查询返回 SET、HOLD 或 SETH。
查询以科学计数形式返回建立时间值。

查询以科学计数形式返回保持时间值。
查询以科学计数形式返回数据源的触发电平。
查询以科学计数形式返回时钟源的触发电平。

**举例**: :TRIGger:SHOLd:DSRC CHANnel1 /* 将数据源设置为 CHANnel1*/
:TRIGger:SHOLd:DSRC? /* 查询返回 CHAN1*/
## 27.18.2:TRIGger:SHOLd:CSRC
:TRIGger:SHOLd:CSRC CHANnel2 /* 将时钟源设置为 CHANnel2*/
:TRIGger:SHOLd:CSRC? /* 查询返回 CHAN2*/
## 27.18.3:TRIGger:SHOLd:SLOPe
:TRIGger:SHOLd:SLOPe NEGative /* 将边沿类型设置为下降沿*/
:TRIGger:SHOLd:SLOPe? /* 查询返回 NEG*/
## 27.18.4:TRIGger:SHOLd:PATTern
:TRIGger:SHOLd:PATTern L /* 将数据类型设置为 L*/
:TRIGger:SHOLd:PATTern? /* 查询返回 L*/
## 27.18.5:TRIGger:SHOLd:TYPE
:TRIGger:SHOLd:TYPE SETHold /* 将触发条件设置为建立保持*/
:TRIGger:SHOLld:TYPE? /* 查询返回 SETH*/
## 27.18.6:TRIGger:SHOLd:STIMe
:TRIGger:SHOLd:STIMe 0.002 /* 设置建立时间为 2ms*/
:TRIGger:SHOLd:STIMe? /* 查询返回 2.000000E-3*/
## 27.18.7:TRIGger:SHOLd:HTIMe
:TRIGger:SHOLd:HTIMe 0.002 /* 设置保持时间为 2ms*/
:TRIGger:SHOLd:HTIMe? /* 查询返回 2.000000E-3*/
## 27.18.8:TRIGger:SHOLd:DLEVel
:TRIGger:SHOLd:DLEVel 0.16 /* 设置数据源的触发电平为 160mV*/
:TRIGger:SHOLd:DLEVel? /* 查询返回 1.600000E-1*/
## 27.18.9:TRIGger:SHOLd:CLEVel
:TRIGger:SHOLd:CLEVel 0.05 /* 设置时钟源的触发电平为 50mV*/
:TRIGger:SHOLd:CLEVel? /* 查询返回 5.000000E-2*/

---

## 27.19:TRIGger:NEDGe

**语法**: `:TRIGger:NEDGe:SOURce <source>
:TRIGger:NEDGe:SOURce?
:TRIGger:NEDGe:SLOPe <slope>
:TRIGger:NEDGe:SLOPe?
:TRIGger:NEDGe:IDLE <time>
:TRIGger:NEDGe:IDLE?
:TRIGger:NEDGe:EDGE <edge>
:TRIGger:NEDGe:EDGE?
:TRIGger:NEDGe:LEVel <level>
:TRIGger:NEDGe:LEVel?`

**描述**: 设置或查询第 N 边沿触发的触发源。设置或查询第 N 边沿触发的边沿类型。设置或查询第 N 边沿触发的空闲时间，默认单位为 s。设置或查询第 N 边沿触发的边沿数。设置或查询第 N 边沿触发时的触发电平，单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<time> 实型 16ns 至 10s 1μs
名称 类型 范围 默认值
<edge> 整型 1 至 65535 1
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。
• POSitive： 在输入信号的上升沿处，且电压电平满足设定的触发电平时触发。
• NEGative： 在输入信号的下降沿处，且电压电平满足设定的触发电平时触发。无。无。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 POS 或 NEG。
查询以科学计数形式返回空闲时间值。
查询返回 1 至 65535 之间的一个整数。
查询以科学计数形式返回触发电平。

**举例**: :TRIGger:NEDGe:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:NEDGe:SOURce? /* 查询返回 CHAN2*/
## 27.19.2:TRIGger:NEDGe:SLOPe
:TRIGger:NEDGe:SLOPe NEGative /* 将边沿类型设置为下降沿*/
:TRIGger:NEDGe:SLOPe? /* 查询返回 NEG*/
## 27.19.3:TRIGger:NEDGe:IDLE
:TRIGger:NEDGe:IDLE 0.002 /* 设置空闲时间为 2ms*/
:TRIGger:NEDGe:IDLE? /* 查询返回 2.000000E-3*/
## 27.19.4:TRIGger:NEDGe:EDGE
:TRIGger:NEDGe:EDGE 20 /* 将边沿数设置为 20*/
:TRIGger:NEDGe:EDGE? /* 查询返回 20*/
## 27.19.5:TRIGger:NEDGe:LEVel
:TRIGger:NEDGe:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:NEDGe:LEVel? /* 查询返回 1.600000E-1*/

---

## 27.20:TRIGger:RS232

**语法**: `:TRIGger:RS232:SOURce <source>
:TRIGger:RS232:SOURce?

:TRIGger:RS232:LEVel <level>
:TRIGger:RS232:LEVel?
:TRIGger:RS232:POLarity <polarity>
:TRIGger:RS232:POLarity?
:TRIGger:RS232:WHEN <when>
:TRIGger:RS232:WHEN?
:TRIGger:RS232:DATA <data>
:TRIGger:RS232:DATA?
:TRIGger:RS232:BAUD <baud>

:TRIGger:RS232:BAUD?
:TRIGger:RS232:WIDTh <width>
:TRIGger:RS232:WIDTh?
:TRIGger:RS232:STOP <bit>
:TRIGger:RS232:STOP?
:TRIGger:RS232:PARity <parity>
:TRIGger:RS232:PARity?`

**描述**: 设置或查询 RS232 触发的触发源。设置或查询 RS232 触发时的触发电平，单位与当前幅度单位一致。设置或查询 RS232 触发的脉冲极性。设置或查询 RS232 触发的触发条件。设置或查询 RS232 触发条件为数据时的数据值。设置或查询 RS232 触发的波特率，默认单位为 bps。设置或查询 RS232 触发条件为数据时的数据位宽。设置或查询 RS232 触发的停止位。设置或查询 RS232 触发的校验方式。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<polarity> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<when> 离散型 {STARt|ERRor|CERRor|DATA} STARt

名称 类型 范围 默认值
<data> 整型 0 至 2n-1 0
名称 类型 范围 默认值
<baud> 整型 1bps 至 20Mbps 9600bps
名称 类型 范围 默认值
<width> 离散型 {5|6|7|8} 8
名称 类型 范围 默认值
<bit> 离散型 {1|1.5|2} 1
名称 类型 范围 默认值
<parity> 离散型 {EVEN|ODD|NONE} NONE

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。无。
• STARt： 在帧起始位置处触发。
• ERRor： 当检测到错误帧时触发。
• CERRor： 当检测到校验错误时触发。
• DATA： 在设定的数据位的最后一位触发。表达式 2n-1 中，n 为当前的数据宽度，取值范围为 5、6、7 或 8，可通过 :TRIGger:RS232:WIDTh 命令查询或设置数据位宽。若波特率设置为带兆“M”的数值，则需在数值后加上 A，如发送 5M，需发送 5MA。无。无。无。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询以科学计数形式返回触发电平。
查询返回 POS 或 NEG。
查询返回 STAR、ERR、CERR 或 DATA。
查询返回一个整数。
查询返回 1bps 至 20Mbps 之间的一个整数。
查询返回 5、6、7 或 8。
查询返回 1、1.5 或 2。
查询返回 EVEN、ODD 或 NONE。

**举例**: :TRIGger:RS232:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:RS232:SOURce? /* 查询返回 CHAN2*/
## 27.20.2:TRIGger:RS232:LEVel
:TRIGger:RS232:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:RS232:LEVel? /* 查询返回 1.600000E-1*/
## 27.20.3:TRIGger:RS232:POLarity
:TRIGger:RS232:POLarity POSitive  /* 设置 RS232触发的脉冲极性为
POSitive*/
:TRIGger:RS232:POLarity?          /* 查询返回 POS*/
## 27.20.4:TRIGger:RS232:WHEN
:TRIGger:RS232:WHEN ERRor /* 将触发条件设置为错误帧*/
:TRIGger:RS232:WHEN?  /* 查询返回 ERR*/
## 27.20.5:TRIGger:RS232:DATA
:TRIGger:RS232:DATA 10 /* 将数据值设置为 10*/
:TRIGger:RS232:DATA? /* 查询返回 10*/
## 27.20.6:TRIGger:RS232:BAUD
:TRIGger:RS232:BAUD 4800 /* 将波特率设置为 4800bps*/
:TRIGger:RS232:BAUD? /* 查询返回 4800*/
## 27.20.7:TRIGger:RS232:WIDTh
:TRIGger:RS232:WIDTh 6 /* 将数据位宽设置为 6*/
:TRIGger:RS232:WIDTh? /* 查询返回 6*/

## 27.20.8:TRIGger:RS232:STOP
:TRIGger:RS232:STOP 2 /* 将停止位设置为 2*/
:TRIGger:RS232:STOP? /* 查询返回 2*/
## 27.20.9:TRIGger:RS232:PARity
:TRIGger:RS232:PARity EVEN /* 将校验方式设置为偶校验*/
:TRIGger:RS232:PARity? /* 查询返回 EVEN*/

---

## 27.21:TRIGger:IIC

**语法**: `:TRIGger:IIC:SCL <source>
:TRIGger:IIC:SCL?
:TRIGger:IIC:CLEVel <level>
:TRIGger:IIC:CLEVel?
:TRIGger:IIC:SDA <source>
:TRIGger:IIC:SDA?
:TRIGger:IIC:DLEVel <level>
:TRIGger:IIC:DLEVel?
:TRIGger:IIC:WHEN <when>
:TRIGger:IIC:WHEN?
:TRIGger:IIC:AWIDth <bits>
:TRIGger:IIC:AWIDth?
:TRIGger:IIC:ADDRess <address>
:TRIGger:IIC:ADDRess?
:TRIGger:IIC:DIRection <direction>
:TRIGger:IIC:DIRection?
:TRIGger:IIC:DBYTes <bytes>
:TRIGger:IIC:DBYTes?
:TRIGger:IIC:DATA <data>
:TRIGger:IIC:DATA?
:TRIGger:IIC:CURRbit <currbit>
:TRIGger:IIC:CURRbit?
:TRIGger:IIC:CODE <code>
:TRIGger:IIC:CODE?`

**描述**: 设置或查询 I2C 触发的时钟线的通道源。设置或查询 I2C 触发时的时钟线的触发电平，单位与当前幅度单位一致。设置或查询 I2C 触发的数据线的通道源。设置或查询 I2C 触发时的数据线的触发电平，单位与当前幅度单位一致。设置或查询 I2C 触发的触发条件。设置或查询 I2C 触发条件为地址或地址数据时的地址位宽。设置或查询 I2C 触发条件为地址或地址数据时的地址值。设置或查询 I2C 触发条件为地址或地址数据时的数据方向。设置或查询 I2C 触发条件为数据或地址数据时的位组长度。设置或查询 I2C 触发条件为数据或地址数据时的数据值。设置或查询 I2C 触发数据的第几位。设置或查询 I2C 触发数据某一位的值。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel2
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<when> 离散型
{STARt|RESTart|STOP|
NACKnowledge|ADDRess|DATA|
ADATa}
STARt
名称 类型 范围 默认值
<bits> 离散型 {7|8|10} 7
名称 类型 范围 默认值
<address> 整型 0 至 2n-1 0
名称 类型 范围 默认值
<dir> 离散型 {READ|WRITe|RWRite} WRITe
名称 类型 范围 默认值
<bytes> 实型 1 至 5 1
名称 类型 范围 默认值
<data> 整型 0 至 240-1 0
名称 类型 范围 默认值
<currbit> 整型 0 至 39 0
名称 类型 范围 默认值
<code> 离散型 {0|1|255} 255

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。参数 D0~D15 数字通道仅 DHO900 系列支持。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
• STARt： 当 SCL 为高而 SDA 数据从高跳变至低时触发。
• RESTart： 当另一个启动条件在停止条件之前出现时触发。
• STOP： 当 SCL 为高而 SDA 数据从低跳变至高时触发。
• NACKnowledge： 在任何确认 SCL 时钟位期间，如果 SDA 数据为高则触发。
• ADDRess： 查找设定的地址值，在读写位上触发。
• DATA： 在数据线（SDA）上查找设定的数据值，在数据最后一位对应的时钟线
（SCL）跳变沿上触发。
• ADATa： 同时查找设定的地址值和数据值，在同时满足“地址”和“数据”条件时触发。无。表达式 2n-1 中，n 为当前的地址位宽，取值范围为 0 至 127、0 至 255 或 0 至 1023。当地址位宽设置为“8”时，该命令不可用。无。
<data>的可设置范围受位组长度设置的影响，可以通过 :TRIGger:IIC:DBYTes 命令设置或查
询位组长度。字节长度最大可设置为 5，即 40 位二进制数据。因此，<data>的取值范围为
0 至 240-1。
完成本命令的配置后，可通过:TRIGger:IIC:CODE 命令对设置位数据的值进行查询或修改。
当<code>取值为 255 时，代表任意值。
通过命令:TRIGger:IIC:CURRbit 设置指定位数后，可通过本命令查询或修改触发数据中此位
的值。

查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询以科学计数形式返回触发电平。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询以科学计数形式返回触发电平。

查询返回 STAR、REST、STOP、NACK、ADDR、DATA 或 ADAT。
查询返回 7、8 或 10。，
查询返回一个整数。

查询返回 READ、WRIT 或 RWR。
查询以科学计数形式返回位组长度。
查询返回一个整数。
查询返回 0 至 39 之间的一个整数。
查询返回 0、1 或 255。

**举例**: :TRIGger:IIC:SCL CHANnel2 /* 将时钟源设置为 CHANnel2*/
:TRIGger:IIC:SCL? /* 查询返回 CHAN2*/
## 27.21.2:TRIGger:IIC:CLEVel
:TRIGger:IIC:CLEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:IIC:CLEVel? /* 查询返回 1.600000E-1*/
## 27.21.3:TRIGger:IIC:SDA
:TRIGger:IIC:SDA CHANnel2 /* 将数据源设置为 CHANnel2*/
:TRIGger:IIC:SDA? /* 查询返回 CHAN2*/
## 27.21.4:TRIGger:IIC:DLEVel
:TRIGger:IIC:DLEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:IIC:DLEVel? /* 查询返回 1.600000E-1*/
## 27.21.5:TRIGger:IIC:WHEN
:TRIGger:IIC:WHEN RESTart /* 将触发条件设置为重启*/
:TRIGger:IIC:WHEN? /* 查询返回 REST*/

## 27.21.6:TRIGger:IIC:AWIDth
:TRIGger:IIC:AWIDth 10 /* 将地址位宽设置为 10*/
:TRIGger:IIC:AWIDth? /* 查询返回 10*/
## 27.21.7:TRIGger:IIC:ADDRess
:TRIGger:IIC:ADDRess 100 /* 将地址值设置为 100*/
:TRIGger:IIC:ADDRess? /* 查询返回 100*/
## 27.21.8:TRIGger:IIC:DIRection
:TRIGger:IIC:DIRection RWRite /* 将数据方向设置为读/写*/
:TRIGger:IIC:DIRection? /* 查询返回 RWR*/
## 27.21.9:TRIGger:IIC:DBYTes
:TRIGger:IIC:DBYTes 3 /* 设置触发位组长度为 3*/
:TRIGger:IIC:DBYTes?    /* 查询返回 3*/
## 27.21.10:TRIGger:IIC:DATA
:TRIGger:IIC:DATA 64 /* 将数据值设置为 64*/
:TRIGger:IIC:DATA? /* 查询返回 64*/
## 27.21.11:TRIGger:IIC:CURRbit
:TRIGger:IIC:CURRbit 8  /* 设置 I2C 触发数据的第 9 位*/
:TRIGger:IIC:CURRbit?   /* 查询返回 8*/
## 27.21.12:TRIGger:IIC:CODE
:TRIGger:IIC:CODE 0 /* 将数据值设置为 0*/
:TRIGger:IIC:CODE? /* 查询返回 0*/

---

## 27.22:TRIGger:SPI

**语法**: `:TRIGger:SPI:CLK <source>
:TRIGger:SPI:CLK?
:TRIGger:SPI:SCL <source>
:TRIGger:SPI:SCL?

:TRIGger:SPI:CLEVel <level>
:TRIGger:SPI:CLEVel?
:TRIGger:SPI:SLOPe <slope>
:TRIGger:SPI:SLOPe?
:TRIGger:SPI:MISO <source>
:TRIGger:SPI:MISO?
:TRIGger:SPI:SDA <source>
:TRIGger:SPI:SDA?
:TRIGger:SPI:DLEVel <level>
:TRIGger:SPI:DLEVel?
:TRIGger:SPI:WHEN <when>
:TRIGger:SPI:WHEN?
:TRIGger:SPI:CS <source>
:TRIGger:SPI:CS?
:TRIGger:SPI:SLEVel <level>
:TRIGger:SPI:SLEVel?
:TRIGger:SPI:MODE <mode>
:TRIGger:SPI:MODE?
:TRIGger:SPI:TIMeout <time>
:TRIGger:SPI:TIMeout?
:TRIGger:SPI:WIDTh <width>
:TRIGger:SPI:WIDTh?
:TRIGger:SPI:DATA <data>
:TRIGger:SPI:DATA?
:TRIGger:SPI:CURRbit <currbit>
:TRIGger:SPI:CURRbit?
:TRIGger:SPI:CODE <code>
:TRIGger:SPI:CODE?`

**描述**: 设置或查询 SPI 触发中时钟线的通道源。设置或查询 SPI 触发的时钟线的通道源。设置或查询 SPI 触发时时钟通道的触发电平，单位与当前幅度单位一致。设置或查询 SPI 触发的时钟边沿的类型。设置与查询 SPI 触发中数据线的通道源。设置或查询 SPI 触发的数据线的通道源。设置或查询 SPI 触发时数据通道的触发电平，单位与当前幅度单位一致。设置或查询 SPI 触发的触发条件。设置或查询 SPI 触发条件为 CS 时，片选线的通道源。设置或查询 SPI 触发时片选通道的触发电平，单位与当前幅度单位一致。设置或查询 SPI 触发条件为片选时的片选模式。在 SPI 的触发条件为超时情况下，设置或查询超时时间，默认单位为 s。设置或查询 SPI 触发下数据通道的数据位宽。设置或查询 SPI 触发下的数据值。设置或查询 SPI 触发数据的第几位。设置或查询 SPI 触发数据某一位的值。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<slope> 离散型 {POSitive|NEGative} POSitive
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel2
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel2
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<when> 离散型 {CS|TIMeout} CS
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel3
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<mode> 离散型 {HIGH|LOW} LOW
名称 类型 范围 默认值
<time> 实型 16ns 至 1s 1μs
名称 类型 范围 默认值
<width> 整型 4 至 32 8
名称 类型 范围 默认值
<data> 整型 0 至 232-1 0

名称 类型 范围 默认值
<currbit> 整型 0 至 39 0
名称 类型 范围 默认值
<code> 离散型 {0|1|255} 255

**说明**: 参数 D0~D15 数字通道仅 DHO900 系列支持。此命令为向后兼容命令，请使用 :TRIGger:SPI:CLK 命令。参数 D0~D15 数字通道仅 DHO900 系列支持。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
• POSitive： 在时钟的上升沿处对数据进行取样。
• NEGative： 在时钟的下降沿处对数据进行取样。参数 D0~D15 数字通道仅 DHO900 系列支持。参数 D0~D15 数字通道仅 DHO900 系列支持。对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
• CS：片选信号有效的条件下，示波器在搜索到满足触发条件的数据（SDA）时触发。
• TIMeout：时钟（CLK）信号保持指定时间的空闲状态后，示波器在搜索到满足触发条件的数据（MISO）时触发。在 DHO800 系列中，仅四通道型号支持设置 SPI 触发条件为 CS。仅在 SPI 触发条件为片选时，该设置命令有效。可通过:TRIGger:SPI:WHEN 命令设置或查询
SPI 触发的触发条件。
在 DHO800 系列中，仅四通道型号支持本命令。

• 仅在 SPI 触发条件为片选时，该设置命令有效。可通过:TRIGger:SPI:WHEN 命令设置或查询 SPI 触发的触发条件。
• 对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参考:CHANnel<n>:OFFSet 命令。
• 在 DHO800 系列中，仅四通道型号支持本命令。仅在片选模式下，该设置命令有效。可通过:TRIGger:SPI:WHEN 命令设置或查询 SPI 触发的触发条件。在 DHO800 系列中，仅四通道型号支持本命令。仅在 SPI 触发条件为超时触发时，该设置命令有效。可通过:TRIGger:SPI:WHEN 命令设置或查询 SPI 的触发条件。无。
<data>取值范围与当前的数据位宽有关，可通过 :TRIGger:SPI:WIDTh 命令查询或设置数据
位宽。数据位宽的最大值为 32，因此<data>的取值范围为 0 至 232-1。
完成本命令的配置后，可通过:TRIGger:SPI:CODE 命令对设置位数据的值进行查询或修改。
当<code>取值为 255 时，代表任意值。
通过命令:TRIGger:SPI:CURRbit 设置指定位数后，可通过本命令查询或修改触发数据中此位
的值。

查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询以科学计数形式返回触发电平。
查询返回 POS 或 NEG。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。

查询以科学计数形式返回触发电平。
查询返回 CS 或 TIM。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、
D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询以科学计数形式返回触发电平。
查询返回 HIGH 或 LOW。
查询以科学计数形式返回超时时间。
查询返回 4 至 32 之间的一个整数。
查询返回一个整数。
查询返回 0 至 39 之间的一个整数。
查询返回 0、1 或 255。

**举例**: :TRIGger:SPI:CLK CHANnel3  /* 设置 SPI 触发中数据线的通道源为 CHANnel3 */
:TRIGger:SPI:CLK? /* 查询返回 CHAN3*/
## 27.22.2:TRIGger:SPI:SCL
:TRIGger:SPI:SCL CHANnel1 /* 设置时钟线的通道源为 CHANnel1*/
:TRIGger:SPI:SCL? /* 查询返回 CHAN1*/
## 27.22.3:TRIGger:SPI:CLEVel
:TRIGger:SPI:CLEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:SPI:CLEVel? /* 查询返回 1.600000E-1*/
## 27.22.4:TRIGger:SPI:SLOPe
:TRIGger:SPI:SLOPe POSitive /* 设置时钟边沿为上升沿*/
:TRIGger:SPI:SLOPe? /* 查询返回 POS*/
## 27.22.5:TRIGger:SPI:MISO
:TRIGger:SPI:MISO CHANnel3 /* 设置 SPI 触发中数据线的通道源为 CHANnel3*/
:TRIGger:SPI:MISO? /* 查询返回 CHAN3*/
## 27.22.6:TRIGger:SPI:SDA
:TRIGger:SPI:SDA CHANnel2 /* 设置数据线的通道源为 CHANnel2*/
:TRIGger:SPI:SDA? /* 查询返回 CHAN2*/
## 27.22.7:TRIGger:SPI:DLEVel
:TRIGger:SPI:DLEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:SPI:DLEVel? /* 查询返回 1.600000E-1*/
## 27.22.8:TRIGger:SPI:WHEN
:TRIGger:SPI:WHEN TIMeout /* 设置触发条件为超时*/
:TRIGger:SPI:WHEN? /* 查询返回 TIM*/
## 27.22.9:TRIGger:SPI:CS
:TRIGger:SPI:CS CHANnel2 /* 设置 SPI 触发中触发条件为 CS 时片选线的通道源为
CHANnel2*/
:TRIGger:SPI:CS? /* 查询返回 CHAN2*/
## 27.22.10:TRIGger:SPI:SLEVel
:TRIGger:SPI:SLEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:SPI:SLEVel? /* 查询返回 1.600000E-1*/

## 27.22.11:TRIGger:SPI:MODE
:TRIGger:SPI:MODE LOW  /* 设置片选模式为低电平有效*/
:TRIGger:SPI:MODE? /* 查询返回 LOW*/
## 27.22.12:TRIGger:SPI:TIMeout
:TRIGger:SPI:TIMeout 0.001 /* 设置超时时间为 1ms*/
:TRIGger:SPI:TIMeout? /* 查询返回 1.000000E-3*/
## 27.22.13:TRIGger:SPI:WIDTh
:TRIGger:SPI:WIDTh 10 /* 设置数据位宽为 10*/
:TRIGger:SPI:WIDTh? /* 查询返回 10*/
## 27.22.14:TRIGger:SPI:DATA
:TRIGger:SPI:DATA 5 /* 设置数据值为 5*/
:TRIGger:SPI:DATA? /* 查询返回 5*/
## 27.22.15:TRIGger:SPI:CURRbit
:TRIGger:SPI:CURRbit 8  /* 设置 SPI 触发数据的第 9 位*/
:TRIGger:SPI:CURRbit? /* 查询返回 8*/
## 27.22.16:TRIGger:SPI:CODE
:TRIGger:SPI:CODE 0 /* 将数据值设置为 0*/
:TRIGger:SPI:CODE? /* 查询返回 0*/

---

## 27.23:TRIGger:CAN

**语法**: `:TRIGger:CAN:BAUD <baud>
:TRIGger:CAN:BAUD?
:TRIGger:CAN:SOURce <source>
:TRIGger:CAN:SOURce?
:TRIGger:CAN:STYPe <stype>
:TRIGger:CAN:STYPe?
:TRIGger:CAN:WHEN <cond>
:TRIGger:CAN:WHEN?
:TRIGger:CAN:SPOint <spoint>
:TRIGger:CAN:SPOint?
:TRIGger:CAN:EXTended <bool>
:TRIGger:CAN:EXTended?
:TRIGger:CAN:DEFine <type>
:TRIGger:CAN:DEFine?
:TRIGger:CAN:DWIDth <data>
:TRIGger:CAN:DWIDth?
:TRIGger:CAN:DATA <data>
:TRIGger:CAN:DATA?
:TRIGger:CAN:CURRbit <currbit>
:TRIGger:CAN:CURRbit?
:TRIGger:CAN:CODE <code>
:TRIGger:CAN:CODE?
:TRIGger:CAN:LEVel <level>
:TRIGger:CAN:LEVel?`

**描述**: 设置或查询 CAN 触发的信号速率，单位为 bps。设置或查询 CAN 触发的触发源。设置或查询 CAN 触发的信号类型。设置或查询 CAN 触发的触发条件。设置或查询 CAN 触发的采样点位置，以百分比形式表示。设置或查询 CAN 触发在触发条件为“远程帧 ID”或“数据帧 ID”时是否支持扩展 ID。设置或查询 CAN 触发下，触发条件为 Data 和 ID 时，定义为 ID 还是 Data。设置或查询 CAN 触发的触发条件为数据帧数据及数据和 ID 时的数据位组长度。设置或查询 CAN 触发时的数据值。设置或查询 CAN 触发数据的第几位。设置或查询 CAN 触发数据某一位的值。设置或查询 CAN 触发的触发电平。单位与当前幅度单位一致。
**参数**: 名称 类型 范围 默认值
<baud> 整型 10kbps 至 5Mbps 1Mbps
名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<stype> 离散型 {H|L|RXTX|DIFFerential} H
名称 类型 范围 默认值
<cond> 离散型
{SOF|EOF|IDRemote|OVERload|
IDFRame|DATaframe|IDData|
ERFRame|ERANswer|ERCHeck|
ERFormat|ERRandom|ERBit}
SOF
名称 类型 范围 默认值
<spoint> 整型 10 至 90 50
名称 类型 范围 默认值
<bool> 布尔型 {{1|ON}|{0|OFF}} 0|OFF
名称 类型 范围 默认值
<type> 离散型 {DATA|ID} DATA
名称 类型 范围 默认值
<data> 整型 1 至 8 1
名称 类型 范围 默认值
<data> 整型 0 至 240-1 0
名称 类型 范围 默认值
<currbit> 整型 0 至 39 0
名称 类型 范围 默认值
<code> 离散型 {0|1|255} 255
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V

**说明**: 若信号速率设置为带兆“M”的数值，则需在数值后加上 A，如发送 5M，需发送 5MA。参数 D0~D15 数字通道仅 DHO900 系列支持。
• H： 实际的 CAN_H 总线信号。
• L： 实际的 CAN_L 总线信号。
• RXTX： 来自 CAN 信号线上的接收或发送信号。
• DIFFerential： 使用差分探头连接到模拟通道的 CAN 差分总线信号。差分探头的正极连接 CAN_H 总线信号，差分探头的负极连接 CAN_L 总线信号。
• SOF： 帧起始，在数据帧的帧起始位上触发。
• EOF： 帧结束，在数据帧的帧结束位上触发。帧类型
• IDRemote： 远程帧 ID，在指定 ID 的远程帧上触发。
• OVERload： 过载帧，在过载帧上触发。
• IDFRame： 数据帧 ID，在指定 ID 的数据帧上触发。
• DATaframe： 数据帧数据，在指定数据的数据帧上触发。
• IDData： 数据和 ID，在指定 ID 的数据帧和指定数据的数据帧上触发。帧错误
• ERFRame： 错误帧，在错误帧上触发。
• ERANswer： 应答错误，在应答错误帧上触发。
• ERCHeck： 校验错误，在校验错误帧上触发。
• ERFormat： 格式错误，在格式错误帧上触发。
• ERRandom： 任意错误，在格式错误或应答错误等错误帧上触发。
• ERBit： 位填充错误，在位填充错误帧上触发。采样点为位时间内的点，示波器在该点对位电平进行采样。采样点位置用“位开始至采样点的时间”与“位时间”的百分比表示。
• 0|OFF： 不支持扩展 ID。
• 1|ON： 支持扩展 ID。
CAN 触发的触发条件可通过:TRIGger:CAN:WHEN 命令，进行配置和查询。
• DATA： 定义为 Data。
• ID： 定义为 ID。
CAN 触发的触发条件可通过:TRIGger:CAN:WHEN 命令，进行配置和查询。
<data>的可设置范围受位组长度设置的影响，可以通过 :TRIGger:IIC:DBYTes 命令设置或查
询位组长度。字节长度最大可设置为 5，即 40 位二进制数据。因此，<data>的取值范围为
0 至 240-1。
当触发条件为“数据帧数据”或“数据和 ID”时（可通过 :TRIGger:CAN:WHEN 命令设置
或查询），本命令有效。
• 当触发条件为“数据帧数据”时，发送本命令，设置的是“数据”的值。
• 当触发条件为“数据和 ID”时，根据 :TRIGger:CAN:DEFine 的定义进行设置。
- 当定义为“ID”时，发送本命令，设置的是“ID”的值。
- 当定义为“数据”时，发送本命令，设置的是“数据”的值。

完成本命令的配置后，可通过:TRIGger:CAN:CODE 命令对设置位数据的值进行查询或修
改。
当<code>取值为 255 时，代表任意值。
通过命令:TRIGger:CAN:CURRbit 设置指定位数后，可通过本命令查询或修改触发数据中此
位的值。
对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参
考:CHANnel<n>:OFFSet 命令。

查询返回 10kbps 至 5Mbps 之间的一个整数。查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询返回 H、L、RXTX 或 DIFF。
查询返回 SOF、EOF、IDR、OVER、IDFR、DAT、IDD、ERFR、ERAN、ERCH、ERF、
ERB 或 ERR。
查询返回 10 至 90 之间的一个整数。
查询返回 0 或 1。
查询返回 DATA 或 ID。
查询返回 1 至 8 之间的整数。
查询返回一个整数。
查询返回 0 至 39 之间的一个整数。
查询返回 0、1 或 255。
查询以科学计数形式返回触发电平。

**举例**: :TRIGger:CAN:BAUD 125000 /* 将信号速率设置为 125000bps*/
:TRIGger:CAN:BAUD? /* 查询返回 125000*/
## 27.23.2:TRIGger:CAN:SOURce
:TRIGger:CAN:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:CAN:SOURce? /* 查询返回 CHAN2*/

## 27.23.3:TRIGger:CAN:STYPe
:TRIGger:CAN:STYPe L /* 将信号类型设置为 CAN_L 总线信号*/
:TRIGger:CAN:STYPe? /* 查询返回 L*/
## 27.23.4:TRIGger:CAN:WHEN
:TRIGger:CAN:WHEN EOF /* 将触发条件设置为帧结束*/
:TRIGger:CAN:WHEN? /* 查询返回 EOF*/

## 27.23.5:TRIGger:CAN:SPOint
:TRIGger:CAN:SPOint 60 /* 设置 CAN 触发的采样点位置为 60%*/
:TRIGger:CAN:SPOint? /* 查询返回 60*/
## 27.23.6:TRIGger:CAN:EXTended
:TRIGger:CAN:EXTended ON    /* 设置支持扩展 ID*/
:TRIGger:CAN:EXTended?  /* 查询返回 1*/
## 27.23.7:TRIGger:CAN:DEFine
:TRIGger:CAN:DEFine ID /* 设置 CAN 触发定义为 ID*/
:TRIGger:CAN:DEFine? /* 查询返回 ID*/
## 27.23.8:TRIGger:CAN:DWIDth
:TRIGger:CAN:DWIDth 5  /* 设置 CAN 触发的数据位组长度 5*/
:TRIGger:CAN:DWIDth? /* 查询返回 5*/
## 27.23.9:TRIGger:CAN:DATA
:TRIGger:CAN:DATA 100   /* 设置 CAN 触发时的数据值为 100*/
:TRIGger:CAN:DATA?      /* 查询返回 100*/
## 27.23.10:TRIGger:CAN:CURRbit
:TRIGger:CAN:CURRbit 8  /* 设置 CAN 触发数据的第 9 位*/
:TRIGger:CAN:CURRbit? /* 查询返回 8*/
## 27.23.11:TRIGger:CAN:CODE
:TRIGger:CAN:CODE 0 /* 将数据值设置为 0*/
:TRIGger:CAN:CODE? /* 查询返回 0*/
## 27.23.12:TRIGger:CAN:LEVel
:TRIGger:CAN:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:CAN:LEVel? /* 查询返回 1.600000E-1*/

---

## 27.24:TRIGger:LIN

**语法**: `:TRIGger:LIN:SOURce <source>
:TRIGger:LIN:SOURce?
:TRIGger:LIN:LEVel <level>
:TRIGger:LIN:LEVel?
:TRIGger:LIN:STANdard <std>
:TRIGger:LIN:STANdard?
:TRIGger:LIN:BAUD <baud>
:TRIGger:LIN:BAUD?
:TRIGger:LIN:SAMPlepoint <value>
:TRIGger:LIN:SAMPlepoint?
:TRIGger:LIN:WHEN <when>
:TRIGger:LIN:WHEN?
:TRIGger:LIN:ERRor <value>
:TRIGger:LIN:ERRor?
:TRIGger:LIN:ID <id>
:TRIGger:LIN:ID?
:TRIGger:LIN:DATA <data>
:TRIGger:LIN:DATA?
:TRIGger:LIN:CURRbit <currbit>

:TRIGger:LIN:CURRbit?
:TRIGger:LIN:CODE <code>
:TRIGger:LIN:CODE?`

**描述**: 设置或查询 LIN 触发的触发源。设置或查询 LIN 触发的触发电平。单位与当前幅度单位一致。设置或查询 LIN 触发的协议版本。设置或查询 LIN 触发的波特率。默认单位为 bps。设置或查询 LIN 触发的采样位置。设置或查询 LIN 触发的触发条件。设置或查询触发条件为错误帧触发时，LIN 触发的错误类型。设置或查询触发条件为数据和 ID 触发时，LIN 触发的 ID 值。设置或查询触发条件为数据触发时，LIN 触发的触发数据值。设置或查询 LIN 触发数据的第几位。设置或查询 LIN 触发数据某一位的值。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|CHANnel3|
CHANnel4}
CHANnel1
名称 类型 范围 默认值
<level> 实型
模拟通道：(-4.5×VerticalScale-
OFFSet)至(4.5×VerticalScale-
OFFSet)
数字通道：-20V 至 20V
0V
名称 类型 范围 默认值
<std> 离散型 {1X|2X|BOTH} BOTH

名称 类型 范围 默认值
<baud> 整型 1kbps 至 20Mbps 9600bps
名称 类型 范围 默认值
<value> 整型 10 至 90 50
名称 类型 范围 默认值
<when> 离散型 {SYNCbreak|ID|DATA|IDData|
SLEep|WAKeup|ERRor} SYNCbreak
名称 类型 范围 默认值
<value> 离散型 {SYNC|ID|CHECk} SYNC
名称 类型 范围 默认值
<id> 整型 0 至 63 0
名称 类型 范围 默认值
<data> 整型 请参考说明 0
名称 类型 范围 默认值
<currbit> 整型 0 至 39 0
名称 类型 范围 默认值
<code> 离散型 {0|1|255} 255

**说明**: 仅 DHO900 系列支持:TRIGger:LIN 命令。示波器可在 LIN 信号的同步场上触发，也可在指定的标识符、数据或帧上触发。
## 27.24.1:TRIGger:LIN:SOURce
对于 VerticalScale，请参考:CHANnel<n>:SCALe 命令。对于 OFFSet，请参
考:CHANnel<n>:OFFSet 命令。
若波特率设置为带兆“M”的数值，则需在数值后加上 A，如发送 5M，需发送 5MA。
采样位置用“位开始至采样点的时间”与“位时间”的百分比表示。
• SYNCbreak： 在同步场（Sync Field）的最后一位触发。
• ID： 当查找到与预设标识符相等的标识符时触发。
• DATA： 当查找到满足预设条件的数据时触发。
• IDData： 当查找到与预设标识符相等的标识符且满足预设条件的数据时触发。
• SLEep： 当查找到睡眠帧时触发。
• WAKeup： 当查找到唤醒帧时触发。
• ERRor： 在指定类型的错误帧上触发。
• SYNC： 同步错误
• ID： 奇偶校验错误
• CHECk： 校验和错误无。
LIN 触发的触发数据值的取值范围与位组长度的取值有关。位组长度最大可设置为 8，即 64
位二进制数据。因此，<data>的取值范围为 0 至 264-1。
完成本命令的配置后，可通过:TRIGger:LIN:CODE 命令对设置位数据的值进行查询或修改。
当<code>取值为 255 时，代表任意值。
通过命令:TRIGger:LIN:CURRbit 设置指定位数后，可通过本命令查询或修改触发数据中此位
的值。

查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3 或 CHAN4。
查询以科学计数形式返回触发电平。
查询返回 1X、2X 或 BOTH。
查询返回 1000 至 20000000 之间的一个整数，单位 bps。
查询返回 10 至 90 之间的一个整数。
查询返回 SYNC、ID、DATA、IDD、SLE、WAK 或 ERR。
查询返回 SYNC、ID 或 CHEC。
查询返回 0 至 63 之间的一个整数。
查询返回 0 至 264-1 之间的整数。
查询返回 0 至 39 之间的一个整数。
查询返回 0、1 或 255。

**举例**: :TRIGger:LIN:SOURce CHANnel2 /* 将触发源设置为 CHANnel2*/
:TRIGger:LIN:SOURce? /* 查询返回 CHAN2*/

## 27.24.2:TRIGger:LIN:LEVel
:TRIGger:LIN:LEVel 0.16 /* 设置触发电平为 160mV*/
:TRIGger:LIN:LEVel? /* 查询返回 1.600000E-1*/
## 27.24.3:TRIGger:LIN:STANdard
:TRIGger:LIN:STANdard 2X /* 设置 LIN 触发的协议版本为 2X*/
:TRIGger:LIN:STANdard?  /* 查询返回 2X*/
## 27.24.4:TRIGger:LIN:BAUD
:TRIGger:LIN:BAUD 19200 /* 设置 LIN 触发的波特率为 19200bps*/
:TRIGger:LIN:BAUD? /* 查询返回 19200*/
## 27.24.5:TRIGger:LIN:SAMPlepoint
:TRIGger:LIN:SAMPlepoint 40 /* 设置 LIN 触发的采样位置为 40%*/
:TRIGger:LIN:SAMPlepoint?  /* 查询返回 40*/
## 27.24.6:TRIGger:LIN:WHEN
:TRIGger:LIN:WHEN SYNCbreak /* 设置触发条件为 SYNCbreak*/
:TRIGger:LIN:WHEN? /* 查询返回 SYNC*/
## 27.24.7:TRIGger:LIN:ERRor
:TRIGger:LIN:ERRor ID  /* 设置 LIN 触发错误类型为 ID*/
:TRIGger:LIN:ERRor? /* 查询返回 ID*/
## 27.24.8:TRIGger:LIN:ID
:TRIGger:LIN:ID 4 /* 将 LIN 触发的 ID 值设置为 4*/
:TRIGger:LIN:ID? /* 查询返回 4*/
## 27.24.9:TRIGger:LIN:DATA
:TRIGger:LIN:DATA 100   /* 设置 LIN 触发的触发数据值为 100*/
:TRIGger:LIN:DATA?      /* 查询返回 100*/
## 27.24.10:TRIGger:LIN:CURRbit
:TRIGger:LIN:CURRbit 8  /* 设置 LIN 触发数据的第 9 位*/
:TRIGger:LIN:CURRbit? /* 查询返回 8*/
## 27.24.11:TRIGger:LIN:CODE
:TRIGger:LIN:CODE 0   /* 将数据值指定位设置为 0*/
:TRIGger:LIN:CODE?   /* 查询返回 0*/

---

# 28 波形读取命令子系统
波形读取命令用于读取波形数据及其相关设置。:WAVeform:MODE命令用于设置波形数据的
读取模式。不同模式下，各参数的定义不同，如图 3.12 和图 3.13 所示。
YINCrement=Verticalscale/7500
YREFerence
YORigin
XORigin XINCrement=TimeScale/100XREFerence
XINCrement=TimeScale/100
YREFerence
YORigin
XREFerenceXORigin
YINCrement[1]

[1]：RAW 模式下，YINCrement 与内存波形的 Verticalscale 和当前选择的 Verticalscale 有关。
波形数据读取
• WORD 或 BYTE 格式：  读取的数据格式为 TMC 头+波形数据点+结束符。 TMC 头为
#NXXXXXX 的形式， #为 TMC 规定的头标志符， N 表示后面含有 N 个字节，以
ASCII 字符的形式描述波形数据点的长度，结束符用于表示通讯的终止。例如，一次读
取的数据为：#9000001000XXXX 表示 9 个字节描述数据的长度，000001000 表示波
形数据的长度，即 1000 字节。
• ASCii 格式： 读取的数据格式为 波形数据点+结束符。波形数据点以科学计数形式返回波形中每一点的实际电压值，各电压值之间以“,”隔开。
• 分批次读取内存数据时，每次读回的数据只是内存中一块区域的数据。分块读回的数据，每块开头都含有 TMC 数据描述头（WORD 或 BYTE 格式）。相邻两块间的波形数据连续。
• 下图为读取的波形数据（BYTE 格式下）。首先，在右侧的下拉框中选择“View as hexadecimal only”；此时，读取到的波形数据将以十六进制的形式显示，前面的十一个字节为“TMC 数据描述头”，从第十二个字节（即 8E）开始为波形数据，用户可以使用公式“(0x8E - YORigin - YREFerence) × YINCrement”将读取的波形数据转换为波形中每一点的电压值。公式中各参数含义请参考 。
:WAVeform:MODE
:WAVeform:YINCrement?
:WAVeform:YORigin?
## 28.1:WAVeform:SOURce

**语法**: `:WAVeform:SOURce <source>
:WAVeform:SOURce?`

**描述**: 设置或查询波形数据读取的通道源。
**参数**: 名称 类型 范围 默认值
<source> 离散型
{D0|D1|D2|D3|D4|D5|D6|D7|D8|
D9|D10|D11|D12|D13|D14|D15|
CHANnel1|CHANnel2|
CHANnel3|CHANnel4|MATH1|
MATH2|MATH3|MATH4}
CHANnel1

**说明**: 通道源设为 MATH1~MATH4 时，:WAVeform:MODE 仅可选择 NORMal 模式。参数 D0~D15 数字通道仅 DHO900 系列支持。
查询返回 D0、D1、D2、D3、D4、D5、D6、D7、D8、D9、D10、D11、D12、D13、 D14、D15、CHAN1、CHAN2、CHAN3、CHAN4、MATH1、MATH2、MATH3 或
MATH4。

**举例**: :WAVeform:SOURce CHANnel2 /* 设置通道源为 CHANnel2*/
:WAVeform:SOURce?          /* 查询返回 CHAN2*/

---

## 28.2:WAVeform:MODE

**语法**: `:WAVeform:MODE <mode>
:WAVeform:MODE?`

**描述**: 设置或查询:WAVeform:DATA?命令读取数据的模式。
**参数**: 名称 类型 范围 默认值
<mode> 离散型 {NORMal|MAXimum|RAW} NORMal

**说明**: • NORMal：  读取当前屏幕显示的波形数据。
• MAXimum：  运行状态下，读取屏幕显示的波形数据； 停止状态下，读取内存中的波形数据。
• RAW：  读取内存中的波形数据。注意：内存中的数据必须在示波器停止状态下进行读取，且读取过程中不可操作示波器。
• 通道源选择 MATH 时，仅 NORMal 模式有效。
**返回格式**: 查询返回 NORM、MAX 或 RAW。
**举例**: :WAVeform:MODE RAW /* 设置波形数据的读取模式为 RAW*/
:WAVeform:MODE? /* 查询返回 RAW*/

---

## 28.3:WAVeform:FORMat

**语法**: `:WAVeform:FORMat <format>
:WAVeform:FORMat?`

**描述**: 设置或查询波形数据的返回格式。
**参数**: 名称 类型 范围 默认值
<format> 离散型 {WORD|BYTE|ASCii} BYTE

**说明**: • WORD： 一个波形点占两个字节（即 16 位）。
• BYTE：  一个波形点占一个字节（即 8 位）。
• ASCii：  以科学计数形式返回各波形点的实际电压值， 各电压值之间以逗号分隔。
**返回格式**: 查询返回 WORD、BYTE 或 ASC。
**举例**: :WAVeform:FORMat WORD /* 设置波形数据的返回格式为 WORD*/
:WAVeform:FORMat? /* 查询返回 WORD*/

---

## 28.4:WAVeform:POINts

**语法**: `:WAVeform:POINts <point>
:WAVeform:POINts?`

**描述**: 设置或查询当前模式下需要读取的波形点数。
**参数**: 名称 类型 范围 默认值
<point> 整型 请参考说明 -

**说明**: <point>的范围与当前的波形数据读取模式有关。可通过:WAVeform:MODE命令设置或查询波形数据的读取模式。
• NORMal 模式： 1 至 1000
• RAW 模式： 1 至当前最大的存储深度
• MAXimum 模式： 运行状态下，读取 1 至当前屏幕的有效点数；停止状态下，读取 1至当前内存中的有效点数
**返回格式**: 查询以整数形式返回波形点数。
**举例**: :WAVeform:POINts 100   /* 设置读取的波形点数为 100*/
:WAVeform:POINts?   /* 查询返回 100*/

---

## 28.5:WAVeform:DATA?

**语法**: `:WAVeform:DATA?`
**描述**: 读取波形数据。
**参数**: 无。
**说明**: 屏幕波形数据读取流程：
:WAV:SOUR CHAN1       /* 设置通道源为 CHANnel1*/
:WAV:MODE NORMal      /* 设置波形读取模式为 NORMal*/
:WAV:FORM BYTE        /* 设置波形数据的返回格式为 BYTE*/
:WAV:DATA?            /* 读取屏幕波形数据*/
内存波形数据读取流程：
:STOP                 /* 设置 STOP 状态(内存波形数据必须在示波器处于停止状态时进行读取)*/
:WAV:SOUR CHAN1       /* 设置通道源为 CHANnel1*/
:WAV:MODE RAW         /* 设置波形读取模式为 RAW*/
:WAV:FORM BYTE        /* 设置波形数据的返回格式为 BYTE*/
:WAV:STAR 1           /* 设置波形数据读取的起始点为第 1 个波形点*/
:WAVeform:STOP 120000 /* 设置波形数据读取的终止点为第 120000 个波形点(最后一个点)*/

**返回格式**: 返回格式与当前选择的波形数据返回格式（:WAVeform:FORMat）有关。具体信息请参考 波形数据读取 。

---

## 28.6:WAVeform:XINCrement?

**语法**: `:WAVeform:XINCrement?`
**描述**: 查询当前选中通道源 X 方向上相邻两点之间的时间间隔。
**参数**: 无。
**说明**: 返回值与当前的数据读取模式相关：
• NORMal 模式下， XINCrement=TimeScale/100。
• RAW 模式下， XINCrement=1/SampleRate。
• MAX 模式下，仪器处于运行状态时， XINCrement=TimeScale/100；仪器处于停止状态时，XINCrement=1/SampleRate。单位与当前的通道源相关。
**返回格式**: 查询以科学计数形式返回时间间隔。
**举例**: 无。

---

## 28.7:WAVeform:XORigin?

**语法**: `:WAVeform:XORigin?`
**描述**: 查询当前选中通道源 X 方向上波形数据的起始时间。
**参数**: 无。
**说明**: 返回值与当前的数据读取模式相关：
• NORMal 模式下，返回屏幕显示的波形数据的起始时间。
• RAW 模式下，返回内存中波形数据的起始时间。
• MAX 模式下，仪器处于运行状态时， 返回屏幕显示的波形数据的起始时间；仪器处于停止状态时， 返回内存中波形数据的起始时间。单位与当前的通道源相关。
**返回格式**: 查询以科学计数形式返回时间值。
**举例**: 无。

---

## 28.8:WAVeform:XREFerence?

**语法**: `:WAVeform:XREFerence?`
**描述**: 查询当前选中通道源 X 方向上波形点的时间参考基准。
**参数**: 无。
**说明**: 无。
**返回格式**: 查询返回 0（即屏幕或内存中第一个波形点）。
**举例**: 无。

---

## 28.9:WAVeform:YINCrement?

**语法**: `:WAVeform:YINCrement?`
**描述**: 查询当前选中通道源 Y 方向上的单位电压值。
**参数**: 无。
**说明**: 返回值与当前的数据读取模式相关：
• NORMal 模式下， YINCrement = VerticalScale/7500。
• RAW 模式下， YINCrement 与内存波形的 VerticalScale 和当前选择的 VerticalScale有关。
• MAX 模式下，仪器处于运行状态时， YINCrement = VerticalScale/7500；仪器处于停止状态时，YINCrement 与内存波形的 VerticalScale 和当前选择的 VerticalScale 有关。
**返回格式**: 查询以科学计数形式返回单位电压值。
**举例**: 无。

---

## 28.10:WAVeform:YORigin?

**语法**: `:WAVeform:YORigin?`
**描述**: 查询当前选中通道源 Y 方向上相对于垂直参考位置的垂直偏移。
**参数**: 无。
**说明**: 返回值与当前的数据读取模式相关：
• NORMal 模式下， YORigin = VerticalOffset/YINCrement。
• RAW 模式下， YORigin 与内存波形的 VerticalScale 和当前选择的 VerticalScale 有关。
• MAX 模式下，仪器处于运行状态时， YORigin = VerticalOffset/YINCrement；仪器处于停止状态时， YORigin 与内存波形的 VerticalScale 和当前选择的 VerticalScale 有关。
**返回格式**: 查询返回一个整数。
**举例**: 无。

---

## 28.11:WAVeform:YREFerence?

**语法**: `:WAVeform:YREFerence?`
**描述**: 查询当前选中通道源 Y 方向的垂直参考位置。
**参数**: 无。
**说明**: YREFerence 的值与:WAVeform:FORMat命令的配置有关。不同波形数据的返回格式下参考位置不同。
**返回格式**: 查询返回一个整数。
**举例**: 无。

---

## 28.12:WAVeform:STARt

**语法**: `:WAVeform:STARt <sta>
:WAVeform:STARt?`

**描述**: 设置或查询波形数据读取的起始位置。
**参数**: 名称 类型 范围 默认值
<sta> 整型 请参考说明 1

**说明**: 读取内存波形数据时，在一次读取中起始位置和终止位置的实际可设范围与示波器的存储深度以及当前选择的波形数据返回格式有关。
• NORMal 模式下，范围是 1 至 1000
• MAX 模式下，仪器处于 RUN 状态时，范围是 1 至 1000； 仪器处于 STOP 状态时，范围是 1 至当前最大存储深度
• RAW 模式下，范围是 1 至当前最大的存储深度
**返回格式**: 查询返回一个整数。
**举例**: :WAVeform:STARt 100 /* 设置起始点为 100*/
:WAVeform:STARt? /* 查询返回 100*/

---

## 28.13:WAVeform:STOP

**语法**: `:WAVeform:STOP <stop>
:WAVeform:STOP?`

**描述**: 设置或查询波形数据读取的停止位置。
**参数**: 名称 类型 范围 默认值
<stop> 整型 请参考说明 1000

**说明**: 读取内存波形数据时，在一次读取中起始点和终止点的实际可设范围与示波器的存储深度以及当前选择的波形数据返回格式有关。
• NORMal 模式下，范围是 1 至 1000
• MAX 模式下，仪器处于 RUN 状态时，范围是 1 至 1000； 仪器处于 STOP 状态时，范围是 1 至当前最大存储深度
• RAW 模式下，范围是 1 至当前最大的存储深度
**返回格式**: 查询返回一个整数。
**举例**: :WAVeform:STOP 500 /* 设置终止点为 500*/
:WAVeform:STOP? /* 查询返回 500*/

---

## 28.14:WAVeform:PREamble?

**语法**: `:WAVeform:PREamble?`
**描述**: 查询并返回全部的波形参数。
**参数**: 无。
**说明**: 无。
• 对于不同型号的仪器，某些参数的范围可能不同，使用时，请根据您所使用的仪器型号进行相应调整。
• 使用本章所列实例之前，请选择通信接口（USB 或 LAN）并进行正确的连接。并且，您的计算机需要安装 Ultra Sigma 或其它可用于发送命令的 PC 软件。
• 本章所列实例每行命令之后由“/*”和“*/”包括的内容为注释部分，用于帮助用户理解，并非命令内容。
4.1 基础参数配置
设置通道参数
实例描述：打开通道 1，并配置垂直档位为 0.1V/div，耦合方式为 AC。
实现方法：
:CHANnel1:DISPlay ON       /* 打开 CHANnel1*/
:CHANnel1:SCALe 0.1        /* 设置 CH1 的垂直档位为 0.1V/div*/
:CHANnel1:COUPling AC   /* 设置 CH1 的耦合方式为 AC*/
设置水平参数
实例描述：配置存储深度为 1M，时基档位为 200μs/div。
实现方法：
:ACQuire:MDEPth 1M            /* 设置存储深度为 1M*/
:TIMebase:MODE MAIN           /* 设置水平时基模式为 MAIN 模式*/
:TIMebase:MAIN:SCALe 0.0002   /* 设置主时基档位为 200μs/div*/
设置触发参数
实例描述：以特定电压阈值（160mV）设置上升沿触发。
实现方法：
:TRIGger:MODE EDGE              /* 选择边沿触发*/
:TRIGger:EDGE:SOURce CHANnel2   /* 设置触发源为 CHANnel2*/
:TRIGger:EDGE:SLOPe POSitive    /* 设置边沿类型为上升沿*/
:TRIGger:EDGE:LEVel 0.16        /* 设置触发电平为 160mV*/
:TRIGger:STATus?                /* 查询当前的触发状态*/
4.2 测量功能
 | 应用实例 | 

统计峰峰值
实例描述：读取通道 2 的统计峰峰值。
实现方法：
:MEASure:THReshold:TYPE PERCent   /* 设置门限类型为 PERCent 百分比*/
:MEASure:SETup:MAX 95             /* 设置门限电平上限值为 95%*/
:MEASure:SETup:MID 89             /* 设置门限电平的中间值为 89%*/
:MEASure:SETup:MIN 53             /* 设置门限电平的下限值为 53%*/
:MEASure:ITEM VPP,CHANnel2     /* 添加 CH2 的波形峰峰值测量项/
:MEASure:ITEM? VPP,CHANnel2    /* 查询返回 CH2 的波形峰峰值的当前测量结果*/
:MEASure:STATistic:RESet              /* 清除历史统计数据并重新统计*/
:MEASure:STATistic:ITEM VPP,CHANnel2/* 添加 CH2 波形的峰峰值的统计测量项*/
:MEASure:STATistic:ITEM? CNT,VPP,CHANnel2/* 查询返回测量项的统计次数*/
:MEASure:STATistic:ITEM? MAXimum,VPP,CHANnel2/* 查询返回 CH2 的峰峰值的统计最大值*/
:MEASure:STATistic:ITEM? MINimum,VPP,CHANnel2/* 查询返回 CH2 的峰峰值的统计最小值*/
:MEASure:STATistic:ITEM? AVERages,VPP,CHANnel2/* 查询返回 CH2 的峰峰值的统计平均值*/
:MEASure:STATistic:ITEM? DEViation,VPP,CHANnel2/* 查询返回 CH2 的峰峰值的统计标准差*/
读取占空比
实例描述：以设定的百分比读取周期脉冲的占空比。
实现方法：
:MEASure:THReshold:TYPE PERCent   /* 设置门限类型为 PERCent 百分比*/
:MEASure:SETup:MAX 95             /* 设置门限电平上限值为 95%*/
:MEASure:SETup:MID 89             /* 设置门限电平的中间值为 89%*/
:MEASure:SETup:MIN 53             /* 设置门限电平的下限值为 53%*/
:MEASure:ITEM PDUTy,CHANnel2   /* 添加 CH2 波形的周期脉冲占空比的测量项*/
:MEASure:ITEM? PDUTy,CHANnel2  /* 查询 CH2 波形的占空比的当前值*/
:MEASure:STATistic:RESet   /* 清除历史统计数据并重新统计*/
:MEASure:STATistic:ITEM PDUTy,CHANnel2/* 添加 CH2 波形的占空比的统计测量项*/
:MEASure:STATistic:ITEM? CNT,PDUTy,CHANnel2/* 查询返回测量项的统计次数*/
:MEASure:STATistic:ITEM? MAXimum,PDUTy,CHANnel2/* 查询返回 CH2 的占空比的统计最大值*/
:MEASure:STATistic:ITEM? MINimum,PDUTy,CHANnel2/* 查询返回 CH2 的占空比的统计最小值*/
:MEASure:STATistic:ITEM? AVERages,PDUTy,CHANnel2/* 查询返回 CH2 的占空比的统计平均值*/
:MEASure:STATistic:ITEM? DEViation,PDUTy,CHANnel2/* 查询返回 CH2 的占空比的统计标准差*/
读取上升时间
实例描述：以设定电压阈值读取上升时间。
实现方法：
 | 应用实例 | 

:MEASure:THReshold:TYPE ABSolute  /* 设置门限类型为 ABSolute 绝对值*/
:MEASure:SETup:MAX 0.15           /* 设置门限电平上限值为 0.15V */
:MEASure:SETup:MID 0              /* 设置门限电平的中间值为 0V*/
:MEASure:SETup:MIN -0.15          /* 设置门限电平的下限值为-0.15V*/
:MEASure:ITEM RTIMe,CHANnel2           /* 添加 CH2 波形的上升时间测量项*/
:MEASure:STATistic:ITEM? CURRent,RTIMe /* 查询 CH2 波形上升时间测量当前值*/
:MEASure:STATistic:RESet               /* 清除历史统计数据并重新统计*/
:MEASure:STATistic:ITEM RTIMe,CHANnel2 /* 打开 CH2 的上升时间的统计功能*/
:MEASure:STATistic:ITEM? CURRent,RTIMe /* 查询 CH2 波形的上升时间的当前值*/
:MEASure:STATistic:ITEM? CNT,RTIMe,CHANnel2/* 查询返回测量项的统计次数*/
:MEASure:STATistic:ITEM? MAXimum,RTIMe,CHANnel2/* 查询返回 CH2 的上升时间的统计最大值*/
:MEASure:STATistic:ITEM? MINimum,RTIMe,CHANnel2/* 查询返回 CH2 的上升时间的统计最小值*/
:MEASure:STATistic:ITEM? AVERages,RTIMe,CHANnel2/* 查询返回 CH2 的上升时间的统计平均值*/
:MEASure:STATistic:ITEM? DEViation,RTIMe,CHANnel2/* 查询返回 CH2 的上升时间的统计标准差*/
4.3 读取波形
ASCII 数据格式读取
实例描述：ASCII 数据格式读取转化实际波形数据。
实现方法：
:ACQuire:MDEPth 100k      /* 设置存储深度为 100k*/
:RUN       /* 使示波器开始运行,等待 5 秒*/
:STOP      /* 设置 STOP 状态(内存波形数据必须在示波器处于停止状态时进行读取)*/
:WAV:SOUR CHAN1     /* 设置通道源为 CHANnel1*/
:WAV:MODE RAW       /* 设置波形读取模式为 RAW*/
:WAV:FORM ASCii     /* 设置波形数据的返回格式为 ASCii */
:WAV:STAR 1          /* 设置波形数据读取的起始点为第 1 个波形点*/
:WAV:STOP 100000     /* 设置读取的终止点为第 100000 个波形点(最后一个点)*/
:WAV:DATA?           /* 读取波形数据*/
:WAVeform:PREamble?  /* 返回全部的波形参数*/
内存波形数据读取
实例描述：读取内存波形数据。
实现方法：
:ACQuire:MDEPth 100k   /* 设置存储深度为 100k*/
:RUN    /* 使示波器开始运行,等待 5 秒*/
:STOP   /* 设置 STOP 状态(内存波形数据必须在示波器处于停止状态时进行读取)*/
:WAV:SOUR CHAN1       /* 设置通道源为 CHANnel1*/
:WAV:MODE RAW          /* 设置波形读取模式为 RAW*/
:WAV:FORM BYTE         /* 设置波形数据的返回格式为 BYTE*/
:WAV:STAR 1            /* 设置波形数据读取的起始点为第 1 个波形点*/
:WAVeform:STOP 100000  /* 设置波形数据读取的终止点为第 100000 个波形点(最后一
 | 应用实例 | 

个点)*/
:WAV:DATA?             /* 读取波形数据*/
屏幕波形数据读取
实例描述：读取屏幕波形数据。
实现方法：
:WAV:SOUR CHAN1       /* 设置通道源为 CHANnel1*/
:WAV:MODE NORMal      /* 设置波形读取模式为 NORMal*/
:WAV:FORM BYTE        /* 设置波形数据的返回格式为 BYTE*/
:WAV:DATA?            /* 读取波形数据*/
 | 应用实例 | 

