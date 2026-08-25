# dsh-lab Host 半设计 v2 — Python 脚本执行机制

> 本文档描述 dsh-lab 插件 Host 半（Node.js 侧）如何调用 Python 脚本执行仪器控制操作。
> 覆盖 DSH 主机执行机制、Python 进程管理模式、通信协议设计。

---

## 1. DSH Host 侧执行机制总览

DSH 主机提供三层递进式外部进程执行能力：

```
┌──────────────────────────────────────────────────────────────┐
│  高层：ctx.shell (Shell 执行器接缝)                            │
│   ├─ resolve(request) → 填充默认值（workdir, timeout）         │
│   ├─ run(spec)     → 前台执行，返回 ShellRunResult             │
│   └─ start(spec)    → 后台执行，返回 ShellProcess              │
│        │                                                      │
│        ▼                                                      │
│  中层：ctx.get("bash") / ctx.get("pwsh") (直接 Shell 执行器)   │
│   ├─ LocalBashExecutor (POSIX)                                │
│   ├─ PwshLocalExecutor (Windows)                              │
│   └─ 相同的 resolve/run/start 接口                            │
│        │                                                      │
│        ▼                                                      │
│  低层：ctx.subprocess (子进程服务)                              │
│   ├─ spawnSubprocess(spec) → 原始进程句柄                      │
│   ├─ 进程组管理 + SIGTERM→SIGKILL 升级                        │
│   └─ 输出收集 + 溢出文件                                   │
│                                                              │
│  后台任务：ctx.jobs (长驻进程管理)                               │
│   ├─ start({kind, run, ...}) → 托管后台任务                    │
│   └─ 自动生命周期管理                                     │
└──────────────────────────────────────────────────────────────┘
```

### 1.1 Shell 执行器接缝 (ctx.shell)

```typescript
// 执行请求（调用方填写）
interface ShellExecRequest {
  command: string;           // 命令
  workdir?: string;          // 工作目录（默认 config.cwd）
  timeoutMs?: number;        // 超时（默认 config.timeoutMs，上限 config.maxTimeoutMs）
  signal?: AbortSignal;      // 取消信号
  stdin?: string;            // 写入 stdin 的内容
  env?: Record<string, string>;  // 额外环境变量
  dshEnv?: DshEnvironment;   // DSH 托管环境变量（DSH_*）
  sandboxPolicy?: SandboxExecutionPolicy;  // 沙箱策略
}

// 执行结果
interface ShellRunResult {
  exitCode: number | null;   // 退出码（null = 被信号终止）
  signal: NodeJS.Signals | null;  // 终止信号
  timedOut: boolean;         // 是否超时
  aborted: boolean;           // 是否被 AbortSignal 取消
  timeoutMs: number;          // 实际超时
  stdout: CollectedOutput;    // 标准输出
  stderr: CollectedOutput;    // 标准错误
  sandbox?: ShellSandboxInfo; // 沙箱信息
}
```

**关键特性**：
- **环境管理**：`ENV_OVERRIDES` 禁用颜色/分页器（`NO_COLOR=1, TERM=dumb, PAGER=cat`）
- **DSH 环境变量**：`dshEnv` 合并到子进程环境（`DSH_*` 前缀）
- **沙箱集成**：通过 `sandboxPolicy` 传递沙箱策略，支持升级授权
- **输出截断**：超限时溢出到临时文件（spill），返回溢出路径

### 1.2 System Prompt 上下文注入

DSH Agent Loop 每步调用 `systemPrompt.assemble()` 动态拼装 system prompt。插件通过 `ctx.systemPrompt.section()` 注册上下文片段：

