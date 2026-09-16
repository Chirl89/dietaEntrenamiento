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
    equipment: ["bodyweight", "mat", "ring_con_switch"],
    targetCalories: 2150,
    protein: 155, // g
    carbs: 210, // g
    fats: 65, // g
    moveGoal: 600, // kcal objetivo anillo movimiento
    exerciseGoal: 30, // min objetivo anillo ejercicio
    stepsGoal: 10000, // pasos objetivo anillo de pasos/de pie
    notes: "Rehabilitación e hipertrofia segura (RM: hernias dorsales D7-D8 y D10-D11 con deshidratación discal). Equipamiento: Únicamente Esterilla y Ring-Con Switch (sin bandas ni sillas). Cero carga axial en columna, columna neutra, faja core 360° y retracción escapular sin impacto."
  },
  she: {
    id: "she",
    name: "Andrea",
    height: 172,
    weight: 63,
    activityLevel: 1.35, // Moderadamente activa / paseos
    goal: "recomp", // Tonificar y ganar fuerza
    experience: "intermediate_light",
    equipment: ["bodyweight", "mat", "ring_con_switch"],
    targetCalories: 1850,
    protein: 130, // g
    carbs: 180, // g
    fats: 55, // g
    moveGoal: 500, // kcal objetivo anillo movimiento
    exerciseGoal: 30, // min objetivo anillo ejercicio
    stepsGoal: 10000, // pasos objetivo anillo de pasos/de pie
    notes: "Tonificación general, mejora de resistencia cardio con la Border Collie (Boo) y trabajo de core/glúteos con Esterilla y Ring-Con."
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

export const RECIPES_DATABASE = [];

export const CARLOS_WORKOUT_SCHEDULE = {
  Lunes: {
    day: "Lunes",
    title: "Lunes: Fuerza Base & Cadena Posterior Segura (Carlos)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Rehabilitación & Hipertrofia Segura",
    focus: "Postura erguida, retracción escapular y core profundo sin carga axial",
    exercises: [
      {
        id: "sentadilla_ring_con",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-squat.gif",
        name: "Sentadilla Libre con Contrapeso de Ring-Con",
        sets: 3,
        reps: "10 - 12",
        rest: "60 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De pie sobre la esterilla, sujeta el Ring-Con extendido horizontalmente al frente mientras realizas una sentadilla controlada. Activa cuádriceps y glúteos manteniendo el torso recto.",
        spinalSafetyNote: "Sujetar el Ring-Con extendido al frente crea un contrapeso reflejo que erige la caja torácica e impide flexionar la espalda dorsal, reduciendo a cero la presión sobre los discos D7-D8 y D10-D11 sin necesidad de soporte externo.",
        targetMuscles: ["Cuádriceps", "Glúteos", "Erectores Espinales", "Core"],
        steps: [
          "Colócate de pie sobre la esterilla con los pies a la anchura de hombros y puntas ligeramente hacia afuera.",
          "Sujeta el Ring-Con con ambas manos y extiéndelo horizontalmente al frente a la altura del esternón.",
          "Inhala, empuja la cadera hacia atrás y flexiona las rodillas bajando con control manteniendo el pecho alto y la columna neutra.",
          "Exhala y empuja fuerte contra el suelo a través de los talones para volver arriba, manteniendo el Ring-Con firme al frente."
        ],
        commonMistakes: ["Bajar los brazos perdiendo la línea del Ring-Con", "Meter las rodillas hacia adentro", "Despegar los talones del suelo"],
        visualType: "ring_squat"
      },
      {
        id: "remo_isometrico_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/resistance-band-seated-straight-back-row.gif",
        name: "Remo Escapular Isométrico con Ring-Con en Esterilla",
        sets: 3,
        reps: "10 - 12 (3s contracción)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sentado erguido en la esterilla con piernas cómodas, sujeta el Ring-Con con codos flexionados pegados a los costados. Tracciona hacia afuera y junta fuerte las escápulas 3 segundos.",
        spinalSafetyNote: "Al realizar la tracción isométrica sobre la esterilla sin bandas elásticas, fortaleces el dorsal ancho y los romboides con máxima estabilidad y cero compresión axial sobre D7-D8.",
        targetMuscles: ["Dorsal Ancho", "Romboides", "Trapecio Medio", "Bíceps"],
        steps: [
          "Siéntate con la espalda erguida sobre la esterilla con piernas flexionadas o cruzadas y hombros relajados abajo.",
          "Agarra los laterales del Ring-Con frente a tu ombligo con codos flexionados y pegados a las costillas.",
          "Exhala y tira con fuerza de las manos hacia afuera ensanchando el aro, llevando los codos atrás y juntando escápulas como si atraparas una moneda entre los omóplatos.",
          "Mantén la contracción máxima durante 3 segundos respirando continuo, y relaja despacio inhalando."
        ],
        commonMistakes: ["Encoger los hombros hacia las orejas", "Balancear el torso hacia atrás", "Separar los codos excesivamente"],
        visualType: "ring_pull"
      },
      {
        id: "traccion_escapular_ring",
        name: "Tracción Escapular Isométrica con Ring-Con",
        sets: 3,
        reps: "8 - 10 (3s aguante)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sujeta el aro frente al pecho e intenta tirar hacia afuera separándolo. Aguanta 3 segundos de tensión máxima apretando omóplatos.",
        spinalSafetyNote: "La contracción isométrica pura activa los romboides y trapecio inferior sin mover la articulación vertebral. Es el ejercicio más seguro para despertar la espalda dorsal debilitada.",
        targetMuscles: ["Romboides", "Trapecio Medio/Inferior", "Deltoides Posterior"],
        steps: [
          "Colócate de pie o sentado erguido sobre la esterilla con la espalda completamente alargada.",
          "Agarra los agarres acolchados del Ring-Con por dentro o firme por los laterales frente a tu pecho, codos a 90°.",
          "Tira hacia afuera con ambas manos como si quisieras ensanchar el aro, apretando las escápulas hacia abajo y atrás.",
          "Mantén la tensión continua durante 3 segundos respirando con normalidad, luego relaja 2 segundos antes de la siguiente repetición."
        ],
        commonMistakes: ["Aguantar la respiración en apnea", "Elevar los hombros", "Curvar la zona dorsal"],
        visualType: "ring_pull"
      },
      {
        id: "puente_gluteo_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-hip-lift.gif",
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
        id: "deadbug_ring_con",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/dead-bug.gif",
        name: "Deadbug McGill con Presión de Ring-Con",
        sets: 3,
        reps: "8 - 10 alternadas (2s pausa)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Tumbado en la esterilla, sujeta el Ring-Con entre las manos hacia el techo mientras extiendes alternadamente pierna y brazo opuestos con la columna neutra pegada al suelo.",
        spinalSafetyNote: "La contra-tensión del Ring-Con activa la faja abdominal profunda (transverso) en descarga articular absoluta para D7-D8 y D10-D11. Cero flexión cervical ni dorsal.",
        targetMuscles: ["Transverso Abdominal", "Oblicuos", "Coordinación Core"],
        steps: [
          "Túmbate boca arriba en la esterilla con el Ring-Con sostenido con ambas manos frente al pecho y rodillas flexionadas a 90 grados.",
          "Pega toda la espalda al suelo, activando el abdomen como si cerraras una cremallera.",
          "Inhala y baja lentamente una pierna hacia adelante rozando el suelo mientras mantienes el Ring-Con firme y estable.",
          "Exhala activando el ombligo hacia dentro para regresar al centro. Alterna con la pierna opuesta sin despegar la espalda del suelo."
        ],
        commonMistakes: ["Arquear la espalda y separarla del suelo", "Moverse rápido por inercia", "Tensar el cuello o la mandíbula"],
        visualType: "deadbug"
      }
    ]
  },
  Martes: {
    day: "Martes",
    title: "Martes: Movilidad Torácica Sin Torsión, Serratos & Core Profundo (Carlos)",
    duration: 35,
    location: "En casa + Paseo suave con Boo",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Rehabilitación Discal & Core Profundo",
    focus: "Rehidratación de discos D7-D11 a 0 gravedad, serratos anteriores y faja core McGill",
    exercises: [
      {
        id: "martes_gatovaca_discal",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/spine/spine-stretch.gif",
        name: "Gato-Vaca Controlado de Rehidratación Discal en Esterilla",
        sets: 3,
        reps: "10 lentas",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia sobre la esterilla con columna neutra. Moviliza la zona dorsal de forma suave y sin forzar los topes articulares al ritmo de la respiración.",
        spinalSafetyNote: "La movilización suave a 0 gravedad bombea líquido sinovial y nutre los discos deshidratados D7-D8 por difusión, aliviando la rigidez matutina.",
        targetMuscles: ["Columna Dorsal", "Erectores Espinales", "Fascia Toracolumbar"],
        steps: [
          "Colócate en cuatro apoyos sobre la esterilla con manos bajo hombros y rodillas bajo caderas.",
          "Inhala suavemente manteniendo la cabeza alineada y permitiendo una ligera extensión dorsal sin arquear las lumbares.",
          "Exhala empujando la esterilla con las manos, redondeando suavemente la parte media de la espalda hacia el techo y metiendo el ombligo.",
          "Fluye de forma lenta y rítmica sin rebotes ni tirones."
        ],
        commonMistakes: ["Hiperextender bruscamente la columna", "Dejar caer la cabeza forzando las cervicales"],
        visualType: "cat_cow"
      },
      {
        id: "martes_halo_ring",
        name: "Corona / Halo Escapular Isométrico con Ring-Con",
        sets: 3,
        reps: "8 - 10 / lado",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De rodillas en la esterilla, sujeta el Ring-Con con ambas manos sobre la cabeza. Dibuja círculos controlados alrededor de la coronilla manteniendo el torso y la pelvis completamente fijos.",
        spinalSafetyNote: "Activa los serratos anteriores y trapecio inferior sin torsión vertebral, estabilizando la cintura escapular para proteger D7-D8.",
        targetMuscles: ["Serrato Anterior", "Trapecio Inferior", "Core Anti-Rotación", "Deltoides"],
        steps: [
          "Ponte de rodillas sobre la esterilla con la pelvis neutra y glúteos activos.",
          "Eleva el Ring-Con sobre la cabeza con codos ligeramente flexionados.",
          "Realiza círculos lentos alrededor de la cabeza manteniendo una ligera compresión en el aro.",
          "El torso debe permanecer como un bloque sólido sin balancearse ni rotar."
        ],
        commonMistakes: ["Balancear el torso o las caderas", "Arquear la zona lumbar", "Perder la firmeza en el abdomen"],
        visualType: "ring_pull"
      },
      {
        id: "martes_birddog_isometria",
        name: "Bird-Dog McGill con Pausa Isométrica de 4 Segundos",
        sets: 3,
        reps: "6 - 8 / lado (4s pausa)",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia, extiende simultáneamente brazo derecho al frente y pierna izquierda atrás hasta formar una línea recta. Sostén 4 segundos apretando glúteo.",
        spinalSafetyNote: "Pilar fundamental del método del Dr. Stuart McGill: activa los multífidos que rodean D7-D11 con la menor presión discal calculada biomecánicamente.",
        targetMuscles: ["Multífidos", "Erectores Espinales", "Glúteo Mayor", "Deltoides"],
        steps: [
          "Cuadrupedia sobre la esterilla con mirada fija entre tus manos.",
          "Extiende brazo y pierna opuestos paralelos al suelo sin elevarlos por encima de la cadera.",
          "Aguanta la contracción isométrica durante 4 segundos completos respirando con calma.",
          "Vuelve al punto inicial sin tocar el suelo bruscamente y cambia de lado."
        ],
        commonMistakes: ["Arquear la espalda lumbar", "Rotar la cadera hacia un lado"],
        visualType: "bird_dog"
      },
      {
        id: "martes_plancha_antebrazo_corta",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/bodyweight-incline-side-plank.gif",
        name: "Plancha Frontal Corta McGill (Bloqueos de 10s en Esterilla)",
        sets: 3,
        reps: "3 bloqueos de 10s por serie",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Apoya los antebrazos y las rodillas en la esterilla. Contrae glúteos y transverso abdominal al máximo durante 10 segundos continuos, descansa 3 segundos y repite.",
        spinalSafetyNote: "Las contracciones cortas de 10 s evitan la fatiga muscular que induce colapso postural sobre las hernias D7-D11, aumentando la resistencia del core de forma segura.",
        targetMuscles: ["Transverso Abdominal", "Recto Abdominal", "Glúteos", "Serratos"],
        steps: [
          "Túmbate prono sobre la esterilla y apoya los codos bajo los hombros y las rodillas en el suelo.",
          "Eleva el torso alineando rodillas, cadera y hombros formando una línea recta.",
          "Aprieta con fuerza el abdomen como si fueras a recibir un impacto y sostén 10 segundos.",
          "Baja a la esterilla 3 segundos para relajar y realiza otros dos bloqueos."
        ],
        commonMistakes: ["Hundir la cadera hacia la esterilla", "Contener la respiración en apnea"],
        visualType: "side_plank"
      },
      {
        id: "martes_paseo_boo_suave",
        name: "Paseo Suave Terapéutico con Boo (Sin Trote de Impacto)",
        sets: 1,
        reps: "25 - 30 min",
        rest: "-",
        equipment: "Zapatillas + Arnés Boo",
        technique: "Caminata continua a paso tranquilo y amortiguado dejando que Boo explore rastros. Sin carreras ni saltos para proteger los discos.",
        spinalSafetyNote: "Sustituye al fartlek/trote durante la fase dolorosa: caminar a ritmo regular sin impacto estimula la circulación y nutre los discos sin microtraumatismos.",
        targetMuscles: ["Sistema Cardiovascular", "Gemelos", "Glúteos"],
        steps: [
          "Camina a paso cómodo y firme manteniendo la postura erguida y mirada al frente.",
          "Deja que Boo olfatee libremente para su estimulación mental canina.",
          "Mantén los brazos relajados y bracea suavemente."
        ],
        commonMistakes: ["Dar zancadas excesivamente largas talonando fuerte"],
        visualType: "walking"
      }
    ],
    routeDetails: {
      title: "Paseo Suave Terapéutico & Rehabilitación en Parque con Boo",
      description: "Combina paseo suave en terreno llano para favorecer la difusión discal sin impactos con descanso de olfateo para Boo.",
      breakdown: [
        { step: "0 - 15 min", activity: "Paseo a paso tranquilo en terreno llano. Boo olfatea a su ritmo." },
        { step: "15 - 25 min", activity: "Caminata suave de retorno manteniendo la postura erguida sin cargar peso." },
        { step: "25 - 35 min", activity: "Llegada a casa y ejecución de los ejercicios de movilidad y core en esterilla." }
      ],
      collieTips: "Durante fases de dolor de Carlos, sustituir lanzamientos explosivos de pelota por juegos de búsqueda olfativa pausada."
    }
  },
  Miércoles: {
    day: "Miércoles",
    title: "Miércoles: Tren Inferior & Core Antilesión 360°",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Estabilidad & Tren Inferior",
    focus: "Glúteos, cuádriceps, anti-rotación y faja abdominal McGill",
    exercises: [
      {
        id: "split_squat_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/band-single-leg-split-squat.gif",
        name: "Zancada Estática (Split Squat) con Contrapeso de Ring-Con",
        sets: 3,
        reps: "8 - 10 / pierna",
        rest: "60 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sobre la esterilla, da un paso amplio atrás. Sujeta el Ring-Con extendido al frente a la altura del esternón como timón de equilibrio. Baja flexionando ambas rodillas a 90° con el torso 100% vertical.",
        spinalSafetyNote: "Aísla el tren inferior de forma unilateral. El Ring-Con al frente crea un contrapeso reflejo que erige el torso, anulando el estrés en las hernias dorsales D7-D11 sin necesidad de apoyos externos.",
        targetMuscles: ["Cuádriceps", "Glúteos", "Estabilizadores de Cadera", "Core"],
        steps: [
          "Colócate de pie sobre la esterilla sujetando el Ring-Con con ambas manos frente al pecho.",
          "Da un paso amplio hacia atrás con una pierna, apoyando el metatarso con el talón elevado.",
          "Baja verticalmente flexionando ambas rodillas hasta que la rodilla trasera quede a un par de centímetros de la esterilla formando ángulos de 90°.",
          "Empuja con el talón delantero para volver arriba manteniendo el Ring-Con firme al frente y la columna neutra."
        ],
        commonMistakes: ["Inclinarse excesivamente hacia adelante", "Golpear la rodilla trasera contra la esterilla", "Dejar que la rodilla delantera sobrepase la punta del pie descontroladamente"],
        visualType: "split_squat"
      },
      {
        id: "press_antirotacion_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/band-horizontal-pallof-press.gif",
        name: "Press Anti-Rotación Isométrico con Ring-Con en Esterilla",
        sets: 3,
        reps: "10 - 12 / lado (3s contracción)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "En la esterilla, de rodillas o en posición de caballero, extiende el Ring-Con al frente. Comprime el aro aplicando una fuerza anti-rotación isométrica continua, impidiendo cualquier torsión de torso.",
        spinalSafetyNote: "Imprescindible para tu hernia lateral izquierda D10-D11: enseña a los oblicuos y al transverso a frenar las fuerzas de torsión sin cizallamiento vertebral ni bandas elásticas.",
        targetMuscles: ["Oblicuos", "Transverso Abdominal", "Cuadrado Lumbar", "Serratos"],
        steps: [
          "Colócate de rodillas erguido o en posición de zancada/caballero sobre la esterilla.",
          "Sujeta el Ring-Con con ambas manos extendido al frente a la altura del esternón.",
          "Exhala y comprime el aro firmemente mientras activas la faja abdominal 360°, resistiendo cualquier oscilación lateral durante 3 segundos.",
          "Inhala relajando la presión y repite manteniendo la pelvis y hombros perfectamente alineados."
        ],
        commonMistakes: ["Girar el torso o las caderas", "Bloquear la respiración", "Subir los hombros hacia las orejas"],
        visualType: "ring_chest_core"
      },
      {
        id: "prensa_pectoral_core_ring",
        name: "Prensa Pectoral & Core Isométrica con Ring-Con",
        sets: 3,
        reps: "10 reps (3s compresión)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sujeta el Ring-Con con ambas manos frente al pecho. Comprime el aro hacia adentro mientras exhalas vaciando el abdomen y activando el transverso.",
        spinalSafetyNote: "La compresión frontal del aro genera una co-activación refleja del abdomen profundo y pectoral sin mover las vértebras dorsales ni comprimir los discos.",
        targetMuscles: ["Pectoral", "Transverso Abdominal", "Deltoides Anterior", "Serrato"],
        steps: [
          "Colócate de pie o sentado erguido sobre la esterilla, con los hombros relajados hacia atrás y abajo.",
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
        technique: "En cuadrupedia sobre la esterilla, extiende a la vez brazo derecho y pierna izquierda hasta formar una línea recta con el cuerpo. Aguanta 3 segundos arriba.",
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
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/bodyweight-incline-side-plank.gif",
        name: "Plancha Lateral sobre Antebrazo (Estabilidad Lateral)",
        sets: 3,
        reps: "20 - 30 seg / lado",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Apoya el antebrazo en la esterilla y eleva la cadera alineando tobillos, rodillas, cadera y hombro. Si cuesta, apoya las rodillas flexionadas.",
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
    title: "Jueves: Espalda Media, Trapecio Inferior & Descompresión Dorsal (Carlos)",
    duration: 35,
    location: "En casa + Paseo regenerativo",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Rehabilitación Postural & Descompresión",
    focus: "Apertura torácica, descompresión de discos D7-D11 y fortalecimiento de romboides",
    exercises: [
      {
        id: "jueves_elevaciones_yt",
        name: "Elevaciones Escapulares en 'Y' y 'T' en Esterilla",
        sets: 3,
        reps: "8 en 'Y' + 8 en 'T'",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Tumbado boca abajo en la esterilla con la frente apoyada en una toalla. Eleva los brazos unos centímetros con pulgares al techo apretando escápulas.",
        spinalSafetyNote: "A diferencia del hiperextensor Superman, aísla el trapecio inferior y romboides con columna neutra, abriendo espacio en D7-D8 sin pellizco discal.",
        targetMuscles: ["Trapecio Inferior", "Romboides", "Deltoides Posterior"],
        steps: [
          "Túmbate boca abajo con cuello neutro y frente en la toalla doblada.",
          "Brazos en diagonal a 45° formando una 'Y' con pulgares hacia arriba.",
          "Eleva los brazos 5 cm del suelo apretando las escápulas atrás y abajo 2 segundos.",
          "Tras 8 repeticiones, abre los brazos en cruz formando una 'T' y completa otras 8."
        ],
        commonMistakes: ["Levantar el pecho o la cabeza del suelo", "Dar tirones rápidos"],
        visualType: "yt_raises"
      },
      {
        id: "jueves_traccion_w_ring",
        name: "Tracción en 'W' Isométrica con Ring-Con",
        sets: 3,
        reps: "8 - 10 (3s aguante)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De pie o de rodillas en la esterilla, flexiona los codos hacia las costillas en forma de 'W' mientras traccionas el aro hacia afuera.",
        spinalSafetyNote: "Fija y deprime la escápula sobre la parrilla costal, activando serratos y trapecio inferior con cero compresión vertical.",
        targetMuscles: ["Trapecio Inferior", "Romboides", "Dorsal Ancho"],
        steps: [
          "Colócate sobre la esterilla con postura erguida.",
          "Sujeta el Ring-Con con ambas manos frente al pecho.",
          "Tracciona hacia afuera mientras bajas los codos pegándolos a las costillas en forma de 'W'.",
          "Aguanta 3 segundos apretando los omóplatos y relaja despacio."
        ],
        commonMistakes: ["Encoger los hombros hacia arriba", "Arquear la zona lumbar"],
        visualType: "ring_pull"
      },
      {
        id: "jueves_descompresion_mcgill",
        name: "Descompresión Axial Supina & Respiración 360° McGill",
        sets: 3,
        reps: "5 respiraciones profundas (3 min)",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "Tumbado boca arriba en la esterilla con rodillas flexionadas a 90° apoyadas en el suelo. Inhala expandiendo las costillas en 360° y exhala vaciando el abdomen.",
        spinalSafetyNote: "La respiración diafragmática 360° en descarga total genera micro-descompresión de los discos intervertebrales y disminuye la reactividad nerviosa.",
        targetMuscles: ["Diafragma", "Transverso Abdominal", "Músculos Paravertebrales"],
        steps: [
          "Túmbate boca arriba en la esterilla con toda la espalda plana contra el suelo.",
          "Coloca una mano en el abdomen y otra en las costillas laterales.",
          "Inhala lentamente por la nariz sintiendo cómo se expanden las costillas hacia los lados y la espalda contra el suelo.",
          "Exhala despacio por la boca sintiendo cómo se libera la tensión en las vértebras dorsales."
        ],
        commonMistakes: ["Respirar inflando solo el pecho", "Arquear la espalda al inhalar"],
        visualType: "deadbug"
      },
      {
        id: "jueves_estiramiento_psoas",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/spine/spine-stretch.gif",
        name: "Estiramiento de Psoas en Posición de Caballero",
        sets: 2,
        reps: "30 seg / lado",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "En posición de zancada en el suelo con una rodilla apoyada, bascula la pelvis hacia atrás y adelanta suavemente la cadera manteniendo el tronco erguido.",
        spinalSafetyNote: "Liberar la tensión del psoas ilíaco desactiva el tirón anterior sobre la unión dorso-lumbar D10-D11, aliviando la compresión posterior.",
        targetMuscles: ["Psoas Ilíaco", "Isquiotibiales"],
        steps: [
          "Da un paso adelante en la esterilla y apoya la rodilla trasera en el suelo.",
          "Activa el glúteo de la pierna trasera y lleva la pelvis en retroversión (ombligo adentro).",
          "Desplaza suavemente la cadera hacia adelante hasta notar estiramiento suave en la parte frontal de la cadera trasera.",
          "Respira continuo sin arquear la espalda baja."
        ],
        commonMistakes: ["Arquear la espalda hacia atrás en vez de bascular la pelvis"],
        visualType: "stretching"
      },
      {
        id: "jueves_paseo",
        name: "Paseo Tranquilo de Olfateo & Desconexión con Boo",
        sets: 1,
        reps: "25 min",
        rest: "-",
        equipment: "Zapatillas + Correa Boo",
        technique: "Paseo regenerativo a paso libre sin exigencias físicas mientras Boo olfatea.",
        spinalSafetyNote: "Disminuye el cortisol y favorece la nutrición discal pasiva sin generar impacto articular.",
        targetMuscles: ["Sistema Parasimpático", "Articulaciones"],
        steps: ["Camina a ritmo tranquilo sin prisas dejando que el perro olfatee."],
        commonMistakes: ["Dar tirones bruscos de la correa"],
        visualType: "walking"
      }
    ],
    routeDetails: {
      title: "Paseo de Olfateo & Descompresión con Boo",
      description: "Sesión enfocada en la recuperación muscular y estimulación mental sensorial para Boo combinada con ejercicios posturales.",
      breakdown: [
        { step: "0 - 20 min", activity: "Paseo a ritmo libre y pausado. Deja que Boo explore rastros y olfatee a su aire (reduce el estrés canino)." },
        { step: "20 - 35 min", activity: "Vuelta a casa + rutina completa de descompresión dorsal (Y-T prono, W con Ring-Con y respiración McGill)." }
      ],
      collieTips: "El olfateo activo durante 20-25 min cansa mentalmente a un Border Collie tanto como 1 hora de carrera continua."
    }
  },
  Viernes: {
    day: "Viernes",
    title: "Viernes: Espalda Alta, Postura & Escápulas (Alivio D7-D11)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Tonificación Postural & Escápulas",
    focus: "Trapecio inferior, romboides, rotadores externos y tríceps",
    exercises: [
      {
        id: "face_pull_isometrico_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/band-standing-rear-delt-row.gif",
        name: "Face Pull Isométrico / Corona Escapular con Ring-Con",
        sets: 3,
        reps: "10 - 12 (3s contracción)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De pie o de rodillas en la esterilla, eleva el Ring-Con a la altura de la frente con los codos abiertos a 90°. Tira fuertemente de las manos hacia afuera ensanchando el aro y juntando los omóplatos con rotación externa de hombros.",
        spinalSafetyNote: "Sustituye a la perfección el face pull con goma: fortalece el trapecio inferior, romboides y manguito rotador sin tirones asimétricos, abriendo la cifosis dorsal y aliviando D7-D8.",
        targetMuscles: ["Deltoides Posterior", "Trapecio Inferior/Medio", "Manguito Rotador", "Romboides"],
        steps: [
          "Colócate de pie o de rodillas erguido sobre la esterilla con el abdomen activo.",
          "Eleva el Ring-Con con ambas manos a la altura de tu frente o vista, con los codos flexionados.",
          "Exhala y realiza una tracción isométrica continua hacia afuera ensanchando el aro, llevando los codos hacia atrás y juntando escápulas.",
          "Aguanta 3 segundos de contracción máxima periescapular y relaja inhalando despacio."
        ],
        commonMistakes: ["Bajar los codos al pecho", "Echar el cuello hacia adelante", "Arquear las lumbares"],
        visualType: "ring_pull"
      },
      {
        id: "traccion_w_ring",
        name: "Tracción en 'W' Isométrica con Ring-Con",
        sets: 3,
        reps: "10 - 12 (3s aguante)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sujeta el Ring-Con con ambas manos frente al pecho. Baja los codos pegándolos a las costillas para formar una 'W' con los brazos, traccionando el aro hacia afuera y clavando las escápulas hacia abajo.",
        spinalSafetyNote: "Fija y deprime la escápula sobre la parrilla costal, activando serratos y trapecio inferior con cero compresión vertical.",
        targetMuscles: ["Trapecio Inferior", "Romboides", "Dorsal Ancho", "Serrato"],
        steps: [
          "De pie sobre la esterilla con rodillas semiflexionadas y faja core activada.",
          "Sujeta el Ring-Con a la altura de las clavículas y tira de las manos hacia afuera mientras bajas los codos a las costillas.",
          "Forma una 'W' con tus brazos, apretando los omóplatos hacia abajo y atrás durante 3 segundos.",
          "Vuelve controladamente a la posición inicial inhalando."
        ],
        commonMistakes: ["Encoger los hombros hacia arriba", "Arquear la espalda lumbar", "Perder la contracción en los omóplatos"],
        visualType: "ring_pull"
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
        equipment: "Ring-Con + Esterilla",
        technique: "Sujeta el aro con ambas manos frente al pecho y tira hacia afuera intentando ensancharlo durante 3 segundos.",
        spinalSafetyNote: "Fortalecimiento isométrico puro de la musculatura periescapular sin ningún impacto ni compresión discal.",
        targetMuscles: ["Romboides", "Deltoides Posterior", "Trapecio Medio"],
        steps: [
          "De pie erguido sobre la esterilla, sujeta el Ring-Con frente al pecho con codos a 90 grados.",
          "Tira hacia afuera con ambas manos como si intentaras ensanchar el aro.",
          "Mantén 3 segundos la tensión escapular respirando fluido y relaja."
        ],
        commonMistakes: ["Contener la respiración", "Subir los hombros"],
        visualType: "ring_pull"
      },
      {
        id: "prensa_triceps_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/bench-dip-on-floor.gif",
        name: "Prensa & Extensión de Tríceps con Ring-Con en Esterilla",
        sets: 3,
        reps: "10 - 12 (3s compresión)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sentado erguido o de rodillas en la esterilla, sujeta el Ring-Con frente al pecho o junto a las caderas con codos flexionados a 90°. Comprime el aro firmemente hacia adentro activando tríceps y estabilizadores escapulares.",
        spinalSafetyNote: "Elimina la excesiva hiperextensión anterior de hombro que provocan los fondos de silla. Cero compresión en columna, trabajo limpio y seguro de tríceps.",
        targetMuscles: ["Tríceps Braquial", "Deltoides Posterior", "Estabilizadores Escapulares"],
        steps: [
          "Siéntate erguido sobre la esterilla con la columna alineada y abdomen activo.",
          "Coloca las palmas de las manos en los agarres del Ring-Con frente al pecho con codos flexionados y pegados a los costados.",
          "Exhala y comprime el aro firmemente hacia adentro concentrando el esfuerzo en los tríceps.",
          "Mantén la compresión durante 3 segundos respirando continuo, y relaja despacio."
        ],
        commonMistakes: ["Encorvar la espalda al apretar", "Subir los hombros", "Contener la respiración"],
        visualType: "ring_chest_core"
      }
    ]
  },
  Sábado: {
    day: "Sábado",
    title: "Sábado: Estabilidad Global Funcional & Glúteos Fuertes (Protección Lumbo-Dorsal)",
    duration: 40,
    location: "En casa + Marcha natural con Boo",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Fuerza Funcional & Estabilidad",
    focus: "Refuerzo pélvico, glúteos protectores, anti-rotación y marcha activa sin impactos",
    exercises: [
      {
        id: "sabado_sentadilla_isometrica_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-squat.gif",
        name: "Sentadilla Isométrica en Esterilla con Contrapeso Ring-Con",
        sets: 3,
        reps: "8 - 10 reps (3s pausa abajo)",
        rest: "60 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Desciende en sentadilla controlada sobre la esterilla con el Ring-Con extendido al frente. Sostén 3 segundos abajo con el torso erguido antes de subir.",
        spinalSafetyNote: "La pausa isométrica elimina el efecto rebote y activa cuádriceps y glúteos con la columna torácica perfectamente alineada y cero carga axial.",
        targetMuscles: ["Cuádriceps", "Glúteo Mayor", "Core", "Erectores Espinales"],
        steps: [
          "Pies a la anchura de hombros sobre la esterilla y Ring-Con extendido al frente a la altura del pecho.",
          "Inhala y baja flexionando rodillas y caderas hasta la posición paralela.",
          "Mantén la posición 3 segundos respirando continuo con el Ring-Con firme.",
          "Exhala y empuja fuerte con los talones para extender caderas y rodillas."
        ],
        commonMistakes: ["Bajar los brazos perdiendo la línea del Ring-Con", "Despegar los talones del suelo"],
        visualType: "ring_squat"
      },
      {
        id: "sabado_press_antirotacion",
        name: "Press Anti-Rotación de Rodillas con Ring-Con",
        sets: 3,
        reps: "8 - 10 / lado (3s compresión)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De rodillas sobre la esterilla, sujeta el Ring-Con extendido al frente. Comprime el aro aplicando resistencia contra cualquier balanceo o giro del torso.",
        spinalSafetyNote: "Protección crucial para la hernia posterolateral D10-D11: enseña a la faja abdominal a bloquear torsiones que desgastan los discos.",
        targetMuscles: ["Oblicuos", "Transverso Abdominal", "Cuadrado Lumbar"],
        steps: [
          "Ponte de rodillas sobre la esterilla con la pelvis neutra y glúteos firmes.",
          "Extiende el Ring-Con frente a tu esternón con ambas manos.",
          "Exhala comprimiendo el aro y mantén la posición 3 segundos sin que el torso oscile.",
          "Inhala relajando la tensión al centro y repite."
        ],
        commonMistakes: ["Rotar las caderas o el torso", "Arquear la espalda lumbar"],
        visualType: "ring_chest_core"
      },
      {
        id: "sabado_puente_gluteo_marcha",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-hip-lift.gif",
        name: "Puente de Glúteo Isométrico con Compresión de Ring-Con",
        sets: 3,
        reps: "10 - 12 (3s arriba)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Tumbado boca arriba con el Ring-Con entre las rodillas. Comprime el aro hacia adentro mientras elevas la cadera y mantienes 3 segundos la contracción.",
        spinalSafetyNote: "Glúteos y aductores activados en descarga 100% de la columna. Los glúteos fuertes son el principal amortiguador de impacto para D7-D11.",
        targetMuscles: ["Glúteo Mayor", "Aductores", "Isquiotibiales"],
        steps: [
          "Túmbate en la esterilla con pies apoyados y Ring-Con entre las rodillas.",
          "Aplica compresión suave sobre el aro y eleva la cadera al techo apretando glúteos.",
          "Mantén la posición alta durante 3 segundos respirando continuo.",
          "Desciende vértebra a vértebra de forma controlada."
        ],
        commonMistakes: ["Arquear la zona lumbar", "Dejar de apretar el Ring-Con"],
        visualType: "ring_glute_bridge"
      },
      {
        id: "sabado_plancha_lateral_rodilla",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/bodyweight-incline-side-plank.gif",
        name: "Plancha Lateral con Rodilla Apoyada en Esterilla",
        sets: 3,
        reps: "20 - 25 seg / lado",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Tumbado de lado en la esterilla con codo bajo hombro y rodilla inferior flexionada a 90° apoyada en el suelo. Eleva la cadera formando una línea recta.",
        spinalSafetyNote: "La flexión de rodilla reduce el brazo de palanca, protegiendo el cuadrado lumbar y la hernia D10-D11 de fatiga excesiva.",
        targetMuscles: ["Cuadrado Lumbar", "Oblicuos", "Glúteo Medio"],
        steps: [
          "Apoya el codo bajo el hombro y dobla la rodilla inferior a 90°.",
          "Exhala y despega la cadera del suelo alineando hombro, cadera y rodilla.",
          "Mantén la posición respirando relajadamente sin dejar caer la pelvis.",
          "Desciende con control y cambia de lado."
        ],
        commonMistakes: ["Dejar caer la cadera hacia el suelo", "Girar el hombro superior hacia adelante"],
        visualType: "side_plank"
      },
      {
        id: "sabado_marcha_activa",
        name: "Marcha Activa Amortiguada en Terreno Blando con Boo",
        sets: 1,
        reps: "30 min",
        rest: "-",
        equipment: "Zapatillas Trail + Arnés Boo",
        technique: "Caminata continua por senderos naturales blandos (césped, tierra) con zancada media y braceo fluido. Sin carreras ni desniveles bruscos.",
        spinalSafetyNote: "El terreno blando natural amortigua las fuerzas de reacción del suelo, nutriendo los discos sin sobrecarga vertebral.",
        targetMuscles: ["Glúteos", "Piernas", "Cardiovascular"],
        steps: [
          "Marcha constante a ritmo vivo (5 - 5.5 km/h) en terreno plano o de pendiente muy suave.",
          "Coordina el braceo relajando hombros y cuello.",
          "Disfruta del entorno junto a Boo manteniendo el arnés cómodo."
        ],
        commonMistakes: ["Cargar mochilas pesadas asimétricas", "Caminar con calzado duro sin amortiguación"],
        visualType: "walking"
      }
    ],
    routeDetails: {
      title: "Ruta Senderismo Trail Amortiguado con Boo",
      description: "Marcha en terreno natural blando que protege las vértebras dorsales de impactos mientras ejercitas la musculatura pélvica.",
      breakdown: [
        { step: "Fase 1 (15 min)", activity: "Caminata a ritmo suave en sendero de tierra o parque arbolado." },
        { step: "Fase 2 (15 min)", activity: "Paseo de retorno manteniendo el torso recto y la pisada de mediopié." },
        { step: "Fase 3 (En casa)", activity: "Ejercicios de estabilidad pélvica y sentadillas con Ring-Con en esterilla." }
      ],
      collieTips: "Usa un arnés ergonómico tipo canicross para que la correa no transmita tirones directos a tus brazos ni a la espalda dorsal."
    }
  },
  Domingo: {
    day: "Domingo",
    title: "Domingo: Descompresión Vertebral, Multífidos & Regeneración Discal Total (Carlos)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Descompresión & Regeneración",
    focus: "Alivio profundo del dolor, nutrición discal, activación de multífidos y relajación paravertebral",
    exercises: [
      {
        id: "domingo_descompresion_axial",
        name: "Tracción Isométrica de Descompresión en Esterilla con Ring-Con",
        sets: 3,
        reps: "6 reps (5s tracción suave)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Tumbado boca arriba o sentado sobre la esterilla, sujeta el Ring-Con frente al pecho y realiza una tracción suave hacia afuera sintiendo cómo se ensancha la espalda alta.",
        spinalSafetyNote: "Abre suavemente el espacio entre costillas y vértebras dorsales D7-D8, relajando la musculatura paravertebral contracturada.",
        targetMuscles: ["Romboides", "Trapecio Medio e Inferior", "Músculos Paravertebrales"],
        steps: [
          "Túmbate sobre la esterilla con la espalda completamente relajada y rodillas dobladas.",
          "Sujeta el Ring-Con con ambas manos frente al pecho.",
          "Exhala y tracciona hacia afuera con una fuerza suave y progresiva (50-60% de tu máximo) durante 5 segundos.",
          "Inhala soltando la tensión y siente la descompresión entre tus omóplatos."
        ],
        commonMistakes: ["Tirar con violencia", "Elevar los hombros hacia las orejas"],
        visualType: "ring_pull"
      },
      {
        id: "domingo_gatovaca_suave",
        name: "Movilidad Articular Gato-Vaca Suave en Esterilla",
        sets: 3,
        reps: "8 - 10 lentas",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia, moviliza la columna al ritmo de tu respiración de forma fluida y placentera.",
        spinalSafetyNote: "Rehidrata los discos intervertebrales mediante difusión de nutrientes a carga articular cero.",
        targetMuscles: ["Columna Dorsal", "Columna Lumbar", "Fascias"],
        steps: [
          "Colócate en cuatro apoyos sobre la esterilla.",
          "Inhala suavemente manteniendo la cabeza neutra.",
          "Exhala empujando el suelo con las palmas y redondeando la columna como un gato.",
          "Regresa despacio a posición neutra sin forzar la curvatura hacia abajo."
        ],
        commonMistakes: ["Forzar la hiperextensión lumbar"],
        visualType: "cat_cow"
      },
      {
        id: "domingo_birddog_control",
        name: "Bird-Dog McGill Lento de Conexión Muscular",
        sets: 3,
        reps: "6 / lado (3s pausa)",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia, extiende brazo y pierna opuesta con lentitud y precisión milimétrica. Mantén 3 segundos sin oscilaciones.",
        spinalSafetyNote: "Despierta y fortalece los multífidos que abrazan las vértebras D7-D11, dotándolas de un soporte muscular protector.",
        targetMuscles: ["Multífidos", "Erectores Espinales", "Glúteo Mayor"],
        steps: [
          "Ponte en cuatro apoyos sobre la esterilla.",
          "Extiende despacio brazo y pierna opuestos hasta quedar paralelos al suelo.",
          "Aguanta 3 segundos respirando tranquilo sintiendo la faja activa.",
          "Regresa al centro con control total y repite con el otro lado."
        ],
        commonMistakes: ["Moverse rápido por inercia", "Arquear las lumbares"],
        visualType: "bird_dog"
      },
      {
        id: "domingo_respiracion_diafragmatica",
        name: "Respiración Diafragmática 360° en Esterilla",
        sets: 1,
        reps: "5 min (15 ciclos)",
        rest: "-",
        equipment: "Esterilla",
        technique: "Tumbado boca arriba con rodillas flexionadas y manos en las costillas. Inhala expandiendo la caja torácica en 360° y exhala vaciando el aire sin tensión.",
        spinalSafetyNote: "Desactiva la señal simpática de dolor crónico, relaja el diafragma y descomprime las inserciones dorsales D10-D11.",
        targetMuscles: ["Diafragma", "Transverso Abdominal", "Sistema Nervioso Parasimpático"],
        steps: [
          "Túmbate boca arriba en la esterilla en un ambiente tranquilo.",
          "Coloca una mano sobre el vientre y otra sobre las costillas bajas.",
          "Inhala lento por la nariz durante 4 segundos expandiendo costillas y abdomen.",
          "Exhala suave por la boca durante 6 segundos dejando caer todo el peso del cuerpo en la esterilla."
        ],
        commonMistakes: ["Respirar de forma superficial solo con el pecho"],
        visualType: "deadbug"
      },
      {
        id: "domingo_paseo",
        name: "Paseo Libre Regenerativo en Familia con Boo",
        sets: 1,
        reps: "Libre (20-30 min)",
        rest: "-",
        equipment: "Zapatillas + Correa",
        technique: "Paseo relajado sin métricas ni exigencias físicas para favorecer la oxigenación y soltar tensiones.",
        spinalSafetyNote: "El movimiento libre no forzado favorece la recuperación neuromuscular y la oxigenación de los tejidos vertebrales.",
        targetMuscles: ["Bienestar General", "Articulaciones"],
        steps: ["Disfruta del paseo a vuestro ritmo en familia con Boo."],
        commonMistakes: ["Hacer movimientos bruscos sin calentar"],
        visualType: "walking"
      }
    ],
    routeDetails: {
      title: "Paseo Libre Regenerativo en Familia con Boo",
      description: "Paseo suave y relajante en entorno verde para desconectar y favorecer la circulación.",
      breakdown: [
        { step: "Libre", activity: "Paseo relajado en familia con Boo, dejando espacio para juegos olfativos tranquilos o descanso al sol." }
      ],
      collieTips: "Aprovecha para reforzar comandos de obediencia básica de forma lúdica y positiva."
    }
  },
  ProtocoloDiario: {
    day: "ProtocoloDiario",
    title: "⚡ Protocolo Diario de Rescate & Descompresión D7-D11 (Carlos)",
    duration: 15,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Descompresión & Alivio Rápido",
    focus: "Rutina diaria de rescate de 15 minutos para alivio agudo del dolor en D7-D8 y D10-D11",
    exercises: [
      {
        id: "rescate_descompresion_respiracion",
        name: "1. Descompresión Axial Supina & Respiración 360° McGill",
        sets: 1,
        reps: "3 min (10 respiraciones)",
        rest: "20 seg",
        equipment: "Esterilla",
        technique: "Túmbate boca arriba en la esterilla con rodillas flexionadas a 90° apoyadas en el suelo. Inhala inflando la faja 360° y exhala soltando toda la tensión dorsal.",
        spinalSafetyNote: "Descomprime de inmediato los discos D7-D8 y D10-D11 disminuyendo la presión sobre las raíces nerviosas.",
        targetMuscles: ["Diafragma", "Transverso Abdominal", "Descompresión Discal"],
        steps: [
          "Túmbate boca arriba en la esterilla con espalda plana y cuello alargado.",
          "Inhala profundo por la nariz expandiendo costillas y abdomen 4 segundos.",
          "Exhala largo y suave por la boca 6 segundos sintiendo el alivio en la espalda media."
        ],
        commonMistakes: ["Tensar los hombros o el cuello al respirar"],
        visualType: "deadbug"
      },
      {
        id: "rescate_gatovaca_discal",
        name: "2. Gato-Vaca de Rehidratación Discal en Rango Neutro",
        sets: 2,
        reps: "8 - 10 lentas",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia, redondea la espalda muy suavemente exhalando y regresa al neutro inhalando. Sin hiperextensiones forzadas.",
        spinalSafetyNote: "A 0 carga axial, bombea agua y nutrientes a los discos deshidratados.",
        targetMuscles: ["Columna Dorsal", "Músculos Paravertebrales"],
        steps: [
          "Cuadrupedia con manos bajo hombros y rodillas bajo caderas.",
          "Exhala empujando la esterilla y redondeando la columna dorsal.",
          "Inhala volviendo a la línea recta neutra."
        ],
        commonMistakes: ["Forzar el rango final doloroso"],
        visualType: "cat_cow"
      },
      {
        id: "rescate_birddog_isometria",
        name: "3. Bird-Dog Isométrico McGill en Esterilla",
        sets: 2,
        reps: "6 / lado (4s pausa)",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "Extiende brazo y pierna opuestos en cuadrupedia. Mantén 4 segundos de máxima firmeza del core.",
        spinalSafetyNote: "Reactiva los multífidos inhibidos por el dolor sin comprimir las hernias.",
        targetMuscles: ["Multífidos", "Core 360°", "Glúteo Mayor"],
        steps: [
          "Extiende brazo y pierna opuestos paralelos al suelo.",
          "Sostén 4 segundos apretando glúteo y transverso.",
          "Cambia de lado con fluidez."
        ],
        commonMistakes: ["Arquear las lumbares"],
        visualType: "bird_dog"
      },
      {
        id: "rescate_puente_gluteo_ring",
        name: "4. Puente de Glúteo con Compresión de Ring-Con",
        sets: 2,
        reps: "10 reps (2s contracción)",
        rest: "30 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Tumbado boca arriba, comprime el Ring-Con entre las rodillas y eleva la cadera activando glúteos.",
        spinalSafetyNote: "Despierta los glúteos en descarga articular completa para absorber las cargas cotidianas.",
        targetMuscles: ["Glúteo Mayor", "Aductores", "Core"],
        steps: [
          "Coloca el Ring-Con entre rodillas tumbado en la esterilla.",
          "Aprieta suavemente hacia adentro y eleva la pelvis.",
          "Aguanta 2 segundos arriba y baja despacio."
        ],
        commonMistakes: ["Arquear la espalda baja"],
        visualType: "ring_glute_bridge"
      },
      {
        id: "rescate_traccion_escapular_ring",
        name: "5. Tracción Escapular Isométrica con Ring-Con",
        sets: 2,
        reps: "8 reps (3s tracción)",
        rest: "30 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sujeta el Ring-Con frente al pecho y tracciona hacia afuera juntando fuertemente las escápulas 3 segundos.",
        spinalSafetyNote: "Fortalece romboides y trapecio medio abriendo la hipercifosis dorsal y aliviando D7-D8.",
        targetMuscles: ["Romboides", "Trapecio Medio", "Deltoides Posterior"],
        steps: [
          "Sentado erguido o de pie sobre la esterilla con el aro al pecho.",
          "Tira de las manos hacia afuera ensanchando el Ring-Con.",
          "Junta escápulas atrás durante 3 segundos y relaja inhalando."
        ],
        commonMistakes: ["Subir los hombros"],
        visualType: "ring_pull"
      }
    ]
  }
};

export const ANDREA_WORKOUT_SCHEDULE = {
  Lunes: {
    day: "Lunes",
    title: "Lunes: Tren Inferior & Glúteos Esculpidos (Andrea)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Tonificación Piernas & Glúteos",
    focus: "Activación de glúteo medio, cuádriceps, isquios y abdomen firme",
    exercises: [
      {
        id: "andrea_sentadilla_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-squat.gif",
        name: "Sentadilla Profunda con Compresión de Ring-Con",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sujeta el Ring-Con con ambas manos frente al pecho. Aplica una compresión continua sobre el aro mientras desciendes en sentadilla profunda con espalda erguida.",
        focusTip: "La compresión frontal del Ring-Con activa simultáneamente el core y pectorales mientras esculpes piernas y glúteos.",
        targetMuscles: ["Glúteo Mayor", "Cuádriceps", "Aductores", "Core"],
        steps: [
          "Colócate de pie sobre la esterilla con los pies a la anchura de hombros y puntas ligeramente abiertas.",
          "Sujeta el Ring-Con horizontal frente al pecho con ambas manos.",
          "Inhala, empuja la cadera atrás y flexiona rodillas bajando con control mientras aplicas una suave compresión al aro.",
          "Exhala empujando a través de los talones y aprieta fuertemente los glúteos arriba."
        ],
        commonMistakes: ["Dejar que las rodillas colapsen hacia adentro", "Despegar los talones del suelo", "Arquear excesivamente la espalda"],
        visualType: "ring_squat"
      },
      {
        id: "andrea_hip_thrust_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-hip-lift.gif",
        name: "Puente de Glúteos con Compresión de Ring-Con",
        sets: 3,
        reps: "15 reps (2s pausa arriba)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Tumbada en la esterilla, coloca el Ring-Con entre tus rodillas. Comprime el aro hacia adentro mientras elevas la cadera contrayendo glúteos al máximo.",
        focusTip: "Apretar el aro activa los aductores y estabiliza la pelvis, disparando la activación del glúteo medio y mayor.",
        targetMuscles: ["Glúteo Mayor", "Aductores", "Isquiosurales", "Core Inferior"],
        steps: [
          "Túmbate boca arriba en la esterilla con rodillas flexionadas y pies apoyados a la anchura de caderas.",
          "Coloca el Ring-Con entre tus rodillas aplicando una suave presión continua hacia adentro.",
          "Apoya los talones con firmeza y eleva las caderas hasta formar una línea recta de rodillas a hombros.",
          "Sostén la contracción en la cima 2 segundos apretando glúteos y desciende con control."
        ],
        commonMistakes: ["Hiperextender la zona lumbar en lugar de apretar el glúteo", "Dejar de presionar el Ring-Con", "Hacer repeticiones rápidas con rebote"],
        visualType: "ring_glute_bridge"
      },
      {
        id: "andrea_zancada_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/band-single-leg-split-squat.gif",
        name: "Zancada Estática con Contrapeso de Ring-Con",
        sets: 3,
        reps: "10 - 12 / pierna",
        rest: "60 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Da un paso atrás en la esterilla. Sujeta el Ring-Con extendido al frente como estabilizador mientras desciendes flexionando ambas rodillas a 90°.",
        focusTip: "Mantén el Ring-Con alineado con el esternón; te aportará estabilidad total para focalizar toda la fuerza en el glúteo adelantado.",
        targetMuscles: ["Glúteo Mayor", "Cuádriceps", "Isquios", "Equilibrio & Estabilidad"],
        steps: [
          "Colócate sobre la esterilla sujetando el Ring-Con con ambas manos frente al pecho.",
          "Da un paso amplio hacia atrás apoyando el metatarso con el talón elevado.",
          "Desciende flexionando la rodilla delantera hasta que el muslo quede casi paralelo al suelo.",
          "Empuja con el talón delantero para volver arriba manteniendo el Ring-Con firme y estable."
        ],
        commonMistakes: ["Inclinarse excesivamente hacia adelante", "Golpear la rodilla trasera contra la esterilla", "Perder el equilibrio por mirar a los lados"],
        visualType: "split_squat"
      },
      {
        id: "andrea_abduccion_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/monster-walk.gif",
        name: "Abducción de Cadera en Esterilla con Prensa de Ring-Con",
        sets: 3,
        reps: "12 - 15 / pierna",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Tumbada de lado en la esterilla, coloca el Ring-Con sobre la parte externa del muslo superior sujetándolo con la mano, y eleva la pierna venciendo la resistencia del aro.",
        focusTip: "Movimiento lento y controlado: siente el ardor en la porción lateral del glúteo (glúteo medio).",
        targetMuscles: ["Glúteo Medio", "Glúteo Menor", "Tensor de la Fascia Lata", "Estabilidad de Cadera"],
        steps: [
          "Túmbate de lado en la esterilla con piernas extendidas y cabeza apoyada en el brazo inferior.",
          "Apoya el Ring-Con contra la parte lateral del muslo superior sujetándolo con la mano libre.",
          "Exhala y eleva la pierna superior aplicando una suave contra-presión con el aro durante 1-2 segundos.",
          "Baja lentamente sin tocar por completo la pierna inferior y completa la serie antes de cambiar."
        ],
        commonMistakes: ["Rotar la pelvis hacia atrás", "Mover la pierna con tirones rápidos", "Perder la alineación corporal"],
        visualType: "side_plank"
      },
      {
        id: "andrea_donkey_kicks",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-bent-over-hip-extension.gif",
        name: "Patada de Glúteo Isométrica en Cuadrupedia",
        sets: 3,
        reps: "12 - 15 / pierna",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "En 4 puntos de apoyo en la esterilla, empuja la planta del pie hacia el techo con rodilla flexionada a 90°, concentrando la contracción en la parte alta del glúteo.",
        focusTip: "Imagina que quieres estampar la suela de tu zapatilla en el techo, sin balancear la pelvis ni arquear la espalda.",
        targetMuscles: ["Glúteo Mayor", "Isquiotibiales", "Core Estabilizador"],
        steps: [
          "Colócate en cuadrupedia sobre la esterilla con manos bajo hombros y rodillas bajo caderas.",
          "Con la rodilla flexionada a 90°, eleva el talón hacia el techo apretando el glúteo en la cima 2 segundos.",
          "Baja de forma controlada sin apoyar la rodilla en el suelo.",
          "Completa todas las repeticiones antes de cambiar de pierna."
        ],
        commonMistakes: ["Arquear la espalda lumbar al subir la pierna", "Abrir la cadera hacia el lado", "Usar impulso rápido en lugar de control"],
        visualType: "donkey_kick"
      }
    ]
  },
  Martes: {
    day: "Martes",
    title: "Martes: Cardio Fartlek & Agilidad en Parque con Boo (Andrea)",
    duration: 40,
    location: "Al aire libre (Parque / Vía Verde)",
    equipment: ["Zapatillas Deportivas", "Arnés Boo", "Frisbee o Juguete"],
    type: "Cardio Intervalar & Agilidad",
    focus: "Resistencia aeróbica, intervalos de trote y estimulación física con Boo",
    exercises: [
      {
        id: "andrea_calentamiento_boo",
        name: "Paseo Activo de Calentamiento con Boo",
        sets: 1,
        reps: "10 min",
        rest: "-",
        equipment: "Zapatillas + Arnés Boo",
        technique: "Caminata a ritmo ligero/medio permitiendo los primeros olfateos de Boo y activando la circulación general.",
        focusTip: "Aumenta progresivamente la zancada y el braceo para elevar la temperatura corporal antes de los intervalos de trote.",
        targetMuscles: ["Gemelos", "Cuádriceps", "Sistema Cardiovascular"],
        steps: [
          "Inicia con paso normal durante 3-4 minutos mientras Boo hace sus necesidades.",
          "Aumenta el ritmo a caminata viva (5 - 5.5 km/h) balanceando los brazos.",
          "Realiza círculos con los hombros y ligeras zancadas dinámicas en paradas breves."
        ],
        commonMistakes: ["Empezar a trotar en frío sin los 10 minutos de calentamiento"],
        visualType: "walking"
      },
      {
        id: "andrea_fartlek_parque",
        name: "Fartlek Intervalar con Boo (1' trote + 2' caminata)",
        sets: 5,
        reps: "3 min c/u (15 min total)",
        rest: "En caminata",
        equipment: "Zapatillas + Arnés Boo",
        technique: "Alterna 1 minuto de trote continuo a ritmo cómodo con 2 minutos de caminata rápida de recuperación. Boo te acompañará feliz al trote.",
        focusTip: "El minuto de trote debe ser a ritmo conversacional: si no puedes decir una frase corta sin ahogarte, baja un poco la velocidad.",
        targetMuscles: ["Capacidad Aeróbica", "Quema de Grasa", "Gemelos y Sóleos"],
        steps: [
          "Comienza el bloque 1 trotando a ritmo constante durante 60 segundos.",
          "Transiciona suavemente a caminata rápida durante 120 segundos para recuperar el pulso.",
          "Repite la secuencia un total de 5 veces manteniendo la constancia de ritmo."
        ],
        commonMistakes: ["Esprintar en el minuto de trote y agotarse en el primer bloque", "Detenerse por completo en la fase de caminata"],
        visualType: "walking"
      },
      {
        id: "andrea_step_ups_banco",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-step-up.gif",
        name: "Step-Ups Explosivos en Banco de Parque",
        sets: 3,
        reps: "12 / pierna",
        rest: "45 seg",
        equipment: "Banco de parque + Zapatillas",
        technique: "Sube a un banco de parque firme impulsando con el talón de la pierna apoyada, elevando la rodilla contraria al pecho.",
        focusTip: "Empuja exclusivamente con la pierna de arriba; no des impulso con la punta del pie que está en el suelo.",
        targetMuscles: ["Cuádriceps", "Glúteo Mayor", "Gemelos", "Equilibrio Dinámico"],
        steps: [
          "Colócate frente a un banco de parque firme y estable.",
          "Coloca un pie completamente sobre el asiento.",
          "Empuja fuerte con ese talón para elevar todo tu cuerpo, llevando la rodilla contraria hacia el pecho en la cima.",
          "Baja con control apoyando la misma pierna y completa 12 repeticiones antes de cambiar."
        ],
        commonMistakes: ["Usar un banco inestable o mojado", "Rebotar con el pie de abajo"],
        visualType: "step_up"
      },
      {
        id: "andrea_estiramiento_parque",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/spine/spine-stretch.gif",
        name: "Estiramientos de Enfriamiento en Parque",
        sets: 1,
        reps: "5 min",
        rest: "-",
        equipment: "Zapatillas",
        technique: "Estiramientos estáticos suaves para cuádriceps, gemelos, glúteos e isquiotibiales mientras Boo descansa hidratándose.",
        focusTip: "Mantén cada posición 25-30 segundos respirando hondo y sin dar rebotes.",
        targetMuscles: ["Cadena Posterior", "Cuádriceps", "Flexores de Cadera"],
        steps: [
          "Estiramiento de gemelos apoyando manos en un árbol o valla.",
          "Estiramiento de cuádriceps llevando el talón al glúteo sujetando el tobillo.",
          "Flexión suave de tronco al frente para estirar isquiosurales."
        ],
        commonMistakes: ["Dar rebotes bruscos al estirar", "Contener la respiración"],
        visualType: "stretching"
      }
    ],
    routeDetails: {
      title: "Ruta Fartlek Urbano & Parque con Boo",
      description: "Combina paseo activo con intervalos de trote y paradas de ejercicio funcional mientras Boo canaliza su energía.",
      breakdown: [
        { step: "0 - 10 min", activity: "Paseo de Calentamiento y olfateo libre para Boo." },
        { step: "10 - 25 min", activity: "Fartlek Intervalar: 1 min trote suave + 2 min caminata rápida (5 bloques)." },
        { step: "25 - 35 min", activity: "Circuito en Banco de Parque: Step-ups alternados mientras Boo realiza 'Sentado/Quieto'." },
        { step: "35 - 40 min", activity: "Paseo de vuelta a casa y estiramientos suaves." }
      ],
      collieTips: "Lleva agua para Boo, su juguete favorito y premios magros para recompensar su obediencia en las pausas."
    }
  },
  Miércoles: {
    day: "Miércoles",
    title: "Miércoles: Tren Superior & Brazos Definidos (Andrea)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Definición Tren Superior & Postura",
    focus: "Espalda esbelta, hombros redondeados, brazos tonificados y pecho firme",
    exercises: [
      {
        id: "andrea_flexiones_suelo",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/kneeling-push-up-male.gif",
        name: "Flexiones de Brazos (en Suelo o sobre Rodillas)",
        sets: 3,
        reps: "10 - 12",
        rest: "60 seg",
        equipment: "Esterilla",
        technique: "Cuerpo alineado como una tabla. Desciende el pecho rozando la esterilla con codos formando 45° respecto al torso.",
        focusTip: "Activa el abdomen y los glúteos para que tu cadera no se hunda; el pecho y la pelvis bajan y suben al mismo tiempo.",
        targetMuscles: ["Pectoral", "Tríceps", "Deltoides Anterior", "Core"],
        steps: [
          "Colócate en posición de plancha en la esterilla con manos separadas algo más del ancho de hombros (apoya rodillas si lo necesitas).",
          "Inhala y desciende el pecho controladamente flexionando los codos hacia atrás a 45°.",
          "Baja hasta que el pecho quede a un puño de la esterilla sin arquear la zona lumbar.",
          "Exhala y empuja fuerte contra el suelo para volver a la posición inicial."
        ],
        commonMistakes: ["Abrir los codos a 90° en T (estresa los hombros)", "Dejar caer la cadera hacia el suelo", "Doblar el cuello hacia abajo"],
        visualType: "pushup"
      },
      {
        id: "andrea_remo_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/resistance-band-seated-straight-back-row.gif",
        name: "Tracción Escapular & Remo con Ring-Con en Esterilla",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sentada erguida sobre la esterilla, sujeta el Ring-Con por los laterales con codos flexionados y pegados al cuerpo. Tracciona fuertemente hacia afuera juntando escápulas 2 segundos.",
        focusTip: "Inicia el movimiento juntando las escápulas atrás antes de flexionar los brazos. Sentirás la espalda media activarse y estilizarse.",
        targetMuscles: ["Dorsal Ancho", "Romboides", "Bíceps", "Deltoides Posterior"],
        steps: [
          "Siéntate en la esterilla con la espalda completamente alargada y hombros abajo.",
          "Sujeta el Ring-Con frente a tu ombligo con codos flexionados y pegados a los costados.",
          "Exhala y tracciona hacia afuera ensanchando el aro mientras juntas los omóplatos con fuerza durante 2 segundos.",
          "Regresa lentamente resistiendo la tensión sin encorvar los hombros."
        ],
        commonMistakes: ["Elevar los hombros hacia las orejas", "Balancear el tronco hacia atrás"],
        visualType: "ring_pull"
      },
      {
        id: "andrea_press_overhead_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/band-shoulder-press.gif",
        name: "Press Overhead con Compresión de Ring-Con",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De pie o de rodillas en la esterilla, eleva el Ring-Con sobre la cabeza y realiza compresiones rítmicas y controladas hacia adentro.",
        focusTip: "Aprieta glúteos y abdomen mientras comprimes el aro para mantener una postura impecable y estilizada.",
        targetMuscles: ["Deltoides", "Trapecio Superior", "Tríceps", "Estabilidad Escapular"],
        steps: [
          "Colócate de rodillas o de pie erguida sobre la esterilla con el abdomen firme.",
          "Eleva el Ring-Con sobre tu cabeza con los brazos extendidos y codos suaves.",
          "Exhala y comprime el aro hacia adentro durante 2 segundos activando hombros y deltoides.",
          "Inhala relajando la presión sin bajar los brazos y repite la secuencia."
        ],
        commonMistakes: ["Arquear la espalda lumbar al empujar hacia arriba", "Bajar los brazos por debajo de la cabeza"],
        visualType: "shoulder_press"
      },
      {
        id: "andrea_face_pull_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/band-standing-rear-delt-row.gif",
        name: "Face Pull Isométrico con Ring-Con para Postura",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sujeta el Ring-Con frente a la cara a la altura de los ojos. Tira hacia afuera abriendo codos hacia los lados y juntando omóplatos.",
        focusTip: "Excelente para abrir el pecho, corregir la postura del trabajo de oficina y redondear la parte posterior del hombro.",
        targetMuscles: ["Deltoides Posterior", "Manguito Rotador", "Trapecio Medio"],
        steps: [
          "De pie o sentada erguida sobre la esterilla, eleva el Ring-Con a la altura de los ojos.",
          "Exhala y realiza una tracción isométrica hacia afuera como si quisieras ensanchar el aro.",
          "Abre bien los codos hacia los lados y junta los omóplatos atrás durante 2 segundos.",
          "Regresa con suavidad inhalando despacio."
        ],
        commonMistakes: ["Bajar los codos pegados al cuerpo", "Echar la cabeza hacia adelante para buscar el aro"],
        visualType: "ring_pull"
      },
      {
        id: "andrea_triceps_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/bench-dip-on-floor.gif",
        name: "Prensa de Tríceps con Ring-Con en Esterilla",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sentada o de rodillas en la esterilla, apoya las palmas en los agarres del Ring-Con pegado al torso y comprímelo hacia adentro activando la cara posterior del brazo.",
        focusTip: "Concéntrate en apretar desde los tríceps con los codos pegados a las costillas para reafirmar brazos.",
        targetMuscles: ["Tríceps Braquial", "Deltoides", "Pectoral Menor"],
        steps: [
          "Siéntate erguida sobre la esterilla con la columna alargada.",
          "Coloca el Ring-Con frente al pecho o abdomen con codos flexionados a 90°.",
          "Exhala y comprime el aro hacia adentro sintiendo la activación directa en los tríceps.",
          "Sostén 2 segundos de contracción y relaja suavemente sin soltar el aro."
        ],
        commonMistakes: ["Encorvar los hombros", "Comprimir solo con las muñecas en lugar de con los brazos"],
        visualType: "ring_chest_core"
      }
    ]
  },
  Jueves: {
    day: "Jueves",
    title: "Jueves: Descanso Activo, Core Profundo & Paseo con Boo (Andrea)",
    duration: 35,
    location: "Al aire libre / En casa",
    equipment: ["Esterilla", "Zapatillas", "Arnés Boo"],
    type: "Recuperación Activa & Abdomen Plano",
    focus: "Activación de transverso abdominal, movilidad de caderas y relajación mental con Boo",
    exercises: [
      {
        id: "andrea_paseo_relajado",
        name: "Paseo de Olfateo & Desconexión con Boo",
        sets: 1,
        reps: "25 - 30 min",
        rest: "-",
        equipment: "Zapatillas + Arnés Boo",
        technique: "Paseo a paso libre y tranquilo permitiendo que Boo huela rastros en parques o zonas verdes sin prisas.",
        focusTip: "Caminar relajadamente sin prisas estimula el sistema parasimpático, bajando el cortisol y acelerando la recuperación muscular.",
        targetMuscles: ["Recuperación Activa", "Bienestar General"],
        steps: [
          "Sal a una zona ajardinada o sendero arbolado.",
          "Deja que Boo olfatee libremente a su aire.",
          "Mantén una respiración profunda y relajada durante todo el trayecto."
        ],
        commonMistakes: ["Mirar el móvil constantemente en lugar de conectar con el paseo y Boo"],
        visualType: "walking"
      },
      {
        id: "andrea_plancha_toques",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/kneeling-plank-tap-shoulder-male.gif",
        name: "Plancha Abdominal con Toques de Hombro",
        sets: 3,
        reps: "30 - 40 seg (o 16 toques)",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "En plancha sobre manos, despega una mano para tocar el hombro opuesto intentando que la cadera no oscile nada de lado a lado.",
        focusTip: "Abre ligeramente los pies para tener mejor base y aprieta el ombligo como si quisieras pegarlo a la columna.",
        targetMuscles: ["Transverso del Abdomen", "Oblicuos", "Serratos", "Estabilidad Core"],
        steps: [
          "Colócate en posición de plancha alta con manos bajo los hombros y pies un poco más abiertos que la cadera.",
          "Activa glúteos y abdomen formando una línea recta de pies a cabeza.",
          "Lenta y controladamente, despega la mano derecha y toca tu hombro izquierdo sin rotar la pelvis.",
          "Apoya la mano y repite con la mano izquierda al hombro derecho."
        ],
        commonMistakes: ["Balancear la cadera de un lado a otro como un barco", "Dejar caer la cabeza o arquear la zona lumbar"],
        visualType: "side_plank"
      },
      {
        id: "andrea_bicicleta_abs",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/band-bicycle-crunch.gif",
        name: "Bicicleta Abdominal Controlada (Criss-Cross)",
        sets: 3,
        reps: "15 alternadas / lado",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "Tumbada boca arriba, lleva el codo hacia la rodilla opuesta con movimiento pausado sintiendo la torsión desde el abdomen, no desde el cuello.",
        focusTip: "Hazlo lento: 2 segundos por repetición. La lentitud activa el doble de fibras musculares en los oblicuos.",
        targetMuscles: ["Oblicuos Internos y Externos", "Recto Abdominal", "Flexores de Cadera"],
        steps: [
          "Túmbate sobre la esterilla con manos tras la nuca (sin tirar de ella) y piernas en 90° en el aire.",
          "Extiende una pierna a 45° mientras giras el torso para acercar el codo opuesto a la rodilla que queda flexionada.",
          "Cambia de lado con fluidez manteniendo las escápulas despegadas del suelo.",
          "Respira acompasadamente sin tirar de la cabeza con las manos."
        ],
        commonMistakes: ["Tirar de las cervicales con las manos", "Hacer el ejercicio a toda velocidad sin control"],
        visualType: "deadbug"
      },
      {
        id: "andrea_gato_camello",
        name: "Gato-Camello de Movilidad y Liberación Espinal",
        sets: 2,
        reps: "10 repeticiones",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia, arquea suavemente la columna hacia el techo exhalando y extiende hacia abajo inhalando.",
        focusTip: "Sincroniza el movimiento con la respiración; siente cómo se oxigena toda la musculatura paravertebral.",
        targetMuscles: ["Movilidad de Columna", "Erectores Espinales", "Respiración"],
        steps: [
          "Apóyate sobre manos y rodillas en la esterilla.",
          "Inhala llevando el pecho suavemente hacia el suelo y mirando ligeramente al frente.",
          "Exhala empujando la esterilla con las manos, redondeando la espalda hacia el techo y metiendo el ombligo."
        ],
        commonMistakes: ["Forzar el rango final bruscamente"],
        visualType: "cat_cow"
      },
      {
        id: "andrea_estiramiento_cadera",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/spine/spine-stretch.gif",
        name: "Estiramiento Profundo de Psoas y Caderas",
        sets: 2,
        reps: "30 seg / lado",
        rest: "30 seg",
        equipment: "Esterilla",
        technique: "En posición de zancada en el suelo con una rodilla apoyada, empuja la cadera suavemente hacia adelante sintiendo la apertura en el flexor.",
        focusTip: "Excelente para relajar las caderas y estilizar la zona pélvica tras estar sentada.",
        targetMuscles: ["Psoas Ilíaco", "Cuádriceps", "Glúteo"],
        steps: [
          "Da un paso largo al frente y apoya la rodilla trasera en la esterilla.",
          "Mantén el tronco erguido y empuja la pelvis suavemente hacia adelante y hacia abajo.",
          "Respira hondo sintiendo cómo se libera la tensión en la parte frontal de la cadera trasera."
        ],
        commonMistakes: ["Arquear excesivamente la espalda lumbar en vez de bascular la pelvis"],
        visualType: "stretching"
      }
    ]
  },
  Viernes: {
    day: "Viernes",
    title: "Viernes: Full Body Tone & Glúteo Sculpt (Andrea)",
    duration: 35,
    location: "En casa",
    equipment: ["Ring-Con (Switch)", "Esterilla"],
    type: "Full Body Dinámico & Glúteos",
    focus: "Combinación de fuerza y tonificación metabólica de todo el cuerpo",
    exercises: [
      {
        id: "andrea_peso_muerto_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-stiff-leg-deadlift.gif",
        name: "Peso Muerto Rumano & Bisagra con Ring-Con",
        sets: 3,
        reps: "12 - 15",
        rest: "60 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De pie sobre la esterilla con pies a anchura de caderas, sujeta el Ring-Con extendido al frente. Realiza una bisagra de cadera llevando los glúteos atrás con la espalda recta hasta sentir los isquios, y sube apretando glúteos.",
        focusTip: "El Ring-Con al frente sirve de referencia postural para no redondear la espalda y focalizar toda la tensión en isquios y glúteos.",
        targetMuscles: ["Isquiotibiales", "Glúteo Mayor", "Erectores Espinales", "Core"],
        steps: [
          "De pie sobre la esterilla con pies al ancho de caderas y rodillas suaves.",
          "Sujeta el Ring-Con con ambas manos extendido al frente a la altura de la cadera.",
          "Empuja la cadera hacia atrás inclinando el torso al frente con la columna neutra hasta sentir tensión en los isquiosurales.",
          "Exhala y empuja la pelvis adelante apretando glúteos fuertemente en la cima."
        ],
        commonMistakes: ["Doblar las rodillas como en una sentadilla", "Redondear la espalda", "Bajar los brazos perdiendo la línea del Ring-Con"],
        visualType: "ring_squat"
      },
      {
        id: "andrea_remo_isometrico_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/resistance-band-seated-straight-back-row.gif",
        name: "Remo Escapular Isométrico con Ring-Con en Esterilla",
        sets: 3,
        reps: "12 - 15 (2s contracción)",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "Sentada erguida sobre la esterilla, tracciona el Ring-Con hacia afuera juntando fuertemente las escápulas y activando el dorsal ancho y romboides.",
        focusTip: "Mantén el pecho erguido y hombros abajo; la tensión isométrica esculpe la espalda media con cero impacto articular.",
        targetMuscles: ["Dorsal Ancho", "Bíceps", "Romboides", "Core"],
        steps: [
          "Siéntate erguida sobre la esterilla con la espalda recta.",
          "Sujeta el Ring-Con frente a tu ombligo con codos flexionados a los costados.",
          "Tracciona hacia afuera separando las manos y juntando los omóplatos durante 2 segundos.",
          "Regresa despacio inhalando."
        ],
        commonMistakes: ["Rotar el tronco para hacer palanca", "Tirar con el cuello tenso"],
        visualType: "ring_pull"
      },
      {
        id: "andrea_elevaciones_ring",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/band-front-lateral-raise.gif",
        name: "Elevaciones Frontales con Compresión de Ring-Con",
        sets: 3,
        reps: "12 - 15",
        rest: "45 seg",
        equipment: "Ring-Con + Esterilla",
        technique: "De pie sobre la esterilla, eleva el Ring-Con desde los muslos hasta la altura de los hombros aplicando una compresión continua hacia adentro.",
        focusTip: "La combinación de elevación y compresión esculpe los hombros y tonifica los brazos con suavidad articular.",
        targetMuscles: ["Deltoides", "Pectoral Superior", "Trapecio", "Core"],
        steps: [
          "De pie sobre la esterilla con los pies al ancho de hombros y postura erguida.",
          "Sujeta el Ring-Con a la altura de los muslos.",
          "Inhala y eleva el aro hasta la altura de los hombros mientras aplicas una compresión continua hacia adentro.",
          "Exhala y desciende lentamente controlando el movimiento."
        ],
        commonMistakes: ["Dar impulso con el tronco balanceándose", "Elevar las manos por encima de las orejas"],
        visualType: "ring_chest_core"
      },
      {
        id: "andrea_plancha_lateral",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/bodyweight-incline-side-plank.gif",
        name: "Plancha Lateral con Elevación de Pierna",
        sets: 3,
        reps: "20 seg / lado (o 8 elevaciones)",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "En plancha lateral sobre el antebrazo, eleva la pierna superior abriendo en tijera para un trabajo demoledor de glúteo medio y oblicuos.",
        focusTip: "Mantén la pelvis alta y alineada con los hombros durante todo el ejercicio.",
        targetMuscles: ["Glúteo Medio", "Oblicuos", "Cuadrado Lumbar", "Estabilidad de Cadera"],
        steps: [
          "Túmbate de lado apoyando el antebrazo bajo el hombro y piernas alineadas (puedes apoyar la rodilla inferior si es necesario).",
          "Eleva la cadera del suelo formando una línea recta.",
          "Eleva la pierna superior unos 20-30 cm contrayendo el glúteo lateral y sostén o realiza repeticiones controladas.",
          "Cambia de lado y repite."
        ],
        commonMistakes: ["Dejar caer la cadera hacia la esterilla", "Rotar el torso hacia el suelo"],
        visualType: "side_plank"
      },
      {
        id: "andrea_bird_dog",
        name: "Bird-Dog Dinámico con Pausa Isométrica",
        sets: 3,
        reps: "10 / lado (2s pausa)",
        rest: "45 seg",
        equipment: "Esterilla",
        technique: "En cuadrupedia, extiende brazo y pierna opuestos hasta formar una línea horizontal perfecta con la columna, manteniendo 2 segundos.",
        focusTip: "Estira hacia adelante y hacia atrás como si quisieras tocar dos paredes opuestas, no hacia arriba.",
        targetMuscles: ["Glúteos", "Erectores Espinales", "Deltoides", "Core Cruzado"],
        steps: [
          "Comienza en cuadrupedia con espalda neutra.",
          "Extiende simultáneamente el brazo derecho al frente y la pierna izquierda atrás.",
          "Mantén la posición 2 segundos sintiendo la activación de glúteo y espalda.",
          "Regresa sin tocar el suelo y alterna de lado."
        ],
        commonMistakes: ["Arquear la espalda lumbar", "Rotar la cadera perdiendo la horizontalidad"],
        visualType: "bird_dog"
      }
    ]
  },
  Sábado: {
    day: "Sábado",
    title: "Sábado: Trail Running / Senderismo Active con Boo (Andrea)",
    duration: 60,
    location: "Monte / Sendero natural",
    equipment: ["Zapatillas de trail", "Arnés Canicross Boo", "Botella de agua"],
    type: "Resistencia Cardiovascular & Agilidad",
    focus: "Alto gasto calórico, resistencia en naturaleza y diversión al aire libre con Boo",
    exercises: [
      {
        id: "andrea_trail_marcha",
        name: "Marcha Activa en Desnivel con Boo (5.5 km/h)",
        sets: 1,
        reps: "25 min",
        rest: "-",
        equipment: "Zapatillas trail + Arnés Boo",
        technique: "Caminata vigorosa en sendero con subidas y bajadas apretando glúteos en cada paso ascendente.",
        focusTip: "En las subidas, acorta el paso pero mantén la cadencia viva apoyando bien el talón para trabajar glúteos e isquios.",
        targetMuscles: ["Glúteos", "Cuádriceps", "Gemelos", "Sistema Cardiovascular"],
        steps: [
          "Inicia la ruta a ritmo vivo por el sendero con Boo guiando en arnés.",
          "Mantén una zancada firme impulsando con los gemelos y glúteos en desniveles.",
          "Acompaña con el braceo natural activo."
        ],
        commonMistakes: ["Empezar demasiado rápido en las primeras cuestas"],
        visualType: "walking"
      },
      {
        id: "andrea_trail_trote",
        name: "Intervalos de Trote Trail con Boo (4 bloques x 3')",
        sets: 4,
        reps: "3 min c/u",
        rest: "2 min caminata",
        equipment: "Zapatillas trail + Arnés Boo",
        technique: "Aprovecha tramos llanos o de falso llano para trotar alegremente con Boo, adaptándote a las irregularidades del terreno.",
        focusTip: "Mantén la mirada 3-4 metros por delante para anticipar raíces o piedras en el camino.",
        targetMuscles: ["Capacidad Aeróbica", "Estabilidad de Tobillos", "Quema Calórica"],
        steps: [
          "Transiciona al trote continuo a ritmo cómodo en terreno seguro.",
          "Deja que Boo marque un ritmo ágil y coordinado.",
          "Recupera 2 minutos en caminata activa tras cada bloque de 3 minutos."
        ],
        commonMistakes: ["Mirar exclusivamente a los pies perdiendo la anticipación del camino"],
        visualType: "walking"
      },
      {
        id: "andrea_parada_sentadillas",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-squat.gif",
        name: "Parada Activa en Naturaleza: Sentadillas & Juego con Boo",
        sets: 3,
        reps: "15 sentadillas + lanzamiento",
        rest: "45 seg",
        equipment: "Zapatillas + Juguete Boo",
        technique: "En una parada con vistas, realiza series de sentadillas profundas alternadas con juegos de 'Sentado / Busca el juguete' con Boo.",
        focusTip: "Estimula la mente de Boo con obediencia mientras mantienes tus piernas activas en la pausa.",
        targetMuscles: ["Cuádriceps", "Glúteos", "Vínculo con Boo"],
        steps: [
          "Pide orden de 'Quieto' a Boo.",
          "Ejecuta 15 sentadillas profundas con buena técnica.",
          "Premia y lanza el juguete a Boo como descanso activo."
        ],
        commonMistakes: ["Descuidar la técnica de sentadilla por la distracción del juego"],
        visualType: "ring_squat"
      },
      {
        id: "andrea_trail_enfriamiento",
        name: "Caminata de Descenso & Enfriamiento Suave",
        sets: 1,
        reps: "15 min",
        rest: "-",
        equipment: "Zapatillas trail",
        technique: "Regreso tranquilo bajando el pulso gradualmente mientras Boo bebe agua y suelta energía.",
        focusTip: "Aprovecha para soltar piernas y respirar el aire puro del entorno natural.",
        targetMuscles: ["Recuperación Activa"],
        steps: [
          "Camina a paso relajado de regreso al punto de partida.",
          "Ofrece agua a Boo y bebe sorbos pequeños.",
          "Realiza estiramientos suaves de piernas al llegar al coche o a casa."
        ],
        commonMistakes: ["Parar en seco sin los minutos de caminata de enfriamiento"],
        visualType: "stretching"
      }
    ],
    routeDetails: {
      title: "Ruta Senderismo Trail Active & Agilidad en Naturaleza",
      description: "Marcha activa con desnivel moderado que quema calorías a ritmo sostenido y ejercita a Boo en su entorno ideal.",
      breakdown: [
        { step: "Fase 1 (25 min)", activity: "Caminata a ritmo vivo (5.5 km/h) en terreno con desnivel moderado." },
        { step: "Fase 2 (15 min)", activity: "Trote suave intermitente en tramos favorables con Boo." },
        { step: "Fase 3 (10 min)", activity: "Parada de descanso activo: Juego con juguete/Frisbee + Sentadillas." },
        { step: "Fase 4 (10 min)", activity: "Descenso y caminata de vuelta relajada." }
      ],
      collieTips: "Usa un arnés ergonómico tipo correa de cintura (canicross) para poder caminar o trotar con las manos libres de forma cómoda."
    }
  },
  Domingo: {
    day: "Domingo",
    title: "Domingo: Recuperación Total, Movilidad & Paseo Libre con Boo (Andrea)",
    duration: 35,
    location: "Al aire libre / En casa",
    equipment: ["Esterilla", "Zapatillas", "Arnés Boo"],
    type: "Descanso Total & Bienestar",
    focus: "Descanso muscular completo, regeneración celular y tiempo familiar de calidad",
    exercises: [
      {
        id: "andrea_domingo_paseo",
        name: "Paseo Libre en Familia con Boo",
        sets: 1,
        reps: "30 - 40 min",
        rest: "-",
        equipment: "Zapatillas + Correa",
        technique: "Paseo de domingo relajado, sin cronómetros ni metas de ritmo, disfrutando del aire libre.",
        focusTip: "El descanso también es parte del entrenamiento: permite a los músculos reparar fibras y tonificarse.",
        targetMuscles: ["Salud Cardiovascular", "Bienestar General"],
        steps: [
          "Paseo tranquilo por vuestro parque favorito o paseo marítimo/urbano.",
          "Disfrutar de la compañía de Boo sin exigencias físicas."
        ],
        commonMistakes: ["Convertir el día de descanso en una sesión extenuante"],
        visualType: "walking"
      },
      {
        id: "andrea_domingo_movilidad",
        gifUrl: "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/spine/spine-stretch.gif",
        name: "Sesión de Movilidad Suave & Estiramientos Plancenteros",
        sets: 1,
        reps: "10 min",
        rest: "-",
        equipment: "Esterilla",
        technique: "Movilidad articular lenta para cadera, hombros y columna en la esterilla.",
        focusTip: "Conecta con tu respiración y libera cualquier rigidez acumulada de la semana.",
        targetMuscles: ["Flexibilidad", "Fascias Musculares"],
        steps: [
          "Círculos suaves de cadera y hombros.",
          "Postura del niño (Child's pose) para relajar la espalda.",
          "Respiraciones diafragmáticas profundas."
        ],
        commonMistakes: ["Forzar estiramientos hasta el dolor"],
        visualType: "stretching"
      }
    ],
    routeDetails: {
      title: "Paseo Libre de Domingo con Boo",
      description: "Paseo recreativo en parque o zona verde sin exigencia física intensa.",
      breakdown: [
        { step: "Libre", activity: "Paseo relajado en familia con Boo, dejando espacio para juegos sencillos o descanso al sol." }
      ],
      collieTips: "Aprovecha para reforzar comandos de obediencia básica de forma lúdica y positiva."
    }
  }
};

export const WEEKLY_WORKOUT_SCHEDULE_BY_PROFILE = {
  he: CARLOS_WORKOUT_SCHEDULE,
  she: ANDREA_WORKOUT_SCHEDULE
};

export function getWeeklyWorkoutSchedule(profileId) {
  const pid = profileId || (typeof window !== 'undefined' && window.appState?.activeProfileId) || 'he';
  return WEEKLY_WORKOUT_SCHEDULE_BY_PROFILE[pid] || CARLOS_WORKOUT_SCHEDULE;
}

export const WEEKLY_WORKOUT_SCHEDULE = new Proxy(CARLOS_WORKOUT_SCHEDULE, {
  get(target, prop) {
    const pid = (typeof window !== 'undefined' && window.appState?.activeProfileId) || 'he';
    const schedule = WEEKLY_WORKOUT_SCHEDULE_BY_PROFILE[pid] || target;
    return schedule[prop];
  }
});

export const BOO_TRAINING_MODULES = [
  {
    id: "control_estimulos_ninos",
    title: "Concentración en Distracción & Gestión de Pelotas Ajenas",
    category: "Enfoque & Concentración",
    icon: "fa-solid fa-crosshairs",
    badgeColor: "var(--accent-cyan)",
    difficulty: "Intermedio",
    duration: "10-15 min/paseo",
    summary: "Trabajar la concentración de Boo cuando hay pelotas botando, niños corriendo o perros activos en el parque. Enseñar a desconectar la mirada del estímulo y mantener el contacto visual con Carlos y Andrea mientras pasea suelta.",
    steps: [
      "Trabajo en Libertad: Aprovechar los momentos en los que va suelta en el parque para premiar los chequeos visuales espontáneos hacia vosotros.",
      "Marcar el desenganche: En cuanto Boo mire a un niño o una pelota lejana y vuelva la cabeza hacia vosotros por iniciativa propia, decir '¡Bien!' y entregar un premio rico pegado a la pierna.",
      "La Pelota es Vuestra Herramienta: Vosotros administráis cuándo empieza y acaba el juego de cobro. No se persiguen pelotas rodando hasta oír la orden de liberación ('¡Ya!').",
      "Cambio de dirección con alegría: Si veis que se queda clavada mirando una pelota ajena, llamadla con tono festivo mientras dais media vuelta caminando en sentido contrario.",
      "Orden '¡Deja!': Practicar el comando '¡Deja!' ante pelotas en el suelo, enseñándole que ignorar la pelota da acceso a una recompensa mucho más sabrosa de vuestra mano."
    ],
    proTip: "Boo es muy obediente por naturaleza. El objetivo no es limitarla, sino hacer que Carlos y Andrea sean siempre el centro de referencia más estimulante del parque."
  },
  {
    id: "llamada_emergencia",
    title: "Comando Único de Retorno Innegociable",
    category: "Obediencia y Foco",
    icon: "fa-solid fa-bullhorn",
    badgeColor: "var(--accent-emerald)",
    difficulty: "Crucial",
    duration: "2-3 repeticiones/paseo",
    summary: "Un comando exclusivo y potente (palabra clave como '¡AQUÍ YA!' o silbato de doble pitido) reservado para situaciones de mucha distracción donde se necesita una vuelta inmediata e indiscutible.",
    steps: [
      "Elegir un comando vocal exclusivo o silbato de doble tono que NO se use para cosas rutinarias (diferente al 'Boo, ven' cotidiano).",
      "Condicionamiento de alto valor: Practicar 2-3 veces al día en momentos tranquilos, premiando SIEMPRE con comida extraordinaria (dados de pavo, queso, salchicha) y fiesta de caricias durante 20 segundos.",
      "No quemar la orden: NUNCA usar este comando para regañarla, meterla al coche o terminar el paseo. Acudir al comando único debe ser la mayor fiesta.",
      "Práctica suelta en parque: Cuando esté distraída oliendo o viendo a otros perros a media distancia, soltar el comando único; al llegar, celebrar a lo grande y dejarla seguir jugando."
    ],
    proTip: "Al mantener este comando reservado exclusivamente para momentos de alta distracción con súper premio, su fiabilidad de respuesta se mantiene al 100%."
  },
  {
    id: "tumbado_emergencia_stop",
    title: "Detención Rápida & Parada en Seco ('¡Stop!' / '¡Tierra!')",
    category: "Control a Distancia",
    icon: "fa-solid fa-hand",
    badgeColor: "var(--accent-purple)",
    difficulty: "Intermedio - Avanzado",
    duration: "10 min/día",
    summary: "Enseñar a Boo a detenerse o dejarse caer al suelo en el sitio a distancia. Es la herramienta perfecta para frenarla en seco si arranca hacia una pelota ajena o un juego ajeno.",
    steps: [
      "Enseñar el '¡Tierra!' o '¡Stop!' rápido de cerca: Con Boo de pie, bajar la mano con energía hacia el suelo diciendo '¡Tierra!'. Premiar la rapidez de caída.",
      "Práctica a distancia en el parque: Mientras camina suelta a 5-10 metros, dar la orden con el brazo en alto. Al frenar y tumbarse, acercaros vosotros a premiarla.",
      "Práctica con pelota rodando: Rodar una pelota y pedir '¡Stop!' a mitad de camino. Al frenar, premiar con fiesta y permitirle cobrar su juguete favorito."
    ],
    proTip: "Tumbarse en el suelo corta la línea de visión de Boo con la pelota o el perro distractor, bajando sus pulsaciones de inmediato."
  },
  {
    id: "parque_perros_desconexion",
    title: "Concentración en Parque con Otros Perros & Estímulos",
    category: "Gestión Emocional",
    icon: "fa-solid fa-shield-dog",
    badgeColor: "var(--accent-amber)",
    difficulty: "Intermedio",
    duration: "15-20 min",
    summary: "Eliminar la sobreexcitación de Boo cuando hay jaurías de perros corriendo o pelotas botando en el parque, enseñándole a mantener la calma y el foco en Carlos y Andrea mientras disfruta suelta.",
    steps: [
      "Contacto visual entre perros: Cuando haya perros jugando a 15 metros, pedirle un 'Sentado' y premiar cada contacto visual espontáneo hacia vosotros.",
      "Juegos de olfateo ('Busca'): Esparcir premios en el césped para inducir olfateo. La bajada de cabeza al suelo reduce el ritmo cardíaco y desconecta la mente del estímulo visual.",
      "Cambios de sentido en juego: Mientras va suelta, cambiar de dirección con alegría ('¡Por aquí!') para que Boo esté siempre pendiente de vuestra posición.",
      "Engancha y suelta positivo: Llamarla en medio del parque, acariciarla, darle un premio rico y soltarla inmediatamente a seguir corriendo."
    ],
    proTip: "El Border Collie aprende por patrones. Si acudir a vosotros significa seguir jugando suelta, vendrá siempre con la máxima velocidad."
  },
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

export const BOO_FOCUS_AND_BALLS_PROGRAM = {
  id: "programa_foco_pelotas",
  title: "Programa de Enfoque, Pelotas & Comandos Innegociables",
  subtitle: "Autocontrol con pelotas en movimiento, concentración en el parque y comando único infalible (paseo suelta)",
  version: "2.0",
  whyItHappens: "El Border Collie tiene una fijación innata con el movimiento rápido y las pelotas. Boo siempre va suelta y es sumamente obediente, pero ante picos de estímulos (muchos perros jugando, pelotas botando o niños corriendo) sube de revoluciones y se descentra. La solución no es atarla ni complicarse: el objetivo es enseñarle a gestionar el impulso con la pelota (esperar permiso, soltar a la orden), mantener la concentración cuando hay perros alrededor y fijar un comando único innegociable reservado para cuando necesitéis que vuelva al segundo.",
  goldenRules: [
    {
      title: "Comando Único Innegociable",
      desc: "Tened una palabra exclusiva (o silbato de doble tono) que solo se use cuando haya mucha distracción. Siempre se premia con fiesta y súper comida (dados de pavo o queso) para que nunca falle."
    },
    {
      title: "Vosotros Administráis la Pelota",
      desc: "La pelota no es de acceso continuo; es el premio final tras mantener la calma o acudir a la llamada. La calma es la llave que abre el juego."
    },
    {
      title: "Chequeo Voluntario Suelta (Check-in)",
      desc: "Mientras Boo corre y explora libre en el parque, premiar cada vez que se gire a mirar a Carlos o Andrea. Así mantendrá siempre un ojo puesto en vosotros."
    }
  ],
  sosProtocol: {
    title: "🎾 Pautas Clave para el Paseo Suelta",
    steps: [
      {
        step: 1,
        title: "Comando Único Innegociable:",
        action: "Usad la palabra clave o silbato con tono enérgico y alegre. Si está mirando una pelota ajena, soltad el comando y dad medio paso atrás."
      },
      {
        step: 2,
        title: "Movimiento Opuesto (Llamada en Carrera Inversa):",
        action: "Si Boo duda o se fija en algo veloz, llamadla mientras echáis a correr vosotros en dirección contraria con palmas. Su instinto la empujará a perseguiros a vosotros inmediatamente."
      },
      {
        step: 3,
        title: "Orden de Parada ('¡Stop!' o '¡Tierra!'):",
        action: "Si va a arrancar hacia una pelota o juego de otros perros, el comando '¡Tierra!' o '¡Stop!' con brazo en alto corta la carrera en seco mucho más fácil que hacerla volver."
      },
      {
        step: 4,
        title: "Engancha y Suelta en el Parque:",
        action: "Llamarla varias veces durante el paseo solo para darle un premio rico y soltarla a seguir corriendo de inmediato. Así no asociará volver con el fin de la diversión."
      }
    ]
  },
  phases: [
    {
      id: 1,
      name: "Fase 1: Comando Único Innegociable & Foco Rápido",
      icon: "fa-solid fa-bullhorn",
      color: "var(--accent-emerald)",
      objective: "Fijar un comando infalible de retorno para situaciones con estímulos altos.",
      steps: [
        {
          id: "prog_1_1",
          title: "1.1 Condicionar el Comando Único / Silbato ('¡AQUÍ YA!')",
          detail: "Elegir la señal única (palabra o silbato). Practicar 2-3 veces al día en momentos tranquilos, entregando 20 segundos de fiesta y comida muy rica (pavo/queso).",
          criteria: "Boo gira la cabeza como un resorte hacia ti al escuchar la señal.",
          tag: "Comando Único"
        },
        {
          id: "prog_1_2",
          title: "1.2 Contacto Visual Espontáneo en el Paseo Suelta",
          detail: "Paseando suelta en el parque, premiar cada vez que Boo se gire a miraros sin haberla llamado ('Check-in').",
          criteria: "Mantiene chequeos visuales voluntarios cada 20-30 segundos mientras explora.",
          tag: "Check-in"
        },
        {
          id: "prog_1_3",
          title: "1.3 Parada Rápida ('¡Stop!' / '¡Tierra!') de Cerca",
          detail: "Practicar frenada en seco a la orden vocal o bajando la mano, premiando la rapidez de caída.",
          criteria: "Se detiene o tumba en menos de 1 segundo a la orden.",
          tag: "Frenada"
        }
      ]
    },
    {
      id: 2,
      name: "Fase 2: Reactividad y Autocontrol con Pelotas",
      icon: "fa-solid fa-baseball",
      color: "var(--accent-amber)",
      objective: "Canalizar la obsesión por la pelota para que la calma sea el único modo de activarla.",
      steps: [
        {
          id: "prog_2_1",
          title: "2.1 Semáforo de Pelota (Sentado antes del Lanzamiento)",
          detail: "Pelota en la mano. Boo debe sentarse y mantener contacto visual relajado. Lanzar ÚNICAMENTE al dar la palabra de liberación ('¡Ya!').",
          criteria: "Espera quieta mirándote a los ojos sin saltar hasta que dices '¡Ya!'.",
          tag: "Pelota"
        },
        {
          id: "prog_2_2",
          title: "2.2 Comando '¡Deja!' con Pelota Rodando",
          detail: "Hacer rodar la pelota suavemente frente a ella a 3 metros diciendo '¡Deja!'. El premio viene de vuestra mano (salchicha/pavo), no de la pelota.",
          criteria: "Ignora la pelota rodando y se gira a cobrar de vuestra mano.",
          tag: "Autocontrol"
        },
        {
          id: "prog_2_3",
          title: "2.3 Ignorar Pelota en el Suelo durante el Paseo",
          detail: "Dejar una pelota en el césped a 4 metros. Pasar caminando suelta con Boo; premiar que pase de largo a vuestro lado sin abalanzarse.",
          criteria: "Pasa al lado de la pelota quieta mirando al guía.",
          tag: "Foco"
        }
      ]
    },
    {
      id: 3,
      name: "Fase 3: Concentración en Parque con Perros & Distracciones",
      icon: "fa-solid fa-shield-dog",
      color: "var(--accent-cyan)",
      objective: "Evitar que se descentre cuando otros perros corren o hay ambiente agitado en el parque.",
      steps: [
        {
          id: "prog_3_1",
          title: "3.1 Foco en Carlos y Andrea con Perros Cerca",
          detail: "En el parque con otros perros jugando a 15 metros, pedir un par de ejercicios divertidos (dar pata, giro, sentado) premiando con fiesta.",
          criteria: "Mantiene la concentración en vosotros a pesar de los perros jugando cerca.",
          tag: "Parque"
        },
        {
          id: "prog_3_2",
          title: "3.2 Desconexión de Pelotas Ajenas",
          detail: "Cuando otro perro o dueño tire una pelota a 20 metros, llamar a Boo con entusiasmo o dar media vuelta; premiar que os siga a vosotros.",
          criteria: "No sale disparada a por la pelota ajena y acude a vuestro lado.",
          tag: "Desconexión"
        },
        {
          id: "prog_3_3",
          title: "3.3 Rutina 'Engancha, Premia y Suelta'",
          detail: "Hacer 5-6 llamadas durante el tiempo de parque suelta solo para dar premio, caricia de 5s y volver a soltarla inmediatamente.",
          criteria: "Acude a la llamada rápida y feliz porque sabe que volverá a jugar.",
          tag: "Llamada"
        }
      ]
    },
    {
      id: 4,
      name: "Fase 4: Detención en Carrera & Foco Total",
      icon: "fa-solid fa-trophy",
      color: "var(--accent-purple)",
      objective: "Control a distancia fluido para frenar impulsos en cualquier situación.",
      steps: [
        {
          id: "prog_4_1",
          title: "4.1 Cortar la Carrera de Pelota a Mitad de Camino",
          detail: "Lanzar su pelota favorita y, cuando Boo va a mitad de carrera, soltar '¡Tierra!' o el comando único innegociable. Si frena y vuelve: jackpot supremo.",
          criteria: "Es capaz de abortar la carrera hacia la pelota a la orden.",
          tag: "Corte Impulso"
        },
        {
          id: "prog_4_2",
          title: "4.2 Llamada Única Innegociable en Plena Distracción",
          detail: "Probar el comando único cuando esté en un juego activo con otros perros; debe acudir de inmediato para su premio top.",
          criteria: "Abandona el juego al primer aviso y corre directa hacia vosotros.",
          tag: "Innegociable"
        },
        {
          id: "prog_4_3",
          title: "4.3 Paseo Suelta Fluido y Equilibrado",
          detail: "Paseo habitual suelta por parque o monte, con atención espontánea, respuesta a la primera y autocontrol total con pelotas.",
          criteria: "Disfrute pleno suelta con desconexión natural y atención constante.",
          tag: "Maestría"
        }
      ]
    }
  ]
};

export const BOO_IMPULSE_CONTROL_PROGRAM = BOO_FOCUS_AND_BALLS_PROGRAM;

export const BOO_WEEKLY_SCHEDULE = {
  Lunes: {
    day: "Lunes",
    theme: "Autocontrol con Pelota & Foco en Parque",
    focusTitle: "Lunes: Autocontrol con Pelota & Foco en Parque",
    focusText: "Gestión de impulsos con pelota rodando y atención espontánea paseando suelta",
    tasks: [
      { id: "b_lun_1", module: "ansiedad_pelota", title: "Semáforo con Pelota (Sentado y Espera)", text: "10 min de espera en sentado con pelota antes de lanzar", detail: "Boo sentada y en calma; lanzar la pelota ÚNICAMENTE tras la orden de liberación '¡Ya!'", duration: "10 min" },
      { id: "b_lun_2", module: "control_estimulos_ninos", title: "Comando '¡Deja!' ante Pelota Rodando", text: "Hacer rodar pelota a 3m y premiar que no se lance", detail: "Hacer rodar pelota suavemente diciendo '¡Deja!'; recompensar con súper premio desde la mano", duration: "10 min" },
      { id: "b_lun_3", module: "llamada_positiva", title: "Chequeos Voluntarios Suelta", text: "Premiar 10 contactos visuales espontáneos mientras pasea suelta", detail: "Premiar cada vez que Boo se gire a mirar a Carlos o Andrea durante el paseo suelta", duration: "Paseo" }
    ]
  },
  Martes: {
    day: "Martes",
    theme: "Comando Único Innegociable & Parque con Perros",
    focusTitle: "Martes: Comando Único Innegociable & Parque con Perros",
    focusText: "Práctica del comando exclusivo de retorno y desconexión de otros perros",
    tasks: [
      { id: "b_mar_1", module: "llamada_emergencia", title: "Práctica del Comando Único ('¡AQUÍ YA!')", text: "3 toques de señal única con premio extraordinario de pavo/queso", detail: "Llamar con el comando único innegociable a 15m; premiar con 20 segundos de fiesta y comida top", duration: "10 min" },
      { id: "b_mar_2", module: "parque_perros_desconexion", title: "Concentración con Otros Perros en Parque", text: "Ejercicios de foco (dar pata, quieto) con perros jugando cerca", detail: "Mantener la atención de Boo en vosotros mientras otros perros juegan a 15-20 metros", duration: "15 min" },
      { id: "b_mar_3", module: "llamada_positiva", title: "Engancha, Premia y Suelta", text: "6 llamadas intermedias en el parque para premiar y soltar al segundo", detail: "Llamar a Boo en pleno parque, darle un premio rico y soltarla a seguir corriendo de inmediato", duration: "15 min" }
    ]
  },
  Miércoles: {
    day: "Miércoles",
    theme: "Detención Rápida ('¡Stop!' / '¡Tierra!') & Foco",
    focusTitle: "Miércoles: Detención Rápida ('¡Stop!' / '¡Tierra!') & Foco",
    focusText: "Frenado en seco a distancia para cortar carreras hacia estímulos ajenos",
    tasks: [
      { id: "b_mie_1", module: "tumbado_emergencia_stop", title: "Práctica de '¡Stop!' / '¡Tierra!' a Distancia", text: "8 repeticiones de parada en seco con mano alzada mientras camina", detail: "Con Boo a 5 metros suelta, dar orden '¡Tierra!' con brazo alzado; premiar la frenada instantánea", duration: "10 min" },
      { id: "b_mie_2", module: "control_estimulos_ninos", title: "Ignorar Pelota en el Suelo", text: "Caminar suelta al lado de una pelota en el césped sin tocarla", detail: "Pasar caminando junto a una pelota en reposo; premiar que mantenga el foco en vosotros", duration: "15 min" },
      { id: "b_mie_3", module: "paseo_junto", title: "Paseo Junto con Cambios de Ritmo", text: "Caminar pegada a la pierna con aceleraciones y paradas", detail: "Coordinar el paso acelerando y frenando mientras mantiene contacto visual alegre", duration: "15 min" }
    ]
  },
  Jueves: {
    day: "Jueves",
    theme: "Paseo de Olfateo Calmo & Llamadas de Juego",
    focusTitle: "Jueves: Paseo de Olfateo Calmo & Llamadas de Juego",
    focusText: "Reducción de excitación mediante olfateo libre y llamadas positivas",
    tasks: [
      { id: "b_jue_1", module: "paseo_relajado", title: "Paseo de Olfateo Libre de Descompresión", text: "Paseo suelta tranquilo permitiendo olfatear sin prisas", detail: "Paseo relajado dejando que Boo olfatee libremente (baja las pulsaciones y el cortisol)", duration: "25 min" },
      { id: "b_jue_2", module: "llamada_positiva", title: "Llamada Jackpot al Cierre", text: "Llamada final con premio especial 'Jackpot' de pavo", detail: "Llamada final con premio extraordinario de pavo al concluir el tiempo de parque", duration: "5 min" },
      { id: "b_jue_3", module: "ansiedad_pelota", title: "Autocontrol y Búsqueda de Pelota", text: "Esconder la pelota en la hierba para que la busque olfateando", detail: "Hacer 'Busca' de la pelota en hierba alta en lugar de lanzarla, canalizando el olfato", duration: "10 min" }
    ]
  },
  Viernes: {
    day: "Viernes",
    theme: "Corte de Carrera con Pelota & Comando Único",
    focusTitle: "Viernes: Corte de Carrera con Pelota & Comando Único",
    focusText: "Interrumpir la persecución de pelota con orden de parada en seco",
    tasks: [
      { id: "b_vie_1", module: "control_estimulos_ninos", title: "Abortar Pelota en Mitad de Carrera", text: "Lanzar pelota y pedir '¡Stop!' o '¡Tierra!' a mitad de camino", detail: "Lanzar pelota y cortar la carrera a la mitad con comando de parada; premiar con súper jackpot", duration: "15 min" },
      { id: "b_vie_2", module: "llamada_emergencia", title: "Prueba de Comando Único con Distracción", text: "Soltar comando único cuando esté jugando o mirando a otros perros", detail: "Comprobar la respuesta al comando único en pleno parque con perros activos", duration: "10 min" },
      { id: "b_vie_3", module: "paseo_relajado", title: "Paseo Fluido Suelta en Zona Concurrida", text: "Paseo suelta manteniendo la calma con paseantes y perros", detail: "Paseo fluido en parque transitado premiando los chequeos visuales espontáneos", duration: "20 min" }
    ]
  },
  Sábado: {
    day: "Sábado",
    theme: "Paseo Libre de Monte & Llamada Innegociable",
    focusTitle: "Sábado: Paseo Libre de Monte & Llamada Innegociable",
    focusText: "Respuesta a la llamada en entorno natural con olores intensos y sendero compartido",
    tasks: [
      { id: "b_sab_1", module: "llamada_emergencia", title: "Llamada Única en Sendero de Monte", text: "3 llamadas sorpresa de retorno mientras corre libre por el monte", detail: "Practicar llamada única con ciclistas o caminantes cruzando a lo lejos; fiesta extrema al volver", duration: "25 min" },
      { id: "b_sab_2", module: "paseo_junto", title: "Caminata Junto en Tramos Estrechos", text: "Caminar al lado en senderos estrechos coordinando el paso", detail: "Caminar pegada a la pierna en zonas de sendero estrecho o cruces con otros paseantes", duration: "20 min" },
      { id: "b_sab_3", module: "ansiedad_pelota", title: "Juego de Frisbee/Pelota con Liberación Calmada", text: "Cobro dinámico de frisbee o pelota solo tras la orden '¡Ya!'", detail: "Sesión de cobro deportivo exigiendo entrega en la mano y espera en sentado", duration: "15 min" }
    ]
  },
  Domingo: {
    day: "Domingo",
    theme: "Paseo en Familia & Vínculo Positivo",
    focusTitle: "Domingo: Paseo en Familia & Vínculo Positivo",
    focusText: "Sesión lúdica y relajante en familia fortaleciendo el vínculo emocional",
    tasks: [
      { id: "b_dom_1", module: "llamada_positiva", title: "Llamadas Cruzadas entre Carlos y Andrea", text: "Llamadas lúdicas alternadas entre Carlos y Andrea premiando la llegada", detail: "Llamadas divertidas de un extremo al otro premiando la velocidad de retorno con alegría", duration: "15 min" },
      { id: "b_dom_2", module: "paseo_relajado", title: "Paseo Libre y Regenerativo", text: "Paseo relajado sin prisas disfrutando de la naturaleza suelta", detail: "Paseo totalmente libre disfrutando del entorno y explorando a su ritmo", duration: "25 min" },
      { id: "b_dom_3", module: "ansiedad_pelota", title: "Masaje de Relajación Canina", text: "Masaje de soltado muscular y caricias suaves tras los paseos", detail: "Masaje de soltado muscular en el lomo y pecho tras la caminata", duration: "10 min" }
    ]
  }
};

export const BOO_CONTINUOUS_REINFORCEMENT = [
  {
    id: "cont_comando_unico",
    title: "Comando Único Innegociable ('¡AQUÍ YA!')",
    icon: "fa-solid fa-bullhorn",
    color: "var(--accent-emerald)",
    desc: "Reservar una llamada exclusiva para momentos de mucha distracción. Siempre se celebra a lo grande con pavo o queso.",
    detail: "No gastarlo para cosas rutinarias ni para regañar. Si acude a este comando, siempre recibe la mayor fiesta del paseo.",
    tip: "Acompañadlo dando medio paso atrás para incentivar su aceleración hacia vosotros."
  },
  {
    id: "cont_autocontrol_pelotas",
    title: "Autocontrol con Pelotas (Esperar la orden '¡Ya!')",
    icon: "fa-solid fa-baseball",
    color: "var(--accent-amber)",
    desc: "No permitir que salga disparada a por una pelota rodando hasta que deis la palabra de liberación ('¡Ya!').",
    detail: "La pelota la administráis vosotros. Si arranca sin permiso, pisad la pelota y reiniciad en calma.",
    tip: "Enseñar que la calma es la única llave que abre el juego."
  },
  {
    id: "cont_mirame",
    title: "Contacto Visual Espontáneo en Libertad ('Check-in')",
    icon: "fa-solid fa-eye",
    color: "var(--accent-cyan)",
    desc: "Premiar cada vez que Boo pasea suelta y se gira a mirar a Carlos o Andrea espontáneamente.",
    detail: "Recompensar junto a la pierna. Esto refuerza que Boo mantenga siempre la conexión visual con vosotros mientras corre libre.",
    tip: "Un simple '¡Eso, muy bien!' con caricia rápida mantiene su foco activo sin interrumpir su exploración."
  },
  {
    id: "cont_llamada",
    title: "Engancha, Premia y Suelta (Retorno Feliz)",
    icon: "fa-solid fa-repeat",
    color: "var(--accent-purple)",
    desc: "Hacer 5-6 llamadas durante el paseo suelta solo para dar una chuche, acariciarla 5 segundos y volver a soltarla a jugar.",
    detail: "Evita que Boo asocie que acudir a la llamada significa el fin del juego o de su libertad.",
    tip: "Nunca llamar solo para marcharse a casa. Acudir debe ser parte del juego."
  }
];

export const BOO_TRICKS_BACKLOG = [
  {
    id: "trick_stop_tierra_emergencia",
    title: "¡Tierra! o Stop de Emergencia en Carrera",
    category: "selfcontrol",
    difficulty: "Avanzado",
    icon: "fa-solid fa-hand",
    badgeColor: "var(--accent-rose)",
    summary: "Detener a Boo en seco y hacerla caer al suelo inmediatamente a la orden vocal o con mano alzada.",
    desc: "Detener a Boo en seco y hacerla caer al suelo inmediatamente a la orden vocal o con mano alzada.",
    steps: [
      "Condicionar primero el '¡Tierra!' fulminante a 1 metro de distancia con premio en mano al suelo.",
      "Añadir distancia progresiva (3m, 5m, 10m) usando la señal del brazo alzado con la palma hacia ella.",
      "Practicar lanzando un juguete y dando la orden a mitad de camino. Premiar la frenada instantánea."
    ],
    proTip: "Es el comando de mayor seguridad del Border Collie: corta el acecho y la fijación visual con niños o animales."
  },
  {
    id: "trick_lat_desconexion",
    title: "Desenganche Automático (LAT) ante Estímulos",
    category: "selfcontrol",
    difficulty: "Intermedio",
    icon: "fa-solid fa-eye",
    badgeColor: "var(--accent-cyan)",
    summary: "Enseñar a Boo a ver a un niño o perro correr y, de forma automática, girarse a mirar a Carlos o Andrea.",
    desc: "Enseñar a Boo a ver a un niño o perro correr y, de forma automática, girarse a mirar a Carlos o Andrea.",
    steps: [
      "A 25 metros de un estímulo en movimiento, marcar '¡Bien!' en cuanto Boo mire al estímulo sin tensarse.",
      "Premiar en el muslo. Tras 15 repeticiones, no marcar: esperar a que ella sola gire la cabeza para pedir su premio.",
      "El estímulo exterior se convierte en el interruptor que activa el foco hacia sus guías."
    ],
    proTip: "Recompensa siempre con comida jugosa y olorosa (pavo o queso) para competir con la dopamina de la persecución."
  },
  {
    id: "trick_silbato_jackpot",
    title: "Condicionamiento del Silbato de Emergencia",
    category: "selfcontrol",
    difficulty: "Crucial",
    icon: "fa-solid fa-triangle-exclamation",
    badgeColor: "var(--accent-amber)",
    summary: "Sonido de doble silbato asociado a 30 segundos continuos de comida de valor supremo.",
    desc: "Sonido de doble silbato asociado a 30 segundos continuos de comida de valor supremo.",
    steps: [
      "Hacer sonar el silbato de doble tono en casa a 1 metro. Entregar inmediatamente premio continuo.",
      "Repetir 3 veces al día durante 7 días sin distracciones.",
      "Probar en jardín o exterior con línea larga: pitar y celebrar con fiesta extrema cuando acuda."
    ],
    proTip: "Un silbato penetra el viento, los gritos de los niños y las distancias mucho mejor que la voz humana."
  },
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
  window.CARLOS_WORKOUT_SCHEDULE = CARLOS_WORKOUT_SCHEDULE;
  window.ANDREA_WORKOUT_SCHEDULE = ANDREA_WORKOUT_SCHEDULE;
  window.WEEKLY_WORKOUT_SCHEDULE_BY_PROFILE = WEEKLY_WORKOUT_SCHEDULE_BY_PROFILE;
  window.getWeeklyWorkoutSchedule = getWeeklyWorkoutSchedule;
  window.INGREDIENT_CATEGORIES = INGREDIENT_CATEGORIES;
  window.BOO_TRAINING_MODULES = BOO_TRAINING_MODULES;
  window.BOO_IMPULSE_CONTROL_PROGRAM = BOO_IMPULSE_CONTROL_PROGRAM;
  window.BOO_WEEKLY_SCHEDULE = BOO_WEEKLY_SCHEDULE;
  window.BOO_CONTINUOUS_REINFORCEMENT = BOO_CONTINUOUS_REINFORCEMENT;
  window.BOO_TRICKS_BACKLOG = BOO_TRICKS_BACKLOG;
}
