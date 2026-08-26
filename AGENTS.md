# dsh-lab 项目指南

> DeepSeek Harness (DSH) 插件：通过自然语言控制实验室仪器。

## 1. 项目概述

dsh-lab 是一个 DSH（DeepSeek Harness）bundle 插件，将实验室仪器控制功能移植为 DSH 的插件体系。核心理念：**LLM 做一切决策，工具只做原子操作**。工作流文件是 LLM 阅读的说明书，不是机器执行的脚本——DSH Agent Loop 的 turn-step 循环天然支持多轮工具调用，不需要额外的图引擎。

插件采用**三角色架构**（Service Definition → Service Provider → Consumer），通过 Cordis 框架的动态服务注册/注销机制实现插件开关。

### 核心设计原则

- **TypeScript 处理文件 I/O**：文档读取、工作流 CRUD、设备清单 JSON 读写、YAML frontmatter 解析
- **Python 只负责硬件通信**：`scan`（PyVISA + asglib）、`scpi`（PyVISA）、`asg`（asglib）
- **设备清单 JSON 是设备记忆**：序列号是设备唯一身份，用户命名与硬件解耦，扫描增量合并

### 当前实现状态

- **已实现**：`/lab` 元命令、Service Definition（空壳）、Service Provider（空壳）、Session Projection、Client CSS 注入
- **设计完成**：中间层架构、工具集、System Prompt 上下文、斜杠命令、设备管理
- **未实现**：中间层代码、Python 执行引擎

## 2. 技术栈

| 层级 | 技术 |
|---|---|
| 语言 | TypeScript（Host + Client）、Python（硬件引擎） |
| 运行时 | Node.js（Host）、浏览器（Client） |
| 框架 | `@deepseek-ai/cordis` ^4.0.1 |
| RPC 协议 | `@deepseek-ai/dsh-typert-protocol` ^0.1.0-rc.8 |
| Schema 校验 | `zod` ^3.24.0 |
| 构建工具 | `tsc`（Host）、`tsdown` ^0.22.14（Client bundle） |

## 3. 构建与运行

```sh
# 构建
npm run build

# 开发模式
pnpm dsh web --patch ./cordis.patch.yml

# 安装/卸载
dsh plugin --profile web add file:./dsh-lab
dsh plugin --profile web remove dsh-lab
```

## 4. 项目结构

```
dsh-lab/
├── design/                          # 设计文档
│   ├── ARCHITECTURE.md              # 总体架构设计
│   ├── HOST-DESIGN.md               # Host 半设计（Python 执行引擎）
│   ├── IMPLEMENTATION.md            # 实现清单与推进
│   ├── USAGE-DRIVEN-DESIGN.md       # 用法驱动设计（用户场景 → 实现映射）
│   ├── LAB-TOGGLE-CODE.md           # /lab 切换机制
│   ├── SLASH-COMMANDS.md            # 斜杠命令方案
│   └── TOOLS.md                     # 工具集文档
├── src/                             # Host 端 TypeScript 源码
│   ├── index.ts                     # 插件入口
│   ├── service.ts                   # Service Definition（LabService 抽象类）
│   ├── lab-local.ts                 # Service Provider（LabLocal 实现）
│   ├── commands.ts                  # Consumer（元命令 /lab）
│   ├── projection.ts                # Session Projection
│   ├── projection-types.ts          # Projection schema
│   └── context-augment.d.ts         # Context 声明合并
├── client/                          # Client 端
│   ├── client.ts                    # 侧边栏 CSS 控制
│   └── AGENTS.md                    # Client 端开发指南
├── dist/                            # 构建产物
├── package.json
├── tsconfig.json
└── tsdown.config.ts
```

## 5. 架构详解

### 5.1 三角色架构

| 角色 | 文件 | 职责 |
|---|---|---|
| **Service Definition** | `src/service.ts` | 定义 `LabService` 抽象类 + Request/Result 类型 |
| **Service Provider** | `src/lab-local.ts` | 实现 `LabLocal`，文件操作 + Python 硬件调用 |
| **Consumer（工具）** | `src/tools.ts` | 注册 8 个工具 |
| **Consumer（上下文）** | `src/context.ts` | 注册 3 个 system prompt section |
| **Consumer（斜杠命令）** | `src/slash-commands.ts` | 注册 `/devices` `/new` `/rename` |
| **Consumer（元命令）** | `src/commands.ts` | 注册 `/lab`，控制服务注册/注销 |
| **Consumer（Projection）** | `src/projection.ts` | 推送状态到 Client |

