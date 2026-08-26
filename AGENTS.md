# dsh-lab 项目指南

> DeepSeek Harness (DSH) 插件：通过自然语言控制实验室仪器。

## 1. 项目概述

dsh-lab 是一个 DSH（DeepSeek Harness）bundle 插件，将实验室仪器控制功能移植为 DSH 的插件体系。核心理念：**LLM 做一切决策，工具只做原子操作**。工作流文件是 LLM 阅读的说明书，不是机器执行的脚本——DSH Agent Loop 的 turn-step 循环天然支持多轮工具调用，不需要额外的图引擎。

插件采用**三角色架构**（Service Definition → Service Provider → Consumer），通过 Cordis 框架的动态服务注册/注销机制实现插件开关。

### 当前实现状态

- **已实现**：`/lab` 元命令（服务注册/注销）、Service Definition（`LabService` 抽象类）、Service Provider（`LabLocal`，含 `@Remote ping`）、Session Projection（host→client 状态推送）、Client 侧 CSS 注入控制侧边栏
- **未实现**：工具注册（`src/tools.ts`）、System Prompt 上下文注入（`src/context.ts`）、Python 执行引擎（`dsh_lab/*`）、斜杠命令（`/devices`、`/new`、`/rename`）、仪器面板 UI

## 2. 技术栈

| 层级 | 技术 |
|---|---|
| 语言 | TypeScript（Host + Client） |
| 运行时 | Node.js（Host）、浏览器（Client） |
| 框架 | `@deepseek-ai/cordis` ^4.0.1（插件生命周期、依赖注入、服务注册） |
| RPC 协议 | `@deepseek-ai/dsh-typert-protocol` ^0.1.0-rc.8（Host ↔ Client 通信） |
| Schema 校验 | `zod` ^3.24.0 |
| 构建工具 | `tsc`（Host 编译）、`tsdown` ^0.22.14（Client bundle） |
| 目标 | ES2024（`module: nodenext`） |

## 3. 构建与运行

```sh
# 构建（Host: tsc, Client: tsdown）
npm run build

# 开发模式加载（DSH 端）
# pnpm dsh web --patch ./cordis.patch.yml

# 安装插件
dsh plugin --profile web add file:./dsh-lab

# 卸载插件
dsh plugin --profile web remove dsh-lab
```

### 构建产物

| 工具 | 入口 | 输出 | 用途 |
|---|---|---|---|
| `tsc` | `src/*.ts` | `dist/*.js` | Host 端插件代码 |
| `tsdown` | `client/client.ts` | `dist/client.js` | 浏览器端 bundle（通过 `__ModuleLoader__.load` 注册） |

`package.json` 的 `main` 指向 `dist/index.js`，`exports["./client"]` 指向 `dist/client.js`。

## 4. 项目结构

```
dsh-lab/
├── design/                          # 设计文档（中文）
│   ├── ARCHITECTURE.md              # 总体架构设计（v3）
│   ├── HOST-DESIGN.md               # Host 半设计（Python 执行引擎）
│   ├── HOST-CLIENT-COMMUNICATION.md # Host ↔ Client 通讯体系详解
│   ├── IMPLEMENTATION.md            # 实现清单（第二阶段：Lab 模式 UI）
│   ├── LAB-TOGGLE-CODE.md           # /lab 切换机制代码详解（v4）
│   ├── SLASH-COMMANDS.md            # 斜杠命令实现方案（v4）
│   └── TOOLS.md                     # 工具集文档（v4）
├── src/                             # Host 端 TypeScript 源码
│   ├── index.ts                     # 插件入口：启动时清理残留注册 + 注册 meta + verify + projection
│   ├── service.ts                   # Service Definition：LabService 抽象类
│   ├── lab-local.ts           # Service Provider：LabLocal 实现
│   ├── commands.ts                  # Consumer（元命令）：/lab 命令
│   ├── projection.ts                # Host 端 Session Projection
│   ├── projection-types.ts          # Projection schema（LabState）
│   └── context-augment.d.ts         # Context 声明合并 + SessionProjectionMap 类型注入
├── client/                          # Client 端 TypeScript 源码
│   ├── client.ts                    # 侧边栏显示/隐藏控制（订阅 Projection）
│   └── InstrumentPanel.tsx          # [占位] 仪器面板组件
├── dist/                            # 构建产物
├── package.json                     # 包配置 + dsh 插件元数据
├── tsconfig.json                    # TypeScript 编译配置
├── tsdown.config.ts                 # Client bundle 构建配置
└── cordis.patch.yml                 # 开发模式 patch 配置
```

## 5. 架构详解

### 5.1 三角色架构

