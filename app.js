const DEFAULT_TOTAL_MINUTES = 15;

const ui = {
  setupPanel: document.querySelector("#setupPanel"),
  setupForm: document.querySelector("#setupForm"),
  totalMinutes: document.querySelector("#totalMinutes"),
  peopleCount: document.querySelector("#peopleCount"),
  startButton: document.querySelector("#startButton"),
  doneButton: document.querySelector("#doneButton"),
  resetButton: document.querySelector("#resetButton"),
  totalCard: document.querySelector("#totalCard"),
  speakerCard: document.querySelector("#speakerCard"),
  totalTime: document.querySelector("#totalTime"),
  speakerTime: document.querySelector("#speakerTime"),
  totalProgress: document.querySelector("#totalProgress"),
  speakerProgress: document.querySelector("#speakerProgress"),
  currentSpeaker: document.querySelector("#currentSpeaker"),
  remainingPeople: document.querySelector("#remainingPeople"),
  allocatedTime: document.querySelector("#allocatedTime"),
  statusText: document.querySelector("#statusText"),
};

const state = {
  running: false,
  completed: false,
  animationFrameId: null,
  totalDurationMs: DEFAULT_TOTAL_MINUTES * 60_000,
  sessionStartAt: 0,
  peopleTotal: 1,
  peopleRemaining: 1,
  currentSpeakerNumber: 1,
  speakerTurnStartedAt: 0,
  speakerAllowanceMs: 0,
};

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

function computeRemainingTotal(now) {
  const elapsed = now - state.sessionStartAt;
  return state.totalDurationMs - elapsed;
}

function computeSpeakerRemaining(now) {
  const elapsedCurrentSpeaker = now - state.speakerTurnStartedAt;
  return state.speakerAllowanceMs - elapsedCurrentSpeaker;
}

function updateInputsDisabled(disabled) {
  ui.totalMinutes.disabled = disabled;
  ui.peopleCount.disabled = disabled;
  ui.startButton.disabled = disabled;
}

function updateStatusLine(text) {
  ui.statusText.textContent = text;
}

function updateSetupVisibility() {
  ui.setupPanel.hidden = state.running;
}

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
  ui.speakerCard.classList.toggle("is-overdue", speakerRemaining < 0);
  ui.speakerCard.classList.toggle("is-warning", speakerRemaining <= 10_000 && speakerRemaining >= 0);
  ui.speakerCard.classList.toggle("is-overdue-blink", speakerRemaining < -10_000 && totalRemaining >= 0);

  ui.currentSpeaker.textContent = `${state.currentSpeakerNumber} / ${state.peopleTotal}`;
  ui.remainingPeople.textContent = String(state.peopleRemaining);
  ui.allocatedTime.textContent = formatDuration(state.speakerAllowanceMs);
}

function nextSpeakerTurn(now) {
  const remainingTotal = computeRemainingTotal(now);
  state.speakerAllowanceMs = remainingTotal / state.peopleRemaining;
  state.speakerTurnStartedAt = now;
  state.currentSpeakerNumber = state.peopleTotal - state.peopleRemaining + 1;
}

function tick(now) {
  if (!state.running) {
    state.animationFrameId = null;
    return;
  }

  refreshView(now);
  state.animationFrameId = requestAnimationFrame(tick);
}

function startSession(totalMinutes, peopleCount) {
  const now = performance.now();
  state.totalDurationMs = totalMinutes * 60_000;
  state.sessionStartAt = now;
  state.peopleTotal = peopleCount;
  state.peopleRemaining = peopleCount;
  state.running = true;
  state.completed = false;

  nextSpeakerTurn(now);
  updateInputsDisabled(true);
  updateSetupVisibility();
  ui.doneButton.disabled = false;
  updateStatusLine("Daily läuft.");

  if (!state.animationFrameId) {
    state.animationFrameId = requestAnimationFrame(tick);
  }

  refreshView(now);
}

function finishSpeaker() {
  if (!state.running || state.peopleRemaining < 1) {
    return;
  }

  const now = performance.now();
  state.peopleRemaining -= 1;

  if (state.peopleRemaining === 0) {
    state.running = false;
    state.completed = true;
    updateSetupVisibility();
    ui.doneButton.disabled = true;
    updateStatusLine("Alle Personen sind fertig.");
    refreshView(now);
    return;
  }

  nextSpeakerTurn(now);
  updateStatusLine(`Nächste Person: ${state.currentSpeakerNumber}/${state.peopleTotal}`);
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
  const configuredPeople = Number.parseInt(ui.peopleCount.value, 10) || 1;

  state.totalDurationMs = configuredMinutes * 60_000;
  state.peopleTotal = configuredPeople;
  state.peopleRemaining = configuredPeople;
  state.currentSpeakerNumber = 1;
  state.speakerAllowanceMs = state.totalDurationMs / configuredPeople;
  state.speakerTurnStartedAt = 0;
  state.sessionStartAt = 0;

  updateInputsDisabled(false);
  updateSetupVisibility();
  ui.doneButton.disabled = true;
  updateStatusLine("Zurückgesetzt. Mit \"Daily starten\" beginnen.");
  refreshView();
}

function validateSetup() {
  const totalMinutes = Number.parseInt(ui.totalMinutes.value, 10);
  const peopleCount = Number.parseInt(ui.peopleCount.value, 10);

  if (!Number.isInteger(totalMinutes) || totalMinutes < 1) {
    updateStatusLine("Bitte eine gültige Gesamtzeit in Minuten eingeben.");
    return null;
  }

  if (!Number.isInteger(peopleCount) || peopleCount < 1) {
    updateStatusLine("Bitte eine gültige Anzahl Personen eingeben.");
    return null;
  }

  return { totalMinutes, peopleCount };
}

ui.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.running) {
    return;
  }

  const setup = validateSetup();
  if (!setup) {
    return;
  }

  startSession(setup.totalMinutes, setup.peopleCount);
});

ui.doneButton.addEventListener("click", finishSpeaker);
ui.resetButton.addEventListener("click", resetSession);

resetSession();
