import { appState, saveState, getMasterProfileId, getTodayDayName, getLocalIsoDate, getDayNameFromDate, getDateForDayNameInCurrentWeek, triggerHapticTouch, showIosToast } from '../state.js';

let progressStepsChartInstance = null;
let progressExChartInstance = null;
export let currentProgressMainTab = 'data'; // 'data' | 'heatmap' | 'badges'
export let currentTimePeriod = '7d';        // '7d' | '30d' | '1y' | 'all'

export function setProgressMainTab(tab) {
  triggerHapticTouch();
  currentProgressMainTab = tab;
  
  document.querySelectorAll('.progress-segment-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`prog-tab-${tab}`);
  if (activeBtn) activeBtn.classList.add('active');

  renderProgressContent();
}

export function setTimePeriod(period) {
  triggerHapticTouch();
  currentTimePeriod = period;
  renderProgressContent();
}

export function setProgressPeriod(periodOrTab) {
  if (periodOrTab === 'heatmap' || periodOrTab === 'badges' || periodOrTab === 'data') {
    setProgressMainTab(periodOrTab);
  } else {
    currentProgressMainTab = 'data';
    setTimePeriod(periodOrTab);
  }
}

// Generate / Retrieve history entries for a given number of days (Zero Baseline)
export function getHistoricalData(profileId, daysCount = 7) {
  const pid = profileId || appState.activeProfileId || 'he';
  const historyMap = appState.history?.[pid] || {};
  const currentLive = appState.appleWatch?.metrics?.[pid] || {};

  const daysList = [];
  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateIso = getLocalIsoDate(d);
    const dayName = getDayNameFromDate(d);
    const shortLabel = `${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short' })}`;

    let entry = historyMap[dateIso];

    // Check if there is workout data in completedWorkouts for current week
    const currentWeekDateForDay = getDateForDayNameInCurrentWeek(dayName);
    const isCurrentWeekDay = (currentWeekDateForDay === dateIso);
    const dayWorkoutObj = isCurrentWeekDay ? appState.completedWorkouts?.[pid]?.[dayName] : null;
    const isWorkoutDoneInWeek = dayWorkoutObj && (dayWorkoutObj.done || (Array.isArray(dayWorkoutObj.sessions) && dayWorkoutObj.sessions.length > 0));
    const weekSessions = dayWorkoutObj && Array.isArray(dayWorkoutObj.sessions) ? dayWorkoutObj.sessions : (dayWorkoutObj?.watchData ? [dayWorkoutObj.watchData] : []);

    const workoutSessions = (entry && Array.isArray(entry.sessions) && entry.sessions.length > 0) 
      ? entry.sessions 
      : weekSessions;

    const workoutTotalMin = workoutSessions.reduce((acc, s) => acc + (Number(s.durationMin) || 0), 0);
    const workoutTotalKcal = workoutSessions.reduce((acc, s) => acc + (Number(s.kcal) || 0), 0);

    const hasWorkouts = (entry && Array.isArray(entry.completedWorkouts) && entry.completedWorkouts.length > 0) 
      || isWorkoutDoneInWeek 
      || workoutSessions.length > 0;

    const completedWorkoutsList = hasWorkouts 
      ? (entry?.completedWorkouts && entry.completedWorkouts.length > 0 ? entry.completedWorkouts : [dayName])
      : [];

    if (i === 0) {
      // Today: use live metrics merged with workout data and history
      const steps = Number(currentLive.steps !== undefined ? currentLive.steps : (entry?.steps || 0));
      const moveKcal = Math.max(Number(currentLive.moveKcal !== undefined ? currentLive.moveKcal : (entry?.moveKcal || 0)), workoutTotalKcal);
      const exerciseMin = Math.max(Number(currentLive.exerciseMin !== undefined ? currentLive.exerciseMin : (entry?.exerciseMin || 0)), workoutTotalMin);
      const distanceKm = parseFloat(Number(currentLive.distanceKm !== undefined ? currentLive.distanceKm : (entry?.distanceKm || 0)).toFixed(2));
      const floors = Number(currentLive.floors !== undefined ? currentLive.floors : (entry?.floors || 0));
      const sleep = currentLive.sleep || entry?.sleep || "--";
      const hr = Number(currentLive.hr !== undefined ? currentLive.hr : (entry?.hr || 0));
      const isRestDay = entry?.isRestDay || false;
      const hasData = steps > 0 || moveKcal > 0 || exerciseMin > 0 || hasWorkouts || isRestDay;

      entry = {
        steps,
        moveKcal,
        exerciseMin,
        distanceKm,
        floors,
        sleep,
        hr,
        completedWorkouts: completedWorkoutsList,
        sessions: workoutSessions,
        isRestDay: isRestDay,
        hasData: hasData
      };
    } else if (!entry) {
      const isRestDay = false;
      const hasData = workoutTotalMin > 0 || workoutTotalKcal > 0 || hasWorkouts;

      entry = {
        steps: 0,
        moveKcal: workoutTotalKcal,
        exerciseMin: workoutTotalMin,
        distanceKm: 0,
        floors: 0,
        sleep: "--",
        hr: 0,
        completedWorkouts: completedWorkoutsList,
        sessions: workoutSessions,
        isRestDay: isRestDay,
        hasData: hasData
      };
    } else {
      const isRestDay = entry.isRestDay || false;
      const moveKcal = Math.max(entry.moveKcal || 0, workoutTotalKcal);
      const exerciseMin = Math.max(entry.exerciseMin || 0, workoutTotalMin);
      const hasData = (entry.steps > 0 || moveKcal > 0 || exerciseMin > 0 || hasWorkouts || isRestDay);

      entry = {
        ...entry,
        moveKcal,
        exerciseMin,
        completedWorkouts: completedWorkoutsList,
        sessions: workoutSessions,
        isRestDay,
        hasData
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

// Calculate comprehensive profile statistics with dynamic period comparison
export function calculateProfileStats(profileId, period = '7d') {
  const pid = profileId || appState.activeProfileId || 'he';
  
  let daysCount = 7;
  let prevDaysCount = 7;
  let diffLabel = 'vs 7 días prev.';

  if (period === '30d') {
    daysCount = 30;
    prevDaysCount = 30;
    diffLabel = 'vs 30 días prev.';
  } else if (period === '1y') {
    daysCount = 365;
    prevDaysCount = 365;
    diffLabel = 'vs año anterior';
  } else if (period === 'all') {
    daysCount = 365 * 3;
    prevDaysCount = 0;
    diffLabel = 'histórico total';
  }

  // Retrieve total days: current window + previous comparison window
  const totalDaysNeeded = daysCount + prevDaysCount;
  const fullData = getHistoricalData(pid, totalDaysNeeded);

  // Split into current period and previous period
  const curData = fullData.slice(prevDaysCount);
  const prevData = prevDaysCount > 0 ? fullData.slice(0, prevDaysCount) : [];

  const curDaysWithData = curData.filter(d => d.hasData);
  const prevDaysWithData = prevData.filter(d => d.hasData);

  const avgSteps = curDaysWithData.length > 0 
    ? Math.round(curDaysWithData.reduce((acc, d) => acc + (d.steps || 0), 0) / curDaysWithData.length) 
    : (curData.reduce((acc, d) => acc + (d.steps || 0), 0) > 0 ? Math.round(curData.reduce((acc, d) => acc + (d.steps || 0), 0) / curData.length) : 0);

  const avgStepsPrev = prevDaysWithData.length > 0 
    ? Math.round(prevDaysWithData.reduce((acc, d) => acc + (d.steps || 0), 0) / prevDaysWithData.length) 
    : (prevData.reduce((acc, d) => acc + (d.steps || 0), 0) > 0 ? Math.round(prevData.reduce((acc, d) => acc + (d.steps || 0), 0) / prevData.length) : 0);

  const stepsDiffPct = (avgStepsPrev > 0 && avgSteps > 0) 
    ? Math.round(((avgSteps - avgStepsPrev) / avgStepsPrev) * 100) 
    : null;

  const totalKcal = curData.reduce((acc, d) => acc + (d.moveKcal || 0), 0);
  const totalExMin = curData.reduce((acc, d) => acc + (d.exerciseMin || 0), 0);
  const totalDist = parseFloat(curData.reduce((acc, d) => acc + (d.distanceKm || 0), 0).toFixed(1));

  // 7d & 30d specific metrics for backward compatibility with badges
  const data7d = fullData.slice(-7);
  const data30d = fullData.slice(-30);
  const daysWithData7d = data7d.filter(d => d.hasData);
  const daysWithData30d = data30d.filter(d => d.hasData);
  const avgSteps7d = daysWithData7d.length > 0 ? Math.round(daysWithData7d.reduce((acc, d) => acc + (d.steps || 0), 0) / daysWithData7d.length) : 0;
  const avgSteps30d = daysWithData30d.length > 0 ? Math.round(daysWithData30d.reduce((acc, d) => acc + (d.steps || 0), 0) / daysWithData30d.length) : 0;
  const totalKcal7d = data7d.reduce((acc, d) => acc + (d.moveKcal || 0), 0);
  const totalKcal30d = data30d.reduce((acc, d) => acc + (d.moveKcal || 0), 0);
  const totalExMin7d = data7d.reduce((acc, d) => acc + (d.exerciseMin || 0), 0);
  const totalExMin30d = data30d.reduce((acc, d) => acc + (d.exerciseMin || 0), 0);
  const totalDist7d = parseFloat(data7d.reduce((acc, d) => acc + (d.distanceKm || 0), 0).toFixed(1));
  const totalDist30d = parseFloat(data30d.reduce((acc, d) => acc + (d.distanceKm || 0), 0).toFixed(1));
  const workouts7d = data7d.filter(d => d.completedWorkouts && d.completedWorkouts.length > 0).length;
  const targetWorkouts7d = 5;
  const adherencePct = Math.min(100, Math.round((workouts7d / targetWorkouts7d) * 100));

  // Streaks calculation (Consecutive days >= 10,000 steps OR completed workout OR rest day)
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

  fullData.forEach(d => {
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
    period,
    daysCount,
    daysWithDataCount: curDaysWithData.length,
    avgSteps,
    avgStepsPrev,
    stepsDiffPct,
    diffLabel,
    totalKcal,
    totalExMin,
    totalDist,
    avgSteps7d,
    avgSteps30d,
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

export function getChartAggregatedData(pid, period) {
  const MONTH_NAMES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  if (period === '7d') {
    // 7 days daily aggregation
    const data7d = getHistoricalData(pid, 7);
    const labels = data7d.map(d => `${d.dayName.slice(0, 3)} ${d.shortLabel.split(' ')[0]}`);
    const steps = data7d.map(d => d.steps);
    const exerciseMin = data7d.map(d => d.exerciseMin);
    return {
      labels,
      steps,
      exerciseMin,
      stepsTitle: 'Pasos Diarios (7 Días)',
      exTitle: 'Minutos de Ejercicio Diarios',
      stepsUnit: 'pasos',
      exUnit: 'min',
      stepsSuggestedMax: 10000,
      exSuggestedMax: 30
    };
  }

  if (period === '30d') {
    // 30 days weekly aggregation (4-5 weeks)
    const data30d = getHistoricalData(pid, 30);
    const weekChunks = [];
    const chunkSize = 7;
    for (let i = 0; i < data30d.length; i += chunkSize) {
      weekChunks.push(data30d.slice(i, i + chunkSize));
    }

    const labels = [];
    const steps = [];
    const exerciseMin = [];

    weekChunks.forEach((chunk, idx) => {
      const startDay = chunk[0].shortLabel.split(' ')[0];
      const endDay = chunk[chunk.length - 1].shortLabel;
      const label = `Sem ${idx + 1} (${startDay}-${endDay})`;
      labels.push(label);

      const daysWithData = chunk.filter(d => d.hasData);
      const avgSteps = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((a, b) => a + b.steps, 0) / daysWithData.length)
        : (chunk.reduce((a, b) => a + b.steps, 0) > 0 ? Math.round(chunk.reduce((a, b) => a + b.steps, 0) / chunk.length) : 0);
      
      const avgExMin = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((a, b) => a + b.exerciseMin, 0) / daysWithData.length)
        : (chunk.reduce((a, b) => a + b.exerciseMin, 0) > 0 ? Math.round(chunk.reduce((a, b) => a + b.exerciseMin, 0) / chunk.length) : 0);

      steps.push(avgSteps);
      exerciseMin.push(avgExMin);
    });

    return {
      labels,
      steps,
      exerciseMin,
      stepsTitle: 'Media Diaria por Semanas (30 Días)',
      exTitle: 'Media Ejercicio Semanal',
      stepsUnit: 'pasos/día',
      exUnit: 'min/día',
      stepsSuggestedMax: 10000,
      exSuggestedMax: 30
    };
  }

  if (period === '1y' || period === 'all') {
    // 12 months monthly aggregation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const labels = [];
    const steps = [];
    const exerciseMin = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = `${MONTH_NAMES_SHORT[m]} ${String(y).slice(-2)}`;
      labels.push(label);

      const daysInMonth = new Date(y, m + 1, 0).getDate();
      let monthStepsSum = 0;
      let monthExMinSum = 0;
      let monthDaysWithData = 0;

      const historyMap = appState.history?.[pid] || {};

      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const dateObj = new Date(y, m, dayNum);
        if (dateObj > now) continue;
        const dateIso = getLocalIsoDate(dateObj);
        const entry = historyMap[dateIso];
        if (entry && (entry.hasData || entry.steps > 0 || entry.moveKcal > 0)) {
          monthStepsSum += (entry.steps || 0);
          monthExMinSum += (entry.exerciseMin || 0);
          monthDaysWithData++;
        }
      }

      if (y === currentYear && m === currentMonth) {
        const live = appState.appleWatch?.metrics?.[pid];
        if (live && live.steps > 0 && monthDaysWithData === 0) {
          monthStepsSum += live.steps;
          monthExMinSum += (live.exerciseMin || 0);
          monthDaysWithData++;
        }
      }

      const avgSteps = monthDaysWithData > 0 ? Math.round(monthStepsSum / monthDaysWithData) : 0;
      const avgExMin = monthDaysWithData > 0 ? Math.round(monthExMinSum / monthDaysWithData) : 0;

      steps.push(avgSteps);
      exerciseMin.push(avgExMin);
    }

    const titleSuffix = period === '1y' ? '(Último Año)' : '(Histórico)';
    return {
      labels,
      steps,
      exerciseMin,
      stepsTitle: `Media Diaria por Meses ${titleSuffix}`,
      exTitle: `Media Ejercicio por Meses ${titleSuffix}`,
      stepsUnit: 'pasos/día',
      exUnit: 'min/día',
      stepsSuggestedMax: 10000,
      exSuggestedMax: 30
    };
  }
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

  if (currentProgressMainTab === 'data') {
    renderPeriodOverview(currentTimePeriod, pid, pName, container);
  } else if (currentProgressMainTab === 'heatmap') {
    renderHeatmapView(pid, pName, container);
  } else if (currentProgressMainTab === 'badges') {
    renderBadgesView(pid, pName, container);
  }
}

function renderPeriodOverview(period, pid, pName, container) {
  const stats = calculateProfileStats(pid, period);
  const chartAgg = getChartAggregatedData(pid, period);
  const historyData = getHistoricalData(pid, 7);

  const periodLabels = {
    '7d': 'Últimos 7 Días',
    '30d': 'Últimos 30 Días',
    '1y': 'Último Año',
    'all': 'Histórico Completo'
  };
  const periodLabel = periodLabels[period] || 'Últimos 7 Días';

  const stepsDiffBadge = stats.stepsDiffPct !== null
    ? (stats.stepsDiffPct >= 0 
        ? `<span style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 6px;"><i class="fa-solid fa-arrow-trend-up"></i> +${stats.stepsDiffPct}% ${stats.diffLabel}</span>`
        : `<span style="font-size: 0.72rem; color: var(--accent-rose); font-weight: 700; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 6px;"><i class="fa-solid fa-arrow-trend-down"></i> ${stats.stepsDiffPct}% ${stats.diffLabel}</span>`
      )
    : `<span style="font-size: 0.72rem; color: var(--text-muted); background: rgba(255, 255, 255, 0.05); padding: 2px 6px; border-radius: 6px;">-- ${stats.diffLabel}</span>`;

  container.innerHTML = `
    <!-- TIME PERIOD SELECTOR (AL PRINCIPIO, CENTRADO) -->
    <div class="time-period-selector-wrapper">
      <div class="time-period-selector">
        <button type="button" class="time-period-btn ${period === '7d' ? 'active' : ''}" onclick="window.setTimePeriod('7d')">
          <i class="fa-solid fa-calendar-week"></i> 7 Días
        </button>
        <button type="button" class="time-period-btn ${period === '30d' ? 'active' : ''}" onclick="window.setTimePeriod('30d')">
          <i class="fa-solid fa-calendar-days"></i> 30 Días
        </button>
        <button type="button" class="time-period-btn ${period === '1y' ? 'active' : ''}" onclick="window.setTimePeriod('1y')">
          <i class="fa-solid fa-calendar"></i> 1 Año
        </button>
        <button type="button" class="time-period-btn ${period === 'all' ? 'active' : ''}" onclick="window.setTimePeriod('all')">
          <i class="fa-solid fa-timeline"></i> Histórico
        </button>
      </div>
    </div>

    <!-- SUMMARY METRICS CARDS -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
      <div class="glass-card stat-summary-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Media de Pasos</span>
          <i class="fa-solid fa-shoe-prints" style="color: var(--accent-emerald);"></i>
        </div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
          ${stats.avgSteps.toLocaleString()} <small style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">/ día</small>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.35rem; flex-wrap: wrap; gap: 0.3rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Meta: 10.000</span>
          ${stepsDiffBadge}
        </div>
      </div>

      <div class="glass-card stat-summary-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Gasto Activo Acumulado</span>
          <i class="fa-solid fa-fire" style="color: var(--accent-rose);"></i>
        </div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
          ${stats.totalKcal.toLocaleString()} <small style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">kcal</small>
        </div>
        <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
          Media: ~${stats.daysWithDataCount > 0 ? Math.round(stats.totalKcal / stats.daysWithDataCount) : 0} kcal / día
        </div>
      </div>

      <div class="glass-card stat-summary-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Tiempo de Ejercicio</span>
          <i class="fa-solid fa-stopwatch" style="color: var(--accent-amber);"></i>
        </div>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
          ${Math.floor(stats.totalExMin / 60)}h ${stats.totalExMin % 60}m
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
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">
          🔥 ${stats.currentStreak} Días
        </div>
        <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted);">
          Récord: ${stats.prSteps > 0 ? stats.prSteps.toLocaleString() + ' pasos (' + stats.prStepsDate + ')' : '--'}
        </div>
      </div>
    </div>

    <!-- CHARTS GRID -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
      <div class="glass-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-chart-simple" style="color: var(--accent-emerald);"></i> ${chartAgg.stepsTitle}
          </h3>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Objetivo 10k/día</span>
        </div>
        <div style="height: 240px; position: relative;">
          <canvas id="progressStepsChart"></canvas>
        </div>
      </div>

      <div class="glass-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-heart-pulse" style="color: var(--accent-amber);"></i> ${chartAgg.exTitle}
          </h3>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Objetivo 30 min/día</span>
        </div>
        <div style="height: 240px; position: relative;">
          <canvas id="progressExerciseChart"></canvas>
        </div>
      </div>
    </div>

    <!-- DAILY LOGS TABLE / RECENT DAYS LIST -->
    <div class="glass-card" style="padding: 1.25rem;">
      <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--text-main); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid fa-list-ul" style="color: var(--accent-cyan);"></i> Detalle de Jornadas Recientes (${pName})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        ${historyData.slice(-7).reverse().map(d => {
          const isGoalMet = d.hasData && d.steps >= 10000;
          const statusBadge = !d.hasData
            ? `<span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(0, 0, 0, 0.04); padding: 3px 8px; border-radius: 12px; border: 1px solid var(--border-color);"><i class="fa-solid fa-minus"></i> Sin datos</span>`
            : (d.isRestDay
                ? `<span style="font-size: 0.75rem; color: #0284c7; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-bed"></i> Descanso</span>`
                : (isGoalMet
                    ? `<span style="font-size: 0.75rem; color: #16a34a; background: rgba(16, 185, 129, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Cumplido</span>`
                    : `<span style="font-size: 0.75rem; color: #d97706; background: rgba(245, 158, 11, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-clock"></i> Parcial</span>`
                  )
              );
          
          const workoutsBadge = d.hasData && d.completedWorkouts && d.completedWorkouts.length > 0
            ? `<span style="font-size: 0.75rem; color: #9333ea; background: rgba(168, 85, 247, 0.15); padding: 3px 8px; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-dumbbell"></i> Entreno</span>`
            : '';

          const stepsText = d.hasData ? `${d.steps.toLocaleString()} pasos` : `Sin actividad registrada`;
          const detailsText = d.hasData ? `${d.moveKcal} kcal • ${d.exerciseMin} min ejerc. • ${d.distanceKm} km` : `Esperando sincronización de Apple Watch`;

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); flex-wrap: wrap; gap: 0.5rem; opacity: ${d.hasData ? '1' : '0.65'};">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(0,0,0,0.04); border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--text-main);">
                  <span>${d.dayName.slice(0, 3)}</span>
                  <span style="font-size: 0.65rem; color: var(--text-muted);">${d.shortLabel.split(' ')[0]}</span>
                </div>
                <div>
                  <div style="font-size: 0.92rem; font-weight: 700; color: ${d.hasData ? 'var(--text-main)' : 'var(--text-muted)'};">${stepsText}</div>
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

  setTimeout(() => {
    renderPeriodCharts(chartAgg);
  }, 50);
}

function renderPeriodCharts(chartAgg) {
  if (typeof Chart === 'undefined' || !chartAgg) return;

  const labels = chartAgg.labels;
  const stepsData = chartAgg.steps;
  const exMinData = chartAgg.exerciseMin;

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
              label: (ctx) => `${ctx.raw.toLocaleString()} ${chartAgg.stepsUnit}`
            }
          }
        },
        scales: {
          x: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { display: false } },
          y: { 
            ticks: { color: 'var(--text-muted)', font: { size: 10 } }, 
            grid: { color: 'rgba(156, 163, 175, 0.1)' },
            suggestedMax: chartAgg.stepsSuggestedMax || 10000,
            beginAtZero: true
          }
        }
      }
    });
  }

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
          backgroundColor: exMinData.map(v => v >= 30 ? 'rgba(168, 85, 247, 0.85)' : (v > 0 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(156, 163, 175, 0.1)')),
          borderColor: exMinData.map(v => v >= 30 ? '#a855f7' : (v > 0 ? '#f59e0b' : 'rgba(156, 163, 175, 0.2)')),
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
              label: (ctx) => `${ctx.raw} ${chartAgg.exUnit}`
            }
          }
        },
        scales: {
          x: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { display: false } },
          y: { 
            ticks: { color: 'var(--text-muted)', font: { size: 10 } }, 
            grid: { color: 'rgba(156, 163, 175, 0.1)' },
            suggestedMax: chartAgg.exSuggestedMax || 30,
            beginAtZero: true
          }
        }
      }
    });
  }
}

