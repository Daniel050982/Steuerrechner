import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { extractTextFromPdf } from '../core/pdfExtract';
import { parsePdfText, type ParseErgebnis } from '../core/pdfParser';
import { useDaten } from '../store/DatenContext';
import { euro } from '../utils/format';
import type { BankEintrag } from '../data/banken';

interface ResultItem {
  file: string;
  result: ParseErgebnis;
  applied: boolean;
}

export function PdfUpload({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { updateSteuerdaten, addBank } = useDaten();

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setProcessing(true);
    const newResults: ResultItem[] = [];

    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') continue;
      try {
        const text = await extractTextFromPdf(file);
        const result = parsePdfText(text);
        newResults.push({ file: file.name, result, applied: false });
      } catch (err) {
        console.error(`Fehler beim Parsen von ${file.name}:`, err);
        newResults.push({
          file: file.name,
          result: { typ: 'unbekannt', text: `Fehler: ${err}` },
          applied: false,
        });
      }
    }

    setResults((prev) => [...prev, ...newResults]);
    setProcessing(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files);
  }, [processFiles]);

  const applyResult = useCallback((index: number) => {
    const item = results[index];
    if (!item || item.applied) return;
    const r = item.result;

    if (r.typ === 'lstb' && r.jahr) {
      updateSteuerdaten(r.jahr, r.daten);
    } else if (r.typ === 'bank' && r.jahr) {
      const bankEintrag: BankEintrag = {
        bank: r.bankName || 'Unbekannte Bank',
        typ: 'Einzel',
        jahr: r.jahr,
        kapitalertraege: r.daten.kapitalertraege ?? 0,
        kapitalertragsteuer: r.daten.kapitalertragsteuer ?? 0,
        soli_kapital: r.daten.soli_kapital ?? 0,
        kirchensteuer: r.daten.kirchensteuer ?? 0,
        sparer_pauschbetrag: r.daten.sparer_pauschbetrag ?? 0,
        invstg_56: r.daten.invstg_56 ?? 0,
        fiktiv_zugeflossen: 0,
        broker_verluste: 0,
        estg_20: 0,
        estg_23: 0,
        estg_22: 0,
        notiz: `Importiert aus ${item.file}`,
      };
      addBank(bankEintrag);
    } else if (r.typ === 'krypto' && r.jahr) {
      updateSteuerdaten(r.jahr, {
        estg_23: r.daten.estg_23,
        estg_22: r.daten.estg_22,
        estg_20: r.daten.estg_20,
      });
    }

    setResults((prev) =>
      prev.map((it, i) => (i === index ? { ...it, applied: true } : it))
    );
  }, [results, updateSteuerdaten, addBank]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9000 }}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">PDF Import</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div className="px-5 py-4">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${
              dragOver
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
          >
            {processing ? (
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-slate-500" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">
                {processing ? 'Wird verarbeitet...' : 'PDFs hier hineinziehen oder klicken'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Lohnsteuerbescheinigung, Jahressteuerbescheinigung (Bank), CoinTracking-Report
              </p>
            </div>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
            {results.map((item, i) => (
              <ResultCard key={i} item={item} onApply={() => applyResult(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ item, onApply }: { item: ResultItem; onApply: () => void }) {
  const r = item.result;

  const typLabel = r.typ === 'lstb' ? 'Lohnsteuerbescheinigung'
    : r.typ === 'bank' ? 'Bankbescheinigung'
    : r.typ === 'krypto' ? 'Krypto-Steuerreport'
    : 'Unbekanntes Dokument';

  const typColor = r.typ === 'lstb' ? 'text-blue-400 bg-blue-500/15 border-blue-500/30'
    : r.typ === 'bank' ? 'text-purple-400 bg-purple-500/15 border-purple-500/30'
    : r.typ === 'krypto' ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    : 'text-slate-400 bg-slate-500/15 border-slate-500/30';

  const jahr = r.typ !== 'unbekannt' ? r.jahr : null;

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-300 truncate">{item.file}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${typColor}`}>{typLabel}</span>
          {jahr && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{jahr}</span>}
        </div>
      </div>

      {/* Erkannte Werte */}
      {r.typ === 'lstb' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
          {r.daten.bruttogehalt ? <Field label="Brutto" value={euro(r.daten.bruttogehalt)} /> : null}
          {r.daten.lohnsteuer ? <Field label="Lohnsteuer" value={euro(r.daten.lohnsteuer)} /> : null}
          {r.daten.soli_lohn ? <Field label="Soli" value={euro(r.daten.soli_lohn)} /> : null}
          {r.daten.rv_an ? <Field label="RV AN" value={euro(r.daten.rv_an)} /> : null}
          {r.daten.rv_ag ? <Field label="RV AG" value={euro(r.daten.rv_ag)} /> : null}
          {r.daten.kv_an_regulaer ? <Field label="KV AN" value={euro(r.daten.kv_an_regulaer)} /> : null}
          {r.daten.pv_an ? <Field label="PV AN" value={euro(r.daten.pv_an)} /> : null}
        </div>
      )}

      {r.typ === 'bank' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
          {r.bankName && <Field label="Bank" value={r.bankName} />}
          {r.daten.kapitalertraege ? <Field label="Kapitalerträge" value={euro(r.daten.kapitalertraege)} /> : null}
          {r.daten.kapitalertragsteuer ? <Field label="KapESt" value={euro(r.daten.kapitalertragsteuer)} /> : null}
          {r.daten.soli_kapital ? <Field label="Soli" value={euro(r.daten.soli_kapital)} /> : null}
          {r.daten.sparer_pauschbetrag ? <Field label="Pauschbetrag" value={euro(r.daten.sparer_pauschbetrag)} /> : null}
        </div>
      )}

      {r.typ === 'krypto' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
          <Field label="§23 Veräußerung" value={euro(r.daten.estg_23)} />
          <Field label="§22 Staking" value={euro(r.daten.estg_22)} />
          <Field label="§20 Termingeschäfte" value={euro(r.daten.estg_20)} />
        </div>
      )}

      {r.typ === 'unbekannt' && (
        <p className="text-xs text-red-400 mb-3">
          Konnte das Dokument nicht zuordnen. Bitte prüfe, ob es eine Lohnsteuer-, Bank- oder Krypto-Bescheinigung ist.
        </p>
      )}

      {/* Action */}
      <div className="flex justify-end">
        {item.applied ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            Übernommen
          </span>
        ) : r.typ !== 'unbekannt' && jahr ? (
          <button
            onClick={onApply}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition"
          >
            Daten übernehmen
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <AlertCircle className="w-4 h-4" />
            {!jahr ? 'Kein Jahr erkannt' : 'Nicht übernehmbar'}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
