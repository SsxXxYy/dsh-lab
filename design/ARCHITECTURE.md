# dsh-lab 插件架构文档 v3

> 将 Lab 的仪器控制 + 文档驱动操作部分移植为 DeepSeek Harness bundle 插件。
> 不包含 LangGraph 图引擎、多模式路由、中断恢复——DSH Agent 自身就是执行引擎。
> **v3 变更**：`/lab` 命令改为动态服务注册/注销模式。服务存在 = 开启，服务注销 = 关闭。消费者声明 `inject = ['lab']` 即可自动激活/休眠，无需 `isEnabled()` 检查。

---

## 1. 核心设计原则

**lab 原始思想**：机器执行工作流，LLM 做决策（StateGraph 节点流转）。

**DSH 插件思想**：**LLM 做一切决策，工具只做原子操作**。

工作流文件是 LLM 阅读的说明书，不是机器执行的脚本。DSH Agent Loop 的 turn-step 循环天然支持多轮工具调用，不需要额外的图引擎。

---

## 2. 与 DSH Agent Loop 的关系

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DSH Agent Loop (已有)                            │
│                                                                     │
│  turn() {                                                           │
│    while (true) {                                                   │
│      preStep()  → systemPrompt.assemble() → 动态上下文拼装           │
│      step()     → LLM 推理 → 遇到 tool-call → executeToolCalls()    │
│                 → 工具结果写入 session history                       │
│                 → 有 tool-call → 继续循环                            │
│                 → 无 tool-call → turn 结束                           │
│    }                                                                │
│  }                                                                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  dsh-lab 插件                                             │   │
│  │                                                            │   │
│  │  systemPrompt.section("lab:instruments")                   │   │
│  │  systemPrompt.section("lab:documents")                     │   │
│  │  systemPrompt.section("lab:workflows")                     │   │
│  │                                                            │   │
│  │  工具（LLM 按需调用）：                                      │   │
│  │  scan_instruments / read_document / read_workflow          │   │
│  │  create_workflow / update_workflow / delete_workflow       │   │
│  │  send_scpi / send_asg                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**DSH Agent Loop 提供的能力**（插件不需要再造）：
- **turn-step 循环**：LLM 可以连续调用多轮工具，不需要图引擎
- **动态上下文拼装**：`systemPrompt.section()` 每步重新渲染
- **工具结果自动反馈**：结果写入 session history，LLM 下一步自然看到
- **并发控制**：工具分 exclusive（串行）和 parallel（最多 10 并发）
- **额外上下文注入**：工具可以往 inbox 插入消息影响下一步

---

## 3. 项目文件结构

```
dsh-lab/
├── design/                      # 设计文档
│   ├── ARCHITECTURE.md          # 本文档：总体架构设计
│   ├── HOST-DESIGN.md           # Host 半设计（Node.js 侧 + Python 引擎）
│   ├── HOST-CLIENT-COMMUNICATION.md  # Host ↔ Client 通讯体系
│   ├── TOOLS.md                 # 工具集文档
│   ├── SLASH-COMMANDS.md        # 斜杠命令实现
│   ├── LAB-TOGGLE-CODE.md       # /lab 切换机制代码详解
│   └── IMPLEMENTATION.md        # 实现清单
│
├── src/                         # Host 半 TypeScript 源码
│   ├── index.ts                 # 插件入口：注册 meta + verify + projection
│   ├── service.ts               # Service Definition：LabService 抽象类（extends TypertRemoteService）
│   ├── lab-agent-local.ts       # Service Provider：LabLocal 实现（extends LabService, @Remote ping）
│   ├── commands.ts              # Consumer（元命令）：/lab 命令（注册/注销服务）
│   ├── verify.ts                # Consumer（验证）：注入 lab 服务，验证解析
│   ├── projection.ts            # Host 端 Session Projection：追踪 lab 状态并推送给 Client
│   ├── projection-types.ts      # Projection schema（LabState + LabStateSchema）
│   └── context-augment.d.ts     # Context 声明合并 + SessionProjectionMap 类型注入
│
├── client/                      # Client 半 TypeScript 源码
│   ├── client.ts                # 侧边栏显示/隐藏控制（订阅 Projection 注入 CSS）
│   └── InstrumentPanel.tsx      # [占位] 仪器面板组件
│
├── dist/                        # 构建产物
│   ├── index.js                 # Host 入口（package.json main 指向此）
│   ├── commands.js
│   ├── service.js
│   ├── lab-agent-local.js
│   ├── verify.js
│   ├── projection.js
│   ├── projection-types.js
│   └── client.js                # Client bundle（浏览器加载）
│
├── package.json
├── tsconfig.json
└── tsdown.config.ts
```

