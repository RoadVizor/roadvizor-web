var database = require("../database/config");

function cadastrar(empresa_id, endereco_id, endereco_mac, apelido, modelo) {
  console.log(
    "[servidorModel.js] function cadastrar():",
    empresa_id,
    endereco_id,
    endereco_mac,
    apelido,
    modelo
  );

  var instrucaoSql = `
    INSERT INTO servidor VALUES('${empresa_id}', '${endereco_id}', '${endereco_mac}', '${apelido}', '${modelo}');
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function remover(id_servidor, empresa_id) {
  console.log(
    "[servidorModel.js] function remover():",
    id_servidor,
    empresa_id
  );

  var instrucaoSql = `
    DELETE FROM servidor WHERE id_servidor = '${id_servidor}' AND empresa_id = '${empresa_id}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function editar() {
  console.log(
    "[servidorModel.js] function cadastrar():",
    id_servidor,
    endereco_mac,
    apelido,
    modelo
  );

  var instrucaoSql = `
    UPDATE servidor SET endereco_mac = '${endereco_mac}', apelido = '${apelido}', modelo = '${modelo}' WHERE id_servidor = '${id_servidor}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  cadastrar,
  remover,
  editar
}