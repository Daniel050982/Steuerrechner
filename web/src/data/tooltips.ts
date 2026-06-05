/**
 * Tooltip-Texte für alle Felder im Steuerrechner.
 * Portiert aus dem Google Apps Script (ui.gs TOOLTIP_TEXTE).
 *
 * Format:
 * - Doppelte Zeilenumbrüche → neuer Absatz
 * - "• " am Zeilenanfang → Aufzählungspunkt
 */

// ---------------------------------------------------------------------------
// Steuerdaten – Eingabefelder
// ---------------------------------------------------------------------------

export const TOOLTIPS_STEUERDATEN: Record<string, string> = {
  // Lohn & Gehalt
  bruttogehalt:
    'Dein Jahres-Bruttogehalt vor Steuern und Sozialabgaben.\n\n' +
    '• Findest du auf deiner Lohnsteuerbescheinigung (LStB) unter Zeile 3\n' +
    '• Bei mehreren Arbeitgebern: Summe aller Bescheinigungen\n' +
    '• Einmalzahlungen (Weihnachtsgeld, Bonus) sind bereits enthalten',

  lohnsteuer:
    'Die vom Arbeitgeber einbehaltene Lohnsteuer.\n\n' +
    '• LStB Zeile 4\n' +
    '• Das ist die Steuer, die du vorab gezahlt hast\n' +
    '• Die Differenz zur tatsächlichen Steuerlast ergibt deine Erstattung oder Nachzahlung',

  soli_lohn:
    'Solidaritätszuschlag auf die Lohnsteuer.\n\n' +
    '• LStB Zeile 5\n' +
    '• Seit 2021 zahlen ca. 90% der Arbeitnehmer keinen Soli mehr\n' +
    '• Fällt erst an, wenn die Einkommensteuer die Freigrenze überschreitet',

  kirchensteuer_lohn:
    'Kirchensteuer auf das Arbeitseinkommen.\n\n' +
    '• LStB Zeile 6\n' +
    '• 8% in Bayern/Baden-Württemberg, 9% in allen anderen Bundesländern\n' +
    '• 0 €, wenn du nicht kirchensteuerpflichtig bist (kein Kirchenmitglied)',

  // Kapitalerträge
  kapitalertraege_gesamt:
    'Summe aller Kapitalerträge aus Dividenden, Zinsen und realisierten Kursgewinnen.\n\n' +
    '• Steht auf der Jahressteuerbescheinigung deiner Bank/Broker\n' +
    '• Wird automatisch aus dem Banken-Tab berechnet (gelbe Zellen)\n' +
    '• Unrealisierte Buchgewinne zählen nicht',

  sparer_pauschbetrag:
    'Steuerfreier Freibetrag für Kapitalerträge.\n\n' +
    '• 801 € pro Person bis 2022\n' +
    '• 1.000 € pro Person ab 2023\n' +
    '• 2.000 € für Verheiratete ab 2023\n' +
    '• Wird über den Freistellungsauftrag bei der Bank beantragt',

  abgeltungsteuer_gezahlt:
    'Bereits von der Bank/Broker abgeführte Kapitalertragsteuer (25%).\n\n' +
    '• Findest du auf der Jahressteuerbescheinigung\n' +
    '• Wird in der Steuererklärung gegengerechnet\n' +
    '• Bei der Günstigerprüfung kann sich eine Erstattung ergeben',

  soli_kapital_gezahlt:
    'Solidaritätszuschlag auf die Kapitalertragsteuer.\n\n' +
    '• 5,5% der Kapitalertragsteuer\n' +
    '• Wird ebenfalls direkt von der Bank abgeführt',

  kirchensteuer_kapital:
    'Kirchensteuer auf Kapitalerträge.\n\n' +
    '• Wird automatisch von der Bank abgeführt (Sperrvermerk möglich)\n' +
    '• 8% (Bayern/BW) oder 9% (andere BL) der KapESt',

  // Krypto
  estg_23:
    'Gewinne oder Verluste aus privaten Veräußerungsgeschäften nach § 23 EStG.\n\n' +
    '• Betrifft Krypto-Verkäufe innerhalb der 1-Jahres-Haltefrist\n' +
    '• Gewinne unter 600 € (Freigrenze) sind steuerfrei\n' +
    '• Verluste können mit künftigen §23-Gewinnen verrechnet werden\n' +
    '• Quelle: CoinTracking oder eigene Aufstellung',

  verlustvortrag_23:
    'Noch nicht verrechnete Verluste aus §23-Geschäften der Vorjahre.\n\n' +
    '• Werden automatisch aus dem Vorjahr übernommen\n' +
    '• Können nur mit §23-Gewinnen verrechnet werden (nicht mit Gehalt)\n' +
    '• Verfallen nicht — können unbegrenzt vorgetragen werden',

  estg_22:
    'Einkünfte aus sonstigen Leistungen nach § 22 Nr. 3 EStG.\n\n' +
    '• Staking-Rewards, Airdrops, Lending-Zinsen (Krypto)\n' +
    '• Freigrenze: 256 € pro Jahr (ab 2024)\n' +
    '• Fließt ins zu versteuernde Einkommen (progressiver Steuersatz)',

  estg_20:
    'Gewinne oder Verluste aus Termingeschäften nach § 20 EStG.\n\n' +
    '• Betrifft Krypto-Margin-Trading und Futures\n' +
    '• Verluste können seit JStG 2024 mit allen Kapitalerträgen verrechnet werden\n' +
    '• Vorher war die Verrechnung auf 20.000 € pro Jahr begrenzt',

  verlustvortrag_20:
    'Noch nicht verrechnete §20-Verluste aus Termingeschäften der Vorjahre.\n\n' +
    '• Werden mit laufenden Kapitalerträgen verrechnet (seit JStG 2024)\n' +
    '• Können unbegrenzt vorgetragen werden\n' +
    '• Der Vortrag reduziert die Kapitalertragsteuer',

  steuern_krypto_gezahlt:
    'Direkt ans Finanzamt gezahlte Steuern auf Krypto-Einkünfte.\n\n' +
    '• Nur relevant, wenn du Vorauszahlungen geleistet hast\n' +
    '• Normalerweise 0 € (Krypto wird nicht an der Quelle besteuert)',

  // Auslandsarbeit
  auslandseinkuenfte:
    'Bruttoeinkünfte aus Arbeit im Ausland (z.B. Frankreich, Schweiz).\n\n' +
    '• Sind in Deutschland steuerfrei (DBA), erhöhen aber den Steuersatz\n' +
    '• Stichwort: Progressionsvorbehalt nach § 32b EStG\n' +
    '• Findest du im Steuerbescheid oder auf dem ausländischen Gehaltszettel',

  auslands_sv:
    'Im Ausland gezahlte Arbeitnehmer-Sozialversicherungsbeiträge.\n\n' +
    '• Werden bei der Sonderausgaben-Berechnung berücksichtigt\n' +
    '• Findest du auf dem ausländischen Gehaltszettel',

  anrechenbare_auslandssteuer:
    'Im Ausland gezahlte Einkommensteuer, die in Deutschland angerechnet wird.\n\n' +
    '• Vermeidet Doppelbesteuerung nach § 34c EStG\n' +
    '• Wird direkt von der deutschen Steuerlast abgezogen\n' +
    '• Betrag steht im Steuerbescheid',

  // Sozialversicherung
  rv_an:
    'Arbeitnehmer-Anteil der gesetzlichen Rentenversicherung.\n\n' +
    '• LStB Zeile 23a\n' +
    '• Aktueller Beitragssatz: 18,6% (je Hälfte AN/AG)\n' +
    '• Seit 2023 zu 100% als Sonderausgabe absetzbar\n\n' +
    'Bei DBA (Auslandsarbeit): Die LStB enthält nur den deutschen Anteil. Den korrekten (höheren) Wert findest du in den Jahressummen auf dem Dezember-Lohnschein.',

  rv_ag:
    'Arbeitgeber-Anteil der gesetzlichen Rentenversicherung.\n\n' +
    '• LStB Zeile 22a\n' +
    '• Wird für die Vorsorge-Berechnung benötigt\n' +
    '• Formel: (AN + AG) × Abzugssatz − AG-Anteil = absetzbar\n\n' +
    'Bei DBA (Auslandsarbeit): Die LStB enthält nur den deutschen Anteil. Den korrekten (höheren) Wert findest du in den Jahressummen auf dem Dezember-Lohnschein.',

  kv_an_gesamt:
    'Gesamter Arbeitnehmer-Anteil der Krankenversicherung inkl. Zusatzbeitrag und evtl. Wahltarife.\n\n' +
    '• Bildet die Basis für die abziehbare KV (nach 4%-Kürzung)\n' +
    '• Wenn gesamt ≠ regulär: Der reguläre Teil dient als Basis für die 4%-Kürzung',

  kv_an_regulaer:
    'Regulärer Arbeitnehmer-Anteil der Krankenversicherung.\n\n' +
    '• LStB Zeile 25\n' +
    '• Wird um 4% gekürzt (Krankengeld-Anteil) und dann voll abgesetzt\n' +
    '• Bei privater KV: der Basisbeitrag\n\n' +
    'Bei DBA (Auslandsarbeit): Die LStB enthält nur den deutschen Anteil. Den korrekten (höheren) Wert findest du in den Jahressummen auf dem Dezember-Lohnschein.',

  pv_an:
    'Arbeitnehmer-Anteil der Pflegeversicherung.\n\n' +
    '• LStB Zeile 26\n' +
    '• Kinderlose über 23 zahlen einen Zuschlag\n' +
    '• Wird vollständig als Sonderausgabe abgesetzt\n\n' +
    'Bei DBA (Auslandsarbeit): Die LStB enthält nur den deutschen Anteil. Den korrekten (höheren) Wert findest du in den Jahressummen auf dem Dezember-Lohnschein.',

  weitere_versicherungen:
    'Sonstige Vorsorgeaufwendungen (Anlage Vorsorgeaufwand, Zeile 46–52).\n\n' +
    '• Private Haftpflichtversicherung\n' +
    '• Zahnzusatzversicherung, Krankenzusatzversicherung\n' +
    '• Kfz-Haftpflicht (nur Haftpflicht-Anteil, nicht Kasko)\n' +
    '• Unfallversicherung, Berufsunfähigkeitsversicherung\n' +
    '• Risikolebensversicherung\n\n' +
    'Nur absetzbar, wenn die Vorsorge-Höchstgrenze (1.900 € bei AN / 2.800 € bei Selbständigen) nicht durch KV/PV ausgeschöpft ist. Bei gesetzlich Versicherten meist kein Spielraum — bei privat Versicherten kann es sich lohnen.',

  spenden:
    'Spenden an gemeinnützige Organisationen.\n\n' +
    '• Maximal 20% des Gesamtbetrags der Einkünfte absetzbar\n' +
    '• Spendenbescheinigung erforderlich (bei Kleinspenden bis 300 € reicht der Kontoauszug)\n' +
    '• Parteispenden sind separat begünstigt',

  // Werbungskosten
  fahrt_tage:
    'Anzahl der Tage, an denen du tatsächlich zur Arbeitsstätte gefahren bist.\n\n' +
    '• Nicht: Homeoffice-Tage, Urlaub, Krankheit, Feiertage\n' +
    '• Maximum realistisch: ca. 230 Arbeitstage\n' +
    '• Das Finanzamt prüft bei hohen Werten → konservativ bleiben',

  entfernung_km:
    'Einfache Entfernung (kürzeste Straßenverbindung) zwischen Wohnung und Arbeit.\n\n' +
    '• 0,30 €/km für die ersten 20 km\n' +
    '• 0,38 €/km ab dem 21. km (seit 2022)\n' +
    '• Nur einfache Strecke, nicht Hin- und Rückweg\n' +
    '• Gilt unabhängig vom Verkehrsmittel (auch bei ÖPNV)',

  homeoffice_tage:
    'Tage, an denen du ausschließlich von zu Hause gearbeitet hast.\n\n' +
    '• 5 €/Tag (2020–2022), 6 €/Tag (ab 2023)\n' +
    '• Max. 120 Tage (2020–2022), max. 210 Tage (ab 2023)\n' +
    '• Homeoffice und Fahrt zur Arbeit schließen sich gegenseitig aus\n' +
    '• Kein separates Arbeitszimmer nötig',

  arbeitsmittel:
    'Ausgaben für beruflich genutzte Gegenstände.\n\n' +
    '• Laptop, Monitor, Schreibtisch, Bürostuhl, Fachliteratur\n' +
    '• Bis 800 € netto sofort absetzbar (GWG)\n' +
    '• Darüber: Abschreibung über Nutzungsdauer\n' +
    '• Belege aufbewahren!',

  sonstige_werbungskosten:
    'Weitere berufsbedingte Ausgaben, die nicht in die anderen Felder passen.\n\n' +
    '• Internetkosten (20% der Rechnung, max. 20 €/Monat = 240 €/Jahr)\n' +
    '• Kontoführungsgebühren (16 € pauschal)\n' +
    '• Verpflegungsmehraufwand bei Dienstreisen (14 €/28 € pro Tag)\n' +
    '• Fortbildungskosten, Fachliteratur\n' +
    '• Gewerkschaftsbeiträge\n' +
    '• Berufskleidung (nur typische Berufskleidung)\n' +
    '• Bewerbungskosten, Umzugskosten',

  haushaltsnahe_dienstleistungen:
    'Kosten für haushaltsnahe Dienstleistungen (Arbeitskosten, nicht Material).\n\n' +
    '• Reinigung, Gartenpflege, Kinderbetreuung, Pflegedienst\n' +
    '• 20% der Kosten werden direkt von der Steuerlast abgezogen\n' +
    '• Maximum: 20.000 € Kosten → 4.000 € Steuerermäßigung\n' +
    '• Zahlung muss per Überweisung erfolgen (nicht bar)',

  handwerkerleistungen:
    'Arbeitskosten für Handwerker im eigenen Haushalt.\n\n' +
    '• Maler, Elektriker, Klempner, Fliesenleger etc.\n' +
    '• 20% der Arbeitskosten (nicht Materialkosten) abziehbar\n' +
    '• Maximum: 6.000 € Kosten → 1.200 € Steuerermäßigung\n' +
    '• Rechnung muss Arbeitskosten separat ausweisen',

  // Allgemein & Bescheid
  steuerklasse:
    'Deine Lohnsteuerklasse bestimmt die Höhe des monatlichen Lohnsteuerabzugs.\n\n' +
    '• Klasse 1: Ledige, Geschiedene, Verwitwete\n' +
    '• Klasse 3/5: Verheiratete (Kombination)\n' +
    '• Klasse 4: Verheiratete (gleiche Einkommen)\n' +
    '• Hat keinen Einfluss auf die Jahressteuer — nur auf die monatliche Vorauszahlung',

  verheiratet:
    'Familienstand am 31.12. des Steuerjahres.\n\n' +
    '• Verheiratet → Zusammenveranlagung mit Splittingtarif möglich\n' +
    '• Splittingtarif: zvE wird halbiert, Steuer berechnet, dann verdoppelt\n' +
    '• Lohnt sich besonders bei unterschiedlich hohen Einkommen',

  kinder:
    'Anzahl der Kinder (steuerlich berücksichtigt).\n\n' +
    '• Beeinflusst den Pflegeversicherungs-Zuschlag\n' +
    '• Kinderlose über 23 zahlen einen PV-Zuschlag von 0,6%\n' +
    '• Kinderfreibetrag vs. Kindergeld wird automatisch geprüft',

  guenstigerpruefung:
    'Automatischer Vergleich: Abgeltungsteuer (25%) vs. persönlicher Steuersatz.\n\n' +
    '• Wenn dein persönlicher Steuersatz unter 25% liegt, ist die Günstigerprüfung vorteilhaft\n' +
    '• Das Finanzamt prüft das automatisch und wählt die günstigere Variante\n' +
    '• Relevant bei niedrigem Einkommen oder hohen Kapitalerträgen',

  erstattung_bescheid:
    'Erstattung (+) oder Nachzahlung (−) laut deinem Steuerbescheid.\n\n' +
    '• Positiv: Du bekommst Geld zurück\n' +
    '• Negativ: Du musst nachzahlen\n' +
    '• Dient dem Abgleich: Rechner-Ergebnis vs. tatsächlicher Bescheid',

  nachzahlungszinsen:
    'Zinsen nach § 233a AO bei verspäteter Steuerfestsetzung.\n\n' +
    '• 0,15% pro Monat (1,8% p.a.) seit 2019\n' +
    '• Beginnen 15 Monate nach Ablauf des Steuerjahres\n' +
    '• Können auch Erstattungszinsen sein (zu deinen Gunsten)',

  verspaetungszuschlag:
    'Zuschlag bei verspäteter Abgabe der Steuererklärung.\n\n' +
    '• Mindestens 25 € pro angefangenem Monat der Verspätung\n' +
    '• Maximal 25.000 € oder 10% der festgesetzten Steuer\n' +
    '• Abgabefrist: 31.7. des Folgejahres (mit Steuerberater: 28/29.2. des übernächsten Jahres)',
};

