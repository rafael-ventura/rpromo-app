import { Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CadastroPessoaComponent } from './components/cadastro-pessoa/cadastro-pessoa';

export const routes: Routes = [
  { path: '', redirectTo: '/test', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'cadastro', component: CadastroPessoaComponent },
  { path: 'editar/:id', component: CadastroPessoaComponent },
  { path: 'visualizar/:id', component: CadastroPessoaComponent },
  { path: '**', redirectTo: '/test' }
];
