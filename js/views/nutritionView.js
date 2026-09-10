/**
 * FitDuo & Collie Coach - Nutrition View Module (v0.19.0)
 * Interactive Weekly Meal Planner, Recipe Backlog & Smart Shopping List Generator.
 */

import {
  appState,
  saveState,
  getTodayDayName,
  getProfileShortName,
  triggerHapticTouch,
  showIosToast,
  DEFAULT_WEEKLY_MEAL_PLAN,
  getCurrentWeekKey,
  getWeekKeyForDate,
  getOffsetWeekKey,
  getWeekDateRange,
  getWeekDisplayLabel,
  getDateForDayInWeek,
  createEmptyWeeklyPlan
} from '../state.js';
import { RECIPES_DATABASE, INGREDIENT_CATEGORIES } from '../../data.js';
import { calculateMacrosFromIngredients, generateRecipeFromDescription } from '../nutritionCalculator.js';

// MEAL SLOTS DEFINITION
export const MEAL_SLOTS = [
  { key: "desayuno", label: "DESAYUNO", icon: "fa-sun", color: "var(--accent-amber)" },
  { key: "comida", label: "COMIDA / ALMUERZO", icon: "fa-utensils", color: "var(--accent-cyan)" },
  { key: "merienda", label: "MERIENDA / SNACK", icon: "fa-apple-whole", color: "var(--accent-emerald)" },
  { key: "cena", label: "CENA", icon: "fa-moon", color: "var(--accent-rose)" }
];

export const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Active picker target state
let activePickerContext = { day: "Lunes", slot: "comida" };
let activeBacklogCategoryFilter = "all";
let activeBacklogSearchQuery = "";

/**
 * Returns all available recipes (base database + custom user recipes)
 */
export function getAllRecipes() {
  const custom = Array.isArray(appState.customRecipes) ? appState.customRecipes : [];
  const base = Array.isArray(RECIPES_DATABASE) ? RECIPES_DATABASE : [];
  const deleted = Array.isArray(appState.deletedRecipeIds) ? appState.deletedRecipeIds : [];
  return [...base, ...custom].filter(r => r && r.id && !deleted.includes(r.id));
}

/**
 * Returns filtered recipes taking exclusions into account
 */
export function getFilteredRecipes() {
  try {
    const all = getAllRecipes();
    if (!appState.exclusions || !Array.isArray(appState.exclusions) || appState.exclusions.length === 0) return all;

    return all.filter(recipe => {
      if (!recipe) return false;
      const recipeText = ((recipe.name || "") + " " + (recipe.ingredients || []).map(i => i?.name || "").join(" ")).toLowerCase();
      return !appState.exclusions.some(ex => ex && recipeText.includes(String(ex).toLowerCase()));
    });
  } catch(e) {
    console.error("Error in getFilteredRecipes:", e);
    return getAllRecipes() || [];
  }
}

/**
 * Safely find recipe by ID
 */
export function getRecipeById(id) {
  if (!id) return null;
  const all = getAllRecipes();
  return all.find(r => r && (r.id === id || String(r.id) === String(id))) || null;
}

/**
 * Quick open today's nutrition planner
 */
export function openTodayNutrition() {
  try {
    triggerHapticTouch();
    const today = getTodayDayName();
    appState.activeDay = today;
    if (window.showTab) window.showTab("nutrition-menu-view");
    renderNutritionMenuView();
  } catch(e) {
    console.error("Error opening today nutrition:", e);
  }
}

/**
 * Select active day in weekly planner
 */
export function selectDay(dayName) {
  try {
    triggerHapticTouch();
    appState.activeDay = dayName;
    const selectElem = document.getElementById("nutrition-day-select");
    if (selectElem) selectElem.value = dayName;
    renderNutritionMenuView();
  } catch(e) {
    console.error("Error selecting day:", e);
  }
}

export function selectDayFromDropdown(dayName) {
  selectDay(dayName);
}

/**
 * Navigate to a specific recipe in backlog catalogue and show details
 */
export function navigateToRecipe(recipeId) {
  try {
    triggerHapticTouch();
    if (window.showTab) {
      window.showTab("nutrition-recipes-view");
    }
    setTimeout(() => {
      openRecipeDetailModal(recipeId);
      const card = document.getElementById(`recipe-card-${recipeId}`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("recipe-card-highlight");
        setTimeout(() => card.classList.remove("recipe-card-highlight"), 2000);
      }
    }, 100);
  } catch(e) {
    console.error("Error navigating to recipe:", e);
  }
}

export function renderExclusions() {}

export function addExclusion(ingredient) {
  try {
    triggerHapticTouch();
    if (!appState.exclusions) appState.exclusions = [];
    if (ingredient && !appState.exclusions.includes(ingredient)) {
      appState.exclusions.push(ingredient);
      saveState();
      renderNutritionMenuView();
      renderNutritionRecipesView();
      showIosToast(`🚫 Ingrediente "${ingredient}" excluido`, "fa-solid fa-ban");
    }
  } catch(e) {
    console.error("Error adding exclusion:", e);
  }
}

export function removeExclusion(ingredient) {
  try {
    triggerHapticTouch();
    if (!appState.exclusions) appState.exclusions = [];
    appState.exclusions = appState.exclusions.filter(ex => ex !== ingredient);
    saveState();
    renderNutritionMenuView();
    renderNutritionRecipesView();
    showIosToast(`Ingrediente "${ingredient}" readmitido`, "fa-solid fa-check");
  } catch(e) {
    console.error("Error removing exclusion:", e);
  }
}

/**
 * Toggle view mode between day-by-day and full week grid
 */
export function toggleNutritionViewMode(mode) {
  try {
    triggerHapticTouch();
    appState.nutritionViewMode = mode;
    saveState();
    renderNutritionMenuView();
  } catch(e) {
    console.error("Error toggling nutrition view mode:", e);
  }
}

/**
 * Safely get or initialize the weekly meal plan for active week
 */
export function getActiveWeeklyPlan() {
  const weekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
  if (!appState.weeklyMealPlans || typeof appState.weeklyMealPlans !== 'object') {
    appState.weeklyMealPlans = {};
  }
  if (!appState.weeklyMealPlans[weekKey] || typeof appState.weeklyMealPlans[weekKey] !== 'object') {
    appState.weeklyMealPlans[weekKey] = createEmptyWeeklyPlan();
  }
  appState.weeklyMealPlan = appState.weeklyMealPlans[weekKey];
  return appState.weeklyMealPlans[weekKey];
}

/**
 * Set active nutrition week
 */
export function setNutritionActiveWeek(weekKey) {
  try {
    triggerHapticTouch();
    appState.activeNutritionWeekKey = weekKey;
    getActiveWeeklyPlan();
    saveState();
    renderNutritionMenuView();
    renderShoppingView();
  } catch(e) {
    console.error("Error setting nutrition active week:", e);
  }
}

export function nextNutritionWeek() {
  const current = appState.activeNutritionWeekKey || getCurrentWeekKey();
  const next = getOffsetWeekKey(current, 1);
  setNutritionActiveWeek(next);
}

export function prevNutritionWeek() {
  const current = appState.activeNutritionWeekKey || getCurrentWeekKey();
  const prev = getOffsetWeekKey(current, -1);
  setNutritionActiveWeek(prev);
}

export function goToCurrentNutritionWeek() {
  setNutritionActiveWeek(getCurrentWeekKey());
}

/**
 * Copy meal plan from the immediately preceding week into current week
 */
export function copyPreviousWeekPlan() {
  try {
    triggerHapticTouch();
    const curWeek = appState.activeNutritionWeekKey || getCurrentWeekKey();
    const prevWeek = getOffsetWeekKey(curWeek, -1);
    const prevPlan = appState.weeklyMealPlans?.[prevWeek];

    let hasAnyMeal = false;
    if (prevPlan) {
      DAYS_OF_WEEK.forEach(d => {
        MEAL_SLOTS.forEach(s => {
          if (prevPlan[d]?.[s.key]) hasAnyMeal = true;
        });
      });
    }

    if (!hasAnyMeal) {
      showIosToast("⚠️ La semana anterior no contiene platos guardados", "fa-solid fa-triangle-exclamation");
      return;
    }

    appState.weeklyMealPlans[curWeek] = JSON.parse(JSON.stringify(prevPlan));
    getActiveWeeklyPlan();
    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) window.pushToCloud(false).catch(() => {});
    renderNutritionMenuView();
    renderShoppingView();
    showIosToast("📋 ¡Menú copiado de la semana anterior!", "fa-solid fa-circle-check");
  } catch(e) {
    console.error("Error copying previous week plan:", e);
  }
}

/**
 * Auto-fill weekly plan with a balanced healthy rotation
 */
export function autoFillWeeklyPlan() {
  try {
    triggerHapticTouch();
    const currentWeeklyPlan = getActiveWeeklyPlan();

    const available = getFilteredRecipes();
    const breakfasts = available.filter(r => r.type === "desayuno");
    const lunches = available.filter(r => r.type === "comida");
    const dinners = available.filter(r => r.type === "cena");
    const snacks = available.filter(r => r.type === "snack");

    DAYS_OF_WEEK.forEach((day, idx) => {
      currentWeeklyPlan[day] = {
        desayuno: (breakfasts[idx % (breakfasts.length || 1)] || breakfasts[0])?.id || "d1",
        comida: (lunches[idx % (lunches.length || 1)] || lunches[0])?.id || "c1",
        merienda: (snacks[idx % (snacks.length || 1)] || snacks[0])?.id || "s1",
        cena: (dinners[idx % (dinners.length || 1)] || dinners[0])?.id || "cn1"
      };
    });

    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) window.pushToCloud(false).catch(() => {});
    renderNutritionMenuView();
    renderShoppingView();
    showIosToast("✨ ¡Semana auto-completada con menú equilibrado!", "fa-solid fa-wand-magic-sparkles");
  } catch(e) {
    console.error("Error in autoFillWeeklyPlan:", e);
  }
}

/**
 * Clear all meal slots in weekly plan
 */
export function clearWeeklyPlan() {
  try {
    triggerHapticTouch();
    if (confirm("¿Estás seguro de que quieres vaciar la planificación de toda esta semana?")) {
      const targetWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
      if (!appState.weeklyMealPlans) appState.weeklyMealPlans = {};
      appState.weeklyMealPlans[targetWeekKey] = createEmptyWeeklyPlan();
      if (targetWeekKey === (appState.activeNutritionWeekKey || getCurrentWeekKey())) {
        appState.weeklyMealPlan = appState.weeklyMealPlans[targetWeekKey];
      }
      appState.mealPlansLastModified = Date.now();
      saveState();
      if (window.pushToCloud) window.pushToCloud(false).catch(() => {});
      renderNutritionMenuView();
      renderShoppingView();
      showIosToast("🗑️ Menú semanal vaciado", "fa-solid fa-trash-can");
    }
  } catch(e) {
    console.error("Error clearing weekly plan:", e);
  }
}

/**
 * Remove meal from specific slot
 */
export function removeMealFromSlot(dayName, slotKey) {
  try {
    triggerHapticTouch();
    const targetWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
    if (!appState.weeklyMealPlans) appState.weeklyMealPlans = {};
    if (!appState.weeklyMealPlans[targetWeekKey]) {
      appState.weeklyMealPlans[targetWeekKey] = createEmptyWeeklyPlan();
    }
    if (!appState.weeklyMealPlans[targetWeekKey][dayName]) {
      appState.weeklyMealPlans[targetWeekKey][dayName] = { desayuno: null, comida: null, merienda: null, cena: null };
    }
    
    appState.weeklyMealPlans[targetWeekKey][dayName][slotKey] = null;
    if (targetWeekKey === (appState.activeNutritionWeekKey || getCurrentWeekKey())) {
      appState.weeklyMealPlan = appState.weeklyMealPlans[targetWeekKey];
    }
    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) window.pushToCloud(false).catch(() => {});
    renderNutritionMenuView();
    renderShoppingView();
    showIosToast(`Plato retirado de ${dayName} (${slotKey})`, "fa-solid fa-xmark");
  } catch(e) {
    console.error("Error removing meal from slot:", e);
  }
}

/**
 * Generate and navigate to Shopping List
 */
export function generateShoppingListFromPlan() {
  try {
    triggerHapticTouch();
    if (window.showTab) {
      window.showTab("nutrition-shopping-view");
    }
    renderShoppingView();
    showIosToast("🛒 ¡Lista de la compra generada a partir de tu plan semanal!", "fa-solid fa-cart-shopping");
  } catch(e) {
    console.error("Error generating shopping list:", e);
  }
}

/**
 * Copy weekly menu to clipboard formatted for WhatsApp / Apple Notes
 */
