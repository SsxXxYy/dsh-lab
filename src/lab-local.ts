// lib/lab-local.ts — Service Provider 角色
import type { Context } from '@deepseek-ai/cordis'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LabService, type DevicesInventory, type DocumentMeta, type WorkflowMeta } from './service.js'

// 使用 import.meta.url 定位项目根目录，避免 process.cwd() 不确定问题
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url))
const CONTENT_DIR = join(PROJECT_ROOT, 'content')
const INVENTORY_PATH = join(PROJECT_ROOT, 'devices', 'devices_inventory.json')
const DOCS_DIR = join(PROJECT_ROOT, 'docs')
const WORKFLOW_DIR = join(PROJECT_ROOT, 'workflows')

export class LabLocal extends LabService {
  // ── 加载 content/ 目录下的 Markdown 文件（同步）──
  readMarkdown(filename: string): string {
    const filePath = join(CONTENT_DIR, filename)
    try {
      return readFileSync(filePath, 'utf-8')
    } catch {
      return ''
    }
  }

  // ── 读取设备清单（同步）──
  readInventory(): DevicesInventory {
    try {
      const text = readFileSync(INVENTORY_PATH, 'utf-8')
      return JSON.parse(text) as DevicesInventory
    } catch {
      return {}
    }
  }

  // ── 遍历 docs 文件夹，解析 frontmatter（同步）──
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
        const match = content.match(/^---\n([\s\S]*?)\n---/)
        if (!match) return { filename, name: '', description: '', index: [] }
        const frontmatter = this.parseDocumentFrontmatter(match[1])
        return {
          filename,
          name: frontmatter.name || '',
          description: frontmatter.description || '',
          index: frontmatter.index || [],
        }
      } catch {
        return { filename, name: '', description: '', index: [] }
      }
    })
  }

  // ── 遍历 workflows 文件夹，解析 frontmatter（同步）──
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

  // ── 解析文档 frontmatter（含 index 数组）──
  private parseDocumentFrontmatter(text: string): { name?: string; description?: string; index?: Array<{ title: string; line: number }> } {
    const result: { name?: string; description?: string; index?: Array<{ title: string; line: number }> } = {}
    const lines = text.split('\n')
    const indexItems: Array<{ title: string; line: number }> = []

    for (const line of lines) {
      const simpleMatch = line.match(/^(\w+):\s*(.*)$/)
      if (simpleMatch && simpleMatch[1] !== 'index') {
        const key = simpleMatch[1]
        if (key === 'name') result.name = simpleMatch[2].trim()
        else if (key === 'description') result.description = simpleMatch[2].trim()
        continue
      }
      const indexTitleMatch = line.match(/^\s+-\s+title:\s*"?([^"]+)"?$/)
      if (indexTitleMatch) {
        indexItems.push({ title: indexTitleMatch[1], line: 0 })
        continue
      }
      const indexLineMatch = line.match(/^\s+line:\s*(\d+)$/)
      if (indexLineMatch && indexItems.length) {
        indexItems[indexItems.length - 1].line = Number(indexLineMatch[1])
      }
    }

    if (indexItems.length) result.index = indexItems
    return result
  }

  // ── 解析工作流 frontmatter（仅 name / description）──
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
