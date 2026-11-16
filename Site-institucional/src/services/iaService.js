async function prepararDados(dashboard) {
    return {
        gerado_em: dashboard.gerado_em,
        resumo: dashboard.resumo,
        ranking: dashboard.ranking,

        servidores: dashboard.servidores.map(servidor => ({
            nome: servidor.nome,

            componentes: Object.entries(servidor.componentes).map(([nome, dados]) => ({
                componente: nome,
                status: dados.status,
                valor_atual: dados.valor_atual ?? null,
                limite: dados.limite,
                nivel: dados.nivel,
                tendencia: dados.tendencia,
                estouro_horas: dados.estouro_horas,

                modelo: dados.modelo ? {
                    r2: dados.modelo.r2,
                    inclinacao: dados.modelo.inclinacao_pct_por_hora
                } : null,

                estatisticas: dados.estatisticas ? {
                    media: dados.estatisticas.media,
                    maximo: dados.estatisticas.maximo,
                    pontos_acima_limite: dados.estatisticas.pontos_acima_limite
                } : null
            }))
        }))
    };
}

async function analisarDashboard(dashboard) {
    try {
        const dados = await prepararDados(dashboard);

        const prompt = `
Você é um analista especializado em infraestrutura de TI.

Analise os dados de monitoramento do servidor selecionado no Roadvizor.

OBJETIVOS:
1. Identificar o componente que apresenta maior risco neste servidor.
2. Explicar o que está acontecendo com seus componentes monitorados.
3. Recomendar uma ação prática para a equipe técnica.

REGRAS ADICIONAIS:
- Analise exclusivamente o servidor recebido.
- Considere todos os componentes disponíveis desse servidor.
- Priorize o componente com maior nível de risco.
- Não faça comparações com outros servidores.
- Se não houver risco relevante, informe que o servidor está em condições estáveis.

FORMATO DA RESPOSTA:
Retorne exclusivamente um JSON válido, sem markdown, com estas propriedades:

{
    "o_que_modelo_viu": "Descrição da situação identificada",
    "acao_sugerida": "Recomendação prática",
    "servidor": "Nome do servidor",
    "componente": "CPU ou RAM",
    "nivel_risco": "critico, alto, medio, baixo ou sem_dados"
}

DADOS DO FLOWPREDICT:
${JSON.stringify(dados)}
`;

        console.log("[IA] Enviando dados do FlowPredict à OpenRouter...");

        const resposta = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "X-OpenRouter-Title": "Roadvizor"
                },

                body: JSON.stringify({
                    model: "openrouter/free",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    response_format: {
                        type: "json_object"
                    },

                    temperature: 0.2
                }),

                signal: AbortSignal.timeout(60000)
            }
        );

        const dadosResposta = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                `OpenRouter ${resposta.status}: ${JSON.stringify(dadosResposta)}`
            );
        }

        const texto = dadosResposta.choices?.[0]?.message?.content;

        if (!texto) {
            throw new Error("A OpenRouter retornou uma resposta vazia.");
        }

        const resultado = JSON.parse(
            texto.replace(/```json|```/g, "").trim()
        );

        console.log("[IA] Análise concluída.");

        return resultado;

    } catch (erro) {
        console.error("[IA] Erro ao analisar dashboard:", erro);
        throw erro;
    }
}

module.exports = { analisarDashboard };