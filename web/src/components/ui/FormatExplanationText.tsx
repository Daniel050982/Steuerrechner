/**
 * Formatiert Erklärungstexte mit Absätzen und Aufzählungen.
 * - Doppelte Zeilenumbrüche → neuer Absatz
 * - "• " am Zeilenanfang → Aufzählungspunkt
 */
export function FormatExplanationText({ text }: { text: string }) {
  const blocks = text.split('\n\n');

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const bullets = lines.filter((l) => l.startsWith('• '));
        const plainLines = lines.filter((l) => !l.startsWith('• '));

        return (
          <div key={i}>
            {plainLines.length > 0 && plainLines.some((l) => l.trim()) && (
              <p className="text-sm text-slate-300 leading-relaxed">
                {plainLines.join(' ')}
              </p>
            )}
            {bullets.length > 0 && (
              <ul className="space-y-1 mt-1.5">
                {bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-sm text-slate-400 leading-relaxed">
                    <span className="text-emerald-500 shrink-0">•</span>
                    <span>{b.replace('• ', '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
