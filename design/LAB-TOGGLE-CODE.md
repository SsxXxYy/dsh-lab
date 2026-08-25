# /lab 切换机制 v4 — 动态服务注册

> 用完整代码解释 `/lab` 如何实现插件开关切换。
> **v4 变更**：`/lab` 改为动态服务注册/注销模式。lab 模式状态从 `src/commands.ts` 的模块级 `Set` 改为 **Cordis 服务注册/注销**；命令、上下文、Client 都通过 `inject = ['lab']` 声明依赖，由 Cordis 自动管理激活/休眠。

---

## 1. 核心问题

`/lab` 命令执行后，如何让 Host 侧的状态变化影响到：
1. **Host 侧**：工具注册/注销、System Prompt 注入/卸载
2. **Client 侧**：UI 组件渲染/隐藏

---

## 2. 三角色分工

| 角色 | 文件 | 职责（与 /lab 相关） |
|---|---|---|
| **Service Definition** | `src/service.ts` | 定义 `LabService` 抽象类 |
| **Service Provider** | `src/lab-agent-local.ts` | `LabLocal` 实现：**构造函数注册服务，dispose 自动注销** |
| **Consumer（元命令）** | `src/commands.ts` | 注册 `/lab` 命令，调用 `ctx.plugin(LabLocal)` / `ctx.registry.delete(LabLocal)` + projection 翻转 |
| **Consumer（工具）** | `src/tools.ts` | 声明 `inject = ['tools', 'lab']`，服务注册后自动激活 |
| **Consumer（上下文）** | `src/context.ts` | 声明 `inject = ['systemPrompt', 'lab']`，服务注册后自动激活 |
| **Client** | `client/client.ts` | 检查服务是否存在，条件渲染 UI |

**关键变化（v4）**：`labModeSessions` 不再存在于任何位置；`isEnabled()` 不再是服务方法；服务的注册/注销由 Cordis 原生机制管理。

---

## 3. Service Definition：`src/service.ts`

```ts
// src/service.ts — Service Definition 角色
import type { Context } from '@deepseek-ai/cordis'
import { Service } from '@deepseek-ai/cordis'

// 类型声明合并：让消费方可以写 ctx.lab
declare module '@deepseek-ai/cordis' {
  interface Context {
    lab: LabService
  }
}

export abstract class LabService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'lab')   // 注册服务名：'lab'
  }

  // ---- 抽象接口（Consumer 使用：commands.ts / context.ts / tools.ts）----

  /** 扫描仪器（/devices 命令与 scan_instruments 工具共用） */
  abstract scanInstruments(): Promise<ScanInstrumentsResult>

  /** 读仪器文档 */
  abstract readDocument(request: ReadDocumentRequest): Promise<string>

  /** 读工作流文件 */
  abstract readWorkflow(request: ReadWorkflowRequest): Promise<string>

  /** 新建工作流 */
  abstract createWorkflow(request: CreateWorkflowRequest): Promise<string>

  /** 修改工作流 */
  abstract updateWorkflow(request: UpdateWorkflowRequest): Promise<string>

  /** 删除工作流 */
  abstract deleteWorkflow(request: DeleteWorkflowRequest): Promise<string>

  /** 发单条 SCPI 命令 */
  abstract sendScpi(request: SendScpiRequest): Promise<SendScpiResult>

  /** 发单条 ASG SDK 调用 */
  abstract sendAsg(request: SendAsgRequest): Promise<SendAsgResult>

  /** 列出所有工作流（System Prompt section 使用） */
  abstract listWorkflows(): Promise<Array<{ name: string; description: string }>>

  /** 重命名设备 */
  abstract renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult>
}
```

**要点**：
- 继承 Cordis 的 `Service` 基类，构造函数调用 `super(ctx, 'lab')` 注册服务
- 类型声明合并让消费方可以写 `ctx.lab`
- **不需要 `toggle()` / `isEnabled()`**——服务的注册/注销由 Cordis 管理

---

## 4. Service Provider：`src/lab-agent-local.ts`

