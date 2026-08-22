/**
 * FitDuo & Collie Coach - Cloud Sync Engine (v0.14.0)
 * Multi-device PubNub background sync, differential workout resolution, and cloud diagnostics.
 */

import {
  appState,
  defaultWatchMetrics,
  defaultCloudReplica,
  LOCAL_STORAGE_KEY,
  LAST_REGISTERED_METRICS_KEY,
  getMasterProfileId,
  getProfileShortName,
  triggerHapticTouch,
  showIosToast,
  getTodayDayName,
  saveState
} from './state.js';
import {
  parseSmartMetricValue,
  parseSmartMetricFloatValue,
  formatSmartSleepValue,
  toUrlSafeB64,
  fromUrlSafeB64
} from './utils.js';

export const CLOUD_SYNC_APP_KEY = "fitduo_v2";
export const DEFAULT_CLOUD_KEY = "fitduo_sync_v2";
export let isCloudSyncing = false;

export function getCloudSyncKey() {
  return localStorage.getItem("FITDUO_CLOUD_KEY") || DEFAULT_CLOUD_KEY;
}

export function addSyncConsoleLog(message, type = "info") {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : type === "warn" ? "⚠️" : "ℹ️";
  const logLine = `[${timeStr}] ${icon} ${message}\n`;
  if (consoleEl) {
    consoleEl.textContent = logLine + consoleEl.textContent.slice(0, 1000);
  }
  console.log(`[SYNC CONSOLE ${type.toUpperCase()}] ${message}`);
}

export function clearWorkoutDiagnosticLogs() {
  const workoutConsole = document.getElementById("workout-sync-diagnostic-console");
  if (workoutConsole) workoutConsole.textContent = `[${new Date().toLocaleTimeString()}] 🧹 Logs de diagnóstico limpiados.\n`;
}

export function copyWorkoutDiagnosticLogs() {
  const workoutConsole = document.getElementById("workout-sync-diagnostic-console");
  const logsText = workoutConsole ? workoutConsole.textContent : "";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logsText).then(() => {
      showIosToast("📋 ¡Logs de diagnóstico copiados!", "fa-solid fa-copy");
    });
  } else {
    prompt("Copia los logs:", logsText);
  }
}

export function testSimulatedWorkoutPendingFlag() {
  triggerHapticTouch();
  const pid = appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  const curKcal = appState.appleWatch?.metrics?.[pid]?.moveKcal || 100;
  const curMin = appState.appleWatch?.metrics?.[pid]?.exerciseMin || 0;
  const curSteps = appState.appleWatch?.metrics?.[pid]?.steps || 0;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";

  addSyncConsoleLog(`🧪 Simulación: Flag puesto a "true" para ${authorName} (Base: ${curKcal} kcal, ${curMin} min)...`, "warn");
  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.pendingWorkout) appState.appleWatch.pendingWorkout = {};
  appState.appleWatch.pendingWorkout[pid] = {
    flag: "true",
    pending: true,
    startedAt: timeStr,
    startedAtTimetoken: String(Date.now() * 10000),
    datos_inicio_entrenamiento: {
      kcal: curKcal,
      exMin: curMin,
      steps: curSteps,
      timestamp: timeStr
    },
    snapshotKcal: curKcal,
    snapshotExMin: curMin,
    snapshotSteps: curSteps
  };
  saveState();
  if (window.renderAll) window.renderAll();
  showIosToast(`🏃 Flag: "true" (Iniciado). Base congelada: ${curKcal} kcal.`, "fa-solid fa-person-running");
}

export function testSimulatedWorkoutEndFlag() {
  triggerHapticTouch();
  const pid = appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  const pState = appState.appleWatch?.pendingWorkout?.[pid];
  if (!pState || pState.flag !== "true") {
    showIosToast("⚠️ Primero debes simular el inicio (Flag en true)", "fa-solid fa-triangle-exclamation");
    return;
  }
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
  pState.flag = "false";
  pState.endedAt = timeStr;
  pState.endedAtTimetoken = String(Date.now() * 10000);
  saveState();
  if (window.renderAll) window.renderAll();
  addSyncConsoleLog(`⏹️ Simulación: Flag puesto a "false" para ${authorName}. Esperando datos_fin.`, "warn");
  showIosToast(`⏹️ Flag: "false" (Finalizado). Esperando Salud.`, "fa-solid fa-flag-checkered");
}

