let servidoresEspecificacoes = [];
let servidorSelecionado = null;
let graficoDesempenho = null;
let intervaloAtualizacao = null;
let historicoAtual = [];
let horaSelecionada = null;

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

async function requisicaoAPI(url) {
    const resposta = await fetch(url, {
        method: "GET",
        credentials: "same-origin"
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.mensagem || dados.message || "Erro ao consultar a API.");
    }

    return dados;
}

function formatarData(data) {
    if (!data) return "--";

    const valor = new Date(data);

    return isNaN(valor.getTime())
        ? "--"
        : valor.toLocaleString("pt-BR");
}

function formatarNumero(valor) {
    if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
        return "--";
    }

    return Number(valor).toFixed(2);
}

function atualizarIndicador(valor, elementoValor, elementoStatus, barra) {
    const campoValor = document.getElementById(elementoValor);
    const campoStatus = document.getElementById(elementoStatus);
    const campoBarra = document.getElementById(barra);

    if (!campoValor || !campoStatus || !campoBarra) return;

    if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
        campoValor.textContent = "--";
        campoStatus.textContent = "Sem dados";
        campoBarra.style.width = "0%";
        return;
    }

    const numero = Number(valor);

    campoValor.textContent = formatarNumero(numero);
    campoBarra.style.width = Math.max(0, Math.min(numero, 100)) + "%";

    campoStatus.textContent = numero >= 85
        ? "Crítico"
        : numero >= 70
            ? "Atenção"
            : "Normal";
}

function atualizarTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = texto;
}

function limparMetricas() {
    atualizarIndicador(null, "valor_cpu", "status_cpu", "barra_cpu");
    atualizarIndicador(null, "valor_ram", "status_ram", "barra_ram");

    atualizarTexto("valor_rede_recebida", "--");
    atualizarTexto("valor_rede_enviada", "--");
    atualizarTexto("ultima_atualizacao", "--");
    atualizarTexto("status_servidor", "Aguardando dados");
    atualizarTexto("estado_servidor", "Indisponível");
    atualizarTexto("descricao_estado", "Aguardando dados de monitoramento");
    atualizarTexto("uptime", "--");

    const indicador = document.getElementById("indicador_servidor");

    if (indicador) {
        indicador.style.backgroundColor = "#FFFFFF";
    }

    const estado = document.getElementById("bloco_estado_servidor");

    if (estado) {
        estado.style.borderColor = "#30265B";
    }

    atualizarTexto("mensagem_grafico", "Selecione um servidor para consultar as métricas.");

    const barras = document.getElementById("barras_disponibilidade");

    if (barras) {
        barras.innerHTML = "";
    }

    historicoAtual = [];
    horaSelecionada = null;

    if (graficoDesempenho) {
        graficoDesempenho.destroy();
        graficoDesempenho = null;
    }
}

function renderizarServidores() {
    const lista = document.getElementById("lista_servidores");
    const total = document.getElementById("total_servidores");

    total.textContent = servidoresEspecificacoes.length + " servidores";

    if (servidoresEspecificacoes.length === 0) {
        lista.innerHTML = `
            <div class="col-span-full rounded-xl border border-[#30265B] bg-[#0D1730] p-5 text-sm text-white/50">
                Nenhum servidor cadastrado para esta empresa.
            </div>
        `;
        return;
    }

    lista.innerHTML = servidoresEspecificacoes.map(servidor => `
        <button
            type="button"
            data-servidor="${escaparHTML(servidor.id_servidor)}"
            class="servidor-card rounded-xl border border-[#30265B] bg-[#0D1730] p-4 text-left transition hover:border-[#625CFF] hover:bg-[#14203D]"
        >
            <div class="flex items-center gap-3">
                <span class="size-2 rounded-full bg-white/30"></span>
                <span class="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                    ${escaparHTML(servidor.apelido)}
                </span>
            </div>
            <p class="mt-3 text-xs text-white/50">
                ${escaparHTML(servidor.modelo)}
            </p>
            <p class="mt-1 truncate text-[10px] text-white/30">
                ${escaparHTML(servidor.endereco_mac)}
            </p>
        </button>
    `).join("");

    lista.querySelectorAll("[data-servidor]").forEach(botao => {
        botao.addEventListener("click", () => {
            selecionarServidor(botao.dataset.servidor);
        });
    });

    if (servidorSelecionado) {
        destacarServidor(servidorSelecionado.id_servidor);
    }
}

