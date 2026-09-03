import type { Service } from './supabase';
import { formatDayLabel } from './format';

export function exportServicesCSV(services: Service[], percentage: number): void {
  const headers = [
    'Fecha',
    'Cliente',
    'Servicio',
    'Monto Servicio',
    'Propina',
    'Total Cobrado',
    'Ganancia Barbero',
    'Neto Barbero',
  ];

  const rows = [...services]
    .sort((a, b) => (a.service_date < b.service_date ? 1 : -1))
    .map((s) => {
      const amount = Number(s.service_amount) || 0;
      const tip = Number(s.tip) || 0;
      const earnings = (amount * percentage) / 100;
      return [
        formatDayLabel(s.service_date),
        s.client_name ?? '',
        s.service_name,
        amount.toFixed(2),
        tip.toFixed(2),
        (amount + tip).toFixed(2),
        earnings.toFixed(2),
        (earnings + tip).toFixed(2),
      ];
    });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `barbercash-historial-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
