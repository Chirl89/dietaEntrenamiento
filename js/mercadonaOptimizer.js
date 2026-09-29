/**
 * FitDuo - Mercadona Shopping Optimizer & Smart Pantry Engine
 * Consolidates interchangeable ingredients (e.g. Arroz Bomba + Arroz Basmati -> uses the one with highest quantity),
 * provides exact Mercadona / Hacendado product matching, pack size recommendations,
 * and direct search links to tienda.mercadona.es.
 */

import { getGeminiApiKey, PRIORITIZED_GEMINI_MODELS, GEMINI_REQUEST_TIMEOUT_MS } from './nutritionCalculator.js';

// Interchangeable staple food families for pantry consolidation
export const INTERCHANGEABLE_FAMILIES = [
  {
    family: "arroz",
    label: "Arroz",
    detector: /\b(arroz|basmati|bomba|redondo|jazm[ií]n|vaporizado|integral|largo)\b/i,
    extractVariant: (name) => {
      const n = name.toLowerCase();
      if (/basmati/i.test(n)) return "Arroz basmati";
      if (/bomba/i.test(n)) return "Arroz bomba";
      if (/jazm[ií]n/i.test(n)) return "Arroz jazmín";
      if (/integral/i.test(n)) return "Arroz integral";
      if (/vaporizado/i.test(n)) return "Arroz vaporizado";
      return "Arroz redondo";
    },
    mercadonaMatch: (variant) => {
      const v = variant.toLowerCase();
      if (v.includes("basmati")) return { name: "Arroz basmati Hacendado", pack: "Paquete 1 kg", query: "arroz basmati hacendado" };
      if (v.includes("bomba")) return { name: "Arroz bomba Hacendado", pack: "Paquete 1 kg", query: "arroz bomba hacendado" };
      if (v.includes("jazmin")) return { name: "Arroz jazmín Hacendado", pack: "Paquete 1 kg", query: "arroz jazmin hacendado" };
      if (v.includes("integral")) return { name: "Arroz integral Hacendado", pack: "Paquete 1 kg", query: "arroz integral hacendado" };
      return { name: "Arroz redondo Hacendado", pack: "Paquete 1 kg", query: "arroz redondo hacendado" };
    }
  },
  {
    family: "pasta",
    label: "Pasta",
    detector: /\b(pasta|macarr[oó]n|espagueti|plumas|penne|tallarines|espirales|lazos)\b/i,
    extractVariant: (name) => {
      const n = name.toLowerCase();
      const isIntegral = /integral/i.test(n);
      if (/espagueti|tallar/i.test(n)) return isIntegral ? "Espaguetis integrales" : "Espaguetis";
      if (/pluma|penne/i.test(n)) return isIntegral ? "Plumas integrales" : "Plumas";
      if (/espiral/i.test(n)) return isIntegral ? "Espirales integrales" : "Espirales";
      return isIntegral ? "Macarrones integrales" : "Macarrones";
    },
    mercadonaMatch: (variant) => {
      const v = variant.toLowerCase();
      const isIntegral = v.includes("integral");
      if (v.includes("espagueti")) return { name: isIntegral ? "Espaguetis integrales Hacendado" : "Espaguetis Hacendado", pack: "Paquete 500g", query: "espaguetis hacendado" };
      return { name: isIntegral ? "Macarrones integrales Hacendado" : "Macarrones Hacendado", pack: "Paquete 500g", query: "macarrones hacendado" };
    }
  },
  {
    family: "cebolla",
    label: "Cebolla",
    detector: /\b(cebolla|cebolletas?|morada|dulce)\b/i,
    extractVariant: (name) => {
      const n = name.toLowerCase();
      if (/morada/i.test(n)) return "Cebolla morada";
      if (/dulce/i.test(n)) return "Cebolla dulce";
      return "Cebolla blanca";
    },
    mercadonaMatch: () => ({ name: "Malla de cebollas 1 kg o 2 kg", pack: "Malla 1 kg", query: "cebollas malla" })
  },
  {
    family: "pimiento",
    label: "Pimientos",
    detector: /\b(pimiento|pimientos|rojo|verde|tricolor)\b/i,
    extractVariant: (name) => {
      const n = name.toLowerCase();
      if (/rojo/i.test(n)) return "Pimiento rojo";
      if (/verde/i.test(n)) return "Pimiento verde";
      return "Pimientos variados";
    },
    mercadonaMatch: () => ({ name: "Pimientos tricolor o pimiento rojo pieza", pack: "Bandeja 3 uds o al peso", query: "pimientos tricolor" })
  },
  {
    family: "patata",
    label: "Patatas",
    detector: /\b(patatas?|papas?)\b/i,
    extractVariant: () => "Patatas frescas",
    mercadonaMatch: () => ({ name: "Malla de patatas lavado 3 kg Hacendado", pack: "Malla 3 kg", query: "patatas lavado hacendado" })
  },
  {
    family: "lomo",
    label: "Lomo de cerdo",
    detector: /\b(cabecero|lomo)\b/i,
    extractVariant: (name) => (/cabecero/i.test(name) ? "Cabecero de lomo" : "Lomo de cerdo"),
    mercadonaMatch: (v) => ({
      name: v.includes("cabecero") ? "Cabecero de lomo de cerdo corte fresco" : "Lomo de cerdo corte fresco",
      pack: "Bandeja corte grueso / pieza ~800g - 1 kg",
      query: "cabecero lomo cerdo"
    })
  },
  {
    family: "pollo",
    label: "Pechuga de pollo",
    detector: /\b(pechuga|pollo)\b/i,
    extractVariant: () => "Pechuga de pollo",
    mercadonaMatch: () => ({ name: "Filetes de pechuga de pollo corte fino", pack: "Bandeja 500g o 900g familiar", query: "pechuga pollo filetes" })
  },
  {
    family: "huevos",
    label: "Huevos",
    detector: /\b(huevos?)\b/i,
    extractVariant: () => "Huevos camperos",
    mercadonaMatch: () => ({ name: "Huevos camperos L Hacendado", pack: "Docena (12 uds)", query: "huevos camperos l" })
  },
  {
    family: "aceite",
    label: "Aceite de oliva",
    detector: /\b(aceite|aove|oliva)\b/i,
    extractVariant: () => "Aceite de oliva virgen extra",
    mercadonaMatch: () => ({ name: "Aceite de oliva virgen extra Hacendado", pack: "Botella 1 litro", query: "aceite oliva virgen extra hacendado" })
  },
  {
    family: "aguacate",
    label: "Aguacates",
    detector: /\baguacate/i,
    extractVariant: () => "Aguacates frescos",
    mercadonaMatch: () => ({ name: "Aguacate listo para comer Hacendado", pack: "Malla 500g o 2 piezas al peso", query: "aguacate listo para comer" })
  },
  {
    family: "salmon",
    label: "Salmón",
    detector: /\bsalm[oó]n\b/i,
    extractVariant: (n) => (/ahumado|marinado/i.test(n) ? "Salmón ahumado / marinado" : "Lomos de salmón fresco"),
    mercadonaMatch: (v) => ({
      name: v.includes("ahumado") ? "Salmón ahumado Hacendado" : "Lomos de salmón fresco sin espinas",
      pack: v.includes("ahumado") ? "Sobre 100g" : "Bandeja 2 lomos ~300g",
      query: v.includes("ahumado") ? "salmon ahumado hacendado" : "salmon fresco lomos"
    })
  },
  {
    family: "atun",
    label: "Atún",
    detector: /\bat[uú]n\b/i,
    extractVariant: () => "Atún claro al natural",
    mercadonaMatch: () => ({ name: "Atún claro al natural Hacendado", pack: "Pack 6 latas", query: "atun claro natural hacendado" })
  },
  {
    family: "nueces",
    label: "Nueces",
    detector: /\bnueces?\b/i,
    extractVariant: () => "Nueces peladas",
    mercadonaMatch: () => ({ name: "Nueces peladas naturales Hacendado", pack: "Bolsa 200g", query: "nueces peladas naturales hacendado" })
  },
  {
    family: "tomate_cherry",
    label: "Tomates cherry",
    detector: /\b(cherry|cherrys)\b/i,
    extractVariant: () => "Tomates cherry",
    mercadonaMatch: () => ({ name: "Tomate cherry en rama / tarrina", pack: "Tarrina 500g", query: "tomate cherry" })
  },
  {
    family: "yogur_griego",
    label: "Yogur griego",
    detector: /\byogur.*griego\b/i,
    extractVariant: () => "Yogur griego natural 0%",
    mercadonaMatch: () => ({ name: "Yogur griego natural 0% materia grasa Hacendado", pack: "Pack 6 uds o tarrina 1 kg", query: "yogur griego natural 0" })
  },
  {
    family: "yogur_bebible",
    label: "Yogur bebible proteico",
    detector: /\b(bebible|\+prote[ií]nas.*bebible|bebida l[aá]ctea)\b/i,
    extractVariant: () => "Bebida láctea +Proteínas",
    mercadonaMatch: () => ({ name: "Bebida láctea +Proteínas Hacendado (fresa o plátano)", pack: "Botella 280ml", query: "bebida lactea proteinas" })
  },
  {
    family: "gnocchi",
    label: "Gnocchis",
    detector: /\b(gnocchi|ñoqui)\b/i,
    extractVariant: () => "Gnocchis de patata frescos",
    mercadonaMatch: () => ({ name: "Gnocchis de patata frescos Hacendado", pack: "Paquete 500g", query: "gnocchis patata frescos" })
  },
  {
    family: "kebab",
    label: "Pollo Kebab",
    detector: /\bkebab\b/i,
    extractVariant: () => "Carne de pollo asada Kebab",
    mercadonaMatch: () => ({ name: "Carne de pollo asada estilo Kebab Hacendado", pack: "Bandeja 350g", query: "pollo kebab hacendado" })
  },
  {
    family: "champinon",
    label: "Champiñones y Setas",
    detector: /\b(champi[ñn][oó]n|setas?|boletus|portobello)\b/i,
    extractVariant: (n) => (/setas?|boletus|portobello/i.test(n) ? "Variado de setas y portobello" : "Champiñones frescos laminados"),
    mercadonaMatch: (v) => ({
      name: v.includes("setas") ? "Surtido de setas frescas o Portobello Hacendado" : "Champiñones laminados limpios Hacendado",
      pack: "Bandeja 300g o 400g",
      query: v.includes("setas") ? "setas frescas bandeja" : "champinon laminado bandeja"
    })
  },
  {
    family: "leche",
    label: "Leche",
    detector: /\bleche\b/i,
    extractVariant: (n) => (/\+prote/i.test(n) ? "Leche desnatada +Proteínas" : "Leche semidesnatada"),
    mercadonaMatch: (v) => ({
      name: v.includes("+Proteínas") ? "Bebida láctea desnatada +Proteínas Hacendado" : "Leche semidesnatada Hacendado",
      pack: "Brik 1L (pack 6)",
      query: v.includes("+Proteínas") ? "leche proteinas hacendado" : "leche semidesnatada hacendado"
    })
  },
  {
    family: "cafe",
    label: "Café",
    detector: /\bcaf[eé]\b/i,
    extractVariant: () => "Café molido natural",
    mercadonaMatch: () => ({
      name: "Café molido tueste natural Hacendado / Cápsulas",
      pack: "Paquete 250g o caja cápsulas",
      query: "cafe molido natural hacendado"
    })
  },
  {
    family: "pan",
    label: "Pan integral / Centeno",
    detector: /\b(pan\s+de\s+centeno|pan\s+integral|pan\s+de\s+molde|pan\s+de\s+masa\s+madre)\b/i,
    extractVariant: () => "Pan integral de masa madre o centeno",
    mercadonaMatch: () => ({
      name: "Pan de molde 100% integral o hogaza masa madre corte",
      pack: "Paquete / Hogaza",
      query: "pan integral hacendado"
    })
  }
];

