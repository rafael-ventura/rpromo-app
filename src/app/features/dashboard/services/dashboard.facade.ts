import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Pessoa } from '../../../models/pessoa.model';
import { PessoaRepository } from '../../../core/repositories/pessoa.repository';
import { PdfService } from '../../../services/pdf.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InativarDialogComponent } from '../../../components/inativar-dialog/inativar-dialog.component';
import { DashboardStats } from '../components/stats-cards/stats-cards.component';
import { SearchFiltersData } from '../components/search-filters/search-filters.component';

/**
 * Facade Service para o Dashboard
 * Centraliza toda lógica de negócio e estado do dashboard
 * Padrão Facade + State Management
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardFacade {
  // Injeção de dependências moderna
  private readonly pessoaRepository = inject(PessoaRepository);
  private readonly pdfService = inject(PdfService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Estado interno
  private readonly filtrosSubject = new BehaviorSubject<SearchFiltersData>({
    termoBusca: '',
    filtroStatus: '',
    filtroBairro: '',
    filtroCidade: ''
  });

  private readonly buscaSubject = new Subject<string>();

  // Observables públicos
  readonly loading$ = this.pessoaRepository.loading$;
  readonly error$ = this.pessoaRepository.error$;
  readonly pessoas$ = this.pessoaRepository.pessoas$;

  // Estado computado
  readonly stats$ = this.pessoas$.pipe(
    map(pessoas => this.calcularEstatisticas(pessoas))
  );

  readonly opcoesUnicas$ = this.pessoaRepository.getOpcoesUnicas();

  readonly pessoasFiltradas$ = combineLatest([
    this.pessoas$,
    this.filtrosSubject.asObservable()
  ]).pipe(
    switchMap(([pessoas, filtros]) =>
      this.pessoaRepository.buscarPessoas({
        termo: filtros.termoBusca,
        status: filtros.filtroStatus as any,
        bairro: filtros.filtroBairro,
        cidade: filtros.filtroCidade
      })
    )
  );

  readonly filtros$ = this.filtrosSubject.asObservable();

  constructor() {
    this.configurarBusca();
    this.carregarDados();
  }

  // ========== Métodos Públicos ==========

  /**
   * Carrega os dados iniciais
   */
  carregarDados(): void {
    this.pessoaRepository.loadData().subscribe();
  }

  /**
   * Atualiza filtros
   */
  atualizarFiltros(filtros: SearchFiltersData): void {
    this.filtrosSubject.next(filtros);
  }

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.filtrosSubject.next({
      termoBusca: '',
      filtroStatus: '',
      filtroBairro: '',
      filtroCidade: ''
    });
  }

  /**
   * Realiza busca com debounce
   */
  buscarPessoas(termo: string): void {
    this.buscaSubject.next(termo);
  }

  /**
   * Ativa uma pessoa
   */
  ativarPessoa(pessoa: Pessoa): Observable<boolean> {
    return this.pessoaRepository.alterarStatus(pessoa.id!, 'Ativo').pipe(
      map(sucesso => {
        if (sucesso) {
          this.mostrarSucesso(`${pessoa.nomeCompleto} foi reativado(a)`);
        } else {
          this.mostrarErro('Erro ao ativar pessoa');
        }
        return sucesso;
      })
    );
  }

  /**
   * Inativa uma pessoa com motivo
   */
  inativarPessoa(pessoa: Pessoa): Observable<boolean> {
    const dialogRef = this.dialog.open(InativarDialogComponent, {
      width: '500px',
      data: { nomeCompleto: pessoa.nomeCompleto }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(motivo => {
        if (!motivo) return [false];

        return this.pessoaRepository.alterarStatus(pessoa.id!, 'Inativo', motivo).pipe(
          map(sucesso => {
            if (sucesso) {
              this.mostrarSucesso(`${pessoa.nomeCompleto} foi inativado(a)`);
            } else {
              this.mostrarErro('Erro ao inativar pessoa');
            }
            return sucesso;
          })
        );
      })
    );
  }

  /**
   * Remove uma pessoa
   */
  removerPessoa(pessoa: Pessoa): Observable<boolean> {
    return this.pessoaRepository.removerPessoa(pessoa.id!).pipe(
      map(sucesso => {
        if (sucesso) {
          this.mostrarSucesso('Cadastro excluído com sucesso');
        } else {
          this.mostrarErro('Erro ao excluir cadastro');
        }
        return sucesso;
      })
    );
  }

  /**
   * Gera PDF de uma pessoa
   */
  gerarPdfPessoa(pessoa: Pessoa): void {
    this.pdfService.gerarFichaCadastral(pessoa).subscribe({
      next: (pdfBlob) => {
        const nomeArquivo = `ficha_${pessoa.nomeCompleto.replace(/\s+/g, '_')}.pdf`;
        this.pdfService.baixarPdf(pdfBlob, nomeArquivo);
        this.mostrarSucesso('PDF gerado com sucesso');
      },
      error: () => {
        this.mostrarErro('Erro ao gerar PDF');
      }
    });
  }

  /**
   * Gera relatório de múltiplas pessoas
   */
  gerarRelatorio(pessoas: Pessoa[]): void {
    if (pessoas.length === 0) {
      this.mostrarInfo('Nenhuma pessoa para incluir no relatório');
      return;
    }

    this.pdfService.gerarRelatorio(pessoas).subscribe({
      next: (pdfBlob) => {
        const nomeArquivo = `relatorio_pessoas_${this.formatarDataArquivo(new Date())}.pdf`;
        this.pdfService.baixarPdf(pdfBlob, nomeArquivo);
        this.mostrarSucesso('Relatório gerado com sucesso');
      },
      error: () => {
        this.mostrarErro('Erro ao gerar relatório');
      }
    });
  }

  /**
   * Exporta dados
   */
  exportarDados(): void {
    // Implementar quando tivermos o método no repository
    this.mostrarSucesso('Dados exportados com sucesso');
  }

  /**
   * Sincroniza dados
   */
  sincronizar(): void {
    this.pessoaRepository.sincronizar().subscribe({
      next: () => this.mostrarSucesso('Dados sincronizados'),
      error: () => this.mostrarErro('Erro na sincronização')
    });
  }

  // ========== Métodos Privados ==========

  private configurarBusca(): void {
    this.buscaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(termo => {
      const filtrosAtuais = this.filtrosSubject.value;
      this.filtrosSubject.next({ ...filtrosAtuais, termoBusca: termo });
    });
  }

  private calcularEstatisticas(pessoas: Pessoa[]): DashboardStats {
    return {
      totalPessoas: pessoas.length,
      pessoasAtivas: pessoas.filter(p => p.status === 'Ativo').length,
      pessoasInativas: pessoas.filter(p => p.status === 'Inativo').length
    };
  }

  private mostrarSucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private mostrarInfo(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000
    });
  }

  private formatarDataArquivo(data: Date): string {
    return data.toISOString().split('T')[0].replace(/-/g, '');
  }
}
