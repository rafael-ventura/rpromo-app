import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Pessoa } from '../models/pessoa.model';
import { FotoService } from './foto.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private fotoService: FotoService) {}

  // Gerar PDF da ficha cadastral
  gerarFichaCadastral(pessoa: Pessoa): Observable<Blob> {
    return from(this.criarPdfFicha(pessoa));
  }

  private async criarPdfFicha(pessoa: Pessoa): Promise<Blob> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Configurar fontes
    doc.setFont('helvetica');

    // Cabeçalho
    currentY = this.adicionarCabecalho(doc, currentY, pageWidth, margin);

    // Foto da pessoa (se disponível)
    currentY = await this.adicionarFotoPessoa(doc, pessoa, currentY, margin);

    // Dados Pessoais
    currentY = this.adicionarSecao(doc, 'DADOS PESSOAIS', currentY, pageWidth, margin);
    currentY = this.adicionarCampo(doc, 'Nome Completo:', pessoa.nomeCompleto, currentY, margin);
    currentY = this.adicionarCampo(doc, 'CPF:', this.formatarCpf(pessoa.cpf), currentY, margin);
    currentY = this.adicionarCampo(doc, 'RG:', pessoa.rg, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Órgão Emissor:', pessoa.orgaoEmissor, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Data de Expedição:', this.formatarData(pessoa.dataExpedicao), currentY, margin);
    currentY = this.adicionarCampo(doc, 'Data de Nascimento:', this.formatarData(pessoa.dataNascimento), currentY, margin);
    currentY = this.adicionarCampo(doc, 'Sexo:', pessoa.sexo, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Raça/Cor:', pessoa.racaCor, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Naturalidade:', pessoa.naturalidade, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Nome do Pai:', pessoa.nomePai, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Nome da Mãe:', pessoa.nomeMae, currentY, margin);
    currentY = this.adicionarCampo(doc, 'E-mail:', pessoa.email, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Telefone:', this.formatarTelefone(pessoa.telefone), currentY, margin);

    // Verificar se precisa de nova página
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    // Documentos
    currentY = this.adicionarSecao(doc, 'DOCUMENTOS', currentY, pageWidth, margin);
    currentY = this.adicionarCampo(doc, 'Título de Eleitor:', pessoa.tituloEleitor, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Zona Eleitoral:', pessoa.zonaEleitoral, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Seção Eleitoral:', pessoa.secaoEleitoral, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Carteira de Trabalho:', pessoa.carteiraTrabalho, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Data de Emissão:', this.formatarData(pessoa.dataEmissaoCarteira), currentY, margin);
    currentY = this.adicionarCampo(doc, 'PIS:', pessoa.pis, currentY, margin);
    if (pessoa.certificadoReservista) {
      currentY = this.adicionarCampo(doc, 'Certificado de Reservista:', pessoa.certificadoReservista, currentY, margin);
    }

    // Dados Bancários
    currentY = this.adicionarSecao(doc, 'DADOS BANCÁRIOS', currentY, pageWidth, margin);
    currentY = this.adicionarCampo(doc, 'Tipo de Conta:', pessoa.tipoConta, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Banco:', pessoa.banco, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Agência:', pessoa.agenciaBancaria, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Número da Conta:', pessoa.numeroConta, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Chave PIX:', pessoa.chavePix, currentY, margin);

    // Endereço
    currentY = this.adicionarSecao(doc, 'ENDEREÇO', currentY, pageWidth, margin);
    currentY = this.adicionarCampo(doc, 'Rua:', pessoa.rua, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Bairro:', pessoa.bairro, currentY, margin);
    currentY = this.adicionarCampo(doc, 'Cidade:', pessoa.cidade, currentY, margin);
    currentY = this.adicionarCampo(doc, 'CEP:', this.formatarCep(pessoa.cep), currentY, margin);

    // Informações sobre filhos
    currentY = this.adicionarSecao(doc, 'INFORMAÇÕES FAMILIARES', currentY, pageWidth, margin);
    currentY = this.adicionarCampo(doc, 'Tem Filhos:', pessoa.temFilhos ? 'Sim' : 'Não', currentY, margin);
    if (pessoa.temFilhos && pessoa.quantidadeFilhos) {
      currentY = this.adicionarCampo(doc, 'Quantidade de Filhos:', pessoa.quantidadeFilhos.toString(), currentY, margin);
      if (pessoa.nomesFilhos && pessoa.nomesFilhos.length > 0) {
        currentY = this.adicionarCampo(doc, 'Nomes dos Filhos:', '', currentY, margin);
        pessoa.nomesFilhos.forEach(filho => {
          currentY = this.adicionarCampo(doc, '', `${filho.nome} - ${this.formatarData(filho.dataNascimento)}`, currentY, margin + 10);
        });
      }
    }

    // Rodapé
    this.adicionarRodape(doc, pageHeight, pageWidth, margin, pessoa);

    // Converter para blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  }

  private adicionarCabecalho(doc: jsPDF, currentY: number, pageWidth: number, margin: number): number {
    // Logo/Título da empresa
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA CADASTRAL', pageWidth / 2, currentY, { align: 'center' });

    currentY += 15;

    // Linha decorativa
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    return currentY + 10;
  }

  private async adicionarFotoPessoa(doc: jsPDF, pessoa: Pessoa, currentY: number, margin: number): Promise<number> {
    try {
      // Buscar foto de perfil da pessoa
      const fotos = await this.fotoService.getFotosPorPessoa(pessoa.id!).toPromise();
      const fotoPerfil = fotos?.find(f => f.categoria === 'perfil');

      if (fotoPerfil) {
        const fotoData = await this.fotoService.getFoto(fotoPerfil.id).toPromise();
        if (fotoData) {
          // Converter blob para base64
          const base64 = await this.blobToBase64(fotoData.blob);

          // Adicionar imagem no canto superior direito
          const imgWidth = 30;
          const imgHeight = 40;
          const imgX = doc.internal.pageSize.getWidth() - margin - imgWidth;

          doc.addImage(base64, 'JPEG', imgX, currentY, imgWidth, imgHeight);
        }
      }
    } catch (error) {
      console.warn('Erro ao adicionar foto ao PDF:', error);
    }

    return currentY + 50; // Espaço para a foto
  }

  private adicionarSecao(doc: jsPDF, titulo: string, currentY: number, pageWidth: number, margin: number): number {
    currentY += 10;

    // Fundo da seção
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY - 5, pageWidth - (margin * 2), 10, 'F');

    // Título da seção
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text(titulo, margin + 2, currentY + 2);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    return currentY + 15;
  }

  private adicionarCampo(doc: jsPDF, label: string, valor: string, currentY: number, margin: number): number {
    doc.setFontSize(10);

    if (label) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, currentY);

      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(label);
      doc.text(valor || 'Não informado', margin + labelWidth + 3, currentY);
    } else {
      doc.text(valor || '', margin, currentY);
    }

    return currentY + 6;
  }

  private adicionarRodape(doc: jsPDF, pageHeight: number, pageWidth: number, margin: number, pessoa: Pessoa): void {
    const rodapeY = pageHeight - 20;

    // Linha
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, rodapeY - 5, pageWidth - margin, rodapeY - 5);

    // Informações do rodapé
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${this.formatarDataHora(new Date())}`, margin, rodapeY);
    doc.text(`ID: ${pessoa.id}`, pageWidth - margin, rodapeY, { align: 'right' });

    // Status
    const statusY = rodapeY + 5;
    doc.setFont('helvetica', 'bold');
    const statusColor = pessoa.status === 'Ativo' ? [0, 150, 0] :
                       pessoa.status === 'Inativo' ? [200, 0, 0] : [200, 150, 0];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`Status: ${pessoa.status}`, pageWidth / 2, statusY, { align: 'center' });
  }

  // Métodos de formatação
  private formatarCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private formatarTelefone(telefone: string): string {
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  private formatarCep(cep: string): string {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  private formatarData(data: Date): string {
    if (!data) return 'Não informado';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
  }

  private formatarDataHora(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Gerar PDF de múltiplas pessoas (relatório)
  gerarRelatorio(pessoas: Pessoa[]): Observable<Blob> {
    return from(this.criarRelatorio(pessoas));
  }

  private async criarRelatorio(pessoas: Pessoa[]): Promise<Blob> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Cabeçalho do relatório
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE PESSOAS CADASTRADAS', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de registros: ${pessoas.length}`, pageWidth / 2, currentY, { align: 'center' });
    doc.text(`Gerado em: ${this.formatarDataHora(new Date())}`, pageWidth / 2, currentY + 5, { align: 'center' });
    currentY += 20;

    // Tabela com resumo das pessoas
    const colunas = ['Nome', 'CPF', 'E-mail', 'Status'];
    const larguraColunas = [60, 35, 60, 25];

    // Cabeçalho da tabela
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');

    let x = margin + 2;
    colunas.forEach((coluna, index) => {
      doc.text(coluna, x, currentY + 5);
      x += larguraColunas[index];
    });
    currentY += 10;

    // Dados da tabela
    doc.setFont('helvetica', 'normal');
    pessoas.forEach((pessoa, index) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin;
      }

      // Linha alternada
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
      }

      x = margin + 2;

      // Nome (truncado se muito longo)
      let nome = pessoa.nomeCompleto;
      if (nome.length > 25) nome = nome.substring(0, 22) + '...';
      doc.text(nome, x, currentY + 5);
      x += larguraColunas[0];

      // CPF
      doc.text(this.formatarCpf(pessoa.cpf), x, currentY + 5);
      x += larguraColunas[1];

      // E-mail (truncado se muito longo)
      let email = pessoa.email;
      if (email.length > 25) email = email.substring(0, 22) + '...';
      doc.text(email, x, currentY + 5);
      x += larguraColunas[2];

      // Status
      const statusColor = pessoa.status === 'Ativo' ? [0, 150, 0] :
                         pessoa.status === 'Inativo' ? [200, 0, 0] : [200, 150, 0];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(pessoa.status, x, currentY + 5);
      doc.setTextColor(0, 0, 0);

      currentY += 8;
    });

    return doc.output('blob');
  }

  // Baixar PDF
  baixarPdf(blob: Blob, nomeArquivo: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }
}
