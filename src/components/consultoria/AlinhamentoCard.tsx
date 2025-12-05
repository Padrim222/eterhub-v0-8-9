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
    <Card className="bg-black border-gray-800 p-4">
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          <span className="text-base font-semibold text-white">Alinhamento</span>
          <p className="text-xs text-white/50">Por que começamos?</p>
        </div>
        <div className="flex-1">
          <EditableField
            value={data.porque}
            onChange={(value) => onChange({ ...data, porque: value })}
            placeholder="Descreva o motivo do início do projeto..."
            className="text-white/70 text-sm"
          />
        </div>
      </div>
    </Card>
  );
};
