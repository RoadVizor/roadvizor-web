const express = require("express");
const { verificarAutenticacao } = require("../middlewares/auth");
const iaController = require("../controllers/iaController");

const router = express.Router();

router.post("/analisar", verificarAutenticacao, iaController.analisar);

module.exports = router;