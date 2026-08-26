# 实现清单 — 中间层设计

---

## 1. 总体架构：三角色 + 中间层

dsh-lab 采用**三角色架构**，中间层是连接 DSH Agent（LLM）和 Python 执行引擎的桥梁：

```
DSH Agent（LLM）
  → 调用工具：send_scpi(address, command)
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
          ▼ python -m dsh_lab.<module> [JSON_ARGS]

Python 执行引擎（dsh_lab/*）
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
| **Python 可独立测试** | 直接 `python -m dsh_lab.scpi '{...}'` 验证 |
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
dsh_lab/
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
- 3 个上下文方法：`listWorkflows`
- 对应的 Request/Result 接口（如 `SendScpiRequest`、`SendScpiResult` 等）
- 声明合并：让消费方可以写 `ctx.lab`

---

### 3.2 Service Provider（`src/lab-local.ts`）

**角色**：实现 `LabService`，是唯一知道 Python 的模块。

**当前状态**：空壳 `LabLocal`，什么都没实现。

**实现策略**：

| 方法 | 实现方式 |
|---|---|
| `scanInstruments` | 调 Python：`python -m dsh_lab.scan` |
| `readDocument` | TypeScript 直接读文件 + 按行/章节切片 |
| `readWorkflow` | TypeScript 直接读文件 |
| `createWorkflow` | TypeScript 写文件（YAML frontmatter + Markdown） |
| `updateWorkflow` | TypeScript 读 → 改 → 写 |
| `deleteWorkflow` | TypeScript 删文件夹 |
| `sendScpi` | 调 Python：`python -m dsh_lab.scpi` |
| `sendAsg` | 调 Python：`python -m dsh_lab.asg` |
| `renameDevice` | TypeScript 读写 JSON |
| `listWorkflows` | TypeScript 读目录 + 解析 frontmatter |

**关键点**：
- 文件操作在 TypeScript 中直接完成，无需跨进程通信
- Python 只负责硬件通信，通过 `ctx.shell.run()` 走 DSH 沙箱机制
- 硬件调用参数通过 CLI 参数传递，结果通过 stdout JSON 返回

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

**当前状态**：**文件不存在**。

**设计要点**：
- `inject = ['systemPrompt', 'lab']`
- 三个 section：
  - `lab:instruments`（order: 200，每步刷新）— 当前连接的仪器列表
  - `lab:documents`（order: 201，固定）— 可用文档索引
  - `lab:workflows`（order: 202，每步刷新）— 可用工作流列表
- LLM 无需额外调用即可知道可用资源

---

### 3.5 Consumer — 斜杠命令（`src/commands.ts` 扩展）

**角色**：注册 `/lab` 元命令 + `/devices` `/new` `/rename` 三个斜杠命令。

**当前状态**：只有 `/lab` 元命令。

**设计要点**：
- `/lab` 元命令的 `inject` 只包含 `['commands']`，不包含 `lab`，所以始终可用
- `/devices` `/new` `/rename` 属于另一个 Consumer 文件（如 `src/slash-commands.ts`），声明 `inject = ['commands', 'lab']`
- 它们只在 lab 服务注册后才可用，注销后自动消失

---

## 实现推进

### 步骤 1：Service Definition（`src/service.ts`）

定义所有 Request/Result 类型和抽象方法：

```typescript
// src/service.ts — Service Definition
import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'

// ── Request/Result 类型 ──

export interface ScanInstrumentsResult {
  devices: Array<{ name: string; model: string; serial: string; kind: 'visa' | 'asg' }>
  text: string
}

export interface ReadDocumentRequest {
  filename: string
  lines?: string
  section?: string
}

export interface ReadWorkflowRequest {
  name: string
}

export interface CreateWorkflowRequest {
  folder_name: string
  name?: string
  description?: string
}

export interface UpdateWorkflowRequest {
  name: string
  frontmatter?: Record<string, unknown>
  section_title?: string
  section_content?: string
  append?: string
}

