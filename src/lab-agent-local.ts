// lib/lab-agent-local.ts — Service Provider 角色
import type { Context } from '@deepseek-ai/cordis'
import { Remote } from '@deepseek-ai/dsh-typert-protocol'
import { LabService } from './service.js'

export class LabLocal extends LabService {
  // 服务的存在本身就是"开启"，不需要 isActive() 方法
  // Gateway 通过 @Remote 方法发现并暴露此服务给 Client
  @Remote
  async ping(): Promise<string> {
    return 'pong'
  }
}

export const name = 'dsh-lab-provider'

export function apply(ctx: Context) {
  ctx.plugin(LabLocal)
  console.log('[dsh-lab:provider] LabLocal registered')
}
