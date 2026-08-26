var express = require("express");
var router = express.Router();

var usuarioRouter = require("./usuarios");
var empresaRouter = require("./empresa");

router.use("/usuarios", usuarioRouter);
router.use("/empresas", empresaRouter);

module.exports = router;
