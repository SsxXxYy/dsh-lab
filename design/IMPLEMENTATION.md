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


