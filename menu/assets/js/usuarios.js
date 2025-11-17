// assets/js/usuarios.js
(function () {
  // monta UMA vez por sessão (quando abre a aba Usuários)
  window.mountUsuarios = async function () {
    const sec = document.getElementById('tab-usuarios');
    if (!sec || sec.dataset.mounted === '1') return;
    sec.dataset.mounted = '1';

    const form = document.getElementById('form-usuario');
    const inputNome = document.getElementById('usr-nome');
    const inputEmail = document.getElementById('usr-email');
    const inputSenha = document.getElementById('usr-senha');
    const selectTipo = document.getElementById('usr-tipo');
    const btnLimpar = document.getElementById('usr-limpar');
    const btnRecarregar = document.getElementById('usr-recarregar');
    const btnExcluir = document.getElementById('usr-excluir');
    const containerTabela = document.getElementById('usuarios-tabela'); // opcional

    const authHeader = () => (TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {});

    // --- util: debounce ---
    function debounce(fn, delay = 250) {
      let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
    }

    // ====== Dropdown de sugestões ======
    const dd = document.getElementById('usr-dd');
    let _usuariosCache = [];       // array de { id, name, email, roles }
    let _activeIndex = -1;         // item selecionado por teclado
    let selectedUserId = null;     // null = modo novo; string = edição
    let selectedOriginal = null;   // guarda o usuário original carregado

    function syncActiveItem() {
      if (!dd) return;
      const items = dd.querySelectorAll('.item');
      items.forEach((el, i) => el.classList.toggle('active', i === _activeIndex));
      if (_activeIndex >= 0 && _activeIndex < items.length) {
        items[_activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
    function openDropdown() {
      if (!dd) return;
      if (dd.children.length === 0) return;
      dd.style.display = 'block';
      _activeIndex = -1;
      syncActiveItem();
    }
    function closeDropdown() {
      if (!dd) return;
      dd.style.display = 'none';
      _activeIndex = -1;
      syncActiveItem();
    }
    function resetUserSuggestions() {
      _usuariosCache = [];
      if (dd) {
        dd.innerHTML = '';
        dd.style.display = 'none';
      }
      _activeIndex = -1;
    }
    function renderDropdown(list) {
      if (!dd) return;
      if (!Array.isArray(list) || list.length === 0) {
        dd.innerHTML = '';
        closeDropdown();
        return;
      }
      dd.innerHTML = list.map((u, i) => `
        <div class="item" data-index="${i}">
          <strong>${u.name || '-'}</strong>
          <small>${u.email || ''}${Array.isArray(u.roles) && u.roles.length ? ' • ' + u.roles[0] : ''}</small>
        </div>
      `).join('');

      dd.querySelectorAll('.item').forEach(el => {
        el.addEventListener('mousedown', (ev) => {
          ev.preventDefault(); // dispara antes do blur do input
          const idx = Number(el.getAttribute('data-index'));
          if (!isNaN(idx)) selectUser(_usuariosCache[idx]);
        });
      });

      openDropdown();
    }

    // Seleciona um usuário para edição
    function selectUser(u) {
      if (!u) return;
      selectedUserId = u.id;
      selectedOriginal = { ...u };

      inputNome.value = u.name || '';
      inputNome.readOnly = true;     // Nome não pode ser alterado
      inputEmail.value = u.email || '';

      const role = Array.isArray(u.roles) && u.roles.length ? u.roles[0] : '';
      if (role) {
        let opt = Array.from(selectTipo.options).find(o => o.value === role);
        if (!opt) { opt = new Option(role, role); selectTipo.add(opt); }
        selectTipo.value = role;
      }

      if (inputSenha) {
        inputSenha.value = '';
        inputSenha.required = false; // senha OPCIONAL na edição
      }

      if (btnExcluir) btnExcluir.style.display = 'inline-flex'; // aparece na edição
      resetUserSuggestions();
      closeDropdown();
    }

    // Busca sugestões na API
    const buscarUsuariosSugestoes = debounce(async (q) => {
      q = (q || '').trim();
      if (q.length < 3) { _usuariosCache = []; renderDropdown([]); return; }
      try {
        const url = `/auth/users/search?q=${encodeURIComponent(q)}&limit=10`;
        const lista = await api(url); // usa helper que inclui Authorization
        _usuariosCache = Array.isArray(lista) ? lista : [];
        renderDropdown(_usuariosCache);
      } catch (err) {
        console.error('Erro buscando usuários:', err);
        _usuariosCache = [];
        renderDropdown([]);
      }
    }, 300);

    // Eventos do input Nome
    inputNome.addEventListener('input', (e) => {
      if (inputNome.readOnly) return; // não buscar quando travado
      buscarUsuariosSugestoes(e.target.value);
    });
    inputNome.addEventListener('keydown', (e) => {
      if (dd.style.display !== 'block') return;
      const max = _usuariosCache.length - 1;
      if (e.key === 'ArrowDown') {
        e.preventDefault(); _activeIndex = Math.min(max, _activeIndex + 1); syncActiveItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); _activeIndex = Math.max(0, _activeIndex - 1); syncActiveItem();
      } else if (e.key === 'Enter') {
        if (_activeIndex >= 0 && _activeIndex <= max) {
          e.preventDefault(); selectUser(_usuariosCache[_activeIndex]);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });
    inputNome.addEventListener('blur', () => setTimeout(() => closeDropdown(), 120));
    inputNome.addEventListener('focus', () => {
      if (inputNome.readOnly) return;      // em edição, não abre
      if (_usuariosCache.length) openDropdown();
    });

    // ====== Lista (opcional) ======
    async function listarUsuarios() {
      if (containerTabela) containerTabela.innerHTML = '<p class="chip">Carregando…</p>';
      try {
        const res = await fetch(`${API_BASE}/auth/me/list`, { headers: { ...authHeader() } });
        if (!res.ok) throw new Error(`Falha ao listar (${res.status}) ${await res.text()}`);
        const items = await res.json();
        if (containerTabela) renderTabela(items);
      } catch (err) {
        console.error(err);
        if (containerTabela) containerTabela.innerHTML = '<p class="chip">Erro ao carregar usuários</p>';
      }
    }
    function renderTabela(items) {
      if (!containerTabela) return;
      if (!Array.isArray(items) || items.length === 0) {
        containerTabela.innerHTML = '<p>Nenhum usuário cadastrado.</p>'; return;
      }
      const head = `
        <div class="table-head">
          <div class="col grow">Usuário</div>
          <div class="col">Tipo</div>
        </div>`;
      const rows = items.map(u => `
        <div class="table-row">
          <div class="col grow"><strong>${u.name}</strong><br><small>${u.email}</small></div>
          <div class="col">${Array.isArray(u.roles) ? u.roles.join(', ') : '-'}</div>
        </div>
      `).join('');
      containerTabela.innerHTML = head + rows;
    }

    // ====== Submit (criar/atualizar) ======
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = inputNome.value.trim();
      const email = inputEmail.value.trim().toLowerCase();
      const password = (inputSenha?.value || '').trim();
      const tipo = selectTipo.value;

      if (!name || !email || !tipo) {
        alert('Preencha Nome, Email e Tipo'); return;
      }

      try {
        if (!selectedUserId) {
          // CRIAR: senha obrigatória (min 6)
          if (password.length < 6) { alert('Informe uma senha com no mínimo 6 caracteres'); return; }

          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ name, email, password, roles: [tipo] }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error || `Falha ao cadastrar (${res.status})`);
          }

          alert('Usuário cadastrado com sucesso');
          if (inputSenha) inputSenha.required = true; // volta a exigir na criação
          inputNome.readOnly = false;
          btnExcluir.style.display = 'none';
          resetUserSuggestions();
          form.reset();
          await listarUsuarios();

        } else {
          // EDITAR: Nome não altera; e-mail/tipo mudam; senha opcional
          const patch = {};
          if (!selectedOriginal || email !== selectedOriginal.email) patch.email = email;
          const originalRole = Array.isArray(selectedOriginal?.roles) ? selectedOriginal.roles[0] : '';
          if (tipo !== originalRole) patch.roles = [tipo];
          if (password) patch.password = password;

          if (Object.keys(patch).length === 0) {
            alert('Nada para atualizar'); return;
          }

          const r = await fetch(`${API_BASE}/auth/users/${selectedUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(patch),
          });
          if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            throw new Error(j.error || `Falha ao atualizar (${r.status})`);
          }
          const updated = await r.json();
          alert('Usuário atualizado com sucesso');
          btnExcluir.style.display = 'none';
          // Mantém em modo edição ou reseta? Aqui vamos resetar para modo "novo":
          inputNome.readOnly = false;
          selectedUserId = null;
          selectedOriginal = null;
          if (inputSenha) inputSenha.value = '';
          resetUserSuggestions();
          form.reset();
          await listarUsuarios();
        }
      } catch (err) {
        console.error(err);
        alert(err.message || 'Erro ao salvar');
      }
    });

    // ====== Limpar (volta para modo novo) ======
    btnLimpar?.addEventListener('click', () => {
      form.reset();
      selectedUserId = null;
      selectedOriginal = null;
      inputNome.readOnly = false;
      btnExcluir.style.display = 'none';
      if (inputSenha) inputSenha.required = true; // criação: senha obrigatória
      if (btnExcluir) btnExcluir.style.display = 'none';
      resetUserSuggestions();
    });

    // ====== Excluir (CONFIRMAÇÃO + DELETE) ======
    btnExcluir?.addEventListener('click', async () => {
      if (!selectedUserId) return;

      const nome = inputNome.value || '(sem nome)';
      const ok = confirm(`Tem certeza que deseja excluir o usuário: ${nome}?\nEsta ação não poderá ser desfeita.`);
      if (!ok) return;

      try {
        const r = await fetch(`${API_BASE}/auth/users/${selectedUserId}`, {
          method: 'DELETE',
          headers: { ...authHeader() }
        });
        if (!r.ok && r.status !== 204) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || `Falha ao excluir (${r.status})`);
        }

        alert('Usuário excluído com sucesso.');
        btnExcluir.style.display = 'none';
        // Reset para modo criação
        form.reset();
        selectedUserId = null;
        selectedOriginal = null;
        inputNome.readOnly = false;
        if (inputSenha) inputSenha.required = true;

        resetUserSuggestions();
        if (btnExcluir) btnExcluir.style.display = 'none';

        await listarUsuarios();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Erro ao excluir usuário.');
      }
    });

    btnRecarregar?.addEventListener('click', listarUsuarios);

    // primeira carga
    await listarUsuarios();
  };
})();
