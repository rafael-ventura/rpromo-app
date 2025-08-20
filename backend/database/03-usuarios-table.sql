-- ============ TABELA DE USUÁRIOS ============
-- Tabela para autenticação simples (sem Supabase Auth)

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  username varchar(50) not null unique,
  senha_hash text not null,
  nome_completo varchar(255) not null,
  email varchar(255),
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ ÍNDICES PARA USUÁRIOS ============
create index if not exists idx_usuarios_username on public.usuarios (username);
create index if not exists idx_usuarios_ativo on public.usuarios (ativo);

-- ============ COMENTÁRIOS ============
comment on table public.usuarios is 'Tabela de usuários para autenticação simples do sistema';
comment on column public.usuarios.username is 'Nome de usuário único para login';
comment on column public.usuarios.senha_hash is 'Hash da senha do usuário (bcrypt)';
