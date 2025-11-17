const PATICOLUNAS = ["Fila", "Carregamento", "Carregado", "Finalizado"];
let patioAutoTimer = null;

async function renderPatio() {
  const patioBoard = $("#patioBoard");
  if (!patioBoard) return;
  patioBoard.innerHTML = "";
  PATICOLUNAS.forEach(col => {
    const panel = document.createElement("div"); panel.className = "panel";
    panel.innerHTML = `<div class="panel-header"><h3>${col}</h3><span class="chip" id="count-${col}">0</span></div><div class="panel-body"><div class="dropzone" data-col="${col}" data-accept="card"></div></div>`;
    patioBoard.appendChild(panel);
  });
  const counts = {}; PATICOLUNAS.forEach(c => counts[c] = 0);
  try {
    const res = await listAgendamentos("limit=500");
    (res.items || []).forEach(a => {
      const dz = patioBoard.querySelector(`.dropzone[data-col="${a.status || "Fila"}"]`);
      if (dz) { dz.appendChild(createCard(a)); counts[a.status || "Fila"]++; }
    });
  } catch (err) {
    console.warn("Falha ao carregar p�tio", err);
  }
  PATICOLUNAS.forEach(c => { const el = document.getElementById("count-" + c); if (el) el.textContent = counts[c]; });
  enableDnD();
}

function togglePatioAutoRefresh(force) {
  if (patioAutoTimer) {
    clearInterval(patioAutoTimer);
    patioAutoTimer = null;
  }
  if (force === false) return;
  const interval = Number(localStorage.getItem("patioAutoInterval")) || 15000;
  patioAutoTimer = setInterval(renderPatio, interval);
}

document.getElementById("patioRefresh")?.addEventListener("click", () => renderPatio());
document.getElementById("patioAutoToggle")?.addEventListener("click", (ev) => {
  const enable = !patioAutoTimer;
  togglePatioAutoRefresh(enable);
  ev.currentTarget.textContent = enable ? "Parar auto atualizar" : "Auto atualizar";
  if (enable) renderPatio();
});

togglePatioAutoRefresh(false);
