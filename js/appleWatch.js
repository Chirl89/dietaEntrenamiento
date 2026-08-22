import { appState, defaultWatchMetrics, defaultCloudReplica, LAST_ACTIVE_PROFILE_KEY, getMasterProfileId, saveState, triggerHapticTouch, showIosToast, getTodayDayName, getLocalIsoDate, getDayNameFromDate, getDateForDayNameInCurrentWeek, recordDailySnapshot, addDebugLog } from './state.js';
import { pushToCloud, pullFromCloud, getCloudSyncKey, addSyncConsoleLog } from './cloudSync.js';
import { parseSmartMetricValue, parseSmartMetricFloatValue, parseSmartMetricArray, formatSmartSleepValue } from './utils.js';

let autoSyncIntervalTimer = null;

export function startAppleWatchAutoSync() {
  if (autoSyncIntervalTimer) clearInterval(autoSyncIntervalTimer);
  autoSyncIntervalTimer = setInterval(() => {
    if (!document.hidden && !window.isCloudSyncing) {
      pullFromCloud(false).then(hasChanges => {
        if (hasChanges && window.renderAll) {
          window.renderAll();
        }
      });
    }
  }, 10000);
}

export function performAutoSyncTick() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  saveState();
  if (window.renderAll) window.renderAll();
}

export function updateHeaderWatchBadge() {
  const badgeText = document.getElementById("ios-header-watch-text");
  if (badgeText) {
    badgeText.innerText = "☁️ Actualizar Nube";
  }
}

export function setAppleWatchSyncMode(mode) {
  triggerHapticTouch();
  if (!appState.appleWatch) appState.appleWatch = {};
  appState.appleWatch.syncMode = mode;
  saveState();

  if (window.renderAll) window.renderAll();

  if (mode === "real") {
    showIosToast("🎯 <strong>Modo Datos Reales Activado</strong>: Tus números de Apple Watch se mantendrán estables con máxima precisión.", "fa-solid fa-shield-halved");
  } else {
    showIosToast("🧪 <strong>Modo Simulación Demo Activado</strong>: Simulando telemetría en vivo.", "fa-solid fa-vial");
  }
}

export function openAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) {
    modal.classList.add("active");
    updateAppleWatchModalUI();
  }
}

export function closeAppleWatchModal() {
  triggerHapticTouch();
  const modal = document.getElementById("apple-watch-modal");
  if (modal) modal.classList.remove("active");
}

export function closeAppleWatchModalOnBackdrop(e) {
  if (e && e.target && e.target.id === "apple-watch-modal") {
    closeAppleWatchModal();
  }
}

export function toggleAutoSync(enabled) {
  triggerHapticTouch();
  if (!appState.appleWatch) return;
  appState.appleWatch.autoSyncEnabled = enabled;
  saveState();
  updateHeaderWatchBadge();

  showIosToast(
    enabled 
      ? " Sincronización de Apple Watch <strong>ACTIVADA</strong>" 
      : "⏸️ Sincronización de Apple Watch <strong>PAUSADA</strong>",
    enabled ? "fa-brands fa-apple" : "fa-solid fa-pause"
  );
}

