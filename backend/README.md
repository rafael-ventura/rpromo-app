# Backend RPromo

Esta pasta contém todos os recursos relacionados ao backend do sistema RPromo, incluindo scripts de banco de dados, utilitários e documentação.

## Estrutura

```
backend/
├── database/           # Scripts de banco de dados
│   ├── bd-01.sql      # Estrutura principal com autenticação
│   └── supabase_schema.sql
├── scripts/           # Scripts utilitários
├── types/             # Definições de tipos TypeScript
├── utils/             # Utilitários para backend
│   └── user-creator.ts # Criação de usuários
├── docs/              # Documentação
│   └── SUPABASE_SETUP.md
└── README.md          # Este arquivo
```

## Banco de Dados

### Usuários Padrão
- **Username:** `admin` | **Senha:** `admin123`
- **Username:** `teste` | **Senha:** `teste123`

### Scripts Disponíveis
- `bd-01.sql`: Estrutura completa com tabelas de pessoas e usuários
- `supabase_schema.sql`: Schema original do Supabase

## Utilitários

### UserCreator
Classe para criar novos usuários com hash de senha:

```typescript
import { UserCreator } from './utils/user-creator';

const sql = await UserCreator.generateUserSQL(
  'novouser', 
  'senha123', 
  'Nome Completo', 
  'email@exemplo.com'
);
```

## Configuração

1. Execute os scripts SQL no seu banco Supabase
2. Configure as variáveis de ambiente no frontend
3. Use os usuários padrão para testar o sistema
