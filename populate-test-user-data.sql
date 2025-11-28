-- Popular dados de teste para brufab222@gmail.com
-- Execute este SQL no Supabase SQL Editor

-- 1. Atualizar perfil do usuário com dados do Davi Ribas
UPDATE public.users
SET 
  nome = 'Davi Ribas',
  instagram_username = '@soudaviribas',
  leader_title = 'CEO - ETER',
  avatar_url = '/leader-davi.png',
  is_active = true,
  onboarding_completed = true,
  updated_at = NOW()
WHERE email = 'brufab222@gmail.com';

-- 2. Limpar posts antigos (se existirem)
DELETE FROM public.ig_posts 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'brufab222@gmail.com');

-- 3. Inserir 10 posts mockados do Instagram com métricas realistas
INSERT INTO public.ig_posts (
  user_id, 
  post_url, 
  thumbnail_url,
  post_type, 
  caption, 
  views, 
  likes, 
  comments, 
  saves, 
  shares, 
  engagement_rate, 
  published_at,
  scraped_at
)
SELECT 
  u.id,
  'https://www.instagram.com/p/' || post_data.shortcode,
  'https://picsum.photos/seed/' || post_data.shortcode || '/400/400',
  post_data.post_type,
  post_data.caption,
  post_data.views,
  post_data.likes,
  post_data.comments,
  post_data.saves,
  post_data.shares,
  ROUND((post_data.likes + post_data.comments + post_data.saves)::numeric / NULLIF(post_data.views, 0) * 100, 2),
  post_data.published_at,
  NOW()
FROM public.users u
CROSS JOIN (
  VALUES 
    ('DOUffdoEfYF', 'reel', '🔥 O segredo para crescer no Instagram em 2025...', 45230, 3420, 287, 892, 156, NOW() - INTERVAL '2 days'),
    ('DNxK8mPpQrT', 'reel', '3 erros que estão matando seu engajamento 📉', 38540, 2890, 234, 567, 89, NOW() - INTERVAL '5 days'),
    ('DMwJ7nOpRsU', 'carousel', 'O framework que usei para triplicar meus resultados 📈', 28760, 2150, 189, 423, 67, NOW() - INTERVAL '8 days'),
    ('DLvI6mNoQrV', 'reel', 'Por que você ainda não tem 10k seguidores? 🤔', 52340, 4120, 356, 1024, 234, NOW() - INTERVAL '12 days'),
    ('DKuH5lMnPqW', 'image', 'Bastidores do novo projeto ETER 🚀', 15670, 1890, 145, 234, 45, NOW() - INTERVAL '15 days'),
    ('DJtG4kLmOpX', 'reel', 'Como criar conteúdo que VENDE 💰', 67890, 5230, 478, 1567, 345, NOW() - INTERVAL '18 days'),
    ('DIsFcjKlNoY', 'carousel', '5 ferramentas que uso todo dia para criar conteúdo', 23450, 1780, 156, 389, 78, NOW() - INTERVAL '22 days'),
    ('DHrE2iJkMnZ', 'reel', 'A verdade sobre algoritmo do Instagram...', 89540, 6780, 623, 2134, 456, NOW() - INTERVAL '25 days'),
    ('DGqD1hIjLmA', 'image', 'Novo escritório da ETER! 🏢', 12340, 1450, 98, 156, 23, NOW() - INTERVAL '28 days'),
    ('DFpC0gHiKlB', 'reel', 'Repost: O que ninguém te conta sobre empreender', 34560, 2670, 213, 678, 123, NOW() - INTERVAL '32 days')
) AS post_data(shortcode, post_type, caption, views, likes, comments, saves, shares, published_at)
WHERE u.email = 'brufab222@gmail.com';

-- 4. Verificar resultados
SELECT 
  'Perfil atualizado:' as status,
  nome,
  instagram_username,
  leader_title
FROM public.users 
WHERE email = 'brufab222@gmail.com'

UNION ALL

SELECT 
  'Posts inseridos:' as status,
  COUNT(*)::text as nome,
  '' as instagram_username,
  '' as leader_title
FROM public.ig_posts 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'brufab222@gmail.com');
