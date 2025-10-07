-- Adicionar campo onboarding_completed para controlar se o onboarding foi feito
ALTER TABLE public.users 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- Atualizar usuários existentes que já têm instagram_username
UPDATE public.users 
SET onboarding_completed = true 
WHERE instagram_username IS NOT NULL;