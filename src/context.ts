// lib/context.ts — Consumer 角色：System Prompt 上下文注入
import type { Context } from '@deepseek-ai/cordis'
import type { DevicesInventory } from './service.js'
import { DOCS_DIR } from './lab-local.js'

export const name = 'dsh-lab-context'
export const inject = ['systemPrompt', 'lab']

export function apply(ctx: Context) {
  console.log('[dsh-lab:context] ✓ 上下文注入已激活（lab 服务已注册）')

  // ── 角色定位（order 100，最先渲染）──
  ctx.systemPrompt.section({
    name: 'lab:role',
    order: 100,
    text: () => {
      const text = ctx.lab.readMarkdown('role.md')
      console.log('[dsh-lab:context] lab:role 已注入', text.length, '字符')
      return text
    },
  })

  // ── 仪器状态（order 200，每步刷新）──
  ctx.systemPrompt.section({
    name: 'lab:instruments',
    order: 200,
    text: () => {
      const inventory = ctx.lab.readInventory()
      if (Object.keys(inventory).length === 0) return ''

      // 区分在线/离线：VISA 看 address，ASG 看 local_ip
      const online: DevicesInventory = {}
      const offline: DevicesInventory = {}
      for (const [serial, d] of Object.entries(inventory)) {
        if (d.address || d.local_ip) online[serial] = d
        else offline[serial] = d
      }

      const lines: string[] = ['## 当前连接的仪器']
      if (Object.keys(online).length) {
        lines.push('在线设备：')
        lines.push('```json')
        lines.push(JSON.stringify(online, null, 2))
        lines.push('```')
      }
      if (Object.keys(offline).length) {
        lines.push('离线设备：')
        lines.push('```json')
        lines.push(JSON.stringify(offline, null, 2))
        lines.push('```')
      }
      return lines.join('\n')
    },
  })

  // ── 文档索引（order 201，每步刷新）──
  ctx.systemPrompt.section({
    name: 'lab:documents',
    order: 201,
    text: () => {
      const documents = ctx.lab.listDocuments()
      if (!documents.length) return ''

      const parts: string[] = ['## 可用仪器文档', `文档目录：\`${DOCS_DIR}\``, '']
      documents.forEach((doc) => {
        parts.push(`=== ${doc.filename} ===`)
        parts.push(doc.raw_frontmatter || '（无 frontmatter）')
        parts.push('')
      })
      return parts.join('\n')
    },
  })

  // ── 工作流索引（order 202，每步刷新）──
  ctx.systemPrompt.section({
    name: 'lab:workflows',
    order: 202,
    text: () => {
      const workflows = ctx.lab.listWorkflows()
      if (!workflows.length) return ''

      const lines = workflows.map((w) =>
        `  - ${w.name}（${w.description || '无描述'}）`
      )
      return ['## 可用工作流', ...lines, '使用 read_workflow 阅读，然后逐步执行'].join('\n')
    },
  })
}
