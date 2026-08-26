# dsh-lab 工具集文档 v4（动态服务注册版）

> 本文档详细描述 dsh-lab 插件提供的所有工具，包括参数、返回值、执行方式和调用示例。
> **v4 变更**：`/lab` 改为动态服务注册/注销模式。消费者声明 `inject = ['lab']` 即可自动激活/休眠，移除所有 `toggle()`/`isEnabled()` 方法和 `isEnabled()` 检查代码。
> 所有工具均为原子操作，LLM 通过多轮工具调用来执行工作流。
---

## 1. 三角色与工具

### 1.1 角色回顾

参考[官方实践教程](https://deepseek-harness.github.io/deepseek-harness/develop/practice/)与架构文档 §5，dsh-lab 按三种角色拆分：

```
Service Definition  →  Service Provider  →  Consumer
(定义接口+类型)        (实现具体逻辑)       (暴露为模型工具)
```

| 角色 | 对应代码 | 职责 |
|---|---|---|
| **Service Definition** | `src/service.ts` | 定义 `LabService` 抽象类 + 全部 Request/Result 类型 |
| **Service Provider** | `src/lab-local.ts` | 实现 `LabLocal`：调用 Python 执行 SCPI/ASG |
| **Consumer（工具）** | `src/tools.ts` | 把服务方法暴露为工具，声明 `inject = ['tools', 'lab']` |
| **Consumer（上下文）** | `src/context.ts` | 注入 system prompt section，声明 `inject = ['systemPrompt', 'lab']` |
| **Consumer（元命令）** | `src/commands.ts` | 注册 `/lab` 命令，控制服务注册/注销 |

依赖方向：`Consumer → Service Definition ← Service Provider`，Consumer 与 Provider **互不依赖**。

### 1.2 工具 = Consumer

> **v4 修正**：工具声明 `inject = ['tools', 'lab']`。lab 服务不存在时，`apply()` 不执行，工具自然不可用。无需 `isEnabled()` 检查。

工具注册在 `src/tools.ts`，只依赖 `LabService` 接口：

```ts
// src/tools.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-lab-tools'
export const inject = ['tools', 'lab']   // 声明依赖：工具运行时 + lab 服务

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'send_scpi',
    description: '向仪器发送单条 SCPI 命令。',
    parameters: {
      address: { type: 'string', description: 'VISA 资源地址', required: true },
      command: { type: 'string', description: 'SCPI 命令', required: true },
      delay: { type: 'number', description: '执行后延迟（秒），默认 0' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      // 只调接口，不管底层是本地 Python 还是远程仪器
      const result = await ctx.lab.sendScpi(args)
      return result.text
    },
  }))
}
```

**要点**：
- `inject` 声明 `lab` 后，`ctx.lab` 在 `apply` 时已就绪（服务未就绪则插件等待）
- 工具**不知道** Python 模块名、子进程参数、VISA 连接细节——那是 Provider 的事
- 工具**不需要检查** `isEnabled()`——服务不存在时，`apply()` 根本不会执行
- 替换 Provider（如远程控制）时，`src/tools.ts` 一行不用改

### 1.3 工具 ↔ LabService 方法映射

| 工具名 | 服务方法（抽象） | 类型 | 说明 |
|---|---|---|---|
| `scan_instruments` | `scanInstruments()` | exclusive | 重新扫描仪器（刷新库存） |
| `read_document` | `readDocument(request)` | parallel | 按行区间/章节读仪器文档 |
| `read_workflow` | `readWorkflow(request)` | parallel | 读工作流文件 |
| `create_workflow` | `createWorkflow(request)` | exclusive | 新建工作流 |
| `update_workflow` | `updateWorkflow(request)` | exclusive | 修改工作流 |
| `delete_workflow` | `deleteWorkflow(request)` | exclusive | 删除工作流 |
| `send_scpi` | `sendScpi(request)` | exclusive | 发单条 SCPI 命令 |
| `send_asg` | `sendAsg(request)` | exclusive | 发单条 ASG SDK 调用 |

### 1.3b 命令 ↔ LabService 方法映射

| 命令 | 类型 | 说明 |
|---|---|---|
| `/lab` | 元命令 | 调用 `ctx.plugin(LabLocal)` 注册服务，或 `ctx.registry.delete(LabLocal)` 注销服务 |
| `/devices` | Consumer 自动注册 | 调用 `scanInstruments()`，声明 `inject = ['commands', 'lab']` |
| `/new` | Consumer 自动注册 | 新建会话，声明 `inject = ['commands', 'lab']` |
| `/rename` | Consumer 自动注册 | 调用 `renameDevice()`，声明 `inject = ['commands', 'lab']` |

**并发控制**：`exclusive` = 不声明 `isConcurrencySafe`（或返回 `false`），成为串行屏障；`parallel` = `isConcurrencySafe: () => true`，可加入并行组。该元数据对模型不可见，由 agent loop 调度。

### 1.4 Service Definition 拥有 Request/Result 类型

```ts
// src/service.ts（节选：工具用到的抽象方法签名）
import { Service } from '@deepseek-ai/cordis'

export abstract class LabService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'lab')
  }

  // 工具用到的抽象方法
  abstract scanInstruments(): Promise<ScanInstrumentsResult>
  abstract readDocument(request: ReadDocumentRequest): Promise<string>
  abstract readWorkflow(request: ReadWorkflowRequest): Promise<string>
  abstract createWorkflow(request: CreateWorkflowRequest): Promise<string>
  abstract updateWorkflow(request: UpdateWorkflowRequest): Promise<string>
  abstract deleteWorkflow(request: DeleteWorkflowRequest): Promise<string>
  abstract sendScpi(request: SendScpiRequest): Promise<SendScpiResult>
  abstract sendAsg(request: SendAsgRequest): Promise<SendAsgResult>

  // 命令用到的抽象方法
  abstract renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult>

  // System Prompt section 用到的抽象方法
  abstract listWorkflows(): Promise<Array<{ name: string; description: string }>>
}
```

Request/Result 类型（如 `SendScpiRequest`、`SendScpiResult`）与工具参数一一对应，详细字段见下文各工具章节。工具的 `parameters` 只是模型的 JSON Schema 视图；类型权威在 Service Definition。

---

## 2. 工具总览

| 工具名 | 服务方法 | 类型 | 分类 | 说明 |
|---|---|---|---|---|
| `scan_instruments` | `scanInstruments()` | exclusive | 仪器发现 | 扫描 VISA + ASG 设备，更新库存 |
| `read_document` | `readDocument()` | parallel | 文档操作 | 按行区间或章节读取仪器文档 |
| `read_workflow` | `readWorkflow()` | parallel | 工作流管理 | 读工作流文件（LLM 阅读后决定执行） |
| `create_workflow` | `createWorkflow()` | exclusive | 工作流管理 | 新建工作流 |
| `update_workflow` | `updateWorkflow()` | exclusive | 工作流管理 | 修改工作流 |
| `delete_workflow` | `deleteWorkflow()` | exclusive | 工作流管理 | 删除工作流 |
| `send_scpi` | `sendScpi()` | exclusive | 仪器控制 | 发单条 SCPI 命令 |
| `send_asg` | `sendAsg()` | exclusive | 仪器控制 | 发单条 ASG SDK 调用 |

**类型说明**：
- `exclusive`：串行屏障，一次只能执行一个（涉及硬件操作，不声明 `isConcurrencySafe`）
- `parallel`：可并行执行（只读操作，`isConcurrencySafe: () => true`）

---

## 3. System Prompt 上下文注入

> **v4 修正**：消费者声明 `inject = ['systemPrompt', 'lab']`，lab 服务注册后自动激活，无需 `isEnabled()` 检查。

除了工具外，插件通过 `ctx.systemPrompt.section()` 每步自动注入上下文（Consumer：`src/context.ts`，同样只走 `ctx.lab` 接口）：

| Section | order | 内容 | 刷新时机 |
|---|---|---|---|
| `lab:instruments` | 200 | 当前连接的仪器列表 + 状态 | 每步 |
| `lab:documents` | 201 | 可用仪器文档索引 | 固定 |
| `lab:workflows` | 202 | 可用工作流列表 + frontmatter | 每步 |

```ts
// src/context.ts — lab 服务注册后自动生效，无需检查
ctx.systemPrompt.section({
  name: 'lab:instruments',
  order: 200,
  text: async () => {
    // 能走到这里，说明 lab 服务一定存在
    const result = await ctx.lab.scanInstruments()
    if (!result.devices.length) return ''
    return `## 当前连接的仪器\n${formatInventory(result.devices)}`
  },
})
```

**效果**：LLM 无需额外调用即可知道有哪些仪器/文档/工作流可用。

---

## 4. 仪器发现类工具

### scan_instruments

扫描 VISA (PyVISA) 与 ASG (asglib SDK) 仪器设备，更新设备库存。

| 属性 | 值 |
|---|---|
| **类型** | exclusive |
| **服务方法** | `scanInstruments(): Promise<ScanInstrumentsResult>` |
| **超时** | 30 秒 |
| **沙箱影响** | 读操作，通常允许 |

**参数**：无

**返回类型**（`ScanInstrumentsResult`）：

```ts
interface ScanInstrumentsResult {
  devices: Array<{ name: string; model: string; serial: string; kind: 'visa' | 'asg' }>
  text: string   // 给 LLM 的可读文本
}
```

**返回示例**：

```
当前有 2 个设备在线：
  1. DG800 Pro (Serial: DG800-XXXXX)
  2. ASG24100 (IP: 192.168.1.100)
