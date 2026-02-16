# Daily Timer für Scrum Dailies

Deutsch | English

## English

### Overview

A lightweight, responsive web app for Scrum dailies with two live timers:
- total daily time
- remaining speaking time for the current speaker


Everything runs fully in the frontend, with no backend.

### Demo
https://nightshifty.github.io/dailytimer/

### Features

- Configurable total time (default: `15` minutes)
- Configurable number of people (default: `13`)
- Live countdown for total time
- Live countdown for the current speaker
- `Person fertig` button to move to the next speaker
- Dynamic recalculation after each finished speaker:
  `time per person = remaining total time / remaining people`
- Live adjustment of people count during an active daily using `+` and `-`
- Overtime indicators:
  - last 10 seconds: yellow bar
  - below 0 seconds: red bar
  - below -10 seconds: blinking red bar (only while total time is still >= 0)
- Farewell screen after completion with:
  - `Danke für eure Zeit`
  - `Happy Hacking`

### Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)

No frameworks, no build step, no backend.

### Project Structure

```text
.
├── index.html   # Markup and page structure
├── styles.css   # Design, layout, responsive styles
└── app.js       # Timer logic and UI state
```

### Run Locally

```bash
python3 -m http.server 4173
```

Then open:

`http://127.0.0.1:4173`

### Usage

1. Enter total time and number of people.
2. Click `Daily starten`.
3. Click `Person fertig` after each update.
4. If someone joins late or drops out, adjust people count live with `+`/`-`.
5. Use `Zurücksetzen` to start a new round.

### Deploy to GitHub Pages

This is a static project and can be deployed directly on GitHub Pages:

1. Push the repository to GitHub.
2. Open `Settings` > `Pages`.
3. In `Build and deployment`, choose `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for the site URL.

---

## Deutsch

### Überblick

Eine schlanke, responsive Web-App für Scrum-Dailies mit zwei Live-Timern:
- Gesamtzeit des Dailies
- verbleibende Redezeit der aktuell sprechenden Person

Alles läuft rein im Frontend, ohne Backend.

### Demo
https://nightshifty.github.io/dailytimer/

### Funktionen

- Konfigurierbare Gesamtzeit (Default: `15` Minuten)
- Konfigurierbare Anzahl Personen (Default: `13`)
- Live-Countdown für die Gesamtzeit
- Live-Countdown für die aktuelle Person
- Button `Person fertig` für den Wechsel zur nächsten Person
- Dynamische Neuberechnung nach jeder beendeten Person:
  `Zeit pro Person = verbleibende Gesamtzeit / verbleibende Personen`
- Live-Anpassung der Personenzahl während des laufenden Dailies über `+` und `-`
- Überziehungsanzeige:
  - letzte 10 Sekunden: gelbe Leiste
  - unter 0 Sekunden: rote Leiste
  - unter -10 Sekunden: blinkende rote Leiste (nur solange die Gesamtzeit noch >= 0 ist)
- Abschiedsbildschirm nach Abschluss mit:
  - `Danke für eure Zeit`
  - `Happy Hacking`

### Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)

Keine externen Frameworks, kein Build-Prozess, kein Backend.

### Projektstruktur

```text
.
├── index.html   # Markup und Seitenstruktur
├── styles.css   # Design, Layout, responsive Styles
└── app.js       # Timer-Logik und UI-Zustand
```

### Lokal starten

```bash
python3 -m http.server 4173
```

Danach im Browser:

`http://127.0.0.1:4173`

### Bedienung

1. Gesamtzeit und Personenanzahl eintragen.
2. `Daily starten` klicken.
3. Nach jedem Beitrag `Person fertig` klicken.
4. Falls jemand zu spät kommt oder wegfällt, Personenzahl live mit `+`/`-` anpassen.
5. Mit `Zurücksetzen` eine neue Runde starten.

### Deployment auf GitHub Pages

Das Projekt ist statisch und kann direkt auf GitHub Pages deployed werden:

1. Repository nach GitHub pushen.
2. In GitHub zu `Settings` > `Pages` gehen.
3. Unter `Build and deployment` `Deploy from a branch` wählen.
4. Branch `main` und Ordner `/ (root)` auswählen.
5. Speichern und warten, bis die URL bereitsteht.

### Qualität

- Klare Trennung von Struktur (HTML), Styling (CSS) und Logik (JS)
- Expliziter UI-State für sauberes Zustandsmanagement
- Validierung der Eingaben
- Lesbarer, modularer Code

