import { useState } from "react";
import { Target } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(120,255,100,0.08)]">
      <Accordion type="single" collapsible defaultValue="alinhamento">
        <AccordionItem value="alinhamento" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Alinhamento do Projeto
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Por que começamos?
                </h4>
                <EditableField
                  value={data.porque}
                  onChange={(value) => onChange({ ...data, porque: value })}
                  multiline
                  placeholder="Descreva o motivo do início do projeto..."
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Meta Anual
                </h4>
                <EditableField
                  value={data.metaAnual}
                  onChange={(value) => onChange({ ...data, metaAnual: value })}
                  multiline
                  placeholder="Defina a meta anual do projeto..."
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
