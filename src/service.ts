// lib/service.ts — Service Definition 角色
import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'

// 设备清单类型
export interface DeviceInfo {
  model: string
  address: string
  name: string
  kind: 'visa' | 'asg'
}

export type DevicesInventory = Record<string, DeviceInfo>

// 文档元数据
export interface DocumentMeta {
  filename: string
  name: string
  description: string
  index: Array<{ title: string; line: number }>
}

// 工作流元数据
export interface WorkflowMeta {
  name: string
  description: string
}

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

  // ── 所有方法均为同步（供 system prompt section 使用）──
  
  /** 加载 content/ 目录下的 Markdown 文件（同步） */
  abstract readMarkdown(filename: string): string

  /** 读取设备清单 JSON（同步） */
  abstract readInventory(): DevicesInventory

  /** 遍历 docs 文件夹，解析 frontmatter（同步） */
  abstract listDocuments(): DocumentMeta[]

  /** 遍历 workflows 文件夹，解析 frontmatter（同步） */
  abstract listWorkflows(): WorkflowMeta[]
}