export interface DeleteWorkflowRequest {
  name: string
}

export interface SendScpiRequest {
  address: string
  command: string
  delay?: number
}

export interface SendScpiResult {
  ok: boolean
  text: string
}

export interface SendAsgRequest {
  func: string
  args?: unknown[]
  kwargs?: Record<string, unknown>
  delay?: number
}

export interface SendAsgResult {
  ok: boolean
  text: string
}

export interface RenameDeviceRequest {
  id: string
  name: string
}

export interface RenameDeviceResult {
  ok: boolean
  text: string
}

// ── 抽象类 ──

export abstract class LabService extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'lab')
  }

  // 工具方法
  abstract scanInstruments(): Promise<ScanInstrumentsResult>
  abstract readDocument(request: ReadDocumentRequest): Promise<string>
  abstract readWorkflow(request: ReadWorkflowRequest): Promise<string>
  abstract createWorkflow(request: CreateWorkflowRequest): Promise<string>
  abstract updateWorkflow(request: UpdateWorkflowRequest): Promise<string>
  abstract deleteWorkflow(request: DeleteWorkflowRequest): Promise<string>
  abstract sendScpi(request: SendScpiRequest): Promise<SendScpiResult>
  abstract sendAsg(request: SendAsgRequest): Promise<SendAsgResult>

  // 命令方法
  abstract renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult>

  // 上下文方法
  abstract listWorkflows(): Promise<Array<{ name: string; description: string }>>
}

// 声明合并：让消费方可以写 ctx.lab
declare module '@deepseek-ai/cordis' {
  interface Context {
    lab: LabService
  }
}
```

---

### 步骤 2：Service Provider（`src/lab-local.ts`）

实现所有方法，文件操作直接处理，硬件调用走 Python：

```typescript
// src/lab-local.ts — Service Provider
import fs from 'node:fs'
import path from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { LabService } from './service.js'
import type {
  SendScpiRequest, SendScpiResult,
  SendAsgRequest, SendAsgResult,
  ReadDocumentRequest, ReadWorkflowRequest,
  CreateWorkflowRequest, UpdateWorkflowRequest,
  DeleteWorkflowRequest, RenameDeviceRequest, RenameDeviceResult,
  ScanInstrumentsResult,
} from './service.js'

// ── 路径常量 ──
const _INVENTORY_PATH = path.join(__dirname, '..', 'devices', 'devices_inventory.json')
const _DOCS_DIR = path.join(__dirname, '..', 'Documents')
const _WORKFLOW_DIR = path.join(__dirname, '..', 'Workflow')

export class LabLocal extends LabService {
  // ── 仪器发现（需 Python 硬件通信）──
  async scanInstruments(): Promise<ScanInstrumentsResult> {
    const result = await this.runPython('scan', {})
    return { devices: result.devices ?? [], text: result.text }
  }

  // ── 文档操作（TypeScript 直接读文件）──
  async readDocument(request: ReadDocumentRequest): Promise<string> {
    const filePath = path.join(_DOCS_DIR, request.filename)
    if (!fs.existsSync(filePath)) return `错误：文件不存在：${request.filename}`
    const allLines = fs.readFileSync(filePath, 'utf-8').split('\n')
    if (request.lines) {
      const [s, e] = request.lines.split('-').map(Number)
      if (isNaN(s) || isNaN(e)) return '错误：行区间格式错误，应为 23-36'
      const start = Math.max(1, s)
      const end = Math.min(allLines.length, e)
      return `[${request.filename}:${start}-${end}]\n` + allLines.slice(start - 1, end).join('\n')
    }
    if (request.section) {
      const idx = allLines.findIndex(l => l.includes(request.section))
      if (idx === -1) return `未找到章节：${request.section}`
      let end = idx + 1
      while (end < allLines.length && !allLines[end].startsWith('## ')) end++
      return `[${request.filename}:${request.section}]\n` + allLines.slice(idx, end).join('\n')
    }
    return `[${request.filename}]\n` + allLines.slice(0, 20).join('\n') + '\n...(使用 lines 或 section 参数读取具体内容)'
  }

