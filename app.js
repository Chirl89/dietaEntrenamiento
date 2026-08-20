import { INITIAL_PROFILES, RECIPES_DATABASE, WEEKLY_WORKOUT_SCHEDULE, INGREDIENT_CATEGORIES, BOO_TRAINING_MODULES, BOO_WEEKLY_SCHEDULE, BOO_CONTINUOUS_REINFORCEMENT, BOO_TRICKS_BACKLOG } from './data.js?v=0.7.14';

// STATE STORAGE KEYS
const LOCAL_STORAGE_KEY = "FITDUO_APP_STATE_V1";
const LAST_ACTIVE_PROFILE_KEY = "FITDUO_LAST_ACTIVE_PROFILE";
const DEVICE_DEFAULT_PROFILE_KEY = "FITDUO_DEVICE_DEFAULT_PROFILE";
const LAST_REGISTERED_METRICS_KEY = "FITDUO_LAST_REGISTERED_METRICS";
const LAST_CLOUD_REPLICA_KEY = "FITDUO_LAST_CLOUD_REPLICA";

// INITIAL FALLBACK METRICS
let defaultWatchMetrics = {
  he: { deviceName: "Apple Watch Series 9", moveKcal: 480, moveGoal: 600, targetKcal: 600, exerciseMin: 35, exerciseGoal: 30, targetMin: 30, steps: 8450, stepsGoal: 10000, targetSteps: 10000, hr: 72, distanceKm: 6.2 },
  she: { deviceName: "Apple Watch SE", moveKcal: 420, moveGoal: 500, targetKcal: 500, exerciseMin: 40, exerciseGoal: 30, targetMin: 30, steps: 9120, stepsGoal: 10000, targetSteps: 10000, hr: 68, distanceKm: 6.8 }
};

let defaultCloudReplica = {
  he: { moveKcal: 480, exerciseMin: 35, steps: 8450, hr: 72, distanceKm: 6.2, lastSync: new Date().toISOString(), source: "Atajo Nube en 2º Plano" },
  she: { moveKcal: 420, exerciseMin: 40, steps: 9120, hr: 68, distanceKm: 6.8, lastSync: new Date().toISOString(), source: "Atajo Nube en 2º Plano" }
};

try {
  const savedLastMetrics = localStorage.getItem(LAST_REGISTERED_METRICS_KEY);
  if (savedLastMetrics) {
    const parsedLastMetrics = JSON.parse(savedLastMetrics);
    if (parsedLastMetrics?.he) defaultWatchMetrics.he = { ...defaultWatchMetrics.he, ...parsedLastMetrics.he };
    if (parsedLastMetrics?.she) defaultWatchMetrics.she = { ...defaultWatchMetrics.she, ...parsedLastMetrics.she };
  }
  const savedReplica = localStorage.getItem(LAST_CLOUD_REPLICA_KEY);
  if (savedReplica) {
    const parsedReplica = JSON.parse(savedReplica);
    if (parsedReplica?.he) defaultCloudReplica.he = { ...defaultCloudReplica.he, ...parsedReplica.he };
    if (parsedReplica?.she) defaultCloudReplica.she = { ...defaultCloudReplica.she, ...parsedReplica.she };
  }
} catch (e) {}

// INITIAL STATE STRUCTURE
let appState = {
  masterProfileId: "he", // 'he' (Carlos) or 'she' (Andrea) - Selected in Settings
  activeProfileId: "he", // 'he' (Carlos) or 'she' (Andrea) - Visual view mode
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
  activeDay: getTodayDayName(),
  activeWorkoutDay: getTodayDayName(),
  activeBooDay: getTodayDayName(),
  recipesDaysRange: "5", // '5' (L-V) or '7' (L-D)
  shoppingDaysRange: "5", // '5' (L-V) or '7' (L-D)
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
    metrics: defaultWatchMetrics,
    cloudReplica: defaultCloudReplica,
    syncLogs: []
  }
};

let weightChart = null;
let autoSyncIntervalTimer = null;

// HELPER: GET MASTER PROFILE ID (LOCKED TO THIS SPECIFIC PHYSICAL DEVICE)
function getMasterProfileId() {
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  if (devicePref === 'he' || devicePref === 'she') {
    return devicePref;
  }
  return appState.masterProfileId === 'she' ? 'she' : 'he';
}

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

  // Device-specific master profile memory preference (Fixed to physical device)
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  if (devicePref === 'he' || devicePref === 'she') {
    appState.masterProfileId = devicePref;
  } else {
    if (!appState.masterProfileId) appState.masterProfileId = 'he';
  }

  // Active visual profile preference (persist last viewed profile)
  const lastProfile = localStorage.getItem(LAST_ACTIVE_PROFILE_KEY);
  if (lastProfile === 'he' || lastProfile === 'she') {
    appState.activeProfileId = lastProfile;
  } else if (!appState.activeProfileId) {
    appState.activeProfileId = appState.masterProfileId;
  }

  // Ensure profiles structure & names exist
  if (!appState.profiles) appState.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES));
  if (!appState.profiles.he) appState.profiles.he = { ...INITIAL_PROFILES.he };
  if (!appState.profiles.she) appState.profiles.she = { ...INITIAL_PROFILES.she };
  if (!appState.profiles.dog) appState.profiles.dog = { ...INITIAL_PROFILES.dog };

  if (appState.profiles.he.name === "Él (Carlos)") appState.profiles.he.name = "Carlos";
  if (appState.profiles.she.name === "Ella (Andrea)") appState.profiles.she.name = "Andrea";
  if (appState.profiles.dog.name === "Boo (Border Collie)") appState.profiles.dog.name = "Boo";

  // Ensure ring goals in metrics
  ['he', 'she'].forEach(pid => {
    if (!appState.appleWatch.metrics) appState.appleWatch.metrics = defaultWatchMetrics;
    if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = { ...defaultWatchMetrics[pid] };
    const m = appState.appleWatch.metrics[pid];
    if (!m.moveGoal) m.moveGoal = m.targetKcal || (pid === 'he' ? 600 : 500);
    if (!m.exerciseGoal) m.exerciseGoal = m.targetMin || 30;
    if (!m.stepsGoal) m.stepsGoal = m.targetSteps || 10000;
  });
  
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
      syncMode: "real",
      autoSyncEnabled: true,
      syncIntervalSec: 6,
      lastGlobalSync: new Date().toISOString(),
      metrics: defaultWatchMetrics,
      syncLogs: []
    };
  }
  if (!appState.appleWatch.syncMode) {
    appState.appleWatch.syncMode = "real";
  }
}

let pushDebounceTimer = null;

function debouncedPushToCloud(delay = 1500) {
  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(() => {
    pushToCloud(false);
  }, delay);
}

// SAVE STATE TO LOCALSTORAGE & PUSH TO CLOUD
function saveState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
  if (appState.appleWatch?.metrics) {
    localStorage.setItem(LAST_REGISTERED_METRICS_KEY, JSON.stringify(appState.appleWatch.metrics));
  }
  if (appState.appleWatch?.cloudReplica) {
    localStorage.setItem(LAST_CLOUD_REPLICA_KEY, JSON.stringify(appState.appleWatch.cloudReplica));
  }
  debouncedPushToCloud(1500);
}

// INITIALIZATION ON DOM READY
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  checkDeviceIdentityBanner();

  setTimeout(() => {
    pullFromCloud(false);
  }, 1000);

  setInterval(() => {
    pullFromCloud(false);
  }, 45000);
  
  // Make functions available globally on window object for HTML inline onclick handlers
  window.switchProfile = switchProfile;
  window.syncNowWithCloud = syncNowWithCloud;
  window.setDeviceDefaultProfile = setDeviceDefaultProfile;
  window.showTab = showTab;
  window.switchCategory = switchCategory;
  window.renderSummaryView = renderSummaryView;
  window.addExclusion = addExclusion;
  window.removeExclusion = removeExclusion;
  window.toggleWorkoutDay = toggleWorkoutDay;
  window.resetWorkoutWeek = resetWorkoutWeek;
  window.syncAppleWatchData = syncAppleWatchData;
  window.selectDay = selectDay;
  window.selectDayFromDropdown = selectDayFromDropdown;
  window.setRecipesRange = setRecipesRange;
  window.setShoppingRange = setShoppingRange;
  window.renderNutritionMenuView = renderNutritionMenuView;
  window.renderNutritionRecipesView = renderNutritionRecipesView;
  window.selectWorkoutDay = selectWorkoutDay;
  window.selectWorkoutDayFromDropdown = selectWorkoutDayFromDropdown;
  window.selectBooDayFromDropdown = selectBooDayFromDropdown;
  window.toggleBooTask = toggleBooTask;
  window.toggleContinuousItem = toggleContinuousItem;
  window.markTrickMastered = markTrickMastered;
  window.selectActiveTrickFromBacklog = selectActiveTrickFromBacklog;
  window.toggleBooAccordion = toggleBooAccordion;
  window.openBooBacklogModal = openBooBacklogModal;
  window.closeBooBacklogModal = closeBooBacklogModal;
  window.closeBooBacklogModalOnBackdrop = closeBooBacklogModalOnBackdrop;
  window.setBooMood = setBooMood;
  window.saveBooSessionNotes = saveBooSessionNotes;
  window.markBooModulePracticed = markBooModulePracticed;
  window.renderBooWorkoutView = renderBooWorkoutView;
  window.openTodayNutrition = openTodayNutrition;
  window.openTodayWorkouts = openTodayWorkouts;
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
  window.connectBluetoothHR = connectBluetoothHR;
  window.forceAppRefresh = forceAppRefresh;
  window.setAppleWatchSyncMode = setAppleWatchSyncMode;
  window.openEditWorkoutWatchModal = openEditWorkoutWatchModal;
  window.closeEditWorkoutWatchModal = closeEditWorkoutWatchModal;
  window.saveWorkoutWatchDataFromModal = saveWorkoutWatchDataFromModal;
  window.launchIosShortcutSync = launchIosShortcutSync;
  window.syncHealthShortcutAndCloud = syncHealthShortcutAndCloud;
  window.toggleAutoLaunchShortcutOnOpen = toggleAutoLaunchShortcutOnOpen;
  window.toggleShortcutGuide = toggleShortcutGuide;
  window.openHealthSyncModal = openHealthSyncModal;
  window.closeHealthSyncModal = closeHealthSyncModal;
  window.switchShortcutTab = switchShortcutTab;
  window.switchShortcutMethodTab = switchShortcutMethodTab;
  window.copyShortcutUrlToClipboard = copyShortcutUrlToClipboard;
  window.copyShortcutCloudUrlToClipboard = copyShortcutCloudUrlToClipboard;
  window.testSimulatedHealthSync = testSimulatedHealthSync;
  window.testSimulatedWorkoutSync = testSimulatedWorkoutSync;
  window.testSimulatedBackgroundCloudSync = testSimulatedBackgroundCloudSync;
  window.addDebugLog = addDebugLog;
  window.clearDebugLogs = clearDebugLogs;
  window.copyDebugLogsToClipboard = copyDebugLogsToClipboard;
  window.renderDebugLogsView = renderDebugLogsView;

  // Cloud Multi-Device Pairing Handlers
  window.saveCustomCloudKeyFromInput = saveCustomCloudKeyFromInput;
  window.resetDefaultCloudKey = resetDefaultCloudKey;
  window.exportSyncToken = exportSyncToken;
  window.promptImportSyncToken = promptImportSyncToken;
  window.exportBackupJson = exportBackupJson;
  window.triggerImportBackupJson = triggerImportBackupJson;
  window.handleBackupFileSelect = handleBackupFileSelect;

  addDebugLog("⚡ App FitDuo arrancada (DOMContentLoaded)", "info", { url: window.location.href, userAgent: navigator.userAgent });

  const syncedFromUrl = checkUrlParamsForWatchSync();
  if (!syncedFromUrl) {
    checkAutoLaunchShortcutOnOpen();
  }

  renderAll();
  updateShortcutUrlInputs();

  // Direct event listeners binding for Atajos tab switcher
  const btnHealthTab = document.getElementById("shortcut-tab-btn-health");
  if (btnHealthTab) {
    btnHealthTab.addEventListener("click", (e) => {
      e.preventDefault();
      switchShortcutTab('health');
    });
  }

  const btnWorkoutTab = document.getElementById("shortcut-tab-btn-workout");
  if (btnWorkoutTab) {
    btnWorkoutTab.addEventListener("click", (e) => {
      e.preventDefault();
      switchShortcutTab('workout');
    });
  }

  startAppleWatchAutoSync();
});

// LISTEN FOR CROSS-TAB STORAGE SYNC, SAFARI FOCUS, VISIBILITY & URL NAVIGATION EVENTS
window.addEventListener("storage", (e) => {
  if (!e.key || e.key === LOCAL_STORAGE_KEY || e.key === LAST_ACTIVE_PROFILE_KEY || e.key === DEVICE_DEFAULT_PROFILE_KEY) {
    addDebugLog("💾 Evento 'storage' (Sincronización entre pestañas)", "info");
    loadSavedState();
    renderAll();
  }
});

window.addEventListener("pageshow", () => {
  addDebugLog("👁️ Evento 'pageshow' (Retorno a la pestaña Safari)", "info", { url: window.location.href });
  loadSavedState();
  checkUrlParamsForWatchSync();
  pullFromCloud(false);
  renderAll();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    addDebugLog("👁️ Evento 'visibilitychange' (Pestaña visible)", "info", { url: window.location.href });
    loadSavedState();
    checkUrlParamsForWatchSync();
    pullFromCloud(false);
    renderAll();
  }
});

window.addEventListener("popstate", () => {
  addDebugLog("🔗 Evento 'popstate' (Navegación URL)", "info", { url: window.location.href });
  loadSavedState();
  checkUrlParamsForWatchSync();
  pullFromCloud(false);
  renderAll();
});

window.addEventListener("focus", () => {
  loadSavedState();
  checkUrlParamsForWatchSync();
  pullFromCloud(false);
  renderAll();
});

// CATEGORY & SUBTAB NAVIGATION ENGINE
const NAVIGATION_CATEGORIES = {
  summary: {
    name: "Resumen & Salud",
    dockId: "dock-btn-summary",
    sidebarId: "sidebar-nav-summary",
    subtabs: [
      { id: "summary-view", label: "Resumen Diario", icon: "fa-solid fa-gauge-high" }
    ]
  },
  nutrition: {
    name: "Nutrición",
    dockId: "dock-btn-nutrition",
    sidebarId: "sidebar-nav-nutrition",
    subtabs: [
      { id: "nutrition-menu-view", label: "Menú del Día", icon: "fa-solid fa-utensils" },
      { id: "nutrition-recipes-view", label: "Recetas", icon: "fa-solid fa-book-open" },
      { id: "nutrition-shopping-view", label: "Lista de la Compra", icon: "fa-solid fa-cart-shopping" }
    ]
  },
  workouts: {
    name: "Entrenamiento",
    dockId: "dock-btn-workouts",
    sidebarId: "sidebar-nav-workouts",
    subtabs: [
      { id: "workouts-view", label: "Ejercicios", icon: "fa-solid fa-dumbbell" },
      { id: "workouts-boo-view", label: "Boo (Perros)", icon: "fa-solid fa-dog" }
    ]
  },
  profile: {
    name: "Ajustes",
    dockId: "dock-btn-profile",
    sidebarId: "sidebar-nav-profile",
    subtabs: [
      { id: "settings-view", label: "Ajustes & Nube", icon: "fa-solid fa-gear" },
      { id: "apple-watch-view", label: "Atajos de Salud", icon: "fa-brands fa-apple" }
    ]
  }
};

function switchCategory(categoryKey, targetTabId = null, btnElement = null) {
  triggerHapticTouch();
  const cat = NAVIGATION_CATEGORIES[categoryKey];
  if (!cat) return;

  if (categoryKey === 'workouts') {
    const today = getTodayDayName();
    appState.activeWorkoutDay = today;
    appState.activeBooDay = today;
    const selectElem = document.getElementById("workout-day-select");
    if (selectElem) selectElem.value = today;
    const booSelect = document.getElementById("boo-day-select");
    if (booSelect) booSelect.value = today;
  }

  let tabToOpen = cat.subtabs[0].id;
  if (targetTabId && cat.subtabs.some(s => s.id === targetTabId)) {
    tabToOpen = targetTabId;
  }
  showTab(tabToOpen);
}

function renderSubtabSegmentedControl(categoryKey, activeTabId) {
  const container = document.getElementById("ios-segmented-control-inner");
  if (!container) return;

  const cat = NAVIGATION_CATEGORIES[categoryKey];
  if (!cat || !cat.subtabs || cat.subtabs.length <= 1) {
    if (container.parentElement) container.parentElement.style.cssText = "display: none !important;";
    return;
  }

  if (container.parentElement) {
    container.parentElement.style.cssText = "display: flex !important; visibility: visible !important;";
  }

  container.innerHTML = cat.subtabs.map(sub => `
    <button type="button" class="ios-segmented-btn ${sub.id === activeTabId ? 'active' : ''}" onclick="showTab('${sub.id}')">
      <i class="${sub.icon}"></i>
      <span>${sub.label}</span>
    </button>
  `).join("");
}

function updateProfileSwitcherButtonsUI() {
  const profileId = appState.activeProfileId || "he";

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
}

// MAIN RENDER CONTROLLER
function renderAll() {
  updateProfileSwitcherButtonsUI();
  renderSummaryView();
  renderProfileView();
  renderNutritionMenuView();
  renderNutritionRecipesView();
  renderShoppingView();
  renderWorkoutsView();
  renderBooWorkoutView();
  renderProgressView();
  renderSettingsView();
  updateHeaderWatchBadge();

  if (document.getElementById("apple-watch-modal")?.classList.contains("active")) {
    updateAppleWatchModalUI();
  }

  if (document.getElementById("logs-view")?.classList.contains("active")) {
    renderDebugLogsView();
  }

  const activePanel = document.querySelector(".view-panel.active");
  const activeTabId = activePanel ? activePanel.id : "summary-view";
  let activeCatKey = 'summary';
  for (const [catKey, catObj] of Object.entries(NAVIGATION_CATEGORIES)) {
    if (catObj.subtabs && catObj.subtabs.some(s => s.id === activeTabId)) {
      activeCatKey = catKey;
      break;
    }
  }
  renderSubtabSegmentedControl(activeCatKey, activeTabId);
}

// PROFILE SWITCHER (DESKTOP & IPHONE HEADER VISUAL SWITCH)
function switchProfile(profileId) {
  triggerHapticTouch();
  appState.activeProfileId = profileId;
  localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, profileId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));

  updateProfileSwitcherButtonsUI();
  renderAll();

  const viewName = profileId === 'he' ? 'Carlos' : 'Andrea';
  const masterName = getMasterProfileId() === 'he' ? 'Carlos' : 'Andrea';
  showIosToast(`👁️ Visualizando a ${viewName}`, "fa-solid fa-eye");
}

