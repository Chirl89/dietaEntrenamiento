import { appState, defaultWatchMetrics, defaultCloudReplica, LOCAL_STORAGE_KEY, LAST_REGISTERED_METRICS_KEY, getMasterProfileId, triggerHapticTouch, showIosToast, getTodayDayName } from './state.js';
import { parseSmartMetricValue, parseSmartMetricFloatValue, formatSmartSleepValue, toUrlSafeB64, fromUrlSafeB64 } from './utils.js';

export const CLOUD_SYNC_APP_KEY = "fitduo_v2";
export const DEFAULT_CLOUD_KEY = "fitduo_sync_v2";
export let isCloudSyncing = false;

export function getCloudSyncKey() {
  return localStorage.getItem("FITDUO_CLOUD_KEY") || DEFAULT_CLOUD_KEY;
}

export function addSyncConsoleLog(message, type = "info") {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const logLine = `[${timeStr}] ${message}\n`;
  if (consoleEl) {
    consoleEl.textContent = logLine + consoleEl.textContent.slice(0, 1000);
  }
  console.log(`[SYNC CONSOLE ${type.toUpperCase()}] ${message}`);
}

export async function cleanAndParseJsonFromCloud(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();
  if (text === 'null' || text === '""' || text.length < 2) return null;

  // Priority 1: Handle PubNub History API response structure
  if (text.includes('"channels":') && text.includes('"message":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.channels && typeof parsed.channels === 'object') {
        const chKeys = Object.keys(parsed.channels);
        for (let ch of chKeys) {
          const msgList = parsed.channels[ch];
          if (Array.isArray(msgList) && msgList.length > 0) {
            const lastMsg = msgList[msgList.length - 1];
            if (lastMsg && lastMsg.message) {
              const parsedFromMsg = await cleanAndParseJsonFromCloud(
                typeof lastMsg.message === 'string' ? lastMsg.message : JSON.stringify(lastMsg.message)
              );
              if (parsedFromMsg && typeof parsedFromMsg === 'object') {
                if (lastMsg.timetoken) {
                  parsedFromMsg._timetoken = String(lastMsg.timetoken);
                  const pubDate = new Date(parseInt(lastMsg.timetoken) / 10000);
                  if (!isNaN(pubDate.getTime())) {
                    parsedFromMsg._timeStr = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
                  }
                }
                return parsedFromMsg;
              }
            }
          }
        }
      }
    } catch (ePn) {}
  }

  // Priority 2: Handle Webhook.site API response structure
  if (text.includes('"data":') && text.includes('"content":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
        for (let reqItem of parsed.data) {
          if (reqItem && reqItem.content && typeof reqItem.content === 'string') {
            const parsedFromContent = await cleanAndParseJsonFromCloud(reqItem.content);
            if (parsedFromContent) return parsedFromContent;
          }
        }
      }
    } catch (eWh) {}
  }

  // Priority 3: Handle ntfy.sh JSON poll stream
  if (text.includes('"message":') || text.includes('"event":')) {
    const lines = text.split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item && item.message && typeof item.message === 'string') {
          const parsedFromMsg = await cleanAndParseJsonFromCloud(item.message);
          if (parsedFromMsg) return parsedFromMsg;
        }
      } catch (e) {}
    }
  }

  // Priority 4: URL-Encoded strings
  if (text.includes("%7B") || text.includes("%7b") || text.includes("%22")) {
    try {
      const decoded = decodeURIComponent(text);
      const parsedDecoded = await cleanAndParseJsonFromCloud(decoded);
      if (parsedDecoded) return parsedDecoded;
    } catch (eDec) {}
  }

  // Priority 5: URL query parameters
  if (text.includes("=") && (text.includes("kcal") || text.includes("steps") || text.includes("author") || text.includes("syncWatch") || text.includes("workout") || text.includes("duration"))) {
    try {
      const cleanParamsText = text.startsWith("?") ? text.slice(1) : text;
      const qParams = new URLSearchParams(cleanParamsText);
      const resObj = {};
      for (const [k, v] of qParams.entries()) {
        resObj[k] = v;
      }
      if (Object.keys(resObj).length > 0) {
        return resObj;
      }
    } catch (eQ) {}
  }

  // Priority 6: URL-Safe Base64 decoding
  const fromUrlB64 = fromUrlSafeB64(text);
  if (fromUrlB64) return fromUrlB64;

  // Priority 7: Direct Raw JSON Parsing
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (eDirect) {}
  }

  // Priority 8: Escaped JSON string
  if (text.startsWith('"') && text.endsWith('"')) {
    try {
      const unquoted = JSON.parse(text);
      if (typeof unquoted === 'string') {
        const parsedInner = await cleanAndParseJsonFromCloud(unquoted);
        if (parsedInner) return parsedInner;
      } else if (typeof unquoted === 'object' && unquoted !== null) {
        return unquoted;
      }
    } catch (eUnquote) {}
  }

  return null;
}

