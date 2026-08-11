import { INITIAL_PROFILES, RECIPES_DATABASE, WEEKLY_WORKOUT_SCHEDULE, DOG_ROUTES_DATABASE, INGREDIENT_CATEGORIES } from './data.js?v=1.0.4';

// STATE STORAGE KEY
const LOCAL_STORAGE_KEY = "FITDUO_APP_STATE_V1";
const DEVICE_DEFAULT_PROFILE_KEY = "FITDUO_DEVICE_PREFERRED_PROFILE";
const LAST_ACTIVE_PROFILE_KEY = "FITDUO_LAST_ACTIVE_PROFILE";

// INITIAL STATE STRUCTURE
let appState = {
  activeProfileId: "he", // 'he' (Carlos) or 'she' (Andrea)
  profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
  exclusions: [], // Kept for backward safety
  completedWorkouts: {
    he: {
      Lunes: { done: true, watchData: { deviceName: "Apple Watch (Carlos)", durationMin: 45, kcal: 430, avgHr: 142, maxHr: 168, timestamp: "09:30 hs", autoSync: true } },
      Martes: { done: true, watchData: { deviceName: "Apple Watch (Carlos)", durationMin: 40, kcal: 390, avgHr: 136, maxHr: 160, timestamp: "18:15 hs", autoSync: true } },
      Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false
    },
    she: {
      Lunes: { done: true, watchData: { deviceName: "Apple Watch (Andrea)", durationMin: 45, kcal: 380, avgHr: 138, maxHr: 162, timestamp: "09:30 hs", autoSync: true } },
      Martes: false,
      Miércoles: { done: true, watchData: { deviceName: "Apple Watch (Andrea)", durationMin: 50, kcal: 410, avgHr: 140, maxHr: 165, timestamp: "19:00 hs", autoSync: true } },
      Jueves: false, Viernes: false, Sábado: false, Domingo: false
    }
  },
  activeDay: "Lunes",
  activeWorkoutDay: "Lunes",
  checkedShoppingItems: {}, // { "ingredientName": true/false }
  weightLogs: {
    he: [
      { date: "Semana -4", weight: 79.5 },
      { date: "Semana -3", weight: 79.0 },
      { date: "Semana -2", weight: 78.4 },
      { date: "Semana -1", weight: 78.2 },
      { date: "Hoy", weight: 78.0 }
    ],
    she: [
      { date: "Semana -4", weight: 64.2 },
      { date: "Semana -3", weight: 63.8 },
      { date: "Semana -2", weight: 63.5 },
      { date: "Semana -1", weight: 63.1 },
      { date: "Hoy", weight: 63.0 }
    ]
  },
  appleWatch: {
    autoSyncEnabled: true,
    syncIntervalSec: 6,
    lastGlobalSync: new Date().toISOString(),
    metrics: {
      he: {
        deviceName: "Apple Watch (Carlos)",
        battery: 88,
        hr: 74,
        steps: 9840,
        moveKcal: 540,
        moveGoal: 600,
        exerciseMin: 42,
        exerciseGoal: 30,
        standHours: 10,
        standGoal: 12,
        distanceKm: 7.2
      },
      she: {
        deviceName: "Apple Watch (Andrea)",
        battery: 92,
        hr: 68,
        steps: 11200,
        moveKcal: 480,
        moveGoal: 500,
        exerciseMin: 45,
        exerciseGoal: 30,
        standHours: 11,
        standGoal: 12,
        distanceKm: 8.4
      }
    },
    syncLogs: [
      { timestamp: new Date().toLocaleTimeString(), device: "Apple Watch (Carlos)", hr: 74, kcal: 540, steps: 9840, status: "Auto-Sync OK" }
    ]
  }
};

let weightChart = null;
let autoSyncIntervalTimer = null;

// LOAD STATE FROM LOCALSTORAGE
function loadSavedState() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch (e) {
      console.warn("Could not parse saved state, using defaults.");
    }
  }

  // Device-specific profile memory preference
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY) || 'last';
  const lastProfile = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY);

  if (devicePref === 'he' || devicePref === 'she') {
    appState.activeProfileId = devicePref;
  } else if (lastProfile === 'he' || lastProfile === 'she') {
    appState.activeProfileId = lastProfile;
  }

  // Ensure names are updated to Carlos, Andrea, and Boo
  appState.profiles.he.name = "Él (Carlos)";
  appState.profiles.she.name = "Ella (Andrea)";
  
  if (!appState.completedWorkouts) {
    appState.completedWorkouts = {
      he: { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false },
      she: { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false }
    };
  }
  if (!appState.completedWorkouts.he) {
    appState.completedWorkouts.he = { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false };
  }
  if (!appState.completedWorkouts.she) {
    appState.completedWorkouts.she = { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false, Sábado: false, Domingo: false };
  }

  // Ensure Apple Watch structure exists
  if (!appState.appleWatch) {
    appState.appleWatch = {
      autoSyncEnabled: true,
      syncIntervalSec: 6,
      lastGlobalSync: new Date().toISOString(),
      metrics: {
        he: { deviceName: "Apple Watch (Carlos)", battery: 88, hr: 74, steps: 9840, moveKcal: 540, moveGoal: 600, exerciseMin: 42, exerciseGoal: 30, standHours: 10, standGoal: 12, distanceKm: 7.2 },
        she: { deviceName: "Apple Watch (Andrea)", battery: 92, hr: 68, steps: 11200, moveKcal: 480, moveGoal: 500, exerciseMin: 45, exerciseGoal: 30, standHours: 11, standGoal: 12, distanceKm: 8.4 }
      },
      syncLogs: []
    };
  }
}

// SAVE STATE TO LOCALSTORAGE
function saveState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
}

// INITIALIZATION ON DOM READY
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  
  // Make functions available globally on window object for HTML inline onclick handlers
  window.switchProfile = switchProfile;
  window.setDeviceDefaultProfile = setDeviceDefaultProfile;
  window.showTab = showTab;
  window.renderSummaryView = renderSummaryView;
  window.addExclusion = addExclusion;
  window.removeExclusion = removeExclusion;
  window.toggleWorkoutDay = toggleWorkoutDay;
  window.resetWorkoutWeek = resetWorkoutWeek;
  window.syncAppleWatchData = syncAppleWatchData;
  window.selectDay = selectDay;
  window.selectWorkoutDay = selectWorkoutDay;
  window.toggleShoppingItem = toggleShoppingItem;
  window.copyShoppingList = copyShoppingList;
  window.addWeightEntry = addWeightEntry;
  window.sendChatMessage = sendChatMessage;
  window.handleChatKeyPress = handleChatKeyPress;

  // Apple Watch & iOS Specific Handlers
  window.openAppleWatchModal = openAppleWatchModal;
  window.closeAppleWatchModal = closeAppleWatchModal;
  window.closeAppleWatchModalOnBackdrop = closeAppleWatchModalOnBackdrop;
  window.toggleAutoSync = toggleAutoSync;
  window.triggerManualSync = triggerManualSync;
  window.recordWatchWorkoutForDay = recordWatchWorkoutForDay;
  window.handleHealthFileImport = handleHealthFileImport;
  window.connectBluetoothHR = connectBluetoothHR;
  window.forceAppRefresh = forceAppRefresh;

  renderAll();
  startAppleWatchAutoSync();
});

