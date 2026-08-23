/**
 * Domain model. All dates are stored as ISO strings ('yyyy-mm-dd' or full ISO)
 * because the backing store is a flat spreadsheet — strings travel cleanly and
 * avoid Date (de)serialization bugs across the Sheets boundary.
 */

export type PersonStatus = 'active' | 'inactive';
export type Sex = 'male' | 'female' | 'other' | 'undisclosed';
export type RaceColor = 'white' | 'black' | 'brown' | 'yellow' | 'indigenous';
export type AccountType = 'checking' | 'savings' | 'salary';

export interface Child {
  name: string;
  birthDate: string;
}

export interface Person {
  // System fields (managed by the backend)
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: PersonStatus;
  doNotCall: boolean;
  doNotCallReason?: string;

  // Personal
  fullName: string;
  cpf: string;
  rg: string;
  issuingAgency: string;
  issueDate: string;
  birthDate: string;
  sex: Sex | '';
  raceColor: RaceColor | '';
  birthplace: string;
  fatherName: string;
  motherName: string;
  email: string;
  phone: string;

  // Address (region/city drive the dashboard filters)
  street: string;
  neighborhood: string;
  city: string;
  region: string;
  zipCode: string;

  // Documents
  voterId: string;
  voterZone: string;
  voterSection: string;
  workCard: string;
  workCardIssueDate: string;
  pis: string;
  militaryCert: string;

  // Banking
  accountType: AccountType | '';
  bankAgency: string;
  accountNumber: string;
  bank: string;
  pixKey: string;

  // Family
  hasChildren: boolean;
  childrenCount: number;
  children: Child[];

  // Files (Drive link)
  photoUrl?: string;
}

/** What the registration form produces — a Person without the system-managed fields. */
export type PersonInput = Omit<
  Person,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'doNotCall' | 'doNotCallReason'
>;

// === Select options (English value, Portuguese label for the UI) ===

export interface Option<T extends string> {
  value: T;
  label: string;
}

export const SEX_OPTIONS: Option<Sex>[] = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outro' },
  { value: 'undisclosed', label: 'Prefiro não informar' },
];

export const RACE_COLOR_OPTIONS: Option<RaceColor>[] = [
  { value: 'white', label: 'Branca' },
  { value: 'black', label: 'Preta' },
  { value: 'brown', label: 'Parda' },
  { value: 'yellow', label: 'Amarela' },
  { value: 'indigenous', label: 'Indígena' },
];

export const ACCOUNT_TYPE_OPTIONS: Option<AccountType>[] = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'salary', label: 'Conta Salário' },
];

const LABELS = {
  sex: Object.fromEntries(SEX_OPTIONS.map(o => [o.value, o.label])),
  raceColor: Object.fromEntries(RACE_COLOR_OPTIONS.map(o => [o.value, o.label])),
  accountType: Object.fromEntries(ACCOUNT_TYPE_OPTIONS.map(o => [o.value, o.label])),
};

export function sexLabel(value: Sex | ''): string {
  return LABELS.sex[value] ?? '';
}
export function raceColorLabel(value: RaceColor | ''): string {
  return LABELS.raceColor[value] ?? '';
}
export function accountTypeLabel(value: AccountType | ''): string {
  return LABELS.accountType[value] ?? '';
}

/** Age in full years from an ISO birth date. Returns null when unknown. */
export function ageFromBirthDate(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
