import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Pessoa, PessoaFormData } from '../../models/pessoa.model';
import { IDataProvider, SearchFilters } from '../interfaces/data-provider.interface';

/**
 * Repository principal para gerenciar dados de pessoas
 * Atua como uma camada de abstração entre os serviços e os provedores de dados
 */
@Injectable({
  providedIn: 'root'
})
export class PessoaRepository {
  private dataProvider: IDataProvider | null = null;
  private pessoasSubject = new BehaviorSubject<Pessoa[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public readonly pessoas$ = this.pessoasSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();

  /**
   * Define o provedor de dados a ser usado
   */
  setDataProvider(provider: IDataProvider): void {
    this.dataProvider = provider;
    this.loadData(); // Carrega dados automaticamente ao trocar provedor
  }

  /**
   * Obtém informações do provedor atual
   */
  getProviderInfo() {
    return this.dataProvider?.getProviderInfo() || null;
  }

  /**
   * Carrega todos os dados
   */
  loadData(): Observable<Pessoa[]> {
    if (!this.dataProvider) {
      return throwError(() => new Error('Nenhum provedor de dados configurado'));
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.dataProvider.getAll().pipe(
      tap(pessoas => {
        this.pessoasSubject.next(pessoas);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Erro ao carregar dados');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém pessoa por ID
   */
  getPessoaById(id: string): Observable<Pessoa | null> {
    if (!this.dataProvider) {
      return throwError(() => new Error('Nenhum provedor de dados configurado'));
    }

    return this.dataProvider.getById(id);
  }

  /**
   * Cria nova pessoa
   */
  criarPessoa(dadosForm: PessoaFormData): Observable<Pessoa> {
    if (!this.dataProvider) {
      return throwError(() => new Error('Nenhum provedor de dados configurado'));
    }

    this.loadingSubject.next(true);

    return this.dataProvider.create(dadosForm).pipe(
      tap(novaPessoa => {
        const pessoasAtuais = this.pessoasSubject.value;
        this.pessoasSubject.next([...pessoasAtuais, novaPessoa]);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Erro ao criar pessoa');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza pessoa existente
   */
  atualizarPessoa(id: string, dados: Partial<Pessoa>): Observable<Pessoa | null> {
    if (!this.dataProvider) {
      return throwError(() => new Error('Nenhum provedor de dados configurado'));
    }

    this.loadingSubject.next(true);

    return this.dataProvider.update(id, dados).pipe(
      tap(pessoaAtualizada => {
        if (pessoaAtualizada) {
          const pessoasAtuais = this.pessoasSubject.value;
          const index = pessoasAtuais.findIndex(p => p.id === id);
          if (index !== -1) {
            pessoasAtuais[index] = pessoaAtualizada;
            this.pessoasSubject.next([...pessoasAtuais]);
          }
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Erro ao atualizar pessoa');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove pessoa
   */
  removerPessoa(id: string): Observable<boolean> {
    if (!this.dataProvider) {
      return throwError(() => new Error('Nenhum provedor de dados configurado'));
    }

    this.loadingSubject.next(true);

    return this.dataProvider.delete(id).pipe(
      tap(sucesso => {
        if (sucesso) {
          const pessoasAtuais = this.pessoasSubject.value;
          const pessoasFiltradas = pessoasAtuais.filter(p => p.id !== id);
          this.pessoasSubject.next(pessoasFiltradas);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Erro ao remover pessoa');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca pessoas com filtros
   */
  buscarPessoas(filtros: SearchFilters): Observable<Pessoa[]> {
    if (!this.dataProvider) {
      return throwError(() => new Error('Nenhum provedor de dados configurado'));
    }

    return this.dataProvider.search(filtros);
  }

  /**
   * Altera status de uma pessoa
   */
  alterarStatus(id: string, novoStatus: 'Ativo' | 'Inativo', motivo?: string): Observable<boolean> {
    const dadosAtualizacao: Partial<Pessoa> = {
      status: novoStatus,
      atualizadoEm: new Date()
    };

    if (novoStatus === 'Inativo' && motivo) {
      dadosAtualizacao.motivoInativacao = motivo;
    } else if (novoStatus === 'Ativo') {
      dadosAtualizacao.motivoInativacao = undefined;
    }

    return this.atualizarPessoa(id, dadosAtualizacao).pipe(
      map(pessoa => !!pessoa)
    );
  }

  /**
   * Sincroniza dados (se suportado pelo provedor)
   */
  sincronizar(): Observable<boolean> {
    if (!this.dataProvider || !this.dataProvider.sync) {
      return of(true); // Retorna sucesso se não há necessidade de sync
    }

    this.loadingSubject.next(true);

    return this.dataProvider.sync().pipe(
      tap(sucesso => {
        if (sucesso) {
          this.loadData().subscribe(); // Recarrega dados após sync
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Erro na sincronização');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém estatísticas dos dados
   */
  getEstatisticas(): Observable<{
    total: number;
    ativos: number;
    inativos: number;
    porBairro: Record<string, number>;
    porCidade: Record<string, number>;
  }> {
    return this.pessoas$.pipe(
      map(pessoas => {
        const stats = {
          total: pessoas.length,
          ativos: pessoas.filter(p => p.status === 'Ativo').length,
          inativos: pessoas.filter(p => p.status === 'Inativo').length,
          porBairro: {} as Record<string, number>,
          porCidade: {} as Record<string, number>
        };

        // Agrupar por bairro
        pessoas.forEach(pessoa => {
          if (pessoa.bairro) {
            stats.porBairro[pessoa.bairro] = (stats.porBairro[pessoa.bairro] || 0) + 1;
          }
        });

        // Agrupar por cidade
        pessoas.forEach(pessoa => {
          if (pessoa.cidade) {
            stats.porCidade[pessoa.cidade] = (stats.porCidade[pessoa.cidade] || 0) + 1;
          }
        });

        return stats;
      })
    );
  }

  /**
   * Obtém listas únicas para filtros
   */
  getOpcoesUnicas(): Observable<{
    bairros: string[];
    cidades: string[];
  }> {
    return this.pessoas$.pipe(
      map(pessoas => ({
        bairros: [...new Set(pessoas.map(p => p.bairro).filter(Boolean))].sort(),
        cidades: [...new Set(pessoas.map(p => p.cidade).filter(Boolean))].sort()
      }))
    );
  }

  /**
   * Limpa erro atual
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