```ts
// src/lab-agent-local.ts — Service Provider 角色
import type { Context } from '@deepseek-ai/cordis'
import { LabService } from './service'
import type { ScanInstrumentsResult, SendScpiResult, SendAsgResult } from './service'

class LabLocal extends LabService {
  // ============================================================
  // 构造函数链 LabLocal → LabService → Service
  // 自动调用 ctx.reflect.provide('lab', self)
  // 服务的存在本身就是"开启"，不需要 labModeSessions Set
  // ============================================================

  async scanInstruments(): Promise<ScanInstrumentsResult> {
    const result = await this.ctx.shell.run(this.ctx.shell.resolve({
      command: 'python -m dsh_lab.scan',
      timeoutMs: 30000,
    }))
    return { devices: [], text: result.stdout.text }
  }

  async sendScpi(request: SendScpiRequest): Promise<SendScpiResult> {
    const result = await this.ctx.shell.run(this.ctx.shell.resolve({
      command: `python -m dsh_lab.send_scpi ${JSON.stringify(request)}`,
      timeoutMs: 30000,
    }))
    return { ok: true, text: result.stdout.text }
  }

  async sendAsg(request: SendAsgRequest): Promise<SendAsgResult> {
    // ... Python 执行
  }

  async readDocument(request: ReadDocumentRequest): Promise<string> {
    // ... Python 执行
  }

  async readWorkflow(request: ReadWorkflowRequest): Promise<string> {
    // ... Python 执行
  }

  // ... 其他方法实现
}

export const name = 'dsh-lab-provider'

export function apply(ctx: Context) {
  ctx.plugin(LabLocal)   // 注册 Provider，挂载 'lab' 服务
}
```

**要点**：
- **继承 `LabService`**（继承链：`LabLocal → LabService → Service`）
- **服务注册在构造函数中自动完成**：`LabLocal` 实例化 → `LabService` 构造函数 → `Service` 构造函数 → `ctx.reflect.provide('lab', self)`
- **服务注销在 fiber dispose 时自动完成**：`ctx.registry.delete(LabLocal)` → fiber dispose → effect cleanup → `delete store['lab']`
- 不需要 `labModeSessions` Set，不需要 `toggle()` 方法
- 未来替换为远程 Provider（`lab-remote`）时，只需新增一个继承 `LabService` 的类，Consumer 全部不变
- **服务注销在 fiber dispose 时自动完成**：`ctx.registry.delete(LabLocal)` → fiber dispose → effect cleanup → `delete store['lab']`
- 不需要 `labModeSessions` Set，不需要 `toggle()` 方法
- 未来替换为远程 Provider（`lab-remote`）时，只需新增一个类，Consumer 全部不变

---

## 5. Consumer（元命令）：`src/commands.ts`

```ts
// src/commands.ts — Consumer 角色（/lab 部分）
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-agent-local'

export const name = 'dsh-lab-meta'
export const inject = ['commands']   // 只依赖命令运行时，始终可用

export function apply(ctx: Context) {
  // ======== /lab — 元命令（注册/注销服务）========
  ctx.commands.register({
    name: 'lab',
    description: '切换实验模式（启用/关闭仪器控制插件）',
    handler: async () => {
      if (!ctx.registry.has(LabLocal)) {
        // ── 开启：注册服务 ──
        ctx.plugin(LabLocal)
        return {
          kind: 'success',
          text: '实验模式已启用。\n可用功能：\n- /devices 扫描仪器\n- /new 新建会话\n- /rename 重命名设备\n- 直接对话控制仪器',
        }
      } else {
        // ── 关闭：注销服务 ──
        ctx.registry.delete(LabLocal)
        return {
          kind: 'success',
          text: '实验模式已关闭。仪器控制功能已禁用。',
        }
      }
    },
  })

  // ======== /devices — 依赖 lab 服务 ========
  ctx.commands.register({
    name: 'devices',
    description: '扫描连接的仪器设备',
    handler: async () => {
      // 能走到这里，说明 lab 服务一定存在
      const result = await ctx.lab.scanInstruments()
      return { kind: 'success', text: result.text }
    },
  })

  // ======== /new — 依赖 lab 服务 ========
  ctx.commands.register({
    name: 'new',
    description: '新建会话（清空对话）',
    handler: async () => {
      return { kind: 'success', text: '已新建会话' }
    },
  })

  // ======== /rename — 依赖 lab 服务 ========
  ctx.commands.register({
    name: 'rename',
    description: '重命名设备',
    input: { hint: '<编号或序列号> <新名称>' },
    handler: async (invocation) => {
      const raw = invocation.rawInput.trim()
      if (!raw) {
        return { kind: 'error', text: '用法: /rename <编号或序列号> <新名称>' }
      }
      const [id, ...nameParts] = raw.split(/\s+/)
      const name = nameParts.join(' ')
      if (!id || !name) {
        return { kind: 'error', text: '用法: /rename <编号或序列号> <新名称>' }
      }
      const result = await ctx.lab.renameDevice({ id, name })
      return { kind: 'success', text: result.text }
    },
  })
}
```

