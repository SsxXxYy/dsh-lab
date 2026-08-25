# 实现清单 — 第二阶段：Lab 模式 UI（Client 半）

---

## 1. 目标

当 `/lab` 命令切换 lab 服务状态时，Client 侧自动隐藏/显示侧边栏。

---

## 2. 核心问题

Client 插件（浏览器）无法直接感知 Host 侧 lab 服务的注册/注销状态变化。

之前的方案（`ctx.inject(['slots', 'remote.lab'])`）有三个缺陷：
1. `remote.lab` 依赖要求 client 声明 `inject = ['slots', 'remote', 'remote.lab']`，耦合度高
2. `apply()` 只执行一次，后续 `/lab` 开关不会触发重新渲染
3. 服务注册是进程全局的，无法按会话隔离

---

## 3. 解决方案

### 3.1 Client 响应式机制：Session Projection

使用 DSH 的 **Session Projection** 系统实现 host→client 状态推送：

- Host 端注册一个 projection，key 为 `'dsh-lab:state'`，状态 `{ active: boolean }`
- `/lab` 命令执行后写入 `command/run` 事件到 session log
- Projection 的 `apply()` 折叠事件：遇到 `command/run` 且 `name === 'lab'` 时翻转 `active`
- 状态变化触发 `onChanged` → WebSocket push → Client `face.subscribe()` 回调
- Client 根据 `active` 值注入/移除 CSS 隐藏侧边栏

**为什么用 Projection 而不是服务存在性检测？**

| | 服务存在性检测 | Session Projection |
|---|---|---|
| 状态来源 | 进程全局 registry | 每会话事件日志 |
| 会话隔离 | 否（全局） | 是（每会话独立） |
| 持久化 | 无（服务开关是临时的） | 有（projection cache） |
| 恢复 | 冷启动后状态丢失 | 冷启动后从日志 replay 恢复 |
| 时序依赖 | apply 时查 registry（时序敏感） | 事件驱动（无时序问题） |

### 3.2 Projection 注册（Host 端）

```ts
// src/projection.ts
ctx.sessionProjections.register({
  key: 'dsh-lab:state',
  schema: LabStateSchema,
  init: (): LabState => ({ active: false }),  // 新会话默认关闭
  apply: (state, event) => {
    if (event.type === 'command/run' && event.data.name === 'lab') {
      return { active: !(state?.active ?? false) }  // 翻转状态
    }
    return state ?? { active: false }
  },
  wire: {
    viewSchema: LabStateSchema,
    view: (state) => state,
  },
  stateVersion: 1,
})
```

**关键设计**：
- `init` 始终返回 `{ active: false }` — 新会话默认侧边栏可见
- `apply` 基于当前状态翻转，不检查 registry（避开了事件提交与命令处理器的时序问题）
- `wire` 块使 projection 对客户端可见（必须提供 `viewSchema` + `view`）

### 3.3 Client 侧订阅 Projection

```ts
// client/client.ts
ctx.effect(function () {
  function subscribeToSession(sessionId: string) {
    const binding = ctx.sessions.binding(sessionId)
    if (!binding) return

    const face = binding.session.projections.faceOf('dsh-lab:state')
    if (!face) return

    // subscribe 回调不传参数，必须手动 getSnapshot()
    unsubscribeProjection = face.subscribe(function () {
      const state = face.getSnapshot()
      update(state ? state.active : false)
    })

    // 读取初始值
    const initial = face.getSnapshot()
    if (initial) update(initial.active)
  }

  // 跟踪当前 session 变化
  const unsubscribeList = ctx.sessions.list.subscribe(function () {
    const snapshot = ctx.sessions.list.getSnapshot()
    if (snapshot.current !== currentSessionId) {
      subscribeToSession(snapshot.current)
    }
  })

  // 订阅初始 session
  const snapshot = ctx.sessions.list.getSnapshot()
  if (snapshot.current) subscribeToSession(snapshot.current)
}, 'dsh-lab: projection subscription')
```

**关键点**：
- `inject = ['slots', 'sessions']` — 只需要 sessions 服务获取 projection face
- `face.subscribe(callback)` 回调不传参数，必须 `face.getSnapshot()` 读取
- 监听 `ctx.sessions.list` 变化以在会话切换时重新订阅
- 纯 CSS 注入，不依赖 React

### 3.4 CSS 注入逻辑

```ts
const HIDE_SIDEBAR_CSS =
  'html div:has(> [data-shell-overlay]){grid-template-columns:0 minmax(0,1fr) 0 !important}'

function update(active: boolean) {
  if (active && !tag) {
    // 注入 <style> 隐藏侧边栏
    tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-lab'
    tag.dataset.pluginCss = STYLE_ID
    tag.textContent = HIDE_SIDEBAR_CSS
    document.head.appendChild(tag)
  } else if (!active && tag) {
    // 移除 <style> 恢复侧边栏
    tag.remove()
    tag = null
  }
}
```

---

## 4. 变更内容

