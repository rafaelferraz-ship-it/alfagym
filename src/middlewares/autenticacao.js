const verificarAutenticacao = (req, res, next) => {
  if (req.session && req.session.usuarioLogado) {
    res.locals.usuarioLogado = req.session.usuarioLogado;
    return next();
  }
  res.redirect('/');
};

module.exports = verificarAutenticacao;
