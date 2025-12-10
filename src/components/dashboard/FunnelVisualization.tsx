import { ArrowDown } from "lucide-react";

interface FunnelProps {
  attention?: number;
  retention?: number;
  engagement?: number;
  conversion?: number;
  movqlScore?: number;
}

export const FunnelVisualization = ({ 
  attention = 0,
  retention = 0, 
  engagement = 0,
  conversion = 0,
  movqlScore = 0 
}: FunnelProps) => {
  return (
    <div className="relative flex flex-col items-center gap-3 py-6">
      {/* Atenção */}
      <div className="relative w-full max-w-xs">
        <div className="bg-card-dark rounded-2xl p-4 border border-border/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-1">Atenção</div>
            <div className="text-2xl font-bold text-card-dark-foreground">
              {attention > 0 ? `${attention}%` : '—'}
            </div>
          </div>
        </div>
        <ArrowDown className="w-5 h-5 text-muted-foreground mx-auto mt-2" />
      </div>

      {/* Retenção */}
      <div className="relative w-[90%] max-w-xs">
        <div className="bg-card-dark rounded-2xl p-4 border border-border/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-1">Retenção</div>
            <div className="text-2xl font-bold text-card-dark-foreground">
              {retention > 0 ? `${retention}%` : '—'}
            </div>
          </div>
        </div>
        <ArrowDown className="w-5 h-5 text-muted-foreground mx-auto mt-2" />
      </div>

      {/* Engajamento */}
      <div className="relative w-[80%] max-w-xs">
        <div className="bg-card-dark rounded-2xl p-4 border border-border/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-1">Engajamento</div>
            <div className="text-2xl font-bold text-card-dark-foreground">
              {engagement > 0 ? `${engagement}%` : '—'}
            </div>
          </div>
        </div>
        <ArrowDown className="w-5 h-5 text-muted-foreground mx-auto mt-2" />
      </div>

      {/* Conversão */}
      <div className="relative w-[70%] max-w-xs">
        <div className="bg-card-dark rounded-2xl p-4 border border-border/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-1">Conversão</div>
            <div className="text-2xl font-bold text-card-dark-foreground">
              {conversion > 0 ? `${conversion}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* MOVQL Circle - Centro */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-28 h-28 rounded-full bg-primary border-4 border-background flex items-center justify-center shadow-lg">
          <div className="text-center">
            <div className="text-xs font-bold text-primary-foreground mb-1">MOVQL</div>
            <div className="text-3xl font-bold text-primary-foreground">
              {movqlScore > 0 ? movqlScore : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
