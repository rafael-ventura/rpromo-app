import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import jsPDF from 'jspdf';
import { Pessoa } from '../models/pessoa.model';
import { FotoService } from './foto.service';
import { Formatadores } from './formatadores.util';

interface ConfiguracaoPDF {
  orientacao: 'p' | 'l';
  unidade: 'mm' | 'pt' | 'in';
  formato: string | number[];
  margens: {
    superior: number;
    inferior: number;
    lateral: number;
  };
}

interface DimensoesPagina {
  largura: number;
  altura: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly CONFIG_DEFAULT: ConfiguracaoPDF = {
    orientacao: 'p',
    unidade: 'mm',
    formato: 'a4',
    margens: {
      superior: 20,
      inferior: 20,
      lateral: 20
    }
  };

  private readonly ESTILOS = {
    titulo: { tamanho: 20, fonte: 'helvetica', peso: 'bold' as const },
    secao: { tamanho: 12, fonte: 'helvetica', peso: 'bold' as const },
    campo: { tamanho: 10, fonte: 'helvetica', peso: 'normal' as const },
    rodape: { tamanho: 8, fonte: 'helvetica', peso: 'normal' as const }
  };

  private readonly CORES = {
    primaria: [0, 102, 204] as [number, number, number],
    secundaria: [240, 240, 240] as [number, number, number],
    texto: [0, 0, 0] as [number, number, number],
    textoSecundario: [100, 100, 100] as [number, number, number],
    linha: [200, 200, 200] as [number, number, number],
    ativo: [0, 150, 0] as [number, number, number],
    inativo: [200, 0, 0] as [number, number, number]
  };

  constructor(private fotoService: FotoService) {}

  // === MÉTODOS PÚBLICOS ===

  gerarFichaCadastral(pessoa: Pessoa): Observable<Blob> {
    return from(this.criarFichaCadastral(pessoa));
  }

  gerarRelatorio(pessoas: Pessoa[]): Observable<Blob> {
    return from(this.criarRelatorio(pessoas));
  }

  baixarPdf(blob: Blob, nomeArquivo: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }

  // === GERAÇÃO DE DOCUMENTOS ===

  private async criarFichaCadastral(pessoa: Pessoa): Promise<Blob> {
    const doc = this.criarDocumento();
    const dimensoes = this.obterDimensoesPagina(doc);
    let posicaoY = this.CONFIG_DEFAULT.margens.superior;

    posicaoY = this.adicionarCabecalhoFicha(doc, posicaoY, dimensoes);
    posicaoY = await this.adicionarFotoPessoa(doc, pessoa, posicaoY, dimensoes);

    posicaoY = this.adicionarSecoesPessoa(doc, pessoa, posicaoY, dimensoes);

    this.adicionarRodapeFicha(doc, pessoa, dimensoes);

    return doc.output('blob');
  }

  private async criarRelatorio(pessoas: Pessoa[]): Promise<Blob> {
    const doc = this.criarDocumento();
    const dimensoes = this.obterDimensoesPagina(doc);
    let posicaoY = this.CONFIG_DEFAULT.margens.superior;

    posicaoY = this.adicionarCabecalhoRelatorio(doc, pessoas.length, posicaoY, dimensoes);
    this.adicionarTabelaPessoas(doc, pessoas, posicaoY, dimensoes);

    return doc.output('blob');
  }

  // === CONFIGURAÇÃO DO DOCUMENTO ===

  private criarDocumento(): jsPDF {
    const { orientacao, unidade, formato } = this.CONFIG_DEFAULT;
    const doc = new jsPDF(orientacao, unidade, formato);
    doc.setFont('helvetica');
    return doc;
  }

  private obterDimensoesPagina(doc: jsPDF): DimensoesPagina {
    return {
      largura: doc.internal.pageSize.getWidth(),
      altura: doc.internal.pageSize.getHeight()
    };
  }

  private verificarQuebraPagina(doc: jsPDF, posicaoY: number, espacoNecessario: number): number {
    const dimensoes = this.obterDimensoesPagina(doc);
    const espacoDisponivel = dimensoes.altura - this.CONFIG_DEFAULT.margens.inferior;

    if (posicaoY + espacoNecessario > espacoDisponivel) {
      doc.addPage();
      return this.CONFIG_DEFAULT.margens.superior;
    }

    return posicaoY;
  }

  // === CABEÇALHOS ===

  private adicionarCabecalhoFicha(doc: jsPDF, posicaoY: number, dimensoes: DimensoesPagina): number {
    this.aplicarEstilo(doc, this.ESTILOS.titulo);
    doc.setTextColor(...this.CORES.primaria);

    const titulo = 'FICHA CADASTRAL';
    doc.text(titulo, dimensoes.largura / 2, posicaoY, { align: 'center' });

    posicaoY += 15;
    this.adicionarLinha(doc, posicaoY, dimensoes);

    return posicaoY + 10;
  }