```typescript
ctx.systemPrompt.section({
  name: "lab:instruments",
  order: 200,
  text: async () => {
    // 能走到这里，说明 lab 服务一定存在，无需检查 isEnabled()
    const result = await ctx.lab.scanInstruments()
    if (!result.devices.length) return ""
    return `## 当前连接的仪器\n${formatInventory(result.devices)}`
  }
});
```

**与 lab 的对比**：
- lab：在 `chat_llm`/`dev_llm` 节点里拼装 system prompt
- DSH：通过 `systemPrompt.section()` 注册，每步自动渲染

---

## 2. Python 脚本执行方案

### 2.1 方案选择：全部一次性执行

| 方案 | 描述 | 选择 |
|---|---|---|
| 长驻服务 (JSON-RPC) | 启动 Python 进程，通过 stdin/stdout 通信 | ❌ 当前不需要 |
| 一次性执行 | 每次工具调用启动 Python 子进程，执行完退出 | ✅ 采用 |

**理由**：
- 仪器控制操作是低频的（用户说"执行工作流"时才调用），不需要保持连接
- 每次操作后 Python 进程退出，资源不泄漏
- 实现简单：不需要 IPC、不需要进程管理、不需要重连机制
- 沙箱友好：进程退出后不残留状态

### 2.2 执行流程

```
DSH Agent 调用工具
  │
  ▼
ctx.shell.resolve({ command, timeoutMs, sandboxPolicy })
  → 填充 workdir, timeout 默认值
  → 解析沙箱策略
  │
  ▼
ctx.shell.run(spec)
  → spawn Python 子进程
  → 流式收集 stdout/stderr
  → 超时/信号 → kill 进程组
  → 返回 ShellRunResult
  │
  ▼
工具返回 result.stdout.text 给 DSH Agent
  │
  ▼
DSH Agent 看到结果 → 决定下一步
```

---

## 3. Python 执行引擎设计

### 3.1 一次性脚本入口 (dsh_lab/__main__.py)

```python
"""一次性脚本入口 — 被 Node.js 通过 python -m dsh_lab.<module> 调用"""
import sys
import json

def main():
    if len(sys.argv) < 2:
        print("Usage: python -m dsh_lab.<module> [JSON_ARGS]", file=sys.stderr)
        sys.exit(1)

    module = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

    # 路由到对应模块
    if module == "scan":
        from dsh_lab.inventory import scan_instruments
        result = scan_instruments()
    elif module == "read_doc":
        from dsh_lab.docs import read_document
        result = read_document(args["filename"], args.get("lines", ""), args.get("section", ""))
    elif module == "read_workflow":
        from dsh_lab.workflow import read_workflow
        result = read_workflow(args["name"])
    elif module == "create_workflow":
        from dsh_lab.workflow import create_workflow
        result = create_workflow(args["folder_name"], args.get("name", ""), args.get("description", ""))
    elif module == "update_workflow":
        from dsh_lab.workflow import update_workflow
        result = update_workflow(**args)
    elif module == "delete_workflow":
        from dsh_lab.workflow import delete_workflow
        result = delete_workflow(args["name"])
    elif module == "send_scpi":
        from dsh_lab.scpi import scpi_write
        result = scpi_write(args["address"], args["command"], args.get("delay", 0))
    elif module == "send_asg":
        from dsh_lab.asg import asg_call
        result = asg_call(args["func"], args.get("args", []), args.get("kwargs", {}), args.get("delay", 0))
    else:
        print(f"Unknown module: {module}", file=sys.stderr)
        sys.exit(1)

    print(json.dumps({"status": "ok", "result": result}, ensure_ascii=False))

if __name__ == "__main__":
    main()
```

### 3.2 SCPI 引擎 (dsh_lab/scpi.py)

```python
"""PyVISA SCPI 命令引擎"""
import time
import pyvisa

