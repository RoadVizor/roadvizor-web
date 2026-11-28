const vitoriaModel = require("../models/vitoriaModel");

async function buscarServidores(req, res) {
    const empresa_id = req.usuario.empresa_id;

    if (!empresa_id) {
        return res.status(403).json({
            mensagem: "Empresa do usuário não identificada."
        });
    }

    try {
        const servidores = await vitoriaModel.buscarServidores(empresa_id);

        return res.status(200).json(servidores);
    } catch (erro) {
        console.error("Erro ao buscar servidores:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar os servidores."
        });
    }
}

async function cadastrarOcorrencia(req, res) {
    const usuario_id = req.usuario.id_usuario;
    const empresa_id = req.usuario.empresa_id;

    const {
        servidor_id,
        tipo_ocorrencia,
        recurso_afetado,
        prioridade,
        descricao
    } = req.body;

    if (!usuario_id || !empresa_id) {
        return res.status(403).json({
            mensagem: "Usuário ou empresa não identificados."
        });
    }

    if (
        !servidor_id ||
        !tipo_ocorrencia ||
        !recurso_afetado ||
        !prioridade ||
        !descricao
    ) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos da ocorrência."
        });
    }

    const prioridadesPermitidas = [
        "baixa",
        "media",
        "alta",
        "critica"
    ];

    if (!prioridadesPermitidas.includes(prioridade)) {
        return res.status(400).json({
            mensagem: "Prioridade inválida."
        });
    }

    try {
        const servidor = await vitoriaModel.verificarServidor(
            servidor_id,
            empresa_id
        );

        if (servidor.length === 0) {
            return res.status(404).json({
                mensagem: "Servidor não encontrado para esta empresa."
            });
        }

        await vitoriaModel.cadastrarOcorrencia(
            servidor_id,
            usuario_id,
            tipo_ocorrencia,
            recurso_afetado,
            prioridade,
            descricao
        );

        return res.status(201).json({
            mensagem: "Ocorrência registrada com sucesso."
        });
    } catch (erro) {
        console.error("Erro ao cadastrar ocorrência:", erro);

        return res.status(500).json({
            mensagem: "Erro ao registrar a ocorrência."
        });
    }
}

async function buscarOcorrencias(req, res) {
    const empresa_id = req.usuario.empresa_id;

    if (!empresa_id) {
        return res.status(403).json({
            mensagem: "Empresa do usuário não identificada."
        });
    }

    try {
        const ocorrencias = await vitoriaModel.buscarOcorrencias(empresa_id);

        return res.status(200).json(ocorrencias);
    } catch (erro) {
        console.error("Erro ao buscar ocorrências:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar as ocorrências."
        });
    }
}

module.exports = {
    buscarServidores,
    cadastrarOcorrencia,
    buscarOcorrencias
};