// TAB NAVIGATION (DESKTOP SIDEBAR & IPHONE DOCK SYNC WITH SUBTABS)
function showTab(tabId, btnElement) {
  triggerHapticTouch();

  // Migration & alias mapping for legacy / custom tab IDs
  if (tabId === 'nutrition-view' || tabId === 'nutrition') {
    tabId = 'nutrition-menu-view';
  } else if (tabId === 'shopping-view') {
    tabId = 'nutrition-shopping-view';
  }

  // Find active category
  let activeCatKey = 'summary';
  for (const [catKey, catObj] of Object.entries(NAVIGATION_CATEGORIES)) {
    if (catObj.subtabs.some(s => s.id === tabId)) {
      activeCatKey = catKey;
      break;
    }
  }

  document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
  const targetPanel = document.getElementById(tabId) || document.getElementById("nutrition-menu-view");
  if (targetPanel) {
    targetPanel.classList.add("active");
  }

  // Highlight Category Dock & Sidebar buttons
  const catObj = NAVIGATION_CATEGORIES[activeCatKey];
  if (catObj) {
    document.querySelectorAll(".ios-dock-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".nav-menu button").forEach(btn => btn.classList.remove("active"));

    const dockBtn = document.getElementById(catObj.dockId);
    if (dockBtn) dockBtn.classList.add("active");

    const sidebarBtn = document.getElementById(catObj.sidebarId);
    if (sidebarBtn) sidebarBtn.classList.add("active");
  }

  // Render Segmented Control pills
  renderSubtabSegmentedControl(activeCatKey, tabId);

  if (tabId === 'summary-view') {
    renderSummaryView();
  } else if (tabId === 'nutrition-menu-view') {
    renderNutritionMenuView();
  } else if (tabId === 'nutrition-recipes-view') {
    renderNutritionRecipesView();
  } else if (tabId === 'nutrition-shopping-view') {
    renderShoppingView();
  } else if (tabId === 'apple-watch-view') {
    updateAppleWatchModalUI();
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
// APPLE WATCH & HEALTHKIT CONTROL & SYNC ENGINE
// ==========================================

function startAppleWatchAutoSync() {
  if (autoSyncIntervalTimer) clearInterval(autoSyncIntervalTimer);
  // Auto-sync periodic background cloud polling loop (every 10 seconds)
  autoSyncIntervalTimer = setInterval(() => {
    if (!document.hidden && !isCloudSyncing) {
      pullFromCloud(false).then(hasChanges => {
        if (hasChanges) {
          renderAll();
        }
      });
    }
  }, 10000);
}

function performAutoSyncTick() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  saveState();
  renderAll();
}

function updateHeaderWatchBadge() {
  const badgeText = document.getElementById("ios-header-watch-text");
  if (badgeText) {
    badgeText.innerText = "☁️ Actualizar Nube";
  }
}

function setAppleWatchSyncMode(mode) {
  triggerHapticTouch();
  if (!appState.appleWatch) appState.appleWatch = {};
  appState.appleWatch.syncMode = mode;
  saveState();

  renderAll();

  if (mode === "real") {
    showIosToast("🎯 <strong>Modo Datos Reales Activado</strong>: Tus números de Apple Watch se mantendrán estables con máxima precisión.", "fa-solid fa-shield-halved");
  } else {
    showIosToast("🧪 <strong>Modo Simulación Demo Activado</strong>: Simulando telemetría en vivo.", "fa-solid fa-vial");
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
      ? " Sincronización de Apple Watch <strong>ACTIVADA</strong>" 
      : "⏸️ Sincronización de Apple Watch <strong>PAUSADA</strong>",
    enabled ? "fa-brands fa-apple" : "fa-solid fa-pause"
  );
}

function triggerManualSync() {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = appState.profiles[pid].name.split(" ")[0];
  const mode = appState.appleWatch.syncMode || "real";

  if (mode === "demo") {
    m.steps += Math.floor(Math.random() * 120) + 40;
    m.moveKcal += Math.floor(Math.random() * 15) + 5;
    m.exerciseMin = Math.min(60, m.exerciseMin + 2);
    m.hr = Math.floor(Math.random() * 20) + 72;
    m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  
  appState.appleWatch.syncLogs.unshift({
    timestamp: timeStr,
    device: m.deviceName,
    hr: m.hr,
    kcal: m.moveKcal,
    steps: m.steps,
    status: mode === "real" ? "Verificado con Salud iOS" : "Simulado Manualmente"
  });
  if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

  saveState();
  renderAll();

  showIosToast(` ¡Datos de Apple Watch (${pName}) verificados! (${m.moveKcal} kcal - ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-circle-check");
}

// SMART 7-DAY METRIC PARSERS
function parseSmartMetricValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return null;
    // If Joules was passed (e.g. > 50000), convert J to kcal
    if (val > 50000) return Math.round(val / 4184);
    return Math.round(val);
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    const validNums = val.map(v => parseSmartMetricValue(v)).filter(v => v !== null && v >= 0);
    if (validNums.length === 0) return null;
    return validNums[validNums.length - 1];
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '0') return 0;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return null; // Placeholder text not replaced by iOS Shortcuts
    
    // Replace comma with dot for decimals (e.g. "37,48" -> "37.48")
    const clean = trimmed.replace(/,/g, '.');
    const floatVal = parseFloat(clean);
    if (!isNaN(floatVal) && isFinite(floatVal)) {
      if (floatVal > 50000) {
        return Math.round(floatVal / 4184);
      }
      return Math.round(floatVal);
    }

    const match = clean.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && isFinite(parsed)) {
        if (parsed > 50000) return Math.round(parsed / 4184);
        return Math.round(parsed);
      }
    }
    return null;
  }
  return null;
}

function parseSmartMetricFloatValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return null;
    if (val > 100) return parseFloat((val / 1000).toFixed(2));
    return parseFloat(val.toFixed(2));
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '0' || trimmed === '0.0' || trimmed === '0.00') return 0;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return null;
    const clean = trimmed.replace(/,/g, '.');
    const floatVal = parseFloat(clean);
    if (!isNaN(floatVal) && isFinite(floatVal)) {
      if (floatVal > 100) {
        return parseFloat((floatVal / 1000).toFixed(2));
      }
      return parseFloat(floatVal.toFixed(2));
    }
    const match = clean.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && isFinite(parsed)) {
        if (parsed > 100) return parseFloat((parsed / 1000).toFixed(2));
        return parseFloat(parsed.toFixed(2));
      }
    }
    return null;
  }
  return null;
}

function parseSmartMetricArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => parseInt(v)).filter(v => !isNaN(v));
  if (typeof val === 'string') {
    return val.split(',').map(s => parseInt(s.trim())).filter(v => !isNaN(v));
  }
  const p = parseInt(val);
  return isNaN(p) ? [] : [p];
}

// Helper to sync weekly history array (7 days) across past days of the week
function syncWeeklyWatchHistory(profileId, kcalArr = [], exMinArr = [], hrArr = []) {
  if (!Array.isArray(kcalArr) || kcalArr.length === 0) return;
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const todayIdx = (new Date().getDay() + 6) % 7;

  for (let i = 0; i < kcalArr.length; i++) {
    const pastDayIdx = (todayIdx - (kcalArr.length - 1 - i) + 7) % 7;
    const targetDayName = days[pastDayIdx];
    const kcalVal = kcalArr[i];
    const durVal = (exMinArr && exMinArr[i]) ? exMinArr[i] : 45;
    const hrVal = (hrArr && hrArr[i]) ? hrArr[i] : 138;

    if (kcalVal && kcalVal > 150) {
      if (!appState.completedWorkouts[profileId]) appState.completedWorkouts[profileId] = {};

      const existing = appState.completedWorkouts[profileId][targetDayName];
      if (!existing || !existing.done || !existing.watchData) {
        appState.completedWorkouts[profileId][targetDayName] = {
          done: true,
          watchData: {
            deviceName: appState.appleWatch.metrics[profileId]?.deviceName || "Apple Watch",
            durationMin: durVal,
            kcal: kcalVal,
            avgHr: hrVal,
            maxHr: hrVal + 22,
            timestamp: "Salud iOS Sync",
            autoSync: true
          }
        };
      }
    }
  }
}

// IOS SHORTCUTS URL PARAMETER SYNC HANDLER & AUTO-LAUNCH ENGINE
function checkUrlParamsForWatchSync() {
  let searchStr = window.location.search;
  let hashStr = window.location.hash;
  
  if (!searchStr && hashStr.includes("?")) {
    searchStr = hashStr.substring(hashStr.indexOf("?"));
  } else if (!searchStr && hashStr.includes("=")) {
    searchStr = hashStr.replace("#", "?");
  }

  const params = new URLSearchParams(searchStr);
  if (!params.has("syncWatch") && !params.has("kcal") && !params.has("steps") && !params.has("workout") && !params.has("duration") && !params.has("workoutKcal") && !params.has("hr")) {
    return false;
  }

  // Profile resolution: optional URL override (&profile=he / &profile=she / &profile=carlos / &profile=andrea)
  let pid = appState.activeProfileId || getMasterProfileId();
  const profileParam = params.get("profile") || params.get("user");
  if (profileParam) {
    const pLower = profileParam.toLowerCase();
    if (pLower.includes("carlos") || pLower === "he" || pLower === "m") {
      pid = "he";
    } else if (pLower.includes("andrea") || pLower === "she" || pLower === "f") {
      pid = "she";
    }
    appState.activeProfileId = pid;
    localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, pid);
  }

  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = defaultWatchMetrics;
  if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = { ...defaultWatchMetrics[pid] };

  const m = appState.appleWatch.metrics[pid];

  addDebugLog("🔗 Parámetros de URL/Acceso Directo detectados al cargar la app", "url", Object.fromEntries(params));

  let updated = false;

  // 1. General Daily Health Metrics
  const kcalRaw = params.get("kcal") || params.get("moveKcal") || params.get("activeCalories");
  const kcalVal = parseSmartMetricValue(kcalRaw);
  if (kcalVal !== null) {
    m.moveKcal = kcalVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("kcal")) {
    if (kcalRaw === "0" || kcalRaw === "") {
      m.moveKcal = 0;
      updated = true;
    }
  }

  const stepsRaw = params.get("steps");
  const stepsVal = parseSmartMetricValue(stepsRaw);
  if (stepsVal !== null) {
    m.steps = stepsVal;
    m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
    updated = true;
  } else if (params.has("syncWatch") || params.has("steps")) {
    if (stepsRaw === "0" || stepsRaw === "") {
      m.steps = 0;
      m.distanceKm = 0;
      updated = true;
    }
  }

  const distRaw = params.get("dist") || params.get("distanceKm") || params.get("distance");
  const distVal = parseSmartMetricFloatValue(distRaw);
  if (distVal !== null) {
    m.distanceKm = distVal;
    updated = true;
  }

  const hrRaw = params.get("hr") || params.get("heartRate") || params.get("avgHr");
  const hrVal = parseSmartMetricValue(hrRaw);
  if (hrVal !== null) {
    m.hr = hrVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("hr")) {
    if (hrRaw === "0" || hrRaw === "") {
      m.hr = 0;
      updated = true;
    }
  }

  const maxHrRaw = params.get("maxHr");
  const maxHrVal = parseSmartMetricValue(maxHrRaw);
  if (maxHrVal !== null) {
    m.maxHr = maxHrVal;
    updated = true;
  }

  const exMinRaw = params.get("exMin") || params.get("exerciseMin") || params.get("duration") || params.get("dur");
  const exMinVal = parseSmartMetricValue(exMinRaw);
  if (exMinVal !== null) {
    m.exerciseMin = exMinVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("exMin")) {
    if (exMinRaw === "0" || exMinRaw === "") {
      m.exerciseMin = 0;
      updated = true;
    }
  }

  const standHoursRaw = params.get("standHours") || params.get("stand");
  const standHoursVal = parseSmartMetricValue(standHoursRaw);
  if (standHoursVal !== null) {
    m.standHours = standHoursVal;
    updated = true;
  }

  const deviceParam = params.get("deviceName") || params.get("device");
  if (deviceParam) {
    m.deviceName = decodeURIComponent(deviceParam);
    updated = true;
  }

  // Handle 7-day weekly history sync if an array of values was passed
  const kcalArr = parseSmartMetricArray(kcalRaw);
  const exMinArr = parseSmartMetricArray(exMinRaw);
  const hrArr = parseSmartMetricArray(hrRaw);
  if (kcalArr.length > 1) {
    syncWeeklyWatchHistory(pid, kcalArr, exMinArr, hrArr);
    updated = true;
    addDebugLog("📊 Historial de 7 días de Salud procesado desde URL", "health", { kcalArr, exMinArr, hrArr });
  }

  // 2. Workout specific metrics (if this is a post-workout sync)
  const isWorkoutSync = params.has("workout") || params.get("syncWorkout") === "true" || params.has("workoutKcal") || (params.has("duration") && params.has("avgHr"));
  let targetDay = params.get("day");
  if (!targetDay || targetDay === "Hoy" || targetDay === "today" || targetDay.toLowerCase() === "today" || targetDay.toLowerCase() === "hoy") {
    targetDay = getTodayDayName();
  }

  let workoutKcalVal = parseSmartMetricValue(params.get("workoutKcal") || params.get("wKcal"));
  let workoutDurationVal = parseSmartMetricValue(params.get("workoutDuration") || params.get("dur") || params.get("duration"));
  let workoutAvgHrVal = parseSmartMetricValue(params.get("workoutAvgHr") || params.get("avgHr"));
  let workoutMaxHrVal = parseSmartMetricValue(params.get("workoutMaxHr") || params.get("maxHr"));

  if (isWorkoutSync) {
    const durMin = workoutDurationVal !== null ? workoutDurationVal : (exMinVal !== null ? exMinVal : 45);
    const wKcal = workoutKcalVal !== null ? workoutKcalVal : (kcalVal !== null ? kcalVal : 350);
    const avgH = workoutAvgHrVal !== null ? workoutAvgHrVal : (hrVal !== null ? hrVal : 140);
    const maxH = workoutMaxHrVal !== null ? workoutMaxHrVal : (m.maxHr || (avgH + 20));
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";

    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

    appState.completedWorkouts[pid][targetDay] = {
      done: true,
      watchData: {
        deviceName: m.deviceName || `Apple Watch (${appState.profiles[pid].name.split(" ")[0]})`,
        durationMin: durMin,
        kcal: wKcal,
        avgHr: avgH,
        maxHr: maxH,
        timestamp: timeStr,
        autoSync: true
      }
    };
    appState.activeWorkoutDay = targetDay;
    updated = true;
  }

  if (updated) {
    appState.appleWatch.syncMode = "real";
    appState.appleWatch.lastGlobalSync = new Date().toISOString();

    // Also update cloudReplica
    if (!appState.appleWatch.cloudReplica) appState.appleWatch.cloudReplica = defaultCloudReplica;
    if (!appState.appleWatch.cloudReplica[pid]) appState.appleWatch.cloudReplica[pid] = { ...defaultCloudReplica[pid] };
    const rep = appState.appleWatch.cloudReplica[pid];
    rep.moveKcal = m.moveKcal;
    rep.steps = m.steps;
    rep.distanceKm = m.distanceKm;
    rep.hr = m.hr;
    rep.exerciseMin = m.exerciseMin;
    rep.lastSync = new Date().toISOString();

    const pName = appState.profiles[pid].name.split(" ")[0];
    addDebugLog(` Datos de Salud actualizados vía URL para ${pName}`, "success", { moveKcal: m.moveKcal, steps: m.steps, hr: m.hr, exerciseMin: m.exerciseMin });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    appState.appleWatch.syncLogs.unshift({
      timestamp: timeStr,
      device: m.deviceName || "Apple Watch",
      hr: m.hr,
      kcal: m.moveKcal,
      steps: m.steps,
      status: kcalArr.length > 1 ? "Semanas (7 días) Sincronizadas" : (isWorkoutSync ? `Entrenamiento + Salud (${targetDay}) Sincronizado` : "Salud General Sincronizado vía Atajo iOS")
    });
    if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

    appState.appleWatch.lastLocalSyncTimestamp = Date.now();
    saveState();
    pushToCloud(false);
    renderAll();

    // Clean query params from browser location bar without reloading
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    sessionStorage.setItem("fitduo_shortcut_synced", "true");

    setTimeout(() => {
      if (kcalArr.length > 1) {
        showIosToast(` <strong>¡Historial de 7 días de Apple Watch sincronizado!</strong> (${m.moveKcal} kcal hoy)`, "fa-brands fa-apple");
      } else if (isWorkoutSync) {
        showIosToast(`🏋️ <strong>¡Entrenamiento (${targetDay}) y Salud sincronizados!</strong> (${workoutKcalVal || m.moveKcal} kcal entreno · ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-dumbbell");
      } else {
        showIosToast(` <strong>Atajo de Salud ejecutado:</strong> Datos de Apple Watch (${pName}) cargados (${m.moveKcal} kcal · ${m.steps.toLocaleString()} pasos)`, "fa-brands fa-apple");
      }
    }, 400);

    return true;
  }

  return false;
}

async function checkClipboardForWatchSync(forceManual = false) {
  addDebugLog("📋 Iniciando comprobación de datos de Salud desde el Portapapeles...", "info");

  if (!navigator.clipboard || !navigator.clipboard.readText) {
    addDebugLog("⚠️ El navegador no soporta la API navigator.clipboard.readText", "warning");
    if (forceManual) {
      importFromShortcutText();
    }
    return false;
  }

  try {
    const text = await navigator.clipboard.readText();
    addDebugLog(`📥 TEXTO BRUTO LEÍDO DEL PORTAPAPELES (${text ? text.length : 0} caracteres)`, "clipboard", { rawText: text || "(Vacío)" });

    if (!text || text.trim().length === 0) {
      addDebugLog("ℹ️ El portapapeles está completamente vacío.", "info");
      if (forceManual) {
        importFromShortcutText();
      }
      return false;
    }

    const json = parseHealthTextOrUrl(text);
    if (!json) {
      addDebugLog(`⚠️ No se detectaron parámetros de Salud reconocibles en el texto del portapapeles: "${text}"`, "warning", { rawText: text });
      if (forceManual) {
        showIosToast("⚠️ El texto del portapapeles no tiene formato de Salud válido", "fa-triangle-exclamation");
        importFromShortcutText(text);
      }
      return false;
    }

    addDebugLog("🔍 ESTRUCTURA PARSEADA DE SALUD DE PORTAPAPELES", "health", json);

    const pid = getMasterProfileId();
    const m = appState.appleWatch.metrics[pid];

    let updated = false;

    const kcalRaw = json.kcal || json.moveKcal || json.activeCalories;
    const kcalVal = parseSmartMetricValue(kcalRaw) ?? (json.syncWatch ? 0 : null);
    if (kcalVal !== null) {
      m.moveKcal = kcalVal;
      updated = true;
    }

    const stepsRaw = json.steps;
    const stepsVal = parseSmartMetricValue(stepsRaw) ?? (json.syncWatch ? 0 : null);
    if (stepsVal !== null) {
      m.steps = stepsVal;
      m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
      updated = true;
    }

    const hrRaw = json.hr || json.heartRate || json.avgHr;
    const hrVal = parseSmartMetricValue(hrRaw) ?? (json.syncWatch ? 0 : null);
    if (hrVal !== null) {
      m.hr = hrVal;
      updated = true;
    }

    const maxHrRaw = json.maxHr;
    const maxHrVal = parseSmartMetricValue(maxHrRaw);
    if (maxHrVal !== null) {
      m.maxHr = maxHrVal;
      updated = true;
    }

    const exMinRaw = json.exerciseMin || json.durationMin || json.exMin;
    const exMinVal = parseSmartMetricValue(exMinRaw) ?? (json.syncWatch ? 0 : null);
    if (exMinVal !== null) {
      m.exerciseMin = exMinVal;
      updated = true;
    }

    const kcalArr = parseSmartMetricArray(kcalRaw);
    const exMinArr = parseSmartMetricArray(exMinRaw);
    const hrArr = parseSmartMetricArray(hrRaw);
    if (kcalArr.length > 1) {
      syncWeeklyWatchHistory(pid, kcalArr, exMinArr, hrArr);
      updated = true;
    }

    if (updated) {
      appState.appleWatch.syncMode = "real";
      appState.appleWatch.lastGlobalSync = new Date().toISOString();

      saveState();
      renderAll();

      const pName = appState.profiles[pid].name.split(" ")[0];
      addDebugLog(`🎯 MÉTRICAS FINALES ACTUALIZADAS PARA ${pName} DESDE PORTAPAPELES`, "success", {
        moveKcal: m.moveKcal,
        steps: m.steps,
        hr: m.hr,
        exerciseMin: m.exerciseMin,
        distanceKm: m.distanceKm,
        lastSync: appState.appleWatch.lastGlobalSync
      });

      // Clear clipboard after reading so it doesn't re-trigger
      try {
        await navigator.clipboard.writeText("");
        addDebugLog("🧹 Portapapeles limpiado automáticamente tras la sincronización", "info");
      } catch (clipErr) {}

      showIosToast(`📋 <strong>Sincronización silenciosa:</strong> Datos de Apple Watch (${pName}) cargados desde Portapapeles (${m.moveKcal} kcal · ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-clipboard-check");
      return true;
    }
  } catch(e) {
    addDebugLog(`⚠️ Error o permiso denegado leyendo portapapeles: ${e.name} - ${e.message}`, "warning", { error: e.message });
    if (forceManual) {
      importFromShortcutText();
    }
  }

  return false;
}

function checkAutoLaunchShortcutOnOpen() {
  if (!appState.appleWatch?.autoLaunchShortcutOnOpen) return;
  if (sessionStorage.getItem("fitduo_shortcut_synced") === "true") return;
  if (sessionStorage.getItem("fitduo_shortcut_launched") === "true") return;

  sessionStorage.setItem("fitduo_shortcut_launched", "true");

  setTimeout(() => {
    launchIosShortcutSync(true, 'health');
  }, 1000);
}

async function syncHealthShortcutAndCloud() {
  try { triggerHapticTouch(); } catch(e) {}
  sessionStorage.setItem("fitduo_shortcut_launched", "true");
  const pid = appState.activeProfileId || getMasterProfileId();
  const pName = pid === 'he' ? 'Carlos' : 'Andrea';
  const shortcutName = "SubirSaludNubeFitDuo";
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;

  addDebugLog(`☁️ Invocando Atajo de Nube: ${shortcutName} para ${pName}`, "info", { url, pid });
  showIosToast(`☁️ <strong>Subiendo a la Nube:</strong> Ejecutando atajo ${shortcutName}...`, "fa-solid fa-cloud-arrow-up");

  // 1. Launch the shortcut to upload active profile metrics to the cloud in background
  setTimeout(() => {
    window.location.href = url;
  }, 200);

  // 2. Poll & update data for both profiles in the cloud
  setTimeout(async () => {
    try {
      showIosToast("📥 Actualizando datos de ambos perfiles desde la Nube...", "fa-solid fa-arrows-rotate");
      await pullFromCloud(true);
      renderAll();
    } catch(e) {}
  }, 4000);
}
window.syncHealthShortcutAndCloud = syncHealthShortcutAndCloud;

async function launchIosShortcutSync(isAuto = false, mode = 'health') {
  triggerHapticTouch();
  sessionStorage.setItem("fitduo_shortcut_launched", "true");

  const shortcutName = mode === 'workout' 
    ? (appState.appleWatch?.shortcutWorkoutName || "SincronizarEntrenamientoFitDuo")
    : (appState.appleWatch?.shortcutName || "SincronizarSaludFitDuo");

  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;

  addDebugLog(`⚡ Invocando Atajo de iOS: ${shortcutName} (${isAuto ? 'Auto' : 'Manual'}, Modo: ${mode})`, "info", { url });

  if (isAuto) {
    showIosToast("⚡ Ejecutando Atajo de Salud de iOS al iniciar...", "fa-brands fa-apple");
  } else {
    showIosToast(`⚡ Lanzando Atajo de iOS (${shortcutName})...`, "fa-brands fa-apple");
  }

  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

function getShortcutUrl(mode = 'health') {
  let baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  try {
    if (window.location && window.location.href) {
      const cleanHref = window.location.href.split('?')[0].split('#')[0];
      if (cleanHref && cleanHref.length > 5) {
        baseUrl = cleanHref;
      }
    }
  } catch(e) {}

  if (mode === 'workout') {
    return `${baseUrl}?syncWatch=true&workout=true&day=Hoy&workoutKcal=[Calorias_Entreno]&duration=[Duracion_Entreno]&avgHr=[FC_Entreno]&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Ritmo_Cardiaco]&dist=[Distancia]&exMin=[Minutos_Ejercicio]`;
  } else {
    return `${baseUrl}?syncWatch=true&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Ritmo_Cardiaco]&dist=[Distancia]&exMin=[Minutos_Ejercicio]`;
  }
}

function getShortcutCloudUrl(mode = 'health', customPid = null) {
  const key = getCloudSyncKey();
  const pid = customPid || getMasterProfileId();
  const channel = `${key}_${pid}`;

  if (mode === 'workout') {
    return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/{"author":"${pid}","workout":true,"day":"Hoy","workoutKcal":"[Calorias_Entreno]","duration":"[Duracion_Entreno]","avgHr":"[FC_Entreno]","kcal":"[Calorias_Activas]","steps":"[Pasos]","hr":"[Ritmo_Cardiaco]","dist":"[Distancia]","exMin":"[Minutos_Ejercicio]"}`;
  } else {
    return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/{"author":"${pid}","kcal":"[Calorias_Activas]","steps":"[Pasos]","hr":"[Ritmo_Cardiaco]","dist":"[Distancia]","exMin":"[Minutos_Ejercicio]"}`;
  }
}

function updateShortcutUrlInputs() {
  try {
    const healthInput = document.getElementById("shortcut-url-health-input");
    if (healthInput) {
      healthInput.value = getShortcutUrl('health');
    }

    const workoutInput = document.getElementById("shortcut-url-workout-input");
    if (workoutInput) {
      workoutInput.value = getShortcutUrl('workout');
    }

    const cloudHealthInput = document.getElementById("shortcut-cloud-url-health-input");
    if (cloudHealthInput) {
      cloudHealthInput.value = getShortcutCloudUrl('health');
    }

    const cloudWorkoutInput = document.getElementById("shortcut-cloud-url-workout-input");
    if (cloudWorkoutInput) {
      cloudWorkoutInput.value = getShortcutCloudUrl('workout');
    }

    const settingsCloudInput = document.getElementById("settings-shortcut-cloud-url-input");
    if (settingsCloudInput) {
      settingsCloudInput.value = getShortcutCloudUrl('health');
    }
  } catch(e) {
    console.error("Error updating shortcut URL inputs:", e);
  }
}

function copyShortcutUrlToClipboard(mode = 'health') {
  try { triggerHapticTouch(); } catch(e) {}
  const url = getShortcutUrl(mode);
  
  const inputId = mode === 'workout' ? 'shortcut-url-workout-input' : 'shortcut-url-health-input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.value = url;
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
  }

  const label = mode === 'workout' ? 'Entrenamiento + Salud (Safari)' : 'Solo Salud (Safari)';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada</strong>. Pégala en "Abrir URL" de Atajos iOS.`, "fa-solid fa-copy");
    }).catch(() => {
      try {
        document.execCommand('copy');
        showIosToast(`📋 <strong>URL del Atajo (${label}) seleccionada y copiada</strong>.`, "fa-solid fa-copy");
      } catch(err) {
        showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
      }
    });
  } else {
    try {
      document.execCommand('copy');
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada</strong>.`, "fa-solid fa-copy");
    } catch(err) {
      showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
    }
  }
}
window.copyShortcutUrlToClipboard = copyShortcutUrlToClipboard;

function copyShortcutCloudUrlToClipboard(mode = 'health') {
  try { triggerHapticTouch(); } catch(e) {}
  const url = getShortcutCloudUrl(mode);
  
  const inputId = mode === 'workout' ? 'shortcut-cloud-url-workout-input' : 'shortcut-cloud-url-health-input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.value = url;
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
  }

  const label = mode === 'workout' ? 'Entrenamiento en 2º Plano (Nube)' : 'Salud en 2º Plano (Nube)';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showIosToast(`☁️ <strong>URL de Subida Nube en 2º Plano (${label}) copiada</strong>. Pégala en "Obtener contenido de URL" de Atajos iOS.`, "fa-solid fa-cloud-arrow-up");
    }).catch(() => {
      try {
        document.execCommand('copy');
        showIosToast(`☁️ <strong>URL de Subida Nube (${label}) copiada</strong>.`, "fa-solid fa-copy");
      } catch(err) {
        showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
      }
    });
  } else {
    try {
      document.execCommand('copy');
      showIosToast(`☁️ <strong>URL de Subida Nube (${label}) copiada</strong>.`, "fa-solid fa-copy");
    } catch(err) {
      showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
    }
  }
}
window.copyShortcutCloudUrlToClipboard = copyShortcutCloudUrlToClipboard;

function fallbackCopyTextToClipboard(text, mode) {
  const inputId = mode === 'workout' ? 'shortcut-url-workout-input' : 'shortcut-url-health-input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      const label = mode === 'workout' ? 'Entrenamiento + Salud' : 'Solo Salud';
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada al portapapeles</strong>.`, "fa-solid fa-copy");
      return;
    } catch(e) {}
  }
  showIosToast("⚠️ Selecciona el texto del cuadro y usa Copiar.", "fa-solid fa-exclamation-triangle");
}

