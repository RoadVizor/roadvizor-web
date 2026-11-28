document.addEventListener("DOMContentLoaded", () => {
  // Configuration
  const POLL_MS = 15 * 60 * 1000; // 15 minutes

  // State
  const state = {
    currentRegion: "todas",
    regions: [],
    serversRaw: [],
    donutChart: null,
    lineChart: null,
    pollId: null,
  };

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
      if (!iso) return "—";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso || "—";
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso || "—";
    }
  }

  // Networking: use backend /api/saude only
  async function fetchRegions() {
    try {
      const res = await fetch("/api/saude?region=indice", { credentials: "include", cache: "no-store" });
      if (res.status === 401) { window.location.href = "/pages/login.html"; return []; }
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = await res.json();
      return json.regioes || [];
    } catch (err) {
      console.warn("Erro ao carregar regioes:", err);
      return [];
    }
  }

  async function fetchRegionData(slug) {
    const url = `/api/saude${slug ? `?region=${encodeURIComponent(slug)}` : ""}`;
    const res = await fetch(url, { credentials: "include", cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/pages/login.html";
      throw new Error("Unauthorized");
    }
    if (res.status === 403) {
      throw new Error("Forbidden");
    }
    if (res.status === 404) {
      throw new Error("NotFound");
    }
    if (!res.ok) {
      throw new Error(`status ${res.status}`);
    }
    return await res.json();
  }

  // Charts
  function destroyChart(chart) {
    try { if (chart) chart.destroy(); } catch {}
  }

  function createDonut(ctx, kpis) {
    const colorGood = getCssVar("--color-chart-2") || "#28c76f";
    const colorWarn = getCssVar("--color-chart-4") || "#e4af44";
    const colorCrit = getCssVar("--destructive-text") || "#ec8179";

    const good = safeNumber(kpis.servidores_saudaveis ?? 0);
    const warn = safeNumber(kpis.servidores_atencao ?? 0);
    const crit = safeNumber(kpis.servidores_criticos ?? 0);

    destroyChart(state.donutChart);
    state.donutChart = new Chart(ctx, {
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
    const dataValues = Array.isArray(values) ? values.map(v => (v === null ? null : Number(v))) : [];

    destroyChart(state.lineChart);
    state.lineChart = new Chart(ctx, {
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
        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + "%" } } },
        maintainAspectRatio: false
      }
    });
  }

  // UI population
  function populateKpis(data) {
    const k = data?.kpis || {};
    document.querySelectorAll("[data-kpi-total]").forEach(el => el.textContent = (k.servidores_totais ?? (data?.servidores ? data.servidores.length : 0)));
    document.querySelectorAll("[data-kpi-saudavel]").forEach(el => el.textContent = k.servidores_saudaveis ?? 0);
    document.querySelectorAll("[data-kpi-atencao]").forEach(el => el.textContent = k.servidores_atencao ?? 0);
    document.querySelectorAll("[data-kpi-critico]").forEach(el => el.textContent = k.servidores_criticos ?? 0);
    document.querySelectorAll("[data-kpi-saudavel-main]").forEach(el => el.textContent = k.servidores_saudaveis ?? 0);
    document.querySelectorAll("[data-kpi-atencao-main]").forEach(el => el.textContent = k.servidores_atencao ?? 0);
    document.querySelectorAll("[data-kpi-critico-main]").forEach(el => el.textContent = k.servidores_criticos ?? 0);

    const pctEl = document.getElementById("saude-percent");
    if (pctEl) pctEl.textContent = (k.saude_percent !== undefined && k.saude_percent !== null) ? `${k.saude_percent}%` : "--";
  }

  function humanStatus(s) {
    if (!s) return "";
    const st = String(s).toLowerCase();
    if (st.includes("saud")) return "Saudável";
    if (st.includes("aten")) return "Atenção";
    if (st.includes("crit")) return "Crítico";
    if (st.includes("offline")) return "Offline";
    return String(s);
  }

  function statusBg(saude) {
    if (!saude) return "transparent";
    const st = String(saude).toLowerCase();
    if (st.includes("saud")) return getCssVar("--success-bg") || "#1e3e2c";
    if (st.includes("aten")) return getCssVar("--warning-bg") || "#40331c";
    if (st.includes("offline")) return getCssVar("--muted-bg") || "#666";
    return getCssVar("--destructive-bg") || "#401e1c";
  }
  function statusColor(saude) {
    if (!saude) return "inherit";
    const st = String(saude).toLowerCase();
    if (st.includes("saud")) return getCssVar("--success-text") || "#88ddae";
    if (st.includes("aten")) return getCssVar("--warning-text") || "#ebbe70";
    if (st.includes("offline")) return getCssVar("--muted-text") || "#ddd";
    return getCssVar("--destructive-text") || "#ec8179";
  }

  function populateServers(list) {
    const tbody = document.querySelector("[data-servers-list]");
    const countEl = document.querySelector("[data-servers-count]");
    if (!tbody) return;
    tbody.innerHTML = "";
    const arr = Array.isArray(list) ? list : [];
    if (arr.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" class="py-4 text-center text-muted">Nenhum servidor encontrado</td>`;
      tbody.appendChild(tr);
      if (countEl) countEl.textContent = "0";
      return;
    }
    arr.forEach(s => {
      const name = s.apelido || s.name || `srv-${s.id ?? ""}`;
      const cpu = s.componentes?.cpu !== undefined && s.componentes?.cpu !== null ? `${s.componentes.cpu}%` : "—";
      const ram = s.componentes?.ram !== undefined && s.componentes?.ram !== null ? `${s.componentes.ram}%` : "—";
      const disco = s.componentes?.disco !== undefined && s.componentes?.disco !== null ? `${s.componentes.disco}%` : "—";
      const rede = s.componentes?.rede !== undefined && s.componentes?.rede !== null ? `${s.componentes.rede} Mbps` : "—";
      const status = s.status ?? "";
      const updated = s.ultima_atualizacao ?? s.updated ?? "";

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
    if (countEl) countEl.textContent = String(arr.length);
  }

  function applyFiltersAndRender() {
    const search = (document.querySelector("[data-sv-search]")?.value || "").trim().toLowerCase();
    const statusFilter = (document.getElementById("servers-filter")?.value || "").trim().toUpperCase();
    let list = Array.isArray(state.serversRaw) ? state.serversRaw.slice() : [];
    if (search) list = list.filter(s => (s.apelido || "").toLowerCase().includes(search));
    if (statusFilter) list = list.filter(s => ((s.status || "").toString().toUpperCase()) === statusFilter);
    populateServers(list);
  }

  // Boot
  (async () => {
    const regionSelect = document.getElementById("saude-region");
    const searchInput = document.querySelector("[data-sv-search]");
    const serversFilter = document.getElementById("servers-filter");
    const refreshBtn = document.getElementById("saude-refresh");
    const donutEl = document.getElementById("saude-donut");
    const lineEl = document.getElementById("saude-evolucao-chart");

    // ensure servers-filter options
    if (serversFilter) {
      serversFilter.innerHTML = `
        <option value="">Todos os servidores</option>
        <option value="SAUDAVEL">Saudável</option>
        <option value="ATENCAO">Atenção</option>
        <option value="CRITICO">Crítico</option>
        <option value="OFFLINE">Offline</option>
      `;
    }

    // load regions
    if (regionSelect) {
      const regions = await fetchRegions();
      state.regions = regions;
      regionSelect.innerHTML = "";
      const first = { slug: "todas", nome: "Todas as regiões" };
      const list = [first, ...regions.filter(r => r.slug !== "todas")];
      list.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.slug || "";
        opt.textContent = r.nome || r.slug;
        regionSelect.appendChild(opt);
      });
      regionSelect.value = "todas";
      state.currentRegion = "todas";
    }

    async function loadRegion(slug) {
      try {
        const data = await fetchRegionData(slug);
        // charts
        if (donutEl && window.Chart) createDonut(donutEl.getContext("2d"), data.kpis || {});
        if (lineEl && window.Chart) createLine(lineEl.getContext("2d"), data.grafico_horas?.horas ?? [], data.grafico_horas?.saude_percents ?? []);
        if (data.kpis) populateKpis(data);
        const servers = Array.isArray(data.servidores) ? data.servidores : (Array.isArray(data.servers) ? data.servers : []);
        state.serversRaw = servers;
        applyFiltersAndRender();
      } catch (err) {
        if (String(err.message).includes("NotFound")) {
          state.serversRaw = [];
          populateServers([]);
        } else if (String(err.message).includes("Forbidden")) {
          if (window.toast) window.toast("Acesso negado à empresa solicitada.", "error");
        } else {
          console.error("Erro ao carregar região:", err);
          if (window.toast) window.toast("Erro ao carregar dados. Tente novamente.", "error");
        }
      }
    }

    // initial load
    await loadRegion(state.currentRegion);

    // handlers
    if (regionSelect) {
      regionSelect.addEventListener("change", async (e) => {
        const slug = e.target.value || "todas";
        state.currentRegion = slug;
        if (searchInput) searchInput.value = "";
        await loadRegion(slug);
      });
    }
    if (searchInput) {
      let debounce;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => applyFiltersAndRender(), 300);
      });
    }
    if (serversFilter) serversFilter.addEventListener("change", () => applyFiltersAndRender());
    if (refreshBtn) refreshBtn.addEventListener("click", async () => { await loadRegion(state.currentRegion); });

    // polling
    function startPolling() {
      if (state.pollId) return;
      state.pollId = setInterval(async () => {
        if (document.visibilityState !== "visible") return;
        await loadRegion(state.currentRegion);
      }, POLL_MS);
    }
    function stopPolling() {
      if (state.pollId) { clearInterval(state.pollId); state.pollId = null; }
    }
    startPolling();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") startPolling(); else stopPolling();
    });
    window.addEventListener("beforeunload", stopPolling);
  })();
});
