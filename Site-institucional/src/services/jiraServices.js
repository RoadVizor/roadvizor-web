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

// busca a KPI de situação dos chamados nos últimos 30 dias
async function buscarKpiSituacao(empresaId) {

    // busca as configurações da empresa
    const empresa = await buscarConfiguracaoJira(empresaId);

    // lista que armazenará todos os chamados encontrados
    const chamados = [];

    // guarda o token da próxima página
    let nextPageToken = null;

    // consulta todas as páginas de chamados
    do {

        const corpo = {
            jql: `project = ${empresa.project_key} AND created >= -30d ORDER BY created DESC`,
            fields: [
                "created",
                "status",
                "resolutiondate"
            ],
            maxResults: 100
        };

        // adiciona o token quando existir uma próxima página
        if (nextPageToken) {
            corpo.nextPageToken = nextPageToken;
        }

        // consulta o Jira
        const dados = await consultarJira(empresa, corpo);

        // adiciona os chamados encontrados à lista
        chamados.push(...dados.issues);

        // atualiza o token da próxima página
        nextPageToken = dados.nextPageToken;

    } while (nextPageToken);


    // total de chamados encontrados
    const total = chamados.length;

    // inicializa os contadores
    let aFazer = 0;
    let emAndamento = 0;
    let resolvidos = 0;


    // percorre os chamados e conta por categoria
    chamados.forEach(function (chamado) {

        // captura a categoria do status no Jira
        const categoria = chamado.fields.status.statusCategory.key;

        // categoria new: chamados a fazer
        if (categoria === "new") {
            aFazer++;
        }

        // categoria indeterminate: chamados em andamento
        else if (categoria === "indeterminate") {
            emAndamento++;
        }

        // categoria done: chamados resolvidos
        else if (categoria === "done") {
            resolvidos++;
        }

    });


    // retorna os indicadores para o controller
    return {
        total,
        aFazer,
        emAndamento,
        resolvidos
    };
}

// busca a KPI de tempo médio de resolução dos últimos 30 dias
async function buscarKpiTempoMedioResolucao(empresaId) {

    // busca as configurações da empresa
    const empresa = await buscarConfiguracaoJira(empresaId);

    // lista que armazenará todos os chamados encontrados
    const chamados = [];

    // guarda o token da próxima página
    let nextPageToken = null;

    // consulta todas as páginas de chamados resolvidos
    do {

        const corpo = {
            jql: `project = ${empresa.project_key} AND resolutiondate >= -30d AND resolutiondate IS NOT EMPTY ORDER BY resolutiondate DESC`,
            fields: [
                "created",
                "resolutiondate"
            ],
            maxResults: 100
        };

        // adiciona o token quando existir uma próxima página
        if (nextPageToken) {
            corpo.nextPageToken = nextPageToken;
        }

        // consulta o Jira
        const dados = await consultarJira(empresa, corpo);

        // adiciona os chamados encontrados à lista
        chamados.push(...dados.issues);

        // atualiza o token da próxima página
        nextPageToken = dados.nextPageToken;

    } while (nextPageToken);


    // armazena a soma dos tempos de resolução em milissegundos
    let somaTempoResolucao = 0;

    // conta os chamados que possuem datas válidas
    let totalChamadosValidos = 0;

    // percorre os chamados encontrados
    chamados.forEach(function (chamado) {

        // captura a data de criação
        const dataCriacao = new Date(chamado.fields.created);

        // captura a data de resolução
        const dataResolucao = new Date(chamado.fields.resolutiondate);

        // calcula o tempo entre criação e resolução
        const tempoResolucao = dataResolucao - dataCriacao;

        // verifica se as datas são válidas
        if (
            !isNaN(dataCriacao.getTime()) &&
            !isNaN(dataResolucao.getTime()) &&
            tempoResolucao >= 0
        ) {

            // soma o tempo de resolução
            somaTempoResolucao += tempoResolucao;

            // contabiliza o chamado válido
            totalChamadosValidos++;
        }

    });


    // calcula o tempo médio em milissegundos
    const tempoMedioMilissegundos = totalChamadosValidos > 0
        ? somaTempoResolucao / totalChamadosValidos
        : 0;

    // converte o tempo médio para horas
    const tempoMedioHoras = tempoMedioMilissegundos / (1000 * 60 * 60);

    // converte o tempo médio para dias
    const tempoMedioDias = tempoMedioHoras / 24;


    // retorna os indicadores para o controller
    return {
        totalChamados: totalChamadosValidos,
        tempoMedioHoras: Number(tempoMedioHoras.toFixed(1)),
        tempoMedioDias: Number(tempoMedioDias.toFixed(1))
    };
}

module.exports = {
    buscarChamados,
    buscarKpiResolvidos,
    buscarKpiSituacao,
    buscarKpiTempoMedioResolucao
};