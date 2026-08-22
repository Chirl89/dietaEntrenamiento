/**
 * FitDuo & Collie Coach - Navigation & Router Module (v0.14.0)
 * Isolated Tab Switching, Segmented Controls, Profile State & Global Orchestration.
 */

import {
  appState,
  LOCAL_STORAGE_KEY,
  LAST_ACTIVE_PROFILE_KEY,
  DEVICE_DEFAULT_PROFILE_KEY,
  getMasterProfileId,
  getTodayDayName,
  triggerHapticTouch,
  showIosToast,
  saveState,
  renderDebugLogsView
} from './state.js';
import { updateAppleWatchModalUI, updateHeaderWatchBadge } from './appleWatch.js';
import { renderSummaryView, renderProfileView } from './views/summaryView.js';
import { renderNutritionMenuView, renderNutritionRecipesView, renderShoppingView } from './views/nutritionView.js';
import { renderWorkoutsView, renderExerciseTableView } from './views/workoutsView.js';
import { renderBooWorkoutView } from './views/booView.js';
import { renderProgressView } from './views/progressView.js';
import { renderSettingsView } from './views/settingsView.js';

export const NAVIGATION_CATEGORIES = {
  summary: {
    name: "Resumen & Salud",
    dockId: "dock-btn-summary",
    sidebarId: "sidebar-nav-summary",
    subtabs: [
      { id: "summary-view", label: "Hoy", icon: "fa-solid fa-gauge-high" },
      { id: "progress-view", label: "Histórico & Logros", icon: "fa-solid fa-chart-line" }
    ]
  },
  nutrition: {
    name: "Nutrición",
    dockId: "dock-btn-nutrition",
    sidebarId: "sidebar-nav-nutrition",
    subtabs: [
      { id: "nutrition-menu-view", label: "Menú del Día", icon: "fa-solid fa-utensils" },
      { id: "nutrition-recipes-view", label: "Recetas", icon: "fa-solid fa-book-open" },
      { id: "nutrition-shopping-view", label: "Lista de la Compra", icon: "fa-solid fa-cart-shopping" }
    ]
  },
  workouts: {
    name: "Entrenamiento",
    dockId: "dock-btn-workouts",
    sidebarId: "sidebar-nav-workouts",
    subtabs: [
      { id: "workouts-view", label: "Entrenamientos", icon: "fa-solid fa-dumbbell" },
      { id: "workouts-boo-view", label: "Boo", icon: "fa-solid fa-dog" },
      { id: "workouts-exercises-view", label: "Tabla de Ejercicios", icon: "fa-solid fa-list-check" }
    ]
  },
  profile: {
    name: "Ajustes",
    dockId: "dock-btn-profile",
    sidebarId: "sidebar-nav-profile",
    subtabs: [
      { id: "settings-view", label: "Ajustes & Nube", icon: "fa-solid fa-gear" },
      { id: "apple-watch-view", label: "Atajos de Salud", icon: "fa-brands fa-apple" }
    ]
  }
};

export function switchCategory(categoryKey, targetTabId = null, btnElement = null) {
  try {
    triggerHapticTouch();
    const cat = NAVIGATION_CATEGORIES[categoryKey];
    if (!cat) return;

    if (categoryKey === 'workouts') {
      const today = getTodayDayName();
      appState.activeWorkoutDay = today;
      appState.activeBooDay = today;
      const selectElem = document.getElementById("workout-day-select");
      if (selectElem) selectElem.value = today;
      const booSelect = document.getElementById("boo-day-select");
      if (booSelect) booSelect.value = today;
    }

    let tabToOpen = cat.subtabs[0].id;
    if (targetTabId && cat.subtabs.some(s => s.id === targetTabId)) {
      tabToOpen = targetTabId;
    }
    showTab(tabToOpen);
  } catch(e) {
    console.error("Error switching category:", e);
  }
}

export function renderSubtabSegmentedControl(categoryKey, activeTabId) {
  try {
    const container = document.getElementById("ios-segmented-control-inner");
    if (!container) return;

    const cat = NAVIGATION_CATEGORIES[categoryKey];
    if (!cat || !cat.subtabs || cat.subtabs.length <= 1) {
      if (container.parentElement) container.parentElement.style.cssText = "display: none !important;";
      return;
    }

    if (container.parentElement) {
      container.parentElement.style.cssText = "display: flex !important; visibility: visible !important;";
    }

    container.innerHTML = cat.subtabs.map(sub => `
      <button type="button" class="ios-segmented-btn ${sub.id === activeTabId ? 'active' : ''}" onclick="showTab('${sub.id}')">
        <i class="${sub.icon}"></i>
        <span>${sub.label}</span>
      </button>
    `).join("");
  } catch(e) {
    console.error("Error rendering segmented control:", e);
  }
}

