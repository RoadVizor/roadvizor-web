require("dotenv").config({ path: ".env.dev" });

const jiraService = require("./src/services/jiraServices");

async function testar() {
    try {
        const chamados = await jiraService.buscarChamados(2);

        console.log("Conexão com Jira realizada!");
        console.log(`Chamados encontrados: ${chamados.length}`);

        chamados.forEach(function (chamado) {
            console.log("--------------------");
            console.log("Código:", chamado.key);
            console.log("Resumo:", chamado.fields.summary);
            console.log("Status:", chamado.fields.status.name);
            console.log(
                "Responsável:",
                chamado.fields.assignee?.displayName || "Não atribuído"
            );
        });

    } catch (erro) {
        console.error("Erro ao conectar com Jira:");
        console.error(erro.message);
    }
}

testar();