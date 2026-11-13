const database = require("../database/config");

function buscarLogHoje(empresa_id) {
  const instrucaoSql = `
   SELECT COUNT(log_id) as log FROM log
          WHERE servidor_id = ${empresa_id};
  `;

  console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function buscarLogPorComponente(empresa_id, componente_id){
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
   const instrucaoSql = `select l.status, count(*) as total
from log l
join (
  select servidor_id, max(data_hora) as ultima
  from log
  where empresa_id = ${empresa_id}
  group by servidor_id
) u on u.servidor_id = l.servidor_id and u.ultima = l.data_hora
group by l.status;`

return database.executar(instrucaoSql);
}


function montarCardInfo(empresa_id,servidor_id,status,componente_id,descricao_analista,descricao_ia){
    const instrucaoSql = `select ${servidor_id}, ${status}, ${componente_id}, ${descricao_analista}, ${descricao_ia}
          from log
          where empresa_id = ${empresa_id};`;  
    
    console.log("[logModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarMaiorUso(empresa_id){
          const instrucaoSql = `select s.nome as servidor, c.nome as componente, l.valor_uso
from log l
join servidor s   on s.id_servidor   = l.servidor_id
join componente c on c.id_componente = l.componente_id
where l.empresa_id = ${empresa_id}
  and l.data_hora >= curdate()
  and l.valor_uso is not null
order by l.valor_uso desc
limit 1;`

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
