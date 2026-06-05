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
    [/scalable\s*capital/i, 'Scalable Capital'],
    [/baader\s*bank/i, 'Baader Bank'],
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

  // Strategie-Auswahl: Sind die Beträge nah an den Zeile-Refs (Consors/Scalable)?
  // Oder in einem separaten Block (Comdirect)?
  const zeileNummern = findZeileNummern(text);
  const proximityMap = buildProximityMap(text);
  const inlineMap = parseInlineZeileAmounts(text);

  let zeileMap: Map<number, number>;

  // Plausibilitätscheck: Kapitalerträge (Zeile 7) sollte >= KapESt (Zeile 37) sein
  const proxPlausibel = proximityMap.size >= 3 &&
    (proximityMap.get(7) ?? 0) >= (proximityMap.get(37) ?? 0);

  if (proxPlausibel) {
    // Strategie A: Beträge stehen nah an den Zeile-Refs (Consors, Scalable)
    zeileMap = proximityMap;
  } else if (zeileNummern.size >= 3) {
    // Strategie B: Beträge in separatem Block (Comdirect)
    zeileMap = buildBlockMap(text, zeileNummern);
  } else if (inlineMap.size >= 2) {
    // Strategie C: Inline "37 61,74" Format (Postbank)
    zeileMap = inlineMap;
  } else {
    // Strategie D: Nähe-basiert (Fallback)
    daten.kapitalertraege = amountNear(text, /apitalertr[äa]ge/i, 500);
    daten.sparer_pauschbetrag = amountNear(text, /Sparer[- ]?Pauschbetrag/i, 500);
    daten.kapitalertragsteuer = amountNear(text, /apitalertragsteuer/i, 500);
    daten.soli_kapital = amountNear(text, /olidarit[äa]tszuschlag/i, 500);
    daten.kirchensteuer = amountNear(text, /irchensteuer/i, 500) || 0;
    return { typ: 'bank', jahr, bankName, daten };
  }

  daten.kapitalertraege = zeileMap.get(7) ?? 0;
  daten.sparer_pauschbetrag = zeileMap.get(16) ?? zeileMap.get(17) ?? 0;
  daten.kapitalertragsteuer = zeileMap.get(37) ?? 0;
  daten.soli_kapital = zeileMap.get(38) ?? 0;
  daten.kirchensteuer = zeileMap.get(39) ?? 0;
  daten.invstg_56 = zeileMap.get(10) ?? 0;

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

/**
 * Strategie A: Für jede "Zeile X Anlage KAP"-Referenz den nächsten EUR-Betrag
 * innerhalb von 120 Zeichen finden. Funktioniert für Consors, Scalable, BBBank
 * wo Beträge inline neben den Labels stehen.
 */
function buildProximityMap(text: string): Map<number, number> {
  const result = new Map<number, number>();
  const amounts = findAllAmounts(text);
  // Matche alle Zeile-Referenzen
  const re = /(?:Ze)?ile\s+(\d{1,2})\s+(?:oder\s+\d{1,2}\s+)?.*?(?:Anlage\s+KAP|nlage\s+KAP)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const nr = parseInt(m[1], 10);
    if (nr === 19 || result.has(nr)) continue;

    const refStart = m.index;
    const refEnd = m.index + m[0].length;

    // Suche den LETZTEN Betrag der VOR der Zeile-Referenz steht.
    // Bank-Bescheinigungen haben immer: [Betrag] ... [Label] ... Zeile X Anlage KAP
    // Der Betrag der zu Zeile X gehört ist der letzte Betrag VOR "Zeile X".
    let best: { value: number; index: number } | null = null;
    for (const a of amounts) {
      const end = a.index + a.raw.length + 3;
      if (end <= refStart && (refStart - end) <= 300) {
        // Der letzte (= nächste am Ref) Betrag VOR der Zeile-Ref gewinnt
        if (!best || a.index > best.index) {
          best = { value: a.value, index: a.index };
        }
      }
    }

    if (best) result.set(nr, best.value);
  }
  return result;
}

/**
 * Strategie B: Beträge-Block + Zeile-Nummern sequentiell zuordnen.
 * Für Comdirect wo Labels und Beträge in getrennten Spalten stehen.
 */
