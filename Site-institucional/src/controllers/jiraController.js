const jiraService = require("../services/jiraServices");

async function buscarChamados(req, res) {
    try {
        // identifica a empresa do usuário autenticado
        const empresaId = req.usuario.empresa_id;

        // busca os chamados da empresa no Jira
        const chamados = await jiraService.buscarChamados(empresaId);

        res.status(200).json({
            message: "Chamados do Jira encontrados.",
            quantidade: chamados.length,
            resultado: chamados
        });

    } catch (erro) {
        console.error("Erro ao buscar chamados do Jira:", erro.message);

        res.status(500).json({
            message: "Não foi possível buscar os chamados do Jira."
        });
    }
}

async function buscarKpiResolvidos(req, res) {
try {
// identifica a empresa do usuário autenticado
const empresaId = req.usuario.empresa_id;

    // busca os dados da kpi no Jira
    const kpi = await jiraService.buscarKpiResolvidos(empresaId);

    res.status(200).json({
        message: "KPI de chamados resolvidos encontrada.",
        resultado: kpi
    });

} catch (erro) {
    console.error("Erro ao buscar KPI de chamados resolvidos:", erro);

    res.status(500).json({
        message: "Não foi possível buscar a KPI de chamados resolvidos."
    });
}

}

async function  buscarKpiSituacao(req, res) {
    try{
         // identifica a empresa do usuário autenticado
        const empresaId = req.usuario.empresa_id;

        // busca a situação dos chamados no Jira
        const kpi = await jiraService.buscarKpiSituacao(empresaId);

        res.status(200).json({
            message: "KPI de situação dos chamados encontrada.",
            resultado: kpi
        });

    } catch (erro) {

        console.error("Erro ao buscar KPI de situação dos chamados:", erro);

        res.status(500).json({
            message: "Não foi possível buscar a KPI de situação dos chamados."
        });
    }
    
}

module.exports = {
    buscarChamados,
    buscarKpiResolvidos,
    buscarKpiSituacao
};