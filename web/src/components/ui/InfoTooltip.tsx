import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { FormatExplanationText } from './FormatExplanationText';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const justOpened = useRef(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const calcPosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const panelWidth = 380;
    const panelMaxHeight = 320;
    const gap = 8;

    // Horizontal: try right-aligned to button, but clamp to viewport
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 16) {
      left = window.innerWidth - panelWidth - 16;
    }
    if (left < 16) left = 16;

    // Vertical: below the button if space, otherwise above
    let top = rect.bottom + gap;
    if (top + panelMaxHeight > window.innerHeight - 16) {
      top = rect.top - panelMaxHeight - gap;
      if (top < 16) top = 16;
    }

    setPos({ top, left });
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    justOpened.current = true;
    if (!open) calcPosition();
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
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
        ref={btnRef}
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

          {/* Panel — positioned near the button */}
          <div
            ref={panelRef}
            className="absolute w-[calc(100vw-2rem)] max-w-[380px] bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
            style={{ zIndex: 9999, top: pos.top, left: pos.left }}
          >
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

            <div className="px-4 py-4 max-h-[280px] overflow-y-auto">
              <FormatExplanationText text={text} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
