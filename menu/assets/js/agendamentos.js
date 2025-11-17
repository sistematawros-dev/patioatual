// ===== Agendamento (criar) =====
const formAgendamento = $('#formAgendamento');
const draftZone = $('#draftZone');
formAgendamento?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    data: $('#data').value, hora: $('#hora').value, tipo: $('#tipoAlgodao').value,
    vendedorNome: $('#vendedor').value, contrato: $('#contrato').value, blocos: $('#blocos').value, quantidade: $('#quantidade').value,
    transportadoraId: $('#transportadora').value, placa: $('#placa').value, capacidade: $('#capacidade').value, eixos: $('#eixos').value, margem: $('#margem').value,
    motoristaId: $('#motorista').value, telefone: $('#telefone').value, status: 'Fila'
  };
  try {
    const rec = await createAgendamento(payload);
    $('#ocLabel').textContent = '#' + rec.id.slice(-6);
    draftZone.appendChild(createCard(rec));
    await renderAgenda(); await renderPatio();
    formAgendamento.reset();
    $('#ruleMsg').style.display = 'none';
  } catch (e) {
    if (String(e.message).includes('Conflito')) { $('#ruleMsg').style.display = 'block'; }
    else alert('Erro ao agendar: ' + e.message);
  }
});
$('#btnNewCard')?.addEventListener('click', () => {
  draftZone.appendChild(createCard({ id: uid(), vendedorNome: '—', placa: '', tipo: '—', quantidade: '', status: 'Rascunho' }));
});

function createCard(a) {
  const el = document.createElement('article');
  el.className = 'card'; el.draggable = true; el.dataset.id = a.id;
  el.innerHTML = `<header><h4>${a.vendedorNome || 'Agendamento'}</h4><span class="chip">${a.tipo || '—'}</span></header>
  <div class="meta"><span class="chip">Placa: ${a.placa || '—'}</span><span class="chip">Qtd: ${a.quantidade || '—'}</span>
  <span class="chip">${a.data ? new Date(a.data).toLocaleDateString() : 'Sem data'}</span><span class="chip">${a.hora || '—'}</span></div>`;
  el.addEventListener('dblclick', () => openDlg(a.id));
  el.addEventListener('dragstart', ev => { ev.dataTransfer.setData('text/plain', a.id); ev.dataTransfer.effectAllowed = 'move'; });
  return el;
}
