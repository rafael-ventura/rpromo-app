const bcrypt = require('bcryptjs');

const username = 'laline';
const password = 'rpromo123';
const nomeCompleto = 'Administrador RPromo';
const email = 'admin@rpromo.com.br';

const hash = bcrypt.hashSync(password, 10);

console.log('-- Usuário: ' + username + ' | Senha: ' + password);
console.log('INSERT INTO public.usuarios (username, senha_hash, nome_completo, email)');
console.log(`VALUES ('${username}', '${hash}', '${nomeCompleto}', '${email}');`);
console.log('');
console.log('-- Verificar se foi criado:');
console.log(`SELECT username, nome_completo, ativo FROM public.usuarios WHERE username = '${username}';`);
