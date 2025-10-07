import { ArrowUpRight } from "lucide-react";
import { MetricCard } from "../MetricCard";

export const ConversionCard = () => {
  return (
    <MetricCard title={<>Conversão<br/>& Funil</>}>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <div className="text-2xl md:text-3xl font-bold text-card-foreground">36</div>
          <div className="text-xs text-card-foreground/60 leading-tight">Campanhas<br/>ativas totais</div>
        </div>
        
        <div className="flex-1 flex items-center gap-2">
          <div className="relative h-32 w-24">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-xl"
              style={{ 
                height: '60%',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)'
              }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-2 py-1 rounded">
                +35%
              </div>
            </div>
          </div>
          
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <div className="text-xs text-foreground font-semibold text-center">~40%<br/>ROI</div>
          </div>
        </div>
      </div>
    </MetricCard>
  );
};
