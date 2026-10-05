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

function listarServidores(id_empresa){
    const instrucaoSql = `select s.apelido, s.endereco_mac, s.modelo from servidor s
                          join empresa e on e.id_empresa = s.empresa_id
                          where s.empresa_id = ${id_empresa}`
    return database.executar(instrucaoSql)
}

function listarStatusServidor(id_empresa){
    const instrucaoSql = `select status, count(*) as total
                          from servidor
                          where empresa_id = ${id_empresa}
                          GROUP BY status;`
    return database.executar(instrucaoSql)
}

function buscarNomeEmpresa(id_empresa) {
    const instrucaoSql = `select nome_fantasia from empresa
                          where id_empresa = ${id_empresa};`
    return database.executar(instrucaoSql)
}

function kpiAlertasRecentes(id_empresa) {
    const instrucaoSql = `select count(*) as alertas_recentes
                          from log l
                          join servidor s on s.id_servidor = l.servidor_id
                          where s.empresa_id = ${id_empresa};`
    return database.executar(instrucaoSql)
}

function listarDetalhesServidor(id_empresa, id_servidor) {
    const instrucaoSql = `select c.nome, c.unidade_medida,
                          sc.limite_max, sc.limite_min,
                          sc.capacidade_total, sc.monitorado
                          from servidor_componente sc
                          join componente c on c.id_componente = sc.componente_id
                          where sc.empresa_id = ${id_empresa}
                            and sc.servidor_id = ${id_servidor};`
    return database.executar(instrucaoSql)
}

function cadastrarServidor(id_empresa, endereco_id, endereco_mac, apelido, modelo) {
    const instrucaoSql = `insert into servidor (empresa_id, endereco_id, endereco_mac, apelido, modelo)
                          values (${id_empresa}, ${endereco_id}}, '${endereco_mac}', '${apelido}', '${modelo}');`
    return database.executar(instrucaoSql)
}

module.exports = {
    kpiServidoresAtivos,
    listarUsuariosPorEmpresa,
    listarServidores,
    listarStatusServidor,
    buscarNomeEmpresa,
    kpiAlertasRecentes,
    listarDetalhesServidor,
    cadastrarServidor
}