import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { SteuerEingabe, SteuerErgebnis, Steuerjahr } from '../types/steuer';
import { berechne } from '../core/berechnung';

const DEFAULT_EINGABE: SteuerEingabe = {
  jahr: 2025,
  verheiratet: false,
  bruttogehalt: 0,
  lohnsteuer: 0,
  soli_gezahlt: 0,
  kirchensteuer_gezahlt: 0,
  rentenversicherung_an: 0,
  rentenversicherung_ag: 0,
  krankenversicherung: 0,
  pflegeversicherung: 0,
  arbeitslosenversicherung: 0,
  entfernung_km: 0,
  arbeitstage: 230,
  homeoffice_tage: 0,
  arbeitsmittel: 0,
  spenden: 0,
  sonstige_versicherungen: 0,
  kapitalertraege: 0,
  kapitalertraege_quellensteuer: 0,
  freistellungsauftrag: 1000,
  auslaendische_einkuenfte: 0,
  haushaltsnahe_dienstleistungen: 0,
  handwerkerleistungen: 0,
  kirchensteuerSatz: 0,
};

interface State {
  eingabe: SteuerEingabe;
  ergebnis: SteuerErgebnis | null;
}

type Action =
  | { type: 'SET_FIELD'; field: keyof SteuerEingabe; value: number | boolean }
  | { type: 'BERECHNEN' }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, eingabe: { ...state.eingabe, [action.field]: action.value } };
    case 'BERECHNEN':
      return { ...state, ergebnis: berechne(state.eingabe) };
    case 'RESET':
      return { eingabe: { ...DEFAULT_EINGABE }, ergebnis: null };
    default:
      return state;
  }
}

interface SteuerContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
  setField: (field: keyof SteuerEingabe, value: number | boolean) => void;
  setJahr: (jahr: Steuerjahr) => void;
  berechnen: () => void;
  reset: () => void;
}

const SteuerContext = createContext<SteuerContextType | null>(null);

export function SteuerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    eingabe: { ...DEFAULT_EINGABE },
    ergebnis: null,
  });

  const setField = (field: keyof SteuerEingabe, value: number | boolean) =>
    dispatch({ type: 'SET_FIELD', field, value });

  const setJahr = (jahr: Steuerjahr) =>
    dispatch({ type: 'SET_FIELD', field: 'jahr', value: jahr });

  const berechnen = () => dispatch({ type: 'BERECHNEN' });
  const reset = () => dispatch({ type: 'RESET' });

  return (
    <SteuerContext.Provider value={{ state, dispatch, setField, setJahr, berechnen, reset }}>
      {children}
    </SteuerContext.Provider>
  );
}

export function useSteuer() {
  const ctx = useContext(SteuerContext);
  if (!ctx) throw new Error('useSteuer muss innerhalb von SteuerProvider verwendet werden');
  return ctx;
}
