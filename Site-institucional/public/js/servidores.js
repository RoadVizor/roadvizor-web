function getToken() {
  return sessionStorage.getItem("TOKEN") || localStorage.getItem("TOKEN");
}
async function cadastrar(event) {
  event.preventDefault();

  const modelo = String(document.getElementById("ipt-modelo")?.value || "").trim();
  const apelido = String(document.getElementById("ipt-apelido")?.value || "").trim();
  const endereco_mac = String(document.getElementById("ipt-endereco")?.value || "").trim();

  const url = idEmEdicao
    ? `http://localhost:3333/api/servidor/${idEmEdicao}`
    : "http://localhost:3333/api/servidor/cadastrar";
  const method = idEmEdicao ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        endereco_id: 1,
        endereco_mac,
        apelido,
        modelo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro na requisição (${response.status})`);
    }

    toast({
      title: "Sucesso!",
      message: idEmEdicao ? "Servidor atualizado com sucesso." : "Servidor cadastrado com sucesso.",
      variant: "success"
    });

    cancelarEdicao();
    listarServidores();

  } catch (error) {
    console.error("Erro:", error);
    toast({
      title: idEmEdicao ? "Falha ao Editar" : "Falha no Cadastro",
      message: error.message || "Ocorreu um erro.",
      variant: "destructive"
    });
  }
}

// === LISTAR SERVIDORES (GET) === //
async function listarServidores() {
  try {
    const response = await fetch("http://localhost:3333/api/servidor/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar servidores.");
    }

    renderizarServidores(data.result);
  } catch (error) {
    console.error("Erro ao listar servidores:", error);
    toast({
      title: "Erro",
      message: error.message || "Não foi possível carregar os servidores.",
      variant: "destructive"
    });
  }
}

// === RENDERIZAR CARDS === //
function renderizarServidores(servidores) {
  const container = document.getElementById("lista-servidores");
  container.innerHTML = "";

  if (!servidores || servidores.length === 0) {
    container.innerHTML = `<p class="text-muted text-center w-full">Nenhum servidor cadastrado.</p>`;
    return;
  }

  servidores.forEach((servidor) => {
    const card = document.createElement("div");
    card.className = "bg-surface border border-border p-5 rounded-xl flex items-center justify-between shadow-sm";
    card.dataset.id = servidor.id_servidor;

    card.innerHTML = `
      <div class="flex flex-col gap-1 w-full">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-bold text-foreground">${servidor.apelido}</h3>
        
        <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-muted/20 border border-muted/30 text-muted-foreground">
          <i class="ph ph-desktop-tower text-sm"></i>
          ${servidor.endereco_mac}
        </span>
      </div>

      <p class="text-sm text-muted font-mono">${servidor.modelo}</p>
    </div>
      <div class="flex items-center gap-3">
        <button class="btn-editar text-blue-500 hover:text-blue-400 p-1 transition-colors cursor-pointer" title="Editar servidor">
          <i class="ph ph-pencil text-xl"></i>
        </button>
        <button class="btn-excluir text-red-500 hover:text-red-400 p-1 transition-colors cursor-pointer" title="Excluir servidor">
          <i class="ph ph-x text-xl"></i>
        </button>
      </div>
    `;

    card.querySelector(".btn-editar").addEventListener("click", () => iniciarEdicao(servidor));
    card.querySelector(".btn-excluir").addEventListener("click", () => excluirServidor(servidor.id_servidor));

    container.appendChild(card);
  });
}

// === EDITAR === //
let idEmEdicao = null;

function iniciarEdicao(servidor) {
  idEmEdicao = servidor.id_servidor;

  document.getElementById("ipt-modelo").value = servidor.modelo;
  document.getElementById("ipt-apelido").value = servidor.apelido;
  document.getElementById("ipt-endereco").value = servidor.endereco_mac;

  const submitBtn = document.getElementById("register-submit");
  submitBtn.querySelector("span").textContent = "Salvar Alterações";
  submitBtn.disabled = false;
  submitBtn.classList.replace("bg-disabled", "bg-accent");

  document.getElementById("cadastro-servidor").scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicao() {
  idEmEdicao = null;
  
  document.getElementById("cadastro-servidor").reset();
  document.getElementById("register-submit").querySelector("span").textContent = "Cadastrar Servidor";
}

// === EXCLUIR === //
async function excluirServidor(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este servidor?");
  if (!confirmar) return;

  try {
    const response = await fetch(`http://localhost:3333/api/servidor/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao excluir servidor.");
    }

    toast({
      title: "Sucesso!",
      message: "Servidor removido com sucesso.",
      variant: "success"
    });

    listarServidores(); 
  } catch (error) {
    console.error("Erro ao excluir:", error);
    toast({
      title: "Falha ao Excluir",
      message: error.message || "Erro ao conectar com o servidor.",
      variant: "destructive"
    });
  }
}

async function sair() {
  try {
    const response = await fetch("/api/usuarios/sair", {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(response.message);
    }

    storage.clear();
    toast({
      title: data.message,
      variant: "warn",
    });

    // redireciona usuário após 1s
    new Promise((resolve) => {
      setTimeout(() => {
        window.location.href = "../login.html";
        resolve();
      }, 1000);
    });
  } catch (error) {
    toast({
      title: "Erro ao Sair",
      message: error,
      variant: "destructive",
    });
  }
}

document.addEventListener("DOMContentLoaded", listarServidores);