const express = require('express');
const router = express.Router();
const pool = require('@/database/connection');

router.get('/novo', (req, res) => {
  res.render('planos/novoPlano');
});

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  // Quantidade de itens que o banco deve "pular"
  const offset = (page - 1) * limit;

  //  Conta apenas os planos que NÃO foram deletados
  pool.query(
    'SELECT COUNT(*) AS total FROM planos WHERE deleted_at IS NULL',
    (err, resultCount) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Erro ao calcular o total de planos');
      }

      const totalElementos = resultCount[0].total;
      // Math.ceil arredonda para cima
      const totalPaginas = Math.ceil(totalElementos / limit);

      //  Busca apenas os planos ativos, respeitando a paginação
      pool.query(
        'SELECT * FROM planos WHERE deleted_at IS NULL LIMIT ? OFFSET ?',
        [limit, offset],
        (err, resultados) => {
          if (err) {
            console.log(err);
            return res.status(500).send('Erro ao buscar a lista de planos');
          }

          // Retorna a Pagina Atual, Total de Paginas e Elementos da Pagina
          res.render('planos/listagemPlanos', {
            paginaAtual: page,
            totalPaginas: totalPaginas,
            elementosDaPagina: resultados,
          });
        }
      );
    }
  );
});

router.post('/', (req, res) => {
  const nome_plano = req.body.nome_plano;
  const periodicidade = req.body.periodicidade;
  const valor = req.body.valor;

  // 1. Verifica se o plano já existe
  const sqlVerificar = `
        SELECT id_plano FROM planos
        WHERE nome_plano = ?
    `;

  pool.query(sqlVerificar, [nome_plano], (erro, resultado) => {
    if (erro) {
      console.log(erro);
      return res.status(500).send('Erro ao verificar o plano.');
    }

    // 2. Se encontrou um plano com o mesmo nome
    if (resultado.length > 0) {
      return res.status(400).send('Este plano já existe!');
    }

    // 3. Se não existe, realiza o cadastro
    const sqlInserir = `
            INSERT INTO planos
            (nome_plano, periodicidade, valor)
            VALUES (?, ?, ?)
        `;

    pool.query(
      sqlInserir,
      [nome_plano, periodicidade, valor],
      (erro, resultado) => {
        if (erro) {
          console.log(erro);
          return res.status(500).send('Erro ao cadastrar o plano.');
        }

        // 4. Cadastro realizado com sucesso
        res.redirect('/planos');
      }
    );
  });
});

router.get('/editar/:id', (req, res) => {
  const id_plano = req.params.id;

  const sqlSelect = `
    SELECT * FROM planos 
    WHERE id_plano = ? AND deleted_at IS NULL
  `;

  pool.query(sqlSelect, [id_plano], (err, resultados) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Erro ao buscar dados do plano.');
    }

    if (resultados.length === 0) {
      return res.status(404).send('Plano não encontrado.');
    }

    res.render('planos/editarPlano', { plano: resultados[0] });
  });
});

router.post('/editar/:id', (req, res) => {
  const id_plano = req.params.id;
  const nome_plano = req.body.nome_plano;
  const periodicidade = req.body.periodicidade;
  const valor = req.body.valor;

  const sqlUpdate = `
    UPDATE planos
    SET 
      nome_plano = ?,
      periodicidade = ?,
      valor = ?
    WHERE 
      id_plano = ? AND 
      deleted_at IS NULL
  `;

  pool.query(
    sqlUpdate,
    [nome_plano, periodicidade, valor, id_plano],
    (err, resultado) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Erro ao atualizar o plano.');
      }

      // Após atualizar, redireciona de volta para a listagem
      res.redirect('/planos');
    }
  );
});

router.post('/deletar/:id', (req, res) => {
  const id_plano = req.params.id;

  // 1. Verifica se o plano existe
  const sqlVerificar = `
        SELECT id_plano FROM planos
        WHERE id_plano = ?
    `;

  pool.query(sqlVerificar, [id_plano], (erro, resultado) => {
    if (erro) {
      console.log(erro);
      return res.status(500).send('Erro ao verificar o plano.');
    }

    // 2. Verifica se encontrou o plano
    if (resultado.length === 0) {
      return res.status(404).send('Plano não encontrado!');
    }

    // 3. Deleta o plano
    const sqlDeletar = `
          UPDATE planos
          SET deleted_at = NOW(), deleted_by = 1
          WHERE id_plano = ? AND deleted_at IS NULL;
        `;

    pool.query(sqlDeletar, [id_plano], (erro, resultado) => {
      if (erro) {
        console.log(erro);
        return res.status(500).send('Erro ao deletar o plano.');
      }

      // 4. Redireciona após excluir
      res.redirect('/planos');
    });
  });
});

module.exports = router;
