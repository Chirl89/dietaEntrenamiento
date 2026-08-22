/**
 * FitDuo & Collie Coach - Summary & Profile View Module (v0.14.0)
 * Isolated Tab: Resumen de Anillos, Métricas en Vivo & Metas de Salud.
 */

import { appState, getTodayDayName } from '../state.js';
import { formatSmartSleepValue, formatSyncRelativeTime } from '../utils.js';
import { updateShortcutUrlInputs } from '../appleWatch.js';
import { renderWorkoutTracker } from './workoutsView.js';

export function renderSummaryView() {
  try {
    const pid = appState.activeProfileId || 'he';
    const p = appState.profiles?.[pid];
    const m = appState.appleWatch?.metrics?.[pid];
    if (!p || !m) return;

    const syncTimeEl = document.getElementById("summary-watch-sync-time");
    if (syncTimeEl) syncTimeEl.innerText = formatSyncRelativeTime(appState.appleWatch?.lastGlobalSync);

    // Live Metrics
    const hrEl = document.getElementById("summary-metric-hr");
    if (hrEl) hrEl.innerHTML = `${m.hr} <small>BPM</small>`;

    const floorsEl = document.getElementById("summary-metric-floors");
    if (floorsEl) floorsEl.innerHTML = `${m.floors ?? 0} <small>pisos</small>`;

    const sleepEl = document.getElementById("summary-metric-sleep");
    if (sleepEl) sleepEl.innerHTML = `${formatSmartSleepValue(m.sleep)}`;

    const distEl = document.getElementById("summary-metric-dist");
    if (distEl) distEl.innerHTML = `${m.distanceKm} <small>km</small>`;

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
  } catch(e) {
    console.error("Error rendering Summary View:", e);
  }
}

export function renderProfileView() {
  try {
    const pid = appState.activeProfileId || 'he';
    const p = appState.profiles?.[pid];
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
  } catch(e) {
    console.error("Error rendering Profile View:", e);
  }
}
