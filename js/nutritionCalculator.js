/**
 * FitDuo & Collie Coach - Nutrition Calculator & Smart Recipe Synthesizer
 * Provides automatic macro calculations and natural language recipe generation.
 */

import { INGREDIENT_CATEGORIES } from '../data.js';

// NUTRITIONAL DATABASE (Values per 100g unless unit is specified)
export const FOOD_DATABASE = [
  // CEREALES, PASTAS Y TUBÉRCULOS
  { keys: ["pasta", "macarron", "espagueti", "fideos", "tagliatelle", "penne"], name: "Pasta integral", kcal: 350, prot: 12, carbs: 71, fats: 2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 80 },
  { keys: ["arroz", "basmati", "jazmin"], name: "Arroz", kcal: 350, prot: 7.5, carbs: 77, fats: 1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 70 },
  { keys: ["avena", "copos de avena", "porridge"], name: "Copos de avena integrales", kcal: 370, prot: 13.5, carbs: 59, fats: 7, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 50 },
  { keys: ["quinoa"], name: "Quinoa", kcal: 360, prot: 14, carbs: 64, fats: 6, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 65 },
  { keys: ["pan", "tostada", "rebanada", "centeno"], name: "Pan integral", kcal: 255, prot: 9, carbs: 49, fats: 2.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 60 },
  { keys: ["patata", "papa"], name: "Patata fresca", kcal: 77, prot: 2, carbs: 17, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 180 },
  { keys: ["boniato", "batata"], name: "Boniato", kcal: 86, prot: 1.6, carbs: 20, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 160 },
  { keys: ["tortilla de trigo", "fajita", "wrap"], name: "Tortilla integral wrap", isUnit: true, kcal: 125, prot: 3.8, carbs: 21, fats: 2.8, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.GRAINS, serving: 1 },
  { keys: ["tortitas de arroz", "tortitas de maiz"], name: "Tortitas de arroz/maíz", isUnit: true, kcal: 30, prot: 0.7, carbs: 6.5, fats: 0.2, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.GRAINS, serving: 2 },

  // CARNES Y PESCADOS
  { keys: ["pollo", "pechuga de pollo"], name: "Pechuga de pollo", kcal: 120, prot: 23.5, carbs: 0, fats: 2.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },
  { keys: ["pavo", "pechuga de pavo", "solomillo de pavo"], name: "Pechuga de pavo", kcal: 110, prot: 24, carbs: 0, fats: 1.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },
  { keys: ["ternera", "carne picada", "hamburguesa"], name: "Carne picada de ternera magra", kcal: 145, prot: 21.5, carbs: 0, fats: 6.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 150 },
  { keys: ["salmon"], name: "Salmón fresco", kcal: 206, prot: 20, carbs: 0, fats: 13.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 150 },
  { keys: ["merluza"], name: "Merluza", kcal: 82, prot: 17, carbs: 0, fats: 1.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["bacalao"], name: "Bacalao", kcal: 82, prot: 18, carbs: 0, fats: 0.8, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 170 },
  { keys: ["lubina", "dorada"], name: "Lubina o dorada", kcal: 98, prot: 19, carbs: 0, fats: 2.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["atun", "bonito"], name: "Atún al natural", kcal: 105, prot: 24, carbs: 0, fats: 1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 100 },
  { keys: ["gamba", "langostino"], name: "Langostinos o gambas peladas", kcal: 90, prot: 20, carbs: 0.5, fats: 1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 150 },
  { keys: ["jamon", "serrano", "iberico"], name: "Jamón ibérico o serrano", kcal: 240, prot: 31, carbs: 0.5, fats: 13, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 40 },
  { keys: ["lomo embuchado"], name: "Lomo embuchado", kcal: 200, prot: 38, carbs: 0.5, fats: 5.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 40 },
  { keys: ["tofu"], name: "Tofu firme", kcal: 120, prot: 13, carbs: 2.5, fats: 7, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },

  // HUEVOS Y LÁCTEOS
  { keys: ["huevo"], name: "Huevos frescos", isUnit: true, kcal: 75, prot: 6.8, carbs: 0.5, fats: 5.2, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.DAIRY, serving: 2 },
  { keys: ["clara", "claras"], name: "Claras de huevo", kcal: 50, prot: 11, carbs: 0.7, fats: 0.2, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.DAIRY, serving: 120 },
  { keys: ["queso fresco batido", "quark"], name: "Queso fresco batido 0%", kcal: 52, prot: 8.5, carbs: 3.5, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 150 },
  { keys: ["requeson", "cottage"], name: "Requesón bajo en grasa", kcal: 98, prot: 12.5, carbs: 3.5, fats: 3.8, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 80 },
  { keys: ["yogur griego", "griego"], name: "Yogur Griego 0%", kcal: 58, prot: 10, carbs: 3.6, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 160 },
  { keys: ["yogur"], name: "Yogur natural desnatado", kcal: 45, prot: 4.5, carbs: 5.5, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 125 },
  { keys: ["queso rallado", "parmesano", "grana padano"], name: "Queso rallado", kcal: 380, prot: 33, carbs: 1.5, fats: 28, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 20 },
  { keys: ["mozzarella"], name: "Mozzarella light", kcal: 220, prot: 22, carbs: 1.5, fats: 14, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 50 },
  { keys: ["feta"], name: "Queso Feta", kcal: 260, prot: 14, carbs: 4, fats: 21, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 40 },
  { keys: ["leche"], name: "Leche desnatada", kcal: 35, prot: 3.4, carbs: 5, fats: 0.2, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.DAIRY, serving: 200 },
  { keys: ["bebida de almendras", "bebida de avena", "leche vegetal"], name: "Bebida vegetal sin azúcar", kcal: 18, prot: 0.5, carbs: 0.4, fats: 1.3, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.DAIRY, serving: 200 },
  { keys: ["proteina", "whey"], name: "Proteína de suero (Whey)", kcal: 385, prot: 80, carbs: 5.5, fats: 4.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PANTRY, serving: 25 },

  // GRASAS SALUDABLES Y FRUTOS SECOS
  { keys: ["aceite", "aove"], name: "Aceite de oliva virgen extra", kcal: 884, prot: 0, carbs: 0, fats: 100, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.FATS, serving: 8 },
  { keys: ["aguacate"], name: "Aguacate fresco", kcal: 160, prot: 2, carbs: 8.5, fats: 14.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 60 },
  { keys: ["nueces"], name: "Nueces al natural", kcal: 654, prot: 15, carbs: 14, fats: 65, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 20 },
  { keys: ["almendras"], name: "Almendras al natural", kcal: 579, prot: 21, carbs: 22, fats: 50, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 20 },
  { keys: ["mantequilla de cacahuete", "crema de cacahuete"], name: "Mantequilla de cacahuete 100%", kcal: 588, prot: 25, carbs: 20, fats: 50, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 15 },
  { keys: ["semillas", "chia", "lino", "sesamo"], name: "Semillas variadas (chía/lino/sésamo)", kcal: 530, prot: 18, carbs: 30, fats: 38, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 8 },

  // LEGUMBRES
  { keys: ["lentejas"], name: "Lentejas cocidas", kcal: 116, prot: 9, carbs: 20, fats: 0.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 180 },
  { keys: ["garbanzos"], name: "Garbanzos cocidos", kcal: 130, prot: 7.5, carbs: 21, fats: 2.4, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 180 },
  { keys: ["alubias", "judias blancas"], name: "Alubias cocidas", kcal: 110, prot: 7.8, carbs: 18, fats: 0.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 180 },
  { keys: ["edamame"], name: "Edamame desgranado", kcal: 122, prot: 11, carbs: 9, fats: 5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 90 },

  // VERDURAS Y HORTALIZAS
  { keys: ["tomate frito", "salsa de tomate", "tomate triturado"], name: "Salsa de tomate / Tomate frito", kcal: 65, prot: 1.5, carbs: 8, fats: 3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 },
  { keys: ["tomate", "tomates", "cherrys", "cherry"], name: "Tomates frescos", kcal: 18, prot: 0.9, carbs: 3.9, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 100 },
  { keys: ["calabacin"], name: "Calabacín fresco", kcal: 17, prot: 1.2, carbs: 3.1, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["pimiento", "pimientos"], name: "Pimientos variados", kcal: 22, prot: 1, carbs: 4.8, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 90 },
  { keys: ["cebolla"], name: "Cebolla", kcal: 40, prot: 1.1, carbs: 9.3, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 60 },
  { keys: ["champinon", "champinones", "setas", "portobello"], name: "Champiñones o setas", kcal: 22, prot: 3.1, carbs: 3.3, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 100 },
  { keys: ["esparragos", "trigueros"], name: "Espárragos verdes", kcal: 20, prot: 2.2, carbs: 3.9, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 120 },
  { keys: ["brocoli"], name: "Brócoli fresco", kcal: 34, prot: 2.8, carbs: 6.6, fats: 0.4, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["espinacas", "espinaca", "rucula", "canongos"], name: "Espinacas baby o rúcula", kcal: 23, prot: 2.9, carbs: 3.6, fats: 0.4, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 },
  { keys: ["zanahoria"], name: "Zanahoria fresca", kcal: 41, prot: 0.9, carbs: 9.6, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 },
  { keys: ["pepino"], name: "Pepino fresco", kcal: 15, prot: 0.7, carbs: 3.6, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 100 },

  // FRUTAS
  { keys: ["platano", "banana"], name: "Plátano", isUnit: true, kcal: 89, prot: 1.1, carbs: 23, fats: 0.3, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 1 },
  { keys: ["manzana"], name: "Manzana", isUnit: true, kcal: 78, prot: 0.4, carbs: 21, fats: 0.3, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 1 },
  { keys: ["frutos rojos", "arandanos", "fresas", "frambuesas"], name: "Frutos rojos / Arándanos", kcal: 55, prot: 0.7, carbs: 13, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 }
];

