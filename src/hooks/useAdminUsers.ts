import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string | null;
  nome: string | null;
  instagram_username: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  leader_title: string | null;
  roles: string[];
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Get all users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Get all roles - using type assertion for tables not in types.ts
      const { data: rolesData, error: rolesError } = await (supabase
        .from("user_roles" as any) as any)
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Merge users with their roles
      const usersWithRoles = (usersData || []).map(user => ({
        ...user,
        updated_at: user.updated_at || user.created_at,
        roles: (rolesData || [])
          .filter((r: any) => r.user_id === user.id)
          .map((r: any) => r.role)
      }));

      setUsers(usersWithRoles as User[]);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          nome: updates.nome,
          instagram_username: updates.instagram_username,
          is_active: updates.is_active,
          leader_title: updates.leader_title,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Usuário atualizado com sucesso");
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    }
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: !isActive })
        .eq("id", userId);

      if (error) throw error;

      toast.success(isActive ? "Usuário desativado" : "Usuário ativado");
      loadUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Erro ao alterar status do usuário");
    }
  };

  const toggleAdminRole = async (userId: string, hasAdminRole: boolean) => {
    try {
      if (hasAdminRole) {
        // Remove admin role
        const { error } = await (supabase
          .from("user_roles" as any) as any)
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;
        toast.success("Permissão de admin removida");
      } else {
        // Add admin role
        const { error } = await (supabase
          .from("user_roles" as any) as any)
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;
        toast.success("Permissão de admin concedida");
      }
      loadUsers();
    } catch (error) {
      console.error("Error toggling admin role:", error);
      toast.error("Erro ao alterar permissão de admin");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast.success("Usuário deletado com sucesso");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao deletar usuário");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    isLoading,
    loadUsers,
    updateUser,
    toggleUserActive,
    toggleAdminRole,
    deleteUser
  };
}