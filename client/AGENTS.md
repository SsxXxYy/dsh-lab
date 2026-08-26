# dsh-lab Client 端指南

> dsh-lab 浏览器侧插件：通过 Session Projection 感知 Host 端 lab 服务状态，控制侧边栏显示/隐藏。

---

## 1. 角色定位

Client 端是 dsh-lab 的**纯副作用组件**——不注册工具、不注入上下文，只负责 UI 响应：

```
Host 端                          Client 端（本目录）
─────────                        ────────────────
/lab 命令                          
  → 服务注册/注销                   
  → command/run 事件写入 session log
  → Projection apply 翻转 active   
  → WebSocket push ─────────────→  face.subscribe 收到推送
                                   → CSS 注入/移除
                                   → 侧边栏隐藏/显示
```

---

## 2. 核心机制：Session Projection

### 2.1 为什么用 Projection

Client 无法直接感知 Host 侧 lab 服务的注册/注销状态变化。之前的方案（`ctx.inject(['slots', 'remote.lab'])`）有三个缺陷：
1. `remote.lab` 依赖要求 client 声明 `inject = ['slots', 'remote', 'remote.lab']`，耦合度高
2. `apply()` 只执行一次，后续 `/lab` 开关不会触发重新渲染
3. 服务注册是进程全局的，无法按会话隔离

**Session Projection 的优势**：

| | 服务存在性检测 | Session Projection |
|---|---|---|
| 状态来源 | 进程全局 registry | 每会话事件日志 |
| 会话隔离 | 否（全局） | 是（每会话独立） |
| 持久化 | 无（服务开关是临时的） | 有（projection cache） |
| 恢复 | 冷启动后状态丢失 | 冷启动后从日志 replay 恢复 |
| 时序依赖 | apply 时查 registry（时序敏感） | 事件驱动（无时序问题） |

### 2.2 数据流

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

## 3. 文件结构

```
client/
├── client.ts       # 主逻辑：订阅 Projection + CSS 注入
└── AGENTS.md       # 本文件
```

---

## 4. 代码实现

### 4.1 主入口（`client/client.ts`）

```ts
// client/client.ts — 通过 Session Projection 感知 host 端 lab 服务状态
// 链路：Host /lab command → session append command/run → projection drive → WebSocket push → Client subscribe → 更新 UI
import type { Context } from '@deepseek-ai/cordis'

const STYLE_ID = 'dsh-lab/hide-sidebar'
const HIDE_SIDEBAR_CSS =
  'html div:has(> [data-shell-overlay]){grid-template-columns:0 minmax(0,1fr) 0 !important}'

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
    let currentSessionId: string | null = null
    let unsubscribeProjection: (() => void) | null = null

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
        if (unsubscribeProjection) unsubscribeProjection()
        currentSessionId = snapshot.current
        if (snapshot.current) subscribeToSession(snapshot.current)
      }
    })

    // 订阅初始 session
    const snapshot = ctx.sessions.list.getSnapshot()
    if (snapshot.current) {
      currentSessionId = snapshot.current
      subscribeToSession(snapshot.current)
    }

    return function () {
      if (unsubscribeProjection) unsubscribeProjection()
      unsubscribeList()
    }
  }, 'dsh-lab: projection subscription')
}
```

**关键点**：
- `inject` 声明 `['slots', 'sessions']`（不需要 `remote.lab`）
- 使用 `ctx.effect` + `face.subscribe()` 响应 projection 变化
- `face.subscribe` 回调不传参数，必须 `face.getSnapshot()` 读取
- 监听 `ctx.sessions.list` 变化以在会话切换时重新订阅
- 纯 DOM 操作，不依赖 React

### 4.2 CSS 注入逻辑

```ts
const STYLE_ID = 'dsh-lab/hide-sidebar'
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

**原理**：通过 CSS 修改 `grid-template-columns`，将侧边栏宽度设为 0，实现隐藏效果。

---

## 5. 构建配置

Client bundle 通过 `tsdown` 构建，配置在 `tsdown.config.ts`：

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

**要点**：
- `id` 必须设为 `'dsh-lab'`，与 `package.json` 的包名一致
- `externals` 中的依赖由 DSH 运行时提供，不打包进 bundle
- `banner`/`footer`/`intro` 包裹成 `__ModuleLoader__.load` 格式，供 DSH boot manifest 加载

---

## 6. 验证清单

- [x] `npm run build` 构建成功，产出 `dist/client.js`
- [x] 新对话默认侧边栏可见（`init` 返回 `{ active: false }`）
- [x] 输入 `/lab` → 侧边栏隐藏（`active: true`）
- [x] 再次 `/lab` → 侧边栏恢复（`active: false`）
- [x] 会话切换时 projection 自动重新订阅
- [x] 冷启动后 projection 从 session log replay 恢复状态

---

## 7. 调试指南

### 7.1 调试日志

Host 端 console（过滤 `[dsh-lab:projection]`）：
- `init: active = false` — 新会话初始化
- `/lab apply: next active = true` — 事件驱动状态翻转
- `★ push: {"key":"dsh-lab:state","value":{"active":true},"seq":N}` — 推送触发

Client 端 console（过滤 `[dsh-lab:client]`）：
- `initial: {"active":false}` — 初始快照
- `★ projection push: {"active":true}` — 收到推送
- `✓ sidebar hidden` — CSS 已注入
- `✓ sidebar restored` — CSS 已移除

### 7.2 排查链路

按出现顺序检查 5 跳日志：

| 跳 | 日志 | 含义 |
|---|---|---|
| 1 | `[dsh-lab:cmd] enable: registered = true` | 命令是否成功注册服务 |
| 2 | `[dsh-lab:projection] /lab apply: next active = true` | projection 是否翻转状态 |
| 3 | `[dsh-lab:projection] ★ push: {...}` | onChanged 推送是否触发 |
| 4 | `[dsh-lab:client] ★ projection push: {"active":true}` | 客户端是否收到推送 |
| 5 | `[dsh-lab:client] ✓ sidebar hidden` | CSS 是否注入 |

### 7.3 常见故障

| 故障 | 缺失的跳 | 排查方向 |
|---|---|---|
| 输入 `/lab` 无反应 | 1 | 命令未注册或未触发 |
| 侧边栏不变化 | 2 | `command/done` 事件未提交 |
| 侧边栏不变化 | 3 | `apply` 返回值与之前相同（状态未变） |
| 侧边栏不变化 | 4 | WebSocket 推送失败或客户端未订阅 |
| 侧边栏不变化 | 5 | `state.active` 为 `undefined`/`null` |

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

---

## 9. 依赖说明

### 运行时依赖（由 DSH 客户端注入）

| 依赖 | 用途 |
|---|---|
| `@deepseek-ai/dsh-client-runtime` | Cordis 框架、`ctx.effect`、`ctx.sessions` |
| `@deepseek-ai/dsh-client-ui-layout` | Session Projection face API |

### 构建依赖

| 依赖 | 用途 |
|---|---|
| `tsdown` ^0.22.14 | Client bundle 构建 |
| `typescript` ^5.6.0 | 类型检查 |

---

## 10. 未来扩展

当前 Client 端只控制侧边栏显示/隐藏。未来可扩展：

- **仪器状态面板**：显示当前连接的仪器列表、状态
- **工作流执行进度**：实时显示工作流执行步骤
- **手动控制面板**：提供 SCPI 命令手动发送界面

这些扩展需要 Host 端提供相应的 Projection 或工具支持。
