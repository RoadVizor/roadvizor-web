const express = require("express");
const autenticar = require("../middlewares/auth");

const usuarioRouter = require("./usuarios");
const empresaRouter = require("./empresa");

const router = express.Router();

router.use("/usuarios", usuarioRouter);
router.use("/empresas", autenticar, empresaRouter);

module.exports = router;
