var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

router.post("/cadastrar", function (req, res) {
  servidorController.cadastrar(req, res);
});

router.delete("/remover", function (req, res) {
  servidorController.remover(req,res);
});

router.put("/editar", function (req, res) {
  servidorController.editar(req,res);
});

module.exports = router;