export function copyWeeklyMenuToClipboard() {
  try {
    triggerHapticTouch();
    const activeWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
    const currentWeeklyPlan = getActiveWeeklyPlan();

    let text = `🥗 PLAN SEMANAL DE NUTRICIÓN - FITDUO (${getWeekDisplayLabel(activeWeekKey)}) 🥑\n`;
    text += `Para: ${getProfileShortName(appState.activeProfileId || 'he')}\n\n`;

    DAYS_OF_WEEK.forEach(day => {
      const plan = currentWeeklyPlan?.[day] || {};
      const dayIso = getDateForDayInWeek(activeWeekKey, day);
      text += `📅 === ${day.toUpperCase()} (${dayIso}) ===\n`;
      MEAL_SLOTS.forEach(slot => {
        const recipeId = plan[slot.key];
        const recipe = getRecipeById(recipeId);
        if (recipe) {
          text += `  • ${slot.label}: ${recipe.name} (${recipe.calories} kcal | ${recipe.protein}g P)\n`;
        } else {
          text += `  • ${slot.label}: (Sin asignar)\n`;
        }
      });
      text += "\n";
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showIosToast("📋 ¡Menú semanal copiado al portapapeles!", "fa-solid fa-copy");
      }).catch(() => {
        prompt("Copia el menú semanal:", text);
      });
    } else {
      prompt("Copia el menú semanal:", text);
    }
  } catch(e) {
    console.error("Error copying weekly menu:", e);
  }
}

/**
 * Calculate total meal count in week
 */
export function getWeeklyScheduledCount() {
  let count = 0;
  const currentWeeklyPlan = getActiveWeeklyPlan();
  DAYS_OF_WEEK.forEach(d => {
    const p = currentWeeklyPlan[d] || {};
    MEAL_SLOTS.forEach(s => {
      if (p[s.key]) count++;
    });
  });
  return count;
}

/**
 * RENDER SUBTAB 1: WEEKLY PLANNER VIEW
 */
export function renderNutritionMenuView() {
  try {
    const container = document.getElementById("meal-cards-container");
    if (!container) return;
    container.innerHTML = "";

    const activeWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
    const curWeekKey = getCurrentWeekKey();
    const nextWeekKey = getOffsetWeekKey(curWeekKey, 1);
    const week2Key = getOffsetWeekKey(curWeekKey, 2);
    const week3Key = getOffsetWeekKey(curWeekKey, 3);
    const isCurrentWeek = (activeWeekKey === curWeekKey);
    const isPastWeek = (activeWeekKey < curWeekKey);
    const currentWeeklyPlan = getActiveWeeklyPlan();

    const activeDay = appState.activeDay || getTodayDayName();
    const viewMode = appState.nutritionViewMode || "day";
    const profileId = appState.activeProfileId || "he";
    const userProfile = appState.profiles?.[profileId] || {};
    const targetCalories = userProfile.targetCalories || (profileId === 'he' ? 2150 : 1850);
    const targetProtein = userProfile.protein || (profileId === 'he' ? 155 : 130);

    const totalScheduled = getWeeklyScheduledCount();

    // 1. Render Top Planner Toolbar & Header Controls
    const toolbar = document.createElement("div");
    toolbar.className = "planner-top-toolbar";
    toolbar.innerHTML = `
      <!-- WEEK NAVIGATION BAR -->
      <div class="planner-week-nav-bar">
        <div class="week-nav-controls">
          <button type="button" class="btn-week-nav" onclick="prevNutritionWeek()" title="Semana Anterior">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <div class="week-nav-info">
            <div class="week-nav-title">
              <i class="fa-solid fa-calendar-week" style="color: var(--accent-emerald);"></i>
              <span>${getWeekDisplayLabel(activeWeekKey)}</span>
            </div>
            <div class="week-nav-subtitle">
              ${isCurrentWeek ? '<span class="badge-current-week">Esta Semana</span>' : (isPastWeek ? '<span class="badge-past-week">Semana Pasada</span>' : '<span class="badge-future-week">Planificación Futura</span>')} • ${totalScheduled}/28 comidas asignadas
            </div>
          </div>

          <button type="button" class="btn-week-nav" onclick="nextNutritionWeek()" title="Semana Siguiente">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <div class="week-quick-jump-pills">
          <button type="button" class="week-jump-pill ${isCurrentWeek ? 'active' : ''}" onclick="goToCurrentNutritionWeek()">
            Esta Semana
          </button>
          <button type="button" class="week-jump-pill ${activeWeekKey === nextWeekKey ? 'active' : ''}" onclick="setNutritionActiveWeek('${nextWeekKey}')">
            Próxima Semana
          </button>
          <button type="button" class="week-jump-pill ${activeWeekKey === week2Key ? 'active' : ''}" onclick="setNutritionActiveWeek('${week2Key}')">
            En +2 Semanas
          </button>
          <button type="button" class="week-jump-pill ${activeWeekKey === week3Key ? 'active' : ''}" onclick="setNutritionActiveWeek('${week3Key}')">
            En +3 Semanas
          </button>
          <button type="button" class="week-jump-pill" onclick="copyPreviousWeekPlan()" title="Copiar menú de la semana anterior">
            <i class="fa-solid fa-clone"></i> Copiar anterior
          </button>
        </div>
      </div>

      <div class="planner-actions-bar">
        <button type="button" class="btn-generate-shopping-glow" onclick="generateShoppingListFromPlan()">
          <i class="fa-solid fa-cart-shopping"></i> Generar Lista de la Compra
          <span class="shopping-count-badge">${totalScheduled}/28 platos</span>
        </button>

        <div class="planner-quick-tools">
          <button type="button" class="btn-planner-tool" onclick="autoFillWeeklyPlan()" title="Auto-rellenar semana con platos variados">
            <i class="fa-solid fa-wand-magic-sparkles"></i> <span>Auto-completar</span>
          </button>
          <button type="button" class="btn-planner-tool" onclick="copyWeeklyMenuToClipboard()" title="Copiar menú semanal a texto">
            <i class="fa-solid fa-share-nodes"></i> <span>Compartir</span>
          </button>
          <button type="button" class="btn-planner-tool danger" onclick="clearWeeklyPlan()" title="Vaciar semana">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>

      <!-- VIEW MODE SWITCHER & DAYS BAR -->
      <div class="planner-days-bar-wrapper">
        <div class="planner-days-scroll">
          ${DAYS_OF_WEEK.map(dayName => {
            const dayPlan = currentWeeklyPlan?.[dayName] || {};
            const filledCount = MEAL_SLOTS.filter(s => !!dayPlan[s.key]).length;
            const isSelected = (viewMode === 'day' && activeDay === dayName);
            const dayIso = getDateForDayInWeek(activeWeekKey, dayName);
            const dayDateNumber = new Date(dayIso + 'T00:00:00').getDate();
            const isToday = (getTodayDayName() === dayName && isCurrentWeek);

            return `
              <button type="button" class="planner-day-pill ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}" onclick="selectDay('${dayName}')">
                <span class="day-pill-name">${dayName.substring(0, 3)} ${dayDateNumber}</span>
                <span class="day-pill-badge ${filledCount === 4 ? 'complete' : ''}">${filledCount}/4</span>
              </button>
            `;
          }).join("")}
        </div>

        <div class="planner-view-toggle">
          <button type="button" class="btn-view-toggle ${viewMode === 'day' ? 'active' : ''}" onclick="toggleNutritionViewMode('day')" title="Vista Detallada por Día">
            <i class="fa-solid fa-calendar-day"></i> Día
          </button>
          <button type="button" class="btn-view-toggle ${viewMode === 'week' ? 'active' : ''}" onclick="toggleNutritionViewMode('week')" title="Vista Tablero Semanal Completo">
            <i class="fa-solid fa-calendar-week"></i> Semana
          </button>
        </div>
      </div>
    `;
    container.appendChild(toolbar);

    // 2. Render Plan Content according to View Mode
    if (viewMode === "day") {
      renderDayDetailView(container, activeDay, targetCalories, targetProtein);
    } else {
      renderFullWeekGridView(container);
    }

  } catch(e) {
    console.error("Error rendering Nutrition Menu View:", e);
  }
}

/**
 * Render Day-by-Day focused detail view
 */
