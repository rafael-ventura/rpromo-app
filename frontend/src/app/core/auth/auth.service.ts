import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Front-only password gate. This is intentionally light: the password lives in
 * the bundle, so it only keeps the dashboard out of casual view. Real auth will
 * arrive with a real backend (Firebase Auth / SQL) — see the plan's "future".
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'rpromo_authenticated';
  private readonly _isAuthenticated = signal(this.readSession());

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  login(password: string): boolean {
    const ok = password === environment.adminPassword;
    if (ok) {
      sessionStorage.setItem(this.STORAGE_KEY, 'true');
      this._isAuthenticated.set(true);
    }
    return ok;
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._isAuthenticated.set(false);
  }

  private readSession(): boolean {
    return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
  }
}
