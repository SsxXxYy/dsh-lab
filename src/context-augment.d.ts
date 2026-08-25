// src/context-augment.d.ts — 声明合并：补充 DSH 框架插件注入的 Context 属性
// 独立 tsc 编译时这些属性由 DSH 运行时通过声明合并提供，此处声明避免报 TS2339
import type { Context, Plugin } from '@deepseek-ai/cordis'
import type { ZodType } from 'zod'

// Typert Registry 变化事件（服务存在性检测链路）
interface TypertRegistryChange {
  readonly kind: 'local' | 'remote' | 'lookup' | 'host-context' | 'client-context'
  readonly key: string
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    commands: {
      register(definition: {
        name: string
        description: string
        handler: () => Promise<{ kind: 'success'; text?: string } | { kind: 'error'; text: string }>
      }): void
    }
    plugin<P extends Plugin>(plugin: P): void
    sessionProjections: SessionProjectionRegistry
    // 服务存在性检测：Typert Registry 订阅
    typert: {
      remotes: {
        subscribe(callback: (change: TypertRegistryChange) => void): () => void
      }
    }
    // 服务存在性检测：Remote namespace 访问
    remote: {
      lab: { ping(): Promise<string> } | undefined
    }
  }
}

// 模块合并：将 dsh-lab:state 注入 SessionProjectionMap 类型表
// 这样 host 端的 session-projection 注册和 client 端的 faceOf('dsh-lab:state') 都能识别该 key
declare module '@deepseek-ai/dsh-session-projection' {
  interface SessionProjectionMap {
    'dsh-lab:state': { active: boolean }
  }
}

// 本地使用的类型别名
export type LabState = { active: boolean }

export interface ProjectionDefinition<K extends string, S> {
  key: K
  schema: ZodType<unknown>
  init(): S
  apply(state: S, event: { type: string; data: { name?: string } }): S
  wire?: {
    viewSchema: ZodType<unknown>
    view(state: S): unknown
  }
  stateVersion: number
}

export declare class SessionProjectionRegistry {
  register<K extends string, S>(definition: ProjectionDefinition<K, S>): () => void
  onChanged(listener: (session: { id: string }, key: string, value: unknown, seq: number) => void): () => void
}
