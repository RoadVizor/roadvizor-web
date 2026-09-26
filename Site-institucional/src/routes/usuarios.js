const express = require("express");
const { verificarAutenticacao } = require("../middlewares/auth");
const usuarioController = require("../controllers/usuarioController");

const router = express.Router();

// === POST - CADASTRO === //
router.post(
  "/cadastrar",
  verificarAutenticacao,
  function (req, res) {
    usuarioController.cadastrar(req, res);
  },
);

// === POST - AUTENTICAÇÃO === //
router.post("/autenticar", function (req, res) {
  usuarioController.autenticar(req, res);
});

// === POST - LOGOUT === //
router.post("/sair", verificarAutenticacao, function (req, res) {
  usuarioController.sair(req, res);
});

router.get("/", verificarAutenticacao, function (req, res) {
  usuarioController.buscar(req, res)
})

router.delete("/:id", verificarAutenticacao, function (req, res) {
  usuarioController.remover(req, res);
});

module.exports = router;
