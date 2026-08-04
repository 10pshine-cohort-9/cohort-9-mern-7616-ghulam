import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="relative overflow-hidden rounded-xxl bg-primary p-stack-md text-center text-on-primary">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(255_239_179/0.1),transparent)]"
        />
        <div className="relative">
          <p aria-hidden="true" className="mb-2 font-mono text-[40px] opacity-20">
            404
          </p>
          <h1 className="mb-2 text-headline-md">Lost in Aether</h1>
          <p className="mb-stack-md text-body-md opacity-60">
            This page has drifted beyond reach.
          </p>
          {/* `border-current` so the pill tracks the text colour, which flips
              from white to deep green when the palette does. */}
          <Link
            className="inline-block rounded-full border border-current px-6 py-2 font-mono text-label-caps transition-colors duration-200 ease-out hover:bg-on-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            to="/"
          >
            BACK TO HOME
          </Link>
        </div>
      </div>
    </main>
  )
}