def scpi_write(address: str, command: str, delay: float = 0) -> dict:
    """发送 SCPI 命令（每次新建连接，执行完关闭）"""
    rm = pyvisa.ResourceManager("@py")
    dev = rm.open_resource(address)
    dev.timeout = 5000

    if command.endswith("?"):
        # 查询命令
        try:
            response = dev.query(command).strip()
            result = {"status": "ok", "response": response}
        except Exception as e:
            result = {"status": "error", "error": f"{type(e).__name__}: {e}"}
    else:
        # 写入命令
        dev.write(command)
        result = {"status": "ok"}

    if delay > 0:
        time.sleep(delay)

    dev.close()
    rm.close()
    return result
```

### 3.3 ASG 引擎 (dsh_lab/asg.py)

```python
"""asglib ASG SDK 引擎"""
import time
from asglib import ASG_Init, ASG_GetDevicesList, ASG_Release

# 缓存连接状态
_asg_initialized = False

def asg_call(func: str, args: list, kwargs: dict, delay: float = 0) -> dict:
    """发送 ASG SDK 调用"""
    global _asg_initialized

    if not _asg_initialized:
        ASG_Init()
        _asg_initialized = True

    func_obj = getattr(asglib, func, None)
    if func_obj is None:
        return {"status": "error", "error": f"函数不存在: {func}"}

    try:
        result = func_obj(*args, **kwargs)
        if delay > 0:
            time.sleep(delay)
        return {"status": "ok", "result": result}
    except Exception as e:
        return {"status": "error", "error": f"{type(e).__name__}: {e}"}
```

### 3.4 工作流文件 CRUD (dsh_lab/workflow.py)

```python
"""工作流文件操作"""
import re
import yaml
from pathlib import Path

WORKFLOW_DIR = Path(__file__).parent.parent / "workflows"

def list_workflows() -> list[dict]:
    """列出所有工作流"""
    workflows = []
    for item in sorted(WORKFLOW_DIR.iterdir()):
        if item.is_dir():
            md_file = item / f"{item.name}.md"
            if md_file.exists():
                content = md_file.read_text(encoding="utf-8")
                fm = parse_frontmatter(content)
                workflows.append({"name": item.name, **fm})
    return workflows

def read_workflow(name: str) -> str:
    """读取工作流文件内容"""
    safe = _safe_folder_name(name)
    md_path = WORKFLOW_DIR / safe / f"{safe}.md"
    if not md_path.exists():
        return f"错误：找不到工作流 {safe}"
    return md_path.read_text(encoding="utf-8")

def create_workflow(folder_name: str, name: str = "", description: str = "") -> str:
    """新建工作流"""
    safe = _safe_folder_name(folder_name)
    target_dir = WORKFLOW_DIR / safe
    if target_dir.exists():
        return f"错误：{safe} 已存在"
    target_dir.mkdir(parents=True, exist_ok=True)
    fm = {"name": name or safe, "description": description}
    yaml_block = yaml.dump(fm, allow_unicode=True, sort_keys=False).strip()
    md_path = target_dir / f"{safe}.md"
    md_path.write_text(f"---\n{yaml_block}\n---\n\n", encoding="utf-8")
    return f"已创建工作流：{safe}"

def update_workflow(name: str, **kwargs) -> str:
    """修改工作流"""
    safe = _safe_folder_name(name)
    md_path = WORKFLOW_DIR / safe / f"{safe}.md"
    if not md_path.exists():
        return f"错误：找不到工作流 {safe}"
    content = md_path.read_text(encoding="utf-8")
    yaml_text, body = _parse_frontmatter(content)
    if "frontmatter" in kwargs:
        fm = yaml.safe_load(yaml_text) if yaml_text else {}
        fm.update(kwargs["frontmatter"])
        yaml_text = yaml.dump(fm, allow_unicode=True, sort_keys=False).strip()
    if "section_title" in kwargs and "section_content" in kwargs:
        body = _replace_section(body, kwargs["section_title"], kwargs["section_content"])
    if "append" in kwargs:
        body = body.rstrip() + f"\n{kwargs['append']}\n"
    new_content = f"---\n{yaml_text}\n---\n\n{body}".strip() + "\n"
    md_path.write_text(new_content, encoding="utf-8")
    return f"已更新工作流：{safe}"