### 4.1 `src/projection.ts` — Session Projection（新建）

Host 端 projection 注册，追踪 lab 服务状态并推送给 Client。

```ts
// src/projection.ts — Host 端 Session Projection
import type { Context } from '@deepseek-ai/cordis'
import type { LabState } from './projection-types.js'
import { LabStateSchema } from './projection-types.js'

export const name = 'dsh-lab-projection'
export const inject = ['sessionProjections']

export function apply(ctx: Context) {
  ctx.sessionProjections.register({
    key: 'dsh-lab:state',
    schema: LabStateSchema,
    init: (): LabState => ({ active: false }),
    apply: (state, event) => {
      if (event.type === 'command/run' && event.data.name === 'lab') {
        return { active: !(state?.active ?? false) }
      }
      return state ?? { active: false }
    },
    wire: {
      viewSchema: LabStateSchema,
      view: (state) => state,
    },
    stateVersion: 1,
  })
}
```

**变更点**：
- `init` 始终返回 `false` — 新会话默认关闭
- `apply` 翻转 `active`，不检查 registry（避免时序问题）
- `wire` 块使 projection 对客户端可见

### 4.2 `src/projection-types.ts` — Schema（新建）

```ts
// src/projection-types.ts
import { z } from 'zod'
import type {} from './context-augment.js'

export const LabStateSchema = z.object({
  active: z.boolean(),
})

export type LabState = z.infer<typeof LabStateSchema>
```

### 4.3 `src/context-augment.d.ts` — 类型声明合并

```ts
// 模块合并：将 dsh-lab:state 注入 SessionProjectionMap 类型表
declare module '@deepseek-ai/dsh-session-projection' {
  interface SessionProjectionMap {
    'dsh-lab:state': { active: boolean }
  }
}
```

### 4.4 `src/commands.ts` — 在 root context 注册服务

```ts
// src/commands.ts — Consumer 角色（元命令）
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-agent-local.js'

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

**变更点**：`ctx.plugin()` → `ctx.root.plugin()`，`ctx.registry` → `ctx.root.registry`。必须在 root context 注册服务，Typert Gateway 才能发现并暴露给 Client。

### 4.5 `client/client.ts` — Client 侧（订阅 Projection 注入 CSS）

```ts
// client/client.ts — 通过 Session Projection 感知 host 端 lab 服务状态
// 链路：Host /lab command → session append command/run → projection drive → WebSocket push → Client subscribe → 更新 UI
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
      if (document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]')) return
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
    // ... 订阅当前 session 的 projection，回调中调用 update(state.active)
  }, 'dsh-lab: projection subscription')
}
```

**变更点**：
- `inject` 声明 `['slots', 'sessions']`（不需要 `remote.lab`）
- 使用 `ctx.effect` + `face.subscribe()` 响应 projection 变化
- `face.subscribe` 回调不传参数，必须 `face.getSnapshot()` 读取
- 纯 DOM 操作，不依赖 React

### 4.6 `src/index.ts` — 入口注册

```ts
// src/index.ts — 插件入口
import type { Context } from '@deepseek-ai/cordis'
import * as meta from './commands.js'
import * as verify from './verify.js'
import * as projection from './projection.js'

export const name = 'dsh-lab'
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.plugin(meta)        // /lab 元命令
  ctx.plugin(verify)      // 验证消费者（注入 lab 服务）
  ctx.plugin(projection)  // Session Projection：追踪 lab 服务状态并推送给 Client
}
```

**变更点**：入口注册三个插件：meta（命令）、verify（验证）、projection（状态推送）。

### 4.7 `tsdown.config.ts` — Client 构建配置

```ts
// tsdown.config.ts — standalone client bundle for dsh-lab plugin
import type { UserConfig } from 'tsdown'

const id = 'dsh-lab'

const externals = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-runtime/client',
  '@deepseek-ai/dsh-client-ui-layout',
]