export function resolvePendingWorkoutManually(forceKcal = null) {
  triggerHapticTouch();
  const pid = appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  const pState = appState.appleWatch?.pendingWorkout?.[pid];
  if (!pState || (pState.flag !== "true" && pState.flag !== "false" && !pState.pending)) {
    showIosToast("ℹ️ No hay entreno en curso o pendiente de resolver.", "fa-solid fa-circle-info");
    return;
  }

  const curKcal = appState.appleWatch?.metrics?.[pid]?.moveKcal || 150;
  const curExMin = appState.appleWatch?.metrics?.[pid]?.exerciseMin || 20;
  const initKcal = pState.datos_inicio_entrenamiento?.kcal ?? pState.snapshotKcal ?? 0;
  const initExMin = pState.datos_inicio_entrenamiento?.exMin ?? pState.snapshotExMin ?? 0;

  let deltaKcal = forceKcal !== null ? forceKcal : Math.max(0, curKcal - initKcal);
  let deltaMin = Math.max(0, curExMin - initExMin);
  if (deltaKcal === 0) deltaKcal = 120;
  if (deltaMin === 0) deltaMin = 25;

  const targetDay = getTodayDayName();
  if (!appState.completedWorkouts) appState.completedWorkouts = {};
  if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};
  if (!appState.completedWorkouts[pid][targetDay]) {
    appState.completedWorkouts[pid][targetDay] = { done: true, watchData: null, sessions: [] };
  }
  if (!Array.isArray(appState.completedWorkouts[pid][targetDay].sessions)) {
    appState.completedWorkouts[pid][targetDay].sessions = [];
  }
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
  const newSession = {
    id: `diff_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    deviceName: `Apple Watch (${authorName} - Resuelto Manual)`,
    durationMin: deltaMin,
    kcal: deltaKcal,
    timestamp: timeStr,
    autoSync: true
  };
  appState.completedWorkouts[pid][targetDay].sessions.push(newSession);
  appState.completedWorkouts[pid][targetDay].done = true;
  appState.completedWorkouts[pid][targetDay].watchData = newSession;

  pState.flag = "N/A";
  pState.pending = false;
  saveState();
  if (window.renderAll) window.renderAll();
  addSyncConsoleLog(`🎯 FLAG -> "N/A": Entreno resuelto manualmente para ${authorName} (+${deltaKcal} kcal, ${deltaMin} min).`, "success");
  showIosToast(`✅ Flag -> "N/A" (+${deltaKcal} kcal · ${deltaMin} min)`, "fa-solid fa-circle-check");
}

export function cancelPendingWorkoutManually() {
  triggerHapticTouch();
  const pid = appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  if (appState.appleWatch?.pendingWorkout?.[pid]) {
    appState.appleWatch.pendingWorkout[pid].flag = "N/A";
    appState.appleWatch.pendingWorkout[pid].pending = false;
  }
  saveState();
  if (window.renderAll) window.renderAll();
  addSyncConsoleLog(`❌ FLAG -> "N/A": Flag cancelado para ${authorName} sin registrar sesión.`, "info");
  showIosToast(`Flag reseteado a "N/A"`, "fa-solid fa-circle-xmark");
}

export async function cleanAndParseJsonFromCloud(rawText) {
  const list = await cleanAndParseAllMessagesFromCloud(rawText);
  return list.length > 0 ? list[list.length - 1] : null;
}

export async function cleanAndParseAllMessagesFromCloud(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  let text = rawText.trim();
  if (text === 'null' || text === '""' || text.length < 2) return [];

  const results = [];

  // Handle PubNub v3 history envelope
  if (text.includes('"channels":') || text.includes('"error":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.channels) {
        for (let ch of Object.keys(parsed.channels)) {
          const msgList = parsed.channels[ch];
          if (Array.isArray(msgList) && msgList.length > 0) {
            for (const msgItem of msgList) {
              if (msgItem && msgItem.message !== undefined && msgItem.message !== null) {
                const subParsed = await cleanAndParseAllMessagesFromCloud(typeof msgItem.message === 'string' ? msgItem.message : JSON.stringify(msgItem.message));
                for (const item of subParsed) {
                  if (item && typeof item === 'object') {
                    if (msgItem.timetoken) {
                      item._timetoken = String(msgItem.timetoken);
                      const pubDate = new Date(parseInt(msgItem.timetoken) / 10000);
                      if (!isNaN(pubDate.getTime())) {
                        item._timeStr = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
                      }
                    }
                    results.push(item);
                  }
                }
              }
            }
          }
        }
        return results;
      }
    } catch (e) {}
  }

  const fromUrlB64 = fromUrlSafeB64(text);
  if (fromUrlB64) return [fromUrlB64];

  let rawJsonCandidate = text;
  if (rawJsonCandidate.includes('%7B') || rawJsonCandidate.includes('%7b') || rawJsonCandidate.includes('%22')) {
    try {
      rawJsonCandidate = decodeURIComponent(rawJsonCandidate);
    } catch(e) {}
  }

  if ((rawJsonCandidate.startsWith('{') && rawJsonCandidate.endsWith('}')) || (rawJsonCandidate.startsWith('[') && rawJsonCandidate.endsWith(']'))) {
    try {
      const parsed = JSON.parse(rawJsonCandidate);
      if (Array.isArray(parsed)) {
        if (parsed.length >= 2 && Array.isArray(parsed[0])) {
          const msgList = parsed[0];
          for (const msgItem of msgList) {
            if (msgItem !== undefined && msgItem !== null) {
              let innerPayload = msgItem;
              let tt = null;
              if (typeof msgItem === 'object' && msgItem.message !== undefined) {
                innerPayload = msgItem.message;
                tt = msgItem.timetoken;
              }
              const subParsed = await cleanAndParseAllMessagesFromCloud(typeof innerPayload === 'string' ? innerPayload : JSON.stringify(innerPayload));
              for (const item of subParsed) {
                if (item && typeof item === 'object') {
                  if (tt) {
                    item._timetoken = String(tt);
                    const pubDate = new Date(parseInt(tt) / 10000);
                    if (!isNaN(pubDate.getTime())) {
                      item._timeStr = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
                    }
                  }
                  results.push(item);
                }
              }
            }
          }
          return results;
        }
        return parsed;
      }
      if (parsed && typeof parsed === 'object') {
        if (parsed.status !== undefined && parsed.channels !== undefined) {
          return [];
        }
        return [parsed];
      }
    } catch (e) {}
  }
  return [];
}

export function tryResolveCompletedWorkout(author, endKcalOverride = null, endExMinOverride = null) {
  if (!appState.appleWatch?.pendingWorkout?.[author]) return false;
  const pState = appState.appleWatch.pendingWorkout[author];
  if (pState.flag !== "false" && !pState.pending) return false;

  const rep = appState.appleWatch.cloudReplica?.[author] || {};
  const m = appState.appleWatch.metrics?.[author] || {};

  const initKcal = pState.datos_inicio_entrenamiento?.kcal ?? pState.snapshotKcal ?? 0;
  const initExMin = pState.datos_inicio_entrenamiento?.exMin ?? pState.snapshotExMin ?? 0;
  const finKcal = endKcalOverride !== null ? endKcalOverride : (rep.moveKcal || m.moveKcal || 0);
  const finExMin = endExMinOverride !== null ? endExMinOverride : (rep.exerciseMin || m.exerciseMin || 0);

  const deltaKcal = Math.max(0, finKcal - initKcal);
  const deltaMin = Math.max(0, finExMin - initExMin);

  const parseSafeTimeMs = (tStr) => {
    if (!tStr) return 0;
    if (tStr.includes("T")) return new Date(tStr).getTime();
    const d = new Date();
    const match = tStr.match(/(\d+):(\d+)/);
    if (match) {
      d.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
      return d.getTime();
    }
    return new Date(tStr).getTime() || 0;
  };

  const startTimeMs = parseSafeTimeMs(pState.startedAt);
  const endTimeMs = parseSafeTimeMs(pState.endedAt) || Date.now();
  let elapsedSeconds = (startTimeMs > 0 && endTimeMs >= startTimeMs) ? Math.round((endTimeMs - startTimeMs) / 1000) : 0;
  if (isNaN(elapsedSeconds) || elapsedSeconds < 0) elapsedSeconds = 0;
  const elapsedMin = Math.round(elapsedSeconds / 60);

  const isUnderOneMinute = (elapsedSeconds > 0 && elapsedSeconds < 60 && deltaKcal < 10) || (deltaMin === 0 && deltaKcal < 5 && elapsedSeconds < 60 && elapsedSeconds > 0);

  if (isUnderOneMinute) {
    pState.flag = "N/A";
    pState.pending = false;
    addSyncConsoleLog(`⏹️ Entreno descartado (${author.toUpperCase()}): Duración < 1 min (${elapsedSeconds}s, Δ:${deltaKcal} kcal). Flag reseteado a "N/A".`, "warn");
    if (window.updateWorkoutPendingStatusBadge) window.updateWorkoutPendingStatusBadge();
    return true;
  }

  if (deltaKcal >= 10 || deltaMin >= 1 || elapsedMin >= 1 || finKcal > initKcal) {
    const targetDay = getDayNameFromTimestamp(pState.startedAtTimetoken || pState.startedAt);
    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[author]) appState.completedWorkouts[author] = {};
    if (!appState.completedWorkouts[author][targetDay] || typeof appState.completedWorkouts[author][targetDay] !== 'object') {
      appState.completedWorkouts[author][targetDay] = { done: true, watchData: null, sessions: [] };
    }
    if (!Array.isArray(appState.completedWorkouts[author][targetDay].sessions)) {
      appState.completedWorkouts[author][targetDay].sessions = appState.completedWorkouts[author][targetDay].watchData ? [appState.completedWorkouts[author][targetDay].watchData] : [];
    }

    const eventDate = pState.startedAtTimetoken ? new Date(parseInt(pState.startedAtTimetoken, 10) / 10000) : (pState.startedAt ? new Date(pState.startedAt) : new Date());
    const timeStr = !isNaN(eventDate.getTime()) ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs" : (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs");
    const finalDuration = deltaMin > 0 ? deltaMin : (elapsedMin >= 1 ? elapsedMin : 1);
    const finalKcal = deltaKcal > 0 ? deltaKcal : Math.round(finalDuration * 4.5);
    const sessionId = pState.startedAtTimetoken ? `diff_${author}_${pState.startedAtTimetoken}` : `diff_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    if (appState.deletedWorkoutSessionIds && appState.deletedWorkoutSessionIds.includes(sessionId)) {
      pState.flag = "N/A";
      pState.pending = false;
      return false;
    }

    const isDuplicate = appState.completedWorkouts[author][targetDay].sessions.some(s =>
      s.id === sessionId ||
      (s.durationMin === finalDuration && s.kcal === finalKcal && s.timestamp === timeStr)
    );

    if (!isDuplicate) {
      const newSession = {
        id: sessionId,
        deviceName: `Apple Watch (${author === 'he' ? 'Carlos' : 'Andrea'} - Auto Diferencial)`,
        durationMin: finalDuration,
        kcal: finalKcal,
        timestamp: timeStr,
        autoSync: true
      };
      appState.completedWorkouts[author][targetDay].sessions.push(newSession);
      appState.completedWorkouts[author][targetDay].done = true;
      appState.completedWorkouts[author][targetDay].watchData = newSession;
      if (!appState.processedWorkoutIds) appState.processedWorkoutIds = [];
      appState.processedWorkoutIds.push(sessionId);
      addSyncConsoleLog(`🎯 HISTORIAL RECONSTRUIDO (${author.toUpperCase()} - ${targetDay}): ${timeStr} · +${finalKcal} kcal (+${finalDuration} min).`, "success");
    }

    pState.flag = "N/A";
    pState.pending = false;
    addSyncConsoleLog(`🎯 FLAG -> "N/A" (Entrenamiento Cargado - ${author.toUpperCase()}): Fin(${finKcal} kcal) - Inicio(${initKcal} kcal) = +${finalKcal} kcal (+${finalDuration} min).`, "success");
    if (window.updateWorkoutPendingStatusBadge) window.updateWorkoutPendingStatusBadge();
    return true;
  }

  return false;
}

