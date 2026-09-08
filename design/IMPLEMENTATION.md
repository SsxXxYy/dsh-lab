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
| `listDocuments` | TypeScript 读目录 + 解析 frontmatter |
| `readInventory` | TypeScript 读 `devices/devices_inventory.json` |
| `readMarkdown` | TypeScript 读 `content/*.md` 文件 |

**关键点**：
- 文件操作在 TypeScript 中直接完成，无需跨进程通信
- Python 只负责硬件通信，通过 `ctx.shell.run()` 走 DSH 沙箱机制
- 硬件调用参数通过 CLI 参数传递，结果通过 stdout JSON 返回
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

## 4. 上下文加载文档实现（`src/context.ts`）

> 本文档详细描述 System Prompt 上下文注入的实现，对应大纲第 3.4 节「Consumer — System Prompt 上下文」。

### 4.1 职责定位

`src/context.ts` 是 Consumer 角色，负责在每轮 Agent Loop 中自动向 system prompt 注入四类上下文。

**内容文件化原则**：角色定位、工作流程、提示词等静态文本不硬编码在 TypeScript 代码里，而是存为 `content/*.md` Markdown 文件，通过 `ctx.lab.readMarkdown(filename)` 加载。改文案不用改代码，不用重新构建。

| Section | order | 内容 | 刷新时机 | 数据来源 |
|---|---|---|---|---|
| `lab:role` | 100 | 角色定位 + 工具使用指南 | 固定 | `content/role.md`（通过 `readMarkdown` 加载） |
| `lab:instruments` | 200 | 当前连接的仪器列表 + 状态 | 每步 | `devices/devices_inventory.json` 文件 |
| `lab:documents` | 201 | 可用仪器文档索引 + 章节目录 | 每步 | `docs/*.md` 文件的 YAML frontmatter |
| `lab:workflows` | 202 | 可用工作流列表 + frontmatter | 每步 | `workflows/*/*.md` 文件的 YAML frontmatter |

**设计原则**：
- **角色定位优先**：在注入资源列表前，先告诉模型"你是谁、该怎么用这些资源"，避免模型面对一堆数据不知所措
- **仪器列表不扫描**：每步扫描硬件代价高昂（需启动 Python 子进程、查询 PyVISA），改为读取 `scan_instruments` 工具创建/更新的 JSON 缓存文件
- **文档索引不硬编码**：遍历 `docs/` 文件夹，解析每个 `.md` 文件的 YAML frontmatter，动态生成文档索引

### 4.2 依赖声明

```typescript
export const name = 'dsh-lab-context'
export const inject = ['systemPrompt', 'lab']
```

- `systemPrompt`：DSH 框架提供的 System Prompt 运行时，用于注册 section
- `lab`：LabService 服务，用于获取仪器/文档/工作流数据

**关键**：`inject` 包含 `lab`，意味着 lab 服务未注册时，`apply()` 不会执行，section 自然不存在。无需任何 `isEnabled()` 检查。

### 4.3 需要补充的 Service Definition

在 `src/service.ts` 中，上下文加载需要以下抽象方法：

```typescript
// src/service.ts — 上下文相关抽象方法
abstract readMarkdown(filename: string): Promise<string>
abstract listDocuments(): Promise<Array<{ filename: string; name: string; description: string; index: Array<{ title: string; line: number }> }>>
abstract listWorkflows(): Promise<Array<{ name: string; description: string }>>
abstract readInventory(): Promise<DevicesInventory>
```

| 方法 | 返回值 | 用途 |
|---|---|---|
| `readMarkdown(filename)` | Markdown 文本 | 加载 `content/*.md` 文件（角色定位、提示词等） |
| `readInventory()` | `DevicesInventory` | 读取设备清单 JSON，用于 `lab:instruments` |
| `listDocuments()` | 文档元数据数组 | 遍历 docs 文件夹解析 frontmatter，用于 `lab:documents` |
| `listWorkflows()` | 工作流元数据数组 | 遍历 workflows 文件夹解析 frontmatter，用于 `lab:workflows` |

**`DevicesInventory` 类型定义**：

```typescript
// src/service.ts — 设备清单类型
interface DeviceInfo {
  model: string
  address: string
  local_ip: string
  local_mac: string
  idn: string
  name: string
  kind: 'visa' | 'asg'
}

type DevicesInventory = Record<string, DeviceInfo>
```

### 4.4 完整实现代码

