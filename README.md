# Daily Timer für Scrum Dailies

Deutsch | English

## English

### Overview

Daily Timer is a lightweight, responsive web app for Scrum dailies.
It runs fully in the browser (no backend) and focuses on fast moderation with clear visual feedback.

### Demo

https://nightshifty.github.io/dailytimer/

### Feature Highlights

- Two live timers:
  - remaining total daily time
  - remaining speaking time of the current speaker
- Configurable total time (default: `15` minutes)
- Fixed crew management via settings modal (gear icon)
- Gear icon is visible on setup screen only (hidden during active session)
- Crew persistence in `localStorage`
- Crew sharing via URL (`?name=...`) with:
  - Web Share API when available
  - clipboard fallback when sharing is not available
- Presence selection before start (present/absent chips)
- Speaker flow via chips:
  - tap the next person to hand over
  - previous current speaker is moved to completed automatically
- Live rebalancing of speaking time after each handover
- Attendance updates during a running daily (add/remove late joiners)
- Overtime feedback:
  - warning state in the last 10 seconds
  - overdue state below 0 seconds
  - blinking overdue state for speaker timer after -10 seconds while total time is still >= 0
- Completion screen with:
  - `Danke für eure Zeit`
  - `Happy Hacking`
- Responsive controls:
  - desktop: floating action control centered at the bottom
  - mobile: sticky action bar at the bottom

### Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)

No framework, no build step, no backend.

### Project Structure

```text
.
|-- index.html   # Markup and layout
|-- styles.css   # Visual design and responsive behavior
`-- app.js       # State, timer logic, interaction flow
```

### Run Locally

```bash
python3 -m http.server 4173
```

Open:

`http://127.0.0.1:4173`

### Usage

1. (Optional) Open the settings modal via the gear icon and maintain your fixed crew.
2. Enter total minutes.
3. Mark who is present (chips in setup area).
4. Click `Daily starten`.
5. Start the round by selecting the first person in `Als Nächstes wählen`.
6. For each handover, tap the next person.
7. If somebody joins/leaves late, toggle them in `Heute im Daily (an/abwesend)`.
8. Use `Daily abbrechen` to stop early, or `Daily abschließen` when the last person is active.
9. After completion, use `Neue Runde starten`.

### Sharing Crew by Link

- Share from settings with `Teilen`.
- Or open the app directly with query params, for example:
  - `...?name=Max&name=Anna&name=Sam`
- URL-provided names are used for that page load and then can be saved to local storage.

### Deploy to GitHub Pages

This project is static and can be deployed directly on GitHub Pages:

1. Push repository to GitHub.
2. Open `Settings` > `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for the site URL.

---

## Deutsch

### Überblick

Daily Timer ist eine schlanke, responsive Web-App für Scrum-Dailies.
Alles läuft komplett im Browser (ohne Backend) und ist auf schnelle Moderation mit klarer Rückmeldung ausgelegt.

### Demo

https://nightshifty.github.io/dailytimer/

### Funktionsüberblick

- Zwei Live-Timer:
  - verbleibende Gesamtzeit des Dailies
  - verbleibende Redezeit der aktuell sprechenden Person
- Konfigurierbare Gesamtzeit (Default: `15` Minuten)
- Verwaltung einer festen Besatzung im Einstellungs-Modal (Zahnrad)
- Zahnrad nur im Startbildschirm sichtbar (während aktiver Session ausgeblendet)
- Persistenz der Besatzung in `localStorage`
- Teilen der Besatzung per URL (`?name=...`) mit:
  - Web Share API (wenn verfügbar)
  - Clipboard-Fallback
- An-/Abwesenheit vor dem Start per Chips
- Sprecherwechsel über Chips:
  - nächste Person antippen
  - vorherige aktuelle Person wird automatisch als fertig markiert
- Laufende Neuberechnung der Redezeit pro Person nach jedem Wechsel
- Anpassung der An-/Abwesenheit während des laufenden Dailies (auch für Nachzügler)
- Überziehungsanzeige:
  - Warnzustand in den letzten 10 Sekunden
  - Überziehung unter 0 Sekunden
  - blinkende Überziehung beim Sprecher-Timer unter -10 Sekunden (solange Gesamtzeit noch >= 0 ist)
- Abschlussbildschirm mit:
  - `Danke für eure Zeit`
  - `Happy Hacking`
- Responsives Bedienkonzept:
  - Desktop: schwebende Action-Steuerung mittig unten
  - Mobile: angeheftete Action-Leiste am unteren Rand

### Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)

Keine Frameworks, kein Build-Prozess, kein Backend.

### Projektstruktur

```text
.
|-- index.html   # Markup und Layout
|-- styles.css   # Design und responsive Verhalten
`-- app.js       # Zustand, Timer-Logik und Interaktionsfluss
```

### Lokal starten

```bash
python3 -m http.server 4173
```

Dann im Browser:

`http://127.0.0.1:4173`

### Bedienung

1. (Optional) Über das Zahnrad die feste Besatzung im Einstellungs-Modal pflegen.
2. Gesamtzeit in Minuten eintragen.
3. Anwesende Personen im Setup über Chips auswählen.
4. `Daily starten` klicken.
5. Die erste Person in `Als Nächstes wählen` antippen.
6. Für jeden Wechsel die jeweils nächste Person antippen.
7. Bei Spätkommern oder Ausfällen in `Heute im Daily (an/abwesend)` anpassen.
8. Mit `Daily abbrechen` frühzeitig stoppen oder mit `Daily abschließen` beenden, sobald die letzte Person spricht.
9. Danach mit `Neue Runde starten` eine neue Session starten.

### Besatzung per Link teilen

- Im Einstellungs-Modal `Teilen` nutzen.
- Oder die App direkt mit URL-Parametern öffnen, z. B.:
  - `...?name=Max&name=Anna&name=Sam`
- Namen aus der URL gelten für den aktuellen Seitenaufruf und können anschließend gespeichert werden.

### Deployment auf GitHub Pages

Das Projekt ist statisch und kann direkt auf GitHub Pages deployed werden:

1. Repository nach GitHub pushen.
2. In GitHub zu `Settings` > `Pages` wechseln.
3. Unter `Build and deployment` `Deploy from a branch` wählen.
4. Branch `main` und Ordner `/ (root)` auswählen.
5. Speichern und auf die bereitgestellte URL warten.
