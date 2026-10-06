const dashboardModel = require("../models/dashboardModel");

async function kpiServidoresAtivos(req, res) {
    const id_empresa = req.usuario.empresa_id;
    if (!id_empresa) {
        return res.status(400).json({ mensagem: "id_empresa é obrigatório." });
    }
    try {
        const response = await dashboardModel.kpiServidoresAtivos(id_empresa);
        res.status(200).json(response[0]);
    } catch (erro) {
        console.log("Não foi possível listar os servidores ativos:", erro.sqlMessage || erro);
        res.status(500).json({ mensagem: "Erro ao listar servidores ativos." });
    }
}

async function listarUsuariosPorEmpresa(req, res) {
    const id_empresa = req.usuario.empresa_id;
    if (!id_empresa) {
        return res.status(400).json({ mensagem: "id_empresa é obrigatório." });
    }
    try {
        const response = await dashboardModel.listarUsuariosPorEmpresa(id_empresa);
        res.status(200).json(response[0]);
    } catch (erro) {
        console.log("Não foi possível listar os usuários:", erro.sqlMessage || erro);
        res.status(500).json({ mensagem: "Erro ao listar usuários." });
    }
}


async function kpiAlertasRecentes(req, res) {
    const id_empresa = req.usuario.empresa_id;
    if (!id_empresa) {
        return res.status(400).json({ mensagem: "id_empresa é obrigatório." });
    }
    try {
        const response = await dashboardModel.kpiAlertasRecentes(id_empresa);
        res.status(200).json(response[0]);
    } catch (erro) {
        console.log("Erro ao buscar alertas recentes:", erro.sqlMessage || erro);
        res.status(500).json({ mensagem: "Erro ao buscar alertas recentes." });
    }
}

module.exports = {
    kpiServidoresAtivos,
    listarUsuariosPorEmpresa,
    kpiAlertasRecentes,
};