CREATE DATABASE roadvizor;

USE roadvizor;

CREATE TABLE empresa(
	id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    cnpj CHAR(14) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL
);

CREATE TABLE servidor(
	id_servidor INT PRIMARY KEY AUTO_INCREMENT,
    id_empresa INT NOT NULL,
    mac CHAR(12) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    CONSTRAINT fk_servidor_empresa FOREIGN KEY (id_empresa)
		REFERENCES empresa(id_empresa)
);

CREATE TABLE dados_coletados(
	id_empresa INT,
    id_servidor INT,
    data_cap DATETIME DEFAULT CURRENT_TIMESTAMP,
    cpu_percent DECIMAL(3,1) NOT NULL,
    ram_percent DECIMAL(3,1) NOT NULL,
    disco_percent DECIMAL(3,1) NOT NULL,
    rede_percent DECIMAL(3,1) NOT NULL,
    CONSTRAINT dados_pk PRIMARY KEY(id_empresa,id_servidor,data_cap),
    CONSTRAINT fk_dados_empresa FOREIGN KEY (id_empresa) 
        REFERENCES empresa(id_empresa),
	CONSTRAINT fk_dados_servidor FOREIGN KEY (id_servidor)
		REFERENCES servidor(id_servidor)
);

CREATE TABLE usuario (
	id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_empresa INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(60) NOT NULL,
    permissao TINYINT NOT NULL,
    CONSTRAINT fk_usuario_empresa FOREIGN KEY (id_empresa) 
        REFERENCES empresa(id_empresa) 
);

CREATE TABLE log_usuario(
	id_log INT,
    id_usuario INT,
    acao VARCHAR(60) NOT NULL,
    data_log DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT log_pk PRIMARY KEY(id_log,id_usuario),
    CONSTRAINT fk_log_usuario FOREIGN KEY (id_usuario)
		REFERENCES usuario(id_usuario)
);