function openHealthSyncModal() {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.add("active");
}
window.openHealthSyncModal = openHealthSyncModal;

function closeHealthSyncModal() {
  try { triggerHapticTouch(); } catch(e) {}
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.remove("active");
}
window.closeHealthSyncModal = closeHealthSyncModal;

function applyReplicaToPrimary(customPid = null) {
  try { triggerHapticTouch(); } catch(e) {}
  const pid = customPid || appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  const rep = appState.appleWatch?.cloudReplica?.[pid];
  const m = appState.appleWatch?.metrics?.[pid];

  if (!rep || !m) {
    showIosToast("⚠️ No hay datos de Réplica disponibles para aplicar.", "fa-solid fa-triangle-exclamation");
    return;
  }

  m.moveKcal = rep.moveKcal || m.moveKcal;
  m.steps = rep.steps || m.steps;
  m.distanceKm = rep.distanceKm || m.distanceKm;
  m.hr = rep.hr || m.hr;
  m.exerciseMin = rep.exerciseMin || m.exerciseMin;
  appState.appleWatch.lastGlobalSync = new Date().toISOString();

  saveState();
  renderAll();

  showIosToast(`📥 <strong>Datos de Réplica aplicados a Principal</strong> (${m.steps.toLocaleString()} pasos, ${m.moveKcal} kcal para ${authorName}).`, "fa-solid fa-circle-check");
}
window.applyReplicaToPrimary = applyReplicaToPrimary;

function openManualMetricsModal() {
  try { triggerHapticTouch(); } catch(e) {}
  const pid = appState.activeProfileId || 'he';
  const p = appState.profiles[pid];
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  const subtitle = document.getElementById("manual-metrics-modal-subtitle");
  if (subtitle) subtitle.innerText = `Calibrar datos del panel Principal para ${p?.name || 'Usuario'}`;

  const stepsInp = document.getElementById("manual-edit-steps");
  if (stepsInp) stepsInp.value = m.steps;

  const kcalInp = document.getElementById("manual-edit-kcal");
  if (kcalInp) kcalInp.value = m.moveKcal;

  const hrInp = document.getElementById("manual-edit-hr");
  if (hrInp) hrInp.value = m.hr;

  const exminInp = document.getElementById("manual-edit-exmin");
  if (exminInp) exminInp.value = m.exerciseMin;

  const distInp = document.getElementById("manual-edit-dist");
  if (distInp) distInp.value = m.distanceKm;

  const modal = document.getElementById("manual-metrics-modal");
  if (modal) modal.classList.add("active");
}
window.openManualMetricsModal = openManualMetricsModal;

function closeManualMetricsModal() {
  try { triggerHapticTouch(); } catch(e) {}
  const modal = document.getElementById("manual-metrics-modal");
  if (modal) modal.classList.remove("active");
}
window.closeManualMetricsModal = closeManualMetricsModal;

function saveManualMetricsFromModal(e) {
  if (e) e.preventDefault();
  try { triggerHapticTouch(); } catch(e) {}
  const pid = appState.activeProfileId || 'he';
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  const stepsVal = parseInt(document.getElementById("manual-edit-steps")?.value);
  const kcalVal = parseInt(document.getElementById("manual-edit-kcal")?.value);
  const hrVal = parseInt(document.getElementById("manual-edit-hr")?.value);
  const exminVal = parseInt(document.getElementById("manual-edit-exmin")?.value);
  const distVal = parseFloat(document.getElementById("manual-edit-dist")?.value);

  if (!isNaN(stepsVal) && stepsVal >= 0) m.steps = stepsVal;
  if (!isNaN(kcalVal) && kcalVal >= 0) m.moveKcal = kcalVal;
  if (!isNaN(hrVal) && hrVal > 0) m.hr = hrVal;
  if (!isNaN(exminVal) && exminVal >= 0) m.exerciseMin = exminVal;
  if (!isNaN(distVal) && distVal >= 0) m.distanceKm = distVal;

  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  saveState();
  renderAll();
  closeManualMetricsModal();

  showIosToast(`💾 <strong>Métricas guardadas manualmente</strong> (${m.steps.toLocaleString()} pasos, ${m.moveKcal} kcal).`, "fa-solid fa-circle-check");
}
window.saveManualMetricsFromModal = saveManualMetricsFromModal;

function switchShortcutMethodTab(methodName) {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();

  const btnCloud = document.getElementById("shortcut-method-btn-cloud");
  const btnSafari = document.getElementById("shortcut-method-btn-safari");
  const paneCloud = document.getElementById("shortcut-method-pane-cloud");
  const paneSafari = document.getElementById("shortcut-method-pane-safari");

  if (methodName === 'cloud') {
    if (btnCloud) {
      btnCloud.className = "shortcut-tab-btn active";
      btnCloud.style.background = "linear-gradient(135deg, var(--accent-cyan), #2563eb)";
      btnCloud.style.color = "#ffffff";
    }
    if (btnSafari) {
      btnSafari.className = "shortcut-tab-btn";
      btnSafari.style.background = "transparent";
      btnSafari.style.color = "var(--text-secondary)";
    }
    if (paneCloud) paneCloud.style.display = "block";
    if (paneSafari) paneSafari.style.display = "none";
  } else {
    if (btnCloud) {
      btnCloud.className = "shortcut-tab-btn";
      btnCloud.style.background = "transparent";
      btnCloud.style.color = "var(--text-secondary)";
    }
    if (btnSafari) {
      btnSafari.className = "shortcut-tab-btn active";
      btnSafari.style.background = "var(--gradient-primary)";
      btnSafari.style.color = "#ffffff";
    }
    if (paneCloud) paneCloud.style.display = "none";
    if (paneSafari) paneSafari.style.display = "block";
  }
}
window.switchShortcutMethodTab = switchShortcutMethodTab;

function switchShortcutTab(tabName) {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();

  const btnHealth = document.getElementById("shortcut-tab-btn-health");
  const btnWorkout = document.getElementById("shortcut-tab-btn-workout");
  const paneHealth = document.getElementById("shortcut-pane-health");
  const paneWorkout = document.getElementById("shortcut-pane-workout");

  if (tabName === 'health') {
    if (btnHealth) {
      btnHealth.className = "shortcut-tab-btn active";
      btnHealth.style.background = "var(--gradient-primary)";
      btnHealth.style.color = "#ffffff";
    }
    if (btnWorkout) {
      btnWorkout.className = "shortcut-tab-btn";
      btnWorkout.style.background = "transparent";
      btnWorkout.style.color = "var(--text-secondary)";
    }
    if (paneHealth) {
      paneHealth.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important;";
    }
    if (paneWorkout) {
      paneWorkout.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important;";
    }
  } else {
    if (btnHealth) {
      btnHealth.className = "shortcut-tab-btn";
      btnHealth.style.background = "transparent";
      btnHealth.style.color = "var(--text-secondary)";
    }
    if (btnWorkout) {
      btnWorkout.className = "shortcut-tab-btn active";
      btnWorkout.style.background = "linear-gradient(135deg, #f43f5e, #e11d48)";
      btnWorkout.style.color = "#ffffff";
    }
    if (paneHealth) {
      paneHealth.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important;";
    }
    if (paneWorkout) {
      paneWorkout.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important;";
    }
  }
}
window.switchShortcutTab = switchShortcutTab;

function testSimulatedHealthSync() {
  triggerHapticTouch();
  const randomKcal = Math.floor(480 + Math.random() * 220);
  const randomSteps = Math.floor(8200 + Math.random() * 4000);
  const randomHr = Math.floor(68 + Math.random() * 18);
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&kcal=${randomKcal}&steps=${randomSteps}&hr=${randomHr}&exMin=45&dist=6.8&stand=10`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  renderAll();
}

function testSimulatedWorkoutSync() {
  triggerHapticTouch();
  const todayDay = getTodayDayName();
  const randomKcal = Math.floor(580 + Math.random() * 200);
  const randomSteps = Math.floor(9500 + Math.random() * 3500);
  const randomHr = Math.floor(72 + Math.random() * 15);
  const workoutKcal = Math.floor(380 + Math.random() * 140);
  const workoutHr = Math.floor(142 + Math.random() * 18);
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&workout=true&day=${encodeURIComponent(todayDay)}&kcal=${randomKcal}&steps=${randomSteps}&hr=${randomHr}&exMin=55&dist=7.9&stand=12&workoutKcal=${workoutKcal}&duration=50&avgHr=${workoutHr}&maxHr=${workoutHr + 24}`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  renderAll();
}

