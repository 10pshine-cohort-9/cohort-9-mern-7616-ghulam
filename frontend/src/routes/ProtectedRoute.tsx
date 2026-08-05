import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  /*
   * Nothing renders while the session is being restored. Treating "not loaded
   * yet" as "signed out" would bounce a logged-in user to /signin on every
   * refresh, and they would watch it happen.
   */
  if (isLoading) return null

  if (user === null) return <Navigate replace to="/signin" />

  return <Outlet />
}
