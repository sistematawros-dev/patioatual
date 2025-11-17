// assets/js/pessoas.js
(function () {
  let _pessoasMounted = false;
  function authHeader() { return TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {}; }
  const asText = (resp) => resp.text();
  const ddId = 'pessoas-dd';
  let pessoasSug = [];
  let pessoasIndex = -1;
  let ddPessoas = null;
  let currentId = null;
  let linkDoc = null;
  let linkDocHandlerAttached = false;

  async function listarPessoas(container, filtro = {}) {
    container.innerHTML = '<p class="chip">Carregando…</p>';
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '200');
      if (filtro.search) qs.set('search', filtro.search);
      if (filtro.tipo) qs.set('tipo', filtro.tipo); // Motorista/Produtor/etc.
      const res = await fetch(`${API_BASE}/pessoas?` + qs.toString(), { headers: { ...authHeader() } });
      if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items ?? []);
      renderTabela(container, items);
    } catch (e) {
      console.error('Falha ao listar pessoas', e);
      container.innerHTML = '<p class="chip">Erro ao listar pessoas. Verifique se a API possui /pessoas (GET).</p>';
    }
  }

  function renderTabela(container, items) {
    if (!items.length) { container.innerHTML = '<p>Nenhuma pessoa cadastrada.</p>'; return; }
    const head = `
      <div class="table-head">
        <div class="col">Nome</div>
        <div class="col">CPF/CNPJ</div>
        <div class="col">Telefone</div>
        <div class="col">Email</div>
        <div class="col">Tipo</div>
        <div class="col">Validade Doc.</div>
      </div>`;
    const rows = items.map(v => `
      <div class="table-row" data-id="${v.id ?? ''}">
        <div class="col"><strong>${v.nome ?? '-'}</strong></div>
        <div class="col">${v.cpf ?? '-'}</div>
        <div class="col">${v.telefone ?? '-'}</div>
        <div class="col">${v.email ?? '-'}</div>
        <div class="col">${v.tipoPessoa ?? '-'}</div>
        <div class="col">${v.validadeDocumento ? new Date(v.validadeDocumento).toLocaleDateString() : '-'}</div>
      </div>
    `).join('');
    container.innerHTML = head + rows;
  }

  async function salvarPessoa(payload, file) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && fd.append(k, String(v)));
    if (file) fd.append('documento', file);

    const res = await fetch(`${API_BASE}/pessoas`, {
      method: 'POST',
      headers: { ...authHeader() },
      body: fd,
    });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    return res.json().catch(() => ({}));
  }

  async function atualizarPessoa(id, payload, file) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && fd.append(k, String(v)));
    if (file) fd.append('documento', file);
    const res = await fetch(`${API_BASE}/pessoas/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { ...authHeader() },
      body: fd,
    });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    return res.json().catch(() => ({}));
  }

  // monta a tela (aba CPF/CNPJ ou página stand-alone)
  window.mountPessoas = async function () {
    if (_pessoasMounted) return;

    const sec = document.getElementById('tab-cpfcnpj') || document;
    const form = sec.querySelector('#form-pessoa') || document.getElementById('form-pessoa');
    if (!form) return;

    _pessoasMounted = true;

    const inputTipo = sec.querySelector('#veh-tipoPessoa') || document.getElementById('veh-tipoPessoa');
    const inputNome = sec.querySelector('#veh-nome') || document.getElementById('veh-nome');
    const inputCPF = sec.querySelector('#veh-cpf') || document.getElementById('veh-cpf');
    const inputTelefone = sec.querySelector('#veh-telefone') || document.getElementById('veh-telefone');
    const inputEmail = sec.querySelector('#veh-email') || document.getElementById('veh-email');
    const inputValidade = sec.querySelector('#veh-validade') || document.getElementById('veh-validade');
    const inputDoc = sec.querySelector('#veh-doc') || document.getElementById('veh-doc');
    linkDoc = sec.querySelector('#veh-doc-link') || document.getElementById('veh-doc-link');

    const btnLimpar = sec.querySelector('#veh-limpar') || document.getElementById('veh-limpar');
    const tabela = document.getElementById('pessoas-tabela') || sec; // crie um container se quiser
    const inputNomeContainer = inputNome?.parentElement;
    if (!ddPessoas) {
      ddPessoas = document.createElement('div');
      ddPessoas.id = ddId;
      ddPessoas.className = 'usr-dropdown';
      ddPessoas.style.display = 'none';
      if (inputNomeContainer) {
        inputNomeContainer.style.position = 'relative';
        inputNomeContainer.appendChild(ddPessoas);
      } else {
        document.body.appendChild(ddPessoas);
      }
    }

    async function buscarPessoasSugestoes(q) {
      q = (q || '').trim();
      if (!q || q.length < 2) return [];
      const qs = new URLSearchParams();
      qs.set('limit', '12');
      qs.set('search', q);
      const res = await fetch(`${API_BASE}/pessoas?${qs.toString()}`, { headers: { ...authHeader() } });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.items ?? data);
    }

    function renderDropdown(people) {
      if (!ddPessoas) return;
      if (!people.length) {
        ddPessoas.innerHTML = '';
        ddPessoas.style.display = 'none';
        return;
      }
      ddPessoas.innerHTML = people.map((p, i) => `
        <div class="item" data-index="${i}">
          <strong>${p.nome || '-'}</strong>
          <small>${p.cpf || ''} ${p.tipoPessoa ? ' • ' + p.tipoPessoa : ''}</small>
        </div>
      `).join('');
      ddPessoas.style.display = 'block';
      ddPessoas.querySelectorAll('.item').forEach(el => {
        el.addEventListener('mousedown', (ev) => {
          ev.preventDefault();
          const idx = Number(el.getAttribute('data-index'));
          if (!isNaN(idx)) selecionarPessoa(people[idx]);
        });
      });
    }

    function closeDropdown() { if (ddPessoas) ddPessoas.style.display = 'none'; pessoasIndex = -1; }

    function highlight(idx) {
      if (!ddPessoas) return;
      const items = ddPessoas.querySelectorAll('.item');
      items.forEach((el, i) => el.classList.toggle('active', i === idx));
      if (idx >= 0 && idx < items.length) items[idx].scrollIntoView({ block: 'nearest' });
    }

    function selecionarPessoa(p) {
      if (!p) return;
      currentId = p.id || null;
      inputNome.value = p.nome || '';
      inputCPF.value = p.cpf || '';
      inputTelefone.value = p.telefone || '';
      inputEmail.value = p.email || '';
      inputValidade.value = p.validadeDocumento ? String(p.validadeDocumento).substring(0, 10) : '';
      if (inputTipo && p.tipoPessoa) {
        let opt = Array.from(inputTipo.options || []).find(o => o.value === p.tipoPessoa);
        if (!opt) {
          opt = new Option(p.tipoPessoa, p.tipoPessoa);
          inputTipo.add(opt);
        }
        inputTipo.value = p.tipoPessoa;
      }
      if (linkDoc) {
      if (p.documentoUrl) {
        linkDoc.style.display = 'inline-flex';
        linkDoc.dataset.id = p.id || '';
        linkDoc.dataset.url = p.documentoUrl || '';
        linkDoc.removeAttribute('href'); // evitamos GET direto sem Authorization
        linkDoc.textContent = 'Baixar documento';
      } else {
        linkDoc.style.display = 'none';
        linkDoc.removeAttribute('data-id');
        linkDoc.removeAttribute('data-url');
      }
    }
    closeDropdown();
  }

    const buscarDebounce = (fn => {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), 250); };
    })(async (term) => {
      pessoasIndex = -1;
      pessoasSug = await buscarPessoasSugestoes(term);
      renderDropdown(pessoasSug.slice(0, 12));
    });

    if (inputNome) {
      inputNome.addEventListener('input', (e) => {
        const q = (e.target.value || '').trim();
        if (q.length < 2) { pessoasSug = []; renderDropdown([]); return; }
        buscarDebounce(q);
      });
      inputNome.addEventListener('focus', () => { if (pessoasSug.length) ddPessoas.style.display = 'block'; });
      inputNome.addEventListener('blur', () => setTimeout(() => closeDropdown(), 120));
      inputNome.addEventListener('keydown', (e) => {
        if (!ddPessoas || ddPessoas.style.display !== 'block') return;
        const max = pessoasSug.length - 1;
        if (e.key === 'ArrowDown') { e.preventDefault(); pessoasIndex = Math.min(max, pessoasIndex + 1); highlight(pessoasIndex); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); pessoasIndex = Math.max(0, pessoasIndex - 1); highlight(pessoasIndex); }
        else if (e.key === 'Enter' && pessoasIndex >= 0) {
          e.preventDefault();
          selecionarPessoa(pessoasSug[pessoasIndex]);
        } else if (e.key === 'Escape') closeDropdown();
      });
    }

    if (linkDoc && !linkDocHandlerAttached) {
      linkDocHandlerAttached = true;
      linkDoc.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const id = linkDoc.dataset.id;
        const url = linkDoc.dataset.url;
        await baixarDocumentoPessoa(id, url);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        tipoPessoa: (inputTipo.value || '').trim(),   // NOVO
        nome: inputNome.value.trim(),
        cpf: inputCPF.value.trim(),
        telefone: inputTelefone.value.trim(),
        email: inputEmail.value.trim() || null,
        validadeDocumento: inputValidade.value || null,
      };
      try {
        if (currentId) {
          await atualizarPessoa(currentId, payload, inputDoc.files?.[0]);
          alert('Pessoa atualizada com sucesso!');
        } else {
          await salvarPessoa(payload, inputDoc.files?.[0]);
          alert('Pessoa salva com sucesso!');
        }
        form.reset();
        currentId = null;
        await listarPessoas(tabela);
      } catch (err) {
        console.error(err);
        alert('Falha ao salvar/atualizar pessoa. Verifique se a API possui /pessoas (POST/PATCH) e aceita FormData.');
      }
    });

    btnLimpar?.addEventListener('click', () => {
      form.reset();
      currentId = null;
      if (linkDoc) {
        linkDoc.style.display = 'none';
        linkDoc.removeAttribute('href');
        linkDoc.removeAttribute('data-id');
        linkDoc.removeAttribute('data-url');
      }
    });

    await listarPessoas(tabela);
  };

  async function baixarDocumentoPessoa(id, urlRel) {
    if (!id || !urlRel) { alert('Nenhum documento associado.'); return; }
    try {
      const res = await fetch(API_BASE + urlRel, { headers: { ...authHeader() } });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        alert(`Falha no download (${res.status}). ${txt || ''}`);
        return;
      }
      const blob = await res.blob();
      // tenta extrair nome do header
      let filename = 'documento';
      const disp = res.headers.get('content-disposition') || '';
      const m1 = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disp);
      const m2 = /filename="?([^";]+)"?/i.exec(disp);
      const raw = (m1?.[1] || m2?.[1] || '').trim();
      if (raw) {
        try { filename = decodeURIComponent(raw.replace(/(^")|("$)/g, '')); }
        catch { filename = raw; }
      }
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert('Erro inesperado ao baixar o documento.');
    }
  }
})();