function destacarServidor(id) {
    document.querySelectorAll(".servidor-card").forEach(botao => {
        const selecionado = botao.dataset.servidor === String(id);

        botao.classList.toggle("border-[#625CFF]", selecionado);
        botao.classList.toggle("bg-[#14203D]", selecionado);
    });
}

async function carregarServidores() {
    const lista = document.getElementById("lista_servidores");

    try {
        servidoresEspecificacoes = await requisicaoAPI("/api/especificacoes/servidores");

        renderizarServidores();

        if (servidoresEspecificacoes.length > 0) {
            const servidorAtual = servidoresEspecificacoes.find(
                servidor => servidorSelecionado &&
                    String(servidor.id_servidor) === String(servidorSelecionado.id_servidor)
            );

            await selecionarServidor(
                servidorAtual
                    ? servidorAtual.id_servidor
                    : servidoresEspecificacoes[0].id_servidor
            );
        } else {
            atualizarTexto("nome_servidor", "Nenhum servidor cadastrado");
            limparMetricas();
        }
    } catch (erro) {
        console.error("Erro ao carregar servidores:", erro);

        if (erro.message.includes("Token")) {
            window.location.href = "/pages/login.html";
            return;
        }

        lista.innerHTML = `
            <div class="col-span-full rounded-xl border border-red-500/30 bg-[#0D1730] p-5 text-sm text-red-300">
                Não foi possível carregar os servidores: ${escaparHTML(erro.message)}
            </div>
        `;

        atualizarTexto("total_servidores", "Erro ao carregar");
    }
}

async function selecionarServidor(id) {
    servidorSelecionado = servidoresEspecificacoes.find(
        servidor => String(servidor.id_servidor) === String(id)
    );

    if (!servidorSelecionado) return;

    atualizarTexto("nome_servidor", servidorSelecionado.apelido);
    destacarServidor(id);
    limparMetricas();

    atualizarTexto("mensagem_grafico", "Carregando histórico do servidor...");

    try {
        const metricas = await requisicaoAPI(
            "/api/especificacoes/servidores/" + encodeURIComponent(id) + "/metricas"
        );

        renderizarMetricas(metricas);
    } catch (erro) {
        console.error("Erro ao carregar métricas:", erro);

        atualizarTexto("status_servidor", "Erro ao consultar");
        atualizarTexto("estado_servidor", "Sem dados");
        atualizarTexto("descricao_estado", erro.message);
        atualizarTexto("mensagem_grafico", "Não foi possível carregar o histórico do servidor.");

        if (erro.message.includes("Token")) {
            window.location.href = "/pages/login.html";
        }
    }
}

function renderizarStatus(metricas) {
    const ligado = metricas.ligado === true;

    atualizarTexto("estado_servidor", ligado ? "Ligado" : "Desligado");

    atualizarTexto(
        "descricao_estado",
        ligado
            ? "Servidor enviando leituras de monitoramento."
            : metricas.ultima_atualizacao
                ? "Sem leitura recente. Última atualização: " + formatarData(metricas.ultima_atualizacao)
                : "Nenhuma leitura de monitoramento encontrada."
    );

    atualizarTexto("status_servidor", ligado ? "Ligado" : "Desligado");

    const cor = ligado ? "#00E58B" : "#FF0055";
    const indicador = document.getElementById("indicador_servidor");
    const bloco = document.getElementById("bloco_estado_servidor");

    if (indicador) indicador.style.backgroundColor = cor;
    if (bloco) bloco.style.borderColor = cor;

    const totalHoras = (metricas.disponibilidade || [])
        .filter(hora => hora.disponivel).length;

    atualizarTexto("uptime", totalHoras + "/8 horas com dados");
}

function renderizarDisponibilidade(horas) {
    const container = document.getElementById("barras_disponibilidade");

    if (!container) return;

    container.innerHTML = horas.map((hora, indice) => {
        const selecionada = horaSelecionada === hora.timestamp;

        const cor = hora.disponivel ? "#00E58B" : "#FF0055";
        const fundo = hora.disponivel ? "rgba(0,229,139,0.22)" : "rgba(255,0,85,0.15)";

        return `
            <button
                type="button"
                class="barra-hora"
                data-hora="${hora.timestamp}"
                title="${hora.label} — ${hora.quantidade_pontos} leituras de 10 minutos"
                aria-label="Ver dados das ${hora.label}"
                aria-pressed="${selecionada}"
                style="
                    cursor: pointer;
                    background-color: ${fundo};
                    border: 1px solid ${selecionada ? "#FFFFFF" : cor};
                    box-shadow: ${selecionada ? "0 0 0 2px " + cor : "none"};
                    transition: background-color .2s, border-color .2s;
                "
            ></button>
        `;
    }).join("");

    container.querySelectorAll("[data-hora]").forEach(botao => {
        botao.addEventListener("click", () => {
            const hora = botao.dataset.hora;

            horaSelecionada = horaSelecionada === hora ? null : hora;

            renderizarDisponibilidade(horas);
            atualizarGrafico();
        });
    });
}

