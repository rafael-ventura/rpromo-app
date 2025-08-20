-- ============ TRIGGERS E FUNÇÕES ============
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