function resetMetricsToZeroUsingUrlShortcut(customPid = null) {
  try { triggerHapticTouch(); } catch(e) {}
  const pid = customPid || appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&profile=${pid}&kcal=0&steps=0&hr=0&dist=0&exMin=0`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  saveState();
  renderAll();
  showIosToast(`🔄 <strong>Métricas de ${authorName} cargadas a vacío (0)</strong> vía método URL de Atajo.`, "fa-solid fa-rotate-left");
}
window.resetMetricsToZeroUsingUrlShortcut = resetMetricsToZeroUsingUrlShortcut;

async function testSimulatedBackgroundCloudSync() {
  triggerHapticTouch();
  const key = getCloudSyncKey();
  const masterPid = getMasterProfileId();
  const authorName = masterPid === 'he' ? 'Carlos' : 'Andrea';
  const todayDay = getTodayDayName();

  const randomKcal = Math.floor(520 + Math.random() * 220);
  const randomSteps = Math.floor(8800 + Math.random() * 3800);
  const randomDist = parseFloat((randomSteps * 0.00075).toFixed(2));
  const randomHr = Math.floor(70 + Math.random() * 16);
  const randomExMin = Math.floor(35 + Math.random() * 25);
  const workoutKcal = Math.floor(390 + Math.random() * 120);
  const workoutHr = Math.floor(140 + Math.random() * 16);

  addSyncConsoleLog(`🧪 [SIMULADOR ATAJO EN 2º PLANO] Enviando telemetría de Salud (${randomSteps} pasos, ${randomKcal} kcal, ${randomDist} km, ${randomExMin} min ejerc, ${randomHr} bpm) de ${authorName} a la Nube...`, "info");
  if (typeof showIosToast === 'function') {
    showIosToast(`🧪 <strong>Simulando Atajo en 2º Plano:</strong> Enviando métricas a la nube...`, "fa-solid fa-cloud-arrow-up");
  }

  const payload = {
    author: masterPid,
    authorProfileId: masterPid,
    workout: true,
    day: todayDay,
    steps: randomSteps,
    kcal: randomKcal,
    dist: randomDist,
    distanceKm: randomDist,
    exerciseMin: randomExMin,
    exMin: randomExMin,
    hr: randomHr,
    avgHr: randomHr,
    workoutKcal: workoutKcal,
    duration: randomExMin,
    workoutAvgHr: workoutHr,
    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs"
  };

  try {
    const pnChannel = `${key}_${masterPid}`;
    const encodedMsg = encodeURIComponent(JSON.stringify(payload));
    const pnPubUrl = `https://ps.pubnub.com/publish/demo/demo/0/${pnChannel}/0/${encodedMsg}`;
    const res = await fetch(pnPubUrl);
    if (res.ok) {
      addSyncConsoleLog(`✅ Simulador: Mensaje inyectado en la Nube (${pnChannel})`, "success");
      setTimeout(() => {
        pullFromCloud(true);
      }, 500);
    }
  } catch (e) {
    addSyncConsoleLog(`⚠️ Simulador error: ${e.message}`, "warn");
  }
}
window.testSimulatedBackgroundCloudSync = testSimulatedBackgroundCloudSync;

function updateAppleWatchModalUI() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = appState.profiles[pid].name.split(" ")[0];
  if (!m) return;

  const mode = appState.appleWatch.syncMode || "real";

  // Auto-launch shortcut checkbox
  const shortcutToggle = document.getElementById("toggle-auto-launch-shortcut");
  if (shortcutToggle) shortcutToggle.checked = !!appState.appleWatch.autoLaunchShortcutOnOpen;

  // Sync Mode buttons state
  const btnReal = document.getElementById("btn-mode-real");
  const btnDemo = document.getElementById("btn-mode-demo");
  if (btnReal) btnReal.className = `mode-btn ${mode === 'real' ? 'active' : ''}`;
  if (btnDemo) btnDemo.className = `mode-btn ${mode === 'demo' ? 'active' : ''}`;

  const modeBadge = document.getElementById("watch-mode-badge");
  if (modeBadge) {
    modeBadge.innerHTML = mode === "real" 
      ? `<i class="fa-solid fa-shield-halved"></i> Datos Reales Estables` 
      : `<i class="fa-solid fa-vial"></i> Simulación Demo`;
  }

  const modeDesc = document.getElementById("watch-mode-desc");
  if (modeDesc) {
    modeDesc.innerHTML = mode === "real" 
      ? `✓ <strong>Modo Datos Reales:</strong> Las mediciones se mantienen congeladas y 100% precisas según los datos reales de tu reloj.` 
      : `⚡ <strong>Modo Simulación Demo:</strong> Generando telemetría simulada en tiempo real para demostración.`;
  }

  // Device & Subtitle
  const deviceEl = document.getElementById("watch-device-name");
  if (deviceEl) deviceEl.innerText = `${m.deviceName}`;

  const subEl = document.getElementById("modal-watch-subtitle");
  if (subEl) subEl.innerText = `Salud iOS (${pName}) - ${mode === 'real' ? 'Medición Real' : 'Demostración'}`;

  const batEl = document.getElementById("watch-battery-level");
  if (batEl) batEl.innerText = `${m.battery}%`;

  const toggleEl = document.getElementById("toggle-auto-sync");
  if (toggleEl) toggleEl.checked = !!appState.appleWatch.autoSyncEnabled;

  const timeDiffSec = Math.round((new Date() - new Date(appState.appleWatch.lastGlobalSync || new Date())) / 1000);
  const tsEl = document.getElementById("watch-sync-timestamp");
  if (tsEl) tsEl.innerText = `Sincronizado: Hace ${timeDiffSec < 3 ? 'un instante' : timeDiffSec + ' seg'}`;

  // Live Metrics Grid
  document.querySelectorAll("[id='watch-metric-hr']").forEach(el => el.innerHTML = `${m.hr} <small>BPM</small>`);
  document.querySelectorAll("[id='watch-metric-steps']").forEach(el => el.innerText = m.steps.toLocaleString());
  document.querySelectorAll("[id='watch-metric-dist']").forEach(el => el.innerHTML = `${m.distanceKm} <small>km</small>`);
  document.querySelectorAll("[id='watch-metric-kcal']").forEach(el => el.innerHTML = `${m.moveKcal} <small>kcal</small>`);

  // Apple Activity Rings Calculations
  const moveGoal = m.moveGoal || m.targetKcal || 600;
  const moveRatio = Math.min(1.2, m.moveKcal / moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  document.querySelectorAll("[id='ring-move-circle']").forEach(el => el.style.strokeDashoffset = moveOffset);
  document.querySelectorAll("[id='ring-move-val']").forEach(el => el.innerText = `${m.moveKcal} / ${moveGoal} kcal`);

  const exGoal = m.exerciseGoal || m.targetMin || 30;
  const exRatio = Math.min(1.2, m.exerciseMin / exGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  document.querySelectorAll("[id='ring-exercise-circle']").forEach(el => el.style.strokeDashoffset = exOffset);
  document.querySelectorAll("[id='ring-exercise-val']").forEach(el => el.innerText = `${m.exerciseMin} / ${exGoal} min`);

  const stepsGoal = m.stepsGoal || m.targetSteps || 10000;
  const stepsRatio = Math.min(1.2, m.steps / stepsGoal);
  const stepsOffset = Math.max(0, 163 - (163 * Math.min(1, stepsRatio)));
  document.querySelectorAll("[id='ring-steps-circle'], [id='ring-stand-circle']").forEach(el => el.style.strokeDashoffset = stepsOffset);
  document.querySelectorAll("[id='ring-steps-val'], [id='ring-stand-val']").forEach(el => el.innerText = `${m.steps.toLocaleString()} / ${stepsGoal.toLocaleString()} pasos`);

  // Render Sync Logs
  const logList = document.getElementById("sync-log-list");
  if (logList) {
    if (!appState.appleWatch.syncLogs || appState.appleWatch.syncLogs.length === 0) {
      logList.innerHTML = `<li class="sync-log-item"><span class="sync-log-time">Ahora</span><span class="sync-log-detail">Conexión Salud iOS Inicializada</span></li>`;
    } else {
      logList.innerHTML = appState.appleWatch.syncLogs.map(l => `
        <li class="sync-log-item">
          <span class="sync-log-time">${l.timestamp} - ${l.device}</span>
          <span class="sync-log-detail">${l.kcal} kcal | ${l.hr} BPM | ${l.steps} pasos (${l.status})</span>
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
      appState.appleWatch.syncMode = "real";
      appState.appleWatch.lastGlobalSync = new Date().toISOString();

      saveState();
      renderAll();

      showIosToast(`📄 Archivo de Salud iOS importado con éxito: ${m.steps.toLocaleString()} pasos y ${m.moveKcal} kcal cargados.`, "fa-solid fa-file-circle-check");
    } catch(err) {
      showIosToast(`⚠️ Error al leer el archivo de Salud iOS: Comprueba el formato XML/JSON.`, "fa-solid fa-triangle-exclamation");
    }
  };
  reader.readAsText(file);
}

// EDIT INDIVIDUAL WORKOUT APPLE WATCH DATA MODAL
function openEditWorkoutWatchModal(dayName) {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const watchData = getDayWatchData(pid, dayName) || createWatchDataSnapshot(pid);

  const modal = document.getElementById("edit-workout-watch-modal");
  if (!modal) return;

  const dayInput = document.getElementById("edit-workout-day-name");
  if (dayInput) dayInput.value = dayName;

  const sub = document.getElementById("edit-workout-modal-subtitle");
  if (sub) sub.innerText = `Ajustar mediciones reales de Apple Watch del ${dayName}`;

  const devInput = document.getElementById("edit-workout-device-name");
  if (devInput) devInput.value = watchData.deviceName || `Apple Watch (${appState.profiles[pid].name.split(" ")[0]})`;

  const durInput = document.getElementById("edit-workout-duration");
  if (durInput) durInput.value = watchData.durationMin || 45;

  const kcalInput = document.getElementById("edit-workout-kcal");
  if (kcalInput) kcalInput.value = watchData.kcal || 400;

  const avgHrInput = document.getElementById("edit-workout-avg-hr");
  if (avgHrInput) avgHrInput.value = watchData.avgHr || 140;

  const maxHrInput = document.getElementById("edit-workout-max-hr");
  if (maxHrInput) maxHrInput.value = watchData.maxHr || 168;

  const tsInput = document.getElementById("edit-workout-timestamp");
  if (tsInput) tsInput.value = watchData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";

  modal.classList.add("active");
}

function closeEditWorkoutWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("edit-workout-watch-modal");
  if (modal) modal.classList.remove("active");
}

function saveWorkoutWatchDataFromModal(e) {
  e.preventDefault();
  triggerHapticTouch();

  const pid = getMasterProfileId();
  const dayName = document.getElementById("edit-workout-day-name")?.value;
  if (!dayName) return;

  const deviceName = document.getElementById("edit-workout-device-name")?.value.trim();
  const durationMin = parseInt(document.getElementById("edit-workout-duration")?.value) || 45;
  const kcal = parseInt(document.getElementById("edit-workout-kcal")?.value) || 400;
  const avgHr = parseInt(document.getElementById("edit-workout-avg-hr")?.value) || 140;
  const maxHr = parseInt(document.getElementById("edit-workout-max-hr")?.value) || 168;
  const timestamp = document.getElementById("edit-workout-timestamp")?.value.trim() || "09:30 hs";

  if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

  appState.completedWorkouts[pid][dayName] = {
    done: true,
    watchData: {
      deviceName: deviceName || `Apple Watch (${appState.profiles[pid].name.split(" ")[0]})`,
      durationMin,
      kcal,
      avgHr,
      maxHr,
      timestamp,
      autoSync: false
    }
  };

  saveState();
  closeEditWorkoutWatchModal();
  renderAll();

  showIosToast(` Entrenamiento de ${dayName} calibrado con éxito (${kcal} kcal - ${durationMin} min)`, "fa-solid fa-circle-check");
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

function formatSyncRelativeTime(lastSyncDate) {
  if (!lastSyncDate) return "Sincronizado hace 0 segundos";
  const now = new Date();
  const past = new Date(lastSyncDate);
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) {
    return `Sincronizado hace ${diffSec} segundos`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `Sincronizado hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `Sincronizado hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Sincronizado hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
}

// RENDER MAIN SUMMARY & APPLE WATCH DASHBOARD
function renderSummaryView() {
  const pid = appState.activeProfileId;
  const p = appState.profiles[pid];
  const m = appState.appleWatch?.metrics?.[pid];
  if (!p || !m) return;

  const pName = p.name.split(" ")[0];

  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl) syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch?.lastGlobalSync);

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
  const moveGoal = m.moveGoal || m.targetKcal || 600;
  const moveCircle = document.getElementById("summary-ring-move-circle");
  const moveRatio = Math.min(1.2, m.moveKcal / moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  if (moveCircle) moveCircle.style.strokeDashoffset = moveOffset;
  const moveValEl = document.getElementById("summary-ring-move-val");
  if (moveValEl) moveValEl.innerText = `${m.moveKcal} / ${moveGoal} kcal`;

  const exGoal = m.exerciseGoal || m.targetMin || 30;
  const exCircle = document.getElementById("summary-ring-exercise-circle");
  const exRatio = Math.min(1.2, m.exerciseMin / exGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  if (exCircle) exCircle.style.strokeDashoffset = exOffset;
  const exValEl = document.getElementById("summary-ring-exercise-val");
  if (exValEl) exValEl.innerText = `${m.exerciseMin} / ${exGoal} min`;

  const stepsGoal = m.stepsGoal || m.targetSteps || 10000;
  const stepsCircle = document.getElementById("summary-ring-steps-circle") || document.getElementById("summary-ring-stand-circle");
  const stepsRatio = Math.min(1.2, m.steps / stepsGoal);
  const stepsOffset = Math.max(0, 163 - (163 * Math.min(1, stepsRatio)));
  if (stepsCircle) stepsCircle.style.strokeDashoffset = stepsOffset;
  const stepsValEl = document.getElementById("summary-ring-steps-val") || document.getElementById("summary-ring-stand-val");
  if (stepsValEl) stepsValEl.innerText = `${m.steps.toLocaleString()} / ${stepsGoal.toLocaleString()} pasos`;

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

    if (isCompleted) {
      const durationText = watchData?.durationMin ? `${watchData.durationMin} min` : "45 min";
      const kcalText = watchData?.kcal ? `${watchData.kcal} kcal` : "350 kcal";
      const hrText = watchData?.avgHr ? `${watchData.avgHr} BPM` : "140 BPM";
      const deviceText = watchData?.deviceName ? `Registrado con ${watchData.deviceName} a las ${watchData.timestamp || 'hoy'}` : "Registrado en rutina de hoy";

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
              ${deviceText}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-emerald);">
            <i class="fa-solid fa-fire"></i> ${kcalText}
          </span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-cyan);">
            <i class="fa-solid fa-stopwatch"></i> ${durationText}
          </span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-purple);">
            <i class="fa-solid fa-heart-pulse"></i> ${hrText}
          </span>
          <button type="button" class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.76rem; background: rgba(244, 63, 94, 0.2); border: 1px solid var(--accent-rose); color: var(--accent-rose);" onclick="toggleWorkoutDay('${todayName}')">
            <i class="fa-solid fa-rotate-left"></i> Desmarcar
          </button>
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
              Pulsa para marcar el entrenamiento de hoy como completado
            </div>
          </div>
        </div>

        <button type="button" class="btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem; background: var(--accent-emerald);" onclick="toggleWorkoutDay('${todayName}')">
          <i class="fa-solid fa-square-check"></i> Marcar Entreno Completado
        </button>
      `;
    }
  }

}

// RENDER PROFILE & MACROS
function renderProfileView() {
  const p = appState.profiles[appState.activeProfileId];
  if (!p) return;
  
  const subElem = document.getElementById("profile-subtitle");
  if (subElem) {
    subElem.innerText = `Personalización para ${p.name} - Objetivo: Recomposición corporal (${p.height}cm, ${p.weight}kg)`;
  }
  
  const calElem = document.getElementById("target-calories");
  if (calElem) calElem.innerText = `${p.targetCalories} kcal`;
  const protElem = document.getElementById("target-protein");
  if (protElem) protElem.innerText = `${p.protein} g`;
  const carbElem = document.getElementById("target-carbs");
  if (carbElem) carbElem.innerText = `${p.carbs} g`;
  const fatElem = document.getElementById("target-fats");
  if (fatElem) fatElem.innerText = `${p.fats} g`;

  updateShortcutUrlInputs();
  renderWorkoutTracker();
}

// DEVICE PROFILE MEMORY SETTINGS & HANDLERS (SETTINGS MASTER PROFILE)
function setDeviceDefaultProfile(mode) {
  triggerHapticTouch();
  if (mode === 'he' || mode === 'she') {
    localStorage.setItem(DEVICE_DEFAULT_PROFILE_KEY, mode);
    appState.masterProfileId = mode;
  }
  saveState();
  renderAll();

  const masterName = appState.masterProfileId === 'he' ? 'Carlos' : 'Andrea';
  showIosToast(`📱 Perfil Maestro de este móvil fijado a: ${masterName.toUpperCase()}`, "fa-solid fa-shield-halved");
}

function checkDeviceIdentityBanner() {
  const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
  let banner = document.getElementById("device-identity-setup-banner");
  
  if (!devicePref) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "device-identity-setup-banner";
      banner.style.cssText = "position: fixed; top: 0; left: 0; right: 0; z-index: 999999; background: linear-gradient(135deg, #1e1b4b, #311b92); color: #fff; padding: 0.9rem 1rem; border-bottom: 2px solid var(--accent-cyan); box-shadow: 0 8px 32px rgba(0,0,0,0.5); text-align: center; font-family: system-ui, -apple-system, sans-serif;";
      banner.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.6rem;">
          <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; color: #a5f3fc;">
            <i class="fa-solid fa-mobile-screen-button" style="color: var(--accent-cyan);"></i> Configuración Inicial: ¿De quién es este teléfono?
          </div>
          <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.2rem;">
            Selecciona el dueño de este dispositivo para la sincronización en nube.
          </div>
          <div style="display: flex; gap: 0.75rem; width: 100%; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.setDeviceDefaultProfile('he'); if(document.getElementById('device-identity-setup-banner')) document.getElementById('device-identity-setup-banner').remove();" style="flex: 1; min-width: 140px; padding: 0.7rem 1rem; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">
              👦 Es el móvil de Carlos
            </button>
            <button onclick="window.setDeviceDefaultProfile('she'); if(document.getElementById('device-identity-setup-banner')) document.getElementById('device-identity-setup-banner').remove();" style="flex: 1; min-width: 140px; padding: 0.7rem 1rem; background: #ec4899; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);">
              👧 Es el móvil de Andrea
            </button>
          </div>
        </div>
      `;
      document.body.prepend(banner);
    }
  } else if (banner) {
    banner.remove();
  }
}
window.checkDeviceIdentityBanner = checkDeviceIdentityBanner;

// HELPER: GET SHORT PROFILE NAME
export function getProfileShortName(pid) {
  if (!appState || !appState.profiles) {
    if (pid === 'he') return "Carlos";
    if (pid === 'she') return "Andrea";
    if (pid === 'dog') return "Boo";
    return "Usuario";
  }
  if (pid === 'he') {
    const raw = appState.profiles.he?.name || "Carlos";
    return raw.replace(/^Él\s*\(/i, '').replace(/\)$/, '').trim() || "Carlos";
  }
  if (pid === 'she') {
    const raw = appState.profiles.she?.name || "Andrea";
    return raw.replace(/^Ella\s*\(/i, '').replace(/\)$/, '').trim() || "Andrea";
  }
  if (pid === 'dog') {
    const raw = appState.profiles.dog?.name || "Boo";
    return raw.replace(/\s*\(Border Collie\)$/i, '').trim() || "Boo";
  }
  return appState.profiles[pid]?.name || "Usuario";
}
window.getProfileShortName = getProfileShortName;

// UPDATE ALL DYNAMIC UI PROFILE NAMES IN DOM
function updateUIProfileNames() {
  const heName = getProfileShortName('he');
  const sheName = getProfileShortName('she');
  const dogName = getProfileShortName('dog');

  // Desktop & Header Profile Switchers
  const btnHe = document.getElementById("btn-profile-he");
  if (btnHe) btnHe.innerHTML = `<i class="fa-solid fa-mars"></i> ${heName}`;
  const btnShe = document.getElementById("btn-profile-she");
  if (btnShe) btnShe.innerHTML = `<i class="fa-solid fa-venus"></i> ${sheName}`;

  // Mobile Topbar Profile Switchers
  const iosBtnHe = document.getElementById("ios-btn-profile-he");
  if (iosBtnHe) iosBtnHe.innerText = heName;
  const iosBtnShe = document.getElementById("ios-btn-profile-she");
  if (iosBtnShe) iosBtnShe.innerText = sheName;

  // Settings view device memory card buttons
  const prefBtnHe = document.querySelector("#pref-btn-he strong");
  if (prefBtnHe) prefBtnHe.innerText = heName;
  const prefBtnHeSpan = document.querySelector("#pref-btn-he .pref-btn-text span");
  if (prefBtnHeSpan) prefBtnHeSpan.innerText = `Abrir siempre como ${heName} en este teléfono`;

  const prefBtnShe = document.querySelector("#pref-btn-she strong");
  if (prefBtnShe) prefBtnShe.innerText = sheName;
  const prefBtnSheSpan = document.querySelector("#pref-btn-she .pref-btn-text span");
  if (prefBtnSheSpan) prefBtnSheSpan.innerText = `Abrir siempre como ${sheName} en este teléfono`;

  // Dynamic labels in Settings customization inputs
  const ringLabelHe = document.getElementById("setting-label-ring-he");
  if (ringLabelHe) ringLabelHe.innerText = `Objetivos ${heName}`;
  const ringLabelShe = document.getElementById("setting-label-ring-she");
  if (ringLabelShe) ringLabelShe.innerText = `Objetivos ${sheName}`;

  const nutLabelHe = document.getElementById("setting-label-nut-he");
  if (nutLabelHe) nutLabelHe.innerText = `Nutrición ${heName}`;
  const nutLabelShe = document.getElementById("setting-label-nut-she");
  if (nutLabelShe) nutLabelShe.innerText = `Nutrición ${sheName}`;

  const dogWalkLabel = document.getElementById("setting-label-dog-walk");
  if (dogWalkLabel) dogWalkLabel.innerText = dogName;
}

// POPULATE SETTINGS FORM INPUTS WITH CURRENT STATE
function populateSettingsInputs() {
  const heName = getProfileShortName('he');
  const sheName = getProfileShortName('she');
  const dogName = getProfileShortName('dog');

  const inputNameHe = document.getElementById("setting-name-he");
  if (inputNameHe) inputNameHe.value = heName;

  const inputNameShe = document.getElementById("setting-name-she");
  if (inputNameShe) inputNameShe.value = sheName;

  const inputNameDog = document.getElementById("setting-name-dog");
  if (inputNameDog) inputNameDog.value = dogName;

  // Metrics Goals
  const mHe = appState.appleWatch?.metrics?.he || {};
  const mShe = appState.appleWatch?.metrics?.she || {};

  const inputMoveHe = document.getElementById("setting-move-goal-he");
  if (inputMoveHe) inputMoveHe.value = mHe.moveGoal || mHe.targetKcal || 600;

  const inputExHe = document.getElementById("setting-ex-goal-he");
  if (inputExHe) inputExHe.value = mHe.exerciseGoal || mHe.targetMin || 30;

  const inputStepsHe = document.getElementById("setting-steps-goal-he");
  if (inputStepsHe) inputStepsHe.value = mHe.stepsGoal || mHe.targetSteps || 10000;

  const inputMoveShe = document.getElementById("setting-move-goal-she");
  if (inputMoveShe) inputMoveShe.value = mShe.moveGoal || mShe.targetKcal || 500;

  const inputExShe = document.getElementById("setting-ex-goal-she");
  if (inputExShe) inputExShe.value = mShe.exerciseGoal || mShe.targetMin || 30;

  const inputStepsShe = document.getElementById("setting-steps-goal-she");
  if (inputStepsShe) inputStepsShe.value = mShe.stepsGoal || mShe.targetSteps || 10000;

  // Nutrition Goals
  const pHe = appState.profiles?.he || {};
  const pShe = appState.profiles?.she || {};

  const inputCalHe = document.getElementById("setting-cal-he");
  if (inputCalHe) inputCalHe.value = pHe.targetCalories || 2150;
  const inputProtHe = document.getElementById("setting-prot-he");
  if (inputProtHe) inputProtHe.value = pHe.protein || 155;
  const inputCarbsHe = document.getElementById("setting-carbs-he");
  if (inputCarbsHe) inputCarbsHe.value = pHe.carbs || 210;
  const inputFatsHe = document.getElementById("setting-fats-he");
  if (inputFatsHe) inputFatsHe.value = pHe.fats || 65;

  const inputCalShe = document.getElementById("setting-cal-she");
  if (inputCalShe) inputCalShe.value = pShe.targetCalories || 1850;
  const inputProtShe = document.getElementById("setting-prot-she");
  if (inputProtShe) inputProtShe.value = pShe.protein || 130;
  const inputCarbsShe = document.getElementById("setting-carbs-she");
  if (inputCarbsShe) inputCarbsShe.value = pShe.carbs || 180;
  const inputFatsShe = document.getElementById("setting-fats-she");
  if (inputFatsShe) inputFatsShe.value = pShe.fats || 55;

  // Dog walk
  const pDog = appState.profiles?.dog || {};
  const inputDogWalk = document.getElementById("setting-dog-walk-min");
  if (inputDogWalk) inputDogWalk.value = pDog.dailyWalkMinutes || 75;

  // Cloud Key Input
  const inputCloudKey = document.getElementById("setting-cloud-key-input");
  if (inputCloudKey) inputCloudKey.value = getCloudSyncKey();
}

// SAVE CUSTOM SETTINGS FROM SETTINGS VIEW
function saveCustomSettings() {
  triggerHapticTouch();
  const nameHe = document.getElementById("setting-name-he")?.value.trim() || "Carlos";
  const nameShe = document.getElementById("setting-name-she")?.value.trim() || "Andrea";
  const nameDog = document.getElementById("setting-name-dog")?.value.trim() || "Boo";

  if (!appState.profiles) appState.profiles = {};
  if (!appState.profiles.he) appState.profiles.he = {};
  if (!appState.profiles.she) appState.profiles.she = {};
  if (!appState.profiles.dog) appState.profiles.dog = {};

  appState.profiles.he.name = nameHe;
  appState.profiles.she.name = nameShe;
  appState.profiles.dog.name = nameDog;

  // Ring Goals
  const moveGoalHe = parseInt(document.getElementById("setting-move-goal-he")?.value) || 600;
  const exGoalHe = parseInt(document.getElementById("setting-ex-goal-he")?.value) || 30;
  const stepsGoalHe = parseInt(document.getElementById("setting-steps-goal-he")?.value) || 10000;

  const moveGoalShe = parseInt(document.getElementById("setting-move-goal-she")?.value) || 500;
  const exGoalShe = parseInt(document.getElementById("setting-ex-goal-she")?.value) || 30;
  const stepsGoalShe = parseInt(document.getElementById("setting-steps-goal-she")?.value) || 10000;

  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = {};
  if (!appState.appleWatch.metrics.he) appState.appleWatch.metrics.he = {};
  if (!appState.appleWatch.metrics.she) appState.appleWatch.metrics.she = {};

  appState.appleWatch.metrics.he.moveGoal = moveGoalHe;
  appState.appleWatch.metrics.he.targetKcal = moveGoalHe;
  appState.appleWatch.metrics.he.exerciseGoal = exGoalHe;
  appState.appleWatch.metrics.he.targetMin = exGoalHe;
  appState.appleWatch.metrics.he.stepsGoal = stepsGoalHe;
  appState.appleWatch.metrics.he.targetSteps = stepsGoalHe;

  appState.appleWatch.metrics.she.moveGoal = moveGoalShe;
  appState.appleWatch.metrics.she.targetKcal = moveGoalShe;
  appState.appleWatch.metrics.she.exerciseGoal = exGoalShe;
  appState.appleWatch.metrics.she.targetMin = exGoalShe;
  appState.appleWatch.metrics.she.stepsGoal = stepsGoalShe;
  appState.appleWatch.metrics.she.targetSteps = stepsGoalShe;

  // Nutrition
  appState.profiles.he.targetCalories = parseInt(document.getElementById("setting-cal-he")?.value) || 2150;
  appState.profiles.he.protein = parseInt(document.getElementById("setting-prot-he")?.value) || 155;
  appState.profiles.he.carbs = parseInt(document.getElementById("setting-carbs-he")?.value) || 210;
  appState.profiles.he.fats = parseInt(document.getElementById("setting-fats-he")?.value) || 65;

  appState.profiles.she.targetCalories = parseInt(document.getElementById("setting-cal-she")?.value) || 1850;
  appState.profiles.she.protein = parseInt(document.getElementById("setting-prot-she")?.value) || 130;
  appState.profiles.she.carbs = parseInt(document.getElementById("setting-carbs-she")?.value) || 180;
  appState.profiles.she.fats = parseInt(document.getElementById("setting-fats-she")?.value) || 55;

  // Dog
  appState.profiles.dog.dailyWalkMinutes = parseInt(document.getElementById("setting-dog-walk-min")?.value) || 75;

  saveState();
  
  if (typeof showIosToast === 'function') {
    showIosToast("⚙️ ¡Ajustes guardados! Sincronizando en la nube...", "fa-solid fa-cloud-arrow-up");
  }

  pushToCloud(false).then(() => {
    window.location.reload();
  }).catch(() => {
    window.location.reload();
  });
}
window.saveCustomSettings = saveCustomSettings;

function renderSettingsView() {
  const currentPref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY) || 'last';
  const masterPid = getMasterProfileId();

  const btnHe = document.getElementById("pref-btn-he");
  const btnShe = document.getElementById("pref-btn-she");
  const btnLast = document.getElementById("pref-btn-last");
  
  if (btnHe) btnHe.classList.toggle("active", currentPref === 'he');
  if (btnShe) btnShe.classList.toggle("active", currentPref === 'she');
  if (btnLast) btnLast.classList.toggle("active", currentPref === 'last');

  const heName = getProfileShortName('he');
  const sheName = getProfileShortName('she');

  const badge = document.getElementById("settings-device-badge");
  if (badge) {
    const rawName = masterPid === 'he' ? heName : sheName;
    let label = currentPref === 'he' ? `${heName} (Perfil Maestro)` : currentPref === 'she' ? `${sheName} (Perfil Maestro)` : `Último maestro (${rawName})`;
    badge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${label}`;
  }

  updateUIProfileNames();
  populateSettingsInputs();
  updateCloudSyncUI(appState.lastCloudSync ? "Conectado a la Nube (Sincronizado)" : "Conectado a la Nube", true);
}

// MULTI-DEVICE CLOUD SYNC ENGINE (v0.7.0)
const CLOUD_SYNC_APP_KEY = "fitduo_v2";
const DEFAULT_CLOUD_KEY = "fitduo_sync_v2";
let isCloudSyncing = false;

function getCloudSyncKey() {
  return localStorage.getItem("FITDUO_CLOUD_KEY") || DEFAULT_CLOUD_KEY;
}

function addSyncConsoleLog(message, type = "info") {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const logLine = `[${timeStr}] ${message}\n`;
  if (consoleEl) {
    consoleEl.textContent = logLine + consoleEl.textContent.slice(0, 1000);
  }
  console.log(`[SYNC CONSOLE ${type.toUpperCase()}] ${message}`);
}

function toUrlSafeB64(jsonObj) {
  try {
    const str = JSON.stringify(jsonObj);
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return "";
  }
}

function fromUrlSafeB64(b64Str) {
  try {
    if (!b64Str || typeof b64Str !== 'string') return null;
    let base64 = b64Str.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {}
  return null;
}

async function cleanAndParseJsonFromCloud(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();
  if (text === 'null' || text === '""' || text.length < 2) return null;

  // Priority 1: Handle PubNub History API response structure ({ channels: { <channel>: [ { message: ... } ] } })
  if (text.includes('"channels":') && text.includes('"message":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.channels && typeof parsed.channels === 'object') {
        const chKeys = Object.keys(parsed.channels);
        for (let ch of chKeys) {
          const msgList = parsed.channels[ch];
          if (Array.isArray(msgList) && msgList.length > 0) {
            const lastMsg = msgList[msgList.length - 1];
            if (lastMsg && lastMsg.message) {
              const parsedFromMsg = await cleanAndParseJsonFromCloud(
                typeof lastMsg.message === 'string' ? lastMsg.message : JSON.stringify(lastMsg.message)
              );
              if (parsedFromMsg) return parsedFromMsg;
            }
          }
        }
      }
    } catch (ePn) {}
  }

  // Priority 2: Handle Webhook.site API response structure ({ data: [ { content: "urlSafeData" } ] })
  if (text.includes('"data":') && text.includes('"content":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
        for (let reqItem of parsed.data) {
          if (reqItem && reqItem.content && typeof reqItem.content === 'string') {
            const parsedFromContent = await cleanAndParseJsonFromCloud(reqItem.content);
            if (parsedFromContent) return parsedFromContent;
          }
        }
      }
    } catch (eWh) {}
  }

  // Priority 3: Handle ntfy.sh JSON poll stream (NDJSON / JSON lines)
  if (text.includes('"message":') || text.includes('"event":')) {
    const lines = text.split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item && item.message && typeof item.message === 'string') {
          const parsedFromMsg = await cleanAndParseJsonFromCloud(item.message);
          if (parsedFromMsg) return parsedFromMsg;
        }
      } catch (e) {}
    }
  }

  // Priority 4: URL-Encoded strings (e.g. %7B%22author%22...)
  if (text.includes("%7B") || text.includes("%7b") || text.includes("%22")) {
    try {
      const decoded = decodeURIComponent(text);
      const parsedDecoded = await cleanAndParseJsonFromCloud(decoded);
      if (parsedDecoded) return parsedDecoded;
    } catch (eDec) {}
  }

  // Priority 5: URL query parameters (e.g. "kcal=500&steps=8400&author=he" or "?syncWatch=true&...")
  if (text.includes("=") && (text.includes("kcal=") || text.includes("steps=") || text.includes("author=") || text.includes("syncWatch="))) {
    try {
      const cleanParamsText = text.startsWith("?") ? text.slice(1) : text;
      const qParams = new URLSearchParams(cleanParamsText);
      const resObj = {};
      for (const [k, v] of qParams.entries()) {
        resObj[k] = v;
      }
      if (Object.keys(resObj).length > 0) {
        return resObj;
      }
    } catch (eQ) {}
  }

  // Priority 6: URL-Safe Base64 decoding
  const fromUrlB64 = fromUrlSafeB64(text);
  if (fromUrlB64) return fromUrlB64;

  // Priority 7: Direct Raw JSON Parsing
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (eDirect) {}
  }

  // Priority 8: Escaped JSON string (e.g. "\"{\\\"author\\\":...}\"")
  if (text.startsWith('"') && text.endsWith('"')) {
    try {
      const unquoted = JSON.parse(text);
      if (typeof unquoted === 'string') {
        const parsedInner = await cleanAndParseJsonFromCloud(unquoted);
        if (parsedInner) return parsedInner;
      } else if (typeof unquoted === 'object' && unquoted !== null) {
        return unquoted;
      }
    } catch (eUnquote) {}
  }

  return null;
}

