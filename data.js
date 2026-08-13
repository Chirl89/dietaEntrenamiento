// FitDuo & Collie Coach - Database

export const INITIAL_PROFILES = {
  he: {
    id: "he",
    name: "Él (Carlos)",
    height: 182,
    weight: 78,
    activityLevel: 1.2, // Sedentario / 10 años sin hacer ejercicio
    goal: "recomp", // Recomposición corporal: Perder grasa y ganar músculo progresivamente
    experience: "beginner",
    equipment: ["bodyweight", "chair", "mat", "light_bands"],
    targetCalories: 2150,
    protein: 155, // g
    carbs: 210, // g
    fats: 65, // g
    notes: "Adaptación progresiva después de 10 años. Enfoque en postura, movilidad y fuerza básica sin sobrecargar articulaciones."
  },
  she: {
    id: "she",
    name: "Ella (Andrea)",
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
    notes: "Tonificación general, mejora de resistencia cardio con la Border Collie (Boo) y trabajo de core/glúteos."
  },
  dog: {
    name: "Boo (Border Collie)",
    breed: "Border Collie",
    age: 3,
    energyLevel: "Alta (Requiere estimular cuerpo y mente)",
    dailyWalkMinutes: 75,
    favoriteActivities: ["Frisbee", "Trail running", "Fartlek de parque", "Juegos de agilidad con obstáculos urbanos"]
  }
};

