// FitDuo & Collie Coach - Database

export const INITIAL_PROFILES = {
  he: {
    id: "he",
    name: "Carlos",
    height: 182,
    weight: 78,
    activityLevel: 1.2, // Sedentario / 10 años sin hacer ejercicio
    goal: "recomp", // Recomposición corporal: Perder grasa y ganar músculo progresivamente
    experience: "beginner",
    equipment: ["bodyweight", "chair", "mat", "elastic_bands", "ring_con_switch"],
    targetCalories: 2150,
    protein: 155, // g
    carbs: 210, // g
    fats: 65, // g
    moveGoal: 600, // kcal objetivo anillo movimiento
    exerciseGoal: 30, // min objetivo anillo ejercicio
    stepsGoal: 10000, // pasos objetivo anillo de pasos/de pie
    notes: "Rehabilitación e hipertrofia segura (RM: hernias dorsales D7-D8 y D10-D11 con deshidratación discal). Equipamiento: Banda elástica + Ring-Con Switch + esterilla y silla. Cero carga axial en columna, columna neutra, faja core 360° y retracción escapular sin impacto."
  },
  she: {
    id: "she",
    name: "Andrea",
    height: 172,
    weight: 63,
    activityLevel: 1.35, // Moderadamente activa / paseos
    goal: "recomp", // Tonificar y ganar fuerza
    experience: "intermediate_light",
    equipment: ["bodyweight", "chair", "mat", "light_bands"],
    targetCalories: 1850,
    protein: 130, // g
    carbs: 180, // g
    fats: 55, // g
    moveGoal: 500, // kcal objetivo anillo movimiento
    exerciseGoal: 30, // min objetivo anillo ejercicio
    stepsGoal: 10000, // pasos objetivo anillo de pasos/de pie
    notes: "Tonificación general, mejora de resistencia cardio con la Border Collie (Boo) y trabajo de core/glúteos."
  },
  dog: {
    name: "Boo",
    breed: "Border Collie",
    age: 3,
    energyLevel: "Alta (Requiere estimular cuerpo y mente)",
    dailyWalkMinutes: 75,
    favoriteActivities: ["Frisbee", "Trail running", "Fartlek de parque", "Juegos de agilidad con obstáculos urbanos"]
  }
};

export const INGREDIENT_CATEGORIES = {
  PRODUCE: "Frutas y Verduras",
  PROTEIN: "Carnicería y Pescadería",
  DAIRY: "Huevos y Lácteos",
  GRAINS: "Panadería, Cereales y Legumbres",
  FATS: "Aceites, Frutos Secos y Semillas",
  PANTRY: "Despensa, Especias y Suplementos"
};

