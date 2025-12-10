import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FolderOpen, Package, Calendar, MessageSquare, Settings, History } from "lucide-react";
import { useClientActivities, type Activity } from "@/hooks/useClientActivities";
import { useState, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoConfig: Record<Activity['tipo'], { icon: React.ElementType; color: string; label: string }> = {
  projeto: { icon: FolderOpen, color: "bg-primary/20 text-primary", label: "Projeto" },
  entrega: { icon: Package, color: "bg-green-500/20 text-green-500", label: "Entrega" },
  reuniao: { icon: Calendar, color: "bg-blue-500/20 text-blue-400", label: "Reunião" },
  comentario: { icon: MessageSquare, color: "bg-yellow-500/20 text-yellow-500", label: "Comentário" },
  alteracao: { icon: Settings, color: "bg-muted text-muted-foreground", label: "Alteração" },
};

export const HistoricoTab = () => {
  const { activities, isLoading } = useClientActivities();
  const [filterTipo, setFilterTipo] = useState<string>("all");

  const filteredActivities = useMemo(() => {
    if (filterTipo === "all") return activities;
    return activities.filter(a => a.tipo === filterTipo);
  }, [activities, filterTipo]);

  // Agrupar por data
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    
    filteredActivities.forEach(activity => {
      const date = activity.data ? parseISO(activity.data) : new Date();
      const dateKey = isValid(date) ? format(date, 'yyyy-MM-dd') : 'invalid';
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, items]) => ({
        date: dateKey !== 'invalid' ? parseISO(dateKey) : new Date(),
        items,
      }));
  }, [filteredActivities]);

  const formatDate = (date: Date) => {
    if (!isValid(date)) return "Data inválida";
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "";
    return format(date, "HH:mm");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Histórico de Atividades</h2>
          <p className="text-sm text-muted-foreground">
            {filteredActivities.length} atividade(s) registrada(s)
          </p>
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(tipoConfig).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {filteredActivities.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma atividade registrada ainda.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            O histórico será preenchido automaticamente conforme você criar projetos e entregas.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedActivities.map(({ date, items }) => (
            <div key={date.toISOString()}>
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                <h3 className="text-sm font-medium text-muted-foreground capitalize">
                  {formatDate(date)}
                </h3>
              </div>
              <div className="relative pl-6 border-l border-border space-y-4 mt-4">
                {items.map(activity => {
                  const Icon = tipoConfig[activity.tipo]?.icon || Settings;
                  const config = tipoConfig[activity.tipo] || tipoConfig.alteracao;
                  
                  return (
                    <div key={activity.id} className="relative">
                      {/* Ponto na timeline */}
                      <div className={`absolute -left-[25px] p-1.5 rounded-full ${config.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      
                      <Card className="bg-card border-border p-4 ml-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(activity.data)}
                              </span>
                            </div>
                            <h4 className="font-medium text-foreground">{activity.titulo}</h4>
                            {activity.descricao && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
