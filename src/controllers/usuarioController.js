const usuarioModel = require("../models/usuarioModel");
const { isInvalid, isEmailValid, isPasswordValid } = require("../utils");
const jwt = require("jsonwebtoken");

async function autenticar(req, res) {
  const { email, senha } = req.body;

  if (isInvalid(email)) {
    res.status(400).send({ message: "O campo 'email' está faltando." });
    return;
  }
  if (!isEmailValid(email)) {
    res
      .status(400)
      .send({ message: "O endereço de e-mail fornecido está inválido." });
    return;
  }

  if (isInvalid(senha)) {
    res.status(400).send({ message: "O campo 'senha' está faltando." });
    return;
  }
  if (!isPasswordValid(senha)) {
    res.status(400).send({
      message:
        "A senha fornecida deve conter de 8 a 12 caracteres. Uma letra maiúscula e um caractere especial.",
    });
    return;
  }

  try {
    const result = await usuarioModel.autenticar(email, senha);
    if (!result || result.length != 1) {
      throw new Error("Usuário inexistente ou credenciais inválidas.");
    }

    const usuario = result[0];

    const payload = {
      id: usuario.id_usuario,
      empresa: usuario.empresa_id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.AMBIENTE_PROCESSO === "desenvolvimento",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/api",
    });

    res.status(200).send({
      message: "Usuário logado com sucesso!",
      user: usuario,
    });
  } catch (error) {
    const msg = error.message || error.sqlMessage;
    if (msg) {
      res.status(403).send({ message: msg });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function cadastrar(req, res) {
  const { nome, email, senha, cargo, empresaId } = req.body;

  if (isInvalid(nome)) {
    res.status(400).send({ message: "O campo 'nome' está faltando." });
    return;
  }

  if (isInvalid(email)) {
    res.status(400).send({ message: "O campo 'email' está faltando." });
    return;
  }

  if (!isEmailValid(email)) {
    res
      .status(400)
      .send({ message: "O endereço de e-mail fornecido está inválido." });
    return;
  }

  if (isInvalid(senha)) {
    res.status(400).send({ message: "O campo 'senha' está faltando." });
    return;
  }

  if (!isPasswordValid(senha)) {
    res.status(400).send({
      message: "A senha fornecida está inválida.",
    });
    return;
  }

  if (isInvalid(cargo)) {
    res.status(400).send({ message: "O campo 'cargo' está faltando." });
    return;
  }

  if (isInvalid(empresaId)) {
    res.status(400).send({ message: "O campo 'empresaId' está faltando." });
    return;
  }

  try {
    await usuarioModel.cadastrar(nome, email, senha, cargo, empresaId);

    res.status(201).send({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    const msg = error.message || error.sqlMessage;
    if (msg) {
      res.status(403).send({ message: msg });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

module.exports = {
  autenticar,
  cadastrar,
};
