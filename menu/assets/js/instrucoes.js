// assets/js/instrucoes.js
(function () {
  const asText = (resp) => resp.text();
  const authHeader = () => (TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {});
  let currentId = null;

  function formDataFromPayload(payload, file) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      fd.append(k, String(v));
    });
    if (file) fd.append('documento', file);
    return fd;
  }

  async function listarInstrucoes(container) {
    if (!container) return;
    container.innerHTML = '<p class="chip">Carregando...</p>';
    try {
      const res = await fetch(`${API_BASE}/instrucoes?page=1&limit=200&sort=updatedAt&order=desc`, {
        headers: { ...authHeader() }
      });
      if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items ?? []);
      renderTabela(container, items);
    } catch (err) {
      console.error(err);
      container.innerHTML = '<p class="chip">Erro ao listar instruções. Verifique se a API possui /instrucoes (GET).</p>';
    }
  }

  async function salvarOuAtualizar(payload, file) {
    const method = currentId ? 'PUT' : 'POST';
    const url = currentId ? `${API_BASE}/instrucoes/${encodeURIComponent(currentId)}` : `${API_BASE}/instrucoes`;
    const res = await fetch(url, {
      method,
      headers: { ...authHeader() },
      body: formDataFromPayload(payload, file)
    });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    return res.json().catch(() => ({}));
  }

  async function carregarInstrucao(id, formEls) {
    const res = await fetch(`${API_BASE}/instrucoes/${encodeURIComponent(id)}`, { headers: { ...authHeader() } });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    const inst = await res.json();
    currentId = inst.id || null;
    formEls.tipo.value = inst.tipo || '';
    formEls.unidade.value = inst.unidade || '';
    formEls.quantidade.value = inst.quantidade ?? '';
    formEls.transportadora.value = inst.transportadora || '';
    formEls.contrato.value = formEls.contrato ? (inst.contrato || '') : '';
    formEls.blocos.value = formEls.blocos ? (inst.blocos || '') : '';
    formEls.comprador.value = formEls.comprador ? (inst.comprador || '') : '';
    formEls.validade.value = inst.validadeDocumento ? String(inst.validadeDocumento).substring(0, 10) : '';
    if (formEls.linkDoc) {
      if (inst.documentoUrl) {
        formEls.linkDoc.style.display = 'inline-flex';
        formEls.linkDoc.dataset.id = inst.id;
        formEls.linkDoc.dataset.url = inst.documentoUrl;
        formEls.linkDoc.textContent = 'Baixar documento';
      } else {
        formEls.linkDoc.style.display = 'none';
        formEls.linkDoc.removeAttribute('data-id');
        formEls.linkDoc.removeAttribute('data-url');
      }
    }
  }

  async function excluirInstrucao(id) {
    const res = await fetch(`${API_BASE}/instrucoes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { ...authHeader() }
    });
    if (!res.ok && res.status !== 204) throw new Error(`${res.status} ${await asText(res)}`);
  }

  function renderTabela(container, items) {
    if (!container) return;
    if (!items.length) { container.innerHTML = '<p>Nenhuma instrução cadastrada.</p>'; return; }
    const head = `
      <div class="table-head">
        <div class="col grow">Tipo</div>
        <div class="col">Unidade</div>
        <div class="col">Quantidade</div>
        <div class="col">Transportadora</div>
        <div class="col">Validade</div>
        <div class="col" style="width:120px">Ações</div>
      </div>`;
    const rows = items.map(v => `
      <div class="table-row" data-id="${v.id ?? ''}">
        <div class="col grow"><strong>${v.tipo ?? '-'}</strong></div>
        <div class="col">${v.unidade ?? '-'}</div>
        <div class="col">${v.quantidade ?? '-'}</div>
        <div class="col">${v.transportadora ?? '-'}</div>
        <div class="col">${v.validadeDocumento ? new Date(v.validadeDocumento).toLocaleDateString() : '-'}</div>
        <div class="col">
          <button class="btn sm" data-act="edit">Editar</button>
          <button class="btn sm danger" data-act="del">Excluir</button>
        </div>
      </div>
    `).join('');
    container.innerHTML = head + rows;

    container.querySelectorAll('.table-row').forEach(row => {
      const id = row.getAttribute('data-id');
      row.querySelector('[data-act="edit"]')?.addEventListener('click', async (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        try {
          await carregarInstrucao(id, getFormElements());
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          console.error(err);
          alert('Falha ao carregar instrução.');
        }
      });
      row.querySelector('[data-act="del"]')?.addEventListener('click', async (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        if (!confirm('Deseja excluir esta instrução?')) return;
        try {
          await excluirInstrucao(id);
          if (container) await listarInstrucoes(container);
          if (currentId === id) resetForm();
        } catch (err) {
          console.error(err);
          alert('Falha ao excluir instrução.');
        }
      });
      row.addEventListener('click', async () => {
        try { await carregarInstrucao(id, getFormElements()); } catch (err) { console.error(err); }
      });
    });
  }

  function getFormElements() {
    const tipo = document.getElementById('tipoAlgodao');
    const unidade = document.getElementById('unidade');
    const quantidade = document.getElementById('quantidade');
    const transportadora = document.getElementById('transportadora');
    const contrato = document.getElementById('contrato');
    const blocos = document.getElementById('blocos');
    const comprador = document.getElementById('comprador');
    const validade = document.getElementById('instrucao-validade');
    const doc = document.getElementById('instrucao-doc');
    const linkDoc = document.getElementById('instrucao-doc-link');
    const tabela = document.getElementById('instrucoes-tabela');
    return { tipo, unidade, quantidade, transportadora, contrato, blocos, comprador, validade, doc, linkDoc, tabela };
  }

  async function baixarDocumento(id, urlRel) {
    if (!id || !urlRel) { alert('Nenhum documento associado.'); return; }
    try {
      const res = await fetch(API_BASE + urlRel, { headers: { ...authHeader() } });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        alert(`Falha no download (${res.status}). ${txt || ''}`);
        return;
      }
      const blob = await res.blob();
      let filename = 'documento';
      const disp = res.headers.get('content-disposition') || '';
      const m1 = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disp);
      const m2 = /filename="?([^";]+)"?/i.exec(disp);
      const raw = (m1?.[1] || m2?.[1] || '').trim();
      if (raw) { try { filename = decodeURIComponent(raw.replace(/(^")|("$)/g, '')); } catch { filename = raw; } }
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = blobUrl; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert('Erro inesperado ao baixar o documento.');
    }
  }

  function resetForm() {
    const { tipo, unidade, quantidade, transportadora, contrato, blocos, comprador, validade, doc, linkDoc } = getFormElements();
    [tipo, unidade, quantidade, transportadora, contrato, blocos, comprador, validade].forEach(el => { if (el) el.value = ''; });
    if (doc) doc.value = '';
    if (linkDoc) {
      linkDoc.style.display = 'none';
      linkDoc.removeAttribute('data-id');
      linkDoc.removeAttribute('data-url');
    }
    currentId = null;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formInstrucoes');
    if (!form) return;
    const els = getFormElements();

    // tabela opcional
    let tabela = document.getElementById('instrucoes-tabela');
    if (!tabela) {
      tabela = document.createElement('div');
      tabela.id = 'instrucoes-tabela';
      tabela.className = 'table';
      form.insertAdjacentElement('afterend', tabela);
      els.tabela = tabela;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload: any = {
        tipo: els.tipo?.value || '',
        unidade: els.unidade?.value || undefined,
        quantidade: els.quantidade?.value ? Number(els.quantidade.value) : undefined,
        transportadora: els.transportadora?.value || undefined,
        observacoes: undefined,
        validadeDocumento: els.validade?.value || undefined,
      };
      if (!payload.tipo) { alert('Informe o tipo'); return; }
      try {
        await salvarOuAtualizar(payload, els.doc?.files?.[0]);
        alert(currentId ? 'Instrução atualizada' : 'Instrução salva');
        resetForm();
        await listarInstrucoes(tabela);
      } catch (err) {
        console.error(err);
        alert('Falha ao salvar/atualizar instrução. Verifique se a API possui /instrucoes (POST/PUT) e aceita FormData.');
      }
    });

    document.getElementById('veh-limpar')?.addEventListener('click', () => resetForm());

    els.linkDoc?.addEventListener('click', async (ev) => {
      ev.preventDefault();
      const id = els.linkDoc?.dataset.id;
      const url = els.linkDoc?.dataset.url;
      await baixarDocumento(id, url);
    });

    await listarInstrucoes(tabela);
  });
})();
