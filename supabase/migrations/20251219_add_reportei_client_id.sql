-- Add reportei_client_id column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS reportei_client_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_reportei_client_id 
ON public.users(reportei_client_id) 
WHERE reportei_client_id IS NOT NULL;

-- Comment
COMMENT ON COLUMN public.users.reportei_client_id IS 'ID do cliente/projeto selecionado na Reportei';
