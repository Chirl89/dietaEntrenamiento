import { appState, saveState, getMasterProfileId, getTodayDayName, getLocalIsoDate, triggerHapticTouch, showIosToast } from '../state.js';

let progressStepsChartInstance = null;
let progressExChartInstance = null;
let currentProgressPeriod = '7d';

export function setProgressPeriod(period) {
  triggerHapticTouch();
  currentProgressPeriod = period;
  
  document.querySelectorAll('.progress-segment-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`prog-tab-${period}`);
  if (activeBtn) activeBtn.classList.add('active');

  renderProgressContent();
}

// Generate / Retrieve history entries for a given number of days (Zero Baseline)
export function getHistoricalData(profileId, daysCount = 7) {
  const pid = profileId || appState.activeProfileId || 'he';
  const historyMap = appState.history?.[pid] || {};
  const currentLive = appState.appleWatch?.metrics?.[pid] || {};

  const daysList = [];
  const today = new Date();
  const dayNamesEs = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateIso = getLocalIsoDate(d);
    const dayName = dayNamesEs[d.getDay()];
    const shortLabel = `${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short' })}`;

    let entry = historyMap[dateIso];

    if (i === 0) {
      // Today: use actual live data from Apple Watch / shortcut or 0
      const isTodayWorkoutDone = !!appState.completedWorkouts?.[pid]?.[dayName]?.done;
      const steps = Number(currentLive.steps !== undefined ? currentLive.steps : (entry?.steps || 0));
      const moveKcal = Number(currentLive.moveKcal !== undefined ? currentLive.moveKcal : (entry?.moveKcal || 0));
      const exerciseMin = Number(currentLive.exerciseMin !== undefined ? currentLive.exerciseMin : (entry?.exerciseMin || 0));
      const distanceKm = parseFloat(Number(currentLive.distanceKm !== undefined ? currentLive.distanceKm : (entry?.distanceKm || 0)).toFixed(2));
      const floors = Number(currentLive.floors !== undefined ? currentLive.floors : (entry?.floors || 0));
      const sleep = currentLive.sleep || entry?.sleep || "--";
      const hr = Number(currentLive.hr !== undefined ? currentLive.hr : (entry?.hr || 0));
      const hasData = steps > 0 || moveKcal > 0 || exerciseMin > 0 || isTodayWorkoutDone;

      entry = {
        steps,
        moveKcal,
        exerciseMin,
        distanceKm,
        floors,
        sleep,
        hr,
        completedWorkouts: entry?.completedWorkouts || (isTodayWorkoutDone ? [dayName] : []),
        isRestDay: entry?.isRestDay || false,
        hasData: hasData
      };
    } else if (!entry) {
      // Clean zero baseline (no invented seed data)
      entry = {
        steps: 0,
        moveKcal: 0,
        exerciseMin: 0,
        distanceKm: 0,
        floors: 0,
        sleep: "--",
        hr: 0,
        completedWorkouts: [],
        isRestDay: false,
        hasData: false
      };
    } else {
      entry = {
        ...entry,
        hasData: (entry.steps > 0 || entry.moveKcal > 0 || entry.exerciseMin > 0 || (entry.completedWorkouts && entry.completedWorkouts.length > 0))
      };
    }

    daysList.push({
      dateIso,
      dayName,
      shortLabel,
      ...entry
    });
  }

  return daysList;
}

