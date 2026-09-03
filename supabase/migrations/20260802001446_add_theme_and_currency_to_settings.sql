/*
# Añadir columnas theme y currency a settings

## Resumen
Amplía la tabla `settings` para soportar selección de tema de color y moneda.
Estas preferencias son persistentes y se aplican dinámicamente en toda la app.

## Tablas modificadas
1. `settings`
   - Nueva columna `theme` (text, not null, default 'gold'): identificador del
     tema de color ('gold', 'neon-green', 'classic-red', 'steel-blue').
   - Nueva columna `currency` (text, not null, default 'USD'): código de moneda
     ('USD', 'EUR', 'MXN', 'PEN', 'COP', 'ARS', 'GBP', 'GTQ').

## Seguridad
- No se modifican políticas existentes. Las políticas de `settings` ya permiten
  CRUD completo a anon y authenticated (single-tenant, sin auth).

## Notas
- Usa `ADD COLUMN IF NOT EXISTS` para ser idempotente.
- No se eliminan ni renombran columnas existentes.
*/

ALTER TABLE settings ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'gold';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';