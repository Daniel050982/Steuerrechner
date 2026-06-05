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
  steuerlast_gesamt: number;
  gezahlte_steuer: number;
  erstattung_nachzahlung: number;
  zinsen_zuschlaege: number;
  abweichung_bescheid: number | null;
}

export const ergebnisse: Record<number, HistorischesErgebnis> = {
  2019: {
    jahr: 2019,
    bruttogehalt: 6250.00,
    werbungskosten: 1000.00,
    sonderausgaben: 3158.00,
    einkuenfte_arbeit: 2092.00,
    estg_23_brutto: 0,
    estg_23_vortrag_verrechnet: 0,
    estg_23_steuerpflichtig: 0,
    estg_23_vortrag_ende: 0,
    estg_22: 0,
    estg_20_brutto: 0,
    estg_20_vortrag_verrechnet: 0,
    estg_20_steuerpflichtig: 0,
    estg_20_vortrag_ende: 0,
    kapitalertraege_basis: 0,
    steuerpflichtige_kapitalertraege: 0,
    kapitalertragsteuer: 0,
    soli_kapital: 0,
    auslandseinkommen: 0,
    gesamteinkommen_steuersatz: 2092.00,
    zvE_inland: 2092.00,
    effektiver_steuersatz: 0,
    einkommensteuer: 0,
    steuerlast_gesamt: 0,
    gezahlte_steuer: 880.92,
    erstattung_nachzahlung: 880.92,
    zinsen_zuschlaege: 0,
    abweichung_bescheid: 0,
  },

  2020: {
    jahr: 2020,
    bruttogehalt: 39430.13,
    werbungskosten: 2575.00,
    sonderausgaben: 6581.00,
    einkuenfte_arbeit: 30274.13,
    estg_23_brutto: 0,
    estg_23_vortrag_verrechnet: 0,
    estg_23_steuerpflichtig: 0,
    estg_23_vortrag_ende: 0,
    estg_22: 0,
    estg_20_brutto: 0,
    estg_20_vortrag_verrechnet: 0,
    estg_20_steuerpflichtig: 0,
    estg_20_vortrag_ende: 0,
    kapitalertraege_basis: 30.23,
    steuerpflichtige_kapitalertraege: 0,
    kapitalertragsteuer: 0,
    soli_kapital: 0,
    auslandseinkommen: 0,
    gesamteinkommen_steuersatz: 30274.00,
    zvE_inland: 30274.00,
    effektiver_steuersatz: 17.41,
    einkommensteuer: 5271.00,
    steuerlast_gesamt: 5560.90,
    gezahlte_steuer: 6079.88,
    erstattung_nachzahlung: 518.98,
    zinsen_zuschlaege: 0,
    abweichung_bescheid: 0,
  },

  2021: {
    jahr: 2021,
    bruttogehalt: 24090.00,
    werbungskosten: 1000.00,
    sonderausgaben: 4238.00,
    einkuenfte_arbeit: 18852.00,
    estg_23_brutto: -992.13,
    estg_23_vortrag_verrechnet: 0,
    estg_23_steuerpflichtig: 0,
    estg_23_vortrag_ende: 992.13,
    estg_22: 0,
    estg_20_brutto: -8824.86,
    estg_20_vortrag_verrechnet: 0,
    estg_20_steuerpflichtig: -8824.86,
    estg_20_vortrag_ende: 8824.86,
    kapitalertraege_basis: 413.77,
    steuerpflichtige_kapitalertraege: 0,
    kapitalertragsteuer: 0,
    soli_kapital: 0,
    auslandseinkommen: 34452.00,
    gesamteinkommen_steuersatz: 53304.00,
    zvE_inland: 18852.00,
    effektiver_steuersatz: 24.94,
    einkommensteuer: 4702.00,
    steuerlast_gesamt: 4797.00,
    gezahlte_steuer: 1984.00,
    erstattung_nachzahlung: -2813.00,
    zinsen_zuschlaege: 133.00,
    abweichung_bescheid: 0,
  },

  2022: {
    jahr: 2022,
    bruttogehalt: 44217.00,
    werbungskosten: 1212.00,
    sonderausgaben: 7851.00,
    einkuenfte_arbeit: 35154.00,
    estg_23_brutto: -1292.40,
    estg_23_vortrag_verrechnet: 0,
    estg_23_steuerpflichtig: 0,
    estg_23_vortrag_ende: 2284.53,
    estg_22: 848.53,
    estg_20_brutto: -102.75,
    estg_20_vortrag_verrechnet: 1067.89,
    estg_20_steuerpflichtig: -102.75,
    estg_20_vortrag_ende: 7859.73,
    kapitalertraege_basis: 1170.64,
    steuerpflichtige_kapitalertraege: 172.00,
    kapitalertragsteuer: 43.00,
    soli_kapital: 2.36,
    auslandseinkommen: 1373.00,
    gesamteinkommen_steuersatz: 37376.00,
    zvE_inland: 36003.00,
    effektiver_steuersatz: 19.50,
    einkommensteuer: 7022.00,
    steuerlast_gesamt: 7154.36,
    gezahlte_steuer: 6646.03,
    erstattung_nachzahlung: -508.33,
    zinsen_zuschlaege: 125.00,
    abweichung_bescheid: 1.00,
  },

  2023: {
    jahr: 2023,
    bruttogehalt: 48347.13,
    werbungskosten: 1457.00,
    sonderausgaben: 9285.00,
    einkuenfte_arbeit: 37605.13,
    estg_23_brutto: 1707.76,
    estg_23_vortrag_verrechnet: 1707.76,
    estg_23_steuerpflichtig: 0,
    estg_23_vortrag_ende: 576.77,
    estg_22: 794.02,
    estg_20_brutto: 0,
    estg_20_vortrag_verrechnet: 406.28,
    estg_20_steuerpflichtig: 0,
    estg_20_vortrag_ende: 7453.45,
    kapitalertraege_basis: 406.28,
    steuerpflichtige_kapitalertraege: 0,
    kapitalertragsteuer: 0,
    soli_kapital: 0,
    auslandseinkommen: 0,
    gesamteinkommen_steuersatz: 38399.00,
    zvE_inland: 38399.00,
    effektiver_steuersatz: 19.02,
    einkommensteuer: 7302.00,
    steuerlast_gesamt: 7264.00,
    gezahlte_steuer: 7142.09,
    erstattung_nachzahlung: -121.91,
    zinsen_zuschlaege: 0,
    abweichung_bescheid: 562.00,
  },

  2024: {
    jahr: 2024,
    bruttogehalt: 53941.81,
    werbungskosten: 1230.00,
    sonderausgaben: 9911.00,
    einkuenfte_arbeit: 42800.81,
    estg_23_brutto: 2337.63,
    estg_23_vortrag_verrechnet: 576.77,
    estg_23_steuerpflichtig: 1760.86,
    estg_23_vortrag_ende: 0,
    estg_22: 599.09,
    estg_20_brutto: 0,
    estg_20_vortrag_verrechnet: 1143.44,
    estg_20_steuerpflichtig: 0,
    estg_20_vortrag_ende: 6310.01,
    kapitalertraege_basis: 1143.44,
    steuerpflichtige_kapitalertraege: 0,
    kapitalertragsteuer: 0,
    soli_kapital: 0,
    auslandseinkommen: 0,
    gesamteinkommen_steuersatz: 45160.00,
    zvE_inland: 45160.00,
    effektiver_steuersatz: 20.32,
    einkommensteuer: 9176.00,
    steuerlast_gesamt: 9176.00,
    gezahlte_steuer: 8290.71,
    erstattung_nachzahlung: -885.29,
    zinsen_zuschlaege: 0,
    abweichung_bescheid: null,
  },

  2025: {
    jahr: 2025,
    bruttogehalt: 56230.61,
    werbungskosten: 1230.00,
    sonderausgaben: 11183.00,
    einkuenfte_arbeit: 43817.61,
    estg_23_brutto: 0,
    estg_23_vortrag_verrechnet: 0,
    estg_23_steuerpflichtig: 0,
    estg_23_vortrag_ende: 0,
    estg_22: 0,
    estg_20_brutto: 0,
    estg_20_vortrag_verrechnet: 246.94,
    estg_20_steuerpflichtig: 0,
    estg_20_vortrag_ende: 6063.07,
    kapitalertraege_basis: 246.94,
    steuerpflichtige_kapitalertraege: 0,
    kapitalertragsteuer: 0,
    soli_kapital: 0,
    auslandseinkommen: 1062.00,
    gesamteinkommen_steuersatz: 44879.00,
    zvE_inland: 43817.00,
    effektiver_steuersatz: 19.88,
    einkommensteuer: 8710.00,
    steuerlast_gesamt: 8710.00,
    gezahlte_steuer: 8805.39,
    erstattung_nachzahlung: 95.39,
    zinsen_zuschlaege: 0,
    abweichung_bescheid: null,
  },
};