export function mergeCloudDataIntoAppState(cloudData) {
  if (!cloudData || typeof cloudData !== 'object') return false;
  if (cloudData.status !== undefined && cloudData.channels !== undefined) return false;

  if (appState.lastPurgeTimetoken && cloudData._timetoken) {
    try {
      if (BigInt(cloudData._timetoken) <= BigInt(appState.lastPurgeTimetoken)) {
        return false;
      }
    } catch(e) {}
  }

  let hasChanges = false;
  const author = cloudData.authorProfileId || cloudData.masterProfileId || cloudData.author || cloudData.pid || 'he';
  const authorName = author === 'he' ? 'Carlos' : author === 'she' ? 'Andrea' : author;

  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = JSON.parse(JSON.stringify(defaultWatchMetrics));
  if (!appState.appleWatch.metrics[author]) appState.appleWatch.metrics[author] = { ...defaultWatchMetrics[author] };

  if (!appState.appleWatch.cloudReplica) appState.appleWatch.cloudReplica = JSON.parse(JSON.stringify(defaultCloudReplica));
  if (!appState.appleWatch.cloudReplica[author]) appState.appleWatch.cloudReplica[author] = { ...defaultCloudReplica[author] };

  const rep = appState.appleWatch.cloudReplica[author];
  const m = appState.appleWatch.metrics[author];
  let replicaUpdated = false;

  const isWorkoutPayload = cloudData.workout === true || cloudData.workout === "true" || cloudData.syncWorkout === true || cloudData.syncWorkout === "true";

  if (!isWorkoutPayload || cloudData.steps !== undefined || cloudData.floors !== undefined || cloudData.sleep !== undefined) {
    const kcalVal = parseSmartMetricValue(cloudData.kcal ?? cloudData.moveKcal ?? cloudData.activeCalories ?? cloudData.calorias);
    if (kcalVal !== null && !isWorkoutPayload) {
      rep.moveKcal = kcalVal;
      m.moveKcal = kcalVal;
      replicaUpdated = true;
    }
    const stepsVal = parseSmartMetricValue(cloudData.steps ?? cloudData.pasos);
    if (stepsVal !== null) {
      rep.steps = stepsVal;
      m.steps = stepsVal;
      rep.distanceKm = parseFloat((stepsVal * 0.00075).toFixed(2));
      m.distanceKm = rep.distanceKm;
      replicaUpdated = true;
    }
    const exMinVal = parseSmartMetricValue(cloudData.exMin ?? cloudData.exerciseMin ?? cloudData.minutosEjercicio);
    if (exMinVal !== null && !isWorkoutPayload) {
      rep.exerciseMin = exMinVal;
      m.exerciseMin = exMinVal;
      replicaUpdated = true;
    }
    const hrVal = parseSmartMetricValue(cloudData.hr ?? cloudData.avgHr ?? cloudData.heartRate ?? cloudData.pulsaciones);
    if (hrVal !== null && !isWorkoutPayload) {
      rep.hr = hrVal;
      m.hr = hrVal;
      replicaUpdated = true;
    }
    const floorsVal = parseSmartMetricValue(cloudData.floors ?? cloudData.pisos);
    if (floorsVal !== null) {
      rep.floors = floorsVal;
      m.floors = floorsVal;
      replicaUpdated = true;
    }
    const sleepVal = cloudData.sleep ?? cloudData.horasSueno;
    if (sleepVal !== undefined && sleepVal !== null) {
      const formattedSleep = formatSmartSleepValue(sleepVal);
      rep.sleep = formattedSleep;
      m.sleep = formattedSleep;
      replicaUpdated = true;
    }
  }

  if (replicaUpdated) {
    rep.lastSync = new Date().toISOString();
    appState.appleWatch.lastGlobalSync = rep.lastSync;
    hasChanges = true;
  }

  if (cloudData.completedWorkouts?.[author]) {
    if (!appState.completedWorkouts[author]) appState.completedWorkouts[author] = {};
    for (const [day, dayObj] of Object.entries(cloudData.completedWorkouts[author])) {
      if (!dayObj) continue;
      if (!appState.completedWorkouts[author][day] || typeof appState.completedWorkouts[author][day] !== 'object') {
        appState.completedWorkouts[author][day] = { done: false, watchData: null, sessions: [] };
      }
      const localDay = appState.completedWorkouts[author][day];
      if (!Array.isArray(localDay.sessions)) {
        localDay.sessions = localDay.watchData ? [localDay.watchData] : [];
      }
      const incomingList = Array.isArray(dayObj.sessions) ? dayObj.sessions : (dayObj.watchData ? [dayObj.watchData] : []);
      for (const inc of incomingList) {
        if (!inc) continue;
        const isDeleted = appState.deletedWorkoutSessionIds && (
          (inc.id && appState.deletedWorkoutSessionIds.includes(inc.id)) ||
          appState.deletedWorkoutSessionIds.includes(`${inc.durationMin}_${inc.kcal}_${inc.timestamp}_${author}_${day}`)
        );
        if (isDeleted) continue;

        const already = localDay.sessions.some(s =>
          (s.id && inc.id && s.id === inc.id) ||
          (s.timestamp === inc.timestamp && s.durationMin === inc.durationMin && s.kcal === inc.kcal)
        );
        if (!already) {
          localDay.sessions.push(inc);
          hasChanges = true;
        }
      }
      if (dayObj.done || localDay.sessions.length > 0) {
        localDay.done = true;
        localDay.watchData = localDay.sessions[localDay.sessions.length - 1];
      }
    }
  }

  if (!appState.appleWatch.pendingWorkout) appState.appleWatch.pendingWorkout = {};
  if (!appState.appleWatch.pendingWorkout[author]) {
    appState.appleWatch.pendingWorkout[author] = {
      flag: "N/A",
      pending: false,
      datos_inicio_entrenamiento: null,
      datos_fin_entrenamiento: null,
      startedAt: null,
      endedAt: null
    };
  }
  const pState = appState.appleWatch.pendingWorkout[author];

  if (cloudData.workoutPending === true || cloudData.workoutPending === "true" || cloudData.workoutStatus === "started" || cloudData.event === "workout_pending") {
    if (pState.flag !== "true") {
      const initKcal = rep.moveKcal || m.moveKcal || 0;
      const initExMin = rep.exerciseMin || m.exerciseMin || 0;
      const initSteps = rep.steps || m.steps || 0;
      const startedTime = cloudData.timestamp || cloudData._timeStr || new Date().toISOString();

      pState.flag = "true";
      pState.pending = true;
      pState.startedAt = startedTime;
      pState.startedAtTimetoken = cloudData._timetoken || String(Date.now() * 10000);
      pState.datos_inicio_entrenamiento = {
        kcal: initKcal,
        exMin: initExMin,
        steps: initSteps,
        timestamp: startedTime
      };
      pState.snapshotKcal = initKcal;
      pState.snapshotExMin = initExMin;
      pState.snapshotSteps = initSteps;

      hasChanges = true;
      addSyncConsoleLog(`🏃 FLAG -> "true" (Entrenamiento Iniciado - ${author.toUpperCase()}): datos_inicio = ${initKcal} kcal, ${initExMin} min. Base congelada.`, "success");
      if (window.updateWorkoutPendingStatusBadge) window.updateWorkoutPendingStatusBadge();
    } else {
      addSyncConsoleLog(`ℹ️ Flag ya está en "true" (${author.toUpperCase()}). datos_inicio se mantienen intactos (${pState.datos_inicio_entrenamiento?.kcal || 0} kcal).`);
    }
  } else if (cloudData.workoutPending === false || cloudData.workoutPending === "false" || cloudData.workoutStatus === "ended" || cloudData.workoutStatus === "finished") {
    if (pState.flag === "true" || pState.pending) {
      pState.flag = "false";
      pState.endedAt = cloudData.timestamp || cloudData._timeStr || new Date().toISOString();
      pState.endedAtTimetoken = cloudData._timetoken || String(Date.now() * 10000);
      hasChanges = true;
      addSyncConsoleLog(`⏹️ FLAG -> "false" (Entrenamiento Finalizado - ${author.toUpperCase()}): Evaluando datos_fin disponibles...`, "warn");
      const resolved = tryResolveCompletedWorkout(author);
      if (resolved) hasChanges = true;
      if (window.updateWorkoutPendingStatusBadge) window.updateWorkoutPendingStatusBadge();
    }
  }

  const isDirectWorkout = cloudData.workout === true || cloudData.workout === "true" || cloudData.syncWorkout === true || cloudData.syncWorkout === "true" || (cloudData.workoutKcal !== undefined && cloudData.workoutKcal !== "0" && cloudData.workoutKcal !== 0) || (cloudData.duration !== undefined && cloudData.duration !== "0" && cloudData.duration !== 0);
  if (isDirectWorkout) {
    let targetDay = cloudData.day;
    if (!targetDay || targetDay === "Hoy" || targetDay.toLowerCase() === "today" || targetDay.toLowerCase() === "hoy") {
      targetDay = getTodayDayName();
    }
    const durMin = parseSmartMetricValue(cloudData.duration ?? cloudData.workoutDuration ?? cloudData.dur) ?? 0;
    const wKcal = parseSmartMetricValue(cloudData.workoutKcal ?? cloudData.wKcal) ?? 0;

    if (durMin < 1 && wKcal < 5) {
      pState.flag = "N/A";
      pState.pending = false;
      hasChanges = true;
      addSyncConsoleLog(`⏹️ Entreno descartado (${author.toUpperCase()}): Duración < 1 min (${durMin} min, ${wKcal} kcal). Flag reseteado a "N/A".`, "warn");
      if (window.updateWorkoutPendingStatusBadge) window.updateWorkoutPendingStatusBadge();
    } else {
      if (!appState.completedWorkouts[author]) appState.completedWorkouts[author] = {};
      if (!appState.completedWorkouts[author][targetDay] || typeof appState.completedWorkouts[author][targetDay] !== 'object') {
        appState.completedWorkouts[author][targetDay] = { done: true, watchData: null, sessions: [] };
      }
      if (!Array.isArray(appState.completedWorkouts[author][targetDay].sessions)) {
        appState.completedWorkouts[author][targetDay].sessions = appState.completedWorkouts[author][targetDay].watchData ? [appState.completedWorkouts[author][targetDay].watchData] : [];
      }

      const sessionTimestamp = cloudData.timeStr || cloudData._timeStr || (cloudData.timestamp ? (cloudData.timestamp.includes(":") ? cloudData.timestamp : new Date(cloudData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs") : "10:00 hs");
      const sessionId = cloudData._timetoken ? `pn_${cloudData._timetoken}` : (cloudData.id || `sess_${durMin}_${wKcal}_${sessionTimestamp}`);

      const sessionObj = {
        id: sessionId,
        deviceName: `Apple Watch (${getProfileShortName(author)})`,
        durationMin: durMin || 1,
        kcal: wKcal,
        timestamp: sessionTimestamp,
        autoSync: true
      };

      const isDuplicate = appState.completedWorkouts[author][targetDay].sessions.some(s =>
        (s.id && s.id === sessionObj.id) ||
        (s.durationMin === sessionObj.durationMin && s.kcal === wKcal && (s.timestamp === sessionObj.timestamp || s.id === sessionId))
      );

      if (!isDuplicate) {
        appState.completedWorkouts[author][targetDay].sessions.push(sessionObj);
        appState.completedWorkouts[author][targetDay].done = true;
        appState.completedWorkouts[author][targetDay].watchData = sessionObj;
        hasChanges = true;
        addSyncConsoleLog(`🏋️ SESIÓN DE ENTRENO AÑADIDA (${author.toUpperCase()}): ${sessionObj.durationMin} min · ${sessionObj.kcal} kcal`, "success");
      }

      if (pState.flag === "true" || pState.flag === "false") {
        pState.flag = "N/A";
        pState.pending = false;
        hasChanges = true;
        addSyncConsoleLog(`🎯 FLAG -> "N/A" (Entrenamiento Cargado - ${author.toUpperCase()}) tras recibir sesión directa.`, "success");
        if (window.updateWorkoutPendingStatusBadge) window.updateWorkoutPendingStatusBadge();
      }
    }
  } else if (replicaUpdated) {
    if (pState.flag === "true") {
      addSyncConsoleLog(`ℹ️ Sincro de Salud a mitad de entreno (${author.toUpperCase()}): Kcal actuales=${rep.moveKcal}. datos_inicio congelados en ${pState.datos_inicio_entrenamiento?.kcal || pState.snapshotKcal || 0} kcal. Flag continúa en "true".`);
    } else if (pState.flag === "false") {
      const resolved = tryResolveCompletedWorkout(author);
      if (resolved) hasChanges = true;
    }
  }

  ['he', 'she'].forEach(pid => {
    if (cloudData.history?.[pid] && typeof cloudData.history[pid] === 'object') {
      if (!appState.history) appState.history = { he: {}, she: {} };
      if (!appState.history[pid]) appState.history[pid] = {};
      Object.keys(cloudData.history[pid]).forEach(dateKey => {
        const cloudDay = cloudData.history[pid][dateKey];
        if (cloudDay && typeof cloudDay === 'object') {
          const localDay = appState.history[pid][dateKey] || {};
          appState.history[pid][dateKey] = {
            ...localDay,
            ...cloudDay,
            steps: Math.max(localDay.steps || 0, cloudDay.steps || 0),
            moveKcal: Math.max(localDay.moveKcal || 0, cloudDay.moveKcal || 0),
            exerciseMin: Math.max(localDay.exerciseMin || 0, cloudDay.exerciseMin || 0),
            distanceKm: Math.max(localDay.distanceKm || 0, cloudDay.distanceKm || 0),
            floors: Math.max(localDay.floors || 0, cloudDay.floors || 0),
            sleep: (cloudDay.sleep && cloudDay.sleep !== '--') ? cloudDay.sleep : (localDay.sleep || '--'),
            completedWorkouts: Array.from(new Set([...(localDay.completedWorkouts || []), ...(cloudDay.completedWorkouts || [])]))
          };
          hasChanges = true;
        }
      });
    }
  });

  if (hasChanges) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
  }
  return hasChanges;
}

export function copyDiagnosticLogs() {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const logsText = consoleEl ? consoleEl.textContent : "";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logsText).then(() => {
      showIosToast("📋 ¡Logs copiados!", "fa-solid fa-copy");
    });
  }
}

