import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import {
  Person,
  accountTypeLabel,
  ageFromBirthDate,
  raceColorLabel,
  sexLabel,
} from '../models/person.model';
import { formatters } from '../utils/formatters';

interface Field {
  label: string;
  value: string;
}
interface Section {
  title: string;
  fields: Field[];
}

const MARGIN = 20;
const BRAND: [number, number, number] = [220, 53, 69];
const MUTED: [number, number, number] = [120, 120, 120];
const TEXT: [number, number, number] = [20, 20, 20];

/** Generates a one-person registration sheet (ficha) as a downloadable PDF. */
@Injectable({ providedIn: 'root' })
export class PdfService {
  download(person: Person): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = MARGIN;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...BRAND);
    doc.text('FICHA CADASTRAL', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 10;

    for (const section of this.sections(person)) {
      y = this.ensureSpace(doc, y, 20);
      y = this.renderSection(doc, section, y, pageWidth);
    }

    // Footer
    const footerY = pageHeight - MARGIN;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Gerado em: ${formatters.dateTime(new Date().toISOString())}`, MARGIN, footerY);
    doc.text(`ID: ${person.id}`, pageWidth - MARGIN, footerY, { align: 'right' });

    doc.save(`ficha_${person.fullName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  }

  private renderSection(doc: jsPDF, section: Section, y: number, pageWidth: number): number {
    doc.setFillColor(242, 242, 242);
    doc.rect(MARGIN, y - 5, pageWidth - MARGIN * 2, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BRAND);
    doc.text(section.title, MARGIN + 2, y + 1);
    y += 12;

    doc.setFontSize(10);
    for (const field of section.fields) {
      y = this.ensureSpace(doc, y, 8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT);
      doc.text(field.label, MARGIN, y);
      const labelWidth = doc.getTextWidth(field.label);
      doc.setFont('helvetica', 'normal');
      doc.text(field.value || '—', MARGIN + labelWidth + 2, y);
      y += 6;
    }
    return y + 4;
  }

  private ensureSpace(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > doc.internal.pageSize.getHeight() - MARGIN) {
      doc.addPage();
      return MARGIN;
    }
    return y;
  }

  private sections(p: Person): Section[] {
    const age = ageFromBirthDate(p.birthDate);
    const sections: Section[] = [
      {
        title: 'DADOS PESSOAIS',
        fields: [
          { label: 'Nome:', value: p.fullName },
          { label: 'CPF:', value: formatters.cpf(p.cpf) },
          { label: 'RG:', value: p.rg },
          { label: 'Órgão emissor:', value: p.issuingAgency },
          { label: 'Nascimento:', value: `${formatters.date(p.birthDate)}${age != null ? ` (${age} anos)` : ''}` },
          { label: 'Sexo:', value: sexLabel(p.sex) },
          { label: 'Raça/Cor:', value: raceColorLabel(p.raceColor) },
          { label: 'Naturalidade:', value: p.birthplace },
          { label: 'Nome do pai:', value: p.fatherName },
          { label: 'Nome da mãe:', value: p.motherName },
          { label: 'E-mail:', value: p.email },
          { label: 'Telefone:', value: formatters.phone(p.phone) },
        ],
      },
      {
        title: 'ENDEREÇO',
        fields: [
          { label: 'Região:', value: p.region },
          { label: 'Cidade:', value: p.city },
          { label: 'Bairro:', value: p.neighborhood },
          { label: 'Rua:', value: p.street },
          { label: 'CEP:', value: formatters.zipCode(p.zipCode) },
        ],
      },
      {
        title: 'DOCUMENTOS',
        fields: [
          { label: 'Título de eleitor:', value: p.voterId },
          { label: 'Zona:', value: p.voterZone },
          { label: 'Seção:', value: p.voterSection },
          { label: 'Carteira de trabalho:', value: p.workCard },
          { label: 'Emissão:', value: formatters.date(p.workCardIssueDate) },
          { label: 'PIS:', value: p.pis },
          { label: 'Reservista:', value: p.militaryCert },
        ],
      },
      {
        title: 'DADOS BANCÁRIOS',
        fields: [
          { label: 'Tipo de conta:', value: accountTypeLabel(p.accountType) },
          { label: 'Banco:', value: p.bank },
          { label: 'Agência:', value: p.bankAgency },
          { label: 'Conta:', value: p.accountNumber },
          { label: 'Chave PIX:', value: p.pixKey },
        ],
      },
    ];

    if (p.hasChildren && p.children.length) {
      sections.push({
        title: 'FILHOS',
        fields: p.children.map(c => ({ label: `• ${c.name}`, value: formatters.date(c.birthDate) })),
      });
    }

    if (p.status === 'inactive' || p.doNotCall) {
      const fields: Field[] = [{ label: 'Status:', value: p.status === 'active' ? 'Ativo' : 'Inativo' }];
      if (p.doNotCall) fields.push({ label: 'Não chamar:', value: p.doNotCallReason || 'Sim' });
      sections.push({ title: 'OBSERVAÇÕES', fields });
    }

    return sections;
  }
}
