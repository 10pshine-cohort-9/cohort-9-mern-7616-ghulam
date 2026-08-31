import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Note, NoteSort } from '../../types'
import type { NoteCardAction } from '../notes/NoteCard'
import { NoteCardMenu } from '../notes/NoteCardMenu'
import { NoteFilters } from '../notes/NoteFilters'
import { NoteGrid } from '../notes/NoteGrid'
import { NoteGridSkeleton } from '../notes/NoteGridSkeleton'

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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  } as Note
}

describe('NoteFilters', () => {
  const SORTS: { label: string; value: NoteSort }[] = [
    { label: 'Updated (Newest)', value: 'updated-desc' },
    { label: 'Updated (Oldest)', value: 'updated-asc' },
    { label: 'Created (Newest)', value: 'created-desc' },
    { label: 'Created (Oldest)', value: 'created-asc' },
  ]

  it('offers every sort as a button inside a labelled group', () => {
    render(<NoteFilters onChange={jest.fn()} value="updated-desc" />)

    expect(screen.getByRole('group', { name: 'Sort options' })).toBeInTheDocument()
    for (const sort of SORTS) {
      expect(screen.getByRole('button', { name: sort.label })).toBeInTheDocument()
    }
  })

  it('marks only the active sort as pressed', () => {
    render(<NoteFilters onChange={jest.fn()} value="created-asc" />)

    expect(screen.getByRole('button', { name: 'Created (Oldest)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Updated (Newest)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('reports the chosen sort value, not its label', async () => {
    const onChange = jest.fn()
    render(<NoteFilters onChange={onChange} value="updated-desc" />)

    await userEvent.click(screen.getByRole('button', { name: 'Created (Newest)' }))

    expect(onChange).toHaveBeenCalledWith('created-desc')
  })

  it('still reports a click on the sort that is already active', async () => {
    const onChange = jest.fn()
    render(<NoteFilters onChange={onChange} value="updated-desc" />)

    await userEvent.click(screen.getByRole('button', { name: 'Updated (Newest)' }))

    expect(onChange).toHaveBeenCalledWith('updated-desc')
  })
})

describe('NoteGrid', () => {
  it('renders one card per note', () => {
    const notes = [
      makeNote({ id: '1', title: 'First' }),
      makeNote({ id: '2', title: 'Second' }),
      makeNote({ id: '3', title: 'Third' }),
    ]
    render(<NoteGrid actions={ALL_ACTIONS} notes={notes} onAction={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Third' })).toBeInTheDocument()
  })

  it('renders nothing for an empty list rather than a placeholder', () => {
    render(<NoteGrid actions={ALL_ACTIONS} notes={[]} onAction={jest.fn()} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('passes the originating note through to onAction', async () => {
    const onAction = jest.fn()
    const notes = [makeNote({ id: '1', title: 'First' }), makeNote({ id: '2', title: 'Second' })]
    render(<NoteGrid actions={ALL_ACTIONS} notes={notes} onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: 'Second' }))

    expect(onAction).toHaveBeenCalledWith('open', notes[1])
  })
})

describe('NoteGridSkeleton', () => {
  it('announces itself as busy so the wait is not silent', () => {
    render(<NoteGridSkeleton />)

    const status = screen.getByRole('status', { name: 'Loading your notes' })
    expect(status).toHaveAttribute('aria-busy', 'true')
  })
})

describe('NoteCardMenu', () => {
  it('keeps the panel closed until the trigger is used', () => {
    render(<NoteCardMenu actions={ALL_ACTIONS} note={makeNote()} onAction={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Note actions' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('lists exactly the actions it was given', async () => {
    render(
      <NoteCardMenu actions={['restore', 'delete']} note={makeNote()} onAction={jest.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Note actions' }))

    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete forever' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('reads Pin for an unpinned note and Unpin for a pinned one', async () => {
    const { unmount } = render(
      <NoteCardMenu actions={['pin']} note={makeNote()} onAction={jest.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Note actions' }))
    expect(screen.getByRole('button', { name: 'Pin' })).toBeInTheDocument()
    unmount()

    render(
      <NoteCardMenu
        actions={['pin']}
        note={makeNote({ isPinned: true })}
        onAction={jest.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Note actions' }))
    expect(screen.getByRole('button', { name: 'Unpin' })).toBeInTheDocument()
  })

  it('flips the favourite label once the note is a favourite', async () => {
    render(
      <NoteCardMenu
        actions={['favourite']}
        note={makeNote({ isFavourite: true })}
        onAction={jest.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Note actions' }))

    expect(screen.getByRole('button', { name: 'Remove from favourites' })).toBeInTheDocument()
  })

  it('emits the action with its note and closes the panel', async () => {
    const onAction = jest.fn()
    const note = makeNote()
    render(<NoteCardMenu actions={ALL_ACTIONS} note={note} onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: 'Note actions' }))
    await userEvent.click(screen.getByRole('button', { name: 'Archive' }))

    expect(onAction).toHaveBeenCalledWith('archive', note)
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('closes on a pointer press outside the menu', async () => {
    render(
      <div>
        <NoteCardMenu actions={ALL_ACTIONS} note={makeNote()} onAction={jest.fn()} />
        <button type="button">Elsewhere</button>
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Note actions' }))
    expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<NoteCardMenu actions={ALL_ACTIONS} note={makeNote()} onAction={jest.fn()} />)
    const trigger = screen.getByRole('button', { name: 'Note actions' })
    await userEvent.click(trigger)

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
