const DEFAULT_TOTAL_MINUTES = 15;
const CREW_STORAGE_KEY = "dailyTimerCrew";

const ui = {
  sessionScreen: document.querySelector("#sessionScreen"),
  farewellScreen: document.querySelector("#farewellScreen"),
  mainTitle: document.querySelector("#mainTitle"),
  mainSubtitle: document.querySelector("#mainSubtitle"),
  setupPanel: document.querySelector("#setupPanel"),
  sessionTimers: document.querySelector("#sessionTimers"),
  sessionControls: document.querySelector("#sessionControls"),
  setupForm: document.querySelector("#setupForm"),
  totalMinutes: document.querySelector("#totalMinutes"),
  startButton: document.querySelector("#startButton"),
  resetButton: document.querySelector("#resetButton"),
  restartButton: document.querySelector("#restartButton"),
  farewellMeta: document.querySelector("#farewellMeta"),
  totalCard: document.querySelector("#totalCard"),
  speakerCard: document.querySelector("#speakerCard"),
  speakerName: document.querySelector("#speakerName"),
  totalTime: document.querySelector("#totalTime"),
  speakerTime: document.querySelector("#speakerTime"),
  totalProgress: document.querySelector("#totalProgress"),
  speakerProgress: document.querySelector("#speakerProgress"),
  statusText: document.querySelector("#statusText"),
  currentSpeakerBadge: document.querySelector("#currentSpeakerBadge"),
  remainingCount: document.querySelector("#remainingCount"),
  completedCount: document.querySelector("#completedCount"),
  nextEmptyHint: document.querySelector("#nextEmptyHint"),
  completedGroup: document.querySelector("#completedGroup"),
  attendanceGroup: document.querySelector("#attendanceGroup"),
  attendanceToggle: document.querySelector("#attendanceToggle"),
  attendanceBody: document.querySelector("#attendanceBody"),
  mobileActionHint: document.querySelector("#mobileActionHint"),
  dailyCrewChips: document.querySelector("#dailyCrewChips"),
  remainingChips: document.querySelector("#remainingChips"),
  completedChips: document.querySelector("#completedChips"),
  participantsSection: document.querySelector("#participantsSection"),
  // Settings modal elements
  settingsButton: document.querySelector("#settingsButton"),
  settingsModal: document.querySelector("#settingsModal"),
  settingsCloseButton: document.querySelector("#settingsCloseButton"),
  settingsShareButton: document.querySelector("#settingsShareButton"),
  settingsSaveButton: document.querySelector("#settingsSaveButton"),
  crewTextarea: document.querySelector("#crewTextarea"),
  crewChips: document.querySelector("#crewChips"),
  crewEmptyHint: document.querySelector("#crewEmptyHint"),
};

const state = {
  running: false,
  completed: false,
  animationFrameId: null,
  totalDurationMs: DEFAULT_TOTAL_MINUTES * 60_000,
  sessionStartAt: 0,
  speakerTurnStartedAt: 0,
  speakerAllowanceMs: 0,
  shareFeedbackTimeoutId: null,
  speakerFeedbackTimeoutId: null,
  attendanceCollapsed: false,
  // Crew management (persistent)
  crew: [],                   // All crew member names (saved in localStorage)
  presentMembers: new Set(),  // Names of crew members present today (reset on reload)
  // Session participant management
  participants: [],           // All participant names for current session
  remainingParticipants: [],  // Names of people who haven't spoken yet
  completedParticipants: [],  // Names of people who have finished
  currentSpeaker: null,       // Name of the current speaker (or null if none selected)
};

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

