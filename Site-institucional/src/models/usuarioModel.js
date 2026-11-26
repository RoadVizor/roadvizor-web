const database = require("../database/config");

const camposPermitidos =
  "id_usuario, empresa_id, supervisor_id, nome, email, nivel_acesso, cargo, ativo, criado_em";

// evita problemas com aspas em textos enviados para o SQL
function tratarTexto(valor) {
  return String(valor).replace(/'/g, "''");
}

function autenticar(email, senha) {
  const instrucaoSql = `
    SELECT ${camposPermitidos}
    FROM usuario
    WHERE email = '${tratarTexto(email)}'
    AND senha = SHA2('${tratarTexto(senha)}', 256);
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database.executar(instrucaoSql);
}

function cadastrar(
  empresa_id,
  supervisor_id,
  nome,
  email,
  senha,
  nivel_acesso,
  cargo
) {
  const nivel = nivel_acesso ?? 2;

  const instrucaoSql = `
    INSERT INTO usuario (
      empresa_id,
      supervisor_id,
      nome,
      email,
      senha,
      nivel_acesso,
      cargo
    )
    VALUES (
      ${empresa_id},
      ${supervisor_id},
      '${tratarTexto(nome)}',
      '${tratarTexto(email)}',
      SHA2('${tratarTexto(senha)}', 256),
      ${nivel},
      '${tratarTexto(cargo || "")}'
    );
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database.executar(instrucaoSql);
}

function buscar(empresa_id) {
  const instrucaoSql = `
    SELECT ${camposPermitidos}
    FROM usuario
    WHERE empresa_id = ${empresa_id};
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database.executar(instrucaoSql);
}

function buscarPorID(empresa_id, id) {
  const instrucaoSql = `
    SELECT ${camposPermitidos}
    FROM usuario
    WHERE empresa_id = ${empresa_id}
    AND id_usuario = ${id};
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database.executar(instrucaoSql);
}

function remover(empresa_id, id_usuario) {
  const instrucaoSql = `
    DELETE FROM usuario
    WHERE empresa_id = ${empresa_id}
    AND id_usuario = ${id_usuario};
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database.executar(instrucaoSql);
}

function editar(empresa_id, id_usuario, campos = {}) {
  const camposPermitidosEditar = [
    "nome",
    "email",
    "senha",
    "cargo",
    "nivel_acesso"
  ];

  const chaveCampos = Object.keys(campos).filter((chave) =>
    camposPermitidosEditar.includes(chave)
  );

  if (chaveCampos.length === 0) {
    return Promise.resolve();
  }

  const camposTratados = chaveCampos
    .map((chave) => {
      if (chave === "senha") {
        return `senha = SHA2('${tratarTexto(campos[chave])}', 256)`;
      }

      if (chave === "nivel_acesso") {
        return `nivel_acesso = ${Number(campos[chave])}`;
      }

      return `${chave} = '${tratarTexto(campos[chave])}'`;
    })
    .join(", ");

  const instrucaoSql = `
    UPDATE usuario
    SET ${camposTratados},
        atualizado_em = NOW()
    WHERE empresa_id = ${empresa_id}
    AND id_usuario = ${id_usuario};
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database.executar(instrucaoSql);
}

function atualizarStatus(empresa_id, id_usuario, ativo) {
  const instrucaoSql = `
    UPDATE usuario
    SET ativo = ${ativo ? 1 : 0},
        atualizado_em = NOW()
    WHERE empresa_id = ${empresa_id}
    AND id_usuario = ${id_usuario};
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database.executar(instrucaoSql);
}

function existePorID(id_usuario) {
  const instrucaoSql = `
    SELECT COUNT(*) AS quantidade
    FROM usuario
    WHERE id_usuario = ${id_usuario};
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database
    .executar(instrucaoSql)
    .then((result) => Number(result[0].quantidade) > 0);
}

function existePorEmail(email) {
  const instrucaoSql = `
    SELECT COUNT(*) AS quantidade
    FROM usuario
    WHERE email = '${tratarTexto(email)}';
  `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL:\n" + instrucaoSql
  );

  return database
    .executar(instrucaoSql)
    .then((result) => Number(result[0].quantidade) > 0);
}

module.exports = {
  autenticar,
  cadastrar,
  buscar,
  buscarPorID,
  remover,
  editar,
  atualizarStatus,
  existePorID,
  existePorEmail
};