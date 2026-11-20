const express = require("express");
const { verificarAutenticacao } = require("../middlewares/auth");
const flowpredictController = require("../controllers/flowpredictController");

const router = express.Router();

router.get("/", verificarAutenticacao, (req, res) => {
    flowpredictController.buscarDashboard(req, res);
});


router.post("/salvar", verificarAutenticacao, (req, res) => {
    flowpredictController.salvarSugestao(req, res);
});


module.exports = router;