// ============================================================
// Konstante Sheetnamen
// ============================================================

const SHEET_STEUERDATEN = 'Steuerdaten';
const SHEET_ZIEL        = 'Steuer';
const SHEET_BANKEN      = 'Banken';

// ============================================================
// Farben (zentral – Legende & Tabelle nutzen dieselben Werte)
// ============================================================

const F_AUTO     = '#FFF2CC'; // Gelb      → Auto-Fill aus Banken-Tab
const F_BESCHEID = '#D9EAD3'; // Grün      → Wert aus Steuerbescheid
const F_STPFL    = '#B6D7A8'; // Hellgrün  → Steuerpflichtig
const F_VORTRAG  = '#C9DAF8'; // Blau-hell → Verlustvortrag Ende Jahr
const F_SUMME    = '#EFEFEF'; // Hellgrau  → Zwischensumme / Ergebniszeile
const F_DARK     = '#434343'; // Dunkelgrau → Abschnitts-Header (beide Tabs)
const LEGENDE_SPALTE = 10;    // Feste Spalte für Legende im Steuerdaten-Tab

// Felder ohne €-Format (Text / ganzzahlige Zähler)

const KEIN_EURO_FORMAT = new Set([
  'Steuerklasse', 'Verheiratet (ja/nein)', 'Anzahl Kinder',
  'Krankenversichert (gesetzlich/privat)', 'Günstigerprüfung (ja/nein)',
  'Verlustvorträge anwenden (ja/nein)', 'JStG 2024 §20 anwenden (ja/nein)',
  'Tage mit Fahrt zur Arbeit', 'Einfache Entfernung zur Arbeit (km)', 'Homeoffice-Tage'
]);

// ============================================================
// STEUERDATEN_FELDER – Struktur des Steuerdaten-Tabs (SSOT)
// ============================================================
//   typ  'H' = Abschnitts-Header  (dunkel, kein Eingabewert)
//        'E' = Manuelle Eingabe   (weiß)
//        'A' = Auto-Fill          (gelb)
//        'B' = Aus Bescheid       (grün)
//        'S' = Ja/Nein-Schalter   (hellblau)

const STEUERDATEN_FELDER = [
  { name: '▸ Lohn & Gehalt',                                          typ: 'H' },
  { name: 'Bruttoarbeitslohn',                                         typ: 'E' },
  { name: 'Lohnsteuer (lt. LStB)',                                     typ: 'E' },
  { name: 'Solidaritätszuschlag Lohn (lt. LStB)',                      typ: 'E' },
  { name: 'Kirchensteuer Lohn (lt. LStB)',                             typ: 'E' },

  { name: '▸ Kapitalerträge',                                         typ: 'H' },
  { name: 'Kapitalerträge gesamt (lt. Broker)',                        typ: 'A' },
  { name: 'Sparer-Pauschbetrag (lt. Broker)',                          typ: 'E' },
  { name: 'Steuerpflichtige Kapitalerträge (lt. Bescheid)',            typ: 'B' },
  { name: 'Abgeltungsteuer gezahlt (lt. Bescheid)',                    typ: 'A' },
  { name: 'Solidaritätszuschlag Kapital (lt. Bescheid)',               typ: 'A' },
  { name: 'Kirchensteuer Kapital (lt. Bescheid)',                      typ: 'E' },

  { name: '▸ Krypto-Einkünfte',                                       typ: 'H' },
  { name: 'Einkünfte aus privaten Veräußerungsgeschäften (§ 23 EStG)', typ: 'A' },
  { name: 'Verlustvortrag § 23 EStG (Vorjahre)',                       typ: 'A' },
  { name: 'Einkünfte aus sonstigen Leistungen (§ 22 Nr. 3 EStG)',      typ: 'A' },
  { name: 'Krypto Termingeschäfte (§ 20 EStG)',                        typ: 'A' },
  { name: 'Verlustvortrag § 20 Termingeschäfte (Vorjahre)',            typ: 'A' },
  { name: 'Steuern auf Krypto gezahlt (lt. Bescheid)',                 typ: 'E' },

  { name: '▸ Krypto-Einstellungen',                                   typ: 'H' },
  { name: 'Verlustvorträge anwenden (ja/nein)',                        typ: 'S' },
  { name: 'JStG 2024 §20 anwenden (ja/nein)',                         typ: 'S' },

  { name: '▸ Auslandsarbeit',                                         typ: 'H' },
  { name: 'Auslandseinkünfte brutto (lt. Bescheid)',                   typ: 'E' },
  { name: 'Auslands-SV-Beitrag AN (lt. Gehaltszettel)',                typ: 'E' },
  { name: 'Anrechenbare Auslandssteuer (lt. Bescheid)',                typ: 'B' },

  { name: '▸ Sozialversicherung',                                     typ: 'H' },
  { name: 'RV-Beitrag AN (lt. LStB)',                                  typ: 'E' },
  { name: 'RV-Beitrag AG (lt. LStB)',                                  typ: 'E' },
  { name: 'KV-Beitrag AN gesamt (lt. LStB)',                           typ: 'E' },
  { name: 'KV-Beitrag AN regulär (lt. LStB)',                          typ: 'E' },
  { name: 'PV-Beitrag AN (lt. LStB)',                                  typ: 'E' },
  { name: 'KV-Beitrag AG (lt. LStB)',                                  typ: 'E' },
  { name: 'PV-Beitrag AG (lt. LStB)',                                  typ: 'E' },
  { name: 'Weitere Versicherungen (lt. Belege)',                       typ: 'E' },
  { name: 'Spenden (lt. Belege)',                                      typ: 'E' },

  { name: '▸ Werbungskosten & Haushalt',                              typ: 'H' },
  { name: 'Tage mit Fahrt zur Arbeit',                                 typ: 'E' },
  { name: 'Einfache Entfernung zur Arbeit (km)',                       typ: 'E' },
  { name: 'Homeoffice-Tage',                                           typ: 'E' },
  { name: 'Arbeitsmittel (lt. Belege)',                                typ: 'E' },
  { name: 'Sonstige Werbungskosten (lt. Belege)',                      typ: 'E' },
  { name: 'Haushaltsnahe Dienstleistungen (lt. Belege)',               typ: 'E' },
  { name: 'Handwerkerleistungen (lt. Belege)',                         typ: 'E' },

  { name: '▸ Allgemeine Angaben',                                     typ: 'H' },
  { name: 'Steuerklasse',                                              typ: 'E' },
  { name: 'Verheiratet (ja/nein)',                                     typ: 'S' },
  { name: 'Anzahl Kinder',                                             typ: 'E' },
  { name: 'Krankenversichert (gesetzlich/privat)',                     typ: 'E' },
  { name: 'Günstigerprüfung (ja/nein)',                                typ: 'S' },
  { name: 'Erstattung / Nachzahlung (lt. Bescheid)',                   typ: 'B' },
  { name: 'Nachzahlungszinsen § 233a AO (lt. Bescheid)',               typ: 'B' },
  { name: 'Verspätungszuschlag (lt. Bescheid)',                        typ: 'B' }
];