### 文件角色对照

| 文件 | 角色 | 职责 |
|---|---|---|
| `src/service.ts` | Service Definition | 定义 `LabService` 抽象类，继承 `TypertRemoteService`，注册服务名 `'lab'` |
| `src/lab-agent-local.ts` | Service Provider | 实现 `LabLocal`，继承 `LabService`，提供 `@Remote ping()` |
| `src/commands.ts` | Consumer（元命令） | 注册 `/lab` 命令控制服务生命周期 |
| `src/verify.ts` | Consumer（验证） | 注入 `lab` 服务，验证服务解析成功 |
| `src/projection.ts` | Projection | Host 端 Session Projection，追踪 lab 状态并推送给 Client |
| `src/projection-types.ts` | Schema | LabState 类型和 Zod schema |
| `client/client.ts` | Client | 订阅 Projection，注入/移除 CSS 控制侧边栏 |

### 依赖方向

```
                  src/index.ts
                       │
                       ▼
              src/commands.ts ─────→ src/service.ts ←───── src/lab-agent-local.ts
                       │                   ▲                      │
                      (uses)                │                      │
                       │                   │                @Remote ping
                       ▼                   │                      │
              src/verify.ts ────────────────┘                Typert Gateway
                       │
                       │ inject=['lab']
                       │
              src/projection.ts ──── Session Projection ───→ client/client.ts
                                                              (subscribe → CSS)
```

### 构建流程

```
npm run build
  │
  ├─ tsc（tsconfig.json）
  │   src/*.ts ──→ dist/*.js
  │
  └─ tsdown（tsdown.config.ts）
      client/client.ts ──→ dist/client.js（含 __ModuleLoader__.load 包裹）
```

---

## 4. 总体架构