export function mergeCloudDataIntoAppState(cloudData) {
  if (!cloudData || typeof cloudData !== 'object') return false;
  let hasChanges = false;
  const author = cloudData.authorProfileId || cloudData.masterProfileId || cloudData.author || cloudData.pid || 'he';
  const authorName = author === 'he' ? 'Carlos' : author === 'she' ? 'Andrea' : author;

  if (!appState.appleWatch) appState.appleWatch = {};
  if (!appState.appleWatch.metrics) appState.appleWatch.metrics = JSON.parse(JSON.stringify(defaultWatchMetrics));
  if (!appState.appleWatch.metrics[author]) appState.appleWatch.metrics[author] = { ...defaultWatchMetrics[author] };

  if (!appState.appleWatch.cloudReplica) appState.appleWatch.cloudReplica = JSON.parse(JSON.stringify(defaultCloudReplica));
  if (!appState.appleWatch.cloudReplica[author]) appState.appleWatch.cloudReplica[author] = { ...defaultCloudReplica[author] };

  if (cloudData.appleWatch?.metrics && cloudData.profiles) {
    if (cloudData.appleWatch.metrics[author]) {
      appState.appleWatch.metrics[author] = { ...appState.appleWatch.metrics[author], ...cloudData.appleWatch.metrics[author] };
    }
    if (cloudData.appleWatch.cloudReplica?.[author]) {
      appState.appleWatch.cloudReplica[author] = { ...appState.appleWatch.cloudReplica[author], ...cloudData.appleWatch.cloudReplica[author] };
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
    hasChanges = true;
  }

  const rep = appState.appleWatch.cloudReplica[author];
  const m = appState.appleWatch.metrics[author];
  let replicaMetricsUpdated = false;

  const kcalVal = parseSmartMetricValue(cloudData.kcal ?? cloudData.moveKcal ?? cloudData.activeCalories ?? cloudData.calorias);
  if (kcalVal !== null) {
    rep.moveKcal = kcalVal;
    m.moveKcal = kcalVal;
    replicaMetricsUpdated = true;
  }

  const stepsVal = parseSmartMetricValue(cloudData.steps ?? cloudData.pasos);
  if (stepsVal !== null) {
    rep.steps = stepsVal;
    m.steps = stepsVal;
    rep.distanceKm = parseFloat((rep.steps * 0.00075).toFixed(2));
    m.distanceKm = rep.distanceKm;
    replicaMetricsUpdated = true;
  }

  const distVal = parseSmartMetricFloatValue(cloudData.dist ?? cloudData.distanceKm ?? cloudData.distance ?? cloudData.distancia);
  if (distVal !== null) {
    rep.distanceKm = distVal;
    m.distanceKm = distVal;
    replicaMetricsUpdated = true;
  }

  const hrVal = parseSmartMetricValue(cloudData.hr ?? cloudData.heartRate ?? cloudData.avgHr ?? cloudData.pulso ?? cloudData.ritmoCardiaco);
  if (hrVal !== null) {
    rep.hr = hrVal;
    m.hr = hrVal;
    replicaMetricsUpdated = true;
  }

  const exMinVal = parseSmartMetricValue(cloudData.exMin ?? cloudData.exerciseMin ?? cloudData.durationMin ?? cloudData.minutosEjercicio);
  if (exMinVal !== null) {
    rep.exerciseMin = exMinVal;
    m.exerciseMin = exMinVal;
    replicaMetricsUpdated = true;
  }

  const floorsVal = parseSmartMetricValue(cloudData.floors ?? cloudData.pisos ?? cloudData.floorsClimbed);
  if (floorsVal !== null) {
    rep.floors = floorsVal;
    m.floors = floorsVal;
    replicaMetricsUpdated = true;
  } else if (cloudData.floors !== undefined || cloudData.syncWatch) {
    rep.floors = 0;
    m.floors = 0;
    replicaMetricsUpdated = true;
  }

  const sleepRaw = cloudData.sleep ?? cloudData.sueno ?? cloudData.sleepHours ?? cloudData.horasSueno;
  if (sleepRaw !== undefined) {
    const formattedSleep = formatSmartSleepValue(sleepRaw);
    rep.sleep = formattedSleep;
    m.sleep = formattedSleep;
    replicaMetricsUpdated = true;
  }

  if (replicaMetricsUpdated) {
    rep.lastSync = new Date().toISOString();
    appState.appleWatch.lastGlobalSync = new Date().toISOString();
    hasChanges = true;
  }

  const weightVal = parseSmartMetricValue(cloudData.weight ?? cloudData.peso);
  if (weightVal !== null && weightVal > 30 && weightVal < 250) {
    if (!appState.weightLogs) appState.weightLogs = {};
    if (!appState.weightLogs[author]) appState.weightLogs[author] = [];
    const todayStr = "Hoy";
    const existingIdx = appState.weightLogs[author].findIndex(w => w && w.date === todayStr);
    if (existingIdx >= 0) {
      appState.weightLogs[author][existingIdx].weight = weightVal;
    } else {
      appState.weightLogs[author].push({ date: todayStr, weight: weightVal });
    }
    hasChanges = true;
  }

  const isWorkoutSync = cloudData.workout === true || cloudData.workout === "true" || cloudData.syncWorkout === true || cloudData.syncWorkout === "true" || (cloudData.workoutKcal !== undefined && cloudData.workoutKcal !== "0" && cloudData.workoutKcal !== 0) || (cloudData.duration !== undefined && cloudData.duration !== "0" && cloudData.duration !== 0);
  if (isWorkoutSync) {
    let targetDay = cloudData.day;
    if (!targetDay || targetDay === "Hoy" || targetDay === "today" || targetDay.toLowerCase() === "today" || targetDay.toLowerCase() === "hoy") {
      targetDay = getTodayDayName();
    }
    const wDur = parseSmartMetricValue(cloudData.workoutDuration ?? cloudData.duration ?? cloudData.dur) ?? 0;
    const wKcal = parseSmartMetricValue(cloudData.workoutKcal ?? cloudData.wKcal) ?? 0;

    if (wDur > 0 || wKcal > 0) {
      const timeStr = cloudData.timeStr || (cloudData.timestamp ? (cloudData.timestamp.includes(":") ? cloudData.timestamp : new Date(cloudData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs") : (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs"));

      if (!appState.completedWorkouts) appState.completedWorkouts = {};
      if (!appState.completedWorkouts[author]) appState.completedWorkouts[author] = {};
      
      const existingDayWorkout = appState.completedWorkouts[author][targetDay] || {};
      let existingSessions = Array.isArray(existingDayWorkout.sessions) ? [...existingDayWorkout.sessions] : (existingDayWorkout.watchData ? [existingDayWorkout.watchData] : []);

      const newSession = {
        id: cloudData.id || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        deviceName: `Apple Watch (${authorName})`,
        durationMin: wDur,
        kcal: wKcal,
        timestamp: timeStr,
        autoSync: true
      };

      const isDuplicate = existingSessions.some(s =>
        (s.id && newSession.id && s.id === newSession.id) ||
        (s.durationMin === wDur && s.kcal === wKcal && s.timestamp === timeStr)
      );

      if (!isDuplicate) {
        existingSessions.push(newSession);
      }

      appState.completedWorkouts[author][targetDay] = {
        done: true,
        watchData: newSession,
        sessions: existingSessions
      };
      hasChanges = true;
    }
  }

  if (replicaMetricsUpdated) {
    hasChanges = true;
    rep.lastSync = new Date().toISOString();
    rep.source = "Atajo Nube en 2º Plano";

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appState.appleWatch.syncLogs.unshift({
      timestamp: timeStr,
      device: `Apple Watch (${authorName})`,
      hr: rep.hr,
      kcal: rep.moveKcal,
      steps: rep.steps,
      status: `☁️ Réplica Nube (${authorName}): ${rep.steps.toLocaleString()} pasos, ${rep.moveKcal} kcal`
    });
    if (appState.appleWatch.syncLogs.length > 8) appState.appleWatch.syncLogs.pop();
  }

  ['he', 'she', 'dog'].forEach(pid => {
    if (cloudData.profiles?.[pid]) {
      if (!appState.profiles) appState.profiles = {};
      if (pid === author || pid === 'dog') {
        appState.profiles[pid] = { ...appState.profiles[pid], ...cloudData.profiles[pid] };
        hasChanges = true;
      }
    }
  });

  ['he', 'she'].forEach(pid => {
    if (cloudData.completedWorkouts?.[pid] && pid === author) {
      if (!appState.completedWorkouts) appState.completedWorkouts = {};
      appState.completedWorkouts[pid] = { ...appState.completedWorkouts[pid], ...cloudData.completedWorkouts[pid] };
      hasChanges = true;
    }
  });

  ['he', 'she'].forEach(pid => {
    if (Array.isArray(cloudData.weightLogs?.[pid]) && pid === author) {
      const cloudLogs = cloudData.weightLogs[pid];
      const localLogs = appState.weightLogs?.[pid] || [];
      const logMap = new Map();
      localLogs.forEach(entry => { if (entry && entry.date) logMap.set(entry.date, entry); });
      cloudLogs.forEach(entry => { if (entry && entry.date) logMap.set(entry.date, entry); });
      if (!appState.weightLogs) appState.weightLogs = {};
      appState.weightLogs[pid] = Array.from(logMap.values());
      hasChanges = true;
    }
  });

  ['he', 'she'].forEach(pid => {
    if (cloudData.appleWatch?.metrics?.[pid] && pid === author) {
      const cM = cloudData.appleWatch.metrics[pid];
      if (!appState.appleWatch) appState.appleWatch = {};
      if (!appState.appleWatch.metrics) appState.appleWatch.metrics = {};
      appState.appleWatch.metrics[pid] = { ...appState.appleWatch.metrics[pid], ...cM };
      hasChanges = true;
    }
  });

  if (cloudData.checkedShoppingItems && typeof cloudData.checkedShoppingItems === 'object') {
    if (!appState.checkedShoppingItems) appState.checkedShoppingItems = {};
    Object.keys(cloudData.checkedShoppingItems).forEach(k => {
      if (cloudData.checkedShoppingItems[k] !== undefined) {
        appState.checkedShoppingItems[k] = cloudData.checkedShoppingItems[k];
        hasChanges = true;
      }
    });
  }

  if (Array.isArray(cloudData.exclusions)) {
    if (!appState.exclusions) appState.exclusions = [];
    cloudData.exclusions.forEach(ex => {
      if (!appState.exclusions.includes(ex)) {
        appState.exclusions.push(ex);
        hasChanges = true;
      }
    });
  }

  if (cloudData.recipesDaysRange) appState.recipesDaysRange = cloudData.recipesDaysRange;
  if (cloudData.shoppingDaysRange) appState.shoppingDaysRange = cloudData.shoppingDaysRange;

  const mCurrent = appState.appleWatch?.metrics?.[author] || {};
  const w = appState.completedWorkouts?.[author] || {};
  const wDoneCount = Object.values(w).filter(val => val && (val === true || val.done)).length;
  const weightLogs = appState.weightLogs?.[author] || [];
  const lastWeight = Array.isArray(weightLogs) && weightLogs.length > 0 
    ? weightLogs[weightLogs.length - 1].weight 
    : 'N/A';

  const logDetails = `📥 Datos de ${authorName} importados: ${mCurrent.steps || 0} pasos, ${mCurrent.moveKcal || 0} kcal, ${mCurrent.exerciseMin || 0} min ejerc., ${wDoneCount} entrenamientos, peso ${lastWeight} kg`;
  addSyncConsoleLog(logDetails, "success");

  if (hasChanges) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    if (appState.appleWatch?.metrics) {
      localStorage.setItem(LAST_REGISTERED_METRICS_KEY, JSON.stringify(appState.appleWatch.metrics));
    }
  }
  return hasChanges;
}

export function copyDiagnosticLogs() {
  const consoleEl = document.getElementById("sync-diagnostic-console");
  const logsText = consoleEl ? consoleEl.textContent : "";
  if (!logsText) {
    showIosToast("⚠️ Consola de logs vacía", "fa-solid fa-triangle-exclamation");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logsText).then(() => {
      showIosToast("📋 ¡Logs copiados al portapapeles!", "fa-solid fa-copy");
    }).catch(() => fallbackCopyText(logsText));
  } else {
    fallbackCopyText(logsText);
  }
}