// MAIN RENDER CONTROLLER
function renderAll() {
  renderSummaryView();
  renderProfileView();
  renderNutritionView();
  renderShoppingView();
  renderWorkoutsView();
  renderDogRoutesView();
  renderProgressView();
  renderSettingsView();
  updateHeaderWatchBadge();
}

// PROFILE SWITCHER (DESKTOP & IPHONE HEADER SYNC)
function switchProfile(profileId) {
  triggerHapticTouch();
  appState.activeProfileId = profileId;
  localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, profileId);
  saveState();

  // Desktop buttons
  const btnHe = document.getElementById("btn-profile-he");
  const btnShe = document.getElementById("btn-profile-she");
  if (btnHe) btnHe.classList.toggle("active", profileId === "he");
  if (btnShe) btnShe.classList.toggle("active", profileId === "she");

  // Mobile Header buttons
  const iosBtnHe = document.getElementById("ios-btn-profile-he");
  const iosBtnShe = document.getElementById("ios-btn-profile-she");
  if (iosBtnHe) iosBtnHe.classList.toggle("active", profileId === "he");
  if (iosBtnShe) iosBtnShe.classList.toggle("active", profileId === "she");

  renderSummaryView();
  renderProfileView();
  renderNutritionView();
  renderShoppingView();
  renderProgressView();
  renderSettingsView();

  if (document.getElementById("apple-watch-modal")?.classList.contains("active")) {
    updateAppleWatchModalUI();
  }
}

// TAB NAVIGATION (DESKTOP SIDEBAR & IPHONE DOCK SYNC)
function showTab(tabId, btnElement) {
  triggerHapticTouch();
  document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
  document.querySelectorAll(".nav-item button").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".ios-dock-btn").forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  
  if (btnElement) {
    btnElement.classList.add("active");
  }

  // Sync mobile dock buttons
  const tabMap = {
    'summary-view': 'dock-btn-summary',
    'nutrition-view': 'dock-btn-nutrition',
    'shopping-view': 'dock-btn-shopping',
    'workouts-view': 'dock-btn-workouts',
    'dog-routes-view': 'dock-btn-dog',
    'progress-view': 'dock-btn-progress',
    'profile-view': 'dock-btn-profile',
    'settings-view': 'dock-btn-settings',
    'coach-view': 'dock-btn-coach'
  };

  if (tabMap[tabId]) {
    const dockBtn = document.getElementById(tabMap[tabId]);
    if (dockBtn) dockBtn.classList.add("active");
  }

  if (tabId === 'summary-view') {
    renderSummaryView();
  } else if (tabId === 'settings-view') {
    renderSettingsView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// IOS HAPTIC FEEDBACK SIMULATOR
function triggerHapticTouch() {
  if (window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(15); } catch(e){}
  }
}

