const express = require("express");
const empresaController = require("../controllers/empresaController");
const servidorRouter = require("./servidor");

const router = express.Router();

router.post("/", function (req, res) {
  empresaController.cadastrar(req, res);
});

router.get("/:empresaId", function (req, res) {
  empresaController.buscarPorID(req, res);
});

// Rotas de Servidor dentro de Empresa
router.use("/:empresaId/servidores", servidorRouter);

module.exports = router;
