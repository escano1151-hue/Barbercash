export type ThemeId = 'gold' | 'neon-green' | 'classic-red' | 'steel-blue';

export type CurrencyId = 'USD' | 'EUR' | 'MXN' | 'PEN' | 'COP' | 'ARS' | 'GBP' | 'GTQ';

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  accent: string;
  accentRgba: string;
  accentSoft: string;
};

export type Currency = {
  id: CurrencyId;
  name: string;
  symbol: string;
  prefix: boolean;
  locale: string;
};

export const THEMES: Theme[] = [
  {
    id: 'gold',
    name: 'Dorado Barber',
    description: 'Negro y Amarillo',
    accent: '#eab308',
    accentRgba: '234, 179, 8',
    accentSoft: '#eab30833',
  },
  {
    id: 'neon-green',
    name: 'Verde Neón',
    description: 'Negro y Verde brillante',
    accent: '#22c55e',
    accentRgba: '34, 197, 94',
    accentSoft: '#22c55e33',
  },
  {
    id: 'classic-red',
    name: 'Rojo Clásico',
    description: 'Negro y Rojo barbería',
    accent: '#ef4444',
    accentRgba: '239, 68, 68',
    accentSoft: '#ef444433',
  },
  {
    id: 'steel-blue',
    name: 'Azul Acero',
    description: 'Gris oscuro y Azul',
    accent: '#3b82f6',
    accentRgba: '59, 130, 246',
    accentSoft: '#3b82f633',
  },
];

export const CURRENCIES: Currency[] = [
  { id: 'USD', name: 'Dólar', symbol: '$', prefix: true, locale: 'en-US' },
  { id: 'EUR', name: 'Euro', symbol: '€', prefix: false, locale: 'de-DE' },
  { id: 'MXN', name: 'Peso Mexicano', symbol: '$', prefix: true, locale: 'es-MX' },
  { id: 'PEN', name: 'Sol Peruano', symbol: 'S/', prefix: true, locale: 'es-PE' },
  { id: 'COP', name: 'Peso Colombiano', symbol: '$', prefix: true, locale: 'es-CO' },
  { id: 'ARS', name: 'Peso Argentino', symbol: '$', prefix: true, locale: 'es-AR' },
  { id: 'GBP', name: 'Libra Esterlina', symbol: '£', prefix: true, locale: 'en-GB' },
  { id: 'GTQ', name: 'Quetzal', symbol: 'Q', prefix: true, locale: 'es-GT' },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function getCurrency(id: string): Currency {
  return CURRENCIES.find((c) => c.id === id) ?? CURRENCIES[0];
}
