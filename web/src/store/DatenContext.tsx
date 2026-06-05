import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { steuerdaten as defaultSteuerdaten, type HistorischeEingabe } from '../data/steuerdaten';
import { type HistorischesErgebnis } from '../data/ergebnisse';
import { bankenDaten as defaultBanken, type BankEintrag } from '../data/banken';
import { supabase } from '../lib/supabase';
import { berechneJahresdaten } from '../core/berechnung';

// ---------------------------------------------------------------------------
// State & Reducer
// ---------------------------------------------------------------------------

interface DatenState {
  steuerdaten: Record<number, HistorischeEingabe>;
  ergebnisse: Record<number, HistorischesErgebnis>;
  banken: BankEintrag[];
}

type Action =
  | { type: 'UPDATE_STEUERDATEN'; jahr: number; data: Partial<HistorischeEingabe> }
  | { type: 'UPDATE_ERGEBNIS'; jahr: number; data: Partial<HistorischesErgebnis> }
  | { type: 'UPDATE_BANK'; index: number; data: Partial<BankEintrag> }
  | { type: 'ADD_BANK'; eintrag: BankEintrag }
  | { type: 'DELETE_BANK'; index: number }
  | { type: 'LOAD'; state: DatenState }
  | { type: 'RESET_ALL' };

function autoFillVonBanken(
  sd: Record<number, HistorischeEingabe>,
  banken: BankEintrag[],
): Record<number, HistorischeEingabe> {
  const out: Record<number, HistorischeEingabe> = {};

  const istIgnoriert = (b: BankEintrag) => {
    const t = b.typ.toLowerCase();
    return t === 'ignorieren' || t === 'ignore' || t === 'nein' || t === 'no' || t === '-';
  };
  const istKrypto = (b: BankEintrag) => b.typ.toLowerCase() === 'krypto';
  const getAnteil = (b: BankEintrag) => {
    const t = b.typ.toLowerCase();
    if (t === 'gemeinschaft 50%' || t === 'gemeinschaft 50% (kapest voll)') return 0.5;
    if (t === 'gemeinschaft 33%') return 1 / 3;
    return 1.0;
  };
  const getAnteilKapESt = (b: BankEintrag) => {
    const t = b.typ.toLowerCase();
    if (t === 'gemeinschaft 50% (kapest voll)') return 1.0;
    if (t === 'gemeinschaft 50%') return 0.5;
    if (t === 'gemeinschaft 33%') return 1 / 3;
    return 1.0;
  };

  for (const [jahrStr, daten] of Object.entries(sd)) {
    const jahr = Number(jahrStr);
    const bJahr = banken.filter(b => b.jahr === jahr);
    const aktiv = bJahr.filter(b => !istIgnoriert(b));
    const normal = aktiv.filter(b => !istKrypto(b));
    const krypto = aktiv.filter(b => istKrypto(b));

    const kapitalBanken = normal.reduce((s, b) => s + b.kapitalertraege * getAnteil(b), 0);
    const abgeltBanken = normal.reduce((s, b) => s + b.kapitalertragsteuer * getAnteilKapESt(b), 0);
    const soliBanken = normal.reduce((s, b) => s + b.soli_kapital * getAnteilKapESt(b), 0);
    const estg20Banken = krypto.reduce((s, b) => s + b.estg_20, 0);
    const estg23Banken = aktiv.reduce((s, b) => s + b.estg_23, 0);
    const estg22Banken = aktiv.reduce((s, b) => s + b.estg_22, 0);

    const patched = { ...daten };
    const hatBanken = aktiv.length > 0;
    if (hatBanken) {
      patched.kapitalertraege_gesamt = kapitalBanken;
      patched.abgeltungsteuer_gezahlt = abgeltBanken;
      patched.soli_kapital_gezahlt = soliBanken;
      patched.estg_20 = estg20Banken;
      patched.estg_23 = estg23Banken;
      patched.estg_22 = estg22Banken;
    }

    out[jahr] = patched;
  }
  return out;
}

