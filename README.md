# Daily Timer fuer Scrum Dailies

Eine schlanke, responsive Web-App fuer Scrum-Dailies mit zwei Live-Timern:
- Gesamtzeit des Dailies
- verbleibende Redezeit der aktuellen Person

Alles laeuft rein im Frontend, ohne Backend.

## Features

- Konfigurierbare Gesamtzeit (Default: `15` Minuten)
- Konfigurierbare Anzahl Personen
- Live-Countdown fuer die Gesamtzeit
- Live-Countdown fuer die aktuelle sprechende Person
- Button `Person fertig` fuer den Wechsel zur naechsten Person
- Dynamische Neuberechnung der Redezeit pro Person nach jeder beendeten Person
- Ueberziehungsanzeige: Timer laufen ins Negative und werden rot markiert
- Responsive Layout fuer Desktop und Mobile

## Zeitlogik

Die Redezeit pro Person wird immer neu berechnet:

`Zeit pro Person = verbleibende Gesamtzeit / verbleibende Personen`

Dadurch bleibt die Verteilung fair, auch wenn einzelne Personen kuerzer oder laenger sprechen.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)

Keine externen Frameworks, kein Build-Prozess, kein Backend.

## Projektstruktur

```text
.
├── index.html   # Markup und Seitenstruktur
├── styles.css   # Design, Layout, Responsive Styles
└── app.js       # Timer-Logik und UI-Zustand
```

## Lokal starten

Da ES Modules verwendet werden, am besten ueber einen lokalen HTTP-Server starten:

```bash
python3 -m http.server 4173
```

Danach im Browser:

`http://127.0.0.1:4173`

## Bedienung

1. Gesamtzeit in Minuten eintragen (oder Default `15` lassen).
2. Anzahl Personen eintragen.
3. `Daily starten` klicken.
4. Nach jedem Beitrag `Person fertig` klicken.
5. Falls jemand ueberzieht, laeuft die Zeit negativ weiter und wird rot.
6. Mit `Zuruecksetzen` eine neue Runde starten.

Hinweis: Waehrend des laufenden Dailies wird der Setup-Bereich ausgeblendet.

## Deployment auf GitHub Pages

Das Projekt ist statisch und kann direkt auf GitHub Pages deployed werden:

1. Repository nach GitHub pushen.
2. In GitHub zu `Settings` > `Pages` gehen.
3. Unter `Build and deployment` `Deploy from a branch` waehlen.
4. Branch `main` und Ordner `/ (root)` auswaehlen.
5. Speichern und warten, bis die URL bereitsteht.

## Qualitaet und Best Practices

- Klare Trennung von Struktur (HTML), Styling (CSS) und Logik (JS)
- Expliziter UI-State fuer sauberes Zustandsmanagement
- Validierung der Eingaben
- Lesbarer, modularer Code mit kleinen Funktionen
- Keine Abhaengigkeit von Drittanbieter-Bibliotheken

## Moegliche Erweiterungen

- Akustisches Signal bei Ablauf der Redezeit
- Tastatur-Shortcuts (z. B. Space fuer `Person fertig`)
- Export von Session-Statistiken
- Optionaler Dark-/Light-Theme-Switch
