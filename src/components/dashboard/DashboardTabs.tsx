import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = ["Todos", "Redes Sociais", "Finanças", "Conversão", "Webinarios"];
const filters = [
  { label: "Semanal", active: true },
  { label: "Última 1 hora", active: true },
];

interface DashboardTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardTabs = ({ activeTab = "Todos", onTabChange }: DashboardTabsProps) => {
  return (
    <div className="mb-10">
      <h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 tracking-tight">Dashboard</h1>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Tabs - Scrollable on mobile */}
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              className={`pb-3 whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-primary font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex items-center gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.label}
              variant="secondary"
              size="sm"
              className="rounded-full border-border/40 font-medium"
            >
              {filter.label} <X className="w-4 h-4 ml-2" />
            </Button>
          ))}
          <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
