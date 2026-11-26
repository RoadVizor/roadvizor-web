
const relatorioModel = require("../models/relatoriosModel");

async function buscarServidores(req, res) {
    const { empresa_id } = req.usuario;

    try {
        const servidores = await relatorioModel.buscarServidores(empresa_id);

        return res.status(200).json({
            message: "Servidores encontrados.",
            result: servidores
        });
    } catch (error) {
        console.error("[relatorioController] Erro ao buscar servidores:", error);

        return res.status(500).json({
            message: "Erro ao buscar servidores."
        });
    }
}

async function cadastrar(req, res) {
    const { id_usuario, empresa_id } = req.usuario;

    const {
        servidor_id,
        tipo_ocorrencia,
        recurso_afetado,
        prioridade,
        descricao
    } = req.body;

    if (
        !servidor_id ||
        !tipo_ocorrencia ||
        !recurso_afetado ||
        !prioridade ||
        !descricao ||
        !String(descricao).trim()
    ) {
        return res.status(400).json({
            message: "Preencha todos os campos do relatório."
        });
    }

    const servidorIdNumero = Number(servidor_id);

    if (!Number.isInteger(servidorIdNumero) || servidorIdNumero <= 0) {
        return res.status(400).json({
            message: "Servidor informado é inválido."
        });
    }

    const prioridadesPermitidas = ["baixa", "media", "alta", "critica"];

    if (!prioridadesPermitidas.includes(prioridade)) {
        return res.status(400).json({
            message: "Prioridade informada é inválida."
        });
    }

    try {
        const servidor = await relatorioModel.buscarServidorPorID(
            empresa_id,
            servidorIdNumero
        );

        if (servidor.length === 0) {
            return res.status(404).json({
                message: "Servidor não encontrado para sua empresa."
            });
        }

        const resultado = await relatorioModel.cadastrar(
            servidorIdNumero,
            id_usuario,
            String(tipo_ocorrencia).trim(),
            String(recurso_afetado).trim(),
            prioridade,
            String(descricao).trim()
        );

        return res.status(201).json({
            message: "Relatório registrado com sucesso!",
            id_relatorio: resultado.insertId
        });
    } catch (error) {
        console.error("[relatorioController] Erro ao cadastrar:", error);

        return res.status(500).json({
            message: "Erro ao registrar o relatório."
        });
    }
}

async function buscarRelatorios(req, res) {
    const { empresa_id } = req.usuario;

    try {
        const relatorios = await relatorioModel.buscarRelatorios(empresa_id);

        return res.status(200).json({
            message: "Relatórios encontrados.",
            count: relatorios.length,
            result: relatorios
        });
    } catch (error) {
        console.error("[relatorioController] Erro ao buscar relatórios:", error);

        return res.status(500).json({
            message: "Erro ao consultar relatórios."
        });
    }
}

module.exports = {
    buscarServidores,
    cadastrar,
    buscarRelatorios
};