def delete_workflow(name: str) -> str:
    """删除工作流"""
    import shutil
    safe = _safe_folder_name(name)
    target_dir = WORKFLOW_DIR / safe
    if not target_dir.exists():
        return f"错误：找不到工作流 {safe}"
    shutil.rmtree(target_dir)
    return f"已删除工作流：{safe}"

def _safe_folder_name(name: str) -> str:
    return re.sub(r"[^\w\-一-鿿]", "_", name.strip())

def _parse_frontmatter(content: str) -> tuple[str, str]:
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if m:
        return m.group(1), content[m.end():]
    return "", content

def _replace_section(body: str, section_title: str, new_content: str) -> str:
    pattern = re.compile(
        r"(^" + re.escape(section_title.strip()) + r"\n)(.*?)(?=\n## |\Z)",
        re.MULTILINE | re.DOTALL,
    )
    if pattern.search(body):
        return pattern.sub(rf"\g<1>{new_content}\n", body)
    return body.rstrip() + f"\n\n{section_title.strip()}\n{new_content}\n"
```

### 3.5 设备库存管理 (dsh_lab/inventory.py)

```python
"""设备库存管理"""
import json
import time
import pyvisa
from pathlib import Path
from asglib import ASG_Init, ASG_GetDevicesList, ASG_Release

INVENTORY_PATH = Path(__file__).parent.parent / "devices" / "devices_inventory.json"

def scan_instruments() -> str:
    """扫描 VISA + ASG 设备"""
    rm = pyvisa.ResourceManager("@py")
    resources = rm.list_resources()

    # 去重：相同前缀取最短的地址
    seen_prefix = {}
    for addr in resources:
        prefix = "::".join(addr.split("::")[:4])
        if prefix not in seen_prefix or len(addr) < len(seen_prefix[prefix]):
            seen_prefix[prefix] = addr

    # 读取旧库存
    old_inventory = {}
    try:
        old_inventory = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    except Exception:
        pass

    online_devices = []
    idn_map = {}

    # VISA 设备
    for addr in sorted(seen_prefix.values()):
        try:
            dev = rm.open_resource(addr)
            idn = dev.query("*IDN?").strip()
        except Exception:
            continue
        parts = [p.strip() for p in idn.split(",")]
        model = parts[1] if len(parts) >= 2 else ""
        serial = parts[2] if len(parts) >= 3 else ""
        if not serial:
            continue
        online_devices.append({
            "model": model, "serial": serial, "address": addr,
            "name": old_inventory.get(serial, {}).get("name", ""),
        })
        idn_map[addr] = idn

    # ASG 设备
    try:
        asg_init = ASG_Init()
        ok = (isinstance(asg_init, dict) and asg_init.get("result") == 1) or asg_init == 1
        if ok:
            time.sleep(3)
            asg_dev = ASG_GetDevicesList(10)
            if asg_dev.get("result") == 1 and asg_dev.get("count", 0) > 0:
                for item in asg_dev["value"]:
                    dev_name = item.get("asgDev_name", "") or "ASG24100"
                    dev_id = f"{dev_name}{item['asgDev_id']}"
                    online_devices.append({
                        "model": dev_name, "serial": dev_id,
                        "local_ip": item.get("asgDev_localIP", ""),
                        "local_mac": item.get("asgDev_localMAC", ""),
                        "name": old_inventory.get(dev_id, {}).get("name", ""),
                    })
            ASG_Release()
    except Exception:
        pass

    # 更新库存
    new_inventory = {}
    for d in online_devices:
        new_inventory[d["serial"]] = {
            "model": d["model"],
            "address": d.get("address", ""),
            "local_ip": d.get("local_ip", ""),
            "local_mac": d.get("local_mac", ""),
            "idn": idn_map.get(d.get("address", ""), ""),
            "name": d["name"],
        }
    # 保留离线设备
    for serial, info in old_inventory.items():
        if serial not in new_inventory:
            new_inventory[serial] = {**info, "address": "", "local_ip": "", "local_mac": "", "idn": ""}

    INVENTORY_PATH.parent.mkdir(exist_ok=True)
    INVENTORY_PATH.write_text(json.dumps(new_inventory, ensure_ascii=False, indent=2), encoding="utf-8")

    if not online_devices:
        return "当前没有检测到任何已连接的仪器设备。"
    lines = [f"当前共 {len(online_devices)} 个设备在线："]
    for i, d in enumerate(online_devices, 1):
        label = d["name"] if d["name"] else d["model"]
        lines.append(f"  {i}. {label}")
    return "\n".join(lines)
