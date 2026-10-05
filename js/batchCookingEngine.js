/**
 * FitDuo - Batch Cooking Engine & Kitchen Parallelizer Module
 * Handles weekly ingredient consolidation (e.g. 300g rice + 200g rice = 500g total),
 * multi-appliance kitchen orchestration (Cecotec with steamer, Airfryer, Oven, 3 Hobs, Microwave),
 * texture/culinary profile affinity, and cross-batch linking.
 */

import { appState, getCurrentWeekKey, getDateForDayInWeek, getWeekDisplayLabel } from './state.js';
import { getAllRecipes, getRecipeById, getMealSlotServings, MEAL_SLOTS, DAYS_OF_WEEK } from './views/nutritionView.js';

export const KITCHEN_APPLIANCES = {
  CECOTEC_STEAMER: {
    id: "cecotec",
    name: "Robot Cecotec + Vaporera",
    icon: "fa-solid fa-robot",
    color: "#06b6d4",
    description: "Jarra para arroces, salsas y cremas + Vaporera de 2 niveles superior simultánea",
    optimalFor: ["arroz", "quinoa", "verduras al vapor", "patatas al vapor", "cremas", "salsas", "pescado al vapor"]
  },
  OVEN: {
    id: "horno",
    name: "Horno",
    icon: "fa-solid fa-fire",
    color: "#f59e0b",
    description: "Gran capacidad para asados largos, piezas grandes (lomo 1kg) y bandejas de verduras",
    optimalFor: ["cabecero", "lomo", "asado", "pollo entero", "costillas", "verduras asadas", "boniato al horno"]
  },
  AIRFRYER: {
    id: "airfryer",
    name: "Airfryer",
    icon: "fa-solid fa-wind",
    color: "#10b981",
    description: "Cocinado rápido de 15-20 min, texturas doradas y crujientes con mínimo aceite",
    optimalFor: ["dados de patata", "pollo crujiente", "champiñones", "chips de verdura", "tofu", "croquetas saludables"]
  },
  HOBS: {
    id: "fuegos",
    name: "Cocina 3 Fuegos",
    icon: "fa-solid fa-fire-burner",
    color: "#ef4444",
    description: "Sellados a fuego vivo, reducciones de salsas/vino y salteados al wok",
    optimalFor: ["salteado", "wok", "reduccion", "plancha", "tortillas", "sofrito", "pasta"]
  },
  MICROWAVE: {
    id: "microondas",
    name: "Microondas",
    icon: "fa-solid fa-bolt",
    color: "#8b5cf6",
    description: "Pre-cocción exprés para ablandar tubérculos duros (ahorra 20 min) o descongelar",
    optimalFor: ["ablandar patata", "descongelar", "escalfar express", "calentar"]
  }
};

/**
 * Checks if an ingredient is suitable for batch cooking preparation in bulk.
 * Excludes seasonings, oils, breads, fresh snacking fruits, breakfast dairy/powders, ready-to-eat canned items.
 */
