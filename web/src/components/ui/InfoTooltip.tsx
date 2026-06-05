import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { FormatExplanationText } from './FormatExplanationText';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const justOpened = useRef(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    justOpened.current = true;
    setOpen((prev) => !prev);
  };

  // Close on outside click (delayed registration to avoid same-click close)
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      // Skip the click that just opened the tooltip
      if (justOpened.current) {
        justOpened.current = false;
        return;
      }
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition shrink-0"
        aria-label="Erklärung anzeigen"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0" style={{ zIndex: 9998 }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-20 sm:right-6 sm:left-auto sm:translate-x-0 sm:translate-y-0 w-[calc(100vw-2rem)] max-w-md bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Erklärung</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
              <FormatExplanationText text={text} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