```

### 3.6 文档读取 (dsh_lab/docs.py)

```python
"""仪器文档读取"""
from pathlib import Path

DOCS_DIR = Path(__file__).parent.parent / "Documents"

def read_document(filename: str, lines: str = "", section: str = "") -> str:
    """按行区间或章节读取仪器文档"""
    path = DOCS_DIR / filename.strip()
    if not path.is_file():
        return f"错误：文件不存在：{filename}"

    all_lines = path.read_text(encoding="utf-8").splitlines()

    if lines:
        # 按行区间读取
        try:
            s, e = lines.split("-")
            s, e = int(s), int(e)
        except ValueError:
            return "错误：行区间格式错误，应为 23-36"
        s = max(1, s)
        e = min(len(all_lines), e)
        return f"[{filename}:{s}-{e}]\n" + "\n".join(all_lines[s - 1 : e])

    if section:
        # 按章节名读取
        for i, line in enumerate(all_lines):
            if section.lower() in line.lower():
                # 找到章节头，读到下一个 ## 或文件结束
                end = i + 1
                while end < len(all_lines) and not all_lines[end].startswith("## "):
                    end += 1
                return f"[{filename}:{section}]\n" + "\n".join(all_lines[i:end])

    # 无参数返回索引
    return f"[{filename}]\n" + "\n".join(all_lines[:20]) + "\n...(使用 lines 或 section 参数读取具体内容)"
```

---

## 4. 工具注册完整代码（Consumer 角色）

> **v3 修正**：工具是 Consumer，只依赖 `LabService` 接口（`ctx.lab.*`），不再直接调用 Python 子进程。Python 执行下沉到 Service Provider（`src/lab-agent-local.ts`）。

### 4.1 src/tools.ts — Consumer：工具注册

```typescript
// src/tools.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-lab-tools'
export const inject = ['tools', 'lab']   // 声明依赖：工具运行时 + lab 服务

