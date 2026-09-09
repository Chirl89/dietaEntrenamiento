/**
 * FitDuo & Collie Coach - Boo Dog Training View Module
 * Specialized Tabs: Foco & Autocontrol con Pelotas (Comandos Innegociables & Parque),
 * Plan Diario de Paseo, Biblioteca de Módulos de Adiestramiento, y Catálogo de Habilidades.
 */

import { appState, saveState, getTodayDayName, triggerHapticTouch, showIosToast } from '../state.js';
import {
  BOO_TRAINING_MODULES,
  BOO_FOCUS_AND_BALLS_PROGRAM,
  BOO_IMPULSE_CONTROL_PROGRAM,
  BOO_WEEKLY_SCHEDULE,
  BOO_CONTINUOUS_REINFORCEMENT,
  BOO_TRICKS_BACKLOG
} from '../../data.js';

export function setBooSubTab(subTabName) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    appState.booProgress.activeSubTab = subTabName;
    saveState();
    renderBooWorkoutView();
  } catch(e) {
    console.error("Error setting Boo subtab:", e);
  }
}

export function toggleBooProgramStep(stepId) {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    if (!appState.booProgress.completedProgramSteps) appState.booProgress.completedProgramSteps = {};
    const current = !!appState.booProgress.completedProgramSteps[stepId];
    appState.booProgress.completedProgramSteps[stepId] = !current;
    saveState();
    renderBooWorkoutView();
    showIosToast(!current ? "🎯 ¡Paso del programa superado!" : "Paso desmarcado", "fa-solid fa-circle-check");
  } catch(e) {
    console.error("Error toggling Boo program step:", e);
  }
}

export function toggleBooSosCard() {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    appState.booProgress.sosExpanded = !appState.booProgress.sosExpanded;
    saveState();
    renderBooWorkoutView();
  } catch(e) {
    console.error("Error toggling Boo SOS card:", e);
  }
}

export function toggleBooWhyCard() {
  try {
    triggerHapticTouch();
    if (!appState.booProgress) appState.booProgress = {};
    appState.booProgress.whyExpanded = !appState.booProgress.whyExpanded;
    saveState();
    renderBooWorkoutView();
  } catch(e) {
    console.error("Error toggling Boo Why card:", e);
  }
}

export function saveBooDistractionLog() {
  try {
    triggerHapticTouch();
    const stimulusEl = document.getElementById("boo-log-stimulus");
    const levelEl = document.getElementById("boo-log-level");
    const outcomeEl = document.getElementById("boo-log-outcome");
    const notesEl = document.getElementById("boo-log-notes");

    if (!stimulusEl || !levelEl || !outcomeEl) return;
    const stimulus = stimulusEl.value;
    const level = levelEl.value;
    const outcome = outcomeEl.value;
    const notes = notesEl ? notesEl.value.trim() : "";

    if (!appState.booProgress) appState.booProgress = {};
    if (!Array.isArray(appState.booProgress.distractionLogs)) {
      appState.booProgress.distractionLogs = [];
    }

    const todayStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    appState.booProgress.distractionLogs.unshift({
      date: todayStr,
      timestamp: Date.now(),
      stimulus,
      level,
      outcome,
      notes
    });

    if (appState.booProgress.distractionLogs.length > 25) {
      appState.booProgress.distractionLogs = appState.booProgress.distractionLogs.slice(0, 25);
    }

    saveState();
    renderBooWorkoutView();
    showIosToast("📝 Sesión de distracción registrada con éxito", "fa-solid fa-clipboard-check");
  } catch(e) {
    console.error("Error saving Boo distraction log:", e);
  }
}