export function applyProfileTheme(profileId) {
  try {
    const pid = profileId || appState.activeProfileId || "he";
    document.documentElement.setAttribute("data-profile", pid);
    if (document.body) {
      document.body.setAttribute("data-profile", pid);
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", pid === "he" ? "#fdf2f4" : "#edf4fc");
    }
  } catch(e) {
    console.error("Error applying profile theme:", e);
  }
}

export function updateProfileSwitcherButtonsUI() {
  try {
    const profileId = appState.activeProfileId || "he";
    applyProfileTheme(profileId);

    const btnHe = document.getElementById("btn-profile-he");
    const btnShe = document.getElementById("btn-profile-she");
    if (btnHe) btnHe.classList.toggle("active", profileId === "he");
    if (btnShe) btnShe.classList.toggle("active", profileId === "she");

    const iosBtnHe = document.getElementById("ios-btn-profile-he");
    const iosBtnShe = document.getElementById("ios-btn-profile-she");
    if (iosBtnHe) iosBtnHe.classList.toggle("active", profileId === "he");
    if (iosBtnShe) iosBtnShe.classList.toggle("active", profileId === "she");
  } catch(e) {
    console.error("Error updating profile switcher buttons UI:", e);
  }
}

export function renderAll() {
  try {
    updateProfileSwitcherButtonsUI();
  } catch(e) { console.error("Error in updateProfileSwitcherButtonsUI:", e); }

  try { renderSummaryView(); } catch(e) { console.error("Error in renderSummaryView:", e); }
  try { renderProfileView(); } catch(e) { console.error("Error in renderProfileView:", e); }
  try { renderNutritionMenuView(); } catch(e) { console.error("Error in renderNutritionMenuView:", e); }
  try { renderNutritionRecipesView(); } catch(e) { console.error("Error in renderNutritionRecipesView:", e); }
  try { renderShoppingView(); } catch(e) { console.error("Error in renderShoppingView:", e); }
  try { renderWorkoutsView(); } catch(e) { console.error("Error in renderWorkoutsView:", e); }
  try { renderBooWorkoutView(); } catch(e) { console.error("Error in renderBooWorkoutView:", e); }
  try { renderExerciseTableView(); } catch(e) { console.error("Error in renderExerciseTableView:", e); }
  try { renderProgressView(); } catch(e) { console.error("Error in renderProgressView:", e); }
  try { renderSettingsView(); } catch(e) { console.error("Error in renderSettingsView:", e); }
  try { updateHeaderWatchBadge(); } catch(e) { console.error("Error in updateHeaderWatchBadge:", e); }

  try {
    if (document.getElementById("apple-watch-modal")?.classList.contains("active")) {
      updateAppleWatchModalUI();
    }
  } catch(e) {}

  try {
    if (document.getElementById("logs-view")?.classList.contains("active")) {
      renderDebugLogsView();
    }
  } catch(e) {}

  try {
    const activePanel = document.querySelector(".view-panel.active");
    const activeTabId = activePanel ? activePanel.id : "summary-view";
    let activeCatKey = 'summary';
    for (const [catKey, catObj] of Object.entries(NAVIGATION_CATEGORIES)) {
      if (catObj.subtabs && catObj.subtabs.some(s => s.id === activeTabId)) {
        activeCatKey = catKey;
        break;
      }
    }
    renderSubtabSegmentedControl(activeCatKey, activeTabId);
  } catch(e) {
    console.error("Error in renderSubtabSegmentedControl:", e);
  }
}

export function switchProfile(profileId) {
  try {
    triggerHapticTouch();
    appState.activeProfileId = profileId;
    localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, profileId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));

    applyProfileTheme(profileId);
    updateProfileSwitcherButtonsUI();
    renderAll();

    const viewName = profileId === 'he' ? 'Carlos' : 'Andrea';
    showIosToast(`👁️ Visualizando a ${viewName}`, "fa-solid fa-eye");
  } catch(e) {
    console.error("Error switching profile:", e);
  }
}