function formatDuration(ms) {
  const sign = ms < 0 ? "-" : "";
  const absolute = Math.abs(Math.round(ms / 1000));
  const hours = Math.floor(absolute / 3600);
  const minutes = Math.floor((absolute % 3600) / 60);
  const seconds = absolute % 60;

  if (hours > 0) {
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${sign}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMinutesValue(ms) {
  return String(Math.round(ms / 60_000));
}

function parseNames(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function dedupeNames(names) {
  const seen = new Set();
  const unique = [];
  for (const name of names) {
    if (!seen.has(name)) {
      seen.add(name);
      unique.push(name);
    }
  }
  return unique;
}

function loadCrewFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const namesFromUrl = params
    .getAll("name")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  return dedupeNames(namesFromUrl);
}

function getCrewOrder(name) {
  const idx = state.crew.indexOf(name);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function hasCompleted(name) {
  return state.completedParticipants.includes(name);
}

// ─────────────────────────────────────────────────────────────
// LocalStorage Persistence
// ─────────────────────────────────────────────────────────────

function saveCrew(names) {
  try {
    localStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(names));
  } catch (e) {
    console.warn("Could not save crew to localStorage:", e);
  }
}

function loadCrew() {
  try {
    const saved = localStorage.getItem(CREW_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not load crew from localStorage:", e);
  }
  return [];
}

// ─────────────────────────────────────────────────────────────
// Timer Calculations
// ─────────────────────────────────────────────────────────────

function computeRemainingTotal(now) {
  const elapsed = now - state.sessionStartAt;
  return state.totalDurationMs - elapsed;
}

function computeSpeakerRemaining(now) {
  if (!state.currentSpeaker) {
    return state.speakerAllowanceMs;
  }
  const elapsedCurrentSpeaker = now - state.speakerTurnStartedAt;
  return state.speakerAllowanceMs - elapsedCurrentSpeaker;
}

function calculateTimePerPerson(now) {
  const remainingTotal = computeRemainingTotal(now);
  const remainingPeople = state.remainingParticipants.length + (state.currentSpeaker ? 1 : 0);
  return remainingPeople > 0 ? remainingTotal / remainingPeople : 0;
}

// ─────────────────────────────────────────────────────────────
// UI Update Functions
// ─────────────────────────────────────────────────────────────

function updateInputsDisabled(disabled) {
  ui.totalMinutes.disabled = disabled;
  ui.startButton.disabled = disabled;
  ui.settingsButton.disabled = disabled;
  ui.settingsButton.hidden = disabled;
}

function updateStatusLine(text) {
  ui.statusText.textContent = text;
}

function updateSetupVisibility() {
  ui.setupPanel.hidden = state.running;
}

function updateRunningPanelsVisibility() {
  const showRunningPanels = state.running;
  ui.sessionTimers.hidden = !showRunningPanels;
  ui.sessionControls.hidden = !showRunningPanels;
}

function updateHeaderFocusVisibility() {
  const hideHeaderText = state.running;
  ui.mainTitle.hidden = hideHeaderText;
  ui.mainSubtitle.hidden = hideHeaderText;
}

function updateScreenVisibility() {
  ui.sessionScreen.hidden = state.completed;
  ui.farewellScreen.hidden = !state.completed;
}

function updateSpeakerDisplay() {
  if (state.currentSpeaker) {
    ui.speakerName.textContent = state.currentSpeaker;
    ui.speakerName.classList.remove("speaker-waiting");
  } else {
    ui.speakerName.textContent = "Wähle eine Person…";
    ui.speakerName.classList.add("speaker-waiting");
  }
}

function updateSessionMeta() {
  const currentLabel = state.currentSpeaker || "-";
  ui.currentSpeakerBadge.textContent = `Aktuell: ${currentLabel}`;
  ui.remainingCount.textContent = String(state.remainingParticipants.length);
  ui.completedCount.textContent = String(state.completedParticipants.length);
}

function updateMobileActionHint(canFinish) {
  if (!state.running) {
    ui.mobileActionHint.textContent = "";
    return;
  }

  if (canFinish) {
    ui.mobileActionHint.textContent = "Letzte Person aktiv";
    return;
  }

  if (!state.currentSpeaker) {
    ui.mobileActionHint.textContent = "Wähle die erste Person";
    return;
  }

  ui.mobileActionHint.textContent = `Noch ${state.remainingParticipants.length} offen`;
}

function updateAttendanceVisibility() {
  const collapsed = state.attendanceCollapsed;
  ui.attendanceBody.hidden = collapsed;
  ui.attendanceGroup.classList.toggle("is-collapsed", collapsed);
  ui.attendanceToggle.textContent = collapsed ? "Einblenden" : "Einklappen";
  ui.attendanceToggle.setAttribute("aria-expanded", String(!collapsed));
}

function triggerSpeakerChangeFeedback() {
  ui.speakerCard.classList.remove("is-speaker-change");
  ui.currentSpeakerBadge.classList.remove("is-speaker-change");
  void ui.speakerCard.offsetWidth;
  ui.speakerCard.classList.add("is-speaker-change");
  ui.currentSpeakerBadge.classList.add("is-speaker-change");

  if (state.speakerFeedbackTimeoutId) {
    window.clearTimeout(state.speakerFeedbackTimeoutId);
  }

  state.speakerFeedbackTimeoutId = window.setTimeout(() => {
    ui.speakerCard.classList.remove("is-speaker-change");
    ui.currentSpeakerBadge.classList.remove("is-speaker-change");
    state.speakerFeedbackTimeoutId = null;
  }, 420);
}

// ─────────────────────────────────────────────────────────────
// Chip Rendering
// ─────────────────────────────────────────────────────────────

function createChip(name, type) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.textContent = name;
  chip.className = `chip chip--${type}`;
  chip.dataset.name = name;
  return chip;
}

function renderParticipantChips() {
  // Clear existing chips
  ui.remainingChips.innerHTML = "";
  ui.completedChips.innerHTML = "";

  // Render remaining participants (clickable)
  for (const name of state.remainingParticipants) {
    const chip = createChip(name, "queue");
    chip.addEventListener("click", () => selectSpeaker(name));
    ui.remainingChips.appendChild(chip);
  }

  // Render completed participants
  for (const name of state.completedParticipants) {
    const chip = createChip(name, "completed");
    ui.completedChips.appendChild(chip);
  }

  ui.nextEmptyHint.hidden = state.remainingParticipants.length > 0;
  ui.completedGroup.hidden = state.completedParticipants.length === 0;
}

// ─────────────────────────────────────────────────────────────
// Setup Crew Chips (Toggle present/absent)
// ─────────────────────────────────────────────────────────────

function renderCrewChips() {
  ui.crewChips.innerHTML = "";

  if (state.crew.length === 0) {
    ui.crewEmptyHint.hidden = false;
    return;
  }

  ui.crewEmptyHint.hidden = true;

  for (const name of state.crew) {
    const isPresent = state.presentMembers.has(name);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = name;
    chip.className = `chip chip--${isPresent ? "present" : "absent"}`;
    chip.dataset.name = name;

    chip.addEventListener("click", () => {
      if (state.presentMembers.has(name)) {
        state.presentMembers.delete(name);
      } else {
        state.presentMembers.add(name);
      }
      renderCrewChips();
      updateStartButtonState();
    });

    ui.crewChips.appendChild(chip);
  }
}

function renderDailyCrewChips() {
  if (!ui.dailyCrewChips) {
    return;
  }

  ui.dailyCrewChips.innerHTML = "";

  for (const name of state.crew) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = name;

    const isPresent = state.presentMembers.has(name);
    const isCurrent = state.currentSpeaker === name;
    const isDone = hasCompleted(name);

    chip.className = `chip chip--daily ${isPresent ? "chip--present" : "chip--absent"}`;

    if (isCurrent) {
      chip.classList.add("chip--daily-current");
      chip.disabled = true;
      chip.title = "Spricht gerade";
    } else if (isDone) {
      chip.classList.add("chip--daily-completed");
      chip.disabled = true;
      chip.title = "Bereits fertig";
    } else {
      chip.addEventListener("click", () => toggleDailyPresence(name));
    }

    ui.dailyCrewChips.appendChild(chip);
  }
}

function insertRemainingByCrewOrder(name) {
  if (state.remainingParticipants.includes(name)) {
    return;
  }

  const incomingOrder = getCrewOrder(name);
  const insertAt = state.remainingParticipants.findIndex((item) => getCrewOrder(item) > incomingOrder);

  if (insertAt === -1) {
    state.remainingParticipants.push(name);
  } else {
    state.remainingParticipants.splice(insertAt, 0, name);
  }
}

function rebalanceCurrentSpeaker(now) {
  if (!state.running || !state.currentSpeaker) {
    return;
  }

  const remainingTotal = computeRemainingTotal(now);
  const peopleIncludingCurrent = state.remainingParticipants.length + 1;
  const elapsedCurrentSpeaker = now - state.speakerTurnStartedAt;
  const remainingForCurrent = peopleIncludingCurrent > 0 ? remainingTotal / peopleIncludingCurrent : 0;

  state.speakerAllowanceMs = elapsedCurrentSpeaker + remainingForCurrent;
}

function toggleDailyPresence(name) {
  if (!state.running || state.currentSpeaker === name || hasCompleted(name)) {
    return;
  }

  const now = performance.now();

  if (state.presentMembers.has(name)) {
    state.presentMembers.delete(name);
    state.participants = state.participants.filter((participant) => participant !== name);
    const idx = state.remainingParticipants.indexOf(name);
    if (idx !== -1) {
      state.remainingParticipants.splice(idx, 1);
    }
    updateStatusLine(`${name} ist heute nicht dabei.`);
  } else {
    state.presentMembers.add(name);
    if (!state.participants.includes(name)) {
      state.participants.push(name);
      state.participants.sort((a, b) => getCrewOrder(a) - getCrewOrder(b));
    }
    insertRemainingByCrewOrder(name);
    updateStatusLine(`${name} kommt nach und wurde hinzugefügt.`);
  }

  rebalanceCurrentSpeaker(now);
  renderDailyCrewChips();
  renderParticipantChips();
  updateResetButtonText();
  refreshView(now);
}

function updateStartButtonState() {
  const hasParticipants = state.presentMembers.size > 0;
  ui.startButton.disabled = !hasParticipants;
}

// ─────────────────────────────────────────────────────────────
// Settings Modal
// ─────────────────────────────────────────────────────────────

function openSettingsModal() {
  ui.crewTextarea.value = state.crew.join("\n");
  ui.settingsModal.hidden = false;
  ui.crewTextarea.focus();
}

function closeSettingsModal() {
  ui.settingsModal.hidden = true;
}

function saveSettings() {
  const newCrew = dedupeNames(parseNames(ui.crewTextarea.value));
  state.crew = newCrew;
  saveCrew(newCrew);

  // Reset present members to all crew (since crew changed)
  state.presentMembers = new Set(newCrew);

  renderCrewChips();
  renderDailyCrewChips();
  updateStartButtonState();
  closeSettingsModal();
}

function createCrewShareUrl(names) {
  const shareUrl = new URL(window.location.href);
  shareUrl.search = "";

  for (const name of names) {
    shareUrl.searchParams.append("name", name);
  }

  return shareUrl.toString();
}

function showShareFeedback(text) {
  ui.settingsShareButton.textContent = text;
  if (state.shareFeedbackTimeoutId) {
    window.clearTimeout(state.shareFeedbackTimeoutId);
  }
  state.shareFeedbackTimeoutId = window.setTimeout(() => {
    ui.settingsShareButton.textContent = "Teilen";
    state.shareFeedbackTimeoutId = null;
  }, 1500);
}

async function shareCrew() {
  const crewToShare = ui.settingsModal.hidden
    ? state.crew
    : dedupeNames(parseNames(ui.crewTextarea.value));

  if (crewToShare.length === 0) {
    updateStatusLine("Keine Besatzung zum Teilen vorhanden.");
    showShareFeedback("Keine Namen");
    return;
  }

  const shareUrl = createCrewShareUrl(crewToShare);

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Daily Timer",
        text: "Daily-Besatzung",
        url: shareUrl,
      });
      updateStatusLine("Besatzung geteilt.");
      showShareFeedback("Geteilt");
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        updateStatusLine("Teilen abgebrochen.");
        showShareFeedback("Abgebrochen");
        return;
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      updateStatusLine("Besatzungs-Link kopiert.");
      showShareFeedback("Kopiert");
      return;
    } catch (error) {
      console.warn("Could not copy share URL:", error);
    }
  }

  updateStatusLine(`Besatzungs-Link: ${shareUrl}`);
  showShareFeedback("Link anzeigen");
}

