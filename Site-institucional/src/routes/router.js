const express = require("express");
const middlewares = require("../middlewares/auth");

const usuarioRouter = require("./usuarios");
const empresaRouter = require("./empresa");
const servidorRouter = require("./servidor");
const dashboardRouter = require("./dashboard")

const router = express.Router();

// === Rotas da Aplicação === //
// === Rotas Públicas === //
router.use("/usuarios", usuarioRouter);

// === Rotas Protegidas (têm acesso a req.usuario) === //
router.use("/empresas", middlewares.verificarAutenticacao, empresaRouter);
router.use("/servidores", middlewares.verificarAutenticacao, servidorRouter);
router.use("/dashboard",dashboardRouter)

module.exports = router;
