import { useState } from 'react';
import { X, Scissors } from 'lucide-react';
import type { ServiceInsert } from '../lib/supabase';
import { todayISO, formatDayLabel, formatCurrency } from '../lib/format';
import { Card, MetricLabel } from './ui';

import { getActiveCurrency } from '../lib/supabase';

type RegisterFormProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: ServiceInsert) => Promise<boolean>;
  percentage: number;
};

const SERVICE_PRESETS = [
  'Corte clásico',
  'Corte + Barba',
  'Diseño',
  'Fade',
  'Cejas',
  'Otro',
];

const AMOUNT_PRESETS = [5, 10, 15, 20, 25, 30];

const TIP_PRESETS = [0, 1, 2, 3, 5, 10];

type QuickAmountsProps = {
  presets: number[];
  value: string;
  onSelect: (amount: number) => void;
  accent: 'accent' | 'green';
};

function QuickAmounts({ presets, value, onSelect, accent }: QuickAmountsProps) {
  const currentNum = parseFloat(value) || 0;
  const activeClasses =
    accent === 'accent'
      ? 'border-accent bg-accent/15 text-accent'
      : 'border-green-500 bg-green-500/15 text-green-500';
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {presets.map((amount) => {
        const isActive = currentNum === amount;
        const isZero = amount === 0;
        return (
          <button
            key={amount}
            type="button"
            onClick={() => onSelect(amount)}
            className={`flex items-center justify-center rounded-lg border px-1 py-2 text-xs font-bold transition ${
              isActive
                ? activeClasses
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {isZero ? 'Sin' : `${amount}`}
          </button>
        );
      })}
    </div>
  );
}

export function RegisterForm({ open, onClose, onAdd, percentage }: RegisterFormProps) {
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceAmount, setServiceAmount] = useState('');
  const [tip, setTip] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const amountNum = parseFloat(serviceAmount) || 0;
  const tipNum = parseFloat(tip) || 0;
  const earnings = (amountNum * percentage) / 100;

  const reset = () => {
    setClientName('');
    setServiceName('');
    setServiceAmount('');
    setTip('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setError('Selecciona el tipo de servicio.');
      return;
    }
    if (amountNum <= 0) {
      setError('El monto del servicio debe ser mayor a 0.');
      return;
    }
    setSaving(true);
    setError(null);
    const ok = await onAdd({
      client_name: clientName.trim() || null,
      service_name: serviceName.trim(),
      service_amount: amountNum,
      tip: tipNum,
      service_date: todayISO(),
    });
    setSaving(false);
    if (ok) {
      reset();
      onClose();
    } else {
      setError('No se pudo guardar. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md animate-slide-up rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 pb-8 sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors size={18} className="text-accent" />
            <h2 className="text-lg font-bold text-white">Registrar Servicio</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{formatDayLabel(todayISO())}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Tipo de servicio */}
          <div>
            <MetricLabel className="mb-2">Servicio / Corte</MetricLabel>
            <div className="flex flex-wrap gap-2">
              {SERVICE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setServiceName(preset)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    serviceName === preset
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="O escribe el nombre del servicio"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none"
            />
          </div>

          {/* Cliente */}
          <div>
            <MetricLabel className="mb-2">Cliente (opcional)</MetricLabel>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none"
            />
          </div>

          {/* Monto del servicio */}
          <div>
            <MetricLabel className="mb-2">Monto del Servicio / Corte</MetricLabel>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
                {getActiveCurrency().symbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={serviceAmount}
                onChange={(e) => setServiceAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-8 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none"
              />
            </div>
            <QuickAmounts
              presets={AMOUNT_PRESETS}
              value={serviceAmount}
              onSelect={(amt) => setServiceAmount(String(amt))}
              accent="accent"
            />
          </div>

          {/* Propina */}
          <div>
            <MetricLabel className="mb-2">Propina Recibida</MetricLabel>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
                {getActiveCurrency().symbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-8 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-green-500 focus:outline-none"
              />
            </div>
            <QuickAmounts
              presets={TIP_PRESETS}
              value={tip}
              onSelect={(amt) => setTip(String(amt))}
              accent="green"
            />
          </div>

          {/* Resumen del servicio */}
          {amountNum > 0 && (
            <Card className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <MetricLabel>Total Cobrado Cliente</MetricLabel>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(amountNum + tipNum)}
                </p>
              </div>
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Mi Ganancia ({percentage}%)</span>
                  <span className="font-semibold text-accent">
                    {formatCurrency(earnings)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Propina (100% tuya)</span>
                  <span className="font-semibold text-green-500">
                    {formatCurrency(tipNum)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
                  <span className="text-sm font-semibold text-white">Neto Barbero</span>
                  <span className="text-base font-bold text-accent">
                    {formatCurrency(earnings + tipNum)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-800 py-3 text-sm font-semibold text-zinc-400 hover:bg-zinc-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] rounded-xl bg-accent py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
