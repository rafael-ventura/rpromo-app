import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CadastroPessoaComponent } from './features/cadastro/cadastro-pessoa';
import { LoginComponent } from './components/login/login.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/cadastro', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroPessoaComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'editar/:id',
    component: CadastroPessoaComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'visualizar/:id',
    component: CadastroPessoaComponent,
    canActivate: [AdminGuard]
  },
  { path: '**', redirectTo: '/cadastro' }
];
