import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { SelectInput } from '../ui/SelectInput';
import { useSteuer } from '../../store/SteuerContext';

export function SonstigesSection() {
  const { state, setField } = useSteuer();
  const e = state.eingabe;

  return (
    <Card title="Sonstiges & § 35a Ermäßigungen">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Ausländische Einkünfte"
          value={e.auslaendische_einkuenfte}
          onChange={(v) => setField('auslaendische_einkuenfte', v)}
        />
        <NumberInput
          label="Haushaltsnahe Dienstleistungen"
          value={e.haushaltsnahe_dienstleistungen}
          onChange={(v) => setField('haushaltsnahe_dienstleistungen', v)}
          hint="20% absetzbar, max. 4.000 €"
        />
        <NumberInput
          label="Handwerkerleistungen"
          value={e.handwerkerleistungen}
          onChange={(v) => setField('handwerkerleistungen', v)}
          hint="20% absetzbar, max. 1.200 €"
        />
        <SelectInput
          label="Kirchensteuer"
          value={e.kirchensteuerSatz}
          onChange={(v) => setField('kirchensteuerSatz', Number(v))}
          options={[
            { value: 0, label: 'Keine Kirchensteuer' },
            { value: 0.08, label: '8% (Bayern / Baden-Württemberg)' },
            { value: 0.09, label: '9% (andere Bundesländer)' },
          ]}
        />
      </div>
    </Card>
  );
}
