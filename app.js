/**
 * FitDuo & Collie Coach - Main Application Orchestrator (v0.19.3)
 * Clean modular entry point. Coordinates state, routing, Apple Watch telemetry, cloud sync, and views.
 */

// 1. Core State & Utilities
import {
  APP_VERSION,
  applyAppVersionToDOM
} from './js/version.js';

import {
  appState,
  saveState,
  loadSavedState,
  getMasterProfileId,
  getTodayDayName,
  getLocalIsoDate,
  getDayNameFromDate,
  getDateForDayNameInCurrentWeek,
  checkDayRollover,
  recordDailySnapshot,
  purgeHistoricalDataExceptToday,
  getProfileShortName,
  triggerHapticTouch,
  showIosToast,
  addDebugLog,
  renderDebugLogsView,
  copyDebugLogs,
  clearDebugLogs,
  closeDebugLogsModal
} from './js/state.js';

import {
  parseSmartMetricValue,
  parseSmartMetricFloatValue,
  formatSmartSleepValue,
  formatSyncRelativeTime,
  toUrlSafeB64,
  fromUrlSafeB64
} from './js/utils.js';

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
  updateUIProfileNames
} from './js/navigation.js';

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
} from './js/appleWatch.js';

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
} from './js/cloudSync.js';

// 5. Views & Tab Modules
import {
  renderSummaryView,
  renderProfileView
} from './js/views/summaryView.js';

import {
  renderExclusions,
  addExclusion,
  removeExclusion,
  getAllRecipes,
  getFilteredRecipes,
  getRecipeById,
  openTodayNutrition,
  selectDay,
  selectDayFromDropdown,
  toggleNutritionViewMode,
  autoFillWeeklyPlan,
  clearWeeklyPlan,
  removeMealFromSlot,
  generateShoppingListFromPlan,
  copyWeeklyMenuToClipboard,
  getWeeklyScheduledCount,
  openRecipePickerModal,
  closeRecipePickerModal,
  closeRecipePickerModalOnBackdrop,
  selectRecipeForActiveSlot,
  onPickerSearchInput,
  setPickerCategoryFilter,
  navigateToRecipe,
  renderNutritionMenuView,
  setRecipesRange,
  renderNutritionRecipesView,
  onBacklogCatalogSearch,
  setBacklogCatalogCategory,
  openAssignRecipeModal,
  saveQuickAssignRecipe,
  openRecipeDetailModal,
  openCreateRecipeModal,
  saveCustomRecipeFromModal,
  deleteCustomRecipe,
  setShoppingRange,
  renderShoppingView,
  toggleShoppingItem,
  clearCheckedShoppingItems,
  openAddExtraShoppingModal,
  removeShoppingExtra,
  copyShoppingList
} from './js/views/nutritionView.js';

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
  formatExerciseReps,
  connectBluetoothHR,
  simulateBluetoothPairing
} from './js/views/workoutsView.js';

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
} from './js/views/booView.js';

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
} from './js/views/progressView.js';

import {
  populateSettingsInputs,
  saveCustomSettings,
  renderSettingsView
} from './js/views/settingsView.js';

import {
  handleChatKeyPress,
  sendChatMessage,
  generateBotReply
} from './js/views/chatView.js';

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
  getAllRecipes,
  getFilteredRecipes,
  getRecipeById,
  openTodayNutrition,
  selectDay,
  selectDayFromDropdown,
  toggleNutritionViewMode,
  autoFillWeeklyPlan,
  clearWeeklyPlan,
  removeMealFromSlot,
  generateShoppingListFromPlan,
  copyWeeklyMenuToClipboard,
  getWeeklyScheduledCount,
  openRecipePickerModal,
  closeRecipePickerModal,
  closeRecipePickerModalOnBackdrop,
  selectRecipeForActiveSlot,
  onPickerSearchInput,
  setPickerCategoryFilter,
  navigateToRecipe,
  renderNutritionMenuView,
  setRecipesRange,
  renderNutritionRecipesView,
  onBacklogCatalogSearch,
  setBacklogCatalogCategory,
  openAssignRecipeModal,
  saveQuickAssignRecipe,
  openRecipeDetailModal,
  openCreateRecipeModal,
  saveCustomRecipeFromModal,
  deleteCustomRecipe,
  setShoppingRange,
  renderShoppingView,
  toggleShoppingItem,
  clearCheckedShoppingItems,
  openAddExtraShoppingModal,
  removeShoppingExtra,
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
  formatExerciseReps,
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

  getDayNameFromDate,
  getDateForDayNameInCurrentWeek,
  checkDayRollover,
  recordDailySnapshot,
  purgeHistoricalDataExceptToday,

  populateSettingsInputs,
  saveCustomSettings,
  renderSettingsView,

  handleChatKeyPress,
  sendChatMessage,
  generateBotReply,
  APP_VERSION,
  applyAppVersionToDOM
};

// Immediate global binding
Object.assign(window, globalBindings);

// 7. App Initialization & Lifecycle
export function initApp() {
  try {
    applyAppVersionToDOM();
    loadSavedState();
    checkDayRollover();
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
      const rolled = checkDayRollover();
      if (rolled && window.renderAll) window.renderAll();
      const syncTimeEl = document.getElementById("summary-watch-sync-time");
      if (syncTimeEl) syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch?.lastGlobalSync);
    }, 5000);

    setInterval(() => {
      pullFromCloud(false);
    }, 45000);

    // Lifecycle events (iOS Safari background resume)
    window.addEventListener("pageshow", () => {
      checkDayRollover();
      pullFromCloud(false);
      checkUrlParamsForWatchSync();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkDayRollover();
        pullFromCloud(false);
        checkUrlParamsForWatchSync();
      }
    });

    console.log("🚀 FitDuo & Collie Coach initialized successfully (v0.19.3)");
  } catch(e) {
    console.error("Critical error during FitDuo initialization:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