export function isBatchableIngredient(rawName) {
  if (!rawName) return false;
  const n = rawName.toLowerCase().trim();

  // Exclude non-batchable pantry/breakfast/seasoning items
  // Breads, toasts, wraps, tortillas, doughs
  if (/\b(pan|tostada|tostadas|tosta|tostas|molde|picos|rebanada|tortilla\s+de\s+trigo|tortillas\s+de\s+trigo|wrap|wraps|fajita|fajitas|masa)\b/i.test(n)) {
    return false;
  }

  // Oils, vinegars, fats, dressings, spices, seasonings, condiments
  if (/\b(aceite|aove|vinagre|sal|pimienta|orégano|oregano|laurel|piment[oó]n|comino|ajo\s+en\s+polvo|especias|hierbas|salsa\s+de\s+soja|soja|mostaza|miel|curry|mayonesa|salsa)\b/i.test(n)) {
    return false;
  }

  // Breakfast, liquids, dairy, supplements, sweet items
  if (/\b(leche|bebida\s+vegetal|caf[eé]|t[eé]|agua|zumo|yogur|yogurt|queso|mozzarella|parmesano|reques[oó]n|feta|mantequilla|whey|prote[ií]na|edulcorante|cacao|avena|copos)\b/i.test(n)) {
    return false;
  }

  // Canned items ready to eat without cooking
  if (/\b(at[uú]n\s+en\s+lata|at[uú]n\s+claro|bonito\s+del\s+norte|sardinas?\s+en\s+lata|jam[oó]n\s+serrano|fiambre|lonchas?)\b/i.test(n)) {
    return false;
  }

  // Fresh raw fruits & nuts & raw snacking vegetables
  if (/\b(manzana|pl[aá]tano|fresas?|ar[aá]ndanos?|aguacate|lim[oó]n|naranja|nueces|almendras|cacahuete|crema\s+de\s+cacahuete|semillas|lechuga|can[oó]nigos|r[uú]cula)\b/i.test(n)) {
    return false;
  }

  // Raw eggs / egg whites for quick pan cooking (not batch prep unless explicitly boiled egg)
  if (/\b(claras?|huevo|huevos)\b/i.test(n) && !/cocido|duro/i.test(n)) {
    return false;
  }

  // Only return true if it matches a known batchable food group
  return isKnownBatchCandidateFood(n);
}

function isKnownBatchCandidateFood(n) {
  // Grains & starches - strictly rice, pasta, quinoa, gnocchi, legumes
  if (/\b(arroz|basmati|jazm[ií]n|arborio|carnaroli|bomba)\b|arroz\s+(integral|vaporizado|redondo|largo)/i.test(n)) return true;
  if (/\b(pasta|macarr[oó]n|macarrones|espagueti|espaguetis|plumas|h[eé]lices|tallarines|fideos)\b/i.test(n)) return true;
  if (/\bquinoa\b/i.test(n)) return true;
  if (/\b(gnocchi|gnocchis|ñoqui|ñoquis)\b/i.test(n)) return true;
  if (/\b(lenteja|lentejas|garbanzo|garbanzos|alubia|alubias)\b/i.test(n)) return true;

  // Tubers
  if (/\b(patata|patatas|papas|boniato|boniatos|batata|batatas)\b/i.test(n)) return true;

  // Proteins
  if (/\b(cabecero|lomo|pollo|pechuga|pechugas|pavo|ternera|carne\s+picada|salm[oó]n|merluza|pescado|lubina|dorada|bacalao|sepia|calamar|calamares|gamba|gambas|langostino|langostinos)\b/i.test(n)) return true;
  if (/\bhuevo.*(cocido|duro)/i.test(n)) return true;

  // Veggies
  if (/\b(calabac[ií]n|champi[ñn]on|champi[ñn]ones|seta|setas|pimiento|pimientos|cebolla|cebollas|br[oó]coli|zanahoria|zanahorias|jud[ií]as?\s+verdes?|berenjena|berenjenas|coliflor|esp[aá]rragos?)\b/i.test(n)) return true;

  return false;
}

/**
 * Normalizes an ingredient name for grouping common batch cooking foods.
 */