const config: UserConfig = {
  entry: { client: 'client/client.ts' },
  outDir: 'dist',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: (specifier) => externals.includes(specifier),
    alwaysBundle: (specifier) => !externals.includes(specifier),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: 'dsh-lab', factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default config
```

---

## 5. 数据流

```
┌──────────────────────── Host (Node.js) ────────────────────────┐
│                                                                │
│  用户输入 /lab                                                 │
│    │                                                           │
│    ▼                                                           │
│  commands.ts handler                                           │
│    ├─ ctx.root.registry.has(LabLocal)?                         │
│    │    ├─ false → ctx.root.plugin(LabLocal) → 注册服务       │
│    │    └─ true  → ctx.root.registry.delete(LabLocal) → 注销  │
│    │                                                           │
│    ▼                                                           │
│  command/run 事件写入 session log                               │
│    │                                                           │
│    ▼                                                           │
│  SessionProjectionRegistry.drive(session, event)               │
│    ├─ apply(state, {type:'command/run', data:{name:'lab'}})    │
│    │    → { active: !state.active }   ← 翻转状态               │
│    │                                                           │
│    ▼                                                           │
│  Object.is(next, state)? → 变化                                │
│    │                                                           │
│    ▼                                                           │
│  schema.parse(view(next)) → onChanged → broadcast              │
│    │                                                           │
└────│───────────────────────────────────────────────────────────┘
     │
     │  WebSocket mux 流 (session/projection 帧)
     ▼
┌──────────────────────── Client (Browser) ──────────────────────┐
│                                                                │
│  faceOf('dsh-lab:state').subscribe(callback)                   │
│    │                                                           │
│    ▼                                                           │
│  callback → face.getSnapshot() → { active: true/false }        │
│    │                                                           │
│    ▼                                                           │
│  update(active)                                                │
│    ├─ true  → 注入 <style> → 侧边栏隐藏                        │
│    └─ false → 移除 <style> → 侧边栏恢复                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. 验证清单

- [x] `npm run build` 构建成功，产出 `dist/index.js` 和 `dist/client.js`
- [x] 新对话默认侧边栏可见（`init` 返回 `{ active: false }`）
- [x] 输入 `/lab` → 侧边栏隐藏（`active: true`）
- [x] 再次 `/lab` → 侧边栏恢复（`active: false`）
- [x] 会话切换时 projection 自动重新订阅
- [x] 冷启动后 projection 从 session log replay 恢复状态

---

## 7. 构建与调试步骤

### 7.1 构建

```sh
cd dsh-lab
npm run build   # tsc: src/*.ts → dist/*.js; tsdown: client/client.ts → dist/client.js
```

### 7.2 调试日志

Host 端 console（过滤 `[dsh-lab:projection]`）：
- `init: active = false` — 新会话初始化
- `/lab apply: next active = true` — 事件驱动状态翻转
- `★ push: {"key":"dsh-lab:state","value":{"active":true},"seq":N}` — 推送触发

Client 端 console（过滤 `[dsh-lab:client]`）：
- `initial: {"active":false}` — 初始快照
- `★ projection push: {"active":true}` — 收到推送
- `✓ sidebar hidden` — CSS 已注入
- `✓ sidebar restored` — CSS 已移除

### 7.3 排查链路

按出现顺序检查 5 跳日志：

| 跳 | 日志 | 含义 |
|---|---|---|
| 1 | `[dsh-lab:cmd] enable: registered = true` | 命令是否成功注册服务 |
| 2 | `[dsh-lab:projection] /lab apply: next active = true` | projection 是否翻转状态 |
| 3 | `[dsh-lab:projection] ★ push: {...}` | onChanged 推送是否触发 |
| 4 | `[dsh-lab:client] ★ projection push: {"active":true}` | 客户端是否收到推送 |
| 5 | `[dsh-lab:client] ✓ sidebar hidden` | CSS 是否注入 |

---

## 8. 踩坑记录

### 8.1 Projection 必须提供 `wire` 块才能对客户端可见

**现象**：Host 端 projection 注册成功，但 Client 端 `faceOf('dsh-lab:state')` 返回 `null`，`getSnapshot()` 返回 `undefined`。

**原因**：`register()` 对 client-visible 的 projection（key 在 `SessionProjectionMap` 中）要求必须提供 `wire: { viewSchema, view }`。没有 `wire` 块则注册为 host-only，不会推送给客户端。

**修复**：添加 `wire: { viewSchema: LabStateSchema, view: (state) => state }`。

### 8.2 `apply` 不能依赖 registry 状态（时序问题）

**现象**：`/lab` 命令执行后，projection `apply` 中检查 `ctx.root.registry.has(LabLocal)` 返回错误值。

**原因**：`command/run` 事件在命令处理器运行**之前**就被提交给 projection。此时 `ctx.root.plugin(LabLocal)` 尚未执行，registry 检查返回 `false`。

**修复**：`apply` 不检查 registry，而是基于当前 projection 状态翻转：`{ active: !(state?.active ?? false) }`。Projection 自身就是状态源。

### 8.3 `init` 不能检查 registry（跨会话污染）

**现象**：新对话创建时，projection `init` 检查 `ctx.root.registry.has(LabLocal)` 返回 `true`（因为上一个会话注册过），导致新会话错误地以 lab 模式开启。

**原因**：`LabLocal` 注册在 root context，跨会话持久存在。新会话的 projection `init` 不应依赖全局 registry 状态。

**修复**：`init` 始终返回 `{ active: false }`。新会话默认关闭实验模式，只靠 `/lab` 事件驱动状态变化。

### 8.4 `face.subscribe` 回调不传参数

**现象**：`face.subscribe((state) => update(state.active))` 中 `state` 为 `undefined`。

**原因**：ProjectionValueStore 的 notifier 触发回调时不传参数，必须手动 `getSnapshot()` 读取。

**修复**：
```ts
face.subscribe(function () {
  const state = face.getSnapshot()  // 必须手动读取
  update(state ? state.active : false)
})
```