function renderDayDetailView(container, dayName, targetCalories, targetProtein) {
  const currentWeeklyPlan = getActiveWeeklyPlan();
  const dayPlan = currentWeeklyPlan?.[dayName] || {};
  let dayKcal = 0;
  let dayProtein = 0;
  let dayCarbs = 0;
  let dayFats = 0;

  // Calculate day total macros
  MEAL_SLOTS.forEach(slot => {
    const rId = dayPlan[slot.key];
    const r = getRecipeById(rId);
    if (r) {
      dayKcal += Number(r.calories || 0);
      dayProtein += Number(r.protein || 0);
      dayCarbs += Number(r.carbs || 0);
      dayFats += Number(r.fats || 0);
    }
  });

  const safeTargetCalories = Number(targetCalories) > 0 ? Number(targetCalories) : (appState.activeProfileId === 'he' ? 2150 : 1850);
  const safeTargetProtein = Number(targetProtein) > 0 ? Number(targetProtein) : (appState.activeProfileId === 'he' ? 155 : 130);

  // Daily Nutritional Balance Bar
  const kcalPercent = Math.min(Math.max(Math.round((dayKcal / safeTargetCalories) * 100), 0), 100);
  const protPercent = Math.min(Math.max(Math.round((dayProtein / safeTargetProtein) * 100), 0), 100);

  const balanceCard = document.createElement("div");
  balanceCard.className = "glass-card daily-nutrition-balance-card";
  balanceCard.innerHTML = `
    <div class="balance-header">
      <div class="balance-title">
        <i class="fa-solid fa-chart-pie" style="color: var(--accent-cyan);"></i>
        <div>
          <h4>Balance Nutricional de ${dayName}</h4>
          <p>Objetivo Diario: ${safeTargetCalories} kcal • ${safeTargetProtein}g Proteína</p>
        </div>
      </div>
      <div class="balance-totals-chips">
        <span class="macro-chip cal"><i class="fa-solid fa-fire"></i> <strong>${dayKcal}</strong> / ${safeTargetCalories} kcal</span>
        <span class="macro-chip prot"><i class="fa-solid fa-dumbbell"></i> <strong>${dayProtein}g</strong> / ${safeTargetProtein}g Prot</span>
        <span class="macro-chip carbs"><i class="fa-solid fa-wheat-awn"></i> <strong>${dayCarbs}g</strong> Carbs</span>
        <span class="macro-chip fats"><i class="fa-solid fa-droplet"></i> <strong>${dayFats}g</strong> Grasas</span>
      </div>
    </div>

    <div class="balance-progress-bars">
      <div class="balance-bar-row">
        <span class="bar-label">Calorías (${kcalPercent}%)</span>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill cal" style="width: ${kcalPercent}%;"></div>
        </div>
      </div>
      <div class="balance-bar-row">
        <span class="bar-label">Proteína (${protPercent}%)</span>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill prot" style="width: ${protPercent}%;"></div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(balanceCard);

  // Render 4 Interactive Meal Slots for Active Day
  const slotsStack = document.createElement("div");
  slotsStack.className = "vertical-meal-stack";

  MEAL_SLOTS.forEach((slot, idx) => {
    const recipeId = dayPlan[slot.key];
    const recipe = getRecipeById(recipeId);

    const slotCard = document.createElement("div");
    slotCard.className = `glass-card meal-card vertical-meal-card slot-card ${recipe ? 'has-recipe' : 'is-empty'}`;

    if (recipe) {
      const tagsHtml = (recipe.tags || []).map(t => `<span class="macro-pill">${t}</span>`).join(" ");

      slotCard.innerHTML = `
        <div class="slot-card-header">
          <div class="meal-card-type" style="color: ${slot.color};">
            <i class="fa-solid ${slot.icon}"></i> <strong>${slot.label}</strong> • ${recipe.prepTime || 15} min prep
          </div>
          <div class="slot-actions-group">
            <button type="button" class="btn-slot-action edit" onclick="openRecipePickerModal('${dayName}', '${slot.key}')" title="Cambiar receta">
              <i class="fa-solid fa-rotate"></i> Cambiar
            </button>
            <button type="button" class="btn-slot-action view" onclick="openRecipeDetailModal('${recipe.id}')" title="Ver receta y preparación">
              <i class="fa-solid fa-book-open"></i> Ver
            </button>
            <button type="button" class="btn-slot-action remove" onclick="removeMealFromSlot('${dayName}', '${slot.key}')" title="Quitar de este día">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <h3 class="meal-card-title clickable-meal-title" onclick="openRecipeDetailModal('${recipe.id}')">
          <span>${recipe.name}</span>
          <i class="fa-solid fa-chevron-right" style="font-size: 0.85rem; color: var(--accent-cyan); opacity: 0.8;"></i>
        </h3>

        <div class="meal-macros-pills">
          <span class="macro-pill" style="color:var(--accent-amber); font-weight:600;"><i class="fa-solid fa-fire"></i> ${recipe.calories} kcal</span>
          <span class="macro-pill" style="color:var(--accent-emerald); font-weight:600;"><i class="fa-solid fa-dumbbell"></i> ${recipe.protein}g Proteína</span>
          <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${recipe.carbs}g Carbs</span>
          <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${recipe.fats}g Grasas</span>
        </div>

        ${tagsHtml ? `<div style="margin-bottom: 0.6rem;">${tagsHtml}</div>` : ''}

        <details class="recipe-prep-details">
          <summary>
            <i class="fa-solid fa-kitchen-set"></i> Ver Pasos de Preparación (${(recipe.instructions || []).length} pasos)
          </summary>
          <ol class="recipe-prep-steps">
            ${(recipe.instructions || []).map(step => `<li>${step}</li>`).join("")}
          </ol>
        </details>
      `;
    } else {
      // Empty Slot Call-To-Action Card
      slotCard.innerHTML = `
        <div class="empty-slot-content" onclick="openRecipePickerModal('${dayName}', '${slot.key}')">
          <div class="empty-slot-icon" style="color: ${slot.color};">
            <i class="fa-solid ${slot.icon}"></i>
          </div>
          <div class="empty-slot-text">
            <h4>${slot.label} (Sin Asignar)</h4>
            <p>Toca para seleccionar un plato del backlog de recetas</p>
          </div>
          <button type="button" class="btn-empty-slot-add">
            <i class="fa-solid fa-plus"></i> Añadir Receta
          </button>
        </div>
      `;
    }

    slotsStack.appendChild(slotCard);
  });

  container.appendChild(slotsStack);
}

/**
 * Render Full Week Matrix View (7 columns grid)
 */
function renderFullWeekGridView(container) {
  const gridWrapper = document.createElement("div");
  gridWrapper.className = "planner-week-matrix-grid";
  const currentWeeklyPlan = getActiveWeeklyPlan();

  DAYS_OF_WEEK.forEach(dayName => {
    const dayPlan = currentWeeklyPlan?.[dayName] || {};
    const col = document.createElement("div");
    col.className = `matrix-day-column ${appState.activeDay === dayName ? 'active-col' : ''}`;

    const slotsHtml = MEAL_SLOTS.map(slot => {
      const rId = dayPlan[slot.key];
      const r = getRecipeById(rId);

      if (r) {
        return `
          <div class="matrix-meal-cell has-meal" onclick="openRecipePickerModal('${dayName}', '${slot.key}')">
            <div class="matrix-cell-header" style="color:${slot.color};">
              <i class="fa-solid ${slot.icon}"></i> <span>${slot.key.toUpperCase()}</span>
            </div>
            <div class="matrix-meal-name">${r.name}</div>
            <div class="matrix-meal-meta">${r.calories} kcal • ${r.protein}g P</div>
          </div>
        `;
      } else {
        return `
          <div class="matrix-meal-cell empty-meal" onclick="openRecipePickerModal('${dayName}', '${slot.key}')">
            <span style="color:${slot.color}; font-size:0.7rem;"><i class="fa-solid ${slot.icon}"></i> ${slot.key.toUpperCase()}</span>
            <span class="matrix-add-plus"><i class="fa-solid fa-plus"></i> Elegir</span>
          </div>
        `;
      }
    }).join("");

    col.innerHTML = `
      <div class="matrix-col-header" onclick="selectDay('${dayName}')">
        <strong>${dayName}</strong>
        <small>${getTodayDayName() === dayName ? 'HOY' : ''}</small>
      </div>
      <div class="matrix-col-slots">
        ${slotsHtml}
      </div>
    `;

    gridWrapper.appendChild(col);
  });

  container.appendChild(gridWrapper);
}

/**
 * Computes intelligent compensation suggestions for a slot in a day.
 * Analyzes meals already selected for the day (e.g. if lunch is high in carbs or calories,
 * suggests light, high-protein options for dinner/snack to maintain balance).
 */
export function getCompensationInsight(dayName, slotKey) {
  try {
    const currentPlan = getActiveWeeklyPlan();
    const dayPlan = currentPlan?.[dayName] || {};

    const comidaId = dayPlan.comida;
    const comidaRecipe = comidaId ? getRecipeById(comidaId) : null;

    const desayunoId = dayPlan.desayuno;
    const desayunoRecipe = desayunoId ? getRecipeById(desayunoId) : null;

    const meriendaId = dayPlan.merienda;
    const meriendaRecipe = meriendaId ? getRecipeById(meriendaId) : null;

    const cenaId = dayPlan.cena;
    const cenaRecipe = cenaId ? getRecipeById(cenaId) : null;

    const activeProfile = appState.profiles?.[appState.activeProfileId] || {};
    const targetKcal = Number(activeProfile.targetCalories || (appState.activeProfileId === 'he' ? 2150 : 1850));
    const targetProt = Number(activeProfile.protein || (appState.activeProfileId === 'he' ? 155 : 130));

    // Calculate macros planned so far excluding current slot
    let totalKcalPlanned = 0;
    let totalProtPlanned = 0;
    let totalCarbsPlanned = 0;

    [
      { key: "desayuno", r: desayunoRecipe },
      { key: "comida", r: comidaRecipe },
      { key: "merienda", r: meriendaRecipe },
      { key: "cena", r: cenaRecipe }
    ].forEach(item => {
      if (item.r && item.key !== slotKey) {
        totalKcalPlanned += Number(item.r.calories || 0);
        totalProtPlanned += Number(item.r.protein || 0);
        totalCarbsPlanned += Number(item.r.carbs || 0);
      }
    });

    // 1. Picking CENA when COMIDA was high in carbs or heavy in kcal
    if (slotKey === "cena" && comidaRecipe) {
      const cCarbs = Number(comidaRecipe.carbs || 0);
      const cKcal = Number(comidaRecipe.calories || 0);
      const isHighCarb = cCarbs >= 45;
      const isHeavy = cKcal >= 600;

      if (isHighCarb || isHeavy) {
        const reason = isHighCarb && isHeavy
          ? `Ya que la comida de hoy (${comidaRecipe.name}) es alta en carbohidratos (${cCarbs}g) y calórica (${cKcal} kcal)`
          : isHighCarb
            ? `Ya que la comida de hoy (${comidaRecipe.name}) es alta en carbohidratos (${cCarbs}g)`
            : `Ya que la comida de hoy (${comidaRecipe.name}) es más contundente (${cKcal} kcal)`;

        return {
          hasSuggestion: true,
          type: "compensate_carbs_heavy",
          title: "Sugerencia de Compensación y Equilibrio",
          message: `${reason}, te recomendamos para la cena una opción ligera, con verduras y rica en proteína para equilibrar el día:`,
          filterHint: "Opciones ligeras / bajas en carbohidratos sugeridas primero",
          matcher: (r) => (Number(r.carbs || 0) <= 25) && (Number(r.protein || 0) >= 20)
        };
      }

      // If comida was very light (< 380 kcal)
      if (cKcal > 0 && cKcal <= 380) {
        return {
          hasSuggestion: true,
          type: "boost_dinner",
          title: "Sugerencia para Completar el Día",
          message: `La comida (${comidaRecipe.name}) ha sido muy ligera (${cKcal} kcal). Puedes optar por una cena más completa para asegurar tus requerimientos diarios:`,
          filterHint: "Platos completos sugeridos primero",
          matcher: (r) => Number(r.calories || 0) >= 420
        };
      }
    }

    // 2. Picking MERIENDA / SNACK when COMIDA was high carb / heavy
    if (slotKey === "merienda" && comidaRecipe) {
      const cCarbs = Number(comidaRecipe.carbs || 0);
      const cKcal = Number(comidaRecipe.calories || 0);
      if (cCarbs >= 45 || cKcal >= 600) {
        return {
          hasSuggestion: true,
          type: "compensate_snack",
          title: "Snack Ligero Recomendado",
          message: `Con una comida contundente (${comidaRecipe.name} • ${cCarbs}g carbs), un snack bajo en calorías o rico en proteína mantendrá tu saciedad sin sumar exceso de calorías:`,
          filterHint: "Snacks ligeros / proteicos recomendados",
          matcher: (r) => (Number(r.calories || 0) <= 200) || (Number(r.carbs || 0) <= 15)
        };
      }
    }

    // 3. Picking COMIDA when DESAYUNO was high carb / heavy
    if (slotKey === "comida" && desayunoRecipe) {
      const dCarbs = Number(desayunoRecipe.carbs || 0);
      if (dCarbs >= 45 || Number(desayunoRecipe.calories || 0) >= 500) {
        return {
          hasSuggestion: true,
          type: "compensate_lunch",
          title: "Equilibrio para el Almuerzo",
          message: `El desayuno de hoy aportó bastante energía (${dCarbs}g carbs). Una comida rica en verduras y proteína magra mantendrá tu energía estable:`,
          filterHint: "Opciones balanceadas sugeridas primero",
          matcher: (r) => Number(r.carbs || 0) <= 40
        };
      }
    }

    // 4. Daily Protein Deficit check (for dinner or lunch if lots of protein still needed)
    const remainingProt = targetProt - totalProtPlanned;
    if (remainingProt >= 45 && (slotKey === "cena" || slotKey === "comida")) {
      return {
        hasSuggestion: true,
        type: "protein_focus",
        title: "Objetivo de Proteína del Día",
        message: `Te faltan ${Math.round(remainingProt)}g de proteína para tu meta diaria (${targetProt}g). Te sugerimos platos con alto contenido proteico (≥30g):`,
        filterHint: "Platos ricos en proteína sugeridos primero",
        matcher: (r) => Number(r.protein || 0) >= 30
      };
    }
  } catch(e) {
    console.error("Error computing compensation insight:", e);
  }

  return {
    hasSuggestion: false,
    title: "",
    message: "",
    filterHint: "",
    matcher: null
  };
}

/**
 * OPEN RECIPE PICKER MODAL (From Weekly Planner Slot)
 */
export function openRecipePickerModal(dayName, slotKey) {
  try {
    triggerHapticTouch();
    const currentWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
    activePickerContext = { day: dayName, slot: slotKey, weekKey: currentWeekKey };
    
    // Map slot key to default category filter
    let defaultCat = "all";
    if (slotKey === "desayuno") defaultCat = "desayuno";
    else if (slotKey === "comida") defaultCat = "comida";
    else if (slotKey === "cena") defaultCat = "cena";
    else if (slotKey === "merienda") defaultCat = "snack";
    
    activeBacklogCategoryFilter = defaultCat;
    activeBacklogSearchQuery = "";

    const modal = document.getElementById("recipe-picker-modal");
    if (!modal) {
      createRecipePickerModalDOM();
    }
    
    renderRecipePickerModalContent();
    const modalElem = document.getElementById("recipe-picker-modal");
    if (modalElem) modalElem.classList.add("active");
  } catch(e) {
    console.error("Error opening recipe picker modal:", e);
  }
}

export function closeRecipePickerModal() {
  const modal = document.getElementById("recipe-picker-modal");
  if (modal) modal.classList.remove("active");
}

export function closeRecipePickerModalOnBackdrop(event) {
  if (event.target.id === "recipe-picker-modal") {
    closeRecipePickerModal();
  }
}

/**
 * Assign recipe to the active picker slot and update state
 */
export function selectRecipeForActiveSlot(recipeId) {
  try {
    triggerHapticTouch();
    const { day, slot, weekKey } = activePickerContext;
    if (!day || !slot) return;
    const targetWeekKey = weekKey || appState.activeNutritionWeekKey || getCurrentWeekKey();

    if (!appState.weeklyMealPlans) appState.weeklyMealPlans = {};
    if (!appState.weeklyMealPlans[targetWeekKey]) {
      appState.weeklyMealPlans[targetWeekKey] = createEmptyWeeklyPlan();
    }
    if (!appState.weeklyMealPlans[targetWeekKey][day]) {
      appState.weeklyMealPlans[targetWeekKey][day] = { desayuno: null, comida: null, merienda: null, cena: null };
    }

    appState.weeklyMealPlans[targetWeekKey][day][slot] = recipeId;
    if (targetWeekKey === (appState.activeNutritionWeekKey || getCurrentWeekKey())) {
      appState.weeklyMealPlan = appState.weeklyMealPlans[targetWeekKey];
    }

    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) {
      window.pushToCloud(false).catch(() => {});
    }

    closeRecipePickerModal();
    renderNutritionMenuView();
    renderShoppingView();

    const recipe = getRecipeById(recipeId);
    showIosToast(`✅ ${recipe ? recipe.name : 'Plato'} asignado a ${day} (${slot})`, "fa-solid fa-circle-check");
  } catch(e) {
    console.error("Error selecting recipe for active slot:", e);
  }
}

/**
 * Create Recipe Picker Modal DOM if not present
 */
function createRecipePickerModalDOM() {
  const modal = document.createElement("div");
  modal.id = "recipe-picker-modal";
  modal.className = "modal-overlay";
  modal.onclick = closeRecipePickerModalOnBackdrop;
  modal.innerHTML = `
    <div class="glass-modal recipe-picker-modal-card" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-header-title">
          <i class="fa-solid fa-book-open" style="color: var(--accent-emerald); font-size: 1.3rem;"></i>
          <div>
            <h3 id="picker-modal-title">Elegir del Backlog de Recetas</h3>
            <p id="picker-modal-subtitle">Selecciona una receta para añadir a tu semana</p>
          </div>
        </div>
        <button type="button" class="modal-close-btn" onclick="closeRecipePickerModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="picker-search-bar">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="picker-search-input" placeholder="Buscar por nombre o ingrediente..." oninput="onPickerSearchInput(this.value)">
      </div>

      <div class="picker-category-filters" id="picker-category-filters">
        <button type="button" class="picker-cat-btn ${activeBacklogCategoryFilter === 'all' ? 'active' : ''}" onclick="setPickerCategoryFilter('all')">Todas</button>
        <button type="button" class="picker-cat-btn ${activeBacklogCategoryFilter === 'desayuno' ? 'active' : ''}" onclick="setPickerCategoryFilter('desayuno')">☀️ Desayunos</button>
        <button type="button" class="picker-cat-btn ${activeBacklogCategoryFilter === 'comida' ? 'active' : ''}" onclick="setPickerCategoryFilter('comida')">🥗 Comidas</button>
        <button type="button" class="picker-cat-btn ${activeBacklogCategoryFilter === 'cena' ? 'active' : ''}" onclick="setPickerCategoryFilter('cena')">🌙 Cenas</button>
        <button type="button" class="picker-cat-btn ${activeBacklogCategoryFilter === 'snack' ? 'active' : ''}" onclick="setPickerCategoryFilter('snack')">🍎 Snacks</button>
      </div>

      <div class="picker-recipes-list" id="picker-recipes-list">
        <!-- Renders dynamically -->
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

export function onPickerSearchInput(query) {
  activeBacklogSearchQuery = query;
  renderRecipePickerModalContent();
}

export function setPickerCategoryFilter(cat) {
  triggerHapticTouch();
  activeBacklogCategoryFilter = cat;
  const filterContainer = document.getElementById("picker-category-filters");
  if (filterContainer) {
    filterContainer.querySelectorAll(".picker-cat-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("onclick")?.includes(`'${cat}'`));
    });
  }
  renderRecipePickerModalContent();
}

