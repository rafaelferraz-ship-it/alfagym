const express = require('express');
const router = express.Router();
const autenticacao = require('@/middlewares/autenticacao');
const bcrypt = require('bcrypt');
const pool = require('@/database/connection');
const validarCPF = require('@/utils/validarCpf');

router.get('/novo', (req, res) => {
  res.render('funcionarios/novoFuncionario');
});

// =======================================================
// ROTA PARA LISTAGEM DE FUNCIONÁRIOS (COM PAGINAÇÃO)
// Exemplo de acesso: http://localhost:3000/funcionarios?page=1
// =======================================================
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  // O 'OFFSET' é a quantidade de itens que o banco deve "pular".
  // Ex: Se estamos na página 1 -> (1 - 1) * 10 = Pula 0 itens (Pega do 1 ao 10).
  const offset = (page - 1) * limit;

  pool.query(
    'SELECT COUNT (*) AS total FROM funcionarios WHERE deleted_at IS NULL',
    (err, resultCount) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Erro ao calcular o total de funcionários');
      }
      // Pegamos o número que o banco devolveu
      const totalElementos = resultCount[0].total;
      // Calculamos o total de páginas - Math.ceil arredonda para cima
      const totalPaginas = Math.ceil(totalElementos / limit);

      pool.query(
        'SELECT * FROM funcionarios WHERE deleted_at IS NULL LIMIT ? OFFSET ?',
        [limit, offset],
        (err, resultados) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .send('Erro ao buscar a lista de funcionários');
          }
          //Retornar as variáveis para o Front-end - Retornando Página Atual, Total de Páginas e Elementos da Página.
          res.render('funcionarios/listagemFuncionarios', {
            paginaAtual: page,
            totalPaginas: totalPaginas,
            elemetosDaPagina: resultados,
          });
        }
      );
    }
  );
});

// Cadastrar um usuário
router.post('/', async (req, res) => {
  try {
    const cpf = req.body.cpf;

    // 1. Validar o CPF
    if (!validarCPF(cpf || '')) {
      return res.status(400).send('CPF inválido!');
    }

    // 2. Verificar se o CPF já existe
    const [funcionarios] = await pool
      .promise()
      .query('SELECT cpf FROM funcionarios WHERE cpf = ?', [
        cpf.replace(/\D/g, ''),
      ]);

    if (funcionarios.length > 0) {
      return res.status(400).send('Este CPF já está cadastrado!');
    }

    // 3. Continuar o cadastro
    const senha = await bcrypt.hash(req.body.senha, 10);
    const email = req.body.email;
    const nome = req.body.nome;
    const sobrenome = req.body.sobrenome;
    const data_nascimento = req.body.data_nascimento;
    const cargo = req.body.cargo;
    const salario = req.body.salario;
    const endereco = req.body.endereco;

    const sql = `
            INSERT INTO funcionarios
            (nome, sobrenome, data_nascimento, email, cpf,
             cargo, salario, endereco, senha)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    await pool
      .promise()
      .query(sql, [
        nome,
        sobrenome,
        data_nascimento,
        email,
        cpf.replace(/\D/g, ''),
        cargo,
        salario,
        endereco,
        senha,
      ]);

    res.redirect('/funcionarios');
  } catch (err) {
    console.log(err);
    res.status(500).send('Erro ao cadastrar usuário');
  }
});

router.get('/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [funcionarios] = await pool
      .promise()
      .query(
        'SELECT * FROM funcionarios WHERE id_funcionario = ? AND deleted_at IS NULL',
        [id]
      );

    if (funcionarios.length === 0) {
      return res.status(404).send('Funcionário não encontrado ou inativo.');
    }

    res.render('funcionarios/editarFuncionario', {
      funcionario: funcionarios[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar dados do funcionário.');
  }
});

// Atualizar um funcionário
router.post('/editar/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const cpf = req.body.cpf;

    // Validar o CPF
    if (!validarCPF(cpf || '')) {
      return res.status(400).send('CPF inválido!');
    }

    // Verifica se o CPF já é de OUTRO funcionário
    const [funcionarios] = await pool
      .promise()
      .query(
        'SELECT cpf FROM funcionarios WHERE cpf = ? AND id_funcionario <> ?',
        [cpf.replace(/\D/g, ''), id]
      );

    if (funcionarios.length > 0) {
      return res.status(400).send('Este CPF já está cadastrado!');
    }

    // Verificar se a senha foi preenchida
    if (!req.body.senha) {
      return res.status(400).send('Informe a nova senha!');
    }

    // Pegar os novos dados
    const senha = await bcrypt.hash(req.body.senha, 10);
    const email = req.body.email;
    const nome = req.body.nome;
    const sobrenome = req.body.sobrenome;
    const data_nascimento = req.body.data_nascimento;
    const cargo = req.body.cargo;
    const salario = req.body.salario;
    const endereco = req.body.endereco;

    // Atualizar (o banco atualiza o updated_at)
    const sql = `
      UPDATE funcionarios
      SET nome = ?,
          sobrenome = ?,
          data_nascimento = ?,
          email = ?,
          cpf = ?,
          cargo = ?,
          salario = ?,
          endereco = ?,
          senha = ?
      WHERE id_funcionario = ?
      AND deleted_at IS NULL
    `;

    const [resultado] = await pool
      .promise()
      .query(sql, [
        nome,
        sobrenome,
        data_nascimento,
        email,
        cpf.replace(/\D/g, ''),
        cargo,
        salario,
        endereco,
        senha,
        id,
      ]);

    if (resultado.affectedRows === 0) {
      return res
        .status(404)
        .send('Funcionário não encontrado ou está inativo.');
    }

    res.redirect('/funcionarios?page=1');
  } catch (err) {
    console.log(err);
    res.status(500).send('Erro ao atualizar funcionário');
  }
});

// Exclusão lógica de funcionário
router.post('/deletar/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const sql = `
      UPDATE funcionarios
      SET deleted_at = NOW(),
          deleted_by = 1
      WHERE id_funcionario = ?
      AND deleted_at IS NULL
    `;

    const [resultado] = await pool.promise().query(sql, [id]);

    if (resultado.affectedRows === 0) {
      return res
        .status(404)
        .send('Funcionário não encontrado ou já está inativo.');
    }

    res.redirect('/funcionarios?page=1');
  } catch (err) {
    console.log(err);
    res.status(500).send('Erro ao excluir funcionário');
  }
});

module.exports = router;
