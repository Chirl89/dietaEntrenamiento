/**
 * FitDuo & Collie Coach - Nutrition Calculator & Culinary Intelligence Engine
 * Provides comprehensive macro calculations, natural language recipe synthesis,
 * and optional Google Gemini AI integration.
 */

import { INGREDIENT_CATEGORIES } from '../data.js';

// NUTRITIONAL DATABASE (Values per 100g unless unit is specified)
export const FOOD_DATABASE = [
  // CEREALES, PASTAS Y TUBÉRCULOS
  { keys: ["pasta integral", "pasta", "macarrones", "macarron", "espaguetis", "espagueti", "fideos", "tagliatelle", "penne"], name: "Pasta", kcal: 350, prot: 12, carbs: 71, fats: 2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 80 },
  { keys: ["arroz integral", "arroz basmati", "arroz", "basmati", "jazmin"], name: "Arroz", kcal: 350, prot: 7.5, carbs: 77, fats: 1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 75 },
  { keys: ["copos de avena", "avena", "porridge"], name: "Copos de avena integrales", kcal: 370, prot: 13.5, carbs: 59, fats: 7, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 50 },
  { keys: ["quinoa"], name: "Quinoa", kcal: 360, prot: 14, carbs: 64, fats: 6, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 65 },
  { keys: ["pan integral", "pan de centeno", "pan", "tostada", "tostadas", "rebanada"], name: "Pan integral", kcal: 255, prot: 9, carbs: 49, fats: 2.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 60 },
  { keys: ["patata asada", "patatas al horno", "patata", "patatas", "papa", "papas"], name: "Patata fresca", kcal: 77, prot: 2, carbs: 17, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 160 },
  { keys: ["boniato asado", "boniato", "batata"], name: "Boniato", kcal: 86, prot: 1.6, carbs: 20, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 160 },
  { keys: ["tortilla de trigo", "fajita", "wrap"], name: "Tortilla integral wrap", isUnit: true, kcal: 125, prot: 3.8, carbs: 21, fats: 2.8, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.GRAINS, serving: 1 },
  { keys: ["tortitas de arroz", "tortitas de maiz"], name: "Tortitas de arroz/maíz", isUnit: true, kcal: 30, prot: 0.7, carbs: 6.5, fats: 0.2, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.GRAINS, serving: 2 },

  // CARNES DE CERDO (Lomo, Cabecero, Solomillo, Costillas, Secreto, Chuletas)
  { keys: ["cabecero de lomo al horno", "cabecero de lomo", "cabecero", "cinta de lomo", "lomo de cerdo al horno", "lomo de cerdo", "lomo"], name: "Cabecero de lomo de cerdo", kcal: 185, prot: 22, carbs: 0, fats: 11, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["solomillo de cerdo", "solomillo cerdo"], name: "Solomillo de cerdo", kcal: 140, prot: 22, carbs: 0, fats: 5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["costillas de cerdo al horno", "costillas de cerdo", "costillas", "costillejas"], name: "Costillas de cerdo", kcal: 260, prot: 18, carbs: 0, fats: 21, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 200 },
  { keys: ["chuletas de cerdo", "chuleta de cerdo", "chuletas", "chuleta"], name: "Chuletas de cerdo", kcal: 210, prot: 20, carbs: 0, fats: 14, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["secreto iberico", "secreto", "pluma iberica", "pluma", "presa iberica", "presa"], name: "Secreto ibérico", kcal: 280, prot: 17, carbs: 0, fats: 24, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },
  { keys: ["magro de cerdo", "carne de cerdo"], name: "Magro de cerdo", kcal: 160, prot: 21, carbs: 0, fats: 8, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["panceta", "bacon", "tocino"], name: "Bacon / Panceta", kcal: 390, prot: 14, carbs: 0.5, fats: 37, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 40 },
  { keys: ["lomo embuchado"], name: "Lomo embuchado", kcal: 200, prot: 38, carbs: 0.5, fats: 5.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 40 },
  { keys: ["jamon iberico", "jamon serrano", "jamon"], name: "Jamón ibérico o serrano", kcal: 240, prot: 31, carbs: 0.5, fats: 13, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 40 },
  { keys: ["jamon cocido", "jamon york", "pavo en lonchas", "pechuga de pavo en lonchas"], name: "Jamón cocido extra / Pavo 90%+", kcal: 95, prot: 19, carbs: 1, fats: 1.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 60 },

  // CARNES DE AVES (Pollo, Pavo)
  { keys: ["pechuga de pollo", "pollo a la plancha", "pollo"], name: "Pechuga de pollo", kcal: 120, prot: 23.5, carbs: 0, fats: 2.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },
  { keys: ["contramuslo de pollo", "contramuslos", "muslos de pollo", "muslo de pollo"], name: "Contramuslos de pollo desgrasados", kcal: 170, prot: 20, carbs: 0, fats: 10, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["alitas de pollo", "alitas"], name: "Alitas de pollo", kcal: 210, prot: 18, carbs: 0, fats: 15, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 200 },
  { keys: ["pechuga de pavo", "solomillo de pavo", "pavo a la plancha", "pavo"], name: "Pechuga de pavo", kcal: 110, prot: 24, carbs: 0, fats: 1.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },

  // CARNES DE VACUNO Y OTRAS (Ternera, Buey, Conejo, Cordero)
  { keys: ["carne picada de ternera", "carne picada", "hamburguesa de ternera", "hamburguesa"], name: "Carne picada de ternera magra", kcal: 145, prot: 21.5, carbs: 0, fats: 6.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 150 },
  { keys: ["entrecot de ternera", "entrecot", "chuleton", "chuleton de ternera", "buey"], name: "Entrecot de ternera", kcal: 210, prot: 23, carbs: 0, fats: 13, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 200 },
  { keys: ["solomillo de ternera", "solomillo ternera"], name: "Solomillo de ternera", kcal: 150, prot: 24, carbs: 0, fats: 6, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["filete de ternera", "filete", "bistec", "escalope", "ternera"], name: "Filete de ternera magra", kcal: 130, prot: 23, carbs: 0, fats: 4, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 170 },
  { keys: ["conejo"], name: "Carne de conejo", kcal: 135, prot: 22, carbs: 0, fats: 5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["cordero", "chuletitas de cordero"], name: "Carne de cordero", kcal: 230, prot: 19, carbs: 0, fats: 17, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },

  // PESCADOS Y MARISCOS
  { keys: ["salmon al horno", "salmon a la plancha", "salmon"], name: "Salmón fresco", kcal: 206, prot: 20, carbs: 0, fats: 13.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },
  { keys: ["merluza", "lomos de merluza"], name: "Merluza", kcal: 82, prot: 17, carbs: 0, fats: 1.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["bacalao", "lomo de bacalao"], name: "Bacalao fresco", kcal: 82, prot: 18, carbs: 0, fats: 0.8, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["lubina al horno", "lubina", "dorada al horno", "dorada"], name: "Lubina o dorada", kcal: 98, prot: 19, carbs: 0, fats: 2.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["atun fresco", "atun a la plancha", "atun al natural", "atun", "bonito"], name: "Atún fresco / al natural", kcal: 110, prot: 24, carbs: 0, fats: 1.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 140 },
  { keys: ["sepia a la plancha", "sepia", "calamar", "calamares", "chipirones", "chipiron", "pota"], name: "Sepia o calamar", kcal: 85, prot: 16, carbs: 1, fats: 1.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 180 },
  { keys: ["pulpo a la gallega", "pulpo"], name: "Pulpo cocido", kcal: 85, prot: 18, carbs: 1, fats: 1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },
  { keys: ["gambas al ajillo", "gambas", "gamba", "langostinos", "langostino"], name: "Langostinos o gambas peladas", kcal: 90, prot: 20, carbs: 0.5, fats: 1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 150 },
  { keys: ["gulas al ajillo", "gulas", "angurinas"], name: "Gulas al ajillo", kcal: 160, prot: 10, carbs: 11, fats: 8.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 120 },
  { keys: ["mejillones", "mejillon", "almejas", "berberechos"], name: "Mejillones o almejas", kcal: 85, prot: 14, carbs: 3.5, fats: 2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 150 },
  { keys: ["trucha"], name: "Trucha fresca", kcal: 140, prot: 20, carbs: 0, fats: 6, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 170 },
  { keys: ["sardinas", "sardina", "boquerones", "boqueron"], name: "Sardinas o boquerones", kcal: 160, prot: 19, carbs: 0, fats: 9, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 150 },
  { keys: ["emperador", "pez espada"], name: "Emperador / Pez espada", kcal: 120, prot: 20, carbs: 0, fats: 4.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 170 },

  // HUEVOS Y LÁCTEOS
  { keys: ["huevos", "huevo"], name: "Huevos frescos", isUnit: true, kcal: 75, prot: 6.8, carbs: 0.5, fats: 5.2, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.DAIRY, serving: 2 },
  { keys: ["claras de huevo", "clara", "claras"], name: "Claras de huevo", kcal: 50, prot: 11, carbs: 0.7, fats: 0.2, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.DAIRY, serving: 120 },
  { keys: ["queso fresco batido", "quark"], name: "Queso fresco batido 0%", kcal: 52, prot: 8.5, carbs: 3.5, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 150 },
  { keys: ["requeson", "cottage"], name: "Requesón bajo en grasa", kcal: 98, prot: 12.5, carbs: 3.5, fats: 3.8, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 80 },
  { keys: ["yogur griego", "griego"], name: "Yogur Griego 0%", kcal: 58, prot: 10, carbs: 3.6, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 160 },
  { keys: ["yogur natural", "yogur"], name: "Yogur natural desnatado", kcal: 45, prot: 4.5, carbs: 5.5, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 125 },
  { keys: ["queso rallado", "parmesano", "grana padano"], name: "Queso rallado", kcal: 380, prot: 33, carbs: 1.5, fats: 28, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 20 },
  { keys: ["mozzarella light", "mozzarella"], name: "Mozzarella light", kcal: 220, prot: 22, carbs: 1.5, fats: 14, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 50 },
  { keys: ["queso feta", "feta"], name: "Queso Feta", kcal: 260, prot: 14, carbs: 4, fats: 21, defaultUnit: "g", category: INGREDIENT_CATEGORIES.DAIRY, serving: 40 },
  { keys: ["leche desnatada", "leche"], name: "Leche desnatada", kcal: 35, prot: 3.4, carbs: 5, fats: 0.2, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.DAIRY, serving: 200 },
  { keys: ["bebida vegetal", "bebida de almendras", "bebida de avena"], name: "Bebida vegetal sin azúcar", kcal: 18, prot: 0.5, carbs: 0.4, fats: 1.3, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.DAIRY, serving: 200 },
  { keys: ["proteina en polvo", "proteina whey", "whey"], name: "Proteína de suero (Whey)", kcal: 385, prot: 80, carbs: 5.5, fats: 4.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PANTRY, serving: 25 },
  { keys: ["tofu firme", "tofu"], name: "Tofu firme", kcal: 120, prot: 13, carbs: 2.5, fats: 7, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PROTEIN, serving: 160 },

  // GRASAS SALUDABLES Y CONDIMENTOS
  { keys: ["aceite de oliva virgen extra", "aceite de oliva", "aove", "aceite"], name: "Aceite de oliva virgen extra", kcal: 884, prot: 0, carbs: 0, fats: 100, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.FATS, serving: 8 },
  { keys: ["aguacate fresco", "aguacate"], name: "Aguacate fresco", kcal: 160, prot: 2, carbs: 8.5, fats: 14.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 60 },
  { keys: ["nueces"], name: "Nueces al natural", kcal: 654, prot: 15, carbs: 14, fats: 65, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 20 },
  { keys: ["almendras"], name: "Almendras al natural", kcal: 579, prot: 21, carbs: 22, fats: 50, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 20 },
  { keys: ["mantequilla de cacahuete", "crema de cacahuete"], name: "Mantequilla de cacahuete 100%", kcal: 588, prot: 25, carbs: 20, fats: 50, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 15 },
  { keys: ["semillas de chia", "semillas de lino", "semillas"], name: "Semillas variadas", kcal: 530, prot: 18, carbs: 30, fats: 38, defaultUnit: "g", category: INGREDIENT_CATEGORIES.FATS, serving: 8 },
  { keys: ["dientes de ajo", "diente de ajo", "ajo", "ajos"], name: "Dientes de ajo", kcal: 140, prot: 6, carbs: 28, fats: 0.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 6 },
  { keys: ["hierbas aromaticas", "romero", "tomillo", "oregano", "perejil", "especias"], name: "Hierbas aromáticas y especias", kcal: 10, prot: 0.3, carbs: 2, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PANTRY, serving: 4 },
  { keys: ["vino blanco para cocinar", "vino blanco", "vino"], name: "Vino blanco para cocinar", kcal: 70, prot: 0.1, carbs: 2.5, fats: 0, defaultUnit: "ml", category: INGREDIENT_CATEGORIES.PANTRY, serving: 40 },

  // LEGUMBRES
  { keys: ["lentejas cocidas", "lentejas"], name: "Lentejas cocidas", kcal: 116, prot: 9, carbs: 20, fats: 0.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 180 },
  { keys: ["garbanzos cocidos", "garbanzos"], name: "Garbanzos cocidos", kcal: 130, prot: 7.5, carbs: 21, fats: 2.4, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 180 },
  { keys: ["alubias cocidas", "alubias", "judias blancas"], name: "Alubias cocidas", kcal: 110, prot: 7.8, carbs: 18, fats: 0.5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.GRAINS, serving: 180 },
  { keys: ["edamame"], name: "Edamame desgranado", kcal: 122, prot: 11, carbs: 9, fats: 5, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 90 },

  // VERDURAS Y HORTALIZAS
  { keys: ["salsa de tomate", "tomate frito", "tomate triturado"], name: "Salsa de tomate / Tomate frito", kcal: 65, prot: 1.5, carbs: 8, fats: 3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 },
  { keys: ["tomates cherry", "tomates", "tomate"], name: "Tomates frescos", kcal: 18, prot: 0.9, carbs: 3.9, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 100 },
  { keys: ["calabacin fresco", "calabacin"], name: "Calabacín fresco", kcal: 17, prot: 1.2, carbs: 3.1, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["pimientos variados", "pimiento rojo", "pimiento verde", "pimientos", "pimiento"], name: "Pimientos variados", kcal: 22, prot: 1, carbs: 4.8, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 90 },
  { keys: ["cebolla picada", "cebolla", "cebollas", "cebolleta"], name: "Cebolla", kcal: 40, prot: 1.1, carbs: 9.3, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 70 },
  { keys: ["champinones", "champinon", "setas", "portobello"], name: "Champiñones o setas", kcal: 22, prot: 3.1, carbs: 3.3, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 100 },
  { keys: ["esparragos verdes", "esparragos trigueros", "esparragos", "trigueros"], name: "Espárragos verdes", kcal: 20, prot: 2.2, carbs: 3.9, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 120 },
  { keys: ["brocoli al vapor", "brocoli"], name: "Brócoli fresco", kcal: 34, prot: 2.8, carbs: 6.6, fats: 0.4, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["espinacas baby", "espinacas", "espinaca", "rucula", "canongos"], name: "Espinacas baby o rúcula", kcal: 23, prot: 2.9, carbs: 3.6, fats: 0.4, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 },
  { keys: ["zanahorias", "zanahoria"], name: "Zanahoria fresca", kcal: 41, prot: 0.9, carbs: 9.6, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 },
  { keys: ["judias verdes", "vainas"], name: "Judías verdes", kcal: 35, prot: 2, carbs: 7, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["berenjena"], name: "Berenjena fresca", kcal: 25, prot: 1, carbs: 6, fats: 0.2, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["calabaza"], name: "Calabaza", kcal: 26, prot: 1, carbs: 6.5, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["coliflor"], name: "Coliflor fresca", kcal: 25, prot: 1.9, carbs: 5, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 150 },
  { keys: ["pepino fresco", "pepino"], name: "Pepino fresco", kcal: 15, prot: 0.7, carbs: 3.6, fats: 0.1, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 100 },

  // FRUTAS
  { keys: ["platano", "banana"], name: "Plátano", isUnit: true, kcal: 89, prot: 1.1, carbs: 23, fats: 0.3, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 1 },
  { keys: ["manzana"], name: "Manzana", isUnit: true, kcal: 78, prot: 0.4, carbs: 21, fats: 0.3, defaultUnit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 1 },
  { keys: ["frutos rojos", "arandanos", "fresas", "frambuesas"], name: "Frutos rojos / Arándanos", kcal: 55, prot: 0.7, carbs: 13, fats: 0.3, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 80 }
];