```
┌─────────────────────────── 浏览器 (Client) ───────────────────────────┐
│                                                                        │
│  ┌───────────────────── DSH Web UI ─────────────────────┐              │
│  │  conversation (对话) │ shell.overlay (浮动面板)       │              │
│  │                      │  └── 仪器面板 (InstrumentPanel) │              │
│  │                      │  └── 命令输出卡片               │              │
│  │                      │ settings.section               │              │
│  │                      │  └── 工作流管理 (WorkflowPanel) │              │
│  └──────────────────────────────────────────────────────┘              │
│       │                                                                │
│       │  DSH 原生协议 (HTTP POST /api/* + WebSocket 事件)               │
│       │                                                                │
├───────│────────────────────────────────────────────────────────────────┤
│       │                  Host (DSH Agent)                               │
│       │                                                                │
│  ┌────▼──────────── dsh-lab 插件 ────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  ┌──────────────── System Prompt 上下文注入 ────────────────────┐  │ │
│  │  │                                                              │  │ │
│  │  │  section "lab:instruments" (order: 200)                     │  │ │
│  │  │  → 每步渲染：当前连接的仪器列表 + 状态                        │  │ │
│  │  │                                                              │  │ │
│  │  │  section "lab:documents" (order: 201)                       │  │ │
│  │  │  → 每步渲染：可用仪器文档索引（DG.md/DHO.md/ASG24100.md）     │  │ │
│  │  │                                                              │  │ │
│  │  │  section "lab:workflows" (order: 202)                       │  │ │
│  │  │  → 每步渲染：可用工作流列表 + frontmatter                     │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  │  ┌──────────────── 注册的工具集 ────────────────────────────────┐  │ │
│  │  │                                                              │  │ │
│  │  │  发现类：                                                    │  │ │
│  │  │  ┌───────────────────┐  ┌───────────────────┐               │  │ │
│  │  │  │ scan_instruments  │  │ read_document     │               │  │ │
│  │  │  └─────────┬─────────┘  └─────────┬─────────┘               │  │ │
│  │  │            │                      │                         │  │ │
│  │  │  工作流 CRUD：                                                │  │ │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │ │
│  │  │  │ read_   │ │ create_ │ │ update_ │ │ delete_ │           │  │ │
│  │  │  │ workflow│ │ workflow│ │ workflow│ │ workflow│           │  │ │
│  │  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │  │ │
│  │  │       │           │           │           │                 │  │ │
│  │  │  仪器控制：                                                  │  │ │
│  │  │  ┌─────────┐ ┌─────────┐                                     │  │ │
│  │  │  │send_scpi│ │send_asg │                                     │  │ │
│  │  │  └────┬────┘ └────┬────┘                                     │  │ │
│  │  │       │           │                                          │  │ │
│  │  └───────│───────────│──────────────────────────────────────────┘  │ │
│  │          │           │                                            │ │
│  │          ▼           ▼                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │              Python 执行引擎 (dsh_lab/*)                        │  │ │
│  │  │                                                             │  │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │ │
│  │  │  │ PyVISA 引擎   │  │ ASG SDK 引擎  │  │ 文件操作          │  │  │ │
│  │  │  │ (SCPI 命令)   │  │ (asglib DLL) │  │ (读/写/列表)      │  │  │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────┘  │  │ │
│  │  │                                                             │  │ │
│  │  │  ┌──────────────┐  ┌──────────────┐                        │  │ │
│  │  │  │ 设备库存管理   │  │ 状态文件管理   │                        │  │ │
│  │  │  │ (inventory)   │  │ (status)     │                        │  │ │
│  │  │  └──────────────┘  └──────────────┘                        │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 与原 lab 的映射（修正版）

| 原 lab 组件 | DSH 插件对应 | 变化 |
|---|---|---|
| `agent.py` StateGraph 路由 | **DSH Agent Loop 的 turn-step 循环** | 不需要图引擎 |
| `chat_llm` 节点 + `CHAT_TOOLS` | **DSH Agent + 全部工具可见** | 服务注册后工具自动可用 |
| `dev_llm` 节点 + `DEVLLM_TOOLS` | **DSH Agent + 仪器控制工具** | 同上 |
| `build_llm` 节点 + `BUILDLLM_TOOLS` | **DSH Agent + 工作流 CRUD 工具** | 同上 |
| `AgentState.mode` 字段 | **无** | DSH Agent 不区分模式 |
| `dev_context` / `build_context` | **session history（工具调用历史）** | 自动反馈，无需手动管理 |
| `instrument` 节点执行 SCPI | **`send_scpi` 工具** | 原子操作 |
| `asg_instrument` 节点执行 ASG | **`send_asg` 工具** | 原子操作 |
| `submit_device_commands`（只提交不执行） | **无对应** | DSH Agent 直接调用 send_scpi 执行 |
| `load_workflow_doc`（读文档/工作流） | **`read_document` / `read_workflow`** | 直接映射 |
| `read_doc_lines` | **`read_document`** | 直接映射 |
| `create_workflow` / `write_workflow` / `delete_workflow` | **同名工具** | 直接映射 |
| `get_connected_devices` | **`scan_instruments`** | 直接映射 |
| `to_work`（模式切换） | **`/lab` 斜杠命令** | 动态注册/注销服务，无需模式字段 |
| `finish_workflow` | **无对应** | LLM 自行判断结束 |
| `request_user_input`（interrupt） | **DSH ask_user_question 工具** | 已有 |
| `protocol.py` 自定义帧协议 | **DSH 已有流式协议** | 直接用 |
| `MemorySaver` | **DSH 会话持久化** | 自带 |
| `commands/` 斜杠命令注册表 | **`ctx.commands.register()`** | 注册即所得 |
| `agent.py` 图引擎 | **DSH Agent Loop + Service** | 服务注册即开关，无需状态检查 |

---

## 6. 三角色架构

参考[官方实践教程](https://deepseek-harness.github.io/deepseek-harness/develop/practice/)，插件按三种角色拆分：

```
Service Definition  →  Service Provider  →  Consumer
(定义接口+类型)        (实现具体逻辑)       (暴露为模型工具)
```

### 5.1 类比理解

```
Service Definition = 电源接口标准（220V/50Hz）
Service Provider   = 发电厂（发电）
Consumer           = 电视机（用电）
```

接口标准定义了电压、频率、插头形状。发电厂和电视机都遵守这个标准，但它们彼此不知道对方存在。

### 5.2 在 lab 里

```
Service Definition = LabService 抽象类
                    "我定义了 sendScpi() 方法的签名"

