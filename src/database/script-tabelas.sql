CREATE DATABASE IF NOT EXISTS roadvizor;
USE roadvizor;

-- OBS: muitas das decisões tomadas ao criar esta tabela foram motivadas com base na API viaCEP
-- disponível em: https://viacep.com.br.
-- e no entendimento de que ambos os endereços de CCOs e Pedágios poderão ser guardados nesta tabela.
CREATE TABLE IF NOT EXISTS endereco(
	id_endereco INT PRIMARY KEY AUTO_INCREMENT,
    
    -- campos úteis para o viaCEP
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(120) NULL,      	-- ex: CCO: "Rua XPTO" | Pórtico: "Rodovia Presidente Dutra"
    bairro VARCHAR(60) NULL,           	-- ex: CCO: "Bela Vista" | Pórtico: ""
    localidade VARCHAR(60) NOT NULL,   	-- o mesmo que 'cidade'
    uf CHAR(2) NOT NULL,				-- pode ser convertido em ENUM ou tabela depois
    
    -- campos úteis no contexto Empresa/CCO
    numero VARCHAR(20) NULL,
    complemento VARCHAR(60) NULL,
    
    -- campos úteis no contexto Pórtico/Servidor
    km VARCHAR(20) NULL,
    sentido VARCHAR(30) NULL 
);

CREATE TABLE IF NOT EXISTS empresa(
	id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    
    cnpj CHAR(14) NOT NULL UNIQUE,
    razao_social VARCHAR(120) NOT NULL,
    nome_fantasia VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,		-- campo usado para contato
    
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario(
	id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(60) NOT NULL,
    nivel_acesso TINYINT NOT NULL DEFAULT 1,	-- assumindo: 1 - usuário comum | 0 - administrador
    
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
	CONSTRAINT fk_usuario_empresa FOREIGN KEY (empresa_id)
		REFERENCES empresa(id_empresa)
);

CREATE TABLE IF NOT EXISTS cco(
	id_cco INT NOT NULL AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    endereco_id INT NOT NULL UNIQUE,
    
    apelido VARCHAR(60) NOT NULL,
    referencia VARCHAR(150) NULL,	-- algo como 'complemento' de endereço 
    
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_cco PRIMARY KEY (id_cco, empresa_id),
	CONSTRAINT fk_cco_empresa FOREIGN KEY (empresa_id)
		REFERENCES empresa(id_empresa),
	CONSTRAINT fk_cco_endereco FOREIGN KEY (endereco_id)
		REFERENCES endereco(id_endereco)
);

CREATE TABLE IF NOT EXISTS servidor(
	id_servidor INT NOT NULL AUTO_INCREMENT,
    cco_id INT NOT NULL,
    empresa_id INT NOT NULL,
    endereco_id INT NOT NULL UNIQUE,
    
    endereco_mac CHAR(12) NOT NULL UNIQUE,	-- ex: 11:22:33:44:55
    apelido VARCHAR(60) NOT NULL,			-- ex: hostname ou outro definido pelo usuario
    modelo VARCHAR(60) NOT NULL,			-- ex: 'PADR-S501-I980' 
	
    -- cpu_fisica TINYINT UNSIGNED NOT NULL,	-- qtd de CPUs físicas
    -- cpu_logica TINYINT UNSIGNED NOT NULL,	-- qtd de CPUs lógicas
    -- ram_mb INT UNSIGNED NOT NULL,			-- qtd de mem. RAM em MB
    -- disco_mb INT UNSIGNED NOT NULL,			-- qtd de disco em MB
        
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_servidor PRIMARY KEY (id_servidor, cco_id, empresa_id),
	CONSTRAINT fk_servidor_cco FOREIGN KEY (cco_id, empresa_id)
		REFERENCES cco(id_cco, empresa_id),
	CONSTRAINT fk_servidor_endereco FOREIGN KEY (endereco_id)
		REFERENCES endereco(id_endereco)
);

CREATE TABLE IF NOT EXISTS codigo_ativacao(
	id_codigo_ativacao INT NOT NULL AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    
    codigo CHAR(10) NOT NULL UNIQUE,
    
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    desativado_em DATETIME NULL,
    
    CONSTRAINT pk_codigo_ativacao PRIMARY KEY (id_codigo_ativacao, empresa_id),
	CONSTRAINT fk_scodigo_ativacao_empresa FOREIGN KEY (empresa_id)
		REFERENCES empresa(id_empresa)
);
