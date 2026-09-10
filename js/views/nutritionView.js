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
import { calculateMacrosFromIngredients, generateRecipeFromDescription, generateRecipeWithAi, regenerateSingleBatchRecipeWithAi, addBatchRecipeWithAi } from '../nutritionCalculator.js';

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
 * Get servings for a meal slot in a week (Defaults to 2 for couple: Carlos y Andrea)
 */
export function getMealSlotServings(weekKey, dayName, slotKey) {
  const wKey = weekKey || appState.activeNutritionWeekKey || getCurrentWeekKey();
  if (appState.weeklyMealServings?.[wKey]?.[dayName]?.[slotKey]) {
    return Number(appState.weeklyMealServings[wKey][dayName][slotKey]) || 2;
  }
  return 2; // Default for FitDuo couple (Carlos y Andrea)
}

/**
 * Set servings for a meal slot in a week
 */
export function setMealSlotServings(dayName, slotKey, servings, weekKey) {
  try {
    triggerHapticTouch();
    const wKey = weekKey || appState.activeNutritionWeekKey || getCurrentWeekKey();
    if (!appState.weeklyMealServings) appState.weeklyMealServings = {};
    if (!appState.weeklyMealServings[wKey]) appState.weeklyMealServings[wKey] = {};
    if (!appState.weeklyMealServings[wKey][dayName]) appState.weeklyMealServings[wKey][dayName] = {};

    appState.weeklyMealServings[wKey][dayName][slotKey] = Number(servings) || 2;
    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

    renderNutritionMenuView();
    renderShoppingView();
    showIosToast(`👥 ${dayName} (${slotKey}): ${servings} ${servings === 1 ? 'persona' : 'personas'}`, "fa-solid fa-users");
  } catch(e) {
    console.error("Error setting meal slot servings:", e);
  }
}

/**
 * Toggle servings between 1 and 2 for a specific meal slot
 */