// Calculate comprehensive profile statistics
export function calculateProfileStats(profileId) {
  const pid = profileId || appState.activeProfileId || 'he';
  const data7d = getHistoricalData(pid, 7);
  const data30d = getHistoricalData(pid, 30);

  const daysWithData7d = data7d.filter(d => d.hasData);
  const daysWithData30d = data30d.filter(d => d.hasData);

  const avgSteps7d = daysWithData7d.length > 0 ? Math.round(daysWithData7d.reduce((acc, d) => acc + (d.steps || 0), 0) / daysWithData7d.length) : 0;
  const avgSteps30d = daysWithData30d.length > 0 ? Math.round(daysWithData30d.reduce((acc, d) => acc + (d.steps || 0), 0) / daysWithData30d.length) : 0;
  const stepsDiffPct = (avgSteps30d > 0 && daysWithData7d.length > 0) ? Math.round(((avgSteps7d - avgSteps30d) / avgSteps30d) * 100) : 0;

  const totalKcal7d = data7d.reduce((acc, d) => acc + (d.moveKcal || 0), 0);
  const totalKcal30d = data30d.reduce((acc, d) => acc + (d.moveKcal || 0), 0);

  const totalExMin7d = data7d.reduce((acc, d) => acc + (d.exerciseMin || 0), 0);
  const totalExMin30d = data30d.reduce((acc, d) => acc + (d.exerciseMin || 0), 0);

  const totalDist7d = parseFloat(data7d.reduce((acc, d) => acc + (d.distanceKm || 0), 0).toFixed(1));
  const totalDist30d = parseFloat(data30d.reduce((acc, d) => acc + (d.distanceKm || 0), 0).toFixed(1));

  // Workout adherence
  const workouts7d = data7d.filter(d => d.completedWorkouts && d.completedWorkouts.length > 0).length;
  const targetWorkouts7d = 5; // 5 days planned
  const adherencePct = Math.min(100, Math.round((workouts7d / targetWorkouts7d) * 100));

  // Streaks calculation (Consecutive days >= 10,000 steps OR completed workout)
  let currentStreak = 0;
  for (let i = data30d.length - 1; i >= 0; i--) {
    const d = data30d[i];
    if (d.hasData && (d.steps >= 10000 || (d.completedWorkouts && d.completedWorkouts.length > 0) || d.isRestDay)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Personal Records
  let prSteps = 0;
  let prStepsDate = '--';
  let prKcal = 0;
  let prKcalDate = '--';

  data30d.forEach(d => {
    if (d.hasData && d.steps > prSteps) {
      prSteps = d.steps;
      prStepsDate = d.shortLabel;
    }
    if (d.hasData && d.moveKcal > prKcal) {
      prKcal = d.moveKcal;
      prKcalDate = d.shortLabel;
    }
  });

  return {
    avgSteps7d,
    avgSteps30d,
    stepsDiffPct,
    daysWithData7dCount: daysWithData7d.length,
    daysWithData30dCount: daysWithData30d.length,
    totalKcal7d,
    totalKcal30d,
    totalExMin7d,
    totalExMin30d,
    totalDist7d,
    totalDist30d,
    workouts7d,
    targetWorkouts7d,
    adherencePct,
    currentStreak,
    prSteps,
    prStepsDate,
    prKcal,
    prKcalDate
  };
}

// Calculate Gamification Badges
export function calculateBadges(profileId) {
  const pid = profileId || appState.activeProfileId || 'he';
  const partnerPid = pid === 'he' ? 'she' : 'he';

  const stats = calculateProfileStats(pid);
  const data7d = getHistoricalData(pid, 7);
  const data30d = getHistoricalData(pid, 30);
  const partnerData7d = getHistoricalData(partnerPid, 7);

  const totalStepsCombined7d = data7d.reduce((a, b) => a + (b.steps || 0), 0) + partnerData7d.reduce((a, b) => a + (b.steps || 0), 0);
  const todayEntry = data7d[data7d.length - 1];
  const partnerToday = partnerData7d[partnerData7d.length - 1];

  const bothWorkoutsToday = (todayEntry?.hasData && todayEntry?.completedWorkouts?.length > 0) && (partnerToday?.hasData && partnerToday?.completedWorkouts?.length > 0);
  const maxSteps7d = data7d.filter(d => d.hasData).reduce((max, d) => Math.max(max, d.steps || 0), 0);
  const sumSteps7d = data7d.reduce((acc, d) => acc + (d.steps || 0), 0);
  const maxFloors = data30d.filter(d => d.hasData).reduce((max, d) => Math.max(max, d.floors || 0), 0);

  const badges = [
    // RACHAS
    {
      id: 'streak_3d',
      category: 'Racha',
      title: 'Chispa Activa',
      icon: 'fa-solid fa-fire-flame-curved',
      color: '#f59e0b',
      desc: 'Cumple objetivos o entrena 3 días seguidos.',
      unlocked: stats.currentStreak >= 3,
      progressPct: Math.min(100, Math.round((stats.currentStreak / 3) * 100)),
      progressText: `${Math.min(3, stats.currentStreak)} / 3 días`
    },
    {
      id: 'streak_7d',
      category: 'Racha',
      title: 'En Llamas (7D)',
      icon: 'fa-solid fa-fire',
      color: '#ef4444',
      desc: 'Mantén una racha de 7 días consecutivos.',
      unlocked: stats.currentStreak >= 7,
      progressPct: Math.min(100, Math.round((stats.currentStreak / 7) * 100)),
      progressText: `${Math.min(7, stats.currentStreak)} / 7 días`
    },
    {
      id: 'streak_14d',
      category: 'Racha',
      title: 'Imparable (14D)',
      icon: 'fa-solid fa-bolt',
      color: '#8b5cf6',
      desc: 'Supera 2 semanas completas de consistencia.',
      unlocked: stats.currentStreak >= 14,
      progressPct: Math.min(100, Math.round((stats.currentStreak / 14) * 100)),
      progressText: `${Math.min(14, stats.currentStreak)} / 14 días`
    },
    {
      id: 'streak_30d',
      category: 'Racha',
      title: 'Titán del Hábito (30D)',
      icon: 'fa-solid fa-crown',
      color: '#fbbf24',
      desc: 'Un mes completo de disciplina diaria ininterrumpida.',
      unlocked: stats.currentStreak >= 30,
      progressPct: Math.min(100, Math.round((stats.currentStreak / 30) * 100)),
      progressText: `${Math.min(30, stats.currentStreak)} / 30 días`
    },

    // HITOS INDIVIDUALES
    {
      id: 'badge_100k',
      category: 'Individual',
      title: 'Club de los 100k',
      icon: 'fa-solid fa-shoe-prints',
      color: '#10b981',
      desc: 'Acumula más de 100.000 pasos en los últimos 7 días.',
      unlocked: sumSteps7d >= 100000,
      progressPct: Math.min(100, Math.round((sumSteps7d / 100000) * 100)),
      progressText: `${sumSteps7d.toLocaleString()} / 100.000 pasos`
    },
    {
      id: 'badge_marathon',
      category: 'Individual',
      title: 'Maratoniano (42 km)',
      icon: 'fa-solid fa-person-running',
      color: '#06b6d4',
      desc: 'Acumula más de 42 km de distancia recorrida.',
      unlocked: stats.totalDist7d >= 42,
      progressPct: Math.min(100, Math.round((stats.totalDist7d / 42) * 100)),
      progressText: `${stats.totalDist7d} / 42.0 km`
    },
    {
      id: 'badge_volcano',
      category: 'Individual',
      title: 'Volcán de Energía',
      icon: 'fa-solid fa-volcano',
      color: '#f97316',
      desc: 'Quema más de 800 kcal activas en una sola jornada.',
      unlocked: stats.prKcal >= 800,
      progressPct: Math.min(100, Math.round((stats.prKcal / 800) * 100)),
      progressText: `${stats.prKcal} / 800 kcal máx`
    },
    {
      id: 'badge_climber',
      category: 'Individual',
      title: 'Escalador Urbano',
      icon: 'fa-solid fa-stairs',
      color: '#a855f7',
      desc: 'Sube 10 pisos o más en un único día.',
      unlocked: maxFloors >= 10,
      progressPct: Math.min(100, Math.round((maxFloors / 10) * 100)),
      progressText: `${maxFloors} / 10 pisos`
    },

    // FITDUO (LOGROS EN PAREJA)
    {
      id: 'duo_sync',
      category: 'FitDuo (Pareja)',
      title: 'Sincronía Total',
      icon: 'fa-solid fa-handshake-angle',
      color: '#ec4899',
      desc: 'Carlos y Andrea completan su entrenamiento el mismo día.',
      unlocked: bothWorkoutsToday,
      progressPct: bothWorkoutsToday ? 100 : ((todayEntry?.hasData && todayEntry?.completedWorkouts?.length > 0) || (partnerToday?.hasData && partnerToday?.completedWorkouts?.length > 0) ? 50 : 0),
      progressText: bothWorkoutsToday ? '¡Conseguido hoy!' : 'Pendiente hoy'
    },
    {
      id: 'duo_100k_pair',
      category: 'FitDuo (Pareja)',
      title: '150k Pasos Compartidos',
      icon: 'fa-solid fa-heart-circle-bolt',
      color: '#f43f5e',
      desc: 'Superar 150.000 pasos combinados entre ambos en 7 días.',
      unlocked: totalStepsCombined7d >= 150000,
      progressPct: Math.min(100, Math.round((totalStepsCombined7d / 150000) * 100)),
      progressText: `${totalStepsCombined7d.toLocaleString()} / 150.000 pasos`
    },
    {
      id: 'duo_weekend',
      category: 'FitDuo (Pareja)',
      title: 'Fin de Semana Activo',
      icon: 'fa-solid fa-champagne-glasses',
      color: '#38bdf8',
      desc: 'Ambos superan 10.000 pasos durante el fin de semana.',
      unlocked: (todayEntry.dayName === "Sábado" || todayEntry.dayName === "Domingo") && todayEntry.hasData && partnerToday.hasData && todayEntry.steps >= 10000 && partnerToday.steps >= 10000,
      progressPct: ((todayEntry.hasData && todayEntry.steps >= 10000) ? 50 : 0) + ((partnerToday.hasData && partnerToday.steps >= 10000) ? 50 : 0),
      progressText: 'Meta de fin de semana'
    }
  ];

  return badges;
}

export function renderProgressView() {
  const container = document.getElementById("progress-dynamic-container");
  if (!container) return;

  renderProgressContent();
}

export function renderProgressContent() {
  const container = document.getElementById("progress-dynamic-container");
  if (!container) return;

  const pid = appState.activeProfileId || 'he';
  const pName = appState.profiles[pid]?.name || 'Carlos';
  const stats = calculateProfileStats(pid);

  if (currentProgressPeriod === '7d' || currentProgressPeriod === '30d') {
    renderPeriodOverview(currentProgressPeriod, stats, pid, pName, container);
  } else if (currentProgressPeriod === 'heatmap') {
    renderHeatmapView(pid, pName, container);
  } else if (currentProgressPeriod === 'badges') {
    renderBadgesView(pid, pName, container);
  }
}

function renderPeriodOverview(period, stats, pid, pName, container) {
  const daysCount = period === '7d' ? 7 : 30;
  const historyData = getHistoricalData(pid, daysCount);
  const periodLabel = period === '7d' ? 'Últimos 7 Días' : 'Últimos 30 Días';
  const avgSteps = period === '7d' ? stats.avgSteps7d : stats.avgSteps30d;
  const totalKcal = period === '7d' ? stats.totalKcal7d : stats.totalKcal30d;
  const totalExMin = period === '7d' ? stats.totalExMin7d : stats.totalExMin30d;
  const totalDist = period === '7d' ? stats.totalDist7d : stats.totalDist30d;

  const stepsDiffBadge = stats.stepsDiffPct >= 0 
    ? `<span style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 6px;"><i class="fa-solid fa-arrow-trend-up"></i> +${stats.stepsDiffPct}% vs mes</span>`
    : `<span style="font-size: 0.72rem; color: var(--accent-rose); font-weight: 700; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 6px;"><i class="fa-solid fa-arrow-trend-down"></i> ${stats.stepsDiffPct}% vs mes</span>`;

  container.innerHTML = `
    <!-- SUMMARY METRICS CARDS -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
      <div class="glass-card stat-summary-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Media de Pasos</span>
          <i class="fa-solid fa-shoe-prints" style="color: var(--accent-emerald);"></i>
        </div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #fff; font-family: var(--font-heading);">
          ${avgSteps.toLocaleString()} <small style="font-size: 0.8rem; font-weight: 500; color: var(--text-secondary);">/ día</small>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.35rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Meta: 10.000</span>
          ${stepsDiffBadge}
        </div>
      </div>

      <div class="glass-card stat-summary-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Gasto Activo Acumulado</span>
          <i class="fa-solid fa-fire" style="color: var(--accent-rose);"></i>
        </div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #fff; font-family: var(--font-heading);">
          ${totalKcal.toLocaleString()} <small style="font-size: 0.8rem; font-weight: 500; color: var(--text-secondary);">kcal</small>
        </div>
        <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
          Media: ~${Math.round(totalKcal / daysCount)} kcal / día
        </div>
      </div>

      <div class="glass-card stat-summary-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Tiempo de Ejercicio</span>
          <i class="fa-solid fa-stopwatch" style="color: var(--accent-amber);"></i>
        </div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #fff; font-family: var(--font-heading);">
          ${Math.floor(totalExMin / 60)}h ${totalExMin % 60}m
        </div>
        <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
          Total en ${periodLabel.toLowerCase()}
        </div>
      </div>

      <div class="glass-card stat-summary-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Racha Activa & PR</span>
          <i class="fa-solid fa-fire-flame-curved" style="color: var(--accent-cyan);"></i>
        </div>
        <div style="font-size: 1.45rem; font-weight: 800; color: #fff; font-family: var(--font-heading);">
          🔥 ${stats.currentStreak} Días
        </div>
        <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
          Récord: ${stats.prSteps.toLocaleString()} pasos (${stats.prStepsDate})
        </div>
      </div>
    </div>

    <!-- CHARTS GRID -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
      <div class="glass-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-chart-simple" style="color: var(--accent-emerald);"></i> Pasos Diarios (${periodLabel})
          </h3>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Objetivo 10k</span>
        </div>
        <div style="height: 240px; position: relative;">
          <canvas id="progressStepsChart"></canvas>
        </div>
      </div>

      <div class="glass-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-heart-pulse" style="color: var(--accent-amber);"></i> Minutos de Ejercicio Diarios
          </h3>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Objetivo 30 min</span>
        </div>
        <div style="height: 240px; position: relative;">
          <canvas id="progressExerciseChart"></canvas>
        </div>
      </div>
    </div>

    <!-- DAILY LOGS TABLE / RECENT DAYS LIST -->
    <div class="glass-card" style="padding: 1.25rem;">
      <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid fa-list-ul" style="color: var(--accent-cyan);"></i> Detalle de Jornadas Recientes (${pName})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        ${historyData.slice(-7).reverse().map(d => {
          const isGoalMet = d.hasData && d.steps >= 10000;
          const statusBadge = !d.hasData
            ? `<span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 12px; border: 1px solid var(--border-color);"><i class="fa-solid fa-minus"></i> Sin datos</span>`
            : (d.isRestDay
                ? `<span style="font-size: 0.75rem; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-bed"></i> Descanso</span>`
                : (isGoalMet
                    ? `<span style="font-size: 0.75rem; color: var(--accent-emerald); background: rgba(16, 185, 129, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Cumplido</span>`
                    : `<span style="font-size: 0.75rem; color: var(--accent-amber); background: rgba(245, 158, 11, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-clock"></i> Parcial</span>`
                  )
              );
          
          const workoutsBadge = d.hasData && d.completedWorkouts && d.completedWorkouts.length > 0
            ? `<span style="font-size: 0.75rem; color: var(--accent-purple); background: rgba(168, 85, 247, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-dumbbell"></i> Entreno</span>`
            : '';

          const stepsText = d.hasData ? `${d.steps.toLocaleString()} pasos` : `Sin actividad registrada`;
          const detailsText = d.hasData ? `${d.moveKcal} kcal • ${d.exerciseMin} min ejerc. • ${d.distanceKm} km` : `Esperando sincronización de Apple Watch`;

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); flex-wrap: wrap; gap: 0.5rem; opacity: ${d.hasData ? '1' : '0.65'};">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff;">
                  <span>${d.dayName.slice(0, 3)}</span>
                  <span style="font-size: 0.65rem; color: var(--text-muted);">${d.shortLabel.split(' ')[0]}</span>
                </div>
                <div>
                  <div style="font-size: 0.92rem; font-weight: 700; color: ${d.hasData ? '#fff' : 'var(--text-secondary)'};">${stepsText}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${detailsText}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                ${workoutsBadge}
                ${statusBadge}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Render Charts with Chart.js
  setTimeout(() => {
    renderPeriodCharts(historyData);
  }, 50);
}

function renderPeriodCharts(historyData) {
  if (typeof Chart === 'undefined') return;

  const labels = historyData.map(d => `${d.dayName.slice(0, 2)} ${d.shortLabel.split(' ')[0]}`);
  const stepsData = historyData.map(d => d.steps);
  const exMinData = historyData.map(d => d.exerciseMin);

  // Steps Chart
  const ctxSteps = document.getElementById("progressStepsChart");
  if (ctxSteps) {
    if (progressStepsChartInstance) progressStepsChartInstance.destroy();
    progressStepsChartInstance = new Chart(ctxSteps, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pasos',
          data: stepsData,
          backgroundColor: stepsData.map(v => v >= 10000 ? 'rgba(16, 185, 129, 0.85)' : (v > 0 ? 'rgba(6, 182, 212, 0.7)' : 'rgba(255, 255, 255, 0.08)')),
          borderColor: stepsData.map(v => v >= 10000 ? '#10b981' : (v > 0 ? '#06b6d4' : 'rgba(255, 255, 255, 0.15)')),
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw.toLocaleString()} pasos`
            }
          }
        },
        scales: {
          x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { display: false } },
          y: { 
            ticks: { color: '#9ca3af', font: { size: 10 } }, 
            grid: { color: 'rgba(255,255,255,0.06)' },
            suggestedMax: 10000,
            beginAtZero: true
          }
        }
      }
    });
  }

  // Exercise Minutes Chart
  const ctxEx = document.getElementById("progressExerciseChart");
  if (ctxEx) {
    if (progressExChartInstance) progressExChartInstance.destroy();
    progressExChartInstance = new Chart(ctxEx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Minutos Ejercicio',
          data: exMinData,
          backgroundColor: exMinData.map(v => v >= 30 ? 'rgba(168, 85, 247, 0.85)' : (v > 0 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(255, 255, 255, 0.08)')),
          borderColor: exMinData.map(v => v >= 30 ? '#a855f7' : (v > 0 ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)')),
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw} min`
            }
          }
        },
        scales: {
          x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { display: false } },
          y: { 
            ticks: { color: '#9ca3af', font: { size: 10 } }, 
            grid: { color: 'rgba(255,255,255,0.06)' },
            suggestedMax: 30,
            beginAtZero: true
          }
        }
      }
    });
  }
}

