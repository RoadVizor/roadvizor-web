const express = require("express");
const servidorController = require("../controllers/servidorController");

// AVISO: { mergeParams: true } é o que permite que {:empresaId}
// seja reconhecido pelo endpoint.
const router = express.Router({ mergeParams: true });

// === POST - CRIAÇÃO === //
router.post("/", function (req, res) {
  servidorController.cadastrar(req, res);
});

// === GET - BUSCA (TODOS) === //
router.get("/", function (req, res) {
  servidorController.buscar(req, res);
});

// === GET - BUSCA POR ID === //
router.get("/:servidorId", function (req, res) {
  servidorController.buscarPorID(req, res);
});

// === PUT - ATUALIZAÇÃO === //
router.put("/:servidorId", function (req, res) {
  servidorController.editar(req, res);
});

// === DELETE - REMOÇÃO === //
router.delete("/:servidorId", function (req, res) {
  servidorController.remover(req, res);
});

module.exports = router;
