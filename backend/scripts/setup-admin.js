#!/usr/bin/env node

/**
 * Script para criar usuário administrador de forma segura
 * Não expõe credenciais no código fonte
 *
 * Uso: node setup-admin.js
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdminUser() {
  console.log('🔐 SETUP DE USUÁRIO ADMINISTRADOR SEGURO');
  console.log('=====================================\n');

  try {
    const username = await question('Username do administrador: ');
    const password = await questionHidden('Senha (não será exibida): ');
    const confirmPassword = await questionHidden('Confirme a senha: ');

    if (password !== confirmPassword) {
      console.log('❌ Senhas não coincidem!');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.log('❌ Senha deve ter pelo menos 6 caracteres!');
      rl.close();
      return;
    }

    const nomeCompleto = await question('Nome completo: ');
    const email = await question('Email (opcional): ');

    // Gerar hash da senha
    const hash = bcrypt.hashSync(password, 10);

    console.log('\n✅ Usuário criado com sucesso!');
    console.log('\n📋 EXECUTE ESTE SQL NO SEU SUPABASE:');
    console.log('=====================================');

    const sql = `
-- Usuário administrador criado de forma segura
INSERT INTO public.usuarios (username, senha_hash, nome_completo, email)
VALUES ('${username}', '${hash}', '${nomeCompleto}', '${email || ''}')
ON CONFLICT (username) DO UPDATE SET
  senha_hash = EXCLUDED.senha_hash,
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email;

-- Verificar se foi criado
SELECT username, nome_completo, email, ativo, created_at
FROM public.usuarios
WHERE username = '${username}';`;

    console.log(sql);

    console.log('\n⚠️  IMPORTANTE:');
    console.log('- Copie e execute o SQL acima no Supabase SQL Editor');
    console.log('- NÃO compartilhe este output com ninguém');
    console.log('- Delete este terminal após usar');

    // Teste do hash
    const isValid = bcrypt.compareSync(password, hash);
    console.log(`\n🧪 Teste do hash: ${isValid ? '✅ OK' : '❌ FALHOU'}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  rl.close();
}

createAdminUser();
