const database = require("../database/config");

function buscar(empresa_id) {
  const instrucaoSql = `
    SELECT * FROM servidor WHERE empresa_id = ${empresa_id};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarPorID(empresa_id, id_servidor) {
  const instrucaoSql = `
    SELECT * FROM servidor 
    WHERE empresa_id = ${empresa_id} AND id_servidor = ${id_servidor};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrar(empresa_id, endereco_id, endereco_mac, apelido, modelo) {
  const instrucaoSql = `
    INSERT INTO servidor(empresa_id, endereco_id, endereco_mac, apelido, modelo) 
    VALUES (${empresa_id}, ${endereco_id}, '${endereco_mac}', '${apelido}', '${modelo}');
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function editar(empresa_id, id_servidor, campos = {}) {
  const chaveCampos = Object.keys(campos);
  if (chaveCampos.length <= 0) return; //pois nenhum campo está sendo alterado.

  // Obs: converte campos enviados para atualização para um formato que o SQL aceita.
  // de: { campoA: "valorA", campoB: "valorB" }
  // para: campoA="valorA", campoB ="valorB"
  const camposTratados = chaveCampos
    .map((chave) => [chave, `"${campos[chave]}"`].join("="))
    .join(", ");

  const instrucaoSql = `
    UPDATE servidor SET ${camposTratados} 
    WHERE empresa_id = ${empresa_id} AND id_servidor = ${id_servidor};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function remover(empresa_id, id_servidor) {
  console.log(
    "[servidorModel.js] function remover():",
    id_servidor,
    empresa_id,
  );

  const instrucaoSql = `
    DELETE FROM servidor 
    WHERE empresa_id = ${empresa_id} AND id_servidor = ${id_servidor};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function existePorID(id_servidor) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM servidor WHERE id_servidor = ${id_servidor};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

function existePorEnderecoMAC(endereco_mac) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM servidor WHERE endereco_mac = ${endereco_mac};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

module.exports = {
  buscar,
  buscarPorID,
  cadastrar,
  editar,
  remover,
  existePorID,
  existePorEnderecoMAC,
};
