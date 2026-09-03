const express = require("express");
const empresaController = require("../controllers/empresaController");

const router = express.Router();

// === POST - CRIAÇÃO === //
router.post("/", function (req, res) {
  empresaController.cadastrar(req, res);
});

// === GET - BUSCA POR ID === //
router.get("/:empresaId", function (req, res) {
  empresaController.buscarPorID(req, res);
});

module.exports = router;
