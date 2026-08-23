import { Child, Person, PersonStatus } from '../models/person.model';

/**
 * Coerces a raw record coming from the spreadsheet into a well-typed Person.
 * The Apps Script already parses most types, but the front-end stays defensive
 * so a hand-edited cell can't break the UI. Keeping this here isolates the
 * storage shape from the rest of the app.
 */
export function normalizePerson(raw: Record<string, unknown>): Person {
  const str = (key: string) => (raw[key] == null ? '' : String(raw[key]));
  const bool = (key: string) => raw[key] === true || raw[key] === 'TRUE' || raw[key] === 'true';

  return {
    id: str('id'),
    createdAt: str('createdAt'),
    updatedAt: str('updatedAt') || undefined,
    status: (str('status') as PersonStatus) || 'active',
    doNotCall: bool('doNotCall'),
    doNotCallReason: str('doNotCallReason') || undefined,

    fullName: str('fullName'),
    cpf: str('cpf'),
    rg: str('rg'),
    issuingAgency: str('issuingAgency'),
    issueDate: str('issueDate'),
    birthDate: str('birthDate'),
    sex: str('sex') as Person['sex'],
    raceColor: str('raceColor') as Person['raceColor'],
    birthplace: str('birthplace'),
    fatherName: str('fatherName'),
    motherName: str('motherName'),
    email: str('email'),
    phone: str('phone'),

    street: str('street'),
    neighborhood: str('neighborhood'),
    city: str('city'),
    region: str('region'),
    zipCode: str('zipCode'),

    voterId: str('voterId'),
    voterZone: str('voterZone'),
    voterSection: str('voterSection'),
    workCard: str('workCard'),
    workCardIssueDate: str('workCardIssueDate'),
    pis: str('pis'),
    militaryCert: str('militaryCert'),

    accountType: str('accountType') as Person['accountType'],
    bankAgency: str('bankAgency'),
    accountNumber: str('accountNumber'),
    bank: str('bank'),
    pixKey: str('pixKey'),

    hasChildren: bool('hasChildren'),
    childrenCount: Number(raw['childrenCount']) || 0,
    children: parseChildren(raw['children']),

    photoUrl: str('photoUrl') || undefined,
  };
}

function parseChildren(value: unknown): Child[] {
  if (Array.isArray(value)) return value as Child[];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
