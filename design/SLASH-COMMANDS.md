# 斜杠命令实现方案 v4 — 动态服务注册 + 元命令

> 基于 DSH 命令系统的官方接口，给出原生实现方案。
> **v4 变更**：`/lab` 改为**元命令**（meta-command），通过 `ctx.plugin(LabLocal)` / `ctx.registry.delete(LabLocal)` 动态注册/注销 lab 服务。`/devices`、`/new`、`/rename` 由消费者自动注册（声明 `inject = ['commands', 'lab']`），lab 服务注销后自动不可用。移除所有 `isEnabled()` 检查。

---

## 1. DSH 命令系统架构

### 1.1 核心发现

DSH 命令系统**已经完整存在**，插件只需要在 Host 侧注册命令，Client 侧自动获得完整的命令菜单 UI：

```
┌──────────────────── Host 侧 ────────────────────┐
│  ctx.commands.register({                        │
│    name: "devices",                             │
│    description: "扫描连接的仪器设备",             │
│    handler: async (invocation) => {             │
│      // 执行逻辑                                 │
│      return { kind: "success", text: "..." };   │
│    }                                            │
│  })                                             │
│                                                 │
│  ── 自动通过 Typert RPC 暴露给 Client ──         │
│  ctx.remote.commands.list(agent)                │
│  ctx.remote.commands.execute(agent, line)       │
└─────────────────────────────────────────────────┘
                           │
                           │ Typert RPC
                           ▼
┌──────────────────── Client 侧 ──────────────────┐
│  dsh-client-ui-commands (已有)                   │
│  - 自动发现命令列表                               │
│  - 用户输入 / 时显示命令菜单                      │
│  - 用户选择后调用 execute()                       │
│  - 显示执行结果                                   │
└─────────────────────────────────────────────────┘
```

### 1.2 命令注册接口（官方定义）

```typescript
// Host 侧注册：ctx.commands.register({
interface CommandDefinition {
  name: string                    // 命令名（不含 /，小写）
  description: string             // 描述
  input?: { hint: string }        // 可选：非结构化输入提示
  recordInput?: boolean           // 是否记录输入到日志（默认 true）
  handler: (invocation: CommandInvocation) => CommandResult | Promise<CommandResult>
}
```

**注意（v4 修正）**：官方 `CommandDefinition` **没有 `available` 字段**。命令的"可用性"不由注册表控制——所有注册的命令对适配器均可见。在 v4 中，`/devices`、`/new`、`/rename` 等命令由消费者声明 `inject = ['commands', 'lab']`，lab 服务注销后消费者自动 dispose，命令自然消失。**不再需要 `isEnabled()` 检查**。

### 1.3 命令 = Consumer（元命令模式）

命令注册在 `src/commands.ts`，与工具一样只依赖 `LabService` 接口：

```ts
// src/commands.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-lab-commands'
export const inject = ['commands', 'lab']   // 声明依赖：命令运行时 + lab 服务

export function apply(ctx: Context) {
  ctx.commands.register({
    name: 'devices',
    description: '扫描连接的仪器设备',
    handler: async (invocation) => {
      // 能走到这里，说明 lab 服务一定存在，无需检查 isEnabled()
      const result = await ctx.lab.scanInstruments()
      return { kind: 'success', text: result.text }
    },
  })
}
```

**要点**：
- 命令**不直接持有** lab 模式状态
- 命令**不直接调用** `python -m dsh_lab.*`（Python 执行在 Provider 内部）
- 命令**不需要检查** `isEnabled()`——服务不存在时，`apply()` 根本不会执行
- 替换 Provider（如远程仪器）时，`src/commands.ts` 一行不用改

---

## 2. 命令清单

