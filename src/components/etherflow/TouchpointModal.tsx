import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { ProductionStage } from "@/hooks/useEtherflow";

interface TouchpointModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: ProductionStage;
  data?: unknown;
  onApprove: () => void;
  onReject?: () => void;
  onEdit?: () => void;
}

const stageInfo: Record<ProductionStage, { title: string; description: string }> = {
  analysis: {
    title: "Validar Análise",
    description: "Revise os padrões de sucesso identificados antes de prosseguir.",
  },
  ideation: {
    title: "Selecionar Tema",
    description: "Escolha um dos 10 temas sugeridos para desenvolver.",
  },
  research: {
    title: "Validar Pesquisa",
    description: "Revise os insumos coletados para o tema.",
  },
  narrative: {
    title: "Validar Esqueleto Narrativo",
    description: "Confirme a estrutura AIDA e escolha o ângulo narrativo.",
  },
  writing: {
    title: "Aprovar Conteúdo Final",
    description: "Revise o texto final e o score do Style Checker.",
  },
  completed: {
    title: "Produção Concluída",
    description: "O conteúdo foi gerado com sucesso!",
  },
};

export function TouchpointModal({
  open,
  onOpenChange,
  stage,
  data,
  onApprove,
  onReject,
  onEdit,
}: TouchpointModalProps) {
  const info = stageInfo[stage];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Touchpoint: {info.title}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {data && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <pre className="text-xs text-white/80 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2">
          {onReject && (
            <Button variant="outline" onClick={onReject}>
              Rejeitar
            </Button>
          )}
          {onEdit && (
            <Button variant="secondary" onClick={onEdit}>
              Editar
            </Button>
          )}
          <Button onClick={onApprove} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Aprovar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
