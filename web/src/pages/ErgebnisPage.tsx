import { Link } from 'react-router-dom';
import { Calculator, Home, ArrowLeft } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ErgebnisOverview } from '../components/dashboard/ErgebnisOverview';
import { useSteuer } from '../store/SteuerContext';

export default function ErgebnisPage() {
  const { state } = useSteuer();

  return (
    <div className="min-h-screen">
      <AppHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">Ergebnis {state.eingabe.jahr}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/rechner"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              Eingaben
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
      </AppHeader>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <ErgebnisOverview />
      </main>
    </div>
  );
}
