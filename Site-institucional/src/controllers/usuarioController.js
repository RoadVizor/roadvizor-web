const {
  isMissing,
  isEmailValid,
  isPasswordValid,
} = require("../utils");

const usuarioModel = require("../models/usuarioModel");
const empresaModel = require("../models/empresaModel");
const jwt = require("jsonwebtoken");

async function autenticar(req, res) {
  const { email, senha } = req.body;

  if (isMissing(email)) {
    return res.status(400).send({
      message: "O campo 'email' está faltando.",
    });
  }

  if (!isEmailValid(email)) {
    return res.status(400).send({
      message: "O endereço de e-mail fornecido está inválido.",
    });
  }

  if (isMissing(senha)) {
    return res.status(400).send({
      message: "O campo 'senha' está faltando.",
    });
  }

  if (!isPasswordValid(senha)) {
    return res.status(400).send({
      message:
        "Senha deve conter ao menos 6 caracteres, 1 caractere em maiúsculo, 1 caractere em minúsculo e 1 caractere especial",
    });
  }

  try {
    const result = await usuarioModel.autenticar(email, senha);

    if (!result || result.length !== 1) {
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

    res.cookie("autenticado", true, {
      httpOnly: false,
      secure: process.env.AMBIENTE_PROCESSO !== "desenvolvimento",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).send({
      message: "Usuário logado com sucesso!",
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
      },
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;

    if (message) {
      return res.status(403).send({ message });
    }

    return res.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}

async function cadastrar(req, res) {
  const {
    id_usuario,
    empresa_id,
    nivel_acesso: permissao,
  } = req.usuario;

  const {
    nome,
    email,
    senha,
    nivel_acesso,
    cargo,
  } = req.body;

  // 0 - desenvolvedor | 1 - administrador | 2 em diante - usuário comum
  if (permissao > 1) {
    return res.status(403).send({
      message: "Você não tem permissão para realizar esta ação.",
    });
  }

  if (isMissing(empresa_id)) {
    return res.status(400).send({
      message: "ID da empresa não foi passado na requisição.",
    });
  }

  if (isMissing(nome)) {
    return res.status(400).send({
      message: "O campo 'nome' está faltando.",
    });
  }

  if (isMissing(email)) {
    return res.status(400).send({
      message: "O campo 'email' está faltando.",
    });
  }

  if (!isEmailValid(email)) {
    return res.status(400).send({
      message: "O endereço de e-mail fornecido está inválido.",
    });
  }

  if (isMissing(senha)) {
    return res.status(400).send({
      message: "O campo 'senha' está faltando.",
    });
  }

  if (!isPasswordValid(senha)) {
    return res.status(400).send({
      message: "A senha fornecida está inválida.",
    });
  }

  if (isMissing(cargo)) {
    return res.status(400).send({
      message: "O campo 'cargo' está faltando.",
    });
  }

  if (
    isMissing(nivel_acesso) ||
    ![1, 2].includes(Number(nivel_acesso))
  ) {
    return res.status(400).send({
      message: "O nível de acesso informado é inválido.",
    });
  }

  try {
    // verifica se o e-mail já está em uso
    const emailEmUso = await usuarioModel.existePorEmail(email);

    if (emailEmUso) {
      return res.status(409).json({
        message: "Email informado já está em uso.",
      });
    }

    // verifica se a empresa existe
    const empresaExiste = await empresaModel.existePorID(empresa_id);

    if (!empresaExiste) {
      return res.status(404).json({
        message: "Nenhuma empresa encontrada para o ID informado.",
      });
    }

    // cadastra o usuário
    await usuarioModel.cadastrar(
      empresa_id,
      id_usuario,
      nome,
      email,
      senha,
      nivel_acesso,
      cargo
    );

    return res.status(201).send({
      message: "Usuário cadastrado com sucesso!",
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;

    if (message) {
      return res.status(403).send({ message });
    }

    return res.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}

async function sair(req, res) {
  const token = req.cookies?.access_token;

  if (token) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("autenticado", { path: "/" });
  }

  return res.status(200).json({
    message: "Logout realizado.",
  });
}

async function buscarPorID(req, res) {
  const { empresa_id } = req.usuario;
  const { id } = req.params;

  if (isMissing(empresa_id)) {
    return res.status(400).json({
      message: "ID da Empresa não foi passado na requisição.",
    });
  }

  if (isMissing(id)) {
    return res.status(400).json({
      message: "ID do Membro não foi passado na requisição.",
    });
  }

  try {
    const empresaExiste = await empresaModel.existePorID(empresa_id);

    if (!empresaExiste) {
      return res.status(404).json({
        message: "Nenhuma Empresa encontrada para o ID informado.",
      });
    }

    // busca o membro dentro da empresa do usuário autenticado
    const result = await usuarioModel.buscarPorID(empresa_id, id);

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "Nenhum Membro encontrado para o ID informado.",
      });
    }

    return res.status(200).json({
      message: "Membro encontrado com sucesso.",
      membro: result[0],
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;

    if (message) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Erro interno no servidor.",
    });
  }
}

async function editar(req, res) {
  const { empresa_id } = req.usuario;
  const { id } = req.params;
  const { nome, email, senha, cargo, nivel_acesso } = req.body;

  const camposParaAtualizar = {};

  if (isMissing(empresa_id)) {
    return res.status(400).json({
      message: "ID da Empresa não foi passado na requisição."
    });
  }

  if (isMissing(id)) {
    return res.status(400).json({
      message: "ID do Membro não foi passado na requisição."
    });
  }

  try {
    const membroAtual = await usuarioModel.buscarPorID(empresa_id, id);

    if (!membroAtual || membroAtual.length === 0) {
      return res.status(404).json({
        message: "Nenhum Membro encontrado para o ID informado."
      });
    }

    if (!isMissing(email)) {
      if (!isEmailValid(email)) {
        return res.status(400).json({
          message: "O endereço de e-mail fornecido está inválido."
        });
      }

      const emailEmUso = await usuarioModel.existePorEmail(email);

      if (emailEmUso && membroAtual[0].email !== email) {
        return res.status(409).json({
          message: "Email informado para atualização já está registrado."
        });
      }

      camposParaAtualizar.email = email;
    }

    if (!isMissing(nome)) {
      camposParaAtualizar.nome = nome;
    }

    if (!isMissing(senha)) {
      if (!isPasswordValid(senha)) {
        return res.status(400).json({
          message: "A senha fornecida está inválida."
        });
      }

      camposParaAtualizar.senha = senha;
    }

    if (!isMissing(cargo)) {
      camposParaAtualizar.cargo = cargo;
    }

    if (!isMissing(nivel_acesso)) {
      camposParaAtualizar.nivel_acesso = Number(nivel_acesso);
    }

    await usuarioModel.editar(empresa_id, id, camposParaAtualizar);

    return res.status(200).json({
      message: "Membro atualizado com sucesso!"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro interno no servidor."
    });
  }
}

async function buscar(req, res) {
  const { empresa_id } = req.usuario;

  if (isMissing(empresa_id)) {
    return res.status(400).json({
      message: "ID da Empresa não foi passado na requisição.",
    });
  }

  try {
    const empresaExiste = await empresaModel.existePorID(empresa_id);

    if (!empresaExiste) {
      return res.status(404).json({
        message: "Nenhuma Empresa encontrada para o ID informado.",
      });
    }

    const result = await usuarioModel.buscar(empresa_id);

    return res.status(200).json({
      message: "Membros encontrados para a Empresa solicitada.",
      count: result.length,
      result,
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;

    if (message) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Erro interno no servidor.",
    });
  }
}

async function remover(req, res) {
  const {
    empresa_id,
    nivel_acesso: permissao,
  } = req.usuario;

  const { id } = req.params;

  // 0 - desenvolvedor | 1 - administrador | 2 em diante - usuário comum
  if (permissao > 1) {
    return res.status(403).json({
      message: "Você não tem permissão para realizar esta ação.",
    });
  }

  if (isMissing(empresa_id)) {
    return res.status(400).json({
      message: "ID da Empresa não foi passado na requisição.",
    });
  }

  if (isMissing(id)) {
    return res.status(400).json({
      message: "ID do membro não foi passado na requisição.",
    });
  }

  try {
    const empresaExiste = await empresaModel.existePorID(empresa_id);

    if (!empresaExiste) {
      return res.status(404).json({
        message: "Nenhuma Empresa encontrada para o ID informado.",
      });
    }

    // verifica se o membro pertence à empresa
    const membroExiste = await usuarioModel.buscarPorID(empresa_id, id);

    if (!membroExiste || membroExiste.length === 0) {
      return res.status(404).json({
        message: "Nenhum Membro encontrado para o ID informado.",
      });
    }

    await usuarioModel.remover(empresa_id, id);

    return res.status(200).send({
      message: "Membro removido com sucesso!",
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;

    if (message) {
      return res.status(403).send({ message });
    }

    return res.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}

async function autenticarPagina(req, res) {
  if (req.status == 401) {
    return res.status(403);
  }

  return res.status(200);
}

async function atualizarStatus(req, res) {
  const { empresa_id, nivel_acesso } = req.usuario;
  const { id } = req.params;
  const { ativo } = req.body;

  if (nivel_acesso > 1) {
    return res.status(403).json({
      message: "Você não tem permissão para realizar esta ação."
    });
  }

  if (isMissing(ativo)) {
    return res.status(400).json({
      message: "O campo 'ativo' está faltando."
    });
  }

  try {
    const membro = await usuarioModel.buscarPorID(empresa_id, id);

    if (!membro || membro.length === 0) {
      return res.status(404).json({
        message: "Nenhum Membro encontrado para o ID informado."
      });
    }

    await usuarioModel.atualizarStatus(
      empresa_id,
      id,
      ativo === true || ativo === 1 || ativo === "1"
    );

    return res.status(200).json({
      message: "Status do membro atualizado com sucesso!"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro interno no servidor."
    });
  }
}

module.exports = {
  autenticar,
  cadastrar,
  sair,
  buscar,
  buscarPorID,
  remover,
  editar,
  autenticarPagina,
  atualizarStatus
};