/**
 * Clean string for matching
 */
function cleanText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Finds matching food item in database
 */
export function findFoodMatch(ingredientName) {
  const cleanName = cleanText(ingredientName);
  if (!cleanName) return null;

  for (const item of FOOD_DATABASE) {
    for (const key of item.keys) {
      const cleanKey = cleanText(key);
      if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
        return item;
      }
    }
  }
  return null;
}

/**
 * Calculates exact macros from a list of ingredients or raw ingredients text.
 * Each line can be: "Nombre, Cantidad, Unidad" or simply "Nombre"
 */
export function calculateMacrosFromIngredients(rawInput) {
  let lines = [];
  if (Array.isArray(rawInput)) {
    lines = rawInput.map(item => {
      if (typeof item === 'string') return item;
      return `${item.name || ''}, ${item.amount || 1}, ${item.unit || 'g'}`;
    });
  } else if (typeof rawInput === 'string') {
    lines = rawInput.split("\n").filter(l => l.trim());
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  const breakdown = [];

  lines.forEach(line => {
    const parts = line.split(",").map(p => p.trim());
    const name = parts[0] || "";
    let amount = parseFloat(parts[1]);
    let unit = (parts[2] || "").toLowerCase();

    if (!name) return;

    const matchedFood = findFoodMatch(name);

    if (matchedFood) {
      if (isNaN(amount) || amount <= 0) {
        amount = matchedFood.serving || 100;
        unit = matchedFood.defaultUnit || "g";
      }

      let multiplier = 0;
      if (matchedFood.isUnit) {
        multiplier = (unit === "ud" || unit === "unidad" || unit === "unidades") ? amount : (amount / 60);
      } else {
        multiplier = (amount / 100);
      }

      const kcal = Math.round(matchedFood.kcal * multiplier);
      const prot = Math.round((matchedFood.prot * multiplier) * 10) / 10;
      const carbs = Math.round((matchedFood.carbs * multiplier) * 10) / 10;
      const fats = Math.round((matchedFood.fats * multiplier) * 10) / 10;

      totalCalories += kcal;
      totalProtein += prot;
      totalCarbs += carbs;
      totalFats += fats;

      breakdown.push({
        name,
        amount,
        unit: unit || matchedFood.defaultUnit,
        calories: kcal,
        protein: prot,
        carbs,
        fats,
        matched: matchedFood.name
      });
    } else {
      // Unknown ingredient default estimate (e.g. 50g -> ~50 kcal, 2g prot, 5g carbs, 1g fat)
      const safeAmount = isNaN(amount) ? 50 : amount;
      const safeUnit = unit || "g";
      const kcal = Math.round(safeAmount * 0.8);
      const prot = Math.round(safeAmount * 0.04);
      const carbs = Math.round(safeAmount * 0.08);
      const fats = Math.round(safeAmount * 0.02);

      totalCalories += kcal;
      totalProtein += prot;
      totalCarbs += carbs;
      totalFats += fats;

      breakdown.push({
        name,
        amount: safeAmount,
        unit: safeUnit,
        calories: kcal,
        protein: prot,
        carbs,
        fats,
        matched: null
      });
    }
  });

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fats: Math.round(totalFats),
    breakdown
  };
}

