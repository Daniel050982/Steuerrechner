import type { JahresConfig, Steuerjahr } from '../types/steuer';

/**
 * Steuerkonfiguration je Veranlagungsjahr.
 *
 * Tarifzonen nach § 32a EStG:
 *   Zone 1: x <= gfb                 → 0 € (Grundfreibetrag)
 *   Zone 2: gfb < x <= z3_start      → Progressionsformel 1
 *   Zone 3: z3_start < x <= z4_start → Progressionsformel 2
 *   Zone 4: z4_start < x <= z5_start → Proportionalzone 42%
 *   Zone 5: x > z5_start             → Proportionalzone 45% (Reichensteuer)
 */
const configs: Record<string, JahresConfig> = {
  '2019': {
    gfb: 9168,
    werbungskostenpauschale: 1000,
    vorsorgeAbzug: 0.88,
    max_vorsorge_rv: 24305,
    homeofficePauschaleProTag: 0,
    homeofficePauschaleMaxTage: 0,
    entfernungspauschale_basis: 0.30,
    entfernungspauschale_erhoeht: 0.30,
    entfernungspauschale_erhoeht_ab_km: 9999,
    krankengeld_kuerzung: 0.04,
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 972,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 14255,
      z3_faktor1: 228.74, z3_faktor2: 2397, z3_add: 965.58,
      z2_faktor1: 997.80, z2_faktor2: 1400,
      z4_start: 55961,  z4_faktor: 0.42, z4_sub: 8621.75,
      z5_start: 265327, z5_faktor: 0.45, z5_sub: 16572.50,
    },
  },

  '2020': {
    gfb: 9408,
    werbungskostenpauschale: 1000,
    vorsorgeAbzug: 0.90,
    max_vorsorge_rv: 25046,
    homeofficePauschaleProTag: 5,
    homeofficePauschaleMaxTage: 120,
    entfernungspauschale_basis: 0.30,
    entfernungspauschale_erhoeht: 0.30,
    entfernungspauschale_erhoeht_ab_km: 9999,
    krankengeld_kuerzung: 0.04,
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 972,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 14532,
      z2_faktor1: 972.87,  z2_faktor2: 1400,
      z3_faktor1: 212.02,  z3_faktor2: 2397, z3_add: 972.79,
      z4_start: 57051,     z4_faktor: 0.42,  z4_sub: 8963.74,
      z5_start: 270500,    z5_faktor: 0.45,  z5_sub: 17078.74,
    },
  },

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
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 16956,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 14753,
      z2_faktor1: 995.21,  z2_faktor2: 1400,
      z3_faktor1: 208.85,  z3_faktor2: 2397, z3_add: 950.96,
      z4_start: 57918,     z4_faktor: 0.42,  z4_sub: 9136.63,
      z5_start: 274612,    z5_faktor: 0.45,  z5_sub: 17374.99,
    },
  },

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
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 16956,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 14926,
      z2_faktor1: 1088.67, z2_faktor2: 1400,
      z3_faktor1: 206.43,  z3_faktor2: 2397, z3_add: 869.32,
      z4_start: 58596,     z4_faktor: 0.42,  z4_sub: 9336.45,
      z5_start: 277825,    z5_faktor: 0.45,  z5_sub: 17671.20,
    },
  },

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
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 17543,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 15999,
      z3_faktor1: 192.59, z3_faktor2: 2397, z3_add: 966.53,
      z2_faktor1: 979.18, z2_faktor2: 1400,
      z4_start: 62809,  z4_faktor: 0.42, z4_sub: 9972.98,
      z5_start: 277825, z5_faktor: 0.45, z5_sub: 18307.73,
    },
  },

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
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 18130,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 17005,
      z2_faktor1: 954.80,  z2_faktor2: 1400,
      z3_faktor1: 181.19,  z3_faktor2: 2397, z3_add: 991.21,
      z4_start: 66760,     z4_faktor: 0.42,  z4_sub: 10636.31,
      z5_start: 277825,    z5_faktor: 0.45,  z5_sub: 18971.06,
    },
  },

  '2025': {
    gfb: 12096,
    werbungskostenpauschale: 1230,
    vorsorgeAbzug: 1.0,
    max_vorsorge_rv: 35448,
    homeofficePauschaleProTag: 6,
    homeofficePauschaleMaxTage: 210,
    entfernungspauschale_basis: 0.30,
    entfernungspauschale_erhoeht: 0.38,
    entfernungspauschale_erhoeht_ab_km: 21,
    krankengeld_kuerzung: 0.04,
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 18816,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 17443,
      z2_faktor1: 932.30,  z2_faktor2: 1400,
      z3_faktor1: 176.64,  z3_faktor2: 2397, z3_add: 1015.13,
      z4_start: 68480,     z4_faktor: 0.42,  z4_sub: 10911.92,
      z5_start: 277826,    z5_faktor: 0.45,  z5_sub: 19246.67,
    },
  },

  '2026': {
    gfb: 12756,
    werbungskostenpauschale: 1230,
    vorsorgeAbzug: 1.0,
    max_vorsorge_rv: 37498,
    homeofficePauschaleProTag: 6,
    homeofficePauschaleMaxTage: 210,
    entfernungspauschale_basis: 0.30,
    entfernungspauschale_erhoeht: 0.38,
    entfernungspauschale_erhoeht_ab_km: 21,
    krankengeld_kuerzung: 0.04,
    sonderausgabenPauschbetrag: 36,
    soli_freigrenze: 19488,
    kirchensteuerSatz: 0,
    tarif: {
      z3_start: 17966,
      z2_faktor1: 912.17,  z2_faktor2: 1400,
      z3_faktor1: 172.18,  z3_faktor2: 2397, z3_add: 1039.49,
      z4_start: 70736,     z4_faktor: 0.42,  z4_sub: 11258.04,
      z5_start: 277826,    z5_faktor: 0.45,  z5_sub: 19480.54,
    },
  },
};

export function getConfig(jahr: number): JahresConfig {
  const gefunden = configs[jahr.toString()];
  if (!gefunden) {
    throw new Error(
      `Keine Steuerkonfiguration für das Jahr ${jahr} gefunden.`
    );
  }
  return gefunden;
}

export const VERFUEGBARE_JAHRE: Steuerjahr[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