/**
 * Clean string for normalized comparison
 */
export function cleanText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Finds matching food item in database using exact key matching or substring ranking
 */
export function findFoodMatch(ingredientName) {
  const cleanName = cleanText(ingredientName);
  if (!cleanName) return null;

  // 1. Direct exact or multi-word substring match
  for (const item of FOOD_DATABASE) {
    for (const key of item.keys) {
      const cleanKey = cleanText(key);
      if (cleanName === cleanKey) return item;
    }
  }

  // 2. Contains match with length preference (longer key matches first)
  const candidates = [];
  for (const item of FOOD_DATABASE) {
    for (const key of item.keys) {
      const cleanKey = cleanText(key);
      if (cleanName.includes(cleanKey)) {
        candidates.push({ item, keyLength: cleanKey.length });
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.keyLength - a.keyLength);
    return candidates[0].item;
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
      // Unknown ingredient estimate based on linguistic hints
      const cleanName = cleanText(name);
      const safeAmount = isNaN(amount) ? 100 : amount;
      const safeUnit = unit || "g";

      let kcalPer100 = 120;
      let protPer100 = 12;
      let carbsPer100 = 8;
      let fatsPer100 = 4;

      if (cleanName.includes("carne") || cleanName.includes("lomo") || cleanName.includes("cerdo") || cleanName.includes("ternera") || cleanName.includes("pollo") || cleanName.includes("pavo") || cleanName.includes("pescado") || cleanName.includes("solomillo")) {
        kcalPer100 = 160;
        protPer100 = 22;
        carbsPer100 = 0;
        fatsPer100 = 8;
      } else if (cleanName.includes("pasta") || cleanName.includes("arroz") || cleanName.includes("pan") || cleanName.includes("patata") || cleanName.includes("harina")) {
        kcalPer100 = 260;
        protPer100 = 6;
        carbsPer100 = 55;
        fatsPer100 = 1.5;
      } else if (cleanName.includes("verdura") || cleanName.includes("ensalada") || cleanName.includes("calabac") || cleanName.includes("pimiento") || cleanName.includes("tomate") || cleanName.includes("cebolla")) {
        kcalPer100 = 25;
        protPer100 = 1.5;
        carbsPer100 = 4.5;
        fatsPer100 = 0.2;
      } else if (cleanName.includes("aceite") || cleanName.includes("mantequilla") || cleanName.includes("fruto seco")) {
        kcalPer100 = 750;
        protPer100 = 2;
        carbsPer100 = 5;
        fatsPer100 = 80;
      }

      const mult = safeAmount / 100;
      const kcal = Math.round(kcalPer100 * mult);
      const prot = Math.round(protPer100 * mult * 10) / 10;
      const carbs = Math.round(carbsPer100 * mult * 10) / 10;
      const fats = Math.round(fatsPer100 * mult * 10) / 10;

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
 * Detects if a recipe description refers to large batch cooking, a whole cut (>1kg),
 * or explicit meal prep to divide into multiple recipes across the week.
 */
export function detectBatchCookingNeed(text) {
  if (!text) return false;
  const clean = cleanText(text);
  const patterns = [
    /\b(\d+)\s*(kg|kilo|kilos)\b/,
    /\b(entero|entera|pieza entera)\b/,
    /\b(batch|batch cooking|aprovechamiento|preparacion base|varias recetas|varios platos)\b/,
    /\b(para la semana|para toda la semana|para varios dias|3 recetas|2 recetas|4 recetas)\b/
  ];
  return patterns.some(p => p.test(clean));
}

/**
 * Natural language recipe generator (Semantic Culinary Intelligence Engine).
 * Accurately translates descriptions into exact ingredients, sensible cooking techniques,
 * realistic steps, and precise macronutrients WITHOUT hallucinating unrelated foods.
 */
export function generateRecipeFromDescription(description, preferredType = "auto", servings = 2, forceBatch = false) {
  const clean = cleanText(description);
  if (!clean) return null;

  const isBatch = Boolean(forceBatch || detectBatchCookingNeed(description));
  const safeServings = Number(servings) > 0 ? Number(servings) : 2;

  // 1. Detect meal type
  let type = "comida";
  if (preferredType && preferredType !== "auto") {
    type = preferredType;
  } else if (clean.includes("desayuno") || clean.includes("avena") || clean.includes("porridge") || clean.includes("tostada") || clean.includes("tortita")) {
    type = "desayuno";
  } else if (clean.includes("cena") || clean.includes("ligera") || clean.includes("ensalada") || clean.includes("crema") || clean.includes("pescado") || clean.includes("merluza") || clean.includes("lubina")) {
    type = "cena";
  } else if (clean.includes("snack") || clean.includes("merienda") || clean.includes("batido") || clean.includes("yogur")) {
    type = "snack";
  }

  // 2. Detect cooking technique
  const isHorno = clean.includes("horno") || clean.includes("asado") || clean.includes("asar") || clean.includes("asada") || clean.includes("hornear");
  const isPlancha = clean.includes("plancha") || clean.includes("sarten");
  const isAirfryer = clean.includes("airfryer") || clean.includes("freidora de aire");
  const isGuiso = clean.includes("guiso") || clean.includes("guisad") || clean.includes("estofad") || clean.includes("olla");
  const isVapor = clean.includes("vapor") || clean.includes("hervid") || clean.includes("cocid");
  const isEnsalada = clean.includes("ensalada") || clean.includes("fresca") || clean.includes("aliño");

  // 3. Scan FOOD_DATABASE for any foods explicitly referenced in the user's description
  // Sort FOOD_DATABASE items by key length descending to prioritize specific phrases
  const sortedFoods = [...FOOD_DATABASE].sort((a, b) => {
    const maxA = Math.max(...a.keys.map(k => cleanText(k).length));
    const maxB = Math.max(...b.keys.map(k => cleanText(k).length));
    return maxB - maxA;
  });

  const detectedIngredients = [];
  const matchedFoodNames = new Set();

  for (const food of sortedFoods) {
    for (const key of food.keys) {
      const cleanKey = cleanText(key);
      if (clean.includes(cleanKey)) {
        if (!matchedFoodNames.has(food.name)) {
          matchedFoodNames.add(food.name);
          detectedIngredients.push({
            matchedFood: food,
            amount: food.serving * safeServings,
            unit: food.defaultUnit
          });
        }
        break;
      }
    }
  }

  // 4. If NO ingredient was detected in FOOD_DATABASE, NEVER SUBSTITUTE with random chicken/zucchini!
  // Instead, parse the actual subject from the user's prompt!
  if (detectedIngredients.length === 0) {
    // Strip common filler and technique words to isolate the core food
    let rawSubject = description
      .replace(/al\s+horno/gi, '')
      .replace(/a\s+la\s+plancha/gi, '')
      .replace(/en\s+airfryer/gi, '')
      .replace(/en\s+freidora\s+de\s+aire/gi, '')
      .replace(/receta\s+de/gi, '')
      .replace(/un\s+plato\s+de/gi, '')
      .replace(/para\s+cenar/gi, '')
      .replace(/para\s+comer/gi, '')
      .replace(/para\s+desayunar/gi, '')
      .trim();

    if (!rawSubject || rawSubject.length < 2) rawSubject = description.trim();
    const formattedSubject = rawSubject.charAt(0).toUpperCase() + rawSubject.slice(1);

    const isProbableMeat = clean.includes("lomo") || clean.includes("cerdo") || clean.includes("carne") || clean.includes("ternera") || clean.includes("pollo") || clean.includes("pavo") || clean.includes("pescado") || clean.includes("cordero") || clean.includes("conejo");
    const syntheticFood = {
      name: formattedSubject,
      category: isProbableMeat ? INGREDIENT_CATEGORIES.PROTEIN : INGREDIENT_CATEGORIES.PRODUCE,
      serving: isProbableMeat ? 180 : 150,
      defaultUnit: "g",
      keys: [cleanText(formattedSubject)]
    };

    detectedIngredients.push({
      matchedFood: syntheticFood,
      amount: syntheticFood.serving * safeServings,
      unit: "g"
    });
  }

  // 5. Intelligent accompaniments based on cooking method and prompt details
  const hasAove = detectedIngredients.some(d => d.matchedFood.name.includes("Aceite"));
  const aoveFood = FOOD_DATABASE.find(f => f.name === "Aceite de oliva virgen extra");

  if (isHorno) {
    // Roasting needs a dash of oil, garlic and herbs
    if (!hasAove && aoveFood) {
      detectedIngredients.push({ matchedFood: aoveFood, amount: 10 * safeServings, unit: "ml" });
    }
    const garlicFood = FOOD_DATABASE.find(f => f.name === "Dientes de ajo");
    if (garlicFood && !detectedIngredients.some(d => d.matchedFood.name === garlicFood.name)) {
      detectedIngredients.push({ matchedFood: garlicFood, amount: 6 * safeServings, unit: "g" });
    }
    const herbsFood = FOOD_DATABASE.find(f => f.name === "Hierbas aromáticas y especias");
    if (herbsFood && !detectedIngredients.some(d => d.matchedFood.name === herbsFood.name)) {
      detectedIngredients.push({ matchedFood: herbsFood, amount: 4 * safeServings, unit: "g" });
    }
    // If user mentioned potatoes
    if (clean.includes("patata") || clean.includes("papa")) {
      const potatoFood = FOOD_DATABASE.find(f => f.name === "Patata fresca");
      if (potatoFood && !detectedIngredients.some(d => d.matchedFood.name === potatoFood.name)) {
        detectedIngredients.push({ matchedFood: potatoFood, amount: 160 * safeServings, unit: "g" });
      }
    }
    // If user mentioned onion
    if (clean.includes("cebolla")) {
      const onionFood = FOOD_DATABASE.find(f => f.name === "Cebolla");
      if (onionFood && !detectedIngredients.some(d => d.matchedFood.name === onionFood.name)) {
        detectedIngredients.push({ matchedFood: onionFood, amount: 80 * safeServings, unit: "g" });
      }
    }
  } else if (isPlancha || isAirfryer) {
    if (!hasAove && aoveFood && type !== "snack") {
      detectedIngredients.push({ matchedFood: aoveFood, amount: 6 * safeServings, unit: "ml" });
    }
  } else if (!hasAove && aoveFood && type !== "snack") {
    detectedIngredients.push({ matchedFood: aoveFood, amount: 6 * safeServings, unit: "ml" });
  }

  // 6. Build final ingredient objects
  const ingredients = detectedIngredients.map(d => ({
    name: d.matchedFood.name,
    amount: d.amount,
    unit: d.unit,
    category: d.matchedFood.category || INGREDIENT_CATEGORIES.PANTRY
  }));

  // 7. Calculate macros using the comprehensive database
  const macroCalc = calculateMacrosFromIngredients(ingredients);

  // 8. Generate appropriate Title
  let title = description.trim();
  title = title.charAt(0).toUpperCase() + title.slice(1);
  // Sanitize title length
  if (title.length > 55) {
    const mainItem = detectedIngredients[0]?.matchedFood?.name || "Plato personalizado";
    title = `${mainItem} ${isHorno ? 'al horno' : isPlancha ? 'a la plancha' : isAirfryer ? 'en airfryer' : 'saludable'}`;
  }

  // 9. Generate realistic step-by-step preparation instructions
  const mainIngredientName = detectedIngredients[0]?.matchedFood?.name || "el ingrediente principal";
  const steps = [];

  if (isHorno) {
    steps.push("Precalentar el horno a 190°C con calor arriba y abajo.");
    steps.push(`Limpiar y sazonar ${mainIngredientName.toLowerCase()} con sal, pimienta negra, ajo y las hierbas aromáticas al gusto.`);
    steps.push(`Disponer en una fuente apta para horno y regar con el hilo de aceite de oliva virgen extra${ingredients.some(i => i.name.includes("Patata") || i.name.includes("Cebolla")) ? ' junto con la guarnición' : ''}.`);
    steps.push(`Hornear durante 35-45 minutos a 190°C, regando a mitad de cocción con sus propios jugos para mantener la carne tierna y jugosa.`);
    steps.push("Dejar reposar 3-5 minutos antes de trinchar y servir caliente.");
  } else if (isAirfryer) {
    steps.push("Precalentar la freidora de aire a 180°C durante 3 minutos.");
    steps.push(`Sazonar ${mainIngredientName.toLowerCase()} al gusto y pulverizar ligeramente con el aceite de oliva.`);
    steps.push(`Colocar en la cesta sin amontonar y cocinar a 180°C durante 15-20 minutos, volteando a mitad de cocción.`);
    steps.push("Comprobar el punto de cocción dorado y servir caliente.");
  } else if (isPlancha) {
    steps.push("Poner a calentar una sartén o plancha a fuego medio-alto con unas gotas de aceite de oliva.");
    steps.push(`Salpimentar ${mainIngredientName.toLowerCase()} y marcar a fuego vivo.`);
    steps.push(`Cocinar unos 3-4 minutos por cada lado hasta conseguir un dorado apetecible por fuera manteniendo el interior jugoso.`);
    steps.push("Retirar de la plancha y servir de inmediato recién hecho.");
  } else if (clean.includes("pasta") || clean.includes("arroz") || clean.includes("quinoa")) {
    steps.push("Poner a hervir abundante agua con sal y cocer la base (pasta o arroz) hasta que esté al dente.");
    steps.push(`En una sartén con el aceite de oliva, cocinar los acompañamientos (${ingredients.filter(i => !i.name.includes("Pasta") && !i.name.includes("Arroz") && !i.name.includes("Aceite")).map(i => i.name.toLowerCase()).join(", ")}).`);
    steps.push("Escurrir la base e integrarla en la sartén a fuego suave para ligar los sabores.");
    steps.push("Servir caliente con el toque final de especias o queso si corresponde.");
  } else if (isEnsalada) {
    steps.push("Lavar y secar bien los vegetales y hojas verdes.");
    steps.push(`Cortar ${mainIngredientName.toLowerCase()} y los demás ingredientes en porciones cómodas para un bocado.`);
    steps.push("Disponer en un bol o ensaladera y aliñar con el aceite de oliva virgen extra, sal y vinagre al gusto justo antes de servir.");
  } else {
    steps.push(`Preparar y sazonar ${mainIngredientName.toLowerCase()} al gusto.`);
    steps.push("Cocinar en una sartén con el aceite de oliva a fuego medio hasta que esté en su punto óptimo.");
    steps.push("Servir acompañado de los ingredientes recién preparados.");
  }

  // Estimated preparation time
  let prepTime = 20;
  if (isHorno) prepTime = 40;
  else if (isGuiso) prepTime = 45;
  else if (isAirfryer) prepTime = 18;
  else if (isPlancha) prepTime = 12;
  else if (isEnsalada || type === "snack") prepTime = 8;

  // If batch cooking is requested or detected, generate 3 balanced recipes derived from the base preparation
  if (isBatch) {
    const batchId = Date.now();
    const recipe1 = {
      id: "custom_" + batchId + "_1",
      name: `${mainIngredientName} al horno con patatas panaderas`,
      type: "comida",
      prepTime: 45,
      calories: 485,
      protein: 42,
      carbs: 35,
      fats: 17,
      tags: ["Batch Cooking", "al horno", "aprovechamiento"],
      ingredients: [
        { name: `${mainIngredientName} asado`, amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
        { name: "Patata fresca", amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
        { name: "Aceite de oliva virgen extra", amount: 10 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY },
        { name: "Dientes de ajo y especias", amount: 6 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
      ],
      servings: safeServings,
      instructions: [
        `Cocinar la pieza base entera de ${mainIngredientName.toLowerCase()} (1 kg) al horno a 190°C durante 45 minutos junto a las patatas y el adobo.`,
        "Separar una ración de lomo con su guarnición de patatas para servir recién hecho.",
        "Dejar enfriar el resto de la pieza cocinada, envolver y reservar en la nevera para las siguientes 2 recetas de la semana."
      ]
    };

    const recipe2 = {
      id: "custom_" + batchId + "_2",
      name: `Fajitas de ${mainIngredientName} con pimientos y cebolla`,
      type: "comida",
      servings: safeServings,
      prepTime: 15,
      calories: 495,
      protein: 38,
      carbs: 45,
      fats: 16,
      tags: ["Batch Cooking", "rápido", "aprovechamiento"],
      ingredients: [
        { name: `${mainIngredientName} asado en tiras`, amount: 160 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
        { name: "Pimiento rojo y verde", amount: 120 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
        { name: "Cebolla", amount: 70 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
        { name: "Tortillas integrales o de maíz", amount: 2 * safeServings, unit: "ud", category: INGREDIENT_CATEGORIES.PANTRY },
        { name: "Aceite de oliva virgen extra", amount: 6 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
      ],
      instructions: [
        `Cortar en tiras finas 160g de la pieza de ${mainIngredientName.toLowerCase()} reservada en la nevera.`,
        "En una sartén con unas gotas de aceite de oliva virgen extra, saltear los pimientos y la cebolla hasta que queden tiernos.",
        "Añadir las tiras de carne durante 1-2 minutos para que cojan calor y se impregnen de los jugos.",
        "Calentar brevemente las tortillas y rellenar con el salteado."
      ]
    };

    const recipe3 = {
      id: "custom_" + batchId + "_3",
      name: `Ensalada templada de ${mainIngredientName} con brotes y frutos secos`,
      type: "cena",
      servings: safeServings,
      prepTime: 10,
      calories: 380,
      protein: 36,
      carbs: 12,
      fats: 19,
      tags: ["Batch Cooking", "cena ligera", "aprovechamiento"],
      ingredients: [
        { name: `${mainIngredientName} asado en dados`, amount: 150 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
        { name: "Espinacas baby o rúcula", amount: 80 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
        { name: "Tomates cherry", amount: 80 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
        { name: "Queso fresco o feta", amount: 30 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
        { name: "Nueces", amount: 15 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY },
        { name: "Aceite de oliva virgen extra", amount: 8 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
      ],
      instructions: [
        `Cortar en dados 150g de la pieza de ${mainIngredientName.toLowerCase()} cocinada y saltear 1 minuto a fuego vivo en la sartén para templarla.`,
        "En una ensaladera o bol, colocar la base de espinacas baby y tomates cherry cortados por la mitad.",
        "Añadir los dados templados de carne, el queso desmenuzado y las nueces picadas.",
        "Aliñar con una cucharadita de aceite de oliva virgen extra, vinagre y sal al gusto."
      ]
    };

    return {
      isBatch: true,
      batchTitle: `Batch Cooking: ${mainIngredientName} (${title})`,
      basePrep: `Hornear la pieza base entera a 190°C durante 45 minutos con aceite, ajo y hierbas. Reservar para repartir en 3 comidas equilibradas para la semana.`,
      recipes: [recipe1, recipe2, recipe3]
    };
  }

  return {
    id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    name: title,
    type,
    servings: safeServings,
    prepTime,
    calories: Math.round(macroCalc.calories / safeServings),
    protein: Math.round(macroCalc.protein / safeServings),
    carbs: Math.round(macroCalc.carbs / safeServings),
    fats: Math.round(macroCalc.fats / safeServings),
    tags: ["asistente inteligente", isHorno ? "al horno" : isPlancha ? "a la plancha" : "saludable"],
    ingredients,
    instructions: steps
  };
}

// Base64-encoded default key
const DEFAULT_KEY_B64 = "QVEuQWI4Uk42S2dYemVSamRIWjN5V0JrbjNyR0x0UXBLdjhqNU9FaTh4cnE2SkxkUUFrdWc=";

export function getGeminiApiKey() {
  const custom = localStorage.getItem("FITDUO_GEMINI_API_KEY");
  if (custom && custom.trim().length > 10) return custom.trim();
  try {
    return atob(DEFAULT_KEY_B64);
  } catch(e) {
    return "";
  }
}

/**
 * Google Gemini AI generation (using default shared couple key or custom user key).
 * Falls back transparently to the semantic offline engine if not configured or if offline.
 * Supports both single-dish generation and batch cooking / meal prep division.
 */
export async function generateRecipeWithAi(description, preferredType = "auto", servings = 2, forceBatch = false) {
  const isBatch = Boolean(forceBatch || detectBatchCookingNeed(description));
  const apiKey = getGeminiApiKey();
  
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const promptText = isBatch
        ? `Actúa exclusivamente como chef nutricionista deportivo de alta precisión para FitDuo.
El usuario describe una pieza grande, asado o preparación base para BATCH COOKING / COCINA DE APROVECHAMIENTO para la semana: "${description}".
Raciones individuales por plato: ${servings}.

REGLA FUNDAMENTAL: En lugar de generar una receta hipercalórica de 2500+ kcal con 1 kg entero de carne, DEBES proponer un plan de aprovechamiento que divida la preparación base en exactamente 3 RECETAS DIFERENTES, REALISTAS Y EQUILIBRADAS para la semana.
Ejemplo con cabecero de lomo o carne asada:
1. Comida: Receta tradicional (ej. cabecero de lomo asado al horno con patatas panaderas).
2. Comida: Receta dinámica de aprovechamiento (ej. fajitas / tacos / salteado de cabecero de lomo en tiras con pimientos y cebolla).
3. Cena: Receta ligera de aprovechamiento (ej. ensalada templada de cabecero de lomo en dados con brotes y frutos secos, o salteado con verduras).

Cada una de las 3 recetas debe tener:
- Gramajes individuales realistas (~140g-180g de carne preparada por ración).
- Macros saludables (~350-520 kcal y ~30-45g proteína).
- Ingredientes con cantidades exactas (g, ml, ud).
- 3 a 5 pasos de elaboración claros.

FORMATO ESTRICTO: Responde ÚNICAMENTE con un objeto JSON válido con esta estructura, sin texto previo ni posterior, sin markdown ni explicaciones:
{
  "isBatch": true,
  "batchTitle": "Batch Cooking: [Nombre de la preparación base]",
  "basePrep": "Explicación breve (1-2 frases) de cómo cocinar la pieza base entera (1 kg) inicialmente para luego repartirla.",
  "recipes": [
    {
      "name": "Nombre atractivo receta 1 (Comida)",
      "type": "comida",
      "prepTime": 45,
      "calories": 485,
      "protein": 42,
      "carbs": 35,
      "fats": 17,
      "ingredients": [
        {"name": "Cabecero de lomo asado", "amount": 180, "unit": "g"},
        {"name": "Patata fresca", "amount": 180, "unit": "g"},
        {"name": "Aceite de oliva virgen extra", "amount": 10, "unit": "ml"}
      ],
      "instructions": [
        "Paso 1...",
        "Paso 2..."
      ]
    },
    {
      "name": "Nombre atractivo receta 2 (Comida)",
      "type": "comida",
      "prepTime": 15,
      "calories": 490,
      "protein": 38,
      "carbs": 42,
      "fats": 16,
      "ingredients": [
        {"name": "Cabecero de lomo asado en tiras", "amount": 160, "unit": "g"},
        {"name": "Pimiento rojo y verde", "amount": 120, "unit": "g"},
        {"name": "Cebolla", "amount": 70, "unit": "g"},
        {"name": "Tortillas integrales o de maíz", "amount": 2, "unit": "ud"},
        {"name": "Aceite de oliva virgen extra", "amount": 6, "unit": "ml"}
      ],
      "instructions": [
        "Paso 1...",
        "Paso 2..."
      ]
    },
    {
      "name": "Nombre atractivo receta 3 (Cena)",
      "type": "cena",
      "prepTime": 12,
      "calories": 380,
      "protein": 35,
      "carbs": 14,
      "fats": 19,
      "ingredients": [
        {"name": "Cabecero de lomo asado en dados", "amount": 150, "unit": "g"},
        {"name": "Espinacas baby o rúcula", "amount": 80, "unit": "g"},
        {"name": "Tomates cherry", "amount": 80, "unit": "g"},
        {"name": "Queso fresco o feta", "amount": 30, "unit": "g"},
        {"name": "Nueces", "amount": 15, "unit": "g"},
        {"name": "Aceite de oliva virgen extra", "amount": 8, "unit": "ml"}
      ],
      "instructions": [
        "Paso 1...",
        "Paso 2..."
      ]
    }
  ]
}`
        : `Actúa exclusivamente como chef nutricionista deportivo de precisión para la aplicación FitDuo.
Tu ÚNICA tarea es generar la receta exacta que solicita el usuario: "${description}".
Raciones: ${servings} (por defecto 2 personas). Momento del día sugerido: ${preferredType}.

NORMAS ESTRICTAS DE CUMPLIMIENTO:
1. FIDELIDAD TOTAL AL PLATO: Céntrate exactamente en los ingredientes y el plato pedido. No cambies el plato ni inventes alimentos no solicitados (si piden cabecero de lomo, usa cabecero de lomo o lomo de cerdo, jamás pollo ni sustitutos).
2. CANTIDADES REALISTAS PARA ${servings} PERSONAS: Especifica los gramos (g), mililitros (ml) o unidades (ud) reales en total para cocinar las ${servings} raciones.
3. PASOS CLAROS Y NUMERADOS: Redacta de 3 a 5 pasos secuenciales de cocina sencillos y prácticos.
4. CÁLCULO DE MACROS POR RACIÓN INDIVIDUAL: Proporciona las calorías y macronutrientes (calories, protein, carbs, fats) calculados fielmente POR RACIÓN (para 1 persona, ej. 450-600 kcal y 35-45g P), para que el balance calórico diario personal de Carlos y Andrea sea exacto.
5. FORMATO ESTRICTO: Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin texto previo ni posterior, sin explicaciones ni markdown:
{
  "name": "Nombre descriptivo y atractivo del plato",
  "type": "desayuno" | "comida" | "cena" | "snack",
  "servings": ${servings},
  "prepTime": 35,
  "calories": 480,
  "protein": 42,
  "carbs": 15,
  "fats": 22,
  "ingredients": [
    {"name": "Nombre ingrediente", "amount": 180, "unit": "g"}
  ],
  "instructions": [
    "Paso 1...",
    "Paso 2..."
  ]
}`;

      const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-2.0-flash"
      ];

      let rawJson = null;
      for (const modelName of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                maxOutputTokens: 2048,
                responseMimeType: "application/json"
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              rawJson = text.trim();
              break;
            }
          }
        } catch(eModel) {
          console.warn(`Attempt with ${modelName} failed:`, eModel);
        }
      }

      if (rawJson) {
        const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed) {
          if (parsed.isBatch && Array.isArray(parsed.recipes) && parsed.recipes.length > 0) {
            const sanitizedRecipes = parsed.recipes.map((r, idx) => {
              const rServings = Number(r.servings) || Number(servings) || 2;
              const verifiedMacros = calculateMacrosFromIngredients(r.ingredients || []);
              const perPersonKcal = verifiedMacros.calories > 0 ? Math.round(verifiedMacros.calories / rServings) : (Number(r.calories) || 450);
              const perPersonProt = verifiedMacros.protein > 0 ? Math.round(verifiedMacros.protein / rServings) : (Number(r.protein) || 35);
              const perPersonCarbs = verifiedMacros.carbs >= 0 ? Math.round(verifiedMacros.carbs / rServings) : (Number(r.carbs) || 30);
              const perPersonFats = verifiedMacros.fats >= 0 ? Math.round(verifiedMacros.fats / rServings) : (Number(r.fats) || 12);

              return {
                id: "custom_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substr(2, 4),
                name: r.name || `Receta ${idx + 1}`,
                type: r.type || (idx === parsed.recipes.length - 1 ? "cena" : "comida"),
                servings: rServings,
                prepTime: Number(r.prepTime) || 25,
                calories: perPersonKcal,
                protein: perPersonProt,
                carbs: perPersonCarbs,
                fats: perPersonFats,
                tags: ["Batch Cooking", "Gemini Pro AI", "aprovechamiento"],
                ingredients: (r.ingredients || []).map(ing => ({
                  name: ing.name,
                  amount: Number(ing.amount) || 1,
                  unit: ing.unit || "g",
                  category: INGREDIENT_CATEGORIES.PANTRY
                })),
                instructions: Array.isArray(r.instructions) ? r.instructions : ["Preparar y disfrutar."]
              };
            });

            return {
              isBatch: true,
              batchTitle: parsed.batchTitle || `Batch Cooking de ${description}`,
              basePrep: parsed.basePrep || "Preparación base cocinada con antelación para la semana.",
              recipes: sanitizedRecipes
            };
          }

          if (parsed.name && Array.isArray(parsed.ingredients)) {
            const rServings = Number(parsed.servings) || Number(servings) || 2;
            const verifiedMacros = calculateMacrosFromIngredients(parsed.ingredients);
            const perPersonKcal = verifiedMacros.calories > 0 ? Math.round(verifiedMacros.calories / rServings) : (Number(parsed.calories) || 450);
            const perPersonProt = verifiedMacros.protein > 0 ? Math.round(verifiedMacros.protein / rServings) : (Number(parsed.protein) || 35);
            const perPersonCarbs = verifiedMacros.carbs >= 0 ? Math.round(verifiedMacros.carbs / rServings) : (Number(parsed.carbs) || 30);
            const perPersonFats = verifiedMacros.fats >= 0 ? Math.round(verifiedMacros.fats / rServings) : (Number(parsed.fats) || 12);

            return {
              id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
              name: parsed.name,
              type: parsed.type || (preferredType !== "auto" ? preferredType : "comida"),
              servings: rServings,
              prepTime: Number(parsed.prepTime) || 25,
              calories: perPersonKcal,
              protein: perPersonProt,
              carbs: perPersonCarbs,
              fats: perPersonFats,
              tags: ["Gemini Pro AI", "personalizada"],
              ingredients: parsed.ingredients.map(ing => ({
                name: ing.name,
                amount: Number(ing.amount) || 1,
                unit: ing.unit || "g",
                category: INGREDIENT_CATEGORIES.PANTRY
              })),
              instructions: Array.isArray(parsed.instructions) ? parsed.instructions : ["Preparar y disfrutar."]
            };
          }
        }
      }
    } catch(e) {
      console.warn("Gemini API call failed, falling back to local semantic engine:", e);
    }
  }

  // Fallback to local semantic culinary engine
  return generateRecipeFromDescription(description, preferredType, servings, isBatch);
}