export function apply(ctx: Context) {
  const lab = ctx.lab   // 拿到服务（inject 保证已就绪）

  // ── 仪器发现 ──
  ctx.tools.register(defineTool({
    name: 'scan_instruments',
    description: '扫描 VISA + ASG 仪器设备，更新设备库存',
    parameters: {},
    async execute() {
      return (await lab.scanInstruments()).text
    }
  }))

  // ── 文档操作 ──
  ctx.tools.register(defineTool({
    name: 'read_document',
    description: '按行区间或章节读取仪器文档。LLM 通过阅读文档理解 SCPI/ASG 命令。',
    parameters: {
      filename: { type: 'string', required: true },
      lines: { type: 'string', description: '行区间，如 23-36' },
      section: { type: 'string', description: '章节名' }
    },
    async execute(args) {
      return await lab.readDocument(args)
    }
  }))

  // ── 工作流管理 ──
  ctx.tools.register(defineTool({
    name: 'read_workflow',
    description: '读取工作流文件内容。LLM 阅读工作流步骤后，自行决定如何执行（调用 send_scpi/send_asg）。',
    parameters: { name: { type: 'string', required: true } },
    async execute(args) {
      return await lab.readWorkflow(args)
    }
  }))

  ctx.tools.register(defineTool({
    name: 'create_workflow',
    description: '新建工作流文件',
    parameters: {
      folder_name: { type: 'string', required: true },
      name: { type: 'string' },
      description: { type: 'string' }
    },
    async execute(args) {
      return await lab.createWorkflow(args)
    }
  }))

  ctx.tools.register(defineTool({
    name: 'update_workflow',
    description: '修改工作流文件',
    parameters: {
      name: { type: 'string', required: true },
      frontmatter: { type: 'object' },
      section_title: { type: 'string' },
      section_content: { type: 'string' },
      append: { type: 'string' }
    },
    async execute(args) {
      return await lab.updateWorkflow(args)
    }
  }))

  ctx.tools.register(defineTool({
    name: 'delete_workflow',
    description: '删除工作流文件',
    parameters: { name: { type: 'string', required: true } },
    async execute(args) {
      return await lab.deleteWorkflow(args)
    }
  }))

  // ── 仪器控制 ──
  ctx.tools.register(defineTool({
    name: 'send_scpi',
    description: '向仪器发送单条 SCPI 命令。用于执行工作流中的单个步骤。',
    parameters: {
      address: { type: 'string', required: true },
      command: { type: 'string', required: true },
      delay: { type: 'number', description: '执行后延迟（秒），默认 0' }
    },
    async execute(args) {
      return (await lab.sendScpi(args)).text
    }
  }))

  ctx.tools.register(defineTool({
    name: 'send_asg',
    description: '向 ASG 设备发送单条 SDK 调用。用于执行工作流中的单个步骤。',
    parameters: {
      func: { type: 'string', required: true },
      args: { type: 'array' },
      kwargs: { type: 'object' },
      delay: { type: 'number', description: '执行后延迟（秒），默认 0' }
    },
    async execute(args) {
      return (await lab.sendAsg(args)).text
    }
  }))
}
```

**要点**：
- `inject` 声明 `lab` 后，`ctx.lab` 在 `apply` 时已就绪（服务未就绪则插件等待）
- 工具**不知道** Python 模块名、子进程参数、VISA 连接细节——那是 Provider 的事
- 替换 Provider（如远程仪器控制）时，`src/tools.ts` 一行不用改

### 4.2 src/index.ts — 装配入口

```typescript
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

> 每个消费者文件自带 `inject` 声明：`commands.ts` 依赖 `['commands']`，`verify.ts` 依赖 `['lab']`，`projection.ts` 依赖 `['sessionProjections']`。Cordis 保证依赖就绪后才执行对应 `apply`。

---

## 5. System Prompt 上下文注入（Consumer 角色）

> **v3 修正**：上下文是 Consumer，通过 `ctx.lab` 服务接口访问。消费者声明 `inject = ['systemPrompt', 'lab']`，lab 服务注册后自动激活，无需 `isEnabled()` 检查。

### 5.1 src/context.ts — Consumer：System Prompt section

```typescript
// src/context.ts — Consumer 角色
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-lab-context'
export const inject = ['systemPrompt', 'lab']   // lab 不存在 → 此文件不执行

export function apply(ctx: Context) {
  // 仪器状态（每步刷新，lab 服务注册后自动生效）
  ctx.systemPrompt.section({
    name: 'lab:instruments',
    order: 200,
    text: async () => {
      // 能走到这里，说明 lab 服务一定存在，无需检查 isEnabled()
      const result = await ctx.lab.scanInstruments()
      if (!result.devices.length) return ''
      return `## 当前连接的仪器\n${formatInventory(result.devices)}`
    },
  })

  // 文档索引（固定内容，lab 服务注册后自动生效）
  ctx.systemPrompt.section({
    name: 'lab:documents',
    order: 201,
    text: () => {
      return [
        '## 可用仪器文档',
        '- DG.md（DG800/DG900 SCPI 命令参考）',
        '- DHO.md（DHO800/DHO900 SCPI 命令参考）',
        '- ASG24100.md（ASG24100 SDK 接口参考）',
        '使用 read_document 查阅',
      ].join('\n')
    },
  })

  // 工作流索引（每步刷新，lab 服务注册后自动生效）
  ctx.systemPrompt.section({
    name: 'lab:workflows',
    order: 202,
    text: async () => {
      const workflows = await ctx.lab.listWorkflows()
      if (!workflows.length) return ''
      const lines = workflows.map((w) =>
        `  - ${w.name}（${w.description || '无描述'}）`
      ).join('\n')
      return `## 可用工作流\n${lines}\n使用 read_workflow 阅读，然后逐步执行`
    },
  })
}

