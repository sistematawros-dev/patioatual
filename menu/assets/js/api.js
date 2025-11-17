// Camada de acesso à API
let TOKEN = localStorage.getItem('TOKEN') || '';
function setToken(t) { TOKEN = t || ''; if (t) localStorage.setItem('TOKEN', t); }
async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(TOKEN ? { 'Authorization': 'Bearer ' + TOKEN } : {}) },
    ...opts, body: opts.body && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body
  });
  if (!res.ok) {
    let errText = res.statusText;
    try { const j = await res.json(); errText = j.error || errText; } catch { }
    throw new Error(errText + ' (' + res.status + ')');
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

// Auth
async function login(email, password) {
  const r = await api('/auth/login', { method: 'POST', body: { email, password } });
  setToken(r.token); return r.user;
}
async function register(name, email, password) {
  const r = await api('/auth/register', { method: 'POST', body: { name, email, password, roles: ['Administrador'] } });
  setToken(r.token); return r.user;
}

// CRUD helpers
async function listInstrucoes(params = '') { return api('/instrucoes' + (params ? ('?' + params) : '')); }
async function createAgendamento(payload) { return api('/agendamentos', { method: 'POST', body: payload }); }
async function listAgendamentos(params = '') { return api('/agendamentos' + (params ? ('?' + params) : '')); }
async function getAgendamento(id) { return api('/agendamentos/' + id); }
async function updateAgendamento(id, patch) { return api('/agendamentos/' + id, { method: 'PUT', body: patch }); }
async function deleteAgendamento(id) { return api('/agendamentos/' + id, { method: 'DELETE' }); }
async function moveNext(id) { return api('/agendamentos/' + id + '/next', { method: 'POST' }); }
