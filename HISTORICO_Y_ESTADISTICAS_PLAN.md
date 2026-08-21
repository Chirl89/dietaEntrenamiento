# 📊 FitDuo: Planteamiento de Histórico, Estadísticas y Gamificación

Este documento detalla el análisis técnico, modelo de datos, diseño de interfaz (UI/UX), motor de estadísticas y sistema de logros para implementar el registro histórico de métricas diarias sin sobrecargar la aplicación ni el almacenamiento.

---

## 1. 💾 Análisis de Almacenamiento & Huella de Datos

### ¿Cuánto ocupa realmente el histórico?
Al almacenar un vector consolidado por día y usuario (fecha, pasos, calorías activas, minutos de ejercicio, peso, estado de entrenamientos y adherencia nutricional):

| Período | Tamaño estimado por usuario | Tamaño combinado (Dúo) |
| :--- | :--- | :--- |
| **1 Día** | ~150 - 200 bytes | ~350 bytes |
| **1 Mes (30 días)** | ~5 - 6 KB | ~11 KB |
| **1 Año (365 días)** | ~65 - 75 KB | ~140 KB |
| **5 Años** | ~350 KB | ~700 KB |

> **Conclusión técnica**: Almacenar el histórico completo en `localStorage` o sincronizarlo mediante el payload de **GitHub Gist** tiene un impacto prácticamente **nulo / despreciable** (menos de 1 MB tras varios años de uso diario continuado).

---

## 2. 🗄️ Modelo de Estructura de Datos (Data Schema)

Estructura indexada por perfil (`he` / `she`) y fecha en formato ISO plano (`YYYY-MM-DD`):

```json
{
  "history": {
    "he": {
      "2026-08-20": {
        "steps": 10420,
        "moveKcal": 640,
        "exerciseMin": 48,
        "weight": 78.5,
        "completedWorkouts": ["1A"],
        "dietAdherence": 100
      },
      "2026-08-21": {
        "steps": 8950,
        "moveKcal": 520,
        "exerciseMin": 35,
        "weight": 78.3,
        "completedWorkouts": ["1B"],
        "dietAdherence": 90
      }
    },
    "she": {
      "2026-08-21": {
        "steps": 11200,
        "moveKcal": 480,
        "exerciseMin": 50,
        "weight": 61.2,
        "completedWorkouts": ["2A"],
        "dietAdherence": 95
      }
    }
  }
}
```

### Mecanismo de Consolidación Automática
* **Al recibir métricas del Apple Watch / Shortcuts:** Se actualiza o sobreescribe la entrada `history[profile][hoy]`.
* **Persistencia:** Se guarda en `localStorage` (`FITDUO_APP_STATE`) y se sincroniza en el snapshot de Gist / Cloud.

---

## 3. 🎨 Estrategia de UI / UX: Visualización Limpia sin Saturar

Para mantener la aplicación rápida, limpia y usable en el día a día, separamos la vista operativa (**Hoy**) de la vista analítica (**Progreso e Histórico**).

### A. Segmented Control de Períodos (Estilo iOS Salud / Fitness)
En la parte superior de la vista de Resumen o en una nueva subpestaña:
`[ Hoy ]` `[ 7 Días ]` `[ 30 Días ]` `[ Histórico & Logros ]`

```
┌─────────────────────────────────────────────────────────────┐
│  RESUMEN & SALUD                                           │
│  [ Hoy ]  [ Semana (7D) ]  [ Mes (30D) ]  [ Logros / Hitos ]│
└─────────────────────────────────────────────────────────────┘
```

### B. Componentes Visuales Recomendados
1. **Heatmap / Matriz de Actividad (Estilo GitHub / Duolingo):**
   * Cuadrícula compacta del mes con puntos de color:
     * 🟢 Verde: Anillos completados y entreno realizado.
     * 🟡 Amarillo: Actividad parcial.
     * ⚪ Gris: Día de descanso programado.
   * Proporciona una visión global de consistencia mensual con mínima carga visual.

2. **Tarjetas de Resumen con Micro-Tendencias (Sparklines):**
   * Ejemplo: Tarjeta **"Media Pasos (7D): 10.230"** con un gráfico de barras diminuto debajo y un tag `+8% vs sem. ant.`.

3. **Gráficos de Tendencias Claras (Canvas / Chart.js ligero):**
   * Gráfica de barras semanal de pasos y minutos de ejercicio.
   * Gráfica de línea de evolución de peso con media móvil de 7 días.

---

## 4. 📈 Estadísticas Clave que Aportan Valor

Evitar saturar con decenas de números irrelevantes. Focalizarse en métricas accionables:

1. **Adherencia y Constancia:**
   * % de cumplimiento de objetivos en los últimos 30 días.
   * Días de entreno completados vs planificados en el mes.
2. **Promedios Móviles:**
   * Comparativa de pasos diarios (Media 7 días vs Media 30 días) para detectar aumentos o caídas de actividad.
3. **Relación Gasto Energético vs Peso:**
   * Comparativa de déficit/balance calórico estimado frente a la evolución del peso.
4. **Récords Personales (PRs):**
   * Día récord de pasos históricos.
   * Día récord de calorías activas quemadas.
   * Mayor racha de días consecutivos entrenando / cumpliendo pasos.

---

## 5. 🏆 Sistema de Gamificación y Logros (Badges & Streaks)

El histórico permite activar insignias y recompensas visuales que fomentan la motivación individual y en pareja:

### 🔥 Rachas (Streaks)
* **"En Llamas" (3 / 7 / 14 / 30 días):** Días seguidos alcanzando el objetivo de pasos o cerrando los 3 anillos.
* **"Disciplina de Hierro":** 4 semanas consecutivas completando el 100% de los entrenamientos semanales.

### 🎖️ Medallas & Hitos Acumulados
* **"Maratoniano":** Acumular 42 km en pasos registrados.
* **"Club de los 100k":** Superar 100.000 pasos en una sola semana.
* **"Volcán":** Superar 1.000 kcal activas en una sola jornada.

### 👥 Logros en Pareja ("FitDuo")
* **"Sincronía Total":** Ambos completan su entrenamiento el mismo día.
* **"Dúo Imparable":** Ambos cierran todos sus anillos durante una semana completa.
* **"1 Millón de Pasos Compartido":** Hito acumulativo combinado entre los dos perfiles.

---

## 6. 🚀 Hoja de Ruta de Implementación Sugerida

1. **Fase 1 - Modelo & Sync:**
   * Crear la clave `history` en el estado global (`appState.history`).
   * Grabar automáticamente el snapshot del día en cada sincronización.
2. **Fase 2 - Interfaz de Estadísticas:**
   * Crear selector de período (`Hoy` / `7D` / `30D`).
   * Renderizar heatmap mensual de actividad y tarjetas de medias móviles.
3. **Fase 3 - Motor de Logros:**
   * Función evaluadora de rachas y medallas desbloqueadas.
   * Vitrina visual de trofeos en la pestaña de Ajustes o Salud.
