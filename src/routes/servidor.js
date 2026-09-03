const express = require("express");
const router = express.Router({ mergeParams: true });

const servidorController = require("../controllers/servidorController");

router.post("/", function (req, res) {
  servidorController.cadastrar(req, res);
});

router.get("/", function (req, res) {
  servidorController.buscar(req, res);
});

router.get("/:servidorId", function (req, res) {
  servidorController.buscarPorID(req, res);
});

router.put("/:servidorId", function (req, res) {
  servidorController.editar(req, res);
});

router.delete("/:servidorId", function (req, res) {
  servidorController.remover(req, res);
});

module.exports = router;
