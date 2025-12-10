import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { AgentMessage, ProductionStage } from "@/hooks/useEterflow";
import { Bot, RefreshCw, AlertCircle } from "lucide-react";

interface AgentChatProps {
  messages: AgentMessage[];
  isLoading: boolean;
  currentStage: ProductionStage;
  onSendMessage?: (message: string) => void;
  onSelectTheme?: (index: number) => void;
  onValidateNarrative?: (angle?: string) => void;
  onRetry?: () => void;
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

const stageDescriptions: Record<ProductionStage, string> = {
  analysis: "Analisando padrões de sucesso dos seus posts",
  ideation: "Gerando temas virais baseados nos dados",
  research: "Pesquisando dados em tempo real na internet",
  narrative: "Construindo estrutura AIDA do roteiro",
  writing: "Escrevendo texto final com Style Checker",
  completed: "Conteúdo pronto para publicação",
};

export function AgentChat({
  messages,
  isLoading,
  currentStage,
  onSendMessage,
  onSelectTheme,
  onValidateNarrative,
  onRetry,
  themes,
}: AgentChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if there's an error state
  const hasError = messages.some(m => m.content.includes("❌") || m.content.includes("Erro"));
  const lastMessage = messages[messages.length - 1];
  const isErrorState = lastMessage?.content.includes("❌") && !isLoading;

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">{stageNames[currentStage]}</h3>
            <p className="text-xs text-white/50 hidden sm:block">{stageDescriptions[currentStage]}</p>
          </div>
        </div>
        
        {/* Retry button in header when error */}
        {isErrorState && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-white/50">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Olá! Sou seu assistente de produção de conteúdo.</p>
              <p className="text-xs sm:text-sm mt-2">Clique em "Iniciar Produção" para começar.</p>
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
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-white/70">Processando...</span>
            </div>
          )}

          {/* Error state with retry */}
          {isErrorState && onRetry && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-300">Ocorreu um erro na execução.</p>
                <p className="text-xs text-red-400/70 mt-1">Clique no botão abaixo para tentar novamente.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}