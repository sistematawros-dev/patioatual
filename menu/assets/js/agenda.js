
// ===== Agenda =====
const horas = ['Hora 1', 'Hora 2', 'Hora 3', 'Hora 4', 'Hora 5'];
let agendaBaseDate = new Date();

async function renderAgenda() {
  const agendaGrid = $('#agendaGrid');
  if (!agendaGrid) return;
  const base = new Date(agendaBaseDate);
  agendaGrid.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const day = document.createElement('div'); day.className = 'day';
    day.innerHTML = `<h4>Dia ${fmtDate(iso)}</h4>`;
    horas.forEach(h => {
      const slot = document.createElement('div'); slot.className = 'slot'; slot.dataset.day = iso; slot.dataset.hora = h;
      slot.innerHTML = `<div class="time">${h}</div><div class="dropzone" data-accept="card"></div>`;
      day.appendChild(slot);
    });
    agendaGrid.appendChild(day);
    // load items for day from API
    try {
      const page = await listAgendamentos(`from=${iso}&to=${iso}&limit=200`);
      (page.items || []).forEach(a => {
        const dz = agendaGrid.querySelector(`.slot[data-day="${a.dateKey}"][data-hora="${a.hora}"] .dropzone`);
        if (dz) dz.appendChild(createCard(a));
      });
    } catch (err) {
      console.warn('Falha ao carregar agenda do dia', iso, err);
    }
  }
  enableDnD();
}

document.getElementById('agendaPrev')?.addEventListener('click', () => {
  agendaBaseDate.setDate(agendaBaseDate.getDate() - 4);
  renderAgenda();
});
document.getElementById('agendaNext')?.addEventListener('click', () => {
  agendaBaseDate.setDate(agendaBaseDate.getDate() + 4);
  renderAgenda();
});
document.getElementById('agendaToday')?.addEventListener('click', () => {
  agendaBaseDate = new Date();
  renderAgenda();
});
