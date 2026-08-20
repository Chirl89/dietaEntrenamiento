import { appState, getTodayDayName } from '../state.js';
import { formatSmartSleepValue, formatSyncRelativeTime } from '../utils.js';
import { updateShortcutUrlInputs } from '../appleWatch.js';
import { isDayCompleted, getDayWatchData, toggleWorkoutDay, renderWorkoutTracker } from './workoutsView.js';

export function renderSummaryView() {
  const pid = appState.activeProfileId;
  const p = appState.profiles[pid];
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

export function renderProfileView() {
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
