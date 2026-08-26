// lib/index.ts — 插件入口
import type { Context } from '@deepseek-ai/cordis'
import * as meta from './commands.js'
import * as projection from './projection.js'
import { LabLocal } from './lab-local.js'

// 启动时一次性清理残留注册，确保重启后状态非持久化
let startupCleaned = false

export const name = 'dsh-lab'
export const inject = ['commands']

export function apply(ctx: Context) {
  // 仅在首次加载时清理，避免重复执行
  if (!startupCleaned) {
    startupCleaned = true
    if (ctx.root.registry.has(LabLocal)) {
      ctx.root.registry.delete(LabLocal)
      console.log('[dsh-lab:index] startup: cleaned stale LabLocal registration')
    } else {
      console.log('[dsh-lab:index] startup: no stale registration found')
    }
  }

  ctx.plugin(meta)
  ctx.plugin(projection)  // Session Projection：追踪 lab 服务状态并推送给 Client
  console.log('[dsh-lab:index] host plugins registered: meta, projection')
}