```typescript
// src/context.ts — Consumer 角色：System Prompt 上下文注入
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-lab-context'
export const inject = ['systemPrompt', 'lab']

export function apply(ctx: Context) {
  // ── 角色定位（固定内容，order 100 最先渲染）──
  // 从 content/role.md 加载，不硬编码在代码里
  ctx.systemPrompt.section({
    name: 'lab:role',
    order: 100,
    text: async () => {
      return await ctx.lab.readMarkdown('role.md')
    },
  })

  // ── 仪器状态（每步刷新，读 JSON 文件）──
  // 读取 scan_instruments 工具创建/更新的设备清单 JSON
  // 不调用 scanInstruments()，避免每步启动 Python 子进程
  ctx.systemPrompt.section({
    name: 'lab:instruments',
    order: 200,
    text: async () => {
      const inventory = await ctx.lab.readInventory()
      const devices = Object.entries(inventory)
      if (!devices.length) return ''
      return `## 当前连接的仪器\n${formatInventory(devices)}`
    },
  })

  // ── 文档索引（每步刷新，遍历 docs 文件夹解析 frontmatter）──
  // 动态读取 docs/*.md 文件的 YAML frontmatter，生成文档索引
  ctx.systemPrompt.section({
    name: 'lab:documents',
    order: 201,
    text: async () => {
      const documents = await ctx.lab.listDocuments()
      if (!documents.length) return ''
      return `## 可用仪器文档\n${formatDocuments(documents)}\n使用 read_document 查阅`
    },
  })

  // ── 工作流索引（每步刷新）──
  // 列出可用工作流，引导 LLM 使用 read_workflow 阅读并执行
  ctx.systemPrompt.section({
    name: 'lab:workflows',
    order: 202,
    text: async () => {
      const workflows = await ctx.lab.listWorkflows()
      if (!workflows.length) return ''
      const lines = workflows.map((w) =>
        `  - ${w.name}（${w.description || '无描述'}）`
      ).join('\n')
      return `## 可用工作流\n${lines}\n使用 read_workflow 阅读，然后逐步执行`
    },
  })
}

// 格式化仪器列表为可读文本
// devices: [serial, DeviceInfo][]
function formatInventory(devices: Array<[string, { name: string; model: string; address: string; local_ip: string }]>): string {
  // 区分在线/离线设备
  const online = devices.filter(([, d]) => d.address || d.local_ip)
  const offline = devices.filter(([, d]) => !d.address && !d.local_ip)

  const lines: string[] = []
  if (online.length) {
    lines.push('在线设备：')
    online.forEach(([serial, d], i) => {
      lines.push(`  ${i + 1}. ${d.name || d.model} (${serial})`)
    })
  }
  if (offline.length) {
    lines.push('离线设备：')
    offline.forEach(([serial, d], i) => {
      lines.push(`  ${i + 1}. ${d.name || d.model} (${serial}) [离线]`)
    })
  }
  return lines.join('\n')
}

