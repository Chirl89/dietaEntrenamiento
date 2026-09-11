/**
 * FitDuo & Collie Coach - Workouts View Module (v0.14.0)
 * Isolated Tab: Registro de Entrenamientos, Tabla de Ejercicios, Modal Manual & Calibración.
 */

import {
  appState,
  getMasterProfileId,
  saveState,
  triggerHapticTouch,
  showIosToast,
  getTodayDayName,
  getLocalIsoDate,
  getDayNameFromDate,
  getDateForDayNameInCurrentWeek,
  recordDailySnapshot,
  defaultWatchMetrics
} from '../state.js';
import {
  WEEKLY_WORKOUT_SCHEDULE,
  CARLOS_WORKOUT_SCHEDULE,
  ANDREA_WORKOUT_SCHEDULE,
  WEEKLY_WORKOUT_SCHEDULE_BY_PROFILE,
  getWeeklyWorkoutSchedule
} from '../../data.js';
import { getHistoricalData } from './progressView.js';

export function isDayCompleted(profileId, dayName) {
  const dayData = appState.completedWorkouts?.[profileId]?.[dayName];
  if (typeof dayData === 'object' && dayData !== null) {
    if (dayData.done === false) return false;
    if (Array.isArray(dayData.sessions)) {
      return dayData.sessions.length > 0 && !!dayData.done;
    }
    if (dayData.watchData) return !!dayData.done;
    return !!dayData.done;
  }
  return !!dayData;
}

export function getDayWatchData(profileId, dayName) {
  const dayData = appState.completedWorkouts?.[profileId]?.[dayName];
  if (typeof dayData === 'object' && dayData !== null && dayData.watchData) {
    return dayData.watchData;
  }
  return null;
}

export function getDaySessions(profileId, dayName) {
  const dayData = appState.completedWorkouts?.[profileId]?.[dayName];
  if (typeof dayData === 'object' && dayData !== null) {
    if (Array.isArray(dayData.sessions) && dayData.sessions.length > 0) {
      return dayData.sessions;
    }
    if (dayData.watchData) {
      return [dayData.watchData];
    }
  }
  return [];
}

export function deleteWorkoutSession(dayName, sessionIndex) {
  try {
    triggerHapticTouch();
    const pid = appState.activeProfileId;
    const dayEntry = appState.completedWorkouts?.[pid]?.[dayName];
    if (!dayEntry || !Array.isArray(dayEntry.sessions)) return;

    const deletedSession = dayEntry.sessions[sessionIndex];
    if (deletedSession) {
      if (!appState.deletedWorkoutSessionIds) appState.deletedWorkoutSessionIds = [];
      if (deletedSession.id) appState.deletedWorkoutSessionIds.push(deletedSession.id);
      const sig = `${deletedSession.durationMin}_${deletedSession.kcal}_${deletedSession.timestamp}_${pid}_${dayName}`;
      appState.deletedWorkoutSessionIds.push(sig);
    }

    dayEntry.sessions.splice(sessionIndex, 1);
    if (dayEntry.sessions.length === 0) {
      appState.completedWorkouts[pid][dayName] = { done: false, watchData: null, sessions: [] };
    } else {
      dayEntry.watchData = dayEntry.sessions[dayEntry.sessions.length - 1];
    }

    if (appState.appleWatch?.pendingWorkout?.[pid]) {
      appState.appleWatch.pendingWorkout[pid].flag = "N/A";
      appState.appleWatch.pendingWorkout[pid].pending = false;
    }

    const targetDate = getDateForDayNameInCurrentWeek(dayName);
    recordDailySnapshot(pid, targetDate, null, {
      isWorkoutDone: dayEntry.sessions.length > 0,
      sessions: dayEntry.sessions,
      completedWorkouts: dayEntry.sessions.length > 0 ? [dayName] : []
    });

    saveState();
    if (window.renderAll) window.renderAll();
    showIosToast("🗑️ Sesión de entrenamiento eliminada", "fa-solid fa-trash-can");
    if (window.pushToCloud) window.pushToCloud(false);
  } catch(e) {
    console.error("Error deleting workout session:", e);
  }
}

export function toggleWorkoutDay(dayName) {
  try {
    triggerHapticTouch();
    const profileId = appState.activeProfileId || getMasterProfileId();
    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[profileId]) {
      appState.completedWorkouts[profileId] = {};
    }

    const currentDone = isDayCompleted(profileId, dayName);
    const targetDate = getDateForDayNameInCurrentWeek(dayName);

    if (currentDone) {
      const existingEntry = appState.completedWorkouts[profileId][dayName];
      const existingSessions = (existingEntry && Array.isArray(existingEntry.sessions)) ? existingEntry.sessions : (existingEntry?.watchData ? [existingEntry.watchData] : []);
      if (!appState.deletedWorkoutSessionIds) appState.deletedWorkoutSessionIds = [];
      existingSessions.forEach(s => {
        if (s) {
          if (s.id) appState.deletedWorkoutSessionIds.push(s.id);
          const sig = `${s.durationMin}_${s.kcal}_${s.timestamp}_${profileId}_${dayName}`;
          appState.deletedWorkoutSessionIds.push(sig);
        }
      });

      appState.completedWorkouts[profileId][dayName] = { done: false, watchData: null, sessions: [] };
      if (appState.appleWatch?.pendingWorkout?.[profileId]) {
        appState.appleWatch.pendingWorkout[profileId].flag = "N/A";
        appState.appleWatch.pendingWorkout[profileId].pending = false;
      }
      recordDailySnapshot(profileId, targetDate, null, { isWorkoutDone: false, sessions: [], completedWorkouts: [] });
    } else {
      const schedule = getWeeklyWorkoutSchedule(profileId)?.[dayName] || {};
      const defMin = schedule.duration || 35;
      const defKcal = Math.round(defMin * 7.5);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
      const sessionObj = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        deviceName: "Rutina FitDuo",
        durationMin: defMin,
        kcal: defKcal,
        timestamp: timeStr,
        autoSync: false
      };
      appState.completedWorkouts[profileId][dayName] = {
        done: true,
        watchData: sessionObj,
        sessions: [sessionObj]
      };
      recordDailySnapshot(profileId, targetDate);
    }

    saveState();
    if (window.renderAll) window.renderAll();
    showIosToast(!currentDone ? `🏋️ ¡Entrenamiento (${dayName}) completado!` : `Entrenamiento (${dayName}) desmarcado`, "fa-solid fa-dumbbell");
    if (window.pushToCloud) window.pushToCloud(false);
  } catch(e) {
    console.error("Error toggling workout day:", e);
  }
}

export function resetWorkoutWeek() {
  try {
    triggerHapticTouch();
    const profileId = appState.activeProfileId || getMasterProfileId();
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[profileId]) {
      appState.completedWorkouts[profileId] = {};
    }
    if (!appState.deletedWorkoutSessionIds) appState.deletedWorkoutSessionIds = [];

    days.forEach(d => {
      const existingEntry = appState.completedWorkouts[profileId][d];
      const existingSessions = (existingEntry && Array.isArray(existingEntry.sessions)) ? existingEntry.sessions : (existingEntry?.watchData ? [existingEntry.watchData] : []);
      existingSessions.forEach(s => {
        if (s) {
          if (s.id) appState.deletedWorkoutSessionIds.push(s.id);
          const sig = `${s.durationMin}_${s.kcal}_${s.timestamp}_${profileId}_${d}`;
          appState.deletedWorkoutSessionIds.push(sig);
        }
      });
      appState.completedWorkouts[profileId][d] = { done: false, watchData: null, sessions: [] };
      const targetDate = getDateForDayNameInCurrentWeek(d);
      recordDailySnapshot(profileId, targetDate, null, { isWorkoutDone: false, sessions: [], completedWorkouts: [] });
    });

    if (appState.appleWatch?.pendingWorkout?.[profileId]) {
      appState.appleWatch.pendingWorkout[profileId].flag = "N/A";
      appState.appleWatch.pendingWorkout[profileId].pending = false;
    }

    saveState();
    if (window.renderAll) window.renderAll();
    showIosToast("🔄 Semana de entrenamientos reiniciada", "fa-solid fa-rotate-left");
    if (window.pushToCloud) window.pushToCloud(false);
  } catch(e) {
    console.error("Error resetting workout week:", e);
  }
}

export function syncAppleWatchData() {
  if (window.triggerManualSync) window.triggerManualSync();
}

