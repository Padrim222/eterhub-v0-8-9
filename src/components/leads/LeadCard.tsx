import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Mail, Phone, TrendingUp, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export const LeadCard = ({ lead, color }: LeadCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          <CardTitle className="text-base font-semibold">
            {lead.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lead.is_qualified && (
              <Badge variant="default" className="text-xs">
                Qualificado
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 text-sm">
          {/* Canal */}
          {lead.source_channel && (
            <div>
              <p className="text-muted-foreground mb-1">Canal</p>
              <Badge variant="outline">{lead.source_channel}</Badge>
            </div>
          )}

          {/* Informações */}
          <div className="space-y-2">
            <p className="text-muted-foreground font-medium">Informações</p>
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="text-xs">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span className="text-xs">{lead.phone}</span>
              </div>
            )}
          </div>

          {/* Dados de Qualificação */}
          <div>
            <p className="text-muted-foreground mb-2 font-medium">
              Dados de Qualificação
            </p>
            {lead.income && (
              <p className="text-xs mb-1">
                Renda: R$ {lead.income.toLocaleString('pt-BR')}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3" />
              <span className="text-xs">
                Qualificação: {lead.qualification_score.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Engajamento */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span className="text-xs">
              Engajamento: {lead.engagement_score.toFixed(1)}
            </span>
          </div>

          {/* Lead Score */}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-semibold">Lead Score</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {lead.lead_score.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};