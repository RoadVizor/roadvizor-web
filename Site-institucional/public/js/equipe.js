// Variavel que guarda inicialmente 5 colaboradores
let quantidadeExibida = 5;

let listaColaboradores = [];
let statusSelecionados = "todos";
let colaboradoresFiltrados = [];


document.addEventListener("DOMContentLoaded", function () {

    const formColaborador = document.getElementById("formColaborador");

    if (!formColaborador) {
        console.error("Formulário de colaborador não encontrado!");
        return;
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
            const resposta = await fetch("/equipe", {
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


    async function listarColaboradores() {
        try {
            const resposta = await fetch("/api/usuarios/", {
                method: "GET",
                credentials: "include"
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || "Erro ao buscar colaboradores.");
            }

            //Guarda os colaboradores recebidos no backend
            listaColaboradores = dados.result;
            preencherNiveis();
            colaboradoresFiltrados = listaColaboradores;
            //exibe os colaborades na tela
            renderizarColaboradores();

        } catch (erro) {
            console.error("Erro ao listar colaboradores:", erro);
        }
    }

    // executa a listagem quando a página carregar
    listarColaboradores();




    //recebe a lista de colaboradores
    //percorre cada elemento do array
    // criando uma tabela com nome, email, cargo etc
    //adiciona esse linha no html
    function renderizarColaboradores() {
        const tabela = document.getElementById("tabela");

        tabela.innerHTML = "";

        const colaboradoresExibidos = colaboradoresFiltrados.slice(0, quantidadeExibida);

        colaboradoresExibidos.forEach(function (colaborador) {

            const dataAdmissao = colaborador.criado_em
                ? new Date(colaborador.criado_em).toLocaleDateString("pt-BR")
                : "—";

            const linha = document.createElement("tr");

            linha.innerHTML = `
            <td class="px-5 py-4">
                ${colaborador.nome}
                <br>
                <span class="text-muted">${colaborador.email}</span>
            </td>

            <td class="px-5 py-4">
                ${colaborador.cargo}
            </td>

            <td class="px-5 py-4">
                ${colaborador.nivel_acesso == 1 ? "Administrador" : "Colaborador"}
            </td>

            <td class="px-5 py-4">
                ${colaborador.ativo ? "Ativo" : "Inativo"}
            </td>

            <td class="px-5 py-4">
                ${dataAdmissao}
            </td>

            <td class="px-5 py-4">
                <button class="text-accent">Editar</button>
            </td>
        `;

            tabela.appendChild(linha);
        });
    }

    //função que aumenta a quantidade de colaboradores exibidos em 5
    //e atualiza a tabela com novos colaboradores
    function verMais() {
        quantidadeExibida += 5;

        renderizarColaboradores();
    }

    window.verMais = verMais;



    // Essa função pega os valores filtrados e verifica cada colaborador 
    // ou seja se você digitar alguma coisa ela vai procurar no nome, email ou cargo
    function filtrar() {
        const busca = String(document.getElementById("busca").value).toLowerCase().trim();
        const nivel = document.getElementById("nivel").value;


        colaboradoresFiltrados = listaColaboradores.filter(function (colaborador) {

            const nome = String(colaborador.nome).toLowerCase();
            const email = String(colaborador.email).toLowerCase();
            const cargo = String(colaborador.cargo || "").toLowerCase();

            const correspondeBusca = nome.includes(busca) ||
                email.includes(busca) ||
                cargo.includes(busca);

            const correspondeNivel = nivel === "" || String(colaborador.nivel_acesso) === nivel;

            const ativo =
                colaborador.ativo === true ||
                colaborador.ativo === 1 ||
                colaborador.ativo === "1";

            const correspondeStatus =
                statusSelecionados === "todos" ||
                (statusSelecionados === "ativo" && ativo) ||
                (statusSelecionados === "inativo" && !ativo);

            return correspondeBusca && correspondeNivel && correspondeStatus;
        });

        quantidadeExibida = 5;

        renderizarColaboradores();
    }


    // a função vai ler o atributo data-status = "Ativo" do botao
    // com isso ela guarda esse valor em statusSelecionados
    // e chama a função filtrar()
    function filtrarStatus(botao) {
        statusSelecionados = botao.dataset.status;

        // atualiza a aparência dos botões
        document.querySelectorAll("[data-status]").forEach(function (item) {
            item.classList.remove("border-accent", "bg-accent/15", "text-accent");

            item.classList.add("border-secondary/20", "bg-surface/85");
        });

        botao.classList.add("border-accent", "bg-accent/15", "text-accent");

        botao.classList.remove("border-secondary/20", "bg-surface/85");

        // aplica o filtro selecionado
        filtrar();
    }

    // essa função limpa os filtros de busca
    // volta o select para o status "Todos"
    // encontra o botao e seleciona esse status 
    function  limparFiltros(){
        document.getElementById("busca").value = "";
        document.getElementById("nivel").value = "";
        
        const botaoTodos = document.querySelector('[data-status="todos"]');

        filtrarStatus(botaoTodos);
    }

    //essa função filtra os colaborador pelo nivel de acesso
    function preencherNiveis(){
        const selectNivel = document.getElementById("nivel")

        selectNivel.innerHTML = `
        <option value="">Todos os níveis</option>
        <option value="1">Administrador</option>
        <option value="2">Colaborador</option>
        `
    }

    window.filtrarStatus = filtrarStatus;
    window.filtrar = filtrar;
    window.limparFiltros = limparFiltros;
});