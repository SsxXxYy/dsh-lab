// lib/index.ts — 插件入口
import type { Context } from '@deepseek-ai/cordis'
import * as meta from './commands.js'
import * as projection from './projection.js'
import * as context from './context.js'
import * as contextDisabled from './context-disabled.js'
import * as tools from './tools.js'
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
    }
  }

  ctx.plugin(meta)            // /lab 元命令
  ctx.plugin(projection)      // Session Projection：追踪 lab 服务状态并推送给 Client
  ctx.plugin(context)         // System Prompt 上下文注入（lab 激活时）
  ctx.plugin(contextDisabled) // System Prompt 上下文注入（lab 未激活时）
  ctx.plugin(tools)           // 工具注册（7 个工具）
}
