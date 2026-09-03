window.onload = sidebar
function sidebar(){
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
            <li id="RoadVizor | Home" class="w-full">
              <a href="./home.html" class="sideitem">
                <span>Home</span>
                <i class="ph ph-gauge text-2xl"></i>
              </a>
            </li>
            <li id="RoadVizor | Equipe" class="w-full">
              <a href="./equipe.html" class="sideitem text-center">
                <span>Equipe</span>
                <i class="ph ph-users text-2xl"></i>
              </a>
            </li>
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