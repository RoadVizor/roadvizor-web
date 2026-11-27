// variável que guarda inicialmente 5 colaboradores
let quantidadeExibida = 5;

// guarda o colaborador selecionado no modal
let colaboradorSelecionado = null;

// lista completa de colaboradores recebida do backend
let listaColaboradores = [];

// guarda o status selecionado no filtro
let statusSelecionados = "todos";

// lista de colaboradores depois da aplicação dos filtros
let colaboradoresFiltrados = [];

// variavel para o grafico
let graficoSituacao = null;

const API = {
    listar: "/api/usuarios/",                       // GET
    cadastrar: "/api/usuarios/cadastrar",                // POST
    editar: (id) => `/api/usuarios/${id}`,          // PUT
    status: (id) => `/api/usuarios/${id}/status`,   // PATCH
    excluir: (id) => `/api/usuarios/${id}`          // DELETE
};


document.addEventListener("DOMContentLoaded", function () {

    const formColaborador = document.getElementById("formColaborador");

    if (!formColaborador) {
        console.error("Formulário de colaborador não encontrado!");
        return;
    }

    // evita que textos com HTML sejam executados na tela
    function escapeHtml(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    // verifica se o colaborador está ativo
    function isAtivo(colaborador) {
        return colaborador.ativo === true ||
            colaborador.ativo === 1 ||
            colaborador.ativo === "1";
    }

    // transforma o número do nível no nome exibido
    function nomeNivel(nivel) {
        return Number(nivel) === 1 ? "Administrador" : "Colaborador";
    }

    // faz uma requisição ao backend e lança erro se algo der errado
    async function requisicao(url, metodo, corpo) {

        const resposta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: corpo ? JSON.stringify(corpo) : undefined
        });

        // alguns DELETE não devolvem corpo, por isso o catch
        const dados = await resposta.json().catch(function () {
            return {};
        });

        if (!resposta.ok) {
            throw new Error(dados.message || "Erro na requisição.");
        }

        return dados;
    }


    formColaborador.addEventListener("submit", async function (event) {
        event.preventDefault();

        // captura os valores dos campos pelo id no html
        const nome = document.getElementById("nomeColaborador").value;
        const cargo = document.getElementById("cargoColaborador").value;
        const email = document.getElementById("emailColaborador").value;
        const senha = document.getElementById("senhaColaborador").value;
        const nivel_acesso = Number(document.getElementById("nivelColaborador").value);

        try {

            // envia os dados para o backend
            const resposta = await fetch(API.cadastrar, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    nome: nome,
                    cargo: cargo,
                    email: email,
                    senha: senha,
                    nivel_acesso: nivel_acesso
                })
            });

            // transforma a resposta do backend em um objeto javascript
            const dados = await resposta.json();

            if (resposta.ok) {

                alert("Colaborador cadastrado com sucesso!");

                formColaborador.reset();
                fecharModalColaborador();

                // atualiza a lista de colaboradores
                listarColaboradores();

            } else {
                alert(dados.message || "Erro ao cadastrar colaborador.");
            }

        } catch (erro) {
            console.error("Erro ao cadastrar colaborador:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });

    // função responsável por buscar os colaboradores no backend
    async function listarColaboradores() {

        try {

            const resposta = await fetch(API.listar, {
                method: "GET",
                credentials: "include"
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || "Erro ao buscar colaboradores.");
            }

            // guarda os colaboradores recebidos do backend
            listaColaboradores = dados.result;

            // preenche o select de níveis (só na primeira vez)
            preencherNiveis();

            // reaplica busca, nível e status que já estavam selecionados
            // (assim, depois de editar alguém, os filtros não são perdidos)
            aplicarFiltros();

            // exibe os colaboradores na tabela
            renderizarColaboradores();

            // atualiza os números dos cards
            atualizarEstatisticas();

        } catch (erro) {
            console.error("Erro ao listar colaboradores:", erro);
        }
    }


    // executa a listagem quando a página carregar
    listarColaboradores();

    // carrega a kpi de situacao
    carregarKpiSituacao();


    // atualiza o contador e os cards de total e ativos
    function atualizarEstatisticas() {

        const total = listaColaboradores.length;
        const ativos = listaColaboradores.filter(isAtivo).length;

        const statTotal = document.getElementById("statTotal");
        const statAtivos = document.getElementById("statAtivos");
        const contador = document.getElementById("contador");

        if (statTotal) statTotal.textContent = total;
        if (statAtivos) statAtivos.textContent = ativos;
        if (contador) contador.textContent = `${total} colaboradores · ${ativos} ativos`;
    }

    async function carregarKpiSituacao() {
        try {

            // busca os dados dos chamados no Jira
            const resposta = await fetch("/api/jira/kpi/situacao", {
                method: "GET",
                credentials: "include"
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.message || "Erro ao buscar situação dos chamados."
                );
            }

            // guarda os dados retornados pelo backend
            const kpi = dados.resultado;

            // valores que serão exibidos nas barras
            const valores = [
                kpi.aFazer,
                kpi.emAndamento,
                kpi.resolvidos
            ];

            // busca o canvas do gráfico no HTML
            const canvas = document.getElementById("graficoSituacaoChamados");

            // verifica se o canvas existe
            if (!canvas) {
                throw new Error("Canvas do gráfico não encontrado no HTML.");
            }

            // pega o contexto do canvas
            const contexto = canvas.getContext("2d");

            // se o gráfico já existe, atualiza os valores
            if (graficoSituacao) {

                graficoSituacao.data.datasets[0].data = valores;

                graficoSituacao.update();

            } else {

                // cria o gráfico de barras
                graficoSituacao = new Chart(contexto, {

                    type: "bar",

                    data: {
                        labels: [
                            "A fazer",
                            "Em andamento",
                            "Resolvidos"
                        ],

                        datasets: [{
                            label: "Quantidade de chamados",

                            data: valores,

                            backgroundColor: [
                                "#60a5fa",
                                "#facc15",
                                "#28c76f"
                            ],

                            borderRadius: 8,
                            borderSkipped: false
                        }]
                    },

                    options: {
                        responsive: true,
                        maintainAspectRatio: false,

                        plugins: {
                            legend: {
                                display: false
                            },

                            tooltip: {
                                callbacks: {
                                    label: function (contexto) {
                                        return `${contexto.raw} chamados`;
                                    }
                                }
                            }
                        },

                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },

                                ticks: {
                                    color: "#eaf4fb"
                                },

                                border: {
                                    display: false
                                }
                            },

                            y: {
                                beginAtZero: true,

                                ticks: {
                                    color: "#eaf4fb",
                                    precision: 0
                                },

                                grid: {
                                    color: "rgba(234, 244, 251, 0.08)"
                                },

                                border: {
                                    display: false
                                }
                            }
                        }
                    }

                });

            }

        } catch (erro) {

            console.error("Erro ao carregar gráfico de situação:", erro);

        }
    }

    async function carregarKpiResolvidos() {

        try {

            // busca os indicadores de chamados no backend
            const resposta = await fetch("/api/jira/kpi/resolvidos", {
                method: "GET",
                credentials: "include"
            });

            // transforma a resposta em objeto javascript
            const dados = await resposta.json();

            // verifica se o backend retornou algum erro
            if (!resposta.ok) {
                throw new Error(
                    dados.message || "Erro ao buscar KPI do Jira."
                );
            }

            // recebe os indicadores retornados pelo controller
            const kpi = dados.resultado;

            // captura os elementos dos cards no HTML
            const statResolvidos = document.getElementById("statResolvidos");

            const statTotalChamados = document.getElementById(
                "statTotalChamados"
            );

            const statPercentualResolvidos = document.getElementById(
                "statPercentualResolvidos"
            );

            // atualiza a quantidade de chamados resolvidos
            if (statResolvidos) {
                statResolvidos.textContent = kpi.resolvidos;
            }

            // atualiza a quantidade total de chamados
            if (statTotalChamados) {
                statTotalChamados.textContent = kpi.total;
            }

            // atualiza o percentual de chamados resolvidos
            if (statPercentualResolvidos) {
                statPercentualResolvidos.textContent = kpi.percentual;
            }

        } catch (erro) {

            console.error("Erro ao carregar KPI do Jira:", erro);

        }
    }

    // carrega os indicadores do Jira quando a página carregar
    carregarKpiResolvidos();

    // carrega a KPI de tempo médio de resolução
    carregarKpiTempoMedioResolucao();

    // busca a KPI de tempo médio de resolução
