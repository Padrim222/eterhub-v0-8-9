import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstagramPost {
  id: string;
  user_id: string;
  post_url: string | null;
  post_type: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  engagement_rate: number | null;
  published_at: string | null;
  scraped_at: string | null;
}

export const useInstagramPosts = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Sessão não encontrada');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('ig_posts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('published_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPosts(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar posts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    posts,
    isLoading,
    error,
    refresh: loadPosts
  };
};
