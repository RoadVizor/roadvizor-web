const database = require("../database/config");

function autenticar(email, senha) {
  console.log("[usuarioModel.js] function entrar(): ", email, senha);
  const instrucaoSql = `
    SELECT id_usuario, empresa_id, nome, email, nivel_acesso 
    FROM usuario 
    WHERE email = '${email}' AND senha = SHA2('${senha}', 256);
    `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL: \n" + instrucaoSql,
  );

  return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, empresaId) {
  console.log(
    "[usuarioModel.js] function cadastrar():",
    nome,
    email,
    senha,
    empresaId,
  );

  const instrucaoSql = `
      INSERT INTO usuario (nome, email, senha, empresa_id) VALUES ('${nome}', '${email}', SHA2('${senha}', 256), ${empresaId});
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  autenticar,
  cadastrar,
};
