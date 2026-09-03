const express = require("express");
const middlewares = require("../middlewares/auth");

const usuarioRouter = require("./usuarios");
const empresaRouter = require("./empresa");
const servidorRouter = require("./servidor");

const router = express.Router();

// === Rotas da Aplicação === //
router.use("/usuarios", usuarioRouter);
router.use("/empresas", middlewares.verificarAutenticacao, empresaRouter);
router.use(
  "/empresas/:empresaId",
  middlewares.verificarAutenticacao,
  servidorRouter,
);

module.exports = router;