export function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
    showIosToast("📋 ¡Logs copiados al portapapeles!", "fa-solid fa-copy");
  } catch (err) {}
  document.body.removeChild(textArea);
}

let isPushSyncing = false;
let isPullSyncing = false;

export async function pushToCloud(showToast = false) {
  if (isPushSyncing) {
    if (showToast) {
      addSyncConsoleLog("⏳ Envío a la nube ya en proceso, omitiendo push paralelo", "warn");
    }
    return;
  }
  isPushSyncing = true;

  try {
    const key = getCloudSyncKey();
    const masterPid = getMasterProfileId();
    const authorName = masterPid === 'he' ? 'Carlos' : 'Andrea';
    const p = appState.profiles?.[masterPid] || {};
    const m = appState.appleWatch?.metrics?.[masterPid] || {};
    const w = appState.completedWorkouts?.[masterPid] || {};
    const wDoneCount = Object.values(w).filter(val => val && (val === true || val.done)).length;
    const weightLogs = appState.weightLogs?.[masterPid] || [];
    const lastWeight = Array.isArray(weightLogs) && weightLogs.length > 0 
      ? weightLogs[weightLogs.length - 1].weight 
      : 'N/A';

    addSyncConsoleLog(`📤 Enviando datos de ${authorName} (${masterPid.toUpperCase()}): ${m.steps || 0} pasos, ${m.moveKcal || 0} kcal, ${m.exerciseMin || 0} min ejerc., ${wDoneCount} entrenamientos...`, "info");
    
    const compactPayload = {
      authorProfileId: masterPid,
      masterProfileId: masterPid,
      timestamp: new Date().toISOString(),
      profiles: {
        [masterPid]: {
          targetCalories: p.targetCalories || 2000,
          protein: p.protein,
          carbs: p.carbs,
          fats: p.fats
        },
        dog: appState.profiles?.dog
      },
      completedWorkouts: {
        [masterPid]: appState.completedWorkouts?.[masterPid] || {}
      },
      weightLogs: {
        [masterPid]: (appState.weightLogs?.[masterPid] || []).slice(-5)
      },
      appleWatch: {
        metrics: {
          [masterPid]: {
            steps: m.steps || 0,
            moveKcal: m.moveKcal || 0,
            exerciseMin: m.exerciseMin || 0,
            targetCalories: m.targetCalories || 2000,
            targetMin: m.targetMin || 30,
            stepsGoal: m.stepsGoal || 10000
          }
        }
      }
    };

    const urlSafeData = toUrlSafeB64(compactPayload);
    let pushSuccess = false;

    try {
      const pnChannel = `${key}_${masterPid}`;
      const encodedMsg = encodeURIComponent(JSON.stringify(urlSafeData));
      const pnPubUrl = `https://ps.pubnub.com/publish/demo/demo/0/${pnChannel}/0/${encodedMsg}`;
      addSyncConsoleLog(`📡 GET [PubNub Engine] (${masterPid.toUpperCase()})...`, "info");
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(pnPubUrl, { signal: controller.signal });
      clearTimeout(tId);
      if (res.ok) {
        pushSuccess = true;
        addSyncConsoleLog(`✅ Nube PubNub (${authorName.toUpperCase()} enviada a la nube en 30ms)`, "success");
      } else {
        addSyncConsoleLog(`⚠️ Nube PubNub respuesta: HTTP ${res.status}`, "warn");
      }
    } catch (ePnPush) {
      addSyncConsoleLog(`⚠️ Nube PubNub error: ${ePnPush.name} - ${ePnPush.message}`, "warn");
    }

    try {
      const channelUrl = `https://ntfy.sh/${key}_${masterPid}`;
      if (navigator && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(channelUrl, urlSafeData);
      }
    } catch (eCh) {}

    if (pushSuccess) {
      appState.lastCloudSync = new Date().toISOString();
      updateCloudSyncUI("Conectado a la Nube (Sincronizado)", true);
      addSyncConsoleLog(`✅ Publicado correctamente en la nube como ${authorName.toUpperCase()}`, "success");
      if (showToast) {
        showIosToast("☁️ ¡Datos sincronizados en la nube!", "fa-solid fa-cloud-arrow-up");
      }
    } else {
      addSyncConsoleLog("⚠️ Envío diferido en segundo plano", "warn");
    }
  } catch (e) {
    console.warn("Cloud sync push error:", e);
    addSyncConsoleLog(`❌ Error en ciclo de envío: ${e.name} - ${e.message}`, "error");
  } finally {
    isPushSyncing = false;
  }
}

