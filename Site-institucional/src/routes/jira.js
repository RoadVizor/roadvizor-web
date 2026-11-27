const express = require("express");
const router = express.Router();

const jiraController = require("../controllers/jiraController");

// buscar chamados do jira
router.get("/chamados", function (req, res) {
    jiraController.buscarChamados(req, res);
});

//Buscar kpis de chamados resolvidos
router.get("/kpi/resolvidos", function(req, res){
    jiraController.buscarKpiResolvidos(req, res)
});


// Busca a situação dos chamados
router.get("/kpi/situacao", function(req, res){
    jiraController.buscarKpiSituacao(req, res)
});

// ROta para tempo medio de resolução dos chamados da equipe
router.get("/kpi/tempo-medio-resolucao", function(req, res){
    jiraController.buscarKpiTempoMedioResolucao(req, res)
})


module.exports = router;