# Notes App

A full-stack MERN notes application. Authenticated users can create, edit and delete
their own rich-text notes, with search, filtering and an archive/trash lifecycle. Every
note is private to the account that created it.

Built for the 10Pearls Cohort 9 MERN assignment.

## Status

The frontend was built first as a working prototype. It ran standalone against a
local storage adapter, so the whole interface was usable before the API existed. The
backend then replaced that adapter behind the same interfaces, and no component or page
changed in the swap.

`/backend` holds the Express server: configuration, logging, the MongoDB connection, the
shared error handling, a health route, and the authentication and notes endpoints. The
local storage adapter has been removed — the app now talks to the API over HTTP.

## Tech stack

Frontend is React 19 with TypeScript, built by Vite, and styled with Tailwind CSS v4.
Rich-text editing uses TipTap. The backend is Node and Express 5 with TypeScript, over
MongoDB via Mongoose, with Pino logging and JWT authentication to follow.

## Requirements

- Node.js 20.19+ or 22.12+ (developed on 24)
- npm 10 or newer
- MongoDB running locally, listening on 27017

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on http://localhost:5173.

Other scripts:

```bash
npm run build     # type-check and produce a production build in dist/
npm run lint      # oxlint
npm run preview   # serve the production build locally
```

## Running the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API starts on http://localhost:5000. `GET /api/health` reports process uptime and the
MongoDB connection state, and is the quickest way to tell a configuration problem from a
database problem. The server connects to MongoDB before it opens the port, so it exits
rather than accepting requests it cannot serve.

`.env` is ignored by git. `.env.example` lists every variable the server reads; copy it
and adjust rather than inventing names.

Other scripts:

```bash
npm run build      # compile TypeScript to dist/
npm run start      # run the compiled server
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit
```

## Testing and code quality

The backend is tested with Mocha and Chai. Service tests cover the rules that are invisible
at the HTTP edge, and `supertest` route tests cover the controllers, the auth middleware and
the error middleware. Every suite runs against an in-memory MongoDB, so no test touches a
real database and the suites need no setup beyond `npm install`.

```bash
cd backend
npm test            # 130 assertions
npm run test:coverage
```

The frontend is tested with Jest and React Testing Library under jsdom, covering the
helpers, the HTTP client and both service adapters, the interface primitives, the note
components, the auth pages, the contexts, the route guard and the hooks, the four
route-level list screens, the profile screen and the app shell.

```bash
cd frontend
npm test            # 210 assertions
npm run test:coverage
```

Both commands write `coverage/lcov.info` inside their own workspace. `coverage/` is ignored
by git.

### SonarQube

`sonar-project.properties` at the repository root points a single analysis at both
workspaces and reads both LCOV reports. Generate the coverage first, then scan — the
scanner does not run the tests:

```bash
cd backend && npm run test:coverage && cd ..
cd frontend && npm run test:coverage && cd ..
npx sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=<your-token>
```

`sonar.coverage.exclusions` covers the composition root, the database connection and the
logger on the backend, and the Vite entry point and the TipTap editor components on the
frontend. The editor is excluded because TipTap requires a real browser layout engine and
cannot be driven in jsdom, not because it scored badly.

`frontend/src` appears in both `sonar.sources` and `sonar.tests`, because the Jest suites sit
in `__tests__` folders beside the code they cover. `sonar.test.inclusions` classifies those
files as tests and `sonar.exclusions` removes them from the main sources, so the two sets stay
disjoint — without that the scanner refuses to index a file twice and the analysis fails.

#### Results of the first analysis

| Metric | Value |
|---|---|
| Quality gate | Passed |
| Coverage | 86.1% (89.1% line, 79.2% branch) |
| Lines of code | 3,859 |
| Vulnerabilities | 0 |
| Security hotspots | 0 |
| Duplication | 0.9% |
| Code smells | 52 (maintainability A) |
| Issues typed as bugs | 15 |

The 15 bug-typed issues were each checked against the source and none is a defect. Thirteen are
`css:S8776` "missing scoping root", raised on the nested `&` selectors inside the
`@utility prose-aether` block in `index.css` — the analyzer does not recognise Tailwind v4's
`@utility` at-rule as a scoping root. The remaining two are `typescript:S1082`, raised on the
backdrop-click handlers of the two native `<dialog>` elements; both dismiss on Escape through
the element's own `cancel` event, so the keyboard path exists and is simply not an
`onKeyDown` on the same node. They are recorded here rather than silenced in configuration.

## Project structure

```text
frontend/
  public/               static assets served as-is
  src/
    components/layout/  the app shell: sidebar, top bar, theme toggle
    components/ui/      reusable interface primitives
    context/            React context providers
    hooks/              shared React hooks
    lib/                framework-free helpers
    pages/              route-level screens
    routes/             the route table and the auth guard
    services/           data access behind swappable adapters
    types/              shared domain types
    index.css           design tokens and base styles
    **/__tests__/       Jest suites, beside the code they cover
  test/                 shared test mocks
backend/
  src/
    config/             environment parsing and the database connection
    controllers/        HTTP handling only: parse, delegate, respond
    lib/                the logger, the typed error, framework-free helpers
    middleware/         cross-cutting request handling
    models/             the Mongoose schemas
    routes/             the route table
    services/           the business rules, independent of HTTP
    server.ts           connects, listens, shuts down cleanly
  test/                 Mocha suites and the in-memory database harness
sonar-project.properties  one analysis across both workspaces
```

More directories are added as features land. The layout follows the branching strategy's
requirement of `/frontend` and `/backend` at the repository root.

## Design

The interface follows a two-palette design system: a light theme and a dark theme, both
defined as CSS custom properties in `frontend/src/index.css` and exposed to Tailwind
through `@theme inline`. Switching themes is a class change on the root element, so no
component needs to know which theme is active. Until the user picks a theme the app
follows the operating system; after that the choice is remembered. A small script in
`index.html` applies it before the first paint, so a dark-theme user never sees a frame
of the light palette.

Typography is Hanken Grotesk for text and JetBrains Mono for metadata labels. Both fonts
are self-hosted rather than loaded from a CDN. Icons come from Material Symbols as
individual SVGs, so only the icons actually used are bundled.

## Branching

Work happens on `feature/frontend/<name>` and `feature/backend/<name>` branches cut from
`develop`. Pull requests target `develop`. `main` holds production-ready code.
