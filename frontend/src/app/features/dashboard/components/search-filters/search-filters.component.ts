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
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.scss'
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
