# dsh-lab 用法驱动设计

> 本文从**用户怎么用**出发，反推**需要实现什么**。
> 作为开发时的入手指南：先理解用户场景，再对应到具体实现。

---

## 1. 一句话概述

dsh-lab 是一个 DSH 插件，让用户通过**自然语言对话**控制实验室仪器（信号发生器、示波器、ASG 设备等）。

**核心理念**：LLM 做一切决策，工具只做原子操作。工作流文件是 LLM 阅读的说明书，不是机器执行的脚本。

---

## 2. 用户旅程总览

```
安装插件 → 输入 /lab 开启 → 自然语言操作仪器 → 输入 /lab 关闭
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  普通对话模式（DSH 默认）                                              │
│    - 正常聊天、写代码、问答                                            │
│    - 无仪器相关功能                                                   │
└───────────────────────────│─────────────────────────────────────────┘
                            │ 用户输入 /lab
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  实验模式（dsh-lab 激活）                                              │
│    - 侧边栏自动隐藏                                                   │
│    - System Prompt 自动注入仪器/文档/工作流上下文                       │
│    - 可用斜杠命令：/devices /new /rename                               │
│    - LLM 可使用工具：scan_instruments / read_document / read_workflow  │
│                    create_workflow / update_workflow / delete_workflow │
│                    send_scpi / send_asg                               │
└───────────────────────────│─────────────────────────────────────────┘
                            │ 用户再次输入 /lab
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  普通对话模式（恢复）                                                  │
│    - 侧边栏恢复                                                       │
│    - 仪器相关功能全部休眠                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 场景与实现对照

### 场景 1：安装插件

**用户操作**：
```bash
dsh plugin --profile web add file:./dsh-lab
```

**用户看到什么**：
- 插件安装成功，但**不影响现有对话**
- 没有 `/lab` 命令以外的任何变化

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| 插件入口注册 `/lab` 元命令 | `src/index.ts` + `src/commands.ts` | ✅ 已实现 |
| 启动时清理残留注册 | `src/index.ts` | ✅ 已实现 |
| Client bundle 构建 | `tsdown.config.ts` | ✅ 已实现 |

---

### 场景 2：开启实验模式

**用户操作**：
```
/lab
```

**用户看到什么**：
- 回复："实验模式已启用。"
- 侧边栏隐藏
- 后续对话中 LLM 自动知道有哪些仪器、文档、工作流可用

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `/lab` 命令处理器：检查 registry，注册/注销 LabLocal | `src/commands.ts` | ✅ 已实现 |
| Session Projection 翻转 `active: true` | `src/projection.ts` | ✅ 已实现 |
| Client 收到推送，注入 CSS 隐藏侧边栏 | `client/client.ts` | ✅ 已实现 |
| System Prompt 自动注入上下文 | `src/context.ts` | ❌ 未实现 |
| 工具自动激活（LLM 可调用） | `src/tools.ts` | ❌ 未实现 |
| 斜杠命令自动出现（`/devices` 等） | `src/commands.ts` 扩展 | ❌ 未实现 |

**内部流程**：
```
/lab
  → commands.ts handler
    → ctx.root.registry.has(LabLocal)? → false
    → ctx.root.plugin(LabLocal)
      → LabLocal 构造函数 → ctx.reflect.provide('lab', self)
      → notify(['lab'])
      → 所有 inject 包含 'lab' 的消费者 fiber._refresh()
        → tools.ts apply() 执行 → 8 个工具注册
        → context.ts apply() 执行 → 3 个 section 注册
        → slash-commands.ts apply() 执行 → /devices /new /rename 注册
    → 返回 "实验模式已启用"
  → command/done 事件提交
  → Projection apply → active: true
  → WebSocket push → Client CSS 注入
```

---

### 场景 3：查看当前连接的仪器

**用户操作**（两种方式）：
```
方式 A：/devices
方式 B：扫描当前连接的仪器
```

**用户看到什么**：
```
当前共 2 个设备在线：
  1. DG800 Pro (Serial: DG800-XXXXX)
  2. ASG24100 (IP: 192.168.1.100)
