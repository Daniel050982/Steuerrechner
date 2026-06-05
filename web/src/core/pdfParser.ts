/**
 * Parser für deutsche Steuer-PDFs:
 * - Jahressteuerbescheinigung (Bank/Broker)
 * - CoinTracking Steuerreport
 * - Lohnsteuerbescheinigung (LStB)
 *
 * Getestet mit: Comdirect, Consors, Scalable/Baader, BB Bank, Postbank/Deutsche Bank, CoinTracking
 */

import type { HistorischeEingabe } from '../data/steuerdaten';
import type { BankEintrag } from '../data/banken';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parst einen deutschen Geldbetrag: "1.234,56" → 1234.56, "-10,96" → -10.96 */
function parseEuro(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/EUR/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Sucht alle EUR-Beträge im Text und gibt sie mit Position zurück.
 * Erkennt: "123,45 EUR", "EUR 123,45", "123,45", "-1.234,56 EUR"
 */
function findAllAmounts(text: string): { value: number; index: number; raw: string }[] {
  const results: { value: number; index: number; raw: string }[] = [];
  // Match: optional minus, digits with optional dots, comma, 2 digits, optional EUR
  const re = /(-?[\d.]+,\d{2})\s*(?:EUR|€)?|(?:EUR|€)\s*(-?[\d.]+,\d{2})/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1] || m[2];
    if (raw) {
      results.push({ value: parseEuro(raw), index: m.index, raw });
    }
  }
  return results;
}

/** Findet den nächsten EUR-Betrag in der Nähe eines Labels. */
function amountNear(text: string, labelPattern: RegExp, maxDistance = 300): number {
  const match = labelPattern.exec(text);
  if (!match) return 0;
  const labelEnd = match.index + match[0].length;
  const labelStart = match.index;

  const amounts = findAllAmounts(text);
  let best: { value: number; dist: number } | null = null;

  for (const a of amounts) {
    // Amount after label (most common)
    const distAfter = a.index - labelEnd;
    // Amount before label (BBBank table format)
    const distBefore = labelStart - (a.index + a.raw.length);

    let dist: number;
    if (distAfter >= 0 && distAfter <= maxDistance) {
      dist = distAfter;
    } else if (distBefore >= 0 && distBefore <= 80) {
      dist = distBefore;
    } else {
      continue;
    }

    if (!best || dist < best.dist) {
      best = { value: a.value, dist };
    }
  }

  return best?.value ?? 0;
}

/** Sucht ein 4-stelliges Jahr im Text. */
function findJahr(text: string): number | null {
  const m = text.match(/Kalenderjahr\s*(20\d{2})/i)
    || text.match(/(?:Steuer\s*Report|Zeitraum)[^0-9]*(20\d{2})/i)
    || text.match(/(?:Jahr|Steuerjahr|für)\s*:?\s*(20\d{2})/i);
  return m ? parseInt(m[1], 10) : null;
}

// ---------------------------------------------------------------------------
// Erkennung: Welcher Dokumenttyp?
// ---------------------------------------------------------------------------

export type DokumentTyp = 'lstb' | 'bank' | 'krypto' | 'unbekannt';

export function erkenneTyp(text: string): DokumentTyp {
  const lower = text.toLowerCase();

  if (
    lower.includes('lohnsteuerbescheinigung') ||
    (lower.includes('bruttoarbeitslohn') && lower.includes('lohnsteuer'))
  ) {
    return 'lstb';
  }

  if (
    lower.includes('cointracking') ||
    (lower.includes('steuer report') && lower.includes('kryptowährung'))
  ) {
    return 'krypto';
  }

  if (
    lower.includes('steuerbescheinigung') ||
    lower.includes('jahressteuerbescheinigung') ||
    lower.includes('kapitalerträge') ||
    lower.includes('kapitalertragsteuer') ||
    lower.includes('anlage kap')
  ) {
    return 'bank';
  }

  return 'unbekannt';
}

// ---------------------------------------------------------------------------
// Bankname erkennen
// ---------------------------------------------------------------------------

