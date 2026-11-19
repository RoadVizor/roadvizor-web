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
    SELECT COALESCE(l.status, 'inativo') AS status, COUNT(*) AS total
    FROM servidor s
    LEFT JOIN log l
      ON l.servidor_id = s.id_servidor
     AND l.empresa_id = s.empresa_id
     AND l.data_hora = (
       SELECT MAX(lx.data_hora)
       FROM log lx
       WHERE lx.servidor_id = s.id_servidor
         AND lx.empresa_id = s.empresa_id
     )
    WHERE s.empresa_id = ${empresa_id}
    GROUP BY COALESCE(l.status, 'inativo');
  `;

return database.executar(instrucaoSql);
}


function montarCardInfo(empresa_id,servidor_id){
  const filtroServidor = servidor_id ? `AND s.id_servidor = ${Number(servidor_id)}` : '';
  const instrucaoSql = `
    SELECT
      s.id_servidor AS servidor_id,
      s.apelido AS servidor,
      c.nome AS componente,
      l.componente_id,
      l.status,
      l.valor_uso,
      l.descricao_ia,
      l.data_hora
    FROM servidor s
    LEFT JOIN (
      SELECT lx.* FROM log lx
      INNER JOIN (
        SELECT servidor_id, MAX(data_hora) AS max_dt
        FROM log
        WHERE empresa_id = ${Number(empresa_id)}
        GROUP BY servidor_id
      ) grouped
      ON lx.servidor_id = grouped.servidor_id AND lx.data_hora = grouped.max_dt
      WHERE lx.empresa_id = ${Number(empresa_id)}
      ORDER BY lx.servidor_id, lx.data_hora DESC, lx.log_id DESC
    ) l ON l.servidor_id = s.id_servidor
    LEFT JOIN componente c ON c.id_componente = l.componente_id
    WHERE s.empresa_id = ${Number(empresa_id)}
    ${filtroServidor}
    ;
  `;
    
    console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarMaiorUso(empresa_id){
  const instrucaoSql = `
    SELECT s.apelido AS servidor, c.nome AS componente, l.valor_uso, l.status, sc.limite_max
    FROM log l
    JOIN servidor s ON s.id_servidor = l.servidor_id
    JOIN componente c ON c.id_componente = l.componente_id
    LEFT JOIN servidor_componente sc
      ON sc.servidor_id = l.servidor_id
     AND sc.componente_id = l.componente_id
    WHERE l.empresa_id = ${Number(empresa_id)}
      AND l.data_hora >= CURDATE()
      AND l.valor_uso IS NOT NULL
    ORDER BY l.valor_uso DESC
    LIMIT 1;
  `;

  return database.executar(instrucaoSql);
}

function buscarHistorico(empresa_id, servidor_id, componente_id, dias) {
  const instrucaoSql = `
    SELECT DATE_FORMAT(l.data_hora, '%d/%m') AS dia,
           MAX(l.valor_uso) AS uso,
           MAX(sc.limite_max) AS limite_max
    FROM log l
    LEFT JOIN servidor_componente sc
      ON sc.servidor_id = l.servidor_id
     AND sc.componente_id = l.componente_id
    WHERE l.empresa_id = ${Number(empresa_id)}
      AND l.servidor_id = ${Number(servidor_id)}
      AND l.componente_id = ${Number(componente_id)}
      AND l.valor_uso IS NOT NULL
      AND l.data_hora >= CURDATE() - INTERVAL ${Number(dias)} DAY
    GROUP BY DATE(l.data_hora), DATE_FORMAT(l.data_hora, '%d/%m')
    ORDER BY DATE(l.data_hora);
  `;

  console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarLogs(empresa_id,servidor_id,componente_id,dias){
  const instrucaoSql = `SELECT l.log_id, l.titulo, l.status, l.valor_uso, l.data_hora
FROM log l
WHERE l.empresa_id = ${Number(empresa_id)}
  AND l.servidor_id = ${Number(servidor_id)}
  AND l.componente_id = ${Number(componente_id)}
  AND l.data_hora >= NOW() - INTERVAL ${Number(dias)} DAY
ORDER BY l.data_hora DESC
LIMIT 50;`

  console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  buscarLogHoje,
  buscarLogPorComponente,
  montarCardInfo,
  montarGraficoKpi,
  buscarLogPorComponente,
  buscarMaiorUso,
  buscarHistorico,
  listarLogs
};
