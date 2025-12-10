import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InstagramPost } from "@/hooks/useInstagramPosts";

interface PostsTableProps {
  posts: InstagramPost[];
}

export const PostsTable = ({ posts }: PostsTableProps) => {
  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPostTypeBadge = (type: string | null) => {
    const postType = type?.toLowerCase() || "post";
    
    if (postType.includes("reel")) {
      return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Reel</Badge>;
    }
    if (postType.includes("story")) {
      return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Story</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Post</Badge>;
  };

  return (
    <div className="rounded-3xl border border-gray-800 bg-black overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/50">
            <TableHead className="font-semibold text-gray-400">Tipo</TableHead>
            <TableHead className="font-semibold text-gray-400">Data</TableHead>
            <TableHead className="font-semibold text-right text-gray-400">Views</TableHead>
            <TableHead className="font-semibold text-right text-gray-400">Likes</TableHead>
            <TableHead className="font-semibold text-right text-gray-400">Comentários</TableHead>
            <TableHead className="font-semibold text-right text-gray-400">Salvos</TableHead>
            <TableHead className="font-semibold text-right text-gray-400">Compartilhamentos</TableHead>
            <TableHead className="font-semibold text-right text-gray-400">Engajamento</TableHead>
            <TableHead className="font-semibold text-center text-gray-400">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow 
              key={post.id} 
              className="hover:bg-gray-900/30 border-gray-800"
            >
              <TableCell>{getPostTypeBadge(post.post_type)}</TableCell>
              <TableCell className="text-gray-300">
                {post.published_at
                  ? format(new Date(post.published_at), "dd/MM/yyyy", { locale: ptBR })
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right font-medium text-blue-400">
                {formatNumber(post.views)}
              </TableCell>
              <TableCell className="text-right font-medium text-red-400">
                {formatNumber(post.likes)}
              </TableCell>
              <TableCell className="text-right font-medium text-green-400">
                {formatNumber(post.comments)}
              </TableCell>
              <TableCell className="text-right font-medium text-yellow-400">
                {formatNumber(post.saves)}
              </TableCell>
              <TableCell className="text-right font-medium text-cyan-400">
                {formatNumber(post.shares)}
              </TableCell>
              <TableCell className="text-right">
                <span className="text-primary font-semibold">
                  {post.engagement_rate ? `${post.engagement_rate.toFixed(2)}%` : "0%"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {post.post_url ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-800"
                    onClick={() => window.open(post.post_url!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 text-gray-400 hover:text-primary" />
                  </Button>
                ) : (
                  <span className="text-gray-600 text-xs">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
