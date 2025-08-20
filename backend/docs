# 🚀 Configuração do Supabase - RPromo

Este guia te ajuda a configurar o Supabase como backend do sistema RPromo.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com) (gratuita)
2. Projeto Angular já configurado

## 🛠 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub/Google
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `rpromo-backend`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (ex: South America)
7. Clique em "Create new project"
8. Aguarde alguns minutos para o projeto ser criado

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New Query"
3. Copie e cole o conteúdo do arquivo `database/supabase_schema.sql`
4. Clique em "Run" para executar
5. Verifique se a tabela `pessoas` foi criada em **Table Editor**

### 3. Obter Credenciais

1. Vá para **Settings** > **API**
2. Copie:
   - **URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Configurar no Angular

Edite os arquivos de environment:

**src/environments/environment.ts**:
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://SEU_PROJETO.supabase.co',
    anonKey: 'SUA_ANON_KEY_AQUI'
  }
};
```

**src/environments/environment.prod.ts**:
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://SEU_PROJETO.supabase.co',
    anonKey: 'SUA_ANON_KEY_AQUI'
  }
};
```

### 5. Testar Conexão

1. Execute `ng serve`
2. Acesse a aplicação
3. Tente criar um cadastro
4. Verifique no Supabase **Table Editor** se os dados apareceram

## 🔒 Configurações de Segurança

### Row Level Security (RLS)

O esquema já vem com RLS habilitado e uma política básica. Para produção, considere:

```sql
-- Remover política permissiva
DROP POLICY "Allow all operations" ON pessoas;

-- Criar políticas mais restritivas
CREATE POLICY "Allow read for authenticated users" ON pessoas
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON pessoas
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users" ON pessoas
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

### Autenticação (Opcional)

Para adicionar autenticação:

1. No Supabase, vá para **Authentication** > **Settings**
2. Configure provedores (Email, Google, etc.)
3. No Angular, instale: `npm install @supabase/auth-ui-angular`

## 📊 Monitoramento

### Logs
- Vá para **Logs** no painel do Supabase
- Monitore queries e erros

### Métricas
- **Database** > **Reports** para ver uso
- Plano gratuito: 500MB de dados, 2GB de transferência

## 🚀 Deploy

### Variáveis de Ambiente

Para deploy (Vercel, Netlify, etc.), configure:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-aqui
```

### Build de Produção

```bash
ng build --prod
```

## 🔧 Troubleshooting

### Erro de CORS
- Verifique se a URL está correta
- No Supabase, vá para **Settings** > **API** > **CORS**

### Erro de RLS
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'pessoas';

-- Desabilitar temporariamente para debug
ALTER TABLE pessoas DISABLE ROW LEVEL SECURITY;
```

### Erro de Conexão
1. Verifique se o projeto Supabase está ativo
2. Confirme URL e chave no environment
3. Teste conexão no **SQL Editor**

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

## 💡 Próximos Passos

- [ ] Configurar autenticação
- [ ] Implementar upload de arquivos no Supabase Storage
- [ ] Configurar real-time subscriptions
- [ ] Implementar backup automático
- [ ] Configurar webhooks para integrações

---

✅ **Sistema configurado com sucesso!**

Agora você tem um backend completo com PostgreSQL, API REST automática, e interface administrativa no Supabase!
