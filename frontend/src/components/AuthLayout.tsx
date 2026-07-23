import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-400/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="text-primary-500">Notes</span>App
          </h1>
          <p className="text-text-muted text-sm mt-1">Organize your thoughts</p>
        </div>

        {/* Card */}
        <div className="bg-surface-800/80 backdrop-blur-xl border border-surface-700 rounded-2xl p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
