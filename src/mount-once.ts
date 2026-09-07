/**
 * Host 单例守卫：同一个插件包只执行一次 apply
 * 参考 dsh-liangshen 的实现
 */

const MOUNTED = Symbol.for('dsh-lab.mounted')

interface MountRegistry {
  [MOUNTED]?: Set<string>
}

function mountedSet(): Set<string> {
  const registry = globalThis as MountRegistry
  return (registry[MOUNTED] ??= new Set())
}

/**
 * 包装 cordis 插件 apply，确保同一进程内只执行一次
 * @param packageName - npm 包名
 * @param fn - 原始 apply 函数
 * @returns 包装后的 apply 函数
 */
export function mountOnce<T extends (...args: any[]) => unknown>(packageName: string, fn: T): T {
  return ((...args: unknown[]) => {
    const mounted = mountedSet()
    if (mounted.has(packageName)) return
    mounted.add(packageName)
    const ctx = args[0] as { effect?: (effect: () => unknown) => unknown } | undefined
    ctx?.effect?.(() => () => {
      mounted.delete(packageName)
    })
    return fn(...args)
  }) as T
}
