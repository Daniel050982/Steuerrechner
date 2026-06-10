import { Link } from 'react-router-dom';
import { Home, GitCompareArrows } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useDaten } from '../store/DatenContext';
import { createEmptyBescheid } from '../data/bescheid';

const JAHRE = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

interface ZeileConfig {
  label: string;
  berechnung: (jahr: number) => number | null;
  bescheid: (jahr: number) => number | null;
  bold?: boolean;
  separator?: boolean;
}

function eur(v: number): string {
  return v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

function DiffCell({ berechnung, bescheid }: { berechnung: number | null; bescheid: number | null }) {
  if (berechnung == null || bescheid == null) return <td className="px-2 py-1.5 text-right text-slate-600">—</td>;
  const diff = berechnung - bescheid;
  const color = Math.abs(diff) < 0.01
    ? 'text-emerald-400'
    : Math.abs(diff) <= 2
      ? 'text-yellow-400'
      : 'text-red-400';
  return (
    <td className={`px-2 py-1.5 text-right font-medium ${color}`}>
      {Math.abs(diff) < 0.01 ? '✓' : eur(diff)}
    </td>
  );
}

export default function VergleichUebersichtPage() {
  const { state } = useDaten();

  const jahreData = JAHRE.map((jahr) => {
    const d = state.steuerdaten[jahr];
    const e = state.ergebnisse[jahr];
    const hasBescheid = !!d?.bescheid;
    return { jahr, d, e, hasBescheid };
  }).filter(({ e }) => !!e);

  const zeilen: ZeileConfig[] = [
    {
      label: 'Bruttoarbeitslohn',
      berechnung: (j) => { const e = state.ergebnisse[j]; return e ? Math.floor(state.steuerdaten[j]?.bruttogehalt ?? 0) : null; },
      bescheid: (j) => { const d = state.steuerdaten[j]; return d?.bescheid ? { ...createEmptyBescheid(j), ...d.bescheid }.bruttoarbeitslohn : null; },
    },
    {
      label: 'Werbungskosten',
      berechnung: (j) => state.ergebnisse[j]?.werbungskosten ?? null,
      bescheid: (j) => { const d = state.steuerdaten[j]; if (!d?.bescheid) return null; return { ...createEmptyBescheid(j), ...d.bescheid }.werbungskosten_bescheid; },
    },
    {
      label: 'Sonderausgaben',
      berechnung: (j) => state.ergebnisse[j]?.sonderausgaben ?? null,
      bescheid: (j) => { const d = state.steuerdaten[j]; if (!d?.bescheid) return null; return { ...createEmptyBescheid(j), ...d.bescheid }.summe_sonderausgaben; },
    },
    {
      label: 'zvE',
      berechnung: (j) => state.ergebnisse[j]?.zvE_inland ?? null,
      bescheid: (j) => { const d = state.steuerdaten[j]; if (!d?.bescheid) return null; return { ...createEmptyBescheid(j), ...d.bescheid }.zve; },
      bold: true,
    },
    { label: '', berechnung: () => null, bescheid: () => null, separator: true },
    {
      label: 'ESt laut Tarif',
      berechnung: (j) => state.ergebnisse[j]?.einkommensteuer ?? null,
      bescheid: (j) => { const d = state.steuerdaten[j]; if (!d?.bescheid) return null; return { ...createEmptyBescheid(j), ...d.bescheid }.est_laut_tarif; },
    },
    {
      label: 'Festzusetzende ESt',
      berechnung: (j) => {
        const e = state.ergebnisse[j]; if (!e) return null;
        const d = state.steuerdaten[j]; if (!d) return null;
        const calc_35a_h = Math.round(Math.min(d.haushaltsnahe_dienstleistungen * 0.20, 4000));
        const calc_35a_hw = Math.round(Math.min(d.handwerkerleistungen * 0.20, 1200));
        return Math.max(0, e.einkommensteuer - calc_35a_h - calc_35a_hw - d.anrechenbare_auslandssteuer) + e.kapitalertragsteuer;
      },
      bescheid: (j) => {
        const d = state.steuerdaten[j]; if (!d?.bescheid) return null;
        const b = { ...createEmptyBescheid(j), ...d.bescheid };
        return b.festzusetzende_est ?? (b.est_verbleiben + b.kapital_32d_steuer);
      },
      bold: true,
    },
    {
      label: 'Soli',
      berechnung: (j) => { const e = state.ergebnisse[j]; return e ? e.solidaritaetszuschlag + e.soli_kapital : null; },
      bescheid: (j) => { const d = state.steuerdaten[j]; if (!d?.bescheid) return null; return { ...createEmptyBescheid(j), ...d.bescheid }.soli_festzusetzend; },
    },
    { label: '', berechnung: () => null, bescheid: () => null, separator: true },
    {
      label: 'Steuerlast gesamt',
      berechnung: (j) => state.ergebnisse[j]?.steuerlast_gesamt ?? null,
      bescheid: (j) => {
        const d = state.steuerdaten[j]; if (!d?.bescheid) return null;
        const b = { ...createEmptyBescheid(j), ...d.bescheid };
        return b.festgesetzt_est + b.festgesetzt_soli + b.festgesetzt_kist;
      },
      bold: true,
    },
    {
      label: 'Gezahlt',
      berechnung: (j) => state.ergebnisse[j]?.gezahlte_steuer ?? null,
      bescheid: (j) => {
        const d = state.steuerdaten[j]; if (!d?.bescheid) return null;
        const b = { ...createEmptyBescheid(j), ...d.bescheid };
        return b.abzug_lohn_est + b.abzug_kapest + b.abzug_lohn_soli + b.abzug_soli_kapest + b.abzug_lohn_kist;
      },
    },
    {
      label: 'Erstattung / Nachzahlung',
      berechnung: (j) => state.ergebnisse[j]?.erstattung_nachzahlung ?? null,
      bescheid: (j) => {
        const d = state.steuerdaten[j]; if (!d?.bescheid) return null;
        const b = { ...createEmptyBescheid(j), ...d.bescheid };
        const verbl_est = b.festgesetzt_est - b.abzug_lohn_est - b.abzug_kapest;
        const verbl_soli = b.festgesetzt_soli - b.abzug_lohn_soli - b.abzug_soli_kapest;
        const verbl_kist = b.festgesetzt_kist - b.abzug_lohn_kist;
        return -(verbl_est + verbl_soli + verbl_kist + b.nachzahlungszinsen + b.verspaetungszuschlag);
      },
      bold: true,
    },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">Vergleich Alle Jahre</h1>
          </div>
          <div className="flex items-center gap-2">
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

      <main className="mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="sticky left-0 z-10 bg-slate-950 text-left text-slate-500 text-xs font-medium pl-3 pr-4 py-2" />
                {jahreData.map(({ jahr, hasBescheid }) => (
                  <th key={jahr} colSpan={3} className="text-center px-0 py-2 border-l border-slate-700/50">
                    <Link to={`/jahr/${jahr}/vergleich`} className="text-slate-200 font-bold hover:text-emerald-400 transition">
                      {jahr}
                    </Link>
                    {hasBescheid && (
                      <span className="ml-1 text-[9px] px-1 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        B
                      </span>
                    )}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-slate-700/50">
                <th className="sticky left-0 z-10 bg-slate-950" />
                {jahreData.map(({ jahr }) => (
                  <th key={`${jahr}-sub`} colSpan={3} className="border-l border-slate-700/50 px-0">
                    <div className="grid grid-cols-3 text-xs font-normal text-slate-600">
                      <span className="text-right px-2">Berechn.</span>
                      <span className="text-right px-2">Bescheid</span>
                      <span className="text-right px-2">Diff</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zeilen.map((z, idx) => {
                if (z.separator) {
                  return (
                    <tr key={idx}>
                      <td colSpan={1 + jahreData.length * 3} className="py-0.5">
                        <div className="border-t border-slate-700/30" />
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition">
                    <td className={`sticky left-0 z-10 bg-slate-950 pl-3 pr-4 py-1.5 ${z.bold ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
                      {z.label}
                    </td>
                    {jahreData.map(({ jahr, hasBescheid }) => {
                      const bVal = z.berechnung(jahr);
                      const dVal = hasBescheid ? z.bescheid(jahr) : null;
                      return [
                        <td key={`${jahr}-b`} className="px-2 py-1.5 text-right text-slate-300 border-l border-slate-700/50 tabular-nums">
                          {bVal != null ? eur(bVal) : '—'}
                        </td>,
                        <td key={`${jahr}-d`} className="px-2 py-1.5 text-right text-slate-500 tabular-nums">
                          {dVal != null ? eur(dVal) : '—'}
                        </td>,
                        <DiffCell key={`${jahr}-diff`} berechnung={bVal} bescheid={dVal} />,
                      ];
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
