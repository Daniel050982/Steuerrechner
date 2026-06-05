/**
 * Verifizierungstests für den PDF-Parser.
 *
 * Jede Bank hat ihren extrahierten Text (aus pdf.js) und die erwarteten Werte.
 * Wenn nächstes Jahr ein PDF nicht mehr parst, füge den Debug-Text hier ein
 * und prüfe, was sich geändert hat.
 *
 * Ausführen: npx tsx tests/pdfParser.test.ts
 */

import { parsePdfText } from '../src/core/pdfParser';

interface TestCase {
  name: string;
  expectedTyp: string;
  expectedJahr: number;
  expectedBank?: string;
  expected: Record<string, number>;
  text: string;
}

const tests: TestCase[] = [
  {
    name: 'Comdirect 2025',
    expectedTyp: 'bank',
    expectedJahr: 2025,
    expectedBank: 'Comdirect',
    expected: {
      kapitalertraege: 417.74,
      sparer_pauschbetrag: 320.00,
      kapitalertragsteuer: 24.44,
      soli_kapital: 1.34,
      kirchensteuer: 0,
    },
    text: `Kundennummer   Bezeichnung  2JS25AD   idm   fuer   posy 978   2642585   Daniel   Obermeier  comdirect  Pascalkehre   15 25451   Quickborn  Steuerbescheinigung  Bescheinigung   für   alle   Privatkonten   und   /   oder   -depots  werden   ý   für   das   Kalenderjahr   2025   /   o   für   den   Zeitraum   bis   folgende   Angaben   bescheinigt:  er   apitalerträge  ile   7   Anlage   KAP  ch   erücksichtigung   der   teilweisen   Steuerfreistellung   im   Sinne   des   §   20   Abs.   1   Nr.   6   Satz   9   EStG  es   nicht   ausgeglichenen   Verlustes   ohne   Verlust   aus   der   Veräußerung   von   Aktien es   in   Anspruch   genommenen   Sparer-Pauschbetrages  inko   ensteuererklärung   -   Zeile   19   der   Anlage   KAP   -   gemäß   §   32d   Abs.   3   EStG   anzugeben.  e   der   angerechneten   ausländischen   Steuer   Zeile   40   Anlage   KAP  e   der   anrechenbaren   noch   nicht   angerechneten   ausländischen   Steuer   Zeile   41   Anlage   KAP  ile   8   Anlage   KAP  thalten   in   den   bescheinigten   Kapitalerträgen   Zeile   11   Anlage   KAP  ile   12   Anlage   KAP  Zeile   13   Anlage   KAP  ile   16   oder   17   Anlage   KAP  italertragsteuer   Zeile   37   Anlage   KAP  li   aritätszuschlag   Zeile   38   Anlage   KAP  ir   e   steuer   zur   Kapitalertragsteuer   Zeile   39   Anlage   KAP  ir   e   steuer   zur   Kapitalertragsteuer   Zeile   39   Anlage   KAP  ile   10   Anlage   KAP  417,74   EUR  0,00   EUR  0,00   EUR  0,00   EUR  0,00   EUR  0,00   EUR  320,00   EUR  24,44   EUR  1,34   EUR  0,00   EUR kirchensteuererhebende   Religionsgemeinschaft  0,00   EUR kirchensteuererhebende   Religionsgemeinschaft  0,00   EUR  0,00   EUR`,
  },

  {
    name: 'Scalable/Baader 2025',
    expectedTyp: 'bank',
    expectedJahr: 2025,
    expectedBank: 'Scalable/Baader',
    expected: {
      kapitalertraege: 146.68,
      sparer_pauschbetrag: 146.68,
      kapitalertragsteuer: 0,
      soli_kapital: 0,
    },
    text: `Scalable Capital Bank GmbH  Steuerbescheinigung  Bescheinigung für alle Privatkonten und / oder -depots  Für Daniel Obermeier werden für das Kalenderjahr 2025 folgende Angaben bescheinigt:  Anlage KAP Typ Betrag  Zeile 7 Höhe der Kapitalerträge 146,68 EUR  Zeile 16 oder 17 Höhe des in Anspruch genommenen Sparer-Pauschbetrages 146,68 EUR  Zeile 37 Kapitalertragsteuer 0,00 EUR  Zeile 38 Solidaritätszuschlag 0,00 EUR`,
  },

  {
    name: 'BB Bank 2025',
    expectedTyp: 'bank',
    expectedJahr: 2025,
    expectedBank: 'BB Bank',
    expected: {
      kapitalertraege: 264.83,
      kapitalertragsteuer: 66.21,
      soli_kapital: 3.64,
      kirchensteuer: 0,
    },
    text: `BBBank eG  Steuerbescheinigung  Bescheinigung für alle Privatkonten und / oder -depots  werden für das Kalenderjahr 2025 folgende Angaben bescheinigt:  264,83 Höhe der Kapitalerträge  Zeile  7 Anlage KAP  66,21 Kapitalertragsteuer  Zeile 37 Anlage KAP  3,64 Solidaritätszuschlag  Zeile 38 Anlage KAP  0,00 Kirchensteuer zur Kapitalertragsteuer  Zeile 39 Anlage KAP`,
  },

  {
    name: 'Consors 2025',
    expectedTyp: 'bank',
    expectedJahr: 2025,
    expectedBank: 'Consors',
    expected: {
      kapitalertraege: 277.05,
      sparer_pauschbetrag: 277.05,
      kapitalertragsteuer: 0,
      soli_kapital: 0,
    },
    text: `Consorsbank  Steuerbescheinigung  Bescheinigung   für   alle   Privatkonten und   /   oder   -depots  werden   für das Kalenderjahr   2025   folgende   Angaben bescheinigt: Höhe   der Kapitalerträge   EUR   277,05 Zeile 7   Anlage KAP  davon: Gewinn   aus   Aktienveräußerungen   im Sinne des   § 20   Abs.   2   Satz   1   Nr. 1   EStG   EUR   0,00 Zeile 8   Anlage   KAP  davon: Einkünfte   aus   Stillhalterprämien   im   Sinne des   § 20   Abs.   1   Nr.   11   EStG   EUR   0,00 Zeile 9   Anlage   KAP  davon: Gewinne   aus der   Veräußerung   bestands- geschützter Alt-Anteile   im Sinne   des § 56   Abs.   6 Satz 1   Nr.   2   InvStG   EUR   0,00 Zeile 10   Anlage   KAP  Ersatzbemessungsgrundlage   im Sinne des §   43a   Abs.   2   Satz   7,   10, 13   und   14 EStG   EUR   0,00 Zeile   11 Anlage   KAP Höhe   des Verlustes im   Sinne   des § 20   Abs.   6 Satz   5 EStG   EUR   0,00 Zeile   14 Anlage   KAP Höhe   des Verlustes im   Sinne   des § 20   Abs.   6 Satz   6 EStG   EUR   0,00 Zeile   15 Anlage   KAP Höhe   des in Anspruch   genommenen Sparer-Pauschbetrages   EUR   277,05 Zeile   16 oder 17   Anlage KAP Kapitalertragsteuer   EUR   0,00 Zeile   37 Anlage   KAP Solidaritätszuschlag   EUR   0,00 Zeile   38 Anlage   KAP Kirchensteuer zur   Kapitalertragsteuer   EUR   0,00 Zeile   39 Anlage   KAP Summe   der   angerechneten ausländischen   Steuer   EUR   0,00 Zeile   40 Anlage   KAP Summe   der   anrechenbaren noch   nicht   angerechneten   ausländischen Steuer   EUR   0,00 Zeile   41 Anlage   KAP`,
  },

  {
    name: 'Postbank/Deutsche Bank 2025',
    expectedTyp: 'bank',
    expectedJahr: 2025,
    expectedBank: 'Postbank',
    expected: {
      kapitalertraege: 246.94,
      kapitalertragsteuer: 61.74,
      soli_kapital: 3.39,
    },
    text: `Deutsche Bank AG  Jahressteuerbescheinigung  Postbank als Niederlassung der Deutsche Bank AG  Steuerbescheinigung  Bescheinigung für alle Privatkonten und / oder -depots  werden für das Kalenderjahr 2025 folgende Angaben bescheinigt:  Zeile Betrag in EUR  Anlage KAP  7 246,94  Höhe der Kapitalerträge  Kapitalertragsteuer 37 61,74  Solidaritätszuschlag 38 3,39`,
  },

  {
    name: 'CoinTracking 2025',
    expectedTyp: 'krypto',
    expectedJahr: 2025,
    expected: {
      estg_23: 0,
      estg_22: 0,
      estg_20: 0,
    },
    text: `CoinTracking  Steuer Report für 2025  1.1. Einkünfte aus privaten Veräußerungsgeschäften nach § 23 EStG  Steuerrelevanter Veräußerungsgewinn /-verlust: 0,00 EUR  Sonstige Einkünfte aus privaten Veräußerungsgeschäften nach § 23 EStG: 0,00 EUR  1.2. Einkünfte aus Kapitalvermögen nach § 20 EStG  = Einkünfte aus Margin, Derivate, Futures 0,00 EUR  1.3. Sonstige Einkünfte nach § 22 Nr. 3 EStG  Sonstige Einkünfte im Sinne § 22 Nr. 3 EStG: 0,00 EUR`,
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

for (const tc of tests) {
  const result = parsePdfText(tc.text);

  const errors: string[] = [];

  if (result.typ !== tc.expectedTyp) {
    errors.push(`Typ: erwartet "${tc.expectedTyp}", bekommen "${result.typ}"`);
  }

  if (result.typ !== 'unbekannt') {
    if (result.jahr !== tc.expectedJahr) {
      errors.push(`Jahr: erwartet ${tc.expectedJahr}, bekommen ${result.jahr}`);
    }
  }

  if (tc.expectedBank && result.typ === 'bank') {
    if (result.bankName !== tc.expectedBank) {
      errors.push(`Bank: erwartet "${tc.expectedBank}", bekommen "${result.bankName}"`);
    }
  }

  const daten = result.typ === 'bank' ? result.daten
    : result.typ === 'krypto' ? result.daten
    : result.typ === 'lstb' ? result.daten
    : {};

  for (const [key, expected] of Object.entries(tc.expected)) {
    const actual = (daten as Record<string, number>)[key] ?? 0;
    if (Math.abs(actual - expected) > 0.01) {
      errors.push(`${key}: erwartet ${expected}, bekommen ${actual}`);
    }
  }

  if (errors.length === 0) {
    console.log(`✅ ${tc.name}`);
    passed++;
  } else {
    console.log(`❌ ${tc.name}`);
    for (const e of errors) console.log(`   ${e}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
