function entrar(event) {
    event.preventDefault();

    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;

    if (email == "" || senha == "") {
        alert("Informações inválidas!")
        return false;
    }

    fetch("/api/usuarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            senha: senha
        })
    }).then(function (resposta) {
        if (resposta.ok) {
            console.log(resposta);

            resposta.json().then(json => {
                console.log(json);
                console.log(JSON.stringify(json));
                sessionStorage.EMPRESA_ID = json.empresa_id;
                sessionStorage.NIVEL_USUARIO = json.nivel_acesso;
                sessionStorage.NOME_USUARIO = json.nome;
                sessionStorage.EMAIL_USUARIO = json.email;
                sessionStorage.CARGO_USUARIO = json.cargo;
            });

        } else {
            resposta.text().then(texto => {
                console.error(texto);
            });
        }

    }).catch(function (erro) {
        console.log(erro);
    })

    return false;
}