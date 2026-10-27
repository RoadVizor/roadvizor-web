
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
                <p class="font-bold text-xl" id="${comp.id}">${comp.nome}(${comp.metrica})</p>
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
                <div class="col-span-1" id="grafico">

                </div>
            </div>
        </div>
    `;
}

function mostrarGrafico(element) {
    let mac = element.id;
    let servidor = servidorPorMac(mac);
    let ctxWrapper = document.getElementById('grafico');
    let id_comp = element.querySelector('p').id;
    let data = {};
    let componente = ''

    servidor.componentes.forEach(comp => {
        if(id_comp == comp.id){
            data = comp.ultimasLeituras;
            componente = comp.nome
        };
    })

    ctxWrapper.innerHTML = `
        <canvas id="ctx"></canvas>
    `;

    new Chart(ctx, {
        type:"line",
        data: {
            labels: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "1:00",],
            datasets: [{
                label: componente,
                data: data,
                fill: false,
                borderColor: '#28c76f',
                tension: 0.1
            }]
        }
    })
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
            <div class="itemAlertas" id="${servidor.MAC_Adress}">
                <div>${alerta.titulo}</div>
                <div>${alerta.status}</div>
                <div>${alerta.descricao}</div>
            </div>
        `
    })

    if(servidor.alertas.length == 0){
        divEspecificacoes.innerHTML = `
            <div class="w-full bg-surface rounded-xl p-2 gap-2">
                <div class="w-full h-50 flex justify-center items-center">
                    <p class="font-bold text-xl">Sem alertas para ${servidor.apelido}! :)</p>
                </div>
            </div>
        `;
        
        return;
    }

    divEspecificacoes.innerHTML = `
        <div class="w-full bg-surface rounded-xl p-2 gap-2">
        <div class="w-full flex gap-1 p-2 font-bold items-center gap-20 text-disabled">
          <p>Titulo</p>
          <p>|</p>
          <p>Status</p>
          <p>|</p>
          <p>Descrição</p>
        </div>
        <div  id="listaServidores" class="w-full h-50 max-h-full overflow-y-auto flex flex-col gap-2">
          ${alertas}
        </div>
      </div>
    `;
}
