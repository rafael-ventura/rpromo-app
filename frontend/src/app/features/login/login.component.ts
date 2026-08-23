import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="login-page">
      <form class="login-card" (ngSubmit)="submit()">
        <div class="brand">
          <img src="logo-rpromo.png" alt="RPromo" class="brand__logo" />
          <h1 class="brand__title">Painel RPromo</h1>
          <p class="brand__subtitle">Acesso administrativo</p>
        </div>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Senha</mat-label>
          <input
            matInput
            [type]="hide() ? 'password' : 'text'"
            name="password"
            [(ngModel)]="password"
            autocomplete="current-password"
            autofocus
          />
          <button mat-icon-button matSuffix type="button" (click)="hide.set(!hide())" tabindex="-1">
            <mat-icon>{{ hide() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button mat-flat-button color="primary" type="submit" class="submit" [disabled]="!password">
          Entrar
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - var(--navbar-height, 64px));
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .login-card {
      width: 100%;
      max-width: 380px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 32px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    .brand { text-align: center; margin-bottom: 16px; }
    .brand__logo { height: 56px; width: auto; object-fit: contain; margin-bottom: 12px; }
    .brand__title { margin: 0; font-size: 1.35rem; font-weight: 700; color: var(--text); }
    .brand__subtitle { margin: 4px 0 0; color: var(--text-muted); font-size: 0.9rem; }
    .field { width: 100%; }
    .submit { height: 46px; font-weight: 600; border-radius: var(--radius-md); }
    .error { color: var(--danger); font-size: 0.85rem; margin: 0 0 4px; }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  password = '';
  readonly hide = signal(true);
  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.auth.login(this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Senha incorreta.');
      this.password = '';
    }
  }
}
