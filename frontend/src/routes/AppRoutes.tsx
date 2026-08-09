import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Dashboard } from '../pages/Dashboard'
import { NotFound } from '../pages/NotFound'
import { SignIn } from '../pages/SignIn'
import { SignUp } from '../pages/SignUp'
import { ProtectedRoute } from './ProtectedRoute'

/*
 * Stand-in for the screens Tasks 5 and 6 build. Every path in the spec is
 * registered now so the shell, the route guard and the active-nav state can be
 * exercised against real navigation instead of being taken on trust; each use
 * of this is replaced as its page lands.
 */
function Placeholder({ title }: { title: string }) {
  return <h1 className="text-headline-lg text-primary">{title}</h1>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SignIn />} path="/signin" />
      <Route element={<SignUp />} path="/signup" />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<Dashboard />} index />
          <Route element={<Placeholder title="Favourites" />} path="favourites" />
          <Route element={<Placeholder title="Archived" />} path="archived" />
          <Route element={<Placeholder title="Trash" />} path="trash" />
          <Route element={<Placeholder title="New note" />} path="notes/new" />
          <Route element={<Placeholder title="Note" />} path="notes/:id" />
          <Route element={<Placeholder title="Profile" />} path="profile" />
        </Route>
      </Route>

      <Route element={<NotFound />} path="*" />
    </Routes>
  )
}
