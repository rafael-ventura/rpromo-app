import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IDataProvider, DataProviderConfig } from '../interfaces/data-provider.interface';
import { LocalStorageProvider } from '../data-providers/localStorage.provider';
import { SupabaseProvider } from '../data-providers/supabase.provider';
import { PessoaRepository } from '../repositories/pessoa.repository';

/**
 * Serviço de configuração de dados
 * Gerencia qual provedor de dados está ativo
 * Padrão Strategy + Factory
 */
@Injectable({
  providedIn: 'root'
})
export class DataConfigService {
  private currentProviderSubject = new BehaviorSubject<IDataProvider | null>(null);
  private configSubject = new BehaviorSubject<DataProviderConfig>({
    type: 'supabase',
    config: {}
  });

  public readonly currentProvider$ = this.currentProviderSubject.asObservable();
  public readonly config$ = this.configSubject.asObservable();

  constructor(
    private localStorageProvider: LocalStorageProvider,
    private supabaseProvider: SupabaseProvider,
    private pessoaRepository: PessoaRepository
  ) {
    // Inicializar com Supabase por padrão
    this.setProvider('supabase', {});
  }

  /**
   * Define o provedor de dados ativo
   */
  setProvider(type: DataProviderConfig['type'], config: any): void {
    const provider = this.createProvider(type, config);

    if (provider) {
      this.currentProviderSubject.next(provider);
      this.configSubject.next({ type, config });

      // Configura o repository com o novo provedor
      this.pessoaRepository.setDataProvider(provider);

      console.log(`Provedor de dados alterado para: ${type}`, provider.getProviderInfo());
    } else {
      console.error(`Provedor não encontrado: ${type}`);
    }
  }

  /**
   * Obtém informações do provedor atual
   */
  getCurrentProviderInfo() {
    const provider = this.currentProviderSubject.value;
    return provider?.getProviderInfo() || null;
  }

  /**
   * Lista provedores disponíveis
   */
  getAvailableProviders(): Array<{
    type: DataProviderConfig['type'];
    name: string;
    description: string;
    requiresConfig: boolean;
  }> {
    return [
      {
        type: 'supabase',
        name: 'Supabase',
        description: 'Backend completo com PostgreSQL e API REST',
        requiresConfig: true
      },
      {
        type: 'localStorage',
        name: 'LocalStorage',
        description: 'Armazena dados localmente no navegador (desenvolvimento)',
        requiresConfig: false
      }
    ];
  }

  /**
   * Valida configuração para um tipo de provedor
   */
  validateConfig(type: DataProviderConfig['type'], config: any): boolean {
    switch (type) {
      case 'supabase':
        return true; // Configuração vem do environment

      case 'localStorage':
        return true; // Não precisa de configuração

      default:
        return false;
    }
  }

  /**
   * Testa conexão com o provedor
   */
  testConnection(): Observable<boolean> {
    const provider = this.currentProviderSubject.value;

    if (!provider) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    // Testa fazendo uma busca simples
    return new Observable(observer => {
      provider.getAll().subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Factory method para criar provedores
   */
  private createProvider(type: DataProviderConfig['type'], config: any): IDataProvider | null {
    switch (type) {
      case 'supabase':
        return this.supabaseProvider;

      case 'localStorage':
        return this.localStorageProvider;

      default:
        console.warn(`Provedor não implementado: ${type}`);
        return null;
    }
  }

  /**
   * Salva configuração no localStorage
   */
  saveConfig(): void {
    const config = this.configSubject.value;
    try {
      localStorage.setItem('rpromo_data_config', JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  }

  /**
   * Carrega configuração do localStorage
   */
  loadConfig(): void {
    try {
      const saved = localStorage.getItem('rpromo_data_config');
      if (saved) {
        const config: DataProviderConfig = JSON.parse(saved);
        this.setProvider(config.type, config.config);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      // Fallback para localStorage
      this.setProvider('localStorage', {});
    }
  }

  /**
   * Reseta para configuração padrão
   */
  resetToDefault(): void {
    this.setProvider('supabase', {});
    this.saveConfig();
  }
}
