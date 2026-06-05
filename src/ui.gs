// src/ui.gs

// Zentrale Konstante für alle Tooltip-Texte

const TOOLTIP_TEXTE = {

  // ============================================================
  // LOHN & GEHALT
  // ============================================================

  'Bruttoarbeitslohn':
    'Dein gesamtes Bruttogehalt aus Deutschland für das Steuerjahr – VOR Abzug von Steuern und Sozialabgaben.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB) deines Arbeitgebers, Zeile 3.\n'
    + '  Die LStB bekommst du im Januar des Folgejahres, oder du rufst sie in ELSTER ab.\n\n'
    + 'WICHTIG – HÄUFIGER FEHLER:\n'
    + '• Nur das DEUTSCHE Gehalt eintragen.\n'
    + '• Auslandsgehalt (z. B. Frankreich) gehört NICHT hierher – das trägt du separat\n'
    + '  unter "Auslandseinkünfte brutto (lt. Bescheid)" ein.\n'
    + '• Nie den Wert vom monatlichen Gehaltszettel nehmen – die Summe der Monatszettel\n'
    + '  kann durch Nachberechnungen von der LStB abweichen.\n\n'
    + 'BEISPIEL: Du verdienst 44.217 € in Deutschland → 44.217 € eintragen.',

  'Lohnsteuer (lt. LStB)':
    'Die Lohnsteuer, die dein Arbeitgeber das ganze Jahr über direkt an das Finanzamt abgeführt hat.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 4.\n\n'
    + 'HINWEISE:\n'
    + '• Den exakten Wert mit Cents eintragen (z. B. 6.568,00 €).\n'
    + '• Das Script rundet intern automatisch auf volle Euro (wie das Finanzamt es macht) –\n'
    + '  du musst nicht selbst runden.\n'
    + '• Dieser Wert ist eine Vorauszahlung auf deine echte Einkommensteuer. Die Differenz\n'
    + '  ergibt deine Erstattung oder Nachzahlung.',

  'Solidaritätszuschlag Lohn (lt. LStB)':
    'Der Solidaritätszuschlag, den dein Arbeitgeber auf deine Lohnsteuer einbehalten hat.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 6.\n\n'
    + 'HINWEISE:\n'
    + '• Seit 2021 zahlen die meisten Arbeitnehmer keinen Soli mehr → 0 € eintragen.\n'
    + '• Nur bei sehr hohen Einkommen (Einzelperson: ESt > 17.543 €/Jahr) fällt noch Soli an.\n'
    + '• NICHT verwechseln mit dem Soli auf Kapitalerträge – der steht weiter unten.\n\n'
    + 'TIPP: Bei den meisten Menschen steht hier 0.',

  'Kirchensteuer Lohn (lt. LStB)':
    'Kirchensteuer auf dein Arbeitseinkommen, vom Arbeitgeber abgeführt.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 7 (ev.) oder Zeile 8 (rk.).\n\n'
    + 'HINWEISE:\n'
    + '• Nur relevant wenn du Mitglied einer Kirche bist.\n'
    + '• Satz: 8 % der Lohnsteuer in Bayern/BW, 9 % in den anderen Bundesländern.\n'
    + '• Wer nicht kirchensteuerpflichtig ist → 0 € eintragen.',

  // ============================================================
  // KAPITALERTRÄGE & KRYPTO
  // ============================================================

  'Kapitalerträge gesamt (lt. Broker)':
    'Alle Kapitalerträge des Jahres aus deinen Bankkonten und Broker-Depots.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Jahressteuerbescheinigung deiner Bank / deines Brokers (nicht der monatliche Kontoauszug).\n'
    + '  Wenn du mehrere Banken hast: alle Beträge addieren.\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Zinsen (Tagesgeld, Festgeld, Anleihen)\n'
    + '• Dividenden aus Aktien und ETFs\n'
    + '• Realisierte Gewinne aus Aktien-/ETF-Verkäufen\n'
    + '• Sonstige §20-Erträge\n\n'
    + 'WICHTIG – HÄUFIGER FEHLER:\n'
    + 'Dieser Wert ist der BRUTTOBETRAG, bevor der Sparer-Pauschbetrag (lt. Broker) abgezogen wird.\n'
    + 'Beispiel: Broker-Bescheinigung zeigt 1.190,29 € → 1.190,29 € eintragen.\n\n'
    + 'Das Finanzamt kann auf einem anderen Wert landen (z. B. 1.076 €), weil es intern\n'
    + 'noch weitere Verrechnungen vornimmt, die du nicht siehst. Deshalb gibt es das Feld\n'
    + '"Steuerpflichtige Kapitalerträge (lt. Bescheid)" für die genaue Nachprüfung.',

  'Sparer-Pauschbetrag (lt. Broker)':
    'Der steuerfreie Freibetrag für Kapitalerträge.\n\n'
    + 'MAXIMALE BETRÄGE:\n'
    + '• Bis 2022: 801 € (Einzelperson), 1.602 € (zusammenveranlagt)\n'
    + '• Ab 2023:  1.000 € (Einzelperson), 2.000 € (zusammenveranlagt)\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Jahressteuerbescheinigung deines Brokers / deiner Bank.\n'
    + '  Dort steht, wie viel des Pauschbetrags tatsächlich genutzt wurde.\n\n'
    + 'HINWEIS:\n'
    + 'Wenn du mehrere Banken hast, wird der Pauschbetrag aufgeteilt.\n'
    + 'Trag die SUMME aller genutzten Anteile ein (maximal der gesetzliche Höchstbetrag).',

  'Steuerpflichtige Kapitalerträge (lt. Bescheid)':
    'Der Betrag, den das Finanzamt nach ALLEN Verrechnungen als steuerpflichtig ansetzt.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid, Seite mit "Berechnung der Einkünfte nach § 32d EStG".\n'
    + '  Der Bescheid zeigt dort z. B.:\n'
    + '  "Kapitalerträge: 1.076 €\n'
    + '   – laufende Verluste (Termingeschäfte): 103 €\n'
    + '   – Sparer-Pauschbetrag (lt. Broker): 801 €\n'
    + '   = steuerpflichtig: 172 €"\n'
    + '  → 172 € eintragen.\n\n'
    + 'WANN AUSFÜLLEN?\n'
    + '• Wenn der Steuerbescheid bereits vorliegt: diesen Wert eintragen für exakte\n'
    + '  Übereinstimmung mit dem Bescheid.\n'
    + '• Wenn der Bescheid noch nicht da ist: LEER lassen. Das Script schätzt dann\n'
    + '  aus "Kapitalerträge gesamt (lt. Broker)" + "§20 KAP" – Sparer-Pauschbetrag (lt. Broker).\n\n'
    + 'WARUM WEICHT DIESER WERT AB?\n'
    + 'Das Finanzamt verrechnet intern Verluste aus verschiedenen Quellen und kann\n'
    + 'andere Freibeträge anwenden, die du in den Broker-Bescheinigungen nicht siehst.',

  'Abgeltungsteuer gezahlt (lt. Bescheid)':
    'Die Kapitalertragsteuer, die das Finanzamt als bereits bezahlt anerkennt.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ STEUERBESCHEID (nicht die Broker-Bescheinigung!)\n'
    + '  Im Bescheid steht z. B. unter "ab Kapitalertragsteuer: 74 €" → 74 € eintragen.\n\n'
    + 'WICHTIG – HÄUFIGER FEHLER:\n'
    + 'Broker-Ausweis ≠ Bescheid-Wert!\n'
    + 'Beispiel 2022: Broker hat 97,49 € einbehalten, Bescheid setzt aber nur 74 € an.\n'
    + 'Der Unterschied (23,49 €) entsteht, weil der Broker keine Kenntnis von deinen\n'
    + 'Verlusten bei anderen Banken hat und deshalb zu viel einbehält.\n'
    + 'Das Finanzamt verrechnet alles zentral und erstattet die Differenz.\n\n'
    + 'WANN BROKER-WERT NEHMEN?\n'
    + 'Nur wenn noch kein Bescheid vorliegt (Vorabschätzung). Sobald der Bescheid\n'
    + 'da ist, immer den Bescheid-Wert nehmen.',

  'Solidaritätszuschlag Kapital (lt. Bescheid)':
    'Der Soli auf deine Kapitalertragsteuer – separat ausgewiesen.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid (empfohlen), oder Broker-Jahressteuerbescheinigung.\n\n'
    + 'WICHTIG – wie bei der Abgeltungsteuer:\n'
    + 'Wenn der Bescheid vorliegt, den Bescheid-Wert nehmen – nicht den Broker-Wert.\n'
    + 'Beispiel: Broker hat 7,49 € abgeführt, Bescheid setzt 4,03 € an → 4,03 € eintragen.\n\n'
    + 'HINTERGRUND: Der Soli auf Kapitalerträge wird immer erhoben (kein Freibetrag\n'
    + 'wie beim Soli auf Arbeitseinkommen). Er beträgt 5,5 % der Kapitalertragsteuer.',

  'Kirchensteuer Kapital (lt. Bescheid)':
    'Kirchensteuer auf Kapitalerträge, vom Broker einbehalten.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Jahressteuerbescheinigung deines Brokers.\n\n'
    + 'HINWEIS: Nur relevant für Kirchenmitglieder. Die meisten tragen hier 0 ein.',

  'Einkünfte aus privaten Veräußerungsgeschäften (§ 23 EStG)':
    'Gewinne oder Verluste aus dem Verkauf von Kryptowährungen (und anderen\n'
    + 'Wirtschaftsgütern) innerhalb der 1-jährigen Haltefrist.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ CoinTracking oder ähnliche Krypto-Steuersoftware → "Einkünfte aus privaten\n'
    + '  Veräußerungsgeschäften nach § 23 EStG".\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Krypto-Verkäufe innerhalb der 1-Jahres-Haltefrist (Gewinn oder Verlust)\n'
    + '• Andere private Veräußerungsgeschäfte (z. B. Gold, Fremdwährungen)\n\n'
    + 'WICHTIGE BESONDERHEIT – VERLUSTE:\n'
    + 'Wenn du hier einen VERLUST (negativer Wert) einträgst, mindert dieser\n'
    + 'dein zvE NICHT. Ein §23-Verlust wird als separater "Verlustvortrag" festgestellt\n'
    + 'und kann nur mit künftigen §23-GEWINNEN verrechnet werden.\n'
    + 'Das Script berücksichtigt das korrekt (sofern "Verlustvorträge anwenden" = ja).\n\n'
    + 'FREIGRENZE: Bis 600 € Gewinn pro Jahr ist der gesamte Betrag steuerfrei\n'
    + '(ab 2024: 1.000 €).\n\n'
    + 'BEISPIEL 2022: CoinTracking zeigt –1.244,36 € → –1244,36 eintragen.\n'
    + 'Das Script ignoriert diesen Verlust für die zvE-Berechnung (korrekt).',

  'Einkünfte aus sonstigen Leistungen (§ 22 Nr. 3 EStG)':
    'Sonstige steuerpflichtige Einnahmen, die nicht unter Arbeitslohn oder Kapitalerträge fallen.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid: "Sonstige Einkünfte" oder\n'
    + '→ CoinTracking: "Sonstige Einkünfte nach § 22 Nr. 3 EStG"\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Krypto-Staking-Erträge (z. B. ETH Staking Rewards)\n'
    + '• Krypto-Airdrops (soweit steuerpflichtig)\n'
    + '• Krypto-Lending-Zinsen\n'
    + '• Gelegentliche Leistungen (z. B. einmalige Vermittlungsprovisionen)\n\n'
    + 'HINWEIS ZUR GENAUIGKEIT:\n'
    + 'CoinTracking kann leicht abweichen vom Bescheid-Wert, weil das FA\n'
    + 'Airdrops manchmal anders bewertet. Wenn der Bescheid vorliegt,\n'
    + 'lieber den Bescheid-Wert nehmen (z. B. 844 statt 848,53 €).\n\n'
    + 'FREIGRENZE § 22 Nr. 3: Bis 256 € Gewinn pro Jahr steuerfrei.',

  'Krypto Termingeschäfte (§ 20 EStG)':
    'Zusätzliche Kapitalerträge oder -verluste aus Kryptogeschäften, die nicht in der\n'
    + 'normalen Broker-Bescheinigung enthalten sind.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ CoinTracking: "Einkünfte aus Kapitalvermögen nach § 20 EStG"\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Verluste aus Margin- / Derivate- / Futures-Geschäften auf Krypto-Börsen\n'
    + '  (werden mit Krypto-Termingewinn verrechnet, max. 20.000 €/Jahr)\n'
    + '• Liquidity Mining Erträge (soweit §20)\n'
    + '• Devisenhandel-Ergebnisse\n\n'
    + 'WIRKUNG:\n'
    + 'Negative Werte (Verluste) REDUZIEREN die steuerpflichtigen Kapitalerträge.\n'
    + 'Beispiel 2022: Margin-Verlust –102,75 € → reduziert Kapitalerträge um 102,75 €.\n'
    + 'Das Finanzamt zeigt das im Bescheid als "laufende Verluste aus Termingeschäften".\n\n'
    + 'WENN KEIN KRYPTO-HANDEL: 0 eintragen.',

  'Steuern auf Krypto gezahlt (lt. Bescheid)':
    'Steuern, die du selbst direkt für Krypto-Gewinne gezahlt hast\n'
    + '(z. B. Nachzahlung nach Steuerbescheid für Krypto-Einkünfte).\n\n'
    + 'Bei den meisten: 0 eintragen.',

  // ============================================================
  // AUSLANDSARBEIT
  // ============================================================

  'Auslandseinkünfte brutto (lt. Bescheid)':
    'Dein Bruttoeinkommen aus Frankreich (oder einem anderen DBA-Land).\n\n'
    + 'WAS IST DAS?\n'
    + 'Wenn du zeitweise in Frankreich arbeitest, ist dieses Einkommen in Deutschland\n'
    + 'STEUERFREI (Doppelbesteuerungsabkommen). Es wird aber trotzdem für die\n'
    + 'Berechnung deines deutschen Steuersatzes herangezogen – das nennt sich\n'
    + '"Progressionsvorbehalt" (§ 32b EStG).\n\n'
    + 'WO FINDEST DU DEN RICHTIGEN WERT?\n'
    + '→ Im Steuerbescheid steht explizit:\n'
    + '  "... habe ich X € in die Berechnung des Steuersatzes einbezogen"\n'
    + '  → Genau diesen Wert eintragen.\n\n'
    + 'WICHTIG – HÄUFIGER FEHLER:\n'
    + '• Das FA nutzt den BRUTTOBETRAG – nicht den Nettobetrag nach\n'
    + '  Abzug der französischen Sozialversicherung.\n'
    + '• Beispiel: 1.373 € Brutto eintragen, nicht 1.172 € (nach SV-Abzug).\n\n'
    + 'WENN NOCH KEIN BESCHEID:\n'
    + 'Den Bruttobetrag aus dem Frankreich-Gehaltszettel nehmen.',

  'Auslands-SV-Beitrag AN (lt. Gehaltszettel)':
    'Die Sozialversicherungsbeiträge, die du im Ausland als Arbeitnehmer gezahlt hast\n'
    + '(z. B. französische Sécurité Sociale).\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Gehaltszettel vom ausländischen Arbeitgeber.\n\n'
    + 'WIRKUNG IM SCRIPT:\n'
    + 'Dieser Wert wird GESPEICHERT aber nicht vom Auslandsbrutto abgezogen –\n'
    + 'weil das FA für den Progressionsvorbehalt den Bruttobetrag verwendet.\n'
    + 'Der Wert dient nur zur Dokumentation.',

  'Anrechenbare Auslandssteuer (lt. Bescheid)':
    'Die im Ausland gezahlte Einkommensteuer, die auf die deutsche ESt angerechnet wird.\n\n'
    + 'NUR relevant bei der ANRECHNUNGSMETHODE (§ 34c EStG).\n\n'
    + 'WANN EINTRAGEN?\n'
    + '→ Frankreich (und viele andere Länder): Anrechnungsmethode\n'
    + '  Die im Ausland gezahlte Steuer wird direkt von der deutschen ESt abgezogen.\n'
    + '  Wert steht im Steuerbescheid oder auf dem ausländischen Lohnzettel.\n\n'
    + 'WANN LEER LASSEN / 0?\n'
    + '→ Österreich: Freistellungsmethode\n'
    + '  Die AT-Einkünfte sind in DE komplett steuerfrei (nur Progressionsvorbehalt).\n'
    + '  Die österreichische Steuer wurde bereits über den Lohnschein verrechnet\n'
    + '  (z.B. Oktober 2025: –187,28 € Differenzauszahlung). Kein Eintrag nötig.\n\n'
    + 'WIRKUNG IM SCRIPT:\n'
    + 'Wird direkt von der berechneten deutschen ESt abgezogen (§ 34c EStG).\n'
    + 'Beispiel: DE-ESt 8.000 € – anrechenbare FR-Steuer 500 € = 7.500 € zu zahlen.',

  // ============================================================
  // SOZIALVERSICHERUNG DE
  // ============================================================

  'RV-Beitrag AN (lt. LStB)':
    'Dein Arbeitnehmer-Anteil an der gesetzlichen Rentenversicherung.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 22.\n\n'
    + 'WICHTIG:\n'
    + '• Exakt mit Cents eintragen (z. B. 4.084,50 €) – nicht runden!\n'
    + '  Schon 50 Cent Unterschied können zu 1 € Abweichung beim berechneten\n'
    + '  Sonderausgabenabzug führen.\n'
    + '• Nie den monatlichen Gehaltszettel nehmen – Jahreswert von der LStB.\n\n'
    + 'HINTERGRUND: Das Script berechnet daraus den abziehbaren Vorsorgebetrag:\n'
    + '(AN-RV + AG-RV) × 94% – AG-RV = abziehbare Rentenversicherung.',

  'KV-Beitrag AN gesamt (lt. LStB)':
    'Dein gesamter Krankenversicherungsbeitrag als Arbeitnehmer im Steuerjahr.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 25.\n\n'
    + 'WARUM "inkl. Vormonate"?\n'
    + 'Manchmal werden Beiträge aus Vormonaten nachgezogen – diese erscheinen\n'
    + 'ebenfalls auf der LStB und sind im Jahreswert bereits enthalten.\n\n'
    + 'WICHTIG: Nie den Jahreswert selbst aus den Monatsabrechnungen addieren –\n'
    + 'immer den LStB-Wert nehmen.',

  'KV-Beitrag AN regulär (lt. LStB)':
    'Dein KV-Beitrag genau wie er auf der Lohnsteuerbescheinigung steht.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 25.\n\n'
    + 'HINWEIS: Oft identisch mit "KV-Beitrag gesamt". Relevant bei Arbeitgeberwechsel\n'
    + 'innerhalb des Jahres, wenn die erste LStB einen anderen Wert zeigt.',

  'PV-Beitrag AN (lt. LStB)':
    'Dein Arbeitnehmer-Anteil an der gesetzlichen Pflegeversicherung.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 27.\n\n'
    + 'WICHTIG – HÄUFIGER FEHLER:\n'
    + 'Nicht verwechseln mit dem PV-Beitrag AG (lt. LStB)!\n'
    + 'Das Finanzamt zieht für den Sonderausgabenabzug nur deinen\n'
    + 'AN-Anteil heran.\n\n'
    + 'HINWEIS: Kinderlose zahlen seit 2005 einen Zuschlag (+0,6 % bzw. ab 2023 +0,6 %).\n'
    + 'Das ist bereits in dem Wert auf deiner LStB enthalten.',

  'RV-Beitrag AG (lt. LStB)':
    'Der Rentenversicherungsbeitrag, den dein Arbeitgeber für dich zahlt.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung (LStB), Zeile 22a, oder\n'
    + '→ Als Faustregel: identisch mit deinem AN-RV-Beitrag (50/50-Teilung).\n\n'
    + 'WICHTIG:\n'
    + '• Exakt mit Cents eintragen (z. B. 4.084,50 €).\n'
    + '• Dieser Betrag wird vom Script intern abgezogen, um den\n'
    + '  steuerlich abziehbaren RV-Anteil zu berechnen.\n'
    + '  (Formel: round((AN+AG) × 94%) – floor(AG) = abziehbare RV)',

  'KV-Beitrag AG (lt. LStB)':
    'Der Krankenversicherungsbeitrag, den dein Arbeitgeber zahlt.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung oder Gehaltszettel.\n\n'
    + 'HINWEIS: Dieser Wert fließt aktuell nicht in die SA-Berechnung ein,\n'
    + 'wird aber der Vollständigkeit halber erfasst.',

  'PV-Beitrag AG (lt. LStB)':
    'Der Pflegeversicherungsbeitrag, den dein Arbeitgeber für dich zahlt.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung oder Gehaltszettel.\n\n'
    + 'HINWEIS: Beim Arbeitgeber-Anteil gibt es keinen Kinderlosenzuschlag\n'
    + '(dieser trägt nur der Arbeitnehmer).',

  'Weitere Versicherungen (lt. Belege)':
    'Beiträge für private Vorsorgeversicherungen, die zusätzlich zu KV und PV\n'
    + 'steuerlich absetzbar sein können.\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Berufsunfähigkeitsversicherung (BU)\n'
    + '• Private Unfallversicherung (nur Privatanteil)\n'
    + '• Risikolebensversicherung\n'
    + '• Haftpflichtversicherung (Privatanteil)\n\n'
    + 'WICHTIG – HÖCHSTBETRAG:\n'
    + 'Diese Versicherungen sind nur abziehbar, wenn deine KV+PV-Beiträge\n'
    + 'den gesetzlichen Höchstbetrag noch nicht ausschöpfen.\n'
    + 'Das Script prüft das automatisch.\n\n'
    + 'BEI DEN MEISTEN: 0 €, weil die KV-Beiträge bereits den Höchstbetrag überschreiten.',

  'Spenden (lt. Belege)':
    'Geldspenden an gemeinnützige Organisationen im Steuerjahr.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Deine Zuwendungsbestätigungen (Spenden (lt. Belege)quittungen) sammeln.\n\n'
    + 'WAS IST ABSETZBAR?\n'
    + '• Spenden (lt. Belege) an gemeinnützige Vereine, Kirchen, Parteien\n'
    + '• Bis 300 € akzeptiert das FA auch Kontoauszüge\n'
    + '• Über 300 € braucht man eine offizielle Zuwendungsbestätigung\n\n'
    + 'HÖCHSTBETRAG: 20 % des Gesamtbetrags der Einkünfte.',

  // ============================================================
  // WERBUNGSKOSTEN
  // ============================================================

  'Tage mit Fahrt zur Arbeit':
    'Anzahl der Arbeitstage, an denen du tatsächlich zur ersten Tätigkeitsstätte\n'
    + 'gefahren bist (NICHT die Homeoffice-Tage).\n\n'
    + 'WAS ZÄHLT?\n'
    + '• Jeder Tag an dem du ins Büro gefahren bist – egal ob mit Auto, Bahn oder Fahrrad.\n'
    + '• Nur die EINFACHE Fahrt zählt pro Tag (nicht hin und zurück).\n\n'
    + 'WIE ERMITTELN WENN NICHT MEHR BEKANNT?\n'
    + '→ Im alten Steuerbescheid nachschauen – das FA rechnet die Pauschale vor:\n'
    + '  z. B. "60 Tage × 5 km × 0,30 €/km = 90 €" → 60 Fahrtage.\n\n'
    + 'WICHTIG: Fahrtage und Homeoffice-Tage dürfen sich nicht überschneiden.\n'
    + 'Ein Tag ist entweder ein Bürotag oder ein Homeoffice-Tag.',

  'Einfache Entfernung zur Arbeit (km)':
    'Die kürzeste zumutbare Strecke (einfach) zwischen Wohnung und Arbeitsplatz.\n\n'
    + 'WIE ERMITTELN?\n'
    + '→ Google Maps oder ähnliche Routenplaner – kürzeste zumutbare Route.\n'
    + '→ Oder im alten Steuerbescheid nachschauen.\n\n'
    + 'TARIFE (Entfernungspauschale):\n'
    + '• 1.–20. km: 0,30 €/km (alle Jahre)\n'
    + '• Ab 21. km: 0,35 €/km (2022–2023), 0,38 €/km (ab 2024)\n\n'
    + 'WICHTIG: Nur die EINFACHE Strecke eingeben – nicht verdoppeln.\n'
    + 'Das Script rechnet automatisch: Tage × km × Pauschalsatz.',

  'Homeoffice-Tage':
    'Tage, an denen du AUSSCHLIESSLICH von zu Hause gearbeitet hast.\n\n'
    + 'PAUSCHALE:\n'
    + '• 2020–2022: 5 €/Tag, max. 600 €/Jahr (= 120 Tage)\n'
    + '• Ab 2023:   6 €/Tag, max. 1.260 €/Jahr (= 210 Tage)\n\n'
    + 'WIE ERMITTELN WENN NICHT MEHR BEKANNT?\n'
    + '→ Im Steuerbescheid nachschauen – z. B. "Homeoffice: 600 €" → 120 Tage.\n\n'
    + 'WICHTIG:\n'
    + '• Nur reine Homeoffice-Tage zählen – kein zusätzliches Büro an diesem Tag.\n'
    + '• Fahrtage und Homeoffice-Tage dürfen sich nicht überschneiden.\n\n'
    + 'TIPP: Kalender oder E-Mail-Verlauf des Jahres hilft bei der Ermittlung.',

  'Arbeitsmittel (lt. Belege)':
    'Ausgaben für Gegenstände, die du überwiegend beruflich nutzt.\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Laptop / Computer (bei gemischter Nutzung: Berufsanteil schätzen, oft 50–100 %)\n'
    + '• Bildschirm, Tastatur, Maus, Headset\n'
    + '• Bürostuhl, Schreibtisch (Berufsanteil)\n'
    + '• Fachbücher, Fachliteratur\n'
    + '• Büromaterial (Stifte, Ordner etc.)\n\n'
    + 'GRENZEN:\n'
    + '• Bis 800 € netto (952 € brutto): sofort als WK absetzbar.\n'
    + '• Über 800 € netto: Abschreibung über Nutzungsdauer.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Deine Quittungen und Rechnungen aus dem Steuerjahr.\n'
    + '→ Oder im alten Bescheid nachschauen.',

  'Sonstige Werbungskosten (lt. Belege)':
    'Alle weiteren beruflichen Ausgaben, die kein eigenes Feld haben.\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Gewerkschaftsbeiträge (voll absetzbar)\n'
    + '• Kontoführungsgebühren: 16 €/Jahr pauschal ohne Nachweis\n'
    + '• Verpflegungsmehraufwand bei Dienstreisen:\n'
    + '  – Abwesenheit 8–24 Std.: 14 €/Tag (inländische Pauschale)\n'
    + '  – Abwesenheit über 24 Std.: 28 €/Tag\n'
    + '  – Minus: steuerfreie Arbeitgeber-Erstattung abziehen!\n'
    + '  – Im Bescheid als "Verpflegungsmehraufwand netto" ausgewiesen.\n'
    + '• Arbeitskleidung (nur typische Berufskleidung, keine Zivilkleidung)\n'
    + '• Fortbildungskosten (Kurs, Prüfung)\n\n'
    + 'TIPP: Bescheid vom Vorjahr anschauen – das FA schlüsselt die WK dort auf.\n'
    + 'Diese Summe direkt hier eintragen wenn die Ausgaben gleich geblieben sind.',

  'Haushaltsnahe Dienstleistungen (lt. Belege)':
    'Kosten für haushaltsnahe Dienstleistungen, von denen 20 % direkt von\n'
    + 'der Steuer abgezogen werden.\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Putzkraft / Haushaltshilfe\n'
    + '• Gartenpflege\n'
    + '• Kinderbetreuung (Babysitter, Au-pair) – nur Lohnanteil\n'
    + '• Pflegepersonal\n\n'
    + 'WICHTIG – HÄUFIGER FEHLER:\n'
    + 'Hier die GESAMTKOSTEN eintragen, NICHT den Steuerabzug!\n'
    + 'Das Script berechnet 20 % automatisch.\n'
    + 'Beispiel: Putzkraft kostet 110 € → 110 € eintragen → Steuerabzug: 22 €.\n\n'
    + 'HÖCHSTBETRAG: 20.000 € Kosten → max. 4.000 € Steuerabzug.\n'
    + 'Zahlung muss per Überweisung erfolgen (kein Bargeld!).',

  'Handwerkerleistungen (lt. Belege)':
    'Kosten für Handwerkerarbeiten in deinem Haushalt, von denen 20 % von\n'
    + 'der Steuer abgezogen werden.\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Maler, Tapezierer\n'
    + '• Installateur, Elektriker, Sanitär\n'
    + '• Schornsteinfeger\n'
    + '• Bodenbelag verlegen, Fliesen\n\n'
    + 'WICHTIG – HÄUFIGER FEHLER:\n'
    + 'Hier die GESAMTKOSTEN eintragen, NICHT den Steuerabzug!\n'
    + 'Und: nur der LOHNANTEIL der Rechnung zählt – kein Material!\n'
    + 'Beispiel: Rechnung 500 € (davon 78 € Lohn) → 78 € eintragen → Steuerabzug: 16 €.\n\n'
    + 'HÖCHSTBETRAG: 6.000 € Lohnkosten → max. 1.200 € Steuerabzug.\n'
    + 'Zahlung muss per Überweisung erfolgen.',

  // ============================================================
  // ALLGEMEINE ANGABEN
  // ============================================================

  'Steuerklasse':
    'Deine Lohnsteuerklasse, die bestimmt wie viel Lohnsteuer dein Arbeitgeber\n'
    + 'monatlich einbehält.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Lohnsteuerbescheinigung, oder deine Gehaltsabrechnungen.\n\n'
    + 'KLASSEN IM ÜBERBLICK:\n'
    + '• Klasse 1: Ledig, geschieden, verwitwet\n'
    + '• Klasse 2: Alleinerziehend\n'
    + '• Klasse 3: Verheiratet (Besserverdiener) – niedrigere Lohnsteuer\n'
    + '• Klasse 4: Verheiratet (beide ähnliches Einkommen)\n'
    + '• Klasse 5: Verheiratet (Geringverdiener) – höhere Lohnsteuer\n'
    + '• Klasse 6: Zweiter Arbeitgeber',

  'Verheiratet (ja/nein)':
    'Ob du im Steuerjahr verheiratet / in eingetragener Lebenspartnerschaft warst\n'
    + 'und zusammen veranlagt wirst.\n\n'
    + 'AUSWIRKUNGEN bei "ja":\n'
    + '• Splittingtarif (günstigerer Steuersatz)\n'
    + '• Doppelter Grundfreibetrag\n'
    + '• Doppelte Soli-Freigrenze\n'
    + '• Doppelter Sparer-Pauschbetrag (lt. Broker) (2.000 € statt 1.000 €)\n\n'
    + 'HINWEIS: "ja" nur wenn ihr tatsächlich zusammen veranlagt. Getrennte\n'
    + 'Veranlagung ist auch möglich (selten günstiger).',

  'Anzahl Kinder':
    'Anzahl deiner Kinder (für die du Anspruch auf Kindergeld / Kinderfreibetrag hattest).\n\n'
    + 'AUSWIRKUNG:\n'
    + '• Beeinflusst den Pflegeversicherungs-Zuschlag:\n'
    + '  Kinderlose über 23 Jahre zahlen +0,6 % PV-Beitrag (Kinderlosenzuschlag).',

  'Krankenversichert (gesetzlich/privat)':
    'Ob du gesetzlich oder privat krankenversichert bist.\n\n'
    + 'AUSWIRKUNG:\n'
    + '• Gesetzlich: KV-Beitrag aus der LStB direkt absetzbar.\n'
    + '• Privat: Nur der Anteil der Basisabsicherung ist absetzbar\n'
    + '  (entspricht dem GKV-Beitrag als Vergleichswert).\n\n'
    + 'Bei privater KV bitte Bescheinigung der PKV über abziehbare Beiträge nutzen.',

  'Günstigerprüfung (ja/nein)':
    'Soll das Script prüfen, ob dein persönlicher Einkommensteuersatz\n'
    + 'günstiger ist als die pauschale Abgeltungsteuer (25 %)?\n\n'
    + 'WAS PASSIERT BEI "ja"?\n'
    + 'Das Script berechnet automatisch BEIDE Varianten:\n'
    + 'Option A: Abgeltungsteuer (25% × steuerpflichtige Kapitalerträge)\n'
    + 'Option B: Kapitalerträge laufen durch den Einkommensteuertarif\n'
    + '→ Die günstigere Option wird automatisch gewählt.\n\n'
    + 'FÜR WEN IST DAS RELEVANT?\n'
    + 'Nur wenn dein persönlicher Steuersatz unter 25 % liegt – also bei\n'
    + 'niedrigem Gesamteinkommen. Bei einem Einkommen über ca. 20.000 €\n'
    + 'ist Abgeltungsteuer fast immer günstiger.\n\n'
    + '"ja" eintragen schadet nie – das Script wählt immer die bessere Option.',

  'Erstattung / Nachzahlung (lt. Bescheid)':
    'Der Betrag den das Finanzamt laut deinem Steuerbescheid erstattet\n'
    + 'oder nachfordert.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid Seite 1, ganz unten: "verbleibende Steuer" oder\n'
    + '  "zu wenig entrichtet" / "zu viel entrichtet".\n\n'
    + 'FORMAT:\n'
    + '• Erstattung (du bekommst Geld): positiver Wert eintragen\n'
    + '• Nachzahlung (du musst zahlen): negativer Wert eintragen (z. B. –507,33)\n\n'
    + 'WOZU DIENT DIESES FELD?\n'
    + 'Nur zum Vergleich – zeigt wie genau das Script ist ("Abweichung zum Bescheid").\n'
    + 'Hat keinen Einfluss auf die eigentliche Steuerberechnung.',

  'Nachzahlungszinsen § 233a AO (lt. Bescheid)':
    'Nachzahlungszinsen, die das Finanzamt zusätzlich zur Steuer festsetzt.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid: Seite mit "Berechnung der Zinsen nach § 233a AO".\n\n'
    + 'WANN ENTSTEHEN ZINSEN?\n'
    + '• Wenn die Steuererklärung zu spät abgegeben wird (Karenzzeit: 15 Monate)\n'
    + '• Zinssatz: 1,8 % pro Jahr (seit November 2022)\n\n'
    + 'WENN KEINE ZINSEN: 0 eintragen.',

  'Verspätungszuschlag (lt. Bescheid)':
    'Zuschlag des Finanzamts bei verspäteter Abgabe der Steuererklärung.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid: wird separat ausgewiesen.\n\n'
    + 'WENN KEIN ZUSCHLAG: 0 eintragen.',

  // ============================================================
  // AUSGABE-SHEET "STEUER"
  // ============================================================

  'Bruttoarbeitslohn (Inland)':
    'Dein gesamtes Bruttogehalt aus Deutschland für das Steuerjahr.\n\n'
    + 'Direkt aus dem Steuerdaten-Tab übernommen (Zeile "Bruttoarbeitslohn").\n'
    + 'Dient hier nur zur Orientierung – zeigt die Ausgangsbasis bevor\n'
    + 'Werbungskosten und Sonderausgaben abgezogen werden.',

  'Sonderausgaben (Vorsorge + Spenden)':
    'Die Summe der steuerlich abziehbaren Vorsorgeaufwendungen und Spenden.\n\n'
    + 'ENTHÄLT:\n'
    + '• Abziehbare Rentenversicherung (AN+AG-Anteil × Abzugsquote – AG)\n'
    + '• Abziehbare Krankenversicherung (KV – 4 % Krankengeldanteil)\n'
    + '• Pflegeversicherung AN-Anteil\n'
    + '• Weitere Versicherungen (soweit abziehbar)\n'
    + '• Spenden',

  '§23 Veräußerungsgewinne/-verluste (brutto)':
    'Das laufende Ergebnis aus Krypto-Veräußerungen dieses Jahres, VOR Verrechnung\n'
    + 'mit dem Verlustvortrag.\n\n'
    + 'Positiv = Gewinn (erhöht zvE, soweit steuerpflichtig)\n'
    + 'Negativ = Verlust (erhöht den Verlustvortrag für Folgejahre)\n\n'
    + 'Quelle: CoinTracking → §23 EStG Veräußerungsgewinne',

  '§23 Verlustvortrag verrechnet':
    'Der Teil des Verlustvortrags aus Vorjahren, der mit dem diesjährigen\n'
    + '§23-Gewinn verrechnet wurde.\n\n'
    + '0 wenn Schalter "Verlustvorträge anwenden" = nein\n'
    + '0 wenn kein Gewinn oder kein Vortrag vorhanden\n\n'
    + 'Beispiel: Vortrag 2.284 €, Gewinn 1.708 € → verrechnet: 1.708 €',

  '§23 steuerpflichtig (nach Vortrag)':
    'Der Betrag aus §23-Veräußerungsgewinnen, der tatsächlich ins zvE eingeht.\n\n'
    + 'Nach Abzug des verrechneten Verlustvortrags. Immer ≥ 0 –\n'
    + 'Verluste können das zvE nicht senken.\n\n'
    + 'Dieser Wert erscheint auch im Steuerbescheid unter "Sonstige Einkünfte\n'
    + '→ Einkünfte aus privaten Veräußerungsgeschäften".',

  '§23 Verlustvortrag verbleibend (Ende Jahr)':
    'Der Verlustvortrag der am Ende dieses Jahres noch vorhanden ist –\n'
    + 'und im Folgejahr weiter genutzt werden kann.\n\n'
    + 'BERECHNUNG:\n'
    + '  Vortrag Anfang Jahr\n'
    + '+ neu entstandene Verluste dieses Jahres\n'
    + '– verrechneter Gewinn dieses Jahres\n'
    + '= Vortrag Ende Jahr\n\n'
    + 'Dieser Wert sollte mit dem "Verlustfeststellungsbescheid" des FA übereinstimmen.',

  '§22 Einkünfte aus sonstigen Leistungen':
    'Steuerpflichtige Einkünfte aus Staking, Airdrops, Lending etc.\n\n'
    + 'Geht direkt (ohne Verlustverrechnung) ins zvE ein.\n'
    + 'Freigrenze: 256 € pro Jahr – unter dieser Grenze steuerfrei.',

  '§20 Termingeschäfte laufend (brutto)':
    'Das laufende Ergebnis aus Krypto-Termingeschäften (Margin, Futures, Derivate)\n'
    + 'dieses Jahres, VOR Verrechnung mit dem Verlustvortrag.\n\n'
    + 'Negativ = Verlust → erhöht den §20-Verlustvortrag für Folgejahre\n'
    + 'Positiv = Gewinn → wird gegen Verlustvortrag verrechnet, verbleibender\n'
    + 'Betrag ist steuerpflichtig und erhöht die Kapitalertragsbasis',

  '§20 Verlustvortrag verrechnet':
    'Der Teil des §20-Verlustvortrags aus Vorjahren, der mit dem diesjährigen\n'
    + '§20-Termingeschäfts-Gewinn verrechnet wurde.\n\n'
    + '0 wenn Schalter "Verlustvorträge anwenden" = nein\n'
    + '0 wenn kein Gewinn oder kein Vortrag vorhanden\n\n'
    + 'WICHTIG: §20-Verluste können NUR mit §20-Termingeschäfts-Gewinnen\n'
    + 'verrechnet werden – nicht mit normalen Kapitalerträgen (Zinsen, ETF).',

  '§20 steuerpflichtig (nach Vortrag)':
    'Der Betrag aus §20-Termingeschäften, der tatsächlich die steuerpflichtigen\n'
    + 'Kapitalerträge erhöht (nach Abzug des Verlustvortrags).\n\n'
    + 'Positiv: erhöht die Kapitalbasis → mehr Abgeltungsteuer\n'
    + 'Negativ: reduziert die Kapitalbasis → weniger Abgeltungsteuer\n\n'
    + 'Dieser Wert wird im Bescheid als "laufende Verluste aus Termingeschäften"\n'
    + 'oder "Einkünfte aus Termingeschäften" ausgewiesen.',

  '§20 Verlustvortrag verbleibend (Ende Jahr)':
    'Der §20-Termingeschäfts-Verlustvortrag der am Ende dieses Jahres\n'
    + 'noch vorhanden ist.\n\n'
    + 'WICHTIG: Dieser Vortrag kann NUR mit §20-Termingeschäfts-GEWINNEN\n'
    + 'verrechnet werden – NICHT mit normalen Kapitalerträgen (Zinsen, ETF-Gewinne)!\n\n'
    + 'Praktisch relevant sobald du wieder Termingeschäfts-Gewinne hast.',

  '− Werbungskosten':
    'Deine beruflich bedingten Ausgaben, die vom Bruttoarbeitslohn abgezogen werden.\n\n'
    + 'Das Script berechnet: Entfernungspauschale + Homeoffice + Arbeitsmittel + Sonstiges.\n'
    + 'Mindestens wird immer der Arbeitnehmer-Pauschbetrag (1.000 € bis 2021, 1.200 € ab 2022)\n'
    + 'angesetzt, auch wenn deine tatsächlichen Kosten niedriger sind.\n\n'
    + 'Details findest du in den Eingabefeldern unter "Werbungskosten & Haushalt".',

  '− Sonderausgaben':
    'Vorsorgeaufwendungen und Spenden, die dein zu versteuerndes Einkommen reduzieren.\n\n'
    + 'ENTHÄLT:\n'
    + '• Rentenversicherung (abzugsfähiger Anteil: AN + AG abzüglich steuerfreiem AG-Anteil)\n'
    + '• Krankenversicherung (ohne 4 % Krankengeldanteil)\n'
    + '• Pflegeversicherung (AN-Anteil)\n'
    + '• Weitere Versicherungen (Haftpflicht etc., soweit Platz unter 1.900 €-Deckel)\n'
    + '• Spenden\n\n'
    + 'Details in den Eingabefeldern unter "Sozialversicherung".',

  '= Einkünfte aus Arbeit (Zwischensumme)':
    'Zwischenergebnis: Dein Arbeitseinkommen nach Abzug aller Werbungskosten und Sonderausgaben.\n\n'
    + 'BERECHNUNG:\n'
    + 'Bruttoarbeitslohn − Werbungskosten − Sonderausgaben\n\n'
    + 'Hinweis: Sonstige Einkünfte (§23, §22) werden noch addiert,\n'
    + 'und das Auslandsgehalt erhöht den Steuersatz (Progressionsvorbehalt).\n'
    + 'Das vollständige zvE siehst du unten unter "Zu versteuerndes Einkommen (Inland)".',

  'Kapitalerträge (Basis vor Pauschbetrag)':
    'Die Summe aller Kapitalerträge dieses Jahres als Berechnungsbasis,\n'
    + 'bevor der Sparer-Pauschbetrag abgezogen wird.\n\n'
    + 'ENTHÄLT:\n'
    + '• Kapitalerträge aus Banken/Broker (bereinigt um §56 InvStG)\n'
    + '• §20 Termingeschäfte (nach Verlustverrechnung)\n'
    + '• Broker-interne Verlustverrechnungen\n\n'
    + 'Wenn "Steuerpflichtige Kapitalerträge (lt. Bescheid)" befüllt ist,\n'
    + 'wird dieser Wert nicht weiter verwendet.',

  'Steuerpflichtige Kapitalerträge (§ 32d EStG)':
    'Der Betrag der tatsächlich der Abgeltungsteuer unterliegt.\n\n'
    + '= max(Kapitalerträge Basis – Sparer-Pauschbetrag, 0)\n\n'
    + 'Wenn der Steuerbescheid vorliegt: immer mit dem Bescheid-Wert vergleichen.\n'
    + 'Bei Abweichung → "Steuerpflichtige Kapitalerträge (lt. Bescheid)" im\n'
    + 'Steuerdaten-Tab befüllen (grün färben).',

  'Kapitalertragsteuer (25 %)':
    '25 % Abgeltungsteuer auf die steuerpflichtigen Kapitalerträge.\n\n'
    + 'Wenn Günstigerprüfung greift (persönlicher Satz < 25 %):\n'
    + '→ Kapital läuft durch den Tarif → hier 0 €, dafür höheres zvE.',

  'Auslandseinkommen (Progressionsvorbehalt)':
    'Dein steuerfreies Auslandseinkommen (z. B. Frankreich), das trotzdem\n'
    + 'deinen deutschen Steuersatz erhöht (§ 32b EStG Progressionsvorbehalt).\n\n'
    + 'Dieser Betrag geht NICHT ins zvE – er erhöht nur den Prozentsatz,\n'
    + 'der auf dein deutsches Einkommen angewendet wird.',

  'Gesamteinkommen für Steuersatzermittlung':
    'zvE (Inland) + Auslandseinkommen – Basis für die Ermittlung des\n'
    + 'effektiven Steuersatzes.\n\n'
    + 'Bei Günstigerprüfung: enthält auch die steuerpflichtigen Kapitalerträge.',

  'Zu versteuerndes Einkommen (Inland)':
    'Dein gesamtes steuerpflichtiges Einkommen aus Deutschland nach allen Abzügen.\n\n'
    + 'BERECHNUNG:\n'
    + 'Bruttoarbeitslohn\n'
    + '– Werbungskosten\n'
    + '+ §23 steuerpflichtig (nach Vortrag)\n'
    + '+ §22 Einkünfte\n'
    + '– Sonderausgaben\n'
    + '= Zu versteuerndes Einkommen',

  'Einkommensteuer (nach Progressionsvorbehalt)':
    'Die Einkommensteuer auf dein deutsches Einkommen, berechnet mit dem\n'
    + 'durch Auslandsgehalt erhöhten Steuersatz.\n\n'
    + 'Formel: zvE (Inland) × effektiver Steuersatz\n'
    + 'Abzüglich haushaltsnahe Dienstleistungen und Handwerkerleistungen (§35a).',

  'Gesamte Steuerlast (Soll)':
    'Die Summe aller Steuern die du für dieses Jahr zahlen solltest.\n\n'
    + 'ENTHÄLT:\n'
    + '• Einkommensteuer (nach Progressionsvorbehalt und §35a-Abzügen)\n'
    + '• Kapitalertragsteuer\n'
    + '• Solidaritätszuschlag (auf ESt und KapESt)\n'
    + '• Kirchensteuer auf ESt (wenn kirchensteuerSatz > 0 in config.gs gesetzt)\n'
    + '• Zinsen und Verspätungszuschläge\n'
    + '• Abzüglich: anrechenbare Auslandssteuer (§ 34c EStG)',

  'Gezahlte Steuer (Ist)':
    'Die Summe aller Steuern, die du bereits bezahlt hast.\n\n'
    + 'ENTHÄLT:\n'
    + '• Lohnsteuer (vom Arbeitgeber abgeführt, gerundet)\n'
    + '• Soli auf Lohnsteuer\n'
    + '• Kirchensteuer Lohn (lt. LStB)\n'
    + '• Kirchensteuer Kapital (lt. Bescheid)\n'
    + '• Abgeltungsteuer (Bescheid-Wert!)\n'
    + '• Soli auf Kapitalerträge (Bescheid-Wert!)',

  'davon Zinsen und Zuschläge':
    'Nachzahlungszinsen (§ 233a AO) und Verspätungszuschläge laut Bescheid.\n\n'
    + 'Diese Beträge sind in "Gesamte Steuerlast (Soll)" enthalten.',

  'Soli auf Kapitalertragsteuer':
    '5,5 % Solidaritätszuschlag auf die Kapitalertragsteuer.\n\n'
    + 'BESONDERHEIT: Kein Freibetrag – der Soli auf Kapitalerträge wird immer\n'
    + 'berechnet, auch wenn du auf das Arbeitseinkommen keinen Soli mehr zahlst\n'
    + '(das ist seit 2021 für die meisten Arbeitnehmer der Fall).\n\n'
    + 'WENN GÜNSTIGERPRÜFUNG GREIFT:\n'
    + 'Dann 0 € hier – Kapital läuft durch den Tarif, Soli wird über die\n'
    + 'Einkommensteuer berechnet.',

  'Effektiver Steuersatz':
    'Der Steuersatz, mit dem dein deutsches Einkommen tatsächlich besteuert wird.\n\n'
    + 'WIE WIRD ER BERECHNET?\n'
    + '1. Fiktives Gesamteinkommen = zvE (DE) + Auslandseinkommen\n'
    + '2. Auf dieses Gesamteinkommen wird der Tarif-Steuersatz berechnet\n'
    + '3. Dieser Satz wird auf dein reines DE-Einkommen angewendet\n\n'
    + 'BEISPIEL:\n'
    + 'Ohne Auslandsgehalt: Steuersatz wäre 19,5 %\n'
    + 'Mit Auslandsgehalt:  Steuersatz steigt auf 21,3 %\n'
    + '→ Du zahlst mehr Steuern auf dein DE-Gehalt, obwohl das Auslandsgehalt\n'
    + '  selbst steuerfrei ist (Progressionsvorbehalt, § 32b EStG).',

  'Erstattung (+) / Nachzahlung (–)':
    'Das Ergebnis deiner Steuererklärung.\n\n'
    + 'POSITIVER WERT → Erstattung: Du bekommst Geld vom Finanzamt zurück.\n'
    + 'NEGATIVER WERT → Nachzahlung: Du musst nachzahlen.\n\n'
    + 'BERECHNUNG:\n'
    + 'Gezahlte Steuer (Ist) – Gesamte Steuerlast (Soll)\n\n'
    + 'BEISPIEL:\n'
    + 'Lohnsteuer gezahlt: 6.568 €\n'
    + 'Tatsächliche ESt:   5.687 €\n'
    + '→ Erstattung: +881 €\n\n'
    + 'Die Schriftfarbe zeigt das Ergebnis:\n'
    + 'Grün = Erstattung, Rot = Nachzahlung.',

  'Nicht berücksichtigte Vorsorgeaufwendungen':
    'Der Teil deiner Versicherungsbeiträge, der steuerlich NICHT absetzbar ist,\n'
    + 'weil der gesetzliche Höchstbetrag bereits überschritten ist.\n\n'
    + 'WAS IST DER HÖCHSTBETRAG?\n'
    + 'Als Arbeitnehmer mit gesetzlicher KV: 1.900 € für sonstige Vorsorgeaufwendungen\n'
    + '(Haftpflicht, BU etc.). Deine KV+PV-Beiträge übersteigen diesen Betrag deutlich,\n'
    + 'daher ist hier für die meisten Jahre 0 €.\n\n'
    + 'Der Wert ist für das Script aktuell ein Platzhalter und hat keinen\n'
    + 'Einfluss auf die Berechnung.',

  'Werbungskosten (inkl. Homeoffice)':
    'Die Summe aller deiner angesetzten Werbungskosten – also beruflich\n'
    + 'veranlasste Ausgaben, die dein zu versteuerndes Einkommen senken.\n\n'
    + 'BERECHNUNG:\n'
    + 'Entfernungspauschale (Fahrten zur Arbeit)\n'
    + '+ Homeoffice-Pauschale\n'
    + '+ Arbeitsmittel\n'
    + '+ Sonstige Werbungskosten\n'
    + '= Summe tatsächlicher WK\n\n'
    + 'MINDESTBETRAG (Arbeitnehmer-Pauschbetrag):\n'
    + '• 2019–2021: 1.000 €\n'
    + '• 2022–2025: 1.200 €\n'
    + 'Wenn deine tatsächlichen WK niedriger sind, setzt das FA automatisch\n'
    + 'den Pauschbetrag an.\n\n'
    + 'BEISPIEL: Entfernungspauschale 684 € + Homeoffice 600 € + Arbeitsmittel 209 €\n'
    + '= 1.493 € → liegt über 1.200 € → tatsächliche WK werden angesetzt.',

  'Sonderausgaben (Vorsorge + Spenden)':
    'Die Summe der steuerlich abziehbaren Vorsorgeaufwendungen und Spenden.\n\n'
    + 'ENTHÄLT:\n'
    + '• Rentenversicherung: (AN + AG) × Abzugsquote – AG-Anteil\n'
    + '  (Quote stieg von 88 % in 2019 auf 100 % ab 2023)\n'
    + '• Krankenversicherung: Gesamtbeitrag – 4 % Krankengeldanteil\n'
    + '• Pflegeversicherung: AN-Anteil\n'
    + '• Weitere Versicherungen (Haftpflicht etc.): nur soweit Platz unter 1.900 €-Deckel\n'
    + '• Spenden\n\n'
    + 'NICHT ENTHALTEN: Arbeitnehmer-Anteile die bereits als Werbungskosten zählen.',

  'Abweichung zum Bescheid':
    'Zeigt wie genau das Script mit dem echten Finanzamt-Bescheid übereinstimmt.\n\n'
    + 'INTERPRETATION:\n'
    + '0,00 €    → Perfekte Übereinstimmung ✔\n'
    + '1 – 5 €   → Sehr gut (typische Rundungseffekte)\n'
    + '5 – 10 €  → Akzeptabel, ggf. Eingaben prüfen\n'
    + 'Über 10 € → Eingabefehler wahrscheinlich → Werte gegenchecken\n\n'
    + 'FARBE: Grün = 0 €, Orange = 1–10 €, Rot = über 10 €\n\n'
    + 'VORAUSSETZUNG: Das Feld "Erstattung / Nachzahlung (lt. Bescheid)" im\n'
    + 'Steuerdaten-Tab muss ausgefüllt sein. Ohne diesen Wert bleibt die\n'
    + 'Abweichung leer.',

  // ============================================================
  // VERLUSTVORTRÄGE (neue Felder im Steuerdaten-Tab)
  // ============================================================

  'JStG 2024 §20 anwenden (ja/nein)':
    'Soll die neue §20-Verlustverrechnungsregel des Jahressteuergesetzes 2024\n'
    + 'angewendet werden?\n\n'
    + 'HINTERGRUND:\n'
    + 'Das JStG 2024 hat § 20 Abs. 6 EStG rückwirkend ab 2021 geändert:\n'
    + 'Die Verlustverrechnungsbeschränkung für Termingeschäfte (20.000 €-Deckel)\n'
    + 'entfällt. §20-Verluste können nun mit ALLEN Kapitalerträgen verrechnet werden\n'
    + '– nicht mehr nur mit Termingeschäfts-Gewinnen.\n\n'
    + 'AUSWIRKUNG bei "ja":\n'
    + 'Der kumulierte §20-Verlustvortrag wird direkt von der Kapitalertragsbasis\n'
    + 'abgezogen → weniger steuerpflichtige Kapitalerträge → weniger KapESt.\n\n'
    + 'AUSWIRKUNG bei "nein" (Standardfall / historische Bescheide):\n'
    + 'Alte Rechtslage: §20-Verluste nur gegen §20-Termingewinne verrechenbar.\n'
    + 'Für Vergleich mit älteren Bescheiden auf "nein" lassen.\n\n'
    + 'BEISPIEL (deine Situation):\n'
    + 'Vortrag 8.927,61 € bei "ja" → KapESt-Basis sinkt um bis zu 8.927,61 €\n'
    + '→ Steuerersparnis bis zu ~2.320 € (25% KapESt + Soli)\n\n'
    + 'HINWEIS: Die rückwirkende Anwendung erfordert ggf. Einspruch gegen alte\n'
    + 'Bescheide oder einen Änderungsantrag. Rechtslage mit StB klären.',

  'Verlustvorträge anwenden (ja/nein)':
    'Sollen die eingetragenen Verlustvorträge (§23 und §20) bei der Berechnung\n'
    + 'berücksichtigt werden?\n\n'
    + '"ja": Vorträge werden mit laufenden Gewinnen verrechnet\n'
    + '"nein": Berechnung wie wenn keine Vorträge existieren\n\n'
    + 'WANN "nein" sinnvoll:\n'
    + '• Abgleich mit alten Bescheiden, bei denen FA die Vorträge nicht anerkannt hat\n'
    + '• Prüfen wie groß der Steuereffekt der Vorträge ist\n\n'
    + 'AUTOMATISCHE FORTSCHREIBUNG:\n'
    + 'Das Script schreibt den "Vortrag verbleibend (Ende Jahr)" automatisch als\n'
    + '"Verlustvortrag (Vorjahre)" ins nächste Jahr – gelbe Zelle.',

  'Verlustvortrag § 23 EStG (Vorjahre)':
    'Der kumulierte Verlustvortrag aus §23-Veräußerungsverlusten aller Vorjahre.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid Vorjahr: "Gesonderte Feststellung des Verlustvortrags"\n'
    + '  oder: letzte "Verlustfeststellungsbescheid" des FA.\n\n'
    + 'WIE WIRD DER WERT ERMITTELT?\n'
    + '• 2021: –992,13 € Verlust → Vortrag = 992,13 €\n'
    + '• 2022: –1.292,40 € weiterer Verlust → kumuliert = 2.284,53 €\n'
    + '• 2023: Gewinn 1.707,76 € → Vortrag reduziert sich um 1.707,76 €\n'
    + '  → verbleibender Vortrag Ende 2023 = 576,77 €\n\n'
    + 'EINTRAGEN: Immer den POSITIVEN Betrag des verbleibenden Vortrags\n'
    + 'zu BEGINN des Steuerjahres (also den Vortrag aus dem Vorjahr).\n\n'
    + 'WIRKUNG IM SCRIPT:\n'
    + 'Reduziert laufende §23-Gewinne vor der Besteuerung.\n'
    + 'Beispiel 2023: Gewinn 1707,76 – Vortrag 2284,53 = –576,77 → stpfl. = 0\n'
    + 'Verluste werden NICHT auf das zvE angerechnet (nur auf §23-Gewinne).',

  'Verlustvortrag § 20 Termingeschäfte (Vorjahre)':
    'Der kumulierte Verlustvortrag aus §20-Termingeschäften (Margin, Futures, Derivate)\n'
    + 'zu BEGINN des Veranlagungsjahres.\n\n'
    + 'WICHTIG: Dieses Feld wird vom Script automatisch fortgeschrieben (gelbe Zelle).\n'
    + 'Du musst nur den Startwert für das erste Jahr mit Vortrag manuell eintragen.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Steuerbescheid: "Gesonderte Feststellung – Verlustvorträge §20 Abs. 6 EStG"\n\n'
    + 'VERLAUF BEI DIR (automatisch berechnet):\n'
    + '• 2021: 0 € Vortrag zu Jahresbeginn, Verlust –8.824,86 €\n'
    + '        → Vortrag Ende 2021: 8.824,86 €\n'
    + '• 2022: Vortrag 8.824,86 €, weiterer Verlust –102,75 €\n'
    + '        → Vortrag Ende 2022: 8.927,61 €\n'
    + '• 2023+: kein laufendes §20-Ergebnis\n'
    + '  OHNE JStG 2024: Vortrag bleibt bei 8.927,61 € (kein Termingewinn zum Verrechnen)\n'
    + '  MIT JStG 2024:  Vortrag schrumpft jährlich um die Kapitalerträge\n'
    + '                  2023: 8.927,61 – 1.186,87 = 7.740,74 €\n'
    + '                  2024: 7.740,74 – 1.143,44 = 6.597,30 €\n\n'
    + 'WARUM 2024 GESTIEGEN?\n'
    + 'Wenn du in deiner Tabelle gesehen hast, dass der Wert gestiegen ist, stammt\n'
    + 'das aus einem früheren Script-Lauf mit einem anderen Code-Stand.\n'
    + 'Einmal neu berechnen – das Script schreibt den richtigen Wert rein.',

  'Verlustvorträge anwenden (ja/nein)':
    'Steuert ob die Verlustvortrag-Felder (§ 23 und § 20) in der Berechnung\n'
    + 'berücksichtigt werden.\n\n'
    + '"ja"  → Verlustvorträge werden mit laufenden Gewinnen verrechnet.\n'
    + '        Verwenden wenn Vorträge vom Finanzamt festgestellt wurden\n'
    + '        oder für eine Soll-Berechnung (wie es richtig sein sollte).\n\n'
    + '"nein" → Verlustvorträge werden ignoriert.\n'
    + '         Verwenden um den IST-Zustand der alten Bescheide nachzubilden\n'
    + '         (Bescheide wurden ohne Vortrag erlassen → Abweichung = 0 €).\n\n'
    + 'TIPP: Schalte auf "ja" um zu sehen, wie viel Steuer bei korrekter\n'
    + 'Verlustverrechnung hätte gespart werden können.',

  // ============================================================
  // BANKEN-TAB SPALTEN
  // ============================================================

  'Typ (Banken-Tab)':
    'Art des Kontos – bestimmt wie das Script den Anteil berechnet.\n\n'
    + 'MÖGLICHE WERTE:\n'
    + '  Einzel            → normales Einzelkonto, voller Betrag wird verwendet\n'
    + '  Gemeinschaft 50%  → Gemeinschaftskonto mit einer weiteren Person (50/50)\n'
    + '                      Script halbiert automatisch alle Beträge\n'
    + '  Gemeinschaft 33%  → Gemeinschaftskonto zu dritt (je 1/3)\n'
    + '  Krypto            → CoinTracking-Zeile; Kapital/Abgelt/Soli werden ignoriert,\n'
    + '                      liest §20 KAP, §23, §22\n\n'
    + 'WARUM WICHTIG?\n'
    + 'Gemeinschaftskonten: Jeder Inhaber versteuert nur seinen Anteil.\n'
    + 'Wenn kein Freistellungsauftrag gestellt wurde, behält der Broker\n'
    + 'KapESt auf den vollen Betrag ein – aber im Bescheid rechnet das FA\n'
    + 'nur deinen hälftigen Anteil an.',

  'Kapitalerträge (Banken-Tab)':
    'Gesamte Kapitalerträge laut Jahressteuerbescheinigung dieser Bank.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Jahressteuerbescheinigung → Zeile 7 "Höhe der Kapitalerträge"\n\n'
    + 'WICHTIG: Den BRUTTO-Wert eintragen (vor Pauschbetrag und Verlustverrechnung).\n'
    + 'Bei Gemeinschaftskonten: Den VOLLEN Betrag laut Bescheinigung eintragen –\n'
    + 'das Script teilt automatisch durch den Anteilsfaktor aus Spalte Typ.',

  '§56 InvStG (bestandsgeschützte Alt-Anteile)':
    'Gewinne aus Investmentfonds, die VOR dem 01.01.2018 gekauft wurden.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Jahressteuerbescheinigung → Zeile 10:\n'
    + '  "Gewinne aus der Veräußerung bestandsgeschützter Alt-Anteile"\n\n'
    + 'Diese Gewinne sind bis zu einem Freibetrag von 100.000 € STEUERFREI.\n'
    + 'Das FA zieht diesen Betrag aus der Bemessungsgrundlage heraus.\n\n'
    + 'BEISPIEL 2022 Comdirect: 19,46 € → FA rechnet mit 1.088,13 – 19,46 = 1.068,67 €\n'
    + 'Wenn kein solcher Posten: leer lassen oder 0.',

  'Zugeflossen geltende Erträge (Z.19 KAP)':
    'Erträge aus ausländischen Investmentfonds, die als zugeflossen gelten\n'
    + 'aber noch nicht dem Steuerabzug unterworfen wurden.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ Jahressteuerbescheinigung → ganz unten, "nur nachrichtlich":\n'
    + '  "Summe der als zugeflossen geltenden, noch nicht dem Steuerabzug\n'
    + '   unterworfenen Erträge (§7 Abs. 1 Satz 1 Nr. 3 InvStG)"\n\n'
    + 'Das FA ADDIERT sie zur Kapitalertragsbasis.\n'
    + 'BEISPIEL 2022 Comdirect: 3,22 € → Basis + 3,22 €\n'
    + 'Wenn kein solcher Posten: leer lassen.',

  '§ 20\nTermin-\ngesch.':
    'Ergebnis aus Krypto-Termingeschäften (Margin, Futures, Derivate) aus CoinTracking.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ CoinTracking-Steuerreport → "1.2. Einkünfte aus Kapitalvermögen nach §20 EStG"\n'
    + '  → "Einkünfte aus Margin, Derivate, Futures"\n\n'
    + 'NUR IN KRYPTO-ZEILEN (Typ = Krypto). Normale Broker haben das intern verrechnet.\n\n'
    + 'NEGATIVE WERTE = Verluste → reduzieren steuerpflichtige Kapitalerträge.\n'
    + 'BEISPIEL 2022: –102,75 € → wurde im 2022er Bescheid direkt verrechnet.\n'
    + 'BEISPIEL 2021: –8.824,86 € → noch nicht festgestellt (Einspruch läuft).',

  'Verluste/Verrechnung (broker-intern)':
    'Broker-interne Verlustverrechnungen, die den gemeldeten Kapitalertrag\n'
    + 'bereits reduziert haben – ohne dass sie separat ausgewiesen werden.\n\n'
    + 'In den meisten Jahren: leer lassen oder 0.\n'
    + 'Nur relevant wenn du aus dem Broker-Bericht siehst dass Verluste\n'
    + 'intern verrechnet wurden die nicht in anderen Spalten stehen.',

  // NEU: Tooltips für die zwei neuen Banken-Tab-Spalten

  'Veräußerungsgewinne §23 (Banken-Tab)':
    'Krypto-Veräußerungsgewinne/-verluste aus CoinTracking für dieses Jahr.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ CoinTracking → "Einkünfte aus privaten Veräußerungsgeschäften nach § 23 EStG"\n'
    + '  → "Steuerrelevanter Veräußerungsgewinn/-verlust"\n\n'
    + 'SINNVOLL: In der Krypto-Zeile (Typ = Krypto) eintragen.\n\n'
    + 'WIRKUNG:\n'
    + '• Wird automatisch ins Steuerdaten-Tab übertragen (gelbe Zelle)\n'
    + '• Kann dort bei Bedarf manuell überschrieben werden (z. B. wenn StB anderen\n'
    + '  Wert nimmt oder Bescheid abweicht → Zelle grün färben)\n'
    + '• Verluste mindern das zvE NICHT – sie werden als Vortrag festgestellt\n\n'
    + 'FREIGRENZE: Bis 600 € Gewinn steuerfrei.\n\n'
    + 'BEISPIEL 2023: CoinTracking zeigt 1.707,76 € → 1707,76 eintragen.',

  'Sonstige Einkünfte §22 (Banken-Tab)':
    'Krypto-Staking, Airdrops und sonstige §22 Nr. 3-Einkünfte aus CoinTracking.\n\n'
    + 'WO FINDEST DU DEN WERT?\n'
    + '→ CoinTracking → "Sonstige Einkünfte nach § 22 Nr. 3 EStG"\n'
    + '  → "Steuerrelevante sonstige Einkünfte"\n\n'
    + 'SINNVOLL: In der Krypto-Zeile (Typ = Krypto) eintragen.\n\n'
    + 'WIRKUNG:\n'
    + '• Wird automatisch ins Steuerdaten-Tab übertragen (gelbe Zelle)\n'
    + '• Kann dort bei Bedarf manuell überschrieben werden (z. B. wenn Bescheid\n'
    + '  abweicht → Zelle grün färben)\n\n'
    + 'WAS GEHÖRT HIER REIN?\n'
    + '• Staking-Erträge (z. B. ETH, SOL Rewards)\n'
    + '• Steuerpflichtige Airdrops\n'
    + '• Lending-Zinsen auf Krypto-Plattformen\n\n'
    + 'FREIGRENZE: Bis 256 € Gewinn steuerfrei.\n\n'
    + 'BEISPIEL 2023: CoinTracking zeigt 794,02 € → 794,02 eintragen.'

};

