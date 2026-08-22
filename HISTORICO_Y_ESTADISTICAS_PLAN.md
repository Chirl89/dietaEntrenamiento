# 📊 FitDuo: Planteamiento de Histórico, Estadísticas y Gamificación

Este documento detalla el análisis técnico, modelo de datos, diseño de interfaz (UI/UX), motor de estadísticas y sistema de logros para implementar el registro histórico de métricas diarias de actividad física, entrenamientos y salud sin sobrecargar la aplicación ni el almacenamiento.

---

## 1. 💾 Análisis de Almacenamiento & Huella de Datos

### ¿Cuánto ocupa realmente el histórico?
Al almacenar un vector consolidado por día y perfil (fecha, pasos, calorías activas, minutos de ejercicio, distancia, pisos, sueño, estado de entrenamientos y adherencia nutricional):

| Período | Tamaño estimado por perfil | Tamaño combinado (Dúo) |
| :--- | :--- | :--- |
| **1 Día** | ~150 - 200 bytes | ~350 bytes |
| **1 Mes (30 días)** | ~5 - 6 KB | ~11 KB |
| **1 Año (365 días)** | ~65 - 75 KB | ~140 KB |
| **5 Años** | ~350 KB | ~700 KB |

> **Conclusión técnica**: Almacenar el histórico completo en `localStorage` o sincronizarlo mediante el payload de **GitHub Gist / Cloud Sync** tiene un impacto prácticamente **nulo / despreciable** (menos de 1 MB tras varios años de uso diario continuado).

---

## 2. 🗄️ Modelo de Estructura de Datos (Data Schema)

Estructura indexada por perfil (`he` / `she`) y fecha en formato local ISO plano (`YYYY-MM-DD`):

```json
{
  "history": {
    "he": {
      "2026-08-20": {
        "steps": 10420,
        "moveKcal": 640,
        "exerciseMin": 48,
        "distanceKm": 7.8,
        "floors": 4,
        "sleep": "7h 45m",
        "hr": 68,
        "completedWorkouts": ["1A"],
        "isRestDay": false,
        "dietAdherence": 100
      },
      "2026-08-21": {
        "steps": 8950,
        "moveKcal": 520,
        "exerciseMin": 35,
        "distanceKm": 6.2,
        "floors": 2,
        "sleep": "7h 10m",
        "hr": 71,
        "completedWorkouts": ["1B"],
        "isRestDay": false,
        "dietAdherence": 90
      }
    },
    "she": {
      "2026-08-21": {
        "steps": 11200,
        "moveKcal": 480,
        "exerciseMin": 50,
        "distanceKm": 7.1,
        "floors": 6,
        "sleep": "8h 05m",
        "hr": 65,
        "completedWorkouts": ["2A"],
        "isRestDay": false,
        "dietAdherence": 95
      }
    }
  }
}
```

---

## 3. ⚙️ Recomendaciones Técnicas de Implementación

### A. Gestión de Fechas Locales vs UTC
* **Problema a evitar**: Usar `new Date().toISOString().split('T')[0]` genera desfases de fecha en horario nocturno (ej. a las 23:30 CET la fecha UTC ya es el día siguiente).
* **Solución**: Emplear siempre el formateador local ISO:
  ```javascript
  export function getLocalIsoDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  ```

### B. Consolidación Automática Segura (Snapshotting Inteligente)
* **Actualización en vivo**: Al sincronizar con Apple Watch / Shortcuts o marcar entrenamientos, se actualiza la entrada `history[profile][today]`.
* **Sincronización retroactiva**: Si un dispositivo envía métricas acumuladas de un día anterior (por sincronización tardía), se actualiza el día específico sin alterar las fechas posteriores.
* **Persistencia**: Se integra dentro de `saveState()` y se replica automáticamente a la nube en el snapshot general.

### C. Diferenciación de Estados de Actividad
Para calcular rachas y visualizaciones con precisión:
1. **🟢 Objetivo Cumplido**: Anillos de movimiento/pasos completados y entreno realizado.
2. **🟡 Actividad Parcial**: Parte de los objetivos diarios alcanzados.
3. **⚪ Descanso Programado (`isRestDay: true`)**: Día de recuperación según la rutina semanal (mantiene las rachas sin penalizar).
4. **⚫ Sin Datos**: Días en los que no se registraron métricas (ej. no se usó el reloj).

---

## 4. 🎨 Estrategia de UI / UX: Dashboard de Progreso e Histórico