// ---------------------------------------------------------------------------
// Ergebnis-Seite – berechnete Felder
// ---------------------------------------------------------------------------

export const TOOLTIPS_ERGEBNIS: Record<string, string> = {
  werbungskosten:
    'Summe der abziehbaren Werbungskosten.\n\n' +
    '• Entfernungspauschale + Homeoffice + Arbeitsmittel + Sonstiges\n' +
    '• Mindestens die Werbungskostenpauschale (1.230 € ab 2023)\n' +
    '• Wenn die Einzelnachweise höher sind, wird die Summe verwendet',

  sonderausgaben:
    'Summe der abziehbaren Vorsorgeaufwendungen und Sonderausgaben.\n\n' +
    '• Rentenversicherung: (AN + AG) × Abzugssatz − AG-Anteil\n' +
    '• Krankenversicherung: Beitrag minus 4% Krankengeld-Anteil\n' +
    '• Pflegeversicherung: voller Beitrag\n' +
    '• Spenden und weitere Versicherungen (bis zur Höchstgrenze)',

  einkuenfte_arbeit:
    'Zwischensumme: Brutto minus Werbungskosten minus Sonderausgaben.\n\n' +
    '• Basis für die weitere Berechnung\n' +
    '• Krypto-Einkünfte und Kapitalerträge kommen separat dazu',

  zvE_inland:
    'Das zu versteuernde Einkommen (nur Inlandseinkünfte).\n\n' +
    '• Entscheidende Größe für die Einkommensteuer\n' +
    '• Auslandseinkünfte fließen nur in den Steuersatz ein (Progressionsvorbehalt)\n' +
    '• Wird auf volle Euro abgerundet',

  effektiver_steuersatz:
    'Gesamte Steuerlast geteilt durch das Bruttoeinkommen.\n\n' +
    '• Zeigt die tatsächliche Steuerbelastung in Prozent\n' +
    '• Niedriger als der Grenzsteuersatz (der nur den letzten Euro betrifft)\n' +
    '• Nützlich für den Jahresvergleich',

  einkommensteuer:
    'Einkommensteuer nach dem Grundtarif (oder Splittingtarif bei Verheirateten).\n\n' +
    '• Berechnet nach § 32a EStG mit 5 Tarifzonen\n' +
    '• Bei Auslandseinkünften: mit Progressionsvorbehalt (höherer Steuersatz)',

  steuerlast_gesamt:
    'Komplette Steuerlast: ESt + Soli + KiSt + KapESt − Ermäßigungen.\n\n' +
    '• Das ist der Betrag, den du insgesamt schuldig bist\n' +
    '• Steuerermäßigungen nach § 35a werden hier abgezogen',

  gezahlte_steuer:
    'Summe aller bereits geleisteten Steuerzahlungen.\n\n' +
    '• Lohnsteuer + Soli Lohn + KiSt Lohn\n' +
    '• + KapESt + Soli Kapital\n' +
    '• + Steuern auf Krypto (falls vorhanden)',

  erstattung_nachzahlung:
    'Differenz zwischen Steuerlast (Soll) und bereits gezahlter Steuer (Ist).\n\n' +
    '• Positiv = Erstattung (Finanzamt zahlt dir zurück)\n' +
    '• Negativ = Nachzahlung (du musst nachzahlen)\n' +
    '• Typisch: Erstattung bei Steuerklasse 1 mit Werbungskosten > Pauschale',

  abweichung_bescheid:
    'Differenz zwischen deiner Berechnung und dem Steuerbescheid.\n\n' +
    '• 0 € = perfekte Übereinstimmung\n' +
    '• 1–10 € = normale Rundungsdifferenz\n' +
    '• > 10 € = Eingabefehler oder abweichende Berechnung prüfen',

  zinsen_zuschlaege:
    'Nachzahlungszinsen (§ 233a AO) und Verspätungszuschläge.\n\n' +
    '• Werden vom Finanzamt separat festgesetzt\n' +
    '• Erhöhen die tatsächliche Nachzahlung',
};

