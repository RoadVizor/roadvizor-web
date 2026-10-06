const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { verificarAutenticacao } = require("../middlewares/auth"); 
const router = express.Router()

router.get("/kpi/ativos/:id_empresa", verificarAutenticacao, dashboardController.kpiServidoresAtivos);

router.get("/kpi/usuarios/:id_empresa", verificarAutenticacao, dashboardController.listarUsuariosPorEmpresa);

router.get("/kpi/alerta/:id_empresa", verificarAutenticacao, dashboardController.kpiAlertasRecentes)

module.exports = router;