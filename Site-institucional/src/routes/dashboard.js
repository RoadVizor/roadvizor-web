const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { verificarAutenticacao } = require("../middlewares/auth"); 
const router = express.Router()

router.get("/kpi/ativos/:id_empresa", dashboardController.kpiServidoresAtivos);
router.get("/kpi/usuarios/:id_empresa", dashboardController.listarUsuariosPorEmpresa);
router.get("/kpi/alertas/:id_empresa", dashboardController.listarStatusServidor);
router.get("/status/:id_empresa", dashboardController.listarStatusServidor);
router.get("/empresa/:id_empresa", dashboardController.buscarNomeEmpresa);
router.get("/lista/:id_empresa", dashboardController.listarServidores);
router.get("/detalhes/:id_empresa/:id_servidor", dashboardController.listarDetalhesServidor);
router.post("/cadastrar", dashboardController.cadastrarServidor);

module.exports = router;