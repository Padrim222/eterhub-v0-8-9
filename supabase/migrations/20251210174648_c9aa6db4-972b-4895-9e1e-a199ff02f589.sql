-- Add unique constraint for upserts on deals table
ALTER TABLE public.deals ADD CONSTRAINT deals_pipedrive_deal_id_user_id_key UNIQUE (pipedrive_deal_id, user_id);

-- Add unique constraint for upserts on leads table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_pipedrive_person_id_user_id_key'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_pipedrive_person_id_user_id_key UNIQUE (pipedrive_person_id, user_id);
  END IF;
END $$;

-- Add unique constraint for movql_metrics
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'movql_metrics_user_id_month_year_key'
  ) THEN
    ALTER TABLE public.movql_metrics ADD CONSTRAINT movql_metrics_user_id_month_year_key UNIQUE (user_id, month_year);
  END IF;
END $$;