/*
AVISO: certifique-se que a página que importar este arquivo (auth.js), também
está importando os arquivos "storage.js" e "toast.js", presentes em: /public/js/utils/
*/

async function entrar(event) {
  event.preventDefault();

  const email = String(document.getElementById("ipt-email").value).trim();
  const senha = String(document.getElementById("ipt-senha").value).trim();

  try {
    const response = await fetch("/api/usuarios/autenticar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        senha: senha,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    storage.set("usuario", data.usuario);
    toast({
      title: "Login Efetuado!",
      message: "Redirecionando...",
      variant: "success",
    });

    // redireciona usuário após 1s
    new Promise((resolve) => {
      setTimeout(() => {
        window.location = "../pages/dashboard/home.html";
        resolve();
      }, 1000);
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

async function cadastrar(event) {
  event.preventDefault();

  const nome = String(document.getElementById("ipt-nome").value).trim();
  const email = String(document.getElementById("ipt-email").value).trim();
  const senha = String(document.getElementById("ipt-senha").value).trim();
  const cargo = String(document.getElementById("ipt-cargo").value).trim();

  try {
    const response = await fetch("/api/usuarios/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: nome,
        email: email,
        senha: senha,
        cargo: cargo,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

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

async function sair() {
  try {
    // limpa todo o session storage
    // todo: lembrar de limpar os Cookies também
    storage.clear();

    toast({
      title: "Log out",
      message: "Redirecionando...",
    });

    // redireciona usuário após 1s
    new Promise((resolve) => {
      setTimeout(() => {
        window.location = "../index.html";
        resolve();
      }, 1000);
    });
  } catch (error) {
    console.log(error);
    toast({
      title: "Erro ao Sair",
      message: error,
      variant: "destructive",
    });
  }
}
