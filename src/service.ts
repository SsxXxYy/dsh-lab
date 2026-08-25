// lib/service.ts — Service Definition 角色
import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'

// 类型声明合并：让消费方可以写 ctx.lab
declare module '@deepseek-ai/cordis' {
  interface Context {
    lab: LabService
  }
}

export abstract class LabService extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'lab')
  }
}
