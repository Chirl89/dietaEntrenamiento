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
  { keys: ["pisto manchego", "pisto", "ratatouille", "escalivada"], name: "Pisto manchego casero", kcal: 78, prot: 1.4, carbs: 7.2, fats: 4.8, defaultUnit: "g", category: INGREDIENT_CATEGORIES.PRODUCE, serving: 250 },
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
    /\b(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos)\b/,
    /\b(?:un|medio|dos|tres)\s*(?:kg|kilo|kilos)\b/,
    /\b(?:como|alrededor de|sobre|unos?)\s*(?:\d+|un|medio)\s*(?:kg|kilo|kilos|g|gr|gramos)\b/,
    /\b(?:entero|entera|pieza entera)\b/,
    /\b(?:batch|batch cooking|aprovechamiento|preparacion base|varias recetas|varios platos)\b/,
    /\b(?:para la semana|para toda la semana|para varios dias|\d+\s*recetas|\d+\s*platos|\d+\s*comidas)\b/
  ];
  return patterns.some(p => p.test(clean));
}

/**
 * Robust NLP entity extractor that strips conversational filler, quantities,
 * batch markers, and techniques to isolate the pure culinary subject.
 * e.g., "Quiero hacer como un kilo de pisto manchego" -> "Pisto manchego"
 *       "Tengo 1.5kg de cabecero de lomo al horno" -> "Cabecero de lomo"
 */
export function extractCleanCulinarySubject(text) {
  if (!text) return "Plato saludable";
  let s = text;

  // 1. Conversational intent / actions
  s = s.replace(/\b(?:quiero\s+hacer|quiero\s+cocinar|quiero\s+preparar|me\s+gustar[ií]a\s+hacer|me\s+gustar[ií]a\s+preparar|me\s+gustar[ií]a\s+cocinar|voy\s+a\s+hacer|voy\s+a\s+preparar|voy\s+a\s+cocinar|hazme\s+una\s+receta\s+de|hazme\s+un\s+plato\s+de|hazme|haz|prepara|preparar|cocinar|hacer|tengo|necesito|quiero|quisiera)\b/gi, '');

  // 2. Quantities, weights & approximate volume
  s = s.replace(/\b(?:como\s+|alrededor\s+de\s+|sobre\s+|cerca\s+de\s+|aproximadamente\s+|unos?\s+)?(?:\d+(?:[.,]\d+)?|un|medio|dos|tres|cuatro|cinco)\s*(?:kilos?|kg|gramos?|g|gr|litros?|l)\s*(?:de)?\b/gi, '');

  // 3. Batch / weekly / goals / meal types
  s = s.replace(/\b(?:para\s+)?(?:toda\s+)?(?:la\s+)?semana\b/gi, '');
  s = s.replace(/\b(?:en\s+)?(?:batch(?:\s+cooking)?|aprovechamiento|cocina\s+de\s+aprovechamiento)\b/gi, '');
  s = s.replace(/\b(?:para\s+comer|para\s+cenar|para\s+desayunar|para\s+merendar)\b/gi, '');
  s = s.replace(/\b(?:receta\s+de|plato\s+de|un\s+plato\s+de|una\s+receta\s+de)\b/gi, '');

  // 4. Cooking techniques
  s = s.replace(/\b(?:al\s+horno|a\s+la\s+plancha|en\s+airfryer|en\s+freidora(?:\s+de\s+aire)?|al\s+vapor|en\s+olla(?:\s+express)?|a\s+fuego\s+lento)\b/gi, '');

  // 5. Clean punctuation and edge connectors
  s = s.replace(/^[,\s.:;¿?¡!]+|[,\s.:;¿?¡!]+$/g, '').trim();
  s = s.replace(/^(?:de|con|del|un|una|el|la|los|las)\s+/i, '').trim();
  s = s.replace(/\s+(?:para|de|con|en)$/i, '').trim();

  if (!s || s.length < 2) return text.trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Detects the culinary category of a batch ingredient/preparation
 * Returns: "veggie_stew" | "legume_stew" | "fish" | "grain_base" | "meat"
 */
export function detectBatchFoodCategory(foodName, description = "") {
  const text = cleanText((foodName || "") + " " + (description || ""));
  if (text.includes("pisto") || text.includes("ratatouille") || text.includes("escalivada") || text.includes("sofrito") || text.includes("crema") || text.includes("verdura") || text.includes("espinaca") || text.includes("champinon") || text.includes("calabacin") || text.includes("berenjena")) {
    return "veggie_stew";
  }
  if (text.includes("lenteja") || text.includes("garbanzo") || text.includes("alubia") || text.includes("judia") || text.includes("fabada") || text.includes("potaje")) {
    return "legume_stew";
  }
  if (text.includes("merluza") || text.includes("salmon") || text.includes("bacalao") || text.includes("lubina") || text.includes("dorada") || text.includes("atun") || text.includes("pescado") || text.includes("sepia") || text.includes("calamar") || text.includes("gamba")) {
    return "fish";
  }
  if (text.includes("arroz") || text.includes("pasta") || text.includes("macarron") || text.includes("espagueti") || text.includes("quinoa")) {
    return "grain_base";
  }
  return "meat";
}

/**
 * Extracts declared total weight in grams from user description for batch cooking.
 * e.g., "1 kg", "alrededor de un kg", "1.2 kg", "medio kilo", "800g", "pieza entera".
 */
export function parseDeclaredBaseWeight(text) {
  if (!text) return 1000;
  const clean = text.toLowerCase();

  if (/\bmedio\s*kilo\b/i.test(clean)) return 500;
  if (/\bun\s*(?:kg|kilo)\b/i.test(clean)) return 1000;
  if (/\bdos\s*(?:kg|kilos)\b/i.test(clean)) return 2000;
  if (/\btres\s*(?:kg|kilos)\b/i.test(clean)) return 3000;

  const kgMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?)\b/i);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return Math.round(val * 1000);
  }

  const gMatch = clean.match(/(\d+)\s*(?:g|gr|gramos?)\b/i);
  if (gMatch) {
    const val = parseInt(gMatch[1], 10);
    if (!isNaN(val) && val >= 150) return val;
  }

  return 1000;
}

/**
 * Identifies the main base ingredient (meat, poultry, fish, etc.) in a recipe.
 */
export function getRecipeBaseIngredient(recipe) {
  if (!recipe || !Array.isArray(recipe.ingredients)) return null;
  const keywords = [
    "lomo", "carne", "pollo", "ternera", "pavo", "cerdo", "pescado", "salmon", "merluza", "asado",
    "tiras", "dados", "desmenuzado", "pisto", "lentejas", "garbanzos", "alubias", "sofrito", "verdura", "crema"
  ];
  
  let candidates = recipe.ingredients.filter(i => {
    const u = (i.unit || "").toLowerCase();
    const n = (i.name || "").toLowerCase();
    const isGram = u === "g" || u === "gr" || u === "gramos";
    if (!isGram) return false;
    return keywords.some(k => n.includes(k)) || i.category === INGREDIENT_CATEGORIES.MEAT || i.category === INGREDIENT_CATEGORIES.PROTEIN;
  });

  if (candidates.length > 0) {
    return candidates.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))[0];
  }

  const gramIngs = recipe.ingredients.filter(i => {
    const u = (i.unit || "").toLowerCase();
    return (u === "g" || u === "gr" || u === "gramos") && (Number(i.amount) || 0) >= 30;
  });

  return gramIngs.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))[0] || null;
}

