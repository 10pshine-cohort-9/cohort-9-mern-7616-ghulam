import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Icon, IconButton } from '../ui'

interface TopBarProps {
  onOpenNav: () => void
}

export function TopBar({ onOpenNav }: TopBarProps) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const query = params.get('q') ?? ''

  function handleSearch(value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set('q', value)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-glass-stroke bg-surface/70 px-5 backdrop-blur-md lg:px-margin-page">
      <IconButton
        className="lg:hidden"
        label="Open navigation"
        name="menu"
        onClick={onOpenNav}
      />

      <div className="group relative min-w-0 flex-1">
        <Icon
          className="absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant transition-colors duration-200 ease-out group-focus-within:text-primary"
          name="search"
        />
        <input
          aria-label="Search notes"
          className="w-full max-w-md rounded-full bg-transparent py-2 pr-3 pl-11 text-body-md text-on-surface placeholder:text-muted-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Search your notes"
          type="search"
          value={query}
        />
      </div>

      <Button className="shrink-0" onClick={() => navigate('/notes/new')} size="sm">
        <Icon name="add" size="sm" />
        <span className="sr-only sm:not-sr-only">New note</span>
      </Button>
    </header>
  )
}