/**
 * Fügt detaillierte Tooltips zu den Eingabezellen im Steuerdaten-Sheet hinzu.
 */

function steuerdatenTooltipsHinzufuegen() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_STEUERDATEN);

  if (!sheet) {
    throw new Error(`Sheet "${SHEET_STEUERDATEN}" nicht gefunden.`);
  }
  const daten = sheet.getDataRange().getValues();

  for (let i = 0; i < daten.length; i++) {
    const label = daten[i][0];

    if (TOOLTIP_TEXTE[label]) {
      sheet.getRange(i + 1, 1).setComment(TOOLTIP_TEXTE[label]);
    }
  }
}

/**
 * Setzt die Tooltips im Ziel-Sheet.
 * @param {Sheet} zielSheet Das Ziel-Sheet-Objekt.
 * @param {string[]} kategorieBezeichner Ein Array mit den Namen der Kategorien.
 */

function setZielSheetTooltips(zielSheet, kategorieBezeichner) {
  kategorieBezeichner.forEach((text, i) => {
    if (TOOLTIP_TEXTE[text]) {
      zielSheet.getRange(i + 2, 1).setComment(TOOLTIP_TEXTE[text]);
    }
  });
}

// ============================================================
// Banken-Tab Tooltips
// ============================================================

// Banken-Tab Tooltips werden über BANKEN_TOOLTIP_KEYS auf TOOLTIP_TEXTE gemappt.

