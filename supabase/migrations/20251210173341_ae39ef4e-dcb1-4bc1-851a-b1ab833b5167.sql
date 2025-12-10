-- Add reportei_api_key column to users table for individual API keys per client
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS reportei_api_key text;

COMMENT ON COLUMN public.users.reportei_api_key 
IS 'Chave API individual da Reportei para este usuário';