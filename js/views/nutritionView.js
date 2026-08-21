import { appState, saveState, getTodayDayName } from '../state.js';
import { RECIPES_DATABASE, INGREDIENT_CATEGORIES } from '../../data.js?v=0.10.14';

export function renderExclusions() {}
export function addExclusion() {}
export function removeExclusion() {}

export function getFilteredRecipes() {
  if (!appState.exclusions || appState.exclusions.length === 0) return RECIPES_DATABASE;

  return RECIPES_DATABASE.filter(recipe => {
    const recipeText = (recipe.name + " " + recipe.ingredients.map(i => i.name).join(" ")).toLowerCase();
    return !appState.exclusions.some(ex => recipeText.includes(ex));
  });
}

export function openTodayNutrition() {
  const today = getTodayDayName();
  appState.activeDay = today;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = today;
  if (window.showTab) window.showTab("nutrition-menu-view", document.getElementById("dock-btn-nutrition"));
}

export function selectDay(dayName, btnElem) {
  appState.activeDay = dayName;
  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem) selectElem.value = dayName;
  renderNutritionMenuView();
}

export function selectDayFromDropdown(dayName) {
  appState.activeDay = dayName;
  renderNutritionMenuView();
}

export function renderNutritionMenuView() {
  const container = document.getElementById("meal-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const availableRecipes = getFilteredRecipes();
  
  if (availableRecipes.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align:center; padding: 2rem;">
        <p style="color: var(--accent-rose);">⚠️ Habéis excluido demasiados alimentos y no hay recetas disponibles en la base de datos.</p>
      </div>
    `;
    return;
  }

  const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
  const lunches = availableRecipes.filter(r => r.type === "comida");
  const dinners = availableRecipes.filter(r => r.type === "cena");
  const snacks = availableRecipes.filter(r => r.type === "snack");

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const currentDay = appState.activeDay || getTodayDayName();
  const dayIndex = dayNames.indexOf(currentDay) >= 0 ? dayNames.indexOf(currentDay) : 0;

  const selectElem = document.getElementById("nutrition-day-select");
  if (selectElem && selectElem.value !== currentDay) {
    selectElem.value = currentDay;
  }

  const mealSlots = [
    { slotLabel: "DESAYUNO", slotIcon: "fa-sun", color: "var(--accent-amber)", meal: breakfasts[dayIndex % (breakfasts.length || 1)] || RECIPES_DATABASE[0] },
    { slotLabel: "SNACK 1 (MAÑANA)", slotIcon: "fa-apple-whole", color: "var(--accent-emerald)", meal: snacks[dayIndex % (snacks.length || 1)] || RECIPES_DATABASE[8] },
    { slotLabel: "COMIDA", slotIcon: "fa-utensils", color: "var(--accent-cyan)", meal: lunches[dayIndex % (lunches.length || 1)] || RECIPES_DATABASE[3] },
    { slotLabel: "SNACK 2 (TARDE)", slotIcon: "fa-cookie-bite", color: "var(--accent-purple)", meal: snacks[(dayIndex + 1) % (snacks.length || 1)] || RECIPES_DATABASE[9] },
    { slotLabel: "CENA", slotIcon: "fa-moon", color: "var(--accent-rose)", meal: dinners[dayIndex % (dinners.length || 1)] || RECIPES_DATABASE[6] }
  ];

  mealSlots.forEach((slot, idx) => {
    const meal = slot.meal;
    if (!meal) return;

    const card = document.createElement("div");
    card.className = "glass-card meal-card vertical-meal-card";

    const ingredientsHtml = meal.ingredients.map(ing => `
      <li>
        <span>${ing.name}</span>
        <strong>${ing.amount} ${ing.unit}</strong>
      </li>
    `).join("");

    const tagsHtml = meal.tags.map(t => `<span class="macro-pill">${t}</span>`).join(" ");

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <div class="meal-card-type" style="color: ${slot.color}; font-size: 0.82rem; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid ${slot.slotIcon}"></i> <strong>${slot.slotLabel}</strong> • ${meal.prepTime} min prep
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-card); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color);">
          Plato ${idx + 1} de 5
        </span>
      </div>

      <h3 class="meal-card-title" style="font-size: 1.15rem; margin-bottom: 0.6rem;">${meal.name}</h3>
      
      <div class="meal-macros-pills" style="margin-bottom: 0.75rem;">
        <span class="macro-pill" style="color:var(--accent-amber); font-weight:600;"><i class="fa-solid fa-fire"></i> ${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald); font-weight:600;"><i class="fa-solid fa-dumbbell"></i> ${meal.protein}g Proteína</span>
        <span class="macro-pill" style="color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-wheat-awn"></i> ${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet); font-weight:600;"><i class="fa-solid fa-droplet"></i> ${meal.fats}g Grasas</span>
      </div>

      <div style="margin-bottom: 0.85rem;">${tagsHtml}</div>

      <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.3rem;">
        <i class="fa-solid fa-list-check"></i> Ingredientes necesarios:
      </h4>
      <ul class="ingredient-list">
        ${ingredientsHtml}
      </ul>

      <details style="font-size: 0.85rem; color: var(--accent-cyan); cursor: pointer; margin-top: 0.85rem; background: rgba(255,255,255,0.03); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <summary style="font-weight: 600; outline: none; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid fa-kitchen-set"></i> Ver Pasos de Preparación
        </summary>
        <ol style="margin-top: 0.6rem; padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.6;">
          ${meal.instructions.map(step => `<li style="margin-bottom: 0.3rem;">${step}</li>`).join("")}
        </ol>
      </details>
    `;
    container.appendChild(card);
  });
}