function erkenneBankname(text: string): string | null {
  const patterns: [RegExp, string][] = [
    [/comdirect/i, 'Comdirect'],
    [/consorsbank|consors\s*bank/i, 'Consors'],
    [/scalable\s*capital/i, 'Scalable/Baader'],
    [/baader\s*bank/i, 'Scalable/Baader'],
    [/bb\s*bank/i, 'BB Bank'],
    [/postbank/i, 'Postbank'],
    [/deutsche\s*bank/i, 'Postbank'],  // Postbank = Deutsche Bank Niederlassung
    [/ing[- ]?diba|ing\b/i, 'ING'],
    [/trade\s*republic/i, 'Trade Republic'],
    [/dkb|deutsche\s*kreditbank/i, 'DKB'],
    [/commerzbank/i, 'Commerzbank'],
    [/sparkasse/i, 'Sparkasse'],
    [/volksbank|raiffeisenbank|vr[- ]?bank/i, 'Volksbank'],
    [/flatex/i, 'Flatex'],
    [/smartbroker/i, 'Smartbroker'],
  ];
  for (const [pattern, name] of patterns) {
    if (pattern.test(text)) return name;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Parser: Jahressteuerbescheinigung Bank (alle Formate)
// ---------------------------------------------------------------------------

export interface BankErgebnis {
  typ: 'bank';
  jahr: number | null;
  bankName: string | null;
  daten: Partial<BankEintrag>;
}

export function parseBank(text: string): BankErgebnis {
  const jahr = findJahr(text);
  const bankName = erkenneBankname(text);

  const daten: Partial<BankEintrag> = {};

  // Zeile 7: Höhe der Kapitalerträge
  daten.kapitalertraege = amountNear(text, /H[öo]he der Kapitalertr[äa]ge/i)
    || amountNear(text, /Zeile\s*7\b/i);

  // Zeile 16/17: Sparer-Pauschbetrag
  daten.sparer_pauschbetrag = amountNear(text, /Sparer[- ]?Pauschbetrag/i)
    || amountNear(text, /Zeile\s*1[67]\b/i);

  // Zeile 37: Kapitalertragsteuer
  daten.kapitalertragsteuer = amountNear(text, /Kapitalertragsteuer\s*(?:Zeile)?\s*(?:37)?/i)
    || amountNear(text, /Zeile\s*37\b/i);

  // Zeile 38: Solidaritätszuschlag
  daten.soli_kapital = amountNear(text, /Solidarit[äa]tszuschlag\s*(?:Zeile)?\s*(?:38)?/i)
    || amountNear(text, /Zeile\s*38\b/i);

  // Zeile 39: Kirchensteuer
  daten.kirchensteuer = amountNear(text, /Kirchensteuer\s*(?:zur)?\s*(?:Kapitalertragsteuer)?/i)
    || amountNear(text, /Zeile\s*39\b/i)
    || 0;

  // Zeile 10: §56 InvStG (bestandsgeschützte Alt-Anteile)
  daten.invstg_56 = amountNear(text, /bestandsgesch[üu]tzt.*?Alt[- ]?Anteile/i)
    || amountNear(text, /§\s*56\s*Abs\.\s*6/i)
    || amountNear(text, /Zeile\s*10\b/i)
    || 0;

  return { typ: 'bank', jahr, bankName, daten };
}

// ---------------------------------------------------------------------------
// Parser: CoinTracking Steuerreport
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

  // §23: "Sonstige Einkünfte aus privaten Veräußerungsgeschäften nach § 23 EStG: X,XX EUR"
  // Im umrahmten Kasten steht der finale Wert
  const estg_23 = amountNear(text, /Sonstige Eink[üu]nfte aus privaten Ver[äa]u[ßs]erungsgesch[äa]ften nach §\s*23 EStG:/i)
    || amountNear(text, /Steuerrelevanter Ver[äa]u[ßs]erungsgewinn\s*\/?-?verlust:/i);

  // §20: "= Einkünfte aus Margin, Derivate, Futures X,XX EUR"
  const estg_20 = amountNear(text, /=\s*Eink[üu]nfte aus Margin/i)
    || amountNear(text, /Eink[üu]nfte aus Kapitalverm[öo]gen nach §\s*20/i);

  // §22: "Sonstige Einkünfte im Sinne § 22 Nr. 3 EStG: X,XX EUR"
  const estg_22 = amountNear(text, /Sonstige Eink[üu]nfte im Sinne §\s*22 Nr\.\s*3 EStG:/i)
    || amountNear(text, /Steuerrelevante sonstige Eink[üu]nfte:/i);

  return { typ: 'krypto', jahr, daten: { estg_23, estg_22, estg_20 } };
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

  daten.bruttogehalt = amountNear(text, /(?:3\.?\s*)?Bruttoarbeitslohn/i);
  daten.lohnsteuer = amountNear(text, /(?:4\.?\s*)?(?:Einbehaltene\s+)?Lohnsteuer/i);
  daten.soli_lohn = amountNear(text, /(?:5\.?\s*)?(?:Einbehaltener?\s+)?Solidarit[äa]t/i);
  daten.kirchensteuer_lohn = amountNear(text, /(?:6\.?\s*)?(?:Einbehaltene\s+)?Kirchensteuer/i);
  daten.rv_an = amountNear(text, /(?:23\s*a\.?\s*)?(?:AN|Arbeitnehmer)[^0-9]*(?:Renten|RV)/i)
    || amountNear(text, /Rentenversicherung[^0-9]*(?:AN|Arbeitnehmer)/i);
  daten.rv_ag = amountNear(text, /(?:23\s*b\.?\s*)?(?:AG|Arbeitgeber)[^0-9]*(?:Renten|RV)/i)
    || amountNear(text, /Rentenversicherung[^0-9]*(?:AG|Arbeitgeber)/i);
  daten.kv_an_regulaer = amountNear(text, /(?:25\.?\s*)?Krankenversicherung[^0-9]*(?:AN|Arbeitnehmer)/i);
  daten.pv_an = amountNear(text, /(?:27\.?\s*)?Pflegeversicherung[^0-9]*(?:AN|Arbeitnehmer)/i);

  return { typ: 'lstb', jahr, daten };
}

// ---------------------------------------------------------------------------
// Hauptfunktion
// ---------------------------------------------------------------------------

export type ParseErgebnis = LStBErgebnis | BankErgebnis | KryptoErgebnis | { typ: 'unbekannt'; text: string };

export function parsePdfText(text: string): ParseErgebnis {
  const typ = erkenneTyp(text);
  switch (typ) {
    case 'lstb': return parseLStB(text);
    case 'bank': return parseBank(text);
    case 'krypto': return parseKrypto(text);
    default: return { typ: 'unbekannt', text };
  }
}
