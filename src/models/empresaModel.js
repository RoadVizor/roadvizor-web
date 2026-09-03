var database = require("../database/config");

function cadastrar(cnpj, razao_social, nome_fantasia, email, senha) {
  console.log(
    "[empresaModel.js] function cadastrar():",
    cnpj,
    razao_social,
    nome_fantasia,
    email,
    senha,
  );

  var instrucaoSql = `
    CALL sp_cadastrar_empresa('${cnpj}', '${razao_social}', '${nome_fantasia}', '${email}', '${senha}');
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarPorID(id_empresa) {
  console.log("[empresaModel.js] function buscarPorID():", id_empresa);

  var instrucaoSql = `
     SELECT * FROM empresa WHERE id_empresa = ${id_empresa}
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  cadastrar,
  buscarPorID,
};