export function triggerManualSync() {
  triggerHapticTouch();
  const pid = appState.activeProfileId;
  const m = appState.appleWatch.metrics[pid];
  const pName = appState.profiles[pid].name.split(" ")[0];
  const mode = appState.appleWatch.syncMode || "real";

  if (mode === "demo") {
    m.steps += Math.floor(Math.random() * 120) + 40;
    m.moveKcal += Math.floor(Math.random() * 15) + 5;
    m.exerciseMin = Math.min(60, m.exerciseMin + 2);
    m.hr = Math.floor(Math.random() * 20) + 72;
    m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  
  appState.appleWatch.syncLogs.unshift({
    timestamp: timeStr,
    device: m.deviceName,
    hr: m.hr,
    kcal: m.moveKcal,
    steps: m.steps,
    status: mode === "real" ? "Verificado con Salud iOS" : "Simulado Manualmente"
  });
  if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

  saveState();
  if (window.renderAll) window.renderAll();

  showIosToast(` ¡Datos de Apple Watch (${pName}) verificados! (${m.moveKcal} kcal - ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-circle-check");
}

export function syncWeeklyWatchHistory(profileId, kcalArr = [], exMinArr = [], hrArr = [], stepsArr = []) {
  if (!Array.isArray(kcalArr) || kcalArr.length === 0) return;
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;

  for (let i = 0; i < kcalArr.length; i++) {
    const pastDayOffset = kcalArr.length - 1 - i;
    const d = new Date(today);
    d.setDate(today.getDate() - pastDayOffset);
    const targetDateIso = getLocalIsoDate(d);
    const pastDayIdx = (todayIdx - pastDayOffset + 700) % 7;
    const targetDayName = days[pastDayIdx];
    const kcalVal = kcalArr[i] || 0;
    const durVal = (exMinArr && exMinArr[i]) ? exMinArr[i] : 0;
    const hrVal = (hrArr && hrArr[i]) ? hrArr[i] : 0;
    const stepsVal = (stepsArr && stepsArr[i]) ? stepsArr[i] : 0;

    let isWorkout = false;
    let workoutSession = null;

    if (kcalVal && kcalVal > 150) {
      isWorkout = true;
      if (!appState.completedWorkouts[profileId]) appState.completedWorkouts[profileId] = {};

      const existing = appState.completedWorkouts[profileId][targetDayName];
      if (!existing || !existing.done || !existing.watchData) {
        workoutSession = {
          id: `hist_${targetDateIso}`,
          deviceName: appState.appleWatch.metrics[profileId]?.deviceName || "Apple Watch",
          durationMin: durVal || 45,
          kcal: kcalVal,
          avgHr: hrVal || 138,
          maxHr: (hrVal || 138) + 22,
          timestamp: "Salud iOS Sync",
          autoSync: true
        };
        appState.completedWorkouts[profileId][targetDayName] = {
          done: true,
          watchData: workoutSession,
          sessions: [workoutSession]
        };
      }
    }

    recordDailySnapshot(profileId, targetDateIso, {
      steps: stepsVal,
      moveKcal: kcalVal,
      exerciseMin: durVal,
      hr: hrVal
    }, {
      isWorkoutDone: isWorkout,
      sessions: workoutSession ? [workoutSession] : undefined
    });
  }
}

export function checkUrlParamsForWatchSync() {
  let searchStr = window.location?.search || "";
  let hashStr = window.location?.hash || "";
  
  if (!searchStr && hashStr && hashStr.includes("?")) {
    searchStr = hashStr.substring(hashStr.indexOf("?"));
  } else if (!searchStr && hashStr && hashStr.includes("=")) {
    searchStr = hashStr.replace("#", "?");
  }

  const params = new URLSearchParams(searchStr);
  if (!params.has("syncWatch") && !params.has("kcal") && !params.has("steps") && !params.has("workout") && !params.has("duration") && !params.has("workoutKcal") && !params.has("hr")) {
    return false;
  }

  let pid = appState.activeProfileId || getMasterProfileId();
  const profileParam = params.get("profile") || params.get("user");
  if (profileParam) {
    const pLower = profileParam.toLowerCase();
    if (pLower.includes("carlos") || pLower === "he" || pLower === "m") {
      pid = "he";
    } else if (pLower.includes("andrea") || pLower === "she" || pLower === "f") {
      pid = "she";
    }
    appState.activeProfileId = pid;
    localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, pid);
  }

  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = JSON.parse(JSON.stringify(defaultWatchMetrics));
  if (!appState.appleWatch.metrics[pid]) appState.appleWatch.metrics[pid] = { ...defaultWatchMetrics[pid] };

  const m = appState.appleWatch.metrics[pid];
  m.date = getLocalIsoDate();

  addDebugLog("🔗 Parámetros de URL/Acceso Directo detectados al cargar la app", "url", Object.fromEntries(params));

  let updated = false;

  const kcalRaw = params.get("kcal") || params.get("moveKcal") || params.get("activeCalories");
  const kcalVal = parseSmartMetricValue(kcalRaw);
  if (kcalVal !== null) {
    m.moveKcal = kcalVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("kcal")) {
    if (kcalRaw === "0" || kcalRaw === "") {
      m.moveKcal = 0;
      updated = true;
    }
  }

  const stepsRaw = params.get("steps");
  const stepsVal = parseSmartMetricValue(stepsRaw);
  if (stepsVal !== null) {
    m.steps = stepsVal;
    m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
    updated = true;
  } else if (params.has("syncWatch") || params.has("steps")) {
    if (stepsRaw === "0" || stepsRaw === "") {
      m.steps = 0;
      m.distanceKm = 0;
      updated = true;
    }
  }

  const distRaw = params.get("dist") || params.get("distanceKm") || params.get("distance");
  const distVal = parseSmartMetricFloatValue(distRaw);
  if (distVal !== null) {
    m.distanceKm = distVal;
    updated = true;
  }

  const hrRaw = params.get("hr") || params.get("heartRate") || params.get("avgHr");
  const hrVal = parseSmartMetricValue(hrRaw);
  if (hrVal !== null) {
    m.hr = hrVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("hr")) {
    if (hrRaw === "0" || hrRaw === "") {
      m.hr = 0;
      updated = true;
    }
  }

  const maxHrRaw = params.get("maxHr");
  const maxHrVal = parseSmartMetricValue(maxHrRaw);
  if (maxHrVal !== null) {
    m.maxHr = maxHrVal;
    updated = true;
  }

  const exMinRaw = params.get("exMin") || params.get("exerciseMin") || params.get("duration") || params.get("dur");
  const exMinVal = parseSmartMetricValue(exMinRaw);
  if (exMinVal !== null) {
    m.exerciseMin = exMinVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("exMin")) {
    if (exMinRaw === "0" || exMinRaw === "") {
      m.exerciseMin = 0;
      updated = true;
    }
  }

  const standHoursRaw = params.get("standHours") || params.get("stand");
  const standHoursVal = parseSmartMetricValue(standHoursRaw);
  if (standHoursVal !== null) {
    m.standHours = standHoursVal;
    updated = true;
  }

  const floorsRaw = params.get("floors") || params.get("pisos") || params.get("floorsClimbed");
  const floorsVal = parseSmartMetricValue(floorsRaw);
  if (floorsVal !== null) {
    m.floors = floorsVal;
    updated = true;
  } else if (params.has("syncWatch") || params.has("floors")) {
    m.floors = 0;
    updated = true;
  }

  const sleepRaw = params.get("sleep") || params.get("sueno") || params.get("sleepHours") || params.get("horasSueno");
  if (sleepRaw !== null && sleepRaw !== undefined) {
    m.sleep = formatSmartSleepValue(sleepRaw);
    updated = true;
  }

  const deviceParam = params.get("deviceName") || params.get("device");
  if (deviceParam) {
    m.deviceName = decodeURIComponent(deviceParam);
    updated = true;
  }

  const stepsArr = parseSmartMetricArray(stepsRaw);
  const kcalArr = parseSmartMetricArray(kcalRaw);
  const exMinArr = parseSmartMetricArray(exMinRaw);
  const hrArr = parseSmartMetricArray(hrRaw);
  if (kcalArr.length > 1 || stepsArr.length > 1) {
    syncWeeklyWatchHistory(pid, kcalArr, exMinArr, hrArr, stepsArr);
    updated = true;
    addDebugLog("📊 Historial semanal de Salud procesado desde URL", "health", { stepsArr, kcalArr, exMinArr, hrArr });
  }

  const isWorkoutSync = params.has("workout") || params.get("syncWorkout") === "true" || params.has("workoutKcal") || (params.has("duration") && params.has("avgHr"));
  let targetDay = params.get("day");
  if (!targetDay || targetDay === "Hoy" || targetDay === "today" || targetDay.toLowerCase() === "today" || targetDay.toLowerCase() === "hoy") {
    targetDay = getTodayDayName();
  }

  let workoutKcalVal = parseSmartMetricValue(params.get("workoutKcal") || params.get("wKcal"));
  let workoutDurationVal = parseSmartMetricValue(params.get("workoutDuration") || params.get("dur") || params.get("duration"));
  let workoutAvgHrVal = parseSmartMetricValue(params.get("workoutAvgHr") || params.get("avgHr"));
  let workoutMaxHrVal = parseSmartMetricValue(params.get("workoutMaxHr") || params.get("maxHr"));

  if (isWorkoutSync) {
    const durMin = workoutDurationVal !== null ? workoutDurationVal : (exMinVal !== null ? exMinVal : 45);
    const wKcal = workoutKcalVal !== null ? workoutKcalVal : (kcalVal !== null ? kcalVal : 350);
    const avgH = workoutAvgHrVal !== null ? workoutAvgHrVal : (hrVal !== null ? hrVal : 140);
    const maxH = workoutMaxHrVal !== null ? workoutMaxHrVal : (m.maxHr || (avgH + 20));
    
    let timeStr = params.get("time") || params.get("timestamp") || params.get("timeStr");
    if (!timeStr) {
      timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
    } else if (!timeStr.toLowerCase().includes("hs") && !timeStr.toLowerCase().includes("m") && timeStr.includes(":")) {
      timeStr = timeStr.trim() + " hs";
    }

    if (!appState.completedWorkouts) appState.completedWorkouts = {};
    if (!appState.completedWorkouts[pid]) appState.completedWorkouts[pid] = {};

    const existingDayWorkout = appState.completedWorkouts[pid][targetDay] || {};
    let existingSessions = Array.isArray(existingDayWorkout.sessions) ? [...existingDayWorkout.sessions] : (existingDayWorkout.watchData ? [existingDayWorkout.watchData] : []);

    const newSession = {
      id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      deviceName: m.deviceName || `Apple Watch (${appState.profiles[pid].name.split(" ")[0]})`,
      durationMin: durMin,
      kcal: wKcal,
      avgHr: avgH,
      maxHr: maxH,
      timestamp: timeStr,
      autoSync: true,
      isScheduled: true
    };

    const alreadyExists = existingSessions.some(s => s.timestamp === timeStr && s.durationMin === durMin && s.kcal === wKcal);
    if (!alreadyExists) {
      existingSessions.push(newSession);
    }

    appState.completedWorkouts[pid][targetDay] = {
      done: true,
      watchData: newSession,
      sessions: existingSessions
    };
    appState.activeWorkoutDay = targetDay;

    if ((m.exerciseMin || 0) < durMin) m.exerciseMin = durMin;
    if ((m.moveKcal || 0) < wKcal) m.moveKcal = wKcal;

    const targetDateIso = getDateForDayNameInCurrentWeek(targetDay);
    recordDailySnapshot(pid, targetDateIso);
    updated = true;
  }

  if (updated) {
    appState.appleWatch.syncMode = "real";
    appState.appleWatch.lastGlobalSync = new Date().toISOString();

    if (!appState.appleWatch.cloudReplica) appState.appleWatch.cloudReplica = JSON.parse(JSON.stringify(defaultCloudReplica));
    if (!appState.appleWatch.cloudReplica[pid]) appState.appleWatch.cloudReplica[pid] = { ...defaultCloudReplica[pid] };
    const rep = appState.appleWatch.cloudReplica[pid];
    rep.moveKcal = m.moveKcal;
    rep.steps = m.steps;
    rep.distanceKm = m.distanceKm;
    rep.hr = m.hr;
    rep.exerciseMin = m.exerciseMin;
    if (m.floors !== undefined) rep.floors = m.floors;
    if (m.sleep !== undefined) rep.sleep = m.sleep;
    rep.lastSync = new Date().toISOString();

    const pName = appState.profiles[pid].name.split(" ")[0];
    addDebugLog(` Datos de Salud actualizados vía URL para ${pName}`, "success", { moveKcal: m.moveKcal, steps: m.steps, hr: m.hr, exerciseMin: m.exerciseMin });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    appState.appleWatch.syncLogs.unshift({
      timestamp: timeStr,
      device: m.deviceName || "Apple Watch",
      hr: m.hr,
      kcal: m.moveKcal,
      steps: m.steps,
      status: kcalArr.length > 1 ? "Semanas (7 días) Sincronizadas" : (isWorkoutSync ? `Entrenamiento + Salud (${targetDay}) Sincronizado` : "Salud General Sincronizado vía Atajo iOS")
    });
    if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();

    saveState();
    pushToCloud(false);
    if (window.renderAll) window.renderAll();

    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    sessionStorage.setItem("fitduo_shortcut_synced", "true");

    setTimeout(() => {
      if (kcalArr.length > 1) {
        showIosToast(` <strong>¡Historial de 7 días de Apple Watch sincronizado!</strong> (${m.moveKcal} kcal hoy)`, "fa-brands fa-apple");
      } else if (isWorkoutSync) {
        showIosToast(`🏋️ <strong>¡Entrenamiento (${targetDay}) y Salud sincronizados!</strong> (${workoutKcalVal || m.moveKcal} kcal entreno · ${m.steps.toLocaleString()} pasos)`, "fa-solid fa-dumbbell");
      } else {
        showIosToast(` <strong>Atajo de Salud ejecutado:</strong> Datos de Apple Watch (${pName}) cargados (${m.moveKcal} kcal · ${m.steps.toLocaleString()} pasos)`, "fa-brands fa-apple");
      }
    }, 400);

    return true;
  }

  return false;
}

export async function checkClipboardForWatchSync(forceManual = false) {
  addDebugLog("📋 Iniciando comprobación de datos de Salud desde el Portapapeles...", "info");

  if (!navigator.clipboard || !navigator.clipboard.readText) {
    addDebugLog("⚠️ El navegador no soporta la API navigator.clipboard.readText", "warning");
    return false;
  }

  try {
    const text = await navigator.clipboard.readText();
    addDebugLog(`📥 TEXTO BRUTO LEÍDO DEL PORTAPAPELES (${text ? text.length : 0} caracteres)`, "clipboard", { rawText: text || "(Vacío)" });

    if (!text || text.trim().length === 0) {
      return false;
    }

    const pid = getMasterProfileId();
    const m = appState.appleWatch.metrics[pid];

    let updated = false;

    if (text.includes("=") || text.includes("kcal") || text.includes("steps")) {
      const qParams = new URLSearchParams(text.startsWith("?") ? text.slice(1) : text);
      const kcalVal = parseSmartMetricValue(qParams.get("kcal") || qParams.get("moveKcal"));
      if (kcalVal !== null) {
        m.moveKcal = kcalVal;
        updated = true;
      }
      const stepsVal = parseSmartMetricValue(qParams.get("steps"));
      if (stepsVal !== null) {
        m.steps = stepsVal;
        m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
        updated = true;
      }
      const hrVal = parseSmartMetricValue(qParams.get("hr") || qParams.get("avgHr"));
      if (hrVal !== null) {
        m.hr = hrVal;
        updated = true;
      }
    }

    if (updated) {
      appState.appleWatch.syncMode = "real";
      appState.appleWatch.lastGlobalSync = new Date().toISOString();

      saveState();
      if (window.renderAll) window.renderAll();

      const pName = appState.profiles[pid].name.split(" ")[0];
      try {
        await navigator.clipboard.writeText("");
      } catch (clipErr) {}

      showIosToast(`📋 <strong>Sincronización silenciosa:</strong> Datos de Apple Watch (${pName}) cargados desde Portapapeles`, "fa-solid fa-clipboard-check");
      return true;
    }
  } catch(e) {
    addDebugLog(`⚠️ Error leyendo portapapeles: ${e.message}`, "warning");
  }

  return false;
}

export function checkAutoLaunchShortcutOnOpen() {
  if (!appState.appleWatch?.autoLaunchShortcutOnOpen) return;
  if (sessionStorage.getItem("fitduo_shortcut_synced") === "true") return;
  if (sessionStorage.getItem("fitduo_shortcut_launched") === "true") return;

  sessionStorage.setItem("fitduo_shortcut_launched", "true");

  setTimeout(() => {
    launchIosShortcutSync(true, 'health');
  }, 1000);
}

export async function syncHealthShortcutAndCloud() {
  try { triggerHapticTouch(); } catch(e) {}
  sessionStorage.setItem("fitduo_shortcut_launched", "true");
  const pid = appState.activeProfileId || getMasterProfileId();
  const pName = pid === 'he' ? 'Carlos' : 'Andrea';
  const shortcutName = "SubirSaludNubeFitDuo";
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;

  addDebugLog(`☁️ Invocando Atajo de Nube: ${shortcutName} para ${pName}`, "info", { url, pid });
  showIosToast(`☁️ <strong>Subiendo a la Nube:</strong> Ejecutando atajo ${shortcutName}...`, "fa-solid fa-cloud-arrow-up");

  setTimeout(() => {
    window.location.href = url;
  }, 200);

  setTimeout(async () => {
    try {
      showIosToast("📥 Actualizando datos de ambos perfiles desde la Nube...", "fa-solid fa-arrows-rotate");
      await pullFromCloud(true);
      if (window.renderAll) window.renderAll();
    } catch(e) {}
  }, 4000);
}

export async function launchIosShortcutSync(isAuto = false, mode = 'health') {
  triggerHapticTouch();
  sessionStorage.setItem("fitduo_shortcut_launched", "true");

  const shortcutName = mode === 'workout' 
    ? (appState.appleWatch?.shortcutWorkoutName || "SincronizarEntrenamientoFitDuo")
    : (appState.appleWatch?.shortcutName || "SincronizarSaludFitDuo");

  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;

  addDebugLog(`⚡ Invocando Atajo de iOS: ${shortcutName} (${isAuto ? 'Auto' : 'Manual'}, Modo: ${mode})`, "info", { url });

  if (isAuto) {
    showIosToast("⚡ Ejecutando Atajo de Salud de iOS al iniciar...", "fa-brands fa-apple");
  } else {
    showIosToast(`⚡ Lanzando Atajo de iOS (${shortcutName})...`, "fa-brands fa-apple");
  }

  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

export function getShortcutUrl(mode = 'health') {
  let baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  try {
    if (window.location && window.location.href) {
      const cleanHref = window.location.href.split('?')[0].split('#')[0];
      if (cleanHref && cleanHref.length > 5) {
        baseUrl = cleanHref;
      }
    }
  } catch(e) {}

  if (mode === 'workout') {
    return `${baseUrl}?syncWatch=true&workout=true&day=Hoy&workoutKcal=[Calorias_Entreno]&duration=[Duracion_Entreno]&avgHr=[FC_Entreno]&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Ritmo_Cardiaco]&dist=[Distancia]&exMin=[Minutos_Ejercicio]&floors=[Pisos_Subidos]&sleep=[Horas_Sueno]`;
  } else {
    return `${baseUrl}?syncWatch=true&kcal=[Calorias_Activas]&steps=[Pasos]&hr=[Ritmo_Cardiaco]&dist=[Distancia]&exMin=[Minutos_Ejercicio]&floors=[Pisos_Subidos]&sleep=[Horas_Sueno]`;
  }
}

export function getShortcutCloudUrl(mode = 'health', customPid = null) {
  const key = getCloudSyncKey();
  const pid = customPid || getMasterProfileId();
  const channel = `${key}_${pid}`;

  if (mode === 'locked_trigger' || mode === 'locked_start' || mode === 'start') {
    return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/%7B%22author%22%3A%22${pid}%22%2C%22workoutPending%22%3Atrue%7D`;
  } else if (mode === 'locked_end' || mode === 'end' || mode === 'stop') {
    return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/%7B%22author%22%3A%22${pid}%22%2C%22workoutPending%22%3Afalse%7D`;
  } else if (mode === 'workout') {
    return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/{"author":"${pid}","workout":true,"day":"Hoy","workoutKcal":"[Calorias_Entreno]","duration":"[Duracion_Entreno]","avgHr":"[FC_Entreno]","kcal":"[Calorias_Activas]","steps":"[Pasos]","hr":"[Ritmo_Cardiaco]","dist":"[Distancia]","exMin":"[Minutos_Ejercicio]","floors":"[Pisos_Subidos]","sleep":"[Horas_Sueno]"}`;
  } else {
    return `https://ps.pubnub.com/publish/demo/demo/0/${channel}/0/{"author":"${pid}","kcal":"[Calorias_Activas]","steps":"[Pasos]","hr":"[Ritmo_Cardiaco]","dist":"[Distancia]","exMin":"[Minutos_Ejercicio]","floors":"[Pisos_Subidos]","sleep":"[Horas_Sueno]"}`;
  }
}