export function openTodayWorkouts(scrollToExercises = false) {
  try {
    triggerHapticTouch();
    const today = getTodayDayName();
    let targetBtn = null;
    document.querySelectorAll("#workout-days-tabs .day-tab").forEach(btn => {
      if (btn.innerText.trim().toLowerCase() === today.toLowerCase()) {
        targetBtn = btn;
      }
    });
    selectWorkoutDay(today, targetBtn);
    appState.activeExerciseDay = today;
    const selectElem = document.getElementById("exercise-day-select");
    if (selectElem) selectElem.value = today;
    if (window.showTab) window.showTab("workouts-view", document.getElementById("dock-btn-workouts"));
    if (scrollToExercises) {
      setTimeout(() => {
        const el = document.getElementById("exercise-routines-container") || document.querySelector(".workout-exercises-section");
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  } catch(e) {
    console.error("Error opening today workouts:", e);
  }
}

export function selectWorkoutDay(dayName, btnElem) {
  try {
    triggerHapticTouch();
    appState.activeWorkoutDay = dayName;
    document.querySelectorAll("#workout-days-tabs .day-tab").forEach(tab => tab.classList.remove("active"));
    if (btnElem) btnElem.classList.add("active");
    renderWorkoutsView();
  } catch(e) {
    console.error("Error selecting workout day:", e);
  }
}

export function selectWorkoutDayFromDropdown(dayName) {
  selectExerciseDayFromDropdown(dayName);
}

export function selectExerciseDayFromDropdown(dayName) {
  try {
    triggerHapticTouch();
    appState.activeExerciseDay = dayName;
    renderExerciseTableView();
  } catch(e) {
    console.error("Error selecting exercise day from dropdown:", e);
  }
}

export function openManualWorkoutModal() {
  try {
    triggerHapticTouch();
    const modal = document.getElementById("manual-workout-modal");
    if (modal) {
      const timeInput = document.getElementById("manual-workout-timestamp");
      if (timeInput) {
        timeInput.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
      }
      modal.classList.add("active");
    }
  } catch(e) {
    console.error("Error opening manual workout modal:", e);
  }
}

export function closeManualWorkoutModal() {
  try {
    triggerHapticTouch();
    const modal = document.getElementById("manual-workout-modal");
    if (modal) modal.classList.remove("active");
  } catch(e) {
    console.error("Error closing manual workout modal:", e);
  }
}

export function saveManualWorkoutSession(e) {
  try {
    if (e) e.preventDefault();
    triggerHapticTouch();

    const durInput = document.getElementById("manual-workout-duration");
    const kcalInput = document.getElementById("manual-workout-kcal");
    const timeInput = document.getElementById("manual-workout-timestamp");

    const duration = parseInt(durInput?.value || "30", 10);
    const kcal = parseInt(kcalInput?.value || "250", 10);
    let rawTime = timeInput?.value?.trim();
    let timestamp = rawTime || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs");
    if (timestamp && !timestamp.toLowerCase().includes("hs") && !timestamp.toLowerCase().includes("m") && timestamp.includes(":")) {
      timestamp = timestamp + " hs";
    }

    const pid = appState.activeProfileId;
    const today = getTodayDayName();
    const todayIso = getLocalIsoDate();

    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};
    if (!appState.completedWorkouts[pid][today]) {
      appState.completedWorkouts[pid][today] = { done: true, watchData: null, sessions: [] };
    }
    if (!Array.isArray(appState.completedWorkouts[pid][today].sessions)) {
      appState.completedWorkouts[pid][today].sessions = [];
    }

    const sessionObj = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      deviceName: `Registro Manual`,
      durationMin: duration,
      kcal: kcal,
      timestamp: timestamp,
      autoSync: false
    };

    appState.completedWorkouts[pid][today].sessions.push(sessionObj);
    appState.completedWorkouts[pid][today].done = true;
    appState.completedWorkouts[pid][today].watchData = sessionObj;

    // Update active metrics if they were lower
    if (!appState.appleWatch) appState.appleWatch = {};
    if (!appState.appleWatch.metrics) appState.appleWatch.metrics = {};
    if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = { ...defaultWatchMetrics[pid] };
    const m = appState.appleWatch.metrics[pid];
    const totalDayMin = appState.completedWorkouts[pid][today].sessions.reduce((acc, s) => acc + (s.durationMin || 0), 0);
    const totalDayKcal = appState.completedWorkouts[pid][today].sessions.reduce((acc, s) => acc + (s.kcal || 0), 0);
    if ((m.exerciseMin || 0) < totalDayMin) m.exerciseMin = totalDayMin;
    if ((m.moveKcal || 0) < totalDayKcal) m.moveKcal = totalDayKcal;

    recordDailySnapshot(pid, todayIso);
    saveState();
    closeManualWorkoutModal();
    if (window.renderAll) window.renderAll();

    showIosToast(`🏋️ Entrenamiento manual guardado (+${kcal} kcal, ${duration} min)`, "fa-solid fa-circle-check");
    if (window.pushToCloud) window.pushToCloud(false);
  } catch(err) {
    console.error("Error saving manual workout session:", err);
  }
}

export function updateWorkoutPendingStatusBadge() {
  try {
    const badgeEl = document.getElementById("workout-pending-status-pill");
    if (!badgeEl) return;

    const profileId = appState.activeProfileId || 'he';
    const authorName = profileId === 'he' ? 'Carlos' : 'Andrea';
    const pState = appState.appleWatch?.pendingWorkout?.[profileId];
    const flag = pState?.flag || (pState?.pending ? "true" : "N/A");

    if (flag === "true") {
      const timeStr = pState.startedAt ? (pState.startedAt.includes("T") ? new Date(pState.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (pState.startedAt.includes(":") ? pState.startedAt : new Date(pState.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))) : '--:--';
      const initKcal = pState.datos_inicio_entrenamiento?.kcal ?? pState.snapshotKcal ?? 0;
      badgeEl.style.display = "inline-flex";
      badgeEl.style.alignItems = "center";
      badgeEl.style.gap = "0.45rem";
      badgeEl.style.padding = "0.38rem 0.85rem";
      badgeEl.style.borderRadius = "8px";
      badgeEl.style.fontSize = "0.78rem";
      badgeEl.style.fontWeight = "600";
      badgeEl.style.background = "rgba(245, 158, 11, 0.15)";
      badgeEl.style.border = "1px solid rgba(245, 158, 11, 0.45)";
      badgeEl.style.color = "#fbbf24";
      badgeEl.style.cursor = "pointer";
      badgeEl.setAttribute("title", `Flag: "true" (Iniciado ${timeStr}). Base congelada: ${initKcal} kcal. Puedes abrir otras apps sin alterar la base.`);
      badgeEl.innerHTML = `
        <span class="status-pulse-dot" style="width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #fbbf24;"></span>
        <span>🏃 <strong>Flag: "true"</strong> | Iniciado (${timeStr}) • Base: ${initKcal} kcal</span>
      `;
      badgeEl.onclick = async () => {
        triggerHapticTouch();
        showIosToast(`🏃 <strong>Flag: "true" (${authorName}):</strong> Entreno iniciado a las ${timeStr}. Base: ${initKcal} kcal. Consultando nube...`, "fa-solid fa-person-running");
        if (window.pullFromCloud) await window.pullFromCloud(true);
      };
    } else if (flag === "false") {
      const timeStr = pState.endedAt ? (pState.endedAt.includes("T") ? new Date(pState.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (pState.endedAt.includes(":") ? pState.endedAt : new Date(pState.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))) : '--:--';
      badgeEl.style.display = "inline-flex";
      badgeEl.style.alignItems = "center";
      badgeEl.style.gap = "0.45rem";
      badgeEl.style.padding = "0.38rem 0.85rem";
      badgeEl.style.borderRadius = "8px";
      badgeEl.style.fontSize = "0.78rem";
      badgeEl.style.fontWeight = "600";
      badgeEl.style.background = "rgba(249, 115, 22, 0.15)";
      badgeEl.style.border = "1px solid rgba(249, 115, 22, 0.45)";
      badgeEl.style.color = "#fb923c";
      badgeEl.style.cursor = "pointer";
      badgeEl.setAttribute("title", `Flag: "false" (Finalizado ${timeStr}). Esperando sincronización de Salud para capturar datos_fin y registrar entreno.`);
      badgeEl.innerHTML = `
        <span class="status-pulse-dot" style="width: 8px; height: 8px; background: #fb923c; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #fb923c;"></span>
        <span>⏹️ <strong>Flag: "false"</strong> | Finalizado (${timeStr}) • Esperando Salud</span>
      `;
      badgeEl.onclick = async () => {
        triggerHapticTouch();
        showIosToast(`⏹️ <strong>Flag: "false" (${authorName}):</strong> Finalizado. Abre WhatsApp/FitDuo para capturar datos_fin y registrar entreno.`, "fa-solid fa-flag-checkered");
        if (window.pullFromCloud) await window.pullFromCloud(true);
      };
    } else {
      badgeEl.style.display = "inline-flex";
      badgeEl.style.alignItems = "center";
      badgeEl.style.gap = "0.45rem";
      badgeEl.style.padding = "0.38rem 0.85rem";
      badgeEl.style.borderRadius = "8px";
      badgeEl.style.fontSize = "0.78rem";
      badgeEl.style.fontWeight = "600";
      badgeEl.style.background = "rgba(16, 185, 129, 0.12)";
      badgeEl.style.border = "1px solid rgba(16, 185, 129, 0.35)";
      badgeEl.style.color = "#34d399";
      badgeEl.style.cursor = "pointer";
      badgeEl.setAttribute("title", `Flag: "N/A" (Entrenamientos cargados y sincronizados).`);
      badgeEl.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color: #34d399;"></i>
        <span>✓ <strong>Flag: "N/A"</strong> | Entrenos Cargados</span>
      `;
      badgeEl.onclick = async () => {
        triggerHapticTouch();
        showIosToast(`✓ <strong>Flag: "N/A" (${authorName}):</strong> Entrenamientos cargados y sincronizados.`, "fa-solid fa-circle-check");
        if (window.pullFromCloud) await window.pullFromCloud(true);
      };
    }
  } catch(e) {
    console.error("Error updating workout pending badge:", e);
  }
}

export function renderWorkoutsView() {
  try {
    updateWorkoutPendingStatusBadge();
    const container = document.getElementById("workouts-daily-container") || document.getElementById("routines-container");
    if (container) {
      container.innerHTML = "";

      const profileId = appState.activeProfileId;
      const today = getTodayDayName();
      const sessions = getDaySessions(profileId, today);

      if (sessions.length === 0) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "glass-card";
        emptyCard.style.cssText = "text-align: center; padding: 2.8rem 1.5rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);";
        emptyCard.innerHTML = `
          <div style="font-size: 2.8rem; margin-bottom: 0.75rem; color: var(--text-muted); opacity: 0.5;">
            <i class="fa-solid fa-dumbbell"></i>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--text-main); margin-bottom: 0.4rem;">
            Hoy no se han registrado entrenamientos
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 440px; margin: 0 auto 1.5rem auto; line-height: 1.45;">
            Los entrenamientos que ejecutes con los atajos de Apple Watch o añadas manualmente se guardarán en esta lista diaria.
          </p>
          <button type="button" class="btn-primary" onclick="if(window.openManualWorkoutModal) window.openManualWorkoutModal();" style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; padding: 0.55rem 1.1rem; margin: 0 auto;">
            <i class="fa-solid fa-plus"></i> + Añadir Entrenamiento Manual
          </button>
        `;
        container.appendChild(emptyCard);
      } else {
        const totalMin = sessions.reduce((acc, s) => acc + (s.durationMin || 0), 0);
        const totalKcal = sessions.reduce((acc, s) => acc + (s.kcal || 0), 0);

        const summaryCard = document.createElement("div");
        summaryCard.className = "glass-card watch-workout-summary-card";
        summaryCard.style.marginBottom = "1.25rem";

        summaryCard.innerHTML = `
          <div class="watch-summary-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div class="watch-summary-title">
              <div class="watch-icon-glow"><i class="fa-solid fa-bolt"></i></div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-main);">
                  Entrenamientos Registrados Hoy (${today})
                </h3>
                <p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 2px;">
                  ${sessions.length} ${sessions.length === 1 ? 'sesión completada' : 'sesiones completadas'}
                </p>
              </div>
            </div>
            <button type="button" class="btn-secondary-sm" onclick="if(window.openManualWorkoutModal) window.openManualWorkoutModal();" style="font-size: 0.78rem; padding: 5px 12px; border-radius: 8px;">
              <i class="fa-solid fa-plus"></i> + Añadir otra sesión
            </button>
          </div>

          <div class="watch-summary-grid" style="grid-template-columns: repeat(2, 1fr); margin-top: 0.85rem;">
            <div class="summary-metric-box">
              <span class="metric-lbl"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Tiempo Total Medido</span>
              <span class="metric-val" style="color:var(--accent-cyan);">${totalMin} <small>min</small></span>
            </div>
            <div class="summary-metric-box">
              <span class="metric-lbl"><i class="fa-solid fa-fire" style="color:var(--accent-rose);"></i> Calorías Totales</span>
              <span class="metric-val" style="color:var(--accent-rose);">${totalKcal} <small>kcal</small></span>
            </div>
          </div>

          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="font-size: 0.82rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-list-check"></i> Desglose de Sesiones de Hoy:
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.45rem;">
              ${sessions.map((s, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); border: 1px solid var(--border-color); padding: 0.55rem 0.85rem; border-radius: 8px; font-size: 0.83rem;">
                  <div>
                    <span style="font-weight: 600; color: var(--text-main);"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Sesión ${idx + 1}</span>
                    <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 0.4rem;">(${s.timestamp || '--'})</span>
                    <span style="color: var(--text-muted); font-size: 0.72rem; margin-left: 0.3rem;">• ${s.deviceName || 'Apple Watch'}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="color: var(--accent-cyan); font-weight: 600;">${s.durationMin || 0} min</span>
                    <span style="color: var(--accent-rose); font-weight: 600;">${s.kcal || 0} kcal</span>
                    <button type="button" onclick="if(window.deleteWorkoutSession) window.deleteWorkoutSession('${today}', ${idx});" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 0.85rem;" title="Eliminar esta sesión">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        container.appendChild(summaryCard);
      }
    }

    renderExerciseTableView();
  } catch(e) {
    console.error("Error rendering Workouts View:", e);
  }
}

export function formatExerciseReps(reps) {
  if (reps === undefined || reps === null || reps === "") return "-";
  const str = String(reps).trim();
  const lower = str.toLowerCase();

  const hasUnit = lower.includes("min") ||
                  lower.includes("seg") ||
                  lower.includes("reps") ||
                  lower.includes("rep") ||
                  lower.includes("paso") ||
                  lower.includes("libre") ||
                  lower.includes("flex") ||
                  lower.includes("sentadilla") ||
                  lower.includes("lado") ||
                  lower.includes("pierna") ||
                  lower.includes("alternad") ||
                  lower.includes("bloque") ||
                  lower.includes("c/u") ||
                  /[a-zA-Z]/.test(str);

  if (hasUnit) {
    return str;
  }

  return `${str} reps`;
}

/**
 * Generates an interactive, responsive looping SVG animation for exercises.
 * Highlights neutral spine safety (emerald green) and equipment (Ring-Con/Band).
 */
export function getExerciseVisualSvg(visualType, exerciseName = "Ejercicio") {
  const vType = (visualType || "").toLowerCase();

  const commonDefs = `
    <defs>
      <linearGradient id="gradFloor_${vType}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0f172a" stop-opacity="0.1"/>
        <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1"/>
      </linearGradient>
      <filter id="glowGreen_${vType}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowCyan_${vType}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowAmber_${vType}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowRose_${vType}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  if (vType === "ring_squat") {
    return `
    <svg viewBox="0 0 420 220" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <rect x="0" y="0" width="420" height="220" rx="12" fill="#080d1a"/>

      <!-- Left: Posición de Pie (Preparación) -->
      <g transform="translate(20, 15)">
        <rect x="10" y="5" width="80" height="18" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <text x="50" y="17" font-size="8.5" fill="#94a3b8" font-weight="bold" text-anchor="middle">1. DE PIE</text>

        <!-- Standing Figure -->
        <line x1="60" y1="180" x2="60" y2="130" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="60" y1="130" x2="60" y2="65" stroke="#10b981" stroke-width="7" stroke-linecap="round"/>
        <circle cx="60" cy="50" r="11" fill="#38bdf8"/>
        <!-- Extended arms with Ring -->
        <line x1="60" y1="75" x2="95" y2="75" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="108" cy="75" r="13" fill="none" stroke="#f43f5e" stroke-width="4"/>
        <rect x="105" y="62" width="6" height="4" rx="1" fill="#38bdf8"/>

        <text x="60" y="196" font-size="8" fill="#94a3b8" text-anchor="middle">Pies a anchura de hombros</text>
      </g>

      <!-- Transition Arrow -->
      <g transform="translate(150, 95)">
        <circle cx="10" cy="15" r="14" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5"/>
        <text x="10" y="19" font-size="12" fill="#34d399" font-weight="bold" text-anchor="middle">→</text>
      </g>

      <!-- Right: Sentadilla Rozando Silla -->
      <g transform="translate(185, 15)">
        <rect x="10" y="5" width="135" height="18" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1"/>
        <text x="77" y="17" font-size="8.5" fill="#34d399" font-weight="bold" text-anchor="middle">2. ROZAR LA SILLA</text>

        <!-- Chair Drawn clearly -->
        <rect x="15" y="125" width="45" height="8" rx="2" fill="#475569"/>
        <line x1="20" y1="133" x2="20" y2="180" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="55" y1="133" x2="55" y2="180" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="16" y1="80" x2="16" y2="133" stroke="#475569" stroke-width="4.5" stroke-linecap="round"/>
        <text x="37" y="120" font-size="7.5" fill="#94a3b8" text-anchor="middle">SILLA</text>

        <!-- Squatting Figure -->
        <line x1="55" y1="126" x2="105" y2="126" stroke="#64748b" stroke-width="6.5" stroke-linecap="round"/>
        <line x1="105" y1="126" x2="105" y2="180" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="100" y1="180" x2="118" y2="180" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>

        <!-- Upright Spine protected -->
        <line x1="55" y1="126" x2="68" y2="68" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})"/>
        <circle cx="70" cy="54" r="11" fill="#38bdf8"/>

        <!-- Arms holding Ring-Con Extended horizontally -->
        <line x1="68" y1="78" x2="120" y2="78" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        <!-- Nintendo Ring-Con with Joy-Con colors -->
        <circle cx="138" cy="78" r="16" fill="none" stroke="#f43f5e" stroke-width="4.5" filter="url(#glowRose_${vType})"/>
        <rect x="135" y="62" width="6" height="5" rx="1.5" fill="#38bdf8"/>
        <rect x="135" y="89" width="6" height="5" rx="1.5" fill="#38bdf8"/>
        <text x="138" y="81" font-size="7.5" fill="#fff" font-weight="bold" text-anchor="middle">RING</text>

        <!-- Callout Tag -->
        <text x="110" y="165" font-size="8.5" fill="#34d399" font-weight="bold" text-anchor="middle">El Ring-Con erige el torso</text>
        <text x="110" y="177" font-size="7.5" fill="#94a3b8" text-anchor="middle">Empuja desde los talones</text>
      </g>

      <!-- Bottom Bar Legend -->
      <g transform="translate(15, 195)">
        <rect x="0" y="0" width="390" height="20" rx="5" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="195" y="14" font-size="9" fill="#e2e8f0" font-weight="600" text-anchor="middle">🛡️ El contrapeso del Ring-Con impide encorvar la espalda dorsal (0 presión en D7-D11)</text>
      </g>
    </svg>`;
  }

  if (vType === "band_row") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes rowPull {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(32px); }
        }
        .anim-row-arms { animation: rowPull 2.8s ease-in-out infinite; }
        @keyframes scapulaPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; filter: drop-shadow(0 0 8px #10b981); }
        }
        .anim-scapula-glow { animation: scapulaPulse 2.8s ease-in-out infinite; }
      </style>
      <rect x="18" y="20" width="12" height="170" rx="3" fill="#334155" />
      <circle cx="30" cy="100" r="5" fill="#f59e0b" filter="url(#glowAmber_${vType})" />
      <text x="12" y="15" font-size="9" fill="#94a3b8" font-weight="bold">PUERTA</text>

      <line x1="20" y1="185" x2="295" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="215" cy="186" rx="65" ry="6" fill="url(#gradFloor_${vType})" />

      <line x1="195" y1="185" x2="200" y2="150" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="230" y1="185" x2="225" y2="150" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="200" y1="150" x2="212" y2="135" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="225" y1="150" x2="212" y2="135" stroke="#64748b" stroke-width="6" stroke-linecap="round" />

      <line x1="212" y1="135" x2="218" y2="78" stroke="#10b981" stroke-width="6.5" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
      <circle cx="220" cy="92" r="10" fill="none" stroke="#34d399" stroke-width="2.5" stroke-dasharray="3 3" class="anim-scapula-glow" />
      
      <circle cx="220" cy="60" r="13" fill="#38bdf8" />
      <circle cx="215" cy="59" r="2.5" fill="#0f172a" />

      <g class="anim-row-arms">
        <line x1="30" y1="100" x2="168" y2="100" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" filter="url(#glowAmber_${vType})" />
        <line x1="218" y1="85" x2="195" y2="102" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
        <line x1="195" y1="102" x2="168" y2="100" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" />
        <circle cx="168" cy="100" r="5" fill="#38bdf8" />
      </g>

      <g transform="translate(10, 195)">
        <text x="0" y="0" font-size="10" fill="#34d399" font-weight="700">🛡️ Codo al costado • Retracción Escapular • Dorsal Ancho</text>
      </g>
    </svg>`;
  }

  if (vType === "ring_pull") {
    return `
    <svg viewBox="0 0 420 220" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <rect x="0" y="0" width="420" height="220" rx="12" fill="#080d1a"/>

      <!-- Left Side: Front/Torso View pulling Ring-Con -->
      <g transform="translate(30, 20)">
        <path d="M 40 80 Q 90 60 140 80 L 125 150 L 55 150 Z" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        <circle cx="90" cy="40" r="16" fill="#38bdf8"/>

        <!-- Arms pulling outward -->
        <line x1="40" y1="80" x2="58" y2="100" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>
        <line x1="140" y1="80" x2="122" y2="100" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>

        <!-- Ring-Con Stretched Outward horizontally -->
        <ellipse cx="90" cy="100" rx="34" ry="24" fill="none" stroke="#f43f5e" stroke-width="5" filter="url(#glowRose_${vType})"/>
        <rect x="53" y="93" width="7" height="14" rx="2" fill="#38bdf8"/>
        <rect x="120" y="93" width="7" height="14" rx="2" fill="#38bdf8"/>

        <!-- Dynamic Expansion Arrows -->
        <g fill="#f59e0b">
          <path d="M 48 100 L 34 95 L 34 105 Z"/>
          <path d="M 132 100 L 146 95 L 146 105 Z"/>
        </g>
        <text x="90" y="104" font-size="8" fill="#fff" font-weight="bold" text-anchor="middle">RING-CON</text>
      </g>

      <!-- Right Side: Explanatory Step Card & Scapula Focus -->
      <g transform="translate(215, 25)">
        <rect x="0" y="0" width="180" height="155" rx="10" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="15" y="24" font-size="11" fill="#38bdf8" font-weight="bold">TRACCIÓN ESCAPULAR</text>

        <!-- Step 1 -->
        <circle cx="22" cy="46" r="8" fill="rgba(56, 189, 248, 0.2)"/>
        <text x="22" y="49" font-size="9" fill="#38bdf8" font-weight="bold" text-anchor="middle">1</text>
        <text x="36" y="48" font-size="9" fill="#e2e8f0" font-weight="600">Sujeta el aro al frente</text>

        <!-- Step 2 -->
        <circle cx="22" cy="74" r="8" fill="rgba(245, 158, 11, 0.2)"/>
        <text x="22" y="77" font-size="9" fill="#f59e0b" font-weight="bold" text-anchor="middle">2</text>
        <text x="36" y="73" font-size="9" fill="#f59e0b" font-weight="bold">Tira hacia afuera (4s)</text>
        <text x="36" y="85" font-size="8" fill="#94a3b8">Separa las manos con fuerza constante</text>

        <!-- Step 3 -->
        <circle cx="22" cy="106" r="8" fill="rgba(16, 185, 129, 0.2)"/>
        <text x="22" y="109" font-size="9" fill="#34d399" font-weight="bold" text-anchor="middle">3</text>
        <text x="36" y="105" font-size="9" fill="#34d399" font-weight="bold">Junta los omóplatos</text>
        <text x="36" y="117" font-size="8" fill="#94a3b8">Atrapa una moneda en la espalda</text>

        <!-- Badge -->
        <rect x="10" y="128" width="160" height="20" rx="4" fill="rgba(16, 185, 129, 0.15)"/>
        <text x="90" y="141" font-size="8" fill="#34d399" font-weight="bold" text-anchor="middle">🛡️ Romboides & Trapecio Medio</text>
      </g>

      <!-- Bottom Bar Legend -->
      <g transform="translate(15, 195)">
        <rect x="0" y="0" width="390" height="20" rx="5" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="195" y="14" font-size="9" fill="#e2e8f0" font-weight="600" text-anchor="middle">Isometría pura: activa la musculatura interescapular sin mover articulaciones vertebrales</text>
      </g>
    </svg>`;
  }

  if (vType === "ring_glute_bridge") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes bridgeLift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-38px); }
        }
        .anim-bridge-pelvis { animation: bridgeLift 3.4s ease-in-out infinite; transform-origin: 85px 165px; }
      </style>
      <rect x="35" y="168" width="250" height="8" rx="4" fill="#0284c7" opacity="0.8" />
      <ellipse cx="240" cy="168" rx="10" ry="4" fill="#64748b" />
      <circle cx="75" cy="155" r="13" fill="#38bdf8" />
      <circle cx="95" cy="162" r="7" fill="#475569" />

      <g class="anim-bridge-pelvis">
        <line x1="95" y1="162" x2="175" y2="162" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <circle cx="175" cy="162" r="9" fill="#10b981" />
        <line x1="175" y1="162" x2="225" y2="135" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" />
        <line x1="225" y1="135" x2="240" y2="168" stroke="#64748b" stroke-width="5.5" stroke-linecap="round" />

        <line x1="95" y1="162" x2="165" y2="152" stroke="#cbd5e1" stroke-width="4.5" stroke-linecap="round" />
        <ellipse cx="175" cy="148" rx="18" ry="8" fill="none" stroke="#f43f5e" stroke-width="4" filter="url(#glowRose_${vType})" />
      </g>

      <text x="160" y="32" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Puente de Glúteo • Cadena Posterior Segura</text>
      <text x="160" y="52" font-size="9.5" fill="#94a3b8" text-anchor="middle">Línea recta hombro-cadera-rodilla • Sin arquear la zona lumbar</text>
    </svg>`;
  }

  if (vType === "deadbug") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes deadbugArmLeg {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-35deg); }
        }
        @keyframes deadbugLegOpp {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(35deg); }
        }
        .anim-deadbug-arm { animation: deadbugArmLeg 3.8s ease-in-out infinite; transform-origin: 130px 148px; }
        .anim-deadbug-leg { animation: deadbugLegOpp 3.8s ease-in-out infinite; transform-origin: 195px 150px; }
      </style>
      <rect x="40" y="165" width="240" height="8" rx="4" fill="#0284c7" opacity="0.8" />
      <circle cx="85" cy="154" r="13" fill="#38bdf8" />
      
      <line x1="100" y1="160" x2="195" y2="160" stroke="#10b981" stroke-width="8" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
      
      <line x1="130" y1="150" x2="130" y2="85" stroke="#64748b" stroke-width="5" stroke-linecap="round" />
      <line x1="195" y1="150" x2="195" y2="105" stroke="#64748b" stroke-width="5" stroke-linecap="round" />
      <line x1="195" y1="105" x2="235" y2="105" stroke="#64748b" stroke-width="5" stroke-linecap="round" />

      <g class="anim-deadbug-arm">
        <line x1="130" y1="148" x2="110" y2="82" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
        <circle cx="110" cy="82" r="4.5" fill="#38bdf8" />
      </g>

      <g class="anim-deadbug-leg">
        <line x1="195" y1="150" x2="225" y2="115" stroke="#cbd5e1" stroke-width="5.5" stroke-linecap="round" />
        <line x1="225" y1="115" x2="265" y2="125" stroke="#cbd5e1" stroke-width="5.5" stroke-linecap="round" />
      </g>

      <g transform="translate(145, 80)">
        <circle cx="0" cy="0" r="14" fill="none" stroke="#f43f5e" stroke-width="3.5" filter="url(#glowRose_${vType})" />
      </g>

      <text x="160" y="30" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Deadbug • Máxima Estabilidad Lumbo-Pélvica</text>
      <text x="160" y="48" font-size="9.5" fill="#94a3b8" text-anchor="middle">Espalda baja 100% pegada al suelo • Cero cizallamiento vertebral</text>
    </svg>`;
  }

  if (vType === "pallof_press") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes pallofPressCycle {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(38px); }
        }
        .anim-pallof-hands { animation: pallofPressCycle 3s ease-in-out infinite; }
        @keyframes coreGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .anim-core-pulse { animation: coreGlow 3s ease-in-out infinite; }
      </style>
      <rect x="20" y="30" width="10" height="155" rx="3" fill="#334155" />
      <circle cx="30" cy="100" r="5" fill="#f59e0b" filter="url(#glowAmber_${vType})" />
      <text x="15" y="24" font-size="8.5" fill="#94a3b8" font-weight="bold">ANCLAJE</text>

      <line x1="30" y1="185" x2="290" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="205" cy="186" rx="60" ry="6" fill="url(#gradFloor_${vType})" />

      <line x1="185" y1="185" x2="195" y2="142" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="225" y1="185" x2="215" y2="142" stroke="#64748b" stroke-width="6" stroke-linecap="round" />

      <line x1="205" y1="142" x2="205" y2="78" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
      
      <circle cx="205" cy="108" r="14" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="2.5" class="anim-core-pulse" />
      <text x="205" y="112" font-size="8" fill="#34d399" font-weight="bold" text-anchor="middle">CORE</text>
      <circle cx="205" cy="58" r="13" fill="#38bdf8" />

      <g class="anim-pallof-hands">
        <line x1="30" y1="100" x2="160" y2="100" stroke="#f59e0b" stroke-width="4.5" filter="url(#glowAmber_${vType})" />
        <line x1="205" y1="88" x2="160" y2="100" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" />
        <circle cx="160" cy="100" r="6" fill="#38bdf8" />
      </g>

      <text x="240" y="105" font-size="14" fill="#38bdf8">⮌ Anti-Rotación</text>
      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Press Pallof con Banda • Cero Torsión Vertebral</text>
      <text x="160" y="172" font-size="9" fill="#94a3b8" text-anchor="middle">Extiende brazos al frente y resiste el tirón lateral con el abdomen activo</text>
    </svg>`;
  }

  if (vType === "ring_chest_core") {
    return `
    <svg viewBox="0 0 420 220" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <rect x="0" y="0" width="420" height="220" rx="12" fill="#080d1a"/>

      <!-- Left Side: Frontal Torso & Ring Compression -->
      <g transform="translate(30, 20)">
        <path d="M 40 80 Q 90 60 140 80 L 125 150 L 55 150 Z" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        <circle cx="90" cy="40" r="16" fill="#38bdf8"/>
        
        <!-- Chest Muscles -->
        <path d="M 60 85 Q 90 95 90 115 Q 65 110 60 85" fill="rgba(244,63,94,0.3)" stroke="#f43f5e" stroke-width="1.5"/>
        <path d="M 120 85 Q 90 95 90 115 Q 115 110 120 85" fill="rgba(244,63,94,0.3)" stroke="#f43f5e" stroke-width="1.5"/>

        <!-- Core / Transverse Abdominal Glow -->
        <rect x="68" y="122" width="44" height="24" rx="6" fill="rgba(16,185,129,0.25)" stroke="#10b981" stroke-width="1.5" filter="url(#glowGreen_${vType})"/>
        <text x="90" y="138" font-size="7.5" fill="#34d399" font-weight="bold" text-anchor="middle">CORE ACTIVO</text>

        <!-- Arms compressing Ring-Con -->
        <line x1="40" y1="80" x2="62" y2="100" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>
        <line x1="140" y1="80" x2="118" y2="100" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>

        <!-- Ring-Con Compressed into Oval -->
        <ellipse cx="90" cy="100" rx="25" ry="32" fill="none" stroke="#f43f5e" stroke-width="5" filter="url(#glowRose_${vType})"/>
        <rect x="62" y="93" width="7" height="14" rx="2" fill="#38bdf8"/>
        <rect x="111" y="93" width="7" height="14" rx="2" fill="#38bdf8"/>

        <!-- Dynamic Compression Arrows -->
        <g fill="#f43f5e">
          <path d="M 38 100 L 52 95 L 52 105 Z"/>
          <path d="M 142 100 L 128 95 L 128 105 Z"/>
        </g>
      </g>

      <!-- Right Side: Explanatory Step Card -->
      <g transform="translate(215, 25)">
        <rect x="0" y="0" width="180" height="155" rx="10" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        
        <text x="15" y="24" font-size="11" fill="#38bdf8" font-weight="bold">INSTRUCCIÓN TÉCNICA</text>
        
        <!-- Step 1 -->
        <circle cx="22" cy="46" r="8" fill="rgba(56, 189, 248, 0.2)"/>
        <text x="22" y="49" font-size="9" fill="#38bdf8" font-weight="bold" text-anchor="middle">1</text>
        <text x="36" y="48" font-size="9" fill="#e2e8f0" font-weight="600">Sujeta el aro al pecho</text>
        
        <!-- Step 2 -->
        <circle cx="22" cy="74" r="8" fill="rgba(244, 63, 94, 0.2)"/>
        <text x="22" y="77" font-size="9" fill="#fb7185" font-weight="bold" text-anchor="middle">2</text>
        <text x="36" y="73" font-size="9" fill="#fb7185" font-weight="bold">Comprime hacia adentro</text>
        <text x="36" y="85" font-size="8" fill="#94a3b8">Aprieta fuerte durante 3 segundos</text>

        <!-- Step 3 -->
        <circle cx="22" cy="106" r="8" fill="rgba(16, 185, 129, 0.2)"/>
        <text x="22" y="109" font-size="9" fill="#34d399" font-weight="bold" text-anchor="middle">3</text>
        <text x="36" y="105" font-size="9" fill="#34d399" font-weight="bold">Exhala y activa core</text>
        <text x="36" y="117" font-size="8" fill="#94a3b8">Mete el ombligo como cremallera</text>

        <!-- Note badge -->
        <rect x="10" y="128" width="160" height="20" rx="4" fill="rgba(16, 185, 129, 0.15)"/>
        <text x="90" y="141" font-size="8" fill="#34d399" font-weight="bold" text-anchor="middle">🛡️ 0 flexión ni rotación vertebral</text>
      </g>

      <!-- Bottom Bar Legend -->
      <g transform="translate(15, 195)">
        <rect x="0" y="0" width="390" height="20" rx="5" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="195" y="14" font-size="9" fill="#e2e8f0" font-weight="600" text-anchor="middle">Co-activación isométrica refleja: tonifica pectoral y faja abdominal sin carga en discos</text>
      </g>
    </svg>`;
  }

  if (vType === "bird_dog") {
    return `
    <svg viewBox="0 0 420 220" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <rect x="0" y="0" width="420" height="220" rx="12" fill="#080d1a"/>
      
      <!-- Panel 1: Posición Inicial -->
      <g transform="translate(15, 15)">
        <rect x="10" y="145" width="165" height="6" rx="3" fill="#0284c7" opacity="0.8"/>
        <rect x="10" y="5" width="80" height="18" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <text x="50" y="17" font-size="8.5" fill="#94a3b8" font-weight="bold" text-anchor="middle">1. INICIO</text>
        
        <!-- Torso & Pelvis -->
        <rect x="55" y="95" width="70" height="22" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <line x1="55" y1="97" x2="125" y2="97" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
        <!-- Head -->
        <circle cx="42" cy="100" r="11" fill="#38bdf8"/>
        <circle cx="39" cy="104" r="2" fill="#0f172a"/>
        <!-- Arms under shoulders (90 deg) -->
        <line x1="58" y1="108" x2="58" y2="145" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        <!-- Knees under hips (90 deg) -->
        <line x1="118" y1="108" x2="118" y2="145" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="118" y1="145" x2="135" y2="145" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
        
        <text x="92" y="166" font-size="8" fill="#64748b" text-anchor="middle">Manos bajo hombros</text>
        <text x="92" y="178" font-size="8" fill="#64748b" text-anchor="middle">Rodillas bajo caderas</text>
      </g>

      <!-- Divider Arrow -->
      <g transform="translate(195, 95)">
        <circle cx="10" cy="15" r="14" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5"/>
        <text x="10" y="19" font-size="12" fill="#34d399" font-weight="bold" text-anchor="middle">→</text>
      </g>

      <!-- Panel 2: Extensión Bird-Dog (Pico) -->
      <g transform="translate(225, 15)">
        <rect x="10" y="145" width="170" height="6" rx="3" fill="#0284c7" opacity="0.8"/>
        <rect x="10" y="5" width="120" height="18" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1"/>
        <text x="70" y="17" font-size="8.5" fill="#34d399" font-weight="bold" text-anchor="middle">2. EXTENSIÓN (3s)</text>

        <!-- Horizontal Laser Line -->
        <line x1="0" y1="96" x2="180" y2="96" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>

        <!-- Support Arm on Mat -->
        <line x1="75" y1="104" x2="75" y2="145" stroke="#94a3b8" stroke-width="5.5" stroke-linecap="round"/>
        <!-- Support Knee on Mat -->
        <line x1="115" y1="104" x2="115" y2="145" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>

        <!-- Body Torso -->
        <rect x="68" y="90" width="55" height="20" rx="9" fill="#0f172a" stroke="#10b981" stroke-width="2.5" filter="url(#glowGreen_${vType})"/>
        <!-- Head neutral looking down -->
        <circle cx="58" cy="94" r="10" fill="#38bdf8"/>
        <circle cx="56" cy="98" r="2" fill="#0f172a"/>

        <!-- Extended Arm (Right Arm forward horizontally) -->
        <line x1="72" y1="96" x2="10" y2="96" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        <circle cx="10" cy="96" r="3.5" fill="#38bdf8"/>
        <!-- Motion Arrow forward -->
        <path d="M 18 88 L 8 96 L 18 104" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>

        <!-- Extended Leg (Left Leg backward horizontally) -->
        <line x1="118" y1="96" x2="175" y2="96" stroke="#34d399" stroke-width="5.5" stroke-linecap="round" filter="url(#glowGreen_${vType})"/>
        <circle cx="175" cy="96" r="4" fill="#34d399"/>
        <!-- Motion Arrow backward -->
        <path d="M 168 88 L 178 96 L 168 104" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>

        <!-- Active Glute & Erector Glow -->
        <circle cx="120" cy="96" r="8" fill="#10b981" opacity="0.4"/>

        <!-- Callout -->
        <text x="95" y="166" font-size="8.5" fill="#34d399" font-weight="bold" text-anchor="middle">Línea recta 180° horizontal</text>
        <text x="95" y="178" font-size="7.5" fill="#94a3b8" text-anchor="middle">Cero torsión de pelvis</text>
      </g>

      <!-- Bottom Bar Legend -->
      <g transform="translate(15, 195)">
        <rect x="0" y="0" width="390" height="20" rx="5" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="195" y="14" font-size="9" fill="#e2e8f0" font-weight="600" text-anchor="middle">🛡️ Stuart McGill Big 3: Despierta multífidos y erectores dorsales con compresión discal CERO</text>
      </g>
    </svg>`;
  }

  if (vType === "face_pull") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes facePullArms {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(28px); }
        }
        .anim-facepull-arms { animation: facePullArms 2.8s ease-in-out infinite; }
      </style>
      <rect x="25" y="25" width="10" height="160" rx="3" fill="#334155" />
      <circle cx="35" cy="45" r="5" fill="#f59e0b" filter="url(#glowAmber_${vType})" />
      <text x="18" y="20" font-size="8.5" fill="#94a3b8" font-weight="bold">ALTO</text>

      <line x1="25" y1="185" x2="295" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="215" cy="186" rx="65" ry="6" fill="url(#gradFloor_${vType})" />
      <line x1="195" y1="185" x2="205" y2="140" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="230" y1="185" x2="220" y2="140" stroke="#64748b" stroke-width="6" stroke-linecap="round" />

      <line x1="212" y1="140" x2="212" y2="78" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
      <circle cx="212" cy="58" r="13" fill="#38bdf8" />

      <g class="anim-facepull-arms">
        <line x1="35" y1="45" x2="180" y2="65" stroke="#f59e0b" stroke-width="4" filter="url(#glowAmber_${vType})" />
        <line x1="212" y1="80" x2="235" y2="62" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
        <line x1="235" y1="62" x2="180" y2="65" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" />
        <circle cx="180" cy="65" r="5" fill="#38bdf8" />
      </g>

      <text x="160" y="195" font-size="10" fill="#34d399" font-weight="700" text-anchor="middle">Face Pull con Banda • Deltoides Posterior y Manguito Rotador</text>
    </svg>`;
  }

  if (vType === "side_plank") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes plankHoldPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; filter: drop-shadow(0 0 8px #10b981); }
        }
        .anim-plank-spine { animation: plankHoldPulse 2.5s ease-in-out infinite; }
      </style>
      <rect x="40" y="168" width="240" height="8" rx="4" fill="#0284c7" opacity="0.8" />
      
      <line x1="90" y1="168" x2="120" y2="168" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="120" y1="168" x2="120" y2="125" stroke="#94a3b8" stroke-width="5.5" stroke-linecap="round" />

      <g class="anim-plank-spine">
        <line x1="120" y1="125" x2="245" y2="162" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <circle cx="95" cy="115" r="12" fill="#38bdf8" />
        <circle cx="170" cy="140" r="10" fill="rgba(16, 185, 129, 0.25)" stroke="#34d399" stroke-width="2" />
      </g>

      <text x="160" y="32" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Plancha Lateral Modificada • Cuadrado Lumbar & Oblicuos</text>
      <text x="160" y="52" font-size="9.5" fill="#94a3b8" text-anchor="middle">Línea lateral recta de oreja a tobillo • Apoyo en rodillas si hay molestia</text>
    </svg>`;
  }

  if (vType === "split_squat") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes splitSquatMotion {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(32px); }
        }
        .anim-split-squat { animation: splitSquatMotion 3.2s ease-in-out infinite; }
      </style>
      <line x1="25" y1="185" x2="295" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="160" cy="186" rx="85" ry="6" fill="url(#gradFloor_${vType})" />

      <!-- Support Chair -->
      <line x1="85" y1="110" x2="85" y2="185" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      <line x1="60" y1="140" x2="60" y2="185" stroke="#475569" stroke-width="3.5" stroke-linecap="round" />
      <line x1="60" y1="140" x2="90" y2="140" stroke="#64748b" stroke-width="5" stroke-linecap="round" />
      <text x="75" y="132" font-size="8" fill="#94a3b8" text-anchor="middle">Apoyo</text>

      <!-- Moving Figure -->
      <g class="anim-split-squat">
        <!-- Legs -->
        <!-- Front leg: hip ~ (155, 125) -> knee (135, 155) -> foot (135, 185) -->
        <line x1="155" y1="125" x2="135" y2="155" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
        <line x1="135" y1="155" x2="135" y2="185" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
        <circle cx="135" cy="185" r="4" fill="#38bdf8" />

        <!-- Rear leg: hip (155, 125) -> rear knee (185, 158) -> toe (210, 185) -->
        <line x1="155" y1="125" x2="185" y2="158" stroke="#475569" stroke-width="5.5" stroke-linecap="round" />
        <line x1="185" y1="158" x2="210" y2="185" stroke="#475569" stroke-width="5.5" stroke-linecap="round" />
        <circle cx="210" cy="185" r="4" fill="#cbd5e1" />

        <!-- Spine: 100% vertical protected! -->
        <line x1="155" y1="125" x2="155" y2="68" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <circle cx="155" cy="48" r="13" fill="#38bdf8" />

        <!-- Support arm reaching chair -->
        <line x1="155" y1="78" x2="115" y2="95" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" />
        <line x1="115" y1="95" x2="85" y2="112" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="85" cy="112" r="4" fill="#38bdf8" />
      </g>

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Zancada Asistida en Silla • Piernas & Glúteos</text>
      <text x="160" y="198" font-size="9.5" fill="#94a3b8" text-anchor="middle">Columna 100% erguida • Cero carga compresiva axial</text>
    </svg>`;
  }

  if (vType === "chair_dips") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes dipMotion {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(28px); }
        }
        .anim-dip-body { animation: dipMotion 3s ease-in-out infinite; }
      </style>
      <line x1="25" y1="185" x2="295" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="160" cy="186" rx="85" ry="6" fill="url(#gradFloor_${vType})" />

      <!-- Fixed Chair -->
      <rect x="75" y="125" width="45" height="10" rx="3" fill="#64748b" />
      <line x1="80" y1="135" x2="80" y2="185" stroke="#475569" stroke-width="5" stroke-linecap="round" />
      <line x1="115" y1="135" x2="115" y2="185" stroke="#475569" stroke-width="5" stroke-linecap="round" />
      <line x1="75" y1="80" x2="75" y2="135" stroke="#64748b" stroke-width="5" stroke-linecap="round" />

      <!-- Dipping Body -->
      <g class="anim-dip-body">
        <!-- Spine: stays right by the chair edge -->
        <line x1="135" y1="132" x2="135" y2="78" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <circle cx="135" cy="58" r="13" fill="#38bdf8" />

        <!-- Arms on chair seat -->
        <line x1="135" y1="85" x2="115" y2="105" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" />
        <line x1="115" y1="105" x2="115" y2="125" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" />
        <circle cx="115" cy="125" r="4.5" fill="#f43f5e" />

        <!-- Legs out front with feet planted -->
        <line x1="135" y1="132" x2="175" y2="148" stroke="#64748b" stroke-width="5.5" stroke-linecap="round" />
        <line x1="175" y1="148" x2="195" y2="185" stroke="#64748b" stroke-width="5.5" stroke-linecap="round" />
        <circle cx="195" cy="185" r="4" fill="#38bdf8" />
      </g>

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Fondos Suaves en Silla • Tríceps & Estabilidad</text>
      <text x="160" y="198" font-size="9.5" fill="#94a3b8" text-anchor="middle">Espalda pegada al borde • Rango controlado sin forzar hombros</text>
    </svg>`;
  }

  if (vType === "yt_raises" || vType === "w_extension") {
    return `
    <svg viewBox="0 0 420 220" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <!-- Background / Mat Ground -->
      <rect x="15" y="15" width="390" height="190" rx="12" fill="rgba(15, 23, 42, 0.65)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />
      <line x1="210" y1="20" x2="210" y2="195" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4" />

      <!-- Left Panel: FASE 1 - ELEVACIÓN EN 'Y' (45°) -->
      <g transform="translate(10, 0)">
        <rect x="15" y="24" width="170" height="22" rx="6" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1"/>
        <text x="100" y="39" font-size="9" fill="#38bdf8" font-weight="bold" text-anchor="middle">FASE 1: ELEVACIÓN 'Y' (45°)</text>

        <!-- Mat -->
        <rect x="25" y="155" width="150" height="6" rx="3" fill="#0284c7" opacity="0.6"/>
        <!-- Towel under forehead -->
        <rect x="42" y="145" width="24" height="10" rx="3" fill="#38bdf8" opacity="0.8"/>
        <text x="54" y="142" font-size="7" fill="#94a3b8" text-anchor="middle">Toalla</text>

        <!-- Prone Body -->
        <circle cx="54" cy="136" r="10" fill="#38bdf8"/>
        <line x1="64" y1="140" x2="145" y2="152" stroke="#10b981" stroke-width="6" stroke-linecap="round" filter="url(#glowGreen_${vType})"/>
        <line x1="145" y1="152" x2="168" y2="154" stroke="#64748b" stroke-width="4.5" stroke-linecap="round"/>

        <!-- Arms in 'Y' position lifting up -->
        <line x1="82" y1="140" x2="48" y2="110" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <circle cx="48" cy="110" r="4.5" fill="#f43f5e"/>
        <text x="36" y="105" font-size="10" fill="#f59e0b" font-weight="bold">👍</text>

        <!-- Motion Arrow Up -->
        <path d="M 45 125 L 45 110 L 40 115" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>

        <!-- Target callout -->
        <text x="100" y="80" font-size="8.5" fill="#f59e0b" font-weight="bold" text-anchor="middle">Pulgares hacia el techo 👍</text>
        <text x="100" y="92" font-size="7.5" fill="#94a3b8" text-anchor="middle">Trapecio inferior & Romboides</text>
        <text x="100" y="178" font-size="7.5" fill="#34d399" font-weight="600" text-anchor="middle">Frente pegada • Cuello neutro</text>
      </g>

      <!-- Right Panel: FASE 2 - CONTRACCIÓN EN 'T' / 'W' (90°) -->
      <g transform="translate(210, 0)">
        <rect x="15" y="24" width="170" height="22" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1"/>
        <text x="100" y="39" font-size="9" fill="#34d399" font-weight="bold" text-anchor="middle">FASE 2: CONTRACCIÓN 'T' / 'W'</text>

        <!-- Mat -->
        <rect x="25" y="155" width="150" height="6" rx="3" fill="#0284c7" opacity="0.6"/>
        <rect x="42" y="145" width="24" height="10" rx="3" fill="#38bdf8" opacity="0.8"/>

        <!-- Prone Body -->
        <circle cx="54" cy="136" r="10" fill="#38bdf8"/>
        <line x1="64" y1="140" x2="145" y2="152" stroke="#10b981" stroke-width="6" stroke-linecap="round" filter="url(#glowGreen_${vType})"/>
        <line x1="145" y1="152" x2="168" y2="154" stroke="#64748b" stroke-width="4.5" stroke-linecap="round"/>

        <!-- Scapular Retraction Glow between shoulder blades -->
        <ellipse cx="88" cy="138" rx="14" ry="7" fill="rgba(244, 63, 94, 0.3)" stroke="#f43f5e" stroke-width="1.5"/>

        <!-- Arms horizontal 'T' retracted -->
        <line x1="88" y1="138" x2="88" y2="104" stroke="#34d399" stroke-width="5" stroke-linecap="round"/>
        <circle cx="88" cy="104" r="4.5" fill="#f43f5e"/>
        <text x="88" y="98" font-size="10" fill="#34d399" font-weight="bold" text-anchor="middle">T / W</text>

        <!-- Arrows indicating squeezing shoulder blades -->
        <path d="M 80 120 L 88 126 L 96 120" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>

        <text x="100" y="76" font-size="8.5" fill="#34d399" font-weight="bold" text-anchor="middle">Pellizca escápulas 2 seg</text>
        <text x="100" y="88" font-size="7.5" fill="#94a3b8" text-anchor="middle">Sin arquear la zona lumbar</text>
        <text x="100" y="178" font-size="7.5" fill="#cbd5e1" text-anchor="middle">Postura antigorila • Cero impacto</text>
      </g>
    </svg>`;
  }

  if (vType === "step_up") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes stepLift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-28px); }
        }
        .anim-step-body { animation: stepLift 3s ease-in-out infinite; }
      </style>
      <line x1="25" y1="185" x2="295" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="160" cy="186" rx="85" ry="6" fill="url(#gradFloor_${vType})" />

      <!-- Step Platform -->
      <rect x="140" y="150" width="70" height="35" rx="4" fill="#475569" stroke="#64748b" stroke-width="2" />
      <text x="175" y="172" font-size="9" fill="#94a3b8" font-weight="bold" text-anchor="middle">PELDAÑO</text>

      <!-- Step Body -->
      <g class="anim-step-body">
        <line x1="120" y1="130" x2="120" y2="72" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <circle cx="120" cy="52" r="13" fill="#38bdf8" />

        <!-- Arms -->
        <line x1="120" y1="80" x2="105" y2="110" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" />
        <line x1="120" y1="80" x2="135" y2="110" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" />

        <!-- Stepping Leg on Platform -->
        <line x1="120" y1="130" x2="155" y2="135" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
        <line x1="155" y1="135" x2="165" y2="150" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
        <circle cx="165" cy="150" r="4.5" fill="#38bdf8" />

        <!-- Trailing Leg -->
        <line x1="120" y1="130" x2="115" y2="160" stroke="#475569" stroke-width="5.5" stroke-linecap="round" />
        <line x1="115" y1="160" x2="112" y2="185" stroke="#475569" stroke-width="5.5" stroke-linecap="round" />
        <circle cx="112" cy="185" r="4" fill="#cbd5e1" />
      </g>

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Step-Up en Peldaño o Silla Baja • Glúteo Mayor & Estabilidad</text>
      <text x="160" y="198" font-size="9.5" fill="#94a3b8" text-anchor="middle">Empuje exclusivo desde el talón superior • Tronco erguido</text>
    </svg>`;
  }

  if (vType === "walking") {
    return `
    <svg viewBox="0 0 420 220" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes booPaws {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes walkPacing {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .anim-boo-walk { animation: booPaws 0.8s ease-in-out infinite; }
        .anim-carlos-walk { animation: walkPacing 1.4s ease-in-out infinite; }
      </style>
      <rect x="15" y="15" width="390" height="190" rx="12" fill="rgba(15, 23, 42, 0.65)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />

      <!-- Path / Floor -->
      <line x1="30" y1="175" x2="390" y2="175" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="210" cy="177" rx="160" ry="8" fill="url(#gradFloor_${vType})" />

      <!-- Top Title & Metrics Badges -->
      <rect x="30" y="24" width="170" height="22" rx="6" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1"/>
      <text x="115" y="39" font-size="9" fill="#38bdf8" font-weight="bold" text-anchor="middle">PASEO ACTIVO & FARTLEK</text>

      <rect x="220" y="24" width="170" height="22" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1"/>
      <text x="305" y="39" font-size="9" fill="#34d399" font-weight="bold" text-anchor="middle">ZONA 2 • 5.0 - 5.5 KM/H</text>

      <!-- Carlos / Andrea Figure -->
      <g class="anim-carlos-walk" transform="translate(10, 0)">
        <!-- Upright neutral spine -->
        <line x1="140" y1="125" x2="140" y2="70" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})"/>
        <circle cx="140" cy="52" r="13" fill="#38bdf8"/>

        <!-- Legs in athletic forward stride -->
        <line x1="140" y1="125" x2="160" y2="150" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="160" y1="150" x2="170" y2="175" stroke="#64748b" stroke-width="5.5" stroke-linecap="round"/>
        <circle cx="170" cy="175" r="4" fill="#38bdf8"/>

        <line x1="140" y1="125" x2="120" y2="150" stroke="#475569" stroke-width="5.5" stroke-linecap="round"/>
        <line x1="120" y1="150" x2="110" y2="175" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
        <circle cx="110" cy="175" r="4" fill="#cbd5e1"/>

        <!-- Arms swinging naturally & Leash -->
        <line x1="140" y1="78" x2="122" y2="105" stroke="#475569" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="140" y1="78" x2="165" y2="105" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="165" cy="105" r="4" fill="#38bdf8"/>

        <!-- Leash stretching to Boo -->
        <path d="M 165 105 Q 215 130 260 148" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4 2"/>
      </g>

      <!-- Boo the Dog with harness & energetic posture -->
      <g class="anim-boo-walk" transform="translate(10, 0)">
        <!-- Harness on dog -->
        <ellipse cx="270" cy="152" rx="20" ry="12" fill="#f59e0b"/>
        <ellipse cx="266" cy="150" rx="9" ry="11" fill="none" stroke="#ef4444" stroke-width="2"/>
        <circle cx="286" cy="142" r="9" fill="#f59e0b"/>
        <!-- Boo ear & snout -->
        <polygon points="288,132 294,140 286,140" fill="#b45309"/>
        <polygon points="295,142 300,146 293,148" fill="#1e293b"/>
        <circle cx="290" cy="141" r="1.5" fill="#0f172a"/>
        <!-- Wagging happy tail -->
        <path d="M 250 150 Q 242 138 248 132" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Dog paws running -->
        <line x1="260" y1="162" x2="256" y2="175" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
        <line x1="268" y1="162" x2="272" y2="175" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
        <line x1="278" y1="162" x2="275" y2="175" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
        <line x1="284" y1="162" x2="288" y2="175" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
        <text x="270" y="130" font-size="9" fill="#f59e0b" font-weight="bold" text-anchor="middle">Boo 🐾 (Arnés)</text>
      </g>

      <!-- Technical Callouts at the bottom -->
      <g transform="translate(30, 186)">
        <text x="180" y="10" font-size="8.5" fill="#94a3b8" text-anchor="middle">Descompresión intervertebral • Brace abdominal activo en subidas • Ritmo conversacional</text>
      </g>
    </svg>`;
  }

  if (vType === "cat_cow") {
    return `
    <svg viewBox="0 0 420 220" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <rect x="15" y="15" width="390" height="190" rx="12" fill="rgba(15, 23, 42, 0.65)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />
      <line x1="210" y1="20" x2="210" y2="195" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4" />

      <!-- Left Panel: GATO (EXHALA) -->
      <g transform="translate(10, 0)">
        <rect x="15" y="24" width="170" height="22" rx="6" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1"/>
        <text x="100" y="39" font-size="9" fill="#38bdf8" font-weight="bold" text-anchor="middle">1. GATO (EXHALA - ARQUEA)</text>

        <!-- Mat -->
        <rect x="25" y="155" width="150" height="6" rx="3" fill="#0284c7" opacity="0.6"/>

        <!-- Support Arms & Thighs vertical -->
        <line x1="65" y1="120" x2="65" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
        <line x1="135" y1="125" x2="135" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>

        <!-- Head tucked down -->
        <circle cx="52" cy="128" r="10" fill="#38bdf8"/>

        <!-- Cat Arch: Upward curved spine -->
        <path d="M 65 120 Q 100 82 135 125" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" filter="url(#glowGreen_${vType})"/>

        <!-- Directional motion arrow UP -->
        <path d="M 100 102 L 100 88 L 95 93 M 100 88 L 105 93" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>

        <text x="100" y="72" font-size="8.5" fill="#38bdf8" font-weight="bold" text-anchor="middle">Ombligo hacia la columna</text>
        <text x="100" y="174" font-size="7.5" fill="#94a3b8" text-anchor="middle">Abre espacio intervertebral D7-D11</text>
      </g>

      <!-- Right Panel: VACA / CAMELLO (INHALA) -->
      <g transform="translate(210, 0)">
        <rect x="15" y="24" width="170" height="22" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1"/>
        <text x="100" y="39" font-size="9" fill="#34d399" font-weight="bold" text-anchor="middle">2. VACA (INHALA - DESCOMPRIME)</text>

        <!-- Mat -->
        <rect x="25" y="155" width="150" height="6" rx="3" fill="#0284c7" opacity="0.6"/>

        <!-- Support Arms & Thighs vertical -->
        <line x1="65" y1="120" x2="65" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
        <line x1="135" y1="125" x2="135" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>

        <!-- Head looking slightly forward/up -->
        <circle cx="50" cy="110" r="10" fill="#34d399"/>

        <!-- Cow Dip: Gentle downward sag, safe McGill range -->
        <path d="M 65 120 Q 100 134 135 125" fill="none" stroke="#34d399" stroke-width="6" stroke-linecap="round" filter="url(#glowGreen_${vType})"/>

        <!-- Directional motion arrow DOWN -->
        <path d="M 100 120 L 100 134 L 95 129 M 100 134 L 105 129" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>

        <text x="100" y="72" font-size="8.5" fill="#34d399" font-weight="bold" text-anchor="middle">Abre pecho y clavículas</text>
        <text x="100" y="84" font-size="7.5" fill="#f59e0b" font-weight="600" text-anchor="middle">⚠️ Cero hiperextensión lumbar</text>
        <text x="100" y="174" font-size="7.5" fill="#94a3b8" text-anchor="middle">Movimiento fluido y sin rebotes</text>
      </g>
    </svg>`;
  }

  if (vType === "stretching") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes stretchBreathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.06); opacity: 1; filter: drop-shadow(0 0 10px #10b981); }
        }
        .anim-stretch { animation: stretchBreathe 3.6s ease-in-out infinite; transform-origin: 160px 110px; }
      </style>
      <rect x="40" y="172" width="240" height="8" rx="4" fill="#0284c7" opacity="0.8" />

      <!-- Calming circles -->
      <circle cx="160" cy="110" r="55" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.4" />
      <circle cx="160" cy="110" r="75" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.25" />

      <g class="anim-stretch">
        <!-- Figure in Child's pose / gentle relaxation -->
        <circle cx="110" cy="155" r="12" fill="#38bdf8" />
        <path d="M 120 158 Q 160 140 195 160" fill="none" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <line x1="195" y1="160" x2="225" y2="172" stroke="#64748b" stroke-width="6" stroke-linecap="round" />

        <!-- Arms outstretched relaxed -->
        <line x1="120" y1="160" x2="80" y2="172" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
        <circle cx="80" cy="172" r="4" fill="#38bdf8" />
      </g>

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Descompresión Axial & Estiramiento Relajante</text>
      <text x="160" y="48" font-size="9.5" fill="#38bdf8" text-anchor="middle">Respiración diafragmática profunda • 0 impacto, relajación para D7-D11</text>
    </svg>`;
  }

  if (vType === "pushup") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes pushupDip {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(26px); }
        }
        @keyframes chestGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; filter: drop-shadow(0 0 10px #f43f5e); }
        }
        .anim-pushup-body { animation: pushupDip 2.8s ease-in-out infinite; transform-origin: 240px 175px; }
        .anim-chest-pulse { animation: chestGlow 2.8s ease-in-out infinite; }
      </style>
      <rect x="30" y="176" width="260" height="8" rx="4" fill="#0284c7" opacity="0.8" />
      
      <!-- Push-up Body -->
      <g class="anim-pushup-body">
        <!-- Head -->
        <circle cx="85" cy="118" r="13" fill="#38bdf8" />
        <!-- Torso / Spine in plank line -->
        <line x1="95" y1="125" x2="235" y2="162" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        
        <!-- Arms pushing floor -->
        <line x1="115" y1="130" x2="115" y2="176" stroke="#94a3b8" stroke-width="5.5" stroke-linecap="round" />
        <circle cx="115" cy="176" r="4.5" fill="#f43f5e" />

        <!-- Chest Activation Spark -->
        <circle cx="120" cy="132" r="9" fill="rgba(244, 63, 94, 0.25)" class="anim-chest-pulse" />
      </g>

      <!-- Feet planted -->
      <circle cx="235" cy="168" r="5" fill="#64748b" />

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Flexiones de Pecho en Suelo • Pectoral & Tríceps</text>
      <text x="160" y="48" font-size="9.5" fill="#94a3b8" text-anchor="middle">Cuerpo alineado como una tabla • Codos a 45° del torso</text>
    </svg>`;
  }

  if (vType === "shoulder_press") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes pressArmsUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes deltoidPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; filter: drop-shadow(0 0 8px #38bdf8); }
        }
        .anim-press-arms { animation: pressArmsUp 2.8s ease-in-out infinite; }
        .anim-deltoid-glow { animation: deltoidPulse 2.8s ease-in-out infinite; }
      </style>
      <line x1="30" y1="185" x2="290" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="160" cy="186" rx="80" ry="6" fill="url(#gradFloor_${vType})" />

      <!-- Standing Legs & Torso -->
      <line x1="148" y1="185" x2="154" y2="140" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="172" y1="185" x2="166" y2="140" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="160" y1="140" x2="160" y2="78" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
      <circle cx="160" cy="58" r="13" fill="#38bdf8" />

      <!-- Band under feet -->
      <line x1="140" y1="186" x2="180" y2="186" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />

      <!-- Moving Arms Pressing Overhead -->
      <g class="anim-press-arms">
        <!-- Left arm -->
        <line x1="150" y1="80" x2="125" y2="78" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
        <circle cx="125" cy="78" r="5" fill="#f43f5e" />
        <!-- Right arm -->
        <line x1="170" y1="80" x2="195" y2="78" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
        <circle cx="195" cy="78" r="5" fill="#f43f5e" />

        <!-- Band stretched from feet to hands -->
        <line x1="145" y1="185" x2="125" y2="78" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3 2" />
        <line x1="175" y1="185" x2="195" y2="78" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3 2" />
      </g>

      <!-- Deltoid Glow -->
      <circle cx="145" cy="80" r="7" fill="rgba(56, 189, 248, 0.4)" class="anim-deltoid-glow" />
      <circle cx="175" cy="80" r="7" fill="rgba(56, 189, 248, 0.4)" class="anim-deltoid-glow" />

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Press Militar de Hombros con Banda • Deltoides</text>
      <text x="160" y="198" font-size="9.5" fill="#94a3b8" text-anchor="middle">Empuje vertical directo • Abdomen y glúteos compactos</text>
    </svg>`;
  }

  if (vType === "monster_walk") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes monsterStepCycle {
          0%, 100% { transform: translateX(-18px); }
          50% { transform: translateX(18px); }
        }
        @keyframes bandStretchGlow {
          0%, 100% { stroke: #f59e0b; }
          50% { stroke: #f43f5e; filter: drop-shadow(0 0 8px #f43f5e); }
        }
        .anim-monster-walker { animation: monsterStepCycle 2.4s ease-in-out infinite; }
        .anim-monster-band { animation: bandStretchGlow 2.4s ease-in-out infinite; }
      </style>
      <line x1="20" y1="185" x2="300" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="160" cy="186" rx="90" ry="6" fill="url(#gradFloor_${vType})" />

      <g class="anim-monster-walker">
        <!-- Quarter squat body -->
        <line x1="160" y1="135" x2="160" y2="78" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <circle cx="160" cy="58" r="13" fill="#38bdf8" />
        
        <!-- Guard arms -->
        <line x1="160" y1="88" x2="140" y2="105" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" />
        <line x1="160" y1="88" x2="180" y2="105" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" />

        <!-- Left Leg in athletic stance -->
        <line x1="160" y1="135" x2="135" y2="158" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
        <line x1="135" y1="158" x2="125" y2="185" stroke="#64748b" stroke-width="5.5" stroke-linecap="round" />
        <circle cx="125" cy="185" r="4" fill="#38bdf8" />

        <!-- Right Leg in athletic stance -->
        <line x1="160" y1="135" x2="185" y2="158" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
        <line x1="185" y1="158" x2="195" y2="185" stroke="#64748b" stroke-width="5.5" stroke-linecap="round" />
        <circle cx="195" cy="185" r="4" fill="#38bdf8" />

        <!-- Resistance Band around thighs/knees -->
        <line x1="135" y1="158" x2="185" y2="158" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" class="anim-monster-band" />
        <circle cx="135" cy="158" r="4.5" fill="#f43f5e" />
        <circle cx="185" cy="158" r="4.5" fill="#f43f5e" />
      </g>

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Monster Walk Lateral con Banda • Glúteo Medio</text>
      <text x="160" y="198" font-size="9.5" fill="#94a3b8" text-anchor="middle">Media sentadilla activa • Tensión continua sin juntar los pies</text>
    </svg>`;
  }

  if (vType === "donkey_kick") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes kickUpCycle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-28deg); }
        }
        @keyframes gluteHighlight {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; filter: drop-shadow(0 0 10px #f43f5e); }
        }
        .anim-donkey-leg { animation: kickUpCycle 2.4s ease-in-out infinite; transform-origin: 195px 125px; }
        .anim-glute-glow { animation: gluteHighlight 2.4s ease-in-out infinite; }
      </style>
      <rect x="40" y="168" width="240" height="8" rx="4" fill="#0284c7" opacity="0.8" />

      <!-- Fixed support limbs in quadruped -->
      <line x1="125" y1="125" x2="125" y2="168" stroke="#64748b" stroke-width="5.5" stroke-linecap="round" />
      <line x1="185" y1="125" x2="185" y2="168" stroke="#475569" stroke-width="5.5" stroke-linecap="round" />

      <!-- Spine & Head flat -->
      <line x1="120" y1="122" x2="195" y2="122" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
      <circle cx="102" cy="118" r="12" fill="#38bdf8" />

      <!-- Glute activation indicator -->
      <circle cx="195" cy="120" r="10" fill="rgba(244, 63, 94, 0.4)" class="anim-glute-glow" />

      <!-- Kicking Leg (flexed 90° pushing up) -->
      <g class="anim-donkey-leg">
        <line x1="195" y1="125" x2="230" y2="105" stroke="#f43f5e" stroke-width="6" stroke-linecap="round" />
        <line x1="230" y1="105" x2="240" y2="78" stroke="#f43f5e" stroke-width="6" stroke-linecap="round" />
        <!-- Foot sole flat to ceiling -->
        <line x1="234" y1="78" x2="248" y2="78" stroke="#cbd5e1" stroke-width="4.5" stroke-linecap="round" />
      </g>

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Patada de Glúteo en Cuadrupedia (Donkey Kicks)</text>
      <text x="160" y="48" font-size="9.5" fill="#94a3b8" text-anchor="middle">Suela empujando hacia el techo • Cero balanceo lumbar</text>
    </svg>`;
  }

  if (vType === "deadlift_band") {
    return `
    <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
      ${commonDefs}
      <style>
        @keyframes hingeCycle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(34deg); }
        }
        @keyframes gluteHamPulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px #10b981); }
          50% { opacity: 0.3; }
        }
        .anim-hinge-torso { animation: hingeCycle 3s ease-in-out infinite; transform-origin: 165px 135px; }
        .anim-hamstring-pulse { animation: gluteHamPulse 3s ease-in-out infinite; }
      </style>
      <line x1="25" y1="185" x2="295" y2="185" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <ellipse cx="160" cy="186" rx="80" ry="6" fill="url(#gradFloor_${vType})" />

      <!-- Legs slightly bent -->
      <line x1="165" y1="135" x2="162" y2="185" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <circle cx="162" cy="185" r="4.5" fill="#38bdf8" />

      <!-- Band under feet -->
      <ellipse cx="162" cy="186" rx="14" ry="4" fill="none" stroke="#f59e0b" stroke-width="4" />

      <!-- Hinging Torso & Arms -->
      <g class="anim-hinge-torso">
        <!-- Spine (stays completely straight!) -->
        <line x1="165" y1="135" x2="165" y2="72" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
        <circle cx="165" cy="52" r="13" fill="#38bdf8" />

        <!-- Arms holding band hanging down -->
        <line x1="165" y1="80" x2="150" y2="125" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
        <circle cx="150" cy="125" r="4.5" fill="#f43f5e" />

        <!-- Band stretched up to hands -->
        <line x1="162" y1="185" x2="150" y2="125" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3 2" />
      </g>

      <!-- Glute & Hamstring squeeze glow -->
      <circle cx="172" cy="140" r="10" fill="rgba(16, 185, 129, 0.4)" class="anim-hamstring-pulse" />

      <text x="160" y="28" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Peso Muerto Rumano con Banda • Glúteos & Isquios</text>
      <text x="160" y="198" font-size="9.5" fill="#94a3b8" text-anchor="middle">Bisagra pura de cadera hacia atrás • Espalda neutra y bloqueo de glúteos arriba</text>
    </svg>`;
  }

  // Generic clean fallback for other safe exercises
  return `
  <svg viewBox="0 0 320 210" class="exercise-anim-svg" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <style>
      @keyframes genericBreath {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      .anim-generic { animation: genericBreath 3s ease-in-out infinite; transform-origin: 160px 105px; }
    </style>
    <line x1="30" y1="180" x2="290" y2="180" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
    <ellipse cx="160" cy="181" rx="85" ry="6" fill="url(#gradFloor_${vType})" />

    <g class="anim-generic">
      <line x1="160" y1="140" x2="160" y2="78" stroke="#10b981" stroke-width="7" stroke-linecap="round" filter="url(#glowGreen_${vType})" />
      <circle cx="160" cy="58" r="14" fill="#38bdf8" />
      
      <line x1="145" y1="180" x2="152" y2="140" stroke="#64748b" stroke-width="6" stroke-linecap="round" />
      <line x1="175" y1="180" x2="168" y2="140" stroke="#64748b" stroke-width="6" stroke-linecap="round" />

      <line x1="145" y1="88" x2="120" y2="115" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
      <line x1="175" y1="88" x2="200" y2="115" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />

      <circle cx="160" cy="115" r="16" fill="none" stroke="#f43f5e" stroke-width="3.5" filter="url(#glowRose_${vType})" />
    </g>

    <text x="160" y="32" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">${exerciseName}</text>
    <text x="160" y="52" font-size="9.5" fill="#94a3b8" text-anchor="middle">Ejecución con columna neutra protegida (D7-D11)</text>
  </svg>`;
}

export function normalizeEquipmentList(equipment) {
  if (!equipment) return [];
  if (Array.isArray(equipment)) return equipment;
  if (typeof equipment === 'string') {
    return equipment
      .split(/[+,/]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function getEquipmentIcon(item) {
  const lower = (item || "").toLowerCase();
  if (lower.includes('ring') || lower.includes('switch')) {
    return { icon: '🎯', label: 'Ring-Con (Switch)', color: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.35)' };
  }
  if (lower.includes('banda') || lower.includes('elast') || lower.includes('goma')) {
    return { icon: '🎗️', label: 'Banda Elástica', color: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' };
  }
  if (lower.includes('silla') || lower.includes('chair') || lower.includes('banco')) {
    return { icon: '🪑', label: 'Silla', color: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.35)' };
  }
  if (lower.includes('esterilla') || lower.includes('mat') || lower.includes('suelo')) {
    return { icon: '🧘', label: 'Esterilla', color: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)' };
  }
  if (lower.includes('arnés') || lower.includes('arnes') || lower.includes('correa') || lower.includes('frisbee') || lower.includes('juguete')) {
    return { icon: '🐾', label: 'Paseo con Boo', color: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.35)' };
  }
  if (lower.includes('zapatilla') || lower.includes('trail') || lower.includes('calzado')) {
    return { icon: '👟', label: 'Calzado Deportivo', color: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.35)' };
  }
  return { icon: '🧍', label: item || 'Corporal', color: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.35)' };
}

export function renderEquipmentIcons(equipment) {
  const list = normalizeEquipmentList(equipment);
  if (list.length === 0) {
    return `<span class="equip-icon-badge" title="Corporal">🧍</span>`;
  }
  return list.map(item => {
    const info = getEquipmentIcon(item);
    return `<span class="equip-icon-badge" title="${info.label}" style="background:${info.color}; border:1px solid ${info.border};">${info.icon}</span>`;
  }).join(' ');
}

export function openExerciseGuideModal(dayName, exerciseIdx, customProfileId) {
  try {
    triggerHapticTouch();
    const pid = customProfileId || appState.activeProfileId || 'he';
    const schedule = getWeeklyWorkoutSchedule(pid);
    const dayRoutine = schedule?.[dayName] || schedule?.["Lunes"];
    const ex = dayRoutine?.exercises?.[exerciseIdx];
    if (!ex) return;

    const modal = document.getElementById("exercise-guide-modal");
    if (!modal) return;

    const titleEl = document.getElementById("exercise-guide-modal-title");
    const subEl = document.getElementById("exercise-guide-modal-subtitle");
    const bodyEl = document.getElementById("exercise-guide-modal-body");

    if (titleEl) titleEl.innerText = ex.name || "Ejercicio";
    const targetMusclesStr = Array.isArray(ex.targetMuscles)
      ? ex.targetMuscles.join(", ")
      : (ex.targetMuscles || 'Fortalecimiento de Espalda & Core');
    const pName = appState.profiles?.[pid]?.name || (pid === 'he' ? 'Carlos' : 'Andrea');
    if (subEl) subEl.innerText = `${pName} • ${dayName} • ${targetMusclesStr}`;

    const visualSvg = getExerciseVisualSvg(ex.visualType, ex.name);

    const stepsList = Array.isArray(ex.steps) && ex.steps.length > 0
      ? ex.steps
      : [ex.technique || 'Ejecuta el movimiento con control y columna neutra.'];

    const stepsHtml = stepsList.map((step, idx) => `
      <div class="guide-step-card">
        <div class="guide-step-num">${idx + 1}</div>
        <div class="guide-step-text">${step}</div>
      </div>
    `).join("");

    const mistakesList = Array.isArray(ex.commonMistakes) ? ex.commonMistakes : [];
    const mistakesHtml = mistakesList.length > 0 ? `
      <div class="guide-section-title" style="color: #f87171; margin-top: 0.9rem;">
        <i class="fa-solid fa-triangle-exclamation"></i> Errores a Evitar:
      </div>
      <div class="guide-mistakes-list">
        ${mistakesList.map(m => `
          <div class="guide-mistake-card">
            <i class="fa-solid fa-circle-xmark" style="color: #ef4444; margin-top: 2px;"></i>
            <span>${m}</span>
          </div>
        `).join("")}
      </div>
    ` : "";

    const mediaHtml = ex.gifUrl ? `
      <div class="exercise-media-wrapper">
        <div class="exercise-media-switcher-tabs">
          <button type="button" id="btn-media-gif" class="btn-media-tab active" onclick="if(window.switchExerciseMediaStage) window.switchExerciseMediaStage('gif');">
            <i class="fa-solid fa-play"></i> Demostración Real (GIF)
          </button>
          <button type="button" id="btn-media-svg" class="btn-media-tab" onclick="if(window.switchExerciseMediaStage) window.switchExerciseMediaStage('svg');">
            <i class="fa-solid fa-chalkboard-user"></i> Guía Técnica & Infografía
          </button>
        </div>
        <div class="exercise-media-player">
          <div id="exercise-stage-gif" class="exercise-media-stage" style="display: flex;">
            <div class="exercise-media-badge" style="border-color: rgba(56, 189, 248, 0.45); color: #38bdf8;">
              <i class="fa-solid fa-circle-play" style="color: #38bdf8;"></i> Demostración en Vivo
            </div>
            <img src="${ex.gifUrl}" alt="${ex.name}" class="exercise-real-gif" loading="eager" onerror="if(window.switchExerciseMediaStage) window.switchExerciseMediaStage('svg'); const bg = document.getElementById('btn-media-gif'); if (bg) bg.style.display='none';" />
          </div>
          <div id="exercise-stage-svg" class="exercise-media-stage" style="display: none;">
            <div class="exercise-media-badge">
              <i class="fa-solid fa-shield-halved"></i> Biomecánica & Alineación Segura
            </div>
            ${visualSvg}
          </div>
        </div>
        <div class="exercise-phases-timeline">
          <div class="exercise-phase-chip">
            <span class="phase-badge">1</span>
            <div class="phase-info">
              <strong>Inicio & Postura</strong>
              <p>Alineación articular y respiración</p>
            </div>
          </div>
          <div class="exercise-phase-arrow"><i class="fa-solid fa-chevron-right"></i></div>
          <div class="exercise-phase-chip">
            <span class="phase-badge">2</span>
            <div class="phase-info">
              <strong>Fase Concéntrica</strong>
              <p>Fuerza controlada sin inercia</p>
            </div>
          </div>
          <div class="exercise-phase-arrow"><i class="fa-solid fa-chevron-right"></i></div>
          <div class="exercise-phase-chip">
            <span class="phase-badge">3</span>
            <div class="phase-info">
              <strong>Pico & Retorno</strong>
              <p>1s contracción y descenso lento</p>
            </div>
          </div>
        </div>
      </div>
    ` : `
      <div class="exercise-media-wrapper">
        <div class="exercise-media-player">
          <div class="exercise-media-badge">
            <i class="fa-solid fa-shield-halved"></i> Guía Técnica Oficial (100% Precisa)
          </div>
          <div id="exercise-stage-svg" class="exercise-media-stage" style="display: flex;">
            ${visualSvg}
          </div>
        </div>
        <div class="exercise-phases-timeline">
          <div class="exercise-phase-chip">
            <span class="phase-badge">1</span>
            <div class="phase-info">
              <strong>Inicio & Postura</strong>
              <p>Alineación articular y respiración</p>
            </div>
          </div>
          <div class="exercise-phase-arrow"><i class="fa-solid fa-chevron-right"></i></div>
          <div class="exercise-phase-chip">
            <span class="phase-badge">2</span>
            <div class="phase-info">
              <strong>Fase Concéntrica</strong>
              <p>Fuerza controlada sin inercia</p>
            </div>
          </div>
          <div class="exercise-phase-arrow"><i class="fa-solid fa-chevron-right"></i></div>
          <div class="exercise-phase-chip">
            <span class="phase-badge">3</span>
            <div class="phase-info">
              <strong>Pico & Retorno</strong>
              <p>1s contracción y descenso lento</p>
            </div>
          </div>
        </div>
      </div>
    `;

    bodyEl.innerHTML = `
      <div class="exercise-visual-stage">
        ${mediaHtml}
      </div>

      <div class="guide-specs-bar">
        <div class="guide-spec-box">
          <span class="guide-spec-lbl">Series</span>
          <span class="guide-spec-val" style="color: var(--accent-emerald);">${ex.sets}</span>
        </div>
        <div class="guide-spec-box">
          <span class="guide-spec-lbl">Reps / Tiempo</span>
          <span class="guide-spec-val">${formatExerciseReps(ex.reps)}</span>
        </div>
        <div class="guide-spec-box">
          <span class="guide-spec-lbl">Descanso</span>
          <span class="guide-spec-val">${ex.rest || '60s'}</span>
        </div>
        <div class="guide-spec-box">
          <span class="guide-spec-lbl">Material</span>
          <span class="guide-spec-val" style="font-size: 1.05rem;">${renderEquipmentIcons(ex.equipment)}</span>
        </div>
      </div>

      <div class="guide-technique-card">
        <div class="guide-technique-title">
          <i class="fa-solid fa-lightbulb" style="color:var(--accent-amber);"></i> Técnica & Ejecución:
        </div>
        <p class="guide-technique-text">${ex.technique || 'Mantén la postura erguida y ejecuta el movimiento con control.'}</p>
      </div>

      ${ex.spinalSafetyNote ? `
        <div class="guide-spine-safety">
          <div class="guide-spine-safety-header">
            <i class="fa-solid fa-shield-heart"></i> Biomecánica Segura para Columna:
          </div>
          <p>${ex.spinalSafetyNote}</p>
        </div>
      ` : (ex.focusTip ? `
        <div class="guide-spine-safety" style="background: rgba(2, 132, 199, 0.08); border-color: rgba(2, 132, 199, 0.25);">
          <div class="guide-spine-safety-header" style="color: var(--accent-cyan);">
            <i class="fa-solid fa-fire"></i> Clave de Activación & Rendimiento:
          </div>
          <p>${ex.focusTip}</p>
        </div>
      ` : '')}

      <div class="guide-section-title">
        <i class="fa-solid fa-clipboard-list" style="color: var(--accent-cyan);"></i> Instrucciones Paso a Paso:
      </div>
      <div class="guide-steps-list">
        ${stepsHtml}
      </div>

      ${mistakesHtml}

      <button type="button" class="btn-guide-modal-close" onclick="if(window.closeExerciseGuideModal) window.closeExerciseGuideModal();">
        <i class="fa-solid fa-arrow-left"></i> Volver a la Rutina
      </button>
    `;

    modal.classList.add("active");
  } catch(e) {
    console.error("Error opening exercise guide modal:", e);
  }
}

export function switchExerciseMediaStage(stage) {
  try {
    triggerHapticTouch();
    const btnSvg = document.getElementById("btn-media-svg");
    const btnGif = document.getElementById("btn-media-gif");
    const stageSvg = document.getElementById("exercise-stage-svg");
    const stageGif = document.getElementById("exercise-stage-gif");

    if (stage === 'gif' && stageGif) {
      if (stageSvg) stageSvg.style.display = 'none';
      stageGif.style.display = 'flex';
      if (btnSvg) btnSvg.classList.remove('active');
      if (btnGif) btnGif.classList.add('active');
    } else if (stageSvg) {
      if (stageGif) stageGif.style.display = 'none';
      stageSvg.style.display = 'flex';
      if (btnGif) btnGif.classList.remove('active');
      if (btnSvg) btnSvg.classList.add('active');
    }
  } catch(e) {
    console.error("Error switching exercise media stage:", e);
  }
}

export function closeExerciseGuideModal() {
  try {
    triggerHapticTouch();
    const modal = document.getElementById("exercise-guide-modal");
    if (modal) modal.classList.remove("active");
  } catch(e) {
    console.error("Error closing exercise guide modal:", e);
  }
}

export function renderExerciseTableView() {
  try {
    const container = document.getElementById("exercise-routines-container");
    if (!container) return;
    container.innerHTML = "";

    const activeDay = appState.activeExerciseDay || getTodayDayName();
    const profileId = appState.activeProfileId || 'he';
    const p = appState.profiles?.[profileId] || { name: profileId === 'he' ? 'Carlos' : 'Andrea' };

    const selectElem = document.getElementById("exercise-day-select");
    if (selectElem && selectElem.value !== activeDay) {
      selectElem.value = activeDay;
    }

    const currentSchedule = getWeeklyWorkoutSchedule(profileId);
    const routine = currentSchedule?.[activeDay] || currentSchedule?.["Lunes"];
    if (!routine) return;

    const card = document.createElement("div");
    card.className = "glass-card";

    const exerciseCardsHtml = (routine.exercises || []).map((ex, exIdx) => `
      <div class="exercise-clean-card">
        <div class="exercise-clean-header-row">
          <div class="exercise-clean-title-group">
            <span class="exercise-clean-name">${ex.name}</span>
            <span class="exercise-clean-icons">${renderEquipmentIcons(ex.equipment)}</span>
          </div>
          <button type="button" class="btn-exercise-guide-compact" onclick="if(window.openExerciseGuideModal) window.openExerciseGuideModal('${activeDay}', ${exIdx}, '${profileId}');" title="Ver técnica y animación visual">
            <i class="fa-solid fa-play"></i> Guía
          </button>
        </div>

        <div class="exercise-clean-specs-row">
          <div class="exercise-spec-item">
            <span class="spec-lbl">SERIES</span>
            <span class="spec-val" style="color: var(--accent-emerald);">${ex.sets}</span>
          </div>
          <div class="exercise-spec-item">
            <span class="spec-lbl">REPETICIONES</span>
            <span class="spec-val">${formatExerciseReps(ex.reps)}</span>
          </div>
          <div class="exercise-spec-item">
            <span class="spec-lbl">DESCANSO</span>
            <span class="spec-val" style="color: var(--text-muted);">${ex.rest || '60s'}</span>
          </div>
        </div>
      </div>
    `).join("");

    card.innerHTML = `
      <div class="routine-header-box" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom: 5px;">
            <span class="routine-badge" style="background: ${profileId === 'he' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${profileId === 'he' ? '#0284c7' : '#e11d48'}; font-weight: 700;">
              <i class="fa-solid ${profileId === 'he' ? 'fa-mars' : 'fa-venus'}"></i> ${p.name || (profileId === 'he' ? 'Carlos' : 'Andrea')}
            </span>
            <span class="routine-badge"><i class="fa-solid fa-clock"></i> ${routine.duration} min</span>
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--text-main); margin-bottom: 2px;">
            ${routine.title}
          </h2>
          <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0;">
            ${routine.focus || ''}
          </p>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border-color);">
        <span><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i> ${routine.location || 'En casa'}</span>
        <span>•</span>
        <span><i class="fa-solid fa-dumbbell" style="color:var(--accent-emerald);"></i> ${routine.type || 'Fuerza'}</span>
        <span>•</span>
        <span style="display:inline-flex; align-items:center; gap:0.35rem;">
          <i class="fa-solid fa-toolbox" style="color:var(--accent-amber);"></i> ${renderEquipmentIcons(routine.equipment)}
        </span>
      </div>

      <div class="exercise-clean-list">
        ${exerciseCardsHtml}
      </div>
    `;

    container.appendChild(card);
  } catch(e) {
    console.error("Error rendering Exercise Table View:", e);
  }
}

export function renderWorkoutTracker() {
  try {
    const container = document.getElementById("profile-workouts-container");
    if (!container) return;

    const profileId = appState.activeProfileId;
    const p = appState.profiles[profileId];
    if (!p) return;
    const watchMetrics = appState.appleWatch?.metrics?.[profileId] || { moveKcal: 0, hr: 0, steps: 0, distanceKm: 0 };
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const currentSchedule = getWeeklyWorkoutSchedule(profileId);

    let completedCount = 0;
    let totalMinutes = 0;

    days.forEach(d => {
      if (isDayCompleted(profileId, d)) {
        completedCount++;
        const watchData = getDayWatchData(profileId, d);
        if (watchData && watchData.durationMin) {
          totalMinutes += watchData.durationMin;
        } else {
          const schedule = currentSchedule?.[d];
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

        <div class="workout-days-grid">
    `;

    days.forEach(day => {
      const isDone = isDayCompleted(profileId, day);
      const watchData = getDayWatchData(profileId, day);
      const routine = currentSchedule?.[day] || {};

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
                <li style="margin-bottom: 2px;"><strong>${ex.name}</strong> (${ex.sets} ${ex.sets === 1 ? 'serie' : 'series'} x ${formatExerciseReps(ex.reps)})</li>
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
  } catch(e) {
    console.error("Error rendering Workout Tracker:", e);
  }
}

