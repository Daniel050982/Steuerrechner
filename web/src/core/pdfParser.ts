/**
 * Parser für deutsche Steuer-PDFs:
 * - Lohnsteuerbescheinigung (LStB)
 * - Jahressteuerbescheinigung der Bank
 * - CoinTracking Steuerreport
 */

import type { HistorischeEingabe } from '../data/steuerdaten';
import type { BankEintrag } from '../data/banken';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parst einen deutschen Geldbetrag: "1.234,56" → 1234.56 */
function parseEuro(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/EUR/gi, '')
    .replace(/\./g, '')   // Tausender-Punkte
    .replace(',', '.')     // Dezimal-Komma
    .replace(/[^\d.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

/** Sucht einen Betrag nach einem Pattern im Text. */
function findAmount(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  if (!match) return 0;
  // Finde den ersten Betrag in der Match-Gruppe
  const betragMatch = (match[1] || match[0]).match(/-?[\d.]+,\d{2}/);
  return betragMatch ? parseEuro(betragMatch[0]) : 0;
}

/** Sucht ein 4-stelliges Jahr im Text. */
function findJahr(text: string): number | null {
  // Suche nach "Jahr 2024", "Steuerjahr 2024", "2024", "für 2024" etc.
  const match = text.match(/(?:Jahr|Steuerjahr|Veranlagungszeitraum|für)\s*:?\s*(20\d{2})/i)
    || text.match(/\b(20[12]\d)\b/);
  return match ? parseInt(match[1], 10) : null;
}

// ---------------------------------------------------------------------------
// Erkennung: Welcher Dokumenttyp?
// ---------------------------------------------------------------------------

export type DokumentTyp = 'lstb' | 'bank' | 'krypto' | 'unbekannt';

export function erkenneTyp(text: string): DokumentTyp {
  const lower = text.toLowerCase();

  if (
    lower.includes('lohnsteuerbescheinigung') ||
    lower.includes('ausdruck der elektronischen lohnsteuerbescheinigung') ||
    (lower.includes('bruttoarbeitslohn') && lower.includes('lohnsteuer'))
  ) {
    return 'lstb';
  }

  if (
    lower.includes('cointracking') ||
    lower.includes('steuerreport') ||
    lower.includes('§ 23 estg') ||
    (lower.includes('veräußerungsgewinne') && lower.includes('krypto'))
  ) {
    return 'krypto';
  }

  if (
    lower.includes('jahressteuerbescheinigung') ||
    lower.includes('kapitalerträge') ||
    lower.includes('kapitalertragsteuer') ||
    lower.includes('freistellungsauftrag') ||
    lower.includes('sparer-pauschbetrag')
  ) {
    return 'bank';
  }

  return 'unbekannt';
}

// ---------------------------------------------------------------------------
// Parser: Lohnsteuerbescheinigung
// ---------------------------------------------------------------------------

export interface LStBErgebnis {
  typ: 'lstb';
  jahr: number | null;
  daten: Partial<HistorischeEingabe>;
}

export function parseLStB(text: string): LStBErgebnis {
  const jahr = findJahr(text);
  const daten: Partial<HistorischeEingabe> = {};

  // Zeile 3: Bruttoarbeitslohn
  daten.bruttogehalt = findAmount(text, /(?:3\.?\s*(?:Bruttoarbeitslohn|Brutto))[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Bruttoarbeitslohn[^0-9\-]*(-?[\d.,]+)/i);

  // Zeile 4: Einbehaltene Lohnsteuer
  daten.lohnsteuer = findAmount(text, /(?:4\.?\s*(?:Einbehaltene\s+)?Lohnsteuer)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Lohnsteuer[^0-9\-]*(-?[\d.,]+)/i);

  // Zeile 5: Solidaritätszuschlag
  daten.soli_lohn = findAmount(text, /(?:5\.?\s*(?:Einbehaltener\s+)?Solidarit)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Solidarit[äa]tszuschlag[^0-9\-]*(-?[\d.,]+)/i);

  // Zeile 6: Kirchensteuer
  daten.kirchensteuer_lohn = findAmount(text, /(?:6\.?\s*(?:Einbehaltene\s+)?Kirchensteuer)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Kirchensteuer\s+(?:des\s+Arbeitnehmers)?[^0-9\-]*(-?[\d.,]+)/i);

  // Zeile 23a/b: Rentenversicherung AN/AG
  daten.rv_an = findAmount(text, /(?:23\s*a\.?\s*)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /RV[- ]?Beitrag\s*(?:AN|Arbeitnehmer)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Rentenversicherung\s*(?:AN|Arbeitnehmer)[^0-9\-]*(-?[\d.,]+)/i);

  daten.rv_ag = findAmount(text, /(?:23\s*b\.?\s*)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /RV[- ]?Beitrag\s*(?:AG|Arbeitgeber)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Rentenversicherung\s*(?:AG|Arbeitgeber)[^0-9\-]*(-?[\d.,]+)/i);

  // Zeile 25: KV-Beitrag AN
  daten.kv_an_regulaer = findAmount(text, /(?:25\.?\s*)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Krankenversicherung\s*(?:AN|Arbeitnehmer)[^0-9\-]*(-?[\d.,]+)/i);

  // Zeile 27: PV-Beitrag AN
  daten.pv_an = findAmount(text, /(?:27\.?\s*)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /Pflegeversicherung\s*(?:AN|Arbeitnehmer)[^0-9\-]*(-?[\d.,]+)/i);

  return { typ: 'lstb', jahr, daten };
}

// ---------------------------------------------------------------------------
// Parser: Jahressteuerbescheinigung Bank
// ---------------------------------------------------------------------------

export interface BankErgebnis {
  typ: 'bank';
  jahr: number | null;
  bankName: string | null;
  daten: Partial<BankEintrag>;
}

export function parseBank(text: string): BankErgebnis {
  const jahr = findJahr(text);

  // Bankname erkennen
  let bankName: string | null = null;
  const bankPatterns: [RegExp, string][] = [
    [/comdirect/i, 'Comdirect'],
    [/consorsbank|consors\s*bank/i, 'Consors'],
    [/scalable|baader/i, 'Scalable/Baader'],
    [/bb\s*bank/i, 'BB Bank'],
    [/postbank/i, 'Postbank'],
    [/ing[- ]?diba|ing\b/i, 'ING'],
    [/trade\s*republic/i, 'Trade Republic'],
    [/dkb|deutsche\s*kreditbank/i, 'DKB'],
    [/commerzbank/i, 'Commerzbank'],
    [/deutsche\s*bank/i, 'Deutsche Bank'],
    [/sparkasse/i, 'Sparkasse'],
    [/volksbank|raiffeisenbank|vr[- ]?bank/i, 'Volksbank'],
    [/flatex/i, 'Flatex'],
    [/smartbroker/i, 'Smartbroker'],
  ];
  for (const [pattern, name] of bankPatterns) {
    if (pattern.test(text)) { bankName = name; break; }
  }

  const daten: Partial<BankEintrag> = {};

  // Kapitalerträge (Zeile 7 KAP oder generisch)
  daten.kapitalertraege = findAmount(text, /(?:Kapitalertr[äa]ge)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /(?:H[öo]he\s+der\s+Kapitalertr[äa]ge)[^0-9\-]*(-?[\d.,]+)/i);

  // Kapitalertragsteuer
  daten.kapitalertragsteuer = findAmount(text, /Kapitalertragsteuer[^0-9\-]*(-?[\d.,]+)/i);

  // Soli auf Kapital
  daten.soli_kapital = findAmount(text, /Solidarit[äa]tszuschlag[^0-9\-]*(-?[\d.,]+)/i);

  // Kirchensteuer auf Kapital
  daten.kirchensteuer = findAmount(text, /Kirchensteuer[^0-9\-]*(-?[\d.,]+)/i);

  // Sparer-Pauschbetrag / Freistellungsauftrag
  daten.sparer_pauschbetrag = findAmount(text, /(?:Sparer[- ]?Pauschbetrag|Freistellungsauftrag|in\s+Anspruch\s+genommen)[^0-9\-]*(-?[\d.,]+)/i);

  // §56 InvStG
  daten.invstg_56 = findAmount(text, /(?:§\s*56\s*InvStG|bestandsgesch[üu]tzt)[^0-9\-]*(-?[\d.,]+)/i);

  return { typ: 'bank', jahr, bankName, daten };
}

// ---------------------------------------------------------------------------
// Parser: CoinTracking / Krypto-Steuerreport
// ---------------------------------------------------------------------------

export interface KryptoErgebnis {
  typ: 'krypto';
  jahr: number | null;
  daten: {
    estg_23: number;
    estg_22: number;
    estg_20: number;
  };
}

export function parseKrypto(text: string): KryptoErgebnis {
  const jahr = findJahr(text);

  // §23 Veräußerungsgewinne/-verluste
  const estg_23 = findAmount(text, /(?:§\s*23|Veräußerungsgewinne?|private\s+Veräußerungsgeschäfte)[^0-9\-]*(-?[\d.,]+)/i)
    || findAmount(text, /(?:Gewinn|Verlust)\s+aus\s+(?:privaten\s+)?Veräußerung[^0-9\-]*(-?[\d.,]+)/i);

  // §22 Sonstige Einkünfte (Staking, Airdrops)
  const estg_22 = findAmount(text, /(?:§\s*22|sonstige\s+Einkünfte|Staking|Airdrops?|Lending)[^0-9\-]*(-?[\d.,]+)/i);

  // §20 Termingeschäfte
  const estg_20 = findAmount(text, /(?:§\s*20|Termingeschäft|Margin|Futures|Derivate)[^0-9\-]*(-?[\d.,]+)/i);

  return { typ: 'krypto', jahr, daten: { estg_23, estg_22, estg_20 } };
}

// ---------------------------------------------------------------------------
// Hauptfunktion: PDF parsen
// ---------------------------------------------------------------------------

export type ParseErgebnis = LStBErgebnis | BankErgebnis | KryptoErgebnis | { typ: 'unbekannt'; text: string };

export function parsePdfText(text: string): ParseErgebnis {
  const typ = erkenneTyp(text);

  switch (typ) {
    case 'lstb':
      return parseLStB(text);
    case 'bank':
      return parseBank(text);
    case 'krypto':
      return parseKrypto(text);
    default:
      return { typ: 'unbekannt', text };
  }
}