function atualizarGrafico() {
    let dados = historicoAtual;

    const titulo = document.querySelector("#container_grafico h2");

    if (horaSelecionada) {
        const inicio = new Date(horaSelecionada);
        const fim = new Date(inicio);
        fim.setHours(fim.getHours() + 1);

        dados = historicoAtual.filter(registro => {
            const data = new Date(registro.timestamp);
            return data >= inicio && data < fim;
        });

        if (titulo) {
            titulo.textContent = "Desempenho das " +
                inicio.toLocaleTimeString("pt-BR", { hour: "2-digit" }) +
                " às " +
                fim.toLocaleTimeString("pt-BR", { hour: "2-digit" });
        }

        atualizarTexto(
            "mensagem_grafico",
            "Detalhamento da hora selecionada, com intervalos de 10 minutos. Clique novamente no bloco para voltar às 8 horas."
        );
    } else {
        if (titulo) {
            titulo.textContent = "Desempenho nas últimas 8 horas";
        }

        atualizarTexto(
            "mensagem_grafico",
            dados.length > 0
                ? "Histórico de CPU e RAM em intervalos de 10 minutos."
                : "Não existem leituras nas últimas 8 horas."
        );
    }

    const canvas = document.getElementById("grafico_desempenho");

    if (!canvas) return;

    if (graficoDesempenho) {
        graficoDesempenho.destroy();
    }

    const labels = dados.map(registro => {
        return new Date(registro.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    });

    graficoDesempenho = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "CPU",
                    data: dados.map(registro => registro.cpu),
                    borderColor: "#D500F9",
                    backgroundColor: "#D500F9",
                    borderWidth: 2,
                    tension: 0.35,
                    spanGaps: false
                },
                {
                    label: "RAM",
                    data: dados.map(registro => registro.ram),
                    borderColor: "#F5E500",
                    backgroundColor: "#F5E500",
                    borderWidth: 2,
                    tension: 0.35,
                    spanGaps: false
                },
                {
                    label: "Limite",
                    data: dados.map(() => 85),
                    borderColor: "#FF0055",
                    borderWidth: 1.5,
                    borderDash: [6, 6],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index"
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: "#FFFFFF80"
                    },
                    grid: {
                        color: "#FFFFFF15"
                    }
                },
                x: {
                    ticks: {
                        color: "#FFFFFF80"
                    },
                    grid: {
                        color: "#FFFFFF10"
                    }
                }
            }
        }
    });
}

function renderizarMetricas(metricas) {
    atualizarIndicador(metricas.cpu, "valor_cpu", "status_cpu", "barra_cpu");
    atualizarIndicador(metricas.ram, "valor_ram", "status_ram", "barra_ram");

    atualizarTexto("valor_rede_recebida", formatarNumero(metricas.rede?.recebida_mb));
    atualizarTexto("valor_rede_enviada", formatarNumero(metricas.rede?.enviada_mb));
    atualizarTexto("ultima_atualizacao", formatarData(metricas.ultima_atualizacao));

    renderizarStatus(metricas);

    historicoAtual = metricas.historico_10min || [];
    horaSelecionada = null;

    renderizarDisponibilidade(metricas.disponibilidade || []);
    atualizarGrafico();
}

function configurarTempoReal() {
    const botao = document.getElementById("btn_tempo_real");

    if (!botao) return;

    botao.addEventListener("click", () => {
        if (intervaloAtualizacao) {
            clearInterval(intervaloAtualizacao);
            intervaloAtualizacao = null;

            botao.innerHTML = '<i class="ph ph-play mr-1"></i> Ativar tempo real';
            atualizarTexto("status_atualizacao", "Atualização automática desativada");
            return;
        }

        if (!servidorSelecionado) return;

        intervaloAtualizacao = setInterval(() => {
            if (servidorSelecionado) {
                selecionarServidor(servidorSelecionado.id_servidor);
            }
        }, 60000);

        botao.innerHTML = '<i class="ph ph-pause mr-1"></i> Desativar tempo real';
        atualizarTexto("status_atualizacao", "Atualização automática a cada 60 segundos");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    configurarTempoReal();
    carregarServidores();
});
