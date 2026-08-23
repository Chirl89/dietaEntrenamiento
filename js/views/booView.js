/**
 * FitDuo & Collie Coach - Boo Dog Training View Module (v0.14.0)
 * Isolated Tab: Módulos de Adiestramiento de Boo, Hábitos Continuos, Trucos & Notas.
 */

import { appState, saveState, getTodayDayName, triggerHapticTouch, showIosToast } from '../state.js';
import { BOO_TRAINING_MODULES, BOO_WEEKLY_SCHEDULE, BOO_CONTINUOUS_REINFORCEMENT, BOO_TRICKS_BACKLOG } from '../../data.js';

export function selectBooDayFromDropdown(dayName) {
  try {
    triggerHapticTouch();
    appState.activeBooDay = dayName;
    renderBooWorkoutView();
  } catch(e) {
    console.error("Error selecting Boo day:", e);
  }
}

export function toggleBooTask(taskId, dayName) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.completedTasks) appState.booProgress.completedTasks = {};
    const current = !!appState.booProgress.completedTasks[taskId];
    appState.booProgress.completedTasks[taskId] = !current;
    saveState();
    renderBooWorkoutView();
    showIosToast(!current ? "🐾 ¡Ejercicio de Boo registrado!" : "Ejercicio desmarcado", "fa-solid fa-paw");
  } catch(e) {
    console.error("Error toggling Boo task:", e);
  }
}

export function setBooMood(dayName, mood) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.moodLogs) appState.booProgress.moodLogs = {};
    appState.booProgress.moodLogs[dayName] = mood;
    saveState();
    renderBooWorkoutView();
    showIosToast(`Estado de Boo guardado: ${mood}`, "fa-solid fa-face-smile-wink");
  } catch(e) {
    console.error("Error setting Boo mood:", e);
  }
}

export function saveBooSessionNotes(dayName) {
  try {
    triggerHapticTouch();
    const input = document.getElementById("boo-session-note-input");
    if (!input) return;
    const note = input.value.trim();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.sessionNotes) appState.booProgress.sessionNotes = {};
    appState.booProgress.sessionNotes[dayName] = note;
    saveState();
    showIosToast("📝 Nota del paseo guardada", "fa-solid fa-floppy-disk");
  } catch(e) {
    console.error("Error saving Boo notes:", e);
  }
}

export function markBooModulePracticed(moduleId) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.moduleStats) appState.booProgress.moduleStats = {};
    const count = (appState.booProgress.moduleStats[moduleId] || 0) + 1;
    appState.booProgress.moduleStats[moduleId] = count;
    saveState();
    renderBooWorkoutView();
    showIosToast(`🐾 ¡Módulo practicado! Total: ${count} sesiones`, "fa-solid fa-paw");
  } catch(e) {
    console.error("Error marking Boo module practiced:", e);
  }
}

export function toggleContinuousItem(itemId, dayName) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.completedContinuous) appState.booProgress.completedContinuous = {};
    const key = `${dayName}_${itemId}`;
    const current = !!appState.booProgress.completedContinuous[key];
    appState.booProgress.completedContinuous[key] = !current;
    saveState();
    renderBooWorkoutView();
    showIosToast(!current ? "🐾 ¡Hábito de Boo reforzado hoy!" : "Desmarcado", "fa-solid fa-paw");
  } catch(e) {
    console.error("Error toggling continuous item:", e);
  }
}

export function markTrickMastered(trickId) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.learnedTricks) appState.booProgress.learnedTricks = [];
    if (!appState.booProgress.learnedTricks.includes(trickId)) {
      appState.booProgress.learnedTricks.push(trickId);
    }
    const nextTrick = (BOO_TRICKS_BACKLOG || []).find(t => !appState.booProgress.learnedTricks.includes(t.id));
    appState.booProgress.activeTrickId = nextTrick ? nextTrick.id : null;

    saveState();
    renderBooWorkoutView();
    showIosToast("🎉 ¡Enhorabuena! Boo ha dominado un nuevo truco. Desbloqueado el siguiente.", "fa-solid fa-trophy");
  } catch(e) {
    console.error("Error marking trick mastered:", e);
  }
}

export function selectActiveTrickFromBacklog(trickId) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    appState.booProgress.activeTrickId = trickId;
    saveState();
    renderBooWorkoutView();
    showIosToast("🎯 Truco seleccionado para trabajar hoy.", "fa-solid fa-bullseye");
  } catch(e) {
    console.error("Error selecting active trick:", e);
  }
}

