# dsh-lab Host 端开发指南

> `src/` 目录下的 TypeScript 源码开发指南。

---

## 1. 文件结构

```
src/
├── index.ts                 # 插件入口：加载所有 Consumer
├── service.ts               # Service Definition：LabService 抽象类 + 类型定义
├── lab-local.ts             # Service Provider：LabLocal 实现（同步文件读取）
├── commands.ts              # Consumer（元命令）：/lab 命令
├── context.ts               # Consumer（上下文）：System Prompt section 注入
├── projection.ts            # Consumer（投影）：Session Projection 状态推送
├── projection-types.ts      # Projection schema（LabState + LabStateSchema）
└── context-augment.d.ts     # Context 声明合并（systemPrompt、lab 等类型）
```

---

## 2. 文件角色详解

### 2.1 Service Definition（`service.ts`）

定义 `LabService` 抽象类，是所有 Consumer 依赖的接口。

```ts
export abstract class LabService extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'lab')
  }

  // 所有方法均为同步（DSH system prompt 要求）
  abstract readMarkdown(filename: string): string
  abstract readInventory(): DevicesInventory
  abstract listDocuments(): DocumentMeta[]
  abstract listWorkflows(): WorkflowMeta[]
}
```

**类型定义**（同文件导出）：
- `DeviceInfo` — 设备信息接口
- `DevicesInventory` — 设备清单（Record<serial, DeviceInfo>）
- `DocumentMeta` — 文档元数据（filename, name, description, index）
- `WorkflowMeta` — 工作流元数据（name, description）

### 2.2 Service Provider（`lab-local.ts`）

实现 `LabLocal`，是唯一知道文件系统细节的模块。

```ts
export class LabLocal extends LabService {
  readMarkdown(filename: string): string {
    return readFileSync(join(CONTENT_DIR, filename), 'utf-8')
  }

  readInventory(): DevicesInventory {
    try {
      return JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8'))
    } catch {
      return {}
    }
  }

  listDocuments(): DocumentMeta[] {
    // 遍历 docs/ 目录，解析 YAML frontmatter
  }

  listWorkflows(): WorkflowMeta[] {
    // 遍历 workflows/ 目录，解析 YAML frontmatter
  }
}
```

**关键点**：
- 所有方法**同步**返回（DSH API 要求）
- 使用 `import.meta.url` 定位项目根目录，不依赖 `process.cwd()`
- 设备清单 JSON 以序列号为 key
- frontmatter 解析支持 `name`、`description`、`index` 字段
- 目录不存在时安全返回空数组

### 2.3 Consumer — 元命令（`commands.ts`）

注册 `/lab` 命令，控制服务生命周期。

```ts
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.commands.register({
    name: 'lab',
    description: '切换实验模式（启用/关闭仪器控制插件）',
    handler: async () => {
      if (!ctx.root.registry.has(LabLocal)) {
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

### 2.4 Consumer — 上下文注入（`context.ts`）

注册 4 个 system prompt section，`text` 回调同步返回字符串。

```ts
export const inject = ['systemPrompt', 'lab']

export function apply(ctx: Context) {
  ctx.systemPrompt.section({
    name: 'lab:role',
    order: 100,
    text: () => ctx.lab.readMarkdown('role.md'),
  })

  ctx.systemPrompt.section({
    name: 'lab:instruments',
    order: 200,
    text: () => {
      const inventory = ctx.lab.readInventory()
      // 格式化...
    },
  })
}
```

**Section 清单**：

| Section | order | 内容 | 数据来源 |
|---|---|---|---|
| `lab:role` | 100 | 角色定位 + 工作流程 + 注意事项 | `content/role.md` |
| `lab:instruments` | 200 | 当前连接的仪器列表 | `devices/devices_inventory.json` |
| `lab:documents` | 201 | 可用仪器文档索引 | `docs/*.md` frontmatter |
| `lab:workflows` | 202 | 可用工作流列表 | `workflows/*/*.md` frontmatter |

### 2.5 Consumer — 投影（`projection.ts`）

追踪 lab 服务状态，推送给 Client。

```ts
export const inject = ['sessionProjections']

