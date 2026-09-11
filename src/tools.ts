// lib/tools.ts — Consumer 角色：把 LabService 方法暴露为 DSH 工具
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {
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
    description: '扫描当前通过 USB/网线连接的 VISA 和 ASG 仪器设备，更新设备清单（devices/devices_instruments.json）。返回设备列表和在线/离线状态。在发送 SCPI/ASG 命令前必须先调用此工具获取设备地址。',
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
    name: 'read_workflow',
    description: '读取工作流文件（workflows/<name>/<name>.md）的完整内容。工作流包含实验步骤、注意事项等信息。读取后应按步骤逐步执行。',
    parameters: {
      name: { type: 'string', description: '工作流名称，对应 workflows/ 下的文件夹名', required: true },
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
    description: '新建工作流文件，在 workflows/ 下创建文件夹和对应的 .md 文件。folder_name 是文件夹名（只允许字母数字、下划线、连字符、中文），name 是显示名称（默认同 folder_name），description 是工作流描述。',
    parameters: {
      folder_name: { type: 'string', description: '文件夹名（只允许字母数字、下划线、连字符、中文）', required: true },
      name: { type: 'string', description: '显示名称，默认同 folder_name' },
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
    description: '修改工作流文件（workflows/<name>/<name>.md）。支持四种操作可组合使用：(1) frontmatter 更新元数据（如 name、description）；(2) section_title + section_content 替换指定 ### 章节内容；(3) append 在文件末尾追加内容。name 是工作流名称。',
    parameters: {
      name: { type: 'string', description: '工作流名称', required: true },
      frontmatter: { type: 'object', additionalProperties: true, description: '要更新的 frontmatter 键值对，如 {"name": "新名称"}' },
      section_title: { type: 'string', description: '要替换的 ### 章节标题' },
      section_content: { type: 'string', description: '替换后的章节内容' },
      append: { type: 'string', description: '追加到文件末尾的内容' },
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
    description: '删除工作流文件（workflows/<name>/ 整个文件夹）。删除后不可恢复，请确认。',
    parameters: {
      name: { type: 'string', description: '工作流名称，对应 workflows/ 下的文件夹名', required: true },
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
    description: '向 VISA 仪器发送一条或多条 SCPI 命令，按顺序执行。每条命令包含 address（VISA 资源地址，从 scan_instruments 获取）、command（SCPI 指令字符串，如 "*IDN?" 或 ":SOURce1:FREQuency 1000"）和可选 delay（执行后等待秒数）。continueOnError 控制出错时是否继续执行后续命令（默认 false，出错即停）。超时按命令数量线性计算（每条最多 30 秒）。返回每条命令的执行结果。',
    parameters: {
      commands: {
        type: 'array',
        description: 'SCPI 命令列表，每条包含 address、command 和可选 delay',
        required: true,
        items: {
          type: 'object',
          additionalProperties: true,
          properties: {
            address: { type: 'string', description: 'VISA 资源地址（从 scan_instruments 获取，如 "USB0::0x1AB1::0x0588::DG1234567890::INSTR"）', required: true },
            command: { type: 'string', description: 'SCPI 命令字符串，如 "*IDN?" ":SOURce1:FREQuency 1000"', required: true },
            delay: { type: 'number', description: '执行后延迟等待的秒数' },
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
    description: '向 ASG 设备发送 SDK 调用，自动处理 Init/Connect/Disconnect/Release 生命周期。每条调用包含 func（SDK 函数名）、args（位置参数列表）、kwargs（关键字参数字典）和可选 delay（执行后等待秒数）。device_name 是设备名（从 scan_instruments 获取），local_ip 和 local_mac 是上位机网络地址。continueOnError 控制出错时是否继续执行后续调用（默认 false，出错即停）。Init 阶段 30 秒超时，每条调用最多 30 秒超时。返回每条调用的执行结果。',
    parameters: {
      device_name: {
        type: 'string',
        description: 'ASG 设备名（从 scan_instruments 获取，如 "ASG241002324070090"）',
        required: true,
      },
      local_ip: {
        type: 'string',
        description: '上位机 IP 地址（如 "192.168.1.100"）',
        required: true,
      },
      local_mac: {
        type: 'string',
        description: '上位机 MAC 地址（如 "00-1A-2B-3C-4D-5E"）',
        required: true,
      },
      calls: {
        type: 'array',
        description: 'ASG 核心操作列表（不含 Init/Connect/Disconnect/Release，这些自动处理）',
        required: true,
        items: {
          type: 'object',
          additionalProperties: true,
          properties: {
            func: { type: 'string', description: 'SDK 函数名（如 "ASG_SetParam"）', required: true },
            args: { type: 'array', items: { type: 'json' }, description: '位置参数列表' },
            kwargs: { type: 'object', additionalProperties: true, description: '关键字参数字典' },
            delay: { type: 'number', description: '执行后延迟等待的秒数' },
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
