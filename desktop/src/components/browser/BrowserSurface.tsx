import { useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserAddressBar } from './BrowserAddressBar'
import { computeWebviewBounds } from './computeWebviewBounds'
import { previewBridge } from '../../lib/previewBridge'
import { useBrowserPanelStore } from '../../stores/browserPanelStore'

export function BrowserSurface({ sessionId }: { sessionId: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const session = useBrowserPanelStore((s) => s.bySession[sessionId])
  const store = useBrowserPanelStore.getState()

  const reportBounds = () => {
    const el = hostRef.current
    if (!el) return
    previewBridge.setBounds(computeWebviewBounds(el.getBoundingClientRect()))
  }

  useLayoutEffect(() => {
    const el = hostRef.current
    if (!el || !session) return
    previewBridge.open(session.url, computeWebviewBounds(el.getBoundingClientRect()))
    previewBridge.setVisible(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const ro = new ResizeObserver(() => reportBounds())
    ro.observe(el)
    window.addEventListener('resize', reportBounds)
    return () => { ro.disconnect(); window.removeEventListener('resize', reportBounds) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  useEffect(() => () => { previewBridge.setVisible(false) }, [])

  if (!session) return null

  return (
    <div className="flex h-full flex-col">
      <BrowserAddressBar
        url={session.url}
        canGoBack={session.canGoBack}
        canGoForward={session.canGoForward}
        onNavigate={(url) => { store.navigate(sessionId, url); previewBridge.navigate(url) }}
        onBack={() => { store.goBack(sessionId); previewBridge.navigate(useBrowserPanelStore.getState().bySession[sessionId]!.url) }}
        onForward={() => { store.goForward(sessionId); previewBridge.navigate(useBrowserPanelStore.getState().bySession[sessionId]!.url) }}
        onReload={() => previewBridge.navigate(session.url)}
      />
      <div ref={hostRef} className="flex-1" data-testid="preview-host" />
    </div>
  )
}
