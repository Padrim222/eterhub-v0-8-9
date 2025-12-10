import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Get user ID from userProfile
const getUserId = (userProfile: { id?: string } | null) => userProfile?.id;

export type ProductionStage = "analysis" | "ideation" | "research" | "narrative" | "writing" | "completed";
export type ProductionStatus = "pending" | "in_progress" | "touchpoint" | "completed" | "error";

export interface Theme {
  rank: number;
  title: string;
  justification: string;
  suggested_format: string;
  format_justification: string;
}

export interface ProductionState {
  playbook_id: string | null;
  analysis_id: string | null;
  research_map_id: string | null;
  narrative_skeleton_id: string | null;
  content_id: string | null;
  current_stage: ProductionStage;
  status: ProductionStatus;
  themes: Theme[];
  selected_theme_index: number | null;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  stage?: ProductionStage;
  data?: unknown;
}

const initialState: ProductionState = {
  playbook_id: null,
  analysis_id: null,
  research_map_id: null,
  narrative_skeleton_id: null,
  content_id: null,
  current_stage: "analysis",
  status: "pending",
  themes: [],
  selected_theme_index: null,
};

export function useEtherflow() {
  const { userProfile } = useAuth();
  const userId = getUserId(userProfile);
  const [production, setProduction] = useState<ProductionState>(initialState);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const addMessage = useCallback((message: Omit<AgentMessage, "id" | "timestamp">) => {
    const newMessage: AgentMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Stage 1: Start analysis
  const startAnalysis = useCallback(async (clientContext?: string) => {
    if (!userId) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsLoading(true);
    addMessage({
      role: "system",
      content: "Iniciando análise de métricas do Instagram...",
      stage: "analysis",
    });

    try {
      const response = await supabase.functions.invoke("analyze-metrics", {
        body: { user_id: userId },
      });

      if (response.error) throw response.error;

      const { analysis_id, analysis_result } = response.data;

      setProduction((prev) => ({
        ...prev,
        analysis_id,
        current_stage: "analysis",
        status: "completed",
      }));

      addMessage({
        role: "assistant",
        content: `Análise concluída! Encontrei ${analysis_result?.top_posts?.length || 0} posts de alta performance.`,
        stage: "analysis",
        data: analysis_result,
      });

      // Auto-proceed to ideation
      await generateThemes(analysis_id, clientContext);
    } catch (error) {
      console.error("Error in startAnalysis:", error);
      toast.error("Erro ao analisar métricas");
      addMessage({
        role: "system",
        content: "Erro ao analisar métricas. Tente novamente.",
        stage: "analysis",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, addMessage]);

  // Stage 2: Generate themes
  const generateThemes = useCallback(async (analysisId: string, clientContext?: string) => {
    if (!userId) return;

    setIsLoading(true);
    setProduction((prev) => ({ ...prev, current_stage: "ideation", status: "in_progress" }));
    
    addMessage({
      role: "system",
      content: "Gerando 10 temas virais com base nos padrões de sucesso...",
      stage: "ideation",
    });

    try {
      const response = await supabase.functions.invoke("generate-themes", {
        body: {
          user_id: userId,
          analysis_id: analysisId,
          client_context: clientContext,
          playbook_id: production.playbook_id,
        },
      });

      if (response.error) throw response.error;

      const { playbook_id, themes } = response.data;

      setProduction((prev) => ({
        ...prev,
        playbook_id,
        analysis_id: analysisId,
        themes: themes || [],
        current_stage: "ideation",
        status: "touchpoint",
      }));

      addMessage({
        role: "assistant",
        content: `Gerei 10 temas com alto potencial de viralização! Selecione um para prosseguir:`,
        stage: "ideation",
        data: themes,
      });
    } catch (error) {
      console.error("Error in generateThemes:", error);
      toast.error("Erro ao gerar temas");
    } finally {
      setIsLoading(false);
    }
  }, [userId, production.playbook_id, addMessage]);

  // Stage 3: Deep research on selected theme
  const startResearch = useCallback(async (themeIndex: number) => {
    if (!userId || !production.playbook_id) return;

    const selectedTheme = production.themes[themeIndex];
    if (!selectedTheme) return;

    setIsLoading(true);
    setProduction((prev) => ({
      ...prev,
      selected_theme_index: themeIndex,
      current_stage: "research",
      status: "in_progress",
    }));

    addMessage({
      role: "user",
      content: `Selecionei o tema: "${selectedTheme.title}"`,
      stage: "research",
    });

    addMessage({
      role: "system",
      content: `Iniciando pesquisa profunda sobre "${selectedTheme.title}"...`,
      stage: "research",
    });

    try {
      const response = await supabase.functions.invoke("deep-research", {
        body: {
          user_id: userId,
          playbook_id: production.playbook_id,
          theme_index: themeIndex,
          theme_title: selectedTheme.title,
        },
      });

      if (response.error) throw response.error;

      const { research_map_id, map_data } = response.data;

      setProduction((prev) => ({
        ...prev,
        research_map_id,
        current_stage: "research",
        status: "completed",
      }));

      addMessage({
        role: "assistant",
        content: `Pesquisa concluída! Coletei ${map_data?.numerical_data?.length || 0} dados numéricos, ${map_data?.cases?.length || 0} cases e diversos insumos narrativos.`,
        stage: "research",
        data: map_data,
      });

      // Auto-proceed to narrative building
      await buildNarrative(research_map_id, selectedTheme.suggested_format);
    } catch (error) {
      console.error("Error in startResearch:", error);
      toast.error("Erro na pesquisa");
    } finally {
      setIsLoading(false);
    }
  }, [userId, production.playbook_id, production.themes, addMessage]);

  // Stage 4: Build narrative skeleton
  const buildNarrative = useCallback(async (researchMapId: string, formatDefined?: string) => {
    if (!userId) return;

    setIsLoading(true);
    setProduction((prev) => ({ ...prev, current_stage: "narrative", status: "in_progress" }));

    addMessage({
      role: "system",
      content: "Construindo esqueleto narrativo AIDA...",
      stage: "narrative",
    });

    try {
      const response = await supabase.functions.invoke("build-narrative", {
        body: {
          user_id: userId,
          research_map_id: researchMapId,
          format_defined: formatDefined,
        },
      });

      if (response.error) throw response.error;

      const { narrative_skeleton_id, skeleton_structure } = response.data;

      setProduction((prev) => ({
        ...prev,
        narrative_skeleton_id,
        current_stage: "narrative",
        status: "touchpoint",
      }));

      addMessage({
        role: "assistant",
        content: `Esqueleto narrativo criado com ${skeleton_structure?.blocks?.length || 4} blocos AIDA e ${skeleton_structure?.angle_variations?.length || 3} variações de ângulo. Valide a estrutura para prosseguir.`,
        stage: "narrative",
        data: skeleton_structure,
      });
    } catch (error) {
      console.error("Error in buildNarrative:", error);
      toast.error("Erro ao construir narrativa");
    } finally {
      setIsLoading(false);
    }
  }, [userId, addMessage]);

  // Stage 5: Write final content
  const writeContent = useCallback(async (selectedAngle?: string, toneOfVoiceGuide?: string) => {
    if (!userId || !production.narrative_skeleton_id) return;

    setIsLoading(true);
    setProduction((prev) => ({ ...prev, current_stage: "writing", status: "in_progress" }));

    addMessage({
      role: "system",
      content: "Escrevendo texto final com Style Checker...",
      stage: "writing",
    });

    try {
      const response = await supabase.functions.invoke("write-content", {
        body: {
          user_id: userId,
          narrative_skeleton_id: production.narrative_skeleton_id,
          selected_angle: selectedAngle,
          tone_of_voice_guide: toneOfVoiceGuide,
        },
      });

      if (response.error) throw response.error;

      const { content_id, content_data, style_score, status } = response.data;

      setProduction((prev) => ({
        ...prev,
        content_id,
        current_stage: "completed",
        status: "completed",
      }));

      addMessage({
        role: "assistant",
        content: `Roteiro finalizado! Score do Style Checker: ${style_score?.toFixed(1)}/10 (${status === "approved" ? "✅ Aprovado" : "⚠️ Requer revisão"})`,
        stage: "writing",
        data: content_data,
      });

      toast.success("Conteúdo gerado com sucesso!");
    } catch (error) {
      console.error("Error in writeContent:", error);
      toast.error("Erro ao escrever conteúdo");
    } finally {
      setIsLoading(false);
    }
  }, [userId, production.narrative_skeleton_id, addMessage]);

  // Reset production line
  const resetProduction = useCallback(() => {
    setProduction(initialState);
    setMessages([]);
    setStreamingContent("");
  }, []);

  // Load existing production
  const loadProduction = useCallback(async (playbookId: string) => {
    if (!userId) return;

    try {
      const { data: playbook, error } = await supabase
        .from("playbooks")
        .select("*")
        .eq("id", playbookId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      setProduction({
        playbook_id: playbook.id,
        analysis_id: playbook.analysis_id,
        research_map_id: null,
        narrative_skeleton_id: null,
        content_id: null,
        current_stage: playbook.current_stage as ProductionStage || "analysis",
        status: playbook.status as ProductionStatus || "pending",
        themes: (Array.isArray(playbook.themes) ? playbook.themes : []) as unknown as Theme[],
        selected_theme_index: null,
      });
    } catch (error) {
      console.error("Error loading production:", error);
      toast.error("Erro ao carregar produção");
    }
  }, [userId]);

  return {
    production,
    messages,
    isLoading,
    streamingContent,
    startAnalysis,
    generateThemes,
    startResearch,
    buildNarrative,
    writeContent,
    resetProduction,
    loadProduction,
    addMessage,
  };
}