export function showTab(tabId, btnElement) {
  try {
    triggerHapticTouch();

    if (tabId === 'nutrition-view' || tabId === 'nutrition') {
      tabId = 'nutrition-menu-view';
    } else if (tabId === 'shopping-view') {
      tabId = 'nutrition-shopping-view';
    }

    let activeCatKey = 'summary';
    for (const [catKey, catObj] of Object.entries(NAVIGATION_CATEGORIES)) {
      if (catObj.subtabs.some(s => s.id === tabId)) {
        activeCatKey = catKey;
        break;
      }
    }

    document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
    const targetPanel = document.getElementById(tabId) || document.getElementById("nutrition-menu-view");
    if (targetPanel) {
      targetPanel.classList.add("active");
    }

    const catObj = NAVIGATION_CATEGORIES[activeCatKey];
    if (catObj) {
      document.querySelectorAll(".ios-dock-btn").forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".nav-menu button").forEach(btn => btn.classList.remove("active"));

      const dockBtn = document.getElementById(catObj.dockId);
      if (dockBtn) dockBtn.classList.add("active");

      const sidebarBtn = document.getElementById(catObj.sidebarId);
      if (sidebarBtn) sidebarBtn.classList.add("active");
    }

    renderSubtabSegmentedControl(activeCatKey, tabId);

    // Call individual tab renderer with isolation
    try {
      if (tabId === 'summary-view') {
        renderSummaryView();
      } else if (tabId === 'nutrition-menu-view') {
        renderNutritionMenuView();
      } else if (tabId === 'nutrition-recipes-view') {
        renderNutritionRecipesView();
      } else if (tabId === 'nutrition-shopping-view') {
        renderShoppingView();
      } else if (tabId === 'workouts-view') {
        renderWorkoutsView();
      } else if (tabId === 'workouts-boo-view') {
        renderBooWorkoutView();
      } else if (tabId === 'workouts-exercises-view') {
        renderExerciseTableView();
      } else if (tabId === 'apple-watch-view') {
        updateAppleWatchModalUI();
      } else if (tabId === 'settings-view') {
        renderSettingsView();
      } else if (tabId === 'progress-view') {
        renderProgressView();
      } else if (tabId === 'logs-view') {
        renderDebugLogsView();
      }
    } catch(renderErr) {
      console.error(`Error rendering isolated tab ${tabId}:`, renderErr);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch(e) {
    console.error("Error in showTab:", e);
  }
}

export function setDeviceDefaultProfile(mode) {
  try {
    triggerHapticTouch();
    if (mode === 'he' || mode === 'she') {
      localStorage.setItem(DEVICE_DEFAULT_PROFILE_KEY, mode);
      appState.masterProfileId = mode;
    }
    saveState();
    renderAll();

    const masterName = appState.masterProfileId === 'he' ? 'Carlos' : 'Andrea';
    showIosToast(`📱 Perfil Maestro de este móvil fijado a: ${masterName.toUpperCase()}`, "fa-solid fa-shield-halved");
  } catch(e) {
    console.error("Error setting device default profile:", e);
  }
}

export function checkDeviceIdentityBanner() {
  try {
    const devicePref = localStorage.getItem(DEVICE_DEFAULT_PROFILE_KEY);
    let banner = document.getElementById("device-identity-setup-banner");
    
    if (!devicePref) {
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "device-identity-setup-banner";
        banner.style.cssText = "position: fixed; top: 0; left: 0; right: 0; z-index: 999999; background: linear-gradient(135deg, #1e1b4b, #311b92); color: #fff; padding: 0.9rem 1rem; border-bottom: 2px solid var(--accent-cyan); box-shadow: 0 8px 32px rgba(0,0,0,0.5); text-align: center; font-family: system-ui, -apple-system, sans-serif;";
        banner.innerHTML = `
          <div style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.6rem;">
            <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; color: #a5f3fc;">
              <i class="fa-solid fa-mobile-screen-button" style="color: var(--accent-cyan);"></i> Configuración Inicial: ¿De quién es este teléfono?
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.2rem;">
              Selecciona el dueño de este dispositivo para la sincronización en nube.
            </div>
            <div style="display: flex; gap: 0.75rem; width: 100%; justify-content: center; flex-wrap: wrap;">
              <button onclick="window.setDeviceDefaultProfile('he'); if(document.getElementById('device-identity-setup-banner')) document.getElementById('device-identity-setup-banner').remove();" style="flex: 1; min-width: 140px; padding: 0.7rem 1rem; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">
                👦 Es el móvil de Carlos
              </button>
              <button onclick="window.setDeviceDefaultProfile('she'); if(document.getElementById('device-identity-setup-banner')) document.getElementById('device-identity-setup-banner').remove();" style="flex: 1; min-width: 140px; padding: 0.7rem 1rem; background: #ec4899; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);">
                👧 Es el móvil de Andrea
              </button>
            </div>
          </div>
        `;
        document.body.prepend(banner);
      }
    } else if (banner) {
      banner.remove();
    }
  } catch(e) {
    console.error("Error in checkDeviceIdentityBanner:", e);
  }
}