Reemplazar el antiguo registro de peso en la pestaña **Progreso** ([`progressView.js`](file:///c:/Users/cgzla/Documents/Fitduo/dietaEntrenamiento/js/views/progressView.js)) por un centro analítico completo y limpio.

### A. Segmented Control de Períodos
`[ 7 Días ]` `[ 30 Días ]` `[ Mes Completo ]` `[ Logros & Rachas ]`

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 ESTADÍSTICAS Y RENDIMIENTO                               │
│  [ Últimos 7D ]   [ Últimos 30D ]   [ Heatmap ]   [ Logros ]│
└─────────────────────────────────────────────────────────────┘
```

### B. Componentes Visuales Clave
1. **Heatmap / Matriz de Consistencia Mensual (Estilo GitHub / Apple Fitness):**
   * Cuadrícula compacta del mes con códigos de color para visualizar el compromiso de un vistazo sin saturar la pantalla con tablas numéricas.
2. **Tarjetas de Rendimiento con Micro-Tendencias:**
   * Media diaria de pasos (7D vs 30D).
   * Gasto calórico activo acumulado semanal.
   * Total de entrenamientos completados vs programados.
3. **Gráficos de Barras Comparativos (Chart.js):**
   * Comparativa diaria de pasos vs objetivo (10.000).
   * Minutos de ejercicio activo acumulados por jornada.

---

## 5. 📈 Estadísticas Clave que Aportan Valor

Evitar saturar con números irrelevantes. Focalizarse en métricas accionables de actividad y salud:

1. **Adherencia y Constancia:**
   * % de cumplimiento de objetivos de movimiento en los últimos 30 días.
   * Ratio de entrenamientos completados vs planificados en el mes.
2. **Promedios Móviles y Tendencias:**
   * Comparativa de pasos diarios (Media 7 días vs Media 30 días) para detectar picos o descensos de actividad.
   * Volumen de tiempo de ejercicio semanal.
3. **Calidad de Descanso vs Actividad:**
   * Correlación entre horas de sueño (`sleep`) y rendimiento de pasos/energía al día siguiente.
4. **Récords Personales (PRs):**
   * Día récord de pasos históricos.
   * Día récord de calorías activas quemadas.
   * Mayor racha de días consecutivos cumpliendo objetivos de actividad.

---

## 6. 🏆 Sistema de Gamificación y Logros (Badges & Streaks)

### 🔥 Rachas (Streaks)
* **"En Llamas" (3 / 7 / 14 / 30 días):** Días seguidos alcanzando el objetivo de pasos o cerrando los 3 anillos.
* **"Disciplina de Hierro":** 4 semanas consecutivas completando el 100% de los entrenamientos semanales programados.
* **"Descanso Inteligente":** Respetar los días de descanso programados manteniendo la nutrición y recuperación.

### 🎖️ Medallas & Hitos Acumulados
* **"Maratoniano":** Acumular 42 km en distancia registrada.
* **"Club de los 100k":** Superar 100.000 pasos en una sola semana.
* **"Volcán":** Superar 1.000 kcal activas en una sola jornada.
* **"Nómada":** Alcanzar 10 pisos subidos en un único día.

### 👥 Logros en Pareja ("FitDuo")
* **"Sincronía Total":** Ambos completan su entrenamiento programado el mismo día.
* **"Dúo Imparable":** Ambos cierran todos sus anillos durante una semana completa.
* **"1 Millón de Pasos Compartido":** Hito acumulativo combinado entre los perfiles de Carlos y Andrea.
* **"Fin de Semana Activo":** Ambos superan 12.000 pasos tanto sábado como domingo.

---

## 7. 🚀 Hoja de Ruta de Implementación Sugerida

1. **Fase 1 - Modelo & Snapshotting Automático:**
   * Crear la clave `history` en el estado global (`appState.history`).
   * Añadir función de consolidación automática en fecha local al sincronizar reloj o completar rutinas.
   * Adaptar `cloudSync.js` y `state.js` para persistir el histórico en LocalStorage y nube.
2. **Fase 2 - Dashboard Visual en `progressView.js`:**
   * Eliminar el formulario y gráfica de peso en `index.html` y `progressView.js`.
   * Integrar selector de período (`7D` / `30D` / `Mes`).
3. **Fase 3 - Motor de Logros & Vitrina:**
   * Desarrollar el evaluador de insignias, rachas y logros Dúo en base a los datos históricos.
   * Crear vitrina visual interactiva de trofeos conseguidos y bloqueados.