```

或无设备：

```
当前没有检测到任何已连接的仪器设备。
```

**调用示例**：

```
Agent: 请扫描当前连接的仪器
→ scan_instruments()
→ "当前有 2 个设备在线：\n  1. DG800 Pro\n  2. ASG24100"
```

**错误处理**：
- PyVISA 未安装 → 返回错误信息，提示 `pip install pyvisa pyvisa-py`
- ASG SDK 未安装 → 跳过 ASG 扫描，仅返回 VISA 设备
- 超时 → 返回超时提示

**Provider 实现要点**（`src/lab-local.ts`）：内部通过 `ctx.shell.run(ctx.shell.resolve({ command: 'python -m dsh_lab.scan', timeoutMs: 30000 }))` 执行，解析 stdout 为 `ScanInstrumentsResult`。

---

## 5. 文档操作类工具

### read_document

按行区间或章节读取仪器文档内容。**LLM 通过阅读文档理解 SCPI/ASG 命令体系。**

| 属性 | 值 |
|---|---|
| **类型** | parallel（`isConcurrencySafe: () => true`） |
| **服务方法** | `readDocument(request: ReadDocumentRequest): Promise<string>` |
| **超时** | 10 秒 |
| **沙箱影响** | 读操作 |

**参数**（`ReadDocumentRequest`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `filename` | string | 是 | 文档文件名（DG.md / DHO.md / ASG24100.md） |
| `lines` | string | 否 | 行区间（如 `23-36`） |
| `section` | string | 否 | 章节名（如 `:SOURce 命令子系统`） |

**返回值**：

```
[DG.md:23-36]
### :COUNter:AVERage:ALL?