// ============================================================
// STEUER_ZEILEN – Struktur des Steuer-Tabs (SSOT)
// ============================================================
//   resIdx  Integer → res[n] aus berechneJahresdaten()
//           'ARBEIT' → res[31] − res[7] − res[8]
//           null     → Header (kein Wert)

const STEUER_ZEILEN = [
  { name: '▸ Einkommen & Abzüge',                         resIdx: null,     typ: 'H'        },
  { name: 'Bruttoarbeitslohn (Inland)',                    resIdx: 31,       typ: 'data'     },
  { name: '− Werbungskosten',                             resIdx: 7,        typ: 'data'     },
  { name: '− Sonderausgaben',                             resIdx: 8,        typ: 'data'     },
  { name: 'Einkünfte aus Arbeit (Zwischensumme)',           resIdx: 'ARBEIT', typ: 'summe'    },

  { name: '▸ Private Veräußerungsgeschäfte (§ 23 EStG)',        resIdx: null,     typ: 'H'        },
  { name: '§23 Veräußerungsgewinne/-verluste (brutto)',    resIdx: 14,       typ: 'data'     },
  { name: '§23 Verlustvortrag verrechnet',                 resIdx: 15,       typ: 'data'     },
  { name: '§23 steuerpflichtig (nach Vortrag)',            resIdx: 16,       typ: 'stpfl'    },
  { name: '§23 Verlustvortrag verbleibend (Ende Jahr)',    resIdx: 17,       typ: 'vortrag'  },

  { name: '▸ Sonstige Einkünfte (§ 22 EStG)',                  resIdx: null,     typ: 'H'        },
  { name: '§22 Einkünfte aus sonstigen Leistungen',       resIdx: 18,       typ: 'stpfl'    },

  { name: '▸ Termingeschäfte (§ 20 EStG)',                     resIdx: null,     typ: 'H'        },
  { name: '§20 Termingeschäfte laufend (brutto)',          resIdx: 19,       typ: 'data'     },
  { name: '§20 Verlustvortrag verrechnet',                 resIdx: 20,       typ: 'data'     },
  { name: '§20 steuerpflichtig (nach Vortrag)',            resIdx: 21,       typ: 'stpfl'    },
  { name: '§20 Verlustvortrag verbleibend (Ende Jahr)',    resIdx: 22,       typ: 'vortrag'  },

  { name: '▸ Kapitalerträge (§ 32d EStG)',                resIdx: null,     typ: 'H'        },
  { name: 'Kapitalerträge (Basis vor Pauschbetrag)',       resIdx: 23,       typ: 'data'     },
  { name: 'Steuerpflichtige Kapitalerträge (§ 32d EStG)', resIdx: 24,       typ: 'stpfl'    },
  { name: 'Kapitalertragsteuer (25 %)',                    resIdx: 2,        typ: 'data'     },
  { name: 'Soli auf Kapitalertragsteuer',                  resIdx: 3,        typ: 'data'     },

  { name: '▸ Zu versteuerndes Einkommen',                 resIdx: null,     typ: 'H'        },
  { name: 'Auslandseinkommen (Progressionsvorbehalt)',     resIdx: 10,       typ: 'data'     },
  { name: 'Gesamteinkommen für Steuersatzermittlung',      resIdx: 11,       typ: 'data'     },
  { name: 'Zu versteuerndes Einkommen (Inland)',           resIdx: 0,        typ: 'summe'    },
  { name: 'Effektiver Steuersatz',                         resIdx: 12,       typ: 'pct'      },

  { name: '▸ Steuerberechnung & Ergebnis',                resIdx: null,     typ: 'H'        },
  { name: 'Einkommensteuer (nach Progressionsvorbehalt)',  resIdx: 1,        typ: 'data'     },
  { name: 'Gesamte Steuerlast (Soll)',                     resIdx: 4,        typ: 'summe'    },
  { name: 'Gezahlte Steuer (Ist)',                         resIdx: 5,        typ: 'data'     },
  { name: 'Erstattung (+) / Nachzahlung (–)',              resIdx: 6,        typ: 'ergebnis' },
  { name: 'davon Zinsen und Zuschläge',                    resIdx: 9,        typ: 'data'     },
  { name: 'Abweichung zum Bescheid',                       resIdx: 13,       typ: 'str'      }
];