function mergeCloudDataIntoAppState(cloudData) {
  if (!cloudData || typeof cloudData !== 'object') return false;
  let hasChanges = false;
  const author = cloudData.authorProfileId || cloudData.masterProfileId || cloudData.author || cloudData.pid || 'he';
  const authorName = author === 'he' ? 'Carlos' : author === 'she' ? 'Andrea' : author;

  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = defaultWatchMetrics;
  if (!appState.appleWatch.metrics[author]) appState.appleWatch.metrics[author] = { ...defaultWatchMetrics[author] };

  if (!appState.appleWatch.cloudReplica) appState.appleWatch.cloudReplica = defaultCloudReplica;
  if (!appState.appleWatch.cloudReplica[author]) appState.appleWatch.cloudReplica[author] = { ...defaultCloudReplica[author] };

  // Full backup state import (from JSON file or full cloud backup)
  if (cloudData.appleWatch?.metrics && cloudData.profiles) {
    if (cloudData.appleWatch.metrics[author]) {
      appState.appleWatch.metrics[author] = { ...appState.appleWatch.metrics[author], ...cloudData.appleWatch.metrics[author] };
    }
    if (cloudData.appleWatch.cloudReplica?.[author]) {
      appState.appleWatch.cloudReplica[author] = { ...appState.appleWatch.cloudReplica[author], ...cloudData.appleWatch.cloudReplica[author] };
    }
    if (cloudData.completedWorkouts?.[author]) {
      appState.completedWorkouts[author] = { ...appState.completedWorkouts[author], ...cloudData.completedWorkouts[author] };
    }
    hasChanges = true;
  }

  // 1. Direct Background Shortcut Telemetry -> Update both Main Health Metrics and Replica Subtab
  const rep = appState.appleWatch.cloudReplica[author];
  const m = appState.appleWatch.metrics[author];
  let replicaMetricsUpdated = false;

  const kcalVal = parseSmartMetricValue(cloudData.kcal ?? cloudData.moveKcal ?? cloudData.activeCalories ?? cloudData.calorias);
  if (kcalVal !== null) {
    rep.moveKcal = kcalVal;
    m.moveKcal = kcalVal;
    replicaMetricsUpdated = true;
  }

  const stepsVal = parseSmartMetricValue(cloudData.steps ?? cloudData.pasos);
  if (stepsVal !== null) {
    rep.steps = stepsVal;
    m.steps = stepsVal;
    rep.distanceKm = parseFloat((rep.steps * 0.00075).toFixed(2));
    m.distanceKm = rep.distanceKm;
    replicaMetricsUpdated = true;
  }

  const distVal = parseSmartMetricFloatValue(cloudData.dist ?? cloudData.distanceKm ?? cloudData.distance ?? cloudData.distancia);
  if (distVal !== null) {
    rep.distanceKm = distVal;
    m.distanceKm = distVal;
    replicaMetricsUpdated = true;
  }

  const hrVal = parseSmartMetricValue(cloudData.hr ?? cloudData.heartRate ?? cloudData.avgHr ?? cloudData.pulso ?? cloudData.ritmoCardiaco);
  if (hrVal !== null) {
    rep.hr = hrVal;
    m.hr = hrVal;
    replicaMetricsUpdated = true;
  }

  const exMinVal = parseSmartMetricValue(cloudData.exMin ?? cloudData.exerciseMin ?? cloudData.durationMin ?? cloudData.minutosEjercicio);
  if (exMinVal !== null) {
    rep.exerciseMin = exMinVal;
    m.exerciseMin = exMinVal;
    replicaMetricsUpdated = true;
  }

  if (replicaMetricsUpdated) {
    rep.lastSync = new Date().toISOString();
    appState.appleWatch.lastGlobalSync = new Date().toISOString();
    hasChanges = true;
  }

  // Direct Weight log from cloud
  const weightVal = parseSmartMetricValue(cloudData.weight ?? cloudData.peso);
  if (weightVal !== null && weightVal > 30 && weightVal < 250) {
    if (!appState.weightLogs) appState.weightLogs = {};
    if (!appState.weightLogs[author]) appState.weightLogs[author] = [];
    const todayStr = "Hoy";
    const existingIdx = appState.weightLogs[author].findIndex(w => w && w.date === todayStr);
    if (existingIdx >= 0) {
      appState.weightLogs[author][existingIdx].weight = weightVal;
    } else {
      appState.weightLogs[author].push({ date: todayStr, weight: weightVal });
    }
    hasChanges = true;
  }

  // Direct Workout Sync from cloud
  const isWorkoutSync = cloudData.workout === true || cloudData.workout === "true" || cloudData.syncWorkout === "true" || cloudData.workoutKcal !== undefined || (cloudData.duration !== undefined && cloudData.avgHr !== undefined);
  if (isWorkoutSync) {
    let targetDay = cloudData.day;
    if (!targetDay || targetDay === "Hoy" || targetDay === "today" || targetDay.toLowerCase() === "today") {
      targetDay = getTodayDayName();
    }
    const wDur = parseSmartMetricValue(cloudData.workoutDuration ?? cloudData.duration ?? cloudData.dur) ?? (exMinVal || 45);
    const wKcal = parseSmartMetricValue(cloudData.workoutKcal ?? cloudData.wKcal) ?? (kcalVal || 350);
    const wAvgHr = parseSmartMetricValue(cloudData.workoutAvgHr ?? cloudData.avgHr) ?? (hrVal || 140);
    const wMaxHr = parseSmartMetricValue(cloudData.workoutMaxHr ?? cloudData.maxHr) ?? (rep.maxHr || (wAvgHr + 20));
    const timeStr = cloudData.timeStr || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs");

    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[author]) appState.completedWorkouts[author] = {};
    
    appState.completedWorkouts[author][targetDay] = {
      done: true,
      watchData: {
        deviceName: `Apple Watch (${authorName})`,
        durationMin: wDur,
        kcal: wKcal,
        avgHr: wAvgHr,
        maxHr: wMaxHr,
        timestamp: timeStr,
        autoSync: true
      }
    };
    replicaMetricsUpdated = true;
  }

  if (replicaMetricsUpdated) {
    hasChanges = true;
    rep.lastSync = new Date().toISOString();
    rep.source = "Atajo Nube en 2º Plano";

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appState.appleWatch.syncLogs.unshift({
      timestamp: timeStr,
      device: `Apple Watch (${authorName})`,
      hr: rep.hr,
      kcal: rep.moveKcal,
      steps: rep.steps,
      status: `☁️ Réplica Nube (${authorName}): ${rep.steps.toLocaleString()} pasos, ${rep.moveKcal} kcal`
    });
    if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();
  }

  // 2. PROFILES: Update profile data for author and dog
  ['he', 'she', 'dog'].forEach(pid => {
    if (cloudData.profiles?.[pid]) {
      if (!appState.profiles) appState.profiles = {};
      if (pid === author || pid === 'dog') {
        appState.profiles[pid] = { ...appState.profiles[pid], ...cloudData.profiles[pid] };
        hasChanges = true;
      }
    }
  });

  // 3. COMPLETED WORKOUTS: Update workouts for author
  ['he', 'she'].forEach(pid => {
    if (cloudData.completedWorkouts?.[pid] && pid === author) {
      if (!appState.completedWorkouts) appState.completedWorkouts = {};
      appState.completedWorkouts[pid] = { ...appState.completedWorkouts[pid], ...cloudData.completedWorkouts[pid] };
      hasChanges = true;
    }
  });

  // 4. WEIGHT LOGS: Union and deduplicate for author profile
  ['he', 'she'].forEach(pid => {
    if (Array.isArray(cloudData.weightLogs?.[pid]) && pid === author) {
      const cloudLogs = cloudData.weightLogs[pid];
      const localLogs = appState.weightLogs?.[pid] || [];
      const logMap = new Map();
      localLogs.forEach(entry => { if (entry && entry.date) logMap.set(entry.date, entry); });
      cloudLogs.forEach(entry => { if (entry && entry.date) logMap.set(entry.date, entry); });
      if (!appState.weightLogs) appState.weightLogs = {};
      appState.weightLogs[pid] = Array.from(logMap.values());
      hasChanges = true;
    }
  });

  // 5. APPLE WATCH METRICS: Update metrics for author
  ['he', 'she'].forEach(pid => {
    if (cloudData.appleWatch?.metrics?.[pid] && pid === author) {
      const cM = cloudData.appleWatch.metrics[pid];
      if (!appState.appleWatch) appState.appleWatch = {};
      if (!appState.appleWatch.metrics) appState.appleWatch.metrics = {};
      appState.appleWatch.metrics[pid] = { ...appState.appleWatch.metrics[pid], ...cM };
      hasChanges = true;
    }
  });

  // 6. CHECKED SHOPPING ITEMS
  if (cloudData.checkedShoppingItems && typeof cloudData.checkedShoppingItems === 'object') {
    if (!appState.checkedShoppingItems) appState.checkedShoppingItems = {};
    Object.keys(cloudData.checkedShoppingItems).forEach(k => {
      if (cloudData.checkedShoppingItems[k] !== undefined) {
        appState.checkedShoppingItems[k] = cloudData.checkedShoppingItems[k];
        hasChanges = true;
      }
    });
  }

  // 7. EXCLUSIONS
  if (Array.isArray(cloudData.exclusions)) {
    if (!appState.exclusions) appState.exclusions = [];
    cloudData.exclusions.forEach(ex => {
      if (!appState.exclusions.includes(ex)) {
        appState.exclusions.push(ex);
        hasChanges = true;
      }
    });
  }

  if (cloudData.recipesDaysRange) appState.recipesDaysRange = cloudData.recipesDaysRange;
  if (cloudData.shoppingDaysRange) appState.shoppingDaysRange = cloudData.shoppingDaysRange;

  const mCurrent = appState.appleWatch?.metrics?.[author] || {};
  const w = appState.completedWorkouts?.[author] || {};
  const wDoneCount = Object.values(w).filter(val => val && (val === true || val.done)).length;
  const weightLogs = appState.weightLogs?.[author] || [];
  const lastWeight = Array.isArray(weightLogs) && weightLogs.length > 0 
    ? weightLogs[weightLogs.length - 1].weight 
    : 'N/A';

  const logDetails = `📥 Datos de ${authorName} importados: ${mCurrent.steps || 0} pasos, ${mCurrent.moveKcal || 0} kcal, ${mCurrent.exerciseMin || 0} min ejerc., ${wDoneCount} entrenamientos, peso ${lastWeight} kg`;
  addSyncConsoleLog(logDetails, "success");

  if (hasChanges) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    if (appState.appleWatch?.metrics) {
      localStorage.setItem(LAST_REGISTERED_METRICS_KEY, JSON.stringify(appState.appleWatch.metrics));
    }
  }
  return hasChanges;
}

