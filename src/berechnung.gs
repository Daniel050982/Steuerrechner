/**
 * Kernfunktion der Tarifberechnung (ESt-Grundtarif / Splittingtarif)
 * Berechnet die tarifliche Einkommensteuer nach den Zonen des § 32a EStG.
 *
 * @param {number} zvE  Zu versteuerndes Einkommen (ganzzahlig)
 * @param {boolean} verheiratet  true = Splittingverfahren
 * @param {number|string} jahr
 * @returns {number} Tarifliche Einkommensteuer (ganzzahlig, auf volle Euro abgerundet)
 */

function berechneEinkommensteuer(zvE, verheiratet, jahr) {
  const config = getConfig(jahr);
  const c = config.tarif;

  // Beim Splitting: halbes zvE berechnen, Ergebnis verdoppeln

  const x = verheiratet ? Math.floor(zvE / 2) : Math.floor(zvE);

  // Zone 1: Grundfreibetrag → 0 €

  if (x <= config.gfb) {
    return 0;
  }

  let est;

  if (x <= c.z3_start) {

    // Zone 2: erste Progressionszone

    const y = (x - config.gfb) / 10000;
    est = (c.z2_faktor1 * y + c.z2_faktor2) * y;

  } else if (x <= c.z4_start) {

    // Zone 3: zweite Progressionszone

    const y = (x - c.z3_start) / 10000;
    est = (c.z3_faktor1 * y + c.z3_faktor2) * y + c.z3_add;

  } else if (x <= c.z5_start) {

    // Zone 4: Proportionalzone 42%

    est = c.z4_faktor * x - c.z4_sub;

  } else {

    // Zone 5: Reichensteuer 45%

    est = c.z5_faktor * x - c.z5_sub;
  }

  est = Math.floor(est);
  
  return verheiratet ? est * 2 : est;
}

/**
 * Berechnet den Solidaritätszuschlag auf einen gegebenen ESt-Betrag.
 * Berücksichtigt die Milderungszone nach § 4 SolZG.
 *
 * Historische Schwellwerte (ESt-Betrag, Einzelperson):
 *   2019–2020: Freigrenze   972 €, danach voller Satz (keine Milderungszone relevant)
 *   2021+:     Freigrenze 16.956 € (2021–2022), 17.543 € (2023), 18.130 € (2024–2025)
 *              Mit Milderungszone: Soli wächst gleitend von 0 auf vollen Satz
 *
 * @param {number} est  Einkommensteuer-Betrag (auf den Soli berechnet wird)
 * @param {number} freigrenze  Freigrenze aus der Jahres-Config (ESt-Betrag)
 * @returns {number} Solidaritätszuschlag (ganzzahlig, abgerundet)
 */

function berechneSoli(est, freigrenze) {
  if (est <= freigrenze) {
    return 0;
  }

  // Voller Soli-Satz: 5,5%
  // Das FA berechnet auf 2 Nachkommastellen und schneidet ab (floor), nicht rundet.
  // Bsp: 5.271 × 5,5% = 289,905 → floor auf Cent = 289,90 €

  const soli_voll = Math.floor(est * 0.055 * 100) / 100;

  // Milderungszone: ebenfalls floor auf Cent-Ebene

  const soli_milderung = Math.floor((est - freigrenze) * 0.20 * 100) / 100;

  return Math.min(soli_voll, soli_milderung);
}

/**
 * Führt die vollständige Steuerberechnung für ein einzelnes Jahr durch.
 *
 * @param {number|string} jahr  Veranlagungsjahr
 * @param {Object} daten  Key-Value-Paare aus dem Steuerdaten-Sheet
 * @param {Array} bankenDaten  Rohdaten aus dem Banken-Sheet (aktuell als Reserve)
 * @returns {Array} Ergebnis-Array (Reihenfolge wie im Mapping in main.gs dokumentiert)
 */

