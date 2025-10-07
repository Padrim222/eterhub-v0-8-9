import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { RevenueCard } from "@/components/dashboard/cards/RevenueCard";
import { ConversionCard } from "@/components/dashboard/cards/ConversionCard";
import { EngagementCard } from "@/components/dashboard/cards/EngagementCard";
import { LaunchCard } from "@/components/dashboard/cards/LaunchCard";
import { LiquidButton } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="pt-24 px-4 md:px-6 pb-12 max-w-[1600px] mx-auto">
        <DashboardTabs />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <RevenueCard />
          <ConversionCard />
          <EngagementCard />
          <LaunchCard />
        </div>

        {/* Demo Liquid Button */}
        <div className="flex gap-4 items-center justify-center mt-8">
          <LiquidButton size="lg">
            Ver Relatório Completo
          </LiquidButton>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
