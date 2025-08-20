import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  PessoaFormData,
  OPCOES_SEXO,
  OPCOES_RACA_COR,
  OPCOES_TIPO_CONTA,
  FilhoInfo
} from '../../models/pessoa.model';
import { PessoaService } from '../../services/pessoa.service';
import { FotoService } from '../../services/foto.service';

@Component({
  selector: 'app-cadastro-pessoa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './cadastro-pessoa.html',
  styleUrls: ['./cadastro-pessoa.scss']
})
export class CadastroPessoaComponent implements OnInit {
  @Input() pessoaId?: string;

  cadastroForm!: FormGroup;
  isEdicao = false;
  isSubmitting = false;

  // Opções para selects
  opcoesSexo = OPCOES_SEXO;
  opcoesRacaCor = OPCOES_RACA_COR;
  opcoesTipoConta = OPCOES_TIPO_CONTA;

  // Arquivos de upload
  vacinaFile: File | null = null;
  fotosFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private pessoaService: PessoaService,
    private fotoService: FotoService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit() {
    // Verificar se é edição
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pessoaId = params['id'];
        this.isEdicao = true;
        this.carregarPessoa();
      }
    });
  }

  private initForm() {
    this.cadastroForm = this.fb.group({
      dadosPessoais: this.fb.group({
        nomeCompleto: ['', [Validators.required, Validators.minLength(2)]],
        cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
        rg: ['', [Validators.required]],
        orgaoEmissor: ['', [Validators.required]],
        dataExpedicao: ['', [Validators.required]],
        dataNascimento: ['', [Validators.required]],
        sexo: ['', [Validators.required]],
        racaCor: ['', [Validators.required]],
        naturalidade: ['', [Validators.required]],
        nomePai: [''],
        nomeMae: [''],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required]]
      }),
      documentos: this.fb.group({
        tituloEleitor: ['', [Validators.required]],
        zonaEleitoral: ['', [Validators.required]],
        secaoEleitoral: ['', [Validators.required]],
        carteiraTrabalho: ['', [Validators.required]],
        dataEmissaoCarteira: ['', [Validators.required]],
        pis: ['', [Validators.required]],
        certificadoReservista: ['']
      }),
      dadosBancarios: this.fb.group({
        tipoConta: ['', [Validators.required]],
        agenciaBancaria: ['', [Validators.required]],
        numeroConta: ['', [Validators.required]],
        banco: ['', [Validators.required]],
        chavePix: ['', [Validators.required]]
      }),
      endereco: this.fb.group({
        rua: ['', [Validators.required]],
        bairro: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]]
      }),
      familia: this.fb.group({
        temFilhos: [false],
        quantidadeFilhos: [0],
        nomesFilhos: this.fb.array([])
      }),
      documentosDigitais: this.fb.group({
        vacinaCovid: [null],
        fotos: [null]
      })
    });
  }

  private carregarPessoa() {
    if (!this.pessoaId) return;

    this.pessoaService.getPessoaPorId(this.pessoaId).subscribe(pessoa => {
      if (pessoa) {
        this.preencherForm(pessoa);
      }
    });
  }

  private preencherForm(pessoa: any) {
    // Implementar preenchimento do formulário com dados existentes
    this.cadastroForm.patchValue({
      dadosPessoais: {
        nomeCompleto: pessoa.nomeCompleto,
        cpf: pessoa.cpf,
        rg: pessoa.rg,
        orgaoEmissor: pessoa.orgaoEmissor,
        dataExpedicao: pessoa.dataExpedicao,
        dataNascimento: pessoa.dataNascimento,
        sexo: pessoa.sexo,
        racaCor: pessoa.racaCor,
        naturalidade: pessoa.naturalidade,
        nomePai: pessoa.nomePai,
        nomeMae: pessoa.nomeMae,
        email: pessoa.email,
        telefone: pessoa.telefone
      },
      documentos: {
        tituloEleitor: pessoa.tituloEleitor,
        zonaEleitoral: pessoa.zonaEleitoral,
        secaoEleitoral: pessoa.secaoEleitoral,
        carteiraTrabalho: pessoa.carteiraTrabalho,
        dataEmissaoCarteira: pessoa.dataEmissaoCarteira,
        pis: pessoa.pis,
        certificadoReservista: pessoa.certificadoReservista
      },
      dadosBancarios: {
        tipoConta: pessoa.tipoConta,
        agenciaBancaria: pessoa.agenciaBancaria,
        numeroConta: pessoa.numeroConta,
        banco: pessoa.banco,
        chavePix: pessoa.chavePix
      },
      endereco: {
        rua: pessoa.rua,
        bairro: pessoa.bairro,
        cidade: pessoa.cidade,
        cep: pessoa.cep
      },
      familia: {
        temFilhos: pessoa.temFilhos,
        quantidadeFilhos: pessoa.quantidadeFilhos || 0
      }
    });

    // Carregar filhos se existirem
    if (pessoa.nomesFilhos && pessoa.nomesFilhos.length > 0) {
      const nomesFilhosArray = this.cadastroForm.get('familia.nomesFilhos') as FormArray;
      pessoa.nomesFilhos.forEach((filho: FilhoInfo) => {
        nomesFilhosArray.push(this.criarFilhoFormGroup(filho));
      });
    }
  }

  // Gerenciamento de filhos
  get nomesFilhosArray(): FormArray {
    return this.cadastroForm.get('familia.nomesFilhos') as FormArray;
  }

  getNomesFilhosControls(): AbstractControl[] {
    return this.nomesFilhosArray.controls;
  }

  onTemFilhosChange(event: any) {
    const temFilhos = event.checked;
    if (!temFilhos) {
      // Limpar array de filhos
      while (this.nomesFilhosArray.length !== 0) {
        this.nomesFilhosArray.removeAt(0);
      }
      this.cadastroForm.get('familia.quantidadeFilhos')?.setValue(0);
    }
  }

  adicionarFilho() {
    const filhoGroup = this.criarFilhoFormGroup();
    this.nomesFilhosArray.push(filhoGroup);

    // Atualizar quantidade
    const quantidadeAtual = this.cadastroForm.get('familia.quantidadeFilhos')?.value || 0;
    this.cadastroForm.get('familia.quantidadeFilhos')?.setValue(quantidadeAtual + 1);
  }

  removerFilho(index: number) {
    this.nomesFilhosArray.removeAt(index);

    // Atualizar quantidade
    const quantidadeAtual = this.cadastroForm.get('familia.quantidadeFilhos')?.value || 0;
    this.cadastroForm.get('familia.quantidadeFilhos')?.setValue(Math.max(0, quantidadeAtual - 1));
  }

  private criarFilhoFormGroup(filho?: FilhoInfo): FormGroup {
    return this.fb.group({
      nome: [filho?.nome || '', [Validators.required]],
      dataNascimento: [filho?.dataNascimento || '', [Validators.required]]
    });
  }

  // Upload de arquivos
  onVacinaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.vacinaFile = file;
    }
  }

  onFotosSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.fotosFiles.push(...files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDropVacina(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.vacinaFile = files[0];
    }
  }

  onDropFotos(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files) {
      const fileArray = Array.from(files) as File[];
      this.fotosFiles.push(...fileArray);
    }
  }

  removeVacinaFile() {
    this.vacinaFile = null;
  }

  removeFotoFile(index: number) {
    this.fotosFiles.splice(index, 1);
  }

  // Validação e erros
  getFieldError(fieldPath: string): string | null {
    const field = this.cadastroForm.get(fieldPath);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'E-mail inválido';
      if (field.errors['pattern']) return 'Formato inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  // Submit do formulário
  async onSubmit() {
    if (this.cadastroForm.invalid) {
      this.markFormGroupTouched(this.cadastroForm);
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSubmitting = true;

    try {
      const formData: PessoaFormData = this.cadastroForm.value;

      let resultado;
      if (this.isEdicao && this.pessoaId) {
        resultado = await this.pessoaService.atualizarPessoa(this.pessoaId, formData).toPromise();
      } else {
        resultado = await this.pessoaService.adicionarPessoa(formData).toPromise();
      }

      if (resultado) {
        // Upload de fotos se houver
        if (this.fotosFiles.length > 0) {
          for (const foto of this.fotosFiles) {
            await this.fotoService.uploadFoto(foto, resultado.id!, 'perfil').toPromise();
          }
        }

        // Upload de vacina se houver
        if (this.vacinaFile) {
          await this.fotoService.uploadFoto(this.vacinaFile, resultado.id!, 'vacina').toPromise();
        }

        this.snackBar.open(
          this.isEdicao ? 'Cadastro atualizado com sucesso!' : 'Cadastro realizado com sucesso!',
          'Fechar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );

        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      this.snackBar.open('Erro ao salvar cadastro. Tente novamente.', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}
