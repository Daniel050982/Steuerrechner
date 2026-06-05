import { useNavigate } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { SelectInput } from '../components/ui/SelectInput';
import { Toggle } from '../components/ui/Toggle';
import { EinkommenSection } from '../components/inputs/EinkommenSection';
import { VorsorgeSection } from '../components/inputs/VorsorgeSection';
import { WerbungskostenSection } from '../components/inputs/WerbungskostenSection';
import { KapitalSection } from '../components/inputs/KapitalSection';
import { SonstigesSection } from '../components/inputs/SonstigesSection';
import { useSteuer } from '../store/SteuerContext';
import { VERFUEGBARE_JAHRE } from '../core/config';
import type { Steuerjahr } from '../types/steuer';

export default function RechnerPage() {
  const { state, setJahr, setField, berechnen } = useSteuer();
  const navigate = useNavigate();

  const handleBerechnen = () => {
    berechnen();
    navigate('/ergebnis');
  };

  return (
    <div className="min-h-screen">
      <AppHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">Steuerrechner</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-28">
              <SelectInput
                label=""
                value={state.eingabe.jahr}
                onChange={(v) => setJahr(Number(v) as Steuerjahr)}
                options={VERFUEGBARE_JAHRE.map((j) => ({ value: j, label: String(j) }))}
              />
            </div>
            <Toggle
              label="Verheiratet"
              checked={state.eingabe.verheiratet}
              onChange={(v) => setField('verheiratet', v)}
            />
          </div>
        </div>
      </AppHeader>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
        <EinkommenSection />
        <VorsorgeSection />
        <WerbungskostenSection />
        <KapitalSection />
        <SonstigesSection />

        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={handleBerechnen}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:shadow-emerald-800/40 active:scale-[0.98]"
          >
            Berechnen
          </button>
        </div>
      </main>
    </div>
  );
}
