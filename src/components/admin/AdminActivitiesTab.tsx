import { useState } from "react";
import { Loader2, FolderKanban, Package, MessageSquare, Edit, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminActivities } from "@/hooks/useAdminActivities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoIcons: Record<string, any> = {
  projeto: FolderKanban,
  entrega: Package,
  reuniao: Calendar,
  comentario: MessageSquare,
  alteracao: Edit,
};

const tipoColors: Record<string, string> = {
  projeto: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  entrega: "bg-green-500/20 text-green-400 border-green-500/30",
  reuniao: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  comentario: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  alteracao: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function AdminActivitiesTab() {
  const { activities, isLoading } = useAdminActivities();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === "all" || activity.tipo === tipoFilter;

    return matchesSearch && matchesTipo;
  });

  const tipoOptions = [...new Set(activities.map(a => a.tipo))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Buscar por título, descrição, usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {tipoOptions.map(tipo => (
              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-muted-foreground">
          {filteredActivities.length} atividade(s)
        </Badge>
      </div>

      <div className="space-y-2">
        {filteredActivities.map((activity) => {
          const Icon = tipoIcons[activity.tipo] || Edit;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className={`p-2 rounded-lg ${tipoColors[activity.tipo] || "bg-muted"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-foreground">{activity.titulo}</h4>
                  <Badge variant="outline" className="text-xs">
                    {activity.tipo}
                  </Badge>
                </div>
                {activity.descricao && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {activity.descricao}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{activity.user_nome || activity.user_email}</span>
                  <span>•</span>
                  <span>
                    {activity.created_at 
                      ? format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : "-"
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma atividade encontrada
          </div>
        )}
      </div>
    </div>
  );
}
