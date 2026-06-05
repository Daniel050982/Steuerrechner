import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { steuerdaten as defaultSteuerdaten, type HistorischeEingabe } from '../data/steuerdaten';
import { ergebnisse as defaultErgebnisse, type HistorischesErgebnis } from '../data/ergebnisse';
import { bankenDaten as defaultBanken, type BankEintrag } from '../data/banken';
import { supabase } from '../lib/supabase';

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

function loadInitial(): DatenState {
  return {
    steuerdaten: structuredClone(defaultSteuerdaten),
    ergebnisse: structuredClone(defaultErgebnisse),
    banken: structuredClone(defaultBanken),
  };
}

function reducer(state: DatenState, action: Action): DatenState {
  switch (action.type) {
    case 'UPDATE_STEUERDATEN': {
      const existing = state.steuerdaten[action.jahr] ?? { jahr: action.jahr };
      return {
        ...state,
        steuerdaten: {
          ...state.steuerdaten,
          [action.jahr]: { ...existing, ...action.data } as HistorischeEingabe,
        },
      };
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
      return { ...state, banken };
    }
    case 'ADD_BANK':
      return { ...state, banken: [...state.banken, action.eintrag] };
    case 'DELETE_BANK': {
      const banken = state.banken.filter((_, i) => i !== action.index);
      return { ...state, banken };
    }
    case 'LOAD':
      return action.state;
    case 'RESET_ALL':
      return loadInitial();
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Supabase Sync
// ---------------------------------------------------------------------------

async function loadFromSupabase(): Promise<DatenState | null> {
  if (!supabase) return null;

  try {
    const [sdRes, erRes, bkRes] = await Promise.all([
      supabase.from('steuerdaten').select('jahr, daten'),
      supabase.from('ergebnisse').select('jahr, daten'),
      supabase.from('banken').select('id, jahr, daten').order('id'),
    ]);

    if (sdRes.error || erRes.error || bkRes.error) {
      console.error('Supabase load error:', sdRes.error, erRes.error, bkRes.error);
      return null;
    }

    // Falls die DB leer ist, null zurückgeben → Defaults verwenden
    if (!sdRes.data?.length && !erRes.data?.length && !bkRes.data?.length) {
      return null;
    }

    const initial = loadInitial();

    const steuerdaten: Record<number, HistorischeEingabe> = { ...initial.steuerdaten };
    for (const row of sdRes.data ?? []) {
      steuerdaten[row.jahr] = row.daten as HistorischeEingabe;
    }

    const ergebnisse: Record<number, HistorischesErgebnis> = { ...initial.ergebnisse };
    for (const row of erRes.data ?? []) {
      ergebnisse[row.jahr] = row.daten as HistorischesErgebnis;
    }

    const banken: BankEintrag[] = (bkRes.data ?? []).map((row) => row.daten as BankEintrag);

    return { steuerdaten, ergebnisse, banken: banken.length ? banken : initial.banken };
  } catch (err) {
    console.error('Supabase load failed:', err);
    return null;
  }
}

async function saveToSupabase(state: DatenState): Promise<void> {
  if (!supabase) return;

  try {
    // Steuerdaten upsert
    const sdRows = Object.entries(state.steuerdaten).map(([jahr, daten]) => ({
      jahr: Number(jahr),
      daten,
      updated_at: new Date().toISOString(),
    }));
    if (sdRows.length) {
      await supabase.from('steuerdaten').upsert(sdRows, { onConflict: 'jahr' });
    }

    // Ergebnisse upsert
    const erRows = Object.entries(state.ergebnisse).map(([jahr, daten]) => ({
      jahr: Number(jahr),
      daten,
      updated_at: new Date().toISOString(),
    }));
    if (erRows.length) {
      await supabase.from('ergebnisse').upsert(erRows, { onConflict: 'jahr' });
    }

    // Banken: komplett ersetzen (delete + insert)
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
      if (remote) {
        dispatch({ type: 'LOAD', state: remote });
      } else if (supabase) {
        // DB ist leer → Initialdaten hochladen
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