export async function pullFromCloud(showToast = false) {
  if (isPullSyncing) {
    return;
  }
  isPullSyncing = true;

  try {
    const key = getCloudSyncKey();
    const myMasterPid = getMasterProfileId();
    const partnerPid = myMasterPid === 'he' ? 'she' : 'he';
    const channelNames = Array.from(new Set([
      `${key}_${partnerPid}`,
      `${key}_${myMasterPid}`,
      `fitduo_sync_${partnerPid}`,
      `fitduo_sync_${myMasterPid}`,
      `fitduo_sync_v2_${partnerPid}`,
      `fitduo_sync_v2_${myMasterPid}`
    ]));

    let hasMergedAny = false;
    let pullSuccess = false;

    for (const pnChannel of channelNames) {
      try {
        const pnSubUrl = `https://ps.pubnub.com/v3/history/sub-key/demo/channel/${pnChannel}?count=1`;
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(pnSubUrl, { signal: controller.signal });
        clearTimeout(tId);

        if (res.ok) {
          const rawText = await res.text();
          if (rawText && rawText.trim().length > 10) {
            const data = await cleanAndParseJsonFromCloud(rawText);
            if (data) {
              pullSuccess = true;
              const changed = mergeCloudDataIntoAppState(data);
              if (changed) {
                hasMergedAny = true;
                addSyncConsoleLog(`✅ Nube: Datos de ${target.name.toUpperCase()} procesados (${target.isPartner ? 'Pareja' : 'Atajo en 2º plano'})`, "success");
              }
            }
          }
        }
      } catch (eCh) {}
    }

    if (pullSuccess || hasMergedAny) {
      appState.lastCloudSync = new Date().toISOString();
      updateCloudSyncUI("Conectado a la Nube (Sincronizado)", true);
    }

    if (hasMergedAny) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
      if (window.renderAll) window.renderAll();
      if (showToast) {
        showIosToast(`☁️ ¡Datos actualizados desde la nube!`, "fa-solid fa-cloud-arrow-down");
      }
    } else {
      addSyncConsoleLog("✅ Sincronización completa: Datos actualizados", "info");
    }
  } catch (e) {
    console.warn("Cloud sync pull error:", e);
    addSyncConsoleLog(`❌ Error en ciclo de descarga: ${e.name} - ${e.message}`, "error");
  } finally {
    isPullSyncing = false;
  }
}

