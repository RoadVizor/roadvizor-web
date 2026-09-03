const database = require("../database/config");

function autenticar(email, senha) {
  console.log("[usuarioModel.js] function entrar(): ", email, senha);
  const instrucaoSql = `
    SELECT id_usuario, empresa_id, nome, email, nivel_acesso 
    FROM usuario 
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
    VALUES (${empresa_id}, ${supervisor_id ?? null}, '${nome}', '${email}', SHA2('${senha}', 256), ${nivel_acesso ?? null});
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

function existePorEmail(email) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM empresa WHERE email = '${email}';
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
  existePorEmail,
};
