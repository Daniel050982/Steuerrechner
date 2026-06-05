/** Formatiert eine Zahl als Euro-Betrag (deutsch) */
export function euro(betrag: number): string {
  return betrag.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formatiert als Prozent */
export function prozent(wert: number): string {
  return `${wert.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}
