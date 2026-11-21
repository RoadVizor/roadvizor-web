# AGENTS.md — RoadVizor Web · Tela de Relatórios (persona Jorge)

Guia para agentes de código (Claude Code, Codex, Cursor etc.) que trabalham no repositório `roadvizor-web`.
Escopo atual: **tela de Relatórios** (`public/pages/dashboard/relatorios.html`) e a API `/api/log/*` que a alimenta.

> Convenção de marcação: itens com **[CONFIRMAR]** são suposições inferidas do código/prints e ainda não validadas pela equipe. Não os trate como regra fechada; pergunte ou deixe `TODO`.

---

## 1. Produto e negócio

**RoadVizor** monitora o uso de recursos computacionais (CPU, RAM, Disco, Rede) dos **servidores locais (edge)** de pedágios **Free Flow** e entrega métricas, logs e alertas às concessionárias.

- Cliente: concessionárias de rodovia. Usuários reais: técnicos de TI em **CCO** (Centro de Controle Operacional).
- Por que importa: downtime em pórtico = perda imediata de arrecadação + risco de quebra de **SLA da ANTT** (multas, até caducidade da concessão). Tudo na UI deve ajudar a **antecipar incidentes e priorizar o que é crítico**.
- O sistema é **estritamente de monitoramento passivo**: emite alertas, **nunca executa contramedidas**. Não crie botões/rotas que reiniciem, corrijam ou alterem servidores.
- Escopo apenas **Free Flow**; monitora somente os componentes marcados (`servidor_componente.monitorado`).
- Notificações oficiais saem por **Jira** e **Slack** (fora do escopo desta tela, mas a tela deve ser coerente com elas).

### Fluxo de dados (resumo)
`client Python (no servidor do pórtico)` → `S3 Data Lake (bronze → silver → gold)` → `.jar (Java) grava logs` → **MySQL (Docker, EC2)** → `Node/Express` → `front`.
A tela de Relatórios **consome a tabela `log` via API Node**. Ela não lê S3 nem o JSON Gold diretamente.

### Persona desta tela
- **Jorge Paulo — Supervisor de TI do CCO.** Quer ver tudo em um lugar, com status e indicadores, **sem depender de consultar analistas**; precisa distinguir rápido o que é crítico e acompanhar SLAs.
- Os relatórios exibidos derivam do trabalho da **Vitória Nogueira (Analista de Infraestrutura)**, que trata alertas por componente. A Vitória vê métrica bruta; o Jorge vê **visão executiva**.
- Princípio de design: leitura em segundos, destaque ao crítico, texto claro e objetivo, sem jargão desnecessário. Persona com rotina instável e estressada: nada de telas poluídas.
- Nota: um slide chama o supervisor de "Rafael Souza (31)" e outro de "Jorge Paulo (44)". **Use Jorge Paulo.** [CONFIRMAR]

---

## 2. Stack e estrutura

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express 4, `mysql2`, `jsonwebtoken`, `cookie-parser`, `cors`, `dotenv` |
| Banco | MySQL (container Docker) |
| Front | HTML + **JavaScript puro** (sem framework), Tailwind CSS v4 (CLI), Chart.js 4, Phosphor Icons (CDN) |
| Idioma | pt-BR (UI, comentários, nomes de domínio) |

```
app.js                      # bootstrap Express; escolhe .env/.env.dev em ambiente_processo
src/routes/                 # router.js, index.js, servidor.js, log.js
src/controllers/            # logController.js, ...
src/models/                 # logModel.js, empresaModel.js, servidorModel.js
src/middlewares/auth.js     # verificarAutenticacao (JWT; preenche req.usuario)
src/database/config.js      # database.executar(sql)
src/utils                   # isMissing, ...
public/
  pages/dashboard/relatorios.html
  css/ style.css (entrada Tailwind) · output.css (GERADO) · report.css
  js/ auth.js · components/ (sidebar, listaServidores, detalhes, nivel_acesso) · utils/ (storage, selectDiv, toast)
```

Chart.js é servido em `/libs/chart.js/chart.umd.js` (mapeado para `node_modules/chart.js/dist`).

