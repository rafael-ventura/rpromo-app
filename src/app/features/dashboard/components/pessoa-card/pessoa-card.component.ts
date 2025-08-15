import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Pessoa } from '../../../../models/pessoa.model';

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
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pessoa-item">
      <div class="pessoa-avatar">
        <mat-icon>person</mat-icon>
      </div>

      <div class="pessoa-info">
        <h4>{{ pessoa.nomeCompleto }}</h4>
        <div class="pessoa-details">
          <span class="detail-item">
            <mat-icon>badge</mat-icon>
            {{ formatarCpf(pessoa.cpf) }}
          </span>
          <span class="detail-item">
            <mat-icon>email</mat-icon>
            {{ pessoa.email }}
          </span>
          <span class="detail-item">
            <mat-icon>phone</mat-icon>
            {{ formatarTelefone(pessoa.telefone) }}
          </span>
          <span class="detail-item">
            <mat-icon>location_on</mat-icon>
            {{ pessoa.bairro }}, {{ pessoa.cidade }}
          </span>
          <span class="detail-item">
            <mat-icon>calendar_today</mat-icon>
            Cadastrado em {{ formatarData(pessoa.criadoEm) }}
          </span>
          <span class="detail-item" *ngIf="pessoa.status === 'Inativo' && pessoa.motivoInativacao">
            <mat-icon>info</mat-icon>
            Motivo: {{ pessoa.motivoInativacao }}
          </span>
        </div>
      </div>

      <div class="pessoa-status">
        <mat-chip [ngClass]="'status-' + pessoa.status.toLowerCase()">
          {{ pessoa.status }}
        </mat-chip>
      </div>

      <div class="pessoa-actions">
        <button mat-icon-button
                (click)="actions.visualizar(pessoa)"
                matTooltip="Visualizar">
          <mat-icon>visibility</mat-icon>
        </button>

        <button mat-icon-button
                (click)="actions.editar(pessoa)"
                matTooltip="Editar">
          <mat-icon>edit</mat-icon>
        </button>

        <button mat-icon-button
                (click)="actions.gerarPdf(pessoa)"
                matTooltip="Gerar PDF">
          <mat-icon>picture_as_pdf</mat-icon>
        </button>

        <button mat-icon-button
                [matMenuTriggerFor]="menuAcoes"
                matTooltip="Mais ações">
          <mat-icon>more_vert</mat-icon>
        </button>

        <mat-menu #menuAcoes="matMenu">
          <button mat-menu-item
                  (click)="actions.ativar(pessoa)"
                  *ngIf="pessoa.status !== 'Ativo'">
            <mat-icon>check_circle</mat-icon>
            <span>Ativar</span>
          </button>

          <button mat-menu-item
                  (click)="actions.inativar(pessoa)"
                  *ngIf="pessoa.status !== 'Inativo'">
            <mat-icon>block</mat-icon>
            <span>Inativar</span>
          </button>

          <button mat-menu-item
                  (click)="actions.verMotivo(pessoa)"
                  *ngIf="pessoa.status === 'Inativo' && pessoa.motivoInativacao">
            <mat-icon>info</mat-icon>
            <span>Ver Motivo</span>
          </button>

          <mat-divider></mat-divider>

          <button mat-menu-item
                  (click)="actions.excluir(pessoa)"
                  class="delete-action">
            <mat-icon>delete</mat-icon>
            <span>Excluir</span>
          </button>
        </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    .pessoa-item {
      display: flex;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f8f9fa;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .pessoa-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      flex-shrink: 0;

      mat-icon {
        color: #1976d2;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .pessoa-info {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .pessoa-details {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;

      .detail-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #666;
        font-size: 14px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #999;
        }
      }
    }

    .pessoa-status {
      margin: 0 20px;

      mat-chip {
        &.status-ativo {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        &.status-inativo {
          background-color: #ffebee;
          color: #c62828;
        }
      }
    }

    .pessoa-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;

      button:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }

    .delete-action {
      color: #f44336 !important;

      mat-icon {
        color: #f44336 !important;
      }
    }

    @media (max-width: 768px) {
      .pessoa-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        padding: 16px;

        .pessoa-info {
          width: 100%;
        }

        .pessoa-details {
          flex-direction: column;
          gap: 8px;
        }

        .pessoa-status,
        .pessoa-actions {
          align-self: flex-end;
          margin: 0;
        }
      }

      .pessoa-avatar {
        margin-right: 0;
        margin-bottom: 8px;
      }
    }
  `]
})
export class PessoaCardComponent {
  @Input({ required: true }) pessoa!: Pessoa;
  @Input({ required: true }) actions!: PessoaActions;

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
}