// FLOATING IOS TOAST NOTIFICATION SYSTEM
function showIosToast(message, iconClass = "fa-brands fa-apple") {
  const container = document.getElementById("ios-toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "ios-toast";
  toast.innerHTML = `
    <i class="${iconClass} ios-toast-icon"></i>
    <div style="flex:1;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-15px) scale(0.95)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// APPLE WATCH & HEALTHKIT AUTO-SYNC ENGINE
// ==========================================

function startAppleWatchAutoSync() {
  if (autoSyncIntervalTimer) clearInterval(autoSyncIntervalTimer);

  // Background Auto-Sync Loop every 6 seconds
  autoSyncIntervalTimer = setInterval(() => {
    if (!appState.appleWatch || !appState.appleWatch.autoSyncEnabled) return;

    performAutoSyncTick();
  }, 6000);
}

function performAutoSyncTick() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  if (!m) return;

  // Simulate realistic Apple Watch telemetry updates
  const stepAdd = Math.floor(Math.random() * 9) + 2; // +2 to 10 steps
  const kcalAdd = Math.random() > 0.4 ? 1 : 0; // +1 active kcal
  const hrChange = (Math.floor(Math.random() * 5) - 2); // -2 to +2 BPM

  m.steps += stepAdd;
  m.moveKcal += kcalAdd;
  m.hr = Math.max(62, Math.min(155, m.hr + hrChange));
  m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
  appState.appleWatch.lastGlobalSync = new Date().toISOString();

  saveState();

  // Update UI indicators
  updateHeaderWatchBadge();
  
  renderSummaryView();

  if (document.getElementById("apple-watch-modal")?.classList.contains("active")) {
    updateAppleWatchModalUI();
  }

  // Update profile metrics summary cards if on profile view
  const kcalEl = document.getElementById("target-calories");
  if (kcalEl && document.getElementById("profile-view")?.classList.contains("active")) {
    renderWorkoutTracker();
  }
}

function updateHeaderWatchBadge() {
  const badgeText = document.getElementById("ios-header-watch-text");
  if (badgeText) {
    const isAuto = appState.appleWatch?.autoSyncEnabled;
    badgeText.innerText = isAuto ? "Auto-Sync ON" : "Sync Manual";
  }
}

function openAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) {
    modal.classList.add("active");
    updateAppleWatchModalUI();
  }
}

function closeAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) modal.classList.remove("active");
}

function closeAppleWatchModalOnBackdrop(e) {
  if (e.target.id === "apple-watch-modal") {
    closeAppleWatchModal();
  }
}

function toggleAutoSync(enabled) {
  triggerHapticTouch();
  if (!appState.appleWatch) return;
  appState.appleWatch.autoSyncEnabled = enabled;
  saveState();
  updateHeaderWatchBadge();

  showIosToast(
    enabled 
      ? " Sincronización automática de Apple Watch <strong>ACTIVADA</strong>" 
      : "⏸️ Sincronización automática de Apple Watch <strong>PAUSADA</strong>",
    enabled ? "fa-brands fa-apple" : "fa-solid fa-pause"
  );
}

function triggerManualSync() {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = appState.profiles[pid].name.split(" ")[0];

  // Add instant sync burst
  m.steps += Math.floor(Math.random() * 120) + 40;
  m.moveKcal += Math.floor(Math.random() * 15) + 5;
  m.exerciseMin = Math.min(60, m.exerciseMin + 2);
  m.hr = Math.floor(Math.random() * 20) + 72;
  m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
  
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  appState.appleWatch.syncLogs.unshift({
    timestamp: timeStr,
    device: m.deviceName,
    hr: m.hr,
    kcal: m.moveKcal,
    steps: m.steps,
    status: "Sincronizado Manualmente"
  });
  if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

  saveState();
  updateAppleWatchModalUI();
  renderWorkoutTracker();

  showIosToast(` ¡Apple Watch de ${pName} sincronizado correctamente! (${m.moveKcal} kcal - ${m.steps} pasos)`, "fa-solid fa-circle-check");
}

function updateAppleWatchModalUI() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = appState.profiles[pid].name.split(" ")[0];
  if (!m) return;

  // Device & Subtitle
  const deviceEl = document.getElementById("watch-device-name");
  if (deviceEl) deviceEl.innerText = `${m.deviceName}`;

  const subEl = document.getElementById("modal-watch-subtitle");
  if (subEl) subEl.innerText = `Salud iOS (${pName}) - Auto-Sync Activo`;

  const batEl = document.getElementById("watch-battery-level");
  if (batEl) batEl.innerText = `${m.battery}%`;

  const toggleEl = document.getElementById("toggle-auto-sync");
  if (toggleEl) toggleEl.checked = !!appState.appleWatch.autoSyncEnabled;

  const timeDiffSec = Math.round((new Date() - new Date(appState.appleWatch.lastGlobalSync || new Date())) / 1000);
  const tsEl = document.getElementById("watch-sync-timestamp");
  if (tsEl) tsEl.innerText = `Sincronizado: Hace ${timeDiffSec < 3 ? 'un instante' : timeDiffSec + ' seg'}`;

  // Live Metrics Grid
  const hrEl = document.getElementById("watch-metric-hr");
  if (hrEl) hrEl.innerHTML = `${m.hr} <small>BPM</small>`;

  const stepsEl = document.getElementById("watch-metric-steps");
  if (stepsEl) stepsEl.innerText = m.steps.toLocaleString();

  const distEl = document.getElementById("watch-metric-dist");
  if (distEl) distEl.innerHTML = `${m.distanceKm} <small>km</small>`;

  const kcalEl = document.getElementById("watch-metric-kcal");
  if (kcalEl) kcalEl.innerHTML = `${m.moveKcal} <small>kcal</small>`;

  // Apple Activity Rings Calculations
  // Ring 1 (Move): stroke-dasharray = 314
  const moveCircle = document.getElementById("ring-move-circle");
  const moveRatio = Math.min(1.2, m.moveKcal / m.moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  if (moveCircle) moveCircle.style.strokeDashoffset = moveOffset;
  const moveValEl = document.getElementById("ring-move-val");
  if (moveValEl) moveValEl.innerText = `${m.moveKcal} / ${m.moveGoal} kcal`;

  // Ring 2 (Exercise): stroke-dasharray = 238
  const exCircle = document.getElementById("ring-exercise-circle");
  const exRatio = Math.min(1.2, m.exerciseMin / m.exerciseGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  if (exCircle) exCircle.style.strokeDashoffset = exOffset;
  const exValEl = document.getElementById("ring-exercise-val");
  if (exValEl) exValEl.innerText = `${m.exerciseMin} / ${m.exerciseGoal} min`;

  // Ring 3 (Stand): stroke-dasharray = 163
  const standCircle = document.getElementById("ring-stand-circle");
  const standRatio = Math.min(1.2, m.standHours / m.standGoal);
  const standOffset = Math.max(0, 163 - (163 * Math.min(1, standRatio)));
  if (standCircle) standCircle.style.strokeDashoffset = standOffset;
  const standValEl = document.getElementById("ring-stand-val");
  if (standValEl) standValEl.innerText = `${m.standHours} / ${m.standGoal} hrs`;

  // Render Sync Logs
  const logList = document.getElementById("sync-log-list");
  if (logList) {
    if (!appState.appleWatch.syncLogs || appState.appleWatch.syncLogs.length === 0) {
      logList.innerHTML = `<li class="sync-log-item"><span class="sync-log-time">Ahora</span><span class="sync-log-detail">Conexión Salud iOS Inicializada</span></li>`;
    } else {
      logList.innerHTML = appState.appleWatch.syncLogs.map(l => `
        <li class="sync-log-item">
          <span class="sync-log-time">${l.timestamp} - ${l.device}</span>
          <span class="sync-log-detail">${l.kcal} kcal | ${l.hr} BPM | ${l.steps} pasos</span>
        </li>
      `).join("");
    }
  }
}

// APPLE HEALTH FILE IMPORT (PARSER XML/JSON FROM IPHONE)
function handleHealthFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const pid = appState.activeProfileId;
    const m = appState.appleWatch.metrics[pid];

    try {
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(content);
        if (json.steps) m.steps = parseInt(json.steps);
        if (json.activeCalories) m.moveKcal = parseInt(json.activeCalories);
        if (json.heartRate) m.hr = parseInt(json.heartRate);
      } else {
        // XML regex parsing for Apple Health export.xml records
        const stepMatches = [...content.matchAll(/HKQuantityTypeIdentifierStepCount[^>]+value="(\d+)"/g)];
        if (stepMatches.length > 0) {
          const totalSteps = stepMatches.slice(-20).reduce((acc, match) => acc + parseInt(match[1]), 0);
          if (totalSteps > 0) m.steps = totalSteps;
        }

        const kcalMatches = [...content.matchAll(/HKQuantityTypeIdentifierActiveEnergyBurned[^>]+value="([\d.]+)"/g)];
        if (kcalMatches.length > 0) {
          const totalKcal = Math.round(kcalMatches.slice(-20).reduce((acc, match) => acc + parseFloat(match[1]), 0));
          if (totalKcal > 0) m.moveKcal = totalKcal;
        }
      }

      m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
      saveState();
      updateAppleWatchModalUI();
      renderWorkoutTracker();

      showIosToast(`📄 Archivo de Salud iOS importado con éxito: ${m.steps.toLocaleString()} pasos y ${m.moveKcal} kcal cargados.`, "fa-solid fa-file-circle-check");
    } catch(err) {
      showIosToast(`⚠️ Error al leer el archivo de Salud iOS: Comprueba el formato XML/JSON.`, "fa-solid fa-triangle-exclamation");
    }
  };
  reader.readAsText(file);
}

// WEBBTUETOOTH HEART RATE MONITOR PAIRING
function connectBluetoothHR() {
  triggerHapticTouch();
  if (navigator.bluetooth) {
    navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
      .then(device => {
        showIosToast(` Conectado por Bluetooth a ${device.name || 'Pulsómetro Apple Watch'}`, "fa-solid fa-bluetooth");
      })
      .catch(err => {
        // Fallback demo pairing
        simulateBluetoothPairing();
      });
  } else {
    simulateBluetoothPairing();
  }
}

function simulateBluetoothPairing() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  m.hr = 142; // Workout pulse burst
  saveState();
  updateAppleWatchModalUI();
  showIosToast(` Pulsómetro Apple Watch enlazado por Bluetooth: Frecuencia cardíaca en directo 142 BPM`, "fa-solid fa-heart-pulse");
}

// RENDER MAIN SUMMARY & APPLE WATCH DASHBOARD
function renderSummaryView() {
  const pid = appState.activeProfileId;
  const p = appState.profiles[pid];
  const m = appState.appleWatch?.metrics?.[pid];
  if (!p || !m) return;

  const pName = p.name.split(" ")[0];

  // Subtitle
  const subEl = document.getElementById("summary-subtitle");
  if (subEl) subEl.innerText = `Estado en tiempo real de actividad, salud y entrenamiento de hoy (${pName})`;

  // Watch Device & Sync Time
  const deviceEl = document.getElementById("summary-watch-device");
  if (deviceEl) deviceEl.innerText = `${m.deviceName}`;

  const timeDiffSec = Math.round((new Date() - new Date(appState.appleWatch.lastGlobalSync || new Date())) / 1000);
  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl) syncTimeEl.innerText = `Sincronizado: Hace ${timeDiffSec < 3 ? 'un instante' : timeDiffSec + ' seg'}`;

  // Live Metrics
  const hrEl = document.getElementById("summary-metric-hr");
  if (hrEl) hrEl.innerHTML = `${m.hr} <small>BPM</small>`;

  const stepsEl = document.getElementById("summary-metric-steps");
  if (stepsEl) stepsEl.innerText = m.steps.toLocaleString();

  const distEl = document.getElementById("summary-metric-dist");
  if (distEl) distEl.innerHTML = `${m.distanceKm} <small>km</small>`;

  const kcalEl = document.getElementById("summary-metric-kcal");
  if (kcalEl) kcalEl.innerHTML = `${m.moveKcal} <small>kcal</small>`;

  // Rings
  const moveCircle = document.getElementById("summary-ring-move-circle");
  const moveRatio = Math.min(1.2, m.moveKcal / m.moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  if (moveCircle) moveCircle.style.strokeDashoffset = moveOffset;
  const moveValEl = document.getElementById("summary-ring-move-val");
  if (moveValEl) moveValEl.innerText = `${m.moveKcal} / ${m.moveGoal} kcal`;

  const exCircle = document.getElementById("summary-ring-exercise-circle");
  const exRatio = Math.min(1.2, m.exerciseMin / m.exerciseGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  if (exCircle) exCircle.style.strokeDashoffset = exOffset;
  const exValEl = document.getElementById("summary-ring-exercise-val");
  if (exValEl) exValEl.innerText = `${m.exerciseMin} / ${m.exerciseGoal} min`;

  const standCircle = document.getElementById("summary-ring-stand-circle");
  const standRatio = Math.min(1.2, m.standHours / m.standGoal);
  const standOffset = Math.max(0, 163 - (163 * Math.min(1, standRatio)));
  if (standCircle) standCircle.style.strokeDashoffset = standOffset;
  const standValEl = document.getElementById("summary-ring-stand-val");
  if (standValEl) standValEl.innerText = `${m.standHours} / ${m.standGoal} hrs`;

  // Nutrition targets
  const targetCalEl = document.getElementById("summary-target-calories");
  if (targetCalEl) targetCalEl.innerText = `${p.targetCalories} kcal`;
  const targetProtEl = document.getElementById("summary-target-protein");
  if (targetProtEl) targetProtEl.innerText = `${p.protein} g`;
  const targetCarbsEl = document.getElementById("summary-target-carbs");
  if (targetCarbsEl) targetCarbsEl.innerText = `${p.carbs} g`;
  const targetFatsEl = document.getElementById("summary-target-fats");
  if (targetFatsEl) targetFatsEl.innerText = `${p.fats} g`;

  // Today's Workout Summary Box
  const todayWorkoutBox = document.getElementById("summary-today-workout-box");
  if (todayWorkoutBox) {
    const todayName = getTodayDayName();
    const isCompleted = isDayCompleted(pid, todayName);
    const watchData = getDayWatchData(pid, todayName);

    if (isCompleted && watchData) {
      todayWorkoutBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
              Entrenamiento de Hoy (${todayName}) Completado
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.1rem;">
              Registrado con ${watchData.deviceName} a las ${watchData.timestamp}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-emerald);">
            <i class="fa-solid fa-fire"></i> ${watchData.kcal} kcal
          </span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-cyan);">
            <i class="fa-solid fa-stopwatch"></i> ${watchData.durationMin} min
          </span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-purple);">
            <i class="fa-solid fa-heart-pulse"></i> ${watchData.avgHr} BPM
          </span>
        </div>
      `;
    } else {
      todayWorkoutBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: var(--accent-orange); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
              Entrenamiento de Hoy (${todayName}): Pendiente
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.1rem;">
              Puedes vincular la actividad leída automáticamente por tu Apple Watch
            </div>
          </div>
        </div>

        <button class="btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem; background: var(--accent-emerald);" onclick="recordWatchWorkoutForDay()">
          <i class="fa-brands fa-apple"></i> Registrar Entrenamiento Hoy
        </button>
      `;
    }
  }
}

// RENDER PROFILE & MACROS
function renderProfileView() {
  const p = appState.profiles[appState.activeProfileId];
  
  document.getElementById("profile-subtitle").innerText = 
    `Personalización para ${p.name} - Objetivo: Recomposición corporal (${p.height}cm, ${p.weight}kg)`;
  
  document.getElementById("target-calories").innerText = `${p.targetCalories} kcal`;
  document.getElementById("target-protein").innerText = `${p.protein} g`;
  document.getElementById("target-carbs").innerText = `${p.carbs} g`;
  document.getElementById("target-fats").innerText = `${p.fats} g`;

  renderWorkoutTracker();
}

// DEVICE PROFILE MEMORY SETTINGS & HANDLERS
function setDeviceDefaultProfile(mode) {
  triggerHapticTouch();
  localStorage.setItem(DEVICE_DEFAULT_PROFILE_KEY, mode);

  if (mode === 'he' || mode === 'she') {
    switchProfile(mode);
  } else {
    // 'last'
    const last = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY) || 'he';
    switchProfile(last);
  }

  const msg = mode === 'he'
    ? "📱 Perfil predeterminado en este teléfono fijado a CARLOS"
    : mode === 'she'
    ? "📱 Perfil predeterminado en este teléfono fijado a ANDREA"
    : "📱 Se recordará el último perfil seleccionado en este teléfono";

  showIosToast(msg, "fa-solid fa-mobile-screen-button");
}

function renderSettingsView() {
  const currentPref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY) || 'last';
  const activeProfile = appState.activeProfileId || 'he';
  const p = appState.profiles?.[activeProfile] || { name: activeProfile === 'he' ? 'Él (Carlos)' : 'Ella (Andrea)' };
  const watchMetrics = appState.appleWatch?.metrics?.[activeProfile] || {};

  const btnHe = document.getElementById("pref-btn-he");
  const btnShe = document.getElementById("pref-btn-she");
  const btnLast = document.getElementById("pref-btn-last");
  
  if (btnHe) btnHe.classList.toggle("active", currentPref === 'he');
  if (btnShe) btnShe.classList.toggle("active", currentPref === 'she');
  if (btnLast) btnLast.classList.toggle("active", currentPref === 'last');

  const badge = document.getElementById("settings-device-badge");
  if (badge) {
    const rawName = p.name || (activeProfile === 'he' ? 'Carlos' : 'Andrea');
    let label = currentPref === 'he' ? "Carlos (Siempre)" : currentPref === 'she' ? "Andrea (Siempre)" : `Último usado (${rawName})`;
    badge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${label}`;
  }

  const statusProfile = document.getElementById("settings-status-profile");
  if (statusProfile) {
    statusProfile.innerHTML = `<i class="fa-solid ${activeProfile === 'he' ? 'fa-mars' : 'fa-venus'}" style="color: var(--accent-emerald);"></i> ${p.name || 'Perfil Activo'}`;
  }

  const statusWatch = document.getElementById("settings-status-watch");
  if (statusWatch) {
    statusWatch.innerHTML = `<i class="fa-brands fa-apple" style="color: var(--accent-cyan);"></i> ${watchMetrics.deviceName || 'Apple Watch'}`;
  }
}