// ─────────────────────────────────────────────────────────────
// Button Text Update (last speaker)
// ─────────────────────────────────────────────────────────────

function updateResetButtonText() {
  const canFinish = state.running && state.remainingParticipants.length === 0 && state.currentSpeaker;

  if (canFinish) {
    ui.resetButton.textContent = "Daily abschließen";
  } else {
    ui.resetButton.textContent = "Daily abbrechen";
  }

  ui.resetButton.classList.toggle("btn--primary", canFinish);
  ui.resetButton.classList.toggle("btn--ghost", !canFinish);
  ui.resetButton.classList.toggle("btn--quiet", !canFinish);
  updateMobileActionHint(Boolean(canFinish));
}

// ─────────────────────────────────────────────────────────────
// View Refresh
// ─────────────────────────────────────────────────────────────

function refreshView(now = performance.now()) {
  const totalRemaining = state.running || state.completed ? computeRemainingTotal(now) : state.totalDurationMs;
  const speakerRemaining = state.running || state.completed ? computeSpeakerRemaining(now) : state.speakerAllowanceMs;

  ui.totalTime.textContent = formatDuration(totalRemaining);
  ui.speakerTime.textContent = formatDuration(speakerRemaining);

  const totalElapsed = state.totalDurationMs - totalRemaining;
  const totalRatio = state.totalDurationMs > 0 ? clamp(totalElapsed / state.totalDurationMs, 0, 1) : 1;
  ui.totalProgress.style.width = `${totalRatio * 100}%`;

  const speakerElapsed = state.speakerAllowanceMs - speakerRemaining;
  const speakerRatio = state.speakerAllowanceMs > 0 ? clamp(speakerElapsed / state.speakerAllowanceMs, 0, 1) : 1;
  ui.speakerProgress.style.width = `${speakerRatio * 100}%`;

  ui.totalCard.classList.toggle("is-overdue", totalRemaining < 0);
  ui.speakerCard.classList.toggle("is-overdue", speakerRemaining < 0 && state.currentSpeaker !== null);
  ui.speakerCard.classList.toggle("is-warning", speakerRemaining <= 10_000 && speakerRemaining >= 0 && state.currentSpeaker !== null);
  ui.speakerCard.classList.toggle("is-overdue-blink", speakerRemaining < -10_000 && totalRemaining >= 0 && state.currentSpeaker !== null);

  updateSpeakerDisplay();
  updateSessionMeta();
}

