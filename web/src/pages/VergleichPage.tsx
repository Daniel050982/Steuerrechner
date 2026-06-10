import { useParams, Link } from 'react-router-dom';
import { JahrNavigation } from '../components/JahrNavigation';
import { Card } from '../components/ui/Card';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { useDaten } from '../store/DatenContext';
import { createEmptyBescheid } from '../data/bescheid';
import { getConfig } from '../core/config';
import { euro, prozent } from '../utils/format';

interface Zeile {
  label: string;
  berechnung: number | null;
  bescheid: number | null;
  bold?: boolean;
  format?: 'euro' | 'prozent' | 'plain';
  tooltip?: string;
}

function DiffZeile({ z }: { z: Zeile }) {
  const fmt = z.format === 'prozent' ? prozent : z.format === 'plain' ? (v: number) => String(v) : euro;
  const bVal = z.berechnung;
  const dVal = z.bescheid;
  const diff = bVal != null && dVal != null ? bVal - dVal : null;

  const diffColor = diff == null
    ? 'text-slate-600'
    : Math.abs(diff) < 0.01
      ? 'text-emerald-400'
      : Math.abs(diff) <= 2
        ? 'text-yellow-400'
        : 'text-red-400';

  const indentLevel = z.label.match(/^( +)/)?.[1].length ?? 0;
  const indent = Math.floor(indentLevel / 2);
  const labelText = z.label.trimStart();
  const labelCls = z.bold ? 'font-semibold text-slate-200' : 'text-slate-400';

  return (
    <div className={`grid grid-cols-[1fr_7rem_7rem_7rem] items-center gap-1 py-1.5 border-b border-slate-700/30 last:border-0 text-sm`} style={{ paddingLeft: `${indent * 1}rem` }}>
      <span className={labelCls}>{labelText}</span>
      <span className="text-right text-slate-300">{bVal != null ? fmt(bVal) : '—'}</span>
      <span className="text-right text-slate-300">{dVal != null ? fmt(dVal) : '—'}</span>
      <span className={`text-right font-medium ${diffColor} flex items-center justify-end gap-0.5`}>
        {diff != null ? (Math.abs(diff) < 0.01 ? '✓' : fmt(diff)) : '—'}
        {z.tooltip && diff != null && Math.abs(diff) >= 0.01 && (
          <InfoTooltip text={z.tooltip} />
        )}
      </span>
    </div>
  );
}

function VergleichSection({ title, zeilen }: { title: string; zeilen: Zeile[] }) {
  return (
    <Card title={title}>
      <div className="grid grid-cols-[1fr_7rem_7rem_7rem] gap-1 pb-1 mb-1 border-b border-slate-600 text-xs text-slate-500">
        <span />
        <span className="text-right">Berechnung</span>
        <span className="text-right">Bescheid</span>
        <span className="text-right">Differenz</span>
      </div>
      {zeilen.map((z, i) => (
        <DiffZeile key={i} z={z} />
      ))}
    </Card>
  );
}

