const logModel = require("../models/logModel");
const empresaModel = require("../models/empresaModel")
const { isMissing } = require("../utils");

async function buscarLogHoje(req, res) {
  
const empresa_id = req.query.empresa_id

const existeEmpresa = await empresaModel.existePorID(empresa_id);

try {
    if (!existeEmpresa) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const logResult = await logModel.buscarLogHoje(empresa_id);

    res.status(200).json({
      message: "Logs encontrado com sucesso!",
      log: logResult
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function montarGraficoKpi(req, res) {

}

async function buscarMaiorUso(req, res) {
const empresa_id = req.query.empresa_id

const existeEmpresa = await empresaModel.existePorID(empresa_id);

try {
    if (!existeEmpresa) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const logResult = await logModel.buscarMaiorUso(empresa_id);

    res.status(200).json({
      message: "Logs encontrado com sucesso!",
      log: logResult
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function buscarLogPorComponente(req, res) {

const empresa_id = req.query.empresa_id

const existeEmpresa = await empresaModel.existePorID(empresa_id);

try {
    if (!existeEmpresa) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const logResult = await logModel.buscarLogPorComponente(empresa_id);

    res.status(200).json({
      message: "Logs encontrado com sucesso!",
      log: logResult
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function montarCardInfo(req, res) {
 
}

module.exports = {
  buscarLogHoje,
  montarGraficoKpi,
  buscarMaiorUso,
  buscarLogPorComponente,
  montarCardInfo
};
