const express = require("express");
const middlewares = require("../middlewares/auth");

const usuarioRouter = require("./usuarios");
const empresaRouter = require("./empresa");

const router = express.Router();

router.use("/usuarios", usuarioRouter);
router.use("/empresas", middlewares.verificarAutenticacao, empresaRouter);

module.exports = router;
