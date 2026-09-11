# dsh-lab Host 端开发指南

> `src/` 目录下的 TypeScript 源码开发指南。

---

## 1. 文件结构

```
src/
├── index.ts                 # 插件入口：加载所有 Consumer
├── service.ts               # Service Definition：LabService 抽象类 + 类型定义
├── lab-local.ts             # Service Provider：LabLocal 实现（文件操作 + Python 调用）
├── tools.ts                 # Consumer（工具）：8 个 DSH 工具注册
├── commands.ts              # Consumer（元命令）：/lab 命令
├── context.ts               # Consumer（上下文）：System Prompt section 注入
├── projection.ts            # Consumer（投影）：Session Projection 状态推送
├── projection-types.ts      # Projection schema（LabState + LabStateSchema）
├── context-augment.d.ts     # Context 声明合并（systemPrompt、lab 等类型）
└── types/
    ├── dsh-tools.d.ts       # ctx.tools 模块合并声明
    └── dsh-tools-module.d.ts # @deepseek-ai/dsh-tools 模块类型声明
```

---

## 2. 文件角色详解

### 2.1 Service Definition（`service.ts`）

定义 `LabService` 抽象类，是所有 Consumer 依赖的接口。

```ts
export abstract class LabService extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'lab')
  }

  // ── 上下文相关方法（同步，供 system prompt section 使用）──
  abstract readMarkdown(filename: string): string
  abstract readInventory(): DevicesInventory
  abstract listDocuments(): DocumentMeta[]
  abstract listWorkflows(): WorkflowMeta[]

  // ── 工具相关方法（异步，供工具调用）──
  abstract scanInstruments(): Promise<ScanInstrumentsResult>
  abstract readDocument(request: ReadDocumentRequest): Promise<string>
  abstract readWorkflow(request: ReadWorkflowRequest): Promise<string>
  abstract createWorkflow(request: CreateWorkflowRequest): Promise<string>
  abstract updateWorkflow(request: UpdateWorkflowRequest): Promise<string>
  abstract deleteWorkflow(request: DeleteWorkflowRequest): Promise<string>
  abstract sendScpi(request: SendScpiRequest): Promise<SendScpiResult>
  abstract sendAsg(request: SendAsgRequest): Promise<SendAsgResult>

  // ── 命令相关方法（异步，供斜杠命令使用）──
  abstract renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult>
}
```

**类型定义**（同文件导出）：
- `DeviceInfo` — 设备信息接口
- `DevicesInventory` — 设备清单（Record<serial, DeviceInfo>）
- `DocumentMeta` — 文档元数据（filename, name, description, index）
- `WorkflowMeta` — 工作流元数据（name, description）
- `ScanInstrumentsResult` — 仪器扫描结果
- `ReadDocumentRequest` / `ReadWorkflowRequest` — 文档/工作流读取参数
- `CreateWorkflowRequest` / `UpdateWorkflowRequest` / `DeleteWorkflowRequest` — 工作流管理参数
- `SendScpiRequest` / `SendScpiResult` — SCPI 命令参数/结果
- `SendAsgRequest` / `SendAsgResult` — ASG 调用参数/结果
- `RenameDeviceRequest` / `RenameDeviceResult` — 设备重命名参数/结果

### 2.2 Service Provider（`lab-local.ts`）

实现 `LabLocal`，是唯一知道文件系统和 Python 的模块。

```ts
export class LabLocal extends LabService {
  // ── 上下文方法（同步）──
  readMarkdown(filename: string): string { /* ... */ }
  readInventory(): DevicesInventory { /* ... */ }
  listDocuments(): DocumentMeta[] { /* ... */ }
  listWorkflows(): WorkflowMeta[] { /* ... */ }

  // ── 文件操作工具（异步，TypeScript 直接处理）──
  async readDocument(request: ReadDocumentRequest): Promise<string> { /* ... */ }
  async readWorkflow(request: ReadWorkflowRequest): Promise<string> { /* ... */ }
  async createWorkflow(request: CreateWorkflowRequest): Promise<string> { /* ... */ }
  async updateWorkflow(request: UpdateWorkflowRequest): Promise<string> { /* ... */ }
  async deleteWorkflow(request: DeleteWorkflowRequest): Promise<string> { /* ... */ }
  async renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult> { /* ... */ }

  // ── 硬件操作工具（异步，调用 Python 子进程）──
  async scanInstruments(): Promise<ScanInstrumentsResult> { /* ctx.shell.run("python -m py.scan") */ }
  async sendScpi(request: SendScpiRequest): Promise<SendScpiResult> { /* 一次提交整批命令给 Python */ }
  async sendAsg(request: SendAsgRequest): Promise<SendAsgResult> { /* 一次提交整批调用给 Python */ }
}
```

**关键点**：
- 上下文方法**同步**返回（DSH system prompt API 要求）
- 工具方法**异步**返回（涉及文件 I/O 和子进程）
- 使用 `import.meta.url` 定位项目根目录，不依赖 `process.cwd()`
- 文件操作在 TypeScript 中直接完成（`readFileSync` / `writeFileSync` / `rmSync`）
- 硬件操作通过 `ctx.shell.run()` 调用 Python 子进程
- 设备清单 JSON 以序列号为 key
- frontmatter 解析支持 `name`、`description`、`index` 字段
- 目录不存在时安全返回空数组

