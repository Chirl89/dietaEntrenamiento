/**
 * FitDuo & Collie Coach - Main Application Orchestrator (v0.14.0)
 * Clean modular entry point. Coordinates state, routing, Apple Watch telemetry, cloud sync, and views.
 */

// 1. Core State & Utilities
import {
  appState,
  saveState,
  loadSavedState,
  getMasterProfileId,
  getTodayDayName,
  getLocalIsoDate,
  triggerHapticTouch,
  showIosToast,
  addDebugLog,
  renderDebugLogsView,
  copyDebugLogs,
  clearDebugLogs,
  closeDebugLogsModal
} from './js/state.js?v=0.14.0';

import {
  parseSmartMetricValue,
  parseSmartMetricFloatValue,
  formatSmartSleepValue,
  formatSyncRelativeTime,
  toUrlSafeB64,
  fromUrlSafeB64
} from './js/utils.js?v=0.14.0';

// 2. Navigation & Routing
import {
  NAVIGATION_CATEGORIES,
  switchCategory,
  renderSubtabSegmentedControl,
  applyProfileTheme,
  updateProfileSwitcherButtonsUI,
  renderAll,
  switchProfile,
  showTab,
  setDeviceDefaultProfile,
  checkDeviceIdentityBanner,
  getProfileShortName,
  updateUIProfileNames
} from './js/navigation.js?v=0.14.0';

// 3. Apple Watch & iOS Shortcuts
import {
  startAppleWatchAutoSync,
  performAutoSyncTick,
  updateHeaderWatchBadge,
  setAppleWatchSyncMode,
  openAppleWatchModal,
  closeAppleWatchModal,
  closeAppleWatchModalOnBackdrop,
  toggleAutoSync,
  triggerManualSync,
  syncWeeklyWatchHistory,
  checkUrlParamsForWatchSync,
  checkClipboardForWatchSync,
  checkAutoLaunchShortcutOnOpen,
  launchIosShortcutSync,
  getShortcutUrl,
  getShortcutCloudUrl,
  updateShortcutUrlInputs,
  copyShortcutUrlToClipboard,
  copyShortcutCloudUrlToClipboard,
  syncHealthShortcutAndCloud,
  openHealthSyncModal,
  closeHealthSyncModal,
  applyReplicaToPrimary,
  openManualMetricsModal,
  closeManualMetricsModal,
  saveManualMetricsFromModal,
  switchShortcutMethodTab,
  switchShortcutTab,
  testSimulatedHealthSync,
  testSimulatedWorkoutSync,
  testSimulatedBackgroundCloudSync,
  resetMetricsToZeroUsingUrlShortcut,
  updateAppleWatchModalUI,
  handleHealthFileImport,
  toggleShortcutGuide
} from './js/appleWatch.js?v=0.14.0';

// 4. Multi-Device Cloud Sync
import {
  getCloudSyncKey,
  addSyncConsoleLog,
  clearWorkoutDiagnosticLogs,
  copyWorkoutDiagnosticLogs,
  testSimulatedWorkoutPendingFlag,
  testSimulatedWorkoutEndFlag,
  resolvePendingWorkoutManually,
  cancelPendingWorkoutManually,
  cleanAndParseJsonFromCloud,
  cleanAndParseAllMessagesFromCloud,
  tryResolveCompletedWorkout,
  mergeCloudDataIntoAppState,
  copyDiagnosticLogs,
  getDayNameFromTimestamp,
  pushToCloud,
  pullFromCloud,
  purgeCloudHistory,
  syncNowWithCloud,
  saveCustomCloudKeyFromInput,
  resetDefaultCloudKey,
  exportSyncToken,
  promptImportSyncToken,
  exportBackupJson,
  triggerImportBackupJson,
  handleBackupFileSelect,
  updateCloudSyncUI,
  forceAppRefresh
} from './js/cloudSync.js?v=0.14.0';

// 5. Views & Tab Modules
import {
  renderSummaryView,
  renderProfileView
} from './js/views/summaryView.js?v=0.14.0';

import {
  renderExclusions,
  addExclusion,
  removeExclusion,
  getFilteredRecipes,
  openTodayNutrition,
  selectDay,
  selectDayFromDropdown,
  renderNutritionMenuView,
  setRecipesRange,
  renderNutritionRecipesView,
  setShoppingRange,
  renderShoppingView,
  toggleShoppingItem,
  copyShoppingList
} from './js/views/nutritionView.js?v=0.14.0';

