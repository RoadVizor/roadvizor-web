function cadastrar() {
  var nome = nome.value;
  var email = email.value;
  var senha = senha.value;
  var cargo = cargo.value;
  var empresa = 1;

  fetch("/usuarios/cadastrar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome: nome,
      email: email,
      senha: senha,
      cargo: cargo,
      empresa: empresa,
    }),
  })
    .then(function (resposta) {
      console.log("resposta: ", resposta);

      if (resposta.ok) {
        alert(
          "Cadastro realizado com sucesso! Redirecionando para tela de Login...",
        );

        window.location = "../login.html";
      } else {
        throw "Houve um erro ao tentar realizar o cadastro!";
      }
    })
    .catch(function (resposta) {
      console.log(`#ERRO: ${resposta}`);
    });

  return false;
}