```
Service Definition  →  Service Provider  →  Consumer
(定义接口+类型)        (实现具体逻辑)       (暴露为模型工具/命令/上下文)
```

| 角色 | 文件 | 职责 |
|---|---|---|
| **Service Definition** | `src/service.ts` | 定义 `LabService` 抽象类，继承 `TypertRemoteService`，注册服务名 `'lab'` |
| **Service Provider** | `src/lab-local.ts` | 实现 `LabLocal`，提供 `@Remote ping()`，未来扩展 SCPI/ASG 方法 |
| **Consumer（元命令）** | `src/commands.ts` | 注册 `/lab` 命令，控制服务注册/注销 |
| **Consumer（Projection）** | `src/projection.ts` | 声明 `inject = ['sessionProjections']`，推送状态到 Client |

依赖方向：`Consumer → Service Definition ← Service Provider`，Consumer 与 Provider **互不依赖**。

### 5.2 插件开关机制（/lab 元命令）

服务注册 = 开启，服务注销 = 关闭。消费者声明 `inject = ['lab']` 即可自动激活/休眠，无需 `isEnabled()` 检查。

```
用户输入 /lab
  → Host: ctx.root.registry.has(LabLocal)?
  → 未注册 → ctx.root.plugin(LabLocal) → 服务注册 → 消费者自动激活
  → 已注册 → ctx.root.registry.delete(LabLocal) → 服务注销 → 消费者自动休眠
```

### 5.3 Session Projection 状态推送

Projection key: `'dsh-lab:state'`，状态 `{ active: boolean }`。

```
Host /lab command → session append command/done → projection drive → WebSocket push → Client subscribe → CSS 注入/移除
```

- `init`: 读取实际 registry 状态（新会话初始化时）
- `apply`: 遇到任意 `command/done` 事件时，读取实际 registry 状态（而非翻转）。注意：DSH 事件结构 `{ commandId, kind, text }` 中**没有 `name` 字段**，无法按命令名过滤
- `wire`: 必须提供 `viewSchema` + `view` 块才能对客户端可见

### 5.5 启动时状态重置（非持久化）

`src/index.ts` 在插件加载时（`apply` 仅执行一次）清理残留的 `LabLocal` 注册，确保 DSH 重启后 `active` 默认为 `false`。使用模块级 `startupCleaned` 标志避免重复执行。

### 5.4 Client 侧渲染策略

Client 通过 `ctx.effect` + `face.subscribe()` 订阅 Projection，根据 `active` 值注入/移除 CSS 隐藏侧边栏。纯 DOM 操作，不依赖 React。

## 6. 开发约定

### 6.1 代码风格

- 注释和文档使用**简体中文**
- 文件顶部注释标注文件角色（如 `// lib/index.ts — 插件入口`）
- 控制台日志使用 `[dsh-lab:模块名]` 前缀（如 `[dsh-lab:cmd]`、`[dsh-lab:projection]`）
- 成功标记用 `✓`，失败标记用 `✗`，推送触发用 `★`

### 6.2 模块导入

- 源码内部导入使用 `.js` 后缀（NodeNext ESM 标准写法，tsx 也能将 `.js` 解析回 `.ts`）
- 分发时入口必须是预编译的 `.js`，`.ts` 源码仅在 `--patch` 开发模式下有效

### 6.3 插件注册模式

每个插件文件导出 `name`、`inject`、`apply`：

```typescript
export const name = 'dsh-lab-meta'
export const inject = ['commands']

export function apply(ctx: Context) {
  // 注册逻辑
}
```

### 6.4 类型声明合并

`src/context-augment.d.ts` 通过声明合并扩展 `Context` 接口，独立 tsc 编译时这些属性由 DSH 运行时提供。新增 Context 属性时需在此文件中补充声明。

## 7. 已知边界与踩坑记录

| 问题 | 原因 | 解决方案 |
|---|---|---|
| `node_modules` 下不能暴露 `.ts` 入口 | Node.js 原生类型擦除不支持 `node_modules` 下的 `.ts` 文件 | 分发时入口必须是预编译的 `.js` |
| Client bundle 的 `__ModuleLoader__.load id` 必须是包名 | boot manifest 期望 client 用包名注册 | `tsdown.config.ts` 中 `id` 设为 `'dsh-lab'` |
| 纯副作用 client 组件不需要 React | 没有全局 `React` 变量 | 用原生 DOM API 操作，不引入 React |
| Projection 必须提供 `wire` 块 | 没有 `wire` 块则注册为 host-only | 添加 `wire: { viewSchema, view }` |
| `apply` 不能依赖 registry 状态 | `command/run` 事件在命令处理器之前提交 | `apply` 读取实际 registry 状态（使用 `command/done` 事件） |
| `command/done` 事件无 `name` 字段 | DSH 事件结构为 `{ commandId, kind, text }` | `apply` 不能按命令名过滤，响应所有 `command/done` 事件后读取 registry |
| `init` 不能检查 registry | 服务注册跨会话持久存在 | 启动时一次性清理（`index.ts`），`init` 读取实际 registry 状态 |
| `face.subscribe` 回调不传参数 | ProjectionValueStore 的 notifier 设计 | 回调内必须手动 `face.getSnapshot()` 读取 |