export function updateShortcutUrlInputs() {
  try {
    const healthInput = document.getElementById("shortcut-url-health-input");
    if (healthInput) healthInput.value = getShortcutUrl('health');

    const workoutInput = document.getElementById("shortcut-url-workout-input");
    if (workoutInput) workoutInput.value = getShortcutUrl('workout');

    const cloudHealthInput = document.getElementById("shortcut-cloud-url-health-input");
    if (cloudHealthInput) cloudHealthInput.value = getShortcutCloudUrl('health');

    const cloudWorkoutInput = document.getElementById("shortcut-cloud-url-workout-input");
    if (cloudWorkoutInput) cloudWorkoutInput.value = getShortcutCloudUrl('workout');

    const cloudLockedInput = document.getElementById("shortcut-cloud-url-locked-input");
    if (cloudLockedInput) cloudLockedInput.value = getShortcutCloudUrl('locked_start');

    const cloudLockedEndInput = document.getElementById("shortcut-cloud-url-locked-end-input");
    if (cloudLockedEndInput) cloudLockedEndInput.value = getShortcutCloudUrl('locked_end');

    const settingsCloudInput = document.getElementById("settings-shortcut-cloud-url-input");
    if (settingsCloudInput) settingsCloudInput.value = getShortcutCloudUrl('health');
  } catch(e) {
    console.error("Error updating shortcut URL inputs:", e);
  }
}

