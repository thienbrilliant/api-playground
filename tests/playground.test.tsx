import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Playground } from '@/components/playground'

vi.stubGlobal('fetch', vi.fn())

const baseStorage = () => ({ getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(), key: vi.fn(), length: 0 })

describe('Playground', () => {
  it('renders request controls and validates an empty URL', async () => {
    Object.defineProperty(window, 'localStorage', { value: baseStorage(), configurable: true })
    const user = userEvent.setup()
    render(<Playground />)
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    const url = screen.getByLabelText('Request URL')
    await user.clear(url)
    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a URL before sending the request.')
  })
})
