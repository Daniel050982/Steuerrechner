import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, Landmark } from 'lucide-react';
import { AppHeader } from './AppHeader';

type Tab = 'steuerdaten' | 'bescheid' | 'vergleich';

interface JahrNavigationProps {
  jahr: number;
  onPdfImport?: () => void;
}

export function JahrNavigation({ jahr, onPdfImport }: JahrNavigationProps) {
  const { pathname } = useLocation();

  const currentTab: Tab = pathname.includes('/vergleich')
    ? 'vergleich'
    : pathname.includes('/bescheid')
      ? 'bescheid'
      : 'steuerdaten';

  const tabs: { key: Tab; label: string; to: string }[] = [
    { key: 'steuerdaten', label: 'Steuerdaten', to: `/jahr/${jahr}` },
    { key: 'bescheid', label: 'Bescheid', to: `/jahr/${jahr}/bescheid` },
    { key: 'vergleich', label: 'Vergleich', to: `/jahr/${jahr}/vergleich` },
  ];

  return (
    <AppHeader>
      <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
        <h1 className="text-lg font-bold text-slate-100">{jahr}</h1>
        <div className="flex items-center gap-2">
          {onPdfImport && (
            <button
              onClick={onPdfImport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
              title="PDF Import"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">PDF Import</span>
            </button>
          )}
          <Link
            to={`/banken?jahr=${jahr}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
            title="Banken"
          >
            <Landmark className="w-4 h-4" />
            <span className="hidden sm:inline">Banken</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
            title="Übersicht"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Übersicht</span>
          </Link>
        </div>
      </div>

      {/* Tab-Leiste */}
      <div className="flex gap-1 mt-2 -mb-[11px] sm:-mb-[13px]">
        {tabs.map((tab) => {
          const active = tab.key === currentTab;
          return (
            <Link
              key={tab.key}
              to={tab.to}
              className={`px-3 py-1.5 rounded-t-lg text-sm font-medium transition border-b-2 ${
                active
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-900/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </AppHeader>
  );
}