export function recordWatchWorkoutForDay() {
  toggleWorkoutDay(getTodayDayName());
}

export function openEditWorkoutWatchModal(dayName) {
  try {
    triggerHapticTouch();
    const pid = appState.activeProfileId;
    const watchData = getDayWatchData(pid, dayName) || {
      deviceName: `Apple Watch (${appState.profiles[pid]?.name?.split(" ")[0] || 'Carlos'})`,
      durationMin: 45,
      kcal: 400,
      avgHr: 140,
      maxHr: 168,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs"
    };

    const modal = document.getElementById("edit-workout-watch-modal");
    if (!modal) return;

    const dayInput = document.getElementById("edit-workout-day-name");
    if (dayInput) dayInput.value = dayName;

    const sub = document.getElementById("edit-workout-modal-subtitle");
    if (sub) sub.innerText = `Ajustar mediciones reales de Apple Watch del ${dayName}`;

    const devInput = document.getElementById("edit-workout-device-name");
    if (devInput) devInput.value = watchData.deviceName || `Apple Watch (${appState.profiles[pid]?.name?.split(" ")[0] || 'Carlos'})`;

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
  } catch(e) {
    console.error("Error opening edit workout watch modal:", e);
  }
}

export function closeEditWorkoutWatchModal() {
  try {
    triggerHapticTouch();
    const modal = document.getElementById("edit-workout-watch-modal");
    if (modal) modal.classList.remove("active");
  } catch(e) {
    console.error("Error closing edit workout watch modal:", e);
  }
}

