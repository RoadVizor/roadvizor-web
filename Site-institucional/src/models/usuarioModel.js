function buscarPorID(empresa_id, id) {
  const instrucaoSql = `
    SELECT * FROM usuario 
    WHERE empresa_id = ${empresa_id} AND id_usuario = ${id};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}const database = require("../database/config");

const camposPermitidos =
  "id_usuario, empresa_id, supervisor_id, nome, email, nivel_acesso, cargo, ativo";

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
  cargo,
) {
  const instrucaoSql = `
    INSERT INTO usuario (empresa_id, supervisor_id, nome, email, senha, nivel_acesso, cargo) 
    VALUES (${empresa_id}, ${supervisor_id}, '${nome}', '${email}', SHA2('${senha}', 256), ${nivel_acesso ?? "default"}, "${cargo}");
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
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

function editar(empresa_id, id_usuario, campos = {}) {
  const chaveCampos = Object.keys(campos);
  if (chaveCampos.length <= 0) return; //pois nenhum campo está sendo alterado.

  // Obs: converte campos enviados para atualização para um formato que o SQL aceita.
  // de: { campoA: "valorA", campoB: "valorB" }
  // para: campoA="valorA", campoB ="valorB"
  const camposTratados = chaveCampos
    .map((chave) => [chave, `"${campos[chave]}"`].join("="))
    .join(", ");

  const instrucaoSql = `
    UPDATE usuario SET ${camposTratados} 
    WHERE empresa_id = ${empresa_id} AND id_usuario = ${id_usuario};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
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
  buscar,
  buscarPorID,
  remover,
  editar,
  existePorID,
  existePorEmail,
};