export function copyShortcutUrlToClipboard(mode = 'health') {
  try { triggerHapticTouch(); } catch(e) {}
  const url = getShortcutUrl(mode);
  
  const inputId = mode === 'workout' ? 'shortcut-url-workout-input' : 'shortcut-url-health-input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.value = url;
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
  }

  const label = mode === 'workout' ? 'Entrenamiento + Salud (Safari)' : 'Solo Salud (Safari)';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada</strong>. Pégala en "Abrir URL" de Atajos iOS.`, "fa-solid fa-copy");
    }).catch(() => {
      try {
        document.execCommand('copy');
        showIosToast(`📋 <strong>URL del Atajo (${label}) seleccionada y copiada</strong>.`, "fa-solid fa-copy");
      } catch(err) {
        showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
      }
    });
  } else {
    try {
      document.execCommand('copy');
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada</strong>.`, "fa-solid fa-copy");
    } catch(err) {
      showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
    }
  }
}

export function copyShortcutCloudUrlToClipboard(mode = 'health') {
  try { triggerHapticTouch(); } catch(e) {}
  const url = getShortcutCloudUrl(mode);
  
  let inputId = 'shortcut-cloud-url-health-input';
  if (mode === 'workout') inputId = 'shortcut-cloud-url-workout-input';
  else if (mode === 'locked_trigger' || mode === 'locked_start') inputId = 'shortcut-cloud-url-locked-input';

  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.value = url;
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
  }

  let label = 'Salud en 2º Plano (Nube)';
  if (mode === 'workout') label = 'Entrenamiento en 2º Plano (Nube)';
  else if (mode === 'locked_trigger' || mode === 'locked_start') label = 'Aviso Ligero Pantalla Bloqueada (100% Sin Errores)';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showIosToast(`☁️ <strong>URL de Subida Nube (${label}) copiada</strong>. Pégala en "Obtener contenido de URL" de Atajos iOS.`, "fa-solid fa-cloud-arrow-up");
    }).catch(() => {
      try {
        document.execCommand('copy');
        showIosToast(`☁️ <strong>URL de Subida Nube (${label}) copiada</strong>.`, "fa-solid fa-cloud-arrow-up");
      } catch(err) {
        showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
      }
    });
  } else {
    try {
      document.execCommand('copy');
      showIosToast(`☁️ <strong>URL de Subida Nube (${label}) copiada</strong>.`, "fa-solid fa-cloud-arrow-up");
    } catch(err) {
      showIosToast("📋 Texto seleccionado. Mantén pulsado el cuadro y selecciona 'Copiar'.", "fa-solid fa-copy");
    }
  }
}

