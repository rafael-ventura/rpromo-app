import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
  expiresAt: string;
}

/** Real admin auth against the RPromo API. UI is password-only; username is fixed. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly STORAGE_KEY = 'rpromo_token';
  private readonly ADMIN_USERNAME = 'admin';

  private readonly _isAuthenticated = signal(!!this.token);
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  get token(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEY);
  }

  login(password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, {
        username: this.ADMIN_USERNAME,
        password,
      })
      .pipe(
        map(res => {
          sessionStorage.setItem(this.STORAGE_KEY, res.token);
          this._isAuthenticated.set(true);
          return true;
        }),
        catchError(() => {
          this._isAuthenticated.set(false);
          return of(false);
        }),
      );
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._isAuthenticated.set(false);
  }
}
