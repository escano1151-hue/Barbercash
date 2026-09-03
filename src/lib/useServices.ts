import { useCallback, useEffect, useState } from 'react';
import { supabase, type Service, type ServiceInsert, type Settings } from './supabase';
import { setActiveCurrency } from './supabase';
import { getTheme } from './themes';

export type UseServicesReturn = {
  services: Service[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  addService: (input: ServiceInsert) => Promise<boolean>;
  deleteService: (id: string) => Promise<void>;
  updatePercentage: (percentage: number) => Promise<boolean>;
  updateSettings: (patch: Partial<Pick<Settings, 'barber_percentage' | 'theme' | 'currency'>>) => Promise<boolean>;
  deleteAllServices: () => Promise<boolean>;
  refresh: () => Promise<void>;
};

const SERVICES_KEY = 'barbercash:services';
const SETTINGS_KEY = 'barbercash:settings';

function loadCachedServices(): Service[] {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadCachedSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Settings;
  } catch {
    return null;
  }
}

function persistServices(services: Service[]): void {
  try {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  } catch {
    // storage full or unavailable — non-fatal
  }
}

function persistSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // non-fatal
  }
}

function applySettingsSideEffects(settings: Settings | null): void {
  if (!settings) return;
  setActiveCurrency(settings.currency);
  const theme = getTheme(settings.theme);
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-rgb', theme.accentRgba);
  root.style.setProperty('--accent-soft', theme.accentSoft);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.accent);
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>(() => loadCachedServices());
  const [settings, setSettings] = useState<Settings | null>(() => {
    const cached = loadCachedSettings();
    applySettingsSideEffects(cached);
    return cached;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [servicesRes, settingsRes] = await Promise.all([
      supabase.from('services').select('*').order('service_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    ]);

    if (servicesRes.error) {
      setError(servicesRes.error.message);
    } else if (servicesRes.data) {
      const data = servicesRes.data as Service[];
      setServices(data);
      persistServices(data);
    }

    if (settingsRes.error) {
      setError(settingsRes.error.message);
    } else if (settingsRes.data) {
      const data = settingsRes.data as Settings;
      setSettings(data);
      applySettingsSideEffects(data);
      persistSettings(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addService = useCallback(async (input: ServiceInsert) => {
    const { error: insertError, data } = await supabase
      .from('services')
      .insert(input)
      .select()
      .single();
    if (insertError) {
      setError(insertError.message);
      return false;
    }
    if (data) {
      setServices((prev) => {
        const next = [data as Service, ...prev];
        persistServices(next);
        return next;
      });
    }
    return true;
  }, []);

  const deleteService = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('services').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistServices(next);
      return next;
    });
  }, []);

  const updatePercentage = useCallback(async (percentage: number) => {
    const { error: updateError } = await supabase
      .from('settings')
      .update({ barber_percentage: percentage, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (updateError) {
      setError(updateError.message);
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  const updateSettings = useCallback(
    async (patch: Partial<Pick<Settings, 'barber_percentage' | 'theme' | 'currency'>>) => {
      const { error: updateError } = await supabase
        .from('settings')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', 1);
      if (updateError) {
        setError(updateError.message);
        return false;
      }
      setSettings((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch, updated_at: new Date().toISOString() };
        applySettingsSideEffects(next);
        persistSettings(next);
        return next;
      });
      await refresh();
      return true;
    },
    [refresh],
  );

  const deleteAllServices = useCallback(async () => {
    const { error: deleteError } = await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setServices([]);
    persistServices([]);
    return true;
  }, []);

  return {
    services,
    settings,
    loading,
    error,
    addService,
    deleteService,
    updatePercentage,
    updateSettings,
    deleteAllServices,
    refresh,
  };
}