  // ── 工作流管理（TypeScript 直接读写文件）──
  async readWorkflow(request: ReadWorkflowRequest): Promise<string> {
    const safe = _safeFolderName(request.name)
    const mdPath = path.join(_WORKFLOW_DIR, safe, `${safe}.md`)
    if (!fs.existsSync(mdPath)) return `错误：找不到工作流 ${safe}`
    return fs.readFileSync(mdPath, 'utf-8')
  }

  async createWorkflow(request: CreateWorkflowRequest): Promise<string> {
    const safe = _safeFolderName(request.folder_name)
    const targetDir = path.join(_WORKFLOW_DIR, safe)
    if (fs.existsSync(targetDir)) return `错误：${safe} 已存在`
    fs.mkdirSync(targetDir, { recursive: true })
    const fm = { name: request.name || safe, description: request.description || '' }
    const yamlBlock = _dumpYaml(fm)
    const mdPath = path.join(targetDir, `${safe}.md`)
    fs.writeFileSync(mdPath, `---\n${yamlBlock}\n---\n\n`, 'utf-8')
    return `已创建工作流：${safe}`
  }

  async updateWorkflow(request: UpdateWorkflowRequest): Promise<string> {
    const safe = _safeFolderName(request.name)
    const mdPath = path.join(_WORKFLOW_DIR, safe, `${safe}.md`)
    if (!fs.existsSync(mdPath)) return `错误：找不到工作流 ${safe}`
    const content = fs.readFileSync(mdPath, 'utf-8')
    const [yamlText, body] = _parseFrontmatter(content)
    let newYaml = yamlText
    let newBody = body
    if (request.frontmatter) {
      const fm = _parseYaml(yamlText) || {}
      Object.assign(fm, request.frontmatter)
      newYaml = _dumpYaml(fm)
    }
    if (request.section_title && request.section_content) {
      newBody = _replaceSection(body, request.section_title, request.section_content)
    }
    if (request.append) {
      newBody = newBody.trimEnd() + `\n${request.append}\n`
    }
    fs.writeFileSync(mdPath, `---\n${newYaml}\n---\n\n${newBody}`.trimEnd() + '\n', 'utf-8')
    return `已更新工作流：${safe}`
  }

  async deleteWorkflow(request: DeleteWorkflowRequest): Promise<string> {
    const safe = _safeFolderName(request.name)
    const targetDir = path.join(_WORKFLOW_DIR, safe)
    if (!fs.existsSync(targetDir)) return `错误：找不到工作流 ${safe}`
    fs.rmSync(targetDir, { recursive: true, force: true })
    return `已删除工作流：${safe}`
  }

  // ── 仪器控制（需 Python 硬件通信）──
  async sendScpi(request: SendScpiRequest): Promise<SendScpiResult> {
    const out = await this.runPython('scpi', request)
    return { ok: out.status === 'ok', text: out.text ?? out.error ?? '' }
  }

  async sendAsg(request: SendAsgRequest): Promise<SendAsgResult> {
    const out = await this.runPython('asg', request)
    return { ok: out.status === 'ok', text: out.text ?? out.error ?? '' }
  }

  // ── 命令方法（TypeScript 直接读写 JSON）──
  async renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult> {
    const inventory = _loadInventory()
    let serial = request.id
    if (/^\d+$/.test(request.id)) {
      const idx = parseInt(request.id) - 1
      const keys = Object.keys(inventory)
      if (idx < 0 || idx >= keys.length) return { ok: false, text: `编号 ${request.id} 超出范围` }
      serial = keys[idx]
    }
    if (!inventory[serial]) return { ok: false, text: `未找到设备: ${request.id}` }
    inventory[serial].name = request.name
    _saveInventory(inventory)
    return { ok: true, text: request.name ? `已重命名为: ${request.name}` : `已取消命名` }
  }

