import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pessoa, PessoaFormData } from '../models/pessoa.model';

interface SupabasePessoa {
  id?: string;
  nome_completo: string;
  cpf: string;
  rg: string;
  orgao_emissor: string;
  data_expedicao: string;
  data_nascimento: string;
  sexo: string;
  raca_cor: string;
  naturalidade: string;
  nome_pai?: string;
  nome_mae?: string;
  email: string;
  telefone: string;
  titulo_eleitor: string;
  zona_eleitoral: string;
  secao_eleitoral: string;
  carteira_trabalho: string;
  data_emissao_carteira: string;
  pis: string;
  certificado_reservista?: string;
  tipo_conta: string;
  agencia_bancaria: string;
  numero_conta: string;
  banco: string;
  chave_pix: string;
  rua: string;
  bairro: string;
  cidade: string;
  cep: string;
  tem_filhos: boolean;
  quantidade_filhos: number;
  nomes_filhos: any[];
  status: 'Ativo' | 'Inativo';
  motivo_inativacao?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Service responsável pela abstração da conexão com Supabase
 * Foca apenas na comunicação com o banco de dados
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly TABLE_NAME = 'pessoas';

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  // === MÉTODOS PÚBLICOS ===

  /**
   * Busca todas as pessoas do banco
   */
  buscarTodasPessoas(): Observable<Pessoa[]> {
    console.log('🔍 SupabaseService: Iniciando busca de todas as pessoas...');

    return from(
      this.supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(response => {
        console.log('📡 SupabaseService: Resposta recebida:', response);

        if (response.error) {
          console.error('❌ SupabaseService: Erro na resposta:', response.error);
          throw new Error(`Erro ao buscar pessoas: ${response.error.message}`);
        }

        console.log(`✅ SupabaseService: ${response.data.length} pessoas encontradas`);
        const pessoasMapeadas = response.data.map(item => this.mapearSupabaseParaPessoa(item));
        console.log('🔄 SupabaseService: Pessoas mapeadas:', pessoasMapeadas);

        return pessoasMapeadas;
      }),
      catchError(error => {
        console.error('💥 SupabaseService: Erro no pipe:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Insere uma nova pessoa no banco
   */
  inserirPessoa(dadosForm: PessoaFormData): Observable<Pessoa> {
    const dadosSupabase = this.mapearFormParaSupabase(dadosForm);

    return from(
      this.supabase
        .from(this.TABLE_NAME)
        .insert(dadosSupabase)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Erro ao inserir pessoa: ${response.error.message}`);
        }
        return this.mapearSupabaseParaPessoa(response.data);
      }),
      catchError(error => {
        console.error('Erro no SupabaseService.inserirPessoa:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza uma pessoa existente
   */
  atualizarPessoa(id: string, dadosForm: Partial<PessoaFormData>): Observable<Pessoa> {
    const dadosSupabase = this.mapearFormParaSupabase(dadosForm as PessoaFormData);

    return from(
      this.supabase
        .from(this.TABLE_NAME)
        .update(dadosSupabase)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Erro ao atualizar pessoa: ${response.error.message}`);
        }
        return this.mapearSupabaseParaPessoa(response.data);
      }),
      catchError(error => {
        console.error('Erro no SupabaseService.atualizarPessoa:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Altera status de uma pessoa
   */
  alterarStatusPessoa(id: string, status: 'Ativo' | 'Inativo', motivo?: string): Observable<Pessoa> {
    const dadosAtualizacao: Partial<SupabasePessoa> = {
      status,
      motivo_inativacao: status === 'Inativo' ? motivo : undefined
    };

    return from(
      this.supabase
        .from(this.TABLE_NAME)
        .update(dadosAtualizacao)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Erro ao alterar status: ${response.error.message}`);
        }
        return this.mapearSupabaseParaPessoa(response.data);
      }),
      catchError(error => {
        console.error('Erro no SupabaseService.alterarStatusPessoa:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove uma pessoa do banco
   */
  removerPessoa(id: string): Observable<boolean> {
    return from(
      this.supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) {
          throw new Error(`Erro ao remover pessoa: ${response.error.message}`);
        }
        return true;
      }),
      catchError(error => {
        console.error('Erro no SupabaseService.removerPessoa:', error);
        return throwError(() => error);
      })
    );
  }

  // === MÉTODOS PRIVADOS DE MAPEAMENTO ===

  /**
   * Converte dados do Supabase para o modelo interno
   */
  private mapearSupabaseParaPessoa(data: SupabasePessoa): Pessoa {
    return {
      id: data.id!,
      timestamp: new Date(data.created_at!),
      nomeCompleto: data.nome_completo,
      cpf: data.cpf,
      rg: data.rg,
      orgaoEmissor: data.orgao_emissor,
      dataExpedicao: new Date(data.data_expedicao),
      dataNascimento: new Date(data.data_nascimento),
      sexo: data.sexo as any,
      racaCor: data.raca_cor as any,
      naturalidade: data.naturalidade,
      nomePai: data.nome_pai || '',
      nomeMae: data.nome_mae || '',
      email: data.email,
      telefone: data.telefone,
      tituloEleitor: data.titulo_eleitor,
      zonaEleitoral: data.zona_eleitoral,
      secaoEleitoral: data.secao_eleitoral,
      carteiraTrabalho: data.carteira_trabalho,
      dataEmissaoCarteira: new Date(data.data_emissao_carteira),
      pis: data.pis,
      certificadoReservista: data.certificado_reservista || '',
      tipoConta: data.tipo_conta as any,
      agenciaBancaria: data.agencia_bancaria,
      numeroConta: data.numero_conta,
      banco: data.banco,
      chavePix: data.chave_pix,
      rua: data.rua,
      bairro: data.bairro,
      cidade: data.cidade,
      cep: data.cep,
      temFilhos: data.tem_filhos,
      quantidadeFilhos: data.quantidade_filhos,
      nomesFilhos: data.nomes_filhos || [],
      status: data.status,
      motivoInativacao: data.motivo_inativacao,
      criadoEm: new Date(data.created_at!),
      atualizadoEm: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }

  /**
   * Converte dados do formulário para formato do Supabase
   */
  private mapearFormParaSupabase(dadosForm: PessoaFormData): Omit<SupabasePessoa, 'id' | 'created_at' | 'updated_at'> {
    return {
      nome_completo: dadosForm.dadosPessoais.nomeCompleto,
      cpf: dadosForm.dadosPessoais.cpf,
      rg: dadosForm.dadosPessoais.rg,
      orgao_emissor: dadosForm.dadosPessoais.orgaoEmissor,
      data_expedicao: this.formatarDataParaSupabase(dadosForm.dadosPessoais.dataExpedicao),
      data_nascimento: this.formatarDataParaSupabase(dadosForm.dadosPessoais.dataNascimento),
      sexo: dadosForm.dadosPessoais.sexo,
      raca_cor: dadosForm.dadosPessoais.racaCor,
      naturalidade: dadosForm.dadosPessoais.naturalidade,
      nome_pai: dadosForm.dadosPessoais.nomePai || undefined,
      nome_mae: dadosForm.dadosPessoais.nomeMae || undefined,
      email: dadosForm.dadosPessoais.email,
      telefone: dadosForm.dadosPessoais.telefone,
      titulo_eleitor: dadosForm.documentos.tituloEleitor,
      zona_eleitoral: dadosForm.documentos.zonaEleitoral,
      secao_eleitoral: dadosForm.documentos.secaoEleitoral,
      carteira_trabalho: dadosForm.documentos.carteiraTrabalho,
      data_emissao_carteira: this.formatarDataParaSupabase(dadosForm.documentos.dataEmissaoCarteira),
      pis: dadosForm.documentos.pis,
      certificado_reservista: dadosForm.documentos.certificadoReservista || undefined,
      tipo_conta: dadosForm.dadosBancarios.tipoConta,
      agencia_bancaria: dadosForm.dadosBancarios.agenciaBancaria,
      numero_conta: dadosForm.dadosBancarios.numeroConta,
      banco: dadosForm.dadosBancarios.banco,
      chave_pix: dadosForm.dadosBancarios.chavePix,
      rua: dadosForm.endereco.rua,
      bairro: dadosForm.endereco.bairro,
      cidade: dadosForm.endereco.cidade,
      cep: dadosForm.endereco.cep,
      tem_filhos: dadosForm.familia.temFilhos,
      quantidade_filhos: dadosForm.familia.quantidadeFilhos || 0,
      nomes_filhos: dadosForm.familia.nomesFilhos || [],
      status: 'Ativo'
    };
  }

  /**
   * Formata data para o formato aceito pelo Supabase
   */
  private formatarDataParaSupabase(data: string | Date): string {
    if (typeof data === 'string') {
      return data;
    }
    return data.toISOString().split('T')[0];
  }
}
