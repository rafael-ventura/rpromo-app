# Backend RPromo

Esta pasta contém todos os recursos relacionados ao backend do sistema RPromo, incluindo scripts de banco de dados organizados, utilitários seguros e documentação completa.

## 🚀 Setup Rápido

```bash
cd backend
npm install
npm run setup  # Mostra instruções completas
npm run create-admin  # Cria usuário administrador seguro
```

## 📁 Estrutura Organizada

```
backend/
├── database/                    # Scripts SQL organizados
│   ├── 01-extensions.sql       # Extensões PostgreSQL
│   ├── 02-pessoas-table.sql    # Tabela de pessoas
│   ├── 03-usuarios-table.sql   # Tabela de usuários
│   ├── 04-triggers.sql         # Triggers e funções
│   ├── 05-rls-policies.sql     # Políticas de segurança
│   ├── 06-sample-data.sql      # Dados de exemplo
│   ├── setup-database.sql      # Script principal
│   └── fix-users.sql           # Correção de usuários
├── scripts/                    # Scripts utilitários
│   ├── setup-project.js        # Setup inicial do projeto
│   ├── setup-admin.js          # Criação segura de admin
│   ├── create-users.js         # Criação de usuários
│   └── test-passwords.js       # Teste de senhas
├── types/                      # Definições TypeScript
│   ├── usuario.types.ts        # Tipos de usuários
│   └── pessoa.types.ts         # Tipos de pessoas
├── utils/                      # Utilitários backend
│   └── user-creator.ts         # Criador de usuários
└── docs/                       # Documentação
    └── SUPABASE_SETUP.md
```

## 🔐 Segurança (SEM CREDENCIAIS NO GITHUB)

### ✅ Método Seguro (Recomendado)
```bash
# 1. Criar usuário administrador de forma segura
npm run create-admin

# 2. Seguir as instruções no terminal
# 3. Executar o SQL gerado no Supabase
# 4. NUNCA commitar credenciais!
```

### ❌ Método Inseguro (NÃO USAR)
```sql
-- NUNCA faça isso no código público:
INSERT INTO usuarios VALUES ('admin', 'senha123', ...);
```

## 🗄️ Setup do Banco de Dados

### Método 1: Arquivos Separados (Recomendado)
Execute na ordem no Supabase SQL Editor:
1. `01-extensions.sql`
2. `02-pessoas-table.sql`
3. `03-usuarios-table.sql`
4. `04-triggers.sql`
5. `05-rls-policies.sql`
6. `06-sample-data.sql` (opcional)

### Método 2: Script Único
```sql
-- Execute setup-database.sql no Supabase
-- (contém referências aos arquivos individuais)
```

## 🛠 Scripts Disponíveis

```bash
npm run setup          # Instruções completas de configuração
npm run create-admin    # Criar usuário administrador seguro
npm run create-users    # Criar usuários com parâmetros
npm run test-passwords  # Testar hashes de senhas
```

## 🔑 Criação de Usuários

### Usuário Administrador (Seguro)
```bash
npm run create-admin
# Segue prompts interativos
# Gera SQL para executar no Supabase
# Não expõe credenciais no código
```

### Usuários Adicionais
```bash
npm run create-users username senha123 "Nome Completo" "email@exemplo.com"
```

### Verificar Senhas
```bash
npm run test-passwords
# Testa se os hashes estão funcionando
```

## 📋 Estrutura das Tabelas

### Tabela `usuarios`
- `id`: UUID (chave primária)
- `username`: Nome de usuário único
- `senha_hash`: Hash bcrypt da senha
- `nome_completo`: Nome completo do usuário
- `email`: Email (opcional)
- `ativo`: Status do usuário
- `created_at`, `updated_at`: Timestamps

### Tabela `pessoas`
- Dados pessoais completos
- Documentos (RG, CPF, etc.)
- Dados bancários
- Endereço
- Informações familiares
- Status e controle

## 🛡️ Segurança Implementada

- **Hashes bcrypt**: Senhas protegidas com salt
- **Row Level Security**: Controle granular de acesso
- **Políticas RLS**: Separação entre público e privado
- **Triggers**: Atualização automática de timestamps
- **Validações**: Constraints de formato (CPF, email, etc.)

## 📝 Políticas de Acesso

### Tabela `pessoas`
- **INSERT**: Público (formulário de cadastro)
- **SELECT**: Público (temporário para desenvolvimento)
- **UPDATE/DELETE**: Apenas usuários autenticados

### Tabela `usuarios`
- **SELECT**: Público (necessário para autenticação)
- **INSERT/UPDATE/DELETE**: Apenas usuários autenticados

## 🚨 Importante

1. **NUNCA** commite credenciais no GitHub
2. **SEMPRE** use `npm run create-admin` para usuários
3. **EXECUTE** os scripts SQL na ordem correta
4. **CONFIGURE** RLS adequadamente para produção
5. **TESTE** a autenticação antes de usar

## 💡 Dicas

- Use dados de exemplo apenas em desenvolvimento
- Remova `06-sample-data.sql` em produção
- Configure backup periódico do banco
- Monitore logs de acesso e tentativas de login
- Implemente rate limiting se necessário