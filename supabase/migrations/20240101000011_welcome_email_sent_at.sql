-- Idempotency guard for the welcome email: set once on first confirmation.
-- The existing profiles_update_own policy covers writes to this column.
alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;
