const { isMissing, isEmailValid, isPasswordValid } = require("../utils");
const usuarioModel = require("../models/usuarioModel");
const jwt = require("jsonwebtoken");

async function autenticar(req, res) {
  const { email, senha } = req.body;

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
      message:
        "Senha deve conter ao menos 6 caracteres, 1 caractere em maiúsculo, 1 caractere em minúsculo e 1 caractere especial",
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
      ...usuario,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.AMBIENTE_PROCESSO !== "desenvolvimento",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).send({
      message: "Usuário logado com sucesso!",
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
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

async function cadastrar(req, res) {
  const { nome, email, senha, cargo, empresaId } = req.body;

  if (isMissing(nome)) {
    res.status(400).send({ message: "O campo 'nome' está faltando." });
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

  if (isMissing(cargo)) {
    res.status(400).send({ message: "O campo 'cargo' está faltando." });
    return;
  }

  if (isMissing(empresaId)) {
    res.status(400).send({ message: "O campo 'empresaId' está faltando." });
    return;
  }

  try {
    await usuarioModel.cadastrar(nome, email, senha, cargo, empresaId);

    res.status(201).send({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function sair(req, res) {
  const token = req.cookies?.access_token;
  if (token) {
    res.clearCookie("access_token");
  }

  return res.status(200).json({ message: "Logout realizado." });
}

module.exports = {
  autenticar,
  cadastrar,
  sair,
};
