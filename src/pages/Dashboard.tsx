import { useState, useEffect } from "react";
import { Bell, ArrowUpRight, Search, Menu, ChevronDown, Instagram, Sparkles, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import leaderImage from "@/assets/leader-davi.png";
import eterLogo from "@/assets/eter-logo.png";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { FunnelVisualization } from "@/components/dashboard/FunnelVisualization";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { calculateImovi, getImoviColor } from "@/utils/imoviCalculations";

const Dashboard = () => {
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication and load user profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      // Load user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        return;
      }

      setUserProfile(profile);

      // Show onboarding if no Instagram username
      if (!profile?.instagram_username) {
        setShowOnboarding(true);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Sample data - será substituído por dados reais do Supabase
  const imoviData = [
    { month: "Mai", value: 0 },
    { month: "Jun", value: 2.1, label: "Início" },
    { month: "Jul", value: 3.2 },
    { month: "Ago", value: 6.4, highlighted: true },
    { month: "Set", value: 0 },
    { month: "Out", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dez", value: 0 },
  ];

  const movqlData = [
    { month: "Julho", leads: 200 },
    { month: "Agosto", leads: 350 },
    { month: "Setembro", leads: 640, highlighted: true },
    { month: "Outubro", leads: 0 },
    { month: "Novembro", leads: 0 },
  ];

  // Cálculo do IMOVI atual
  const currentImovi = calculateImovi({
    views: 5000,
    retention: 65,
    interactions: 450,
    movql: 35
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <img src={eterLogo} alt="ETER" className="h-10 w-auto" />
            <AppNavigation />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sair
            </Button>
            <Avatar className="border-2 border-border/40">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{userProfile?.nome?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-12 max-w-[1600px] mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-8 tracking-tight">Dashboard</h1>
          
          <div className="flex items-center justify-between">
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
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid Layout - Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Conversão & Funil Card */}
          <Card className="backdrop-blur-md bg-card/90 p-6 rounded-3xl border-2 border-border/40 shadow-lg">
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
            
            <FunnelVisualization 
              attention={0}
              retention={0}
              engagement={0}
              conversion={0}
              movqlScore={0}
            />
            
            {!userProfile?.instagram_username && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-xs text-center">
                ⚠️ Configure seu @ do Instagram para ver métricas
              </div>
            )}
          </Card>

          {/* Instagram Engagement */}
          <Card className="backdrop-blur-md bg-card-dark/90 p-6 rounded-3xl border-2 border-border/20 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-card-dark-foreground">Instagram</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5">
                  <ArrowUpRight className="w-4 h-4 text-white/60" />
                </Button>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-sm text-muted-foreground mb-1">
                {userProfile?.instagram_username ? `@${userProfile.instagram_username}` : 'Não configurado'}
              </div>
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">Posts analisados</div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Engajamento:</span>
                <span className="text-card-dark-foreground font-semibold">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alcance:</span>
                <span className="text-card-dark-foreground font-semibold">—</span>
              </div>
            </div>
          </Card>

          {/* MOVQL Card */}
          <Card className="backdrop-blur-md bg-card-dark/90 p-6 rounded-3xl border-2 border-border/20 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-semibold text-card-dark-foreground">MOVQL</h3>
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
              <span className="text-4xl font-bold text-primary">640 </span>
              <span className="text-xs text-muted-foreground">Leads</span>
            </div>
            
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={movqlData}>
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              {movqlData.map((item, idx) => (
                <span key={idx} className={item.highlighted ? "text-primary font-bold" : ""}>
                  {item.month.substring(0, 3)}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* IMOVI Card - Large */}
        <div className="mb-6">
          <Card className="backdrop-blur-md bg-card/90 p-8 rounded-3xl border-2 border-border/40 shadow-lg">
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
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={imoviData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card-dark))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                      {imoviData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.highlighted 
                            ? getImoviColor(entry.value) 
                            : entry.value > 0 ? 'hsl(var(--muted))' : 'hsl(var(--card))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex flex-col justify-center items-center bg-card-dark rounded-3xl p-6 border-2 border-border/30">
                <div className="text-xs text-muted-foreground mb-2 font-medium tracking-wide">ÍNDICE IMOVI</div>
                <div 
                  className="text-7xl font-bold mb-2"
                  style={{ color: currentImovi.color }}
                >
                  {currentImovi.score.toFixed(1)}
                </div>
                <div 
                  className="text-sm font-bold mb-6 px-4 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${currentImovi.color}20`,
                    color: currentImovi.color
                  }}
                >
                  {currentImovi.level}
                </div>
                
                <div className="space-y-2 w-full">
                  <div className="text-xs text-muted-foreground mb-3 text-center">
                    Escala: 0-3 RUIM | 3-5 OK | 5-8 BOM | 8-10 MUITO BOM
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Insights IA Card */}
          <Card className="lg:col-span-3 backdrop-blur-md bg-card-dark/90 p-8 rounded-3xl border-2 border-border/20 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-card-dark-foreground mb-1">Insights IA</h2>
                <p className="text-sm text-muted-foreground font-medium">Impulsione seu Movimento com nossa IA</p>
              </div>
              
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Insights
              </Button>
            </div>
            
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum insight gerado ainda. Clique em "Gerar Insights" para obter recomendações personalizadas.
              </p>
            </div>
          </Card>

          {/* Líder Card */}
          <Card className="backdrop-blur-md bg-card-dark/90 rounded-3xl overflow-hidden border-2 border-border/20 shadow-lg hover:scale-[1.02] transition-transform">
            <div className="p-6">
              <h3 className="text-xl font-bold text-card-dark-foreground mb-1">Líder</h3>
              <p className="text-sm text-card-dark-foreground mb-4">Davi Ribas</p>
              
              <Button variant="outline" size="sm" className="w-full border-border/40">
                <Upload className="w-4 h-4 mr-2" />
                Alterar Foto
              </Button>
            </div>
            <div className="relative aspect-[3/4]">
              <img 
                src={leaderImage} 
                alt="Líder do Movimento" 
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