```

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `/devices` 斜杠命令 | `src/commands.ts` 扩展 | ❌ 未实现 |
| `scan_instruments` 工具 | `src/tools.ts` | ❌ 未实现 |
| `LabService.scanInstruments()` 抽象方法 | `src/service.ts` | ❌ 未实现 |
| `LabLocal.scanInstruments()` 实现（调 Python） | `src/lab-local.ts` | ❌ 未实现 |
| Python 扫描逻辑 | `dsh_lab/scan.py` | ❌ 未实现 |
| System Prompt 自动显示仪器列表 | `src/context.ts` → `lab:instruments` | ❌ 未实现 |

**调用链路**：
```
用户: "扫描当前连接的仪器"
  → LLM 决定调用 scan_instruments 工具
  → tools.ts: lab.scanInstruments()
  → lab-local.ts: ctx.shell.run("python -m dsh_lab.scan")
  → Python: PyVISA 扫描 + ASG SDK 扫描
  → 返回设备列表
  → LLM 格式化后回复用户
```

---

### 场景 4：查阅仪器文档

**用户操作**：
```
查一下 DG 文档里关于 :SOURce 的命令
帮我看看示波器怎么设置时基
```

**用户看到什么**：
- LLM 返回文档片段，解释命令含义
- LLM 可能继续追问或执行操作

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `read_document` 工具 | `src/tools.ts` | ❌ 未实现 |
| `LabService.readDocument()` 抽象方法 | `src/service.ts` | ❌ 未实现 |
| `LabLocal.readDocument()` 实现（TypeScript 读文件） | `src/lab-local.ts` | ❌ 未实现 |
| System Prompt 显示文档索引 | `src/context.ts` → `lab:documents` | ❌ 未实现 |

**工具参数**：
```json
{
  "filename": "DG.md",
  "lines": "1004-1050"
}
```
或
```json
{
  "filename": "DHO.md",
  "section": ":TIMebase 命令子系统"
}
```

---

### 场景 5：执行预定义工作流

**用户操作**：
```
帮我执行 DG 双通道直流输出工作流
```

**用户看到什么**：
```
DG 双通道直流输出工作流执行完成。
```

**背后发生什么**（多轮工具调用）：
```
Turn 1: LLM 调用 read_workflow(name="dg_dc_output")
        → 返回工作流文件内容（含步骤说明和 SCPI 命令）

Turn 2: LLM 阅读内容，理解步骤
        → 调用 send_scpi(address="USB0::...::INSTR", command=":SOUR1:APPL:DC 100,5,2,0")
        → 返回 "SCPI 写入成功"

Turn 3: LLM 继续下一步
        → 调用 send_scpi(address="USB0::...::INSTR", command=":SOUR2:APPL:DC 100,5,2,0")
        → 返回 "SCPI 写入成功"

Turn 4: LLM 确认完成，无 tool-call → turn 结束
```

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `read_workflow` 工具 | `src/tools.ts` | ❌ 未实现 |
| `send_scpi` 工具 | `src/tools.ts` | ❌ 未实现 |
| `LabService.readWorkflow()` / `sendScpi()` | `src/service.ts` | ❌ 未实现 |
| `LabLocal.readWorkflow()` 实现（TypeScript 读文件） | `src/lab-local.ts` | ❌ 未实现 |
| `LabLocal.sendScpi()` 实现（调 Python） | `src/lab-local.ts` | ❌ 未实现 |
| Python SCPI 引擎 | `dsh_lab/scpi.py` | ❌ 未实现 |
| System Prompt 显示工作流索引 | `src/context.ts` → `lab:workflows` | ❌ 未实现 |

**工作流文件示例**（`workflows/dg_dc_output/dg_dc_output.md`）：
```yaml
---
name: DG双通道直流输出
description: 设置 DG 信号发生器两个通道输出 2V 直流电压
---

1. 配置 CH1 直流输出
   ```json
   {"address": "USB0::...::INSTR", "command": ":SOUR1:APPL:DC 100,5,2,0", "delay": 0}
   ```
   设置 CH1 输出 2V 直流电压。