export function syncNowWithCloud() {
  triggerHapticTouch();
  addSyncConsoleLog("🔄 Iniciando ciclo de sincronización completo (Push -> Pull)...", "info");
  showIosToast("☁️ Sincronizando datos con la nube...", "fa-solid fa-arrows-rotate");
  pushToCloud(false).then(() => {
    pullFromCloud(true).then(() => {
      if (window.renderAll) window.renderAll();
    });
  });
}

export function saveCustomCloudKeyFromInput() {
  const input = document.getElementById("setting-cloud-key-input");
  if (!input) return;
  const keyVal = input.value.trim();
  if (keyVal.length < 3) {
    showIosToast("⚠️ La clave debe tener al menos 3 caracteres", "fa-solid fa-triangle-exclamation");
    return;
  }
  localStorage.setItem("FITDUO_CLOUD_KEY", keyVal);
  addSyncConsoleLog(`🔑 Clave de Pareja actualizada a: "${keyVal}"`, "info");
  showIosToast(`🔑 Clave guardada: ${keyVal}`, "fa-solid fa-key");
  syncNowWithCloud();
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
    navigator.clipboard.writeText(token).then(() => {
      showIosToast("📋 ¡Código de sincronización copiado!", "fa-solid fa-copy");
      addSyncConsoleLog("📋 Código de emparejamiento copiado al portapapeles", "info");
    }).catch(() => {
      prompt("Copia este código de sincronización para pegarlo en el otro dispositivo:", token);
    });
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
