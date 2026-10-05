const dashboardModel = require("../models/dashboardModel");

async function kpiServidoresAtivos(req, res) {
    const id_empresa = req.params.id_empresa;
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
    const id_empresa = req.params.id_empresa;
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

async function listarServidores(req, res) {
    const id_empresa = req.params.id_empresa;
    if (!id_empresa) {
        return res.status(400).json({ mensagem: "id_empresa é obrigatório." });
    }
    try {
        const response = await dashboardModel.listarServidores(id_empresa);
        res.status(200).json(response);          
    } catch (erro) {
        console.log("Não foi possível listar os servidores:", erro.sqlMessage || erro);
        res.status(500).json({ mensagem: "Erro ao listar servidores." });
    }
}

async function listarStatusServidor(req, res) {
    const id_empresa = req.params.id_empresa;
    if (!id_empresa) {
        return res.status(400).json({ mensagem: "id_empresa é obrigatório." });
    }
    try {
        const response = await dashboardModel.listarStatusServidor(id_empresa);
        res.status(200).json(response);          
    } catch (erro) {
        console.log("Não foi possível consultar o status:", erro.sqlMessage || erro);
        res.status(500).json({ mensagem: "Erro ao consultar status." });
    }
}

async function buscarNomeEmpresa(req, res) {
    const id_empresa = req.params.id_empresa;
    if (!id_empresa) {
        return res.status(400).json({ mensagem: "id_empresa é obrigatório." });
    }
    try {
        const response = await dashboardModel.buscarNomeEmpresa(id_empresa);
        if (response.length === 0) {
            return res.status(404).json({ mensagem: "Empresa não encontrada." });
        }
        res.status(200).json(response[0]);
    } catch (erro) {
        console.log("Erro ao buscar empresa:", erro.sqlMessage || erro);
        res.status(500).json({ mensagem: "Erro ao buscar empresa." });
    }
}

async function kpiAlertasRecentes(req, res) {
    const id_empresa = req.params.id_empresa;
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

async function listarDetalhesServidor(req, res) {
    const { id_empresa, id_servidor } = req.params;
    if (!id_empresa || !id_servidor) {
        return res.status(400).json({ mensagem: "id_empresa e id_servidor são obrigatórios." });
    }
    try {
        const response = await dashboardModel.listarDetalhesServidor(id_empresa, id_servidor);
        res.status(200).json(response);
    } catch (erro) {
        console.log("Erro ao buscar detalhes do servidor:", erro.sqlMessage || erro);
        res.status(500).json({ mensagem: "Erro ao buscar detalhes." });
    }
}

async function cadastrarServidor(req, res) {
    const { empresa_id, endereco_id, endereco_mac, apelido, modelo } = req.body;

    if (!empresa_id || !endereco_id || !endereco_mac || !apelido || !modelo) {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }
    if (endereco_mac.length !== 12) {
        return res.status(400).json({ mensagem: "O MAC deve ter 12 caracteres, sem ':'." });
    }

    try {
        await dashboardModel.cadastrarServidor(empresa_id, endereco_id, endereco_mac, apelido, modelo);
        res.status(201).json({ mensagem: "Servidor cadastrado com sucesso." });
    } catch (erro) {
        console.log("Erro ao cadastrar servidor:", erro.sqlMessage || erro);
        if (erro.errno === 1062) {
            return res.status(409).json({ mensagem: "Já existe um servidor com esse MAC." });
        }
        res.status(500).json({ mensagem: "Erro ao cadastrar servidor." });
    }
}

module.exports = {
    kpiServidoresAtivos,
    listarUsuariosPorEmpresa,
    listarServidores,
    listarStatusServidor,
    buscarNomeEmpresa,
    kpiAlertasRecentes,
    listarDetalhesServidor,
    cadastrarServidor
};