// ============================================================
// onOpen
// ============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🧮 Steuer')
    .addItem('▶ Steuerberechnung starten',        'steuerBerechnungStarten')
    .addSeparator()
    .addItem('🔧 Steuerdaten-Tab neu aufbauen',   'aufbauSteuerdatenTab')
    .addItem('🏦 Banken-Tab formatieren',          'formatiereBankenTab')
    .addSeparator()
    .addItem('🔄 Tooltips aktualisieren',          'steuerdatenTooltipsHinzufuegen')
    .addItem('🎨 Legenden aktualisieren',          'legendeAktualisieren')
    .addToUi();
}

// ============================================================
// steuerBerechnenMehrjahre – Hauptfunktion
// ============================================================

function steuerBerechnenMehrjahre() {
  const ss          = SpreadsheetApp.getActiveSpreadsheet();
  const steuerdaten = ss.getSheetByName(SHEET_STEUERDATEN);
  const zielSheet   = ss.getSheetByName(SHEET_ZIEL) || ss.insertSheet(SHEET_ZIEL);
  const bankenSheet = ss.getSheetByName(SHEET_BANKEN);

  if (!steuerdaten) {
    throw new Error('Sheet "' + SHEET_STEUERDATEN + '" nicht gefunden.');
  }

  const totalRows = STEUER_ZEILEN.length;

  // Steuer-Tab: alles ab Zeile 2 löschen

  if (zielSheet.getMaxRows() > 1) {
    zielSheet.getRange(2, 1, zielSheet.getMaxRows() - 1, zielSheet.getMaxColumns())
      .clearContent().clearFormat();
  }

  // ── 1. Steuerdaten einlesen ───────────────────────────────────────────

  const lastCol = steuerdaten.getLastColumn();

  if (lastCol < 2) {
    return;
  }

  const jahreszeilenZellen = steuerdaten.getRange(1, 2, 1, lastCol - 1).getValues()[0];
  const jahreszeile = jahreszeilenZellen.filter(j => /^\d{4}$/.test(j.toString()));
  const numJahre    = jahreszeile.length;

  if (numJahre === 0) {
    return;
  }

  const lastRow    = steuerdaten.getLastRow();
  const labels     = steuerdaten.getRange(2, 1, lastRow - 1).getValues().flat();
  const datenWerte = steuerdaten.getRange(2, 2, lastRow - 1, numJahre).getValues();

  const bankenDaten = (bankenSheet && bankenSheet.getLastRow() > 1)
    ? bankenSheet.getRange(2, 1, bankenSheet.getLastRow() - 1, 15).getValues()
    : [];

  // ── 2. Berechnungen ───────────────────────────────────────────────────

  const berechnungsErgebnisse = [];
  const farbRegeln = [];
  const ergebnisMatrix = STEUER_ZEILEN.map(() => Array(numJahre).fill(''));

  for (let j = 0; j < numJahre; j++) {
    const jahr = parseInt(jahreszeile[j]);
    const datenFuerJahr = Object.fromEntries(labels.map((label, i) => [label.toString().trim(), datenWerte[i][j]]));

    const res = berechneJahresdaten(jahr, datenFuerJahr, bankenDaten);
    berechnungsErgebnisse.push(res);

    // === LOGGING ===

    Logger.log('=== Jahr ' + jahr + ' ===');
    Logger.log('res.length = ' + (res ? res.length : 'null/undefined'));
    Logger.log('res[31] (brutto) = ' + (res ? res[31] : 'n/a'));
    Logger.log('res[7]  (WK)     = ' + (res ? res[7]  : 'n/a'));
    Logger.log('res[8]  (SA)     = ' + (res ? res[8]  : 'n/a'));

    if (!res || res[31] === undefined) {
      Logger.log('FEHLER: res[31] ist undefined. berechnung.gs ist veraltet (hat nur ' + (res ? res.length : 0) + ' Elemente statt 32)!');
    }

    STEUER_ZEILEN.forEach(({ resIdx, typ, name }, idx) => {
      if (typ === 'H' || resIdx === null) {
        return;
      }
      let wert;

      if (resIdx === 'ARBEIT') {
        wert = (res[31] || 0) - (res[7] || 0) - (res[8] || 0);
      } else {
        wert = res[resIdx];

        if (wert === undefined) {
          Logger.log('WARNUNG: res[' + resIdx + '] ist undefined fuer "' + name + '"');
          wert = 0;
        }
      }
      ergebnisMatrix[idx][j] = wert;
    });

    // Farbregeln Erstattung

    const erstIdx = STEUER_ZEILEN.findIndex(z => z.typ === 'ergebnis');
    const diff = res[6];

    if      (diff < -1) {
      farbRegeln.push({ zeile: erstIdx + 2, spalte: j + 2, farbe: '#CC0000', fett: true  });
    } else if (diff >  1) {
      farbRegeln.push({ zeile: erstIdx + 2, spalte: j + 2, farbe: '#188038', fett: true  });
    }

    // Farbregeln Abweichung

    const abwIdx = STEUER_ZEILEN.findIndex(z => z.typ === 'str');
    const abwStr = res[13];

    if (abwStr) {
      const abwNum = parseFloat(abwStr.replace(' €', '').replace(',', '.'));

      if (!isNaN(abwNum)) {
        if      (abwNum === 0) {
          farbRegeln.push({ zeile: abwIdx + 2, spalte: j + 2, farbe: '#188038', fett: false });
        } else if (abwNum <= 10) {
          farbRegeln.push({ zeile: abwIdx + 2, spalte: j + 2, farbe: '#B45309', fett: false });
        } else                   {
          farbRegeln.push({ zeile: abwIdx + 2, spalte: j + 2, farbe: '#CC0000', fett: true  });
        }
      }
    }
  }

  // ── 2b. Plausibilitätswarnungen anzeigen ────────────────────────────────
  // Sammelt alle Warnungen aus res[32] aller Jahre und zeigt einen Dialog.
  // Die Berechnung ist bereits vollständig abgeschlossen – der Dialog ist nicht fatal.

  {
    const alleWarnungen = berechnungsErgebnisse
      .filter(res => res && Array.isArray(res[32]) && res[32].length > 0)
      .flatMap(res => res[32]);

    if (alleWarnungen.length > 0) {
      SpreadsheetApp.getUi().alert('⚠️ Plausibilitätswarnungen\n\n'
        + alleWarnungen.join('\n\n')
        + '\n\nDie Berechnung wurde trotzdem vollständig durchgeführt. Bitte prüfe die markierten Eingaben.');
    }
  }

  // ── 3. Steuer-Tab Inhalte schreiben ──────────────────────────────────

  zielSheet.getRange(1, 1).setValue('Kategorie');
  zielSheet.getRange(1, 2, 1, numJahre).setValues([jahreszeile.map(j => j.toString())]);

  // Label-Spalte als Text formatieren – verhindert dass '= ...' als Formel interpretiert wird

  zielSheet.getRange(2, 1, totalRows, 1).setNumberFormat('@');
  zielSheet.getRange(2, 1, totalRows).setValues(STEUER_ZEILEN.map(z => [z.name]));
  zielSheet.getRange(2, 2, totalRows, numJahre).setValues(ergebnisMatrix);

  try {
    setZielSheetTooltips(zielSheet, STEUER_ZEILEN.map(z => z.name)); 
  } catch (e) {}

  // ── 4. Steuer-Tab Formatierung ────────────────────────────────────────

  zielSheet.setColumnWidth(1, 310);
  zielSheet.setColumnWidths(2, numJahre, 130);

  // Kopfzeile

  zielSheet.getRange(1, 1, 1, numJahre + 1)
    .setBackground(F_DARK).setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  zielSheet.setRowHeight(1, 40);

  STEUER_ZEILEN.forEach(({ typ }, idx) => {
    const row         = idx + 2;
    const gesamtRange = zielSheet.getRange(row, 1, 1, numJahre + 1);
    const labelZelle  = zielSheet.getRange(row, 1);
    const wertRange   = zielSheet.getRange(row, 2, 1, numJahre);

    zielSheet.setRowHeight(row, 40);
    gesamtRange.setVerticalAlignment('middle').setFontSize(10);

    switch (typ) {
    case 'H':
      gesamtRange.setBackground(F_DARK).setFontColor('#FFFFFF')
        .setFontWeight('bold').setHorizontalAlignment('left');
      wertRange.clearContent();
      break;
    case 'summe':
      gesamtRange.setBackground(F_SUMME).setFontWeight('bold');
      wertRange.setNumberFormat('#,##0.00 €').setHorizontalAlignment('right');
      break;
    case 'stpfl':
      gesamtRange.setBackground(F_STPFL);
      labelZelle.setFontColor('#274E13');
      wertRange.setNumberFormat('#,##0.00 €').setHorizontalAlignment('right');
      break;
    case 'vortrag':
      gesamtRange.setBackground(F_VORTRAG);
      labelZelle.setFontColor('#1155CC');
      wertRange.setNumberFormat('#,##0.00 €').setHorizontalAlignment('right');
      break;
    case 'ergebnis':
      labelZelle.setFontWeight('bold');
      wertRange.setNumberFormat('#,##0.00 €').setFontWeight('bold').setHorizontalAlignment('right');
      break;
    case 'pct':
      wertRange.setNumberFormat('0.00%').setHorizontalAlignment('right');
      break;
    case 'str':
      wertRange.setNumberFormat('@').setHorizontalAlignment('right');
      break;
    default:
      wertRange.setNumberFormat('#,##0.00 €').setHorizontalAlignment('right');
    }
  });

  // Trennlinien vor jedem Header (außer dem ersten)

  for (let idx = 1; idx < STEUER_ZEILEN.length; idx++) {
    if (STEUER_ZEILEN[idx].typ === 'H') {
      zielSheet.getRange(idx + 1, 1, 1, numJahre + 1)
        .setBorder(
          false, false, true, false, false, false,
          '#555555', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
        );
    }
  }

  // Schriftfarben

  farbRegeln.forEach(({ zeile, spalte, farbe, fett }) => {
    const zelle = zielSheet.getRange(zeile, spalte);
    zelle.setFontColor(farbe);

    if (fett) {
      zelle.setFontWeight('bold');
    }
  });

  // Legende im Steuer-Tab (rechts vom Datenbereich)

  schreibeLegende(zielSheet, 2, numJahre + 3);

  // ── 5. Auto-Fill: Banken-Tab → Steuerdaten-Tab ───────────────────────

  const autoFeldMap = {
    'Kapitalerträge gesamt (lt. Broker)':                            25,
    'Abgeltungsteuer gezahlt (lt. Bescheid)':                        26,
    'Solidaritätszuschlag Kapital (lt. Bescheid)':                   27,
    'Krypto Termingeschäfte (§ 20 EStG)':                            28,
    'Einkünfte aus privaten Veräußerungsgeschäften (§ 23 EStG)':     29,
    'Einkünfte aus sonstigen Leistungen (§ 22 Nr. 3 EStG)':          30
  };

  const vortragFortschreibung = [
    { quellResIdx: 17, zielFeldname: 'Verlustvortrag § 23 EStG (Vorjahre)' },
    { quellResIdx: 22, zielFeldname: 'Verlustvortrag § 20 Termingeschäfte (Vorjahre)' }
  ];

  const headerZeile = steuerdaten.getRange(1, 2, 1, steuerdaten.getLastColumn() - 1).getValues()[0];
  const jahrSpaltenMap = {};
  headerZeile.forEach((val, i) => {
    if (/^\d{4}$/.test(val.toString())) {
      jahrSpaltenMap[val.toString()] = i + 2;
    }
  });

  Object.entries(autoFeldMap).forEach(([feldname, resIdx]) => {
    const zeilenIdx = labels.findIndex(l => l.toString().trim() === feldname.trim());

    if (zeilenIdx === -1) {
      Logger.log('Auto-Fill WARNUNG: "' + feldname + '" nicht gefunden.');

      return; 
    }
    const sheetZeile = zeilenIdx + 2;

    jahreszeile.forEach((jahrStr, j) => {
      const spalte   = jahrSpaltenMap[jahrStr.toString()];

      if (!spalte) {
        return;
      }
      const autoWert = berechnungsErgebnisse[j]?.[resIdx];

      if (autoWert === undefined || autoWert === null) {
        return;
      }
      const zelle    = steuerdaten.getRange(sheetZeile, spalte);
      const bg       = (zelle.getBackground() || '#ffffff').toLowerCase().replace(/\s/g, '');

      if (bg !== '#d9ead3') {
        zelle.setValue(autoWert).setBackground(F_AUTO);
      }
    });
  });

  SpreadsheetApp.flush();

  vortragFortschreibung.forEach(({ quellResIdx, zielFeldname }) => {
    const zielIdx = labels.findIndex(l => l.toString().trim() === zielFeldname.trim());

    if (zielIdx === -1) {
      Logger.log('Vortrag WARNUNG: "' + zielFeldname + '" nicht gefunden.');

      return; 
    }
    const zielSheetZeile = zielIdx + 2;

    for (let j = 0; j < numJahre - 1; j++) {
      const quellWert  = berechnungsErgebnisse[j]?.[quellResIdx];

      if (quellWert === undefined || quellWert === null) {
        continue;
      }
      const zielSpalte = jahrSpaltenMap[jahreszeile[j + 1].toString()];

      if (!zielSpalte) {
        continue;
      }
      const zielZelle  = steuerdaten.getRange(zielSheetZeile, zielSpalte);
      const bg         = (zielZelle.getBackground() || '#ffffff').toLowerCase().replace(/\s/g, '');

      if (bg !== '#d9ead3') {
        zielZelle.setValue(parseFloat(quellWert.toFixed(2))).setBackground(F_AUTO);
      }
    }
  });

  SpreadsheetApp.flush();

  // ── 6. Legenden aktualisieren ─────────────────────────────────────────

  try {
    legendeAktualisieren(); 
  } catch (e) {}
}

