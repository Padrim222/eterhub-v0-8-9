import { Key, Database, Zap, Instagram, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const integrations = [
  {
    name: "Apify",
    description: "Scraping de dados do Instagram",
    icon: Instagram,
    status: "configured",
    secret: "APIFY_API_KEY",
  },
  {
    name: "Lovable AI",
    description: "Geração de insights com IA",
    icon: Zap,
    status: "configured",
    secret: "LOVABLE_API_KEY",
  },
  {
    name: "Pipedrive",
    description: "Integração com CRM (via webhook)",
    icon: Link,
    status: "pending",
    secret: null,
  },
];

const secrets = [
  { name: "SUPABASE_URL", status: "configured" },
  { name: "SUPABASE_ANON_KEY", status: "configured" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", status: "configured" },
  { name: "SUPABASE_DB_URL", status: "configured" },
  { name: "APIFY_API_KEY", status: "configured" },
  { name: "LOVABLE_API_KEY", status: "configured" },
];

export function AdminSettingsTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5" />
            Integrações
          </CardTitle>
          <CardDescription>
            Status das integrações externas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <integration.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <Badge 
                variant={integration.status === "configured" ? "default" : "outline"}
                className={
                  integration.status === "configured" 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : "text-yellow-400 border-yellow-500/30"
                }
              >
                {integration.status === "configured" ? "Configurado" : "Pendente"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Key className="w-5 h-5" />
            Secrets Configurados
          </CardTitle>
          <CardDescription>
            Variáveis de ambiente e chaves de API (valores não são exibidos por segurança)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {secrets.map((secret) => (
              <div
                key={secret.name}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
              >
                <code className="text-sm text-foreground">{secret.name}</code>
                <Badge 
                  variant="outline"
                  className="bg-green-500/20 text-green-400 border-green-500/30"
                >
                  ✓
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Database className="w-5 h-5" />
            Informações do Banco de Dados
          </CardTitle>
          <CardDescription>
            Dados técnicos do Lovable Cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
            <span className="text-muted-foreground">Project ID</span>
            <code className="text-sm text-foreground">kzozelpatwzdrmtnsnte</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
            <span className="text-muted-foreground">Região</span>
            <span className="text-foreground">South America (São Paulo)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
            <span className="text-muted-foreground">Status</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Operacional
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