/**
 * Render recipes list in picker modal
 */
function renderRecipePickerModalContent() {
  const container = document.getElementById("picker-recipes-list");
  if (!container) return;

  const subtitle = document.getElementById("picker-modal-subtitle");
  if (subtitle && activePickerContext.day && activePickerContext.slot) {
    subtitle.innerText = `Asignando a: ${activePickerContext.day} • ${activePickerContext.slot.toUpperCase()}`;
  }

  const all = getFilteredRecipes();
  const query = (activeBacklogSearchQuery || "").toLowerCase().trim();
  const cat = activeBacklogCategoryFilter || "all";

  const matching = all.filter(recipe => {
    // Category match
    if (cat !== "all" && recipe.type !== cat) return false;
    // Query match
    if (query) {
      const matchName = (recipe.name || "").toLowerCase().includes(query);
      const matchIng = (recipe.ingredients || []).some(i => (i.name || "").toLowerCase().includes(query));
      const matchTags = (recipe.tags || []).some(t => t.toLowerCase().includes(query));
      if (!matchName && !matchIng && !matchTags) return false;
    }
    return true;
  });

  // Calculate Compensation Insight for the current slot and day
  const insight = getCompensationInsight(activePickerContext.day, activePickerContext.slot);

  let bannerHtml = "";
  if (insight && insight.hasSuggestion) {
    bannerHtml = `
      <div class="compensation-banner">
        <div class="compensation-banner-header">
          <i class="fa-solid fa-scale-balanced" style="color: var(--accent-cyan); font-size: 1.15rem;"></i>
          <span>${insight.title}</span>
        </div>
        <p class="compensation-banner-text">${insight.message}</p>
        <div class="compensation-banner-note">
          <i class="fa-solid fa-star" style="color: var(--accent-amber);"></i>
          <span>${insight.filterHint} (puedes elegir cualquier plato libremente).</span>
        </div>
      </div>
    `;

    // Sort matching so recommended items appear first
    if (typeof insight.matcher === 'function') {
      matching.sort((a, b) => {
        const isA = insight.matcher(a) ? 1 : 0;
        const isB = insight.matcher(b) ? 1 : 0;
        return isB - isA;
      });
    }
  }

  if (matching.length === 0) {
    container.innerHTML = `
      ${bannerHtml}
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-utensils" style="font-size: 2rem; opacity: 0.3; margin-bottom: 0.5rem; display:block;"></i>
        <p>No se han encontrado recetas con los filtros actuales.</p>
        <button type="button" class="btn-primary" onclick="closeRecipePickerModal(); openCreateRecipeModal();" style="margin-top: 0.75rem;">
          <i class="fa-solid fa-plus"></i> + Añadir Nueva Receta
        </button>
      </div>
    `;
    return;
  }

  const currentSelectedRecipeId = appState.weeklyMealPlan?.[activePickerContext.day]?.[activePickerContext.slot];

  const listHtml = matching.map(recipe => {
    const isCurrentlySelected = (currentSelectedRecipeId === recipe.id);
    const isRecommended = Boolean(insight && insight.hasSuggestion && typeof insight.matcher === 'function' && insight.matcher(recipe));
    const tagsHtml = (recipe.tags || []).slice(0, 3).map(t => `<span class="macro-pill">${t}</span>`).join(" ");

    return `
      <div class="picker-recipe-item ${isCurrentlySelected ? 'currently-active' : ''} ${isRecommended ? 'is-recommended-item' : ''}">
        <div class="picker-item-main">
          <div class="picker-item-type">
            <span class="type-pill ${recipe.type}">${recipe.type.toUpperCase()}</span>
            <span class="prep-time"><i class="fa-regular fa-clock"></i> ${recipe.prepTime || 15} min</span>
            ${isRecommended ? '<span class="badge-recommended"><i class="fa-solid fa-star"></i> Sugerencia para equilibrar</span>' : ''}
            ${isCurrentlySelected ? '<span class="active-badge">✓ Asignada actualmente</span>' : ''}
          </div>
          <h4 class="picker-item-title">${recipe.name}</h4>
          <div class="picker-item-macros">
            <span style="color:var(--accent-amber); font-weight:700;"><i class="fa-solid fa-fire"></i> ${recipe.calories} kcal</span>
            <span style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-dumbbell"></i> ${recipe.protein}g Prot</span>
            <span style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${recipe.carbs}g Carbs</span>
            <span style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${recipe.fats}g Grasas</span>
          </div>
          <div style="margin-top: 0.35rem;">${tagsHtml}</div>
        </div>

        <div class="picker-item-action">
          <button type="button" class="btn-select-recipe ${isCurrentlySelected ? 'selected' : ''}" onclick="selectRecipeForActiveSlot('${recipe.id}')">
            <i class="fa-solid ${isCurrentlySelected ? 'fa-check' : 'fa-plus'}"></i> ${isCurrentlySelected ? 'Asignada' : 'Seleccionar'}
          </button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = bannerHtml + listHtml;
}

/**
 * RENDER SUBTAB 2: RECIPES BACKLOG CATALOGUE
 */
export function setRecipesRange(range) {
  try {
    triggerHapticTouch();
    appState.recipesDaysRange = range;
    saveState();
    renderNutritionRecipesView();
  } catch(e) {
    console.error("Error setting recipes range:", e);
  }
}

export function renderNutritionRecipesView() {
  try {
    const container = document.getElementById("recipes-cards-container");
    if (!container) return;
    container.innerHTML = "";

    const all = getAllRecipes();
    const query = (activeBacklogSearchQuery || "").toLowerCase().trim();
    const cat = activeBacklogCategoryFilter || "all";

    // 1. Render Catalog Header Tools (Search, Categories & Add Recipe Button)
    const headerWrapper = document.createElement("div");
    headerWrapper.className = "backlog-header-controls";
    headerWrapper.innerHTML = `
      <div class="backlog-search-row">
        <div class="picker-search-bar" style="margin-bottom: 0; flex: 1;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" value="${activeBacklogSearchQuery}" placeholder="Buscar en el catálogo de recetas o ingredientes..." oninput="onBacklogCatalogSearch(this.value)">
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn-primary" onclick="openAiRecipeGeneratorModal()" style="background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)); border: none; font-weight: 700; gap: 0.4rem;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Modo Inteligente
          </button>
          <button type="button" class="btn-primary" onclick="openCreateRecipeModal()" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-main);">
            <i class="fa-solid fa-plus"></i> Manual
          </button>
        </div>
      </div>

      <div class="backlog-filters-row">
        <div class="picker-category-filters" style="margin-bottom: 0;">
          <button type="button" class="picker-cat-btn ${cat === 'all' ? 'active' : ''}" onclick="setBacklogCatalogCategory('all')">Todas (${all.length})</button>
          <button type="button" class="picker-cat-btn ${cat === 'desayuno' ? 'active' : ''}" onclick="setBacklogCatalogCategory('desayuno')">☀️ Desayunos</button>
          <button type="button" class="picker-cat-btn ${cat === 'comida' ? 'active' : ''}" onclick="setBacklogCatalogCategory('comida')">🥗 Comidas</button>
          <button type="button" class="picker-cat-btn ${cat === 'cena' ? 'active' : ''}" onclick="setBacklogCatalogCategory('cena')">🌙 Cenas</button>
          <button type="button" class="picker-cat-btn ${cat === 'snack' ? 'active' : ''}" onclick="setBacklogCatalogCategory('snack')">🍎 Snacks</button>
        </div>
      </div>
    `;
    container.appendChild(headerWrapper);

    // 2. Filter Recipes
    const filtered = all.filter(recipe => {
      if (cat !== "all" && recipe.type !== cat) return false;
      if (query) {
        const matchName = (recipe.name || "").toLowerCase().includes(query);
        const matchIng = (recipe.ingredients || []).some(i => (i.name || "").toLowerCase().includes(query));
        const matchTags = (recipe.tags || []).some(t => t.toLowerCase().includes(query));
        if (!matchName && !matchIng && !matchTags) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "glass-card";
      emptyDiv.style.cssText = "text-align:center; padding: 3rem 1.5rem; color: var(--text-muted); grid-column: 1 / -1; max-width: 520px; margin: 2rem auto;";
      if (all.length === 0) {
        emptyDiv.innerHTML = `
          <div style="font-size: 2.8rem; color: var(--accent-emerald); opacity: 0.8; margin-bottom: 0.8rem;">
            <i class="fa-solid fa-kitchen-set"></i>
          </div>
          <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Catálogo Listo (0 Recetas)</h3>
          <p style="font-size: 0.88rem; line-height: 1.5; margin-bottom: 1.5rem;">Describe lo que te apetece con el Modo Inteligente para calcular ingredientes y macros al instante, o añade tus platos manualmente.</p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn-primary" onclick="openAiRecipeGeneratorModal()" style="background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)); border: none; font-weight: 700;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Describir con Modo Inteligente
            </button>
            <button type="button" class="btn-primary" onclick="openCreateRecipeModal()" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-main);">
              <i class="fa-solid fa-plus"></i> Añadir Manualmente
            </button>
          </div>
        `;
      } else {
        emptyDiv.innerHTML = `
          <i class="fa-solid fa-kitchen-set" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 0.8rem; display:block;"></i>
          <p>No se encontraron recetas con los filtros actuales.</p>
          <button type="button" class="btn-primary" onclick="setBacklogCatalogCategory('all'); onBacklogCatalogSearch('');" style="margin-top: 1rem;">
            Limpiar Filtros
          </button>
        `;
      }
      container.appendChild(emptyDiv);
      return;
    }

    // 3. Render Recipe Cards Grid
    const grid = document.createElement("div");
    grid.className = "recipes-grid";

    filtered.forEach(meal => {
      const card = document.createElement("div");
      card.className = "glass-card recipe-batch-card";
      card.id = `recipe-card-${meal.id}`;
      card.dataset.recipeId = meal.id;

      const ingredientsHtml = (meal.ingredients || []).map(ing => `
        <li><span>${ing.name}</span><strong>${ing.amount} ${ing.unit}</strong></li>
      `).join("");

      const isCustom = (appState.customRecipes || []).some(r => r.id === meal.id);

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.4rem;">
            <span class="meal-card-type"><i class="fa-solid fa-fire-burner"></i> ${meal.type.toUpperCase()} • ${meal.prepTime || 15} min</span>
            ${isCustom ? '<span style="font-size:0.7rem; background:rgba(16,185,129,0.15); color:var(--accent-emerald); padding:2px 8px; border-radius:10px; font-weight:700;">★ Personalizada</span>' : ''}
          </div>
          
          <h3 class="meal-card-title">${meal.name}</h3>

          <div class="meal-macros-pills">
            <span class="macro-pill" style="color:var(--accent-amber); font-weight:700;"><i class="fa-solid fa-fire"></i> ${meal.calories} kcal</span>
            <span class="macro-pill" style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-dumbbell"></i> ${meal.protein}g Prot</span>
            <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${meal.carbs}g Carbs</span>
            <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${meal.fats}g Grasas</span>
          </div>

          <h4 style="font-size:0.85rem; color:var(--text-muted); margin:0.75rem 0 0.4rem 0;"><i class="fa-solid fa-basket-shopping"></i> Ingredientes:</h4>
          <ul class="ingredient-list">${ingredientsHtml}</ul>

          <details style="font-size:0.85rem; color:var(--accent-cyan); cursor:pointer; margin-top:0.75rem; background:rgba(255,255,255,0.03); padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <summary style="font-weight:600;"><i class="fa-solid fa-kitchen-set"></i> Preparación Paso a Paso (${(meal.instructions || []).length} pasos)</summary>
            <ol style="margin-top:0.5rem; padding-left:1.2rem; color:var(--text-muted); line-height:1.5;">
              ${(meal.instructions || []).map(s => `<li>${s}</li>`).join("")}
            </ol>
          </details>
        </div>

        <div class="recipe-card-footer" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
          <button type="button" class="btn-primary" onclick="openAssignRecipeModal('${meal.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; flex: 1;">
            <i class="fa-solid fa-calendar-plus"></i> Asignar
          </button>
          <button type="button" class="btn-slot-action edit" onclick="openEditRecipeModal('${meal.id}')" title="Editar receta">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button type="button" class="btn-slot-action remove" onclick="deleteRecipe('${meal.id}')" title="Eliminar receta">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch(e) {
    console.error("Error rendering Nutrition Recipes View:", e);
  }
}

export function onBacklogCatalogSearch(query) {
  activeBacklogSearchQuery = query;
  renderNutritionRecipesView();
}

export function setBacklogCatalogCategory(cat) {
  triggerHapticTouch();
  activeBacklogCategoryFilter = cat;
  renderNutritionRecipesView();
}

/**
 * QUICK ASSIGN MODAL: Assign any recipe from backlog to a day
 */
export function openAssignRecipeModal(recipeId) {
  try {
    triggerHapticTouch();
    const recipe = getRecipeById(recipeId);
    if (!recipe) return;

    const curWeekKey = getCurrentWeekKey();
    const nextWeekKey = getOffsetWeekKey(curWeekKey, 1);
    const week2Key = getOffsetWeekKey(curWeekKey, 2);
    const week3Key = getOffsetWeekKey(curWeekKey, 3);
    const activeWeekKey = appState.activeNutritionWeekKey || curWeekKey;

    const daysHtml = DAYS_OF_WEEK.map(d => `<option value="${d}">${d}</option>`).join("");
    const defaultSlot = (recipe.type === "desayuno") ? "desayuno" : (recipe.type === "comida") ? "comida" : (recipe.type === "cena") ? "cena" : "merienda";

    let modal = document.getElementById("assign-recipe-quick-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "assign-recipe-quick-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="glass-modal" style="max-width: 440px;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-title">
            <i class="fa-solid fa-calendar-plus" style="color: var(--accent-emerald); font-size: 1.3rem;"></i>
            <div>
              <h3>Asignar Receta al Plan</h3>
              <p>${recipe.name}</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" onclick="document.getElementById('assign-recipe-quick-modal').classList.remove('active')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" style="padding-top: 1rem;">
          <form onsubmit="saveQuickAssignRecipe(event, '${recipe.id}')">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label><i class="fa-solid fa-calendar-week"></i> Semana de Planificación:</label>
              <select id="quick-assign-week" class="custom-select" style="width: 100%;">
                <option value="${curWeekKey}" ${activeWeekKey === curWeekKey ? 'selected' : ''}>📅 ${getWeekDisplayLabel(curWeekKey)}</option>
                <option value="${nextWeekKey}" ${activeWeekKey === nextWeekKey ? 'selected' : ''}>📅 ${getWeekDisplayLabel(nextWeekKey)}</option>
                <option value="${week2Key}" ${activeWeekKey === week2Key ? 'selected' : ''}>📅 ${getWeekDisplayLabel(week2Key)}</option>
                <option value="${week3Key}" ${activeWeekKey === week3Key ? 'selected' : ''}>📅 ${getWeekDisplayLabel(week3Key)}</option>
              </select>
            </div>
            <div class="form-group">
              <label><i class="fa-solid fa-calendar-day"></i> Día de la Semana:</label>
              <select id="quick-assign-day" class="custom-select" style="width: 100%;">
                ${daysHtml}
              </select>
            </div>
            <div class="form-group" style="margin-top: 0.75rem;">
              <label><i class="fa-solid fa-utensils"></i> Momento / Comida:</label>
              <select id="quick-assign-slot" class="custom-select" style="width: 100%;">
                <option value="desayuno" ${defaultSlot === 'desayuno' ? 'selected' : ''}>☀️ Desayuno</option>
                <option value="comida" ${defaultSlot === 'comida' ? 'selected' : ''}>🥗 Comida / Almuerzo</option>
                <option value="merienda" ${defaultSlot === 'merienda' ? 'selected' : ''}>🍎 Merienda / Snack</option>
                <option value="cena" ${defaultSlot === 'cena' ? 'selected' : ''}>🌙 Cena</option>
              </select>
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 1.25rem; width: 100%; justify-content: center;">
              <i class="fa-solid fa-check"></i> Confirmar Asignación
            </button>
          </form>
        </div>
      </div>
    `;

    modal.classList.add("active");
  } catch(e) {
    console.error("Error opening assign recipe modal:", e);
  }
}

