const formColaborador = document.getElementById("formColaborador");



formColaborador.addEventListener("submit", async function (event) {
    event.preventDefault();

    // captura os valores dos campos pelo id no html
    const nome = document.getElementById("nomeColaborador").value;
    const cargo = document.getElementById("cargoColaborador").value;
    const email = document.getElementById("emailColaborador").value;
    const senha = document.getElementById("senhaColaborador").value;
    const nivel_acesso = Number(document.getElementById("nivelColaborador").value);

    try{
        // enviar os dados para o backend
        const resposta = await fetch("/equipe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            nome: nome,
            cargo: cargo,
            email: email,
            senha: senha,
            nivel_acesso: nivel_acesso
        })
        });
        
        // Aqui estamos recebendo as respostas do backend transformando o conteudo em objeto javascript e tratando possiveis erro com try e catch
        const dados = await resposta.json();
        if(resposta.ok){
            alert("Colaborador cadastrado com sucesso! ");

            formColaborador.reset();
            fecharModelaColaborador();
        } else{
            alert(dados.message || "Erro ao cadastrar colaborador.")
    }}
    catch(erro){
        console.erro("Erro ao cadastrar colaborador", erro);
        alert("Não foi possível conectar ao servidor")
    }
});