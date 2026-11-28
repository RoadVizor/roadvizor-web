# Plano de implementação — Dashboard "Saúde" (sem git)

Este documento substitui o plano anterior e descreve, de forma objetiva e passo a passo, as alterações que o agente de build deve produzir para implementar a página "Saúde" consumindo exclusivamente a rota backend /api/saude (sem uso de mocks locais).

Observação importante
- Nenhuma operação remota (push/PR) será executada pelo agente. Todas as alterações serão aplicadas localmente no repositório conforme suas instruções.
- O uso de mocks locais será removido: o agente de build deve apagar o(s) arquivo(s) de mock relacionados à tela Saúde.

Objetivo
- Substituir qualquer consumo de .json mockado pela rota backend /api/saude e garantir que a página reproduza a interface e comportamento esperado usando os JSONs Gold (descritos no contexto fornecido).
- Renderizar os gráficos (donut/radial e line) usando Chart.js via CDN.
- Usar apenas ícones do Phosphor Icons (mesmo link já usado no projeto).
- Garantir que todas as cores venham das variáveis declaradas em Site-institucional/public/css/style.css.

Resumo das alterações a serem produzidas
1) Remoção de mocks
- Remover do repositório todos os arquivos de mock que alimentavam a tela Saúde (ex.: Site-institucional/public/data/mock-saude.json). A tela Saúde não terá fallback local; dependerá apenas de /api/saude.

2) HTML
- Arquivo: Site-institucional/public/pages/dashboard/saude.html
- Garantir que o <main> contenha os elementos necessários (donut canvas com id/data-chart-placeholder, canvas#saude-evolucao-chart, select#saude-region, input#sv-search, select#servers-filter, button#saude-refresh, tbody[data-servers-list], elementos data-kpi-* e data-servers-count).
- Não é necessário substituir todo o <main> se já contiver os elementos acima; adapte apenas onde for preciso para garantir os IDs/data-attributes.
- Incluir, ao final do <body>, as seguintes tags de script (ordem sugerida se não presentes):
  - <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  - <script src="https://unpkg.com/@phosphor-icons/web"></script>
  - <script src="/js/saude.js"></script>

3) JavaScript
- Arquivo: Site-institucional/public/js/saude.js — substituir/reescrever para que:
  - Fonte única de dados: backend /api/saude (nunca mais carregar mock local).
    - Regiões: GET /api/saude?region=indice
    - Painel de região: GET /api/saude?region=<slug> (usar "todas" para consolidado)
  - Todas as requisições devem usar fetch(url, { credentials: 'include', cache: 'no-store' }).
  - Tratar respostas:
    - 200: usar JSON retornado conforme schema Gold.
    - 401: redirecionar para /pages/login.html.
    - 403: mostrar "Acesso negado" (toast ou banner).
    - 404: mostrar "Sem dados para essa região".
    - 5xx: mostrar "Erro interno — tente novamente".
  - Renderizar Chart.js:
    - Donut com kpis.servidores_* (cores vindas das variáveis CSS).
    - Line chart com grafico_horas.horas e grafico_horas.saude_percents (null = gap).
  - Preencher KPIs e tabela com os campos do JSON (kpis, servidores).
  - Filtros:
    - Seletor de região (select#saude-region): onChange => GET /api/saude?region=<slug>.
    - Pesquisa por apelido (input#sv-search): client-side filter, debounce 300ms.
    - Filtro por status (select#servers-filter): client-side.
  - Polling: recarregar automaticamente a região atual a cada 15 minutos (900000 ms), somente quando a aba estiver visível (document.visibilityState).
  - Botão de refresh (button#saude-refresh): força novo fetch da região atual.
  - Não enviar companyId em nenhuma requisição.

4) Contrato dos JSONs (uso esperado)
- O front consumirá os JSONs Gold no formato informado por você (Painel e Indice). Exemplo:
- GET /api/saude?region=indice  => { gerado_em, regioes: [...] }
- GET /api/saude?region=norte  => Painel (regiao, gerado_em, dados_defasados, kpis, grafico_horas, servidores)
- O front usa os campos diretamente; somente preencherá com valores default (— ou 0) se algum campo estiver ausente.

5) Estilo / Tailwind
- Não alterar a configuração do Tailwind sem autorização.
- Usar classes utilitárias e variáveis CSS do projeto (Site-institucional/public/css/style.css).
- Nenhuma cor hard-coded no JS; todas as cores obtidas via getComputedStyle(document.documentElement).getPropertyValue('--var-name').

6) Build e validação local (comandos que você/agent executará)
- cd Site-institucional
- npm ci
- npx @tailwindcss/cli -i ./public/css/style.css -o ./public/css/output.css --minify
- npm run dev   (ou)   node app.js
- Acessar: http://<APP_HOST>:<APP_PORT>/pages/dashboard/saude.html

Entregáveis que o agente de build produzirá
- Arquivo atualizado: Site-institucional/public/js/saude.js (consumo exclusivo de /api/saude, filtros, polling, refresh).
- HTML ajustado se necessário: Site-institucional/public/pages/dashboard/saude.html (garantir IDs/data-attributes).
- Remoção do mock: git rm Site-institucional/public/data/mock-saude.json (a ação de versionamento ficará por sua conta).
- (Opcional) pequeno README com instruções de build/test.

Critérios de aceitação
- Visual: layout e disposição coerentes com a referência; responsivo.
- Funcional: donut e line chart renderizam via Chart.js e usam cores obtidas das variáveis CSS.
- Dados: KPIs e tabela preenchidos pelos JSONs retornados por /api/saude; nenhum uso de mock local.
- Autenticação: chamadas usam credentials e 401 redireciona para /pages/login.html.
- Código: nenhuma cor hard-coded; data-attributes mantidos.

Notas finais
- A rota backend /api/saude é a fonte da verdade; confirme que o backend devolve os JSONs no formato descrito.
- Se desejar, eu gero o patch com as alterações (arquivos prontos) para você aplicar localmente — diga "gere o patch" e eu criarei o patch sem executar operações Git remotas.