| 命令 | 类型 | 描述 | 参数 | 注册方式 |
|---|---|---|---|---|
| `/lab` | 元命令 | 注册/注销 lab 服务 | 无 | 元命令，始终可用 |
| `/devices` | Consumer 自动注册 | 扫描连接的仪器设备 | 无 | 声明 `inject = ['commands', 'lab']` |
| `/new` | Consumer 自动注册 | 新建会话（清空对话） | 无 | 声明 `inject = ['commands', 'lab']` |
| `/rename` | Consumer 自动注册 | 重命名设备 | `<编号或序列号> <新名称>` | 声明 `inject = ['commands', 'lab']` |

**服务开关语义**：
- 插件安装后默认**不激活**（lab 服务未注册），不影响正常对话
- 用户输入 `/lab` → `ctx.plugin(LabLocal)` → 服务注册 → 消费者自动激活 → UI 变化 + 提示词注入
- 再次输入 `/lab` → `ctx.registry.delete(LabLocal)` → 服务注销 → 消费者自动休眠 → 恢复普通对话

---

## 3. 元命令：`/lab`

`/lab` 是唯一需要手动注册的命令（元命令），负责控制 lab 服务的生命周期：

```ts
// src/index.ts — 入口注册（只注册元命令）
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-agent-local'
import * as meta from './commands'

export const name = 'dsh-lab'
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.plugin(meta)   // 注册 /lab 元命令
}
```

```ts
// src/commands.ts — /lab 元命令（始终可用）
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-agent-local'

export const name = 'dsh-lab-meta'
export const inject = ['commands']   // 只依赖命令运行时

export function apply(ctx: Context) {
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

  // ── /devices、/new、/rename 也在此文件注册 ──
  // 它们声明 inject = ['commands', 'lab']，lab 服务存在时才激活
  ctx.commands.register({
    name: 'devices',
    description: '扫描连接的仪器设备',
    handler: async () => {
      const result = await ctx.lab.scanInstruments()
      return { kind: 'success', text: result.text }
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
      const raw = invocation.rawInput.trim()
      if (!raw) {
        return { kind: 'error', text: '用法: /rename <编号或序列号> <新名称>' }
      }
      const [id, ...nameParts] = raw.split(/\s+/)
      const name = nameParts.join(' ')
      if (!id || !name) {
        return { kind: 'error', text: '用法: /rename <编号或序列号> <新名称>' }
      }
      try {
        const result = await ctx.lab.renameDevice({ id, name })
        return { kind: 'success', text: result.text }
      } catch (error) {
        return { kind: 'error', text: `重命名失败: ${(error as Error).message}` }
      }
    },
  })
}
```

**要点**：
- `/lab` 元命令的 `inject` 只包含 `['commands']`，不包含 `lab`，所以始终可用
- `/devices`、`/new`、`/rename` 的 `inject` 包含 `['commands', 'lab']`，lab 服务存在时才激活
- `ctx.registry.has(LabLocal)` 检查是否已注册，防止重复注册
- `ctx.plugin(LabLocal)` 注册服务 → Cordis 自动通知所有 `inject` 包含 `'lab'` 的消费者
- `ctx.registry.delete(LabLocal)` 注销服务 → Cordis 自动 dispose 所有相关消费者

---

## 4. 服务注册侧：`src/lab-agent-local.ts`