// ============================================================
// aufbauSteuerdatenTab – Tab komplett neu strukturieren
// ============================================================

function aufbauSteuerdatenTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const antwort = ui.alert(
    '🔧 Steuerdaten-Tab neu aufbauen',
    'Alle bestehenden Werte werden gesichert und das Tab mit der neuen Struktur '
    + 'neu aufgebaut.\n\nEine Sicherungskopie wird automatisch erstellt.\n\nFortfahren?',
    ui.ButtonSet.YES_NO
  );

  if (antwort !== ui.Button.YES) {
    return;
  }

  const sheet = ss.getSheetByName(SHEET_STEUERDATEN);

  if (!sheet) {
    throw new Error('Sheet "' + SHEET_STEUERDATEN + '" nicht gefunden.');
  }

  // Sicherungskopie

  const sicherungName = SHEET_STEUERDATEN + '_Sicherung_'
    + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  sheet.copyTo(ss).setName(sicherungName);

  // Alte Werte einlesen

  const lastCol   = sheet.getLastColumn();
  const lastRow   = sheet.getLastRow();

  if (lastCol < 2 || lastRow < 2) {
    ui.alert('Tab ist leer.');

    return; 
  }

  const jahreszeilenAlt = sheet.getRange(1, 2, 1, lastCol - 1).getValues()[0];
  const jahreAlt  = jahreszeilenAlt.filter(j => /^\d{4}$/.test(j.toString()));
  const numJahre  = jahreAlt.length;
  const altLabels = sheet.getRange(2, 1, lastRow - 1).getValues().flat().map(v => v.toString().trim());
  const altWerte  = numJahre > 0 ? sheet.getRange(2, 2, lastRow - 1, numJahre).getValues() : [];

  function altWert(feldname, jahrIdx) {
    const idx = altLabels.findIndex(l => l === feldname.trim());

    if (idx === -1 || jahrIdx >= numJahre || !altWerte[idx]) {
      return '';
    }
    
    return altWerte[idx][jahrIdx] !== undefined ? altWerte[idx][jahrIdx] : '';
  }

  // Tab leeren

  sheet.clearContents();
  sheet.clearFormats();

  const numZeilen = STEUERDATEN_FELDER.length;

  // Kopfzeile

  sheet.getRange(1, 1).setValue('Steuerdaten');

  if (numJahre > 0) {
    sheet.getRange(1, 2, 1, numJahre).setValues([jahreAlt.map(j => j.toString())]);
  }

  // Labels (Textformat setzt '=' außer Kraft)

  sheet.getRange(2, 1, numZeilen, 1).setNumberFormat('@');
  sheet.getRange(2, 1, numZeilen).setValues(STEUERDATEN_FELDER.map(f => [f.name]));

  // Werte zurückschreiben

  if (numJahre > 0) {
    const neuWerte = STEUERDATEN_FELDER.map(({ name, typ }) => {
      if (typ === 'H') {
        return Array(numJahre).fill('');
      }
      
      return jahreAlt.map((_, j) => altWert(name, j));
    });
    sheet.getRange(2, 2, numZeilen, numJahre).setValues(neuWerte);
  }

  // ── Formatierungen ─────────────────────────────────────────────────────

  // Kopfzeile

  sheet.getRange(1, 1, 1, numJahre + 1)
    .setBackground(F_DARK).setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  // Spaltenbreiten

  sheet.setColumnWidth(1, 340);

  for (let j = 2; j <= numJahre + 1; j++) {
    sheet.setColumnWidth(j, 130);
  }

  STEUERDATEN_FELDER.forEach(({ name, typ }, idx) => {
    const row         = idx + 2;
    const gesamtRange = numJahre > 0
      ? sheet.getRange(row, 1, 1, numJahre + 1)
      : sheet.getRange(row, 1);
    const labelRange  = sheet.getRange(row, 1);
    const wertRange   = numJahre > 0 ? sheet.getRange(row, 2, 1, numJahre) : null;

    sheet.setRowHeight(row, 40);
    gesamtRange.setVerticalAlignment('middle').setFontSize(10);

    switch (typ) {
    case 'H':
      gesamtRange.setBackground(F_DARK).setFontColor('#FFFFFF')
        .setFontWeight('bold').setHorizontalAlignment('left');
      break;
    case 'A':
      gesamtRange.setBackground(F_AUTO);
      labelRange.setFontColor('#7D6608');
      break;
    case 'B':
      gesamtRange.setBackground(F_BESCHEID);
      labelRange.setFontColor('#274E13');
      break;
    case 'S':
    default: // 'E' + 'S'
      gesamtRange.setBackground('#FFFFFF').setFontColor('#000000');
    }

    // Zahlenformat

    if (wertRange && typ !== 'H') {
      if (KEIN_EURO_FORMAT.has(name)) {
        wertRange.setNumberFormat('@').setHorizontalAlignment('right');
      } else {
        wertRange.setNumberFormat('#,##0.00 €').setHorizontalAlignment('right');
      }
    }
  });

  // Trennlinien vor jedem Header-Block

  for (let idx = 1; idx < STEUERDATEN_FELDER.length; idx++) {
    if (STEUERDATEN_FELDER[idx].typ === 'H') {
      sheet.getRange(idx + 1, 1, 1, numJahre + 1)
        .setBorder(
          false, false, true, false, false, false,
          '#555555', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
        );
    }
  }

  legendeAktualisieren();
  try {
    steuerdatenTooltipsHinzufuegen(); 
  } catch (e) {}

  // Zeilenhöhen nochmals setzen – legendeAktualisieren() darf sie nicht überschreiben

  sheet.setRowHeight(1, 40);

  for (let i = 0; i < STEUERDATEN_FELDER.length; i++) {
    sheet.setRowHeight(i + 2, 40);
  }

  SpreadsheetApp.flush();

  ui.alert(
    '✅ Fertig',
    'Das Steuerdaten-Tab wurde neu strukturiert.\n\n'
    + 'Sicherungskopie: "' + sicherungName + '"\n\n'
    + 'Bitte jetzt "▶ Steuerberechnung starten" ausführen, um Auto-Fill-Werte zu befüllen.',
    ui.ButtonSet.OK
  );
}

