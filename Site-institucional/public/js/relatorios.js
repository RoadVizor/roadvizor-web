
      // usados pelo listaServidores.js (precisam ser globais)
      let dados;
      async function lerDados() {
        dados = await (await fetch("../../js/dados.json")).json();
      }

      document.addEventListener("DOMContentLoaded", () => {
        autenticarPagina(1);
        if (sessionStorage.showmsg == 2) {
          toast({ title: "Usuário já autenticado!", variant: "success" });
          storage.remove("showmsg");
        }
        listarServidores();
        carregarRelatorios();
      });

        // Código simplificado: sem helpers $, $$, el. Usamos document.querySelector / createElement diretamente.
        (function(){

        // o empresa_id vai no token (req.usuario no back); o cookie segue junto
        async function api(rota, params) {
          const res = await fetch(`/api/log/${rota}?${new URLSearchParams(params)}`);
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.message || `Erro ${res.status} em /${rota}`);
          return json.log;
        }

        // chave -> [classe do card, rótulo]
        // Mapeamento único de status do banco para chaves usadas no front
        // Simplified status mapping for beginners
        function statusDe(s) {
          var t = String(s || "").toLowerCase();
          // remove acentos simples (áéíóú) for common cases
          t = t.replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u").replace(/ã/g, "a").replace(/ô/g, "o");
          if (t.indexOf("crit") !== -1) return "critico";
          if (t.indexOf("medio") !== -1 || t.indexOf("med") !== -1 || t.indexOf("atenc") !== -1) return "alerta";
          if (t.indexOf("baixo") !== -1 || t.indexOf("normal") !== -1 || t === "ok") return "normal";
          if (t.indexOf("inativo") !== -1) return "inativo";
          console.warn('status desconhecido:', s);
          return "inativo";
        }

        // Mapeamento simples usado para classe/rotulo nos cards
        // Observação: o CSS espera a classe "alerta" para atenção, portanto
        // usamos a chave "alerta" aqui para manter compatibilidade visual.
        var STATUS = {
          normal: ['normal','Normal'],
          alerta: ['alerta','Atenção'],
          critico: ['critico','Crítico'],
          inativo: ['inativo','Inativo']
        };

        const ROTULO = { cpu: "CPU", ram: "RAM", gpu: "GPU", placa_rede: "Rede" };
        const nomeComp = (n) => {
          const t = String(n || "").trim().toLowerCase();
          return !t ? "--" : ROTULO[t] || t.split("_").map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");
        };

        /* ---------- KPIs ---------- */
        async function logsHoje() {
          var res = await api('buscar-hoje');
          var response = res[0];
          document.querySelector('.rel-logs .rel-big').textContent = response.log;
          document.querySelector('.rel-logs small').textContent = new Date().toLocaleDateString('pt-BR');
        }

        let chartStatus, chartDetalhe;
        async function statusServidores() {
          // usar as mesmas chaves que statusDe() retorna: normal, alerta, critico, inativo
          var counts = { normal: 0, alerta: 0, critico: 0, inativo: 0 };
          var rows = await api('grafico-kpi');
          rows.forEach(function(r){ const k = statusDe(r.status); counts[k] = (counts[k] || 0) + Number(r.total || 0); });
          document.getElementById('leg-normal').textContent = counts.normal;
          // legenda usa id leg-atencao (mantemos id por compatibilidade DOM), mas lemos counts.alerta
          document.getElementById('leg-atencao').textContent = counts.alerta;
          document.getElementById('leg-critico').textContent = counts.critico;
          document.getElementById('leg-inativo').textContent = counts.inativo;
          document.getElementById('status-total').textContent = counts.normal + counts.alerta + counts.critico + counts.inativo;
          if (chartStatus) chartStatus.destroy();
          chartStatus = new Chart(document.getElementById('chart-status'), {
            type: 'doughnut',
            data: { labels: ['Normal','Atenção','Crítico','Inativo'], datasets: [{ data: [counts.normal, counts.alerta, counts.critico, counts.inativo], backgroundColor:['#28c76f','#e4af44','#ff4d6d','#6b7785'] }] },
            options: { cutout: '60%', plugins: { legend: { display: false } } }
          });
        }

        // Aplica classe do estado + cor do número e da barra de uma vez só,
        // limpando qualquer inline anterior para não sobrar cor residual.
        function pintarUso(card, estado) {
          const cores = {
            normal:  'var(--st-normal)',
            alerta:  'var(--st-atencao)',
            critico: 'var(--st-critico)',
            inativo: 'var(--st-inativo, #6b7785)'
          };
          const cor = cores[estado] || cores.normal;

          card.classList.remove('critico', 'alerta', 'normal', 'inativo');
          card.classList.add(estado);

          const fill = card.querySelector('.rel-bar-fill');
          const percent = card.querySelector('.rel-percent');

          // limpa inline anterior e reaplica
          fill.style.background = '';
          percent.style.color = '';
          fill.style.background = cor;
          percent.style.color = cor;
        }

        async function maiorUso() {
          var rows = await api('buscar-maior-uso');
          var response = rows[0] || null;
          var card = document.querySelector('.rel-uso');
          if (!response) {
            card.querySelector('.rel-percent').textContent = '--';
            card.querySelector('.rel-uso-top b').textContent = 'Sem dados';
            card.querySelector('.rel-uso-top small').textContent = '';
            card.querySelector('.rel-bar-fill').style.width = '0%';
            return;
          }
          // Garantir que valor_uso é tratado como percentual
          var uso = Number(response.valor_uso);
          if (isNaN(uso)) uso = 0;
          var limite = response.limite_max;
          card.querySelector('.rel-percent').textContent = Math.round(uso) + '%';
          card.querySelector('.rel-uso-top b').textContent = nomeComp(response.componente);
          card.querySelector('.rel-uso-top small').textContent = response.servidor || '';
          if (limite !== undefined && limite !== null && limite !== '' && !isNaN(Number(limite))) {
            card.querySelector('.rel-uso > small').textContent = 'limite ' + (isNaN(Number(limite)) ? limite : Math.round(Number(limite)) + '%');
            card.querySelector('.rel-bar-limit').style.left = Math.min(Number(limite) || 0,100) + '%';
          } else {
            card.querySelector('.rel-uso > small').textContent = '';
          }
          card.querySelector('.rel-bar-fill').style.width = Math.min(uso,100) + '%';

          // Preferência: status vindo do banco; fallback por thresholds
          const estado = response.status
            ? statusDe(response.status)
            : (uso >= 90 ? 'critico' : uso >= 70 ? 'alerta' : 'normal');
          pintarUso(card, estado);
        }

        async function logsPorComponente() {
          var rows = await api('buscar-componente');
          var ul = document.querySelector('.rel-comp ul');
          if (!rows || rows.length === 0) { ul.innerHTML = '<li>Nenhum registro</li>'; return; }
          var maior = 1;
          for (var i=0;i<rows.length;i++) { if (Number(rows[i].total) > maior) maior = Number(rows[i].total); }
          ul.innerHTML = '';
          for (var j=0;j<rows.length;j++) {
            var r = rows[j];
            var li = document.createElement('li');
            var span = document.createElement('span'); span.textContent = nomeComp(r.componente);
            var barra = document.createElement('div'); barra.className = 'rel-bar thin';
            var fill = document.createElement('div'); fill.className = 'rel-bar-fill'; fill.style.width = ((Number(r.total)/maior)*100)+'%';
            barra.appendChild(fill);
            var b = document.createElement('b'); b.textContent = r.total;
            li.appendChild(span); li.appendChild(barra); li.appendChild(b);
            ul.appendChild(li);
          }
        }

        /* ---------- Cards de servidores ---------- */
        function cardServidor(response) {
          response = response || {};
          const st = statusDe(response.status);
          const [classe, rotulo] = STATUS[st];

          // create card element without relying on helper `el`
          const card = document.createElement('div');
          card.className = `srv-card ${classe}`;
          card.dataset.id = response.servidor;
          card.dataset.servidorId = response.servidor_id ?? "";
          card.dataset.componenteId = response.componente_id ?? "";
          card.dataset.status = st; // normal | alerta | critico | inativo
          card.dataset.comp = String(response.componente || "").toLowerCase();

          const header = document.createElement('header');

          const iLine = document.createElement('i');
          iLine.className = 'srv-line';

          const h3 = document.createElement('h3');
          h3.textContent = response.servidor;

          const spanBadge = document.createElement('span');
          spanBadge.className = 'badge';
          spanBadge.textContent = rotulo;

          header.appendChild(iLine);
          header.appendChild(h3);
          header.appendChild(spanBadge);

          const btn = document.createElement('button');
          btn.className = `srv-btn${st === "critico" ? " primary" : ""}`;
          btn.dataset.abrir = "";
          btn.innerHTML = '<i class="ph ph-books"></i> Abrir Relatório';

          const pComp = document.createElement('p');
          pComp.className = 'srv-comp';
          pComp.textContent = `COMPONENTE: ${response.componente ? String(response.componente).toUpperCase() : "--"}`;

          const pDesc = document.createElement('p');
          pDesc.textContent = response.descricao_ia || "Sem registros recentes para este servidor.";

          card.appendChild(header);
          card.appendChild(pComp);
          card.appendChild(pDesc);
          card.appendChild(btn);
          return card;
        }

        async function cards() {
          var rows = await api('renderizar-card');
          var track = document.getElementById('rel-track'); track.innerHTML = '';
          if (!rows || rows.length === 0) { track.innerHTML = '<p>Nenhum servidor encontrado.</p>'; return; }
  // sort rows so critical servers come first (critico > atencao > normal > inativo)
  const order = { critico: 3, atencao: 2, normal: 1, inativo: 0 };
  // prioridade: critico > alerta > normal > inativo
  const priority = { critico: 3, alerta: 2, normal: 1, inativo: 0 };
  rows.sort(function(a,b){
    const sa = statusDe(a.status);
    const sb = statusDe(b.status);
    const pa = priority[sa] || 0;
    const pb = priority[sb] || 0;
    if (pa !== pb) return pb - pa; // maior prioridade primeiro
    // desempate por valor_uso (maior primeiro)
    const ua = Number(a.valor_uso) || 0;
    const ub = Number(b.valor_uso) || 0;
    if (ub !== ua) return ub - ua;
    // desempate final por servidor_id (maior primeiro)
    return (Number(b.servidor_id) || 0) - (Number(a.servidor_id) || 0);
  });
  for (var i=0;i<rows.length;i++) {
    try {
      track.appendChild(cardServidor(rows[i]));
    } catch (e) {
      console.error('Erro ao renderizar card para servidor', rows[i] && rows[i].servidor_id, e);
    }
  }
  aplicarFiltros();
        }

        /* ---------- Filtros e pesquisa ---------- */
        function normalizar(t) {
          return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
        }


        function aplicarFiltros() {
          var termo = normalizar(document.querySelector('.src-search input').value);
          var comp = document.getElementById('filtro-componente').value;
          var status = document.getElementById('filtro-status').value;
          if (status === 'atencao') status = 'alerta'; // o card usa a chave "alerta"

          // bolinha do filtro de status acompanha a cor do status escolhido
          var dot = document.querySelector('.src-dot');
          if (dot) {
            var coresDot = { normal: '#28c76f', alerta: '#e4af44', critico: '#ff4d6d', inativo: '#6b7785' };
            var corDot = coresDot[status] || '';
            dot.style.background = corDot;           // '' = volta para a cor padrão do CSS
            dot.style.boxShadow = corDot ? '0 0 6px ' + corDot : '';
          }

          var track = document.getElementById('rel-track');
          var todos = track.querySelectorAll('.srv-card');
          var visiveis = 0;

          todos.forEach(function (c) {
            var okNome = !termo || normalizar(c.dataset.id).indexOf(termo) !== -1;
            var okComp = !comp || (c.dataset.comp || '').indexOf(comp) !== -1;
            var okStatus = !status || c.dataset.status === status;
            var mostrar = okNome && okComp && okStatus;
            c.hidden = !mostrar;
            c.style.display = mostrar ? '' : 'none';
            if (mostrar) visiveis++;
          });

          var vazio = document.getElementById('rel-vazio');
          if (todos.length && !visiveis) {
            if (!vazio) {
              vazio = document.createElement('p');
              vazio.id = 'rel-vazio';
              vazio.textContent = 'Nenhum servidor encontrado com esses filtros.';
              track.appendChild(vazio);
            }
          } else if (vazio) {
            vazio.remove();
          }
        }

        document.querySelector('.src-search input').addEventListener('input', aplicarFiltros);
        document.getElementById('filtro-componente').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);

        window.carregarRelatorios = async function() {
          try {
            await Promise.all([logsHoje(), statusServidores(), maiorUso(), logsPorComponente(), cards()]);
          } catch (e) {
            console.error('[relatorios]', e);
            toast({ title: 'Erro ao carregar', message: e.message || e, variant: 'destructive' });
          }
        };

        /* ---------- Relatório detalhado ---------- */
        function graficoDetalhe({ labels, uso, limite }) {
          const ctx = document.getElementById('chart-detalhe').getContext('2d');
          const grad = ctx.createLinearGradient(0, 0, 0, 260);
          grad.addColorStop(0, "rgba(40,199,111,0.35)");
          grad.addColorStop(1, "rgba(40,199,111,0)");
          const grade = { color: "rgba(14,90,167,0.2)" };
          const tick = { color: "#9dafbe", font: { size: 13 } };

          if (chartDetalhe) chartDetalhe.destroy();
          chartDetalhe = new Chart(ctx, {
            type: "line",
            data: {
              labels,
              datasets: [
                { data: uso, borderColor: "#28c76f", backgroundColor: grad, fill: true, tension: 0.35, borderWidth: 2, pointRadius: 4, pointBackgroundColor: "#28c76f" },
                { data: labels.map(() => limite), borderColor: "#ff6b81", borderDash: [6, 6], borderWidth: 1.5, pointRadius: 0 },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.parsed.y}%` } } },
              scales: {
                x: { grid: grade, ticks: tick },
                y: { min: 0, max: 100, grid: grade, ticks: { ...tick, stepSize: 20, callback: (v) => v + "%" } },
              },
            },
          });
        }

        /* ---------- Lista de logs do servidor ---------- */
        function formatarDataHora(v) {
          var d = new Date(v);
          if (isNaN(d.getTime())) return String(v || '--');
          return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        }

        async function carregarLogsServidor(servidorId, componenteId) {
          var ul = document.getElementById('det-logs');
          ul.innerHTML = '<li class="vazio">Carregando...</li>';
          if (!servidorId || !componenteId) {
            ul.innerHTML = '<li class="vazio">Sem logs para este servidor.</li>';
            return;
          }
          try {
            var logs = await api('listar-logs', { servidor_id: servidorId, componente_id: componenteId, dias: 7 });
            if (!logs || !logs.length) {
              ul.innerHTML = '<li class="vazio">Nenhum log nos últimos 7 dias.</li>';
              return;
            }
            ul.innerHTML = '';
            logs.forEach(function (l) {
              var st = statusDe(l.status);
              var li = document.createElement('li');
              li.className = st;

              var topo = document.createElement('div');
              topo.className = 'log-topo';
              var hora = document.createElement('span');
              hora.className = 'log-hora';
              hora.textContent = formatarDataHora(l.data_hora);
              var badge = document.createElement('span');
              badge.className = 'badge';
              badge.textContent = STATUS[st][1];
              var uso = document.createElement('b');
              uso.textContent = (l.valor_uso !== null && l.valor_uso !== undefined) ? Math.round(Number(l.valor_uso)) + '%' : '--';
              topo.appendChild(hora); topo.appendChild(badge); topo.appendChild(uso);

              var titulo = document.createElement('p');
              titulo.textContent = l.titulo || '';

              li.appendChild(topo);
              li.appendChild(titulo);
              ul.appendChild(li);
            });
          } catch (e) {
            ul.innerHTML = '<li class="vazio">Não foi possível carregar os logs.</li>';
            console.error('[logs do servidor]', e);
          }
        }

        async function abrirRelatorio(id) {
          var card = document.querySelector('.srv-card[data-id="' + id + '"]');
          if (!card) return;
          var servidorId = card.dataset.servidorId;
          var componenteId = card.dataset.componenteId;
          var comp = card.querySelector('.srv-comp').textContent.replace('COMPONENTE:', '').trim();

          relatorioAtual = { servidorId, componenteId, servidor: id, componente: comp.toLowerCase() };

          document.getElementById('det-servidor').textContent = id;
          document.getElementById('det-grafico-titulo').textContent = 'Uso de ' + comp;
          var all = document.querySelectorAll('.srv-card');
          for (var i=0;i<all.length;i++) { all[i].classList.toggle('ativo', all[i] === card); }

          // mostra a seção antes de desenhar (o canvas precisa ter tamanho)
           var secao = document.getElementById('rel-detalhe');
           secao.hidden = false;
           secao.scrollIntoView({ behavior: "smooth", block: "start" });

          let hist = [];
          if (servidorId && componenteId) {
            try {
              hist = await api("historico", { servidor_id: servidorId, componente_id: componenteId, dias: 7 });
            } catch (e) {
              toast({ title: "Erro ao carregar histórico", message: e.message, variant: "destructive" });
            }
          }

           var uso = hist.map(function(h){ return Number(h.uso); });
           var limite = Number((hist[0] && hist[0].limite_max) ? hist[0].limite_max : 80);
           const media = uso.reduce((a, b) => a + b, 0) / (uso.length || 1);
           var resumo = '';
           if (uso.length) {
             var pico = Math.max.apply(null, uso).toFixed(0);
             var mediaF = media.toFixed(0);
             var acima = uso.filter(function(u){ return u > limite; }).length;
             resumo = 'Nos últimos 7 dias: pico de ' + pico + '%, média de ' + mediaF + '% e ' + acima + ' de ' + uso.length + ' dia(s) com pico acima do limite de ' + limite + '%.';
           } else {
             resumo = 'Sem leituras de uso nos últimos 7 dias para este servidor.';
           }

           var detTexto = document.getElementById('det-texto');
           detTexto.innerHTML = '';
           var p1 = document.createElement('p');
           var pOrig = card.querySelector('p:not(.srv-comp)');
           p1.textContent = pOrig ? pOrig.textContent : '';
           var p2 = document.createElement('p'); p2.textContent = resumo;
           detTexto.appendChild(p1); detTexto.appendChild(p2);
           graficoDetalhe({ labels: hist.map((h) => h.dia), uso, limite });
           carregarLogsServidor(servidorId, componenteId);
        }

        document.getElementById('rel-track').addEventListener('click', function(e){
          var btn = e.target.closest ? e.target.closest('[data-abrir]') : null;
          if (btn) {
            var id = btn.closest('.srv-card').dataset.id;
            abrirRelatorio(id);
          }
        });

        window.limparFiltros = function() {
          document.querySelector('.src-search input').value = '';
          document.getElementById('filtro-componente').value = '';
          document.getElementById('filtro-status').value = '';
          aplicarFiltros();
        };
        })();

        async function exportarPdf() {
            if (!relatorioAtual) return;
            const params = new URLSearchParams(relatorioAtual);
            //  OPTAR POR COLOCAR MOCKADO NO "res" OU NOME DO CONTAINER
            // const network = process.env.CONTAINER_NAME;

            try {
              const res = await fetch(`http://localhost:8080/relatorio/pdf?` + params, {
                credentials: "include"
              });

              if (!res.ok) {
                const msg = await res.text().catch(() => "");
                toast({
                  title: "Erro ao gerar PDF",
                  message: msg || `Status ${res.status}`,
                  variant: "destructive"
                });
                return;
              }

              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `relatorio-${relatorioAtual.servidor}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            } catch (err) {
              toast({
                title: "Erro de conexão",
                message: "Não foi possível comunicar com a API de PDF.",
                variant: "destructive"
              });
            }
          }