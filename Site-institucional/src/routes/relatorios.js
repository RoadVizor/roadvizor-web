const express = require("express");
const relatorioController = require("../controllers/relatorioController");
const { verificarAutenticacao } = require("../middlewares/auth");

const router = express.Router();

router.get("/servidores", verificarAutenticacao, function (req, res) {
    relatorioController.buscarServidores(req, res);
});

router.post("/", verificarAutenticacao, function (req, res) {
    relatorioController.cadastrar(req, res);
});

router.get("/", verificarAutenticacao, function (req, res) {
    relatorioController.buscarRelatorios(req, res);
});

module.exports = router;
