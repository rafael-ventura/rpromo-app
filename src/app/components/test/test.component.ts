import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div style="padding: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>check_circle</mat-icon>
            Sistema Funcionando!
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Se você está vendo esta mensagem, o Angular está rodando perfeitamente!</p>
          <button mat-raised-button color="primary">
            <mat-icon>thumb_up</mat-icon>
            Tudo OK!
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-card {
      max-width: 600px;
      margin: 0 auto;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #4caf50;
    }
    button {
      margin-top: 16px;
    }
  `]
})
export class TestComponent { }
