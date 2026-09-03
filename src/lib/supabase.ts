import { createClient } from '@supabase/supabase-js';
import type { Currency } from './themes';
import { getCurrency } from './themes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let activeCurrency: Currency = getCurrency('USD');

export function setActiveCurrency(id: string): void {
  activeCurrency = getCurrency(id);
}

export function getActiveCurrency(): Currency {
  return activeCurrency;
}

export type Service = {
  id: string;
  client_name: string | null;
  service_name: string;
  service_amount: number;
  tip: number;
  service_date: string;
  created_at: string;
};

export type Settings = {
  id: number;
  barber_percentage: number;
  theme: string;
  currency: string;
  updated_at: string;
};

export type ServiceInsert = {
  client_name?: string | null;
  service_name: string;
  service_amount: number;
  tip: number;
  service_date: string;
};
