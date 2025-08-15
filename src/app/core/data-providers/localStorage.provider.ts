import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pessoa, PessoaFormData } from '../../models/pessoa.model';
import { IDataProvider, SearchFilters, DataProviderInfo } from '../interfaces/data-provider.interface';

/**
 * Provedor de dados para localStorage
 * Mantém compatibilidade com implementação atual
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageProvider implements IDataProvider {
  private readonly STORAGE_KEY = 'rpromo_pessoas';

  getProviderInfo(): DataProviderInfo {
    return {
      name: 'LocalStorage Provider',
      version: '1.0.0',
      description: 'Armazena dados no localStorage do navegador',
      supportsRealTime: false,
      supportsOffline: true,
      requiresAuth: false
    };
  }

  getAll(): Observable<Pessoa[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return of([]);
      }

      const pessoas = JSON.parse(data).map((p: any) => this.parseStoredPessoa(p));
      return of(pessoas);
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return throwError(() => new Error('Erro ao acessar dados locais'));
    }
  }

  getById(id: string): Observable<Pessoa | null> {
    return this.getAll().pipe(
      map(pessoas => pessoas.find(p => p.id === id) || null)
    );
  }

  create(dadosForm: PessoaFormData): Observable<Pessoa> {
    return this.getAll().pipe(
      map(pessoas => {
        const novaPessoa: Pessoa = {
          id: this.gerarId(),
          timestamp: new Date(),
          ...this.converterFormParaPessoa(dadosForm),
          criadoEm: new Date(),
          status: 'Ativo'
        };

        pessoas.push(novaPessoa);
        this.salvarDados(pessoas);
        return novaPessoa;
      })
    );
  }

  update(id: string, dados: Partial<Pessoa>): Observable<Pessoa | null> {
    return this.getAll().pipe(
      map(pessoas => {
        const index = pessoas.findIndex(p => p.id === id);
        if (index === -1) {
          return null;
        }

        pessoas[index] = { ...pessoas[index], ...dados };
        this.salvarDados(pessoas);
        return pessoas[index];
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.getAll().pipe(
      map(pessoas => {
        const index = pessoas.findIndex(p => p.id === id);
        if (index === -1) {
          return false;
        }

        pessoas.splice(index, 1);
        this.salvarDados(pessoas);
        return true;
      })
    );
  }

  search(filters: SearchFilters): Observable<Pessoa[]> {
    return this.getAll().pipe(
      map(pessoas => {
        let resultado = [...pessoas];

        // Filtro por termo de busca
        if (filters.termo && filters.termo.trim()) {
          const termoLower = filters.termo.toLowerCase();
          resultado = resultado.filter(pessoa =>
            pessoa.nomeCompleto.toLowerCase().includes(termoLower) ||
            pessoa.cpf.includes(filters.termo!) ||
            pessoa.email.toLowerCase().includes(termoLower) ||
            pessoa.telefone.includes(filters.termo!) ||
            pessoa.bairro.toLowerCase().includes(termoLower) ||
            pessoa.cidade.toLowerCase().includes(termoLower)
          );
        }

        // Filtro por status
        if (filters.status) {
          resultado = resultado.filter(pessoa => pessoa.status === filters.status);
        }

        // Filtro por bairro
        if (filters.bairro && filters.bairro.trim()) {
          resultado = resultado.filter(pessoa =>
            pessoa.bairro.toLowerCase().includes(filters.bairro!.toLowerCase())
          );
        }

        // Filtro por cidade
        if (filters.cidade && filters.cidade.trim()) {
          resultado = resultado.filter(pessoa =>
            pessoa.cidade.toLowerCase().includes(filters.cidade!.toLowerCase())
          );
        }

        // Filtro por data
        if (filters.dataInicio) {
          resultado = resultado.filter(pessoa =>
            new Date(pessoa.criadoEm) >= filters.dataInicio!
          );
        }

        if (filters.dataFim) {
          resultado = resultado.filter(pessoa =>
            new Date(pessoa.criadoEm) <= filters.dataFim!
          );
        }

        return resultado;
      })
    );
  }

  // Métodos auxiliares
  private converterFormParaPessoa(dadosForm: PessoaFormData): Omit<Pessoa, 'id' | 'timestamp' | 'criadoEm' | 'status'> {
    return {
      // Dados Pessoais
      nomeCompleto: dadosForm.dadosPessoais.nomeCompleto,
      cpf: dadosForm.dadosPessoais.cpf,
      rg: dadosForm.dadosPessoais.rg,
      orgaoEmissor: dadosForm.dadosPessoais.orgaoEmissor,
      dataExpedicao: new Date(dadosForm.dadosPessoais.dataExpedicao),
      dataNascimento: new Date(dadosForm.dadosPessoais.dataNascimento),
      sexo: dadosForm.dadosPessoais.sexo as any,
      racaCor: dadosForm.dadosPessoais.racaCor as any,
      naturalidade: dadosForm.dadosPessoais.naturalidade,
      nomePai: dadosForm.dadosPessoais.nomePai,
      nomeMae: dadosForm.dadosPessoais.nomeMae,
      email: dadosForm.dadosPessoais.email,
      telefone: dadosForm.dadosPessoais.telefone,

      // Documentos
      tituloEleitor: dadosForm.documentos.tituloEleitor,
      zonaEleitoral: dadosForm.documentos.zonaEleitoral,
      secaoEleitoral: dadosForm.documentos.secaoEleitoral,
      carteiraTrabalho: dadosForm.documentos.carteiraTrabalho,
      dataEmissaoCarteira: new Date(dadosForm.documentos.dataEmissaoCarteira),
      pis: dadosForm.documentos.pis,
      certificadoReservista: dadosForm.documentos.certificadoReservista,

      // Dados Bancários
      tipoConta: dadosForm.dadosBancarios.tipoConta as any,
      agenciaBancaria: dadosForm.dadosBancarios.agenciaBancaria,
      numeroConta: dadosForm.dadosBancarios.numeroConta,
      banco: dadosForm.dadosBancarios.banco,
      chavePix: dadosForm.dadosBancarios.chavePix,

      // Endereço
      rua: dadosForm.endereco.rua,
      bairro: dadosForm.endereco.bairro,
      cidade: dadosForm.endereco.cidade,
      cep: dadosForm.endereco.cep,

      // Família
      temFilhos: dadosForm.familia.temFilhos,
      quantidadeFilhos: dadosForm.familia.quantidadeFilhos,
      nomesFilhos: dadosForm.familia.nomesFilhos
    };
  }

  private parseStoredPessoa(p: any): Pessoa {
    return {
      ...p,
      timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
      dataExpedicao: new Date(p.dataExpedicao),
      dataNascimento: new Date(p.dataNascimento),
      dataEmissaoCarteira: new Date(p.dataEmissaoCarteira),
      criadoEm: new Date(p.criadoEm),
      atualizadoEm: p.atualizadoEm ? new Date(p.atualizadoEm) : undefined,
      nomesFilhos: p.nomesFilhos ? p.nomesFilhos.map((f: any) => ({
        ...f,
        dataNascimento: new Date(f.dataNascimento)
      })) : []
    };
  }

  private salvarDados(pessoas: Pessoa[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pessoas));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw new Error('Erro ao salvar dados locais');
    }
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Métodos específicos para localStorage
  exportarDados(): string {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data || '[]';
  }

  importarDados(dadosJson: string): Observable<boolean> {
    try {
      const dados = JSON.parse(dadosJson);
      const pessoas = dados.map((p: any) => this.parseStoredPessoa(p));
      this.salvarDados(pessoas);
      return of(true);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return throwError(() => new Error('Erro ao importar dados'));
    }
  }
}