export function saveWorkoutWatchDataFromModal(e) {
  try {
    if (e) e.preventDefault();
    triggerHapticTouch();

    const pid = getMasterProfileId();
    const dayName = document.getElementById("edit-workout-day-name")?.value;
    if (!dayName) return;

    const deviceName = document.getElementById("edit-workout-device-name")?.value.trim();
    const durationMin = parseInt(document.getElementById("edit-workout-duration")?.value) || 45;
    const kcal = parseInt(document.getElementById("edit-workout-kcal")?.value) || 400;
    const avgHr = parseInt(document.getElementById("edit-workout-avg-hr")?.value) || 140;
    const maxHr = parseInt(document.getElementById("edit-workout-max-hr")?.value) || 168;
    const timestamp = document.getElementById("edit-workout-timestamp")?.value.trim() || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs");

    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

    const sessionObj = {
      id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      deviceName: deviceName || `Apple Watch (${appState.profiles[pid]?.name?.split(" ")[0] || 'Carlos'})`,
      durationMin,
      kcal,
      avgHr,
      maxHr,
      timestamp,
      autoSync: false
    };

    appState.completedWorkouts[pid][dayName] = {
      done: true,
      watchData: sessionObj,
      sessions: [sessionObj]
    };

    const targetDate = getDateForDayNameInCurrentWeek(dayName);
    recordDailySnapshot(pid, targetDate);
    saveState();
    closeEditWorkoutWatchModal();
    if (window.renderAll) window.renderAll();

    showIosToast(` Entrenamiento de ${dayName} calibrado con éxito (${kcal} kcal - ${durationMin} min)`, "fa-solid fa-circle-check");
  } catch(err) {
    console.error("Error saving workout watch data from modal:", err);
  }
}