export function saveQuickAssignRecipe(event, recipeId) {
  event.preventDefault();
  try {
    triggerHapticTouch();
    const targetWeekKey = document.getElementById("quick-assign-week")?.value || appState.activeNutritionWeekKey || getCurrentWeekKey();
    const day = document.getElementById("quick-assign-day")?.value || "Lunes";
    const slot = document.getElementById("quick-assign-slot")?.value || "comida";

    if (!appState.weeklyMealPlans) appState.weeklyMealPlans = {};
    if (!appState.weeklyMealPlans[targetWeekKey]) appState.weeklyMealPlans[targetWeekKey] = createEmptyWeeklyPlan();

    appState.weeklyMealPlans[targetWeekKey][day][slot] = recipeId;
    if (targetWeekKey === (appState.activeNutritionWeekKey || getCurrentWeekKey())) {
      appState.weeklyMealPlan = appState.weeklyMealPlans[targetWeekKey];
    }
    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) {
      window.pushToCloud(false).catch(() => {});
    }

    const modal = document.getElementById("assign-recipe-quick-modal");
    if (modal) modal.classList.remove("active");

    renderNutritionMenuView();
    renderShoppingView();

    const recipe = getRecipeById(recipeId);
    showIosToast(`✅ ${recipe ? recipe.name : 'Plato'} asignado a ${day} (${slot})`, "fa-solid fa-circle-check");
  } catch(e) {
    console.error("Error saving quick assign recipe:", e);
  }
}

/**
 * RECIPE DETAIL MODAL
 */
export function openRecipeDetailModal(recipeId) {
  try {
    triggerHapticTouch();
    const recipe = getRecipeById(recipeId);
    if (!recipe) return;

    let modal = document.getElementById("recipe-detail-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "recipe-detail-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const ingredientsHtml = (recipe.ingredients || []).map(ing => `
      <li style="display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px dashed var(--border-color); font-size: 0.88rem;">
        <span>${ing.name}</span>
        <strong>${ing.amount} ${ing.unit}</strong>
      </li>
    `).join("");

    const stepsHtml = (recipe.instructions || []).map((s, idx) => `
      <li style="margin-bottom: 0.6rem; line-height: 1.5; font-size: 0.88rem; color: var(--text-secondary);">
        <strong style="color: var(--accent-cyan);">Paso ${idx + 1}:</strong> ${s}
      </li>
    `).join("");

    modal.innerHTML = `
      <div class="glass-modal" style="max-width: 540px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-title">
            <i class="fa-solid fa-kitchen-set" style="color: var(--accent-cyan); font-size: 1.3rem;"></i>
            <div>
              <h3>${recipe.name}</h3>
              <p>${recipe.type.toUpperCase()} • ${recipe.prepTime || 15} min prep</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" onclick="document.getElementById('recipe-detail-modal').classList.remove('active')"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body" style="padding-top: 1rem;">
          <div class="meal-macros-pills" style="margin-bottom: 1rem;">
            <span class="macro-pill" style="color:var(--accent-amber); font-weight:700;"><i class="fa-solid fa-fire"></i> ${recipe.calories} kcal</span>
            <span class="macro-pill" style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-dumbbell"></i> ${recipe.protein}g Proteína</span>
            <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${recipe.carbs}g Carbs</span>
            <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${recipe.fats}g Grasas</span>
          </div>

          <h4 style="margin: 1rem 0 0.5rem 0; font-size: 0.95rem; color: var(--accent-emerald);"><i class="fa-solid fa-basket-shopping"></i> Ingredientes necesarios:</h4>
          <ul style="list-style:none; padding: 0;">${ingredientsHtml}</ul>

          <h4 style="margin: 1.25rem 0 0.5rem 0; font-size: 0.95rem; color: var(--accent-cyan);"><i class="fa-solid fa-list-ol"></i> Pasos de preparación:</h4>
          <ol style="padding-left: 1rem;">${stepsHtml}</ol>

          <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
            <button type="button" class="btn-primary" onclick="document.getElementById('recipe-detail-modal').classList.remove('active'); openAssignRecipeModal('${recipe.id}');" style="flex: 1; justify-content: center;">
              <i class="fa-solid fa-calendar-plus"></i> Asignar a un Día
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  } catch(e) {
    console.error("Error opening recipe detail modal:", e);
  }
}

let generatedRecipeCandidate = null;

/**
 * Automatically calculates macros for the modal form inputs based on the ingredients entered.
 */
export function autoCalculateRecipeModalMacros(prefix = 'new') {
  try {
    const textarea = document.getElementById(`${prefix}-recipe-ingredients`);
    if (!textarea) return;
    const raw = textarea.value.trim();
    if (!raw) return;

    const result = calculateMacrosFromIngredients(raw);
    const kcalInput = document.getElementById(`${prefix}-recipe-kcal`);
    const protInput = document.getElementById(`${prefix}-recipe-prot`);
    const carbsInput = document.getElementById(`${prefix}-recipe-carbs`);
    const fatsInput = document.getElementById(`${prefix}-recipe-fats`);
    const hintElem = document.getElementById(`${prefix}-recipe-macro-hint`);

    if (kcalInput && result.calories > 0) kcalInput.value = result.calories;
    if (protInput && result.protein >= 0) protInput.value = result.protein;
    if (carbsInput && result.carbs >= 0) carbsInput.value = result.carbs;
    if (fatsInput && result.fats >= 0) fatsInput.value = result.fats;

    if (hintElem) {
      hintElem.innerHTML = `
        <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.25); border-radius: 6px; padding: 5px 10px; margin-top: 5px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; font-size: 0.78rem;">
          <span style="color: var(--text-main);"><i class="fa-solid fa-calculator" style="color:var(--accent-cyan); margin-right: 4px;"></i> Macros calculados: <strong style="color:var(--accent-amber);">${result.calories} kcal</strong> (${result.protein}g Prot • ${result.carbs}g Carbs • ${result.fats}g Grasas)</span>
          <span style="color: var(--accent-emerald); font-weight: 600;">✓ Auto-rellenado</span>
        </div>
      `;
    }
  } catch(e) {
    console.error("Error auto-calculating macros:", e);
  }
}

/**
 * AI / SMART RECIPE GENERATOR MODAL
 */
export function openAiRecipeGeneratorModal() {
  try {
    triggerHapticTouch();
    let modal = document.getElementById("ai-recipe-generator-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "ai-recipe-generator-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    generatedRecipeCandidate = null;

    modal.innerHTML = `
      <div class="glass-modal ai-generator-modal-card" style="max-width: 580px; max-height: 92vh; overflow-y: auto;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-title">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(6,182,212,0.3);">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3>Modo Inteligente: Generador de Recetas</h3>
              <p>Describe tu plato o ingredientes y calcularemos pasos y macros</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" onclick="document.getElementById('ai-recipe-generator-modal').classList.remove('active')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body" style="padding-top: 1rem;">
          <div class="form-group">
            <label style="font-weight: 600; display:flex; justify-content:space-between; margin-bottom: 0.4rem;">
              <span>Describe la receta que quieres</span>
              <span style="font-size:0.75rem; color:var(--accent-cyan);">Lenguaje natural</span>
            </label>
            <textarea id="ai-prompt-input" class="ios-input" rows="3" placeholder="ej. Quiero un plato de pasta con carne picada de ternera magra, tomate frito y un poco de queso rallado"></textarea>
          </div>

          <div style="margin: 0.85rem 0;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom: 0.4rem;">💡 Pulsa una sugerencia rápida para probar:</span>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Pasta integral con carne picada de ternera magra, salsa de tomate y queso parmesano')">🍝 Pasta con Ternera</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Arroz basmati con pechuga de pollo y pimientos salteados')">🍚 Arroz con Pollo</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Lomo de salmón a la plancha con patatas al horno y espárragos trigueros')">🐟 Salmón con Patatas</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Tortilla francesa de 2 huevos con espinacas baby y queso feta')">🍳 Tortilla con Espinacas</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Bowl de yogur griego con copos de avena, plátano y nueces')">🥣 Bowl de Avena y Yogur</button>
            </div>
          </div>

          <div class="form-grid-2" style="margin-top: 0.85rem;">
            <div class="form-group">
              <label>Tipo de Comida</label>
              <select id="ai-meal-type" class="custom-select" style="width: 100%;">
                <option value="auto">✨ Auto-detectar</option>
                <option value="comida">🥗 Comida / Almuerzo</option>
                <option value="cena">🌙 Cena</option>
                <option value="desayuno">☀️ Desayuno</option>
                <option value="snack">🍎 Snack / Merienda</option>
              </select>
            </div>
            <div class="form-group">
              <label>Raciones</label>
              <select id="ai-servings" class="custom-select" style="width: 100%;">
                <option value="1">1 Ración (Individual)</option>
                <option value="2">2 Raciones (Carlos y Andrea)</option>
              </select>
            </div>
          </div>

          <button type="button" class="btn-primary" onclick="generateAiRecipeFromForm()" style="width: 100%; justify-content: center; padding: 0.85rem; margin-top: 1.25rem; font-size: 0.95rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)); border: none; font-weight: 700; box-shadow: 0 4px 16px rgba(6,182,212,0.3);">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Generar Receta con Macros y Pasos
          </button>

          <!-- RESULT CONTAINER -->
          <div id="ai-recipe-result-container" style="margin-top: 1.25rem; display: none;"></div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  } catch(e) {
    console.error("Error opening AI Recipe Generator Modal:", e);
  }
}

