/* Roteamento para endpoint /api/saude
   - Protegido por verificarAutenticacao middleware (req.usuario).
   - Encaminha para o controller obterSaude.
*/
const express = require("express");
const { obterSaude } = require("../controllers/saudeController");
const { verificarAutenticacao } = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });

// GET /api/saude?companyId=...&region=...&file=...
router.get("/", verificarAutenticacao, function (req, res) {
  return obterSaude(req, res);
});

module.exports = router;