let isPushSyncing = false;
let isPullSyncing = false;

export async function pushToCloud(showToast = false) {
  if (isPushSyncing) return;
  isPushSyncing = true;

  try {
    const key = getCloudSyncKey();
    const masterPid = getMasterProfileId();
    const m = appState.appleWatch?.metrics?.[masterPid] || {};
    const compactPayload = {
      authorProfileId: masterPid,
      timestamp: new Date().toISOString(),
      appleWatch: { metrics: { [masterPid]: m } },
      completedWorkouts: { [masterPid]: appState.completedWorkouts?.[masterPid] || {} },
      history: { [masterPid]: appState.history?.[masterPid] || {} }
    };

    const urlSafeData = toUrlSafeB64(compactPayload);
    const pnChannel = `${key}_${masterPid}`;
    const encodedMsg = encodeURIComponent(JSON.stringify(urlSafeData));
    const pnPubUrl = `https://ps.pubnub.com/publish/demo/demo/0/${pnChannel}/0/${encodedMsg}`;
    
    await fetch(pnPubUrl);
    appState.lastCloudSync = new Date().toISOString();
    updateCloudSyncUI("Conectado a la Nube (Sincronizado)", true);
    if (showToast) showIosToast("☁️ ¡Datos sincronizados en la nube!", "fa-solid fa-cloud-arrow-up");
  } catch (e) {
  } finally {
    isPushSyncing = false;
  }
}

