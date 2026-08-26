var empresaModel = require("../models/empresaModel");

function cadastrar(req, res) {
  const { cnpj, razao_social, nome_fantasia, email, senha } = req.body;

  empresaModel
    .cadastrar(cnpj, razao_social, nome_fantasia, email, senha)
    .then(function (resultado) {
      res.json({ message: "Empresa cadastrada com sucesso!" });
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nErro no MYSQL: ", erro.sqlMessage);
      res.status(500).json({ message: erro.sqlMessage });
    });
}

function getById(req, res) {
  const { id } = req.params;

  if (id == undefined) {
    res.status(400).send({ message: "ID de Empresa está undefined!" });
  } else {
    empresaModel
      .getById(id)
      .then(function (resultado) {
        console.log(resultado);

        res.json({
          message: "Empresa encontrada com sucesso!",
          empresa: resultado[0],
        });
      })
      .catch(function (erro) {
        console.log(erro);
        console.log(
          "\nHouve um erro ao procurar Empresa por ID! Erro: ",
          erro.sqlMessage,
        );
        res.status(500).json({ message: erro.sqlMessage });
      });
  }
}

module.exports = {
  cadastrar,
  getById,
};
