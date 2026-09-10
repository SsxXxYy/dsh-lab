# dsh-lab 项目指南

> DeepSeek Harness (DSH) 插件：通过自然语言控制实验室仪器。

## 1. 项目概述

dsh-lab 是一个 DSH bundle 插件，将实验室仪器控制功能移植为 DSH 的插件体系。核心理念：**LLM 做一切决策，工具只做原子操作**。

插件采用**三角色架构**（Service Definition → Service Provider → Consumer），通过 Cordis 框架的动态服务注册/注销机制实现插件开关。

### 当前实现状态

- **已实现**：`/lab` 元命令、Service Definition/Provider、Session Projection、Client CSS 注入（侧边栏 + 顶栏）、System Prompt 上下文注入、工具集代码（8 个）、Python 执行引擎
- **设计完成**：斜杠命令（`/devices` `/new` `/rename`）
- **未实现**：斜杠命令代码

## 2. 技术栈

| 层级 | 技术 |
|---|---|
| 语言 | TypeScript（Host + Client）、Python（硬件引擎） |
| 运行时 | Node.js（Host）、浏览器（Client） |
| 框架 | `@deepseek-ai/cordis` ^4.0.1 |
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
│   ├── USAGE-DRIVEN-DESIGN.md       # 用法驱动设计
│   ├── LAB-TOGGLE-CODE.md           # /lab 切换机制
│   ├── SLASH-COMMANDS.md            # 斜杠命令方案
│   └── TOOLS.md                     # 工具集文档
├── src/                             # Host 端 TypeScript 源码
│   ├── AGENTS.md                    # Host 端开发指南（详细）
│   ├── index.ts                     # 插件入口
│   ├── service.ts                   # Service Definition
│   ├── lab-local.ts                 # Service Provider
│   ├── tools.ts                     # Consumer（工具注册，8 个工具）
│   ├── commands.ts                  # Consumer（元命令 /lab）
│   ├── context.ts                   # Consumer（上下文注入）
│   ├── projection.ts                # Consumer（投影）
│   └── types/                       # 本地类型声明
│       ├── dsh-tools.d.ts           # ctx.tools 模块合并
│       └── dsh-tools-module.d.ts    # @deepseek-ai/dsh-tools 模块声明
├── py/                              # Python 执行引擎
│   ├── __init__.py                  # 包标识
│   ├── __main__.py                  # 入口路由（python -m py <module>）
│   ├── scan.py                      # 设备扫描（PyVISA + asglib）
│   ├── scpi.py                      # SCPI 通信（PyVISA，批次处理）
│   └── asg.py                       # ASG SDK 调用（asglib，批次处理）
├── client/                          # Client 端
│   ├── client.ts                    # 侧边栏 + 顶栏 CSS 控制
│   └── AGENTS.md                    # Client 端开发指南
├── content/                         # Markdown 内容文件
│   └── role.md                      # 角色定位提示词
├── devices/                         # 设备清单 JSON
├── docs/                            # 仪器文档
├── workflows/                       # 工作流
├── dist/                            # 构建产物
├── package.json
├── tsconfig.json
├── tsdown.config.ts
└── requirements.txt                 # Python 依赖
```

**详细开发指南**：
- Host 端（src/）：[src/AGENTS.md](src/AGENTS.md)
- Client 端（client/）：[client/AGENTS.md](client/AGENTS.md)

## 5. 架构概览

### 5.1 三角色架构

| 角色 | 文件 | 职责 |
|---|---|---|
| **Service Definition** | `src/service.ts` | 定义 `LabService` 抽象类 + 类型 |
| **Service Provider** | `src/lab-local.ts` | 实现 `LabLocal`（文件操作 + Python 调用） |
| **Consumer（工具）** | `src/tools.ts` | 注册 8 个 DSH 工具 |
| **Consumer（元命令）** | `src/commands.ts` | 注册 `/lab`，控制服务注册/注销 |
| **Consumer（上下文）** | `src/context.ts` | 注册 4 个 system prompt section |
| **Consumer（投影）** | `src/projection.ts` | 推送状态到 Client |

> 详见 [src/AGENTS.md §2](src/AGENTS.md)

### 5.2 插件开关机制

```
/lab → ctx.root.registry.has(LabLocal)?
  → 未注册 → ctx.root.plugin(LabLocal) → 服务注册 → 消费者自动激活
  → 已注册 → ctx.root.registry.delete(LabLocal) → 服务注销 → 消费者自动休眠
