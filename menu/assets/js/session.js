(function () {
  const AUTH_KEY = "twr_auth_ok";
  const EXPIRES_AT = "twr_auth_expires_at";
  const TIMER_ID = "__twr_timer_id__";

  let _beforeUnloadHandler = null;
  let _closeConfirmEnabled = false;

  function _clearTimer() {
    if (window[TIMER_ID]) {
      clearTimeout(window[TIMER_ID]);
      window[TIMER_ID] = null;
    }
  }

  function _msLeft() {
    return (Number(localStorage.getItem(EXPIRES_AT)) || 0) - Date.now();
  }

  function _scheduleTimeout() {
    _clearTimer();
    const msLeft = _msLeft();
    if (isNaN(msLeft) || msLeft <= 0) {
      // Evita dialogo ao redirecionar por expiração de sessão
      disableCloseConfirm();
      endSession();
      return;
    }
    window[TIMER_ID] = setTimeout(function () {
      // Evita dialogo ao redirecionar por expiração de sessão
      disableCloseConfirm();
      endSession();
    }, msLeft);
  }

  // Inicia a sessão após login com o tempo desejado (padrão 5 min)
  function startSession(minutes = 5) {
    const expiry = Date.now() + minutes * 60 * 1000;
    try {
      localStorage.setItem(AUTH_KEY, "1");
      localStorage.setItem(EXPIRES_AT, String(expiry));
    } catch (e) {}
    _scheduleTimeout();
  }

  // Encerra a sessão e volta para a tela de login (index.html)
  function endSession() {
    _clearTimer();
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(EXPIRES_AT);
    } catch (e) {}

    // Evita reaproveitamento do histórico
    try {
      if (history && history.replaceState) {
        history.replaceState(null, "", location.href);
      }
    } catch (e) {}

    // Redireciona usando replace (não cria novo entry de histórico)
    location.replace("index.html");
  }

  // Na página de login: impede voltar para telas protegidas.
  function preventBackOnIndex() {
    try {
      if (history && history.pushState) {
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", function () {
          history.go(1);
        });
      }
    } catch (e) {}
  }

  // Em TODAS as páginas protegidas: valida sessão e agenda expiração.
  function enforceAuth({ timeoutMinutes = 5 } = {}) {
    const ok = localStorage.getItem(AUTH_KEY) === "1";
    const exp = Number(localStorage.getItem(EXPIRES_AT));

    if (!ok || !exp || Date.now() > exp) {
      // Evita dialogo se não há sessão ao tentar forçar redirect
      disableCloseConfirm();
      endSession();
      return;
    }

    // Agenda o término com base no EXPIRES_AT.
    _scheduleTimeout();

    // Se a página voltar do BFCache (botão voltar), força recarga p/ revalidar
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        location.reload();
      }
    });

    // Desencoraja o "voltar" inserindo um novo estado
    try {
      if (history && history.pushState) {
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", function () {
          history.go(1);
        });
      }
    } catch (e) {}

    // Mantém timers sincronizados entre abas ao mudar EXPIRES_AT
    window.addEventListener("storage", function (ev) {
      if (ev.key === EXPIRES_AT) _scheduleTimeout();
    });
  }

  // Reinicia a contagem a cada atividade do usuário (cliques, digitação, etc.)
  let _activityReset = null;
  function enableInactivityReset(minutes = 5) {
    const ms = minutes * 60 * 1000;
    let lastReset = 0;

    function reset() {
      const now = Date.now();
      // throttle para evitar excesso de gravações
      if (now - lastReset < 1000) return;
      lastReset = now;

      const expiry = now + ms;
      try {
        localStorage.setItem(EXPIRES_AT, String(expiry));
      } catch (e) {}
      _scheduleTimeout();
    }

    const events = [
      "pointerdown","click","dblclick","contextmenu",
      "keydown","keyup","input","change",
      "mousemove","touchstart","wheel","scroll",
      "focus","focusin"
    ];
    events.forEach(ev => {
      window.addEventListener(ev, reset, { passive: true });
    });

    _activityReset = reset;
    reset(); // início imediato
  }

  // Exibe confirmação ao tentar fechar/atualizar/fechar aba ou navegar para fora
  function enableCloseConfirm() {
    if (_closeConfirmEnabled) return;
    _closeConfirmEnabled = true;

    _beforeUnloadHandler = function (e) {
      // Alguns navegadores exigem user gesture prévia.
      // Custom text é ignorado na maioria dos browsers modernos.
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", _beforeUnloadHandler, { capture: true });
  }

  function disableCloseConfirm() {
    if (!_closeConfirmEnabled) return;
    _closeConfirmEnabled = false;
    if (_beforeUnloadHandler) {
      window.removeEventListener("beforeunload", _beforeUnloadHandler, { capture: true });
      _beforeUnloadHandler = null;
    }
  }

  // APIs públicas
  window.Session = {
    startSession,
    endSession,
    enforceAuth,
    preventBackOnIndex,
    enableInactivityReset,
    enableCloseConfirm,
    disableCloseConfirm,
  };
})();