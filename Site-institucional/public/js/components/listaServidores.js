async function listarServidores(){
    await lerDados();
    let html = "";
    let lista = document.getElementById("listaServidores")

    dados.forEach(servidor => {
        html += `
            <div class="itemServidores" id="${servidor.MAC_Adress}" onclick="select(this, 'itemServidores', 'itemServidoresSelected', mostrarDetalhes)">
                <div>${servidor.apelido}</div>
                <div>${servidor.MAC_Adress}</div>
                <div>${servidor.modelo}</div>
            </div>
        `;
    });

    lista.innerHTML = html;
}

function servidorPorMac(mac) {    
    let servidor;

    dados.forEach(serv => {
        if(serv.MAC_Adress == mac){
            servidor = serv;
        }
    })

    return servidor;
}