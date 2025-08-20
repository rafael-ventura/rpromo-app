-- ============ DADOS DE EXEMPLO ============
-- Dados de teste para desenvolvimento (REMOVER EM PRODUÇÃO)

-- PERFIL 1 - Maria Silva Santos
INSERT INTO pessoas (
    nome_completo, cpf, rg, orgao_emissor, data_expedicao, data_nascimento,
    sexo, raca_cor, naturalidade, nome_pai, nome_mae, email, telefone,
    titulo_eleitor, zona_eleitoral, secao_eleitoral, carteira_trabalho,
    data_emissao_carteira, pis, certificado_reservista,
    tipo_conta, agencia_bancaria, numero_conta, banco, chave_pix,
    rua, bairro, cidade, cep,
    tem_filhos, quantidade_filhos, nomes_filhos,
    status
) VALUES (
    'Maria Silva Santos', '12345678901', '123456789', 'SSP-RJ', '2020-03-15', '1985-08-25',
    'Feminino', 'Parda', 'Rio de Janeiro - RJ', 'João Santos Silva', 'Ana Maria Santos',
    'maria.santos@email.com', '11987654321',
    '123456789012', '001', '0123', '1234567890',
    '2005-01-10', '12345678901', NULL,
    'Conta-Corrente', '1234', '567890-1', 'Banco do Brasil', 'maria.santos@email.com',
    'Rua das Flores, 123', 'Copacabana', 'Rio de Janeiro', '22070-001',
    true, 2, '[{"nome":"João Silva Santos","dataNascimento":"2010-05-15"},{"nome":"Ana Silva Santos","dataNascimento":"2012-08-20"}]'::jsonb,
    'Ativo'
);

-- PERFIL 2 - Carlos Eduardo Oliveira
INSERT INTO pessoas (
    nome_completo, cpf, rg, orgao_emissor, data_expedicao, data_nascimento,
    sexo, raca_cor, naturalidade, nome_pai, nome_mae, email, telefone,
    titulo_eleitor, zona_eleitoral, secao_eleitoral, carteira_trabalho,
    data_emissao_carteira, pis, certificado_reservista,
    tipo_conta, agencia_bancaria, numero_conta, banco, chave_pix,
    rua, bairro, cidade, cep,
    tem_filhos, quantidade_filhos, nomes_filhos,
    status
) VALUES (
    'Carlos Eduardo Oliveira', '98765432100', '987654321', 'SSP-RJ', '2019-07-22', '1990-11-12',
    'Masculino', 'Branca', 'Rio de Janeiro - RJ', 'Eduardo Oliveira Lima', 'Carmen Silva Oliveira',
    'carlos.oliveira@gmail.com', '21998765432',
    '987654321098', '002', '0456', '0987654321',
    '2010-05-18', '98765432100', '9876543210',
    'Poupança', '5678', '123456-7', 'Caixa Econômica Federal', '21998765432',
    'Avenida Atlântica, 456', 'Ipanema', 'Rio de Janeiro', '22070-001',
    false, 0, '[]'::jsonb,
    'Ativo'
);

-- PERFIL 3 - Ana Carolina Ferreira (Inativa)
INSERT INTO pessoas (
    nome_completo, cpf, rg, orgao_emissor, data_expedicao, data_nascimento,
    sexo, raca_cor, naturalidade, nome_pai, nome_mae, email, telefone,
    titulo_eleitor, zona_eleitoral, secao_eleitoral, carteira_trabalho,
    data_emissao_carteira, pis, certificado_reservista,
    tipo_conta, agencia_bancaria, numero_conta, banco, chave_pix,
    rua, bairro, cidade, cep,
    tem_filhos, quantidade_filhos, nomes_filhos,
    status, motivo_inativacao
) VALUES (
    'Ana Carolina Ferreira', '45678912300', '456789123', 'SSP-RJ', '2021-09-10', '1988-04-18',
    'Feminino', 'Branca', 'Rio de Janeiro - RJ', 'Roberto Ferreira Costa', 'Lucia Santos Ferreira',
    'ana.ferreira@outlook.com', '21912345678',
    '456789123456', '003', '0789', '4567891230',
    '2008-03-25', '45678912300', NULL,
    'Conta Salário', '9012', '345678-9', 'Itaú Unibanco', 'ana.ferreira@outlook.com',
    'Rua Visconde de Pirajá, 789', 'Ipanema', 'Rio de Janeiro', '22411-000',
    true, 1, '[{"nome":"Pedro Ferreira","dataNascimento":"2015-12-10"}]'::jsonb,
    'Inativo', 'Mudança para outro estado'
);