// ---------------------------------------------------------------------------
// Banken-Tab
// ---------------------------------------------------------------------------

export const TOOLTIPS_BANKEN: Record<string, string> = {
  kapitalertraege:
    'Brutto-Kapitalerträge laut Jahressteuerbescheinigung der Bank.\n\n' +
    '• Dividenden, Zinsen, realisierte Kursgewinne\n' +
    '• Vor Abzug von Sparer-Pauschbetrag und Steuern\n' +
    '• Bei Gemeinschaftskonten: den vollen Betrag eintragen (Aufteilung erfolgt automatisch)',

  sparer_pauschbetrag:
    'Genutzter Sparer-Pauschbetrag bei dieser Bank.\n\n' +
    '• Entspricht dem Freistellungsauftrag (oder dem tatsächlich genutzten Teil)\n' +
    '• Steht auf der Jahressteuerbescheinigung',

  kapitalertragsteuer:
    'Von der Bank abgeführte Kapitalertragsteuer (25%).\n\n' +
    '• Wird in der Steuererklärung gegengerechnet\n' +
    '• Bei vollständig genutztem Pauschbetrag: 0 €',

  invstg_56:
    'Bestandsgeschützte Alt-Anteile nach § 56 InvStG.\n\n' +
    '• Betrifft Fondsanteile, die vor dem 1.1.2009 gekauft wurden\n' +
    '• Gewinne sind bis 100.000 € steuerfrei\n' +
    '• Wird von der Kapitalerträge-Basis abgezogen',

  estg_23_banken:
    'Krypto-Veräußerungsgewinne/-verluste aus CoinTracking.\n\n' +
    '• Nur Verkäufe innerhalb der 1-Jahres-Haltefrist\n' +
    '• Positive Werte = Gewinn, negative = Verlust\n' +
    '• Verluste werden mit dem §23-Verlustvortrag verrechnet',

  estg_22_banken:
    'Krypto-Einkünfte aus Staking, Airdrops und Lending.\n\n' +
    '• Aus CoinTracking oder eigener Aufstellung\n' +
    '• Fließt als sonstige Einkünfte ins zvE\n' +
    '• Freigrenze: 256 € pro Jahr',

  estg_20_banken:
    'Krypto-Termingeschäfte (Margin, Futures) aus CoinTracking.\n\n' +
    '• Verluste können mit Kapitalerträgen verrechnet werden (seit JStG 2024)\n' +
    '• Positive Werte erhöhen die Kapitaleinkünfte\n' +
    '• Negative Werte bauen den §20-Verlustvortrag auf',

  typ:
    'Art des Kontos bestimmt die steuerliche Behandlung.\n\n' +
    '• Einzel: 100% der Erträge werden dir zugerechnet\n' +
    '• Gemeinschaft 50%: Nur die Hälfte fließt in deine Berechnung\n' +
    '• Krypto: Spezialbehandlung für §23/§22/§20-Einkünfte\n' +
    '• Ignorieren: Wird nicht in die Berechnung einbezogen',
};
