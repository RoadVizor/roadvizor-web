const database = require("../database/config");

function buscarLogHoje(empresa_id) {
  const instrucaoSql = `
    SELECT COUNT(*) AS log
    FROM log
    WHERE empresa_id = ${empresa_id}
      AND DATE(data_hora) = CURDATE();
  `;

  console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function buscarLogPorComponente(empresa_id){
    const instrucaoSql = `select c.nome as componente, count(l.log_id) as total
from componente c
left join log l
  on l.componente_id = c.id_componente
 and l.empresa_id = ${empresa_id}
 and l.data_hora >= curdate() - interval 7 day
group by c.id_componente, c.nome
order by c.id_componente;`
    
    console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}         


function montarGraficoKpi(empresa_id){
   const instrucaoSql = `
    SELECT l.status, COUNT(*) AS total
    FROM log l
    JOIN (
      SELECT servidor_id, MAX(data_hora) AS ultima
      FROM log
      WHERE empresa_id = ${empresa_id}
      GROUP BY servidor_id
    ) u ON u.servidor_id = l.servidor_id AND u.ultima = l.data_hora
    GROUP BY l.status;
  `;

return database.executar(instrucaoSql);
}


function montarCardInfo(empresa_id,servidor_id,status,componente_id,descricao_ia){
    const filtroServidor = servidor_id ? `AND l.servidor_id = ${servidor_id}` : '';
    const instrucaoSql = `
      SELECT s.id_servidor AS servidor_id, s.nome AS servidor, c.nome AS componente,
             l.status, l.valor_uso, l.descricao_ia, l.data_hora
      FROM servidor s
      LEFT JOIN log l ON l.servidor_id = s.id_servidor
        AND l.empresa_id = ${empresa_id}
        AND l.data_hora = (
          SELECT MAX(data_hora) FROM log lx WHERE lx.servidor_id = s.id_servidor AND lx.empresa_id = ${empresa_id}
        )
      LEFT JOIN componente c ON c.id_componente = l.componente_id
      WHERE s.empresa_id = ${empresa_id}
      ${filtroServidor}
      ;
    `;
    
    console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarMaiorUso(empresa_id){
          const instrucaoSql = `
    SELECT s.apelido AS servidor, c.nome AS componente, l.valor_uso
    FROM log l
    JOIN servidor s ON s.id_servidor = l.servidor_id
    JOIN componente c ON c.id_componente = l.componente_id
    WHERE l.empresa_id = ${empresa_id}
      AND l.data_hora >= CURDATE()
      AND l.valor_uso IS NOT NULL
    ORDER BY l.valor_uso DESC
    LIMIT 1;
  `;

return database.executar(instrucaoSql);
}

module.exports = {
  buscarLogHoje,
  buscarLogPorComponente,
  montarCardInfo,
  montarGraficoKpi,
  buscarLogPorComponente,
  buscarMaiorUso
};