export function getProfileShortName(pid) {
  try {
    if (!appState || !appState.profiles) {
      if (pid === 'he') return "Carlos";
      if (pid === 'she') return "Andrea";
      if (pid === 'dog') return "Boo";
      return "Usuario";
    }
    if (pid === 'he') {
      const raw = appState.profiles.he?.name || "Carlos";
      return raw.replace(/^Él\s*\(/i, '').replace(/\)$/, '').trim() || "Carlos";
    }
    if (pid === 'she') {
      const raw = appState.profiles.she?.name || "Andrea";
      return raw.replace(/^Ella\s*\(/i, '').replace(/\)$/, '').trim() || "Andrea";
    }
    if (pid === 'dog') {
      const raw = appState.profiles.dog?.name || "Boo";
      return raw.replace(/\s*\(Border Collie\)$/i, '').trim() || "Boo";
    }
    return appState.profiles[pid]?.name || "Usuario";
  } catch(e) {
    return pid === 'he' ? 'Carlos' : pid === 'she' ? 'Andrea' : 'Boo';
  }
}

export function updateUIProfileNames() {
  try {
    const heName = getProfileShortName('he');
    const sheName = getProfileShortName('she');
    const dogName = getProfileShortName('dog');

    // Desktop & Header Profile Switchers
    const btnHe = document.getElementById("btn-profile-he");
    if (btnHe) btnHe.innerHTML = `<i class="fa-solid fa-mars"></i> ${heName}`;
    const btnShe = document.getElementById("btn-profile-she");
    if (btnShe) btnShe.innerHTML = `<i class="fa-solid fa-venus"></i> ${sheName}`;

    // Mobile Topbar Profile Switchers
    const iosBtnHe = document.getElementById("ios-btn-profile-he");
    if (iosBtnHe) iosBtnHe.innerText = heName;
    const iosBtnShe = document.getElementById("ios-btn-profile-she");
    if (iosBtnShe) iosBtnShe.innerText = sheName;

    // Settings view device memory card buttons
    const prefBtnHe = document.querySelector("#pref-btn-he strong");
    if (prefBtnHe) prefBtnHe.innerText = heName;
    const prefBtnHeSpan = document.querySelector("#pref-btn-he .pref-btn-text span");
    if (prefBtnHeSpan) prefBtnHeSpan.innerText = `Abrir siempre como ${heName} en este teléfono`;

    const prefBtnShe = document.querySelector("#pref-btn-she strong");
    if (prefBtnShe) prefBtnShe.innerText = sheName;
    const prefBtnSheSpan = document.querySelector("#pref-btn-she .pref-btn-text span");
    if (prefBtnSheSpan) prefBtnSheSpan.innerText = `Abrir siempre como ${sheName} en este teléfono`;

    // Dynamic labels in Settings customization inputs
    const ringLabelHe = document.getElementById("setting-label-ring-he");
    if (ringLabelHe) ringLabelHe.innerText = `Objetivos ${heName}`;
    const ringLabelShe = document.getElementById("setting-label-ring-she");
    if (ringLabelShe) ringLabelShe.innerText = `Objetivos ${sheName}`;

    const nutLabelHe = document.getElementById("setting-label-nut-he");
    if (nutLabelHe) nutLabelHe.innerText = `Nutrición ${heName}`;
    const nutLabelShe = document.getElementById("setting-label-nut-she");
    if (nutLabelShe) nutLabelShe.innerText = `Nutrición ${sheName}`;

    const dogWalkLabel = document.getElementById("setting-label-dog-walk");
    if (dogWalkLabel) dogWalkLabel.innerText = dogName;
  } catch(e) {
    console.error("Error in updateUIProfileNames:", e);
  }
}