export function normalizeBatchIngredientName(rawName) {
  if (!rawName) return "";
  const n = rawName.toLowerCase().trim();

  // Rice and grains - strictly rice! NEVER match standalone 'integral' which catches bread and pasta!
  if (/\b(arroz|basmati|jazm[ií]n|arborio|carnaroli|bomba)\b|arroz\s+(integral|vaporizado|redondo|largo)/i.test(n)) {
    return "Arroz (grano o cocido)";
  }
  if (/\b(pasta|macarr[oó]n|macarrones|espagueti|espaguetis|plumas|h[eé]lices|tallarines|fideos)\b/i.test(n)) {
    return "Pasta (integral / de trigo)";
  }
  if (/\bquinoa\b/i.test(n)) return "Quinoa";
  if (/\b(gnocchi|gnocchis|ñoqui|ñoquis)\b/i.test(n)) return "Gnocchis de patata";
  if (/\b(lenteja|lentejas)\b/i.test(n)) return "Lentejas cocidas";
  if (/\b(garbanzo|garbanzos)\b/i.test(n)) return "Garbanzos cocidos";

  // Tubers
  if (/\b(patata|patatas|papas)\b/i.test(n)) return "Patatas frescas";
  if (/\b(boniato|boniatos|batata|batatas)\b/i.test(n)) return "Boniato / Batata";

  // Meats and Proteins
  if (/\b(cabecero|lomo)\b/i.test(n)) return "Cabecero de lomo / Lomo de cerdo";
  if (/\b(pollo|pechuga|pechugas|kebab)\b/i.test(n)) return "Pechuga o pollo";
  if (/\bpavo\b/i.test(n)) return "Pavo";
  if (/\b(ternera|carne\s+picada)\b/i.test(n)) return "Carne de ternera";
  if (/\bsalm[oó]n\b/i.test(n)) return "Salmón";
  if (/\b(merluza|pescado|lubina|dorada|bacalao)\b/i.test(n)) return "Pescado blanco (merluza/lubina)";
  if (/\b(sepia|calamar|calamares|gamba|gambas|langostino|langostinos)\b/i.test(n)) return "Marisco limpio (sepia/gambas)";
  if (/\bhuevo.*(cocido|duro)/i.test(n)) return "Huevos cocidos";

  // Vegetables
  if (/\bcalabac[ií]n\b/i.test(n)) return "Calabacín";
  if (/\b(champi[ñn]on|champi[ñn]ones|seta|setas)\b/i.test(n)) return "Champiñones / Setas";
  if (/\bpimiento\b/i.test(n)) return "Pimientos variados";
  if (/\bcebolla\b/i.test(n)) return "Cebolla";
  if (/\bbr[oó]coli\b/i.test(n)) return "Brócoli";
  if (/\bzanahoria\b/i.test(n)) return "Zanahorias";
  if (/\bjud[ií]as?\s+verdes?\b/i.test(n)) return "Judías verdes";
  if (/\bberenjena\b/i.test(n)) return "Berenjena";
  if (/\bcoliflor\b/i.test(n)) return "Coliflor";
  if (/\besp[aá]rragos?\b/i.test(n)) return "Espárragos";

  return rawName.trim();
}

/**
 * Categorizes a batchable ingredient into culinary preparation groups.
 */
export function getBatchCategory(normalizedName) {
  const n = normalizedName.toLowerCase();
  if (/arroz|quinoa|pasta|lenteja|garbanzo/.test(n)) return { key: "grains", label: "Cereales & Carbohidratos", icon: "fa-solid fa-bowl-rice", color: "var(--accent-amber)" };
  if (/patata|boniato/.test(n)) return { key: "tubers", label: "Tubérculos & Raíces", icon: "fa-solid fa-cubes-stacked", color: "#f97316" };
  if (/lomo|cabecero|pollo|pavo|ternera|salm|pescado|huevo/.test(n)) return { key: "proteins", label: "Proteínas Base & Asados", icon: "fa-solid fa-drumstick-bite", color: "var(--accent-rose)" };
  return { key: "veggies", label: "Verduras & Guarniciones", icon: "fa-solid fa-carrot", color: "var(--accent-emerald)" };
}

/**
 * Assigns optimal kitchen appliance based on food type and prep style.
 */