function buildBlockMap(text: string, zeileNummern: Set<number>): Map<number, number> {
  const amountsBlock = findAmountsBlock(text);
  const sortedZeilen = [...zeileNummern].sort((a, b) => {
    const ia = KAP_ZEILEN_ORDER.indexOf(a);
    const ib = KAP_ZEILEN_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  const zeile39Count = countZeile39(text);
  const mapping: number[] = [];
  for (const z of sortedZeilen) {
    mapping.push(z);
    if (z === 39 && zeile39Count > 1) mapping.push(39);
  }

  const result = new Map<number, number>();
  for (let i = 0; i < mapping.length && i < amountsBlock.length; i++) {
    if (!result.has(mapping[i])) result.set(mapping[i], amountsBlock[i]);
  }
  return result;
}

/**
 * Strategie C: Postbank/Deutsche-Bank-Format: Zeilen-Nummern und Beträge direkt nebeneinander.
 * Format: "7 246,94" oder "37 61,74" (Zeilennummer + Betrag, ohne "Zeile" Prefix)
 */
function parseInlineZeileAmounts(text: string): Map<number, number> {
  const result = new Map<number, number>();
  const zeilen = '7|8|9|10|11|12|13|14|15|16|37|38|39|40|41|42';

  // Format A: Zeilennummer gefolgt von Betrag → "37 61,74"
  const reA = new RegExp(`\\b(${zeilen})\\s+(-?[\\d.]+,\\d{2})\\b`, 'g');
  let m;
  while ((m = reA.exec(text)) !== null) {
    const nr = parseInt(m[1], 10);
    if (!result.has(nr)) result.set(nr, parseEuro(m[2]));
  }

  // Format B: Betrag gefolgt von Zeilennummer → "246,94 7" (Postbank)
  const reB = new RegExp(`(-?[\\d.]+,\\d{2})\\s+(${zeilen})\\b`, 'g');
  while ((m = reB.exec(text)) !== null) {
    const nr = parseInt(m[2], 10);
    if (!result.has(nr)) result.set(nr, parseEuro(m[1]));
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

  const amounts = findAllAmounts(text);
  if (amounts.length === 0) return { typ: 'lstb', jahr, daten };

  // --- Erster Block: Hauptfelder ---
  // Die ersten Beträge im Dokument sind Brutto, LSt und weitere Felder.
  const firstBlock = findAmountsBlock(text);
  const mainAmounts = firstBlock.filter(v => v > 100);
  if (mainAmounts.length >= 1) daten.bruttogehalt = mainAmounts[0];
  if (mainAmounts.length >= 2) daten.lohnsteuer = mainAmounts[1];
  daten.soli_lohn = 0;
  daten.kirchensteuer_lohn = 0;

  // --- SV-Block: Finde RV-Paar (zwei identische Beträge) ---
  let rvIdx = -1;
  for (let i = 0; i < amounts.length - 1; i++) {
    if (Math.abs(amounts[i].value - amounts[i + 1].value) < 0.01 && amounts[i].value > 500) {
      daten.rv_ag = amounts[i].value;
      daten.rv_an = amounts[i + 1].value;
      if (i + 2 < amounts.length && amounts[i + 2].value > 500) {
        daten.kv_an_regulaer = amounts[i + 2].value;
      }
      rvIdx = i;
      break;
    }
  }

  // --- PV AN und DBA aus dem ersten Block ---
  // Nach Brutto und LSt bleiben im ersten Block weitere Beträge übrig.
  // Diese sind typisch: Feld 16a (DBA), evtl. 17/18, Feld 26 (PV AN).
  // Identifikation: prüfe ob "DBA" oder "16." im Dokument erwähnt wird.
  const hasDBA = /DBA|Doppelbesteuerungsabkommen/i.test(text);
  const remainingFirstBlock = mainAmounts.slice(2); // Nach Brutto + LSt
  const svValues = new Set([daten.rv_ag, daten.rv_an, daten.kv_an_regulaer].filter(Boolean));

  // Filtere SV-Werte raus (falls im selben Block)
  const extraValues = remainingFirstBlock.filter(v => !svValues.has(v));

  if (hasDBA && extraValues.length >= 1) {
    // Erster verbleibender Wert = DBA (Feld 16a kommt im Formular vor Feld 26)
    daten.auslandseinkuenfte = extraValues[0];
  }

  // PV AN: der Wert der in der Nähe von "Pflege" oder "26." steht
  // In der LStB ist PV AN typisch der letzte Wert im ersten Block vor Soli (0)
  // Schaue nach einem Wert im Bereich 200-3000 der weder Brutto, LSt, RV, KV, noch DBA ist
  const assignedValues = new Set([
    daten.bruttogehalt, daten.lohnsteuer,
    daten.rv_ag, daten.rv_an, daten.kv_an_regulaer,
    daten.auslandseinkuenfte,
  ].filter(Boolean));

  // PV AN ist im Formular das letzte Feld der linken Spalte (Feld 26),
  // also der LETZTE unzugewiesene Wert im ersten Block
  if (/26\.\s+Arbeitnehmer|Pflege/i.test(text)) {
    for (let i = firstBlock.length - 1; i >= 0; i--) {
      const v = firstBlock[i];
      if (v >= 200 && v <= 5000 && !assignedValues.has(v)) {
        daten.pv_an = v;
        break;
      }
    }
  }

  // Fallback: DBA auch ohne ersten Block suchen
  if (!daten.auslandseinkuenfte) {
    daten.auslandseinkuenfte = amountNear(text, /DBA|Doppelbesteuerungsabkommen/i, 2000);
  }

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
