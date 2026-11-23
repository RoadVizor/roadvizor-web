Repository specifics for OpenCode agents — only high-signal items.

Where to work
- The app lives in Site-institucional. cd into that directory before running installs or scripts.

Install
- Use a clean install: cd Site-institucional && npm ci
  (npm install is fine for local changes; prefer npm ci in CI or reproducible runs.)

Start / dev
- Development (Tailwind watch + nodemon): npm run dev
- Production-ish (build Tailwind once + node): npm run start
  Both scripts must be run from Site-institucional.

Environment / common gotchas
- The app loads .env.dev (app.js selects .env.dev when ambiente_processo === "desenvolvimento").
- Many modules expect these env vars to exist (minimal set):
  - AMBIENTE_PROCESSO=desenvolvimento
  - APP_PORT (e.g. 3000)
  - APP_HOST (e.g. localhost)
  - JWT_SECRET
  - DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT
- If you see "AMBIENTE NÃO CONFIGURADO" or cookie secure flags behaving unexpectedly, ensure AMBIENTE_PROCESSO is present and set to "desenvolvimento" in the env file (app.js does not set process.env.AMBIENTE_PROCESSO for you).

Database
- The app uses MySQL (mysql2). Create the DB and run the schema script:
  mysql -u <user> -p <database> < Site-institucional/src/database/script-tabelas.sql
- Ensure DB_* env vars point to that DB before starting the server.

Assets / Tailwind
- Tailwind input: public/css/style.css -> output: public/css/output.css
- npm run dev runs the Tailwind CLI in watch mode; npm run start runs one build (no watch).

Static server
- Express serves the frontend from Site-institucional/public. Static assets and the HTML pages are there.

Small debugging tips
- Server log prints: "Servidor Rodando em: http://<HOST>:<PORT> | ambiente: <ambiente_processo>" — check those values at startup.
- If DB queries fail, check DB connection env vars and that AMBIENTE_PROCESSO is set (database config checks process.env.AMBIENTE_PROCESSO).

