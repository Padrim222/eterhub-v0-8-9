import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, ArrowRight } from "lucide-react";
import type { Theme } from "@/hooks/useEtherflow";

interface ThemesSelectorProps {
  themes: Theme[];
  onSelect: (index: number) => void;
  selectedIndex?: number | null;
  isLoading?: boolean;
}

export function ThemesSelector({ themes, onSelect, selectedIndex, isLoading }: ThemesSelectorProps) {
  if (themes.length === 0) {
    return (
      <Card className="bg-card-dark border-gray-700/50 p-8 text-center">
        <Lightbulb className="w-12 h-12 mx-auto text-white/30 mb-4" />
        <p className="text-white/50">Nenhum tema gerado ainda.</p>
        <p className="text-sm text-white/30 mt-2">Execute a análise para gerar temas.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card-dark border-gray-700/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          10 Temas Virais Sugeridos
        </h3>
        <p className="text-sm text-white/50 mt-1">Selecione um tema para desenvolver</p>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-4 space-y-3">
          {themes.map((theme, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              disabled={isLoading}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedIndex === index
                  ? "bg-primary/10 border-primary"
                  : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{theme.rank}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{theme.title}</p>
                  <p className="text-sm text-white/60 mt-1 line-clamp-2">{theme.justification}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {theme.suggested_format}
                    </Badge>
                    {selectedIndex === index && (
                      <Button size="sm" className="h-6 text-xs gap-1">
                        Selecionar
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