/**
 * Cleanly normalizes ingredient names so identical supermarket items with
 * preparation or cutting descriptors (e.g. "Aguacate maduro", "Aguacate en láminas",
 * "Tomates cherry partidos", "Nueces peladas en bolsa") collapse into a single unified item.
 */
export function normalizeShoppingIngredientName(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  let n = rawName.trim();

  // 1. Direct canonical name overrides
  if (/^aguacate\b/i.test(n)) return "Aguacate";
  if (/^tomates?\s+cherry\b/i.test(n)) return "Tomates cherry";
  if (/^nueces?\b/i.test(n)) return "Nueces peladas";
  if (/^cebolla\s+morada\b/i.test(n)) return "Cebolla morada";
  if (/^cebolla\b/i.test(n)) return "Cebolla";
  if (/^cebolleta\b/i.test(n)) return "Cebolleta fresca";
  if (/^pepino\b/i.test(n)) return "Pepino fresco";
  if (/^zanahoria\b/i.test(n)) return "Zanahoria";
  if (/^champi[ñn]ones?\b/i.test(n)) return "Champiñones";
  if (/^patatas?\b/i.test(n)) return "Patatas";
  if (/^lomo\s+(mechado|asado|de\s+cerdo|o\s+cabecero)\b/i.test(n)) return "Lomo de cerdo";
  if (/^pechuga\s+de\s+pollo\b/i.test(n)) return "Pechuga de pollo";
  if (/^pechuga\s+de\s+pavo\b/i.test(n)) return "Pechuga de pavo";
  if (/^carne\s+de\s+(pollo\s+)?kebab\b/i.test(n) || /^kebab\b/i.test(n)) return "Carne de pollo estilo Kebab";
  if (/^gnocchis?\b/i.test(n) || /^ñoquis?\b/i.test(n)) return "Gnocchis de patata";
  if (/^lomo\s+de\s+salm[oó]n\b/i.test(n) || /^salm[oó]n\s+fresco\b/i.test(n)) return "Lomo de salmón fresco";
  if (/^salm[oó]n\s+(marinado|ahumado)\b/i.test(n)) return "Salmón ahumado";
  if (/^at[uú]n\s+claro\b/i.test(n)) return "Atún claro al natural";
  if (/^barrita\b.*(prote|hacendado|enervit)/i.test(n)) return "Barrita proteica Hacendado";
  if (/^caf[eé]\s+(espresso|molido|en\s+c[aá]psula)/i.test(n)) return "Café molido o en cápsula";
  if (/^leche\s+desnatada\s+\+prote[ií]nas/i.test(n)) return "Leche desnatada +Proteínas Hacendado";
  if (/^leche\s+semidesnatada/i.test(n)) return "Leche semidesnatada Hacendado";
  if (/^yogur\s+griego\s+natural/i.test(n) || /^yogur\s+natural\s+tipo\s+griego/i.test(n)) return "Yogur griego natural 0%";
  if (/^yogur\s+bebible\s+\+prote[ií]nas/i.test(n) || /^bebida\s+l[aá]ctea\s+\+prote/i.test(n)) return "Bebida láctea +Proteínas Hacendado";
  if (/^queso\s+parmesano\b/i.test(n) || /^queso\s+grana\s+padano\b/i.test(n)) return "Queso Parmesano";
  if (/^pan\s+(de\s+centeno|integral|de\s+molde|de\s+masa\s+madre|tostado)\b/i.test(n)) return "Pan integral / centeno";
  if (/^arroz\s+basmati\b/i.test(n)) return "Arroz basmati";
  if (/^arroz\s+bomba\b/i.test(n)) return "Arroz bomba";
  if (/^arroz\s+jazm[ií]n\b/i.test(n)) return "Arroz jazmín";
  if (/^arroz\s+(redondo|arborio|carnaroli)\b/i.test(n)) return "Arroz redondo";
  if (/^gambas?\s+peladas?\b/i.test(n) || /^gambitas?\b/i.test(n)) return "Gambas peladas";
  if (/^semillas\s+de\s+s[eé]samo\b/i.test(n)) return "Semillas de sésamo tostado";
  if (/^salsa\s+de\s+soja\b/i.test(n)) return "Salsa de soja baja en sal";
  if (/^tomate\s+triturado\b/i.test(n)) return "Tomate triturado natural";
  if (/^tomate\s+rallado\b/i.test(n)) return "Tomate rallado natural";
  if (/^tomate\s+(de\s+ensalada|en\s+rodajas)\b/i.test(n)) return "Tomate de ensalada";
  if (/^manzana\b/i.test(n)) return "Manzana";
  if (/^pl[aá]tano\b/i.test(n)) return "Plátano";
  if (/^espinacas?\s+baby\b/i.test(n)) return "Espinacas baby";
  if (/^can[oó]nigos\b/i.test(n)) return "Canónigos";

  // General culinary cuts and prep suffixes cleaner (e.g. en dados, en láminas, picado, etc.)
  n = n.replace(/\s+(en\s+(dados|láminas|laminas|rodajas|tiras|trozos|juliana|mitades|lascas|conserva|bolsa)|picad[oa][as]?|trocead[oa][as]?|rallad[oa][as]?|madur[oa][as]?|fresc[oa][as]?|limpi[oa][as]?|asad[oa][as]?|cocid[oa][as]?|saltead[oa][as]?|partid[oa][as]?|escurrid[oa][as]?|laminad[oa][as]?)\b/gi, '').trim();

  return n.charAt(0).toUpperCase() + n.slice(1);
}

