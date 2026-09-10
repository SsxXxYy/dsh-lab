// lib/lab-local.ts — Service Provider 角色
import type { Context } from '@deepseek-ai/cordis'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  LabService,
  type DevicesInventory,
  type DocumentMeta,
  type WorkflowMeta,
  type ScanInstrumentsResult,
  type ReadDocumentRequest,
  type ReadWorkflowRequest,
  type CreateWorkflowRequest,
  type UpdateWorkflowRequest,
  type DeleteWorkflowRequest,
  type SendScpiRequest,
  type SendScpiResult,
  type SendAsgRequest,
  type SendAsgResult,
  type RenameDeviceRequest,
  type RenameDeviceResult,
} from './service.js'

// 使用 import.meta.url 定位项目根目录，避免 process.cwd() 不确定问题
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url))
const CONTENT_DIR = join(PROJECT_ROOT, 'content')
const INVENTORY_PATH = join(PROJECT_ROOT, 'devices', 'devices_inventory.json')
const DOCS_DIR = join(PROJECT_ROOT, 'docs')
const WORKFLOW_DIR = join(PROJECT_ROOT, 'workflows')

export class LabLocal extends LabService {
  // ═══════════════════════════════════════════════════════════════
  // 上下文相关方法（已实现，同步）
  // ═══════════════════════════════════════════════════════════════

  readMarkdown(filename: string): string {
    const filePath = join(CONTENT_DIR, filename)
    try {
      return readFileSync(filePath, 'utf-8')
    } catch {
      return ''
    }
  }

  readInventory(): DevicesInventory {
    try {
      const text = readFileSync(INVENTORY_PATH, 'utf-8')
      return JSON.parse(text) as DevicesInventory
    } catch {
      return {}
    }
  }

  listDocuments(): DocumentMeta[] {
    let entries: string[]
    try {
      entries = readdirSync(DOCS_DIR)
    } catch {
      return []
    }
    const mdFiles = entries.filter((name) => name.endsWith('.md'))

    return mdFiles.map((filename) => {
      const filePath = join(DOCS_DIR, filename)
      try {
        const content = readFileSync(filePath, 'utf-8')
        const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
        return {
          filename,
          raw_frontmatter: match?.[1]?.trim() || '',
        }
      } catch {
        return { filename, raw_frontmatter: '' }
      }
    })
  }

