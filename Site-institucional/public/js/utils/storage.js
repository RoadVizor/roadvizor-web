// Objeto de funções utilitárias para manipular o sessionStorage
const storage = {
  // adicione um valor ao sessionStorage passando chave e valor
  set: (key, value) => {
    const stringifiedValue = JSON.stringify(value);
    sessionStorage.setItem(key, stringifiedValue);
  },
  // busque um valor pelo nome da chave
  get: (key) => {
    const result = sessionStorage.getItem(key);
    return result ? JSON.parse(result) : null;
  },
  //   remova um valor pelo nome da chave
  remove: (key) => {
    sessionStorage.removeItem(key);
  },
  // limpe o sessionStorage por inteiro
  clear: () => {
    sessionStorage.clear();
  },
};