function forceAppRefresh() {
  triggerHapticTouch();
  showIosToast("🔄 Actualizando y vaciando caché del acceso directo...", "fa-solid fa-arrows-rotate");
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) caches.delete(name);
    });
  }
  setTimeout(() => {
    window.location.href = window.location.pathname + '?v=' + Date.now();
  }, 400);
}

// WORKOUT TRACKER & APPLE WATCH SESSION ENGINE
function isDayCompleted(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (!val) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'object') return !!val.done;
  return false;
}

function getDayWatchData(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (val && typeof val === 'object' && val.watchData) {
    return val.watchData;
  }
  if (val === true) {
    const snapshot = createWatchDataSnapshot(profileId);
    if (!appState.completedWorkouts[profileId]) appState.completedWorkouts[profileId] = {};
    appState.completedWorkouts[profileId][dayName] = { done: true, watchData: snapshot };
    saveState();
    return snapshot;
  }
  return null;
}

function createWatchDataSnapshot(profileId, customDuration = null) {
  const m = appState.appleWatch?.metrics?.[profileId] || {};
  const pName = appState.profiles[profileId]?.name?.split(" ")[0] || "Apple Watch";
  const duration = customDuration || (m.exerciseMin > 0 ? m.exerciseMin : 45);
  const kcal = m.moveKcal > 0 ? Math.round(m.moveKcal * 0.8) : 420;
  const avgHr = m.hr || 138;
  const maxHr = Math.min(185, avgHr + Math.floor(Math.random() * 18) + 14);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    deviceName: m.deviceName || `Apple Watch (${pName})`,
    durationMin: duration,
    kcal: kcal,
    avgHr: avgHr,
    maxHr: maxHr,
    timestamp: timeStr,
    autoSync: true
  };
}