function formatInventory(devices: Array<{ name: string; model: string; serial: string }>): string {
  return devices.map((d, i) =>
    `  ${i + 1}. ${d.name || d.model} (${d.serial})`
  ).join('\n')
}
```

**要点**：
- 消费者声明 `inject = ['systemPrompt', 'lab']`，lab 服务注册后 Cordis 自动执行 `apply()`
- 不需要任何 `isEnabled()` 检查，服务存在就能执行
- 数据读取通过 `ctx.lab.*` 服务接口，不直接调 Python
- `lab:instruments` 和 `lab:workflows` 使用 `async` 回调（需要 await 服务方法）
- `lab:documents` 是固定内容，使用同步回调即可

---

## 6. 数据流

> **v3 修正**：Consumer（工具）调用 `ctx.lab.*` 服务方法，不直接操作 shell。shell 执行在 Provider 内部。

### 6.1 插件开关（/lab）— 动态服务注册/注销

```
用户输入 /lab
  │
  ▼
Host: /lab handler 检查 ctx.registry.has(LabLocal)
  │
  ├─ 未注册 → ctx.plugin(LabLocal)
  │           → LabLocal 构造函数调用 ctx.reflect.provide('lab', self)
  │           → 服务注册到 store → notify(['lab'])
  │           → tools/context 消费者的 fiber._refresh()
  │           → 依赖满足 → 自动执行 apply()
  │           → 工具注册成功、System Prompt section 注册成功
  │           → 返回 "实验模式已启用"
  │
  └─ 已注册 → ctx.registry.delete(LabLocal)
              → dispose LabLocal 的 fiber
              → fiber.effect cleanup → delete store['lab'] → notify(['lab'])
              → tools/context 消费者的 fiber._refresh()
              → 依赖断开 → 自动 dispose()
              → 工具注销、System Prompt section 注销
              → 返回 "实验模式已关闭"
```

### 6.2 执行工作流（LLM 驱动）

```
用户: "帮我执行 DG 双通道直流输出工作流"

DSH Agent turn 1:
  systemPrompt 显示工作流索引 → 知道有 dg_dc_output
  → read_workflow(name="dg_dc_output")
  → ctx.lab.readWorkflow() → Provider 读文件 → 返回文件内容

DSH Agent turn 2:
  LLM 阅读工作流内容，理解步骤
  → send_scpi(address="", command=":SOUR1:APPL:DC 100,5,2,0")
  → ctx.lab.sendScpi() → Provider 调 PyVISA → 返回成功

DSH Agent turn 3:
  LLM 看到步骤 1 完成，继续步骤 2
  → send_scpi(address="", command=":SOUR2:APPL:DC 100,5,2,0")
  → ctx.lab.sendScpi() → Provider 调 PyVISA → 返回成功

DSH Agent turn 4:
  LLM 确认所有步骤完成
  → 无 tool-call → turn 结束
  → 回复用户
```

### 6.3 文档驱动操作（含 LLM 推理）

```
用户: "调整示波器时基使屏幕显示 2 个完整周期"

DSH Agent turn 1:
  systemPrompt 显示文档索引
  → read_document(filename="DHO.md", lines="100-150")
  → ctx.lab.readDocument() → Provider 读文件 → 返回波形读取命令