/**
 * Enforces strict conservation of matter: guarantees that the sum of the base ingredient
 * across all batch cooking recipes equals EXACTLY the initial totalBaseWeight (e.g. 1000g).
 * Recalculates individual dish macros based on the normalized grams.
 */
export function balanceBatchRecipesBaseIngredient(recipes, totalBaseWeight = 1000, defaultServings = 2) {
  if (!Array.isArray(recipes) || recipes.length === 0 || !totalBaseWeight || totalBaseWeight <= 0) {
    return recipes;
  }

  const baseIngs = recipes.map(r => getRecipeBaseIngredient(r));
  const currentTotalGrams = baseIngs.reduce((sum, ing) => sum + (ing ? (Number(ing.amount) || 0) : 0), 0);

  if (currentTotalGrams <= 0) return recipes;

  let assignedGrams = 0;
  const newAmounts = recipes.map((r, i) => {
    const ing = baseIngs[i];
    if (!ing) return 0;
    const proportion = (Number(ing.amount) || 0) / currentTotalGrams;
    let rounded = Math.round((proportion * totalBaseWeight) / 5) * 5;
    if (rounded < 30) rounded = 30;
    assignedGrams += rounded;
    return rounded;
  });

  // Distribute rounding difference to ensure EXACT sum down to the single gram
  let diff = totalBaseWeight - assignedGrams;
  if (diff !== 0) {
    let maxIdx = 0;
    let maxVal = -1;
    newAmounts.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });
    newAmounts[maxIdx] += diff;
  }

  // Apply new amounts and update verified macros
  recipes.forEach((r, i) => {
    const baseIng = baseIngs[i];
    if (baseIng && newAmounts[i] > 0) {
      baseIng.amount = newAmounts[i];
    }

    const rServings = Number(r.servings) || defaultServings || 2;
    const verifiedMacros = calculateMacrosFromIngredients(r.ingredients || []);
    if (verifiedMacros.calories > 0) {
      r.calories = Math.round(verifiedMacros.calories / rServings);
      r.protein = Math.round(verifiedMacros.protein / rServings);
      r.carbs = Math.round(verifiedMacros.carbs / rServings);
      r.fats = Math.round(verifiedMacros.fats / rServings);
    }
  });

  return recipes;
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
  // Instead, parse the actual subject from the user's prompt cleanly!
  const cleanSubject = extractCleanCulinarySubject(description);

  if (detectedIngredients.length === 0) {
    const category = detectBatchFoodCategory(cleanSubject, description);
    const isMeat = category === "meat";
    const isFish = category === "fish";
    const syntheticFood = {
      name: cleanSubject,
      category: (isMeat || isFish) ? INGREDIENT_CATEGORIES.PROTEIN : INGREDIENT_CATEGORIES.PRODUCE,
      serving: (isMeat || isFish) ? 180 : 200,
      defaultUnit: "g",
      keys: [cleanText(cleanSubject)]
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
  const mainIngredientName = detectedIngredients[0]?.matchedFood?.name || cleanSubject;
  const foodCategory = detectBatchFoodCategory(mainIngredientName, description);

  let title = `${mainIngredientName} ${isHorno ? 'al horno' : isPlancha ? 'a la plancha' : isAirfryer ? 'en airfryer' : 'saludable'}`;
  if (foodCategory === "veggie_stew") {
    title = `${mainIngredientName} casero tradicional`;
  } else if (foodCategory === "legume_stew") {
    title = `Guiso de ${mainIngredientName.toLowerCase()} con verduras`;
  }

  // 9. Generate realistic step-by-step preparation instructions
  const steps = [];

  if (foodCategory === "veggie_stew") {
    steps.push(`Lavar y cortar en dados los ingredientes para la base de ${mainIngredientName.toLowerCase()}.`);
    steps.push("Poner a pochar a fuego suave-medio en una cazuela amplia o sartén con el aceite de oliva virgen extra.");
    steps.push("Cocinar durante 20-25 minutos removiendo periódicamente hasta que todo quede tierno y bien confitado.");
    steps.push("Rectificar de sal al gusto y servir caliente como plato principal o guarnición.");
  } else if (foodCategory === "legume_stew") {
    steps.push(`Poner a cocer las ${mainIngredientName.toLowerCase()} con agua o caldo y las verduras en una olla.`);
    steps.push("Cocinar a fuego suave hasta que estén tiernas y el caldo haya trabado.");
    steps.push("Servir caliente en plato hondo con un hilo de AOVE virgen extra.");
  } else if (isHorno) {
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
  else if (isGuiso || foodCategory === "veggie_stew" || foodCategory === "legume_stew") prepTime = 30;
  else if (isAirfryer) prepTime = 18;
  else if (isPlancha) prepTime = 12;
  else if (isEnsalada || type === "snack") prepTime = 8;

  // If batch cooking is requested or detected, dynamically generate recipes derived from the base preparation
  if (isBatch) {
    const batchId = Date.now();
    let requestedCount = 0;
    const countMatch = description.match(/(\d+)\s*(?:recetas?|platos?|comidas?|veces|días?)/i);
    if (countMatch) {
      requestedCount = parseInt(countMatch[1], 10);
    }
    if (!requestedCount || requestedCount <= 0) {
      const weightMatch = description.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?|g|gramos?)/i);
      if (weightMatch) {
        let grams = parseFloat(weightMatch[1].replace(',', '.'));
        if (/kg|kilos?/i.test(weightMatch[0])) grams *= 1000;
        if (grams <= 600) requestedCount = 2;
        else if (grams <= 1100) requestedCount = 3;
        else if (grams <= 1600) requestedCount = 4;
        else requestedCount = 5;
      } else {
        requestedCount = 3;
      }
    }
    requestedCount = Math.min(Math.max(requestedCount, 1), 10);

    let pool = [];
    let basePrep = "";

    if (foodCategory === "veggie_stew") {
      basePrep = `Cocinar la base de ${mainIngredientName.toLowerCase()} en cazuela o sartén amplia con aceite de oliva virgen extra a fuego lento hasta que las hortalizas queden melosas y pochadas. Dejar atemperar y reservar en recipientes herméticos en la nevera para repartir en las comidas de la semana.`;
      pool = [
        {
          name: `${mainIngredientName} tradicional con huevos camperos a la plancha y patatas`,
          type: "comida",
          prepTime: 20,
          calories: 620,
          protein: 28,
          carbs: 58,
          fats: 26,
          tags: ["Batch Cooking", "comida principal", "tradicional"],
          ingredients: [
            { name: mainIngredientName, amount: 240 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Huevos frescos", amount: 2 * safeServings, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
            { name: "Patata fresca", amount: 200 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Aceite de oliva virgen extra", amount: 8 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            `Calentar la porción de ${mainIngredientName.toLowerCase()} reservada en sartén a fuego medio durante 3 minutos.`,
            "Cocinar los huevos a la plancha o escalfados dejando la yema líquida.",
            "Asar las patatas en cubos (o cocinarlas al microondas o airfryer con un hilo de AOVE) y servir junto con el pisto y los huevos recién hechos."
          ]
        },
        {
          name: `Arroz basmati con ${mainIngredientName} y pechuga de pollo a la plancha`,
          type: "comida",
          prepTime: 18,
          calories: 690,
          protein: 46,
          carbs: 72,
          fats: 16,
          tags: ["Batch Cooking", "alta proteina", "comida principal"],
          ingredients: [
            { name: mainIngredientName, amount: 220 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Pechuga de pollo", amount: 160 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
            { name: "Arroz jazmín o basmati cocido", amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Aceite de oliva virgen extra", amount: 8 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Marcar los filetes o dados de pechuga de pollo en sartén caliente con unas gotas de AOVE hasta dorar.",
            `Incorporar la ración de ${mainIngredientName.toLowerCase()} del batch cooking para que tome temperatura y se impregne de los jugos del pollo.`,
            "Servir sobre la base de arroz caliente para una comida deportiva rica en hidratos complejos y proteína magra."
          ]
        },
        {
          name: `Tostas crujientes con ${mainIngredientName} y queso de cabra o feta gratinado`,
          type: "cena",
          prepTime: 12,
          calories: 420,
          protein: 22,
          carbs: 36,
          fats: 18,
          tags: ["Batch Cooking", "cena ligera", "aprovechamiento"],
          ingredients: [
            { name: mainIngredientName, amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Pan de masa madre o integral", amount: 60 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Queso Feta o rulo de cabra", amount: 40 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
            { name: "Orégano o albahaca", amount: 2 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Tostar ligeramente las rebanadas de pan en tostadora o sartén.",
            `Colocar una base generosa de ${mainIngredientName.toLowerCase()} templado sobre cada tosta.`,
            "Desmenuzar el queso por encima y gratinar 2 minutos en airfryer o microondas hasta que funda.",
            "Espolvorear orégano y servir caliente como cena ligera, reconfortante y digestiva."
          ]
        },
        {
          name: `Salteado de garbanzos cocidos con ${mainIngredientName} y huevo poché`,
          type: "cena",
          prepTime: 12,
          calories: 440,
          protein: 24,
          carbs: 45,
          fats: 14,
          tags: ["Batch Cooking", "fibra y proteina", "cena ligera"],
          ingredients: [
            { name: mainIngredientName, amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Garbanzos cocidos", amount: 140 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Huevos frescos", amount: 1 * safeServings, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
            { name: "Pimentón de la Vera dulce", amount: 2 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Enjuagar los garbanzos cocidos y saltearlos en una sartén 2 minutos.",
            `Añadir la porción de ${mainIngredientName.toLowerCase()} reservada y mezclar hasta calentar bien.`,
            "Coronar con un huevo cocido o poché y un toque de pimentón para una cena saciante rica en fibra."
          ]
        },
        {
          name: `Pasta integral con ${mainIngredientName} y atún al natural con orégano`,
          type: "comida",
          prepTime: 15,
          calories: 660,
          protein: 42,
          carbs: 70,
          fats: 15,
          tags: ["Batch Cooking", "comida principal", "energia"],
          ingredients: [
            { name: mainIngredientName, amount: 220 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Pasta integral cocida", amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Atún fresco / al natural", amount: 120 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
            { name: "Aceite de oliva virgen extra", amount: 8 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Cocer la pasta integral hasta que esté al dente.",
            `En la sartén, juntar la ración de ${mainIngredientName.toLowerCase()} con el atún escurrido para templar.`,
            "Mezclar la pasta con la salsa de pisto y servir bien caliente con orégano fresco."
          ]
        }
      ];
    } else if (foodCategory === "legume_stew") {
      basePrep = `Cocinar o hervir las ${mainIngredientName.toLowerCase()} en olla con verduras y hierbas aromáticas. Reservar en recipientes herméticos en la nevera para repartir en las comidas de la semana.`;
      pool = [
        {
          name: `Guiso reconfortante de ${mainIngredientName.toLowerCase()} con patata y sofrito`,
          type: "comida",
          prepTime: 20,
          calories: 650,
          protein: 34,
          carbs: 85,
          fats: 14,
          tags: ["Batch Cooking", "legumbres", "comida principal"],
          ingredients: [
            { name: mainIngredientName, amount: 220 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Patata fresca", amount: 200 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Zanahoria fresca", amount: 80 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Aceite de oliva virgen extra", amount: 8 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            `Calentar la ración de ${mainIngredientName.toLowerCase()} junto con las patatas en cazuela durante 8 minutos.`,
            "Ajustar de especias y servir caliente."
          ]
        },
        {
          name: `Ensalada templada de ${mainIngredientName.toLowerCase()} con atún, huevo y cherry`,
          type: "cena",
          prepTime: 12,
          calories: 430,
          protein: 38,
          carbs: 38,
          fats: 14,
          tags: ["Batch Cooking", "cena ligera", "aprovechamiento"],
          ingredients: [
            { name: mainIngredientName, amount: 160 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Atún fresco / al natural", amount: 100 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
            { name: "Huevos frescos", amount: 1 * safeServings, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
            { name: "Tomates cherry", amount: 80 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Aceite de oliva virgen extra", amount: 6 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            `Templar ligeramente las ${mainIngredientName.toLowerCase()} reservadas en frío.`,
            "Mezclar con los cherry partidos, el huevo duro y el atún.",
            "Aliñar con AOVE, vinagre y una pizca de sal."
          ]
        },
        {
          name: `Salteado de ${mainIngredientName.toLowerCase()} con espinacas baby y ajo doradito`,
          type: "cena",
          prepTime: 12,
          calories: 410,
          protein: 26,
          carbs: 42,
          fats: 12,
          tags: ["Batch Cooking", "cena ligera", "fibra"],
          ingredients: [
            { name: mainIngredientName, amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Espinacas baby o rúcula", amount: 120 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Dientes de ajo", amount: 6 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Aceite de oliva virgen extra", amount: 8 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Dorar los ajos laminados en sartén con AOVE.",
            "Añadir las espinacas hasta que reduzcan de volumen.",
            `Incorporar las ${mainIngredientName.toLowerCase()} y saltear 2 minutos todo junto.`
          ]
        }
      ];
    } else if (foodCategory === "fish") {
      basePrep = `Cocinar los lomos de ${mainIngredientName.toLowerCase()} al horno a 180°C con un hilo de AOVE y limón durante 15 minutos. Desmigar o racionar y reservar en la nevera para la semana.`;
      pool = [
        {
          name: `${mainIngredientName} al horno con patatas panaderas y cebolla pochada`,
          type: "comida",
          prepTime: 30,
          calories: 630,
          protein: 42,
          carbs: 62,
          fats: 18,
          tags: ["Batch Cooking", "pescado", "comida principal"],
          ingredients: [
            { name: `${mainIngredientName} horneado`, amount: 190 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
            { name: "Patata fresca", amount: 240 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Cebolla", amount: 80 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Aceite de oliva virgen extra", amount: 10 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Hornear la base con patatas panaderas y cebolla.",
            "Servir la primera ración recién hecha.",
            "Reservar el resto del pescado en frío para las siguientes comidas."
          ]
        },
        {
          name: `Wok de arroz basmati con ${mainIngredientName.toLowerCase()} desmigado y verduras`,
          type: "comida",
          prepTime: 15,
          calories: 660,
          protein: 40,
          carbs: 70,
          fats: 16,
          tags: ["Batch Cooking", "wok", "comida principal"],
          ingredients: [
            { name: `${mainIngredientName} en tiras`, amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
            { name: "Arroz jazmín o basmati cocido", amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
            { name: "Pimientos variados", amount: 100 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Salsa de soja baja en sal", amount: 10 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Saltear las verduras en juliana 3 minutos con un hilo de aceite.",
            `Añadir el ${mainIngredientName.toLowerCase()} cocinado y el arroz para calentar todo junto.`,
            "Aderezar con salsa de soja y servir."
          ]
        },
        {
          name: `Revuelto suave de ${mainIngredientName.toLowerCase()} con espárragos verdes`,
          type: "cena",
          prepTime: 10,
          calories: 390,
          protein: 36,
          carbs: 8,
          fats: 22,
          tags: ["Batch Cooking", "cena ligera", "bajos carbos"],
          ingredients: [
            { name: `${mainIngredientName} en dados`, amount: 140 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
            { name: "Espárragos verdes", amount: 120 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Huevos frescos", amount: 2 * safeServings, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
            { name: "Aceite de oliva virgen extra", amount: 6 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Saltear los espárragos troceados en sartén con AOVE.",
            `Agregar el ${mainIngredientName.toLowerCase()} para que tome temperatura.`,
            "Verter los huevos batidos y cuajar a fuego suave removiendo suavemente."
          ]
        }
      ];
    } else {
      // MEAT ROAST POOL
      const isSlowOrWine = clean.includes("vino") || clean.includes("mechada") || clean.includes("horas") || clean.includes("deshilach") || clean.includes("lento") || clean.includes("guis");
      basePrep = `Hornear o cocinar la pieza base entera de ${mainIngredientName.toLowerCase()} a 190°C durante 45-55 minutos con aceite, ajo y hierbas aromáticas. Reservar en frío para repartir en las comidas equilibradas de la semana.`;
      pool = [
        {
          name: isSlowOrWine
            ? `${mainIngredientName} asado con patatas panaderas y reducción de vino`
            : `${mainIngredientName} al horno con patatas panaderas`,
          type: "comida",
          prepTime: 45,
          calories: 740,
          protein: 44,
          carbs: 68,
          fats: 24,
          tags: ["Batch Cooking", "al horno", "comida principal"],
          ingredients: [
            { name: `${mainIngredientName} asado`, amount: 200 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
            { name: "Patata fresca", amount: 260 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Aceite de oliva virgen extra", amount: 12 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY },
            { name: "Dientes de ajo y especias", amount: 6 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            `Cocinar la pieza base entera de ${mainIngredientName.toLowerCase()} al horno a 190°C durante 45-55 minutos junto a las patatas y el adobo.`,
            "Separar una ración con su guarnición de patatas para servir recién hecho como comida energética.",
            "Dejar enfriar el resto de la pieza cocinada, envolver y reservar en la nevera para las siguientes comidas y cenas de la semana."
          ]
        },
        {
          name: isSlowOrWine 
            ? `Fajitas calientes de ${mainIngredientName} mechado con pimientos y cebolla pochada`
            : `Fajitas de ${mainIngredientName} salteado con pimientos y cebolla`,
          type: "comida",
          prepTime: 15,
          calories: 680,
          protein: 42,
          carbs: 65,
          fats: 22,
          tags: ["Batch Cooking", "aprovechamiento", "comida principal"],
          ingredients: [
            { name: isSlowOrWine ? `${mainIngredientName} mechado en sus jugos` : `${mainIngredientName} asado en tiras`, amount: 190 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
            { name: "Pimiento rojo y verde", amount: 120 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Cebolla", amount: 70 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Tortillas integrales o de maíz", amount: 3 * safeServings, unit: "ud", category: INGREDIENT_CATEGORIES.PANTRY },
            { name: "Aceite de oliva virgen extra", amount: 10 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            `Separar ${190 * safeServings}g de la carne de ${mainIngredientName.toLowerCase()} reservada en frío.`,
            "En una sartén con aceite de oliva virgen extra, pochar los pimientos y la cebolla hasta que queden tiernos.",
            "Añadir la carne durante 2 minutos para que coja calor y se impregne de los jugos del sofrito.",
            "Calentar las tortillas y rellenar para un almuerzo completo, caliente y saciante."
          ]
        },
        {
          name: isSlowOrWine
            ? `Salteado caliente de ${mainIngredientName} mechado con calabacín, champiñones y reducción de sus jugos`
            : `Ensalada templada de ${mainIngredientName} con brotes y frutos secos`,
          type: "cena",
          prepTime: 12,
          calories: 395,
          protein: 36,
          carbs: 14,
          fats: 20,
          tags: ["Batch Cooking", "cena ligera", "aprovechamiento"],
          ingredients: [
            { name: isSlowOrWine ? `${mainIngredientName} mechado` : `${mainIngredientName} asado en dados`, amount: 140 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
            { name: isSlowOrWine ? "Calabacín en dados" : "Espinacas baby o rúcula", amount: (isSlowOrWine ? 120 : 90) * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: isSlowOrWine ? "Champiñones salteados" : "Tomates cherry", amount: 80 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: isSlowOrWine ? "Reducción de jugo del asado" : "Queso fresco o feta", amount: 25 * safeServings, unit: isSlowOrWine ? "ml" : "g", category: isSlowOrWine ? INGREDIENT_CATEGORIES.PANTRY : INGREDIENT_CATEGORIES.DAIRY },
            { name: isSlowOrWine ? "Ajo laminado" : "Nueces picadas", amount: (isSlowOrWine ? 5 : 15) * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY },
            { name: "Aceite de oliva virgen extra", amount: 8 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: isSlowOrWine ? [
            `Deshilachar la ración de ${mainIngredientName.toLowerCase()} cocinada a fuego lento.`,
            "Saltear el calabacín y champiñones con ajo y AOVE durante 5 minutos a fuego medio.",
            "Incorporar la carne mechada y la reducción de sus jugos durante 2 minutos hasta integrar.",
            "Servir caliente en bol: cena ligera, digestiva y adaptada a la melosidad del asado."
          ] : [
            `Cortar en dados 140g de la pieza de ${mainIngredientName.toLowerCase()} cocinada y templar 1 minuto a fuego suave en la sartén.`,
            "En una ensaladera o bol, colocar la base de espinacas baby y tomates cherry partidos.",
            "Añadir los dados de carne templada, el queso desmenuzado y las nueces picadas.",
            "Aliñar con AOVE, vinagre y sal. Una cena ligera, digestiva y alta en proteínas."
          ]
        },
        {
          name: `Wok de arroz basmati con ${mainIngredientName} y verduras salteadas`,
          type: "comida",
          prepTime: 15,
          calories: 720,
          protein: 43,
          carbs: 75,
          fats: 18,
          tags: ["Batch Cooking", "wok", "comida principal"],
          ingredients: [
            { name: `${mainIngredientName} en tiras`, amount: 190 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
            { name: "Arroz jazmín o basmati cocido", amount: 180 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY },
            { name: "Calabacín y zanahoria en juliana", amount: 100 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Salsa de soja baja en sal", amount: 10 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY },
            { name: "Aceite de oliva o sésamo", amount: 10 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Saltear en sartén amplia o wok las verduras en juliana a fuego vivo 3 minutos con aceite.",
            `Incorporar las tiras de ${mainIngredientName.toLowerCase()} y el arroz cocido para una comida de alto valor energético.`,
            "Aderezar con salsa de soja y remover 2 minutos para integrar todos los sabores."
          ]
        },
        {
          name: `Salteado ligero de ${mainIngredientName} con calabacín, champiñones y cherry`,
          type: "cena",
          prepTime: 12,
          calories: 405,
          protein: 38,
          carbs: 15,
          fats: 19,
          tags: ["Batch Cooking", "cena ligera", "aprovechamiento"],
          ingredients: [
            { name: `${mainIngredientName} en dados`, amount: 140 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.MEAT },
            { name: "Calabacín en dados", amount: 120 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Champiñones laminados", amount: 100 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Tomates cherry", amount: 60 * safeServings, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
            { name: "Aceite de oliva virgen extra", amount: 10 * safeServings, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
          ],
          instructions: [
            "Saltear el calabacín y los champiñones a fuego medio con el aceite durante 5 minutos.",
            `Añadir los dados de ${mainIngredientName.toLowerCase()} cocinada y los cherry para que tomen temperatura.`,
            "Servir caliente: plato rico en fibra y proteína con muy baja carga glucémica para antes de dormir."
          ]
        }
      ];
    }

    const generated = [];
    for (let i = 0; i < requestedCount; i++) {
      const template = pool[i % pool.length];
      generated.push({
        ...template,
        id: `custom_${batchId}_${i + 1}`,
        name: i >= pool.length ? `${template.name} (Variación ${i + 1})` : template.name,
        servings: safeServings
      });
    }

    const totalBaseWeight = parseDeclaredBaseWeight(description);
    const balancedRecipes = balanceBatchRecipesBaseIngredient(generated, totalBaseWeight, safeServings);

    return {
      isBatch: true,
      batchTitle: `Batch Cooking: ${mainIngredientName}`,
      basePrep: basePrep,
      recipes: balancedRecipes,
      totalBaseWeight: totalBaseWeight,
      aiPowered: false
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
    instructions: steps,
    aiPowered: false
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
 * Jerarquía de modelos Gemini configurada según preferencia de usuario:
 * 1. Intermedios: Gemini 3.5 Flash, Gemini 3.6 Flash (buen equilibrio de calidad y cuota)
 * 2. Mejores: Gemini 3.7 Flash, Gemini 3.8 Flash (máximo razonamiento y precisión)
 * 3. Peores / Rescate: Gemini 3.5 Flash Lite, Gemini 3.1 Flash Lite (modelos ligeros con amplio margen: 15 RPM, 500 RPD)
 */
export const PRIORITIZED_GEMINI_MODELS = [
  // 1. Intermedios
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  // 2. Los mejores
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  // 3. Los peores / Respaldo de alta cuota (500 peticiones al día)
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite"
];

/**
 * Google Gemini AI generation (using default shared couple key or custom user key).
 * Falls back transparently to the semantic offline engine if not configured or if offline.
 * Supports both single-dish generation and batch cooking / meal prep division.
 */
export async function generateRecipeWithAi(description, preferredType = "auto", servings = 2, forceBatch = false) {
  const isBatch = Boolean(forceBatch || detectBatchCookingNeed(description));
  const declaredBaseWeight = parseDeclaredBaseWeight(description);
  const apiKey = getGeminiApiKey();
  
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const promptText = isBatch
        ? `Actúa exclusivamente como chef nutricionista deportivo de alta precisión para FitDuo.
El usuario describe una pieza grande, asado o preparación base para BATCH COOKING / COCINA DE APROVECHAMIENTO para la semana: "${description}".
Peso total declarado de la pieza base: ${declaredBaseWeight}g.
Raciones individuales por plato: ${servings}.

REGLA MATEMÁTICA FUNDAMENTAL DE CONSERVACIÓN DE LA MASA:
El usuario dispone exactamente de una pieza de ${declaredBaseWeight}g (ej. 1 kg = 1000g).
La SUMA de los gramos del ingrediente principal o carne base entre TODAS las recetas generadas (para ${servings} comensales en total) DEBE SUMAR EXACTAMENTE ${declaredBaseWeight}g.
Ni un gramo de más ni un gramo de menos.
Por ejemplo, si son 1000g y 3 recetas para 2 personas:
- Comida 1: 380g de carne en total (190g/persona)
- Comida 2: 360g de carne en total (180g/persona)
- Cena 3: 260g de carne en total (130g/persona)
Total suma de la carne: 380 + 360 + 260 = 1000g EXACTOS.

REGLA DE DIVISIÓN Y APROVECHAMIENTO:
En lugar de generar una receta hipercalórica de 2500+ kcal con 1 kg entero de carne, DEBES proponer un plan de aprovechamiento que divida la preparación base en RECETAS DIFERENTES, REALISTAS Y EQUILIBRADAS para la semana.

CANTIDAD DINÁMICA DE RECETAS:
- Si el usuario especifica explícitamente un número de recetas o comidas (ej. "haz 2 recetas", "para 4 días", "haz 1 sola receta", "divídelo en 5 platos", "17 recetas"), GENERA EXACTAMENTE ESA CANTIDAD en el array "recipes".
- Si el usuario NO especifica una cantidad concreta, calcula el número óptimo según la cantidad/peso de la pieza o preparación (ej. para 1 kg de carne suelen ser 2 a 4 recetas según raciones; para 500g suelen ser 2; si solo da para 1, pon 1). El número de recetas en el array "recipes" DEBE SER DINÁMICO según lo que sea necesario.
- NUNCA fuerces a 3 recetas si el usuario pidió otra cantidad o si la cantidad de alimento requiere más o menos platos.

REGLA DE ORO DE PRESUPUESTO CALÓRICO POR MOMENTO DEL DÍA:
En nutrición deportiva de precisión, una comida (almuerzo) requiere muchas más calorías que una cena. El reparto de la preparación base y sus guarniciones DEBE ajustarse fielmente a este presupuesto:
- COMIDAS (Almuerzo): Deben aportar entre 650 y 850 kcal por ración. Son el aporte energético clave del día, con raciones más generosas de la preparación base (~180-220g por ración) e hidratos de carbono complejos (patatas, arroz, pasta integral, legumbres, boniato).
- CENAS: Deben ser considerablemente más LIGERAS y digestivas, entre 380 y 520 kcal por ración. Deben priorizar verduras, ensaladas templadas, cremas o salteados con grasas saludables (AOVE, frutos secos, aguacate) y una porción moderada de la preparación base (~120-150g por ración) para favorecer la digestión y el descanso.
- NUNCA generes desayunos salvo que el usuario lo pida explícitamente.

REGLA DE COHERENCIA CULINARIA SEGÚN EL TIPO DE ALIMENTO:
- Si el alimento es una verdura, guiso vegetal o salsa (ej. PISTO MANCHEGO, ratatouille, sofrito, verduras asadas, crema, salsa boloñesa):
  ¡NUNCA lo trates como una pieza de carne para hornear entera ni propongas "fajitas de pisto asado con cebolla"!
  El pisto o sofrito es una preparación melosa que se cocina en cazuela o sartén con AOVE y sirve de base o acompañamiento estrella para platos reales:
  1. Pisto manchego tradicional con huevos a la plancha / escalfados y patatas asadas.
  2. Arroz integral o basmati con pisto manchego y proteína magra (pollo, atún o ternera).
  3. Tostas crujientes de pan con pisto manchego y queso de cabra o feta gratinado.
  4. Salteado de garbanzos o alubias con pisto manchego y huevo poché.
  5. Pasta integral con salsa de pisto manchego y atún al natural.
- Si es legumbre (lentejas, garbanzos, alubias, fabada): Guisos tradicionales con verduras, ensaladas templadas con atún y huevo duro, salteados con espinacas y ajo.
- Si es pescado (merluza, salmón, bacalao): Lomos horneados con patatas panaderas, wok con arroz y verduras, revueltos o ensaladas templadas.
- Si es carne para asar (lomo, cabecero, pollo entero): Asados con patatas, fajitas, salteados al wok.
- Si es carne mechada, al vino o cocción lenta: Platos calientes/templados melosos (fajitas calientes, pasta con sus jugos, wok). NUNCA ensaladas frías crudas incompatibles.

Cada una de las recetas debe tener:
- Gramajes individuales realistas y coherentes con su momento del día.
- Macros calibrados según sea comida (~650-850 kcal) o cena (~380-520 kcal).
- Ingredientes con cantidades exactas (g, ml, ud) para el total de raciones (${servings} personas).
- 3 a 5 pasos de elaboración claros.

FORMATO ESTRICTO: Responde ÚNICAMENTE con un objeto JSON válido con esta estructura, sin texto previo ni posterior, sin markdown ni explicaciones:
{
  "isBatch": true,
  "batchTitle": "Batch Cooking: [Nombre de la preparación base]",
  "basePrep": "Explicación breve (1-2 frases) de cómo cocinar la pieza base entera inicialmente para luego repartirla.",
  "recipes": [
    {
      "name": "Nombre atractivo comida 1",
      "type": "comida",
      "prepTime": 45,
      "calories": 720,
      "protein": 44,
      "carbs": 65,
      "fats": 22,
      "ingredients": [
        {"name": "Cabecero de lomo asado", "amount": 200, "unit": "g"},
        {"name": "Patata fresca", "amount": 260, "unit": "g"},
        {"name": "Aceite de oliva virgen extra", "amount": 12, "unit": "ml"}
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
1. FIDELIDAD TOTAL AL PLATO: Céntrate exactamente en los ingredientes y el plato pedido. No cambies el plato ni inventes alimentos no solicitados (si piden cabecero de lomo, usa cabecero de lomo o lomo de cerdo; si piden pisto manchego, usa pisto manchego tradicional con verduras y acompañamiento natural como huevos o arroz, jamás carne ni sustitutos no solicitados).
2. CANTIDADES REALISTAS PARA ${servings} PERSONAS: Especifica los gramos (g), mililitros (ml) o unidades (ud) reales en total para cocinar las ${servings} raciones.
3. PASOS CLAROS Y NUMERADOS: Redacta de 3 a 5 pasos secuenciales de cocina sencillos y prácticos.
4. CÁLCULO DE MACROS POR RACIÓN INDIVIDUAL: Proporciona las calorías y macronutrientes (calories, protein, carbs, fats) calculados fielmente POR RACIÓN (para 1 persona, ej. 450-600 kcal y 35-45g P), para que el balance calórico diario personal de Carlos y Andrea sea exacto.
5. FORMATO ESTRICTO: Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura, sin texto previo ni posterior, sin explicaciones ni markdown:
{
  "name": "Nombre descriptivo y atractivo del plato",
  "type": "comida",
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

      const modelsToTry = PRIORITIZED_GEMINI_MODELS;

      let rawJson = null;
      let lastErrorMessage = null;
      for (const modelName of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
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
          } else {
            lastErrorMessage = `HTTP ${response.status}: ${response.statusText}`;
            console.warn(`Model ${modelName} returned error ${response.status}`);
          }
        } catch(eModel) {
          lastErrorMessage = eModel.message || "Timeout de conexión";
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
                instructions: Array.isArray(r.instructions) ? r.instructions : ["Preparar y disfrutar."],
                aiPowered: true
              };
            });

            const balancedRecipes = balanceBatchRecipesBaseIngredient(sanitizedRecipes, declaredBaseWeight, servings);

            return {
              isBatch: true,
              batchTitle: parsed.batchTitle || `Batch Cooking de ${extractCleanCulinarySubject(description)}`,
              basePrep: parsed.basePrep || "Preparación base cocinada con antelación para la semana.",
              recipes: balancedRecipes,
              totalBaseWeight: declaredBaseWeight,
              aiPowered: true
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
              instructions: Array.isArray(parsed.instructions) ? parsed.instructions : ["Preparar y disfrutar."],
              aiPowered: true
            };
          }
        }
      }
    } catch(e) {
      console.warn("Gemini API call failed:", e);
    }
  } else {
    return {
      error: true,
      code: "NO_API_KEY",
      message: "No se ha configurado la clave API de Google Gemini en Ajustes."
    };
  }

  // NO LOCAL ENGINE FALLBACK: As requested by the user, warn explicitly about spikes instead of serving default recipes
  return {
    error: true,
    code: "AI_DEMAND_SPIKE",
    message: "Google Gemini está experimentando picos de demanda o no ha respondido a tiempo. Siguiendo tus preferencias, no se han generado recetas por defecto para garantizar propuestas 100% creadas por IA. Pulsa en Reintentar en unos instantes."
  };
}

/**
 * Regenerates an individual recipe from a Batch Cooking plan using Gemini AI,
 * allowing the user to provide custom suggestions (e.g. ingredients, quantities, style)
 * while ensuring it does not duplicate the other recipes in the batch.
 */
export async function regenerateSingleBatchRecipeWithAi(batchCandidate, indexToReplace, userInstruction = "") {
  if (!batchCandidate || !Array.isArray(batchCandidate.recipes) || !batchCandidate.recipes[indexToReplace]) {
    return null;
  }

  const currentRecipe = batchCandidate.recipes[indexToReplace];
  const otherRecipes = batchCandidate.recipes
    .filter((_, i) => i !== indexToReplace)
    .map(r => `"${r.name}" (${r.type})`);
  const servings = Number(currentRecipe.servings) || 2;
  const batchTitle = batchCandidate.batchTitle || "Preparación base de carne/pescado";
  const basePrep = batchCandidate.basePrep || "Preparación asada o cocinada en gran volumen";

  const apiKey = getGeminiApiKey();

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const promptText = `Actúa exclusivamente como chef nutricionista deportivo de alta precisión para FitDuo.
Estamos gestionando un lote de BATCH COOKING / COCINA DE APROVECHAMIENTO semanal.
Preparación base ya cocinada: "${batchTitle}".
Detalles de la cocción base: "${basePrep}".
Raciones individuales por plato: ${servings}.

En este lote ya se han seleccionado las siguientes recetas para otros días:
${otherRecipes.map(r => `- ${r}`).join("\n")}

La receta que queremos SUSTITUIR es la número ${indexToReplace + 1}: "${currentRecipe.name}" (tipo: ${currentRecipe.type}).
${userInstruction && userInstruction.trim() ? `PETICIÓN Y SUGERENCIAS DEL USUARIO: "${userInstruction.trim()}". (Adapta ingredientes, cantidades de carne y estilo culinario a lo que pide el usuario).` : 'El usuario quiere una ALTERNATIVA NUEVA, CREATIVA Y DIFERENTE que aproveche la preparación base sin repetir las otras recetas.'}

REGLAS ESTRICTAS:
1. APROVECHAMIENTO: La receta DEBE usar la preparación base ya cocinada (ej. carne/pescado asado o cocinado en dados, tiras, desmenuzado o lonchas).
2. NO REPETIR: Debe ser un plato completamente diferente a las otras recetas ya elegidas (${otherRecipes.join(", ")}).
3. FIDELIDAD A LAS SUGERENCIAS: Si el usuario pidió una cantidad concreta (ej. 200g o 250g de carne), o un ingrediente específico (ej. pasta integral, ensalada ligera, arroz, taco), RESPÉTALO FIELMENTE en los ingredientes y cantidades.
4. CANTIDADES REALISTAS PARA ${servings} PERSONAS: Los gramos totales de los ingredientes deben ser para cocinar para ${servings} raciones.
5. PRESUPUESTO CALÓRICO POR MOMENTO DEL DÍA: Si el plato es "comida", debe ser saciante y energético (~650-850 kcal y ~38-45g P) con carbohidratos y guarnición adecuada. Si es "cena", debe ser ligera y digestiva (~380-520 kcal y ~30-40g P) con verduras/ensalada y baja carga glucémica.
6. FORMATO ESTRICTO: Responde ÚNICAMENTE con un JSON válido con la siguiente estructura, sin texto antes ni después, sin markdown:
{
  "name": "Nombre apetitoso y claro de la nueva receta alternativa",
  "type": "${currentRecipe.type || 'comida'}",
  "servings": ${servings},
  "prepTime": 15,
  "calories": 460,
  "protein": 39,
  "carbs": 36,
  "fats": 15,
  "ingredients": [
    {"name": "Nombre ingrediente", "amount": 160, "unit": "g"}
  ],
  "instructions": [
    "Paso 1...",
    "Paso 2...",
    "Paso 3..."
  ]
}`;

      const modelsToTry = PRIORITIZED_GEMINI_MODELS;

      let rawJson = null;
      let lastErrorMessage = null;
      for (const modelName of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.3,
                topP: 0.85,
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
          } else {
            lastErrorMessage = `HTTP ${response.status}`;
          }
        } catch(eModel) {
          lastErrorMessage = eModel.message || "Timeout";
          console.warn(`Alternative attempt with ${modelName} failed:`, eModel);
        }
      }

      if (rawJson) {
        const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed && parsed.name && Array.isArray(parsed.ingredients)) {
          const rServings = Number(parsed.servings) || Number(servings) || 2;
          const verifiedMacros = calculateMacrosFromIngredients(parsed.ingredients);
          const perPersonKcal = verifiedMacros.calories > 0 ? Math.round(verifiedMacros.calories / rServings) : (Number(parsed.calories) || 450);
          const perPersonProt = verifiedMacros.protein > 0 ? Math.round(verifiedMacros.protein / rServings) : (Number(parsed.protein) || 36);
          const perPersonCarbs = verifiedMacros.carbs >= 0 ? Math.round(verifiedMacros.carbs / rServings) : (Number(parsed.carbs) || 30);
          const perPersonFats = verifiedMacros.fats >= 0 ? Math.round(verifiedMacros.fats / rServings) : (Number(parsed.fats) || 14);

          return {
            id: "custom_" + Date.now() + "_" + indexToReplace + "_" + Math.random().toString(36).substr(2, 4),
            name: parsed.name,
            type: parsed.type || currentRecipe.type || "comida",
            servings: rServings,
            prepTime: Number(parsed.prepTime) || 15,
            calories: perPersonKcal,
            protein: perPersonProt,
            carbs: perPersonCarbs,
            fats: perPersonFats,
            tags: ["Batch Cooking", "Gemini Pro AI", "alternativa", "aprovechamiento"],
            ingredients: parsed.ingredients.map(ing => ({
              name: ing.name,
              amount: Number(ing.amount) || 1,
              unit: ing.unit || "g",
              category: INGREDIENT_CATEGORIES.PANTRY
            })),
            instructions: Array.isArray(parsed.instructions) && parsed.instructions.length > 0 
              ? parsed.instructions 
              : ["Saltear o calentar la base ya preparada.", "Mezclar con la guarnición y servir."],
            aiPowered: true
          };
        }
      }
    } catch(e) {
      console.warn("Gemini regenerate alternative failed:", e);
    }
  } else {
    return {
      error: true,
      code: "NO_API_KEY",
      message: "No se ha configurado la clave API de Google Gemini en Ajustes."
    };
  }

  // NO LOCAL ENGINE FALLBACK: Return error object so user is notified and can retry
  return {
    error: true,
    code: "AI_DEMAND_SPIKE",
    message: "Google Gemini está experimentando picos de demanda en este momento. Por favor, pulsa de nuevo en 'Generar Alternativa con IA' en unos instantes."
  };
}

/**
 * Generates an additional recipe for an existing batch cooking plan using Gemini AI,
 * ensuring no repetition with existing recipes and taking user suggestions into account.
 */
export async function addBatchRecipeWithAi(batchCandidate, userInstruction = "") {
  if (!batchCandidate || !Array.isArray(batchCandidate.recipes)) {
    return null;
  }

  const existingRecipes = batchCandidate.recipes.map(r => `"${r.name}" (${r.type})`);
  const servings = Number(batchCandidate.recipes[0]?.servings) || 2;
  const batchTitle = batchCandidate.batchTitle || "Preparación base de batch cooking";
  const basePrep = batchCandidate.basePrep || "Preparación cocinada en gran volumen";

  const apiKey = getGeminiApiKey();

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const promptText = `Actúa exclusivamente como chef nutricionista deportivo de alta precisión para FitDuo.
Estamos gestionando un lote de BATCH COOKING / COCINA DE APROVECHAMIENTO semanal.
Preparación base ya cocinada: "${batchTitle}".
Detalles de la cocción base: "${basePrep}".
Raciones individuales por plato: ${servings}.

En este lote ya se han creado las siguientes recetas:
${existingRecipes.map(r => `- ${r}`).join("\n")}

El usuario quiere AÑADIR UNA NUEVA RECETA COMPLEMENTARIA a este lote que aproveche la misma preparación base.
${userInstruction && userInstruction.trim() ? `PETICIÓN Y SUGERENCIAS DEL USUARIO: "${userInstruction.trim()}". (Adapta ingredientes, ración y tipo de plato a lo que pide el usuario).` : 'El usuario quiere una nueva receta creativa que aproveche la preparación base sin repetir las recetas ya existentes.'}

REGLAS ESTRICTAS:
1. APROVECHAMIENTO: La nueva receta DEBE aprovechar la preparación base (en tiras, dados, lonchas o desmenuzado).
2. NO REPETIR: Debe ser un plato completamente diferente a los ya creados (${existingRecipes.join(", ")}).
3. SI EL USUARIO PIDE UN TIPO DE PLATO O INGREDIENTE (ej. "arroz", "pasta", "cena ligera", "desayuno salado", "fajitas"): CÚMPLELO FIELMENTE. Si no especifica tipo, asigna "comida" o "cena". NUNCA asignes a desayuno salvo que el usuario lo pida explícitamente.
5. PRESUPUESTO CALÓRICO POR MOMENTO DEL DÍA: Si el plato es "comida", debe ser saciante y energético (~650-850 kcal y ~38-45g P) con hidratos de carbono y guarnición abundante. Si es "cena", debe ser ligera y digestiva (~380-520 kcal y ~30-40g P) con verduras/ensalada y baja carga glucémica.
6. FORMATO ESTRICTO: Responde ÚNICAMENTE con un JSON válido con la siguiente estructura, sin texto antes ni después, sin markdown:
{
  "name": "Nombre atractivo y claro de la nueva receta",
  "type": "comida",
  "servings": ${servings},
  "prepTime": 15,
  "calories": 700,
  "protein": 40,
  "carbs": 60,
  "fats": 20,
  "ingredients": [
    {"name": "Nombre ingrediente", "amount": 180, "unit": "g"}
  ],
  "instructions": [
    "Paso 1...",
    "Paso 2...",
    "Paso 3..."
  ]
}`;

      const modelsToTry = PRIORITIZED_GEMINI_MODELS;

      let rawJson = null;
      let lastErrorMessage = null;
      for (const modelName of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.3,
                topP: 0.85,
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
          } else {
            lastErrorMessage = `HTTP ${response.status}`;
          }
        } catch(eModel) {
          lastErrorMessage = eModel.message || "Timeout";
          console.warn(`Add batch recipe attempt with ${modelName} failed:`, eModel);
        }
      }

      if (rawJson) {
        const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed && parsed.name && Array.isArray(parsed.ingredients)) {
          const rServings = Number(parsed.servings) || Number(servings) || 2;
          const verifiedMacros = calculateMacrosFromIngredients(parsed.ingredients);
          const perPersonKcal = verifiedMacros.calories > 0 ? Math.round(verifiedMacros.calories / rServings) : (Number(parsed.calories) || 450);
          const perPersonProt = verifiedMacros.protein > 0 ? Math.round(verifiedMacros.protein / rServings) : (Number(parsed.protein) || 36);
          const perPersonCarbs = verifiedMacros.carbs >= 0 ? Math.round(verifiedMacros.carbs / rServings) : (Number(parsed.carbs) || 30);
          const perPersonFats = verifiedMacros.fats >= 0 ? Math.round(verifiedMacros.fats / rServings) : (Number(parsed.fats) || 14);

          return {
            id: "custom_" + Date.now() + "_extra_" + Math.random().toString(36).substr(2, 4),
            name: parsed.name,
            type: parsed.type || "comida",
            servings: rServings,
            prepTime: Number(parsed.prepTime) || 15,
            calories: perPersonKcal,
            protein: perPersonProt,
            carbs: perPersonCarbs,
            fats: perPersonFats,
            tags: ["Batch Cooking", "Gemini Pro AI", "aprovechamiento"],
            ingredients: parsed.ingredients.map(ing => ({
              name: ing.name,
              amount: Number(ing.amount) || 1,
              unit: ing.unit || "g",
              category: INGREDIENT_CATEGORIES.PANTRY
            })),
            instructions: Array.isArray(parsed.instructions) ? parsed.instructions : ["Preparar y servir."],
            aiPowered: true
          };
        }
      }
    } catch(e) {
      console.warn("Gemini add batch recipe failed:", e);
    }
  } else {
    return {
      error: true,
      code: "NO_API_KEY",
      message: "No se ha configurado la clave API de Google Gemini en Ajustes."
    };
  }

  // NO LOCAL ENGINE FALLBACK: Return error object so user is notified and can retry
  return {
    error: true,
    code: "AI_DEMAND_SPIKE",
    message: "Google Gemini está experimentando picos de demanda en este momento. Por favor, pulsa de nuevo en 'Añadir Otra Receta con IA' en unos instantes."
  };
}
