#!/usr/bin/env node

/**
 * Script de setup inicial do projeto RPromo
 * Configura o banco de dados e cria usuário administrador
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 SETUP DO PROJETO RPROMO');
console.log('===========================\n');

console.log('📋 PASSOS PARA CONFIGURAR O PROJETO:');
console.log('');

console.log('1️⃣  CONFIGURAR SUPABASE:');
console.log('   • Acesse https://supabase.com');
console.log('   • Crie um novo projeto');
console.log('   • Vá para SQL Editor');
console.log('   • Execute os scripts na seguinte ordem:');
console.log('');

const databaseFiles = [
  '01-extensions.sql',
  '02-pessoas-table.sql',
  '03-usuarios-table.sql',
  '04-triggers.sql',
  '05-rls-policies.sql',
  '06-sample-data.sql (opcional - dados de teste)'
];

databaseFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log('');
console.log('2️⃣  CRIAR USUÁRIO ADMINISTRADOR:');
console.log('   • Execute: node backend/scripts/setup-admin.js');
console.log('   • Siga as instruções para criar um usuário seguro');
console.log('   • Execute o SQL gerado no Supabase');
console.log('');

console.log('3️⃣  CONFIGURAR AMBIENTE:');
console.log('   • Copie as credenciais do Supabase');
console.log('   • Configure src/environments/environment.ts:');
console.log('');
console.log('   export const environment = {');
console.log('     production: false,');
console.log('     supabase: {');
console.log('       url: "SUA_SUPABASE_URL",');
console.log('       anonKey: "SUA_SUPABASE_ANON_KEY"');
console.log('     }');
console.log('   };');
console.log('');

console.log('4️⃣  EXECUTAR O PROJETO:');
console.log('   • npm install');
console.log('   • ng serve');
console.log('   • Acesse http://localhost:4200');
console.log('');

console.log('🔐 SEGURANÇA:');
console.log('   • NUNCA commite credenciais no GitHub');
console.log('   • Use o script setup-admin.js para criar usuários');
console.log('   • Mantenha o arquivo environment.ts no .gitignore');
console.log('');

console.log('📁 ESTRUTURA DOS ARQUIVOS:');
const databasePath = path.join(__dirname, '../database');
if (fs.existsSync(databasePath)) {
  const files = fs.readdirSync(databasePath).filter(f => f.endsWith('.sql'));
  files.forEach(file => {
    console.log(`   ✅ ${file}`);
  });
} else {
  console.log('   ❌ Pasta database/ não encontrada');
}

console.log('');
console.log('🎉 PRONTO! Siga os passos acima para configurar o projeto.');
console.log('');
console.log('💡 DICA: Execute "node setup-admin.js" para criar seu primeiro usuário.');
