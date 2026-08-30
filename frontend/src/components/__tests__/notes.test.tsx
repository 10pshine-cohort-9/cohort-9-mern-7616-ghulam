import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useSearchParams } from 'react-router-dom'
import type { Note } from '../../types'
import { NoteCard, type NoteCardAction } from '../notes/NoteCard'
import { SearchField } from '../notes/SearchField'
import { StatTiles } from '../notes/StatTiles'

const ALL_ACTIONS: readonly NoteCardAction[] = ['open', 'pin', 'favourite', 'archive', 'trash']

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '1',
    userId: 'u1',
    title: 'Groceries',
    content: '<p>Milk and bread</p>',
    status: 'active',
    isPinned: false,
    isFavourite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Note
}

describe('NoteCard', () => {
  it('shows the title', () => {
    render(<NoteCard actions={ALL_ACTIONS} note={makeNote()} onAction={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Groceries' })).toBeInTheDocument()
  })

  it('falls back to Untitled note for a blank title', () => {
    render(<NoteCard actions={ALL_ACTIONS} note={makeNote({ title: '' })} onAction={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Untitled note' })).toBeInTheDocument()
  })

  it('shows a plain-text excerpt rather than raw markup', () => {
    render(
      <NoteCard
        actions={ALL_ACTIONS}
        note={makeNote({ content: '<p><strong>Milk</strong> and bread</p>' })}
        onAction={jest.fn()}
      />,
    )

    expect(screen.getByText('Milk and bread')).toBeInTheDocument()
  })

  it('says so when the note is empty', () => {
    render(<NoteCard actions={ALL_ACTIONS} note={makeNote({ content: '' })} onAction={jest.fn()} />)

    expect(screen.getByText('This note is empty.')).toBeInTheDocument()
  })

  it('emits open when the title is clicked', async () => {
    const onAction = jest.fn()
    const note = makeNote()
    render(<NoteCard actions={ALL_ACTIONS} note={note} onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: 'Groceries' }))

    expect(onAction).toHaveBeenCalledWith('open', note)
  })

  it('emits favourite when the star is clicked', async () => {
    const onAction = jest.fn()
    const note = makeNote()
    render(<NoteCard actions={ALL_ACTIONS} note={note} onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: 'Favourite' }))

    expect(onAction).toHaveBeenCalledWith('favourite', note)
  })

  it('reports the favourite state through aria-pressed rather than a flipped label', () => {
    const { rerender } = render(
      <NoteCard actions={ALL_ACTIONS} note={makeNote()} onAction={jest.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Favourite' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    rerender(
      <NoteCard
        actions={ALL_ACTIONS}
        note={makeNote({ isFavourite: true })}
        onAction={jest.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Favourite' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows the edited time', () => {
    render(<NoteCard actions={ALL_ACTIONS} note={makeNote()} onAction={jest.fn()} />)

    expect(screen.getByText(/Edited Just now/i)).toBeInTheDocument()
  })
})

describe('StatTiles', () => {
  it('renders zeroes and a dash for an account with no notes', () => {
    render(<StatTiles archived={0} lastEdited={null} pinned={0} total={0} />)

    expect(screen.getByText('Total notes')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(3)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders the counts it is given', () => {
    render(<StatTiles archived={3} lastEdited="2h ago" pinned={2} total={7} />)

    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2h ago')).toBeInTheDocument()
  })
})

describe('SearchField', () => {
  it('renders empty when the url carries no query', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchField />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('Search notes...')).toHaveValue('')
  })

  it('seeds itself from the q parameter', () => {
    render(
      <MemoryRouter initialEntries={['/?q=groceries']}>
        <SearchField />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('Search notes...')).toHaveValue('groceries')
  })

  it('shows a clear button only once there is a term', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchField />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Search notes...'), 'milk')

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('clears the term when the clear button is pressed', async () => {
    render(
      <MemoryRouter initialEntries={['/?q=groceries']}>
        <SearchField />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(screen.getByPlaceholderText('Search notes...')).toHaveValue('')
  })

  it('keeps what the user types instead of resetting it to the url', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchField />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Search notes...')
    await userEvent.type(input, 'groceries')

    expect(input).toHaveValue('groceries')
  })

  it('writes the debounced term into the query string', async () => {
    let search = ''

    function Probe() {
      search = useLocation().search
      return null
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchField />
        <Probe />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('Search notes...'), 'milk')
    await waitFor(() => expect(search).toBe('?q=milk'))
  })

  it('follows an external change to the query, such as browser Back', async () => {
    function Harness() {
      const [params, setParams] = useSearchParams()

      return (
        <>
          <SearchField />
          <button onClick={() => setParams({ q: 'from-elsewhere' })} type="button">
            Navigate
          </button>
          <span data-testid="current-q">{params.get('q') ?? ''}</span>
        </>
      )
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Harness />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Search notes...')).toHaveValue('from-elsewhere'),
    )
  })
})
