// Dados utilizados pela sidebar
        let dados;

        async function lerDados() {
            const resposta = await fetch('../../js/dados.json');
            dados = await resposta.json();
        }

        // Configurações
        const API_FLOWPREDICT = '/api/flowpredict';
        const URL_DADOS_EXEMPLO = '../../js/dashboard_exemplo.json';
        const usarExemplo = location.search.includes('mock');

        const labels = ['-12h', '-9h', '-6h', '-3h', 'agora', '+3h', '+6h', '+9h', '+12h'];
        const POSICAO_AGORA = 4;
        const PASSO_GRAFICO_H = 3;

        const NIVEIS = {
            critico: { texto: 'Crítico', classe: 'badge-critico' },
            alto: { texto: 'Alto', classe: 'badge-alto' },
            medio: { texto: 'Médio', classe: 'badge-medio' },
            baixo: { texto: 'Baixo', classe: 'badge-baixo' }
        };

        const TEXTO_TENDENCIA = {
            CRESCENTE: 'crescente',
            DECRESCENTE: 'decrescente',
            SEM_TENDENCIA: 'sem tendência definida'
        };

        // Estado atual da página
        let dashboard = null;
        let servidorSelecionado = null;
        let componenteSelecionado = null;
        let estouroHoras = null;
        let limiteAtual = 80;
        let analiseAtual = null;

        // Elemento HTML onde o gráfico será desenhado
        const ctx = document.getElementById('graficoRegressao').getContext('2d');

        // Busca os dados no Node.js ou utiliza o JSON de demonstração
        async function carregarDashboard() {
            const url = usarExemplo ? URL_DADOS_EXEMPLO : API_FLOWPREDICT;

            const resposta = await fetch(url);

            if (!resposta.ok) {
                throw new Error('HTTP ' + resposta.status);
            }

            return await resposta.json();
        }

        // Funções auxiliares
        function definirTexto(id, texto) {
            document.getElementById(id).textContent = texto;
        }

        function buscarServidor(id) {
            for (let i = 0; i < dashboard.servidores.length; i++) {
                if (dashboard.servidores[i].id === id) {
                    return dashboard.servidores[i];
                }
            }

            return null;
        }

        function formatarHoras(horas) {
            const totalMinutos = Math.round(horas * 60);
            const h = Math.floor(totalMinutos / 60);
            let m = totalMinutos % 60;

            if (m === 0) {
                return h + 'h';
            }

            if (m < 10) {
                m = '0' + m;
            }

            return h + 'h' + m;
        }

        function formatarNumero(valor, casas) {
            return valor.toFixed(casas).replace('.', ',');
        }

        function formatarDataHora(texto) {
            return new Date(texto).toLocaleString('pt-BR');
        }

        function descreverEstouro(horas) {
            if (horas === null) {
                return 'sem estouro previsto';
            }

            if (horas === 0) {
                return 'já acima do limite';
            }

            return 'estouro em ' + formatarHoras(horas);
        }

        function mostrarAviso(mensagem) {
            const aviso = document.getElementById('aviso_pagina');
            aviso.textContent = mensagem;
            aviso.hidden = false;
        }

        function esconderAviso() {
            document.getElementById('aviso_pagina').hidden = true;
        }

        // Indicadores do dashboard
        function preencherKpis() {
            const resumo = dashboard.resumo;

            // Servidores em risco
            definirTexto(
                'kpi_em_risco',
                resumo.em_risco + ' de ' + resumo.total_servidores
            );

            // Menor tempo até atingir o limite
            if (resumo.menor_estouro === null) {
                definirTexto('kpi_menor_tempo', '—');
                definirTexto('detalhe_menor_tempo', 'nenhum estouro previsto');
            } else {
                definirTexto(
                    'kpi_menor_tempo',
                    '' + formatarHoras(resumo.menor_estouro.horas)
                );

                definirTexto(
                    'detalhe_menor_tempo',
                    resumo.menor_estouro.servidor + ' · ' +
                    resumo.menor_estouro.componente
                );
            }

            // Última leitura recebida do Silver
            definirTexto(
                'kpi_ultima_captura',
                formatarDataHora(dashboard.gerado_em)
            );
        }

        // Ranking de risco
        function renderizarRanking() {
            const lista = document.getElementById('lista_ranking');
            let html = '';

            if (dashboard.ranking.length === 0) {
                lista.innerHTML = '<p class="text-xs text-disabled">Nenhum servidor com dados suficientes.</p>';
                return;
            }

            for (let i = 0; i < dashboard.ranking.length; i++) {
                const item = dashboard.ranking[i];
                const servidor = buscarServidor(item.servidor_id);
                const nivel = NIVEIS[item.nivel];

                let classeAtivo = '';

                if (item.servidor_id === servidorSelecionado) {
                    classeAtivo = 'rank-ativo';
                }

                html += `
                <div class="rank-item ${classeAtivo} flex items-center justify-between gap-2 p-3 rounded-lg bg-surface/50"
                     onclick="selecionarServidor(${item.servidor_id}, '${item.componente}')">
                    <div class="min-w-0">
                        <span class="text-white font-bold text-sm">${i + 1}</span>
                        <span class="text-white text-sm ml-2">${servidor.nome} · ${item.componente}</span>
                        <p class="text-xs text-disabled mt-0.5 ml-5">
                            ${descreverEstouro(item.estouro_horas)}
                        </p>
                    </div>
                    <span class="badge ${nivel.classe}">${nivel.texto}</span>
                </div>`;
            }

            if (dashboard.resumo.servidores_sem_dados > 0) {
                html += `
                <p class="text-xs text-disabled">
                    ${dashboard.resumo.servidores_sem_dados}
                    servidor(es) sem dados suficientes para previsão.
                </p>`;
            }

            lista.innerHTML = html;
        }

        // Seleção de componentes
        function renderizarSeletorComponentes(servidor) {
            let html = '';

            for (let nome in servidor.componentes) {
                let classe = 'btn-comp';

                if (nome === componenteSelecionado) {
                    classe = 'btn-comp comp-ativo';
                }

                html += `
                <button class="${classe}" onclick="selecionarComponente('${nome}')">
                    ${nome}
                </button>`;
            }

            document.getElementById('seletor_componente').innerHTML = html;
        }

        // Gráfico de previsão
        function deslocarParaAgora(valores) {
            const resultado = [null, null, null, null];

            for (let i = 0; i < valores.length; i++) {
                resultado.push(valores[i]);
            }

            return resultado;
        }

        function montarDatasets(analise) {
            const linhaLimite = [];

            for (let i = 0; i < labels.length; i++) {
                linhaLimite.push(analise.limite);
            }

            return [
                {
                    label: 'Real',
                    data: analise.real,
                    borderColor: '#60a5fa',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: 'Previsto',
                    data: deslocarParaAgora(analise.previsto),
                    borderColor: '#4ade80',
                    borderDash: [5, 5],
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: 'Limite configurado',
                    data: linhaLimite,
                    borderColor: '#f87171',
                    borderDash: [4, 4],
                    borderWidth: 1.5,
                    pointRadius: 0
                },
                {
                    label: '_banda_superior',
                    data: deslocarParaAgora(analise.banda_superior),
                    borderWidth: 0,
                    pointRadius: 0,
                    tension: 0.3,
                    backgroundColor: 'rgba(74, 222, 128, 0.15)',
                    fill: '+1'
                },
                {
                    label: '_banda_inferior',
                    data: deslocarParaAgora(analise.banda_inferior),
                    borderWidth: 0,
                    pointRadius: 0,
                    tension: 0.3,
                    fill: false
                }
            ];
        }

        // Marca o momento atual e o possível estouro do limite
        const pluginMarcadores = {
            id: 'marcadores',

            afterDatasetsDraw: function (chart) {
                const pincel = chart.ctx;
                const area = chart.chartArea;
                const eixoX = chart.scales.x;
                const eixoY = chart.scales.y;

                const xAgora = eixoX.getPixelForValue(POSICAO_AGORA);

                pincel.save();
                pincel.strokeStyle = '#475569';
                pincel.setLineDash([3, 3]);
                pincel.beginPath();
                pincel.moveTo(xAgora, area.top);
                pincel.lineTo(xAgora, area.bottom);
                pincel.stroke();
                pincel.restore();

                if (estouroHoras === null) {
                    return;
                }

                const px = eixoX.getPixelForValue(
                    POSICAO_AGORA + estouroHoras / PASSO_GRAFICO_H
                );

                const py = eixoY.getPixelForValue(limiteAtual);

                pincel.save();
                pincel.fillStyle = '#f87171';
                pincel.beginPath();
                pincel.arc(px, py, 4, 0, Math.PI * 2);
                pincel.fill();

                pincel.font = '11px sans-serif';
                pincel.textAlign = 'center';

                let texto = 'estouro em ' + formatarHoras(estouroHoras);

                if (estouroHoras === 0) {
                    texto = 'já acima do limite';
                }

                let xTexto = px;

                if (xTexto > area.right - 45) {
                    xTexto = area.right - 45;
                }

                pincel.fillText(texto, xTexto, py + 18);
                pincel.restore();
            }
        };

        const grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: []
            },
            plugins: [pluginMarcadores],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            usePointStyle: true,
                            pointStyle: 'line',
                            boxWidth: 24,
                            filter: function (item) {
                                return !item.text.startsWith('_');
                            }
                        }
                    },
                    tooltip: {
                        filter: function (item) {
                            return !item.dataset.label.startsWith('_');
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#1e293b' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: '#1e293b' },
                        ticks: {
                            color: '#94a3b8',
                            stepSize: 25,
                            callback: function (valor) {
                                return valor + '%';
                            }
                        }
                    }
                }
            }
        });

        // Informações complementares do gráfico
        function definirAvisoGrafico(mensagem) {
            const aviso = document.getElementById('aviso_grafico');
            aviso.textContent = mensagem;
            aviso.hidden = mensagem === '';
        }

        function descreverModelo(analise) {
            const modelo = analise.modelo;

            let texto = 'Tendência: ' + TEXTO_TENDENCIA[analise.tendencia];

            if (analise.tendencia !== 'SEM_TENDENCIA') {
                let sinal = '';

                if (modelo.inclinacao_pct_por_hora > 0) {
                    sinal = '+';
                }

                texto += ' (' + sinal +
                    formatarNumero(modelo.inclinacao_pct_por_hora, 2) + ' p.p./h)';
            }

            texto += ' · R²: ' + formatarNumero(modelo.r2, 2);
            texto += ' · Erro típico: ±' + formatarNumero(modelo.erro_residual_pct, 1) + ' p.p.';
            texto += ' · Histórico: ' + Math.round(modelo.horas_historico) + 'h';

            return texto;
        }

        function atualizarGrafico() {
            const servidor = buscarServidor(servidorSelecionado);

            if (servidor === null) {
                limparGrafico('Nenhuma análise disponível.');
                return;
            }

            const analise = servidor.componentes[componenteSelecionado];

            if (analise === undefined) {
                limparGrafico('Nenhuma análise disponível.');
                return;
            }

            definirTexto('nome_servidor_grafico', servidor.nome);
            definirTexto('componente_grafico', componenteSelecionado);

            renderizarSeletorComponentes(servidor);
            renderizarRanking();

            if (analise.status !== 'ok') {
                estouroHoras = null;
                grafico.data.datasets = [];
                grafico.update();

                definirAvisoGrafico(
                    'Histórico insuficiente para prever (' +
                    analise.pontos + ' de ' + analise.pontos_minimos +
                    ' pontos de 15 min). Aguarde mais leituras deste servidor.'
                );

                definirTexto('detalhe_modelo', '');
                return;
            }

            limiteAtual = analise.limite;
            estouroHoras = null;

            if (analise.estouro_horas !== null && analise.estouro_horas <= 12) {
                estouroHoras = analise.estouro_horas;
            }

            definirAvisoGrafico('');
            grafico.data.datasets = montarDatasets(analise);
            grafico.update();

            definirTexto('detalhe_modelo', descreverModelo(analise));
        }

        function limparGrafico(mensagem) {
            estouroHoras = null;
            grafico.data.datasets = [];
            grafico.update();

            definirAvisoGrafico(mensagem);
            definirTexto('nome_servidor_grafico', '—');
            definirTexto('componente_grafico', '—');
            definirTexto('detalhe_modelo', '');

            document.getElementById('seletor_componente').innerHTML = '';
        }

        // Atualiza a seleção feita pelo usuário
        function selecionarServidor(id, componente) {
            servidorSelecionado = id;
            componenteSelecionado = componente;

            atualizarGrafico();

            if (!usarExemplo) {
                analisarComIA(id);
            }
        }

        function selecionarComponente(nome) {
            componenteSelecionado = nome;

            atualizarGrafico();
        }

        // Seleciona automaticamente o primeiro item do ranking
        function garantirSelecao() {
            const servidor = buscarServidor(servidorSelecionado);

            if (
                servidor !== null &&
                servidor.componentes[componenteSelecionado] !== undefined
            ) {
                return;
            }

            const primeiro = dashboard.ranking[0];

            servidorSelecionado = primeiro.servidor_id;
            componenteSelecionado = primeiro.componente;
        }

        // Carrega os dados e atualiza os elementos da página
        async function atualizarDashboard() {
            try {
                dashboard = await carregarDashboard();
            } catch (erro) {
                console.error('FlowPredict: falha ao carregar os dados', erro);
                mostrarAviso('Não foi possível carregar as previsões (' + erro.message + ').');
                return;
            }

            esconderAviso();
            preencherKpis();

            if (dashboard.ranking.length === 0) {
                renderizarRanking();
                limparGrafico('Nenhum servidor com histórico suficiente para previsão.');
                return;
            }

            garantirSelecao();
            atualizarGrafico();

            if (!usarExemplo) {
                await analisarComIA(servidorSelecionado);
            }
        }

        async function analisarComIA(servidorId) {
            try {
                definirTexto('texto_modelo_viu', 'Gerando análise do servidor...');
                definirTexto('texto_acao_sugerida', 'Aguarde enquanto a IA avalia os componentes.');

                const resposta = await fetch('/api/ia/analisar', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        servidor_id: servidorId
                    })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(dados.erro || 'Erro ao solicitar análise.');
                }

                const analise = dados.analise;
                analiseAtual = analise;

                definirTexto('texto_modelo_viu', analise.o_que_modelo_viu);
                definirTexto('texto_acao_sugerida', analise.acao_sugerida);

                console.log('[Roadvizor] Análise recebida:', analise);

            } catch (erro) {
                console.error('[Roadvizor] Erro na análise:', erro);

                definirTexto('texto_modelo_viu', 'Não foi possível gerar a análise.');
                definirTexto('texto_acao_sugerida', 'Tente novamente mais tarde.');
            }
        }

        function registrarLog() {
            if (!analiseAtual || !dashboard || !servidorSelecionado) {
                alert('Nenhuma análise disponível para salvar.');
                return;
            }

            const servidor = buscarServidor(servidorSelecionado);

            const itemRanking = dashboard.ranking.find(item =>
                item.servidor_id === servidorSelecionado &&
                item.componente === componenteSelecionado
            );

            const statusMap = {
                critico: 'Crítico',
                alto: 'Médio',
                medio: 'Médio',
                baixo: 'Baixo'
            };

            const status = statusMap[itemRanking?.nivel] || 'Inativo';

            document.getElementById('confirmarServidor').textContent = servidor.nome;
            document.getElementById('confirmarComponente').textContent = componenteSelecionado;
            document.getElementById('confirmarStatus').textContent = status;
            document.getElementById('confirmarAcao').textContent = analiseAtual.acao_sugerida;

            const modal = document.getElementById('modalSalvarLog');

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function fecharModalSalvarLog() {
            const modal = document.getElementById('modalSalvarLog');

            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        async function confirmarSalvarLog() {
            const servidor = buscarServidor(servidorSelecionado);

            const componente = servidor.componentes[componenteSelecionado];

            const valoresValidos = componente.real.filter(valor => valor !== null);
            const valorUso = valoresValidos[valoresValidos.length - 1];

            const itemRanking = dashboard.ranking.find(item =>
                item.servidor_id === servidorSelecionado &&
                item.componente === componenteSelecionado
            );

            const statusMap = {
                critico: 'Crítico',
                alto: 'Médio',
                medio: 'Médio',
                baixo: 'Baixo'
            };

            const dadosParaSalvar = {
                servidor_id: servidorSelecionado,
                componente: componenteSelecionado,
                titulo: `Recomendação para ${servidor.nome}`,
                descricao_ia: `${analiseAtual.o_que_modelo_viu}\n\nAção sugerida: ${analiseAtual.acao_sugerida}`,
                status: statusMap[itemRanking?.nivel] || 'Inativo',
                valor_uso: valorUso
            };

            const botao = document.getElementById('btnConfirmarSalvarLog');

            try {
                botao.disabled = true;
                botao.textContent = 'Salvando...';

                const resposta = await fetch('/api/flowpredict/salvar', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosParaSalvar)
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(resultado.erro || 'Erro ao salvar sugestão.');
                }

                fecharModalSalvarLog();
                alert('Sugestão registrada com sucesso!');

            } catch (erro) {
                console.error('[Roadvizor] Erro ao salvar log:', erro);
                alert(erro.message);

            } finally {
                botao.disabled = false;
                botao.textContent = 'Confirmar salvamento';
            }
        }



        // Executa quando o HTML estiver carregado
        document.addEventListener('DOMContentLoaded', () => {
            autenticarPagina(1);

            if (sessionStorage.showmsg == 2) {
                toast({
                    title: 'Usuário já autenticado!',
                    variant: 'success'
                });

                storage.remove('showmsg');
            }

            atualizarDashboard();
        });