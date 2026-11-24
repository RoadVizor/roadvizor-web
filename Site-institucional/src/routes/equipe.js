const express = require("express");
const router = express.Router();

const { verificarAutenticacao } = require("../middlewares/auth");
const usuarioController = require("../controllers/usuarioController");

// rota para cadastrar colaborador
router.post("/", verificarAutenticacao, function (req, res) {
    usuarioController.cadastrar(req, res);
});

module.exports = router;