// lib/commands.ts — Consumer 角色（元命令）
import type { Context } from '@deepseek-ai/cordis'
import { LabLocal } from './lab-local.js'

export const name = 'dsh-lab-meta'
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.commands.register({
    name: 'lab',
    description: '切换实验模式（启用/关闭仪器控制插件）',
    handler: async () => {
      const wasRegistered = ctx.root.registry.has(LabLocal)

      if (!wasRegistered) {
        ctx.root.plugin(LabLocal)
        const nowRegistered = ctx.root.registry.has(LabLocal)
        if (!nowRegistered) {
          console.error('[dsh-lab:cmd] ✗ enable FAILED')
          return { kind: 'error', text: '实验模式启用失败：服务注册异常。' }
        }
        return { kind: 'success', text: '实验模式已启用。' }
      } else {
        ctx.root.registry.delete(LabLocal)
        const nowRegistered = ctx.root.registry.has(LabLocal)
        if (nowRegistered) {
          console.error('[dsh-lab:cmd] ✗ disable FAILED')
          return { kind: 'error', text: '实验模式关闭失败：服务注销异常。' }
        }
        return { kind: 'success', text: '实验模式已关闭。' }
      }
    },
  })
}
