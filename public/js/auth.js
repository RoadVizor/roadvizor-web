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

async function cadastrarEmpresa(event) {
  event.preventDefault();

  const cnpj = String(document.getElementById("ipt-cnpj").value).trim();
  const razao = String(document.getElementById("ipt-razao").value).trim();
  const fantasia = String(document.getElementById("ipt-fantasia").value).trim();
  const email = String(document.getElementById("ipt-email").value).trim();
  const senha = String(document.getElementById("ipt-senha").value).trim();


  try {
    const response = await fetch("/api/empresas/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cnpj: cnpj,
        razao_social: razao,
        nome_fantasia: fantasia,
        email: email,
        senha: senha,
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
      message: "Cadastro efetuado com sucesso.",
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
