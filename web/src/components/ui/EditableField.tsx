import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { euro } from '../../utils/format';
import { InfoTooltip } from './InfoTooltip';

interface EditableFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  format?: 'euro' | 'prozent' | 'tage' | 'km' | 'plain';
  bold?: boolean;
  indent?: boolean;
  color?: 'green' | 'red' | 'blue';
  readOnly?: boolean;
  tooltip?: string;
}

export function EditableField({
  label,
  value,
  onChange,
  format = 'euro',
  bold,
  indent,
  color,
  readOnly,
  tooltip,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const formatValue = (v: number) => {
    switch (format) {
      case 'euro': return euro(v);
      case 'prozent': return `${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
      case 'tage': return `${v} Tage`;
      case 'km': return `${v} km`;
      default: return String(v);
    }
  };

  const handleStartEdit = () => {
    if (readOnly) return;
    setDraft(String(value || ''));
    setEditing(true);
  };

  const handleConfirm = () => {
    const parsed = parseFloat(draft.replace(/\./g, '').replace(',', '.')) || 0;
    onChange(parsed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') setEditing(false);
  };

  const colorClass = color === 'green' ? 'text-emerald-400'
    : color === 'red' ? 'text-red-400'
    : color === 'blue' ? 'text-blue-400'
    : 'text-slate-200';

  return (
    <div className={`flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0 group ${indent ? 'pl-4' : ''}`}>
      <span className={`flex items-center gap-1.5 text-sm ${bold ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleConfirm}
          onKeyDown={handleKeyDown}
          className="w-32 text-right rounded-lg border border-emerald-500 bg-slate-800 px-2 py-0.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      ) : (
        <button
          type="button"
          onClick={handleStartEdit}
          disabled={readOnly}
          className={`flex items-center gap-1.5 text-sm font-medium ${bold ? 'font-bold' : ''} ${colorClass} ${!readOnly ? 'hover:text-emerald-400 cursor-pointer' : 'cursor-default'} transition`}
        >
          <span>{formatValue(value)}</span>
          {!readOnly && (
            <Pencil className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition" />
          )}
        </button>
      )}
    </div>
  );
}
