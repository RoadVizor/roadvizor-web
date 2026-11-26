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
//
module.exports = router;