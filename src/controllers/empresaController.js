const empresaModel = require("../models/empresaModel");
const { isMissing, isEmailValid, isPasswordValid } = require("../utils");

async function cadastrar(req, res) {
  const { cnpj, razao_social, nome_fantasia, email, senha } = req.body;

  if (isMissing(cnpj)) {
    res.status(400).send({ message: "O campo 'cnpj' está faltando." });
    return;
  }

  if (isMissing(razao_social)) {
    res.status(400).send({ message: "O campo 'razao_social' está faltando." });
    return;
  }

  if (isMissing(nome_fantasia)) {
    res.status(400).send({ message: "O campo 'nome_fantasia' está faltando." });
    return;
  }

  if (isMissing(email)) {
    res.status(400).send({ message: "O campo 'email' está faltando." });
    return;
  }

  if (!isEmailValid(email)) {
    res
      .status(400)
      .send({ message: "O endereço de e-mail fornecido está inválido." });
    return;
  }

  if (isMissing(senha)) {
    res.status(400).send({ message: "O campo 'senha' está faltando." });
    return;
  }

  if (!isPasswordValid(senha)) {
    res.status(400).send({
      message: "A senha fornecida está inválida.",
    });
    return;
  }

  try {
    await empresaModel.cadastrar(
      cnpj,
      razao_social,
      nome_fantasia,
      email,
      senha,
    );

    res.status(201).send({ message: "Empresa cadastrada com sucesso!" });
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
  const { empresaId } = req.params;

  if (isMissing(empresaId)) {
    res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
    return;
  }

  try {
    const result = await empresaModel.buscarPorID(id);

    res
      .status(200)
      .json({ message: "Empresa encontrada com sucesso!", empresa: result[0] });
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
  buscarPorID,
};