export const INGREDIENT_CATEGORIES = {
  PROTEIN: "Proteínas y Carnes/Pescados",
  PRODUCE: "Frutas y Verduras",
  DAIRY: "Lácteos y Huevos",
  GRAINS: "Cereales y Tubérculos",
  FATS: "Aceites, Frutos Secos y Semillas",
  PANTRY: "Despensa y Especias"
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
      { name: "Claras de huevo", amount: 150, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Huevo entero", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Plátano", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Arándanos frescos", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra", amount: 3, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
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
      { name: "Pan de centeno/masa madre integral", amount: 70, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Huevos frescos", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Aguacate maduro", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Tomate en rodajas", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Semillas de chía o sésamo", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Sal de escamas y pimienta negra", amount: 1, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
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
      { name: "Yogur Griego 0% o Natural", amount: 220, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Proteína de suero (opcional) o Requesón", amount: 20, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Frutos rojos variados (fresas, frambuesas)", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Nueces picadas", amount: 20, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Semillas de lino molido", amount: 10, unit: "g", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Mezcla en un bowl el yogur griego con la proteína/requesón hasta tener una crema homogénea.",
      "Añade los frutos rojos, las nueces picadas y las semillas de lino.",
      "Listo para consumir inmediatamente."
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
      { name: "Quinoa cocida", amount: 160, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Calabacín en dados", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Pimiento rojo y verde", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Zanahoria picada", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra", amount: 10, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Orégano, ajo en polvo y sal", amount: 2, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
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
      { name: "Boniato/Camote troceado", amount: 180, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Brócoli en floretes", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Romero, tomillo y limón", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.PANTRY }
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
      { name: "Lentejas cocidas de bote (aclaradas)", amount: 200, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Atún claro al natural", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Queso Feta o Burgos desnatado", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Aguacate en cubos", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Tomates cherry", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Pepino picado", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Vinagre de manzana y AOVE", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
    ],
    instructions: [
      "Aclara y escurre bien las lentejas cocidas.",
      "En un bol grande, mezcla las lentejas, el atún desmenuzado, los tomates cherry por la mitad, el pepino y el aguacate.",
      "Desmenuza el queso feta por encima.",
      "Aliña con una cucharadita de AOVE, vinagre de manzana, sal y orégano."
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
      { name: "Gambas peladas (frescas o descongeladas)", amount: 130, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Espárragos verdes trigueros", amount: 120, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Huevos enteros", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Claras de huevo", amount: 100, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Diente de ajo laminado", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra", amount: 8, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
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
    name: "Hamburguesa Casera de Pavo y Espinacas con Ensalada Mixta y Patata al Microondas",
    type: "cena",
    prepTime: 18,
    calories: 430,
    protein: 40,
    carbs: 36,
    fats: 12,
    tags: ["plato estrella", "proteína magra"],
    ingredients: [
      { name: "Carne picada de pavo/pollo 100%", amount: 170, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Espinacas frescas picadas", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Patata mediana", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Hoja de lechuga, cebolla y tomate", amount: 100, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra", amount: 6, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
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
    name: "Tacos de Merluza/Bacalao al Horno con Guacamole Casero y Pico de Gallo",
    type: "cena",
    prepTime: 20,
    calories: 410,
    protein: 36,
    carbs: 32,
    fats: 14,
    tags: ["delicioso", "pescado blanco", "fácil"],
    ingredients: [
      { name: "Lomo de merluza o bacalao desmigado", amount: 180, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Tortillas integrales de maíz/trigo", amount: 2, unit: "ud", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Aguacate machacado", amount: 40, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
      { name: "Tomate y cebolla fina (pico de gallo)", amount: 80, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Cilantro fresco y lima", amount: 5, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE }
    ],
    instructions: [
      "Cocina la merluza sazonada al horno o en sartén antiadherente durante 8 minutos. Desmígala.",
      "Templa las tortillas en una sartén seca unos segundos por lado.",
      "Monta cada tortilla con una base de aguacate, el pescado desmigado y el pico de gallo.",
      "Añade gotas de lima fresca y cilantro por encima."
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
      { name: "Manzana grande", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Mantequilla de cacahuete pura 100%", amount: 18, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
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
      { name: "Queso fresco batido 0% o Requesón", amount: 150, unit: "g", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Almendras crudas o tostadas sin sal", amount: 15, unit: "g", category: INGREDIENT_CATEGORIES.FATS },
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
      { name: "Plátano maduro", amount: 1, unit: "ud", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Proteína de suero o queso 0%", amount: 25, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Leche o bebida vegetal sin azúcar", amount: 200, unit: "ml", category: INGREDIENT_CATEGORIES.DAIRY },
      { name: "Copos de avena", amount: 20, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS }
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
      { name: "Pan integral de masa madre", amount: 45, unit: "g", category: INGREDIENT_CATEGORIES.GRAINS },
      { name: "Pechuga de pavo 90%+", amount: 60, unit: "g", category: INGREDIENT_CATEGORIES.PROTEIN },
      { name: "Tomate en rodajas", amount: 50, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE },
      { name: "Aceite de oliva virgen extra", amount: 3, unit: "ml", category: INGREDIENT_CATEGORIES.FATS }
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
      { name: "Arándanos o frambuesas", amount: 30, unit: "g", category: INGREDIENT_CATEGORIES.PRODUCE }
    ],
    instructions: [
      "Unta la mantequilla de almendra sobre las tortitas.",
      "Decora con los frutos rojos frescos por encima."
    ]
  }
];

export const WEEKLY_WORKOUT_SCHEDULE = {
  Lunes: {
    day: "Lunes",
    title: "Lunes: Fuerza Cuerpo Completo (Carlos & Andrea Juntos)",
    duration: 35,
    location: "En casa",
    equipment: ["Silla", "Esterilla", "Banda elástica (opcional)"],
    type: "Acondicionamiento Total",
    focus: "Postura, movilidad articular y fuerza base",
    exercises: [
      { name: "Sentadilla Asistida con Silla", sets: 3, reps: "10 - 12", rest: "60 seg", technique: "Mantén el pecho erguido. Toca el asiento con el glúteo sin dejarte caer y sube apretando talones." },
      { name: "Flexiones Inclinadas en Pared o Sofá", sets: 3, reps: "8 - 12", rest: "60 seg", technique: "Cuerpo alineado como una tabla. Codos a 45 grados respecto al torso." },
      { name: "Remo con Banda o Toalla en Puerta", sets: 3, reps: "12 - 15", rest: "45 seg", technique: "Tira llevando codos hacia atrás y junta escápulas. Clave para postura de escritorio." },
      { name: "Puente de Glúteo en Suelo", sets: 3, reps: "12 - 15", rest: "45 seg", technique: "Eleva la cadera activando glúteos 2 segundos arriba antes de bajar." },
      { name: "Plancha Abdominal Modificada", sets: 3, reps: "25 - 30 seg", rest: "45 seg", technique: "Activa el abdomen como si fueras a recibir un empujón." }
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
      { name: "Paseo Activo de Calentamiento", sets: 1, reps: "10 min", rest: "-", technique: "Caminata ligera a ritmo vivo mientras Boo olfatea." },
      { name: "Fartlek: 1 min trote + 2 min caminata (5 Bloques)", sets: 5, reps: "3 min c/u", rest: "En caminata", technique: "Intercala trote suave a ritmo conversacional con caminata rápida." },
      { name: "Circuito en Banco: Step-ups + Flexiones en banco", sets: 3, reps: "10/pierna + 10 flex", rest: "45 seg", technique: "Carlos y Andrea se turnan mientras Boo realiza 'Sentado/Quieto'." },
      { name: "Estiramientos de Enfriamiento", sets: 1, reps: "5 min", rest: "-", technique: "Estiramiento de cuádriceps, gemelos e isquios." }
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
    title: "Miércoles: Tren Inferior, Glúteos y Core Profundo",
    duration: 35,
    location: "En casa",
    equipment: ["Esterilla", "Botellas de agua / Mancuernas ligeras"],
    type: "Tonificación Piernas y Glúteos",
    focus: "Glúteos, cuádriceps, isquios y abdomen profundo",
    exercises: [
      { name: "Zancadas Estáticas Alternadas", sets: 3, reps: "8 - 10 / pierna", rest: "60 seg", technique: "Paso largo hacia atrás. La rodilla trasera baja formando 90º." },
      { name: "Peso Muerto Rumano con Pesos/Banda", sets: 3, reps: "12", rest: "60 seg", technique: "Lleva cadera atrás, espalda recta. Siente el estiramiento en isquios." },
      { name: "Monster Walk con Banda en Tobillos", sets: 3, reps: "12 pasos / lado", rest: "45 seg", technique: "En media sentadilla, camina lateralmente manteniendo tensión." },
      { name: "Bird-Dog (Perro de Caza)", sets: 3, reps: "10 / lado", rest: "45 seg", technique: "En cuadrupedia, extiende brazo derecho y pierna izquierda alinear con el tronco." },
      { name: "Bicicleta Abdominal Controlada", sets: 3, reps: "12 alternadas", rest: "45 seg", technique: "Movimiento lento. Lleva codo hacia rodilla contraria sin tirar del cuello." }
    ]
  },
  Jueves: {
    day: "Jueves",
    title: "Jueves: Descanso Activo & Paseo de Olfateo con Boo",
    duration: 30,
    location: "Al aire libre / En casa",
    equipment: ["Esterilla (para estiramientos)"],
    type: "Recuperación Activa & Movilidad",
    focus: "Recuperación muscular y movilidad de cadera/espalda",
    exercises: [
      { name: "Paseo Tranquilo de Olfateo con Boo", sets: 1, reps: "25 min", rest: "-", technique: "Paseo a ritmo suave permitiendo que Boo explore a su aire." },
      { name: "Movilidad Columna 'Gato-Vaca'", sets: 2, reps: "10 repeticiones", rest: "30 seg", technique: "Moviliza la espalda suavemente para liberar tensión." },
      { name: "Estiramiento de Psoas e Isquios", sets: 2, reps: "30 seg / lado", rest: "30 seg", technique: "Relaja flexores de cadera tras horas de postura sentado." }
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
    title: "Viernes: Tren Superior & Tonificación Postural",
    duration: 35,
    location: "En casa",
    equipment: ["Bandas elásticas", "Silla"],
    type: "Espalda, Hombros y Tríceps",
    focus: "Hombros, espalda erguida, tríceps y postura",
    exercises: [
      { name: "Press de Hombros con Banda / Pesos", sets: 3, reps: "12", rest: "45 seg", technique: "Empuja el peso desde la altura de las orejas hacia el techo." },
      { name: "Face Pulls con Banda Elástica", sets: 3, reps: "15", rest: "45 seg", technique: "Tira de la banda hacia la cara abriendo codos hacia afuera." },
      { name: "Fondos de Tríceps en Silla", sets: 3, reps: "8 - 10", rest: "60 seg", technique: "Flexiona codos a 90º hacia atrás y empuja para subir." },
      { name: "Superman para Cadena Posterior", sets: 3, reps: "10 (2s arriba)", rest: "45 seg", technique: "Despega ligeramente pecho y muslos del suelo sintiendo activación." },
      { name: "Plancha Lateral Modificada", sets: 3, reps: "15-20s / lado", rest: "45 seg", technique: "Apoya antebrazo y rodilla inferior alineando el tronco." }
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
      { name: "Marcha Activa a Ritmo Vivo (5.5 km/h)", sets: 1, reps: "25 min", rest: "-", technique: "Paso firme apretando glúteos en subidas." },
      { name: "Parada de Agilidad con Boo + Sentadillas", sets: 3, reps: "15 sentadillas", rest: "60 seg", technique: "Mientras Boo hace juegos de buscar el juguete, realizáis sentadillas y flexiones." },
      { name: "Caminata de Regreso y Enfriamiento", sets: 1, reps: "20 min", rest: "-", technique: "Ritmo progresivamente más suave." }
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
      { name: "Paseo Libre en Familia con Boo", sets: 1, reps: "Libre", rest: "-", technique: "Disfrutad del día sin exigencia física." },
      { name: "Masaje de Soltado / Estiramientos suaves", sets: 1, reps: "10 min", rest: "-", technique: "Masajea suavemente muslos y espalda para soltar rigidez." }
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