export function getDayNameFromTimestamp(t) {
  if (!t) return getTodayDayName();
  let d;
  if (typeof t === 'number') {
    d = new Date(t > 10000000000000 ? t / 10000 : t);
  } else if (typeof t === 'string') {
    const trimmed = t.trim();
    if (/^\d{15,18}$/.test(trimmed)) {
      d = new Date(parseInt(trimmed, 10) / 10000);
    } else {
      d = new Date(t);
    }
  } else {
    d = new Date();
  }
  if (isNaN(d.getTime())) return getTodayDayName();
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[d.getDay()];
}

export async function pullFromCloud(showToast = false) {
  if (isPullSyncing) return;
  isPullSyncing = true;

  try {
    const key = getCloudSyncKey();
    const myMasterPid = getMasterProfileId();
    const partnerPid = myMasterPid === 'he' ? 'she' : 'he';
    const channels = Array.from(new Set([
      `${key}_${partnerPid}`,
      `${key}_${myMasterPid}`
    ]));

    addSyncConsoleLog(`🔍 Consultando canales PubNub: [${channels.join(", ")}]...`);
    let hasMerged = false;
    let allCollectedMessages = [];

    for (const ch of channels) {
      try {
        const pnSubUrl = `https://ps.pubnub.com/v2/history/sub-key/demo/channel/${ch}?count=100&include_token=true`;
        const res = await fetch(pnSubUrl);
        if (res.ok) {
          const rawText = await res.text();
          const dataList = await cleanAndParseAllMessagesFromCloud(rawText);
          if (dataList.length > 0) {
            for (const data of dataList) {
              if (data && typeof data === 'object') {
                data._channel = ch;
                allCollectedMessages.push(data);
              }
            }
          }
        }
      } catch (eCh) {
        addSyncConsoleLog(`❌ Error en canal [${ch}]: ${eCh.message}`, "error");
      }
    }

    if (allCollectedMessages.length === 0) {
      addSyncConsoleLog(`ℹ️ Consulta finalizada: Sin mensajes en PubNub.`);
    } else {
      allCollectedMessages.sort((a, b) => {
        const ta = a._timetoken ? BigInt(a._timetoken) : 0n;
        const tb = b._timetoken ? BigInt(b._timetoken) : 0n;
        return ta < tb ? -1 : ta > tb ? 1 : 0;
      });

      addSyncConsoleLog(`📥 Procesando ${allCollectedMessages.length} mensaje(s) en orden cronológico...`);

      for (const data of allCollectedMessages) {
        const preview = JSON.stringify(data);
        const shortPreview = preview.length > 95 ? preview.slice(0, 95) + '...' : preview;
        addSyncConsoleLog(`📦 [${data.author || data.pid || 'he'}] (${data._timeStr || 'reciente'}) ${shortPreview}`);
        const changed = mergeCloudDataIntoAppState(data);
        if (changed) hasMerged = true;
      }
      for (const pid of ['he', 'she']) {
        if (tryResolveCompletedWorkout(pid)) {
          hasMerged = true;
        }
      }
      addSyncConsoleLog(`✅ Procesamiento finalizado (cambios=${hasMerged}).`, "success");
    }

    if (hasMerged) {
      if (window.renderAll) window.renderAll();
      if (showToast) showIosToast(`☁️ ¡Datos actualizados desde la nube!`, "fa-solid fa-cloud-arrow-down");
    }
  } finally {
    isPullSyncing = false;
  }
}

