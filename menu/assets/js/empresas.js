(function () {
  function authHeader() { return TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {}; }
  const asText = (resp) => resp.text();
  let currentId = null;
  let cidadesCache = [];
  let cidadeItems = [];
  let cidadeIndex = -1;
  let ddCidade = null;
  let empresaItems = [];
  let empresaIndex = -1;
  let ddEmpresa = null;

  const dlId = 'dl-cidades';

  function cidadeLabel(c) {
    const uf = c.uf ? ` - ${c.uf}` : '';
    const code = c.codibge ? ` (${c.codibge})` : '';
    return `${c.cidade}${uf}${code}`;
  }

  async function carregarCidades(datalist, search = '') {
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '50');
      if (search) qs.set('q', search);
      const res = await fetch(`${API_BASE}/cidades/search?${qs.toString()}`, { headers: { ...authHeader() } });
      if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
      const data = await res.json();
      cidadesCache = Array.isArray(data) ? data : [];
      if (datalist) datalist.innerHTML = cidadesCache.map(c => `<option value="${cidadeLabel(c)}"></option>`).join('');
      cidadeItems = cidadesCache.slice(0, 12);
      renderDropdownObjs(ddCidade, cidadeItems, c => `<strong>${c.cidade}</strong> - ${c.uf || ''} ${c.codibge ? `(${c.codibge})` : ''}`, (c) => {
        applyCidadeSelecao(c);
      });
    } catch (err) {
      console.error('Falha ao carregar cidades', err);
    }
  }

  function resolveCidadeSelecionada(nomeCidade, ufInput) {
    const value = nomeCidade.trim().toLowerCase();
    const uf = (ufInput || '').trim().toLowerCase();
    const match = cidadesCache.find(c => {
      const sameNome = c.cidade?.trim().toLowerCase() === value;
      const sameUf = !uf || (c.uf?.trim().toLowerCase() === uf);
      return sameNome && sameUf;
    }) || cidadesCache.find(cidade => cidadeLabel(cidade).toLowerCase() === value);
    return match || null;
  }

  function applyCidadeSelecao(c) {
    const inputCidade = document.getElementById('usr-cidade');
    const inputUf = document.getElementById('usr-uf');
    if (!inputCidade) return;
    inputCidade.value = c.cidade || inputCidade.value;
    inputCidade.dataset.codcidade = String(c.codibge || '');
    if (inputUf) inputUf.value = c.uf || '';
    closeDropdown(ddCidade);
  }

  function renderDropdownObjs(container, items, getLabel, onPick) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }
    container.innerHTML = items.map((v, i) => `<div class="item" data-index="${i}">${getLabel(v)}</div>`).join('');
    container.style.display = 'block';
    container.querySelectorAll('.item').forEach(el => {
      el.addEventListener('mousedown', (ev) => { ev.preventDefault(); onPick(items[Number(el.dataset.index)]); });
    });
  }
  function closeDropdown(c) { if (c) c.style.display = 'none'; }
  function highlight(container, idx) {
    if (!container) return;
    const nodes = container.querySelectorAll('.item');
    nodes.forEach((el, i) => el.classList.toggle('active', i === idx));
    if (idx >= 0 && idx < nodes.length) nodes[idx].scrollIntoView({ block: 'nearest' });
  }

  function debounce(fn, delay = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  async function buscarEmpresasSugestoes(q) {
    q = (q || '').trim();
    if (!q) return [];
    const qs = new URLSearchParams();
    qs.set('limit', '12');
    qs.set('q', q);
    const res = await fetch(`${API_BASE}/empresas/search?${qs.toString()}`, { headers: { ...authHeader() } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items ?? []);
  }

  async function listarEmpresas(container) {
    if (!container) return;
    container.innerHTML = '<p class="chip">Carregando...</p>';
    try {
      const res = await fetch(`${API_BASE}/empresas?limit=200`, { headers: { ...authHeader() } });
      if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items ?? []);
      renderTabela(container, items);
    } catch (e) {
      console.error('Falha ao listar empresas', e);
      container.innerHTML = '<p class="chip">Erro ao listar empresas. Verifique se a API possui /empresas (GET).</p>';
    }
  }

  async function salvarEmpresa(payload) {
    const method = currentId ? 'PUT' : 'POST';
    const url = currentId ? `${API_BASE}/empresas/${encodeURIComponent(currentId)}` : `${API_BASE}/empresas`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    return res.json().catch(() => ({}));
  }

  async function carregarEmpresa(id, formEls) {
    const res = await fetch(`${API_BASE}/empresas/${encodeURIComponent(id)}`, { headers: { ...authHeader() } });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    const e = await res.json();
    currentId = e.id;
    formEls.inputNome.value = e.empresa || '';
    formEls.inputCidade.value = e.cidadeNome || e.cidade?.cidade || '';
    formEls.inputUf.value = e.uf || e.cidade?.uf || '';
    if (e.codibge || e.codcidade) {
      formEls.inputCidade.dataset.codcidade = String(e.codibge || e.codcidade);
    }
    // atualiza UF se veio do autocomplete
    if (formEls.inputUf && !formEls.inputUf.value && e.cidade?.uf) formEls.inputUf.value = e.cidade.uf;
  }

  async function excluirEmpresa(id) {
    const res = await fetch(`${API_BASE}/empresas/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    if (!res.ok && res.status !== 204) throw new Error(`${res.status} ${await asText(res)}`);
  }

  function renderTabela(container, items) {
    if (!container) return;
    if (!items.length) { container.innerHTML = '<p>Nenhuma filial cadastrada.</p>'; return; }
    const head = `
      <div class="table-head">
        <div class="col grow">Filial</div>
        <div class="col grow">Cidade</div>
        <div class="col">UF</div>
        <div class="col">IBGE</div>
        <div class="col" style="width:120px">A\u00e7\u00f5es</div>
      </div>`;
    const rows = items.map(v => `
      <div class="table-row" data-id="${v.id ?? ''}">
        <div class="col grow"><strong>${v.empresa ?? '-'}</strong></div>
        <div class="col grow">${v.cidadeNome ?? v.cidade?.cidade ?? '-'}</div>
        <div class="col">${v.uf ?? v.cidade?.uf ?? '-'}</div>
        <div class="col">${v.codibge ?? v.codcidade ?? '-'}</div>
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
          await carregarEmpresa(id, {
            inputNome: document.getElementById('usr-filial'),
            inputCidade: document.getElementById('usr-cidade'),
            inputUf: document.getElementById('usr-uf'),
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          console.error(err);
          alert('Falha ao carregar filial para edi\u00e7\u00e3o.');
        }
      });
      row.querySelector('[data-act="del"]')?.addEventListener('click', async (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        if (!confirm('Deseja excluir esta filial?')) return;
        try {
          await excluirEmpresa(id);
          if (document.getElementById('empresas-tabela')) await listarEmpresas(container);
          if (currentId === id) {
            currentId = null;
            document.getElementById('form-filial')?.reset();
          }
        } catch (err) {
          console.error(err);
          alert('Falha ao excluir filial.');
        }
      });
      row.addEventListener('click', async () => {
        try {
          await carregarEmpresa(id, {
            inputNome: document.getElementById('usr-filial'),
            inputCidade: document.getElementById('usr-cidade'),
            inputUf: document.getElementById('usr-uf'),
          });
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  function resetForm(form, inputCidade) {
    form.reset();
    currentId = null;
    delete inputCidade.dataset.codcidade;
    empresaItems = [];
    empresaIndex = -1;
    cidadeItems = [];
    cidadeIndex = -1;
    closeDropdown(ddEmpresa);
    closeDropdown(ddCidade);
  }

  function applyEmpresaSelecao(e, formEls) {
    if (!e) return;
    currentId = e.id || null;
    if (formEls.inputNome) formEls.inputNome.value = e.empresa || '';
    if (formEls.inputCidade) {
      formEls.inputCidade.value = e.cidadeNome || e.cidade?.cidade || '';
      formEls.inputCidade.dataset.codcidade = String(e.codibge || e.codcidade || e.cidade?.codibge || '');
    }
    if (formEls.inputUf) formEls.inputUf.value = e.uf || e.cidade?.uf || '';
    closeDropdown(ddEmpresa);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('form-filial');
    if (!form) return;
    const inputNome = form.querySelector('#usr-filial');
    const inputCidade = form.querySelector('#usr-cidade');
    const inputUf = form.querySelector('#usr-uf');
    const btnLimpar = form.querySelector('button[type="button"]');

    // dropdown custom (mesmo estilo de veiculos)
    ddEmpresa = document.createElement('div');
    ddEmpresa.id = 'empresa-dd';
    ddEmpresa.className = 'usr-dropdown';
    ddEmpresa.style.display = 'none';
    if (inputNome?.parentElement) {
      inputNome.parentElement.style.position = 'relative';
      inputNome.parentElement.appendChild(ddEmpresa);
    } else {
      document.body.appendChild(ddEmpresa);
    }

    ddCidade = document.createElement('div');
    ddCidade.id = 'cidade-dd';
    ddCidade.className = 'usr-dropdown';
    ddCidade.style.display = 'none';
    if (inputCidade?.parentElement) {
      inputCidade.parentElement.style.position = 'relative';
      inputCidade.parentElement.appendChild(ddCidade);
    } else {
      document.body.appendChild(ddCidade);
    }

    const tabela = document.getElementById('empresas-tabela'); // opcional: só lista se existir

    if (inputCidade) {
      inputCidade.addEventListener('input', () => {
        delete inputCidade.dataset.codcidade;
        if (inputCidade.value.length >= 2) {
          carregarCidades(null, inputCidade.value);
        } else {
          cidadeItems = [];
          renderDropdownObjs(ddCidade, cidadeItems, () => '', () => { });
        }
      });
      inputCidade.addEventListener('focus', () => { if (cidadeItems.length) ddCidade.style.display = 'block'; });
      inputCidade.addEventListener('blur', () => setTimeout(() => closeDropdown(ddCidade), 120));
      inputCidade.addEventListener('keydown', (e) => {
        if (ddCidade.style.display !== 'block') return;
        const max = cidadeItems.length - 1;
        if (e.key === 'ArrowDown') { e.preventDefault(); cidadeIndex = Math.min(max, cidadeIndex + 1); highlight(ddCidade, cidadeIndex); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); cidadeIndex = Math.max(0, cidadeIndex - 1); highlight(ddCidade, cidadeIndex); }
        else if (e.key === 'Enter' && cidadeIndex >= 0) {
          e.preventDefault();
          applyCidadeSelecao(cidadeItems[cidadeIndex]);
        } else if (e.key === 'Escape') closeDropdown(ddCidade);
      });
      inputCidade.addEventListener('change', () => {
        const match = resolveCidadeSelecionada(inputCidade.value, inputUf?.value || '');
        if (match) applyCidadeSelecao(match);
      });
    }
    if (inputNome) {
      const buscarEmpresas = debounce(async (q) => {
        empresaIndex = -1;
        empresaItems = await buscarEmpresasSugestoes(q);
        renderDropdownObjs(ddEmpresa, empresaItems, (e) => `<strong>${e.empresa}</strong> - ${e.cidade?.cidade || e.cidadeNome || ''} ${e.uf || e.cidade?.uf || ''}`, (e) => {
          applyEmpresaSelecao(e, { inputNome, inputCidade, inputUf });
        });
      }, 250);

      inputNome.addEventListener('input', (e) => {
        const q = (e.target.value || '').trim();
        if (!q) { empresaItems = []; renderDropdownObjs(ddEmpresa, empresaItems, () => '', () => { }); return; }
        buscarEmpresas(q);
      });
      inputNome.addEventListener('focus', () => { if (empresaItems.length) ddEmpresa.style.display = 'block'; });
      inputNome.addEventListener('blur', () => setTimeout(() => closeDropdown(ddEmpresa), 120));
      inputNome.addEventListener('keydown', (e) => {
        if (ddEmpresa.style.display !== 'block') return;
        const max = empresaItems.length - 1;
        if (e.key === 'ArrowDown') { e.preventDefault(); empresaIndex = Math.min(max, empresaIndex + 1); highlight(ddEmpresa, empresaIndex); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); empresaIndex = Math.max(0, empresaIndex - 1); highlight(ddEmpresa, empresaIndex); }
        else if (e.key === 'Enter' && empresaIndex >= 0) {
          e.preventDefault();
          applyEmpresaSelecao(empresaItems[empresaIndex], { inputNome, inputCidade, inputUf });
        } else if (e.key === 'Escape') closeDropdown(ddEmpresa);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = inputNome?.value.trim();
      const cidadeNome = inputCidade?.value || '';
      const uf = inputUf?.value || '';
      const codcidade = Number(inputCidade?.dataset.codcidade || NaN);
      const fallbackMatch = resolveCidadeSelecionada(cidadeNome, uf);
      const codigoFinal = Number.isFinite(codcidade) ? codcidade : (fallbackMatch?.codibge ?? null);

      if (!nome) { alert('Informe o nome da filial'); return; }
      if (!codigoFinal) { alert('Selecione uma cidade v\u00e1lida da lista'); return; }

      try {
        await salvarEmpresa({ empresa: nome, codcidade: codigoFinal });
        alert(currentId ? 'Filial atualizada com sucesso' : 'Filial criada com sucesso');
        resetForm(form, inputCidade);
        await listarEmpresas(tabela);
      } catch (err) {
        console.error(err);
        alert('Falha ao salvar filial. Verifique se a API possui /empresas (POST/PUT).');
      }
    });

    btnLimpar?.addEventListener('click', () => resetForm(form, inputCidade));

    await carregarCidades(null);
    if (tabela) await listarEmpresas(tabela);
  });
})();
