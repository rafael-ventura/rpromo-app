import { Observable } from 'rxjs';
import { Pessoa, PessoaFormData } from '../../models/pessoa.model';

/**
 * Interface abstrata para provedores de dados
 * Permite diferentes implementações (localStorage, HTTP, Google Sheets, etc.)
 */
export interface IDataProvider {
  // Operações básicas CRUD
  getAll(): Observable<Pessoa[]>;
  getById(id: string): Observable<Pessoa | null>;
  create(data: PessoaFormData): Observable<Pessoa>;
  update(id: string, data: Partial<Pessoa>): Observable<Pessoa | null>;
  delete(id: string): Observable<boolean>;

  // Operações de busca e filtro
  search(filters: SearchFilters): Observable<Pessoa[]>;

  // Operações de sincronização
  sync?(): Observable<boolean>;

  // Metadados do provedor
  getProviderInfo(): DataProviderInfo;
}

export interface SearchFilters {
  termo?: string;
  status?: 'Ativo' | 'Inativo' | '';
  bairro?: string;
  cidade?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface DataProviderInfo {
  name: string;
  version: string;
  description: string;
  supportsRealTime: boolean;
  supportsOffline: boolean;
  requiresAuth: boolean;
}

/**
 * Configuração para diferentes provedores
 */
export interface DataProviderConfig {
  type: 'localStorage' | 'http' | 'googleSheets' | 'firebase';
  config: any;
}

export interface HttpProviderConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  range: string;
  sheetName?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