### Comandos
```bash
npm run dev     # tailwind --watch + nodemon (desenvolvimento)
npm start       # build tailwind + node app.js
```
- **Nunca edite `public/css/output.css`** (gerado pelo Tailwind). Estilos próprios da tela vão em `public/css/report.css`; tokens/base em `style.css`.
- Ambiente: `ambiente_processo` em `app.js` define `.env.dev` vs `.env`. Não commitar `.env*`.

---

## 3. Arquitetura da API (padrão obrigatório)

Camadas: **route → controller → model**. Sem SQL em controller, sem regra de negócio em route.

Todas as rotas `/api/log/*` passam por `verificarAutenticacao`. O **`empresa_id` vem sempre de `req.usuario.empresa_id` (token)**, **nunca** de query/body. Isso garante o isolamento entre empresas (multi-tenant).

| Rota (GET `/api/log/...`) | Controller → Model | Uso na tela |
|---|---|---|
| `buscar-hoje` | `buscarLogHoje` | KPI "Logs registrados hoje" |
| `grafico-kpi` | `montarGraficoKpi` | Donut "Status dos servidores" |
| `buscar-maior-uso` | `buscarMaiorUso` | KPI "Maior uso agora" |
| `buscar-componente` | `buscarLogPorComponente` | "Logs por componente" |
| `renderizar-card` (`?servidor_id=`) | `montarCardInfo` | Cards por servidor |
| `historico` (`?servidor_id&componente_id&dias`) | `buscarHistorico` | Gráfico do relatório detalhado (dias máx. 30) |

**Contrato de resposta**: sucesso `200 { message, log }` (o front lê `json.log`; sempre array de linhas). Erros: `400` (parâmetro ausente), `404` (empresa/servidor não encontrado), `403` com `{ message }` para erro do banco, `500` genérico. Mantenha esse formato.

### Regras de implementação
1. **Toda query filtra por `empresa_id`**, inclusive subselects e joins (`servidor`, `log`, `servidor_componente`).
2. **Proibido interpolar entrada do usuário em SQL.** Hoje o model usa template string. Em código novo/alterado, use `?` com parâmetros se `database.executar` suportar (verificar `src/database/config.js`), ou no mínimo `Number()` em todo id/inteiro (como já faz `buscarHistorico`). `montarCardInfo` interpola `servidor_id` sem cast: **corrigir ao tocar nela**.
3. Valide existência (`empresaModel.existePorID`, `servidorModel.buscarPorID`) **dentro do `try`**, não fora. Evite duplicar o bloco de validação: extraia helper/middleware ao refatorar.
4. Não registrar dados sensíveis em log (`senha`, token, `api_token_jira`).
5. Senhas: **SHA-256 antes de gravar** (RNF05). `api_token_jira` e `senha` nunca vão ao front (RF04).

---

## 4. Modelo de dados relevante

Tabelas (DER): `empresa`, `usuario`, `endereco`, `servidor`, `componente`, `servidor_componente`, `log`.

`log` foi **modificada** além do DER original. **Schema real (fonte da verdade):**

```sql
CREATE TABLE log (
  log_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  servidor_id INT NOT NULL,
  empresa_id INT NOT NULL,
  componente_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao_ia TEXT,
  status ENUM('Baixo','Médio','Crítico','Inativo') NOT NULL,
  valor_uso DECIMAL(5,2),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_servidor_log FOREIGN KEY (servidor_id, empresa_id) REFERENCES servidor (id_servidor, empresa_id),
  CONSTRAINT fk_componente_log FOREIGN KEY (componente_id) REFERENCES componente (id_componente),
  INDEX idx_log_empresa_data (empresa_id, data_hora)
);
```

