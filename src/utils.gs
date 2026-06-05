/**
 * Konvertiert einen Zahlenwert aus beliebigem Format in eine Zahl.
 * Unterstützt sowohl deutsche als auch englische Schreibweise.
 * @param {string|number|null|undefined} wert
 * @returns {number}
 */

/**
 * Konvertiert einen Wert in eine Zahl und rundet kaufmännisch auf 2 Nachkommastellen.
 * @param {string|number|null|undefined} wert Der zu konvertierende Wert.
 * @returns {number} Die konvertierte und gerundete Zahl.
 */

function parseZahl(wert) {
  if (wert === null || wert === undefined || wert === '') {
    return 0;
  }

  let num;

  if (typeof wert === 'number') {
    num = wert;
  } else {
    const v = wert.toString().trim().replace(/\./g, '').replace(',', '.');
    num = parseFloat(v);
  }

  if (isNaN(num)) {
    return 0;
  }

  // Runde kaufmännisch auf 2 Nachkommastellen, um die Genauigkeit des Finanzamts zu simulieren

  return parseFloat((Math.round(num * 100) / 100).toFixed(2));
}

/**
 * Interpretiert ein Ja/Nein-Feld (z. B. "ja", "nein", Groß-/Kleinschreibung).
 * @param {string|undefined|null} feld
 * @returns {boolean}
 */

function parseJaNeinFeld(feld) {
  return (feld || '').toString().trim().toLowerCase() === 'ja';
}