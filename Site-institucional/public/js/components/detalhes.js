function esc(t) {
  const d = document.createElement("div");
  d.textContent = t ?? "";
  return d.innerHTML;
}

const ICONES_COMPONENTE = {
  cpu: "ph-cpu",
  ram: "ph-memory",
  disco: "ph-hard-drive",
  rede: "ph-wifi-high",
};

// faixas de cor dos cards (só para métricas em %)
const LIMITE_ALERTA = 70;
const LIMITE_CRITICO = 90;

function nivelComponente(comp, valor) {
  if (comp.metrica !== "%") return "normal";
  if (valor >= LIMITE_CRITICO) return "critico";
  if (valor >= LIMITE_ALERTA) return "alerta";
  return "normal";
}

async function mostrarDetalhes(element) {
  await lerDados();

  let divDetalhes = document.getElementById("detalhes");

  let mac = element.id;
  let servidor = servidorPorMac(mac);
  let componentes = servidor.componentes;

  let html = "";

  componentes.forEach((comp) => {
    const leituras = comp.ultimasLeituras ?? [];
    const atual = leituras.length ? leituras[leituras.length - 1] : null;
    const nivel = atual === null ? "normal" : nivelComponente(comp, atual);
    const icone = ICONES_COMPONENTE[comp.nome.toLowerCase()] ?? "ph-chart-bar";
    const barra =
      comp.metrica === "%" && atual !== null
        ? `<div class="componenteBarra"><div style="width:${Math.min(atual, 100)}%"></div></div>`
        : "";

    html += `
      <div class="itemComponente" data-nivel="${nivel}" id="${servidor.MAC_Adress}"
           onclick="select(this, 'itemComponente', 'itemComponenteSelected', mostrarGrafico)">
        <p class="hidden" id="${comp.id}"></p>
        <div class="componenteTopo">
          <span>${esc(comp.nome)}</span>
          <i class="ph ph-fill ${icone} componenteIcone text-lg"></i>
        </div>
        <p class="componenteValor">${atual ?? "--"}<small>${esc(comp.metrica)}</small></p>
        ${barra}
      </div>
    `;
  });

  divDetalhes.innerHTML = `
    <p id="nomeServidor" class="font-bold text-xl">${esc(servidor.apelido)}</p>

    <div class="w-full flex flex-col">
      <div class="w-full flex gap-3 border-b-1 border-b-disabled pb-2">
        <p class="itemNavDetalhes itemNavDetalhesSelected" id="${servidor.MAC_Adress}"
           onclick="select(this, 'itemNavDetalhes', 'itemNavDetalhesSelected', mostrarDetalhes)">Detalhes</p>
        <p class="itemNavDetalhes" id="${servidor.MAC_Adress}"
           onclick="select(this, 'itemNavDetalhes', 'itemNavDetalhesSelected', mostrarAlertas)">Alertas</p>
      </div>

      <div class="w-full grid grid-cols-1 lg:grid-cols-3 lg:divide-x-1 divide-disabled" id="especificacoes">
        <div class="lg:col-span-2 grid grid-cols-2 gap-3 p-4 content-start">
          ${html}
        </div>
        <div class="lg:col-span-1 p-4 min-h-64" id="grafico">
          <div class="w-full h-full flex flex-col gap-2 items-center justify-center text-center text-disabled">
            <i class="ph ph-chart-line text-3xl"></i>
            <p class="font-bold">Selecione um componente para ver o gráfico</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function mostrarGrafico(element) {
  let mac = element.id;
  let servidor = servidorPorMac(mac);
  let ctxWrapper = document.getElementById("grafico");
  let id_comp = element.querySelector("p").id;
  let data = [];
  let componente = "";

  servidor.componentes.forEach((comp) => {
    if (id_comp == comp.id) {
      data = comp.ultimasLeituras;
      componente = comp.nome;
    }
  });

  ctxWrapper.innerHTML = `<div class="relative w-full h-full min-h-56"><canvas id="ctx"></canvas></div>`;

  new Chart(document.getElementById("ctx"), {
    type: "line",
    data: {
      labels: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
      datasets: [
        {
          label: componente,
          data: data,
          fill: false,
          borderColor: "#28c76f",
          tension: 0.1,
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });
}

/* ---------- Alertas ---------- */
function nivelAlerta(status) {
  return String(status).toLowerCase().includes("crít") ? "critico" : "alerta";
}

function toggleAlerta(btn) {
  const item = btn.closest(".itemAlertas");
  const abrir = !item.classList.contains("itemAlertasSelected");

  // um aberto por vez (apague este bloco para permitir vários)
  document.querySelectorAll(".itemAlertasSelected").forEach((i) => {
    i.classList.remove("itemAlertasSelected");
    i.querySelector(".alertaCabecalho").setAttribute("aria-expanded", "false");
  });

  item.classList.toggle("itemAlertasSelected", abrir);
  btn.setAttribute("aria-expanded", abrir);
}

function mostrarAlertas(element) {
  let mac = element.id;
  let servidor = servidorPorMac(mac);
  let divEspecificacoes = document.getElementById("especificacoes");

  divEspecificacoes.classList.remove("grid");
  divEspecificacoes.classList.add("flex");

  if (servidor.alertas.length == 0) {
    divEspecificacoes.innerHTML = `
      <div class="w-full flex flex-col items-center justify-center gap-2 py-12">
        <i class="ph ph-check-circle text-4xl text-[var(--success-text)]"></i>
        <p class="font-bold text-xl">Sem alertas para ${esc(servidor.apelido)}! :)</p>
      </div>
    `;
    return;
  }

  let alertas = "";

  servidor.alertas.forEach((alerta) => {
    const nivel = nivelAlerta(alerta.status);
    alertas += `
      <div class="itemAlertas" data-nivel="${nivel}">
        <button type="button" class="alertaCabecalho" aria-expanded="false" onclick="toggleAlerta(this)">
          <span class="alertaIcone">
            <i class="ph ph-fill ${nivel === "critico" ? "ph-warning-octagon" : "ph-warning"}"></i>
          </span>
          <div class="flex-1 min-w-0">
            <p class="alertaTitulo">${esc(alerta.titulo)}</p>
          </div>
          <span class="alertaBadge">${esc(alerta.status)}</span>
          <i class="ph ph-caret-down alertaSeta"></i>
        </button>

        <div class="alertaCorpo">
          <div>
            <div class="alertaDescricao">
              <p>${esc(alerta.descricao)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  divEspecificacoes.innerHTML = `
    <div class="w-full p-4">
      <div class="listaAlertas max-h-96 overflow-y-auto">
        ${alertas}
      </div>
    </div>
  `;
}