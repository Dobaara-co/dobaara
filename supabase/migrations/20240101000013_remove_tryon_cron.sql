-- Remove the poll-tryon pg_cron job (jobid 1, schedule */2 * * * *).
-- The generate-tryon and poll-tryon edge functions are kept for now but no longer called from the app.
SELECT cron.unschedule('poll-tryon');
