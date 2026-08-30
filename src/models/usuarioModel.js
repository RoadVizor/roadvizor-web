var database = require("../database/config");

function autenticar(email, senha) {
  console.log("[usuarioModel.js] function entrar(): ", email, senha);
  var instrucaoSql = `
    SELECT id_usuario, empresa_id, nome, email, cargo, nivel_acesso 
    FROM usuario 
    WHERE email = '${email}' AND senha = SHA2('${senha}', 256);
    `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL: \n" + instrucaoSql,
  );

  return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, cargo, empresaId) {
  console.log(
    "[usuarioModel.js] function cadastrar():",
    nome,
    email,
    senha,
    empresaId,
  );

  var instrucaoSql = `
      INSERT INTO usuario (nome, email, senha, cargo, empresa_id) VALUES ('${nome}', '${email}', SHA2('${senha}', 256), '${cargo}', ${empresaId});
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  autenticar,
  cadastrar,
};
