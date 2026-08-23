import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Person, PersonInput, PersonStatus } from '../models/person.model';
import { PeopleRepository, UploadedPhoto } from './people-repository';
import { normalizePerson } from './person.mapper';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * PeopleRepository backed by Google Sheets through an Apps Script Web App.
 *
 * Reads use GET; writes use POST with Content-Type text/plain to keep the
 * browser from sending a CORS preflight (which Apps Script does not handle).
 * The body is still JSON. See apps-script/Code.gs.
 */
@Injectable()
export class SheetsPeopleRepository extends PeopleRepository {
  private readonly http = inject(HttpClient);
  private readonly url = environment.webAppUrl;

  list(): Observable<Person[]> {
    return this.get<Record<string, unknown>[]>('list').pipe(
      map(rows => rows.map(normalizePerson)),
    );
  }

  create(input: PersonInput): Observable<Person> {
    return this.post<Record<string, unknown>>({ action: 'create', person: input }).pipe(
      map(normalizePerson),
    );
  }

  update(id: string, input: PersonInput): Observable<Person> {
    return this.post<Record<string, unknown>>({ action: 'update', id, person: input }).pipe(
      map(normalizePerson),
    );
  }

  setStatus(id: string, status: PersonStatus): Observable<Person> {
    return this.post<Record<string, unknown>>({ action: 'setStatus', id, status }).pipe(
      map(normalizePerson),
    );
  }

  setDoNotCall(id: string, value: boolean, reason?: string): Observable<Person> {
    return this.post<Record<string, unknown>>({ action: 'setDoNotCall', id, value, reason }).pipe(
      map(normalizePerson),
    );
  }

  uploadPhoto(base64: string, filename: string, mimeType: string): Observable<UploadedPhoto> {
    return this.post<UploadedPhoto>({ action: 'uploadPhoto', base64, filename, mimeType });
  }

  // === transport ===

  private get<T>(action: string): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.url}?action=${action}`)
      .pipe(map(res => this.unwrap(res)));
  }

  private post<T>(body: Record<string, unknown>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url, JSON.stringify(body), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      })
      .pipe(map(res => this.unwrap(res)));
  }

  private unwrap<T>(res: ApiResponse<T>): T {
    if (!res?.ok) throw new Error(res?.error || 'Erro na comunicação com o backend');
    return res.data as T;
  }
}