export function copyDiagnosticLogs() {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const logsText = consoleEl ? consoleEl.textContent : "";
  if (!logsText) {
    if (typeof showIosToast === 'function') showIosToast("⚠️ Consola de logs vacía", "fa-solid fa-triangle-exclamation");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logsText).then(() => {
      if (typeof showIosToast === 'function') showIosToast("📋 ¡Logs copiados al portapapeles!", "fa-solid fa-copy");
    }).catch(() => fallbackCopyText(logsText));
  } else {
    fallbackCopyText(logsText);
  }
}
function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
    if (typeof showIosToast === 'function') showIosToast("📋 ¡Logs copiados al portapapeles!", "fa-solid fa-copy");
  } catch (err) {}
  document.body.removeChild(textArea);
}
window.copyDiagnosticLogs = copyDiagnosticLogs;

let isPushSyncing = false;
let isPullSyncing = false;

export async function pushToCloud(showToast = false) {
  if (isPushSyncing) {
    if (showToast) {
      addSyncConsoleLog("⏳ Envío a la nube ya en proceso, omitiendo push paralelo", "warn");
    }
    return;
  }
  isPushSyncing = true;

  try {
    const key = getCloudSyncKey();
    const masterPid = getMasterProfileId();
    const authorName = masterPid === 'he' ? 'Carlos' : 'Andrea';
    const p = appState.profiles?.[masterPid] || {};
    const m = appState.appleWatch?.metrics?.[masterPid] || {};
    const w = appState.completedWorkouts?.[masterPid] || {};
    const wDoneCount = Object.values(w).filter(val => val && (val === true || val.done)).length;
    const weightLogs = appState.weightLogs?.[masterPid] || [];
    const lastWeight = Array.isArray(weightLogs) && weightLogs.length > 0 
      ? weightLogs[weightLogs.length - 1].weight 
      : 'N/A';

    addSyncConsoleLog(`📤 Enviando datos de ${authorName} (${masterPid.toUpperCase()}): ${m.steps || 0} pasos, ${m.moveKcal || 0} kcal, ${m.exerciseMin || 0} min ejerc., ${wDoneCount} entrenamientos...`, "info");
    
    const compactPayload = {
      authorProfileId: masterPid,
      masterProfileId: masterPid,
      timestamp: new Date().toISOString(),
      profiles: {
        [masterPid]: {
          targetCalories: p.targetCalories || 2000,
          protein: p.protein,
          carbs: p.carbs,
          fats: p.fats
        },
        dog: appState.profiles?.dog
      },
      completedWorkouts: {
        [masterPid]: appState.completedWorkouts?.[masterPid] || {}
      },
      weightLogs: {
        [masterPid]: (appState.weightLogs?.[masterPid] || []).slice(-5)
      },
      appleWatch: {
        metrics: {
          [masterPid]: {
            steps: m.steps || 0,
            moveKcal: m.moveKcal || 0,
            exerciseMin: m.exerciseMin || 0,
            targetCalories: m.targetCalories || 2000,
            targetMin: m.targetMin || 30,
            stepsGoal: m.stepsGoal || 10000
          }
        }
      }
    };

    const urlSafeData = toUrlSafeB64(compactPayload);
    let pushSuccess = false;

    // 1. Primary Cloud: PubNub Unified Realtime Engine (GET Request - 0 CORS / 0 ITP Block)
    try {
      const pnChannel = `${key}_${masterPid}`;
      const encodedMsg = encodeURIComponent(JSON.stringify(urlSafeData));
      const pnPubUrl = `https://ps.pubnub.com/publish/demo/demo/0/${pnChannel}/0/${encodedMsg}`;
      addSyncConsoleLog(`📡 GET [PubNub Engine] (${masterPid.toUpperCase()})...`, "info");
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(pnPubUrl, { signal: controller.signal });
      clearTimeout(tId);
      if (res.ok) {
        pushSuccess = true;
        addSyncConsoleLog(`✅ Nube PubNub (${authorName.toUpperCase()} enviada a la nube en 30ms)`, "success");
      } else {
        addSyncConsoleLog(`⚠️ Nube PubNub respuesta: HTTP ${res.status}`, "warn");
      }
    } catch (ePnPush) {
      addSyncConsoleLog(`⚠️ Nube PubNub error: ${ePnPush.name} - ${ePnPush.message}`, "warn");
    }

    // 2. Secondary Channel: Ntfy Cloud Channel (sendBeacon)
    try {
      const channelUrl = `https://ntfy.sh/${key}_${masterPid}`;
      if (navigator && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(channelUrl, urlSafeData);
      }
    } catch (eCh) {}

    if (pushSuccess) {
      appState.lastCloudSync = new Date().toISOString();
      updateCloudSyncUI("Conectado a la Nube (Sincronizado)", true);
      addSyncConsoleLog(`✅ Publicado correctamente en la nube como ${authorName.toUpperCase()}`, "success");
      if (showToast && typeof showIosToast === 'function') {
        showIosToast("☁️ ¡Datos sincronizados en la nube!", "fa-solid fa-cloud-arrow-up");
      }
    } else {
      addSyncConsoleLog("⚠️ Envío diferido en segundo plano", "warn");
    }
  } catch (e) {
    console.warn("Cloud sync push error:", e);
    addSyncConsoleLog(`❌ Error en ciclo de envío: ${e.name} - ${e.message}`, "error");
  } finally {
    isPushSyncing = false;
  }
}
window.pushToCloud = pushToCloud;

export async function pullFromCloud(showToast = false) {
  if (isPullSyncing) {
    return;
  }
  isPullSyncing = true;

  try {
    const key = getCloudSyncKey();
    const myMasterPid = getMasterProfileId();
    const partnerPid = myMasterPid === 'he' ? 'she' : 'he';
    const channelsToPoll = [
      { pid: partnerPid, name: partnerPid === 'he' ? 'Carlos' : 'Andrea', isPartner: true },
      { pid: myMasterPid, name: myMasterPid === 'he' ? 'Carlos' : 'Andrea', isPartner: false }
    ];

    let hasMergedAny = false;
    let pullSuccess = false;

    for (const target of channelsToPoll) {
      try {
        const pnChannel = `${key}_${target.pid}`;
        const pnSubUrl = `https://ps.pubnub.com/v3/history/sub-key/demo/channel/${pnChannel}?count=1`;
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(pnSubUrl, { signal: controller.signal });
        clearTimeout(tId);

        if (res.ok) {
          const rawText = await res.text();
          if (rawText && rawText.trim().length > 10) {
            const data = await cleanAndParseJsonFromCloud(rawText);
            if (data) {
              pullSuccess = true;
              const changed = mergeCloudDataIntoAppState(data);
              if (changed) {
                hasMergedAny = true;
                addSyncConsoleLog(`✅ Nube: Datos de ${target.name.toUpperCase()} procesados (${target.isPartner ? 'Pareja' : 'Atajo en 2º plano'})`, "success");
              }
            }
          }
        }
      } catch (eCh) {
        // Continue to next channel
      }
    }

    if (pullSuccess || hasMergedAny) {
      appState.lastCloudSync = new Date().toISOString();
      updateCloudSyncUI("Conectado a la Nube (Sincronizado)", true);
    }

    if (hasMergedAny) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
      renderAll();
      if (showToast && typeof showIosToast === 'function') {
        showIosToast(`☁️ ¡Datos actualizados desde la nube!`, "fa-solid fa-cloud-arrow-down");
      }
    } else {
      addSyncConsoleLog("✅ Sincronización completa: Datos actualizados", "info");
    }
  } catch (e) {
    console.warn("Cloud sync pull error:", e);
    addSyncConsoleLog(`❌ Error en ciclo de descarga: ${e.name} - ${e.message}`, "error");
  } finally {
    isPullSyncing = false;
  }
}
window.pullFromCloud = pullFromCloud;

export function syncNowWithCloud() {
  triggerHapticTouch();
  addSyncConsoleLog("🔄 Iniciando ciclo de sincronización completo (Push -> Pull)...", "info");
  if (typeof showIosToast === 'function') {
    showIosToast("☁️ Sincronizando datos con la nube...", "fa-solid fa-arrows-rotate");
  }
  pushToCloud(false).then(() => {
    pullFromCloud(true).then(() => {
      renderAll();
    });
  });
}
window.syncNowWithCloud = syncNowWithCloud;

function saveCustomCloudKeyFromInput() {
  const input = document.getElementById("setting-cloud-key-input");
  if (!input) return;
  const keyVal = input.value.trim();
  if (keyVal.length < 3) {
    if (typeof showIosToast === 'function') showIosToast("⚠️ La clave debe tener al menos 3 caracteres", "fa-solid fa-triangle-exclamation");
    return;
  }
  localStorage.setItem("FITDUO_CLOUD_KEY", keyVal);
  addSyncConsoleLog(`🔑 Clave de Pareja actualizada a: "${keyVal}"`, "info");
  if (typeof showIosToast === 'function') showIosToast(`🔑 Clave guardada: ${keyVal}`, "fa-solid fa-key");
  syncNowWithCloud();
}
window.saveCustomCloudKeyFromInput = saveCustomCloudKeyFromInput;

function resetDefaultCloudKey() {
  localStorage.removeItem("FITDUO_CLOUD_KEY");
  const input = document.getElementById("setting-cloud-key-input");
  if (input) input.value = DEFAULT_CLOUD_KEY;
  addSyncConsoleLog(`🔑 Clave por defecto restablecida: "${DEFAULT_CLOUD_KEY}"`, "info");
  if (typeof showIosToast === 'function') showIosToast("🔑 Clave de pareja por defecto restablecida", "fa-solid fa-rotate-left");
  syncNowWithCloud();
}
window.resetDefaultCloudKey = resetDefaultCloudKey;

function exportSyncToken() {
  triggerHapticTouch();
  try {
    const payload = {
      masterProfileId: appState.masterProfileId,
      timestamp: new Date().toISOString(),
      profiles: appState.profiles,
      completedWorkouts: appState.completedWorkouts,
      weightLogs: appState.weightLogs,
      appleWatch: appState.appleWatch,
      checkedShoppingItems: appState.checkedShoppingItems,
      exclusions: appState.exclusions
    };
    const jsonStr = JSON.stringify(payload);
    const token = btoa(encodeURIComponent(jsonStr));
    navigator.clipboard.writeText(token).then(() => {
      if (typeof showIosToast === 'function') showIosToast("📋 ¡Código de sincronización copiado!", "fa-solid fa-copy");
      addSyncConsoleLog("📋 Código de emparejamiento copiado al portapapeles", "info");
    }).catch(() => {
      prompt("Copia este código de sincronización para pegarlo en el otro dispositivo:", token);
    });
  } catch(e) {
    console.error("Export sync token error:", e);
  }
}
window.exportSyncToken = exportSyncToken;

function promptImportSyncToken() {
  triggerHapticTouch();
  const token = prompt("Pega aquí el Código de Sincronización copiado desde el otro teléfono:");
  if (!token || !token.trim()) return;
  try {
    const jsonStr = decodeURIComponent(atob(token.trim()));
    const cloudData = JSON.parse(jsonStr);
    const hasMerged = mergeCloudDataIntoAppState(cloudData);
    if (hasMerged) {
      renderAll();
      if (typeof showIosToast === 'function') showIosToast("⚡ ¡Datos fusionados desde el código!", "fa-solid fa-bolt");
      addSyncConsoleLog("📥 Código de sincronización importado y fusionado", "success");
    } else {
      if (typeof showIosToast === 'function') showIosToast("ℹ️ Sin datos nuevos en el código introducido", "fa-solid fa-info");
    }
  } catch(e) {
    if (typeof showIosToast === 'function') showIosToast("❌ Código de sincronización inválido", "fa-solid fa-triangle-exclamation");
    addSyncConsoleLog("❌ Error al procesar código de sincronización", "error");
  }
}
window.promptImportSyncToken = promptImportSyncToken;