// ============================================================
// Legende
// ============================================================

function steuerBerechnungStarten() {
  steuerBerechnenMehrjahre();
}

/**
 * Legende im Steuerdaten-Tab aktualisieren.
 * Feste Spalte LEGENDE_SPALTE – löscht vorher den Bereich, damit
 * beim wiederholten Ausführen keine alte Legende stehen bleibt.
 */

function legendeAktualisieren() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_STEUERDATEN);

  if (!sheet) {
    return;
  }

  // Alte Legende löschen (15 Zeilen an fester Spalte)

  sheet.getRange(1, LEGENDE_SPALTE, 20, 1).clearContent().clearFormat();
  schreibeLegende(sheet, 2, LEGENDE_SPALTE);
}

/**
 * Einheitliche Legende für Steuerdaten-Tab und Steuer-Tab.
 * Gleicher Inhalt, gleiche Farben, eine einzige Spalte.
 */

function schreibeLegende(sheet, startZeile, startSpalte) {

  // Bereich erst leeren

  sheet.getRange(startZeile, startSpalte, 15, 1).clearContent().clearFormat();

  // [Hintergrund, Schrift, Text, Trennlinie danach]

  const EINTRAEGE = [
    [F_DARK,     '#FFFFFF', ' Farbkode – Erklärung',                              false],
    [F_AUTO,     '#7D6608', ' Gelb: automatisch aus dem Banken-Tab befüllt',       false],
    [F_BESCHEID, '#274E13', ' Grün: Wert direkt aus dem Steuerbescheid',           true],
    [F_STPFL,    '#274E13', ' Hellgrün: fließt ins zvE oder die Kapital-Basis',    false],
    [F_VORTRAG,  '#1155CC', ' Hellblau: Verlustvortrag (wird fortgeschrieben)',    true],
    ['#FFFFFF',  '#188038', ' Grüne Schrift: Erstattung / Abweichung 0 €',         false],
    ['#FFFFFF',  '#B45309', ' Orange: Abweichung 1–10 € (Rundung normal)',          false],
    ['#FFFFFF',  '#CC0000', ' Rot: Nachzahlung / Abweichung über 10 €',             false]
  ];

  EINTRAEGE.forEach(([bg, fg, text, trenn], i) => {
    const zelle = sheet.getRange(startZeile + i, startSpalte);
    zelle
      .setValue(text)
      .setBackground(bg)
      .setFontColor(fg)
      .setFontSize(10)
      .setFontWeight(i === 0 ? 'bold' : 'normal')
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle')
      .setBorder(
        true, true, true, true, false, false,
        '#AAAAAA', SpreadsheetApp.BorderStyle.SOLID
      );

    if (trenn) {
      zelle.setBorder(
        false, false, true, false, false, false,
        '#555555', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
      );
    }
  });

  sheet.setColumnWidth(startSpalte, 320);
}

