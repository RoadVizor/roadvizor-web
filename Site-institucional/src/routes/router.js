const express = require("express");
const middlewares = require("../middlewares/auth");

const usuarioRouter = require("./usuarios");
const empresaRouter = require("./empresa");
const servidorRouter = require("./servidor");
const especificacoesRouter = require("./especificacoes");

const router = express.Router();

router.use("/usuarios", usuarioRouter);
router.use("/empresas", middlewares.verificarAutenticacao, empresaRouter);
router.use("/servidores", middlewares.verificarAutenticacao, servidorRouter);
router.use("/especificacoes", middlewares.verificarAutenticacao, especificacoesRouter);
router.use("/relatorios", require("./relatorios"));

module.exports = router;