export async function purgeCloudHistory() {
  triggerHapticTouch();
  showIosToast("🧹 Purgando cola de la nube...", "fa-solid fa-broom");
  
  appState.lastPurgeTimetoken = String(Date.now() * 10000);

  const key = getCloudSyncKey();
  const channels = [`${key}_he`, `${key}_she`];
  let success = true;

  for (const ch of channels) {
    try {
      const res = await fetch(`https://ps.pubnub.com/v3/history/sub-key/demo/channel/${ch}`, {
        method: 'DELETE'
      });
      if (!res.ok) success = false;
    } catch(e) {
      success = false;
    }
  }

  if (!appState.deletedWorkoutSessionIds) appState.deletedWorkoutSessionIds = [];
  if (appState.completedWorkouts) {
    for (const p of ['he', 'she']) {
      if (appState.completedWorkouts[p]) {
        for (const [dayName, dayObj] of Object.entries(appState.completedWorkouts[p])) {
          if (dayObj && Array.isArray(dayObj.sessions)) {
            for (const sess of dayObj.sessions) {
              if (sess.id) appState.deletedWorkoutSessionIds.push(sess.id);
              appState.deletedWorkoutSessionIds.push(`${sess.durationMin}_${sess.kcal}_${sess.timestamp}_${p}_${dayName}`);
            }
          }
        }
      }
    }
  }

  if (appState.appleWatch?.pendingWorkout) {
    for (const pid of ['he', 'she']) {
      if (appState.appleWatch.pendingWorkout[pid]) {
        appState.appleWatch.pendingWorkout[pid].flag = "N/A";
        appState.appleWatch.pendingWorkout[pid].pending = false;
        appState.appleWatch.pendingWorkout[pid].datos_inicio_entrenamiento = null;
        appState.appleWatch.pendingWorkout[pid].datos_fin_entrenamiento = null;
        appState.appleWatch.pendingWorkout[pid].startedAt = null;
        appState.appleWatch.pendingWorkout[pid].endedAt = null;
      }
    }
  }

  saveState();
  if (window.renderAll) window.renderAll();
  await pushToCloud(false);

  addSyncConsoleLog("🧹 Cola purgada con éxito. Mensajes antiguos descartados y estados reseteados.", "success");
  showIosToast("✅ Cola de la nube purgada por completo", "fa-solid fa-circle-check");
}