export let currentHeatmapYear = new Date().getFullYear();
export let currentHeatmapMonth = new Date().getMonth();

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function changeHeatmapMonth(delta) {
  triggerHapticTouch();
  currentHeatmapMonth += delta;
  if (currentHeatmapMonth < 0) {
    currentHeatmapMonth = 11;
    currentHeatmapYear--;
  } else if (currentHeatmapMonth > 11) {
    currentHeatmapMonth = 0;
    currentHeatmapYear++;
  }
  renderProgressContent();
}

export function setHeatmapMonth(monthIdx) {
  triggerHapticTouch();
  currentHeatmapMonth = parseInt(monthIdx);
  renderProgressContent();
}

export function setHeatmapYear(yearVal) {
  triggerHapticTouch();
  currentHeatmapYear = parseInt(yearVal);
  renderProgressContent();
}

export function resetHeatmapToCurrentMonth() {
  triggerHapticTouch();
  const now = new Date();
  currentHeatmapYear = now.getFullYear();
  currentHeatmapMonth = now.getMonth();
  renderProgressContent();
}

function renderHeatmapView(pid, pName, container) {
  const now = new Date();
  const year = currentHeatmapYear;
  const month = currentHeatmapMonth;
  const capitalizedMonth = MONTH_NAMES_ES[month];

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
    const dayName = getDayNameFromDate(d);
    if (isToday) {
      const isTodayWorkoutDone = !!appState.completedWorkouts?.[pid]?.[dayName]?.done;
      const steps = Number(currentLive.steps !== undefined ? currentLive.steps : (entry?.steps || 0));
      const moveKcal = Number(currentLive.moveKcal !== undefined ? currentLive.moveKcal : (entry?.moveKcal || 0));
      const exerciseMin = Number(currentLive.exerciseMin !== undefined ? currentLive.exerciseMin : (entry?.exerciseMin || 0));
      const hasWorkouts = (entry?.completedWorkouts && entry.completedWorkouts.length > 0) || isTodayWorkoutDone;
      const hasData = steps > 0 || moveKcal > 0 || exerciseMin > 0 || hasWorkouts;
      entry = {
        steps,
        moveKcal,
        exerciseMin,
        completedWorkouts: hasWorkouts ? [dayName] : [],
        sessions: entry?.sessions || [],
        isRestDay: entry?.isRestDay || false,
        hasData: hasData
      };
    }

    let status = 'none';
    let statusColor = 'rgba(156, 163, 175, 0.1)';
    let tooltip = `${dayNum} de ${capitalizedMonth}: Sin datos registrados`;

    if (isFuture) {
      status = 'future';
      statusColor = 'rgba(156, 163, 175, 0.05)';
      tooltip = `${dayNum} de ${capitalizedMonth}: Próximamente`;
    } else if (entry && entry.hasData) {
      if (entry.isRestDay) {
        status = 'rest';
        statusColor = 'rgba(56, 189, 248, 0.4)';
        restDaysCount++;
        tooltip = `${dayNum} de ${capitalizedMonth}: Día de Descanso Programado (${(entry.steps || 0).toLocaleString()} pasos)`;
      } else if (entry.steps >= 10000 || (entry.completedWorkouts && entry.completedWorkouts.length > 0)) {
        status = 'completed';
        statusColor = 'rgba(16, 185, 129, 0.85)';
        completedDaysCount++;
        tooltip = `${dayNum} de ${capitalizedMonth}: ¡Meta Cumplida! (${(entry.steps || 0).toLocaleString()} pasos, ${entry.moveKcal || 0} kcal)`;
      } else if (entry.steps > 0 || entry.moveKcal > 0) {
        status = 'partial';
        statusColor = 'rgba(245, 158, 11, 0.75)';
        partialDaysCount++;
        tooltip = `${dayNum} de ${capitalizedMonth}: Actividad Parcial (${(entry.steps || 0).toLocaleString()} pasos, ${entry.moveKcal || 0} kcal)`;
      }
    }

    const todayBorder = isToday ? 'border: 2px solid var(--accent-cyan); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);' : '';

    dayCells.push(`
      <div class="heatmap-tile ${status} ${isToday ? 'today' : ''}" style="background: ${statusColor}; ${todayBorder}" title="${tooltip}" onclick="window.showDayDetailToast('${dateIso}', ${dayNum}, '${capitalizedMonth}', ${(entry?.steps || 0)}, ${(entry?.moveKcal || 0)}, ${(entry?.exerciseMin || 0)}, ${!!entry?.isRestDay})">
        <span class="heatmap-day-num">${dayNum}</span>
      </div>
    `);
  }

  const monthOptions = MONTH_NAMES_ES.map((m, idx) => 
    `<option value="${idx}" ${idx === month ? 'selected' : ''}>${m}</option>`
  ).join('');

  const thisYear = new Date().getFullYear();
  const yearOptions = [thisYear - 1, thisYear, thisYear + 1].map(y => 
    `<option value="${y}" ${y === year ? 'selected' : ''}>${y}</option>`
  ).join('');

  const isCurrentMonth = (year === now.getFullYear() && month === now.getMonth());

  container.innerHTML = `
    <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--text-main); margin-bottom: 2px; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-border-all" style="color: var(--accent-cyan);"></i> Matriz de Consistencia
          </h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Visualización global del hábito y cumplimiento diario de ${pName}</p>
        </div>

        <!-- MONTH SELECTOR CONTROLS -->
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; background: rgba(0, 0, 0, 0.25); padding: 6px 10px; border-radius: 12px; border: 1px solid var(--border-color);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.changeHeatmapMonth(-1)" style="padding: 4px 9px; min-height: 32px;" title="Mes anterior">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <select class="custom-select" style="padding: 4px 8px; font-weight: 700; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;" onchange="window.setHeatmapMonth(this.value)">
            ${monthOptions}
          </select>

          <select class="custom-select" style="padding: 4px 8px; font-weight: 700; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;" onchange="window.setHeatmapYear(this.value)">
            ${yearOptions}
          </select>

          <button type="button" class="btn btn-secondary btn-sm" onclick="window.changeHeatmapMonth(1)" style="padding: 4px 9px; min-height: 32px;" title="Mes siguiente">
            <i class="fa-solid fa-chevron-right"></i>
          </button>

          ${!isCurrentMonth ? `
            <button type="button" class="btn btn-sm" onclick="window.resetHeatmapToCurrentMonth()" style="padding: 4px 8px; font-size: 0.75rem; background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 6px; cursor: pointer;">
              Mes Actual
            </button>
          ` : ''}
        </div>
      </div>

      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
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
          <span>Meta Cumplida</span>
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
          <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(156, 163, 175, 0.1); border: 1px solid var(--border-color);"></div>
          <span>Sin Datos / Futuro</span>
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
            <h2 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--text-main); margin-bottom: 2px;">
              Vitrina de Logros y Trofeos
            </h2>
            <p style="font-size: 0.8rem; color: var(--text-muted);">
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
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--text-main); margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
            ${cat === 'Racha' ? '🔥 Rachas de Constancia' : (cat === 'Individual' ? '🎖️ Hitos Individuales' : '👥 Logros FitDuo (En Pareja)')}
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            ${catBadges.map(b => `
              <div class="glass-card badge-card ${b.unlocked ? 'unlocked' : 'locked'}" style="padding: 1.1rem; border-radius: var(--radius-md); position: relative; overflow: hidden;">
                <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
                  <div class="badge-icon-box" style="width: 46px; height: 46px; border-radius: 12px; background: ${b.unlocked ? `linear-gradient(135deg, ${b.color}33, ${b.color}88)` : 'rgba(156, 163, 175, 0.1)'}; border: 1px solid ${b.unlocked ? b.color : 'var(--border-color)'}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: ${b.unlocked ? b.color : 'var(--text-muted)'}; flex-shrink: 0;">
                    <i class="${b.icon}"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                      <h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: ${b.unlocked ? 'var(--text-main)' : 'var(--text-muted)'}; margin: 0;">
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
                    <div style="width: 100%; height: 6px; background: rgba(156, 163, 175, 0.1); border-radius: 3px; overflow: hidden; margin-bottom: 4px;">
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
window.setProgressMainTab = setProgressMainTab;
window.setTimePeriod = setTimePeriod;
window.changeHeatmapMonth = changeHeatmapMonth;
window.setHeatmapMonth = setHeatmapMonth;
window.setHeatmapYear = setHeatmapYear;
window.resetHeatmapToCurrentMonth = resetHeatmapToCurrentMonth;