// 格式化文档索引为可读文本
function formatDocuments(documents: Array<{ filename: string; name: string; description: string; index: Array<{ title: string; line: number }> }>): string {
  return documents.map((doc) => {
    let line = `- ${doc.filename}（${doc.name || doc.filename}）`
    if (doc.description) line += ` — ${doc.description}`
    if (doc.index.length) {
      line += `\n    章节：${doc.index.slice(0, 5).map((i) => `${i.title}(${i.line}行)`).join('、')}`
      if (doc.index.length > 5) line += ` 等${doc.index.length}个章节`
    }
    return line
  }).join('\n')
}
```

### 4.5 各 Section 设计要点

#### `lab:role`（order: 100）

- **最先渲染**：order 100 确保在仪器/文档/工作流列表之前出现，模型先知道"怎么用"，再看"有什么"
- **内容文件化**：角色定位文本存于 `content/role.md`，通过 `ctx.lab.readMarkdown('role.md')` 加载，不硬编码在代码里
- **易维护**：改文案只需编辑 Markdown 文件，不用改 TypeScript、不用重新构建
- **内容结构**（`content/role.md`）：
  1. 角色声明（"你是实验室仪器控制助手"）
  2. 工作流程（查看工作流 → 执行 → 查阅文档 → 直接控制）
  3. 工具使用时机（每个工具什么时候该用）
  4. 注意事项（delay、查询 vs 写命令、先读文档再执行）
- **引导作用**：模型看到下方文档章节行号时，知道用 `read_document(filename, lines)` 查阅；看到工作流列表时，知道用 `read_workflow` 阅读

#### `lab:instruments`（order: 200）

- **数据来源**：读取 `devices/devices_inventory.json` 文件，该文件由 `scan_instruments` 工具创建/更新
- **不调用扫描**：避免每步启动 Python 子进程扫描硬件，降低延迟
- **在线/离线区分**：根据 `address` 或 `local_ip` 字段是否为空判断设备是否在线
- **空列表处理**：清单为空时返回空字符串 `''`，section 不显示
- **刷新时机**：每步重新读取 JSON 文件，确保扫描后下次 Agent Loop 即生效

#### `lab:documents`（order: 201）

- **数据来源**：遍历 `docs/*.md` 文件，解析 YAML frontmatter
- **frontmatter 格式**：

  ```yaml
  ---
  name: DG800/DG900 SCPI 命令参考
  description: DG800 Pro 系列信号发生器的完整 SCPI 命令手册
  index:
    - title: ":SOURce 命令子系统"
      line: 1004
    - title: ":OUTPut 命令子系统"
      line: 1250
    - title: ":COUNter 命令子系统"
      line: 2300
  ---
  ```

- **动态生成**：新增/删除文档后，下次 Agent Loop 自动更新索引
- **章节摘要**：显示前 5 个章节及其行号，引导 LLM 使用 `read_document(filename, lines)` 精确定位

#### `lab:workflows`（order: 202）

- **数据来源**：遍历 `workflows/*/*.md` 文件，解析 YAML frontmatter
- **空列表处理**：无工作流时返回空字符串 `''`，section 不显示
- **刷新时机**：每步重新渲染，确保新建/删除工作流后立即生效

### 4.6 Service Provider 对应实现

`src/lab-local.ts` 需要实现以下方法：

```typescript
// src/lab-local.ts — 上下文相关方法实现
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const CONTENT_DIR = join(process.cwd(), 'content')
const INVENTORY_PATH = join(process.cwd(), 'devices', 'devices_inventory.json')
const DOCS_DIR = join(process.cwd(), 'docs')
const WORKFLOW_DIR = join(process.cwd(), 'workflows')

// ── 加载 content/ 目录下的 Markdown 文件 ──
async readMarkdown(filename: string): Promise<string> {
  const filePath = join(CONTENT_DIR, filename)
  return readFile(filePath, 'utf-8')
}

// ── 读取设备清单 ──
async readInventory(): Promise<DevicesInventory> {
  try {
    const text = await readFile(INVENTORY_PATH, 'utf-8')
    return JSON.parse(text) as DevicesInventory
  } catch {
    return {}
  }
}

// ── 遍历文档文件夹，解析 frontmatter ──
async listDocuments(): Promise<Array<{ filename: string; name: string; description: string; index: Array<{ title: string; line: number }> }>> {
  const entries = await readdir(DOCS_DIR, { withFileTypes: true })
  const mdFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.md'))

  const documents = await Promise.all(
    mdFiles.map(async (file) => {
      const filePath = join(DOCS_DIR, file.name)
      try {
        const content = await readFile(filePath, 'utf-8')
        const match = content.match(/^---\n([\s\S]*?)\n---/)
        if (!match) return { filename: file.name, name: '', description: '', index: [] }
        const frontmatter = parseDocumentFrontmatter(match[1])
        return {
          filename: file.name,
          name: frontmatter.name || '',
          description: frontmatter.description || '',
          index: frontmatter.index || [],
        }
      } catch {
        return { filename: file.name, name: '', description: '', index: [] }
      }
    })
  )

  return documents
}

// ── 遍历工作流文件夹，解析 frontmatter ──
async listWorkflows(): Promise<Array<{ name: string; description: string }>> {
  const entries = await readdir(WORKFLOW_DIR, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory())

  const workflows = await Promise.all(
    dirs.map(async (dir) => {
      const mdPath = join(WORKFLOW_DIR, dir.name, `${dir.name}.md`)
      try {
        const content = await readFile(mdPath, 'utf-8')
        const match = content.match(/^---\n([\s\S]*?)\n---/)
        if (!match) return { name: dir.name, description: '' }
        const frontmatter = parseWorkflowFrontmatter(match[1])
        return {
          name: frontmatter.name || dir.name,
          description: frontmatter.description || '',
        }
      } catch {
        return { name: dir.name, description: '' }
      }
    })
  )

  return workflows
}

