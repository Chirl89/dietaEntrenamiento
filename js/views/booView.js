import { appState, saveState, getTodayDayName, triggerHapticTouch, showIosToast } from '../state.js';
import { BOO_TRAINING_MODULES, BOO_WEEKLY_SCHEDULE, BOO_CONTINUOUS_REINFORCEMENT, BOO_TRICKS_BACKLOG } from '../../data.js?v=0.10.8';

export function selectBooDayFromDropdown(dayName) {
  appState.activeBooDay = dayName;
  renderBooWorkoutView();
}

export function toggleBooTask(taskId, dayName) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.completedTasks) appState.booProgress.completedTasks = {};
  const current = !!appState.booProgress.completedTasks[taskId];
  appState.booProgress.completedTasks[taskId] = !current;
  saveState();
  renderBooWorkoutView();
  showIosToast(!current ? "🐾 ¡Ejercicio de Boo registrado!" : "Ejercicio desmarcado", "fa-solid fa-paw");
}

export function setBooMood(dayName, mood) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.moodLogs) appState.booProgress.moodLogs = {};
  appState.booProgress.moodLogs[dayName] = mood;
  saveState();
  renderBooWorkoutView();
  showIosToast(`Estado de Boo guardado: ${mood}`, "fa-solid fa-face-smile-wink");
}

export function saveBooSessionNotes(dayName) {
  triggerHapticTouch();
  const input = document.getElementById("boo-session-note-input");
  if (!input) return;
  const note = input.value.trim();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.sessionNotes) appState.booProgress.sessionNotes = {};
  appState.booProgress.sessionNotes[dayName] = note;
  saveState();
  showIosToast("📝 Nota del paseo guardada", "fa-solid fa-floppy-disk");
}

export function markBooModulePracticed(moduleId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.moduleStats) appState.booProgress.moduleStats = {};
  const count = (appState.booProgress.moduleStats[moduleId] || 0) + 1;
  appState.booProgress.moduleStats[moduleId] = count;
  saveState();
  renderBooWorkoutView();
  showIosToast(`🐾 ¡Módulo practicado! Total: ${count} sesiones`, "fa-solid fa-paw");
}

export function toggleContinuousItem(itemId, dayName) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.completedContinuous) appState.booProgress.completedContinuous = {};
  const key = `${dayName}_${itemId}`;
  const current = !!appState.booProgress.completedContinuous[key];
  appState.booProgress.completedContinuous[key] = !current;
  saveState();
  renderBooWorkoutView();
  showIosToast(!current ? "🐾 ¡Hábito de Boo reforzado hoy!" : "Desmarcado", "fa-solid fa-paw");
}

export function markTrickMastered(trickId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.learnedTricks) appState.booProgress.learnedTricks = [];
  if (!appState.booProgress.learnedTricks.includes(trickId)) {
    appState.booProgress.learnedTricks.push(trickId);
  }
  const nextTrick = BOO_TRICKS_BACKLOG.find(t => !appState.booProgress.learnedTricks.includes(t.id));
  appState.booProgress.activeTrickId = nextTrick ? nextTrick.id : null;

  saveState();
  renderBooWorkoutView();
  showIosToast("🎉 ¡Enhorabuena! Boo ha dominado un nuevo truco. Desbloqueado el siguiente.", "fa-solid fa-trophy");
}

export function selectActiveTrickFromBacklog(trickId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  appState.booProgress.activeTrickId = trickId;
  saveState();
  renderBooWorkoutView();
  showIosToast("🎯 Truco seleccionado para trabajar hoy.", "fa-solid fa-bullseye");
}

export function toggleBooAccordion(accordionId) {
  triggerHapticTouch();
  if (!appState.booProgress) appState.booProgress = {};
  if (!appState.booProgress.accordions) appState.booProgress.accordions = {};
  const current = !!appState.booProgress.accordions[accordionId];
  appState.booProgress.accordions[accordionId] = !current;
  saveState();
  renderBooWorkoutView();
}

