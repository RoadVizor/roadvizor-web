const database = require("../database/config");

function buscarComponenteId(nome) {
    const instrucaoSql = `
        SELECT id_componente
        FROM componente
        WHERE nome = '${nome}'
        LIMIT 1;
    `;

    return database.executar(instrucaoSql);
}

function salvarLog({ servidor_id, empresa_id, componente_id, titulo, descricao_ia, status, valor_uso }) {

    const escapar = (valor) => String(valor).replace(/'/g, "''");

    const instrucaoSql = `
        INSERT INTO log (
            servidor_id,
            empresa_id,
            componente_id,
            titulo,
            descricao_ia,
            status,
            valor_uso
        )
        VALUES (
            ${Number(servidor_id)},
            ${Number(empresa_id)},
            ${Number(componente_id)},
            '${escapar(titulo)}',
            '${escapar(descricao_ia)}',
            '${escapar(status)}',
            ${valor_uso === null || valor_uso === undefined ? 'NULL' : Number(valor_uso)}
        );
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarComponenteId,
    salvarLog
};