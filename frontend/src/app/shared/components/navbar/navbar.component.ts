import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  logoError = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onImageError(event: any): void {
    console.log('Logo não encontrada, usando fallback');
    this.logoError = true;
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Navbar: Iniciando logout...');
      await this.authService.signOut();
      console.log('✅ Navbar: Logout realizado com sucesso');

      this.snackBar.open('Logout realizado com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Navegar para cadastro após logout
      this.router.navigate(['/cadastro']);
    } catch (error) {
      console.error('❌ Navbar: Erro no logout:', error);
      this.snackBar.open('Erro ao fazer logout', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
