import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Archived } from '../pages/Archived'
import { Dashboard } from '../pages/Dashboard'
import { Favourites } from '../pages/Favourites'
import { NotFound } from '../pages/NotFound'
import { NoteEditorPage } from '../pages/NoteEditorPage'
import { Profile } from '../pages/Profile'
import { SignIn } from '../pages/SignIn'
import { SignUp } from '../pages/SignUp'
import { Trash } from '../pages/Trash'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SignIn />} path="/signin" />
      <Route element={<SignUp />} path="/signup" />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<Dashboard />} index />
          <Route element={<Favourites />} path="favourites" />
          <Route element={<Archived />} path="archived" />
          <Route element={<Trash />} path="trash" />
          <Route element={<NoteEditorPage />} path="notes/new" />
          <Route element={<NoteEditorPage />} path="notes/:id" />
          <Route element={<Profile />} path="profile" />
        </Route>
      </Route>

      <Route element={<NotFound />} path="*" />
    </Routes>
  )
}
