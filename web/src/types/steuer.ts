/** Tarifzonen-Koeffizienten nach § 32a EStG */
export interface TarifConfig {
  z3_start: number;
  z2_faktor1: number;
  z2_faktor2: number;
  z3_faktor1: number;
  z3_faktor2: number;
  z3_add: number;
  z4_start: number;
  z4_faktor: number;
  z4_sub: number;
  z5_start: number;
  z5_faktor: number;
  z5_sub: number;
}

/** Jahreskonfiguration für die Steuerberechnung */
export interface JahresConfig {
  gfb: number;
  werbungskostenpauschale: number;
  vorsorgeAbzug: number;
  max_vorsorge_rv: number;
  homeofficePauschaleProTag: number;
  homeofficePauschaleMaxTage: number;
  entfernungspauschale_basis: number;
  entfernungspauschale_erhoeht: number;
  entfernungspauschale_erhoeht_ab_km: number;
  krankengeld_kuerzung: number;
  sonderausgabenPauschbetrag: number;
  soli_freigrenze: number;
  kirchensteuerSatz: number;
  tarif: TarifConfig;
}

/** Eingabedaten für die Steuerberechnung */
export interface SteuerEingabe {
  jahr: number;
  verheiratet: boolean;
  bruttogehalt: number;
  lohnsteuer: number;
  soli_gezahlt: number;
  kirchensteuer_gezahlt: number;
  rentenversicherung_an: number;
  rentenversicherung_ag: number;
  krankenversicherung: number;
  pflegeversicherung: number;
  arbeitslosenversicherung: number;
  entfernung_km: number;
  arbeitstage: number;
  homeoffice_tage: number;
  arbeitsmittel: number;
  spenden: number;
  sonstige_versicherungen: number;
  kapitalertraege: number;
  kapitalertraege_quellensteuer: number;
  freistellungsauftrag: number;
  auslaendische_einkuenfte: number;
  haushaltsnahe_dienstleistungen: number;
  handwerkerleistungen: number;
  kirchensteuerSatz: number;
}

/** Berechnungsergebnis */
export interface SteuerErgebnis {
  // Einkommen
  bruttogehalt: number;
  werbungskosten: number;
  sonderausgaben: number;
  zvE: number;

  // Steuerbeträge
  einkommensteuer: number;
  solidaritaetszuschlag: number;
  kirchensteuer: number;
  kapitalertragsteuer: number;
  soli_auf_kapital: number;
  steuer_gesamt: number;

  // Bereits gezahlt
  bereits_gezahlt: number;

  // Differenz (negativ = Erstattung)
  differenz: number;

  // Effektiver Steuersatz
  effektiver_steuersatz: number;

  // Werbungskosten-Details
  entfernungspauschale: number;
  homeoffice_pauschale: number;

  // Steuerermäßigungen § 35a
  ermaessigung_35a: number;
}

/** Verfügbare Jahre */
export type Steuerjahr = 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026;
