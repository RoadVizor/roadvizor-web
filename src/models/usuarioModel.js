var database = require("../database/config")

function autenticar(email, senha) {
    console.log("[usuarioModel.js] function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT id, nome, email, fk_empresa as empresaId FROM usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, cargo, fkEmpresa) {
    console.log("[usuarioModel.js] function cadastrar():", nome, email, senha, fkEmpresa);
    
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, cargo, empresa_id) VALUES ('${nome}', '${email}', '${senha}', '${cargo}' '${empresa_id}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar
};