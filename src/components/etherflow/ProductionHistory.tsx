import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Production {
  id: string;
  name: string;
  current_stage: string;
  status: string;
  updated_at: string;
}

interface ProductionHistoryProps {
  onSelectProduction?: (id: string) => void;
  currentProductionId?: string | null;
}

export function ProductionHistory({ onSelectProduction, currentProductionId }: ProductionHistoryProps) {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;
  const [productions, setProductions] = useState<Production[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProductions = async () => {
      const { data, error } = await supabase
        .from("playbooks")
        .select("id, name, current_stage, status, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setProductions(data);
      }
      setIsLoading(false);
    };

    fetchProductions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("playbooks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playbooks",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchProductions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "in_progress":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "touchpoint":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "in_progress":
        return "Em progresso";
      case "touchpoint":
        return "Aguardando";
      default:
        return "Pendente";
    }
  };

  const getStageLabel = (stage: string) => {
    const stages: Record<string, string> = {
      analysis: "Análise",
      ideation: "Ideação",
      research: "Pesquisa",
      narrative: "Narrativa",
      writing: "Escrita",
      completed: "Concluído",
    };
    return stages[stage] || stage;
  };

  if (isLoading) {
    return (
      <div className="bg-card-dark border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-dark border border-gray-700/50 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700/50">
        <h3 className="font-semibold text-white">Histórico de Produções</h3>
      </div>

      <ScrollArea className="h-[300px]">
        {productions.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <p>Nenhuma produção ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {productions.map((production) => (
              <button
                key={production.id}
                onClick={() => onSelectProduction?.(production.id)}
                className={`w-full text-left px-6 py-4 hover:bg-gray-800/50 transition-colors ${
                  currentProductionId === production.id ? "bg-gray-800/50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{production.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getStageLabel(production.current_stage)}
                      </Badge>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(production.updated_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(production.status)}
                    <span className="text-xs text-white/60">{getStatusLabel(production.status)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