export function syncNowWithCloud() {
  triggerHapticTouch();
  showIosToast("☁️ Sincronizando...", "fa-solid fa-arrows-rotate");
  pushToCloud(false).then(() => pullFromCloud(true));
}

export function saveCustomCloudKeyFromInput() {
  const input = document.getElementById("setting-cloud-key-input");
  if (!input) return;
  const keyVal = input.value.trim();
  if (keyVal.length >= 3) {
    localStorage.setItem("FITDUO_CLOUD_KEY", keyVal);
    addSyncConsoleLog(`🔑 Clave de Pareja actualizada a: "${keyVal}"`, "info");
    showIosToast(`🔑 Clave guardada: ${keyVal}`, "fa-solid fa-key");
    syncNowWithCloud();
  } else {
    showIosToast("⚠️ La clave debe tener al menos 3 caracteres", "fa-solid fa-triangle-exclamation");
  }
}

export function resetDefaultCloudKey() {
  localStorage.removeItem("FITDUO_CLOUD_KEY");
  const input = document.getElementById("setting-cloud-key-input");
  if (input) input.value = DEFAULT_CLOUD_KEY;
  addSyncConsoleLog(`🔑 Clave por defecto restablecida: "${DEFAULT_CLOUD_KEY}"`, "info");
  showIosToast("🔑 Clave de pareja por defecto restablecida", "fa-solid fa-rotate-left");
  syncNowWithCloud();
}