export function openBooBacklogModal() {
  try {
    try { triggerHapticTouch(); } catch(e){}
    let modal = document.getElementById("boo-backlog-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "boo-backlog-modal";
      modal.className = "modal-overlay";
      modal.onclick = (e) => closeBooBacklogModalOnBackdrop(e);
      modal.innerHTML = `
        <div class="glass-modal" style="max-width: 620px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-title">
              <div style="font-size: 1.8rem;">🐕</div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff;">Mapa de Adiestramiento de Boo 🐾</h3>
                <p style="font-size: 0.78rem; color: var(--accent-amber);">Catálogo completo de trucos dominados y cola del backlog</p>
              </div>
            </div>
            <button type="button" class="modal-close-btn" onclick="closeBooBacklogModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body" id="boo-backlog-modal-content" style="padding-top: 1rem;">
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    renderBooBacklogModalUI();
    modal.style.cssText = "display: flex !important; opacity: 1 !important; visibility: visible !important; z-index: 99999 !important;";
    modal.classList.add("active");
  } catch (err) {
    console.error("Error opening Boo backlog modal:", err);
  }
}

export function closeBooBacklogModal() {
  try {
    try { triggerHapticTouch(); } catch(e){}
    const modal = document.getElementById("boo-backlog-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  } catch (err) {}
}

export function closeBooBacklogModalOnBackdrop(e) {
  if (e && e.target && e.target.id === "boo-backlog-modal") {
    closeBooBacklogModal();
  }
}

export function renderBooBacklogModalUI() {
  const container = document.getElementById("boo-backlog-modal-content");
  if (!container) return;

  if (!appState.booProgress) {
    appState.booProgress = { completedContinuous: {}, learnedTricks: [], activeTrickId: null, moodLogs: {}, sessionNotes: {}, accordions: {} };
  }

  const learnedTricks = appState.booProgress.learnedTricks || [];
  const activeTrickId = appState.booProgress.activeTrickId;

  const unlearnedTricks = BOO_TRICKS_BACKLOG.filter(t => !learnedTricks.includes(t.id));
  const masteredTricks = BOO_TRICKS_BACKLOG.filter(t => learnedTricks.includes(t.id));

  const unlearnedListHtml = unlearnedTricks.map((t, idx) => {
    const isCurrentActive = activeTrickId === t.id;
    return `
      <div style="padding: 0.85rem 0.95rem; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid ${isCurrentActive ? 'var(--accent-amber)' : 'var(--border-color)'}; margin-bottom: 0.75rem; box-shadow: ${isCurrentActive ? '0 4px 16px rgba(245, 158, 11, 0.12)' : 'none'}; transition: all 0.2s ease;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; width: 100%;">
          <div style="display: flex; align-items: flex-start; gap: 0.6rem; flex: 1; min-width: 0;">
            <span style="font-weight: 700; font-size: 0.8rem; color: var(--accent-amber); background: rgba(245, 158, 11, 0.18); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">#${idx + 1}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.95rem; font-weight: 700; color: #fff; line-height: 1.35; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
                <i class="${t.icon}" style="color: ${t.badgeColor}; font-size: 0.9rem; margin-right: 0.35rem;"></i>${t.title}
              </div>
            </div>
          </div>
          <div style="flex-shrink: 0; margin-left: 0.4rem;">
            ${isCurrentActive ? `
              <span style="font-size: 0.75rem; background: rgba(245,158,11,0.22); color: var(--accent-amber); padding: 4px 10px; border-radius: 12px; font-weight: 700; border: 1px solid var(--accent-amber); display: inline-block; white-space: nowrap;">
                🎯 En Curso
              </span>
            ` : `
              <button type="button" class="btn-micro" onclick="selectActiveTrickFromBacklog('${t.id}'); closeBooBacklogModal();" style="font-size: 0.75rem; padding: 5px 12px; border-radius: 8px; background: var(--bg-tertiary); color: var(--text-primary); font-weight: 600; border: 1px solid var(--border-color); white-space: nowrap;">
                Fijar Hoy
              </button>
            `}
          </div>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin: 0.35rem 0 0.4rem 2.1rem;">
          ${t.summary}
        </div>

        <div style="margin-left: 2.1rem; font-size: 0.72rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 6px; color: var(--accent-cyan); font-weight: 500;">${t.category}</span>
          <span style="color: var(--text-muted);">•</span>
          <span>Dificultad: <strong style="color: var(--accent-amber);">${t.difficulty}</strong></span>
        </div>
      </div>
    `;
  }).join("");

  const masteredListHtml = masteredTricks.map(t => `
    <div style="padding: 0.75rem 0.95rem; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.25); margin-bottom: 0.5rem; display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; width: 100%;">
      <div style="display: flex; align-items: flex-start; gap: 0.6rem; flex: 1; min-width: 0;">
        <span style="font-size: 1.1rem; color: var(--accent-emerald); flex-shrink: 0; margin-top: 2px;"><i class="fa-solid fa-medal"></i></span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.9rem; font-weight: 700; color: #fff; line-height: 1.3;">${t.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px; line-height: 1.35;">${t.summary}</div>
        </div>
      </div>
      <span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 700; background: rgba(16,185,129,0.15); padding: 4px 10px; border-radius: 12px; flex-shrink: 0; white-space: nowrap;">
        <i class="fa-solid fa-circle-check"></i> Dominado
      </span>
    </div>
  `).join("");

  container.innerHTML = `
    <!-- STATS SUMMARY HEADER -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid fa-graduation-cap" style="color: var(--accent-amber); font-size: 1.2rem;"></i>
        <span style="font-size: 0.88rem; font-weight: 600; color: #fff;">Progreso Total del Backlog</span>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <span style="font-size: 0.78rem; padding: 3px 10px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); font-weight: 700;">
          🏆 ${masteredTricks.length} Aprendidos
        </span>
        <span style="font-size: 0.78rem; padding: 3px 10px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); font-weight: 700;">
          ⏳ ${unlearnedTricks.length} Pendientes
        </span>
      </div>
    </div>

    <!-- UNLEARNED QUEUE SECTION -->
    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--accent-amber); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid fa-list-ol"></i> Próximos Trucos en Cola de Aprendizaje (${unlearnedTricks.length})
      </h4>
      ${unlearnedListHtml || '<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem;">🎉 ¡Felicidades! Boo ha aprendido todos los trucos programados en el mapa.</p>'}
    </div>

    <!-- MASTERED HISTORY SECTION -->
    ${masteredTricks.length > 0 ? `
      <div>
        <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--accent-emerald); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-trophy"></i> Trucos Dominados e Histórico (${masteredTricks.length})
        </h4>
        ${masteredListHtml}
      </div>
    ` : ''}
  `;
}

export function renderBooWorkoutView() {
  const container = document.getElementById("boo-workout-container");
  if (!container) return;
  container.innerHTML = "";

  const activeDay = appState.activeBooDay || getTodayDayName();
  
  const selectElem = document.getElementById("boo-day-select");
  if (selectElem && selectElem.value !== activeDay) {
    selectElem.value = activeDay;
  }

  if (!appState.booProgress) {
    appState.booProgress = { completedContinuous: {}, learnedTricks: [], activeTrickId: null, moodLogs: {}, sessionNotes: {}, accordions: {} };
  }

  const completedContinuous = appState.booProgress.completedContinuous || {};
  const learnedTricks = appState.booProgress.learnedTricks || [];
  const moodLogs = appState.booProgress.moodLogs || {};
  const sessionNotes = appState.booProgress.sessionNotes || {};
  const accordions = appState.booProgress.accordions || {};

  let activeTrick = BOO_TRICKS_BACKLOG.find(t => t.id === appState.booProgress.activeTrickId);
  if (!activeTrick || learnedTricks.includes(activeTrick.id)) {
    activeTrick = BOO_TRICKS_BACKLOG.find(t => !learnedTricks.includes(t.id)) || BOO_TRICKS_BACKLOG[0];
    appState.booProgress.activeTrickId = activeTrick ? activeTrick.id : null;
  }

  const currentMood = moodLogs[activeDay] || "🧘‍♂️ Calma & Enfocada";
  const currentNote = sessionNotes[activeDay] || "";

  // 1. BOO COMPACT HERO BANNER
  const heroCard = document.createElement("div");
  heroCard.className = "glass-card boo-hero-card";
  heroCard.style.marginBottom = "1.25rem";
  heroCard.innerHTML = `
    <div class="boo-hero-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="boo-avatar-badge" style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.25)); border: 2px solid var(--accent-amber); display: flex; align-items: center; justify-content: center; font-size: 1.7rem; box-shadow: var(--shadow-glow-amber);">
          🐕
        </div>
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin-bottom: 2px;">
            Boo <span style="font-size: 0.8rem; background: var(--bg-tertiary); color: var(--accent-amber); padding: 2px 8px; border-radius: 12px; font-weight: 500;">Border Collie • 3 años</span>
          </h2>
          <p style="color: var(--text-muted); font-size: 0.82rem;">
            Plan de adiestramiento conductual y backlog evolutivo de trucos
          </p>
        </div>
      </div>
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
        <span class="boo-stat-pill"><i class="fa-solid fa-trophy" style="color:var(--accent-amber);"></i> ${learnedTricks.length} Dominados</span>
        <span class="boo-stat-pill"><i class="fa-solid fa-list-check" style="color:var(--accent-cyan);"></i> ${BOO_TRICKS_BACKLOG.length - learnedTricks.length} En Cola</span>
        <button type="button" class="btn-primary" onclick="openBooBacklogModal()" style="font-size: 0.8rem; padding: 6px 12px; background: rgba(245, 158, 11, 0.18); border: 1px solid var(--accent-amber); color: var(--accent-amber); border-radius: 20px; font-weight: 600;">
          <i class="fa-solid fa-book-open"></i> Ver Mapa de Trucos
        </button>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // 2. OBJETIVO DE APRENDIZAJE DE HOY
  if (activeTrick) {
    const isMastered = learnedTricks.includes(activeTrick.id);
    const activeTrickCard = document.createElement("div");
    activeTrickCard.className = "glass-card boo-active-trick-card";
    activeTrickCard.style.cssText = "margin-bottom: 1.25rem; border: 1px solid var(--accent-amber); background: linear-gradient(135deg, rgba(245,158,11,0.06), rgba(19,26,42,0.95));";

    const stepsListHtml = activeTrick.steps.map((step, idx) => `
      <li style="margin-bottom: 0.45rem; font-size: 0.85rem; line-height: 1.4; color: var(--text-secondary); display: flex; gap: 0.5rem; align-items: flex-start;">
        <span style="background: ${activeTrick.badgeColor}; color: #000; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; flex-shrink: 0; margin-top: 2px;">${idx + 1}</span>
        <span>${step}</span>
      </li>
    `).join("");

    activeTrickCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.85rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.78rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; background: rgba(245, 158, 11, 0.18); color: var(--accent-amber); border: 1px solid var(--accent-amber);">
            <i class="fa-solid fa-bullseye"></i> OBJETIVO DE APRENDIZAJE DE HOY
          </span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Dificultad: <strong style="color:#fff;">${activeTrick.difficulty}</strong></span>
        </div>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-cyan); background: var(--bg-tertiary); padding: 4px 10px; border-radius: 12px;">
          <i class="${activeTrick.icon}"></i> ${activeTrick.category}
        </span>
      </div>

      <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: #fff; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem;">
        ${activeTrick.title}
      </h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.4;">
        ${activeTrick.summary}
      </p>

      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1rem;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.5px;">
          <i class="fa-solid fa-shoe-prints"></i> Paso a Paso para Entrenar Hoy:
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${stepsListHtml}
        </ul>
      </div>

      <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); padding: 0.75rem 1rem; border-radius: 0 8px 8px 0; margin-bottom: 1.25rem; font-size: 0.82rem; color: var(--text-secondary);">
        <strong style="color: var(--accent-amber);"><i class="fa-solid fa-lightbulb"></i> Consejo Collie:</strong> ${activeTrick.proTip}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--border-color);">
        <span style="font-size: 0.82rem; color: var(--text-muted);">
          Estado: <strong style="color: ${isMastered ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">${isMastered ? '¡Ya Dominado!' : 'En Proceso de Aprendizaje'}</strong>
        </span>
        <button type="button" class="btn-primary" onclick="markTrickMastered('${activeTrick.id}')" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 0.88rem; padding: 8px 16px;">
          <i class="fa-solid fa-circle-check"></i> ¡Dominado / Ya lo sabe! ✅ (Siguiente Truco)
        </button>
      </div>
    `;
    container.appendChild(activeTrickCard);
  }

  // 3. REFUERZO CONTINUO DEL PASEO
  const isContinuousOpen = accordions["continuous"] ?? false;
  const continuousAccordionCard = document.createElement("div");
  continuousAccordionCard.className = "glass-card boo-accordion-card";
  continuousAccordionCard.style.marginBottom = "1.25rem";

  const continuousItemsHtml = BOO_CONTINUOUS_REINFORCEMENT.map(item => {
    const key = `${activeDay}_${item.id}`;
    const isDone = !!completedContinuous[key];
    return `
      <div class="boo-task-item ${isDone ? 'completed' : ''}" onclick="toggleContinuousItem('${item.id}', '${activeDay}')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s ease;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="custom-checkbox ${isDone ? 'checked' : ''}" style="width: 22px; height: 22px; border-radius: 6px; border: 2px solid ${isDone ? 'var(--accent-emerald)' : 'var(--text-muted)'}; background: ${isDone ? 'var(--accent-emerald)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75rem;">
            ${isDone ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.92rem; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'}; ${isDone ? 'text-decoration: line-through;' : ''}">
              <i class="${item.icon}" style="color: ${item.color};"></i> ${item.title}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${item.desc}</div>
          </div>
        </div>
        <span class="btn-micro" style="font-size: 0.78rem; padding: 4px 10px; border-radius: 12px; background: ${isDone ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)'}; color: ${isDone ? 'var(--accent-emerald)' : 'var(--text-secondary)'}; font-weight: 600;">
          ${isDone ? '¡Reforzado!' : 'Practicado hoy'}
        </span>
      </div>
    `;
  }).join("");

  continuousAccordionCard.innerHTML = `
    <div class="boo-accordion-header" onclick="toggleBooAccordion('continuous')" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <i class="fa-solid fa-arrows-rotate" style="font-size: 1.1rem; color: var(--accent-cyan);"></i>
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; margin: 0;">
            🔄 Refuerzo Continuo del Paseo (${activeDay})
          </h4>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 2px 0 0 0;">
            Hábitos permanentes que se trabajan a diario durante las salidas (Pulsar para ${isContinuousOpen ? 'ocultar' : 'desplegar'})
          </p>
        </div>
      </div>
      <i class="fa-solid fa-chevron-${isContinuousOpen ? 'up' : 'down'}" style="color: var(--text-muted);"></i>
    </div>

    ${isContinuousOpen ? `
      <div style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        ${continuousItemsHtml}
      </div>
    ` : ''}
  `;
  container.appendChild(continuousAccordionCard);

  // 4. REGISTRO EMOCIONAL Y NOTAS DEL PASEO
  const moodCard = document.createElement("div");
  moodCard.className = "glass-card";
  moodCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.85rem;">
      <div>
        <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-face-smile-wink" style="color: var(--accent-amber);"></i> Registro Emocional y Notas del Paseo (${activeDay})
        </h3>
        <p style="color: var(--text-muted); font-size: 0.8rem;">Registra la actitud de Boo hoy y anotaciones de su evolución</p>
      </div>
    </div>

    <div style="margin-bottom: 1rem;">
      <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">
        Estado de Ánimo Predominante de Boo Hoy:
      </label>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        ${["🧘‍♂️ Calma & Enfocada", "⚡ Alta Excitación", "🎾 Obsesionada con Pelota", "🎯 Excelente Respuesta a Llamada"].map(m => `
          <button type="button" class="boo-mood-btn ${currentMood === m ? 'active' : ''}" onclick="setBooMood('${activeDay}', '${m}')" style="padding: 6px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; border: 1px solid ${currentMood === m ? 'var(--accent-amber)' : 'var(--border-color)'}; background: ${currentMood === m ? 'rgba(245,158,11,0.2)' : 'var(--bg-secondary)'}; color: ${currentMood === m ? 'var(--accent-amber)' : 'var(--text-secondary)'}; cursor: pointer; transition: all 0.2s ease;">
            ${m}
          </button>
        `).join("")}
      </div>
    </div>

    <div>
      <label for="boo-session-note-input" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">
        Observaciones o Logro Destacado del Día:
      </label>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <input type="text" id="boo-session-note-input" class="custom-input" placeholder="Ej: ¡Hoy volvió a la primera cuando la llamé en el parque!" value="${currentNote.replace(/"/g, '&quot;')}" style="flex: 1; min-width: 240px; font-size: 0.85rem;">
        <button type="button" class="btn-primary" onclick="saveBooSessionNotes('${activeDay}')" style="font-size: 0.82rem;">
          <i class="fa-solid fa-floppy-disk"></i> Guardar Nota
        </button>
      </div>
    </div>
  `;
  container.appendChild(moodCard);
}
