import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          // Não está logado - redirecionar para login
          this.router.navigate(['/login']);
          return of(false);
        }

        // Verificar se é admin
        return this.authService.isAdmin().then(isAdmin => {
          if (!isAdmin) {
            // Não é admin - redirecionar para login
            this.router.navigate(['/login']);
            return false;
          }
          return true;
        });
      }),
      catchError(() => {
        // Erro - redirecionar para login
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