  // ── 上下文方法（TypeScript 直接读文件）──
  async listWorkflows(): Promise<Array<{ name: string; description: string }>> {
    const workflows: Array<{ name: string; description: string }> = []
    if (!fs.existsSync(_WORKFLOW_DIR)) return workflows
    for (const item of fs.readdirSync(_WORKFLOW_DIR)) {
      const itemPath = path.join(_WORKFLOW_DIR, item)
      if (!fs.statSync(itemPath).isDirectory()) continue
      const mdFile = path.join(itemPath, `${item}.md`)
      if (!fs.existsSync(mdFile)) continue
      const content = fs.readFileSync(mdFile, 'utf-8')
      const m = content.match(/^---\s*\n(.*?)\n---/s)
      if (m) {
        const fm = _parseYaml(m[1])
        workflows.push({ name: item, description: fm?.description || '' })
      }
    }
    return workflows
  }

  // ── 内部：调用 Python 子进程（仅硬件操作）──
  private async runPython(module: string, args: Record<string, unknown>): Promise<any> {
    const spec = ctx.shell.resolve({
      command: `python -m dsh_lab.${module} '${JSON.stringify(args)}'`,
      timeoutMs: 30000,
    })
    const result = await ctx.shell.run(spec)
    if (result.exitCode !== 0) {
      throw new Error(`Python 执行失败: ${result.stderr.text}`)
    }
    return JSON.parse(result.stdout.text)
  }
}

// ── 文件操作辅助函数 ──

function _loadInventory(): Record<string, any> {
  try { return JSON.parse(fs.readFileSync(_INVENTORY_PATH, 'utf-8')) } catch { return {} }
}

function _saveInventory(inv: Record<string, any>): void {
  fs.mkdirSync(path.dirname(_INVENTORY_PATH), { recursive: true })
  fs.writeFileSync(_INVENTORY_PATH, JSON.stringify(inv, null, 2), 'utf-8')
}

function _safeFolderName(name: string): string {
  return name.replace(/[^\w\-一-鿿]/g, '_').trim()
}

function _parseFrontmatter(content: string): [string, string] {
  const m = content.match(/^---\s*\n(.*?)\n---\s*\n?/s)
  return m ? [m[1], content.slice(m[0].length)] : ['', content]
}

function _parseYaml(text: string): any {
  // 简单 YAML 解析，生产环境可用 js-yaml
  const result: any = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)/)
    if (m) result[m[1]] = m[2].trim()
  }
  return result
}

function _dumpYaml(obj: any): string {
  return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n')
}

function _replaceSection(body: string, title: string, content: string): string {
  const lines = body.split('\n')
  const idx = lines.findIndex(l => l.trim() === title.trim())
  if (idx === -1) return body.trimEnd() + `\n\n${title}\n${content}\n`
  let end = idx + 1
  while (end < lines.length && !lines[end].startsWith('## ')) end++
  lines.splice(idx, end - idx, title, content)
  return lines.join('\n')
}

export const name = 'dsh-lab-provider'

export function apply(ctx: Context) {
  ctx.plugin(LabLocal)
  console.log('[dsh-lab:provider] LabLocal registered')
}
```

---

### 步骤 3：Consumer — 工具注册（`src/tools.ts`）

新建文件，注册 8 个工具：

```typescript
// src/tools.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-lab-tools'
export const inject = ['tools', 'lab']

