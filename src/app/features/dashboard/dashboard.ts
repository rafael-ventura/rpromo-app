import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { Pessoa } from '../../models/pessoa.model';
import { PessoaService } from '../../services/pessoa.service';
import { PdfService } from '../../services/pdf.service';
import { InativarDialogComponent } from './components/inativar-dialog/inativar-dialog.component';
import { DataSource } from '../../services/pessoa-data.provider';
import { MotivoInativacaoDialogComponent } from '../../shared/components/motivo-inativacao-dialog/motivo-inativacao-dialog.component';

interface Estatisticas {
  totalPessoas: number;
  pessoasAtivas: number;
  pessoasInativas: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  pessoas: Pessoa[] = [];
  pessoasFiltradas: Pessoa[] = [];
  carregando = true;

  termoBusca = '';
  filtroStatus = '';
  filtroBairro = '';
  filtroCidade = '';

  bairrosDisponiveis: string[] = [];
  cidadesDisponiveis: string[] = [];

  estatisticas: Estatisticas = {
    totalPessoas: 0,
    pessoasAtivas: 0,
    pessoasInativas: 0
  };

  private destroy$ = new Subject<void>();
  private buscaSubject = new Subject<string>();

  constructor(
    private pessoaService: PessoaService,
    private pdfService: PdfService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Configurar debounce para busca
    this.buscaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(termo => {
      this.realizarBusca(termo);
    });
  }

