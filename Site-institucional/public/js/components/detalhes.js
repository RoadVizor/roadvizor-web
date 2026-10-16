async function mostrarDetalhes(element) {
    await lerDados();

    let divDetalhes = document.getElementById('detalhes');

    let mac = element.id;
    let servidor = servidorPorMac(mac);

    let componentes = servidor.componentes;

    let html = '';


    componentes.forEach(comp => {
        html += `
            <div class="itemComponente" id="${servidor.MAC_Adress}" onclick="select(this, 'itemComponente', 'itemComponenteSelected', mostrarGrafico)">
                <p class="font-bold text-xl">${comp.nome}(${comp.metrica})</p>
            </div>
        `;
    });

    divDetalhes.innerHTML = `
        <p id="nomeServidor" class="font-bold text-xl">${servidor.apelido}</p>

        <div class="w-full flex flex-col">
            <div class="w-full flex gap-2 border-b-1 border-b-disabled">
              <p class="itemNavDetalhes itemNavDetalhesSelected" id="${servidor.MAC_Adress}" onclick="select(this, 'itemNavDetalhes', 'itemNavDetalhesSelected', mostrarDetalhes)">Detalhes</p>
              <p class="itemNavDetalhes" id="${servidor.MAC_Adress}" onclick="select(this, 'itemNavDetalhes', 'itemNavDetalhesSelected', mostrarAlertas)">Alertas</p>
            </div>
            <div class="w-full grid grid-cols-3 divide-x-1 divide-disabled" id="especificacoes">
                <div class="col-span-2 grid grid-cols-3 grid-rows-2 gap-3 p-4 h-65">
                    ${html}
                </div>
                <div class="col-span-1" id="grafico"></div>
            </div>
        </div>
    `;
}

function mostrarGráfico(element) {
    let mac = element.id;
    let servidor = servidorPorMac(mac);
}

function mostrarAlertas(element){
    let mac = element.id;
    let servidor = servidorPorMac(mac); 
    let divEspecificacoes = document.getElementById("especificacoes");

    divEspecificacoes.classList.remove('grid')
    divEspecificacoes.classList.add('flex')

    let alertas = "";

    servidor.alertas.forEach(alerta => {
        alertas += `
            <div class="itemAlertas" id="${servidor.MAC_Adress}" onclick="select(this, 'itemAlertas', 'itemAlertasSelected', mostraDetalhes)">
                <div>${alerta.status}</div>
                <div>${alerta.componente}</div>
            </div>
        `
    })

    if(servidor.alertas.length == 0){
        divEspecificacoes.innerHTML = `
            <div class="w-full bg-surface rounded-xl p-2 gap-2">
                <div class="w-full h-full flex justify-center items-center">
                    <p class="font-bold text-xl">Sem alertas para ${servidor.apelido}! :)</p>
                </div>
            </div>
        `;
        
        return;
    }

    divEspecificacoes.innerHTML = `
        <div class="w-full bg-surface rounded-xl p-2 gap-2">
        <div class="w-full flex gap-1 p-2 font-bold items-center gap-10 text-disabled">
          <p>Status</p>
          <p>|</p>
          <p>Componente</p>
        </div>
        <div  id="listaServidores" class="w-full h-50 max-h-full overflow-y-auto flex flex-col gap-2">
          ${alertas}
        </div>
      </div>
    `;
}

