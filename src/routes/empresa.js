var express = require("express");
var router = express.Router();

var empresaController = require("../controllers/empresaController");

router.post("/cadastrar", function (req, res) {
  empresaController.cadastrar(req, res);
});

router.get("/:id", function (req, res) {
  empresaController.getById(req, res);
});

module.exports = router;