import {
  isDayCompleted,
  getDayWatchData,
  getDaySessions,
  deleteWorkoutSession,
  toggleWorkoutDay,
  resetWorkoutWeek,
  syncAppleWatchData,
  openTodayWorkouts,
  selectWorkoutDay,
  selectWorkoutDayFromDropdown,
  selectExerciseDayFromDropdown,
  openManualWorkoutModal,
  closeManualWorkoutModal,
  saveManualWorkoutSession,
  updateWorkoutPendingStatusBadge,
  renderWorkoutsView,
  renderExerciseTableView,
  renderWorkoutTracker,
  recordWatchWorkoutForDay,
  openEditWorkoutWatchModal,
  closeEditWorkoutWatchModal,
  saveWorkoutWatchDataFromModal,
  connectBluetoothHR,
  simulateBluetoothPairing
} from './js/views/workoutsView.js?v=0.14.0';

import {
  selectBooDayFromDropdown,
  toggleBooTask,
  setBooMood,
  saveBooSessionNotes,
  markBooModulePracticed,
  toggleContinuousItem,
  markTrickMastered,
  selectActiveTrickFromBacklog,
  toggleBooAccordion,
  openBooBacklogModal,
  closeBooBacklogModal,
  closeBooBacklogModalOnBackdrop,
  renderBooBacklogModalUI,
  renderBooWorkoutView
} from './js/views/booView.js?v=0.14.0';

import {
  currentProgressMainTab,
  currentTimePeriod,
  setProgressMainTab,
  setTimePeriod,
  setProgressPeriod,
  getHistoricalData,
  calculateProfileStats,
  calculateBadges,
  getChartAggregatedData,
  renderProgressView,
  renderProgressContent,
  changeHeatmapMonth,
  setHeatmapMonth,
  setHeatmapYear,
  resetHeatmapToCurrentMonth
} from './js/views/progressView.js?v=0.14.0';

import {
  populateSettingsInputs,
  saveCustomSettings,
  renderSettingsView
} from './js/views/settingsView.js?v=0.14.0';

import {
  handleChatKeyPress,
  sendChatMessage,
  generateBotReply
} from './js/views/chatView.js?v=0.14.0';

