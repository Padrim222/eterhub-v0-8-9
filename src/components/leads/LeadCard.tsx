import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Mail, Phone, TrendingUp, Target, Award, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source_channel?: string;
  income?: number;
  qualification_score: number;
  engagement_score: number;
  lead_score: number;
  is_qualified: boolean;
}

interface LeadCardProps {
  lead: Lead;
  color: string;
  onDelete?: (leadId: string) => void;
}

export const LeadCard = ({ lead, color, onDelete }: LeadCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        "border-2"
      )}
      style={{ 
        borderColor: color,
        backgroundColor: `${color}20`
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white">
            {lead.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lead.is_qualified && (
              <Badge variant="default" className="text-xs">
                Qualificado
              </Badge>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-white/60 hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700" onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Excluir Lead</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      Tem certeza que deseja excluir o lead "{lead.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(lead.id)} 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 text-sm">
          {/* Canal */}
          {lead.source_channel && (
            <div>
              <p className="text-white/70 mb-1">Canal</p>
              <Badge variant="outline">{lead.source_channel}</Badge>
            </div>
          )}

          {/* Informações */}
          <div className="space-y-2">
            <p className="text-white/70 font-medium">Informações</p>
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-white/70" />
                <span className="text-xs text-white/90">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-white/70" />
                <span className="text-xs text-white/90">{lead.phone}</span>
              </div>
            )}
          </div>

          {/* Dados de Qualificação */}
          <div>
            <p className="text-white/70 mb-2 font-medium">
              Dados de Qualificação
            </p>
            {lead.income && (
              <p className="text-xs text-white/90 mb-1">
                Renda: R$ {lead.income.toLocaleString('pt-BR')}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-white/70" />
              <span className="text-xs text-white/90">
                Qualificação: {lead.qualification_score.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Engajamento */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-white/90">
              Engajamento: {lead.engagement_score.toFixed(1)}
            </span>
          </div>

          {/* Lead Score */}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">Lead Score</span>
              </div>
              <span className="text-xl font-bold text-white">
                {lead.lead_score.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};