### 2.3 Consumer — 工具注册（`tools.ts`）

把 `LabService` 方法暴露为 DSH 模型可调用的工具。

```ts
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-lab-tools'
export const inject = ['tools', 'lab']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'scan_instruments',
    description: '扫描当前连接的 VISA 和 ASG 仪器设备，更新设备清单。',
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute() {
      const result = await ctx.lab.scanInstruments()
      return result.text
    },
  }))
  // ... 其他 7 个工具
}
```

**工具清单**：

| 工具名 | 类型 | 实现方式 | 说明 |
|---|---|---|---|
| `scan_instruments` | exclusive | Python | 扫描 VISA + ASG 设备 |
| `read_document` | parallel | TypeScript | 按行区间/章节读文档 |
| `read_workflow` | parallel | TypeScript | 读工作流文件 |
| `create_workflow` | exclusive | TypeScript | 新建工作流 |
| `update_workflow` | exclusive | TypeScript | 修改工作流 |
| `delete_workflow` | exclusive | TypeScript | 删除工作流 |
| `send_scpi` | exclusive | Python | 发多条 SCPI 命令（批次） |
| `send_asg` | exclusive | Python | 发多条 ASG SDK 调用（批次） |

**要点**：
- `inject = ['tools', 'lab']` — 声明依赖工具运行时 + lab 服务
- 服务不存在时 `apply()` 不执行，工具自然不可用
- 工具只调 `ctx.lab.*`，不知道 Python 存在
- `isConcurrencySafe: () => true` 声明可并行的只读工具

### 2.4 Consumer — 元命令（`commands.ts`）

注册 `/lab` 命令，控制服务生命周期。

```ts
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.commands.register({
    name: 'lab',
    description: '切换实验模式（启用/关闭仪器控制插件）',
    handler: async () => {
      if (!ctx.root.registry.has(LabLocal)) {
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

### 2.5 Consumer — 上下文注入（`context.ts`）

注册 4 个 system prompt section，`text` 回调同步返回字符串。

```ts
export const inject = ['systemPrompt', 'lab']

export function apply(ctx: Context) {
  ctx.systemPrompt.section({
    name: 'lab:role',
    order: 100,
    text: () => ctx.lab.readMarkdown('role.md'),
  })
  // ... 其他 3 个 section
}
```

**Section 清单**：

| Section | order | 内容 | 数据来源 |
|---|---|---|---|
| `lab:role` | 100 | 角色定位 + 意图判断 + 操作流程 + 行为准则 + 工具使用 | `content/role.md` |
| `lab:instruments` | 200 | 当前连接的仪器列表 | `devices/devices_inventory.json` |
| `lab:documents` | 201 | 可用仪器文档索引 | `docs/*.md` frontmatter |
| `lab:workflows` | 202 | 可用工作流列表 | `workflows/*/*.md` frontmatter |

### 2.6 Consumer — 投影（`projection.ts`）

追踪 lab 服务状态，推送给 Client。

```ts
export const inject = ['sessionProjections']

export function apply(ctx: Context) {
  ctx.sessionProjections.register({
    key: 'dsh-lab:state',
    schema: LabStateSchema,
    init: (): LabState => ({
      active: ctx.root.registry.has(LabLocal),
    }),
    apply: (state, event) => {
      if (event.type === 'command/done') {
        return { active: ctx.root.registry.has(LabLocal) }
      }
      return state ?? { active: ctx.root.registry.has(LabLocal) }
    },
    wire: { viewSchema: LabStateSchema, view: (state) => state },
    stateVersion: 1,
  })
}
```

---

## 3. 开发约定

- 注释和文档使用**简体中文**
- 控制台日志使用 `[dsh-lab:模块名]` 前缀
- 源码内部导入使用 `.js` 后缀（NodeNext ESM）
- 每个插件文件导出 `name`、`inject`、`apply`
- **上下文方法必须同步返回**（DSH system prompt API 要求）
- **工具方法必须异步返回**（涉及文件 I/O 和子进程）
- Python 调用通过 `ctx.shell.run()`，不走 `child_process` 直接 spawn

---

## 4. 依赖注入模式

### 4.1 inject 声明

```ts
export const inject = ['tools', 'lab']

