-- Remove unused financial module tables (empty / test-only data).
-- Kept: pending_refunds, master_clients, viajar_employees, partner_transactions.

DROP TABLE IF EXISTS public.payment_reconciliation CASCADE;
DROP TABLE IF EXISTS public.flowtrip_usage_metrics CASCADE;
DROP TABLE IF EXISTS public.flowtrip_invoices CASCADE;
DROP TABLE IF EXISTS public.flowtrip_subscriptions CASCADE;
DROP TABLE IF EXISTS public.flowtrip_clients CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.employee_salaries CASCADE;