DSH Agent turn 2:
  LLM 理解命令，组装 SCPI 序列
  → send_scpi(address="", command=":WAVeform:SOURce CHANnel1")
  → send_scpi(address="", command=":WAVeform:MODE NORMal")
  → send_scpi(address="", command=":WAVeform:FORMat ASCii")
  → send_scpi(address="", command=":WAVeform:DATA?")
  → ctx.lab.sendScpi() × 4 → 返回波形数据

DSH Agent turn 3:
  LLM 分析波形数据，计算周期和时基值
  → send_scpi(address="", command=":TIMebase:MAIN:SCALe <计算值>")
  → ctx.lab.sendScpi() → 返回执行结果

DSH Agent turn 4:
  LLM 确认完成
  → 无 tool-call → turn 结束
```

---

## 7. 生命周期管理

> **v3 修正**：插件启动时只注册 `/lab` 元命令。`/lab` 触发服务注册/注销，消费者由 Cordis 自动管理。

```
插件加载 (apply)
  │
  └── ctx.plugin(meta)   ← 只注册 /lab 元命令

用户输入 /lab（开启）
  │
  ├── ctx.plugin(LabLocal)           ← 注册 Service Provider
  │   → LabLocal 构造函数
  │   → ctx.reflect.provide('lab', self)  ← 服务注册到 store
  │   → notify(['lab'])
  │   → 所有 inject 包含 'lab' 的消费者 fiber._refresh()
  │   → 依赖满足 → 自动执行 apply()
  │   ├── ctx.plugin(tools)   ← 工具注册
  │   ├── ctx.plugin(context) ← System Prompt section 注册
  │   └── ctx.plugin(commands)← 斜杠命令注册
  │
  └── 返回 "实验模式已启用"

工具调用时（Consumer 视角）
  │
  ├── 工具调用 ctx.lab.* 服务方法
  │   └── Provider 内部：
  │       ├── ctx.shell.resolve()  ← 填充默认值
  │       ├── ctx.shell.run()      ← 启动 Python 子进程
  │       │   ├── Python 执行 → stdout/stderr 收集
  │       │   ├── 超时/信号 → kill 进程组
  │       │   └── 进程退出 → 返回 ShellRunResult
  │       └── 解析结果 → 返回给 Consumer
  │
  └── 工具返回结果给 DSH Agent

用户输入 /lab（关闭）
  │
  ├── ctx.registry.delete(LabLocal)  ← 注销 Service Provider
  │   → dispose LabLocal 的 fiber
  │   → fiber.effect cleanup → delete store['lab']
  │   → notify(['lab'])
  │   → 所有 inject 包含 'lab' 的消费者 fiber._refresh()
  │   → 依赖断开 → 自动 dispose()
  │   ├── 工具注销
  │   ├── System Prompt section 注销
  │   └── 斜杠命令注销
  │
  └── 返回 "实验模式已关闭"

插件卸载 (dispose)
  │
  └── 无长驻进程需要清理
```

---

## 8. 沙箱注意事项

| 操作 | 沙箱影响 | 处理 |
|---|---|---|
| Python 脚本执行 | 读操作通常允许 | 无 |
| 文件读写（工作流/文档） | 写操作需 `workspace-write` | DSH Agent 自动提示授权 |
| 网络访问（VISA/ASG） | 通常不受限 | 无 |
| DLL 加载（asglib） | 不受限 | 无 |

---

## 9. 已知边界

- **仪器连接**：每次工具调用新建/关闭 VISA 连接。高频场景需改为长驻进程
- **ASG SDK**：asglib 依赖厂商 DLL，需 Windows + 驱动安装
- **LLM 推理质量**：工作流执行质量依赖 LLM 对文档的理解和命令组装能力
- **输出截断**：超长输出自动截尾并溢出到临时文件