export function setRecipesRange(range) {
  appState.recipesDaysRange = range;
  saveState();
  const btn5 = document.getElementById("recipes-range-5");
  const btn7 = document.getElementById("recipes-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');
  renderNutritionRecipesView();
}

export function renderNutritionRecipesView() {
  const container = document.getElementById("recipes-cards-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.recipesDaysRange || '5';
  const dayNames = range === '5' 
    ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const btn5 = document.getElementById("recipes-range-5");
  const btn7 = document.getElementById("recipes-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  const usedRecipes = new Map();

  dayNames.forEach((dayName, idx) => {
    const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
    const lunches = availableRecipes.filter(r => r.type === "comida");
    const dinners = availableRecipes.filter(r => r.type === "cena");
    const snacks = availableRecipes.filter(r => r.type === "snack");

    const dailyMeals = [
      breakfasts[idx % (breakfasts.length || 1)],
      lunches[idx % (lunches.length || 1)],
      dinners[idx % (dinners.length || 1)],
      snacks[idx % (snacks.length || 1)],
      snacks[(idx + 1) % (snacks.length || 1)]
    ];

    dailyMeals.forEach(m => {
      if (m && !usedRecipes.has(m.id)) {
        usedRecipes.set(m.id, { meal: m, days: [dayName] });
      } else if (m && usedRecipes.has(m.id)) {
        usedRecipes.get(m.id).days.push(dayName);
      }
    });
  });

  if (usedRecipes.size === 0) {
    container.innerHTML = `<div class="glass-card"><p style="color:var(--text-muted);">No hay recetas registradas.</p></div>`;
    return;
  }

  usedRecipes.forEach(({ meal, days }) => {
    const card = document.createElement("div");
    card.className = "glass-card recipe-batch-card";

    const ingredientsHtml = meal.ingredients.map(ing => `
      <li><span>${ing.name}</span><strong>${ing.amount} ${ing.unit}</strong></li>
    `).join("");

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.4rem;">
        <span class="meal-card-type"><i class="fa-solid fa-fire-burner"></i> ${meal.type.toUpperCase()} • ${meal.prepTime} min</span>
        <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:600;"><i class="fa-solid fa-calendar-check"></i> ${days.join(", ")}</span>
      </div>
      <h3 class="meal-card-title">${meal.name}</h3>

      <div class="meal-macros-pills">
        <span class="macro-pill" style="color:var(--accent-amber);">${meal.calories} kcal</span>
        <span class="macro-pill" style="color:var(--accent-emerald);">${meal.protein}g Prot</span>
        <span class="macro-pill" style="color:var(--accent-cyan);">${meal.carbs}g Carbs</span>
        <span class="macro-pill" style="color:var(--accent-violet);">${meal.fats}g Grasas</span>
      </div>

      <h4 style="font-size:0.85rem; color:var(--text-muted); margin:0.6rem 0 0.4rem 0;">Ingredientes requeridos:</h4>
      <ul class="ingredient-list">${ingredientsHtml}</ul>

      <details style="font-size:0.85rem; color:var(--accent-cyan); cursor:pointer; margin-top:0.75rem; background:rgba(255,255,255,0.03); padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <summary style="font-weight:600;">Paso a Paso & Batch Prep</summary>
        <ol style="margin-top:0.5rem; padding-left:1.2rem; color:var(--text-muted); line-height:1.5;">
          ${meal.instructions.map(s => `<li>${s}</li>`).join("")}
        </ol>
      </details>
    `;
    container.appendChild(card);
  });
}

export function setShoppingRange(range) {
  appState.shoppingDaysRange = range;
  saveState();
  const btn5 = document.getElementById("shopping-range-5");
  const btn7 = document.getElementById("shopping-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');
  renderShoppingView();
}

export function renderShoppingView() {
  const container = document.getElementById("shopping-categories-container");
  if (!container) return;
  container.innerHTML = "";

  const range = appState.shoppingDaysRange || '5';
  const dayNames = range === '5' 
    ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const btn5 = document.getElementById("shopping-range-5");
  const btn7 = document.getElementById("shopping-range-7");
  if (btn5) btn5.classList.toggle("active", range === '5');
  if (btn7) btn7.classList.toggle("active", range === '7');

  const availableRecipes = getFilteredRecipes();
  const aggregated = {};

  dayNames.forEach((d, idx) => {
    const breakfasts = availableRecipes.filter(r => r.type === "desayuno");
    const lunches = availableRecipes.filter(r => r.type === "comida");
    const dinners = availableRecipes.filter(r => r.type === "cena");
    const snacks = availableRecipes.filter(r => r.type === "snack");

    const dailyMeals = [
      breakfasts[idx % (breakfasts.length || 1)],
      lunches[idx % (lunches.length || 1)],
      dinners[idx % (dinners.length || 1)],
      snacks[idx % (snacks.length || 1)],
      snacks[(idx + 1) % (snacks.length || 1)]
    ];

    dailyMeals.forEach(meal => {
      if (!meal) return;
      meal.ingredients.forEach(ing => {
        const key = `${ing.name} (${ing.unit})`;
        if (!aggregated[key]) {
          aggregated[key] = {
            name: ing.name,
            amount: 0,
            unit: ing.unit,
            category: ing.category || INGREDIENT_CATEGORIES.PANTRY
          };
        }
        aggregated[key].amount += ing.amount;
      });
    });
  });

  const categories = {};
  Object.values(aggregated).forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  Object.keys(categories).forEach(catName => {
    const catSection = document.createElement("div");
    catSection.className = "shopping-category";

    const itemsHtml = categories[catName].map(item => {
      const itemKey = item.name.toLowerCase();
      const isChecked = !!appState.checkedShoppingItems[itemKey];

      return `
        <div class="shopping-item ${isChecked ? 'checked' : ''}" onclick="toggleShoppingItem('${itemKey}', this)">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleShoppingItem('${itemKey}', this.parentNode);">
          <span class="shopping-item-name">${item.name}</span>
          <span class="shopping-item-qty">${item.amount} ${item.unit}</span>
        </div>
      `;
    }).join("");

    catSection.innerHTML = `
      <h3 class="shopping-cat-title"><i class="fa-solid fa-basket-shopping"></i> ${catName}</h3>
      <div class="shopping-items-grid">
        ${itemsHtml}
      </div>
    `;

    container.appendChild(catSection);
  });
}

export function toggleShoppingItem(itemKey, elem) {
  appState.checkedShoppingItems[itemKey] = !appState.checkedShoppingItems[itemKey];
  saveState();
  if (elem) {
    elem.classList.toggle("checked", appState.checkedShoppingItems[itemKey]);
    const checkbox = elem.querySelector("input[type='checkbox']");
    if (checkbox) checkbox.checked = appState.checkedShoppingItems[itemKey];
  }
}

export function copyShoppingList() {
  let text = "🛒 LISTA DE LA COMPRA - FITDUO & COLLIE 🛒\n\n";

  document.querySelectorAll(".shopping-category").forEach(cat => {
    const title = cat.querySelector(".shopping-cat-title").innerText;
    text += `\n--- ${title} ---\n`;
    cat.querySelectorAll(".shopping-item").forEach(item => {
      const name = item.querySelector(".shopping-item-name").innerText;
      const qty = item.querySelector(".shopping-item-qty").innerText;
      const checked = item.classList.contains("checked") ? "[X]" : "[ ]";
      text += `${checked} ${name}: ${qty}\n`;
    });
  });

  navigator.clipboard.writeText(text).then(() => {
    alert("¡Lista de la compra copiada al portapapeles! Puedes pegarla en WhatsApp o Notas.");
  });
}
