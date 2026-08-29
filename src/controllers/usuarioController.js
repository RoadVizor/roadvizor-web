var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
  const { email, senha } = req.body;

  if (email == undefined) {
    res.status(400).send({ message: "Seu email está undefined!" });
  } else if (senha == undefined) {
    res.status(400).send({ message: "Sua senha está indefinida!" });
  } else {
    usuarioModel
      .autenticar(email, senha)
      .then(function (resultado) {
        if (resultado.length == 1) {
          console.log(resultado);

          res.json({
            message: "Usuário logado com sucesso!",
            user: resultado[0],
          });
        } else {
          res.status(403).send({ message: "Email e/ou senha inválido(s)" });
        }
      })
      .catch(function (erro) {
        console.log(erro);
        console.log(
          "\nHouve um erro ao realizar o login! Erro: ",
          erro.sqlMessage,
        );
        res.status(500).json({ message: erro.sqlMessage });
      });
  }
}

function cadastrar(req, res) {
  const { nome, email, senha, cargo, empresaId } = req.body;

  usuarioModel
    .cadastrar(nome, email, senha, cargo, empresaId)
    .then(function (resultado) {
      res.json({ message: "Usuário cadastrado com sucesso!" });
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nErro no MYSQL: ", erro.sqlMessage);
      res.status(500).json({ message: erro.sqlMessage });
    });
}

module.exports = {
  autenticar,
  cadastrar,
};