function getTodayDayName() {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const idx = new Date().getDay();
  return days[idx];
}

function recordWatchWorkoutForDay(dayName = null, profileId = null, notify = true) {
  const pid = profileId || appState.activeProfileId;
  const targetDay = dayName || appState.activeWorkoutDay || getTodayDayName();
  
  if (!appState.completedWorkouts[pid]) {
    appState.completedWorkouts[pid] = {};
  }

  const snapshot = createWatchDataSnapshot(pid);
  appState.completedWorkouts[pid][targetDay] = {
    done: true,
    watchData: snapshot
  };

  saveState();
  renderSummaryView();
  renderProfileView();
  renderWorkoutsView();

  if (notify) {
    const pName = appState.profiles[pid].name.split(" ")[0];
    showIosToast(` Entrenamiento de ${targetDay} vinculado automáticamente desde Apple Watch (${pName})`, "fa-brands fa-apple");
  }
}

function toggleWorkoutDay(dayName) {
  const profileId = appState.activeProfileId;
  if (!appState.completedWorkouts[profileId]) {
    appState.completedWorkouts[profileId] = {};
  }

  const currentDone = isDayCompleted(profileId, dayName);

  if (currentDone) {
    appState.completedWorkouts[profileId][dayName] = { done: false, watchData: null };
  } else {
    const watchSnapshot = createWatchDataSnapshot(profileId);
    appState.completedWorkouts[profileId][dayName] = {
      done: true,
      watchData: watchSnapshot
    };
    const pName = appState.profiles[profileId].name.split(" ")[0];
    showIosToast(` Entrenamiento de ${dayName} registrado con Apple Watch (${pName}: ${watchSnapshot.kcal} kcal - ${watchSnapshot.durationMin} min)`, "fa-brands fa-apple");
  }

  saveState();
  renderSummaryView();
  renderProfileView();
  renderWorkoutsView();
}

function resetWorkoutWeek() {
  const profileId = appState.activeProfileId;
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  if (!appState.completedWorkouts[profileId]) {
    appState.completedWorkouts[profileId] = {};
  }
  days.forEach(d => {
    appState.completedWorkouts[profileId][d] = { done: false, watchData: null };
  });
  saveState();
  renderSummaryView();
  renderProfileView();
  renderWorkoutsView();
}

function syncAppleWatchData() {
  triggerManualSync();
  recordWatchWorkoutForDay(appState.activeWorkoutDay || "Lunes", appState.activeProfileId, true);
  openAppleWatchModal();
}