**要点**：
- `/lab` 元命令的 `inject` 只包含 `['commands']`，所以始终可用
- `ctx.registry.has(LabLocal)` 检查是否已注册，防止重复注册
- `ctx.plugin(LabLocal)` 注册服务 → Cordis 自动通知所有 `inject` 包含 `'lab'` 的消费者
- `ctx.registry.delete(LabLocal)` 注销服务 → Cordis 自动 dispose 所有相关消费者
- `/devices`、`/new`、`/rename` 的 `inject` 包含 `['commands', 'lab']`，lab 服务存在时才激活

---

## 6. Consumer（工具）：`src/tools.ts`

```ts
// src/tools.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-lab-tools'
export const inject = ['tools', 'lab']   // lab 不存在 → 此文件不执行

export function apply(ctx: Context) {
  const lab = ctx.lab   // 能走到这里，说明 lab 一定存在

  ctx.tools.register(defineTool({
    name: 'send_scpi',
    description: '向仪器发送单条 SCPI 命令。',
    parameters: {
      address: { type: 'string', required: true },
      command: { type: 'string', required: true },
      delay: { type: 'number', description: '执行后延迟（秒），默认 0' },
    },
    async execute(args) {
      // 不需要检查 isEnabled()，服务存在就能执行
      const result = await lab.sendScpi(args)
      return result.text
    },
  }))

  // ... 其他工具
}
```

**要点**：
- `inject = ['tools', 'lab']` — lab 服务不存在时，`apply()` 不执行，工具自然不可用
- 不需要任何 `isEnabled()` 检查
- 服务注销后，Cordis 自动 dispose 消费者 fiber，工具自动注销

---

## 7. Consumer（上下文）：`src/context.ts`

```ts
// src/context.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-lab-context'
export const inject = ['systemPrompt', 'lab']   // lab 不存在 → 此文件不执行

export function apply(ctx: Context) {
  // 仪器状态（每步刷新，lab 服务注册后自动生效）
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

  // 文档索引（固定内容，lab 服务注册后自动生效）
  ctx.systemPrompt.section({
    name: 'lab:documents',
    order: 201,
    text: () => {
      return [
        '## 可用仪器文档',
        '- DG.md（DG800/DG900 SCPI 命令参考）',
        '- DHO.md（DHO800/DHO900 SCPI 命令参考）',
        '- ASG24100.md（ASG24100 SDK 接口参考）',
        '使用 read_document 查阅',
      ].join('\n')
    },
  })

  // 工作流索引（每步刷新，lab 服务注册后自动生效）
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

function formatInventory(devices: Array<{ name: string; model: string; serial: string }>): string {
  return devices.map((d, i) =>
    `  ${i + 1}. ${d.name || d.model} (${d.serial})`
  ).join('\n')
}
```

---

## 8. 装配：`src/index.ts`