export function apply(ctx: Context) {
  const lab = ctx.lab

  ctx.tools.register(defineTool({
    name: 'scan_instruments',
    description: '扫描 VISA + ASG 仪器设备，更新设备库存',
    parameters: {},
    async execute() {
      return (await lab.scanInstruments()).text
    },
  }))

  ctx.tools.register(defineTool({
    name: 'read_document',
    description: '按行区间或章节读取仪器文档。LLM 通过阅读文档理解 SCPI/ASG 命令。',
    parameters: {
      filename: { type: 'string', required: true },
      lines: { type: 'string', description: '行区间，如 23-36' },
      section: { type: 'string', description: '章节名' },
    },
    async execute(args) {
      return await lab.readDocument(args)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'read_workflow',
    description: '读取工作流文件内容。LLM 阅读后自行决定如何执行。',
    parameters: { name: { type: 'string', required: true } },
    async execute(args) {
      return await lab.readWorkflow(args)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'create_workflow',
    description: '新建工作流文件',
    parameters: {
      folder_name: { type: 'string', required: true },
      name: { type: 'string' },
      description: { type: 'string' },
    },
    async execute(args) {
      return await lab.createWorkflow(args)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'update_workflow',
    description: '修改工作流文件',
    parameters: {
      name: { type: 'string', required: true },
      frontmatter: { type: 'object' },
      section_title: { type: 'string' },
      section_content: { type: 'string' },
      append: { type: 'string' },
    },
    async execute(args) {
      return await lab.updateWorkflow(args)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'delete_workflow',
    description: '删除工作流文件',
    parameters: { name: { type: 'string', required: true } },
    async execute(args) {
      return await lab.deleteWorkflow(args)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'send_scpi',
    description: '向仪器发送单条 SCPI 命令。用于执行工作流中的单个步骤。',
    parameters: {
      address: { type: 'string', required: true },
      command: { type: 'string', required: true },
      delay: { type: 'number', description: '执行后延迟（秒），默认 0' },
    },
    async execute(args) {
      return (await lab.sendScpi(args)).text
    },
  }))

  ctx.tools.register(defineTool({
    name: 'send_asg',
    description: '向 ASG 设备发送单条 SDK 调用。用于执行工作流中的单个步骤。',
    parameters: {
      func: { type: 'string', required: true },
      args: { type: 'array' },
      kwargs: { type: 'object' },
      delay: { type: 'number', description: '执行后延迟（秒），默认 0' },
    },
    async execute(args) {
      return (await lab.sendAsg(args)).text
    },
  }))
}
```

---

### 步骤 4：Consumer — System Prompt 上下文（`src/context.ts`）

新建文件，注册 3 个 section：

```typescript
// src/context.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-lab-context'
export const inject = ['systemPrompt', 'lab']

export function apply(ctx: Context) {
  // 仪器状态（每步刷新）
  ctx.systemPrompt.section({
    name: 'lab:instruments',
    order: 200,
    text: async () => {
      const result = await ctx.lab.scanInstruments()
      if (!result.devices.length) return ''
      return `## 当前连接的仪器\n${formatInventory(result.devices)}`
    },
  })

  // 文档索引（固定内容）
  ctx.systemPrompt.section({
    name: 'lab:documents',
    order: 201,
    text: () => [
      '## 可用仪器文档',
      '- DG.md（DG800/DG900 SCPI 命令参考）',
      '- DHO.md（DHO800/DHO900 SCPI 命令参考）',
      '- ASG24100.md（ASG24100 SDK 接口参考）',
      '使用 read_document 查阅',
    ].join('\n'),
  })

  // 工作流索引（每步刷新）
  ctx.systemPrompt.section({
    name: 'lab:workflows',
    order: 202,
    text: async () => {
      const workflows = await ctx.lab.listWorkflows()
      if (!workflows.length) return ''
      const lines = workflows
        .map((w) => `  - ${w.name}（${w.description || '无描述'}）`)
        .join('\n')
      return `## 可用工作流\n${lines}\n使用 read_workflow 阅读，然后逐步执行`
    },
  })
}

function formatInventory(devices: Array<{ name: string; model: string; serial: string }>): string {
  return devices.map((d, i) => `  ${i + 1}. ${d.name || d.model} (${d.serial})`).join('\n')
}
```

---

### 步骤 5：Consumer — 斜杠命令（`src/slash-commands.ts`）

新建文件，注册 `/devices` `/new` `/rename`：

```typescript
// src/slash-commands.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-lab-slash'
export const inject = ['commands', 'lab']

export function apply(ctx: Context) {
  const lab = ctx.lab

  ctx.commands.register({
    name: 'devices',
    description: '扫描连接的仪器设备',
    handler: async () => {
      try {
        const result = await lab.scanInstruments()
        return { kind: 'success', text: result.text }
      } catch (error) {
        return { kind: 'error', text: `扫描失败: ${(error as Error).message}` }
      }
    },
  })

  ctx.commands.register({
    name: 'new',
    description: '新建会话（清空对话）',
    handler: async () => {
      return { kind: 'success', text: '已新建会话' }
    },
  })

  ctx.commands.register({
    name: 'rename',
    description: '重命名设备',
    input: { hint: '<编号或序列号> <新名称>' },
    handler: async (invocation) => {
      const raw = invocation.rawInput?.trim() || ''
      if (!raw) {
        return { kind: 'error', text: '用法: /rename <编号或序列号> <新名称>' }
      }
      const [id, ...nameParts] = raw.split(/\s+/)
      const name = nameParts.join(' ')
      if (!id || !name) {
        return { kind: 'error', text: '用法: /rename <编号或序列号> <新名称>' }
      }
      try {
        const result = await lab.renameDevice({ id, name })
        return result.ok
          ? { kind: 'success', text: result.text }
          : { kind: 'error', text: result.text }
      } catch (error) {
        return { kind: 'error', text: `重命名失败: ${(error as Error).message}` }
      }
    },
  })
}
```

---

### 步骤 6：入口注册（`src/index.ts`）

更新入口，注册所有消费者：

```typescript
// src/index.ts — 插件入口
import type { Context } from '@deepseek-ai/cordis'
import * as meta from './commands.js'
import * as projection from './projection.js'
import * as tools from './tools.js'
import * as context from './context.js'
import * as slash from './slash-commands.js'

export const name = 'dsh-lab'
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.plugin(meta)        // /lab 元命令
  ctx.plugin(projection)  // Session Projection
  ctx.plugin(tools)       // 工具注册（inject: ['tools', 'lab']）
  ctx.plugin(context)     // System Prompt 上下文（inject: ['systemPrompt', 'lab']）
  ctx.plugin(slash)       // 斜杠命令（inject: ['commands', 'lab']）
}
```

**说明**：`tools`、`context`、`slash` 都声明了 `inject` 依赖 `lab`，只有 `/lab` 触发 `ctx.plugin(LabLocal)` 后才会激活。

---

### 步骤 7：更新 `src/commands.ts`

现有文件保持不变，只注册 `/lab` 元命令：

```typescript
// src/commands.ts — Consumer 角色（元命令）
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-local.js'

export const name = 'dsh-lab-meta'
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.commands.register({
    name: 'lab',
    description: '切换实验模式（启用/关闭仪器控制插件）',
    handler: async () => {
      const wasRegistered = ctx.root.registry.has(LabLocal)
      if (!wasRegistered) {
        ctx.root.plugin(LabLocal)
        return { kind: 'success', text: '实验模式已启用。' }
      } else {
        ctx.root.registry.delete(LabLocal)
        return { kind: 'success', text: '实验模式已关闭。' }
      }
    },
  })
}
```

---

### 当前状态

| 文件 | 状态 |
|---|---|
| `src/service.ts` | ✅ 抽象方法 + 类型 |
| `src/lab-local.ts` | ✅ 文件操作 + Python 调用 |
| `src/tools.ts` | ✅ 8 个工具注册 |
| `src/context.ts` | ✅ 3 个 system prompt section |
| `src/slash-commands.ts` | ✅ `/devices` `/new` `/rename` |
| `src/index.ts` | ✅ 入口注册 |
| `src/commands.ts` | ✅ 保持不变 |
| `dsh_lab/scan.py` | ❌ 待实现 |
| `dsh_lab/scpi.py` | ❌ 待实现 |
| `dsh_lab/asg.py` | ❌ 待实现 |

