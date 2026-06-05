import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/ui/Card';
import { EditableField } from '../components/ui/EditableField';
import { useDaten } from '../store/DatenContext';
import { euro, prozent } from '../utils/format';

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
    <div className={`flex justify-between py-1.5 border-b border-slate-700/30 last:border-0 ${indent ? 'pl-4' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-medium ${bold ? 'font-bold' : ''} ${colorClass}`}>{value}</span>
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

export default function JahrDetailPage() {
  const { jahr: jahrStr } = useParams();
  const jahr = Number(jahrStr);
  const { state, updateSteuerdaten, updateErgebnis } = useDaten();
  const e = state.ergebnisse[jahr];
  const d = state.steuerdaten[jahr];

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
      <AppHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">Steuerjahr {jahr}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/banken?jahr=${jahr}`}
              className="px-3 py-2 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 transition whitespace-nowrap"
            >
              Banken {jahr}
            </Link>
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
            <Section title="Lohn & Gehalt">
              <EditableField label="Bruttoarbeitslohn" value={d.bruttogehalt} onChange={(v) => sd('bruttogehalt', v)} />
              <EditableField label="Lohnsteuer" value={d.lohnsteuer} onChange={(v) => sd('lohnsteuer', v)} />
              <EditableField label="Soli Lohn" value={d.soli_lohn} onChange={(v) => sd('soli_lohn', v)} />
              <EditableField label="Kirchensteuer Lohn" value={d.kirchensteuer_lohn} onChange={(v) => sd('kirchensteuer_lohn', v)} />
            </Section>

            <Section title="Kapitalerträge">
              <EditableField label="Kapitalerträge gesamt" value={d.kapitalertraege_gesamt} onChange={(v) => sd('kapitalertraege_gesamt', v)} />
              <EditableField label="Sparer-Pauschbetrag" value={d.sparer_pauschbetrag} onChange={(v) => sd('sparer_pauschbetrag', v)} />
              <EditableField label="Abgeltungsteuer gezahlt" value={d.abgeltungsteuer_gezahlt} onChange={(v) => sd('abgeltungsteuer_gezahlt', v)} />
              <EditableField label="Soli Kapital gezahlt" value={d.soli_kapital_gezahlt} onChange={(v) => sd('soli_kapital_gezahlt', v)} />
            </Section>

            <Section title="Krypto-Einkünfte">
              <EditableField label="§23 Veräußerungsgeschäfte" value={d.estg_23} onChange={(v) => sd('estg_23', v)} />
              <EditableField label="Verlustvortrag §23" value={d.verlustvortrag_23} onChange={(v) => sd('verlustvortrag_23', v)} />
              <EditableField label="§22 Sonstige Leistungen" value={d.estg_22} onChange={(v) => sd('estg_22', v)} />
              <EditableField label="§20 Termingeschäfte" value={d.estg_20} onChange={(v) => sd('estg_20', v)} />
              <EditableField label="Verlustvortrag §20" value={d.verlustvortrag_20} onChange={(v) => sd('verlustvortrag_20', v)} />
              <EditableField label="Steuern Krypto gezahlt" value={d.steuern_krypto_gezahlt} onChange={(v) => sd('steuern_krypto_gezahlt', v)} />
            </Section>

            <Section title="Sozialversicherung">
              <EditableField label="RV-Beitrag AN" value={d.rv_an} onChange={(v) => sd('rv_an', v)} />
              <EditableField label="RV-Beitrag AG" value={d.rv_ag} onChange={(v) => sd('rv_ag', v)} />
              <EditableField label="KV-Beitrag AN (regulär)" value={d.kv_an_regulaer} onChange={(v) => sd('kv_an_regulaer', v)} />
              <EditableField label="PV-Beitrag AN" value={d.pv_an} onChange={(v) => sd('pv_an', v)} />
              <EditableField label="Weitere Versicherungen" value={d.weitere_versicherungen} onChange={(v) => sd('weitere_versicherungen', v)} />
              <EditableField label="Spenden" value={d.spenden} onChange={(v) => sd('spenden', v)} />
            </Section>

            <Section title="Werbungskosten">
              <EditableField label="Fahrt-Tage" value={d.fahrt_tage} onChange={(v) => sd('fahrt_tage', v)} format="tage" />
              <EditableField label="Entfernung" value={d.entfernung_km} onChange={(v) => sd('entfernung_km', v)} format="km" />
              <EditableField label="Homeoffice-Tage" value={d.homeoffice_tage} onChange={(v) => sd('homeoffice_tage', v)} format="tage" />
              <EditableField label="Arbeitsmittel" value={d.arbeitsmittel} onChange={(v) => sd('arbeitsmittel', v)} />
              <EditableField label="Sonstige WK" value={d.sonstige_werbungskosten} onChange={(v) => sd('sonstige_werbungskosten', v)} />
              <EditableField label="Haushaltsnahe DL" value={d.haushaltsnahe_dienstleistungen} onChange={(v) => sd('haushaltsnahe_dienstleistungen', v)} />
              <EditableField label="Handwerker" value={d.handwerkerleistungen} onChange={(v) => sd('handwerkerleistungen', v)} />
            </Section>

            {(d.auslandseinkuenfte > 0 || d.auslands_sv > 0) && (
              <Section title="Auslandsarbeit">
                <EditableField label="Auslandseinkünfte brutto" value={d.auslandseinkuenfte} onChange={(v) => sd('auslandseinkuenfte', v)} />
                <EditableField label="Auslands-SV AN" value={d.auslands_sv} onChange={(v) => sd('auslands_sv', v)} />
              </Section>
            )}

            <Section title="Bescheid">
              <EditableField label="Erstattung / Nachzahlung" value={d.erstattung_bescheid ?? 0} onChange={(v) => sd('erstattung_bescheid' as keyof typeof d, v)} />
              <EditableField label="Nachzahlungszinsen" value={d.nachzahlungszinsen} onChange={(v) => sd('nachzahlungszinsen', v)} />
              <EditableField label="Verspätungszuschlag" value={d.verspaetungszuschlag} onChange={(v) => sd('verspaetungszuschlag', v)} />
            </Section>
          </div>

          {/* Rechte Spalte: Ergebnisse (editierbar) */}
          <div className="space-y-6">
            <Section title="Einkommen & Abzüge">
              <ReadOnlyRow label="Bruttoarbeitslohn" value={euro(e.bruttogehalt)} />
              <EditableField label="– Werbungskosten" value={e.werbungskosten} onChange={(v) => se('werbungskosten', v)} />
              <EditableField label="– Sonderausgaben" value={e.sonderausgaben} onChange={(v) => se('sonderausgaben', v)} />
              <EditableField label="= Einkünfte aus Arbeit" value={e.einkuenfte_arbeit} onChange={(v) => se('einkuenfte_arbeit', v)} bold />
            </Section>

            <Section title="Krypto & Sondereinkünfte">
              <EditableField label="§23 Gewinne/Verluste" value={e.estg_23_brutto} onChange={(v) => se('estg_23_brutto', v)} />
              <EditableField label="§23 Vortrag verrechnet" value={e.estg_23_vortrag_verrechnet} onChange={(v) => se('estg_23_vortrag_verrechnet', v)} indent />
              <EditableField label="§23 steuerpflichtig" value={e.estg_23_steuerpflichtig} onChange={(v) => se('estg_23_steuerpflichtig', v)} indent />
              <EditableField label="§23 Vortrag Ende" value={e.estg_23_vortrag_ende} onChange={(v) => se('estg_23_vortrag_ende', v)} indent color="blue" />
              <EditableField label="§22 Sonstige Einkünfte" value={e.estg_22} onChange={(v) => se('estg_22', v)} />
              <EditableField label="§20 Termingeschäfte" value={e.estg_20_brutto} onChange={(v) => se('estg_20_brutto', v)} />
              <EditableField label="§20 Vortrag verrechnet" value={e.estg_20_vortrag_verrechnet} onChange={(v) => se('estg_20_vortrag_verrechnet', v)} indent />
              <EditableField label="§20 Vortrag Ende" value={e.estg_20_vortrag_ende} onChange={(v) => se('estg_20_vortrag_ende', v)} indent color="blue" />
            </Section>

            <Section title="Kapitalerträge">
              <EditableField label="Basis vor Pauschbetrag" value={e.kapitalertraege_basis} onChange={(v) => se('kapitalertraege_basis', v)} />
              <EditableField label="Steuerpflichtig (§32d)" value={e.steuerpflichtige_kapitalertraege} onChange={(v) => se('steuerpflichtige_kapitalertraege', v)} />
              <EditableField label="KapESt (25%)" value={e.kapitalertragsteuer} onChange={(v) => se('kapitalertragsteuer', v)} />
              <EditableField label="Soli auf KapESt" value={e.soli_kapital} onChange={(v) => se('soli_kapital', v)} />
            </Section>

            <Section title="Zu versteuerndes Einkommen">
              <EditableField label="Ausland (Progressionsvorbehalt)" value={e.auslandseinkommen} onChange={(v) => se('auslandseinkommen', v)} />
              <EditableField label="Einkommen für Steuersatz" value={e.gesamteinkommen_steuersatz} onChange={(v) => se('gesamteinkommen_steuersatz', v)} />
              <EditableField label="zvE Inland" value={e.zvE_inland} onChange={(v) => se('zvE_inland', v)} bold />
              <EditableField label="Effektiver Steuersatz" value={e.effektiver_steuersatz} onChange={(v) => se('effektiver_steuersatz', v)} format="prozent" />
            </Section>

            <Section title="Steuerberechnung">
              <EditableField label="Einkommensteuer" value={e.einkommensteuer} onChange={(v) => se('einkommensteuer', v)} />
              <EditableField label="Steuerlast gesamt (Soll)" value={e.steuerlast_gesamt} onChange={(v) => se('steuerlast_gesamt', v)} bold />
              <EditableField label="Gezahlte Steuer (Ist)" value={e.gezahlte_steuer} onChange={(v) => se('gezahlte_steuer', v)} />
              <EditableField
                label={erstattung ? 'Erstattung' : 'Nachzahlung'}
                value={e.erstattung_nachzahlung}
                onChange={(v) => se('erstattung_nachzahlung', v)}
                bold
                color={erstattung ? 'green' : 'red'}
              />
              <EditableField label="Zinsen & Zuschläge" value={e.zinsen_zuschlaege} onChange={(v) => se('zinsen_zuschlaege', v)} />
              <EditableField label="Abweichung zum Bescheid" value={e.abweichung_bescheid ?? 0} onChange={(v) => se('abweichung_bescheid', v)} />
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}