function berechneJahresdaten(jahr, daten, bankenDaten) {

  // === Block 1: Initialisierung & Konfiguration ===

  const config = getConfig(jahr);
  const verheiratet = parseJaNeinFeld(daten['Verheiratet (ja/nein)']);
  const guenstiger  = parseJaNeinFeld(daten['Günstigerprüfung (ja/nein)']);

  // Schalter: Verlustvorträge §23 und §20 anwenden (ja/nein).
  // "ja"  → Vorträge aus den Feldern 'Verlustvortrag § 23 EStG (Vorjahre)' und
  //          'Verlustvortrag § 20 Termingeschäfte (Vorjahre)' werden verrechnet.
  // "nein" → Vorträge werden ignoriert (Simulation des Ist-Zustands ohne festgestellte Vorträge).

  const vortragAktiv = parseJaNeinFeld(daten['Verlustvorträge anwenden (ja/nein)']);

  // === Block 2: Werbungskosten ===

  const brutto              = parseZahl(daten['Bruttoarbeitslohn']);
  const fahrtTage           = parseZahl(daten['Tage mit Fahrt zur Arbeit']);
  const fahrtKm             = parseZahl(daten['Einfache Entfernung zur Arbeit (km)']);
  const arbeitsmittel       = parseZahl(daten['Arbeitsmittel (lt. Belege)']);
  const sonstigeWK          = parseZahl(daten['Sonstige Werbungskosten (lt. Belege)']);
  const homeofficeTage      = parseZahl(daten['Homeoffice-Tage']);

  // Homeoffice-Pauschale: begrenzt auf Jahreshöchstbetrag der jeweiligen Config

  const homeofficePauschale = Math.min(
    homeofficeTage * config.homeofficePauschaleProTag,
    config.homeofficePauschaleMaxTage * config.homeofficePauschaleProTag
  );

  // Entfernungspauschale: km 1 bis (ab_km - 1) mit Basispauschale,
  // ab ab_km mit erhöhter Pauschale (vor 2021: ab_km = 9999, also greift nie)
  //
  // FIX (2019-Analyse): Das FA rundet auf volle Euro mit Math.ceil, nicht Math.round.
  // Beispiel 2019: 34 × 67 × 0,30 = 683,40 → ceil = 684 ✓ (round würde 683 geben)

  let entfernungspauschale = 0;

  if (fahrtKm > 0 && fahrtTage > 0) {
    const kmBasis    = Math.min(fahrtKm, config.entfernungspauschale_erhoeht_ab_km - 1);
    const kmErhoeht  = Math.max(0, fahrtKm - kmBasis);

    entfernungspauschale = Math.ceil(fahrtTage * (kmBasis * config.entfernungspauschale_basis
                   + kmErhoeht * config.entfernungspauschale_erhoeht));
  }

  const tatsaechlicheWK = entfernungspauschale + arbeitsmittel + sonstigeWK;

  // Mindestansatz: Arbeitnehmer-Pauschbetrag (inkl. Homeoffice als Ergänzung)

  const werbungskosten = Math.floor(Math.max(tatsaechlicheWK + homeofficePauschale, config.werbungskostenpauschale));

  // === Block 3: Summe der inländischen Einkünfte ===

  // § 23 EStG – Private Veräußerungsgeschäfte (z. B. Krypto-Gewinne/-Verluste):
  // VERLUSTE aus §23 mindern das zvE des laufenden Jahres NICHT.
  // Sie werden als separater Verlustvortrag festgestellt (§ 10d EStG) und können
  // nur mit zukünftigen §23-GEWINNEN verrechnet werden.
  // GEWINNE aus §23 hingegen sind steuerpflichtig und erhöhen das zvE.

  // Wert aus Steuerdaten-Tab hat VORRANG. Wenn dort 0 (leer/gelb): Wert aus Banken-Tab.
  // Override-Logik analog zu §20: verhindert Doppelzählung nach Auto-Fill.

  const kryptoSO_manual = parseZahl(daten['Einkünfte aus privaten Veräußerungsgeschäften (§ 23 EStG)']);

  // §23 Verlustvortrag aus Vorjahren (Wert aus Steuerdaten-Tab, positiv eintragen)
  // Dieser Vortrag wird mit laufenden §23-Gewinnen verrechnet, bevor sie steuerpflichtig werden.
  // Nur aktiv wenn vortragAktiv = true.

  const vortrag23 = vortragAktiv
    ? parseZahl(daten['Verlustvortrag § 23 EStG (Vorjahre)'])
    : 0;

  // § 22 EStG – Sonstige Einkünfte (Staking, Airdrops, Lending etc.):
  // Wert aus Steuerdaten-Tab hat VORRANG. Wenn dort 0 (leer/gelb): Wert aus Banken-Tab.

  const sonstigeSO_manual = parseZahl(daten['Einkünfte aus sonstigen Leistungen (§ 22 Nr. 3 EStG)']);

  // === Block 4: Sonderausgaben / Vorsorgeaufwendungen ===

  const an_rv          = parseZahl(daten['RV-Beitrag AN (lt. LStB)']);
  const ag_rv          = parseZahl(daten['RV-Beitrag AG (lt. LStB)']);
  const an_kv_gesamt   = parseZahl(daten['KV-Beitrag AN gesamt (lt. LStB)']);
  const an_kv_regulaer = parseZahl(daten['KV-Beitrag AN regulär (lt. LStB)']);
  const an_pv          = parseZahl(daten['PV-Beitrag AN (lt. LStB)']);
  const spenden        = parseZahl(daten['Spenden (lt. Belege)']);

  // Rentenversicherung: prozentualer Abzug steigt bis 2023 auf 100%
  // Gesamtbeitrag (AN+AG) × vorsorgeAbzug = anerkannter Betrag
  // davon zieht das FA den AG-Anteil ab (weil steuerfreigestellt)

  const gesamt_rv          = an_rv + ag_rv;

  // FIX (2019-Analyse): Das FA rundet den Gesamtbeitrag zuerst kaufmännisch auf volle Euro
  // (Math.round), dann multipliziert es mit dem Abzugsprozentsatz und rundet das Ergebnis
  // mit Math.ceil auf volle Euro.
  // Beispiel 2019: AN 581,25 + AG 581,25 = 1.162,50 → round = 1.163
  //                1.163 × 88% = 1.023,44 → ceil = 1.024 ✓
  //                (alt: floor(1162,50 × 0,88) = floor(1023,00) = 1.023 ✗)
  // Bescheid 2023: 4496,28 + 4496,28 = 8992,56 → round = 8993 → × 100% → ceil = 8993 ✓

  const anteil_rv_bescheid = Math.ceil(Math.round(gesamt_rv) * config.vorsorgeAbzug);

  // FA rundet den AG-Anteil auf volle Euro (floor) bevor er ihn abzieht
  // Bsp: 8169 / 2 = 4084,5 → FA nutzt 4084 → 7679 − 4084 = 3595

  const abziehbareRV       = anteil_rv_bescheid - Math.floor(ag_rv);

  // KV: FA-Methode: Kürzungsbetrag = floor(kv_basis × Kürzungsquote), dann abziehen
  // FA rundet KV und PV ZUERST auf volle Euro (ceil), dann Kürzung anwenden.
  // Bescheid 2023: KV 3819,41 → 3.820 (ceil), Kürzung floor(3820×4%)=152, verbleibend 3668
  // PV 1019,39 → 1.020 (ceil)
  //
  // FIX (2019-Analyse): Die 4%-Kürzung (Krankengeldanteil nach § 10 Abs. 1 Nr. 3a EStG)
  // wird NUR auf den regulären KV-Beitrag angewendet (Zeile 'KV-Beitrag AN regulär (lt. LStB)'),
  // NICHT auf den Gesamtbeitrag inkl. Zusatzbeitrag.
  // Beispiel 2019: KV gesamt 2.201 €, KV regulär 478,13 €
  //   kv_gerundet    = ceil(2201,00) = 2.201 €  ← voller Betrag wird angesetzt
  //   kv_kuerz_basis = ceil(478,13)  =   479 €  ← nur regulärer Anteil für Kürzung
  //   kv_kuerzung    = floor(479 × 0,04) = floor(19,16) = 19 €
  //   abziehbare KV  = 2.201 – 19 = 2.182 € ✓
  //   (alt: floor(2201 × 0,04) = 88 € Kürzung → 2.113 € ✗)
  //
  // Fallback: Wenn 'KV-Beitrag AN regulär' nicht befüllt ist (= 0),
  // wird der Gesamtbeitrag als Kürzungsbasis verwendet (Verhalten wie vor dem Fix).

  const kv_gerundet    = Math.ceil(an_kv_gesamt);
  const kv_kuerz_basis = an_kv_regulaer > 0
    ? Math.ceil(an_kv_regulaer)
    : kv_gerundet;
  const kv_kuerzung    = Math.floor(kv_kuerz_basis * config.krankengeld_kuerzung);
  const abziehbareKV   = kv_gerundet - kv_kuerzung;
  const abziehbarePV   = Math.ceil(an_pv);

  const vorsorge_basis = abziehbareKV + abziehbarePV; // Vergleichswert gegen 1.900 €-Deckel

  // Sonstige Vorsorgeaufwendungen (Haftpflicht etc.): nur absetzbar,
  // soweit KV+PV den 1.900 €-Deckel noch nicht ausschöpfen

  const weitereVers          = parseZahl(daten['Weitere Versicherungen (lt. Belege)']);
  const abziehbareWeitereVers = vorsorge_basis < 1900
    ? Math.min(weitereVers, 1900 - vorsorge_basis)
    : 0;

  const sonderausgaben
    = abziehbareRV
    + vorsorge_basis
    + abziehbareWeitereVers
    + Math.floor(spenden);

  // === Block 5: Kapitalerträge aus Banken-Tab aggregieren ===

  // Banken-Tab Spalten (0-basiert):
  //   0: Bank    1: Typ    2: Jahr    3: Kapitalerträge    4: Abgeltungsteuer    5: Soli Kapital
  //   6: Kirchensteuer    7: genutzter Pauschbetrag    8: §56 InvStG
  //   9: Zugeflossen Z.19 KAP    10: Krypto §20 KAP (Margin/Futures)
  //  11: Verluste/Verrechnung
  //  12: Veräußerungsgewinne (§ 23 EStG)   ← NEU
  //  13: Sonstige Einkünfte (§ 22 EStG)    ← NEU  //  14: Notiz
  //
  // Typ-Werte:
  //   'Einzel'                         → Kapital × 1.0, KapESt/Soli × 1.0
  //   'Gemeinschaft 50%'               → Kapital × 0.5, KapESt/Soli × 0.5
  //   'Gemeinschaft 50% (KapESt voll)' → Kapital × 0.5, KapESt/Soli × 1.0
  //     Anwendungsfall: GK, bei dem der Mitinhaber keine eigene Steuererklärung
  //     macht – das FA rechnet die volle einbehaltene KapESt des GK dem
  //     Kontoinhaber an, der die Erklärung abgibt.
  //   'Gemeinschaft 33%'               → Kapital × 0.333, KapESt/Soli × 0.333
  //   'Krypto'                         → Kapital/Abgelt/Soli/PB ignoriert;
  //                                       liest §20 KAP, §23, §22

  // Struktur-Erkennung Banken-Tab (3 mögliche Varianten):
  //
  // Alt (11 Sp.): Bank(0) | Jahr(1) | Kap(2) | Abgelt(3) | Soli(4) | KirchenSt(5) | PB(6) | §56(7) | Z19(8) | §20(9) | Verluste(10)
  // Neu-A(13+ Sp.): Bank(0) | Jahr(1) | Typ(2) | Kap(3) | ...
  // Neu-B(15 Sp.): Bank(0) | Typ(1)  | Jahr(2) | Kap(3) | ... | §23(12) | §22(13) | Notiz(14)  ← aktuelle Struktur
  //
  // Erkennung:
  //   r[2] ist ein Text (nicht leer, nicht Zahl) → Neu-A (Jahr=1, Typ=2)
  //   r[1] ist ein Text (nicht leer, nicht Zahl) → Neu-B (Typ=1, Jahr=2)
  //   sonst → Alt (Jahr=1, kein Typ)

  function erkennStruktur(daten) {
    if (!daten || daten.length === 0) {
      return 'alt';
    }
    const r = daten[0];
    const r1 = (r[1] || '').toString().trim();
    const r2 = (r[2] || '').toString().trim();
    const istZahl = v => v !== '' && !isNaN(parseFloat(v));

    if (r1 !== '' && !istZahl(r1) && !/^\d{4}$/.test(r1)) {
      return 'neuB';
    } // Typ an [1]

    if (r2 !== '' && !istZahl(r2) && !/^\d{4}$/.test(r2)) {
      return 'neuA';
    } // Typ an [2]
    
    return 'alt';
  }
  const struktur = erkennStruktur(bankenDaten);

  // Spalten-Offsets je nach erkannter Struktur

  const COL_TYP  = struktur === 'neuA' ? 2  : struktur === 'neuB' ? 1  : -1;
  const COL_JAHR = struktur === 'neuB' ? 2  : 1;
  const COL_KAP  = struktur === 'alt'  ? 2  : 3;
  const COL_ABG  = struktur === 'alt'  ? 3  : 4;
  const COL_SOLI = struktur === 'alt'  ? 4  : 5;
  const COL_PB   = struktur === 'alt'  ? 6  : 7;
  const COL_S56  = struktur === 'alt'  ? 7  : 8;
  const COL_Z19  = struktur === 'alt'  ? 8  : 9;
  const COL_S20  = struktur === 'alt'  ? 9  : 11;
  const COL_VERL = struktur === 'alt'  ? 10 : 10;

  // Neue Spalten §23 und §22: nur in neuer Struktur vorhanden (Indizes 12 und 13).
  // In alter Struktur nicht vorhanden → -1 als Sentinel für "nicht verfügbar".

  const COL_S23  = (struktur !== 'alt') ? 12 : -1;
  const COL_S22  = (struktur !== 'alt') ? 13 : -1;
  const hatNeuStruktur = struktur !== 'alt';

  const bankenJahr = bankenDaten.filter(r => parseInt(r[COL_JAHR]) === jahr);

  // Hilfsfunktion: Anteilsfaktor aus Typ-Spalte (nur neue Struktur)

  function getAnteil(r) {
    if (!hatNeuStruktur) {
      return 1.0;
    } // alte Struktur: immer voller Anteil
    const t = (r[COL_TYP] || '').toString().trim().toLowerCase();

    if (t === 'gemeinschaft 50%' || t === 'gemeinschaft 50% (kapest voll)') {
      return 0.5; // Kapital immer halbiert, unabhängig von KapESt-Behandlung
    }

    if (t === 'gemeinschaft 33%') {
      return 1 / 3;
    }
    
    return 1.0;
  }

  // Hilfsfunktion: Anteilsfaktor für KapESt/Soli aus Typ-Spalte.
  // Unterscheidet sich von getAnteil() nur beim Typ 'Gemeinschaft 50% (KapESt voll)':
  // dort ist der KapESt-Anteil 1.0 (voll), nicht 0.5.

  function getAnteilKapESt(r) {
    if (!hatNeuStruktur) {
      return 1.0;
    }
    const t = (r[COL_TYP] || '').toString().trim().toLowerCase();

    if (t === 'gemeinschaft 50% (kapest voll)') {
      return 1.0; // KapESt voll anrechnen, auch wenn Kapital nur 50%
    }

    if (t === 'gemeinschaft 50%') {
      return 0.5;
    }

    if (t === 'gemeinschaft 33%') {
      return 1 / 3;
    }

    return 1.0;
  }

  // Hilfsfunktion: Typ-String aus Zeile

  function getTyp(r) {
    if (!hatNeuStruktur || COL_TYP === -1) {
      return 'einzel';
    }
    
    return (r[COL_TYP] || '').toString().trim().toLowerCase();
  }

  // Hilfsfunktion: Ist diese Zeile eine Krypto-Zeile?

  function istKrypto(r) {
    return getTyp(r) === 'krypto';
  }

  // Hilfsfunktion: Soll diese Zeile ignoriert werden?
  // Ignoriert: Typ = 'ignorieren', 'ignore', 'nein', 'no', '-'

  function istIgnoriert(r) {
    const t = getTyp(r);
    
    return t === 'ignorieren' || t === 'ignore' || t === 'nein' || t === 'no' || t === '-';
  }

  const bankenAktiv  = bankenJahr.filter(r => !istIgnoriert(r)); // alle nicht-ignorierten
  const bankenNormal = bankenAktiv.filter(r => !istKrypto(r));   // Einzel + Gemeinschaft
  const bankenKrypto = bankenAktiv.filter(r => istKrypto(r));    // nur Krypto

  // Summen aus Banken-Tab für dieses Jahr

  const kapitalBanken     = bankenNormal.reduce((s, r) => s + parseFloat(r[COL_KAP]  || 0) * getAnteil(r), 0);
  const abgeltBanken      = bankenNormal.reduce((s, r) => s + parseFloat(r[COL_ABG]  || 0) * getAnteilKapESt(r), 0);
  const soliBanken        = bankenNormal.reduce((s, r) => s + parseFloat(r[COL_SOLI] || 0) * getAnteilKapESt(r), 0);
  const pauschBanken      = bankenNormal.reduce((s, r) => s + parseFloat(r[COL_PB]   || 0) * getAnteil(r), 0);
  const invStgBanken      = bankenNormal.reduce((s, r) => s + parseFloat(r[COL_S56]  || 0) * getAnteil(r), 0);
  const zugeflossenBanken = bankenNormal.reduce((s, r) => s + parseFloat(r[COL_Z19]  || 0) * getAnteil(r), 0);
  const verlusteBanken    = bankenNormal.reduce((s, r) => s + parseFloat(r[COL_VERL] || 0) * getAnteil(r), 0);

  // §20 Krypto: in alter Struktur aus allen aktiven Zeilen, in neuer Struktur nur Krypto-Zeilen

  const kryptoKapBanken   = hatNeuStruktur
    ? bankenKrypto.reduce((s, r) => s + parseFloat(r[COL_S20] || 0), 0)
    : bankenAktiv.reduce((s, r) => s + parseFloat(r[COL_S20] || 0), 0);

  // §23 Veräußerungsgewinne aus Banken-Tab (neue Spalte, Index 12).
  // Wird aus allen aktiven Zeilen summiert (sinnvollerweise nur in Krypto-Zeilen befüllt).
  // In alter Struktur (COL_S23 = -1): 0.

  const kryptoSO_banken = (COL_S23 >= 0)
    ? bankenAktiv.reduce((s, r) => s + parseFloat(r[COL_S23] || 0), 0)
    : 0;

  // §22 Sonstige Einkünfte aus Banken-Tab (neue Spalte, Index 13).
  // Analog zu §23. In alter Struktur (COL_S22 = -1): 0.

  const sonstigeSO_banken = (COL_S22 >= 0)
    ? bankenAktiv.reduce((s, r) => s + parseFloat(r[COL_S22] || 0), 0)
    : 0;

  // Override-Logik für §23 und §22:
  // Steuerdaten-Tab hat VORRANG. Wenn dort ≠ 0 (manuell eingetragen / grün): nehme diesen Wert.
  // Wenn dort 0 (leer / gelb nach Auto-Fill): nehme Banken-Tab-Summe.
  // So können jahresspezifische Overrides gesetzt werden (z. B. wenn StB anderen Wert nimmt).
  //
  // ACHTUNG Doppelzählungs-Schutz: das Auto-Fill schreibt kryptoSO_banken und sonstigeSO_banken
  // zurück ins Steuerdaten-Tab (gelb). Ohne diese Override-Logik würden beide Pfade addiert.
  // Analog zur bestehenden sonstigeKap-Logik (§20).

  const kryptoSO   = kryptoSO_manual   !== 0 ? kryptoSO_manual   : kryptoSO_banken;
  const sonstigeSO = sonstigeSO_manual !== 0 ? sonstigeSO_manual : sonstigeSO_banken;

  // Netto §23: Gewinn minus Verlustvortrag (min. 0 – Verluste können zvE nicht senken)

  const kryptoSO_netto = kryptoSO - vortrag23;
  const kryptoSO_stpfl = Math.max(kryptoSO_netto, 0);

  // §23 Verlustvortrag-Fortschreibung:
  // Wie viel vom Vortrag wurde tatsächlich verrechnet (nur gegen Gewinne möglich)?
  // Wie viel Vortrag verbleibt am Ende des Jahres (inkl. neu entstandener Verluste)?
  //   neuer_vortrag = alter_vortrag + neu entstandener Verlust - verrecheneter Gewinn
  //   = vortrag23 + max(-kryptoSO, 0) - min(vortrag23, max(kryptoSO, 0))

  const vortrag23_verrechnet  = Math.min(vortrag23, Math.max(kryptoSO, 0));
  const vortrag23_verbleibend = vortrag23 + Math.max(-kryptoSO, 0) - vortrag23_verrechnet;

  // FA rundet §23 und §22 Einkünfte kaufmännisch (round), nicht floor.
  // Beispiel 2023: §23 = 1707,76 → round = 1708 ✓ (floor würde 1707 geben)

  const summe_einkuenfte_inland
    = Math.floor(brutto - werbungskosten)
    + Math.round(kryptoSO_stpfl)
    + Math.round(sonstigeSO);

  // === Block 6: Zu versteuerndes Einkommen (Inland) ===

  const zvE_inland = Math.max(summe_einkuenfte_inland - sonderausgaben, 0);

  // === Block 7: Kapitalerträge & Günstigerprüfung ===

  // Manuelle Overrides aus Steuerdaten-Tab (überschreiben Banken-Tab wenn befüllt)

  const kapitalOverride   = parseZahl(daten['Kapitalerträge gesamt (lt. Broker)']);
  const sonstigeKapManual = parseZahl(daten['Krypto Termingeschäfte (§ 20 EStG)']);
  const pauschManual      = parseZahl(daten['Sparer-Pauschbetrag (lt. Broker)']);

  // Kapitalerträge: Banken-Tab hat Vorrang, manueller Wert als Fallback
  // FA-Basis = Brutto - §56 InvStG (steuerfrei) + zugeflossen (Z.19)

  const kapitalBruttoFuerBerechnung = kapitalBanken > 0
    ? (kapitalBanken - invStgBanken + zugeflossenBanken)
    : kapitalOverride;

  // §20 KAP (Termingeschäfte/Krypto): Banken-Tab ODER Steuerdaten-Tab, nicht addiert.
  // Analog zu kapitalOverride: Wenn der Steuerdaten-Tab-Wert befüllt ist (≠ 0),
  // hat er Vorrang. Sonst wird der Wert aus dem Banken-Tab (Krypto-Zeilen) verwendet.
  //
  // Hintergrund: Das Auto-Fill schreibt kryptoKapBanken zurück ins Steuerdaten-Tab.
  // Ohne Override-Logik würden beide Werte addiert → Doppelzählung.
  // Beispiel 2022: CoinTracking §20 = -102,75 im Banken-Tab UND -102,75 im Steuerdaten-Tab
  // → sonstigeKap würde -205,50 ergeben statt -102,75.

  const sonstigeKap = sonstigeKapManual !== 0 ? sonstigeKapManual : kryptoKapBanken;

  // §20 Termingeschäfte Verlustvortrag aus Vorjahren (positiv eintragen).
  // Verrechnet laufende §20-Gewinne, bevor sie die Kapitalertragsbasis erhöhen.
  // Verluste können die Basis maximal auf 0 senken (keine negativen Kapitalerträge).
  // Nur aktiv wenn vortragAktiv = true.

  const vortrag20 = vortragAktiv
    ? parseZahl(daten['Verlustvortrag § 20 Termingeschäfte (Vorjahre)'])
    : 0;

  // JStG 2024 (§ 20 Abs. 6 EStG n.F., rückwirkend ab 2021):
  // Verlustverrechnungsbeschränkung für Termingeschäfte entfällt.
  // §20-Vortrag darf mit ALLEN Kapitalerträgen verrechnet werden.
  // Schalter im Steuerdaten-Tab: 'JStG 2024 §20 anwenden (ja/nein)'

  const jstg2024Aktiv = parseJaNeinFeld(daten['JStG 2024 §20 anwenden (ja/nein)']);

  // Schritt 1: Termingewinne ggf. gegen Vortrag verrechnen (alte Logik, nur wenn JStG NICHT aktiv)
  //   Bei JStG aktiv läuft sonstigeKap unverändert durch – die Verrechnung erfolgt global
  //   gegen die Gesamtkapitalbasis in Schritt 3.

  const sonstigeKap_nachVortrag = (!jstg2024Aktiv && sonstigeKap > 0)
    ? Math.max(sonstigeKap - vortrag20, 0)
    : sonstigeKap;

  // Schritt 2: Rohe Kapitalbasis (vor JStG-2024-Abzug)

  const kapitalVorAbzug = kapitalBruttoFuerBerechnung + sonstigeKap_nachVortrag + verlusteBanken;

  // Schritt 3: JStG 2024 – restlicher Vortrag gegen allgemeine Kapitalerträge

  // restVortrag = Teil des Vortrags, der NICHT schon gegen Termingewinne verrechnet wurde

  const vortrag20_verrechnet_termin = !jstg2024Aktiv
    ? Math.min(vortrag20, Math.max(sonstigeKap, 0))   // alt: gegen Termingewinne
    : 0;                                               // JStG: alle Verrechnung in Schritt 3

  const vortrag20_restNachTermin = vortrag20 - vortrag20_verrechnet_termin;

  // Gegen Kapital verrechenbarer Teil: nur bis zur positiven Kapitalbasis

  const vortrag20_gegenKapital = jstg2024Aktiv
    ? Math.min(vortrag20_restNachTermin, Math.max(0, kapitalVorAbzug))
    : 0;

  // Schritt 4: Finale Kapital-Basis und Vortrag-Fortschreibung

  const kapital = kapitalVorAbzug - vortrag20_gegenKapital;

  const vortrag20_verrechnet  = vortrag20_verrechnet_termin + vortrag20_gegenKapital;
  const vortrag20_verbleibend = vortrag20 + Math.max(-sonstigeKap, 0) - vortrag20_verrechnet;

  // Sparer-Pauschbetrag: immer den gesetzlichen Maximalbetrag verwenden.
  // – bis 2022: 801 € (Einzel) / 1.602 € (zusammenveranlagt)
  // – ab 2023:  1.000 € (Einzel) / 2.000 € (zusammenveranlagt)
  // pauschBanken (aus Banken-Tab) zeigt nur was die Broker intern angerechnet haben –
  // das FA wendet immer den vollen gesetzlichen Betrag an.

  const sparerPauschbetragBasis = jahr >= 2023 ? 1000 : 801;
  const pauschbetrag = verheiratet ? sparerPauschbetragBasis * 2 : sparerPauschbetragBasis;

  // Steuerpflichtige Kapitalerträge nach Abzug des Sparer-Pauschbetrags.
  // ACHTUNG: Der Broker verrechnet intern Verluste (z. B. aus Termingeschäften) und
  // Freibeträge (z. B. § 56 InvStG) bevor er den steuerpflichtigen Betrag ans FA meldet.
  // Das Script kann diese Verrechnung nicht nachvollziehen.
  // → Wenn das Feld "Steuerpflichtige Kapitalerträge (lt. Bescheid)" befüllt ist,
  //   wird dieser Wert direkt verwendet. Sonst: eigene Berechnung (brutto – Pauschbetrag).

  const steuerpflichtigeKapErtr_berechnet = Math.max(kapital - pauschbetrag, 0);
  const steuerpflichtigeKapErtr_override  = parseZahl(daten['Steuerpflichtige Kapitalerträge (lt. Bescheid)']);
  const steuerpflichtigeKapErtr = steuerpflichtigeKapErtr_override > 0
    ? steuerpflichtigeKapErtr_override
    : steuerpflichtigeKapErtr_berechnet;

  // Günstigerprüfung (§ 32d Abs. 6 EStG):
  // Wenn persönlicher Steuersatz < 25%, läuft Kapital durch den Tarif.
  // → zvE_inland erhöht sich um steuerpflichtige Kapitalerträge,
  //   dafür entfällt die separate KapESt auf diesen Betrag.
  // Abgeltungsteuer (§ 32d Abs. 1 EStG) vs. Günstigerprüfung (§ 32d Abs. 6 EStG):
  // Das FA führt den Vergleich automatisch durch:
  //   Option A (Abgeltungsteuer): KapESt = 25% × steuerpflichtige Kapitalerträge
  //   Option B (Günstigerprüfung): Kapitalerträge laufen durch den Einkommensteuertarif,
  //                                 keine separate KapESt
  // Gewählt wird die Option mit der GERINGEREN Gesamtbelastung.
  // Wenn der Steuerpflichtige ja einträgt, wird der Vergleich gemacht – nicht blind Option B.

  // Option A: Abgeltungsteuer
  const kapESt_abgelt    = Math.round(steuerpflichtigeKapErtr * 0.25); // FA rundet kaufmännisch
  const soliAufKap_abgelt = Math.floor(kapESt_abgelt * 0.055 * 100) / 100;

  // Option B: Kapital durch Tarif (wird unten in zvE_fuerSatz eingerechnet)
  // Die ESt-Differenz durch den höheren Satz wird implizit berechnet.
  // Für den Vergleich: wie viel ESt zahlt man MEHR wenn Kapital durch den Tarif läuft?
  // Das berechnen wir nach der Satzermittlung (weiter unten in Block 8).
  // Vorläufig: merken ob Günstigerprüfung aktiviert ist

  const guenstigerGewuenscht = guenstiger;

  // Provisorisch KapESt = Abgeltungsteuer; wird nach Block 8 ggf. auf 0 gesetzt
  // wenn Günstigerprüfung wirklich günstiger ist. Variablen werden nach Block 8 finalisiert.

  let kapESt    = kapESt_abgelt;
  let soliAufKap = soliAufKap_abgelt;

  // zvE_fuerGuenstiger wird in Block 8 per guenstigerGreift bestimmt

  // === Block 8: Progressionsvorbehalt (z. B. Auslandseinkommen Frankreich) ===

  // DBA-Freistellung (z. B. Frankreich): Auslandseinkommen ist steuerfrei,
  // unterliegt aber dem Progressionsvorbehalt nach § 32b EStG.
  // Das FA setzt dabei den BRUTTO-Betrag an – NICHT den Nettobetrag nach SV-Abzug.
  // Belegt durch Bescheid-Erläuterung: "habe ich X € in die Berechnung des Steuersatzes einbezogen"

  const auslandBrutto    = parseZahl(daten['Auslandseinkünfte brutto (lt. Bescheid)']);
  const auslandSV        = parseZahl(daten['Auslands-SV-Beitrag AN (lt. Gehaltszettel)']); // im Sheet erfassen, aber nicht abziehen
  const zvE_ausland   = Math.floor(auslandBrutto); // Brutto für Progressionsvorbehalt

  // Gesamteinkommen für Steuersatzermittlung.
  // Bei Günstigerprüfung: wir berechnen den Satz EINMAL ohne Kapital (Normalfall)
  // und EINMAL mit Kapital, und vergleichen dann die Gesamtbelastung.

  const zvE_fuerSatz_ohneKap = zvE_inland + zvE_ausland;
  const zvE_fuerSatz_mitKap  = zvE_inland + Math.floor(steuerpflichtigeKapErtr) + zvE_ausland;

  // Satz und ESt ohne Kapital (= Abgeltungsteuer-Variante)

  const est_fiktiv_ohneKap = berechneEinkommensteuer(zvE_fuerSatz_ohneKap, verheiratet, jahr);
  const satz_ohneKap       = zvE_fuerSatz_ohneKap > 0 ? est_fiktiv_ohneKap / zvE_fuerSatz_ohneKap : 0;
  const estAufInland_ohneKap = Math.round(zvE_inland * satz_ohneKap); // FA rundet kaufmännisch

  // Satz und ESt mit Kapital (= Günstigerprüfungs-Variante)

  const est_fiktiv_mitKap  = berechneEinkommensteuer(zvE_fuerSatz_mitKap, verheiratet, jahr);
  const satz_mitKap        = zvE_fuerSatz_mitKap  > 0 ? est_fiktiv_mitKap  / zvE_fuerSatz_mitKap  : 0;
  const estAufInland_mitKap  = Math.round((zvE_inland + Math.floor(steuerpflichtigeKapErtr)) * satz_mitKap); // FA rundet kaufmännisch

  // Günstigerprüfung: vergleiche Gesamtbelastung
  //   Option A: estAufInland_ohneKap + kapESt_abgelt + soliAufKap_abgelt
  //   Option B: estAufInland_mitKap  (kein KapESt, kein SoliAufKap)

  const belastungA = estAufInland_ohneKap + kapESt_abgelt + soliAufKap_abgelt;
  const belastungB = estAufInland_mitKap;
  const guenstigerGreift = guenstigerGewuenscht && (belastungB < belastungA);

  // Finale Werte je nach Ergebnis der Günstigerprüfung

  const estAufInland   = guenstigerGreift ? estAufInland_mitKap  : estAufInland_ohneKap;
  const zvE_fuerSatz   = guenstigerGreift ? zvE_fuerSatz_mitKap  : zvE_fuerSatz_ohneKap;

  if (jahr === 2024) {
    Logger.log('--- DIAGNOSE 2024 ---');
    Logger.log('brutto              = ' + brutto);
    Logger.log('werbungskosten      = ' + werbungskosten);
    Logger.log('kryptoSO_manual     = ' + kryptoSO_manual);
    Logger.log('kryptoSO_banken     = ' + kryptoSO_banken);
    Logger.log('kryptoSO            = ' + kryptoSO);
    Logger.log('kryptoSO_stpfl      = ' + kryptoSO_stpfl);
    Logger.log('sonstigeSO_manual   = ' + sonstigeSO_manual);
    Logger.log('sonstigeSO_banken   = ' + sonstigeSO_banken);
    Logger.log('sonstigeSO          = ' + sonstigeSO);
    Logger.log('summe_einkuenfte    = ' + summe_einkuenfte_inland);
    Logger.log('sonderausgaben      = ' + sonderausgaben);
    Logger.log('zvE_inland          = ' + zvE_inland);
    Logger.log('kapitalVorAbzug     = ' + kapitalVorAbzug);
    Logger.log('vortrag20_gegenKap  = ' + vortrag20_gegenKapital);
    Logger.log('kapital (nach JStG) = ' + kapital);
    Logger.log('pauschbetrag        = ' + pauschbetrag);
    Logger.log('stpfl_kap_berech    = ' + steuerpflichtigeKapErtr_berechnet);
    Logger.log('stpfl_kap_override  = ' + steuerpflichtigeKapErtr_override);
    Logger.log('stpfl_kap_final     = ' + steuerpflichtigeKapErtr);
    Logger.log('zvE_fuerSatz_ohneK  = ' + zvE_fuerSatz_ohneKap);
    Logger.log('zvE_fuerSatz_mitK   = ' + zvE_fuerSatz_mitKap);
    Logger.log('est_fiktiv_ohneKap  = ' + est_fiktiv_ohneKap);
    Logger.log('satz_ohneKap        = ' + satz_ohneKap);
    Logger.log('estAufInland_ohneK  = ' + estAufInland_ohneKap);
    Logger.log('est_fiktiv_mitKap   = ' + est_fiktiv_mitKap);
    Logger.log('estAufInland_mitK   = ' + estAufInland_mitKap);
    Logger.log('belastungA          = ' + belastungA);
    Logger.log('belastungB          = ' + belastungB);
    Logger.log('guenstigerGreift    = ' + guenstigerGreift);
    Logger.log('estAufInland FINAL  = ' + estAufInland);
  }
  const effektiverSatz = guenstigerGreift ? satz_mitKap          : satz_ohneKap;

  if (guenstigerGreift) {
    kapESt     = 0;
    soliAufKap = 0;
  }

  // (wenn nicht günstiger: kapESt/soliAufKap bleiben bei Abgeltungsteuer-Werten)

  // === Block 9: Steuerermäßigungen ===

  const haushaltsnahe     = parseZahl(daten['Haushaltsnahe Dienstleistungen (lt. Belege)']);
  const handwerker        = parseZahl(daten['Handwerkerleistungen (lt. Belege)']);

  // 20 % der Kosten, aber gedeckelt (§ 35a EStG)
  // FA rundet kaufmännisch (20% von 78€ = 15,60 → 16€), daher Math.round

  const haushaltsnachlass  = Math.round(Math.min(haushaltsnahe * 0.20, 4000));
  const handwerkerNachlass = Math.round(Math.min(handwerker * 0.20, 1200));

  // Anrechenbare ausländische Steuer (§ 34c EStG / DBA Anrechnungsmethode).
  // Gilt für Länder mit Anrechnungsmethode (z.B. Frankreich).
  // Bei Freistellungsmethode (z.B. Österreich): 0 eintragen – die AT-Steuer
  // wurde bereits über den Lohnschein direkt verrechnet.
  // Der Betrag wird direkt von der deutschen ESt abgezogen.

  const auslandssteuer = parseZahl(daten['Anrechenbare Auslandssteuer (lt. Bescheid)']);

  // === Block 9a: Plausibilitätswarnungen ===
  // Werden in das Logger-Protokoll geschrieben und als res[20] zurückgegeben.
  // Nicht fatal – die Berechnung läuft trotzdem vollständig durch.

  const warnungen = [];

  // Fahrtage + Homeoffice-Tage sollten ≤ 230 Jahresarbeitstage sein

  if (fahrtTage + homeofficeTage > 230) {
    warnungen.push('Jahr ' + jahr + ': Fahrtage (' + fahrtTage + ') + Homeoffice-Tage (' + homeofficeTage
      + ') = ' + (fahrtTage + homeofficeTage) + ' – übersteigt ca. 230 Jahresarbeitstage.');
  }

  // KV-Beitrag regulär darf KV-Beitrag gesamt logisch nicht überschreiten

  if (an_kv_regulaer > 0 && an_kv_gesamt > 0 && an_kv_regulaer > an_kv_gesamt) {
    warnungen.push('Jahr ' + jahr + ': KV regulär (' + an_kv_regulaer.toFixed(2)
      + ' €) > KV gesamt (' + an_kv_gesamt.toFixed(2) + ' €) – bitte prüfen.');
  }

  // §23-Vortrag sehr groß im Verhältnis zum laufenden Gewinn

  if (vortrag23 > 0 && kryptoSO > 0 && vortrag23 > kryptoSO * 10) {
    warnungen.push('Jahr ' + jahr + ': §23-Verlustvortrag (' + vortrag23.toFixed(2)
      + ' €) ist sehr groß im Verhältnis zum §23-Gewinn (' + kryptoSO.toFixed(2)
      + ' €) – Eingabefehler?');
  }

  // §20-Vortrag sehr groß im Verhältnis zu laufenden §20-Einnahmen

  if (vortrag20 > 0 && sonstigeKap > 0 && vortrag20 > sonstigeKap * 10) {
    warnungen.push('Jahr ' + jahr + ': §20-Verlustvortrag (' + vortrag20.toFixed(2)
      + ' €) ist sehr groß im Verhältnis zu §20-Einnahmen (' + sonstigeKap.toFixed(2)
      + ' €) – Eingabefehler?');
  }

  if (warnungen.length > 0) {
    warnungen.forEach(w => Logger.log('⚠️ PLAUSIBILITÄT: ' + w));
  }

  // === Block 10: Solidaritätszuschlag ===

  // Freigrenze aus Config ist ein ESt-BETRAG (nicht Einkommensbetrag!)
  // Für Zusammenveranlagte gilt die doppelte Freigrenze.

  const soli_freigrenze = verheiratet
    ? config.soli_freigrenze * 2
    : config.soli_freigrenze;

  // Soli auf ESt: Bemessungsgrundlage ist immer die ESt OHNE Kapitalertragsanteil.
  // Wenn Günstigerprüfung greift, enthält estAufInland bereits das Kapital – dann trotzdem
  // kein separater Soli auf Kap (soliAufKap = 0), und der Soli läuft über estAufInland.
  // Wenn Günstigerprüfung NICHT greift, ist estAufInland nur das Tarifeinkommen ohne Kapital.

  const soliAufEst = berechneSoli(estAufInland, soli_freigrenze);

  // === Block 10a: Kirchensteuer ===
  // Kirchensteuer auf die Einkommensteuer (§ 51a EStG).
  // Bemessungsgrundlage: estAufInland (nach Progressionsvorbehalt, vor §35a-Abzügen).
  // Satz: 8 % (Bayern/BW) oder 9 % (alle anderen BL) – in config.kirchensteuerSatz hinterlegt.
  // Bei kirchensteuerSatz = 0: Kirchensteuer deaktiviert.
  // Das FA rundet auf volle Euro (Math.round).

  const kirchensteuer = (config.kirchensteuerSatz > 0)
    ? Math.round(estAufInland * config.kirchensteuerSatz)
    : 0;

  // === Block 11: Nebenforderungen ===

  const zinsen     = parseZahl(daten['Nachzahlungszinsen § 233a AO (lt. Bescheid)']);
  const verspaetung = parseZahl(daten['Verspätungszuschlag (lt. Bescheid)']);
  const summeNebenkosten = zinsen + verspaetung;

  // === Block 12: Gesamtsteuerlast (Soll) ===

  // Gesamtsteuerlast = ESt auf Inland (nach Nachlässen) + KapESt + alle Soli + Nebenkosten

  const steuerGesamt
    = estAufInland
    - haushaltsnachlass
    - handwerkerNachlass
    - auslandssteuer        // anrechenbare ausländische Steuer (§ 34c / DBA)
    + kapESt
    + soliAufEst
    + soliAufKap
    + kirchensteuer           // 0 wenn kirchensteuerSatz = 0 in config.gs
    + summeNebenkosten;

  // === Block 13: Ist-Zahlung & Erstattung / Nachzahlung ===

  // Ist-Zahlung: alle bereits abgeführten Steuerbeträge.
  //
  // Lohnsteuer (§ 36 Abs. 2 Nr. 2 EStG): Das FA rundet auf volle Euro.
  // Bsp: 5.762,82 → Math.round = 5.763 €
  //
  // Abgeltungsteuer: Das FA rundet auf volle Euro (§ 36 Abs. 2 EStG).
  // WICHTIG: Immer den BESCHEID-Wert eintragen, nicht den Broker-Wert!
  // Broker-Wert kann abweichen, weil der Broker keine Kenntnis von
  // Verlusten bei anderen Banken hat und deshalb zu viel einbehält.
  // Das Finanzamt verrechnet alles zentral und erstattet die Differenz.
  //
  // Solidaritätszuschlag Lohn + Soli Kapital: Das FA verrechnet den
  // exakten Cent-Betrag OHNE weitere Rundung.
  // Beispiel 2019 Soli Lohn: 45,92 € → 45,92 € (nicht 46 €)
  // Beispiel 2022 Soli Kap:   4,03 € →  4,03 € (nicht 4 €)
  // (FIX: vorher Math.round auf beide → Abweichungen zum Bescheid)

  const gezahlt
    = Math.round(parseZahl(daten['Lohnsteuer (lt. LStB)']))
    + parseZahl(daten['Solidaritätszuschlag Lohn (lt. LStB)'])
    + parseZahl(daten['Kirchensteuer Lohn (lt. LStB)'])         // NEU: war bisher nicht addiert
    + parseZahl(daten['Kirchensteuer Kapital (lt. Bescheid)'])  // NEU: war bisher nicht addiert
    + Math.round(parseZahl(daten['Abgeltungsteuer gezahlt (lt. Bescheid)']))
    + parseZahl(daten['Solidaritätszuschlag Kapital (lt. Bescheid)']);

  const differenz = gezahlt - steuerGesamt;

  // Abweichungsvergleich mit echtem Bescheid (sofern eingetragen)

  const bekannteErstattung = parseZahl(daten['Erstattung / Nachzahlung (lt. Bescheid)']);

  let abweichung = '';

  if (bekannteErstattung !== 0) {
    const delta = Math.abs(differenz - bekannteErstattung);
    abweichung = delta.toFixed(2) + ' €';
  }

  // === Rückgabe ===
  // ACHTUNG: Reihenfolge ist fest mit dem Mapping in main.gs verknüpft!
  //
  // --- Kernergebnisse (Index 0–13) ---
  // Index  0: zvE_inland
  // Index  1: estAufInland
  // Index  2: kapESt
  // Index  3: soliAufKap
  // Index  4: steuerGesamt
  // Index  5: gezahlt
  // Index  6: differenz (Erstattung / Nachzahlung)
  // Index  7: werbungskosten
  // Index  8: sonderausgaben
  // Index  9: summeNebenkosten
  // Index 10: zvE_ausland
  // Index 11: zvE_fuerSatz
  // Index 12: effektiverSatz
  // Index 13: abweichung (String)
  //
  // --- Transparenz §23 / §22 / §20 / Kapital (Index 14–24) ---
  // Index 14: kryptoSO               → §23 brutto (vor Vortrag)
  // Index 15: vortrag23_verrechnet   → §23 Verlustvortrag verrechnet
  // Index 16: kryptoSO_stpfl         → §23 steuerpflichtig (nach Vortrag)
  // Index 17: vortrag23_verbleibend  → §23 Verlustvortrag verbleibend (Ende Jahr)
  // Index 18: sonstigeSO             → §22 Einkünfte
  // Index 19: sonstigeKap            → §20 brutto (vor Vortrag)
  // Index 20: vortrag20_verrechnet   → §20 Verlustvortrag verrechnet
  // Index 21: sonstigeKap_nachVortrag→ §20 steuerpflichtig (nach Vortrag)
  // Index 22: vortrag20_verbleibend  → §20 Verlustvortrag verbleibend (Ende Jahr)
  // Index 23: kapitalBruttoFuerBerechnung → Kapitalerträge (Basis vor Pauschbetrag)
  // Index 24: steuerpflichtigeKapErtr     → Steuerpflichtige Kapitalerträge (§ 32d)
  //
  // --- Auto-Fill Werte für Steuerdaten-Tab (Index 25–31) ---
  // Index 25: kapitalBanken      → 'Kapitalerträge gesamt (lt. Broker)'
  // Index 26: abgeltBanken       → 'Abgeltungsteuer gezahlt (lt. Bescheid)'
  // Index 27: soliBanken         → 'Solidaritätszuschlag Kapital (lt. Bescheid)'
  // Index 28: kryptoKapBanken    → 'Krypto Termingeschäfte (§ 20 EStG)'
  // Index 29: kryptoSO_banken    → 'Einkünfte aus privaten Veräußerungsgeschäften (§ 23 EStG)'
  // Index 30: sonstigeSO_banken  → 'Einkünfte aus sonstigen Leistungen (§ 22 Nr. 3 EStG)'
  // Index 31: brutto             → Bruttoarbeitslohn
  // --- Plausibilitätswarnungen ---
  // Index 32: warnungen          → Array von Strings (leer wenn keine Warnungen)

  return [
    // Index 0–13: Kernergebnisse

    zvE_inland,
    Math.round(estAufInland),
    kapESt,
    soliAufKap,
    steuerGesamt,
    gezahlt,
    differenz,
    werbungskosten,
    sonderausgaben,
    summeNebenkosten,
    zvE_ausland,
    zvE_fuerSatz,
    effektiverSatz,
    abweichung,

    // Index 14–22: §23 / §22 / §20 Transparenz
    kryptoSO,                     // §23 brutto
    vortrag23_verrechnet,         // §23 Vortrag verrechnet
    kryptoSO_stpfl,               // §23 stpfl
    vortrag23_verbleibend,        // §23 Vortrag Ende Jahr
    sonstigeSO,                   // §22
    sonstigeKap,                  // §20 brutto
    vortrag20_verrechnet,         // §20 Vortrag verrechnet
    sonstigeKap_nachVortrag,      // §20 stpfl
    vortrag20_verbleibend,        // §20 Vortrag Ende Jahr

    // Index 23–24: Kapital Transparenz

    kapitalBruttoFuerBerechnung,
    steuerpflichtigeKapErtr,

    // Index 25–30: Auto-Fill Rückschreibung
    // abgeltBanken_autofill: §56-bereinigt (ceil), soliBanken: floor
    // WICHTIG: Nach Bescheid-Erhalt immer gegen tatsächlichen Bescheid-Wert prüfen.

    kapitalBanken,
    Math.ceil(abgeltBanken - Math.floor(invStgBanken) * 0.25),
    Math.floor((abgeltBanken - Math.floor(invStgBanken) * 0.25) * 0.055 * 100) / 100,
    kryptoKapBanken,
    kryptoSO_banken,
    sonstigeSO_banken,

    // Index 31

    brutto,

    // Index 32: Plausibilitätswarnungen

    warnungen
  ];
}