function berechneAlleErgebnisse(
  steuerdaten: Record<number, HistorischeEingabe>,
  banken: BankEintrag[],
): { ergebnisse: Record<number, HistorischesErgebnis>; steuerdaten: Record<number, HistorischeEingabe> } {
  const filled = autoFillVonBanken(steuerdaten, banken);

  const jahre = Object.keys(filled).map(Number).sort((a, b) => a - b);
  const ergebnisse: Record<number, HistorischesErgebnis> = {};

  for (const jahr of jahre) {
    const daten = filled[jahr];
    const bankenFuerJahr = banken.filter(b => b.jahr === jahr);
    ergebnisse[jahr] = berechneJahresdaten(daten, bankenFuerJahr);

    const nextJahr = jahr + 1;
    if (filled[nextJahr]) {
      filled[nextJahr] = {
        ...filled[nextJahr],
        verlustvortrag_23: ergebnisse[jahr].estg_23_vortrag_ende,
        verlustvortrag_20: ergebnisse[jahr].estg_20_vortrag_ende,
      };
    }
  }

  return { ergebnisse, steuerdaten: filled };
}

function loadInitial(): DatenState {
  const sd = structuredClone(defaultSteuerdaten);
  const banken = structuredClone(defaultBanken);
  const { ergebnisse, steuerdaten } = berechneAlleErgebnisse(sd, banken);
  return { steuerdaten, ergebnisse, banken };
}

