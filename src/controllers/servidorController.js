const servidorModel = require("../models/servidorModel");

function cadastrar(req, res) {
  const {empresa_id, endereco_id, endereco_mac, apelido, modelo } = req.body;

  servidorModel
    .cadastrar(empresa_id, endereco_id, endereco_mac, apelido, modelo)
    .then(function (resultado) {
      res.json({ message: "Servidor cadastrado com sucesso!" });
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nErro no MYSQL: ", erro.sqlMessage);
      res.status(500).json({ message: erro.sqlMessage });
    });
}

function remover(req, res) {
  const { id_servidor, empresa_id } = req.body;

  servidorModel
    .remover(id_servidor, empresa_id)
    .then(function (resultado) {
      res.json({ message: "Servidor removido com sucesso!" });
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nErro no MYSQL: ", erro.sqlMessage);
      res.status(500).json({ message: erro.sqlMessage });
    });
}

function editar(req, res) {
  const { id_servidor, endereco_mac, apelido, modelo } = req.body;

  servidorModel
    .editar(id_servidor, endereco_mac, apelido, modelo)
    .then(function (resultado) {
      res.json({ message: "Servidor editado com sucesso!" });
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nErro no MYSQL: ", erro.sqlMessage);
      res.status(500).json({ message: erro.sqlMessage });
    });
}

module.exports = {
    cadastrar,
    remover,
    editar
}