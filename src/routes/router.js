const express = require("express");
const middlewares = require("../middlewares/auth");

const usuarioRouter = require("./usuarios");
const empresaRouter = require("./empresa");

const router = express.Router();

// Rotas de Usuário
router.use("/usuarios", usuarioRouter);

// Rotas de Empresa
router.use("/empresas", middlewares.verificarAutenticacao, empresaRouter);

module.exports = router;
