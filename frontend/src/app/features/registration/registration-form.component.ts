import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ACCOUNT_TYPE_OPTIONS,
  PersonInput,
  RACE_COLOR_OPTIONS,
  SEX_OPTIONS,
} from '../../core/models/person.model';
import { PeopleStore } from '../../core/data/people-store';
import { PhotoService } from '../../core/services/photo.service';
import { onlyDigits } from '../../core/utils/formatters';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
})
export class RegistrationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(PeopleStore);
  private readonly photos = inject(PhotoService);
  private readonly snackBar = inject(MatSnackBar);

  readonly sexOptions = SEX_OPTIONS;
  readonly raceColorOptions = RACE_COLOR_OPTIONS;
  readonly accountTypeOptions = ACCOUNT_TYPE_OPTIONS;

  readonly submitting = signal(false);
  readonly done = signal(false);

  photoFile: File | null = null;
  photoPreview: string | null = null;

  readonly form = this.fb.group({
    // Required essentials only — keep the public form light.
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    birthDate: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    region: ['', Validators.required],
    city: ['', Validators.required],

    // Optional fields
    rg: [''],
    issuingAgency: [''],
    issueDate: [''],
    sex: [''],
    raceColor: [''],
    birthplace: [''],
    fatherName: [''],
    motherName: [''],

    street: [''],
    neighborhood: [''],
    zipCode: [''],

    voterId: [''],
    voterZone: [''],
    voterSection: [''],
    workCard: [''],
    workCardIssueDate: [''],
    pis: [''],
    militaryCert: [''],

    accountType: [''],
    bankAgency: [''],
    accountNumber: [''],
    bank: [''],
    pixKey: [''],

    hasChildren: [false],
    children: this.fb.array([]),
  });

  get children(): FormArray {
    return this.form.get('children') as FormArray;
  }

  fieldError(name: string): string | null {
    const control = this.form.get(name);
    if (!control || !control.touched || !control.errors) return null;
    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['pattern']) return 'Apenas números (11 dígitos)';
    if (control.errors['minlength']) return 'Muito curto';
    return 'Valor inválido';
  }

  onHasChildrenChange(checked: boolean): void {
    if (!checked) this.children.clear();
    else if (this.children.length === 0) this.addChild();
  }

  addChild(): void {
    this.children.push(this.fb.group({ name: ['', Validators.required], birthDate: [''] }));
  }

  removeChild(index: number): void {
    this.children.removeAt(index);
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.photoPreview = String(reader.result));
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.photoFile = null;
    this.photoPreview = null;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Preencha os campos obrigatórios destacados.', 'Fechar', { duration: 4000 });
      return;
    }

    this.submitting.set(true);
    try {
      let photoUrl: string | undefined;
      if (this.photoFile) {
        const encoded = await this.photos.encode(this.photoFile);
        const uploaded = await firstValueFrom(
          this.store.uploadPhoto(encoded.base64, encoded.filename, encoded.mimeType),
        );
        photoUrl = uploaded.url;
      }

      await firstValueFrom(this.store.create(this.buildInput(photoUrl)));
      this.done.set(true);
    } catch (err) {
      console.error(err);
      this.snackBar.open('Não foi possível enviar o cadastro. Tente novamente.', 'Fechar', {
        duration: 5000,
      });
    } finally {
      this.submitting.set(false);
    }
  }

  startNew(): void {
    this.form.reset({ hasChildren: false });
    this.children.clear();
    this.removePhoto();
    this.done.set(false);
  }

  private buildInput(photoUrl?: string): PersonInput {
    const v = this.form.getRawValue();
    return {
      fullName: (v.fullName ?? '').trim(),
      cpf: onlyDigits(v.cpf ?? ''),
      rg: v.rg ?? '',
      issuingAgency: v.issuingAgency ?? '',
      issueDate: v.issueDate ?? '',
      birthDate: v.birthDate ?? '',
      sex: (v.sex ?? '') as PersonInput['sex'],
      raceColor: (v.raceColor ?? '') as PersonInput['raceColor'],
      birthplace: v.birthplace ?? '',
      fatherName: v.fatherName ?? '',
      motherName: v.motherName ?? '',
      email: v.email ?? '',
      phone: onlyDigits(v.phone ?? ''),

      street: v.street ?? '',
      neighborhood: v.neighborhood ?? '',
      city: (v.city ?? '').trim(),
      region: (v.region ?? '').trim(),
      zipCode: onlyDigits(v.zipCode ?? ''),

      voterId: v.voterId ?? '',
      voterZone: v.voterZone ?? '',
      voterSection: v.voterSection ?? '',
      workCard: v.workCard ?? '',
      workCardIssueDate: v.workCardIssueDate ?? '',
      pis: v.pis ?? '',
      militaryCert: v.militaryCert ?? '',

      accountType: (v.accountType ?? '') as PersonInput['accountType'],
      bankAgency: v.bankAgency ?? '',
      accountNumber: v.accountNumber ?? '',
      bank: v.bank ?? '',
      pixKey: v.pixKey ?? '',

      hasChildren: !!v.hasChildren,
      childrenCount: v.hasChildren ? this.children.length : 0,
      children: v.hasChildren ? (v.children as PersonInput['children']) : [],

      photoUrl,
    };
  }
}
