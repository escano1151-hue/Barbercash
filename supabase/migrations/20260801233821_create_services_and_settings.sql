/*
# BarberCash: servicios y configuración (single-tenant, sin auth)

## Resumen
Crea el esquema de datos para la app "BarberCash", enfocada en barberos.
Almacena los servicios/cortes realizados y las propinas recibidas, además de
la configuración del porcentaje de ganancia del barbero. No hay login ni
cuentas: es una app de un solo usuario que se ejecuta con la anon key.

## Tablas nuevas

1. `services`
   - `id` (uuid, pk): identificador del servicio.
   - `client_name` (text, opcional): nombre del cliente.
   - `service_name` (text, not null): tipo de corte o servicio realizado.
   - `service_amount` (numeric, not null): monto cobrado por el servicio.
   - `tip` (numeric, not null default 0): propina recibida.
   - `service_date` (date, not null default current_date): día en que se
     realizó el servicio (sin hora, para agrupar por día).
   - `created_at` (timestamptz, default now()): timestamp de creación.

2. `settings`
   - `id` (int, pk, siempre 1): fila única de configuración global.
   - `barber_percentage` (numeric, not null default 80): porcentaje de las
     ganancias que corresponde al barbero (ej. 80 => 80% del monto del servicio).
   - `updated_at` (timestamptz, default now()): última modificación.

## Seguridad (RLS)
- Activa RLS en ambas tablas.
- Sin login: las políticas usan `TO anon, authenticated` con `USING (true)` /
  `WITH CHECK (true)` porque los datos son intencionalmente compartidos por el
  único usuario de la app (single-tenant, anon-key).

## Notas
- `service_date` es tipo `date` (no timestamp) para agrupar y comparar por día
  sin problemas de zona horaria.
- `barber_percentage` se guarda como número entero/decimal (0-100).
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text,
  service_name text NOT NULL,
  service_amount numeric(10,2) NOT NULL DEFAULT 0,
  tip numeric(10,2) NOT NULL DEFAULT 0,
  service_date date NOT NULL DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_services_service_date ON services(service_date DESC);

CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1,
  barber_percentage numeric(5,2) NOT NULL DEFAULT 80,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT settings_single_row CHECK (id = 1)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

INSERT INTO settings (id, barber_percentage)
VALUES (1, 80)
ON CONFLICT (id) DO NOTHING;