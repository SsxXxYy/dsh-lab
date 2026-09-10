// lib/service.ts — Service Definition 角色
import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'

// ═══════════════════════════════════════════════════════════════
// 数据类型（上下文相关，已实现）
// ═══════════════════════════════════════════════════════════════

export interface DeviceInfo {
  model: string
  address: string
  name: string
  kind: 'visa' | 'asg'
  local_ip?: string
  local_mac?: string
}

export type DevicesInventory = Record<string, DeviceInfo>

export interface DocumentMeta {
  filename: string
  raw_frontmatter: string
}

export interface WorkflowMeta {
  name: string
  description: string
}

// ═══════════════════════════════════════════════════════════════
// Request/Result 类型（工具相关，待实现）
// ═══════════════════════════════════════════════════════════════

// ── 仪器发现 ──
export interface ScanInstrumentsResult {
  devices: Array<{ name: string; model: string; serial: string; kind: 'visa' | 'asg' }>
  text: string
}

// ── 文档操作 ──
export interface ReadDocumentRequest {
  filename: string
  lines?: string
  section?: string
}

export interface ReadWorkflowRequest {
  name: string
}

// ── 工作流管理 ──
export interface CreateWorkflowRequest {
  folder_name: string
  name?: string
  description?: string
}

export interface UpdateWorkflowRequest {
  name: string
  frontmatter?: Record<string, unknown>
  section_title?: string
  section_content?: string
  append?: string
}

export interface DeleteWorkflowRequest {
  name: string
}

// ── 仪器控制 ──

/** SCPI 批次请求：一次工具调用发送多条命令 */
export interface SendScpiRequest {
  commands: Array<{
    address: string
    command: string
    delay?: number
  }>
  /** 出错时是否继续执行后续命令，默认 false（出错即停） */
  continueOnError?: boolean
}

export interface SendScpiResult {
  ok: boolean
  text: string
}

/** ASG 批次请求：一次工具调用发送多条调用 */
export interface SendAsgRequest {
  /** 设备名（如 ASG241002324070090） */
  device_name: string
  /** 上位机 IP */
  local_ip: string
  /** 上位机 MAC */
  local_mac: string
  /** 核心操作列表（不含 Init/Connect/Disconnect/Release） */
  calls: Array<{
    func: string
    args?: unknown[]
    kwargs?: Record<string, unknown>
    delay?: number
  }>
  /** 出错时是否继续执行后续调用，默认 false（出错即停） */
  continueOnError?: boolean
}

export interface SendAsgResult {
  ok: boolean
  text: string
}

// ── 命令 ──
export interface RenameDeviceRequest {
  id: string
  name: string
}

export interface RenameDeviceResult {
  ok: boolean
  text: string
}

// ═══════════════════════════════════════════════════════════════
// 类型声明合并：让消费方可以写 ctx.lab
// ═══════════════════════════════════════════════════════════════

declare module '@deepseek-ai/cordis' {
  interface Context {
    lab: LabService
  }
}

// ═══════════════════════════════════════════════════════════════
// LabService 抽象类
// ═══════════════════════════════════════════════════════════════

export abstract class LabService extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'lab')
  }

  // ── 上下文相关方法（已实现，同步）──
  abstract readMarkdown(filename: string): string
  abstract readInventory(): DevicesInventory
  abstract listDocuments(): DocumentMeta[]
  abstract listWorkflows(): WorkflowMeta[]

  // ── 工具相关方法（待实现，异步）──
  abstract scanInstruments(): Promise<ScanInstrumentsResult>
  abstract readDocument(request: ReadDocumentRequest): Promise<string>
  abstract readWorkflow(request: ReadWorkflowRequest): Promise<string>
  abstract createWorkflow(request: CreateWorkflowRequest): Promise<string>
  abstract updateWorkflow(request: UpdateWorkflowRequest): Promise<string>
  abstract deleteWorkflow(request: DeleteWorkflowRequest): Promise<string>
  abstract sendScpi(request: SendScpiRequest): Promise<SendScpiResult>
  abstract sendAsg(request: SendAsgRequest): Promise<SendAsgResult>

  // ── 命令相关方法（待实现，异步）──
  abstract renameDevice(request: RenameDeviceRequest): Promise<RenameDeviceResult>
}
