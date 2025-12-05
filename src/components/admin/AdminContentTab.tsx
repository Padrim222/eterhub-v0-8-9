import { useState } from "react";
import { Trash2, ExternalLink, Loader2, Eye, Heart, MessageCircle, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminPosts } from "@/hooks/useAdminPosts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminContentTab() {
  const { posts, isLoading, deletePost } = useAdminPosts();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.user_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || post.post_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const postTypes = [...new Set(posts.map(p => p.post_type).filter(Boolean))];

  const handleDelete = () => {
    if (deletePostId) {
      deletePost(deletePostId);
      setDeletePostId(null);
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return "-";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <Input
          placeholder="Buscar por caption, usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {postTypes.map(type => (
              <SelectItem key={type} value={type!}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
          {filteredPosts.length} post(s)
        </Badge>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">Preview</TableHead>
              <TableHead className="text-foreground">Usuário</TableHead>
              <TableHead className="text-foreground">Tipo</TableHead>
              <TableHead className="text-foreground">Métricas</TableHead>
              <TableHead className="text-foreground">Engagement</TableHead>
              <TableHead className="text-foreground">Publicado</TableHead>
              <TableHead className="text-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum post encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id} className="border-border">
                  <TableCell>
                    {post.thumbnail_url ? (
                      <img 
                        src={post.thumbnail_url} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{post.user_nome}</p>
                      <p className="text-sm text-muted-foreground">{post.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.post_type || "Post"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="w-3 h-3" /> {formatNumber(post.likes)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="w-3 h-3" /> {formatNumber(post.comments)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Bookmark className="w-3 h-3" /> {formatNumber(post.saves)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        (post.engagement_rate || 0) > 5 
                          ? "text-green-400 border-green-400/30" 
                          : "text-muted-foreground"
                      }
                    >
                      {post.engagement_rate?.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.published_at 
                      ? format(new Date(post.published_at), "dd/MM/yyyy", { locale: ptBR })
                      : "-"
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {post.post_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletePostId(post.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