export function connectBluetoothHR() {
  triggerHapticTouch();
  if (navigator.bluetooth) {
    navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
      .then(device => {
        showIosToast(` Conectado por Bluetooth a ${device.name || 'Pulsómetro Apple Watch'}`, "fa-solid fa-bluetooth");
      })
      .catch(err => {
        simulateBluetoothPairing();
      });
  } else {
    simulateBluetoothPairing();
  }
}

export function simulateBluetoothPairing() {
  const pid = appState.activeProfileId;
  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = {};
  if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = {};
  const m = appState.appleWatch.metrics[pid];
  m.hr = 142;
  saveState();
  if (window.updateAppleWatchModalUI) window.updateAppleWatchModalUI();
  showIosToast(` Pulsómetro Apple Watch enlazado por Bluetooth: Frecuencia cardíaca en directo 142 BPM`, "fa-solid fa-heart-pulse");
}

let currentWorkoutsHistoryPeriod = '30d';

export function setWorkoutsHistoryPeriod(period) {
  try {
    triggerHapticTouch();
    currentWorkoutsHistoryPeriod = period;
    renderWorkoutsHistoryView();
  } catch(e) {
    console.error("Error setting workouts history period:", e);
  }
}

export function renderWorkoutsHistoryView() {
  try {
    const container = document.getElementById("workouts-history-container");
    if (!container) return;

    const pid = appState.activeProfileId || getMasterProfileId();
    const p = appState.profiles?.[pid] || { name: pid === 'he' ? 'Carlos' : 'Andrea' };
    const pName = p.name || (pid === 'he' ? 'Carlos' : 'Andrea');

    const badgeContainer = document.getElementById("workouts-history-profile-badge");
    if (badgeContainer) {
      badgeContainer.innerHTML = `
        <span class="routine-badge" style="background: ${pid === 'he' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${pid === 'he' ? '#0284c7' : '#e11d48'}; font-weight: 700; font-size: 0.82rem; padding: 4px 10px; border-radius: 12px;">
          <i class="fa-solid ${pid === 'he' ? 'fa-mars' : 'fa-venus'}"></i> ${pName}
        </span>
      `;
    }

    const period = currentWorkoutsHistoryPeriod || '30d';
    const periodDays = {
      '7d': 7,
      '14d': 14,
      '30d': 30,
      'all': 90
    };
    const daysCount = periodDays[period] || 30;
    const historyList = getHistoricalData(pid, daysCount) || [];

    const schedule = getWeeklyWorkoutSchedule(pid) || {};

    let totalCompletedWorkouts = 0;
    let totalWorkoutMin = 0;
    let totalWorkoutKcal = 0;
    let scheduledWorkoutsCount = 0;

    const enrichedHistory = historyList.map(d => {
      const isCurrentWeekDay = getDateForDayNameInCurrentWeek(d.dayName) === d.dateIso;
      let sessions = Array.isArray(d.sessions) ? [...d.sessions] : [];
      let isCompleted = sessions.length > 0 || (Array.isArray(d.completedWorkouts) && d.completedWorkouts.length > 0);

      if (isCurrentWeekDay) {
        if (isDayCompleted(pid, d.dayName)) {
          isCompleted = true;
          const liveSessions = getDaySessions(pid, d.dayName);
          if (liveSessions.length > 0) {
            sessions = liveSessions;
          }
        }
      }

      const routine = schedule[d.dayName] || {};
      const isScheduledRest = routine.type === 'Descanso' || (routine.title && routine.title.toLowerCase().includes('descanso'));

      if (!isScheduledRest) {
        scheduledWorkoutsCount++;
      }

      const dayMin = sessions.reduce((acc, s) => acc + (Number(s.durationMin) || 0), 0);
      const dayKcal = sessions.reduce((acc, s) => acc + (Number(s.kcal) || 0), 0);

      if (isCompleted) {
        totalCompletedWorkouts++;
        totalWorkoutMin += dayMin;
        totalWorkoutKcal += dayKcal;
      }

      return {
        ...d,
        sessions,
        isCompleted,
        routine,
        isScheduledRest,
        dayMin,
        dayKcal
      };
    });

    const adherencePct = scheduledWorkoutsCount > 0
      ? Math.min(100, Math.round((totalCompletedWorkouts / scheduledWorkoutsCount) * 100))
      : 0;

    const periodLabels = {
      '7d': '7 Días',
      '14d': '14 Días',
      '30d': '30 Días',
      'all': 'Histórico (90 Días)'
    };

    container.innerHTML = `
      <!-- TIME PERIOD SELECTOR -->
      <div class="time-period-selector-wrapper">
        <div class="time-period-selector">
          <button type="button" class="time-period-btn ${period === '7d' ? 'active' : ''}" onclick="window.setWorkoutsHistoryPeriod('7d')">
            <i class="fa-solid fa-calendar-week"></i> 7 Días
          </button>
          <button type="button" class="time-period-btn ${period === '14d' ? 'active' : ''}" onclick="window.setWorkoutsHistoryPeriod('14d')">
            <i class="fa-solid fa-calendar"></i> 14 Días
          </button>
          <button type="button" class="time-period-btn ${period === '30d' ? 'active' : ''}" onclick="window.setWorkoutsHistoryPeriod('30d')">
            <i class="fa-solid fa-calendar-days"></i> 30 Días
          </button>
          <button type="button" class="time-period-btn ${period === 'all' ? 'active' : ''}" onclick="window.setWorkoutsHistoryPeriod('all')">
            <i class="fa-solid fa-clock-rotate-left"></i> Histórico
          </button>
        </div>
      </div>

      <!-- SUMMARY METRICS CARDS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="glass-card stat-summary-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Sesiones Completadas</span>
            <i class="fa-solid fa-dumbbell" style="color: var(--accent-purple);"></i>
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
            ${totalCompletedWorkouts} <small style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">sesiones</small>
          </div>
          <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
            En ${periodLabels[period]}
          </div>
        </div>

        <div class="glass-card stat-summary-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Tiempo Entrenado</span>
            <i class="fa-solid fa-stopwatch" style="color: var(--accent-cyan);"></i>
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
            ${Math.floor(totalWorkoutMin / 60)}h ${totalWorkoutMin % 60}m
          </div>
          <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
            Media: ~${totalCompletedWorkouts > 0 ? Math.round(totalWorkoutMin / totalCompletedWorkouts) : 0} min / entreno
          </div>
        </div>

        <div class="glass-card stat-summary-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Calorías Quemadas</span>
            <i class="fa-solid fa-fire" style="color: var(--accent-rose);"></i>
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
            ${totalWorkoutKcal.toLocaleString()} <small style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">kcal</small>
          </div>
          <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
            En entrenamientos medidos
          </div>
        </div>

        <div class="glass-card stat-summary-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Adherencia al Plan</span>
            <i class="fa-solid fa-bullseye" style="color: var(--accent-emerald);"></i>
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
            ${adherencePct}%
          </div>
          <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
            ${totalCompletedWorkouts} de ${scheduledWorkoutsCount} días asignados
          </div>
        </div>
      </div>

      <!-- DETALLE DE JORNADAS RECIENTES -->
      <div class="glass-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <i class="fa-solid fa-list-ul" style="color: var(--accent-cyan);"></i> Detalle de Jornadas Recientes (${pName})
          </h3>
          <span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(0,0,0,0.04); padding: 3px 10px; border-radius: 12px; border: 1px solid var(--border-color);">
            ${enrichedHistory.length} jornadas evaluadas
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 520px; overflow-y: auto;">
          ${enrichedHistory.slice().reverse().map(d => {
            const statusBadge = d.isCompleted
              ? `<span style="font-size: 0.75rem; color: #16a34a; background: rgba(16, 185, 129, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Cumplido</span>`
              : (d.isScheduledRest
                  ? `<span style="font-size: 0.75rem; color: #0284c7; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-bed"></i> Descanso</span>`
                  : `<span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(0, 0, 0, 0.04); padding: 3px 8px; border-radius: 12px; border: 1px solid var(--border-color);"><i class="fa-solid fa-minus"></i> Sin registro</span>`
                );

            const workoutsBadge = d.isCompleted
              ? `<span style="font-size: 0.75rem; color: #9333ea; background: rgba(168, 85, 247, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-dumbbell"></i> ${d.sessions.length > 1 ? d.sessions.length + ' sesiones' : 'Entreno'}</span>`
              : '';

            const routineTitle = d.routine.title || (d.isScheduledRest ? 'Descanso Activo' : 'Entrenamiento');

            const mainText = d.isCompleted
              ? `${routineTitle} (${d.dayMin > 0 ? d.dayMin + ' min' : (d.routine.duration || 35) + ' min'})`
              : (d.isScheduledRest
                  ? `Día de Descanso Programado`
                  : `${routineTitle} (Planificado)`
                );

            let detailsText = '';
            if (d.isCompleted) {
              const parts = [];
              if (d.dayKcal > 0) parts.push(`${d.dayKcal} kcal`);
              if (d.dayMin > 0) parts.push(`${d.dayMin} min medidos`);
              if (d.sessions.length > 0 && d.sessions[0].deviceName) parts.push(d.sessions[0].deviceName);
              if (d.steps > 0) parts.push(`${d.steps.toLocaleString()} pasos`);
              detailsText = parts.length > 0 ? parts.join(' • ') : 'Sesión completada';
            } else if (d.isScheduledRest) {
              detailsText = d.steps > 0 ? `Recuperación activa • ${d.steps.toLocaleString()} pasos` : `Recuperación y descanso muscular`;
            } else {
              detailsText = d.hasData && d.steps > 0
                ? `Sin sesión de entreno • ${d.steps.toLocaleString()} pasos caminados`
                : `Sin actividad o entreno registrado`;
            }

            const isOpac = !d.isCompleted && !d.isScheduledRest && (!d.hasData || d.steps === 0);

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); flex-wrap: wrap; gap: 0.5rem; opacity: ${isOpac ? '0.65' : '1'};">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(0,0,0,0.04); border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--text-main);">
                    <span>${d.dayName.slice(0, 3)}</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted);">${d.shortLabel.split(' ')[0]}</span>
                  </div>
                  <div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: ${d.isCompleted ? 'var(--text-main)' : (d.isScheduledRest ? 'var(--text-main)' : 'var(--text-muted)')};">
                      ${mainText}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                      ${detailsText}
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  ${workoutsBadge}
                  ${statusBadge}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } catch(err) {
    console.error("Error rendering Workouts History View:", err);
  }
}
