const mysql = require("mysql2");

const mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

function executar(instrucao) {
    if (
        process.env.AMBIENTE_PROCESSO !== "producao" &&
        process.env.AMBIENTE_PROCESSO !== "desenvolvimento"
    ) {
        return Promise.reject("AMBIENTE NÃO CONFIGURADO");
    }

    return new Promise(function (resolve, reject) {
        const conexao = mysql.createConnection(mySqlConfig);

        conexao.query(instrucao, function (erro, resultados) {
            conexao.end();

            if (erro) {
                reject(erro);
                return;
            }

            resolve(resultados);
        });
    });
}

function executarComParametros(instrucao, parametros = []) {
    if (
        process.env.AMBIENTE_PROCESSO !== "producao" &&
        process.env.AMBIENTE_PROCESSO !== "desenvolvimento"
    ) {
        return Promise.reject("AMBIENTE NÃO CONFIGURADO");
    }

    return new Promise(function (resolve, reject) {
        const conexao = mysql.createConnection(mySqlConfig);

        conexao.execute(instrucao, parametros, function (erro, resultados) {
            conexao.end();

            if (erro) {
                reject(erro);
                return;
            }

            resolve(resultados);
        });
    });
}

module.exports = {
    executar,
    executarComParametros
};
