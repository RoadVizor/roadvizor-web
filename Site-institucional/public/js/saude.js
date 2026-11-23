document.addEventListener("DOMContentLoaded", () => {
  const mockPath = "/data/mock-saude.json";

  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function safeNumber(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatPercent(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "--";
    return `${Number(n)}%`;
  }

  function formatDateISO(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso || "—";
      return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso || "—";
    }
  }

  async function loadData() {
    try {
      const res = await fetch(mockPath, { cache: "no-store" });
      if (!res.ok) throw new Error("mock not found");
      return await res.json();
    } catch (e) {
      console.warn("Falha ao carregar mock, usando dados de fallback.", e);
      return null;
    }
  }

  function createDonut(ctx, kpis) {
    const colorGood = getCssVar("--color-chart-2") || "#28c76f";
    const colorWarn = getCssVar("--color-chart-4") || "#e4af44";
    const colorCrit = getCssVar("--destructive-text") || "#ec8179";

    const good = safeNumber(kpis.servidores_saudaveis ?? kpis.servidores_saudaveis);
    const warn = safeNumber(kpis.servidores_atencao ?? kpis.servidores_atencao);
    const crit = safeNumber(kpis.servidores_criticos ?? kpis.servidores_criticos);

    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Saudável", "Atenção", "Crítico"],
        datasets: [{
          data: [good, warn, crit],
          backgroundColor: [colorGood, colorWarn, colorCrit],
          hoverOffset: 6,
          borderWidth: 0
        }]
      },
      options: {
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: false
      }
    });
  }

  function createLine(ctx, labels, values) {
    const colorLine = getCssVar("--color-chart-1") || "#0e5aa7";
    const pointColor = getCssVar("--color-chart-3") || "#4fb3e8";

    // Use values as-is (allow nulls for gaps)
    const dataValues = Array.isArray(values) ? values.map(v => (v === null ? null : Number(v))) : [];

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.isArray(labels) ? labels : [],
        datasets: [{
          label: "Saúde (%)",
          data: dataValues,
          borderColor: colorLine,
          backgroundColor: colorLine,
          pointBackgroundColor: pointColor,
          tension: 0.25,
          fill: false,
          borderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: v => v + "%" } }
        },
        maintainAspectRatio: false
      }
    });
  }

  function populateKpisFromMock(raw) {
    const k = raw?.kpis || {};
    document.querySelectorAll("[data-kpi-total]").forEach(el => el.textContent = k.servidores_totais ?? (raw?.servidores ? raw.servidores.length : 0));
    document.querySelectorAll("[data-kpi-saudavel]").forEach(el => el.textContent = k.servidores_saudaveis ?? 0);
    document.querySelectorAll("[data-kpi-atencao]").forEach(el => el.textContent = k.servidores_atencao ?? 0);
    document.querySelectorAll("[data-kpi-critico]").forEach(el => el.textContent = k.servidores_criticos ?? 0);
    document.querySelectorAll("[data-kpi-saudavel-main]").forEach(el => el.textContent = k.servidores_saudaveis ?? 0);
    document.querySelectorAll("[data-kpi-atencao-main]").forEach(el => el.textContent = k.servidores_atencao ?? 0);
    document.querySelectorAll("[data-kpi-critico-main]").forEach(el => el.textContent = k.servidores_criticos ?? 0);

    const pctEl = document.getElementById("saude-percent");
    if (pctEl) pctEl.textContent = (k.saude_percent !== undefined ? `${k.saude_percent}%` : (raw?.kpis?.saude_percent ? `${raw.kpis.saude_percent}%` : "--"));
  }

  function populateServersFromMock(rawServers) {
    const tbody = document.querySelector("[data-servers-list]");
    const countEl = document.querySelector("[data-servers-count]");
    if (!tbody) return;
    tbody.innerHTML = "";
    const list = Array.isArray(rawServers) ? rawServers : [];
    if (list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" class="py-4 text-center text-muted">Nenhum servidor encontrado</td>`;
      tbody.appendChild(tr);
      if (countEl) countEl.textContent = "0";
      return;
    }
    list.forEach(s => {
      const name = s.apelido || s.name || `srv-${s.id ?? ""}`;
      const cpu = s.componentes?.cpu !== undefined ? `${s.componentes.cpu}%` : (s.cpu ?? "—");
      const ram = s.componentes?.ram !== undefined ? `${s.componentes.ram}%` : (s.ram ?? "—");
      const disco = s.componentes?.disco !== undefined ? `${s.componentes.disco}%` : (s.disco ?? "—");
      const rede = s.componentes?.rede !== undefined ? `${s.componentes.rede} Mbps` : (s.rede ?? "—");
      const status = s.status ?? s.saude ?? s.health ?? "";
      const updated = s.ultima_atualizacao ?? s.updated ?? s.ultimaAtualizacao ?? "";

      const tr = document.createElement("tr");
      tr.className = "border-b";
      tr.innerHTML = `
        <td class="py-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-sm font-semibold">${String(name).slice(0,3)}</div>
            <div>
              <div class="text-sm font-medium">${name}</div>
              <div class="text-xs text-muted">${s.location ?? ""}</div>
            </div>
          </div>
        </td>
        <td class="py-3">${cpu}</td>
        <td class="py-3">${ram}</td>
        <td class="py-3">${disco}</td>
        <td class="py-3">${rede}</td>
        <td class="py-3"><span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style="background:${statusBg(status)};color:${statusColor(status)}">${humanStatus(status)}</span></td>
        <td class="py-3">${formatDateISO(updated)}</td>
      `;
      tbody.appendChild(tr);
    });
    if (countEl) countEl.textContent = String(list.length);
  }

  function humanStatus(s) {
    if (!s) return "";
    const st = String(s).toLowerCase();
    if (st.includes("saud")) return "Saudável";
    if (st.includes("aten")) return "Atenção";
    if (st.includes("crit") || st.includes("critico")) return "Crítico";
    return String(s);
  }

  function statusBg(saude) {
    if (!saude) return "transparent";
    const st = String(saude).toLowerCase();
    if (st.includes("saud")) return getCssVar("--success-bg") || "#1e3e2c";
    if (st.includes("aten")) return getCssVar("--warning-bg") || "#40331c";
    return getCssVar("--destructive-bg") || "#401e1c";
  }
  function statusColor(saude) {
    if (!saude) return "inherit";
    const st = String(saude).toLowerCase();
    if (st.includes("saud")) return getCssVar("--success-text") || "#88ddae";
    if (st.includes("aten")) return getCssVar("--warning-text") || "#ebbe70";
    return getCssVar("--destructive-text") || "#ec8179";
  }

  // bootstrap
  (async () => {
    const raw = await loadData();
    const data = raw || {};

    // KPIs & Donut
    const donutEl = document.getElementById("saude-donut");
    if (donutEl && window.Chart) {
      const kpis = data.kpis || {};
      createDonut(donutEl.getContext("2d"), kpis);
    }

    // Line chart
    const lineEl = document.getElementById("saude-evolucao-chart");
    if (lineEl && window.Chart) {
      const labels = data.grafico_horas?.horas ?? [];
      const values = data.grafico_horas?.saude_percents ?? [];
      createLine(lineEl.getContext("2d"), labels, values);
    }

    // KPIs values
    if (data.kpis) populateKpisFromMock(data);

    // Servers
    if (Array.isArray(data.servidores)) {
      populateServersFromMock(data.servidores);
    } else if (Array.isArray(data.servers)) {
      // fallback if servers key exists
      populateServersFromMock(data.servers);
    } else {
      populateServersFromMock([]);
    }
  })();
});
