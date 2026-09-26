
function getToken() {
  return sessionStorage.getItem("TOKEN") || localStorage.getItem("TOKEN");
}

async function cadastrar(event) {
  event.preventDefault();

  const nome = String(document.getElementById("ipt-nome").value).trim();
  const email = String(document.getElementById("ipt-email").value).trim();
  const senha = String(document.getElementById("ipt-senha").value).trim();

  try {
    const response = await fetch("/api/usuarios/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    listarMembros();

    // todo: melhorar a mensagem e possívelmente atualizar a página para
    // refletir atualização da UI
    toast({
      title: "Cadastro Efetuado!",
      message: "O usuário %USER% foi adicionado à equipe.",
      variant: "success",
    });
  } catch (error) {
    console.log(error);
    toast({
      title: "Uh oh...",
      message: error.message,
      variant: "destructive",
    });
  }
}

async function listarMembros() {
  try {
    const response = await fetch("http://localhost:3333/api/usuarios/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar membros.");
    }

    renderizarMembros(data.result);
  } catch (error) {
    console.error("Erro ao listar membros:", error);
    toast({
      title: "Erro",
      message: error.message || "Não foi possível carregar os membros.",
      variant: "destructive"
    });
  }
}

function renderizarMembros(membros) {
  const container = document.getElementById("lista-membros");
  container.innerHTML = "";

  if (!membros || membros.length === 0) {
    container.innerHTML = `<p class="text-muted text-center w-full">Nenhum membro cadastrado.</p>`;
    return;
  }

  membros.forEach((membro) => {
    const card = document.createElement("div");
    card.className = "bg-surface border border-border p-5 rounded-xl flex items-center justify-between shadow-sm";
    card.dataset.id = membro.id_usuario;

    card.innerHTML = `
      <div class="flex flex-col gap-1 w-full">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-bold text-foreground">${membro.nome}</h3>
        
        <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-muted/20 border border-muted/30 text-muted-foreground">
          <i class="ph ph-envelope text-sm"></i>
          ${membro.email}
        </span>
      </div>
      <div class="w-fit flex justify-center items-center gap-1">
        <i class="ph ph-address-book text-white"></i>
        <p class="text-sm text-muted font-mono">${membro.nivel_acesso == 0 ? "Dev" : membro.nivel_acesso == 1 ? "Administrador" : "Comum"}</p>
      </div>
    </div>
      <div class="flex items-center gap-3">
        <button class="btn-editar text-blue-500 hover:text-blue-400 p-1 transition-colors cursor-pointer" title="Editar Membro">
          <i class="ph ph-pencil text-xl"></i>
        </button>
        <button class="btn-excluir text-red-500 hover:text-red-400 p-1 transition-colors cursor-pointer" title="Excluir Membro">
          <i class="ph ph-x text-xl"></i>
        </button>
      </div>
    `;

    card.querySelector(".btn-editar").addEventListener("click", () => iniciarEdicao(membro));
    card.querySelector(".btn-excluir").addEventListener("click", () => excluirMembro(membro.id_usuario));

    container.appendChild(card);
  });
}

let idEmEdicao = null;

function iniciarEdicao(membro) {
  idEmEdicao = membro.id_usuario;

  document.getElementById("ipt-nome").value = membro.nome;
  document.getElementById("ipt-email").value = membro.email;

  const submitBtn = document.getElementById("register-submit");
  submitBtn.querySelector("span").textContent = "Salvar Alterações";
  submitBtn.disabled = false;
  submitBtn.classList.replace("bg-disabled", "bg-accent");

  document.getElementById("register-form").scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicao() {
  idEmEdicao = null;
  document.getElementById("register-form").reset();
  document.getElementById("register-submit").querySelector("span").textContent = "Cadastrar Membro";
}

async function excluirMembro(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este membro?");
  if (!confirmar) return;

  try {
    const response = await fetch(`http://localhost:3333/api/usuarios/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao excluir membro.");
    }

    toast({
      title: "Sucesso!",
      message: "Membro removido com sucesso.",
      variant: "success"
    });

    listarMembros(); 
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

document.addEventListener("DOMContentLoaded", listarMembros);

