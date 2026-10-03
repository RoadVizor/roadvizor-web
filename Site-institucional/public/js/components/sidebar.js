window.onload = sidebarLinks
function sidebar(content){
    console.log(document.title)
    sidebar_container.innerHTML = `    <div
      class="bg-surface rounded-r-xl max-w-52 h-dvh flex flex-col justify-center py-6 lg:py-12 px-2 lg:px-4"
    >
      <!-- Sidebar | Header -->
      <div class="flex flex-col space-y-12 items-center justify-center">
        <img
          src="../../assets/svgs/logo-dark.svg"
          alt="RoadVizor Logo"
          class="hidden md:block"
        />
        <img
          src="../../assets/svgs/icon.svg"
          alt="RoadVizor Ícone"
          class="w-12 h-12 md:hidden"
        />
      </div>
      <!-- Sidebar | Content -->
      <div class="flex flex-col h-full">
        <p class="font-bold mb-2">Seções</p>
        <nav class="flex flex-col">
          <ul class="flex flex-col gap-4">
            ${content}
          </ul>
        </nav>
      </div>
      <!-- Sidebar | Footer -->
      <div>
        <button
          onclick="sair()"
          class="cursor-pointer flex items-center justify-center py-1 rounded-md space-x-1 hover:space-x-4 w-full border border-border hover:border-destructive-foreground hover:text-destructive-foreground text-muted hover:bg-destructive transition-all"
        >
          <span>Sair</span><i class="ph ph-sign-out"></i>
        </button>
      </div>
    </div>`


    const nome = document.title
    let elemento = document.getElementById(nome)

    
    
    elemento.classList.add("atual");
}

function sidebarLinks(){
  let user = JSON.parse(sessionStorage.getItem("usuario"));
  let html = '';

  for(let i = 0; i < niveis[user.nivel_acesso]["dash"].length; i++){
    let item = niveis[user.nivel_acesso]["dash"][i];
    
    html += `
        <li id="${item.id}" class="w-full">
          <a href="${item.url}" class="sideitem text-center">
            <span>${item.title}</span>
            <i class="${item.icon}"></i>
          </a>
        </li>
    `
  }

  sidebar(html);
}