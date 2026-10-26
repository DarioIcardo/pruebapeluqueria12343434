import { getAppointments } from './lib/supabaseService.js';

// Helper to format a Date (or ISO string) as YYYY‑MM‑DD for Supabase filter
function formatDate(date) {
  const d = new Date(date);
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

/** Load appointments in read‑only mode */
async function loadAppointments(selectedDate = null) {
  const businessSlug = window.__ENV__.BUSINESS_SLUG; // "arxemil-lugo"
  const filters = {};
  if (selectedDate) {
    filters.date = formatDate(selectedDate);
  }

  const { data: appointments, error } = await getAppointments(businessSlug, filters);
  const tbody = document.getElementById('appointments-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (error) {
    console.error('Error loading appointments:', error);
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.className = 'px-4 py-2 text-center text-on-surface-variant';
    td.textContent = 'Error al cargar citas';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  appointments.forEach(app => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-surface-container-highest';
    const cells = [
      app.starts_at ? new Date(app.starts_at).toLocaleDateString('es-ES') : '-',
      app.starts_at ? new Date(app.starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-',
      app.customer_name || '-',
      app.worker?.name || '-',
      app.service?.name || '-',
      app.status || '-'
    ];
    cells.forEach(text => {
      const td = document.createElement('td');
      td.className = 'px-4 py-2 text-left font-body-sm text-on-surface';
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

/** Simple tab switcher – keeps only the agenda visible initially */
function switchTab(tabId) {
  const tabs = ['agenda', 'servicios', 'equipo', 'config'];
  tabs.forEach(t => {
    const content = document.getElementById('content-' + t);
    const btn = document.getElementById('tab-btn-' + t);
    if (content) {
      if (t === tabId) {
        content.classList.remove('hidden');
        content.classList.add('flex');
      } else {
        content.classList.add('hidden');
        content.classList.remove('flex');
      }
    }
    if (btn) {
      if (t === tabId) {
        btn.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold');
        btn.classList.remove('text-on-surface-variant', 'font-semibold');
      } else {
        btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold');
        btn.classList.add('text-on-surface-variant', 'font-semibold');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialise agenda (default to today)
  const dateInput = document.getElementById('agenda-date-filter');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    loadAppointments(today);
    dateInput.addEventListener('change', e => loadAppointments(e.target.value));
  }

  // Show agenda tab by default
  switchTab('agenda');
});
