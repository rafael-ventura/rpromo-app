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
  templateUrl: './inativar-dialog.component.html',
  styleUrl: './inativar-dialog.component.scss'
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