/**
 * Setzt Tooltips auf die Kopfzeile des Banken-Tabs.
 */
// Tooltip-Keys für Banken-Tab-Spalten (Reihenfolge = BANKEN_SPALTEN)

const BANKEN_TOOLTIP_KEYS = [
  'Bank',
  'Typ (Banken-Tab)',
  'Jahr',
  'Kapitalerträge (Banken-Tab)',
  'Abgeltungsteuer gezahlt (lt. Bescheid)',
  'Solidaritätszuschlag Kapital (lt. Bescheid)',
  'Kirchensteuer Kapital (lt. Bescheid)',
  'Sparer-Pauschbetrag (lt. Broker)',
  '§56 InvStG (bestandsgeschützte Alt-Anteile)',
  'Zugeflossen geltende Erträge (Z.19 KAP)',
  'Verluste/Verrechnung (broker-intern)',
  'Krypto Termingeschäfte (§ 20 EStG)',
  'Veräußerungsgewinne §23 (Banken-Tab)',
  'Sonstige Einkünfte §22 (Banken-Tab)',
  'Notiz'
];

function setBankenTabTooltips(sheet) {
  BANKEN_TOOLTIP_KEYS.forEach((key, i) => {
    const text = TOOLTIP_TEXTE[key] || BANKEN_TOOLTIP_TEXTE[key];

    if (text) {
      sheet.getRange(1, i + 1).setComment(text);
    }
  });
}