```

### 5.3 System Prompt 上下文

| Section | order | 内容 | 数据来源 |
|---|---|---|---|
| `lab:role` | 100 | 角色定位 + 工作流程 | `content/role.md` |
| `lab:instruments` | 200 | 当前连接的仪器列表 | `devices/devices_inventory.json` |
| `lab:documents` | 201 | 可用文档索引 | `docs/*.md` frontmatter |
| `lab:workflows` | 202 | 可用工作流列表 | `workflows/*/*.md` frontmatter |

> 详见 [src/AGENTS.md §2.4](src/AGENTS.md)

## 6. 开发约定

- 注释和文档使用**简体中文**
- 控制台日志使用 `[dsh-lab:模块名]` 前缀
- 源码内部导入使用 `.js` 后缀（NodeNext ESM）
- 每个插件文件导出 `name`、`inject`、`apply`

> 详细开发指南见 [src/AGENTS.md](src/AGENTS.md)

## 7. 工具集（已实现）

| 工具 | 类型 | 实现方式 | 说明 |
|---|---|---|---|
| `scan_instruments` | exclusive | Python | 扫描 VISA + ASG 设备 |
| `read_document` | parallel | TypeScript | 按行区间/章节读文档 |
| `read_workflow` | parallel | TypeScript | 读工作流文件 |
| `create_workflow` | exclusive | TypeScript | 新建工作流 |
| `update_workflow` | exclusive | TypeScript | 修改工作流 |
| `delete_workflow` | exclusive | TypeScript | 删除工作流 |
| `send_scpi` | exclusive | Python（批次） | 发多条 SCPI 命令，按顺序执行 |
| `send_asg` | exclusive | Python（批次） | 发多条 ASG SDK 调用，按顺序执行 |

> 详见 [design/TOOLS.md](design/TOOLS.md)

## 8. 动态插件开发（试验田模式）

> **核心理念**：用动态插件快速验证功能逻辑，确认可行后再持久化到源码。

### 8.1 适用场景

| 场景 | 说明 |
|---|---|
| 快速验证想法 | 测试新工具/服务/命令的设计是否合理 |
| 运行时诊断 | 注入诊断工具读取状态、打印日志 |
| 会话专属定制 | 当前对话临时加功能，用完即走 |
| 避免慢循环 | 跳过改文件→构建→重启的循环 |

### 8.2 沙箱限制

| 不可用 | 原因 | 替代方案 |
|---|---|---|
| `ctx.root` | 框架内部 API | 用闭包变量追踪状态 |
| `ctx.root.registry` | 框架内部 API | 用闭包变量代替 |
| `ctx.root.plugin()` | 框架内部 API | 直接注册服务/工具 |
| `import` 语句 | 无模块系统 | 所有代码内联到一个字符串 |
| TypeScript 类型 | 无编译步骤 | 纯 JavaScript |

### 8.3 开发流程

```
1. cordis_define(kind: "new")  → 创建动态插件
2. cordis_run(mode: "run")     → 激活（需 UI 批准）
3. 测试功能                     → 在会话中验证
4. 修复迭代                     → cordis_define(kind: "existing") → cordis_run(mode: "update")
5. 持久化（可选）               → 将验证通过的逻辑写入 src/ → npm run build
```

## 9. 预设隔离方案（待决策）

> **当前状态：已识别问题，方案待最终决定。**

### 9.1 问题描述

当前 `cordis.patch.yml` 使用 `insert` 将 dsh-lab 插入 Host 组合，导致**所有预设**都能加载 dsh-lab。

### 9.2 可选方案

| 方案 | 做法 | 效果 |
|---|---|---|
| **A. 保持现状** | `insert` 到 Host 组合 | 所有预设都能用 `/lab` |
| **B. 预设隔离** | 只在 `presets/lab/agent.cordis.yml` 里引用 dsh-lab | 只有 Lab 预设加载 dsh-lab |

## 10. 已知边界与踩坑

| 问题 | 解决方案 |
|---|---|
| Projection 必须提供 `wire` 块 | 添加 `wire: { viewSchema, view }` |
| `command/done` 事件无 `name` 字段 | 响应所有事件后读取 registry |
| `face.subscribe` 回调不传参数 | 回调内必须手动 `face.getSnapshot()` |
| `node_modules` 下不能暴露 `.ts` 入口 | 分发时入口必须是预编译的 `.js` |
| 顶栏隐藏用 `display:none` | 不能用 `grid-template-rows:0`（会压缩聊天窗口） |
| `inject` 声明即检查 | 不需要手动 `isEnabled()` 判断 |
| `@deepseek-ai/dsh-tools` 类型缺失 | 在 `src/types/` 添加本地声明文件 |
| SCPI/ASG 批次超时 | 超时按命令数量线性计算：`30000 * commands.length` |
| `continueOnError` 策略 | 默认出错即停；设为 true 可继续执行后续命令/调用 |
| Python 命令格式 | `python -m py <module>`（空格非点），运行 `py/__main__.py` 并传入模块名 |

> 详细边界见 [src/AGENTS.md §7](src/AGENTS.md)

## 11. Git 推送流程

```sh
# 1. 查看远程仓库和分支状态
git remote -v
git branch -vv
git status -sb

# 2. 推送到 GitHub
git push origin master
```

**远程仓库**：`https://github.com/SsxXxYy/dsh-lab.git`

> 推送时若出现 `unable to get credential storage lock` 警告，不影响推送结果，是 Git 凭据管理器的锁竞争问题。

## 12. 设计文档索引

| 文档 | 内容 | 受众 |
|---|---|---|
| `design/ARCHITECTURE.md` | 总体架构设计 | 开发者入手 |
| `design/IMPLEMENTATION.md` | 中间层架构大纲、上下文加载实现 | 开发者 |
| `design/TOOLS.md` | 工具参数、返回值、调用示例 | 开发者/LLM |
| `design/HOST-DESIGN.md` | Python 引擎设计 | 开发者 |
| `design/SLASH-COMMANDS.md` | 斜杠命令实现 | 开发者 |
| `design/LAB-TOGGLE-CODE.md` | /lab 切换机制代码详解 | 开发者 |
| `src/AGENTS.md` | Host 端开发指南（详细） | 开发者 |
| `client/AGENTS.md` | Client 端 Session Projection | 开发者 |