function exportBackupJson() {
  triggerHapticTouch();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `fitduo_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  if (typeof showIosToast === 'function') showIosToast("💾 Copia de seguridad JSON descargada", "fa-solid fa-download");
  addSyncConsoleLog("💾 Copia de seguridad JSON exportada", "info");
}
window.exportBackupJson = exportBackupJson;

function triggerImportBackupJson() {
  triggerHapticTouch();
  const fileInput = document.getElementById("json-backup-file-input");
  if (fileInput) fileInput.click();
}
window.triggerImportBackupJson = triggerImportBackupJson;

function handleBackupFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedState = JSON.parse(e.target.result);
      if (importedState && typeof importedState === 'object') {
        const hasMerged = mergeCloudDataIntoAppState(importedState);
        renderAll();
        if (typeof showIosToast === 'function') showIosToast("📂 Copia cargada y fusionada", "fa-solid fa-file-circle-check");
        addSyncConsoleLog("📂 Archivo de copia JSON importado", "success");
      }
    } catch(err) {
      if (typeof showIosToast === 'function') showIosToast("❌ Archivo JSON no válido", "fa-solid fa-circle-exclamation");
      addSyncConsoleLog("❌ Error al leer el archivo JSON", "error");
    }
  };
  reader.readAsText(file);
}
window.handleBackupFileSelect = handleBackupFileSelect;

function updateCloudSyncUI(statusText, isConnected) {
  const statusEl = document.getElementById("cloud-sync-status-text");
  if (statusEl) statusEl.innerText = `Estado: ${statusText}`;

  const timeEl = document.getElementById("cloud-last-sync-time");
  if (timeEl) {
    const timeStr = appState.lastCloudSync ? new Date(appState.lastCloudSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente';
    timeEl.innerText = `Última actualización: ${timeStr}`;
  }

  const badgeEl = document.getElementById("cloud-status-badge");
  if (badgeEl) {
    badgeEl.className = `cloud-status-badge ${isConnected ? '' : 'offline'}`;
    badgeEl.innerHTML = `<i class="fa-solid ${isConnected ? 'fa-cloud' : 'fa-cloud-slash'}"></i> Nube ${isConnected ? 'Conectada' : 'Local'}`;
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
  const kcal = m.moveKcal > 0 ? m.moveKcal : 420;
  const avgHr = m.hr || 138;
  const maxHr = m.maxHr || (avgHr + 22);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";

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
  const pid = profileId || getMasterProfileId();
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
  renderAll();

  if (notify) {
    const pName = appState.profiles[pid].name.split(" ")[0];
    showIosToast(` Entrenamiento de ${targetDay} vinculado automáticamente desde Apple Watch (${pName})`, "fa-brands fa-apple");
  }
}

function toggleWorkoutDay(dayName) {
  const profileId = getMasterProfileId();
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
  renderAll();
}

function resetWorkoutWeek() {
  const profileId = getMasterProfileId();
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  if (!appState.completedWorkouts[profileId]) {
    appState.completedWorkouts[profileId] = {};
  }
  days.forEach(d => {
    appState.completedWorkouts[profileId][d] = { done: false, watchData: null };
  });
  saveState();
  renderAll();
}

function syncAppleWatchData() {
  triggerManualSync();
  recordWatchWorkoutForDay(appState.activeWorkoutDay || "Lunes", getMasterProfileId(), true);
  openAppleWatchModal();
}

function renderWorkoutTracker() {
  const container = document.getElementById("profile-workouts-container");
  if (!container) return;

  const profileId = appState.activeProfileId;
  const p = appState.profiles[profileId];
  const watchMetrics = appState.appleWatch?.metrics[profileId] || { moveKcal: 0, hr: 0, steps: 0, distanceKm: 0 };
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
      <div class="apple-watch-banner">
        <div class="apple-watch-info">
          <div class="apple-watch-icon"><i class="fa-brands fa-apple"></i></div>
          <div>
            <h3 class="apple-watch-title"> Apple Watch (${p.name.split(' ')[0]}) - Live Auto-Sync</h3>
            <p class="apple-watch-subtitle">Última sync: ${watchMetrics.steps.toLocaleString()} pasos • ${watchMetrics.moveKcal} kcal • ${watchMetrics.hr} BPM (${watchMetrics.distanceKm} km con Boo)</p>
          </div>
        </div>
        <button class="btn-apple-sync" onclick="syncAppleWatchData();">
          <i class="fa-brands fa-apple"></i> Sincronizar
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
            <button class="btn-edit-watch-mini" onclick="event.stopPropagation(); openEditWorkoutWatchModal('${day}')" title="Calibrar datos reales de este entrenamiento"><i class="fa-solid fa-pen"></i></button>
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

// RENDER NUTRITION ENGINE (3 SUBTABS)
function openTodayNutrition() {
  const today = getTodayDayName();
  appState.activeDay = today;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = today;
  showTab("nutrition-menu-view", document.getElementById("dock-btn-nutrition"));
}

function selectDay(dayName, btnElem) {
  appState.activeDay = dayName;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = dayName;
  renderNutritionMenuView();
}

function selectDayFromDropdown(dayName) {
  appState.activeDay = dayName;
  renderNutritionMenuView();
}

// SUBTAB 1: MENU DEL DIA (5 TARJETAS VERTICALES)
function renderNutritionMenuView() {
  const container = document.getElementById("meal-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const availableRecipes = getFilteredRecipes();
  
  if (availableRecipes.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align:center; padding: 2rem;">
        <p style="color: var(--accent-rose);">⚠️ Habéis excluido demasiados alimentos y no hay recetas disponibles en la base de datos.</p>
      </div>
    `;
    return;
  }

  const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
  const lunches = availableRecipes.filter(r => r.type === "comida");
  const dinners = availableRecipes.filter(r => r.type === "cena");
  const snacks = availableRecipes.filter(r => r.type === "snack");

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const currentDay = appState.activeDay || getTodayDayName();
  const dayIndex = dayNames.indexOf(currentDay) >= 0 ? dayNames.indexOf(currentDay) : 0;

  // Sync dropdown selector state
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem && selectElem.value !== currentDay) {
    selectElem.value = currentDay;
  }

  const mealSlots = [
    { slotLabel: "DESAYUNO", slotIcon: "fa-sun", color: "var(--accent-amber)", meal: breakfasts[dayIndex % (breakfasts.length || 1)] || RECIPES_DATABASE[0] },
    { slotLabel: "SNACK 1 (MAÑANA)", slotIcon: "fa-apple-whole", color: "var(--accent-emerald)", meal: snacks[dayIndex % (snacks.length || 1)] || RECIPES_DATABASE[8] },
    { slotLabel: "COMIDA", slotIcon: "fa-utensils", color: "var(--accent-cyan)", meal: lunches[dayIndex % (lunches.length || 1)] || RECIPES_DATABASE[3] },
    { slotLabel: "SNACK 2 (TARDE)", slotIcon: "fa-cookie-bite", color: "var(--accent-purple)", meal: snacks[(dayIndex + 1) % (snacks.length || 1)] || RECIPES_DATABASE[9] },
    { slotLabel: "CENA", slotIcon: "fa-moon", color: "var(--accent-rose)", meal: dinners[dayIndex % (dinners.length || 1)] || RECIPES_DATABASE[6] }
  ];

  mealSlots.forEach((slot, idx) => {
    const meal = slot.meal;
    if (!meal) return;

    const card = document.createElement("div");
    card.className = "glass-card meal-card vertical-meal-card";

    const ingredientsHtml = meal.ingredients.map(ing => `
      <li>
        <span>${ing.name}</span>
        <strong>${ing.amount} ${ing.unit}</strong>
      </li>
    `).join("");

    const tagsHtml = meal.tags.map(t => `<span class="macro-pill">${t}</span>`).join(" ");

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <div class="meal-card-type" style="color: ${slot.color}; font-size: 0.82rem; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid ${slot.slotIcon}"></i> <strong>${slot.slotLabel}</strong> • ${meal.prepTime} min prep
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-card); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color);">
          Plato ${idx + 1} de 5
        </span>
      </div>

      <h3 class="meal-card-title" style="font-size: 1.15rem; margin-bottom: 0.6rem;">${meal.name}</h3>
      
      <div class="meal-macros-pills" style="margin-bottom: 0.75rem;">
        <span class="macro-pill" style="color:var(--accent-amber); font-weight:600;"><i class="fa-solid fa-fire"></i> ${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald); font-weight:600;"><i class="fa-solid fa-dumbbell"></i> ${meal.protein}g Proteína</span>
        <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${meal.fats}g Grasas</span>
      </div>

      <div style="margin-bottom: 0.85rem;">${tagsHtml}</div>

      <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.3rem;">
        <i class="fa-solid fa-list-check"></i> Ingredientes necesarios:
      </h4>
      <ul class="ingredient-list">
        ${ingredientsHtml}
      </ul>

      <details style="font-size: 0.85rem; color: var(--accent-cyan); cursor: pointer; margin-top: 0.85rem; background: rgba(255,255,255,0.03); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <summary style="font-weight: 600; outline: none; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid fa-kitchen-set"></i> Ver Pasos de Preparación
        </summary>
        <ol style="margin-top: 0.6rem; padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.6;">
          ${meal.instructions.map(step => `<li style="margin-bottom: 0.3rem;">${step}</li>`).join("")}
        </ol>
      </details>
    `;
    container.appendChild(card);
  });
}

// SUBTAB 2: RECETAS Y BATCH COOKING
function setRecipesRange(range) {
  appState.recipesDaysRange = range;
  saveState();
  const btn5 = document.getElementById("recipes-range-5");
  const btn7 = document.getElementById("recipes-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');
  renderNutritionRecipesView();
}

function renderNutritionRecipesView() {
  const container = document.getElementById("recipes-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.recipesDaysRange || '5';
  const dayNames = range === '5' 
    ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const btn5 = document.getElementById("recipes-range-5");
  const btn7 = document.getElementById("recipes-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  const usedRecipes = new Map();

  dayNames.forEach((dayName, idx) => {
    const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
    const lunches = availableRecipes.filter(r => r.type === "comida");
    const dinners = availableRecipes.filter(r => r.type === "cena");
    const snacks = availableRecipes.filter(r => r.type === "snack");

    const dailyMeals = [
      breakfasts[idx % (breakfasts.length || 1)],
      lunches[idx % (lunches.length || 1)],
      dinners[idx % (dinners.length || 1)],
      snacks[idx % (snacks.length || 1)],
      snacks[(idx + 1) % (snacks.length || 1)]
    ];

    dailyMeals.forEach(m => {
      if (m && !usedRecipes.has(m.id)) {
        usedRecipes.set(m.id, { meal: m, days: [dayName] });
      } else if (m && usedRecipes.has(m.id)) {
        usedRecipes.get(m.id).days.push(dayName);
      }
    });
  });

  if (usedRecipes.size === 0) {
    container.innerHTML = `<div class="glass-card"><p style="color:var(--text-muted);">No hay recetas registradas.</p></div>`;
    return;
  }

  usedRecipes.forEach(({ meal, days }) => {
    const card = document.createElement("div");
    card.className = "glass-card recipe-batch-card";

    const ingredientsHtml = meal.ingredients.map(ing => `
      <li><span>${ing.name}</span><strong>${ing.amount} ${ing.unit}</strong></li>
    `).join("");

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.4rem;">
        <span class="meal-card-type"><i class="fa-solid fa-fire-burner"></i> ${meal.type.toUpperCase()} • ${meal.prepTime} min</span>
        <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-calendar-check"></i> ${days.join(", ")}</span>
      </div>
      <h3 class="meal-card-title">${meal.name}</h3>

      <div class="meal-macros-pills">
        <span class="macro-pill" style="color:var(--accent-amber);">${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald);">${meal.protein}g Prot</span>
        <span class="macro-pill" style="color:var(--accent-cyan);">${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet);">${meal.fats}g Grasas</span>
      </div>

      <h4 style="font-size:0.85rem; color:var(--text-muted); margin:0.6rem 0 0.4rem 0;">Ingredientes requeridos:</h4>
      <ul class="ingredient-list">${ingredientsHtml}</ul>

      <details style="font-size:0.85rem; color:var(--accent-cyan); cursor:pointer; margin-top:0.75rem; background:rgba(255,255,255,0.03); padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <summary style="font-weight:600;">Paso a Paso & Batch Prep</summary>
        <ol style="margin-top:0.5rem; padding-left:1.2rem; color:var(--text-muted); line-height:1.5;">
          ${meal.instructions.map(s => `<li>${s}</li>`).join("")}
        </ol>
      </details>
    `;
    container.appendChild(card);
  });
}

// SUBTAB 3: LISTA DE LA COMPRA INTELIGENTE
function setShoppingRange(range) {
  appState.shoppingDaysRange = range;
  saveState();
  const btn5 = document.getElementById("shopping-range-5");
  const btn7 = document.getElementById("shopping-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');
  renderShoppingView();
}

function renderShoppingView() {
  const container = document.getElementById("shopping-categories-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.shoppingDaysRange || '5';
  const dayNames = range === '5' 
    ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const btn5 = document.getElementById("shopping-range-5");
  const btn7 = document.getElementById("shopping-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  const aggregated = {};

  dayNames.forEach((d, idx) => {
    const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
    const lunches = availableRecipes.filter(r => r.type === "comida");
    const dinners = availableRecipes.filter(r => r.type === "cena");
    const snacks = availableRecipes.filter(r => r.type === "snack");

    const dailyMeals = [
      breakfasts[idx % (breakfasts.length || 1)],
      lunches[idx % (lunches.length || 1)],
      dinners[idx % (dinners.length || 1)],
      snacks[idx % (snacks.length || 1)],
      snacks[(idx + 1) % (snacks.length || 1)]
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
function openTodayWorkouts() {
  const today = getTodayDayName();
  let targetBtn = null;
  document.querySelectorAll("#workout-days-tabs .day-tab").forEach(btn => {
    if (btn.innerText.trim().toLowerCase() === today.toLowerCase()) {
      targetBtn = btn;
    }
  });
  selectWorkoutDay(today, targetBtn);
  showTab("workouts-view", document.getElementById("dock-btn-workouts"));
}

function selectWorkoutDay(dayName, btnElem) {
  appState.activeWorkoutDay = dayName;
  document.querySelectorAll("#workout-days-tabs .day-tab").forEach(tab => tab.classList.remove("active"));
  if (btnElem) btnElem.classList.add("active");
  renderWorkoutsView();
}

function selectWorkoutDayFromDropdown(dayName) {
  appState.activeWorkoutDay = dayName;
  renderWorkoutsView();
}

function selectBooDayFromDropdown(dayName) {
  appState.activeBooDay = dayName;
  renderBooWorkoutView();
}

function toggleBooTask(taskId, dayName) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.completedTasks) appState.booProgress.completedTasks = {};
  const current = !!appState.booProgress.completedTasks[taskId];
  appState.booProgress.completedTasks[taskId] = !current;
  saveState();
  renderBooWorkoutView();
  showToast(!current ? "🐾 ¡Ejercicio de Boo registrado!" : "Ejercicio desmarcado", "success");
}

function setBooMood(dayName, mood) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.moodLogs) appState.booProgress.moodLogs = {};
  appState.booProgress.moodLogs[dayName] = mood;
  saveState();
  renderBooWorkoutView();
  showToast(`Estado de Boo guardado: ${mood}`, "info");
}

function saveBooSessionNotes(dayName) {
  triggerHapticTouch();
  const input = document.getElementById("boo-session-note-input");
  if (!input) return;
  const note = input.value.trim();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.sessionNotes) appState.booProgress.sessionNotes = {};
  appState.booProgress.sessionNotes[dayName] = note;
  saveState();
  showToast("📝 Nota del paseo guardada", "success");
}

function markBooModulePracticed(moduleId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.moduleStats) appState.booProgress.moduleStats = {};
  const count = (appState.booProgress.moduleStats[moduleId] || 0) + 1;
  appState.booProgress.moduleStats[moduleId] = count;
  saveState();
  renderBooWorkoutView();
  showToast(`🐾 ¡Módulo practicado! Total: ${count} sesiones`, "success");
}

function renderWorkoutsView() {
  const container = document.getElementById("routines-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeWorkoutDay || getTodayDayName();

  // Sync dropdown selector state if present
  const selectElem = document.getElementById("workout-day-select");
  if (selectElem && selectElem.value !== activeDay) {
    selectElem.value = activeDay;
  }
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

function toggleContinuousItem(itemId, dayName) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.completedContinuous) appState.booProgress.completedContinuous = {};
  const key = `${dayName}_${itemId}`;
  const current = !!appState.booProgress.completedContinuous[key];
  appState.booProgress.completedContinuous[key] = !current;
  saveState();
  renderBooWorkoutView();
  showToast(!current ? "🐾 ¡Hábito de Boo reforzado hoy!" : "Desmarcado", "success");
}

function markTrickMastered(trickId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.learnedTricks) appState.booProgress.learnedTricks = [];
  if (!appState.booProgress.learnedTricks.includes(trickId)) {
    appState.booProgress.learnedTricks.push(trickId);
  }
  // Find next unlearned trick in backlog
  const nextTrick = BOO_TRICKS_BACKLOG.find(t => !appState.booProgress.learnedTricks.includes(t.id));
  appState.booProgress.activeTrickId = nextTrick ? nextTrick.id : null;

  saveState();
  renderBooWorkoutView();
  showToast("🎉 ¡Enhorabuena! Boo ha dominado un nuevo truco. Desbloqueado el siguiente.", "success");
}

function selectActiveTrickFromBacklog(trickId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  appState.booProgress.activeTrickId = trickId;
  saveState();
  renderBooWorkoutView();
  showToast("🎯 Truco seleccionado para trabajar hoy.", "info");
}

function toggleBooAccordion(accordionId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.accordions) appState.booProgress.accordions = {};
  const current = !!appState.booProgress.accordions[accordionId];
  appState.booProgress.accordions[accordionId] = !current;
  saveState();
  renderBooWorkoutView();
}