export const RECIPES_DATABASE = [
  // DESAYUNOS
  {
    id: "d1",
    name: "Tortilla de Avena y Claras con Plátano y Arándanos",
    type: "desayuno",
    prepTime: 12,
    calories: 420,
    protein: 26,
    carbs: 54,
    fats: 10,
    tags: ["alto en proteína", "rápido", "dulce"],
    ingredients: [
      { name: "Copos de avena integrales", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Claras de huevo pasteurizadas", amount: 150, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Huevos frescos (Clase L)", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Plátanos de Canarias", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Frutos rojos / Arándanos frescos", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 3, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Canela en polvo", amount: 2, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Bate los copos de avena con las claras, el huevo entero y una pizca de canela.",
      "Engrasa ligeramente una sartén antiadherente con unas gotas de AOVE a fuego medio.",
      "Vierte la mezcla y cocina 3 min por lado hasta que esté dorada.",
      "Sirve con el plátano cortado en rodajas y los arándanos por encima."
    ]
  },
  {
    id: "d2",
    name: "Tostadas Integrales con Aguacate, Huevos Poché y Tomate",
    type: "desayuno",
    prepTime: 10,
    calories: 440,
    protein: 22,
    carbs: 42,
    fats: 20,
    tags: ["salado", "grasas saludables", "rápido"],
    ingredients: [
      { name: "Pan 100% integral (masa madre / centeno)", amount: 70, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Huevos frescos (Clase L)", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Aguacates", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Tomates de ensalada", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Semillas de chía, lino o sésamo", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Sal y pimienta negra", amount: 1, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Tuesta las rebanadas de pan de centeno.",
      "Macha el aguacate con un tenedor y aliña con sal y pimienta.",
      "Cocina los huevos a la plancha o escalfados (poché).",
      "Extiende el aguacate sobre el pan, coloca el tomate y los huevos, y espolvorea semillas."
    ]
  },
  {
    id: "d3",
    name: "Bowl Proteico de Yogur Griego, Frutos Rojos y Nueces",
    type: "desayuno",
    prepTime: 5,
    calories: 380,
    protein: 28,
    carbs: 35,
    fats: 14,
    tags: ["ultra rápido", "sin cocinado", "alto en proteína"],
    ingredients: [
      { name: "Yogur Griego Natural 0%", amount: 220, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Proteína de suero (Whey Protein)", amount: 20, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY },
      { name: "Frutos rojos / Arándanos frescos", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Nueces al natural", amount: 20, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Semillas de chía, lino o sésamo", amount: 10, unit: "g", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Mezcla en un bowl el yogur griego con la proteína/requesón hasta tener una crema homogénea.",
      "Añade los frutos rojos, las nueces picadas y las semillas de lino.",
      "Listo para consumir inmediatamente."
    ]
  },
  {
    id: "d4",
    name: "Porridge Proteico de Avena, Vainilla, Plátano y Chía",
    type: "desayuno",
    prepTime: 8,
    calories: 410,
    protein: 27,
    carbs: 58,
    fats: 8,
    tags: ["saciante", "energía lenta", "dulce"],
    ingredients: [
      { name: "Copos de avena integrales", amount: 55, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Leche desnatada o bebida vegetal sin azúcar", amount: 180, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Proteína de suero (Whey Protein)", amount: 25, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY },
      { name: "Plátanos de Canarias", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Semillas de chía, lino o sésamo", amount: 8, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Canela en polvo", amount: 2, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Calienta la leche con la avena a fuego medio durante 4-5 minutos removiendo constantemente.",
      "Retira del fuego y mezcla la proteína de suero y la canela hasta que quede cremoso.",
      "Sirve en un bol y decora con rodajas de plátano y semillas de chía."
    ]
  },
  {
    id: "d5",
    name: "Tortilla Francesa con Espinacas Baby, Champiñones y Queso Feta",
    type: "desayuno",
    prepTime: 10,
    calories: 390,
    protein: 26,
    carbs: 12,
    fats: 24,
    tags: ["salado", "bajo en carb", "alto en proteína"],
    ingredients: [
      { name: "Huevos frescos (Clase L)", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Claras de huevo pasteurizadas", amount: 80, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Espinacas frescas", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Champiñones laminados", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Queso Feta o Burgos desnatado", amount: 35, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 5, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Saltea los champiñones y las espinacas con unas gotas de AOVE durante 3 minutos.",
      "Bate los huevos con las claras y viértelos sobre las verduras en la sartén.",
      "Añade el queso feta desmenuzado por encima y dobla la tortilla en media luna.",
      "Cocina hasta que quede jugosa por dentro."
    ]
  },
  {
    id: "d6",
    name: "Tostadas de Centeno con Requesón 0%, Fresas y Miel Pura",
    type: "desayuno",
    prepTime: 5,
    calories: 360,
    protein: 24,
    carbs: 48,
    fats: 6,
    tags: ["ultra rápido", "dulce", "alto en proteína"],
    ingredients: [
      { name: "Pan 100% integral (masa madre / centeno)", amount: 70, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Queso fresco batido 0%", amount: 140, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Fresas o Frutos Rojos", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Miel pura", amount: 10, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY },
      { name: "Nueces al natural", amount: 15, unit: "g", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Tuesta las rebanadas de pan de centeno.",
      "Unta generosamente el requesón o queso batido escurrido sobre las tostadas.",
      "Coloca las fresas cortadas en láminas y nueces picadas.",
      "Riega con un hilo fino de miel pura."
    ]
  },

  // ALMUERZOS / COMIDAS
  {
    id: "c1",
    name: "Pechuga de Pollo a la Plancha con Quinoa y Verduras Salteadas",
    type: "comida",
    prepTime: 20,
    calories: 550,
    protein: 48,
    carbs: 52,
    fats: 14,
    tags: ["alto en proteína", "saciante", "perfecto para tupper"],
    ingredients: [
      { name: "Pechuga de pollo fileteada", amount: 180, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Quinoa", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Calabacín", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Pimientos (rojo y verde)", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Zanahorias", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 10, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Orégano y ajo en polvo", amount: 2, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Cocina la quinoa en agua hirviendo con sal durante 12-15 minutos si no está precocida.",
      "En una sartén grande con la mitad del AOVE, saltea las verduras cortadas a fuego vivo hasta que estén al dente.",
      "Marca la pechuga de pollo sazonada con ajo y orégano en la plancha bien caliente con el resto del aceite.",
      "Combina la quinoa, las verduras salteadas y el pollo troceado."
    ]
  },
  {
    id: "c2",
    name: "Lomo de Salmón al Horno con Boniato Rústico y Brócoli al Vapor",
    type: "comida",
    prepTime: 25,
    calories: 580,
    protein: 42,
    carbs: 45,
    fats: 22,
    tags: ["omega 3", "antiinflamatorio", "saludable"],
    ingredients: [
      { name: "Lomo de salmón fresco", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Boniato", amount: 180, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Brócoli", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Hierbas provenzales (romero/tomillo) y limón", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Precalienta el horno a 200°C. Corta el boniato en gajos, adereza con AOVE, romero y sal, y hornea 20 min.",
      "Cuece el brócoli al vapor durante 6-7 minutos para mantener su textura crujiente y nutrientes.",
      "Hornea o pasa por la sartén el lomo de salmón durante 8-10 minutos (4 min por lado si es sartén).",
      "Sirve acompañado de unas gotas de zumo de limón fresco."
    ]
  },
  {
    id: "c3",
    name: "Ensalada Completa de Lentejas, Atún, Aguacate y Queso Feta",
    type: "comida",
    prepTime: 10,
    calories: 510,
    protein: 38,
    carbs: 46,
    fats: 18,
    tags: ["legumbres", "rápido", "sin cocinado"],
    ingredients: [
      { name: "Lentejas cocidas en tarro", amount: 200, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Atún claro al natural (latas)", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Queso Feta o Burgos desnatado", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Aguacates", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Tomates cherry", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Pepino", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 5, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Vinagre de manzana", amount: 5, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Aclara y escurre bien las lentejas cocidas.",
      "En un bol grande, mezcla las lentejas, el atún desmenuzado, los tomates cherry por la mitad, el pepino y el aguacate.",
      "Desmenuza el queso feta por encima.",
      "Aliña con una cucharadita de AOVE, vinagre de manzana, sal y orégano."
    ]
  },
  {
    id: "c4",
    name: "Poke Bowl de Salmón Fresco, Arroz Integral, Edamame y Mango",
    type: "comida",
    prepTime: 15,
    calories: 560,
    protein: 39,
    carbs: 56,
    fats: 18,
    tags: ["fresco", "alto en proteína", "omega 3"],
    ingredients: [
      { name: "Lomo de salmón fresco", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Arroz integral", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Edamame desgranado o soja", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Mango maduro", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aguacates", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Semillas de chía, lino o sésamo", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Salsa de soja baja en sal", amount: 10, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Corta el salmón fresco en dados y marina 5 min con salsa de soja.",
      "Sirve una base de arroz integral cocido en un bol amplio.",
      "Distribuye armónicamente el salmón, el edamame cocido, el mango en dados y el aguacate.",
      "Espolvorea semillas de sésamo por encima."
    ]
  },
  {
    id: "c5",
    name: "Arroz Integral Salteado con Ternera Magra, Setas y Pimientos",
    type: "comida",
    prepTime: 20,
    calories: 540,
    protein: 44,
    carbs: 54,
    fats: 14,
    tags: ["alto en hierro", "fuerza", "tupper"],
    ingredients: [
      { name: "Filetes de ternera magra", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Arroz integral", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Champiñones laminados", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Pimientos (rojo y verde)", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Cebolla", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Ajo y perejil picado", amount: 3, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Corta la ternera magra en tiras finas.",
      "Saltea en sartén o wok con AOVE la cebolla, los pimientos y las setas a fuego alto durante 5 minutos.",
      "Añade la ternera y sella a fuego vivo durante 2-3 minutos sin resecar.",
      "Incorpora el arroz integral cocido, remueve todo junto y espolvorea perejil fresco."
    ]
  },
  {
    id: "c6",
    name: "Pasta 100% Integral con Pavo Picado, Salsa de Tomate Casera y Albahaca",
    type: "comida",
    prepTime: 18,
    calories: 530,
    protein: 43,
    carbs: 58,
    fats: 12,
    tags: ["italiano fit", "saciante", "post-entreno"],
    ingredients: [
      { name: "Carne picada de pavo o pollo", amount: 170, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Pasta 100% integral", amount: 75, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Tomate triturado natural", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Cebolla y ajo", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Queso parmesano rallado", amount: 15, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 6, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Albahaca y orégano", amount: 2, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Hierve la pasta integral en abundante agua con sal durante 8-10 minutos al dente.",
      "Sofríe la cebolla y el ajo con AOVE, añade la carne picada de pavo y cocina hasta dorar.",
      "Vierte el tomate triturado, orégano y albahaca, dejando reducir a fuego medio 8 minutos.",
      "Mezcla la pasta con la salsa y espolvorea el queso parmesano."
    ]
  },
  {
    id: "c7",
    name: "Garbanzos Salteados con Espinacas Frescas, Gambas y Pimentón",
    type: "comida",
    prepTime: 12,
    calories: 490,
    protein: 36,
    carbs: 48,
    fats: 14,
    tags: ["legumbres", "rápido", "tradicional fit"],
    ingredients: [
      { name: "Garbanzos cocidos en tarro", amount: 200, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Gambas peladas", amount: 140, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Espinacas frescas", amount: 120, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Ajo", amount: 2, unit: "diente", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Pimentón dulce de la Vera", amount: 3, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Aclara y escurre los garbanzos cocidos.",
      "Dora los ajos laminados en una sartén con AOVE.",
      "Añade las gambas peladas y saltea 2 min. Añade las espinacas hasta que reduzcan de volumen.",
      "Incorpora los garbanzos y el pimentón dulce, removiendo 3 minutos a fuego medio."
    ]
  },

  // CENAS
  {
    id: "cn1",
    name: "Revuelto de Huevos y Claras con Espárragos Trigueros y Gambas",
    type: "cena",
    prepTime: 15,
    calories: 360,
    protein: 38,
    carbs: 10,
    fats: 16,
    tags: ["cena ligera", "bajo en carbohidratos", "rápido"],
    ingredients: [
      { name: "Gambas peladas", amount: 130, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Espárragos verdes trigueros", amount: 120, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Huevos frescos (Clase L)", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Claras de huevo pasteurizadas", amount: 100, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Ajo", amount: 1, unit: "diente", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Corta los espárragos retirando la parte leñosa y trocea el resto.",
      "Saltea el ajo laminado en una sartén con AOVE a fuego medio. Añade los espárragos y saltea 6 min.",
      "Incorpora las gambas y cocina 2 minutos más.",
      "Bate los huevos con las claras y vierte en la sartén. Remueve suavemente a fuego bajo hasta que cuaje jugoso."
    ]
  },
  {
    id: "cn2",
    name: "Hamburguesa Casera de Pavo y Espinacas con Ensalada Mixta y Patata",
    type: "cena",
    prepTime: 18,
    calories: 430,
    protein: 40,
    carbs: 36,
    fats: 12,
    tags: ["plato estrella", "proteína magra"],
    ingredients: [
      { name: "Carne picada de pavo o pollo", amount: 170, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Espinacas frescas", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Patatas", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Lechuga variada y cebolla", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 6, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Lava la patata, pínchala con un tenedor y cocínala envuelta en papel vegetal al microondas durante 6-7 min a máxima potencia.",
      "Mezcla la carne picada con las espinacas picadas, sal, ajo en polvo y da forma a la hamburguesa.",
      "Cocina la hamburguesa a la plancha 4 minutos por cada lado.",
      "Corta la patata cocida en rodajas y sirve junto a la hamburguesa y una ensalada fresca."
    ]
  },
  {
    id: "cn3",
    name: "Tacos de Merluza al Horno con Guacamole Casero y Pico de Gallo",
    type: "cena",
    prepTime: 20,
    calories: 410,
    protein: 36,
    carbs: 32,
    fats: 14,
    tags: ["delicioso", "pescado blanco", "fácil"],
    ingredients: [
      { name: "Lomos de merluza o bacalao", amount: 180, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Tortillas de trigo 100% integral", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Aguacates", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Tomate y cebolla", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Cilantro fresco y lima", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE }
    ],
    instructions: [
      "Cocina la merluza sazonada al horno o en sartén antiadherente durante 8 minutos. Desmígala.",
      "Templa las tortillas en una sartén seca unos segundos por lado.",
      "Monta cada tortilla con una base de aguacate, el pescado desmigado y el pico de gallo.",
      "Añade gotas de lima fresca y cilantro por encima."
    ]
  },
  {
    id: "cn4",
    name: "Suprema de Lubina al Horno con Calabacín y Tomates Cherry",
    type: "cena",
    prepTime: 20,
    calories: 380,
    protein: 38,
    carbs: 14,
    fats: 16,
    tags: ["ligero", "pescado blanco", "omega 3"],
    ingredients: [
      { name: "Filetes de lubina o dorada", amount: 190, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Calabacín", amount: 140, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Tomates cherry", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Orégano y ajo en polvo", amount: 2, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Corta el calabacín en rodajas finas y colócalo en una bandeja de horno junto a los tomates cherry.",
      "Coloca encima los filetes de lubina limpios.",
      "Riega con el AOVE, ajo en polvo, orégano y sal.",
      "Hornea a 190°C durante 14-16 minutos hasta que el pescado esté tierno y jugoso."
    ]
  },
  {
    id: "cn5",
    name: "Crema de Calabaza y Zanahoria con Pollo Desmigado y Pipas de Calabaza",
    type: "cena",
    prepTime: 22,
    calories: 390,
    protein: 37,
    carbs: 30,
    fats: 12,
    tags: ["reconfortante", "digestión fácil", "otoño/invierno"],
    ingredients: [
      { name: "Pechuga de pollo fileteada", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Calabaza troceada", amount: 200, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Zanahorias", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Queso fresco batido 0%", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Semillas de calabaza", amount: 10, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 5, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Cuece la calabaza y la zanahoria en agua con sal durante 15 minutos hasta que estén tiernas.",
      "Tritura las verduras junto con el queso batido y el AOVE hasta conseguir una crema sedosa.",
      "Haz la pechuga de pollo a la plancha y desmígala con dos tenedores.",
      "Sirve la crema caliente coronada con el pollo desmigado y las pipas de calabaza crujientes."
    ]
  },
  {
    id: "cn6",
    name: "Ensalada Templada de Pollo Crujiente, Manzana y Nueces",
    type: "cena",
    prepTime: 12,
    calories: 420,
    protein: 39,
    carbs: 25,
    fats: 17,
    tags: ["fresco", "crujiente", "alto en proteína"],
    ingredients: [
      { name: "Pechuga de pollo fileteada", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Lechuga variada y cebolla", amount: 120, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Manzanas", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Queso Feta o Burgos desnatado", amount: 35, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Nueces al natural", amount: 15, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 6, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Mostaza de Dijon y vinagre", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Corta la pechuga en tiras y saltea en sartén caliente con AOVE hasta que esté bien dorada y crujiente.",
      "En un bol pon la base de brotes tiernos, la manzana cortada en gajos finos y el queso desmenuzado.",
      "Añade el pollo templado y las nueces.",
      "Aliña con una vinagreta ligera de mostaza de Dijon, vinagre y sal."
    ]
  },
  {
    id: "cn7",
    name: "Wok Ligero de Langostinos con Fideos de Arroz y Verduras",
    type: "cena",
    prepTime: 15,
    calories: 400,
    protein: 35,
    carbs: 45,
    fats: 8,
    tags: ["asiático fit", "rápido", "bajo en grasa"],
    ingredients: [
      { name: "Gambas peladas", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Fideos de arroz", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Pimientos (rojo y verde)", amount: 90, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Calabacín", amount: 90, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 6, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Salsa de soja baja en sal", amount: 12, unit: "ml", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Hidrata los fideos de arroz en agua hirviendo durante 4 minutos y escurre.",
      "Saltea en wok o sartén amplia con AOVE las verduras cortadas en juliana a fuego muy vivo durante 4 min.",
      "Añade los langostinos y saltea 2 min más.",
      "Incorpora los fideos, añade la salsa de soja y saltea todo junto 1 minuto."
    ]
  },

  // SNACKS / MERIENDAS
  {
    id: "s1",
    name: "Manzana con Mantequilla de Cacahuete 100% y Canela",
    type: "snack",
    prepTime: 3,
    calories: 210,
    protein: 6,
    carbs: 26,
    fats: 10,
    tags: ["snack rápido", "energía pre-entreno"],
    ingredients: [
      { name: "Manzanas", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Mantequilla de cacahuete 100%", amount: 18, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Canela en polvo", amount: 1, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Corta la manzana en gajos finos.",
      "Sirve la mantequilla de cacahuete para untar y espolvorea canela."
    ]
  },
  {
    id: "s2",
    name: "Queso Batido 0% / Requesón con Puñado de Almendras y Miel",
    type: "snack",
    prepTime: 2,
    calories: 220,
    protein: 18,
    carbs: 16,
    fats: 8,
    tags: ["alto en proteína", "post-entreno"],
    ingredients: [
      { name: "Queso fresco batido 0%", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Almendras al natural", amount: 15, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Miel pura", amount: 8, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Sirve el queso batido en una taza o bol.",
      "Añade las almendras enteras o picadas y un fino hilo de miel."
    ]
  },
  {
    id: "s3",
    name: "Batido Proteico de Plátano y Copos de Avena",
    type: "snack",
    prepTime: 3,
    calories: 260,
    protein: 22,
    carbs: 34,
    fats: 4,
    tags: ["post-entreno", "energético", "rápido"],
    ingredients: [
      { name: "Plátanos de Canarias", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Proteína de suero (Whey Protein)", amount: 25, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY },
      { name: "Leche desnatada o bebida vegetal sin azúcar", amount: 200, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Copos de avena integrales", amount: 20, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS }
    ],
    instructions: [
      "Vierte la leche y la proteína en el vaso batidor.",
      "Añade el plátano troceado y los copos de avena.",
      "Tritura durante 30 segundos hasta obtener un batido cremoso."
    ]
  },
  {
    id: "s4",
    name: "Tostada Integrales con Pechuga de Pavo y Tomate",
    type: "snack",
    prepTime: 4,
    calories: 190,
    protein: 15,
    carbs: 24,
    fats: 3,
    tags: ["salado", "proteína magra", "rápido"],
    ingredients: [
      { name: "Pan 100% integral (masa madre / centeno)", amount: 45, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Pechuga de pavo lonchas (90%+ carne)", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Tomates de ensalada", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 3, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Tuesta la rebanada de pan integral.",
      "Pinta con unas gotas de AOVE y coloca las rodajas de tomate.",
      "Cubre con las lonchas de pechuga de pavo."
    ]
  },
  {
    id: "s5",
    name: "Tortitas de Arroz con Mantequilla de Almendras y Frutos Rojos",
    type: "snack",
    prepTime: 3,
    calories: 200,
    protein: 7,
    carbs: 25,
    fats: 8,
    tags: ["crujiente", "ligero", "dulce"],
    ingredients: [
      { name: "Tortitas de arroz integral", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Mantequilla de almendra 100%", amount: 15, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Frutos rojos / Arándanos frescos", amount: 30, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE }
    ],
    instructions: [
      "Unta la mantequilla de almendra sobre las tortitas.",
      "Decora con los frutos rojos frescos por encima."
    ]
  },
  {
    id: "s6",
    name: "Yogur Proteico con Nueces y Semillas de Lino",
    type: "snack",
    prepTime: 2,
    calories: 210,
    protein: 16,
    carbs: 12,
    fats: 11,
    tags: ["ultra rápido", "grasas buenas", "saciedad"],
    ingredients: [
      { name: "Yogur Griego Natural 0%", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Nueces al natural", amount: 15, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Semillas de chía, lino o sésamo", amount: 6, unit: "g", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Sirve el yogur en un vaso o bol pequeño.",
      "Añade las nueces troceadas y espolvorea las semillas."
    ]
  },
  {
    id: "s7",
    name: "Hummus Casero con Bastoncitos de Zanahoria y Pepino",
    type: "snack",
    prepTime: 5,
    calories: 180,
    protein: 8,
    carbs: 22,
    fats: 7,
    tags: ["vegetal", "fibra", "crujiente"],
    ingredients: [
      { name: "Garbanzos cocidos en tarro", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Zanahorias", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Pepino", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra (AOVE)", amount: 4, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Pimentón dulce de la Vera", amount: 1, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
    ],
    instructions: [
      "Tritura los garbanzos con el AOVE, un chorrito de agua, sal y pimentón.",
      "Corta la zanahoria y el pepino en bastoncitos alargados (crudités).",
      "Dipea los vegetales en el hummus recién preparado."
    ]
  }
];

export const WEEKLY_WORKOUT_SCHEDULE = {
  Lunes: {
    day: "Lunes",
    title: "Lunes: Fuerza Base & Cadena Posterior Segura (Carlos & Andrea)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Banda Elástica", "Silla", "Esterilla"],
    type: "Rehabilitación & Hipertrofia Segura",
    focus: "Postura erguida, retracción escapular y core profundo sin carga axial",
    exercises: [
      {
        id: "sentadilla_ring_con",
        name: "Sentadilla a Silla con Contrapeso de Ring-Con",
        sets: 3,
        reps: "10 - 12",
        rest: "60 seg",
        equipment: "Ring-Con + Silla",
        technique: "Sujeta el Ring-Con extendido al frente mientras bajas a rozar la silla. Activa cuádriceps y glúteos manteniendo el torso recto.",
        spinalSafetyNote: "Sujetar el Ring-Con extendido al frente crea un contrapeso reflejo que erige la caja torácica e impide flexionar la espalda dorsal, reduciendo a cero la presión sobre los discos D7-D8 y D10-D11.",
        targetMuscles: ["Cuádriceps", "Glúteos", "Erectores Espinales", "Core"],
        steps: [
          "Colócate de pie delante de una silla estable, con los pies a la anchura de hombros y puntas ligeramente hacia afuera.",
          "Sujeta el Ring-Con con ambas manos y extiéndelo horizontalmente al frente a la altura del esternón.",
          "Inhala, empuja la cadera hacia atrás y flexiona las rodillas hasta rozar ligeramente el asiento de la silla sin dejarte caer.",
          "Exhala y empuja fuerte contra el suelo a través de los talones para volver arriba, manteniendo el Ring-Con firme al frente."
        ],
        commonMistakes: ["Dejarse caer bruscamente en el asiento", "Bajar los brazos perdiendo la línea del Ring-Con", "Meter las rodillas hacia adentro"],
        visualType: "ring_squat"
      },
      {
        id: "remo_banda_puerta",
        name: "Remo Horizontal con Banda Elástica (Retracción Escapular)",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Banda Elástica",
        technique: "Ancla la banda en una puerta o pásala por los pies. Tira de los codos pegados al cuerpo y junta fuerte las escápulas 1 segundo.",
        spinalSafetyNote: "Al tirar de forma horizontal sin peso muerto, fortaleces el dorsal ancho y los romboides sin compresión axial vertical. Quita tensión de la hipercifosis dorsal.",
        targetMuscles: ["Dorsal Ancho", "Romboides", "Trapecio Medio", "Bíceps"],
        steps: [
          "Ancla la banda a media altura (en el pomo de una puerta cerrada) o siéntate en el suelo con las piernas estiradas pasando la banda por las plantas de los pies.",
          "Agarra los extremos con ambas manos, mantén la espalda totalmente erguida y los hombros relajados abajo.",
          "Exhala y tira de los codos hacia atrás pegados a las costillas, juntando escápulas como si atraparas una moneda entre los omóplatos.",
          "Mantén la contracción máxima 1 segundo y regresa despacio inhalando."
        ],
        commonMistakes: ["Encoger los hombros hacia las orejas", "Balancear el torso hacia atrás para hacer fuerza de inercia", "Separar los codos excesivamente"],
        visualType: "band_row"
      },
      {
        id: "traccion_escapular_ring",
        name: "Tracción Escapular Isométrica con Ring-Con",
        sets: 3,
        reps: "8 - 10 (3s aguante)",
        rest: "45 seg",
        equipment: "Ring-Con (Switch)",
        technique: "Sujeta el aro frente al pecho e intenta tirar hacia afuera separándolo. Aguanta 3 segundos de tensión máxima apretando omóplatos.",
        spinalSafetyNote: "La contracción isométrica pura activa los romboides y trapecio inferior sin mover la articulación vertebral. Es el ejercicio más seguro para despertar la espalda dorsal debilitada.",
        targetMuscles: ["Romboides", "Trapecio Medio/Inferior", "Deltoides Posterior"],
        steps: [
          "Colócate de pie o sentado erguido en una silla con los pies bien apoyados.",
          "Agarra los agarres acolchados del Ring-Con por dentro o firme por los laterales frente a tu pecho, codos a 90°.",
          "Tira hacia afuera con ambas manos como si quisieras ensanchar el aro, apretando las escápulas hacia abajo y atrás.",
          "Mantén la tensión continua durante 3 segundos respirando con normalidad, luego relaja 2 segundos antes de la siguiente repetición."
        ],
        commonMistakes: ["Aguantar la respiración en apnea", "Elevar los hombros", "Curvar la zona dorsal"],
        visualType: "ring_pull"
      },
      {
        id: "puente_gluteo_ring",
        name: "Puente de Glúteo con Compresión de Ring-Con",
        sets: 3,
        reps: "12 - 15 (2s arriba)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Tumbado boca arriba, coloca el Ring-Con entre las rodillas. Aprieta suavemente hacia adentro mientras elevas la cadera activando glúteos.",
        spinalSafetyNote: "Al estar tumbado, la carga axial en la columna es CERO. Activa la musculatura lumbo-pélvica y glúteos, descargando por completo los discos dorsales.",
        targetMuscles: ["Glúteo Mayor", "Aductores", "Isquiotibiales", "Suelo Pélvico"],
        steps: [
          "Túmbate boca arriba en la esterilla, flexiona las rodillas y apoya los pies firmes en el suelo a la anchura de caderas.",
          "Coloca el Ring-Con entre tus rodillas y aplica una suave presión continua hacia adentro.",
          "Exhala, aprieta los glúteos y eleva la cadera hacia el techo hasta formar una línea recta perfecta desde las rodillas hasta los hombros.",
          "Mantén la posición 2 segundos apretando glúteos y el aro, y desciende vértebra a vértebra de forma controlada."
        ],
        commonMistakes: ["Arquear en exceso la espalda lumbar en la parte alta", "Empujar con el cuello en vez de con los talones", "Dejar de presionar el Ring-Con"],
        visualType: "ring_glute_bridge"
      },
      {
        id: "deadbug_neutro",
        name: "Deadbug (Bicho Muerto con Columna Neutra)",
        sets: 3,
        reps: "8 - 10 alternadas",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Espalda baja y dorsal pegada a la esterilla. Extiende brazo derecho y pierna izquierda despacio sin despegar la columna del suelo.",
        spinalSafetyNote: "Entrena la faja abdominal profunda (transverso) en posición de reposo absoluto para los discos D7-D8 y D10-D11. Cero flexión del cuello ni del torso.",
        targetMuscles: ["Transverso Abdominal", "Oblicuos", "Coordinación Core"],
        steps: [
          "Túmbate boca arriba con brazos apuntando al techo y rodillas flexionadas a 90 grados sobre las caderas.",
          "Pega toda la espalda al suelo, activando el abdomen como si cerraras una cremallera.",
          "Inhala y baja lentamente el brazo derecho hacia atrás y la pierna izquierda hacia adelante rozando el suelo.",
          "Exhala activando el ombligo hacia dentro para regresar al centro. Alterna con el brazo y pierna opuestos."
        ],
        commonMistakes: ["Arquear la espalda y separarla del suelo", "Moverse rápido por inercia", "Tensar el cuello o la mandíbula"],
        visualType: "deadbug"
      }
    ]
  },
  Martes: {
    day: "Martes",
    title: "Martes: Cardio Fartlek & Agilidad en Parque con Boo",
    duration: 40,
    location: "Al aire libre (Parque)",
    equipment: ["Zapatillas", "Arnés Boo", "Frisbee/Juguete"],
    type: "Cardio Intervalar + Agilidad",
    focus: "Resistencia aeróbica y quema de calorías compartida",
    exercises: [
      {
        id: "martes_calentamiento",
        name: "Paseo Activo de Calentamiento",
        sets: 1,
        reps: "10 min",
        rest: "-",
        equipment: "Zapatillas",
        technique: "Caminata ligera a ritmo vivo mientras Boo olfatea.",
        spinalSafetyNote: "Caminar a ritmo vivo estimula el bombeo de líquido sinovial y nutre los discos intervertebrales por difusión.",
        targetMuscles: ["Sistema Cardiovascular", "Gemelos", "Glúteos"],
        steps: ["Inicia el paseo a ritmo moderado manteniendo la mirada al frente y los hombros relajados."],
        commonMistakes: ["Llevar la cabeza agachada mirando el móvil"],
        visualType: "walking"
      },
      {
        id: "martes_fartlek",
        name: "Fartlek: 1 min trote suave + 2 min caminata (5 Bloques)",
        sets: 5,
        reps: "3 min c/u",
        rest: "En caminata",
        equipment: "Zapatillas + Arnés",
        technique: "Intercala trote suave a ritmo conversacional con caminata rápida.",
        spinalSafetyNote: "El trote debe ser con paso corto y pisada de mediopié para amortiguar el impacto sobre la columna.",
        targetMuscles: ["Capacidad Cardiopulmonar", "Piernas"],
        steps: ["Trote suave y relajado durante 60 segundos.", "Continúa con 120 segundos de caminata rápida recuperadora."],
        commonMistakes: ["Correr dando zancadas demasiado largas talonando fuerte"],
        visualType: "walking"
      },
      {
        id: "martes_stepups",
        name: "Circuito en Banco: Step-ups + Flexiones en banco",
        sets: 3,
        reps: "10 / pierna + 10 flex",
        rest: "45 seg",
        equipment: "Banco de Parque",
        technique: "Carlos y Andrea se turnan mientras Boo realiza 'Sentado/Quieto'.",
        spinalSafetyNote: "El banco elevado permite hacer flexiones con menor palanca, manteniendo la columna 100% recta y sin arqueos.",
        targetMuscles: ["Cuádriceps", "Pectoral", "Core"],
        steps: ["Sube con el talón apoyado en el banco.", "Haz flexiones apoyando las manos en el respaldo o asiento."],
        commonMistakes: ["Dejar caer la cadera en las flexiones"],
        visualType: "step_up"
      },
      {
        id: "martes_estiramientos",
        name: "Estiramientos de Enfriamiento",
        sets: 1,
        reps: "5 min",
        rest: "-",
        equipment: "Esterilla / Banco",
        technique: "Estiramiento de cuádriceps, gemelos e isquios.",
        spinalSafetyNote: "Estira manteniendo la columna erguida, flexionando desde la cadera sin redondear la espalda.",
        targetMuscles: ["Isquiotibiales", "Cuádriceps", "Gemelos"],
        steps: ["Mantén cada estiramiento 25-30 segundos sin rebotes."],
        commonMistakes: ["Rebotar durante el estiramiento"],
        visualType: "stretching"
      }
    ],
    routeDetails: {
      title: "Ruta Fartlek Urbano & Parque con Boo",
      description: "Combina paseo activo con intervalos de trote y paradas de ejercicio funcional mientras Boo canaliza su energía.",
      breakdown: [
        { step: "0 - 10 min", activity: "Paseo de Calentamiento y olfateo libre para Boo." },
        { step: "10 - 25 min", activity: "Fartlek Intervalar: 1 min trote suave + 2 min caminata rápida (5 bloques)." },
        { step: "25 - 35 min", activity: "Circuito en Banco de Parque: Step-ups + Flexiones + Sentadillas mientras Boo realiza 'Sentado/Quieto'." },
        { step: "35 - 40 min", activity: "Paseo de vuelta a casa y estiramientos suaves." }
      ],
      collieTips: "Lleva agua para Boo, un juguete lanzador o Frisbee y premios magros (ej. taquitos de pechuga de pavo)."
    }
  },
  Miércoles: {
    day: "Miércoles",
    title: "Miércoles: Tren Inferior & Core Antilesión 360°",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Banda Elástica", "Silla", "Esterilla"],
    type: "Estabilidad & Tren Inferior",
    focus: "Glúteos, cuádriceps, anti-rotación y faja abdominal McGill",
    exercises: [
      {
        id: "split_squat_asistido",
        name: "Zancadas Estáticas Asistidas (Split Squat)",
        sets: 3,
        reps: "8 - 10 / pierna",
        rest: "60 seg",
        equipment: "Silla / Pared (Apoyo)",
        technique: "Paso largo hacia atrás. Baja la rodilla trasera hacia el suelo manteniendo el torso 100% vertical, apoyando una mano si necesitas equilibrio.",
        spinalSafetyNote: "Aísla el tren inferior de forma unilateral sin ninguna barra sobre los hombros ni impacto. Cero estrés en las hernias dorsales.",
        targetMuscles: ["Cuádriceps", "Glúteos", "Estabilizadores de Cadera"],
        steps: [
          "Colócate de pie junto a una silla o pared para apoyar ligeramente una mano si necesitas equilibrio.",
          "Da un paso amplio hacia atrás con una pierna, apoyando el metatarso con el talón elevado.",
          "Baja verticalmente flexionando ambas rodillas hasta que la rodilla trasera quede a unos centímetros del suelo formando ángulos de 90°.",
          "Empuja con el talón delantero para volver arriba manteniendo el pecho alto y la columna neutra."
        ],
        commonMistakes: ["Inclinarse excesivamente hacia adelante", "Golpear la rodilla trasera contra el suelo", "Dejar que la rodilla delantera sobrepase la punta del pie descontroladamente"],
        visualType: "split_squat"
      },
      {
        id: "press_pallof_banda",
        name: "Press Pallof con Banda Elástica (Anti-Rotación)",
        sets: 3,
        reps: "10 - 12 / lado",
        rest: "45 seg",
        equipment: "Banda Elástica + Puerta",
        technique: "De pie, de perfil a la puerta. Sujeta la banda con ambas manos pegada al esternón y estira los brazos al frente resistiendo que la goma te gire.",
        spinalSafetyNote: "Imprescindible para tu hernia lateral izquierda D10-D11: enseña a los oblicuos y al transverso a frenar las torsiones, eliminando los peligrosos cizallamientos rotacionales.",
        targetMuscles: ["Oblicuos", "Transverso Abdominal", "Cuadrado Lumbar"],
        steps: [
          "Ancla la banda elástica en una puerta a la altura del pecho. Colócate de pie de lado al punto de anclaje.",
          "Agarra la banda con ambas manos entrecruzadas, pégala a tu esternón y da un paso lateral para generar tensión media.",
          "Pies a la anchura de hombros, rodillas semiflexionadas y glúteos activos.",
          "Exhala y empuja los brazos en línea recta hacia adelante, aguantando 2 segundos la fuerza de la goma que intenta girarte.",
          "Inhala y regresa los puños al pecho de forma lenta y controlada."
        ],
        commonMistakes: ["Girar el torso o las caderas hacia el anclaje", "Bloquear la respiración", "Subir los hombros hacia las orejas"],
        visualType: "pallof_press"
      },
      {
        id: "prensa_pectoral_core_ring",
        name: "Prensa Pectoral & Core Isométrica con Ring-Con",
        sets: 3,
        reps: "10 reps (3s compresión)",
        rest: "45 seg",
        equipment: "Ring-Con (Switch)",
        technique: "Sujeta el Ring-Con con ambas manos frente al pecho. Comprime el aro hacia adentro mientras exhalas vaciando el abdomen y activando el transverso.",
        spinalSafetyNote: "La compresión frontal del aro genera una co-activación refleja del abdomen profundo y pectoral sin mover las vértebras dorsales ni comprimir los discos.",
        targetMuscles: ["Pectoral", "Transverso Abdominal", "Deltoides Anterior", "Serrato"],
        steps: [
          "Colócate de pie o sentado erguido, con los hombros relajados hacia atrás y abajo.",
          "Sujeta el Ring-Con horizontal frente a tu pecho apoyando las palmas en las almohadillas laterales.",
          "Exhala lentamente por la boca y aprieta el aro hacia adentro con fuerza, sintiendo cómo se endurece toda la faja abdominal.",
          "Mantén la compresión durante 3 segundos, inhala relajando la presión y repite."
        ],
        commonMistakes: ["Encorvar la espalda al apretar", "Apretar solo con las muñecas en lugar de con el pecho y los brazos", "Perder la postura recta"],
        visualType: "ring_chest_core"
      },
      {
        id: "bird_dog_mcgill",
        name: "Bird-Dog (Perro de Caza con Pausa Isométrica)",
        sets: 3,
        reps: "8 - 10 / lado (3s pausa)",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia, extiende a la vez brazo derecho y pierna izquierda hasta formar una línea recta con el cuerpo. Aguanta 3 segundos arriba.",
        spinalSafetyNote: "Considerado por la biomecánica deportiva mundial (Prof. Stuart McGill) el mejor ejercicio para rehabilitación discal dorsal y lumbar. Compresión discal mínima con máxima activación de multífidos.",
        targetMuscles: ["Multífidos", "Erectores Espinales Dorsales", "Glúteo Mayor", "Deltoides"],
        steps: [
          "Colócate en cuatro apoyos (cuadrupedia) sobre la esterilla: manos debajo de los hombros y rodillas debajo de las caderas.",
          "Mantén la cabeza alineada mirando hacia el suelo (no mires al frente para no forzar cervicales).",
          "Inhala y extiende simultáneamente el brazo derecho hacia adelante y la pierna izquierda hacia atrás, paralelos al suelo.",
          "Aguanta 3 segundos apretando glúteo y core sin arquear la espalda baja, vuelve despacio y repite con el otro lado."
        ],
        commonMistakes: ["Elevar la pierna demasiado alto arqueando las lumbares", "Rotar la cadera hacia un lado", "Mover el cuello hacia arriba"],
        visualType: "bird_dog"
      },
      {
        id: "plancha_lateral_antebrazo",
        name: "Plancha Lateral sobre Antebrazo (Estabilidad Lateral)",
        sets: 3,
        reps: "20 - 30 seg / lado",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Apoya el antebrazo en el suelo y eleva la cadera alineando tobillos, rodillas, cadera y hombro. Si cuesta, apoya las rodillas flexionadas.",
        spinalSafetyNote: "Fortalece el cuadrado lumbar y los oblicuos laterales, vital para sostener la vértebra D10 y proteger la hernia posterolateral izquierda.",
        targetMuscles: ["Cuadrado Lumbar", "Oblicuos", "Glúteo Medio", "Dorsal Ancho"],
        steps: [
          "Túmbate de lado en la esterilla con el codo apoyado directamente debajo del hombro.",
          "Piernas estiradas (o con rodillas dobladas a 90° para variante inicial más suave).",
          "Exhala y eleva la cadera del suelo hasta que tu cuerpo forme una línea recta desde la cabeza hasta los pies.",
          "Mantén la posición respirando tranquilamente sin dejar que la cadera se hunda hacia la esterilla."
        ],
        commonMistakes: ["Dejar caer la cadera hacia el suelo", "Girar los hombros hacia adelante", "Colocar el codo demasiado lejos del hombro"],
        visualType: "side_plank"
      }
    ]
  },
  Jueves: {
    day: "Jueves",
    title: "Jueves: Descanso Activo & Paseo de Olfateo con Boo",
    duration: 30,
    location: "Al aire libre / En casa",
    equipment: ["Esterilla (para movilidad)"],
    type: "Recuperación Activa & Movilidad",
    focus: "Recuperación muscular y movilidad de cadera/espalda",
    exercises: [
      {
        id: "jueves_paseo",
        name: "Paseo Tranquilo de Olfateo con Boo",
        sets: 1,
        reps: "25 min",
        rest: "-",
        equipment: "Zapatillas",
        technique: "Paseo a ritmo suave permitiendo que Boo explore a su aire.",
        spinalSafetyNote: "Disminuye la tensión miofascial y reduce los niveles de cortisol, acelerando la recuperación de los tejidos discales.",
        targetMuscles: ["Sistema Parasimpático", "Articulaciones"],
        steps: ["Camina a ritmo tranquilo sin prisas dejando que el perro olfatee."],
        commonMistakes: ["Dar tirones bruscos de la correa"],
        visualType: "walking"
      },
      {
        id: "jueves_gatovaca",
        name: "Movilidad Columna 'Gato-Vaca' Suave",
        sets: 2,
        reps: "10",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "Moviliza la espalda suavemente para liberar tensión sin forzar los rangos finales.",
        spinalSafetyNote: "Movilización articular sin carga que mejora la hidratación de los discos dorsales y alivia rigideces matutinas.",
        targetMuscles: ["Columna Dorsal y Lumbar", "Fascia Toracolumbar"],
        steps: ["En cuadrupedia, redondea suavemente la columna hacia el techo exhalando.", "Inhala volviendo a posición neutra sin arquear en exceso."],
        commonMistakes: ["Forzar la hiperextensión lumbar o dorsal"],
        visualType: "cat_cow"
      },
      {
        id: "jueves_psoas",
        name: "Estiramiento de Psoas e Isquios",
        sets: 2,
        reps: "30 seg / lado",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "Relaja flexores de cadera tras horas de postura sentado.",
        spinalSafetyNote: "Liberar el psoas ilíaco desactiva la tracción anterior sobre la columna, protegiendo la transición dorso-lumbar.",
        targetMuscles: ["Psoas Ilíaco", "Isquiotibiales"],
        steps: ["En posición de caballero (una rodilla en suelo), adelanta la pelvis manteniendo el tronco erguido."],
        commonMistakes: ["Arquear la espalda hacia atrás en vez de vascular la pelvis"],
        visualType: "stretching"
      }
    ],
    routeDetails: {
      title: "Paseo de Olfateo & Recuperación Activa con Boo",
      description: "Sesión enfocada en la recuperación muscular y estimulación mental sensorial para Boo.",
      breakdown: [
        { step: "0 - 25 min", activity: "Paseo a ritmo libre y pausado. Deja que Boo explore rastros y olfatee a su aire (reduce el estrés canino)." },
        { step: "25 - 30 min", activity: "Vuelta a casa + rutina de movilidad articular (Gato-Vaca y estiramiento de psoas)." }
      ],
      collieTips: "El olfateo activo durante 20-25 min cansa mentalmente a un Border Collie tanto como 1 hora de carrera continua."
    }
  },
  Viernes: {
    day: "Viernes",
    title: "Viernes: Espalda Alta, Postura & Escápulas (Alivio D7-D11)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Banda Elástica", "Silla", "Esterilla"],
    type: "Tonificación Postural & Escápulas",
    focus: "Trapecio inferior, romboides, rotadores externos y tríceps",
    exercises: [
      {
        id: "face_pull_banda",
        name: "Face Pull con Banda Elástica (Alineación Postural)",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Banda Elástica + Puerta",
        technique: "Ancla la banda a la altura de los ojos. Tira hacia la frente separando las manos y abriendo codos hacia afuera.",
        spinalSafetyNote: "El mejor ejercicio para contrarrestar la postura cifótica de oficina. Fortalece el trapecio inferior y rotadores externos, abriendo espacio en D7-D8.",
        targetMuscles: ["Deltoides Posterior", "Trapecio Inferior/Medio", "Manguito Rotador", "Romboides"],
        steps: [
          "Ancla la banda elástica a la altura de los ojos o frente en una puerta.",
          "Agarra los extremos con las palmas mirándose o hacia abajo y da un paso atrás para crear tensión.",
          "Tira de la banda directamente hacia tu frente o nariz, separando las manos y llevando los codos altos y hacia atrás.",
          "Al final del movimiento realiza una suave rotación externa (puños hacia arriba), aguanta 1 segundo y regresa despacio."
        ],
        commonMistakes: ["Tirar hacia el pecho en vez de hacia la frente", "Bajar los codos", "Tirar con impulso de la espalda baja"],
        visualType: "face_pull"
      },
      {
        id: "traccion_w_banda",
        name: "Tracción en 'W' con Banda Elástica (Retracción Escapular Baja)",
        sets: 3,
        reps: "12",
        rest: "45 seg",
        equipment: "Banda Elástica",
        technique: "Sujeta la banda con ambas manos delante del pecho. Tira hacia afuera bajando codos hacia las costillas formando una letra 'W' con los brazos.",
        spinalSafetyNote: "Activa con gran precisión el trapecio inferior y los serratos, estabilizando la escápula sobre la caja torácica sin sobrecarga vertebral.",
        targetMuscles: ["Trapecio Inferior", "Romboides", "Dorsal Ancho"],
        steps: [
          "De pie, con las rodillas suaves y el abdomen activo, sujeta la banda elástica con ambas manos a unos 25 cm de distancia.",
          "Comienza con los brazos semiflexionados frente a ti.",
          "Tira de la banda hacia afuera mientras flexionas los codos y los pegas a los costados, formando una clara letra 'W' con tus brazos.",
          "Junta las escápulas atrás y abajo durante 2 segundos, y regresa inhalando."
        ],
        commonMistakes: ["Subir los hombros hacia el cuello", "Arquear la zona lumbar", "Perder la tensión en la banda"],
        visualType: "w_extension"
      },
      {
        id: "elevaciones_yt_prono",
        name: "Elevaciones en 'Y' y 'T' en Esterilla (Descompresión Dorsal)",
        sets: 3,
        reps: "10 reps en 'Y' + 10 en 'T'",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Tumbado boca abajo en la esterilla, frente apoyada en una toalla. Eleva los brazos en forma de 'Y' y luego en 'T' despegando solo unos centímetros.",
        spinalSafetyNote: "A diferencia del ejercicio 'Superman' (que hiperextiende bruscamente la espalda), las elevaciones 'Y' y 'T' aíslan los músculos escapulares con la columna neutra y la frente apoyada, sin pinzar los discos dorsales.",
        targetMuscles: ["Trapecio Medio e Inferior", "Romboides", "Erectores Dorsales Altos"],
        steps: [
          "Túmbate boca abajo con una pequeña toalla doblada bajo la frente para mantener el cuello neutral.",
          "Coloca los brazos estirados en diagonal formando una 'Y' con los pulgares apuntando al techo.",
          "Sin despegar la frente ni el pecho del suelo, eleva los brazos unos centímetros apretando las escápulas durante 2 segundos.",
          "Baja suavemente. Tras 10 repeticiones, abre los brazos en cruz formando una 'T' y repite otras 10 elevaciones."
        ],
        commonMistakes: ["Levantar la cabeza o el pecho del suelo (forzar lumbares)", "Moverse a tirones", "No orientar los pulgares hacia arriba"],
        visualType: "yt_raises"
      },
      {
        id: "traccion_escapular_ring_v",
        name: "Tracción Escapular Isométrica con Ring-Con",
        sets: 3,
        reps: "10 reps (3s aguante)",
        rest: "45 seg",
        equipment: "Ring-Con (Switch)",
        technique: "Sujeta el aro con ambas manos frente al pecho y tira hacia afuera intentando ensancharlo durante 3 segundos.",
        spinalSafetyNote: "Fortalecimiento isométrico puro de la musculatura periescapular sin ningún impacto ni compresión discal.",
        targetMuscles: ["Romboides", "Deltoides Posterior", "Trapecio Medio"],
        steps: [
          "De pie erguido, sujeta el Ring-Con frente al pecho con codos a 90 grados.",
          "Tira hacia afuera con ambas manos como si intentaras ensanchar el aro.",
          "Mantén 3 segundos la tensión escapular respirando fluido y relaja."
        ],
        commonMistakes: ["Contener la respiración", "Subir los hombros"],
        visualType: "ring_pull"
      },
      {
        id: "fondos_triceps_silla",
        name: "Fondos de Tríceps en Silla Asistidos",
        sets: 3,
        reps: "8 - 10",
        rest: "60 seg",
        equipment: "Silla",
        technique: "Manos apoyadas en el borde de la silla, pies planos en el suelo con rodillas a 90°. Flexiona los codos hacia atrás y empuja con los tríceps.",
        spinalSafetyNote: "Mantén la espalda rozando el borde de la silla para que no se separe el torso. Al tener los pies firmes en el suelo, regulas exactamente cuánto peso levantas.",
        targetMuscles: ["Tríceps", "Deltoides Anterior", "Pectoral Menor"],
        steps: [
          "Siéntate en el borde de una silla sólida y apoya las palmas junto a tus caderas con los dedos hacia adelante.",
          "Adelanta los pies manteniendo las rodillas a 90 grados y los pies totalmente apoyados en el suelo.",
          "Desplaza los glúteos fuera del asiento y flexiona los codos hacia atrás (no hacia afuera) hasta unos 90 grados, manteniendo la espalda muy cerca de la silla.",
          "Exhala y empuja fuerte con las palmas para extender los brazos hasta la posición inicial."
        ],
        commonMistakes: ["Alejar la espalda de la silla hacia adelante", "Abrir los codos en exceso", "Hundir la cabeza entre los hombros"],
        visualType: "chair_dips"
      }
    ]
  },
  Sábado: {
    day: "Sábado",
    title: "Sábado: Senderismo Trail Active & Naturaleza con Boo",
    duration: 60,
    location: "Monte / Vía Verde",
    equipment: ["Zapatillas trail", "Arnés canicross Boo", "Agua"],
    type: "Resistencia Aeróbica en Naturaleza",
    focus: "Gasto calórico elevado, resistencia y diversión con Boo",
    exercises: [
      {
        id: "sabado_marcha",
        name: "Marcha Activa a Ritmo Vivo (5.5 km/h)",
        sets: 1,
        reps: "25 min",
        rest: "-",
        equipment: "Zapatillas Trail",
        technique: "Paso firme apretando glúteos en subidas.",
        spinalSafetyNote: "Caminar por senderos naturales con calzado amortiguado activa la propiocepción pélvica.",
        targetMuscles: ["Glúteos", "Piernas", "Cardiovascular"],
        steps: ["Marcha continua a ritmo enérgico sincronizando el braceo."],
        commonMistakes: ["Cargar mochilas pesadas asimétricas"],
        visualType: "walking"
      },
      {
        id: "sabado_agilidad",
        name: "Parada de Agilidad con Boo + Sentadillas Asistidas",
        sets: 3,
        reps: "12 - 15",
        rest: "60 seg",
        equipment: "Arnés Boo",
        technique: "Mientras Boo hace juegos de buscar el juguete, realizáis sentadillas manteniendo la espalda recta.",
        spinalSafetyNote: "Mantén el pecho erguido y peso en talones.",
        targetMuscles: ["Cuádriceps", "Glúteos"],
        steps: ["Flexiona caderas y rodillas manteniendo el tronco alto."],
        commonMistakes: ["Curvar la espalda al agacharse"],
        visualType: "ring_squat"
      },
      {
        id: "sabado_enfriamiento",
        name: "Caminata de Regreso y Enfriamiento",
        sets: 1,
        reps: "20 min",
        rest: "-",
        equipment: "Zapatillas",
        technique: "Ritmo progresivamente más suave.",
        spinalSafetyNote: "Permite una bajada progresiva de pulsaciones y relajación lumbar.",
        targetMuscles: ["Recuperación Activa"],
        steps: ["Paso tranquilo de vuelta al coche o casa."],
        commonMistakes: ["Parar de golpe en frío"],
        visualType: "walking"
      }
    ],
    routeDetails: {
      title: "Ruta Senderismo Trail Active & Agilidad en Naturaleza",
      description: "Marcha activa con desnivel moderado que quema calorías a ritmo sostenido y ejercita a Boo en su entorno ideal.",
      breakdown: [
        { step: "Fase 1 (20 min)", activity: "Caminata a ritmo vivo (5.5 - 6 km/h) en terreno plano o ligera subida." },
        { step: "Fase 2 (20 min)", activity: "Subida con pasos largos apretando glúteos. Boo en arnés o suelta si el espacio es seguro." },
        { step: "Fase 3 (15 min)", activity: "Parada de descanso activo: Juego de buscar el juguete entre arbustos (estimulación mental Collie) + Sentadillas." },
        { step: "Fase 4 (Regreso)", activity: "Bajada a ritmo tranquilo para soltar piernas." }
      ],
      collieTips: "Usa un arnés ergonómico tipo correa de cintura (canicross) para poder caminar o trotar con las manos libres de forma cómoda."
    }
  },
  Domingo: {
    day: "Domingo",
    title: "Domingo: Descanso Total & Regeneración",
    duration: 20,
    location: "En casa",
    equipment: ["Ninguno"],
    type: "Descanso y Recuperación",
    focus: "Recarga de energía para la nueva semana",
    exercises: [
      {
        id: "domingo_paseo",
        name: "Paseo Libre en Familia con Boo",
        sets: 1,
        reps: "Libre",
        rest: "-",
        equipment: "Correa",
        technique: "Disfrutad del día sin exigencia física.",
        spinalSafetyNote: "Paseo regenerativo sin tensión que promueve la oxigenación de tejidos musculares.",
        targetMuscles: ["Bienestar General"],
        steps: ["Paseo relajado sin métricas ni exigencias."],
        commonMistakes: ["Comenzar actividades explosivas sin calentamiento"],
        visualType: "walking"
      },
      {
        id: "domingo_masaje",
        name: "Masaje de Soltado / Estiramientos Suaves",
        sets: 1,
        reps: "10 min",
        rest: "-",
        equipment: "Esterilla",
        technique: "Masajea suavemente muslos y espalda para soltar rigidez.",
        spinalSafetyNote: "Evita presiones directas y fuertes sobre las vértebras dorsales D7-D11; masajea los costados musculares.",
        targetMuscles: ["Músculos Paravertebrales", "Fascias"],
        steps: ["Aplica respiración diafragmática profunda mientras liberas tensiones."],
        commonMistakes: ["Apretar con fuerza sobre la columna vertebral"],
        visualType: "stretching"
      }
    ],
    routeDetails: {
      title: "Paseo Libre en Familia con Boo",
      description: "Paseo recreativo en parque o zona verde sin exigencia física intensa.",
      breakdown: [
        { step: "Libre", activity: "Disfrutad del paseo a vuestro ritmo en familia con Boo, dejando espacio para juegos sencillos o descanso." }
      ],
      collieTips: "Aprovecha para reforzar comandos de obediencia básica de forma lúdica y positiva."
    }
  }
};

export const BOO_TRAINING_MODULES = [
  {
    id: "ansiedad_pelota",
    title: "Gestión de Ansiedad & Autocontrol con Pelota",
    category: "Autocontrol Emocional",
    icon: "fa-solid fa-baseball",
    badgeColor: "var(--accent-amber)",
    difficulty: "Intermedio",
    duration: "10-15 min/día",
    summary: "Aprender a gestionar la frustración y fijación cuando ve una pelota, manteniendo la calma antes de liberarla.",
    steps: [
      "Pelota estática en la mano a la altura del pecho. Si Boo se abalanza o ladra, la pelota se oculta inmediatamente a la espalda.",
      "Pedir orden de 'Sentado' y 'Quieto' a 2 metros de distancia antes de mostrar el estímulo.",
      "Recompensar el contacto visual y la respiración pausada (cuerpo relajado) con voz firme y suave ('Muy bien, quieto').",
      "Lanzar o rodar la pelota ÚNICAMENTE tras dar la palabra de liberación ('¡Ya!' / 'Ok').",
      "Si sale corriendo sin permiso, interceptar la pelota con el pie y reiniciar la secuencia en calma."
    ],
    proTip: "Los Border Collie tienen un impulso de persecución muy alto. El secreto no es prohibir la pelota, sino enseñarle que la calma es la única llave que abre el juego."
  },
  {
    id: "paseo_junto",
    title: "Paseo Junto & Atención Voluntaria ('Mírame')",
    category: "Enfoque en Guías",
    icon: "fa-solid fa-eye",
    badgeColor: "var(--accent-cyan)",
    difficulty: "Básico - Continuo",
    duration: "Durante todo el paseo",
    summary: "Conseguir que Boo camine más cerca de Carlos y Andrea, manteniendo contacto visual espontáneo y estando pendiente.",
    steps: [
      "Marcar voluntariedad: Cada vez que Boo se gire a mirar al guía espontáneamente durante el paseo, decir '¡Muy bien!' y entregar un premio pequeño junto a la pierna.",
      "Cambios de dirección impredecibles: Cuando Boo se adelante, dar media vuelta sin tirones. Al seguirnos y ponerse a la par, premiar de inmediato.",
      "Ejercicio 'Mírame' en estático: Sostener un premio en la mano, llevarlo a los ojos del guía y al hacer contacto visual, premiar inmediatamente.",
      "Caminar con correa floja en ritmo variado (acelerar, frenar, parar) manteniendo la atención de Boo."
    ],
    proTip: "Premia siempre al lado de tu muslo. Así Boo asociará que la 'zona de recompensa mágica' está justo a vuestro lado."
  },
  {
    id: "llamada_positiva",
    title: "Refuerzo Positivo de la Llamada ('Fin del Paseo Feliz')",
    category: "Obediencia y Vínculo",
    icon: "fa-solid fa-bullhorn",
    badgeColor: "var(--accent-emerald)",
    difficulty: "Crucial",
    duration: "8 - 10 repeticiones por paseo",
    summary: "Desacoplar la idea de que la llamada significa el fin de la diversión. A Boo no le gusta que termine el paseo, por lo que debemos negativizar esa asociación.",
    steps: [
      "Regla del 80/20: Realizar 8 de cada 10 llamadas durante el paseo solo para premiar con súper chuches y SOLTARLA DE NUEVO a jugar inmediatamente.",
      "Técnica 'Engancha y Suelta': Llamar a Boo ('¡Boo, aquí!'), enganchar la correa 5 segundos mientras come un premio de alto valor (pavo, queso) y volver a soltarla con alegría.",
      "Nunca llamar a Boo para regañarle o únicamente al final cuando hay que irse al coche/casa.",
      "Llamada de Final de Paseo (El Jackpot): Cuando sea la llamada definitiva para volver a casa, entregar un 'Jackpot' (3-4 premios seguidos súper ricos) y caminar jugando hacia casa."
    ],
    proTip: "Si Boo intuye que ser llamada equivale a perder su libertad, aprenderá a ignorarte. Haz que venir hacia ti sea el momento más divertido del paseo."
  },
  {
    id: "paseo_relajado",
    title: "Caminar Tranquila Atada (Sin Tirones)",
    category: "Paseo Estructurado",
    icon: "fa-solid fa-dog",
    badgeColor: "var(--accent-purple)",
    difficulty: "Progresivo",
    duration: "15-20 min/día",
    summary: "Enseñar a Boo a caminar atada con la correa destensada en forma de 'U', reduciendo la excitación al salir a la calle.",
    steps: [
      "Técnica de la Estatua: Si la correa se prensa un solo milímetro, el guía se detiene en seco. Sin gritar ni dar tirones hacia atrás.",
      "Esperar la destensión: Mantenerse firme hasta que Boo dé medio paso atrás, mire o afloje la correa por sí misma.",
      "Avanzar al aflojar: En cuanto la correa vuelva a estar en curva ('U'), reanudar la marcha inmediatamente como premio.",
      "Usar arnés ergonómico de tiro en Y (nunca collar que oprima el cuello) para un paseo cómodo y seguro."
    ],
    proTip: "La correa es un hilo de comunicación, no de control físico. La constancia de parar cada vez que hay tensión es la clave absoluta."
  }
];

export const BOO_WEEKLY_SCHEDULE = {
  Lunes: {
    day: "Lunes",
    theme: "Autocontrol Emocional & Correa Relajada",
    focusTitle: "Lunes: Autocontrol Emocional & Correa Relajada",
    focusText: "Gestión de impulsos con pelota y técnicas de paseo en calma sin tirones",
    tasks: [
      { id: "b_lun_1", module: "ansiedad_pelota", title: "Autocontrol con Pelota", text: "10 min de espera y quieto con pelota antes del lanzamiento", detail: "10 min de espera y quieto con pelota antes del lanzamiento (orden de liberación '¡Ya!')", duration: "10 min" },
      { id: "b_lun_2", module: "paseo_relajado", title: "Paseo Sin Tirones (Técnica Estatua)", text: "Paseo con técnica de estatua (parar al sentir tensión en correa)", detail: "20 min de paseo deteniéndose al sentir tensión y avanzando con correa floja en 'U'", duration: "20 min" },
      { id: "b_lun_3", module: "llamada_positiva", title: "Refuerzo Positivo de Llamada", text: "5 llamadas intermedias durante el paseo con premio y soltado inmediato", detail: "5 llamadas intermedias durante el paseo con premio de alto valor y soltado inmediato", duration: "Paseo" }
    ]
  },
  Martes: {
    day: "Martes",
    theme: "Agilidad en Parque & Refuerzo de Llamada",
    focusTitle: "Martes: Agilidad en Parque & Refuerzo de Llamada",
    focusText: "Entrenamiento dinámico en parque combinando llamadas de control y atención voluntaria",
    tasks: [
      { id: "b_mar_1", module: "llamada_positiva", title: "Engancha, Premia y Suelta", text: "8 llamadas de control con 'Engancha, premia y suelta' en el parque", detail: "8 llamadas de control con 'Engancha, premia y suelta' durante el tiempo de parque", duration: "15 min" },
      { id: "b_mar_2", module: "paseo_junto", title: "Paseo con Cambios de Ritmo ('Mírame')", text: "Paseo en parque practicando 'Mírame' con cambios de ritmo", detail: "Paseo en parque practicando contacto visual espontáneo con aceleraciones y frenadas", duration: "20 min" },
      { id: "b_mar_3", module: "ansiedad_pelota", title: "Juego de Pelota/Frisbee con Liberación", text: "Juego de Frisbee/Pelota solo bajo orden de liberación ('¡Ya!')", detail: "Lanzamiento de frisbee/pelota solo tras orden '¡Ya!' y tras mantener el quieto en calma", duration: "10 min" }
    ]
  },
  Miércoles: {
    day: "Miércoles",
    theme: "Contacto Visual Voluntario & Caminata Junto",
    focusTitle: "Miércoles: Contacto Visual Voluntario & Caminata Junto",
    focusText: "Enfoque en guías durante entorno urbano y reducción de estímulos externos",
    tasks: [
      { id: "b_mie_1", module: "paseo_junto", title: "Contacto Visual Espontáneo", text: "Premiar 15 contactos visuales espontáneos durante el paseo urbano", detail: "Premiar 15 contactos visuales voluntarios de Boo durante el recorrido urbano", duration: "20 min" },
      { id: "b_mie_2", module: "ansiedad_pelota", title: "Autocontrol y Desconexión", text: "Sesión de autocontrol: guardar pelota tras la espalda si hay excitación", detail: "Sesión de autocontrol: guardar la pelota tras la espalda si aparece sobreexcitación", duration: "10 min" },
      { id: "b_mie_3", module: "paseo_relajado", title: "Giros de 180º sin Tirones", text: "Práctica de giros de 180º en calle tranquila", detail: "Práctica de giros de 180º en calle tranquila para mantener a Boo pendiente de la dirección", duration: "15 min" }
    ]
  },
  Jueves: {
    day: "Jueves",
    theme: "Paseo de Olfateo Calmo & Llamadas de Juego",
    focusTitle: "Jueves: Paseo de Olfateo Calmo & Llamadas de Juego",
    focusText: "Reducción de cortisol mediante olfateo libre y asociación positiva de fin de paseo",
    tasks: [
      { id: "b_jue_1", module: "paseo_relajado", title: "Paseo de Olfateo de Descompresión", text: "Paseo largo de olfateo libre a ritmo pausado (reducción de cortisol)", detail: "Paseo largo de olfateo libre a ritmo pausado con correa de 3m (reduce el estrés canino)", duration: "25 min" },
      { id: "b_jue_2", module: "llamada_positiva", title: "Llamada Jackpot al Cierre", text: "Llamada con premio 'Jackpot' de pavo al finalizar el paseo", detail: "Llamada final con premio especial 'Jackpot' de pavo al concluir el paseo", duration: "5 min" },
      { id: "b_jue_3", module: "paseo_junto", title: "Posición 'Junto' al Muslo", text: "Refuerzo de posición 'Junto' a la altura del muslo", detail: "Refuerzo positivo de la posición pegada a la pierna con entrega de premio en el muslo", duration: "10 min" }
    ]
  },
  Viernes: {
    day: "Viernes",
    theme: "Circuito de Calma & Desconexión de Pelota",
    focusTitle: "Viernes: Circuito de Calma & Desconexión de Pelota",
    focusText: "Ejercicios de calma con distractores y paseo con correa destensada en U",
    tasks: [
      { id: "b_vie_1", module: "ansiedad_pelota", title: "Semáforo de la Pelota", text: "Semáforo de pelota: Sentado -> Botar pelota -> Liberación calmada", detail: "Sentado -> Botar pelota suavemente en el suelo -> Liberación serena a la orden '¡Ya!'", duration: "15 min" },
      { id: "b_vie_2", module: "paseo_relajado", title: "Correa Floja en U", text: "Paseo atada practicando correa floja en forma de U", detail: "Paseo atada manteniendo la curva en U en la correa en todo momento", duration: "20 min" },
      { id: "b_vie_3", module: "llamada_positiva", title: "Llamadas de Prueba", text: "6 llamadas de prueba sin cierre de paseo", detail: "6 llamadas intermedias premiadas y liberadas inmediatamente para seguir jugando", duration: "Paseo" }
    ]
  },
  Sábado: {
    day: "Sábado",
    theme: "Trail / Monte & Llamada en Distracción Real",
    focusTitle: "Sábado: Trail/Monte & Llamada en Distracción Real",
    focusText: "Respuesta a la llamada en entorno natural con olores intensos y sendero compartido",
    tasks: [
      { id: "b_sab_1", module: "llamada_positiva", title: "Llamada con Alta Distracción", text: "Práctica de llamada de retorno con alta distracción en el monte", detail: "Práctica de llamada de retorno con olores y estímulos naturales en el monte", duration: "25 min" },
      { id: "b_sab_2", module: "paseo_junto", title: "Caminata Junto en Tramos Estrechos", text: "Caminata al lado en tramos estrechos del sendero", detail: "Caminar al lado en senderos estrechos coordinando el paso con arnés de canicross", duration: "20 min" },
      { id: "b_sab_3", module: "ansiedad_pelota", title: "Búsqueda de Pelota en Hierba Alta", text: "Juego de buscar la pelota en hierba alta (olfateo + autocontrol)", detail: "Juegos de olfato y cobro en vegetación estimulando la mente de Border Collie", duration: "15 min" }
    ]
  },
  Domingo: {
    day: "Domingo",
    theme: "Paseo en Familia & Vínculo Positivo",
    focusTitle: "Domingo: Paseo en Familia & Vínculo Positivo",
    focusText: "Sesión lúdica y relajante en familia fortaleciendo el vínculo emocional",
    tasks: [
      { id: "b_dom_1", module: "llamada_positiva", title: "Llamadas Cruzadas en Familia", text: "Llamadas lúdicas compartidas entre Carlos y Andrea", detail: "Llamadas lúdicas alternadas entre Carlos y Andrea premiando la llegada con entusiasmo", duration: "15 min" },
      { id: "b_dom_2", module: "paseo_relajado", title: "Paseo Libre y Regenerativo", text: "Paseo relajado sin prisas disfrutando de la naturaleza", detail: "Paseo relajado sin exigencias disfrutando del entorno y permitiendo libre exploración", duration: "25 min" },
      { id: "b_dom_3", module: "ansiedad_pelota", title: "Masaje de Relajación Canina", text: "Masaje de relajación y soltado de tensión tras los paseos", detail: "Masaje de soltado muscular y caricias suaves en el lomo y pecho tras la caminata", duration: "10 min" }
    ]
  }
};

export const BOO_CONTINUOUS_REINFORCEMENT = [
  {
    id: "cont_mirame",
    title: "Contacto Visual Voluntario ('Mírame')",
    icon: "fa-solid fa-eye",
    color: "var(--accent-cyan)",
    desc: "Premiar cada vez que Boo se gire a mirar a Carlos o Andrea espontáneamente durante el paseo.",
    detail: "Premiar cada vez que Boo se gire a mirar a Carlos o Andrea espontáneamente durante el paseo.",
    tip: "Entregar siempre el premio junto al muslo para reforzar la zona de paseo pegada al guía."
  },
  {
    id: "cont_correa",
    title: "Caminar Relajada con Correa Floja (Sin Tirones)",
    icon: "fa-solid fa-dog",
    color: "var(--accent-purple)",
    desc: "Técnica de la estatua: Parar en seco al sentir tensión en la correa. Avanzar solo cuando la correa cuelga en curva ('U').",
    detail: "Técnica de la estatua: Parar en seco al sentir tensión en la correa. Avanzar solo cuando la correa cuelga en curva ('U').",
    tip: "No dar tirones hacia atrás. Mantenerse firme como un árbol enseña a Boo a buscar la flojedad por sí misma."
  },
  {
    id: "cont_llamada",
    title: "Refuerzo Positivo de la Llamada (Engancha, Premia y Suelta)",
    icon: "fa-solid fa-bullhorn",
    color: "var(--accent-emerald)",
    desc: "Realizar 8 de cada 10 llamadas durante el paseo para dar una súper chuche, enganchar 5s y SOLTARLA A JUGAR de nuevo.",
    detail: "Realizar 8 de cada 10 llamadas durante el paseo para dar una súper chuche, enganchar 5s y SOLTARLA A JUGAR de nuevo.",
    tip: "Nunca llamar solo para regañar o únicamente al terminar el paseo. Asociar la llamada a fiesta y libertad."
  }
];

export const BOO_TRICKS_BACKLOG = [
  {
    id: "trick_pelota_autocontrol",
    title: "Gestión de Ansiedad con Pelota (Autocontrol)",
    category: "selfcontrol",
    difficulty: "Intermedio",
    icon: "fa-solid fa-baseball",
    badgeColor: "var(--accent-amber)",
    summary: "Aprender a esperar en calma antes de ir a por la pelota tras la orden de liberación ('¡Ya!').",
    desc: "Aprender a esperar en calma antes de ir a por la pelota tras la orden de liberación ('¡Ya!').",
    steps: [
      "Mostrar pelota estática a la altura del pecho. Si Boo salta o ladra, ocultarla tras la espalda.",
      "Pedir 'Sentado' + 'Quieto' a 2 metros de distancia.",
      "Recompensar mirada serena y cuerpo relajado.",
      "Lanzar pelota SOLO tras dar la señal de liberación ('¡Ya!')."
    ],
    proTip: "La calma es la única llave que abre el juego de la pelota para un Border Collie."
  },
  {
    id: "trick_dar_pata",
    title: "Dar las dos patas (Izquierda y Derecha)",
    category: "agility",
    difficulty: "Fácil",
    icon: "fa-solid fa-paw",
    badgeColor: "var(--accent-cyan)",
    summary: "Enseñar a Boo a dar la pata izquierda ('Pata') y la derecha ('La otra').",
    desc: "Enseñar a Boo a dar la pata izquierda ('Pata') y la derecha ('La otra').",
    steps: [
      "Con Boo sentada, mostrar premio en el puño cerrado a la altura de su pecho.",
      "Esperar a que toque la mano con la pata. En cuanto la toque, decir '¡Muy bien!' y abrir la mano.",
      "Añadir la orden vocal según la pata levantada."
    ],
    proTip: "Muy útil para limpiar las patas tras paseos por la montaña o con barro de forma tranquila."
  },
  {
    id: "trick_tumbado_distancia",
    title: "Tumbado a Distancia con Señal de Mano",
    category: "selfcontrol",
    difficulty: "Intermedio",
    icon: "fa-solid fa-hand",
    badgeColor: "var(--accent-emerald)",
    summary: "Conseguir que Boo se tumbe al ver la mano extendida hacia abajo desde 3-5 metros.",
    desc: "Conseguir que Boo se tumbe al ver la mano extendida hacia abajo desde 3-5 metros.",
    steps: [
      "Practicar orden 'Plaza/Tumbado' de cerca acompañando con movimiento llano de mano.",
      "Dar medio paso atrás antes de hacer la señal visual.",
      "Premiar la velocidad de respuesta en la bajada."
    ],
    proTip: "Fundamental para detener a Boo a distancia en parques o senderos antes de cruzar un paso."
  },
  {
    id: "trick_giro_360",
    title: "Giro 360º sobre sí misma ('Spin')",
    category: "agility",
    difficulty: "Fácil",
    icon: "fa-solid fa-rotate-right",
    badgeColor: "var(--accent-purple)",
    summary: "Girar un círculo completo hacia la derecha ('Gira') y hacia la izquierda ('Twist').",
    desc: "Girar un círculo completo hacia la derecha ('Gira') y hacia la izquierda ('Twist').",
    steps: [
      "Guiar el hocico de Boo con un premio haciendo un círculo completo a su alrededor.",
      "Marcar '¡Muy bien!' al completar el giro y entregar premio.",
      "Ir reduciendo el gesto de la mano hasta usar solo la punta del dedo."
    ],
    proTip: "Excelente ejercicio de calentamiento para las articulaciones de Boo antes de correr."
  },
  {
    id: "trick_slalom_piernas",
    title: "Caminar entre las piernas (Slalom en marcha)",
    category: "agility",
    difficulty: "Intermedio",
    icon: "fa-solid fa-person-walking",
    badgeColor: "var(--accent-rose)",
    summary: "Pasar en forma de 8 entre las piernas de Carlos o Andrea mientras caminan.",
    desc: "Pasar en forma de 8 entre las piernas de Carlos o Andrea mientras caminan.",
    steps: [
      "Dar un paso adelante con la pierna derecha y guiar a Boo a pasar por debajo con premio.",
      "Dar un paso con la pierna izquierda y guiar el siguiente cruce.",
      "Añadir la palabra 'Pasa' o 'Slalom'."
    ],
    proTip: "Mejora la coordinación y fortalece la confianza de Boo trabajando pegada al cuerpo."
  },
  {
    id: "trick_traer_soltar",
    title: "Traer objeto y entregar en la mano",
    category: "mental",
    difficulty: "Intermedio",
    icon: "fa-solid fa-hand-holding-heart",
    badgeColor: "var(--accent-amber)",
    summary: "Entregar el juguete suavemente en la palma abierta en lugar de soltarlo en el suelo.",
    desc: "Entregar el juguete suavemente en la palma abierta en lugar de soltarlo en el suelo.",
    steps: [
      "Colocar la palma abierta bajo su barbilla cuando regresa con el objeto.",
      "Decir 'Dame' o 'Suelta' intercambiando por un premio de alto valor.",
      "Premiar solo el contacto del objeto con la palma de la mano."
    ],
    proTip: "Evita la persecución infructuosa y hace las sesiones de juego mucho más organizadas."
  },
  {
    id: "trick_targeting_nariz",
    title: "Tocar diana (Targeting con el hocico)",
    category: "mental",
    difficulty: "Fácil",
    icon: "fa-solid fa-bullseye",
    badgeColor: "var(--accent-cyan)",
    summary: "Tocar la palma de la mano o un objetivo específico con la trufa.",
    desc: "Tocar la palma de la mano o un objetivo específico con la trufa.",
    steps: [
      "Presentar la palma abierta a 5 cm del hocico.",
      "Por curiosidad Boo la olerá. En cuanto toque con la nariz, marcar '¡Toca!' y premiar.",
      "Mover la mano a diferentes alturas y posiciones."
    ],
    proTip: "Base excelente para guiar a Boo a su cama o subir al coche sin tirones."
  },
  {
    id: "trick_rodar",
    title: "Hacerse la muerta / Rodar ('Roll over')",
    category: "advanced",
    difficulty: "Avanzado",
    icon: "fa-solid fa-arrows-spin",
    badgeColor: "var(--accent-emerald)",
    summary: "Desde la posición tumbada, girar sobre la espalda hasta volver a quedar tumbada.",
    desc: "Desde la posición tumbada, girar sobre la espalda hasta volver a quedar tumbada.",
    steps: [
      "Con Boo tumbada, guiar el premio desde la nariz hacia su hombro para que incline el cuerpo.",
      "Continuar el movimiento de la mano sobre su lomo obligándola a dar la vuelta.",
      "Premiar el giro completo."
    ],
    proTip: "Practicar sobre esterilla suave para que esté cómoda al apoyar la zona lumbar."
  }
];

if (typeof window !== 'undefined') {
  window.INITIAL_PROFILES = INITIAL_PROFILES;
  window.RECIPES_DATABASE = RECIPES_DATABASE;
  window.WEEKLY_WORKOUT_SCHEDULE = WEEKLY_WORKOUT_SCHEDULE;
  window.INGREDIENT_CATEGORIES = INGREDIENT_CATEGORIES;
  window.BOO_TRAINING_MODULES = BOO_TRAINING_MODULES;
  window.BOO_WEEKLY_SCHEDULE = BOO_WEEKLY_SCHEDULE;
  window.BOO_CONTINUOUS_REINFORCEMENT = BOO_CONTINUOUS_REINFORCEMENT;
  window.BOO_TRICKS_BACKLOG = BOO_TRICKS_BACKLOG;
}
