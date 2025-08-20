#!/usr/bin/env node

/**
 * Script para criar usuário administrador
 * Uso: node setup-admin.js username senha
 * Exemplo: node setup-admin.js admin minhasenha123
 */

const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('🔐 Criar Usuário Administrador');
  console.log('==============================');
  console.log('');
  console.log('Uso: node setup-admin.js username senha');
  console.log('');
  console.log('Exemplo:');
  console.log('  node setup-admin.js admin minhasenha123');
  console.log('  node setup-admin.js laline rpromo123');
  process.exit(1);
}

const [username, password] = args;

if (password.length < 6) {
  console.log('❌ Senha deve ter pelo menos 6 caracteres!');
  process.exit(1);
}

// Gerar hash da senha
const hash = bcrypt.hashSync(password, 10);

console.log('📋 Execute no Supabase:');
console.log('========================');
console.log(`INSERT INTO public.usuarios (username, senha_hash, nome_completo, email)`);
console.log(`VALUES ('${username}', '${hash}', 'Administrador', '');`);
