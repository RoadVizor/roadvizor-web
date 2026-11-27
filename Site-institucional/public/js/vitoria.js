
document.addEventListener("DOMContentLoaded", function () {
    carregarServidores();
    carregarOcorrencias();

    const formulario = document.getElementById("form_vitoria");

    formulario.addEventListener("submit", cadastrarOcorrencia);
});

async function carregarServidores() {
    const select = document.getElementById("servidor_id");

    try {
        const resposta = await fetch("/api/vitoria/servidores", {
            credentials: "same-origin"
        });

        const servidores = await resposta.json();

        if (!resposta.ok) {
            throw new Error(servidores.mensagem || "Erro ao buscar servidores.");
        }

        select.innerHTML = '<option value="">Selecione um servidor</option>';

        servidores.forEach(function (servidor) {
            const option = document.createElement("option");
            option.value = servidor.id_servidor;
            option.textContent = servidor.apelido;
            select.appendChild(option);
        });

    } catch (erro) {
        console.error(erro);
        select.innerHTML = '<option value="">Erro ao carregar servidores</option>';
    }
}

async function carregarOcorrencias() {
    const tabela = document.getElementById("lista_ocorrencias");

    try {
        const resposta = await fetch("/api/vitoria", {
            credentials: "same-origin"
        });

        const ocorrencias = await resposta.json();

        if (!resposta.ok) {
            throw new Error(ocorrencias.mensagem || "Erro ao buscar ocorrências.");
        }

        tabela.innerHTML = "";

        if (ocorrencias.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-sm text-white/40">
                        Nenhuma ocorrência registrada.
                    </td>
                </tr>
            `;
            return;
        }

        ocorrencias.forEach(function (ocorrencia) {
            const linha = document.createElement("tr");
            linha.className = "border-b border-white/10";

            linha.innerHTML = `
                <td class="px-4 py-3 text-sm">${ocorrencia.servidor}</td>
                <td class="px-4 py-3 text-sm">${ocorrencia.tipo_ocorrencia}</td>
                <td class="px-4 py-3 text-sm">${ocorrencia.recurso_afetado}</td>
                <td class="px-4 py-3 text-sm">${ocorrencia.prioridade}</td>
                <td class="px-4 py-3 text-sm">${ocorrencia.status}</td>
                <td class="px-4 py-3 text-sm">${new Date(ocorrencia.data_registro).toLocaleString("pt-BR")}</td>
                <td class="px-4 py-3 text-sm">${ocorrencia.descricao}</td>
            `;

            tabela.appendChild(linha);
        });

    } catch (erro) {
        console.error("Erro ao carregar ocorrências:", erro);
    }
}

async function cadastrarOcorrencia(event) {
    event.preventDefault();

    const formulario = document.getElementById("form_vitoria");
    const botao = formulario.querySelector('button[type="submit"]');
    const mensagem = document.getElementById("mensagem_vitoria");

    const dados = {
        servidor_id: document.getElementById("servidor_id").value,
        tipo_ocorrencia: document.getElementById("tipo_ocorrencia").value,
        recurso_afetado: document.getElementById("recurso_afetado").value,
        prioridade: document.getElementById("prioridade").value,
        descricao: document.getElementById("descricao").value.trim()
    };

    try {
        botao.disabled = true;
        mensagem.textContent = "Registrando ocorrência...";

        const resposta = await fetch("/api/vitoria", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Erro ao registrar ocorrência.");
        }

        mensagem.textContent = "Ocorrência registrada com sucesso!";
        mensagem.className = "mt-3 text-sm text-[#00E58B]";

        formulario.reset();

        await carregarOcorrencias();

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        mensagem.textContent = erro.message;
        mensagem.className = "mt-3 text-sm text-red-400";
    } finally {
        botao.disabled = false;
    }
}