## 8. 调试指南

### Host 端 console（过滤 `[dsh-lab:projection]`）

- `init: active = false` — 新会话初始化
- `★ HOP2: command/done, actual registry state = true` — 事件驱动状态更新
- `★ HOP3: push to client: {"key":"dsh-lab:state","value":{"active":true},"seq":N}` — 推送触发

### Client 端 console（过滤 `[dsh-lab:client]`）

- `★ HOP4: initial snapshot: {"active":false}` — 初始快照
- `★ HOP4: projection push received: {"active":true}` — 收到推送
- `★ HOP5: update(true) tag exists: false` — 准备注入 CSS
- `✓ sidebar hidden` — CSS 已注入
- `✓ sidebar restored` — CSS 已移除

### 排查链路（按出现顺序检查 5 跳日志）

| 跳 | 日志标识 | 含义 |
|---|---|---|
| HOP1 | `[dsh-lab:cmd] ★ HOP1` | 命令是否执行、注册/注销是否成功 |
| HOP2 | `[dsh-lab:projection] ★ HOP2` | 是否收到 `command/done` 事件、registry 实际状态 |
| HOP3 | `[dsh-lab:projection] ★ HOP3` | onChanged 推送是否触发（状态是否变化） |
| HOP4 | `[dsh-lab:client] ★ HOP4` | 客户端是否收到推送、snapshot 值 |
| HOP5 | `[dsh-lab:client] ★ HOP5` | 是否注入/移除 CSS |

### 常见故障模式

| 故障 | 缺失的跳 | 排查方向 |
|---|---|---|
| 输入 `/lab` 无反应 | 无 HOP1 | 命令未注册或未触发 |
| 侧边栏不变化 | 有 HOP1 无 HOP2 | `command/done` 事件未提交 |
| 侧边栏不变化 | 有 HOP2 无 HOP3 | `apply` 返回值与之前相同（状态未变） |
| 侧边栏不变化 | 有 HOP3 无 HOP4 | WebSocket 推送失败或客户端未订阅 |
| 侧边栏不变化 | 有 HOP4 无 HOP5 | `state.active` 为 `undefined`/`null` |

## 9. 依赖说明

### 运行时依赖（peerDependencies）

| 依赖 | 用途 |
|---|---|
| `@deepseek-ai/cordis` ^4.0.1 | 插件生命周期、依赖注入、服务注册 |
| `@deepseek-ai/dsh-typert-protocol` ^0.1.0-rc.8 | Host ↔ Client RPC 通信 |

### 开发依赖（devDependencies）

| 依赖 | 用途 |
|---|---|
| `@types/node` ^26.3.0 | Node.js 类型定义（tsc 编译需要） |
| `tsdown` ^0.22.14 | Client bundle 构建 |
| `typescript` ^5.6.0 | Host 端 TypeScript 编译 |
| `zod` ^3.24.0 | Schema 校验 |

### DSH 客户端注入依赖（package.json `dsh.client.inject`）

- `@deepseek-ai/dsh-client-runtime`
- `@deepseek-ai/dsh-client-ui-layout`

## 10. 实现优先级

| 阶段 | 内容 | 状态 |
|---|---|---|
| **P0** | `/lab` 元命令（服务注册/注销） | ✅ 已实现 |
| **P0** | Service Provider（`LabLocal`） | ✅ 基础实现（仅 `ping`） |
| **P0** | Service Definition（`LabService` 抽象类） | ✅ 已实现 |
| **P0** | Session Projection 状态推送 | ✅ 已实现 |
| **P0** | Client 侧 CSS 注入控制侧边栏 | ✅ 已实现 |
| **P1** | 核心工具（scan / read_document / read_workflow / send_scpi） | ❌ 未实现 |
| **P1** | System Prompt 上下文注入 | ❌ 未实现 |
| **P1** | 斜杠命令（`/devices`、`/new`、`/rename`） | ❌ 未实现 |
| **P2** | Client 半仪器面板 | ❌ 未实现（占位） |
| **P2** | Python 执行引擎（`dsh_lab/*`） | ❌ 未实现 |