/**
 * Unifies interchangeable ingredients into the predominant variant (the one with highest quantity)
 * and attaches Mercadona matching information and direct search links.
 */
export function unifyAndOptimizeForMercadona(rawItemsList) {
  if (!Array.isArray(rawItemsList) || rawItemsList.length === 0) return [];

  const familyBuckets = new Map();
  const independentItems = [];

  rawItemsList.forEach(item => {
    const rawName = (item.name || "").trim();
    const name = normalizeShoppingIngredientName(rawName);
    let matchedFamily = null;

    for (const fam of INTERCHANGEABLE_FAMILIES) {
      if (fam.detector.test(name) || fam.detector.test(rawName)) {
        matchedFamily = fam;
        break;
      }
    }

    if (matchedFamily) {
      if (!familyBuckets.has(matchedFamily.family)) {
        familyBuckets.set(matchedFamily.family, {
          familyDef: matchedFamily,
          variants: new Map(),
          totalAmount: 0,
          unit: item.unit || "g",
          category: item.category
        });
      }

      const bucket = familyBuckets.get(matchedFamily.family);
      const variantName = matchedFamily.extractVariant(name);
      const currentAmt = bucket.variants.get(variantName) || 0;
      let addAmt = Number(item.amount) || 0;

      // Smart unit conversion if units mismatch within the same family (e.g. pieces vs grams)
      const itemUnit = (item.unit || "").toLowerCase();
      const bucketUnit = (bucket.unit || "").toLowerCase();
      if (bucketUnit === "g" && (itemUnit === "ud" || itemUnit === "pieza" || itemUnit === "unidad")) {
        if (matchedFamily.family === "aguacate") addAmt *= 150;
        else if (matchedFamily.family === "huevos") addAmt *= 60;
        else if (matchedFamily.family === "cebolla" || matchedFamily.family === "patata" || matchedFamily.family === "pimiento") addAmt *= 150;
      } else if ((bucketUnit === "ud" || bucketUnit === "pieza" || bucketUnit === "unidad") && (itemUnit === "g" || itemUnit === "gr")) {
        if (matchedFamily.family === "aguacate") addAmt = addAmt / 150;
        else if (matchedFamily.family === "huevos") addAmt = addAmt / 60;
        else if (matchedFamily.family === "cebolla" || matchedFamily.family === "patata" || matchedFamily.family === "pimiento") addAmt = addAmt / 150;
      }

      bucket.variants.set(variantName, currentAmt + addAmt);
      bucket.totalAmount += addAmt;
    } else {
      independentItems.push({
        ...item,
        name: name
      });
    }
  });

  const optimizedItems = [];

  // Consolidate interchangeable families into the predominant variant
  for (const [famKey, bucket] of familyBuckets.entries()) {
    let predominantVariant = "";
    let maxAmt = -1;
    const variantBreakdown = [];

    for (const [variant, amt] of bucket.variants.entries()) {
      variantBreakdown.push(`${Math.round(amt)} ${bucket.unit} de ${variant}`);
      if (amt > maxAmt) {
        maxAmt = amt;
        predominantVariant = variant;
      }
    }

    const mercadonaInfo = bucket.familyDef.mercadonaMatch(predominantVariant);
    const searchUrl = `https://tienda.mercadona.es/search-results?query=${encodeURIComponent(mercadonaInfo.query)}`;
    const isMultiVariant = bucket.variants.size > 1;

    optimizedItems.push({
      name: isMultiVariant ? `${predominantVariant} (unificado)` : predominantVariant,
      originalName: predominantVariant,
      amount: Math.round(bucket.totalAmount * 10) / 10,
      unit: bucket.unit,
      category: bucket.category,
      isUnified: isMultiVariant,
      unificationNote: isMultiVariant
        ? `💡 Unificado en "${predominantVariant}" (${variantBreakdown.join(" + ")}). Se utiliza la variedad de mayor cantidad para evitar comprar dos paquetes distintos.`
        : null,
      mercadona: {
        productName: mercadonaInfo.name,
        recommendedPack: mercadonaInfo.pack,
        searchQuery: mercadonaInfo.query,
        searchUrl: searchUrl
      }
    });
  }

  // Process independent items with Mercadona matching
  independentItems.forEach(item => {
    const name = item.name.trim();
    const query = `${name} hacendado`.toLowerCase();
    const searchUrl = `https://tienda.mercadona.es/search-results?query=${encodeURIComponent(name)}`;

    optimizedItems.push({
      ...item,
      isUnified: false,
      unificationNote: null,
      mercadona: {
        productName: `${name} (Mercadona)`,
        recommendedPack: item.amount ? `${Math.round(item.amount)} ${item.unit}` : "Formato estándar",
        searchQuery: name,
        searchUrl: searchUrl
      }
    });
  });

  return optimizedItems;
}