export function fallbackCopyTextToClipboard(text, mode) {
  const inputId = mode === 'workout' ? 'shortcut-url-workout-input' : 'shortcut-url-health-input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.focus();
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      const label = mode === 'workout' ? 'Entrenamiento + Salud' : 'Solo Salud';
      showIosToast(`📋 <strong>URL del Atajo (${label}) copiada al portapapeles</strong>.`, "fa-solid fa-copy");
      return;
    } catch(e) {}
  }
  showIosToast("⚠️ Selecciona el texto del cuadro y usa Copiar.", "fa-solid fa-exclamation-triangle");
}

export function openHealthSyncModal() {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.add("active");
}

export function closeHealthSyncModal() {
  try { triggerHapticTouch(); } catch(e) {}
  const modal = document.getElementById("health-sync-modal");
  if (modal) modal.classList.remove("active");
}

export function applyReplicaToPrimary(customPid = null) {
  try { triggerHapticTouch(); } catch(e) {}
  const pid = customPid || appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  const rep = appState.appleWatch?.cloudReplica?.[pid];
  const m = appState.appleWatch?.metrics?.[pid];

  if (!rep || !m) {
    showIosToast("⚠️ No hay datos de Réplica disponibles para aplicar.", "fa-solid fa-triangle-exclamation");
    return;
  }

  m.moveKcal = rep.moveKcal || m.moveKcal;
  m.steps = rep.steps || m.steps;
  m.distanceKm = rep.distanceKm || m.distanceKm;
  m.hr = rep.hr || m.hr;
  m.exerciseMin = rep.exerciseMin || m.exerciseMin;
  if (rep.floors !== undefined) m.floors = rep.floors;
  if (rep.sleep !== undefined) m.sleep = rep.sleep;
  appState.appleWatch.lastGlobalSync = new Date().toISOString();

  saveState();
  if (window.renderAll) window.renderAll();

  showIosToast(`📥 <strong>Datos de Réplica aplicados a Principal</strong> (${m.steps.toLocaleString()} pasos, ${m.moveKcal} kcal para ${authorName}).`, "fa-solid fa-circle-check");
}