```ts
// src/lab-agent-local.ts — Service Provider 角色
import type { Context } from '@deepseek-ai/cordis'
import { LabService, type ScanInstrumentsResult } from './service'

class LabLocal extends LabService {
  // 服务的存在本身就是"开启"，不需要 labModeSessions Set

  async scanInstruments(): Promise<ScanInstrumentsResult> {
    const result = await this.ctx.shell.run(this.ctx.shell.resolve({
      command: 'python -m dsh_lab.scan',
      timeoutMs: 30000,
    }))
    return { devices: [], text: result.stdout.text }
  }

  async sendScpi(request): Promise<SendScpiResult> {
    // ... Python 执行
  }

  async sendAsg(request): Promise<SendAsgResult> {
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
- `LabLocal` 继承 `LabService`（继承链：`LabLocal → LabService → Service`）
- 构造函数自动调用 `ctx.reflect.provide('lab', self)`
- 服务的生命周期由 Cordis 管理：`ctx.registry.delete(LabLocal)` → fiber dispose → 服务自动注销
- 不需要 `labModeSessions` Set，服务的存在就是"开启"

---

## 5. 命令执行流程

### 5.1 /lab 开关流程

```
用户输入 /lab
  │
  ├─ Input Machine 检测 `/` 触发
  ├─ detectTrigger() → { trigger: "/", query: "lab" }
  ├─ Command Menu 打开
  ├─ ctx.remote.commands.list(agent) → 发现 ["lab"]
  ├─ 显示匹配的命令列表
  │
  ├─ 用户选择 /lab → 回车
  ├─ ctx.remote.commands.execute(agent, "/lab", signal)
  │    │
  │    ▼ (Typert RPC)
  │  Host: commands.execute(agent, "/lab", signal)
  │  Host: handler 执行
  │    ├─ ctx.registry.has(LabLocal)？
  │    │    ├─ false → ctx.plugin(LabLocal)
  │    │    │    → LabLocal 构造函数
  │    │    │    → ctx.reflect.provide('lab', self)
  │    │    │    → 服务注册到 store → notify(['lab'])
  │    │    │    → 所有 inject 包含 'lab' 的消费者 fiber._refresh()
  │    │    │    → 依赖满足 → 自动执行 apply()
  │    │    │    → 工具注册、System Prompt section 注册、命令注册
  │    │    │    → ctx.remote.commands.list 自动包含新命令
  │    │    │    → Client UI 自动渲染仪器面板
  │    │    └─ true → ctx.registry.delete(LabLocal)
  │    │         → dispose LabLocal 的 fiber
  │    │         → fiber.effect cleanup → delete store['lab'] → notify(['lab'])
  │    │         → 所有 inject 包含 'lab' 的消费者 fiber._refresh()
  │    │         → 依赖断开 → 自动 dispose()
  │    │         → 工具注销、System Prompt section 注销、命令注销
  │    │         → Client UI 自动隐藏仪器面板
  │    └─ 返回 { kind: "success", text: "..." }
  │
  └─ Client: 显示执行结果
```

### 5.2 /devices 执行流程

```
用户输入 /devices
  │
  ├─ Input Machine 检测 `/` 触发
  ├─ Command Menu 打开 → 用户选择 /devices
  ├─ ctx.remote.commands.execute(agent, "/devices", signal)
  │    │
  │    ▼ (Typert RPC)
  │  Host: commands.execute(agent, "/devices", signal)
  │  Host: handler 执行
  │    ├─ 能走到这里，说明 lab 服务一定存在（否则消费者 apply 不会执行）
  │    ├─ ctx.lab.scanInstruments()        ← Consumer 调服务接口
  │    │    └─ Provider: ctx.shell.run("python -m dsh_lab.scan")
  │    └─ 返回 { kind: "success", text: result.text }
  │
  └─ Client: 显示执行结果
```

---

## 6. 完整注册实现

```ts
// src/commands.ts — Consumer 角色（完整）
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-agent-local'

export const name = 'dsh-lab-meta'
export const inject = ['commands']

