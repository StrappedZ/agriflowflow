import { renderForecastCharts, renderAnalyticsCharts } from './chart.js';
import { renderWeatherCard } from './weather.js';

// ═══════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════

function isTextOnly(val) {
  return /^[a-zA-Z0-9\s\-_.,()&'/]+$/.test(val.trim());
}

function isNumberOnly(val) {
  if (val === '' || val === null || val === undefined) return true;
  const n = parseFloat(val);
  return !isNaN(n) && isFinite(n) && n >= 0;
}

function getVal(id) {
  return (document.getElementById(id)?.value ?? '').trim();
}

function setErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = msg ? '#ef4444' : '';
  el.style.boxShadow   = msg ? '0 0 0 2px rgba(239,68,68,0.15)' : '';
  const existing = el.parentElement.querySelector(`.field-err[data-for="${id}"]`);
  if (existing) existing.remove();
  if (msg) {
    const span = document.createElement('span');
    span.className = 'field-err';
    span.dataset.for = id;
    span.style.cssText = 'color:#ef4444;font-size:11px;margin-top:3px;display:block;line-height:1.4;';
    span.textContent = msg;
    el.insertAdjacentElement('afterend', span);
  }
}

function clearErrs(...ids) {
  ids.forEach(id => setErr(id, ''));
}

function clearModalErrs(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.querySelectorAll('.field-err').forEach(e => e.remove());
  modal.querySelectorAll('input, select, textarea').forEach(el => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  });
}

// ── Page navigation ──────────────────────────────────────────────
export function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + name);
  if (!page) { console.warn('Page not found:', name); return; }
  page.classList.add('active');

  if (el) el.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', crops: 'Crops', forecast: 'Forecast',
    weather: 'Weather', alerts: 'Alerts', activity: 'Activity Log',
    harvest: 'Harvest Records', tasks: 'Tasks', fieldmap: 'Field Map',
    analytics: 'Analytics', settings: 'Settings'
  };
  document.getElementById('page-title').textContent = titles[name] || name;

  if (name === 'forecast')  renderForecastCharts();
  if (name === 'analytics') renderAnalyticsCharts();
  if (name === 'weather')   renderWeatherCard('weather-page-container', 'Manila');
}

// ── Modal helpers ────────────────────────────────────────────────
export function openAddCrop() {
  clearModalErrs('add-crop-modal');
  document.getElementById('add-crop-modal').classList.add('open');
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  clearModalErrs(id);
}

// ── Save Add Crop (with validation) ─────────────────────────────
window.saveCrop = async function() {
  const name    = getVal('f-name');
  const field   = getVal('f-field');
  const area    = getVal('f-area');
  const yieldV  = getVal('f-yield');
  const planted = getVal('f-planted');
  const harvest = getVal('f-harvest');
  const notes   = getVal('f-notes');

  clearErrs('f-name', 'f-field', 'f-area', 'f-yield', 'f-planted', 'f-harvest', 'f-notes');
  let valid = true;

  if (!name) {
    setErr('f-name', 'Crop name is required.');
    valid = false;
  } else if (!isTextOnly(name)) {
    setErr('f-name', 'Crop name must contain text only (no special characters like < > { }).');
    valid = false;
  }

  if (field && !isTextOnly(field)) {
    setErr('f-field', 'Field name must contain text only (no special characters like < > { }).');
    valid = false;
  }

  if (area !== '' && !isNumberOnly(area)) {
    setErr('f-area', 'Area must be a positive number (e.g. 2.5).');
    valid = false;
  }

  if (yieldV !== '' && !isNumberOnly(yieldV)) {
    setErr('f-yield', 'Estimated yield must be a positive number (e.g. 3.5).');
    valid = false;
  }

  if (planted && harvest && planted > harvest) {
    setErr('f-harvest', 'Harvest date must be after the planting date.');
    valid = false;
  }

  if (notes && !isTextOnly(notes)) {
    setErr('f-notes', 'Notes must contain text only (no special characters like < > { }).');
    valid = false;
  }

  if (!valid) return;

  // Forward to firebase.js saveCrop handler if it exists separately,
  // otherwise this is where you'd push to Firebase.
  // If your firebase.js exposes saveCropData, call it here:
  if (typeof window._saveCropData === 'function') {
    await window._saveCropData({ name, field, area, yieldV, planted, harvest, notes });
  }
};

