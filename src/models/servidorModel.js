const database = require("../database/config");

function buscar(empresa_id) {
  console.log("[servidorModel.js] function buscar(): ", empresa_id);

  const instrucaoSql = `
    SELECT * FROM servidor WHERE empresa_id = ${empresa_id};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarPorID(empresa_id, id_servidor) {
  console.log(
    "[servidorModel.js] function buscarPorID(): ",
    empresa_id,
    id_servidor,
  );

  const instrucaoSql = `
    SELECT * FROM servidor WHERE empresa_id = ${empresa_id} AND id_servidor = ${id_servidor};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrar(empresa_id, endereco_id, endereco_mac, apelido, modelo) {
  console.log(
    "[servidorModel.js] function cadastrar():",
    empresa_id,
    endereco_id,
    endereco_mac,
    apelido,
    modelo,
  );

  const instrucaoSql = `
    INSERT INTO servidor(empresa_id, endereco_id, endereco_mac, apelido, modelo) VALUES(${empresa_id}, ${endereco_id}, '${endereco_mac}', '${apelido}', '${modelo}');
    `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function editar(empresa_id, id_servidor, endereco_mac, apelido, modelo) {
  console.log(
    "[servidorModel.js] function editar():",
    empresa_id,
    id_servidor,
    endereco_mac,
    apelido,
    modelo,
  );

  const instrucaoSql = `
    UPDATE servidor SET endereco_mac = '${endereco_mac}', apelido = '${apelido}', modelo = '${modelo}' WHERE empresa_id = ${empresa_id} AND id_servidor = '${id_servidor}';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function remover(id_servidor, empresa_id) {
  console.log(
    "[servidorModel.js] function remover():",
    id_servidor,
    empresa_id,
  );

  const instrucaoSql = `
    DELETE FROM servidor WHERE id_servidor = ${id_servidor} AND empresa_id = ${empresa_id};
    `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  buscar,
  buscarPorID,
  cadastrar,
  remover,
  editar,
};
