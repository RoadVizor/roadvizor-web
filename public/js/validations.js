// EMPRESA
 

function validatecnpj(ipt){
  ipt.dataset.hasErrors = true;

  const cnpj = String(ipt.value).trim();
  const authMessage = document.getElementById(`${ipt.id}-auth-message`);

  authMessage.innerText = "";

  if (cnpj === "") {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "CNPJ é um campo obrigatório.";
    return;
  }
  else if(cnpj.length!=14){
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "CNPJ deve conter 14 caracteres.";
    return;  
  }



  ipt.dataset.hasErrors = false;
  authMessage.classList.replace("flex", "hidden");
}

function validaterazao(ipt){
  ipt.dataset.hasErrors = true;

  const razao = String(ipt.value).trim();
  const authMessage = document.getElementById(`${ipt.id}-auth-message`);

  authMessage.innerText = "";

  if (razao === "") {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "Razão Social é um campo obrigatório.";
    return;
  }


  ipt.dataset.hasErrors = false;
  authMessage.classList.replace("flex", "hidden");
}


function validatefantasia(ipt) {
  ipt.dataset.hasErrors = true;

  const name = String(ipt.value).trim();
  const authMessage = document.getElementById(`${ipt.id}-auth-message`);

  authMessage.innerText = "";

  if (name === "") {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "Nome Fantasia é um campo obrigatório.";
    return;
  }



  ipt.dataset.hasErrors = false;
  authMessage.classList.replace("flex", "hidden");
}


function validateName(ipt) {
  ipt.dataset.hasErrors = true;

  const name = String(ipt.value).trim();
  const authMessage = document.getElementById(`${ipt.id}-auth-message`);

  authMessage.innerText = "";

  if (name === "") {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "Nome de Usuário é um campo obrigatório.";
    return;
  }



  ipt.dataset.hasErrors = false;
  authMessage.classList.replace("flex", "hidden");
}


function validateEmail(ipt) {
  ipt.dataset.hasErrors = true;

  const email = String(ipt.value).trim();
  const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;

  const authMessage = document.getElementById(`${ipt.id}-auth-message`);
  authMessage.innerText = "";

  if (email === "") {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "Endereço de e-mail é um campo obrigatório.";
    return;
  }

  if (!emailRegex.test(email)) {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "Endereço de e-mail inválido.";
    return;
  }

  ipt.dataset.hasErrors = false;
  authMessage.classList.replace("flex", "hidden");
}

function validatePassword(ipt, checkConfirm = false) {
  ipt.dataset.hasErrors = true;

  const password = String(ipt.value).trim();
  const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^\w\s]).{6,}$/;

  const authMessage = document.getElementById(`${ipt.id}-auth-message`);
  authMessage.innerText = "";

  if (password == "") {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText = "Senha é um campo obrigatório.";
    return;
  }

  if (!passwordRegex.test(password)) {
    authMessage.classList.replace("hidden", "flex");
    authMessage.innerText =
      "Senha deve conter ao menos 6 caracteres, 1 caractere em maiúsculo, 1 caractere em minúsculo e 1 caractere especial";
    return;
  }

  if (checkConfirm) {
    const mainPasswordInput = document.getElementById("ipt-senha");
    if (mainPasswordInput && mainPasswordInput.value !== password) {
      authMessage.classList.replace("hidden", "flex");
      authMessage.innerText = "As senhas não coincidem.";
      return;
    }
  } else {
    const confirmPasswordInput = document.getElementById("ipt-senha-confirmar");
    if (confirmPasswordInput && confirmPasswordInput.value !== "") {
      validatePassword(confirmPasswordInput, true);
    }
  }

  ipt.dataset.hasErrors = false;
  authMessage.classList.replace("flex", "hidden");
}

  function validateModel(ipt){
    ipt.dataset.hasErrors = true;

    const modelo = String(ipt.value).trim();
    const authMessage = document.getElementById(`${ipt.id}-auth-message`);

    authMessage.innerText = "";

    if (modelo === "") {
      authMessage.classList.replace("hidden", "flex");
      authMessage.innerText = "Modelo é um campo obrigatório.";
      return;
    }

    ipt.dataset.hasErrors = false;
    authMessage.classList.replace("flex", "hidden");
    }

    function validateNickname(ipt){
    ipt.dataset.hasErrors = true;

    const apelido = String(ipt.value).trim();
    const authMessage = document.getElementById(`${ipt.id}-auth-message`);

    authMessage.innerText = "";

    if (apelido === "") {
      authMessage.classList.replace("hidden", "flex");
      authMessage.innerText = "Apelido é um campo obrigatório.";
      return;
    }

    ipt.dataset.hasErrors = false;
    authMessage.classList.replace("flex", "hidden");
    }

    function validateAdress(ipt){
    ipt.dataset.hasErrors = true;

    const endereco_mac = String(ipt.value).trim();
    const authMessage = document.getElementById(`${ipt.id}-auth-message`);

    authMessage.innerText = "";

    if (endereco_mac === "") {
      authMessage.classList.replace("hidden", "flex");
      authMessage.innerText = "Endereço MAC é um campo obrigatório.";
      return;
    }


    ipt.dataset.hasErrors = false;
    authMessage.classList.replace("flex", "hidden");
    }


