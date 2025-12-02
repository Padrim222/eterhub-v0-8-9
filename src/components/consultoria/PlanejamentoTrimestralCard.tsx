import { useState } from "react";
import { Calendar, Target, BarChart3, Zap, ArrowRight, Clock, Plus, Trash2 } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableField } from "./EditableField";

export interface Indicador {
  id: string;
  name: string;
  atual: string;
  meta: string;
}

export interface Iniciativa {
  id: string;
  name: string;
  completed: boolean;
  status: "pendente" | "em_andamento" | "concluido";
}

export interface Sprint {
  id: string;
  name: string;
  start: string;
  end: string;
  status: "planejado" | "ativo" | "concluido";
}

export interface PlanejamentoData {
  metaTrimestral: string;
  indicadores: Indicador[];
  iniciativas: Iniciativa[];
  proximosPassos: string[];
  sprints: Sprint[];
}

interface PlanejamentoTrimestralCardProps {
  data: PlanejamentoData;
  onChange: (data: PlanejamentoData) => void;
}

const statusBadgeConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const },
  em_andamento: { label: "Em Andamento", variant: "default" as const },
  concluido: { label: "Concluído", variant: "outline" as const },
  planejado: { label: "Planejado", variant: "secondary" as const },
  ativo: { label: "Ativo", variant: "default" as const },
};

export const PlanejamentoTrimestralCard = ({ data, onChange }: PlanejamentoTrimestralCardProps) => {
  const updateIndicador = (id: string, field: keyof Indicador, value: string) => {
    const updated = data.indicadores.map((ind) =>
      ind.id === id ? { ...ind, [field]: value } : ind
    );
    onChange({ ...data, indicadores: updated });
  };

  const toggleIniciativa = (id: string) => {
    const updated = data.iniciativas.map((ini) =>
      ini.id === id ? { ...ini, completed: !ini.completed, status: (!ini.completed ? "concluido" : "pendente") as Iniciativa["status"] } : ini
    );
    onChange({ ...data, iniciativas: updated });
  };

  const updateIniciativaName = (id: string, name: string) => {
    const updated = data.iniciativas.map((ini) =>
      ini.id === id ? { ...ini, name } : ini
    );
    onChange({ ...data, iniciativas: updated });
  };

  const updateProximoPasso = (index: number, value: string) => {
    const updated = [...data.proximosPassos];
    updated[index] = value;
    onChange({ ...data, proximosPassos: updated });
  };

  const addProximoPasso = () => {
    onChange({ ...data, proximosPassos: [...data.proximosPassos, ""] });
  };

  const removeProximoPasso = (index: number) => {
    const updated = data.proximosPassos.filter((_, i) => i !== index);
    onChange({ ...data, proximosPassos: updated });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <Accordion type="single" collapsible defaultValue="planejamento">
        <AccordionItem value="planejamento" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-white">
                Planejamento Trimestral
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Accordion type="multiple" defaultValue={["meta", "indicadores", "iniciativas", "proximos", "sprints"]} className="space-y-4">
              {/* Meta Trimestral */}
              <AccordionItem value="meta" className="border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Meta Trimestral
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <EditableField
                    value={data.metaTrimestral}
                    onChange={(value) => onChange({ ...data, metaTrimestral: value })}
                    multiline
                    placeholder="Defina a meta do trimestre..."
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Indicadores */}
              <AccordionItem value="indicadores" className="border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Indicadores do Trimestre
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.indicadores.map((ind) => (
                      <Card key={ind.id} className="bg-gray-800 border-gray-700 p-4">
                        <p className="text-xs text-white/60 mb-2">{ind.name}</p>
                        <div className="flex items-end justify-between gap-4">
                          <div className="flex-1">
                            <span className="text-xs text-white/60">Atual</span>
                            <EditableField
                              value={ind.atual}
                              onChange={(value) => updateIndicador(ind.id, "atual", value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-white/60">Meta</span>
                            <EditableField
                              value={ind.meta}
                              onChange={(value) => updateIndicador(ind.id, "meta", value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Iniciativas */}
              <AccordionItem value="iniciativas" className="border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Iniciativas e Status
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {data.iniciativas.map((ini) => (
                      <div key={ini.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <Checkbox
                          checked={ini.completed}
                          onCheckedChange={() => toggleIniciativa(ini.id)}
                          className="border-primary/50 data-[state=checked]:bg-primary"
                        />
                        <EditableField
                          value={ini.name}
                          onChange={(value) => updateIniciativaName(ini.id, value)}
                          placeholder="Nome da iniciativa..."
                          className="flex-1"
                        />
                        <Badge variant={statusBadgeConfig[ini.status].variant} className="text-xs">
                          {statusBadgeConfig[ini.status].label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Próximos Passos */}
              <AccordionItem value="proximos" className="border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Próximos Passos
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {data.proximosPassos.map((passo, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                        <EditableField
                          value={passo}
                          onChange={(value) => updateProximoPasso(index, value)}
                          placeholder="Próximo passo..."
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProximoPasso(index)}
                          className="shrink-0 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addProximoPasso}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Passo
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Datas dos Sprints */}
              <AccordionItem value="sprints" className="border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Datas dos Sprints
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border border-gray-700 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-800 hover:bg-gray-800">
                          <TableHead className="text-primary font-semibold">Sprint</TableHead>
                          <TableHead className="text-primary font-semibold">Início</TableHead>
                          <TableHead className="text-primary font-semibold">Fim</TableHead>
                          <TableHead className="text-primary font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.sprints.map((sprint) => (
                          <TableRow key={sprint.id} className="border-t border-gray-700 hover:bg-white/5">
                            <TableCell className="font-medium text-white">{sprint.name}</TableCell>
                            <TableCell className="text-white/60">{sprint.start}</TableCell>
                            <TableCell className="text-white/60">{sprint.end}</TableCell>
                            <TableCell>
                              <Badge variant={statusBadgeConfig[sprint.status].variant} className="text-xs">
                                {statusBadgeConfig[sprint.status].label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