- **Não existe coluna `descricao`**: o texto do log é `descricao_ia` (pode ser `NULL`). Não referenciar `descricao`.
- `status` é **severidade do alerta** gravada pelo pipeline (não é calculada no front). Valores exatos, com acento e maiúscula: `Baixo`, `Médio`, `Crítico`, `Inativo`.
- `valor_uso` é `DECIMAL(5,2)`, em **%**, e pode ser `NULL` (sempre filtrar `valor_uso IS NOT NULL` ao agregar).
- `titulo` é obrigatório e hoje **não é exibido** na tela.
- `servidor` precisa ter chave única `(id_servidor, empresa_id)` (exigida pela FK composta). Ao inserir/consultar log, `servidor_id` e `empresa_id` devem ser coerentes.
- Índice existente: `(empresa_id, data_hora)`. As consultas por servidor+componente (`historico`, último log por servidor) se beneficiariam de `(empresa_id, servidor_id, componente_id, data_hora)`. **Sugestão**, só criar com aprovação da equipe de banco.

- `servidor_componente`: `limite_max`, `limite_min`, `capacidade_total`, `monitorado` por (servidor, componente, empresa). **É o limite configurado pelo analista.**
- `componente`: `nome`, `unidade_medida`. Nomes vistos no código/UI: `cpu`, `ram`, `disco`/`gpu`/`placa_rede` (ver `ROTULO` no front). [CONFIRMAR lista oficial]
- Camada Gold (referência de regra): `em_alerta = (limite_max != None and valor > limite_max) or (limite_min != None and valor < limite_min)`. A unidade varia por componente (CPU em `%`; RAM e Disco em `GiB`).

---

## 5. Regras de negócio da tela de Relatórios

### 5.1 Status do servidor
O banco grava severidade (`Baixo`, `Médio`, `Crítico`, `Inativo`); a UI mostra quatro estados. Mapeamento oficial **[CONFIRMAR Baixo = Normal]**:

| `log.status` (banco) | Chave no front | Rótulo na UI |
|---|---|---|
| `Baixo` | `normal` | Normal |
| `Médio` | `atencao` | Atenção |
| `Crítico` | `critico` | Crítico |
| `Inativo` (ou servidor sem log) | `inativo` | Inativo |

Ordem de gravidade: Normal → Atenção → Crítico. Inativo é um estado à parte.
- O status exibido é o do **log mais recente** do servidor (`MAX(data_hora)`).
- **Inativo** = servidor sem nenhum log (hoje via `COALESCE(l.status,'inativo')`). **[CONFIRMAR]** se também deve valer para "último log mais antigo que N minutos"; hoje **não** vale e um servidor parado continua com o último status.
- **BUG ATUAL:** `statusDe()` no front só reconhece "crit", "aten|alert" e "normal|ok"; qualquer outro texto cai em `inativo`. Com o ENUM real, **`Baixo` e `Médio` viram "Inativo"** na UI (donut e cards errados). Corrigir `statusDe` para o mapeamento da tabela acima (normalizando acento/caixa: `baixo` → normal, `medio` → atencao, `critico` → critico, `inativo` → inativo). O caso padrão (valor desconhecido) deve ser tratado e logado, não silenciosamente "inativo".
- Mantenha **um único** mapa banco→front (constante) e reutilize `statusDe`; não duplique essa lógica em outros arquivos (`listaServidores.js`, `detalhes.js`).
- Os limiares que definem Baixo/Médio/Crítico são aplicados **no pipeline (ETL/.jar), não nesta tela**. **[CONFIRMAR regra]** O front **nunca** recalcula severidade; apenas exibe `log.status`. Não invente números.

### 5.2 Uso vs limite (cuidado com unidades)
`valor_uso` é exibido e graficado **em %** (eixo Y 0–100, tooltip `%`). Já `servidor_componente.limite_max` pode estar em **unidade absoluta** (ex.: 14336 para RAM, 200 para Disco em GiB; 80 para CPU em %).
- Comparar `valor_uso` (%) com `limite_max` absoluto gera absurdos como **"limite de 400%"** (visto na tela do SRV-BR11).
- **Regra:** só compare/mostre `uso` e `limite` na **mesma unidade**. Para componentes não-percentuais, converter para %: `limite_pct = limite_max / capacidade_total * 100` (ou outro critério acordado). **[CONFIRMAR]** antes de alterar. Enquanto isso, **não propague `limite_max` bruto como "%"** em código novo.
- O front hoje faz `limite ${limite}%` e `uso.filter(u => u > limite)`; ambos dependem dessa correção.

