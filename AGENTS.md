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

## 9. 动态插件开发（试验田模式）

> **核心理念**：用动态插件快速验证功能逻辑，确认可行后再持久化到源码。

### 9.1 适用场景

| 场景 | 说明 |
|---|---|
| 快速验证想法 | 测试新工具/服务/命令的设计是否合理 |
| 运行时诊断 | 注入诊断工具读取状态、打印日志 |
| 会话专属定制 | 当前对话临时加功能，用完即走 |
| 避免慢循环 | 跳过改文件→构建→重启的循环 |

### 9.2 沙箱限制

动态插件运行在**受限沙箱**中，以下 API **不可用**：

| 不可用 | 原因 | 替代方案 |
|---|---|---|
| `ctx.root` | 框架内部 API | 用闭包变量追踪状态 |
| `ctx.root.registry` | 框架内部 API | 用闭包变量代替 |
| `ctx.root.plugin()` | 框架内部 API | 直接注册服务/工具 |
| `import` 语句 | 无模块系统 | 所有代码内联到一个字符串 |
| TypeScript 类型 | 无编译步骤 | 纯 JavaScript |

沙箱**可用**的 API：`ctx.tools.register`、`ctx.on`、`ctx.provide`、`ctx.effect`、`ctx.sessions`、`ctx.commands`、`ctx.sessionProjections` 等通过 `inject` 声明的服务。

### 9.3 开发流程

```
1. cordis_define(kind: "new")  → 创建动态插件
2. cordis_run(mode: "run")     → 激活（需 UI 批准）
3. 测试功能                     → 在会话中验证
4. 修复迭代                     → cordis_define(kind: "existing") → cordis_run(mode: "update")
5. 持久化（可选）               → 将验证通过的逻辑写入 src/ → npm run build
```

### 9.4 完整示例：将 dsh-lab 动态化

以下代码将 dsh-lab 的全部核心功能（/lab 命令 + Session Projection + Client CSS）动态化：

```js
cordis_define({
  plugin: { kind: "new", idPrefix: "labdyn" },
  name: "dsh-lab 动态版",
  purpose: "验证 dsh-lab 核心逻辑",
  code: {
    host: `return {
      inject: ['commands', 'sessionProjections'],
      apply(ctx) {
        // 状态追踪：用闭包变量代替 ctx.root.registry
        let labActive = false;

        // 注册 /lab 命令
        ctx.commands.register({
          name: 'lab',
          description: '切换实验模式',
          handler: async () => {
            labActive = !labActive;
            return {
              kind: 'success',
              text: labActive ? '实验模式已启用' : '实验模式已关闭'
            };
          }
        });

        // 注册 Session Projection
        ctx.sessionProjections.register({
          key: 'dsh-lab-dyn:state',
          schema: { parse: (v) => v },
          init: () => ({ active: false }),
          apply: (state, event) => {
            if (event.type === 'command/done') {
              return { active: labActive };
            }
            return state || { active: false };
          },
          wire: {
            viewSchema: { parse: (v) => v },
            view: (state) => state,
          },
          stateVersion: 1,
        });
      }
    };`,
    client: `return {
      inject: ['slots', 'sessions'],
      apply(ctx) {
        const CSS = 'html div:has(> [data-shell-overlay]){grid-template-columns:0 minmax(0,1fr) 0 !important}';
        let tag = null;

        function update(active) {
          if (active && !tag) {
            tag = document.createElement('style');
            tag.textContent = CSS;
            document.head.appendChild(tag);
          } else if (!active && tag) {
            tag.remove();
            tag = null;
          }
        }

        ctx.effect(function () {
          // 订阅 projection 变化
          const binding = ctx.sessions.binding(ctx.sessions.list.getSnapshot().current);
          if (!binding) return;
          const face = binding.session.projections.faceOf('dsh-lab-dyn:state');
          if (!face) return;
          const unsub = face.subscribe(() => {
            const state = face.getSnapshot();
            update(state ? state.active : false);
          });
          return unsub;
        }, 'dsh-lab-dyn: subscription');
      }
    };`
  }
});
```

### 9.5 TypeScript → 动态插件转译规则

