/**
 * 预设文件同步：将包内 presets/ 目录同步到 ~/.dsh/.agent-presets/
 * 参考 dsh-liangshen 的实现，简化为 dsh-lab 单预设场景
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, utimesSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'

/** 同步结果 */
export interface SyncResult {
  /** 已同步的预设 id */
  synced: string[]
  /** 已是最新的预设 id */
  current: string[]
  /** 同步失败的预设 id 及错误 */
  failed: { id: string; error: string }[]
  /** 已废弃的预设 id */
  retired: string[]
}

/** 递归获取目录下所有文件 */
function filesUnder(root: string): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) walk(path)
      else out.push(path)
    }
  }
  walk(root)
  return out
}

/** 字节级文件比较 */
function sameFile(a: string, b: string): boolean {
  const aStat = statSync(a)
  const bStat = statSync(b)
  if (aStat.size !== bStat.size) return false
  if (Math.abs(aStat.mtimeMs - bStat.mtimeMs) > 1000) return false
  return readFileSync(a).equals(readFileSync(b))
}

/** 清理目标目录中源目录没有的文件 */
function pruneExtras(root: string, keep: ReadonlySet<string>): void {
  const parents = new Set<string>()
  for (const file of filesUnder(root)) {
    if (!keep.has(relative(root, file))) {
      parents.add(dirname(file))
      rmSync(file, { force: true })
    }
  }
  for (const start of parents) {
    let dir: string | undefined = start
    while (dir !== undefined && relative(root, dir) !== '') {
      if (existsSync(dir) && readdirSync(dir).length === 0) {
        rmSync(dir, { recursive: true, force: true })
        dir = dirname(dir)
      } else {
        dir = undefined
      }
    }
  }
}

/** 递归复制目录树 */
function copyTreeSync(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true })
  for (const entry of readdirSync(sourceDir)) {
    const source = join(sourceDir, entry)
    const target = join(targetDir, entry)
    const stat = statSync(source)
    if (stat.isDirectory()) {
      copyTreeSync(source, target)
    } else {
      copyFileSync(source, target)
      utimesSync(target, stat.atime, stat.mtime)
    }
  }
}

/** 同步单个预设 */
function syncOnePreset(sourceDir: string, targetDir: string): 'synced' | 'current' {
  const sourceFiles = filesUnder(sourceDir)
  const sourceSet = new Set(sourceFiles.map(file => relative(sourceDir, file)))

  if (existsSync(targetDir) && !statSync(targetDir).isDirectory()) {
    rmSync(targetDir, { recursive: true, force: true })
  }
  if (!existsSync(targetDir)) {
    copyTreeSync(sourceDir, targetDir)
    pruneExtras(targetDir, sourceSet)
    return 'synced'
  }

  let dirty = false
  for (const file of sourceFiles) {
    const dest = join(targetDir, relative(sourceDir, file))
    if (!existsSync(dest) || !sameFile(file, dest)) {
      dirty = true
      break
    }
  }
  if (!dirty) {
    for (const file of filesUnder(targetDir)) {
      if (!sourceSet.has(relative(targetDir, file))) {
        dirty = true
        break
      }
    }
  }
  if (!dirty) return 'current'

  pruneExtras(targetDir, sourceSet)
  copyTreeSync(sourceDir, targetDir)
  pruneExtras(targetDir, sourceSet)
  return 'synced'
}

/**
 * 同步包内 presets/ 目录到 ~/.dsh/.agent-presets/
 * @param sourceRoot - 包内 presets/ 目录
 * @param targetRoot - DSH 预设发现根目录（如 ~/.dsh/.agent-presets）
 * @param retire - 要废弃的预设 id 列表
 */
export function syncPresetTrees(sourceRoot: string, targetRoot: string, retire: string[] = []): SyncResult {
  const result: SyncResult = { synced: [], current: [], failed: [], retired: [] }
  mkdirSync(targetRoot, { recursive: true })
  if (existsSync(sourceRoot)) {
    for (const entry of readdirSync(sourceRoot)) {
      const source = join(sourceRoot, entry)
      if (!statSync(source).isDirectory()) continue
      const id = basename(source)
      const targetDir = join(targetRoot, id)
      try {
        const outcome = syncOnePreset(source, targetDir)
        if (outcome === 'synced') {
          result.synced.push(id)
        } else {
          result.current.push(id)
        }
      } catch (error) {
        result.failed.push({ id, error: error instanceof Error ? error.message : String(error) })
      }
    }
  }
  for (const id of retire) {
    if (existsSync(join(sourceRoot, id))) continue
    const stale = join(targetRoot, id)
    if (existsSync(stale) && statSync(stale).isDirectory()) {
      rmSync(stale, { recursive: true, force: true })
      result.retired.push(id)
    }
  }
  return result
}
