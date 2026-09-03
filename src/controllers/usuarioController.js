const { isMissing, isEmailValid, isPasswordValid } = require("../utils");
const usuarioModel = require("../models/usuarioModel");
const empresaModel = require("../models/empresaModel");
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
  const { empresa_id, supervisor_id } = req.usuario;
  const { nome, email, senha, nivel_acesso } = req.body;

  if (isMissing(empresa_id)) {
    return res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
  }

  if (isMissing(nome)) {
    return res.status(400).send({ message: "O campo 'nome' está faltando." });
  }

  if (isMissing(email)) {
    return res.status(400).send({ message: "O campo 'email' está faltando." });
  }

  if (!isEmailValid(email)) {
    res
      .status(400)
      .send({ message: "O endereço de e-mail fornecido está inválido." });
    return;
  }

  if (isMissing(senha)) {
    return res.status(400).send({ message: "O campo 'senha' está faltando." });
  }

  if (!isPasswordValid(senha)) {
    return res.status(400).send({
      message: "A senha fornecida está inválida.",
    });
  }

  try {
    // 1. Verifica se Email informado está em uso
    const emailEmUso = await usuarioModel.existePorEmail(email);
    if (emailEmUso) {
      return res
        .status(409)
        .json({ message: "Email informado já está em uso." });
    }

    // 2. Verifica se Empresa informada Existe
    const empresaExiste = await empresaModel.existePorID(empresa_id);
    if (!empresaExiste) {
      return res
        .status(409)
        .json({ message: "Empresa informado já está em uso." });
    }

    // 3. Verifica se Supervisor informado Existe
    // ...

    await usuarioModel.cadastrar(
      empresa_id,
      supervisor_id,
      nome,
      email,
      senha,
      nivel_acesso,
    );

    res.status(201).send({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      return res.status(403).send({ message });
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