### 5.3 KPIs
- **Logs registrados hoje**: `COUNT(*)` com `DATE(data_hora) = CURDATE()` da empresa.
- **Logs por componente**: hoje usa **janela de 7 dias**, divergindo do KPI acima (que é só hoje). É por isso que aparece "0 hoje" com "5 em Disco". **Alinhar janelas** com o filtro de período da tela (Hoje / 7 / 15 dias). **[CONFIRMAR]** qual janela é a correta para cada card.
- **Maior uso agora**: maior `valor_uso` desde `CURDATE()`. O `JOIN servidor_componente` **não casa `componente_id`**, o que duplica linhas e pode trazer `limite_max` de outro componente. Ao alterar, adicionar `AND sc.componente_id = l.componente_id`.
- **Donut de status**: contagem de servidores por status do último log; centro mostra o total.
  - **Risco de duplicidade:** `montarGraficoKpi` e `montarCardInfo` juntam `log` por `data_hora = MAX(data_hora)` do servidor. Se o servidor gravar **vários componentes no mesmo `data_hora`** (comum no ciclo de coleta), o JOIN retorna **várias linhas por servidor**: o donut conta o mesmo servidor mais de uma vez e aparecem cards repetidos. Regra: resultado deve ter **no máximo uma linha por servidor**. Ao corrigir, escolher um critério determinístico (ex.: o log de maior severidade entre os mais recentes, ou o de maior `log_id`) e **[CONFIRMAR]** qual a equipe prefere.

### 5.4 Cards de servidores
Um card por servidor (inclusive sem logs). Classe visual por status; botão **Abrir Relatório** (destaque `primary` quando crítico). Texto vem de `descricao_ia`; sem registro → "Sem registros recentes para este servidor.".
- O rótulo do badge para `atencao` é hoje **"Alerta"** (no mapa `STATUS`), mas a legenda/filtro usam **"Atenção"**. Padronizar um só termo. **[CONFIRMAR]** (sugestão: "Atenção").

### 5.5 Relatório detalhado
Abre ao clicar em Abrir Relatório; exige `servidor_id` **e** `componente_id` (inativos sem componente não têm histórico).
- Histórico: **pico diário** (`MAX(valor_uso)` por dia), até 7 dias (máx. 30 no back).
- Texto-resumo padrão: `Nos últimos 7 dias: pico de X%, média de Y% e N de M dia(s) com pico acima do limite de L%.`
- Sem leituras → "Sem leituras de uso nos últimos 7 dias para este servidor."
- Botão **Exportar PDF** existe mas **não tem handler** ainda (**TODO**; biblioteca a definir **[CONFIRMAR]**).

### 5.6 Filtros e busca (pendente)
A barra (`pesquisar por servidor`, componente, status, período) está no HTML mas **não está ligada a nada**; `limparFiltros()` só reseta os campos. Ao implementar:
- Busca por nome: filtra por `apelido` do servidor.
- Filtros de componente/status/período devem afetar **todos** os cards/KPIs de forma coerente.
- Prefira filtrar no servidor (parâmetros validados na rota) para não divergir dos KPIs. Valores dos selects: componente `cpu|ram|disco|rede`; status `normal|atencao|critico|inativo`; período `now|7|15`.

### 5.7 Outros
- Título "Relatórios de **SPTech Free Flow**" está fixo; deve vir do `nome_fantasia` da empresa autenticada. **[CONFIRMAR]**
- Nenhum nome de servidor/empresa deve ser fixado no código.

---

## 6. Front-end: padrões

### Código
- JS puro dentro de IIFE; helpers locais `$`, `$$`, `el(tag, cls, txt)`. Reutilize-os.
- **Dados dinâmicos entram no DOM com `textContent`/`el()`**, nunca `innerHTML` (evita XSS). `innerHTML` só para HTML estático (ícones).
- Chamadas à API passam por `api(rota, params)` (centraliza erro e leitura de `json.log`). Não use `fetch` solto.
- Carregamentos independentes usam `Promise.allSettled`; falha de um card **não derruba os outros** e mostra `toast({ variant: "destructive" })`.
- Gráficos Chart.js: sempre `chart?.destroy()` antes de recriar; mostrar a seção **antes** de desenhar (canvas precisa de tamanho).
- Globais exigidas por scripts legados (`dados`, `lerDados`, `listarServidores`, `autenticarPagina`): **não remover** sem verificar `listaServidores.js`. `autenticarPagina(1)` protege a página (nível de acesso **[CONFIRMAR]** significado de `1`).
- Nomes de classes seguem prefixos: `rel-*` (relatórios), `srv-*` (cards/botões), `src-*` (barra de filtros).

