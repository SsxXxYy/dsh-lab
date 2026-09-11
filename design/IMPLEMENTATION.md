# 实现清单 — 中间层设计

---

## 1. 总体架构：三角色 + 中间层

dsh-lab 采用**三角色架构**，中间层是连接 DSH Agent（LLM）和 Python 执行引擎的桥梁：

```
DSH Agent（LLM）
  → 调用工具：send_scpi(commands: [{address, command}])
  → 阅读 system prompt 中的仪器/文档/工作流上下文
      │
      ▼
中间层（TypeScript）
  ├── Consumer（工具）     → tools.ts       → inject: ['tools', 'lab']
  ├── Consumer（上下文）   → context.ts     → inject: ['systemPrompt', 'lab']
  ├── Consumer（斜杠命令） → commands.ts    → inject: ['commands', 'lab']
  │       │
  │       ▼ 调用 ctx.lab.* 服务方法
  │
  ├── Service Definition   → service.ts     → 抽象方法 + Request/Result 类型
  │       │
  │       ▼ 抽象接口
  │
  └── Service Provider     → lab-local.ts   → 唯一知道 Python 的模块
          │
          ▼ python -m py <module> (stdin JSON)

Python 执行引擎（py/*）
  → PyVISA 仪器通信 / asglib SDK
  → stdout 输出 JSON 结果
```

### 依赖方向

```
Consumer → Service Definition ← Service Provider
     ↑              ↑                  ↑
   tools.ts    service.ts        lab-local.ts
   context.ts                     (唯一知道 Python 的模块)
   commands.ts
```

Consumer 与 Provider **互不依赖**。Consumer 只依赖 `LabService` 接口，Provider 只依赖 `LabService` 抽象类。

### 中间层的价值

| 特性 | 说明 |
|---|---|
| **替换 Provider 不改工具** | 将来换成远程仪器控制（HTTP），只改 `lab-local.ts`，`tools.ts` 一行不动 |
| **替换工具不改 Provider** | 加新工具只改 `tools.ts`，Python 代码不动 |
| **Python 可独立测试** | 直接 `echo '{...}' \| python -m py scpi` 验证 |
| **沙箱友好** | Python 进程走 `ctx.shell.run()`，DSH 沙箱策略自动生效 |
| **LLM 无感知** | DSH Agent 只看到标准工具，不知道底层是 Python 还是其他 |

---

## 2. TypeScript 与 Python 的边界

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

### 最终 Python 模块

```
py/
├── __main__.py   # 一次性入口路由
├── scan.py       # 设备扫描（PyVISA + asglib）
├── scpi.py       # SCPI 通信（PyVISA）
└── asg.py        # ASG SDK 调用（asglib）
```

---

## 3. 中间层各模块详解

### 3.1 Service Definition（`src/service.ts`）

**角色**：定义 `LabService` 抽象类，声明所有工具/上下文/命令需要的抽象方法 + Request/Result 类型。

**当前状态**：空壳，只有构造函数，无方法签名。

**需要补充**：
- 8 个工具方法：`scanInstruments`、`readDocument`、`readWorkflow`、`createWorkflow`、`updateWorkflow`、`deleteWorkflow`、`sendScpi`、`sendAsg`
- 1 个命令方法：`renameDevice`
- 3 个上下文数据方法：`listWorkflows`、`listDocuments`、`readInventory`
- 1 个内容加载方法：`readMarkdown(filename)` — 加载 `content/` 目录下的 Markdown 文件（角色定位、提示词等）
- 对应的 Request/Result 接口（如 `SendScpiRequest`、`SendScpiResult` 等）
- 声明合并：让消费方可以写 `ctx.lab`

---

### 3.2 Service Provider（`src/lab-local.ts`）

**角色**：实现 `LabService`，是唯一知道 Python 的模块。

**当前状态**：空壳 `LabLocal`，什么都没实现。

**实现策略**：

| 方法 | 实现方式 |
|---|---|
| `scanInstruments` | 调 Python：`python -m py scan` |
| `readDocument` | TypeScript 直接读文件 + 按行/章节切片 |
| `readWorkflow` | TypeScript 直接读文件 |
| `createWorkflow` | TypeScript 写文件（YAML frontmatter + Markdown） |
| `updateWorkflow` | TypeScript 读 → 改 → 写 |
| `deleteWorkflow` | TypeScript 删文件夹 |
| `sendScpi` | 调 Python：`python -m py scpi` |
| `sendAsg` | 调 Python：`python -m py asg` |
| `renameDevice` | TypeScript 读写 JSON |
| `listWorkflows` | TypeScript 读目录 + 解析 frontmatter |
| `listDocuments` | TypeScript 读目录 + 解析 frontmatter |
| `readInventory` | TypeScript 读 `devices/devices_inventory.json` |
| `readMarkdown` | TypeScript 读 `content/*.md` 文件 |

**关键点**：
- 文件操作在 TypeScript 中直接完成，无需跨进程通信
- Python 只负责硬件通信，通过 `ctx.shell.run()` 走 DSH 沙箱机制
- 硬件调用参数通过 stdin 传递 JSON，结果通过 stdout JSON 返回
- **内容与逻辑分离**：角色定位、提示词等静态文本存于 `content/*.md`，由 `readMarkdown` 加载

---

### 3.3 Consumer — 工具注册（`src/tools.ts`）

**角色**：把 `LabService` 方法暴露为 DSH 模型可调用的工具。

**当前状态**：**文件不存在**。

**设计要点**：
- `inject = ['tools', 'lab']` — 声明依赖工具运行时 + lab 服务
- 服务不存在时 `apply()` 不执行，工具自然不可用，无需 `isEnabled()` 检查
- 工具只调 `ctx.lab.*`，不知道 Python 存在
- 8 个工具：`scan_instruments`、`read_document`、`read_workflow`、`create_workflow`、`update_workflow`、`delete_workflow`、`send_scpi`、`send_asg`

---

### 3.4 Consumer — System Prompt 上下文（`src/context.ts`）

**角色**：每步自动注入仪器/文档/工作流上下文到 system prompt。

**当前状态**：✅ **已实现**（详见 `src/context.ts` + `src/lab-local.ts` 上下文方法）。

**实现要点**：
- `inject = ['systemPrompt', 'lab']`
- 四个 section：
  - `lab:role`（order: 100，固定）— 角色定位 + 工具使用指南，从 `content/role.md` 加载
  - `lab:instruments`（order: 200，每步刷新）— 当前连接的仪器列表
  - `lab:documents`（order: 201，每步刷新）— 可用文档索引（frontmatter）
  - `lab:workflows`（order: 202，每步刷新）— 可用工作流列表（frontmatter）
- 所有 `text` 回调**同步返回字符串**（DSH API 要求）
- 目录不存在或为空时返回 `''`，DSH 自动过滤空 section

---

