/**
 * Tipos relacionados às pessoas cadastradas no sistema RPromo
 */

export interface Pessoa {
  id: string;

  // Dados Pessoais
  nome_completo: string;
  cpf: string;
  rg: string;
  orgao_emissor: string;
  data_expedicao: string;
  data_nascimento: string;
  sexo: string;
  raca_cor: string;
  naturalidade: string;
  nome_pai?: string;
  nome_mae?: string;
  email: string;
  telefone: string;

  // Documentos
  titulo_eleitor: string;
  zona_eleitoral: string;
  secao_eleitoral: string;
  carteira_trabalho: string;
  data_emissao_carteira: string;
  pis: string;
  certificado_reservista?: string;

  // Dados Bancários
  tipo_conta: string;
  agencia_bancaria: string;
  numero_conta: string;
  banco: string;
  chave_pix: string;

  // Endereço
  rua: string;
  bairro: string;
  cidade: string;
  cep: string;

  // Família
  tem_filhos: boolean;
  quantidade_filhos: number;
  nomes_filhos: FilhoInfo[];

  // Status e Controle
  status: 'Ativo' | 'Inativo';
  motivo_inativacao?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface FilhoInfo {
  nome: string;
  dataNascimento: string;
}

export interface PessoaCreate extends Omit<Pessoa, 'id' | 'created_at' | 'updated_at'> {}

export interface PessoaUpdate extends Partial<Omit<Pessoa, 'id' | 'created_at' | 'updated_at'>> {}

export interface PessoaFilter {
  nome?: string;
  cpf?: string;
  email?: string;
  status?: 'Ativo' | 'Inativo';
  bairro?: string;
  cidade?: string;
}

export interface PessoaStats {
  total: number;
  ativos: number;
  inativos: number;
  comFilhos: number;
}
