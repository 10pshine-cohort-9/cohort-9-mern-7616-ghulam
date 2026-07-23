import { useAuth } from '../context/AuthContext.tsx';
import { LogOut } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">
            <span className="text-primary-500">Notes</span>App
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-surface-700
                         text-text-muted hover:text-text-primary
                         transition-colors duration-150"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Placeholder */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-text-muted text-center max-w-md">
            Your dashboard is ready. Notes features will be added in Phase 2.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
