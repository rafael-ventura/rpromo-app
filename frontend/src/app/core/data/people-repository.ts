import { Observable } from 'rxjs';
import { Person, PersonInput, PersonStatus } from '../models/person.model';

export interface UploadedPhoto {
  fileId: string;
  url: string;
}

/**
 * The single seam between the app and its data store.
 *
 * Today the only implementation is {@link ApiPeopleRepository} (the RPromo .NET
 * API). Swapping to a different backend later means writing a new implementation
 * and changing one line in `app.config.ts` — nothing else in the app touches the
 * storage details. (An earlier implementation, SheetsPeopleRepository, talked to
 * Google Sheets via Apps Script — see apps-script/ for that history.)
 */
export abstract class PeopleRepository {
  abstract list(): Observable<Person[]>;
  abstract create(input: PersonInput): Observable<Person>;
  abstract update(id: string, input: PersonInput): Observable<Person>;
  abstract setStatus(id: string, status: PersonStatus): Observable<Person>;
  abstract setDoNotCall(id: string, value: boolean, reason?: string): Observable<Person>;
  abstract uploadPhoto(base64: string, filename: string, mimeType: string): Observable<UploadedPhoto>;
}
