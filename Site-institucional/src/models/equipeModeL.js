const database = require("../database/config");


// Essa função lista todos os colaboradoes do sistema roadvizor

function listarColaboradors(){

    const instrucaoSql = `
    SELECT *
    FROM usuario;
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    listarColaboradors
}
    