import { classifyPreviewLink } from './previewLinkRouter'
import { previewFsUrl } from './handlePreviewLink'
import type { OpenWithContext } from './openWithItems'

const HTML_EXT = /\.(html?|xhtml)$/i

/** Build an open-with context for a workspace file (we have both its relative + absolute path). */
export function openWithContextForWorkspaceFile(
  relPath: string,
  absolutePath: string,
  opts: { sessionId: string; serverBaseUrl: string },
): OpenWithContext {
  return {
    kind: 'file',
    absolutePath,
    relPath,
    previewable: true,
    inAppBrowserUrl: HTML_EXT.test(relPath) ? previewFsUrl(opts.serverBaseUrl, opts.sessionId, relPath) : undefined,
  }
}

function resolveAbsolute(workDir: string | undefined, p: string): string {
  if (!workDir || p.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(p)) return p
  return `${workDir.replace(/[\\/]+$/, '')}/${p.replace(/^[/\\]+/, '')}`
}

export function openWithContextForHref(
  href: string,
  opts: { sessionId: string; serverBaseUrl: string; workDir?: string },
): OpenWithContext | null {
  const c = classifyPreviewLink(href)
  if ((c.kind === 'browser-localhost' || c.kind === 'remote') && c.url) {
    return { kind: 'url', url: c.url }
  }
  if (c.kind === 'file-preview' && c.path) {
    return { kind: 'file', absolutePath: resolveAbsolute(opts.workDir, c.path), relPath: c.path, previewable: true }
  }
  if (c.kind === 'browser-file' && c.path) {
    return { kind: 'file', absolutePath: resolveAbsolute(opts.workDir, c.path), inAppBrowserUrl: previewFsUrl(opts.serverBaseUrl, opts.sessionId, c.path) }
  }
  return null
}
