import { appState, saveState, getMasterProfileId, showIosToast } from '../state.js';

let weightChart = null;

export function renderProgressView() {
  const logs = appState.weightLogs[appState.activeProfileId] || [];
  const labels = logs.map(l => l.date);
  const dataPoints = logs.map(l => l.weight);

  const ctx = document.getElementById("weightChart");
  if (!ctx) return;

  if (weightChart) {
    weightChart.destroy();
  }

  if (typeof Chart === 'undefined') return;

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Evolución de Peso - ${appState.profiles[appState.activeProfileId]?.name || 'Perfil'}`,
        data: dataPoints,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f3f4f6', font: { family: 'Plus Jakarta Sans' } }
        }
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

export function addWeightEntry() {
  const input = document.getElementById("weight-input");
  if (!input) return;
  const val = parseFloat(input.value);
  if (!isNaN(val) && val > 30 && val < 250) {
    const todayStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const targetPid = getMasterProfileId();
    if (!appState.weightLogs[targetPid]) appState.weightLogs[targetPid] = [];
    appState.weightLogs[targetPid].push({
      date: todayStr,
      weight: val
    });
    input.value = "";
    saveState();
    if (window.renderAll) window.renderAll();
    const masterName = targetPid === 'he' ? 'Carlos' : 'Andrea';
    showIosToast(`⚖️ ¡Registro de ${val} kg guardado en Perfil Maestro (${masterName})!`, "fa-solid fa-weight-scale");
  }
}
