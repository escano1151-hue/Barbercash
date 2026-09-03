import { useMemo, useState } from 'react';
import { Coins, HandCoins, Wallet, TrendingUp } from 'lucide-react';
import type { Service } from '../lib/supabase';
import { calcTotals, groupByDay, calcServiceBreakdown } from '../lib/calculations';
import {
  formatCurrency,
  formatCurrencySigned,
  formatDayLabel,
  formatDayShort,
  lastNDays,
} from '../lib/format';
import { Card, MetricLabel, SectionTitle } from './ui';

type StatsProps = {
  services: Service[];
  percentage: number;
};

type Range = 'week' | 'month';

export function Stats({ services, percentage }: StatsProps) {
  const [range, setRange] = useState<Range>('week');
  const days = range === 'week' ? 7 : 30;

  const rangeDays = useMemo(() => lastNDays(days), [days]);
  const rangeSet = useMemo(() => new Set(rangeDays), [rangeDays]);

  const rangeServices = useMemo(
    () => services.filter((s) => rangeSet.has(s.service_date)),
    [services, rangeSet],
  );

  const totals = useMemo(
    () => calcTotals(rangeServices, percentage),
    [rangeServices, percentage],
  );

  const dailyMap = useMemo(
    () => groupByDay(rangeServices, percentage),
    [rangeServices, percentage],
  );

  const dailyData = useMemo(
    () =>
      rangeDays.map((date) =>
        dailyMap.get(date) ?? {
          date,
          servicesCount: 0,
          serviceAmount: 0,
          earnings: 0,
          tips: 0,
          total: 0,
        },
      ),
    [rangeDays, dailyMap],
  );

  const maxTotal = Math.max(1, ...dailyData.map((d) => d.total));

  const history = useMemo(
    () =>
      [...rangeServices]
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 20),
    [rangeServices],
  );

  return (
    <div className="space-y-5 pb-24">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
        <p className="mt-1 text-xs text-zinc-500">Tu rendimiento en cifras</p>
      </div>

      {/* Selector de rango */}
      <div className="flex gap-2">
        {(['week', 'month'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
              range === r
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {r === 'week' ? 'Últimos 7 días' : 'Últimos 30 días'}
          </button>
        ))}
      </div>

      {/* DESGLOSE DE INGRESOS */}
      <div>
        <SectionTitle className="mb-3">Desglose de Ingresos</SectionTitle>
        <Card className="divide-y divide-zinc-800 p-0">
          {/* Servicios / Cortes */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <Coins size={18} className="text-accent" />
              </span>
              <div>
                <MetricLabel>Servicios / Cortes</MetricLabel>
                <p className="text-xs text-zinc-500">
                  {percentage}% de {formatCurrency(totals.serviceAmount)}
                </p>
              </div>
            </div>
            <p className="text-lg font-bold text-accent">
              {formatCurrency(totals.earnings)}
            </p>
          </div>

          {/* Propinas Totales */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                <HandCoins size={18} className="text-green-500" />
              </span>
              <div>
                <MetricLabel>Propinas Totales</MetricLabel>
                <p className="text-xs text-zinc-500">100% tuyo</p>
              </div>
            </div>
            <p className="text-lg font-bold text-green-500">
              {formatCurrencySigned(totals.tips)}
            </p>
          </div>

          {/* Total Neto Combinado */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <Wallet size={18} className="text-accent" />
                </span>
                <MetricLabel>Total Neto Combinado</MetricLabel>
              </div>
              <p className="text-xl font-bold text-accent">
                {formatCurrency(totals.total)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de barras */}
      <div>
        <SectionTitle className="mb-3">Ingresos por Día</SectionTitle>
        <Card className="p-4">
          <div className="flex items-end justify-between gap-1.5" style={{ height: range === 'week' ? 160 : 140 }}>
            {dailyData.map((d) => {
              const heightPct = (d.total / maxTotal) * 100;
              return (
                <div
                  key={d.date}
                  className="group flex flex-1 flex-col items-center justify-end gap-1"
                  style={{ height: '100%' }}
                >
                  <span className="text-[9px] font-medium text-zinc-500 opacity-0 transition group-hover:opacity-100">
                    {d.total > 0 ? `$${d.total.toFixed(0)}` : ''}
                  </span>
                  <div
                    className="w-full overflow-hidden rounded-t-md bg-bar-gradient transition-all"
                    style={{ height: `${Math.max(heightPct, d.total > 0 ? 4 : 0)}%` }}
                  />
                  <span className="text-[8px] font-medium text-zinc-600">
                    {formatDayShort(d.date).split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
          {range === 'week' && (
            <div className="mt-3 flex justify-between">
              {dailyData.map((d) => (
                <span key={d.date} className="flex-1 text-center text-[8px] text-zinc-600">
                  {formatDayShort(d.date).split(' ')[1]}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-zinc-400" />
            <MetricLabel>Servicios</MetricLabel>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{totals.servicesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-zinc-400" />
            <MetricLabel>Promedio/día</MetricLabel>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {formatCurrency(totals.total / days)}
          </p>
        </Card>
      </div>

      {/* Historial reciente */}
      <div>
        <SectionTitle className="mb-3">Historial Reciente</SectionTitle>
        {history.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-zinc-500">Sin servicios en este período.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((s) => {
              const b = calcServiceBreakdown(s.service_amount, s.tip, percentage);
              return (
                <Card key={s.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {s.service_name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {s.client_name || 'Sin nombre'} · {formatDayLabel(s.service_date)}
                      </p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(b.gross)}
                      </p>
                      <p className="text-[10px] text-zinc-500">Total cobrado</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 border-t border-zinc-800 pt-2 text-xs">
                    <span className="font-medium text-accent">
                      {formatCurrency(b.earnings)} ganancia
                    </span>
                    {b.tip > 0 && (
                      <span className="font-medium text-green-500">
                        + {formatCurrency(b.tip)} propina
                      </span>
                    )}
                    <span className="ml-auto text-zinc-500">
                      Neto{' '}
                      <span className="font-semibold text-zinc-300">
                        {formatCurrency(b.net)}
                      </span>
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
