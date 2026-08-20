/**
 * FitDuo & Collie Coach - Main Orchestrator (v0.8.0)
 * Modularized Architecture
 */

import { appState, LOCAL_STORAGE_KEY, LAST_ACTIVE_PROFILE_KEY, DEVICE_DEFAULT_PROFILE_KEY, loadSavedState, saveState, triggerHapticTouch, showIosToast, addDebugLog, clearDebugLogs, copyDebugLogsToClipboard, renderDebugLogsView, getMasterProfileId, getTodayDayName } from './js/state.js';
import { switchCategory, renderSubtabSegmentedControl, updateProfileSwitcherButtonsUI, renderAll, switchProfile, showTab, setDeviceDefaultProfile, checkDeviceIdentityBanner, getProfileShortName, updateUIProfileNames } from './js/navigation.js';
import { isCloudSyncing, pushToCloud, pullFromCloud, syncNowWithCloud, saveCustomCloudKeyFromInput, resetDefaultCloudKey, exportSyncToken, promptImportSyncToken, exportBackupJson, triggerImportBackupJson, handleBackupFileSelect, copyDiagnosticLogs, forceAppRefresh } from './js/cloudSync.js';
import { startAppleWatchAutoSync, openAppleWatchModal, closeAppleWatchModal, closeAppleWatchModalOnBackdrop, toggleAutoSync, triggerManualSync, checkUrlParamsForWatchSync, checkClipboardForWatchSync, checkAutoLaunchShortcutOnOpen, syncHealthShortcutAndCloud, launchIosShortcutSync, copyShortcutUrlToClipboard, copyShortcutCloudUrlToClipboard, openHealthSyncModal, closeHealthSyncModal, applyReplicaToPrimary, openManualMetricsModal, closeManualMetricsModal, saveManualMetricsFromModal, switchShortcutMethodTab, switchShortcutTab, testSimulatedHealthSync, testSimulatedWorkoutSync, resetMetricsToZeroUsingUrlShortcut, testSimulatedBackgroundCloudSync, updateAppleWatchModalUI, handleHealthFileImport, setAppleWatchSyncMode, updateShortcutUrlInputs, formatSyncRelativeTime } from './js/appleWatch.js';
import { renderSummaryView, renderProfileView } from './js/views/summaryView.js';
import { renderNutritionMenuView, renderNutritionRecipesView, renderShoppingView, selectDay, selectDayFromDropdown, openTodayNutrition, toggleShoppingItem, copyShoppingList, setRecipesRange, setShoppingRange, addExclusion, removeExclusion } from './js/views/nutritionView.js';
import { renderWorkoutsView, renderWorkoutTracker, openTodayWorkouts, selectWorkoutDay, selectWorkoutDayFromDropdown, toggleWorkoutDay, resetWorkoutWeek, recordWatchWorkoutForDay, syncAppleWatchData, openEditWorkoutWatchModal, closeEditWorkoutWatchModal, saveWorkoutWatchDataFromModal, connectBluetoothHR } from './js/views/workoutsView.js';
import { renderBooWorkoutView, selectBooDayFromDropdown, toggleBooTask, setBooMood, saveBooSessionNotes, markBooModulePracticed, toggleContinuousItem, markTrickMastered, selectActiveTrickFromBacklog, toggleBooAccordion, openBooBacklogModal, closeBooBacklogModal, closeBooBacklogModalOnBackdrop } from './js/views/booView.js';
import { renderProgressView, addWeightEntry } from './js/views/progressView.js';
import { renderSettingsView, populateSettingsInputs, saveCustomSettings } from './js/views/settingsView.js';
import { sendChatMessage, handleChatKeyPress } from './js/views/chatView.js';

// Expose state and functions to window for HTML inline event handlers
window.appState = appState;
window.switchProfile = switchProfile;
window.syncNowWithCloud = syncNowWithCloud;
window.setDeviceDefaultProfile = setDeviceDefaultProfile;
window.showTab = showTab;
window.switchCategory = switchCategory;
window.renderAll = renderAll;
window.renderSummaryView = renderSummaryView;
window.renderProfileView = renderProfileView;
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

// Apple Watch & iOS Specific Global Handlers
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
window.openHealthSyncModal = openHealthSyncModal;
window.closeHealthSyncModal = closeHealthSyncModal;
window.applyReplicaToPrimary = applyReplicaToPrimary;
window.openManualMetricsModal = openManualMetricsModal;
window.closeManualMetricsModal = closeManualMetricsModal;
window.saveManualMetricsFromModal = saveManualMetricsFromModal;
window.switchShortcutTab = switchShortcutTab;
window.switchShortcutMethodTab = switchShortcutMethodTab;
window.copyShortcutUrlToClipboard = copyShortcutUrlToClipboard;
window.copyShortcutCloudUrlToClipboard = copyShortcutCloudUrlToClipboard;
window.testSimulatedHealthSync = testSimulatedHealthSync;
window.testSimulatedWorkoutSync = testSimulatedWorkoutSync;
window.testSimulatedBackgroundCloudSync = testSimulatedBackgroundCloudSync;
window.resetMetricsToZeroUsingUrlShortcut = resetMetricsToZeroUsingUrlShortcut;
window.addDebugLog = addDebugLog;
window.clearDebugLogs = clearDebugLogs;
window.copyDebugLogsToClipboard = copyDebugLogsToClipboard;
window.renderDebugLogsView = renderDebugLogsView;
window.updateAppleWatchModalUI = updateAppleWatchModalUI;
window.handleHealthFileImport = handleHealthFileImport;

// Cloud Multi-Device Global Handlers
window.pushToCloud = pushToCloud;
window.pullFromCloud = pullFromCloud;
window.saveCustomCloudKeyFromInput = saveCustomCloudKeyFromInput;
window.resetDefaultCloudKey = resetDefaultCloudKey;
window.exportSyncToken = exportSyncToken;
window.promptImportSyncToken = promptImportSyncToken;
window.exportBackupJson = exportBackupJson;
window.triggerImportBackupJson = triggerImportBackupJson;
window.handleBackupFileSelect = handleBackupFileSelect;
window.copyDiagnosticLogs = copyDiagnosticLogs;
window.saveCustomSettings = saveCustomSettings;
window.checkDeviceIdentityBanner = checkDeviceIdentityBanner;
window.getProfileShortName = getProfileShortName;
window.isCloudSyncing = isCloudSyncing;

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  checkDeviceIdentityBanner();

  setTimeout(() => {
    pullFromCloud(false);
  }, 1000);

  setInterval(() => {
    pullFromCloud(false);
  }, 45000);

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

// Storage, Visibility & Lifecycle Listeners
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

// Live timer update for summary sync time
setInterval(() => {
  const syncTimeEl = document.getElementById("summary-watch-sync-time");
  if (syncTimeEl && appState?.appleWatch?.lastGlobalSync) {
    syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch.lastGlobalSync);
  }
}, 5000);
