import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Person, PersonInput, PersonStatus } from '../models/person.model';
import { isWithinLastDays } from '../utils/formatters';
import { PeopleRepository, UploadedPhoto } from './people-repository';

/** Number of days a registration is considered "new". */
export const RECENT_DAYS = 5;

/**
 * Single source of truth for people, built on Angular signals. Components read
 * the signals directly and call the mutating methods; the store keeps its cache
 * in sync so the UI updates without a round-trip after every change.
 */
@Injectable({ providedIn: 'root' })
export class PeopleStore {
  private readonly repo = inject(PeopleRepository);

  private readonly _people = signal<Person[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly people = this._people.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly stats = computed(() => {
    const all = this._people();
    return {
      total: all.length,
      active: all.filter(p => p.status === 'active').length,
      inactive: all.filter(p => p.status === 'inactive').length,
      doNotCall: all.filter(p => p.doNotCall).length,
      recent: all.filter(p => isWithinLastDays(p.createdAt, RECENT_DAYS)).length,
    };
  });

  readonly regions = computed(() => uniqueSorted(this._people().map(p => p.region)));
  readonly cities = computed(() => uniqueSorted(this._people().map(p => p.city)));

  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this.repo.list().subscribe({
      next: people => {
        this._people.set(sortByNewest(people));
        this._loading.set(false);
      },
      error: err => {
        this._error.set(err?.message ?? String(err));
        this._loading.set(false);
      },
    });
  }

  byId(id: string): Person | undefined {
    return this._people().find(p => p.id === id);
  }

  create(input: PersonInput): Observable<Person> {
    return this.repo.create(input).pipe(
      tap(created => this._people.update(list => sortByNewest([created, ...list]))),
    );
  }

  update(id: string, input: PersonInput): Observable<Person> {
    return this.repo.update(id, input).pipe(tap(updated => this.replace(updated)));
  }

  setStatus(id: string, status: PersonStatus): Observable<Person> {
    return this.repo.setStatus(id, status).pipe(tap(updated => this.replace(updated)));
  }

  setDoNotCall(id: string, value: boolean, reason?: string): Observable<Person> {
    return this.repo.setDoNotCall(id, value, reason).pipe(tap(updated => this.replace(updated)));
  }

  uploadPhoto(base64: string, filename: string, mimeType: string): Observable<UploadedPhoto> {
    return this.repo.uploadPhoto(base64, filename, mimeType);
  }

  private replace(person: Person): void {
    this._people.update(list => list.map(p => (p.id === person.id ? person : p)));
  }
}

function sortByNewest(people: Person[]): Person[] {
  return [...people].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
