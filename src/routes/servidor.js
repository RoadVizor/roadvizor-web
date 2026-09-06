const express = require("express");
const servidorController = require("../controllers/servidorController");
const { verificarAutenticacao } = require("../middlewares/auth"); 

const router = express.Router({ mergeParams: true });

// === POST - CRIAÇÃO === //
router.post("/cadastrar", verificarAutenticacao, function (req, res) {
  servidorController.cadastrar(req, res);
});

// === GET - BUSCA (TODOS) === //
router.get("/", verificarAutenticacao, function (req, res) {
  servidorController.buscar(req, res);
});

// === GET - BUSCA POR ID === //
router.get("/:id", verificarAutenticacao, function (req, res) {
  servidorController.buscarPorID(req, res);
});

// === PUT - ATUALIZAÇÃO === //
router.put("/:id", verificarAutenticacao, function (req, res) {
  servidorController.editar(req, res);
});

// === DELETE - REMOÇÃO === //
router.delete("/:id", verificarAutenticacao, function (req, res) {
  servidorController.remover(req, res);
});

module.exports = router;