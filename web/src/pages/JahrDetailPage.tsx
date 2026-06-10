import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { JahrNavigation } from '../components/JahrNavigation';
import { Card } from '../components/ui/Card';
import { EditableField } from '../components/ui/EditableField';
import { PdfUpload } from '../components/PdfUpload';
import { useDaten } from '../store/DatenContext';
import type { DetailPosten, LStBEintrag } from '../data/steuerdaten';
import { euro, prozent } from '../utils/format';
import { TOOLTIPS_STEUERDATEN as TS, TOOLTIPS_ERGEBNIS as TE } from '../data/tooltips';
import { getConfig } from '../core/config';

function ReadOnlyRow({ label, value, bold, indent, color }: {
  label: string;
  value: string;
  bold?: boolean;
  indent?: boolean;
  color?: 'green' | 'red' | 'blue';
}) {
  const colorClass = color === 'green' ? 'text-emerald-400'
    : color === 'red' ? 'text-red-400'
    : color === 'blue' ? 'text-blue-400'
    : 'text-slate-200';

  return (
    <div className={`flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0 ${indent ? 'pl-4' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>{label}</span>
      <span className={`flex items-center gap-1.5 text-sm font-medium ${bold ? 'font-bold' : ''} ${colorClass}`}>
        {value}
        <span className="w-3 h-3 invisible" />
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card title={title}>
      <div className="space-y-0">{children}</div>
    </Card>
  );
}

function DetailZeile({ posten, placeholder, onChangeName, onChangeBetrag, onDelete }: {
  posten: DetailPosten;
  placeholder?: string;
  onChangeName: (name: string) => void;
  onChangeBetrag: (betrag: number) => void;
  onDelete: () => void;
}) {
  const [editingBetrag, setEditingBetrag] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(String(posten.betrag || ''));
    setEditingBetrag(true);
  };
  const confirmEdit = () => {
    const parsed = parseFloat(draft.replace(/\./g, '').replace(',', '.')) || 0;
    onChangeBetrag(parsed);
    setEditingBetrag(false);
  };

  return (
    <div className="flex items-center gap-1.5 pl-4 py-1.5 border-b border-slate-700/30">
      <input
        type="text"
        value={posten.name}
        onChange={(e) => onChangeName(e.target.value)}
        placeholder={placeholder ?? "Bezeichnung"}
        className="flex-1 min-w-0 rounded-lg bg-transparent border-none px-0 py-0 text-sm text-slate-400 placeholder:text-slate-600 focus:outline-none focus:ring-0"
      />
      {editingBetrag ? (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={confirmEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmEdit();
            if (e.key === 'Escape') setEditingBetrag(false);
          }}
          className="w-24 text-right rounded-lg border border-emerald-500 bg-slate-800 px-2 py-0.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      ) : (
        <button type="button" onClick={startEdit} className="text-sm text-slate-200 hover:text-emerald-400 transition">
          {euro(posten.betrag)}
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-700 transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function LStBDetailZeile({ eintrag, onUpdate, onDelete }: {
  eintrag: LStBEintrag;
  onUpdate: (updated: LStBEintrag) => void;
  onDelete: () => void;
}) {
  const [editField, setEditField] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (field: string, value: number) => {
    setDraft(String(value || ''));
    setEditField(field);
  };
  const confirmEdit = (field: keyof LStBEintrag) => {
    const parsed = parseFloat(draft.replace(/\./g, '').replace(',', '.')) || 0;
    onUpdate({ ...eintrag, [field]: parsed });
    setEditField(null);
  };

  const fields: { key: keyof LStBEintrag; label: string }[] = [
    { key: 'rv_an', label: 'RV AN' },
    { key: 'rv_ag', label: 'RV AG' },
    { key: 'kv_an', label: 'KV AN' },
    { key: 'kv_regulaer', label: 'KV reg.' },
    { key: 'pv_an', label: 'PV AN' },
  ];

  return (
    <div className="ml-4 mb-2 rounded-lg bg-slate-800/40 border border-slate-700/40 p-2.5">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={eintrag.name}
          onChange={(e) => onUpdate({ ...eintrag, name: e.target.value })}
          placeholder="Arbeitgeber / LStB"
          className="flex-1 min-w-0 rounded bg-transparent border-none px-0 py-0 text-sm font-medium text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-slate-700 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {fields.map(({ key, label }) => (
          <div key={key} className="text-center">
            <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
            {editField === key ? (
              <input
                autoFocus
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => confirmEdit(key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEdit(key);
                  if (e.key === 'Escape') setEditField(null);
                }}
                className="w-full text-center rounded border border-emerald-500 bg-slate-800 px-1 py-0.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            ) : (
              <button
                type="button"
                onClick={() => startEdit(key, eintrag[key] as number)}
                className="w-full text-center text-xs text-slate-300 hover:text-emerald-400 transition rounded px-1 py-0.5 hover:bg-slate-700/50"
              >
                {euro(eintrag[key] as number)}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JahrDetailPage() {
  const { jahr: jahrStr } = useParams();
  const jahr = Number(jahrStr);
  const { state, updateSteuerdaten, updateErgebnis } = useDaten();
  const e = state.ergebnisse[jahr];
  const d = state.steuerdaten[jahr];
  const [showUpload, setShowUpload] = useState(false);

  if (!e || !d) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Keine Daten für {jahrStr}</p>
      </div>
    );
  }

  const erstattung = e.erstattung_nachzahlung > 0;
  const sd = (field: keyof typeof d, value: number) => updateSteuerdaten(jahr, { [field]: value });
  const se = (field: keyof typeof e, value: number) => updateErgebnis(jahr, { [field]: value });

  return (
    <div className="min-h-screen">
      <JahrNavigation jahr={jahr} onPdfImport={() => setShowUpload(true)} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
        {/* KPI-Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">zvE Inland</p>
            <p className="text-lg font-bold text-slate-100">{euro(e.zvE_inland)}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">Steuerlast</p>
            <p className="text-lg font-bold text-slate-100">{euro(e.steuerlast_gesamt)}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">{erstattung ? 'Erstattung' : 'Nachzahlung'}</p>
            <p className={`text-lg font-bold ${erstattung ? 'text-emerald-400' : 'text-red-400'}`}>
              {euro(Math.abs(e.erstattung_nachzahlung))}
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">Eff. Steuersatz</p>
            <p className="text-lg font-bold text-slate-100">{prozent(e.effektiver_steuersatz)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linke Spalte: Eingabedaten (editierbar) */}
          <div className="space-y-6">
            <Section title="Allgemein">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Verheiratet / Splitting</span>
                <button
                  type="button"
                  onClick={() => updateSteuerdaten(jahr, { verheiratet: !d.verheiratet })}
                  className={`px-3 py-0.5 rounded-full text-xs font-medium transition ${d.verheiratet ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}
                >
                  {d.verheiratet ? 'Ja' : 'Nein'}
                </button>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Krankenversicherung</span>
                <select
                  value={d.krankenversichert}
                  onChange={(ev) => updateSteuerdaten(jahr, { krankenversichert: ev.target.value as 'gesetzlich' | 'privat' })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="gesetzlich">Gesetzlich</option>
                  <option value="privat">Privat</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Günstigerprüfung (Kapital)</span>
                <button
                  type="button"
                  onClick={() => updateSteuerdaten(jahr, { guenstigerpruefung: !d.guenstigerpruefung })}
                  className={`px-3 py-0.5 rounded-full text-xs font-medium transition ${d.guenstigerpruefung ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}
                >
                  {d.guenstigerpruefung ? 'Ja' : 'Nein'}
                </button>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Verlustvorträge anwenden</span>
                <button
                  type="button"
                  onClick={() => updateSteuerdaten(jahr, { verlustvortraege_anwenden: !d.verlustvortraege_anwenden })}
                  className={`px-3 py-0.5 rounded-full text-xs font-medium transition ${d.verlustvortraege_anwenden ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}
                >
                  {d.verlustvortraege_anwenden ? 'Ja' : 'Nein'}
                </button>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
                <span className="text-sm text-slate-400">JStG 2024 (§20-Verluste)</span>
                <button
                  type="button"
                  onClick={() => updateSteuerdaten(jahr, { jstg_2024_anwenden: !d.jstg_2024_anwenden })}
                  className={`px-3 py-0.5 rounded-full text-xs font-medium transition ${d.jstg_2024_anwenden ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}
                >
                  {d.jstg_2024_anwenden ? 'Ja' : 'Nein'}
                </button>
              </div>
            </Section>

            <Section title="Lohn & Gehalt">
              <EditableField label="Bruttoarbeitslohn" value={d.bruttogehalt} onChange={(v) => sd('bruttogehalt', v)} tooltip={TS.bruttogehalt} />
              <EditableField label="Lohnsteuer" value={d.lohnsteuer} onChange={(v) => sd('lohnsteuer', v)} tooltip={TS.lohnsteuer} />
              <EditableField label="Soli Lohn" value={d.soli_lohn} onChange={(v) => sd('soli_lohn', v)} tooltip={TS.soli_lohn} />
              <EditableField label="Kirchensteuer Lohn" value={d.kirchensteuer_lohn} onChange={(v) => sd('kirchensteuer_lohn', v)} tooltip={TS.kirchensteuer_lohn} />
            </Section>

            <Section title="Kapitalerträge">
              <EditableField label="Kapitalerträge gesamt" value={d.kapitalertraege_gesamt} onChange={(v) => sd('kapitalertraege_gesamt', v)} tooltip={TS.kapitalertraege_gesamt} />
              <EditableField label="Sparer-Pauschbetrag" value={d.sparer_pauschbetrag} onChange={(v) => sd('sparer_pauschbetrag', v)} tooltip={TS.sparer_pauschbetrag} />
              <EditableField label="Abgeltungsteuer gezahlt" value={d.abgeltungsteuer_gezahlt} onChange={(v) => sd('abgeltungsteuer_gezahlt', v)} tooltip={TS.abgeltungsteuer_gezahlt} />
              <EditableField label="Soli Kapital gezahlt" value={d.soli_kapital_gezahlt} onChange={(v) => sd('soli_kapital_gezahlt', v)} tooltip={TS.soli_kapital_gezahlt} />
              <EditableField label="Kirchensteuer Kapital" value={d.kirchensteuer_kapital} onChange={(v) => sd('kirchensteuer_kapital', v)} tooltip={TS.kirchensteuer_kapital} />
            </Section>

            <Section title="Krypto-Einkünfte">
              <EditableField label="§23 Veräußerungsgeschäfte" value={d.estg_23} onChange={(v) => sd('estg_23', v)} tooltip={TS.estg_23} />
              <EditableField label="Verlustvortrag §23" value={d.verlustvortrag_23} onChange={(v) => sd('verlustvortrag_23', v)} tooltip={TS.verlustvortrag_23} />
              <EditableField label="§22 Sonstige Leistungen" value={d.estg_22} onChange={(v) => sd('estg_22', v)} tooltip={TS.estg_22} />
              <EditableField label="§20 Termingeschäfte" value={d.estg_20} onChange={(v) => sd('estg_20', v)} tooltip={TS.estg_20} />
              <EditableField label="Verlustvortrag §20" value={d.verlustvortrag_20} onChange={(v) => sd('verlustvortrag_20', v)} tooltip={TS.verlustvortrag_20} />
              <EditableField label="Steuern Krypto gezahlt" value={d.steuern_krypto_gezahlt} onChange={(v) => sd('steuern_krypto_gezahlt', v)} tooltip={TS.steuern_krypto_gezahlt} />
            </Section>

            <Section title="Sozialversicherung">
              {(() => {
                const lstbs = d.lstb_details ?? [];
                const hasMultiple = lstbs.length > 0;
                const updateLstb = (index: number, updated: LStBEintrag) => {
                  const details = [...lstbs];
                  details[index] = updated;
                  const rv_an = details.reduce((s, l) => s + l.rv_an, 0);
                  const rv_ag = details.reduce((s, l) => s + l.rv_ag, 0);
                  const kv_an = details.reduce((s, l) => s + l.kv_an, 0);
                  const kv_regulaer = details.reduce((s, l) => s + l.kv_regulaer, 0);
                  const pv_an = details.reduce((s, l) => s + l.pv_an, 0);
                  updateSteuerdaten(jahr, {
                    lstb_details: details,
                    rv_an, rv_ag,
                    kv_an_gesamt: kv_an, kv_an_regulaer: kv_regulaer,
                    pv_an,
                  });
                };
                const deleteLstb = (index: number) => {
                  const details = lstbs.filter((_, j) => j !== index);
                  if (details.length === 0) {
                    updateSteuerdaten(jahr, { lstb_details: undefined });
                    return;
                  }
                  const rv_an = details.reduce((s, l) => s + l.rv_an, 0);
                  const rv_ag = details.reduce((s, l) => s + l.rv_ag, 0);
                  const kv_an = details.reduce((s, l) => s + l.kv_an, 0);
                  const kv_regulaer = details.reduce((s, l) => s + l.kv_regulaer, 0);
                  const pv_an = details.reduce((s, l) => s + l.pv_an, 0);
                  updateSteuerdaten(jahr, {
                    lstb_details: details,
                    rv_an, rv_ag,
                    kv_an_gesamt: kv_an, kv_an_regulaer: kv_regulaer,
                    pv_an,
                  });
                };
                const addLstb = () => {
                  const newEntry: LStBEintrag = { name: '', rv_an: 0, rv_ag: 0, kv_an: 0, kv_regulaer: 0, pv_an: 0 };
                  if (lstbs.length === 0) {
                    const first: LStBEintrag = {
                      name: 'LStB 1',
                      rv_an: d.rv_an, rv_ag: d.rv_ag,
                      kv_an: d.kv_an_gesamt, kv_regulaer: d.kv_an_regulaer,
                      pv_an: d.pv_an,
                    };
                    updateSteuerdaten(jahr, { lstb_details: [first, { ...newEntry, name: 'LStB 2' }] });
                  } else {
                    updateSteuerdaten(jahr, { lstb_details: [...lstbs, { ...newEntry, name: `LStB ${lstbs.length + 1}` }] });
                  }
                };

                return (
                  <>
                    <EditableField label="RV-Beitrag AN" value={d.rv_an} onChange={(v) => sd('rv_an', v)} tooltip={TS.rv_an} readOnly={hasMultiple} />
                    <EditableField label="RV-Beitrag AG" value={d.rv_ag} onChange={(v) => sd('rv_ag', v)} tooltip={TS.rv_ag} readOnly={hasMultiple} />
                    {d.kv_an_gesamt !== d.kv_an_regulaer && d.kv_an_regulaer > 0 ? (
                      <>
                        <EditableField label="KV-Beitrag AN (gesamt)" value={d.kv_an_gesamt} onChange={(v) => sd('kv_an_gesamt', v)} tooltip={TS.kv_an_gesamt} readOnly={hasMultiple} />
                        <EditableField label="KV-Beitrag AN (regulär)" value={d.kv_an_regulaer} onChange={(v) => sd('kv_an_regulaer', v)} indent tooltip={TS.kv_an_regulaer} readOnly={hasMultiple} />
                      </>
                    ) : (
                      <EditableField label="KV-Beitrag AN" value={d.kv_an_regulaer} onChange={(v) => updateSteuerdaten(jahr, { kv_an_regulaer: v, kv_an_gesamt: v })} tooltip={TS.kv_an_regulaer} readOnly={hasMultiple} />
                    )}
                    <EditableField label="PV-Beitrag AN" value={d.pv_an} onChange={(v) => sd('pv_an', v)} tooltip={TS.pv_an} readOnly={hasMultiple} />

                    {hasMultiple && (
                      <div className="mt-1 mb-1">
                        <p className="text-[10px] text-slate-500 pl-4 mb-1">Mehrere LStBs — Werte werden pro LStB gerundet, dann summiert</p>
                      </div>
                    )}

                    {lstbs.map((entry, i) => (
                      <LStBDetailZeile
                        key={i}
                        eintrag={entry}
                        onUpdate={(updated) => updateLstb(i, updated)}
                        onDelete={() => deleteLstb(i)}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={addLstb}
                      className="flex items-center gap-1.5 pl-4 py-1.5 text-sm text-slate-500 hover:text-emerald-400 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      LStB hinzufügen (mehrere Arbeitgeber)
                    </button>
                  </>
                );
              })()}
              <EditableField label="Erstattete RV-Beiträge" value={d.erstattete_rv} onChange={(v) => sd('erstattete_rv', v)} tooltip={TS.erstattete_rv} />
              <EditableField label="Beitragsrückerstattung KV" value={d.beitragsrueckerstattung_kv} onChange={(v) => sd('beitragsrueckerstattung_kv', v)} tooltip={TS.beitragsrueckerstattung_kv} />
              <EditableField label="Weitere Versicherungen" value={d.weitere_versicherungen} onChange={(v) => sd('weitere_versicherungen', v)} tooltip={TS.weitere_versicherungen} readOnly={!!(d.versicherungen_details?.length)} />
              {(d.versicherungen_details ?? []).map((p, i) => (
                <DetailZeile
                  key={i}
                  posten={p}
                  placeholder="z.B. Haftpflicht"
                  onChangeName={(name) => {
                    const details = [...(d.versicherungen_details ?? [])];
                    details[i] = { ...details[i], name };
                    updateSteuerdaten(jahr, { versicherungen_details: details });
                  }}
                  onChangeBetrag={(betrag) => {
                    const details = [...(d.versicherungen_details ?? [])];
                    details[i] = { ...details[i], betrag };
                    const summe = details.reduce((s, d) => s + d.betrag, 0);
                    updateSteuerdaten(jahr, { versicherungen_details: details, weitere_versicherungen: summe });
                  }}
                  onDelete={() => {
                    const details = (d.versicherungen_details ?? []).filter((_, j) => j !== i);
                    const summe = details.reduce((s, d) => s + d.betrag, 0);
                    updateSteuerdaten(jahr, { versicherungen_details: details, weitere_versicherungen: summe });
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  const details: DetailPosten[] = [...(d.versicherungen_details ?? []), { name: '', betrag: 0 }];
                  updateSteuerdaten(jahr, { versicherungen_details: details });
                }}
                className="flex items-center gap-1.5 pl-4 py-1.5 text-sm text-slate-500 hover:text-emerald-400 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Versicherung hinzufügen
              </button>
              <EditableField label="Spenden" value={d.spenden} onChange={(v) => sd('spenden', v)} tooltip={TS.spenden} />
              {(() => {
                const cfg = getConfig(jahr);
                const erstatteteRV = d.erstattete_rv ?? 0;
                const beitragsrueckKV = d.beitragsrueckerstattung_kv ?? 0;
                const kvGerundet = Math.ceil(d.kv_an_gesamt);
                const kvKuerzBasis = d.kv_an_regulaer > 0 ? Math.ceil(d.kv_an_regulaer) : kvGerundet;
                const abziehbarePV = Math.ceil(d.pv_an);
                const gesamtRV = Math.round(Math.min(d.rv_an + d.rv_ag, cfg.max_vorsorge_rv));
                const agRV = Math.round(d.rv_ag);
                const kvKuerzung = Math.floor(kvKuerzBasis * cfg.krankengeld_kuerzung);
                const abziehbareKV = Math.max(0, kvGerundet - kvKuerzung - beitragsrueckKV);
                const vorsorge_basis = abziehbareKV + abziehbarePV;
                const hoechstbetragBasis = d.krankenversichert === 'privat' ? 2800 : 1900;
                const hoechstgrenze = d.verheiratet ? hoechstbetragBasis * 2 : hoechstbetragBasis;
                const spielraum = Math.max(0, hoechstgrenze - vorsorge_basis);
                const weitereVers = d.weitere_versicherungen + (d.auslands_sv ?? 0);
                const anrechenbar = vorsorge_basis < hoechstgrenze ? Math.min(weitereVers, hoechstgrenze - vorsorge_basis) : 0;
                const anteilRV = Math.ceil(gesamtRV * cfg.vorsorgeAbzug);
                const abziehbareRV = Math.max(0, anteilRV - agRV - erstatteteRV);
                const saPauschbetrag = d.verheiratet ? cfg.sonderausgabenPauschbetrag * 2 : cfg.sonderausgabenPauschbetrag;
                const sonstigeSA = Math.max(Math.floor(d.spenden), saPauschbetrag);
                const sonderausgaben = abziehbareRV + vorsorge_basis + anrechenbar + sonstigeSA;
                return (
                  <div className="mt-1 pt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between"><span>Abziehbare RV</span><span>{euro(abziehbareRV)}</span></div>
                    {erstatteteRV > 0 && <div className="flex justify-between pl-2"><span>./. erstattete RV</span><span>−{euro(erstatteteRV)}</span></div>}
                    <div className="flex justify-between"><span>Abziehbare KV (nach 4% Kürzung)</span><span>{euro(abziehbareKV)}</span></div>
                    {beitragsrueckKV > 0 && <div className="flex justify-between pl-2"><span>./. Beitragsrückerstattung KV</span><span>−{euro(beitragsrueckKV)}</span></div>}
                    <div className="flex justify-between"><span>Abziehbare PV</span><span>{euro(abziehbarePV)}</span></div>
                    <div className="flex justify-between font-medium text-slate-400 pt-1 border-t border-slate-700/20">
                      <span>Vorsorge-Basis (KV + PV)</span><span>{euro(vorsorge_basis)}</span>
                    </div>
                    <div className="flex justify-between"><span>Höchstgrenze weitere Vers.</span><span>{euro(hoechstgrenze)}</span></div>
                    {weitereVers > 0 && (
                      <div className={`flex justify-between font-medium ${spielraum > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <span>Davon anrechenbar</span><span>{euro(anrechenbar)} von {euro(weitereVers)}</span>
                      </div>
                    )}
                    {weitereVers > 0 && spielraum === 0 && (
                      <p className="text-amber-400/70 pt-0.5">KV + PV übersteigen die {euro(hoechstgrenze)}-Grenze — weitere Versicherungen haben keine Auswirkung</p>
                    )}
                    {d.spenden > 0 && <div className="flex justify-between"><span>Spenden</span><span>{euro(Math.floor(d.spenden))}</span></div>}
                    {d.spenden < saPauschbetrag && <div className="flex justify-between"><span>SA-Pauschbetrag (§10c)</span><span>{euro(saPauschbetrag)}</span></div>}
                    <div className="flex justify-between font-medium text-slate-400 pt-1 border-t border-slate-700/20">
                      <span>= Sonderausgaben gesamt</span><span>{euro(sonderausgaben)}</span>
                    </div>
                  </div>
                );
              })()}
            </Section>

            <Section title="Werbungskosten">
              <EditableField label="Fahrt-Tage" value={d.fahrt_tage} onChange={(v) => sd('fahrt_tage', v)} format="tage" tooltip={TS.fahrt_tage} />
              <EditableField label="Entfernung" value={d.entfernung_km} onChange={(v) => sd('entfernung_km', v)} format="km" tooltip={TS.entfernung_km} />
              <EditableField label="Homeoffice-Tage" value={d.homeoffice_tage} onChange={(v) => sd('homeoffice_tage', v)} format="tage" tooltip={TS.homeoffice_tage} />
              <EditableField label="Verpflegungspauschalen" value={d.verpflegungsmehraufwand} onChange={(v) => sd('verpflegungsmehraufwand', v)} tooltip={TS.verpflegungsmehraufwand} />
              {d.verpflegungsmehraufwand > 0 && (
                <>
                  <EditableField label="  ./. stfr. AG-Erstattung" value={d.verpflegung_stfr_erstattung ?? 0} onChange={(v) => sd('verpflegung_stfr_erstattung', v)} tooltip={TS.verpflegung_stfr_erstattung} />
                  <div className="flex justify-between pl-4 pr-2 py-1 text-xs text-slate-500">
                    <span>= Verpflegungsmehraufwand (verbleiben)</span>
                    <span>{euro(Math.max(0, d.verpflegungsmehraufwand - (d.verpflegung_stfr_erstattung ?? 0)))}</span>
                  </div>
                </>
              )}
              <EditableField label="Arbeitsmittel" value={d.arbeitsmittel} onChange={(v) => sd('arbeitsmittel', v)} tooltip={TS.arbeitsmittel} />
              <EditableField label="Sonstige WK" value={d.sonstige_werbungskosten} onChange={(v) => sd('sonstige_werbungskosten', v)} tooltip={TS.sonstige_werbungskosten} readOnly={!!(d.sonstige_wk_details?.length)} />
              {(d.sonstige_wk_details ?? []).map((p, i) => (
                <DetailZeile
                  key={i}
                  posten={p}
                  placeholder="z.B. Internetkosten"
                  onChangeName={(name) => {
                    const details = [...(d.sonstige_wk_details ?? [])];
                    details[i] = { ...details[i], name };
                    updateSteuerdaten(jahr, { sonstige_wk_details: details });
                  }}
                  onChangeBetrag={(betrag) => {
                    const details = [...(d.sonstige_wk_details ?? [])];
                    details[i] = { ...details[i], betrag };
                    const summe = details.reduce((s, d) => s + d.betrag, 0);
                    updateSteuerdaten(jahr, { sonstige_wk_details: details, sonstige_werbungskosten: summe });
                  }}
                  onDelete={() => {
                    const details = (d.sonstige_wk_details ?? []).filter((_, j) => j !== i);
                    const summe = details.reduce((s, d) => s + d.betrag, 0);
                    updateSteuerdaten(jahr, { sonstige_wk_details: details, sonstige_werbungskosten: summe });
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  const details: DetailPosten[] = [...(d.sonstige_wk_details ?? []), { name: '', betrag: 0 }];
                  updateSteuerdaten(jahr, { sonstige_wk_details: details });
                }}
                className="flex items-center gap-1.5 pl-4 py-1.5 text-sm text-slate-500 hover:text-emerald-400 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Werbungskosten hinzufügen
              </button>
              {(() => {
                const cfg = getConfig(jahr);
                const kmBasis = Math.min(d.entfernung_km, cfg.entfernungspauschale_erhoeht_ab_km - 1);
                const kmErhoeht = Math.max(0, d.entfernung_km - kmBasis);
                const entfPausch = d.fahrt_tage > 0 && d.entfernung_km > 0
                  ? Math.ceil(d.fahrt_tage * (kmBasis * cfg.entfernungspauschale_basis + kmErhoeht * cfg.entfernungspauschale_erhoeht))
                  : 0;
                const hoPausch = Math.min(d.homeoffice_tage * cfg.homeofficePauschaleProTag, cfg.homeofficePauschaleMaxTage * cfg.homeofficePauschaleProTag);
                const verpfVerbleiben = Math.max(0, d.verpflegungsmehraufwand - (d.verpflegung_stfr_erstattung ?? 0));
                const summe = entfPausch + d.arbeitsmittel + d.sonstige_werbungskosten + verpfVerbleiben + hoPausch;
                const pauschale = cfg.werbungskostenpauschale;
                const diff = summe - pauschale;
                const ueberPauschale = diff > 0;
                return (
                  <div className="mt-1 pt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between"><span>Entfernungspauschale</span><span>{euro(entfPausch)}</span></div>
                    <div className="flex justify-between"><span>Homeoffice-Pauschale</span><span>{euro(hoPausch)}</span></div>
                    {d.verpflegungsmehraufwand > 0 && <div className="flex justify-between"><span>Verpflegungsmehraufwand</span><span>{euro(verpfVerbleiben)}</span></div>}
                    {d.arbeitsmittel > 0 && <div className="flex justify-between"><span>Arbeitsmittel</span><span>{euro(d.arbeitsmittel)}</span></div>}
                    {d.sonstige_werbungskosten > 0 && <div className="flex justify-between"><span>Sonstige WK</span><span>{euro(d.sonstige_werbungskosten)}</span></div>}
                    <div className="flex justify-between font-medium text-slate-400 pt-1 border-t border-slate-700/20">
                      <span>Summe</span><span>{euro(summe)}</span>
                    </div>
                    <div className="flex justify-between"><span>Pauschale {jahr}</span><span>{euro(pauschale)}</span></div>
                    <div className={`flex justify-between font-medium pt-1 border-t border-slate-700/20 ${ueberPauschale ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <span>{ueberPauschale ? 'Über Pauschale' : 'Unter Pauschale'}</span>
                      <span>{ueberPauschale ? '+' : ''}{euro(diff)}</span>
                    </div>
                    {!ueberPauschale && (
                      <p className="text-amber-400/70 pt-0.5">Kein Vorteil — Pauschale wird automatisch angesetzt</p>
                    )}
                  </div>
                );
              })()}
            </Section>

            <Section title="Steuerermäßigungen (§ 35a)">
              <EditableField label="Haushaltsnahe DL" value={d.haushaltsnahe_dienstleistungen} onChange={(v) => sd('haushaltsnahe_dienstleistungen', v)} tooltip={TS.haushaltsnahe_dienstleistungen} />
              <EditableField label="Handwerker" value={d.handwerkerleistungen} onChange={(v) => sd('handwerkerleistungen', v)} tooltip={TS.handwerkerleistungen} />
            </Section>

            <Section title="Auslandsarbeit">
              <EditableField label="Auslandseinkünfte brutto" value={d.auslandseinkuenfte} onChange={(v) => sd('auslandseinkuenfte', v)} tooltip={TS.auslandseinkuenfte} />
              <EditableField label="Auslands-SV AN" value={d.auslands_sv} onChange={(v) => sd('auslands_sv', v)} tooltip={TS.auslands_sv} />
              <EditableField label="Anrechenbare Auslandssteuer" value={d.anrechenbare_auslandssteuer} onChange={(v) => sd('anrechenbare_auslandssteuer', v)} tooltip={TS.anrechenbare_auslandssteuer} />
            </Section>

            <Section title="Bescheid">
              <EditableField label="Erstattung / Nachzahlung" value={d.erstattung_bescheid ?? 0} onChange={(v) => sd('erstattung_bescheid' as keyof typeof d, v)} tooltip={TS.erstattung_bescheid} />
              <EditableField label="Nachzahlungszinsen" value={d.nachzahlungszinsen} onChange={(v) => sd('nachzahlungszinsen', v)} tooltip={TS.nachzahlungszinsen} />
              <EditableField label="Verspätungszuschlag" value={d.verspaetungszuschlag} onChange={(v) => sd('verspaetungszuschlag', v)} tooltip={TS.verspaetungszuschlag} />
            </Section>
          </div>

          {/* Rechte Spalte: Ergebnisse (editierbar) */}
          <div className="space-y-6">
            <Section title="Einkommen & Abzüge">
              <ReadOnlyRow label="Bruttoarbeitslohn" value={euro(e.bruttogehalt)} />
              <EditableField label="– Werbungskosten" value={e.werbungskosten} onChange={(v) => se('werbungskosten', v)} tooltip={TE.werbungskosten} />
              <EditableField label="– Sonderausgaben" value={e.sonderausgaben} onChange={(v) => se('sonderausgaben', v)} tooltip={TE.sonderausgaben} />
              <EditableField label="= Einkünfte aus Arbeit" value={e.einkuenfte_arbeit} onChange={(v) => se('einkuenfte_arbeit', v)} bold tooltip={TE.einkuenfte_arbeit} />
            </Section>

            <Section title="Krypto & Sondereinkünfte">
              <EditableField label="§23 Gewinne/Verluste" value={e.estg_23_brutto} onChange={(v) => se('estg_23_brutto', v)} tooltip={TS.estg_23} />
              <EditableField label="§23 Vortrag verrechnet" value={e.estg_23_vortrag_verrechnet} onChange={(v) => se('estg_23_vortrag_verrechnet', v)} indent />
              <EditableField label="§23 steuerpflichtig" value={e.estg_23_steuerpflichtig} onChange={(v) => se('estg_23_steuerpflichtig', v)} indent />
              <EditableField label="§23 Vortrag Ende" value={e.estg_23_vortrag_ende} onChange={(v) => se('estg_23_vortrag_ende', v)} indent color="blue" tooltip={TS.verlustvortrag_23} />
              <EditableField label="§22 Sonstige Einkünfte" value={e.estg_22} onChange={(v) => se('estg_22', v)} tooltip={TS.estg_22} />
              <EditableField label="§20 Termingeschäfte" value={e.estg_20_brutto} onChange={(v) => se('estg_20_brutto', v)} tooltip={TS.estg_20} />
              <EditableField label="§20 Vortrag verrechnet" value={e.estg_20_vortrag_verrechnet} onChange={(v) => se('estg_20_vortrag_verrechnet', v)} indent />
              <EditableField label="§20 Vortrag Ende" value={e.estg_20_vortrag_ende} onChange={(v) => se('estg_20_vortrag_ende', v)} indent color="blue" tooltip={TS.verlustvortrag_20} />
            </Section>

            <Section title="Kapitalerträge">
              <EditableField label="Basis vor Pauschbetrag" value={e.kapitalertraege_basis} onChange={(v) => se('kapitalertraege_basis', v)} />
              <EditableField label="Steuerpflichtig (§32d)" value={e.steuerpflichtige_kapitalertraege} onChange={(v) => se('steuerpflichtige_kapitalertraege', v)} />
              <EditableField label="KapESt (25%)" value={e.kapitalertragsteuer} onChange={(v) => se('kapitalertragsteuer', v)} />
              <EditableField label="Soli auf KapESt" value={e.soli_kapital} onChange={(v) => se('soli_kapital', v)} />
            </Section>

            <Section title="Zu versteuerndes Einkommen">
              <EditableField label="Ausland (Progressionsvorbehalt)" value={e.auslandseinkommen} onChange={(v) => se('auslandseinkommen', v)} tooltip={TS.auslandseinkuenfte} />
              <EditableField label="Einkommen für Steuersatz" value={e.gesamteinkommen_steuersatz} onChange={(v) => se('gesamteinkommen_steuersatz', v)} />
              <EditableField label="zvE Inland" value={e.zvE_inland} onChange={(v) => se('zvE_inland', v)} bold tooltip={TE.zvE_inland} />
              <EditableField label="Effektiver Steuersatz" value={e.effektiver_steuersatz} onChange={(v) => se('effektiver_steuersatz', v)} format="prozent" tooltip={TE.effektiver_steuersatz} />
            </Section>

            <Section title="Steuerberechnung">
              <EditableField label="Einkommensteuer" value={e.einkommensteuer} onChange={(v) => se('einkommensteuer', v)} tooltip={TE.einkommensteuer} />
              <EditableField label="Soli (ESt)" value={e.solidaritaetszuschlag} onChange={(v) => se('solidaritaetszuschlag', v)} />
              <EditableField label="Soli (Kapital)" value={e.soli_kapital} onChange={(v) => se('soli_kapital', v)} />
              <EditableField label="Kirchensteuer" value={e.kirchensteuer} onChange={(v) => se('kirchensteuer', v)} />
              <EditableField label="Steuerlast gesamt (Soll)" value={e.steuerlast_gesamt} onChange={(v) => se('steuerlast_gesamt', v)} bold tooltip={TE.steuerlast_gesamt} />
              <EditableField label="Gezahlte Steuer (Ist)" value={e.gezahlte_steuer} onChange={(v) => se('gezahlte_steuer', v)} tooltip={TE.gezahlte_steuer} />
              <EditableField
                label={erstattung ? 'Erstattung' : 'Nachzahlung'}
                value={e.erstattung_nachzahlung}
                onChange={(v) => se('erstattung_nachzahlung', v)}
                bold
                color={erstattung ? 'green' : 'red'}
                tooltip={TE.erstattung_nachzahlung}
              />
              <EditableField label="Zinsen & Zuschläge" value={e.zinsen_zuschlaege} onChange={(v) => se('zinsen_zuschlaege', v)} tooltip={TE.zinsen_zuschlaege} />
              <EditableField label="Abweichung zum Bescheid" value={e.abweichung_bescheid ?? 0} onChange={(v) => se('abweichung_bescheid', v)} tooltip={TE.abweichung_bescheid} />
            </Section>

          </div>
        </div>
      </main>

      {showUpload && <PdfUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
}