export function assignAppliance(normalizedName, totalGrams, recipeStyles = [], hasGrainsInCecotec = false) {
  const n = normalizedName.toLowerCase();

  // Rice and grains -> Cecotec jarra
  if (/arroz|quinoa/.test(n)) {
    return {
      appliance: KITCHEN_APPLIANCES.CECOTEC_STEAMER,
      containerZone: "Jarra Cecotec",
      prepText: `Cocer los ${totalGrams}g en la jarra del Robot Cecotec (100°C, vel 1, 18-20 min con agua y laurel) sin ensuciar fogones.`
    };
  }

  // Pasta -> Fuegos
  if (/pasta/.test(n)) {
    return {
      appliance: KITCHEN_APPLIANCES.HOBS,
      containerZone: "Olla Grande / Fuego Central",
      prepText: `Cocer los ${totalGrams}g de pasta al dente (8-10 min) en agua hirviendo con sal, escurrir, cortar la cocción con agua fría y guardar en tupper con un hilo de AOVE.`
    };
  }

  // Steamed veggies -> Cecotec vaporera superior
  if (/br[oó]coli|jud[ií]as? verdes?|zanahoria|coliflor/.test(n)) {
    const steamNote = hasGrainsInCecotec
      ? `en la vaporera superior colocada sobre la jarra mientras se cuece el arroz/cereal, aprovechando el mismo calor.`
      : `al vapor en la vaporera del Robot Cecotec (jarra con 500ml agua a 120°C temperatura vapor, 15-18 min) conservando nutrientes y color vivo.`;
    return {
      appliance: KITCHEN_APPLIANCES.CECOTEC_STEAMER,
      containerZone: "Vaporera Cecotec (Nivel Superior)",
      prepText: `Cocinar al vapor los ${totalGrams}g ${steamNote}`
    };
  }

  // Whole large meat cut -> Oven
  if (/cabecero|lomo|asado|pollo entero/.test(n)) {
    return {
      appliance: KITCHEN_APPLIANCES.OVEN,
      containerZone: "Horno (Bandeja Central)",
      prepText: `Asar la pieza de ${totalGrams}g a 180°C con especias y reducción de vino blanco durante 45-60 min (o cocción lenta jugosa).`
    };
  }

  // Roasted tray veggies -> Oven
  if (/calabac[ií]n|pimiento|cebolla|champi|berenjena/.test(n) && totalGrams >= 350) {
    return {
      appliance: KITCHEN_APPLIANCES.OVEN,
      containerZone: "Horno (Bandeja Inferior)",
      prepText: `Cortar en dados grandes o tiras y hornear a 190°C durante 25-30 min con un toque de AOVE y hierbas provenzales.`
    };
  }

  // Crispy cubed potatoes -> Airfryer or Microwave + Airfryer
  if (/patata|boniato/.test(n)) {
    if (totalGrams <= 600) {
      return {
        appliance: KITCHEN_APPLIANCES.AIRFRYER,
        containerZone: "Cesta Airfryer",
        prepText: `Cortar en dados, pre-cocinar 4 min en microondas para ablandar y dorar 15 min en Airfryer a 195°C para máxima textura crujiente.`
      };
    } else {
      return {
        appliance: KITCHEN_APPLIANCES.OVEN,
        containerZone: "Horno (Bandeja)",
        prepText: `Por el volumen (${totalGrams}g), hornear en bandeja a 200°C durante 30-35 min con AOVE y especias para aprovechar el espacio.`
      };
    }
  }

  // Smaller veggie sauté / quick proteins -> Airfryer or Hobs
  if (/champi|dados|tiras|sepia|calamar|gamba/.test(n)) {
    return {
      appliance: KITCHEN_APPLIANCES.AIRFRYER,
      containerZone: "Airfryer",
      prepText: `Dorar en Airfryer durante 10-12 min a 185°C removiendo a mitad de tiempo.`
    };
  }

  // Default to 3 Hobs
  return {
    appliance: KITCHEN_APPLIANCES.HOBS,
    containerZone: "Fuego / Sartén Grande",
    prepText: `Cocinar los ${totalGrams}g en sartén o wok a fuego vivo 6-8 minutos con unas gotas de AOVE y reservar para tus comidas de la semana.`
  };
}

