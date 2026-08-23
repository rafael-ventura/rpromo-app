import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DoNotCallDialogData {
  name: string;
}

@Component({
  selector: 'app-do-not-call-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Não chamar novamente</h2>
    <mat-dialog-content>
      <p>Marcar <strong>{{ data.name }}</strong> para não ser chamado(a) novamente.</p>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Motivo (opcional)</mat-label>
        <textarea matInput rows="3" [(ngModel)]="reason"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-flat-button color="warn" (click)="ref.close({ reason })">Confirmar</button>
    </mat-dialog-actions>
  `,
})
export class DoNotCallDialogComponent {
  readonly ref = inject(MatDialogRef<DoNotCallDialogComponent>);
  readonly data = inject<DoNotCallDialogData>(MAT_DIALOG_DATA);
  reason = '';
}
