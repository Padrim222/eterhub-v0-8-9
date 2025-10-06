import { useState } from "react";
import { Bell, ArrowUpRight, Search, Menu, ChevronDown, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import leaderImage from "@/assets/leader-image.jpg";

const Dashboard = () => {
  const [expandedInfo, setExpandedInfo] = useState(false);

  // Chart data
  const imoviData = [
    { month: "Mai", value: 10, label: "Início" },
    { month: "Jun", value: 20 },
    { month: "Jul", value: 31 },
    { month: "Ago", value: 64, highlighted: true },
    { month: "Set", value: 0 },
    { month: "Out", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dez", value: 0 },
  ];

  const launchData = [
    { month: "Julho", leads: 200 },
    { month: "Agosto", leads: 350 },
    { month: "Setembro", leads: 640, highlighted: true },
    { month: "Outubro", leads: 400 },
    { month: "Novembro", leads: 300 },
  ];

  const engagementData = [
    { name: "Instagram", value: 70, color: "#38EE38" },
    { name: "Youtube", value: 30, color: "#6B7280" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center border border-foreground">
              <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
                <div className="bg-background rounded-sm"></div>
                <div className="bg-background rounded-sm"></div>
                <div className="bg-background rounded-sm"></div>
                <div className="bg-background rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-bold tracking-wide">ETER</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full border-border/40 hover:bg-muted/30">
              Overview
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
              Insights IA
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
              Educação
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
              Suporte
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
              Nuvem
            </Button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="border-2 border-border/40">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-12 max-w-[1600px] mx-auto">
        {/* Dashboard Title Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-8 tracking-tight">Dashboard</h1>
          
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex items-center gap-8">
              <button className="pb-3 border-b-2 border-primary font-semibold text-foreground">
                Todos
              </button>
              <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
                Redes Sociais
              </button>
              <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
                Finanças
              </button>
              <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
                Conversão
              </button>
              <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
                Webinarios
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="rounded-full border-border/40 font-medium">
                Semanal <X className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="secondary" size="sm" className="rounded-full border-border/40 font-medium">
                Última 1 hora <X className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Receita Total Card */}
          <Card className="bg-card p-6 rounded-[20px] hover:scale-[1.01] transition-all duration-300 border-border/50 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-semibold text-card-foreground">Receita Total</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-card-foreground/5">
                  <Bell className="w-4 h-4 text-card-foreground/60" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-card-foreground/5">
                  <ArrowUpRight className="w-4 h-4 text-card-foreground/60" />
                </Button>
              </div>
            </div>
            
            <div className="mb-3">
              <span className="text-sm text-muted-foreground">R$ </span>
              <span className="text-5xl font-bold text-foreground tracking-tight">320.0K</span>
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
          </Card>

          {/* Conversão & Funil Card */}
          <Card className="bg-card p-6 rounded-[20px] hover:scale-[1.01] transition-all duration-300 border-border/50 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-semibold text-card-foreground leading-tight">Conversão<br/>& Funil</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-card-foreground/5">
                  <Bell className="w-4 h-4 text-card-foreground/60" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-card-foreground/5">
                  <ArrowUpRight className="w-4 h-4 text-card-foreground/60" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div>
                <div className="text-3xl font-bold text-card-foreground">36</div>
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
          </Card>

          {/* Engajamento das Redes Card */}
          <Card className="bg-card-dark p-6 rounded-[20px] hover:scale-[1.01] transition-all duration-300 border-border/20 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-semibold text-card-dark-foreground leading-tight">Engajamento<br/>das Redes</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5">
                  <Bell className="w-4 h-4 text-white/60" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5">
                  <ArrowUpRight className="w-4 h-4 text-white/60" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={0}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <span className="text-sm text-card-dark-foreground font-medium">Instagram: 70</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                <span className="text-sm text-card-dark-foreground font-medium">Youtube: 30</span>
              </div>
            </div>
          </Card>

          {/* Lançamentos Card */}
          <Card className="bg-card-dark p-6 rounded-[20px] hover:scale-[1.01] transition-all duration-300 border-border/20 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-semibold text-card-dark-foreground">Lançamentos</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5">
                  <Bell className="w-4 h-4 text-white/60" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5">
                  <ArrowUpRight className="w-4 h-4 text-white/60" />
                </Button>
              </div>
            </div>
            
            <div className="mb-2">
              <span className="text-3xl font-bold text-primary">640 </span>
              <span className="text-xs text-muted-foreground">Leads</span>
            </div>
            
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={launchData}>
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#38EE38" 
                  strokeWidth={2}
                  dot={{ fill: '#38EE38', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              {launchData.map((item, idx) => (
                <span key={idx} className={item.highlighted ? "text-primary font-bold bg-primary/10 border border-primary rounded px-2 py-0.5" : ""}>
                  {item.month}
                </span>
              ))}
            </div>
            
            <button 
              onClick={() => setExpandedInfo(!expandedInfo)}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
            >
              Mais Informações
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedInfo ? 'rotate-180' : ''}`} />
            </button>
          </Card>
        </div>

        {/* IMOVI Card - Large */}
        <div className="mb-6">
          <Card className="bg-card p-8 rounded-[20px] hover:scale-[1.005] transition-all duration-300 border-border/50 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-1">IMOVI</h2>
                <p className="text-sm text-card-foreground/60 font-medium">Índice de Movimento e Influência</p>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="hover:bg-card-foreground/5">
                  <Menu className="w-5 h-5 text-card-foreground/60" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-card-foreground/5">
                  <ArrowUpRight className="w-5 h-5 text-card-foreground/60" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-card-foreground/5">
                  <Bell className="w-5 h-5 text-card-foreground/60" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={imoviData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                      {imoviData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.highlighted ? "#38EE38" : entry.value > 0 ? "#d0d0d0" : "#f0f0f0"}
                          style={{
                            backgroundImage: entry.value > 0 ? 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px)' : 'none'
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex flex-col justify-center items-center bg-background rounded-2xl p-6 border border-border/30">
                <div className="text-xs text-muted-foreground mb-2 font-medium tracking-wide">ÍNDICE IMOVI</div>
                <div className="text-7xl font-bold text-card-foreground mb-6">64</div>
                
                <div className="space-y-2 w-full">
                  <div className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-2 rounded-full flex items-center justify-between">
                    <span>55% Growth</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="bg-primary/80 text-primary-foreground text-sm font-semibold px-3 py-2 rounded-full flex items-center justify-between">
                    <span>35% Leads</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="bg-primary/60 text-primary-foreground text-sm font-semibold px-3 py-2 rounded-full flex items-center justify-between">
                    <span>40% Engage</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Insights IA Card */}
          <Card className="lg:col-span-3 bg-card-dark p-8 rounded-[20px] border-border/20 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-card-dark-foreground mb-1">Insights IA</h2>
                <p className="text-sm text-muted-foreground font-medium">Impulsione seu Movimento com nossa IA</p>
              </div>
              
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Lista Completa <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground w-12"></th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Anexo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Parceiro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/5 transition-colors">
                    <td className="py-4 px-4">
                      <Checkbox checked />
                    </td>
                    <td className="py-4 px-4 text-card-dark-foreground">Melhore seu ROI com...</td>
                    <td className="py-4 px-4 text-muted-foreground">06,Setembro, 2025</td>
                    <td className="py-4 px-4">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Alta
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        📄
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="py-4 px-4">
                      <Checkbox />
                    </td>
                    <td className="py-4 px-4 text-card-dark-foreground">Eleve seu IMOVI através...</td>
                    <td className="py-4 px-4 text-muted-foreground">09,Setembro, 2025</td>
                    <td className="py-4 px-4">
                      <span className="bg-yellow-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
                        Média
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        📄
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Líder Sobre Card */}
          <Card className="bg-card-dark rounded-[20px] overflow-hidden hover:scale-[1.02] transition-transform">
            <div className="p-6">
              <h3 className="text-xl font-bold text-card-dark-foreground mb-1">Líder</h3>
              <p className="text-sm text-card-dark-foreground">Sobre</p>
            </div>
            <div className="relative aspect-[3/4]">
              <img 
                src={leaderImage} 
                alt="Leader presentation" 
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
