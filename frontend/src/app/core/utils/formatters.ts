/** Display formatters and digit masks for Brazilian documents. */
export const formatters = {
  cpf(value: string): string {
    const digits = onlyDigits(value).padEnd(0).slice(0, 11);
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  phone(value: string): string {
    const digits = onlyDigits(value);
    if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return value;
  },

  zipCode(value: string): string {
    return onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  },

  /** ISO date string -> dd/mm/yyyy. */
  date(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(d);
  },

  /** ISO date/time -> dd/mm/yyyy hh:mm. */
  dateTime(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(d);
  },
};

export function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Accepts a Date or ISO/locale string and returns 'yyyy-mm-dd' (or '' if invalid). */
export function toIsoDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/** True when an ISO date/time falls within the last `days` days. */
export function isWithinLastDays(iso: string, days: number): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return d.getTime() >= cutoff;
}
