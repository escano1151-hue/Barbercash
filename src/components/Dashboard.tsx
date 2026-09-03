import { useMemo } from 'react';
import { Coins, HandCoins, Users, TrendingUp, Scissors, CalendarDays } from 'lucide-react';
import type { Service } from '../lib/supabase';
import { calcTotals, calcServiceBreakdown } from '../lib/calculations';
import { formatCurrency, formatDayLabel, todayISO } from '../lib/format';
import { Card, MetricLabel } from './ui';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

type DashboardProps = {
  services: Service[];
  percentage: number;
  onRegister: () => void;
};

export function Dashboard({ services, percentage, onRegister }: DashboardProps) {
  const today = todayISO();

  const todayServices = useMemo(
    () => services.filter((s) => s.service_date === today),
    [services, today],
  );

  const totals = useMemo(
    () => calcTotals(todayServices, percentage),
    [todayServices, percentage],
  );

  const recent = useMemo(
    () =>
      [...todayServices]
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 5),
    [todayServices],
  );

  return (
    <div className="space-y-5 pb-24">
      {/* Encabezado mejorado */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-5 pt-2">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/8 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
              <Scissors size={18} className="text-accent" />
            </span>
            <div>
              <h1 className="text-xl font-bold leading-tight text-white">BarberCash</h1>
              <p className="text-[11px] font-medium text-accent/80">{getGreeting()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1.5">
            <CalendarDays size={13} className="text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-300">
              {formatDayLabel(today)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de dos tarjetas: Ganancia + Propinas */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tarjeta: Mi Porcentaje / Ganancia */}
        <Card className="relative overflow-hidden p-4">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-accent" />
            <MetricLabel>Mi Ganancia</MetricLabel>
          </div>
          <p className="mt-3 text-3xl font-bold text-accent">
            {formatCurrency(totals.earnings)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {percentage}% de los servicios
          </p>
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/10" />
        </Card>

        {/* Tarjeta: Propinas Separadas */}
        <Card className="relative overflow-hidden p-4">
          <div className="flex items-center gap-2">
            <HandCoins size={16} className="text-green-500" />
            <MetricLabel>Propinas</MetricLabel>
          </div>
          <p className="mt-3 text-3xl font-bold text-green-500">
            {formatCurrency(totals.tips)}
          </p>
          <span className="mt-2 inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-500">
            100% tuyo
          </span>
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-green-500/5" />
        </Card>
      </div>

      {/* Total cobrado hoy */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <MetricLabel>Total Cobrado Hoy</MetricLabel>
          <span className="text-xs font-medium text-zinc-500">
            {totals.servicesCount} {totals.servicesCount === 1 ? 'servicio' : 'servicios'}
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold text-white">
          {formatCurrency(totals.gross)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Neto barbero:{' '}
          <span className="font-semibold text-accent">
            {formatCurrency(totals.total)}
          </span>
        </p>
      </Card>

      {/* Resúmenes secundarios */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-zinc-400" />
            <MetricLabel>Servicios</MetricLabel>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{totals.servicesCount}</p>
          <p className="text-xs text-zinc-500">Clientes atendidos</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-zinc-400" />
            <MetricLabel>Promedio</MetricLabel>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {formatCurrency(totals.avgPerClient)}
          </p>
          <p className="text-xs text-zinc-500">Por cliente</p>
        </Card>
      </div>

      {/* Actividad reciente */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Actividad Reciente
          </h2>
          <button
            onClick={onRegister}
            className="text-xs font-semibold text-accent"
          >
            + Nuevo
          </button>
        </div>
        {recent.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-zinc-500">
              Aún no hay servicios registrados hoy.
            </p>
            <button
              onClick={onRegister}
              className="mt-3 text-sm font-semibold text-accent"
            >
              Registrar el primer corte
            </button>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => {
              const b = calcServiceBreakdown(s.service_amount, s.tip, percentage);
              return (
                <Card key={s.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {s.service_name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {s.client_name || 'Sin nombre'}
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

