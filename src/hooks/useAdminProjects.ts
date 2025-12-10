import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  nome: string;
  descricao?: string;
  status: string;
  prioridade: string;
  progresso: number;
  data_inicio?: string;
  data_alvo?: string;
  responsavel?: string;
  tags: string[];
  user_id: string;
  user_email?: string;
  user_nome?: string;
}

interface Entrega {
  id: string;
  projeto_id: string;
  nome: string;
  descricao?: string;
  status: string;
  data_alvo?: string;
  data_entrega?: string;
  feedback?: string;
  user_id: string;
  user_email?: string;
  user_nome?: string;
}

export function useAdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      // Get all project data
      const { data: projectData, error: projectsError } = await supabase
        .from("client_project_data")
        .select("user_id, projetos, entregas");

      if (projectsError) throw projectsError;

      // Get all users for mapping
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, nome");

      if (usersError) throw usersError;

      // Flatten projects
      const allProjects: Project[] = [];
      const allEntregas: Entrega[] = [];

      projectData?.forEach(pd => {
        const user = usersData?.find(u => u.id === pd.user_id);
        
        if (Array.isArray(pd.projetos)) {
          pd.projetos.forEach((proj: any) => {
            allProjects.push({
              ...proj,
              user_id: pd.user_id,
              user_email: user?.email || "Desconhecido",
              user_nome: user?.nome || "Sem nome"
            });
          });
        }

        if (Array.isArray(pd.entregas)) {
          pd.entregas.forEach((ent: any) => {
            allEntregas.push({
              ...ent,
              user_id: pd.user_id,
              user_email: user?.email || "Desconhecido",
              user_nome: user?.nome || "Sem nome"
            });
          });
        }
      });

      setProjects(allProjects);
      setEntregas(allEntregas);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return { projects, entregas, isLoading, loadProjects };
}