export function toggleBooAccordion(accordionId) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.accordions) appState.booProgress.accordions = {};
    const current = !!appState.booProgress.accordions[accordionId];
    appState.booProgress.accordions[accordionId] = !current;
    saveState();
    renderBooWorkoutView();
  } catch(e) {
    console.error("Error toggling Boo accordion:", e);
  }
}

export function openBooBacklogModal() {
  try {
    triggerHapticTouch();
    const modal = document.getElementById("boo-backlog-modal");
    if (modal) {
      renderBooBacklogModalUI();
      modal.classList.add("active");
    }
  } catch(e) {
    console.error("Error opening Boo backlog modal:", e);
  }
}

export function closeBooBacklogModal() {
  try {
    triggerHapticTouch();
    const modal = document.getElementById("boo-backlog-modal");
    if (modal) modal.classList.remove("active");
  } catch(e) {
    console.error("Error closing Boo backlog modal:", e);
  }
}

export function closeBooBacklogModalOnBackdrop(e) {
  if (e && e.target && e.target.id === "boo-backlog-modal") {
    closeBooBacklogModal();
  }
}

export function renderBooBacklogModalUI() {
  try {
    const container = document.getElementById("boo-backlog-modal-content");
    if (!container) return;

    const learned = appState.booProgress?.learnedTricks || [];
    const activeId = appState.booProgress?.activeTrickId || (BOO_TRICKS_BACKLOG && BOO_TRICKS_BACKLOG[0] ? BOO_TRICKS_BACKLOG[0].id : null);

    const categories = {
      mental: { label: "Estimulación Mental & Olfato", icon: "fa-solid fa-brain", color: "var(--accent-cyan)", items: [] },
      agility: { label: "Habilidades Motoras & Agility", icon: "fa-solid fa-person-running", color: "var(--accent-emerald)", items: [] },
      selfcontrol: { label: "Autocontrol & Calma", icon: "fa-solid fa-heart-pulse", color: "var(--accent-purple)", items: [] },
      advanced: { label: "Trucos Avanzados", icon: "fa-solid fa-wand-magic-sparkles", color: "var(--accent-amber)", items: [] }
    };

    const categoryMap = {
      mental: "mental",
      "Estimulación Mental & Olfato": "mental",
      "Cobro y Juego": "mental",
      "Adiestramiento con Marca": "mental",
      agility: "agility",
      "Habilidades Motoras & Agility": "agility",
      "Habilidad Básica": "agility",
      "Propiocepción & Juego": "agility",
      "Agilidad": "agility",
      selfcontrol: "selfcontrol",
      "Autocontrol & Calma": "selfcontrol",
      "Gestión Emocional": "selfcontrol",
      "Autocontrol Emocional": "selfcontrol",
      "Obediencia Avanzada": "selfcontrol",
      "Obediencia y Vínculo": "selfcontrol",
      "Paseo Estructurado": "selfcontrol",
      advanced: "advanced",
      "Trucos Avanzados": "advanced",
      "Truco Divertido": "advanced"
    };

    (BOO_TRICKS_BACKLOG || []).forEach(trick => {
      const catKey = categoryMap[trick.category] || (categories[trick.category] ? trick.category : "advanced");
      if (categories[catKey]) {
        categories[catKey].items.push(trick);
      } else {
        categories.advanced.items.push(trick);
      }
    });

    let html = `
      <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 0.82rem; color: var(--text-muted);">Progreso de Trucos Dominados</span>
          <div style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--accent-amber); font-weight: 700;">
            ${learned.length} de ${(BOO_TRICKS_BACKLOG || []).length} Trucos Dominados (${Math.round((learned.length / ((BOO_TRICKS_BACKLOG || []).length || 1)) * 100)}%)
          </div>
        </div>
        <div style="font-size: 2rem;">🏆</div>
      </div>
    `;

    Object.values(categories).forEach(cat => {
      if (cat.items.length === 0) return;

      html += `
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: ${cat.color}; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.45rem;">
            <i class="${cat.icon}"></i> ${cat.label}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      `;

      cat.items.forEach(item => {
        const isMastered = learned.includes(item.id);
        const isActive = activeId === item.id;
        const trickDesc = item.desc || item.summary || "";
        const trickDiff = item.difficulty || "Básico";

        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isActive ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isActive ? 'var(--accent-amber)' : 'var(--border-color)'}; padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.82rem;">
            <div>
              <div style="font-weight: 600; color: ${isMastered ? 'var(--accent-emerald)' : (isActive ? 'var(--accent-amber)' : 'var(--text-main)')}; display: flex; align-items: center; gap: 0.4rem;">
                ${isMastered ? '<i class="fa-solid fa-circle-check"></i>' : (isActive ? '<i class="fa-solid fa-bullseye"></i>' : '<i class="fa-regular fa-circle"></i>')}
                ${item.title}
                <span style="font-size: 0.7rem; font-weight: normal; color: var(--text-muted); padding: 1px 6px; border-radius: 4px; background: rgba(0,0,0,0.3);">${trickDiff}</span>
              </div>
              ${trickDesc ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${trickDesc}</div>` : ''}
            </div>
            <div style="display: flex; gap: 0.4rem;">
              ${!isMastered ? `
                <button type="button" class="btn-secondary-sm" onclick="selectActiveTrickFromBacklog('${item.id}'); closeBooBacklogModal();" style="font-size: 0.72rem; padding: 4px 8px; ${isActive ? 'background: var(--accent-amber); color: #000; font-weight: 700;' : ''}">
                  ${isActive ? 'En Curso' : 'Trabajar'}
                </button>
                <button type="button" class="btn-secondary-sm" onclick="markTrickMastered('${item.id}'); renderBooBacklogModalUI();" style="font-size: 0.72rem; padding: 4px 8px; background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); border-color: rgba(16, 185, 129, 0.4);">
                  Dominado
                </button>
              ` : `
                <span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-check-double"></i> Dominado</span>
              `}
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch(e) {
    console.error("Error rendering Boo backlog modal UI:", e);
  }
}

export function renderBooWorkoutView() {
  try {
    const container = document.getElementById("boo-workout-container");
    if (!container) return;
    container.innerHTML = "";

    const activeDay = appState.activeBooDay || getTodayDayName();

    const selectElem = document.getElementById("boo-day-select");
    if (selectElem && selectElem.value !== activeDay) {
      selectElem.value = activeDay;
    }

    const dayPlan = (BOO_WEEKLY_SCHEDULE || {})[activeDay] || (BOO_WEEKLY_SCHEDULE && BOO_WEEKLY_SCHEDULE["Lunes"]) || {
      theme: "Autocontrol Emocional & Correa Relajada",
      focusTitle: "Lunes: Autocontrol Emocional & Correa Relajada",
      focusText: "Gestión de impulsos con pelota y técnicas de paseo en calma sin tirones",
      dailyTasks: [
        { id: "b_lun_1", title: "Autocontrol con Pelota", detail: "10 min de espera y quieto con pelota antes del lanzamiento", duration: "10 min" },
        { id: "b_lun_2", title: "Paseo Sin Tirones", detail: "20 min de paseo con técnica de estatua (parar al sentir tensión)", duration: "20 min" },
        { id: "b_lun_3", title: "Refuerzo Positivo de Llamada", detail: "5 llamadas intermedias con premio y soltado inmediato", duration: "Paseo" }
      ]
    };

    const themeTitle = dayPlan.theme || dayPlan.focusTitle || `Plan de Adiestramiento • ${activeDay}`;
    const focusDescription = dayPlan.focusText || dayPlan.summary || dayPlan.focus || 'Enfoque en calma, autocontrol y comunicación con correa floja';
    const rawTasks = Array.isArray(dayPlan.dailyTasks) && dayPlan.dailyTasks.length > 0
      ? dayPlan.dailyTasks
      : (Array.isArray(dayPlan.tasks) ? dayPlan.tasks : []);

    const learnedTricks = appState.booProgress?.learnedTricks || [];
    const activeTrickId = appState.booProgress?.activeTrickId || (BOO_TRICKS_BACKLOG && BOO_TRICKS_BACKLOG[0] ? BOO_TRICKS_BACKLOG[0].id : null);
    const activeTrick = (BOO_TRICKS_BACKLOG || []).find(t => t.id === activeTrickId) || (BOO_TRICKS_BACKLOG && BOO_TRICKS_BACKLOG[0]) || { id: "trick_default", title: "Contacto Visual", desc: "Mirar a los ojos a la orden 'Mírame'", summary: "Mirar a los ojos a la orden 'Mírame'" };

    let html = `
      <div class="glass-card" style="margin-bottom: 1.25rem; border-left: 4px solid var(--accent-amber);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.85rem;">
          <div>
            <div style="font-size: 0.8rem; color: var(--accent-amber); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              Plan de Adiestramiento • ${activeDay}
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--text-main); margin-top: 2px;">
              🐾 ${themeTitle}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.83rem; margin-top: 2px;">
              ${focusDescription}
            </p>
          </div>
          <button type="button" class="btn-secondary-sm" onclick="openBooBacklogModal()" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; padding: 0.5rem 0.9rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);">
            <i class="fa-solid fa-map"></i> Mapa de Trucos (${learnedTricks.length}/${(BOO_TRICKS_BACKLOG || []).length})
          </button>
        </div>

        <div style="background: rgba(0,0,0,0.15); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
          <div style="font-weight: 700; font-size: 0.88rem; color: var(--accent-amber); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-bullseye"></i> Truco Activo en Desarrollo: <strong>${activeTrick.title || 'Truco'}</strong>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem;">
            ${activeTrick.desc || activeTrick.summary || ''}
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn-primary" onclick="markTrickMastered('${activeTrick.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 6px; color: #fff; cursor: pointer;">
              <i class="fa-solid fa-check"></i> Marcar Truco como Dominado
            </button>
            <button type="button" class="btn-secondary-sm" onclick="openBooBacklogModal()" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 6px;">
              <i class="fa-solid fa-list"></i> Elegir otro del catálogo
            </button>
          </div>
        </div>

        <div style="margin-top: 0.85rem;">
          <h4 style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-list-check" style="color: var(--accent-cyan);"></i> Ejercicios Específicos de Hoy:
          </h4>
          <div style="display: flex; flex-direction: column; gap: 0.45rem;">
            ${rawTasks.map((t, idx) => {
              const taskId = t.id || `task_${idx}`;
              const isChecked = !!appState.booProgress?.completedTasks?.[`${activeDay}_${taskId}`];
              const taskTitle = t.title || t.text || `Ejercicio ${idx + 1}`;
              const taskDetail = t.detail || (t.duration ? `Duración: ${t.duration}` : '');
              return `
                <div style="display: flex; align-items: flex-start; gap: 0.6rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 0.65rem 0.85rem; border-radius: 8px; cursor: pointer;" onclick="toggleBooTask('${activeDay}_${taskId}', '${activeDay}')">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-top: 3px; cursor: pointer;" onclick="event.stopPropagation(); toggleBooTask('${activeDay}_${taskId}', '${activeDay}')">
                  <div style="flex: 1;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: ${isChecked ? 'var(--text-muted)' : 'var(--text-main)'}; text-decoration: ${isChecked ? 'line-through' : 'none'};">
                      ${taskTitle}
                    </div>
                    ${taskDetail ? `
                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 1px;">
                      ${taskDetail}
                    </div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="glass-card" style="margin-bottom: 1.25rem;">
        <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--accent-cyan); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid fa-repeat"></i> Hábitos de Refuerzo Continuo en el Paseo
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          Rutinas clave que Carlos y Andrea deben aplicar en cada salida para mantener a Boo calmada y equilibrada.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.65rem;">
          ${(BOO_CONTINUOUS_REINFORCEMENT || []).map((item, idx) => {
            const itemId = item.id || `cont_${idx}`;
            const isChecked = !!appState.booProgress?.completedContinuous?.[`${activeDay}_${itemId}`];
            return `
              <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 8px; display: flex; gap: 0.6rem; align-items: flex-start; cursor: pointer;" onclick="toggleContinuousItem('${itemId}', '${activeDay}')">
                <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-top: 3px; cursor: pointer;" onclick="event.stopPropagation(); toggleContinuousItem('${itemId}', '${activeDay}')">
                <div>
                  <div style="font-size: 0.84rem; font-weight: 600; color: ${isChecked ? 'var(--accent-emerald)' : 'var(--text-main)'};">
                    ${item.title || ''}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                    ${item.desc || item.detail || ''}
                  </div>
                  ${item.tip ? `<div style="font-size: 0.72rem; color: var(--accent-amber); margin-top: 3px;"><i class="fa-solid fa-lightbulb"></i> ${item.tip}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch(e) {
    console.error("Error rendering Boo Workout View:", e);
  }
}
