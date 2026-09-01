const express = require("express");
const autenticar = require("../middlewares/auth");
const usuarioController = require("../controllers/usuarioController");

const router = express.Router();

router.post("/cadastrar", autenticar, function (req, res) {
  usuarioController.cadastrar(req, res);
});

router.post("/autenticar", function (req, res) {
  usuarioController.autenticar(req, res);
});

module.exports = router;
