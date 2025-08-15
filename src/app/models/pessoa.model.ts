export interface Pessoa {
  id?: string;
  timestamp?: Date;

  // Dados Pessoais Básicos
  nomeCompleto: string;
  cpf: string;
  rg: string;
  orgaoEmissor: string;
  dataExpedicao: Date;
  dataNascimento: Date;
  sexo: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar';
  racaCor: 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena';
  naturalidade: string;
  nomePai: string;
  nomeMae: string;
  email: string;
  telefone: string;

  // Documentos
  tituloEleitor: string;
  zonaEleitoral: string;
  secaoEleitoral: string;
  carteiraTrabalho: string;
  dataEmissaoCarteira: Date;
  pis: string;
  certificadoReservista?: string;

  // Dados Bancários
  tipoConta: 'Conta-Corrente' | 'Poupança' | 'Conta Salário';
  agenciaBancaria: string;
  numeroConta: string;
  banco: string;
  chavePix: string;

  // Endereço
  rua: string;
  bairro: string;
  cidade: string;
  cep: string;

  // Família
  temFilhos: boolean;
  quantidadeFilhos?: number;
  nomesFilhos?: FilhoInfo[];

  // Documentos Digitais
  vacinaCovid?: string; // URL ou base64
  fotos?: string[]; // URLs ou base64

  // Metadados
  criadoEm: Date;
  atualizadoEm?: Date;
  status: 'Ativo' | 'Inativo' | 'Pendente';
}

export interface FilhoInfo {
  nome: string;
  dataNascimento: Date;
}

export interface PessoaFormData {
  dadosPessoais: {
    nomeCompleto: string;
    cpf: string;
    rg: string;
    orgaoEmissor: string;
    dataExpedicao: string;
    dataNascimento: string;
    sexo: string;
    racaCor: string;
    naturalidade: string;
    nomePai: string;
    nomeMae: string;
    email: string;
    telefone: string;
  };
  documentos: {
    tituloEleitor: string;
    zonaEleitoral: string;
    secaoEleitoral: string;
    carteiraTrabalho: string;
    dataEmissaoCarteira: string;
    pis: string;
    certificadoReservista: string;
  };
  dadosBancarios: {
    tipoConta: string;
    agenciaBancaria: string;
    numeroConta: string;
    banco: string;
    chavePix: string;
  };
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
  familia: {
    temFilhos: boolean;
    quantidadeFilhos: number;
    nomesFilhos: FilhoInfo[];
  };
  documentosDigitais: {
    vacinaCovid: File | null;
    fotos: File[];
  };
}

export const OPCOES_SEXO = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
  { value: 'Prefiro não informar', label: 'Prefiro não informar' }
];

export const OPCOES_RACA_COR = [
  { value: 'Branca', label: 'Branca' },
  { value: 'Preta', label: 'Preta' },
  { value: 'Parda', label: 'Parda' },
  { value: 'Amarela', label: 'Amarela' },
  { value: 'Indígena', label: 'Indígena' }
];

export const OPCOES_TIPO_CONTA = [
  { value: 'Conta-Corrente', label: 'Conta Corrente' },
  { value: 'Poupança', label: 'Poupança' },
  { value: 'Conta Salário', label: 'Conta Salário' }
];