2. 配置 CH2 直流输出
   ```json
   {"address": "USB0::...::INSTR", "command": ":SOUR2:APPL:DC 100,5,2,0", "delay": 0}
   ```
   设置 CH2 输出 2V 直流电压。
```

---

### 场景 6：文档驱动操作（LLM 推理）

**用户操作**：
```
调整示波器时基使屏幕显示 2 个完整周期
```

**用户看到什么**：
- LLM 自主读文档、发命令、分析数据、计算参数、执行操作

**背后发生什么**：
```
Turn 1: read_document(filename="DHO.md", lines="100-150")
        → 返回波形读取命令

Turn 2: LLM 理解命令，组装 SCPI 序列
        → send_scpi(":WAVeform:SOURce CHANnel1")
        → send_scpi(":WAVeform:MODE NORMal")
        → send_scpi(":WAVeform:FORMat ASCii")
        → send_scpi(":WAVeform:DATA?")
        → 返回波形数据

Turn 3: LLM 分析波形数据，计算周期和时基值
        → send_scpi(":TIMebase:MAIN:SCALe <计算值>")
        → 返回执行结果
```

**关键**：这个场景不需要预定义工作流，LLM 完全基于文档理解来操作。

---

### 场景 7：管理工作流

**用户操作**：
```
新建一个叫 "dg_dc_output" 的工作流，描述是"设置 DG 输出 2V 直流"
修改 dg_dc_output 工作流，把电压改成 3V
删除 dg_dc_output 工作流
```

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `create_workflow` 工具 | `src/tools.ts` | ❌ 未实现 |
| `update_workflow` 工具 | `src/tools.ts` | ❌ 未实现 |
| `delete_workflow` 工具 | `src/tools.ts` | ❌ 未实现 |
| `LabService` 对应抽象方法 | `src/service.ts` | ❌ 未实现 |
| `LabLocal` 对应方法实现（TypeScript 文件 CRUD） | `src/lab-local.ts` | ❌ 未实现 |

---

### 场景 8：重命名设备

**用户操作**：
```
/rename 1 我的DG信号源
```

**用户看到什么**：
```
设备 1 已重命名为"我的DG信号源"。
```

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `/rename` 斜杠命令 | `src/commands.ts` 扩展 | ❌ 未实现 |
| `LabService.renameDevice()` 抽象方法 | `src/service.ts` | ❌ 未实现 |
| `LabLocal.renameDevice()` 实现（TypeScript 读写 JSON） | `src/lab-local.ts` | ❌ 未实现 |

---

### 场景 9：直接发 SCPI/ASG 命令

**用户操作**：
```
给 DG 发一条 *RST 复位命令
调用 ASG_SetWaveform 设置波形为正弦波
```

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `send_scpi` 工具 | `src/tools.ts` | ❌ 未实现 |
| `send_asg` 工具 | `src/tools.ts` | ❌ 未实现 |
| `LabService.sendScpi()` / `sendAsg()` | `src/service.ts` | ❌ 未实现 |
| `LabLocal` 对应方法实现 | `src/lab-local.ts` | ❌ 未实现 |
| Python SCPI 引擎 | `dsh_lab/scpi.py` | ❌ 未实现 |
| Python ASG 引擎 | `dsh_lab/asg.py` | ❌ 未实现 |

---

### 场景 10：关闭实验模式

**用户操作**：
```
/lab
```

**用户看到什么**：
- 回复："实验模式已关闭。"
- 侧边栏恢复
- 后续对话不再有仪器相关功能

**对应实现**：
| 组件 | 文件 | 状态 |
|---|---|---|
| `/lab` 命令处理器 | `src/commands.ts` | ✅ 已实现 |
| Session Projection 翻转 `active: false` | `src/projection.ts` | ✅ 已实现 |
| Client 收到推送，移除 CSS | `client/client.ts` | ✅ 已实现 |
| 工具自动注销（LLM 不可调用） | Cordis 自动 dispose | 依赖中间层 |
| System Prompt section 自动卸载 | Cordis 自动 dispose | 依赖中间层 |
| 斜杠命令自动消失 | Cordis 自动 dispose | 依赖中间层 |

---

## 4. 设备清单管理

### 4.1 核心概念

设备清单（`devices_inventory.json`）是插件的**设备记忆**——记录用户见过哪些设备、给它们起了什么名字、当前是否在线。

**设计哲学**（源自 labagent 项目）：
- **序列号是设备的唯一身份**：不管连接地址怎么变，同一台设备的序列号不变
- **用户自定义名字与硬件解耦**：名字存在清单里，不依赖连接状态
- **扫描是增量合并**：新扫描结果与旧清单合并，保留用户起的名字
- **离线设备保留**：断开的设备仍留在清单中，只是连接信息清空，下次连上自动恢复

### 4.2 设备清单 JSON 结构

```json
{
  "DG8R264801226": {
    "model": "DG852 Pro",
    "address": "TCPIP::169.254.112.68::INSTR",
    "local_ip": "",
    "local_mac": "",
    "idn": "RIGOL TECHNOLOGIES,DG852 Pro,DG8R264801226,00.02.02.00.03",
    "name": "磁场控制源"
  },
  "DHO8A272405406": {
    "model": "DHO814",
    "address": "TCPIP::169.254.112.67::INSTR",
    "local_ip": "",
    "local_mac": "",
    "idn": "RIGOL TECHNOLOGIES,DHO814,DHO8A272405406,00.01.03",
    "name": ""
  },
  "ASG241002324070090": {
    "model": "ASG24100",
    "address": "",
    "local_ip": "169.254.62.12",
    "local_mac": "C8-53-09-C4-C0-08",
    "idn": "",
    "name": "时序"
  }
}
```

**字段说明**：

| 字段 | 来源 | 说明 |
|---|---|---|
| `model` | 扫描时从 *IDN? 或 ASG SDK 获取 | 设备型号 |
| `address` | PyVISA 扫描 | VISA 资源地址（SCPI 设备） |
| `local_ip` | ASG SDK 扫描 | 上位机 IP（ASG 设备） |
| `local_mac` | ASG SDK 扫描 | 上位机 MAC（ASG 设备） |
| `idn` | SCPI *IDN? 查询 | 完整身份字符串（SCPI 设备） |
| `name` | 用户通过 `/rename` 设置 | 用户自定义友好名称 |

**键（Key）**：设备序列号（SCPI）或 `asgDev_name + asgDev_id`（ASG）

### 4.3 扫描合并逻辑

```
扫描新设备列表
  │
  ├─ 新设备（序列号不在旧清单中）
  │   → 添加到清单，name = ""
  │
  ├─ 已知设备（序列号在旧清单中）
  │   → 更新连接信息（address/ip/mac/idn）
  │   → 保留旧清单中的 name（用户起的名字不丢）
  │
  └─ 离线设备（序列号在旧清单但不在新扫描中）
      → 保留在清单中
      → 清空连接信息（address/ip/mac/idn 设为 ""）
      → 保留 name
