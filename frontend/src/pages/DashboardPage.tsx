import { Sparkles, LogOut, NotebookPen, Plus } from 'lucide-react';

import { useAuth } from '../context/AuthContext.tsx';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  // Initials for the avatar badge
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="aether-bg min-h-screen">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 glass-card-elevated rounded-none border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-primary tracking-tight">Aether Notes</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 glass-card rounded-full pl-1 pr-4 py-1">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="text-xs font-semibold text-on-surface hidden sm:block">{user?.name}</span>
            </div>

            <button
              onClick={logout}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        <div className="border-b border-glass-stroke pb-6">
          <p className="text-label-caps text-muted-green mb-1.5">DASHBOARD</p>
          <h2 className="text-3xl font-bold text-primary tracking-[-0.02em]">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
        </div>

        {/* Empty state */}
        <div className="glass-card rounded-[24px] p-10 sm:p-14 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container/50 border border-secondary-fixed flex items-center justify-center mb-6 shadow-sm">
            <NotebookPen className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold text-primary mb-3">Your workspace is ready</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mb-8 leading-relaxed">
            Start creating notes to capture your ideas. Pin important ones, organize with tags, and find anything instantly.
          </p>
          <button className="btn-primary max-w-[240px] py-3 flex items-center justify-center gap-2 text-sm shadow-md">
            <Plus className="w-4 h-4" />
            Create your first note
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
