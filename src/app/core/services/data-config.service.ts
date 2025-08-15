import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IDataProvider, DataProviderConfig } from '../interfaces/data-provider.interface';
import { LocalStorageProvider } from '../data-providers/localStorage.provider';
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
    type: 'localStorage',
    config: {}
  });

  public readonly currentProvider$ = this.currentProviderSubject.asObservable();
  public readonly config$ = this.configSubject.asObservable();

  constructor(
    private localStorageProvider: LocalStorageProvider,
    private pessoaRepository: PessoaRepository
  ) {
    // Inicializar com localStorage por padrão
    this.setProvider('localStorage', {});
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
        type: 'localStorage',
        name: 'LocalStorage',
        description: 'Armazena dados localmente no navegador',
        requiresConfig: false
      },
      {
        type: 'http',
        name: 'API REST',
        description: 'Conecta com API REST via HTTP',
        requiresConfig: true
      },
      {
        type: 'googleSheets',
        name: 'Google Sheets',
        description: 'Integra com planilhas do Google',
        requiresConfig: true
      },
      {
        type: 'firebase',
        name: 'Firebase',
        description: 'Banco de dados em tempo real do Google',
        requiresConfig: true
      }
    ];
  }

  /**
   * Valida configuração para um tipo de provedor
   */
  validateConfig(type: DataProviderConfig['type'], config: any): boolean {
    switch (type) {
      case 'localStorage':
        return true; // Não precisa de configuração

      case 'http':
        return !!(config.baseUrl && config.baseUrl.trim());

      case 'googleSheets':
        return !!(config.spreadsheetId && config.apiKey && config.range);

      case 'firebase':
        return !!(config.apiKey && config.authDomain && config.projectId);

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
      case 'localStorage':
        return this.localStorageProvider;

      case 'http':
        // TODO: Implementar HttpProvider
        console.warn('HttpProvider não implementado ainda');
        return null;

      case 'googleSheets':
        // TODO: Implementar GoogleSheetsProvider
        console.warn('GoogleSheetsProvider não implementado ainda');
        return null;

      case 'firebase':
        // TODO: Implementar FirebaseProvider
        console.warn('FirebaseProvider não implementado ainda');
        return null;

      default:
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
    this.setProvider('localStorage', {});
    this.saveConfig();
  }
}
