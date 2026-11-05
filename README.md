# Projeto Alfa Gym

## Configuração do Projeto

### 1. Configuração do arquivo `.env`

Crie ou edite o arquivo `.env` na raiz do projeto e defina as variáveis de ambiente necessárias:

```env
# Configuração do hash de sessão
APP_SECRET=seu_hash_gerado_aqui

# Configuração do banco de dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=alfa_gym
```

**Observação:** Utilize o arquivo `database.sql` para criar a estrutura do banco de dados (MySQL). 

### 2. Geração da chave `APP_SECRET`

No terminal, execute o seguinte comando para gerar um hash aleatório seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie a chave exibida e substitua em `APP_SECRET` no seu arquivo `.env`.

---

## Criação de Usuário de Teste

Com a aplicação e o banco de dados em execução, acesse o seguinte endereço no seu navegador para gerar um usuário de testes:

```text
http://localhost:3000/senhaFalsa
```

Após acionar a rota, utilize as seguintes credenciais para autenticação:

* **Login:** `11122233344`
* **Senha:** `123456`