export function setAiPrompt(text) {
  const input = document.getElementById("ai-prompt-input");
  if (input) {
    input.value = text;
    input.focus();
  }
}

export function generateAiRecipeFromForm() {
  try {
    triggerHapticTouch();
    const promptInput = document.getElementById("ai-prompt-input");
    const typeSelect = document.getElementById("ai-meal-type");
    const servingsSelect = document.getElementById("ai-servings");
    const container = document.getElementById("ai-recipe-result-container");

    if (!promptInput || !container) return;
    const prompt = promptInput.value.trim();
    if (!prompt) {
      showIosToast("⚠️ Escribe una descripción o pulsa una idea rápida", "fa-solid fa-triangle-exclamation");
      return;
    }

    const type = typeSelect ? typeSelect.value : "auto";
    const servings = servingsSelect ? parseInt(servingsSelect.value, 10) : 1;

    const recipe = generateRecipeFromDescription(prompt, type, servings);
    if (!recipe) {
      showIosToast("⚠️ No pudimos procesar la receta", "fa-solid fa-triangle-exclamation");
      return;
    }

    generatedRecipeCandidate = recipe;

    const ingHtml = (recipe.ingredients || []).map(i => `
      <li style="display:flex; justify-content:space-between; padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); font-size: 0.84rem;">
        <span>${i.name}</span>
        <strong style="color:var(--text-main);">${i.amount} ${i.unit}</strong>
      </li>
    `).join("");

    const stepsHtml = (recipe.instructions || []).map((s, idx) => `
      <li style="margin-bottom: 0.5rem; font-size: 0.84rem; line-height: 1.45;">
        <strong style="color:var(--accent-cyan);">${idx + 1}.</strong> ${s}
      </li>
    `).join("");

    container.style.display = "block";
    container.innerHTML = `
      <div class="glass-card generated-recipe-card" style="border: 1px solid var(--accent-cyan); background: rgba(6, 182, 212, 0.06); padding: 1.25rem; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div>
            <span class="type-pill ${recipe.type}" style="font-size: 0.72rem;">${recipe.type.toUpperCase()} • ${recipe.prepTime} min</span>
            <h3 style="font-size: 1.15rem; margin: 0.4rem 0 0.2rem 0; color: var(--text-main); font-weight: 700;">${recipe.name}</h3>
          </div>
          <span style="font-size: 0.72rem; background: rgba(16,185,129,0.15); color: var(--accent-emerald); padding: 2px 8px; border-radius: 9999px; font-weight: 700;">✨ Calculado</span>
        </div>

        <div class="meal-macros-pills" style="margin: 0.85rem 0;">
          <span class="macro-pill" style="color:var(--accent-amber); font-weight:700;"><i class="fa-solid fa-fire"></i> ${recipe.calories} kcal</span>
          <span class="macro-pill" style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-dumbbell"></i> ${recipe.protein}g Prot</span>
          <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${recipe.carbs}g Carbs</span>
          <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${recipe.fats}g Grasas</span>
        </div>

        <div style="margin-top: 0.85rem;">
          <h4 style="font-size: 0.88rem; color: var(--accent-emerald); margin-bottom: 0.4rem;"><i class="fa-solid fa-basket-shopping"></i> Ingredientes con Cantidades:</h4>
          <ul style="list-style: none; padding: 0;">${ingHtml}</ul>
        </div>

        <div style="margin-top: 0.85rem;">
          <h4 style="font-size: 0.88rem; color: var(--accent-cyan); margin-bottom: 0.4rem;"><i class="fa-solid fa-list-ol"></i> Pasos de Preparación:</h4>
          <ol style="padding-left: 1.1rem; color: var(--text-muted);">${stepsHtml}</ol>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
          <button type="button" class="btn-primary" onclick="saveGeneratedRecipeCandidate()" style="flex: 1; justify-content: center; padding: 0.75rem;">
            <i class="fa-solid fa-floppy-disk"></i> Guardar en mi Catálogo
          </button>
          <button type="button" class="btn-secondary" onclick="editGeneratedRecipeCandidate()" style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); background: rgba(255,255,255,0.06);">
            <i class="fa-solid fa-pen-to-square"></i> Retocar en Editor
          </button>
        </div>
      </div>
    `;

    container.scrollIntoView({ behavior: "smooth", block: "nearest" });
    showIosToast("✨ Receta calculada con éxito", "fa-solid fa-circle-check");
  } catch(e) {
    console.error("Error generating recipe from form:", e);
  }
}

export function saveGeneratedRecipeCandidate() {
  if (!generatedRecipeCandidate) return;
  if (!Array.isArray(appState.customRecipes)) appState.customRecipes = [];
  appState.customRecipes.push(generatedRecipeCandidate);
  saveState();
  if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

  const modal = document.getElementById("ai-recipe-generator-modal");
  if (modal) modal.classList.remove("active");

  renderNutritionRecipesView();
  renderNutritionMenuView();
  renderShoppingView();
  showIosToast(`🎉 ¡"${generatedRecipeCandidate.name}" guardada en el catálogo!`, "fa-solid fa-circle-check");
}

export function editGeneratedRecipeCandidate() {
  if (!generatedRecipeCandidate) return;
  const candidate = generatedRecipeCandidate;
  const modal = document.getElementById("ai-recipe-generator-modal");
  if (modal) modal.classList.remove("active");

  openCreateRecipeModal();
  setTimeout(() => {
    const nameEl = document.getElementById("new-recipe-name");
    const typeEl = document.getElementById("new-recipe-type");
    const prepEl = document.getElementById("new-recipe-prep");
    const kcalEl = document.getElementById("new-recipe-kcal");
    const protEl = document.getElementById("new-recipe-prot");
    const carbsEl = document.getElementById("new-recipe-carbs");
    const fatsEl = document.getElementById("new-recipe-fats");
    const ingEl = document.getElementById("new-recipe-ingredients");
    const stepsEl = document.getElementById("new-recipe-steps");

    if (nameEl) nameEl.value = candidate.name;
    if (typeEl) typeEl.value = candidate.type;
    if (prepEl) prepEl.value = candidate.prepTime;
    if (kcalEl) kcalEl.value = candidate.calories;
    if (protEl) protEl.value = candidate.protein;
    if (carbsEl) carbsEl.value = candidate.carbs;
    if (fatsEl) fatsEl.value = candidate.fats;
    if (ingEl) {
      ingEl.value = (candidate.ingredients || []).map(i => `${i.name}, ${i.amount}, ${i.unit}`).join("\n");
      autoCalculateRecipeModalMacros('new');
    }
    if (stepsEl) stepsEl.value = (candidate.instructions || []).join("\n");
  }, 100);
}

/**
 * CREATE CUSTOM RECIPE MODAL
 */