Service Provider   = LabLocal
                     "我实现 sendScpi() 的具体逻辑：调 Python 发 SCPI 命令"
                     "我的存在本身就是 lab 模式的开启"

Consumer（元命令）  = commands.ts 里的 /lab 命令
                     "我调用 ctx.plugin(LabLocal) 注册服务"
                     "我调用 ctx.registry.delete(LabLocal) 注销服务"

Consumer（工具）    = tools.ts 里的 send_scpi 工具
                     "我不知道 SCPI 怎么发，我只管调 lab.sendScpi()"
                     "我声明 inject = ['lab']，服务存在时自动激活"
```

### 5.3 角色映射

| 角色 | 职责 | 对应代码 |
|---|---|---|
| **Service Definition** | 定义 `LabService` 抽象类（`sendScpi()`、`scanInstruments()`...） | `src/service.ts` |
| **Service Provider** | 实现具体逻辑：调用 Python 执行 SCPI/ASG | `src/lab-agent-local.ts` |
| **Consumer（工具）** | 注册工具（`send_scpi`），声明 `inject = ['tools', 'lab']` | `src/tools.ts` |
| **Consumer（上下文）** | 注入 system prompt section，声明 `inject = ['systemPrompt', 'lab']` | `src/context.ts` |
| **Consumer（元命令）** | 注册 `/lab` 命令，控制服务注册/注销 | `src/commands.ts` |

### 5.4 依赖关系

```
Consumer（元命令） ──→ Service Definition ←── Service Provider
Consumer（工具）   ──→ Service Definition
Consumer（上下文） ──→ Service Definition
```

Consumer 和 Service Provider 互不依赖，都只依赖 Service Definition。
元命令（`/lab`）通过 `ctx.plugin()`/`ctx.registry.delete()` 控制 Service Provider 的生命周期。

### 5.5 为什么这样分

**Consumer 不用管 Provider 怎么实现，也不用检查服务是否开启**：

```ts
// Consumer（tools.ts）— 只关心"怎么用"
export const inject = ['tools', 'lab']   // lab 不存在 → 此文件不执行

export function apply(ctx: Context) {
  const lab = ctx.lab   // 能走到这里，说明 lab 服务一定存在
  
  ctx.tools.register(defineTool({
    name: "send_scpi",
    async execute(args) {
      // 直接调接口，不需要检查 isEnabled()
      return (await lab.sendScpi(args)).text
    }
  }));
}
```

**Provider 不用管 Consumer 怎么用，也不需要管理开关状态**：

```ts
// Provider（lab-local.ts）— 只关心"怎么实现"
class LabLocal extends LabService {
  async sendScpi(address: string, command: string) {
    // 具体实现：调 Python 子进程
    const result = await this.ctx.shell.run(this.ctx.shell.resolve({
      command: `python -m dsh_lab.send_scpi ${address} ${command}`,
    }));
    return result.stdout.text;
  }
}
```

### 5.6 好处

**替换 Provider**（比如仪器不在本地，要通过网络远程操控）：
```
原：LabLocal → 本地 Python 子进程
新：LabRemote → HTTP 请求远程仪器

