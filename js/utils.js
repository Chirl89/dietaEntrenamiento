/**
 * FitDuo & Collie Coach - Shared Utilities (v0.9.6)
 */

export function parseSmartMetricValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return null;
    if (val > 50000) return Math.round(val / 4184);
    return Math.round(val);
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    const validNums = val.map(v => parseSmartMetricValue(v)).filter(v => v !== null && v >= 0);
    if (validNums.length === 0) return null;
    return validNums[validNums.length - 1];
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '0') return 0;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return null;
    
    const clean = trimmed.replace(/,/g, '.');
    const floatVal = parseFloat(clean);
    if (!isNaN(floatVal) && isFinite(floatVal)) {
      if (floatVal > 50000) {
        return Math.round(floatVal / 4184);
      }
      return Math.round(floatVal);
    }

    const match = clean.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && isFinite(parsed)) {
        if (parsed > 50000) return Math.round(parsed / 4184);
        return Math.round(parsed);
      }
    }
    return null;
  }
  return null;
}

export function parseSmartMetricFloatValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return null;
    if (val > 100) return parseFloat((val / 1000).toFixed(2));
    return parseFloat(val.toFixed(2));
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '0' || trimmed === '0.0' || trimmed === '0.00') return 0;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return null;
    const clean = trimmed.replace(/,/g, '.');
    const floatVal = parseFloat(clean);
    if (!isNaN(floatVal) && isFinite(floatVal)) {
      if (floatVal > 100) {
        return parseFloat((floatVal / 1000).toFixed(2));
      }
      return parseFloat(floatVal.toFixed(2));
    }
    const match = clean.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && isFinite(parsed)) {
        if (parsed > 100) return parseFloat((parsed / 1000).toFixed(2));
        return parseFloat(parsed.toFixed(2));
      }
    }
    return null;
  }
  return null;
}

export function parseSmartMetricArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => parseInt(v)).filter(v => !isNaN(v));
  if (typeof val === 'string') {
    return val.split(',').map(s => parseInt(s.trim())).filter(v => !isNaN(v));
  }
  const p = parseInt(val);
  return isNaN(p) ? [] : [p];
}

export function formatSmartSleepValue(val) {
  if (val === null || val === undefined || val === '') return '--';
  if (typeof val === 'string') {
    const s = val.trim();
    if (s.startsWith('[') && s.endsWith(']')) return '--';
    if (s === '0' || s === '0.0' || s === '0.00' || s === '0h' || s === '0m' || s === '0h 0m' || s === '0:00' || s === '-' || s === '--' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'nan') {
      return '--';
    }
    if (s.toLowerCase().includes('h') || s.toLowerCase().includes('m') || s.includes(':')) {
      return s;
    }
    const num = parseFloat(s.replace(',', '.'));
    if (!isNaN(num)) val = num;
    else return s;
  }
  if (typeof val === 'number') {
    if (val <= 0 || isNaN(val) || !isFinite(val)) return '--';
    if (val < 24) {
      const hrs = Math.floor(val);
      const mins = Math.round((val - hrs) * 60);
      if (hrs === 0 && mins === 0) return '--';
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    } else {
      const hrs = Math.floor(val / 60);
      const mins = Math.round(val % 60);
      if (hrs === 0 && mins === 0) return '--';
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
  }
  return String(val);
}

export function formatSyncRelativeTime(lastSyncDate) {
  if (!lastSyncDate) return "Sincronizado hace 0 segundos";
  const now = new Date();
  const past = new Date(lastSyncDate);
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) {
    return `Sincronizado hace ${diffSec} segundos`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `Sincronizado hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `Sincronizado hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Sincronizado hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
}

export function toUrlSafeB64(jsonObj) {
  try {
    const str = JSON.stringify(jsonObj);
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return "";
  }
}

export function fromUrlSafeB64(b64Str) {
  try {
    if (!b64Str || typeof b64Str !== 'string') return null;
    let base64 = b64Str.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {}
  return null;
}
