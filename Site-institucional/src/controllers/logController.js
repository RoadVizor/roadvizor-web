const logModel = require("../models/logModel");
const empresaModel = require("../models/empresaModel")
const servidorModel = require("../models/servidorModel")
const { isMissing } = require("../utils");

async function buscarLogHoje(req, res) {
  
const empresa_id = req.usuario.empresa_id

if(isMissing(empresa_id)) return res.status(400).json({ message: "empresa_id ausente no token." })

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
const empresa_id = req.usuario.empresa_id

if(isMissing(empresa_id)) return res.status(400).json({ message: "empresa_id ausente no token." })

const existeEmpresa = await empresaModel.existePorID(empresa_id);

try {
    if (!existeEmpresa) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const logResult = await logModel.montarGraficoKpi(empresa_id);

    res.status(200).json({
      message: "Gráfico pronto para ser gerado com sucesso!",
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

async function buscarMaiorUso(req, res) {
const empresa_id = req.usuario.empresa_id

if(isMissing(empresa_id)) return res.status(400).json({ message: "empresa_id ausente no token." })

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

const empresa_id = req.usuario.empresa_id

if(isMissing(empresa_id)) return res.status(400).json({ message: "empresa_id ausente no token." })

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
  const empresa_id = req.usuario.empresa_id;
  const servidor_id = req.query.servidor_id;

  if (isMissing(empresa_id)) {
    return res.status(400).json({ message: "empresa_id ausente no token." });
  }

  try {
    const existeEmpresa = await empresaModel.existePorID(empresa_id);
    if (!existeEmpresa) {
      return res.status(404).json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    if (servidor_id) {
      const existeServidor = await servidorModel.buscarPorID(empresa_id, servidor_id);
      if (!existeServidor) {
        return res.status(404).json({ message: "Nenhum servidor encontrado para o ID informado." });
      }
    }

    const logResult = await logModel.montarCardInfo(empresa_id, servidor_id);
    res.status(200).json({ message: "Card pronto para ser gerado com sucesso!", log: logResult });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) return res.status(403).send({ message });
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function buscarHistorico(req, res) {
  const { empresa_id } = req.usuario;
  const { servidor_id, componente_id } = req.query;
  const dias = Math.min(Number(req.query.dias) || 7, 30);

  if (isMissing(empresa_id) || isMissing(servidor_id) || isMissing(componente_id)) {
    return res.status(400).json({ message: "servidor_id e componente_id são obrigatórios." });
  }

  try {
    const existeServidor = await servidorModel.buscarPorID(empresa_id, servidor_id);
    if (!existeServidor) {
      return res.status(404).json({ message: "Nenhum servidor encontrado para o ID informado." });
    }

    const logResult = await logModel.buscarHistorico(empresa_id, servidor_id, componente_id, dias);
    res.status(200).json({ message: "Histórico encontrado com sucesso!", log: logResult });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) return res.status(403).send({ message });
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

function listarLogs(req, res) {
  const empresa_id = req.usuario.empresa_id;
  const { servidor_id, componente_id } = req.query;
  const dias = req.query.dias || 7;

  if (!servidor_id || !componente_id) {
    return res.status(400).json({ message: "servidor_id e componente_id são obrigatórios" });
  }

  logModel
    .listarLogs(empresa_id, servidor_id, componente_id, dias)
    .then((resultado) => res.status(200).json({ log: resultado }))
    .catch((erro) => {
      console.log("Erro ao listar logs:", erro.sqlMessage || erro);
      res.status(500).json({ message: erro.sqlMessage || "Erro ao listar logs" });
    });
}

module.exports = {
  buscarLogHoje,
  montarGraficoKpi,
  buscarMaiorUso,
  buscarLogPorComponente,
  montarCardInfo,
  buscarHistorico,
  listarLogs
};
