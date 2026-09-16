const express = require("express");
const middlewares = require("../middlewares/auth");
const usuarioController = require("../controllers/usuarioController");

const router = express.Router();

// === POST - CADASTRO === //
router.post(
  "/cadastrar",
  middlewares.verificarAutenticacao,
  function (req, res) {
    usuarioController.cadastrar(req, res);
  },
);

// === POST - AUTENTICAÇÃO === //
router.post("/autenticar", function (req, res) {
  usuarioController.autenticar(req, res);
});

// === POST - LOGOUT === //
router.post("/sair", middlewares.verificarAutenticacao, function (req, res) {
  usuarioController.sair(req, res);
});

module.exports = router;
