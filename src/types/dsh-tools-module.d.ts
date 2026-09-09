// src/types/dsh-tools-module.d.ts — 声明 @deepseek-ai/dsh-tools 模块
// 此文件为脚本（无 import/export），declare module 会全局生效
declare module '@deepseek-ai/dsh-tools' {
  export interface ContentBlock {
    type: string
    text?: string
  }

  export interface ToolExecution {
    readonly name: string
    readonly arguments: unknown
  }

  export interface ToolExecutionResult {
    readonly isError: boolean
    readonly value?: unknown
    readonly content: ContentBlock[]
    readonly error?: { message: string }
  }

  export interface ToolResult {
    readonly content: ContentBlock[]
    readonly isError: boolean
    readonly meta?: unknown
  }

  export interface ToolRunContext {
    readonly name: string
    readonly arguments: unknown
  }

  export interface ValueSchemaAnnotations {
    description?: string
    title?: string
    default?: unknown
    examples?: unknown
  }

  export interface StringValueSchemaSpec extends ValueSchemaAnnotations {
    type: 'string'
    enum?: readonly string[]
    const?: string
  }

  export interface NumberValueSchemaSpec extends ValueSchemaAnnotations {
    type: 'number'
    enum?: readonly number[]
    const?: number
  }

  export interface IntegerValueSchemaSpec extends ValueSchemaAnnotations {
    type: 'integer'
    enum?: readonly number[]
    const?: number
  }

  export interface BooleanValueSchemaSpec extends ValueSchemaAnnotations {
    type: 'boolean'
    enum?: readonly boolean[]
    const?: boolean
  }

  export interface ArrayValueSchemaSpec extends ValueSchemaAnnotations {
    type: 'array'
    items?: ValueSchemaSpec
  }

  export interface ObjectValueSchemaSpec extends ValueSchemaAnnotations {
    type: 'object'
    properties?: ParameterSchemaSpec
    additionalProperties: boolean
  }

  export interface JsonValueSchemaSpec extends ValueSchemaAnnotations {
    type: 'json'
  }

  export type ValueSchemaSpec =
    | StringValueSchemaSpec
    | NumberValueSchemaSpec
    | IntegerValueSchemaSpec
    | BooleanValueSchemaSpec
    | ArrayValueSchemaSpec
    | ObjectValueSchemaSpec
    | JsonValueSchemaSpec

  export type ParameterPropertySpec = ValueSchemaSpec & { required?: true }

  export type ParameterSchemaSpec = {
    [key: string]: ParameterPropertySpec
  }

  export interface DefineToolOptions {
    readonly name: string
    readonly description: string
    readonly parameters: ParameterSchemaSpec
    readonly output: {
      readonly schema: ValueSchemaSpec
      render(args: unknown, value: unknown): ContentBlock[]
      presentationMeta?(args: unknown, value: unknown): unknown
    }
    readonly timeoutMs?: number
    isConcurrencySafe?(args: unknown): boolean
    execute(args: unknown, exec: ToolRunContext): Promise<unknown>
    finalizeContent?(exec: ToolExecution, result: ToolExecutionResult): ContentBlock[] | undefined
  }

  export declare function defineTool(options: DefineToolOptions): ToolDefinition

  export interface ToolDefinition {
    readonly name: string
    readonly description: string
    execute(args: unknown, exec: ToolRunContext): Promise<unknown>
  }
}
