import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Pessoa, PessoaFormData } from '../../models/pessoa.model';
import { IDataProvider, SearchFilters, DataProviderInfo } from '../interfaces/data-provider.interface';
import { SupabaseService } from '../services/supabase.service';

/**
 * Provedor de dados para Supabase
 * Implementa todas as operações CRUD usando o Supabase
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseProvider implements IDataProvider {

  constructor(private supabaseService: SupabaseService) {}

  getProviderInfo(): DataProviderInfo {
    return {
      name: 'Supabase Provider',
      version: '1.0.0',
      description: 'Backend completo com Supabase (PostgreSQL + API)',
      supportsRealTime: true, // Supabase tem real-time
      supportsOffline: false, // Precisa de internet
      requiresAuth: false // Por enquanto sem auth
    };
  }

  getAll(): Observable<Pessoa[]> {
    return from(
      this.supabaseService.client
        .from('pessoas')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(item => this.mapSupabaseToPessoa(item));
      }),
      catchError(error => {
        console.error('Erro ao buscar pessoas:', error);
        return throwError(() => new Error('Erro ao carregar dados do servidor'));
      })
    );
  }

  getById(id: string): Observable<Pessoa | null> {
    return from(
      this.supabaseService.client
        .from('pessoas')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          if (error.code === 'PGRST116') return null; // Não encontrado
          throw error;
        }
        return data ? this.mapSupabaseToPessoa(data) : null;
      }),
      catchError(error => {
        console.error('Erro ao buscar pessoa por ID:', error);
        return of(null);
      })
    );
  }

  create(dadosForm: PessoaFormData): Observable<Pessoa> {
    const pessoaData = this.mapFormToSupabase(dadosForm);

    return from(
      this.supabaseService.client
        .from('pessoas')
        .insert([pessoaData])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapSupabaseToPessoa(data);
      }),
      catchError(error => {
        console.error('Erro ao criar pessoa:', error);
        return throwError(() => new Error('Erro ao salvar no servidor'));
      })
    );
  }

  update(id: string, dados: Partial<Pessoa>): Observable<Pessoa | null> {
    const updateData = this.mapPessoaToSupabaseUpdate(dados);

    return from(
      this.supabaseService.client
        .from('pessoas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }
        return data ? this.mapSupabaseToPessoa(data) : null;
      }),
      catchError(error => {
        console.error('Erro ao atualizar pessoa:', error);
        return throwError(() => new Error('Erro ao atualizar no servidor'));
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return from(
      this.supabaseService.client
        .from('pessoas')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      }),
      catchError(error => {
        console.error('Erro ao deletar pessoa:', error);
        return throwError(() => new Error('Erro ao excluir no servidor'));
      })
    );
  }

  search(filters: SearchFilters): Observable<Pessoa[]> {
    let query = this.supabaseService.client
      .from('pessoas')
      .select('*');

    // Filtro por termo de busca
    if (filters.termo && filters.termo.trim()) {
      const termo = filters.termo.trim();
      query = query.or(`nome_completo.ilike.%${termo}%,cpf.ilike.%${termo}%,email.ilike.%${termo}%,telefone.ilike.%${termo}%,bairro.ilike.%${termo}%,cidade.ilike.%${termo}%`);
    }

    // Filtro por status
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Filtro por bairro
    if (filters.bairro && filters.bairro.trim()) {
      query = query.ilike('bairro', `%${filters.bairro.trim()}%`);
    }

    // Filtro por cidade
    if (filters.cidade && filters.cidade.trim()) {
      query = query.ilike('cidade', `%${filters.cidade.trim()}%`);
    }

    // Filtro por data
    if (filters.dataInicio) {
      query = query.gte('created_at', filters.dataInicio.toISOString());
    }

    if (filters.dataFim) {
      query = query.lte('created_at', filters.dataFim.toISOString());
    }

    return from(query.order('created_at', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(item => this.mapSupabaseToPessoa(item));
      }),
      catchError(error => {
        console.error('Erro ao buscar com filtros:', error);
        return throwError(() => new Error('Erro na busca'));
      })
    );
  }

  // Método de sincronização (para real-time)
  sync(): Observable<boolean> {
    // Com Supabase, podemos implementar real-time subscriptions
    return of(true);
  }

  // ========== Métodos de Mapeamento ==========

  private mapFormToSupabase(dadosForm: PessoaFormData): any {
    return {
      // Dados Pessoais
      nome_completo: dadosForm.dadosPessoais.nomeCompleto,
      cpf: dadosForm.dadosPessoais.cpf,
      rg: dadosForm.dadosPessoais.rg,
      orgao_emissor: dadosForm.dadosPessoais.orgaoEmissor,
      data_expedicao: dadosForm.dadosPessoais.dataExpedicao,
      data_nascimento: dadosForm.dadosPessoais.dataNascimento,
      sexo: dadosForm.dadosPessoais.sexo,
      raca_cor: dadosForm.dadosPessoais.racaCor,
      naturalidade: dadosForm.dadosPessoais.naturalidade,
      nome_pai: dadosForm.dadosPessoais.nomePai,
      nome_mae: dadosForm.dadosPessoais.nomeMae,
      email: dadosForm.dadosPessoais.email,
      telefone: dadosForm.dadosPessoais.telefone,

      // Documentos
      titulo_eleitor: dadosForm.documentos.tituloEleitor,
      zona_eleitoral: dadosForm.documentos.zonaEleitoral,
      secao_eleitoral: dadosForm.documentos.secaoEleitoral,
      carteira_trabalho: dadosForm.documentos.carteiraTrabalho,
      data_emissao_carteira: dadosForm.documentos.dataEmissaoCarteira,
      pis: dadosForm.documentos.pis,
      certificado_reservista: dadosForm.documentos.certificadoReservista,

      // Dados Bancários
      tipo_conta: dadosForm.dadosBancarios.tipoConta,
      agencia_bancaria: dadosForm.dadosBancarios.agenciaBancaria,
      numero_conta: dadosForm.dadosBancarios.numeroConta,
      banco: dadosForm.dadosBancarios.banco,
      chave_pix: dadosForm.dadosBancarios.chavePix,

      // Endereço
      rua: dadosForm.endereco.rua,
      bairro: dadosForm.endereco.bairro,
      cidade: dadosForm.endereco.cidade,
      cep: dadosForm.endereco.cep,

      // Família
      tem_filhos: dadosForm.familia.temFilhos,
      quantidade_filhos: dadosForm.familia.quantidadeFilhos,
      nomes_filhos: dadosForm.familia.nomesFilhos,

      // Status
      status: 'Ativo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private mapSupabaseToPessoa(data: any): Pessoa {
    return {
      id: data.id,
      timestamp: new Date(data.created_at),

      // Dados Pessoais
      nomeCompleto: data.nome_completo,
      cpf: data.cpf,
      rg: data.rg,
      orgaoEmissor: data.orgao_emissor,
      dataExpedicao: new Date(data.data_expedicao),
      dataNascimento: new Date(data.data_nascimento),
      sexo: data.sexo,
      racaCor: data.raca_cor,
      naturalidade: data.naturalidade,
      nomePai: data.nome_pai,
      nomeMae: data.nome_mae,
      email: data.email,
      telefone: data.telefone,

      // Documentos
      tituloEleitor: data.titulo_eleitor,
      zonaEleitoral: data.zona_eleitoral,
      secaoEleitoral: data.secao_eleitoral,
      carteiraTrabalho: data.carteira_trabalho,
      dataEmissaoCarteira: new Date(data.data_emissao_carteira),
      pis: data.pis,
      certificadoReservista: data.certificado_reservista,

      // Dados Bancários
      tipoConta: data.tipo_conta,
      agenciaBancaria: data.agencia_bancaria,
      numeroConta: data.numero_conta,
      banco: data.banco,
      chavePix: data.chave_pix,

      // Endereço
      rua: data.rua,
      bairro: data.bairro,
      cidade: data.cidade,
      cep: data.cep,

      // Família
      temFilhos: data.tem_filhos,
      quantidadeFilhos: data.quantidade_filhos,
      nomesFilhos: data.nomes_filhos || [],

      // Metadados
      criadoEm: new Date(data.created_at),
      atualizadoEm: data.updated_at ? new Date(data.updated_at) : undefined,
      status: data.status,
      motivoInativacao: data.motivo_inativacao
    };
  }

  private mapPessoaToSupabaseUpdate(pessoa: Partial<Pessoa>): any {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Mapear apenas campos que foram fornecidos
    if (pessoa.status !== undefined) updateData.status = pessoa.status;
    if (pessoa.motivoInativacao !== undefined) updateData.motivo_inativacao = pessoa.motivoInativacao;
    if (pessoa.nomeCompleto !== undefined) updateData.nome_completo = pessoa.nomeCompleto;
    if (pessoa.email !== undefined) updateData.email = pessoa.email;
    if (pessoa.telefone !== undefined) updateData.telefone = pessoa.telefone;
    if (pessoa.bairro !== undefined) updateData.bairro = pessoa.bairro;
    if (pessoa.cidade !== undefined) updateData.cidade = pessoa.cidade;

    return updateData;
  }
}
