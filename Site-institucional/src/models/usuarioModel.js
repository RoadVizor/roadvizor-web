const database = require("../database/config");

const camposPermitidos =
  "id_usuario, empresa_id, supervisor_id, nome, email, nivel_acesso";

function autenticar(email, senha) {
  const instrucaoSql = `
    SELECT  ${camposPermitidos} FROM usuario 
    WHERE email = '${email}' AND senha = SHA2('${senha}', 256);
    `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL: \n" + instrucaoSql,
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
) {
  const instrucaoSql = `
    INSERT INTO usuario (empresa_id, supervisor_id, nome, email, senha, nivel_acesso) 
    VALUES (${empresa_id}, ${supervisor_id}, '${nome}', '${email}', SHA2('${senha}', 256), ${nivel_acesso ?? "default"});
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function existePorID(id_empresa) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM empresa WHERE id_empresa = ${id_empresa};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

function buscar(empresa_id) {
  const instrucaoSql = `
    SELECT ${camposPermitidos} FROM usuario WHERE empresa_id = ${empresa_id};
  `;

  console.log("[usuarioModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function remover(empresa_id, id_usuario) {
  console.log(
    "[usuarioModel.js] function remover():",
    id_usuario,
    empresa_id,
  );

  const instrucaoSql = `
    DELETE FROM usuario 
    WHERE empresa_id = ${empresa_id} AND id_usuario = ${id_usuario};
  `;

  console.log("[usuarioModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function existePorID(id_usuario) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM usuario WHERE id_usuario = ${id_usuario};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

function existePorEmail(email) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM usuario WHERE email = '${email}';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

module.exports = {
  autenticar,
  cadastrar,
  existePorID,
  buscar,
  remover,
  existePorID,
  existePorEmail,
};
