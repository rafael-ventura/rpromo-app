import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface SearchFiltersData {
  termoBusca: string;
  filtroStatus: string;
  filtroBairro: string;
  filtroCidade: string;
}

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="filters-card">
      <mat-card-content>
        <div class="filters-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar pessoas</mat-label>
            <input matInput
                   [value]="filters.termoBusca"
                   (input)="onTermoChange($event)"
                   placeholder="Nome, CPF, email ou telefone">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [value]="filters.filtroStatus"
                        (selectionChange)="onStatusChange($event.value)">
              <mat-option value="">Todos</mat-option>
              <mat-option value="Ativo">Ativos</mat-option>
              <mat-option value="Inativo">Inativos</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Bairro</mat-label>
            <mat-select [value]="filters.filtroBairro"
                        (selectionChange)="onBairroChange($event.value)">
              <mat-option value="">Todos os bairros</mat-option>
              <mat-option *ngFor="let bairro of bairrosDisponiveis" [value]="bairro">
                {{ bairro }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Cidade</mat-label>
            <mat-select [value]="filters.filtroCidade"
                        (selectionChange)="onCidadeChange($event.value)">
              <mat-option value="">Todas as cidades</mat-option>
              <mat-option *ngFor="let cidade of cidadesDisponiveis" [value]="cidade">
                {{ cidade }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-icon-button
                  (click)="onLimparFiltros()"
                  matTooltip="Limpar filtros"
                  class="clear-button">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filters-card {
      margin-bottom: 24px;

      mat-card-content {
        padding: 20px;
      }
    }

    .filters-container {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;

      .search-field {
        flex: 2;
        min-width: 300px;
      }

      .filter-field {
        flex: 1;
        min-width: 200px;
      }

      .clear-button {
        margin-top: 8px;
        color: #666;

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }
    }

    @media (max-width: 768px) {
      .filters-container {
        flex-direction: column;

        .search-field,
        .filter-field {
          width: 100%;
          min-width: unset;
        }
      }
    }
  `]
})
export class SearchFiltersComponent {
  @Input({ required: true }) filters!: SearchFiltersData;
  @Input() bairrosDisponiveis: string[] = [];
  @Input() cidadesDisponiveis: string[] = [];

  @Output() filtersChange = new EventEmitter<SearchFiltersData>();
  @Output() limparFiltros = new EventEmitter<void>();

  onTermoChange(event: Event): void {
    const termo = (event.target as HTMLInputElement).value;
    this.emitirMudanca({ ...this.filters, termoBusca: termo });
  }

  onStatusChange(status: string): void {
    this.emitirMudanca({ ...this.filters, filtroStatus: status });
  }

  onBairroChange(bairro: string): void {
    this.emitirMudanca({ ...this.filters, filtroBairro: bairro });
  }

  onCidadeChange(cidade: string): void {
    this.emitirMudanca({ ...this.filters, filtroCidade: cidade });
  }

  onLimparFiltros(): void {
    this.limparFiltros.emit();
  }

  private emitirMudanca(novosFiltros: SearchFiltersData): void {
    this.filtersChange.emit(novosFiltros);
  }
}