function renderHeatmapView(pid, pName, container) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekIdx = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const historyMap = appState.history?.[pid] || {};
  const currentLive = appState.appleWatch?.metrics?.[pid] || {};
  const todayIso = getLocalIsoDate(now);

  const dayCells = [];

  // Padding for month start
  for (let p = 0; p < firstDayWeekIdx; p++) {
    dayCells.push(`<div class="heatmap-tile empty"></div>`);
  }

  let completedDaysCount = 0;
  let partialDaysCount = 0;
  let restDaysCount = 0;

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum);
    const dateIso = getLocalIsoDate(d);
    const isToday = dateIso === todayIso;
    const isFuture = d > now;

    let entry = historyMap[dateIso];
    if (isToday) {
      const isTodayWorkoutDone = !!appState.completedWorkouts?.[pid]?.[d.toLocaleDateString('es-ES', { weekday: 'long' })]?.done;
      const steps = Number(currentLive.steps !== undefined ? currentLive.steps : (entry?.steps || 0));
      const moveKcal = Number(currentLive.moveKcal !== undefined ? currentLive.moveKcal : (entry?.moveKcal || 0));
      const exerciseMin = Number(currentLive.exerciseMin !== undefined ? currentLive.exerciseMin : (entry?.exerciseMin || 0));
      const hasData = steps > 0 || moveKcal > 0 || exerciseMin > 0 || isTodayWorkoutDone;
      entry = {
        steps,
        moveKcal,
        exerciseMin,
        completedWorkouts: entry?.completedWorkouts || (isTodayWorkoutDone ? ["Entreno"] : []),
        isRestDay: entry?.isRestDay || false,
        hasData: hasData
      };
    }

    let status = 'none';
    let statusColor = 'rgba(255,255,255,0.05)';
    let tooltip = `${dayNum} ${capitalizedMonth}: Sin datos registrados`;

    if (isFuture) {
      status = 'future';
      statusColor = 'rgba(255,255,255,0.02)';
      tooltip = `${dayNum} ${capitalizedMonth}: Próximamente`;
    } else if (entry && entry.hasData) {
      if (entry.isRestDay) {
        status = 'rest';
        statusColor = 'rgba(56, 189, 248, 0.4)';
        restDaysCount++;
        tooltip = `${dayNum} ${capitalizedMonth}: Día de Descanso Programado (${(entry.steps || 0).toLocaleString()} pasos)`;
      } else if (entry.steps >= 10000 || (entry.completedWorkouts && entry.completedWorkouts.length > 0)) {
        status = 'completed';
        statusColor = 'rgba(16, 185, 129, 0.85)';
        completedDaysCount++;
        tooltip = `${dayNum} ${capitalizedMonth}: ¡Meta Cumplida! (${(entry.steps || 0).toLocaleString()} pasos, ${entry.moveKcal || 0} kcal)`;
      } else if (entry.steps > 0 || entry.moveKcal > 0) {
        status = 'partial';
        statusColor = 'rgba(245, 158, 11, 0.75)';
        partialDaysCount++;
        tooltip = `${dayNum} ${capitalizedMonth}: Actividad Parcial (${(entry.steps || 0).toLocaleString()} pasos, ${entry.moveKcal || 0} kcal)`;
      }
    }

    const todayBorder = isToday ? 'border: 2px solid var(--accent-cyan); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);' : '';

    dayCells.push(`
      <div class="heatmap-tile ${status} ${isToday ? 'today' : ''}" style="background: ${statusColor}; ${todayBorder}" title="${tooltip}" onclick="window.showDayDetailToast('${dateIso}', ${dayNum}, '${capitalizedMonth}', ${(entry?.steps || 0)}, ${(entry?.moveKcal || 0)}, ${(entry?.exerciseMin || 0)}, ${!!entry?.isRestDay})">
        <span class="heatmap-day-num">${dayNum}</span>
      </div>
    `);
  }

  container.innerHTML = `
    <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 2px;">
            <i class="fa-solid fa-border-all" style="color: var(--accent-cyan);"></i> Matriz de Consistencia (${capitalizedMonth})
          </h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Visualización global del hábito y cumplimiento diario de ${pName}</p>
        </div>
        <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
          <span style="font-size: 0.78rem; color: var(--accent-emerald); background: rgba(16, 185, 129, 0.15); padding: 4px 10px; border-radius: 12px; font-weight: 700;">
            🟢 ${completedDaysCount} Cumplidos
          </span>
          <span style="font-size: 0.78rem; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 4px 10px; border-radius: 12px; font-weight: 700;">
            ⚪ ${restDaysCount} Descansos
          </span>
          <span style="font-size: 0.78rem; color: var(--accent-amber); background: rgba(245, 158, 11, 0.15); padding: 4px 10px; border-radius: 12px; font-weight: 700;">
            🟡 ${partialDaysCount} Parciales
          </span>
        </div>
      </div>

      <!-- HEATMAP CALENDAR GRID -->
      <div class="heatmap-container">
        <div class="heatmap-weekdays-row">
          <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
        </div>
        <div class="heatmap-tiles-grid">
          ${dayCells.join('')}
        </div>
      </div>

      <!-- HEATMAP LEGEND -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 1.25rem; margin-top: 1.25rem; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-muted);">
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(16, 185, 129, 0.85);"></div>
          <span>Meta Cumplida (>=10k o entreno)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(245, 158, 11, 0.75);"></div>
          <span>Actividad Parcial</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(56, 189, 248, 0.4);"></div>
          <span>Descanso Programado</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);"></div>
          <span>Sin Datos</span>
        </div>
      </div>
    </div>
  `;
}

