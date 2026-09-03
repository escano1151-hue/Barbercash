import type { Service } from './supabase';

export type DayBreakdown = {
  date: string;
  servicesCount: number;
  serviceAmount: number;
  earnings: number;
  tips: number;
  total: number;
};

export type Totals = {
  gross: number;
  serviceAmount: number;
  earnings: number;
  tips: number;
  total: number;
  servicesCount: number;
  avgPerClient: number;
};

export type ServiceBreakdown = {
  gross: number;
  serviceAmount: number;
  earnings: number;
  tip: number;
  net: number;
};

export function calcServiceBreakdown(
  serviceAmount: number,
  tip: number,
  percentage: number,
): ServiceBreakdown {
  const amt = Number(serviceAmount) || 0;
  const t = Number(tip) || 0;
  const earnings = calcEarnings(amt, percentage);
  return {
    gross: amt + t,
    serviceAmount: amt,
    earnings,
    tip: t,
    net: earnings + t,
  };
}

/** Ganancia del barbero para un monto de servicio dado un porcentaje (0-100). */
export function calcEarnings(serviceAmount: number, percentage: number): number {
  return (serviceAmount * percentage) / 100;
}

/** Totales agregados a partir de una lista de servicios y el porcentaje del barbero. */
export function calcTotals(services: Service[], percentage: number): Totals {
  let serviceAmount = 0;
  let tips = 0;
  let servicesCount = services.length;

  for (const s of services) {
    serviceAmount += Number(s.service_amount) || 0;
    tips += Number(s.tip) || 0;
  }

  const earnings = calcEarnings(serviceAmount, percentage);
  const gross = serviceAmount + tips;
  const total = earnings + tips;
  const avgPerClient = servicesCount > 0 ? total / servicesCount : 0;

  return { gross, serviceAmount, earnings, tips, total, servicesCount, avgPerClient };
}

/** Agrupa servicios por día y calcula el desglose de cada día. */
export function groupByDay(services: Service[], percentage: number): Map<string, DayBreakdown> {
  const map = new Map<string, DayBreakdown>();
  for (const s of services) {
    const date = s.service_date;
    const amount = Number(s.service_amount) || 0;
    const tip = Number(s.tip) || 0;
    const existing = map.get(date);
    if (existing) {
      existing.servicesCount += 1;
      existing.serviceAmount += amount;
      existing.earnings += calcEarnings(amount, percentage);
      existing.tips += tip;
      existing.total = existing.earnings + existing.tips;
    } else {
      map.set(date, {
        date,
        servicesCount: 1,
        serviceAmount: amount,
        earnings: calcEarnings(amount, percentage),
        tips: tip,
        total: calcEarnings(amount, percentage) + tip,
      });
    }
  }
  return map;
}
