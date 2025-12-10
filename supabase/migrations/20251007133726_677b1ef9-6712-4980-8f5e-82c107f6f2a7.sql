-- Habilitar RLS na tabela profiles_backup para corrigir warning de segurança
ALTER TABLE public.profiles_backup ENABLE ROW LEVEL SECURITY;