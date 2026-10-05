const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { verificarAutenticacao } = require("../middlewares/auth"); 
const router = express.Router()

router.get("/kpi/ativos/:id_empresa", verificarAutenticacao, dashboardController.kpiServidoresAtivos);
router.get("/kpi/usuarios/:id_empresa", verificarAutenticacao, dashboardController.listarUsuariosPorEmpresa);
router.get("/kpi/alertas/:id_empresa", verificarAutenticacao, dashboardController.listarStatusServidor);
router.get("/status/:id_empresa", verificarAutenticacao, dashboardController.listarStatusServidor);
router.get("/empresa/:id_empresa", verificarAutenticacao, dashboardController.buscarNomeEmpresa);
router.get("/lista/:id_empresa", verificarAutenticacao, dashboardController.listarServidores);
router.get("/detalhes/:id_empresa/:id_servidor", verificarAutenticacao, dashboardController.listarDetalhesServidor);
router.post("/cadastrar", verificarAutenticacao, dashboardController.cadastrarServidor);

module.exports = router;