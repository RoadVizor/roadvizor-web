const database = require("../database/config");

async function buscarServidores(empresa_id) {
    const instrucaoSql = `
        SELECT
            id_servidor,
            apelido,
            modelo,
            endereco_mac
        FROM servidor
        WHERE empresa_id = ?
        ORDER BY apelido;
    `;

    return database.executarComParametros(instrucaoSql, [empresa_id]);
}

async function verificarServidor(servidor_id, empresa_id) {
    const instrucaoSql = `
        SELECT id_servidor
        FROM servidor
        WHERE id_servidor = ?
          AND empresa_id = ?;
    `;

    return database.executarComParametros(instrucaoSql, [
        servidor_id,
        empresa_id
    ]);
}

async function cadastrarOcorrencia(
    servidor_id,
    usuario_id,
    tipo_ocorrencia,
    recurso_afetado,
    prioridade,
    descricao
) {
    const instrucaoSql = `
        INSERT INTO relatorio_ocorrencia (
            servidor_id,
            usuario_id,
            tipo_ocorrencia,
            recurso_afetado,
            prioridade,
            descricao
        )
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    return database.executarComParametros(instrucaoSql, [
        servidor_id,
        usuario_id,
        tipo_ocorrencia,
        recurso_afetado,
        prioridade,
        descricao
    ]);
}

async function buscarOcorrencias(empresa_id) {
    const instrucaoSql = `
        SELECT
            ro.id_relatorio,
            ro.servidor_id,
            s.apelido AS servidor,
            ro.tipo_ocorrencia,
            ro.recurso_afetado,
            ro.prioridade,
            ro.descricao,
            ro.status,
            ro.data_registro,
            ro.atualizado_em
        FROM relatorio_ocorrencia ro
        INNER JOIN servidor s
            ON ro.servidor_id = s.id_servidor
        WHERE s.empresa_id = ?
        ORDER BY ro.data_registro DESC;
    `;

    return database.executarComParametros(instrucaoSql, [empresa_id]);
}

module.exports = {
    buscarServidores,
    verificarServidor,
    cadastrarOcorrencia,
    buscarOcorrencias
};
