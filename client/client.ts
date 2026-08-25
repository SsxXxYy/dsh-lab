// client/client.ts — 通过 Session Projection 感知 host 端 lab 服务状态
// 链路：Host /lab command → session append command/run → projection drive → WebSocket push → Client subscribe → 更新 UI
import type { Context } from '@deepseek-ai/cordis'

const STYLE_ID = 'dsh-lab/hide-sidebar'
const HIDE_SIDEBAR_CSS = 'html div:has(> [data-shell-overlay]){grid-template-columns:0 minmax(0,1fr) 0 !important}'

export const name = 'dsh-lab-client'
export const inject = ['slots', 'sessions']

export function apply(ctx: Context) {
  let tag: HTMLStyleElement | null = null

  function update(active: boolean) {
    console.log('[dsh-lab:client] update(', active, ') tag:', !!tag)
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
      tag.textContent = HIDE_SIDEBAR_CSS
      document.head.appendChild(tag)
      console.log('[dsh-lab:client] ✓ sidebar hidden')
    } else if (!active && tag) {
      tag.remove()
      tag = null
      console.log('[dsh-lab:client] ✓ sidebar restored')
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
      if (!binding) {
        console.log('[dsh-lab:client] binding not found for', sessionId)
        return
      }

      const face = binding.session.projections.faceOf('dsh-lab:state')
      if (!face) {
        console.log('[dsh-lab:client] face "dsh-lab:state" not found')
        return
      }

      unsubscribeProjection = face.subscribe(function () {
        const state = face.getSnapshot()
        console.log('[dsh-lab:client] ★ projection push:', JSON.stringify(state))
        update(state ? state.active : false)
      })

      const initial = face.getSnapshot()
      console.log('[dsh-lab:client] initial:', JSON.stringify(initial))
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