// ============================================================
// formatiereBankenTab – Banken-Tab im einheitlichen Stil formatieren
// ============================================================
//
// Spaltenstruktur (fest, 15 Spalten):
//   A  Bank
//   B  Typ        (Einzel / Gemeinschaft 50% / Gemeinschaft 50% (KapESt voll) /
//                  Gemeinschaft 33% / Krypto / Ignorieren)
//   C  Jahr
//   D  Kapitalerträge
//   E  Abgeltungsteuer
//   F  Soli Kapital
//   G  Kirchensteuer Kapital
//   H  genutzter Pauschbetrag
//   I  §56 InvStG (bestandsgeschützte Alt-Anteile)
//   J  Zugeflossen geltende Erträge (Z.19 KAP)
//   K  Krypto §20 KAP (Margin/Futures)
//   L  Verluste/Verrechnung (broker-intern)
//   M  Einkünfte § 23 EStG
//   N  Sonstige Einkünfte (§ 22 EStG)
//   O  Notiz
//
// NEUES JAHR HINZUFÜGEN:
//   Einfach neue Zeilen am Ende eintragen (Bank, Typ, Jahr, Werte).
//   Dann "▶ Steuerberechnung starten" – das Script liest alle Jahre automatisch.
//   Danach "🏦 Banken-Tab formatieren" für konsistente Darstellung.

