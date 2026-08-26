// lib/lab-agent-local.ts — Service Provider 角色
import type { Context } from '@deepseek-ai/cordis'
import { LabService } from './service.js'

export class LabLocal extends LabService {
  // 服务的存在本身就是"开启"，不需要 isActive() 方法
}

export const name = 'dsh-lab-provider'

export function apply(ctx: Context) {
  ctx.plugin(LabLocal)
  console.log('[dsh-lab:provider] LabLocal registered')
}
