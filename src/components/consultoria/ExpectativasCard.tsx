import { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(120,255,100,0.08)]">
      <Accordion type="single" collapsible defaultValue="expectativas">
        <AccordionItem value="expectativas" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Expectativas
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="border border-primary/20 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10 hover:bg-primary/10">
                    <TableHead className="text-primary font-semibold">Métrica</TableHead>
                    <TableHead className="text-primary font-semibold">Valor</TableHead>
                    <TableHead className="text-primary font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((exp) => (
                    <TableRow key={exp.id} className="border-t border-primary/10 hover:bg-primary/5">
                      <TableCell className="font-medium text-foreground">
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