// ─────────────────────────────────────────────────────────────
// Speaker Selection Logic
// ─────────────────────────────────────────────────────────────

function selectSpeaker(name) {
  if (!state.running) {
    return;
  }

  const now = performance.now();

  // If there's a current speaker, mark them as completed
  if (state.currentSpeaker) {
    state.completedParticipants.push(state.currentSpeaker);
  }

  // Remove the new speaker from remaining
  const index = state.remainingParticipants.indexOf(name);
  if (index > -1) {
    state.remainingParticipants.splice(index, 1);
  }

  // Set the new speaker
  state.currentSpeaker = name;

  // Calculate time allowance for this speaker
  const remainingTotal = computeRemainingTotal(now);
  const remainingPeopleIncludingCurrent = state.remainingParticipants.length + 1;
  state.speakerAllowanceMs = remainingTotal / remainingPeopleIncludingCurrent;
  state.speakerTurnStartedAt = now;

  // Check if this was the last person
  if (state.remainingParticipants.length === 0) {
    // This is the last person - when their time is "up" or they finish, the daily ends
    updateStatusLine(`Letzte Person: ${name}`);
  } else {
    updateStatusLine(`${name} ist dran. Noch ${state.remainingParticipants.length} Person(en).`);
  }

  triggerSpeakerChangeFeedback();
  renderDailyCrewChips();
  renderParticipantChips();
  updateResetButtonText();
  refreshView(now);
}

