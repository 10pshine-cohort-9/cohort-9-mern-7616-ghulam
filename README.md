# Notes App

A full-stack MERN notes application. Authenticated users can create, edit and delete
their own rich-text notes, with search, filtering and an archive/trash lifecycle. Every
note is private to the account that created it.

Built for the 10Pearls Cohort 9 MERN assignment.

## Status

The frontend is being built first as a working prototype. It runs standalone against a
local storage adapter, so the whole interface is usable before the API exists. The
backend replaces that adapter behind the same interfaces, without the UI changing.

The `/backend` folder does not exist yet.

## Tech stack

Frontend is React 19 with TypeScript, built by Vite, styled with Tailwind CSS v4, and
using TipTap for rich-text editing. Backend will be Node and Express with TypeScript,
over MongoDB via Mongoose, with JWT authentication and Pino logging.

## Requirements

- Node.js 20.19+ or 22.12+ (developed on 24)
- npm 10 or newer
- MongoDB running locally (backend only, not needed yet)

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

## Project structure

```
frontend/
  public/           static assets served as-is
  src/
    lib/            small pure helpers
    index.css       design tokens and base styles
```

More directories are added as features land. The layout follows the branching strategy's
requirement of `/frontend` and `/backend` at the repository root.

## Design

The interface follows a two-palette design system: a light theme and a dark theme, both
defined as CSS custom properties in `frontend/src/index.css` and exposed to Tailwind
through `@theme inline`. Switching themes is a class change on the root element, so no
component needs to know which theme is active.

Typography is Hanken Grotesk for text and JetBrains Mono for metadata labels. Both fonts
are self-hosted rather than loaded from a CDN. Icons come from Material Symbols as
individual SVGs, so only the icons actually used are bundled.

## Branching

Work happens on `feature/frontend/<name>` and `feature/backend/<name>` branches cut from
`develop`. Pull requests target `develop`. `main` holds production-ready code.