function reducer(state: DatenState, action: Action): DatenState {
  switch (action.type) {
    case 'UPDATE_STEUERDATEN': {
      const existing = state.steuerdaten[action.jahr] ?? { jahr: action.jahr };
      const raw = {
        ...state.steuerdaten,
        [action.jahr]: { ...existing, ...action.data } as HistorischeEingabe,
      };
      const { ergebnisse, steuerdaten } = berechneAlleErgebnisse(raw, state.banken);
      return { ...state, steuerdaten, ergebnisse };
    }
    case 'UPDATE_ERGEBNIS': {
      const existing = state.ergebnisse[action.jahr] ?? { jahr: action.jahr };
      return {
        ...state,
        ergebnisse: {
          ...state.ergebnisse,
          [action.jahr]: { ...existing, ...action.data } as HistorischesErgebnis,
        },
      };
    }
    case 'UPDATE_BANK': {
      const banken = [...state.banken];
      banken[action.index] = { ...banken[action.index], ...action.data };
      const ub = berechneAlleErgebnisse(state.steuerdaten, banken);
      return { ...state, banken, steuerdaten: ub.steuerdaten, ergebnisse: ub.ergebnisse };
    }
    case 'ADD_BANK': {
      const banken = [...state.banken, action.eintrag];
      const ab = berechneAlleErgebnisse(state.steuerdaten, banken);
      return { ...state, banken, steuerdaten: ab.steuerdaten, ergebnisse: ab.ergebnisse };
    }
    case 'DELETE_BANK': {
      const banken = state.banken.filter((_, i) => i !== action.index);
      const db = berechneAlleErgebnisse(state.steuerdaten, banken);
      return { ...state, banken, steuerdaten: db.steuerdaten, ergebnisse: db.ergebnisse };
    }
    case 'LOAD': {
      const lb = berechneAlleErgebnisse(action.state.steuerdaten, action.state.banken);
      return { ...action.state, steuerdaten: lb.steuerdaten, ergebnisse: lb.ergebnisse };
    }
    case 'RESET_ALL':
      return loadInitial();
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Supabase Sync
// ---------------------------------------------------------------------------

async function loadFromSupabase(): Promise<DatenState | null | 'error'> {
  if (!supabase) return null;

  try {
    const [sdRes, bkRes] = await Promise.all([
      supabase.from('steuerdaten').select('jahr, daten'),
      supabase.from('banken').select('id, jahr, daten').order('id'),
    ]);

    if (sdRes.error || bkRes.error) {
      console.error('Supabase load error:', sdRes.error, bkRes.error);
      return 'error';
    }

    if (!sdRes.data?.length && !bkRes.data?.length) {
      return null;
    }

    const initial = loadInitial();

    const steuerdaten: Record<number, HistorischeEingabe> = { ...initial.steuerdaten };
    for (const row of sdRes.data ?? []) {
      steuerdaten[row.jahr] = row.daten as HistorischeEingabe;
    }

    const banken: BankEintrag[] = (bkRes.data ?? []).map((row) => row.daten as BankEintrag);
    const effektiveBanken = banken.length ? banken : initial.banken;

    const computed = berechneAlleErgebnisse(steuerdaten, effektiveBanken);
    return {
      steuerdaten: computed.steuerdaten,
      ergebnisse: computed.ergebnisse,
      banken: effektiveBanken,
    };
  } catch (err) {
    console.error('Supabase load failed:', err);
    return 'error';
  }
}

async function saveToSupabase(state: DatenState): Promise<void> {
  if (!supabase) return;

  try {
    const sdRows = Object.entries(state.steuerdaten).map(([jahr, daten]) => ({
      jahr: Number(jahr),
      daten,
      updated_at: new Date().toISOString(),
    }));
    if (sdRows.length) {
      await supabase.from('steuerdaten').upsert(sdRows, { onConflict: 'jahr' });
    }

    await supabase.from('banken').delete().gte('id', 0);
    const bkRows = state.banken.map((eintrag) => ({
      jahr: eintrag.jahr,
      daten: eintrag,
      updated_at: new Date().toISOString(),
    }));
    if (bkRows.length) {
      await supabase.from('banken').insert(bkRows);
    }
  } catch (err) {
    console.error('Supabase save failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DatenContextType {
  state: DatenState;
  loading: boolean;
  updateSteuerdaten: (jahr: number, data: Partial<HistorischeEingabe>) => void;
  updateErgebnis: (jahr: number, data: Partial<HistorischesErgebnis>) => void;
  updateBank: (index: number, data: Partial<BankEintrag>) => void;
  addBank: (eintrag: BankEintrag) => void;
  deleteBank: (index: number) => void;
  resetAll: () => void;
}

const DatenContext = createContext<DatenContextType | null>(null);

export function DatenProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadInitial);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initialLoadDone = useRef(false);

  // Load from Supabase on mount
  useEffect(() => {
    loadFromSupabase().then((remote) => {
      if (remote === 'error') {
        // Fehler beim Laden — NICHT die DB überschreiben, nur lokal weiterarbeiten
        console.warn('Supabase load failed — using local defaults');
      } else if (remote) {
        dispatch({ type: 'LOAD', state: remote });
      } else if (supabase) {
        // DB ist wirklich leer → Initialdaten hochladen
        saveToSupabase(loadInitial());
      }
      initialLoadDone.current = true;
      setLoading(false);
    });
  }, []);

  // Debounced save to Supabase on state changes
  useEffect(() => {
    if (!initialLoadDone.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToSupabase(state);
    }, 1000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  const updateSteuerdaten = useCallback((jahr: number, data: Partial<HistorischeEingabe>) =>
    dispatch({ type: 'UPDATE_STEUERDATEN', jahr, data }), []);

  const updateErgebnis = useCallback((jahr: number, data: Partial<HistorischesErgebnis>) =>
    dispatch({ type: 'UPDATE_ERGEBNIS', jahr, data }), []);

  const updateBank = useCallback((index: number, data: Partial<BankEintrag>) =>
    dispatch({ type: 'UPDATE_BANK', index, data }), []);

  const addBank = useCallback((eintrag: BankEintrag) =>
    dispatch({ type: 'ADD_BANK', eintrag }), []);

  const deleteBank = useCallback((index: number) =>
    dispatch({ type: 'DELETE_BANK', index }), []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
    if (supabase) saveToSupabase(loadInitial());
  }, []);

  return (
    <DatenContext.Provider value={{
      state, loading,
      updateSteuerdaten, updateErgebnis, updateBank, addBank, deleteBank, resetAll,
    }}>
      {children}
    </DatenContext.Provider>
  );
}

export function useDaten() {
  const ctx = useContext(DatenContext);
  if (!ctx) throw new Error('useDaten muss innerhalb von DatenProvider verwendet werden');
  return ctx;
}
