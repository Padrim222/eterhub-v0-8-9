import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Target, TrendingUp, Percent } from "lucide-react";

interface LeadsMetricsProps {
  metrics: {
    totalLeads: number;
    totalQualified: number;
    qualificationRate: number;
  };
  isLoading: boolean;
}

export const LeadsMetrics = ({ metrics, isLoading }: LeadsMetricsProps) => {
  const cards = [
    {
      title: "Números Gerais",
      value: metrics.totalLeads,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total de Leads",
      value: metrics.totalLeads,
      icon: Target,
      color: "text-green-500",
    },
    {
      title: "Total Qualificados",
      value: metrics.totalQualified,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Taxa de qualificação",
      value: `${metrics.qualificationRate.toFixed(1)}%`,
      icon: Percent,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${card.color}`} />
                    <p className="text-sm text-muted-foreground">
                      {card.title}
                    </p>
                  </div>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};