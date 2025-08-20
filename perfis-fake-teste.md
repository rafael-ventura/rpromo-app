# 🧑‍💼 PERFIS FAKE PARA TESTE - RPROMO

## 📝 **PERFIL 1 - Para inserir via FORMULÁRIO**

### **Dados Pessoais:**
- **Nome Completo:** Maria Silva Santos
- **CPF:** 123.456.789-01
- **RG:** 12.345.678-9
- **Órgão Emissor:** SSP-SP
- **Data de Expedição:** 15/03/2020
- **Data de Nascimento:** 25/08/1985
- **Sexo:** Feminino
- **Raça/Cor:** Parda
- **Naturalidade:** São Paulo - SP
- **Nome do Pai:** João Santos Silva
- **Nome da Mãe:** Ana Maria Santos
- **E-mail:** maria.santos@email.com
- **Telefone:** (11) 98765-4321

### **Documentos:**
- **Título de Eleitor:** 123456789012
- **Zona Eleitoral:** 001
- **Seção Eleitoral:** 0123
- **Carteira de Trabalho:** 1234567890
- **Data de Emissão da Carteira:** 10/01/2005
- **PIS:** 12345678901
- **Certificado de Reservista:** 1234567890 (deixar vazio se feminino)

### **Dados Bancários:**
- **Tipo de Conta:** Conta-Corrente
- **Agência Bancária:** 1234
- **Número da Conta:** 567890-1
- **Banco:** Banco do Brasil
- **Chave PIX:** maria.santos@email.com

### **Endereço:**
- **Rua:** Rua das Flores, 123
- **Bairro:** Centro
- **Cidade:** São Paulo
- **CEP:** 01234-567
- **Estado:** SP
- **Complemento:** Apto 45

---

## 📝 **PERFIL 2 - Para inserir via FORMULÁRIO**

### **Dados Pessoais:**
- **Nome Completo:** Carlos Eduardo Oliveira
- **CPF:** 987.654.321-00
- **RG:** 98.765.432-1
- **Órgão Emissor:** SSP-RJ
- **Data de Expedição:** 22/07/2019
- **Data de Nascimento:** 12/11/1990
- **Sexo:** Masculino
- **Raça/Cor:** Branca
- **Naturalidade:** Rio de Janeiro - RJ
- **Nome do Pai:** Eduardo Oliveira Lima
- **Nome da Mãe:** Carmen Silva Oliveira
- **E-mail:** carlos.oliveira@gmail.com
- **Telefone:** (21) 99876-5432

### **Documentos:**
- **Título de Eleitor:** 987654321098
- **Zona Eleitoral:** 002
- **Seção Eleitoral:** 0456
- **Carteira de Trabalho:** 0987654321
- **Data de Emissão da Carteira:** 18/05/2010
- **PIS:** 98765432100
- **Certificado de Reservista:** 9876543210

### **Dados Bancários:**
- **Tipo de Conta:** Poupança
- **Agência Bancária:** 5678
- **Número da Conta:** 123456-7
- **Banco:** Caixa Econômica Federal
- **Chave PIX:** (21) 99876-5432

### **Endereço:**
- **Rua:** Avenida Copacabana, 456
- **Bairro:** Copacabana
- **Cidade:** Rio de Janeiro
- **CEP:** 22070-001
- **Estado:** RJ
- **Complemento:** Bloco B, Apto 1201

---

## 🗄️ **INSERTS SQL DIRETO NO SUPABASE**

```sql
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
```

---

## 📋 **INSTRUÇÕES DE USO:**

### **Para Formulário Web:**
1. Acesse a página de cadastro
2. Preencha os campos com os dados do **PERFIL 1** ou **PERFIL 2**
3. Teste a validação e salvamento

### **Para Banco de Dados:**
1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Cole e execute os **INSERTS SQL**
4. Verifique se os dados aparecem no dashboard

### **Para Testes:**
- **PERFIL 1 e 2**: Ativos (aparecerão na lista)
- **PERFIL 3**: Inativo (para testar filtros)
- **Dados variados**: Diferentes cidades, bairros, tipos de conta
- **Validação**: CPFs válidos para teste

---

**🎯 Use esses perfis para testar todas as funcionalidades do sistema!**
