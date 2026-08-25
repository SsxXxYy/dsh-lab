// lib/verify.ts — 验证消费者（注入 lab 服务，打印信息）
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-lab-verify'
export const inject = ['lab']

export function apply(ctx: Context) {
  console.log('[dsh-lab] lab 服务已就绪', ctx.lab)
}