const BANKEN_SPALTEN = [
  // 'name': interner Key (kein \n, kein Sonderformat)
  // 'header': Kopfzeilen-Anzeige mit \n für kontrollierten Umbruch

  { name: 'Bank',                 header: 'Bank',                      breite: 200, format: '@',           align: 'left'   },
  { name: 'Typ',                  header: 'Typ',                       breite: 130, format: '@',           align: 'left'   },
  { name: 'Jahr',                 header: 'Jahr',                      breite:  58, format: '0',           align: 'center' },
  { name: 'Kapitalerträge',       header: 'Kapital-\nerträge',         breite: 100, format: '#,##0.00 €', align: 'right'  },
  { name: 'Kapitalertragsteuer',  header: 'Kapital-\nertrag-\nsteuer', breite:  90, format: '#,##0.00 €', align: 'right'  },
  { name: 'Soli Kapital',         header: 'Soli\nKapital',             breite:  80, format: '#,##0.00 €', align: 'right'  },
  { name: 'Kirchensteuer',        header: 'Kirchen-\nsteuer',          breite:  85, format: '#,##0.00 €', align: 'right'  },
  { name: 'Sparer-Pauschbetrag',  header: 'Sparer-\nPausch-\nbetrag', breite:  85, format: '#,##0.00 €', align: 'right'  },
  { name: '§ 56 InvStG',          header: '§ 56\nInvStG',             breite:  80, format: '#,##0.00 €', align: 'right'  },
  { name: 'Fiktiv zugeflossen',   header: 'Fiktiv\nzuge-\nflossen',   breite:  80, format: '#,##0.00 €', align: 'right'  },
  { name: 'Broker-Verluste',      header: 'Broker-\nVerluste',         breite:  85, format: '#,##0.00 €', align: 'right'  },
  { name: '§ 20 EStG',            header: '§ 20\nEStG',               breite:  90, format: '#,##0.00 €', align: 'right'  },
  { name: '§ 23 EStG',            header: '§ 23\nEStG',               breite:  80, format: '#,##0.00 €', align: 'right'  },
  { name: '§ 22 EStG',            header: '§ 22\nEStG',               breite:  80, format: '#,##0.00 €', align: 'right'  },
  { name: 'Notiz',                header: 'Notiz',                     breite: 180, format: '@',           align: 'left'   }
];