| TypeScript | JavaScript 动态版 |
|---|---|
| `import type { Context }` | 删除 |
| `const x: string = "a"` | `const x = "a"` |
| `function foo(): void {}` | `function foo() {}` |
| `interface Bar { ... }` | 删除 |
| `import { X } from './y'` | 内联或删除 |
| `export const name = '...'` | 直接写 `name: '...'` |
| `export function apply(ctx)` | `apply(ctx)` |
| `ctx.root.registry.has(X)` | 用闭包变量代替 |
| `ctx.root.plugin(X)` | 用 `ctx.provide()` 或闭包代替 |

### 9.6 持久化决策

| 情况 | 操作 |
|---|---|
| 动态插件验证通过 | 将逻辑写入 `src/` → `npm run build` → 持久化 |
| 需要复杂 TS 特性 | 直接写源码，不用动态插件 |
| 临时功能 | 保持动态，不持久化 |

## 10. 预设隔离方案（待决策）

> **当前状态：已识别问题，方案待最终决定。**

### 10.1 问题描述

当前 `cordis.patch.yml` 使用 `insert` 将 dsh-lab 插入 Host 组合，导致**所有预设**都能加载 dsh-lab（包括 Standard、Minimal 等内置预设）。

```yaml
# cordis.patch.yml（当前写法）
- insert:
    - id: dsh-lab
      name: 'dsh-lab'
```

**效果：** 用户选 Standard 预设也能用 `/lab` 命令——这可能不是期望的行为。

### 10.2 可选方案

| 方案 | 做法 | 效果 |
|---|---|---|
| **A. 保持现状** | `insert` 到 Host 组合 | 所有预设都能用 `/lab`，插件全局可用 |
| **B. 预设隔离** | 只在 `presets/lab/agent.cordis.yml` 里引用 dsh-lab | 只有 Lab 预设加载 dsh-lab |
| **C. 混合模式** | Host 组合插入但插件内部检查预设来源 | 复杂，不推荐 |

### 10.3 方案 B 的具体做法

1. **删掉或注释 `cordis.patch.yml` 里的 `insert` 块**
2. **确保 `presets/lab/agent.cordis.yml` 引用 dsh-lab：**
   ```yaml
   - id: dsh-lab
     name: dsh-lab
   ```
3. **开发调试时手动指定 patch：**
   ```sh
   pnpm dsh web --patch ./cordis.patch.yml
   ```

### 10.4 方案 B 的注意事项

| 问题 | 说明 |
|---|---|
| 鸡生蛋问题 | 预设文件需要不依赖 `apply()` 就能出现 → 需要安装脚本或手动复制 |
| 预设同步 | `apply()` 里的 `syncPresetTrees()` 只在 Lab 预设加载时运行 |
| 用户体验 | 用户需要知道选 Lab 预设才能用仪器控制 |

### 10.5 决策建议

| 场景 | 推荐方案 |
|---|---|
| 希望插件全局可用（装完就能用） | 方案 A（保持现状） |
| 希望插件只在特定环境启用 | 方案 B（预设隔离） |
| 不确定 | 先方案 A，后续按需切换到方案 B |

## 11. 已知边界与踩坑

| 问题 | 解决方案 |
|---|---|
| Projection 必须提供 `wire` 块 | 添加 `wire: { viewSchema, view }` |
| `command/done` 事件无 `name` 字段 | `apply` 不能按命令名过滤，响应所有事件后读取 registry |
| `face.subscribe` 回调不传参数 | 回调内必须手动 `face.getSnapshot()` |
| `node_modules` 下不能暴露 `.ts` 入口 | 分发时入口必须是预编译的 `.js` |

## 12. 设计文档索引

| 文档 | 内容 | 受众 |
|---|---|---|
| `design/USAGE-DRIVEN-DESIGN.md` | 用户场景 → 实现映射、设备管理、优先级 | 开发者入手 |
| `design/IMPLEMENTATION.md` | 中间层架构大纲、实现推进 | 开发者 |
| `design/TOOLS.md` | 工具参数、返回值、调用示例 | 开发者/LLM |
| `design/HOST-DESIGN.md` | Python 引擎设计 | 开发者 |
| `design/SLASH-COMMANDS.md` | 斜杠命令实现 | 开发者 |
| `design/LAB-TOGGLE-CODE.md` | /lab 切换机制 | 开发者 |
| `client/AGENTS.md` | Client 端 Session Projection | 开发者 |
