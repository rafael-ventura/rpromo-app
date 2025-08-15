import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface DashboardStats {
  totalPessoas: number;
  pessoasAtivas: number;
  pessoasInativas: number;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stats-cards">
      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-content">
            <div class="stat-icon total">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalPessoas }}</h3>
              <p>Total de Pessoas</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-content">
            <div class="stat-icon active">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.pessoasAtivas }}</h3>
              <p>Cadastros Ativos</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-content">
            <div class="stat-icon inactive">
              <mat-icon>block</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.pessoasInativas }}</h3>
              <p>Inativos</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      mat-card-content {
        padding: 24px;
      }
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: white;
      }

      &.total {
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      }

      &.active {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      }

      &.inactive {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      }
    }

    .stat-info {
      h3 {
        margin: 0;
        font-size: 32px;
        font-weight: 700;
        color: #333;
      }

      p {
        margin: 4px 0 0 0;
        color: #666;
        font-size: 14px;
        font-weight: 500;
      }
    }

    @media (max-width: 768px) {
      .stats-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StatsCardsComponent {
  @Input({ required: true }) stats!: DashboardStats;
}
