import { useMemo, useState } from 'react';
import { Search, ClipboardList, Trash2, Coins, HandCoins } from 'lucide-react';
import type { Service } from '../lib/supabase';
import { calcServiceBreakdown } from '../lib/calculations';
import { formatCurrency, formatDayLabel } from '../lib/format';
import { Card } from './ui';

type HistoryProps = {
  services: Service[];
  percentage: number;
  onDelete: (id: string) => Promise<void>;
};

export function History({ services, percentage, onDelete }: HistoryProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        (s.client_name ?? '').toLowerCase().includes(q) ||
        s.service_name.toLowerCase().includes(q),
    );
  }, [services, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of filtered) {
      const arr = map.get(s.service_date) ?? [];
      arr.push(s);
      map.set(s.service_date, arr);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <div className="space-y-5 pb-24">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Historial</h1>
        <p className="mt-1 text-xs text-zinc-500">
          {services.length} {services.length === 1 ? 'registro' : 'registros'} en total
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente o servicio..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Resultados */}
      {grouped.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <ClipboardList size={32} className="text-zinc-700" />
          <p className="text-sm text-zinc-500">
            {query ? 'No se encontraron registros.' : 'Aún no hay servicios registrados.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, items]) => {
            const dayGross = items.reduce(
              (sum, s) => sum + (Number(s.service_amount) || 0) + (Number(s.tip) || 0),
              0,
            );
            return (
              <div key={date}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    {formatDayLabel(date)}
                  </h2>
                  <span className="text-xs font-medium text-zinc-500">
                    {items.length} {items.length === 1 ? 'servicio' : 'servicios'} ·{' '}
                    {formatCurrency(dayGross)}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((s) => {
                    const b = calcServiceBreakdown(s.service_amount, s.tip, percentage);
                    return (
                      <Card key={s.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
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
                          <span className="flex items-center gap-1 font-medium text-accent">
                            <Coins size={12} />
                            {formatCurrency(b.earnings)}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="flex items-center gap-1 font-medium text-green-500">
                            <HandCoins size={12} />
                            {formatCurrency(b.tip)}
                          </span>
                          <span className="ml-auto text-zinc-500">
                            Neto{' '}
                            <span className="font-semibold text-zinc-300">
                              {formatCurrency(b.net)}
                            </span>
                          </span>
                          <button
                            onClick={() => onDelete(s.id)}
                            className="ml-1 text-zinc-600 transition hover:text-red-400"
                            aria-label="Eliminar registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