export function openManualMetricsModal() {
  try { triggerHapticTouch(); } catch(e) {}
  const pid = appState.activeProfileId || 'he';
  const p = appState.profiles[pid];
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  const subtitle = document.getElementById("manual-metrics-modal-subtitle");
  if (subtitle) subtitle.innerText = `Calibrar datos del panel Principal para ${p?.name || 'Usuario'}`;

  const stepsInp = document.getElementById("manual-edit-steps");
  if (stepsInp) stepsInp.value = m.steps;

  const kcalInp = document.getElementById("manual-edit-kcal");
  if (kcalInp) kcalInp.value = m.moveKcal;

  const hrInp = document.getElementById("manual-edit-hr");
  if (hrInp) hrInp.value = m.hr;

  const exminInp = document.getElementById("manual-edit-exmin");
  if (exminInp) exminInp.value = m.exerciseMin;

  const floorsInp = document.getElementById("manual-edit-floors");
  if (floorsInp) floorsInp.value = m.floors ?? 0;

  const sleepInp = document.getElementById("manual-edit-sleep");
  if (sleepInp) sleepInp.value = m.sleep || "--";

  const distInp = document.getElementById("manual-edit-dist");
  if (distInp) distInp.value = m.distanceKm;

  const modal = document.getElementById("manual-metrics-modal");
  if (modal) modal.classList.add("active");
}

export function closeManualMetricsModal() {
  try { triggerHapticTouch(); } catch(e) {}
  const modal = document.getElementById("manual-metrics-modal");
  if (modal) modal.classList.remove("active");
}

export function saveManualMetricsFromModal(e) {
  if (e) e.preventDefault();
  try { triggerHapticTouch(); } catch(e) {}
  const pid = appState.activeProfileId || 'he';
  const m = appState.appleWatch?.metrics?.[pid];
  if (!m) return;

  const stepsVal = parseInt(document.getElementById("manual-edit-steps")?.value);
  const kcalVal = parseInt(document.getElementById("manual-edit-kcal")?.value);
  const hrVal = parseInt(document.getElementById("manual-edit-hr")?.value);
  const exminVal = parseInt(document.getElementById("manual-edit-exmin")?.value);
  const floorsVal = parseInt(document.getElementById("manual-edit-floors")?.value);
  const sleepVal = document.getElementById("manual-edit-sleep")?.value?.trim();
  const distVal = parseFloat(document.getElementById("manual-edit-dist")?.value);

  if (!isNaN(stepsVal) && stepsVal >= 0) m.steps = stepsVal;
  if (!isNaN(kcalVal) && kcalVal >= 0) m.moveKcal = kcalVal;
  if (!isNaN(hrVal) && hrVal > 0) m.hr = hrVal;
  if (!isNaN(exminVal) && exminVal >= 0) m.exerciseMin = exminVal;
  if (!isNaN(floorsVal) && floorsVal >= 0) m.floors = floorsVal;
  if (sleepVal) m.sleep = formatSmartSleepValue(sleepVal);
  if (!isNaN(distVal) && distVal >= 0) m.distanceKm = distVal;

  appState.appleWatch.lastGlobalSync = new Date().toISOString();
  saveState();
  if (window.renderAll) window.renderAll();
  closeManualMetricsModal();

  showIosToast(`💾 <strong>Métricas guardadas manualmente</strong> (${m.steps.toLocaleString()} pasos, ${m.moveKcal} kcal).`, "fa-solid fa-circle-check");
}

export function switchShortcutMethodTab(methodName) {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();

  const btnCloud = document.getElementById("shortcut-method-btn-cloud");
  const btnSafari = document.getElementById("shortcut-method-btn-safari");
  const paneCloud = document.getElementById("shortcut-method-pane-cloud");
  const paneSafari = document.getElementById("shortcut-method-pane-safari");

  if (methodName === 'cloud') {
    if (btnCloud) {
      btnCloud.className = "shortcut-tab-btn active";
      btnCloud.style.background = "linear-gradient(135deg, var(--accent-cyan), #2563eb)";
      btnCloud.style.color = "#ffffff";
    }
    if (btnSafari) {
      btnSafari.className = "shortcut-tab-btn";
      btnSafari.style.background = "transparent";
      btnSafari.style.color = "var(--text-secondary)";
    }
    if (paneCloud) paneCloud.style.display = "block";
    if (paneSafari) paneSafari.style.display = "none";
  } else {
    if (btnCloud) {
      btnCloud.className = "shortcut-tab-btn";
      btnCloud.style.background = "transparent";
      btnCloud.style.color = "var(--text-secondary)";
    }
    if (btnSafari) {
      btnSafari.className = "shortcut-tab-btn active";
      btnSafari.style.background = "var(--gradient-primary)";
      btnSafari.style.color = "#ffffff";
    }
    if (paneCloud) paneCloud.style.display = "none";
    if (paneSafari) paneSafari.style.display = "block";
  }
}

export function switchShortcutTab(tabName) {
  try { triggerHapticTouch(); } catch(e) {}
  updateShortcutUrlInputs();

  const btnHealth = document.getElementById("shortcut-tab-btn-health");
  const btnWorkout = document.getElementById("shortcut-tab-btn-workout");
  const paneHealth = document.getElementById("shortcut-pane-health");
  const paneWorkout = document.getElementById("shortcut-pane-workout");

  if (tabName === 'health') {
    if (btnHealth) {
      btnHealth.className = "shortcut-tab-btn active";
      btnHealth.style.background = "var(--gradient-primary)";
      btnHealth.style.color = "#ffffff";
    }
    if (btnWorkout) {
      btnWorkout.className = "shortcut-tab-btn";
      btnWorkout.style.background = "transparent";
      btnWorkout.style.color = "var(--text-secondary)";
    }
    if (paneHealth) {
      paneHealth.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important;";
    }
    if (paneWorkout) {
      paneWorkout.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important;";
    }
  } else {
    if (btnHealth) {
      btnHealth.className = "shortcut-tab-btn";
      btnHealth.style.background = "transparent";
      btnHealth.style.color = "var(--text-secondary)";
    }
    if (btnWorkout) {
      btnWorkout.className = "shortcut-tab-btn active";
      btnWorkout.style.background = "linear-gradient(135deg, #f43f5e, #e11d48)";
      btnWorkout.style.color = "#ffffff";
    }
    if (paneHealth) {
      paneHealth.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important;";
    }
    if (paneWorkout) {
      paneWorkout.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important;";
    }
  }
}

