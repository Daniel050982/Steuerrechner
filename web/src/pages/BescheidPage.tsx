import { useParams } from 'react-router-dom';
import { JahrNavigation } from '../components/JahrNavigation';
import { Card } from '../components/ui/Card';
import { EditableField } from '../components/ui/EditableField';
import { useDaten } from '../store/DatenContext';
import { createEmptyBescheid, type BescheidDaten } from '../data/bescheid';
import { getConfig } from '../core/config';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card title={title}>
      <div className="space-y-0">{children}</div>
    </Card>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-500">{value}</span>
    </div>
  );
}

export default function BescheidPage() {
  const { jahr: jahrStr } = useParams();
  const jahr = Number(jahrStr);
  const { state, updateSteuerdaten } = useDaten();
  const d = state.steuerdaten[jahr];

  if (!d) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Keine Daten für {jahrStr}</p>
      </div>
    );
  }

  const raw = { ...createEmptyBescheid(jahr), ...d.bescheid };
  const config = getConfig(jahr);
  const hatErhoeht = config.entfernungspauschale_erhoeht_ab_km < 9999;

  // Auto-Berechnung Entfernungspauschale
  const ep_tage = raw.wk_fahrt_tage;
  const ep_km_gesamt = raw.wk_fahrt_km;
  const ep_km_basis = hatErhoeht ? Math.min(ep_km_gesamt, config.entfernungspauschale_erhoeht_ab_km - 1) : ep_km_gesamt;
  const ep_km_erhoeht = hatErhoeht ? Math.max(0, ep_km_gesamt - ep_km_basis) : 0;
  const ep_betrag_basis = ep_tage * ep_km_basis * config.entfernungspauschale_basis;
  const ep_betrag_erhoeht = ep_tage * ep_km_erhoeht * config.entfernungspauschale_erhoeht;
  const ep_zusammen = ep_betrag_basis + ep_betrag_erhoeht;
  const ep_gerundet = Math.ceil(ep_zusammen);

  // Auto-Verpflegung
  const wk_verpflegung_verbleiben_auto = Math.max(0, raw.wk_verpflegung - raw.wk_verpflegung_stfr);

  // Auto-Summen Werbungskosten
  const wk_summe_auto = ep_gerundet + raw.wk_homeoffice + wk_verpflegung_verbleiben_auto + raw.wk_arbeitsmittel + raw.wk_uebrige;
  const wk_angesetzt_auto = Math.max(wk_summe_auto, raw.wk_pauschbetrag);

  // Auto-Kapitalerträge
  const kapital_zwischensumme_auto = raw.kapital_ertraege + raw.kapital_veraeuserung_alt - raw.kapital_freibetrag_alt;
  const kapital_einkuenfte_auto = kapital_zwischensumme_auto - raw.kapital_verrechnung_verluste - raw.kapital_sparer_pauschbetrag;

  // Auto-Sonstige Einkünfte
  const sonstige_veraeuserung_verbleiben_auto = raw.sonstige_veraeuserung - raw.sonstige_veraeuserung_verluste;
  const einkuenfte_sonstige_auto = Math.max(0, sonstige_veraeuserung_verbleiben_auto) + raw.sonstige_leistungen;

  // Auto-Einkünfte
  const einkuenfte_nichtselbst_auto = raw.bruttoarbeitslohn - wk_angesetzt_auto;

  // Auto-Summen Sonderausgaben
  const altersvorsorge_abzug_auto = Math.ceil(raw.altersvorsorge_gesamt * raw.altersvorsorge_prozent / 100);
  const altersvorsorge_verbleiben_auto = altersvorsorge_abzug_auto - raw.altersvorsorge_ag_anteil - raw.altersvorsorge_erstattete_rv;
  const kv_verbleiben_auto = raw.kv_beitraege - raw.kv_kuerzung;
  const kv_pv_summe_auto = kv_verbleiben_auto + raw.pv_beitraege;
  const summe_vorsorge_auto = altersvorsorge_verbleiben_auto + kv_pv_summe_auto;
  const summe_sonderausgaben_auto = summe_vorsorge_auto + raw.sonderausgaben_unbeschraenkt;

  // Auto-Summen Einkünfte (Kapital §32d geht NICHT in die Summe ein — wird separat besteuert)
  const summe_einkuenfte_auto = einkuenfte_nichtselbst_auto + einkuenfte_sonstige_auto;

  // Auto-Summe §35a
  const ermaessigung_35a_auto = raw.ermaessigung_35a_haushaltsnahe + raw.ermaessigung_35a_handwerker;
  const est_verbleiben_auto = raw.est_laut_tarif - ermaessigung_35a_auto - raw.anrechenbare_auslandssteuer;
  const festzusetzende_est_auto = Math.max(est_verbleiben_auto, 0) + raw.kapital_32d_steuer;

  // Auto-Soli
  const soli_bemessung_nach_freigrenze_auto = Math.max(0, raw.soli_bemessungsgrundlage - raw.soli_freibleibend);
  const soli_betrag_auto = Math.floor(soli_bemessung_nach_freigrenze_auto * raw.soli_prozent) / 100;
  const soli_kapital_32d_betrag_auto = Math.floor(raw.kapital_32d_steuer * raw.soli_kapital_32d_prozent) / 100;
  const soli_festzusetzend_auto = soli_betrag_auto + soli_kapital_32d_betrag_auto;

  // Auto-Summen Festsetzung
  const verbleibend_est_auto = raw.festgesetzt_est - raw.abzug_lohn_est - raw.abzug_kapest;
  const verbleibend_soli_auto = raw.festgesetzt_soli - raw.abzug_lohn_soli - raw.abzug_soli_kapest;
  const verbleibend_kist_auto = raw.festgesetzt_kist - raw.abzug_lohn_kist;
  const erstattung_auto = -(verbleibend_est_auto + verbleibend_soli_auto + verbleibend_kist_auto + raw.nachzahlungszinsen + raw.verspaetungszuschlag);

  const b = {
    ...raw,
    wk_fahrt_betrag: Math.round(ep_betrag_basis * 100) / 100,
    wk_fahrt_km_erhoeht: ep_km_erhoeht,
    wk_fahrt_betrag_erhoeht: Math.round(ep_betrag_erhoeht * 100) / 100,
    wk_fahrt_zusammen: Math.round(ep_zusammen * 100) / 100,
    wk_entfernungspauschale: ep_gerundet,
    wk_verpflegung_verbleiben: wk_verpflegung_verbleiben_auto,
    wk_summe: wk_summe_auto,
    werbungskosten_bescheid: wk_angesetzt_auto,
    einkuenfte_nichtselbst: einkuenfte_nichtselbst_auto,
    kapital_zwischensumme: kapital_zwischensumme_auto,
    einkuenfte_kapital: kapital_einkuenfte_auto,
    sonstige_veraeuserung_verbleiben: sonstige_veraeuserung_verbleiben_auto,
    einkuenfte_sonstige: einkuenfte_sonstige_auto,
    summe_einkuenfte: summe_einkuenfte_auto,
    gesamtbetrag_einkuenfte: summe_einkuenfte_auto,
    altersvorsorge_abzug: altersvorsorge_abzug_auto,
    altersvorsorge_verbleiben: altersvorsorge_verbleiben_auto,
    kv_verbleiben: kv_verbleiben_auto,
    vorsorge_kv_pv_summe: kv_pv_summe_auto,
    summe_vorsorge: summe_vorsorge_auto,
    summe_sonderausgaben: summe_sonderausgaben_auto,
    einkommen: summe_einkuenfte_auto - summe_sonderausgaben_auto,
    zve: summe_einkuenfte_auto - summe_sonderausgaben_auto,
    ermaessigung_35a: ermaessigung_35a_auto,
    est_verbleiben: est_verbleiben_auto,
    kapital_32d_betrag: kapital_einkuenfte_auto,
    festzusetzende_est: festzusetzende_est_auto,
    soli_bemessung_nach_freigrenze: soli_bemessung_nach_freigrenze_auto,
    soli_betrag: soli_betrag_auto,
    soli_kapital_32d_steuer: raw.kapital_32d_steuer,
    soli_kapital_32d_betrag: soli_kapital_32d_betrag_auto,
    soli_festzusetzend: soli_festzusetzend_auto,
    verbleibend_est: verbleibend_est_auto,
    verbleibend_soli: verbleibend_soli_auto,
    verbleibend_kist: verbleibend_kist_auto,
    erstattung: erstattung_auto,
  };

  const update = (field: keyof BescheidDaten, value: number | string) => {
    updateSteuerdaten(jahr, { bescheid: { ...raw, [field]: value } });
  };
  const f = (field: keyof BescheidDaten) => (v: number) => update(field, v);

  return (
    <div className="min-h-screen">
      <JahrNavigation jahr={jahr} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linke Spalte */}
          <div className="space-y-6">
            <Section title="Festsetzung">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center pb-1 mb-1 border-b border-slate-600 text-xs text-slate-500">
                <span />
                <span className="text-right w-24">ESt</span>
                <span className="text-right w-24">Soli</span>
                <span className="text-right w-24">KiSt</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-1 border-b border-slate-700/30 text-sm">
                <span className="text-slate-400">Festgesetzt</span>
                <span className="w-24"><EditableField label="" value={b.festgesetzt_est} onChange={f('festgesetzt_est')} /></span>
                <span className="w-24"><EditableField label="" value={b.festgesetzt_soli} onChange={f('festgesetzt_soli')} /></span>
                <span className="w-24"><EditableField label="" value={b.festgesetzt_kist} onChange={f('festgesetzt_kist')} /></span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-1 border-b border-slate-700/30 text-sm">
                <span className="text-slate-400">ab Steuerabzug vom Lohn</span>
                <span className="w-24"><EditableField label="" value={b.abzug_lohn_est} onChange={f('abzug_lohn_est')} /></span>
                <span className="w-24"><EditableField label="" value={b.abzug_lohn_soli} onChange={f('abzug_lohn_soli')} /></span>
                <span className="w-24"><EditableField label="" value={b.abzug_lohn_kist} onChange={f('abzug_lohn_kist')} /></span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-1 border-b border-slate-700/30 text-sm">
                <span className="text-slate-400">ab Kapitalertragsteuer</span>
                <span className="w-24"><EditableField label="" value={b.abzug_kapest} onChange={f('abzug_kapest')} /></span>
                <span className="w-24"><EditableField label="" value={b.abzug_soli_kapest} onChange={f('abzug_soli_kapest')} /></span>
                <span className="w-24" />
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-1 border-b border-slate-700/30 text-sm font-semibold">
                <span className="text-slate-200">verbleibende Steuer</span>
                <span className="w-24"><EditableField label="" value={b.verbleibend_est} onChange={f('verbleibend_est')} readOnly /></span>
                <span className="w-24"><EditableField label="" value={b.verbleibend_soli} onChange={f('verbleibend_soli')} readOnly /></span>
                <span className="w-24"><EditableField label="" value={b.verbleibend_kist} onChange={f('verbleibend_kist')} readOnly /></span>
              </div>
              <EditableField label="Zinsen zur Einkommensteuer" value={b.nachzahlungszinsen} onChange={f('nachzahlungszinsen')} tooltip="Nachzahlungszinsen nach § 233a AO" />
              <EditableField label="Verspätungszuschlag" value={b.verspaetungszuschlag} onChange={f('verspaetungszuschlag')} />
              <EditableField label="Erstattung / Nachzahlung" value={b.erstattung} onChange={f('erstattung')} bold readOnly color={b.erstattung > 0 ? 'green' : b.erstattung < 0 ? 'red' : undefined} tooltip="Automatisch: −(verbleibende Steuer + Zinsen + Verspätungszuschlag). Positiv = Erstattung, negativ = Nachzahlung" />
            </Section>

            <Section title="Einkünfte">
              <EditableField label="Bruttoarbeitslohn" value={b.bruttoarbeitslohn} onChange={f('bruttoarbeitslohn')} />
              <EditableField label="ab Werbungskosten" value={b.werbungskosten_bescheid} onChange={f('werbungskosten_bescheid')} bold readOnly />
              <div className="pl-2 border-l-2 border-slate-700/50 ml-1 mt-1 mb-1 space-y-0">
                <EditableField label="Entfernungspauschale" value={b.wk_entfernungspauschale} onChange={f('wk_entfernungspauschale')} indent readOnly />
                <div className="pl-2 border-l-2 border-slate-700/30 ml-1 space-y-0">
                  <EditableField label="Fahrt-Tage" value={b.wk_fahrt_tage} onChange={f('wk_fahrt_tage')} format="tage" indent />
                  <EditableField label="Entfernung" value={b.wk_fahrt_km} onChange={f('wk_fahrt_km')} format="km" indent />
                  <EditableField label={`= ${hatErhoeht ? ep_km_basis + ' km' : 'km'} × ${config.entfernungspauschale_basis.toFixed(2).replace('.', ',')}`} value={b.wk_fahrt_betrag} onChange={f('wk_fahrt_betrag')} indent readOnly />
                  {hatErhoeht && (
                    <EditableField label={`= ${ep_km_erhoeht} km × ${config.entfernungspauschale_erhoeht.toFixed(2).replace('.', ',')}`} value={b.wk_fahrt_betrag_erhoeht} onChange={f('wk_fahrt_betrag_erhoeht')} indent readOnly />
                  )}
                </div>
                {config.homeofficePauschaleProTag > 0 && (
                  <EditableField label="Homeoffice-Pauschale" value={b.wk_homeoffice} onChange={f('wk_homeoffice')} indent />
                )}
                <EditableField label="Verpflegungsmehraufwand" value={b.wk_verpflegung_verbleiben} onChange={f('wk_verpflegung_verbleiben')} indent readOnly />
                <div className="pl-2 border-l-2 border-slate-700/30 ml-1 space-y-0">
                  <EditableField label="Pauschalen" value={b.wk_verpflegung} onChange={f('wk_verpflegung')} indent />
                  <EditableField label="ab stfr. Erstattung AG" value={b.wk_verpflegung_stfr} onChange={f('wk_verpflegung_stfr')} indent />
                </div>
                <EditableField label="Aufwendungen für Arbeitsmittel" value={b.wk_arbeitsmittel} onChange={f('wk_arbeitsmittel')} indent />
                <EditableField label="Übrige Werbungskosten" value={b.wk_uebrige} onChange={f('wk_uebrige')} indent />
                <EditableField label="Summe Werbungskosten" value={b.wk_summe} onChange={f('wk_summe')} indent readOnly bold />
                <EditableField label="mind. Pauschbetrag" value={b.wk_pauschbetrag} onChange={f('wk_pauschbetrag')} indent tooltip="Arbeitnehmer-Pauschbetrag (§ 9a EStG). Wird nur angesetzt, wenn die tatsächlichen Werbungskosten darunter liegen. Steht im Bescheid nur, wenn er greift." />
              </div>
              <EditableField label="Einkünfte nichtselbst. Arbeit" value={b.einkuenfte_nichtselbst} onChange={f('einkuenfte_nichtselbst')} bold readOnly tooltip="Automatisch: Brutto − Werbungskosten" />
              <EditableField label="Einkünfte Kapitalvermögen (§32d)" value={b.einkuenfte_kapital} onChange={f('einkuenfte_kapital')} readOnly />
              <div className="pl-2 border-l-2 border-slate-700/50 ml-1 mt-1 mb-1 space-y-0">
                <EditableField label="Kapitalerträge" value={b.kapital_ertraege} onChange={f('kapital_ertraege')} indent />
                <EditableField label="Gewinne Veräußerung Alt-Anteile" value={b.kapital_veraeuserung_alt} onChange={f('kapital_veraeuserung_alt')} indent />
                <EditableField label="ab Freibetrag gem. §56 Abs. 6 InvStG" value={b.kapital_freibetrag_alt} onChange={f('kapital_freibetrag_alt')} indent />
                <EditableField label="Zwischensumme" value={b.kapital_zwischensumme} onChange={f('kapital_zwischensumme')} indent readOnly />
                <EditableField label="Verrechnung laufender Verluste" value={b.kapital_verrechnung_verluste} onChange={f('kapital_verrechnung_verluste')} indent />
                <EditableField label="abzüglich Sparer-Pauschbetrag" value={b.kapital_sparer_pauschbetrag} onChange={f('kapital_sparer_pauschbetrag')} indent />
              </div>
              <EditableField label="Sonstige Einkünfte (§22/§23)" value={b.einkuenfte_sonstige} onChange={f('einkuenfte_sonstige')} readOnly />
              <div className="pl-2 border-l-2 border-slate-700/50 ml-1 mt-1 mb-1 space-y-0">
                <EditableField label="Einkünfte aus priv. Veräußerungsgeschäften" value={b.sonstige_veraeuserung} onChange={f('sonstige_veraeuserung')} indent />
                <EditableField label="abzgl. nicht verrechenbare Verluste" value={b.sonstige_veraeuserung_verluste} onChange={f('sonstige_veraeuserung_verluste')} indent />
                <EditableField label="verbleiben" value={b.sonstige_veraeuserung_verbleiben} onChange={f('sonstige_veraeuserung_verbleiben')} indent readOnly />
                <EditableField label="Einkünfte aus Leistungen" value={b.sonstige_leistungen} onChange={f('sonstige_leistungen')} indent />
              </div>
              <EditableField label="Summe der Einkünfte" value={b.summe_einkuenfte} onChange={f('summe_einkuenfte')} bold readOnly tooltip="Automatisch: Einkünfte nichtselbst. + Kapital + Sonstige" />
              <EditableField label="Gesamtbetrag der Einkünfte" value={b.gesamtbetrag_einkuenfte} onChange={f('gesamtbetrag_einkuenfte')} bold readOnly />
            </Section>
          </div>

          {/* Rechte Spalte */}
          <div className="space-y-6">
            <Section title="Sonderausgaben — Altersvorsorge">
              <EditableField label="Summe der Altersvorsorgeaufwendungen" value={b.altersvorsorge_gesamt} onChange={f('altersvorsorge_gesamt')} />
              <EditableField label="davon … %" value={b.altersvorsorge_prozent} onChange={f('altersvorsorge_prozent')} format="plain" indent />
              <EditableField label="= abziehbar" value={b.altersvorsorge_abzug} onChange={f('altersvorsorge_abzug')} indent readOnly tooltip="Automatisch: Aufwendungen × Prozent, aufgerundet" />
              <EditableField label="ab Arbeitgeberanteil zur RV" value={b.altersvorsorge_ag_anteil} onChange={f('altersvorsorge_ag_anteil')} indent />
              <EditableField label="ab erstattete RV-Beiträge" value={b.altersvorsorge_erstattete_rv} onChange={f('altersvorsorge_erstattete_rv')} indent />
              <EditableField label="verbleiben" value={b.altersvorsorge_verbleiben} onChange={f('altersvorsorge_verbleiben')} bold indent readOnly tooltip="Automatisch: abziehbar − AG-Anteil − erstattete RV" />
            </Section>

            <Section title="Sonderausgaben — KV / PV">
              <EditableField label="Beiträge zur Krankenversicherung" value={b.kv_beitraege} onChange={f('kv_beitraege')} tooltip="Inkl. etwaiger Zusatzbeiträge" />
              <EditableField label="ab Kürzungsbetrag nach § 10" value={b.kv_kuerzung} onChange={f('kv_kuerzung')} indent />
              <EditableField label="verbleiben" value={b.kv_verbleiben} onChange={f('kv_verbleiben')} indent readOnly tooltip="Automatisch: KV-Beiträge − Kürzungsbetrag" />
              <EditableField label="Beiträge zur Pflegeversicherung" value={b.pv_beitraege} onChange={f('pv_beitraege')} />
              <EditableField label="Summe der Beiträge nach § 10 Abs. 1 Nr. 3" value={b.vorsorge_kv_pv_summe} onChange={f('vorsorge_kv_pv_summe')} bold readOnly tooltip="Automatisch: KV verbleiben + PV" />
            </Section>

            <Section title="Sonderausgaben — Zusammenfassung">
              <EditableField label="Summe der abziehbaren Vorsorgeaufwendungen" value={b.summe_vorsorge} onChange={f('summe_vorsorge')} readOnly tooltip="Automatisch: Altersvorsorge verbleiben + KV/PV-Summe" />
              <EditableField label="Unbeschränkt abziehbare Sonderausgaben" value={b.sonderausgaben_unbeschraenkt} onChange={f('sonderausgaben_unbeschraenkt')} tooltip="z.B. Spenden, Zuwendungen nach § 10b EStG" />
              <EditableField label="Summe Sonderausgaben" value={b.summe_sonderausgaben} onChange={f('summe_sonderausgaben')} bold readOnly tooltip="Automatisch: Vorsorgeaufwendungen + unbeschränkt abziehbare" />
            </Section>

            <Section title="Einkommen">
              <EditableField label="Einkommen / zu versteuerndes Einkommen" value={b.zve} onChange={f('zve')} bold readOnly tooltip="Automatisch: Gesamtbetrag der Einkünfte − Sonderausgaben" />
            </Section>

            <Section title="Berechnung der Steuer">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30 text-sm">
                <span className="text-slate-400">
                  zu versteuern nach dem {b.tarif === 'splitting' ? 'Splittingtarif' : 'Grundtarif'} … aus
                </span>
                <div className="flex items-center gap-4">
                  <span className="w-28"><EditableField label="" value={b.zve_tarif} onChange={f('zve_tarif')} /></span>
                  <span className="w-28"><EditableField label="" value={b.est_laut_tarif} onChange={f('est_laut_tarif')} /></span>
                </div>
              </div>
              <EditableField label="ab Ermäßigung für haushaltsnahe Dienstleistungen" value={b.ermaessigung_35a_haushaltsnahe} onChange={f('ermaessigung_35a_haushaltsnahe')} />
              <EditableField label="Ermäßigung für Handwerkerleistungen" value={b.ermaessigung_35a_handwerker} onChange={f('ermaessigung_35a_handwerker')} />
              <EditableField label="Summe und davon abziehbar" value={b.ermaessigung_35a} onChange={f('ermaessigung_35a')} readOnly />
              <EditableField label="verbleiben" value={b.est_verbleiben} onChange={f('est_verbleiben')} bold readOnly />
              <EditableField label="zu versteuern nach §32d Abs. 1 EStG" value={b.kapital_32d_betrag} onChange={f('kapital_32d_betrag')} readOnly />
              <EditableField label="Steuer darauf (§32d)" value={b.kapital_32d_steuer} onChange={f('kapital_32d_steuer')} indent />
              <EditableField label="festzusetzende Einkommensteuer" value={b.festzusetzende_est} onChange={f('festzusetzende_est')} bold readOnly />
            </Section>

            <Section title="Berechnung des Solidaritätszuschlags">
              <EditableField label="Einkommensteuer" value={b.soli_einkommensteuer} onChange={f('soli_einkommensteuer')} />
              <EditableField label="Bemessungsgrundlage" value={b.soli_bemessungsgrundlage} onChange={f('soli_bemessungsgrundlage')} />
              <EditableField label="freibleibender Betrag" value={b.soli_freibleibend} onChange={f('soli_freibleibend')} />
              <EditableField label="Bemessung nach Freigrenze" value={b.soli_bemessung_nach_freigrenze} onChange={f('soli_bemessung_nach_freigrenze')} readOnly />
              <EditableField label="davon 5,5 % Solidaritätszuschlag" value={b.soli_betrag} onChange={f('soli_betrag')} readOnly />
              <EditableField label="Soli auf Kapitalerträge (§32d)" value={b.soli_kapital_32d_betrag} onChange={f('soli_kapital_32d_betrag')} readOnly tooltip="Automatisch: Steuer §32d × 5,5%" />
              <EditableField label="festzusetzender Solidaritätszuschlag" value={b.soli_festzusetzend} onChange={f('soli_festzusetzend')} bold readOnly />
            </Section>

            <Section title="Kirchensteuer & Ausland">
              <EditableField label="Bemessungsgrundlage Kirchensteuer" value={b.kist_bemessungsgrundlage} onChange={f('kist_bemessungsgrundlage')} />
              <EditableField label="davon … % Kirchensteuer" value={b.kist_prozent} onChange={f('kist_prozent')} format="prozent" />
              <EditableField label="Kirchensteuer" value={b.kist_betrag} onChange={f('kist_betrag')} />
              <EditableField label="Anrechenbare ausländische Steuer (§ 34c)" value={b.anrechenbare_auslandssteuer} onChange={f('anrechenbare_auslandssteuer')} />
            </Section>

          </div>
        </div>
      </main>
    </div>
  );
}