### 3.5 Consumer — 斜杠命令（`src/commands.ts` 扩展）

**角色**：注册 `/lab` 元命令 + `/devices` `/new` `/rename` 三个斜杠命令。

**当前状态**：只有 `/lab` 元命令。

**设计要点**：
- `/lab` 元命令的 `inject` 只包含 `['commands']`，不包含 `lab`，所以始终可用
- `/devices` `/new` `/rename` 属于另一个 Consumer 文件（如 `src/slash-commands.ts`），声明 `inject = ['commands', 'lab']`
- 它们只在 lab 服务注册后才可用，注销后自动消失

---

## 4. 工具能力的实现（`src/tools.ts`）

> 本文档详细描述 8 个工具的设计实现，对应大纲第 3.3 节「Consumer — 工具注册」。
> **当前状态**：`src/tools.ts` 文件尚未创建，Service Definition 缺少工具方法签名。

### 4.1 总体架构

工具注册在 `src/tools.ts`，属于 Consumer 角色。工具只依赖 `LabService` 接口，通过 `ctx.lab.*` 调用服务方法，不知道底层是 TypeScript 文件操作还是 Python 硬件调用。

```
LLM → 调用工具（如 send_scpi）
  → src/tools.ts（Consumer：参数校验 + 结果格式化）
    → ctx.lab.sendScpi(request)（Service Definition 抽象接口）
      → src/lab-local.ts（Service Provider 实现）
        → python -m py scpi（Python 子进程）
        → PyVISA 硬件通信
```

**核心原则**：
- 工具 = 接口的薄包装层，不包含业务逻辑
- 业务逻辑全在 Service Provider
- 替换 Provider（如远程仪器控制）时，`src/tools.ts` 一行不动

### 4.2 Service Definition 需要补充的方法

当前 `src/service.ts` 只有上下文相关的 4 个方法。需要补充 8 个工具方法 + 1 个命令方法 + 对应的 Request/Result 类型。

#### 工具方法签名

```typescript
// src/service.ts — 需要补充的工具方法
abstract scanInstruments(): Promise<ScanInstrumentsResult>
abstract readDocument(request: ReadDocumentRequest): Promise<string>
abstract readWorkflow(request: ReadWorkflowRequest): Promise<string>
abstract createWorkflow(request: CreateWorkflowRequest): Promise<string>
abstract updateWorkflow(request: UpdateWorkflowRequest): Promise<string>
abstract deleteWorkflow(request: DeleteWorkflowRequest): Promise<string>
abstract sendScpi(request: SendScpiRequest): Promise<SendScpiResult>
abstract sendAsg(request: SendAsgRequest): Promise<SendAsgResult>
```

#### 命令方法签名

```typescript
// src/service.ts — 需要补充的命令方法
abstract renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult>
```

#### Request/Result 类型定义

```typescript
// src/service.ts — 工具 Request/Result 类型

// ── 仪器发现 ──
interface ScanInstrumentsResult {
  devices: Array<{ name: string; model: string; serial: string; kind: 'visa' | 'asg' }>
  text: string
}

// ── 文档操作 ──
interface ReadDocumentRequest {
  filename: string
  lines?: string    // 行区间，如 "23-36"
  section?: string  // 章节名，如 ":SOURce 命令子系统"
}

interface ReadWorkflowRequest {
  name: string
}

// ── 工作流管理 ──
interface CreateWorkflowRequest {
  folder_name: string
  name?: string
  description?: string
}

interface UpdateWorkflowRequest {
  name: string
  frontmatter?: Record<string, unknown>
  section_title?: string
  section_content?: string
  append?: string
}

interface DeleteWorkflowRequest {
  name: string
}

// ── 仪器控制 ──

/** SCPI 批次请求：一次工具调用发送多条命令 */
interface SendScpiRequest {
  commands: Array<{
    address: string
    command: string
    delay?: number
  }>
  /** 出错时是否继续执行后续命令，默认 false（出错即停） */
  continueOnError?: boolean
}

interface SendScpiResult {
  ok: boolean
  text: string
}

/** ASG 批次请求：一次工具调用发送多条调用 */
interface SendAsgRequest {
  calls: Array<{
    func: string
    args?: unknown[]
    kwargs?: Record<string, unknown>
    delay?: number
  }>
  /** 出错时是否继续执行后续调用，默认 false（出错即停） */
  continueOnError?: boolean
}

interface SendAsgResult {
  ok: boolean
  text: string
}

// ── 命令 ──
interface RenameDeviceRequest {
  id: string
  name: string
}

interface RenameDeviceResult {
  ok: boolean
  text: string
}
```

### 4.3 Service Provider 实现策略

| 方法 | 实现方式 | 超时 | 沙箱影响 |
|---|---|---|---|
| `scanInstruments` | 调 Python：`python -m py scan` | 30s | 读操作 |
| `readDocument` | TypeScript 直接读文件 + 按行/章节切片 | 10s | 读操作 |
| `readWorkflow` | TypeScript 直接读文件 | 10s | 读操作 |
| `createWorkflow` | TypeScript 写文件（YAML frontmatter + Markdown） | 10s | **写操作** |
| `updateWorkflow` | TypeScript 读 → 改 → 写 | 10s | **写操作** |
| `deleteWorkflow` | TypeScript 删文件夹 | 10s | **写操作** |
| `sendScpi` | 调 Python：`python -m py scpi` | 30s | 仪器通信 |
| `sendAsg` | 调 Python：`python -m py asg` | 30s | 仪器通信 |
| `renameDevice` | TypeScript 读写 JSON | 10s | **写操作** |

**TypeScript 直接处理**（无需 Python）：
- 文件读写使用 `readFileSync` / `writeFileSync` / `rmSync`
- 路径通过 `import.meta.url` 定位项目根目录
- 工作流文件夹结构：`workflows/<folder_name>/<folder_name>.md`

**Python 子进程调用**（硬件通信）：
- 通过 `ctx.shell.run()` 执行，走 DSH 沙箱机制
- 参数通过 stdin 传递 JSON：`ctx.shell.run({ command: 'python -m py scpi', stdin: JSON.stringify({...}), ... })`
- 结果通过 stdout JSON 返回
- 超时由 `ctx.shell.run()` 的 `timeoutMs` 控制

### 4.4 工具注册代码（`src/tools.ts`）

