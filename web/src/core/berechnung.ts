import type { SteuerEingabe, SteuerErgebnis, JahresConfig } from '../types/steuer';
import { getConfig } from './config';

/**
 * Einkommensteuer nach § 32a EStG (Grundtarif).
 * Bei Splitting wird zvE halbiert, Steuer verdoppelt.
 */
function berechneEinkommensteuer(zvE: number, config: JahresConfig, splitting: boolean): number {
  const x = splitting ? Math.floor(zvE / 2) : zvE;
  const t = config.tarif;
  let steuer: number;

  if (x <= config.gfb) {
    steuer = 0;
  } else if (x <= t.z3_start) {
    const y = (x - config.gfb) / 10000;
    steuer = (t.z2_faktor1 * y + t.z2_faktor2) * y;
  } else if (x <= t.z4_start) {
    const z = (x - t.z3_start) / 10000;
    steuer = (t.z3_faktor1 * z + t.z3_faktor2) * z + t.z3_add;
  } else if (x <= t.z5_start) {
    steuer = t.z4_faktor * x - t.z4_sub;
  } else {
    steuer = t.z5_faktor * x - t.z5_sub;
  }

  steuer = Math.floor(steuer);
  return splitting ? steuer * 2 : steuer;
}

/**
 * Solidaritätszuschlag mit Milderungszone.
 */
function berechneSoli(est: number, config: JahresConfig): number {
  if (est <= config.soli_freigrenze) return 0;

  const soli = est * 0.055;
  // Milderungszone: max 11,9% des Überschreitungsbetrags (ab 2021)
  if (config.soli_freigrenze > 1000) {
    const diff = est - config.soli_freigrenze;
    const milderung = diff * 0.119;
    return Math.min(soli, milderung);
  }
  return Math.round(soli * 100) / 100;
}

/**
 * Hauptberechnung: Nimmt Eingabedaten und liefert das Steuerergebnis.
 *
 * HINWEIS: Dies ist eine vereinfachte Basisversion der Berechnung.
 * Die vollständige Logik (Krypto, Verlustvorträge, Günstigerprüfung,
 * Progressionsvorbehalt etc.) kann schrittweise ergänzt werden.
 */
export function berechne(eingabe: SteuerEingabe): SteuerErgebnis {
  const config = getConfig(eingabe.jahr);

  // --- Werbungskosten ---
  const basisKm = Math.min(eingabe.entfernung_km, config.entfernungspauschale_erhoeht_ab_km - 1);
  const erhoehtKm = Math.max(0, eingabe.entfernung_km - (config.entfernungspauschale_erhoeht_ab_km - 1));
  const entfernungspauschale =
    (basisKm * config.entfernungspauschale_basis + erhoehtKm * config.entfernungspauschale_erhoeht)
    * eingabe.arbeitstage;

  const homeofficeTageEffektiv = Math.min(eingabe.homeoffice_tage, config.homeofficePauschaleMaxTage);
  const homeoffice_pauschale = homeofficeTageEffektiv * config.homeofficePauschaleProTag;

  const werbungskostenSumme = entfernungspauschale + homeoffice_pauschale + eingabe.arbeitsmittel;
  const werbungskosten = Math.max(werbungskostenSumme, config.werbungskostenpauschale);

  // --- Sonderausgaben (Vorsorgeaufwendungen) ---
  const rvGesamt = eingabe.rentenversicherung_an + eingabe.rentenversicherung_ag;
  const rvAbzug = Math.min(rvGesamt, config.max_vorsorge_rv) * config.vorsorgeAbzug - eingabe.rentenversicherung_ag;
  const rvAbzugEffektiv = Math.max(0, rvAbzug);

  const kvAbzug = eingabe.krankenversicherung * (1 - config.krankengeld_kuerzung);
  const pvAbzug = eingabe.pflegeversicherung;

  // Sonstige Versicherungen: nur innerhalb der 1.900 €-Grenze
  const basisVorsorge = kvAbzug + pvAbzug;
  const sonstigeVersicherungenAbzug = Math.max(0, Math.min(eingabe.sonstige_versicherungen, 1900 - basisVorsorge));

  const sonderausgaben = rvAbzugEffektiv + basisVorsorge + sonstigeVersicherungenAbzug + eingabe.spenden;

  // --- Zu versteuerndes Einkommen ---
  const zvE = Math.max(0, eingabe.bruttogehalt - werbungskosten - sonderausgaben);

  // --- Einkommensteuer ---
  const einkommensteuer = berechneEinkommensteuer(zvE, config, eingabe.verheiratet);

  // --- Soli ---
  const solidaritaetszuschlag = berechneSoli(einkommensteuer, config);

  // --- Kirchensteuer ---
  const kirchensteuer = eingabe.kirchensteuerSatz > 0
    ? Math.round(einkommensteuer * eingabe.kirchensteuerSatz * 100) / 100
    : 0;

  // --- Kapitalerträge (vereinfacht: Abgeltungsteuer 25%) ---
  const kapBasis = Math.max(0, eingabe.kapitalertraege - eingabe.freistellungsauftrag);
  const kapitalertragsteuer = Math.round(kapBasis * 0.25 * 100) / 100;
  const soli_auf_kapital = Math.round(kapitalertragsteuer * 0.055 * 100) / 100;

  // --- § 35a Ermäßigungen ---
  const ermaessigung_hh = Math.min(eingabe.haushaltsnahe_dienstleistungen * 0.20, 4000);
  const ermaessigung_hw = Math.min(eingabe.handwerkerleistungen * 0.20, 1200);
  const ermaessigung_35a = ermaessigung_hh + ermaessigung_hw;

  // --- Zusammenfassung ---
  const steuer_gesamt = Math.max(0,
    einkommensteuer + solidaritaetszuschlag + kirchensteuer
    + kapitalertragsteuer + soli_auf_kapital
    - ermaessigung_35a
  );

  const bereits_gezahlt =
    eingabe.lohnsteuer + eingabe.soli_gezahlt + eingabe.kirchensteuer_gezahlt
    + eingabe.kapitalertraege_quellensteuer;

  const differenz = Math.round((steuer_gesamt - bereits_gezahlt) * 100) / 100;

  const effektiver_steuersatz = eingabe.bruttogehalt > 0
    ? Math.round((steuer_gesamt / eingabe.bruttogehalt) * 10000) / 100
    : 0;

  return {
    bruttogehalt: eingabe.bruttogehalt,
    werbungskosten,
    sonderausgaben,
    zvE,
    einkommensteuer,
    solidaritaetszuschlag,
    kirchensteuer,
    kapitalertragsteuer,
    soli_auf_kapital,
    steuer_gesamt,
    bereits_gezahlt,
    differenz,
    effektiver_steuersatz,
    entfernungspauschale,
    homeoffice_pauschale,
    ermaessigung_35a,
  };
}