```ts
// src/index.ts — 插件入口（只注册元命令）
import type { Context } from '@deepseek-ai/cordis'
import * as meta from './commands'

export const name = 'dsh-lab'
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.plugin(meta)   // 注册 /lab 元命令（以及 /devices、/new、/rename）
}
```

> 每个 Consumer 文件自带 `inject` 声明，Cordis 保证 `ctx.lab` 就绪后才执行对应 `apply`。

---

## 9. Client 侧：订阅 Projection 控制侧边栏

### 9.1 渲染策略

Client 通过订阅 Session Projection 感知 lab 服务状态：
- **projection `active: true`** → 注入 CSS 隐藏侧边栏
- **projection `active: false`** → 移除 CSS 恢复侧边栏

使用 `ctx.effect` + `face.subscribe()` 实现响应式更新。

```ts
// client/client.ts — Client 侧
import type { Context } from '@deepseek-ai/cordis'

const STYLE_ID = 'dsh-lab/hide-sidebar'
const HIDE_SIDEBAR_CSS = 'html div:has(> [data-shell-overlay]){grid-template-columns:0 minmax(0,1fr) 0 !important}'

export const name = 'dsh-lab-client'
export const inject = ['slots', 'sessions']

export function apply(ctx: Context) {
  let tag: HTMLStyleElement | null = null

  function update(active: boolean) {
    if (active && !tag) {
      if (typeof document === 'undefined') return
      tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-lab'
      tag.dataset.pluginCss = STYLE_ID
      tag.textContent = HIDE_SIDEBAR_CSS
      document.head.appendChild(tag)
    } else if (!active && tag) {
      tag.remove()
      tag = null
    }
  }

  ctx.effect(function () {
    // 订阅当前 session 的 projection
    const binding = ctx.sessions.binding(sessionId)
    const face = binding.session.projections.faceOf('dsh-lab:state')

    // subscribe 回调不传参数，必须手动 getSnapshot()
    const unsub = face.subscribe(function () {
      const state = face.getSnapshot()
      update(state ? state.active : false)
    })

    // 读取初始值
    const initial = face.getSnapshot()
    if (initial) update(initial.active)

    return unsub
  }, 'dsh-lab: projection subscription')
}
```

**要点**：
- `inject = ['slots', 'sessions']` — 不需要 `remote`/`remote.lab` 依赖
- 使用 `ctx.effect` 管理订阅生命周期
- `face.subscribe(callback)` 回调不传参数，必须 `face.getSnapshot()` 读取
- 纯 DOM 操作注入 CSS，不依赖 React
- 监听 `ctx.sessions.list` 变化以在会话切换时重新订阅

---

## 10. 执行流程（带代码）

```
用户输入 /lab
  │
  ├─ Input Machine 检测到 `/` 触发
  ├─ detectTrigger() 返回 { trigger: "/", query: "lab" }
  ├─ 输入进入 "claimed" 状态
  │
  ├─ 用户回车 → matchEnter() → runDetached()
  ├─ ctx.remote.commands.execute(agent, "/lab", signal)
  │    │
  │    ▼ (Typert RPC 跨越 Host 与 Client 边界)
  │  Host: commands.execute(agent, "/lab", signal)
  │  Host: handler 执行
  │    ├─ ctx.registry.has(LabLocal)？
  │    │    │
  │    │    ├─ false → ctx.plugin(LabLocal)
  │    │    │    → LabLocal 构造函数
  │    │    │    → Service 构造函数
  │    │    │    → ctx.reflect.provide('lab', self)   ← 服务注册到 store
  │    │    │    → notify(['lab'])                     ← 通知所有依赖者
  │    │    │    → verify 消费者 fiber._refresh()
  │    │    │    → 依赖满足 → 自动执行 apply()
  │    │    │
  │    │    └─ true → ctx.registry.delete(LabLocal)
  │    │         → dispose LabLocal 的 fiber
  │    │         → fiber.effect cleanup
  │    │         → delete store['lab']                  ← 服务从 store 删除
  │    │         → notify(['lab'])                       ← 通知所有依赖者
  │    │         → verify 消费者 fiber._refresh()
  │    │         → 依赖断开 → 自动 dispose()
  │    │
  │    └─ 返回 { kind: "success", text: "实验模式已启用/关闭" }
  │
  ├─ Client: 显示执行结果
  │
  ├─ command/done 事件提交
  │    │
  │    ▼
  │  SessionProjectionRegistry.drive(session, event)
  │    │  apply(state, {type:'command/done', data:{commandId, kind, text}})
  │    │  → 读取 registry 实际状态：ctx.root.registry.has(LabLocal)
  │    │
  │    ▼
  │  Object.is(next, state)? → 变化 → onChanged → broadcast
  │    │
  │    ▼（WebSocket）
  │  Client: face.subscribe 回调 → face.getSnapshot() → update(active)
  │
  └─ 后续对话中（如果开启了）：
       ├─ ctx.systemPrompt.section 的 text() 被调用
       ├─ ctx.lab.scanInstruments()    ← 服务存在，正常执行
       ├─ 返回仪器/文档/工作流索引
       └─ LLM 看到上下文 → 可以调用仪器控制工具
```