Files worth scanning first
- Site-institucional/app.js — entrypoint
- Site-institucional/src/database/config.js — DB env expectations
- Site-institucional/src/controllers/* and src/models/* — runtime behaviors and required envs
- Site-institucional/src/database/script-tabelas.sql — schema to create

What I intentionally omitted
- Generic Node/Express/Tailwind advice and unrelated files; include only repo-specific commands and quirks above.


===============================

# AGENTS.md — RoadVizor

## 1. Contexto
Projeto acadêmico da SPTech (2026.2), desenvolvido pelo Grupo 2. O RoadVizor monitora recursos computacionais de servidores físicos locais (edge) instalados em pedágios Free Flow. O público operacional são equipes técnicas dos Centros de Controle Operacional (CCOs) de concessionárias rodoviárias.

O sistema coleta métricas de CPU, memória RAM, disco e rede, além de informações de processos, para oferecer observabilidade, apoiar a identificação de falhas e reduzir downtime. O cenário de negócio é crítico: indisponibilidade pode interromper o registro de passagens e afetar a arrecadação da concessionária.

## 2. Objetivo
Entregar um client instalado no servidor local e uma plataforma web hospedada na AWS para consultar métricas, logs e traces coletados. O sistema também integra Jira e Slack para notificar usuários quando parâmetros monitorados excedem os limites definidos.

## 3. Escopo
**Dentro do projeto:**
- Client Python para coleta de CPU, RAM, disco e rede em servidores locais de pedágios Free Flow.
- Plataforma web para autenticação, cadastro e consulta de informações.
- Dashboard interativa para visualização dos dados coletados.
- Integração com Jira e Slack para notificações de alertas.
- Monitoramento passivo dos componentes solicitados e presentes no servidor local.

**Fora do escopo / limites documentados:**
- Monitoramento de ambientes que não sejam servidores locais de pedágios Free Flow.
- Ações automáticas de correção ou contramedidas: o sistema emite alertas passivos.
- O sistema não substitui a análise e a tomada de decisão do usuário.

Não amplie o escopo sem solicitação explícita.

## 4. Funcionalidades
- Cadastro e autenticação de usuários.
- Cadastro de empresas.
- Retorno dos dados cadastrais do usuário autenticado, sem expor a senha.
- Coleta local de métricas pelo client Python.
- Envio dos dados coletados à plataforma web.
- Consulta dos dados em dashboards.
- Notificações via Jira e Slack quando limites de uso computacional forem excedidos.

Os requisitos funcionais detalhados no documento de planejamento são RF01–RF04. Antes de alterar um fluxo, confira sua implementação atual e os requisitos aplicáveis.

## 5. Regras de negócio
- O monitoramento se limita aos componentes solicitados pelo usuário e presentes no servidor local do pórtico.
- Alertas são passivos; não implementar ações corretivas automáticas.
- O cadastro de empresas e de contas com nível administrador é responsabilidade exclusiva da equipe RoadVizor.
- O cadastro de usuários vinculados a uma empresa, exceto o primeiro usuário administrador, deve ocorrer por usuário com nível de acesso igual ou superior ao de administrador.
- O primeiro usuário administrador da empresa é criado no fluxo de cadastro da empresa.
- Dados de senha não devem ser retornados nas informações do usuário autenticado.
- O documento de planejamento especifica criptografia SHA-256 para senhas (RNF05). Antes de alterar autenticação ou persistência de senhas, confira o código atual e o mecanismo efetivamente utilizado; não substitua a implementação por suposição.
- Não presuma regras de cargos, permissões, hierarquia ou isolamento entre empresas além do que estiver implementado e documentado. Se faltar definição, pergunte.

## 6. Interface
- A plataforma web deve ser responsiva para telas pequenas, médias e grandes (RNF06).
- O documento prevê dashboards interativas para consulta de métricas.
- Preserve os padrões visuais, componentes, estrutura e comportamento já existentes no repositório. Não crie uma identidade visual ou padrão novo sem solicitação.
- Mensagens, validações e fluxos devem permanecer coerentes com a implementação atual.

## 7. Critérios de aceitação
- **Cadastro de usuário:** solicita nome completo, e-mail, senha e cargo, conforme o fluxo implementado.
- **Login:** permite acesso ao escopo privado com e-mail e senha cadastrados.
- **Cadastro de empresa:** solicita CNPJ, nome fantasia, razão social, e-mail de contato e senha.
- **Usuário autenticado:** recebe seus dados cadastrais, sem o campo senha.
- **Acesso:** páginas e elementos privados exigem autenticação.
- **Cadastro de usuários da empresa:** exceto o primeiro administrador, exige usuário com nível de acesso igual ou superior ao de administrador.
- **Cadastro de empresas:** ocorre exclusivamente em área de uso interno da equipe RoadVizor.
- **Primeiro administrador:** é criado e associado à empresa no cadastro desta.
- **Responsividade:** telas e elementos da interface funcionam em tamanhos pequenos, médios e grandes.
- **Monitoramento:** coleta os componentes solicitados e presentes no servidor local.
- **Alertas:** exceder os parâmetros definidos gera notificação passiva pelos canais Jira e Slack.

## 8. Arquitetura e notas por repositório

### Arquitetura geral
Componentes e tecnologias descritos no documento:
- **web:** Node.js; serviço web indicado na tabela ACL como `0.0.0.0:3333`.
- **client:** Python; instalado no servidor local, com endereço indicado como `localhost`.
- **log:** Java; componente de logs, indicado na tabela ACL pelo IP `177.92.67.154`.
- **database:** MySQL; indicado na tabela ACL pelo IP `177.92.67.154`, porta `3306`.

O documento também informa que a plataforma web é hospedada na AWS e que há integração com Jira e Slack. Ele não especifica o desenho completo de deploy, o contrato HTTP entre client e web, o formato dos arquivos/dados, o schema do banco ou o pipeline de processamento. Não invente esses detalhes: inspecione o código e a configuração atuais; se não forem suficientes, pergunte.

### Repositório web (Node.js)
- Responsável pela plataforma web, autenticação, cadastros e dashboards.
- O documento identifica Node.js como tecnologia e a porta `3333` na tabela ACL.
- Preserve a arquitetura e os padrões encontrados no código atual.
- Não presuma framework, estrutura de pastas, rotas, ORM, mecanismo de sessão ou biblioteca de dashboard sem verificar o repositório.

### Repositório client (Python)
- Responsável pela coleta local de métricas computacionais do servidor Free Flow.
- Métricas explicitamente previstas: CPU, memória RAM, disco e rede; o documento também menciona processos.
- O client deve operar no servidor local do pórtico.
- Não presuma intervalo de coleta, formato de envio, nomes de campos, autenticação ou estratégia de retry sem verificar o código e a configuração atuais.

### Repositório log (Java)
- Componente identificado como `log`, desenvolvido em Java.
- O documento associa o componente à geração/gestão de logs, mas não detalha seu contrato, processamento ou integração interna.
- Inspecione o código antes de alterar responsabilidades ou interfaces.

### Repositório database (MySQL)
- Componente de persistência identificado como MySQL, porta `3306`.
- O documento não contém o schema detalhado.
- Consulte os scripts e o schema existentes antes de criar ou modificar tabelas, colunas, relacionamentos ou consultas.

## Diretrizes para o agente
- **Fonte da verdade:** o código e as configurações atuais do repositório prevalecem sobre PDFs e documentos antigos quando houver divergência.
- **Contexto compartilhado:** este arquivo pode existir nos quatro repositórios (`web`, `client`, `log` e `database`). Leia as seções 1–7 e somente a subseção da seção 8 correspondente ao repositório em que estiver trabalhando.
- Antes de implementar, inspecione os arquivos e padrões existentes. Evite reescrever ou reorganizar código fora do escopo solicitado.
- Não invente requisitos, endpoints, campos, tabelas, permissões, limites ou integrações. Se uma informação necessária estiver ausente ou ambígua, pergunte antes de assumir.
- Faça alterações focadas e compatíveis com as tecnologias já adotadas.
- Não adicione dependências, serviços ou funcionalidades sem necessidade para a tarefa ou autorização.
- Valide as alterações com os comandos e testes disponíveis no repositório. Se não houver testes automatizados, informe a validação manual realizada e suas limitações.
- Não exponha senhas, tokens, credenciais ou outros segredos em código, logs ou respostas.