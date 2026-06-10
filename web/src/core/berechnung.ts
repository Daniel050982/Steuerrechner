import type { JahresConfig } from '../types/steuer';
import type { HistorischeEingabe } from '../data/steuerdaten';
import type { HistorischesErgebnis } from '../data/ergebnisse';
import type { BankEintrag } from '../data/banken';
import { getConfig } from './config';

// ---------------------------------------------------------------------------
// § 32a EStG Tarifberechnung
// ---------------------------------------------------------------------------

function berechneEinkommensteuer(zvE: number, verheiratet: boolean, config: JahresConfig): number {
  const x = verheiratet ? Math.floor(zvE / 2) : Math.floor(zvE);
  const t = config.tarif;

  if (x <= config.gfb) return 0;

  let est: number;

  if (x <= t.z3_start) {
    const y = (x - config.gfb) / 10000;
    est = (t.z2_faktor1 * y + t.z2_faktor2) * y;
  } else if (x <= t.z4_start) {
    const y = (x - t.z3_start) / 10000;
    est = (t.z3_faktor1 * y + t.z3_faktor2) * y + t.z3_add;
  } else if (x <= t.z5_start) {
    est = t.z4_faktor * x - t.z4_sub;
  } else {
    est = t.z5_faktor * x - t.z5_sub;
  }

  est = Math.floor(est);
  return verheiratet ? est * 2 : est;
}

// ---------------------------------------------------------------------------
// § 4 SolZG Solidaritätszuschlag mit Milderungszone
// ---------------------------------------------------------------------------

function berechneSoli(est: number, freigrenze: number): number {
  if (est <= freigrenze) return 0;

  const soli_voll = Math.floor(est * 0.055 * 100) / 100;
  const soli_milderung = Math.floor((est - freigrenze) * 0.20 * 100) / 100;
  return Math.min(soli_voll, soli_milderung);
}

// ---------------------------------------------------------------------------
// Banken-Aggregation: Anteilsfaktoren
// ---------------------------------------------------------------------------

export function getAnteil(b: BankEintrag): number {
  const t = b.typ.toLowerCase();
  if (t === 'gemeinschaft 50%' || t === 'gemeinschaft 50% (kapest voll)') return 0.5;
  if (t === 'gemeinschaft 33%') return 1 / 3;
  return 1.0;
}

export function getAnteilKapESt(b: BankEintrag): number {
  const t = b.typ.toLowerCase();
  if (t === 'gemeinschaft 50% (kapest voll)') return 1.0;
  if (t === 'gemeinschaft 50%') return 0.5;
  if (t === 'gemeinschaft 33%') return 1 / 3;
  return 1.0;
}

export function istKrypto(b: BankEintrag): boolean {
  return b.typ.toLowerCase() === 'krypto';
}

export function istIgnoriert(b: BankEintrag): boolean {
  const t = b.typ.toLowerCase();
  return t === 'ignorieren' || t === 'ignore' || t === 'nein' || t === 'no' || t === '-';
}

// ---------------------------------------------------------------------------
// Hauptberechnung – 1:1 Port von berechnung.gs / berechneJahresdaten()
// ---------------------------------------------------------------------------