function finishLastSpeaker() {
  if (!state.running || state.remainingParticipants.length > 0 || !state.currentSpeaker) {
    return;
  }

  const now = performance.now();
  state.completedParticipants.push(state.currentSpeaker);
  state.currentSpeaker = null;
  state.running = false;
  state.completed = true;

  ui.farewellMeta.textContent = `Daily abgeschlossen in ${formatMinutesValue(now - state.sessionStartAt)} Minuten`;
  updateScreenVisibility();
  updateRunningPanelsVisibility();
  updateHeaderFocusVisibility();
  updateSetupVisibility();
  updateStatusLine("Alle Personen sind fertig.");
  renderDailyCrewChips();
  renderParticipantChips();
  refreshView(now);
}

// ─────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────

function tick(now) {
  if (!state.running) {
    state.animationFrameId = null;
    return;
  }

  refreshView(now);
  state.animationFrameId = requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────
// Session Management
// ─────────────────────────────────────────────────────────────

function startSession(totalMinutes, participants) {
  const now = performance.now();
  state.totalDurationMs = totalMinutes * 60_000;
  state.sessionStartAt = now;
  state.participants = [...participants];
  state.remainingParticipants = [...participants];
  state.completedParticipants = [];
  state.currentSpeaker = null;
  state.running = true;
  state.completed = false;

  // Calculate initial time per person (before anyone is selected)
  state.speakerAllowanceMs = state.totalDurationMs / participants.length;
  state.speakerTurnStartedAt = now;

  updateScreenVisibility();
  updateRunningPanelsVisibility();
  updateHeaderFocusVisibility();
  updateInputsDisabled(true);
  updateSetupVisibility();
  updateResetButtonText();
  updateStatusLine("Wähle die erste Person aus.");

  renderDailyCrewChips();
  renderParticipantChips();

  if (!state.animationFrameId) {
    state.animationFrameId = requestAnimationFrame(tick);
  }

  refreshView(now);
}

function resetSession() {
  state.running = false;
  state.completed = false;
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  const configuredMinutes = Number.parseInt(ui.totalMinutes.value, 10) || DEFAULT_TOTAL_MINUTES;
  const participants = Array.from(state.presentMembers);

  state.totalDurationMs = configuredMinutes * 60_000;
  state.participants = participants;
  state.remainingParticipants = [...participants];
  state.completedParticipants = [];
  state.currentSpeaker = null;
  state.speakerAllowanceMs = participants.length > 0 ? state.totalDurationMs / participants.length : 0;
  state.speakerTurnStartedAt = 0;
  state.sessionStartAt = 0;

  if (state.speakerFeedbackTimeoutId) {
    window.clearTimeout(state.speakerFeedbackTimeoutId);
    state.speakerFeedbackTimeoutId = null;
  }
  ui.speakerCard.classList.remove("is-speaker-change");
  ui.currentSpeakerBadge.classList.remove("is-speaker-change");

  ui.farewellMeta.textContent = "Daily abgeschlossen";
  updateScreenVisibility();
  updateRunningPanelsVisibility();
  updateHeaderFocusVisibility();
  updateInputsDisabled(false);
  updateSetupVisibility();
  updateResetButtonText();
  updateStatusLine("Zurückgesetzt. Mit \"Daily starten\" beginnen.");
  renderCrewChips();
  renderDailyCrewChips();
  updateStartButtonState();
  refreshView();
}

function validateSetup() {
  const totalMinutes = Number.parseInt(ui.totalMinutes.value, 10);
  const participants = Array.from(state.presentMembers).sort((a, b) => getCrewOrder(a) - getCrewOrder(b));

  if (!Number.isInteger(totalMinutes) || totalMinutes < 1) {
    updateStatusLine("Bitte eine gültige Gesamtzeit in Minuten eingeben.");
    return null;
  }

  if (participants.length < 1) {
    updateStatusLine("Bitte mindestens einen Teilnehmer als anwesend markieren.");
    return null;
  }

  return { totalMinutes, participants };
}

// ─────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────

function init() {
  const crewFromUrl = loadCrewFromUrl();
  // URL has priority for this page load only
  state.crew = crewFromUrl.length > 0 ? crewFromUrl : loadCrew();
  // Initially, all crew members are present
  state.presentMembers = new Set(state.crew);

  // Event listeners for setup form
  ui.setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.running) {
      return;
    }

    const setup = validateSetup();
    if (!setup) {
      return;
    }

    startSession(setup.totalMinutes, setup.participants);
  });

  ui.resetButton.addEventListener("click", () => {
    // If this is the last speaker, finish the daily properly
    if (state.running && state.remainingParticipants.length === 0 && state.currentSpeaker) {
      finishLastSpeaker();
    } else {
      resetSession();
    }
  });
  ui.restartButton.addEventListener("click", resetSession);

  // Settings modal event listeners
  ui.settingsButton.addEventListener("click", openSettingsModal);
  ui.settingsCloseButton.addEventListener("click", closeSettingsModal);
  ui.settingsShareButton.addEventListener("click", shareCrew);
  ui.settingsSaveButton.addEventListener("click", saveSettings);
  ui.attendanceToggle.addEventListener("click", () => {
    state.attendanceCollapsed = !state.attendanceCollapsed;
    updateAttendanceVisibility();
  });

  // Close modal on backdrop click
  ui.settingsModal.addEventListener("click", (event) => {
    if (event.target === ui.settingsModal) {
      closeSettingsModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !ui.settingsModal.hidden) {
      closeSettingsModal();
    }
  });

  // Initialize view
  state.attendanceCollapsed = window.matchMedia("(max-width: 48rem)").matches;
  updateAttendanceVisibility();
  renderCrewChips();
  updateStartButtonState();
  resetSession();

  if (crewFromUrl.length > 0) {
    updateStatusLine("Besatzung aus URL geladen.");
  }
}

init();