**语法**: `:COUNter:AVERage:ALL?`
**描述**: 查询频率计测量的统计结果。
**参数**: 无
**返回格式**: 返回一个逗号分隔的字符串。 部分...
```

**可用文档**：

| 文件名 | 内容 | 行数 |
|---|---|---|
| `DG.md` | DG800/DG900 SCPI 命令参考 | ~2987 行 |
| `DHO.md` | DHO800/DHO900 SCPI 命令参考 | ~2500 行 |
| `ASG24100.md` | ASG24100 SDK 接口参考 + 错误码表 | ~800 行 |

**调用示例**：

```
Agent: 查一下 DG 文档里关于 :SOURce 的命令
→ read_document(filename="DG.md", lines="1004-1050")
→ 返回 SCPI 命令片段
```

**错误处理**：
- 文件不存在 → `错误：文件不存在：DG.md`
- 行区间格式错误 → `错误：行区间格式错误，应为 23-36`
- 行号越界 → 自动截断到有效范围

---

## 6. 工作流管理类工具

### read_workflow

读取工作流文件内容。**LLM 阅读工作流步骤后，自行决定如何执行（调用 send_scpi/send_asg）。**

| 属性 | 值 |
|---|---|
| **类型** | parallel（`isConcurrencySafe: () => true`） |
| **服务方法** | `readWorkflow(request: ReadWorkflowRequest): Promise<string>` |
| **超时** | 10 秒 |
| **沙箱影响** | 读操作 |

**参数**（`ReadWorkflowRequest`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 | 工作流名称（文件夹名，如 `dg_dc_output`） |

**返回值**：工作流文件完整内容（YAML frontmatter + Markdown 步骤）

```yaml
---
name: DG双通道直流输出
description: 设置 DG 信号发生器两个通道输出 2V 直流电压
---