export function berechneJahresdaten(
  daten: HistorischeEingabe,
  banken: BankEintrag[],
): HistorischesErgebnis {
  const jahr = daten.jahr;
  const config = getConfig(jahr);
  const verheiratet = daten.verheiratet;
  const guenstiger = daten.guenstigerpruefung;
  const vortragAktiv = daten.verlustvortraege_anwenden;

  // === Werbungskosten ===

  const brutto = daten.bruttogehalt;
  const fahrtTage = daten.fahrt_tage;
  const fahrtKm = daten.entfernung_km;
  const arbeitsmittel = daten.arbeitsmittel;
  const sonstigeWK = daten.sonstige_werbungskosten;
  const homeofficeTage = daten.homeoffice_tage;

  const homeofficePauschale = Math.min(
    homeofficeTage * config.homeofficePauschaleProTag,
    config.homeofficePauschaleMaxTage * config.homeofficePauschaleProTag,
  );

  let entfernungspauschale = 0;
  if (fahrtKm > 0 && fahrtTage > 0) {
    const kmBasis = Math.min(fahrtKm, config.entfernungspauschale_erhoeht_ab_km - 1);
    const kmErhoeht = Math.max(0, fahrtKm - kmBasis);
    entfernungspauschale = Math.ceil(
      fahrtTage * (kmBasis * config.entfernungspauschale_basis + kmErhoeht * config.entfernungspauschale_erhoeht),
    );
  }

  const verpflegung = Math.max(0, daten.verpflegungsmehraufwand - (daten.verpflegung_stfr_erstattung ?? 0));
  const tatsaechlicheWK = entfernungspauschale + arbeitsmittel + sonstigeWK + verpflegung;
  const werbungskosten = Math.floor(Math.max(tatsaechlicheWK + homeofficePauschale, config.werbungskostenpauschale));

  // === Krypto §23 / §22 / §20 aus Steuerdaten ===

  const kryptoSO_manual = daten.estg_23;
  const vortrag23 = vortragAktiv ? daten.verlustvortrag_23 : 0;
  const sonstigeSO_manual = daten.estg_22;

  // === Sonderausgaben / Vorsorgeaufwendungen ===

  let gesamt_rv: number;
  let ag_rv: number;
  let an_kv_gesamt: number;
  let an_kv_regulaer: number;
  let an_pv: number;

  const erstatteteRV = daten.erstattete_rv ?? 0;
  const beitragsrueckKV = daten.beitragsrueckerstattung_kv ?? 0;

  gesamt_rv = Math.round(Math.min(daten.rv_an + daten.rv_ag, config.max_vorsorge_rv));
  ag_rv = Math.round(daten.rv_ag);
  an_kv_gesamt = Math.ceil(daten.kv_an_gesamt);
  an_kv_regulaer = daten.kv_an_regulaer > 0 ? Math.ceil(daten.kv_an_regulaer) : 0;
  an_pv = Math.ceil(daten.pv_an);
  const spenden = Math.floor(daten.spenden);

  const anteil_rv_bescheid = Math.ceil(gesamt_rv * config.vorsorgeAbzug);
  const abziehbareRV = Math.max(0, anteil_rv_bescheid - ag_rv - erstatteteRV);

  const kv_gerundet = an_kv_gesamt;
  const kv_kuerz_basis = an_kv_regulaer > 0 ? an_kv_regulaer : kv_gerundet;
  const kv_kuerzung = Math.floor(kv_kuerz_basis * config.krankengeld_kuerzung);
  const abziehbareKV = Math.max(0, kv_gerundet - kv_kuerzung - beitragsrueckKV);
  const abziehbarePV = an_pv;

  const vorsorge_basis = abziehbareKV + abziehbarePV;
  const weitereVers = daten.weitere_versicherungen + (daten.auslands_sv ?? 0);
  const hoechstbetragBasis = daten.krankenversichert === 'privat' ? 2800 : 1900;
  const hoechstbetrag = verheiratet ? hoechstbetragBasis * 2 : hoechstbetragBasis;
  const abziehbareWeitereVers = vorsorge_basis < hoechstbetrag
    ? Math.min(weitereVers, hoechstbetrag - vorsorge_basis)
    : 0;

  const saPauschbetrag = verheiratet
    ? config.sonderausgabenPauschbetrag * 2
    : config.sonderausgabenPauschbetrag;
  const sonstigeSA = Math.max(Math.floor(spenden), saPauschbetrag);

  const sonderausgaben = abziehbareRV + vorsorge_basis + abziehbareWeitereVers + sonstigeSA;

  // === Banken-Aggregation ===

  const bankenJahr = banken.filter(b => b.jahr === jahr);
  const bankenAktiv = bankenJahr.filter(b => !istIgnoriert(b));
  const bankenNormal = bankenAktiv.filter(b => !istKrypto(b));
  const bankenKrypto = bankenAktiv.filter(b => istKrypto(b));

  const kapitalBanken = bankenNormal.reduce((s, b) => s + b.kapitalertraege * getAnteil(b), 0);
  const abgeltBanken = bankenNormal.reduce((s, b) => s + b.kapitalertragsteuer * getAnteilKapESt(b), 0);
  const soliBanken = bankenNormal.reduce((s, b) => s + b.soli_kapital * getAnteilKapESt(b), 0);
  const invStgBanken = bankenNormal.reduce((s, b) => s + b.invstg_56 * getAnteil(b), 0);
  const zugeflossenBanken = bankenNormal.reduce((s, b) => s + b.fiktiv_zugeflossen * getAnteil(b), 0);
  const verlusteBanken = bankenNormal.reduce((s, b) => s + b.broker_verluste * getAnteil(b), 0);

  const kryptoKapBanken = bankenKrypto.reduce((s, b) => s + b.estg_20, 0);
  const kryptoSO_banken = bankenAktiv.reduce((s, b) => s + b.estg_23, 0);
  const sonstigeSO_banken = bankenAktiv.reduce((s, b) => s + b.estg_22, 0);

  // Override-Logik: Steuerdaten-Tab hat Vorrang wenn ≠ 0
  const kryptoSO = kryptoSO_manual !== 0 ? kryptoSO_manual : kryptoSO_banken;
  const sonstigeSO = sonstigeSO_manual !== 0 ? sonstigeSO_manual : sonstigeSO_banken;

  // §23 Freigrenze: Gewinne unter 600€ (bis 2023) bzw. 1.000€ (ab 2024) sind steuerfrei
  const freigrenze23 = jahr >= 2024 ? 1000 : 600;
  const kryptoSO_nachFreigrenze = (kryptoSO > 0 && kryptoSO < freigrenze23) ? 0 : kryptoSO;

  // §23 Verlustvortrag-Verrechnung
  const kryptoSO_netto = kryptoSO_nachFreigrenze - vortrag23;
  const kryptoSO_stpfl = Math.max(kryptoSO_netto, 0);
  const vortrag23_verrechnet = Math.min(vortrag23, Math.max(kryptoSO_nachFreigrenze, 0));
  const vortrag23_verbleibend = vortrag23 + Math.max(-kryptoSO_nachFreigrenze, 0) - vortrag23_verrechnet;

  // Summe der inländischen Einkünfte
  const summe_einkuenfte_inland =
    Math.floor(brutto - werbungskosten)
    + Math.round(kryptoSO_stpfl)
    + Math.round(sonstigeSO);

  // === zvE Inland ===
  const zvE_inland = Math.max(summe_einkuenfte_inland - sonderausgaben, 0);

  // === Kapitalerträge & Günstigerprüfung ===

  const kapitalOverride = daten.kapitalertraege_gesamt;
  const sonstigeKapManual = daten.estg_20;

  const kapitalBruttoFuerBerechnung = bankenNormal.length > 0
    ? (kapitalBanken - invStgBanken + zugeflossenBanken)
    : kapitalOverride;

  const sonstigeKap = sonstigeKapManual !== 0 ? sonstigeKapManual : kryptoKapBanken;

  // §20 Verlustvortrag
  const vortrag20 = vortragAktiv ? daten.verlustvortrag_20 : 0;
  const jstg2024Aktiv = daten.jstg_2024_anwenden;

  const sonstigeKap_nachVortrag = (!jstg2024Aktiv && sonstigeKap > 0)
    ? Math.max(sonstigeKap - vortrag20, 0)
    : sonstigeKap;

  const kapitalVorAbzug = kapitalBruttoFuerBerechnung + sonstigeKap_nachVortrag + verlusteBanken;

  const vortrag20_verrechnet_termin = !jstg2024Aktiv
    ? Math.min(vortrag20, Math.max(sonstigeKap, 0))
    : 0;
  const vortrag20_restNachTermin = vortrag20 - vortrag20_verrechnet_termin;
  const vortrag20_gegenKapital = jstg2024Aktiv
    ? Math.min(vortrag20_restNachTermin, Math.max(0, kapitalVorAbzug))
    : 0;

  const kapital = kapitalVorAbzug - vortrag20_gegenKapital;

  const vortrag20_verrechnet = vortrag20_verrechnet_termin + vortrag20_gegenKapital;
  const vortrag20_verbleibend = vortrag20 + Math.max(-sonstigeKap, 0) - vortrag20_verrechnet;

  // Sparer-Pauschbetrag: gesetzlicher Betrag (nicht Broker-Wert)
  const sparerPauschbetragBasis = jahr >= 2023 ? 1000 : 801;
  const pauschbetrag = verheiratet ? sparerPauschbetragBasis * 2 : sparerPauschbetragBasis;

  const steuerpflichtigeKapErtr_berechnet = Math.max(kapital - pauschbetrag, 0);
  const steuerpflichtigeKapErtr_override = daten.steuerpflichtige_kapitalertraege;
  const steuerpflichtigeKapErtr = (steuerpflichtigeKapErtr_override != null && steuerpflichtigeKapErtr_override > 0)
    ? steuerpflichtigeKapErtr_override
    : steuerpflichtigeKapErtr_berechnet;

  // Option A: Abgeltungsteuer
  const kapESt_abgelt = Math.round(steuerpflichtigeKapErtr * 0.25);
  const soliAufKap_abgelt = Math.floor(kapESt_abgelt * 0.055 * 100) / 100;

  // === Progressionsvorbehalt (§ 32b EStG) ===

  // Progressionsvorbehalt: steuerfreier Arbeitslohn geht ungekürzt ein (SV wird separat als Sonderausgabe berücksichtigt)
  const zvE_ausland = Math.floor(daten.auslandseinkuenfte);

  const zvE_fuerSatz_ohneKap = zvE_inland + zvE_ausland;
  const zvE_fuerSatz_mitKap = zvE_inland + Math.floor(steuerpflichtigeKapErtr) + zvE_ausland;

  const est_fiktiv_ohneKap = berechneEinkommensteuer(zvE_fuerSatz_ohneKap, verheiratet, config);
  const satz_ohneKap = zvE_fuerSatz_ohneKap > 0 ? est_fiktiv_ohneKap / zvE_fuerSatz_ohneKap : 0;
  const estAufInland_ohneKap = Math.round(zvE_inland * satz_ohneKap);

  const est_fiktiv_mitKap = berechneEinkommensteuer(zvE_fuerSatz_mitKap, verheiratet, config);
  const satz_mitKap = zvE_fuerSatz_mitKap > 0 ? est_fiktiv_mitKap / zvE_fuerSatz_mitKap : 0;
  const estAufInland_mitKap = Math.round((zvE_inland + Math.floor(steuerpflichtigeKapErtr)) * satz_mitKap);

  // Günstigerprüfung: Vergleich (inkl. Soli + KiSt auf beiden Seiten)
  const soli_freigrenze_gp = verheiratet ? config.soli_freigrenze * 2 : config.soli_freigrenze;
  const soliA = berechneSoli(estAufInland_ohneKap, soli_freigrenze_gp);
  const soliB = berechneSoli(estAufInland_mitKap, soli_freigrenze_gp);
  const kistA = config.kirchensteuerSatz > 0
    ? Math.round(estAufInland_ohneKap * config.kirchensteuerSatz) + daten.kirchensteuer_kapital
    : 0;
  const kistB = config.kirchensteuerSatz > 0
    ? Math.round(estAufInland_mitKap * config.kirchensteuerSatz)
    : 0;
  const belastungA = estAufInland_ohneKap + soliA + kistA + kapESt_abgelt + soliAufKap_abgelt;
  const belastungB = estAufInland_mitKap + soliB + kistB;
  const guenstigerGreift = guenstiger && (belastungB < belastungA);

  const estAufInland = guenstigerGreift ? estAufInland_mitKap : estAufInland_ohneKap;
  const zvE_fuerSatz = guenstigerGreift ? zvE_fuerSatz_mitKap : zvE_fuerSatz_ohneKap;
  const effektiverSatz = guenstigerGreift ? satz_mitKap : satz_ohneKap;

  let kapESt = kapESt_abgelt;
  let soliAufKap = soliAufKap_abgelt;
  if (guenstigerGreift) {
    kapESt = 0;
    soliAufKap = 0;
  }

  // === Steuerermäßigungen § 35a ===

  const haushaltsnahe = daten.haushaltsnahe_dienstleistungen;
  const handwerker = daten.handwerkerleistungen;
  const haushaltsnachlass = Math.round(Math.min(haushaltsnahe * 0.20, 4000));
  const handwerkerNachlass = Math.round(Math.min(handwerker * 0.20, 1200));

  // Anrechenbare ausländische Steuer (§ 34c)
  const auslandssteuer = daten.anrechenbare_auslandssteuer;

  // === Gesamtsteuerlast ===

  const estNachErmaessigung = Math.max(estAufInland - haushaltsnachlass - handwerkerNachlass - auslandssteuer, 0);

  // === Soli auf ESt (Bemessungsgrundlage = festzusetzende ESt, also NACH §35a und §34c) ===

  const soli_freigrenze = verheiratet ? config.soli_freigrenze * 2 : config.soli_freigrenze;
  const soliAufEst = berechneSoli(estNachErmaessigung, soli_freigrenze);

  // === Kirchensteuer (ebenfalls auf festzusetzende ESt) ===

  const kirchensteuer = config.kirchensteuerSatz > 0
    ? Math.round(estNachErmaessigung * config.kirchensteuerSatz)
    : 0;

  const kirchensteuerKapital = guenstigerGreift ? 0 : daten.kirchensteuer_kapital;

  // === Nebenforderungen ===

  const zinsen = daten.nachzahlungszinsen;
  const verspaetung = daten.verspaetungszuschlag;
  const summeNebenkosten = zinsen + verspaetung;

  const steuerGesamt =
    estNachErmaessigung
    + kapESt
    + soliAufEst
    + soliAufKap
    + kirchensteuer
    + kirchensteuerKapital
    + summeNebenkosten;

  // === Gezahlte Steuer ===

  const gezahlt =
    Math.round(daten.lohnsteuer)
    + daten.soli_lohn
    + daten.kirchensteuer_lohn
    + daten.kirchensteuer_kapital
    + Math.round(daten.abgeltungsteuer_gezahlt)
    + daten.soli_kapital_gezahlt
    + daten.steuern_krypto_gezahlt;

  const differenz = gezahlt - steuerGesamt;

  // === Abweichung zum Bescheid ===

  const bekannteErstattung = daten.erstattung_bescheid;
  let abweichung: number | null = null;
  if (bekannteErstattung != null) {
    abweichung = Math.abs(differenz - bekannteErstattung);
  }

  return {
    jahr,
    bruttogehalt: brutto,
    werbungskosten,
    sonderausgaben,
    einkuenfte_arbeit: Math.floor(brutto - werbungskosten) - sonderausgaben,

    estg_23_brutto: Math.round(kryptoSO),
    estg_23_vortrag_verrechnet: Math.round(vortrag23_verrechnet),
    estg_23_steuerpflichtig: Math.round(kryptoSO_stpfl),
    estg_23_vortrag_ende: vortrag23_verbleibend,

    estg_22: Math.round(sonstigeSO),

    estg_20_brutto: sonstigeKap,
    estg_20_vortrag_verrechnet: vortrag20_verrechnet,
    estg_20_steuerpflichtig: sonstigeKap_nachVortrag,
    estg_20_vortrag_ende: vortrag20_verbleibend,

    kapitalertraege_basis: kapitalBruttoFuerBerechnung,
    steuerpflichtige_kapitalertraege: steuerpflichtigeKapErtr,
    kapitalertragsteuer: kapESt,
    soli_kapital: soliAufKap,

    auslandseinkommen: zvE_ausland,
    gesamteinkommen_steuersatz: zvE_fuerSatz,
    zvE_inland,
    effektiver_steuersatz: Math.round(effektiverSatz * 10000) / 100,

    einkommensteuer: Math.round(estAufInland),
    solidaritaetszuschlag: soliAufEst,
    kirchensteuer,
    steuerlast_gesamt: steuerGesamt,
    gezahlte_steuer: gezahlt,
    erstattung_nachzahlung: differenz,
    zinsen_zuschlaege: summeNebenkosten,
    abweichung_bescheid: abweichung,
  };
}