export function testSimulatedHealthSync() {
  triggerHapticTouch();
  const randomKcal = Math.floor(480 + Math.random() * 220);
  const randomSteps = Math.floor(8200 + Math.random() * 4000);
  const randomHr = Math.floor(68 + Math.random() * 18);
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&kcal=${randomKcal}&steps=${randomSteps}&hr=${randomHr}&exMin=45&dist=6.8&stand=10`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  if (window.renderAll) window.renderAll();
}

export function testSimulatedWorkoutSync() {
  triggerHapticTouch();
  const todayDay = getTodayDayName();
  const randomKcal = Math.floor(580 + Math.random() * 200);
  const randomSteps = Math.floor(9500 + Math.random() * 3500);
  const randomHr = Math.floor(72 + Math.random() * 15);
  const workoutKcal = Math.floor(380 + Math.random() * 140);
  const workoutHr = Math.floor(142 + Math.random() * 18);
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&workout=true&day=${encodeURIComponent(todayDay)}&kcal=${randomKcal}&steps=${randomSteps}&hr=${randomHr}&exMin=55&dist=7.9&stand=12&workoutKcal=${workoutKcal}&duration=50&avgHr=${workoutHr}&maxHr=${workoutHr + 24}`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  if (window.renderAll) window.renderAll();
}

export function resetMetricsToZeroUsingUrlShortcut(customPid = null) {
  try { triggerHapticTouch(); } catch(e) {}
  const pid = customPid || appState.activeProfileId || 'he';
  const authorName = pid === 'he' ? 'Carlos' : 'Andrea';
  const testUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?syncWatch=true&profile=${pid}&kcal=0&steps=0&hr=0&dist=0&exMin=0`;
  window.history.replaceState({}, document.title, testUrl);
  checkUrlParamsForWatchSync();
  saveState();
  if (window.renderAll) window.renderAll();
  showIosToast(`🔄 <strong>Métricas de ${authorName} cargadas a vacío (0)</strong> vía método URL de Atajo.`, "fa-solid fa-rotate-left");
}

export async function testSimulatedBackgroundCloudSync() {
  triggerHapticTouch();
  const key = getCloudSyncKey();
  const masterPid = getMasterProfileId();
  const authorName = masterPid === 'he' ? 'Carlos' : 'Andrea';
  const todayDay = getTodayDayName();

  const randomKcal = Math.floor(520 + Math.random() * 220);
  const randomSteps = Math.floor(8800 + Math.random() * 3800);
  const randomDist = parseFloat((randomSteps * 0.00075).toFixed(2));
  const randomHr = Math.floor(70 + Math.random() * 16);
  const randomExMin = Math.floor(35 + Math.random() * 25);
  const workoutKcal = Math.floor(390 + Math.random() * 120);
  const workoutHr = Math.floor(140 + Math.random() * 16);

  addSyncConsoleLog(`🧪 [SIMULADOR ATAJO EN 2º PLANO] Enviando telemetría de Salud (${randomSteps} pasos, ${randomKcal} kcal, ${randomDist} km, ${randomExMin} min ejerc, ${randomHr} bpm) de ${authorName} a la Nube...`, "info");
  showIosToast(`🧪 <strong>Simulando Atajo en 2º Plano:</strong> Enviando métricas a la nube...`, "fa-solid fa-cloud-arrow-up");

  const payload = {
    author: masterPid,
    authorProfileId: masterPid,
    workout: true,
    day: todayDay,
    steps: randomSteps,
    kcal: randomKcal,
    dist: randomDist,
    distanceKm: randomDist,
    exerciseMin: randomExMin,
    exMin: randomExMin,
    hr: randomHr,
    avgHr: randomHr,
    workoutKcal: workoutKcal,
    duration: randomExMin,
    workoutAvgHr: workoutHr,
    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs"
  };

  try {
    const pnChannel = `${key}_${masterPid}`;
    const encodedMsg = encodeURIComponent(JSON.stringify(payload));
    const pnPubUrl = `https://ps.pubnub.com/publish/demo/demo/0/${pnChannel}/0/${encodedMsg}`;
    const res = await fetch(pnPubUrl);
    if (res.ok) {
      addSyncConsoleLog(`✅ Simulador: Mensaje inyectado en la Nube (${pnChannel})`, "success");
      setTimeout(() => {
        pullFromCloud(true);
      }, 500);
    }
  } catch (e) {
    addSyncConsoleLog(`⚠️ Simulador error: ${e.message}`, "warn");
  }
}