/**
 * Builds a chronological multi-appliance parallel timeline (0 to 75 minutes)
 * coordinating Cecotec (jarra + vaporera), Horno, Airfryer, Fuegos and Microondas.
 */
function buildParallelTimeline(batchCandidates) {
  const phase1 = []; // Mise en place (0 - 10 min)
  const phase2 = []; // Parallel cooking (10 - 55 min)
  const phase3 = []; // Tupper storage & separation (55 - 75 min)

  // Group preps by appliance
  const byAppliance = {
    horno: batchCandidates.filter(c => c.appliance?.id === "horno"),
    cecotec: batchCandidates.filter(c => c.appliance?.id === "cecotec"),
    airfryer: batchCandidates.filter(c => c.appliance?.id === "airfryer"),
    fuegos: batchCandidates.filter(c => c.appliance?.id === "fuegos"),
    microondas: batchCandidates.filter(c => c.appliance?.id === "microondas")
  };

  const cecotecGrains = byAppliance.cecotec.filter(c => /arroz|quinoa/i.test(c.name));
  const cecotecVeggies = byAppliance.cecotec.filter(c => !/arroz|quinoa/i.test(c.name));
  const hasVeggiesOrTubers = batchCandidates.some(c => c.category?.key === "veggies" || c.category?.key === "tubers");

  const phase1Actions = [];
  if (byAppliance.horno.length > 0) {
    phase1Actions.push("Encender el Horno a 180°C para que tome temperatura de inmediato.");
    phase1Actions.push(`Sazonar la pieza principal de horno (${byAppliance.horno.map(h => h.name).join(", ")}) con AOVE, ajo, hierbas y vino blanco.`);
  }
  if (hasVeggiesOrTubers) {
    phase1Actions.push("Lavar, pelar y trocear las verduras y tubérculos de la semana en cortes homogéneos.");
  }
  if (cecotecGrains.length > 0) {
    phase1Actions.push(`Pesar ${cecotecGrains.map(g => `${g.totalAmount}${g.unit} de ${g.name}`).join(", ")} en la jarra del Robot Cecotec.`);
  }
  if (cecotecVeggies.length > 0) {
    phase1Actions.push(`Colocar las verduras de vaporera (${cecotecVeggies.map(v => v.name).join(", ")}) en la bandeja superior.`);
  }
  if (byAppliance.airfryer.length > 0) {
    phase1Actions.push(`Preparar la cesta de la Airfryer para ${byAppliance.airfryer.map(a => a.name).join(", ")}.`);
  }
  if (byAppliance.fuegos.length > 0) {
    phase1Actions.push(`Tener lista la olla/sartén para las elaboraciones en fuegos (${byAppliance.fuegos.map(f => f.name).join(", ")}).`);
  }
  if (phase1Actions.length === 0) {
    phase1Actions.push("Disponer los recipientes herméticos y los ingredientes a preparar sobre la encimera.");
  }

  // Phase 1: Prep & Mise en Place
  phase1.push({
    step: 1,
    timeRange: "0 - 10 min",
    title: "Mise en place y preparativos",
    icon: "fa-solid fa-kitchen-set",
    color: "var(--accent-amber)",
    actions: phase1Actions
  });

  // Phase 2: Simultaneous cooking stations
  const activeStations = [];

  if (byAppliance.horno.length > 0) {
    const ovenText = byAppliance.horno.map(h => `<strong>${h.name}</strong> (${h.totalAmount}${h.unit}): ${h.prepGuideline}`).join(" ");
    activeStations.push({
      appliance: KITCHEN_APPLIANCES.OVEN,
      zone: "Bandejas Horno",
      time: "10 - 55 min (45 min)",
      instruction: ovenText
    });
  }

  if (byAppliance.cecotec.length > 0) {
    const hasGrains = cecotecGrains.length > 0;
    const hasVeggies = cecotecVeggies.length > 0;
    const zoneName = hasGrains && hasVeggies 
      ? "Jarra + Vaporera Doble Nivel" 
      : (hasGrains ? "Jarra Cecotec" : "Vaporera Cecotec");
    const timeEst = hasGrains ? "10 - 32 min (22 min)" : "10 - 28 min (18 min)";

    const cecotecText = byAppliance.cecotec.map(c => `<strong>${c.name}</strong> (${c.totalAmount}${c.unit} en ${c.containerZone}): ${c.prepGuideline}`).join(" ");
    activeStations.push({
      appliance: KITCHEN_APPLIANCES.CECOTEC_STEAMER,
      zone: zoneName,
      time: timeEst,
      instruction: cecotecText
    });
  }

  if (byAppliance.airfryer.length > 0) {
    const airfryerText = byAppliance.airfryer.map(a => `<strong>${a.name}</strong> (${a.totalAmount}${a.unit}): ${a.prepGuideline}`).join(" ");
    activeStations.push({
      appliance: KITCHEN_APPLIANCES.AIRFRYER,
      zone: "Cesta Airfryer",
      time: "20 - 40 min (20 min)",
      instruction: airfryerText
    });
  }

  if (byAppliance.fuegos.length > 0) {
    const fuegosText = byAppliance.fuegos.map(f => `<strong>${f.name}</strong> (${f.totalAmount}${f.unit}): ${f.prepGuideline}`).join(" ");
    activeStations.push({
      appliance: KITCHEN_APPLIANCES.HOBS,
      zone: "Fuegos de Cocina",
      time: "25 - 45 min (20 min)",
      instruction: fuegosText
    });
  }

  phase2.push({
    step: 2,
    timeRange: "10 - 55 min",
    title: "Cocinado en paralelo multi-electrodoméstico",
    icon: "fa-solid fa-bolt",
    color: "var(--accent-cyan)",
    stations: activeStations
  });

  // Phase 3: Separation into tuppers and storage
  const tupperDistributions = [];
  batchCandidates.forEach(cand => {
    cand.usage.forEach(u => {
      tupperDistributions.push({
        ingredient: cand.name,
        amount: `${u.amount}${cand.unit}`,
        day: u.day,
        recipeName: u.recipeName,
        recipeType: u.recipeType
      });
    });
  });

  phase3.push({
    step: 3,
    timeRange: "55 - 75 min",
    title: "Reparto en tuppers herméticos & conservación",
    icon: "fa-solid fa-boxes-packing",
    color: "var(--accent-emerald)",
    instructions: [
      "Dejar templar las elaboraciones 10 minutos antes de tapar herméticamente para evitar condensación de vapor.",
      "Repartir las cantidades exactas en cada tupper según la guía por días.",
      "Nevera (0-4°C): Platos para consumir de Lunes a Miércoles.",
      "Congelador (-18°C) o frío cero: Raciones para Jueves a Domingo para mantener máxima jugosidad y seguridad alimentaria."
    ],
    tuppers: tupperDistributions
  });

  return [phase1[0], phase2[0], phase3[0]];
}

