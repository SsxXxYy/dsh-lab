// client/client.ts — 通过 Session Projection 感知 host 端 lab 服务状态
// 链路：Host /lab command → session append command/done → projection drive → WebSocket push → Client subscribe → 更新 UI
import type { Context } from '@deepseek-ai/cordis'

const STYLE_ID = 'dsh-lab/hide-chrome'
const HIDE_CHROME_CSS = [
  /* 隐藏侧边栏：grid 左右两列设为 0 */
  'html div:has(> [data-shell-overlay]){grid-template-columns:0 minmax(0,1fr) 0 !important}',
  /* 隐藏顶栏：多选择器覆盖，display:none 不动 grid 布局 */
  '[data-shell-header]{display:none!important}',
  '[data-shell-topbar]{display:none!important}',
  '[data-shell-header-bar]{display:none!important}',
  '[data-shell-toolbar]{display:none!important}',
  '[data-shell-nav]{display:none!important}',
  '[data-shell-appbar]{display:none!important}',
  'header{display:none!important}',
  'nav{display:none!important}'
].join('\n')

export const name = 'dsh-lab-client'
export const inject = ['slots', 'sessions']

export function apply(ctx: Context) {
  let tag: HTMLStyleElement | null = null

  function update(active: boolean) {
    if (active && !tag) {
      if (typeof document === 'undefined') {
        console.warn('[dsh-lab:client] skip: document undefined (SSR?)')
        return
      }
      if (document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]')) {
        console.warn('[dsh-lab:client] skip: style tag already in DOM')
        return
      }
      tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-lab'
      tag.dataset.pluginCss = STYLE_ID
      tag.textContent = HIDE_CHROME_CSS
      document.head.appendChild(tag)
    } else if (!active && tag) {
      tag.remove()
      tag = null
    }
  }

  ctx.effect(function () {
    let currentSessionId: string | null = null
    let unsubscribeProjection: (() => void) | null = null

    function cleanupProjection() {
      if (unsubscribeProjection) {
        unsubscribeProjection()
        unsubscribeProjection = null
      }
    }

    function subscribeToSession(sessionId: string) {
      cleanupProjection()
      if (!sessionId) return
      currentSessionId = sessionId

      const binding = ctx.sessions.binding(sessionId)
      if (!binding) return

      const face = binding.session.projections.faceOf('dsh-lab:state')
      if (!face) return

      unsubscribeProjection = face.subscribe(function () {
        const state = face.getSnapshot()
        update(state ? state.active : false)
      })

      const initial = face.getSnapshot()
      if (initial) update(initial.active)
    }

    let lastSubscribedSession: string | null = null
    const unsubscribeList = ctx.sessions.list.subscribe(function () {
      const snapshot = ctx.sessions.list.getSnapshot()
      if (snapshot.current !== currentSessionId && snapshot.current !== lastSubscribedSession) {
        lastSubscribedSession = snapshot.current
        subscribeToSession(snapshot.current)
      }
    })

    const snapshot = ctx.sessions.list.getSnapshot()
    if (snapshot.current) subscribeToSession(snapshot.current)

    return function () {
      cleanupProjection()
      if (unsubscribeList) unsubscribeList()
    }
  }, 'dsh-lab: projection subscription')
}
