-- ============ SETUP COMPLETO DO BANCO RPROMO ============
-- Execute este arquivo no Supabase SQL Editor
--
-- Para criar usuários seguros: npm run create-admin
--
-- IMPORTANTE: NUNCA commite credenciais no GitHub!
-- ========================================================


-- ============ 1. EXTENSÕES ============
-- Extensões necessárias para o funcionamento do sistema

-- Extensão para geração de UUIDs
create extension if not exists pgcrypto; -- para gen_random_uuid()


-- ============ 2. TABELA DE PESSOAS ============
-- Tabela principal para armazenar dados das pessoas cadastradas

create table if not exists public.pessoas (
  id uuid primary key default gen_random_uuid(),

  -- Dados Pessoais
  nome_completo        varchar(255) not null,
  cpf                  varchar(11)  not null unique,
  rg                   varchar(50)  not null,
  orgao_emissor        varchar(50)  not null,
  data_expedicao       date         not null,
  data_nascimento      date         not null,
  sexo                 varchar(50)  not null,
  raca_cor             varchar(50)  not null,
  naturalidade         varchar(100) not null,
  nome_pai             varchar(255),
  nome_mae             varchar(255),
  email                varchar(255) not null,
  telefone             varchar(20)  not null,

  -- Documentos
  titulo_eleitor       varchar(50)  not null,
  zona_eleitoral       varchar(20)  not null,
  secao_eleitoral      varchar(20)  not null,
  carteira_trabalho    varchar(50)  not null,
  data_emissao_carteira date        not null,
  pis                  varchar(20)  not null,
  certificado_reservista varchar(50),

  -- Dados Bancários
  tipo_conta           varchar(50)  not null,
  agencia_bancaria     varchar(20)  not null,
  numero_conta         varchar(30)  not null,
  banco                varchar(100) not null,
  chave_pix            varchar(255) not null,

  -- Endereço
  rua                  text         not null,
  bairro               varchar(100) not null,
  cidade               varchar(100) not null,
  cep                  varchar(9)   not null,

  -- Família
  tem_filhos           boolean      default false,
  quantidade_filhos    integer      default 0,
  nomes_filhos         jsonb        default '[]'::jsonb,

  -- Status e Controle
  status               varchar(20)  default 'Ativo' check (status in ('Ativo','Inativo')),
  motivo_inativacao    text,

  -- Timestamps
  created_at           timestamptz  default now(),
  updated_at           timestamptz  default now(),

  -- Regras simples de formato (opcionais)
  constraint cpf_format  check (cpf ~ '^[0-9]{11}$'),
  constraint cep_format  check (cep ~ '^[0-9]{5}-?[0-9]{3}$'),
  constraint email_format check (position('@' in email) > 1)
);

-- ============ ÍNDICES PARA PESSOAS ============
create index if not exists idx_pessoas_nome       on public.pessoas (nome_completo);
create index if not exists idx_pessoas_cpf        on public.pessoas (cpf);
create index if not exists idx_pessoas_email      on public.pessoas (email);
create index if not exists idx_pessoas_status     on public.pessoas (status);
create index if not exists idx_pessoas_bairro     on public.pessoas (bairro);
create index if not exists idx_pessoas_cidade     on public.pessoas (cidade);
create index if not exists idx_pessoas_created_at on public.pessoas (created_at);

-- ============ COMENTÁRIOS PESSOAS ============
comment on table  public.pessoas is 'Tabela principal para armazenar dados das pessoas cadastradas no sistema RPromo';
comment on column public.pessoas.cpf is 'CPF único da pessoa (apenas números)';
comment on column public.pessoas.status is 'Status da pessoa: Ativo ou Inativo';
comment on column public.pessoas.nomes_filhos is 'Array JSON com informações dos filhos: [{"nome":"string","dataNascimento":"date"}]';


-- ============ 3. TABELA DE USUÁRIOS ============
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

-- ============ COMENTÁRIOS USUÁRIOS ============
comment on table public.usuarios is 'Tabela de usuários para autenticação simples do sistema';
comment on column public.usuarios.username is 'Nome de usuário único para login';
comment on column public.usuarios.senha_hash is 'Hash da senha do usuário (bcrypt)';


-- ============ 4. TRIGGERS E FUNÇÕES ============
-- Funções e triggers para automatizar operações

-- Função para atualizar updated_at automaticamente
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Trigger para pessoas
drop trigger if exists update_pessoas_updated_at on public.pessoas;
create trigger update_pessoas_updated_at
before update on public.pessoas
for each row execute function public.update_updated_at_column();

-- Trigger para usuários
drop trigger if exists update_usuarios_updated_at on public.usuarios;
create trigger update_usuarios_updated_at
before update on public.usuarios
for each row execute function public.update_updated_at_column();


-- ============ 5. POLÍTICAS RLS ============
-- Políticas de segurança para controlar acesso aos dados

-- ============ RLS PARA PESSOAS ============
alter table public.pessoas enable row level security;

-- Remover políticas antigas
drop policy if exists "Allow all operations" on public.pessoas;
drop policy if exists pessoas_select_admins on public.pessoas;
drop policy if exists pessoas_insert_public on public.pessoas;
drop policy if exists pessoas_update_admins on public.pessoas;
drop policy if exists pessoas_delete_admins on public.pessoas;

-- 1) FORM PÚBLICO: só INSERT liberado (anon + authenticated)
create policy pessoas_insert_public
on public.pessoas
for insert
to anon, authenticated
with check (true);

-- 2) LEITURA PÚBLICA: permitir leitura para todos (temporário para desenvolvimento)
create policy pessoas_select_public
on public.pessoas
for select
to anon, authenticated
using (true);

-- 3) UPDATE/DELETE: apenas usuários autenticados (admins)
create policy pessoas_update_authenticated
on public.pessoas
for update
to authenticated
using (true);

create policy pessoas_delete_authenticated
on public.pessoas
for delete
to authenticated
using (true);

-- ============ RLS PARA USUÁRIOS ============
alter table public.usuarios enable row level security;

-- Remover políticas antigas
drop policy if exists usuarios_select_public on public.usuarios;
drop policy if exists usuarios_manage_authenticated on public.usuarios;

-- Política para permitir SELECT público (necessário para autenticação)
create policy usuarios_select_public
on public.usuarios
for select
to anon, authenticated
using (ativo = true);

-- Política para INSERT/UPDATE/DELETE apenas para usuários autenticados
create policy usuarios_manage_authenticated
on public.usuarios
for all
to authenticated
using (true)
with check (true);


-- ============ SETUP CONCLUÍDO ============
--
-- PRÓXIMOS PASSOS:
-- 1. Execute: npm run create-admin
-- 2. Copie e execute o SQL gerado
-- 3. Configure environment.ts com credenciais do Supabase
-- 4. Execute: ng serve
--
-- IMPORTANTE: NUNCA commite credenciais no GitHub!
