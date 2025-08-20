-- ============ ROW LEVEL SECURITY (RLS) ============
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
