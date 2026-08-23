import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Person, PersonInput, PersonStatus } from '../models/person.model';
import { PeopleRepository, UploadedPhoto } from './people-repository';

/**
 * PeopleRepository backed by the real RPromo .NET API. Field names match the
 * Person model 1:1 (both sides use camelCase), so no mapping layer is needed —
 * unlike SheetsPeopleRepository, which had to defensively coerce raw sheet rows.
 */
@Injectable()
export class ApiPeopleRepository extends PeopleRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  list(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/people`).pipe(catchError(rethrow));
  }

  create(input: PersonInput): Observable<Person> {
    return this.http.post<Person>(`${this.baseUrl}/people`, input).pipe(catchError(rethrow));
  }

  update(id: string, input: PersonInput): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/people/${id}`, input).pipe(catchError(rethrow));
  }

  setStatus(id: string, status: PersonStatus): Observable<Person> {
    return this.http
      .patch<Person>(`${this.baseUrl}/people/${id}/status`, { status })
      .pipe(catchError(rethrow));
  }

  setDoNotCall(id: string, value: boolean, reason?: string): Observable<Person> {
    return this.http
      .patch<Person>(`${this.baseUrl}/people/${id}/do-not-call`, { value, reason })
      .pipe(catchError(rethrow));
  }

  uploadPhoto(base64: string, filename: string, mimeType: string): Observable<UploadedPhoto> {
    return this.http
      .post<UploadedPhoto>(`${this.baseUrl}/photos`, { base64, filename, mimeType })
      .pipe(catchError(rethrow));
  }
}

function rethrow(err: HttpErrorResponse) {
  const message = (err.error && err.error.error) || err.message || 'Erro na comunicação com o backend';
  return throwError(() => new Error(message));
}
