import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { useSteuer } from '../../store/SteuerContext';

export function VorsorgeSection() {
  const { state, setField } = useSteuer();
  const e = state.eingabe;

  return (
    <Card title="Vorsorgeaufwendungen">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Rentenversicherung (AN)"
          value={e.rentenversicherung_an}
          onChange={(v) => setField('rentenversicherung_an', v)}
        />
        <NumberInput
          label="Rentenversicherung (AG)"
          value={e.rentenversicherung_ag}
          onChange={(v) => setField('rentenversicherung_ag', v)}
        />
        <NumberInput
          label="Krankenversicherung"
          value={e.krankenversicherung}
          onChange={(v) => setField('krankenversicherung', v)}
        />
        <NumberInput
          label="Pflegeversicherung"
          value={e.pflegeversicherung}
          onChange={(v) => setField('pflegeversicherung', v)}
        />
        <NumberInput
          label="Arbeitslosenversicherung"
          value={e.arbeitslosenversicherung}
          onChange={(v) => setField('arbeitslosenversicherung', v)}
        />
        <NumberInput
          label="Sonstige Versicherungen"
          value={e.sonstige_versicherungen}
          onChange={(v) => setField('sonstige_versicherungen', v)}
        />
      </div>
    </Card>
  );
}
