import { cn } from "@/lib/utils";
import { Bot, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentMessage } from "@/hooks/useEtherflow";

interface ChatMessageProps {
  message: AgentMessage;
  onSelectTheme?: (index: number) => void;
  onValidateNarrative?: (angle?: string) => void;
  themes?: Array<{ rank: number; title: string; justification: string; suggested_format: string }>;
}

export function ChatMessage({ message, onSelectTheme, onValidateNarrative, themes }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  // Check if this is a themes message
  const isThemesMessage = message.stage === "ideation" && Array.isArray(message.data) && message.data.length > 0;
  
  // Check if this is a narrative message with angles
  const isNarrativeMessage = message.stage === "narrative" && message.data && typeof message.data === "object";
  const narrativeData = isNarrativeMessage ? message.data as { angle_variations?: Array<{ angle: string; tone: string }> } : null;

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser && "bg-blue-500/20 text-blue-400",
          !isUser && !isSystem && "bg-primary/20 text-primary",
          isSystem && "bg-yellow-500/20 text-yellow-400"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isSystem ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser && "bg-blue-500/20 text-white",
          !isUser && !isSystem && "bg-gray-800 text-white",
          isSystem && "bg-yellow-500/10 text-yellow-200 border border-yellow-500/20"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Themes selector */}
        {isThemesMessage && themes && themes.length > 0 && (
          <div className="mt-4 space-y-2">
            {themes.map((theme, index) => (
              <button
                key={index}
                onClick={() => onSelectTheme?.(index)}
                className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600/50 hover:border-primary/50"
              >
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">{theme.rank}.</span>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{theme.title}</p>
                    <p className="text-xs text-white/60 mt-1">{theme.justification}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                      {theme.suggested_format}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Narrative angle selector */}
        {isNarrativeMessage && narrativeData?.angle_variations && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-white/60 mb-2">Selecione o ângulo narrativo:</p>
            <div className="flex flex-wrap gap-2">
              {narrativeData.angle_variations.map((angle, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onValidateNarrative?.(angle.angle)}
                  className="text-xs"
                >
                  {angle.angle}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-white/40 mt-2 block">
          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