export default function VergleichPage() {
  const { jahr: jahrStr } = useParams();
  const jahr = Number(jahrStr);
  const { state } = useDaten();
  const d = state.steuerdaten[jahr];
  const e = state.ergebnisse[jahr];

  if (!d || !e) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Keine Daten für {jahrStr}</p>
      </div>
    );
  }

  const raw = { ...createEmptyBescheid(jahr), ...d.bescheid };
  const hasBescheid = !!d.bescheid;
  const config = getConfig(jahr);
  const hatErhoeht = config.entfernungspauschale_erhoeht_ab_km < 9999;

  // Bescheid Auto-Berechnung Entfernungspauschale
  const b_ep_tage = raw.wk_fahrt_tage;
  const b_ep_km = raw.wk_fahrt_km;
  const b_ep_km_basis = hatErhoeht ? Math.min(b_ep_km, config.entfernungspauschale_erhoeht_ab_km - 1) : b_ep_km;
  const b_ep_km_erhoeht = hatErhoeht ? Math.max(0, b_ep_km - b_ep_km_basis) : 0;
  const b_ep_betrag_basis = b_ep_tage * b_ep_km_basis * config.entfernungspauschale_basis;
  const b_ep_betrag_erhoeht = b_ep_tage * b_ep_km_erhoeht * config.entfernungspauschale_erhoeht;
  const b_ep_zusammen = b_ep_betrag_basis + b_ep_betrag_erhoeht;
  const b_ep_gerundet = Math.ceil(b_ep_zusammen);

  // Bescheid Auto-Summen (gleiche Logik wie BescheidPage)
  const b_verpflegung_verbleiben = Math.max(0, raw.wk_verpflegung - raw.wk_verpflegung_stfr);
  const b_wk_summe = b_ep_gerundet + raw.wk_homeoffice + b_verpflegung_verbleiben + raw.wk_arbeitsmittel + raw.wk_uebrige;
  const b_wk_angesetzt = Math.max(b_wk_summe, raw.wk_pauschbetrag);
  const b_altersvorsorge_abzug = Math.ceil(raw.altersvorsorge_gesamt * raw.altersvorsorge_prozent / 100);
  const b_altersvorsorge_verbleiben = b_altersvorsorge_abzug - raw.altersvorsorge_ag_anteil - raw.altersvorsorge_erstattete_rv;
  const b_kv_verbleiben = raw.kv_beitraege - raw.kv_kuerzung;
  const b_kv_pv_summe = b_kv_verbleiben + raw.pv_beitraege;
  const b_summe_vorsorge = b_altersvorsorge_verbleiben + b_kv_pv_summe;
  const b_summe_sonderausgaben = b_summe_vorsorge + raw.sonderausgaben_unbeschraenkt;

  // Bescheid Auto-Sonstige Einkünfte
  const b_sonstige_veraeuserung_verbleiben = raw.sonstige_veraeuserung - raw.sonstige_veraeuserung_verluste;
  const b_einkuenfte_sonstige = Math.max(0, b_sonstige_veraeuserung_verbleiben) + raw.sonstige_leistungen;

  // Bescheid Auto-Kapitalerträge
  const b_kapital_zwischensumme = raw.kapital_ertraege + raw.kapital_veraeuserung_alt - raw.kapital_freibetrag_alt;
  const b_einkuenfte_kapital = b_kapital_zwischensumme - raw.kapital_verrechnung_verluste - raw.kapital_sparer_pauschbetrag;

  const b_ermaessigung_35a = raw.ermaessigung_35a_haushaltsnahe + raw.ermaessigung_35a_handwerker;
  const b_est_verbleiben = raw.est_laut_tarif - b_ermaessigung_35a - raw.anrechenbare_auslandssteuer;
  const b_festzusetzende_est = Math.max(b_est_verbleiben, 0) + raw.kapital_32d_steuer;

  const b_verbleibend_est = raw.festgesetzt_est - raw.abzug_lohn_est - raw.abzug_kapest;
  const b_verbleibend_soli = raw.festgesetzt_soli - raw.abzug_lohn_soli - raw.abzug_soli_kapest;
  const b_verbleibend_kist = raw.festgesetzt_kist - raw.abzug_lohn_kist;
  const b_erstattung = -(b_verbleibend_est + b_verbleibend_soli + b_verbleibend_kist + raw.nachzahlungszinsen + raw.verspaetungszuschlag);

  const b = {
    ...raw,
    wk_fahrt_betrag: Math.round(b_ep_betrag_basis * 100) / 100,
    wk_fahrt_km_erhoeht: b_ep_km_erhoeht,
    wk_fahrt_betrag_erhoeht: Math.round(b_ep_betrag_erhoeht * 100) / 100,
    wk_fahrt_zusammen: Math.round(b_ep_zusammen * 100) / 100,
    wk_entfernungspauschale: b_ep_gerundet,
    wk_summe: b_wk_summe,
    werbungskosten_bescheid: b_wk_angesetzt,
    altersvorsorge_abzug: b_altersvorsorge_abzug,
    altersvorsorge_verbleiben: b_altersvorsorge_verbleiben,
    kv_verbleiben: b_kv_verbleiben,
    vorsorge_kv_pv_summe: b_kv_pv_summe,
    summe_vorsorge: b_summe_vorsorge,
    summe_sonderausgaben: b_summe_sonderausgaben,
    wk_verpflegung_verbleiben: b_verpflegung_verbleiben,
    einkuenfte_nichtselbst: raw.bruttoarbeitslohn - b_wk_angesetzt,
    kapital_zwischensumme: b_kapital_zwischensumme,
    einkuenfte_kapital: b_einkuenfte_kapital,
    sonstige_veraeuserung_verbleiben: b_sonstige_veraeuserung_verbleiben,
    einkuenfte_sonstige: b_einkuenfte_sonstige,
    summe_einkuenfte: (raw.bruttoarbeitslohn - b_wk_angesetzt) + b_einkuenfte_sonstige,
    gesamtbetrag_einkuenfte: (raw.bruttoarbeitslohn - b_wk_angesetzt) + b_einkuenfte_sonstige,
    einkommen: ((raw.bruttoarbeitslohn - b_wk_angesetzt) + b_einkuenfte_sonstige) - b_summe_sonderausgaben,
    zve: ((raw.bruttoarbeitslohn - b_wk_angesetzt) + b_einkuenfte_sonstige) - b_summe_sonderausgaben,
    ermaessigung_35a: b_ermaessigung_35a,
    est_verbleiben: b_est_verbleiben,
    kapital_32d_betrag: b_einkuenfte_kapital,
    festzusetzende_est: b_festzusetzende_est,
    soli_bemessung_nach_freigrenze: Math.max(0, raw.soli_bemessungsgrundlage - raw.soli_freibleibend),
    soli_betrag: Math.floor(Math.max(0, raw.soli_bemessungsgrundlage - raw.soli_freibleibend) * raw.soli_prozent) / 100,
    soli_kapital_32d_betrag: Math.floor(raw.kapital_32d_steuer * raw.soli_kapital_32d_prozent) / 100,
    soli_festzusetzend: Math.floor(Math.max(0, raw.soli_bemessungsgrundlage - raw.soli_freibleibend) * raw.soli_prozent) / 100 + Math.floor(raw.kapital_32d_steuer * raw.soli_kapital_32d_prozent) / 100,
    verbleibend_est: b_verbleibend_est,
    verbleibend_soli: b_verbleibend_soli,
    verbleibend_kist: b_verbleibend_kist,
    erstattung: b_erstattung,
  };

  // Sonderausgaben-Zwischenwerte nachrechnen (gleiche Logik wie berechnung.ts)
  const erstatteteRV = d.erstattete_rv ?? 0;
  const beitragsrueckKV = d.beitragsrueckerstattung_kv ?? 0;
  const gesamt_rv = Math.round(Math.min(d.rv_an + d.rv_ag, config.max_vorsorge_rv));
  const rv_ag = Math.round(d.rv_ag);
  const kv_gerundet = Math.ceil(d.kv_an_gesamt);
  const kv_kuerz_basis = d.kv_an_regulaer > 0 ? Math.ceil(d.kv_an_regulaer) : kv_gerundet;
  const calc_pv = Math.ceil(d.pv_an);

  const anteil_rv = Math.ceil(gesamt_rv * config.vorsorgeAbzug);
  const calc_altersvorsorge_gesamt = gesamt_rv;
  const calc_altersvorsorge_prozent = config.vorsorgeAbzug * 100;
  const calc_altersvorsorge_abzug = anteil_rv;
  const calc_altersvorsorge_ag = rv_ag;
  const calc_altersvorsorge_verbleiben = Math.max(0, anteil_rv - calc_altersvorsorge_ag - erstatteteRV);

  const calc_kv_beitraege = kv_gerundet;
  const calc_kv_kuerzung = Math.floor(kv_kuerz_basis * config.krankengeld_kuerzung);
  const calc_kv_verbleiben = Math.max(0, kv_gerundet - calc_kv_kuerzung - beitragsrueckKV);
  const calc_kv_pv_summe = calc_kv_verbleiben + calc_pv;
  const calc_summe_vorsorge = calc_altersvorsorge_verbleiben + calc_kv_pv_summe;
  const calc_weitereVers = d.weitere_versicherungen + (d.auslands_sv ?? 0);
  const calc_hoechstbetragBasis = d.krankenversichert === 'privat' ? 2800 : 1900;
  const calc_hoechstbetrag = d.verheiratet ? calc_hoechstbetragBasis * 2 : calc_hoechstbetragBasis;
  const calc_abziehbareWeitereVers = calc_kv_pv_summe < calc_hoechstbetrag
    ? Math.min(calc_weitereVers, calc_hoechstbetrag - calc_kv_pv_summe)
    : 0;
  const saPauschbetrag = d.verheiratet ? config.sonderausgabenPauschbetrag * 2 : config.sonderausgabenPauschbetrag;
  const calc_spenden = Math.max(Math.floor(d.spenden), saPauschbetrag);
  const calc_summe_sonderausgaben = calc_summe_vorsorge + calc_abziehbareWeitereVers + calc_spenden;

  // Werbungskosten-Details
  let calc_ep_betrag_basis = 0;
  let calc_ep_betrag_erhoeht = 0;
  let calc_ep_zusammen = 0;
  let calc_wk_entfernungspauschale = 0;
  let calc_ep_km_basis = 0;
  let calc_ep_km_erhoeht = 0;
  if (d.fahrt_tage > 0 && d.entfernung_km > 0) {
    calc_ep_km_basis = hatErhoeht ? Math.min(d.entfernung_km, config.entfernungspauschale_erhoeht_ab_km - 1) : d.entfernung_km;
    calc_ep_km_erhoeht = hatErhoeht ? Math.max(0, d.entfernung_km - calc_ep_km_basis) : 0;
    calc_ep_betrag_basis = d.fahrt_tage * calc_ep_km_basis * config.entfernungspauschale_basis;
    calc_ep_betrag_erhoeht = d.fahrt_tage * calc_ep_km_erhoeht * config.entfernungspauschale_erhoeht;
    calc_ep_zusammen = calc_ep_betrag_basis + calc_ep_betrag_erhoeht;
    calc_wk_entfernungspauschale = Math.ceil(calc_ep_zusammen);
  }
  const calc_homeoffice = Math.min(
    d.homeoffice_tage * config.homeofficePauschaleProTag,
    config.homeofficePauschaleMaxTage * config.homeofficePauschaleProTag,
  );
  const calc_verpflegung = Math.max(0, d.verpflegungsmehraufwand - (d.verpflegung_stfr_erstattung ?? 0));
  const calc_wk_summe = calc_wk_entfernungspauschale + calc_homeoffice + calc_verpflegung + d.arbeitsmittel + d.sonstige_werbungskosten;

  const einkuenfte: Zeile[] = [
    { label: 'Bruttoarbeitslohn', berechnung: Math.floor(d.bruttogehalt), bescheid: b.bruttoarbeitslohn },
    { label: 'ab Werbungskosten', berechnung: e.werbungskosten, bescheid: b.werbungskosten_bescheid, bold: true },
    { label: '  Entfernungspauschale', berechnung: calc_wk_entfernungspauschale, bescheid: b.wk_entfernungspauschale },
    { label: '    Fahrt-Tage', berechnung: d.fahrt_tage, bescheid: b.wk_fahrt_tage, format: 'plain' },
    { label: '    Entfernung', berechnung: d.entfernung_km, bescheid: b.wk_fahrt_km, format: 'plain' },
    { label: `    = ${hatErhoeht ? calc_ep_km_basis + ' km' : 'km'} × ${config.entfernungspauschale_basis.toFixed(2).replace('.', ',')}`, berechnung: Math.round(calc_ep_betrag_basis * 100) / 100, bescheid: b.wk_fahrt_betrag },
    ...(hatErhoeht ? [
      { label: `    = ${calc_ep_km_erhoeht} km × ${config.entfernungspauschale_erhoeht.toFixed(2).replace('.', ',')}`, berechnung: Math.round(calc_ep_betrag_erhoeht * 100) / 100, bescheid: b.wk_fahrt_betrag_erhoeht } as Zeile,
    ] : []),
    ...(config.homeofficePauschaleProTag > 0 ? [
      { label: '  Homeoffice-Pauschale', berechnung: calc_homeoffice, bescheid: b.wk_homeoffice } as Zeile,
    ] : []),
    ...(calc_verpflegung > 0 || raw.wk_verpflegung > 0 ? [
      { label: '  Verpflegungsmehraufwand', berechnung: calc_verpflegung, bescheid: b.wk_verpflegung_verbleiben } as Zeile,
    ] : []),
    { label: '  Aufwendungen für Arbeitsmittel', berechnung: d.arbeitsmittel, bescheid: b.wk_arbeitsmittel },
    { label: '  Übrige Werbungskosten', berechnung: d.sonstige_werbungskosten, bescheid: b.wk_uebrige },
    { label: '  Summe Werbungskosten', berechnung: calc_wk_summe, bescheid: b.wk_summe },
    ...(calc_wk_summe < config.werbungskostenpauschale || b.wk_pauschbetrag > 0
      ? [{ label: '  mind. Pauschbetrag', berechnung: config.werbungskostenpauschale, bescheid: b.wk_pauschbetrag } as Zeile]
      : []),
    { label: 'Einkünfte nichtselbst. Arbeit', berechnung: Math.floor(d.bruttogehalt - e.werbungskosten), bescheid: b.einkuenfte_nichtselbst, bold: true },
    { label: 'Einkünfte Kapitalvermögen', berechnung: e.steuerpflichtige_kapitalertraege, bescheid: b.einkuenfte_kapital },
    { label: 'Sonstige Einkünfte (§22/§23)', berechnung: e.estg_22 + e.estg_23_steuerpflichtig, bescheid: b.einkuenfte_sonstige },
    ...(raw.sonstige_veraeuserung !== 0 || raw.sonstige_leistungen !== 0 || e.estg_23_brutto !== 0 || e.estg_22 !== 0 ? [
      { label: '  Einkünfte aus priv. Veräußerungsgeschäften', berechnung: e.estg_23_brutto, bescheid: b.sonstige_veraeuserung,
        ...(e.estg_23_brutto !== b.sonstige_veraeuserung && b.sonstige_veraeuserung !== 0 ? { tooltip: `Nachgereichter Cointracking-Bericht: ${euro(e.estg_23_brutto)} statt ${euro(b.sonstige_veraeuserung)} im Bescheid. In der Steuererklärung wurde ein älterer CoinTracking-Export eingereicht. Differenz ${euro(Math.abs(e.estg_23_brutto - b.sonstige_veraeuserung))} — Einspruch-Thema.` } : {}),
      } as Zeile,
      ...(e.estg_23_vortrag_verrechnet !== 0 || raw.sonstige_veraeuserung_verluste !== 0 ? [
        { label: '    abzgl. nicht verrechenbare Verluste', berechnung: e.estg_23_vortrag_verrechnet > 0 ? -e.estg_23_vortrag_verrechnet : null, bescheid: b.sonstige_veraeuserung_verluste,
          ...(e.estg_23_vortrag_verrechnet > 0 && b.sonstige_veraeuserung_verluste === 0 ? { tooltip: 'Das FA hat keinen §23-Verlustvortrag berücksichtigt. Unsere Berechnung verrechnet den Vortrag aus den Vorjahren (Krypto-Verluste 2021/2022). Der Verlustvortrag muss beim FA separat beantragt/festgestellt werden.' } : {}),
        } as Zeile,
        { label: '    verbleiben', berechnung: e.estg_23_steuerpflichtig, bescheid: b.sonstige_veraeuserung_verbleiben } as Zeile,
      ] : []),
      { label: '  Einkünfte aus Leistungen', berechnung: e.estg_22, bescheid: b.sonstige_leistungen,
        ...(e.estg_22 !== b.sonstige_leistungen ? { tooltip: `Nachgereichter Cointracking-Bericht: ${euro(e.estg_22)} statt ${euro(b.sonstige_leistungen)} im Bescheid. Der Änderungsbescheid (30.01.2026) hat den Einspruch noch nicht berücksichtigt — Klärung mit dem FA noch offen. Differenz ${euro(Math.abs(e.estg_22 - b.sonstige_leistungen))} wirkt sich über den Progressionssatz auf die ESt aus.` } : {}),
      } as Zeile,
    ] : []),
    { label: 'Summe der Einkünfte', berechnung: e.zvE_inland + e.sonderausgaben, bescheid: b.summe_einkuenfte, bold: true },
    { label: 'Gesamtbetrag der Einkünfte', berechnung: e.zvE_inland + e.sonderausgaben, bescheid: b.gesamtbetrag_einkuenfte, bold: true },
  ];

  const sonderausgaben: Zeile[] = [
    { label: 'Summe der Altersvorsorgeaufwendungen', berechnung: calc_altersvorsorge_gesamt, bescheid: b.altersvorsorge_gesamt },
    { label: '  davon … %', berechnung: calc_altersvorsorge_prozent, bescheid: b.altersvorsorge_prozent, format: 'plain' },
    { label: '  = abziehbar', berechnung: calc_altersvorsorge_abzug, bescheid: b.altersvorsorge_abzug },
    { label: '  ab Arbeitgeberanteil zur RV', berechnung: calc_altersvorsorge_ag, bescheid: b.altersvorsorge_ag_anteil },
    ...(erstatteteRV > 0 ? [
      { label: '  ab erstattete RV-Beiträge', berechnung: erstatteteRV, bescheid: b.altersvorsorge_erstattete_rv } as Zeile,
    ] : []),
    { label: '  verbleiben', berechnung: calc_altersvorsorge_verbleiben, bescheid: b.altersvorsorge_verbleiben, bold: true },
    { label: 'Beiträge zur Krankenversicherung', berechnung: calc_kv_beitraege, bescheid: b.kv_beitraege },
    { label: '  ab Kürzungsbetrag nach § 10', berechnung: calc_kv_kuerzung, bescheid: b.kv_kuerzung },
    ...(beitragsrueckKV > 0 ? [
      { label: '  ab Beitragsrückerstattung KV', berechnung: beitragsrueckKV, bescheid: null } as Zeile,
    ] : []),
    { label: '  verbleiben', berechnung: calc_kv_verbleiben, bescheid: b.kv_verbleiben },
    { label: 'Beiträge zur Pflegeversicherung', berechnung: calc_pv, bescheid: b.pv_beitraege },
    { label: 'Summe der Beiträge nach § 10 Abs. 1 Nr. 3', berechnung: calc_kv_pv_summe, bescheid: b.vorsorge_kv_pv_summe, bold: true },
    { label: 'Summe der abziehbaren Vorsorgeaufwendungen', berechnung: calc_summe_vorsorge, bescheid: b.summe_vorsorge, bold: true },
    { label: 'Unbeschränkt abziehbare Sonderausgaben', berechnung: calc_spenden, bescheid: b.sonderausgaben_unbeschraenkt },
    { label: 'Summe Sonderausgaben', berechnung: calc_summe_sonderausgaben, bescheid: b.summe_sonderausgaben, bold: true },
  ];

  const einkommen: Zeile[] = [
    { label: 'Einkommen', berechnung: e.zvE_inland + e.sonderausgaben - calc_summe_sonderausgaben, bescheid: b.einkommen },
    { label: 'Zu versteuerndes Einkommen', berechnung: e.zvE_inland, bescheid: b.zve, bold: true },
    { label: 'Effektiver Steuersatz', berechnung: e.effektiver_steuersatz, bescheid: null, format: 'prozent' },
  ];

  const calc_35a_haushaltsnahe = Math.round(Math.min(d.haushaltsnahe_dienstleistungen * 0.20, 4000));
  const calc_35a_handwerker = Math.round(Math.min(d.handwerkerleistungen * 0.20, 1200));
  const calc_35a = calc_35a_haushaltsnahe + calc_35a_handwerker;

  const steuer: Zeile[] = [
    { label: 'ESt laut Tarif', berechnung: e.einkommensteuer, bescheid: b.est_laut_tarif,
      ...(e.estg_22 !== b.sonstige_leistungen && e.einkommensteuer !== b.est_laut_tarif ? { tooltip: `Folge der §22-Differenz (Cointracking ${euro(e.estg_22)} vs. Bescheid ${euro(b.sonstige_leistungen)}): Das zvE ändert sich um ${euro(Math.abs(e.zvE_inland - b.zve_tarif))}, was über den Progressionssatz zu ${euro(Math.abs(e.einkommensteuer - b.est_laut_tarif))} ESt-Differenz führt. Wird sich mit der §22-Klärung auflösen.` } : {}),
    },
    { label: 'ab Ermäßigung §35a', berechnung: calc_35a, bescheid: b.ermaessigung_35a },
    { label: '  haushaltsnahe Dienstleistungen', berechnung: calc_35a_haushaltsnahe, bescheid: b.ermaessigung_35a_haushaltsnahe,
      ...(calc_35a_haushaltsnahe !== b.ermaessigung_35a_haushaltsnahe && b.ermaessigung_35a_haushaltsnahe > 0 ? { tooltip: `FA hat 20% von ${euro(b.ermaessigung_35a_haushaltsnahe / 0.20)} anerkannt, wir rechnen mit ${euro(d.haushaltsnahe_dienstleistungen)} (BKA ${jahr}). Vermutlich wurde die aktuelle Betriebskostenabrechnung nicht mit der Steuererklärung eingereicht.` } : {}),
    },
    { label: '  Handwerkerleistungen', berechnung: calc_35a_handwerker, bescheid: b.ermaessigung_35a_handwerker,
      ...(calc_35a_handwerker !== b.ermaessigung_35a_handwerker && b.ermaessigung_35a_handwerker > 0 ? { tooltip: `FA hat 20% von ${euro(b.ermaessigung_35a_handwerker / 0.20)} anerkannt, wir rechnen mit ${euro(d.handwerkerleistungen)} (BKA ${jahr}). Gleiche Ursache wie haushaltsnahe DL — BKA vermutlich nicht eingereicht.` } : {}),
    },
    { label: 'verbleiben', berechnung: e.einkommensteuer - calc_35a, bescheid: b.est_verbleiben },
    ...(d.anrechenbare_auslandssteuer > 0 ? [
      { label: 'ab anrechenbare Auslandssteuer (§34c)', berechnung: d.anrechenbare_auslandssteuer, bescheid: b.anrechenbare_auslandssteuer } as Zeile,
      { label: 'verbleiben nach §34c', berechnung: Math.max(0, e.einkommensteuer - calc_35a - d.anrechenbare_auslandssteuer), bescheid: Math.max(0, b.est_verbleiben - (b.anrechenbare_auslandssteuer ?? 0)), bold: true } as Zeile,
    ] : []),
    { label: 'zu versteuern nach §32d (Kapital)', berechnung: e.steuerpflichtige_kapitalertraege, bescheid: b.kapital_32d_betrag },
    { label: '  Steuer darauf (§32d)', berechnung: e.kapitalertragsteuer, bescheid: b.kapital_32d_steuer },
    { label: 'Festzusetzende ESt', berechnung: Math.max(0, e.einkommensteuer - calc_35a - d.anrechenbare_auslandssteuer) + e.kapitalertragsteuer, bescheid: b.festzusetzende_est, bold: true },
    { label: 'Soli', berechnung: e.solidaritaetszuschlag + e.soli_kapital, bescheid: b.soli_festzusetzend },
    { label: 'KiSt', berechnung: e.kirchensteuer, bescheid: b.kist_betrag },
  ];

  const festsetzung: Zeile[] = [
    { label: 'Festgesetzt ESt', berechnung: Math.max(0, e.einkommensteuer - calc_35a - d.anrechenbare_auslandssteuer) + e.kapitalertragsteuer, bescheid: b.festgesetzt_est },
    { label: 'Festgesetzt Soli', berechnung: e.solidaritaetszuschlag + e.soli_kapital, bescheid: b.festgesetzt_soli },
    { label: 'Festgesetzt KiSt', berechnung: e.kirchensteuer, bescheid: b.festgesetzt_kist },
    { label: 'Abzug Lohnsteuer', berechnung: Math.round(d.lohnsteuer), bescheid: b.abzug_lohn_est },
    { label: 'Abzug Soli (Lohn)', berechnung: d.soli_lohn, bescheid: b.abzug_lohn_soli,
      ...(d.soli_lohn !== b.abzug_lohn_soli ? { tooltip: `Berechnung ${euro(d.soli_lohn)} (lt. LStB) vs. Bescheid ${euro(b.abzug_lohn_soli)}. Bei Änderungsbescheiden: Bereits im Erstbescheid angerechnete Beträge erscheinen als 0.` } : {}),
    },
    { label: 'Abzug KiSt (Lohn)', berechnung: d.kirchensteuer_lohn, bescheid: b.abzug_lohn_kist },
    { label: 'Abzug Kapitalertragsteuer', berechnung: Math.round(d.abgeltungsteuer_gezahlt), bescheid: b.abzug_kapest,
      ...(Math.round(d.abgeltungsteuer_gezahlt) !== b.abzug_kapest ? { tooltip: `Berechnung ${euro(Math.round(d.abgeltungsteuer_gezahlt))} vs. Bescheid ${euro(b.abzug_kapest)}. Differenz durch Banken die in der Steuererklärung anders eingereicht wurden als in der App erfasst (z.B. Gemeinschaftskonto auf Ignorieren, Broker nicht eingereicht).` } : {}),
    },
    { label: 'Abzug Soli (Kapital)', berechnung: Math.round(d.soli_kapital_gezahlt * 100) / 100, bescheid: b.abzug_soli_kapest,
      ...(Math.round(d.soli_kapital_gezahlt * 100) / 100 !== b.abzug_soli_kapest ? { tooltip: 'Gleiche Ursache wie KapESt — Differenz durch Banken die in der Steuererklärung anders eingereicht wurden als in der App erfasst.' } : {}),
    },
    { label: 'Zinsen zur Einkommensteuer', berechnung: d.nachzahlungszinsen, bescheid: b.nachzahlungszinsen },
    { label: 'Verspätungszuschlag', berechnung: d.verspaetungszuschlag, bescheid: b.verspaetungszuschlag },
    { label: 'Erstattung / Nachzahlung', berechnung: e.erstattung_nachzahlung, bescheid: b.erstattung, bold: true },
  ];

  const abweichungGesamt = hasBescheid
    ? Math.abs(e.erstattung_nachzahlung - b.erstattung)
    : null;

  return (
    <div className="min-h-screen">
      <JahrNavigation jahr={jahr} />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {!hasBescheid && (
          <div className="rounded-xl border border-yellow-700/50 bg-yellow-900/20 p-4 text-sm text-yellow-300">
            Noch keine Bescheiddaten erfasst.{' '}
            <Link to={`/jahr/${jahr}/bescheid`} className="underline hover:text-yellow-200">
              Jetzt Bescheid eingeben
            </Link>
          </div>
        )}

        {hasBescheid && abweichungGesamt != null && (
          <div className={`rounded-xl border p-4 text-sm font-medium ${
            abweichungGesamt < 1
              ? 'border-emerald-700/50 bg-emerald-900/20 text-emerald-300'
              : abweichungGesamt <= 5
                ? 'border-yellow-700/50 bg-yellow-900/20 text-yellow-300'
                : 'border-red-700/50 bg-red-900/20 text-red-300'
          }`}>
            Gesamtabweichung Erstattung: {euro(abweichungGesamt)}
            {abweichungGesamt < 1 && ' — Berechnung stimmt überein!'}
          </div>
        )}

        <VergleichSection title="Einkünfte" zeilen={einkuenfte} />
        <VergleichSection title="Sonderausgaben" zeilen={sonderausgaben} />
        <VergleichSection title="Einkommen" zeilen={einkommen} />
        <VergleichSection title="Steuerberechnung" zeilen={steuer} />
        <VergleichSection title="Festsetzung & Erstattung" zeilen={festsetzung} />
      </main>
    </div>
  );
}