// ── Save Edit Crop (with validation) ────────────────────────────
window.saveEditCropValidated = async function() {
  const name    = getVal('e-name');
  const field   = getVal('e-field');
  const area    = getVal('e-area');
  const yieldV  = getVal('e-yield');
  const planted = getVal('e-planted');
  const harvest = getVal('e-harvest');
  const notes   = getVal('e-notes');

  clearErrs('e-name', 'e-field', 'e-area', 'e-yield', 'e-planted', 'e-harvest', 'e-notes');
  let valid = true;

  if (!name) {
    setErr('e-name', 'Crop name is required.');
    valid = false;
  } else if (!isTextOnly(name)) {
    setErr('e-name', 'Crop name must contain text only (no special characters like < > { }).');
    valid = false;
  }

  if (field && !isTextOnly(field)) {
    setErr('e-field', 'Field name must contain text only (no special characters like < > { }).');
    valid = false;
  }

  if (area !== '' && !isNumberOnly(area)) {
    setErr('e-area', 'Area must be a positive number (e.g. 2.5).');
    valid = false;
  }

  if (yieldV !== '' && !isNumberOnly(yieldV)) {
    setErr('e-yield', 'Estimated yield must be a positive number (e.g. 3.5).');
    valid = false;
  }

  if (planted && harvest && planted > harvest) {
    setErr('e-harvest', 'Harvest date must be after the planting date.');
    valid = false;
  }

  if (notes && !isTextOnly(notes)) {
    setErr('e-notes', 'Notes must contain text only (no special characters like < > { }).');
    valid = false;
  }

  if (!valid) return;

  if (typeof window._saveEditCropData === 'function') {
    await window._saveEditCropData({ name, field, area, yieldV, planted, harvest, notes });
  }
};

// ── Dashboard crop list ──────────────────────────────────────────
export function renderCropTable(crops, elId, limit) {
  const el = document.getElementById(elId);
  if (!el) return;
  const list = limit ? crops.slice(0, limit) : crops;
  if (!list.length) {
    el.innerHTML = '<p style="color:var(--text-faint);font-size:13px;padding:12px 0;">No crops found.</p>';
    return;
  }
  el.innerHTML = list.map(c => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
      <div>
        <div style="font-weight:500;font-size:14px;">${c.name}</div>
        <div style="font-size:12px;color:var(--text-faint);">${c.field || '—'} · ${c.type || '—'}</div>
      </div>
      <span class="badge ${c.status}">${c.status}</span>
    </div>
  `).join('');
}

// ── Harvest calendar ─────────────────────────────────────────────
export function renderHarvestCalendar(crops) {
  const el = document.getElementById('harvest-calendar');
  if (!el) return;
  const upcoming = crops.filter(c => c.harvest).sort((a, b) => new Date(a.harvest) - new Date(b.harvest));
  if (!upcoming.length) {
    el.innerHTML = '<p style="color:var(--text-faint);font-size:13px;padding:12px 0;">No upcoming harvests.</p>';
    return;
  }
  el.innerHTML = upcoming.map(c => {
    const days = Math.ceil((new Date(c.harvest) - new Date()) / 86400000);
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
        <div>
          <div style="font-weight:500;font-size:14px;">${c.name}</div>
          <div style="font-size:12px;color:var(--text-faint);">${c.field || '—'} · Est. harvest ${c.harvest}</div>
        </div>
        <span style="font-size:12px;font-weight:600;color:${days <= 7 ? 'var(--red-600)' : days <= 14 ? 'var(--amber-600)' : 'var(--green-600)'};">
          ${days > 0 ? `${days}d away` : 'Today'}
        </span>
      </div>`;
  }).join('');
}

// ── Toast ────────────────────────────────────────────────────────
export function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

window.toggleSidebar = function() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = sidebar.classList.toggle('mobile-open');
  overlay.style.display = isOpen ? 'block' : 'none';
};

// ── Expose globals ───────────────────────────────────────────────
window.showPage    = showPage;
window.openAddCrop = openAddCrop;
window.closeModal  = closeModal;
window.showToast   = showToast;
