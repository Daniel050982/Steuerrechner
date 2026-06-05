import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Landmark, Plus, Trash2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/ui/Card';
import { EditableField } from '../components/ui/EditableField';
import { useDaten } from '../store/DatenContext';
import type { BankEintrag } from '../data/banken';
import { euro } from '../utils/format';
import { TOOLTIPS_BANKEN as TB } from '../data/tooltips';

const ALLE_JAHRE_DEFAULT = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

function TypBadge({ typ }: { typ: BankEintrag['typ'] }) {
  const styles: Record<string, string> = {
    Einzel: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'Gemeinschaft 50%': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Krypto: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Ignorieren: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[typ] || styles.Einzel}`}>
      {typ}
    </span>
  );
}

function EditableBankCard({
  eintrag,
  globalIndex,
  onUpdate,
  onDelete,
}: {
  eintrag: BankEintrag;
  globalIndex: number;
  onUpdate: (index: number, data: Partial<BankEintrag>) => void;
  onDelete: (index: number) => void;
}) {
  const hatKrypto = eintrag.typ === 'Krypto';
  const u = (field: keyof BankEintrag, value: number) => onUpdate(globalIndex, { [field]: value });

  return (
    <div className="bg-white/95 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/70">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-200">{eintrag.bank}</span>
        <div className="flex items-center gap-2">
          <TypBadge typ={eintrag.typ} />
          <button
            onClick={() => onDelete(globalIndex)}
            className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Eintrag löschen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-0">
        {!hatKrypto && (
          <>
            <EditableField label="Kapitalerträge" value={eintrag.kapitalertraege} onChange={(v) => u('kapitalertraege', v)} tooltip={TB.kapitalertraege} />
            <EditableField label="Sparer-Pauschbetrag" value={eintrag.sparer_pauschbetrag} onChange={(v) => u('sparer_pauschbetrag', v)} tooltip={TB.sparer_pauschbetrag} />
            <EditableField label="KapESt" value={eintrag.kapitalertragsteuer} onChange={(v) => u('kapitalertragsteuer', v)} tooltip={TB.kapitalertragsteuer} />
            <EditableField label="Soli" value={eintrag.soli_kapital} onChange={(v) => u('soli_kapital', v)} />
            <EditableField label="Kirchensteuer" value={eintrag.kirchensteuer} onChange={(v) => u('kirchensteuer', v)} />
            {(eintrag.invstg_56 > 0 || eintrag.fiktiv_zugeflossen > 0) && (
              <>
                <EditableField label="§56 InvStG" value={eintrag.invstg_56} onChange={(v) => u('invstg_56', v)} tooltip={TB.invstg_56} />
                <EditableField label="Fiktiv zugeflossen" value={eintrag.fiktiv_zugeflossen} onChange={(v) => u('fiktiv_zugeflossen', v)} />
              </>
            )}
          </>
        )}

        {hatKrypto && (
          <>
            <EditableField label="§23 Veräußerung" value={eintrag.estg_23} onChange={(v) => u('estg_23', v)} tooltip={TB.estg_23_banken} />
            <EditableField label="§22 Staking/Airdrops" value={eintrag.estg_22} onChange={(v) => u('estg_22', v)} tooltip={TB.estg_22_banken} />
            <EditableField label="§20 Termingeschäfte" value={eintrag.estg_20} onChange={(v) => u('estg_20', v)} tooltip={TB.estg_20_banken} />
            <EditableField label="Broker-Verluste" value={eintrag.broker_verluste} onChange={(v) => u('broker_verluste', v)} />
          </>
        )}
      </div>
    </div>
  );
}

const EMPTY_BANK: Omit<BankEintrag, 'bank' | 'typ' | 'jahr'> = {
  kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0,
  sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0,
  estg_20: 0, estg_23: 0, estg_22: 0, notiz: '',
};

export default function BankenPage() {
  const [searchParams] = useSearchParams();
  const jahrParam = searchParams.get('jahr');
  const { state, updateBank, addBank, deleteBank } = useDaten();

  const alleJahre = [...new Set(state.banken.map((b) => b.jahr))].sort((a, b) => b - a);
  const jahre = alleJahre.length ? alleJahre : ALLE_JAHRE_DEFAULT;
  const [selectedJahr, setSelectedJahr] = useState<number>(
    jahrParam ? Number(jahrParam) : jahre[0]
  );

  // Find entries for this year with their global indices
  const eintraegeWithIndex = state.banken
    .map((b, i) => ({ eintrag: b, index: i }))
    .filter(({ eintrag }) => eintrag.jahr === selectedJahr);

  // Summen
  const sumKapErtr = eintraegeWithIndex
    .filter(({ eintrag }) => eintrag.typ !== 'Ignorieren' && eintrag.typ !== 'Krypto')
    .reduce((s, { eintrag }) => s + eintrag.kapitalertraege, 0);
  const sumKapESt = eintraegeWithIndex
    .filter(({ eintrag }) => eintrag.typ !== 'Ignorieren')
    .reduce((s, { eintrag }) => s + eintrag.kapitalertragsteuer, 0);
  const sumKrypto23 = eintraegeWithIndex
    .filter(({ eintrag }) => eintrag.typ === 'Krypto')
    .reduce((s, { eintrag }) => s + eintrag.estg_23, 0);
  const sumKrypto22 = eintraegeWithIndex
    .filter(({ eintrag }) => eintrag.typ === 'Krypto')
    .reduce((s, { eintrag }) => s + eintrag.estg_22, 0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBank, setNewBank] = useState('');
  const [newTyp, setNewTyp] = useState<BankEintrag['typ']>('Einzel');

  const handleAdd = () => {
    if (!newBank.trim()) return;
    addBank({ ...EMPTY_BANK, bank: newBank.trim(), typ: newTyp, jahr: selectedJahr });
    setNewBank('');
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen">
      <AppHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">Banken & Broker</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedJahr}
              onChange={(e) => setSelectedJahr(Number(e.target.value))}
              className="rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              {jahre.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Bank
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              Übersicht
            </Link>
          </div>
        </div>
      </AppHeader>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
        {/* Summen-Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">Kapitalerträge</p>
            <p className="text-lg font-bold text-slate-100">{euro(sumKapErtr)}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">KapESt gezahlt</p>
            <p className="text-lg font-bold text-slate-100">{euro(sumKapESt)}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">§23 Krypto</p>
            <p className={`text-lg font-bold ${sumKrypto23 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {euro(sumKrypto23)}
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">§22 Staking</p>
            <p className="text-lg font-bold text-emerald-400">{euro(sumKrypto22)}</p>
          </div>
        </div>

        {/* Neue Bank hinzufügen */}
        {showAddForm && (
          <Card>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-1">Bankname</label>
                <input
                  type="text"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="z.B. Trade Republic"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Typ</label>
                <select
                  value={newTyp}
                  onChange={(e) => setNewTyp(e.target.value as BankEintrag['typ'])}
                  className="rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Einzel">Einzel</option>
                  <option value="Gemeinschaft 50%">Gemeinschaft 50%</option>
                  <option value="Krypto">Krypto</option>
                  <option value="Ignorieren">Ignorieren</option>
                </select>
              </div>
              <button
                onClick={handleAdd}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition"
              >
                Hinzufügen
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 border border-slate-600 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition"
              >
                Abbrechen
              </button>
            </div>
          </Card>
        )}

        {/* Bank-Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {eintraegeWithIndex.map(({ eintrag, index }) => (
            <EditableBankCard
              key={`${eintrag.bank}-${index}`}
              eintrag={eintrag}
              globalIndex={index}
              onUpdate={updateBank}
              onDelete={deleteBank}
            />
          ))}
        </div>

        {eintraegeWithIndex.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-slate-500 text-sm">Keine Bankdaten für {selectedJahr} vorhanden.</p>
          </Card>
        )}
      </main>
    </div>
  );
}