---

## 11. 对比 v3 与 v4

| | v3（布尔标志 + @Remote） | v4（动态注册 + Projection） |
|---|---|---|
| **状态存储** | `LabLocal.labModeSessions` Set | Session Projection（`{ active: boolean }`） |
| **开启方式** | `labModeSessions.add(sessionId)` | `ctx.plugin(LabLocal)` + projection 读取 registry |
| **关闭方式** | `labModeSessions.delete(sessionId)` | `ctx.registry.delete(LabLocal)` + projection 读取 registry |
| **消费者检查** | `if (!ctx.lab.isEnabled(id)) return ''` | 无（`inject = ['lab']` 保证） |
| **工具可用性** | 工具始终可调用（遗漏检查） | 服务注销后工具自动消失 |
| **新增消费者** | 必须记得写 `isEnabled()` 检查 | 只需声明 `inject = ['lab']` |
| **状态一致性** | 多处检查，容易遗漏 | 单一事实来源：projection 状态 |
| **代码量** | `isEnabled()` 散落各处 | 零检查 |
| **Remote 依赖** | `TypertRemoteService` + `@Remote` | 无（纯抽象类） |
| **Client 同步** | `ctx.remote.lab.isEnabledByClient()` | Projection push → CSS 注入 |
| **Client 依赖** | `inject = ['remote', 'remote.lab', 'slots']` | `inject = ['slots', 'sessions']` |
| **状态持久化** | 不持久化（Set 内存） | 非持久化（启动时清理残留注册） |

---

## 12. 已知边界

- **动态注册依赖**：`/lab` 依赖 Cordis 的 `ctx.plugin()` 运行时注册能力，需框架版本 ≥ 4.0.1
- **上下文层级**：`/lab` 需注册到 root context（`ctx.root.plugin()`）以确保全局可见
- **防止重复注册**：`ctx.registry.has(LabLocal)` 检查，避免重复 `ctx.plugin()` 调用
- **服务名冲突**：`LabService` 注册名为 `'lab'`，不可与其他插件服务名冲突
- **Fiber 生命周期**：服务注册后，fiber 的生命周期由 Cordis 管理；`ctx.registry.delete()` 会 dispose 所有关联 fiber
- **Projection 可见性**：client-visible projection 必须提供 `wire: { viewSchema, view }` 块
- **`command/done` 事件无 `name` 字段**：DSH 事件结构为 `{ commandId, kind, text }`，`apply` 不能按命令名过滤，响应所有 `command/done` 事件后读取 registry
- **启动时状态重置**：`index.ts` 在插件加载时一次性清理残留注册，确保重启后 `active` 默认为 `false`（非持久化）
- **会话隔离**：服务注册是全局的，但侧边栏状态（projection）是每会话的
- **`face.subscribe` 回调**：不传参数，必须 `face.getSnapshot()` 读取当前值
