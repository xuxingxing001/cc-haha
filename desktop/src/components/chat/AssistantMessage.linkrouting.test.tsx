import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { openBrowser } = vi.hoisted(() => ({ openBrowser: vi.fn() }))
vi.mock('../../stores/browserPanelStore', () => ({
  useBrowserPanelStore: { getState: () => ({ open: openBrowser }) },
}))
vi.mock('../../lib/desktopRuntime', async (orig) => ({
  ...(await orig<Record<string, unknown>>()),
  getServerBaseUrl: () => 'http://127.0.0.1:4321',
}))

import { AssistantMessage } from './AssistantMessage'

afterEach(() => openBrowser.mockReset())

describe('AssistantMessage link routing', () => {
  it('opens a localhost link in the in-app browser', () => {
    render(<AssistantMessage sessionId="s1" content={'打开 [预览](http://localhost:5173/)'} />)
    fireEvent.click(screen.getByText('预览'))
    expect(openBrowser).toHaveBeenCalledWith('s1', 'http://localhost:5173/')
  })
})
