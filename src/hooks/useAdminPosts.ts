import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  post_url: string | null;
  thumbnail_url: string | null;
  post_type: string | null;
  likes: number | null;
  comments: number | null;
  views: number | null;
  saves: number | null;
  shares: number | null;
  engagement_rate: number | null;
  published_at: string | null;
  scraped_at: string | null;
  user_email?: string;
  user_nome?: string;
}

export function useAdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      // Get all posts
      const { data: postsData, error: postsError } = await supabase
        .from("ig_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (postsError) throw postsError;

      // Get all users for mapping
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, nome");

      if (usersError) throw usersError;

      // Map users to posts
      const postsWithUsers = (postsData || []).map((post: any) => {
        const user = usersData?.find(u => u.id === post.user_id);
        return {
          id: post.id,
          user_id: post.user_id,
          caption: post.caption,
          post_url: post.post_url,
          thumbnail_url: post.thumbnail_url,
          post_type: post.post_type,
          likes: post.likes,
          comments: post.comments,
          views: post.views,
          saves: post.saves,
          shares: post.shares,
          engagement_rate: post.engagement_rate,
          published_at: post.published_at,
          scraped_at: post.scraped_at,
          user_email: user?.email || "Desconhecido",
          user_nome: user?.nome || "Sem nome"
        };
      });

      setPosts(postsWithUsers as Post[]);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Erro ao carregar posts");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("ig_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast.success("Post deletado com sucesso");
      loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Erro ao deletar post");
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return { posts, isLoading, loadPosts, deletePost };
}