async function carregarKpiTempoMedioResolucao() {

    try {

        // consulta a API do Jira
        const resposta = await fetch(
            "/api/jira/kpi/tempo-medio-resolucao",
            {
                method: "GET",
                credentials: "include"
            }
        );

        // converte a resposta para JSON
        const dados = await resposta.json();

        // verifica se a resposta foi bem-sucedida
        if (!resposta.ok) {
            throw new Error(
                dados.message || "Erro ao buscar tempo médio de resolução."
            );
        }

        // captura os dados da KPI
        const kpi = dados.resultado;

        // seleciona o elemento do HTML
        const elemento = document.getElementById(
            "kpiTempoMedioResolucao"
        );

        // verifica se o elemento existe
        if (!elemento) {
            throw new Error("Elemento da KPI não encontrado no HTML.");
        }

        // exibe o tempo médio em dias
        elemento.textContent = `${kpi.tempoMedioDias.toLocaleString("pt-BR")} dias`;

    } catch (erro) {

        console.error(
            "Erro ao carregar KPI de tempo médio de resolução:",
            erro
        );

    }
}

    // função responsável por montar a tabela de colaboradores
    function renderizarColaboradores() {

        const tabela = document.getElementById("tabela");

        // limpa a tabela antes de montar novamente
        tabela.innerHTML = "";

        // limita a quantidade de colaboradores exibidos
        const colaboradoresExibidos =
            colaboradoresFiltrados.slice(0, quantidadeExibida);

        // percorre cada colaborador da lista filtrada
        colaboradoresExibidos.forEach(function (colaborador) {

            // transforma a data de admissão para o formato brasileiro
            const dataAdmissao = colaborador.criado_em
                ? new Date(colaborador.criado_em).toLocaleDateString("pt-BR")
                : "—";

            const ativo = isAtivo(colaborador);

            // cria uma nova linha na tabela
            const linha = document.createElement("tr");

            // monta as células da linha
            linha.innerHTML = `
                <td class="px-5 py-4">
                    ${escapeHtml(colaborador.nome)}
                    <br>
                    <span class="text-muted">
                        ${escapeHtml(colaborador.email)}
                    </span>
                </td>
 
                <td class="px-5 py-4">
                    ${escapeHtml(colaborador.cargo) || "—"}
                </td>
 
                <td class="px-5 py-4">
                    ${nomeNivel(colaborador.nivel_acesso)}
                </td>
 
                <td class="px-5 py-4">
                    ${ativo ? "Ativo" : "Inativo"}
                </td>
 
                <td class="px-5 py-4">
                    ${dataAdmissao}
                </td>
 
                <td class="px-5 py-4">
                    <button
                        type="button"
                        onclick="abrirModalGerenciar(${colaborador.id_usuario})"
                        class="rounded-lg border border-secondary/20 bg-surface/85 px-3 py-2 text-sm font-bold text-accent transition hover:border-accent">
                        Gerenciar
                    </button>
                </td>
            `;

            // adiciona a linha criada dentro da tabela
            tabela.appendChild(linha);
        });
    }


    // função que aumenta a quantidade de colaboradores exibidos em 5
    function verMais() {

        quantidadeExibida += 5;

        // atualiza a tabela com mais colaboradores
        renderizarColaboradores();
    }

    window.verMais = verMais;


    // aplica busca, nível e status na lista (sem redesenhar a tabela)
    function aplicarFiltros() {

        // captura o texto digitado na busca
        const busca = String(
            document.getElementById("busca").value
        ).toLowerCase().trim();

        // captura o nível selecionado
        const nivel = document.getElementById("nivel").value;

        // percorre a lista completa e mantém apenas os colaboradores
        // que correspondem aos filtros selecionados
        colaboradoresFiltrados = listaColaboradores.filter(function (colaborador) {

            const nome = String(colaborador.nome).toLowerCase();
            const email = String(colaborador.email).toLowerCase();
            const cargo = String(colaborador.cargo || "").toLowerCase();

            // verifica se o texto digitado aparece no nome, email ou cargo
            const correspondeBusca =
                nome.includes(busca) ||
                email.includes(busca) ||
                cargo.includes(busca);

            // verifica se o nível de acesso corresponde ao selecionado
            const correspondeNivel =
                nivel === "" ||
                String(colaborador.nivel_acesso) === nivel;

            const ativo = isAtivo(colaborador);

            // verifica se o status corresponde ao botão selecionado
            const correspondeStatus =
                statusSelecionados === "todos" ||
                (statusSelecionados === "ativo" && ativo) ||
                (statusSelecionados === "inativo" && !ativo);

            // retorna verdadeiro somente se todos os filtros corresponderem
            return correspondeBusca &&
                correspondeNivel &&
                correspondeStatus;
        });
    }


    // função chamada pelos campos de filtro do html
    function filtrar() {

        aplicarFiltros();

        // volta a exibir inicialmente 5 colaboradores
        quantidadeExibida = 5;

        // atualiza a tabela com os resultados
        renderizarColaboradores();
    }


    // função que seleciona o filtro de status
    function filtrarStatus(botao) {

        // guarda o status selecionado pelo botão
        statusSelecionados = botao.dataset.status;

        // atualiza a aparência de todos os botões de status
        document.querySelectorAll("[data-status]").forEach(function (item) {

            item.classList.remove(
                "border-accent",
                "bg-accent/15",
                "text-accent"
            );

            item.classList.add(
                "border-secondary/20",
                "bg-surface/85"
            );
        });

        // destaca o botão selecionado
        botao.classList.add(
            "border-accent",
            "bg-accent/15",
            "text-accent"
        );

        botao.classList.remove(
            "border-secondary/20",
            "bg-surface/85"
        );

        // aplica o filtro selecionado
        filtrar();
    }


    // função que limpa os filtros de busca
    function limparFiltros() {

        // limpa o campo de busca
        document.getElementById("busca").value = "";

        // volta o select para todos os níveis
        document.getElementById("nivel").value = "";

        // encontra o botão de status todos
        const botaoTodos = document.querySelector('[data-status="todos"]');

        // seleciona o botão todos e atualiza a tabela
        filtrarStatus(botaoTodos);
    }


    // função que preenche o select de níveis de acesso
    function preencherNiveis() {

        const selectNivel = document.getElementById("nivel");

        // se já foi preenchido, não preenche de novo
        // (senão o nível escolhido no filtro seria apagado a cada recarga)
        if (selectNivel.options.length > 1) return;

        selectNivel.innerHTML = `
            <option value="">Todos os níveis</option>
            <option value="1">Administrador</option>
            <option value="2">Colaborador</option>
        `;
    }

    // preenche o topo do modal e a aba de status
    // de acordo com o colaborador selecionado
    function atualizarCabecalhoGerenciar() {

        const c = colaboradorSelecionado;
        const ativo = isAtivo(c);

        // nome e informações do colaborador
        document.getElementById("gerNome").textContent = c.nome;
        document.getElementById("gerInfo").textContent =
            `${c.cargo || "—"} · ${nomeNivel(c.nivel_acesso)}`;

        // selo de status (Ativo / Inativo)
        const badge = document.getElementById("gerBadge");

        badge.textContent = ativo ? "Ativo" : "Inativo";

        badge.className =
            "shrink-0 rounded-full border px-3 py-1 text-xs font-bold " +
            (ativo
                ? "border-accent/50 text-accent"
                : "border-secondary/30 text-muted");

        // texto explicativo da aba status
        document.getElementById("gerStatusTexto").textContent = ativo
            ? "Ao inativar, o colaborador perde o acesso ao painel, mas continua na lista e mantém o histórico de atendimentos."
            : "Este colaborador está inativo. Ao reativar, o acesso ao painel é liberado de novo com o mesmo nível.";

        // botão de status muda de texto e de cor
        const btn = document.getElementById("btnStatus");

        btn.textContent = ativo ? "Inativar colaborador" : "Reativar colaborador";

        btn.className =
            "rounded-lg px-4 py-3 text-sm font-bold text-background hover:brightness-110 " +
            (ativo ? "bg-chart-4" : "bg-accent");
    }


    // função que abre o modal de gerenciamento
    // recebe o id do colaborador clicado na tabela
    function abrirModalGerenciar(id) {

        // procura o colaborador pelo id na lista
        // (compara como texto para evitar diferença entre número e string)
        colaboradorSelecionado = listaColaboradores.find(function (colaborador) {
            return String(colaborador.id_usuario) === String(id);
        });

        // verifica se encontrou o colaborador
        if (!colaboradorSelecionado) {
            console.error("Colaborador não encontrado!");
            return;
        }

        const c = colaboradorSelecionado;

        // preenche os campos do formulário de edição
        document.getElementById("gerCargo").value = c.cargo || "";
        document.getElementById("gerNivel").value = c.nivel_acesso;

        // nome no aviso da aba excluir
        document.getElementById("gerExNome").textContent = c.nome;

        // preenche o cabeçalho e a aba status
        atualizarCabecalhoGerenciar();

        // abre inicialmente a aba de edição
        trocarAbaGerenciar("editar");

        // mostra o modal
        const modal = document.getElementById("modalGerenciar");
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }


    // função que fecha o modal de gerenciamento
    function fecharModalGerenciar() {

        const modal = document.getElementById("modalGerenciar");

        modal.classList.add("hidden");
        modal.classList.remove("flex");

        // limpa o colaborador selecionado
        colaboradorSelecionado = null;
    }


    // função que troca entre as abas do modal
    // recebe o nome da aba selecionada
    function trocarAbaGerenciar(abaSelecionada) {

        // marca a aba clicada como selecionada
        // (o css do tailwind usa aria-selected para pintar a aba)
        document.querySelectorAll("#modalGerenciar [data-aba]").forEach(function (aba) {
            aba.setAttribute("aria-selected", aba.dataset.aba === abaSelecionada);
        });

        // mostra só o painel da aba selecionada
        document.querySelectorAll("#modalGerenciar [data-painel]").forEach(function (painel) {

            const mostrar = painel.dataset.painel === abaSelecionada;

            painel.classList.toggle("hidden", !mostrar);

            // o formulário de edição não precisa de flex,
            // só os painéis de status e exclusão (que são div)
            if (painel.tagName === "DIV") {
                painel.classList.toggle("flex", mostrar);
            }
        });
    }


    // salvar cargo e nível de acesso
    document.getElementById("formGerenciar").addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!colaboradorSelecionado) return;

        const id = colaboradorSelecionado.id_usuario;

        try {

            await requisicao(API.editar(id), "PUT", {
                cargo: document.getElementById("gerCargo").value.trim(),
                nivel_acesso: Number(document.getElementById("gerNivel").value)
            });

            fecharModalGerenciar();

            // busca a lista de novo para mostrar os dados atualizados
            await listarColaboradores();

        } catch (erro) {
            console.error("Erro ao atualizar colaborador:", erro);
            alert(erro.message || "Não foi possível atualizar o colaborador.");
        }
    });


    // inativar ou reativar o colaborador
    async function alternarStatusColaborador() {

        if (!colaboradorSelecionado) return;

        const id = colaboradorSelecionado.id_usuario;
        const novoStatus = !isAtivo(colaboradorSelecionado);

        try {

            await requisicao(API.status(id), "PATCH", {
                ativo: novoStatus
            });

            fecharModalGerenciar();
            await listarColaboradores();

        } catch (erro) {
            console.error("Erro ao alterar status:", erro);
            alert(erro.message || "Não foi possível alterar o status.");
        }
    }


    // excluir o colaborador
    async function excluirColaborador() {

        if (!colaboradorSelecionado) return;

        const id = colaboradorSelecionado.id_usuario;

        try {

            await requisicao(API.excluir(id), "DELETE");

            fecharModalGerenciar();
            await listarColaboradores();

        } catch (erro) {
            console.error("Erro ao excluir colaborador:", erro);
            alert(erro.message || "Não foi possível excluir o colaborador.");
        }
    }


    // tecla Esc fecha o modal
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") fecharModalGerenciar();
    });

    // clicar no fundo escuro (fora do card) também fecha o modal
    document.getElementById("modalGerenciar").addEventListener("click", function (event) {
        if (event.target.id === "modalGerenciar") fecharModalGerenciar();
    });


    // permite que o html chame as funções dos filtros
    window.filtrarStatus = filtrarStatus;
    window.filtrar = filtrar;
    window.limparFiltros = limparFiltros;

    // permite que o html chame as funções do modal
    window.abrirModalGerenciar = abrirModalGerenciar;
    window.fecharModalGerenciar = fecharModalGerenciar;
    window.trocarAbaGerenciar = trocarAbaGerenciar;
    window.alternarStatusColaborador = alternarStatusColaborador;
    window.excluirColaborador = excluirColaborador;

});
