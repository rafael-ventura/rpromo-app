-- ============ SETUP COMPLETO DO BANCO DE DADOS ============
-- Execute este arquivo no Supabase SQL Editor para configurar o banco completo
-- 
-- ORDEM DE EXECUÇÃO:
-- 1. Extensões
-- 2. Tabela de pessoas
-- 3. Tabela de usuários
-- 4. Triggers
-- 5. Políticas RLS
-- 6. Dados de exemplo (opcional)
--
-- IMPORTANTE: Para criar usuários administrativos de forma segura,
-- use o script: backend/scripts/setup-admin.js

-- ============ 1. EXTENSÕES ============
\i 01-extensions.sql

-- ============ 2. TABELA DE PESSOAS ============
\i 02-pessoas-table.sql

-- ============ 3. TABELA DE USUÁRIOS ============
\i 03-usuarios-table.sql

-- ============ 4. TRIGGERS ============
\i 04-triggers.sql

-- ============ 5. POLÍTICAS RLS ============
\i 05-rls-policies.sql

-- ============ 6. DADOS DE EXEMPLO (OPCIONAL) ============
-- Descomente a linha abaixo para inserir dados de teste
-- \i 06-sample-data.sql

-- ============ SETUP CONCLUÍDO ============
-- Para criar usuários administrativos seguros:
-- 1. Execute: node backend/scripts/setup-admin.js
-- 2. Copie e execute o SQL gerado aqui no Supabase
-- 3. Nunca commite credenciais no código!
