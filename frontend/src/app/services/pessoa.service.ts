import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, switchMap } from 'rxjs';
import { Pessoa, PessoaFormData } from '../models/pessoa.model';
import { PessoaDataProvider, DataSource } from './pessoa-data.provider';

interface FiltrosBusca {
  termo?: string;
  status?: 'Ativo' | 'Inativo' | '';
  bairro?: string;
  cidade?: string;
  sexo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private pessoas: Pessoa[] = [];
  private pessoasSubject = new BehaviorSubject<Pessoa[]>([]);

  constructor(private dataProvider: PessoaDataProvider) {
    this.inicializar();
  }

  // === CONFIGURAÇÃO ===

  /**
   * Alterna entre localStorage e Supabase
   */
  setDataSource(source: DataSource): void {
    this.dataProvider.setDataSource(source);
    this.carregarDados();
  }

  getCurrentDataSource(): DataSource {
    return this.dataProvider.getCurrentDataSource();
  }

  // === MÉTODOS PÚBLICOS ===

  getPessoas(): Observable<Pessoa[]> {
    return this.pessoasSubject.asObservable();
  }

  getPessoaPorId(id: string): Observable<Pessoa | undefined> {
    const pessoa = this.pessoas.find(p => p.id === id);
    return of(pessoa);
  }

  buscarPessoas(termo: string): Observable<Pessoa[]> {
    if (!this.isTermoValido(termo)) {
      return this.pessoasSubject.asObservable();
    }

    const pessoasFiltradas = this.pessoas.filter(pessoa =>
      this.pessoaContermTermo(pessoa, termo)
    );

    return of(pessoasFiltradas);
  }

  buscarComFiltros(filtros: FiltrosBusca): Observable<Pessoa[]> {
    const resultado = this.aplicarFiltros(this.pessoas, filtros);
    return of(resultado);
  }

  getBairros(): Observable<string[]> {
    return of(this.extrairListaUnica(this.pessoas, 'bairro'));
  }

  getCidades(): Observable<string[]> {
    return of(this.extrairListaUnica(this.pessoas, 'cidade'));
  }

  adicionarPessoa(dadosForm: PessoaFormData): Observable<Pessoa> {
    return this.dataProvider.adicionar(dadosForm).pipe(
      tap(novaPessoa => {
        this.pessoas.push(novaPessoa);
        this.pessoasSubject.next([...this.pessoas]);
      })
    );
  }

  atualizarPessoa(id: string, dadosForm: PessoaFormData): Observable<Pessoa | null> {
    return this.dataProvider.atualizar(id, dadosForm).pipe(
      tap(pessoaAtualizada => {
        if (pessoaAtualizada) {
          const index = this.pessoas.findIndex(p => p.id === id);
          if (index !== -1) {
            this.pessoas[index] = pessoaAtualizada;
            this.pessoasSubject.next([...this.pessoas]);
          }
        }
      })
    );
  }

  removerPessoa(id: string): Observable<boolean> {
    return this.dataProvider.remover(id).pipe(
      tap(sucesso => {
        if (sucesso) {
          this.pessoas = this.pessoas.filter(p => p.id !== id);
          this.pessoasSubject.next([...this.pessoas]);
        }
      })
    );
  }

  alterarStatus(id: string, novoStatus: 'Ativo' | 'Inativo', motivo?: string): Observable<boolean> {
    return this.dataProvider.alterarStatus(id, novoStatus, motivo).pipe(
      tap(sucesso => {
        if (sucesso) {
          const pessoa = this.pessoas.find(p => p.id === id);
          if (pessoa) {
            pessoa.status = novoStatus;
            pessoa.atualizadoEm = new Date();

            if (novoStatus === 'Inativo' && motivo) {
              pessoa.motivoInativacao = motivo;
            } else if (novoStatus === 'Ativo') {
              pessoa.motivoInativacao = undefined;
            }

            this.pessoasSubject.next([...this.pessoas]);
          }
        }
      })
    );
  }

  exportarDados(): string {
    return JSON.stringify(this.pessoas, null, 2);
  }

  importarDados(dadosJson: string): Observable<boolean> {
    try {
      const dados = JSON.parse(dadosJson);
      this.pessoas = this.processarDadosImportados(dados);
      this.pessoasSubject.next([...this.pessoas]);
      return of(true);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return of(false);
    }
  }

  // === MÉTODOS PRIVADOS ===

  private inicializar(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    console.log('🚀 PessoaService: Iniciando carregamento de dados...');

    this.dataProvider.buscarTodas().subscribe({
      next: pessoas => {
        console.log('✅ PessoaService: Dados carregados com sucesso:', pessoas);
        this.pessoas = pessoas;
        this.pessoasSubject.next([...this.pessoas]);
      },
      error: error => {
        console.error('❌ PessoaService: Erro ao carregar dados:', error);
        this.pessoas = [];
        this.pessoasSubject.next([]);
      }
    });
  }

  private isTermoValido(termo: string): boolean {
    return Boolean(termo && termo.trim().length > 0);
  }

  private pessoaContermTermo(pessoa: Pessoa, termo: string): boolean {
    const termoLower = termo.toLowerCase();
    return (
      pessoa.nomeCompleto.toLowerCase().includes(termoLower) ||
      pessoa.cpf.includes(termo) ||
      pessoa.email.toLowerCase().includes(termoLower) ||
      pessoa.telefone.includes(termo) ||
      pessoa.bairro.toLowerCase().includes(termoLower) ||
      pessoa.cidade.toLowerCase().includes(termoLower)
    );
  }

  private aplicarFiltros(pessoas: Pessoa[], filtros: FiltrosBusca): Pessoa[] {
    return pessoas.filter(pessoa => {
      return this.aplicarFiltroTermo(pessoa, filtros.termo) &&
             this.aplicarFiltroStatus(pessoa, filtros.status) &&
             this.aplicarFiltroBairro(pessoa, filtros.bairro) &&
             this.aplicarFiltroCidade(pessoa, filtros.cidade) &&
             this.aplicarFiltroSexo(pessoa, filtros.sexo);
    });
  }

  private aplicarFiltroTermo(pessoa: Pessoa, termo?: string): boolean {
    if (!termo?.trim()) return true;
    return this.pessoaContermTermo(pessoa, termo);
  }

  private aplicarFiltroStatus(pessoa: Pessoa, status?: string): boolean {
    return !status || pessoa.status === status;
  }

  private aplicarFiltroBairro(pessoa: Pessoa, bairro?: string): boolean {
    if (!bairro?.trim()) return true;
    return pessoa.bairro.toLowerCase().includes(bairro.toLowerCase());
  }

  private aplicarFiltroCidade(pessoa: Pessoa, cidade?: string): boolean {
    if (!cidade?.trim()) return true;
    return pessoa.cidade.toLowerCase().includes(cidade.toLowerCase());
  }

  private aplicarFiltroSexo(pessoa: Pessoa, sexo?: string): boolean {
    return !sexo || pessoa.sexo === sexo;
  }

  private extrairListaUnica(pessoas: Pessoa[], campo: keyof Pessoa): string[] {
    return [...new Set(pessoas.map(p => p[campo] as string).filter(Boolean))].sort();
  }

  private processarDadosImportados(dados: any[]): Pessoa[] {
    return dados.map(p => this.normalizarPessoa(p));
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
}
