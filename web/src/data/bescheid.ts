/** Alle Werte aus einem Einkommensteuerbescheid */
export interface BescheidDaten {
  jahr: number;

  // Festsetzung
  festgesetzt_est: number;
  festgesetzt_soli: number;
  festgesetzt_kist: number;
  abzug_lohn_est: number;
  abzug_lohn_soli: number;
  abzug_lohn_kist: number;
  abzug_kapest: number;
  abzug_soli_kapest: number;
  verbleibend_est: number;
  verbleibend_soli: number;
  verbleibend_kist: number;
  erstattung: number;

  // Einkünfte aus nichtselbständiger Arbeit
  bruttoarbeitslohn: number;
  wk_fahrt_tage: number;
  wk_fahrt_km: number;
  wk_fahrt_betrag: number;
  wk_fahrt_km_erhoeht: number;
  wk_fahrt_betrag_erhoeht: number;
  wk_fahrt_zusammen: number;
  wk_entfernungspauschale: number;
  wk_homeoffice: number;
  wk_verpflegung: number;
  wk_verpflegung_stfr: number;
  wk_verpflegung_verbleiben: number;
  wk_arbeitsmittel: number;
  wk_uebrige: number;
  wk_summe: number;
  wk_pauschbetrag: number;
  werbungskosten_bescheid: number;
  einkuenfte_nichtselbst: number;

  // Einkünfte aus Kapitalvermögen (Abgeltungsteuer §32d)
  kapital_ertraege: number;
  kapital_veraeuserung_alt: number;
  kapital_freibetrag_alt: number;
  kapital_zwischensumme: number;
  kapital_verrechnung_verluste: number;
  kapital_sparer_pauschbetrag: number;
  einkuenfte_kapital: number;

  // Sonstige Einkünfte (§22, §23)
  sonstige_veraeuserung: number;
  sonstige_veraeuserung_verluste: number;
  sonstige_veraeuserung_verbleiben: number;
  sonstige_leistungen: number;
  einkuenfte_sonstige: number;

  // Summe / Gesamtbetrag
  summe_einkuenfte: number;
  gesamtbetrag_einkuenfte: number;

  // Sonderausgaben — Altersvorsorge
  altersvorsorge_gesamt: number;
  altersvorsorge_prozent: number;
  altersvorsorge_abzug: number;
  altersvorsorge_ag_anteil: number;
  altersvorsorge_erstattete_rv: number;
  altersvorsorge_verbleiben: number;

  // Sonderausgaben — Kranken/Pflege
  kv_beitraege: number;
  kv_kuerzung: number;
  kv_verbleiben: number;
  pv_beitraege: number;
  vorsorge_kv_pv_summe: number;

  // Sonderausgaben — gesamt
  summe_vorsorge: number;
  sonderausgaben_unbeschraenkt: number;
  summe_sonderausgaben: number;

  // Einkommen
  einkommen: number;
  zve: number;

  // Steuerberechnung
  zve_tarif: number;
  tarif: 'grund' | 'splitting';
  est_laut_tarif: number;

  // Steuerermäßigungen §35a
  ermaessigung_35a_haushaltsnahe: number;
  ermaessigung_35a_handwerker: number;
  ermaessigung_35a: number;

  // Verbleiben + §32d Kapitalerträge
  est_verbleiben: number;
  kapital_32d_betrag: number;
  kapital_32d_steuer: number;
  festzusetzende_est: number;

  // Progressionsvorbehalt
  progressionseinkuenfte: number;

  // Soli
  soli_einkommensteuer: number;
  soli_bemessungsgrundlage: number;
  soli_freibleibend: number;
  soli_bemessung_nach_freigrenze: number;
  soli_prozent: number;
  soli_betrag: number;
  soli_kapital_32d_steuer: number;
  soli_kapital_32d_prozent: number;
  soli_kapital_32d_betrag: number;
  soli_festzusetzend: number;

  // Kirchensteuer
  kist_bemessungsgrundlage: number;
  kist_prozent: number;
  kist_betrag: number;

  // Zinsen & Zuschläge
  nachzahlungszinsen: number;
  verspaetungszuschlag: number;

  // Anrechenbare Steuern (§34c)
  anrechenbare_auslandssteuer: number;

  // Notiz
  notiz: string;
}

export function createEmptyBescheid(jahr: number): BescheidDaten {
  return {
    jahr,
    festgesetzt_est: 0, festgesetzt_soli: 0, festgesetzt_kist: 0,
    abzug_lohn_est: 0, abzug_lohn_soli: 0, abzug_lohn_kist: 0,
    abzug_kapest: 0, abzug_soli_kapest: 0,
    verbleibend_est: 0, verbleibend_soli: 0, verbleibend_kist: 0,
    erstattung: 0,
    bruttoarbeitslohn: 0,
    wk_fahrt_tage: 0, wk_fahrt_km: 0, wk_fahrt_betrag: 0,
    wk_fahrt_km_erhoeht: 0, wk_fahrt_betrag_erhoeht: 0, wk_fahrt_zusammen: 0,
    wk_entfernungspauschale: 0, wk_homeoffice: 0,
    wk_verpflegung: 0, wk_verpflegung_stfr: 0, wk_verpflegung_verbleiben: 0,
    wk_arbeitsmittel: 0, wk_uebrige: 0, wk_summe: 0, wk_pauschbetrag: 0,
    werbungskosten_bescheid: 0, einkuenfte_nichtselbst: 0,
    kapital_ertraege: 0, kapital_veraeuserung_alt: 0, kapital_freibetrag_alt: 0,
    kapital_zwischensumme: 0, kapital_verrechnung_verluste: 0, kapital_sparer_pauschbetrag: 0,
    einkuenfte_kapital: 0,
    sonstige_veraeuserung: 0, sonstige_veraeuserung_verluste: 0, sonstige_veraeuserung_verbleiben: 0,
    sonstige_leistungen: 0, einkuenfte_sonstige: 0,
    summe_einkuenfte: 0, gesamtbetrag_einkuenfte: 0,
    altersvorsorge_gesamt: 0, altersvorsorge_prozent: 0, altersvorsorge_abzug: 0,
    altersvorsorge_ag_anteil: 0, altersvorsorge_erstattete_rv: 0, altersvorsorge_verbleiben: 0,
    kv_beitraege: 0, kv_kuerzung: 0, kv_verbleiben: 0,
    pv_beitraege: 0, vorsorge_kv_pv_summe: 0,
    summe_vorsorge: 0, sonderausgaben_unbeschraenkt: 0, summe_sonderausgaben: 0,
    einkommen: 0, zve: 0,
    zve_tarif: 0, tarif: 'grund', est_laut_tarif: 0,
    ermaessigung_35a_haushaltsnahe: 0, ermaessigung_35a_handwerker: 0, ermaessigung_35a: 0,
    est_verbleiben: 0, kapital_32d_betrag: 0, kapital_32d_steuer: 0, festzusetzende_est: 0,
    progressionseinkuenfte: 0,
    soli_einkommensteuer: 0, soli_bemessungsgrundlage: 0, soli_freibleibend: 0, soli_bemessung_nach_freigrenze: 0, soli_prozent: 5.5, soli_betrag: 0,
    soli_kapital_32d_steuer: 0, soli_kapital_32d_prozent: 5.5, soli_kapital_32d_betrag: 0, soli_festzusetzend: 0,
    kist_bemessungsgrundlage: 0, kist_prozent: 0, kist_betrag: 0,
    nachzahlungszinsen: 0, verspaetungszuschlag: 0,
    anrechenbare_auslandssteuer: 0,
    notiz: '',
  };
}
