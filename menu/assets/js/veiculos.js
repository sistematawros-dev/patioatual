// assets/js/veiculos.js
(function () {
  function authHeader() { return TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {}; }
  const asText = (resp) => resp.text();
  let currentId = null; // estado de ediÃ§Ã£o

  async function listarVeiculos(container) {
    container.innerHTML = '<p class="chip">Carregandoâ€¦</p>';
    try {
      const res = await fetch(`${API_BASE}/veiculos?limit=200`, { headers: { ...authHeader() } });
      if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items ?? []);
      renderTabela(container, items);
    } catch (e) {
      console.error('Falha ao listar veÃ­culos', e);
      container.innerHTML = '<p class="chip">Erro ao listar veÃ­culos. Verifique se a API possui /veiculos (GET).</p>';
    }
  }

  function renderTabela(container, items) {
    if (!items.length) { container.innerHTML = '<p>Nenhum veÃ­culo cadastrado.</p>'; return; }
    const head = `
  <div class="table-head">
    <div class="col">Placa</div>
    <div class="col grow">Marca / Modelo</div>
    <div class="col">Tipo</div>
    <div class="col">Cap. (t)</div>
    <div class="col">Eixos</div>
    <div class="col">Transportadora</div>
    <div class="col">Validade Doc.</div>
    <div class="col">Doc.</div>
    <div class="col" style="width:72px">AÃ§Ãµes</div>
  </div>`;

    const rows = items.map(v => `
  <div class="table-row" data-id="${v.id ?? ''}">
    <div class="col"><strong>${v.placa ?? '-'}</strong></div>
    <div class="col grow">${v.marca ?? '-'} / ${v.modelo ?? '-'}</div>
    <div class="col">${v.tipo ?? '-'}</div>
    <div class="col">${v.capacidade ?? '-'}</div>
    <div class="col">${v.eixos ?? '-'}</div>
    <div class="col">${v.transportadoraNome ?? v.transportadoraId ?? '-'}</div>
    <div class="col">${v.validadeDocumento ? new Date(v.validadeDocumento).toLocaleDateString() : '-'}</div>
    <div class="col">
        ${v.documentoUrl
        ? `<button class="btn sm" data-act="download" data-id="${v.id}">Baixar</button>`
        : '-'}
      </div>
    <div class="col">
      <button class="btn sm" data-act="edit">Editar</button>
      <button class="btn sm danger" data-act="del">ðŸ—‘ï¸</button>
    </div>
  </div>
`).join('');

    container.innerHTML = head + rows;

    // Listeners por linha (edit, delete, download)
    container.querySelectorAll('.table-row').forEach(row => {
      const id = row.getAttribute('data-id');
      row.querySelector('[data-act="edit"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        carregarParaEdicao(id);
      });
      row.querySelector('[data-act="del"]')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!id) return;
        if (!confirm('Tem certeza que deseja excluir este veÃ­culo?')) return;
        try {
          await excluirVeiculo(id);
          await listarVeiculos(container);
          if (currentId === id) limparFormulario();
          alert('VeÃ­culo excluÃ­do.');
        } catch (err) {
          console.error(err);
          alert('Falha ao excluir veÃ­culo. Verifique se a API possui /veiculos/:id (DELETE).');
        }
      });

      // ðŸ‘‡ NOVO: clique no botÃ£o "Baixar" (usa fetch com Authorization)
      row.querySelector('[data-act="download"]')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
          await baixarDocumentoPorId(id);
          // defina essa funÃ§Ã£o no mesmo arquivo (como te mostrei antes)
        } catch (err) {
          console.error(err);
          alert('Erro inesperado ao baixar o documento.');
        }
      });
      // clique em qualquer lugar da linha tambÃ©m carrega para ediÃ§Ã£o
      row.addEventListener('click', () => carregarParaEdicao(id));
    });
  }

  function formDataFromPayload(payload, file) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && fd.append(k, String(v)));
    if (file) fd.append('documento', file);
    return fd;
  }

  async function salvarVeiculo(payload, file) {
    const res = await fetch(`${API_BASE}/veiculos`, { method: 'POST', headers: { ...authHeader() }, body: formDataFromPayload(payload, file) });
    if (!res.ok) {
      let j; try { j = await res.json(); } catch { }
      const e = new Error(`HTTP ${res.status}`);
      e.responseJson = j;
      throw e;
    }
    return res.json().catch(() => ({}));
  }


  async function atualizarVeiculo(id, payload, file) {
    const res = await fetch(`${API_BASE}/veiculos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { ...authHeader() },
      body: formDataFromPayload(payload, file),
    });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    return res.json().catch(() => ({}));
  }

  async function excluirVeiculo(id) {
    const res = await fetch(`${API_BASE}/veiculos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    return true;
  }

  async function obterVeiculo(id) {
    const res = await fetch(`${API_BASE}/veiculos/${encodeURIComponent(id)}`, {
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error(`${res.status} ${await asText(res)}`);
    return res.json();
  }






  // monta a tela (idempotente)
  window.mountVeiculos = async function () {
    const sec = document.getElementById('tab-veiculos');
    if (sec && sec.dataset.mounted === '1') return;
    if (sec) sec.dataset.mounted = '1';

    const form = document.getElementById('form-veiculo');
    if (!form) return;
    // AQUI: marque o form como jÃ¡ â€œbindadoâ€ para nÃ£o adicionar o listener 2x
    if (form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    const inputMarca = document.getElementById('veh-marca');
    const inputModelo = document.getElementById('veh-modelo');
    const inputPlaca = document.getElementById('veh-placa');
    const inputTipo = document.getElementById('vi-tipo');
    const inputCap = document.getElementById('veh-capacidade');
    const inputEixos = document.getElementById('veh-eixos');
    const inputDoc = document.getElementById('veh-doc');
    const inputValidade = document.getElementById('veh-validade');
    const inputTransp = document.getElementById('vl-transportadora');
    const inputTranspId = document.getElementById('vl-transportadora-id');



    const btnLimpar = document.getElementById('vei-limpar');
    const btnBaixar = document.getElementById('veh-doc-link'); // opcional, se existir
    const tabela = document.getElementById('veiculos-tabela');       // precisa existir no HTML
    const btnExcluir = document.getElementById('vei-excluir');


    const ddTransp = document.getElementById('trp-dd');
    const ddModelo = document.getElementById('vl-dd'); // dropdown MODELO (jÃ¡ existe no HTML)
    const ddPlaca = document.getElementById('pl-dd'); // dropdown PLACA  (adicionamos no HTML)


    const linkDoc = document.getElementById('veh-doc-link');

    function resetModeloDD() {
      _modeloItems = [];
      _mIndex = -1;
      if (ddModelo) { ddModelo.innerHTML = ''; ddModelo.style.display = 'none'; }
    }

    function resetPlacaDD() {
      _placaItems = [];
      _pIndex = -1;
      if (ddPlaca) { ddPlaca.innerHTML = ''; ddPlaca.style.display = 'none'; }
    }

    function resetTransportadoraDD() {
      _trpItems = [];
      _tIndex = -1;
      if (ddTransp) { ddTransp.innerHTML = ''; ddTransp.style.display = 'none'; }
    }




    // util
    // util
    const debounce = (fn, t = 250) => { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), t); }; };
    function fmtDoc(doc) { const d = (doc || '').replace(/\D/g, ''); if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); return doc || ''; }


    function limparFormulario() {
      currentId = null;
      if (btnExcluir) btnExcluir.style.display = 'none';
      if (btnBaixar) btnBaixar.style.display = 'none';

      form.reset();
      inputTranspId.value = '';
      // limpar campos de busca (caso o form.reset nÃ£o zere por autocomplete)
      inputModelo.value = '';
      inputPlaca.value = '';

      // esconder/limpar link e arquivo
      if (inputDoc) inputDoc.value = '';
      if (linkDoc) {
        linkDoc.style.display = 'none';
        linkDoc.removeAttribute('data-id');
        linkDoc.removeAttribute('data-url');
      }

      // FECHAR + RESETAR as listas de opÃ§Ãµes
      resetModeloDD();
      resetPlacaDD();
      resetTransportadoraDD();
      _trpItems = []; _tIndex = -1;
      if (ddTransp) {
        ddTransp.innerHTML = '';
        ddTransp.style.display = 'none';
        closeDropdown(ddTransp); 
      }

    }


    function renderDropdownObjs(container, items, getLabel, onPick) {
      if (!container) return;
      if (!items.length) { container.innerHTML = ''; container.style.display = 'none'; return; }
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


    // --- BUSCA (API) ---
    async function buscarVeiculosSugestoes(q) {
      q = (q || '').trim();
      if (!q) return [];
      const res = await fetch(`${API_BASE}/veiculos?limit=12&search=${encodeURIComponent(q)}`, { headers: { ...authHeader() } });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.items ?? []);
    }


    // --- BUSCA (API modelo) ---
    async function buscarVeiculosSugestoesModelo(q) {
      q = (q || '').trim();
      if (!q) return [];
      const res = await fetch(`${API_BASE}/veiculos/modelo?limit=12&search=${encodeURIComponent(q)}`, { headers: { ...authHeader() } });
      if (!res.ok) return [];
      const data = await res.json();

      return Array.isArray(data) ? data : (data.items ?? []);
    }


    // --- BUSCA (API modelo) ---
    async function buscarVeiculosSugestoesPlaca(q) {
      q = (q || '').trim();
      if (!q) return [];
      const res = await fetch(`${API_BASE}/veiculos/placa?limit=12&search=${encodeURIComponent(q)}`, { headers: { ...authHeader() } });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.items ?? []);
    }



    // --- DROPDOWN (renderer genÃ©rico) ---
    function renderDropdownObjs(container, items, getLabel, onPick) {
      if (!container) return;
      if (!items.length) { container.innerHTML = ''; container.style.display = 'none'; return; }
      container.innerHTML = items.map((v, i) => `<div class="item" data-index="${i}">${getLabel(v)}</div>`).join('');
      container.style.display = 'block';
      container.querySelectorAll('.item').forEach(el => {
        el.addEventListener('mousedown', (ev) => { ev.preventDefault(); onPick(items[Number(el.dataset.index)]); });
      });
    }
    function closeDropdown(c) { if (c) c.style.display = 'none'; }


    async function carregarParaEdicao(id) {
      if (!id) return;
      try {
        const v = await obterVeiculo(id);
        currentId = id;

        inputMarca.value = v.marca ?? '';
        inputModelo.value = v.modelo ?? '';
        inputPlaca.value = (v.placa ?? '').toUpperCase();
        inputTipo.value = v.tipo ?? '';
        inputCap.value = v.capacidade ?? '';
        inputEixos.value = v.eixos ?? '';
        inputValidade.value = v.validadeDocumento ? String(v.validadeDocumento).substring(0, 10) : '';
        inputTransp.value = v.transportadoraNome ?? v.transportadoraId ?? '';

        // >>> Link de download do documento
        if (linkDoc) {
          if (v.documentoUrl) {
            // guarde id e url no elemento
            linkDoc.dataset.id = v.id;
            linkDoc.dataset.url = v.documentoUrl;
            linkDoc.textContent = 'Baixar documento';
            linkDoc.style.display = 'inline';
            linkDoc.removeAttribute('href');

          } else {
            linkDoc.style.display = 'none';
            linkDoc.removeAttribute('data-id');
            linkDoc.removeAttribute('data-url');
          }
        }

        if (btnExcluir) btnExcluir.style.display = 'inline-flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error(err);
        alert('Falha ao carregar veÃ­culo para ediÃ§Ã£o. Verifique se a API possui /veiculos/:id (GET).');
      }
    }

    async function baixarDocumentoPorId(id) {
      const url = `${API_BASE}/veiculos/${encodeURIComponent(id)}/documento`;
      const res = await fetch(url, { headers: { ...authHeader() } });
      if (!res.ok) { throw new Error(`Falha no download (${res.status})`); }

      const blob = await res.blob();
      let filename = 'documento';
      const disp = res.headers.get('content-disposition') || '';
      const m1 = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disp);
      const m2 = /filename="?([^";]+)"?/i.exec(disp);
      const raw = (m1?.[1] || m2?.[1] || '').trim();
      if (raw) { try { filename = decodeURIComponent(raw.replace(/(^")|("$)/g, '')); } catch { filename = raw; } }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(blobUrl);
    }

    // ====== MODELO: sugestÃµes ======
    let _modeloItems = [];
    let _mIndex = -1;
    let _modeloLastTerm = "";   // <- adiciona isto
    const buscarModelos = debounce(async (q) => {
      const term = (q || '').trim();
      // registra o Ãºltimo termo solicitado
      _modeloLastTerm = term;

      if (!term) { _modeloItems = []; _mIndex = -1; ddModelo.innerHTML = ''; ddModelo.style.display = 'none'; return; }

      const items = await buscarVeiculosSugestoesModelo(term);

      // >>> GUARDA DE "STALE RESULT":
      // se o input atual mudou desde que disparamos a busca, ignore esta resposta
      if (_modeloLastTerm !== (inputModelo.value || "").trim()) return;

      _modeloItems = (items || []).filter(v => v.modelo).slice(0, 12);
      _mIndex = -1;

      if (_modeloItems.length === 0) {
        ddModelo.innerHTML = '';
        ddModelo.style.display = 'none';
        return;
      }

      renderDropdownObjs(ddModelo, _modeloItems, (v) => `${v.modelo} â€” ${v.placa}`, (v) => {
        closeDropdown(ddModelo);
        carregarParaEdicao(v.id);
      });
    }, 250);

    inputModelo.addEventListener('input', (e) => {
      const q = (e.target.value || '').trim();
      if (!q) { _modeloItems = []; _mIndex = -1; ddModelo.innerHTML = ''; ddModelo.style.display = 'none'; return; }

      buscarModelos(q);
    });
    inputModelo.addEventListener('focus', () => { if (_modeloItems.length) ddModelo.style.display = 'block'; });
    inputModelo.addEventListener('blur', () => setTimeout(() => closeDropdown(ddModelo), 120));
    inputModelo.addEventListener('keydown', (e) => {
      if (ddModelo.style.display !== 'block') return;
      const max = _modeloItems.length - 1;
      if (e.key === 'ArrowDown') { e.preventDefault(); _mIndex = Math.min(max, _mIndex + 1); highlight(ddModelo, _mIndex); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); _mIndex = Math.max(0, _mIndex - 1); highlight(ddModelo, _mIndex); }
      else if (e.key === 'Enter' && _mIndex >= 0) {
        e.preventDefault();
        const v = _modeloItems[_mIndex];
        closeDropdown(ddModelo);
        carregarParaEdicao(v.id);
      }

      else if (e.key === 'Escape') closeDropdown(ddModelo);
    });

    // ====== PLACA: sugestÃµes ======
    let _placaItems = [];
    let _pIndex = -1;
    const buscarPlacas = debounce(async (q) => {
      q = (q || '').trim();
      if (!q) { _placaItems = []; _pIndex = -1; ddPlaca.innerHTML = ''; ddPlaca.style.display = 'none'; return; }


      const items = await buscarVeiculosSugestoesPlaca(q);
      _placaItems = items.filter(v => v.placa).slice(0, 12);
      _pIndex = -1;

      if (_placaItems.length === 0) {
        ddPlaca.innerHTML = '';
        ddPlaca.style.display = 'none';
        return;
      }

      renderDropdownObjs(ddPlaca, _placaItems, (v) => v.placa, (v) => {
        closeDropdown(ddPlaca);
        carregarParaEdicao(v.id);
      });
    }, 250);


    inputPlaca.addEventListener('input', (e) => {
      inputPlaca.value = inputPlaca.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      const q = (e.target.value || '').trim();
      if (!q) { _placaItems = []; _pIndex = -1; ddPlaca.innerHTML = ''; ddPlaca.style.display = 'none'; return; }
      buscarPlacas(q);
    });
    inputPlaca.addEventListener('focus', () => { if (_placaItems.length) ddPlaca.style.display = 'block'; });
    inputPlaca.addEventListener('blur', () => setTimeout(() => closeDropdown(ddPlaca), 120));
    inputPlaca.addEventListener('keydown', (e) => {
      if (ddPlaca.style.display !== 'block') return;
      const max = _placaItems.length - 1;
      if (e.key === 'ArrowDown') { e.preventDefault(); _pIndex = Math.min(max, _pIndex + 1); highlight(ddPlaca, _pIndex); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); _pIndex = Math.max(0, _pIndex - 1); highlight(ddPlaca, _pIndex); }
      else if (e.key === 'Enter' && _pIndex >= 0) {
        e.preventDefault();
        const v = _placaItems[_pIndex];
        closeDropdown(ddPlaca);
        carregarParaEdicao(v.id);
      }

      else if (e.key === 'Escape') closeDropdown(ddPlaca);
    });


    // --- Transportadora (autocomplete) ---
    let _trpItems = [];
    let _tIndex = -1;
    let _trpLastTerm = "";
    let _trpAbort = null; // AbortController atual

    async function buscarTransportadorasAPI(q) {
      q = (q || '').trim();
      if (!q) return [];

      // aborta a busca anterior
      if (_trpAbort) _trpAbort.abort();
      _trpAbort = new AbortController();

      const res = await fetch(
        `${API_BASE}/pessoas/transportadoras?limit=12&search=${encodeURIComponent(q)}`,
        { headers: { ...authHeader() }, signal: _trpAbort.signal }
      );
      if (!res.ok) return [];
      const data = await res.json();

      return Array.isArray(data) ? data : (data.items ?? []);
    }
    const buscarTransportadoras = debounce(async (q) => {
      const term = (q || '').trim();
      _trpLastTerm = term;

      if (!term) {
        _trpItems = [];
        _tIndex = -1;
        ddTransp.innerHTML = '';
        ddTransp.style.display = 'none';
        return;
      }

      const items = await buscarTransportadorasAPI(term);

      // <<< IGNORA RESPOSTA OBSOLETA
      if (_trpLastTerm !== (inputTransp.value || '').trim()) return;
      _trpItems = items.filter(p => p?.nome).slice(0, 12);
      _tIndex = -1;

      if (_trpItems.length === 0) {
        ddTransp.innerHTML = '';
        ddTransp.style.display = 'none';
        return;
      }

      renderDropdownObjs(
        ddTransp,
        _trpItems,
        (p) => `${p.nome} â€” ${fmtDoc(p.cpf)}`,
        (p) => {
          inputTransp.value = p.nome;
          inputTranspId.value = p.id || '';
          ddTransp.style.display = 'none';
        }
      );
    }, 250);

    // INPUT: limpa e fecha imediatamente, depois busca
    inputTransp.addEventListener('input', (e) => {
      const val = (e.target.value || '').trim();

      // enquanto digita, zera a seleÃ§Ã£o e esconde a lista jÃ¡ na hora
      inputTranspId.value = '';
      ddTransp.innerHTML = '';
      ddTransp.style.display = 'none';

      if (!val) {
        _trpItems = [];
        _tIndex = -1;
        return;
      }
      buscarTransportadoras(val);
    });

    inputTransp.addEventListener('focus', () => {
      const cur = (inputTransp.value || '').trim();
      if (_trpItems.length && cur && cur === _trpLastTerm) {
        ddTransp.style.display = 'block';
      }
    });

    inputTransp.addEventListener('blur', () => {
      setTimeout(() => {
        ddTransp.style.display = 'none';
        if (!inputTranspId.value) inputTransp.value = ''; // bloqueia texto livre
      }, 120);
    });

    inputTransp.addEventListener('keydown', (e) => {
      if (ddTransp.style.display !== 'block') return;
      const max = _trpItems.length - 1;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!_trpItems.length) return;
        _tIndex = Math.min(max, _tIndex + 1);
        highlight(ddTransp, _tIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!_trpItems.length) return;
        _tIndex = Math.max(0, _tIndex - 1);
        highlight(ddTransp, _tIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (_tIndex >= 0 && _trpItems.length) {
          const p = _trpItems[_tIndex];
          inputTransp.value = p.nome;
          inputTranspId.value = p.id || '';
          ddTransp.style.display = 'none';
        }
      } else if (e.key === 'Escape') {
        ddTransp.style.display = 'none';
      }
    });







    // destaque visual no dropdown (igual ao de UsuÃ¡rios)
    function highlight(container, idx) {
      if (!container) return;
      const items = container.querySelectorAll('.item');
      items.forEach((el, i) => el.classList.toggle('active', i === idx));
      if (idx >= 0 && idx < items.length) items[idx].scrollIntoView({ block: 'nearest' });
    }





    // submit (criar/atualizar)
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        marca: inputMarca.value.trim(),
        modelo: inputModelo.value.trim(),
        placa: inputPlaca.value.trim().toUpperCase(),
        tipo: inputTipo.value,
        capacidade: Number(inputCap.value || 0),
        eixos: inputEixos.value === '' ? null : Number(inputEixos.value),
        validadeDocumento: inputValidade.value || null,
        transportadoraId: inputTranspId.value || null,
        transportadoraNome: inputTransp.value || null,
      };

      // BLOQUEAR TEXTO LIVRE EM TRANSPORTADORA
      if (payload.transportadoraNome && !payload.transportadoraId) {
        alert('Selecione uma transportadora vÃ¡lida da lista.');
        return; // impede submit
      }

      try {
        if (currentId) {
          await atualizarVeiculo(currentId, payload, inputDoc.files?.[0]);
          alert('VeÃ­culo atualizado com sucesso!');
        } else {
          await salvarVeiculo(payload, inputDoc.files?.[0]);
          alert('VeÃ­culo salvo com sucesso!');
        }
        limparFormulario();
        if (tabela) await listarVeiculos(tabela);
      } catch (err) {
        console.error(err);
        /*if (err.responseJson) {
          const j = err.responseJson;
          const detalhes = j?.issues?.fieldErrors
            ? Object.entries(j.issues.fieldErrors).map(([k, v]) => `â€¢ ${k}: ${v.join(', ')}`).join('\n')
            : j?.error || '';
          alert(`Falha ao salvar/atualizar veÃ­culo.\n${detalhes}`);
        } else {
          alert('Falha ao salvar/atualizar veÃ­culo. Verifique se a API possui /veiculos (POST) e /veiculos/:id (PUT).');
        }*/
      }

    });

    // excluir (se em ediÃ§Ã£o)
    btnExcluir?.addEventListener('click', async () => {
      if (!currentId) return;
      if (!confirm('Tem certeza que deseja excluir este veÃ­culo?')) return;
      try {
        await excluirVeiculo(currentId);
        alert('VeÃ­culo excluÃ­do.');
        limparFormulario();
        if (tabela) await listarVeiculos(tabela);
      } catch (err) {
        console.error(err);
        //alert('Falha ao excluir veÃ­culo. Verifique se a API possui /veiculos/:id (DELETE).');
      }
    });

    btnLimpar.addEventListener('click', () => limparFormulario());
    //btnRecarregar?.addEventListener('click', () => listarVeiculos(tabela));

    // primeira carga
    if (tabela) await listarVeiculos(tabela);


    linkDoc?.addEventListener('click', async (e) => {
      e.preventDefault();

      const id = linkDoc.dataset.id;
      const urlRel = linkDoc.dataset.url; // tipo: /veiculos/:id/documento
      if (!id || !urlRel) {
        alert('Nenhum documento associado a este veÃ­culo.');
        return;
      }

      try {
        const url = API_BASE + urlRel; // mantÃ©m relativo, mas com a base da API
        const res = await fetch(url, { headers: { ...authHeader() } });
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
    });


  };

  function selecionarVeiculo(v, formEls) {
    const { inputMarca, inputModelo, inputPlaca, inputTipo, inputCap, inputEixos, inputValidade, inputTransp, btnExcluir, linkDoc } = formEls;

    currentId = v.id || null;
    inputMarca.value = v.marca ?? '';
    inputModelo.value = v.modelo ?? '';
    inputPlaca.value = (v.placa ?? '').toUpperCase();
    inputTipo.value = v.tipo ?? '';
    inputCap.value = v.capacidade ?? '';
    inputEixos.value = v.eixos ?? '';
    inputValidade.value = v.validadeDocumento ? String(v.validadeDocumento).substring(0, 10) : '';
    inputTransp.value = v.transportadoraNome ?? v.transportadoraId ?? '';

    // >>> Link de download do documento
    if (linkDoc) {
      if (v.documentoUrl) {
        linkDoc.dataset.id = v.id;
        linkDoc.dataset.url = v.documentoUrl;
        linkDoc.textContent = 'Baixar documento';
        linkDoc.style.display = 'inline';
        linkDoc.removeAttribute('href');
      } else {
        linkDoc.style.display = 'none';
        linkDoc.removeAttribute('data-id');
        linkDoc.removeAttribute('data-url');
      }
    }




    if (btnExcluir) btnExcluir.style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }




  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.mountVeiculos?.());
  } else {
    window.mountVeiculos?.();
  }

})();