Consumer（tools.ts）一行都不用改
因为它只认 LabService 接口，不认具体实现
```

**服务开关**（/lab 命令）：
```
开启：ctx.plugin(LabLocal)     → 消费者自动激活
关闭：ctx.registry.delete(LabLocal) → 消费者自动休眠

Consumer 不需要任何 isEnabled() 检查
因为服务不存在时，Consumer 的 apply() 根本不会执行
```

### 5.7 注册与获取

```ts
// Provider 注册（由 /lab 命令触发）
ctx.plugin(LabLocal);

// Provider 注销（由 /lab 命令触发）
ctx.registry.delete(LabLocal);

// Consumer 获取（inject 保证 lab 已就绪）
export const inject = ['tools', 'lab']
export function apply(ctx: Context) {
  const lab = ctx.lab  // 能走到这里，说明 lab 一定存在
}
```

### 5.8 当前决策

因为 lab 插件较简单，**三个角色合在一个包里**，但代码文件按角色分离。`/lab` 作为元命令始终注册，消费者（tools/context/commands）声明 `inject = ['lab']`，由服务注册触发激活。如果以后需要替换提供方（比如远程控制仪器），只需新增一个 Provider 包，Consumer 代码不动。

---

## 7. Host 半设计

### 6.1 入口注册 (src/index.ts)

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
  ctx.plugin(projection)  // Session Projection：追踪 lab 状态并推送给 Client
}
```

> `src/commands.ts` 注册 `/lab` 元命令，`src/verify.ts` 声明 `inject = ['lab']` 验证服务解析，`src/projection.ts` 声明 `inject = ['sessionProjections']` 推送状态到 Client。

### 6.2 Session Projection 状态推送

> 详细实现见 [IMPLEMENTATION.md](IMPLEMENTATION.md)

Projection key: `'dsh-lab:state'`，状态 `{ active: boolean }`：
- `init`: 始终返回 `{ active: false }`（新会话默认关闭）
- `apply`: 遇到 `command/run` 且 `name === 'lab'` 时翻转 `active`
- `wire.view`: 状态直接作为 wire 值推送给 Client

Client 订阅 projection 后根据 `active` 注入/移除 CSS 控制侧边栏。

---

## 8. 数据流

### 7.1 插件开关（/lab）— Projection 驱动

```
用户输入 /lab
  │
  ▼
Input Machine 检测 `/` 触发器 → Command Menu 显示 /lab
  │
  ▼
用户回车 → ctx.remote.commands.execute(sessionId, "/lab")
  │
  ▼
Host: /lab handler 检查 ctx.root.registry.has(LabLocal)
  │
  ├─ 未注册 → ctx.root.plugin(LabLocal)
  │           → LabLocal 构造函数调用 ctx.reflect.provide('lab', self)
  │           → 服务注册到 store → notify(['lab'])
  │           → verify 消费者 fiber 检测到 'lab' 可用
  │           → 自动执行 apply() → 验证服务就绪
  │           → 返回 "实验模式已启用"
  │
  └─ 已注册 → ctx.root.registry.delete(LabLocal)
              → dispose LabLocal 的 fiber
              → fiber.effect cleanup → delete store['lab'] → notify(['lab'])
              → verify 消费者 fiber 检测到 'lab' 消失
              → 自动 dispose
              → 返回 "实验模式已关闭"

command/run 事件写入 session log
  │
  ▼
SessionProjectionRegistry.drive(session, event)
  │
  ▼
projection.apply(state, {type:'command/run', data:{name:'lab'}})
  │  翻转 active: !state.active
  │
  ▼
Object.is(next, state)? → 状态变化
  │
  ▼
schema.parse(view(next)) → onChanged → broadcast
  │
  ▼
WebSocket mux 流 → Client faceOf('dsh-lab:state').subscribe 回调
  │
  ▼
update(state.active)
  ├─ true  → 注入 <style> → 侧边栏隐藏
  └─ false → 移除 <style> → 侧边栏恢复
```

