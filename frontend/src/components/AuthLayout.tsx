import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  /** Heading text displayed on the auth card */
  title: string;
  /** Subheading text below the title */
  subtitle: string;
}

/**
 * AuthLayout — Aether Notes split-screen auth layout.
 * Left column: brand + headline (desktop only). Right column: glass auth card.
 */
const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <main className="aether-bg min-h-screen flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto">
      {/* ── Left Column: Brand (Desktop Only) ── */}
      <section className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 xl:p-16 min-h-screen">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-primary tracking-tight">Aether Notes</span>
        </div>

        <div className="max-w-[480px] my-auto py-12">
          <h1 className="text-4xl xl:text-5xl font-bold text-primary leading-[1.12] tracking-[-0.03em]">
            Capture ideas before they disappear.
          </h1>
          <p className="text-body-lg text-on-surface-variant mt-6">
            A calm, focused space for your notes.
          </p>
        </div>

        <div className="text-label-caps text-[11px] text-on-surface-variant opacity-50">
          AETHER NOTES
        </div>
      </section>

      {/* ── Right Column: Auth Card ── */}
      <section className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 relative z-20">
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold text-primary tracking-tight">Aether</span>
        </div>

        <div className="glass-card w-full max-w-[420px] rounded-[24px] px-7 py-8 sm:px-9 sm:py-9 animate-fade-in flex flex-col my-auto shadow-xl">
          <div className="mb-5">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary tracking-[-0.02em]">{title}</h2>
            <p className="text-on-surface-variant text-sm mt-1.5 leading-normal">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
