document.addEventListener('DOMContentLoaded', () => {
  Session?.preventBackOnIndex?.();

  const form = document.querySelector('form');
  const loginInput = document.getElementById('login');
  const senhaInput = document.getElementById('senha');
  const submitButton = form?.querySelector('button[type="submit"]');

  loginInput?.addEventListener('input', () => {
    //loginInput.value = loginInput.value.toUpperCase();
  });

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.dataset.defaultText = submitButton.dataset.defaultText || submitButton.textContent;
    submitButton.textContent = isSubmitting ? 'Entrando...' : submitButton.dataset.defaultText;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = loginInput?.value?.trim() || '';
    const senha = senhaInput?.value || '';

    if (!email || !senha) {
      alert('Por favor, preencha login e senha.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await MenuAuth.login(email, senha);
      onLoginSucesso(user, email);
    } catch (error) {
      alert(error.message || 'Erro ao realizar login.');
    } finally {
      setSubmitting(false);
    }
  });
});

function onLoginSucesso(user, email) {
  const identificador = user?.email || email || '';
  try {
    if (identificador) localStorage.setItem('usuarioLogado', identificador);
    window.CURRENT_USER = user || null;
  } catch (_) { }

  Session?.startSession?.(1);
  location.replace('./menu.html');
}