**关键设计**：
- 服务注册是进程全局的（`ctx.root.plugin`），但侧边栏状态是每会话的（projection）
- projection `init` 始终返回 `{ active: false }` — 新会话默认侧边栏可见
- projection `apply` 翻转状态，不检查 registry（避免时序问题）

### 7.2 执行工作流（LLM 驱动）

```
用户: "帮我执行 DG 双通道直流输出工作流"
  │
  ▼
DSH Agent (turn 1, step 1)
  → 看到 systemPrompt 里的工作流索引，知道有 dg_dc_output
  → 调用 read_workflow(name="dg_dc_output")
  → 返回工作流文件内容
  │
  ▼
DSH Agent (turn 1, step 2)
  → LLM 阅读工作流内容，理解步骤
  → 调用 send_scpi(address="", command=":SOUR1:APPL:DC 100,5,2,0")
  → 返回 "SCPI 写入成功"
  │
  ▼
DSH Agent (turn 1, step 3)
  → LLM 看到步骤 1 完成，继续步骤 2
  → 调用 send_scpi(address="", command=":SOUR2:APPL:DC 100,5,2,0")
  → 返回 "SCPI 写入成功"
  │
  ▼
DSH Agent (turn 1, step 4)
  → LLM 看到所有步骤完成
  → 无 tool-call → turn 结束
  → 回复用户："DG 双通道直流输出工作流执行完成"
```

### 7.3 文档驱动操作（含 LLM 推理）

```
用户: "调整示波器时基使屏幕显示 2 个完整周期"
  │
  ▼
DSH Agent (turn 1)
  → 看到 systemPrompt 里的文档索引
  → 调用 read_document(filename="DHO.md", lines="100-150")
  → 返回波形读取相关命令
  │
  ▼
DSH Agent (turn 2)
  → LLM 理解命令，组装 SCPI 序列
  → 调用 send_scpi(address="", command=":WAVeform:SOURce CHANnel1")
  → 调用 send_scpi(address="", command=":WAVeform:MODE NORMal")
  → 调用 send_scpi(address="", command=":WAVeform:FORMat ASCii")
  → 调用 send_scpi(address="", command=":WAVeform:DATA?")
  → 返回波形数据
  │
  ▼
DSH Agent (turn 3)
  → LLM 分析波形数据，计算周期
  → 计算时基值
  → 调用 send_scpi(address="", command=":TIMebase:MAIN:SCALe <计算值>")
  → 返回执行结果
  │
  ▼
DSH Agent (turn 4)
  → LLM 确认完成
  → 无 tool-call → turn 结束
  → 回复用户
```

---

## 9. Client 半设计

### 8.1 渲染策略

Client 通过订阅 Session Projection 感知 lab 服务状态：
- **projection `active: true`** → 注入 CSS 隐藏侧边栏
- **projection `active: false`** → 移除 CSS 恢复侧边栏

使用 `ctx.effect` + `face.subscribe()` 实现响应式更新，监听 `ctx.sessions.list` 变化以在会话切换时重新订阅。

### 8.2 CSS 注入

```css
html div:has(> [data-shell-overlay]){grid-template-columns:0 minmax(0,1fr) 0 !important}
```

通过 DOM API 动态创建/移除 `<style>` 标签，不依赖 React。

### 8.3 InstrumentPanel（占位）

`client/InstrumentPanel.tsx` 当前为占位组件，未来用于显示仪器控制面板。

---

## 10. 依赖

### 9.1 运行时依赖

| 依赖 | 用途 | 安装 |
|---|---|---|
| Python 3.13+ | 执行引擎 | 系统已装 |
| PyVISA + pyvisa-py | SCPI 仪器通信 | `pip install pyvisa pyvisa-py` |
| asglib | ASG24100 SDK 封装 | 厂商提供 |
| PyYAML | 工作流文件解析 | `pip install pyyaml` |

### 9.2 DSH 插件依赖 (package.json)

