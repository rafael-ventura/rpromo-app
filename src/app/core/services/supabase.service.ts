import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Serviço principal do Supabase
 * Gerencia a conexão e configuração do cliente
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Retorna o cliente Supabase configurado
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Verifica se está conectado
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('pessoas').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Obtém informações da conexão
   */
  getConnectionInfo() {
    return {
      url: environment.supabase.url,
      connected: true, // Supabase é sempre "conectado"
      version: '2.x'
    };
  }
}