```typescript
// src/tools.ts — Consumer 角色：把 LabService 方法暴露为 DSH 工具
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-lab-tools'
export const inject = ['tools', 'lab']

export function apply(ctx: Context) {
  // ── 仪器发现 ──
  ctx.tools.register(defineTool({
    name: 'scan_instruments',
    description: '扫描当前连接的 VISA 和 ASG 仪器设备，更新设备清单。',
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(_args) {
      const result = await ctx.lab.scanInstruments()
      return result.text
    },
  }))

  // ── 文档操作 ──
  ctx.tools.register(defineTool({
    name: 'read_document',
    description: '按行区间或章节读取仪器文档内容。',
    parameters: {
      filename: { type: 'string', description: '文档文件名', required: true },
      lines: { type: 'string', description: '行区间，如 23-36' },
      section: { type: 'string', description: '章节名' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return await ctx.lab.readDocument(args)
    },
    isConcurrencySafe: () => true,  // 只读，可并行
  }))

  ctx.tools.register(defineTool({
    name: 'read_workflow',
    description: '读取工作流文件内容。',
    parameters: {
      name: { type: 'string', description: '工作流名称', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return await ctx.lab.readWorkflow(args)
    },
    isConcurrencySafe: () => true,  // 只读，可并行
  }))

  // ── 工作流管理 ──
  ctx.tools.register(defineTool({
    name: 'create_workflow',
    description: '新建工作流文件。',
    parameters: {
      folder_name: { type: 'string', description: '文件夹名', required: true },
      name: { type: 'string', description: '显示名称' },
      description: { type: 'string', description: '工作流描述' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return await ctx.lab.createWorkflow(args)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'update_workflow',
    description: '修改工作流文件。',
    parameters: {
      name: { type: 'string', required: true },
      frontmatter: { type: 'object', additionalProperties: true },
      section_title: { type: 'string' },
      section_content: { type: 'string' },
      append: { type: 'string' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return await ctx.lab.updateWorkflow(args)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'delete_workflow',
    description: '删除工作流文件。',
    parameters: {
      name: { type: 'string', description: '工作流名称', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return await ctx.lab.deleteWorkflow(args)
    },
  }))

  // ── 仪器控制 ──
  ctx.tools.register(defineTool({
    name: 'send_scpi',
    description: '向仪器发送一条或多条 SCPI 命令，按顺序执行。',
    parameters: {
      commands: {
        type: 'array',
        description: 'SCPI 命令列表',
        required: true,
        items: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'VISA 资源地址', required: true },
            command: { type: 'string', description: 'SCPI 命令', required: true },
            delay: { type: 'number', description: '执行后延迟（秒）' },
          },
        },
      },
      continueOnError: {
        type: 'boolean',
        description: '出错时是否继续执行后续命令，默认 false',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const result = await ctx.lab.sendScpi(args)
      return result.text
    },
  }))

  ctx.tools.register(defineTool({
    name: 'send_asg',
    description: '向 ASG 设备发送一条或多条 SDK 调用，按顺序执行。',
    parameters: {
      calls: {
        type: 'array',
        description: 'ASG 调用列表',
        required: true,
        items: {
          type: 'object',
          properties: {
            func: { type: 'string', description: 'SDK 函数名', required: true },
            args: { type: 'array', items: { type: 'json' } },
            kwargs: { type: 'object', additionalProperties: true },
            delay: { type: 'number', description: '执行后延迟（秒）' },
          },
        },
      },
      continueOnError: {
        type: 'boolean',
        description: '出错时是否继续执行后续调用，默认 false',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const result = await ctx.lab.sendAsg(args)
      return result.text
    },
  }))
}
```

### 4.5 并发控制

| 工具 | 并发类型 | `isConcurrencySafe` | 原因 |
|---|---|---|---|
| `scan_instruments` | exclusive | 不声明 | 涉及硬件扫描 + 文件写入 |
| `read_document` | parallel | `() => true` | 只读操作 |
| `read_workflow` | parallel | `() => true` | 只读操作 |
| `create_workflow` | exclusive | 不声明 | 写操作 |
| `update_workflow` | exclusive | 不声明 | 写操作 |
| `delete_workflow` | exclusive | 不声明 | 写操作 |
| `send_scpi` | exclusive | 不声明 | 硬件操作 |
| `send_asg` | exclusive | 不声明 | 硬件操作 |

**设计原则**：
- `exclusive`（默认）：不声明 `isConcurrencySafe`，成为串行屏障，一次只能执行一个
- `parallel`：显式声明 `isConcurrencySafe: () => true`，可加入并行组
- 该元数据对模型不可见，由 agent loop 调度器使用

### 4.6 数据流

```
── 文件操作类工具（TypeScript 直接处理）──

LLM → read_document(filename="DG.md", lines="1004-1050")
  → ctx.lab.readDocument({ filename: "DG.md", lines: "1004-1050" })
  → Provider: readFileSync("docs/DG.md") → 按行切片 → 返回文本

LLM → create_workflow(folder_name="dg_dc_output", name="DG双通道直流输出")
  → ctx.lab.createWorkflow({ folder_name: "dg_dc_output", name: "DG双通道直流输出" })
  → Provider: mkdir("workflows/dg_dc_output") → writeFileSync("workflows/dg_dc_output/dg_dc_output.md", ...)

── 硬件操作类工具（Python 子进程）──

LLM → send_scpi(commands: [
    {address:"USB0::...::INSTR", command:":SOUR1:APPL:DC 100,5,2,0"},
    {address:"USB0::...::INSTR", command:":SOUR2:APPL:DC 100,5,2,0"},
  ])
  → ctx.lab.sendScpi({ commands: [...], continueOnError: false })
  → Provider: 一次 shell.run() 提交整批命令
    → ctx.shell.run({ command: 'python -m py scpi', stdin: JSON.stringify({commands, continueOnError}), timeoutMs: 30000 * commands.length })
    → Python: 循环处理每条命令
      → PyVISA 连接 → 发送命令 → 收集结果
      → 如果失败且 continue_on_error=false，中断后续命令
    → stdout 输出 JSON: {"status":"ok","result":{"results":[...]}}
  → Provider: 解析 stdout，格式化为可读文本
  → 返回 SendScpiResult（包含所有命令的执行结果）

LLM → scan_instruments()
  → ctx.lab.scanInstruments()
  → Provider: ctx.shell.run({ command: 'python -m py scan', timeoutMs: 30000 })
  → Python: PyVISA 扫描 + ASG SDK 扫描 → 写入 devices/devices_inventory.json → stdout 输出结果
  → Provider: 解析 stdout → 返回 ScanInstrumentsResult
  → 下次 Agent Loop 时 lab:instruments section 自动更新
```

### 4.7 各工具实现要点

#### `scan_instruments`
- 无参数，返回设备列表 + 可读文本
- Python 模块 `py/scan.py` 负责 PyVISA + ASG SDK 扫描
- 扫描结果写入 `devices/devices_inventory.json`（供上下文 section 使用）
- 超时 30s，需处理 PyVISA 未安装、ASG SDK 未安装等错误

#### `read_document`
- 按行区间（`lines: "23-36"`）或章节名（`section: ":SOURce 命令子系统"`）切片
- 章节名匹配：在文档中搜索 `### :SOURce 命令子系统` 行，找到对应行号范围
- 行号越界时自动截断到有效范围
- 返回格式：`[DG.md:23-36]\n\n### 命令内容...`