### 5.2 TypeScript 与 Python 边界

| 操作 | TypeScript | Python |
|---|---|---|
| 文档/工作流读写 | ✅ | ❌ |
| 设备清单 JSON 读写 | ✅ | ❌ |
| YAML frontmatter 解析 | ✅ | ❌ |
| System Prompt 渲染 | ✅ | ❌ |
| `scan_instruments` | ❌ | ✅ |
| `send_scpi` | ❌ | ✅ |
| `send_asg` | ❌ | ✅ |

### 5.3 设备清单管理

文件：`devices/devices_inventory.json`，以序列号为 key：

```json
{
  "DG8R264801226": {
    "model": "DG852 Pro",
    "address": "TCPIP::169.254.112.68::INSTR",
    "name": "磁场控制源"
  }
}
```

- 序列号是设备唯一身份，不随连接地址变化
- 用户命名与硬件解耦，断电后保留
- 扫描增量合并，离线设备保留但清空连接信息

### 5.4 插件开关机制

```
/lab → ctx.root.registry.has(LabLocal)?
  → 未注册 → ctx.root.plugin(LabLocal) → 服务注册 → 消费者自动激活
  → 已注册 → ctx.root.registry.delete(LabLocal) → 服务注销 → 消费者自动休眠
```

### 5.5 Session Projection

- Key: `'dsh-lab:state'`，状态 `{ active: boolean }`
- Client 订阅后根据 `active` 值注入/移除 CSS 隐藏侧边栏

## 6. 开发约定

- 注释和文档使用**简体中文**
- 控制台日志使用 `[dsh-lab:模块名]` 前缀
- 源码内部导入使用 `.js` 后缀（NodeNext ESM）
- 每个插件文件导出 `name`、`inject`、`apply`

## 7. 工具集

| 工具 | 类型 | 说明 |
|---|---|---|
| `scan_instruments` | exclusive | 扫描 VISA + ASG 设备 |
| `read_document` | parallel | 按行区间/章节读文档 |
| `read_workflow` | parallel | 读工作流文件 |
| `create_workflow` | exclusive | 新建工作流 |
| `update_workflow` | exclusive | 修改工作流 |
| `delete_workflow` | exclusive | 删除工作流 |
| `send_scpi` | exclusive | 发单条 SCPI 命令 |
| `send_asg` | exclusive | 发单条 ASG SDK 调用 |

## 8. System Prompt 上下文

| Section | order | 内容 | 刷新时机 |
|---|---|---|---|
| `lab:instruments` | 200 | 当前连接的仪器列表 | 每步 |
| `lab:documents` | 201 | 可用文档索引 | 固定 |
| `lab:workflows` | 202 | 可用工作流列表 | 每步 |

## 9. 已知边界与踩坑

| 问题 | 解决方案 |
|---|---|
| Projection 必须提供 `wire` 块 | 添加 `wire: { viewSchema, view }` |
| `command/done` 事件无 `name` 字段 | `apply` 不能按命令名过滤，响应所有事件后读取 registry |
| `face.subscribe` 回调不传参数 | 回调内必须手动 `face.getSnapshot()` |
| `node_modules` 下不能暴露 `.ts` 入口 | 分发时入口必须是预编译的 `.js` |

## 10. 设计文档索引

| 文档 | 内容 | 受众 |
|---|---|---|
| `design/USAGE-DRIVEN-DESIGN.md` | 用户场景 → 实现映射、设备管理、优先级 | 开发者入手 |
| `design/IMPLEMENTATION.md` | 中间层架构大纲、实现推进 | 开发者 |
| `design/TOOLS.md` | 工具参数、返回值、调用示例 | 开发者/LLM |
| `design/HOST-DESIGN.md` | Python 引擎设计 | 开发者 |
| `design/SLASH-COMMANDS.md` | 斜杠命令实现 | 开发者 |
| `design/LAB-TOGGLE-CODE.md` | /lab 切换机制 | 开发者 |
| `client/AGENTS.md` | Client 端 Session Projection | 开发者 |
