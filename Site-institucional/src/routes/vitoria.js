const express = require("express");
const vitoriaController = require("../controllers/vitoriaController");

const router = express.Router();

router.get("/servidores", function (req, res) {
    vitoriaController.buscarServidores(req, res);
});

router.get("/", function (req, res) {
    vitoriaController.buscarOcorrencias(req, res);
});

router.post("/", function (req, res) {
    vitoriaController.cadastrarOcorrencia(req, res);
});

module.exports = router;