```

**效果**：
- 用户给 DG 起名"磁场控制源"，断电重启后名字还在
- 设备断开连接，清单里仍显示，标记为离线
- 设备换了一个 USB 口，地址变了，但序列号匹配，名字保留

### 4.4 设备状态文件（预留）

labagent 还支持每个设备一个独立的状态文件（`devices/<序列号>.json`），用于存储设备特定的运行状态。当前为空对象 `{}`，但架构预留了扩展空间。

dsh-lab 可以借鉴这个思想，但**不急于实现**——当前阶段设备清单 JSON 足够。

### 4.5 用户视角的设备管理

```
用户: /devices
插件: 已连接设备 (2):
        1. 磁场控制源 (DG852 Pro) [TCPIP::169.254.112.68::INSTR]
        2. DHO814 [TCPIP::169.254.112.67::INSTR]

用户: /rename 1 我的DG
插件: 设备 1 已重命名为"我的DG"。

用户: /devices
插件: 已连接设备 (2):
        1. 我的DG (DG852 Pro) [TCPIP::169.254.112.68::INSTR]
        2. DHO814 [TCPIP::169.254.112.67::INSTR]

（设备断电重启后）

用户: /devices
插件: 已连接设备 (1):
        1. DHO814 [TCPIP::169.254.112.67::INSTR]
  离线设备 (1):
        1. 我的DG (DG852 Pro) [离线]
