import { Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';
import { DashboardContainerComponent } from './features/dashboard/dashboard-container.component';
import { CadastroPessoaComponent } from './components/cadastro-pessoa/cadastro-pessoa';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'dashboard', component: DashboardContainerComponent },
  { path: 'cadastro', component: CadastroPessoaComponent },
  { path: 'editar/:id', component: CadastroPessoaComponent },
  { path: 'visualizar/:id', component: CadastroPessoaComponent },
  { path: '**', redirectTo: '/dashboard' }
];
