import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Pessoa, PessoaFormData, FilhoInfo } from '../models/pessoa.model';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private pessoas: Pessoa[] = [];
  private pessoasSubject = new BehaviorSubject<Pessoa[]>([]);

  constructor() {
    this.carregarDados();
  }

  // Observável para componentes que precisam reagir a mudanças
  getPessoas(): Observable<Pessoa[]> {
    return this.pessoasSubject.asObservable();
  }

  // Buscar pessoa por ID
  getPessoaPorId(id: string): Observable<Pessoa | undefined> {
    const pessoa = this.pessoas.find(p => p.id === id);
    return of(pessoa);
  }

    // Buscar pessoas por termo
  buscarPessoas(termo: string): Observable<Pessoa[]> {
    if (!termo.trim()) {
      return this.pessoasSubject.asObservable();
    }

    const termoLower = termo.toLowerCase();
    const pessoasFiltradas = this.pessoas.filter(pessoa =>
      pessoa.nomeCompleto.toLowerCase().includes(termoLower) ||
      pessoa.cpf.includes(termo) ||
      pessoa.email.toLowerCase().includes(termoLower) ||
      pessoa.telefone.includes(termo) ||
      pessoa.bairro.toLowerCase().includes(termoLower) ||
      pessoa.cidade.toLowerCase().includes(termoLower)
    );

    return of(pessoasFiltradas);
  }

  // Buscar pessoas por filtros específicos
  buscarComFiltros(filtros: {
    termo?: string;
    status?: 'Ativo' | 'Inativo' | '';
    bairro?: string;
    cidade?: string;
  }): Observable<Pessoa[]> {
    let resultado = [...this.pessoas];

    // Filtro por termo de busca
    if (filtros.termo && filtros.termo.trim()) {
      const termoLower = filtros.termo.toLowerCase();
      resultado = resultado.filter(pessoa =>
        pessoa.nomeCompleto.toLowerCase().includes(termoLower) ||
        pessoa.cpf.includes(filtros.termo!) ||
        pessoa.email.toLowerCase().includes(termoLower) ||
        pessoa.telefone.includes(filtros.termo!)
      );
    }

    // Filtro por status
    if (filtros.status) {
      resultado = resultado.filter(pessoa => pessoa.status === filtros.status);
    }

    // Filtro por bairro
    if (filtros.bairro && filtros.bairro.trim()) {
      resultado = resultado.filter(pessoa =>
        pessoa.bairro.toLowerCase().includes(filtros.bairro!.toLowerCase())
      );
    }

    // Filtro por cidade
    if (filtros.cidade && filtros.cidade.trim()) {
      resultado = resultado.filter(pessoa =>
        pessoa.cidade.toLowerCase().includes(filtros.cidade!.toLowerCase())
      );
    }

    return of(resultado);
  }

  // Obter lista única de bairros
  getBairros(): Observable<string[]> {
    const bairros = [...new Set(this.pessoas.map(p => p.bairro).filter(b => b))].sort();
    return of(bairros);
  }

  // Obter lista única de cidades
  getCidades(): Observable<string[]> {
    const cidades = [...new Set(this.pessoas.map(p => p.cidade).filter(c => c))].sort();
    return of(cidades);
  }

  // Adicionar nova pessoa
  adicionarPessoa(dadosForm: PessoaFormData): Observable<Pessoa> {
    const novaPessoa: Pessoa = {
      id: this.gerarId(),
      timestamp: new Date(),
      ...this.converterFormParaPessoa(dadosForm),
      criadoEm: new Date(),
      status: 'Ativo'
    };

    this.pessoas.push(novaPessoa);
    this.salvarDados();
    this.pessoasSubject.next([...this.pessoas]);

    return of(novaPessoa);
  }

  // Atualizar pessoa existente
  atualizarPessoa(id: string, dadosForm: PessoaFormData): Observable<Pessoa | null> {
    const index = this.pessoas.findIndex(p => p.id === id);
    if (index === -1) {
      return of(null);
    }

    const pessoaAtualizada: Pessoa = {
      ...this.pessoas[index],
      ...this.converterFormParaPessoa(dadosForm),
      atualizadoEm: new Date()
    };

    this.pessoas[index] = pessoaAtualizada;
    this.salvarDados();
    this.pessoasSubject.next([...this.pessoas]);

    return of(pessoaAtualizada);
  }

  // Remover pessoa
  removerPessoa(id: string): Observable<boolean> {
    const index = this.pessoas.findIndex(p => p.id === id);
    if (index === -1) {
      return of(false);
    }

    this.pessoas.splice(index, 1);
    this.salvarDados();
    this.pessoasSubject.next([...this.pessoas]);

    return of(true);
  }

  // Alterar status da pessoa
  alterarStatus(id: string, novoStatus: 'Ativo' | 'Inativo', motivo?: string): Observable<boolean> {
    const pessoa = this.pessoas.find(p => p.id === id);
    if (!pessoa) {
      return of(false);
    }

    pessoa.status = novoStatus;
    pessoa.atualizadoEm = new Date();

    // Adicionar ou remover motivo conforme status
    if (novoStatus === 'Inativo' && motivo) {
      pessoa.motivoInativacao = motivo;
    } else if (novoStatus === 'Ativo') {
      pessoa.motivoInativacao = undefined;
    }
    this.salvarDados();
    this.pessoasSubject.next([...this.pessoas]);

    return of(true);
  }

  private converterFormParaPessoa(dadosForm: PessoaFormData): Omit<Pessoa, 'id' | 'timestamp' | 'criadoEm' | 'status'> {
    return {
      // Dados Pessoais
      nomeCompleto: dadosForm.dadosPessoais.nomeCompleto,
      cpf: dadosForm.dadosPessoais.cpf,
      rg: dadosForm.dadosPessoais.rg,
      orgaoEmissor: dadosForm.dadosPessoais.orgaoEmissor,
      dataExpedicao: new Date(dadosForm.dadosPessoais.dataExpedicao),
      dataNascimento: new Date(dadosForm.dadosPessoais.dataNascimento),
      sexo: dadosForm.dadosPessoais.sexo as any,
      racaCor: dadosForm.dadosPessoais.racaCor as any,
      naturalidade: dadosForm.dadosPessoais.naturalidade,
      nomePai: dadosForm.dadosPessoais.nomePai,
      nomeMae: dadosForm.dadosPessoais.nomeMae,
      email: dadosForm.dadosPessoais.email,
      telefone: dadosForm.dadosPessoais.telefone,

      // Documentos
      tituloEleitor: dadosForm.documentos.tituloEleitor,
      zonaEleitoral: dadosForm.documentos.zonaEleitoral,
      secaoEleitoral: dadosForm.documentos.secaoEleitoral,
      carteiraTrabalho: dadosForm.documentos.carteiraTrabalho,
      dataEmissaoCarteira: new Date(dadosForm.documentos.dataEmissaoCarteira),
      pis: dadosForm.documentos.pis,
      certificadoReservista: dadosForm.documentos.certificadoReservista,

      // Dados Bancários
      tipoConta: dadosForm.dadosBancarios.tipoConta as any,
      agenciaBancaria: dadosForm.dadosBancarios.agenciaBancaria,
      numeroConta: dadosForm.dadosBancarios.numeroConta,
      banco: dadosForm.dadosBancarios.banco,
      chavePix: dadosForm.dadosBancarios.chavePix,

      // Endereço
      rua: dadosForm.endereco.rua,
      bairro: dadosForm.endereco.bairro,
      cidade: dadosForm.endereco.cidade,
      cep: dadosForm.endereco.cep,

      // Família
      temFilhos: dadosForm.familia.temFilhos,
      quantidadeFilhos: dadosForm.familia.quantidadeFilhos,
      nomesFilhos: dadosForm.familia.nomesFilhos
    };
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private carregarDados(): void {
    const dadosSalvos = localStorage.getItem('rpromo_pessoas');
    if (dadosSalvos) {
      try {
        this.pessoas = JSON.parse(dadosSalvos).map((p: any) => ({
          ...p,
          timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
          dataExpedicao: new Date(p.dataExpedicao),
          dataNascimento: new Date(p.dataNascimento),
          dataEmissaoCarteira: new Date(p.dataEmissaoCarteira),
          criadoEm: new Date(p.criadoEm),
          atualizadoEm: p.atualizadoEm ? new Date(p.atualizadoEm) : undefined,
          nomesFilhos: p.nomesFilhos ? p.nomesFilhos.map((f: any) => ({
            ...f,
            dataNascimento: new Date(f.dataNascimento)
          })) : []
        }));
        this.pessoasSubject.next([...this.pessoas]);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        this.pessoas = [];
      }
    }
  }

  private salvarDados(): void {
    try {
      localStorage.setItem('rpromo_pessoas', JSON.stringify(this.pessoas));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  // Método para exportar dados (backup)
  exportarDados(): string {
    return JSON.stringify(this.pessoas, null, 2);
  }

  // Método para importar dados (restaurar backup)
  importarDados(dadosJson: string): Observable<boolean> {
    try {
      const dados = JSON.parse(dadosJson);
      this.pessoas = dados.map((p: any) => ({
        ...p,
        timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
        dataExpedicao: new Date(p.dataExpedicao),
        dataNascimento: new Date(p.dataNascimento),
        dataEmissaoCarteira: new Date(p.dataEmissaoCarteira),
        criadoEm: new Date(p.criadoEm),
        atualizadoEm: p.atualizadoEm ? new Date(p.atualizadoEm) : undefined,
        nomesFilhos: p.nomesFilhos ? p.nomesFilhos.map((f: any) => ({
          ...f,
          dataNascimento: new Date(f.dataNascimento)
        })) : []
      }));
      this.salvarDados();
      this.pessoasSubject.next([...this.pessoas]);
      return of(true);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return of(false);
    }
  }
}
