import { Bell, ArrowUpRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: ReactNode;
  children: ReactNode;
  variant?: "light" | "dark";
  className?: string;
}

export const MetricCard = ({ 
  title, 
  children, 
  variant = "light",
  className = ""
}: MetricCardProps) => {
  const isDark = variant === "dark";
  
  return (
    <Card className={`
      backdrop-blur-md p-4 md:p-6 rounded-[20px] 
      hover:scale-[1.01] transition-all duration-300 
      shadow-sm
      ${isDark 
        ? "bg-card-dark/80 border-border/20 hover:bg-card-dark/90" 
        : "bg-card/80 border-border/50 hover:bg-card/90"
      }
      ${className}
    `}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-sm md:text-base font-semibold leading-tight ${
          isDark ? "text-card-dark-foreground" : "text-card-foreground"
        }`}>
          {title}
        </h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${isDark ? "hover:bg-white/5" : "hover:bg-card-foreground/5"}`}
          >
            <Bell className={`w-4 h-4 ${isDark ? "text-white/60" : "text-card-foreground/60"}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${isDark ? "hover:bg-white/5" : "hover:bg-card-foreground/5"}`}
          >
            <ArrowUpRight className={`w-4 h-4 ${isDark ? "text-white/60" : "text-card-foreground/60"}`} />
          </Button>
        </div>
      </div>
      
      {children}
    </Card>
  );
};
