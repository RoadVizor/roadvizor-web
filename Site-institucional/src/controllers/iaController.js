const iaService = require("../services/iaService");

const {
    S3Client,
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: "us-east-1"
});

const BUCKET_NAME = "datalake-gold-roadvizor-sptech";

async function analisar(req, res) {
    try {
        const { empresa_id } = req.usuario;
        const { servidor_id } = req.body;

        if (!empresa_id) {
            return res.status(400).json({
                erro: "Empresa não identificada no token."
            });
        }

        if (!servidor_id) {
            return res.status(400).json({
                erro: "Servidor não informado."
            });
        }

        // Busca os dados Gold da empresa
        const resposta = await s3.send(
            new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `flowpredict/empresa_${empresa_id}/dashboard.json`
            })
        );

        const conteudo = await resposta.Body.transformToString();
        const dashboard = JSON.parse(conteudo);

        // Localiza o servidor solicitado
        const servidor = dashboard.servidores.find(
            item => Number(item.id) === Number(servidor_id)
        );

        if (!servidor) {
            return res.status(404).json({
                erro: "Servidor não encontrado nesta empresa."
            });
        }

        // Filtra o ranking para manter somente o servidor selecionado
        const dashboardIndividual = {
            gerado_em: dashboard.gerado_em,
            resumo: dashboard.resumo,
            ranking: dashboard.ranking.filter(
                item => Number(item.servidor_id) === Number(servidor_id)
            ),
            servidores: [servidor]
        };

        // Envia somente o servidor selecionado para análise
        const analise = await iaService.analisarDashboard(dashboardIndividual);

        return res.status(200).json({
            sucesso: true,
            analise
        });

    } catch (erro) {
        console.error("[IA Controller] Erro:", erro);

        return res.status(500).json({
            sucesso: false,
            erro: "Não foi possível realizar a análise inteligente."
        });
    }
}

module.exports = { analisar };