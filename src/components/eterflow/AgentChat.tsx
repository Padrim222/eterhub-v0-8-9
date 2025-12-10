import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { AgentMessage, ProductionStage } from "@/hooks/useEterflow";
import { Bot } from "lucide-react";

interface AgentChatProps {
  messages: AgentMessage[];
  isLoading: boolean;
  currentStage: ProductionStage;
  onSendMessage?: (message: string) => void;
  onSelectTheme?: (index: number) => void;
  onValidateNarrative?: (angle?: string) => void;
  themes?: Array<{ rank: number; title: string; justification: string; suggested_format: string }>;
  narrativeData?: unknown;
}

const stageNames: Record<ProductionStage, string> = {
  analysis: "Análise de Métricas",
  ideation: "Ideação de Temas",
  research: "Pesquisa Profunda",
  narrative: "Arquitetura Narrativa",
  writing: "Escrita Final",
  completed: "Produção Completa",
};

export function AgentChat({
  messages,
  isLoading,
  currentStage,
  onSendMessage,
  onSelectTheme,
  onValidateNarrative,
  themes,
  narrativeData,
}: AgentChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-card-dark border border-gray-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700/50">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Agente de {stageNames[currentStage]}</h3>
          <p className="text-xs text-white/50">Eterflow Production Line</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-white/50">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Olá! Sou seu assistente de produção de conteúdo.</p>
              <p className="text-sm mt-2">Clique em "Iniciar Produção" para começar.</p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSelectTheme={onSelectTheme}
              onValidateNarrative={onValidateNarrative}
              themes={themes}
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-white/50">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm">Processando...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
