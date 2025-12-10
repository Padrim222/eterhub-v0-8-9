import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface StyleCheckerDetail {
  score: number;
  justification: string;
}

interface StyleChecker {
  clarity: StyleCheckerDetail;
  hook_impact: StyleCheckerDetail;
  fluidity: StyleCheckerDetail;
  emotional_connection: StyleCheckerDetail;
  tone_adherence: StyleCheckerDetail;
  cta_strength: StyleCheckerDetail;
  average_score: number;
  status: string;
}

interface ContentData {
  theme_title: string;
  format: string;
  complete_text: string;
  full_script: {
    hook: { text: string; duration: string };
    interest: { text: string; duration: string };
    desire: { text: string; duration: string };
    action: { text: string; duration: string };
  };
  style_checker: StyleChecker;
  caption_suggestion?: string;
  hashtags?: string[];
}

interface ContentPreviewProps {
  content: ContentData;
}

export function ContentPreview({ content }: ContentPreviewProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content.complete_text);
    toast.success("Texto copiado!");
  };

  const handleDownload = () => {
    const blob = new Blob([content.complete_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roteiro-${content.theme_title?.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Arquivo baixado!");
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-card-dark border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{content.theme_title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{content.format}</Badge>
            {content.style_checker?.status === "Aprovado" ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Aprovado
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Requer Revisão
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Baixar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-700/50">
        {/* Script blocks */}
        <ScrollArea className="h-[400px]">
          <div className="p-6 space-y-4">
            {content.full_script && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500/20 text-red-400">GANCHO</Badge>
                    <span className="text-xs text-white/50">{content.full_script.hook?.duration}</span>
                  </div>
                  <p className="text-sm text-white/80">{content.full_script.hook?.text}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400">INTERESSE</Badge>
                    <span className="text-xs text-white/50">{content.full_script.interest?.duration}</span>
                  </div>
                  <p className="text-sm text-white/80">{content.full_script.interest?.text}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-400">DESEJO</Badge>
                    <span className="text-xs text-white/50">{content.full_script.desire?.duration}</span>
                  </div>
                  <p className="text-sm text-white/80">{content.full_script.desire?.text}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400">AÇÃO</Badge>
                    <span className="text-xs text-white/50">{content.full_script.action?.duration}</span>
                  </div>
                  <p className="text-sm text-white/80">{content.full_script.action?.text}</p>
                </div>
              </>
            )}

            {content.caption_suggestion && (
              <div className="pt-4 border-t border-gray-700/50">
                <p className="text-xs text-white/50 mb-2">Sugestão de Legenda:</p>
                <p className="text-sm text-white/80">{content.caption_suggestion}</p>
              </div>
            )}

            {content.hashtags && content.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.hashtags.map((tag, i) => (
                  <span key={i} className="text-xs text-primary">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Style Checker */}
        <div className="p-6">
          <h4 className="font-medium text-white mb-4">Style Checker</h4>
          <div className="space-y-3">
            {content.style_checker && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Clareza</span>
                  <span className={`font-medium ${scoreColor(content.style_checker.clarity?.score || 0)}`}>
                    {content.style_checker.clarity?.score}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Impacto do Gancho</span>
                  <span className={`font-medium ${scoreColor(content.style_checker.hook_impact?.score || 0)}`}>
                    {content.style_checker.hook_impact?.score}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Fluidez</span>
                  <span className={`font-medium ${scoreColor(content.style_checker.fluidity?.score || 0)}`}>
                    {content.style_checker.fluidity?.score}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Conexão Emocional</span>
                  <span className={`font-medium ${scoreColor(content.style_checker.emotional_connection?.score || 0)}`}>
                    {content.style_checker.emotional_connection?.score}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Aderência ao Tom</span>
                  <span className={`font-medium ${scoreColor(content.style_checker.tone_adherence?.score || 0)}`}>
                    {content.style_checker.tone_adherence?.score}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Força do CTA</span>
                  <span className={`font-medium ${scoreColor(content.style_checker.cta_strength?.score || 0)}`}>
                    {content.style_checker.cta_strength?.score}/10
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-700/50 flex items-center justify-between">
                  <span className="font-medium text-white">Média Final</span>
                  <span className={`text-xl font-bold ${scoreColor(content.style_checker.average_score || 0)}`}>
                    {content.style_checker.average_score?.toFixed(1)}/10
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