// 6. Expose all functions to global window for HTML event handlers
const globalBindings = {
  appState,
  saveState,
  loadSavedState,
  triggerHapticTouch,
  showIosToast,
  addDebugLog,
  renderDebugLogsView,
  copyDebugLogs,
  clearDebugLogs,
  closeDebugLogsModal,
  
  NAVIGATION_CATEGORIES,
  switchCategory,
  renderSubtabSegmentedControl,
  applyProfileTheme,
  updateProfileSwitcherButtonsUI,
  renderAll,
  switchProfile,
  showTab,
  setDeviceDefaultProfile,
  checkDeviceIdentityBanner,
  getProfileShortName,
  updateUIProfileNames,

  startAppleWatchAutoSync,
  performAutoSyncTick,
  updateHeaderWatchBadge,
  setAppleWatchSyncMode,
  openAppleWatchModal,
  closeAppleWatchModal,
  closeAppleWatchModalOnBackdrop,
  toggleAutoSync,
  triggerManualSync,
  syncWeeklyWatchHistory,
  checkUrlParamsForWatchSync,
  checkClipboardForWatchSync,
  checkAutoLaunchShortcutOnOpen,
  launchIosShortcutSync,
  getShortcutUrl,
  getShortcutCloudUrl,
  updateShortcutUrlInputs,
  copyShortcutUrlToClipboard,
  copyShortcutCloudUrlToClipboard,
  syncHealthShortcutAndCloud,
  openHealthSyncModal,
  closeHealthSyncModal,
  applyReplicaToPrimary,
  openManualMetricsModal,
  closeManualMetricsModal,
  saveManualMetricsFromModal,
  switchShortcutMethodTab,
  switchShortcutTab,
  testSimulatedHealthSync,
  testSimulatedWorkoutSync,
  testSimulatedBackgroundCloudSync,
  resetMetricsToZeroUsingUrlShortcut,
  updateAppleWatchModalUI,
  handleHealthFileImport,
  toggleShortcutGuide,

  getCloudSyncKey,
  addSyncConsoleLog,
  clearWorkoutDiagnosticLogs,
  copyWorkoutDiagnosticLogs,
  testSimulatedWorkoutPendingFlag,
  testSimulatedWorkoutEndFlag,
  resolvePendingWorkoutManually,
  cancelPendingWorkoutManually,
  cleanAndParseJsonFromCloud,
  cleanAndParseAllMessagesFromCloud,
  tryResolveCompletedWorkout,
  mergeCloudDataIntoAppState,
  copyDiagnosticLogs,
  getDayNameFromTimestamp,
  pushToCloud,
  pullFromCloud,
  purgeCloudHistory,
  syncNowWithCloud,
  saveCustomCloudKeyFromInput,
  resetDefaultCloudKey,
  exportSyncToken,
  promptImportSyncToken,
  exportBackupJson,
  triggerImportBackupJson,
  handleBackupFileSelect,
  updateCloudSyncUI,
  forceAppRefresh,

  renderSummaryView,
  renderProfileView,

  renderExclusions,
  addExclusion,
  removeExclusion,
  getFilteredRecipes,
  openTodayNutrition,
  selectDay,
  selectDayFromDropdown,
  renderNutritionMenuView,
  setRecipesRange,
  renderNutritionRecipesView,
  setShoppingRange,
  renderShoppingView,
  toggleShoppingItem,
  copyShoppingList,

  isDayCompleted,
  getDayWatchData,
  getDaySessions,
  deleteWorkoutSession,
  toggleWorkoutDay,
  resetWorkoutWeek,
  syncAppleWatchData,
  openTodayWorkouts,
  selectWorkoutDay,
  selectWorkoutDayFromDropdown,
  selectExerciseDayFromDropdown,
  openManualWorkoutModal,
  closeManualWorkoutModal,
  saveManualWorkoutSession,
  updateWorkoutPendingStatusBadge,
  renderWorkoutsView,
  renderExerciseTableView,
  renderWorkoutTracker,
  recordWatchWorkoutForDay,
  openEditWorkoutWatchModal,
  closeEditWorkoutWatchModal,
  saveWorkoutWatchDataFromModal,
  connectBluetoothHR,
  simulateBluetoothPairing,

  selectBooDayFromDropdown,
  toggleBooTask,
  setBooMood,
  saveBooSessionNotes,
  markBooModulePracticed,
  toggleContinuousItem,
  markTrickMastered,
  selectActiveTrickFromBacklog,
  toggleBooAccordion,
  openBooBacklogModal,
  closeBooBacklogModal,
  closeBooBacklogModalOnBackdrop,
  renderBooBacklogModalUI,
  renderBooWorkoutView,

  setProgressMainTab,
  setTimePeriod,
  setProgressPeriod,
  getHistoricalData,
  calculateProfileStats,
  calculateBadges,
  getChartAggregatedData,
  renderProgressView,
  renderProgressContent,
  changeHeatmapMonth,
  setHeatmapMonth,
  setHeatmapYear,
  resetHeatmapToCurrentMonth,

  populateSettingsInputs,
  saveCustomSettings,
  renderSettingsView,

  handleChatKeyPress,
  sendChatMessage,
  generateBotReply
};

Object.assign(window, globalBindings);

// 7. App Initialization & Lifecycle
export function initApp() {
  try {
    loadSavedState();
    checkDeviceIdentityBanner();
    checkUrlParamsForWatchSync();
    startAppleWatchAutoSync();
    checkAutoLaunchShortcutOnOpen();
    renderAll();
    
    // Background cloud sync on start
    setTimeout(() => {
      pullFromCloud(false);
    }, 800);

    // Periodic sync: every 45s for cloud poll, every 5s for timestamp relative times
    setInterval(() => {
      const syncTimeEl = document.getElementById("summary-watch-sync-time");
      if (syncTimeEl) syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch?.lastGlobalSync);
    }, 5000);

    setInterval(() => {
      pullFromCloud(false);
    }, 45000);

    // Lifecycle events (iOS Safari background resume)
    window.addEventListener("pageshow", () => {
      pullFromCloud(false);
      checkUrlParamsForWatchSync();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        pullFromCloud(false);
        checkUrlParamsForWatchSync();
      }
    });

    console.log("🚀 FitDuo & Collie Coach initialized successfully (v0.14.0)");
  } catch(e) {
    console.error("Critical error during FitDuo initialization:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
