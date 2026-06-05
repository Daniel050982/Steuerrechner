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

/** Findet alle EUR-Beträge mit Position im Text. */
function findAllAmounts(text: string): { value: number; index: number; raw: string }[] {
  const results: { value: number; index: number; raw: string }[] = [];
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

/** Findet den nächsten EUR-Betrag nach einem Label. */
function amountNear(text: string, labelPattern: RegExp, maxDist = 300): number {
  const match = labelPattern.exec(text);
  if (!match) return 0;
  const labelEnd = match.index + match[0].length;
  const amounts = findAllAmounts(text);
  let best: { value: number; dist: number } | null = null;
  for (const a of amounts) {
    const distAfter = a.index - labelEnd;
    const distBefore = match.index - (a.index + a.raw.length);
    let dist: number;
    if (distAfter >= 0 && distAfter <= maxDist) dist = distAfter;
    else if (distBefore >= 0 && distBefore <= 80) dist = distBefore;
    else continue;
    if (!best || dist < best.dist) best = { value: a.value, dist };
  }
  return best?.value ?? 0;
}

function findJahr(text: string): number | null {
  const m = text.match(/Kalenderjahr\s*(20\d{2})/i)
    || text.match(/(?:Steuer\s*Report|Zeitraum)[^0-9]*(20\d{2})/i)
    || text.match(/(?:Jahr|Steuerjahr|für)\s*:?\s*(20\d{2})/i);
  return m ? parseInt(m[1], 10) : null;
}

// ---------------------------------------------------------------------------
// Erkennung
// ---------------------------------------------------------------------------

export type DokumentTyp = 'lstb' | 'bank' | 'krypto' | 'unbekannt';

export function erkenneTyp(text: string): DokumentTyp {
  const lower = text.toLowerCase();
  if (lower.includes('lohnsteuerbescheinigung') || (lower.includes('bruttoarbeitslohn') && lower.includes('lohnsteuer'))) return 'lstb';
  if (lower.includes('cointracking') || (lower.includes('steuer report') && lower.includes('kryptow'))) return 'krypto';
  if (lower.includes('steuerbescheinigung') || lower.includes('jahressteuerbescheinigung') || lower.includes('apitalertr') || lower.includes('anlage kap') || lower.includes('anlage   kap')) return 'bank';
  return 'unbekannt';
}

function erkenneBankname(text: string): string | null {
  const patterns: [RegExp, string][] = [
    [/comdirect|commerzbank/i, 'Comdirect'],
    [/consorsbank|consors\s*bank/i, 'Consors'],
    [/scalable\s*capital/i, 'Scalable/Baader'],
    [/baader\s*bank/i, 'Scalable/Baader'],
    [/bb\s*bank/i, 'BB Bank'],
    [/postbank/i, 'Postbank'],
    [/deutsche\s*bank/i, 'Postbank'],
    [/ing[- ]?diba|ing\b/i, 'ING'],
    [/trade\s*republic/i, 'Trade Republic'],
    [/dkb|deutsche\s*kreditbank/i, 'DKB'],
    [/sparkasse/i, 'Sparkasse'],
    [/volksbank|raiffeisenbank/i, 'Volksbank'],
    [/flatex/i, 'Flatex'],
  ];
  for (const [p, name] of patterns) { if (p.test(text)) return name; }
  return null;
}

// ---------------------------------------------------------------------------
// Bank-Parser: Steuerbescheinigung
// ---------------------------------------------------------------------------

/** Standard-Reihenfolge der Zeilen in der Anlage KAP */
const KAP_ZEILEN_ORDER = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 37, 38, 39, 40, 41, 42];

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

  // 1. Finde alle Zeile-Nummern im Dokument (auch "ile" wegen pdf.js Artefakte)
  const zeileNummern = findZeileNummern(text);

  // 2. Finde den Beträge-Block (größter Cluster aufeinanderfolgender EUR-Beträge)
  const amountsBlock = findAmountsBlock(text);

  // 3. Sortiere gefundene Zeile-Nummern in Standard-KAP-Reihenfolge
  const sortedZeilen = [...zeileNummern].sort((a, b) => {
    const ia = KAP_ZEILEN_ORDER.indexOf(a);
    const ib = KAP_ZEILEN_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  // 4. Zähle Zeile-39-Vorkommen (Kirchensteuer hat oft 2 Zeilen)
  const zeile39Count = countZeile39(text);

  // 5. Baue die Zuordnungsliste: Zeile-Nr → Position im Block
  const mapping: number[] = [];
  for (const z of sortedZeilen) {
    mapping.push(z);
    if (z === 39 && zeile39Count > 1) mapping.push(39); // 2. Kirchensteuer
  }

  // 6. Ordne Beträge zu
  const zeileMap = new Map<number, number>();
  for (let i = 0; i < mapping.length && i < amountsBlock.length; i++) {
    const z = mapping[i];
    // Nur den ERSTEN Wert pro Zeile speichern (bei Zeile 39 den ersten)
    if (!zeileMap.has(z)) {
      zeileMap.set(z, amountsBlock[i]);
    }
  }

  // 7. Falls Block-Zuordnung nichts ergibt, Fallback auf Nähe-basiert
  if (zeileMap.size === 0) {
    daten.kapitalertraege = amountNear(text, /apitalertr[äa]ge/i, 500);
    daten.sparer_pauschbetrag = amountNear(text, /Sparer[- ]?Pauschbetrag/i, 500);
    daten.kapitalertragsteuer = amountNear(text, /apitalertragsteuer/i, 500);
    daten.soli_kapital = amountNear(text, /olidarit[äa]tszuschlag/i, 500);
    daten.kirchensteuer = amountNear(text, /irchensteuer/i, 500) || 0;
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
 * Findet alle Zeile-Nummern im Text.
 * Matcht "Zeile 7", "ile 7", "Zeile 16 oder 17", etc.
 * Filtert Zeile 19 (kommt nur in Warnungstext vor).
 */
function findZeileNummern(text: string): Set<number> {
  const result = new Set<number>();
  // Matche "Zeile X" und "ile X" (pdf.js schneidet oft "Ze" ab)
  const re = /(?:Ze)?ile\s+(\d{1,2})\s+(?:oder\s+\d{1,2}\s+)?.*?(?:Anlage\s+KAP|nlage\s+KAP)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const nr = parseInt(m[1], 10);
    // Zeile 19 ist nur Warnungstext, nicht ein Feld
    if (nr !== 19) result.add(nr);
    // "Zeile 16 oder 17" → nur 16 speichern (ist dasselbe Feld)
  }
  return result;
}

/** Zählt wie oft "Zeile 39" / "ile 39" vorkommt (für doppelte Kirchensteuer). */
function countZeile39(text: string): number {
  const matches = text.match(/(?:Ze)?ile\s+39/gi);
  return matches ? matches.length : 0;
}

/**
 * Findet den größten Block aufeinanderfolgender EUR-Beträge.
 * In Steuerbescheinigungen stehen die Werte als Block untereinander.
 */
function findAmountsBlock(text: string): number[] {
  const amounts = findAllAmounts(text);
  if (amounts.length === 0) return [];

  // Finde den größten Cluster: Beträge die maximal 80 Zeichen auseinander liegen
  let bestStart = 0;
  let bestLen = 1;
  let curStart = 0;

  for (let i = 1; i < amounts.length; i++) {
    const gap = amounts[i].index - (amounts[i - 1].index + amounts[i - 1].raw.length);
    if (gap > 150) {
      // Neuer Cluster
      if (i - curStart > bestLen) {
        bestStart = curStart;
        bestLen = i - curStart;
      }
      curStart = i;
    }
  }
  // Letzten Cluster prüfen
  if (amounts.length - curStart > bestLen) {
    bestStart = curStart;
    bestLen = amounts.length - curStart;
  }

  return amounts.slice(bestStart, bestStart + bestLen).map((a) => a.value);
}

// ---------------------------------------------------------------------------
// Krypto-Parser: CoinTracking
// ---------------------------------------------------------------------------

export interface KryptoErgebnis {
  typ: 'krypto';
  jahr: number | null;
  daten: { estg_23: number; estg_22: number; estg_20: number };
}

export function parseKrypto(text: string): KryptoErgebnis {
  const jahr = findJahr(text);
  const estg_23 = amountNear(text, /Sonstige Eink[üu]nfte aus privaten Ver[äa]u[ßs]erungsgesch[äa]ften nach §\s*23 EStG:/i)
    || amountNear(text, /Steuerrelevanter Ver[äa]u[ßs]erungsgewinn/i);
  const estg_20 = amountNear(text, /=\s*Eink[üu]nfte aus Margin/i);
  const estg_22 = amountNear(text, /Sonstige Eink[üu]nfte im Sinne §\s*22 Nr\.\s*3 EStG:/i)
    || amountNear(text, /Steuerrelevante sonstige Eink[üu]nfte:/i);
  return { typ: 'krypto', jahr, daten: { estg_23, estg_22, estg_20 } };
}

// ---------------------------------------------------------------------------
// LStB-Parser
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
  daten.rv_an = amountNear(text, /Rentenversicherung[^0-9]*(?:AN|Arbeitnehmer)/i);
  daten.rv_ag = amountNear(text, /Rentenversicherung[^0-9]*(?:AG|Arbeitgeber)/i);
  daten.kv_an_regulaer = amountNear(text, /Krankenversicherung[^0-9]*(?:AN|Arbeitnehmer)/i);
  daten.pv_an = amountNear(text, /Pflegeversicherung[^0-9]*(?:AN|Arbeitnehmer)/i);
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
