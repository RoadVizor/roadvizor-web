const database = require("../database/config");

function kpiServidoresAtivos(id_empresa){
    const instrucaoSql = `select count(DISTINCT sc.servidor_id) servidores_ativos 
                          from servidor_componente sc 
                          where sc.empresa_id = ${id_empresa} and sc.monitorado = 1;`
    return database.executar(instrucaoSql)
}

function listarUsuariosPorEmpresa(id_empresa){
    const instrucaoSql = `select count(*) from usuario u
                          join empresa e on e.id_empresa = u.empresa_id
                           where u.empresa_id = ${id_empresa};`
    return database.executar(instrucaoSql)
}

function kpiAlertasRecentes(id_empresa) {
    const instrucaoSql = `select count(*) as alertas_recentes
                          from log l
                          join servidor s on s.id_servidor = l.servidor_id
                          where s.empresa_id = ${id_empresa};`
    return database.executar(instrucaoSql)
}


module.exports = {
    kpiServidoresAtivos,
    listarUsuariosPorEmpresa,
    kpiAlertasRecentes,
}