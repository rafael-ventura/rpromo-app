import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

export interface InativarDialogData {
  nomeCompleto: string;
}

@Component({
  selector: 'app-inativar-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Inativar Ficha</h2>
    <mat-dialog-content>
      <p>Você está prestes a inativar a ficha de <strong>{{ data.nomeCompleto }}</strong>.</p>
      <p>Por favor, selecione ou informe o motivo da inativação:</p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Motivo da Inativação</mat-label>
        <mat-select [(ngModel)]="motivoSelecionado" (selectionChange)="onMotivoChange()">
          <mat-option value="Abandonou o trabalho">Abandonou o trabalho</mat-option>
          <mat-option value="Comportamento inadequado">Comportamento inadequado</mat-option>
          <mat-option value="Falta de pontualidade">Falta de pontualidade</mat-option>
          <mat-option value="Desempenho insatisfatório">Desempenho insatisfatório</mat-option>
          <mat-option value="Problemas de conduta">Problemas de conduta</mat-option>
          <mat-option value="Não compareceu">Não compareceu</mat-option>
          <mat-option value="Pediu demissão">Pediu demissão</mat-option>
          <mat-option value="Outro">Outro (especificar)</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width" *ngIf="motivoSelecionado === 'Outro'">
        <mat-label>Especificar motivo</mat-label>
        <textarea matInput
                  [(ngModel)]="motivoPersonalizado"
                  placeholder="Descreva o motivo da inativação..."
                  rows="3"></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width" *ngIf="motivoSelecionado && motivoSelecionado !== 'Outro'">
        <mat-label>Observações adicionais (opcional)</mat-label>
        <textarea matInput
                  [(ngModel)]="observacoes"
                  placeholder="Adicione detalhes se necessário..."
                  rows="2"></textarea>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button
              color="warn"
              [disabled]="!motivoFinal"
              (click)="onConfirm()">
        Inativar Ficha
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      min-width: 400px;
      max-width: 500px;
    }

    p {
      margin-bottom: 16px;
    }

    strong {
      color: #1976d2;
    }
  `]
})
export class InativarDialogComponent {
  motivoSelecionado = '';
  motivoPersonalizado = '';
  observacoes = '';

  constructor(
    public dialogRef: MatDialogRef<InativarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InativarDialogData
  ) {}

  get motivoFinal(): string {
    if (this.motivoSelecionado === 'Outro') {
      return this.motivoPersonalizado.trim();
    } else if (this.motivoSelecionado) {
      return this.observacoes.trim()
        ? `${this.motivoSelecionado} - ${this.observacoes}`
        : this.motivoSelecionado;
    }
    return '';
  }

  onMotivoChange() {
    this.motivoPersonalizado = '';
    this.observacoes = '';
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (this.motivoFinal) {
      this.dialogRef.close(this.motivoFinal);
    }
  }
}
