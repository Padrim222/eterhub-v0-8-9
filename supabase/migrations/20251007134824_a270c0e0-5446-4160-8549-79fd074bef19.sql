-- Adicionar coluna caption para armazenar legendas dos posts do Instagram
ALTER TABLE public.ig_posts 
ADD COLUMN IF NOT EXISTS caption TEXT;