#### `read_workflow`
- 读取 `workflows/<name>/<name>.md` 完整内容
- 返回 YAML frontmatter + Markdown 步骤，供 LLM 阅读理解

#### `create_workflow`
- 创建 `workflows/<folder_name>/` 目录
- 生成 `workflows/<folder_name>/<folder_name>.md` 文件
- 文件内容包含 YAML frontmatter（name、description）+ 空正文
- 文件夹名只保留字母数字、下划线、连字符、中文

#### `update_workflow`
- 支持 4 种更新方式：
  1. 更新 frontmatter 字段
  2. 替换指定章节内容
  3. 追加到正文末尾
  4. 组合使用
- 章节替换：找到 `### 章节标题` 后，替换到下一个 `###` 或文件末尾

#### `delete_workflow`
- 删除 `workflows/<name>/` 整个文件夹
- 使用 `rmSync(path, { recursive: true, force: true })`

#### `send_scpi`
- 参数：`commands`（SCPI 命令列表）、`continueOnError`（出错是否继续，默认 false）
- 一次工具调用发送多条命令，按顺序执行
- Provider 一次 `shell.run()` 提交整批命令给 Python
- Python 循环处理每条命令，调用 `_execute_single()` 发送单条
- 查询命令（以 `?` 结尾）返回仪器响应，写入命令返回成功确认
- 默认出错即停，设置 `continueOnError: true` 可继续执行后续命令
- 超时按命令数量线性计算：`30000 * commands.length`

#### `send_asg`
- 参数：`calls`（ASG 调用列表）、`continueOnError`（出错是否继续，默认 false）
- 一次工具调用发送多条调用，按顺序执行
- Provider 一次 `shell.run()` 提交整批调用给 Python
- Python 循环处理每条调用，调用 `_execute_single()` 发送单条
- 自动初始化 SDK（首次调用时）
- 默认出错即停，设置 `continueOnError: true` 可继续执行后续调用
- 超时按调用数量线性计算：`30000 * calls.length`

### 4.8 错误处理

| 错误场景 | 处理方式 | 返回示例 |
|---|---|---|
| 文件不存在 | catch + 返回错误文本 | `错误：文件不存在：DG.md` |
| 行区间格式错误 | 正则校验 | `错误：行区间格式错误，应为 23-36` |
| 工作流不存在 | 检查目录存在性 | `错误：找不到工作流：dg_dc_output` |
| 文件夹名无效 | 正则校验 | `错误：文件夹名无效` |
| 沙箱拒绝写操作 | catch + 返回提示 | `[sandbox: file access denied]` |
| Python 未安装 | catch + 返回提示 | `错误：Python 未安装或不在 PATH 中` |
| PyVISA 未安装 | Python 内捕获 | `错误：PyVISA 未安装，请运行 pip install pyvisa` |
| 仪器连接断开 | PyVISA 异常 | `错误：VI_ERROR_CONN_LOST: 连接已断开` |
| 超时 | shell.run timeoutMs | `错误：操作超时（30s）` |

**原则**：所有错误以可读文本形式返回给 LLM，不抛异常。LLM 根据错误文本决定下一步（如提示用户检查连接、重试等）。

### 4.9 测试验证

| 验证项 | 方法 | 预期 |
|---|---|---|
| 工具注册成功 | 输入 `/lab` 后查看工具列表 | 8 个工具全部可见 |
| 服务注销后工具消失 | 再次输入 `/lab` | 工具从列表消失 |
| `read_document` 按行读取 | `read_document(filename="DG.md", lines="1-10")` | 返回前 10 行内容 |
| `read_document` 按章节读取 | `read_document(filename="DG.md", section=":SOURce")` | 返回对应章节内容 |
| `read_workflow` 读取 | `read_workflow(name="dg_dc_output")` | 返回工作流完整内容 |
| `create_workflow` 创建 | `create_workflow(folder_name="test_wf")` | 文件夹和文件创建成功 |
| `update_workflow` 修改 | `update_workflow(name="test_wf", append="\n新步骤")` | 内容追加成功 |
| `delete_workflow` 删除 | `delete_workflow(name="test_wf")` | 文件夹删除成功 |
| `send_scpi` 发送单条 | `send_scpi(commands:[{address:"...", command:"*RST"}])` | 返回成功确认 |
| `send_scpi` 发送多条 | `send_scpi(commands:[{...}, {...}, {...}])` | 按顺序执行，返回所有结果 |
| `send_scpi` 出错即停 | `send_scpi(commands:[{...}, {...}], continueOnError:false)` | 第 1 条失败则跳过后续 |
| `send_scpi` 出错继续 | `send_scpi(commands:[{...}, {...}], continueOnError:true)` | 第 1 条失败仍继续 |
| `send_asg` 发送单条 | `send_asg(calls:[{func:"ASG_Init"}])` | 返回调用结果 |
| `send_asg` 发送多条 | `send_asg(calls:[{...}, {...}, {...}])` | 按顺序执行，返回所有结果 |
| `send_asg` 出错即停 | `send_asg(calls:[{...}, {...}], continueOnError:false)` | 第 1 条失败则跳过后续 |
| `send_asg` 出错继续 | `send_asg(calls:[{...}, {...}], continueOnError:true)` | 第 1 条失败仍继续 |
| `scan_instruments` 扫描 | `scan_instruments()` | 返回设备列表 |
| 并行工具可同时执行 | 同时调用 `read_document` + `read_workflow` | 两个工具并行执行 |
| 独占工具串行执行 | 同时调用 `send_scpi` + `send_asg` | 两个工具串行执行 |
| 错误处理 | 调用 `read_document(filename="不存在的.md")` | 返回可读错误文本 |

---

## 5. Python 执行引擎实现（`py/*`）

> 本文档详细描述 Python 执行引擎的设计实现，对应大纲第 2 节「TypeScript 与 Python 的边界」中"需要 Python"的操作。
> 与第 4 节配合阅读：第 4 节的 Service Provider（`src/lab-local.ts`）通过 `ctx.shell.run()` 调用本节的 Python 模块。
> **当前状态**：所有 Python 模块均未实现。

### 5.1 在架构中的位置

Python 引擎处于整个调用链的最底层，是**唯一知道硬件的模块**：

```
第 4 节 — TypeScript 层
  src/tools.ts（Consumer）     ← 工具注册、参数校验
  src/service.ts（Definition） ← 抽象接口
  src/lab-local.ts（Provider） ← 业务逻辑、文件 I/O、Python 调用
      │
      ▼  ctx.shell.run({ command: "python -m py <module>", stdin: JSON })
第 5 节 — Python 层
  py/__main__.py          ← 入口路由
  py/scan.py              ← PyVISA + asglib 设备扫描
  py/scpi.py              ← PyVISA SCPI 通信
  py/asg.py               ← asglib SDK 调用
      │
      ▼
  物理硬件（示波器、信号发生器、ASG 设备）
```

