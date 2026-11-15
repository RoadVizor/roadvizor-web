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

module.exports = {
    buscarDashboard
};