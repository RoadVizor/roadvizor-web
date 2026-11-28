const especificacoesModel = require("../models/especificacoesModel");

async function buscarServidores(req, res) {
    const empresa_id = req.usuario.empresa_id;

    if (!empresa_id) {
        return res.status(403).json({
            mensagem: "Empresa do usuário não identificada."
        });
    }

    try {
        const servidores = await especificacoesModel.buscarServidores(empresa_id);

        return res.status(200).json(servidores);
    } catch (erro) {
        console.error("Erro ao buscar servidores:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar os servidores."
        });
    }
}

async function buscarServidorPorID(req, res) {
    const empresa_id = req.usuario.empresa_id;
    const id_servidor = req.params.id;

    if (!empresa_id) {
        return res.status(403).json({
            mensagem: "Empresa do usuário não identificada."
        });
    }

    if (!id_servidor || isNaN(Number(id_servidor))) {
        return res.status(400).json({
            mensagem: "ID do servidor inválido."
        });
    }

    try {
        const servidores = await especificacoesModel.buscarServidorPorID(
            empresa_id,
            id_servidor
        );

        if (servidores.length === 0) {
            return res.status(404).json({
                mensagem: "Servidor não encontrado."
            });
        }

        return res.status(200).json(servidores[0]);
    } catch (erro) {
        console.error("Erro ao buscar servidor:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar o servidor."
        });
    }
}

async function buscarMetricasServidor(req, res) {
    const empresa_id = req.usuario.empresa_id;
    const id_servidor = req.params.id;

    if (!empresa_id) {
        return res.status(403).json({
            mensagem: "Empresa do usuário não identificada."
        });
    }

    if (!id_servidor || isNaN(Number(id_servidor))) {
        return res.status(400).json({
            mensagem: "ID do servidor inválido."
        });
    }

    try {
        const servidores = await especificacoesModel.buscarServidorPorID(
            empresa_id,
            id_servidor
        );

        if (servidores.length === 0) {
            return res.status(404).json({
                mensagem: "Servidor não encontrado."
            });
        }

        const metricas = await especificacoesModel.buscarMetricasServidor(
            servidores[0]
        );

        return res.status(200).json(metricas);
    } catch (erro) {
        console.error("Erro ao buscar métricas do Gold:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar as métricas do servidor.",
            detalhe: erro.name === "NoSuchKey"
                ? "Arquivo Gold não encontrado no S3."
                : "Verifique o acesso ao bucket Gold e as credenciais AWS."
        });
    }
}

module.exports = {
    buscarServidores,
    buscarServidorPorID,
    buscarMetricasServidor
};
