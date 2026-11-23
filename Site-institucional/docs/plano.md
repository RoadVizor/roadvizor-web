# Plano de implementação — Dashboard "Saúde" (sem git)

Este documento substitui o plano anterior e descreve, de forma objetiva e passo a passo, as alterações que o agente de build deve produzir para implementar a página "Saúde" conforme a referência visual em public/assets/images/SaudeFrontEndBase.png.

Observação importante
- Nenhuma operação Git (commit/branch/push) será executada por mim. Todas as operações de versionamento ficam sob sua responsabilidade.
- O mock de dados já foi adicionado por você em: Site-institucional/public/data/mock-saude.json

Objetivo
- Recriar a página "Saúde" como um espelho literal da imagem de referência.
- Renderizar os gráficos (donut/radial e line) usando Chart.js via CDN.
- Usar apenas ícones do Phosphor Icons (mesmo link já usado no projeto).
- Garantir que todas as cores venham das variáveis declaradas em Site-institucional/public/css/style.css.

Resumo das alterações a serem produzidas
1) HTML
- Arquivo: Site-institucional/public/pages/dashboard/saude.html
- Substituir exclusivamente o conteúdo interno da tag <main> para reproduzir a disposição, textos e elementos da imagem de referência. Manter a tag <main> e o restante do arquivo intactos.
- Incluir, ao final do <body>, as seguintes tags de script (ordem sugerida):
  - <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  - <script src="https://unpkg.com/@phosphor-icons/web"></script>
  - <script src="/js/saude.js"></script>
- Preservar e usar os data-attributes requeridos:
  - data-kpi-* (blocos de KPI laterais)
  - data-chart-placeholder (container/canvas do donut)
  - canvas id="saude-evolucao-chart" (line chart)
  - data-servers-list (tbody/container da tabela)
  - data-servers-count, data-server-* (atributos de linha/coluna conforme necessário)

2) JavaScript
- Arquivo: Site-institucional/public/js/saude.js
- Responsabilidades do arquivo:
  - Consumir o mock local: /public/data/mock-saude.json via fetch.
  - Inicializar Chart.js:
    - Donut/radial para percentual geral (render no elemento indicado por data-chart-placeholder).
    - Line chart em canvas#saude-evolucao-chart com pontos e linha conforme a imagem.
  - Preencher os KPIs laterais e a tabela de servidores usando os data-attributes (data-kpi-*, data-servers-list, etc).
  - Obter todas as cores a partir de variáveis CSS (ex.: getComputedStyle(document.documentElement).getPropertyValue('--color-chart-1')) — nenhuma cor hard-coded.
  - Usar apenas ícones do Phosphor (inseridos via API do script CDN).
  - Implementar fallback com dados de exemplo caso o mock falhe.

3) Mock de dados
- Caminho confirmado: Site-institucional/public/data/mock-saude.json (já presente).
- Estrutura esperada (resumo):
  - overview: { percent: number, statusCounts: { saudavel, atencao, critico } }
  - evolucao: { labels: [...], values: [...] }
  - servers: [ { name, cpu, ram, disco, rede, saude, updated }, ... ]
  - kpis: { totalServers, critico, atencao, saudavel }
- O JS consumirá esse formato; pequenos ajustes no campo/nomes podem ser tratados no código com validação mínima.

4) Dependências via CDN
- Chart.js: https://cdn.jsdelivr.net/npm/chart.js (versão estável mais recente, sem pinagem).
- Phosphor Icons: https://unpkg.com/@phosphor-icons/web (mesmo link já usado no projeto).

5) Estilo / Tailwind
- Não alterar a configuração do Tailwind sem autorização.
- Utilizar classes utilitárias e variáveis CSS do projeto (Site-institucional/public/css/style.css).
- Qualquer CSS adicional mínimo deve referenciar variáveis existentes, não usar cores fixas.

6) Build e validação local (comandos que você executará)
- cd Site-institucional
- npm ci
- npx @tailwindcss/cli -i ./public/css/style.css -o ./public/css/output.css --minify
- npm run dev   (ou)   node app.js
- Acessar: http://<APP_HOST>:<APP_PORT>/pages/dashboard/saude.html

Entregáveis que o agente de build fornecerá
- Patch contendo:
  - Alteração do conteúdo interno de <main> em public/pages/dashboard/saude.html.
  - Novo arquivo public/js/saude.js.
  - (Opcional) pequeno README com instruções de build/test.
- Observação: não haverá commits. Você aplicará o patch/localmente integrará os arquivos e fará o versionamento.

Critérios de aceitação
- Visual: layout e disposição dos blocos correspondem ao espelho literal da imagem public/assets/images/SaudeFrontEndBase.png, com responsividade adequada.
- Funcional: donut e line chart renderizam via Chart.js e usam cores obtidas das variáveis CSS.
- Dados: KPIs e tabela preenchidos pelo mock (ou fallback, se mock indisponível).
- Ícones: apenas Phosphor Icons (via https://unpkg.com/@phosphor-icons/web).
- Código: nenhuma cor hard-coded; data-attributes mantidos.

Notas finais
- O mock já foi incluído por você em public/data/mock-saude.json — o JS usará esse arquivo automaticamente.
- Se você quiser que eu gere o patch com as alterações (arquivos prontos para aplicar), peça "gere o patch" — eu criarei o patch sem executar comandos Git.