export function openCreateRecipeModal() {
  try {
    triggerHapticTouch();
    let modal = document.getElementById("create-recipe-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "create-recipe-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="glass-modal" style="max-width: 540px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-title">
            <i class="fa-solid fa-plus" style="color: var(--accent-emerald); font-size: 1.3rem;"></i>
            <div>
              <h3>Añadir Nueva Receta</h3>
              <p>Indica los ingredientes y calcularemos automáticamente los macros</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" onclick="document.getElementById('create-recipe-modal').classList.remove('active')"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body" style="padding-top: 1rem;">
          <form onsubmit="saveCustomRecipeFromModal(event)">
            <div class="form-group">
              <label>Nombre de la Receta *</label>
              <input type="text" id="new-recipe-name" class="ios-input" placeholder="ej. Pasta con Ternera y Salsa de Tomate" required>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Tipo de Plato</label>
                <select id="new-recipe-type" class="custom-select" style="width: 100%;">
                  <option value="comida">🥗 Comida / Almuerzo</option>
                  <option value="cena">🌙 Cena</option>
                  <option value="desayuno">☀️ Desayuno</option>
                  <option value="snack">🍎 Snack / Merienda</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tiempo de Preparación (min)</label>
                <input type="number" id="new-recipe-prep" class="ios-input" value="15" required min="1" max="180">
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.35rem;">
                <label style="margin-bottom:0;">Ingredientes (Nombre, Cantidad, Unidad) *</label>
                <button type="button" class="btn-calc-macros" onclick="autoCalculateRecipeModalMacros('new')" style="font-size:0.75rem; padding: 3px 8px; background: rgba(6,182,212,0.15); color: var(--accent-cyan); border: 1px solid rgba(6,182,212,0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-calculator"></i> Calcular Macros
                </button>
              </div>
              <textarea id="new-recipe-ingredients" class="ios-input" rows="4" placeholder="Pasta integral, 85, g&#10;Carne picada de ternera, 150, g&#10;Tomate frito, 80, g&#10;Aceite de oliva, 5, ml" oninput="autoCalculateRecipeModalMacros('new')" style="font-family: monospace; font-size: 0.82rem;"></textarea>
              <div id="new-recipe-macro-hint"></div>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Calorías (kcal) <small style="color:var(--accent-cyan);">(Auto-calculadas)</small></label>
                <input type="number" id="new-recipe-kcal" class="ios-input" placeholder="ej. 520" required min="0" max="2500">
              </div>
              <div class="form-group">
                <label>Proteína (g) <small style="color:var(--accent-cyan);">(Auto-calculada)</small></label>
                <input type="number" id="new-recipe-prot" class="ios-input" placeholder="ej. 42" required min="0" max="200">
              </div>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Carbohidratos (g) <small style="color:var(--accent-cyan);">(Auto-calculados)</small></label>
                <input type="number" id="new-recipe-carbs" class="ios-input" placeholder="ej. 55" value="0" min="0" max="300">
              </div>
              <div class="form-group">
                <label>Grasas (g) <small style="color:var(--accent-cyan);">(Auto-calculadas)</small></label>
                <input type="number" id="new-recipe-fats" class="ios-input" placeholder="ej. 14" value="0" min="0" max="200">
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <label>Pasos de preparación (Un paso por línea)</label>
              <textarea id="new-recipe-steps" class="ios-input" rows="3" placeholder="1. Cocer la pasta en agua hirviendo con sal hasta que esté al dente.&#10;2. Dorar la carne picada con el AOVE y añadir el tomate.&#10;3. Mezclar y servir caliente."></textarea>
            </div>

            <button type="submit" class="btn-primary" style="margin-top: 1.25rem; width: 100%; justify-content: center; padding: 0.75rem;">
              <i class="fa-solid fa-floppy-disk"></i> Guardar Receta en el Catálogo
            </button>
          </form>
        </div>
      </div>
    `;

    modal.classList.add("active");
  } catch(e) {
    console.error("Error opening create recipe modal:", e);
  }
}

export function saveCustomRecipeFromModal(event) {
  event.preventDefault();
  try {
    triggerHapticTouch();
    const name = document.getElementById("new-recipe-name")?.value.trim();
    if (!name) return;

    const type = document.getElementById("new-recipe-type")?.value || "comida";
    const prepTime = Number(document.getElementById("new-recipe-prep")?.value || 15);
    const calories = Number(document.getElementById("new-recipe-kcal")?.value || 450);
    const protein = Number(document.getElementById("new-recipe-prot")?.value || 35);
    const carbs = Number(document.getElementById("new-recipe-carbs")?.value || 30);
    const fats = Number(document.getElementById("new-recipe-fats")?.value || 12);

    const rawIng = document.getElementById("new-recipe-ingredients")?.value || "";
    const rawSteps = document.getElementById("new-recipe-steps")?.value || "";

    const parsedIng = rawIng.split("\n").filter(l => l.trim()).map(line => {
      const parts = line.split(",").map(p => p.trim());
      return {
        name: parts[0] || "Ingrediente",
        amount: Number(parts[1]) || 1,
        unit: parts[2] || "ud",
        category: INGREDIENT_CATEGORIES.PRODUCE
      };
    });

    const parsedSteps = rawSteps.split("\n").filter(l => l.trim()).map(s => s.replace(/^\d+\.\s*/, ''));

    const newRecipe = {
      id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      name: name,
      type: type,
      prepTime: prepTime,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fats: fats,
      tags: ["personalizada", "alto en proteína"],
      ingredients: parsedIng.length > 0 ? parsedIng : [{ name: name, amount: 1, unit: "ración", category: INGREDIENT_CATEGORIES.PANTRY }],
      instructions: parsedSteps.length > 0 ? parsedSteps : ["Preparar y servir."]
    };

    if (!Array.isArray(appState.customRecipes)) appState.customRecipes = [];
    appState.customRecipes.push(newRecipe);
    saveState();

    const modal = document.getElementById("create-recipe-modal");
    if (modal) modal.classList.remove("active");

    renderNutritionRecipesView();
    showIosToast(`🎉 ¡Receta "${name}" creada con éxito!`, "fa-solid fa-circle-check");
  } catch(e) {
    console.error("Error saving custom recipe:", e);
  }
}

/**
 * EDIT RECIPE MODAL (Supports any recipe in catalog)
 */
export function openEditRecipeModal(recipeId) {
  try {
    triggerHapticTouch();
    const recipe = getRecipeById(recipeId);
    if (!recipe) {
      showIosToast("⚠️ Receta no encontrada", "fa-solid fa-triangle-exclamation");
      return;
    }

    let modal = document.getElementById("edit-recipe-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "edit-recipe-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const ingText = (recipe.ingredients || []).map(i => `${i.name || ''}, ${i.amount || 1}, ${i.unit || 'g'}`).join("\n");
    const stepsText = (recipe.instructions || []).join("\n");

    modal.innerHTML = `
      <div class="glass-modal" style="max-width: 540px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-title">
            <i class="fa-solid fa-pen-to-square" style="color: var(--accent-cyan); font-size: 1.3rem;"></i>
            <div>
              <h3>Editar Receta</h3>
              <p>Modifica los datos, macros e ingredientes</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" onclick="document.getElementById('edit-recipe-modal').classList.remove('active')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body" style="padding-top: 1rem;">
          <form onsubmit="saveEditedRecipeFromModal(event, '${recipe.id}')">
            <div class="form-group">
              <label>Nombre de la Receta *</label>
              <input type="text" id="edit-recipe-name" class="ios-input" value="${recipe.name || ''}" required>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Tipo de Plato</label>
                <select id="edit-recipe-type" class="custom-select" style="width: 100%;">
                  <option value="comida" ${recipe.type === 'comida' ? 'selected' : ''}>🥗 Comida / Almuerzo</option>
                  <option value="cena" ${recipe.type === 'cena' ? 'selected' : ''}>🌙 Cena</option>
                  <option value="desayuno" ${recipe.type === 'desayuno' ? 'selected' : ''}>☀️ Desayuno</option>
                  <option value="snack" ${recipe.type === 'snack' ? 'selected' : ''}>🍎 Snack / Merienda</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tiempo de Preparación (min)</label>
                <input type="number" id="edit-recipe-prep" class="ios-input" value="${recipe.prepTime || 15}" required min="1" max="180">
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.35rem;">
                <label style="margin-bottom:0;">Ingredientes (Nombre, Cantidad, Unidad)</label>
                <button type="button" class="btn-calc-macros" onclick="autoCalculateRecipeModalMacros('edit')" style="font-size:0.75rem; padding: 3px 8px; background: rgba(6,182,212,0.15); color: var(--accent-cyan); border: 1px solid rgba(6,182,212,0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-calculator"></i> Calcular Macros
                </button>
              </div>
              <textarea id="edit-recipe-ingredients" class="ios-input" rows="4" oninput="autoCalculateRecipeModalMacros('edit')" style="font-family: monospace; font-size: 0.82rem;">${ingText}</textarea>
              <div id="edit-recipe-macro-hint"></div>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Calorías (kcal) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="edit-recipe-kcal" class="ios-input" value="${recipe.calories || 0}" required min="0" max="2500">
              </div>
              <div class="form-group">
                <label>Proteína (g) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="edit-recipe-prot" class="ios-input" value="${recipe.protein || 0}" required min="0" max="200">
              </div>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Carbohidratos (g) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="edit-recipe-carbs" class="ios-input" value="${recipe.carbs || 0}" min="0" max="300">
              </div>
              <div class="form-group">
                <label>Grasas (g) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="edit-recipe-fats" class="ios-input" value="${recipe.fats || 0}" min="0" max="200">
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <label>Pasos de preparación (Un paso por línea)</label>
              <textarea id="edit-recipe-steps" class="ios-input" rows="3">${stepsText}</textarea>
            </div>

            <div style="display:flex; gap:0.75rem; margin-top: 1.25rem;">
              <button type="button" class="btn-slot-action remove" onclick="deleteRecipe('${recipe.id}'); document.getElementById('edit-recipe-modal').classList.remove('active');" style="padding: 0.75rem 1rem;" title="Eliminar receta">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <button type="submit" class="btn-primary" style="flex: 1; justify-content: center; padding: 0.75rem;">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    modal.classList.add("active");
  } catch(e) {
    console.error("Error opening edit recipe modal:", e);
  }
}

export function saveEditedRecipeFromModal(event, recipeId) {
  if (event) event.preventDefault();
  try {
    triggerHapticTouch();
    const name = document.getElementById("edit-recipe-name")?.value.trim();
    if (!name) return;

    const type = document.getElementById("edit-recipe-type")?.value || "comida";
    const prepTime = Number(document.getElementById("edit-recipe-prep")?.value || 15);
    const calories = Number(document.getElementById("edit-recipe-kcal")?.value || 0);
    const protein = Number(document.getElementById("edit-recipe-prot")?.value || 0);
    const carbs = Number(document.getElementById("edit-recipe-carbs")?.value || 0);
    const fats = Number(document.getElementById("edit-recipe-fats")?.value || 0);

    const rawIng = document.getElementById("edit-recipe-ingredients")?.value || "";
    const rawSteps = document.getElementById("edit-recipe-steps")?.value || "";

    const parsedIng = rawIng.split("\n").filter(l => l.trim()).map(line => {
      const parts = line.split(",").map(p => p.trim());
      return {
        name: parts[0] || "Ingrediente",
        amount: Number(parts[1]) || 1,
        unit: parts[2] || "g",
        category: INGREDIENT_CATEGORIES.PRODUCE
      };
    });

    const parsedSteps = rawSteps.split("\n").filter(l => l.trim()).map(s => s.replace(/^\d+\.\s*/, ''));

    if (!Array.isArray(appState.customRecipes)) appState.customRecipes = [];

    const existingIdx = appState.customRecipes.findIndex(r => r && r.id === recipeId);
    const updatedRecipe = {
      id: recipeId,
      name: name,
      type: type,
      prepTime: prepTime,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fats: fats,
      tags: ["personalizada", "editada"],
      ingredients: parsedIng.length > 0 ? parsedIng : [{ name: name, amount: 1, unit: "ración", category: INGREDIENT_CATEGORIES.PANTRY }],
      instructions: parsedSteps.length > 0 ? parsedSteps : ["Preparar y servir."]
    };

    if (existingIdx >= 0) {
      appState.customRecipes[existingIdx] = updatedRecipe;
    } else {
      appState.customRecipes.push(updatedRecipe);
    }

    if (Array.isArray(appState.deletedRecipeIds)) {
      appState.deletedRecipeIds = appState.deletedRecipeIds.filter(id => id !== recipeId);
    }

    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

    const modal = document.getElementById("edit-recipe-modal");
    if (modal) modal.classList.remove("active");

    renderNutritionRecipesView();
    renderNutritionMenuView();
    renderShoppingView();
    showIosToast(`✏️ Receta "${name}" actualizada`, "fa-solid fa-circle-check");
  } catch(e) {
    console.error("Error saving edited recipe:", e);
  }
}

export function deleteRecipe(recipeId) {
  try {
    triggerHapticTouch();
    const recipe = getRecipeById(recipeId);
    const rName = recipe ? `"${recipe.name}"` : "esta receta";
    if (confirm(`¿Deseas eliminar definitivamente ${rName} de tu catálogo?`)) {
      if (!Array.isArray(appState.deletedRecipeIds)) appState.deletedRecipeIds = [];
      if (!appState.deletedRecipeIds.includes(recipeId)) {
        appState.deletedRecipeIds.push(recipeId);
      }

      if (Array.isArray(appState.customRecipes)) {
        appState.customRecipes = appState.customRecipes.filter(r => r && r.id !== recipeId);
      }

      // Clean from all weeklyMealPlans
      if (appState.weeklyMealPlans && typeof appState.weeklyMealPlans === 'object') {
        Object.keys(appState.weeklyMealPlans).forEach(wKey => {
          const plan = appState.weeklyMealPlans[wKey];
          if (plan) {
            DAYS_OF_WEEK.forEach(d => {
              if (plan[d]) {
                MEAL_SLOTS.forEach(s => {
                  if (plan[d][s.key] === recipeId) {
                    plan[d][s.key] = null;
                  }
                });
              }
            });
          }
        });
      }

      if (appState.weeklyMealPlan) {
        DAYS_OF_WEEK.forEach(d => {
          if (appState.weeklyMealPlan[d]) {
            MEAL_SLOTS.forEach(s => {
              if (appState.weeklyMealPlan[d][s.key] === recipeId) {
                appState.weeklyMealPlan[d][s.key] = null;
              }
            });
          }
        });
      }

      appState.mealPlansLastModified = Date.now();
      saveState();
      if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

      renderNutritionRecipesView();
      renderNutritionMenuView();
      renderShoppingView();
      showIosToast("🗑️ Receta eliminada del catálogo", "fa-solid fa-trash-can");
    }
  } catch(e) {
    console.error("Error deleting recipe:", e);
  }
}

// Backwards-compatibility alias
export const deleteCustomRecipe = deleteRecipe;

export function setShoppingRange() {}

export function toggleShoppingDay(dayName) {
  try {
    triggerHapticTouch();
    if (!Array.isArray(appState.selectedShoppingDays)) {
      appState.selectedShoppingDays = [...DAYS_OF_WEEK];
    }
    const idx = appState.selectedShoppingDays.indexOf(dayName);
    if (idx >= 0) {
      appState.selectedShoppingDays.splice(idx, 1);
    } else {
      appState.selectedShoppingDays.push(dayName);
    }
    saveState();
    renderShoppingView();
  } catch(e) {
    console.error("Error toggling shopping day:", e);
  }
}

export function toggleAllShoppingDays() {
  try {
    triggerHapticTouch();
    if (!Array.isArray(appState.selectedShoppingDays)) {
      appState.selectedShoppingDays = [...DAYS_OF_WEEK];
    }
    if (appState.selectedShoppingDays.length === DAYS_OF_WEEK.length) {
      appState.selectedShoppingDays = [];
    } else {
      appState.selectedShoppingDays = [...DAYS_OF_WEEK];
    }
    saveState();
    renderShoppingView();
  } catch(e) {
    console.error("Error toggling all shopping days:", e);
  }
}

export function setShoppingDaysPreset(preset) {
  try {
    triggerHapticTouch();
    if (preset === 'workdays') {
      appState.selectedShoppingDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    } else if (preset === 'weekend') {
      appState.selectedShoppingDays = ["Sábado", "Domingo"];
    } else {
      appState.selectedShoppingDays = [...DAYS_OF_WEEK];
    }
    saveState();
    renderShoppingView();
  } catch(e) {
    console.error("Error setting shopping days preset:", e);
  }
}

export function renderShoppingView() {
  try {
    const container = document.getElementById("shopping-categories-container");
    if (!container) return;
    container.innerHTML = "";

    const activeWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
    const curWeekKey = getCurrentWeekKey();
    const nextWeekKey = getOffsetWeekKey(curWeekKey, 1);
    const week2Key = getOffsetWeekKey(curWeekKey, 2);
    const week3Key = getOffsetWeekKey(curWeekKey, 3);
    const isCurrentWeek = (activeWeekKey === curWeekKey);

    if (!Array.isArray(appState.selectedShoppingDays)) {
      appState.selectedShoppingDays = [...DAYS_OF_WEEK];
    }
    const selectedDays = appState.selectedShoppingDays;
    const isAllSelected = (selectedDays.length === DAYS_OF_WEEK.length);
    const isWorkdaysSelected = (selectedDays.length === 5 && ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].every(d => selectedDays.includes(d)));
    const isWeekendSelected = (selectedDays.length === 2 && ["Sábado", "Domingo"].every(d => selectedDays.includes(d)));

    const currentWeeklyPlan = getActiveWeeklyPlan();
    const aggregated = {};
    let totalMealsCount = 0;

    // Aggregate ingredients only from selected days of the weekly plan
    selectedDays.forEach(day => {
      const plan = currentWeeklyPlan?.[day] || {};
      MEAL_SLOTS.forEach(slot => {
        const recipeId = plan[slot.key];
        const meal = getRecipeById(recipeId);
        if (!meal) return;

        totalMealsCount++;
        (meal.ingredients || []).forEach(ing => {
          const key = `${(ing.name || "").trim().toLowerCase()}___${(ing.unit || "").trim().toLowerCase()}`;
          if (!aggregated[key]) {
            aggregated[key] = {
              name: ing.name,
              amount: 0,
              unit: ing.unit || "ud",
              category: ing.category || INGREDIENT_CATEGORIES.PANTRY
            };
          }
          aggregated[key].amount += Number(ing.amount || 0);
        });
      });
    });

    // 1. Top Week Indicator & Selector for Shopping List
    const weekHeader = document.createElement("div");
    weekHeader.className = "planner-week-nav-bar";
    weekHeader.style.cssText = "margin-bottom: 0.85rem;";
    weekHeader.innerHTML = `
      <div class="week-nav-controls">
        <button type="button" class="btn-week-nav" onclick="prevNutritionWeek(); renderShoppingView();" title="Semana Anterior">
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div class="week-nav-info">
          <div class="week-nav-title">
            <i class="fa-solid fa-cart-shopping" style="color: var(--accent-emerald);"></i>
            <span>Lista para: ${getWeekDisplayLabel(activeWeekKey)}</span>
          </div>
          <div class="week-nav-subtitle">
            ${isCurrentWeek ? '<span class="badge-current-week">Esta Semana</span>' : '<span class="badge-future-week">Planificación Futura</span>'} • ${totalMealsCount} comidas incluidas
          </div>
        </div>

        <button type="button" class="btn-week-nav" onclick="nextNutritionWeek(); renderShoppingView();" title="Semana Siguiente">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div class="week-quick-jump-pills">
        <button type="button" class="week-jump-pill ${isCurrentWeek ? 'active' : ''}" onclick="goToCurrentNutritionWeek(); renderShoppingView();">
          Esta Semana
        </button>
        <button type="button" class="week-jump-pill ${activeWeekKey === nextWeekKey ? 'active' : ''}" onclick="setNutritionActiveWeek('${nextWeekKey}'); renderShoppingView();">
          Próxima Semana
        </button>
        <button type="button" class="week-jump-pill ${activeWeekKey === week2Key ? 'active' : ''}" onclick="setNutritionActiveWeek('${week2Key}'); renderShoppingView();">
          En +2 Semanas
        </button>
        <button type="button" class="week-jump-pill ${activeWeekKey === week3Key ? 'active' : ''}" onclick="setNutritionActiveWeek('${week3Key}'); renderShoppingView();">
          En +3 Semanas
        </button>
      </div>
    `;
    container.appendChild(weekHeader);

    // 2. Interactive Day Selection Card for Shopping List
    const dayFilterCard = document.createElement("div");
    dayFilterCard.className = "shopping-day-filter-card glass-card";
    dayFilterCard.innerHTML = `
      <div class="day-filter-header">
        <div class="day-filter-title">
          <i class="fa-solid fa-calendar-check" style="color: var(--accent-emerald);"></i>
          <span>Días a incluir en la lista:</span>
          <span class="day-filter-count-badge">${selectedDays.length}/7 días</span>
        </div>

        <div class="day-filter-presets">
          <button type="button" class="btn-preset-pill ${isAllSelected ? 'active' : ''}" onclick="toggleAllShoppingDays()">
            <i class="fa-solid ${isAllSelected ? 'fa-circle-check' : 'fa-circle'}"></i> Toda la Semana
          </button>
          <button type="button" class="btn-preset-pill ${isWorkdaysSelected ? 'active' : ''}" onclick="setShoppingDaysPreset('workdays')">
            Lun - Vie
          </button>
          <button type="button" class="btn-preset-pill ${isWeekendSelected ? 'active' : ''}" onclick="setShoppingDaysPreset('weekend')">
            Fin de Semana
          </button>
        </div>
      </div>

      <div class="shopping-days-chips-scroll">
        ${DAYS_OF_WEEK.map(dayName => {
          const isSelected = selectedDays.includes(dayName);
          const dayIso = getDateForDayInWeek(activeWeekKey, dayName);
          const dayDateNum = new Date(dayIso + 'T00:00:00').getDate();
          const dayPlan = currentWeeklyPlan?.[dayName] || {};
          const mealsInDay = MEAL_SLOTS.filter(s => !!dayPlan[s.key]).length;

          return `
            <button type="button" 
              class="shopping-day-chip ${isSelected ? 'selected' : ''}" 
              onclick="toggleShoppingDay('${dayName}')"
              title="${isSelected ? 'Desmarcar ' + dayName : 'Incluir ' + dayName}">
              <span class="chip-check"><i class="fa-solid ${isSelected ? 'fa-check' : 'fa-plus'}"></i></span>
              <span class="chip-day-name">${dayName.substring(0, 3)} ${dayDateNum}</span>
              <span class="chip-meal-count ${mealsInDay > 0 ? 'has-meals' : ''}">${mealsInDay} pl.</span>
            </button>
          `;
        }).join("")}
      </div>
    `;
    container.appendChild(dayFilterCard);

    // Group by category
    const categories = {};
    Object.values(aggregated).forEach(item => {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    });

    const CATEGORY_ORDER = [
      INGREDIENT_CATEGORIES.PRODUCE,
      INGREDIENT_CATEGORIES.PROTEIN,
      INGREDIENT_CATEGORIES.DAIRY,
      INGREDIENT_CATEGORIES.GRAINS,
      INGREDIENT_CATEGORIES.FATS,
      INGREDIENT_CATEGORIES.PANTRY
    ];

    const CATEGORY_ICONS = {
      [INGREDIENT_CATEGORIES.PRODUCE]: "fa-apple-whole",
      [INGREDIENT_CATEGORIES.PROTEIN]: "fa-drumstick-bite",
      [INGREDIENT_CATEGORIES.DAIRY]: "fa-egg",
      [INGREDIENT_CATEGORIES.GRAINS]: "fa-bread-slice",
      [INGREDIENT_CATEGORIES.FATS]: "fa-bottle-droplet",
      [INGREDIENT_CATEGORIES.PANTRY]: "fa-jar"
    };

    // Render Summary Banner
    const totalItemsCount = Object.keys(aggregated).length + (appState.shoppingExtras || []).length;
    const summaryBanner = document.createElement("div");
    summaryBanner.className = "shopping-summary-banner glass-card";
    summaryBanner.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
        <div>
          <span style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Planificación Activa</span>
          <h3 style="font-family:var(--font-heading); font-size:1.1rem; color:var(--accent-emerald);">
            🛒 ${totalItemsCount} productos para ${totalMealsCount} comidas planificadas
          </h3>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button type="button" class="btn-planner-tool" onclick="openAddExtraShoppingModal()">
            <i class="fa-solid fa-plus"></i> Añadir Extra
          </button>
          <button type="button" class="btn-planner-tool" onclick="clearCheckedShoppingItems()">
            <i class="fa-solid fa-rotate-left"></i> Desmarcar Todo
          </button>
        </div>
      </div>
    `;
    container.appendChild(summaryBanner);

    if (totalItemsCount === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "glass-card";
      emptyDiv.style.cssText = "text-align:center; padding: 2.5rem; color: var(--text-muted); margin-top: 1rem;";
      emptyDiv.innerHTML = `
        <i class="fa-solid fa-cart-arrow-down" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 0.8rem; display:block;"></i>
        <p>No hay comidas programadas para los días seleccionados.</p>
        <button type="button" class="btn-primary" onclick="window.showTab('nutrition-menu-view')" style="margin-top: 1rem;">
          Ir al Plan Semanal y Elegir Recetas
        </button>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    // Render Categorized Sections
    const sortedCategoryNames = Object.keys(categories).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
    });

    sortedCategoryNames.forEach(catName => {
      const catSection = document.createElement("div");
      catSection.className = "shopping-category";
      const iconClass = CATEGORY_ICONS[catName] || "fa-basket-shopping";

      const itemsHtml = categories[catName].map(item => {
        const itemKey = item.name.toLowerCase().trim();
        const isChecked = !!appState.checkedShoppingItems?.[itemKey];
        const displayAmount = Math.round(item.amount * 10) / 10;

        return `
          <div class="shopping-item ${isChecked ? 'checked' : ''}" onclick="toggleShoppingItem('${itemKey}', this)">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleShoppingItem('${itemKey}', this.parentNode);">
            <span class="shopping-item-name">${item.name}</span>
            <span class="shopping-item-qty">${displayAmount} ${item.unit}</span>
          </div>
        `;
      }).join("");

      catSection.innerHTML = `
        <h3 class="shopping-cat-title"><i class="fa-solid ${iconClass}"></i> ${catName} <small style="font-size:0.75rem; color:var(--text-dim); margin-left:0.4rem;">(${categories[catName].length})</small></h3>
        <div class="shopping-items-grid">
          ${itemsHtml}
        </div>
      `;

      container.appendChild(catSection);
    });

    // Render Manual Extras if any
    const extras = Array.isArray(appState.shoppingExtras) ? appState.shoppingExtras : [];
    if (extras.length > 0) {
      const extraSection = document.createElement("div");
      extraSection.className = "shopping-category";
      extraSection.innerHTML = `
        <h3 class="shopping-cat-title"><i class="fa-solid fa-basket-shopping"></i> Extras y Artículos Manuales <small style="font-size:0.75rem; color:var(--text-dim); margin-left:0.4rem;">(${extras.length})</small></h3>
        <div class="shopping-items-grid">
          ${extras.map((ex, idx) => {
            const exKey = `extra_${ex.name.toLowerCase().trim()}`;
            const isChecked = !!appState.checkedShoppingItems?.[exKey];
            return `
              <div class="shopping-item ${isChecked ? 'checked' : ''}" onclick="toggleShoppingItem('${exKey}', this)">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleShoppingItem('${exKey}', this.parentNode);">
                <span class="shopping-item-name">${ex.name}</span>
                <span class="shopping-item-qty">${ex.amount || ''} ${ex.unit || ''}</span>
                <button type="button" onclick="event.stopPropagation(); removeShoppingExtra(${idx})" style="border:none; background:transparent; color:var(--accent-rose); cursor:pointer; font-size:0.75rem; margin-left:0.25rem;">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            `;
          }).join("")}
        </div>
      `;
      container.appendChild(extraSection);
    }

  } catch(e) {
    console.error("Error rendering Shopping View:", e);
  }
}