// ---------------------------------------------------------------------------
// Vereinfachte Berechnung für den Quick-Calculator (SteuerContext)
// Nutzt dieselbe Kernlogik, mapped SteuerEingabe → HistorischeEingabe
// ---------------------------------------------------------------------------

import type { SteuerEingabe, SteuerErgebnis } from '../types/steuer';

export function berechne(eingabe: SteuerEingabe): SteuerErgebnis {
  const daten: HistorischeEingabe = {
    jahr: eingabe.jahr,
    bruttogehalt: eingabe.bruttogehalt,
    lohnsteuer: eingabe.lohnsteuer,
    soli_lohn: eingabe.soli_gezahlt,
    kirchensteuer_lohn: eingabe.kirchensteuer_gezahlt,
    kapitalertraege_gesamt: eingabe.kapitalertraege,
    sparer_pauschbetrag: eingabe.freistellungsauftrag,
    steuerpflichtige_kapitalertraege: null,
    abgeltungsteuer_gezahlt: eingabe.kapitalertraege_quellensteuer,
    soli_kapital_gezahlt: 0,
    kirchensteuer_kapital: 0,
    estg_23: 0,
    verlustvortrag_23: 0,
    estg_22: 0,
    estg_20: 0,
    verlustvortrag_20: 0,
    steuern_krypto_gezahlt: 0,
    verlustvortraege_anwenden: false,
    jstg_2024_anwenden: false,
    auslandseinkuenfte: eingabe.auslaendische_einkuenfte,
    auslands_sv: 0,
    anrechenbare_auslandssteuer: 0,
    rv_an: eingabe.rentenversicherung_an,
    rv_ag: eingabe.rentenversicherung_ag,
    kv_an_gesamt: eingabe.krankenversicherung,
    kv_an_regulaer: eingabe.krankenversicherung,
    pv_an: eingabe.pflegeversicherung,
    kv_ag: 0,
    pv_ag: 0,
    erstattete_rv: 0,
    beitragsrueckerstattung_kv: 0,
    weitere_versicherungen: eingabe.sonstige_versicherungen,
    spenden: eingabe.spenden,
    fahrt_tage: eingabe.arbeitstage,
    entfernung_km: eingabe.entfernung_km,
    homeoffice_tage: eingabe.homeoffice_tage,
    verpflegungsmehraufwand: 0,
    verpflegung_stfr_erstattung: 0,
    arbeitsmittel: eingabe.arbeitsmittel,
    sonstige_werbungskosten: 0,
    haushaltsnahe_dienstleistungen: eingabe.haushaltsnahe_dienstleistungen,
    handwerkerleistungen: eingabe.handwerkerleistungen,
    steuerklasse: 1,
    verheiratet: eingabe.verheiratet,
    kinder: 0,
    krankenversichert: 'gesetzlich',
    guenstigerpruefung: false,
    erstattung_bescheid: null,
    nachzahlungszinsen: 0,
    verspaetungszuschlag: 0,
  };

  const config = getConfig(eingabe.jahr);
  const voll = berechneJahresdaten(daten, []);

  // KiSt: config.kirchensteuerSatz ist 0, also berechneJahresdaten liefert KiSt=0.
  // Hier berechnen wir KiSt auf Basis von eingabe.kirchensteuerSatz und addieren sie zur Gesamtlast.
  const kirchensteuer = eingabe.kirchensteuerSatz > 0
    ? Math.round(voll.einkommensteuer * eingabe.kirchensteuerSatz)
    : 0;
  const steuerGesamt = voll.steuerlast_gesamt - voll.kirchensteuer + kirchensteuer;
  const differenz = voll.gezahlte_steuer - steuerGesamt;

  const hoTage = Math.min(eingabe.homeoffice_tage, config.homeofficePauschaleMaxTage);
  const hoPauschale = hoTage * config.homeofficePauschaleProTag;
  let entfPausch = 0;
  if (eingabe.entfernung_km > 0 && eingabe.arbeitstage > 0) {
    const kmBasis = Math.min(eingabe.entfernung_km, config.entfernungspauschale_erhoeht_ab_km - 1);
    const kmErhoeht = Math.max(0, eingabe.entfernung_km - kmBasis);
    entfPausch = Math.ceil(
      eingabe.arbeitstage * (kmBasis * config.entfernungspauschale_basis + kmErhoeht * config.entfernungspauschale_erhoeht),
    );
  }

  return {
    bruttogehalt: voll.bruttogehalt,
    werbungskosten: voll.werbungskosten,
    sonderausgaben: voll.sonderausgaben,
    zvE: voll.zvE_inland,
    einkommensteuer: voll.einkommensteuer,
    solidaritaetszuschlag: voll.solidaritaetszuschlag,
    kirchensteuer,
    kapitalertragsteuer: voll.kapitalertragsteuer,
    soli_auf_kapital: voll.soli_kapital,
    steuer_gesamt: steuerGesamt,
    bereits_gezahlt: voll.gezahlte_steuer,
    differenz,
    effektiver_steuersatz: voll.effektiver_steuersatz,
    entfernungspauschale: entfPausch,
    homeoffice_pauschale: hoPauschale,
    ermaessigung_35a: Math.round(Math.min(eingabe.haushaltsnahe_dienstleistungen * 0.20, 4000))
      + Math.round(Math.min(eingabe.handwerkerleistungen * 0.20, 1200)),
  };
}