```json
{
  "name": "dsh-lab",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc & tsdown"
  },
  "peerDependencies": {
    "@deepseek-ai/cordis": "^4.0.1",
    "@deepseek-ai/dsh-typert-protocol": "^0.1.0-rc.8"
  },
  "devDependencies": {
    "tsdown": "^0.22.14",
    "typescript": "^5.6.0"
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "inject": [
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-layout"
      ]
    }
  },
  "exports": {
    ".": "./dist/index.js",
    "./client": "./dist/client.js",
    "./cordis.patch.yml": "./cordis.patch.yml",
    "./package.json": "./package.json"
  }
}
```

---

## 11. 安装与使用

```sh
# 1. 构建产物（src/*.ts → dist/*.js，client/client.ts → dist/client.js）
npm run build

# 2. 安装插件
dsh plugin --profile web add file:./dsh-lab

# 3. 重启 DSH
# 关闭当前 dsh web，重新启动

# 3. 使用（对话中直接说，需先 /lab）
# "/lab"                   → 注册 lab 服务（开启实验模式）
# "/lab"                   → 再次输入注销 lab 服务（关闭实验模式）
# "扫描仪器"               → scan_instruments
# "执行 DG 双通道直流输出" → read_workflow → send_scpi × 2
# "读 DG 文档 23-36 行"   → read_document
# "新建工作流"            → create_workflow

# 4. 斜杠命令
# /lab                    → 注册/注销 lab 服务（实验模式开关）
# /devices                → 扫描仪器（lab 服务存在时可用）
# /new                    → 新建会话（lab 服务存在时可用）
# /rename <编号> <名称>   → 重命名设备（lab 服务存在时可用）

# 5. 卸载
dsh plugin --profile web remove dsh-lab
```

---

## 12. 实现优先级

| 阶段 | 内容 | 依赖 |
|---|---|---|
| **P0** | `/lab` 元命令（服务注册/注销） | Cordis 动态注册 API |
| **P0** | Service Provider（`LabLocal`：Python 执行引擎） | PyVISA |
| **P0** | Service Definition（`LabService` 抽象类） | — |
| **P0** | 核心工具（scan / read_document / read_workflow / send_scpi） | PyVISA |
| **P0** | System Prompt 上下文注入（仪器/文档/工作流索引） | 文件系统 |
| **P1** | 工作流 CRUD 工具 | 文件系统 |
| **P1** | ASG 工具（send_asg） | asglib |
| **P1** | 斜杠命令（/devices, /new, /rename） | — |
| **P2** | Client 半仪器面板 | React + Slot |
| **P2** | Client 半工作流面板 | React + Slot |

---

## 13. 已知边界

- **仪器连接**：PyVISA 需要 VISA 后端（pyvisa-py 纯 Python 或 NI-VISA 商业驱动）
- **ASG SDK**：asglib 依赖厂商 DLL，需 Windows + 驱动安装
- **长连接**：当前方案每次工具调用新建/关闭 VISA 连接。高频场景需改为长驻 Python 进程
- **沙箱**：仪器控制操作可能触发沙箱限制，需 `sandbox_permissions` 授权
- **LLM 推理质量**：工作流执行质量依赖 LLM 对文档的理解和命令组装能力
- **动态注册**：`/lab` 依赖 Cordis 的 `ctx.plugin()` 运行时注册能力，需框架版本 ≥ 4.0.1
- **上下文层级**：`/lab` 需注册到 root context（`ctx.root.plugin()`）以确保全局可见
- **Projection 可见性**：client-visible projection 必须提供 `wire: { viewSchema, view }` 块
- **Projection 时序**：`apply` 不检查 registry，基于状态翻转（事件提交先于命令处理器）
- **Projection 初始值**：`init` 始终返回 `false`，避免跨会话污染
- **会话隔离**：服务注册是全局的，但侧边栏状态（projection）是每会话的
- **`face.subscribe` 回调**：不传参数，必须 `face.getSnapshot()` 读取当前值

---

## 14. 踩坑记录

