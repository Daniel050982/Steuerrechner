/**
 * Verifikationstest: berechneJahresdaten() gegen historische Ergebnisse.
 *
 * Vergleicht die neue Berechnung für jedes Jahr (2019-2025) mit den
 * Ergebniswerten aus dem originalen Google Apps Script.
 *
 * Ausführen: npx tsx tests/berechnung.test.ts
 */

import { berechneJahresdaten } from '../src/core/berechnung';
import { steuerdaten } from '../src/data/steuerdaten';
import { ergebnisse } from '../src/data/ergebnisse';
import { bankenDaten } from '../src/data/banken';

const JAHRE = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

interface FieldCheck {
  name: string;
  erwartet: number | null;
  berechnet: number;
  toleranz: number;
}

let totalPassed = 0;
let totalFailed = 0;

for (const jahr of JAHRE) {
  const daten = steuerdaten[jahr];
  const erwartet = ergebnisse[jahr];

  if (!daten || !erwartet) {
    console.log(`⚠ Jahr ${jahr}: Keine Daten oder Ergebnisse vorhanden`);
    continue;
  }

  const banken = bankenDaten.filter(b => b.jahr === jahr);
  const result = berechneJahresdaten(daten, banken);

  const checks: FieldCheck[] = [
    { name: 'werbungskosten', erwartet: erwartet.werbungskosten, berechnet: result.werbungskosten, toleranz: 1 },
    { name: 'sonderausgaben', erwartet: erwartet.sonderausgaben, berechnet: result.sonderausgaben, toleranz: 1 },
    { name: 'zvE_inland', erwartet: erwartet.zvE_inland, berechnet: result.zvE_inland, toleranz: 1 },
    { name: 'einkommensteuer', erwartet: erwartet.einkommensteuer, berechnet: result.einkommensteuer, toleranz: 1 },
    { name: 'steuerlast_gesamt', erwartet: erwartet.steuerlast_gesamt, berechnet: result.steuerlast_gesamt, toleranz: 2 },
    { name: 'gezahlte_steuer', erwartet: erwartet.gezahlte_steuer, berechnet: result.gezahlte_steuer, toleranz: 1 },
    { name: 'erstattung_nachzahlung', erwartet: erwartet.erstattung_nachzahlung, berechnet: result.erstattung_nachzahlung, toleranz: 2 },
    { name: 'kapitalertragsteuer', erwartet: erwartet.kapitalertragsteuer, berechnet: result.kapitalertragsteuer, toleranz: 1 },
    { name: 'soli_kapital', erwartet: erwartet.soli_kapital, berechnet: result.soli_kapital, toleranz: 0.1 },
    { name: 'effektiver_steuersatz', erwartet: erwartet.effektiver_steuersatz, berechnet: result.effektiver_steuersatz, toleranz: 0.1 },
    { name: 'auslandseinkommen', erwartet: erwartet.auslandseinkommen, berechnet: result.auslandseinkommen, toleranz: 1 },
    { name: 'gesamteinkommen_steuersatz', erwartet: erwartet.gesamteinkommen_steuersatz, berechnet: result.gesamteinkommen_steuersatz, toleranz: 1 },
    { name: 'estg_23_brutto', erwartet: erwartet.estg_23_brutto, berechnet: result.estg_23_brutto, toleranz: 0.01 },
    { name: 'estg_23_steuerpflichtig', erwartet: erwartet.estg_23_steuerpflichtig, berechnet: result.estg_23_steuerpflichtig, toleranz: 0.01 },
    { name: 'estg_23_vortrag_ende', erwartet: erwartet.estg_23_vortrag_ende, berechnet: result.estg_23_vortrag_ende, toleranz: 0.01 },
    { name: 'estg_22', erwartet: erwartet.estg_22, berechnet: result.estg_22, toleranz: 0.01 },
    { name: 'estg_20_brutto', erwartet: erwartet.estg_20_brutto, berechnet: result.estg_20_brutto, toleranz: 0.01 },
    { name: 'estg_20_vortrag_ende', erwartet: erwartet.estg_20_vortrag_ende, berechnet: result.estg_20_vortrag_ende, toleranz: 0.01 },
    { name: 'steuerpflichtige_kapitalertraege', erwartet: erwartet.steuerpflichtige_kapitalertraege, berechnet: result.steuerpflichtige_kapitalertraege, toleranz: 1 },
  ];

  const errors: string[] = [];
  let passed = 0;

  for (const check of checks) {
    if (check.erwartet === null) continue;
    const diff = Math.abs(check.berechnet - check.erwartet);
    if (diff > check.toleranz) {
      errors.push(`  ${check.name}: erwartet ${check.erwartet}, berechnet ${check.berechnet.toFixed(2)} (Δ ${diff.toFixed(2)})`);
    } else {
      passed++;
    }
  }

  if (errors.length === 0) {
    console.log(`✅ ${jahr}: Alle ${passed} Felder stimmen überein`);
    totalPassed += passed;
  } else {
    console.log(`❌ ${jahr}: ${errors.length} Abweichungen (${passed} OK)`);
    for (const e of errors) console.log(e);
    totalFailed += errors.length;
    totalPassed += passed;
  }
}

console.log(`\n${totalPassed} passed, ${totalFailed} failed`);
process.exit(totalFailed > 0 ? 1 : 0);
