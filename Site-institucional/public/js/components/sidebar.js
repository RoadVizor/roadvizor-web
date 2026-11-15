window.onload = sidebarLinks

function injetarEstilosSidebar() {
  if (document.getElementById("rv-sidebar-style")) return
  const style = document.createElement("style")
  style.id = "rv-sidebar-style"
  style.textContent = `
    :root { --rv-sidebar-w: 16rem; --rv-topbar-h: 4rem; }

    /* Mobile: espaço para a topbar fixa */
    body { padding-top: var(--rv-topbar-h); }

    .rv-topbar {
      position: fixed; top: 0; left: 0; right: 0;
      height: var(--rv-topbar-h);
      z-index: 40;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1rem;
    }
    .rv-topbar img { width: 2.5rem; height: 2.5rem; }
    .rv-burger, .rv-close {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2.75rem; height: 2.75rem;
      font-size: 1.5rem; border-radius: .75rem;
      background: transparent; border: 0; color: inherit; cursor: pointer;
      transition: background-color .2s;
    }
    .rv-burger:hover, .rv-close:hover { background: rgba(255,255,255,.08); }

    .rv-overlay {
      position: fixed; inset: 0; z-index: 45;
      background: rgba(0,0,0,.6);
      backdrop-filter: blur(4px);
      opacity: 0; pointer-events: none;
      transition: opacity .3s ease;
    }
    .rv-overlay.open { opacity: 1; pointer-events: auto; }

    .rv-panel {
      position: fixed; top: 0; left: 0; z-index: 50;
      width: 18rem; max-width: 85vw; height: 100dvh;
      display: flex; flex-direction: column;
      padding: 1.5rem 1.25rem;
      overflow-y: auto;
      transform: translateX(-100%);
      transition: transform .3s ease-out;
      box-shadow: 0 0 40px rgba(0,0,0,.5);
    }
    .rv-panel.open { transform: translateX(0); }

    .rv-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2rem;
    }
    .rv-panel-header img { height: 2rem; width: auto; }

    .rv-section-title {
      font-size: .75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .08em;
      opacity: .6; padding: 0 .75rem; margin-bottom: .75rem;
    }
    .rv-list { display: flex; flex-direction: column; gap: .5rem; list-style: none; margin: 0; padding: 0; }
    .rv-list a {
      display: flex; align-items: center; justify-content: space-between; gap: .75rem;
      padding: .75rem 1rem; border-radius: .75rem;
      text-decoration: none;
      transition: background-color .2s;
    }
    .rv-list a:hover { background: rgba(255,255,255,.06); }

    /* Desktop: sidebar fixa na lateral, conteúdo ganha margem */
    @media (min-width: 1024px) {
      body { padding-top: 0; padding-left: var(--rv-sidebar-w); }
      .rv-topbar, .rv-overlay, .rv-close { display: none; }
      .rv-panel {
        width: var(--rv-sidebar-w); max-width: none;
        transform: none; transition: none;
        padding: 2.5rem 1.5rem;
        border-radius: 0 .75rem .75rem 0;
        box-shadow: none;
      }
      .rv-panel-header { justify-content: center; margin-bottom: 3rem; }
      .rv-panel-header img { height: auto; }
    }
  `
  document.head.appendChild(style)
}

function sidebar(content) {
  injetarEstilosSidebar()

  document.querySelectorAll(".rv-topbar, .rv-overlay, .rv-panel").forEach((el) => el.remove())
  const antigo = document.getElementById("sidebar_container")
  if (antigo) { antigo.innerHTML = ""; antigo.style.display = "none" }

  const wrapper = document.createElement("div")
  wrapper.innerHTML = `
    <!-- Topbar | só no mobile -->
    <header class="rv-topbar bg-surface border-b border-border">
      <img src="../../assets/svgs/icon.svg" alt="RoadVizor Ícone" />
      <button id="sidebar_toggle" class="rv-burger" type="button"
              aria-label="Abrir menu" aria-controls="sidebar_panel" aria-expanded="false">
        <i class="ph ph-list"></i>
      </button>
    </header>

    <!-- Overlay | só no mobile -->
    <div id="sidebar_overlay" class="rv-overlay"></div>

    <!-- Sidebar -->
    <aside id="sidebar_panel" class="rv-panel bg-surface">
      <div class="rv-panel-header">
        <img src="../../assets/svgs/logo-dark.svg" alt="RoadVizor Logo" />
        <button id="sidebar_close" class="rv-close" type="button" aria-label="Fechar menu">
          <i class="ph ph-x"></i>
        </button>
      </div>

      <div style="flex:1">
        <p class="rv-section-title">Seções</p>
        <nav><ul class="rv-list">${content}</ul></nav>
      </div>

      <div style="padding-top:1.5rem">
        <button
          onclick="sair()"
          class="cursor-pointer flex items-center justify-center py-2 rounded-md space-x-1 hover:space-x-4 w-full border border-border hover:border-destructive-foreground hover:text-destructive-foreground text-muted hover:bg-destructive transition-all"
        >
          <span>Sair</span><i class="ph ph-sign-out"></i>
        </button>
      </div>
    </aside>`

  while (wrapper.firstChild) document.body.prepend(wrapper.lastChild)

  const atual = document.getElementById(document.title)
  if (atual) atual.classList.add("atual")

  sidebarMobile()
}

function sidebarMobile() {
  const panel = document.getElementById("sidebar_panel")
  const overlay = document.getElementById("sidebar_overlay")
  const toggle = document.getElementById("sidebar_toggle")
  const closeBtn = document.getElementById("sidebar_close")
  const desktop = window.matchMedia("(min-width: 1024px)")

  function abrir() {
    panel.classList.add("open")
    overlay.classList.add("open")
    toggle.setAttribute("aria-expanded", "true")
    document.body.style.overflow = "hidden"
  }

  function fechar() {
    panel.classList.remove("open")
    overlay.classList.remove("open")
    toggle.setAttribute("aria-expanded", "false")
    document.body.style.overflow = ""
  }

  toggle.addEventListener("click", abrir)
  closeBtn.addEventListener("click", fechar)
  overlay.addEventListener("click", fechar)
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar() })
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", fechar))
  desktop.addEventListener("change", (e) => { if (e.matches) fechar() })
}

function sidebarLinks() {
  const user = JSON.parse(sessionStorage.getItem("usuario"))
  const itens = niveis[user.nivel_acesso]["dash"]
  let html = ""

  for (const item of itens) {
    html += `
      <li id="${item.id}">
        <a href="${item.url}" class="sideitem">
          <span>${item.title}</span>
          <i class="${item.icon}"></i>
        </a>
      </li>`
  }

  sidebar(html)
}