-- ============ EXTENSÕES ============
-- Extensões necessárias para o funcionamento do sistema

-- Extensão para geração de UUIDs
create extension if not exists pgcrypto; -- para gen_random_uuid()