### 14.1 node_modules 下不能暴露 .ts 入口

**现象**：`dsh plugin add` 安装后启动报错 `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`，指向 `node_modules/dsh-lab/lib/index.ts`。

**原因**：Node.js 的原生类型擦除（`--experimental-strip-types`）明确不支持 `node_modules` 目录下的 `.ts` 文件。开发模式走 `--patch` + tsx 加载源码不受影响，但安装后必须分发编译产物。

**修复**：
1. 添加 `tsconfig.json`，将 `lib/*.ts` 原地编译为 `lib/*.js`（`npx tsc`）
2. 源码内部导入从 `.ts` 改为 `.js`（NodeNext ESM 标准写法，tsx 也能将 `.js` 解析回 `.ts`）
3. `package.json` 的 `main` 和 `exports[.]` 从 `lib/index.ts` 改为 `lib/index.js`
4. 添加 `typescript` devDependency 和 `"build": "tsc"` 脚本

**教训**：DSH 插件包分发时，入口必须是预编译的 `.js`。`.ts` 源码仅在 `--patch` 开发模式下有效。

### 14.2 Client bundle 的 __ModuleLoader__.load id 必须是包名

**现象**：host 端加载成功，但 client 端报错 `bundle /plugins/dsh-lab/client.js loaded without registering "dsh-lab" via __ModuleLoader__.load`。

**原因**：`tsdown.config.ts` 的 banner 中 `id` 被设为宿主入口路径 `file:///.../lib/index.ts`，但 boot manifest 期望 client 用包名 `"dsh-lab"` 注册。两者不匹配导致 module loader 认为 client 未注册。

**修复**：`tsdown.config.ts` 中将 `id` 改为 `'dsh-lab'`，重新 `npx tsdown` 构建。

**经验**：client bundle 的 `__ModuleLoader__.load({ id })` 中的 `id` 是插件的身份标识，必须与 `package.json` 的 `name` 一致，与宿主入口路径无关。

### 14.3 纯副作用 client 组件不需要 React

**现象**：client 组件报错 `ReferenceError: React is not defined`。

**原因**：组件使用 `React.useEffect` 注入 CSS，但从未导入 React，运行时也没有全局 `React` 变量。

**修复**：组件只返回 `null`、纯粹靠副作用注入 CSS，不需要 React 生命周期。去掉 `React.useEffect`，直接用原生 DOM API（`document.createElement('style')`）注入样式。

**教训**：client 插件如果只做 CSS/JS 注入、不渲染 UI，不要引入 React。`slot.register` 的渲染函数直接操作 DOM 即可，避免不必要的框架依赖。

### 14.4 Projection 必须提供 `wire` 块才能对客户端可见

**现象**：Host 端 projection 注册成功，但 Client 端 `faceOf('dsh-lab:state')` 返回 `null`，`getSnapshot()` 返回 `undefined`。

**原因**：`register()` 对 client-visible 的 projection（key 在 `SessionProjectionMap` 中）要求必须提供 `wire: { viewSchema, view }`。没有 `wire` 块则注册为 host-only。

**修复**：添加 `wire: { viewSchema: LabStateSchema, view: (state) => state }`。

### 14.5 `apply` 不能依赖 registry 状态（时序问题）

**现象**：`/lab` 命令执行后，projection `apply` 中检查 `ctx.root.registry.has(LabLocal)` 返回错误值。

**原因**：`command/run` 事件在命令处理器运行**之前**就被提交给 projection。此时 `ctx.root.plugin(LabLocal)` 尚未执行。

**修复**：`apply` 不检查 registry，基于当前 projection 状态翻转：`{ active: !(state?.active ?? false) }`。

### 14.6 `init` 不能检查 registry（跨会话污染）

**现象**：新对话创建时，projection `init` 检查 registry 返回 `true`（因为上一个会话注册过），导致新会话错误地以 lab 模式开启。

**原因**：`LabLocal` 注册在 root context，跨会话持久存在。

**修复**：`init` 始终返回 `{ active: false }`。
