import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { useSteuer } from '../../store/SteuerContext';

export function WerbungskostenSection() {
  const { state, setField } = useSteuer();
  const e = state.eingabe;

  return (
    <Card title="Werbungskosten">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Entfernung Wohnung – Arbeit"
          value={e.entfernung_km}
          onChange={(v) => setField('entfernung_km', v)}
          suffix="km"
        />
        <NumberInput
          label="Arbeitstage pro Jahr"
          value={e.arbeitstage}
          onChange={(v) => setField('arbeitstage', v)}
          suffix="Tage"
        />
        <NumberInput
          label="Homeoffice-Tage"
          value={e.homeoffice_tage}
          onChange={(v) => setField('homeoffice_tage', v)}
          suffix="Tage"
        />
        <NumberInput
          label="Arbeitsmittel"
          value={e.arbeitsmittel}
          onChange={(v) => setField('arbeitsmittel', v)}
        />
        <NumberInput
          label="Spenden"
          value={e.spenden}
          onChange={(v) => setField('spenden', v)}
        />
      </div>
    </Card>
  );
}
