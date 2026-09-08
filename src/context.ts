// lib/context.ts — Consumer 角色：System Prompt 上下文注入
import type { Context } from '@deepseek-ai/cordis'

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
      const devices = Object.entries(inventory)
      if (!devices.length) return ''

      const lines: string[] = ['## 当前连接的仪器']
      devices.forEach(([serial, d], i) => {
        lines.push(`  ${i + 1}. ${d.name || d.model} (${serial})`)
      })
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

      const lines: string[] = ['## 可用仪器文档']
      documents.forEach((doc) => {
        let line = `- ${doc.filename}（${doc.name || doc.filename}）`
        if (doc.description) line += ` — ${doc.description}`
        if (doc.index.length) {
          line += `\n    章节：${doc.index.slice(0, 5).map((i) => `${i.title}(${i.line}行)`).join('、')}`
          if (doc.index.length > 5) line += ` 等${doc.index.length}个章节`
        }
        lines.push(line)
      })
      lines.push('使用 read_document 查阅')
      return lines.join('\n')
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
