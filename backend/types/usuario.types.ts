/**
 * Tipos relacionados aos usuários do sistema RPromo
 */

export interface Usuario {
  id: string;
  username: string;
  nome_completo: string;
  email?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioLogin {
  username: string;
  password: string;
}

export interface UsuarioCreate {
  username: string;
  password: string;
  nome_completo: string;
  email?: string;
  ativo?: boolean;
}

export interface UsuarioUpdate {
  nome_completo?: string;
  email?: string;
  ativo?: boolean;
}

export interface AuthResponse {
  user: Usuario;
  success: boolean;
  message?: string;
}
