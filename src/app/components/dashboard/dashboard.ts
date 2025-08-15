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

interface Estatisticas {
  totalPessoas: number;
  pessoasAtivas: number;
  pessoasInativas: number;
  pessoasPendentes: number;
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

  estatisticas: Estatisticas = {
    totalPessoas: 0,
    pessoasAtivas: 0,
    pessoasInativas: 0,
    pessoasPendentes: 0
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

  private calcularEstatisticas() {
    this.estatisticas = {
      totalPessoas: this.pessoas.length,
      pessoasAtivas: this.pessoas.filter(p => p.status === 'Ativo').length,
      pessoasInativas: this.pessoas.filter(p => p.status === 'Inativo').length,
      pessoasPendentes: this.pessoas.filter(p => p.status === 'Pendente').length
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
    let resultado = [...this.pessoas];

    // Aplicar filtro de busca se houver termo
    if (this.termoBusca.trim()) {
      const termoLower = this.termoBusca.toLowerCase();
      resultado = resultado.filter(pessoa =>
        pessoa.nomeCompleto.toLowerCase().includes(termoLower) ||
        pessoa.cpf.includes(this.termoBusca) ||
        pessoa.email.toLowerCase().includes(termoLower) ||
        pessoa.telefone.includes(this.termoBusca)
      );
    }

    // Aplicar filtro de status
    if (this.filtroStatus) {
      resultado = resultado.filter(pessoa => pessoa.status === this.filtroStatus);
    }

    this.pessoasFiltradas = resultado;
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
    this.pessoasFiltradas = [...this.pessoas];
  }

  // Ações das pessoas
  alterarStatus(pessoa: Pessoa, novoStatus: 'Ativo' | 'Inativo' | 'Pendente') {
    this.pessoaService.alterarStatus(pessoa.id!, novoStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sucesso) => {
          if (sucesso) {
            const index = this.pessoas.findIndex(p => p.id === pessoa.id);
            if (index !== -1) {
              this.pessoas[index].status = novoStatus;
              this.aplicarFiltros();
              this.calcularEstatisticas();
            }

            this.snackBar.open(
              `Status alterado para ${novoStatus}`,
              'Fechar',
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          }
        },
        error: (error) => {
          console.error('Erro ao alterar status:', error);
          this.snackBar.open('Erro ao alterar status', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  confirmarExclusao(pessoa: Pessoa) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: `Tem certeza que deseja excluir o cadastro de ${pessoa.nomeCompleto}?`,
        textoBotaoConfirmar: 'Excluir',
        corBotaoConfirmar: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.excluirPessoa(pessoa);
      }
    });
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

  gerarRelatorio() {
    if (this.pessoasFiltradas.length === 0) {
      this.snackBar.open('Nenhuma pessoa para incluir no relatório', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.pdfService.gerarRelatorio(this.pessoasFiltradas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfBlob) => {
          const nomeArquivo = `relatorio_pessoas_${this.formatarDataArquivo(new Date())}.pdf`;
          this.pdfService.baixarPdf(pdfBlob, nomeArquivo);

          this.snackBar.open(
            'Relatório gerado com sucesso',
            'Fechar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          console.error('Erro ao gerar relatório:', error);
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  exportarDados() {
    const dados = this.pessoaService.exportarDados();
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_pessoas_${this.formatarDataArquivo(new Date())}.json`;
    link.click();

    URL.revokeObjectURL(url);

    this.snackBar.open(
      'Dados exportados com sucesso',
      'Fechar',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
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
}

// Componente de diálogo de confirmação (será criado separadamente)
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p>{{ data.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button
              [color]="data.corBotaoConfirmar || 'primary'"
              (click)="onConfirm()">
        {{ data.textoBotaoConfirmar || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