// Zeilenfarben je Typ

const BANKEN_FARBEN = {
  'einzel':                              '#FFFFFF',
  'gemeinschaft 50%':                    '#E8F0FE',  // Hellblau
  'gemeinschaft 50% (kapest voll)':      '#E8F0FE',
  'gemeinschaft 33%':                    '#E8F0FE',
  'krypto':                              '#E9F5E9',  // Hellgrün
  'ignorieren':                          '#F3F3F3',  // Hellgrau
  'ignore':                              '#F3F3F3',
  'nein':                                '#F3F3F3',
  'no':                                  '#F3F3F3',
  '-':                                   '#F3F3F3'
};

function formatiereBankenTab() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_BANKEN);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Sheet "' + SHEET_BANKEN + '" nicht gefunden.');
    
    return;
  }

  const lastRow = sheet.getLastRow();
  const numSpalten = BANKEN_SPALTEN.length; // 15

  // ── Kopfzeile ─────────────────────────────────────────────────────────

  // Kopfzeile-Inhalte schreiben (falls leer oder falsch)

  const kopfRange = sheet.getRange(1, 1, 1, numSpalten);
  kopfRange.setNumberFormat('@');
  kopfRange.setValues([BANKEN_SPALTEN.map(s => s.header)]);
  kopfRange
    .setBackground(F_DARK).setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 62);

  // Spaltenbreiten

  BANKEN_SPALTEN.forEach((s, i) => sheet.setColumnWidth(i + 1, s.breite));

  // ── Datenzeilen formatieren ───────────────────────────────────────────

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('Keine Daten vorhanden. Kopfzeile wurde gesetzt.');
    
    return;
  }

  const numDatenzeilen = lastRow - 1;

  // Formate pro Spalte auf alle Datenzeilen setzen

  BANKEN_SPALTEN.forEach((s, i) => {
    const col = i + 1;
    sheet.getRange(2, col, numDatenzeilen)
      .setNumberFormat(s.format)
      .setHorizontalAlignment(s.align)
      .setFontSize(10)
      .setVerticalAlignment('middle');
  });

  // Zeilenhöhe und Zeilenfarbe nach Typ
  const typWerte = sheet.getRange(2, 2, numDatenzeilen).getValues(); // Spalte B = Typ

  for (let i = 0; i < numDatenzeilen; i++) {
    const row = i + 2;
    sheet.setRowHeight(row, 40);

    const typ = (typWerte[i][0] || '').toString().trim().toLowerCase();
    const farbe = BANKEN_FARBEN[typ] || '#FFFFFF';
    sheet.getRange(row, 1, 1, numSpalten).setBackground(farbe);

    // Ignorierte Zeilen: Schrift grau

    const istIgnoriert = ['ignorieren', 'ignore', 'nein', 'no', '-'].includes(typ);

    if (istIgnoriert) {
      sheet.getRange(row, 1, 1, numSpalten).setFontColor('#999999');
    } else {
      sheet.getRange(row, 1, 1, numSpalten).setFontColor('#000000');
    }
  }

  // Trennlinien zwischen Jahren.
  // Für JEDE Zeile setBorder explizit aufrufen um alte Borders zu überschreiben.
  // Zwei separate Aufrufe nötig: Apps Script ignoriert color/style wenn bottom=false.

  const jahrSpalte = sheet.getRange(2, 3, numDatenzeilen).getValues();

  for (let i = 0; i < numDatenzeilen; i++) {
    const zeilennr   = i + 2;
    const jahrJetzt  = (jahrSpalte[i][0]     || '').toString().trim();
    const jahrDanach = i < numDatenzeilen - 1 ? (jahrSpalte[i + 1][0] || '').toString().trim() : '';
    const istTrenner = jahrJetzt !== '' && jahrDanach !== '' && jahrJetzt !== jahrDanach;
    const zeile      = sheet.getRange(zeilennr, 1, 1, numSpalten);

    if (istTrenner) {
      zeile.setBorder(
        null, null, true, null, null, null,
        '#555555', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
      );
    } else {
      zeile.setBorder(null, null, false, null, null, null);
    }
  }

  // Tooltips auf Kopfzeile

  try {
    setBankenTabTooltips(sheet); 
  } catch (e) {}

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('✅ Banken-Tab formatiert.\n\nFür neue Jahre: Zeilen am Ende einfügen, dann erneut formatieren.');
}