```

### 4.6 对应实现

| 组件 | 文件 | 状态 |
|---|---|---|
| 设备清单 JSON 读写 | `src/lab-local.ts`（TypeScript） | ❌ 未实现 |
| 扫描合并逻辑 | `dsh_lab/scan.py`（硬件扫描） | ❌ 未实现 |
| `scan_instruments` 工具 | `src/tools.ts` | ❌ 未实现 |
| `rename_device` 工具/命令 | `src/tools.ts` + `src/commands.ts` | ❌ 未实现 |
| System Prompt 显示设备列表 | `src/context.ts` → `lab:instruments` | ❌ 未实现 |

---

## 5. 功能优先级矩阵

| 优先级 | 场景 | 用户价值 | 实现复杂度 |
|---|---|---|---|
| **P0** | `/lab` 开关 + 侧边栏隐藏 | 基础开关能力 | ✅ 已完成 |
| **P1** | `scan_instruments` + `/devices` | 知道有哪些仪器 | 中 |
| **P1** | 设备清单 JSON + 扫描合并 | 设备记忆、用户命名 | 中 |
| **P1** | `read_document` | LLM 理解命令的基础 | 低（纯文件读取） |
| **P1** | `send_scpi` | 核心仪器控制能力 | 高（需 Python + PyVISA） |
| **P1** | `read_workflow` | 执行预定义流程 | 低（纯文件读取） |
| **P1** | System Prompt 上下文注入 | LLM 无需额外调用即可知道资源 | 低 |
| **P2** | `create/update/delete_workflow` | 工作流管理 | 低 |
| **P2** | `send_asg` | ASG 设备控制 | 高（需 ASG SDK） |
| **P2** | `/rename` 设备重命名 | 设备管理 | 低 |
| **P2** | Client 仪器面板 UI | 可视化操作 | 高 |

---

## 6. TypeScript 与 Python 的边界

### 分工原则

| 层 | 职责 | 实现 |
|---|---|---|
| **TypeScript** | 文件 I/O、JSON 解析、YAML frontmatter、System Prompt 渲染 | Node.js 原生 `fs` + `js-yaml` |
| **Python** | 硬件通信（需要 PyVISA / asglib） | 一次性子进程 |

### 各操作的归属

| 操作 | TypeScript 直接处理 | 需要 Python |
|---|---|---|
| `read_document` | ✅ 读文件 + 按行切片 | ❌ |
| `read_workflow` | ✅ 读文件 | ❌ |
| `create_workflow` | ✅ 写文件 | ❌ |
| `update_workflow` | ✅ 读 + 改 + 写 | ❌ |
| `delete_workflow` | ✅ 删文件夹 | ❌ |
| `list_workflows` | ✅ 读目录 + 解析 frontmatter | ❌ |
| 设备清单读写 | ✅ JSON 读写 | ❌ |
| System Prompt 渲染 | ✅ 读 JSON/md → 格式化 | ❌ |
| `rename_device` | ✅ 读 JSON → 改 name → 写回 | ❌ |
| `scan_instruments` | ❌ | ✅ PyVISA + asglib |
| `send_scpi` | ❌ | ✅ PyVISA |
| `send_asg` | ❌ | ✅ asglib |

### 为什么这样分

1. **System Prompt 上下文注入更快**：每步渲染时直接读 JSON，不启动子进程
2. **文件操作零开销**：读文档、管理工作流不需要跨进程通信
3. **Python 只负责硬件**：职责单一，`dsh_lab/*` 只保留三个模块
4. **可独立测试**：TypeScript 层可以脱离 Python 单独跑（用 stub 数据）

### 最终 Python 模块

```
dsh_lab/
├── __main__.py   # 一次性入口路由
├── scan.py       # 设备扫描（PyVISA + asglib）
├── scpi.py       # SCPI 通信（PyVISA）
└── asg.py        # ASG SDK 调用（asglib）
```

**不需要**：`docs.py`、`workflow.py`、`inventory.py`（TypeScript 直接处理）

---

## 7. 推荐实现顺序

### 阶段 A：纯 TypeScript，无需 Python/硬件（可立即开发）

```
1. 扩展 src/service.ts — 补充所有抽象方法 + Request/Result 类型
2. 新建 src/tools.ts — 注册 8 个工具
3. 新建 src/context.ts — 注册 3 个 system prompt section
4. 扩展 src/commands.ts — 补充 /devices /new /rename
5. 扩展 src/lab-local.ts — 文件操作直接实现，硬件调用用 stub
```

**验证**：`/lab` 开启后，LLM 能看到工具列表和 system prompt 上下文，文档/工作流/设备清单操作全部可用，硬件调用返回 stub 数据。

### 阶段 B：Python 硬件引擎（需要 Python 环境）

```
6. 实现 dsh_lab/__main__.py — 一次性入口路由
7. 实现 dsh_lab/scan.py — 设备扫描（需 PyVISA）
8. 实现 dsh_lab/scpi.py — SCPI 通信（需 PyVISA）
9. 实现 dsh_lab/asg.py — ASG SDK 调用（需厂商 DLL）
```

**验证**：每个模块可独立测试 `python -m dsh_lab.<module> '{...}'`。

### 阶段 C：端到端联调（需要仪器硬件）

```
10. lab-local.ts 中 scan/send_scpi/send_asg 从 stub 切换到真实 Python 调用
11. 连接真实仪器，验证 scan → read_doc → send_scpi 链路
12. 验证工作流执行（read_workflow → 多轮 send_scpi）
13. 验证文档驱动操作（自然语言 → 读文档 → 推理 → 执行）
```

---

## 8. 工具调用决策树（LLM 视角）

```
用户请求
  │
  ├─ "扫描/查看仪器" ──────────────→ scan_instruments
  ├─ "读文档/查命令" ──────────────→ read_document(filename, lines?, section?)
  ├─ "列出工作流" ────────────────→ （system prompt 已显示索引）
  ├─ "查看/执行工作流" ───────────→ read_workflow(name)
  │                                  → LLM 阅读内容
  │                                  → send_scpi / send_asg（按步骤执行）
  │                                  → read_document（如需查文档确认）
  ├─ "创建工作流" ────────────────→ create_workflow(folder_name, name?, description?)
  ├─ "修改工作流" ────────────────→ update_workflow(name, ...)
  ├─ "删除工作流" ────────────────→ delete_workflow(name)
  ├─ "发 SCPI 命令" ──────────────→ send_scpi(address, command, delay?)
  └─ "发 ASG 命令" ───────────────→ send_asg(func, args?, kwargs?, delay?)
```

---

## 9. 关键设计决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 工作流执行方式 | LLM 阅读后多轮工具调用 | DSH Agent Loop 天然支持，无需图引擎 |
| Python 进程模式 | 一次性（每次调用 spawn 新进程） | 低频操作，简单无泄漏 |
| 仪器连接方式 | 每次新建/关闭 VISA 连接 | 简单，高频场景再优化 |
| 上下文注入 | system prompt section 每步渲染 | LLM 无需额外调用即可知道资源 |
| 工具并发控制 | exclusive（串行屏障） | 硬件操作不能并行 |
| 服务开关 | 动态注册/注销（`inject = ['lab']`） | Cordis 自动管理消费者生命周期 |

---

## 10. 与原版 Lab 的对比

| 原版 lab | DSH 插件版 |
|---|---|
| LangGraph 图引擎执行工作流 | LLM 多轮工具调用执行工作流 |
| `Script/commands/` 注册器 | `ctx.commands.register()` |
| `terminal_cli.py` 本地执行 | Provider 内 Python 子进程执行 |
| `ChatPanel.tsx` 检查 `/` 前缀 | Input Machine 自动检测 `/` 触发 |
| `to_work`（模式切换） | `/lab` 元命令：`ctx.plugin(LabLocal)` |
| 命令可用性由注册器判断 | 消费者 `inject = ['lab']` 自动管理 |
| 需要 `isEnabled()` 检查 | 零检查 |
