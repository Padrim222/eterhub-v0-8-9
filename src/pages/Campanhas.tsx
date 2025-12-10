import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Filter, TrendingUp, Loader2 } from "lucide-react";
import { useCampaignsData, PeriodFilter } from "@/hooks/useCampaignsData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CAMPAIGN_COLORS = ["#ef4444", "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

const Campanhas = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const { campaigns, averageLine, isLoading, addCampaign } = useCampaignsData(periodFilter);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignColor, setCampaignColor] = useState(CAMPAIGN_COLORS[0]);

  const toggleCampaign = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  const handleAddCampaign = async () => {
    if (!campaignName.trim()) {
      toast.error("Nome da campanha é obrigatório");
      return;
    }
    
    try {
      setIsAdding(true);
      await addCampaign(campaignName, campaignColor);
      toast.success("Campanha criada com sucesso!");
      setIsDialogOpen(false);
      setCampaignName("");
      setCampaignColor(CAMPAIGN_COLORS[Math.floor(Math.random() * CAMPAIGN_COLORS.length)]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar campanha");
    } finally {
      setIsAdding(false);
    }
  };

  // Merge all data points for the chart
  const mergedData = () => {
    const dateMap = new Map<string, any>();

    // Add campaign data
    campaigns.forEach(campaign => {
      if (selectedCampaigns.size === 0 || selectedCampaigns.has(campaign.id)) {
        campaign.data.forEach(point => {
          if (!dateMap.has(point.date)) {
            dateMap.set(point.date, { date: point.date });
          }
          dateMap.get(point.date)![campaign.id] = point.leads;
        });
      }
    });

    // Add average line
    averageLine.forEach(point => {
      if (!dateMap.has(point.date)) {
        dateMap.set(point.date, { date: point.date });
      }
      dateMap.get(point.date)!['average'] = point.average;
    });

    return Array.from(dateMap.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  };

  const activeCampaigns = selectedCampaigns.size === 0 
    ? campaigns 
    : campaigns.filter(c => selectedCampaigns.has(c.id));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 bg-gray-800" />
        <Skeleton className="h-[500px] bg-gray-800" />
      </div>
    );
  }

  // Empty state when no campaigns exist
  if (campaigns.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Campanhas</h1>
          </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Nova Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white">Nome da Campanha</Label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Ex: Black Friday 2025"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Cor</Label>
                <div className="flex gap-2">
                  {CAMPAIGN_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCampaignColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${campaignColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCampaign} className="w-full" disabled={isAdding}>
                {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Campanha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>

        {/* Empty State Card */}
        <Card className="bg-gray-900 border-gray-800 rounded-3xl p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white">Nenhuma campanha encontrada</h3>
            <p className="text-white/60 max-w-md">
              Crie sua primeira campanha para começar a acompanhar o desempenho de leads e conversões.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Nova Campanha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-white">Nome da Campanha</Label>
                    <Input
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Ex: Black Friday 2025"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Cor</Label>
                    <div className="flex gap-2">
                      {CAMPAIGN_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCampaignColor(color)}
                          className={`w-8 h-8 rounded-full transition-transform ${campaignColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddCampaign} className="w-full" disabled={isAdding}>
                    {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Criar Campanha
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Campanhas</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Nova Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white">Nome da Campanha</Label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Ex: Black Friday 2025"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Cor</Label>
                <div className="flex gap-2">
                  {CAMPAIGN_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCampaignColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${campaignColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCampaign} className="w-full" disabled={isAdding}>
                {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Campanha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Tabs and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {campaigns.map(campaign => (
            <Button
              key={campaign.id}
              variant={selectedCampaigns.has(campaign.id) || selectedCampaigns.size === 0 ? "default" : "outline"}
              className="rounded-lg"
              style={{
                backgroundColor: (selectedCampaigns.has(campaign.id) || selectedCampaigns.size === 0) 
                  ? campaign.color 
                  : 'transparent',
                borderColor: campaign.color,
                color: (selectedCampaigns.has(campaign.id) || selectedCampaigns.size === 0) 
                  ? '#fff' 
                  : campaign.color
              }}
              onClick={() => toggleCampaign(campaign.id)}
            >
              {campaign.name}
            </Button>
          ))}
          <Button variant="outline" className="rounded-lg">
            <Filter className="h-4 w-4 mr-2" />
            Filtro
          </Button>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
          <Button
            variant={periodFilter === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriodFilter("week")}
            className="rounded-md"
          >
            Semana
          </Button>
          <Button
            variant={periodFilter === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriodFilter("month")}
            className="rounded-md"
          >
            Mês
          </Button>
          <Button
            variant={periodFilter === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriodFilter("year")}
            className="rounded-md"
          >
            Ano
          </Button>
        </div>
      </div>

      {/* Chart Card */}
      <Card className="bg-black border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Leads por Período</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/80">
              {periodFilter === "week" && "Última Semana"}
              {periodFilter === "month" && "Último Mês"}
              {periodFilter === "year" && "Último Ano"}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mergedData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#000', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            {/* Campaign Lines */}
            {activeCampaigns.map(campaign => (
              <Line
                key={campaign.id}
                type="monotone"
                dataKey={campaign.id}
                name={campaign.name}
                stroke={campaign.color}
                strokeWidth={2}
                dot={{ fill: campaign.color, r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
            
            {/* Average Line - thicker and more opaque */}
            <Line
              type="monotone"
              dataKey="average"
              name="Média"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth={3}
              dot={{ fill: "rgba(255,255,255,0.8)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
          {activeCampaigns.map(campaign => {
            const totalLeads = campaign.data.reduce((sum, point) => sum + point.leads, 0);
            return (
              <div key={campaign.id} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: campaign.color }}
                />
                <div>
                  <div className="text-sm text-white/70">{campaign.name}</div>
                  <div className="text-xl font-bold text-white">{totalLeads} leads</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Campanhas;
