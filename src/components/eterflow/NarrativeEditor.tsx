import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle, ArrowRight } from "lucide-react";

interface NarrativeBlock {
  stage: string;
  block_number: number;
  objective: string;
  content_central: string;
  psychological_principle: string;
  suggested_duration: string;
}

interface AngleVariation {
  angle: string;
  tone: string;
  application: string;
}

interface SkeletonStructure {
  theme_title: string;
  format: string;
  blocks: NarrativeBlock[];
  angle_variations: AngleVariation[];
  validation_notes?: string;
}

interface NarrativeEditorProps {
  skeleton: SkeletonStructure;
  onApprove: (selectedAngle: string) => void;
  isLoading?: boolean;
}

const stageColors: Record<string, string> = {
  "ATENÇÃO": "bg-red-500/20 text-red-400 border-red-500/50",
  "INTERESSE": "bg-blue-500/20 text-blue-400 border-blue-500/50",
  "DESEJO": "bg-purple-500/20 text-purple-400 border-purple-500/50",
  "AÇÃO": "bg-green-500/20 text-green-400 border-green-500/50",
};

export function NarrativeEditor({ skeleton, onApprove, isLoading }: NarrativeEditorProps) {
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);

  return (
    <Card className="bg-card-dark border-gray-700/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Esqueleto Narrativo AIDA
            </h3>
            <p className="text-sm text-white/50 mt-1">{skeleton.theme_title}</p>
          </div>
          <Badge variant="outline">{skeleton.format}</Badge>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-6 space-y-4">
          {/* AIDA Blocks */}
          {skeleton.blocks?.map((block, index) => (
            <div
              key={index}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{block.block_number}</span>
                </div>
                <Badge className={stageColors[block.stage] || "bg-gray-500/20 text-gray-400"}>
                  {block.stage}
                </Badge>
                <span className="text-xs text-white/50">{block.suggested_duration}</span>
              </div>
              
              <div className="space-y-2 pl-11">
                <div>
                  <p className="text-xs text-white/50">Objetivo:</p>
                  <p className="text-sm text-white">{block.objective}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Conteúdo Central:</p>
                  <p className="text-sm text-white/80">{block.content_central}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Princípios:</span>
                  <Badge variant="outline" className="text-xs">{block.psychological_principle}</Badge>
                </div>
              </div>
            </div>
          ))}

          {/* Validation Notes */}
          {skeleton.validation_notes && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-sm text-yellow-200">{skeleton.validation_notes}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Angle Selection */}
      <div className="px-6 py-4 border-t border-gray-700/50">
        <p className="text-sm text-white/60 mb-3">Selecione o ângulo narrativo:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {skeleton.angle_variations?.map((angle, index) => (
            <button
              key={index}
              onClick={() => setSelectedAngle(angle.angle)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedAngle === angle.angle
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-gray-800 border-gray-700 text-white/70 hover:border-gray-600"
              }`}
            >
              <p className="font-medium text-sm">{angle.angle}</p>
              <p className="text-xs opacity-70">{angle.tone}</p>
            </button>
          ))}
        </div>

        <Button
          onClick={() => selectedAngle && onApprove(selectedAngle)}
          disabled={!selectedAngle || isLoading}
          className="w-full gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Aprovar e Gerar Roteiro Final
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
