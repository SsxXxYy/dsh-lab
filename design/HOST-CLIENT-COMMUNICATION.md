# Host ↔ Client 通讯体系：原理与使用

本文档描述 DeepSeek Harness 中浏览器客户端（Client）与服务端宿主（Host）之间的双向通讯机制。覆盖三个独立通道：**RPC 调用**（Client → Host，HTTP POST）、**事件转发**（Host → Client，WebSocket + 白名单）、**Session Projection**（Host → Client，状态驱动的 push 帧）。

---

## 目录

- [架构概览](#架构概览)
- [三通道设计](#三通道设计)
- [RPC 调用：Client → Host](#rpc-调用-client--host)
  - [入口：`ctx.remote.<namespace>.<method>(...)`](#入口ctxremotenamespacemethod)
  - [方法装载：`$mount` 与 contribution](#方法装载-mount-与-contribution)
  - [调用分发：`invokeMethod` 的 direct/scoped 选择](#调用分发-invokemethod-的-directscoped-选择)
  - [Host 侧接收：Connection → Gateway](#host-侧接收-connection--gateway)
  - [Gateway 调度：descriptor 解析与参数处理](#gateway-调度-descriptor-解析与参数处理)
  - [SRC 反射推断（无编译器时）](#src-反射推断无编译器时)
- [事件转发：Host → Client](#事件转发-host--client)
  - [白名单控制点](#白名单控制点)
  - [帧生产：`FrameQueue` 与 `ApiProxy.events`](#帧生产-framequeue-与-apiproxyevents)
  - [WebSocket 下行泵](#websocket-下行泵)
  - [客户端接收：`ConnectionController` 与重连](#客户端接收-connectioncontroller-与重连)
  - [事件投递：`$dispatch` 到 `$on` listener](#事件投递-dispatch-到-on-listener)
- [Session Projection：状态驱动的推送](#session-projection状态驱动的推送)
  - [核心概念](#核心概念)
  - [Host 端注册 Projection](#host-端注册-projection)
  - [推送链路](#推送链路)
  - [客户端订阅 Projection](#客户端订阅-projection)
  - [持久化缓存](#持久化缓存)
  - [踩坑：`apply` 的 `state` 可能为 `undefined`](#踩坑apply-的-state-可能为-undefined)
- [客户端 Bundle 加载机制](#客户端-bundle-加载机制)
  - [Cordis `apply()` 模式](#cordis-apply-模式)
  - [`__ModuleLoader__` 模式](#__moduleloader__-模式)
  - [两种模式的对比](#两种模式的对比)
- [连接生命周期](#连接生命周期)
  - [就绪握手](#就绪握手)
  - [指数退避重连](#指数退避重连)
  - [Generation 隔离](#generation-隔离)
- [信任栅栏](#信任栅栏)
- [两个网关的关系：`typertGateway` 与 `apiProxy`](#两个网关的关系typertgateway-与-apiproxy)
- [通讯机制选型指南](#通讯机制选型指南)
- [踩坑指南](#踩坑指南)
- [如何添加一个新的 Remote 方法](#如何添加一个新的-remote-方法)
  - [1. Host 端：定义 Service 并标记 `@Remote`](#1-host-端定义-service-并标记-remote)
  - [2. Host 端：在 `./remote` 导出 contribution](#2-host-端在-remote-导出-contribution)
  - [3. Client 端：装载 contribution](#3-client-端装载-contribution)
  - [4. Client 端：调用方法](#4-client-端调用方法)
- [如何转发一个新的 Host 事件](#如何转发一个新的-host-事件)
  - [1. 将事件名加入白名单](#1-将事件名加入白名单)
  - [2. 在 Host 端 emit 事件](#2-在-host-端-emit-事件)
  - [3. 在 Client 端订阅事件](#3-在-client-端订阅事件)
- [关键文件索引](#关键文件索引)

---

## 架构概览

本文档中的示例和最佳实践部分参考了 `dsh-web-layout-cmd` 插件（`D:\Dsh\dsh-web-layout-cmd`），该插件成功使用 Session Projection 系统实现了斜杠命令控制 UI 布局的功能。

```
┌──────────────────────────────┐          ┌───────────────────────────────────┐
│         Browser (Client)     │          │          Host (Node.js)            │
│                              │          │                                   │
│  ctx.remote.lab.ping()       │          │  TypertGatewayService             │
│         │                    │  HTTP    │    .invoke({namespace, method,     │
│         ▼                    │  POST    │     args: { ... }, signal })      │
│  ClientRemoteService         │ ───────► │         │                         │
│    .invoke()                 │  /api/   │         ▼                         │
│         │                    │  lab/    │  resolveDescriptor()              │
│         ▼                    │  ping    │  resolveParameter()               │
│  connection.rpc.call()       │          │  Reflect.apply(method, ctx)       │
│         │                    │          │         │                         │
│         ▼                    │          │         ▼                         │
│  fetch('/api/...',           │          │  { ok: true, value: 'pong' }      │
│    { method: 'POST',         │ ◄─────── │                                   │
│      body: JSON })           │  JSON    │                                   │
│                              │          │                                   │
│  WebSocket ◄─────────────────┼── ws:// ─┤  WebSocketDownlinks              │
│  /api/events.host            │          │    .pump()                        │
│  /api/events.mux             │          │    api.events.host/mux()          │
│         │                    │          │                                   │
│         ▼                    │          │  ┌─────────────────────────────┐  │
│  $dispatch(event, args)      │          │  │ SessionProjectionRegistry   │  │
│  → listener(...args)         │          │  │   init() → apply() → view() │  │
│                              │          │  │   onChanged → broadcast()   │  │
│  face.subscribe(callback) ◄──┼─ push ──┤  │   'session/projection' 帧   │  │
│  face.getSnapshot()          │   帧     │  └─────────────────────────────┘  │
└──────────────────────────────┘          └───────────────────────────────────┘
```

整个体系由三层组成：

| 层 | 职责 | 关键包 |
|---|---|---|
| **传输层** | HTTP 信封编解码、WebSocket 帧泵、信任栅栏 | `client/connection` |
| **RPC 层** | Typert 类型调度、Service 发现、参数解析 | `api/gateway`、`typert/*` |
| **业务层** | 产品 API（sessions、agents、workspace 等） | `host/apiproxy` |

---

## 三通道设计

Host ↔ Client 之间有三个**物理隔离**的通道：

| 通道 | 方向 | 传输 | 协议信封 | 用途 |
|---|---|---|---|---|
| **RPC** | Client → Host | HTTP POST `/api/<ns>/<method>` | `ClientRequest` / `ServerResponse` | 客户端调用 Host 上的方法 |
| **Events** | Host → Client | WebSocket `/api/events.{mux,host}` | `ServerRequest` 套 `MuxFrame`/`HostFrame` | Host 向浏览器推送实时事件（白名单逐字转发） |
| **Projection** | Host → Client | WebSocket mux 流（`session/projection` 帧） | push 帧 | Host 计算状态快照推送给客户端 |

**设计原则**：

- 上行永远是 HTTP（请求-响应模型），下行永远是 WebSocket（服务器推送模型）。
- WebSocket 不接受客户端帧——客户端发消息即违反协议，服务端直接 `close(1008, 'downlink only')`。
- 三个通道共享同一个 HTTP 服务器和信任栅栏，但帧格式和路由逻辑完全独立。
- **Projection 不写任何自定义事件到 session 日志**——这是与 `session.append()` 的根本区别。

### 模式四：Session Projection + 服务注册（dsh-lab 实际方案）

`dsh-lab` 的实际实现结合了**服务动态注册**和 **Session Projection**：指令负责注册/注销 Service（进程全局），Projection 负责按会话追踪状态并推送给 Client。

```
用户输入 /lab
    │
    ▼
Host: ctx.root.plugin(LabLocal)  ← 动态注册 Service（进程全局）
    │  → verify 消费者检测到 'lab' 可用 → apply() 执行
    │  → 返回 "实验模式已启用"
    │
    ▼
command/done 事件写入 session log
    │
    ▼
SessionProjectionRegistry.drive(session, event)
    │  apply(state, {type:'command/done', data:{commandId, kind, text}})
    │  → 读取实际 registry 状态：ctx.root.registry.has(LabLocal)
    │
    ▼
Object.is(next, state)? → 变化 → onChanged → broadcast
    │
    ▼（WebSocket mux 流）
Client: faceOf('dsh-lab:state').subscribe(callback)
    │  callback → face.getSnapshot() → { active: true/false }
    │
    ▼
update(active)
  → true:  注入 CSS 隐藏侧边栏
  → false: 移除 CSS 恢复侧边栏
```

**设计决策**：
- 服务注册是全局的（`ctx.root.plugin`），但侧边栏状态是每会话的（projection）
- 启动时一次性清理残留注册（`index.ts`），确保重启后默认关闭（非持久化）
- Projection `init` 读取实际 registry 状态
- Projection `apply` 在任意 `command/done` 后读取 registry 实际状态（事件结构无 `name` 字段，无法按名称过滤）
- Projection 必须提供 `wire: { viewSchema, view }` 块才能对客户端可见
- 使用 `ctx.effect` + `face.subscribe()` 管理订阅生命周期，监听 `sessions.list` 变化以在会话切换时重新订阅

**与指令控制模式的对比**：

| | 指令控制 UI（dsh-web-layout-cmd） | Session Projection + 服务注册（dsh-lab） |
|---|---|---|
| 指令职责 | 触发状态变化 | 开关服务（全局） |
| 状态传递 | Projection 主动推送 | Projection 主动推送（per-session） |
| UI 调整 | 客户端响应 projection 值 | 客户端响应 projection 值 |
| 持久化 | Projection cache | Projection cache |
| 会话隔离 | 是（per-session projection） | 是（per-session projection） |
| 服务注册 | 无 | 全局（`ctx.root.plugin`） |

**`TypertRegistryChange` 结构**：

```typescript
interface TypertRegistryChange {
  readonly kind: 'local' | 'remote' | 'lookup' | 'host-context' | 'client-context'
  readonly key: string
}
```

| `kind` 值 | 触发操作 |
|---|---|
| `'remote'` | contribution 注册/注销（`$mount` / `$dispose`） |
| `'local'` | invocation descriptor 变化（`typert.register()`） |
| `'lookup'` | lookup provider 注册/配置变化 |
| `'host-context'` / `'client-context'` | Context provider/binder 变化 |

**客户端感知服务存在性的两种方式**：

| 方式 | 粒度 | 触发时机 |
|---|---|---|
| `ctx.typert.remotes.subscribe()` | descriptor 级别（`lab/method`） | contribution 注册/注销 |
| `ctx.remote.lab !== undefined` | namespace 级别 | reflect store 中服务注册/注销 |

**Cordis Service 动态注册/注销**：

```typescript
// 运行时注册（非 boot 阶段）
ctx.root.plugin(LabLocal)
// → RegistryService.plugin() → new Fiber() → new LabLocal(ctx, 'lab')
// → ctx.reflect.provide('lab', instance) → 服务立即可见
// → @Remote initializer 执行 → markers WeakMap 写入

ctx.root.registry.delete(LabLocal)
// → RegistryService.delete() → fiber.dispose()
// → _unload() → 逆序执行 disposers
// → ctx.reflect.provide 的 disposer 运行 → delete store[key]
// → ctx.remote.lab === undefined
```

**Cordis Service 生命周期**：

```
ctx.plugin()
    │
    ▼
┌──────────┐     ┌─────────┐     ┌────────┐
│ PENDING  │ ──► │ LOADING │ ──► │ ACTIVE │
└──────────┘     └─────────┘     └────────┘
                      │              │
                      │ execute:     │ 依赖变化 / dispose
                      │ new Service()│
                      │ initHooks    │
                      │ [Service.init]│
                      ▼              ▼
                 ┌────────┐     ┌──────────┐
                 │ FAILED │     │UNLOADING │
                 └────────┘     └──────────┘
                                    │
                                    ▼
                               ┌─────────┐
                               │DISPOSED │
                               └─────────┘
```

- `provide()` 在构造函数内完成 → 服务**立即可见**
- `[Service.init]` 在注册之后运行 → 异步初始化（可返回 disposer）
- dispose 时**逆序**执行 disposers（后注册的先销毁）
- `ctx.inject(['serviceKey'], cb)` 是 `ctx.plugin({ inject, apply: cb })` 的语法糖

---

## RPC 调用：Client → Host

### 入口：`ctx.remote.<namespace>.<method>(...)`

`ctx.remote` 是 `TypertClientRemote` 接口（`api/gateway/src/client/index.ts:88`），由 `ClientRemoteService` 实现。每个 namespace 对应一个 Cordis Service（key 为 `remote.<namespace>`），方法通过 `Object.defineProperty` 动态挂载。

```typescript
// 客户端调用示例
const result = await ctx.remote.goals.create({ title: '实现功能 X' })
if (result.ok) {
  console.log('Goal created:', result.value.id)
}
```

### 方法装载：`$mount` 与 contribution

每个 Host 包在构建时由 Typert 代码生成器扫描 `@Remote` / `@RemoteScope` 标记的 Service，生成一个 `./remote` 入口，默认导出 `TypertRemoteContribution`：

```typescript
interface TypertRemoteContribution {
  readonly package: string                          // npm 包名
  readonly descriptors: readonly InvocationDescriptor[]  // 方法描述符数组
}
```

客户端在启动时（`api/remotes/src/client/index.ts:apply()`）装载所有 contribution：

```typescript
for (const contribution of [commandsRemote, goalsRemote, ...]) {
  disposers.push(await ctx.remote.$mount(contribution))
}
```

`$mount` 内部流程：

1. **`validateContribution()`** — 检查方法名是否重复、是否与保留字段冲突
2. **`callerCtx.typert.remotes.register(contribution)`** — 注册到 Typert 全局 `RemoteStore`
3. **逐个 `install(descriptor)`** — 为每个方法创建 `MountToken`，调用 `installDirect()` 或 `installScoped()`
4. **`RemoteNamespaceService.install()`** — 首次安装时用 `Object.defineProperty(this, method, { get: ... })` 挂载方法；后续更新只修改内部 `RemoteMethodRecord`

关键设计：**getter 是动态闭包**，每次访问方法时实时读取最新的 direct/scoped 记录，不会有 stale 引用。

### 调用分发：`invokeMethod` 的 direct/scoped 选择

```typescript
// gateway/src/client/index.ts:327-354
private invokeMethod(direct, scoped, callerCtx, values) {
  // 1. 优先尝试 scoped：从 Context 提取 identity
  if (scoped !== undefined) {
    const identity = binder?.identity(callerCtx)
    if (identity !== undefined) {
      return this.invoke(scoped.descriptor, scoped.projection, scoped.token, callerCtx, values, { value: identity })
    }
  }
  // 2. 回退到 direct
  if (direct !== undefined) {
    return this.invoke(direct.descriptor, undefined, direct.token, callerCtx, values)
  }
  // 3. scoped 无 binder 时仍尝试 scoped（会报错）
  if (scoped !== undefined) {
    return this.invoke(scoped.descriptor, scoped.projection, scoped.token, callerCtx, values)
  }
  throw new Error('no longer mounted')
}
```

`invoke()` 把位置参数转成命名 wire args：

```typescript
const args = Object.create(null)  // 无原型链的干净对象
// projection identity 注入（如果有 scoped）
args[projection.wire] = parse(projection.codec, identity)
// 位置参数 → wire args
descriptor.parameters.forEach((parameter, index) => {
  if (index === projection.parameterIndex) return  // 被 scope 替换的参数跳过
  args[parameter.wire] = parse(parameter.codec, values[valueIndex])
})
```

最终通过 `connection.rpc.call('/api', endpoint, { args }, signal)` 发送 HTTP 请求。

### Host 侧接收：Connection → Gateway

HTTP 请求到达后经过：

1. **`isTrustedApiRequest()`** — 信任栅栏（见[信任栅栏](#信任栅栏)）
2. **`HostConnectionService.createSharedFetchHandler()`** — 检查 `/api` 拦截器
3. **`TypertGatewayService.claimsEndpoint()`** — 判断是否认领该 endpoint
4. **`rpcFetchHandler()`** — 解码 JSON envelope，校验 `clientRequestSchema`
5. **`dispatchRpc()` → `invoke()`** — 进入 Gateway 调度

### Gateway 调度：descriptor 解析与参数处理

`TypertGatewayService.invoke()` 是 RPC 调度的核心（`api/gateway/src/index.ts:145-184`）：

```typescript
async invoke(request: InvokeRemoteRequest) {
  // 1. 解析 descriptor（严格定义优先，SRC 兜底）
  const descriptor = this.resolveDescriptor(request.namespace, request.method, endpoint)

  // 2. 校验参数精确匹配
  assertExactArguments(request.args, descriptor, endpoint)

  // 3. 解析 receiver context（direct 返回 Gateway 自身 context，context 动态解析）
  const receiverContext = await this.resolveReceiverContext(descriptor, request.args, endpoint)

  // 4. 获取 Service 实例
  const receiver = receiverContext.get(descriptor.service)
  validateBinding(receiver, descriptor.service, descriptor.namespace, endpoint)

  // 5. 解析参数（JSON 直接透传，lookup 走 provider.resolve）
  const args = await Promise.all(descriptor.parameters.map(p => this.resolveParameter(p, request.args, endpoint)))

  // 6. 注入 cancellation signal（如果声明了）
  if (descriptor.cancellation !== undefined) args.push(request.signal ?? NEVER_ABORTED_SIGNAL)

  // 7. 反射调用
  const result = await Reflect.apply(method, receiver, args)

  // 8. 编码返回值
  return decode(descriptor.result, result, 'result-invalid', endpoint, 'result')
}
```

**参数类型处理**：

| `source` | 处理方式 |
|---|---|
| `'json'` | `decode(codec, value)` 校验后直接返回。wire field 缺失时返回 `undefined` |
| `'lookup'` | `decode` 得到 ID → `typert.lookups.get(key)` 找 provider → `provider.resolve(id)` 解析为 Host 对象 |

**Context-scoped 方法**（`@RemoteScope` 标记）：

`resolveReceiverContext()` 从 `args[invocation.wire]` 提取 identity → `provider.resolve(identity)` → 返回目标 Context。后续 `receiverContext.get(descriptor.service)` 在该 Context 上获取 Service 实例，实现多租户/会话隔离。

### SRC 反射推断（无编译器时）

当没有 Typert 编译器生成的严格 `InvocationDescriptor` 时，Gateway 通过**运行时反射**推断端点定义。这是 `dsh-lab` 这类不跑编译器的插件能暴露 Remote 方法的关键。

**三级查找**（`claimsEndpoint()`）：

1. **格式校验** — `namespace/method` 必须恰好两段
2. **严格定义** — `typert.local.get/hasSeen(endpoint)` 检查编译器生成的 descriptor
3. **SRC 兜底** — `collectSrcClaims()` 遍历所有 Cordis Service，收集带 `@Remote` 标记的方法

**`collectSrcClaims()` 流程**：

```
遍历 ctx.reflect.props
  → 过滤 type === 'service'
  → ctx.get(serviceKey) 获取实例
  → originalOf(receiver) 剥 Proxy
  → Reflect.get(original, 'typertRemote') 读绑定
  → remoteMethods(original) 从 WeakMap 读 @Remote 标记
  → 组合 namespace/method 加入 claims
```

**`srcDescriptor()` 构建 descriptor**：

1. `methodParameterNames()` 用 `Function.prototype.toString` 解析参数名
2. 检测 `signal` 取消参数（必须在最后）
3. 为每个参数匹配 lookup provider，无匹配则标记为 `source: 'json'`
4. 组装完整 `InvocationDescriptor`（`result: { mode: 'src-json' }`）

**`methodParameterNames()` 限制**：

参数必须是**简单的、唯一的 JavaScript 标识符**。不允许：

| 不允许 | 示例 |
|---|---|
| 解构参数 | `{ a, b }` |
| 默认值 | `x = 5` |
| 剩余参数 | `...args` |
| 重复参数名 | `a, a` |

**装饰器标记存储**：

```typescript
const markers = new WeakMap<object, Map<string, StoredRemoteMethodMarker>>()
// 外层 WeakMap: key = prototype（GC 友好）
// 内层 Map: key = method name, value = { exportName?, invocation }
```

`mark()` 在**实例化时**执行（通过 `context.addInitializer()` 注册），写入原型而非实例，所有实例共享同一份标记表。

---

## 事件转发：Host → Client

### 白名单控制点

`api/remotes/src/remote-events.ts` 是整个转发面的**唯一控制点**：

```typescript
export const API_REMOTE_FORWARDED_EVENTS = [
  'agent-preset/selected',
  'commands/change',
  'credentials/updated',
  'cordis/request-run',
  'cordis/request-run-resolved',
  'cordis/dynamic-package',
  'cordis/dynamic-retract',
  'cordis/inspect-query',
  'cordis/inspect-query-resolved',
  'llm/adapters-updated',
  'settings/document-updated',
] as const
```

加新事件只改这一个数组——无投影、无脱敏、无重命名。线名 = Host cordis 事件名，payload = 参数列表。

**类型约束通过声明合并实现**：

```typescript
// api/remotes/src/types.ts
export type ApiRemoteForwardedEvent = typeof API_REMOTE_FORWARDED_EVENTS[number]

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteEventSelection extends Record<ApiRemoteForwardedEvent, true> {}
}
```

`TypertRemoteEvent = Extract<keyof Events, keyof TypertRemoteEventSelection>` 把白名单变成 `$on()` 的编译期 key 约束。

### 帧生产：`FrameQueue` 与 `ApiProxy.events`

`ApiProxy.events.mux()` 和 `ApiProxy.events.host()` 返回 `AsyncIterable<RpcRequest<Frame>>`，使用 `FrameQueue` 作为生产-消费桥梁：

```typescript
class FrameQueue<F> {
  private buffer: F[] = []
  private waiter: (() => void) | undefined

  push(item: F) {       // 生产者：Cordis 事件监听器调用
    this.buffer.push(item)
    this.waiter?.()     // 唤醒等待中的消费者
  }

  async *iterate(signal, cleanup): AsyncGenerator<F> {
    while (true) {
      while (this.buffer.length > 0) yield this.buffer.shift()
      if (this.done || signal.aborted) return
      await new Promise<void>(resolve => { this.waiter = resolve })
    }
  }
}
```

**`mux()` 帧生产**：

- 订阅基线：每个已附加会话的 `session/subscribed`、待审批/问题帧、队列/jobs 快照
- 实时帧：`session/event`、`session/created`、`session/disposed`、`jobs.onJobsChanged`

**`host()` 帧生产**：

- 订阅基线：当前工作区列表快照
- 实时帧：`session/created`→`host/session-added`、`agent/status`→`host/session-status`、`domain/changed`→workspace 帧
- **白名单事件** → `host/remote-event` 帧：

```typescript
// api-proxy.ts:3534
...API_REMOTE_FORWARDED_EVENTS.map(name => ctx.on(name, (...args) => {
  queue.push(frame({
    type: 'host/remote-event',
    event: name,
    args: assertJsonArgs(name, args),
  }))
}))
```

### WebSocket 下行泵

`WebSocketDownlinks` 用 `ws.WebSocketServer({ noServer: true })` 工作——upgrade 控制权交给外部 HTTP 服务器：

```typescript
handleHost(req, socket, head) {
  this.upgrade(req, socket, head, signal => this.api.events.host({
    rpcId: RpcId(randomUUID()), payload: {}
  }, signal))
}
```

`upgrade()` 流程：

1. `server.handleUpgrade()` 完成协议握手
2. 创建 `AbortController`，绑定 `close`/`error`→abort、`message`→`close(1008, 'downlink only')`
3. `pump(websocket, open(abort.signal), abort)` 开始泵送

`pump()` 核心：

```typescript
for await (const frame of frames) {
  socket.send(JSON.stringify(serverRequest(frame)))
}
// serverRequest 把 RpcRequest<HostFrame> 包装成 ServerRequest 信封
```

### 客户端接收：`ConnectionController` 与重连

`ConnectionController`（`client/connection/src/client/connection.ts`）管理完整的连接生命周期：

```typescript
// 核心状态
private generation = 0    // 单调递增，每次重连 +1
private attempt = 0       // 连续失败次数，连接成功后归零
private current: AbortController | null = null
```

**重连循环**：

```
while (running) {
  gen = ++generation
  ac = new AbortController()
  // 打开 mux + host 两个流
  // 就绪握手：describe + 两个 stream onOpen（超时 3s）
  // 成功 → attempt=0, emit 'connected'
  // 失败 → await failed, emit 'reconnecting', sleep(backoffDelay(attempt))
}
```

**指数退避**：

```typescript
backoffDelay(attempt) {
  const cap = Math.min(10000, 500 * 2 ** Math.max(0, attempt - 1))
  return cap / 2 + Math.random() * (cap / 2)  // jitter: cap/2..cap
}
```

**`WebApiClient.readWebSocket()`** 用 async generator 把 WebSocket 消息转成 `AsyncIterable`：

```typescript
// 生产者：WebSocket 事件回调
handleMessage = (event) => {
  full = serverRequestSchema.parse(JSON.parse(event.data))
  frame = hostFrameSchema.parse(full.payload)
  enqueue({ kind: 'frame', envelope: { rpcId: full.rpcId, payload: frame } })
}

// 消费者：async * generator
while (true) {
  while (inbox.length > 0) {
    const item = inbox.shift()
    if (item.kind === 'end') return
    yield item.envelope
  }
  await new Promise<void>(resolve => { wake = resolve })
}
```

### 事件投递：`$dispatch` 到 `$on` listener

运行时（`client/runtime/src/client/index.ts`）的 `onHostEnvelope` 回调：

```typescript
onHostEnvelope: (envelope) => {
  const frame = envelope.payload
  if (frame.type === 'host/remote-event') {
    ctx.remote.$dispatch(frame.event, frame.args)
  }
}
```

`$dispatch()` 实现：

```typescript
$dispatch(event, args) {
  const listeners = this.subscriptions.get(event)
  if (listeners === undefined) return  // 未订阅 → 静默丢弃
  for (const { listener } of [...listeners]) {  // 快照：本轮接收者固定
    try {
      const settled = listener(...args)
      if (settled instanceof Promise) settled.catch(report)
    } catch (error) { report(error) }  // 隔离：listener 抛异常不中断链
  }
}
```

---

## Session Projection：状态驱动的推送

Session Projection 是 DSH 官方的 **host→client 状态推送通道**。与事件转发（逐字转发 cordis 事件）不同，Projection 通过在 session 事件上执行 **fold 函数**计算出状态值，只把最终状态推送给客户端。

**核心优势**：不写任何自定义事件到 session 日志，因此不会破坏 session 恢复。

### 核心概念

```
┌──────────────────────────────────────────────────────────────────┐
│  Host (Node.js)                                                  │
│                                                                  │
│  Session Event Log: [command/run, command/done, ...]             │
│         │                                                        │
│         ▼                                                        │
│  Projection Registry:                                            │
│    init() → 初始状态                                              │
│    apply(state, event) → nextState   (纯函数，逐事件驱动)          │
│    view(state) → wireValue           (状态 → 线格式)              │
│         │                                                        │
│         │  状态变化时                                              │
│         ▼                                                        │
│  onChanged → broadcast({ type: 'session/projection', ... })      │
│         │                                                        │
│         │  WebSocket mux 流                                       │
│         ▼                                                        │
│  Client: ctx.sessions.binding(id).session.projections.faceOf(key)│
└──────────────────────────────────────────────────────────────────┘
```

三个纯函数组成一个 Projection 单元：

| 函数 | 签名 | 职责 |
|---|---|---|
| `init()` | `() → S` | 空日志的初始状态 |
| `apply(state, event)` | `(S, SessionEvent) → S` | 纯状态转换：上一个状态 + 一个已提交事件 → 下一个状态。不关心的事件必须返回**同一个引用**（`Object.is` 判断）以产生零下游工作 |
| `view(state)` | `(S) → SessionProjectionMap[K]` | 状态 → 线格式（发送给客户端的值） |

### Host 端注册 Projection

```typescript
// lib/index.js (dsh-web-layout-cmd)
import { z } from 'zod'

const LayoutStateSchema = z.object({
  mode: z.union([z.literal('classic'), z.literal('wide'), z.literal('focus')]),
  sidebarCollapsed: z.boolean(),
  detailsCollapsed: z.boolean(),
})

ctx.sessionProjections.register({
  key: 'dsh-web-layout-cmd:state',       // projection 唯一 key
  stateSchema: LayoutStateSchema,         // 校验 wire 输出
  init: () => ({ mode: 'classic', sidebarCollapsed: false, detailsCollapsed: false }),
  apply: (state, event) => {
    if (!state) state = { mode: 'classic', sidebarCollapsed: false, detailsCollapsed: false }
    if (event.type !== 'command/run') return state  // 不关心的事件返回同一引用
    switch (event.data.name) {
      case 'layout':
        const mode = (event.data.args || '').trim().toLowerCase()
        if (mode === 'classic' || mode === 'wide' || mode === 'focus') {
          return { ...state, mode }
        }
        return state
      case 'sidebar':
        return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
      case 'details':
        return { ...state, detailsCollapsed: !state.detailsCollapsed }
      default:
        return state
    }
  },
  wire: {
    viewSchema: LayoutStateSchema,
    view: (state) => state,               // 状态直接作为 wire 值
  },
  stateVersion: 1,                       // 缓存失效版本号
})
```

**`stateVersion`**：当 fold 语义或序列化字段变化时 bump 此值。持久化缓存行格式 `(sessionId, key, ver, seq, val)`，ver 不匹配则丢弃整行。两个不同 `stateVersion` 的注册方不能共享缓存 cell（注册时会报错）。

### 推送链路

Projection 值变化到客户端收到推送的完整路径：

```
Session 事件提交 (session/event)
    │
    ▼
SessionProjectionRegistry.drive(session, event)
    │  遍历所有注册单元，调用 apply(cell.state, event)
    │  Object.is(next, cell.state) → 状态变化？
    │  是 → schema.parse(view(next)) → 通知 listeners
    ▼
api-proxy.ts: projectionCtx.sessionProjections.onChanged((session, key, value, seq) => {
    broadcast({ type: 'session/projection', sessionId, key, value, seq })
})
    │
    ▼
FrameQueue → AsyncIterable → WebSocketDownlinks.pump() → socket.send()
    │
    ▼
Client: WebApiClient.readWebSocket() → ConnectionController.pumpStream()
    │
    ▼
ProjectionValueStore.applyFinishedValue() → rows.set(key, { value, seq })
    │
    ▼
notifier.notifyChanged() → face.subscribe(callback) 触发
```

**推送帧类型**：`session/projection`（在 mux 流中，通过 `FrameQueue` 泵送）。

### 客户端订阅 Projection

```typescript
// client/client.js (dsh-web-layout-cmd)
ctx.effect(function () {
  var currentSessionId = null
  var unsubscribeProjection = null

  function subscribeToSession(sessionId) {
    cleanupProjection()
    if (!sessionId) return
    currentSessionId = sessionId

    var binding = ctx.sessions.binding(sessionId)
    if (!binding) return

    var face = binding.session.projections.faceOf('dsh-web-layout-cmd:state')
    if (!face) return

    // ⚠️ notifier 触发回调时不传参数，必须手动 getSnapshot()
    unsubscribeProjection = face.subscribe(function () {
      var state = face.getSnapshot()
      applyProjectionState(state)
    })

    // 读取初始值
    var initial = face.getSnapshot()
    if (initial) applyProjectionState(initial)
  }

  // 跟踪当前 session 变化
  var unsubscribeList = ctx.sessions.list.subscribe(function () {
    var snapshot = ctx.sessions.list.getSnapshot()
    if (snapshot.current !== currentSessionId) {
      subscribeToSession(snapshot.current)
    }
  })

  // 订阅初始 session
  var snapshot = ctx.sessions.list.getSnapshot()
  if (snapshot.current) subscribeToSession(snapshot.current)

  return function () { cleanupProjection(); if (unsubscribeList) unsubscribeList() }
}, 'dsh-web-layout-cmd: projection subscription')
```

### 持久化缓存

`SessionProjectionCache`（`packages/session/session-projection-cache`）提供持久化支持：

| 触发点 | 行为 |
|---|---|
| `turn/end` | 强制写入（大多数读取需要 turn-final 值） |
| `session/disposed` | 强制写入（live-to-cold 时刻） |
| 每 N 个事件 | 节流写入（`writeEveryEvents`） |
| 每 M 毫秒 | 节流写入（`writeIntervalMs`） |

**冷启动恢复**：

```
cachedSnapshot(meta)          → 零 I/O 读取（最快，可能 stale）
coldSnapshot(id)              → cached rows + persistence.readFrom(floor) tail replay
restore(checkpoint, events)   → 从 checkpoint 状态 fold tail events
```

缓存行是** fold shortcut 而非权威**——seq 过期时通过 tail replay 自愈，ver 不匹配则丢弃。

### 踩坑：`apply` 的 `state` 可能为 `undefined`

Projection 系统在某些情况下不调用 `init`，导致 `apply` 首次调用时 `state` 为 `undefined`。**必须在 `apply` 开头加容错**：

```typescript
apply: (state, event) => {
  if (!state) state = { mode: 'classic', sidebarCollapsed: false, detailsCollapsed: false }
  // ...
}
```

---

## 客户端 Bundle 加载机制

DSH 客户端（浏览器端）有两种插件加载模式：

### Cordis `apply()` 模式

标准模式。Host 端 `dsh-client-modules` 扫描组合树中声明了 `dsh.client` 的包，通过 `./client` 导出找到客户端入口，以 ES Module 形式注入网页。

```typescript
// package.json
{
  "dsh": {
    "client": {
      "platform": "web",
      "inject": ["@deepseek-ai/dsh-client-runtime"]
    }
  },
  "exports": {
    "./client": "./client/client.js"
  }
}
```

客户端入口导出标准的 `name`、`inject`、`apply`：

```typescript
export const name = 'dsh-lab-client'
export const inject = ['slots', 'remote', 'typert']

export function apply(ctx: Context) {
  // 使用 ctx 访问服务
}
```

### `__ModuleLoader__` 模式

**非 Cordis 的模块加载器**，用于注入 React 组件和共享依赖（如 `react`）。`dsh-web-layout-cmd` 使用此模式：

```javascript
window.__ModuleLoader__.load({
  id: 'dsh-web-layout-cmd',
  factory: (require) => {
    var react = require('react')  // 访问共享的 React 实例
    var module = { exports: {} }
    var exports = module.exports

    function apply(ctx) {
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'layout-controls-cmd' },
          function () { return react.createElement(LayoutPanel, { layout: ctx.layout }) }
        )
      })
    }

    exports.name = 'dsh-web-layout-cmd'
    exports.inject = ['slots', 'layout', 'sessions']
    exports.apply = apply
    return module.exports
  }
})
```

### 两种模式的对比

| 特性 | Cordis `apply()` | `__ModuleLoader__` |
|---|---|---|
| 模块系统 | ES Module（静态导入） | AMD/factory（动态 `require`） |
| React 访问 | 通过 `import` 或 `ctx` 间接访问 | `require('react')` 直接访问共享实例 |
| UI 注册 | 通过 `ctx.slots` 或声明式注册 | `ctx.slots.inject()` + `react.createElement` |
| 类型支持 | 完整 TypeScript | 编译后为 JS，无类型 |
| 使用场景 | 标准 Cordis 插件 | 需要直接操作 React 组件的 UI 插件 |

---

## 通讯机制选型指南

| 场景 | 推荐通道 | 原因 |
|---|---|---|
| 客户端需要调用 Host 方法 | **RPC** | 请求-响应，有返回值 |
| Host 通知 Client 已发生事件 | **事件转发** (`$on`) | 低延迟，逐字转发 |
| 斜杠命令触发 UI 状态变化 | **Projection** | 不污染 session 日志，不破坏恢复 |
| 多 Client 同步同一状态 | **Projection** | 状态共享，per-session 隔离 |
| 页面刷新后需要恢复状态 | **Projection** + cache | 自动 checkpoint + cold read |
| 临时开关一个功能/服务 | **Projection + 服务注册** | 服务注册控制全局可用性，Projection 提供 per-session 状态 |
| 一次性通知（不需要持久化） | **事件转发** | 简单直接 |
| 实时双向通信 | **RPC** + **Projection** | RPC 上行 + Projection 下行 |

---

## 踩坑指南

### ❌ 自定义 Session 事件类型导致恢复失败

```typescript
// ❌ 错误：写入 harness 不认识的事件类型
session.append('layout/command', { action: 'set-mode', mode: 'focus' })
// → SessionFormatUnsupportedError: session contains event type "layout/command" unknown to this harness
```

**修复**：使用 `command/run`（harness 已知事件类型）+ Projection 折叠状态。

### ❌ DOM 事件监听永远不触发

```typescript
// ❌ 错误：DSH 客户端不派发 session 事件为 DOM 事件
document.addEventListener('layout/command', callback)
// → 永远不会触发
```

**修复**：使用 `ctx.sessions.binding(id).session.projections.faceOf(key).subscribe()` 或 `ctx.remote.$on()`。

### ❌ `face.subscribe(callback)` 回调不传参数

```typescript
// ❌ 错误：期望回调接收状态参数
face.subscribe(function (state) {
  applyProjectionState(state)  // state 是 undefined!
})

// ✅ 正确：回调内手动读取
face.subscribe(function () {
  var state = face.getSnapshot()  // 必须手动读取
  applyProjectionState(state)
})
```

### ❌ `projection.apply` 的 `state` 可能为 `undefined`

```typescript
// ❌ 错误：假设 state 总是存在
apply: (state, event) => {
  if (event.type !== 'command/run') return state  // state 可能是 undefined
}

// ✅ 正确：开头加容错
apply: (state, event) => {
  if (!state) state = { mode: 'classic', sidebarCollapsed: false, detailsCollapsed: false }
  if (event.type !== 'command/run') return state
}
```

### ❌ `import { z } from '@deepseek-ai/schemastery'` 没有 named export

```typescript
// ❌ 错误：schemastery 没有 named export z
import { z } from '@deepseek-ai/schemastery'

// ✅ 正确：从 zod 导入
import { z } from 'zod'
```

### ❌ 在 `apply()` 内使用 `ctx.inject(['sessionProjections'], callback)` 无效

```typescript
// ❌ 错误：依赖已通过 inject 数组声明，直接用 ctx.sessionProjections
export function apply(ctx) {
  ctx.inject(['sessionProjections'], (sessionProjectionsCtx) => {
    sessionProjectionsCtx.sessionProjections.register({...})
  })
}

// ✅ 正确：直接使用
export function apply(ctx) {
  ctx.sessionProjections.register({...})
}
```

### ❌ 忘记处理 session 切换时的 projection 重新订阅

```typescript
// ❌ 错误：只在组件挂载时订阅一次
useEffect(() => {
  const face = ctx.sessions.binding(currentId)?.session.projections.faceOf('key')
  return face?.subscribe(() => setValue(face.getSnapshot()))
}, [])  // 空依赖 → session 切换时不重新订阅！

// ✅ 正确：session 变化时重新订阅
useEffect(() => {
  const face = ctx.sessions.binding(sessionId)?.session.projections.faceOf('key')
  if (!face) return
  const initial = face.getSnapshot()
  if (initial) setValue(initial)
  return face.subscribe(() => setValue(face.getSnapshot()))
}, [sessionId])  // 依赖 sessionId
```

### ❌ `ctx.remote.<namespace>` 类型不安全

```typescript
// ❌ 错误：需要 as any 断言
const hasLab = (ctx.remote as any)?.lab !== undefined

// ✅ 正确：通过 ctx.typert.remotes.subscribe() 检测
// 或在 client 端做 declaration merging 为 ctx.remote 添加类型
```

### 就绪握手

每次连接 generation 建立时：

```typescript
const [description] = await Promise.all([
  this.api.host.describe({}),                          // 验证 unary 可达
  Promise.race([                                       // 两个物理流都 onOpen
    streamsOpen,
    sleep(this.config.streamOpenTimeoutMs, timeout.signal)  // 超时 3s
  ]),
])
```

严格握手确保：`describe` 证明 HTTP 可达 + 两个 WebSocket 流都建立 → 才发 `onConnected`。超时后继续（live-gap repair 覆盖滞后者）。

### 指数退避重连

| 尝试次数 | cap | 实际延迟 |
|---|---|---|
| 1 | 500ms | 250~500ms |
| 2 | 1000ms | 500~1000ms |
| 3 | 2000ms | 1000~2000ms |
| ... | ... | ... |
| ∞ | 10000ms | 5000~10000ms |

### Generation 隔离

每次重连创建新的 `AbortController`，旧代的回调通过 `isGenerationActive(ac)` 检查被过滤，防止过期通知泄漏到新连接。

---

## 信任栅栏

`isTrustedApiRequest()` 实施三道防线：

| 防线 | 防御 | 机制 |
|---|---|---|
| **Host 栅栏** | DNS rebinding | `Host` 头必须是 loopback 或在 `trustedHosts` 中 |
| **跨站栅栏** | CSRF | `sec-fetch-site: cross-site` 直接拒绝 |
| **Origin 栅栏** | 同源验证 | 有 `Origin` 时必须精确匹配 `Host` |

**特权方法**（`PRIVILEGED_METHODS`）用**空信任列表**调用，即使部署配置了 `trustedHosts` 也仅限 loopback：

```typescript
const PRIVILEGED_METHODS = new Set([
  'agentPreset.read', 'agentPreset.copy', 'agentPreset.openDocument', 'agentPreset.remove',
  'host.pickDirectory', 'host.openPath',
  'settings.describe', 'settings.openDocument', 'settings.update', 'settings.replace', 'settings.mutate',
  'credentials.describe', 'credentials.set', 'credentials.unset',
  'llm.discoverModels',
])
```

---

## 两个网关的关系：`typertGateway` 与 `apiProxy`

通讯体系中有两个**完全独立**的网关：

| 网关 | 包 | 职责 | 消费什么 |
|---|---|---|---|
| **`typertGateway`** | `api/gateway` | Typert 类型 RPC 调度 | `InvocationDescriptor`、`typert.local`、`typert.lookups`、`typert.contexts` |
| **`apiProxy`** | `host/apiproxy` | 产品业务 API | `UNARY_ROUTES` 分派表、`FrameQueue`、Cordis 事件订阅 |

**关键区别**：

- `typertGateway` 处理 Typert 类型系统中的方法调用（`invoke`），消费 typert 的 invocation descriptors。
- `apiProxy` 处理客户端与宿主之间的业务 RPC，使用自己的信封协议（`ClientRequest`/`ServerResponse`）。
- `apiProxy` 是**传输无关**的——它不注册任何路由，物理载体（HTTP fetch handler、WebSocket downlink）自己包装 `ctx.apiProxy`。

`dsh-lab` 的 `LabLocal` 通过 `typertGateway` 暴露方法，不经过 `apiProxy`。

---

## 如何添加一个新的 Remote 方法

以 `dsh-lab` 添加一个 `lab.setConfig` 方法为例：

### 1. Host 端：定义 Service 并标记 `@Remote`

```typescript
// src/service.ts
export abstract class LabService extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'lab')  // Cordis service key = 'lab'，wire namespace 默认也是 'lab'
  }
}

// src/lab-agent-local.ts
import { Remote } from '@deepseek-ai/dsh-typert-protocol'

export class LabLocal extends LabService {
  @Remote
  async setConfig(key: string, value: string): Promise<{ success: boolean }> {
    // 业务逻辑
    return { success: true }
  }
}
```

`@Remote` 装饰器在实例化时通过 `addInitializer()` 把标记写入 `markers` WeakMap。`TypertRemoteService` 构造函数把 `{ service, serviceKey: 'lab', namespace: 'lab' }` 绑定到 `this.typertRemote`。

### 2. Host 端：在 `./remote` 导出 contribution

Typert 代码生成器扫描 `@Remote` 方法，生成 `src/remote.ts`：

```typescript
// 自动生成（或手写）
import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'

const contribution: TypertRemoteContribution = {
  package: 'dsh-lab',
  descriptors: [
    {
      id: 'dsh-lab#setConfig',
      service: 'lab',
      namespace: 'lab',
      method: 'setConfig',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'key', wire: 'key', source: 'json', codec: { mode: 'src-json' } },
        { name: 'value', wire: 'value', source: 'json', codec: { mode: 'src-json' } },
      ],
      result: { mode: 'strict', typeSymbol: 'SetConfigResult', schema: setConfigResultSchema },
    },
  ],
}
export default contribution
```

如果不跑编译器，SRC 反射会自动推断 descriptor（参数名通过 `Function.prototype.toString` 解析）。

### 3. Client 端：装载 contribution

在客户端 assembly（`api/remotes/src/client/index.ts`）中：

```typescript
import labRemote from '@deepseek-ai/dsh-lab/remote'

// apply() 中：
disposers.push(await ctx.remote.$mount(labRemote))
```

### 4. Client 端：调用方法

```typescript
const result = await ctx.remote.lab.setConfig('theme', 'dark')
if (result.ok) {
  console.log('Config set:', result.value.success)
}
```

调用链：`ctx.remote.lab.setConfig()` → `ClientRemoteService.invoke()` → `connection.rpc.call('/api', 'lab/setConfig', { args: { key, value } })` → HTTP POST → Gateway `invoke()` → `Reflect.apply(LabLocal.setConfig, receiver, [key, value])`。

---

## 如何转发一个新的 Host 事件

### 1. 将事件名加入白名单

```typescript
// api/remotes/src/remote-events.ts
export const API_REMOTE_FORWARDED_EVENTS = [
  // ... 现有事件
  'lab/config-updated',  // 新增
] as const
```

这一步同时：
- 注册 `ctx.on('lab/config-updated', ...)` 监听器（在 `events.host()` 中）
- 扩展 `TypertRemoteEventSelection`（`$on` 接受新 key）
- 扩展 `TypertRemoteEvent`（listener 签名被 pin）

### 2. 在 Host 端 emit 事件

```typescript
// 任意 Host 代码
ctx.emit('lab/config-updated', { theme: 'dark' })
```

### 3. 在 Client 端订阅事件

```typescript
ctx.remote.$on('lab/config-updated', (config) => {
  console.log('Lab config updated:', config)
})
```

---

## 关键文件索引

### 传输层

| 文件 | 职责 |
|---|---|
| `packages/client/connection/src/index.ts` | Host 端 Connection 插件入口，注册 `/api` HTTP 路由 + WebSocket upgrade |
| `packages/client/connection/src/rpc-host.ts` | `HostConnectionService`：RPC 拦截器注册、envelope 编解码 |
| `packages/client/connection/src/websocket-downlink.ts` | `WebSocketDownlinks`：WebSocket 帧泵 |
| `packages/client/connection/src/client/index.ts` | Client 端 Connection 插件入口，选择 WebApiClient 或 FixtureApiClient |
| `packages/client/connection/src/client/connection.ts` | `ConnectionController`：连接生命周期、重连、generation 隔离 |
| `packages/client/connection/src/client/web-api-client.ts` | `WebApiClient`：fetch RPC + WebSocket 接收 |
| `packages/client/connection/src/client/rpc.ts` | `createWebConnectionRpc()`：浏览器 fetch-based RPC caller |
| `packages/client/connection/src/api-request-trust.ts` | `isTrustedApiRequest()`：信任栅栏 |

### RPC 层

| 文件 | 职责 |
|---|---|
| `packages/typert/protocol/src/index.ts` | `@Remote` 装饰器、`TypertRemoteService` 基类、`bindTypertRemote()` |
| `packages/typert/protocol/src/types.ts` | 所有共享类型：`TypertClientRemote`、`InvocationDescriptor`、`TypertRemoteContribution` |
| `packages/typert/registry/src/service.ts` | `TypertRegistry`：运行时 descriptor/lookup/context 注册表 |
| `packages/api/gateway/src/index.ts` | `TypertGatewayService`：Host 端 RPC 调度核心 |
| `packages/api/gateway/src/types.ts` | `InvokeRemoteRequest`、`TypertGateway` 接口 |
| `packages/api/gateway/src/client/index.ts` | `ClientRemoteService`：Client 端 Remote 服务实现 |
| `packages/api/remotes/src/remote-events.ts` | 事件转发白名单 |
| `packages/api/remotes/src/types.ts` | `TypertRemoteEventSelection` 声明合并 |
| `packages/api/remotes/src/client/index.ts` | Client 端 contribution 装载入口 |

### 业务层

| 文件 | 职责 |
|---|---|
| `packages/host/apiproxy/src/api-proxy.ts` | `ApiProxy` 实现：`FrameQueue`、`events.mux()`/`events.host()`、projection change feed |
| `packages/host/apiproxy/src/api/index.ts` | `ApiProxy` 接口定义 |
| `packages/host/apiproxy/src/fetch/handler.ts` | `toFetchHandler()`：HTTP 请求路由 |

### Session Projection

| 文件 | 职责 |
|---|---|
| `packages/session/session-projection/src/index.ts` | `SessionProjectionRegistry`：projection 注册、drive、snapshot、restore |
| `packages/session/session-projection/src/types.ts` | `SessionProjectionMap` 声明合并入口、`ProjectionDefinition` 接口 |
| `packages/session/session-projection-cache/src/index.ts` | `SessionProjectionCache`：持久化 checkpoint、write-behind、cold read |

### Cordis 框架

| 文件 | 职责 |
|---|---|
| `vendor/cordis/src/registry.ts` | `RegistryService`：`plugin()` / `delete()` / `inject()` |
| `vendor/cordis/src/reflect.ts` | `ReflectService`：`provide()` / `notify()` / Proxy get handler |
| `vendor/cordis/src/service.ts` | `Service` 基类：构造函数中 `ctx.provide()` |
| `vendor/cordis/src/fiber.ts` | `Fiber`：生命周期状态机、`execute`、`_unload` |

### 客户端运行时

| 文件 | 职责 |
|---|---|
| `packages/client/runtime/src/client/index.ts` | 客户端运行时入口：`onHostEnvelope` 中 `host/remote-event` 分发到 `ctx.remote.$dispatch()` |
| `packages/client/runtime/src/client/sessions/projection-store.ts` | `ProjectionValueStore`：per-session projection 值仓 |
| `packages/client/runtime/src/client/sessions/notifier.ts` | `Notifier`：批处理通知原语 |
| `packages/client/runtime/src/client/sessions/manager.ts` | `SessionManager`：帧路由、`handleMuxEnvelope` |
| `packages/client/runtime/src/client/sessions/service.ts` | `SessionRuntime`：`binding()` API |
| `packages/client/runtime/src/client/sessions/session-provider.tsx` | `SessionProvider`：`key={sessionId}` remount + `useProjection` hook |

### dsh-lab 插件

| 文件 | 职责 |
|---|---|
| `src/service.ts` | `LabService` 抽象基类（Service Definition 角色） |
| `src/lab-agent-local.ts` | `LabLocal` 实现（Service Provider 角色），`@Remote` 标记方法 |
| `src/commands.ts` | `dsh-lab` slash command（Consumer 角色），动态注册/注销 `LabLocal` |
| `src/verify.ts` | 验证插件（Consumer 角色），打印 lab 服务就绪信息 |
| `src/index.ts` | 插件入口 |
| `client/client.ts` | 浏览器端插件，根据 lab 服务存在性隐藏侧边栏 |

### dsh-web-layout-cmd 参考插件

| 文件 | 职责 |
|---|---|
| `D:\Dsh\dsh-web-layout-cmd\lib\index.js` | Host 端：注册斜杠命令 + session projection |
| `D:\Dsh\dsh-web-layout-cmd\client\client.js` | Client 端：CSS 注入 + 浮动面板 + projection 订阅 |
| `D:\Dsh\dsh-web-layout-cmd\docs\communication-fix-summary.md` | 通讯问题排查与修复总结（踩坑记录） |
