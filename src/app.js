require('dotenv').config();
require('module-alias/register');

const express = require('express');
const session = require('express-session');
const autenticacao = require('@/middlewares/autenticacao');
const funcionarioRouter = require('@/routers/funcionarioRouter');
const indexRouter = require('@/routers/indexRouter');
const planoRouter = require('@/routers/planoRouter');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  session({
    secret: process.env.APP_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 28800000,
    },
  })
);

app.use('/', indexRouter);
app.use('/funcionarios', autenticacao, funcionarioRouter);
app.use('/planos', autenticacao, planoRouter);

app.listen(port, () => {
  console.log('Servidor rodando na porta:', port);
});
