import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EditableField } from "./EditableField";

interface AlinhamentoData {
  porque: string;
  metaAnual: string;
}

interface AlinhamentoCardProps {
  data: AlinhamentoData;
  onChange: (data: AlinhamentoData) => void;
}

export const AlinhamentoCard = ({ data, onChange }: AlinhamentoCardProps) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm p-4">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-semibold text-white">Alinhamento</span>
            <p className="text-sm text-white/60">Por que começamos?</p>
          </div>
        </div>
        <div className="flex-1 text-right">
          <EditableField
            value={data.porque}
            onChange={(value) => onChange({ ...data, porque: value })}
            placeholder="Descreva o motivo do início do projeto..."
            className="text-white/80"
          />
        </div>
      </div>
    </Card>
  );
};