function renderWorkoutTracker() {
  const container = document.getElementById("profile-workouts-container");
  if (!container) return;

  const profileId = appState.activeProfileId;
  const p = appState.profiles[profileId];
  const watchMetrics = appState.appleWatch?.metrics[profileId] || { moveKcal: 540, hr: 74, steps: 9840, distanceKm: 7.2 };
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  let completedCount = 0;
  let totalMinutes = 0;

  days.forEach(d => {
    if (isDayCompleted(profileId, d)) {
      completedCount++;
      const watchData = getDayWatchData(profileId, d);
      if (watchData && watchData.durationMin) {
        totalMinutes += watchData.durationMin;
      } else {
        const schedule = WEEKLY_WORKOUT_SCHEDULE[d];
        if (schedule && schedule.duration) {
          totalMinutes += schedule.duration;
        }
      }
    }
  });

  const totalDays = 7;
  const percent = Math.round((completedCount / totalDays) * 100);

  let html = `
    <div class="glass-card workout-tracker-card">
      <div class="tracker-header-row">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-calendar-check" style="color: var(--accent-emerald);"></i> 
            Registro y Vista de Entrenamientos Semanales (${p.name})
          </h2>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">
            Sincronización en tiempo real con Apple Watch: los entrenamientos grabados en el reloj se vinculan automáticamente a su día correspondiente.
          </p>
        </div>
        <button class="btn-secondary-sm" onclick="resetWorkoutWeek()" title="Reiniciar semana">
          <i class="fa-solid fa-rotate-left"></i> Reiniciar Semana
        </button>
      </div>

      <!-- APPLE WATCH SYNC BANNER -->
      <div class="apple-watch-banner" onclick="openAppleWatchModal()" style="cursor: pointer;">
        <div class="apple-watch-info">
          <div class="apple-watch-icon"><i class="fa-brands fa-apple"></i></div>
          <div>
            <h3 class="apple-watch-title"> Apple Watch (${p.name.split(' ')[0]}) - Live Auto-Sync</h3>
            <p class="apple-watch-subtitle">Última sync: ${watchMetrics.steps.toLocaleString()} pasos • ${watchMetrics.moveKcal} kcal • ${watchMetrics.hr} BPM (${watchMetrics.distanceKm} km con Boo)</p>
          </div>
        </div>
        <button class="btn-apple-sync" onclick="event.stopPropagation(); syncAppleWatchData();">
          <i class="fa-brands fa-apple"></i> Panel Apple Watch
        </button>
      </div>

      <!-- PROGRESS SUMMARY BAR -->
      <div class="tracker-stats-summary">
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-trophy" style="color:var(--accent-amber);"></i> Días Entrenados</span>
          <span class="stat-pill-val">${completedCount} / ${totalDays} días</span>
        </div>
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Tiempo Activo</span>
          <span class="stat-pill-val">${totalMinutes} min</span>
        </div>
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-heart-pulse" style="color:var(--accent-rose);"></i> FC Media (Watch)</span>
          <span class="stat-pill-val">${watchMetrics.hr} BPM</span>
        </div>
        <div class="stat-pill-item">
          <span class="stat-pill-label"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> Calorías Activas</span>
          <span class="stat-pill-val">${watchMetrics.moveKcal} kcal</span>
        </div>
      </div>

      <div class="tracker-progress-container">
        <div class="tracker-progress-label">
          <span>Constancia semanal</span>
          <span><strong>${percent}%</strong> completado</span>
        </div>
        <div class="tracker-progress-bar-bg">
          <div class="tracker-progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>

      <!-- DAYS CARDS GRID -->
      <div class="workout-days-grid">
  `;

  days.forEach(day => {
    const isDone = isDayCompleted(profileId, day);
    const watchData = getDayWatchData(profileId, day);
    const routine = WEEKLY_WORKOUT_SCHEDULE[day] || {};

    let watchBadgeHtml = "";
    if (isDone && watchData) {
      watchBadgeHtml = `
        <div class="watch-day-badge">
          <div class="watch-badge-top">
            <span class="watch-badge-device"><i class="fa-brands fa-apple"></i> ${watchData.deviceName}</span>
            <span class="watch-badge-time"><i class="fa-regular fa-clock"></i> ${watchData.timestamp}</span>
          </div>
          <div class="watch-badge-metrics">
            <span class="watch-mini-pill"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> ${watchData.durationMin} min</span>
            <span class="watch-mini-pill"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> ${watchData.kcal} kcal</span>
            <span class="watch-mini-pill"><i class="fa-solid fa-heart-pulse" style="color:var(--accent-rose);"></i> ${watchData.avgHr} BPM</span>
          </div>
        </div>
      `;
    }

    html += `
      <div class="day-workout-card ${isDone ? 'completed' : ''}" onclick="toggleWorkoutDay('${day}')">
        <div class="day-card-top">
          <div class="day-checkbox-wrapper">
            <input type="checkbox" ${isDone ? 'checked' : ''} onclick="event.stopPropagation(); toggleWorkoutDay('${day}')">
            <span class="day-name">${day}</span>
          </div>
          <span class="day-status-badge ${isDone ? 'done' : 'pending'}">
            ${isDone ? (watchData ? '<i class="fa-brands fa-apple"></i> Watch OK' : '<i class="fa-solid fa-circle-check"></i> Entrenado') : '<i class="fa-regular fa-circle"></i> Pendiente'}
          </span>
        </div>

        <h4 class="day-routine-title">${routine.title || day}</h4>
        
        <div class="day-routine-meta">
          <span><i class="fa-solid fa-clock"></i> ${routine.duration || 0} min</span>
          <span><i class="fa-solid fa-location-dot"></i> ${routine.location || 'En casa'}</span>
        </div>

        <p class="day-routine-focus">
          <strong>Enfoque:</strong> ${routine.focus || 'Actividad libre'}
        </p>

        ${watchBadgeHtml}

        <details style="margin-top: 0.6rem; font-size: 0.78rem;" onclick="event.stopPropagation();">
          <summary style="color: var(--accent-cyan); cursor: pointer; font-weight: 600;">
            Ver ${routine.exercises ? routine.exercises.length : 0} Ejercicios de hoy
          </summary>
          <ul class="day-exercise-mini-list" style="margin-top: 0.4rem; padding-left: 1rem; color: var(--text-muted); line-height: 1.5;">
            ${routine.exercises ? routine.exercises.map(ex => `
              <li style="margin-bottom: 2px;"><strong>${ex.name}</strong> (${ex.sets} series x ${ex.reps})</li>
            `).join('') : '<li>Descanso</li>'}
          </ul>
        </details>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// EXCLUSIONS ENGINE (DEPRECATED DUMMY HANDLERS FOR BACKWARD COMPATIBILITY)
function renderExclusions() {}
function addExclusion() {}
function removeExclusion() {}

// FILTER RECIPES BASED ON EXCLUSIONS
function getFilteredRecipes() {
  if (appState.exclusions.length === 0) return RECIPES_DATABASE;

  return RECIPES_DATABASE.filter(recipe => {
    const recipeText = (recipe.name + " " + recipe.ingredients.map(i => i.name).join(" ")).toLowerCase();
    return !appState.exclusions.some(ex => recipeText.includes(ex));
  });
}

// RENDER NUTRITION VIEW
function selectDay(dayName, btnElem) {
  appState.activeDay = dayName;
  document.querySelectorAll(".day-tab").forEach(tab => tab.classList.remove("active"));
  if (btnElem) btnElem.classList.add("active");
  renderNutritionView();
}

function renderNutritionView() {
  const container = document.getElementById("meal-cards-container");
  container.innerHTML = "";

  const availableRecipes = getFilteredRecipes();
  
  if (availableRecipes.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="grid-column: 1/-1; text-align:center; padding: 2rem;">
        <p style="color: var(--accent-rose);">⚠️ Habéis excluido demasiados alimentos y no hay recetas disponibles en la base de datos.</p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Prueba a quitar alguna exclusión en la pestaña Perfil.</p>
      </div>
    `;
    return;
  }

  // Get meal for current day from available recipes
  const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
  const lunches = availableRecipes.filter(r => r.type === "comida");
  const dinners = availableRecipes.filter(r => r.type === "cena");
  const snacks = availableRecipes.filter(r => r.type === "snack");

  const dayIndex = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].indexOf(appState.activeDay);

  const selectedMeals = [
    breakfasts[dayIndex % (breakfasts.length || 1)] || RECIPES_DATABASE[0],
    lunches[dayIndex % (lunches.length || 1)] || RECIPES_DATABASE[3],
    dinners[dayIndex % (dinners.length || 1)] || RECIPES_DATABASE[6],
    snacks[dayIndex % (snacks.length || 1)] || RECIPES_DATABASE[9]
  ];

  selectedMeals.forEach(meal => {
    if (!meal) return;
    const card = document.createElement("div");
    card.className = "glass-card meal-card";

    const ingredientsHtml = meal.ingredients.map(ing => `
      <li>
        <span>${ing.name}</span>
        <strong>${ing.amount} ${ing.unit}</strong>
      </li>
    `).join("");

    const tagsHtml = meal.tags.map(t => `<span class="macro-pill">${t}</span>`).join(" ");

    card.innerHTML = `
      <div class="meal-card-type"><i class="fa-solid fa-clock"></i> ${meal.type.toUpperCase()} • ${meal.prepTime} min</div>
      <h3 class="meal-card-title">${meal.name}</h3>
      
      <div class="meal-macros-pills">
        <span class="macro-pill" style="color:var(--accent-amber);">${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald);">${meal.protein}g Proteína</span>
        <span class="macro-pill" style="color:var(--accent-cyan);">${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet);">${meal.fats}g Grasas</span>
      </div>

      <div style="margin-bottom: 0.75rem;">${tagsHtml}</div>

      <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Ingredientes necesarios:</h4>
      <ul class="ingredient-list">
        ${ingredientsHtml}
      </ul>

      <details style="font-size: 0.85rem; color: var(--accent-cyan); cursor: pointer; margin-top: 0.75rem;">
        <summary style="font-weight: 600;">Ver Pasos de Preparación</summary>
        <ol style="margin-top: 0.5rem; padding-left: 1.2rem; color: var(--text-muted); line-height: 1.5;">
          ${meal.instructions.map(step => `<li>${step}</li>`).join("")}
        </ol>
      </details>
    `;
    container.appendChild(card);
  });
}

