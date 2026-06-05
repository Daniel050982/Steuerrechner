import { useSteuer } from '../../store/SteuerContext';
import { euro, prozent } from '../../utils/format';
import { Card } from '../ui/Card';

function KpiCard({ label, value, color = 'text-slate-100' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-700/40 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-200">{value}</span>
    </div>
  );
}

export function ErgebnisOverview() {
  const { state } = useSteuer();
  const r = state.ergebnis;

  if (!r) {
    return (
      <Card className="text-center py-12">
        <p className="text-slate-500 text-sm">
          Gib deine Steuerdaten ein und klicke auf "Berechnen", um das Ergebnis zu sehen.
        </p>
      </Card>
    );
  }

  const erstattung = r.differenz < 0;

  return (
    <div className="space-y-6">
      {/* KPI-Übersicht */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Zu versteuerndes Einkommen" value={euro(r.zvE)} />
        <KpiCard label="Steuerlast gesamt" value={euro(r.steuer_gesamt)} />
        <KpiCard
          label={erstattung ? 'Erstattung' : 'Nachzahlung'}
          value={euro(Math.abs(r.differenz))}
          color={erstattung ? 'text-emerald-400' : 'text-red-400'}
        />
        <KpiCard label="Effektiver Steuersatz" value={prozent(r.effektiver_steuersatz)} />
      </div>

      {/* Detail-Tabelle */}
      <Card title="Berechnungsdetails">
        <div className="space-y-1">
          <DetailRow label="Bruttogehalt" value={euro(r.bruttogehalt)} />
          <DetailRow label="– Werbungskosten" value={euro(r.werbungskosten)} />
          <DetailRow label="  davon Entfernungspauschale" value={euro(r.entfernungspauschale)} />
          <DetailRow label="  davon Homeoffice-Pauschale" value={euro(r.homeoffice_pauschale)} />
          <DetailRow label="– Sonderausgaben" value={euro(r.sonderausgaben)} />
          <DetailRow label="= Zu versteuerndes Einkommen" value={euro(r.zvE)} />

          <div className="h-3" />

          <DetailRow label="Einkommensteuer" value={euro(r.einkommensteuer)} />
          <DetailRow label="Solidaritätszuschlag" value={euro(r.solidaritaetszuschlag)} />
          <DetailRow label="Kirchensteuer" value={euro(r.kirchensteuer)} />
          <DetailRow label="Kapitalertragsteuer" value={euro(r.kapitalertragsteuer)} />
          <DetailRow label="Soli auf Kapitalerträge" value={euro(r.soli_auf_kapital)} />
          <DetailRow label="– Ermäßigung § 35a" value={euro(r.ermaessigung_35a)} />
          <DetailRow label="= Steuerlast gesamt" value={euro(r.steuer_gesamt)} />

          <div className="h-3" />

          <DetailRow label="Bereits gezahlt" value={euro(r.bereits_gezahlt)} />
          <div className="flex justify-between py-2">
            <span className="text-sm font-semibold text-slate-300">
              {erstattung ? 'Erstattung' : 'Nachzahlung'}
            </span>
            <span className={`text-sm font-bold ${erstattung ? 'text-emerald-400' : 'text-red-400'}`}>
              {euro(Math.abs(r.differenz))}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
