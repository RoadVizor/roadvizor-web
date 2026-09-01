const express = require("express");
const autenticar = require("../middlewares/auth");

const usuarioRouter = require("./usuarios");
const empresaRouter = require("./empresa");
const servidorRouter = require("./servidor");

const router = express.Router();

router.use("/usuarios", usuarioRouter);
router.use("/empresas", autenticar, empresaRouter);
router.use("/servidor", servidorRouter);

module.exports = router;
