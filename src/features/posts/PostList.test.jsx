import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import { PostList } from './PostList'

// Layer: presentational component. Hand it props, assert the DOM.
// No QueryClient needed for the logic — but PostCard renders <Link>, so it
// needs a Router. That's the only reason renderWithProviders is here.
const posts = [
  { id: 'p1', title: 'First', body: 'one', createdAt: '2026-08-20T10:00:00Z', author: { name: 'Ada Lovelace' } },
  { id: 'p2', title: 'Second', body: 'two', createdAt: '2026-08-24T10:00:00Z', author: { name: 'Alan Turing' } },
]

describe('<PostList>', () => {
  it('renders one card per post', () => {
    renderWithProviders(<PostList posts={posts} />)
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })

  it('links each title to that post', () => {
    renderWithProviders(<PostList posts={posts} />)
    expect(screen.getByRole('link', { name: 'First' })).toHaveAttribute('href', '/posts/p1')
  })

  it('shows author and formatted date', () => {
    renderWithProviders(<PostList posts={[posts[0]]} />)
    const card = screen.getByRole('article')
    expect(within(card).getByText(/Ada Lovelace/)).toBeInTheDocument()
    expect(within(card).getByText(/Aug 20, 2026/)).toBeInTheDocument()
  })

  it('renders nothing but the container when the list is empty', () => {
    const { container } = renderWithProviders(<PostList posts={[]} />)
    expect(container.querySelector('.feed')).toBeEmptyDOMElement()
  })
})
