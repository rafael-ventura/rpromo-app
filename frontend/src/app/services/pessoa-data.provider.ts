import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, switchMap, tap } from 'rxjs';
import { Pessoa, PessoaFormData } from '../models/pessoa.model';
import { SupabaseService } from './supabase.service';

export type DataSource = 'localStorage' | 'supabase';

/**
 * Provider que abstrai a fonte de dados para o PessoaService
 * Permite alternar entre localStorage e Supabase de forma transparente
 */
@Injectable({
  providedIn: 'root'
})
export class PessoaDataProvider {
  private readonly STORAGE_KEY = 'rpromo_pessoas';
  private dataSourceSubject = new BehaviorSubject<DataSource>('supabase');

  constructor(private supabaseService: SupabaseService) {}

  // === CONFIGURAÇÃO ===

  /**
   * Alterna a fonte de dados
   */
  setDataSource(source: DataSource): void {
    this.dataSourceSubject.next(source);
  }

  /**
   * Obtém a fonte de dados atual
   */
  getCurrentDataSource(): DataSource {
    return this.dataSourceSubject.value;
  }

  // === OPERAÇÕES DE DADOS ===

  /**
   * Busca todas as pessoas da fonte configurada
   */
  buscarTodas(): Observable<Pessoa[]> {
    const source = this.getCurrentDataSource();
    console.log('🎯 PessoaDataProvider: Fonte de dados atual:', source);

    if (source === 'supabase') {
      console.log('☁️ PessoaDataProvider: Buscando dados do Supabase...');
      return this.supabaseService.buscarTodasPessoas();
    } else {
      console.log('💾 PessoaDataProvider: Buscando dados do localStorage...');
      const dadosLocal = this.buscarDoLocalStorage();
      console.log('📦 PessoaDataProvider: Dados do localStorage:', dadosLocal);
      return of(dadosLocal);
    }
  }

  /**
   * Adiciona uma nova pessoa
   */
  adicionar(dadosForm: PessoaFormData): Observable<Pessoa> {
    const source = this.getCurrentDataSource();

    if (source === 'supabase') {
      return this.supabaseService.inserirPessoa(dadosForm);
    } else {
      const novaPessoa = this.criarPessoaLocal(dadosForm);
      this.salvarNoLocalStorage([...this.buscarDoLocalStorage(), novaPessoa]);
      return of(novaPessoa);
    }
  }

  /**
   * Atualiza uma pessoa existente
   */
  atualizar(id: string, dadosForm: PessoaFormData): Observable<Pessoa | null> {
    const source = this.getCurrentDataSource();

    if (source === 'supabase') {
      return this.supabaseService.atualizarPessoa(id, dadosForm);
    } else {
      const pessoas = this.buscarDoLocalStorage();
      const index = pessoas.findIndex(p => p.id === id);

      if (index === -1) return of(null);

      const pessoaAtualizada = {
        ...pessoas[index],
        ...this.converterFormParaPessoa(dadosForm),
        atualizadoEm: new Date()
      };

      pessoas[index] = pessoaAtualizada;
      this.salvarNoLocalStorage(pessoas);
      return of(pessoaAtualizada);
    }
  }

  /**
   * Altera status de uma pessoa
   */
  alterarStatus(id: string, status: 'Ativo' | 'Inativo', motivo?: string): Observable<boolean> {
    const source = this.getCurrentDataSource();

    if (source === 'supabase') {
      return this.supabaseService.alterarStatusPessoa(id, status, motivo).pipe(
        tap(() => true),
        switchMap(() => of(true))
      );
    } else {
      const pessoas = this.buscarDoLocalStorage();
      const pessoa = pessoas.find(p => p.id === id);

      if (!pessoa) return of(false);

      pessoa.status = status;
      pessoa.atualizadoEm = new Date();

      if (status === 'Inativo' && motivo) {
        pessoa.motivoInativacao = motivo;
      } else if (status === 'Ativo') {
        pessoa.motivoInativacao = undefined;
      }

      this.salvarNoLocalStorage(pessoas);
      return of(true);
    }
  }

  /**
   * Remove uma pessoa
   */
  remover(id: string): Observable<boolean> {
    const source = this.getCurrentDataSource();

    if (source === 'supabase') {
      return this.supabaseService.removerPessoa(id);
    } else {
      const pessoas = this.buscarDoLocalStorage();
      const novasPessoas = pessoas.filter(p => p.id !== id);
      this.salvarNoLocalStorage(novasPessoas);
      return of(true);
    }
  }

  // === MÉTODOS PRIVADOS - LOCAL STORAGE ===

  private buscarDoLocalStorage(): Pessoa[] {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    if (!dados) return [];

    try {
      return JSON.parse(dados).map((p: any) => this.normalizarPessoa(p));
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return [];
    }
  }

  private salvarNoLocalStorage(pessoas: Pessoa[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pessoas));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  private criarPessoaLocal(dadosForm: PessoaFormData): Pessoa {
    return {
      id: this.gerarId(),
      timestamp: new Date(),
      ...this.converterFormParaPessoa(dadosForm),
      criadoEm: new Date(),
      status: 'Ativo'
    };
  }

  private converterFormParaPessoa(dadosForm: PessoaFormData): Omit<Pessoa, 'id' | 'timestamp' | 'criadoEm' | 'status'> {
    return {
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
      tituloEleitor: dadosForm.documentos.tituloEleitor,
      zonaEleitoral: dadosForm.documentos.zonaEleitoral,
      secaoEleitoral: dadosForm.documentos.secaoEleitoral,
      carteiraTrabalho: dadosForm.documentos.carteiraTrabalho,
      dataEmissaoCarteira: new Date(dadosForm.documentos.dataEmissaoCarteira),
      pis: dadosForm.documentos.pis,
      certificadoReservista: dadosForm.documentos.certificadoReservista,
      tipoConta: dadosForm.dadosBancarios.tipoConta as any,
      agenciaBancaria: dadosForm.dadosBancarios.agenciaBancaria,
      numeroConta: dadosForm.dadosBancarios.numeroConta,
      banco: dadosForm.dadosBancarios.banco,
      chavePix: dadosForm.dadosBancarios.chavePix,
      rua: dadosForm.endereco.rua,
      bairro: dadosForm.endereco.bairro,
      cidade: dadosForm.endereco.cidade,
      cep: dadosForm.endereco.cep,
      temFilhos: dadosForm.familia.temFilhos,
      quantidadeFilhos: dadosForm.familia.quantidadeFilhos,
      nomesFilhos: dadosForm.familia.nomesFilhos
    };
  }

  private normalizarPessoa(p: any): Pessoa {
    return {
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
    };
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