**职责边界**：
- Python 只负责**硬件通信**（需要 PyVISA / asglib）
- 文件 I/O、JSON 解析、YAML frontmatter 等在 TypeScript 中直接处理
- `scan.py` 是唯一需要 Python 做文件操作的设备扫描（因为要访问硬件获取设备列表）

### 5.2 模块结构

```
py/
├── __init__.py
├── __main__.py   # 一次性入口路由（python -m py <module>）
├── scan.py       # 设备扫描（PyVISA + asglib）
├── scpi.py       # SCPI 通信（PyVISA）
└── asg.py        # ASG SDK 调用（asglib）
```

**采用一次性执行模式**：每次工具调用启动 Python 子进程，执行完退出。

| 方案 | 描述 | 选择 |
|---|---|---|
| 长驻服务 (JSON-RPC) | 启动 Python 进程，通过 stdin/stdout 持久通信 | ❌ |
| 一次性执行 | 每次调用启动子进程，执行完退出 | ✅ |

**理由**：
- 仪器控制是低频操作（用户说"执行工作流"时才调用），不需要保持连接
- 进程退出后资源不泄漏，无状态管理问题
- 实现简单：不需要 IPC、不需要重连机制
- 沙箱友好：进程退出后不残留状态

### 5.3 通信协议

#### 方向：TypeScript → Python（stdin 传递 JSON）

```
echo '{"commands":[...]}' | python -m py scpi
                   ↑            ↑
                  stdin JSON    模块名（argv[1]）
```

- 第一个命令行参数：模块名（`scan` / `scpi` / `asg`）
- 参数通过 stdin 传入 JSON
- 无参数时（如 `scan`），stdin 传空字符串

#### 方向：Python → TypeScript

```json
// stdout 输出
{"status": "ok", "result": {...}}

// 错误时
{"status": "error", "error": "VI_ERROR_CONN_LOST: 连接已断开"}
```

- 正常结果：`{"status": "ok", "result": <模块特定数据>}`
- 错误结果：`{"status": "error", "error": "<可读错误信息>"}`
- 所有输出到 stdout 的内容都是合法 JSON
- stderr 用于日志/调试信息（不影响结果解析）

#### 完整数据流：Python → 插件上下文

```
Python 进程                     Node.js (TypeScript)
───────────                     ──────────────────
print(json.dumps({...}))   →    stdout 收集
                                ↓
                          ShellRunResult.stdout.text
                                ↓
                          JSON.parse(stdout)  ← 反序列化
                                ↓
                          返回给 Consumer 工具
```

**第一步：`ctx.shell.run()` 捕获 stdout**

`src/lab-local.ts` 通过 DSH 的 shell 执行器调用 Python，执行器负责 `spawn` 子进程并流式收集输出：

```typescript
const runResult = await shell.run({
  command: "python -m py scpi",
  stdin: '{"commands":[{"address":"...","command":"*RST"}]}',
  timeoutMs: 30000,
})

// runResult 是 ShellRunResult，包含：
// runResult.exitCode  → 0 = 成功，非0 = 异常退出
// runResult.stdout.text → Python print() 输出的原始字符串
// runResult.stderr.text → Python 错误输出（调试用）
```

**第二步：`JSON.parse()` 反序列化**

Python 的 `json.dumps()` 把对象序列化为字符串（`print` 到 stdout），JS 的 `JSON.parse()` 把字符串反序列化为可操作的对象：

```typescript
// runResult.stdout.text 是原始字符串
// 内容: '{"status":"ok","result":{"written":true}}'
const parsed = JSON.parse(runResult.stdout.text)

// parsed 现在是 JavaScript 对象，可以访问字段：
// parsed.status → "ok"
// parsed.result → { written: true }

if (parsed.status === "ok") {
  return { ok: true, text: "SCPI 写入成功" }
} else {
  return { ok: false, text: `错误：${parsed.error}` }
}
```

**总结**：Python 不需要知道任何通信细节——只管 `print(json.dumps(...))` 到 stdout，DSH 的 shell 执行器负责捕获输出并返回给 TypeScript，TypeScript 再 `JSON.parse()` 还原为数据结构。

### 5.4 入口路由（`py/__main__.py`）

```python
"""一次性脚本入口 — 被 TypeScript 通过 python -m py <module> 调用，参数从 stdin 读取"""
import sys
import json

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "用法: python -m py <module> (参数通过 stdin JSON 传入)"}))
        sys.exit(1)

    module = sys.argv[1]
    raw = sys.stdin.read()
    args = json.loads(raw) if raw.strip() else {}

    try:
        if module == "scan":
            from py.scan import scan_instruments
            result = scan_instruments()
        elif module == "scpi":
            from py.scpi import scpi_execute_batch
            result = scpi_execute_batch(
                args.get("commands", []),
                args.get("continueOnError", False)
            )
        elif module == "asg":
            from py.asg import asg_execute_batch
            result = asg_execute_batch(
                args.get("calls", []),
                args.get("continueOnError", False)
            )
        else:
            result = {"status": "error", "error": f"未知模块: {module}"}
    except Exception as e:
        result = {"status": "error", "error": f"{type(e).__name__}: {e}"}

    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
```

**设计要点**：
- 延迟导入（`from py.scan import ...`）：只有被调用时才加载对应模块，减少启动开销
- 统一错误捕获：任何异常都包装为 `{"status": "error", ...}` 输出，不抛异常到 stderr
- `ensure_ascii=False`：支持中文设备名等 Unicode 字符

### 5.5 SCPI 引擎（`py/scpi.py`）

```python
"""PyVISA SCPI 命令引擎 — 批次处理，每次新建连接，执行完关闭"""
import time


def scpi_execute_batch(commands: list, continue_on_error: bool = False) -> dict:
    """
    向仪器发送多条 SCPI 命令，按顺序执行。

    Args:
        commands: 命令列表，每项为 {address, command, delay?}
        continue_on_error: 出错时是否继续执行后续命令，默认 False

    Returns:
        {"status": "ok", "result": {"results": [...]}}
        {"status": "error", "error": "...", "result": {"results": [...]}}
    """
    if not commands:
        return {"status": "error", "error": "命令列表为空"}

    results = []
    for i, cmd in enumerate(commands):
        address = cmd.get("address", "")
        command = cmd.get("command", "")
        delay = cmd.get("delay", 0)

        try:
            result = _execute_single(address, command, delay)
            results.append(result)
            if not result.get("ok", False) and not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条命令执行失败，后续命令已跳过"})
                break
        except Exception as e:
            results.append({"ok": False, "error": f"{type(e).__name__}: {e}"})
            if not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条命令执行失败，后续命令已跳过"})
                break

    all_ok = all(r.get("ok", False) for r in results if "note" not in r)
    return {
        "status": "ok" if all_ok else "error",
        "result": {"results": results},
    }


def _execute_single(address: str, command: str, delay: float = 0) -> dict:
    """发送单条 SCPI 命令"""
    try:
        import pyvisa
    except ImportError:
        return {"ok": False, "error": "PyVISA 未安装，请运行 pip install pyvisa pyvisa-py"}

    rm = None
    dev = None
    try:
        rm = pyvisa.ResourceManager("@py")
        dev = rm.open_resource(address)
        dev.timeout = 5000  # 5 秒超时

        if command.endswith("?"):
            response = dev.query(command).strip()
            return {"ok": True, "response": response}
        else:
            dev.write(command)
            if delay > 0:
                time.sleep(delay)
            return {"ok": True, "written": True}

    except pyvisa.VisaIOError as e:
        return {"ok": False, "error": f"VISA 错误: {e.description or str(e)}"}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}
    finally:
        if dev is not None:
            try:
                dev.close()
            except Exception:
                pass
        if rm is not None:
            try:
                rm.close()
            except Exception:
                pass
```

