import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import {
  Person,
  PersonStatus,
  ageFromBirthDate,
  raceColorLabel,
  sexLabel,
} from '../../core/models/person.model';
import { PeopleStore, RECENT_DAYS } from '../../core/data/people-store';
import { PdfService } from '../../core/services/pdf.service';
import { formatters, isWithinLastDays, onlyDigits } from '../../core/utils/formatters';
import { DoNotCallDialogComponent } from './do-not-call-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(PeopleStore);
  private readonly pdf = inject(PdfService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly recentDays = RECENT_DAYS;
  readonly format = formatters;

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly stats = this.store.stats;
  readonly regions = this.store.regions;
  readonly cities = this.store.cities;

  // Filter state
  readonly search = signal('');
  readonly region = signal('');
  readonly city = signal('');
  readonly status = signal<'' | PersonStatus>('');
  readonly minAge = signal<number | null>(null);
  readonly maxAge = signal<number | null>(null);
  readonly onlyRecent = signal(false);
  readonly hideDoNotCall = signal(false);

  readonly filtered = computed(() => this.applyFilters(this.store.people()));

  ngOnInit(): void {
    this.store.load();
  }

  // === derived helpers used by the template ===

  age(person: Person): number | null {
    return ageFromBirthDate(person.birthDate);
  }
  sexText(person: Person): string {
    return sexLabel(person.sex);
  }
  raceText(person: Person): string {
    return raceColorLabel(person.raceColor);
  }
  isRecent(person: Person): boolean {
    return isWithinLastDays(person.createdAt, RECENT_DAYS);
  }

  // === actions ===

  refresh(): void {
    this.store.load();
  }

  clearFilters(): void {
    this.search.set('');
    this.region.set('');
    this.city.set('');
    this.status.set('');
    this.minAge.set(null);
    this.maxAge.set(null);
    this.onlyRecent.set(false);
    this.hideDoNotCall.set(false);
  }

  async toggleStatus(person: Person): Promise<void> {
    const next: PersonStatus = person.status === 'active' ? 'inactive' : 'active';
    try {
      await firstValueFrom(this.store.setStatus(person.id, next));
      this.toast(next === 'active' ? 'Cadastro reativado.' : 'Cadastro inativado.');
    } catch {
      this.toast('Erro ao alterar status.');
    }
  }

  async toggleDoNotCall(person: Person): Promise<void> {
    if (person.doNotCall) {
      try {
        await firstValueFrom(this.store.setDoNotCall(person.id, false));
        this.toast('Pessoa liberada para contato.');
      } catch {
        this.toast('Erro ao atualizar.');
      }
      return;
    }

    const result = await firstValueFrom(
      this.dialog.open(DoNotCallDialogComponent, { width: '440px', data: { name: person.fullName } }).afterClosed(),
    );
    if (!result) return;

    try {
      await firstValueFrom(this.store.setDoNotCall(person.id, true, result.reason));
      this.toast('Marcado como "não chamar novamente".');
    } catch {
      this.toast('Erro ao atualizar.');
    }
  }

  generatePdf(person: Person): void {
    this.pdf.download(person);
  }

  openWhatsApp(person: Person): void {
    const phone = onlyDigits(person.phone);
    if (!phone) {
      this.toast('Esta pessoa não tem telefone cadastrado.');
      return;
    }
    const firstName = person.fullName.split(' ')[0];
    const message =
      `Olá ${firstName}, aqui é da *RPromo*! Entramos em contato sobre uma oportunidade ` +
      `de trabalho. Você tem disponibilidade para conversar?`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  // === filtering ===

  private applyFilters(people: Person[]): Person[] {
    const term = this.search().trim().toLowerCase();
    const termDigits = onlyDigits(term);
    const region = this.region();
    const city = this.city();
    const status = this.status();
    const min = this.minAge();
    const max = this.maxAge();

    return people.filter(p => {
      if (region && p.region !== region) return false;
      if (city && p.city !== city) return false;
      if (status && p.status !== status) return false;
      if (this.hideDoNotCall() && p.doNotCall) return false;
      if (this.onlyRecent() && !isWithinLastDays(p.createdAt, RECENT_DAYS)) return false;

      const age = ageFromBirthDate(p.birthDate);
      if (min != null && (age == null || age < min)) return false;
      if (max != null && (age == null || age > max)) return false;

      if (term) {
        const text = `${p.fullName} ${p.email} ${p.city} ${p.region} ${p.neighborhood}`.toLowerCase();
        const matchesText = text.includes(term);
        const matchesDigits =
          !!termDigits && (onlyDigits(p.cpf).includes(termDigits) || onlyDigits(p.phone).includes(termDigits));
        if (!matchesText && !matchesDigits) return false;
      }
      return true;
    });
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000 });
  }
}
