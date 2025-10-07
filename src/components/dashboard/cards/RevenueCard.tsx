import { MetricCard } from "../MetricCard";

export const RevenueCard = () => {
  return (
    <MetricCard title="Receita Total">
      <div className="mb-3">
        <span className="text-sm text-muted-foreground">R$ </span>
        <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">320.0K</span>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-card-foreground/50 font-medium">Meta: 500k</span>
      </div>
      
      <div className="relative h-6 bg-card-foreground/10 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          style={{
            width: '64%',
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 16px)'
          }}
        />
      </div>
    </MetricCard>
  );
};
