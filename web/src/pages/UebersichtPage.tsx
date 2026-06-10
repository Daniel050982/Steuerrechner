import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, TrendingDown, ArrowRight, Upload, Landmark, Plus, GitCompareArrows } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PdfUpload } from '../components/PdfUpload';
import { useDaten } from '../store/DatenContext';
import { euro, prozent } from '../utils/format';
import type { HistorischesErgebnis } from '../data/ergebnisse';

const JAHRE = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

function JahresCard({ jahr, e }: { jahr: number; e: HistorischesErgebnis }) {
  if (!e) return null;

  const erstattung = e.erstattung_nachzahlung > 0;
  const hatBescheid = e.abweichung_bescheid !== null;

  return (
    <Link
      to={`/jahr/${jahr}`}
      className="block bg-white/95 dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/70 backdrop-blur-sm p-5 hover:border-emerald-500/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-100">{jahr}</h3>
        <div className="flex items-center gap-2">
          {hatBescheid && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Bescheid
            </span>
          )}
          {!hatBescheid && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Offen
            </span>
          )}
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-500">Brutto</p>
          <p className="text-sm font-semibold text-slate-200">{euro(e.bruttogehalt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">zvE</p>
          <p className="text-sm font-semibold text-slate-200">{euro(e.zvE_inland)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Steuerlast</p>
          <p className="text-sm font-semibold text-slate-200">{euro(e.steuerlast_gesamt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Eff. Steuersatz</p>
          <p className="text-sm font-semibold text-slate-200">{prozent(e.effektiver_steuersatz)}</p>
        </div>
      </div>

      <div className={`flex items-center gap-1.5 pt-3 border-t border-slate-700/40 ${erstattung ? 'text-emerald-400' : 'text-red-400'}`}>
        {erstattung ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="text-sm font-bold">{euro(Math.abs(e.erstattung_nachzahlung))}</span>
        <span className="text-xs text-slate-500 ml-1">{erstattung ? 'Erstattung' : 'Nachzahlung'}</span>
      </div>
    </Link>
  );
}

export default function UebersichtPage() {
  const { state, loading } = useDaten();
  const [showUpload, setShowUpload] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">Lade Daten...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">Steuerrechner</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">PDF Import</span>
            </button>
            <Link
              to="/vergleich"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
            >
              <GitCompareArrows className="w-4 h-4" />
              <span className="hidden sm:inline">Vergleich</span>
            </Link>
            <Link
              to="/banken"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
            >
              <Landmark className="w-4 h-4" />
              <span className="hidden sm:inline">Banken</span>
            </Link>
            <Link
              to="/rechner"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Neue Berechnung</span>
            </Link>
          </div>
        </div>
      </AppHeader>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {JAHRE.map((jahr) => {
            const e = state.ergebnisse[jahr];
            return e ? <JahresCard key={jahr} jahr={jahr} e={e} /> : null;
          })}
        </div>
      </main>

      {showUpload && <PdfUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
}
