// lib/index.ts — 插件入口
import type { Context } from '@deepseek-ai/cordis'
import * as meta from './commands.js'
import * as verify from './verify.js'
import * as projection from './projection.js'

export const name = 'dsh-lab'
export const inject = ['commands']

export function apply(ctx: Context) {
  ctx.plugin(meta)
  ctx.plugin(verify)
  ctx.plugin(projection)  // Session Projection：追踪 lab 服务状态并推送给 Client
  console.log('[dsh-lab:index] host plugins registered: meta, verify, projection')
}