1. 配置 CH1 直流输出
   ```json
   {"address": "", "command": ":SOUR1:APPL:DC 100,5,2,0", "delay": 0}
   ```
   设置 CH1 输出 2V 直流电压。
2. 配置 CH2 直流输出
   ```json
   {"address": "", "command": ":SOUR2:APPL:DC 100,5,2,0", "delay": 0}
   ```
   设置 CH2 输出 2V 直流电压。
```

**错误处理**：
- 工作流不存在 → `错误：找不到工作流：dg_dc_output`

**调用示例**：

```
Agent: 帮我执行 DG 双通道直流输出工作流
→ read_workflow(name="dg_dc_output")
→ 返回工作流文件内容；LLM 阅读后决定：按步骤调用 send_scpi
```

---

### create_workflow

新建工作流文件。

| 属性 | 值 |
|---|---|
| **类型** | exclusive |
| **服务方法** | `createWorkflow(request: CreateWorkflowRequest): Promise<string>` |
| **超时** | 10 秒 |
| **沙箱影响** | **写操作**，可能需要 `workspace-write` 授权 |

**参数**（`CreateWorkflowRequest`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `folder_name` | string | 是 | 文件夹名（只保留字母数字、下划线、连字符、中文） |
| `name` | string | 否 | 工作流显示名称（默认为 folder_name） |
| `description` | string | 否 | 工作流描述 |

**返回值**：

```
已创建工作流：dg_dc_output
路径：Workflow/dg_dc_output/dg_dc_output.md
```

**错误处理**：
- 文件夹名无效 → `错误：文件夹名无效`
- 工作流已存在 → `错误：dg_dc_output 已存在`
- 沙箱拒绝写操作 → `[sandbox: file access denied under read-only mode]`

---

### update_workflow

修改工作流文件。

| 属性 | 值 |
|---|---|
| **类型** | exclusive |
| **服务方法** | `updateWorkflow(request: UpdateWorkflowRequest): Promise<string>` |
| **超时** | 10 秒 |
| **沙箱影响** | **写操作**，可能需要 `workspace-write` 授权 |

**参数**（`UpdateWorkflowRequest`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 | 工作流名称 |
| `frontmatter` | object | 否 | 更新后的 frontmatter 字段 |
| `section_title` | string | 否 | 要替换的章节标题 |
| `section_content` | string | 否 | 替换后的章节内容 |
| `append` | string | 否 | 追加到正文末尾的内容 |

**返回值**：

```
已更新工作流：dg_dc_output
```

**错误处理**：
- 工作流不存在 → `错误：找不到工作流：dg_dc_output`

---

### delete_workflow

删除工作流文件。

| 属性 | 值 |
|---|---|
| **类型** | exclusive |
| **服务方法** | `deleteWorkflow(request: DeleteWorkflowRequest): Promise<string>` |
| **超时** | 10 秒 |
| **沙箱影响** | **写操作**，可能需要 `workspace-write` 授权 |

**参数**（`DeleteWorkflowRequest`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 | 工作流名称 |

**返回值**：

```
已删除工作流：dg_dc_output
```

**错误处理**：
- 工作流不存在 → `错误：找不到工作流：dg_dc_output`

---

## 7. 仪器控制类工具

### send_scpi

向仪器发送单条 SCPI 命令。**用于执行工作流中的单个步骤。**

| 属性 | 值 |
|---|---|
| **类型** | exclusive |
| **服务方法** | `sendScpi(request: SendScpiRequest): Promise<SendScpiResult>` |
| **超时** | 30 秒 |
| **沙箱影响** | 仪器通信（通常不受限） |

**参数**（`SendScpiRequest`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `address` | string | 是 | VISA 资源地址（如 `USB0::0x1234::0x5678::DG800-XXXXX::INSTR`） |
| `command` | string | 是 | SCPI 命令（如 `:SOUR1:APPL:DC 100,5,2,0`） |
| `delay` | number | 否 | 执行后延迟（秒），默认 0 |

**返回类型**（`SendScpiResult`）：

```ts
interface SendScpiResult {
  ok: boolean
  text: string   // 写入成功提示或查询结果
}
```

**返回值**：

```
SCPI 写入成功: :SOUR1:APPL:DC 100,5,2,0
```

或查询返回：

```
[:SOUR1:APPL:DC?] -> +2.000000E+00
```

**错误处理**：
- 连接不存在 → 自动创建新连接
- 连接断开 → `错误：VI_ERROR_CONN_LOST: 连接已断开`
- 超时 → `错误：超时`

**调用示例**：

```
Agent: 给 DG 发一条 *RST 复位命令
→ send_scpi(address="USB0::...::INSTR", command="*RST")
→ "SCPI 写入成功: *RST"
```

---

### send_asg

向 ASG 设备发送单条 SDK 调用。**用于执行工作流中的单个步骤。**

| 属性 | 值 |
|---|---|
| **类型** | exclusive |
| **服务方法** | `sendAsg(request: SendAsgRequest): Promise<SendAsgResult>` |
| **超时** | 30 秒 |
| **沙箱影响** | 仪器通信（通常不受限） |

**参数**（`SendAsgRequest`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `func` | string | 是 | SDK 函数名（如 `ASG_SetWaveform`） |
| `args` | array | 否 | 位置参数 |
| `kwargs` | object | 否 | 关键字参数 |
| `delay` | number | 否 | 执行后延迟（秒），默认 0 |

**返回类型**（`SendAsgResult`）：

```ts
interface SendAsgResult {
  ok: boolean
  text: string   // 调用成功提示或错误信息
}
```

**`/rename` 命令用到的类型**：

```ts
interface RenameDeviceRequest {
  id: string     // 设备编号或序列号
  name: string   // 新名称
}
interface RenameDeviceResult {
  ok: boolean
  text: string
}
```

**返回值**：

```
ASG 调用成功: ASG_SetWaveform -> {"result": 1, "count": 1}
```

**错误处理**：
- SDK 未初始化 → 自动调用 ASG_Init()
- 函数不存在 → `错误：函数不存在: ASG_Foo`
- 调用失败 → `错误：ASG error code: -1`

---

## 8. 工具调用决策树

```
用户请求
  │
  ├─ "扫描/查看仪器" ──────────────→ scan_instruments
  ├─ "读文档/查命令" ──────────────→ read_document(filename, lines?, section?)
  ├─ "列出工作流" ────────────────→ read_workflow(name)（system prompt 已显示索引）
  ├─ "查看工作流" ────────────────→ read_workflow(name)
  ├─ "执行工作流" ────────────────→ read_workflow(name)
  │                                │
  │                                ├─ LLM 阅读内容
  │                                ├─ send_scpi / send_asg（按步骤执行）
  │                                ├─ read_document（如需查文档确认）
  │                                ├─ ... 直至完成
  ├─ "创建工作流" ────────────────→ create_workflow(folder_name, name?, description?)
  ├─ "修改工作流" ────────────────→ update_workflow(name, ...)
  ├─ "删除工作流" ────────────────→ delete_workflow(name)
  ├─ "发 SCPI 命令" ──────────────→ send_scpi(address, command, delay?)
  └─ "发 ASG 命令" ───────────────→ send_asg(func, args?, kwargs?, delay?)