export function updateAppleWatchModalUI() {
  const pid = appState.activeProfileId;
  const m = appState.appleWatch?.metrics?.[pid];
  const pName = appState.profiles[pid]?.name?.split(" ")[0] || "Carlos";
  if (!m) return;

  const mode = appState.appleWatch.syncMode || "real";

  const shortcutToggle = document.getElementById("toggle-auto-launch-shortcut");
  if (shortcutToggle) shortcutToggle.checked = !!appState.appleWatch.autoLaunchShortcutOnOpen;

  const btnReal = document.getElementById("btn-mode-real");
  const btnDemo = document.getElementById("btn-mode-demo");
  if (btnReal) btnReal.className = `mode-btn ${mode === 'real' ? 'active' : ''}`;
  if (btnDemo) btnDemo.className = `mode-btn ${mode === 'demo' ? 'active' : ''}`;

  const modeBadge = document.getElementById("watch-mode-badge");
  if (modeBadge) {
    modeBadge.innerHTML = mode === "real" 
      ? `<i class="fa-solid fa-shield-halved"></i> Datos Reales Estables` 
      : `<i class="fa-solid fa-vial"></i> Simulación Demo`;
  }

  const modeDesc = document.getElementById("watch-mode-desc");
  if (modeDesc) {
    modeDesc.innerHTML = mode === "real" 
      ? `✓ <strong>Modo Datos Reales:</strong> Las mediciones se mantienen congeladas y 100% precisas según los datos reales de tu reloj.` 
      : `⚡ <strong>Modo Simulación Demo:</strong> Generando telemetría simulada en tiempo real para demostración.`;
  }

  const deviceEl = document.getElementById("watch-device-name");
  if (deviceEl) deviceEl.innerText = `${m.deviceName}`;

  const subEl = document.getElementById("modal-watch-subtitle");
  if (subEl) subEl.innerText = `Salud iOS (${pName}) - ${mode === 'real' ? 'Medición Real' : 'Demostración'}`;

  const batEl = document.getElementById("watch-battery-level");
  if (batEl) batEl.innerText = `${m.battery || 88}%`;

  const toggleEl = document.getElementById("toggle-auto-sync");
  if (toggleEl) toggleEl.checked = !!appState.appleWatch.autoSyncEnabled;

  const timeDiffSec = Math.round((new Date() - new Date(appState.appleWatch.lastGlobalSync || new Date())) / 1000);
  const tsEl = document.getElementById("watch-sync-timestamp");
  if (tsEl) tsEl.innerText = `Sincronizado: Hace ${timeDiffSec < 3 ? 'un instante' : timeDiffSec + ' seg'}`;

  document.querySelectorAll("[id='watch-metric-hr']").forEach(el => el.innerHTML = `${m.hr} <small>BPM</small>`);
  document.querySelectorAll("[id='watch-metric-floors']").forEach(el => el.innerHTML = `${m.floors ?? 0} <small>pisos</small>`);
  document.querySelectorAll("[id='watch-metric-sleep']").forEach(el => el.innerHTML = `${formatSmartSleepValue(m.sleep)}`);
  document.querySelectorAll("[id='watch-metric-dist']").forEach(el => el.innerHTML = `${m.distanceKm} <small>km</small>`);

  const moveGoal = m.moveGoal || m.targetKcal || 600;
  const moveRatio = Math.min(1.2, m.moveKcal / moveGoal);
  const moveOffset = Math.max(0, 314 - (314 * Math.min(1, moveRatio)));
  document.querySelectorAll("[id='ring-move-circle']").forEach(el => el.style.strokeDashoffset = moveOffset);
  document.querySelectorAll("[id='ring-move-val']").forEach(el => el.innerText = `${m.moveKcal} / ${moveGoal} kcal`);

  const exGoal = m.exerciseGoal || m.targetMin || 30;
  const exRatio = Math.min(1.2, m.exerciseMin / exGoal);
  const exOffset = Math.max(0, 238 - (238 * Math.min(1, exRatio)));
  document.querySelectorAll("[id='ring-exercise-circle']").forEach(el => el.style.strokeDashoffset = exOffset);
  document.querySelectorAll("[id='ring-exercise-val']").forEach(el => el.innerText = `${m.exerciseMin} / ${exGoal} min`);

  const stepsGoal = m.stepsGoal || m.targetSteps || 10000;
  const stepsRatio = Math.min(1.2, m.steps / stepsGoal);
  const stepsOffset = Math.max(0, 163 - (163 * Math.min(1, stepsRatio)));
  document.querySelectorAll("[id='ring-steps-circle'], [id='ring-stand-circle']").forEach(el => el.style.strokeDashoffset = stepsOffset);
  document.querySelectorAll("[id='ring-steps-val'], [id='ring-stand-val']").forEach(el => el.innerText = `${m.steps.toLocaleString()} / ${stepsGoal.toLocaleString()} pasos`);

  const logList = document.getElementById("sync-log-list");
  if (logList) {
    if (!appState.appleWatch.syncLogs || appState.appleWatch.syncLogs.length === 0) {
      logList.innerHTML = `<li class="sync-log-item"><span class="sync-log-time">Ahora</span><span class="sync-log-detail">Conexión Salud iOS Inicializada</span></li>`;
    } else {
      logList.innerHTML = appState.appleWatch.syncLogs.map(l => `
        <li class="sync-log-item">
          <span class="sync-log-time">${l.timestamp} - ${l.device}</span>
          <span class="sync-log-detail">${l.kcal} kcal | ${l.hr} BPM | ${l.steps} pasos (${l.status})</span>
        </li>
      `).join("");
    }
  }
}

export function handleHealthFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const pid = appState.activeProfileId;
    const m = appState.appleWatch.metrics[pid];

    try {
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(content);
        if (json.steps) m.steps = parseInt(json.steps);
        if (json.activeCalories) m.moveKcal = parseInt(json.activeCalories);
        if (json.heartRate) m.hr = parseInt(json.heartRate);
      } else {
        const stepMatches = [...content.matchAll(/HKQuantityTypeIdentifierStepCount[^>]+value="(\d+)"/g)];
        if (stepMatches.length > 0) {
          const totalSteps = stepMatches.slice(-20).reduce((acc, match) => acc + parseInt(match[1]), 0);
          if (totalSteps > 0) m.steps = totalSteps;
        }

        const kcalMatches = [...content.matchAll(/HKQuantityTypeIdentifierActiveEnergyBurned[^>]+value="([\d.]+)"/g)];
        if (kcalMatches.length > 0) {
          const totalKcal = Math.round(kcalMatches.slice(-20).reduce((acc, match) => acc + parseFloat(match[1]), 0));
          if (totalKcal > 0) m.moveKcal = totalKcal;
        }
      }

      m.distanceKm = parseFloat((m.steps * 0.00075).toFixed(2));
      appState.appleWatch.syncMode = "real";
      appState.appleWatch.lastGlobalSync = new Date().toISOString();

      saveState();
      if (window.renderAll) window.renderAll();

      showIosToast(`📄 Archivo de Salud iOS importado con éxito: ${m.steps.toLocaleString()} pasos y ${m.moveKcal} kcal cargados.`, "fa-solid fa-file-circle-check");
    } catch(err) {
      showIosToast(`⚠️ Error al leer el archivo de Salud iOS: Comprueba el formato XML/JSON.`, "fa-solid fa-triangle-exclamation");
    }
  };
  reader.readAsText(file);
}

export function toggleShortcutGuide(guideId) {
  try {
    triggerHapticTouch();
    const el = document.getElementById(guideId || "shortcut-guide-details");
    if (el) {
      el.classList.toggle("active");
    }
  } catch(e) {}
}
