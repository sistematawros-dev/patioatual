(function (global) {
  const TOKEN_KEY = 'TOKEN';
  const USER_KEY = 'CURRENT_USER';
  const API_BASE_KEY = 'API_BASE';

  let token = localStorage.getItem(TOKEN_KEY) || '';

  function getApiBase() {
     return localStorage.getItem(API_BASE_KEY) || 'https://api.sistema.tawros.com.br';
  }

  function setToken(value) {
    token = value || '';
    if (!value) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  }

  function persistUser(user) {
    if (!user) {
      localStorage.removeItem(USER_KEY);
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async function request(path, options = {}) {
    const opts = { ...options };
    const headers = {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    opts.headers = headers;
    if (opts.body && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(getApiBase() + path, opts);
    if (!res.ok) {
      let message = res.statusText || 'Erro na requisicao';
      try {
        const payload = await res.json();
        message = payload.error || payload.message || message;
      } catch (_) {}
      throw new Error(message + ' (' + res.status + ')');
    }
    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('application/json')) return res.json();
    return res.text();
  }

  async function login(email, password) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (result.token) setToken(result.token);
    const user = result.user || null;
    if (user) persistUser(user);
    return user;
  }

  async function fetchCurrentUser() {
    const data = await request('/auth/me');
    const user = data.user || data;
    persistUser(user);
    return user;
  }

  function clearAuth() {
    setToken('');
    persistUser(null);
  }

  global.MenuAuth = {
    login,
    fetchCurrentUser,
    clearAuth,
    get token() {
      return token;
    },
    get apiBase() {
      return getApiBase();
    },
  };
})(window);

