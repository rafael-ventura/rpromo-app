import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Pessoa } from '../../../../models/pessoa.model';
import { Formatadores } from '../../../../services/formatadores.util';

export interface PessoaActions {
  visualizar: (pessoa: Pessoa) => void;
  editar: (pessoa: Pessoa) => void;
  gerarPdf: (pessoa: Pessoa) => void;
  ativar: (pessoa: Pessoa) => void;
  inativar: (pessoa: Pessoa) => void;
  verMotivo: (pessoa: Pessoa) => void;
  excluir: (pessoa: Pessoa) => void;
}

@Component({
  selector: 'app-pessoa-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pessoa-card.component.html',
  styleUrl: './pessoa-card.component.scss'
})
export class PessoaCardComponent {
  @Input({ required: true }) pessoa!: Pessoa;
  @Input({ required: true }) actions!: PessoaActions;

  formatarCpf(cpf: string): string {
    return Formatadores.cpf(cpf);
  }

  formatarTelefone(telefone: string): string {
    return Formatadores.telefone(telefone);
  }

  formatarData(data: Date): string {
    return Formatadores.data(data);
  }
}
