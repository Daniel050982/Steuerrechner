import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { useSteuer } from '../../store/SteuerContext';

export function EinkommenSection() {
  const { state, setField } = useSteuer();
  const e = state.eingabe;

  return (
    <Card title="Einkommen & Lohnsteuer">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Bruttogehalt (Jahres)"
          value={e.bruttogehalt}
          onChange={(v) => setField('bruttogehalt', v)}
        />
        <NumberInput
          label="Einbehaltene Lohnsteuer"
          value={e.lohnsteuer}
          onChange={(v) => setField('lohnsteuer', v)}
        />
        <NumberInput
          label="Einbehaltener Soli"
          value={e.soli_gezahlt}
          onChange={(v) => setField('soli_gezahlt', v)}
        />
        <NumberInput
          label="Einbehaltene Kirchensteuer"
          value={e.kirchensteuer_gezahlt}
          onChange={(v) => setField('kirchensteuer_gezahlt', v)}
        />
      </div>
    </Card>
  );
}
