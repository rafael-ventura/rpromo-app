-- ============ EXTENSÕES ============
create extension if not exists pgcrypto; -- para gen_random_uuid()

-- ============ TABELA ============
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

-- ============ ÍNDICES ============
create index if not exists idx_pessoas_nome       on public.pessoas (nome_completo);
create index if not exists idx_pessoas_cpf        on public.pessoas (cpf);
create index if not exists idx_pessoas_email      on public.pessoas (email);
create index if not exists idx_pessoas_status     on public.pessoas (status);
create index if not exists idx_pessoas_bairro     on public.pessoas (bairro);
create index if not exists idx_pessoas_cidade     on public.pessoas (cidade);
create index if not exists idx_pessoas_created_at on public.pessoas (created_at);

-- ============ TRIGGER updated_at ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists update_pessoas_updated_at on public.pessoas;
create trigger update_pessoas_updated_at
before update on public.pessoas
for each row execute function public.update_updated_at_column();

-- ============ RLS (segurança por linha) ============
alter table public.pessoas enable row level security;

-- Remova qualquer política permissiva antiga, se existir:
drop policy if exists "Allow all operations" on public.pessoas;

-- 1) FORM PÚBLICO: só INSERT liberado (anon + authenticated)
drop policy if exists pessoas_insert_public on public.pessoas;
create policy pessoas_insert_public
on public.pessoas
for insert
to anon, authenticated
with check (true);

-- 2) ADMIN (opcional): apenas admins podem SELECT/UPDATE/DELETE
create table if not exists public.admins (
  user_id uuid primary key,
  created_at timestamptz default now()
);

drop policy if exists pessoas_select_admins on public.pessoas;
create policy pessoas_select_admins
on public.pessoas
for select
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists pessoas_update_admins on public.pessoas;
create policy pessoas_update_admins
on public.pessoas
for update
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists pessoas_delete_admins on public.pessoas;
create policy pessoas_delete_admins
on public.pessoas
for delete
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- ============ COMENTÁRIOS ============
comment on table  public.pessoas is 'Tabela principal para armazenar dados das pessoas cadastradas no sistema RPromo';
comment on column public.pessoas.cpf is 'CPF único da pessoa (apenas números)';
comment on column public.pessoas.status is 'Status da pessoa: Ativo ou Inativo';
comment on column public.pessoas.nomes_filhos is 'Array JSON com informações dos filhos: [{"nome":"string","dataNascimento":"date"}]';
