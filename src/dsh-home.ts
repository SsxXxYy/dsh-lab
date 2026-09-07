/**
 * DSH_HOME 路径解析：环境变量 DSH_HOME 优先，否则回退到 ~/.dsh
 * 参考 dsh-liangshen 的实现
 */

import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { isAbsolute as posixIsAbsolute, join as posixJoin } from 'node:path/posix'

/** 展开路径开头的 ~（或 ~user） */
function expandHome(path: string, home: string = homedir()): string {
  const isPosix = home.startsWith('/')
  const j = isPosix ? posixJoin : join
  if (path === '~') return home
  if (path.startsWith('~/') || path.startsWith('~\\')) return j(home, path.slice(2))
  return path
}

/** 解析 DSH home 目录 */
export function resolveDshHome(
  env: NodeJS.ProcessEnv = process.env,
  home: string = homedir()
): string {
  const isPosix = home.startsWith('/')
  const j = isPosix ? posixJoin : join
  const isAbs = isPosix ? posixIsAbsolute : isAbsolute
  const raw = env.DSH_HOME
  if (raw !== undefined && raw.trim() !== '') {
    const expanded = expandHome(raw.trim(), home)
    return isAbs(expanded) ? expanded : j(process.cwd(), expanded)
  }
  return j(home, '.dsh')
}

/** 从当前环境解析 DSH home 目录 */
export function dshHome(): string {
  return resolveDshHome()
}
