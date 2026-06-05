import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ErgebnisOverview } from '../components/dashboard/ErgebnisOverview';
import { useSteuer } from '../store/SteuerContext';

export default function ErgebnisPage() {
  const navigate = useNavigate();
  const { state } = useSteuer();

  return (
    <div className="min-h-screen">
      <AppHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">Ergebnis {state.eingabe.jahr}</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
        </div>
      </AppHeader>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <ErgebnisOverview />
      </main>
    </div>
  );
}
