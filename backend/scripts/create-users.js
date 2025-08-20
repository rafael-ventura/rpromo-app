#!/usr/bin/env node

/**
 * Script para criar usuários no sistema RPromo
 * Uso: node create-users.js [username] [password] [nome] [email]
 */

const bcrypt = require('bcryptjs');

function createUserSQL(username, password, nomeCompleto, email) {
  const hash = bcrypt.hashSync(password, 10);
  return `
-- Usuário: ${username}
INSERT INTO public.usuarios (username, senha_hash, nome_completo, email) 
VALUES ('${username}', '${hash}', '${nomeCompleto}', '${email || ''}')
ON CONFLICT (username) DO UPDATE SET 
  senha_hash = EXCLUDED.senha_hash,
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email;
`;
}

function showUsage() {
  console.log(`
Uso: node create-users.js [username] [password] [nome] [email]

Exemplos:
  node create-users.js admin admin123 "Administrador" "admin@rpromo.com.br"
  node create-users.js usuario senha123 "Usuário Teste"

Se não fornecer parâmetros, serão criados os usuários padrão.
`);
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length === 0) {
  // Criar usuários padrão
  console.log('-- Usuários padrão do sistema RPromo');
  console.log(createUserSQL('admin', 'admin123', 'Administrador', 'admin@rpromo.com.br'));
  console.log(createUserSQL('teste', 'teste123', 'Usuário Teste', 'teste@rpromo.com.br'));
  console.log(createUserSQL('usuario', '123456', 'Usuário Padrão', 'usuario@rpromo.com.br'));
} else if (args.length >= 3) {
  // Criar usuário customizado
  const [username, password, nome, email] = args;
  console.log(createUserSQL(username, password, nome, email));
} else {
  showUsage();
  process.exit(1);
}
