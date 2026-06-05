import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { useSteuer } from '../../store/SteuerContext';

export function KapitalSection() {
  const { state, setField } = useSteuer();
  const e = state.eingabe;

  return (
    <Card title="Kapitalerträge">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Kapitalerträge (brutto)"
          value={e.kapitalertraege}
          onChange={(v) => setField('kapitalertraege', v)}
        />
        <NumberInput
          label="Bereits abgeführte KapESt + Soli"
          value={e.kapitalertraege_quellensteuer}
          onChange={(v) => setField('kapitalertraege_quellensteuer', v)}
        />
        <NumberInput
          label="Freistellungsauftrag"
          value={e.freistellungsauftrag}
          onChange={(v) => setField('freistellungsauftrag', v)}
        />
      </div>
    </Card>
  );
}
