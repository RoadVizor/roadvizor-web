const database = require("../database/config");

function buscarServidores(empresa_id) {
    const instrucaoSql = `
        SELECT id_servidor, apelido, modelo
        FROM servidor
        WHERE empresa_id = ?
        ORDER BY apelido;
    `;

    return database.executarComParametros(instrucaoSql, [empresa_id]);
}

function buscarServidorPorID(empresa_id, servidor_id) {
    const instrucaoSql = `
        SELECT id_servidor
        FROM servidor
        WHERE empresa_id = ? AND id_servidor = ?;
    `;

    return database.executarComParametros(instrucaoSql, [
        empresa_id,
        servidor_id
    ]);
}

function cadastrar(
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

function buscarRelatorios(empresa_id) {
    const instrucaoSql = `
        SELECT
            r.id_relatorio,
            r.servidor_id,
            r.usuario_id,
            r.tipo_ocorrencia,
            r.recurso_afetado,
            r.prioridade,
            r.descricao,
            r.status,
            r.data_registro,
            r.atualizado_em,
            s.apelido AS servidor,
            u.nome AS usuario
        FROM relatorio_ocorrencia r
        INNER JOIN servidor s
            ON r.servidor_id = s.id_servidor
        INNER JOIN usuario u
            ON r.usuario_id = u.id_usuario
        WHERE s.empresa_id = ?
        ORDER BY r.data_registro DESC;
    `;

    return database.executarComParametros(instrucaoSql, [empresa_id]);
}

module.exports = {
    buscarServidores,
    buscarServidorPorID,
    cadastrar,
    buscarRelatorios
};