/**
 * Analyzes the active weekly meal plan and consolidates all ingredients across the 7 days.
 * E.g., if Tuesday needs 300g rice and Thursday needs 200g rice -> 500g consolidated batch.
 */
export function analyzeWeeklyPlanForBatchCooking(weekKey) {
  const targetWeekKey = weekKey || appState.activeNutritionWeekKey || getCurrentWeekKey();
  const currentPlan = (appState.weeklyMealPlans && appState.weeklyMealPlans[targetWeekKey])
    ? appState.weeklyMealPlans[targetWeekKey]
    : ((!appState.activeNutritionWeekKey || appState.activeNutritionWeekKey === targetWeekKey) ? (appState.weeklyMealPlan || {}) : {});

  const plannedItems = [];
  const consolidationMap = new Map();

  DAYS_OF_WEEK.forEach(day => {
    const dayMeals = currentPlan[day] || {};
    MEAL_SLOTS.forEach(slot => {
      const recipeId = dayMeals[slot.key];
      if (!recipeId) return;

      const recipe = getRecipeById(recipeId);
      if (!recipe) return;

      const servings = getMealSlotServings(targetWeekKey, day, slot.key);
      const recipeServings = Number(recipe.servings) || 2;
      const factor = servings / recipeServings;

      plannedItems.push({
        day,
        slot: slot.key,
        slotLabel: slot.label,
        recipe,
        servings,
        factor
      });

      // Scan ingredients - strictly filtering for batchable food!
      (recipe.ingredients || []).forEach(ing => {
        const u = (ing.unit || "").toLowerCase();
        const rawAmt = Number(ing.amount) || 0;
        if (rawAmt <= 0) return;

        // Only consolidate ingredients with gram or ml measurements
        if (u !== "g" && u !== "gr" && u !== "gramos" && u !== "ml") return;

        // Skip non-batchable items (e.g. bread, toast, oil, seasoning, coffee, milk, snacks)
        if (!isBatchableIngredient(ing.name)) return;

        const normName = normalizeBatchIngredientName(ing.name);
        const scaledAmt = Math.round(rawAmt * factor);

        if (!consolidationMap.has(normName)) {
          consolidationMap.set(normName, {
            name: normName,
            unit: u === "ml" ? "ml" : "g",
            totalAmount: 0,
            category: getBatchCategory(normName),
            usage: []
          });
        }

        const entry = consolidationMap.get(normName);
        entry.totalAmount += scaledAmt;
        entry.usage.push({
          day,
          slot: slot.key,
          recipeName: recipe.name,
          recipeType: recipe.type || slot.key,
          amount: scaledAmt,
          unit: entry.unit
        });
      });
    });
  });

  // Filter items:
  // Must be used in 2+ meals OR be a bulk meat cut / roast >= 350g
  const batchCandidates = [];
  const singleUseItems = [];

  // Check if any grain/rice is in consolidationMap
  const hasGrainsTotal = Array.from(consolidationMap.values()).some(it => /arroz|quinoa/i.test(it.name));

  for (const item of consolidationMap.values()) {
    const isMultiMeal = item.usage.length >= 2;
    const isLargeBulkCut = item.totalAmount >= 350 && /cabecero|lomo|pollo|asado|ternera/i.test(item.name);

    if (isMultiMeal || isLargeBulkCut) {
      const assigned = assignAppliance(item.name, item.totalAmount, [], hasGrainsTotal);
      batchCandidates.push({
        ...item,
        appliance: assigned.appliance,
        containerZone: assigned.containerZone,
        prepGuideline: assigned.prepText
      });
    } else {
      singleUseItems.push(item);
    }
  }

  // Sort candidates by category and total amount
  batchCandidates.sort((a, b) => b.totalAmount - a.totalAmount);

  // Build the 3-phase kitchen parallel timeline
  const timeline = buildParallelTimeline(batchCandidates);

  return {
    weekKey: targetWeekKey,
    weekLabel: getWeekDisplayLabel(targetWeekKey),
    totalMealsPlanned: plannedItems.length,
    plannedItems,
    batchCandidates,
    singleUseItems,
    timeline,
    hasBatchWork: batchCandidates.length > 0
  };
}

/**
 * Scans catalog and current plan for existing batch bases (e.g. earlier roasts, cooked cuts)
 * so the user can be asked: "¿Quieres también considerar las recetas preparadas en batch anteriormente?"
 */
export function getExistingBatchBases() {
  const allRecipes = getAllRecipes();
  const keywords = ["batch", "asado", "lomo", "mechada", "horno", "aprovechamiento", "base"];

  return allRecipes.filter(r => {
    if (!r) return false;
    const isTagged = Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes("batch") || t.toLowerCase().includes("aprovechamiento"));
    const nameLower = (r.name || "").toLowerCase();
    const hasKey = keywords.some(k => nameLower.includes(k));
    return isTagged || (hasKey && (r.ingredients?.length || 0) > 2);
  });
}
