const empresaModel = require("../models/empresaModel");

// busca as credenciais da empresa no banco
async function buscarConfiguracaoJira(empresaId) {
    const resultado = await empresaModel.buscarPorID(empresaId);

    if (resultado.length === 0) {
        throw new Error("Empresa não encontrada.");
    }

    return resultado[0];
}

// cria a autenticação do Jira
function criarAutenticacao(empresa) {
    return Buffer
        .from(`${empresa.email_jira}:${empresa.api_token_jira}`)
        .toString("base64");
}

// consulta os chamados do Jira
async function consultarJira(empresa, corpo) {
    const autenticacao = criarAutenticacao(empresa);

    const resposta = await fetch(
        `${empresa.domain_jira}/rest/api/3/search/jql`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${autenticacao}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(corpo)
        }
    );

    if (!resposta.ok) {
        const erro = await resposta.text();

        throw new Error(`Erro Jira ${resposta.status}: ${erro}`);
    }

    return resposta.json();
}

// busca os 5 chamados mais recentes
async function buscarChamados(empresaId) {
    const empresa = await buscarConfiguracaoJira(empresaId);

    const dados = await consultarJira(empresa, {
        jql: `project = ${empresa.project_key} ORDER BY created DESC`,
        fields: [
            "summary",
            "status",
            "assignee",
            "resolutiondate",
            "created"
        ],
        maxResults: 5
    });

    return dados.issues;
}

// busca a KPI de chamados resolvidos nos últimos 30 dias
async function buscarKpiResolvidos(empresaId) {
    const empresa = await buscarConfiguracaoJira(empresaId);

    const chamados = [];
    let nextPageToken = null;

    // consulta todas as páginas de chamados
    do {
        const corpo = {
            jql: `project = ${empresa.project_key} AND created >= -30d ORDER BY created DESC`,
            fields: [
                "created",
                "resolutiondate",
                "status"
            ],
            maxResults: 100
        };

        if (nextPageToken) {
            corpo.nextPageToken = nextPageToken;
        }

        const dados = await consultarJira(empresa, corpo);

        chamados.push(...dados.issues);

        nextPageToken = dados.nextPageToken;

    } while (nextPageToken);

    // total de chamados criados nos últimos 30 dias
    const total = chamados.length;

    // conta quantos chamados existem em cada categoria de status
const categorias = {};

chamados.forEach(function (chamado) {
    const categoria = chamado.fields.status.statusCategory.key;

    if (categorias[categoria] === undefined) {
        categorias[categoria] = 0;
    }

    categorias[categoria]++;
});

console.log("Categorias dos chamados:", categorias);

    // conta os chamados que possuem data de resolução
    const resolvidos = chamados.filter(function (chamado) {
        return chamado.fields.resolutiondate !== null;
    }).length;

    // calcula o percentual de resolução
    const percentual = total > 0
        ? Math.round((resolvidos / total) * 100)
        : 0;

    return {
        total,
        resolvidos,
        percentual
    };
}

module.exports = {
    buscarChamados,
    buscarKpiResolvidos
};