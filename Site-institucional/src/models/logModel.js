const database = require("../database/config");

function buscarLogHoje(empresa_id) {
  const instrucaoSql = `
   SELECT COUNT(log_id) as log FROM log
          WHERE servidor_id = ${empresa_id};
  `;

  console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function buscarLogPorComponente(empresa_id, componente_id){
    const instrucaoSql = `SELECT COUNT`
    
    console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}         


function montarCardInfo(empresa_id){
    const instrucaoSql = ``;  
    
    console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  buscarLogHoje,
  buscarLogPorComponente,
};
