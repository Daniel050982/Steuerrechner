import type { ReactNode } from 'react';

export function AppHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {children}
      </div>
    </header>
  );
}
