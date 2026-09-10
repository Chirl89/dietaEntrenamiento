/**
 * FitDuo - Mercadona Shopping Optimizer & Smart Pantry Engine
 * Consolidates interchangeable ingredients (e.g. Arroz Bomba + Arroz Basmati -> uses the one with highest quantity),
 * provides exact Mercadona / Hacendado product matching, pack size recommendations,
 * and direct search links to tienda.mercadona.es.
 */

import { getGeminiApiKey, PRIORITIZED_GEMINI_MODELS } from './nutritionCalculator.js';

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
  }
];

/**
 * Unifies interchangeable ingredients into the predominant variant (the one with highest quantity)
 * and attaches Mercadona matching information and direct search links.
 */
export function unifyAndOptimizeForMercadona(rawItemsList) {
  if (!Array.isArray(rawItemsList) || rawItemsList.length === 0) return [];

  const familyBuckets = new Map();
  const independentItems = [];

  rawItemsList.forEach(item => {
    const name = (item.name || "").trim();
    let matchedFamily = null;

    for (const fam of INTERCHANGEABLE_FAMILIES) {
      if (fam.detector.test(name)) {
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
      const addAmt = Number(item.amount) || 0;
      bucket.variants.set(variantName, currentAmt + addAmt);
      bucket.totalAmount += addAmt;
    } else {
      independentItems.push(item);
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
            signal: AbortSignal.timeout(10000),
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
