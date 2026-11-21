const flowpredictModel = require("../models/flowpredictModel");

async function buscarDashboard(req, res) {
    try {
        const { empresa_id } = req.usuario;

        if (!empresa_id) {
            return res.status(400).json({
                erro: "Empresa não identificada no token."
            });
        }

        const resposta = await fetch(
            `http://127.0.0.1:5000/api/flowpredict/${empresa_id}`,
            {
                method: "GET",
                headers: {
                    "X-Internal-Token": "roadvizor-internal-token"
                }
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            return res.status(resposta.status).json(dados);
        }

        return res.status(200).json(dados);

    } catch (erro) {
        console.error("Erro ao consultar FlowPredict:", erro);

        return res.status(500).json({
            erro: "Não foi possível consultar o dashboard."
        });
    }
}


async function salvarSugestao(req, res) {
    try {
        const {
            servidor_id,
            componente,
            titulo,
            descricao_ia,
            status,
            valor_uso
        } = req.body;

        const empresa_id = req.usuario.empresa_id;

        if (!servidor_id || !componente || !titulo || !status) {
            return res.status(400).json({
                erro: "Dados obrigatórios incompletos."
            });
        }

        const resultadoComponente = await flowpredictModel.buscarComponenteId(componente);

        if (resultadoComponente.length === 0) {
            return res.status(404).json({
                erro: "Componente não encontrado."
            });
        }

        const componente_id = resultadoComponente[0].id_componente;

        await flowpredictModel.salvarLog({
            servidor_id,
            empresa_id,
            componente_id,
            titulo,
            descricao_ia,
            status,
            valor_uso
        });

        return res.status(200).json({
            mensagem: "Sugestão salva com sucesso."
        });

    } catch (error) {
        console.error("Erro ao salvar sugestão:", error);

        return res.status(500).json({
            erro: "Erro interno ao salvar sugestão."
        });
    }
}

module.exports = {
    buscarDashboard,
    salvarSugestao
};