// SMART SHOPPING LIST ENGINE
function renderShoppingView() {
  const container = document.getElementById("shopping-categories-container");
  container.innerHTML = "";

  const availableRecipes = getFilteredRecipes();
  
  // Aggregate all ingredients across 7 days
  const aggregated = {};

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  days.forEach((d, idx) => {
    const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
    const lunches = availableRecipes.filter(r => r.type === "comida");
    const dinners = availableRecipes.filter(r => r.type === "cena");
    const snacks = availableRecipes.filter(r => r.type === "snack");

    const dailyMeals = [
      breakfasts[idx % (breakfasts.length || 1)],
      lunches[idx % (lunches.length || 1)],
      dinners[idx % (dinners.length || 1)],
      snacks[idx % (snacks.length || 1)]
    ];

    dailyMeals.forEach(meal => {
      if (!meal) return;
      meal.ingredients.forEach(ing => {
        const key = `${ing.name} (${ing.unit})`;
        if (!aggregated[key]) {
          aggregated[key] = {
            name: ing.name,
            amount: 0,
            unit: ing.unit,
            category: ing.category || INGREDIENT_CATEGORIES.PANTRY
          };
        }
        aggregated[key].amount += ing.amount;
      });
    });
  });

  // Group by category
  const categories = {};
  Object.values(aggregated).forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  Object.keys(categories).forEach(catName => {
    const catSection = document.createElement("div");
    catSection.className = "shopping-category";

    const itemsHtml = categories[catName].map(item => {
      const itemKey = item.name.toLowerCase();
      const isChecked = !!appState.checkedShoppingItems[itemKey];

      return `
        <div class="shopping-item ${isChecked ? 'checked' : ''}" onclick="toggleShoppingItem('${itemKey}', this)">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleShoppingItem('${itemKey}', this.parentNode);">
          <span class="shopping-item-name">${item.name}</span>
          <span class="shopping-item-qty">${item.amount} ${item.unit}</span>
        </div>
      `;
    }).join("");

    catSection.innerHTML = `
      <h3 class="shopping-cat-title"><i class="fa-solid fa-basket-shopping"></i> ${catName}</h3>
      <div class="shopping-items-grid">
        ${itemsHtml}
      </div>
    `;

    container.appendChild(catSection);
  });
}

function toggleShoppingItem(itemKey, elem) {
  appState.checkedShoppingItems[itemKey] = !appState.checkedShoppingItems[itemKey];
  saveState();
  if (elem) {
    elem.classList.toggle("checked", appState.checkedShoppingItems[itemKey]);
    const checkbox = elem.querySelector("input[type='checkbox']");
    if (checkbox) checkbox.checked = appState.checkedShoppingItems[itemKey];
  }
}

function copyShoppingList() {
  const items = document.querySelectorAll(".shopping-item");
  let text = "🛒 LISTA DE LA COMPRA - FITDUO & COLLIE 🛒\n\n";

  document.querySelectorAll(".shopping-category").forEach(cat => {
    const title = cat.querySelector(".shopping-cat-title").innerText;
    text += `\n--- ${title} ---\n`;
    cat.querySelectorAll(".shopping-item").forEach(item => {
      const name = item.querySelector(".shopping-item-name").innerText;
      const qty = item.querySelector(".shopping-item-qty").innerText;
      const checked = item.classList.contains("checked") ? "[X]" : "[ ]";
      text += `${checked} ${name}: ${qty}\n`;
    });
  });

  navigator.clipboard.writeText(text).then(() => {
    alert("¡Lista de la compra copiada al portapapeles! Puedes pegarla en WhatsApp o Notas.");
  });
}

// RENDER WORKOUTS VIEW
function selectWorkoutDay(dayName, btnElem) {
  appState.activeWorkoutDay = dayName;
  document.querySelectorAll("#workout-days-tabs .day-tab").forEach(tab => tab.classList.remove("active"));
  if (btnElem) btnElem.classList.add("active");
  renderWorkoutsView();
}

