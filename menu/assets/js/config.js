// config.js
const DEFAULT_API =
  location.hostname.endsWith('tawros.com.br')
    ? 'https://api.sistema.tawros.com.br'
   // : 'http://localhost:3333';// Configuração do cliente
//const API_BASE = localStorage.getItem('API_BASE') || 'http://209.38.154.140:3333';
  const API_BASE = localStorage.getItem('API_BASE') || DEFAULT_API;