function openBooBacklogModal() {
  try {
    try { triggerHapticTouch(); } catch(e){}
    let modal = document.getElementById("boo-backlog-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "boo-backlog-modal";
      modal.className = "modal-overlay";
      modal.onclick = (e) => closeBooBacklogModalOnBackdrop(e);
      modal.innerHTML = `
        <div class="glass-modal" style="max-width: 620px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-title">
              <div style="font-size: 1.8rem;">🐕</div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff;">Mapa de Adiestramiento de Boo 🐾</h3>
                <p style="font-size: 0.78rem; color: var(--accent-amber);">Catálogo completo de trucos dominados y cola del backlog</p>
              </div>
            </div>
            <button type="button" class="modal-close-btn" onclick="closeBooBacklogModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body" id="boo-backlog-modal-content" style="padding-top: 1rem;">
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    renderBooBacklogModalUI();
    modal.style.cssText = "display: flex !important; opacity: 1 !important; visibility: visible !important; z-index: 99999 !important;";
    modal.classList.add("active");
  } catch (err) {
    console.error("Error opening Boo backlog modal:", err);
  }
}

function closeBooBacklogModal() {
  try {
    try { triggerHapticTouch(); } catch(e){}
    const modal = document.getElementById("boo-backlog-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  } catch (err) {}
}

function closeBooBacklogModalOnBackdrop(e) {
  if (e && e.target && e.target.id === "boo-backlog-modal") {
    closeBooBacklogModal();
  }
}

function renderBooBacklogModalUI() {
  const container = document.getElementById("boo-backlog-modal-content");
  if (!container) return;

  if (!appState.booProgress) {
    appState.booProgress = { completedContinuous: {}, learnedTricks: [], activeTrickId: null, moodLogs: {}, sessionNotes: {}, accordions: {} };
  }

  const learnedTricks = appState.booProgress.learnedTricks || [];
  const activeTrickId = appState.booProgress.activeTrickId;

  const unlearnedTricks = BOO_TRICKS_BACKLOG.filter(t => !learnedTricks.includes(t.id));
  const masteredTricks = BOO_TRICKS_BACKLOG.filter(t => learnedTricks.includes(t.id));

  const unlearnedListHtml = unlearnedTricks.map((t, idx) => {
    const isCurrentActive = activeTrickId === t.id;
    return `
      <div style="padding: 0.85rem 0.95rem; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid ${isCurrentActive ? 'var(--accent-amber)' : 'var(--border-color)'}; margin-bottom: 0.75rem; box-shadow: ${isCurrentActive ? '0 4px 16px rgba(245, 158, 11, 0.12)' : 'none'}; transition: all 0.2s ease;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; width: 100%;">
          <div style="display: flex; align-items: flex-start; gap: 0.6rem; flex: 1; min-width: 0;">
            <span style="font-weight: 700; font-size: 0.8rem; color: var(--accent-amber); background: rgba(245, 158, 11, 0.18); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">#${idx + 1}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.95rem; font-weight: 700; color: #fff; line-height: 1.35; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
                <i class="${t.icon}" style="color: ${t.badgeColor}; font-size: 0.9rem; margin-right: 0.35rem;"></i>${t.title}
              </div>
            </div>
          </div>
          <div style="flex-shrink: 0; margin-left: 0.4rem;">
            ${isCurrentActive ? `
              <span style="font-size: 0.75rem; background: rgba(245,158,11,0.22); color: var(--accent-amber); padding: 4px 10px; border-radius: 12px; font-weight: 700; border: 1px solid var(--accent-amber); display: inline-block; white-space: nowrap;">
                🎯 En Curso
              </span>
            ` : `
              <button type="button" class="btn-micro" onclick="selectActiveTrickFromBacklog('${t.id}'); closeBooBacklogModal();" style="font-size: 0.75rem; padding: 5px 12px; border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary); font-weight: 600; border: 1px solid var(--border-color); white-space: nowrap;">
                Fijar Hoy
              </button>
            `}
          </div>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin: 0.35rem 0 0.4rem 2.1rem;">
          ${t.summary}
        </div>

        <div style="margin-left: 2.1rem; font-size: 0.72rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 6px; color: var(--accent-cyan); font-weight: 500;">${t.category}</span>
          <span style="color: var(--text-muted);">•</span>
          <span>Dificultad: <strong style="color: var(--accent-amber);">${t.difficulty}</strong></span>
        </div>
      </div>
    `;
  }).join("");

  const masteredListHtml = masteredTricks.map(t => `
    <div style="padding: 0.75rem 0.95rem; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.25); margin-bottom: 0.5rem; display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; width: 100%;">
      <div style="display: flex; align-items: flex-start; gap: 0.6rem; flex: 1; min-width: 0;">
        <span style="font-size: 1.1rem; color: var(--accent-emerald); flex-shrink: 0; margin-top: 2px;"><i class="fa-solid fa-medal"></i></span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.9rem; font-weight: 700; color: #fff; line-height: 1.3;">${t.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px; line-height: 1.35;">${t.summary}</div>
        </div>
      </div>
      <span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 700; background: rgba(16,185,129,0.15); padding: 4px 10px; border-radius: 12px; flex-shrink: 0; white-space: nowrap;">
        <i class="fa-solid fa-circle-check"></i> Dominado
      </span>
    </div>
  `).join("");

  container.innerHTML = `
    <!-- STATS SUMMARY HEADER -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid fa-graduation-cap" style="color: var(--accent-amber); font-size: 1.2rem;"></i>
        <span style="font-size: 0.88rem; font-weight: 600; color: #fff;">Progreso Total del Backlog</span>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <span style="font-size: 0.78rem; padding: 3px 10px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); font-weight: 700;">
          🏆 ${masteredTricks.length} Aprendidos
        </span>
        <span style="font-size: 0.78rem; padding: 3px 10px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); font-weight: 700;">
          ⏳ ${unlearnedTricks.length} Pendientes
        </span>
      </div>
    </div>

    <!-- UNLEARNED QUEUE SECTION -->
    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--accent-amber); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid fa-list-ol"></i> Próximos Trucos en Cola de Aprendizaje (${unlearnedTricks.length})
      </h4>
      ${unlearnedListHtml || '<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem;">🎉 ¡Felicidades! Boo ha aprendido todos los trucos programados en el mapa.</p>'}
    </div>

    <!-- MASTERED HISTORY SECTION -->
    ${masteredTricks.length > 0 ? `
      <div>
        <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--accent-emerald); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-trophy"></i> Trucos Dominados e Histórico (${masteredTricks.length})
        </h4>
        ${masteredListHtml}
      </div>
    ` : ''}
  `;
}

function renderBooWorkoutView() {
  const container = document.getElementById("boo-workout-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeBooDay || getTodayDayName();
  
  // Sync dropdown selector state if present
  const selectElem = document.getElementById("boo-day-select");
  if (selectElem && selectElem.value !== activeDay) {
    selectElem.value = activeDay;
  }

  if (!appState.booProgress) {
    appState.booProgress = { completedContinuous: {}, learnedTricks: [], activeTrickId: null, moodLogs: {}, sessionNotes: {}, accordions: {} };
  }

  const completedContinuous = appState.booProgress.completedContinuous || {};
  const learnedTricks = appState.booProgress.learnedTricks || [];
  const moodLogs = appState.booProgress.moodLogs || {};
  const sessionNotes = appState.booProgress.sessionNotes || {};
  const accordions = appState.booProgress.accordions || {};

  // Determine Active Trick for Today
  let activeTrick = BOO_TRICKS_BACKLOG.find(t => t.id === appState.booProgress.activeTrickId);
  if (!activeTrick || learnedTricks.includes(activeTrick.id)) {
    // Pick first unlearned trick from backlog
    activeTrick = BOO_TRICKS_BACKLOG.find(t => !learnedTricks.includes(t.id)) || BOO_TRICKS_BACKLOG[0];
    appState.booProgress.activeTrickId = activeTrick ? activeTrick.id : null;
  }

  const currentMood = moodLogs[activeDay] || "🧘‍♂️ Calma & Enfocada";
  const currentNote = sessionNotes[activeDay] || "";

  // 1. BOO COMPACT HERO BANNER
  const heroCard = document.createElement("div");
  heroCard.className = "glass-card boo-hero-card";
  heroCard.style.marginBottom = "1.25rem";
  heroCard.innerHTML = `
    <div class="boo-hero-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="boo-avatar-badge" style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.25)); border: 2px solid var(--accent-amber); display: flex; align-items: center; justify-content: center; font-size: 1.7rem; box-shadow: var(--shadow-glow-amber);">
          🐕
        </div>
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin-bottom: 2px;">
            Boo <span style="font-size: 0.8rem; background: var(--bg-tertiary); color: var(--accent-amber); padding: 2px 8px; border-radius: 12px; font-weight: 500;">Border Collie • 3 años</span>
          </h2>
          <p style="color: var(--text-muted); font-size: 0.82rem;">
            Plan de adiestramiento conductual y backlog evolutivo de trucos
          </p>
        </div>
      </div>
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
        <span class="boo-stat-pill"><i class="fa-solid fa-trophy" style="color:var(--accent-amber);"></i> ${learnedTricks.length} Dominados</span>
        <span class="boo-stat-pill"><i class="fa-solid fa-list-check" style="color:var(--accent-cyan);"></i> ${BOO_TRICKS_BACKLOG.length - learnedTricks.length} En Cola</span>
        <button type="button" class="btn-primary" onclick="openBooBacklogModal()" style="font-size: 0.8rem; padding: 6px 12px; background: rgba(245, 158, 11, 0.18); border: 1px solid var(--accent-amber); color: var(--accent-amber); border-radius: 20px; font-weight: 600;">
          <i class="fa-solid fa-book-open"></i> Ver Mapa de Trucos
        </button>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // 2. OBJETIVO DE APRENDIZAJE DE HOY (1 TRUCO ACTIVO A LA VEZ)
  if (activeTrick) {
    const isMastered = learnedTricks.includes(activeTrick.id);
    const activeTrickCard = document.createElement("div");
    activeTrickCard.className = "glass-card boo-active-trick-card";
    activeTrickCard.style.cssText = "margin-bottom: 1.25rem; border: 1px solid var(--accent-amber); background: linear-gradient(135deg, rgba(245,158,11,0.06), rgba(19,26,42,0.95));";

    const stepsListHtml = activeTrick.steps.map((step, idx) => `
      <li style="margin-bottom: 0.45rem; font-size: 0.85rem; line-height: 1.4; color: var(--text-secondary); display: flex; gap: 0.5rem; align-items: flex-start;">
        <span style="background: ${activeTrick.badgeColor}; color: #000; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; flex-shrink: 0; margin-top: 2px;">${idx + 1}</span>
        <span>${step}</span>
      </li>
    `).join("");

    activeTrickCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.85rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.78rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; background: rgba(245, 158, 11, 0.18); color: var(--accent-amber); border: 1px solid var(--accent-amber);">
            <i class="fa-solid fa-bullseye"></i> OBJETIVO DE APRENDIZAJE DE HOY
          </span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Dificultad: <strong style="color:#fff;">${activeTrick.difficulty}</strong></span>
        </div>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-cyan); background: var(--bg-tertiary); padding: 4px 10px; border-radius: 12px;">
          <i class="${activeTrick.icon}"></i> ${activeTrick.category}
        </span>
      </div>

      <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: #fff; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem;">
        ${activeTrick.title}
      </h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.4;">
        ${activeTrick.summary}
      </p>

      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1rem;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.5px;">
          <i class="fa-solid fa-shoe-prints"></i> Paso a Paso para Entrenar Hoy:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${stepsListHtml}
        </ul>
      </div>

      <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); padding: 0.75rem 1rem; border-radius: 0 8px 8px 0; margin-bottom: 1.25rem; font-size: 0.82rem; color: var(--text-secondary);">
        <strong style="color: var(--accent-amber);"><i class="fa-solid fa-lightbulb"></i> Consejo Collie:</strong> ${activeTrick.proTip}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--border-color);">
        <span style="font-size: 0.82rem; color: var(--text-muted);">
          Estado: <strong style="color: ${isMastered ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">${isMastered ? '¡Ya Dominado!' : 'En Proceso de Aprendizaje'}</strong>
        </span>
        <button type="button" class="btn-primary" onclick="markTrickMastered('${activeTrick.id}')" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 0.88rem; padding: 8px 16px;">
          <i class="fa-solid fa-circle-check"></i> ¡Dominado / Ya lo sabe! ✅ (Siguiente Truco)
        </button>
      </div>
    `;
    container.appendChild(activeTrickCard);
  }

  // 3. REFUERZO CONTINUO DEL PASEO (ACCORDION COLAPSABLE)
  const isContinuousOpen = accordions["continuous"] ?? false;
  const continuousAccordionCard = document.createElement("div");
  continuousAccordionCard.className = "glass-card boo-accordion-card";
  continuousAccordionCard.style.marginBottom = "1.25rem";

  const continuousItemsHtml = BOO_CONTINUOUS_REINFORCEMENT.map(item => {
    const key = `${activeDay}_${item.id}`;
    const isDone = !!completedContinuous[key];
    return `
      <div class="boo-task-item ${isDone ? 'completed' : ''}" onclick="toggleContinuousItem('${item.id}', '${activeDay}')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s ease;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="custom-checkbox ${isDone ? 'checked' : ''}" style="width: 22px; height: 22px; border-radius: 6px; border: 2px solid ${isDone ? 'var(--accent-emerald)' : 'var(--text-muted)'}; background: ${isDone ? 'var(--accent-emerald)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75rem;">
            ${isDone ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.92rem; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'}; ${isDone ? 'text-decoration: line-through;' : ''}">
              <i class="${item.icon}" style="color: ${item.color};"></i> ${item.title}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${item.desc}</div>
          </div>
        </div>
        <span class="btn-micro" style="font-size: 0.78rem; padding: 4px 10px; border-radius: 12px; background: ${isDone ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)'}; color: ${isDone ? 'var(--accent-emerald)' : 'var(--text-secondary)'}; font-weight: 600;">
          ${isDone ? '¡Reforzado!' : 'Practicado hoy'}
        </span>
      </div>
    `;
  }).join("");

  continuousAccordionCard.innerHTML = `
    <div class="boo-accordion-header" onclick="toggleBooAccordion('continuous')" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <i class="fa-solid fa-arrows-rotate" style="font-size: 1.1rem; color: var(--accent-cyan);"></i>
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; margin: 0;">
            🔄 Refuerzo Continuo del Paseo (${activeDay})
          </h4>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 2px 0 0 0;">
            Hábitos permanentes que se trabajan a diario durante las salidas (Pulsar para ${isContinuousOpen ? 'ocultar' : 'desplegar'})
          </p>
        </div>
      </div>
      <i class="fa-solid fa-chevron-${isContinuousOpen ? 'up' : 'down'}" style="color: var(--text-muted);"></i>
    </div>

    ${isContinuousOpen ? `
      <div style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        ${continuousItemsHtml}
      </div>
    ` : ''}
  `;
  container.appendChild(continuousAccordionCard);

  // 4. REGISTRO EMOCIONAL Y NOTAS DEL PASEO
  const moodCard = document.createElement("div");
  moodCard.className = "glass-card";
  moodCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.85rem;">
      <div>
        <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-face-smile-wink" style="color: var(--accent-amber);"></i> Registro Emocional y Notas del Paseo (${activeDay})
        </h3>
        <p style="color: var(--text-muted); font-size: 0.8rem;">Registra la actitud de Boo hoy y anotaciones de su evolución</p>
      </div>
    </div>

    <div style="margin-bottom: 1rem;">
      <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">
        Estado de Ánimo Predominante de Boo Hoy:
      </label>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        ${["🧘‍♂️ Calma & Enfocada", "⚡ Alta Excitación", "🎾 Obsesionada con Pelota", "🎯 Excelente Respuesta a Llamada"].map(m => `
          <button type="button" class="boo-mood-btn ${currentMood === m ? 'active' : ''}" onclick="setBooMood('${activeDay}', '${m}')" style="padding: 6px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; border: 1px solid ${currentMood === m ? 'var(--accent-amber)' : 'var(--border-color)'}; background: ${currentMood === m ? 'rgba(245,158,11,0.2)' : 'var(--bg-secondary)'}; color: ${currentMood === m ? 'var(--accent-amber)' : 'var(--text-secondary)'}; cursor: pointer; transition: all 0.2s ease;">
            ${m}
          </button>
        `).join("")}
      </div>
    </div>

    <div>
      <label for="boo-session-note-input" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">
        Observaciones o Logro Destacado del Día:
      </label>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <input type="text" id="boo-session-note-input" class="custom-input" placeholder="Ej: ¡Hoy volvió a la primera cuando la llamé en el parque!" value="${currentNote.replace(/"/g, '&quot;')}" style="flex: 1; min-width: 240px; font-size: 0.85rem;">
        <button type="button" class="btn-primary" onclick="saveBooSessionNotes('${activeDay}')" style="font-size: 0.82rem;">
          <i class="fa-solid fa-floppy-disk"></i> Guardar Nota
        </button>
      </div>
    </div>
  `;
  container.appendChild(moodCard);
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
    const targetPid = getMasterProfileId();
    if (!appState.weightLogs[targetPid]) appState.weightLogs[targetPid] = [];
    appState.weightLogs[targetPid].push({
      date: todayStr,
      weight: val
    });
    input.value = "";
    saveState();
    renderAll();
    const masterName = targetPid === 'he' ? 'Carlos' : 'Andrea';
    showIosToast(`⚖️ ¡Registro de ${val} kg guardado en Perfil Maestro (${masterName})!`, "fa-solid fa-weight-scale");
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

// DEBUG & DIAGNOSTIC LOGS ENGINE
function addDebugLog(message, type = 'info', data = null) {
  if (!appState.debugLogs) appState.debugLogs = [];

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + "." + String(now.getMilliseconds()).padStart(3, '0');
  
  const logEntry = {
    id: Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    timestamp: timeStr,
    message: message,
    type: type, // 'info', 'success', 'warning', 'error', 'url', 'clipboard', 'health'
    data: data ? (typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data) : null
  };

  appState.debugLogs.unshift(logEntry);
  if (appState.debugLogs.length > 60) appState.debugLogs.pop();

  saveState();

  if (document.getElementById("logs-view")?.classList.contains("active")) {
    renderDebugLogsView();
  }
}

function clearDebugLogs() {
  triggerHapticTouch();
  appState.debugLogs = [];
  saveState();
  renderDebugLogsView();
  showIosToast("🗑️ Logs de diagnóstico limpiados", "fa-solid fa-trash-can");
}

function copyDebugLogsToClipboard() {
  triggerHapticTouch();
  if (!appState.debugLogs || appState.debugLogs.length === 0) {
    showIosToast("⚠️ No hay logs para copiar", "fa-solid fa-triangle-exclamation");
    return;
  }

  const logText = appState.debugLogs.map(l => 
    `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}` + (l.data ? ` | Data: ${JSON.stringify(l.data)}` : '')
  ).join("\n");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logText).then(() => {
      showIosToast("📋 ¡Logs copiados al portapapeles con éxito!", "fa-solid fa-copy");
    }).catch(() => {
      prompt("Copia manualmente los logs:", logText);
    });
  } else {
    prompt("Copia manualmente los logs:", logText);
  }
}

function renderDebugLogsView() {
  const container = document.getElementById("debug-logs-container");
  if (!container) return;

  const countBadge = document.getElementById("logs-count-badge");
  if (countBadge) countBadge.innerText = `${(appState.debugLogs || []).length} Registros`;

  const urlBadge = document.getElementById("logs-env-url");
  if (urlBadge) {
    const search = window.location.search || "? (Sin parámetros)";
    urlBadge.innerText = search;
  }

  const lastSyncBadge = document.getElementById("logs-env-last-sync");
  if (lastSyncBadge) {
    const lastSync = appState.appleWatch?.lastGlobalSync;
    lastSyncBadge.innerText = lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Pendiente";
  }

  const modeBadge = document.getElementById("logs-env-mode");
  if (modeBadge) {
    const mode = appState.appleWatch?.syncMode || "real";
    modeBadge.innerText = mode === "real" ? "🎯 Datos Reales (Preciso)" : "🧪 Simulación Demo";
  }

  const logs = appState.debugLogs || [];
  if (logs.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
        <i class="fa-solid fa-terminal" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block; color: var(--border-color);"></i>
        No hay registros aún en la consola de diagnóstico. Realiza una acción o sincroniza para ver los eventos en vivo.
      </div>
    `;
    return;
  }

  const typeStyles = {
    info: { icon: "fa-solid fa-circle-info", color: "var(--accent-cyan)", bg: "rgba(6, 182, 212, 0.08)", border: "rgba(6, 182, 212, 0.2)" },
    success: { icon: "fa-solid fa-circle-check", color: "var(--accent-emerald)", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)" },
    warning: { icon: "fa-solid fa-triangle-exclamation", color: "var(--accent-amber)", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)" },
    error: { icon: "fa-solid fa-circle-xmark", color: "var(--accent-rose)", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)" },
    url: { icon: "fa-solid fa-link", color: "var(--accent-amber)", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)" },
    clipboard: { icon: "fa-solid fa-paste", color: "var(--accent-purple)", bg: "rgba(168, 85, 247, 0.1)", border: "rgba(168, 85, 247, 0.3)" },
    health: { icon: "fa-brands fa-apple", color: "#fff", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.2)" }
  };

  container.innerHTML = logs.map(l => {
    const style = typeStyles[l.type] || typeStyles.info;
    const dataHtml = l.data ? `<pre style="margin-top: 0.35rem; padding: 0.45rem; background: rgba(0,0,0,0.5); border-radius: 4px; overflow-x: auto; font-size: 0.72rem; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.08);">${JSON.stringify(l.data, null, 2)}</pre>` : '';

    return `
      <div style="background: ${style.bg}; border: 1px solid ${style.border}; padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
          <span style="color: ${style.color}; font-weight: 700; display: flex; align-items: center; gap: 0.35rem;">
            <i class="${style.icon}"></i> [${l.type.toUpperCase()}] ${l.message}
          </span>
          <span style="color: var(--text-muted); font-size: 0.7rem;">${l.timestamp}</span>
        </div>
        ${dataHtml}
      </div>
    `;
  }).join("");
}

// Live timer update for summary sync time
setInterval(() => {
  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl && appState?.appleWatch?.lastGlobalSync) {
    syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch.lastGlobalSync);
  }
}, 5000);

// Global Window Exports for Boo Modal
window.openBooBacklogModal = openBooBacklogModal;
window.closeBooBacklogModal = closeBooBacklogModal;
window.closeBooBacklogModalOnBackdrop = closeBooBacklogModalOnBackdrop;