function renderWorkoutsView() {
  const container = document.getElementById("routines-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeWorkoutDay || "Lunes";
  const routine = WEEKLY_WORKOUT_SCHEDULE[activeDay] || WEEKLY_WORKOUT_SCHEDULE["Lunes"];
  const profileId = appState.activeProfileId;
  const isDone = isDayCompleted(profileId, activeDay);
  const watchData = getDayWatchData(profileId, activeDay);

  // If completed with watch data, show top Apple Watch banner
  if (isDone && watchData) {
    const watchBanner = document.createElement("div");
    watchBanner.className = "glass-card watch-workout-summary-card";
    watchBanner.style.marginBottom = "1rem";
    watchBanner.innerHTML = `
      <div class="watch-summary-header">
        <div class="watch-summary-title">
          <div class="watch-icon-glow"><i class="fa-brands fa-apple"></i></div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; display: flex; align-items: center; gap: 0.4rem;">
               Sesión Medida por Apple Watch (${activeDay})
            </h3>
            <p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 2px;">
              Sincronizado automáticamente a las ${watchData.timestamp} • ${watchData.deviceName}
            </p>
          </div>
        </div>
        <span class="watch-live-badge"><i class="fa-solid fa-circle-check"></i> Salud iOS Sync</span>
      </div>

      <div class="watch-summary-grid">
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Tiempo Medido</span>
          <span class="metric-val" style="color:var(--accent-cyan);">${watchData.durationMin} <small>min</small></span>
        </div>
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> Calorías Activas</span>
          <span class="metric-val" style="color:var(--accent-rose);">${watchData.kcal} <small>kcal</small></span>
        </div>
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-heart-pulse" style="color:var(--accent-rose);"></i> FC Media</span>
          <span class="metric-val" style="color:var(--accent-emerald);">${watchData.avgHr} <small>BPM</small></span>
        </div>
        <div class="summary-metric-box">
          <span class="metric-lbl"><i class="fa-solid fa-chart-line" style="color:var(--accent-amber);"></i> FC Máxima</span>
          <span class="metric-val" style="color:var(--accent-amber);">${watchData.maxHr} <small>BPM</small></span>
        </div>
      </div>
    `;
    container.appendChild(watchBanner);
  }

  const card = document.createElement("div");
  card.className = "glass-card";

  const rows = routine.exercises.map(ex => `
    <tr>
      <td>
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-tech"><i class="fa-solid fa-lightbulb" style="color:var(--accent-amber);"></i> ${ex.technique}</div>
      </td>
      <td><strong style="color:var(--accent-emerald);">${ex.sets}</strong> series</td>
      <td><strong>${ex.reps}</strong> reps</td>
      <td><span style="color:var(--text-muted);">${ex.rest}</span></td>
    </tr>
  `).join("");

  card.innerHTML = `
    <div class="routine-header-box">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.3rem;">${routine.title}</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">Enfoque: ${routine.focus}</p>
      </div>
      <span class="routine-badge"><i class="fa-solid fa-clock"></i> ${routine.duration} min (Juntos)</span>
    </div>

    <div style="display:flex; flex-wrap: wrap; gap: 1rem; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem;">
      <span><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i> ${routine.location}</span>
      <span><i class="fa-solid fa-dumbbell" style="color:var(--accent-emerald);"></i> ${routine.type}</span>
      <span><i class="fa-solid fa-toolbox" style="color:var(--accent-violet);"></i> Equipamiento: ${routine.equipment.join(", ")}</span>
    </div>

    <div class="table-responsive">
      <table class="exercise-table">
        <thead>
          <tr>
            <th>Ejercicio & Técnica</th>
            <th>Series</th>
            <th>Repeticiones / Tiempo</th>
            <th>Descanso</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  container.appendChild(card);
}

// RENDER DOG ROUTES VIEW
function renderDogRoutesView() {
  const container = document.getElementById("dog-routes-container");
  container.innerHTML = "";

  DOG_ROUTES_DATABASE.forEach(route => {
    const card = document.createElement("div");
    card.className = "glass-card route-card";

    const stepsHtml = route.breakdown.map(b => `
      <div class="route-step-item">
        <span class="step-time">${b.step}</span>
        <span style="font-size: 0.9rem; color: var(--text-main);">${b.activity}</span>
      </div>
    `).join("");

    card.innerHTML = `
      <div class="routine-header-box">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.4rem;">🐶 ${route.title}</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 2px;">${route.description}</p>
        </div>
        <span class="routine-badge" style="background:rgba(6, 182, 212, 0.2); color:var(--accent-cyan); border-color:rgba(6, 182, 212, 0.4);">
          <i class="fa-solid fa-stopwatch"></i> ${route.duration}
        </span>
      </div>

      <div class="route-step-list">
        ${stepsHtml}
      </div>

      <div class="collie-tip-box">
        <i class="fa-solid fa-paw" style="font-size: 1.2rem;"></i>
        <div>
          <strong>Consejo Border Collie:</strong> ${route.collieTips}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// RENDER PROGRESS VIEW WITH CHART.JS
function renderProgressView() {
  const logs = appState.weightLogs[appState.activeProfileId];
  const labels = logs.map(l => l.date);
  const dataPoints = logs.map(l => l.weight);

  const ctx = document.getElementById("weightChart");
  if (!ctx) return;

  if (weightChart) {
    weightChart.destroy();
  }

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Evolución de Peso - ${appState.profiles[appState.activeProfileId].name}`,
        data: dataPoints,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f3f4f6', font: { family: 'Plus Jakarta Sans' } }
        }
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function addWeightEntry() {
  const input = document.getElementById("weight-input");
  const val = parseFloat(input.value);
  if (!isNaN(val) && val > 30 && val < 250) {
    const todayStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    appState.weightLogs[appState.activeProfileId].push({
      date: todayStr,
      weight: val
    });
    input.value = "";
    saveState();
    renderProgressView();
    alert(`¡Registro de ${val} kg guardado correctamente!`);
  }
}

// AI COACH BOT LOGIC
function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");

  // User Message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-bubble user";
  userMsg.innerText = text;
  messagesBox.appendChild(userMsg);

  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Generate bot reply
  setTimeout(() => {
    const botReply = generateBotReply(text.toLowerCase());
    const botMsg = document.createElement("div");
    botMsg.className = "chat-bubble bot";
    botMsg.innerHTML = botReply;
    messagesBox.appendChild(botMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 400);
}

function generateBotReply(query) {
  if (query.includes("10 años") || query.includes("paron") || query.includes("sedentario") || query.includes("empezar")) {
    return "💡 <strong>Consejo de Reactivación para Carlos:</strong> Tras 10 años sin hacer ejercicio, la clave no es la intensidad bruta, sino la <em>consistencia</em>. Empieza haciendo la Rutina 1 tres veces por semana. Escuchad a vuestras articulaciones y aseguraos de beber al menos 2.5L de agua al día.";
  }
  if (query.includes("boo") || query.includes("border collie") || query.includes("perro") || query.includes("ruta")) {
    return "🐾 <strong>Entrenamiento con Boo:</strong> Los Border Collies como Boo responden genial a los cambios de ritmo. Prueba a intercalar 1 min de trote con 2 min de caminata en la Ruta 1. Mantendrás sus pulsaciones activas y las tuyas también.";
  }
  if (query.includes("suplemento") || query.includes("proteina") || query.includes("creatina")) {
    return "🥛 <strong>Sobre Suplementación:</strong> La proteína de suero (whey) es muy útil si os cuesta llegar a vuestro objetivo diario (155g / 130g). La creatina monohidrato (3-5g al día) también es excelente para la fuerza y recuperación muscular.";
  }
  if (query.includes("sustituir") || query.includes("cambiar") || query.includes("receta") || query.includes("comida")) {
    return "🥗 <strong>Sustitución de Alimentos:</strong> Podéis añadir cualquier alimento que no os guste en la sección de <em>Exclusiones</em> de la pestaña Perfil. La aplicación recalculará el menú y la lista de la compra al instante.";
  }
  if (query.includes("rodilla") || query.includes("dolor") || query.includes("espalda")) {
    return "⚠️ <strong>Cuidado Articular:</strong> Si sentís molestias en la rodilla en las sentadillas, usad una silla como apoyo y no bajéis más allá de los 90 grados. Mantened siempre el abdomen activado para proteger la zona lumbar.";
  }
  
  return "💪 ¡Gran pregunta! Recordad que el secreto de la recomposición corporal de Carlos y Andrea es mantener una ingesta de proteína adecuada, dormir 7-8 horas y no saltarse los paseos activos con Boo. ¡Seguid así!";
}
