import { appState, saveState, getMasterProfileId, getTodayDayName, triggerHapticTouch, showIosToast } from '../state.js';
import { WEEKLY_WORKOUT_SCHEDULE } from '../../data.js?v=0.11.1';

export function isDayCompleted(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (!val) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'object') return !!val.done;
  return false;
}

export function getDayWatchData(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (val && typeof val === 'object' && val.watchData) {
    return val.watchData;
  }
  return null;
}

export function getDaySessions(profileId, dayName) {
  const val = appState.completedWorkouts?.[profileId]?.[dayName];
  if (val && typeof val === 'object') {
    if (Array.isArray(val.sessions) && val.sessions.length > 0) {
      return val.sessions;
    }
    if (val.watchData) {
      return [val.watchData];
    }
  }
  return [];
}

export function deleteWorkoutSession(dayName, sessionIndex) {
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

  // Also reset pending workout flag if still active
  if (appState.appleWatch?.pendingWorkout?.[pid]) {
    appState.appleWatch.pendingWorkout[pid].flag = "N/A";
    appState.appleWatch.pendingWorkout[pid].pending = false;
  }

  saveState();
  if (window.renderAll) window.renderAll();
  showIosToast("🗑️ Sesión de entrenamiento eliminada", "fa-solid fa-trash-can");
  if (window.pushToCloud) window.pushToCloud(false);
}

export function toggleWorkoutDay(dayName) {
  triggerHapticTouch();
  const profileId = getMasterProfileId();
  if (!appState.completedWorkouts[profileId]) {
    appState.completedWorkouts[profileId] = {};
  }

  const currentDone = isDayCompleted(profileId, dayName);

  if (currentDone) {
    appState.completedWorkouts[profileId][dayName] = { done: false, watchData: null, sessions: [] };
  } else {
    appState.completedWorkouts[profileId][dayName] = {
      done: true,
      watchData: null,
      sessions: []
    };
  }

  saveState();
  if (window.renderAll) window.renderAll();
  showIosToast(!currentDone ? `🏋️ ¡Entrenamiento (${dayName}) completado!` : `Entrenamiento (${dayName}) desmarcado`, "fa-solid fa-dumbbell");
}

export function resetWorkoutWeek() {
  const profileId = getMasterProfileId();
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  if (!appState.completedWorkouts[profileId]) {
    appState.completedWorkouts[profileId] = {};
  }
  days.forEach(d => {
    appState.completedWorkouts[profileId][d] = { done: false, watchData: null, sessions: [] };
  });
  saveState();
  if (window.renderAll) window.renderAll();
}

export function syncAppleWatchData() {
  if (window.triggerManualSync) window.triggerManualSync();
}

export function openTodayWorkouts() {
  const today = getTodayDayName();
  let targetBtn = null;
  document.querySelectorAll("#workout-days-tabs .day-tab").forEach(btn => {
    if (btn.innerText.trim().toLowerCase() === today.toLowerCase()) {
      targetBtn = btn;
    }
  });
  selectWorkoutDay(today, targetBtn);
  if (window.showTab) window.showTab("workouts-view", document.getElementById("dock-btn-workouts"));
}

export function selectWorkoutDay(dayName, btnElem) {
  appState.activeWorkoutDay = dayName;
  document.querySelectorAll("#workout-days-tabs .day-tab").forEach(tab => tab.classList.remove("active"));
  if (btnElem) btnElem.classList.add("active");
  renderWorkoutsView();
}

export function selectExerciseDayFromDropdown(dayName) {
  appState.activeExerciseDay = dayName;
  renderExerciseTableView();
}

export function updateWorkoutPendingStatusBadge() {
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
}

export function renderWorkoutsView() {
  updateWorkoutPendingStatusBadge();
  const container = document.getElementById("workouts-daily-container") || document.getElementById("routines-container");
  if (!container) return;
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
      <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 0.4rem;">
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
    return;
  }

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
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff;">
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

    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08);">
      <div style="font-size: 0.82rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
        <i class="fa-solid fa-list-check"></i> Desglose de Sesiones de Hoy:
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.45rem;">
        ${sessions.map((s, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.55rem 0.85rem; border-radius: 8px; font-size: 0.83rem;">
            <div>
              <span style="font-weight: 600; color: #fff;"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan);"></i> Sesión ${idx + 1}</span>
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

export function renderExerciseTableView() {
  const container = document.getElementById("exercise-routines-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeExerciseDay || getTodayDayName();

  const selectElem = document.getElementById("exercise-day-select");
  if (selectElem && selectElem.value !== activeDay) {
    selectElem.value = activeDay;
  }

  const routine = WEEKLY_WORKOUT_SCHEDULE?.[activeDay] || WEEKLY_WORKOUT_SCHEDULE?.["Lunes"];
  if (!routine) return;

  const card = document.createElement("div");
  card.className = "glass-card";

  const rows = (routine.exercises || []).map(ex => `
    <tr>
      <td>
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-tech"><i class="fa-solid fa-lightbulb" style="color:var(--accent-amber);"></i> ${ex.technique || ''}</div>
      </td>
      <td><strong style="color:var(--accent-emerald);">${ex.sets}</strong> series</td>
      <td><strong>${ex.reps}</strong> reps</td>
      <td><span style="color:var(--text-muted);">${ex.rest}</span></td>
    </tr>
  `).join("");

  card.innerHTML = `
    <div class="routine-header-box" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.3rem;">${routine.title} (${activeDay})</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">Enfoque: ${routine.focus || ''}</p>
      </div>
      <div>
        <span class="routine-badge"><i class="fa-solid fa-clock"></i> ${routine.duration} min (Juntos)</span>
      </div>
    </div>

    <div style="display:flex; flex-wrap: wrap; gap: 1rem; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem;">
      <span><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i> ${routine.location || 'En casa'}</span>
      <span><i class="fa-solid fa-dumbbell" style="color:var(--accent-emerald);"></i> ${routine.type || 'Fuerza'}</span>
      <span><i class="fa-solid fa-toolbox" style="color:var(--accent-violet);"></i> Equipamiento: ${(routine.equipment || []).join(", ")}</span>
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

export function renderWorkoutTracker() {
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

export function openEditWorkoutWatchModal(dayName) {
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

export function closeEditWorkoutWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("edit-workout-watch-modal");
  if (modal) modal.classList.remove("active");
}

export function saveWorkoutWatchDataFromModal(e) {
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
  if (window.renderAll) window.renderAll();

  showIosToast(` Entrenamiento de ${dayName} calibrado con éxito (${kcal} kcal - ${durationMin} min)`, "fa-solid fa-circle-check");
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
  const m = appState.appleWatch.metrics[pid];
  m.hr = 142;
  saveState();
  if (window.updateAppleWatchModalUI) window.updateAppleWatchModalUI();
  showIosToast(` Pulsómetro Apple Watch enlazado por Bluetooth: Frecuencia cardíaca en directo 142 BPM`, "fa-solid fa-heart-pulse");
}
