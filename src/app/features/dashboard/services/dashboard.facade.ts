import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Pessoa } from '../../../models/pessoa.model';
import { PessoaService } from '../../../services/pessoa.service';
import { PdfService } from '../../../services/pdf.service';
import { Formatadores } from '../../../services/formatadores.util';
import { DataSource } from '../../../services/pessoa-data.provider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InativarDialogComponent } from '../components/inativar-dialog/inativar-dialog.component';

export interface FiltrosDashboard {
  termo?: string;
  status?: 'Ativo' | 'Inativo' | '';
  bairro?: string;
  cidade?: string;
}

export interface EstatisticasDashboard {
  totalPessoas: number;
  pessoasAtivas: number;
  pessoasInativas: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardFacade {
  private filtrosSubject = new BehaviorSubject<FiltrosDashboard>({
    termo: '',
    status: '',
    bairro: '',
    cidade: ''
  });

  readonly pessoas$: Observable<Pessoa[]>;
  readonly filtros$ = this.filtrosSubject.asObservable();
  readonly pessoasFiltradas$: Observable<Pessoa[]>;
  readonly stats$: Observable<EstatisticasDashboard>;
  readonly estatisticas$: Observable<EstatisticasDashboard>;
  readonly bairros$: Observable<string[]>;
  readonly cidades$: Observable<string[]>;
  readonly opcoesUnicas$: Observable<{ bairros: string[]; cidades: string[] }>;
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private pessoaService: PessoaService,
    private pdfService: PdfService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.pessoas$ = this.pessoaService.getPessoas();
    this.pessoasFiltradas$ = this.filtros$.pipe(
      switchMap(filtros => this.pessoaService.buscarComFiltros(filtros))
    );
    this.stats$ = this.pessoas$.pipe(
      map(pessoas => this.calcularEstatisticas(pessoas))
    );
    this.estatisticas$ = this.stats$; // Alias para compatibilidade
    this.bairros$ = this.pessoaService.getBairros();
    this.cidades$ = this.pessoaService.getCidades();
    this.opcoesUnicas$ = this.pessoas$.pipe(
      map(pessoas => ({
        bairros: [...new Set(pessoas.map(p => p.bairro).filter(Boolean))].sort(),
        cidades: [...new Set(pessoas.map(p => p.cidade).filter(Boolean))].sort()
      }))
    );
  }

  // === FILTROS ===

  atualizarFiltros(filtros: FiltrosDashboard): void {
    this.filtrosSubject.next(filtros);
  }

  limparFiltros(): void {
    this.filtrosSubject.next({ termo: '', status: '', bairro: '', cidade: '' });
  }

  // === AÇÕES ===

  ativarPessoa(pessoa: Pessoa): Observable<boolean> {
    return this.pessoaService.alterarStatus(pessoa.id!, 'Ativo').pipe(
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

  inativarPessoa(pessoa: Pessoa): Observable<boolean> {
    const dialogRef = this.dialog.open(InativarDialogComponent, {
      width: '500px',
      data: { nomeCompleto: pessoa.nomeCompleto }
    });

    return dialogRef.afterClosed().pipe(
      switchMap(motivo => {
        if (!motivo) return [false];

        return this.pessoaService.alterarStatus(pessoa.id!, 'Inativo', motivo).pipe(
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

  removerPessoa(pessoa: Pessoa): Observable<boolean> {
    return this.pessoaService.removerPessoa(pessoa.id!).pipe(
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

  gerarPdfPessoa(pessoa: Pessoa): void {
    this.pdfService.gerarFichaCadastral(pessoa).subscribe({
      next: (pdfBlob) => {
        const nomeArquivo = `ficha_${pessoa.nomeCompleto.replace(/\s+/g, '_')}.pdf`;
        this.pdfService.baixarPdf(pdfBlob, nomeArquivo);
        this.mostrarSucesso('PDF gerado com sucesso');
      },
      error: () => this.mostrarErro('Erro ao gerar PDF')
    });
  }

  gerarRelatorio(pessoas: Pessoa[]): void {
    if (pessoas.length === 0) {
      this.mostrarInfo('Nenhuma pessoa para incluir no relatório');
      return;
    }

    this.pdfService.gerarRelatorio(pessoas).subscribe({
      next: (pdfBlob) => {
        const nomeArquivo = `relatorio_pessoas_${Formatadores.dataArquivo(new Date())}.pdf`;
        this.pdfService.baixarPdf(pdfBlob, nomeArquivo);
        this.mostrarSucesso('Relatório gerado com sucesso');
      },
      error: () => this.mostrarErro('Erro ao gerar relatório')
    });
  }

  exportarDados(): void {
    const dados = this.pessoaService.exportarDados();
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_pessoas_${Formatadores.dataArquivo(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.mostrarSucesso('Dados exportados com sucesso');
  }

  // === CONFIGURAÇÃO DE DADOS ===

  /**
   * Alterna entre localStorage e Supabase
   */
  alternarFonteDados(fonte: DataSource): void {
    this.pessoaService.setDataSource(fonte);
    const mensagem = fonte === 'supabase'
      ? 'Conectado ao Supabase'
      : 'Usando dados locais';
    this.mostrarSucesso(mensagem);
  }

  /**
   * Obtém a fonte de dados atual
   */
  getFonteDadosAtual(): DataSource {
    return this.pessoaService.getCurrentDataSource();
  }

  // === MÉTODOS PRIVADOS ===

  private calcularEstatisticas(pessoas: Pessoa[]): EstatisticasDashboard {
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


}
