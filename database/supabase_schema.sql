-- Criação da tabela pessoas no Supabase
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS pessoas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Dados Pessoais
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(50) NOT NULL,
    orgao_emissor VARCHAR(50) NOT NULL,
    data_expedicao DATE NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo VARCHAR(50) NOT NULL,
    raca_cor VARCHAR(50) NOT NULL,
    naturalidade VARCHAR(100) NOT NULL,
    nome_pai VARCHAR(255),
    nome_mae VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,

    -- Documentos
    titulo_eleitor VARCHAR(50) NOT NULL,
    zona_eleitoral VARCHAR(20) NOT NULL,
    secao_eleitoral VARCHAR(20) NOT NULL,
    carteira_trabalho VARCHAR(50) NOT NULL,
    data_emissao_carteira DATE NOT NULL,
    pis VARCHAR(20) NOT NULL,
    certificado_reservista VARCHAR(50),

    -- Dados Bancários
    tipo_conta VARCHAR(50) NOT NULL,
    agencia_bancaria VARCHAR(20) NOT NULL,
    numero_conta VARCHAR(30) NOT NULL,
    banco VARCHAR(100) NOT NULL,
    chave_pix VARCHAR(255) NOT NULL,

    -- Endereço
    rua TEXT NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,

    -- Família
    tem_filhos BOOLEAN DEFAULT FALSE,
    quantidade_filhos INTEGER DEFAULT 0,
    nomes_filhos JSONB DEFAULT '[]'::jsonb,

    -- Status e Controle
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
    motivo_inativacao TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pessoas_nome ON pessoas(nome_completo);
CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON pessoas(cpf);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas(email);
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON pessoas(status);
CREATE INDEX IF NOT EXISTS idx_pessoas_bairro ON pessoas(bairro);
CREATE INDEX IF NOT EXISTS idx_pessoas_cidade ON pessoas(cidade);
CREATE INDEX IF NOT EXISTS idx_pessoas_created_at ON pessoas(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER update_pessoas_updated_at
    BEFORE UPDATE ON pessoas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Configurar conforme necessário
-- Por enquanto, permitir acesso total (ajustar depois conforme necessidade)
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso total (CUIDADO: apenas para desenvolvimento)
CREATE POLICY "Allow all operations" ON pessoas
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE pessoas IS 'Tabela principal para armazenar dados das pessoas cadastradas no sistema RPromo';
COMMENT ON COLUMN pessoas.cpf IS 'CPF único da pessoa (apenas números)';
COMMENT ON COLUMN pessoas.status IS 'Status da pessoa: Ativo ou Inativo';
COMMENT ON COLUMN pessoas.nomes_filhos IS 'Array JSON com informações dos filhos: [{"nome": "string", "dataNascimento": "date"}]';
