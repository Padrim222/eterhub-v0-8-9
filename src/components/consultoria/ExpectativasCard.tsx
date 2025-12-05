import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditableField } from "./EditableField";

export interface Expectativa {
  id: string;
  name: string;
  value: string;
  status: "pendente" | "em_progresso" | "concluido" | "atrasado";
}

interface ExpectativasCardProps {
  data: Expectativa[];
  onChange: (data: Expectativa[]) => void;
}

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-muted text-muted-foreground" },
  em_progresso: { label: "Em Progresso", color: "bg-yellow-500/20 text-yellow-400" },
  concluido: { label: "Concluído", color: "bg-primary/20 text-primary" },
  atrasado: { label: "Atrasado", color: "bg-red-500/20 text-red-400" },
};

export const ExpectativasCard = ({ data, onChange }: ExpectativasCardProps) => {
  const updateExpectativa = (id: string, field: keyof Expectativa, value: string) => {
    const updated = data.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onChange(updated);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-800">
        <div className="p-2 bg-primary/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Expectativas</h3>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-800/50 hover:bg-gray-800/50 border-gray-700">
            <TableHead className="text-white/60 font-medium">Métrica</TableHead>
            <TableHead className="text-white/60 font-medium">Valor</TableHead>
            <TableHead className="text-white/60 font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((exp) => (
            <TableRow key={exp.id} className="border-gray-700 hover:bg-white/5">
              <TableCell className="font-medium text-white">
                {exp.name}
              </TableCell>
              <TableCell>
                <EditableField
                  value={exp.value}
                  onChange={(value) => updateExpectativa(exp.id, "value", value)}
                  placeholder="Definir valor..."
                />
              </TableCell>
              <TableCell>
                <Select
                  value={exp.status}
                  onValueChange={(value) => updateExpectativa(exp.id, "status", value)}
                >
                  <SelectTrigger className={`w-[140px] border-0 ${statusConfig[exp.status].color}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
