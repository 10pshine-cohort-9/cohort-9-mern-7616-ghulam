# Notes App

A full-stack MERN notes application. Authenticated users can create, edit and delete
their own rich-text notes, with search, filtering and an archive/trash lifecycle. Every
note is private to the account that created it.

Built for the 10Pearls Cohort 9 MERN assignment.

## Status

The frontend was built first as a working prototype. It runs standalone against a
local storage adapter, so the whole interface is usable before the API exists. The
backend replaces that adapter behind the same interfaces, without the UI changing.

`/backend` now holds the Express server: configuration, logging, the MongoDB connection,
the shared error handling, and a health route. The authentication and notes endpoints
land on top of it, and the frontend keeps using the local adapter until they do.

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
backend/
  src/
    config/             environment parsing and the database connection
    controllers/        HTTP handling only: parse, delegate, respond
    lib/                the logger, the typed error, framework-free helpers
    middleware/         cross-cutting request handling
    routes/             the route table
    server.ts           connects, listens, shuts down cleanly
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
