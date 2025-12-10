import { useState } from "react";
import { Edit, Trash2, Shield, ShieldOff, UserCheck, UserX, Loader2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminUsersTab() {
  const { users, isLoading, updateUser, toggleUserActive, toggleAdminRole, deleteUser } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: "", instagram_username: "", leader_title: "" });

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.instagram_username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome || "",
      instagram_username: user.instagram_username || "",
      leader_title: user.leader_title || "",
    });
  };

  const handleSave = () => {
    if (editingUser) {
      updateUser(editingUser.id, formData);
      setEditingUser(null);
    }
  };

  const handleDelete = () => {
    if (deleteUserId) {
      deleteUser(deleteUserId);
      setDeleteUserId(null);
    }
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
          placeholder="Buscar por nome, email ou Instagram..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
        />
        <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
          {filteredUsers.length} usuário(s)
        </Badge>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">Nome</TableHead>
              <TableHead className="text-foreground">Email</TableHead>
              <TableHead className="text-foreground">Instagram</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Role</TableHead>
              <TableHead className="text-foreground">Criado em</TableHead>
              <TableHead className="text-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  {user.nome || "Sem nome"}
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.instagram_username ? `@${user.instagram_username}` : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active !== false ? "default" : "destructive"}>
                    {user.is_active !== false ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.roles.includes("admin") ? (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Usuário
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.created_at 
                    ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })
                    : "-"
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleUserActive(user.id, user.is_active !== false)}
                      className="h-8 w-8"
                    >
                      {user.is_active !== false ? (
                        <UserX className="h-4 w-4 text-red-400" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleAdminRole(user.id, user.roles.includes("admin"))}
                      className="h-8 w-8"
                    >
                      {user.roles.includes("admin") ? (
                        <ShieldOff className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteUserId(user.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Instagram</label>
              <Input
                value={formData.instagram_username}
                onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                placeholder="username (sem @)"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Título</label>
              <Input
                value={formData.leader_title}
                onChange={(e) => setFormData({ ...formData, leader_title: e.target.value })}
                placeholder="Ex: CEO, Diretor de Marketing"
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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
