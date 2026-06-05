/**
 * Steuerkonfiguration je Veranlagungsjahr.
 *
 * HINWEISE FÜR ZUKÜNFTIGE UPDATES:
 * - Neues Jahr = neuen Block nach dem Schema der bestehenden Jahre ergänzen
 * - Tarifwerte aus dem offiziellen BMF-Programmablaufplan oder EStG entnehmen
 * - soli_freigrenze = Betrag der EINKOMMENSTEUER (nicht des Einkommens!),
 *   unterhalb dessen kein Soli anfällt
 * - entfernungspauschale_erhoeht_ab_km: Vor 2021 gab es keine erhöhte Pauschale
 *   → Wert auf 9999 setzen, damit die erhöhte Rate nie greift
 * - vorsorgeAbzug: Anteil der RV-Beiträge, der absetzbar ist (stieg bis 2023 auf 100%)
 * - kirchensteuerSatz: Satz der Kirchensteuer auf die Einkommensteuer (§ 51a EStG)
 *     0.08  = Bayern / Baden-Württemberg
 *     0.09  = alle anderen Bundesländer
 *     0     = nicht kirchensteuerpflichtig (Kirchensteuer-Berechnung deaktiviert)
 *
 * TARIFDATEN-STRUKTUR:
 *   Zone 1: x <= gfb                      → 0 € (Grundfreibetrag)
 *   Zone 2: gfb < x <= z3_start           → Progressionsformel 1
 *   Zone 3: z3_start < x <= z4_start      → Progressionsformel 2
 *   Zone 4: z4_start < x <= z5_start      → Proportionalzone 1 (42%)
 *   Zone 5: x > z5_start                  → Proportionalzone 2 (45%, Reichensteuer)
 */