/**
 * Natural language recipe generator (Smart Assistant mode).
 * Analyzes description, extracts key components, calculates realistic quantities and exact macros.
 */
export function generateRecipeFromDescription(description, preferredType = "auto", servings = 1) {
  const clean = cleanText(description);
  if (!clean) return null;

  // 1. Detect meal type
  let type = "comida";
  if (preferredType && preferredType !== "auto") {
    type = preferredType;
  } else if (clean.includes("desayuno") || clean.includes("avena") || clean.includes("porridge") || clean.includes("tostada") || clean.includes("tortita")) {
    type = "desayuno";
  } else if (clean.includes("cena") || clean.includes("ligera") || clean.includes("salteado de verdura") || clean.includes("crema") || clean.includes("pescado")) {
    type = "cena";
  } else if (clean.includes("snack") || clean.includes("merienda") || clean.includes("batido") || clean.includes("yogur")) {
    type = "snack";
  }

  // 2. Identify ingredients mentioned
  const detectedIngredients = [];
  FOOD_DATABASE.forEach(food => {
    for (const key of food.keys) {
      const cleanKey = cleanText(key);
      if (clean.includes(cleanKey)) {
        if (!detectedIngredients.some(d => d.matchedFood.name === food.name)) {
          detectedIngredients.push({
            matchedFood: food,
            amount: food.serving * servings,
            unit: food.defaultUnit
          });
        }
        break;
      }
    }
  });

  // If no ingredients detected, fallback to common balanced ingredients based on keywords
  if (detectedIngredients.length === 0) {
    if (clean.includes("pasta")) {
      detectedIngredients.push(
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Pasta integral"), amount: 85 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Carne picada de ternera magra"), amount: 150 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Salsa de tomate / Tomate frito"), amount: 80 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Aceite de oliva virgen extra"), amount: 5 * servings, unit: "ml" }
      );
    } else if (clean.includes("arroz")) {
      detectedIngredients.push(
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Arroz"), amount: 75 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Pechuga de pollo"), amount: 160 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Pimientos variados"), amount: 80 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Aceite de oliva virgen extra"), amount: 6 * servings, unit: "ml" }
      );
    } else {
      detectedIngredients.push(
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Pechuga de pollo"), amount: 160 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Calabacín fresco"), amount: 120 * servings, unit: "g" },
        { matchedFood: FOOD_DATABASE.find(f => f.name === "Aceite de oliva virgen extra"), amount: 8 * servings, unit: "ml" }
      );
    }
  }

  // Ensure an oil/fat element is present if none was detected
  const hasFat = detectedIngredients.some(d => d.matchedFood.category === INGREDIENT_CATEGORIES.FATS);
  if (!hasFat && type !== "snack") {
    const aove = FOOD_DATABASE.find(f => f.name === "Aceite de oliva virgen extra");
    if (aove) {
      detectedIngredients.push({ matchedFood: aove, amount: 6 * servings, unit: "ml" });
    }
  }

  // Build ingredient objects
  const ingredients = detectedIngredients.map(d => ({
    name: d.matchedFood.name,
    amount: d.amount,
    unit: d.unit,
    category: d.matchedFood.category
  }));

  // Calculate macros
  const macroCalc = calculateMacrosFromIngredients(ingredients);

  // Derive title
  const primaryProtein = detectedIngredients.find(d => d.matchedFood.category === INGREDIENT_CATEGORIES.PROTEIN || d.matchedFood.category === INGREDIENT_CATEGORIES.DAIRY);
  const primaryCarb = detectedIngredients.find(d => d.matchedFood.category === INGREDIENT_CATEGORIES.GRAINS || d.matchedFood.category === INGREDIENT_CATEGORIES.PRODUCE);

  let title = description.charAt(0).toUpperCase() + description.slice(1);
  if (title.length > 55) {
    if (primaryCarb && primaryProtein) {
      title = `${primaryCarb.matchedFood.name} con ${primaryProtein.matchedFood.name}`;
    } else if (primaryProtein) {
      title = `${primaryProtein.matchedFood.name} salteado con vegetales`;
    }
  }

  // Generate realistic steps
  const steps = [];
  if (detectedIngredients.some(d => d.matchedFood.keys.includes("pasta") || d.matchedFood.keys.includes("arroz") || d.matchedFood.keys.includes("quinoa"))) {
    steps.push("Cocer la base (pasta o arroz) en agua hirviendo con sal según las instrucciones hasta que esté al dente.");
  }
  if (primaryProtein) {
    steps.push(`Dorar ${primaryProtein.matchedFood.name.toLowerCase()} en una sartén con el aceite de oliva a fuego medio-alto salpimentando al gusto.`);
  }
  const veg = detectedIngredients.filter(d => d.matchedFood.category === INGREDIENT_CATEGORIES.PRODUCE && !d.matchedFood.keys.includes("patata") && !d.matchedFood.keys.includes("boniato"));
  if (veg.length > 0) {
    steps.push(`Añadir los vegetales (${veg.map(v => v.matchedFood.name.toLowerCase()).join(", ")}) y saltear durante 5-6 minutos para que queden tiernos.`);
  }
  steps.push("Integrar todos los ingredientes en la sartén para ligar los sabores y servir recién preparado.");

  return {
    id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    name: title,
    type,
    prepTime: type === "snack" ? 5 : type === "desayuno" ? 10 : 20,
    calories: macroCalc.calories,
    protein: macroCalc.protein,
    carbs: macroCalc.carbs,
    fats: macroCalc.fats,
    tags: ["asistente IA", "equilibrado"],
    ingredients,
    instructions: steps
  };
}
