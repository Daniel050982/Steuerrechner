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

  // Strategie 1: Sequentielle Zuordnung Zeile-Ref → Betrag
  // Bei Tabellen-PDFs (Comdirect, Consors, Scalable) stehen Labels links
  // und Beträge rechts. pdf.js extrahiert erst alle Labels, dann alle Beträge.
  // → Die N-te Zeile-Referenz gehört zum N-ten Betrag.
  const zeileMap = sequentialZeileMapping(text);

  // Strategie 2: Falls sequentiell nichts findet, Nähe-basiert als Fallback
  if (zeileMap.size === 0) {
    daten.kapitalertraege = amountNear(text, /H[öo]he der Kapitalertr[äa]ge/i, 500);
    daten.sparer_pauschbetrag = amountNear(text, /Sparer[- ]?Pauschbetrag/i, 500);
    daten.kapitalertragsteuer = amountNear(text, /Kapitalertragsteuer(?!\s*zur)/i, 500);
    daten.soli_kapital = amountNear(text, /Solidarit[äa]tszuschlag/i, 500);
    daten.kirchensteuer = amountNear(text, /Kirchensteuer/i, 500) || 0;
  } else {
    daten.kapitalertraege = zeileMap.get(7) ?? 0;
    daten.sparer_pauschbetrag = zeileMap.get(16) ?? zeileMap.get(17) ?? 0;
    daten.kapitalertragsteuer = zeileMap.get(37) ?? 0;
    daten.soli_kapital = zeileMap.get(38) ?? 0;
    daten.kirchensteuer = zeileMap.get(39) ?? 0;
    daten.invstg_56 = zeileMap.get(10) ?? 0;
  }

  return { typ: 'bank', jahr, bankName, daten };
}

/**
 * Sammelt alle "Zeile XX" Referenzen und alle EUR-Beträge in Dokumentreihenfolge,
 * dann ordnet sie sequentiell zu: 1. Zeile → 1. Betrag, 2. Zeile → 2. Betrag, etc.
 *
 * Das funktioniert, weil bei Tabellen-PDFs die Zeile-Refs und Beträge in
 * derselben logischen Reihenfolge stehen, auch wenn sie im extrahierten
 * Text weit voneinander entfernt sind.
 */
function sequentialZeileMapping(text: string): Map<number, number> {
  // 1. Sammle alle Zeile-Referenzen in Reihenfolge (nur eindeutige, erste Vorkommen)
  const zeileRefs: { nr: number; index: number }[] = [];
  const zeileRe = /Zeile\s*(\d{1,2})\s*(?:oder\s*(\d{1,2})\s*)?(?:Anlage\s*KAP)?/gi;
  const seenZeilen = new Set<number>();
  let zm;
  while ((zm = zeileRe.exec(text)) !== null) {
    const nr = parseInt(zm[1], 10);
    // "Zeile 16 oder 17" → nur als 16 speichern (mit Alias 17)
    if (!seenZeilen.has(nr)) {
      seenZeilen.add(nr);
      if (zm[2]) seenZeilen.add(parseInt(zm[2], 10));
      zeileRefs.push({ nr, index: zm.index });
    }
  }

  if (zeileRefs.length === 0) return new Map();

  // 2. Sammle alle EUR-Beträge die NACH dem Steuerbescheinigung-Block stehen
  // (= die Werte-Spalte, nicht Beträge in Gesetzestexten)
  const amounts = findAllAmounts(text);

  // 3. Versuche zuerst: Jede Zeile-Ref hat den Betrag direkt daneben (< 100 Zeichen)
  const nearMap = new Map<number, number>();
  for (const zr of zeileRefs) {
    for (const a of amounts) {
      const dist = a.index - (zr.index + 20); // approximate end of "Zeile XX"
      if (dist >= -60 && dist <= 100) {
        nearMap.set(zr.nr, a.value);
        break;
      }
    }
  }

  // Wenn die meisten Zeilen einen Nahbetrag haben, nutze die Nähe-Strategie
  if (nearMap.size >= zeileRefs.length * 0.6) {
    return nearMap;
  }

  // 4. Fallback: Sequentielle Zuordnung
  // Finde den Punkt im Text, ab dem die Beträge-Spalte beginnt
  // (= nach der letzten Zeile-Referenz)
  const lastZeileEnd = Math.max(...zeileRefs.map((z) => z.index)) + 30;
  const valueAmounts = amounts.filter((a) => a.index >= lastZeileEnd);

  const result = new Map<number, number>();
  for (let i = 0; i < zeileRefs.length && i < valueAmounts.length; i++) {
    const nr = zeileRefs[i].nr;
    result.set(nr, valueAmounts[i].value);
    // Zeile "16 oder 17": auch unter 17 speichern
    if (nr === 16) result.set(17, valueAmounts[i].value);
  }

  return result;
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
