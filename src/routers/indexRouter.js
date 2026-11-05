const express = require('express');
const autenticacao = require('@/middlewares/autenticacao');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('@/database/connection');

router.get('/dashboard', autenticacao, async (req, res) => {
  try {
    const [planosRows] = await pool
      .promise()
      .query('SELECT COUNT(*) AS total FROM planos');
    const [funcRows] = await pool
      .promise()
      .query('SELECT COUNT(*) AS total FROM funcionarios');

    const totalPlanos = planosRows[0]?.total || 0;
    const totalFuncionarios = funcRows[0]?.total || 0;

    res.render('dashboard', {
      metricas: {
        totalPlanos,
        totalFuncionarios,
      },
    });
  } catch (erro) {
    res.status(500).send('Erro ao carregar os dados do painel.');
  }
});

module.exports = router;

router.get('/', (req, res) => {
  if (req.session && req.session.usuarioLogado) {
    return res.redirect('/dashboard');
  }

  res.render('index');
});

// Cadastrar um usuário de teste
router.get('/senhaFalsa', async (req, res) => {
  try {
    const senhaFalsa = await bcrypt.hash('123456', 10);

    pool.query(
      'INSERT INTO funcionarios (nome , sobrenome, data_nascimento, email, cpf, cargo, salario,  endereco,  senha) VALUES ("Pedro", "Silva", "2006-01-18", "pedro@gmail.com", "11122233344", "Gerente", 7000.00, "Rua Unifae Teste", ?);',
      [senhaFalsa],
      (err, resultado) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Erro ao cadastrar usuário');
        }

        console.log('Usuário cadastrado com sucesso!');
        res.send('Usuário cadastrado com sucesso!');
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send('Erro ao gerar a senha');
  }
});

// Login
router.post('/login', (req, res) => {
  const cpf = req.body.cpf;
  const senha = req.body.senha;

  pool.query(
    'SELECT * FROM funcionarios WHERE cpf = ?',
    [cpf],
    async (err, resultados) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Erro no banco de dados');
      }

      if (resultados.length === 0) {
        return res.status(401).send('Falha na autenticação');
      }

      try {
        const funcionario = resultados[0];
        const senhaCorreta = await bcrypt.compare(senha, resultados[0].senha);

        if (senhaCorreta) {
          req.session.usuarioLogado = {
            id: funcionario.id_funcionario,
            nome: funcionario.nome,
            sobrenome: funcionario.sobrenome,
            cargo: funcionario.cargo,
          };

          req.session.save((err) => {
            if (err) {
              console.log(err);
              return res.status(500).send('Erro ao salvar a sessão');
            }
            // Redireciona para a rota do dashboard em vez de renderizar direto
            return res.redirect('/dashboard');
          });
        } else {
          return res.status(401).send('Falha na autenticação');
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send('Erro ao verificar a senha');
      }
    }
  );
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Erro ao sair do sistema');
    }

    // apaga
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