// ── 文档 frontmatter 解析（含 index 数组）──
function parseDocumentFrontmatter(text: string): { name?: string; description?: string; index?: Array<{ title: string; line: number }> } {
  const result: { name?: string; description?: string; index?: Array<{ title: string; line: number }> } = {}
  const lines = text.split('\n')
  let currentKey: string | null = null
  let indexItems: Array<{ title: string; line: number }> = []

  for (const line of lines) {
    // 匹配简单字段（name / description）
    const simpleMatch = line.match(/^(\w+):\s*(.*)$/)
    if (simpleMatch && simpleMatch[1] !== 'index') {
      currentKey = simpleMatch[1]
      result[currentKey as keyof typeof result] = simpleMatch[2].trim()
      continue
    }

    // 匹配 index 数组项（格式：- title: "xxx"\n  line: 123）
    const indexTitleMatch = line.match(/^\s+-\s+title:\s*"?([^"]+)"?$/)
    if (indexTitleMatch) {
      indexItems.push({ title: indexTitleMatch[1], line: 0 })
      continue
    }
    const indexLineMatch = line.match(/^\s+line:\s*(\d+)$/)
    if (indexLineMatch && indexItems.length) {
      indexItems[indexItems.length - 1].line = Number(indexLineMatch[1])
    }
  }

  if (indexItems.length) result.index = indexItems
  return result
}

// ── 工作流 frontmatter 解析（仅 name / description）──
function parseWorkflowFrontmatter(text: string): { name?: string; description?: string } {
  const result: { name?: string; description?: string } = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (m && (m[1] === 'name' || m[1] === 'description')) {
      result[m[1]] = m[2].trim()
    }
  }
  return result
}
```

### 4.7 数据流

```
DSH Agent Loop (每步)
  │
  ├─ systemPrompt.assemble()
  │   │
  │   ├─ section "lab:instruments" 回调
  │   │   → ctx.lab.readInventory()
  │   │   → Provider: 读 devices/devices_inventory.json
  │   │   → 返回设备清单 → 格式化文本（区分在线/离线）
  │   │
  │   ├─ section "lab:documents" 回调
  │   │   → ctx.lab.listDocuments()
  │   │   → Provider: 遍历 docs/*.md → 解析 YAML frontmatter
  │   │   → 返回文档索引（含章节目录）→ 格式化文本
  │   │
  │   └─ section "lab:workflows" 回调
  │       → ctx.lab.listWorkflows()
  │       → Provider: 遍历 workflows/*/*.md → 解析 YAML frontmatter
  │       → 返回工作流列表 → 格式化文本
  │
  └─ 拼装后的 system prompt 发送给 LLM

── 扫描仪器工具调用时（非每步）──

用户: "扫描仪器" 或 scan_instruments 工具
  → ctx.lab.scanInstruments()
  → Provider: ctx.shell.run("python -m dsh_lab.scan")
  → Python: PyVISA 扫描 + ASG SDK 扫描
  → Python: 写入 devices/devices_inventory.json
  → 返回结果
  → 下次 Agent Loop 时 lab:instruments section 自动更新
```

### 4.8 效果示例

开启 `/lab` 后，LLM 每步收到的 system prompt 末尾自动追加：

```markdown
## 角色定位
你是实验室仪器控制助手。当前实验模式已启用，你可以操作真实的仪器设备。

### 工作流程
1. **查看可用工作流**：下方「可用工作流」列出了预定义的实验流程，用 `read_workflow(name)` 阅读步骤
2. **执行工作流**：阅读后按步骤调用 `send_scpi` / `send_asg` 控制仪器
3. **查阅文档**：如需确认命令语法，用 `read_document(filename, lines)` 按行号精确定位
4. **直接控制**：用户可以直接说"发 xxx 命令"，你查阅文档后执行

### 工具使用时机
- `read_workflow(name)`：用户要求执行某个工作流时
- `read_document(filename, lines)`：需要确认 SCPI/ASG 命令语法时（利用下方文档章节行号）
- `send_scpi(address, command)`：向仪器发送单条 SCPI 命令
- `send_asg(func, args)`：调用 ASG 设备 SDK 函数
- `scan_instruments`：用户要求扫描/刷新仪器列表时（会更新下方仪器列表）

