/**
 * FitDuo & Collie Coach - Settings View Module (v0.14.0)
 * Isolated Tab: Configuración de Dispositivo, Clave de Nube, Objetivos Personalizados & Nombres.
 */

import {
  appState,
  saveState,
  DEVICE_DEFAULT_PROFILE_KEY,
  getMasterProfileId,
  triggerHapticTouch,
  showIosToast
} from '../state.js';
import { getProfileShortName, updateUIProfileNames } from '../navigation.js';
import { getCloudSyncKey, updateCloudSyncUI, pushToCloud } from '../cloudSync.js';

export function populateSettingsInputs() {
  try {
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
  } catch(e) {
    console.error("Error populating settings inputs:", e);
  }
}

export function saveCustomSettings() {
  try {
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
    if (window.renderAll) window.renderAll();
    
    showIosToast("⚙️ ¡Ajustes guardados correctamente!", "fa-solid fa-check");
    pushToCloud(false);
  } catch(e) {
    console.error("Error saving custom settings:", e);
  }
}

export function renderSettingsView() {
  try {
    const currentPref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY) || 'last';
    const masterPid = getMasterProfileId();

    const btnHe = document.getElementById("pref-btn-he");
    const btnShe = document.getElementById("pref-btn-she");
    
    if (btnHe) btnHe.classList.toggle("active", currentPref === 'he');
    if (btnShe) btnShe.classList.toggle("active", currentPref === 'she');

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
  } catch(e) {
    console.error("Error rendering Settings View:", e);
  }
}