export function toggleSlotServings(dayName, slotKey) {
  try {
    triggerHapticTouch();
    const wKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
    const current = getMealSlotServings(wKey, dayName, slotKey);
    const next = current === 2 ? 1 : 2;
    setMealSlotServings(dayName, slotKey, next, wKey);
  } catch(e) {
    console.error("Error toggling slot servings:", e);
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
      const activeWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();
      const slotServings = getMealSlotServings(activeWeekKey, dayName, slot.key);
      const recipeServings = Number(recipe.servings) || 2;
      const perPersonKcal = Math.round(Number(recipe.calories || 0) / recipeServings);
      const perPersonProt = Math.round(Number(recipe.protein || 0) / recipeServings);
      const perPersonCarbs = Math.round(Number(recipe.carbs || 0) / recipeServings);
      const perPersonFats = Math.round(Number(recipe.fats || 0) / recipeServings);

      const tagsHtml = (recipe.tags || []).map(t => `<span class="macro-pill">${t}</span>`).join(" ");

      slotCard.innerHTML = `
        <div class="slot-card-header">
          <div class="meal-card-type" style="color: ${slot.color};">
            <i class="fa-solid ${slot.icon}"></i> <strong>${slot.label}</strong> • ${recipe.prepTime || 15} min prep
          </div>
          <div class="slot-actions-group">
            <button type="button" class="btn-slot-servings ${slotServings === 2 ? 'is-couple' : 'is-single'}" onclick="toggleSlotServings('${dayName}', '${slot.key}')" title="Alternar raciones (1 o 2 personas)">
              <i class="fa-solid ${slotServings === 2 ? 'fa-users' : 'fa-user'}"></i> ${slotServings} pers
            </button>
            <button type="button" class="btn-slot-action edit" onclick="openRecipePickerModal('${dayName}', '${slot.key}')" title="Cambiar receta">
              <i class="fa-solid fa-rotate"></i> Cambiar
            </button>
            <button type="button" class="btn-slot-action view" onclick="openRecipeDetailModal('${recipe.id}', ${slotServings})" title="Ver receta y preparación">
              <i class="fa-solid fa-book-open"></i> Ver
            </button>
            <button type="button" class="btn-slot-action remove" onclick="removeMealFromSlot('${dayName}', '${slot.key}')" title="Quitar de este día">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <h3 class="meal-card-title clickable-meal-title" onclick="openRecipeDetailModal('${recipe.id}', ${slotServings})">
          <span>${recipe.name}</span>
          <i class="fa-solid fa-chevron-right" style="font-size: 0.85rem; color: var(--accent-cyan); opacity: 0.8;"></i>
        </h3>

        <div class="meal-macros-pills">
          <span class="macro-pill" style="color:var(--accent-amber); font-weight:600;"><i class="fa-solid fa-fire"></i> ${perPersonKcal} kcal/p</span>
          <span class="macro-pill" style="color:var(--accent-emerald); font-weight:600;"><i class="fa-solid fa-dumbbell"></i> ${perPersonProt}g Prot</span>
          <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${perPersonCarbs}g Carbs</span>
          <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${perPersonFats}g Grasas</span>
          <span class="macro-pill" style="color:var(--text-muted); font-size:0.72rem;">(${slotServings} ${slotServings === 1 ? 'persona' : 'personas'})</span>
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
      // Empty Slot Call-To-Action Card with Batch Cooking Leftovers Insight
      const batchInsight = getBatchCookingWeeklyInsight(dayName, slot.key);
      const hasBatchSuggestion = Boolean(batchInsight && batchInsight.hasSuggestion);

      slotCard.innerHTML = `
        <div class="empty-slot-content ${hasBatchSuggestion ? 'has-batch-suggestion' : ''}" onclick="openRecipePickerModal('${dayName}', '${slot.key}')" ${hasBatchSuggestion ? 'style="border-color: rgba(245, 158, 11, 0.45); background: rgba(245, 158, 11, 0.04);"' : ''}>
          <div class="empty-slot-icon" style="color: ${hasBatchSuggestion ? 'var(--accent-amber)' : slot.color};">
            <i class="fa-solid ${hasBatchSuggestion ? 'fa-layer-group' : slot.icon}"></i>
          </div>
          <div class="empty-slot-text">
            <h4 style="${hasBatchSuggestion ? 'color: var(--accent-amber);' : ''}">${slot.label} ${hasBatchSuggestion ? '(Aprovechamiento Disponible)' : '(Sin Asignar)'}</h4>
            <p>${hasBatchSuggestion ? `💡 Tienes base preparada de <strong>${batchInsight.sourceRecipeName}</strong> (${batchInsight.sourceDay})` : 'Toca para seleccionar un plato del backlog de recetas'}</p>
          </div>
          <button type="button" class="btn-empty-slot-add" style="${hasBatchSuggestion ? 'border-color: rgba(245, 158, 11, 0.4); color: var(--accent-amber); background: rgba(245, 158, 11, 0.12);' : ''}">
            <i class="fa-solid ${hasBatchSuggestion ? 'fa-wand-magic-sparkles' : 'fa-plus'}"></i> ${hasBatchSuggestion ? 'Aprovechar' : 'Añadir Receta'}
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
  const activeWeekKey = appState.activeNutritionWeekKey || getCurrentWeekKey();

  DAYS_OF_WEEK.forEach(dayName => {
    const dayPlan = currentWeeklyPlan?.[dayName] || {};
    const col = document.createElement("div");
    col.className = `matrix-day-column ${appState.activeDay === dayName ? 'active-col' : ''}`;

    const slotsHtml = MEAL_SLOTS.map(slot => {
      const rId = dayPlan[slot.key];
      const r = getRecipeById(rId);

      if (r) {
        const slotServings = getMealSlotServings(activeWeekKey, dayName, slot.key);
        const recipeServings = Number(r.servings) || 2;
        const perPersonKcal = Math.round(Number(r.calories || 0) / recipeServings);

        return `
          <div class="matrix-meal-cell has-meal" onclick="openRecipeDetailModal('${r.id}', ${slotServings})">
            <div class="matrix-cell-header" style="color:${slot.color}; display: flex; justify-content: space-between; align-items: center;">
              <div><i class="fa-solid ${slot.icon}"></i> <span>${slot.key.toUpperCase()}</span></div>
              <span class="matrix-servings-badge" onclick="event.stopPropagation(); toggleSlotServings('${dayName}', '${slot.key}')" title="Alternar 1 o 2 personas" style="font-size: 0.65rem; padding: 1px 5px; border-radius: 4px; background: ${slotServings === 2 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${slotServings === 2 ? 'var(--accent-cyan)' : 'var(--accent-amber)'}; font-weight: 700; cursor: pointer;">
                <i class="fa-solid ${slotServings === 2 ? 'fa-users' : 'fa-user'}"></i> ${slotServings}p
              </span>
            </div>
            <div class="matrix-meal-name">${r.name}</div>
            <div class="matrix-meal-meta">${perPersonKcal} kcal/p • ${r.protein}g P</div>
          </div>
        `;
      } else {
        const batchInsight = getBatchCookingWeeklyInsight(dayName, slot.key);
        const hasBatch = Boolean(batchInsight && batchInsight.hasSuggestion);

        return `
          <div class="matrix-meal-cell empty-meal ${hasBatch ? 'batch-suggested-cell' : ''}" onclick="openRecipePickerModal('${dayName}', '${slot.key}')" ${hasBatch ? 'style="border: 1px dashed rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.04);"' : ''}>
            <span style="color:${hasBatch ? 'var(--accent-amber)' : slot.color}; font-size:0.7rem;"><i class="fa-solid ${hasBatch ? 'fa-layer-group' : slot.icon}"></i> ${slot.key.toUpperCase()}</span>
            <span class="matrix-add-plus" style="${hasBatch ? 'color: var(--accent-amber); font-weight: 700;' : ''}"><i class="fa-solid ${hasBatch ? 'fa-wand-magic-sparkles' : 'fa-plus'}"></i> ${hasBatch ? 'Aprovechar' : 'Elegir'}</span>
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
 * Computes weekly batch cooking / leftovers utilization suggestions.
 * If the user has planned a batch cooking preparation (e.g. cabecero de lomo, pollo asado, etc.)
 * on any day this week, this function detects unassigned companion recipes in the catalog
 * and suggests adding them to another meal slot of the week so the cooked food is utilized.
 */
export function getBatchCookingWeeklyInsight(dayName, slotKey) {
  try {
    const currentPlan = getActiveWeeklyPlan();
    if (!currentPlan) return null;

    const allRecipes = getAllRecipes();
    if (!allRecipes || allRecipes.length === 0) return null;

    // 1. Collect all recipes currently assigned this week
    const plannedThisWeek = [];
    const plannedRecipeIds = new Set();

    DAYS_OF_WEEK.forEach(d => {
      const dayMeals = currentPlan[d] || {};
      MEAL_SLOTS.forEach(s => {
        const rId = dayMeals[s.key];
        if (rId) {
          const r = getRecipeById(rId);
          if (r) {
            plannedThisWeek.push({ day: d, slot: s.key, recipe: r });
            plannedRecipeIds.add(r.id);
          }
        }
      });
    });

    if (plannedThisWeek.length === 0) return null;

    // 2. Helper to detect key food words
    const extractFoodKeywords = (recipe) => {
      const text = ((recipe.name || "") + " " + (recipe.ingredients || []).map(i => i.name || "").join(" ")).toLowerCase();
      const keys = ["cabecero", "lomo", "solomillo", "asado", "ternera", "pollo", "pavo", "salmon", "costillas", "merluza", "cerdo"];
      return keys.filter(k => text.includes(k));
    };

    // 3. Look for planned batch recipes or roasts
    const batchSources = plannedThisWeek.filter(item => {
      const r = item.recipe;
      const isBatchTagged = Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes("batch") || t.toLowerCase().includes("aprovechamiento"));
      const keywords = extractFoodKeywords(r);
      const nameLower = (r.name || "").toLowerCase();
      const isRoast = nameLower.includes("asado") || nameLower.includes("horno") || nameLower.includes("entero") || nameLower.includes("batch");
      return isBatchTagged || (keywords.length > 0 && isRoast);
    });

    if (batchSources.length === 0) return null;

    // 4. Find available companion recipes in catalog that are not yet assigned this week
    const candidates = [];

    for (const source of batchSources) {
      const sourceKeywords = extractFoodKeywords(source.recipe);
      if (sourceKeywords.length === 0) continue;

      allRecipes.forEach(cand => {
        if (cand.id === source.recipe.id) return;
        if (plannedRecipeIds.has(cand.id)) return; // Already on the menu this week

        const candKeywords = extractFoodKeywords(cand);
        const hasCommonKeyword = sourceKeywords.some(k => candKeywords.includes(k));
        const candIsBatchTagged = Array.isArray(cand.tags) && cand.tags.some(t => t.toLowerCase().includes("batch") || t.toLowerCase().includes("aprovechamiento"));

        if (hasCommonKeyword || (candIsBatchTagged && sourceKeywords.length > 0)) {
          if (!candidates.some(c => c.recipe.id === cand.id)) {
            candidates.push({
              recipe: cand,
              sourceRecipe: source.recipe,
              sourceDay: source.day,
              sourceSlot: source.slot,
              keyword: sourceKeywords.find(k => candKeywords.includes(k)) || "carne"
            });
          }
        }
      });
    }

    if (candidates.length === 0) return null;

    // Filter candidates strictly for the current slot if slot is specified (not "all")
    let selectedCandidates = [];
    if (slotKey !== "all") {
      selectedCandidates = candidates.filter(c => c.recipe.type === slotKey);
      if (selectedCandidates.length === 0) {
        // No batch companion recipes exist for this specific meal type (e.g. no breakfast or snack generated)
        return null;
      }
    } else {
      selectedCandidates = candidates;
    }

    const first = selectedCandidates[0];
    const firstSource = first.sourceRecipe;
    const namesList = selectedCandidates.map(c => `"${c.recipe.name}"`).join(" o ");

    const slotNameText = slotKey === "cena" ? "la cena" : slotKey === "comida" ? "la comida" : "otra comida";

    return {
      hasSuggestion: true,
      type: "batch_cooking_companion",
      title: "🍱 Sugerencia de Aprovechamiento (Batch Cooking)",
      sourceRecipeName: firstSource.name,
      sourceDay: first.sourceDay,
      message: `Como preparaste o tienes planificado <strong>${firstSource.name}</strong> (${first.sourceDay}), te recomendamos añadir para ${slotNameText} ${namesList} porque como hiciste esa preparación tienes para hacer estas otras.`,
      filterHint: "Aprovecha la comida ya cocinada sin volver a encender el horno",
      companionIds: new Set(selectedCandidates.map(c => c.recipe.id)),
      matcher: (r) => selectedCandidates.some(c => c.recipe.id === r.id)
    };
  } catch(e) {
    console.error("Error computing batch cooking weekly insight:", e);
    return null;
  }
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

  // 1. Calculate Batch Cooking Weekly Insight (leftovers utilization)
  const batchInsight = getBatchCookingWeeklyInsight(activePickerContext.day, activePickerContext.slot);

  // 2. Calculate Compensation Insight for the current slot and day
  const compInsight = getCompensationInsight(activePickerContext.day, activePickerContext.slot);

  let bannerHtml = "";

  if (batchInsight && batchInsight.hasSuggestion) {
    bannerHtml += `
      <div class="compensation-banner batch-companion-banner" style="margin-bottom: 0.85rem;">
        <div class="compensation-banner-header">
          <i class="fa-solid fa-layer-group" style="font-size: 1.15rem;"></i>
          <span>${batchInsight.title}</span>
        </div>
        <p class="compensation-banner-text">${batchInsight.message}</p>
        <div class="compensation-banner-note" style="color: var(--accent-amber); font-weight: 600;">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>${batchInsight.filterHint} (priorizadas arriba).</span>
        </div>
      </div>
    `;
  }

  if (compInsight && compInsight.hasSuggestion) {
    bannerHtml += `
      <div class="compensation-banner">
        <div class="compensation-banner-header">
          <i class="fa-solid fa-scale-balanced" style="color: var(--accent-cyan); font-size: 1.15rem;"></i>
          <span>${compInsight.title}</span>
        </div>
        <p class="compensation-banner-text">${compInsight.message}</p>
        <div class="compensation-banner-note">
          <i class="fa-solid fa-star" style="color: var(--accent-amber);"></i>
          <span>${compInsight.filterHint} (puedes elegir cualquier plato libremente).</span>
        </div>
      </div>
    `;
  }

  // Sort matching: 1st Batch Companions, 2nd Compensation recommendations
  matching.sort((a, b) => {
    const isBatchA = (batchInsight && batchInsight.matcher && batchInsight.matcher(a)) ? 1 : 0;
    const isBatchB = (batchInsight && batchInsight.matcher && batchInsight.matcher(b)) ? 1 : 0;
    if (isBatchA !== isBatchB) return isBatchB - isBatchA;

    const isCompA = (compInsight && compInsight.matcher && compInsight.matcher(a)) ? 1 : 0;
    const isCompB = (compInsight && compInsight.matcher && compInsight.matcher(b)) ? 1 : 0;
    return isCompB - isCompA;
  });

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
    const isBatchRecommended = Boolean(batchInsight && batchInsight.hasSuggestion && typeof batchInsight.matcher === 'function' && batchInsight.matcher(recipe));
    const isCompRecommended = Boolean(compInsight && compInsight.hasSuggestion && typeof compInsight.matcher === 'function' && compInsight.matcher(recipe));
    const tagsHtml = (recipe.tags || []).slice(0, 3).map(t => `<span class="macro-pill">${t}</span>`).join(" ");

    return `
      <div class="picker-recipe-item ${isCurrentlySelected ? 'currently-active' : ''} ${isBatchRecommended ? 'is-batch-companion-item' : isCompRecommended ? 'is-recommended-item' : ''}">
        <div class="picker-item-main">
          <div class="picker-item-type">
            <span class="type-pill ${recipe.type}">${recipe.type.toUpperCase()}</span>
            <span class="prep-time"><i class="fa-regular fa-clock"></i> ${recipe.prepTime || 15} min</span>
            ${isBatchRecommended ? '<span class="badge-batch-companion"><i class="fa-solid fa-layer-group"></i> 🍱 Tienes la base cocinada</span>' : isCompRecommended ? '<span class="badge-recommended"><i class="fa-solid fa-star"></i> Sugerencia para equilibrar</span>' : ''}
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
/**
 * RECIPE DETAIL MODAL (with dynamic servings scaler: 1 persona / 2 personas)
 */
export function openRecipeDetailModal(recipeId, targetServings = null) {
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

    const baseServings = Number(recipe.servings) || 2;
    const currentServings = targetServings !== null ? Number(targetServings) : baseServings;
    const scale = currentServings / baseServings;

    const perPersonKcal = Math.round(Number(recipe.calories || 0));
    const perPersonProt = Math.round(Number(recipe.protein || 0));
    const perPersonCarbs = Math.round(Number(recipe.carbs || 0));
    const perPersonFats = Math.round(Number(recipe.fats || 0));

    const totalKcal = Math.round(perPersonKcal * currentServings);
    const totalProt = Math.round(perPersonProt * currentServings);
    const totalCarbs = Math.round(perPersonCarbs * currentServings);
    const totalFats = Math.round(perPersonFats * currentServings);

    const ingredientsHtml = (recipe.ingredients || []).map(ing => {
      const rawAmt = Number(ing.amount || 0);
      const scaledAmt = Math.round((rawAmt * scale) * 10) / 10;
      return `
        <li style="display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px dashed var(--border-color); font-size: 0.88rem;">
          <span>${ing.name}</span>
          <strong style="color:var(--text-main);">${scaledAmt} ${ing.unit}</strong>
        </li>
      `;
    }).join("");

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
          <!-- SERVINGS SELECTOR -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.84rem; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-users" style="color: var(--accent-cyan);"></i> Raciones a preparar:
            </span>
            <div style="display: flex; gap: 0.35rem;">
              <button type="button" onclick="openRecipeDetailModal('${recipe.id}', 1)" style="padding: 4px 10px; font-size: 0.78rem; border-radius: 6px; border: 1px solid ${currentServings === 1 ? 'var(--accent-cyan)' : 'var(--border-color)'}; background: ${currentServings === 1 ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.04)'}; color: ${currentServings === 1 ? 'var(--accent-cyan)' : 'var(--text-muted)'}; font-weight: 700; cursor: pointer;">
                👤 1 persona
              </button>
              <button type="button" onclick="openRecipeDetailModal('${recipe.id}', 2)" style="padding: 4px 10px; font-size: 0.78rem; border-radius: 6px; border: 1px solid ${currentServings === 2 ? 'var(--accent-cyan)' : 'var(--border-color)'}; background: ${currentServings === 2 ? 'rgba(6,182,212,0.18)' : 'rgba(255,255,255,0.04)'}; color: ${currentServings === 2 ? 'var(--accent-cyan)' : 'var(--text-muted)'}; font-weight: 700; cursor: pointer;">
                👥 2 personas (Carlos y Andrea)
              </button>
            </div>
          </div>

          <div class="meal-macros-pills" style="margin-bottom: 0.5rem;">
            <span class="macro-pill" style="color:var(--accent-amber); font-weight:700;"><i class="fa-solid fa-fire"></i> ${perPersonKcal} kcal/p</span>
            <span class="macro-pill" style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-dumbbell"></i> ${perPersonProt}g Prot</span>
            <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${perPersonCarbs}g Carbs</span>
            <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${perPersonFats}g Grasas</span>
          </div>

          ${currentServings > 1 ? `
            <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 1rem; background: rgba(0,0,0,0.2); padding: 5px 10px; border-radius: 4px;">
              Total en sartén/cazuela (${currentServings} raciones): <strong style="color:var(--accent-amber);">${totalKcal} kcal</strong> (${totalProt}g P • ${totalCarbs}g C • ${totalFats}g G)
            </div>
          ` : '<div style="margin-bottom: 0.75rem;"></div>'}

          <h4 style="margin: 1rem 0 0.5rem 0; font-size: 0.95rem; color: var(--accent-emerald); display: flex; justify-content: space-between; align-items: center;">
            <span><i class="fa-solid fa-basket-shopping"></i> Ingredientes necesarios:</span>
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--accent-cyan);">${currentServings === 1 ? 'Para 1 persona' : 'Para 2 personas'}</span>
          </h4>
          <ul style="list-style:none; padding: 0;">${ingredientsHtml}</ul>

          <h4 style="margin: 1.25rem 0 0.5rem 0; font-size: 0.95rem; color: var(--accent-cyan);"><i class="fa-solid fa-list-ol"></i> Pasos de preparación:</h4>
          <ol style="padding-left: 1.15rem; margin-top: 0.4rem;">${stepsHtml}</ol>

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

/**
 * AUTO CALCULATE MACROS FOR CUSTOM RECIPE MODALS (Per person based on servings)
 */
export function autoCalculateRecipeModalMacros(prefix = 'new') {
  try {
    const textarea = document.getElementById(`${prefix}-recipe-ingredients`);
    if (!textarea) return;
    const raw = textarea.value.trim();
    if (!raw) return;

    const servingsSelect = document.getElementById(`${prefix}-recipe-servings`);
    const servings = servingsSelect ? (Number(servingsSelect.value) || 2) : 2;

    const result = calculateMacrosFromIngredients(raw);
    const kcalInput = document.getElementById(`${prefix}-recipe-kcal`);
    const protInput = document.getElementById(`${prefix}-recipe-prot`);
    const carbsInput = document.getElementById(`${prefix}-recipe-carbs`);
    const fatsInput = document.getElementById(`${prefix}-recipe-fats`);
    const hintElem = document.getElementById(`${prefix}-recipe-macro-hint`);

    const perPersonKcal = Math.round(result.calories / servings);
    const perPersonProt = Math.round(result.protein / servings);
    const perPersonCarbs = Math.round(result.carbs / servings);
    const perPersonFats = Math.round(result.fats / servings);

    if (kcalInput && result.calories > 0) kcalInput.value = perPersonKcal;
    if (protInput && result.protein >= 0) protInput.value = perPersonProt;
    if (carbsInput && result.carbs >= 0) carbsInput.value = perPersonCarbs;
    if (fatsInput && result.fats >= 0) fatsInput.value = perPersonFats;

    if (hintElem) {
      hintElem.innerHTML = `
        <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.25); border-radius: 6px; padding: 5px 10px; margin-top: 5px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; font-size: 0.78rem;">
          <span style="color: var(--text-main);"><i class="fa-solid fa-calculator" style="color:var(--accent-cyan); margin-right: 4px;"></i> Por ración (${servings} ${servings === 1 ? 'persona' : 'personas'}): <strong style="color:var(--accent-amber);">${perPersonKcal} kcal</strong> (${perPersonProt}g Prot • ${perPersonCarbs}g Carbs • ${perPersonFats}g G) ${servings > 1 ? `• <small style="color:var(--text-muted);">Total cazuela: ${result.calories} kcal</small>` : ''}</span>
          <span style="color: var(--accent-emerald); font-weight: 600;">✓ Auto-rellenado</span>
        </div>
      `;
    }
  } catch(e) {
    console.error("Error auto-calculating macros:", e);
  }
}

let generatedRecipeCandidate = null;
let generatedBatchCandidate = null;

/**
 * AI RECIPE GENERATOR MODAL (Modo Inteligente)
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
    generatedBatchCandidate = null;

    modal.innerHTML = `
      <div class="glass-modal ai-generator-modal-card" style="max-width: 620px; max-height: 92vh; overflow-y: auto;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-title">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(6,182,212,0.3);">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3>Modo Inteligente: Generador de Recetas</h3>
              <p>Describe tu plato o lote (ej. 1 kg de carne) y calcularemos pasos y macros</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" onclick="document.getElementById('ai-recipe-generator-modal').classList.remove('active')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body" style="padding-top: 1rem;">
          <div class="form-group">
            <label style="font-weight: 600; display:flex; justify-content:space-between; margin-bottom: 0.4rem;">
              <span>Describe la receta o preparación que quieres</span>
              <span style="font-size:0.75rem; color:var(--accent-cyan);">Lenguaje natural</span>
            </label>
            <textarea id="ai-prompt-input" class="ios-input" rows="3" placeholder="ej. Cabecero de lomo entero (1 kg) al horno para dividir en 3 recetas de la semana"></textarea>
          </div>

          <div style="margin: 0.85rem 0;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom: 0.4rem;">💡 Pulsa una sugerencia rápida para probar:</span>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Cabecero de lomo entero (1 kg) al horno para dividir en 3 recetas de la semana')">🍱 Cabecero de Lomo (1 kg Batch)</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Pasta integral con carne picada de ternera magra, salsa de tomate y queso parmesano')">🍝 Pasta con Ternera</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Arroz basmati con pechuga de pollo y pimientos salteados')">🍚 Arroz con Pollo</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Lomo de salmón a la plancha con patatas al horno y espárragos trigueros')">🐟 Salmón con Patatas</button>
              <button type="button" class="ai-chip-btn" onclick="setAiPrompt('Tortilla francesa de 2 huevos con espinacas baby y queso feta')">🍳 Tortilla con Espinacas</button>
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
              <label>Raciones por plato</label>
              <select id="ai-servings" class="custom-select" style="width: 100%;">
                <option value="2" selected>👥 2 Raciones (Carlos y Andrea - Por defecto)</option>
                <option value="1">👤 1 Ración (Individual)</option>
              </select>
            </div>
          </div>

          <!-- BATCH COOKING OPTION -->
          <div style="margin-top: 0.85rem; padding: 0.75rem 1rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
            <div>
              <span style="font-size: 0.84rem; font-weight: 700; color: var(--accent-amber); display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-layer-group"></i> Modo Batch Cooking / Aprovechamiento
              </span>
              <span style="font-size: 0.74rem; color: var(--text-muted); display: block; margin-top: 2px;">
                Divide piezas grandes (ej. 1 kg de carne) en 3 recetas variadas y equilibradas para la semana
              </span>
            </div>
            <label class="switch" style="margin: 0; flex-shrink: 0;">
              <input type="checkbox" id="ai-batch-cooking-toggle">
              <span class="slider round"></span>
            </label>
          </div>

          <button type="button" id="ai-generate-btn" class="btn-primary" onclick="generateAiRecipeFromForm()" style="width: 100%; justify-content: center; padding: 0.85rem; margin-top: 1.25rem; font-size: 0.95rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)); border: none; font-weight: 700; box-shadow: 0 4px 16px rgba(6,182,212,0.3);">
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
    // Auto-check batch cooking toggle if text includes 1 kg or batch
    const toggle = document.getElementById("ai-batch-cooking-toggle");
    if (toggle && (text.includes("1 kg") || text.includes("kilo") || text.includes("Batch") || text.includes("dividir"))) {
      toggle.checked = true;
    }
    input.focus();
  }
}

export async function generateAiRecipeFromForm() {
  const submitBtn = document.getElementById("ai-generate-btn");
  try {
    triggerHapticTouch();
    const promptInput = document.getElementById("ai-prompt-input");
    const typeSelect = document.getElementById("ai-meal-type");
    const servingsSelect = document.getElementById("ai-servings");
    const batchToggle = document.getElementById("ai-batch-cooking-toggle");
    const container = document.getElementById("ai-recipe-result-container");

    if (!promptInput || !container) return;
    const prompt = promptInput.value.trim();
    if (!prompt) {
      showIosToast("⚠️ Escribe una descripción o pulsa una idea rápida", "fa-solid fa-triangle-exclamation");
      return;
    }

    const type = typeSelect ? typeSelect.value : "auto";
    const servings = servingsSelect ? parseInt(servingsSelect.value, 10) : 2;
    const forceBatch = batchToggle ? batchToggle.checked : false;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analizando preparación con IA...';
    }

    const result = await generateRecipeWithAi(prompt, type, servings, forceBatch);
    if (!result) {
      showIosToast("⚠️ No pudimos procesar la receta", "fa-solid fa-triangle-exclamation");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generar Receta con Macros y Pasos';
      }
      return;
    }

    // CHECK IF RESULT IS A BATCH COOKING MULTI-RECIPE PLAN
    if (result.isBatch && Array.isArray(result.recipes) && result.recipes.length > 0) {
      generatedBatchCandidate = result;
      generatedRecipeCandidate = null;

      renderBatchCandidateView();
      showIosToast("🍱 ¡3 recetas de aprovechamiento generadas!", "fa-solid fa-layer-group");
      return;
    }

    // SINGLE RECIPE FLOW
    generatedRecipeCandidate = result;
    generatedBatchCandidate = null;

    const ingHtml = (result.ingredients || []).map(i => `
      <li style="display:flex; justify-content:space-between; padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); font-size: 0.84rem;">
        <span>${i.name}</span>
        <strong style="color:var(--text-main);">${i.amount} ${i.unit}</strong>
      </li>
    `).join("");

    const stepsHtml = (result.instructions || []).map((s, idx) => `
      <li style="margin-bottom: 0.5rem; font-size: 0.84rem; line-height: 1.45;">
        <strong style="color:var(--accent-cyan);">${idx + 1}.</strong> ${s}
      </li>
    `).join("");

    container.style.display = "block";
    container.innerHTML = `
      <div class="glass-card generated-recipe-card" style="border: 1px solid var(--accent-cyan); background: rgba(6, 182, 212, 0.06); padding: 1.25rem; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div>
            <span class="type-pill ${result.type}" style="font-size: 0.72rem;">${result.type.toUpperCase()} • ${result.prepTime} min</span>
            <h3 style="font-size: 1.15rem; margin: 0.4rem 0 0.2rem 0; color: var(--text-main); font-weight: 700;">${result.name}</h3>
          </div>
          <span style="font-size: 0.72rem; background: rgba(16,185,129,0.15); color: var(--accent-emerald); padding: 2px 8px; border-radius: 9999px; font-weight: 700;">✨ Calculado</span>
        </div>

        <div class="meal-macros-pills" style="margin: 0.85rem 0;">
          <span class="macro-pill" style="color:var(--accent-amber); font-weight:700;"><i class="fa-solid fa-fire"></i> ${result.calories} kcal</span>
          <span class="macro-pill" style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-dumbbell"></i> ${result.protein}g Prot</span>
          <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${result.carbs}g Carbs</span>
          <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${result.fats}g Grasas</span>
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
    showIosToast("❌ Error al generar la receta", "fa-solid fa-triangle-exclamation");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generar Receta con Macros y Pasos';
    }
  }
}

export function saveGeneratedRecipeCandidate() {
  if (!generatedRecipeCandidate) return;
  if (!Array.isArray(appState.customRecipes)) appState.customRecipes = [];
  appState.customRecipes.push(generatedRecipeCandidate);
  if (Array.isArray(appState.deletedRecipeIds)) {
    appState.deletedRecipeIds = appState.deletedRecipeIds.filter(id => id !== generatedRecipeCandidate.id);
  }
  appState.mealPlansLastModified = Date.now();
  saveState();
  if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

  const modal = document.getElementById("ai-recipe-generator-modal");
  if (modal) modal.classList.remove("active");

  renderNutritionRecipesView();
  renderNutritionMenuView();
  renderShoppingView();
  showIosToast(`🎉 ¡"${generatedRecipeCandidate.name}" guardada y publicada!`, "fa-solid fa-cloud-arrow-up");
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

export function saveAllBatchCookingRecipes() {
  if (!generatedBatchCandidate || !Array.isArray(generatedBatchCandidate.recipes)) return;
  if (!Array.isArray(appState.customRecipes)) appState.customRecipes = [];

  const recipes = generatedBatchCandidate.recipes;
  recipes.forEach(r => {
    appState.customRecipes.push(r);
    if (Array.isArray(appState.deletedRecipeIds)) {
      appState.deletedRecipeIds = appState.deletedRecipeIds.filter(id => id !== r.id);
    }
  });

  appState.mealPlansLastModified = Date.now();
  saveState();
  if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

  const modal = document.getElementById("ai-recipe-generator-modal");
  if (modal) modal.classList.remove("active");

  renderNutritionRecipesView();
  renderNutritionMenuView();
  renderShoppingView();
  showIosToast(`🎉 ¡${recipes.length} recetas de batch cooking guardadas y publicadas!`, "fa-solid fa-cloud-arrow-up");
}

export function saveSingleBatchRecipe(index) {
  if (!generatedBatchCandidate || !Array.isArray(generatedBatchCandidate.recipes)) return;
  const recipe = generatedBatchCandidate.recipes[index];
  if (!recipe) return;

  if (!Array.isArray(appState.customRecipes)) appState.customRecipes = [];
  appState.customRecipes.push(recipe);
  if (Array.isArray(appState.deletedRecipeIds)) {
    appState.deletedRecipeIds = appState.deletedRecipeIds.filter(id => id !== recipe.id);
  }

  appState.mealPlansLastModified = Date.now();
  saveState();
  if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

  renderNutritionRecipesView();
  renderNutritionMenuView();
  renderShoppingView();
  showIosToast(`🎉 "${recipe.name}" guardada en el catálogo`, "fa-solid fa-bookmark");
}

export function editSingleBatchRecipe(index) {
  if (!generatedBatchCandidate || !Array.isArray(generatedBatchCandidate.recipes)) return;
  const recipe = generatedBatchCandidate.recipes[index];
  if (!recipe) return;

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

    if (nameEl) nameEl.value = recipe.name;
    if (typeEl) typeEl.value = recipe.type;
    if (prepEl) prepEl.value = recipe.prepTime;
    if (kcalEl) kcalEl.value = recipe.calories;
    if (protEl) protEl.value = recipe.protein;
    if (carbsEl) carbsEl.value = recipe.carbs;
    if (fatsEl) fatsEl.value = recipe.fats;
    if (ingEl) {
      ingEl.value = (recipe.ingredients || []).map(i => `${i.name}, ${i.amount}, ${i.unit}`).join("\n");
      autoCalculateRecipeModalMacros('new');
    }
    if (stepsEl) stepsEl.value = (recipe.instructions || []).join("\n");
  }, 100);
}

/**
 * Renders HTML for the 3 batch cooking recipe cards with actions to save, edit,
 * or ask the AI for a distinct alternative with custom user suggestions.
 */
export function renderBatchRecipesListHtml(recipes, highlightedIndex = -1) {
  if (!Array.isArray(recipes)) return "";

  return recipes.map((r, idx) => {
    const isHighlighted = highlightedIndex === idx;
    const ingList = (r.ingredients || []).map(i => `
      <li style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.06); font-size: 0.8rem;">
        <span>${i.name}</span>
        <strong style="color:var(--text-main);">${i.amount} ${i.unit}</strong>
      </li>
    `).join("");

    const stepsList = (r.instructions || []).map((s, sIdx) => `
      <li style="margin-bottom: 0.35rem; font-size: 0.8rem; line-height: 1.4;">
        <strong style="color:var(--accent-cyan);">${sIdx + 1}.</strong> ${s}
      </li>
    `).join("");

    return `
      <div class="glass-card ${isHighlighted ? 'batch-card-highlight' : ''}" id="batch-recipe-card-${idx}" style="border: 1px solid ${isHighlighted ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}; background: ${isHighlighted ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.03)'}; border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1rem; transition: all 0.3s ease;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
          <div>
            <span class="type-pill ${r.type}" style="font-size: 0.68rem;">${r.type.toUpperCase()} • ${r.prepTime} min</span>
            <h4 style="font-size: 1.05rem; margin: 0.35rem 0 0.2rem 0; color: var(--text-main); font-weight: 700;">
              ${idx + 1}. ${r.name}
            </h4>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            <span style="font-size: 0.68rem; background: rgba(245,158,11,0.15); color: var(--accent-amber); padding: 2px 7px; border-radius: 9999px; font-weight: 700;">Receta ${idx + 1} de ${recipes.length}</span>
            ${isHighlighted ? '<span style="font-size: 0.65rem; background: rgba(6,182,212,0.25); color: var(--accent-cyan); padding: 2px 7px; border-radius: 9999px; font-weight: 700; border: 1px solid rgba(6,182,212,0.4);"><i class="fa-solid fa-sparkles"></i> Alternativa generada</span>' : ''}
          </div>
        </div>

        <div class="meal-macros-pills" style="margin: 0.6rem 0;">
          <span class="macro-pill" style="color:var(--accent-amber); font-weight:700;"><i class="fa-solid fa-fire"></i> ${r.calories} kcal/p</span>
          <span class="macro-pill" style="color:var(--accent-emerald); font-weight:700;"><i class="fa-solid fa-dumbbell"></i> ${r.protein}g Prot</span>
          <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${r.carbs}g Carbs</span>
          <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${r.fats}g Grasas</span>
        </div>

        <div style="margin-top: 0.6rem;">
          <span style="font-size: 0.8rem; color: var(--accent-emerald); font-weight: 600; display: block; margin-bottom: 0.3rem;"><i class="fa-solid fa-basket-shopping"></i> Ingredientes:</span>
          <ul style="list-style: none; padding: 0; margin: 0;">${ingList}</ul>
        </div>

        <div style="margin-top: 0.6rem;">
          <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600; display: block; margin-bottom: 0.3rem;"><i class="fa-solid fa-list-ol"></i> Pasos:</span>
          <ol style="padding-left: 1.1rem; margin: 0; color: var(--text-muted);">${stepsList}</ol>
        </div>

        <div style="display: flex; gap: 0.45rem; margin-top: 0.85rem; flex-wrap: wrap;">
          <button type="button" class="btn-secondary" onclick="window.saveSingleBatchRecipe ? window.saveSingleBatchRecipe(${idx}) : saveSingleBatchRecipe(${idx})" style="flex: 1; min-width: 100px; padding: 0.5rem 0.6rem; font-size: 0.76rem; justify-content: center; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color);">
            <i class="fa-solid fa-bookmark"></i> Guardar solo esta
          </button>
          <button type="button" class="btn-secondary" onclick="window.editSingleBatchRecipe ? window.editSingleBatchRecipe(${idx}) : editSingleBatchRecipe(${idx})" style="padding: 0.5rem 0.6rem; font-size: 0.76rem; justify-content: center; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color);">
            <i class="fa-solid fa-pen-to-square"></i> Retocar
          </button>
          <button type="button" class="btn-secondary" onclick="window.toggleBatchRecipeAiAlternative ? window.toggleBatchRecipeAiAlternative(${idx}) : toggleBatchRecipeAiAlternative(${idx})" style="padding: 0.5rem 0.75rem; font-size: 0.76rem; justify-content: center; background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.3); color: var(--accent-cyan); font-weight: 600;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Otra alternativa IA
          </button>
          <button type="button" class="btn-secondary" onclick="window.removeSingleBatchRecipe ? window.removeSingleBatchRecipe(${idx}) : removeSingleBatchRecipe(${idx})" style="padding: 0.5rem 0.65rem; font-size: 0.76rem; justify-content: center; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171;" title="Quitar de este lote">
            <i class="fa-solid fa-trash-can"></i> Quitar
          </button>
        </div>

        <!-- COLLAPSIBLE REGENERATION PANEL -->
        <div id="batch-ai-alt-panel-${idx}" style="display: none; margin-top: 0.85rem; padding: 0.85rem; background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: var(--radius-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; gap: 0.35rem;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Pedir alternativa a la IA (Receta ${idx + 1})
            </span>
            <button type="button" onclick="window.toggleBatchRecipeAiAlternative ? window.toggleBatchRecipeAiAlternative(${idx}) : toggleBatchRecipeAiAlternative(${idx})" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem; padding: 2px 6px;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0 0 0.5rem 0; line-height: 1.35;">
            Indica tus preferencias (ingredientes, ración de carne o estilo) o pulsa una idea rápida. Si lo dejas vacío, la IA propondrá una idea diferente automáticamente.
          </p>

          <div style="margin-bottom: 0.5rem;">
            <input type="text" id="batch-alt-input-${idx}" class="ios-input" placeholder="ej. Hazla con pasta integral, o ración de 250g de carne, o ensalada ligera..." style="font-size: 0.82rem; padding: 0.5rem 0.75rem;" />
          </div>

          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
            <button type="button" class="ai-chip-btn" onclick="window.setBatchAltPrompt ? window.setBatchAltPrompt(${idx}, 'Ensalada fresca y ligera para cenar') : setBatchAltPrompt(${idx}, 'Ensalada fresca y ligera para cenar')">🥗 Ensalada ligera</button>
            <button type="button" class="ai-chip-btn" onclick="window.setBatchAltPrompt ? window.setBatchAltPrompt(${idx}, 'Con pasta integral y salsa de tomate') : setBatchAltPrompt(${idx}, 'Con pasta integral y salsa de tomate')">🍝 Con pasta</button>
            <button type="button" class="ai-chip-btn" onclick="window.setBatchAltPrompt ? window.setBatchAltPrompt(${idx}, 'Arroz salteado estilo wok con verduras') : setBatchAltPrompt(${idx}, 'Arroz salteado estilo wok con verduras')">🍚 Con arroz / wok</button>
            <button type="button" class="ai-chip-btn" onclick="window.setBatchAltPrompt ? window.setBatchAltPrompt(${idx}, 'Fajitas o tacos con pimientos y cebolla') : setBatchAltPrompt(${idx}, 'Fajitas o tacos con pimientos y cebolla')">🌯 Fajitas / Tacos</button>
            <button type="button" class="ai-chip-btn" onclick="window.setBatchAltPrompt ? window.setBatchAltPrompt(${idx}, 'Ración más generosa con 220g de carne') : setBatchAltPrompt(${idx}, 'Ración más generosa con 220g de carne')">🥩 Más carne (220g)</button>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button type="button" id="batch-alt-submit-${idx}" class="btn-primary" onclick="window.applyBatchRecipeAiAlternative ? window.applyBatchRecipeAiAlternative(${idx}) : applyBatchRecipeAiAlternative(${idx})" style="flex: 1; justify-content: center; padding: 0.55rem 0.85rem; font-size: 0.82rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)); border: none; font-weight: 700;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Generar Alternativa con IA
            </button>
            <button type="button" class="btn-secondary" onclick="window.toggleBatchRecipeAiAlternative ? window.toggleBatchRecipeAiAlternative(${idx}) : toggleBatchRecipeAiAlternative(${idx})" style="padding: 0.55rem 0.75rem; font-size: 0.82rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

export function renderBatchCandidateView(highlightedIndex = -1) {
  const container = document.getElementById("ai-recipe-result-container");
  if (!container || !generatedBatchCandidate) return;

  const result = generatedBatchCandidate;
  const count = (result.recipes || []).length;
  const countLabel = count === 1 ? "1 RECETA" : `${count} RECETAS`;
  const saveLabel = count === 1 ? "Guardar la receta en mi Catálogo" : `Guardar las ${count} recetas en mi Catálogo`;
  const batchHtml = renderBatchRecipesListHtml(result.recipes, highlightedIndex);

  container.style.display = "block";
  container.innerHTML = `
    <div class="glass-card generated-batch-card" style="border: 1px solid var(--accent-amber); background: rgba(245, 158, 11, 0.05); padding: 1.25rem; border-radius: var(--radius-md);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem;">
        <div>
          <span style="font-size: 0.72rem; background: rgba(245,158,11,0.2); color: var(--accent-amber); padding: 3px 10px; border-radius: 9999px; font-weight: 800;">
            <i class="fa-solid fa-layer-group"></i> PLAN DE BATCH COOKING (${countLabel})
          </span>
          <h3 style="font-size: 1.2rem; margin: 0.5rem 0 0.2rem 0; color: var(--text-main); font-weight: 700;">${result.batchTitle}</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">${result.basePrep}</p>
        </div>
      </div>

      <div style="margin: 0.85rem 0 1.25rem 0; background: rgba(0,0,0,0.25); border-left: 3px solid var(--accent-amber); padding: 0.65rem 0.85rem; border-radius: 4px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
        💡 <strong>Presupuesto calórico inteligente:</strong> Calibrado por momento del día. Las <strong>comidas</strong> aportan mayor energía (~650-850 kcal) con hidratos complejos para rendir y entrenar, mientras que las <strong>cenas</strong> son más ligeras y digestivas (~380-520 kcal) para optimizar el descanso. Puedes regenerar, añadir o quitar platos según tus necesidades.
      </div>

      <button type="button" class="btn-primary" onclick="window.saveAllBatchCookingRecipes ? window.saveAllBatchCookingRecipes() : saveAllBatchCookingRecipes()" style="width: 100%; justify-content: center; padding: 0.85rem; margin-bottom: 1.25rem; font-weight: 700; background: linear-gradient(135deg, var(--accent-amber), #ea580c); border: none; box-shadow: 0 4px 16px rgba(245,158,11,0.3);">
        <i class="fa-solid fa-floppy-disk"></i> ${saveLabel}
      </button>

      <div class="batch-recipes-list">
        ${batchHtml}
      </div>

      <!-- ADD EXTRA RECIPE TO BATCH PANEL -->
      <div class="glass-card" style="margin-top: 0.75rem; margin-bottom: 1.25rem; border: 1px dashed var(--accent-cyan); background: rgba(6,182,212,0.04); padding: 1rem; border-radius: var(--radius-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <strong style="font-size: 0.85rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> ¿Quieres añadir otra receta con IA a este lote?
          </strong>
        </div>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0 0 0.55rem 0; line-height: 1.35;">
          Indica una sugerencia culinaria (ej. con arroz, pasta, tupper, cena ligera) o deja que la IA invente un nuevo plato complementario.
        </p>
        <div style="margin-bottom: 0.5rem;">
          <input type="text" id="add-batch-recipe-input" class="ios-input" placeholder="ej. Haz un wok de arroz con verduras, o pasta integral, o una cena muy ligera..." style="font-size: 0.82rem; padding: 0.5rem 0.75rem;" />
        </div>
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
          <button type="button" class="ai-chip-btn" onclick="window.setAddBatchRecipePrompt ? window.setAddBatchRecipePrompt('Salteado al wok con arroz jazmín y verduras') : setAddBatchRecipePrompt('Salteado al wok con arroz jazmín y verduras')">🍚 Con arroz / wok</button>
          <button type="button" class="ai-chip-btn" onclick="window.setAddBatchRecipePrompt ? window.setAddBatchRecipePrompt('Pasta integral con carne desmenuzada y salsa casera') : setAddBatchRecipePrompt('Pasta integral con carne desmenuzada y salsa casera')">🍝 Con pasta</button>
          <button type="button" class="ai-chip-btn" onclick="window.setAddBatchRecipePrompt ? window.setAddBatchRecipePrompt('Wrap o fajita rápida con verduras') : setAddBatchRecipePrompt('Wrap o fajita rápida con verduras')">🌯 Wrap / Fajita</button>
          <button type="button" class="ai-chip-btn" onclick="window.setAddBatchRecipePrompt ? window.setAddBatchRecipePrompt('Ensalada templada muy ligera para cenar') : setAddBatchRecipePrompt('Ensalada templada muy ligera para cenar')">🥗 Ensalada ligera</button>
        </div>
        <button type="button" id="add-batch-recipe-btn" class="btn-secondary" onclick="window.applyAddBatchRecipe ? window.applyAddBatchRecipe() : applyAddBatchRecipe()" style="width: 100%; justify-content: center; padding: 0.65rem; font-size: 0.82rem; background: rgba(6,182,212,0.15); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-weight: 700;">
          <i class="fa-solid fa-plus-circle"></i> Añadir Otra Receta con IA a este Lote
        </button>
      </div>

      <button type="button" class="btn-primary" onclick="window.saveAllBatchCookingRecipes ? window.saveAllBatchCookingRecipes() : saveAllBatchCookingRecipes()" style="width: 100%; justify-content: center; padding: 0.85rem; margin-top: 0.25rem; font-weight: 700; background: linear-gradient(135deg, var(--accent-amber), #ea580c); border: none; box-shadow: 0 4px 16px rgba(245,158,11,0.3);">
        <i class="fa-solid fa-floppy-disk"></i> ${saveLabel}
      </button>
    </div>
  `;

  if (highlightedIndex >= 0) {
    setTimeout(() => {
      const card = document.getElementById(`batch-recipe-card-${highlightedIndex}`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  } else {
    container.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

export function removeSingleBatchRecipe(index) {
  triggerHapticTouch();
  if (!generatedBatchCandidate || !Array.isArray(generatedBatchCandidate.recipes)) return;
  if (index < 0 || index >= generatedBatchCandidate.recipes.length) return;

  const removedName = generatedBatchCandidate.recipes[index]?.name || "Receta";
  generatedBatchCandidate.recipes.splice(index, 1);

  if (generatedBatchCandidate.recipes.length === 0) {
    const container = document.getElementById("ai-recipe-result-container");
    if (container) container.style.display = "none";
    generatedBatchCandidate = null;
    showIosToast("Todas las recetas han sido eliminadas del lote", "fa-solid fa-trash-can");
    return;
  }

  renderBatchCandidateView();
  showIosToast(`🗑️ Receta quitada del lote: "${removedName}"`, "fa-solid fa-trash-can");
}

export function setAddBatchRecipePrompt(text) {
  triggerHapticTouch();
  const input = document.getElementById("add-batch-recipe-input");
  if (input) {
    input.value = text;
    input.focus();
  }
}

export async function applyAddBatchRecipe() {
  triggerHapticTouch();
  if (!generatedBatchCandidate || !Array.isArray(generatedBatchCandidate.recipes)) return;

  const btn = document.getElementById("add-batch-recipe-btn");
  const input = document.getElementById("add-batch-recipe-input");
  const userInstruction = input ? input.value.trim() : "";

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando nueva receta con IA...';
  }

  try {
    const newRecipe = await addBatchRecipeWithAi(generatedBatchCandidate, userInstruction);
    if (!newRecipe) {
      showIosToast("⚠️ No se pudo generar la nueva receta", "fa-solid fa-triangle-exclamation");
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Añadir Otra Receta con IA a este Lote';
      }
      return;
    }

    generatedBatchCandidate.recipes.push(newRecipe);
    renderBatchCandidateView(generatedBatchCandidate.recipes.length - 1);
    showIosToast(`✨ ¡Receta "${newRecipe.name}" añadida al lote!`, "fa-solid fa-plus");
  } catch(e) {
    console.error("Error adding batch recipe:", e);
    showIosToast("❌ Error al añadir receta con IA", "fa-solid fa-triangle-exclamation");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Añadir Otra Receta con IA a este Lote';
    }
  }
}

export function toggleBatchRecipeAiAlternative(index) {
  triggerHapticTouch();
  const panel = document.getElementById(`batch-ai-alt-panel-${index}`);
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "block" : "none";
  if (isHidden) {
    const input = document.getElementById(`batch-alt-input-${index}`);
    if (input) input.focus();
  }
}

export function setBatchAltPrompt(index, text) {
  triggerHapticTouch();
  const input = document.getElementById(`batch-alt-input-${index}`);
  if (input) {
    input.value = text;
    input.focus();
  }
}

export async function applyBatchRecipeAiAlternative(index) {
  triggerHapticTouch();
  if (!generatedBatchCandidate || !Array.isArray(generatedBatchCandidate.recipes)) return;

  const submitBtn = document.getElementById(`batch-alt-submit-${index}`);
  const input = document.getElementById(`batch-alt-input-${index}`);
  const userInstruction = input ? input.value.trim() : "";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando alternativa con IA...';
  }

  try {
    const newRecipe = await regenerateSingleBatchRecipeWithAi(generatedBatchCandidate, index, userInstruction);
    if (!newRecipe) {
      showIosToast("⚠️ No se pudo generar la alternativa", "fa-solid fa-triangle-exclamation");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generar Alternativa con IA';
      }
      return;
    }

    generatedBatchCandidate.recipes[index] = newRecipe;
    renderBatchCandidateView(index);
    showIosToast(`✨ ¡Receta ${index + 1} actualizada con nueva alternativa!`, "fa-solid fa-wand-magic-sparkles");
  } catch(e) {
    console.error("Error regenerating single batch recipe:", e);
    showIosToast("❌ Error al generar alternativa", "fa-solid fa-triangle-exclamation");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generar Alternativa con IA';
    }
  }
}

// Ensure batch cooking actions are globally accessible immediately upon module load
if (typeof window !== "undefined") {
  window.saveAllBatchCookingRecipes = saveAllBatchCookingRecipes;
  window.saveSingleBatchRecipe = saveSingleBatchRecipe;
  window.editSingleBatchRecipe = editSingleBatchRecipe;
  window.removeSingleBatchRecipe = removeSingleBatchRecipe;
  window.toggleBatchRecipeAiAlternative = toggleBatchRecipeAiAlternative;
  window.setBatchAltPrompt = setBatchAltPrompt;
  window.applyBatchRecipeAiAlternative = applyBatchRecipeAiAlternative;
  window.setAddBatchRecipePrompt = setAddBatchRecipePrompt;
  window.applyAddBatchRecipe = applyAddBatchRecipe;
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
                <label>Raciones Base</label>
                <select id="new-recipe-servings" class="custom-select" style="width: 100%;" onchange="autoCalculateRecipeModalMacros('new')">
                  <option value="2" selected>👥 2 Raciones (Carlos y Andrea)</option>
                  <option value="1">👤 1 Ración (Individual)</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <label>Tiempo de Preparación (min)</label>
              <input type="number" id="new-recipe-prep" class="ios-input" value="15" required min="1" max="180">
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.35rem;">
                <label style="margin-bottom:0;">Ingredientes (Nombre, Cantidad, Unidad) *</label>
                <button type="button" class="btn-calc-macros" onclick="autoCalculateRecipeModalMacros('new')" style="font-size:0.75rem; padding: 3px 8px; background: rgba(6,182,212,0.15); color: var(--accent-cyan); border: 1px solid rgba(6,182,212,0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-calculator"></i> Calcular Macros
                </button>
              </div>
              <textarea id="new-recipe-ingredients" class="ios-input" rows="4" placeholder="Pasta integral, 160, g&#10;Carne picada de ternera, 300, g&#10;Tomate frito, 160, g&#10;Aceite de oliva, 10, ml" oninput="autoCalculateRecipeModalMacros('new')" style="font-family: monospace; font-size: 0.82rem;"></textarea>
              <div id="new-recipe-macro-hint"></div>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Calorías / ración (kcal) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="new-recipe-kcal" class="ios-input" placeholder="ej. 520" required min="0" max="2500">
              </div>
              <div class="form-group">
                <label>Proteína / ración (g) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="new-recipe-prot" class="ios-input" placeholder="ej. 42" required min="0" max="200">
              </div>
            </div>

            <div class="form-grid-2" style="margin-top: 0.75rem;">
              <div class="form-group">
                <label>Carbohidratos (g) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="new-recipe-carbs" class="ios-input" placeholder="ej. 55" value="0" min="0" max="300">
              </div>
              <div class="form-group">
                <label>Grasas (g) <small style="color:var(--accent-cyan);">(Auto)</small></label>
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
    const servings = Number(document.getElementById("new-recipe-servings")?.value || 2);
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
      servings: servings,
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
    if (Array.isArray(appState.deletedRecipeIds)) {
      appState.deletedRecipeIds = appState.deletedRecipeIds.filter(id => id !== newRecipe.id);
    }
    appState.mealPlansLastModified = Date.now();
    saveState();
    if (window.pushToCloud) window.pushToCloud(false).catch(() => {});

    const modal = document.getElementById("create-recipe-modal");
    if (modal) modal.classList.remove("active");

    renderNutritionRecipesView();
    showIosToast(`🎉 ¡Receta "${name}" guardada y publicada!`, "fa-solid fa-cloud-arrow-up");
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
    const recipeServings = Number(recipe.servings) || 2;

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
                <label>Raciones Base</label>
                <select id="edit-recipe-servings" class="custom-select" style="width: 100%;" onchange="autoCalculateRecipeModalMacros('edit')">
                  <option value="2" ${recipeServings === 2 ? 'selected' : ''}>👥 2 Raciones (Carlos y Andrea)</option>
                  <option value="1" ${recipeServings === 1 ? 'selected' : ''}>👤 1 Ración (Individual)</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.75rem;">
              <label>Tiempo de Preparación (min)</label>
              <input type="number" id="edit-recipe-prep" class="ios-input" value="${recipe.prepTime || 15}" required min="1" max="180">
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
                <label>Calorías / ración (kcal) <small style="color:var(--accent-cyan);">(Auto)</small></label>
                <input type="number" id="edit-recipe-kcal" class="ios-input" value="${recipe.calories || 0}" required min="0" max="2500">
              </div>
              <div class="form-group">
                <label>Proteína / ración (g) <small style="color:var(--accent-cyan);">(Auto)</small></label>
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
    const servings = Number(document.getElementById("edit-recipe-servings")?.value || 2);
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
      servings: servings,
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
    showIosToast(`✏️ ¡Receta "${name}" actualizada y publicada!`, "fa-solid fa-cloud-arrow-up");
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
      showIosToast("🗑️ Receta eliminada y publicada en la nube", "fa-solid fa-cloud-arrow-up");
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
        const slotServings = getMealSlotServings(activeWeekKey, day, slot.key);
        const baseServings = Number(meal.servings) || 2;
        const scale = slotServings / baseServings;

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
          aggregated[key].amount += (Number(ing.amount || 0) * scale);
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