```

---

## 9. 工作流执行示例

### 执行预定义工作流

```
用户: "帮我执行 DG 双通道直流输出工作流"

DSH Agent turn 1:
  → read_workflow(name="dg_dc_output")
  → 返回工作流文件内容；LLM 理解步骤

DSH Agent turn 2:
  → send_scpi(address="", command=":SOUR1:APPL:DC 100,5,2,0")
  → 返回 "SCPI 写入成功"

DSH Agent turn 3:
  → send_scpi(address="", command=":SOUR2:APPL:DC 100,5,2,0")
  → 返回 "SCPI 写入成功"

DSH Agent turn 4:
  → LLM 确认所有步骤完成；无 tool-call → turn 结束
  → 回复："DG 双通道直流输出工作流执行完成"
```

### 文档驱动操作（含 LLM 推理）

```
用户: "调整示波器时基使屏幕显示 2 个完整周期"

DSH Agent turn 1:
  → read_document(filename="DHO.md", lines="100-150")
  → 返回波形读取命令

DSH Agent turn 2:
  → LLM 理解命令，组装 SCPI 序列
  → send_scpi(address="", command=":WAVeform:SOURce CHANnel1")
  → send_scpi(address="", command=":WAVeform:MODE NORMal")
  → send_scpi(address="", command=":WAVeform:FORMat ASCii")
  → send_scpi(address="", command=":WAVeform:DATA?")
  → 返回波形数据

