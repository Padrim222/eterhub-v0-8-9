import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// Interfaces para tipagem
export interface AlinhamentoData {
  porque: string;
  metaAnual: string;
}

export interface Expectativa {
  id: string;
  name: string;
  value: string;
  status: "pendente" | "em_progresso" | "concluido" | "atrasado";
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
}

export interface Indicador {
  id: string;
  name: string;
  atual: string;
  meta: string;
}

export interface Iniciativa {
  id: string;
  name: string;
  completed: boolean;
  status: "pendente" | "em_andamento" | "concluido";
}

export interface Sprint {
  id: string;
  name: string;
  start: string;
  end: string;
  status: "planejado" | "ativo" | "concluido";
}

export interface PlanejamentoData {
  metaTrimestral: string;
  indicadores: Indicador[];
  iniciativas: Iniciativa[];
  proximosPassos: string[];
  sprints: Sprint[];
}

export interface RetrospectiveData {
  keepDoing: string[];
  stopDoing: string[];
  startDoing: string[];
}

export interface ClientProjectData {
  alinhamento: AlinhamentoData;
  expectativas: Expectativa[];
  links: LinkItem[];
  planejamento: PlanejamentoData;
  retrospectiva: RetrospectiveData;
}

// Valores padrão
const defaultData: ClientProjectData = {
  alinhamento: { porque: "", metaAnual: "" },
  expectativas: [
    { id: "1", name: "Payback", value: "", status: "pendente" },
    { id: "2", name: "Total Value", value: "", status: "pendente" },
    { id: "3", name: "Expectativas Qualitativas", value: "", status: "pendente" },
  ],
  links: [],
  planejamento: {
    metaTrimestral: "",
    indicadores: [
      { id: "1", name: "Leads Qualificados", atual: "", meta: "" },
      { id: "2", name: "Taxa de Conversão", atual: "", meta: "" },
      { id: "3", name: "NPS", atual: "", meta: "" },
      { id: "4", name: "Receita", atual: "", meta: "" },
    ],
    iniciativas: [
      { id: "A1", name: "Iniciativa A1", completed: false, status: "pendente" },
      { id: "A2", name: "Iniciativa A2", completed: false, status: "pendente" },
      { id: "A3", name: "Iniciativa A3", completed: false, status: "pendente" },
      { id: "A4", name: "Iniciativa A4", completed: false, status: "pendente" },
      { id: "A5", name: "Iniciativa A5", completed: false, status: "pendente" },
      { id: "A6", name: "Iniciativa A6", completed: false, status: "pendente" },
    ],
    proximosPassos: [""],
    sprints: [
      { id: "1", name: "Sprint 1", start: "01/01", end: "14/01", status: "concluido" },
      { id: "2", name: "Sprint 2", start: "15/01", end: "28/01", status: "ativo" },
      { id: "3", name: "Sprint 3", start: "29/01", end: "11/02", status: "planejado" },
      { id: "4", name: "Sprint 4", start: "12/02", end: "25/02", status: "planejado" },
    ],
  },
  retrospectiva: { keepDoing: [""], stopDoing: [""], startDoing: [""] },
};

export const useClientProjectData = () => {
  const [data, setData] = useState<ClientProjectData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados do banco
  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data: projectData, error } = await supabase
        .from('client_project_data')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (projectData) {
        setData({
          alinhamento: (projectData.alinhamento as unknown as AlinhamentoData) || defaultData.alinhamento,
          expectativas: (projectData.expectativas as unknown as Expectativa[]) || defaultData.expectativas,
          links: (projectData.links as unknown as LinkItem[]) || defaultData.links,
          planejamento: (projectData.planejamento as unknown as PlanejamentoData) || defaultData.planejamento,
          retrospectiva: (projectData.retrospectiva as unknown as RetrospectiveData) || defaultData.retrospectiva,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do projeto');
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar dados no banco (upsert)
  const saveData = async (newData: ClientProjectData) => {
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sessão não encontrada');
        return false;
      }

      const { error } = await supabase
        .from('client_project_data')
        .upsert({
          user_id: session.user.id,
          alinhamento: newData.alinhamento as unknown as Json,
          expectativas: newData.expectativas as unknown as Json,
          links: newData.links as unknown as Json,
          planejamento: newData.planejamento as unknown as Json,
          retrospectiva: newData.retrospectiva as unknown as Json,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setData(newData);
      toast.success('Alterações salvas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    setData,
    isLoading,
    isSaving,
    saveData,
    refetch: loadData,
  };
};
