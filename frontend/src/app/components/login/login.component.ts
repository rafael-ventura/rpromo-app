import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>admin_panel_settings</mat-icon>
            Login Administrativo
          </mat-card-title>
          <mat-card-subtitle>Acesso ao Painel Rpromo</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form (ngSubmit)="onLogin()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuário</mat-label>
              <input matInput
                     type="text"
                     [(ngModel)]="username"
                     name="username"
                     required>
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput
                     [type]="hidePassword ? 'password' : 'text'"
                     [(ngModel)]="password"
                     name="password"
                     required>
              <button mat-icon-button
                      matSuffix
                      type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button
                    color="primary"
                    type="submit"
                    class="full-width login-button"
                    [disabled]="loading || !loginForm.valid">
              <mat-icon>login</mat-icon>
              {{loading ? 'Entrando...' : 'Entrar'}}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f1f3f4 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 650px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
      border-radius: 20px;
      overflow: hidden;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .full-width {
      width: 100%;
      margin-bottom: 18px;
    }

    .login-button {
      margin-top: 20px;
      height: 50px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--rpromo-primary) 0%, var(--rpromo-primary-dark) 100%);
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
      transition: all 0.3s ease;
    }

    .login-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
    }

    .login-button:disabled {
      transform: none;
      box-shadow: none;
      opacity: 0.6;
    }

    mat-card-header {
      margin-bottom: 32px;
      text-align: center;
      padding: 32px 40px 0;
    }

    mat-card-content {
      padding: 0 40px 32px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--rpromo-primary);
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    mat-card-subtitle {
      color: #666;
      font-size: 18px;
    }

    ::ng-deep .mat-mdc-form-field {
      .mat-mdc-text-field-wrapper {
        border-radius: 12px;
        background-color: #f8f9fa;
      }

      .mat-mdc-form-field-input-control {
        padding: 16px 20px;
      }

      .mdc-notched-outline {
        border-radius: 12px;
      }

      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-width: 2px;
      }

      &.mat-focused .mdc-notched-outline {
        border-color: var(--rpromo-primary);
      }
    }

            @media (max-width: 600px) {
      .login-container {
        min-height: calc(100vh - 64px);
        padding: 15px 10px;
      }

      .login-card {
        max-width: 100%;
        margin: 0;
      }

      mat-card-header {
        padding: 24px 20px 0;
        margin-bottom: 24px;
      }

      mat-card-content {
        padding: 0 20px 24px;
      }

      mat-card-title {
        font-size: 24px;
      }

      mat-card-subtitle {
        font-size: 16px;
      }

      .full-width {
        margin-bottom: 16px;
      }

      .login-button {
        margin-top: 16px;
        height: 48px;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onLogin() {
    if (!this.username || !this.password) return;

    this.loading = true;

    try {
      await this.authService.signIn(this.username, this.password);

      this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Erro no login:', error);
      this.snackBar.open(
        error.message || 'Erro ao fazer login',
        'Fechar',
        {
          duration: 5000,
          panelClass: ['error-snackbar']
        }
      );
    } finally {
      this.loading = false;
    }
  }
}