DSH Agent turn 3:
  → LLM 分析波形数据，计算周期和时基值
  → send_scpi(address="", command=":TIMebase:MAIN:SCALe <计算值>")
  → 返回执行结果

DSH Agent turn 4:
  → LLM 确认完成；无 tool-call → turn 结束
  → 回复用户
```

---

## 10. 工具参数定义汇总（defineTool parameters）

以下为 `src/tools.ts` 中各工具的 `defineTool` 参数定义（等价于 Service Definition 中 Request 类型的模型视图）：

```ts
// 与 src/service.ts 的 Request 类型一一对应
const toolParameters = {
  scan_instruments: {
    // 无参数
  },
  read_document: {
    filename: { type: 'string', description: '文档文件名（DG.md/DHO.md/ASG24100.md）', required: true },
    lines: { type: 'string', description: '行区间，如 23-36' },
    section: { type: 'string', description: '章节名，如 :SOURce 命令子系统' },
  },
  read_workflow: {
    name: { type: 'string', description: '工作流名称', required: true },
  },
  create_workflow: {
    folder_name: { type: 'string', description: '文件夹名', required: true },
    name: { type: 'string', description: '显示名称' },
    description: { type: 'string', description: '工作流描述' },
  },
  update_workflow: {
    name: { type: 'string', required: true },
    frontmatter: { type: 'object', additionalProperties: true },
    section_title: { type: 'string' },
    section_content: { type: 'string' },
    append: { type: 'string' },
  },
  delete_workflow: {
    name: { type: 'string', required: true },
  },
  send_scpi: {
    address: { type: 'string', description: 'VISA 资源地址', required: true },
    command: { type: 'string', description: 'SCPI 命令', required: true },
    delay: { type: 'number', description: '执行后延迟（秒）' },
  },
  send_asg: {
    func: { type: 'string', description: 'SDK 函数名', required: true },
    args: { type: 'array', items: { type: 'json' } },
    kwargs: { type: 'object', additionalProperties: true },
    delay: { type: 'number', description: '执行后延迟（秒）' },
  },
}
```

**类型权威声明**：上述 schema 仅用于模型参数校验与展示；真正的类型检查以 `src/service.ts` 的 `*Request`/`*Result` 接口为准，二者在 `src/tools.ts` 中通过 `ctx.lab` 调用点收敛。

---

## 11. 错误码对照

| 错误码 | 来源 | 含义 | 处理 |
|---|---|---|---|
| `VI_ERROR_CONN_LOST` | PyVISA | 仪器连接断开 | 检查线路/电源，重新 scan |
| `VI_ERROR_TMO` | PyVISA | 通信超时 | 检查地址/总线，重试 |
| `VI_ERROR_RSRC_NFOUND` | PyVISA | 资源未找到 | 重新 scan_instruments |
| `ASG_ERR_INIT` | asglib | SDK 初始化失败 | 检查驱动/DLL 安装 |
| `ASG_ERR_CONNECT` | asglib | 连接失败 | 检查网络/IP 地址 |
| `FILE_NOT_FOUND` | Python | 文件不存在 | 检查文件名 |
| `SANDBOX_DENIED` | DSH | 沙箱拒绝写操作 | 提示用户授权升级 |

**归属说明**：错误码的识别与包装发生在 **Service Provider**（`src/lab-local.ts`）内，工具（Consumer）只透传 `SendScpiResult.text` / `SendAsgResult.text` 中的可读信息。