**设计要点**：
- **批次处理**：一次调用处理多条命令，循环在 Python 里，减少子进程开销
- **每次新建连接**：不在调用之间保持连接，避免连接状态泄漏
- **`@py` 后端**：使用 `pyvisa-py` 后端，不依赖 NI-VISA 驱动
- **查询 vs 写入**：以 `?` 结尾的命令用 `dev.query()`，其余用 `dev.write()`
- **错误策略**：默认出错即停，设置 `continue_on_error=True` 可继续执行后续命令
- **`finally` 关闭**：确保即使出错也关闭 VISA 连接
- **超时 5s**：防止仪器无响应时无限等待

### 5.6 ASG 引擎（`py/asg.py`）

```python
"""asglib ASG SDK 引擎 — 批次处理，带连接状态缓存"""
import time

# 连接状态缓存（模块级变量）
_asg_initialized = False


def asg_execute_batch(calls: list, continue_on_error: bool = False) -> dict:
    """
    调用 ASG 设备的多个 SDK 函数，按顺序执行。

    Args:
        calls: 调用列表，每项为 {func, args?, kwargs?, delay?}
        continue_on_error: 出错时是否继续执行后续调用，默认 False

    Returns:
        {"status": "ok", "result": {"results": [...]}}
        {"status": "error", "error": "...", "result": {"results": [...]}}
    """
    if not calls:
        return {"status": "error", "error": "调用列表为空"}

    results = []
    for i, call in enumerate(calls):
        func = call.get("func", "")
        args = call.get("args", [])
        kwargs = call.get("kwargs", {})
        delay = call.get("delay", 0)

        try:
            result = _execute_single(func, args, kwargs, delay)
            results.append(result)
            if not result.get("ok", False) and not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条调用执行失败，后续调用已跳过"})
                break
        except Exception as e:
            results.append({"ok": False, "error": f"{type(e).__name__}: {e}"})
            if not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条调用执行失败，后续调用已跳过"})
                break

    all_ok = all(r.get("ok", False) for r in results if "note" not in r)
    return {
        "status": "ok" if all_ok else "error",
        "result": {"results": results},
    }


def _execute_single(func: str, args: list, kwargs: dict, delay: float = 0) -> dict:
    """调用单条 ASG SDK 函数"""
    global _asg_initialized

    try:
        import asglib
    except ImportError:
        return {"ok": False, "error": "asglib 未安装，请安装 ASG SDK"}

    # 延迟初始化（首次调用时）
    if not _asg_initialized:
        try:
            init_result = asglib.ASG_Init()
            ok = (isinstance(init_result, dict) and init_result.get("result") == 1) or init_result == 1
            if not ok:
                return {"ok": False, "error": f"ASG 初始化失败: {init_result}"}
            _asg_initialized = True
        except Exception as e:
            return {"ok": False, "error": f"ASG 初始化异常: {e}"}

    # 查找函数
    func_obj = getattr(asglib, func, None)
    if func_obj is None:
        return {"ok": False, "error": f"函数不存在: {func}"}

    # 调用函数
    try:
        result = func_obj(*args, **kwargs)
        if delay > 0:
            time.sleep(delay)
        return {"ok": True, "result": result}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def asg_release():
    """释放 ASG SDK 资源（可选，进程退出时自动释放）"""
    global _asg_initialized
    try:
        import asglib
        asglib.ASG_Release()
        _asg_initialized = False
    except Exception:
        pass
```

**设计要点**：
- **批次处理**：一次调用处理多个 SDK 调用，循环在 Python 里，减少子进程开销
- **延迟初始化**：首次调用时才 `ASG_Init()`，避免不必要的初始化
- **状态缓存**：`_asg_initialized` 防止重复初始化
- **错误策略**：默认出错即停，设置 `continue_on_error=True` 可继续执行后续调用
- **进程退出自动释放**：一次性模式下进程退出时 OS 自动回收资源
```

**设计要点**：
- **延迟初始化**：首次调用时才 `ASG_Init()`，避免不必要的初始化
- **状态缓存**：`_asg_initialized` 防止重复初始化
- **进程退出自动释放**：一次性模式下进程退出时 OS 自动回收资源，`asg_release()` 是可选的优雅退出
- **动态函数查找**：`getattr(asglib, func)` 实现通用路由，新增 SDK 函数无需改代码

### 5.7 设备扫描引擎（`py/scan.py`）

```python
"""设备库存管理 — PyVISA + asglib 联合扫描"""
import json
import time
from pathlib import Path

# 设备清单路径（相对于项目根目录）
INVENTORY_PATH = Path(__file__).parent.parent / "devices" / "devices_inventory.json"