function getConfig(jahr) {
  const configs = {

    // -------------------------------------------------------------------------
    // 2019
    // Quellen: § 32a EStG i.d.F. 2019, BMF-Programmablaufplan 2019
    // Besonderheiten:
    //   - vorsorgeAbzug 88%
    //   - Homeoffice-Pauschale existiert noch nicht
    //   - Keine erhöhte Entfernungspauschale
    //   - Soli-Freigrenze: 972 € ESt (Einzelperson)
    // -------------------------------------------------------------------------

    '2019': {
      gfb: 9168,
      werbungskostenpauschale: 1000,
      vorsorgeAbzug: 0.88,
      max_vorsorge_rv: 24305,
      homeofficePauschaleProTag: 0,
      homeofficePauschaleMaxTage: 0,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.30,       // keine erhöhte Pauschale 2019
      entfernungspauschale_erhoeht_ab_km: 9999, // deaktiviert
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 972,                     // ESt-Betrag, nicht Einkommensbetrag!
      kirchensteuerSatz: 0,                     // 0 = nicht kirchensteuerpflichtig
      tarif: {
        z3_start: 14255,
        z3_faktor1: 228.74, z3_faktor2: 2397, z3_add: 965.58,
        z2_faktor1: 997.80, z2_faktor2: 1400,
        z4_start: 55961,  z4_faktor: 0.42, z4_sub: 8621.75,
        z5_start: 265327, z5_faktor: 0.45, z5_sub: 16572.50
      }
    },

    // -------------------------------------------------------------------------
    // 2020
    // Quellen: § 32a EStG i.d.F. 2020, BMF-Programmablaufplan 2020
    // Besonderheiten:
    //   - vorsorgeAbzug 90%
    //   - Homeoffice-Pauschale: 5 €/Tag, max. 120 Tage (600 € p.a.)
    //     (technisch erst ab 2020 möglich, aber für 2020 rückwirkend eingeführt)
    //   - Keine erhöhte Entfernungspauschale (erst ab 2021)
    //   - Soli-Freigrenze: 972 € ESt
    // -------------------------------------------------------------------------

    '2020': {
      gfb: 9408,
      werbungskostenpauschale: 1000,
      vorsorgeAbzug: 0.90,
      max_vorsorge_rv: 25046,
      homeofficePauschaleProTag: 5,
      homeofficePauschaleMaxTage: 120,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.30,       // keine erhöhte Pauschale 2020
      entfernungspauschale_erhoeht_ab_km: 9999, // deaktiviert
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 972,                     // ESt-Betrag
      kirchensteuerSatz: 0,
      tarif: {
        // Offizielle Koeffizienten § 32a EStG 2020 (FamEntlastG)

        z3_start: 14532,
        z2_faktor1: 972.87,  z2_faktor2: 1400,
        z3_faktor1: 212.02,  z3_faktor2: 2397,  z3_add: 972.79,
        z4_start: 57051,     z4_faktor: 0.42,   z4_sub: 8963.74,
        z5_start: 270500,    z5_faktor: 0.45,   z5_sub: 17078.74
      }
    },

    // -------------------------------------------------------------------------
    // 2021
    // Quellen: § 32a EStG i.d.F. 2021, BMF-Programmablaufplan 2021
    // Besonderheiten:
    //   - vorsorgeAbzug 92%
    //   - Homeoffice-Pauschale: 5 €/Tag, max. 120 Tage
    //   - Erhöhte Entfernungspauschale ab km 21: 0,35 € (neu ab 2021!)
    //   - Soli-Reform: neue Freigrenze 16.956 € ESt (Einzelperson)
    //     → Drastische Anhebung, ~90% der Zahler zahlen keinen Soli mehr
    // -------------------------------------------------------------------------

    '2021': {
      gfb: 9744,
      werbungskostenpauschale: 1000,
      vorsorgeAbzug: 0.92,
      max_vorsorge_rv: 25787,
      homeofficePauschaleProTag: 5,
      homeofficePauschaleMaxTage: 120,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.35,
      entfernungspauschale_erhoeht_ab_km: 21,
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 16956,                   // ESt-Betrag (neue Regelung ab 2021)
      kirchensteuerSatz: 0,
      tarif: {
        // Offizielle Koeffizienten § 32a EStG 2021 (2. FamEntlastG)

        z3_start: 14753,
        z2_faktor1: 995.21,  z2_faktor2: 1400,
        z3_faktor1: 208.85,  z3_faktor2: 2397,  z3_add: 950.96,
        z4_start: 57918,     z4_faktor: 0.42,   z4_sub: 9136.63,
        z5_start: 274612,    z5_faktor: 0.45,   z5_sub: 17374.99
      }
    },

    // -------------------------------------------------------------------------
    // 2022
    // Quellen: § 32a EStG i.d.F. 2022, BMF-Programmablaufplan 2022
    // Besonderheiten:
    //   - vorsorgeAbzug 94%
    //   - Homeoffice-Pauschale: 5 €/Tag, max. 120 Tage
    //   - Erhöhte Entfernungspauschale ab km 21: 0,38 € (Anhebung von 0,35 auf 0,38)
    //   - Werbungskostenpauschale auf 1.200 € angehoben
    // -------------------------------------------------------------------------

    '2022': {
      gfb: 10347,
      werbungskostenpauschale: 1200,
      vorsorgeAbzug: 0.94,
      max_vorsorge_rv: 25639,
      homeofficePauschaleProTag: 5,
      homeofficePauschaleMaxTage: 120,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.38,
      entfernungspauschale_erhoeht_ab_km: 21,
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 16956,
      kirchensteuerSatz: 0,
      tarif: {
        // Offizielle Koeffizienten § 32a EStG 2022

        z3_start: 14926,
        z2_faktor1: 1088.67, z2_faktor2: 1400,
        z3_faktor1: 206.43,  z3_faktor2: 2397,  z3_add: 869.32,
        z4_start: 58596,     z4_faktor: 0.42,   z4_sub: 9336.45,
        z5_start: 277825,    z5_faktor: 0.45,   z5_sub: 17671.20
      }
    },

    // -------------------------------------------------------------------------
    // 2023
    // Quellen: § 32a EStG i.d.F. 2023, BMF-Programmablaufplan 2023
    // Besonderheiten:
    //   - vorsorgeAbzug 100% (vollständiger Abzug erstmals möglich!)
    //   - Homeoffice-Pauschale: 6 €/Tag, max. 210 Tage (1.260 € p.a.) – Anhebung!
    //   - Werbungskostenpauschale auf 1.230 € angehoben
    // -------------------------------------------------------------------------

    '2023': {
      gfb: 10908,
      werbungskostenpauschale: 1230,
      vorsorgeAbzug: 1.0,
      max_vorsorge_rv: 26528,
      homeofficePauschaleProTag: 6,
      homeofficePauschaleMaxTage: 210,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.38,
      entfernungspauschale_erhoeht_ab_km: 21,
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 17543,
      kirchensteuerSatz: 0,
      tarif: {
        z3_start: 15999,
        z3_faktor1: 192.59, z3_faktor2: 2397, z3_add: 966.53,
        z2_faktor1: 979.18, z2_faktor2: 1400,
        z4_start: 62809,  z4_faktor: 0.42, z4_sub: 9972.98,
        z5_start: 277825, z5_faktor: 0.45, z5_sub: 18307.73
      }
    },

    // -------------------------------------------------------------------------
    // 2024
    // Quellen: § 32a EStG i.d.F. 2024, BMF-Programmablaufplan 2024
    // -------------------------------------------------------------------------

    '2024': {
      gfb: 11784,
      werbungskostenpauschale: 1230,
      vorsorgeAbzug: 1.0,
      max_vorsorge_rv: 27566,
      homeofficePauschaleProTag: 6,
      homeofficePauschaleMaxTage: 210,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.38,
      entfernungspauschale_erhoeht_ab_km: 21,
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 18130,
      kirchensteuerSatz: 0,
      tarif: {
        // Offizielle Koeffizienten § 32a EStG 2024

        z3_start: 17005,
        z2_faktor1: 954.80,  z2_faktor2: 1400,
        z3_faktor1: 181.19,  z3_faktor2: 2397,  z3_add: 991.21,
        z4_start: 66760,     z4_faktor: 0.42,   z4_sub: 10636.31,
        z5_start: 277825,    z5_faktor: 0.45,   z5_sub: 18971.06
      }
    },

    // -------------------------------------------------------------------------
    // 2025
    // Quellen: § 32a EStG i.d.F. 2025, BMF-Programmablaufplan 2025
    // -------------------------------------------------------------------------

    '2025': {
      gfb: 12096,
      werbungskostenpauschale: 1230,
      vorsorgeAbzug: 1.0,
      max_vorsorge_rv: 35448,                   // KORRIGIERT (war 27.566 = 2024-Wert; BBG West 2025 × 18,6% × 2)
      homeofficePauschaleProTag: 6,
      homeofficePauschaleMaxTage: 210,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.38,
      entfernungspauschale_erhoeht_ab_km: 21,
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 18816,                   // KORRIGIERT (war 18.130 = 2024-Wert; SteFeG 2024 § 3 SolZG)
      kirchensteuerSatz: 0,
      tarif: {
        // Offizielle Koeffizienten § 32a EStG 2025

        z3_start: 17443,
        z2_faktor1: 932.30,  z2_faktor2: 1400,
        z3_faktor1: 176.64,  z3_faktor2: 2397,  z3_add: 1015.13,
        z4_start: 68480,     z4_faktor: 0.42,   z4_sub: 10911.92,
        z5_start: 277826,    z5_faktor: 0.45,   z5_sub: 19246.67
      }
    },

    // -------------------------------------------------------------------------
    // 2026
    // Quellen: Steuerfortentwicklungsgesetz (SteFeG) vom 05.12.2024,
    //          § 32a EStG i.d.F. 2026
    //
    // Besonderheiten:
    //   - Grundfreibetrag auf 12.756 € angehoben (SteFeG 2024)
    //   - Soli-Freigrenze auf 19.488 € angehoben (SteFeG 2024, § 3 SolZG)
    //   - Werbungskostenpauschale: 1.230 € (unverändert)
    //   - Homeoffice-Pauschale: 6 €/Tag, max. 210 Tage (unverändert)
    //
    //   max_vorsorge_rv: VORLÄUFIG 37.498 €
    //     Herleitung: BBG West 2026 = 8.400 €/Monat (Schätzung Rentenversicherungsbericht)
    //     Gesamtbeitrag AN+AG = 8.400 × 18,6% × 12 × 2 ≈ 37.498 €
    //     → Sobald offizieller BMF-PAP 2026 erscheint, gegen diesen Wert prüfen!
    //
    //   Tarifdaten: aus SteFeG 2024, § 32a EStG i.d.F. 2026 – VORLÄUFIG
    //     → Sobald BMF-PAP 2026 erscheint, Koeffizienten gegen offizielle Tabelle prüfen!
    // -------------------------------------------------------------------------

    '2026': {
      gfb: 12756,
      werbungskostenpauschale: 1230,
      vorsorgeAbzug: 1.0,
      max_vorsorge_rv: 37498,                   // VORLÄUFIG – gegen BMF-PAP 2026 prüfen!
      homeofficePauschaleProTag: 6,
      homeofficePauschaleMaxTage: 210,
      entfernungspauschale_basis: 0.30,
      entfernungspauschale_erhoeht: 0.38,
      entfernungspauschale_erhoeht_ab_km: 21,
      krankengeld_kuerzung: 0.04,
      soli_freigrenze: 19488,
      kirchensteuerSatz: 0,                     // ggf. auf 0.08 (Bayern/BW) oder 0.09 setzen
      tarif: {
        // Koeffizienten § 32a EStG 2026 (lt. SteFeG 2024) – VORLÄUFIG

        z3_start: 17966,
        z2_faktor1: 912.17,  z2_faktor2: 1400,
        z3_faktor1: 172.18,  z3_faktor2: 2397,  z3_add: 1039.49,
        z4_start: 70736,     z4_faktor: 0.42,   z4_sub: 11258.04,
        z5_start: 277826,    z5_faktor: 0.45,   z5_sub: 19480.54
      }
    }

    // -------------------------------------------------------------------------
    // VORLAGE FÜR ZUKÜNFTIGE JAHRE – einfach kopieren und Werte eintragen:
    //
    // '2026': {
    //   gfb: ...,                          // Grundfreibetrag § 32a Abs. 1 EStG
    //   werbungskostenpauschale: ...,       // § 9a Satz 1 Nr. 1a EStG
    //   vorsorgeAbzug: 1.0,                // bleibt 100% (seit 2023 festgeschrieben)
    //   max_vorsorge_rv: ...,              // Beitragsbemessungsgrenze × RV-Satz (AN+AG)
    //   homeofficePauschaleProTag: 6,      // § 4 Abs. 5 Nr. 6b EStG
    //   homeofficePauschaleMaxTage: 210,   // max. 210 Tage (ggf. per Gesetz geändert)
    //   entfernungspauschale_basis: 0.30,
    //   entfernungspauschale_erhoeht: 0.38,
    //   entfernungspauschale_erhoeht_ab_km: 21,
    //   krankengeld_kuerzung: 0.04,
    //   soli_freigrenze: ...,              // ESt-Betrag aus § 3 SolZG
    //   kirchensteuerSatz: 0,              // 0.08 = Bayern/BW, 0.09 = andere BL, 0 = kein KiSt
    //   tarif: {
    //     z3_start: ...,                   // obere Grenze Zone 2 (= untere Grenze Zone 3)
    //     z2_faktor1: ..., z2_faktor2: 1400,
    //     z3_faktor1: ..., z3_faktor2: 2397, z3_add: ...,
    //     z4_start: ...,  z4_faktor: 0.42, z4_sub: ...,
    //     z5_start: ...,  z5_faktor: 0.45, z5_sub: ...
    //   }
    // },
    // -------------------------------------------------------------------------

  };

  const gefunden = configs[jahr.toString()];

  if (!gefunden) {
    throw new Error(`Keine Steuerkonfiguration für das Jahr ${jahr} gefunden. `
      + `Bitte den Block für ${jahr} in config.gs ergänzen.`);
  }

  return gefunden;
}