function renderBadgesView(pid, pName, container) {
  const badges = calculateBadges(pid);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;

  const categories = ['Racha', 'Individual', 'FitDuo (Pareja)'];

  container.innerHTML = `
    <!-- BADGES HERO BANNER -->
    <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15)); border: 1px solid rgba(245, 158, 11, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #fff; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
            🏆
          </div>
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 2px;">
              Vitrina de Logros y Trofeos
            </h2>
            <p style="font-size: 0.8rem; color: #e2e8f0;">
              Insignias de constancia individual y retos cooperativos en pareja
            </p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.4); padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent-amber); font-family: var(--font-heading);">${unlockedCount} / ${totalCount}</span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Desbloqueados</span>
        </div>
      </div>
    </div>

    <!-- BADGES CATEGORIES -->
    ${categories.map(cat => {
      const catBadges = badges.filter(b => b.category === cat);
      return `
        <div style="margin-bottom: 1.75rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
            ${cat === 'Racha' ? '🔥 Rachas de Constancia' : (cat === 'Individual' ? '🎖️ Hitos Individuales' : '👥 Logros FitDuo (En Pareja)')}
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            ${catBadges.map(b => `
              <div class="glass-card badge-card ${b.unlocked ? 'unlocked' : 'locked'}" style="padding: 1.1rem; border-radius: var(--radius-md); position: relative; overflow: hidden;">
                <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
                  <div class="badge-icon-box" style="width: 46px; height: 46px; border-radius: 12px; background: ${b.unlocked ? `linear-gradient(135deg, ${b.color}33, ${b.color}88)` : 'rgba(255,255,255,0.05)'}; border: 1px solid ${b.unlocked ? b.color : 'var(--border-color)'}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: ${b.unlocked ? b.color : 'var(--text-muted)'}; flex-shrink: 0;">
                    <i class="${b.icon}"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                      <h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: ${b.unlocked ? '#fff' : 'var(--text-secondary)'}; margin: 0;">
                        ${b.title}
                      </h4>
                      ${b.unlocked 
                        ? `<span style="font-size: 0.7rem; color: var(--accent-emerald); font-weight: 700; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 10px;"><i class="fa-solid fa-check"></i> Desbloqueado</span>`
                        : `<span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;"><i class="fa-solid fa-lock"></i> Bloqueado</span>`
                      }
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-muted); margin: 3px 0 8px 0; line-height: 1.3;">
                      ${b.desc}
                    </p>
                    
                    <!-- PROGRESS BAR -->
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 4px;">
                      <div style="width: ${b.progressPct}%; height: 100%; background: ${b.unlocked ? b.color : 'var(--accent-cyan)'}; border-radius: 3px; transition: width 0.4s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
                      <span>Progreso: ${b.progressPct}%</span>
                      <span>${b.progressText}</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('')}
  `;
}

// Global helper for day details toast
window.showDayDetailToast = function(dateIso, dayNum, monthName, steps, kcal, exMin, isRest) {
  triggerHapticTouch();
  const restText = isRest ? " (Día de Descanso)" : "";
  showIosToast(
    `📅 <strong>${dayNum} de ${monthName}${restText}</strong><br/>👟 ${steps.toLocaleString()} pasos • 🔥 ${kcal} kcal • ⏱️ ${exMin} min`,
    "fa-solid fa-calendar-day"
  );
};

window.setProgressPeriod = setProgressPeriod;