  private adicionarCabecalhoRelatorio(doc: jsPDF, totalPessoas: number, posicaoY: number, dimensoes: DimensoesPagina): number {
    this.aplicarEstilo(doc, this.ESTILOS.titulo);
    doc.setTextColor(...this.CORES.primaria);

    doc.text('RELATÓRIO DE PESSOAS CADASTRADAS', dimensoes.largura / 2, posicaoY, { align: 'center' });
    posicaoY += 10;

    this.aplicarEstilo(doc, this.ESTILOS.campo);
    doc.setTextColor(...this.CORES.texto);

    doc.text(`Total de registros: ${totalPessoas}`, dimensoes.largura / 2, posicaoY, { align: 'center' });
    doc.text(`Gerado em: ${Formatadores.dataHora(new Date())}`, dimensoes.largura / 2, posicaoY + 5, { align: 'center' });

    return posicaoY + 20;
  }

  // === SEÇÕES DA FICHA ===

  private adicionarSecoesPessoa(doc: jsPDF, pessoa: Pessoa, posicaoY: number, dimensoes: DimensoesPagina): number {
    const secoes = [
      { titulo: 'DADOS PESSOAIS', dados: this.obterDadosPessoais(pessoa) },
      { titulo: 'DOCUMENTOS', dados: this.obterDocumentos(pessoa) },
      { titulo: 'DADOS BANCÁRIOS', dados: this.obterDadosBancarios(pessoa) },
      { titulo: 'ENDEREÇO', dados: this.obterEndereco(pessoa) },
      { titulo: 'INFORMAÇÕES FAMILIARES', dados: this.obterInformacoesFamiliares(pessoa) }
    ];

    for (const secao of secoes) {
      posicaoY = this.verificarQuebraPagina(doc, posicaoY, 60);
      posicaoY = this.adicionarSecao(doc, secao.titulo, secao.dados, posicaoY, dimensoes);
    }

    return posicaoY;
  }

  private adicionarSecao(
    doc: jsPDF,
    titulo: string,
    dados: Array<{ label: string; valor: string }>,
    posicaoY: number,
    dimensoes: DimensoesPagina
  ): number {
    posicaoY += 10;

    // Fundo da seção
    doc.setFillColor(...this.CORES.secundaria);
    doc.rect(this.CONFIG_DEFAULT.margens.lateral, posicaoY - 5, dimensoes.largura - (this.CONFIG_DEFAULT.margens.lateral * 2), 10, 'F');

    // Título da seção
    this.aplicarEstilo(doc, this.ESTILOS.secao);
    doc.setTextColor(...this.CORES.primaria);
    doc.text(titulo, this.CONFIG_DEFAULT.margens.lateral + 2, posicaoY + 2);

    posicaoY += 15;

    // Campos da seção
    for (const item of dados) {
      posicaoY = this.adicionarCampo(doc, item.label, item.valor, posicaoY);
    }

    return posicaoY;
  }

  private adicionarCampo(doc: jsPDF, label: string, valor: string, posicaoY: number): number {
    this.aplicarEstilo(doc, this.ESTILOS.campo);
    doc.setTextColor(...this.CORES.texto);

    if (label) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, this.CONFIG_DEFAULT.margens.lateral, posicaoY);

