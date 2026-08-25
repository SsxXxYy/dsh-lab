// projection.ts — Host 端 Session Projection：追踪 lab 服务状态并推送给 Client
// 链路：Host /lab command → session append command/done → projection drive → client push
// 关键：使用 command/done（而非 command/run），因为 command/done 在命令处理器之后提交，
// 此时 registry 已更新，可以读取到正确的服务注册状态。
import type { Context } from '@deepseek-ai/cordis'
import type { LabState } from './projection-types.js'
import { LabStateSchema } from './projection-types.js'
import { LabLocal } from './lab-agent-local.js'

export const name = 'dsh-lab-projection'
export const inject = ['sessionProjections']

export function apply(ctx: Context) {
  ctx.sessionProjections.register({
    key: 'dsh-lab:state',
    schema: LabStateSchema,
    init: (): LabState => {
      // 新会话初始化时，读取实际 registry 状态
      const active = ctx.root.registry.has(LabLocal)
      console.log('[dsh-lab:projection] init: active =', active)
      return { active }
    },
    apply: (state: LabState | undefined, event: { type: string; data?: { name?: string } }): LabState => {
      // 使用 command/done 而非 command/run：
      // command/run 在命令处理器之前提交，此时 registry 未更新
      // command/done 在命令处理器之后提交，此时 registry 已反映操作结果
      console.log('[dsh-lab:projection] ★ HOP2: apply called, event =', JSON.stringify(event), 'prev state =', JSON.stringify(state))
      if (event.type === 'command/done') {
        // 任意 command/done 后读取实际 registry 状态（事件结构中无 name 字段，无法按名称过滤）
        const actualActive = ctx.root.registry.has(LabLocal)
        console.log('[dsh-lab:projection] ★ HOP2: command/done, actual registry state =', actualActive)
        return { active: actualActive }
      }
      return state ?? { active: ctx.root.registry.has(LabLocal) }
    },
    wire: {
      viewSchema: LabStateSchema,
      view: (state: LabState): LabState => state,
    },
    stateVersion: 1,
  })
  console.log('[dsh-lab:projection] registered')

  // 诊断：验证 onChanged 推送通道
  try {
    ctx.sessionProjections.onChanged((_session, key, value, seq) => {
      console.log('[dsh-lab:projection] ★ HOP3: push to client:', JSON.stringify({ key, value, seq }))
    })
  } catch (e) {
    console.error('[dsh-lab:projection] onChanged listener failed:', e)
  }
}
