import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Simple Button component test example
describe('Button Component', () => {
  it('renders a button element', () => {
    render(<button>Click me</button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays the correct text', () => {
    render(<button>Test Button</button>)
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<button onClick={handleClick}>Click me</button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<button disabled>Disabled Button</button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