export function deleteBooDistractionLog(index) {
  try {
    triggerHapticTouch();
    if (appState.booProgress && Array.isArray(appState.booProgress.distractionLogs)) {
      appState.booProgress.distractionLogs.splice(index, 1);
      saveState();
      renderBooWorkoutView();
      showIosToast("Registro eliminado", "fa-solid fa-trash");
    }
  } catch(e) {
    console.error("Error deleting Boo distraction log:", e);
  }
}

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

    const activeSubTab = appState.booProgress?.activeSubTab || "impulse";
    const activeDay = appState.activeBooDay || getTodayDayName();

    // Toggle header day selector visibility based on active subtab
    const daySelectorHeader = document.querySelector(".nutrition-day-selector-card:has(#boo-day-select)");
    if (daySelectorHeader) {
      daySelectorHeader.style.display = activeSubTab === 'daily' ? 'block' : 'none';
    }

    const selectElem = document.getElementById("boo-day-select");
    if (selectElem && selectElem.value !== activeDay) {
      selectElem.value = activeDay;
    }

    // Top Subtab Navigation Bar
    let html = `
      <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.75rem; margin-bottom: 1.25rem; -webkit-overflow-scrolling: touch;">
        <button type="button" class="btn-secondary-sm" onclick="setBooSubTab('impulse')" style="padding: 0.6rem 1rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; ${activeSubTab === 'impulse' ? 'background: linear-gradient(135deg, #10b981, #059669); color: #fff; border-color: #10b981; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);' : 'background: rgba(255,255,255,0.04); color: var(--text-muted);'}">
          <i class="fa-solid fa-baseball"></i> Foco & Pelotas
          <span style="font-size: 0.68rem; padding: 1px 6px; border-radius: 10px; background: rgba(0,0,0,0.3); font-weight: 700;">Autocontrol</span>
        </button>
        <button type="button" class="btn-secondary-sm" onclick="setBooSubTab('daily')" style="padding: 0.6rem 1rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; ${activeSubTab === 'daily' ? 'background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border-color: #f59e0b; box-shadow: 0 2px 10px rgba(245, 158, 11, 0.35);' : 'background: rgba(255,255,255,0.04); color: var(--text-muted);'}">
          <i class="fa-solid fa-calendar-day"></i> Plan Diario (${activeDay})
        </button>
        <button type="button" class="btn-secondary-sm" onclick="setBooSubTab('modules')" style="padding: 0.6rem 1rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; ${activeSubTab === 'modules' ? 'background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; border-color: #06b6d4; box-shadow: 0 2px 10px rgba(6, 182, 212, 0.35);' : 'background: rgba(255,255,255,0.04); color: var(--text-muted);'}">
          <i class="fa-solid fa-book-open"></i> Biblioteca Módulos (${BOO_TRAINING_MODULES.length})
        </button>
        <button type="button" class="btn-secondary-sm" onclick="setBooSubTab('tricks')" style="padding: 0.6rem 1rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; ${activeSubTab === 'tricks' ? 'background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #fff; border-color: #8b5cf6; box-shadow: 0 2px 10px rgba(139, 92, 246, 0.35);' : 'background: rgba(255,255,255,0.04); color: var(--text-muted);'}">
          <i class="fa-solid fa-trophy"></i> Habilidades & Trucos
        </button>
      </div>
    `;

    // -------------------------------------------------------------
    // SUBTAB 1: ENFOQUE, AUTOCONTROL CON PELOTAS & COMANDOS INNEGOCIABLES
    // -------------------------------------------------------------
    if (activeSubTab === "impulse") {
      const prog = BOO_FOCUS_AND_BALLS_PROGRAM || BOO_IMPULSE_CONTROL_PROGRAM;
      const completedSteps = appState.booProgress?.completedProgramSteps || {};
      const allSteps = prog.phases.flatMap(p => p.steps);
      const totalSteps = allSteps.length;
      const doneCount = allSteps.filter(s => completedSteps[s.id]).length;
      const progressPercent = Math.round((doneCount / (totalSteps || 1)) * 100);
      const isSosExpanded = !!appState.booProgress?.sosExpanded;
      const isWhyExpanded = !!appState.booProgress?.whyExpanded;
      const distractionLogs = appState.booProgress?.distractionLogs || [];

      html += `
        <!-- OFF-LEASH WALK GUIDELINES QUICK ACTION -->
        <div class="glass-card" style="margin-bottom: 1.25rem; border-left: 4px solid var(--accent-emerald); background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(0,0,0,0.25));">
          <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleBooSosCard()">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);">
                <i class="fa-solid fa-baseball"></i>
              </div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-emerald); margin: 0;">
                  ${prog.sosProtocol.title}
                </h3>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin: 2px 0 0 0;">
                  Comando único innegociable, carrera inversa, parada en seco y gestión de la pelota
                </p>
              </div>
            </div>
            <button type="button" class="btn-secondary-sm" style="font-size: 0.8rem; padding: 4px 10px;">
              ${isSosExpanded ? '<i class="fa-solid fa-chevron-up"></i> Plegar' : '<i class="fa-solid fa-chevron-down"></i> Ver Pautas'}
            </button>
          </div>

          ${isSosExpanded ? `
            <div style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(16, 185, 129, 0.25); display: flex; flex-direction: column; gap: 0.65rem;">
              ${prog.sosProtocol.steps.map(s => `
                <div style="display: flex; gap: 0.6rem; align-items: flex-start; background: rgba(0,0,0,0.25); padding: 0.65rem 0.85rem; border-radius: 8px; border-left: 3px solid var(--accent-emerald);">
                  <span style="background: #10b981; color: #fff; font-weight: 700; font-size: 0.75rem; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                    ${s.step}
                  </span>
                  <div>
                    <div style="font-size: 0.82rem; font-weight: 700; color: #a7f3d0;">${s.title}</div>
                    <div style="font-size: 0.78rem; color: var(--text-main); margin-top: 2px;">${s.action}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- ETHOLOGICAL CONTEXT CARD -->
        <div class="glass-card" style="margin-bottom: 1.25rem; border-left: 4px solid var(--accent-cyan);">
          <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleBooWhyCard()">
            <div>
              <span style="font-size: 0.76rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                Psicología & Foco • Border Collie
              </span>
              <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--text-main); margin-top: 2px;">
                🧠 Concentración en el Parque & Autocontrol con Pelotas
              </h3>
            </div>
            <button type="button" class="btn-secondary-sm" style="font-size: 0.78rem;">
              ${isWhyExpanded ? '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-chevron-down"></i>'}
            </button>
          </div>

          ${isWhyExpanded ? `
            <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); font-size: 0.82rem; color: var(--text-muted); line-height: 1.55;">
              <p style="margin-bottom: 0.6rem;">${prog.whyItHappens}</p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.6rem; margin-top: 0.75rem;">
                ${prog.goldenRules.map(r => `
                  <div style="background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="font-weight: 700; font-size: 0.82rem; color: var(--accent-amber); margin-bottom: 3px;">
                      <i class="fa-solid fa-star"></i> ${r.title}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${r.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem;">
              Boo va siempre suelta y es muy obediente. Toca para ver las 3 claves para canalizar su instinto con pelotas y mantener el foco en vosotros.
            </p>
          `}
        </div>

        <!-- PROGRAM PROGRESS BAR -->
        <div class="glass-card" style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Progreso: Foco, Pelotas & Comandos Innegociables</span>
              <div style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: var(--accent-emerald);">
                ${doneCount} de ${totalSteps} Pasos Superados (${progressPercent}%)
              </div>
            </div>
            <div style="font-size: 1.8rem; color: ${progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">
              ${progressPercent === 100 ? '🏆' : '🎯'}
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.08); height: 10px; border-radius: 5px; overflow: hidden; position: relative;">
            <div style="background: linear-gradient(90deg, #06b6d4, #f59e0b, #10b981); width: ${progressPercent}%; height: 100%; border-radius: 5px; transition: width 0.4s ease;"></div>
          </div>
        </div>

        <!-- THE 4 PROGRESSIVE PHASES -->
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
          ${prog.phases.map(phase => {
            const phaseSteps = phase.steps;
            const phaseDone = phaseSteps.filter(s => completedSteps[s.id]).length;
            const isPhaseComplete = phaseDone === phaseSteps.length;

            return `
              <div class="glass-card" style="border-left: 4px solid ${phase.color};">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.6rem;">
                  <div>
                    <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: ${phase.color}; display: align-items: center; gap: 0.45rem; margin: 0;">
                      <i class="${phase.icon}"></i> ${phase.name}
                    </h3>
                    <p style="font-size: 0.77rem; color: var(--text-muted); margin: 2px 0 0 0;">
                      ${phase.objective}
                    </p>
                  </div>
                  <span style="font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; background: ${isPhaseComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)'}; color: ${isPhaseComplete ? 'var(--accent-emerald)' : 'var(--text-muted)'}; border: 1px solid ${isPhaseComplete ? 'rgba(16, 185, 129, 0.4)' : 'transparent'};">
                    ${phaseDone}/${phaseSteps.length} completados
                  </span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.75rem;">
                  ${phaseSteps.map(step => {
                    const isChecked = !!completedSteps[step.id];
                    return `
                      <div style="display: flex; align-items: flex-start; gap: 0.7rem; background: ${isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${isChecked ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}; padding: 0.75rem 0.85rem; border-radius: 8px; cursor: pointer; transition: var(--transition);" onclick="toggleBooProgramStep('${step.id}')">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-top: 3px; cursor: pointer;" onclick="event.stopPropagation(); toggleBooProgramStep('${step.id}')">
                        <div style="flex: 1;">
                          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.3rem;">
                            <span style="font-size: 0.85rem; font-weight: 700; color: ${isChecked ? 'var(--accent-emerald)' : 'var(--text-main)'}; text-decoration: ${isChecked ? 'line-through' : 'none'};">
                              ${step.title}
                            </span>
                            <span style="font-size: 0.68rem; font-weight: 600; padding: 1px 6px; border-radius: 4px; background: rgba(0,0,0,0.3); color: ${phase.color};">
                              ${step.tag}
                            </span>
                          </div>
                          <div style="font-size: 0.77rem; color: var(--text-muted); margin-top: 3px; line-height: 1.45;">
                            ${step.detail}
                          </div>
                          <div style="font-size: 0.73rem; color: var(--accent-amber); margin-top: 4px; display: flex; align-items: center; gap: 0.35rem;">
                            <i class="fa-solid fa-circle-check"></i> Criterio de éxito: <em>${step.criteria}</em>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- DISTRACTION SESSION LOGGING & TRACKER -->
        <div class="glass-card" style="margin-bottom: 1.25rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--accent-amber); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.45rem;">
            <i class="fa-solid fa-clipboard-list"></i> Registro de Sesiones con Distracción Real
          </h3>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.85rem;">
            Anotad cada paseo donde hayáis practicado el autocontrol con pelotas, el comando único o el foco entre perros para medir la evolución de Boo.
          </p>

          <div style="background: rgba(0,0,0,0.2); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.6rem;">
              <div>
                <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 2px;">Tipo de Estímulo:</label>
                <select id="boo-log-stimulus" class="custom-select" style="font-size: 0.78rem; padding: 6px;">
                  <option value="Pelota rodando (Autocontrol)">Pelota rodando (Autocontrol)</option>
                  <option value="Pelota ajena botando en parque">Pelota ajena botando en parque</option>
                  <option value="Parque con perros jugando">Parque con perros jugando</option>
                  <option value="Comando único innegociable">Comando único innegociable</option>
                  <option value="Detención rápida ('¡Stop!' / '¡Tierra!')">Detención rápida ('¡Stop!' / '¡Tierra!')</option>
                  <option value="Niños en parque / patinete">Niños en parque / patinete</option>
                  <option value="Corredores / Ciclistas monte">Corredores / Ciclistas monte</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 2px;">Intensidad de Distracción:</label>
                <select id="boo-log-level" class="custom-select" style="font-size: 0.78rem; padding: 6px;">
                  <option value="Media (15-25 metros)">Media (15-25 metros)</option>
                  <option value="Baja (> 30 metros)">Baja (> 30 metros)</option>
                  <option value="Alta (< 10 metros)">Alta (< 10 metros)</option>
                  <option value="Máxima (Sorpresa / Cruzó cerca)">Máxima (Sorpresa / Cruzó cerca)</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 2px;">Resultado / Respuesta:</label>
                <select id="boo-log-outcome" class="custom-select" style="font-size: 0.78rem; padding: 6px;">
                  <option value="⭐⭐⭐⭐⭐ Excelente (Desenganchó sola y miró)">⭐⭐⭐⭐⭐ Excelente (Desenganchó sola y miró)</option>
                  <option value="⭐⭐⭐⭐ Muy buena (Acudió al 1er aviso)">⭐⭐⭐⭐ Muy buena (Acudió al 1er aviso)</option>
                  <option value="⭐⭐⭐ Regular (Costó pero no persiguió)">⭐⭐⭐ Regular (Costó pero no persiguió)</option>
                  <option value="⭐⭐ Falló (Se sobreactivó; aumentar distancia)">⭐⭐ Falló (Se sobreactivó; aumentar distancia)</option>
                </select>
              </div>
            </div>

            <div>
              <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 2px;">Notas del Paseo (Premios usados, lugar, reacción de Carlos/Andrea):</label>
              <input type="text" id="boo-log-notes" placeholder="Ej: Usamos dados de pavo; desenganchó a la primera al ver la pelota ajena botar..." style="width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 10px; color: var(--text-main); font-size: 0.78rem;">
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="button" class="btn-primary" onclick="saveBooDistractionLog()" style="font-size: 0.78rem; padding: 0.45rem 1rem; border-radius: 6px; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Registro de Paseo
              </button>
            </div>
          </div>

          <!-- RECENT DISTRACTION LOGS LIST -->
          ${distractionLogs.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2px;">
                Historial de Sesiones (${distractionLogs.length}):
              </div>
              ${distractionLogs.map((log, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 0.6rem 0.8rem; border-radius: 6px; font-size: 0.78rem;">
                  <div style="flex: 1; padding-right: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      <span style="font-weight: 700; color: var(--text-main);">${log.stimulus}</span>
                      <span style="font-size: 0.7rem; color: var(--accent-cyan);">${log.level}</span>
                      <span style="font-size: 0.7rem; color: var(--text-muted);">${log.date}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--accent-amber); margin-top: 2px;">${log.outcome}</div>
                    ${log.notes ? `<div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px; font-style: italic;">"${log.notes}"</div>` : ''}
                  </div>
                  <button type="button" onclick="deleteBooDistractionLog(${idx})" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem; padding: 4px;" title="Eliminar registro">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 0.75rem;">
              Aún no hay sesiones registradas. Probad la primera hoy con una pelota en calma o el comando único en el parque.
            </div>
          `}
        </div>
      `;
    }

    // -------------------------------------------------------------
    // SUBTAB 2: PLAN DIARIO DE PASEO (LUNES A DOMINGO)
    // -------------------------------------------------------------
    else if (activeSubTab === "daily") {
      const dayPlan = (BOO_WEEKLY_SCHEDULE || {})[activeDay] || (BOO_WEEKLY_SCHEDULE && BOO_WEEKLY_SCHEDULE["Lunes"]) || {
        theme: "Autocontrol Emocional, Pelota & Protocolo LAT",
        focusTitle: "Lunes: Autocontrol Emocional, Pelota & Protocolo LAT",
        focusText: "Gestión de impulsos con pelota y técnicas de paseo en calma sin tirones",
        tasks: []
      };

      const themeTitle = dayPlan.theme || dayPlan.focusTitle || `Plan de Adiestramiento • ${activeDay}`;
      const focusDescription = dayPlan.focusText || dayPlan.summary || dayPlan.focus || 'Enfoque en calma, autocontrol y comunicación con correa floja';
      const rawTasks = Array.isArray(dayPlan.tasks) && dayPlan.tasks.length > 0
        ? dayPlan.tasks
        : (Array.isArray(dayPlan.dailyTasks) ? dayPlan.dailyTasks : []);

      const learnedTricks = appState.booProgress?.learnedTricks || [];
      const activeTrickId = appState.booProgress?.activeTrickId || (BOO_TRICKS_BACKLOG && BOO_TRICKS_BACKLOG[0] ? BOO_TRICKS_BACKLOG[0].id : null);
      const activeTrick = (BOO_TRICKS_BACKLOG || []).find(t => t.id === activeTrickId) || (BOO_TRICKS_BACKLOG && BOO_TRICKS_BACKLOG[0]) || { id: "trick_default", title: "Contacto Visual", desc: "Mirar a los ojos a la orden 'Mírame'" };

      html += `
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
              <i class="fa-solid fa-map"></i> Catálogo Habilidades (${learnedTricks.length}/${(BOO_TRICKS_BACKLOG || []).length})
            </button>
          </div>

          <div style="background: rgba(0,0,0,0.15); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--accent-amber); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-bullseye"></i> Habilidad Activa en Desarrollo: <strong>${activeTrick.title || 'Habilidad'}</strong>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem;">
              ${activeTrick.desc || activeTrick.summary || ''}
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="btn-primary" onclick="markTrickMastered('${activeTrick.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 6px; color: #fff; cursor: pointer;">
                <i class="fa-solid fa-check"></i> Marcar como Dominada
              </button>
              <button type="button" class="btn-secondary-sm" onclick="openBooBacklogModal()" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 6px;">
                <i class="fa-solid fa-list"></i> Elegir otra del catálogo
              </button>
            </div>
          </div>

          <div style="margin-top: 0.85rem;">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-list-check" style="color: var(--accent-cyan);"></i> Ejercicios Específicos de ${activeDay}:
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

        <!-- CONTINUOUS REINFORCEMENT HABITS -->
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

        <!-- SESSION NOTES & MOOD -->
        <div class="glass-card" style="margin-bottom: 1.25rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--text-main); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-note-sticky" style="color: var(--accent-amber);"></i> Notas del Paseo de ${activeDay}
          </h3>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.6rem;">
            <input type="text" id="boo-session-note-input" value="${appState.booProgress?.sessionNotes?.[activeDay] || ''}" placeholder="Ej: Hoy estuvo muy atenta en el parque, respondió bien a la llamada..." style="flex: 1; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 6px; padding: 7px 10px; color: var(--text-main); font-size: 0.8rem;">
            <button type="button" class="btn-primary" onclick="saveBooSessionNotes('${activeDay}')" style="font-size: 0.78rem; padding: 7px 12px; border-radius: 6px;">
              Guardar
            </button>
          </div>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // SUBTAB 3: BIBLIOTECA COMPLETA DE MÓDULOS DE ADIESTRAMIENTO
    // -------------------------------------------------------------
    else if (activeSubTab === "modules") {
      const moduleStats = appState.booProgress?.moduleStats || {};

      html += `
        <div class="glass-card" style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--accent-cyan);">
                <i class="fa-solid fa-book-open"></i> Biblioteca de Módulos de Adiestramiento
              </h2>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                Técnicas especializadas paso a paso para Border Collie. Practicadlas regularmente y anotad vuestro avance.
              </p>
            </div>
            <div style="font-size: 0.82rem; color: var(--accent-amber); font-weight: 700;">
              Total Módulos: ${BOO_TRAINING_MODULES.length}
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${BOO_TRAINING_MODULES.map(mod => {
            const practicedCount = moduleStats[mod.id] || 0;
            return `
              <div class="glass-card" style="border-left: 4px solid ${mod.badgeColor || 'var(--accent-cyan)'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.6rem;">
                  <div>
                    <span style="font-size: 0.72rem; font-weight: 700; color: ${mod.badgeColor || 'var(--accent-cyan)'}; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${mod.category}
                    </span>
                    <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--text-main); margin-top: 2px; display: flex; align-items: center; gap: 0.4rem;">
                      <i class="${mod.icon}"></i> ${mod.title}
                    </h3>
                  </div>
                  <div style="display: flex; gap: 0.4rem; align-items: center;">
                    <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; background: rgba(0,0,0,0.3); color: var(--text-muted);">
                      <i class="fa-solid fa-stopwatch"></i> ${mod.duration}
                    </span>
                    <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; background: rgba(0,0,0,0.3); color: ${mod.badgeColor};">
                      ${mod.difficulty}
                    </span>
                  </div>
                </div>

                <p style="font-size: 0.8rem; color: var(--text-main); line-height: 1.45; margin-bottom: 0.75rem;">
                  ${mod.summary}
                </p>

                <div style="background: rgba(0,0,0,0.18); padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.45rem;">
                    <i class="fa-solid fa-list-ol"></i> Pasos de Ejecución:
                  </div>
                  <ol style="margin: 0; padding-left: 1.2rem; font-size: 0.78rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem;">
                    ${mod.steps.map(s => `<li style="line-height: 1.4;">${s}</li>`).join('')}
                  </ol>
                </div>

                ${mod.proTip ? `
                  <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.76rem; color: #fde68a; margin-bottom: 0.75rem;">
                    <strong><i class="fa-solid fa-lightbulb"></i> Tip para Border Collie:</strong> ${mod.proTip}
                  </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.6rem; border-top: 1px solid var(--border-color);">
                  <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Sesiones practicadas: <strong style="color: var(--accent-emerald);">${practicedCount}</strong>
                  </span>
                  <button type="button" class="btn-secondary-sm" onclick="markBooModulePracticed('${mod.id}')" style="font-size: 0.75rem; padding: 5px 10px; display: flex; align-items: center; gap: 0.35rem;">
                    <i class="fa-solid fa-plus"></i> Registrar Práctica (+1)
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------
    // SUBTAB 4: HABILIDADES & TRUCOS
    // -------------------------------------------------------------
    else if (activeSubTab === "tricks") {
      const learned = appState.booProgress?.learnedTricks || [];
      const activeId = appState.booProgress?.activeTrickId || (BOO_TRICKS_BACKLOG && BOO_TRICKS_BACKLOG[0] ? BOO_TRICKS_BACKLOG[0].id : null);
      const activeTrick = (BOO_TRICKS_BACKLOG || []).find(t => t.id === activeId) || (BOO_TRICKS_BACKLOG && BOO_TRICKS_BACKLOG[0]);

      html += `
        <div class="glass-card" style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.6rem;">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--accent-emerald);">
                <i class="fa-solid fa-trophy"></i> Catálogo de Habilidades & Trucos de Boo
              </h2>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                Estimulación mental, coordinación y control de impulsos para Border Collie.
              </p>
            </div>
            <button type="button" class="btn-primary" onclick="openBooBacklogModal()" style="font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: 6px;">
              <i class="fa-solid fa-map"></i> Ver Mapa Completo (${learned.length}/${(BOO_TRICKS_BACKLOG || []).length})
            </button>
          </div>
        </div>

        ${activeTrick ? `
          <div class="glass-card" style="border-left: 4px solid var(--accent-amber); margin-bottom: 1.25rem;">
            <span style="font-size: 0.72rem; color: var(--accent-amber); font-weight: 700; text-transform: uppercase;">
              Habilidad en Curso
            </span>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-main); margin-top: 2px;">
              ${activeTrick.title}
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; margin-bottom: 0.75rem;">
              ${activeTrick.desc || activeTrick.summary}
            </p>

            ${activeTrick.steps ? `
              <div style="background: rgba(0,0,0,0.18); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.75rem;">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.35rem;">Pasos:</div>
                <ol style="margin: 0; padding-left: 1.2rem; font-size: 0.76rem; color: var(--text-muted);">
                  ${activeTrick.steps.map(s => `<li style="line-height: 1.4;">${s}</li>`).join('')}
                </ol>
              </div>
            ` : ''}

            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn-primary" onclick="markTrickMastered('${activeTrick.id}')" style="font-size: 0.75rem; padding: 0.45rem 0.9rem; background: linear-gradient(135deg, #10b981, #059669);">
                <i class="fa-solid fa-check"></i> Marcar como Dominada
              </button>
              <button type="button" class="btn-secondary-sm" onclick="openBooBacklogModal()" style="font-size: 0.75rem; padding: 0.45rem 0.9rem;">
                <i class="fa-solid fa-list"></i> Elegir otra habilidad
              </button>
            </div>
          </div>
        ` : ''}

        <div class="glass-card">
          <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.6rem;">
            Habilidades Dominadas (${learned.length}):
          </h4>
          ${learned.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
              ${learned.map(trickId => {
                const tr = (BOO_TRICKS_BACKLOG || []).find(t => t.id === trickId);
                return `
                  <span style="font-size: 0.78rem; padding: 4px 10px; border-radius: 6px; background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; gap: 0.35rem;">
                    <i class="fa-solid fa-circle-check"></i> ${tr ? tr.title : trickId}
                  </span>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">
              Ninguna habilidad marcada como dominada aún.
            </div>
          `}
        </div>
      `;
    }

    container.innerHTML = html;
  } catch(e) {
    console.error("Error rendering Boo Workout View:", e);
  }
}