  ngOnInit() {
    this.carregarDados();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

    private carregarDados() {
    this.carregando = true;

    this.pessoaService.getPessoas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pessoas) => {
          this.pessoas = pessoas;
          this.pessoasFiltradas = [...pessoas];
          this.calcularEstatisticas();
          this.carregarFiltros();
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao carregar pessoas:', error);
          this.snackBar.open('Erro ao carregar dados', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.carregando = false;
        }
      });
  }

  private carregarFiltros() {
    // Carregar bairros únicos
    this.pessoaService.getBairros()
      .pipe(takeUntil(this.destroy$))
      .subscribe(bairros => {
        this.bairrosDisponiveis = bairros;
      });

    // Carregar cidades únicas
    this.pessoaService.getCidades()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cidades => {
        this.cidadesDisponiveis = cidades;
      });
  }

  private calcularEstatisticas() {
    this.estatisticas = {
      totalPessoas: this.pessoas.length,
      pessoasAtivas: this.pessoas.filter(p => p.status === 'Ativo').length,
      pessoasInativas: this.pessoas.filter(p => p.status === 'Inativo').length
    };
  }

  // Busca e filtros
  buscarPessoas() {
    this.buscaSubject.next(this.termoBusca);
  }

  private realizarBusca(termo: string) {
    if (!termo.trim() && !this.filtroStatus) {
      this.pessoasFiltradas = [...this.pessoas];
      return;
    }

    this.pessoaService.buscarPessoas(termo)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resultados => {
        this.pessoasFiltradas = resultados;
        this.aplicarFiltroStatus();
      });
  }

    aplicarFiltros() {
    this.pessoaService.buscarComFiltros({
      termo: this.termoBusca,
      status: this.filtroStatus as 'Ativo' | 'Inativo' | '',
      bairro: this.filtroBairro,
      cidade: this.filtroCidade
    }).pipe(takeUntil(this.destroy$))
    .subscribe(resultado => {
      this.pessoasFiltradas = resultado;
    });
  }

  private aplicarFiltroStatus() {
    if (this.filtroStatus) {
      this.pessoasFiltradas = this.pessoasFiltradas.filter(
        pessoa => pessoa.status === this.filtroStatus
      );
    }
  }

  limparFiltros() {
    this.termoBusca = '';
    this.filtroStatus = '';
    this.filtroBairro = '';
    this.filtroCidade = '';
    this.pessoasFiltradas = [...this.pessoas];
  }

    // Ações das pessoas
  ativarPessoa(pessoa: Pessoa) {
    this.pessoaService.alterarStatus(pessoa.id!, 'Ativo')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sucesso) => {
          if (sucesso) {
            const index = this.pessoas.findIndex(p => p.id === pessoa.id);
            if (index !== -1) {
              this.pessoas[index].status = 'Ativo';
              this.pessoas[index].motivoInativacao = undefined;
              this.aplicarFiltros();
              this.calcularEstatisticas();
            }

            this.snackBar.open(
              `${pessoa.nomeCompleto} foi reativado(a)`,
              'Fechar',
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          }
        },
        error: (error) => {
          console.error('Erro ao ativar pessoa:', error);
          this.snackBar.open('Erro ao ativar pessoa', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  inativarPessoa(pessoa: Pessoa) {
    const dialogRef = this.dialog.open(InativarDialogComponent, {
      width: '500px',
      data: { nomeCompleto: pessoa.nomeCompleto }
    });

    dialogRef.afterClosed().subscribe(motivo => {
      if (motivo) {
        this.pessoaService.alterarStatus(pessoa.id!, 'Inativo', motivo)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (sucesso) => {
              if (sucesso) {
                const index = this.pessoas.findIndex(p => p.id === pessoa.id);
                if (index !== -1) {
                  this.pessoas[index].status = 'Inativo';
                  this.pessoas[index].motivoInativacao = motivo;
                  this.aplicarFiltros();
                  this.calcularEstatisticas();
                }

                this.snackBar.open(
                  `${pessoa.nomeCompleto} foi inativado(a)`,
                  'Fechar',
                  { duration: 3000, panelClass: ['success-snackbar'] }
                );
              }
            },
            error: (error) => {
              console.error('Erro ao inativar pessoa:', error);
              this.snackBar.open('Erro ao inativar pessoa', 'Fechar', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  verMotivoInativacao(pessoa: Pessoa) {
    this.dialog.open(MotivoInativacaoDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        nomeCompleto: pessoa.nomeCompleto,
        motivoInativacao: pessoa.motivoInativacao,
        dataInativacao: pessoa.atualizadoEm
      }
    });
  }

  confirmarExclusao(pessoa: Pessoa) {
    const confirmacao = confirm(`Tem certeza que deseja excluir o cadastro de ${pessoa.nomeCompleto}?`);
    if (confirmacao) {
      this.excluirPessoa(pessoa);
    }
  }

  private excluirPessoa(pessoa: Pessoa) {
    this.pessoaService.removerPessoa(pessoa.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sucesso) => {
          if (sucesso) {
            this.pessoas = this.pessoas.filter(p => p.id !== pessoa.id);
            this.aplicarFiltros();
            this.calcularEstatisticas();

            this.snackBar.open(
              'Cadastro excluído com sucesso',
              'Fechar',
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          }
        },
        error: (error) => {
          console.error('Erro ao excluir pessoa:', error);
          this.snackBar.open('Erro ao excluir cadastro', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // Geração de PDFs
  gerarPdfPessoa(pessoa: Pessoa) {
    this.pdfService.gerarFichaCadastral(pessoa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfBlob) => {
          const nomeArquivo = `ficha_${pessoa.nomeCompleto.replace(/\s+/g, '_')}.pdf`;
          this.pdfService.baixarPdf(pdfBlob, nomeArquivo);

          this.snackBar.open(
            'PDF gerado com sucesso',
            'Fechar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          console.error('Erro ao gerar PDF:', error);
          this.snackBar.open('Erro ao gerar PDF', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }



  // Utilitários de formatação
  formatarCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarTelefone(telefone: string): string {
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  formatarData(data: Date): string {
    if (!data) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
  }

  private formatarDataArquivo(data: Date): string {
    return data.toISOString().split('T')[0].replace(/-/g, '');
  }

  // === FONTE DE DADOS ===

  alternarFonteDados(fonte: DataSource): void {
    this.pessoaService.setDataSource(fonte);
    const mensagem = fonte === 'supabase' ? 'Conectado ao Supabase' : 'Usando dados locais';
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    // Recarregar dados após mudança
    this.carregarDados();
  }

  getFonteDados(): DataSource {
    return this.pessoaService.getCurrentDataSource();
  }
}


