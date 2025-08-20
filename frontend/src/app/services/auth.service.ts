import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import * as bcrypt from 'bcryptjs';

export interface Usuario {
  id: string;
  username: string;
  nome_completo: string;
  email?: string;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<Usuario | null>(null);

  public user$ = this.userSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    // Verificar se já está logado (usando localStorage)
    const savedUser = localStorage.getItem('rpromo_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.userSubject.next(user);
      } catch (error) {
        localStorage.removeItem('rpromo_user');
      }
    }
  }

  /**
   * Login com username e senha
   */
  async signIn(username: string, password: string): Promise<Usuario> {
    try {
      // Buscar usuário no banco
      const { data: usuario, error } = await this.supabase
        .from('usuarios')
        .select('id, username, senha_hash, nome_completo, email, ativo')
        .eq('username', username)
        .eq('ativo', true)
        .single();

      if (error || !usuario) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      // Verificar senha
      const senhaCorreta = await bcrypt.compare(password, usuario.senha_hash);
      if (!senhaCorreta) {
        throw new Error('Senha incorreta');
      }

      // Criar objeto do usuário sem a senha
      const userLogado: Usuario = {
        id: usuario.id,
        username: usuario.username,
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        ativo: usuario.ativo
      };

      // Salvar no estado e localStorage
      this.userSubject.next(userLogado);
      localStorage.setItem('rpromo_user', JSON.stringify(userLogado));

      return userLogado;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  /**
   * Logout
   */
  async signOut(): Promise<void> {
    this.userSubject.next(null);
    localStorage.removeItem('rpromo_user');
  }

  /**
   * Verificar se está logado
   */
  get isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  /**
   * Obter usuário atual
   */
  get currentUser(): Usuario | null {
    return this.userSubject.value;
  }

  /**
   * Verificar se é admin (todos os usuários logados são admin neste caso)
   */
  async isAdmin(): Promise<boolean> {
    return this.isLoggedIn;
  }

  /**
   * Criar hash de senha (para uso administrativo)
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Criar novo usuário
   */
  async createUser(username: string, password: string, nomeCompleto: string, email?: string): Promise<Usuario> {
    try {
      const senhaHash = await this.hashPassword(password);

      const { data: usuario, error } = await this.supabase
        .from('usuarios')
        .insert({
          username,
          senha_hash: senhaHash,
          nome_completo: nomeCompleto,
          email,
          ativo: true
        })
        .select('id, username, nome_completo, email, ativo')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return usuario;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar usuário');
    }
  }
}
