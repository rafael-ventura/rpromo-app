import * as bcrypt from 'bcryptjs';

/**
 * Utilitário para criar usuários no sistema
 * Use este arquivo para gerar hashes de senha e SQLs para novos usuários
 */

export class UserCreator {
  /**
   * Gera hash bcrypt para uma senha
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Gera SQL para inserir um novo usuário
   */
  static async generateUserSQL(
    username: string,
    password: string,
    nomeCompleto: string,
    email?: string
  ): Promise<string> {
    const hash = await this.hashPassword(password);

    return `
INSERT INTO public.usuarios (username, senha_hash, nome_completo, email)
VALUES ('${username}', '${hash}', '${nomeCompleto}', '${email || ''}')
ON CONFLICT (username) DO UPDATE SET
  senha_hash = EXCLUDED.senha_hash,
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email;`;
  }

  /**
   * Exemplo de uso:
   *
   * const sql = await UserCreator.generateUserSQL(
   *   'novouser',
   *   'senha123',
   *   'Novo Usuário',
   *   'novo@email.com'
   * );
   * console.log(sql);
   */
}

// Usuários padrão do sistema:
// Username: admin | Senha: admin123
// Username: teste | Senha: teste123
// Username: usuario | Senha: 123456
