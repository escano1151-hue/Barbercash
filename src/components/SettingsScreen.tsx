import { useState } from 'react';
import {
  Percent,
  Palette,
  Coins,
  Download,
  Trash2,
  Info,
  Check,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import type { Settings } from '../lib/supabase';
import type { UseServicesReturn } from '../lib/useServices';
import { THEMES, CURRENCIES, getCurrency, type CurrencyId } from '../lib/themes';
import { exportServicesCSV } from '../lib/csv';
import { Card } from './ui';

type SettingsScreenProps = {
  settings: Settings | null;
  services: UseServicesReturn['services'];
  onUpdateSettings: UseServicesReturn['updateSettings'];
  onDeleteAll: UseServicesReturn['deleteAllServices'];
};

const PERCENTAGE_PRESETS = [50, 60, 70, 80, 100];

export function SettingsScreen({
  settings,
  services,
  onUpdateSettings,
  onDeleteAll,
}: SettingsScreenProps) {
  const percentage = settings?.barber_percentage ?? 80;
  const currentTheme = settings?.theme ?? 'gold';
  const currentCurrency = settings?.currency ?? 'USD';

  const [pendingPct, setPendingPct] = useState(percentage);
  const [pendingTheme, setPendingTheme] = useState(currentTheme);
  const [pendingCurrency, setPendingCurrency] = useState(currentCurrency);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const hasChanges =
    pendingPct !== percentage || pendingTheme !== currentTheme || pendingCurrency !== currentCurrency;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    const ok = await onUpdateSettings({
      barber_percentage: pendingPct,
      theme: pendingTheme,
      currency: pendingCurrency,
    });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const handleExport = () => {
    if (services.length === 0) return;
    exportServicesCSV(services, pendingPct);
  };

  const handleReset = async () => {
    setResetting(true);
    await onDeleteAll();
    setResetting(false);
    setConfirmReset(false);
  };

  const activeCurrency = getCurrency(pendingCurrency);

  return (
    <div className="space-y-5 pb-24 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">Ajustes</h1>
        <p className="mt-1 text-xs text-zinc-500">Personaliza tu experiencia</p>
      </div>

      {/* SECCIÓN 1: Porcentaje de comisión */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Percent size={18} className="text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Porcentaje de Ganancia
          </h2>
        </div>
        <Card className="space-y-4 p-4">
          <p className="text-xs leading-relaxed text-zinc-500">
            El porcentaje del monto del servicio que corresponde a ti. El resto va a la barbería. Las propinas siempre son 100% tuyas.
          </p>

          <div className="flex flex-wrap gap-2">
            {PERCENTAGE_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPendingPct(p)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  pendingPct === p
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={pendingPct}
              onChange={(e) => setPendingPct(parseInt(e.target.value, 10))}
              className="w-full accent-current"
              style={{ color: 'var(--accent)' }}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-zinc-500">0%</span>
              <span className="text-lg font-bold text-accent">{pendingPct}%</span>
              <span className="text-xs text-zinc-500">100%</span>
            </div>
          </div>
        </Card>
      </section>

      {/* SECCIÓN 2: Temas y paleta de colores */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Palette size={18} className="text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Tema y Color
          </h2>
        </div>
        <Card className="space-y-3 p-4">
          <p className="text-xs text-zinc-500">
            Cambia el color principal de toda la interfaz.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isActive = pendingTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setPendingTheme(theme.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    isActive ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {isActive && <Check size={16} className="text-black" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {theme.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      {/* SECCIÓN 3: Configuración de moneda */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Coins size={18} className="text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Moneda
          </h2>
        </div>
        <Card className="p-4">
          <p className="mb-3 text-xs text-zinc-500">
            Selecciona la moneda para mostrar los montos.
          </p>
          <div className="relative">
            <select
              value={pendingCurrency}
              onChange={(e) => setPendingCurrency(e.target.value as CurrencyId)}
              className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-10 text-sm text-white focus:border-accent focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} — {c.name} ({c.id})
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-xs text-zinc-500">Vista previa:</span>
            <span className="text-sm font-semibold text-accent">
              {activeCurrency.symbol}15.00
            </span>
          </div>
        </Card>
      </section>

      {/* SECCIÓN 4: Exportar y respaldar */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Download size={18} className="text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Datos y Respaldo
          </h2>
        </div>
        <Card className="divide-y divide-zinc-800 p-0">
          <button
            onClick={handleExport}
            disabled={services.length === 0}
            className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-zinc-800/50 disabled:opacity-40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Download size={18} className="text-accent" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Exportar Historial</p>
              <p className="text-xs text-zinc-500">
                Descarga todos los registros en CSV ({services.length} registros)
              </p>
            </div>
          </button>

          <button
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-zinc-800/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
              <Trash2 size={18} className="text-red-500" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Restablecer Datos</p>
              <p className="text-xs text-zinc-500">Borra todo el historial permanentemente</p>
            </div>
          </button>
        </Card>
      </section>

      {/* Info */}
      <Card className="flex items-start gap-3 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-zinc-500" />
        <p className="text-xs leading-relaxed text-zinc-500">
          Los cambios de porcentaje, tema y moneda se guardan al presionar el botón. La exportación y el restablecimiento son inmediatos.
        </p>
      </Card>

      {/* Botón Guardar */}
      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? 'Guardando...' : saved ? '¡Guardado!' : hasChanges ? 'Guardar Cambios' : 'Sin cambios'}
      </button>

      {/* Modal de confirmación para restablecer */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500" />
              </span>
              <h3 className="text-lg font-bold text-white">¿Restablecer datos?</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              Se borrarán <span className="font-semibold text-white">todos</span> los servicios registrados. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
                className="flex-1 rounded-xl border border-zinc-800 py-3 text-sm font-semibold text-zinc-400 hover:bg-zinc-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {resetting ? 'Borrando...' : 'Sí, borrar todo'}
              </button>
            </div>
          </Card>
        </div>
      )}
      {/* Crédito discreto */}
      <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
        <span className="text-[10px] font-medium text-zinc-600">Made in</span>
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-zinc-500 transition hover:text-accent"
        >
          Bolt
        </a>
      </div>
    </div>
  );
}
