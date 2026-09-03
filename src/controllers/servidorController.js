const servidorModel = require("../models/servidorModel");
const empresaModel = require("../models/empresaModel");
const { isMissing } = require("../utils");

async function cadastrar(req, res) {
  const { empresaId } = req.params;
  const { endereco_id, endereco_mac, apelido, modelo } = req.body;

  if (isMissing(empresaId)) {
    res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
    return;
  }

  if (isMissing(endereco_id)) {
    res.status(400).send({ message: "O campo 'endereco_id' está faltando." });
    return;
  }

  if (isMissing(endereco_mac)) {
    res.status(400).send({ message: "O campo 'endereco_mac' está faltando." });
    return;
  }

  if (isMissing(apelido)) {
    res.status(400).send({ message: "O campo 'apelido' está faltando." });
    return;
  }

  if (isMissing(modelo)) {
    res.status(400).send({ message: "O campo 'modelo' está faltando." });
    return;
  }

  try {
    await servidorModel.cadastrar(
      empresaId,
      endereco_id,
      endereco_mac,
      apelido,
      modelo,
    );

    res.status(201).send({ message: "Servidor cadastrado com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function buscar(req, res) {
  const { empresaId } = req.params;

  if (isMissing(empresaId)) {
    res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
    return;
  }

  try {
    const result = await servidorModel.buscar(empresaId);

    res.status(200).send({
      message: "Servidores encontrados para a empresa solicitada.",
      count: result.length,
      result,
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

async function buscarPorID(req, res) {
  const { empresaId, servidorId } = req.params;

  if (isMissing(empresaId)) {
    res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
    return;
  }

  if (isMissing(servidorId)) {
    res
      .status(400)
      .send({ message: "ID do servidor não foi passado na requisição." });
    return;
  }

  try {
    const empresaResult = await empresaModel.buscarPorID(empresaId);
    if (!empresaResult || empresaResult.length == 0) {
      res
        .status(404)
        .send({ message: "Nenhuma empresa com este ID foi econtrada." });
      return;
    }

    const servidorResult = await servidorModel.buscarPorID(
      empresaId,
      servidorId,
    );

    res.status(200).send({
      message: "Servidor encontrado com sucesso.",
      servidorResult,
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

async function editar(req, res) {
  const { empresaId, servidorId } = req.params;
  const { endereco_mac, apelido, modelo } = req.body;

  try {
    const result = await servidorModel.editar(
      empresaId,
      servidorId,
      endereco_mac,
      apelido,
      modelo,
    );

    res
      .status(200)
      .send({ message: "Servidor atualizado com sucesso!", updated: result });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function remover(req, res) {
  const { empresaId, servidorId } = req.params;

  if (isMissing(empresaId)) {
    res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
    return;
  }

  if (isMissing(servidorId)) {
    res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
    return;
  }

  try {
    await servidorModel.remover(servidorId, empresaId);

    res.status(200).send({ message: "Servidor removido com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

module.exports = {
  cadastrar,
  buscar,
  buscarPorID,
  remover,
  editar,
};