### 注意事项
- 仪器有长有短，发送命令后必要时加 `delay` 参数等待
- 查询命令（以 `?` 结尾）会返回结果，写入命令不会
- 不确定命令格式时，先读文档再执行

## 当前连接的仪器
在线设备：
  1. 磁场控制源 (DG8R264801226)
  2. DHO814 (DHO8A272405406)
离线设备：
  1. 时序 (ASG241002324070090) [离线]

## 可用仪器文档
- DG.md（DG800/DG900 SCPI 命令参考）— DG800 Pro 系列信号发生器的完整 SCPI 命令手册
    章节：:SOURce 命令子系统(1004行)、:OUTPut 命令子系统(1250行)、:COUNter 命令子系统(2300行) 等8个章节
- DHO.md（DHO800/DHO900 SCPI 命令参考）— DHO900 系列示波器的完整 SCPI 命令手册
    章节：:TIMebase 命令子系统(120行)、:WAVeform 命令子系统(450行) 等6个章节
- ASG24100.md（ASG24100 SDK 接口参考）— ASG24100 信号源 SDK 接口与错误码表
    章节：:初始化接口(30行)、:波形配置接口(120行) 等4个章节
使用 read_document 查阅

## 可用工作流
  - DG双通道直流输出（设置 DG 信号发生器两个通道输出 2V 直流电压）
使用 read_workflow 阅读，然后逐步执行
```

### 4.10 content/role.md 示例

```markdown
## 角色定位
你是实验室仪器控制助手。当前实验模式已启用，你可以操作真实的仪器设备。

### 工作流程
1. **查看可用工作流**：下方「可用工作流」列出了预定义的实验流程，用 `read_workflow(name)` 阅读步骤
2. **执行工作流**：阅读后按步骤调用 `send_scpi` / `send_asg` 控制仪器
3. **查阅文档**：如需确认命令语法，用 `read_document(filename, lines)` 按行号精确定位
4. **直接控制**：用户可以直接说"发 xxx 命令"，你查阅文档后执行

### 工具使用时机
- `read_workflow(name)`：用户要求执行某个工作流时
- `read_document(filename, lines)`：需要确认 SCPI/ASG 命令语法时（利用下方文档章节行号）
- `send_scpi(address, command)`：向仪器发送单条 SCPI 命令
- `send_asg(func, args)`：调用 ASG 设备 SDK 函数
- `scan_instruments`：用户要求扫描/刷新仪器列表时（会更新下方仪器列表）

### 注意事项
- 仪器有长有短，发送命令后必要时加 `delay` 参数等待
- 查询命令（以 `?` 结尾）会返回结果，写入命令不会
- 不确定命令格式时，先读文档再执行
```

**文件位置**：`content/role.md`

**加载方式**：`ctx.lab.readMarkdown('role.md')`

**好处**：
- 改文案只需编辑 Markdown，不用改代码、不用重新构建
- 非技术人员也能编辑角色提示词
- 可轻松支持多语言（`content/role.zh.md`、`content/role.en.md`）

### 4.9 测试验证

| 验证项 | 方法 | 预期 |
|---|---|---|
| 服务未注册时无 section | 不输入 `/lab`，观察 system prompt | 无 lab 相关 section |
| 服务注册后 section 出现 | 输入 `/lab`，观察 system prompt | 四个 section 自动出现 |
| 角色定位最先出现 | 观察 section 顺序 | `lab:role` 在仪器/文档/工作流之前 |
| 角色内容从文件加载 | 修改 `content/role.md` 后输入 `/lab` | system prompt 显示修改后的内容 |
| 模型知道怎么用 | 观察 LLM 行为 | 看到工作流名称后主动调用 `read_workflow` |
| 仪器列表来自 JSON | 调用 scan_instruments 后观察 section | 设备列表与 JSON 文件一致 |
| 在线/离线区分 | 断开设备后调用 scan_instruments | 离线设备显示 `[离线]` 标记 |
| 文档索引动态生成 | 新增/删除 docs/*.md 后观察 section | 文档列表同步更新 |
| 文档章节目录显示 | 观察 lab:documents section | 显示前 5 个章节及行号 |
| 工作流索引实时更新 | 新建/删除工作流后观察 section | 工作流列表同步更新 |
| 空状态不显示 | 无设备/无文档/无工作流时 | 对应 section 不显示 |
| 不启动 Python 子进程 | 观察 system prompt 渲染时无 Python 调用 | 上下文加载不触发硬件扫描 |