export function apply(ctx: Context) {
  const lab = ctx.lab
}
```

### 4.2 服务访问方式

| 方式 | 代码 | 场景 |
|---|---|---|
| inject 声明 | `export const inject = ['lab']` | 标准用法，自动管理 |
| ctx.get | `const lab = ctx.get('lab')` | 手动检查 |
| registry 检查 | `ctx.root.registry.has(LabLocal)` | 底层判断 |

---

## 6. 路径解析

使用 `import.meta.url` 定位项目根目录：

```ts
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url))
const CONTENT_DIR = join(PROJECT_ROOT, 'content')
const DOCS_DIR = join(PROJECT_ROOT, 'docs')
const WORKFLOW_DIR = join(PROJECT_ROOT, 'workflows')
const INVENTORY_PATH = join(PROJECT_ROOT, 'devices', 'devices_inventory.json')
```

| 环境 | 解析结果 |
|---|---|
| 开发模式 | `D:\Dsh\dsh-lab\` |
| 安装后 | `C:\Users\...\node_modules\dsh-lab\` |

---

## 7. Python 引擎调用

硬件操作通过 `ctx.shell.run()` 调用 Python 子进程：

```ts
// SCPI 批次命令（一次提交整批）
const result = await shell.run({
  command: `python -m py scpi`,  // 注意：py 和 scpi 之间有空格
  stdin: JSON.stringify({
    commands: request.commands,  // [{address, command, delay?}]
    continueOnError: request.continueOnError ?? false,
  }),
  timeoutMs: 30000 * request.commands.length,  // 每条命令最多 30s
  workdir: PROJECT_ROOT,  // 插件根目录，确保能找到 py 模块
})

// 解析返回
const parsed = JSON.parse(result.stdout.text)
if (parsed.status === 'ok') {
  // parsed.result.results 是每条命令的执行结果数组
  return { ok: true, text: formatResults(parsed.result.results) }
}
```

**通信协议**：
- TypeScript → Python：stdin 传递 JSON（含 `commands` 数组 + `continueOnError`）
- Python → TypeScript：stdout 输出 `{"status":"ok","result":{"results":[...]}}` 或 `{"status":"error","error":"..."}`
- 超时按命令数量线性计算：`30000 * commands.length`
- 循环在 Python 里处理，TypeScript 只调一次 `shell.run()`
- 命令格式：`python -m py <module>`（注意是空格不是点），运行 `py/__main__.py` 并传入模块名
- 参数通过 stdin 传递，避免 Windows 命令行引号转义问题

---

## 8. 调试日志

打开浏览器控制台，过滤 `[dsh-lab]` 查看完整链路：

```
[dsh-lab:cmd] ✓ 实验模式已启用（上下文注入已激活）
[dsh-lab:tools] ✓ 工具注册已激活（lab 服务已注册）
[dsh-lab:context] ✓ 上下文注入已激活（lab 服务已注册）
[dsh-lab:projection] state changed: false -> true
[dsh-lab:context] lab:role 已注入 617 字符
[dsh-lab:context] lab:instruments 已注入 2 个设备
[dsh-lab:context] lab:documents 已注入 3 个文档
[dsh-lab:context] lab:workflows 已注入 1 个工作流
```

---

## 9. 已知边界与踩坑

| 问题 | 解决方案 |
|---|---|
| `text.indexOf is not a function` | 上下文方法必须同步返回字符串，不能 async |
| `ENOENT: docs/` | 目录不存在时返回空数组，不报错 |
| `ENOENT: content/role.md` | 使用 `import.meta.url` 定位，不用 `process.cwd()` |
| Projection 必须提供 `wire` 块 | 添加 `wire: { viewSchema, view }` |
| `command/done` 事件无 `name` 字段 | 响应所有事件后读取 registry |
| `face.subscribe` 回调不传参数 | 回调内必须手动 `face.getSnapshot()` |
| `node_modules` 下不能暴露 `.ts` 入口 | 分发时入口必须是预编译的 `.js` |
| 顶栏隐藏用 `display:none` | 不能用 `grid-template-rows:0`（会压缩聊天窗口） |
| `inject` 声明即检查 | 不需要手动 `isEnabled()` 判断 |
| `@deepseek-ai/dsh-tools` 类型缺失 | 在 `src/types/` 添加本地声明文件 |
| Python 子进程 stdout 截断 | 通过 JSON 通信，避免大量输出 |
| SCPI/ASG 批次超时 | 超时按命令数量线性计算：`30000 * commands.length` |
| `continueOnError` 策略 | 默认出错即停；设为 true 可继续执行后续命令/调用 |
| 沙箱策略回退 | `_getSandboxPolicy()` 优先从 `ctx.sandboxPolicy` 获取，未配置时回退到 `{ mode: 'workspace-write', workspaceRoot: process.cwd() }` |

---

## 10. 新增 Consumer 指南

1. 创建文件 `src/xxx.ts`
2. 导出 `name`、`inject`、`apply`
3. `inject` 声明依赖（如 `['tools', 'lab']`）
4. 在 `src/index.ts` 中 `ctx.plugin(xxx)` 加载

---

## 11. 预设同步功能（已移除，保留参考）

> **当前状态：已移除，未来如需实现可参考以下设计。**

### 11.1 功能说明

插件安装时自动将包内 `presets/lab/` 目录同步到 `~/.dsh/.agent-presets/lab/`。

### 11.2 实现步骤

1. `presets/lab/preset.yml` + `agent.cordis.yml`
2. `src/sync.ts` — `syncPresetTrees()`
3. `src/dsh-home.ts` — `dshHome()`
4. `src/mount-once.ts` — `mountOnce()`
5. `index.ts` — `syncPresets()`
6. `package.json` — `files: ["presets"]`