def scan_instruments() -> dict:
    """
    扫描 VISA (PyVISA) 与 ASG (asglib) 设备，更新库存文件。

    Returns:
        {
          "status": "ok",
          "result": {
            "devices": [{"name":"...", "model":"...", "serial":"...", "kind":"visa|asg", ...}],
            "text": "当前共 N 个设备在线：\n  1. ..."
          }
        }
    """
    online_devices = []
    idn_map = {}

    # ── 1. 读取旧库存（保留用户命名）──
    old_inventory = {}
    try:
        if INVENTORY_PATH.exists():
            old_inventory = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    except Exception:
        pass

    # ── 2. VISA 扫描 ──
    try:
        import pyvisa
        rm = pyvisa.ResourceManager("@py")
        resources = rm.list_resources()

        # 去重：相同前缀取最短地址
        seen_prefix = {}
        for addr in resources:
            prefix = "::".join(addr.split("::")[:4])
            if prefix not in seen_prefix or len(addr) < len(seen_prefix[prefix]):
                seen_prefix[prefix] = addr

        for addr in sorted(seen_prefix.values()):
            try:
                dev = rm.open_resource(addr)
                idn = dev.query("*IDN?").strip()
                dev.close()
            except Exception:
                continue

            parts = [p.strip() for p in idn.split(",")]
            model = parts[1] if len(parts) >= 2 else ""
            serial = parts[2] if len(parts) >= 3 else ""
            if not serial:
                continue

            online_devices.append({
                "model": model,
                "serial": serial,
                "address": addr,
                "name": old_inventory.get(serial, {}).get("name", ""),
                "kind": "visa",
            })
            idn_map[addr] = idn

        rm.close()
    except ImportError:
        pass  # PyVISA 未安装，跳过 VISA 扫描
    except Exception:
        pass

    # ── 3. ASG 扫描 ──
    try:
        import asglib
        init_result = asglib.ASG_Init()
        ok = (isinstance(init_result, dict) and init_result.get("result") == 1) or init_result == 1
        if ok:
            time.sleep(3)  # ASG 初始化后需要等待
            asg_dev = asglib.ASG_GetDevicesList(10)
            if asg_dev.get("result") == 1 and asg_dev.get("count", 0) > 0:
                for item in asg_dev["value"]:
                    dev_name = item.get("asgDev_name", "") or "ASG24100"
                    dev_id = f"{dev_name}{item['asgDev_id']}"
                    online_devices.append({
                        "model": dev_name,
                        "serial": dev_id,
                        "local_ip": item.get("asgDev_localIP", ""),
                        "local_mac": item.get("asgDev_localMAC", ""),
                        "name": old_inventory.get(dev_id, {}).get("name", ""),
                        "kind": "asg",
                    })
            asglib.ASG_Release()
    except ImportError:
        pass  # asglib 未安装，跳过 ASG 扫描
    except Exception:
        pass

    # ── 4. 增量合并：新设备 + 离线设备（保留 name）──
    new_inventory = {}
    for d in online_devices:
        new_inventory[d["serial"]] = {
            "model": d["model"],
            "address": d.get("address", ""),
            "local_ip": d.get("local_ip", ""),
            "local_mac": d.get("local_mac", ""),
            "idn": idn_map.get(d.get("address", ""), ""),
            "name": d["name"],
            "kind": d.get("kind", "visa"),
        }
    # 离线设备：保留旧库存中不在新扫描里的设备（address 清空）
    for serial, info in old_inventory.items():
        if serial not in new_inventory:
            new_inventory[serial] = {
                **info,
                "address": "",
                "local_ip": "",
                "local_mac": "",
                "idn": "",
            }

    # ── 5. 写入库存文件 ──
    try:
        INVENTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
        INVENTORY_PATH.write_text(
            json.dumps(new_inventory, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception as e:
        # 文件写入失败不影响扫描结果返回
        pass

    # ── 6. 构建返回文本 ──
    if not online_devices:
        text = "当前没有检测到任何已连接的仪器设备。"
    else:
        lines = [f"当前共 {len(online_devices)} 个设备在线："]
        for i, d in enumerate(online_devices, 1):
            label = d["name"] if d["name"] else d["model"]
            lines.append(f"  {i}. {label}")
        text = "\n".join(lines)

    return {
        "status": "ok",
        "result": {
            "devices": online_devices,
            "text": text,
        },
    }
```

**设计要点**：
- **增量合并**：新扫描到的设备 + 离线设备（保留用户自定义 name），不丢弃离线设备信息
- **容错降级**：PyVISA 或 asglib 未安装时跳过对应扫描，不导致整个 `scan` 失败
- **去重逻辑**：VISA 地址相同前缀取最短，避免同一设备多个地址重复出现
- **保留用户命名**：从旧库存读取 `name` 字段，扫描后写回，用户给设备起的名字不会丢
- **文件写入失败不影响返回**：即使 JSON 文件写不成功（如沙箱限制），扫描结果仍然返回给 LLM

### 5.8 Service Provider 调用 Python 的方式

`src/lab-local.ts` 通过 `ctx.shell.run()` 调用 Python，走 DSH 沙箱机制：

```typescript
// src/lab-local.ts — 硬件相关方法实现（需要 Python）
import { shell } from 'node:shell'  // DSH shell 服务

const PYTHON = 'python'  // 或 'python3'，取决于系统

async scanInstruments(): Promise<ScanInstrumentsResult> {
  const request = {
    command: `${PYTHON} -m py scan`,
    stdin: '',
    timeoutMs: 30000,
  }
  const runResult = await shell.run(request)

  if (runResult.exitCode !== 0) {
    return {
      devices: [],
      text: `扫描失败：${runResult.stderr.text || '未知错误'}`,
    }
  }

  try {
    const parsed = JSON.parse(runResult.stdout.text)
    if (parsed.status === 'ok') {
      return parsed.result as ScanInstrumentsResult
    } else {
      return { devices: [], text: `扫描错误：${parsed.error}` }
    }
  } catch {
    return { devices: [], text: `扫描结果解析失败：${runResult.stdout.text}` }
  }
}

async sendScpi(request: SendScpiRequest): Promise<SendScpiResult> {
  if (request.commands.length === 0) {
    return { ok: false, text: '错误：命令列表为空' }
  }

  // 一次提交整批命令给 Python，循环在 Python 里处理
  const args = JSON.stringify({
    commands: request.commands,
    continueOnError: request.continueOnError ?? false,
  })
  const runResult = await shell.run({
    command: `${PYTHON} -m py scpi`,
    stdin: args,
    timeoutMs: 30000 * request.commands.length,  // 每条命令最多 30s
  })

  if (runResult.exitCode !== 0) {
    return { ok: false, text: `SCPI 执行失败：${runResult.stderr.text || '未知错误'}` }
  }

  try {
    const parsed = JSON.parse(runResult.stdout.text)
    if (parsed.status === 'ok') {
      // Python 返回批次结果，格式化为可读文本
      const lines = parsed.result.results.map((r: any) => {
        if (r.note) return r.note  // 中断提示
        if (r.response) return `[命令] -> ${r.response}`
        if (r.written) return `SCPI 写入成功`
        return `SCPI 结果: ${JSON.stringify(r)}`
      })
      return { ok: true, text: lines.join('\n') }
    }
    // 部分失败时，Python 仍返回 result.results
    if (parsed.result?.results) {
      const lines = parsed.result.results.map((r: any) => {
        if (r.note) return r.note
        if (r.error) return `错误: ${r.error}`
        return `SCPI 结果: ${JSON.stringify(r)}`
      })
      return { ok: false, text: lines.join('\n') }
    }
    return { ok: false, text: `错误：${parsed.error}` }
  } catch {
    return { ok: false, text: `SCPI 结果解析失败：${runResult.stdout.text}` }
  }
}

async sendAsg(request: SendAsgRequest): Promise<SendAsgResult> {
  if (request.calls.length === 0) {
    return { ok: false, text: '错误：调用列表为空' }
  }

  // 一次提交整批调用给 Python，循环在 Python 里处理
  const args = JSON.stringify({
    calls: request.calls,
    continueOnError: request.continueOnError ?? false,
  })
  const runResult = await shell.run({
    command: `${PYTHON} -m py asg`,
    stdin: args,
    timeoutMs: 30000 * request.calls.length,  // 每条调用最多 30s
  })

  if (runResult.exitCode !== 0) {
    return { ok: false, text: `ASG 执行失败：${runResult.stderr.text || '未知错误'}` }
  }

  try {
    const parsed = JSON.parse(runResult.stdout.text)
    if (parsed.status === 'ok') {
      const lines = parsed.result.results.map((r: any) => {
        if (r.note) return r.note
        if (r.result !== undefined) return `ASG 调用成功: ${JSON.stringify(r.result)}`
        return `ASG 结果: ${JSON.stringify(r)}`
      })
      return { ok: true, text: lines.join('\n') }
    }
    if (parsed.result?.results) {
      const lines = parsed.result.results.map((r: any) => {
        if (r.note) return r.note
        if (r.error) return `错误: ${r.error}`
        return `ASG 结果: ${JSON.stringify(r)}`
      })
      return { ok: false, text: lines.join('\n') }
    }
    return { ok: false, text: `错误：${parsed.error}` }
  } catch {
    return { ok: false, text: `ASG 结果解析失败：${runResult.stdout.text}` }
  }
}
```

**关键点**：
- `shell.run()` 返回 `ShellRunResult`，包含 `exitCode`、`stdout`、`stderr`
- **批次处理**：一次 `shell.run()` 提交整批命令/调用给 Python，循环在 Python 里处理
- 先检查 `exitCode`（非 0 = Python 进程异常退出），再解析 stdout JSON
- JSON 解析失败时返回原始文本，不抛异常
- 超时按命令数量线性计算：`30000 * commands.length`（每条命令/调用最多 30s）

### 5.9 错误处理（Python 侧）

| 错误场景 | Python 处理 | 返回示例 |
|---|---|---|
| 空列表 | 直接返回错误 | `{"status":"error","error":"命令列表为空"}` |
| PyVISA 未安装 | `try: import pyvisa` → `except ImportError` | `{"status":"error","error":"PyVISA 未安装，请运行 pip install pyvisa pyvisa-py"}` |
| asglib 未安装 | `try: import asglib` → `except ImportError` | `{"status":"error","error":"asglib 未安装"}` |
| VISA 连接断开 | `except pyvisa.VisaIOError` | `{"ok":false,"error":"VISA 错误: VI_ERROR_CONN_LOST"}` |
| 仪器超时 | `dev.timeout = 5000` + `VisaIOError` | `{"ok":false,"error":"VISA 错误: VI_ERROR_TMO"}` |
| ASG 函数不存在 | `getattr(asglib, func, None)` | `{"ok":false,"error":"函数不存在: ASG_Foo"}` |
| ASG 调用异常 | `except Exception` | `{"ok":false,"error":"ASG error code: -1"}` |
| 单条命令失败（continue_on_error=false） | 中断后续命令 | `{"ok":false,"note":"[中断] 第 N 条命令执行失败，后续命令已跳过"}` |
| 单条命令失败（continue_on_error=true） | 继续执行后续命令 | 结果列表中包含失败项，最终 status=error |
| 未知模块 | `else` 分支 | `{"status":"error","error":"未知模块: foo"}` |
| 未捕获异常 | `main()` 顶层 `try/except` | `{"status":"error","error":"RuntimeError: ..."}` |

**原则**：
- Python 内部捕获所有异常，包装为 `{"status":"error", "error":"..."}` 输出
- 不直接 `sys.exit(1)`（除非参数格式错误），让调用方决定如何处理错误
- 错误信息使用中文，因为最终读者是 LLM（system prompt 是中文）

### 5.10 依赖管理

```
# requirements.txt（或 pyproject.txt）
pyvisa>=1.13.0
pyvisa-py>=0.7.0      # 纯 Python 后端，不依赖 NI-VISA
```

- `asglib` 由设备厂商提供，不在 PyPI 上，需单独安装
- Python 版本要求：>= 3.10（使用 `match` 语句等现代语法）
- 所有依赖在插件安装时通过 `pip install -r requirements.txt` 安装

### 5.11 测试验证

| 验证项 | 方法 | 预期 |
|---|---|---|
| SCPI 单条写入 | `echo '{"commands":[{"address":"...","command":"*RST"}]}' \| python -m py scpi` | 返回 `{"status":"ok","result":{"results":[{"ok":true,"written":true}]}}` |
| SCPI 单条查询 | `echo '{"commands":[{"address":"...","command":"*IDN?"}]}' \| python -m py scpi` | 返回 `{"status":"ok","result":{"results":[{"ok":true,"response":"..."}]}}` |
| SCPI 多条写入 | `echo '{"commands":[{"...},{...},{...}]}' \| python -m py scpi` | 返回所有命令的执行结果 |
| SCPI 出错即停 | `echo '{"commands":[{...},{...}],"continueOnError":false}' \| python -m py scpi` | 第 1 条失败则跳过后续，返回中断提示 |
| SCPI 出错继续 | `echo '{"commands":[{...},{...}],"continueOnError":true}' \| python -m py scpi` | 第 1 条失败仍继续，结果列表包含失败项 |
| SCPI 连接断开 | 断开仪器后发送命令 | 返回 `{"ok":false,"error":"VISA 错误: ..."}` |
| ASG 单条调用 | `echo '{"calls":[{"func":"ASG_Init"}]}' \| python -m py asg` | 返回 `{"status":"ok","result":{"results":[{"ok":true,"result":1}]}}` |
| ASG 多条调用 | `echo '{"calls":[{...},{...},{...}]}' \| python -m py asg` | 返回所有调用的执行结果 |
| ASG 出错即停 | `echo '{"calls":[{...},{...}],"continueOnError":false}' \| python -m py asg` | 第 1 条失败则跳过后续 |
| ASG 出错继续 | `echo '{"calls":[{...},{...}],"continueOnError":true}' \| python -m py asg` | 第 1 条失败仍继续 |
| ASG 函数不存在 | `echo '{"calls":[{"func":"ASG_Foo"}]}' \| python -m py asg` | 返回 `{"ok":false,"error":"函数不存在: ASG_Foo"}` |
| 设备扫描 | `python -m py scan` | 返回设备列表 + 更新 JSON 文件 |
| PyVISA 未安装 | 卸载 PyVISA 后扫描 | 跳过 VISA 扫描，仅返回 ASG 设备 |
| 未知模块 | `python -m py foo` | 返回 `{"status":"error","error":"未知模块: foo"}` |
| JSON 解析失败 | 手动构造非法 stdout | TypeScript 侧返回原始文本 + 错误提示 |
| 超时 | 设置 `timeoutMs: 1` | `shell.run()` 返回 `timedOut: true` |
