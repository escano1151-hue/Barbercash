const DIA_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const MES_CORTO = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

import { getActiveCurrency } from './supabase';

export function formatCurrency(value: number): string {
  const c = getActiveCurrency();
  const formatted = new Intl.NumberFormat(c.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  return c.prefix ? `${c.symbol}${formatted}` : `${formatted} ${c.symbol}`;
}

export function formatCurrencySigned(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+ ${formatted}` : `- ${formatted}`;
}

/** Convierte un ISO date string (YYYY-MM-DD) a un objeto Date local a medianoche. */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Devuelve "Sábado 01/08" en español, sin depender del locale del navegador. */
export function formatDayLabel(iso: string): string {
  const date = parseLocalDate(iso);
  const dia = DIA_SEMANA[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dia} ${dd}/${mm}`;
}

/** Etiqueta corta para ejes de gráficos: "Sáb 01/08". */
export function formatDayShort(iso: string): string {
  const date = parseLocalDate(iso);
  const dia = DIA_SEMANA[date.getDay()].slice(0, 3);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dia} ${dd}/${mm}`;
}

/** Etiqueta de mes corto en español: "ago". */
export function formatMonthShort(iso: string): string {
  const date = parseLocalDate(iso);
  return MES_CORTO[date.getMonth()];
}

/** Fecha de hoy en formato ISO (YYYY-MM-DD) en zona local. */
export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Devuelve los últimos N días como ISO strings (incluyendo hoy), del más antiguo al más reciente. */
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}