/**
 * AI-Powered Mercadona Optimizer using Google Gemini
 * Analyzes the weekly list, applies pantry intelligence, suggests exact Hacendado formats,
 * and formats the entire basket for purchasing at Mercadona.
 */
export async function optimizeMercadonaListWithAi(itemsList, weekLabel = "") {
  const apiKey = getGeminiApiKey();
  const summaryItems = itemsList.map(i => `- ${i.name}: ${i.amount} ${i.unit}`).join("\n");

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const promptText = `Actúa exclusivamente como asistente de compra inteligente experto en supermercados MERCADONA para la app FitDuo.
Tenemos la siguiente lista de ingredientes calculada para las comidas de la semana (${weekLabel}):
${summaryItems}

TU TAREA:
1. REGLA DE DESPENSA Y ECONOMÍA DOMÉSTICA (ARROZ, PASTAS Y BÁSICOS):
   - Si una receta pide arroz bomba y otra arroz basmati (o redondo), UNIFICA en la variedad predominante (la de mayor cantidad) para evitar comprar dos paquetes distintos.
   - Advierte al usuario: "Si ya dispones de arroz en casa (de cualquier tipo), no compres un nuevo paquete; aprovecha el que tienes".
2. MAPEO A PRODUCTOS REALES MERCADONA / HACENDADO:
   - Traduce cada ingrediente al nombre del producto exacto en Mercadona (ej. "Arroz basmati Hacendado", "Cabecero de lomo fresco corte grueso", "Malla patatas lavado 3kg Hacendado", "Pechuga de pollo filetes bandeja 500g", "Queso fresco de Burgos Hacendado").
   - Indica el formato de paquete comercial sugerido para comprar (ej. "1 paquete de 1 kg", "2 bandejas de 500g", "1 malla de 3kg").
3. ORGANIZACIÓN POR PASILLOS DE MERCADONA:
   - Frescos (Carnicería, Pescadería, Frutas y Verduras)
   - Lácteos y Huevos
   - Despensa, Arroces y Pastas

Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "pantryAdvice": "Consejos clave de despensa (ej. sobre no comprar arroz si ya tienes en casa)",
  "sections": [
    {
      "sectionName": "Frutas y Verduras",
      "items": [
        {
          "originalItem": "Patatas frescas",
          "mercadonaProduct": "Malla patatas lavado 3 kg Hacendado",
          "packsToBuy": "1 malla (3 kg)",
          "recipeNeeds": "800g para la semana",
          "searchQuery": "patatas lavado hacendado"
        }
      ]
    }
  ]
}`;

      let parsed = null;
      for (const modelName of PRIORITIZED_GEMINI_MODELS) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS),
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const resJson = JSON.parse(text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim());
              if (resJson && Array.isArray(resJson.sections)) {
                parsed = resJson;
                break;
              }
            }
          }
        } catch(eModel) {
          console.warn(`Mercadona optimization attempt with ${modelName} failed:`, eModel);
        }
      }

      if (parsed) {
        return parsed;
      }
    } catch(e) {
      console.warn("Mercadona AI optimization fallback to local engine:", e);
    }
  }

  // Fallback local structured format
  const localOptimized = unifyAndOptimizeForMercadona(itemsList);
  return {
    pantryAdvice: "💡 Consejo de Despensa: Se han unificado las variedades de arroz y pasta en la de mayor cantidad. Si ya dispones de arroz o legumbres de cualquier tipo en casa, no compres más paquetes; utiliza las reservas de tu despensa.",
    sections: [
      {
        sectionName: "Productos Mercadona Optimizados",
        items: localOptimized.map(item => ({
          originalItem: item.name,
          mercadonaProduct: item.mercadona.productName,
          packsToBuy: item.mercadona.recommendedPack,
          recipeNeeds: `${item.amount} ${item.unit}`,
          searchQuery: item.mercadona.searchQuery,
          unificationNote: item.unificationNote
        }))
      }
    ]
  };
}
