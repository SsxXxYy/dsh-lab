// lib/context-disabled.ts — lab 未激活时的提示词注入
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-local.js'

export const name = 'dsh-lab-context-disabled'
export const inject = ['systemPrompt']

export function apply(ctx: Context) {
  console.log('[dsh-lab:context-disabled] ✓ apply() 已调用')

  ctx.systemPrompt.section({
    name: 'lab:disabled',
    order: 100,
    text: () => {
      const hasLab = ctx.root.registry.has(LabLocal)
      console.log('[dsh-lab:context-disabled] text() 调用, registry.has(LabLocal):', hasLab)
      if (hasLab) return ''
      return '## 实验模式\n实验模式未启用。所有实验相关功能（仪器控制、设备扫描、文档检索、工作流管理）均需先启用实验模式。请发送 /lab 开启。'
    },
  })
}