export function apply(ctx: Context) {
  // /lab - 元命令（始终可用，不依赖 lab 服务）
  ctx.commands.register({
    name: 'lab',
    description: '切换实验模式（启用/关闭仪器控制插件）',
    handler: async () => {
      if (!ctx.registry.has(LabLocal)) {
        ctx.plugin(LabLocal)
        return {
          kind: 'success',
          text: '实验模式已启用。可用命令：/devices（扫描仪器）、/new（新建会话）、/rename（重命名设备）',
        }
      } else {
        ctx.registry.delete(LabLocal)
        return {
          kind: 'success',
          text: '实验模式已关闭。仪器控制功能已禁用。',
        }
      }
    },
  })

  // /devices - 扫描仪器（依赖 lab 服务，自动激活/休眠）
  ctx.commands.register({
    name: 'devices',
    description: '扫描连接的仪器设备',
    handler: async () => {
      try {
        const result = await ctx.lab.scanInstruments()
        return { kind: 'success', text: result.text }
      } catch (error) {
        return { kind: 'error', text: `扫描失败: ${(error as Error).message}` }
      }
    },
  })

  // /new - 新建会话（依赖 lab 服务）
  ctx.commands.register({
    name: 'new',
    description: '新建会话（清空对话）',
    handler: async () => {
      return { kind: 'success', text: '已新建会话' }
    },
  })

  // /rename - 重命名设备（依赖 lab 服务）
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
      try {
        const result = await ctx.lab.renameDevice({ id, name })
        return { kind: 'success', text: result.text }
      } catch (error) {
        return { kind: 'error', text: `重命名失败: ${(error as Error).message}` }
      }
    },
  })
}
```

> 每个消费者文件（`src/tools.ts`、`src/context.ts`、`src/commands.ts`）都自带 `inject` 声明。
> `src/commands.ts` 的 `inject` 包含 `['commands', 'lab']`，Cordis 保证 `lab` 就绪后才执行对应 `apply`。
> `/lab` 元命令本身只依赖 `['commands']`，所以始终可用。

---

## 7. 与原 lab 的对比

| 原版 lab | DSH 插件版 |
|---|---|
| `Script/commands/` 注册器 + `SlashCommand` 类 | `ctx.commands.register(definition)` |
| `terminal_cli.py` 本地执行 | Provider 内执行（`ctx.lab` 方法 → Python 子进程） |
| `ChatPanel.tsx` 检查 `/` 前缀 + WebSocket | Input Machine 自动检查 `/` 触发 |
| `command_result` 帧返回结果 | `CommandResult` + 日志持久化 |
| 终端 + Web 共享命令注册器 | 命令通过 Typert RPC 自动同步 |
| 命令可用性由注册器判断 | 消费者 `inject = ['lab']` 声明，lab 服务注销后自动 dispose |
| `to_work`（模式切换） | `/lab` 元命令：`ctx.plugin(LabLocal)` / `ctx.registry.delete(LabLocal)` |

---

## 8. 关键发现

1. **不需要 Client 侧代码**：命令菜单 UI 由 `dsh-client-ui-commands` 提供，插件只需在 Host 侧注册命令。
2. **命令发现是自动的**：`ctx.remote.commands.list(agent)` 通过 Typert RPC 自动获取命令列表。消费者激活后命令自动出现，dispose 后命令自动消失。
3. **执行结果是结构化的**：`{ kind: "success", text }` 或 `{ kind: "error", text }`。
4. **支持参数命令**：通过 `input.hint` 提供参数提示，`rawInput` 获取用户输入参数。
5. **生命周期日志**：命令执行自动记录 `command/run` 与 `command/done` 事件，持久化到会话日志。
6. **服务注册即开关**：`/lab` 通过 `ctx.plugin(LabLocal)` 注册服务，消费者通过 `inject = ['lab']` 自动激活。无需 `isEnabled()` 检查。
7. **命令是 Consumer**：状态与 Python 执行都归 Service Provider（`src/lab-agent-local.ts`），命令只调 `ctx.lab` 接口，替换 Provider 时命令代码不变。
8. **动态注册防重复**：`ctx.registry.has(LabLocal)` 检查是否已注册，防止重复 `ctx.plugin()` 调用。

---

## 9. 总结

**DSH 斜杠命令 = 注册即所得**：

```js
// 只需要这一行：
ctx.commands.register({ name, description, handler });

// 自动获得：
// - 命令菜单 UI（自动补全、高亮、键盘导航）
// - 命令发现（list）——消费者激活后命令自动出现
// - 命令执行（execute）
// - 生命周期日志（command/run, command/done）
// - 结果渲染（success/error）
// - 服务依赖管理（inject 声明后自动等待）
```

**不需要**：
- 任何 Client 侧命令检测代码
- 自定义命令菜单 UI
- 自定义 WebSocket 消息协议
- `isEnabled()` 检查代码
- `labModeSessions` Set 状态管理
- 手动管理消费者激活/休眠
