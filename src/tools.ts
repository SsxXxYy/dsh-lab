// lib/tools.ts — Consumer 角色：把 LabService 方法暴露为 DSH 工具
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {
  ReadDocumentRequest,
  ReadWorkflowRequest,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  DeleteWorkflowRequest,
  SendScpiRequest,
  SendAsgRequest,
} from './service.js'

export const name = 'dsh-lab-tools'
export const inject = ['tools', 'lab']

export function apply(ctx: Context) {
  console.log('[dsh-lab:tools] ✓ 工具注册已激活（lab 服务已注册）')

  // ── 仪器发现 ──
  ctx.tools.register(defineTool({
    name: 'scan_instruments',
    description: '扫描当前连接的 VISA 和 ASG 仪器设备，更新设备清单。',
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute() {
      const result = await ctx.lab.scanInstruments()
      return result.text
    },
  }))

  // ── 文档操作 ──
  ctx.tools.register(defineTool({
    name: 'read_document',
    description: '按行区间或章节读取仪器文档内容。',
    parameters: {
      filename: { type: 'string', description: '文档文件名（DG.md/DHO.md/ASG24100.md）', required: true },
      lines: { type: 'string', description: '行区间，如 23-36' },
      section: { type: 'string', description: '章节名，如 :SOURce 命令子系统' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args) {
      return await ctx.lab.readDocument(args as ReadDocumentRequest)
    },
    isConcurrencySafe: () => true,
  }))

  ctx.tools.register(defineTool({
    name: 'read_workflow',
    description: '读取工作流文件内容。',
    parameters: {
      name: { type: 'string', description: '工作流名称', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args) {
      return await ctx.lab.readWorkflow(args as ReadWorkflowRequest)
    },
    isConcurrencySafe: () => true,
  }))

  // ── 工作流管理 ──
  ctx.tools.register(defineTool({
    name: 'create_workflow',
    description: '新建工作流文件。',
    parameters: {
      folder_name: { type: 'string', description: '文件夹名', required: true },
      name: { type: 'string', description: '显示名称' },
      description: { type: 'string', description: '工作流描述' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args) {
      return await ctx.lab.createWorkflow(args as CreateWorkflowRequest)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'update_workflow',
    description: '修改工作流文件。',
    parameters: {
      name: { type: 'string', required: true },
      frontmatter: { type: 'object', additionalProperties: true },
      section_title: { type: 'string' },
      section_content: { type: 'string' },
      append: { type: 'string' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args) {
      return await ctx.lab.updateWorkflow(args as UpdateWorkflowRequest)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'delete_workflow',
    description: '删除工作流文件。',
    parameters: {
      name: { type: 'string', description: '工作流名称', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args) {
      return await ctx.lab.deleteWorkflow(args as DeleteWorkflowRequest)
    },
  }))

  // ── 仪器控制 ──
  ctx.tools.register(defineTool({
    name: 'send_scpi',
    description: '向仪器发送一条或多条 SCPI 命令，按顺序执行。',
    parameters: {
      commands: {
        type: 'array',
        description: 'SCPI 命令列表',
        required: true,
        items: {
          type: 'object',
          additionalProperties: true,
          properties: {
            address: { type: 'string', description: 'VISA 资源地址', required: true },
            command: { type: 'string', description: 'SCPI 命令', required: true },
            delay: { type: 'number', description: '执行后延迟（秒）' },
          },
        },
      },
      continueOnError: {
        type: 'boolean',
        description: '出错时是否继续执行后续命令，默认 false（出错即停）',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args) {
      const result = await ctx.lab.sendScpi(args as SendScpiRequest)
      return result.text
    },
  }))

  ctx.tools.register(defineTool({
    name: 'send_asg',
    description: '向 ASG 设备发送 SDK 调用，自动处理 Init/Connect/Disconnect/Release 生命周期。',
    parameters: {
      device_name: {
        type: 'string',
        description: '设备名（如 ASG241002324070090）',
        required: true,
      },
      local_ip: {
        type: 'string',
        description: '上位机 IP 地址',
        required: true,
      },
      local_mac: {
        type: 'string',
        description: '上位机 MAC 地址',
        required: true,
      },
      calls: {
        type: 'array',
        description: 'ASG 核心操作列表（不含 Init/Connect/Disconnect/Release）',
        required: true,
        items: {
          type: 'object',
          additionalProperties: true,
          properties: {
            func: { type: 'string', description: 'SDK 函数名', required: true },
            args: { type: 'array', items: { type: 'json' } },
            kwargs: { type: 'object', additionalProperties: true },
            delay: { type: 'number', description: '执行后延迟（秒）' },
          },
        },
      },
      continueOnError: {
        type: 'boolean',
        description: '出错时是否继续执行后续调用，默认 false（出错即停）',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args) {
      const result = await ctx.lab.sendAsg(args as SendAsgRequest)
      return result.text
    },
  }))
}