  listWorkflows(): WorkflowMeta[] {
    let entries: string[]
    try {
      entries = readdirSync(WORKFLOW_DIR)
    } catch {
      return []
    }
    const dirs = entries.filter((name) => {
      try {
        return statSync(join(WORKFLOW_DIR, name)).isDirectory()
      } catch {
        return false
      }
    })

    return dirs.map((dir) => {
      const mdPath = join(WORKFLOW_DIR, dir, `${dir}.md`)
      try {
        const content = readFileSync(mdPath, 'utf-8')
        const match = content.match(/^---\n([\s\S]*?)\n---/)
        if (!match) return { name: dir, description: '' }
        const frontmatter = this.parseWorkflowFrontmatter(match[1])
        return {
          name: frontmatter.name || dir,
          description: frontmatter.description || '',
        }
      } catch {
        return { name: dir, description: '' }
      }
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // 工具相关方法 — 文件操作（TypeScript 直接处理）
  // ═══════════════════════════════════════════════════════════════

  async readDocument(request: ReadDocumentRequest): Promise<string> {
    const filePath = join(DOCS_DIR, request.filename)
    if (!existsSync(filePath)) {
      return `错误：文件不存在：${request.filename}`
    }

    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // 按章节名查找
    if (request.section) {
      const sectionHeader = `### ${request.section}`
      let startLine = -1
      let endLine = lines.length
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(sectionHeader)) {
          startLine = i
        } else if (startLine !== -1 && lines[i].startsWith('### ')) {
          endLine = i
          break
        }
      }
      if (startLine === -1) {
        return `错误：找不到章节：${request.section}`
      }
      const sectionLines = lines.slice(startLine, endLine)
      return `[${request.filename}:${startLine + 1}-${endLine}]\n\n${sectionLines.join('\n')}`
    }

    // 按行区间
    if (request.lines) {
      const match = request.lines.match(/^(\d+)-(\d+)$/)
      if (!match) {
        return `错误：行区间格式错误，应为 23-36`
      }
      const start = Math.max(1, parseInt(match[1])) - 1
      const end = Math.min(lines.length, parseInt(match[2]))
      if (start >= end || start >= lines.length) {
        return `错误：行区间越界`
      }
      const slice = lines.slice(start, end)
      return `[${request.filename}:${start + 1}-${end}]\n\n${slice.join('\n')}`
    }

    // 无参数：返回全文
    return `[${request.filename}:全文 ${lines.length} 行]\n\n${content}`
  }

  async readWorkflow(request: ReadWorkflowRequest): Promise<string> {
    const mdPath = join(WORKFLOW_DIR, request.name, `${request.name}.md`)
    if (!existsSync(mdPath)) {
      return `错误：找不到工作流：${request.name}`
    }
    return readFileSync(mdPath, 'utf-8')
  }

  async createWorkflow(request: CreateWorkflowRequest): Promise<string> {
    // 校验文件夹名
    if (!/^[\w\-\u4e00-\u9fff]+$/.test(request.folder_name)) {
      return `错误：文件夹名无效（只允许字母数字、下划线、连字符、中文）`
    }

    const folderPath = join(WORKFLOW_DIR, request.folder_name)
    if (existsSync(folderPath)) {
      return `错误：${request.folder_name} 已存在`
    }

    mkdirSync(folderPath, { recursive: true })

    const name = request.name || request.folder_name
    const description = request.description || ''
    const mdContent = `---\nname: ${name}\ndescription: ${description}\n---\n`
    writeFileSync(join(folderPath, `${request.folder_name}.md`), mdContent, 'utf-8')

    return `已创建工作流：${request.folder_name}\n路径：workflows/${request.folder_name}/${request.folder_name}.md`
  }

  async updateWorkflow(request: UpdateWorkflowRequest): Promise<string> {
    const mdPath = join(WORKFLOW_DIR, request.name, `${request.name}.md`)
    if (!existsSync(mdPath)) {
      return `错误：找不到工作流：${request.name}`
    }

    let content = readFileSync(mdPath, 'utf-8')

    // 更新 frontmatter
    if (request.frontmatter) {
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (fmMatch) {
        const fmLines = fmMatch[1].split('\n')
        const fm: Record<string, string> = {}
        for (const line of fmLines) {
          const m = line.match(/^(\w+):\s*(.*)$/)
          if (m) fm[m[1]] = m[2]
        }
        Object.assign(fm, request.frontmatter)
        const newFm = Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join('\n')
        content = content.replace(fmMatch[0], `---\n${newFm}\n---`)
      }
    }

    // 替换章节
    if (request.section_title && request.section_content !== undefined) {
      const lines = content.split('\n')
      let startIdx = -1
      let endIdx = lines.length
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`### ${request.section_title}`)) {
          startIdx = i
        } else if (startIdx !== -1 && i > startIdx && lines[i].startsWith('### ')) {
          endIdx = i
          break
        }
      }
      if (startIdx !== -1) {
        lines.splice(startIdx, endIdx - startIdx, `### ${request.section_title}`, request.section_content)
        content = lines.join('\n')
      }
    }

    // 追加内容
    if (request.append) {
      content += request.append
    }

    writeFileSync(mdPath, content, 'utf-8')
    return `已更新工作流：${request.name}`
  }

  async deleteWorkflow(request: DeleteWorkflowRequest): Promise<string> {
    const folderPath = join(WORKFLOW_DIR, request.name)
    if (!existsSync(folderPath)) {
      return `错误：找不到工作流：${request.name}`
    }
    rmSync(folderPath, { recursive: true, force: true })
    return `已删除工作流：${request.name}`
  }

  async renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult> {
    try {
      const text = readFileSync(INVENTORY_PATH, 'utf-8')
      const inventory = JSON.parse(text) as DevicesInventory
      if (!inventory[request.id]) {
        return { ok: false, text: `错误：找不到设备：${request.id}` }
      }
      inventory[request.id].name = request.name
      writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8')
      return { ok: true, text: `已将设备 ${request.id} 重命名为 ${request.name}` }
    } catch {
      return { ok: false, text: `错误：设备清单文件不存在或格式错误` }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 工具相关方法 — 硬件操作（调用 Python 子进程）
  // ═══════════════════════════════════════════════════════════════

  async scanInstruments(): Promise<ScanInstrumentsResult> {
    const shell = this.ctx.get('shell')
    if (!shell) {
      return { devices: [], text: '错误：shell 服务不可用' }
    }

    try {
      const result = await shell.run({
        command: 'python -m py scan',
        timeoutMs: 30000,
        sandboxPolicy: this._getSandboxPolicy(),
        workdir: PROJECT_ROOT,
      })

      if (result.exitCode !== 0) {
        return { devices: [], text: `扫描失败：${result.stderr.text || '未知错误'}` }
      }

      if (!result.stdout.text.trim()) {
        return { devices: [], text: '错误：Python 脚本无输出。请检查 python 是否在 PATH 中，以及 py 模块是否正确安装。' }
      }

      try {
        const parsed = JSON.parse(result.stdout.text)
        if (parsed.status === 'ok') {
          return parsed.result as ScanInstrumentsResult
        }
        return { devices: [], text: `扫描错误：${parsed.error}` }
      } catch {
        return { devices: [], text: `扫描结果解析失败：${result.stdout.text}` }
      }
    } catch (e: any) {
      return { devices: [], text: `扫描失败：${e.message}` }
    }
  }

  async sendScpi(request: SendScpiRequest): Promise<SendScpiResult> {
    const shell = this.ctx.get('shell')
    if (!shell) {
      return { ok: false, text: '错误：shell 服务不可用' }
    }

    if (request.commands.length === 0) {
      return { ok: false, text: '错误：命令列表为空' }
    }

    try {
      // 一次提交整批命令给 Python，循环在 Python 里处理
      const args = JSON.stringify({
        commands: request.commands,
        continueOnError: request.continueOnError ?? false,
      })

      const result = await shell.run({
        command: `python -m py scpi '${args}'`,
        timeoutMs: 30000 * request.commands.length,  // 每条命令最多 30s
        sandboxPolicy: this._getSandboxPolicy(),
        workdir: PROJECT_ROOT,
      })

      if (result.exitCode !== 0) {
        return { ok: false, text: `SCPI 执行失败：${result.stderr.text || '未知错误'}` }
      }

      if (!result.stdout.text.trim()) {
        return { ok: false, text: '错误：Python 脚本无输出。请检查 python 是否在 PATH 中，以及 py 模块是否正确安装。' }
      }

      try {
        const parsed = JSON.parse(result.stdout.text)
        if (parsed.status === 'ok') {
          // Python 返回批次结果，格式化为可读文本
          const lines = parsed.result.results.map((r: any) => {
            if (r.note) return r.note  // 中断提示
            if (r.response) return `[命令] -> ${r.response}`
            if (r.written) return `SCPI 写入成功`
            return `SCPI 结果: ${JSON.stringify(r)}`
          })
          return { ok: true, text: lines.join('\n') }
        }
        // 部分失败时，Python 仍返回 result.results
        if (parsed.result?.results) {
          const lines = parsed.result.results.map((r: any) => {
            if (r.note) return r.note
            if (r.error) return `错误: ${r.error}`
            return `SCPI 结果: ${JSON.stringify(r)}`
          })
          return { ok: false, text: lines.join('\n') }
        }
        return { ok: false, text: `错误：${parsed.error}` }
      } catch {
        return { ok: false, text: `SCPI 结果解析失败：${result.stdout.text}` }
      }
    } catch (e: any) {
      return { ok: false, text: `SCPI 执行失败：${e.message}` }
    }
  }

  async sendAsg(request: SendAsgRequest): Promise<SendAsgResult> {
    const shell = this.ctx.get('shell')
    if (!shell) {
      return { ok: false, text: '错误：shell 服务不可用' }
    }

    if (request.calls.length === 0) {
      return { ok: false, text: '错误：调用列表为空' }
    }

    try {
      // 一次提交整批调用给 Python，Init/Connect/Disconnect/Release 由 Python 硬编码
      const args = JSON.stringify({
        device_name: request.device_name,
        local_ip: request.local_ip,
        local_mac: request.local_mac,
        calls: request.calls,
        continueOnError: request.continueOnError ?? false,
      })

      const result = await shell.run({
        command: `python -m py asg '${args}'`,
        timeoutMs: 30000 + 30000 * request.calls.length,  // Init 30s + 每条调用最多 30s
        sandboxPolicy: this._getSandboxPolicy(),
        workdir: PROJECT_ROOT,
      })

      if (result.exitCode !== 0) {
        return { ok: false, text: `ASG 执行失败：${result.stderr.text || '未知错误'}` }
      }

      if (!result.stdout.text.trim()) {
        return { ok: false, text: '错误：Python 脚本无输出。请检查 python 是否在 PATH 中，以及 py 模块是否正确安装。' }
      }

      try {
        const parsed = JSON.parse(result.stdout.text)
        if (parsed.status === 'ok') {
          const lines = parsed.result.results.map((r: any) => {
            if (r.note) return r.note
            if (r.result !== undefined) return `ASG 调用成功: ${JSON.stringify(r.result)}`
            return `ASG 结果: ${JSON.stringify(r)}`
          })
          return { ok: true, text: lines.join('\n') }
        }
        if (parsed.result?.results) {
          const lines = parsed.result.results.map((r: any) => {
            if (r.note) return r.note
            if (r.error) return `错误: ${r.error}`
            return `ASG 结果: ${JSON.stringify(r)}`
          })
          return { ok: false, text: lines.join('\n') }
        }
        return { ok: false, text: `错误：${parsed.error}` }
      } catch {
        return { ok: false, text: `ASG 结果解析失败：${result.stdout.text}` }
      }
    } catch (e: any) {
      return { ok: false, text: `ASG 执行失败：${e.message}` }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 私有方法
  // ═══════════════════════════════════════════════════════════════

  /**
   * 获取沙箱策略。优先从 ctx.sandboxPolicy 获取，未配置时回退到默认值。
   * 这样即使 DSH 部署未配置 sandboxPolicy 服务，硬件工具也能正常工作。
   */
  private _getSandboxPolicy(): { mode: string; workspaceRoot: string } {
    const sandboxPolicy = this.ctx.get('sandboxPolicy')
    if (sandboxPolicy) {
      return sandboxPolicy.resolve()
    }
    // 回退：使用默认策略
    return {
      mode: 'workspace-write',
      workspaceRoot: process.cwd(),
    }
  }

  private parseWorkflowFrontmatter(text: string): { name?: string; description?: string } {
    const result: { name?: string; description?: string } = {}
    for (const line of text.split('\n')) {
      const m = line.match(/^(\w+):\s*(.*)$/)
      if (m && (m[1] === 'name' || m[1] === 'description')) {
        result[m[1]] = m[2].trim()
      }
    }
    return result
  }
}

export const name = 'dsh-lab-provider'

export function apply(ctx: Context) {
  ctx.plugin(LabLocal)
  console.log('[dsh-lab:provider] LabLocal registered')
}