export function apply(ctx: Context) {
  ctx.sessionProjections.register({
    key: 'dsh-lab:state',
    schema: LabStateSchema,
    init: (): LabState => ({
      active: ctx.root.registry.has(LabLocal),
    }),
    apply: (state, event) => {
      if (event.type === 'command/done') {
        return { active: ctx.root.registry.has(LabLocal) }
      }
      return state ?? { active: ctx.root.registry.has(LabLocal) }
    },
    wire: { viewSchema: LabStateSchema, view: (state) => state },
    stateVersion: 1,
  })
}
```

---

## 3. 开发约定

- 注释和文档使用**简体中文**
- 控制台日志使用 `[dsh-lab:模块名]` 前缀
- 源码内部导入使用 `.js` 后缀（NodeNext ESM）
- 每个插件文件导出 `name`、`inject`、`apply`
- **lab 方法必须同步返回**（DSH system prompt API 要求）

---

## 4. 依赖注入模式

### 4.1 inject 声明

```ts
export const inject = ['systemPrompt', 'lab']

export function apply(ctx: Context) {
  const lab = ctx.lab
}
```

### 4.2 服务访问方式

| 方式 | 代码 | 场景 |
|---|---|---|
| inject 声明 | `export const inject = ['lab']` | 标准用法，自动管理 |
| ctx.get | `const lab = ctx.get('lab')` | 手动检查 |
| registry 检查 | `ctx.root.registry.has(LabLocal)` | 底层判断 |

---

## 5. 路径解析

使用 `import.meta.url` 定位项目根目录：

```ts
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url))
const CONTENT_DIR = join(PROJECT_ROOT, 'content')
const DOCS_DIR = join(PROJECT_ROOT, 'docs')
```

| 环境 | 解析结果 |
|---|---|
| 开发模式 | `D:\Dsh\dsh-lab\` |
| 安装后 | `C:\Users\...\node_modules\dsh-lab\` |

---

## 6. 调试日志

打开浏览器控制台，过滤 `[dsh-lab]` 查看完整链路：

```
[dsh-lab:cmd] ✓ 实验模式已启用（上下文注入已激活）
[dsh-lab:context] ✓ 上下文注入已激活（lab 服务已注册）
[dsh-lab:projection] state changed: false -> true
[dsh-lab:context] lab:role 已注入 617 字符
[dsh-lab:context] lab:instruments 已注入 2 个设备
[dsh-lab:context] lab:documents 已注入 3 个文档
[dsh-lab:context] lab:workflows 已注入 1 个工作流
```

---

## 7. 已知边界与踩坑

| 问题 | 解决方案 |
|---|---|
| `text.indexOf is not a function` | lab 方法必须同步返回字符串，不能 async |
| `ENOENT: docs/` | 目录不存在时返回空数组，不报错 |
| `ENOENT: content/role.md` | 使用 `import.meta.url` 定位，不用 `process.cwd()` |
| Projection 必须提供 `wire` 块 | 添加 `wire: { viewSchema, view }` |
| `command/done` 事件无 `name` 字段 | 响应所有事件后读取 registry |
| `face.subscribe` 回调不传参数 | 回调内必须手动 `face.getSnapshot()` |
| `node_modules` 下不能暴露 `.ts` 入口 | 分发时入口必须是预编译的 `.js` |
| 顶栏隐藏用 `display:none` | 不能用 `grid-template-rows:0`（会压缩聊天窗口） |
| `inject` 声明即检查 | 不需要手动 `isEnabled()` 判断 |

---

## 8. 新增 Consumer 指南

1. 创建文件 `src/xxx.ts`
2. 导出 `name`、`inject`、`apply`
3. `inject` 声明依赖（如 `['systemPrompt', 'lab']`）
4. 在 `src/index.ts` 中 `ctx.plugin(xxx)` 加载

---

## 9. 预设同步功能（已移除，保留参考）

> **当前状态：已移除，未来如需实现可参考以下设计。**

### 9.1 功能说明

插件安装时自动将包内 `presets/lab/` 目录同步到 `~/.dsh/.agent-presets/lab/`。

### 9.2 实现步骤

1. `presets/lab/preset.yml` + `agent.cordis.yml`
2. `src/sync.ts` — `syncPresetTrees()`
3. `src/dsh-home.ts` — `dshHome()`
4. `src/mount-once.ts` — `mountOnce()`
5. `index.ts` — `syncPresets()`
6. `package.json` — `files: ["presets"]`