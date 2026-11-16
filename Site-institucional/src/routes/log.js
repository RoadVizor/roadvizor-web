const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verificarAutenticacao } = require('../middlewares/auth');
router.use(verificarAutenticacao);

router.get('/buscar-hoje', logController.buscarLogHoje);
router.get('/grafico-kpi', logController.montarGraficoKpi);
router.get('/buscar-maior-uso', logController.buscarMaiorUso);
router.get('/buscar-componente', logController.buscarLogPorComponente);
router.get('/renderizar-card', logController.montarCardInfo);
router.get('/historico', logController.buscarHistorico);

module.exports = router;
