import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Instagram } from "lucide-react";
import type { InstagramPost } from "@/hooks/useInstagramPosts";

interface PostsGridProps {
  posts: InstagramPost[];
  isLoading: boolean;
  error: string | null;
}

export const PostsGrid = ({ posts, isLoading, error }: PostsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar posts: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 p-6 bg-muted/50 rounded-full">
          <Instagram className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
        <p className="text-muted-foreground max-w-md">
          Clique no botão "Importar Dados" no Dashboard para buscar seus posts do Instagram.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
