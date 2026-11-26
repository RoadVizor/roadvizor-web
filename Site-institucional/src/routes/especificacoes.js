const express = require("express");
const especificacoesController = require("../controllers/especificacoesController");

const router = express.Router();

router.get("/servidores", function (req, res) {
    especificacoesController.buscarServidores(req, res);
});

router.get("/servidores/:id/metricas", function (req, res) {
    especificacoesController.buscarMetricasServidor(req, res);
});

router.get("/servidores/:id", function (req, res) {
    especificacoesController.buscarServidorPorID(req, res);
});

module.exports = router;
