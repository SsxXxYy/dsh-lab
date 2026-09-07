// lib/index.ts — 插件入口
import type { Context } from '@deepseek-ai/cordis'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as meta from './commands.js'
import * as projection from './projection.js'
import { LabLocal } from './lab-local.js'
import { dshHome } from './dsh-home.js'
import { syncPresetTrees } from './sync.js'
import { mountOnce } from './mount-once.js'

// 启动时一次性清理残留注册，确保重启后状态非持久化
let startupCleaned = false

export const name = 'dsh-lab'
export const inject = ['commands']

/** 包内 presets/ 目录的绝对路径 */
function bundledPresetsRoot(): string {
  return fileURLToPath(new URL('../presets/', import.meta.url))
}

/** 同步预设到 ~/.dsh/.agent-presets */
function syncPresets(): void {
  const targetRoot = join(dshHome(), '.agent-presets')
  syncPresetTrees(bundledPresetsRoot(), targetRoot, [])
}

/** 实际的 apply 逻辑 */
function applyImpl(ctx: Context) {
  // 仅在首次加载时清理，避免重复执行
  if (!startupCleaned) {
    startupCleaned = true
    if (ctx.root.registry.has(LabLocal)) {
      ctx.root.registry.delete(LabLocal)
    }
    // 同步预设文件（首次加载时执行一次）
    try {
      syncPresets()
      console.log('[dsh-lab] ✓ Lab 预设已同步到 ~/.dsh/.agent-presets')
    } catch (error) {
      console.warn('[dsh-lab] ✗ 预设同步失败：', error instanceof Error ? error.message : String(error))
    }
  }

  ctx.plugin(meta)
  ctx.plugin(projection)  // Session Projection：追踪 lab 服务状态并推送给 Client
}

/** 带单例守卫的 apply */
export const apply = mountOnce('dsh-lab', applyImpl)
