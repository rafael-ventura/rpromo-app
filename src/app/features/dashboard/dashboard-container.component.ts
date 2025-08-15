import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { DashboardFacade } from './services/dashboard.facade';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { SearchFiltersComponent, SearchFiltersData } from './components/search-filters/search-filters.component';
import { PessoaCardComponent, PessoaActions } from './components/pessoa-card/pessoa-card.component';
import { ConfirmDialogComponent } from '../../components/dashboard/dashboard';
import { Pessoa } from '../../models/pessoa.model';

/**
 * Container Component (Smart Component)
 * Gerencia estado e lógica de negócio
 * Padrão Container/Presentational Components
 */
@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatsCardsComponent,
    SearchFiltersComponent,
    PessoaCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header do Dashboard -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>
          <mat-icon>dashboard</mat-icon>
          Dashboard - Fichas Cadastrais
        </h1>
        <p>Gerencie todas as fichas cadastrais do sistema</p>
      </div>

      <div class="header-actions">
        <button mat-raised-button color="primary" routerLink="/cadastro">
          <mat-icon>person_add</mat-icon>
          Nova Ficha
        </button>

        <button mat-stroked-button (click)="facade.exportarDados()">
          <mat-icon>file_download</mat-icon>
          Exportar
        </button>

        <button mat-stroked-button (click)="gerarRelatorio()">
          <mat-icon>picture_as_pdf</mat-icon>
          Relatório PDF
        </button>
      </div>
    </div>

    <!-- Estatísticas -->
    <app-stats-cards [stats]="facade.stats$ | async"></app-stats-cards>

    <!-- Filtros -->
    <app-search-filters
      [filters]="facade.filtros$ | async"
      [bairrosDisponiveis]="(facade.opcoesUnicas$ | async)?.bairros || []"
      [cidadesDisponiveis]="(facade.opcoesUnicas$ | async)?.cidades || []"
      (filtersChange)="onFiltersChange($event)"
      (limparFiltros)="facade.limparFiltros()">
    </app-search-filters>

    <!-- Lista de Pessoas -->
    <mat-card class="pessoas-card">
      <mat-card-header>
        <mat-card-title>
          Pessoas Cadastradas
          <span class="result-count">
            ({{ (facade.pessoasFiltradas$ | async)?.length || 0 }} resultados)
          </span>
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <!-- Loading -->
        <div *ngIf="facade.loading$ | async" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Carregando dados...</p>
        </div>

        <!-- Estado vazio -->
        <div *ngIf="!(facade.loading$ | async) && (facade.pessoasFiltradas$ | async)?.length === 0"
             class="empty-state">
          <mat-icon>person_off</mat-icon>
          <h3>Nenhuma pessoa encontrada</h3>
          <p>Tente ajustar os filtros ou criar um novo cadastro.</p>
          <button mat-raised-button color="primary" routerLink="/cadastro">
            <mat-icon>person_add</mat-icon>
            Criar Primeira Ficha
          </button>
        </div>

        <!-- Lista de pessoas -->
        <div *ngIf="!(facade.loading$ | async) && (facade.pessoasFiltradas$ | async)?.length! > 0"
             class="pessoas-list">
          <app-pessoa-card
            *ngFor="let pessoa of facade.pessoasFiltradas$ | async; trackBy: trackByPessoa"
            [pessoa]="pessoa"
            [actions]="pessoaActions">
          </app-pessoa-card>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);

      .header-content {
        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }

        p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;

        button mat-icon {
          margin-right: 8px;
        }
      }
    }

    .pessoas-card {
      mat-card-header {
        margin-bottom: 0;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 12px;

          .result-count {
            font-size: 14px;
            font-weight: 400;
            color: #666;
          }
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;

      mat-spinner {
        margin-bottom: 20px;
      }

      p {
        color: #666;
        font-size: 16px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 24px;
      }

      p {
        margin: 0 0 24px 0;
        color: #666;
        font-size: 16px;
      }
    }

    .pessoas-list {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;

        .header-actions {
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    }
  `]
})
export class DashboardContainerComponent {
  // Injeção moderna de dependências
  readonly facade = inject(DashboardFacade);
  private readonly dialog = inject(MatDialog);

  // Ações para os cards de pessoa
  readonly pessoaActions: PessoaActions = {
    visualizar: (pessoa) => this.visualizarPessoa(pessoa),
    editar: (pessoa) => this.editarPessoa(pessoa),
    gerarPdf: (pessoa) => this.facade.gerarPdfPessoa(pessoa),
    ativar: (pessoa) => this.facade.ativarPessoa(pessoa).subscribe(),
    inativar: (pessoa) => this.facade.inativarPessoa(pessoa).subscribe(),
    verMotivo: (pessoa) => this.verMotivoInativacao(pessoa),
    excluir: (pessoa) => this.confirmarExclusao(pessoa)
  };

  // ========== Event Handlers ==========

  onFiltersChange(filters: SearchFiltersData): void {
    this.facade.atualizarFiltros(filters);
  }

  gerarRelatorio(): void {
    this.facade.pessoasFiltradas$.pipe(
      // take(1) - pegar apenas o valor atual
    ).subscribe(pessoas => {
      this.facade.gerarRelatorio(pessoas || []);
    });
  }

  // ========== Ações das Pessoas ==========

  private visualizarPessoa(pessoa: Pessoa): void {
    // Navegar para visualização (implementar depois)
    console.log('Visualizar:', pessoa);
  }

  private editarPessoa(pessoa: Pessoa): void {
    // Navegar para edição (implementar depois)
    console.log('Editar:', pessoa);
  }

  private verMotivoInativacao(pessoa: Pessoa): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Motivo da Inativação',
        mensagem: `Pessoa: ${pessoa.nomeCompleto}\\n\\nMotivo: ${pessoa.motivoInativacao}`,
        textoBotaoConfirmar: 'Fechar',
        corBotaoConfirmar: 'primary',
        ocultarCancelar: true
      }
    });
  }

  private confirmarExclusao(pessoa: Pessoa): void {
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
        this.facade.removerPessoa(pessoa).subscribe();
      }
    });
  }

  // ========== Track By Functions ==========

  trackByPessoa(index: number, pessoa: Pessoa): string {
    return pessoa.id || index.toString();
  }
}
