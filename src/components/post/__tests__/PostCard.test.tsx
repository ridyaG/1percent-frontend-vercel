import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PostCard from '../PostCard'
import type { Post } from '../../../types/post'

// mock hook
jest.mock('../../hooks/useLike', () => ({
  useLike: () => ({
    mutate: jest.fn(),
  }),
}))

// mock component
jest.mock('../profile/StreakBadge', () => ({ streak }: { streak: number }) => (
  <div data-testid="streak-badge">{streak}</div>
))

const mockPost: Post = {
  id: '1',
  content: 'Day 14! Staying consistent #coding',
  postType: 'daily_win',
  publishedAt: new Date().toISOString(),
  liked: false,

  author: {
    id: 'user1',
    username: 'alex',
    displayName: 'Alex',
    avatarUrl: '/avatar.png',
    currentStreak: 14,
  },

  _count: {
    likes: 5,
    comments: 2,
  },
}

test('renders post content and author', () => {
  render(<PostCard post={mockPost} />)

  expect(screen.getByText(/Day 14/)).toBeInTheDocument()
  expect(screen.getByText('Alex')).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()
})

test('shows hashtags as styled links', () => {
  render(<PostCard post={mockPost} />)

  const hashtag = screen.getByText('#coding')
  expect(hashtag).toHaveClass('text-[#FF5C00]')
})