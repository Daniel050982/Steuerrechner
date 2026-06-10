export interface BankEintrag {
  bank: string;
  typ: 'Einzel' | 'Gemeinschaft 50%' | 'Gemeinschaft 50% (KapESt voll)' | 'Gemeinschaft 33%' | 'Krypto' | 'Ignorieren';
  jahr: number;
  kapitalertraege: number;
  kapitalertragsteuer: number;
  soli_kapital: number;
  kirchensteuer: number;
  sparer_pauschbetrag: number;
  invstg_56: number;
  fiktiv_zugeflossen: number;
  broker_verluste: number;
  estg_20: number;
  estg_23: number;
  estg_22: number;
  notiz: string;
}

export const bankenDaten: BankEintrag[] = [
  // --- 2025 ---
  { bank: 'Comdirect', typ: 'Einzel', jahr: 2025, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors', typ: 'Einzel', jahr: 2025, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'BB Bank', typ: 'Einzel', jahr: 2025, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Postbank', typ: 'Einzel', jahr: 2025, kapitalertraege: 246.94, kapitalertragsteuer: 61.74, soli_kapital: 3.39, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'CoinTracking', typ: 'Krypto', jahr: 2025, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },

  // --- 2024 ---
  { bank: 'Comdirect', typ: 'Einzel', jahr: 2024, kapitalertraege: 308.40, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 308.40, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors', typ: 'Einzel', jahr: 2024, kapitalertraege: 478.51, kapitalertragsteuer: 32.16, soli_kapital: 1.73, kirchensteuer: 0, sparer_pauschbetrag: 350.00, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors Gemeinschaftskonto', typ: 'Ignorieren', jahr: 2024, kapitalertraege: 64.93, kapitalertragsteuer: 16.23, soli_kapital: 0.89, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Scalable/Baader', typ: 'Einzel', jahr: 2024, kapitalertraege: 215.33, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 215.33, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'BB Bank', typ: 'Einzel', jahr: 2024, kapitalertraege: 141.20, kapitalertragsteuer: 35.30, soli_kapital: 1.94, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'CoinTracking', typ: 'Krypto', jahr: 2024, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 2337.63, estg_22: 599.09, notiz: '' },

  // --- 2023 ---
  { bank: 'Comdirect', typ: 'Einzel', jahr: 2023, kapitalertraege: 198.34, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 198.34, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors', typ: 'Einzel', jahr: 2023, kapitalertraege: 109.42, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 109.42, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors Gemeinschaftskonto', typ: 'Ignorieren', jahr: 2023, kapitalertraege: 39.24, kapitalertragsteuer: 9.81, soli_kapital: 0.53, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Scalable/Baader', typ: 'Einzel', jahr: 2023, kapitalertraege: 98.52, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 98.52, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'CoinTracking', typ: 'Krypto', jahr: 2023, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 127.25, estg_23: 1664.35, estg_22: 794.02, notiz: '' },

  // --- 2022 ---
  { bank: 'Comdirect', typ: 'Einzel', jahr: 2022, kapitalertraege: 1088.13, kapitalertragsteuer: 71.78, soli_kapital: 3.94, kirchensteuer: 0, sparer_pauschbetrag: 801.00, invstg_56: 19.46, fiktiv_zugeflossen: 3.22, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors', typ: 'Einzel', jahr: 2022, kapitalertraege: 77.19, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 77.19, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors Gemeinschaftskonto', typ: 'Gemeinschaft 50% (KapESt voll)', jahr: 2022, kapitalertraege: 6.83, kapitalertragsteuer: 1.71, soli_kapital: 0.09, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Scalable/Baader', typ: 'Einzel', jahr: 2022, kapitalertraege: 18.14, kapitalertragsteuer: 4.54, soli_kapital: 0.24, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: 'Nicht in der Steuererklärung 2022 eingereicht. KapESt 4,54 € + Soli 0,24 € wurden nicht erstattet.' },
  { bank: 'CoinTracking', typ: 'Krypto', jahr: 2022, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: -102.75, estg_23: -1292.40, estg_22: 848.53, notiz: '' },

  // --- 2021 ---
  { bank: 'Comdirect', typ: 'Einzel', jahr: 2021, kapitalertraege: 349.41, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 349.41, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors', typ: 'Einzel', jahr: 2021, kapitalertraege: 64.36, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 64.36, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'CoinTracking', typ: 'Krypto', jahr: 2021, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: -8824.86, estg_23: -992.13, estg_22: 0, notiz: '' },

  // --- 2020 ---
  { bank: 'Comdirect', typ: 'Einzel', jahr: 2020, kapitalertraege: 19.43, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 19.43, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
  { bank: 'Consors', typ: 'Einzel', jahr: 2020, kapitalertraege: 10.80, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 10.80, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },

  // --- 2019 ---
  { bank: 'Comdirect', typ: 'Einzel', jahr: 2019, kapitalertraege: 0, kapitalertragsteuer: 0, soli_kapital: 0, kirchensteuer: 0, sparer_pauschbetrag: 0, invstg_56: 0, fiktiv_zugeflossen: 0, broker_verluste: 0, estg_20: 0, estg_23: 0, estg_22: 0, notiz: '' },
];

export function getBankenFuerJahr(jahr: number): BankEintrag[] {
  return bankenDaten.filter((b) => b.jahr === jahr);
}
