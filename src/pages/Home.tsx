import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  Workflow, 
  UsersRound, 
  FileText,
  ArrowRight
} from "lucide-react";

const quickLinks = [
  {
    title: "IMOV",
    description: "Métricas e índice de movimento do seu perfil",
    icon: BarChart3,
    path: "/imov",
    color: "from-primary/20 to-primary/5"
  },
  {
    title: "Central do Cliente",
    description: "Gestão de projetos, entregas e consultoria",
    icon: Users,
    path: "/central-cliente",
    color: "from-blue-500/20 to-blue-500/5"
  },
  {
    title: "Educação",
    description: "Conteúdos e materiais educativos",
    icon: GraduationCap,
    path: "/educacao",
    color: "from-purple-500/20 to-purple-500/5"
  },
  {
    title: "Eterflow",
    description: "Fluxos de trabalho e automações",
    icon: Workflow,
    path: "/etherflow",
    color: "from-orange-500/20 to-orange-500/5"
  },
  {
    title: "Tribes",
    description: "Comunidades e networking",
    icon: UsersRound,
    path: "/tribes",
    color: "from-pink-500/20 to-pink-500/5"
  },
  {
    title: "Conteúdo",
    description: "Análise de posts e performance",
    icon: FileText,
    path: "/conteudo",
    color: "from-teal-500/20 to-teal-500/5"
  }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <PageLayout showTitle={false}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Bem-vindo ao <span className="text-primary">ETER</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha uma área para começar
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.path}
                className={`bg-gradient-to-br ${link.color} border-border/50 p-6 cursor-pointer hover:border-primary/50 transition-all duration-300 group`}
                onClick={() => navigate(link.path)}
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-background/50">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="text-xl font-semibold text-foreground">{link.title}</h3>
                  <p className="text-muted-foreground text-sm">{link.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Comece pelo seu IMOV
              </h2>
              <p className="text-muted-foreground mt-1">
                Veja suas métricas de performance e acompanhe seu crescimento
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate('/imov')}
              className="gap-2"
            >
              Acessar IMOV
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Home;