      doc.setFont('helvetica', 'normal');
      const larguraLabel = doc.getTextWidth(label);
      doc.text(valor || 'Não informado', this.CONFIG_DEFAULT.margens.lateral + larguraLabel + 3, posicaoY);
    } else {
      doc.text(valor || '', this.CONFIG_DEFAULT.margens.lateral, posicaoY);
    }

    return posicaoY + 6;
  }

  // === FOTO ===

  private async adicionarFotoPessoa(doc: jsPDF, pessoa: Pessoa, posicaoY: number, dimensoes: DimensoesPagina): Promise<number> {
    try {
      const fotos = await this.fotoService.getFotosPorPessoa(pessoa.id!).toPromise();
      const fotoPerfil = fotos?.find(f => f.categoria === 'perfil');

      if (fotoPerfil) {
        const fotoData = await this.fotoService.getFoto(fotoPerfil.id).toPromise();
        if (fotoData) {
          const base64 = await this.converterBlobParaBase64(fotoData.blob);
          this.posicionarFoto(doc, base64, dimensoes);
        }
      }
    } catch (error) {
      console.warn('Erro ao adicionar foto ao PDF:', error);
    }

    return posicaoY + 50;
  }

  private posicionarFoto(doc: jsPDF, base64: string, dimensoes: DimensoesPagina): void {
    const foto = {
      largura: 30,
      altura: 40,
      x: dimensoes.largura - this.CONFIG_DEFAULT.margens.lateral - 30,
      y: this.CONFIG_DEFAULT.margens.superior
    };

    doc.addImage(base64, 'JPEG', foto.x, foto.y, foto.largura, foto.altura);
  }

  // === TABELA DO RELATÓRIO ===

  private adicionarTabelaPessoas(doc: jsPDF, pessoas: Pessoa[], posicaoY: number, dimensoes: DimensoesPagina): void {
    const configuracaoTabela = this.obterConfiguracaoTabela(dimensoes);

    posicaoY = this.adicionarCabecalhoTabela(doc, configuracaoTabela, posicaoY, dimensoes);
    this.adicionarLinhasTabela(doc, pessoas, configuracaoTabela, posicaoY, dimensoes);
  }

  private obterConfiguracaoTabela(dimensoes: DimensoesPagina) {
    const larguraDisponivel = dimensoes.largura - (this.CONFIG_DEFAULT.margens.lateral * 2);
    return {
      colunas: ['Nome', 'CPF', 'E-mail', 'Status'],
      larguras: [
        larguraDisponivel * 0.35, // Nome
        larguraDisponivel * 0.20, // CPF
        larguraDisponivel * 0.30, // E-mail
        larguraDisponivel * 0.15  // Status
      ]
    };
  }

  private adicionarCabecalhoTabela(doc: jsPDF, config: any, posicaoY: number, dimensoes: DimensoesPagina): number {
    this.aplicarEstilo(doc, this.ESTILOS.campo);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(...this.CORES.secundaria);
    doc.rect(this.CONFIG_DEFAULT.margens.lateral, posicaoY, dimensoes.largura - (this.CONFIG_DEFAULT.margens.lateral * 2), 8, 'F');

    let x = this.CONFIG_DEFAULT.margens.lateral + 2;
    config.colunas.forEach((coluna: string, index: number) => {
      doc.text(coluna, x, posicaoY + 5);
      x += config.larguras[index];
    });

    return posicaoY + 10;
  }

  private adicionarLinhasTabela(doc: jsPDF, pessoas: Pessoa[], config: any, posicaoY: number, dimensoes: DimensoesPagina): void {
    this.aplicarEstilo(doc, this.ESTILOS.campo);
    doc.setFont('helvetica', 'normal');

    pessoas.forEach((pessoa, index) => {
      posicaoY = this.verificarQuebraPagina(doc, posicaoY, 10);

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(this.CONFIG_DEFAULT.margens.lateral, posicaoY, dimensoes.largura - (this.CONFIG_DEFAULT.margens.lateral * 2), 8, 'F');
      }

      this.adicionarDadosLinha(doc, pessoa, config, posicaoY);
      posicaoY += 8;
    });
  }

  private adicionarDadosLinha(doc: jsPDF, pessoa: Pessoa, config: any, posicaoY: number): void {
    let x = this.CONFIG_DEFAULT.margens.lateral + 2;

    // Nome
    const nome = this.truncarTexto(pessoa.nomeCompleto, 25);
    doc.setTextColor(...this.CORES.texto);
    doc.text(nome, x, posicaoY + 5);
    x += config.larguras[0];

          // CPF
      doc.text(Formatadores.cpf(pessoa.cpf), x, posicaoY + 5);
    x += config.larguras[1];

    // E-mail
    const email = this.truncarTexto(pessoa.email, 25);
    doc.text(email, x, posicaoY + 5);
    x += config.larguras[2];

    // Status
    const corStatus = pessoa.status === 'Ativo' ? this.CORES.ativo : this.CORES.inativo;
    doc.setTextColor(...corStatus);
    doc.text(pessoa.status, x, posicaoY + 5);
  }

  // === RODAPÉ ===

  private adicionarRodapeFicha(doc: jsPDF, pessoa: Pessoa, dimensoes: DimensoesPagina): void {
    const rodapeY = dimensoes.altura - this.CONFIG_DEFAULT.margens.inferior;

    this.adicionarLinha(doc, rodapeY - 5, dimensoes);

    this.aplicarEstilo(doc, this.ESTILOS.rodape);
    doc.setTextColor(...this.CORES.textoSecundario);

    doc.text(`Gerado em: ${Formatadores.dataHora(new Date())}`, this.CONFIG_DEFAULT.margens.lateral, rodapeY);
    doc.text(`ID: ${pessoa.id}`, dimensoes.largura - this.CONFIG_DEFAULT.margens.lateral, rodapeY, { align: 'right' });

    // Status
    const statusY = rodapeY + 5;
    doc.setFont('helvetica', 'bold');
    const corStatus = pessoa.status === 'Ativo' ? this.CORES.ativo : this.CORES.inativo;
    doc.setTextColor(...corStatus);
    doc.text(`Status: ${pessoa.status}`, dimensoes.largura / 2, statusY, { align: 'center' });
  }

  // === UTILITÁRIOS DE FORMATAÇÃO ===

  private aplicarEstilo(doc: jsPDF, estilo: any): void {
    doc.setFontSize(estilo.tamanho);
    doc.setFont(estilo.fonte, estilo.peso);
  }

  private adicionarLinha(doc: jsPDF, posicaoY: number, dimensoes: DimensoesPagina): void {
    doc.setDrawColor(...this.CORES.primaria);
    doc.setLineWidth(0.5);
    doc.line(this.CONFIG_DEFAULT.margens.lateral, posicaoY, dimensoes.largura - this.CONFIG_DEFAULT.margens.lateral, posicaoY);
  }

  private truncarTexto(texto: string, tamanhoMaximo: number): string {
    return texto.length > tamanhoMaximo ? texto.substring(0, tamanhoMaximo - 3) + '...' : texto;
  }

  private async converterBlobParaBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }



  // === EXTRATORES DE DADOS ===

  private obterDadosPessoais(pessoa: Pessoa) {
    return [
      { label: 'Nome Completo:', valor: pessoa.nomeCompleto },
      { label: 'CPF:', valor: Formatadores.cpf(pessoa.cpf) },
      { label: 'RG:', valor: pessoa.rg },
      { label: 'Órgão Emissor:', valor: pessoa.orgaoEmissor },
      { label: 'Data de Expedição:', valor: Formatadores.data(pessoa.dataExpedicao) },
      { label: 'Data de Nascimento:', valor: Formatadores.data(pessoa.dataNascimento) },
      { label: 'Sexo:', valor: pessoa.sexo },
      { label: 'Raça/Cor:', valor: pessoa.racaCor },
      { label: 'Naturalidade:', valor: pessoa.naturalidade },
      { label: 'Nome do Pai:', valor: pessoa.nomePai },
      { label: 'Nome da Mãe:', valor: pessoa.nomeMae },
      { label: 'E-mail:', valor: pessoa.email },
      { label: 'Telefone:', valor: Formatadores.telefone(pessoa.telefone) }
    ];
  }

  private obterDocumentos(pessoa: Pessoa) {
    const documentos = [
      { label: 'Título de Eleitor:', valor: pessoa.tituloEleitor },
      { label: 'Zona Eleitoral:', valor: pessoa.zonaEleitoral },
      { label: 'Seção Eleitoral:', valor: pessoa.secaoEleitoral },
      { label: 'Carteira de Trabalho:', valor: pessoa.carteiraTrabalho },
      { label: 'Data de Emissão:', valor: Formatadores.data(pessoa.dataEmissaoCarteira) },
      { label: 'PIS:', valor: pessoa.pis }
    ];

    if (pessoa.certificadoReservista) {
      documentos.push({ label: 'Certificado de Reservista:', valor: pessoa.certificadoReservista });
    }

    return documentos;
  }

  private obterDadosBancarios(pessoa: Pessoa) {
    return [
      { label: 'Tipo de Conta:', valor: pessoa.tipoConta },
      { label: 'Banco:', valor: pessoa.banco },
      { label: 'Agência:', valor: pessoa.agenciaBancaria },
      { label: 'Número da Conta:', valor: pessoa.numeroConta },
      { label: 'Chave PIX:', valor: pessoa.chavePix }
    ];
  }

  private obterEndereco(pessoa: Pessoa) {
    return [
      { label: 'Rua:', valor: pessoa.rua },
      { label: 'Bairro:', valor: pessoa.bairro },
      { label: 'Cidade:', valor: pessoa.cidade },
      { label: 'CEP:', valor: Formatadores.cep(pessoa.cep) }
    ];
  }

  private obterInformacoesFamiliares(pessoa: Pessoa) {
    const informacoes = [
      { label: 'Tem Filhos:', valor: pessoa.temFilhos ? 'Sim' : 'Não' }
    ];

    if (pessoa.temFilhos && pessoa.quantidadeFilhos) {
      informacoes.push({ label: 'Quantidade de Filhos:', valor: pessoa.quantidadeFilhos.toString() });

      if (pessoa.nomesFilhos && pessoa.nomesFilhos.length > 0) {
        informacoes.push({ label: 'Nomes dos Filhos:', valor: '' });
        pessoa.nomesFilhos.forEach(filho => {
          informacoes.push({
            label: '',
            valor: `${filho.nome} - ${Formatadores.data(filho.dataNascimento)}`
          });
        });
      }
    }

    return informacoes;
  }
}
