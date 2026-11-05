-----------------------------------------------------
-- CRIACAO DO BANCO DE DADOS
-- OBS. VERIFICAR CAMPOS QUE SÃO OBRIGATORIOS E OPCIONAIS
-----------------------------------------------------

CREATE DATABASE ALFA_GYM;

USE ALFA_GYM;

CREATE TABLE planos(
    id_plano INT AUTO_INCREMENT PRIMARY KEY,
    nome_plano VARCHAR(50) NOT NULL UNIQUE,
    periodicidade VARCHAR(20) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,

    -- CAMPOS DE AUDITORIA
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL DEFAULT NULL,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_by INT NULL
);

CREATE TABLE funcionarios(
    id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50) NOT NULL,
    data_nascimento DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    cargo VARCHAR(30) NOT NULL,
    salario DECIMAL(10,2) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,

    -- CAMPOS DE AUDITORIA
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL DEFAULT NULL,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_by INT NULL
);

CREATE TABLE alunos(
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cpf char(11) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    nome_responsavel VARCHAR(100),
    endereco VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,

    -- CAMPOS DE AUDITORIA
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL DEFAULT NULL,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_by INT NULL,

    id_plano INT NOT NULL,
    FOREIGN KEY (id_plano) REFERENCES Planos(id_plano)
);

-----------------------------------------------------
-- CRUD PARA A TABELA PLANOS
-----------------------------------------------------

-- INSERT (inclui created_by com o ID do funcionário logado)
INSERT INTO planos (nome_plano, periodicidade, valor, created_by) 
VALUES ('Mensal', 'Mensal', 100.00, 1);

-- SELECT (apenas registros ativos)
SELECT * FROM planos 
WHERE deleted_at IS NULL;

-- UPDATE (inclui updated_by e garante alteração apenas em registros ativos)
UPDATE planos 
SET nome_plano = 'Trimestral', periodicidade = 'Trimestral', valor = 150.00, updated_by = 1 
WHERE id_plano = 1 AND deleted_at IS NULL;

-- SOFT DELETE (em vez de DELETE FROM)
UPDATE planos 
SET deleted_at = NOW(), deleted_by = 1 
WHERE id_plano = 1 AND deleted_at IS NULL;

-----------------------------------------------------
-- CRUD PARA A TABELA FUNCIONARIOS
-----------------------------------------------------

-- INSERT (no primeiro cadastro, created_by pode ser NULL se for o primeiro funcionário do sistema)
INSERT INTO funcionarios (nome, sobrenome, data_nascimento, email, cpf, cargo, salario, endereco, senha, created_by) 
VALUES ('Pedro', 'Silva', '2006-01-18', 'pedro@gmail.com', '11122233344', 'Gerente', 7000.00, 'Rua Unifae Teste', '123321', NULL);

-- SELECT (apenas funcionários ativos)
SELECT * FROM funcionarios 
WHERE deleted_at IS NULL;

-- UPDATE
UPDATE funcionarios 
SET nome = 'Rafael', sobrenome = 'Teste', data_nascimento = '2002-03-26', email = 'rafa@teste.com', cpf = '44433322211', cargo = 'CEO', salario = 25000.00, endereco = 'Santo Antonio', senha = '333222111', updated_by = 1 
WHERE id_funcionario = 1 AND deleted_at IS NULL;

-- SOFT DELETE
UPDATE funcionarios 
SET deleted_at = NOW(), deleted_by = 1 
WHERE id_funcionario = 1 AND deleted_at IS NULL;

-----------------------------------------------------
-- CRUD PARA A TABELA ALUNOS
-----------------------------------------------------

-- INSERT (ajustado id_plano para um plano existente, ex: 1)
INSERT INTO alunos (nome, sobrenome, email, cpf, data_nascimento, nome_responsavel, endereco, senha, id_plano, created_by) 
VALUES ('Matheus', 'teste', 'teste@gmail.com', '11122244455', '2002-12-09', 'Rafael', 'teste', '112233', 1, 1);

-- SELECT (apenas alunos ativos)
SELECT * FROM alunos 
WHERE deleted_at IS NULL;

-- UPDATE
UPDATE alunos 
SET nome = 'Pedro', sobrenome = 'Silva', email = 'teste@gmail.com', cpf = '33322244422', data_nascimento = '2006-01-18', nome_responsavel = 'Joao', endereco = 'teste', senha = '6665544', updated_by = 1 
WHERE id_aluno = 1 AND deleted_at IS NULL;

-- SOFT DELETE
UPDATE alunos 
SET deleted_at = NOW(), deleted_by = 1 
WHERE id_aluno = 1 AND deleted_at IS NULL;
