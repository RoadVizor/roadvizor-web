const database = require("../database/config");

function buscar(empresa_id) {
  const instrucaoSql = `
    SELECT * FROM servidor WHERE empresa_id = ${empresa_id};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarPorID(empresa_id, id_servidor) {
  const instrucaoSql = `
    SELECT * FROM servidor 
    WHERE empresa_id = ${empresa_id} AND id_servidor = ${id_servidor};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrar(empresa_id, endereco_id, endereco_mac, apelido, modelo) {
  const idEndereco = endereco_id || 1;

  const instrucaoSql = `
    INSERT INTO servidor(empresa_id, endereco_id, endereco_mac, apelido, modelo) 
    VALUES (${empresa_id}, '${idEndereco}', '${endereco_mac}', '${apelido}', '${modelo}');
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function editar(empresa_id, id_servidor, campos = {}) {
  const chaveCampos = Object.keys(campos);
  if (chaveCampos.length <= 0) return; //pois nenhum campo está sendo alterado.

  // Obs: converte campos enviados para atualização para um formato que o SQL aceita.
  // de: { campoA: "valorA", campoB: "valorB" }
  // para: campoA="valorA", campoB ="valorB"
  const camposTratados = chaveCampos
    .map((chave) => [chave, `"${campos[chave]}"`].join("="))
    .join(", ");

  const instrucaoSql = `
    UPDATE servidor SET ${camposTratados} 
    WHERE empresa_id = ${empresa_id} AND id_servidor = ${id_servidor};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function remover(empresa_id, id_servidor) {
  console.log(
    "[servidorModel.js] function remover():",
    id_servidor,
    empresa_id,
  );

  const instrucaoSql = `
    DELETE FROM servidor 
    WHERE empresa_id = ${empresa_id} AND id_servidor = ${id_servidor};
  `;

  console.log("[servidorModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function existePorID(id_servidor) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM servidor WHERE id_servidor = ${id_servidor};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

function existePorEnderecoMAC(endereco_mac) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM servidor WHERE endereco_mac = '${endereco_mac}';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

// =============================================================//


function listarServidores(id_empresa){
    const instrucaoSql = `select s.apelido, s.endereco_mac, s.modelo from servidor s
                          join empresa e on e.id_empresa = s.empresa_id
                          where s.empresa_id = ${id_empresa}`
    return database.executar(instrucaoSql)
}

function listarStatusServidor(id_empresa){
    const instrucaoSql = `select count(*) as total
                          from servidor s
                          join log l on l.servidor_id = s.id_servidor
                          where empresa_id = ${id_empresa}
                          GROUP BY l.status;`
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

module.exports = {
  buscar,
  buscarPorID,
  cadastrar,
  editar,
  remover,
  existePorID,
  existePorEnderecoMAC,
  listarServidores,
  listarDetalhesServidor,
  listarStatusServidor
};
