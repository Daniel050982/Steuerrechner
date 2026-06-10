/** Historische Berechnungsergebnisse aus dem Google-Sheet (Steuer-Tab) */
export interface HistorischesErgebnis {
  jahr: number;
  // Einkommen & Abzüge
  bruttogehalt: number;
  werbungskosten: number;
  sonderausgaben: number;
  einkuenfte_arbeit: number;
  // §23 Private Veräußerungsgeschäfte
  estg_23_brutto: number;
  estg_23_vortrag_verrechnet: number;
  estg_23_steuerpflichtig: number;
  estg_23_vortrag_ende: number;
  // §22 Sonstige Einkünfte
  estg_22: number;
  // §20 Termingeschäfte
  estg_20_brutto: number;
  estg_20_vortrag_verrechnet: number;
  estg_20_steuerpflichtig: number;
  estg_20_vortrag_ende: number;
  // Kapitalerträge
  kapitalertraege_basis: number;
  steuerpflichtige_kapitalertraege: number;
  kapitalertragsteuer: number;
  soli_kapital: number;
  // Zu versteuerndes Einkommen
  auslandseinkommen: number;
  gesamteinkommen_steuersatz: number;
  zvE_inland: number;
  effektiver_steuersatz: number;
  // Steuerberechnung
  einkommensteuer: number;
  solidaritaetszuschlag: number;
  kirchensteuer: number;
  steuerlast_gesamt: number;
  gezahlte_steuer: number;
  erstattung_nachzahlung: number;
  zinsen_zuschlaege: number;
  abweichung_bescheid: number | null;
}