### Visual (tema escuro RoadVizor)
Tokens já usados no código:
| Uso | Cor |
|---|---|
| Normal / marca / linha de uso | `#28c76f` |
| Atenção | `#e4af44` |
| Crítico | `#ff4d6d` |
| Inativo | `#6b7785` |
| Linha de limite | `#ff6b81` (tracejada) |
| Fundo do donut/bordas | `#0a192b` |
| Texto de eixo | `#9dafbe` |
| Grade | `rgba(14,90,167,0.2)` |

- Ícones: **Phosphor** (`ph ph-*`). Sidebar: Home, Equipe, Servidores, Relatórios, Sair.
- **Nunca depender só de cor** para status: sempre acompanhar com texto (badge/legenda).
- **Responsivo obrigatório** (RNF06): pequeno, médio e grande. Layout usa utilitários Tailwind (`lg:`) + `report.css`. Teste em ~375px, ~768px e desktop.
- Textos em pt-BR, formato de data `dd/mm/aaaa` (`toLocaleDateString("pt-BR")`).

---

## 7. Segurança e acesso

- Autenticação por JWT (cookie enviado junto). Telas privadas exigem `autenticarPagina`.
- Cadastro de usuário só em tela autenticada (RNF01); cadastro de usuário de empresa só por administrador ou superior (RNF02); cadastro de empresa só pela equipe RoadVizor (RNF03/04).
- **Isolamento por empresa é inegociável**: um usuário jamais pode ver servidores/logs de outra empresa. Todo endpoint novo deve derivar `empresa_id` do token.
- RF04: resposta de autenticação retorna dados do usuário **exceto `senha`**.

---

## 8. Convenções gerais

- **Nomes de domínio em português**, como no projeto: `empresa_id`, `servidor_id`, `valor_uso`, `buscarLogHoje`, `montarCardInfo`. Funções de model/controller em camelCase; colunas SQL em snake_case.
- Comentários e mensagens de erro em pt-BR, claros e acionáveis para o usuário.
- Mudanças pequenas e focadas; não reformate arquivos inteiros fora do escopo.
- `console.log` de SQL existe nos models para depuração em dev; **não adicionar logs de dados sensíveis**.
- Alterou rota/contrato? Atualize o front **e** este arquivo.

---

## 9. Checklist para adicionar/alterar um endpoint de relatório

1. Rota em `src/routes/log.js` (GET, já sob `verificarAutenticacao`).
2. Controller: ler `empresa_id` do token, validar parâmetros (`isMissing`), validar existência dentro do `try`, responder no padrão `{ message, log }`.
3. Model: query filtrada por `empresa_id`, sem interpolar entrada crua; considerar servidores **sem log** (`LEFT JOIN`).
4. Front: consumir via `api()`, tratar vazio e erro, atualizar com `textContent`.
5. Conferir unidades (% vs absoluto) e janela de tempo coerente com o resto da tela.
6. Testar com: empresa sem servidores, servidor sem logs, servidor inativo, token de outra empresa.

---

## 10. Não faça

- Não aceitar `empresa_id` vindo do cliente.
- Não concatenar entrada do usuário em SQL.
- Não editar `public/css/output.css`.
- Não exibir `senha`, `api_token_jira` ou token JWT no front ou em logs.
- Não implementar ações corretivas sobre servidores (sistema é passivo).
- Não comparar `%` com unidade absoluta (ver 5.2).
- Não hardcodar nomes de empresa/servidor, limites ou status.
- Não usar `innerHTML` com dado vindo da API.
- Não remover globais legadas sem checar `listaServidores.js`/`detalhes.js`.
- Não ampliar o escopo além de Free Flow e dos componentes monitorados.