function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) {
    return false;
  }

  // Rejeita CPFs com todos os números iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validar primeiro dígito verificador
  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  if (resto !== Number(cpf[9])) {
    return false;
  }

  // Validar segundo dígito verificador
  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  if (resto !== Number(cpf[10])) {
    return false;
  }

  return true;
}

module.exports = validarCPF;