export function exportSyncToken() {
  triggerHapticTouch();
  try {
    const payload = {
      masterProfileId: appState.masterProfileId,
      timestamp: new Date().toISOString(),
      profiles: appState.profiles,
      completedWorkouts: appState.completedWorkouts,
      weightLogs: appState.weightLogs,
      appleWatch: appState.appleWatch,
      checkedShoppingItems: appState.checkedShoppingItems,
      exclusions: appState.exclusions
    };
    const jsonStr = JSON.stringify(payload);
    const token = btoa(encodeURIComponent(jsonStr));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(token).then(() => {
        showIosToast("📋 ¡Código de sincronización copiado!", "fa-solid fa-copy");
        addSyncConsoleLog("📋 Código de emparejamiento copiado al portapapeles", "info");
      }).catch(() => {
        prompt("Copia este código de sincronización para pegarlo en el otro dispositivo:", token);
      });
    } else {
      prompt("Copia este código de sincronización para pegarlo en el otro dispositivo:", token);
    }
  } catch(e) {
    console.error("Export sync token error:", e);
  }
}

export function promptImportSyncToken() {
  triggerHapticTouch();
  const token = prompt("Pega aquí el Código de Sincronización copiado desde el otro teléfono:");
  if (!token || !token.trim()) return;
  try {
    const jsonStr = decodeURIComponent(atob(token.trim()));
    const cloudData = JSON.parse(jsonStr);
    const hasMerged = mergeCloudDataIntoAppState(cloudData);
    if (hasMerged) {
      if (window.renderAll) window.renderAll();
      showIosToast("⚡ ¡Datos fusionados desde el código!", "fa-solid fa-bolt");
      addSyncConsoleLog("📥 Código de sincronización importado y fusionado", "success");
    } else {
      showIosToast("ℹ️ Sin datos nuevos en el código introducido", "fa-solid fa-info");
    }
  } catch(e) {
    showIosToast("❌ Código de sincronización inválido", "fa-solid fa-triangle-exclamation");
    addSyncConsoleLog("❌ Error al procesar código de sincronización", "error");
  }
}

export function exportBackupJson() {
  triggerHapticTouch();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `fitduo_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showIosToast("💾 Copia de seguridad JSON descargada", "fa-solid fa-download");
  addSyncConsoleLog("💾 Copia de seguridad JSON exportada", "info");
}

export function triggerImportBackupJson() {
  triggerHapticTouch();
  const fileInput = document.getElementById("json-backup-file-input");
  if (fileInput) fileInput.click();
}

export function handleBackupFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedState = JSON.parse(e.target.result);
      if (importedState && typeof importedState === 'object') {
        const hasMerged = mergeCloudDataIntoAppState(importedState);
        if (window.renderAll) window.renderAll();
        showIosToast("📂 Copia cargada y fusionada", "fa-solid fa-file-circle-check");
        addSyncConsoleLog("📂 Archivo de copia JSON importado", "success");
      }
    } catch(err) {
      showIosToast("❌ Archivo JSON no válido", "fa-solid fa-circle-exclamation");
      addSyncConsoleLog("❌ Error al leer el archivo JSON", "error");
    }
  };
  reader.readAsText(file);
}

export function updateCloudSyncUI(statusText, isConnected) {
  const statusEl = document.getElementById("cloud-sync-status-text");
  if (statusEl) statusEl.innerText = `Estado: ${statusText}`;

  const timeEl = document.getElementById("cloud-last-sync-time");
  if (timeEl) {
    const timeStr = appState.lastCloudSync ? new Date(appState.lastCloudSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente';
    timeEl.innerText = `Última actualización: ${timeStr}`;
  }

  const badgeEl = document.getElementById("cloud-status-badge");
  if (badgeEl) {
    badgeEl.className = `cloud-status-badge ${isConnected ? '' : 'offline'}`;
    badgeEl.innerHTML = `<i class="fa-solid ${isConnected ? 'fa-cloud' : 'fa-cloud-slash'}"></i> Nube ${isConnected ? 'Conectada' : 'Local'}`;
  }
}

export function forceAppRefresh() {
  triggerHapticTouch();
  showIosToast("🔄 Actualizando y vaciando caché del acceso directo...", "fa-solid fa-arrows-rotate");
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) caches.delete(name);
    });
  }
  setTimeout(() => {
    window.location.href = window.location.pathname + '?v=' + Date.now();
  }, 400);
}
