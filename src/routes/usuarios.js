const express = require("express");
const middlewares = require("../middlewares/auth");
const usuarioController = require("../controllers/usuarioController");

const router = express.Router();

router.post(
  "/cadastrar",
  middlewares.verificarAutenticacao,
  function (req, res) {
  usuarioController.cadastrar(req, res);
  },
);

router.post("/autenticar", function (req, res) {
  usuarioController.autenticar(req, res);
});

module.exports = router;