/**
 * Toggle checked item in shopping list
 */
export function toggleShoppingItem(itemKey, elem) {
  try {
    triggerHapticTouch();
    if (!appState.checkedShoppingItems) appState.checkedShoppingItems = {};
    appState.checkedShoppingItems[itemKey] = !appState.checkedShoppingItems[itemKey];
    saveState();
    if (elem) {
      elem.classList.toggle("checked", appState.checkedShoppingItems[itemKey]);
      const checkbox = elem.querySelector("input[type='checkbox']");
      if (checkbox) checkbox.checked = appState.checkedShoppingItems[itemKey];
    }
  } catch(e) {
    console.error("Error toggling shopping item:", e);
  }
}

export function clearCheckedShoppingItems() {
  try {
    triggerHapticTouch();
    appState.checkedShoppingItems = {};
    saveState();
    renderShoppingView();
    showIosToast("🔄 Todos los productos desmarcados", "fa-solid fa-rotate-left");
  } catch(e) {
    console.error("Error clearing checked shopping items:", e);
  }
}

/**
 * Add Extra Shopping Item Modal
 */
export function openAddExtraShoppingModal() {
  try {
    triggerHapticTouch();
    const item = prompt("Introduce el nombre del producto extra (ej. Café molido, Agua, Papel de cocina):");
    if (!item || !item.trim()) return;

    if (!Array.isArray(appState.shoppingExtras)) appState.shoppingExtras = [];
    appState.shoppingExtras.push({
      name: item.trim(),
      amount: "1",
      unit: "ud"
    });
    saveState();
    renderShoppingView();
    showIosToast(`➕ "${item}" añadido a la lista`, "fa-solid fa-cart-plus");
  } catch(e) {
    console.error("Error adding extra shopping item:", e);
  }
}

export function removeShoppingExtra(index) {
  try {
    triggerHapticTouch();
    if (Array.isArray(appState.shoppingExtras)) {
      appState.shoppingExtras.splice(index, 1);
      saveState();
      renderShoppingView();
    }
  } catch(e) {
    console.error("Error removing shopping extra:", e);
  }
}

/**
 * Copy Shopping List to Clipboard
 */
export function copyShoppingList() {
  try {
    triggerHapticTouch();
    let text = "🛒 LISTA DE LA COMPRA - FITDUO & COLLIE 🛒\n\n";

    document.querySelectorAll(".shopping-category").forEach(cat => {
      const titleElem = cat.querySelector(".shopping-cat-title");
      if (!titleElem) return;
      const title = titleElem.innerText.replace(/\s*\(\d+\)$/, '').trim();
      text += `\n--- ${title} ---\n`;
      cat.querySelectorAll(".shopping-item").forEach(item => {
        const name = item.querySelector(".shopping-item-name")?.innerText || "";
        const qty = item.querySelector(".shopping-item-qty")?.innerText || "";
        const checked = item.classList.contains("checked") ? "[X]" : "[ ]";
        text += `${checked} ${name}: ${qty}\n`;
      });
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showIosToast("🛒 ¡Lista de la compra copiada al portapapeles!", "fa-solid fa-copy");
      }).catch(() => {
        prompt("Copia manualmente la lista de la compra:", text);
      });
    } else {
      prompt("Copia manualmente la lista de la compra:", text);
    }
  } catch(e) {
    console.error("Error copying shopping list:", e);
  }
}
