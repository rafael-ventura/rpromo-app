import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface MotivoInativacaoData {
  nomeCompleto: string;
  motivoInativacao: string;
  dataInativacao?: Date;
}

@Component({
  selector: 'app-motivo-inativacao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="status-icon">block</mat-icon>
        <h2 mat-dialog-title>Motivo da Inativação</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="pessoa-info">
          <div class="info-item">
            <mat-icon>person</mat-icon>
            <div class="info-text">
              <span class="label">Pessoa:</span>
              <span class="value">{{ data.nomeCompleto }}</span>
            </div>
          </div>

          <div class="info-item" *ngIf="data.dataInativacao">
            <mat-icon>event</mat-icon>
            <div class="info-text">
              <span class="label">Data da Inativação:</span>
              <span class="value">{{ formatarData(data.dataInativacao) }}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="motivo-section">
          <div class="motivo-header">
            <mat-icon>info</mat-icon>
            <h3>Motivo:</h3>
          </div>
          <div class="motivo-content">
            {{ data.motivoInativacao }}
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-raised-button
                color="primary"
                (click)="fechar()"
                class="close-button">
          <mat-icon>close</mat-icon>
          Fechar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 16px;
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      margin: -24px -24px 0;
      border-radius: 12px 12px 0 0;
    }

    .status-icon {
      color: var(--rpromo-primary);
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    h2[mat-dialog-title] {
      margin: 0;
      color: var(--rpromo-primary);
      font-size: 20px;
      font-weight: 600;
    }

    .dialog-content {
      padding: 24px 0;
    }

    .pessoa-info {
      margin-bottom: 20px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .info-item mat-icon {
      color: #666;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }

    mat-divider {
      margin: 20px 0;
    }

    .motivo-section {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 20px;
    }

    .motivo-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .motivo-header mat-icon {
      color: #856404;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .motivo-header h3 {
      margin: 0;
      color: #856404;
      font-size: 16px;
      font-weight: 600;
    }

    .motivo-content {
      color: #856404;
      font-size: 16px;
      line-height: 1.5;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      border-left: 4px solid #ffc107;
    }

    .dialog-actions {
      padding: 16px 0 0;
      justify-content: center;
    }

    .close-button {
      min-width: 120px;
      height: 44px;
      font-weight: 600;
      border-radius: 8px;
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: 300px;
      }

      .dialog-header {
        padding: 20px 16px 12px;
        margin: -24px -24px 0;
      }

      .info-item {
        padding: 8px;
      }

      .motivo-section {
        padding: 16px;
      }
    }
  `]
})
export class MotivoInativacaoDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<MotivoInativacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MotivoInativacaoData
  ) {}

  fechar(): void {
    this.dialogRef.close();
  }

  formatarData(data: Date): string {
    if (!data) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(data));
  }
}
